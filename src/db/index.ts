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
      connectionTimeoutMillis: 4000,
      idleTimeoutMillis: 30000,
      statement_timeout: 12000,
      query_timeout: 12000,
      idle_in_transaction_session_timeout: 15000,
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
let lastDbCheckAt = 0;

export async function checkDbConnection(): Promise<boolean> {
  if (isConnectedState === true) return true;
  if (isConnectedState === false && Date.now() - lastDbCheckAt < 30000) {
    return false;
  }
  if (!pool || !hasDatabaseUrl) {
    isConnectedState = false;
    lastDbCheckAt = Date.now();
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnectedState = true;
    lastDbCheckAt = Date.now();
    console.log('[DB] Connected to PostgreSQL successfully.');
    return true;
  } catch {
    isConnectedState = false;
    lastDbCheckAt = Date.now();
    console.log('[DB] PostgreSQL is unreachable. Operating with resilient in-memory fallback.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnectedState === true;
}

export async function withDbTimeout<T>(promise: Promise<T>, timeoutMs = 12000, label = 'Database query'): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const err: any = new Error(`${label} timed out after ${timeoutMs}ms`);
          err.code = 'DB_TIMEOUT';
          err.statusCode = 504;
          reject(err);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
