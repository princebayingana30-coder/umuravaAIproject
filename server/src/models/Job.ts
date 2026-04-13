import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  weights?: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
  };
  createdAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  experience: { type: String },
  weights: {
    skills: { type: Number, default: 35 },
    experience: { type: Number, default: 25 },
    projects: { type: Number, default: 20 },
    education: { type: Number, default: 10 },
    certifications: { type: Number, default: 5 },
    availability: { type: Number, default: 5 },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJob>('Job', JobSchema);
