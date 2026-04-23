import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { SQLocal } from 'sqlocal';
import * as schema from './schema';

const sqlocal = new SQLocal('pulse_db.sqlite3');
const { sql } = sqlocal;

export const db = drizzle(
  async (sqlStr, params, method) => {
    try {
      // Use the .exec method for raw strings from drizzle
      const results = await sqlocal.exec(sqlStr, params);
      
      if (method === 'all' || method === 'values') {
        return { rows: results };
      }
      return { rows: [] };
    } catch (e) {
      console.error('Error in drizzle sqlite-proxy:', e);
      return { rows: [] };
    }
  },
  { schema }
);

export { sql };
