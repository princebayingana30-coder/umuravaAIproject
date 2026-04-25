import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2, boxShadow: '0 24px 80px rgba(59,130,246,0.18)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="bg-white/70 border border-slate-200 p-6 rounded-[2rem] backdrop-blur-xl hover:border-blue-400/50 hover:bg-white/90 transition-all group shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-slate-700/50 ${color}`}>
          <Icon className="text-current" size={24} />
        </div>
        <span className="text-emerald-400 text-[10px] font-black bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          {change}
        </span>
      </div>
      <div>
        <p className="text-slate-600 text-sm font-bold mb-1 uppercase tracking-tighter opacity-80">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-all origin-left">
          {value}
        </h3>
      </div>
    </motion.div>
  );
};

export default MetricCard;
