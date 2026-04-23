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
import { Zap, Layout, PieChart, Activity, ShieldCheck, List } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-8 h-8 text-white/20 animate-pulse" />
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/20 mono">Authenticating...</div>
        </div>
      </div>
    );
  }

  const triggerUpdate = () => setUpdateTick(prev => prev + 1);

  const isSimulatorSafe = checkingBalance > (discoverBalance + 1000);
  const simulatorBg = activeTab === 'simulator' 
    ? (isSimulatorSafe ? 'bg-emerald-950/20' : 'bg-rose-950/20') 
    : 'bg-black';

  return (
    <div className={`command-center min-h-screen transition-colors duration-1000 ${simulatorBg}`}>
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="flex items-center gap-2 absolute left-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bolt-container" style={{ width: '32px', height: '32px' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 bolt-metallic">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-xs font-black tracking-tighter logo-metallic">PULSE</span>
        </div>

        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</div>
        <div className={`nav-item ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Loans</div>
        <div className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`} onClick={() => setActiveTab('simulator')}>Simulator</div>
        <div className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>Ledger</div>

        <div className="absolute right-4 text-[9px] text-muted mono uppercase tracking-widest hidden md:block">
          ${checkingBalance.toLocaleString()} LQD
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-view animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-12">
            <header className="text-center pt-8">
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">Financial Heartbeat</h2>
              <p className="text-[10px] text-muted uppercase tracking-[0.3em]">Projected 90-Day Liquidity Forecast</p>
            </header>
            
            <Heartbeat forecastData={forecast} />
            
            <div className="max-w-md mx-auto w-full">
              <AutomationModule onUpdate={triggerUpdate} />
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full pt-8">
            <header>
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase text-center">Debt Elimination</h2>
              <p className="text-[10px] text-muted uppercase tracking-[0.3em] text-center">Principal Trackers & Payoff Optimization</p>
            </header>
            
            <KillSwitch debt={debtData} />
            
            <div className="glass-card">
              <div className="card-header text-muted">Current Liabilities</div>
              <div className="flex justify-between items-center py-4">
                <div className="text-xl font-black text-white mono">DISCOVER_CARD</div>
                <div className="text-xl font-black text-rose-500 mono">${discoverBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-12 max-w-2xl mx-auto w-full pt-8">
            <header className="text-center">
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">Simulator</h2>
              <p className="text-[10px] text-muted uppercase tracking-[0.3em]">Gatekeeper Spending Evaluation</p>
            </header>
            
            <VerdictGatekeeper checkingBalance={checkingBalance} discoverBalance={discoverBalance} />
            
            <div className="glass-card p-8 border-dashed border-white/5">
              <p className="text-xs text-muted leading-relaxed text-center italic">
                The simulator evaluates proposed transactions against your current liquid assets and future debt obligations. 
                The background color of the gatekeeper will shift based on the safety of the proposed spend.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="flex flex-col gap-8 pt-8">
            <header>
              <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase">Transaction Enclave</h2>
              <p className="text-[10px] text-muted uppercase tracking-[0.3em]">Encrypted Local Ledger</p>
            </header>
            
            <Ledger key={updateTick} />
          </div>
        )}
      </main>
    </div>
  );
};

export default CommandCenter;

export default CommandCenter;
