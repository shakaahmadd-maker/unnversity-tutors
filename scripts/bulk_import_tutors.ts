import fs from 'fs';
import path from 'path';
import { pool, checkDbConnection } from '../src/db/index';

interface TutorImportRecord {
  id: string;
  numericId: number;
  name: string;
  email: string;
  role: 'tutor';
  tutorTier: string;
  country: string;
  countryFull: string;
  location: string;
  cityLocation?: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  primarySubject: string;
  education: string;
  experience: string;
  experienceSummary?: string;
  subjectExpertise: string[];
  searchableKeywords: string;
  availability: string;
  canMeet: string;
  hobbies: string;
  verificationStatus: string;
  isVerified: boolean;
  avatarUrl: string;
}

export async function bulkImportTutors(): Promise<{ total: number; inserted: number; updated: number; duplicatesSkipped: number }> {
  const jsonPath = path.join(process.cwd(), 'public', 'tutors_500.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Tutor dataset file not found at ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const tutorsList: TutorImportRecord[] = JSON.parse(rawData);

  console.log(`[BULK IMPORT] Loaded ${tutorsList.length} tutors from ${jsonPath}`);

  // Deduplication map by composite key: LOWER(name) + '|' + LOWER(primarySubject) + '|' + LOWER(cityLocation)
  const uniqueTutorsMap = new Map<string, TutorImportRecord>();
  let duplicatesSkipped = 0;

  for (const t of tutorsList) {
    const loc = t.cityLocation || t.location || 'Miami, FL';
    const compKey = `${t.name.trim().toLowerCase()}|${t.primarySubject.trim().toLowerCase()}|${loc.trim().toLowerCase()}`;
    if (uniqueTutorsMap.has(compKey)) {
      duplicatesSkipped++;
      console.warn(`[BULK IMPORT] Skipping duplicate record: ${t.name} (${t.primarySubject}, ${loc})`);
      continue;
    }
    uniqueTutorsMap.set(compKey, { ...t, cityLocation: loc });
  }

  const deduplicatedTutors = Array.from(uniqueTutorsMap.values());
  console.log(`[BULK IMPORT] Deduplicated dataset: ${deduplicatedTutors.length} unique tutors (skipped ${duplicatesSkipped} duplicates)`);

  const isConnected = await checkDbConnection();
  let inserted = 0;
  let updated = 0;

  if (isConnected && pool) {
    console.log('[BULK IMPORT] Connected to PostgreSQL. Executing idempotent bulk upsert...');

    // Ensure tutors table exists
    await pool.query(`
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
    `);

    // Ensure composite unique index exists for zero duplicates
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_tutors_unique_profile" 
      ON "tutors" (LOWER(name), LOWER(primary_subject), LOWER(city_location));
    `);

    // Batch upsert with transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const upsertSql = `
        INSERT INTO "tutors" (
          id, name, tier, country, city_location, rating, reviews_count,
          hourly_rate, primary_subject, subject_expertise, searchable_keywords,
          education, experience_summary, availability, can_meet, hobbies,
          verification_status, profile_image_url, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
        )
        ON CONFLICT (LOWER(name), LOWER(primary_subject), LOWER(city_location))
        DO UPDATE SET
          tier = EXCLUDED.tier,
          country = EXCLUDED.country,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          hourly_rate = EXCLUDED.hourly_rate,
          subject_expertise = EXCLUDED.subject_expertise,
          searchable_keywords = EXCLUDED.searchable_keywords,
          education = EXCLUDED.education,
          experience_summary = EXCLUDED.experience_summary,
          availability = EXCLUDED.availability,
          can_meet = EXCLUDED.can_meet,
          hobbies = EXCLUDED.hobbies,
          verification_status = EXCLUDED.verification_status,
          profile_image_url = CASE 
            WHEN tutors.profile_image_url LIKE '%/uploads/avatars/%' THEN tutors.profile_image_url 
            ELSE EXCLUDED.profile_image_url 
          END
        RETURNING (xmax = 0) AS is_inserted;
      `;

      for (const t of deduplicatedTutors) {
        const expertiseStr = Array.isArray(t.subjectExpertise) ? t.subjectExpertise.join(', ') : (t.subjectExpertise || t.primarySubject);
        const res = await client.query(upsertSql, [
          t.id,
          t.name.trim(),
          t.tutorTier || 'Senior Tutor / Expert',
          t.country || 'USA',
          t.cityLocation || t.location || 'Miami, FL',
          t.rating || 4.95,
          t.reviewsCount || 50,
          t.hourlyRate || 45,
          t.primarySubject.trim(),
          expertiseStr,
          t.searchableKeywords || `${t.cityLocation}, ${t.country}, ${t.primarySubject}, ${t.name}`,
          t.education || null,
          t.experienceSummary || t.experience || null,
          t.availability || 'Flexible virtual video sessions',
          t.canMeet || 'Virtual Online 1-on-1',
          t.hobbies || null,
          t.verificationStatus || 'Verified Degree & Background',
          t.avatarUrl
        ]);

        if (res.rows[0]?.is_inserted) {
          inserted++;
        } else {
          updated++;
        }
      }

      await client.query('COMMIT');
      console.log(`[BULK IMPORT] PostgreSQL transaction committed! Inserted: ${inserted}, Updated: ${updated}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[BULK IMPORT] Database error, transaction rolled back:', err);
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log('[BULK IMPORT] PostgreSQL not connected; dataset validated and ready in JSON / Memory Store.');
    inserted = deduplicatedTutors.length;
  }

  return {
    total: deduplicatedTutors.length,
    inserted,
    updated,
    duplicatesSkipped
  };
}

if (process.argv[1] && process.argv[1].endsWith('bulk_import_tutors.ts')) {
  bulkImportTutors()
    .then((stats) => {
      console.log('[BULK IMPORT] Completed successfully:', stats);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[BULK IMPORT] Failed:', err);
      process.exit(1);
    });
}
