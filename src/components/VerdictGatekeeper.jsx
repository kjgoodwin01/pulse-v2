import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerdictGatekeeper = ({ checkingBalance, discoverBalance, monthlyPayment = 3540, fixedExpenses = 0 }) => {
  const [proposedSpend, setProposedSpend] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Precision Engine 4.5
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
    }, 800);
  };

  const isSafe = verdict === 'SAFE';
  const isCaution = verdict === 'CAUTION';
  const isDenied = verdict === 'DENIED';

  return (
    <motion.div 
      layout
      className="glass-card-satin relative overflow-hidden"
      style={{
        boxShadow: isSafe 
          ? '0 0 40px rgba(16, 185, 129, 0.05), inset 0 0 20px rgba(16, 185, 129, 0.02)' 
          : isCaution 
          ? '0 0 40px rgba(212, 175, 55, 0.05), inset 0 0 20px rgba(212, 175, 55, 0.02)'
          : isDenied
          ? '0 0 40px rgba(136, 8, 8, 0.05), inset 0 0 20px rgba(136, 8, 8, 0.02)'
          : 'none'
      }}
    >
      {/* Subtle Edge Glow Overlay */}
      <AnimatePresence>
        {verdict && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.2)' : isCaution ? 'rgba(212, 175, 55, 0.2)' : 'rgba(136, 8, 8, 0.2)'}`,
              borderRadius: '32px'
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <Zap size={16} className="emerald-breath" />
          <span className="technical-label text-slate-400">LIQUIDITY_GATEKEEPER_v4.5</span>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <label className="technical-label">Simulate_Purchase_Amount</label>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <input 
                type="number" 
                placeholder="0.00"
                value={proposedSpend}
                onChange={(e) => setProposedSpend(e.target.value)}
                className="input-satin-inset w-full"
              />
            </div>
            <button 
              onClick={handleSimulate}
              className="btn-satin flex items-center gap-3"
              disabled={isSimulating}
            >
              {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Analyze
            </button>
          </div>
        </div>

        <AnimatePresence>
          {verdict && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="overflow-hidden"
            >
              <div className="pt-8 border-t border-white/5 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="technical-label mb-2">Verdict_Analysis</div>
                    <div className={`text-4xl font-light tracking-tight ${
                      isSafe ? 'text-[#10B981]' : isCaution ? 'text-[#D4AF37]' : 'text-[#880808]'
                    }`}>
                      {isSafe ? 'Transaction_Approved' : isCaution ? 'Margin_Caution' : 'Liquidity_Denied'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="technical-label mb-1">Monthly_Inflow</div>
                    <div className="text-lg font-medium text-white">${INFLOW.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="technical-label mb-1">Total_Liabilities</div>
                    <div className="text-lg font-medium text-slate-300">${OUTFLOW.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="technical-label mb-1">Remaining_Margin</div>
                    <div className={`text-lg font-medium ${MARGIN > 0 ? 'text-[#10B981]' : 'text-[#880808]'}`}>
                      ${MARGIN.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {isSafe 
                    ? "Safe. Your projected liquidity covers all fixed costs, student loans, and this purchase while maintaining a professional 1.5x buffer."
                    : isCaution
                    ? "Caution. This purchase dips into your safety buffer. Your projected income still covers costs, but emergency reserves are thin."
                    : "Denied. Transaction creates an immediate liability hazard against your non-negotiable $3,540 student loan payoff vector."}
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
