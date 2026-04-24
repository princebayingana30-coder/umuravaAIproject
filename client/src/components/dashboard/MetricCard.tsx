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
      className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-[1.8rem] backdrop-blur-xl hover:border-blue-500/40 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-slate-700/50 ${color}`}>
          <Icon className="text-current" size={24} />
        </div>
        <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/15 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
          {value}
        </h3>
      </div>
    </motion.div>
  );
};

export default MetricCard;
