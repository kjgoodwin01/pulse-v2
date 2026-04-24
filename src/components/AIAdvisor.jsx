import React, { useState, useEffect } from 'react';
import { Bot, Target, Plus, Trash2, Send, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../db';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';

const AIAdvisor = ({ checking, discover, fixed, loanPrincipal, loanMonthly, forecast, updateTick, apiKey, modelId }) => {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalMonth, setNewGoalMonth] = useState('August');
  const [aiResponse, setAiResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [updateTick]);

  const fetchData = async () => {
    const results = await db.select().from(settings);
    const goalsMatch = results.find(s => s.key === 'custom_goals');
    
    if (goalsMatch && goalsMatch.value) {
      try {
        setGoals(JSON.parse(goalsMatch.value));
      } catch (e) {
        console.error('Failed to parse goals', e);
      }
    }
  };

  const saveGoals = async (newGoals) => {
    setGoals(newGoals); // Optimistic UI update
    try {
      const val = JSON.stringify(newGoals);
      await db.insert(settings).values({ key: 'custom_goals', value: val }).onConflictDoUpdate({
        target: settings.key,
        set: { value: val }
      });
    } catch (e) {
      console.error("Failed to save goals to SQLite:", e);
    }
  };

  const addGoal = () => {
    if (!newGoalName || !newGoalAmount) return;
    const g = [...goals, { id: Date.now(), name: newGoalName, amount: parseFloat(newGoalAmount), month: newGoalMonth }];
    saveGoals(g);
    setNewGoalName('');
    setNewGoalAmount('');
  };

  const removeGoal = (id) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const analyze = async () => {
    if (!apiKey) {
      setAiResponse('ERROR: Claude API Key missing. Configure in System Settings.');
      return;
    }

    setIsAnalyzing(true);
    setAiResponse('');

    const systemPrompt = `You are the Pulse AI Chief Financial Officer. You provide hyper-analytical, aggressive, and highly strategic financial advice.

CURRENT STATE:
- Checking Liquidity: $${checking}
- Discover Balance: $${discover} (User tries to keep this under $1000/mo)
- Fixed Expenses: $${fixed}/mo
- Loan Liability: $${loanPrincipal} total ($${loanMonthly}/mo fixed payment)

90-DAY TRAJECTORY (Checking - Discover):
${forecast.filter((_, i) => i % 7 === 0).map(f => `${f.displayDate}: $${Math.floor(f.balance)}`).join('\n')}

UPCOMING GOALS:
${goals.map(g => `- ${g.name}: $${g.amount} (Target: ${g.month})`).join('\n')}

TASK:
Analyze the trajectory. Specifically identify any 3-paycheck months causing liquidity spikes. Tell the user exactly *when* they can safely execute their goals without breaching their $1000 Discover limit or missing their loan payment. Be concise, intense, and use formatting.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: modelId || 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: 'Analyze my trajectory and upcoming goals.' }],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(JSON.stringify(errData.error || errData));
      }
      const data = await response.json();
      setAiResponse(data.content[0].text);
    } catch (err) {
      setAiResponse(`ERROR: Connection to AI core failed. ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bento-grid">
      <div className="acrylic-card col-span-4 flex flex-col gap-6 max-h-[600px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <Target size={24} className="text-[#3b82f6]" />
          <h2 className="text-xl font-bold text-white">Goal_Planner</h2>
        </div>

        <div className="flex flex-col gap-4 p-5 rounded-[24px] bg-white/[0.02] border border-white/5">
          <input 
            placeholder="Goal Name (e.g., iPhone)" 
            className="input-titanium"
            value={newGoalName}
            onChange={e => setNewGoalName(e.target.value)}
          />
          <div className="flex gap-4">
            <input 
              type="number" 
              placeholder="$ Amount" 
              className="input-titanium w-1/2"
              value={newGoalAmount}
              onChange={e => setNewGoalAmount(e.target.value)}
            />
            <select 
              className="input-titanium w-1/2 cursor-pointer bg-[#0B101A]"
              value={newGoalMonth}
              onChange={e => setNewGoalMonth(e.target.value)}
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={addGoal}
            className="w-full py-3 mt-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> Lock Trajectory
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {goals.map(g => (
            <div key={g.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">{g.month}</div>
                <div className="text-lg font-bold text-white">{g.name}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold mono text-[#3b82f6]">${g.amount.toLocaleString()}</span>
                <button onClick={() => removeGoal(g.id)} className="text-slate-600 hover:text-rose-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="acrylic-card col-span-8 flex flex-col relative overflow-hidden min-h-[600px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-30" />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
              <Bot size={24} className="text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white mb-1">CFO_Core</div>
              <span className="technical-label opacity-40 uppercase">{modelId || 'CLAUDE_3_5_SONNET_ENGINE'}</span>
            </div>
          </div>

          <button 
            onClick={analyze}
            disabled={isAnalyzing || !apiKey}
            className="px-8 py-3 rounded-[24px] bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#3b82f6] font-bold tracking-wide transition-all flex items-center gap-2"
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {isAnalyzing ? 'PROCESSING...' : 'REQUEST ANALYSIS'}
          </button>
        </div>

        <div className="flex-1 rounded-[24px] bg-black/30 border border-white/5 p-6 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300">
          {!apiKey ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Bot size={48} className="mb-4 text-slate-600" />
              <p>AI Engine Offline.</p>
              <p>Supply a Claude API Key in System Settings to activate CFO Core.</p>
            </div>
          ) : !aiResponse && !isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Zap size={48} className="mb-4 text-[#3b82f6] opacity-30" />
              <p>Engine Ready.</p>
              <p>Lock your goals and request a strategic analysis.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="whitespace-pre-wrap"
            >
              {aiResponse}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
