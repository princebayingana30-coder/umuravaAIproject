'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { createJob } from '@/store/slices/jobsSlice';
import { AppDispatch } from '@/store';
import { Save, ArrowLeft, Plus, X, Briefcase, FileText, CheckCircle, Upload, Database, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewJobPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [ingestionMode, setIngestionMode] = useState<'sample' | 'files' | 'none'>('none');
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    experience: '',
    requirements: [''],
    skills: [''],
  });

  const handleAddField = (field: 'requirements' | 'skills') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const handleRemoveField = (field: 'requirements' | 'skills', index: number) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const handleFieldChange = (field: 'requirements' | 'skills', index: number, value: string) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setIngestionMode('files');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the Job
      const job = await dispatch(createJob(formData)).unwrap();
      const jobId = job._id;

      let applicantIds: string[] = [];

      // 2. Ingest Candidates
      if (ingestionMode === 'sample') {
        const resp = await api.applicants.ingestSample();
        applicantIds = resp.applicants.map((a: { _id: string }) => a._id);
      } else if (ingestionMode === 'files' && files.length > 0) {
        // Upload each file and collect IDs
        const uploads = await Promise.all(
          files.map(async (file) => {
            const fd = new FormData();
            fd.append('resume', file);
            fd.append('name', file.name.split('.')[0]);
            return api.applicants.upload(fd);
          })
        );
        applicantIds = uploads.flatMap((res) => 
          Array.isArray(res.applicants) ? res.applicants.map((a: { _id: string }) => a._id) : [res._id]
        );
      }

      // 3. Trigger Screening if we have candidates
      if (applicantIds.length > 0) {
        await api.screening.run(jobId, applicantIds);
      }

      // 4. Redirect to screening page
      router.push(`/screening/${jobId}`);
    } catch (error) {
      console.error('Failed to create job or ingest candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">Create Job & Screen</h1>
        <p className="text-slate-500">Post a new position and optionally load candidates for immediate AI screening.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase size={14} className="text-blue-500" />
                Position Title
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Senior Product Designer"
                className="w-full bg-slate-100/50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-500" />
                Experience Range
              </label>
              <input 
                type="text" 
                placeholder="e.g. 4-7 years"
                className="w-full bg-slate-100/50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              Role Description
            </label>
            <textarea 
              required
              rows={4}
              placeholder="What are the key goals and responsibilities for this role?"
              className="w-full bg-slate-100/50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none placeholder:text-slate-600"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Core Requirements</label>
              {formData.requirements.map((req, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Must have..."
                    className="flex-1 bg-slate-100/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={req}
                    onChange={(e) => handleFieldChange('requirements', idx, e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveField('requirements', idx)}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => handleAddField('requirements')}
                className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2 mt-2 px-1"
              >
                <Plus size={16} />
                Add Requirement
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Essential Skills</label>
              {formData.skills.map((skill, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Python, Figma, etc."
                    className="flex-1 bg-slate-100/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={skill}
                    onChange={(e) => handleFieldChange('skills', idx, e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveField('skills', idx)}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => handleAddField('skills')}
                className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2 mt-2 px-1"
              >
                <Plus size={16} />
                Add Skill
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Sparkles className="text-blue-400" size={24} />
              Candidate Ingestion
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setIngestionMode('sample')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-4 ${
                  ingestionMode === 'sample' 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-100/30 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <Database size={32} />
                <div className="text-center">
                  <p className="font-bold text-sm">Sample Dataset</p>
                  <p className="text-[10px] uppercase opacity-70">Provided Candidates</p>
                </div>
              </button>

              <label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-4 cursor-pointer ${
                  ingestionMode === 'files' 
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                    : 'bg-slate-100/30 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                <Upload size={32} />
                <div className="text-center">
                  <p className="font-bold text-sm">{files.length > 0 ? `${files.length} Files Selected` : 'Upload Resumes'}</p>
                  <p className="text-[10px] uppercase opacity-70">PDF, CSV, or EXCEL</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept=".pdf,.csv,.xlsx,.xls,.json"
                  onChange={handleFileChange}
                />
              </label>

              <button
                type="button"
                onClick={() => { setIngestionMode('none'); setFiles([]); }}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-4 ${
                  ingestionMode === 'none' 
                    ? 'bg-slate-200/20 border-slate-600 text-slate-600' 
                    : 'bg-slate-100/30 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <Plus size={32} />
                <div className="text-center">
                  <p className="font-bold text-sm">Create Empty</p>
                  <p className="text-[10px] uppercase opacity-70">Add later</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-6 items-center">
          <button 
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-900 font-bold transition-colors"
          >
            Cancel
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 min-w-[240px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Save size={20} />
                <span className="font-bold uppercase tracking-widest text-sm">Launch Position</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/40 relative"
              >
                <Sparkles size={48} className="text-slate-900" />
                <div className="absolute inset-0 border-4 border-white/20 rounded-3xl animate-ping" />
              </motion.div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">AI AGENT ACTIVATED</h2>
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">Analyzing job requirements and mapping against candidate pool...</p>
                <div className="flex flex-col gap-2">
                  <ProgressStep text="Ingesting candidates from source" active />
                  <ProgressStep text="Running Gemini AI Screening" active={false} />
                  <ProgressStep text="Generating Rank & Shortlist" active={false} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressStep({ text, active }: { text: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-white border-slate-200 text-slate-600'}`}>
      {active ? <Loader2 size={16} className="animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
      <span className="text-xs font-bold uppercase tracking-wider">{text}</span>
    </div>
  );
}

