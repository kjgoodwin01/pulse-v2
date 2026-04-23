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

  const generateForecast = () => {
    const data = [];
    const now = new Date();
    let currentBalance = checkingBalance - discoverBalance;
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      if (i % 14 === 0 && i !== 0) {
        currentBalance += 2363.99;
      }
      
      if (date.getDate() === 1) {
        currentBalance -= (3540 + fixedExpensesTotal);
      }

      data.push({
        date: date.toISOString(),
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.max(0, currentBalance)
      });
    }
    setForecast(data);
  };

  const triggerUpdate = () => setUpdateTick(prev => prev + 1);

  const handleOcrUpdate = (amount) => {
    setDiscoverBalance(prev => {
      const newVal = prev + amount;
      saveSetting('current_discover_balance', newVal.toString());
      return newVal;
    });
    triggerUpdate();
  };

  const saveSetting = async (key, value) => {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({
      target: settings.key,
      set: { value }
    });
  };

  const handleCheckingChange = (val) => {
    const num = parseFloat(val) || 0;
    setCheckingBalance(num);
    saveSetting('current_checking_balance', num.toString());
  };

  const handleDiscoverChange = (val) => {
    const num = parseFloat(val) || 0;
    setDiscoverBalance(num);
    saveSetting('current_discover_balance', num.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0C18]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Zap size={48} className="money-green-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary transition-colors duration-500">
      <div className="main-container py-12">
        {/* Header with Global Balance Inputs */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#13172a] flex items-center justify-center border border-white/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <Zap size={24} className="money-green-pulse" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tighter text-white">PULSE</div>
              <div className="text-[8px] text-slate-500 uppercase tracking-[0.3em] font-bold">Secure_Terminal_v3.5</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Wallet size={10} /> Checking
                </div>
                <div className="glass-card py-2 px-4 flex items-center gap-2">
                  <span className="text-slate-500 font-black mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={checkingBalance}
                    onChange={(e) => handleCheckingChange(e.target.value)}
                    className="balance-input"
                  />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                  <CreditCard size={10} /> Discover
                </div>
                <div className="glass-card py-2 px-4 flex items-center gap-2">
                  <span className="text-slate-500 font-black mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={discoverBalance}
                    onChange={(e) => handleDiscoverChange(e.target.value)}
                    className="balance-input"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Sticky Navigation Bar Container */}
        <div className="sticky top-4 z-[100] mb-16">
          <nav className="nav-bar bg-primary/80 backdrop-blur-md rounded-2xl border border-white/5 py-1">
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
        </div>

        {/* Content Area */}
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
                  <AutomationModule onUpdate={triggerUpdate} onOcrResult={handleOcrUpdate} />
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
                <VerdictGatekeeper 
                  checkingBalance={checkingBalance} 
                  discoverBalance={discoverBalance} 
                  monthlyPayment={3540} 
                  fixedExpenses={fixedExpensesTotal}
                />
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

      <SettingsMenu 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdate={triggerUpdate}
      />
    </div>
  );
};

export default CommandCenter;
