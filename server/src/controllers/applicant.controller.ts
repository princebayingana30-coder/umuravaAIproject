import { Request, Response } from 'express';
import Applicant from '../models/Applicant';
import ScreeningResult from '../models/ScreeningResult';
import {
  parsePdfBufferToText,
  parseCsvBufferToApplicants,
  parseXlsxBufferToApplicants,
  parseJsonBufferToApplicants,
  normalizeApplicantRecord,
  extractStructuredDataWithGemini,
  type IngestedApplicant,
} from '../services/parser.service';
import { analyzeDocumentAuthenticity } from '../services/ai.service';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

export const createApplicant = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Support legacy 'name' field if provided
    if (!data.firstName && data.name) {
      const parts = data.name.split(' ');
      data.firstName = parts[0] || 'Unknown';
      data.lastName = parts.slice(1).join(' ') || 'Candidate';
      delete data.name;
    }

    // Default values for mandatory fields
    data.firstName = data.firstName || 'Unknown';
    data.lastName = data.lastName || 'Candidate';
    data.headline = data.headline || 'Candidate';
    data.location = data.location || 'Unknown Location';
    data.bio = data.bio || data.summary || ''; // Map legacy summary to bio
    data.skills = data.skills || [];
    data.experience = data.experience || [];
    data.education = data.education || [];
    data.projects = data.projects || [];
    data.availability = data.availability || { status: 'Available', type: 'Full-time' };

    const applicant = new Applicant(data);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (error) {
    console.error('Create Applicant Error:', error);
    res.status(500).json({ error: 'Failed to create applicant' });
  }
};

export const uploadAndParseResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const mime = req.file.mimetype;
    const filename = req.file.originalname || 'upload';

    let applicants: IngestedApplicant[] = [];

    if (mime === 'application/pdf') {
      const resumeText = await parsePdfBufferToText(req.file.buffer);
      
      // Use Gemini to extract structured data
      const aiData = await extractStructuredDataWithGemini(resumeText);
      
      const nameToUse = req.body.name || `${aiData.firstName || ''} ${aiData.lastName || ''}`.trim() || filename.split('.')[0] || 'Unknown';
      
      applicants = [
        normalizeApplicantRecord({
          ...aiData,
          firstName: aiData.firstName || nameToUse.split(' ')[0],
          lastName: aiData.lastName || nameToUse.split(' ').slice(1).join(' ') || 'Candidate',
          resumeText,
          resumeUrl: 'file-upload',
          source: 'pdf',
        })
      ];
    } else if (mime === 'text/csv' || mime === 'application/csv' || mime === 'application/vnd.ms-excel') {
      applicants = parseCsvBufferToApplicants(req.file.buffer);
    } else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      applicants = parseXlsxBufferToApplicants(req.file.buffer);
    } else if (mime === 'application/json') {
      applicants = parseJsonBufferToApplicants(req.file.buffer);
    } else {
      const resumeText = req.file.buffer.toString('utf-8');
      const nameToUse = req.body.name || filename.split('.')[0] || 'Unknown Candidate';
      
      applicants = [
        normalizeApplicantRecord({
          name: nameToUse,
          resumeText,
          resumeUrl: 'file-upload',
          source: 'text',
        })
      ];
    }

    const created = await Applicant.insertMany(
      applicants
        .filter((a) => a.resumeText && a.resumeText.length > 20)
        .map((a) => ({
          firstName: a.firstName || 'Unknown',
          lastName: a.lastName || 'Candidate',
          email: a.email,
          headline: a.headline || 'Candidate',
          bio: a.bio || '',
          location: a.location || 'Unknown',
          skills: a.skills || [],
          languages: a.languages || [],
          experience: a.experience || [],
          education: a.education || [],
          projects: a.projects || [],
          certifications: a.certifications || [],
          availability: a.availability || { status: 'Available', type: 'Full-time' },
          socialLinks: a.socialLinks || {},
          resumeText: a.resumeText,
          resumeUrl: a.resumeUrl,
          source: a.source,
        }))
    );

    if (created.length === 1) return res.status(201).json(created[0]);
    return res.status(201).json({ count: created.length, applicants: created });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
};

export const ingestSampleCandidates = async (req: Request, res: Response) => {
  try {
    const samplePath = path.resolve(__dirname, '../../../client/public/data/candidates.json');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample data file not found' });
    }

    const raw = fs.readFileSync(samplePath, 'utf-8');
    const candidates = JSON.parse(raw);
    
    const normalized = candidates.map((c: any) => {
      const applicant = normalizeApplicantRecord({
        ...c.basicInfo,
        ...c,
        resumeText: `Resume of ${c.basicInfo.firstName} ${c.basicInfo.lastName}. ${c.basicInfo.bio} 
Skills: ${c.skills.map((s: any) => s.name).join(', ')}. 
Experience: ${c.experience.map((e: any) => `${e.role} at ${e.company}`).join('; ')}.`,
        source: 'sample'
      });
      return applicant;
    });

    const created = await Applicant.insertMany(normalized);
    res.status(201).json({ count: created.length, applicants: created });
  } catch (error) {
    console.error('Sample Ingest Error:', error);
    res.status(500).json({ error: 'Failed to ingest sample candidates' });
  }
};

