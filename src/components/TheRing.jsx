import React, { useMemo } from 'react';

const sc = (v, g, w) => v > g ? "#10b981" : v > w ? "#fbbf24" : "#f43f5e";

const TheRing = ({ spent, target, daysRemaining, size = 220, stroke = 12 }) => {
  const pctUsed = Math.min(spent / target, 1);
  const rem = target - spent;
  const safe = Math.max(0, rem / (daysRemaining || 1));
  
  // Color scale based on safe daily spend
  const color = sc(safe, 25, 10);
  
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.78; // 78% of the circle is the track
  const off = arc * (1 - pctUsed);
  
  const gid = useMemo(() => `rg${Math.random().toString(36).slice(2, 6)}`, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="rounded-full blur-3xl opacity-20 transition-colors duration-700" 
          style={{ width: size * 0.6, height: size * 0.6, background: color }}
        />
      </div>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-225deg)" }}>
        {/* Track */}
        <circle 
          cx={size / 2} cy={size / 2} r={r} fill="none" 
          stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} 
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
        />
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        
        {/* Fill */}
        <circle 
          cx={size / 2} cy={size / 2} r={r} fill="none" 
          stroke={`url(#${gid})`} strokeWidth={stroke} 
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={off} strokeLinecap="round" 
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.6s ease" }}
        />
        
        {/* Outer Glow Fill */}
        <circle 
          cx={size / 2} cy={size / 2} r={r} fill="none" 
          stroke={color} strokeWidth={stroke + 6} 
          strokeDasharray={`2 ${circ}`} strokeDashoffset={off} strokeLinecap="round" opacity={0.3} 
          style={{ filter: "blur(4px)", transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.6s ease" }}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="text-4xl font-bold font-mono tracking-tighter transition-colors duration-700" 
          style={{ color: color }}
        >
          ${safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] font-bold tracking-[0.25em] mt-1 text-slate-500">TODAY</span>
      </div>
    </div>
  );
};

export default TheRing;
