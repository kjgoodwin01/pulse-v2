import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Plus, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { sim } from '../lib/AvalancheEngine';

// Colors for chart stacks
const LC = ["#ef4444", "#f59e0b", "#3b82f6", "#06b6d4", "#10b981", "#a855f7", "#ec4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs bg-[#0f172a]/95 border border-white/10 backdrop-blur-md">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.stroke }} className="font-mono">
          {p.name}: ${p.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
};

const LoansTab = ({ loans, loanMonthlyPayment, onUpdateLoans, onUpdatePayment }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(null); // loan id
  const [payAmt, setPayAmt] = useState("");
  const [newLoan, setNewLoan] = useState({ name: "", balance: "", rate: "", min: "" });

  const s = useMemo(() => sim(loans, loanMonthlyPayment), [loans, loanMonthlyPayment]);
  const total = loans.reduce((a, l) => a + l.balance, 0);
  const sorted = [...loans].sort((a, b) => b.rate - a.rate);
  
  const mn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pd = (m) => {
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    return `${mn[d.getMonth()]} ${d.getFullYear()}`;
  };
  
  const cd = s.sn.map(snap => ({ m: snap.m, ...snap }));

  const handleAddLoan = () => {
    const loan = { 
      id: `l${Date.now()}`, 
      name: newLoan.name, 
      balance: parseFloat(newLoan.balance) || 0, 
      rate: (parseFloat(newLoan.rate) || 0) / 100, 
      min: parseFloat(newLoan.min) || 0 
    };
    if (!loan.name || !loan.balance) return;
    onUpdateLoans([...loans, loan]);
    setNewLoan({ name: "", balance: "", rate: "", min: "" });
    setAddOpen(false);
  };

  const handleRemoveLoan = (id) => {
    onUpdateLoans(loans.filter(l => l.id !== id));
  };

  const handlePayment = () => {
    const amt = parseFloat(payAmt) || 0;
    if (!amt || !payOpen) return;
    const updated = loans.map(l => l.id === payOpen ? { ...l, balance: Math.max(0, l.balance - amt) } : l).filter(l => l.balance > 0);
    onUpdateLoans(updated);
    setPayOpen(null);
    setPayAmt("");
  };

  return (
    <div className="bento-grid">
      
      {/* Summary Card */}
      <div className="acrylic-card col-span-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="technical-label opacity-40">TOTAL DEBT</span>
            <div className="mt-2 text-4xl font-bold text-rose-500 font-mono tracking-tight">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <span className="technical-label opacity-40">DEBT-FREE</span>
            <div className="mt-2 text-2xl font-bold text-[#10b981] font-mono">
              {s.mo > 0 ? pd(s.mo) : "—"}
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 mt-8 pt-6 border-t border-white/5">
          <div>
            <p className="technical-label opacity-40 mb-2">FIXED LIABILITY</p>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">$</span>
              <input 
                type="number"
                value={loanMonthlyPayment || ""}
                onChange={(e) => onUpdatePayment(parseFloat(e.target.value) || 0)}
                className="input-titanium text-xl font-bold mono w-[120px]"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <p className="technical-label opacity-40 mb-2">INTEREST LOSS</p>
            <p className="text-xl font-bold text-amber-500 font-mono">${s.ti.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
          </div>
          <div>
            <p className="technical-label opacity-40 mb-2">HORIZON</p>
            <p className="text-xl font-bold text-white font-mono">{s.mo} MO</p>
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="acrylic-card col-span-7 relative min-h-[300px]">
        <div className="absolute top-6 left-6 technical-label opacity-40">PAYOFF WATERFALL</div>
        
        {loans.length > 0 ? (
          <div className="mt-8 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cd} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {sorted.map((l, i) => (
                    <linearGradient key={l.name} id={`lc${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LC[i % LC.length]} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={LC[i % LC.length]} stopOpacity={0.03} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="m" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                {[...sorted].reverse().map((l, i) => (
                  <Area key={l.name} type="monotone" dataKey={l.name} stackId="1" stroke="none" fill={`url(#lc${sorted.length - 1 - i})`} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
            <ShieldCheck size={48} className="mb-4 text-[#10b981]" />
            <p className="font-bold">No Active Debts</p>
          </div>
        )}
      </div>

      {/* Avalanche Order List */}
      <div className="acrylic-card col-span-12">
        <div className="flex items-center justify-between mb-6">
          <span className="technical-label opacity-40">AVALANCHE ORDER</span>
          <button onClick={() => setAddOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider text-[#3b82f6] bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all flex items-center gap-2">
            <Plus size={14} /> ADD LOAN
          </button>
        </div>

        <div className="space-y-3">
          {sorted.map((l, i) => {
            const t = i === 0;
            const pm = s.pd[l.name] || s.mo;
            return (
              <div key={l.id || l.name} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${t ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full" style={{ background: LC[i % LC.length] }} />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{l.name}</span>
                      {t && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider text-rose-500 bg-rose-500/10">TARGET</span>}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {(l.rate * 100).toFixed(2)}% · Min ${(l.min || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="text-xl font-bold text-white font-mono">${l.balance.toLocaleString()}</span>
                    <p className="text-xs font-bold text-[#10b981]">{pd(pm)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => { setPayOpen(l.id || l.name); setPayAmt(""); }} className="px-3 py-2 rounded-xl text-[10px] font-bold tracking-wider text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/20 transition-all">
                      PAY
                    </button>
                    <button onClick={() => handleRemoveLoan(l.id || l.name)} className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Loan Overlay */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md p-6 rounded-3xl bg-[#0B101A] border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Add Debt Liability</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="technical-label opacity-50 block mb-2">LOAN NAME</label>
                  <input value={newLoan.name} onChange={e => setNewLoan({...newLoan, name: e.target.value})} placeholder="e.g. Navient Subsidized" className="input-titanium w-full" />
                </div>
                <div>
                  <label className="technical-label opacity-50 block mb-2">CURRENT BALANCE ($)</label>
                  <input type="number" value={newLoan.balance} onChange={e => setNewLoan({...newLoan, balance: e.target.value})} placeholder="5000.00" className="input-titanium w-full" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="technical-label opacity-50 block mb-2">INTEREST RATE (%)</label>
                    <input type="number" value={newLoan.rate} onChange={e => setNewLoan({...newLoan, rate: e.target.value})} placeholder="4.74" className="input-titanium w-full" />
                  </div>
                  <div className="flex-1">
                    <label className="technical-label opacity-50 block mb-2">MIN PAYMENT ($)</label>
                    <input type="number" value={newLoan.min} onChange={e => setNewLoan({...newLoan, min: e.target.value})} placeholder="50.00" className="input-titanium w-full" />
                  </div>
                </div>
              </div>
              
              <button onClick={handleAddLoan} className="w-full py-3 rounded-xl bg-[#3b82f6] text-white font-bold tracking-wide hover:bg-[#2563eb] transition-all">
                ADD LIABILITY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Loan Overlay */}
      <AnimatePresence>
        {payOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPayOpen(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm p-6 rounded-3xl bg-[#0B101A] border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Apply Payment</h3>
              <p className="text-xs text-slate-400 mb-6">Enter payment amount to deduct from the balance. Avalanche will recalculate automatically.</p>
              
              <div className="mb-6">
                <label className="technical-label opacity-50 block mb-2">PAYMENT AMOUNT</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} placeholder="0.00" className="input-titanium w-full pl-8" autoFocus />
                </div>
              </div>
              
              <button onClick={handlePayment} className="w-full py-3 rounded-xl bg-[#10b981] text-white font-bold tracking-wide hover:bg-[#059669] transition-all">
                SUBMIT PAYMENT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LoansTab;
