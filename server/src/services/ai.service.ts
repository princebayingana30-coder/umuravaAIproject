import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type CandidateInput = {
  applicantId: string;
  name: string;
  resumeText: string;
};

export type JobInput = {
  title: string;
  description: string;
  requirements?: string[];
  skills?: string[];
  experience?: string;
  weights?: {
    skills?: number;
    experience?: number;
    projects?: number;
    education?: number;
    certifications?: number;
    availability?: number;
  };
};

const RecommendationEnum = z.enum(['Strong Hire', 'Consider', 'Reject']);

const CandidateResultSchema = z.object({
  rank: z.number().int().min(1),
  applicantId: z.string(),
  name: z.string(),
  score: z.number().min(0).max(100),
  aiScore: z.number().min(0).max(100),
  skillMatch: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100),
  projectStrength: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  reasoning: z.string().default(''),
  why_not_selected: z.string().optional(),
  skill_gap_analysis: z.array(z.string()).default([]),
  job_fit_confidence: z.number().min(0).max(100).default(0),
  predicted_growth_potential: z.enum(['High', 'Moderate', 'Limited']).default('Moderate'),
  growth_potential_reasoning: z.string().default(''),
  bias_detection_flags: z.array(z.string()).default([]),
  recruiter_recommendation: z.string().default(''),
  recommendation: z.union([RecommendationEnum, z.string()]).transform((val) => {
    if (val === 'Strong Hire' || val === 'Consider' || val === 'Reject') return val;
    if (val.toLowerCase().includes('strong')) return 'Strong Hire';
    if (val.toLowerCase().includes('consider') || val.toLowerCase().includes('potential')) return 'Consider';
    return 'Reject';
  }),
  ai_authenticity_score: z.number().min(0).max(100),
  ai_flags: z.array(z.string()).default([]),
  ai_suspicious_segments: z
    .array(
      z.object({
        text: z.string(),
        reason: z.string(),
      })
    )
    .default([]),
  score_breakdown: z
    .object({
      skills: z.number().min(0).max(100),
      experience: z.number().min(0).max(100),
      projects: z.number().min(0).max(100),
      education: z.number().min(0).max(100),
      certifications: z.number().min(0).max(100),
      availability: z.number().min(0).max(100),
      weighting: z.object({
        skills: z.number(),
        experience: z.number(),
        projects: z.number(),
        education: z.number(),
        certifications: z.number(),
        availability: z.number(),
      }),
      granular_reasons: z.array(
        z.object({
          factor: z.string(),
          impact: z.number(),
          reason: z.string(),
        })
      ).optional(),
    })
    .optional(),
});

const BatchSchema = z.array(CandidateResultSchema);

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) return cleaned.slice(start, end + 1);
  const startObj = cleaned.indexOf('{');
  const endObj = cleaned.lastIndexOf('}');
  if (startObj !== -1 && endObj !== -1 && endObj > startObj) return cleaned.slice(startObj, endObj + 1);
  return cleaned;
}

