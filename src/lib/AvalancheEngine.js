export function sim(loans, pmt) {
  if (!loans || !loans.length || pmt <= 0) return { mo: 0, ti: 0, pd: {}, sn: [] };
  
  // Clone and sort loans by highest interest rate first (Avalanche)
  const a = loans.map(l => ({ ...l })).sort((x, y) => y.rate - x.rate);
  
  let mo = 0, ti = 0;
  const sn = [], pd = {};
  
  // Initial snapshot (month 0)
  sn.push({ m: 0, ...Object.fromEntries(a.map(l => [l.name, l.balance])) });
  
  // Cap at 360 months (30 years) to prevent infinite loops
  while (a.some(l => l.balance > 0.01) && mo < 360) {
    mo++;
    
    // 1. Accrue Interest
    a.forEach(l => {
      if (l.balance > 0) {
        const i = l.balance * (l.rate / 12);
        l.balance += i;
        ti += i;
      }
    });
    
    let r = pmt;
    
    // 2. Pay minimums on all loans
    a.forEach(l => {
      if (l.balance > 0) {
        const p = Math.min(l.min, l.balance);
        l.balance -= p;
        r -= p;
      }
    });
    
    // 3. Apply remaining payment to the highest interest loan
    for (const l of a) {
      if (l.balance > 0 && r > 0) {
        const p = Math.min(r, l.balance);
        l.balance -= p;
        r -= p;
        break;
      }
    }
    
    // 4. Check if paid off this month
    a.forEach(l => {
      if (l.balance <= 0.01 && !pd[l.name]) {
        pd[l.name] = mo;
        l.balance = 0;
      }
    });
    
    // Save snapshot of balances at end of month
    sn.push({ m: mo, ...Object.fromEntries(a.map(l => [l.name, Math.max(0, l.balance)])) });
  }
  
  return { mo, ti, pd, sn };
}
