'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Zap, Sparkles, ArrowRight, Network, FileSearch,
  BarChart3, Users, ChevronRight, TrendingUp,
  UserCheck
} from 'lucide-react';
import AnimatedPeopleBackground from '@/components/layout/AnimatedPeopleBackground';

/* ─── AI Features Data ─── */
const aiFunctions = [
  {
    id: 'resume-parsing', icon: FileSearch, title: 'AI Talent Profile Parsing',
    subtitle: 'Extract · Understand · Structure',
    description: 'Our Gemini-powered engine transforms raw PDF resumes into structured Talent Profiles. It accurately maps experience timelines, skill levels, and project relevance into our mandatory 8-field schema.',
    color: 'from-blue-600 to-cyan-400', accent: 'blue',
    stats: [{ label: 'Fields Mapped', value: '40+' }, { label: 'Accuracy', value: '98%' }, { label: 'Speed', value: '<2s' }],
  },
  {
    id: 'weighted-scoring', icon: BarChart3, title: 'Weighted Match Engine',
    subtitle: 'Skills · Experience · Projects',
    description: 'Candidates are scored with extreme precision across 6 weighted dimensions. Recruiters get a transparent breakdown of why a candidate scored 87% vs 72% based on real data.',
    color: 'from-indigo-600 to-blue-500', accent: 'indigo',
    stats: [{ label: 'Scoring Factors', value: '6' }, { label: 'Transparency', value: '100%' }, { label: 'Bias-Free', value: 'Verified' }],
  },
  {
    id: 'growth-potential', icon: TrendingUp, title: 'Predicted Growth Analysis',
    subtitle: 'Future Fit · Potential · Skill Gaps',
    description: 'Go beyond the resume. Our AI predicts a candidate\'s growth potential and identifies specific skill gaps, helping you hire for where your team is going, not just where it is.',
    color: 'from-cyan-500 to-teal-400', accent: 'cyan',
    stats: [{ label: 'Insights/Profile', value: '12+' }, { label: 'Growth Rating', value: 'Active' }, { label: 'Confidence', value: 'High' }],
  },
  {
    id: 'explainable-rankings', icon: Network, title: 'Explainable AI Decisioning',
    subtitle: 'Why this candidate? · Strengths · Gaps',
    description: 'Eliminate the black box. Every ranking includes granular reasons for score boosts and penalties, plus a direct recruiter recommendation for next steps.',
    color: 'from-purple-600 to-indigo-500', accent: 'purple',
    stats: [{ label: 'Reasoning Depth', value: 'Detailed' }, { label: 'Explainability', value: 'Total' }, { label: 'Confidence', value: '0–100' }],
  },
  {
    id: 'bias-detection', icon: UserCheck, title: 'AI Bias Mitigation',
    subtitle: 'Fair Hiring · Merit-First · Audit',
    description: 'Our system performs a real-time self-audit for hiring bias, ensuring evaluations are strictly based on skills and merit, flagging potential favors for elite institutions or specific keywords.',
    color: 'from-emerald-600 to-teal-500', accent: 'emerald',
    stats: [{ label: 'Bias Signals', value: 'Active' }, { label: 'Fairness Score', value: 'Audited' }, { label: 'Audit Log', value: 'Ready' }],
  },
];

const ROTATION_INTERVAL = 5000;

