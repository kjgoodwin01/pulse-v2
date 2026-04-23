import React from 'react';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance }) => {
  // Logic: "Acceptable" if checking balance covers discover debt and leaves a buffer
  const isAcceptable = checkingBalance > (discoverBalance + 1000);
  
  return (
    <div className={`glass-card border-2 transition-all duration-500 ${isAcceptable ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
      <div className="card-header">
        <span className="flex items-center gap-2"><Zap size={12} className="text-white/40" /> GATEKEEPER_SIMULATOR</span>
        <span className={`font-black text-[9px] flex items-center gap-1 ${isAcceptable ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAcceptable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span> 
          {isAcceptable ? 'VERDICT_READY' : 'LIQUIDITY_WARNING'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-6 py-2">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Simulated Purchase</div>
          <div className="text-lg font-black text-white mono uppercase">New_MacBook_Pro</div>
        </div>

        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-b-4 transition-all duration-700 ${
          isAcceptable 
          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'bg-rose-500/10 border-rose-500/50 grayscale opacity-70'
        }`}>
          {isAcceptable ? (
            <>
              <ShieldCheck size={32} className="text-emerald-500 mb-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] logo-metallic">Acceptable</div>
            </>
          ) : (
            <>
              <ShieldAlert size={32} className="text-rose-500 mb-2" />
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Denied</div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Checking Ratio</div>
          <div className={`text-xs font-bold mono ${isAcceptable ? 'text-emerald-500' : 'text-rose-400'}`}>
            {(checkingBalance / 5000 * 100).toFixed(0)}%_HEALTH
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Risk Factor</div>
          <div className="text-xs font-bold mono text-slate-400">LOW_LEVEL_7</div>
        </div>
      </div>
    </div>
  );
};

export default VerdictGatekeeper;
