import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema';

const { Pool } = pkg;

// Only read DATABASE_URL from process.env - no hardcoded credentials or defaults
export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

const shouldEnableSsl = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('sslmode=require') ||
   process.env.DATABASE_URL.includes('sslmode=no-verify') ||
   process.env.DATABASE_URL.includes('supabase.co') ||
   process.env.DATABASE_URL.includes('neon.tech') ||
   process.env.DATABASE_URL.includes('render.com'))
);

export const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      max: 20,
      ssl: shouldEnableSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    console.warn('[DB] PostgreSQL pool client notice:', err.message);
  });
}

export const db = pool ? drizzle(pool, { schema }) : null;
export { schema };

let isConnectedState: boolean | null = null;

export async function checkDbConnection(): Promise<boolean> {
  if (isConnectedState !== null) return isConnectedState;
  if (!pool || !hasDatabaseUrl) {
    isConnectedState = false;
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnectedState = true;
    console.log('[DB] Connected to PostgreSQL successfully.');
    return true;
  } catch (err: any) {
    isConnectedState = false;
    console.log('[DB] PostgreSQL is unreachable. Operating with resilient in-memory fallback.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnectedState === true;
}
