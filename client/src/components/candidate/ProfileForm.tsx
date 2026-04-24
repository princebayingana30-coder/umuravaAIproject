'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, GraduationCap, Code, 
  Globe, Clock, Plus, Trash2, CheckCircle2, 
  ExternalLink, Mail, Award
} from 'lucide-react';
import { TalentProfileCandidate } from '@/lib/talentProfile';

interface ProfileFormProps {
  initialData?: Partial<TalentProfileCandidate>;
  onSave: (data: TalentProfileCandidate) => void;
}

const sections = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills & Languages', icon: Globe },
  { id: 'availability', label: 'Availability', icon: Clock },
];

export default function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<TalentProfileCandidate>({
    basicInfo: {
      firstName: initialData?.basicInfo?.firstName || '',
      lastName: initialData?.basicInfo?.lastName || '',
      email: initialData?.basicInfo?.email || '',
      location: initialData?.basicInfo?.location || '',
      headline: initialData?.basicInfo?.headline || '',
      bio: initialData?.basicInfo?.bio || '',
    },
    skills: initialData?.skills || [],
    languages: initialData?.languages || [],
    experience: initialData?.experience || [],
    education: initialData?.education || [],
    projects: initialData?.projects || [],
    certifications: initialData?.certifications || [],
    availability: initialData?.availability || {
      status: 'Available',
      type: 'Full-time',
    },
    socialLinks: {
      linkedin: initialData?.socialLinks?.linkedin || '',
      github: initialData?.socialLinks?.github || '',
      portfolio: initialData?.socialLinks?.portfolio || '',
    },
  });

  const updateBasicInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  const handleAddField = (section: 'experience' | 'education' | 'projects' | 'skills' | 'languages' | 'certifications') => {
    const templates = {
      experience: { company: '', role: '', startDate: '', description: '', technologies: [], isCurrent: false },
      education: { institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() },
      projects: { name: '', description: '', technologies: [], role: '', link: '', startDate: '' },
      skills: { name: '', level: 'Intermediate', yearsOfExperience: 1 },
      languages: { name: '', proficiency: 'Conversational' },
      certifications: { name: '', issuer: '', issueDate: '' }
    };
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), templates[section]]
    }));
  };

  const handleRemoveField = (section: keyof TalentProfileCandidate, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as unknown[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeTab === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]' 
                  : 'bg-white/50 border border-slate-200/50 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
              {section.label}
            </button>
          );
        })}
        <div className="pt-8">
          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <CheckCircle2 className="w-5 h-5" />
            Save Profile
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 bg-glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-slate-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">First Name</label>
                    <input 
                      type="text" 
                      value={formData.basicInfo.firstName}
                      onChange={(e) => updateBasicInfo('firstName', e.target.value)}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="e.g. Kwame"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.basicInfo.lastName}
                      onChange={(e) => updateBasicInfo('lastName', e.target.value)}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="e.g. Mensah"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Professional Headline</label>
                    <input 
                      type="text" 
                      value={formData.basicInfo.headline}
                      onChange={(e) => updateBasicInfo('headline', e.target.value)}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="e.g. Backend Engineer – Node.js & AI Systems"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.basicInfo.email}
                      onChange={(e) => updateBasicInfo('email', e.target.value)}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="kwame@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Location</label>
                    <input 
                      type="text" 
                      value={formData.basicInfo.location}
                      onChange={(e) => updateBasicInfo('location', e.target.value)}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="e.g. Accra, Ghana"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Professional Bio</label>
                  <textarea 
                    rows={4}
                    value={formData.basicInfo.bio}
                    onChange={(e) => updateBasicInfo('bio', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    placeholder="Provide a detailed professional biography..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-slate-900">Work Experience</h3>
                  </div>
                  <button 
                    onClick={() => handleAddField('experience')}
                    className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-6 bg-white/40 border border-slate-200/50 rounded-2xl space-y-4 relative group">
                    <button 
                      onClick={() => handleRemoveField('experience', idx)}
                      className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx].company = e.target.value;
                          setFormData(prev => ({ ...prev, experience: newExp }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        placeholder="Role / Position"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx].role = e.target.value;
                          setFormData(prev => ({ ...prev, experience: newExp }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Start Date (YYYY-MM)"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, experience: newExp }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        type="text" 
                        placeholder="End Date (YYYY-MM | Present)"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx].endDate = e.target.value;
                          newExp[idx].isCurrent = (e.target.value || '').toLowerCase() === 'present';
                          setFormData(prev => ({ ...prev, experience: newExp }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                    <textarea 
                      placeholder="Key responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].description = e.target.value;
                        setFormData(prev => ({ ...prev, experience: newExp }));
                      }}
                      className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900 min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-slate-900">Education</h3>
                  </div>
                  <button 
                    onClick={() => handleAddField('education')}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-6 bg-white/40 border border-slate-200/50 rounded-2xl space-y-4 relative group">
                    <button 
                      onClick={() => handleRemoveField('education', idx)}
                      className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx].institution = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        placeholder="Degree (e.g. Bachelor's)"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx].degree = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        placeholder="Field of Study"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx].fieldOfStudy = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        type="number"
                        placeholder="Start Year"
                        value={edu.startYear}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx].startYear = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        type="number"
                        placeholder="End Year"
                        value={edu.endYear}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx].endYear = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Code className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-2xl font-bold text-slate-900">Portfolio Projects</h3>
                  </div>
                  <button 
                    onClick={() => handleAddField('projects')}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-6 bg-white/40 border border-slate-200/50 rounded-2xl space-y-4 relative group">
                    <button 
                      onClick={() => handleRemoveField('projects', idx)}
                      className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => {
                          const newProj = [...formData.projects];
                          newProj[idx].name = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProj }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        placeholder="Your Role"
                        value={proj.role}
                        onChange={(e) => {
                          const newProj = [...formData.projects];
                          newProj[idx].role = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProj }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                    <input 
                      placeholder="Project Link (Optional)"
                      value={proj.link}
                      onChange={(e) => {
                        const newProj = [...formData.projects];
                        newProj[idx].link = e.target.value;
                        setFormData(prev => ({ ...prev, projects: newProj }));
                      }}
                      className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Start Date (YYYY-MM)"
                        value={proj.startDate}
                        onChange={(e) => {
                          const newProj = [...formData.projects];
                          newProj[idx].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProj }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                      <input 
                        placeholder="End Date (YYYY-MM | Present)"
                        value={proj.endDate}
                        onChange={(e) => {
                          const newProj = [...formData.projects];
                          newProj[idx].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProj }));
                        }}
                        className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900"
                      />
                    </div>
                    <textarea 
                      placeholder="Project description and impact..."
                      value={proj.description}
                      onChange={(e) => {
                        const newProj = [...formData.projects];
                        newProj[idx].description = e.target.value;
                        setFormData(prev => ({ ...prev, projects: newProj }));
                      }}
                      className="w-full bg-slate-100/40 border border-slate-300/50 rounded-lg px-4 py-2 text-slate-900 min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-8">
                <div className="flex flex-col gap-8">
                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Code className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold text-slate-900">Professional Skills</h3>
                      </div>
                      <button 
                        onClick={() => handleAddField('skills')}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {formData.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/40 border border-slate-200/50 rounded-xl">
                          <input 
                            placeholder="Skill Name"
                            value={skill.name}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[idx].name = e.target.value;
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="flex-1 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[idx].level = e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <input 
                            type="number"
                            placeholder="Years"
                            value={skill.yearsOfExperience}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[idx].yearsOfExperience = parseInt(e.target.value);
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="w-20 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                          />
                          <button 
                            onClick={() => handleRemoveField('skills', idx)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-teal-400" />
                        <h3 className="text-xl font-bold text-slate-900">Languages</h3>
                      </div>
                      <button 
                        onClick={() => handleAddField('languages')}
                        className="p-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(formData.languages || []).map((lang, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/40 border border-slate-200/50 rounded-xl">
                          <input 
                            placeholder="Language Name"
                            value={lang.name}
                            onChange={(e) => {
                              const newLang = [...formData.languages];
                              newLang[idx].name = e.target.value;
                              setFormData(prev => ({ ...prev, languages: newLang }));
                            }}
                            className="flex-1 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                          />
                          <select
                            value={lang.proficiency}
                            onChange={(e) => {
                              const newLang = [...formData.languages];
                              newLang[idx].proficiency = e.target.value as 'Basic' | 'Conversational' | 'Fluent' | 'Native';
                              setFormData(prev => ({ ...prev, languages: newLang }));
                            }}
                            className="flex-1 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                          >
                            <option value="Basic">Basic</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                          </select>
                          <button 
                            onClick={() => handleRemoveField('languages', idx)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-teal-400" />
                  <h3 className="text-2xl font-bold text-slate-900">Work Availability</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500">Status</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Available', 'Open to Opportunities', 'Not Available'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, status: s as 'Available' | 'Open to Opportunities' | 'Not Available' } }))}
                          className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between ${
                            formData.availability.status === s 
                              ? 'bg-teal-500/20 border-teal-500/50 text-teal-600' 
                              : 'bg-white/50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span>{s}</span>
                          {formData.availability.status === s && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500">Employment Type</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Full-time', 'Part-time', 'Contract'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, type: t as 'Full-time' | 'Part-time' | 'Contract' } }))}
                          className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between ${
                            formData.availability.type === t 
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-600' 
                              : 'bg-white/50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span>{t}</span>
                          {formData.availability.type === t && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
