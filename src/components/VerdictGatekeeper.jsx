import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance, monthlyPayment = 3540, fixedExpenses = 0 }) => {
  const [proposedSpend, setProposedSpend] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Precision Engine 5.0
  const INFLOW = checkingBalance + (2 * 2363.99);
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
    }, 1200); // Slightly longer for tension
  };

  const isSafe = verdict === 'SAFE';
  const isCaution = verdict === 'CAUTION';
  const isDenied = verdict === 'DENIED';

  return (
    <div className="relative w-full">
      {/* Dynamic Aura behind the content when verdict is reached */}
      <AnimatePresence>
        {verdict && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            className="absolute inset-0 pointer-events-none rounded-full blur-[100px]"
            style={{
              background: isSafe ? '#10B981' : isCaution ? '#f59e0b' : '#ef4444'
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-16 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white mb-1">Gatekeeper</div>
            <span className="technical-label opacity-40">SIMULATION_ENGINE_v26</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 relative z-10">
        <div className="flex flex-col gap-6">
          <label className="technical-label opacity-60">Proposed_Capital_Allocation</label>
          <div className="flex gap-6 items-stretch">
            <div className="input-container-acrylic flex-1 flex items-center">
              <span className="text-2xl text-slate-500 font-bold mr-3">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={proposedSpend}
                onChange={(e) => setProposedSpend(e.target.value)}
                className="input-titanium w-full text-4xl font-bold mono bg-transparent outline-none"
              />
            </div>
            <button 
              onClick={handleSimulate}
              className="px-10 rounded-[24px] bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white font-bold tracking-wide transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center gap-3"
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 size={24} className="animate-spin text-white" /> : <ShieldCheck size={24} />}
              ANALYZE
            </button>
          </div>
        </div>

        <AnimatePresence>
          {verdict && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: 20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="overflow-hidden"
            >
              <div className="pt-12 mt-4 border-t border-white/[0.05] flex flex-col gap-12">
                <div>
                  <div className="technical-label opacity-40 mb-3">System_Verdict</div>
                  <div className={`text-6xl font-bold tracking-tighter ${
                    isSafe ? 'text-[#10B981]' : isCaution ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                  }`}>
                    {isSafe ? 'APPROVED' : isCaution ? 'CAUTION' : 'DENIED'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="p-6 bg-white/[0.02] rounded-[24px] border border-white/[0.02]">
                    <div className="technical-label opacity-40 mb-2">Projected_Inflow</div>
                    <div className="text-2xl font-bold mono text-white">${INFLOW.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-[24px] border border-white/[0.02]">
                    <div className="technical-label opacity-40 mb-2">Total_Liabilities</div>
                    <div className="text-2xl font-bold mono text-slate-400">${OUTFLOW.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-[24px] border border-white/[0.02]">
                    <div className="technical-label opacity-40 mb-2">Residue_Margin</div>
                    <div className={`text-2xl font-bold mono ${MARGIN > 0 ? 'text-[#10B981]' : 'text-[#ef4444]'}`}>
                      ${MARGIN.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[24px] bg-black/40 border border-white/5 shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]">
                  <p className="text-base text-slate-300 leading-relaxed">
                    {isSafe 
                      ? "Safe Allocation. Your projected liquidity comfortably covers all fixed costs, student loan minimums, and this purchase while maintaining a strict 1.5x buffer margin."
                      : isCaution
                      ? "Caution Required. This purchase dips into your safety buffer. Your projected income still covers absolute costs, but emergency reserves are temporarily compromised."
                      : "Action Denied. This transaction creates an immediate liability hazard against your non-negotiable $3,540 student loan payoff vector."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VerdictGatekeeper;
