"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfBufferToText = void 0;
exports.extractStructuredDataWithGemini = extractStructuredDataWithGemini;
exports.normalizeApplicantRecord = normalizeApplicantRecord;
exports.parseCsvBufferToApplicants = parseCsvBufferToApplicants;
exports.parseXlsxBufferToApplicants = parseXlsxBufferToApplicants;
exports.parseJsonBufferToApplicants = parseJsonBufferToApplicants;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const sync_1 = require("csv-parse/sync");
const xlsx = __importStar(require("xlsx"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const parsePdfBufferToText = async (buffer) => {
    try {
        const data = await (0, pdf_parse_1.default)(buffer);
        return data.text;
    }
    catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF resume');
    }
};
exports.parsePdfBufferToText = parsePdfBufferToText;
function getString(value) {
    if (value == null)
        return '';
    if (typeof value === 'string')
        return value.trim();
    return String(value).trim();
}
/**
 * Uses Gemini to extract structured talent profil from raw resume text
 */
async function extractStructuredDataWithGemini(text) {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    if (!hasKey) {
        console.warn('GEMINI_API_KEY missing, using basic parsing fallback');
        return {};
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an expert resume parser. Extract information from the following resume text and return it in a STRICT JSON format matching the schema below.

MANDATORY SCHEMA:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "headline": "Professional title or headline",
  "bio": "Short professional summary",
  "location": "City, Country",
  "skills": [{"name": "string", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": number}],
  "experience": [{"company": "string", "role": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM|Present", "description": "string", "technologies": ["string"], "isCurrent": boolean}],
  "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": number, "endYear": number}],
  "certifications": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM"}],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"], "role": "string", "link": "string", "dates": {"start": "YYYY-MM", "end": "YYYY-MM|Present"}}],
  "availability": {"status": "Available|Open to Opportunities|Not Available", "type": "Full-time|Part-time|Contract", "startDate": "YYYY-MM-DD"},
  "socialLinks": {"linkedin": "url", "github": "url", "portfolio": "url"}
}

RULES:
- If a field is missing from the text, use null or an empty array as appropriate.
- For dates, try to use YYYY-MM format.
- "isCurrent" should be true if the end date is "Present" or not mentioned but implied current.
- Return ONLY the JSON object.

RESUME TEXT:
${text}
`;
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json',
            },
        });
        const response = await result.response;
        const jsonStr = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    }
    catch (error) {
        console.error('Gemini extraction error:', error);
        return {};
    }
}
function normalizeApplicantRecord(record) {
    const nameStr = getString(record.name || record.fullName || record.candidate || record['Candidate Name']);
    const finalName = nameStr || `${getString(record.firstName)} ${getString(record.lastName)}`.trim() || 'Unknown Candidate';
    const nameParts = finalName.split(' ');
    const firstName = record.firstName || nameParts[0] || 'Unknown';
    const lastName = record.lastName || nameParts.slice(1).join(' ') || 'Candidate';
    const email = getString(record.email || record.mail || record['Email']);
    const resumeText = getString(record.resumeText ||
        record.resume ||
        record.cv ||
        record.summary ||
        record.text ||
        record['Resume Text']);
    return {
        firstName: firstName,
        lastName: lastName,
        email: email || 'unknown@example.com',
        headline: getString(record.headline) || 'Candidate',
        bio: getString(record.bio),
        location: getString(record.location) || 'Unknown Location',
        skills: Array.isArray(record.skills) ? record.skills : [],
        experience: Array.isArray(record.experience) ? record.experience : [],
        education: Array.isArray(record.education) ? record.education : [],
        projects: Array.isArray(record.projects) ? record.projects : [],
        availability: record.availability || { status: 'Available', type: 'Full-time' },
        socialLinks: record.socialLinks || {},
        resumeText,
        resumeUrl: getString(record.resumeUrl || record.url || record.link) || undefined,
        name: finalName,
    };
}
function parseCsvBufferToApplicants(buffer) {
    const content = buffer.toString('utf-8');
    const records = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    return records.map((r) => ({ ...normalizeApplicantRecord(r), source: 'csv' }));
}
function parseXlsxBufferToApplicants(buffer) {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
    return rows.map((r) => ({ ...normalizeApplicantRecord(r), source: 'xlsx' }));
}
function parseJsonBufferToApplicants(buffer) {
    const raw = buffer.toString('utf-8');
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.applicants) ? parsed.applicants : [parsed];
    return arr.map((r) => ({ ...normalizeApplicantRecord(r), source: 'json' }));
}
