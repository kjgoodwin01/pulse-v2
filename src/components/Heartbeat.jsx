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
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05}/>
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 9, family: 'JetBrains Mono', fontWeight: 700 }}
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
            itemStyle={{ color: '#ffffff' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#ffffff" 
            strokeWidth={3}
            fill="url(#glowGradient)"
            animationDuration={2000}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
