"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllJobsAnalytics = exports.getJobAnalytics = exports.updateCandidateDecision = exports.getResultsByJob = exports.runScreening = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Applicant_1 = __importDefault(require("../models/Applicant"));
const ScreeningResult_1 = __importDefault(require("../models/ScreeningResult"));
const ai_service_1 = require("../services/ai.service");
const runScreening = async (req, res) => {
    const { jobId, applicantIds } = req.body;
    try {
        const job = await Job_1.default.findById(jobId);
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        const applicants = await Applicant_1.default.find({ _id: { $in: applicantIds } });
        // Only send unscreened applicants to AI; keep cached results for others.
        const existingResults = await ScreeningResult_1.default.find({
            jobId: job._id,
            applicantId: { $in: applicants.map((a) => a._id) },
        });
        const existingByApplicant = new Map(existingResults.map((r) => [String(r.applicantId), r]));
        const toScreen = applicants.filter((a) => !existingByApplicant.has(String(a._id)));
        if (toScreen.length > 0) {
            const batchOutput = await (0, ai_service_1.screenCandidatesBatch)({
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                skills: job.skills,
                experience: job.experience,
                weights: job.weights,
            }, toScreen.map((a) => ({
                applicantId: String(a._id),
                name: a.name,
                resumeText: a.resumeText,
            })));
            const toInsert = batchOutput.map((r) => ({
                jobId: job._id,
                applicantId: r.applicantId,
                score: r.score,
                strengths: r.strengths,
                gaps: r.gaps,
                recommendation: r.recommendation,
                aiAuthenticityScore: r.ai_authenticity_score,
                aiFlags: r.ai_flags,
                aiSuspiciousSegments: r.ai_suspicious_segments,
                scoreBreakdown: r.score_breakdown,
            }));
            const inserted = await ScreeningResult_1.default.insertMany(toInsert);
            for (const r of inserted) {
                existingByApplicant.set(String(r.applicantId), r);
            }
        }
        const combined = applicants
            .map((a) => existingByApplicant.get(String(a._id)))
            .filter(Boolean);
        const rankedResults = combined.sort((a, b) => b.score - a.score);
        for (let i = 0; i < rankedResults.length; i++) {
            await ScreeningResult_1.default.findByIdAndUpdate(rankedResults[i]._id, { rank: i + 1 });
            rankedResults[i].rank = i + 1;
        }
        res.json(rankedResults);
    }
    catch (error) {
        console.error('Screening calculation error:', error);
        res.status(500).json({ error: 'Failed to run screening' });
    }
};
exports.runScreening = runScreening;
const getResultsByJob = async (req, res) => {
    try {
        const results = await ScreeningResult_1.default.find({ jobId: req.params.jobId })
            .populate('applicantId')
            .sort({ rank: 1 });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
};
exports.getResultsByJob = getResultsByJob;
const updateCandidateDecision = async (req, res) => {
    const { resultId, decision, reason } = req.body;
    try {
        if (!['shortlisted', 'rejected', 'hired', 'in-interview'].includes(decision)) {
            return res.status(400).json({ error: 'Invalid decision status' });
        }
        const result = await ScreeningResult_1.default.findByIdAndUpdate(resultId, {
            decision,
            decisionReason: reason,
            decisionMadeAt: new Date(),
            decisionMadeBy: req.user?.email || 'unknown', // Requires auth middleware
        }, { new: true }).populate('applicantId');
        res.json(result);
    }
    catch (error) {
        console.error('Decision update error:', error);
        res.status(500).json({ error: 'Failed to update decision' });
    }
};
exports.updateCandidateDecision = updateCandidateDecision;
const getJobAnalytics = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await Job_1.default.findById(jobId);
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        const results = await ScreeningResult_1.default.find({ jobId })
            .populate('applicantId');
        // Calculate analytics
        const totalCandidates = results.length;
        const averageScore = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
            : 0;
        const decisionCounts = {
            shortlisted: results.filter(r => r.decision === 'shortlisted').length,
            rejected: results.filter(r => r.decision === 'rejected').length,
            hired: results.filter(r => r.decision === 'hired').length,
            inInterview: results.filter(r => r.decision === 'in-interview').length,
            pending: results.filter(r => !r.decision).length,
        };
        const topScorers = results
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(r => ({
            rank: r.rank,
            name: r.applicantId.name,
            score: r.score,
            decision: r.decision,
        }));
        const scoreDistribution = {
            excellent: results.filter(r => r.score >= 80).length,
            good: results.filter(r => r.score >= 60 && r.score < 80).length,
            fair: results.filter(r => r.score >= 40 && r.score < 60).length,
            poor: results.filter(r => r.score < 40).length,
        };
        res.json({
            job: { id: job._id, title: job.title, createdAt: job.createdAt },
            totalCandidates,
            averageScore,
            decisionCounts,
            topScorers,
            scoreDistribution,
            lastUpdated: new Date(),
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getJobAnalytics = getJobAnalytics;
const getAllJobsAnalytics = async (req, res) => {
    try {
        const jobs = await Job_1.default.find().sort({ createdAt: -1 });
        const analyticsData = await Promise.all(jobs.map(async (job) => {
            const results = await ScreeningResult_1.default.find({ jobId: job._id });
            return {
                jobId: job._id,
                title: job.title,
                totalCandidates: results.length,
                averageScore: results.length > 0
                    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
                    : 0,
                decisions: {
                    shortlisted: results.filter(r => r.decision === 'shortlisted').length,
                    rejected: results.filter(r => r.decision === 'rejected').length,
                    hired: results.filter(r => r.decision === 'hired').length,
                    inInterview: results.filter(r => r.decision === 'in-interview').length,
                    pending: results.filter(r => !r.decision).length,
                },
                createdAt: job.createdAt,
            };
        }));
        const totalPositions = jobs.length;
        const totalCandidatesScreened = analyticsData.reduce((sum, a) => sum + a.totalCandidates, 0);
        const totalHired = analyticsData.reduce((sum, a) => sum + a.decisions.hired, 0);
        res.json({
            dashboard: {
                totalPositions,
                totalCandidatesScreened,
                totalHired,
                averageHiringRate: totalCandidatesScreened > 0
                    ? Math.round((totalHired / totalCandidatesScreened) * 100)
                    : 0,
            },
            jobs: analyticsData,
        });
    }
    catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
};
exports.getAllJobsAnalytics = getAllJobsAnalytics;
