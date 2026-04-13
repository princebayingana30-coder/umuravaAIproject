import express from 'express';
import { runScreening, getResultsByJob, updateCandidateDecision, getJobAnalytics, getAllJobsAnalytics } from '../controllers/screening.controller';

const router = express.Router();

router.post('/run', runScreening);
router.get('/job/:jobId', getResultsByJob);
router.post('/decision', updateCandidateDecision);
router.get('/analytics/job/:jobId', getJobAnalytics);
router.get('/analytics/dashboard', getAllJobsAnalytics);

export default router;