function ProgressBar({ duration, isActive }: { duration: number; isActive: boolean }) {
  return (
    <div className="w-full h-1 bg-white rounded-full overflow-hidden">
      {isActive && (
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
          initial={{ width: '0%' }} animate={{ width: '100%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }} />
      )}
    </div>
  );
}

/* ─── HOME PAGE ─── */
export default function Home() {
  const router = useRouter();
  const [activeFunction, setActiveFunction] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setActiveFunction((p) => (p + 1) % aiFunctions.length), ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleAccessApp = useCallback(() => router.push('/login'), [router]);

  const currentFn = aiFunctions[activeFunction];
  const IconComponent = currentFn.icon;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-cyber-gradient text-slate-900">
      <AnimatedPeopleBackground />

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <motion.div className="relative z-10 text-center max-w-5xl mx-auto w-full"
          variants={containerVariants} initial="hidden" animate="show">

          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-glass border border-blue-500/30 rounded-full px-5 py-2 glow-blue">
              <Sparkles className="w-4 h-4 text-accent-blue animate-pulse" />
              <span className="text-blue-300 text-sm font-semibold tracking-wide">Next-Gen Recruitment Intelligence</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95]">
              <span className="text-slate-900">Talent</span>
              <span className="text-gradient">IQ</span>
              <br />
              <span className="text-4xl md:text-6xl font-light text-slate-500">The Future of </span>
              <span className="text-4xl md:text-6xl text-gradient-purple font-bold">Hiring</span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-xl md:text-2xl font-light text-slate-500 max-w-3xl mx-auto leading-relaxed">
              Experience the power of <span className="text-slate-900 font-medium">Explainable AI</span> to source, 
              rank, and analyze candidates. Built for merit-first, bias-free recruiting.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              onClick={handleAccessApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-slate-900 text-xl font-bold rounded-2xl glow-blue shadow-2xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer" />
              <div className="flex items-center gap-3 relative z-10">
                <Zap className="w-6 h-6" />
                <span>Get Started Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => document.getElementById('ai-features')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-glass border border-slate-300/50 text-slate-600 hover:text-slate-900 text-xl font-semibold rounded-2xl transition-all cursor-pointer shadow-lg"
            >
              <span>Explore AI Engine</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
          <div className="w-6 h-12 border-2 border-slate-300/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-accent-blue rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── AI FUNCTIONS SHOWCASE ─── */}
      <section id="ai-features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-black mb-6">Built to <span className="text-gradient">Win</span></h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">Advanced Gemini-powered features that redefine modern talent acquisition.</p>
          </motion.div>

          {/* Progress Bar & Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {aiFunctions.map((fn, index) => {
              const FnIcon = fn.icon;
              const isActive = index === activeFunction;
              return (
                <button key={fn.id}
                  onClick={() => { setActiveFunction(index); setIsPaused(true); setTimeout(() => setIsPaused(false), ROTATION_INTERVAL * 2); }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${isActive ? 'bg-glass-heavy border-blue-500/50 text-slate-900 glow-blue' : 'bg-glass border-slate-200/50 text-slate-400 hover:text-slate-200'}`}
                >
                  <FnIcon className="w-5 h-5" />
                  <span>{fn.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 max-w-md mx-auto mb-16">
            {aiFunctions.map((_, index) => (
              <ProgressBar key={index} duration={ROTATION_INTERVAL} isActive={index === activeFunction} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentFn.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}
            >
              <div className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-10 md:p-16 shadow-3xl text-gradient-container overflow-hidden relative">
                <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${currentFn.color} opacity-[0.08] blur-[100px] rounded-full`} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r ${currentFn.color} rounded-full mb-8`}>
                      <IconComponent className="w-5 h-5 text-slate-900" />
                      <span className="text-xs font-bold text-slate-900 tracking-widest uppercase">{currentFn.subtitle}</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">{currentFn.title}</h3>
                    <p className="text-slate-500 text-xl leading-relaxed mb-12">{currentFn.description}</p>
                    
                    <div className="grid grid-cols-3 gap-8">
                      {currentFn.stats.map((stat, i) => (
                        <div key={stat.label}>
                          <div className={`text-3xl font-black bg-gradient-to-r ${currentFn.color} bg-clip-text text-transparent`}>{stat.value}</div>
                          <div className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-tighter">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center lg:justify-end">
                    <motion.div className="w-80 h-80 relative flex items-center justify-center"
                      animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
                      <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-full" />
                      <div className="absolute inset-10 border-2 border-dashed border-slate-300/50 rounded-full" />
                      <div className="absolute inset-20 border-2 border-slate-600/30 rounded-full" />
                      <motion.div 
                        className={`w-32 h-32 bg-gradient-to-br ${currentFn.color} rounded-3xl flex items-center justify-center glow-${currentFn.accent}`}
                        animate={{ scale: [1, 1.1, 1], rotate: -360 }}
                        transition={{ scale: { duration: 4, repeat: Infinity }, rotate: { duration: 30, repeat: Infinity, ease: 'linear' } }}
                      >
                        <IconComponent className="w-14 h-14 text-slate-900" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative py-20 px-6 border-t border-slate-900/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center glow-blue shadow-lg">
              <Zap className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Talent<span className="text-accent-blue">IQ</span></span>
          </div>
          <p className="text-slate-400 font-medium">© 2026 TalentIQ AI. Leading the merit-first recruitment revolution.</p>
          <div className="flex gap-8 text-slate-500 font-bold">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}