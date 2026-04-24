"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ApplicantSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    headline: { type: String, required: true },
    bio: { type: String },
    location: { type: String, required: true },
    skills: [{
            name: { type: String, required: true },
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
            yearsOfExperience: { type: Number, required: true }
        }],
    languages: [{
            name: { type: String, required: true },
            proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'], required: true }
        }],
    experience: [{
            company: { type: String, required: true },
            role: { type: String, required: true },
            startDate: { type: String, required: true },
            endDate: { type: String },
            description: { type: String },
            technologies: [{ type: String }],
            isCurrent: { type: Boolean }
        }],
    education: [{
            institution: { type: String, required: true },
            degree: { type: String, required: true },
            fieldOfStudy: { type: String },
            startYear: { type: Number },
            endYear: { type: Number }
        }],
    certifications: [{
            name: { type: String, required: true },
            issuer: { type: String, required: true },
            issueDate: { type: String }
        }],
    projects: [{
            name: { type: String, required: true },
            description: { type: String },
            technologies: [{ type: String }],
            role: { type: String },
            link: { type: String },
            startDate: { type: String },
            endDate: { type: String }
        }],
    availability: {
        status: { type: String, enum: ['Available', 'Open to Opportunities', 'Not Available'], required: true, default: 'Available' },
        type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], required: true, default: 'Full-time' },
        startDate: { type: String }
    },
    socialLinks: {
        linkedin: { type: String },
        github: { type: String },
        portfolio: { type: String }
    },
    // Document uploads with AI authenticity analysis
    documents: [{
            fileName: { type: String, required: true },
            fileType: { type: String, required: true },
            category: { type: String, enum: ['cv', 'cover_letter', 'certificate', 'portfolio', 'other'], default: 'other' },
            extractedText: { type: String, default: '' },
            uploadedAt: { type: Date, default: Date.now },
            authenticity: {
                score: { type: Number, default: 0 },
                isAiGenerated: { type: Boolean, default: false },
                flags: [{ type: String }],
                suspiciousSegments: [{
                        text: { type: String },
                        reason: { type: String },
                    }],
                analyzedAt: { type: Date },
            },
        }],
    documentAuthenticityStatus: {
        type: String,
        enum: ['clean', 'suspicious', 'flagged', 'pending'],
        default: 'pending',
    },
    // Preserved fields
    name: { type: String },
    resumeText: { type: String, required: true },
    resumeUrl: { type: String },
    source: { type: String },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Applicant', ApplicantSchema);
