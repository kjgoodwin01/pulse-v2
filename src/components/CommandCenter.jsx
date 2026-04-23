import React, { useState, useEffect } from 'react';
import { useForecast } from '../hooks/useForecast';
import { db } from '../db';
import { debts, settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import Heartbeat from './Heartbeat';
import KillSwitch from './KillSwitch';
import BurnRate from './BurnRate';
import Ledger from './Ledger';
import AutomationModule from './AutomationModule';
import VerdictGatekeeper from './VerdictGatekeeper';
import { Zap, ShieldCheck } from 'lucide-react';

const CommandCenter = () => {
  const { forecast, loading, burnRate } = useForecast();
  const [debtData, setDebtData] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [discoverBalance, setDiscoverBalance] = useState(0);
  const [updateTick, setUpdateTick] = useState(0);

  const fetchBalances = async () => {
    try {
      const results = await db.select().from(settings);
      const checking = results.find(s => s.key === 'current_checking_balance')?.value || '0';
      const discover = results.find(s => s.key === 'current_discover_balance')?.value || '0';
      setCheckingBalance(parseFloat(checking));
      setDiscoverBalance(parseFloat(discover));

      const debtResults = await db.select().from(debts);
      setDebtData(debtResults[0] || { name: 'Student Loan', current_amount: 35000, total_amount: 35000, interest_rate: 0.05, min_payment: 400 });
    } catch (err) {
      console.warn('Balance fetch failed, using fallback:', err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [updateTick, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050506]">
        <div className="flex flex-col items-center gap-4">
          <div className="bolt-container pulse-health-good">
            <svg viewBox="0 0 24 24" className="w-6 h-6 bolt-metallic">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mono">Initializing Financial OS...</div>
        </div>
      </div>
    );
  }

  const triggerUpdate = () => setUpdateTick(prev => prev + 1);

  return (
    <div className="command-center">
      <div className="main-view">
        <header className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-4">
            <div className={`bolt-container ${checkingBalance > 4000 ? 'pulse-health-good' : 'pulse-health-warning'}`}>
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
              <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-0.5">Liquid Assets</div>
              <div className={`text-xl font-black mono flex items-center gap-2 justify-end ${updateTick > 0 ? 'shimmer-text' : 'text-white'}`}>
                ${checkingBalance.toLocaleString()}
              </div>
            </div>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Ledger key={updateTick} />
          <div className="flex flex-col gap-6">
            <VerdictGatekeeper checkingBalance={checkingBalance} discoverBalance={discoverBalance} />
            <div className="glass-card bg-white/[0.01]">
              <div className="card-header">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Discover Debt Monitor</span>
              </div>
              <div className="stat-huge text-rose-500/80">${discoverBalance.toLocaleString()}</div>
              <div className="text-[8px] text-slate-600 uppercase tracking-[0.2em] mt-1 font-bold">Current_Liability_Discover_002</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar">
        <AutomationModule onUpdate={triggerUpdate} />
        <BurnRate dailySpending={burnRate} />
        <KillSwitch debt={debtData} />
      </div>
    </div>
  );
};

export default CommandCenter;
