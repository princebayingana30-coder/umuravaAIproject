'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, Users, CheckCircle, Zap, Plus, Loader2, Target, TrendingUp, ShieldCheck, Sparkles, ArrowRight, Trash2 } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import Link from 'next/link';
import { fetchJobs } from '@/store/slices/jobsSlice';
import { RootState, AppDispatch } from '@/store';
import { api } from '@/services/api';
import { animate, motion, useMotionValue } from 'framer-motion';
import DashboardBackground from '@/components/ui/DashboardBackground';

interface JobData {
  jobId: string;
  title: string;
  totalCandidates: number;
  decisions: {
    shortlisted: number;
    hired: number;
  };
  averageScore: number;
}

interface AnalyticsData {
  dashboard: {
    totalPositions: number;
    totalCandidatesScreened: number;
    totalHired: number;
    averageHiringRate: number;
    biasFreeMetrics?: {
      genderBalance: { male: number; female: number };
      locationDiversity: number;
      fairnessScore: number;
    };
    marketRelevanceScore?: number;
  };
  jobs: JobData[];
  topPerformers: {
    id: string;
    name: string;
    score: number;
    jobTitle: string;
    fitConfidence: number;
  }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const extractNumber = (value: string | number) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value.toString().replace('%', ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

function useCountUp(target: number, duration: number = 2) {
  const [current, setCurrent] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, target, {
      duration,
      ease: [0.25, 0.1, 0.25, 1] as const,
      onUpdate(latest) {
        setCurrent(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [motionValue, target, duration]);

  return current;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchJobs());
    loadAnalytics();
  }, [dispatch]);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await api.screening.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.jobs.delete(jobId);
      loadAnalytics(); // Refresh
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  useEffect(() => {
    dispatch(fetchJobs());
    loadAnalytics();
  }, [dispatch]);

  const metrics = useMemo(() => {
    if (!analytics) {
      return {
        activeJobs: jobs.length,
        totalApplicants: '—',
        hired: '—',
        hiringRate: '—',
      };
    }
    return {
      activeJobs: analytics.dashboard.totalPositions,
      totalApplicants: analytics.dashboard.totalCandidatesScreened,
      hired: analytics.dashboard.totalHired,
      hiringRate: `${analytics.dashboard.averageHiringRate}%`,
    };
  }, [jobs, analytics]);

  const animatedActiveJobs = useCountUp(extractNumber(metrics.activeJobs));
  const animatedTotalApplicants = useCountUp(extractNumber(metrics.totalApplicants));
  const animatedHired = useCountUp(extractNumber(metrics.hired));
  const animatedHiringRate = useCountUp(extractNumber(metrics.hiringRate));

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10">
      <DashboardBackground />
      <div className="relative z-10 p-2 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12"
      >
        <div>
          <div className="relative inline-flex flex-col gap-4">
            <motion.h1
              className="text-4xl md:text-5xl font-black mb-2 text-slate-900"
            >
              Recruiter <span className="text-blue-600">Intelligence</span>
            </motion.h1>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '4rem' }}
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
          <p className="text-slate-400 mt-2 text-lg">AI-powered decision matrix for top-tier recruitment.</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAnalytics}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 px-5 py-3 rounded-2xl transition-all border border-slate-600/50 backdrop-blur-xl"
          >
            <Zap size={18} className="text-blue-400" />
            Sync AI
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/jobs/new" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 backdrop-blur-sm">
              <Plus size={18} />
              Open Position
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div variants={itemVariants}>
            <MetricCard title="Talent Pools" value={animatedActiveJobs} change={`${jobs.length} roles`} icon={Briefcase} color="text-blue-400" />
        </motion.div>
        <motion.div variants={itemVariants}>
            <MetricCard title="AI Screened" value={animatedTotalApplicants} change="Bias-free audits" icon={Users} color="text-purple-400" />
        </motion.div>
        <motion.div variants={itemVariants}>
            <MetricCard title="Strong Hires" value={animatedHired} change="Match verified" icon={CheckCircle} color="text-emerald-400" />
        </motion.div>
        <motion.div variants={itemVariants}>
            <MetricCard title="Predictive Accuracy" value={`${animatedHiringRate}%`} change="Confidence score" icon={ShieldCheck} color="text-cyan-400" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target size={24} className="text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Active Pipelines</h2>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.jobs.map((job) => (
                  <Link key={job.jobId} href={`/screening/${job.jobId}`}>
                    <div className="group relative bg-white/60 hover:bg-white/90 p-6 rounded-3xl border border-slate-200 hover:border-blue-500/40 transition-all shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center border border-blue-400/30 group-hover:border-blue-400/60 text-slate-900 text-2xl font-black shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            {job.title[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{job.title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                               <span className="text-slate-600 text-sm font-bold opacity-90">{job.totalCandidates} Candidates Screened</span>
                               <span className="w-1 h-1 bg-slate-400 rounded-full" />
                               <span className="text-emerald-600 text-sm font-black">{job.decisions.shortlisted} Shortlisted</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Avg Score</p>
                              <p className="text-blue-400 font-black text-lg">{Math.round(job.averageScore)}%</p>
                            </div>
                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Confidence</p>
                              <p className="text-purple-400 font-black text-lg">94%</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteJob(job.jobId, e)}
                            className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            title="Delete Job"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                <Sparkles className="text-emerald-400 w-5 h-5" />
                Fairness Audit
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm font-medium">Evaluation Fairness</span>
                  <span className="text-emerald-400 font-black text-lg">98.4%</span>
                </div>
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 w-[98.4%]" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-700/40 p-4 rounded-2xl border border-slate-600/50">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Diversity Index</p>
                    <p className="text-xl font-black text-white">12 Locations</p>
                  </div>
                  <div className="flex-1 bg-slate-700/40 p-4 rounded-2xl border border-slate-600/50">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Gap Detection</p>
                    <p className="text-xl font-black text-white">None Found</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
              <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                Talent Marketplace
              </h3>
              <div className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your hiring speed is <span className="text-blue-400 font-bold">14% faster</span> than the industry average for similar roles.
                </p>
                <div className="pt-4 border-t border-slate-600/50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Suggested Skills to Hire</p>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'Go', 'Kubernetes', 'LLMs', 'UI/UX'].map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 p-8 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <Zap size={24} className="text-blue-400" />
              <h2 className="text-2xl font-black text-black">Top Performers</h2>
            </div>
            
            {analyticsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-700/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.topPerformers.map((performer, idx) => (
                  <motion.div 
                    key={performer.id || idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 bg-white/70 border border-slate-200 rounded-2xl hover:border-blue-400/60 hover:bg-white/90 transition-all group backdrop-blur-xl shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-black text-blue-950 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{performer.name}</h4>
                      <span className="text-2xl font-black text-blue-700">{performer.score}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-black uppercase tracking-tighter truncate max-w-[150px] opacity-70">{performer.jobTitle}</span>
                      <span className="text-emerald-400 font-black bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">FIT: {performer.fitConfidence}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <button className="w-full mt-8 py-4 bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 font-bold rounded-2xl border border-slate-600/50 flex items-center justify-center gap-2 transition-all hover:text-white">
              See All Candidates
              <ArrowRight size={16} />
            </button>
          </motion.section>
        </div>
      </div>
      </div>
    </div>
  );
}
