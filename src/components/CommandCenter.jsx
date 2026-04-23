import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Target, 
  Settings,
  CreditCard,
  Wallet,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../db';
import { fixed_expenses, settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import Heartbeat from './Heartbeat';
import AutomationModule from './AutomationModule';
import Ledger from './Ledger';
import VerdictGatekeeper from './VerdictGatekeeper';
import SettingsMenu from './SettingsMenu';

const CommandCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkingBalance, setCheckingBalance] = useState(2540.50);
  const [discoverBalance, setDiscoverBalance] = useState(1200.00);
  const [forecast, setForecast] = useState([]);
  const [updateTick, setUpdateTick] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fixedExpensesTotal, setFixedExpensesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Precision Engine Logic (Preserved)
  const INFLOW = checkingBalance + (2 * 2363.99);
  const OUTFLOW = discoverBalance + fixedExpensesTotal + 3540;
  const MARGIN = INFLOW - OUTFLOW;

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchBalances(), fetchFixedExpenses()]);
      setLoading(false);
    };
    init();
  }, [updateTick]);

  useEffect(() => {
    if (!loading) generateForecast();
  }, [loading, updateTick, checkingBalance, discoverBalance, fixedExpensesTotal]);

  const fetchFixedExpenses = async () => {
    const results = await db.select().from(fixed_expenses);
    const total = results.reduce((sum, exp) => sum + exp.amount, 0);
    setFixedExpensesTotal(total);
  };

  const fetchBalances = async () => {
    try {
      const results = await db.select().from(settings);
      const checking = results.find(s => s.key === 'current_checking_balance')?.value;
      const discover = results.find(s => s.key === 'current_discover_balance')?.value;
      if (checking) setCheckingBalance(parseFloat(checking));
      if (discover) setDiscoverBalance(parseFloat(discover));
    } catch (err) {
      console.warn('Balance fetch failed:', err);
    }
  };

  const generateForecast = () => {
    const data = [];
    const now = new Date();
    let currentBalance = checkingBalance - discoverBalance;
    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      if (i % 14 === 0 && i !== 0) currentBalance += 2363.99;
      if (date.getDate() === 1) currentBalance -= (3540 + fixedExpensesTotal);
      data.push({
        date: date.toISOString(),
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.max(0, currentBalance)
      });
    }
    setForecast(data);
  };

  const triggerUpdate = () => setUpdateTick(prev => prev + 1);

  const saveSetting = async (key, value) => {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({
      target: settings.key,
      set: { value }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap size={48} className="text-[#A7F3D0]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-scroll-area">
      <div className="main-container">
        {/* Header 5.0 Liquid Slate */}
        <header className="flex justify-between items-end mb-20">
          <div className="flex items-center gap-6">
            <Zap size={36} className="mint-breath" />
            <div>
              <div className="text-3xl font-light tracking-tight text-white">Pulse</div>
              <div className="technical-label opacity-60">SYSTEM_MANIFEST_v5.0</div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-3">
                <label className="technical-label text-right opacity-50">Checking_Vector</label>
                <input 
                  type="number" 
                  value={checkingBalance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setCheckingBalance(val);
                    saveSetting('current_checking_balance', val.toString());
                  }}
                  className="input-silk-inset w-36 text-right"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="technical-label text-right opacity-50">Discover_Liability</label>
                <input 
                  type="number" 
                  value={discoverBalance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDiscoverBalance(val);
                    saveSetting('current_discover_balance', val.toString());
                  }}
                  className="input-silk-inset w-36 text-right"
                />
              </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-4 rounded-[24px] bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <Settings size={24} />
            </button>
          </div>
        </header>

        {/* Liquid Tab Navigation */}
        <div className="sticky top-0 z-[100] bg-[#0F172A]/80 backdrop-blur-2xl mb-20 border-b border-white/[0.03]">
          <nav className="nav-bar">
            {['dashboard', 'loans', 'simulator', 'ledger'].map((tab) => (
              <div key={tab} onClick={() => setActiveTab(tab)} className={`nav-item ${activeTab === tab ? 'active' : ''}`}>
                {tab}
              </div>
            ))}
          </nav>
        </div>

        {/* Content Overhaul */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-12 pb-40"
          >
            {activeTab === 'dashboard' && (
              <>
                <div className="glass-card-slate">
                  <div className="technical-label mb-12 opacity-40">Network_Liquidity_Trajector</div>
                  <Heartbeat forecastData={forecast} />
                </div>
                <div className="max-w-md mx-auto w-full">
                  <AutomationModule onUpdate={triggerUpdate} onOcrResult={(amt) => {
                    setDiscoverBalance(prev => {
                      const next = prev + amt;
                      saveSetting('current_discover_balance', next.toString());
                      return next;
                    });
                  }} />
                </div>
              </>
            )}

            {activeTab === 'loans' && (
              <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto w-full">
                <div className="glass-card-slate flex flex-col items-center py-24">
                  <div className="relative w-56 h-56 mb-12">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="3" />
                      <circle cx="50" cy="50" r="47" fill="none" stroke="var(--accent-secondary)" strokeWidth="3" strokeDasharray="295" strokeDashoffset="230" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-light text-white">22%</div>
                      <div className="technical-label opacity-40">PAID</div>
                    </div>
                  </div>
                  <div className="text-5xl font-light text-white">$20,000.00</div>
                  <div className="technical-label mt-4 opacity-40">Principal_Residue</div>
                </div>

                <div className="flex flex-col gap-12">
                  <div className="glass-card-slate flex items-center gap-10">
                    <div className="p-5 rounded-[28px] bg-white/[0.02] text-slate-400"><Clock size={28} /></div>
                    <div>
                      <div className="technical-label opacity-40">Fixed_Liability</div>
                      <div className="text-3xl font-light text-white">$3,540.00</div>
                    </div>
                  </div>
                  <div className="glass-card-slate flex items-center gap-10">
                    <div className="p-5 rounded-[28px] bg-white/[0.02] text-[#A7F3D0]"><Target size={28} /></div>
                    <div>
                      <div className="technical-label opacity-40">Elimination_Horizon</div>
                      <div className="text-3xl font-light text-white">6 Months</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'simulator' && (
              <div className="max-w-4xl mx-auto w-full">
                <VerdictGatekeeper 
                  checkingBalance={checkingBalance} 
                  discoverBalance={discoverBalance} 
                  fixedExpenses={fixedExpensesTotal} 
                />
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="glass-card-slate">
                <div className="technical-label mb-12 opacity-40">Enclave_Transaction_Log</div>
                <Ledger key={updateTick} />
              </div>
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      <SettingsMenu 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdate={triggerUpdate}
      />
    </div>
  );
};

export default CommandCenter;
