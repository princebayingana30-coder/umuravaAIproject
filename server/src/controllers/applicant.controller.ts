import { Request, Response } from 'express';
import Applicant from '../models/Applicant';
import {
  parsePdfBufferToText,
  parseCsvBufferToApplicants,
  parseXlsxBufferToApplicants,
  parseJsonBufferToApplicants,
  normalizeApplicantRecord,
  type IngestedApplicant,
} from '../services/parser.service';
import { z } from 'zod';

export const createApplicant = async (req: Request, res: Response) => {
  try {
    const applicant = new Applicant(req.body);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (error) {
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
      applicants = [
        {
          name: req.body.name || filename.split('.')[0] || 'Unknown Candidate',
          email: req.body.email || 'unknown@example.com',
          resumeText,
          resumeUrl: 'file-upload',
          source: 'pdf',
        },
      ];
    } else if (mime === 'text/csv' || mime === 'application/csv' || mime === 'application/vnd.ms-excel') {
      applicants = parseCsvBufferToApplicants(req.file.buffer);
    } else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      applicants = parseXlsxBufferToApplicants(req.file.buffer);
    } else if (mime === 'application/json') {
      applicants = parseJsonBufferToApplicants(req.file.buffer);
    } else {
      const resumeText = req.file.buffer.toString('utf-8');
      applicants = [
        {
          name: req.body.name || filename.split('.')[0] || 'Unknown Candidate',
          email: req.body.email || 'unknown@example.com',
          resumeText,
          resumeUrl: 'file-upload',
          source: 'text',
        },
      ];
    }

    const created = await Applicant.insertMany(
      applicants
        .filter((a) => a.resumeText && a.resumeText.length > 20)
        .map((a) => ({
          name: a.name,
          email: a.email,
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

const IngestSchema = z.object({
  applicants: z.array(z.record(z.string(), z.any())).min(1),
});

export const ingestApplicants = async (req: Request, res: Response) => {
  try {
    const parsed = IngestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ingest payload' });

    const normalized = parsed.data.applicants.map((r) => ({ ...normalizeApplicantRecord(r), source: 'json' as const }));
    const created = await Applicant.insertMany(
      normalized
        .filter((a) => a.resumeText && a.resumeText.length > 20)
        .map((a) => ({
          name: a.name,
          email: a.email,
          resumeText: a.resumeText,
          resumeUrl: a.resumeUrl,
          source: a.source,
        }))
    );

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

    const applicant = new Applicant({
      name: parsed.data.name || 'Unknown Candidate',
      email: parsed.data.email || 'unknown@example.com',
      resumeText,
      resumeUrl: parsed.data.url,
      source: 'link',
    });

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
