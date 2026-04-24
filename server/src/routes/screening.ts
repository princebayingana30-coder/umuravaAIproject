import express from 'express';
import { 
  runScreening, getResultsByJob, updateCandidateDecision, 
  getJobAnalytics, getAllJobsAnalytics, deleteResult 
} from '../controllers/screening.controller';

const router = express.Router();

router.post('/run', runScreening);
router.get('/job/:jobId', getResultsByJob);
router.post('/decision', updateCandidateDecision);
router.get('/analytics/job/:jobId', getJobAnalytics);
router.get('/analytics/dashboard', getAllJobsAnalytics);
router.delete('/:id', deleteResult);

export default router;
