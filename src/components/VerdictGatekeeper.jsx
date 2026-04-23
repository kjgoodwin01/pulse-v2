import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance, monthlyPayment = 3540, fixedExpenses = 0 }) => {
  const [proposedSpend, setProposedSpend] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Precision Engine 4.0
  const INFLOW = checkingBalance + (2 * 2363.99); // Next 30 days projection
  const OUTFLOW = discoverBalance + fixedExpenses + monthlyPayment;
  const MARGIN = INFLOW - OUTFLOW;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const spend = parseFloat(proposedSpend) || 0;
      const netMargin = MARGIN - spend;
      
      if (netMargin > (fixedExpenses * 1.5)) {
        setVerdict('SAFE');
      } else if (netMargin > 0) {
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
      className={`glass-card-4 transition-all duration-700 ${
        isSafe ? 'bg-emerald-500/10' : isCaution ? 'bg-amber-500/10' : isDenied ? 'bg-rose-500/10' : 'bg-white/5'
      }`}
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-emerald-500 animate-pulse" />
          <span className="technical-label">Gatekeeper_Precision_Engine_v4.0</span>
        </div>
        <div className="technical-label text-slate-400">
          {verdict ? `Status: ${verdict}` : 'Input_Required'}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <label className="technical-label">Proposed_Purchase_Value</label>
          <div className="flex gap-6 items-end">
            <div className="relative flex-1">
              <span className="absolute left-0 bottom-3 text-3xl font-black text-slate-500">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={proposedSpend}
                onChange={(e) => setProposedSpend(e.target.value)}
                className="fintech-input pl-10"
              />
            </div>
            <button 
              onClick={handleSimulate}
              className="btn-tactile flex items-center gap-3 whitespace-nowrap h-16 px-10"
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
              Simulate
            </button>
          </div>
        </div>

        <AnimatePresence>
          {verdict && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: 20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="overflow-hidden"
            >
              <div className={`p-8 rounded-[24px] border border-white/5 flex flex-col gap-6 ${
                isSafe ? 'bg-emerald-500/5' : isCaution ? 'bg-amber-500/5' : 'bg-rose-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="technical-label mb-2">System_Analysis</div>
                    <div className={`text-4xl font-black tracking-tighter uppercase ${
                      isSafe ? 'text-emerald-400' : isCaution ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {isSafe ? 'Acceptable' : isCaution ? 'Margin_Caution' : 'Liquidity_Hazard'}
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${isSafe ? 'bg-emerald-500/20' : isCaution ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}>
                    {isSafe ? <ShieldCheck size={32} className="text-emerald-400" /> : <ShieldAlert size={32} className={isCaution ? 'text-amber-400' : 'text-rose-400'} />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/5">
                  <div>
                    <div className="technical-label mb-1">Inflow_Projection</div>
                    <div className="text-lg font-black mono text-white">${INFLOW.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="technical-label mb-1">Liability_Total</div>
                    <div className="text-lg font-black mono text-rose-400">${OUTFLOW.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="technical-label mb-1">Net_Margin</div>
                    <div className={`text-lg font-black mono ${MARGIN > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${MARGIN.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-white/10 pl-6 py-2">
                  {isSafe 
                    ? "Logic verified. Projected cash flow maintains 1.5x buffer against fixed liabilities after transaction."
                    : isCaution
                    ? "Caution: Transaction verified but liquidity buffer is compressed. High hazard for unforeseen volatility."
                    : "Denied: Transaction creates immediate liability conflict with $3,540 student loan payoff vector."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VerdictGatekeeper;
