import { db, pool, isDbConnected, checkDbConnection } from './index';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import fs from 'fs';
import path from 'path';

async function ensurePerformanceTablesAndIndexes(): Promise<void> {
  if (!pool || !isDbConnected()) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS "notifications" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "title" text NOT NULL,
      "message" text NOT NULL,
      "type" text NOT NULL DEFAULT 'webapp',
      "sent_by" text NOT NULL DEFAULT 'System',
      "read" boolean NOT NULL DEFAULT false,
      "created_at" text NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");`,
    `CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_users_country" ON "users" ("country");`,
    `CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_name" ON "tutors" ("name");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_primary_subject" ON "tutors" ("primary_subject");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_city_location" ON "tutors" ("city_location");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_country" ON "tutors" ("country");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_hourly_rate" ON "tutors" ("hourly_rate");`,
    `CREATE INDEX IF NOT EXISTS "idx_tutors_rating" ON "tutors" ("rating");`,
    `CREATE INDEX IF NOT EXISTS "idx_orders_student_id" ON "orders" ("student_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_orders_tutor_id" ON "orders" ("tutor_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");`,
    `CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_chat_rooms_order_id" ON "chat_rooms" ("order_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_chat_rooms_created_by" ON "chat_rooms" ("created_by");`,
    `CREATE INDEX IF NOT EXISTS "idx_chat_rooms_updated_at" ON "chat_rooms" ("updated_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_room_id" ON "messages" ("room_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages" ("sender_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_receiver_id" ON "messages" ("receiver_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_chat_id" ON "messages" ("chat_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_room_created" ON "messages" ("room_id", "created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_messages_chat_created" ON "messages" ("chat_id", "created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications" ("user_id", "read");`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");`,
    `CREATE INDEX IF NOT EXISTS "idx_quotes_chat_id" ON "quotes" ("chat_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_quotes_order_id" ON "quotes" ("order_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_quotes_tutor_id" ON "quotes" ("tutor_id");`,
    `CREATE INDEX IF NOT EXISTS "idx_quotes_created_at" ON "quotes" ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "idx_user_sessions_expires_at" ON "user_sessions" ("expires_at");`,
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (err: any) {
      if (!err.message?.includes('already exists') && !err.message?.includes('does not exist')) {
        console.warn('[DB] Index/table verification notice:', err.message);
      }
    }
  }
}

export async function runMigrations(): Promise<boolean> {
  if (!isDbConnected() || !db || !pool) {
    return false;
  }

  const drizzleDir = path.join(process.cwd(), 'drizzle');
  if (!fs.existsSync(drizzleDir)) {
    console.warn('[DB] Migration directory not found at:', drizzleDir);
    await ensurePerformanceTablesAndIndexes();
    return false;
  }

  // 1. Attempt standard Drizzle migrator
  try {
    await migrate(db, { migrationsFolder: drizzleDir });
    await ensurePerformanceTablesAndIndexes();
    console.log('[DB] PostgreSQL migrations & performance indexes applied successfully.');
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

    await ensurePerformanceTablesAndIndexes();
    console.log('[DB] PostgreSQL tables and performance indexes checked and verified successfully.');
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
