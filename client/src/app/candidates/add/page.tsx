'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Briefcase, FileText, Upload,
  CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck,
  ArrowRight, ArrowLeft, Sparkles, Loader2, FileWarning,
  FileCheck, Trash2, Plus, Eye, ChevronDown, ListEnd,
  Shield, GraduationCap, Award
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/services/api';

/* ─── Types ─── */
type DocumentCategory = 'cv' | 'cover_letter' | 'application_letter' | 'certificate' | 'diploma_degree' | 'id_passport' | 'portfolio' | 'other';

interface UploadedFile {
  file: File;
  category: DocumentCategory;
  preview?: string;
}

interface DocumentResult {
  fileName: string;
  category: string;
  authenticity: {
    score: number;
    isAiGenerated: boolean;
    flags: string[];
    suspiciousSegments: { text: string; reason: string }[];
  };
}

interface SubmissionResult {
  _id: string;
  firstName: string;
  lastName: string;
  documents: DocumentResult[];
  documentAuthenticityStatus: string;
}

const categoryLabels: Record<DocumentCategory, string> = {
  cv: 'CV / Resume',
  cover_letter: 'Cover Letter',
  application_letter: 'Application Letter',
  certificate: 'Certificate',
  diploma_degree: 'Diploma or Degree',
  id_passport: 'ID or Passport',
  portfolio: 'Portfolio',
  other: 'Other Document',
};

const categoryIcons: Record<DocumentCategory, React.ReactNode> = {
  cv: <FileText className="w-4 h-4" />,
  cover_letter: <Mail className="w-4 h-4" />,
  application_letter: <FileText className="w-4 h-4" />,
  certificate: <Award className="w-4 h-4" />,
  diploma_degree: <GraduationCap className="w-4 h-4" />,
  id_passport: <Shield className="w-4 h-4" />,
  portfolio: <Briefcase className="w-4 h-4" />,
  other: <FileWarning className="w-4 h-4" />,
};

const steps = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Documents', icon: Upload },
  { id: 3, label: 'Review', icon: Eye },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getScoreBadge(score: number) {
  if (score >= 70) return { color: 'text-red-400 bg-red-500/15 border-red-500/30', label: '🔴 Flagged — AI-Generated', glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]' };
  if (score >= 50) return { color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', label: '🟡 Suspicious', glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]' };
  return { color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', label: '🟢 Clean — Human-Written', glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]' };
}

function getOverallBadge(status: string) {
  if (status === 'flagged') return { color: 'from-red-600 to-rose-600', icon: ShieldAlert, label: 'Fake Documents Detected', text: 'text-red-300' };
  if (status === 'suspicious') return { color: 'from-amber-600 to-orange-600', icon: AlertTriangle, label: 'Suspicious Documents', text: 'text-amber-300' };
  return { color: 'from-emerald-600 to-teal-600', icon: ShieldCheck, label: 'All Documents Verified', text: 'text-emerald-300' };
}

