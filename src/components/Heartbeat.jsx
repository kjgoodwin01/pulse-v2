import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Heartbeat = ({ forecastData }) => {
  return (
    <div style={{ height: '380px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.06}/>
              <stop offset="95%" stopColor="#f8fafc" stopOpacity={0}/>
            </linearGradient>
            <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 10, family: 'Plus Jakarta Sans', fontWeight: 600 }}
            interval={14}
            dy={10}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(2, 6, 23, 0.8)', 
              backdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              fontSize: '13px',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
              color: '#f8fafc',
              padding: '12px 20px'
            }}
            itemStyle={{ color: '#f8fafc', fontFamily: 'JetBrains Mono', fontWeight: 700 }}
            labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#f8fafc" 
            strokeWidth={3}
            fill="url(#glowGradient)"
            animationDuration={2000}
            style={{ filter: 'url(#vectorGlow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
