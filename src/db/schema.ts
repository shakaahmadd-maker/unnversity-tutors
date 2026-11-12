import { pgTable, text, boolean, integer, doublePrecision, index, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. Users Table (Students, Tutors, and Admins / Subadmins)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  role: text('role').notNull(), // 'student', 'tutor', 'admin'
  name: text('name').notNull(),
  fullName: text('full_name'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
  suspended: boolean('suspended').default(false),
  verified: boolean('verified').default(false),
  bio: text('bio'),
  hourlyRate: integer('hourly_rate'),
  rating: doublePrecision('rating'),
  reviewCount: integer('review_count'),
  subjects: text('subjects'), // JSON stringified array e.g. ["Math", "Physics"]
  country: text('country'),
  location: text('location'),
  phoneNumber: text('phone_number'),
  education: text('education'),
  experience: text('experience'),
  subjectExpertise: text('subject_expertise'), // JSON stringified array
  availability: text('availability'),
  canMeet: text('can_meet'),
  hobbies: text('hobbies'),
  isApproved: boolean('is_approved').default(true),
  status: text('status').default('active'),
  availableSlots: text('available_slots'), // JSON stringified array
  searchableKeywords: text('searchable_keywords'),
});

// 2. Orders Table (Assignments & Tutoring Requests)
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  tutorId: text('tutor_id').references(() => users.id),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  academicLevel: text('academic_level'),
  deadline: text('deadline').notNull(),
  pages: integer('pages').default(1),
  wordCount: integer('word_count').default(250),
  referenceStyle: text('reference_style'),
  sourcesCount: integer('sources_count').default(0),
  instructions: text('instructions'),
  fileUrls: text('file_urls'), // JSON stringified array
  fileNames: text('file_names'), // JSON stringified array
  budget: doublePrecision('budget'),
  quoteAmount: doublePrecision('quote_amount'),
  status: text('status').notNull().default('Pending Tutor Assignment'),
  escrowStatus: text('escrow_status').default('pending'), // 'pending' | 'escrow' | 'released' | 'refunded'
  progressPercent: integer('progress_percent').default(0),
  tutorWorkFileUrl: text('tutor_work_file_url'),
  tutorWorkFileName: text('tutor_work_file_name'),
  reviewed: boolean('reviewed').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

// 3. Inquiries Table (Get a Quote & WhatsApp Inquiries)
export const inquiries = pgTable('inquiries', {
  id: text('id').primaryKey(),
  studentName: text('student_name').notNull(),
  studentEmail: text('student_email').notNull(),
  whatsappNumber: text('whatsapp_number'),
  subject: text('subject').notNull(),
  academicLevel: text('academic_level'),
  deadline: text('deadline'),
  query: text('query').notNull(),
  status: text('status').notNull().default('new'), // 'new', 'in_review', 'quoted', 'converted', 'closed'
  createdAt: text('created_at').notNull(),
});

// 4. Chat Rooms Table (Multi-user and Direct Chat Rooms)
export const chatRooms = pgTable('chat_rooms', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  orderId: text('order_id').references(() => orders.id),
  type: text('type').notNull().default('direct'), // 'direct' | 'order' | 'support' | 'group'
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 5. Chat Room Members Table (Membership and Permissions)
export const chatRoomMembers = pgTable('chat_room_members', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => chatRooms.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('member'), // 'creator' | 'member' | 'tutor' | 'admin' | 'subadmin'
  joinedAt: text('joined_at').notNull(),
}, (table) => [
  index('idx_chat_room_members_room').on(table.roomId),
  index('idx_chat_room_members_user').on(table.userId),
]);

// 6. Messages Table (Real-time, Room, & Order Chats)
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').notNull(), // Preserved for existing data compatibility
  roomId: text('room_id').references(() => chatRooms.id),
  orderId: text('order_id').references(() => orders.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').references(() => users.id),
  content: text('content').notNull(),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  isSystem: boolean('is_system').default(false),
  read: boolean('read').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('idx_messages_room_id').on(table.roomId),
  index('idx_messages_sender_id').on(table.senderId),
  index('idx_messages_chat_id').on(table.chatId),
]);

// 5. Quotes Table (Tutor / Admin Quotes for Orders & Inquiries)
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(),
  chatId: text('chat_id'),
  orderId: text('order_id'),
  inquiryId: text('inquiry_id'),
  tutorId: text('tutor_id').references(() => users.id),
  amount: doublePrecision('amount').notNull(),
  currency: text('currency').default('USD'),
  estimatedHours: integer('estimated_hours').default(1),
  serviceType: text('service_type'),
  deliveryTime: text('delivery_time'),
  scopeOfWork: text('scope_of_work'),
  advancePercentage: integer('advance_percentage').default(50),
  advanceAmount: doublePrecision('advance_amount'),
  balanceAmount: doublePrecision('balance_amount'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'declined'
  createdAt: text('created_at').notNull(),
});

// 6. Audit Logs Table (Administrative & Security Activity Log)
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  userRole: text('user_role'),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
});

// 7. Blogs Table (Educational Blog Articles & Academic Guides)
export const blogs = pgTable('blogs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  tags: text('tags').notNull(), // JSON stringified array of tags
  publishedAt: text('published_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('idx_blogs_published_at').on(table.publishedAt),
  index('idx_blogs_category').on(table.category),
]);

// 8. Tutors Table (Comprehensive Tutor Directory with Searchable Keywords and Zero Duplicates)
export const tutors = pgTable('tutors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tier: text('tier').notNull().default('Senior Tutor / Expert'),
  country: text('country').notNull().default('USA'),
  cityLocation: text('city_location').notNull(),
  rating: doublePrecision('rating').default(4.90),
  reviewsCount: integer('reviews_count').default(0),
  hourlyRate: doublePrecision('hourly_rate').notNull(),
  primarySubject: text('primary_subject').notNull(),
  subjectExpertise: text('subject_expertise').notNull(), // JSON string or text
  searchableKeywords: text('searchable_keywords').notNull(),
  education: text('education'),
  experienceSummary: text('experience_summary'),
  availability: text('availability'),
  canMeet: text('can_meet'),
  hobbies: text('hobbies'),
  verificationStatus: text('verification_status').default('Verified Degree & Background'),
  profileImageUrl: text('profile_image_url').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_tutors_unique_profile').on(table.name, table.primarySubject, table.cityLocation),
  index('idx_tutors_searchable_keywords').on(table.searchableKeywords),
  index('idx_tutors_name').on(table.name),
  index('idx_tutors_primary_subject').on(table.primarySubject),
  index('idx_tutors_city_location').on(table.cityLocation),
]);

// 9. Password Reset Tokens Table (Stores SHA-256 hash only, never plaintext tokens)
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_password_reset_token_hash').on(table.tokenHash),
  index('idx_password_reset_user_id').on(table.userId),
]);

// 10. User Profiles Table (Student & Academic Details)
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('student'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  country: text('country').default('US'),
  location: text('location'),
  phoneNumber: text('phone_number'),
  education: text('education'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_user_profiles_user_id').on(table.userId),
  index('idx_user_profiles_email').on(table.email),
]);

// 11. User Sessions Table (Database Session Tracking)
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionTokenHash: text('session_token_hash'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_user_sessions_user_id').on(table.userId),
]);

// 12. Email Verification Tokens Table (Stores SHA-256 hash only, never plaintext tokens)
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_email_verification_token_hash').on(table.tokenHash),
  index('idx_email_verification_user_id').on(table.userId),
  index('idx_email_verification_email').on(table.email),
]);


