import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { db, isDbConnected, checkDbConnection } from './src/db/index';
import { users, orders, inquiries, messages, quotes, auditLogs } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { runMigrations } from './src/db/migrate';
import { memoryStore } from './src/db/memoryStore';

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
  } catch (err: any) {
    console.warn('[SEED] Notice during initial database seeding check:', err.message);
  }
}

async function startServer() {
  const app = express();

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
  // MESSAGES
  // ==========================================

  // GET /api/messages
  app.get('/api/messages', async (req, res) => {
    try {
      const { chatId, orderId } = req.query;

      if (isDbConnected() && db) {
        try {
          if (chatId) {
            const rows = await db.select().from(messages).where(eq(messages.chatId, String(chatId))).orderBy(messages.createdAt);
            return res.status(200).json({ messages: rows });
          }
          if (orderId) {
            const rows = await db.select().from(messages).where(eq(messages.orderId, String(orderId))).orderBy(messages.createdAt);
            return res.status(200).json({ messages: rows });
          }
          const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(100);
          return res.status(200).json({ messages: rows });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying messages from DB:', dbErr.message);
        }
      }

      return res.status(200).json({
        messages: memoryStore.getMessages(chatId as string | undefined, orderId as string | undefined)
      });
    } catch (err: any) {
      return res.status(200).json({ messages: [] });
    }
  });

  // POST /api/messages
  app.post('/api/messages', async (req, res) => {
    try {
      const data = req.body;
      if (!data.chatId || !data.senderId || !data.content) {
        return res.status(400).json({ error: 'Missing required message parameters (chatId, senderId, content).' });
      }

      const msgId = data.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newMsg = {
        id: msgId,
        chatId: data.chatId,
        orderId: data.orderId || null,
        senderId: data.senderId,
        receiverId: data.receiverId || null,
        content: data.content,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        isSystem: Boolean(data.isSystem),
        read: Boolean(data.read),
        createdAt: data.createdAt || new Date().toISOString(),
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK] Server running on http://0.0.0.0:${PORT} in ${NODE_ENV} mode.`);
  });
}

startServer();