/* ─── PAGE ─── */
export default function AddCandidatePage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    headline: '',
    location: '',
    summary: '',
    jobId: '',
    skills: '',
  });

  const [jobs, setJobs] = useState<{ _id: string, title: string, company: string }[]>([]);

  React.useEffect(() => {
    api.jobs.list().then(data => {
      if (Array.isArray(data)) {
        // filter active jobs
        setJobs(data.filter(j => j.status !== 'closed'));
      }
    }).catch(console.error);
  }, []);

  const [cvFile, setCvFile] = useState<UploadedFile | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<UploadedFile | null>(null);
  const [applicationLetterFile, setApplicationLetterFile] = useState<UploadedFile | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<UploadedFile | null>(null);
  const [additionalFile, setAdditionalFile] = useState<UploadedFile | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /* ─── File handling ─── */
  const handleFileSelect = (category: DocumentCategory) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fileObj = { file: e.target.files[0], category };
    
    switch (category) {
      case 'cv': setCvFile(fileObj); break;
      case 'diploma_degree': setDiplomaFile(fileObj); break;
      case 'application_letter': setApplicationLetterFile(fileObj); break;
      case 'id_passport': setNationalIdFile(fileObj); break;
      case 'other': setAdditionalFile(fileObj); break;
    }
  };

  const removeFile = (category: DocumentCategory) => {
    switch (category) {
      case 'cv': setCvFile(null); break;
      case 'diploma_degree': setDiplomaFile(null); break;
      case 'application_letter': setApplicationLetterFile(null); break;
      case 'id_passport': setNationalIdFile(null); break;
      case 'other': setAdditionalFile(null); break;
    }
  };

  /* ─── Validation ─── */
  const isStep1Valid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
  const isStep2Valid = !!cvFile;

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('firstName', formData.firstName);
      fd.append('lastName', formData.lastName);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('headline', formData.headline);
      fd.append('location', formData.location);
      fd.append('summary', formData.summary);
      if (formData.jobId) fd.append('jobId', formData.jobId);
      if (formData.skills) fd.append('skills', formData.skills);

      const categories: Record<string, string> = {};
      const filesToUpload = [cvFile, diplomaFile, applicationLetterFile, nationalIdFile, additionalFile].filter((f): f is UploadedFile => f !== null);
      
      filesToUpload.forEach((f, i) => {
        fd.append('documents', f.file);
        categories[String(i)] = f.category;
      });
      
      fd.append('documentCategories', JSON.stringify(categories));

      const data = await api.applicants.addCandidate(fd);

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setCurrentStep(4); // Results step
      }
    } catch (err) {
      setError('Failed to submit candidate. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-cyber-gradient text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Add <span className="text-gradient">Candidate</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Register a new candidate with their documents. Our AI will automatically verify document authenticity.
          </p>
        </motion.div>

        {/* Step Indicator */}
        {currentStep <= 3 && (
          <div className="flex items-center gap-4 mb-12">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => { if (isCompleted) setCurrentStep(step.id); }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]'
                        : isCompleted
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/50 border-slate-200/50 text-slate-600'
                    }`}
                    disabled={!isCompleted && !isActive}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-100/50'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Basic Info ─── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-8">
                <User className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-500">Application Job (Where To)</label>
                  <div className="relative">
                    <select
                      value={formData.jobId}
                      onChange={e => updateField('jobId', e.target.value)}
                      className="w-full appearance-none bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- General Application (No specific role) --</option>
                      {jobs.map(job => (
                        <option key={job._id} value={job._id}>
                          {job.title} {job.company ? `at ${job.company}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="e.g. Kwame"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="e.g. Mensah"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="kwame@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="+250 788 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Professional Title</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={e => updateField('headline', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="e.g. Kigali, Rwanda"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <ListEnd className="w-4 h-4 text-slate-400" />
                  Skills
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => updateField('skills', e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. React, Node.js, Project Management (comma-separated)"
                />
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-sm font-bold text-slate-500">Professional Summary</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={e => updateField('summary', e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  placeholder="Brief description of experience and career goals..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    isStep1Valid
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-900 shadow-lg cursor-pointer'
                      : 'bg-slate-100/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Next: Upload Documents
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Upload Documents</h2>
              </div>
              <p className="text-slate-400 text-sm mb-8">
                Provide the candidate&apos;s CV and any supporting documents (certificates, cover letter).
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'cv', label: 'Primary CV / Resume *', category: 'cv' as DocumentCategory },
                  { id: 'diploma', label: 'Diploma / Degree', category: 'diploma_degree' as DocumentCategory },
                  { id: 'application', label: 'Application Letter', category: 'application_letter' as DocumentCategory },
                  { id: 'id', label: 'National ID / Passport', category: 'id_passport' as DocumentCategory },
                  { id: 'additional', label: 'Additional Document', category: 'other' as DocumentCategory },
                ].map((slot) => {
                  const file = slot.category === 'cv' ? cvFile : 
                              slot.category === 'diploma_degree' ? diplomaFile : 
                              slot.category === 'application_letter' ? applicationLetterFile : 
                              slot.category === 'id_passport' ? nationalIdFile :
                              additionalFile;
                  const Icon = categoryIcons[slot.category];
                  
                  return (
                    <div key={slot.id} className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-blue-400">{Icon}</span>
                        {slot.label}
                      </h3>
                      <div 
                        onClick={() => document.getElementById(`${slot.id}-input`)?.click()}
                        className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all group cursor-pointer h-[180px] flex flex-col items-center justify-center gap-3 ${
                          file 
                            ? 'border-emerald-500/30 bg-emerald-500/5' 
                            : 'border-slate-300/60 hover:border-blue-500/40 bg-white/30'
                        }`}
                      >
                        <input 
                          id={`${slot.id}-input`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileSelect(slot.category)}
                          className="hidden"
                        />
                        
                        {file ? (
                          <>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 px-4">
                              <p className="text-sm font-bold text-slate-900 truncate w-full">{file.file.name}</p>
                              <p className="text-xs text-slate-500 mt-1">{formatFileSize(file.file.size)}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFile(slot.category); }}
                              className="absolute top-3 right-3 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 transition-all">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Click to upload</p>
                              <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100/50 border border-slate-300/50 rounded-xl text-slate-500 hover:text-slate-900 font-bold transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStep2Valid}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    isStep2Valid
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-slate-900 shadow-lg cursor-pointer'
                      : 'bg-slate-100/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Review & Submit
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Review & Submit ─── */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-8">
                <Eye className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">Review & Submit</h2>
              </div>

              {/* Candidate Summary */}
              <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Candidate Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 font-bold block">Name</span>
                    <span className="text-slate-900">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Email</span>
                    <span className="text-slate-900">{formData.email}</span>
                  </div>
                  {formData.headline && (
                    <div>
                      <span className="text-slate-400 font-bold block">Title</span>
                      <span className="text-slate-900">{formData.headline}</span>
                    </div>
                  )}
                  {formData.location && (
                    <div>
                      <span className="text-slate-400 font-bold block">Location</span>
                      <span className="text-slate-900">{formData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-6 mb-10">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Documents to Analyze ({[cvFile, diplomaFile, applicationLetterFile, nationalIdFile, additionalFile].filter(Boolean).length})
                </h3>
                <div className="space-y-3">
                  {[
                    { file: cvFile, label: 'Primary CV / Resume', color: 'text-blue-400 bg-blue-500/10' },
                    { file: diplomaFile, label: 'Diploma / Degree', color: 'text-purple-400 bg-purple-500/10' },
                    { file: applicationLetterFile, label: 'Application Letter', color: 'text-emerald-400 bg-emerald-500/10' },
                    { file: nationalIdFile, label: 'National ID / Passport', color: 'text-indigo-400 bg-indigo-500/10' },
                    { file: additionalFile, label: 'Additional Document', color: 'text-slate-400 bg-slate-500/10' },
                  ].map((item, i) => item.file && (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="text-slate-500">{categoryIcons[item.file.category]}</div>
                      <span className="text-slate-900 font-medium flex-1 group-hover:text-blue-600 transition-all">
                        {item.file.file.name}
                      </span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-black tracking-wider ${item.color}`}>
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-600">{formatFileSize(item.file.file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Info Banner */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 mb-10 flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-bold">AI Authenticity Analysis</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Upon submission, each document will be analyzed by our Gemini AI to detect AI-generated content.
                    Documents scoring ≥70 will be flagged as potentially fake.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100/50 border border-slate-300/50 rounded-xl text-slate-500 hover:text-slate-900 font-bold transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-900 font-bold text-lg rounded-xl shadow-lg glow-blue transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Documents...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Submit & Analyze
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: Results ─── */}
          {currentStep === 4 && result && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Overall Status Card */}
              {(() => {
                const badge = getOverallBadge(result.documentAuthenticityStatus);
                const BadgeIcon = badge.icon;
                return (
                  <div className={`bg-gradient-to-r ${badge.color} rounded-[2rem] p-1 shadow-2xl`}>
                    <div className="bg-slate-50/90 rounded-[calc(2rem-4px)] p-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                        <BadgeIcon className={`w-10 h-10 ${badge.text}`} />
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Document Verification Result
                        </p>
                        <h2 className={`text-3xl font-black ${badge.text}`}>
                          {result.documentAuthenticityStatus === 'flagged' ? 'CAUTION: ' : ''}{badge.label}
                        </h2>
                        {result.documentAuthenticityStatus === 'flagged' && (
                          <p className="text-red-400 font-bold mt-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 inline-block">
                            Candidate&apos;s documents show high likelihood of being AI-generated or falsified. Proceed with extreme caution.
                          </p>
                        )}
                        <p className="text-slate-500 mt-2 text-sm">
                          Candidate: <span className="text-slate-900 font-bold">{result.firstName} {result.lastName}</span> •{' '}
                          {result.documents.length} document{result.documents.length > 1 ? 's' : ''} analyzed
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Per-Document Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Document Analysis Details</h3>
                {result.documents.map((doc, i) => {
                  const scoreBadge = getScoreBadge(doc.authenticity.score);
                  const isExpanded = expandedDoc === i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-glass-heavy border border-slate-200/50 rounded-2xl overflow-hidden ${scoreBadge.glow}`}
                    >
                      <button
                        onClick={() => setExpandedDoc(isExpanded ? null : i)}
                        className="w-full flex items-center gap-4 p-6 text-left"
                      >
                        <div className="w-12 h-12 bg-slate-100/80 rounded-xl flex items-center justify-center flex-shrink-0">
                          {doc.authenticity.isAiGenerated ? (
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                          ) : (
                            <FileCheck className="w-6 h-6 text-emerald-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-bold truncate">{doc.fileName}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {categoryLabels[doc.category as DocumentCategory] || doc.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Score Ring */}
                          <div className="relative w-14 h-14">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="28" cy="28" r="22" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                              <circle
                                cx="28" cy="28" r="22"
                                fill="transparent" stroke="currentColor" strokeWidth="4"
                                strokeDasharray={138}
                                strokeDashoffset={138 - (138 * doc.authenticity.score) / 100}
                                className={doc.authenticity.score >= 70 ? 'text-red-500' : doc.authenticity.score >= 50 ? 'text-amber-500' : 'text-emerald-500'}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900">
                              {doc.authenticity.score}
                            </span>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${scoreBadge.color}`}>
                            {scoreBadge.label}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-200/50"
                          >
                            <div className="p-6 space-y-4">
                              {doc.authenticity.flags.length > 0 && (
                                <div>
                                  <p className="text-sm font-bold text-slate-500 mb-2">Detection Flags</p>
                                  <div className="space-y-2">
                                    {doc.authenticity.flags.map((flag, fi) => (
                                      <div key={fi} className="flex items-start gap-2 text-sm">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-600">{flag}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {doc.authenticity.suspiciousSegments.length > 0 && (
                                <div>
                                  <p className="text-sm font-bold text-slate-500 mb-2">Suspicious Segments</p>
                                  <div className="space-y-3">
                                    {doc.authenticity.suspiciousSegments.map((seg, si) => (
                                      <div key={si} className="bg-white/50 border border-slate-200/40 rounded-lg p-3">
                                        <p className="text-amber-300 text-xs font-bold mb-1">{seg.reason}</p>
                                        <p className="text-slate-500 text-sm italic">&ldquo;{seg.text}&rdquo;</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {doc.authenticity.flags.length === 0 && doc.authenticity.suspiciousSegments.length === 0 && (
                                <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4" />
                                  No suspicious patterns detected. This document appears to be human-written.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-900 font-bold rounded-xl shadow-lg transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({ firstName: '', lastName: '', email: '', phone: '', headline: '', location: '', summary: '', jobId: '', skills: '' });
                    setCvFile(null);
                    setDiplomaFile(null);
                    setApplicationLetterFile(null);
                    setNationalIdFile(null);
                    setAdditionalFile(null);
                    setResult(null);
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-glass border border-slate-300/50 text-slate-600 hover:text-slate-900 font-bold rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Candidate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
