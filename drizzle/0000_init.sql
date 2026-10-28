-- Initial migration for PostgreSQL: Users, Orders, Inquiries, Messages, Quotes, Audit Logs

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  avatar_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  suspended BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  hourly_rate INTEGER,
  rating DOUBLE PRECISION,
  review_count INTEGER,
  subjects TEXT,
  country TEXT,
  location TEXT,
  phone_number TEXT,
  education TEXT,
  experience TEXT,
  subject_expertise TEXT,
  availability TEXT,
  can_meet TEXT,
  hobbies TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active',
  available_slots TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  tutor_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  academic_level TEXT,
  deadline TEXT NOT NULL,
  pages INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 250,
  reference_style TEXT,
  sources_count INTEGER DEFAULT 0,
  instructions TEXT,
  file_urls TEXT,
  file_names TEXT,
  budget DOUBLE PRECISION,
  quote_amount DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'Pending Tutor Assignment',
  escrow_status TEXT DEFAULT 'pending',
  progress_percent INTEGER DEFAULT 0,
  tutor_work_file_url TEXT,
  tutor_work_file_name TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  whatsapp_number TEXT,
  subject TEXT NOT NULL,
  academic_level TEXT,
  deadline TEXT,
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  order_id TEXT,
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  chat_id TEXT,
  order_id TEXT,
  inquiry_id TEXT,
  tutor_id TEXT REFERENCES users(id),
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_hours INTEGER DEFAULT 1,
  service_type TEXT,
  delivery_time TEXT,
  scope_of_work TEXT,
  advance_percentage INTEGER DEFAULT 50,
  advance_amount DOUBLE PRECISION,
  balance_amount DOUBLE PRECISION,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_tutor ON orders(tutor_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_quotes_order ON quotes(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
