import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface IExperience {
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or Present
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate?: string;
}

export interface IAvailability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate?: string;
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  [key: string]: string | undefined;
}

export interface IDocumentAuthenticity {
  score: number;           // 0 = human, 100 = AI-generated
  isAiGenerated: boolean;  // true if score >= 70
  flags: string[];
  suspiciousSegments: { text: string; reason: string }[];
  analyzedAt: Date;
}

export interface IDocument {
  fileName: string;
  fileType: string;
  category: 'cv' | 'cover_letter' | 'application_letter' | 'certificate' | 'diploma_degree' | 'id_passport' | 'portfolio' | 'other';
  extractedText: string;
  uploadedAt: Date;
  authenticity: IDocumentAuthenticity;
}

export interface IApplicant extends Document {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  
  skills: ISkill[];
  languages: ILanguage[];
  experience: IExperience[];
  education: IEducation[];
  certifications: ICertification[];
  projects: IProject[];
  availability: IAvailability;
  socialLinks: ISocialLinks;

  // Document uploads with AI authenticity analysis
  documents: IDocument[];
  documentAuthenticityStatus: 'clean' | 'suspicious' | 'flagged' | 'pending';

  // Preserved for intake logic
  name: string; 
  resumeText: string;
  resumeUrl?: string;
  source?: string;
  createdAt: Date;
}

const ApplicantSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
    description: { type: String, required: true },
    technologies: [{ type: String }],
    isCurrent: { type: Boolean, default: false }
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String }
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    role: { type: String, required: true },
    link: { type: String },
    startDate: { type: String, required: true },
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
    category: { type: String, enum: ['cv', 'cover_letter', 'application_letter', 'certificate', 'diploma_degree', 'id_passport', 'portfolio', 'other'], default: 'other' },
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

export default mongoose.model<IApplicant>('Applicant', ApplicantSchema);
