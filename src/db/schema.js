import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  category: text('category'),
  description: text('description'),
  is_recurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  type: text('type').notNull(),
});

export const debts = sqliteTable('debts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  total_amount: real('total_amount').notNull(),
  current_amount: real('current_amount').notNull(),
  interest_rate: real('interest_rate').notNull(),
  min_payment: real('min_payment').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});
