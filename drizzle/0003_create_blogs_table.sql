CREATE TABLE IF NOT EXISTS "blogs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"tags" text NOT NULL,
	"published_at" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blogs_category" ON "blogs" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blogs_published_at" ON "blogs" USING btree ("published_at");
