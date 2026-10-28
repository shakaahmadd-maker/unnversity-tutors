import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema';

const { Pool } = pkg;

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

export const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 2500,
      max: 20,
      ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
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
    console.log('[DB] PostgreSQL is currently unreachable. Operating with resilient in-memory storage.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnectedState === true;
}
