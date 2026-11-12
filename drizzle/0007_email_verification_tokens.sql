CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"used_at" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_verification_token_hash" ON "email_verification_tokens" ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_user_id" ON "email_verification_tokens" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_email" ON "email_verification_tokens" ("email");
