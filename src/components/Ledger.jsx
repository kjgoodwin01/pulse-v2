import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { transactions } from '../db/schema';
import { desc, like, or } from 'drizzle-orm';
import { Search, Plus, ListFilter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Ledger = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    let query = db.select().from(transactions).orderBy(desc(transactions.date));
    
    if (search) {
      query = query.where(
        or(
          like(transactions.description, `%${search}%`),
          like(transactions.category, `%${search}%`)
        )
      );
    }
    
    const results = await query;
    setData(results);
  };

  useEffect(() => {
    fetchTransactions();
  }, [search]);

  return (
    <div className="glass-card flex-1 overflow-hidden flex flex-col">
      <div className="card-header border-b border-white/5 pb-3 mb-0">
        <span className="flex items-center gap-2">
          <ListFilter size={12} className="text-white/40" /> 
          TRANSACTION ENCLAVE
        </span>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
            <input 
              type="text" 
              placeholder="FILTER_LEDGER..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-full py-1 pl-8 pr-4 text-[10px] mono font-bold focus:border-white/20 outline-none w-40 transition-all focus:w-56"
            />
          </div>
          <button className="flex items-center gap-1 text-[9px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition-all">
            <Plus size={10} /> ADD_ENTRY
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="pl-4">ENTITY</th>
              <th>CATEGORY</th>
              <th>STATUS</th>
              <th className="text-right pr-4">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => (
              <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="pl-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded bg-white/[0.03] border border-white/5 text-white/40 group-hover:text-white transition-colors`}>
                      {tx.amount < 0 ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} className="text-emerald-500" />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white/90 uppercase tracking-tight">{tx.description}</div>
                      <div className="text-[9px] mono text-slate-600 font-bold">{tx.date}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    {tx.category}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Settled</span>
                  </div>
                </td>
                <td className={`text-right pr-4 font-black mono text-[11px] ${tx.amount < 0 ? 'text-white' : 'text-emerald-400'}`}>
                  {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;
