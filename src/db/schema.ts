import { pgTable, text, boolean, integer, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID mapping to users.id/users.uid
  role: text('role').notNull(), // 'student', 'tutor', 'admin'
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: text('created_at').notNull(),
  suspended: boolean('suspended').default(false),
  verified: boolean('verified').default(false),
  bio: text('bio'),
  hourlyRate: integer('hourly_rate'),
  rating: doublePrecision('rating'),
  reviewCount: integer('review_count'),
  country: text('country'),
});
