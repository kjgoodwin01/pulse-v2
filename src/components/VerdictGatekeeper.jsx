import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance, monthlyPayment = 3540 }) => {
  const [proposedSpend, setProposedSpend] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const spend = parseFloat(proposedSpend) || 0;
      // Logic: Safe if checking balance after spend can still cover the $3,540 payment + $1,000 buffer
      const isSafe = (checkingBalance - spend) > (monthlyPayment + 1000);
      setVerdict(isSafe ? 'SAFE' : 'DENIED');
      setIsSimulating(false);
    }, 800);
  };

  const isSafe = verdict === 'SAFE';
  const isDenied = verdict === 'DENIED';

  return (
    <motion.div 
      layout
      className={`glass-card transition-all duration-700 ${
        isSafe ? 'bg-emerald-500/20' : isDenied ? 'bg-purple-900/40' : 'bg-white/5'
      }`}
    >
      <div className="card-header border-b border-white/5 pb-4 mb-6">
        <span className="flex items-center gap-2"><Zap size={14} className="money-green-pulse" /> SIMULATOR_GATEKEEPER_v3</span>
        <span className={`font-black text-[10px] tracking-widest ${isSafe ? 'text-emerald-400' : isDenied ? 'text-purple-400' : 'text-slate-500'}`}>
          {verdict ? `SYSTEM_VERDICT: ${verdict}` : 'AWAITING_INPUT...'}
        </span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Proposed Purchase Amount</label>
          <div className="flex gap-4">
            <input 
              type="number" 
              placeholder="0.00"
              value={proposedSpend}
              onChange={(e) => setProposedSpend(e.target.value)}
              className="bg-black/40 border-none rounded-xl px-6 py-4 text-2xl mono text-white w-full focus:ring-2 ring-blue-500/50 outline-none"
            />
            <button 
              onClick={handleSimulate}
              className="btn-chrome flex items-center gap-3 whitespace-nowrap"
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              Simulate Spend
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {verdict && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center justify-between p-8 rounded-3xl border-b-8 ${
                isSafe 
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(57,255,20,0.2)]' 
                : 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Liquidity Status</div>
                <div className={`text-3xl font-black mono uppercase ${isSafe ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {isSafe ? 'Transaction_Approved' : 'Liquidity_Hazard'}
                </div>
              </div>

              {isSafe ? (
                <ShieldCheck size={48} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]" />
              ) : (
                <ShieldAlert size={48} className="text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-6">
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Fixed Liability</div>
            <div className="text-sm font-bold mono text-rose-400">$3,540.00</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Safe Buffer</div>
            <div className="text-sm font-bold mono text-emerald-400">$1,000.00</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Risk Threshold</div>
            <div className="text-sm font-bold mono text-slate-300">MEDIUM_4</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default VerdictGatekeeper;
