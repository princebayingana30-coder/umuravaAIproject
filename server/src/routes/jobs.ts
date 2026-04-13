import express from 'express';
import { createJob, getJobs, getJobById } from '../controllers/job.controller';

const router = express.Router();

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);

export default router;
