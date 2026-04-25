"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleDevLogin = exports.googleLogin = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const google_auth_library_1 = require("google-auth-library");
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const GoogleLoginSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
const login = async (req, res) => {
    try {
        const parsed = LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid login payload' });
        }
        const recruiterEmail = process.env.RECRUITER_EMAIL || 'recruiter@talentiq.ai';
        const recruiterPasswordHash = process.env.RECRUITER_PASSWORD_HASH || '';
        const recruiterPasswordPlain = process.env.RECRUITER_PASSWORD || '';
        if (parsed.data.email !== recruiterEmail) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (recruiterPasswordHash) {
            const ok = await bcryptjs_1.default.compare(parsed.data.password, recruiterPasswordHash);
            if (!ok)
                return res.status(401).json({ error: 'Invalid credentials' });
        }
        else {
            if (!recruiterPasswordPlain || parsed.data.password !== recruiterPasswordPlain) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        const token = jsonwebtoken_1.default.sign({ sub: 'recruiter-1', email: recruiterEmail, role: 'recruiter' }, getJwtSecret(), { expiresIn: '12h' });
        return res.json({
            token,
            user: { id: 'recruiter-1', email: recruiterEmail, role: 'recruiter' },
        });
    }
    catch (e) {
        console.error('Auth login error:', e);
        return res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const googleLogin = async (req, res) => {
    try {
        const { token, tokenType } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            return res.status(500).json({ error: 'Google Client ID not configured' });
        }
        let email;
        let name;
        let picture;
        if (tokenType === 'access_token') {
            // Handle access_token from useGoogleLogin (implicit flow)
            // Fetch user info from Google's userinfo endpoint
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!userInfoRes.ok) {
                return res.status(401).json({ error: 'Invalid Google access token' });
            }
            const userInfo = await userInfoRes.json();
            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
        }
        else {
            // Handle id_token from GoogleLogin component
            const client = new google_auth_library_1.OAuth2Client(clientId);
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: clientId,
                });
                const payload = ticket.getPayload();
                if (!payload) {
                    return res.status(401).json({ error: 'Invalid token payload' });
                }
                email = payload.email;
                name = payload.name;
                picture = payload.picture;
            }
            catch (error) {
                console.error('ID token verification error:', error);
                return res.status(401).json({ error: 'Invalid Google token' });
            }
        }
        if (!email) {
            return res.status(401).json({ error: 'Could not retrieve email from Google' });
        }
        // Generate JWT token for the app
        const appToken = jsonwebtoken_1.default.sign({ sub: `google-${email}`, email, name, picture, role: 'recruiter' }, getJwtSecret(), { expiresIn: '12h' });
        return res.json({
            token: appToken,
            user: { id: `google-${email}`, email, name, picture, role: 'recruiter' },
        });
    }
    catch (e) {
        console.error('Google login error:', e);
        return res.status(500).json({ error: 'Google login failed' });
    }
};
exports.googleLogin = googleLogin;
// Development-only: mock Google login without real OAuth credentials
const googleDevLogin = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Dev login is not available in production' });
        }
        const mockEmail = 'recruiter@talentiq.ai';
        const mockName = 'TalentIQ Recruiter';
        const appToken = jsonwebtoken_1.default.sign({ sub: `google-dev-${mockEmail}`, email: mockEmail, name: mockName, role: 'recruiter' }, getJwtSecret(), { expiresIn: '12h' });
        console.log('🔧 Dev Google login used for:', mockEmail);
        return res.json({
            token: appToken,
            user: { id: `google-dev-${mockEmail}`, email: mockEmail, name: mockName, role: 'recruiter' },
        });
    }
    catch (e) {
        console.error('Dev Google login error:', e);
        return res.status(500).json({ error: 'Dev Google login failed' });
    }
};
exports.googleDevLogin = googleDevLogin;
