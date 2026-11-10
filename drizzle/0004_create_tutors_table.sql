CREATE TABLE IF NOT EXISTS "tutors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tier" varchar(100) DEFAULT 'Senior Tutor / Expert' NOT NULL,
	"country" varchar(100) DEFAULT 'USA' NOT NULL,
	"city_location" varchar(255) NOT NULL,
	"rating" numeric(3, 2) DEFAULT 4.90,
	"reviews_count" integer DEFAULT 0,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"primary_subject" varchar(255) NOT NULL,
	"subject_expertise" text NOT NULL,
	"searchable_keywords" text NOT NULL,
	"education" text,
	"experience_summary" text,
	"availability" varchar(255),
	"can_meet" varchar(255),
	"hobbies" text,
	"verification_status" varchar(100) DEFAULT 'Verified Degree & Background',
	"profile_image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tutors_unique_profile" ON "tutors" (LOWER(name), LOWER(primary_subject), LOWER(city_location));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tutors_searchable_keywords" ON "tutors" ("searchable_keywords");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tutors_name" ON "tutors" ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tutors_primary_subject" ON "tutors" ("primary_subject");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tutors_city_location" ON "tutors" ("city_location");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tutors_fts" ON "tutors" USING gin(to_tsvector('english', coalesce("name", '') || ' ' || coalesce("primary_subject", '') || ' ' || coalesce("city_location", '') || ' ' || coalesce("searchable_keywords", '')));
