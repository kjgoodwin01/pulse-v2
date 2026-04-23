import React, { useState, useRef } from 'react';
import { db } from '../db';
import { settings, transactions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Camera, RefreshCw, DollarSign, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

const AutomationModule = ({ onUpdate, onOcrResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const [manualSync, setManualSync] = useState('');
  const fileInputRef = useRef(null);

  const handlePayday = async () => {
    setShimmer(true);
    try {
      const results = await db.select().from(settings).where(eq(settings.key, 'current_checking_balance'));
      const current = parseFloat(results[0]?.value || 0);
      const next = current + 2363.99;
      
      await db.insert(settings).values({ key: 'current_checking_balance', value: next.toString() }).onConflictDoUpdate({
        target: settings.key,
        set: { value: next.toString() }
      });
      
      await db.insert(transactions).values({
        date: new Date().toISOString().split('T')[0],
        amount: 2363.99,
        category: 'Salary',
        description: 'Monthly Paycheck (PULSE_OS_AUTO)',
        type: 'income',
        is_recurring: true
      });

      if (onUpdate) onUpdate();
      setTimeout(() => setShimmer(false), 2000);
    } catch (err) {
      console.error('Payday trigger failed:', err);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      const amountMatch = text.match(/\$\d+\.\d{2}/);
      const amount = amountMatch ? parseFloat(amountMatch[0].replace('$', '')) : 45.00;
      const merchant = text.length > 5 ? text.substring(0, 15).trim() : 'Discover Transaction';

      await db.insert(transactions).values({
        date: new Date().toISOString().split('T')[0],
        amount: -amount,
        category: 'Credit Card',
        description: `${merchant} (OCR_SNAP)`,
        type: 'expense',
        is_recurring: false
      });

      if (onOcrResult) onOcrResult(amount);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('OCR Scanning failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSync = async () => {
    if (!manualSync) return;
    try {
      await db.insert(settings).values({ key: 'current_checking_balance', value: manualSync }).onConflictDoUpdate({
        target: settings.key,
        set: { value: manualSync }
      });
      setManualSync('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Manual sync failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card flex items-center justify-between gap-4 p-4 border-[#eab308]/20">
        <div className="flex flex-col">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Payday Trigger</div>
          <div className={`text-xl font-black mono ${shimmer ? 'shimmer-text' : 'text-[#f8fafc]'}`}>
            $2,363.99
          </div>
        </div>
        <button 
          onClick={handlePayday} 
          className="btn-chrome flex items-center gap-2"
          style={{ 
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)',
            color: '#000',
            fontWeight: '900',
            border: 'none',
            boxShadow: '0 0 15px rgba(255,255,255,0.2)'
          }}
        >
          <DollarSign size={14} />
          Post Paycheck
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Discover OCR Scanner</div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[10px] font-black text-[#3b82f6] uppercase tracking-wider"
          >
            {isScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {isScanning ? 'Scanning...' : 'Snap Receipt'}
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleScreenshotUpload} 
        />

        {isScanning && (
          <div className="scanner-container h-24 flex items-center justify-center">
            <div className="scan-line" />
            <div className="text-[10px] text-slate-500 mono animate-pulse">ANALYZING_DATA_STREAM...</div>
          </div>
        )}
      </div>

      <div className="glass-card p-4 flex items-center gap-3">
        <input
          type="number"
          placeholder="RESET_CHECKING_BALANCE"
          value={manualSync}
          onChange={(e) => setManualSync(e.target.value)}
          className="bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mono text-white w-full focus:border-[#3b82f6] outline-none"
        />
        <button onClick={handleManualSync} className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-slate-400">
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
};

export default AutomationModule;
