'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, User, Users, CheckCircle, AlertTriangle, 
  TrendingUp, Award, Zap, Loader2, ChevronRight, Info, Scale, X, Target, Trash2,
  ShieldCheck, ShieldAlert, Sparkles, FileWarning, Plus
} from 'lucide-react';
import AddCandidateModal from '@/components/candidate/AddCandidateModal';

interface Job {
  _id: string;
  title: string;
  company?: string;
}

interface ScreeningResult {
  _id: string;
  rank: number;
  aiScore: number;
  recommendation?: string;
  jobFitConfidence: number;
  predictedGrowthPotential: number;
  biasDetectionFlags?: string[];
  decision?: string;
  growthPotentialReasoning?: string;
  reasoning?: string;
  skillMatch?: number;
  experienceMatch?: number;
  projectStrength?: number;
  strengths: string[];
  gaps: string[];
  recruiterRecommendation?: string;
  applicantId: {
    _id: string;
    name: string;
    headline: string;
    documentAuthenticityStatus?: 'pending' | 'flagged' | 'suspicious' | 'clean';
  };
}

export default function ScreeningPage() {
  const { jobId } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ScreeningResult | null>(null);
  const [updatingDecision, setUpdatingDecision] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const [jobData, screeningData] = await Promise.all([
        api.jobs.get(jobId as string),
        api.screening.getResults(jobId as string)
      ]);
      setJob(jobData);
      setResults(screeningData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDecision = async (decision: string, reason: string) => {
    if (!selectedCandidate) return;
    try {
      setUpdatingDecision(true);
      const updated = await api.screening.updateDecision(selectedCandidate._id, decision, reason);
      setSelectedCandidate(updated);
      const updatedResults = results.map(r => r._id === updated._id ? updated : r);
      setResults(updatedResults);
    } catch (error) {
      console.error('Failed to update decision:', error);
    } finally {
      setUpdatingDecision(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', e.target.files[0]);
    formData.append('name', e.target.files[0].name.split('.')[0]);

    try {
      const resp = await api.applicants.upload(formData);
      const applicantIds: string[] = Array.isArray(resp?.applicants)
        ? resp.applicants.map((a: Record<string, unknown>) => a._id as string)
        : resp?._id
          ? [resp._id]
          : [];

      if (applicantIds.length === 0) {
        throw new Error('No applicants created from upload');
      }

      setScreening(true);
      await api.screening.run(jobId as string, applicantIds);
      await fetchData();
    } catch (error) {
      console.error('Upload/Screening Error:', error);
    } finally {
      setUploading(false);
      setScreening(false);
    }
  };

  const handleDeleteCandidate = async (resultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await api.screening.deleteResult(resultId);
      setResults(prev => prev.filter(r => r._id !== resultId));
      if (selectedCandidate?._id === resultId) setSelectedCandidate(null);
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      alert('Failed to remove candidate');
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : (prev.length < 3 ? [...prev, id] : prev)
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="text-blue-500 mb-6" size={64} />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Aggregating Insights</h2>
        <p className="text-slate-400">Retrieving multi-factor AI evaluations...</p>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => a.rank - b.rank);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
            <Zap size={12} />
            AI Screening Active
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            {job?.title} <span className="text-slate-500">/ Results</span>
          </h1>
          <p className="text-slate-600 max-w-xl text-lg font-medium">
            Our AI has processed <span className="text-blue-600 font-bold">{results.length} candidates</span> against your requirements. 
            View the shortlist and explainable rankings below.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {compareList.length > 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 border border-indigo-400/30"
            >
              <Scale size={18} />
              Compare ({compareList.length})
            </motion.button>
          )}

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600/20 px-6 py-3 rounded-xl shadow-sm transition-all group font-bold text-sm"
          >
            <Plus size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
            Add Candidates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Candidates List */}
        <div className="lg:col-span-8 space-y-6">
          {screening && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-blue-600/5 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-6"
            >
              <div className="absolute top-0 right-0 w-32 h-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Sparkles size={24} className="text-slate-900" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-white">Advanced Screening in Progress</p>
                <p className="text-slate-400">Gemini is extracting data, analyzing skills, and calculating weighted match scores.</p>
              </div>
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </motion.div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {sortedResults.map((result, idx) => (
                <motion.div 
                  key={result._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCandidate(result)}
                  className={`group relative p-6 rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden ${
                    selectedCandidate?._id === result._id 
                      ? 'bg-blue-50/90 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' 
                      : 'bg-white/80 border-slate-200 hover:border-blue-300 hover:bg-white/95 backdrop-blur-md shadow-sm'
                  }`}
                >
                  {result.rank === 1 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500/30 to-transparent pl-24 pr-8 py-3">
                       <div className="flex items-center gap-2 text-emerald-400 font-black text-[11px] uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                         <Award size={16} className="animate-pulse" />
                         Elite Match
                       </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-18 h-18 bg-slate-700 rounded-2xl flex items-center justify-center border border-slate-600 text-white text-3xl font-black shadow-inner">
                          {result.applicantId.name[0]}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-900 shadow-lg ${
                           result.rank === 1 ? 'bg-emerald-500 text-slate-900' : 'bg-blue-600 text-slate-900'
                        }`}>
                          #{result.rank}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-blue-950 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {result.applicantId.name}
                          </h3>
                          {result.recommendation === 'Strong Hire' && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-[0.1em] shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                              Strong Hire
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm font-bold tracking-tight">{result.applicantId.headline || 'Product Manager'}</p>
                        {/* Document Authenticity Badge */}
                        {result.applicantId.documentAuthenticityStatus && result.applicantId.documentAuthenticityStatus !== 'pending' && (
                          <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                            result.applicantId.documentAuthenticityStatus === 'flagged'
                              ? 'text-red-400 bg-red-500/10 border-red-500/20'
                              : result.applicantId.documentAuthenticityStatus === 'suspicious'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          }`}>
                            {result.applicantId.documentAuthenticityStatus === 'flagged' && <><ShieldAlert size={12} /> Fake Docs Detected</>}
                            {result.applicantId.documentAuthenticityStatus === 'suspicious' && <><FileWarning size={12} /> Docs Suspicious</>}
                            {result.applicantId.documentAuthenticityStatus === 'clean' && <><ShieldCheck size={12} /> Docs Verified</>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">AI Match Score</div>
                        <div className={`text-5xl font-black italic tracking-tighter ${
                          result.aiScore >= 80 ? 'text-emerald-600' : 
                          result.aiScore >= 60 ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                          {result.aiScore}%
                        </div>
                      </div>
                      
                      <div className="w-px h-12 bg-slate-600" />
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => toggleCompare(result._id, e)}
                          title="Compare"
                          className={`p-3 rounded-xl border transition-all ${
                              compareList.includes(result._id)
                              ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                              : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Scale size={20} />
                        </button>

                        <button 
                          onClick={(e) => handleDeleteCandidate(result._id, e)}
                          title="Remove Candidate"
                          className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <ChevronRight className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-700/60 pt-6">
                    <div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">AI Deep Analysis</div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10">
                          <Target size={10} />
                          FIT: {result.jobFitConfidence}%
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 bg-purple-500/5 px-2.5 py-1.5 rounded-lg border border-purple-500/10">
                          <TrendingUp size={10} />
                          GROWTH: {result.predictedGrowthPotential}%
                        </div>
                        {result.biasDetectionFlags && result.biasDetectionFlags.length === 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                             <ShieldCheck size={10} />
                             BIAS-FREE
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>AI Confidence Index</span>
                        <span className="text-blue-600 font-bold">
                           {result.jobFitConfidence}% MATCH STABILITY
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.jobFitConfidence}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Explainability Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              {selectedCandidate ? (
                <motion.div 
                  key={selectedCandidate._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 border border-slate-200 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                      <Zap className="text-blue-600" />
                      AI Decision Matrix
                    </h2>
                    <div className="text-3xl font-black text-slate-900 italic opacity-20">#{selectedCandidate.rank}</div>
                  </div>

                  <div className="space-y-10 relative z-10">
                    <section>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Pipeline Status</div>
                       <div className="grid grid-cols-2 gap-3">
                          {['shortlisted', 'in-interview', 'hired', 'rejected'].map(dec => (
                            <button
                              key={dec}
                              onClick={() => handleDecision(dec, 'Updated via dashboard')}
                              disabled={updatingDecision}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                selectedCandidate.decision === dec
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                              } disabled:opacity-50`}
                            >
                              {dec === 'in-interview' ? 'Interview' : dec}
                            </button>
                          ))}
                       </div>
                    </section>

                    <section className="bg-slate-100/30 p-6 rounded-3xl border border-slate-200/50 relative overflow-hidden">
                       <div className="absolute -right-8 -bottom-8 opacity-5">
                          <TrendingUp size={120} />
                       </div>
                       <div className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <TrendingUp size={14} />
                         Growth Potential: {selectedCandidate.predictedGrowthPotential}%
                       </div>
                       <p className="text-slate-700 text-sm leading-relaxed font-bold mb-4">
                         {selectedCandidate.growthPotentialReasoning || selectedCandidate.reasoning}
                       </p>
                       <div className="flex items-center gap-2 text-xs text-blue-600 font-bold italic">
                          <Info size={14} />
                          Fit Confidence: {selectedCandidate.jobFitConfidence}%
                       </div>
                    </section>

                    {selectedCandidate.biasDetectionFlags && selectedCandidate.biasDetectionFlags.length > 0 && (
                      <section className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <ShieldAlert size={14} />
                          AI Fairness Warning
                        </div>
                        <div className="space-y-2">
                          {selectedCandidate.biasDetectionFlags.map((flag: string, i: number) => (
                            <div key={i} className="text-xs text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/10 flex items-start gap-2">
                               <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                               {flag}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Explainable Breakdown</div>
                      <div className="space-y-4">
                        {[
                          { label: 'Skills Match', key: 'skillMatch' },
                          { label: 'Experience Match', key: 'experienceMatch' },
                          { label: 'Project Strength', key: 'projectStrength' }
                        ].map((factor) => {
                          const score = Number(selectedCandidate[factor.key as keyof ScreeningResult] || 0);
                          
                          return (
                            <div key={factor.key} className="space-y-2 group">
                              <div className="flex justify-between items-center text-[10px] font-black">
                                 <span className="text-slate-900 uppercase tracking-widest">{factor.label}</span>
                                 <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{score}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <div className="pt-6 border-t border-slate-700/60">
                       <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group">
                          Generate AI Interview Guide
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/60 border-2 border-slate-200 border-dashed rounded-[3rem] p-16 text-center text-slate-600 transition-all hover:border-blue-400/50 backdrop-blur-sm">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <User className="mx-auto mb-6 text-slate-300" size={80} />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Select Candidate</h3>
                  <p className="text-sm font-medium opacity-80">Explore deep-dive AI evaluation matrix and potential growth trajectory.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-[3rem] w-full max-w-7xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 backdrop-blur-md">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Talent Matrix Comparison</h2>
                  <p className="text-slate-400">Side-by-side behavioral alignment and technical match stability.</p>
                </div>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="p-4 bg-slate-700 text-slate-300 rounded-full hover:bg-slate-600 hover:text-white transition-all"
                >
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-x-auto p-12 custom-scrollbar">
                <div className="flex gap-8 min-w-max">
                  {results.filter(r => compareList.includes(r._id)).map((candidate, idx) => (
                    <div key={candidate._id} className="w-[380px] space-y-10 border-r border-slate-700/50 pr-8 last:border-0 last:pr-0">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                             {candidate.applicantId.name[0]}
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">{candidate.applicantId.name}</h4>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10 uppercase tracking-widest">RANK #{candidate.rank}</span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{candidate.aiScore}% MATCH</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="bg-slate-800/50 p-6 rounded-3xl border border-blue-500/20">
                             <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic flex items-center gap-2">
                                <Target size={14} />
                                Match Analysis
                             </div>
                             <p className="text-xs text-slate-300 leading-relaxed font-medium">Fit Confidence: {candidate.jobFitConfidence}%</p>
                             <p className="text-xs text-slate-400 leading-relaxed italic mt-2">&quot;{candidate.recruiterRecommendation || candidate.reasoning?.substring(0, 100)}...&quot;</p>
                          </div>

                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Strengths</div>
                            <div className="space-y-2">
                               {candidate.strengths.slice(0, 4).map((s: string, i: number) => (
                                 <div key={i} className="text-xs text-slate-300 py-2 px-3 bg-slate-700/40 rounded-xl border border-slate-600/50 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                    {s}
                                 </div>
                               ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identified Gaps</div>
                            <div className="space-y-2">
                               {candidate.gaps.slice(0, 3).map((g: string, i: number) => (
                                 <div key={i} className="text-xs text-slate-400 py-2 px-3 bg-slate-700/30 rounded-xl border border-slate-600/30 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
                                    {g}
                                 </div>
                               ))}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weighted Pulse</div>
                             {[
                               { label: 'Skills', key: 'skillMatch' },
                               { label: 'Experience', key: 'experienceMatch' },
                               { label: 'Projects', key: 'projectStrength' }
                           ].map(factor => {
                             const score = Number(candidate[factor.key as keyof ScreeningResult] || 0);
                             return (
                               <div key={factor.key} className="space-y-1.5">
                                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                     <span>{factor.label}</span>
                                     <span>{score}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700/60 rounded-full h-1 overflow-hidden">
                                     <div className="h-full bg-blue-500" style={{ width: `${score}%` }} />
                                  </div>
                               </div>
                             );
                           })}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AddCandidateModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        jobId={jobId as string}
        onSuccess={() => {
          fetchData(); // Refresh the list after adding
        }}
      />
    </div>
  );
}

