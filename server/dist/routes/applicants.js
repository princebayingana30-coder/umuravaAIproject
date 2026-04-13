"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applicant_controller_1 = require("../controllers/applicant.controller");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
router.post('/', applicant_controller_1.createApplicant);
router.post('/upload', upload_1.default.single('resume'), applicant_controller_1.uploadAndParseResume);
router.post('/ingest', applicant_controller_1.ingestApplicants);
router.post('/link', applicant_controller_1.ingestApplicantFromLink);
router.get('/', applicant_controller_1.getApplicants);
exports.default = router;
