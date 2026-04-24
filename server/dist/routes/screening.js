"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const screening_controller_1 = require("../controllers/screening.controller");
const router = express_1.default.Router();
router.post('/run', screening_controller_1.runScreening);
router.get('/job/:jobId', screening_controller_1.getResultsByJob);
router.post('/decision', screening_controller_1.updateCandidateDecision);
router.get('/analytics/job/:jobId', screening_controller_1.getJobAnalytics);
router.get('/analytics/dashboard', screening_controller_1.getAllJobsAnalytics);
router.delete('/:id', screening_controller_1.deleteResult);
exports.default = router;
