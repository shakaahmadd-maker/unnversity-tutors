-- Migration 0006: Add full_name and updated_at to users, create user_profiles and user_sessions tables
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "searchable_keywords" text;
--> statement-breakpoint
UPDATE "users" SET "full_name" = "name" WHERE "full_name" IS NULL;
--> statement-breakpoint
UPDATE "users" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"avatar_url" text,
	"bio" text,
	"country" text DEFAULT 'US',
	"location" text,
	"phone_number" text,
	"education" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_profiles_user_id" ON "user_profiles" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_profiles_email" ON "user_profiles" USING btree ("email");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_token_hash" text,
	"ip_address" text,
	"user_agent" text,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");
--> statement-breakpoint
-- Backfill user_profiles for existing users without deleting any existing records
INSERT INTO "user_profiles" ("id", "user_id", "full_name", "email", "role", "avatar_url", "bio", "country", "location", "phone_number", "education", "created_at", "updated_at")
SELECT
  'prof_' || u.id,
  u.id,
  COALESCE(u.full_name, u.name, 'Student User'),
  u.email,
  u.role,
  u.avatar_url,
  u.bio,
  COALESCE(u.country, 'US'),
  u.location,
  u.phone_number,
  u.education,
  u.created_at,
  COALESCE(u.updated_at, u.created_at)
FROM "users" u
WHERE NOT EXISTS (SELECT 1 FROM "user_profiles" up WHERE up.user_id = u.id)
ON CONFLICT ("id") DO NOTHING;
