import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Activity } from 'lucide-react';

const BurnRate = ({ dailySpending = 32.50 }) => {
  const limit = 40;
  const isHigh = dailySpending > limit;
  const percentage = Math.min((dailySpending / limit) * 100, 100);
  
  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="flex items-center gap-2">
          <Flame size={12} className={isHigh ? "text-orange-500" : "text-white/40"} /> 
          DAILY BURN VELOCITY
        </span>
        <span className="mono text-[9px] text-slate-500 font-bold">{isHigh ? 'ATTN_REQUIRED' : 'STABLE_ORBIT'}</span>
      </div>

      <div className="flex flex-col gap-4 py-2">
        <div className="flex items-baseline gap-1">
          <span className="stat-huge text-white">${dailySpending.toFixed(2)}</span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">/ Per Day</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="progress-container h-1.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={`h-full rounded-full ${isHigh ? 'bg-orange-500' : 'bg-white/20'}`}
              style={{ boxShadow: isHigh ? '0 0 10px rgba(249, 115, 22, 0.4)' : 'none' }}
            />
          </div>
          <div className="flex justify-between text-[8px] mono font-bold text-slate-600 uppercase tracking-widest">
            <span>Utilization: {percentage.toFixed(1)}%</span>
            <span>Threshold: $40.00</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1 flex gap-1 items-end h-8">
            {[35, 50, 42, 60, 48, 55, 38].map((h, i) => (
              <div key={i} className="flex-1 bg-white/[0.05] rounded-t-[1px]" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black text-white/40 uppercase tracking-tighter">L-7D AVG</div>
            <div className="text-[10px] mono font-bold text-white">$28.40</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurnRate;
