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
import { Zap, ShieldCheck, Target, TrendingDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandCenter = () => {
  const { forecast, loading, burnRate } = useForecast();
  const [debtData, setDebtData] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [discoverBalance, setDiscoverBalance] = useState(0);
  const [updateTick, setUpdateTick] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchBalances = async () => {
    try {
      const results = await db.select().from(settings);
      const checking = results.find(s => s.key === 'current_checking_balance')?.value || '0';
      const discover = results.find(s => s.key === 'current_discover_balance')?.value || '0';
      setCheckingBalance(parseFloat(checking));
      setDiscoverBalance(parseFloat(discover));

      const debtResults = await db.select().from(debts);
      setDebtData(debtResults[0] || { name: 'Student Loan', current_amount: 20000, total_amount: 20000, interest_rate: 0.05, min_payment: 3540 });
    } catch (err) {
      console.warn('Balance fetch failed, using fallback:', err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [updateTick, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0C18]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={48} className="text-[#39FF14]" />
        </motion.div>
      </div>
    );
  }

  const triggerUpdate = () => setUpdateTick(prev => prev + 1);

  return (
    <div className="main-container py-12">
      {/* Header with Alignment Fix */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#13172a] flex items-center justify-center border border-white/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
            <Zap size={24} className="money-green-pulse" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tighter text-white">PULSE</div>
            <div className="text-[8px] text-slate-500 uppercase tracking-[0.3em] font-bold">Secure_Terminal_v3.2</div>
          </div>
        </div>

        <div className="text-[11px] font-black mono text-slate-500 uppercase tracking-widest">
          ${checkingBalance.toLocaleString()} LQD
        </div>
      </header>

      {/* Navigation Bar - Restored Style */}
      <nav className="nav-bar mb-16">
        {['dashboard', 'loans', 'simulator', 'ledger'].map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </div>
        ))}
      </nav>

      {/* Content Area with Framer Motion Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="pb-20"
        >
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-12">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Heartbeat</h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">90_Day_Liquidity_Vector</div>
              </div>
              
              <div className="glass-card">
                <Heartbeat forecastData={forecast} />
              </div>

              <div className="max-w-md mx-auto w-full">
                <AutomationModule onUpdate={triggerUpdate} />
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="flex flex-col gap-8 max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Loans</h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">Student_Loan_Principal_v01</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card flex flex-col items-center justify-center text-center py-12">
                  <div className="relative w-40 h-40 mb-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="283" strokeDashoffset="220" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-xs font-black text-slate-500">22%</div>
                      <div className="text-[8px] text-slate-600 uppercase font-bold">Paid</div>
                    </div>
                  </div>
                  <div className="text-3xl font-black mono text-white">$20,000.00</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">Remaining Principal</div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="glass-card">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-orange-500/10 text-[#f97316]"><Clock size={20} /></div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Monthly Payment</div>
                        <div className="text-2xl font-black mono text-[#f97316]">$3,540.00</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Non-Negotiable Fixed Cost</div>
                  </div>

                  <div className="glass-card">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Target size={20} /></div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Time To Zero</div>
                        <div className="text-2xl font-black mono text-white">6 Months</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Aggressive Payoff Vector</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-8">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Simulator</h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">Liquidity_Simulation_Module</div>
              </div>
              <VerdictGatekeeper checkingBalance={checkingBalance} discoverBalance={discoverBalance} monthlyPayment={3540} />
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="flex flex-col gap-8 pt-8">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Ledger</h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">Decentralized_Transaction_Feed</div>
              </div>
              <Ledger key={updateTick} />
            </div>
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};
export default CommandCenter;
