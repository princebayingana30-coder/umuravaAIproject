import pdf from 'pdf-parse';
import { parse as parseCsv } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const parsePdfBufferToText = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF resume');
  }
};

export type IngestedApplicant = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: { 
    name: string; 
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; 
    yearsOfExperience: number 
  }[];
  languages: {
    name: string;
    proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  }[];
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }[];
  certifications: { 
    name: string; 
    issuer: string; 
    issueDate: string 
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate?: string;
  }[];
  availability: {
    status: 'Available' | 'Open to Opportunities' | 'Not Available';
    type: 'Full-time' | 'Part-time' | 'Contract';
    startDate?: string;
  };
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  resumeText: string;
  resumeUrl?: string;
  source?: 'pdf' | 'csv' | 'xlsx' | 'json' | 'link' | 'text';
  name?: string; // Legacy field for name string
};

function getString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

/**
 * Uses Gemini to extract structured talent profile from raw resume text
 * STRICTLY FOLLOWING UMURAVA AI HACKATHON STANDARD SCHEMA
 */
export async function extractStructuredDataWithGemini(text: string): Promise<Partial<IngestedApplicant>> {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  if (!hasKey) {
    console.warn('GEMINI_API_KEY missing, using basic parsing fallback');
    return {};
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert resume parser for the Umurava AI Hackathon. 
Extract information from the following resume text and return it in a STRICT JSON format.

MANDATORY HACKATHON SCHEMA:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "headline": "string (e.g. Backend Engineer – Node.js & AI Systems)",
  "bio": "string (Detailed professional biography)",
  "location": "string (City, Country)",
  "skills": [
    {
      "name": "string",
      "level": "Beginner | Intermediate | Advanced | Expert",
      "yearsOfExperience": number
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "Basic | Conversational | Fluent | Native"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM | Present",
      "description": "string",
      "technologies": ["string"],
      "isCurrent": boolean
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startYear": number,
      "endYear": number
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "role": "string",
      "link": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM | Present"
    }
  ],
  "availability": {
    "status": "Available | Open to Opportunities | Not Available",
    "type": "Full-time | Part-time | Contract",
    "startDate": "YYYY-MM-DD (optional)"
  },
  "socialLinks": {
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  }
}

RULES:
- Handle dates as YYYY-MM.
- If a field is not found, provide an empty array [] or empty object as appropriate, but do NOT omit the key.
- Return ONLY the raw JSON object. No markdown, no prose.

RESUME TEXT:
${text.slice(0, 10000)}
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
    const jsonStr = response.text().trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini extraction error:', error);
    return {};
  }
}

export function normalizeApplicantRecord(record: any): IngestedApplicant {
  const nameStr = getString(record.name || record.fullName || record.candidate || record['Candidate Name']);
  const finalName = nameStr || `${getString(record.firstName)} ${getString(record.lastName)}`.trim() || 'Unknown Candidate';
  const nameParts = finalName.split(' ');
  const firstName = record.firstName || nameParts[0] || 'Unknown';
  const lastName = record.lastName || nameParts.slice(1).join(' ') || 'Candidate';
  
  const email = getString(record.email || record.mail || record['Email']);
  const resumeText = getString(
    record.resumeText ||
      record.resume ||
      record.cv ||
      record.summary ||
      record.text ||
      record['Resume Text']
  );

  return {
    firstName: firstName,
    lastName: lastName,
    email: email || 'unknown@example.com',
    headline: getString(record.headline) || 'Candidate',
    bio: getString(record.bio),
    location: getString(record.location) || 'Unknown Location',
    skills: Array.isArray(record.skills) ? record.skills : [],
    languages: Array.isArray(record.languages) ? record.languages : [],
    experience: Array.isArray(record.experience) ? record.experience : [],
    education: Array.isArray(record.education) ? record.education : [],
    projects: Array.isArray(record.projects) ? record.projects : [],
    certifications: Array.isArray(record.certifications) ? record.certifications : [],
    availability: record.availability || { status: 'Available', type: 'Full-time' },
    socialLinks: record.socialLinks || {},
    resumeText,
    resumeUrl: getString(record.resumeUrl || record.url || record.link) || undefined,
    name: finalName,
  };
}

export function parseCsvBufferToApplicants(buffer: Buffer): IngestedApplicant[] {
  const content = buffer.toString('utf-8');
  const records = parseCsv(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
  return (records as any[]).map((r) => ({ ...normalizeApplicantRecord(r), source: 'csv' }));
}

export function parseXlsxBufferToApplicants(buffer: Buffer): IngestedApplicant[] {
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' }) as any[];
  return rows.map((r) => ({ ...normalizeApplicantRecord(r), source: 'xlsx' }));
}

export function parseJsonBufferToApplicants(buffer: Buffer): IngestedApplicant[] {
  const raw = buffer.toString('utf-8');
  const parsed = JSON.parse(raw);
  const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.applicants) ? parsed.applicants : [parsed];
  return (arr as any[]).map((r) => ({ ...normalizeApplicantRecord(r), source: 'json' }));
}



