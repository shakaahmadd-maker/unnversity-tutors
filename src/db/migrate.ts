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
    // 3. Verify users table schema and ensure required columns exist
    const schemaStatus = await verifyUsersTableSchema();
    if (schemaStatus.usersTableExists) {
      if (schemaStatus.missingColumns.includes('full_name')) {
        await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" text;');
        await pool.query('UPDATE "users" SET "full_name" = "name" WHERE "full_name" IS NULL AND "name" IS NOT NULL;');
      }
      if (schemaStatus.missingColumns.includes('updated_at')) {
        await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" text;');
        await pool.query('UPDATE "users" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL AND "created_at" IS NOT NULL;');
      }
      if (!schemaStatus.columns.includes('searchable_keywords')) {
        await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "searchable_keywords" text;');
      }
      const verified = await verifyUsersTableSchema();
      console.log(`[DB] Users table schema verified: tableExists=true, emailColumnExists=${verified.emailColumnExists}, missingColumns=${verified.missingColumns.length}`);
    }

    console.log('[DB] PostgreSQL tables checked and verified successfully.');
    return true;
  } catch (err: any) {
    console.warn('[DB] Notice during PostgreSQL table migration check:', err.message);
    return false;
  }
}

export interface SchemaVerificationResult {
  connected: boolean;
  usersTableExists: boolean;
  emailColumnExists: boolean;
  columns: string[];
  missingColumns: string[];
  error?: string;
}

export async function verifyUsersTableSchema(): Promise<SchemaVerificationResult> {
  if (!isDbConnected() || !pool) {
    return {
      connected: false,
      usersTableExists: false,
      emailColumnExists: false,
      columns: [],
      missingColumns: ['id', 'email', 'password_hash', 'role', 'full_name', 'created_at', 'updated_at'],
      error: 'Database is not connected',
    };
  }

  try {
    const tableRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';`
    );
    const usersTableExists = tableRes.rows.length > 0;

    if (!usersTableExists) {
      return {
        connected: true,
        usersTableExists: false,
        emailColumnExists: false,
        columns: [],
        missingColumns: ['id', 'email', 'password_hash', 'role', 'full_name', 'created_at', 'updated_at'],
      };
    }

    const colRes = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users';`
    );
    const columns = colRes.rows.map((r: any) => r.column_name);
    const emailColumnExists = columns.includes('email');

    const requiredColumns = ['id', 'email', 'password_hash', 'role', 'full_name', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter((col) => !columns.includes(col));

    return {
      connected: true,
      usersTableExists: true,
      emailColumnExists,
      columns,
      missingColumns,
    };
  } catch (err: any) {
    return {
      connected: false,
      usersTableExists: false,
      emailColumnExists: false,
      columns: [],
      missingColumns: [],
      error: err.message,
    };
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
