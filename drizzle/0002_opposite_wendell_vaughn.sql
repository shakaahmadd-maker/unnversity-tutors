CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"order_id" text,
	"type" text DEFAULT 'direct' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_room_members" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "room_id" text;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "updated_at" text;
--> statement-breakpoint
-- Safe backfill for existing messages to create corresponding chat_rooms
INSERT INTO "chat_rooms" ("id", "title", "order_id", "type", "created_by", "created_at", "updated_at")
SELECT
  m.chat_id,
  'Chat ' || m.chat_id,
  m.order_id,
  CASE WHEN m.order_id IS NOT NULL THEN 'order' ELSE 'direct' END,
  m.sender_id,
  MIN(m.created_at),
  MAX(m.created_at)
FROM "messages" m
WHERE NOT EXISTS (SELECT 1 FROM "chat_rooms" cr WHERE cr.id = m.chat_id)
GROUP BY m.chat_id, m.order_id, m.sender_id
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
UPDATE "messages" SET "room_id" = "chat_id" WHERE "room_id" IS NULL;
--> statement-breakpoint
UPDATE "messages" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
--> statement-breakpoint
-- Safe backfill for room members from senders
INSERT INTO "chat_room_members" ("id", "room_id", "user_id", "role", "joined_at")
SELECT
  'crm_' || m.chat_id || '_' || m.sender_id,
  m.chat_id,
  m.sender_id,
  'member',
  MIN(m.created_at)
FROM "messages" m
WHERE NOT EXISTS (
  SELECT 1 FROM "chat_room_members" crm WHERE crm.room_id = m.chat_id AND crm.user_id = m.sender_id
)
GROUP BY m.chat_id, m.sender_id
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Safe backfill for room members from receivers
INSERT INTO "chat_room_members" ("id", "room_id", "user_id", "role", "joined_at")
SELECT
  'crm_' || m.chat_id || '_' || m.receiver_id,
  m.chat_id,
  m.receiver_id,
  'member',
  MIN(m.created_at)
FROM "messages" m
WHERE m.receiver_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "chat_room_members" crm WHERE crm.room_id = m.chat_id AND crm.user_id = m.receiver_id
)
GROUP BY m.chat_id, m.receiver_id
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_room_members_room" ON "chat_room_members" USING btree ("room_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_room_members_user" ON "chat_room_members" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_room_id" ON "messages" USING btree ("room_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages" USING btree ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_chat_id" ON "messages" USING btree ("chat_id");