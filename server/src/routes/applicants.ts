import express from 'express';
import {
  createApplicant,
  getApplicants,
  getApplicantById,
  ingestApplicantFromLink,
  ingestApplicants,
  uploadAndParseResume,
  ingestSampleCandidates,
  addCandidateWithDocuments,
} from '../controllers/applicant.controller';
import upload, { uploadMultiple } from '../middleware/upload';

const router = express.Router();

router.post('/', createApplicant);
router.post('/upload', upload.single('resume'), uploadAndParseResume);
router.post('/ingest', ingestApplicants);
router.post('/ingest/sample', ingestSampleCandidates);
router.post('/link', ingestApplicantFromLink);
router.post('/add-candidate', uploadMultiple.array('documents', 5), addCandidateWithDocuments);
router.get('/', getApplicants);
router.get('/:id', getApplicantById);

export default router;
