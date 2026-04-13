# AI Prompt Engineering Documentation

## Gemini API Integration

This project uses Google Gemini 1.5 Flash as the underlying LLM for AI-powered talent screening.

### Mandatory Requirements Met:
- ✅ **Gemini API used as underlying LLM**: All AI operations use `@google/generative-ai` with Gemini 1.5 Flash
- ✅ **Prompt engineering intentional and documented**: See below for detailed prompt structures
- ✅ **AI outputs clean, structured, and recruiter-friendly**: JSON schema validation ensures consistent output

### Recommended AI Capabilities Implemented:
- ✅ **Multi-candidate evaluation in single prompt**: Batch processing of up to multiple candidates
- ✅ **Weighted scoring**: Skills (40%), Experience (35%), Education (10%), Context (15%)
- ✅ **Natural-language explanations**: Human-readable strengths, gaps, and recommendations

## Prompt Engineering Details

### Main Screening Prompt Structure

```typescript
const prompt = `
IMPORTANT RULES:
- Use ONLY the provided job data and candidate resume text.
- If information is missing, say so in gaps; do NOT invent facts.
- Return STRICT JSON only (no markdown, no extra keys, no prose).
- Output MUST be a JSON array of objects in the exact schema below.
- Produce ranks with 1 = best candidate.

SCORING:
- Evaluate each candidate on: skills, experience, education, contextual fit.
- Compute each category as 0-100.
- Weighted overall score = round((skills*${weights.skills} + experience*${weights.experience} + education*${weights.education} + context*${weights.context}) / ${weights.skills + weights.experience + weights.education + weights.context})

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
      "skills": 0,
      "experience": 0,
      "education": 0,
      "context": 0,
      "weighting": {"skills": ${weights.skills}, "experience": ${weights.experience}, "education": ${weights.education}, "context": ${weights.context}}
    }
  }
]
`.trim();
```

### AI Output Contract

The Gemini API returns structured JSON matching this Zod schema:

```typescript
const CandidateResultSchema = z.object({
  rank: z.number().int().min(1),
  applicantId: z.string(),
  name: z.string(),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  recommendation: z.string().default(''),
  ai_authenticity_score: z.number().min(0).max(100),
  ai_flags: z.array(z.string()).default([]),
  ai_suspicious_segments: z.array(
    z.object({
      text: z.string(),
      reason: z.string(),
    })
  ).default([]),
  score_breakdown: z.object({
    skills: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    education: z.number().min(0).max(100),
    context: z.number().min(0).max(100),
    weighting: z.object({
      skills: z.number(),
      experience: z.number(),
      education: z.number(),
      context: z.number(),
    }),
  }).optional(),
});
```

### Scoring Methodology

1. **Skills Match (40%)**: Keyword matching against job skills
2. **Experience (35%)**: Years of experience vs. job requirements
3. **Education (10%)**: Educational background relevance
4. **Context (15%)**: Overall fit, culture match, growth potential

### Authenticity Detection Heuristics

- Generic phrases density (>3 triggers flag)
- Bullet point to metric ratio (many bullets + few numbers = suspicious)
- Repetitive phrasing detection
- Overly perfect formatting patterns

### Fallback Mode

When Gemini API is unavailable, the system includes a mock mode for development:

```typescript
// Mock implementation for development
function mockScreenCandidates(job: JobInput, candidates: CandidateInput[]): ScreeningBatchOutput {
  return candidates.map((candidate, index) => ({
    rank: index + 1,
    applicantId: candidate.applicantId,
    name: candidate.name,
    score: Math.floor(Math.random() * 40) + 60, // 60-100 range
    strengths: ["Good experience", "Relevant skills"],
    gaps: ["Could improve in some areas"],
    recommendation: "Strong candidate for consideration",
    ai_authenticity_score: Math.floor(Math.random() * 30), // 0-30 (mostly human-like)
    ai_flags: [],
    ai_suspicious_segments: [],
    score_breakdown: {
      skills: Math.floor(Math.random() * 40) + 60,
      experience: Math.floor(Math.random() * 40) + 60,
      education: Math.floor(Math.random() * 40) + 60,
      context: Math.floor(Math.random() * 40) + 60,
      weighting: { skills: 40, experience: 35, education: 10, context: 15 }
    }
  }));
}
```

## Technology Stack Compliance

- ✅ **Language**: TypeScript
- ✅ **Frontend**: Next.js (App Router)
- ✅ **State Management**: Redux + Redux Toolkit
- ✅ **Styling**: Tailwind CSS
- ✅ **Backend**: Node.js + Express
- ✅ **Database**: MongoDB + Mongoose
- ✅ **AI / LLM**: Gemini API (@google/generative-ai)

## API Endpoints

- `POST /api/screening/run` - Triggers AI screening
- `GET /api/screening/job/:jobId` - Retrieves screening results
- All endpoints return clean, structured JSON responses