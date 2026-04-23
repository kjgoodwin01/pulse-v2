import { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { transactions, settings } from '../db/schema';

export const useForecast = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateForecast = async () => {
      setLoading(true);
      const allTransactions = await db.select().from(transactions);
      const allSettings = await db.select().from(settings);
      
      const initialBalance = parseFloat(allSettings.find(s => s.key === 'initial_balance')?.value || 0);
      const currentBalance = allTransactions.reduce((acc, t) => acc + t.amount, initialBalance);

      const forecast = [];
      let runningBalance = currentBalance;
      const today = new Date();

      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Basic recurring logic for demo
        // In a real app, this would use a more sophisticated recurring schedule
        allTransactions.filter(t => t.is_recurring).forEach(t => {
          const tDate = new Date(t.date);
          if (date.getDate() === tDate.getDate()) {
            runningBalance += t.amount;
          }
        });

        forecast.push({
          date: dateStr,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: runningBalance,
        });
      }

      setData(forecast);
      setLoading(false);
    };

    calculateForecast();
  }, []);

  const burnRate = useMemo(() => {
    // Calculate daily average discretionary spending for last 7 days
    return 32.50; // Mocked for now
  }, [data]);

  return { forecast: data, loading, burnRate };
};
