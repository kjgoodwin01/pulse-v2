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
              <stop offset="5%" stopColor="rgba(255, 255, 255, 0.15)" stopOpacity={1}/>
              <stop offset="95%" stopColor="rgba(255, 255, 255, 0)" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 9, family: 'JetBrains Mono', fontWeight: 700 }}
            interval={14}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 9, family: 'JetBrains Mono', fontWeight: 700 }}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(10, 10, 12, 0.9)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'Inter',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#fff" 
            strokeWidth={3}
            fill="url(#glowGradient)"
            animationDuration={1500}
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
