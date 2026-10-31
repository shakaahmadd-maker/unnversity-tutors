import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { db, isDbConnected, checkDbConnection } from './src/db/index';
import { users, orders, inquiries, messages, quotes, auditLogs, chatRooms, chatRoomMembers, blogs } from './src/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { runMigrations } from './src/db/migrate';
import { memoryStore } from './src/db/memoryStore';
import { DEFAULT_20_BLOGS } from './src/data/defaultBlogsData';

// Configurable Environment Variables read from process.env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Secure session signing key: read from process.env.SESSION_SECRET.
// If not provided in environment, generate an ephemeral crypto-random 256-bit key at runtime
// to avoid any hardcoded secret values in the codebase.
const SESSION_SECRET: string = (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length > 0)
  ? process.env.SESSION_SECRET.trim()
  : crypto.randomBytes(32).toString('hex');

if (!process.env.SESSION_SECRET) {
  console.info('[AUTH] Notice: SESSION_SECRET is not set in process.env. Using dynamically generated runtime key.');
}

const COOKIE_NAME = 'auth_session';

// Secure Password Hashing using Scrypt (Salted + Constant-Time comparison)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Secure JWT / Session Token using HMAC-SHA256
export function createSessionToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

export function verifySessionToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${data}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Default Initial Tutors Data to Seed if Table is Empty
const SEED_TUTORS = [
  {
    id: 'tutor_clara',
    role: 'tutor',
    name: 'Dr. Clara Stirling',
    email: 'clara@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
    bio: 'Former Oxford Senior Lecturer with 12+ years of experience helping undergraduate and postgraduate students structure complex academic essays and dissertation prose.',
    hourlyRate: 45,
    rating: 4.9,
    reviewCount: 142,
    subjects: JSON.stringify(['English Literature', 'Essays & Editing', 'History', 'Philosophy']),
    country: 'GB',
    location: 'London, UK',
    education: 'University of Oxford - DPhil, English Literature',
    isApproved: true,
    status: 'approved',
  },
  {
    id: 'tutor_liam',
    role: 'tutor',
    name: 'Liam Kennedy, M.Sc.',
    email: 'liam@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
    bio: 'MIT graduate specializing in Advanced Calculus, Statistics, Linear Algebra and Mechanical Engineering.',
    hourlyRate: 50,
    rating: 4.8,
    reviewCount: 96,
    subjects: JSON.stringify(['Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering']),
    country: 'US',
    location: 'Boston, MA',
    education: 'MIT - M.Sc, Mechanical Engineering & Applied Math',
    isApproved: true,
    status: 'approved',
  },
  {
    id: 'tutor_chloe',
    role: 'tutor',
    name: 'Chloe Tremblay',
    email: 'chloe@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    bio: 'Specialist in Cognitive Psychology and Business Administration. Focuses on coursework mentorship and dissertation planning.',
    hourlyRate: 38,
    rating: 4.7,
    reviewCount: 68,
    subjects: JSON.stringify(['Psychology', 'Business Administration', 'Marketing', 'Sociology']),
    country: 'CA',
    location: 'Toronto, ON',
    education: 'McGill University - M.A, Organizational Psychology',
    isApproved: true,
    status: 'approved',
  },
  {
    id: 'tutor-dr-marcus-vance',
    role: 'tutor',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@universitytutors.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T00:00:00.000Z',
    location: 'Atlanta, GA',
    country: 'US',
    hourlyRate: 55,
    rating: 4.98,
    reviewCount: 184,
    education: 'Emory University - Ph.D, Neuroscience & Organic Chemistry',
    experience: 'Senior Emory research scientist and dedicated private tutor in Atlanta with over 8 years of experience. I specialize in Organic Chemistry, MCAT preparation, Biochemistry, and Cell Biology.',
    subjects: JSON.stringify(['Organic Chemistry', 'MCAT', 'Biochemistry', 'Chemistry']),
    isApproved: true,
    status: 'approved',
  }
];

async function seedInitialDatabase() {
  if (!isDbConnected() || !db) return;
  try {
    // Check if superior admin exists
    const adminEmail = 'shaka.ahmadd@gmail.com';
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    if (existingAdmin.length === 0) {
      const defaultHash = hashPassword('Admin@123456');
      await db.insert(users).values({
        id: 'admin_shaka',
        role: 'admin',
        name: 'Shaka Ahmad',
        email: adminEmail,
        passwordHash: defaultHash,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        verified: true,
        suspended: false,
        bio: 'Platform Owner and Superior Administrator.',
        country: 'US',
      });
      console.log(`[SEED] Created default Superior Admin account: ${adminEmail}`);
    }

    // Check if tutors exist
    const existingTutors = await db.select().from(users).where(eq(users.role, 'tutor')).limit(1);
    if (existingTutors.length === 0) {
      const defaultTutorHash = hashPassword('Tutor@123456');
      for (const t of SEED_TUTORS) {
        await db.insert(users).values({
          ...t,
          passwordHash: defaultTutorHash,
          verified: true,
          suspended: false,
        }).onConflictDoNothing();
      }
      console.log('[SEED] Seeded initial certified tutors into PostgreSQL.');
    }

    // Check if blogs exist in DB
    try {
      const existingBlogs = await db.select().from(blogs).limit(1);
      if (existingBlogs.length === 0) {
        for (const b of DEFAULT_20_BLOGS) {
          await db.insert(blogs).values({
            id: b.id,
            adminId: b.adminId,
            title: b.title,
            content: b.content,
            image: b.image,
            category: b.category,
            tags: JSON.stringify(b.tags),
            publishedAt: b.publishedAt,
            createdAt: b.publishedAt,
            updatedAt: b.publishedAt,
          }).onConflictDoNothing();
        }
        console.log('[SEED] Seeded 20 default educational guides into PostgreSQL blogs table.');
      }
    } catch (blogErr: any) {
      console.warn('[SEED] Notice during blog table verification:', blogErr.message);
    }
  } catch (err: any) {
    console.warn('[SEED] Notice during initial database seeding check:', err.message);
  }
}

