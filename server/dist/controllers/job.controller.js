"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobById = exports.getJobs = exports.createJob = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const createJob = async (req, res) => {
    try {
        const job = new Job_1.default(req.body);
        await job.save();
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
    }
};
exports.createJob = createJob;
const getJobs = async (req, res) => {
    try {
        const jobs = await Job_1.default.find().sort({ createdAt: -1 });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res) => {
    try {
        const job = await Job_1.default.findById(req.params.id);
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch job' });
    }
};
exports.getJobById = getJobById;
