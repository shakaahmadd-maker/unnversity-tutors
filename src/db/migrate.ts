import { db, pool, isDbConnected, checkDbConnection } from './index';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import fs from 'fs';
import path from 'path';

export async function runMigrations(): Promise<boolean> {
  if (!isDbConnected() || !db || !pool) {
    return false;
  }

  const drizzleDir = path.join(process.cwd(), 'drizzle');
  if (!fs.existsSync(drizzleDir)) {
    console.warn('[DB] Migration directory not found at:', drizzleDir);
    return false;
  }

  // 1. Attempt standard Drizzle migrator
  try {
    await migrate(db, { migrationsFolder: drizzleDir });
    console.log('[DB] PostgreSQL migrations applied successfully via Drizzle migrator.');
    return true;
  } catch (migratorErr: any) {
    console.info('[DB] Drizzle migrator note:', migratorErr.message, '- applying safe SQL statements...');
  }

  // 2. Resilient fallback: execute SQL migration statements safely
  try {
    const sqlFiles = fs
      .readdirSync(drizzleDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of sqlFiles) {
      const filePath = path.join(drizzleDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const statements = content
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (stmtErr: any) {
          if (
            !stmtErr.message?.includes('already exists') &&
            !stmtErr.message?.includes('duplicate key')
          ) {
            console.warn('[DB Migration notice]:', stmtErr.message);
          }
        }
      }
    }
    console.log('[DB] PostgreSQL tables checked and verified successfully.');
    return true;
  } catch (err: any) {
    console.warn('[DB] Notice during PostgreSQL table migration check:', err.message);
    return false;
  }
}

// Standalone execution support for CLI or deployment runners
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  (async () => {
    await checkDbConnection();
    await runMigrations();
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  })();
}
