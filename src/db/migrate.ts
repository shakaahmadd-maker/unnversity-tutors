import { pool, isDbConnected } from './index';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  if (!isDbConnected() || !pool) {
    return;
  }
  try {
    const migrationPath = path.join(process.cwd(), 'drizzle', '0000_init.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log('[DB] PostgreSQL tables successfully checked / migrated.');
    } else {
      console.warn('[DB] Migration file not found at:', migrationPath);
    }
  } catch (err: any) {
    console.warn('[DB] Notice during PostgreSQL table migration check:', err.message);
  }
}