export type ScreeningBatchOutput = z.infer<typeof BatchSchema>;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number) {
  return Math.round(n);
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordScore(resumeText: string, keywords: string[]) {
  const t = new Set(tokenize(resumeText));
  if (keywords.length === 0) return 50;
  let hit = 0;
  for (const k of keywords) {
    const kk = k.toLowerCase().trim();
    if (!kk) continue;
    if (kk.includes(' ')) {
      if (resumeText.toLowerCase().includes(kk)) hit++;
    } else if (t.has(kk)) {
      hit++;
    }
  }
  const ratio = hit / Math.max(1, keywords.filter(Boolean).length);
  return clamp(round(30 + ratio * 70));
}

function detectAiSignals(resumeText: string) {
  const flags: string[] = [];
  const segments: { text: string; reason: string }[] = [];
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
  for (const p of genericPhrases) if (lower.includes(p)) genericHits++;
  if (genericHits >= 3) flags.push('High density of generic self-descriptors (common in AI-polished resumes).');

  const bulletLike = (resumeText.match(/^\s*[-•*]\s+/gm) || []).length;
  const numbers = (resumeText.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
  if (bulletLike >= 12 && numbers === 0) flags.push('Many bullets but very few measurable specifics (numbers, metrics).');

  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
  const dup = new Map<string, number>();
  for (const l of lines) {
    if (l.length < 18) continue;
    dup.set(l, (dup.get(l) || 0) + 1);
  }
  const repeated = [...dup.entries()].filter(([, c]) => c >= 2).slice(0, 2);
  if (repeated.length > 0) flags.push('Repeated phrasing detected across multiple lines.');

  for (const p of genericPhrases) {
    const idx = lower.indexOf(p);
    if (idx !== -1) {
      const snippet = resumeText.slice(Math.max(0, idx - 40), Math.min(resumeText.length, idx + p.length + 40)).trim();
      segments.push({ text: snippet, reason: `Generic phrase: "${p}"` });
    }
    if (segments.length >= 5) break;
  }
  for (const [l] of repeated) {
    if (segments.length >= 5) break;
    segments.push({ text: l, reason: 'Repeated line detected' });
  }

  let ai = 15;
  ai += genericHits * 10;
  if (bulletLike >= 12 && numbers === 0) ai += 20;
  if (repeated.length > 0) ai += 15;
  ai = clamp(ai);

  return { ai_authenticity_score: ai, ai_flags: flags, ai_suspicious_segments: segments.slice(0, 5) };
}

function recommendationFromScore(score: number): 'Strong Hire' | 'Consider' | 'Reject' {
  if (score >= 78) return 'Strong Hire';
  if (score >= 55) return 'Consider';
  return 'Reject';
}

function mockBatch(job: JobInput, candidates: CandidateInput[]): ScreeningBatchOutput {
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
    const skills = keywordScore(c.resumeText, job.skills || []);
    const experience = keywordScore(c.resumeText, job.requirements || []);
    const projects = keywordScore(c.resumeText, ['project', 'built', 'developed', 'created', 'github', 'portfolio', 'deployed', 'shipped']);
    const education = keywordScore(c.resumeText, ['bachelor', 'bsc', 'master', 'msc', 'phd', 'degree', 'university', 'college', 'certified', 'certification']);
    const certifications = keywordScore(c.resumeText, ['certified', 'aws', 'gcp', 'azure', 'cissp', 'cpa', 'pmp', 'scrum', 'kubernetes']);
    const availability = c.resumeText.toLowerCase().includes('available') ? 85 : 70;

    const score = clamp(
      round((skills * weights.skills + experience * weights.experience + projects * weights.projects + education * weights.education + certifications * weights.certifications + availability * weights.availability) / weightSum)
    );

    const strengths: string[] = [];
    const gaps: string[] = [];
    if (keywords.length > 0) {
      const lower = c.resumeText.toLowerCase();
      for (const k of keywords.slice(0, 8)) {
        if (k && lower.includes(k.toLowerCase())) strengths.push(`Demonstrates "${k}" competency`);
        else gaps.push(`Missing "${k}" in resume`);
      }
    }
    if (strengths.length === 0) gaps.push('Limited overlap with required job skills detected.');
    if (c.resumeText.length < 400) gaps.push('Resume text is short; limited evidence to verify depth.');

    const authenticity = detectAiSignals(c.resumeText);
    const recommendation = recommendationFromScore(score);
    const reasoning = `${c.name} scored ${score}/100 overall, driven by skills alignment (${skills}/100) and experience match (${experience}/100). ${recommendation === 'Strong Hire' ? 'Strongly recommended for immediate interview.' : recommendation === 'Consider' ? 'Borderline fit — recommend further review of key gaps.' : 'Insufficient alignment with role requirements.'}`;

    return {
      rank: 0,
      applicantId: c.applicantId,
      name: c.name,
      score,
      aiScore: score,
      skillMatch: skills,
      experienceMatch: experience,
      projectStrength: projects,
      strengths: strengths.slice(0, 5),
      gaps: gaps.slice(0, 5),
      reasoning,
      why_not_selected: score < 78 ? `Score of ${score} is below the high threshold of 78. Main gaps include: ${gaps.slice(0, 2).join(', ')}.` : undefined,
      skill_gap_analysis: gaps.filter(g => g.includes('Missing')).slice(0, 3),
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
  if (!validated.success) throw new Error('Mock AI produced invalid schema');
  return validated.data;
}

export const screenCandidatesBatch = async (job: JobInput, candidates: CandidateInput[]): Promise<ScreeningBatchOutput> => {
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
- aiScore MUST be equal to score.
- skillMatch MUST be equal to skills match score.
- experienceMatch MUST be equal to experience match score.
- projectStrength MUST be equal to projects match score.
- recommendation MUST be exactly one of: "Strong Hire", "Consider", or "Reject"
- reasoning MUST be a 2-3 sentence human-readable explanation of the ranking decision.
- why_not_selected MUST be a clear explanation for anyone NOT ranked #1.
- skill_gap_analysis MUST be a list of specific missing skills or requirements for this candidate.
- job_fit_confidence MUST be a number 0-100 indicating how "perfect" the alignment is.
- predicted_growth_potential MUST be one of: "High", "Moderate", "Limited".
- recruiter_recommendation MUST be a direct, professional advice snippet (e.g. "Fast-track to technical interview").
- score_breakdown.granular_reasons MUST be a list of up to 5 points with "factor", "impact" (number like +15 or -10), and "reason".

SCORING WEIGHTS (must match exactly):
- Skills Match: 35% (core job skills and competencies)
- Experience: 25% (years in role, relevant background)
- Projects: 20% (built/shipped relevant work)
- Education: 10% (degree, certifications)
- Certifications: 5% (AWS, certifications, credentials)
- Availability: 5% (start date alignment, availability)

Score each category 0-100, then compute:
weighted_score = round((skills*35 + experience*25 + projects*20 + education*10 + certifications*5 + availability*5) / 100)

RECOMMENDATION RULES:
- "Strong Hire": score >= 78 — clearly meets or exceeds requirements
- "Consider": score 55-77 — partial fit, worth a conversation
- "Reject": score < 55 — insufficient alignment

AI CONTENT AUTHENTICITY & BIAS AUDIT:
- Provide ai_authenticity_score (0=human-like, 100=likely AI-generated).
- bias_detection_flags: List any potential merit-based biases detected (e.g. "Favoring specific elite institutions").
- Return up to 5 ai_suspicious_segments with exact text snippets copied from resume plus a short reason.

JOB:
Title: ${job.title}
Experience: ${job.experience || ''}
Description: ${job.description}
Requirements: ${(job.requirements || []).join(' | ')}
Skills: ${(job.skills || []).join(' | ')}

CANDIDATES (each has applicantId, name, resumeText):
${JSON.stringify(candidates, null, 2)}

OUTPUT JSON ARRAY SCHEMA (exact keys, no extras):
[
  {
    "rank": 1,
    "applicantId": "string",
    "name": "string",
    "score": 87,
    "aiScore": 87,
    "skillMatch": 90,
    "experienceMatch": 80,
    "projectStrength": 95,
    "strengths": ["..."],
    "gaps": ["..."],
    "reasoning": "2-3 sentence explanation of why this candidate ranked here.",
    "why_not_selected": "Explanation if not rank 1",
    "skill_gap_analysis": ["..."],
    "job_fit_confidence": 92,
    "predicted_growth_potential": "High",
    "growth_potential_reasoning": "...",
    "bias_detection_flags": [],
    "recruiter_recommendation": "Highly technical fit; expedite to interview.",
    "recommendation": "Strong Hire",
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
      "weighting": {"skills": 35, "experience": 25, "projects": 20, "education": 10, "certifications": 5, "availability": 5},
      "granular_reasons": [{"factor": "Skills", "impact": 20, "reason": "Expert React knowledge"}]
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
    } as any);

    const text = result.response.text();
    const jsonString = extractJson(text);
    const parsed = JSON.parse(jsonString);
    const validated = BatchSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('AI JSON validation failed:', validated.error);
      throw new Error('AI output did not match expected schema');
    }
    return validated.data;
  } catch (error) {
    console.error('AI Screening Error:', error);
    throw new Error('Failed to screen candidates');
  }
};

/* ─── DOCUMENT AUTHENTICITY ANALYSIS ─── */

export type DocumentAuthenticityResult = {
  score: number;           // 0 = human-written, 100 = AI-generated
  isAiGenerated: boolean;  // true if score >= 70
  flags: string[];
  suspiciousSegments: { text: string; reason: string }[];
};

const DocAuthSchema = z.object({
  score: z.number().min(0).max(100),
  flags: z.array(z.string()).default([]),
  suspiciousSegments: z.array(z.object({
    text: z.string(),
    reason: z.string(),
  })).default([]),
});

function heuristicDocAuthenticity(text: string, category: string): DocumentAuthenticityResult {
  const signals = detectAiSignals(text);
  let score = signals.ai_authenticity_score;

  // Category-specific adjustments
  const lower = text.toLowerCase();
  const extraFlags: string[] = [...signals.ai_flags];

  if (category === 'cover_letter') {
    const clGeneric = [
      'i am writing to express my interest',
      'i am excited to apply',
      'i believe my skills',
      'i look forward to the opportunity',
      'thank you for considering',
      'with great enthusiasm',
      'i am confident that',
    ];
    let clHits = 0;
    for (const p of clGeneric) if (lower.includes(p)) clHits++;
    if (clHits >= 3) {
      score += 25;
      extraFlags.push('Cover letter uses many templated phrases commonly found in AI-generated letters.');
    }
  }

  if (category === 'cv' || category === 'certificate') {
    // Check for unnaturally perfect formatting indicators
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const avgLen = sentences.reduce((sum, s) => sum + s.trim().length, 0) / Math.max(1, sentences.length);
    if (sentences.length > 10 && avgLen > 100 && avgLen < 140) {
      score += 10;
      extraFlags.push('Unnaturally uniform sentence lengths detected (common in AI-generated text).');
    }
  }

  score = clamp(score);

  return {
    score,
    isAiGenerated: score >= 70,
    flags: extraFlags,
    suspiciousSegments: signals.ai_suspicious_segments.slice(0, 5),
  };
}

export async function analyzeDocumentAuthenticity(
  text: string,
  category: string
): Promise<DocumentAuthenticityResult> {
  if (!text || text.trim().length < 50) {
    return {
      score: 0,
      isAiGenerated: false,
      flags: ['Document text too short for reliable analysis.'],
      suspiciousSegments: [],
    };
  }

  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const forceMock = String(process.env.MOCK_AI || '').toLowerCase() === 'true';

  if (!hasKey || forceMock) {
    return heuristicDocAuthenticity(text, category);
  }

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  });

  const prompt = `
You are an expert AI content authenticity detector for recruitment documents. Analyze the following ${category.replace('_', ' ')} document and determine if it was written by a human or generated by AI.

ANALYSIS CRITERIA:
1. **Writing Patterns**: Check for unnaturally perfect grammar, uniform sentence structure, and overly polished language that lacks personal voice.
2. **Generic Phrasing**: Detect boilerplate phrases commonly used by AI text generators (e.g., "results-driven professional", "leveraged cutting-edge technologies", "I am writing to express my interest").
3. **Specificity**: Human-written documents typically include specific details, numbers, dates, and personal anecdotes. AI-generated text tends to be vague and generic.
4. **Structural Patterns**: AI text often follows predictable patterns (perfect STAR format in every bullet, identical sentence structures).
5. **Inconsistencies**: Check for contradictions in timelines, skills that don't match experience levels, or claims that seem fabricated.
6. **Emotional Authenticity**: Human documents often show personality, humor, or genuine emotion. AI text is typically flat and professional.

SCORING GUIDE:
- 0-30: Clearly human-written (personal voice, specific details, natural imperfections)
- 31-49: Likely human with some editing assistance
- 50-69: Suspicious — possible AI assistance or heavy template use
- 70-89: Likely AI-generated (generic phrasing, perfect structure, lacks specificity)
- 90-100: Almost certainly AI-generated (multiple strong indicators)

Return STRICT JSON only:
{
  "score": <number 0-100>,
  "flags": ["reason1", "reason2"],
  "suspiciousSegments": [{"text": "exact quote from document", "reason": "why it looks AI-generated"}]
}

DOCUMENT TEXT:
${text.slice(0, 8000)}
`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    } as any);

    const responseText = result.response.text();
    const jsonString = extractJson(responseText);
    const parsed = JSON.parse(jsonString);
    const validated = DocAuthSchema.safeParse(parsed);

    if (!validated.success) {
      console.error('Doc authenticity validation failed:', validated.error);
      return heuristicDocAuthenticity(text, category);
    }

    const score = clamp(validated.data.score);
    return {
      score,
      isAiGenerated: score >= 70,
      flags: validated.data.flags,
      suspiciousSegments: validated.data.suspiciousSegments.slice(0, 5),
    };
  } catch (error) {
    console.error('AI Doc Authenticity Error, using heuristic fallback:', error);
    return heuristicDocAuthenticity(text, category);
  }
}

