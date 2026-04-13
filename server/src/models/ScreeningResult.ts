import mongoose, { Schema, Document } from 'mongoose';

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  aiAuthenticityScore: number;
  aiFlags: string[];
  aiSuspiciousSegments: { text: string; reason: string }[];
  scoreBreakdown?: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
    weighting: { skills: number; experience: number; projects: number; education: number; certifications: number; availability: number };
  };
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
  recommendation: { type: String },
  aiAuthenticityScore: { type: Number },
  aiFlags: [{ type: String }],
  aiSuspiciousSegments: [
    {
      text: { type: String },
      reason: { type: String },
    },
  ],
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
  },
  decision: { type: String, enum: ['shortlisted', 'rejected', 'hired', 'in-interview'], default: null },
  decisionReason: { type: String },
  decisionMadeAt: { type: Date },
  decisionMadeBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IScreeningResult>('ScreeningResult', ScreeningResultSchema);
