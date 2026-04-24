 'use client';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { Search, Bell, LayoutDashboard, Briefcase, LogOut, Zap, User as UserIcon, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/60 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.1, rotateZ: -5 }}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-all"
          >
            <Zap className="text-slate-900 font-bold" size={18} />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-cyan-300 group-hover:to-blue-400 transition-all">
            TalentIQ
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
            <LayoutDashboard size={18} className="group-hover:text-blue-400 transition-colors" />
            Recruiter Dashboard
          </Link>
          <Link href="/candidate/profile" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
            <UserIcon size={18} className="group-hover:text-blue-400 transition-colors" />
            Candidate Hub
          </Link>
          <Link href="/jobs/new" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
            <Briefcase size={18} className="group-hover:text-blue-400 transition-colors" />
            Post Job
          </Link>
          <Link href="/candidates/add" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
            <UserPlus size={18} className="group-hover:text-emerald-400 transition-colors" />
            Add Candidate
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <motion.input
            whileFocus={{ borderColor: '#3b82f6' }}
            type="text" 
            placeholder="Search candidates..." 
            className="bg-slate-800/60 border border-slate-700/50 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-500 w-64 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all backdrop-blur-sm hover:border-slate-500/60"
          />
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full transition-all relative backdrop-blur-sm"
        >
          <Bell size={20} />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 shadow-lg shadow-red-500/50" 
          />
        </motion.button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
          {token && user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              {user.picture ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={user.picture}
                  alt={user.name || 'Profile'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 cursor-pointer object-cover"
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border border-slate-300/50 font-bold text-white text-sm shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {user.name?.[0]?.toUpperCase() || 'R'}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100/50 backdrop-blur-sm">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
