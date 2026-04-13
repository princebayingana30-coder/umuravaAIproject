import express from 'express';
import { createApplicant, getApplicants, ingestApplicantFromLink, ingestApplicants, uploadAndParseResume } from '../controllers/applicant.controller';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/', createApplicant);
router.post('/upload', upload.single('resume'), uploadAndParseResume);
router.post('/ingest', ingestApplicants);
router.post('/link', ingestApplicantFromLink);
router.get('/', getApplicants);

export default router;
