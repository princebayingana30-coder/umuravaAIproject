import { Request, Response } from 'express';
import Job from '../models/Job';
import ScreeningResult from '../models/ScreeningResult';

export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Cascade delete screening results
    await ScreeningResult.deleteMany({ jobId });
    
    res.json({ message: 'Job and associated results deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

