import mongoose, { Schema, Document } from 'mongoose';

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  recommendation: 'Strong Hire' | 'Consider' | 'Reject';
  aiAuthenticityScore: number;
  aiFlags: string[];
  aiSuspiciousSegments: { text: string; reason: string }[];
  aiScore: number;
  skillMatch: number;
  experienceMatch: number;
  projectStrength: number;
  scoreBreakdown?: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
    weighting: { skills: number; experience: number; projects: number; education: number; certifications: number; availability: number };
    granularReasons?: { factor: string; impact: number; reason: string }[];
  };
  jobFitConfidence: number; // 0-100
  predictedGrowthPotential?: 'High' | 'Moderate' | 'Limited';
  growthPotentialReasoning?: string;
  biasDetectionFlags?: string[];
  recruiterRecommendation?: string;
  decision?: 'shortlisted' | 'rejected' | 'hired' | 'in-interview' | null;
  decisionReason?: string;
  decisionMadeAt?: Date;
  decisionMadeBy?: string;
  createdAt: Date;
}

const ScreeningResultSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
  rank: { type: Number },
  score: { type: Number, required: true },
  strengths: [{ type: String }],
  gaps: [{ type: String }],
  reasoning: { type: String, default: '' },
  recommendation: {
    type: String,
    enum: ['Strong Hire', 'Consider', 'Reject'],
    default: 'Consider',
  },
  aiAuthenticityScore: { type: Number },
  aiFlags: [{ type: String }],
  aiSuspiciousSegments: [
    {
      text: { type: String },
      reason: { type: String },
    },
  ],
  aiScore: { type: Number },
  skillMatch: { type: Number },
  experienceMatch: { type: Number },
  projectStrength: { type: Number },
  scoreBreakdown: {
    skills: { type: Number },
    experience: { type: Number },
    projects: { type: Number },
    education: { type: Number },
    certifications: { type: Number },
    availability: { type: Number },
    weighting: {
      skills: { type: Number },
      experience: { type: Number },
      projects: { type: Number },
      education: { type: Number },
      certifications: { type: Number },
      availability: { type: Number },
    },
    granularReasons: [
      {
        factor: { type: String },
        impact: { type: Number },
        reason: { type: String },
      },
    ],
  },
  jobFitConfidence: { type: Number, default: 0 },
  predictedGrowthPotential: { type: String, enum: ['High', 'Moderate', 'Limited'] },
  growthPotentialReasoning: { type: String },
  biasDetectionFlags: [{ type: String }],
  recruiterRecommendation: { type: String },
  decision: { type: String, enum: ['shortlisted', 'rejected', 'hired', 'in-interview'], default: null },
  decisionReason: { type: String },
  decisionMadeAt: { type: Date },
  decisionMadeBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IScreeningResult>('ScreeningResult', ScreeningResultSchema);
