"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = void 0;
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
        const parsed = GoogleLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            return res.status(500).json({ error: 'Google Client ID not configured' });
        }
        const client = new google_auth_library_1.OAuth2Client(clientId);
        try {
            const ticket = await client.verifyIdToken({
                idToken: parsed.data.token,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(401).json({ error: 'Invalid token payload' });
            }
            const { email, name, picture } = payload;
            // Generate JWT token for the app
            const appToken = jsonwebtoken_1.default.sign({ sub: `google-${email}`, email, name, picture, role: 'recruiter' }, getJwtSecret(), { expiresIn: '12h' });
            return res.json({
                token: appToken,
                user: { id: `google-${email}`, email, name, picture, role: 'recruiter' },
            });
        }
        catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ error: 'Invalid Google token' });
        }
    }
    catch (e) {
        console.error('Google login error:', e);
        return res.status(500).json({ error: 'Google login failed' });
    }
};
exports.googleLogin = googleLogin;
