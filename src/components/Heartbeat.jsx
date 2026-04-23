import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Heartbeat = ({ forecastData }) => {
  return (
    <div style={{ height: '380px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.03}/>
              <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.015)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 9, family: 'Inter', fontWeight: 500 }}
            interval={14}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: '24px',
              fontSize: '11px',
              fontFamily: 'Inter',
              fontWeight: 500,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#fff'
            }}
            itemStyle={{ color: '#F8FAFC' }}
            labelStyle={{ color: '#475569', marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.05)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#F8FAFC" 
            strokeWidth={1.5}
            fill="url(#glowGradient)"
            animationDuration={2500}
            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.2))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Heartbeat;
