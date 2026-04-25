'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Briefcase, FileText, Upload,
  CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck,
  ArrowRight, ArrowLeft, Sparkles, Loader2, FileWarning,
  FileCheck, Trash2, Plus, Eye, ChevronDown, ListEnd,
  Shield, GraduationCap, Award, X
} from 'lucide-react';
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

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  onSuccess?: () => void;
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

export default function AddCandidateModal({ isOpen, onClose, jobId = '', onSuccess }: AddCandidateModalProps) {
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
    jobId: jobId,
    skills: '',
  });

  const [jobs, setJobs] = useState<{ _id: string, title: string, company: string }[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      api.jobs.list().then(data => {
        if (Array.isArray(data)) {
          setJobs(data.filter(j => j.status !== 'closed'));
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  // Update jobId if it changes from props
  React.useEffect(() => {
    if (jobId) {
      setFormData(prev => ({ ...prev, jobId }));
    }
  }, [jobId]);

  const [cvFile, setCvFile] = useState<UploadedFile | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<UploadedFile | null>(null);
  const [applicationLetterFile, setApplicationLetterFile] = useState<UploadedFile | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<UploadedFile | null>(null);
  const [additionalFile, setAdditionalFile] = useState<UploadedFile | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const isStep1Valid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
  const isStep2Valid = !!cvFile;

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
        setCurrentStep(4);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError('Failed to submit candidate. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', headline: '', location: '', summary: '', jobId: jobId, skills: '' });
    setCvFile(null);
    setDiplomaFile(null);
    setApplicationLetterFile(null);
    setNationalIdFile(null);
    setAdditionalFile(null);
    setResult(null);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                  <UserPlusIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Candidate</h2>
                  <p className="text-slate-500 text-sm font-medium">Register and verify talent profile</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              {/* Step Indicator */}
              {currentStep <= 3 && (
                <div className="flex items-center gap-4 mb-10">
                  {steps.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-blue-600/10 border-blue-500/30 text-blue-600'
                            : isCompleted
                              ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
                          <span className="hidden sm:inline">{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-px ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* ─── STEP 1 ─── */}
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Job</label>
                        <div className="relative">
                          <select
                            value={formData.jobId}
                            onChange={e => updateField('jobId', e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer font-bold"
                          >
                            <option value="">General Application</option>
                            {jobs.map(job => (
                              <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name *</label>
                        <input type="text" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name *</label>
                        <input type="text" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email *</label>
                        <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</label>
                        <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-all font-medium" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP 2 ─── */}
                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'cv', label: 'Primary CV *', category: 'cv' as DocumentCategory },
                        { id: 'diploma', label: 'Academic Degree', category: 'diploma_degree' as DocumentCategory },
                        { id: 'app', label: 'Cover Letter', category: 'application_letter' as DocumentCategory },
                        { id: 'id', label: 'ID / Passport', category: 'id_passport' as DocumentCategory },
                      ].map(slot => {
                        const file = slot.category === 'cv' ? cvFile : slot.category === 'diploma_degree' ? diplomaFile : slot.category === 'application_letter' ? applicationLetterFile : nationalIdFile;
                        return (
                          <div key={slot.id} onClick={() => document.getElementById(`${slot.id}-modal-input`)?.click()} className={`p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${file ? 'border-emerald-500/30 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}>
                            <input id={`${slot.id}-modal-input`} type="file" className="hidden" onChange={handleFileSelect(slot.category)} />
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                              {file ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{slot.label}</p>
                              <p className="text-sm font-bold text-slate-900 truncate">{file ? file.file.name : 'Upload file'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP 3 ─── */}
                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-slate-900 font-medium">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Candidate:</span>
                        <span className="text-slate-900 font-black">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Email:</span>
                        <span className="text-slate-900 font-black">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Documents:</span>
                        <span className="text-slate-900 font-black">{[cvFile, diplomaFile, applicationLetterFile, nationalIdFile].filter(Boolean).length} Ready</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-700">
                      <Sparkles size={18} className="shrink-0" />
                      <p className="text-xs font-bold">Our Gemini AI will now verify document authenticity for potential AI-generated patterns.</p>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP 4 ─── */}
                {currentStep === 4 && result && (
                  <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className={`p-6 rounded-3xl border-2 ${result.documentAuthenticityStatus === 'flagged' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      <div className="flex items-center gap-4">
                        {result.documentAuthenticityStatus === 'flagged' ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tighter">{result.documentAuthenticityStatus === 'flagged' ? 'Caution Flagged' : 'Verified Successfully'}</h3>
                          <p className="text-sm font-bold opacity-80">{result.documentAuthenticityStatus === 'flagged' ? 'Potential AI-generated content detected.' : 'Documents verified as human-authored.'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {result.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <FileText className="text-slate-400" />
                            <span className="text-sm font-black text-slate-900">{doc.fileName}</span>
                          </div>
                          <div className={`text-xs font-black px-3 py-1 rounded-full ${doc.authenticity.score >= 70 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            SCORE: {doc.authenticity.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-4">
              {currentStep < 4 ? (
                <>
                  <button onClick={currentStep === 1 ? onClose : () => setCurrentStep(prev => prev - 1)} className="px-6 py-3 font-black text-slate-500 uppercase tracking-widest text-xs hover:text-slate-900 transition-colors">
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>
                  <button 
                    onClick={currentStep === 3 ? handleSubmit : () => setCurrentStep(prev => prev + 1)} 
                    disabled={currentStep === 1 && !isStep1Valid || currentStep === 2 && !isStep2Valid || isSubmitting}
                    className="flex-1 max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (currentStep === 3 ? 'Submit & Verify' : 'Next Step')}
                  </button>
                </>
              ) : (
                <button onClick={() => { resetForm(); onClose(); }} className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all">
                  Done & Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
    </svg>
  );
}
