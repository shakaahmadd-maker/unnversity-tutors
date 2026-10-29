import { pgTable, text, boolean, integer, doublePrecision, index } from 'drizzle-orm/pg-core';

// 1. Users Table (Students, Tutors, and Admins / Subadmins)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  role: text('role').notNull(), // 'student', 'tutor', 'admin'
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: text('created_at').notNull(),
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
