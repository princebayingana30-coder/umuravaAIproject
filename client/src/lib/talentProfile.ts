export type TalentAvailability = {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate?: string;
};

export type TalentExperience = {
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or Present
  description: string;
  technologies: string[];
  isCurrent: boolean;
};

export type TalentEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
};

export type TalentProject = {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate?: string;
};

export type TalentSocialLinks = {
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

export type TalentSkill = {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
};

export type TalentLanguage = {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
};

export type TalentBasicInfo = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
};

// -----------------------------
// STANDARDIZED: Umurava AI Hackathon Standard Talent Profile Schema
// -----------------------------
export type TalentProfileCandidate = {
  basicInfo: TalentBasicInfo;
  skills: TalentSkill[];
  languages: TalentLanguage[];
  experience: TalentExperience[];
  education: TalentEducation[];
  certifications?: { name: string; issuer: string; issueDate: string }[];
  projects: TalentProject[];
  availability: TalentAvailability;
  socialLinks: TalentSocialLinks;

  // AI-Powered Extensions
  aiProfileStrength?: number;
  marketRelevance?: string;
  improvementTips?: string[];
  id?: string;
  _id?: string;
};

export type ScreeningRequest = {
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    niceToHaveSkills?: string[];
    minYearsExperience?: number;
  };
  candidates: TalentProfileCandidate[];
};

export type IScreeningResult = {
  applicantId: string;
  jobId: string;
  score: number;
  aiScore: number;
  skillMatch: number;
  experienceMatch: number;
  projectStrength: number;
  rank: number;
  jobFitConfidence: number;
  predictedGrowthPotential: string;
  scoreBreakdown: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
  };
  strengths: string[];
  gaps: string[];
  biasDetectionFlags: string[];
  recruiterRecommendation: string;
  reasoning: string;
};

