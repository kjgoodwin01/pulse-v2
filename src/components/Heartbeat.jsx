import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity } from 'lucide-react';

const Heartbeat = ({ forecastData }) => {
  return (
    <div className="glass-card" style={{ height: '380px' }}>
      <div className="card-header">
        <span className="flex items-center gap-2">
          <Activity size={14} className="text-white/40" /> 
          CASH FLOW HEARTBEAT
        </span>
        <span className="mono text-[9px] text-slate-500 font-bold">MODEL_ALPHA_v2.0</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 9, family: 'JetBrains Mono', fontWeight: 700 }}
            interval={14}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#13172a', 
              backdropFilter: 'blur(12px)',
              border: 'none',
              borderRadius: '16px',
              fontSize: '11px',
              fontFamily: 'Inter',
              fontWeight: 800,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#fff'
            }}
            itemStyle={{ color: '#39FF14' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            cursor={{ stroke: 'rgba(57, 255, 20, 0.2)', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#39FF14" 
            strokeWidth={4}
            fill="url(#glowGradient)"
            animationDuration={2000}
            style={{ filter: 'drop-shadow(0 0 15px rgba(57, 255, 20, 0.4))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