const IngestSchema = z.object({
  applicants: z.array(z.record(z.string(), z.any())).min(1),
});

export const ingestApplicants = async (req: Request, res: Response) => {
  try {
    const parsed = IngestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ingest payload' });

    const normalized = parsed.data.applicants.map((r) => ({ ...normalizeApplicantRecord(r), source: 'json' as const }));
    const created = await Applicant.insertMany(normalized);

    return res.status(201).json({ count: created.length, applicants: created });
  } catch (e) {
    console.error('Ingest applicants error:', e);
    return res.status(500).json({ error: 'Failed to ingest applicants' });
  }
};

const LinkSchema = z.object({
  url: z.string().url(),
  name: z.string().optional(),
  email: z.string().optional(),
});

export const ingestApplicantFromLink = async (req: Request, res: Response) => {
  try {
    const parsed = LinkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid link payload' });

    const r = await fetch(parsed.data.url);
    if (!r.ok) return res.status(400).json({ error: `Failed to fetch link (${r.status})` });

    const contentType = r.headers.get('content-type') || '';
    const buf = Buffer.from(await r.arrayBuffer());

    let resumeText = '';
    if (contentType.includes('application/pdf') || parsed.data.url.toLowerCase().endsWith('.pdf')) {
      resumeText = await parsePdfBufferToText(buf);
    } else {
      resumeText = buf.toString('utf-8');
    }

    const aiData = await extractStructuredDataWithGemini(resumeText);

    const nameToUse = parsed.data.name || aiData.name || `${aiData.firstName || ''} ${aiData.lastName || ''}`.trim() || 'Unknown Candidate';
    
    const applicant = new Applicant(normalizeApplicantRecord({
      ...aiData,
      firstName: aiData.firstName || parsed.data.name?.split(' ')[0],
      lastName: aiData.lastName || parsed.data.name?.split(' ').slice(1).join(' ') || 'Candidate',
      email: parsed.data.email || aiData.email || 'unknown@example.com',
      resumeText,
      resumeUrl: parsed.data.url,
      source: 'link',
    }));

    await applicant.save();
    return res.status(201).json(applicant);
  } catch (e) {
    console.error('Ingest link error:', e);
    return res.status(500).json({ error: 'Failed to ingest applicant from link' });
  }
};

export const getApplicants = async (req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find().sort({ createdAt: -1 });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

export const getApplicantById = async (req: Request, res: Response) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    res.json(applicant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicant' });
  }
};

/* ─── ADD CANDIDATE WITH MULTI-DOCUMENT UPLOAD & AI AUTHENTICITY ─── */

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const mime = file.mimetype;

  if (mime === 'application/pdf') {
    return parsePdfBufferToText(file.buffer);
  }

  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // Basic text extraction for .doc/.docx — extract readable text from buffer
    const raw = file.buffer.toString('utf-8');
    // For DOCX, strip XML tags to get plain text
    const cleaned = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned.length > 50 ? cleaned : raw;
  }

  if (mime === 'text/plain' || mime === 'application/json' || mime === 'text/csv') {
    return file.buffer.toString('utf-8');
  }

  // Images (scanned certificates) — cannot extract text without OCR, return placeholder
  if (mime.startsWith('image/')) {
    return '[Scanned image document — text extraction requires OCR]';
  }

  return file.buffer.toString('utf-8');
}

function computeOverallAuthenticityStatus(
  documents: { authenticity: { score: number } }[]
): 'clean' | 'suspicious' | 'flagged' | 'pending' {
  if (documents.length === 0) return 'pending';
  
  const maxScore = Math.max(...documents.map(d => d.authenticity.score));
  
  if (maxScore >= 70) return 'flagged';
  if (maxScore >= 50) return 'suspicious';
  return 'clean';
}

