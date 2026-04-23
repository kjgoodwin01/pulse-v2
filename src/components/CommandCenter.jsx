import React, { useState, useEffect } from 'react';
import { useForecast } from '../hooks/useForecast';
import { db } from '../db';
import { debts } from '../db/schema';
import Heartbeat from './Heartbeat';
import KillSwitch from './KillSwitch';
import BurnRate from './BurnRate';
import Ledger from './Ledger';
import { Zap } from 'lucide-react';

const CommandCenter = () => {
  const { forecast, loading, burnRate } = useForecast();
  const [debtData, setDebtData] = useState(null);

  useEffect(() => {
    const fetchDebt = async () => {
      try {
        const results = await db.select().from(debts);
        setDebtData(results[0] || { name: 'Student Loan', current_amount: 35000, total_amount: 35000, interest_rate: 0.05, min_payment: 400 });
      } catch (err) {
        console.warn('Falling back to mock debt data:', err);
        setDebtData({ name: 'Student Loan', current_amount: 35000, total_amount: 35000, interest_rate: 0.05, min_payment: 400 });
      }
    };
    fetchDebt();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050506]">
        <div className="flex flex-col items-center gap-4">
          <div className="bolt-container pulse-health-good">
            <svg viewBox="0 0 24 24" className="w-6 h-6 bolt-metallic">
              <defs>
                <linearGradient id="metallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="50%" stopColor="#f3f4f6" />
                  <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mono">Initializing Financial OS...</div>
        </div>
      </div>
    );
  }

  const pulseClass = burnRate > 40 ? 'pulse-health-critical' : burnRate > 20 ? 'pulse-health-warning' : 'pulse-health-good';

  return (
    <div className="command-center">
      <div className="main-view">
        <header className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-4">
            <div className={`bolt-container ${pulseClass}`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 bolt-metallic">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter logo-metallic leading-none">PULSE<span className="text-white/20">OS</span></h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Tier-1 Private Analyst Terminal // v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-0.5">Network Status</div>
              <div className="text-[10px] font-black text-emerald-500 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SECURE_ENCLAVE
              </div>
            </div>
          </div>
        </header>

        <Heartbeat forecastData={forecast} />
        
        <Ledger />
      </div>

      <div className="sidebar">
        <BurnRate dailySpending={burnRate} />
        <KillSwitch debt={debtData} />
        
        <div className="glass-card bg-white/[0.02] border-dashed">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2">AI Analyst Insights</div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
            "Projected 90-day liquidity remains robust. Current burn-rate optimization suggests a $450 reallocation to the $35k Kill-Switch would accelerate crossover by 14 days."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
