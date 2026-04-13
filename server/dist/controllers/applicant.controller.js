"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicants = exports.ingestApplicantFromLink = exports.ingestApplicants = exports.uploadAndParseResume = exports.createApplicant = void 0;
const Applicant_1 = __importDefault(require("../models/Applicant"));
const parser_service_1 = require("../services/parser.service");
const zod_1 = require("zod");
const createApplicant = async (req, res) => {
    try {
        const applicant = new Applicant_1.default(req.body);
        await applicant.save();
        res.status(201).json(applicant);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create applicant' });
    }
};
exports.createApplicant = createApplicant;
const uploadAndParseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }
        const mime = req.file.mimetype;
        const filename = req.file.originalname || 'upload';
        let applicants = [];
        if (mime === 'application/pdf') {
            const resumeText = await (0, parser_service_1.parsePdfBufferToText)(req.file.buffer);
            applicants = [
                {
                    name: req.body.name || filename.split('.')[0] || 'Unknown Candidate',
                    email: req.body.email || 'unknown@example.com',
                    resumeText,
                    resumeUrl: 'file-upload',
                    source: 'pdf',
                },
            ];
        }
        else if (mime === 'text/csv' || mime === 'application/csv' || mime === 'application/vnd.ms-excel') {
            applicants = (0, parser_service_1.parseCsvBufferToApplicants)(req.file.buffer);
        }
        else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            applicants = (0, parser_service_1.parseXlsxBufferToApplicants)(req.file.buffer);
        }
        else if (mime === 'application/json') {
            applicants = (0, parser_service_1.parseJsonBufferToApplicants)(req.file.buffer);
        }
        else {
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
        const created = await Applicant_1.default.insertMany(applicants
            .filter((a) => a.resumeText && a.resumeText.length > 20)
            .map((a) => ({
            name: a.name,
            email: a.email,
            resumeText: a.resumeText,
            resumeUrl: a.resumeUrl,
            source: a.source,
        })));
        if (created.length === 1)
            return res.status(201).json(created[0]);
        return res.status(201).json({ count: created.length, applicants: created });
    }
    catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process resume' });
    }
};
exports.uploadAndParseResume = uploadAndParseResume;
const IngestSchema = zod_1.z.object({
    applicants: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())).min(1),
});
const ingestApplicants = async (req, res) => {
    try {
        const parsed = IngestSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid ingest payload' });
        const normalized = parsed.data.applicants.map((r) => ({ ...(0, parser_service_1.normalizeApplicantRecord)(r), source: 'json' }));
        const created = await Applicant_1.default.insertMany(normalized
            .filter((a) => a.resumeText && a.resumeText.length > 20)
            .map((a) => ({
            name: a.name,
            email: a.email,
            resumeText: a.resumeText,
            resumeUrl: a.resumeUrl,
            source: a.source,
        })));
        return res.status(201).json({ count: created.length, applicants: created });
    }
    catch (e) {
        console.error('Ingest applicants error:', e);
        return res.status(500).json({ error: 'Failed to ingest applicants' });
    }
};
exports.ingestApplicants = ingestApplicants;
const LinkSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
});
const ingestApplicantFromLink = async (req, res) => {
    try {
        const parsed = LinkSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid link payload' });
        const r = await fetch(parsed.data.url);
        if (!r.ok)
            return res.status(400).json({ error: `Failed to fetch link (${r.status})` });
        const contentType = r.headers.get('content-type') || '';
        const buf = Buffer.from(await r.arrayBuffer());
        let resumeText = '';
        if (contentType.includes('application/pdf') || parsed.data.url.toLowerCase().endsWith('.pdf')) {
            resumeText = await (0, parser_service_1.parsePdfBufferToText)(buf);
        }
        else {
            resumeText = buf.toString('utf-8');
        }
        const applicant = new Applicant_1.default({
            name: parsed.data.name || 'Unknown Candidate',
            email: parsed.data.email || 'unknown@example.com',
            resumeText,
            resumeUrl: parsed.data.url,
            source: 'link',
        });
        await applicant.save();
        return res.status(201).json(applicant);
    }
    catch (e) {
        console.error('Ingest link error:', e);
        return res.status(500).json({ error: 'Failed to ingest applicant from link' });
    }
};
exports.ingestApplicantFromLink = ingestApplicantFromLink;
const getApplicants = async (req, res) => {
    try {
        const applicants = await Applicant_1.default.find().sort({ createdAt: -1 });
        res.json(applicants);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
};
exports.getApplicants = getApplicants;
