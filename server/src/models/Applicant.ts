import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicant extends Document {
  name: string;
  email: string;
  resumeText: string;
  resumeUrl?: string;
  source?: string;
  createdAt: Date;
}

const ApplicantSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  resumeText: { type: String, required: true },
  resumeUrl: { type: String },
  source: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IApplicant>('Applicant', ApplicantSchema);
