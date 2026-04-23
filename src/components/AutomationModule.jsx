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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center p-8 border-b border-white/[0.05]">
        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2">Payday Trigger</div>
        <div className={`text-3xl font-bold mono ${shimmer ? 'shimmer-text' : 'text-[#f8fafc]'} mb-6`}>
          $2,363.99
        </div>
        <button 
          onClick={handlePayday} 
          className="btn-slate-minimal flex items-center justify-center gap-2 w-full bg-white/[0.05] border-white/10 hover:bg-white/[0.1]"
        >
          <DollarSign size={16} />
          Post Paycheck
        </button>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center gap-4 border-b border-white/[0.05]">
        <div className="flex justify-between items-center">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">OCR Scanner</div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider hover:text-white transition-colors"
          >
            {isScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {isScanning ? 'Scanning' : 'Snap'}
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
          <div className="scanner-container h-16 flex items-center justify-center">
            <div className="scan-line" />
            <div className="text-[10px] text-slate-500 mono animate-pulse">ANALYZING...</div>
          </div>
        )}
      </div>

      <div className="p-8 flex items-center gap-4">
        <input
          type="number"
          placeholder="RESET_CHECKING"
          value={manualSync}
          onChange={(e) => setManualSync(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm mono text-white w-full focus:border-[#3b82f6] outline-none"
        />
        <button onClick={handleManualSync} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default AutomationModule;
