"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCandidateWithDocuments = exports.getApplicantById = exports.getApplicants = exports.ingestApplicantFromLink = exports.ingestApplicants = exports.ingestSampleCandidates = exports.uploadAndParseResume = exports.createApplicant = void 0;
const Applicant_1 = __importDefault(require("../models/Applicant"));
const parser_service_1 = require("../services/parser.service");
const ai_service_1 = require("../services/ai.service");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createApplicant = async (req, res) => {
    try {
        const data = req.body;
        if (!data.firstName && data.name) {
            const parts = data.name.split(' ');
            data.firstName = parts[0] || 'Unknown';
            data.lastName = parts.slice(1).join(' ') || 'Candidate';
        }
        else if (!data.firstName) {
            data.firstName = 'Unknown';
            data.lastName = 'Candidate';
        }
        data.headline = data.headline || 'Candidate';
        data.location = data.location || 'Unknown Location';
        data.skills = data.skills || [];
        data.experience = data.experience || [];
        data.education = data.education || [];
        data.projects = data.projects || [];
        data.availability = data.availability || { status: 'Available', type: 'Full-time' };
        const applicant = new Applicant_1.default(data);
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
            // Use Gemini to extract structured data
            const aiData = await (0, parser_service_1.extractStructuredDataWithGemini)(resumeText);
            const nameToUse = req.body.name || aiData.name || `${aiData.firstName || ''} ${aiData.lastName || ''}`.trim() || filename.split('.')[0] || 'Unknown';
            applicants = [
                (0, parser_service_1.normalizeApplicantRecord)({
                    ...aiData,
                    name: nameToUse,
                    resumeText,
                    resumeUrl: 'file-upload',
                    source: 'pdf',
                })
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
            const nameToUse = req.body.name || filename.split('.')[0] || 'Unknown Candidate';
            applicants = [
                (0, parser_service_1.normalizeApplicantRecord)({
                    name: nameToUse,
                    resumeText,
                    resumeUrl: 'file-upload',
                    source: 'text',
                })
            ];
        }
        const created = await Applicant_1.default.insertMany(applicants
            .filter((a) => a.resumeText && a.resumeText.length > 20)
            .map((a) => ({
            firstName: a.firstName,
            lastName: a.lastName,
            name: a.name || `${a.firstName} ${a.lastName}`,
            email: a.email,
            headline: a.headline,
            bio: a.bio,
            location: a.location,
            skills: a.skills,
            experience: a.experience,
            education: a.education,
            projects: a.projects,
            availability: a.availability,
            socialLinks: a.socialLinks,
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
const ingestSampleCandidates = async (req, res) => {
    try {
        const samplePath = path_1.default.resolve(__dirname, '../../../client/public/data/candidates.json');
        if (!fs_1.default.existsSync(samplePath)) {
            return res.status(404).json({ error: 'Sample data file not found' });
        }
        const raw = fs_1.default.readFileSync(samplePath, 'utf-8');
        const candidates = JSON.parse(raw);
        const normalized = candidates.map((c) => {
            const applicant = (0, parser_service_1.normalizeApplicantRecord)({
                ...c.basicInfo,
                ...c,
                resumeText: `Resume of ${c.basicInfo.firstName} ${c.basicInfo.lastName}. ${c.basicInfo.bio} 
Skills: ${c.skills.map((s) => s.name).join(', ')}. 
Experience: ${c.experience.map((e) => `${e.role} at ${e.company}`).join('; ')}.`,
                source: 'sample'
            });
            return applicant;
        });
        const created = await Applicant_1.default.insertMany(normalized);
        res.status(201).json({ count: created.length, applicants: created });
    }
    catch (error) {
        console.error('Sample Ingest Error:', error);
        res.status(500).json({ error: 'Failed to ingest sample candidates' });
    }
};
exports.ingestSampleCandidates = ingestSampleCandidates;
const IngestSchema = zod_1.z.object({
    applicants: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())).min(1),
});
const ingestApplicants = async (req, res) => {
    try {
        const parsed = IngestSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid ingest payload' });
        const normalized = parsed.data.applicants.map((r) => ({ ...(0, parser_service_1.normalizeApplicantRecord)(r), source: 'json' }));
        const created = await Applicant_1.default.insertMany(normalized);
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
        const aiData = await (0, parser_service_1.extractStructuredDataWithGemini)(resumeText);
        const nameToUse = parsed.data.name || aiData.name || `${aiData.firstName || ''} ${aiData.lastName || ''}`.trim() || 'Unknown Candidate';
        const applicant = new Applicant_1.default((0, parser_service_1.normalizeApplicantRecord)({
            ...aiData,
            name: nameToUse,
            email: parsed.data.email || aiData.email || 'unknown@example.com',
            resumeText,
            resumeUrl: parsed.data.url,
            source: 'link',
        }));
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
const getApplicantById = async (req, res) => {
    try {
        const applicant = await Applicant_1.default.findById(req.params.id);
        if (!applicant)
            return res.status(404).json({ error: 'Applicant not found' });
        res.json(applicant);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch applicant' });
    }
};
exports.getApplicantById = getApplicantById;
/* ─── ADD CANDIDATE WITH MULTI-DOCUMENT UPLOAD & AI AUTHENTICITY ─── */
async function extractTextFromFile(file) {
    const mime = file.mimetype;
    if (mime === 'application/pdf') {
        return (0, parser_service_1.parsePdfBufferToText)(file.buffer);
    }
    if (mime === 'application/msword' ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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
function computeOverallAuthenticityStatus(documents) {
    if (documents.length === 0)
        return 'pending';
    const maxScore = Math.max(...documents.map(d => d.authenticity.score));
    if (maxScore >= 70)
        return 'flagged';
    if (maxScore >= 50)
        return 'suspicious';
    return 'clean';
}
const addCandidateWithDocuments = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'At least one document is required' });
        }
        // Parse basic candidate info from body
        const { firstName, lastName, email, phone, headline, location, summary, documentCategories: categoriesJson, } = req.body;
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: 'firstName, lastName, and email are required' });
        }
        // Parse document categories: JSON string like {"0":"cv","1":"cover_letter","2":"certificate"}
        let categories = {};
        try {
            categories = categoriesJson ? JSON.parse(categoriesJson) : {};
        }
        catch {
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
            const authResult = await (0, ai_service_1.analyzeDocumentAuthenticity)(extractedText, category);
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
        let aiProfileData = {};
        if (cvText) {
            try {
                aiProfileData = await (0, parser_service_1.extractStructuredDataWithGemini)(cvText);
            }
            catch (e) {
                console.error('Failed to extract structured data from CV:', e);
            }
        }
        // Compute the overall document authenticity status
        const documentAuthenticityStatus = computeOverallAuthenticityStatus(processedDocs);
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
            skills: aiProfileData.skills || [],
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
        const applicant = new Applicant_1.default(applicantData);
        await applicant.save();
        console.log(`✅ Candidate ${fullName} added. Document status: ${documentAuthenticityStatus.toUpperCase()}`);
        res.status(201).json(applicant);
    }
    catch (error) {
        console.error('Add Candidate Error:', error);
        res.status(500).json({ error: 'Failed to add candidate with documents' });
    }
};
exports.addCandidateWithDocuments = addCandidateWithDocuments;
