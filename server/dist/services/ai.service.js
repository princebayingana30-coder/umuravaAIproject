"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenCandidatesBatch = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const CandidateResultSchema = zod_1.z.object({
    rank: zod_1.z.number().int().min(1),
    applicantId: zod_1.z.string(),
    name: zod_1.z.string(),
    score: zod_1.z.number().min(0).max(100),
    strengths: zod_1.z.array(zod_1.z.string()).default([]),
    gaps: zod_1.z.array(zod_1.z.string()).default([]),
    recommendation: zod_1.z.string().default(''),
    ai_authenticity_score: zod_1.z.number().min(0).max(100),
    ai_flags: zod_1.z.array(zod_1.z.string()).default([]),
    ai_suspicious_segments: zod_1.z
        .array(zod_1.z.object({
        text: zod_1.z.string(),
        reason: zod_1.z.string(),
    }))
        .default([]),
    score_breakdown: zod_1.z
        .object({
        skills: zod_1.z.number().min(0).max(100),
        experience: zod_1.z.number().min(0).max(100),
        projects: zod_1.z.number().min(0).max(100),
        education: zod_1.z.number().min(0).max(100),
        certifications: zod_1.z.number().min(0).max(100),
        availability: zod_1.z.number().min(0).max(100),
        weighting: zod_1.z.object({
            skills: zod_1.z.number(),
            experience: zod_1.z.number(),
            projects: zod_1.z.number(),
            education: zod_1.z.number(),
            certifications: zod_1.z.number(),
            availability: zod_1.z.number(),
        }),
    })
        .optional(),
});
const BatchSchema = zod_1.z.array(CandidateResultSchema);
function extractJson(text) {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start)
        return cleaned.slice(start, end + 1);
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj)
        return cleaned.slice(startObj, endObj + 1);
    return cleaned;
}
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
function round(n) {
    return Math.round(n);
}
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}
function keywordScore(resumeText, keywords) {
    const t = new Set(tokenize(resumeText));
    if (keywords.length === 0)
        return 50;
    let hit = 0;
    for (const k of keywords) {
        const kk = k.toLowerCase().trim();
        if (!kk)
            continue;
        // simple contains check for multiword skills
        if (kk.includes(' ')) {
            if (resumeText.toLowerCase().includes(kk))
                hit++;
        }
        else if (t.has(kk)) {
            hit++;
        }
    }
    const ratio = hit / Math.max(1, keywords.filter(Boolean).length);
    return clamp(round(30 + ratio * 70));
}
function detectAiSignals(resumeText) {
    const flags = [];
    const segments = [];
    const lower = resumeText.toLowerCase();
    const genericPhrases = [
        'results-driven',
        'highly motivated',
        'team player',
        'detail-oriented',
        'excellent communication',
        'fast learner',
        'dynamic environment',
        'passionate about',
    ];
    let genericHits = 0;
    for (const p of genericPhrases)
        if (lower.includes(p))
            genericHits++;
    if (genericHits >= 3)
        flags.push('High density of generic self-descriptors (common in AI-polished resumes).');
    const bulletLike = (resumeText.match(/^\s*[-•*]\s+/gm) || []).length;
    const numbers = (resumeText.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
    if (bulletLike >= 12 && numbers === 0)
        flags.push('Many bullets but very few measurable specifics (numbers, metrics).');
    // repetition heuristic
    const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
    const dup = new Map();
    for (const l of lines) {
        if (l.length < 18)
            continue;
        dup.set(l, (dup.get(l) || 0) + 1);
    }
    const repeated = [...dup.entries()].filter(([, c]) => c >= 2).slice(0, 2);
    if (repeated.length > 0)
        flags.push('Repeated phrasing detected across multiple lines.');
    // build segments from matched phrases / repeated lines
    for (const p of genericPhrases) {
        const idx = lower.indexOf(p);
        if (idx !== -1) {
            const snippet = resumeText.slice(Math.max(0, idx - 40), Math.min(resumeText.length, idx + p.length + 40)).trim();
            segments.push({ text: snippet, reason: `Generic phrase: "${p}"` });
        }
        if (segments.length >= 5)
            break;
    }
    for (const [l] of repeated) {
        if (segments.length >= 5)
            break;
        segments.push({ text: l, reason: 'Repeated line detected' });
    }
    // score 0 (human) → 100 (likely AI)
    let ai = 15;
    ai += genericHits * 10;
    if (bulletLike >= 12 && numbers === 0)
        ai += 20;
    if (repeated.length > 0)
        ai += 15;
    ai = clamp(ai);
    return { ai_authenticity_score: ai, ai_flags: flags, ai_suspicious_segments: segments.slice(0, 5) };
}
function mockBatch(job, candidates) {
    // Default weights match IMPLEMENTATION_STRATEGY: Skills 35%, Experience 25%, Projects 20%, Education 10%, Certifications 5%, Availability 5%
    const weights = {
        skills: job.weights?.skills ?? 35,
        experience: job.weights?.experience ?? 25,
        projects: job.weights?.projects ?? 20,
        education: job.weights?.education ?? 10,
        certifications: job.weights?.certifications ?? 5,
        availability: job.weights?.availability ?? 5,
    };
    const weightSum = weights.skills + weights.experience + weights.projects + weights.education + weights.certifications + weights.availability;
    const keywords = [...(job.skills || []), ...(job.requirements || [])].filter(Boolean);
    const scored = candidates.map((c) => {
        // Calculate individual factor scores (0-100 range)
        const skills = keywordScore(c.resumeText, job.skills || []);
        const experience = keywordScore(c.resumeText, job.requirements || []);
        const projects = keywordScore(c.resumeText, ['project', 'built', 'developed', 'created', 'github', 'portfolio', 'deployed', 'shipped']);
        const education = keywordScore(c.resumeText, ['bachelor', 'bsc', 'master', 'msc', 'phd', 'degree', 'university', 'college', 'certified', 'certification']);
        const certifications = keywordScore(c.resumeText, ['certified', 'aws', 'gcp', 'azure', 'cissp', 'cpa', 'pmp', 'scrum', 'kubernetes']);
        const availability = c.resumeText.toLowerCase().includes('available') ? 85 : 70; // Base availability score
        // Weighted overall score
        const score = clamp(round((skills * weights.skills + experience * weights.experience + projects * weights.projects + education * weights.education + certifications * weights.certifications + availability * weights.availability) / weightSum));
        const strengths = [];
        const gaps = [];
        if (keywords.length > 0) {
            const lower = c.resumeText.toLowerCase();
            for (const k of keywords.slice(0, 8)) {
                if (k && lower.includes(k.toLowerCase()))
                    strengths.push(`Mentions "${k}"`);
            }
        }
        if (strengths.length === 0)
            gaps.push('Few explicit overlaps with job keywords detected in resume text.');
        if (c.resumeText.length < 400)
            gaps.push('Resume text is short; limited evidence to verify depth.');
        const authenticity = detectAiSignals(c.resumeText);
        const recommendation = score >= 80 ? 'Strong shortlist candidate.' : score >= 60 ? 'Potential fit; review key gaps.' : 'Low match; unlikely to meet requirements.';
        return {
            rank: 0,
            applicantId: c.applicantId,
            name: c.name,
            score,
            strengths: strengths.slice(0, 8),
            gaps: gaps.slice(0, 8),
            recommendation,
            ...authenticity,
            score_breakdown: {
                skills,
                experience,
                projects,
                education,
                certifications,
                availability,
                weighting: weights,
            },
        };
    });
    scored.sort((a, b) => b.score - a.score);
    scored.forEach((r, i) => (r.rank = i + 1));
    const validated = BatchSchema.safeParse(scored);
    if (!validated.success)
        throw new Error('Mock AI produced invalid schema');
    return validated.data;
}
const screenCandidatesBatch = async (job, candidates) => {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    const forceMock = String(process.env.MOCK_AI || '').toLowerCase() === 'true';
    if (!hasKey || forceMock) {
        return mockBatch(job, candidates);
    }
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });
    const weights = {
        skills: job.weights?.skills ?? 35,
        experience: job.weights?.experience ?? 25,
        projects: job.weights?.projects ?? 20,
        education: job.weights?.education ?? 10,
        certifications: job.weights?.certifications ?? 5,
        availability: job.weights?.availability ?? 5,
    };
    const prompt = `
You are TalentIQ AI, an expert recruiter screening engine.

IMPORTANT RULES:
- Use ONLY the provided job data and candidate resume text.
- If information is missing, say so in gaps; do NOT invent facts.
- Return STRICT JSON only (no markdown, no extra keys, no prose).
- Output MUST be a JSON array of objects in the exact schema below.
- Produce ranks with 1 = best candidate.

SCORING WEIGHTS (must match exactly):
- Skills Match: 35% (core job skills and competencies)
- Experience: 25% (years in role, relevant background)
- Projects: 20% (built/shipped relevant work)
- Education: 10% (degree, certifications)
- Certifications: 5% (AWS, certifications, credentials)
- Availability: 5% (start date alignment, availability)

Score each category 0-100, then compute:
weighted_score = round((skills*35 + experience*25 + projects*20 + education*10 + certifications*5 + availability*5) / 100)

AI CONTENT AUTHENTICITY DETECTOR:
- Provide ai_authenticity_score (0=human-like, 100=likely AI-generated).
- Flag suspicious segments: overly generic phrasing, repetitive structure, improbable breadth, lack of measurable specifics.
- Return up to 5 ai_suspicious_segments with exact text snippets copied from resume plus a short reason.

JOB:
Title: ${job.title}
Experience: ${job.experience || ''}
Description: ${job.description}
Requirements: ${(job.requirements || []).join(' | ')}
Skills: ${(job.skills || []).join(' | ')}

CANDIDATES (each has applicantId, name, resumeText):
${JSON.stringify(candidates, null, 2)}

OUTPUT JSON ARRAY SCHEMA (exact keys):
[
  {
    "rank": 1,
    "applicantId": "string",
    "name": "string",
    "score": 87,
    "strengths": ["..."],
    "gaps": ["..."],
    "recommendation": "short recruiter-facing summary",
    "ai_authenticity_score": 25,
    "ai_flags": ["..."],
    "ai_suspicious_segments": [{"text":"...","reason":"..."}],
    "score_breakdown": {
      "skills": 90,
      "experience": 85,
      "projects": 80,
      "education": 75,
      "certifications": 70,
      "availability": 80,
      "weighting": {"skills": 35, "experience": 25, "projects": 20, "education": 10, "certifications": 5, "availability": 5}
    }
  }
]
`.trim();
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });
        const text = result.response.text();
        const jsonString = extractJson(text);
        const parsed = JSON.parse(jsonString);
        const validated = BatchSchema.safeParse(parsed);
        if (!validated.success) {
            console.error('AI JSON validation failed:', validated.error);
            throw new Error('AI output did not match expected schema');
        }
        return validated.data;
    }
    catch (error) {
        console.error('AI Screening Error:', error);
        throw new Error('Failed to screen candidates');
    }
};
exports.screenCandidatesBatch = screenCandidatesBatch;
