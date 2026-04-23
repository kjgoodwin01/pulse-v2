import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance, monthlyPayment = 3540, fixedExpenses = 0 }) => {
  const [proposedSpend, setProposedSpend] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Constants
  const MONTHLY_INCOME = 2363.99 * 2;
  const TOTAL_LIABILITIES = discoverBalance + monthlyPayment + fixedExpenses;
  const AVAILABLE_LIQUIDITY = (checkingBalance + MONTHLY_INCOME) - TOTAL_LIABILITIES;
  const BUFFER_THRESHOLD = fixedExpenses * 1.5;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const spend = parseFloat(proposedSpend) || 0;
      const remaining = AVAILABLE_LIQUIDITY - spend;
      
      if (remaining > 0 && remaining > BUFFER_THRESHOLD) {
        setVerdict('SAFE');
      } else if (remaining > 0) {
        setVerdict('CAUTION');
      } else {
        setVerdict('DENIED');
      }
      setIsSimulating(false);
    }, 800);
  };

  const isSafe = verdict === 'SAFE';
  const isCaution = verdict === 'CAUTION';
  const isDenied = verdict === 'DENIED';

  return (
    <motion.div 
      layout
      className={`glass-card transition-all duration-700 ${
        isSafe ? 'bg-emerald-500/10' : isCaution ? 'bg-amber-500/10' : isDenied ? 'bg-purple-950/40' : 'bg-white/5'
      }`}
    >
      <div className="card-header border-b border-white/5 pb-4 mb-6">
        <span className="flex items-center gap-2"><Zap size={14} className="money-green-pulse" /> ADVICE_ENCLAVE_v4</span>
        <span className={`font-black text-[10px] tracking-widest ${
          isSafe ? 'text-emerald-400' : isCaution ? 'text-amber-400' : isDenied ? 'text-purple-400' : 'text-slate-500'
        }`}>
          {verdict ? `SYSTEM_STATUS: ${verdict}` : 'AWAITING_INPUT...'}
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
              className={`flex flex-col gap-4 p-8 rounded-3xl border-b-8 ${
                isSafe 
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(57,255,20,0.15)]' 
                : isCaution
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                : 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Liquidity Status</div>
                  <div className={`text-3xl font-black mono uppercase ${
                    isSafe ? 'text-emerald-400' : isCaution ? 'text-amber-400' : 'text-purple-400'
                  }`}>
                    {isSafe ? 'Acceptable' : isCaution ? 'Margin_Caution' : 'Liquidity_Hazard'}
                  </div>
                </div>

                {isSafe ? (
                  <ShieldCheck size={48} className="text-emerald-400" />
                ) : isCaution ? (
                  <ShieldAlert size={48} className="text-amber-400" />
                ) : (
                  <ShieldAlert size={48} className="text-purple-400" />
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advice_Context</div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  {isSafe 
                    ? "Your projected liquidity covers all fixed costs, student loans, and this purchase while maintaining a 1.5x buffer."
                    : isCaution
                    ? "Caution: This purchase dips into your safety buffer. Your projected income still covers costs, but emergency reserves are thin."
                    : "Denied: This transaction would create a liquidity deficit against your $3,540 monthly liability."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-6 border-t border-white/5 grid grid-cols-4 gap-6">
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Fixed Bills</div>
            <div className="text-sm font-bold mono text-slate-300">${fixedExpenses.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Liability</div>
            <div className="text-sm font-bold mono text-orange-400">$3,540</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Available</div>
            <div className="text-sm font-bold mono text-emerald-400">${AVAILABLE_LIQUIDITY.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Buffer</div>
            <div className="text-sm font-bold mono text-slate-300">1.5X</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default VerdictGatekeeper;