export const addCandidateWithDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one document is required' });
    }

    // Parse basic candidate info from body
    const {
      firstName,
      lastName,
      email,
      phone,
      headline,
      location,
      summary,
      documentCategories: categoriesJson,
      skills,
      jobId,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName, and email are required' });
    }

    // Parse document categories: JSON string like {"0":"cv","1":"cover_letter","2":"certificate"}
    let categories: Record<string, string> = {};
    try {
      categories = categoriesJson ? JSON.parse(categoriesJson) : {};
    } catch {
      categories = {};
    }

    console.log(`📎 Processing ${files.length} documents for ${firstName} ${lastName}...`);

    // Process each document: extract text and analyze authenticity
    const processedDocs = [];
    let cvText = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = categories[String(i)] || 'other';

      console.log(`  📄 Analyzing document ${i + 1}: ${file.originalname} (${category})`);

      // Extract text from document
      const extractedText = await extractTextFromFile(file);

      // Run AI authenticity analysis
      const authResult = await analyzeDocumentAuthenticity(extractedText, category);

      console.log(`    → Authenticity score: ${authResult.score}/100 ${authResult.isAiGenerated ? '🔴 FLAGGED' : '🟢 Clean'}`);

      // If this is a CV, store the text for profile extraction
      if (category === 'cv' && extractedText.length > 50) {
        cvText = extractedText;
      }

      processedDocs.push({
        fileName: file.originalname,
        fileType: file.mimetype,
        category,
        extractedText: extractedText.slice(0, 50000), // Cap stored text
        uploadedAt: new Date(),
        authenticity: {
          score: authResult.score,
          isAiGenerated: authResult.isAiGenerated,
          flags: authResult.flags,
          suspiciousSegments: authResult.suspiciousSegments,
          analyzedAt: new Date(),
        },
      });
    }

    // If we have a CV, use Gemini to extract structured profile data
    let aiProfileData: Partial<IngestedApplicant> = {};
    if (cvText) {
      try {
        aiProfileData = await extractStructuredDataWithGemini(cvText);
      } catch (e) {
        console.error('Failed to extract structured data from CV:', e);
      }
    }

    // Compute the overall document authenticity status
    const documentAuthenticityStatus = computeOverallAuthenticityStatus(processedDocs);

    // Process Explicit Skills if provided
    let explicitSkills: any[] = [];
    if (skills) {
      explicitSkills = skills.split(',').map((s: string) => ({
        name: s.trim(),
        level: 'Intermediate',
        yearsOfExperience: 3
      })).filter((s: any) => s.name);
    }

    // Build the applicant record
    const fullName = `${firstName} ${lastName}`;
    const applicantData = {
      firstName: firstName || aiProfileData.firstName || 'Unknown',
      lastName: lastName || aiProfileData.lastName || 'Candidate',
      name: fullName,
      email: email || aiProfileData.email || 'unknown@example.com',
      headline: headline || aiProfileData.headline || 'Candidate',
      bio: summary || aiProfileData.bio || '',
      location: location || aiProfileData.location || 'Unknown Location',
      skills: explicitSkills.length > 0 ? explicitSkills : (aiProfileData.skills || []),
      experience: aiProfileData.experience || [],
      education: aiProfileData.education || [],
      projects: aiProfileData.projects || [],
      certifications: aiProfileData.certifications || [],
      availability: aiProfileData.availability || { status: 'Available', type: 'Full-time' },
      socialLinks: aiProfileData.socialLinks || {},
      documents: processedDocs,
      documentAuthenticityStatus,
      resumeText: cvText || `Profile of ${fullName}. ${summary || ''}`,
      resumeUrl: 'document-upload',
      source: 'candidate-portal',
    };

    const applicant = new Applicant(applicantData);
    await applicant.save();

    console.log(`[SUCCESS] Candidate ${fullName} added. Document status: ${documentAuthenticityStatus.toUpperCase()}`);

    // If assigned to a job, create a screening result automatically
    if (jobId) {
      const isFake = documentAuthenticityStatus === 'flagged';
      const newResult = new ScreeningResult({
        jobId,
        applicantId: applicant._id,
        rank: 0,
        score: isFake ? 0 : 50,
        strengths: isFake ? [] : ['Awaiting full AI screening'],
        gaps: isFake ? ['CAUTION: Fake/AI Documents'] : [],
        recommendation: isFake ? 'Reject' : 'Consider',
        reasoning: isFake 
          ? 'CAUTION: Automated rejection and immediate restriction due to highly suspicious AI generated documents.'
          : 'Candidate added successfully to this job. Awaiting full AI screening profile generation.',
        decision: isFake ? 'rejected' : null,
        decisionReason: isFake ? 'CAUTION: AI Generated/Fake Documents detected upon upload' : undefined,
        aiAuthenticityScore: isFake ? 99 : Math.max(0, ...processedDocs.map(d => d.authenticity.score)),
        aiFlags: processedDocs.flatMap(d => d.authenticity.flags),
        jobFitConfidence: 0,
      });
      await newResult.save();
      console.log(`[SUCCESS] Associated applicant directly to Job: ${jobId} ${isFake ? 'with CAUTION flag' : ''}`);
    }

    res.status(201).json(applicant);
  } catch (error) {
    console.error('Add Candidate Error:', error);
    res.status(500).json({ error: 'Failed to add candidate with documents' });
  }
};

