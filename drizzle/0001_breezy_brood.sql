CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_name" text,
	"user_role" text,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" text,
	"ip_address" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"student_email" text NOT NULL,
	"whatsapp_number" text,
	"subject" text NOT NULL,
	"academic_level" text,
	"deadline" text,
	"query" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"order_id" text,
	"sender_id" text NOT NULL,
	"receiver_id" text,
	"content" text NOT NULL,
	"file_url" text,
	"file_name" text,
	"is_system" boolean DEFAULT false,
	"read" boolean DEFAULT false,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"tutor_id" text,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"academic_level" text,
	"deadline" text NOT NULL,
	"pages" integer DEFAULT 1,
	"word_count" integer DEFAULT 250,
	"reference_style" text,
	"sources_count" integer DEFAULT 0,
	"instructions" text,
	"file_urls" text,
	"file_names" text,
	"budget" double precision,
	"quote_amount" double precision,
	"status" text DEFAULT 'Pending Tutor Assignment' NOT NULL,
	"escrow_status" text DEFAULT 'pending',
	"progress_percent" integer DEFAULT 0,
	"tutor_work_file_url" text,
	"tutor_work_file_name" text,
	"reviewed" boolean DEFAULT false,
	"created_at" text NOT NULL,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text,
	"order_id" text,
	"inquiry_id" text,
	"tutor_id" text,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'USD',
	"estimated_hours" integer DEFAULT 1,
	"service_type" text,
	"delivery_time" text,
	"scope_of_work" text,
	"advance_percentage" integer DEFAULT 50,
	"advance_amount" double precision,
	"balance_amount" double precision,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"avatar_url" text NOT NULL,
	"created_at" text NOT NULL,
	"suspended" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"bio" text,
	"hourly_rate" integer,
	"rating" double precision,
	"review_count" integer,
	"subjects" text,
	"country" text,
	"location" text,
	"phone_number" text,
	"education" text,
	"experience" text,
	"subject_expertise" text,
	"availability" text,
	"can_meet" text,
	"hobbies" text,
	"is_approved" boolean DEFAULT true,
	"status" text DEFAULT 'active',
	"available_slots" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;