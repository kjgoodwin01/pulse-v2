import { db, sql } from './db/index';
import { transactions, debts, settings } from './db/schema';
import { eq } from 'drizzle-orm';

export const initSchema = async () => {
  // In a browser environment with SQLocal, we usually just run raw SQL for migrations
  // Since we are starting fresh, we can just create tables
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      is_recurring INTEGER DEFAULT 0,
      type TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      total_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      min_payment REAL NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `;

  // Seed data if empty
  const existingDebts = await db.select().from(debts);
  if (existingDebts.length === 0) {
    await db.insert(debts).values({
      name: 'Student Loan',
      total_amount: 35000,
      current_amount: 35000,
      interest_rate: 0.05,
      min_payment: 400
    });

    await sql`INSERT OR IGNORE INTO settings (key, value) VALUES ('initial_balance', '5000')`;

    const today = new Date().toISOString().split('T')[0];
    await db.insert(transactions).values([
      { date: today, amount: 2500, category: 'Salary', description: 'Monthly Paycheck', type: 'income', is_recurring: true },
      { date: today, amount: -1200, category: 'Rent', description: 'Monthly Rent', type: 'expense', is_recurring: true },
      { date: today, amount: -150, category: 'Groceries', description: 'Weekly Shopping', type: 'expense', is_recurring: false }
    ]);
  }
};
