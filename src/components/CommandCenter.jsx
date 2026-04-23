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

  // Precision Engine 4.0
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
      <div className="flex items-center justify-center min-h-screen bg-[#08090A]">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Zap size={48} className="text-[#10B981]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-scroll-area">
      <div className="main-container py-12">
        {/* Header 4.0 */}
        <header className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
              <Zap size={28} className="text-[#10B981] animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tighter text-white">PULSE</div>
              <div className="technical-label">Enclave_v4.0_Secure</div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="grid grid-cols-2 gap-12">
              <div className="flex flex-col gap-1">
                <label className="technical-label">Checking_Liquidity</label>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-slate-500 mb-1">$</span>
                  <input 
                    type="number" 
                    value={checkingBalance}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCheckingBalance(val);
                      saveSetting('current_checking_balance', val.toString());
                    }}
                    className="bg-transparent border-none text-3xl font-black text-white p-0 w-32 outline-none focus:text-[#00F2FF] transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="technical-label">Discover_Liability</label>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-slate-500 mb-1">$</span>
                  <input 
                    type="number" 
                    value={discoverBalance}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDiscoverBalance(val);
                      saveSetting('current_discover_balance', val.toString());
                    }}
                    className="bg-transparent border-none text-3xl font-black text-white p-0 w-32 outline-none focus:text-[#00F2FF] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all"
            >
              <Settings size={24} />
            </button>
          </div>
        </header>

        {/* Tab Bar 4.0 */}
        <div className="sticky top-0 z-[100] bg-[#08090A]/80 backdrop-blur-xl border-b border-white/5 mb-16">
          <nav className="nav-bar">
            {['dashboard', 'loans', 'simulator', 'ledger'].map((tab) => (
              <div key={tab} onClick={() => setActiveTab(tab)} className={`nav-item ${activeTab === tab ? 'active' : ''}`}>
                {tab}
              </div>
            ))}
          </nav>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pb-24"
          >
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-12">
                <div className="glass-card-4">
                  <div className="technical-label mb-6">Network_Heartbeat_90D</div>
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
              </div>
            )}

            {activeTab === 'loans' && (
              <div className="flex flex-col gap-12 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 gap-12">
                  <div className="glass-card-4 flex flex-col items-center py-16">
                    <div className="relative w-48 h-48 mb-8">
                      <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#00F2FF" strokeWidth="6" strokeDasharray="283" strokeDashoffset="220" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-black text-white">22%</div>
                        <div className="technical-label">PAID</div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-white">$20,000.00</div>
                    <div className="technical-label mt-2">Principal_Vector</div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="glass-card-4 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-white/5 text-[#00F2FF]"><Clock size={24} /></div>
                      <div>
                        <div className="technical-label">Monthly_Liability</div>
                        <div className="text-2xl font-black text-white">$3,540.00</div>
                      </div>
                    </div>
                    <div className="glass-card-4 flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-white/5 text-[#10B981]"><Target size={24} /></div>
                      <div>
                        <div className="technical-label">Time_To_Zero</div>
                        <div className="text-2xl font-black text-white">6 Months</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'simulator' && (
              <div className="max-w-3xl mx-auto">
                <VerdictGatekeeper 
                  checkingBalance={checkingBalance} 
                  discoverBalance={discoverBalance} 
                  fixedExpenses={fixedExpensesTotal} 
                />
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="glass-card-4">
                <div className="technical-label mb-8">Enclave_Ledger_Feed</div>
                <Ledger key={updateTick} />
              </div>
            )}
          </motion.main>
        </AnimatePresence>

        {/* Tab Bar Container for Mobile Safe Area */}
        <div className="tab-bar-container" />
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