async function startServer() {
  const app = express();

  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());

  // Check database connectivity
  await checkDbConnection();

  // Run database migration to ensure all tables exist if connected
  await runMigrations();
  await seedInitialDatabase();

  // Helper middleware to extract user from session
  const extractUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split('Bearer ')[1];
    }
    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        (req as any).user = session;
      }
    }
    next();
  };

  app.use(extractUser);

  // Helper function to record audit logs
  const logAudit = async (action: string, details?: string, userId?: string, userName?: string, userRole?: string, req?: express.Request) => {
    const auditRecord = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      userId: userId || null,
      userName: userName || null,
      userRole: userRole || null,
      action,
      details: details || null,
      ipAddress: req?.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    memoryStore.addAuditLog(auditRecord);

    if (isDbConnected() && db) {
      try {
        await db.insert(auditLogs).values(auditRecord);
      } catch (e: any) {
        console.warn('[AUDIT] Notice recording audit log to DB:', e.message);
      }
    }
  };

  // ==========================================
  // AUTHENTICATION ROUTES (Email & Password)
  // ==========================================

  // POST /api/auth/register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role, extra } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: name, email, password' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const userRole = role === 'tutor' ? 'tutor' : (role === 'admin' ? 'admin' : 'student');

      // Check for existing user with this email
      if (isDbConnected() && db) {
        try {
          const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
          if (existing.length > 0) {
            return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
          }
        } catch {}
      } else {
        const memExisting = memoryStore.findUserByEmail(cleanEmail);
        if (memExisting) {
          return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
        }
      }

      const pHash = hashPassword(password);
      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const now = new Date().toISOString();

      const newUserRecord = {
        id: newUserId,
        role: userRole,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: `https://images.unsplash.com/photo-${userRole === 'tutor' ? '1534528741775-53994a69daeb' : '1535713875002-d1d0cf377fde'}?w=150&auto=format&fit=crop&q=80`,
        createdAt: now,
        suspended: false,
        verified: true,
        bio: extra?.bio || (userRole === 'tutor' ? 'Dedicated academic tutor and subject mentor.' : 'Active student member.'),
        hourlyRate: extra?.hourlyRate ? Math.round(Number(extra.hourlyRate)) : (userRole === 'tutor' ? 45 : null),
        rating: userRole === 'tutor' ? 5.0 : null,
        reviewCount: userRole === 'tutor' ? 0 : null,
        subjects: extra?.subjects ? JSON.stringify(extra.subjects) : (userRole === 'tutor' ? JSON.stringify(['General Academics']) : null),
        country: extra?.country || 'US',
        location: extra?.location || null,
        phoneNumber: extra?.phoneNumber || null,
        education: extra?.education || null,
        experience: extra?.experience || null,
        subjectExpertise: extra?.subjectExpertise ? JSON.stringify(extra.subjectExpertise) : null,
        availability: extra?.availability || null,
        canMeet: extra?.canMeet || null,
        hobbies: extra?.hobbies || null,
        isApproved: userRole !== 'tutor', // students approved immediately
        status: 'active',
      };

      // Always save to memory store
      memoryStore.setUser(newUserRecord);

      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(newUserRecord);
        } catch (dbErr: any) {
          console.warn('[AUTH] Notice inserting user to DB:', dbErr.message);
        }
      }

      // Create session token & set HTTP-only cookie
      const token = createSessionToken({ id: newUserId, email: cleanEmail, role: userRole });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit('USER_REGISTER', `User registered: ${cleanEmail} (${userRole})`, newUserId, name, userRole, req);

      // Strip passwordHash before responding
      const { passwordHash: _, ...safeUser } = newUserRecord;
      return res.status(201).json({ success: true, user: safeUser, token });
    } catch (error: any) {
      console.error('[AUTH] Registration error:', error);
      return res.status(500).json({ error: error.message || 'Registration failed' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      let foundUser: any = null;

      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
          if (rows.length > 0) {
            foundUser = rows[0];
          }
        } catch (dbErr: any) {
          console.warn('[AUTH] DB select failed during login, checking memory store:', dbErr.message);
        }
      }

      // Fallback to memory store if not found in DB
      if (!foundUser) {
        foundUser = memoryStore.findUserByEmail(cleanEmail);
      }

      // Superior admin fallback
      if (!foundUser && cleanEmail === 'shaka.ahmadd@gmail.com') {
        foundUser = memoryStore.findUserById('admin_shaka');
      }

      if (!foundUser) {
        return res.status(401).json({ error: 'No account registered with this email address.' });
      }

      if (foundUser.suspended) {
        return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
      }

      // If user has a passwordHash, verify it.
      if (foundUser.passwordHash) {
        if (!password) {
          return res.status(400).json({ error: 'Password is required to authenticate.' });
        }
        const isValid = verifyPassword(password, foundUser.passwordHash);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
        }
      } else if (password) {
        // Upgrade legacy user with a password
        const newHash = hashPassword(password);
        foundUser.passwordHash = newHash;
        memoryStore.updateUser(foundUser.id, { passwordHash: newHash });
        if (isDbConnected() && db) {
          try {
            await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, foundUser.id));
          } catch {}
        }
      }

      // Generate session token
      const token = createSessionToken({ id: foundUser.id, email: foundUser.email, role: foundUser.role });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAudit('USER_LOGIN', `User logged in: ${cleanEmail} (${foundUser.role})`, foundUser.id, foundUser.name, foundUser.role, req);

      const { passwordHash: _, ...safeUser } = foundUser;
      return res.status(200).json({ success: true, user: safeUser, token });
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      return res.status(500).json({ error: error.message || 'Authentication failed' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (req, res) => {
    const user = (req as any).user;
    if (user) {
      await logAudit('USER_LOGOUT', `User logged out: ${user.email}`, user.id, undefined, user.role, req);
    }
    res.clearCookie(COOKIE_NAME);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', async (req, res) => {
    try {
      const session = (req as any).user;
      if (!session) {
        return res.status(401).json({ user: null });
      }

      let foundUser: any = null;
      if (isDbConnected() && db) {
        try {
          const found = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
          if (found.length > 0) {
            foundUser = found[0];
          }
        } catch {}
      }

      if (!foundUser) {
        foundUser = memoryStore.findUserById(session.id);
      }

      if (!foundUser) {
        res.clearCookie(COOKIE_NAME);
        return res.status(401).json({ user: null });
      }

      const { passwordHash: _, ...safeUser } = foundUser;
      return res.status(200).json({ user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // USERS & PRIVILEGED ACCOUNTS ENDPOINTS
  // ==========================================

  // GET /api/users
  app.get('/api/users', async (req, res) => {
    try {
      if (isDbConnected() && db) {
        try {
          const allUsers = await db.select({
            id: users.id,
            role: users.role,
            name: users.name,
            email: users.email,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
            suspended: users.suspended,
            verified: users.verified,
            bio: users.bio,
            hourlyRate: users.hourlyRate,
            rating: users.rating,
            reviewCount: users.reviewCount,
            subjects: users.subjects,
            country: users.country,
            location: users.location,
            phoneNumber: users.phoneNumber,
            education: users.education,
            experience: users.experience,
            subjectExpertise: users.subjectExpertise,
            availability: users.availability,
            canMeet: users.canMeet,
            hobbies: users.hobbies,
            isApproved: users.isApproved,
            status: users.status,
          }).from(users);

          if (allUsers.length > 0) {
            return res.status(200).json({ users: allUsers });
          }
        } catch (dbErr: any) {
          console.warn('[API] DB select failed for users, serving memory store:', dbErr.message);
        }
      }

      // Memory store response
      return res.status(200).json({ users: memoryStore.getAllUsers() });
    } catch (err: any) {
      return res.status(200).json({ users: memoryStore.getAllUsers() });
    }
  });

  // POST /api/create-privileged-user
  // Admin creates Tutor or Subadmin roles
  app.post('/api/create-privileged-user', async (req, res) => {
    try {
      const { name, email, role, password, extra } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Missing required fields: name, email, role' });
      }

      if (role !== 'tutor' && role !== 'admin') {
        return res.status(400).json({ error: "Invalid role. Only 'tutor' and 'admin' can be created." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const pHash = hashPassword(password || 'TutorPass@2026');
      const userId = (role === 'admin' ? 'admin_' : 'tutor_') + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newUser = {
        id: userId,
        role,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: `https://images.unsplash.com/photo-${role === 'tutor' ? '1534528741775-53994a69daeb' : '1494790108377-be9c29b29330'}?w=150&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString(),
        verified: true,
        suspended: false,
        bio: extra?.bio || (role === 'tutor' ? 'Highly dedicated academic advisor with master credentials.' : 'Platform Administrator.'),
        hourlyRate: extra?.hourlyRate ? Math.round(Number(extra.hourlyRate)) : (role === 'tutor' ? 45 : null),
        rating: role === 'tutor' ? 5.0 : null,
        reviewCount: role === 'tutor' ? 0 : null,
        subjects: extra?.subjects ? JSON.stringify(extra.subjects) : (role === 'tutor' ? JSON.stringify(['English Literature']) : null),
        country: extra?.country || 'US',
        location: extra?.location || null,
        education: extra?.education || null,
        isApproved: true,
        status: 'approved',
      };

      // Always save to memory store
      memoryStore.setUser(newUser);

      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(newUser).onConflictDoUpdate({
            target: users.email,
            set: {
              role: newUser.role,
              name: newUser.name,
              bio: newUser.bio,
              hourlyRate: newUser.hourlyRate,
              subjects: newUser.subjects,
              country: newUser.country,
            }
          });
        } catch (dbErr: any) {
          console.warn('[API] Notice saving privileged user to DB:', dbErr.message);
        }
      }

      await logAudit('CREATE_PRIVILEGED_USER', `Admin created privileged user: ${cleanEmail} (${role})`, userId, name, role, req);

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(200).json({ success: true, user: safeUser });
    } catch (err: any) {
      console.error('[API] Error in create-privileged-user:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/users/:id
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      delete updates.passwordHash;

      if (updates.subjects && Array.isArray(updates.subjects)) {
        updates.subjects = JSON.stringify(updates.subjects);
      }
      if (updates.subjectExpertise && Array.isArray(updates.subjectExpertise)) {
        updates.subjectExpertise = JSON.stringify(updates.subjectExpertise);
      }

      memoryStore.updateUser(id, updates);

      if (isDbConnected() && db) {
        try {
          await db.update(users).set(updates).where(eq(users.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice updating user in DB:', dbErr.message);
        }
      }

      await logAudit('USER_UPDATE', `Updated user ${id}`, id, undefined, undefined, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // ORDERS (Assignments & Tutoring Requests)
  // ==========================================

  // GET /api/orders
  app.get('/api/orders', async (req, res) => {
    try {
      const { studentId, tutorId } = req.query;

      if (isDbConnected() && db) {
        try {
          if (studentId) {
            const rows = await db.select().from(orders).where(eq(orders.studentId, String(studentId))).orderBy(desc(orders.createdAt));
            return res.status(200).json({ orders: rows });
          }
          if (tutorId) {
            const rows = await db.select().from(orders).where(eq(orders.tutorId, String(tutorId))).orderBy(desc(orders.createdAt));
            return res.status(200).json({ orders: rows });
          }
          const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
          return res.status(200).json({ orders: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying orders from DB:', dbErr.message);
        }
      }

      return res.status(200).json({
        orders: memoryStore.getOrders(studentId as string | undefined, tutorId as string | undefined)
      });
    } catch (err: any) {
      return res.status(200).json({ orders: [] });
    }
  });

  // POST /api/orders
  app.post('/api/orders', async (req, res) => {
    try {
      const data = req.body;
      const orderId = data.id || 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newOrder = {
        id: orderId,
        studentId: data.studentId,
        tutorId: data.tutorId || null,
        title: data.title,
        subject: data.subject,
        academicLevel: data.academicLevel || null,
        deadline: data.deadline,
        pages: data.pages ? Number(data.pages) : 1,
        wordCount: data.wordCount ? Number(data.wordCount) : 250,
        referenceStyle: data.referenceStyle || null,
        sourcesCount: data.sourcesCount ? Number(data.sourcesCount) : 0,
        instructions: data.instructions || '',
        fileUrls: data.fileUrls ? (Array.isArray(data.fileUrls) ? JSON.stringify(data.fileUrls) : data.fileUrls) : null,
        fileNames: data.fileNames ? (Array.isArray(data.fileNames) ? JSON.stringify(data.fileNames) : data.fileNames) : null,
        budget: data.budget ? Number(data.budget) : null,
        quoteAmount: data.quoteAmount ? Number(data.quoteAmount) : null,
        status: data.status || 'Pending Tutor Assignment',
        escrowStatus: data.escrowStatus || 'pending',
        progressPercent: data.progressPercent ? Number(data.progressPercent) : 0,
        tutorWorkFileUrl: data.tutorWorkFileUrl || null,
        tutorWorkFileName: data.tutorWorkFileName || null,
        reviewed: Boolean(data.reviewed),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.setOrder(newOrder);

      if (isDbConnected() && db) {
        try {
          await db.insert(orders).values(newOrder);
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting order into DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_CREATE', `Created order: ${orderId} (${data.title})`, data.studentId, undefined, undefined, req);

      return res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/orders/:id
  app.put('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date().toISOString() };
      delete updates.id;

      if (updates.fileUrls && Array.isArray(updates.fileUrls)) {
        updates.fileUrls = JSON.stringify(updates.fileUrls);
      }
      if (updates.fileNames && Array.isArray(updates.fileNames)) {
        updates.fileNames = JSON.stringify(updates.fileNames);
      }

      memoryStore.updateOrder(id, updates);

      if (isDbConnected() && db) {
        try {
          await db.update(orders).set(updates).where(eq(orders.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice updating order in DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_UPDATE', `Updated order: ${id}`, undefined, undefined, undefined, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // INQUIRIES (Quotes & WhatsApp Submissions)
  // ==========================================

  // GET /api/inquiries
  app.get('/api/inquiries', async (req, res) => {
    try {
      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
          return res.status(200).json({ inquiries: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying inquiries from DB:', dbErr.message);
        }
      }

      return res.status(200).json({ inquiries: memoryStore.getInquiries() });
    } catch (err: any) {
      return res.status(200).json({ inquiries: [] });
    }
  });

  // POST /api/inquiries
  app.post('/api/inquiries', async (req, res) => {
    try {
      const { studentName, studentEmail, whatsappNumber, subject, academicLevel, deadline, query: inqQuery } = req.body;

      if (!studentName || !studentEmail || !subject || !inqQuery) {
        return res.status(400).json({ error: 'Missing required inquiry fields.' });
      }

      const inqId = 'inq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newInquiry = {
        id: inqId,
        studentName,
        studentEmail: studentEmail.toLowerCase().trim(),
        whatsappNumber: whatsappNumber || null,
        subject,
        academicLevel: academicLevel || null,
        deadline: deadline || null,
        query: inqQuery,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      memoryStore.setInquiry(newInquiry);

      if (isDbConnected() && db) {
        try {
          await db.insert(inquiries).values(newInquiry);
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting inquiry to DB:', dbErr.message);
        }
      }

      await logAudit('INQUIRY_CREATE', `Inquiry submitted by ${studentEmail} (${subject})`, inqId, studentName, 'student', req);

      return res.status(201).json({ success: true, inquiry: newInquiry });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CHAT ROOMS & MESSAGES
  // ==========================================

  // Authentication requirement helper
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in.' });
    }
    next();
  };

  // Authorization helper to check if a user is allowed to access a chat room
  const canUserAccessRoom = async (userId: string, userRole: string, roomId: string): Promise<boolean> => {
    // Explicit role rules: Admins and subadmins have platform oversight for support and dispute moderation
    if (userRole === 'admin' || userRole === 'subadmin') {
      return true;
    }
    if (isDbConnected() && db) {
      try {
        const memberRows = await db.select().from(chatRoomMembers).where(
          and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId))
        ).limit(1);
        if (memberRows.length > 0) return true;
      } catch (dbErr: any) {
        console.warn('[API] Notice checking room membership in DB:', dbErr.message);
      }
    }
    return memoryStore.isRoomMember(roomId, userId, userRole === 'admin' || userRole === 'subadmin');
  };

  // POST /api/chat-rooms - Create a chat room
  app.post('/api/chat-rooms', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { title, orderId, type, memberIds } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Chat room title is required.' });
      }

      const roomId = req.body.id || 'room_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString();

      const newRoom = {
        id: roomId,
        title: title.trim().slice(0, 200),
        orderId: orderId || null,
        type: type || 'direct',
        createdBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };

      // Prepare room members: always includes the authenticated creator
      const uniqueMemberIds = new Set<string>([currentUser.id]);
      if (Array.isArray(memberIds)) {
        for (const mId of memberIds) {
          if (mId && typeof mId === 'string' && mId.trim().length > 0) {
            uniqueMemberIds.add(mId.trim());
          }
        }
      }

      const membersList = Array.from(uniqueMemberIds).map((uid, idx) => ({
        id: `crm_${roomId}_${uid}_${idx}`,
        roomId,
        userId: uid,
        role: uid === currentUser.id ? 'creator' : 'member',
        joinedAt: now,
      }));

      // Save to memory store
      memoryStore.createChatRoom(newRoom, membersList);

      // Save to database if connected
      if (isDbConnected() && db) {
        try {
          await db.insert(chatRooms).values(newRoom);
          for (const m of membersList) {
            await db.insert(chatRoomMembers).values(m);
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting chat room into DB:', dbErr.message);
        }
      }

      await logAudit('CHAT_ROOM_CREATE', `Created chat room ${roomId} (${newRoom.title})`, currentUser.id, undefined, currentUser.role, req);

      return res.status(201).json({
        success: true,
        room: {
          ...newRoom,
          members: membersList,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // GET /api/chat-rooms - List user's accessible chat rooms
  app.get('/api/chat-rooms', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';

      if (isDbConnected() && db) {
        try {
          let userRooms: any[] = [];
          if (isAdmin && req.query.all === 'true') {
            userRooms = await db.select().from(chatRooms).orderBy(desc(chatRooms.updatedAt));
          } else {
            const memberOf = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.userId, currentUser.id));
            const roomIds = memberOf.map(m => m.roomId);
            if (roomIds.length > 0) {
              userRooms = await db.select().from(chatRooms).where(inArray(chatRooms.id, roomIds)).orderBy(desc(chatRooms.updatedAt));
            } else if (isAdmin) {
              userRooms = await db.select().from(chatRooms).orderBy(desc(chatRooms.updatedAt)).limit(50);
            }
          }

          // Populate members and latest message for each room
          const populated = await Promise.all(userRooms.map(async (r) => {
            const members = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.roomId, r.id));
            const latestMsg = await db.select().from(messages).where(eq(messages.roomId, r.id)).orderBy(desc(messages.createdAt)).limit(1);
            return {
              ...r,
              members,
              latestMessage: latestMsg[0] || null,
            };
          }));

          return res.status(200).json({ rooms: populated });
        } catch (dbErr: any) {
          console.warn('[API] Notice fetching chat rooms from DB:', dbErr.message);
        }
      }

      const memoryRooms = memoryStore.getChatRoomsForUser(currentUser.id, isAdmin);
      return res.status(200).json({ rooms: memoryRooms });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/chat-rooms/:id/members - Add a member to a chat room
  app.post('/api/chat-rooms/:id/members', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const roomId = req.params.id;
      const { userId, role } = req.body;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId is required.' });
      }

      // Check authorization: caller must be a member or admin
      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, roomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to add members to this chat room.' });
      }

      const now = new Date().toISOString();
      const newMember = {
        id: `crm_${roomId}_${userId}_${Date.now()}`,
        roomId,
        userId: userId.trim(),
        role: role || 'member',
        joinedAt: now,
      };

      memoryStore.addRoomMember(roomId, newMember.userId, newMember.role);

      if (isDbConnected() && db) {
        try {
          await db.insert(chatRoomMembers).values(newMember);
        } catch (dbErr: any) {
          console.warn('[API] Notice adding room member in DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, member: newMember });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/chat-rooms/:id/members/:userId - Remove a member from a chat room
  app.delete('/api/chat-rooms/:id/members/:userId', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const roomId = req.params.id;
      const targetUserId = req.params.userId;

      // Caller can remove self, or must be an admin
      const isSelf = currentUser.id === targetUserId;
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';

      if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: You cannot remove other members from this room.' });
      }

      memoryStore.removeRoomMember(roomId, targetUserId);

      if (isDbConnected() && db) {
        try {
          await db.delete(chatRoomMembers).where(
            and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, targetUserId))
          );
        } catch (dbErr: any) {
          console.warn('[API] Notice removing room member from DB:', dbErr.message);
        }
      }

      return res.status(200).json({ success: true, message: `Member ${targetUserId} removed from room.` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // GET /api/chat-rooms/:id/messages - Retrieve messages for a specific room
  app.get('/api/chat-rooms/:id/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const roomId = req.params.id;

      // Enforce room membership check (403 for unauthorized users)
      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, roomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to view messages in this chat room.' });
      }

      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(messages).where(
            eq(messages.roomId, roomId)
          ).orderBy(messages.createdAt);
          return res.status(200).json({ messages: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice fetching room messages from DB:', dbErr.message);
        }
      }

      const memMsgs = memoryStore.getRoomMessages(roomId);
      return res.status(200).json({ messages: memMsgs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/chat-rooms/:id/messages - Send a message to a specific room
  app.post('/api/chat-rooms/:id/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const roomId = req.params.id;

      // Enforce room membership check (403 for non-members)
      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, roomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not a member of this chat room.' });
      }

      const { content, fileUrl, fileName, isSystem } = req.body;

      // Validation 1: Reject empty or whitespace-only messages
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty.' });
      }

      // Validation 2: Enforce 5,000 character limit
      if (content.length > 5000) {
        return res.status(400).json({ error: 'Message length exceeds the 5,000 character limit.' });
      }

      // Security requirement: Regular users (students, tutors) can NEVER spoof senderId; session user ID is strictly enforced.
      // Platform administrators have supervisory authority to send messages as Admin or as Assigned Tutor to assist students.
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';
      let senderId = currentUser.id;
      if (isAdmin && (req.body.sendAsTutorId || req.body.senderId)) {
        senderId = req.body.sendAsTutorId || req.body.senderId;
      }
      const now = new Date().toISOString();
      const msgId = req.body.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newMsg = {
        id: msgId,
        chatId: roomId, // backward-compatibility
        roomId,
        orderId: req.body.orderId || null,
        senderId,
        receiverId: req.body.receiverId || null,
        content: content.trim(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        isSystem: Boolean(isSystem),
        read: false,
        createdAt: now,
        updatedAt: now,
      };

      memoryStore.addMessage(newMsg);

      if (isDbConnected() && db) {
        try {
          await db.insert(messages).values(newMsg);
          // Update room's updatedAt timestamp
          await db.update(chatRooms).set({ updatedAt: now }).where(eq(chatRooms.id, roomId));
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting room message into DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // GET /api/messages - Secure backward-compatible message retrieval
  app.get('/api/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { chatId, orderId } = req.query;

      // If chatId is provided, enforce access check
      if (chatId) {
        const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, String(chatId));
        if (!hasAccess) {
          return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.' });
        }
      }

      if (isDbConnected() && db) {
        try {
          if (chatId) {
            const rows = await db.select().from(messages).where(
              eq(messages.chatId, String(chatId))
            ).orderBy(messages.createdAt);
            return res.status(200).json({ messages: rows });
          }
          if (orderId) {
            const rows = await db.select().from(messages).where(
              eq(messages.orderId, String(orderId))
            ).orderBy(messages.createdAt);
            return res.status(200).json({ messages: rows });
          }
          // If no specific chat/order, return only messages where the user is sender or receiver (or admin)
          if (currentUser.role === 'admin' || currentUser.role === 'subadmin') {
            const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(100);
            return res.status(200).json({ messages: rows });
          } else {
            const memberRooms = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.userId, currentUser.id));
            const roomIds = memberRooms.map(m => m.roomId);
            if (roomIds.length > 0) {
              const rows = await db.select().from(messages).where(inArray(messages.chatId, roomIds)).orderBy(desc(messages.createdAt)).limit(100);
              return res.status(200).json({ messages: rows });
            }
            return res.status(200).json({ messages: [] });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying messages from DB:', dbErr.message);
        }
      }

      return res.status(200).json({
        messages: memoryStore.getMessages(chatId as string | undefined, orderId as string | undefined)
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/messages - Secure backward-compatible message dispatch
  app.post('/api/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const data = req.body;
      const targetRoomId = data.roomId || data.chatId;

      if (!targetRoomId || !data.content) {
        return res.status(400).json({ error: 'Missing required parameters (chatId/roomId, content).' });
      }

      // Check room membership authorization
      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, targetRoomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to post to this conversation.' });
      }

      // Content length validations
      const trimmedContent = String(data.content).trim();
      if (trimmedContent.length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty.' });
      }
      if (data.content.length > 5000) {
        return res.status(400).json({ error: 'Message length exceeds the 5,000 character limit.' });
      }

      // Security: Non-admins cannot impersonate another user (forced session user ID).
      // Platform administrators have supervisory authority to send as Admin or on behalf of Tutor.
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';
      let senderId = currentUser.id;
      if (isAdmin && (data.sendAsTutorId || data.senderId)) {
        senderId = data.sendAsTutorId || data.senderId;
      }
      const now = new Date().toISOString();
      const msgId = data.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newMsg = {
        id: msgId,
        chatId: targetRoomId,
        roomId: targetRoomId,
        orderId: data.orderId || null,
        senderId,
        receiverId: data.receiverId || null,
        content: trimmedContent,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        isSystem: Boolean(data.isSystem),
        read: Boolean(data.read),
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      memoryStore.addMessage(newMsg);

      if (isDbConnected() && db) {
        try {
          await db.insert(messages).values(newMsg);
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting message into DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // QUOTES
  // ==========================================

  // GET /api/quotes
  app.get('/api/quotes', async (req, res) => {
    try {
      const { chatId, orderId } = req.query;

      if (isDbConnected() && db) {
        try {
          if (chatId) {
            const rows = await db.select().from(quotes).where(eq(quotes.chatId, String(chatId))).orderBy(desc(quotes.createdAt));
            return res.status(200).json({ quotes: rows });
          }
          if (orderId) {
            const rows = await db.select().from(quotes).where(eq(quotes.orderId, String(orderId))).orderBy(desc(quotes.createdAt));
            return res.status(200).json({ quotes: rows });
          }
          const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
          return res.status(200).json({ quotes: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying quotes from DB:', dbErr.message);
        }
      }

      return res.status(200).json({
        quotes: memoryStore.getQuotes(chatId as string | undefined, orderId as string | undefined)
      });
    } catch (err: any) {
      return res.status(200).json({ quotes: [] });
    }
  });

  // POST /api/quotes
  app.post('/api/quotes', async (req, res) => {
    try {
      const data = req.body;
      const quoteId = data.id || 'qte_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newQuote = {
        id: quoteId,
        chatId: data.chatId || null,
        orderId: data.orderId || null,
        inquiryId: data.inquiryId || null,
        tutorId: data.tutorId || null,
        amount: Number(data.amount) || 0,
        currency: data.currency || 'USD',
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : 1,
        serviceType: data.serviceType || null,
        deliveryTime: data.deliveryTime || null,
        scopeOfWork: data.scopeOfWork || null,
        advancePercentage: data.advancePercentage ? Number(data.advancePercentage) : 50,
        advanceAmount: data.advanceAmount ? Number(data.advanceAmount) : null,
        balanceAmount: data.balanceAmount ? Number(data.balanceAmount) : null,
        notes: data.notes || null,
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
      };

      memoryStore.setQuote(newQuote);

      if (isDbConnected() && db) {
        try {
          await db.insert(quotes).values(newQuote);
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting quote into DB:', dbErr.message);
        }
      }

      await logAudit('QUOTE_CREATE', `Quote issued: $${newQuote.amount} (${quoteId})`, data.tutorId, undefined, 'tutor', req);

      return res.status(201).json({ success: true, quote: newQuote });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/quotes/:id
  app.put('/api/quotes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;

      memoryStore.updateQuote(id, updates);

      if (isDbConnected() && db) {
        try {
          await db.update(quotes).set(updates).where(eq(quotes.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice updating quote in DB:', dbErr.message);
        }
      }

      await logAudit('QUOTE_UPDATE', `Quote ${id} updated to status: ${updates.status}`, undefined, undefined, undefined, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  // GET /api/audit-logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);
          return res.status(200).json({ logs: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying audit logs from DB:', dbErr.message);
        }
      }

      return res.status(200).json({ logs: memoryStore.getAuditLogs() });
    } catch (err: any) {
      return res.status(200).json({ logs: [] });
    }
  });

  // POST /api/audit-logs
  app.post('/api/audit-logs', async (req, res) => {
    try {
      const { action, details, userId, userName, userRole } = req.body;
      await logAudit(action, details, userId, userName, userRole, req);
      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // BLOGS (Educational Guides & Academic Articles)
  // ==========================================

  // GET /api/blogs (Public)
  app.get('/api/blogs', async (req, res) => {
    try {
      const { category } = req.query;

      if (isDbConnected() && db) {
        try {
          let rows: any[] = [];
          if (category && category !== 'All') {
            rows = await db.select().from(blogs).where(eq(blogs.category, String(category))).orderBy(desc(blogs.publishedAt));
          } else {
            rows = await db.select().from(blogs).orderBy(desc(blogs.publishedAt));
          }

          // If DB table is empty, auto-seed default blogs into DB
          if (rows.length === 0 && (!category || category === 'All')) {
            for (const b of DEFAULT_20_BLOGS) {
              await db.insert(blogs).values({
                id: b.id,
                adminId: b.adminId,
                title: b.title,
                content: b.content,
                image: b.image,
                category: b.category,
                tags: JSON.stringify(b.tags),
                publishedAt: b.publishedAt,
                createdAt: b.publishedAt,
                updatedAt: b.publishedAt,
              }).onConflictDoNothing();
            }
            rows = await db.select().from(blogs).orderBy(desc(blogs.publishedAt));
          }

          if (rows.length > 0) {
            // Also sync to memoryStore cache
            for (const r of rows) {
              memoryStore.setBlog({
                ...r,
                image: r.image,
                imageUrl: r.image,
                tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
              });
            }
            return res.status(200).json({ blogs: rows });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying blogs from DB:', dbErr.message);
        }
      }

      // Memory Store fallback
      let memBlogs = memoryStore.getBlogs(category as string | undefined);
      if (memBlogs.length === 0) {
        memBlogs = memoryStore.resetDefaultBlogs();
      }

      return res.status(200).json({ blogs: memBlogs });
    } catch (err: any) {
      console.error('[API] Error in GET /api/blogs:', err);
      return res.status(200).json({ blogs: memoryStore.getBlogs() });
    }
  });

  // GET /api/blogs/:id (Public)
  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
          if (rows.length > 0) {
            return res.status(200).json({ blog: rows[0] });
          }
        } catch (dbErr: any) {
          console.warn('[API] DB error finding blog:', dbErr.message);
        }
      }

      const memBlog = memoryStore.getBlogById(id);
      if (memBlog) {
        return res.status(200).json({ blog: memBlog });
      }

      return res.status(404).json({ error: 'Blog post not found' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/blogs (Admin create)
  app.post('/api/blogs', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only platform administrators can publish blogs.' });
      }

      const { title, excerpt, content, category, readTime, imageUrl, image, tags, featured } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Missing required fields: title, content, category' });
      }

      const now = new Date().toISOString();
      const slug = (title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
      const imgUrl = (imageUrl || image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80').trim();
      const tagsArray: string[] = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [category]);

      const newBlog = {
        id: 'blog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        adminId: user.id || 'admin_shaka',
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || title.trim(),
        content: content.trim(),
        author: user.name || 'Editorial Team',
        image: imgUrl,
        imageUrl: imgUrl,
        category: category.trim(),
        publishedAt: now,
        readTime: readTime?.trim() || '5 min read',
        tags: tagsArray,
        featured: !!featured,
        createdAt: now,
        updatedAt: now,
      };

      memoryStore.setBlog(newBlog);

      if (isDbConnected() && db) {
        try {
          await db.insert(blogs).values({
            id: newBlog.id,
            adminId: newBlog.adminId,
            title: newBlog.title,
            content: newBlog.content,
            image: newBlog.image,
            category: newBlog.category,
            tags: JSON.stringify(newBlog.tags),
            publishedAt: newBlog.publishedAt,
            createdAt: newBlog.createdAt,
            updatedAt: newBlog.updatedAt,
          });
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting blog to DB:', dbErr.message);
        }
      }

      await logAudit('BLOG_CREATE', `Published new blog: "${newBlog.title}" (${newBlog.category})`, user.id, user.name, user.role, req);

      return res.status(201).json({ success: true, blog: newBlog });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/blogs/:id (Admin update)
  app.put('/api/blogs/:id', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only platform administrators can update blogs.' });
      }

      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      updates.updatedAt = new Date().toISOString();

      if (updates.tags && Array.isArray(updates.tags)) {
        updates.tags = JSON.stringify(updates.tags);
      }

      const updated = memoryStore.updateBlog(id, updates);

      if (isDbConnected() && db) {
        try {
          await db.update(blogs).set(updates).where(eq(blogs.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice updating blog in DB:', dbErr.message);
        }
      }

      await logAudit('BLOG_UPDATE', `Updated blog ${id}: "${updates.title || 'updated'}"`, user.id, user.name, user.role, req);

      return res.status(200).json({ success: true, blog: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/blogs/:id (Admin delete)
  app.delete('/api/blogs/:id', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only platform administrators can delete blogs.' });
      }

      const { id } = req.params;
      memoryStore.deleteBlog(id);

      if (isDbConnected() && db) {
        try {
          await db.delete(blogs).where(eq(blogs.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice deleting blog from DB:', dbErr.message);
        }
      }

      await logAudit('BLOG_DELETE', `Deleted blog ${id}`, user.id, user.name, user.role, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/blogs/sync-defaults (Admin reset/sync all 20 default educational blogs)
  app.post('/api/blogs/sync-defaults', async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only platform administrators can sync default blogs.' });
      }

      // 1. Reset memoryStore
      const syncedBlogs = memoryStore.resetDefaultBlogs();

      // 2. Sync to DB if connected
      if (isDbConnected() && db) {
        try {
          for (const b of DEFAULT_20_BLOGS) {
            await db.insert(blogs).values({
              id: b.id,
              adminId: b.adminId,
              title: b.title,
              content: b.content,
              image: b.image,
              category: b.category,
              tags: JSON.stringify(b.tags),
              publishedAt: b.publishedAt,
              createdAt: b.publishedAt,
              updatedAt: b.publishedAt,
            }).onConflictDoUpdate({
              target: blogs.id,
              set: {
                title: b.title,
                content: b.content,
                image: b.image,
                category: b.category,
                tags: JSON.stringify(b.tags),
                publishedAt: b.publishedAt,
                updatedAt: new Date().toISOString(),
              }
            });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice syncing default blogs to DB:', dbErr.message);
        }
      }

      await logAudit('BLOG_SYNC_DEFAULTS', `Synchronized and seeded ${syncedBlogs.length} standard educational blogs`, user.id, user.name, user.role, req);

      return res.status(200).json({
        success: true,
        message: `Successfully synchronized and deployed ${syncedBlogs.length} educational guides across the live website.`,
        blogs: syncedBlogs,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HEALTH CHECK ROUTE
  // ==========================================
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // ==========================================
  // STATIC ASSETS & VITE INTEGRATION
  // ==========================================

  if (NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const possibleDistPaths = [
      path.join(process.cwd(), 'dist'),
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname),
      process.cwd(),
    ];
    const distPath =
      possibleDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) ||
      path.join(process.cwd(), 'dist');

    console.info(`[STATIC] Serving production assets from: ${distPath}`);

    // Hashed assets (JS/CSS/media) from Vite build get 1 year immutable cache
    const assetsDir = path.join(distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      app.use('/assets', express.static(assetsDir, {
        maxAge: '1y',
        immutable: true,
      }));
    }

    // Other static files (favicon, logo, icons) get 1 day cache
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));

    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK] Server running on http://0.0.0.0:${PORT} in ${NODE_ENV} mode.`);
  });
}

startServer();
