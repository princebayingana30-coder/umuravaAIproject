'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProfileForm from '@/components/candidate/ProfileForm';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Target, 
  Lightbulb, ShieldCheck, Zap 
} from 'lucide-react';
import { TalentProfileCandidate } from '@/lib/talentProfile';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<Partial<TalentProfileCandidate>>({
    basicInfo: { 
      firstName: 'Kwame', 
      lastName: 'Mensah', 
      email: 'kwame@example.com', 
      headline: 'Full Stack Engineer',
      location: 'Accra, Ghana',
      bio: 'Enthusiastic software engineer with a passion for AI and cloud architecture.'
    },
    skills: [
      { name: 'React', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
      { name: 'PostgreSQL', level: 'Intermediate', yearsOfExperience: 3 }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'French', proficiency: 'Conversational' }
    ],
    experience: [],
    education: [],
    projects: [],
    availability: { status: 'Available', type: 'Full-time' },
    socialLinks: {}
  });

  const [aiInsights, setAiInsights] = useState({
    strength: 55,
    marketRank: 'Top 35%',
    tips: [
      'Add at least 2 detailed projects to boost project relevance score by 15%.',
      'Specify your role and technologies in work experience for better matching.',
      'Link your LinkedIn and GitHub for verified skill detection.'
    ],
    growthPotential: 'High (Cloud Architecture, AI Integration)'
  });

  const handleSaveProfile = (data: TalentProfileCandidate) => {
    setProfile(data);
    // In a real app, this would call an API and then refresh AI insights
    console.log('Saved Profile:', data);
  };

  return (
    <div className="min-h-screen bg-cyber-gradient text-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                Profile <span className="text-gradient">Hub</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl">
                Manage your professional identity and get AI-powered insights to accelerate your career.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-glass px-5 py-3 rounded-2xl border border-blue-500/20 shadow-lg glow-blue">
              <ShieldCheck className="text-blue-400 w-5 h-5" />
              <span className="text-blue-300 font-bold text-sm tracking-wide">Merit-Verified Profile</span>
            </div>
          </motion.div>
        </header>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Main Form */}
          <div className="lg:col-span-8">
            <ProfileForm initialData={profile} onSave={handleSaveProfile} />
          </div>

          {/* Right: AI Insights Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Strength */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold">AI Profile Strength</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="80" cy="80" r="70" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="12" 
                      className="text-slate-200"
                    />
                    <motion.circle 
                      cx="80" cy="80" r="70" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="12" 
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * aiInsights.strength) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-blue-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black">{aiInsights.strength}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete</span>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm font-medium">Your profile is currently in the</p>
                  <p className="text-2xl font-black text-gradient mt-1">{aiInsights.marketRank}</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">Market Standing</p>
                </div>
              </div>
            </motion.div>

            {/* Growth Potential */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-glass-heavy border border-slate-200/50 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold">Growth Potential</h3>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-emerald-600 font-bold text-sm leading-relaxed">
                  {aiInsights.growthPotential}
                </p>
              </div>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed italic">
                Our AI predicts high growth in modern architectures based on your skill trajectory.
              </p>
            </motion.div>

            {/* Improve Tips */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-glass border border-slate-200/50 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold">AI Recommendations</h3>
              </div>
              <div className="space-y-4">
                {aiInsights.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                      <Zap className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors leading-relaxed font-medium">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
