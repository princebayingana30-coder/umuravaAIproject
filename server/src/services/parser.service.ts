import pdf from 'pdf-parse';
import { parse as parseCsv } from 'csv-parse/sync';
import * as xlsx from 'xlsx';

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
  name: string;
  email: string;
  resumeText: string;
  resumeUrl?: string;
  source?: 'pdf' | 'csv' | 'xlsx' | 'json' | 'link' | 'text';
};

function getString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

export function normalizeApplicantRecord(record: any): IngestedApplicant {
  const name = getString(record.name || record.fullName || record.candidate || record['Candidate Name']);
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
    name: name || 'Unknown Candidate',
    email: email || 'unknown@example.com',
    resumeText,
    resumeUrl: getString(record.resumeUrl || record.url || record.link) || undefined,
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

