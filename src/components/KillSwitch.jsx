import React, { useState, useMemo } from 'react';
import { db } from '../db';
import { debts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Zap, TrendingDown, Clock, Target } from 'lucide-react';

const KillSwitch = ({ debt }) => {
  const [extraPayment, setExtraPayment] = useState(0);

  const stats = useMemo(() => {
    if (!debt) return null;
    
    const monthlyInterest = (debt.interest_rate / 12);
    const balance = debt.current_amount;
    const minPayment = debt.min_payment;
    
    const monthsNormal = Math.log(minPayment / (minPayment - balance * monthlyInterest)) / Math.log(1 + monthlyInterest);
    const totalPayment = minPayment + extraPayment;
    const monthsExtra = Math.log(totalPayment / (totalPayment - balance * monthlyInterest)) / Math.log(1 + monthlyInterest);
    
    const interestSaved = (monthsNormal * minPayment) - (monthsExtra * totalPayment);
    const monthsSaved = monthsNormal - monthsExtra;

    return {
      timeToZero: Math.ceil(monthsExtra),
      interestSaved: Math.max(0, interestSaved),
      monthsSaved: Math.max(0, monthsSaved),
      progress: ((35000 - debt.current_amount) / 35000) * 100
    };
  }, [debt, extraPayment]);

  if (!debt) return null;

  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="flex items-center gap-2"><Target size={12} className="text-white/40" /> $35k KILL-SWITCH</span>
        <span className="text-emerald-500 font-black text-[9px] flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM_LIVE
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="text-slate-500 text-[9px] font-bold tracking-widest mb-1 uppercase">Current Principal</div>
          <div className="stat-huge text-white">${debt.current_amount.toLocaleString()}</div>
          <div className="absolute top-0 right-0 text-[10px] mono text-slate-600 font-bold">LIA_001</div>
        </div>

        <div className="progress-container mb-2">
          <div className="progress-bar-metallic" style={{ width: `${stats.progress}%` }}></div>
          <div className="progress-label">
            <span className="mono font-bold">{stats.progress.toFixed(1)}% ELIMINATED</span>
            <span className="mono font-bold">$35,000.00 GOAL</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 mb-1 uppercase">
              <Clock size={12} /> Time-to-Zero
            </div>
            <div className="text-lg font-black mono text-white">{stats.timeToZero} <span className="text-[10px] font-normal text-slate-500">MOS</span></div>
          </div>
          <div className="p-2.5 bg-emerald-500/[0.05] rounded-lg border border-emerald-500/10">
            <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 mb-1 uppercase">
              <TrendingDown size={12} /> Int. Saved
            </div>
            <div className="text-lg font-black mono text-emerald-400">${Math.floor(stats.interestSaved).toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-2">
          <label className="text-[9px] font-bold text-slate-500 flex justify-between mb-2 uppercase tracking-widest">
            <span>Extra Monthly Contribution</span>
            <span className="text-white mono">${extraPayment}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="2000" 
            step="100" 
            value={extraPayment} 
            onChange={(e) => setExtraPayment(parseInt(e.target.value))}
            className="w-full accent-white bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-2 text-[8px] text-slate-600 uppercase tracking-[0.2em] font-black text-center">
            Optimizes payoff by {Math.floor(stats.monthsSaved)} months
          </div>
        </div>
      </div>
    </div>
  );
};

export default KillSwitch;
