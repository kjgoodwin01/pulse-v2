import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, Clock, Target } from 'lucide-react';
import Heartbeat from './Heartbeat';
import Ledger from './Ledger';
import AutomationModule from './AutomationModule';
import VerdictGatekeeper from './VerdictGatekeeper';
import SettingsMenu from './SettingsMenu';
import AIAdvisor from './AIAdvisor';
import { db } from '../db';
import { settings, fixed_expenses } from '../db/schema';

const CommandCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkingBalance, setCheckingBalance] = useState(2540.50);
  const [discoverBalance, setDiscoverBalance] = useState(1200.00);
  const [loanPrincipal, setLoanPrincipal] = useState(20000.00);
  const [loanMonthlyPayment, setLoanMonthlyPayment] = useState(3540.00);
  const [forecast, setForecast] = useState([]);
  const [updateTick, setUpdateTick] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fixedExpensesTotal, setFixedExpensesTotal] = useState(0);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  // Precision Engine
  const INFLOW = checkingBalance + (2 * 2363.99);
  const OUTFLOW = discoverBalance + fixedExpensesTotal + loanMonthlyPayment;
  const MARGIN = INFLOW - OUTFLOW;
  const eliminationHorizon = loanMonthlyPayment > 0 ? Math.ceil(loanPrincipal / loanMonthlyPayment) : 0;

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchBalances(), fetchFixedExpenses()]);
      setLoading(false);
    };
    init();
  }, [updateTick]);

  useEffect(() => {
    if (!loading) generateForecast();
  }, [loading, updateTick, checkingBalance, discoverBalance, fixedExpensesTotal, loanMonthlyPayment]);

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
      const principal = results.find(s => s.key === 'loan_principal')?.value;
      const monthly = results.find(s => s.key === 'loan_monthly_payment')?.value;
      const api_key = results.find(s => s.key === 'claude_api_key')?.value;
      
      if (checking) setCheckingBalance(parseFloat(checking));
      if (discover) setDiscoverBalance(parseFloat(discover));
      if (principal) setLoanPrincipal(parseFloat(principal));
      if (monthly) setLoanMonthlyPayment(parseFloat(monthly));
      if (api_key) setClaudeApiKey(api_key);
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
      if (date.getDate() === 1) currentBalance -= (loanMonthlyPayment + fixedExpensesTotal);
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
      <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap size={48} className="text-[#3b82f6]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-scroll-area relative">
      <div className="bento-container">
        
        {/* Header - Spans full grid width */}
        <header className="flex justify-between items-end mb-16">
          <div className="flex items-center gap-6">
            <Zap size={36} className="text-white" />
            <div>
              <div className="text-3xl font-bold tracking-tight text-white mb-1">Pulse</div>
              <div className="technical-label opacity-60">SPATIAL_OS_v26</div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-6">
              <div className="input-container-acrylic flex flex-col gap-2">
                <label className="technical-label opacity-50">Checking</label>
                <input 
                  type="number" 
                  value={checkingBalance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setCheckingBalance(val);
                    saveSetting('current_checking_balance', val.toString());
                  }}
                  className="input-titanium w-32 text-xl font-bold"
                />
              </div>
              <div className="input-container-acrylic flex flex-col gap-2">
                <label className="technical-label opacity-50">Discover</label>
                <input 
                  type="number" 
                  value={discoverBalance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDiscoverBalance(val);
                    saveSetting('current_discover_balance', val.toString());
                  }}
                  className="input-titanium w-32 text-xl font-bold"
                />
              </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Bento Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            className="w-full"
          >
            {activeTab === 'dashboard' && (
              <div className="bento-grid">
                <div className="acrylic-card col-span-8 flex flex-col justify-between">
                  <div className="technical-label opacity-40 mb-12">Network_Liquidity</div>
                  <Heartbeat forecastData={forecast} />
                </div>
                <div className="acrylic-card col-span-4 p-0">
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
              <div className="bento-grid">
                <div className="acrylic-card col-span-6 flex flex-col items-center justify-center py-24 relative">
                  <div className="absolute top-10 left-10 technical-label opacity-40">Principal_Residue</div>
                  <div className="relative w-56 h-56 mb-12 mt-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                      <circle cx="50" cy="50" r="47" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="295" strokeDashoffset="147.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Zap size={32} className="text-[#8b5cf6] drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] opacity-80" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl text-slate-500 font-bold">$</span>
                    <input 
                      type="number"
                      value={loanPrincipal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLoanPrincipal(val);
                        saveSetting('loan_principal', val.toString());
                      }}
                      className="input-titanium text-5xl font-bold mono text-center w-[250px]"
                    />
                  </div>
                </div>

                <div className="col-span-6 grid grid-rows-2 gap-6">
                  <div className="acrylic-card flex items-center gap-10">
                    <div className="p-6 rounded-[32px] bg-white/[0.03] text-slate-400 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                      <Clock size={32} />
                    </div>
                    <div className="flex flex-col">
                      <label className="technical-label opacity-40 mb-2">Fixed_Liability</label>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl text-slate-500 font-bold">$</span>
                        <input 
                          type="number"
                          value={loanMonthlyPayment}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setLoanMonthlyPayment(val);
                            saveSetting('loan_monthly_payment', val.toString());
                          }}
                          className="input-titanium text-4xl font-bold mono w-[180px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="acrylic-card flex items-center gap-10">
                    <div className="p-6 rounded-[32px] bg-white/[0.03] text-[#10b981] border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                      <Target size={32} />
                    </div>
                    <div>
                      <div className="technical-label opacity-40 mb-2">Elimination_Horizon</div>
                      <div className="text-4xl font-bold text-white flex items-baseline gap-2">
                        {eliminationHorizon} <span className="text-xl text-slate-400">Months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'simulator' && (
              <div className="acrylic-card max-w-4xl mx-auto w-full">
                <VerdictGatekeeper 
                  checkingBalance={checkingBalance} 
                  discoverBalance={discoverBalance} 
                  fixedExpenses={fixedExpensesTotal}
                  monthlyPayment={loanMonthlyPayment}
                />
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="acrylic-card max-w-5xl mx-auto">
                <div className="technical-label mb-12 opacity-40">Enclave_Transaction_Log</div>
                <Ledger key={updateTick} />
              </div>
            )}

            {activeTab === 'advisor' && (
              <AIAdvisor 
                checking={checkingBalance}
                discover={discoverBalance}
                fixed={fixedExpensesTotal}
                loanPrincipal={loanPrincipal}
                loanMonthly={loanMonthlyPayment}
                forecast={forecast}
                updateTick={updateTick}
                apiKey={claudeApiKey}
              />
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Dynamic Dock */}
      <div className="dynamic-dock-wrapper">
        <div className="dynamic-dock">
          {['dashboard', 'advisor', 'loans', 'simulator', 'ledger'].map((tab) => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`dock-item ${activeTab === tab ? 'active' : ''}`}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="dock-pill"
                  className="dock-active-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </div>
          ))}
        </div>
      </div>

      <SettingsMenu 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdate={triggerUpdate}
        apiKey={claudeApiKey}
        setApiKey={setClaudeApiKey}
      />
    </div>
  );
};

export default CommandCenter;
