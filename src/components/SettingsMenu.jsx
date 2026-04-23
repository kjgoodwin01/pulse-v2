import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Settings, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../db';
import { fixed_expenses, settings } from '../db/schema';
import { eq } from 'drizzle-orm';

const SettingsMenu = ({ isOpen, onClose, onUpdate }) => {
  const [expenses, setExpenses] = useState([]);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    fetchExpenses();
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchExpenses = async () => {
    const results = await db.select().from(fixed_expenses);
    setExpenses(results);
  };

  const handleAddExpense = async () => {
    if (!newName || !newAmount) return;
    await db.insert(fixed_expenses).values({
      name: newName,
      amount: parseFloat(newAmount)
    });
    setNewName('');
    setNewAmount('');
    fetchExpenses();
    onUpdate();
  };

  const handleDeleteExpense = async (id) => {
    await db.delete(fixed_expenses).where(eq(fixed_expenses.id, id));
    fetchExpenses();
    onUpdate();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="settings-menu"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-slate-400" />
                <h2 className="text-xl font-black uppercase tracking-widest text-white">System_Settings</h2>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <section className="mb-12">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block">Theme_Control</label>
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />}
                  <span className="text-sm font-bold uppercase tracking-widest">{theme === 'dark' ? 'OLED_DARK' : 'FINTECH_LIGHT'}</span>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </section>

            <section>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 block">Fixed_Expenses_Manager</label>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    placeholder="LABEL" 
                    className="input-glass"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="AMOUNT" 
                    className="input-glass"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAddExpense}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={16} /> Add Expense
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400">{exp.name}</div>
                      <div className="text-sm font-black mono text-white">${exp.amount.toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
