import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Heartbeat = ({ forecastData }) => {
  return (
    <div style={{ height: '380px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
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
              backgroundColor: '#0d0f11', 
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              fontSize: '11px',
              fontFamily: 'Inter',
              fontWeight: 800,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#fff'
            }}
            itemStyle={{ color: '#00F2FF' }}
            labelStyle={{ color: '#475569', marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            cursor={{ stroke: 'rgba(0, 242, 255, 0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#00F2FF" 
            strokeWidth={3}
            fill="url(#glowGradient)"
            animationDuration={2000}
            style={{ filter: 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.3))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
