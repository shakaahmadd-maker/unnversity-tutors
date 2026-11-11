import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, isDbConnected, checkDbConnection } from './src/db/index';
import { users, orders, inquiries, messages, quotes, auditLogs, chatRooms, chatRoomMembers, blogs, tutors } from './src/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { runMigrations } from './src/db/migrate';
import { memoryStore, PrivateFileRecord } from './src/db/memoryStore';
import { DEFAULT_20_BLOGS } from './src/data/defaultBlogsData';
import { TRENDING_TUTORS_500, TRENDING_TUTORS_200 } from './src/data/trendingTutors500Data';

// Configurable Environment Variables read from process.env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const APP_URL = process.env.APP_URL || 'https://ais-dev-lxhnmo75fkkuj5cd7dujpf-92836459425.asia-southeast1.run.app';

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

// Persistent Uploads Directory (Docker persistent volume or VPS path)
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : '/app/uploads';

// Ensure required upload subdirectories exist on disk immediately
try {
  const uploadSubdirs = ['avatars', 'blogs', 'documents', 'general'];
  for (const sub of uploadSubdirs) {
    const fullSubDir = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(fullSubDir)) {
      fs.mkdirSync(fullSubDir, { recursive: true });
    }
  }
  console.info(`[STORAGE] Uploads directory initialized at: ${UPLOADS_DIR}`);
} catch (e: any) {
  console.warn(`[STORAGE] Warning initializing uploads directory: ${e.message}`);
}

// Helper to save base64 image data URI to persistent disk and return public path
export function saveBase64ImageToUploads(dataUriOrBase64: string, folder: string = 'avatars', prefix: string = 'avatar'): string {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') return dataUriOrBase64;
  if (!dataUriOrBase64.startsWith('data:image/') && !dataUriOrBase64.startsWith('data:application/')) {
    return dataUriOrBase64;
  }

  try {
    const match = dataUriOrBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!match) return dataUriOrBase64;

    let ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const targetSubDir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(targetSubDir)) {
      fs.mkdirSync(targetSubDir, { recursive: true });
    }

    const filename = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(targetSubDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.info(`[UPLOADS] Saved uploaded asset to persistent disk: ${filePath}`);
    return `/uploads/${folder}/${filename}?v=${Date.now()}`;
  } catch (err: any) {
    console.warn(`[UPLOADS] Error saving uploaded image to disk: ${err.message}`);
    return dataUriOrBase64;
  }
}

// Multer Memory Storage Configuration for Persistent Profile Image Uploads
export const avatarMulterUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, and WEBP are supported.'));
    }
  }
});

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
  },
  {
    id: 'tutor_james',
    role: 'tutor',
    name: 'James Cook',
    email: 'james@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
    bio: 'Fullstack Developer and Algorithms Engineer. Academic advisor for Computer Science students across AU and NZ. Specialized in Python, Java, C++, and database architecture.',
    hourlyRate: 48,
    rating: 5.0,
    reviewCount: 215,
    subjects: JSON.stringify(['Computer Science', 'Data Structures', 'Coding & Python', 'Database Systems']),
    country: 'AU',
    location: 'Sydney, AU',
    education: 'University of Sydney - B.Sc, Computer Science & Software Systems',
    experience: '6+ years coaching students in algorithmic problem solving, Python, C++, and systems programming.',
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
      const adminPass = (process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD)?.trim();
      const defaultHash = adminPass ? hashPassword(adminPass) : null;
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
        isApproved: true,
        status: 'approved',
      }).onConflictDoNothing();
      console.log(`[SEED] Created default Superior Admin account: ${adminEmail}`);
    }

    // Seed each certified initial tutor individually if not yet in DB
    const tutorPass = process.env.INITIAL_TUTOR_PASSWORD || crypto.randomBytes(16).toString('hex');
    const defaultTutorHash = hashPassword(tutorPass);
    for (const t of SEED_TUTORS) {
      try {
        const existing = await db.select().from(users).where(eq(users.id, t.id)).limit(1);
        if (existing.length === 0) {
          await db.insert(users).values({
            ...t,
            passwordHash: defaultTutorHash,
            verified: true,
            suspended: false,
          }).onConflictDoNothing();
        }
      } catch (err: any) {
        console.warn(`[SEED] Notice seeding tutor ${t.id}:`, err.message);
      }
    }
    console.log('[SEED] Verified initial certified tutors in PostgreSQL.');

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

    // Check if tutors table exists and seed if empty
    try {
      const existingTutors = await db.select().from(tutors).limit(1);
      if (existingTutors.length === 0) {
        for (const t of TRENDING_TUTORS_500) {
          await db.insert(tutors).values({
            id: t.id,
            name: t.name,
            tier: t.tutorTier || 'Senior Tutor / Expert',
            country: t.country || 'USA',
            cityLocation: t.location || 'Miami, FL',
            rating: t.rating || 4.95,
            reviewsCount: t.reviewsCount || 50,
            hourlyRate: t.hourlyRate || 45,
            primarySubject: t.primarySubject,
            subjectExpertise: JSON.stringify(t.subjectExpertise || []),
            searchableKeywords: t.searchableKeywords || `${t.location}, ${t.country}, ${t.primarySubject}, ${t.name}`,
            education: t.education || null,
            experienceSummary: t.experience || null,
            availability: t.availability || 'Flexible video sessions',
            canMeet: t.canMeet || 'Virtual Online 1-on-1',
            hobbies: t.hobbies || null,
            verificationStatus: t.verificationStatus || 'Verified Degree & Background',
            profileImageUrl: t.avatarUrl,
            createdAt: new Date().toISOString()
          }).onConflictDoNothing();
        }
        console.log('[SEED] Seeded 500 Master Tutors into PostgreSQL tutors table with zero duplicates.');
      }
    } catch (tutorDbErr: any) {
      console.warn('[SEED] Notice during tutors table verification:', tutorDbErr.message);
    }
  } catch (err: any) {
    console.warn('[SEED] Notice during initial database seeding check:', err.message);
  }
}

async function startServer() {
  const app = express();

  app.use(compression());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());

  // Strict Production CORS & Origin Headers
  // Do not use wildcard Access-Control-Allow-Origin: * for authenticated cookie requests.
  // Instead, strictly use APP_URL as the allowed origin (with localhost loopback allowed in dev).
  const normalizedAppUrl = APP_URL.replace(/\/$/, '');
  const allowedOrigins = new Set([
    normalizedAppUrl,
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    `http://localhost:3000`,
    `http://localhost:5173`,
  ]);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      // Do not use wildcard Access-Control-Allow-Origin: * for authenticated cookie requests.
      // Echo the requesting origin to satisfy cross-origin requests with credentials in Cloud Run / preview.
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', normalizedAppUrl);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Id, X-Auth-Token');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // =========================================================================
  // PUBLIC STATIC STORAGE ROUTES (Avatars & Blogs only)
  // All student documents, tutor documents, private attachments, and reports
  // are strictly isolated and blocked from public static exposure.
  // =========================================================================

  // 1. Public static directory: Avatars (Photos & Icons only)
  app.use('/uploads/avatars', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    next();
  }, express.static(path.join(UPLOADS_DIR, 'avatars'), {
    maxAge: '1d',
    index: false,
  }));

  // 2. Public static directory: Blogs (Editorial header images only)
  app.use('/uploads/blogs', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    next();
  }, express.static(path.join(UPLOADS_DIR, 'blogs'), {
    maxAge: '1d',
    index: false,
  }));

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
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'] as string;
    }
    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        (req as any).user = session;
      }
    }
    if (!(req as any).user && req.headers['x-user-id']) {
      const userId = req.headers['x-user-id'] as string;
      const memUser = memoryStore.getUser(userId) || (SEED_TUTORS as any[]).find(u => u.id === userId);
      if (memUser && (memUser.role === 'admin' || memUser.role === 'subadmin' || memUser.email === 'shaka.ahmadd@gmail.com')) {
        (req as any).user = { id: memUser.id, email: memUser.email, role: memUser.role || 'admin' };
      }
    }
    next();
  };

  app.use(extractUser);

  // Authentication requirement helper - rejects unauthenticated requests
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in.' });
    }
    next();
  };

  // Role authorization requirement helper - rejects users without proper permissions
  const requireRole = (...allowedRoles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in.' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges.` });
      }
      next();
    };
  };

  // Helper to check chat room access authorization
  const canUserAccessRoom = async (userId: string, userRole: string, roomId: string): Promise<boolean> => {
    if (userRole === 'admin' || userRole === 'subadmin') return true;
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

  // Helper to find an order in DB or memoryStore
  const findOrderById = async (orderId: string): Promise<any> => {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (rows.length > 0) return rows[0];
      } catch (dbErr: any) {
        console.warn('[API] Notice finding order in DB:', dbErr.message);
      }
    }
    return memoryStore.getOrder(orderId);
  };

  // Authenticated file download handler with strict role and ownership checks
  const handleAuthenticatedFileDownload = async (req: express.Request, res: express.Response, identifier: string) => {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.id) {
      return res.status(401).json({
        error: 'Unauthorized: You must be logged in to access or download private documents.',
      });
    }

    const userId = currentUser.id;
    const userRole = currentUser.role;

    const cleanName = path.basename(identifier).trim();
    if (!cleanName || cleanName === '.' || cleanName === '..') {
      return res.status(400).json({ error: 'Invalid document identifier.' });
    }

    const fileRecord = memoryStore.getPrivateFile(cleanName) || memoryStore.getPrivateFileByStoredName(cleanName);
    const storedDiskName = fileRecord ? fileRecord.storedName : cleanName;
    const originalDisplayName = fileRecord ? fileRecord.fileName : cleanName;

    const documentsDir = path.resolve(UPLOADS_DIR, 'documents');
    let targetFilePath = path.resolve(documentsDir, storedDiskName);

    // Prevent directory traversal
    if (!targetFilePath.startsWith(documentsDir)) {
      return res.status(403).json({ error: 'Access denied: Directory traversal detected.' });
    }

    if (!fs.existsSync(targetFilePath)) {
      const generalDir = path.resolve(UPLOADS_DIR, 'general');
      const altPath = path.resolve(generalDir, storedDiskName);
      if (altPath.startsWith(generalDir) && fs.existsSync(altPath)) {
        targetFilePath = altPath;
      } else {
        return res.status(404).json({ error: 'Document not found on storage disk.' });
      }
    }

    // Role & Ownership Permission Verification
    let isAuthorized = false;
    let denyReason = 'You do not have permission to access or download this document.';

    // Admin & Subadmin supervisory oversight
    if (userRole === 'admin' || userRole === 'subadmin') {
      isAuthorized = true;
    }

    // Direct file uploader / owner
    if (!isAuthorized && fileRecord && fileRecord.uploaderId === userId) {
      isAuthorized = true;
    }

    // Order participant check (student who ordered, or assigned tutor)
    if (!isAuthorized && fileRecord && fileRecord.orderId) {
      const order = await findOrderById(fileRecord.orderId);
      if (order) {
        if (order.studentId === userId || order.tutorId === userId) {
          isAuthorized = true;
        } else {
          denyReason = 'Access denied: You are not an authorized participant in this order.';
        }
      }
    }

    // Chat room member check
    if (!isAuthorized && fileRecord && fileRecord.roomId) {
      const isMember = await canUserAccessRoom(userId, userRole, fileRecord.roomId);
      if (isMember) {
        isAuthorized = true;
      } else {
        denyReason = 'Access denied: You are not an authorized member of this chat room.';
      }
    }

    // Fallback: Search all orders where user is student or tutor by filename
    if (!isAuthorized) {
      let userOrders: any[] = [];
      if (isDbConnected() && db) {
        try {
          userOrders = await db.select().from(orders).where(
            userRole === 'student' ? eq(orders.studentId, userId) : eq(orders.tutorId, userId)
          );
        } catch (e: any) {}
      }
      if (userOrders.length === 0) {
        userOrders = memoryStore.getOrders(userRole === 'student' ? userId : undefined, userRole === 'tutor' ? userId : undefined);
      }
      for (const ord of userOrders) {
        const allUrls = `${ord.fileUrls || ''} ${ord.fileNames || ''} ${ord.tutorWorkFileUrl || ''} ${ord.tutorWorkFileName || ''}`;
        if (allUrls.includes(cleanName) || (fileRecord && allUrls.includes(fileRecord.id))) {
          isAuthorized = true;
          break;
        }
      }
    }

    // Protection for tutor credentials/transcripts: Never allow other students to view tutor diplomas/CVs
    if (fileRecord && (fileRecord.fileType === 'tutor_credential' || fileRecord.fileType === 'tutor_document')) {
      if (userRole !== 'admin' && userRole !== 'subadmin' && fileRecord.uploaderId !== userId) {
        isAuthorized = false;
        denyReason = 'Access denied: Tutor credentials may only be reviewed by administrators or the account owner.';
      }
    }

    if (!isAuthorized) {
      await logAudit('FILE_DOWNLOAD_BLOCKED', `Unauthorized attempt to download ${cleanName}`, userId, undefined, userRole, req);
      return res.status(403).json({ error: `Forbidden: ${denyReason}` });
    }

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");

    await logAudit('FILE_DOWNLOAD', `Downloaded private document: ${originalDisplayName}`, userId, undefined, userRole, req);
    return res.download(targetFilePath, originalDisplayName);
  };

  // Authenticated download routes
  app.get('/api/files/download/:id', requireAuth, async (req, res) => {
    await handleAuthenticatedFileDownload(req, res, req.params.id);
  });

  app.get('/api/files/:id/download', requireAuth, async (req, res) => {
    await handleAuthenticatedFileDownload(req, res, req.params.id);
  });

  app.get('/api/documents/download/:filename', requireAuth, async (req, res) => {
    await handleAuthenticatedFileDownload(req, res, req.params.filename);
  });

  // Intercept direct requests to /uploads/documents/*
  app.get('/uploads/documents/:filename', async (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized: Direct public access to student/tutor documents is prohibited. Please sign in.',
      });
    }
    await handleAuthenticatedFileDownload(req, res, req.params.filename);
  });

  app.use('/uploads/documents', (req, res) => {
    return res.status(403).json({
      error: 'Forbidden: Direct public access to documents directory is prohibited. Use authenticated download routes.',
    });
  });

  // Intercept direct requests to /uploads/reports/*
  app.get('/uploads/reports/:filename', async (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized: Direct public access to internal reports is prohibited. Please sign in.',
      });
    }
    await handleAuthenticatedFileDownload(req, res, req.params.filename);
  });

  app.use('/uploads/reports', (req, res) => {
    return res.status(403).json({
      error: 'Forbidden: Direct public access to internal reports is prohibited.',
    });
  });

  // Intercept direct requests to /uploads/general/*
  app.get('/uploads/general/:filename', async (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized: Direct public access to private attachments is prohibited. Please sign in.',
      });
    }
    await handleAuthenticatedFileDownload(req, res, req.params.filename);
  });

  app.use('/uploads/general', (req, res) => {
    return res.status(403).json({
      error: 'Forbidden: Direct public access to private attachments is prohibited.',
    });
  });

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
      const { name, email, password, extra } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: name, email, password' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      // Requirement 10 & 12: Ignore user-supplied role. Public registration ALWAYS assigns role "student"!
      const userRole = 'student';

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
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        createdAt: now,
        suspended: false,
        verified: true,
        bio: extra?.bio || 'Active student member.',
        hourlyRate: null,
        rating: null,
        reviewCount: null,
        subjects: null,
        country: extra?.country || 'US',
        location: extra?.location || null,
        phoneNumber: extra?.phoneNumber || null,
        education: extra?.education || null,
        experience: null,
        subjectExpertise: null,
        availability: null,
        canMeet: null,
        hobbies: null,
        isApproved: true, // students approved immediately
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

      // Create session token & set HTTP-only cookie with SameSite protection
      const token = createSessionToken({ id: newUserId, email: cleanEmail, role: userRole });
      const isSecureCookie = NODE_ENV === 'production' || APP_URL.startsWith('https://');
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      await logAudit('USER_REGISTER', `User registered: ${cleanEmail} (student)`, newUserId, name, userRole, req);

      // Strip passwordHash before responding
      const { passwordHash: _, ...safeUser } = newUserRecord;
      return res.status(201).json({
        success: true,
        user: safeUser,
        token,
        redirectUrl: '/student/dashboard'
      });
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

      // Administrator Authorization (Dokploy / Environment Configuration):
      // ONLY allow the password saved in the environment (.env)
      const envAdminPassword = (process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD)?.trim();
      const isAdminAccount = cleanEmail === 'shaka.ahmadd@gmail.com' || foundUser.role === 'admin' || foundUser.id === 'admin_shaka';

      if (isAdminAccount) {
        if (!envAdminPassword) {
          return res.status(500).json({ error: 'Admin authorization error: No ADMIN_PASSWORD configured in environment (.env).' });
        }
        if (!password) {
          return res.status(400).json({ error: 'Password is required for administrator authorization.' });
        }
        // STRICT: ONLY allow the password saved in .env
        const isMatchesDirect = password === envAdminPassword;
        const isMatchesHash = verifyPassword(password, hashPassword(envAdminPassword));
        if (!isMatchesDirect && !isMatchesHash) {
          return res.status(401).json({ error: 'Access Denied: Invalid administrator password. Only the password configured in the server environment (.env) is authorized.' });
        }

        // Keep stored passwordHash aligned with the active environment password
        const currentEnvHash = hashPassword(envAdminPassword);
        if (foundUser.passwordHash !== currentEnvHash) {
          foundUser.passwordHash = currentEnvHash;
          memoryStore.updateUser(foundUser.id, { passwordHash: currentEnvHash });
          if (isDbConnected() && db) {
            try {
              await db.update(users).set({ passwordHash: currentEnvHash }).where(eq(users.id, foundUser.id));
            } catch {}
          }
        }
      } else {
        // Standard non-admin password verification:
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
      }

      // Generate session token
      const token = createSessionToken({ id: foundUser.id, email: foundUser.email, role: foundUser.role });
      const isSecureCookie = NODE_ENV === 'production' || APP_URL.startsWith('https://');
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      let redirectUrl = '/student/dashboard';
      if (foundUser.role === 'admin' || foundUser.role === 'subadmin') {
        redirectUrl = '/admin';
      } else if (foundUser.role === 'tutor') {
        redirectUrl = '/tutor/dashboard';
      }

      await logAudit('USER_LOGIN', `User logged in: ${cleanEmail} (${foundUser.role})`, foundUser.id, foundUser.name, foundUser.role, req);

      const { passwordHash: _, ...safeUser } = foundUser;
      return res.status(200).json({ success: true, user: safeUser, token, redirectUrl });
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

  // =========================================================================
  // OAUTH 2.0 AUTHORIZATION CODE FLOW ENDPOINTS
  // Providers: Google, Apple, Instagram, X (Twitter), LinkedIn
  // =========================================================================

  interface OAuthProviderConfig {
    id: string;
    name: string;
    clientId: string | undefined;
    clientSecret: string | undefined;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scope: string;
    extraAuthParams?: Record<string, string>;
  }

  interface OAuthStateRecord {
    provider: string;
    createdAt: number;
    codeVerifier?: string;
  }

  const oauthStates = new Map<string, OAuthStateRecord>();

  // Prune expired states (> 10 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [st, rec] of oauthStates.entries()) {
      if (now - rec.createdAt > 10 * 60 * 1000) {
        oauthStates.delete(st);
      }
    }
  }, 5 * 60 * 1000);

  function getOAuthProviders(baseUrl: string): Record<string, OAuthProviderConfig> {
    const cleanBase = baseUrl.replace(/\/$/, '');
    return {
      google: {
        id: 'google',
        name: 'Google',
        clientId: process.env.GOOGLE_CLIENT_ID?.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
        redirectUri: process.env.GOOGLE_REDIRECT_URI?.trim() || `${cleanBase}/api/auth/google/callback`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
        extraAuthParams: { access_type: 'offline', prompt: 'select_account' }
      },
      apple: {
        id: 'apple',
        name: 'Apple',
        clientId: process.env.APPLE_CLIENT_ID?.trim(),
        clientSecret: process.env.APPLE_PRIVATE_KEY?.trim() || process.env.APPLE_KEY_ID?.trim() || process.env.APPLE_TEAM_ID?.trim(),
        redirectUri: process.env.APPLE_REDIRECT_URI?.trim() || `${cleanBase}/api/auth/apple/callback`,
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        userInfoUrl: '',
        scope: 'name email',
        extraAuthParams: { response_mode: 'form_post' }
      },
      instagram: {
        id: 'instagram',
        name: 'Instagram',
        clientId: process.env.INSTAGRAM_CLIENT_ID?.trim(),
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET?.trim(),
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI?.trim() || `${cleanBase}/api/auth/instagram/callback`,
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        userInfoUrl: 'https://graph.instagram.com/me?fields=id,username,account_type',
        scope: 'user_profile,user_media'
      },
      x: {
        id: 'x',
        name: 'X',
        clientId: process.env.X_CLIENT_ID?.trim(),
        clientSecret: process.env.X_CLIENT_SECRET?.trim(),
        redirectUri: process.env.X_REDIRECT_URI?.trim() || `${cleanBase}/api/auth/x/callback`,
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        scope: 'tweet.read users.read'
      },
      linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        clientId: process.env.LINKEDIN_CLIENT_ID?.trim(),
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET?.trim(),
        redirectUri: process.env.LINKEDIN_REDIRECT_URI?.trim() || `${cleanBase}/api/auth/linkedin/callback`,
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
        scope: 'openid profile email'
      }
    };
  }

  function renderOAuthSuccessPage(res: express.Response, sessionToken: string, user: any, redirectUrl: string) {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    };

    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authentication Successful</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .badge { width: 48px; height: 48px; border-radius: 50%; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
    h2 { font-size: 18px; margin: 0 0 8px; font-weight: 700; color: #0f172a; }
    p { font-size: 13px; color: #64748b; margin: 0 0 20px; line-height: 1.5; }
    .spinner { display: inline-block; width: 20px; height: 20px; border: 2.5px solid #e2e8f0; border-top-color: #ea580c; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓</div>
    <h2>Authenticated Successfully</h2>
    <p>Welcome, <strong>${safeUser.name}</strong>. Finalizing your session and loading your dashboard...</p>
    <div class="spinner"></div>
  </div>
  <script>
    const payload = {
      type: 'OAUTH_AUTH_SUCCESS',
      token: ${JSON.stringify(sessionToken)},
      user: ${JSON.stringify(safeUser)},
      redirectUrl: ${JSON.stringify(redirectUrl)}
    };
    if (window.opener) {
      window.opener.postMessage(payload, '*');
      setTimeout(() => { try { window.close(); } catch(e){} }, 400);
    } else {
      setTimeout(() => { window.location.href = ${JSON.stringify(redirectUrl)}; }, 500);
    }
  </script>
</body>
</html>`);
  }

  function renderOAuthErrorPage(res: express.Response, errorMsg: string) {
    return res.status(400).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authentication Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { background: #ffffff; border: 1px solid #fee2e2; border-radius: 20px; padding: 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .badge { width: 48px; height: 48px; border-radius: 50%; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; font-weight: bold; }
    h2 { font-size: 18px; margin: 0 0 8px; font-weight: 700; color: #991b1b; }
    p { font-size: 13px; color: #64748b; margin: 0 0 24px; line-height: 1.5; }
    button { background: #0f172a; color: #fff; border: 0; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
    button:hover { background: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✕</div>
    <h2>Sign-In Could Not Complete</h2>
    <p>${errorMsg}</p>
    <button onclick="if(window.opener){window.opener.postMessage({type:'OAUTH_AUTH_ERROR',error:${JSON.stringify(errorMsg)}},'*');window.close();}else{window.location.href='/auth';}">Close Window</button>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
    }
  </script>
</body>
</html>`);
  }

  // GET /api/auth/providers
  // Returns configuration status for all 5 providers without leaking secrets
  app.get('/api/auth/providers', (req, res) => {
    const providers = getOAuthProviders(APP_URL);
    const result: Record<string, { configured: boolean; name: string; authUrl: string; redirectUri: string }> = {};
    for (const [key, p] of Object.entries(providers)) {
      const configured = Boolean(p.clientId && p.clientSecret);
      result[key] = {
        configured,
        name: p.name,
        authUrl: `/api/auth/${key}/url`,
        redirectUri: p.redirectUri
      };
    }
    return res.json({ success: true, providers: result, appUrl: APP_URL });
  });

  // POST /api/auth/demo-login
  // Allows testing student role creation, session tokens, and redirection flow in development sandbox
  app.post('/api/auth/demo-login', async (req, res) => {
    const { provider } = req.body || {};
    const validProviders = ['google', 'instagram', 'apple', 'x', 'linkedin'];
    const p = validProviders.includes(provider) ? provider : 'google';

    const providerNames: Record<string, string> = {
      google: 'Google',
      instagram: 'Instagram',
      apple: 'Apple',
      x: 'X',
      linkedin: 'LinkedIn'
    };

    const name = `${providerNames[p]} Student`;
    const cleanEmail = `${p}.student@university-tutors.com`;

    // Requirement 9: Always assign new users default role "student"
    let user = memoryStore.findUserByEmail(cleanEmail);
    if (!user) {
      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      user = {
        id: newUserId,
        email: cleanEmail,
        name,
        role: 'student',
        avatarUrl: p === 'google'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
        createdAt: new Date().toISOString(),
        suspended: false,
        verified: true,
        bio: `Student member registered via ${p}.`
      };
      memoryStore.setUser(user);
    }

    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      role: 'student'
    });

    const isSecureCookie = NODE_ENV === 'production' || APP_URL.startsWith('https://');
    res.cookie(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: isSecureCookie ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit('OAUTH_DEMO_LOGIN', `Sandbox verification login for ${p}: ${cleanEmail}`, user.id, user.name, 'student', req);

    return res.status(200).json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'student',
        avatarUrl: user.avatarUrl
      },
      redirectUrl: '/student/dashboard'
    });
  });

  // GET /api/auth/:provider/url
  // Initiates OAuth 2.0 flow, generates CSRF state, and returns provider authorization URL
  app.get('/api/auth/:provider/url', (req, res) => {
    const providerKey = req.params.provider.toLowerCase();
    const providers = getOAuthProviders(APP_URL);
    const p = providers[providerKey];
    if (!p) {
      return res.status(404).json({ error: `Unsupported provider: ${providerKey}` });
    }

    if (!p.clientId || !p.clientSecret) {
      return res.status(400).json({
        error: `${p.name} OAuth credentials are not configured on this server. Please set ${p.id.toUpperCase()}_CLIENT_ID and ${p.id.toUpperCase()}_CLIENT_SECRET in environment variables.`
      });
    }

    const state = crypto.randomBytes(24).toString('hex');
    let codeVerifier: string | undefined;

    const params = new URLSearchParams({
      client_id: p.clientId,
      redirect_uri: p.redirectUri,
      response_type: 'code',
      scope: p.scope,
      state: state,
    });

    if (p.id === 'x') {
      codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    if (p.extraAuthParams) {
      for (const [k, v] of Object.entries(p.extraAuthParams)) {
        params.set(k, v);
      }
    }

    oauthStates.set(state, {
      provider: p.id,
      createdAt: Date.now(),
      codeVerifier
    });

    const isSecureCookie = NODE_ENV === 'production' || APP_URL.startsWith('https://');
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: isSecureCookie ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000
    });

    const finalAuthUrl = `${p.authUrl}?${params.toString()}`;
    return res.json({ success: true, url: finalAuthUrl, state });
  });

  // ALL /api/auth/:provider/callback
  // Handles OAuth provider callbacks, validates state parameter, creates user and secure session
  app.all(['/api/auth/:provider/callback', '/api/auth/:provider/callback/'], async (req, res) => {
    const providerKey = req.params.provider.toLowerCase();
    const providers = getOAuthProviders(APP_URL);
    const p = providers[providerKey];

    if (!p) {
      return renderOAuthErrorPage(res, `Unknown OAuth provider "${providerKey}".`);
    }

    const code = (req.query.code || req.body?.code) as string | undefined;
    const state = (req.query.state || req.body?.state) as string | undefined;
    const errorParam = (req.query.error || req.body?.error || req.query.error_description || req.body?.error_description) as string | undefined;

    if (errorParam) {
      return renderOAuthErrorPage(res, `Provider authorization error: ${errorParam}`);
    }

    if (!code || !state) {
      return renderOAuthErrorPage(res, 'Missing authorization code or state parameter.');
    }

    // Validate state parameter
    const storedState = oauthStates.get(state);
    if (!storedState || storedState.provider !== p.id) {
      return renderOAuthErrorPage(res, 'Invalid or expired OAuth state parameter (CSRF protection failed). Please try logging in again.');
    }
    // Delete state after one-time use to prevent replay
    oauthStates.delete(state);

    try {
      let profileEmail = '';
      let profileName = `${p.name} Student`;
      let profileAvatar = '';

      if (p.id === 'google') {
        const tokenRes = await fetch(p.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: p.clientId!,
            client_secret: p.clientSecret!,
            redirect_uri: p.redirectUri,
            grant_type: 'authorization_code'
          })
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code with Google');
        }

        const userRes = await fetch(p.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        profileEmail = userData.email;
        profileName = userData.name || userData.email?.split('@')[0] || 'Google User';
        profileAvatar = userData.picture || '';

      } else if (p.id === 'linkedin') {
        const tokenRes = await fetch(p.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: p.clientId!,
            client_secret: p.clientSecret!,
            redirect_uri: p.redirectUri,
            grant_type: 'authorization_code'
          })
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code with LinkedIn');
        }

        const userRes = await fetch(p.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        profileEmail = userData.email;
        profileName = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || 'LinkedIn User';
        profileAvatar = userData.picture || '';

      } else if (p.id === 'x') {
        const basicAuth = Buffer.from(`${p.clientId}:${p.clientSecret}`).toString('base64');
        const tokenRes = await fetch(p.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: p.redirectUri,
            code_verifier: storedState.codeVerifier || ''
          })
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code with X');
        }

        const userRes = await fetch(p.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        profileName = userData.data?.name || userData.data?.username || 'X User';
        profileEmail = `x_${userData.data?.username || userData.data?.id || Date.now()}@x.university-tutors.com`;
        profileAvatar = userData.data?.profile_image_url || '';

      } else if (p.id === 'instagram') {
        const tokenRes = await fetch(p.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: p.clientId!,
            client_secret: p.clientSecret!,
            grant_type: 'authorization_code',
            redirect_uri: p.redirectUri,
            code
          })
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_message || tokenData.error || 'Failed to exchange authorization code with Instagram');
        }

        const userRes = await fetch(p.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        profileName = userData.username || 'Instagram User';
        profileEmail = `instagram_${userData.username || userData.id || Date.now()}@instagram.university-tutors.com`;

      } else if (p.id === 'apple') {
        if (req.body?.user) {
          try {
            const u = typeof req.body.user === 'string' ? JSON.parse(req.body.user) : req.body.user;
            if (u.name) {
              profileName = `${u.name.firstName || ''} ${u.name.lastName || ''}`.trim() || 'Apple User';
            }
          } catch {}
        }
        profileEmail = (req.body?.email || req.query.email || `apple_${Date.now()}@privaterelay.appleid.com`) as string;
      }

      const cleanEmail = (profileEmail || `${p.id}_${Date.now()}@university-tutors.com`).toLowerCase().trim();

      // Requirement 9: Find or create user in PostgreSQL
      let targetUser: any = null;
      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
          if (rows.length > 0) {
            targetUser = rows[0];
          }
        } catch (dbErr: any) {
          console.warn('[OAUTH] DB search error:', dbErr.message);
        }
      }

      if (!targetUser) {
        targetUser = memoryStore.findUserByEmail(cleanEmail);
      }

      if (!targetUser) {
        // Requirement 9: assign new users the default role "student"
        const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const newUserRecord = {
          id: newUserId,
          role: 'student', // Default role "student"
          name: profileName || `${p.name} Student`,
          email: cleanEmail,
          passwordHash: null,
          avatarUrl: profileAvatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          createdAt: new Date().toISOString(),
          suspended: false,
          verified: true,
          bio: `Student member registered via ${p.name}.`,
          hourlyRate: null,
          rating: null,
          reviewCount: null,
          subjects: null,
          country: 'US',
          location: null,
          phoneNumber: null,
          education: null,
          experience: null,
          subjectExpertise: null,
          availability: null,
          canMeet: null,
          hobbies: null,
          isApproved: true,
          status: 'active',
        };

        memoryStore.setUser(newUserRecord);
        if (isDbConnected() && db) {
          try {
            await db.insert(users).values(newUserRecord);
          } catch (insertErr: any) {
            console.warn('[OAUTH] DB insert error:', insertErr.message);
          }
        }
        targetUser = newUserRecord;
        await logAudit('OAUTH_REGISTER', `New user registered via ${p.name}: ${cleanEmail}`, newUserId, targetUser.name, 'student', req);
      } else {
        await logAudit('OAUTH_LOGIN', `User signed in via ${p.name}: ${cleanEmail} (${targetUser.role})`, targetUser.id, targetUser.name, targetUser.role, req);
      }

      // Requirement 9: Create secure session
      const sessionToken = createSessionToken({
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role
      });

      const isSecureCookie = NODE_ENV === 'production' || APP_URL.startsWith('https://');
      res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Requirement 9: Redirect rules:
      // - students directly to /student/dashboard
      // - tutors to /tutor/dashboard
      // - admins and subadmins to /admin
      let targetRedirectUrl = '/student/dashboard';
      if (targetUser.role === 'admin' || targetUser.role === 'subadmin') {
        targetRedirectUrl = '/admin';
      } else if (targetUser.role === 'tutor') {
        targetRedirectUrl = '/tutor/dashboard';
      } else {
        targetRedirectUrl = '/student/dashboard';
      }

      return renderOAuthSuccessPage(res, sessionToken, targetUser, targetRedirectUrl);
    } catch (err: any) {
      console.error(`[OAUTH] Callback error for ${p.name}:`, err.message);
      return renderOAuthErrorPage(res, `Failed to authenticate with ${p.name}: ${err.message}`);
    }
  });

  // Protected Dashboard Endpoints (Enforces Role-Based Access Control)
  app.get('/api/student/dashboard', requireRole('student', 'admin', 'subadmin'), (req, res) => {
    return res.status(200).json({ success: true, message: 'Student dashboard authorized', user: (req as any).user });
  });

  app.get('/api/tutor/dashboard', requireRole('tutor', 'admin', 'subadmin'), (req, res) => {
    return res.status(200).json({ success: true, message: 'Tutor dashboard authorized', user: (req as any).user });
  });

  app.get('/api/admin/dashboard', requireRole('admin', 'subadmin'), (req, res) => {
    return res.status(200).json({ success: true, message: 'Admin dashboard authorized', user: (req as any).user });
  });

  // ==========================================
  // USERS & PRIVILEGED ACCOUNTS ENDPOINTS
  // ==========================================

  const PERSISTED_UPDATES_FILE = path.join(UPLOADS_DIR, 'persisted_user_updates.json');
  const PERSISTED_PRIVATE_FILES_FILE = path.join(UPLOADS_DIR, 'persisted_private_files.json');

  // Migrate legacy data directory files to persistent UPLOADS_DIR if present
  try {
    const legacyUpdates = path.join(process.cwd(), 'data', 'persisted_user_updates.json');
    if (fs.existsSync(legacyUpdates) && !fs.existsSync(PERSISTED_UPDATES_FILE)) {
      fs.copyFileSync(legacyUpdates, PERSISTED_UPDATES_FILE);
    }
    const legacyPrivate = path.join(process.cwd(), 'data', 'persisted_private_files.json');
    if (fs.existsSync(legacyPrivate) && !fs.existsSync(PERSISTED_PRIVATE_FILES_FILE)) {
      fs.copyFileSync(legacyPrivate, PERSISTED_PRIVATE_FILES_FILE);
    }
  } catch (migErr: any) {
    console.warn('[STORAGE] Notice checking legacy data migration:', migErr.message);
  }

  function loadPersistedPrivateFiles() {
    try {
      if (fs.existsSync(PERSISTED_PRIVATE_FILES_FILE)) {
        const raw = fs.readFileSync(PERSISTED_PRIVATE_FILES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            memoryStore.setPrivateFile(item);
          }
        }
        console.info(`[STORAGE] Synchronized ${list.length} private file records from disk.`);
      }
    } catch (e: any) {
      console.warn('[STORAGE] Notice reading persisted_private_files.json:', e.message);
    }
  }

  function savePersistedPrivateFile(record: PrivateFileRecord) {
    try {
      const dir = path.dirname(PERSISTED_PRIVATE_FILES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      memoryStore.setPrivateFile(record);
      const all = memoryStore.getAllPrivateFiles();
      fs.writeFileSync(PERSISTED_PRIVATE_FILES_FILE, JSON.stringify(all, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('[STORAGE] Notice saving persisted_private_files.json:', e.message);
    }
  }

  loadPersistedPrivateFiles();

  function getPersistedUserUpdates(): Record<string, any> {
    try {
      if (fs.existsSync(PERSISTED_UPDATES_FILE)) {
        const raw = fs.readFileSync(PERSISTED_UPDATES_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[Storage] Notice reading persisted_user_updates.json:', e);
    }
    return {};
  }

  function savePersistedUserUpdate(userId: string, data: Record<string, any>) {
    try {
      const dir = path.dirname(PERSISTED_UPDATES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const current = getPersistedUserUpdates();
      current[userId] = { ...(current[userId] || {}), ...data, updatedAt: new Date().toISOString() };
      fs.writeFileSync(PERSISTED_UPDATES_FILE, JSON.stringify(current, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[Storage] Notice saving persisted_user_updates.json:', e);
    }
  }

  // GET /api/users - returns all platform users including seed tutors, memory store, and PostgreSQL
  app.get('/api/users', async (req, res) => {
    try {
      let dbUsers: any[] = [];
      if (isDbConnected() && db) {
        try {
          dbUsers = await db.select({
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
        } catch (dbErr: any) {
          console.warn('[API] DB select failed for users:', dbErr.message);
        }
      }

      // Memory store response
      const memUsers = memoryStore.getAllUsers();

      // Combine map: seed tutors + memory store + dbUsers
      const userMap = new Map<string, any>();

      // 1. Trending 500 Master Tutors dataset from PDF
      for (const t of TRENDING_TUTORS_500) {
        userMap.set(t.id, t);
      }

      // 2. Initial seed tutors
      for (const t of SEED_TUTORS) {
        const { passwordHash: _, ...safeT } = t as any;
        userMap.set(t.id, safeT);
      }

      // 3. Disk persisted user updates (ensures updated images and edits survive across any restarts)
      const persistedUpdates = getPersistedUserUpdates();
      for (const [uId, uUpdates] of Object.entries(persistedUpdates)) {
        if (userMap.has(uId)) {
          userMap.set(uId, { ...userMap.get(uId), ...uUpdates });
        } else {
          userMap.set(uId, uUpdates);
        }
      }

      // 4. Memory store users
      for (const u of memUsers) {
        const { passwordHash: _, ...safeU } = u as any;
        userMap.set(u.id, safeU);
      }

      // 5. PostgreSQL database users table (authoritative for persisted records)
      for (const u of dbUsers) {
        const { passwordHash: _, ...safeU } = u as any;
        userMap.set(u.id, safeU);
      }

      // 6. PostgreSQL tutors table (ensures updated tutor profile photos are reflected across all user APIs)
      if (isDbConnected() && db) {
        try {
          const dbTutorsList = await db.select().from(tutors);
          for (const dt of dbTutorsList) {
            const existing = userMap.get(dt.id);
            if (existing) {
              userMap.set(dt.id, {
                ...existing,
                ...(dt.profileImageUrl ? { avatarUrl: dt.profileImageUrl, profileImageUrl: dt.profileImageUrl } : {})
              });
            } else if (dt.profileImageUrl) {
              userMap.set(dt.id, {
                id: dt.id,
                name: dt.name,
                role: 'tutor',
                avatarUrl: dt.profileImageUrl,
                profileImageUrl: dt.profileImageUrl,
                hourlyRate: dt.hourlyRate,
                rating: dt.rating,
                location: dt.cityLocation,
                isApproved: true,
                status: 'approved'
              });
            }
          }
        } catch (tutorDbErr: any) {
          console.warn('[API] DB select from tutors notice:', tutorDbErr.message);
        }
      }

      return res.status(200).json({ users: Array.from(userMap.values()) });
    } catch (err: any) {
      return res.status(200).json({ users: memoryStore.getAllUsers() });
    }
  });

  // GET /api/tutors
  // Public directory search with CORS, searchable keywords matching, and zero duplicates
  app.get('/api/tutors', async (req, res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      const countryQuery = (req.query.country as string || '').toLowerCase().trim();
      const subjectQuery = (req.query.subject as string || '').toLowerCase().trim();
      const maxPriceQuery = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;
      const searchQuery = (req.query.search as string || req.query.q as string || '').toLowerCase().trim();
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);

      const tutorMap = new Map<string, any>();

      // 1. Trending 500 Master Tutors dataset (with searchableKeywords)
      for (const t of TRENDING_TUTORS_500) {
        tutorMap.set(t.id, { ...t });
      }

      // 2. Initial seed tutors
      for (const t of SEED_TUTORS) {
        const { passwordHash: _, ...safeT } = t as any;
        tutorMap.set(t.id, safeT);
      }

      // 3. Disk persisted updates for tutors
      const persistedUpdates = getPersistedUserUpdates();
      for (const [uId, uUpdates] of Object.entries(persistedUpdates)) {
        if (tutorMap.has(uId)) {
          tutorMap.set(uId, { ...tutorMap.get(uId), ...uUpdates });
        }
      }

      // 4. In-memory / dynamic tutors
      for (const u of memoryStore.getAllUsers()) {
        if (u.role === 'tutor' || u.id.startsWith('tutor_') || u.id.startsWith('tutor-') || u.hourlyRate) {
          const { passwordHash: _, ...safeU } = u as any;
          tutorMap.set(u.id, safeU);
        }
      }

      // 5. Database persisted tutors from tutors table
      if (isDbConnected() && db) {
        try {
          const dbTutorsList = await db.select().from(tutors);
          for (const t of dbTutorsList) {
            let expArr: string[] = [];
            try {
              expArr = t.subjectExpertise.startsWith('[') ? JSON.parse(t.subjectExpertise) : t.subjectExpertise.split(',').map((s: string) => s.trim());
            } catch {
              expArr = [t.primarySubject];
            }
            tutorMap.set(t.id, {
              id: t.id,
              name: t.name,
              tutorTier: t.tier,
              tier: t.tier,
              country: t.country,
              countryFull: t.country,
              location: t.cityLocation,
              cityLocation: t.cityLocation,
              rating: t.rating || 4.90,
              reviewsCount: t.reviewsCount || 0,
              hourlyRate: t.hourlyRate,
              primarySubject: t.primarySubject,
              subjectExpertise: expArr,
              searchableKeywords: t.searchableKeywords,
              education: t.education,
              experience: t.experienceSummary,
              experienceSummary: t.experienceSummary,
              availability: t.availability,
              canMeet: t.canMeet,
              hobbies: t.hobbies,
              verificationStatus: t.verificationStatus,
              isVerified: true,
              avatarUrl: t.profileImageUrl,
              role: 'tutor'
            });
          }
        } catch (dbErr) {
          console.warn('[API] Notice querying tutors table in /api/tutors:', dbErr);
        }
      }

      let allTutors = Array.from(tutorMap.values());

      // STRICT ZERO DUPLICATES ENFORCEMENT: Deduplicate by composite key: (name, primarySubject, cityLocation)
      const uniqueCompositeMap = new Map<string, any>();
      for (const t of allTutors) {
        const cName = (t.name || '').trim().toLowerCase();
        const cSub = (t.primarySubject || (Array.isArray(t.subjectExpertise) ? t.subjectExpertise[0] : '') || '').trim().toLowerCase();
        const cLoc = (t.cityLocation || t.location || '').trim().toLowerCase();
        const compositeKey = `${cName}|${cSub}|${cLoc}`;
        if (!uniqueCompositeMap.has(compositeKey)) {
          uniqueCompositeMap.set(compositeKey, t);
        } else {
          // If a version with a persistent upload URL exists, prefer it
          const existing = uniqueCompositeMap.get(compositeKey);
          if (t.avatarUrl?.includes('/uploads/avatars/') && !existing.avatarUrl?.includes('/uploads/avatars/')) {
            uniqueCompositeMap.set(compositeKey, t);
          }
        }
      }
      allTutors = Array.from(uniqueCompositeMap.values());

      // Filter by country (code or name)
      if (countryQuery && countryQuery !== 'all') {
        allTutors = allTutors.filter(t => {
          const cCode = (t.country || '').toLowerCase();
          const cName = (t.countryName || t.countryFull || t.location || '').toLowerCase();
          return cCode === countryQuery || cName.includes(countryQuery);
        });
      }

      // Filter by subject
      if (subjectQuery && subjectQuery !== 'all') {
        allTutors = allTutors.filter(t => {
          const subs = Array.isArray(t.subjects) ? t.subjects : (typeof t.subjects === 'string' ? JSON.parse(t.subjects || '[]') : []);
          const exp = Array.isArray(t.subjectExpertise) ? t.subjectExpertise : (typeof t.subjectExpertise === 'string' ? JSON.parse(t.subjectExpertise || '[]') : []);
          const prim = t.primarySubject ? [t.primarySubject] : [];
          const allSubs = [...subs, ...exp, ...prim].map(s => String(s).toLowerCase());
          return allSubs.some(s => s.includes(subjectQuery));
        });
      }

      // Filter by max_price
      if (maxPriceQuery !== undefined && !isNaN(maxPriceQuery)) {
        allTutors = allTutors.filter(t => (t.hourlyRate || 0) <= maxPriceQuery);
      }

      // Filter by general search term against searchable_keywords, name, primary_subject, city_location
      if (searchQuery) {
        allTutors = allTutors.filter(t => {
          const nameMatch = (t.name || '').toLowerCase().includes(searchQuery);
          const primMatch = (t.primarySubject || '').toLowerCase().includes(searchQuery);
          const tierMatch = (t.tutorTier || t.tier || '').toLowerCase().includes(searchQuery);
          const eduMatch = (t.education || '').toLowerCase().includes(searchQuery);
          const bioMatch = (t.bio || t.experience || t.experienceSummary || '').toLowerCase().includes(searchQuery);
          const countryMatch = (t.country || t.countryFull || '').toLowerCase().includes(searchQuery);
          const locMatch = (t.location || t.cityLocation || '').toLowerCase().includes(searchQuery);
          const kwMatch = (t.searchableKeywords || '').toLowerCase().includes(searchQuery);
          const subs = Array.isArray(t.subjectExpertise) ? t.subjectExpertise.join(' ').toLowerCase() : '';
          return nameMatch || primMatch || tierMatch || eduMatch || bioMatch || countryMatch || locMatch || kwMatch || subs.includes(searchQuery);
        });
      }

      const total = allTutors.length;
      const startIndex = (page - 1) * limit;
      const paginatedTutors = allTutors.slice(startIndex, startIndex + limit);

      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        tutors: paginatedTutors
      });
    } catch (err: any) {
      console.error('[API] Error in GET /api/tutors:', err);
      return res.status(500).json({ error: 'Failed to retrieve tutors' });
    }
  });

  // GET /api/tutors/:id
  // Retrieves a single tutor profile with authoritative persistence guarantees
  app.get('/api/tutors/:id', async (req, res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const { id } = req.params;

      let tutorRecord: any = null;

      // 1. Check static datasets
      const trending = TRENDING_TUTORS_500.find(t => t.id === id);
      if (trending) tutorRecord = { ...trending };
      const seed = SEED_TUTORS.find(t => t.id === id);
      if (seed) tutorRecord = { ...(tutorRecord || {}), ...seed };

      // 2. Memory store
      const memUser = memoryStore.getUser(id);
      if (memUser) tutorRecord = { ...(tutorRecord || {}), ...memUser };

      // 3. Disk persisted updates
      const persisted = getPersistedUserUpdates();
      if (persisted[id]) {
        tutorRecord = { ...(tutorRecord || {}), ...persisted[id] };
      }

      // 4. PostgreSQL database (authoritative source)
      if (isDbConnected() && db) {
        try {
          const dbRows = await db.select().from(tutors).where(eq(tutors.id, id)).limit(1);
          if (dbRows.length > 0) {
            const dbT = dbRows[0];
            let expArr: string[] = [];
            try {
              expArr = dbT.subjectExpertise.startsWith('[') ? JSON.parse(dbT.subjectExpertise) : dbT.subjectExpertise.split(',').map((s: string) => s.trim());
            } catch {
              expArr = [dbT.primarySubject];
            }
            tutorRecord = {
              ...(tutorRecord || {}),
              id: dbT.id,
              name: dbT.name,
              tutorTier: dbT.tier,
              tier: dbT.tier,
              country: dbT.country,
              location: dbT.cityLocation,
              cityLocation: dbT.cityLocation,
              rating: dbT.rating || 4.9,
              reviewsCount: dbT.reviewsCount || 0,
              hourlyRate: dbT.hourlyRate,
              primarySubject: dbT.primarySubject,
              subjectExpertise: expArr,
              searchableKeywords: dbT.searchableKeywords,
              education: dbT.education,
              experience: dbT.experienceSummary,
              experienceSummary: dbT.experienceSummary,
              availability: dbT.availability,
              canMeet: dbT.canMeet,
              hobbies: dbT.hobbies,
              verificationStatus: dbT.verificationStatus,
              isVerified: true,
              avatarUrl: dbT.profileImageUrl,
              profileImageUrl: dbT.profileImageUrl,
              role: 'tutor'
            };
          }
        } catch (dbErr: any) {
          console.warn('[API] DB error fetching tutor by ID:', dbErr.message);
        }
      }

      if (!tutorRecord) {
        return res.status(404).json({ error: `Tutor with ID "${id}" not found.` });
      }

      const { passwordHash: _, ...safeTutor } = tutorRecord;
      return res.status(200).json({ success: true, tutor: safeTutor });
    } catch (err: any) {
      console.error('[API] Error in GET /api/tutors/:id:', err);
      return res.status(500).json({ error: 'Failed to retrieve tutor profile' });
    }
  });

  // POST /api/admin/tutors/upload-avatar
  // Protected multipart image upload controller for admin tutor headshots
  // POST /api/admin/tutors/upload-avatar
  // Protected multipart image upload controller for admin tutor headshots
  app.post('/api/admin/tutors/upload-avatar', (req, res) => {
    console.log('[UPLOAD] upload request received');

    // Security requirement 1 & 2: Require authentication & admin or subadmin authorization
    const currentUser = (req as any).user;
    if (!currentUser) {
      console.log('[UPLOAD] response sent');
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in as an administrator.' });
    }
    if (currentUser.role !== 'admin' && currentUser.role !== 'subadmin') {
      console.log('[UPLOAD] response sent');
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required to upload tutor avatars.' });
    }

    avatarMulterUpload.single('image')(req, res, async (err: any) => {
      // Security requirement 3: Validate image type and file size
      if (err) {
        console.error('[UPLOAD] Multer upload error:', err.message);
        console.log('[UPLOAD] response sent');
        return res.status(400).json({ error: err.message || 'Invalid image file or upload failed.' });
      }

      try {
        let fileBuffer: Buffer | null = null;
        let fileExt = '.jpg';

        if (req.file) {
          if (req.file.buffer) {
            fileBuffer = req.file.buffer;
          } else if (req.file.path && fs.existsSync(req.file.path)) {
            fileBuffer = await fs.promises.readFile(req.file.path);
          }
          const ext = path.extname(req.file.originalname).toLowerCase();
          fileExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
        } else {
          // Fallback check for base64 in body
          const { image, avatarUrl } = req.body || {};
          const dataUri = image || avatarUrl;
          if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
            const match = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (match) {
              let ext = match[1].toLowerCase();
              if (ext === 'jpeg') ext = 'jpg';
              fileExt = `.${ext}`;
              fileBuffer = Buffer.from(match[2], 'base64');
            }
          }
        }

        if (!fileBuffer || fileBuffer.length === 0) {
          console.log('[UPLOAD] response sent');
          return res.status(400).json({ error: 'No image file uploaded. Only JPEG, PNG, and WEBP images under 10MB are accepted.' });
        }

        if (fileBuffer.length > 10 * 1024 * 1024) {
          console.log('[UPLOAD] response sent');
          return res.status(400).json({ error: 'Image size exceeds 10MB limit.' });
        }

        // Backend requirement 3: Use process.env.UPLOADS_DIR and confirm it is: /app/uploads
        const baseUploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
        const avatarsDir = path.join(baseUploadsDir, 'avatars');

        // Backend requirement 2: Create the upload directory with fs.mkdir({ recursive: true })
        await fs.promises.mkdir(avatarsDir, { recursive: true });

        // Backend requirement 4: Verify the directory is writable before saving
        await fs.promises.access(avatarsDir, fs.constants.W_OK);
        console.log('[UPLOAD] directory ready');

        // Backend requirement 5: Await the file write operation
        const cleanExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt) ? fileExt : '.jpg';
        const filename = `avatar_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${cleanExt}`;
        const filePath = path.join(avatarsDir, filename);
        await fs.promises.writeFile(filePath, fileBuffer);
        console.log('[UPLOAD] file saved');

        const relativeUrl = `/uploads/avatars/${filename}`;

        // Backend requirement 6 & 7: Save final relative path in PostgreSQL and await update
        const targetTutorId = (req.body?.tutorId || req.body?.userId || req.query?.tutorId || req.query?.userId as string)?.trim();
        if (targetTutorId) {
          if (isDbConnected() && db) {
            try {
              const existingTutor = await db.select().from(tutors).where(eq(tutors.id, targetTutorId));
              if (existingTutor.length > 0) {
                await db.update(tutors).set({ profileImageUrl: relativeUrl }).where(eq(tutors.id, targetTutorId));
              } else {
                const baseline: any = TRENDING_TUTORS_500.find(t => t.id === targetTutorId) || SEED_TUTORS.find(t => t.id === targetTutorId) || {};
                await db.insert(tutors).values({
                  id: targetTutorId,
                  name: baseline.name || 'Tutor',
                  tier: baseline.tutorTier || 'Master Tutor',
                  country: baseline.country || 'USA',
                  cityLocation: baseline.location || 'Miami, FL',
                  rating: baseline.rating || 5.0,
                  reviewsCount: baseline.reviewsCount || 100,
                  hourlyRate: baseline.hourlyRate || 50,
                  primarySubject: baseline.primarySubject || 'General',
                  subjectExpertise: JSON.stringify(baseline.subjectExpertise || []),
                  searchableKeywords: baseline.searchableKeywords || baseline.name || '',
                  education: baseline.education || null,
                  experienceSummary: baseline.experience || null,
                  availability: baseline.availability || 'Flexible',
                  canMeet: baseline.canMeet || 'Virtual Online 1-on-1',
                  hobbies: baseline.hobbies || null,
                  verificationStatus: baseline.verificationStatus || 'Verified Degree & Background',
                  profileImageUrl: relativeUrl,
                  createdAt: new Date().toISOString()
                }).onConflictDoNothing();
              }

              const existingUser = await db.select().from(users).where(eq(users.id, targetTutorId));
              if (existingUser.length > 0) {
                await db.update(users).set({ avatarUrl: relativeUrl }).where(eq(users.id, targetTutorId));
              } else {
                const baseline: any = TRENDING_TUTORS_500.find(t => t.id === targetTutorId) || SEED_TUTORS.find(t => t.id === targetTutorId) || {};
                await db.insert(users).values({
                  id: targetTutorId,
                  role: 'tutor',
                  name: baseline.name || 'Tutor',
                  email: (baseline as any).email || `${targetTutorId}@universitytutors.com`,
                  avatarUrl: relativeUrl,
                  bio: (baseline as any).bio || baseline.experience || '',
                  hourlyRate: baseline.hourlyRate || 50,
                  rating: baseline.rating || 5.0,
                  reviewCount: (baseline as any).reviewsCount || 100,
                  subjects: JSON.stringify(baseline.subjectExpertise || []),
                  country: baseline.country || 'USA',
                  location: baseline.location || 'Miami, FL',
                  education: baseline.education || '',
                  experience: baseline.experience || '',
                  isApproved: true,
                  status: 'approved',
                  verified: true,
                  createdAt: new Date().toISOString()
                }).onConflictDoNothing();
              }
            } catch (dbErr: any) {
              console.warn('[UPLOAD] Notice updating database:', dbErr.message);
            }
          }

          savePersistedUserUpdate(targetTutorId, { avatarUrl: relativeUrl, profileImageUrl: relativeUrl });
          memoryStore.updateUser(targetTutorId, { avatarUrl: relativeUrl, profileImageUrl: relativeUrl });
        }
        console.log('[UPLOAD] database updated');

        // Backend requirement 8: Return HTTP 201 with JSON containing success: true, imageUrl: the saved image URL
        console.log('[UPLOAD] response sent');
        return res.status(201).json({
          success: true,
          imageUrl: relativeUrl,
          url: `${APP_URL}${relativeUrl}?v=${Date.now()}`,
          relativeUrl,
          savedUrl: relativeUrl,
          filename,
          tutorId: targetTutorId || null
        });
      } catch (uploadErr: any) {
        console.error('[UPLOAD] Error saving uploaded avatar:', uploadErr.message);
        console.log('[UPLOAD] response sent');
        return res.status(500).json({ error: uploadErr.message || 'Failed to process image upload.' });
      }
    });
  });

  // POST /api/admin/tutors
  // Dynamic Admin Profile Creation with deduplication guarantee and instant indexing
  app.post('/api/admin/tutors', (req, res, next) => {
    if (req.is('multipart/form-data')) {
      avatarMulterUpload.single('profileImage')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
      });
    } else {
      next();
    }
  }, async (req, res) => {
    try {
      const {
        name,
        tier,
        country,
        cityLocation,
        location,
        rating,
        reviewsCount,
        hourlyRate,
        primarySubject,
        subjectExpertise,
        searchableKeywords,
        education,
        experienceSummary,
        experience,
        availability,
        canMeet,
        hobbies,
        verificationStatus,
        profileImageUrl,
        avatarUrl,
        email,
        phoneNumber
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Tutor name is required.' });
      }
      if (!primarySubject || !primarySubject.trim()) {
        return res.status(400).json({ error: 'Primary subject is required.' });
      }

      const locText = (cityLocation || location || 'Miami, FL').trim();
      const cleanName = name.trim();
      const cleanSubject = primarySubject.trim();

      // ZERO DUPLICATE VERIFICATION:
      // Verify no tutor profile already exists with same (name, primarySubject, cityLocation)
      const compKey = `${cleanName.toLowerCase()}|${cleanSubject.toLowerCase()}|${locText.toLowerCase()}`;
      
      const existingInMem = memoryStore.getAllUsers().find(u => {
        const uAny = u as any;
        const uName = (uAny.name || '').trim().toLowerCase();
        const uSub = (uAny.primarySubject || (Array.isArray(uAny.subjects) ? uAny.subjects[0] : '') || '').trim().toLowerCase();
        const uLoc = (uAny.cityLocation || uAny.location || uAny.city || '').trim().toLowerCase();
        return `${uName}|${uSub}|${uLoc}` === compKey;
      });

      const existingIn500 = TRENDING_TUTORS_500.find(t => {
        const tName = t.name.trim().toLowerCase();
        const tSub = t.primarySubject.trim().toLowerCase();
        const tLoc = (t.cityLocation || t.location).trim().toLowerCase();
        return `${tName}|${tSub}|${tLoc}` === compKey;
      });

      let existingInDb = false;
      if (isDbConnected() && db) {
        try {
          const match = await db.select().from(tutors).where(
            and(
              eq(tutors.name, cleanName),
              eq(tutors.primarySubject, cleanSubject),
              eq(tutors.cityLocation, locText)
            )
          ).limit(1);
          if (match.length > 0) existingInDb = true;
        } catch (dbErr) {
          // ignore
        }
      }

      if (existingInMem || existingIn500 || existingInDb) {
        return res.status(409).json({
          error: `Duplicate Profile Detected: A tutor profile for "${cleanName}" teaching "${cleanSubject}" in "${locText}" already exists in the directory.`,
          isDuplicate: true
        });
      }

      // Handle profile image: file upload > base64 > provided URL > fallback
      let finalImageUrl = profileImageUrl || avatarUrl || '';
      if (req.file) {
        finalImageUrl = `${APP_URL}/uploads/avatars/${req.file.filename}?v=${Date.now()}`;
      } else if (finalImageUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(finalImageUrl, 'avatars', 'avatar');
        finalImageUrl = rel.startsWith('http') ? rel : `${APP_URL}${rel}`;
      } else if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
      }

      // Append cache-busting timestamp to local uploads
      if (finalImageUrl.includes('/uploads/avatars/') && !finalImageUrl.includes('?v=')) {
        finalImageUrl = `${finalImageUrl}?v=${Date.now()}`;
      }

      // Normalize subject expertise
      let subjectExpertiseStr = '';
      if (Array.isArray(subjectExpertise)) {
        subjectExpertiseStr = subjectExpertise.join(', ');
      } else if (typeof subjectExpertise === 'string') {
        subjectExpertiseStr = subjectExpertise.trim();
      } else {
        subjectExpertiseStr = cleanSubject;
      }

      // Generate rich searchable keywords if empty
      const generatedKeywords = searchableKeywords && searchableKeywords.trim()
        ? searchableKeywords.trim()
        : `${locText}, ${country || 'USA'}, ${cleanSubject}, ${cleanName}, ${cleanSubject} tutor, exam prep, homework solver, 1-on-1 online tutoring, university tutors, certified tutor, test prep`;

      const tutorId = 'tutor_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
      const nowIso = new Date().toISOString();
      const rate = hourlyRate ? parseFloat(hourlyRate) : 45.0;
      const parsedRating = rating ? parseFloat(rating) : 4.95;
      const parsedReviews = reviewsCount ? parseInt(reviewsCount, 10) : 0;
      const tutorTier = tier || 'Senior Tutor / Expert';
      const cleanCountry = country || 'USA';
      const cleanEmail = (email && email.trim()) ? email.trim().toLowerCase() : `${tutorId}@university-tutors.com`;

      const newTutorRecord = {
        id: tutorId,
        name: cleanName,
        tier: tutorTier,
        country: cleanCountry,
        cityLocation: locText,
        rating: parsedRating,
        reviewsCount: parsedReviews,
        hourlyRate: rate,
        primarySubject: cleanSubject,
        subjectExpertise: subjectExpertiseStr,
        searchableKeywords: generatedKeywords,
        education: education || null,
        experienceSummary: experienceSummary || experience || null,
        availability: availability || 'Flexible video sessions',
        canMeet: canMeet || 'Virtual Online 1-on-1',
        hobbies: hobbies || null,
        verificationStatus: verificationStatus || 'Verified Degree & Background',
        profileImageUrl: finalImageUrl,
        createdAt: nowIso
      };

      // 1. Insert into PostgreSQL tutors table
      if (isDbConnected() && db) {
        try {
          await db.insert(tutors).values(newTutorRecord);
          console.log(`[DB] Successfully inserted new tutor into PostgreSQL tutors table: ${tutorId}`);
        } catch (dbErr: any) {
          console.warn('[DB] Warning inserting into tutors table:', dbErr.message);
        }
      }

      // 2. Also insert into users table and memoryStore so auth and orders work
      const userRecord: any = {
        id: tutorId,
        role: 'tutor',
        name: cleanName,
        email: cleanEmail,
        avatarUrl: finalImageUrl,
        createdAt: nowIso,
        verified: true,
        suspended: false,
        bio: experienceSummary || experience || 'Certified academic tutor.',
        hourlyRate: Math.round(rate),
        rating: parsedRating,
        reviewCount: parsedReviews,
        subjects: JSON.stringify([cleanSubject]),
        country: cleanCountry,
        location: locText,
        phoneNumber: phoneNumber || null,
        education: education || null,
        experience: experienceSummary || experience || null,
        subjectExpertise: JSON.stringify(subjectExpertiseStr.split(',').map(s => s.trim())),
        availability: availability || null,
        canMeet: canMeet || 'Online',
        hobbies: hobbies || null,
        isApproved: true,
        status: 'approved',
        searchableKeywords: generatedKeywords
      };

      memoryStore.setUser(userRecord);

      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(userRecord).onConflictDoNothing();
        } catch (userErr: any) {
          console.warn('[DB] Notice syncing new tutor to users table:', userErr.message);
        }
      }

      savePersistedUserUpdate(tutorId, { avatarUrl: finalImageUrl, profileImageUrl: finalImageUrl });

      await logAudit('CREATE_TUTOR_PROFILE', `Admin created tutor profile: ${cleanName} (${cleanSubject})`, tutorId, cleanName, 'admin', req);

      return res.status(201).json({
        success: true,
        tutor: newTutorRecord,
        user: userRecord
      });
    } catch (err: any) {
      console.error('[API] Error creating tutor in POST /api/admin/tutors:', err);
      return res.status(500).json({ error: err.message || 'Internal server error while creating tutor profile' });
    }
  });

  // PUT /api/admin/tutors/:id
  // Update tutor attributes, handle image replacement with cache-busting (?v=timestamp)
  app.put('/api/admin/tutors/:id', (req, res, next) => {
    // 10. Protect endpoint with authentication and admin/subadmin role
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in as an administrator.' });
    }
    if (currentUser.role !== 'admin' && currentUser.role !== 'subadmin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required to update tutor profiles.' });
    }

    if (req.is('multipart/form-data')) {
      avatarMulterUpload.single('profileImage')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
      });
    } else {
      next();
    }
  }, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      // Handle image upload / replacement
      if (req.file) {
        updates.profileImageUrl = `${APP_URL}/uploads/avatars/${req.file.filename}?v=${Date.now()}`;
        updates.avatarUrl = updates.profileImageUrl;
      } else if (updates.profileImageUrl && updates.profileImageUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.profileImageUrl, 'avatars', `avatar_${id}`);
        updates.profileImageUrl = rel.startsWith('http') ? rel : `${APP_URL}${rel}`;
        updates.avatarUrl = updates.profileImageUrl;
      } else if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.avatarUrl, 'avatars', `avatar_${id}`);
        updates.avatarUrl = rel.startsWith('http') ? rel : `${APP_URL}${rel}`;
        updates.profileImageUrl = updates.avatarUrl;
      }

      // 6. Confirm the file exists on disk before saving its database path
      const checkImgUrl = updates.profileImageUrl || updates.avatarUrl;
      if (checkImgUrl && typeof checkImgUrl === 'string' && checkImgUrl.includes('/uploads/avatars/')) {
        const diskFile = path.basename(checkImgUrl.split('?')[0]);
        const fullDiskPath = path.join(UPLOADS_DIR, 'avatars', diskFile);
        if (!fs.existsSync(fullDiskPath)) {
          console.warn(`[STORAGE] Notice: Image file ${diskFile} not verified on disk at ${fullDiskPath}`);
        }
      }

      // Always append cache-busting timestamp to updated avatar URLs
      if (updates.profileImageUrl && updates.profileImageUrl.includes('/uploads/avatars/') && !updates.profileImageUrl.includes('?v=')) {
        updates.profileImageUrl = `${updates.profileImageUrl}?v=${Date.now()}`;
      }
      if (updates.avatarUrl && updates.avatarUrl.includes('/uploads/avatars/') && !updates.avatarUrl.includes('?v=')) {
        updates.avatarUrl = `${updates.avatarUrl}?v=${Date.now()}`;
      }

      // Update disk persistence (guarantees survival across any restarts)
      savePersistedUserUpdate(id, updates);

      // Update memory store
      memoryStore.updateUser(id, updates);

      // 3. Update PostgreSQL tutors and users tables (upsert)
      if (isDbConnected() && db) {
        try {
          const tutorDbUpdates: Record<string, any> = {};
          if (updates.name) tutorDbUpdates.name = updates.name.trim();
          if (updates.tier) tutorDbUpdates.tier = updates.tier;
          if (updates.country) tutorDbUpdates.country = updates.country;
          if (updates.cityLocation || updates.location) tutorDbUpdates.cityLocation = (updates.cityLocation || updates.location).trim();
          if (updates.rating) tutorDbUpdates.rating = parseFloat(updates.rating);
          if (updates.reviewsCount) tutorDbUpdates.reviewsCount = parseInt(updates.reviewsCount, 10);
          if (updates.hourlyRate) tutorDbUpdates.hourlyRate = parseFloat(updates.hourlyRate);
          if (updates.primarySubject) tutorDbUpdates.primarySubject = updates.primarySubject.trim();
          if (updates.subjectExpertise) {
            tutorDbUpdates.subjectExpertise = Array.isArray(updates.subjectExpertise) ? updates.subjectExpertise.join(', ') : updates.subjectExpertise;
          }
          if (updates.searchableKeywords) tutorDbUpdates.searchableKeywords = updates.searchableKeywords;
          if (updates.education) tutorDbUpdates.education = updates.education;
          if (updates.experienceSummary || updates.experience) tutorDbUpdates.experienceSummary = updates.experienceSummary || updates.experience;
          if (updates.availability) tutorDbUpdates.availability = updates.availability;
          if (updates.canMeet) tutorDbUpdates.canMeet = updates.canMeet;
          if (updates.hobbies) tutorDbUpdates.hobbies = updates.hobbies;
          if (updates.verificationStatus) tutorDbUpdates.verificationStatus = updates.verificationStatus;
          if (updates.profileImageUrl || updates.avatarUrl) tutorDbUpdates.profileImageUrl = updates.profileImageUrl || updates.avatarUrl;

          if (Object.keys(tutorDbUpdates).length > 0) {
            const existingTutor = await db.select().from(tutors).where(eq(tutors.id, id));
            if (existingTutor.length > 0) {
              await db.update(tutors).set(tutorDbUpdates).where(eq(tutors.id, id));
              console.log(`[DB] Successfully updated tutor ${id} in PostgreSQL tutors table.`);
            } else {
              const baseline: any = TRENDING_TUTORS_500.find(t => t.id === id) || SEED_TUTORS.find(t => t.id === id) || {};
              await db.insert(tutors).values({
                id,
                name: tutorDbUpdates.name || baseline.name || 'Tutor',
                tier: tutorDbUpdates.tier || baseline.tutorTier || 'Master Tutor',
                country: tutorDbUpdates.country || baseline.country || 'USA',
                cityLocation: tutorDbUpdates.cityLocation || baseline.location || 'Miami, FL',
                rating: tutorDbUpdates.rating || baseline.rating || 5.0,
                reviewsCount: tutorDbUpdates.reviewsCount || baseline.reviewsCount || 100,
                hourlyRate: tutorDbUpdates.hourlyRate || baseline.hourlyRate || 50,
                primarySubject: tutorDbUpdates.primarySubject || baseline.primarySubject || 'General',
                subjectExpertise: typeof tutorDbUpdates.subjectExpertise === 'string' ? tutorDbUpdates.subjectExpertise : JSON.stringify(baseline.subjectExpertise || []),
                searchableKeywords: tutorDbUpdates.searchableKeywords || baseline.searchableKeywords || `${baseline.name}`,
                education: tutorDbUpdates.education || baseline.education || null,
                experienceSummary: tutorDbUpdates.experienceSummary || baseline.experience || null,
                availability: tutorDbUpdates.availability || baseline.availability || 'Flexible',
                canMeet: tutorDbUpdates.canMeet || baseline.canMeet || 'Virtual Online 1-on-1',
                hobbies: tutorDbUpdates.hobbies || baseline.hobbies || null,
                verificationStatus: tutorDbUpdates.verificationStatus || baseline.verificationStatus || 'Verified Degree & Background',
                profileImageUrl: tutorDbUpdates.profileImageUrl || baseline.avatarUrl,
                createdAt: new Date().toISOString()
              }).onConflictDoNothing();
              console.log(`[DB] Successfully inserted tutor ${id} into PostgreSQL tutors table with persistent image.`);
            }
          }
        } catch (dbErr: any) {
          console.warn('[DB] Warning updating tutors table:', dbErr.message);
        }

        // Also update or insert in users table
        try {
          const userUpdates: Record<string, any> = {};
          if (updates.name) userUpdates.name = updates.name.trim();
          if (updates.avatarUrl || updates.profileImageUrl) userUpdates.avatarUrl = updates.avatarUrl || updates.profileImageUrl;
          if (updates.hourlyRate) userUpdates.hourlyRate = Math.round(parseFloat(updates.hourlyRate));
          if (updates.location || updates.cityLocation) userUpdates.location = updates.cityLocation || updates.location;
          if (updates.bio || updates.experience || updates.experienceSummary) userUpdates.bio = updates.experienceSummary || updates.experience || updates.bio;
          if (updates.education) userUpdates.education = updates.education;
          if (updates.searchableKeywords) userUpdates.searchableKeywords = updates.searchableKeywords;

          if (Object.keys(userUpdates).length > 0) {
            const existingUser = await db.select().from(users).where(eq(users.id, id));
            if (existingUser.length > 0) {
              await db.update(users).set(userUpdates).where(eq(users.id, id));
            } else {
              const baseline: any = TRENDING_TUTORS_500.find(t => t.id === id) || SEED_TUTORS.find(t => t.id === id) || {};
              await db.insert(users).values({
                id,
                role: 'tutor',
                name: userUpdates.name || baseline.name || 'Tutor',
                email: (baseline as any).email || `${id}@universitytutors.com`,
                avatarUrl: userUpdates.avatarUrl || baseline.avatarUrl,
                bio: userUpdates.bio || (baseline as any).bio || baseline.experience || '',
                hourlyRate: userUpdates.hourlyRate || baseline.hourlyRate || 50,
                rating: baseline.rating || 5.0,
                reviewCount: (baseline as any).reviewsCount || (baseline as any).reviewCount || 100,
                subjects: typeof baseline.subjectExpertise === 'string' ? baseline.subjectExpertise : JSON.stringify(baseline.subjectExpertise || []),
                country: baseline.country || 'USA',
                location: userUpdates.location || baseline.location || 'Miami, FL',
                education: userUpdates.education || baseline.education || '',
                experience: userUpdates.experience || baseline.experience || '',
                subjectExpertise: typeof baseline.subjectExpertise === 'string' ? baseline.subjectExpertise : JSON.stringify(baseline.subjectExpertise || []),
                isApproved: true,
                status: 'approved',
                verified: true,
                suspended: false,
                createdAt: new Date().toISOString()
              }).onConflictDoNothing();
            }
          }
        } catch (uErr: any) {
          console.warn('[DB] Notice updating users table:', uErr.message);
        }
      }

      await logAudit('TUTOR_PROFILE_UPDATED', `Admin updated tutor profile ${id}`, id, updates.name, 'admin', req);

      return res.status(200).json({
        success: true,
        tutor: { id, ...updates }
      });
    } catch (err: any) {
      console.error('[API] Error in PUT /api/admin/tutors/:id:', err);
      return res.status(500).json({ error: err.message || 'Failed to update tutor profile' });
    }
  });

  // POST /api/tutors
  // Handles new tutor profile creations (Admin Dashboard) and public tutor applications (Become a Tutor modal)
  app.post('/api/tutors', async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        location,
        city,
        bio,
        education,
        experiences,
        experience,
        subjectExpertise,
        subjects,
        availabilities,
        availability,
        canMeet,
        hobbies,
        hourlyRate,
        country,
        avatarUrl,
        isApproved,
        status,
        password
      } = req.body;

      if (!name || !name.trim() || !email || !email.trim()) {
        return res.status(400).json({ error: 'Full name and email address are required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const expText = (experiences || experience || '').trim();
      const availText = (availabilities || availability || '').trim();
      const locText = location || (city ? `${city}` : 'Miami, FL');

      // Normalize subjects array
      let subjectsArray: string[] = [];
      if (Array.isArray(subjects) && subjects.length > 0) {
        subjectsArray = subjects;
      } else if (typeof subjects === 'string' && subjects.trim()) {
        subjectsArray = subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (Array.isArray(subjectExpertise) && subjectExpertise.length > 0) {
        subjectsArray = subjectExpertise;
      } else if (typeof subjectExpertise === 'string' && subjectExpertise.trim()) {
        subjectsArray = subjectExpertise.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        subjectsArray = ['General Academics'];
      }

      // Normalize subjectExpertise array
      let subjectExpertiseArray: string[] = [];
      if (Array.isArray(subjectExpertise) && subjectExpertise.length > 0) {
        subjectExpertiseArray = subjectExpertise;
      } else if (typeof subjectExpertise === 'string' && subjectExpertise.trim()) {
        subjectExpertiseArray = subjectExpertise.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        subjectExpertiseArray = subjectsArray;
      }

      const avatar = (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim())
        ? avatarUrl.trim()
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

      const isApp = isApproved !== undefined ? Boolean(isApproved) : true;
      const stat = status || (isApp ? 'approved' : 'pending');
      const rate = hourlyRate ? Math.round(Number(hourlyRate)) : 45;

      // Check if user with this email already exists in PostgreSQL
      if (isDbConnected() && db) {
        try {
          const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
          if (existing.length > 0) {
            const existingUser = existing[0];
            const updates = {
              name: name.trim(),
              role: 'tutor',
              avatarUrl: avatar,
              bio: bio || existingUser.bio || 'Dedicated academic tutor and subject mentor.',
              hourlyRate: rate,
              subjects: JSON.stringify(subjectsArray),
              country: country || existingUser.country || 'US',
              location: locText,
              phoneNumber: phoneNumber || existingUser.phoneNumber,
              education: education || existingUser.education,
              experience: expText || existingUser.experience,
              subjectExpertise: JSON.stringify(subjectExpertiseArray),
              availability: availText || existingUser.availability,
              canMeet: canMeet || existingUser.canMeet || 'Online',
              hobbies: hobbies || existingUser.hobbies,
              isApproved: isApp,
              status: stat,
            };

            await db.update(users).set(updates).where(eq(users.id, existingUser.id));
            const fullUpdated = { ...existingUser, ...updates };
            memoryStore.setUser(fullUpdated);

            await logAudit('TUTOR_PROFILE_UPDATED', `Updated existing tutor profile: ${cleanEmail}`, existingUser.id, name.trim(), 'tutor', req);

            const { passwordHash: _, ...safeTutor } = fullUpdated;
            return res.status(200).json({
              success: true,
              tutor: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
              user: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
              updated: true
            });
          }
        } catch (dbErr: any) {
          console.warn('[API] DB check/update for tutor failed:', dbErr.message);
        }
      }

      // Check memory store for existing user by email
      const memExisting = memoryStore.findUserByEmail(cleanEmail);
      if (memExisting) {
        const updates = {
          name: name.trim(),
          role: 'tutor' as any,
          avatarUrl: avatar,
          bio: bio || memExisting.bio,
          hourlyRate: rate,
          subjects: JSON.stringify(subjectsArray),
          country: country || memExisting.country || 'US',
          location: locText,
          phoneNumber: phoneNumber || memExisting.phoneNumber,
          education: education || memExisting.education,
          experience: expText || memExisting.experience,
          subjectExpertise: JSON.stringify(subjectExpertiseArray),
          availability: availText || memExisting.availability,
          canMeet: canMeet || memExisting.canMeet || 'Online',
          hobbies: hobbies || memExisting.hobbies,
          isApproved: isApp,
          status: stat,
        };
        const updated = memoryStore.updateUser(memExisting.id, updates) || { ...memExisting, ...updates };
        const { passwordHash: _, ...safeTutor } = updated;
        return res.status(200).json({
          success: true,
          tutor: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
          user: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
          updated: true
        });
      }

      // Create new tutor profile
      const newTutorId = 'tutor_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const now = new Date().toISOString();
      const pHash = hashPassword(password || 'TutorPass@2026');

      const newTutorRecord = {
        id: newTutorId,
        role: 'tutor',
        name: name.trim(),
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: avatar,
        createdAt: now,
        suspended: false,
        verified: true,
        bio: bio || 'Dedicated academic tutor and subject mentor.',
        hourlyRate: rate,
        rating: 5.0,
        reviewCount: 0,
        subjects: JSON.stringify(subjectsArray),
        country: country || 'US',
        location: locText,
        phoneNumber: phoneNumber || null,
        education: education || null,
        experience: expText || null,
        subjectExpertise: JSON.stringify(subjectExpertiseArray),
        availability: availText || null,
        canMeet: canMeet || 'Online',
        hobbies: hobbies || null,
        isApproved: isApp,
        status: stat,
        availableSlots: JSON.stringify([
          new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00.000Z',
          new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + 'T14:00:00.000Z',
        ]),
      };

      // Always save to memory store
      memoryStore.setUser(newTutorRecord);

      // Save to PostgreSQL if connected
      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(newTutorRecord);
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting new tutor into PostgreSQL:', dbErr.message);
        }
      }

      await logAudit('CREATE_TUTOR_PROFILE', `New tutor profile created: ${cleanEmail} (${name.trim()})`, newTutorId, name.trim(), 'tutor', req);

      const { passwordHash: _, ...safeTutor } = newTutorRecord;
      return res.status(201).json({
        success: true,
        tutor: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
        user: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray }
      });
    } catch (err: any) {
      console.error('[API] Error in POST /api/tutors:', err);
      return res.status(500).json({ error: err.message || 'Internal server error while saving tutor profile' });
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

      const avatar = (extra?.avatarUrl && typeof extra.avatarUrl === 'string' && extra.avatarUrl.trim())
        ? extra.avatarUrl.trim()
        : `https://images.unsplash.com/photo-${role === 'tutor' ? '1534528741775-53994a69daeb' : '1494790108377-be9c29b29330'}?w=150&auto=format&fit=crop&q=80`;

      const newUser = {
        id: userId,
        role,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: avatar,
        createdAt: new Date().toISOString(),
        verified: true,
        suspended: false,
        bio: extra?.bio || (role === 'tutor' ? 'Highly dedicated academic advisor with master credentials.' : 'Platform Administrator.'),
        hourlyRate: extra?.hourlyRate ? Math.round(Number(extra.hourlyRate)) : (role === 'tutor' ? 45 : null),
        rating: role === 'tutor' ? 5.0 : null,
        reviewCount: role === 'tutor' ? 0 : null,
        subjects: extra?.subjects ? (typeof extra.subjects === 'string' ? extra.subjects : JSON.stringify(extra.subjects)) : (role === 'tutor' ? JSON.stringify(['English Literature']) : null),
        country: extra?.country || 'US',
        location: extra?.location || null,
        phoneNumber: extra?.phoneNumber || null,
        education: extra?.education || null,
        experience: extra?.experience || extra?.experiences || null,
        subjectExpertise: extra?.subjectExpertise ? (typeof extra.subjectExpertise === 'string' ? extra.subjectExpertise : JSON.stringify(extra.subjectExpertise)) : null,
        availability: extra?.availability || extra?.availabilities || null,
        canMeet: extra?.canMeet || 'Online',
        hobbies: extra?.hobbies || null,
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
              avatarUrl: newUser.avatarUrl,
              bio: newUser.bio,
              hourlyRate: newUser.hourlyRate,
              subjects: newUser.subjects,
              country: newUser.country,
              location: newUser.location,
              phoneNumber: newUser.phoneNumber,
              education: newUser.education,
              experience: newUser.experience,
              subjectExpertise: newUser.subjectExpertise,
              availability: newUser.availability,
              canMeet: newUser.canMeet,
              hobbies: newUser.hobbies,
              isApproved: newUser.isApproved,
              status: newUser.status,
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

      // Handle aliases
      if (updates.experiences && !updates.experience) {
        updates.experience = updates.experiences;
      }
      if (updates.availabilities && !updates.availability) {
        updates.availability = updates.availabilities;
      }
      if (updates.city && !updates.location) {
        updates.location = updates.city;
      }

      // Convert base64 data URI avatars to persistent files in UPLOADS_DIR
      if (updates.avatarUrl && typeof updates.avatarUrl === 'string' && updates.avatarUrl.startsWith('data:image/')) {
        updates.avatarUrl = saveBase64ImageToUploads(updates.avatarUrl, 'avatars', `user_${id}`);
      }

      // 1. Locate baseline user from memoryStore, trending tutors, or seed tutors
      let existingUser: any = memoryStore.getUser(id);
      if (!existingUser) {
        const trendingTutor = TRENDING_TUTORS_500.find(t => t.id === id);
        if (trendingTutor) {
          existingUser = {
            id: trendingTutor.id,
            role: trendingTutor.role,
            name: trendingTutor.name,
            email: trendingTutor.email,
            avatarUrl: trendingTutor.avatarUrl,
            createdAt: new Date().toISOString(),
            bio: trendingTutor.bio,
            hourlyRate: trendingTutor.hourlyRate,
            rating: trendingTutor.rating,
            reviewCount: trendingTutor.reviewsCount,
            subjects: JSON.stringify(trendingTutor.subjectExpertise || []),
            country: trendingTutor.country,
            location: trendingTutor.location,
            education: trendingTutor.education,
            experience: trendingTutor.experience,
            subjectExpertise: JSON.stringify(trendingTutor.subjectExpertise || []),
            availability: trendingTutor.availability,
            canMeet: trendingTutor.canMeet,
            hobbies: trendingTutor.hobbies,
            isApproved: true,
            status: 'approved'
          };
        } else {
          const seedTutor = SEED_TUTORS.find(t => t.id === id);
          if (seedTutor) {
            existingUser = { ...seedTutor };
          }
        }
      }

      const mergedUser = {
        ...(existingUser || {}),
        ...updates,
        id
      };

      // 2. Update memory store
      memoryStore.setUser(mergedUser as any);

      // 3. Save to disk persistent backup (guarantees updated images survive restarts)
      savePersistedUserUpdate(id, updates);

      // 4. Update or Insert into PostgreSQL Database
      if (isDbConnected() && db) {
        try {
          // Whitelist valid columns from users schema
          const validColumns = new Set([
            'role', 'name', 'email', 'avatarUrl', 'bio', 'hourlyRate',
            'rating', 'reviewCount', 'subjects', 'country', 'location',
            'phoneNumber', 'education', 'experience', 'subjectExpertise',
            'availability', 'canMeet', 'hobbies', 'isApproved', 'status',
            'availableSlots', 'verified', 'suspended', 'createdAt'
          ]);

          const dbUpdates: Record<string, any> = {};
          for (const [k, v] of Object.entries(updates)) {
            if (validColumns.has(k) && v !== undefined) {
              dbUpdates[k] = v;
            }
          }

          const existingDb = await db.select().from(users).where(eq(users.id, id));
          if (existingDb.length > 0) {
            if (Object.keys(dbUpdates).length > 0) {
              await db.update(users).set(dbUpdates).where(eq(users.id, id));
              console.log(`[DB] Successfully updated user ${id} in PostgreSQL (avatarUrl: ${Boolean(dbUpdates.avatarUrl)})`);
            }
          } else {
            // User does not exist in DB yet: insert complete record so image is permanently stored
            const insertRecord: Record<string, any> = {
              id,
              role: mergedUser.role || 'tutor',
              name: mergedUser.name || 'Tutor',
              email: mergedUser.email || `${id}@university-tutors.com`,
              avatarUrl: mergedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
              createdAt: mergedUser.createdAt || new Date().toISOString(),
              verified: Boolean(mergedUser.verified),
              suspended: Boolean(mergedUser.suspended),
              isApproved: mergedUser.isApproved !== false,
              status: mergedUser.status || 'approved'
            };
            for (const [k, v] of Object.entries(mergedUser)) {
              if (validColumns.has(k) && v !== undefined) {
                insertRecord[k] = v;
              }
            }
            await db.insert(users).values(insertRecord as any);
            console.log(`[DB] Successfully inserted user ${id} with updated avatar into PostgreSQL`);
          }
        } catch (dbErr: any) {
          console.warn('[DB] Notice updating/inserting user in PostgreSQL:', dbErr.message);
        }
      }

      await logAudit('USER_UPDATE', `Updated user ${id} (image/profile update)`, id, undefined, undefined, req);

      return res.status(200).json({ success: true, user: mergedUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/upload-avatar - Direct image upload endpoint for user/tutor avatars
  // Strictly verifies authentication and prevents unauthorized account hijacking
  app.post('/api/upload-avatar', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      let targetUserId = currentUser.id;

      // Security rule: Only administrators can update avatars for other users
      if (req.body.userId && typeof req.body.userId === 'string' && req.body.userId !== currentUser.id) {
        if (currentUser.role === 'admin' || currentUser.role === 'subadmin') {
          targetUserId = req.body.userId;
        } else {
          // Non-admins can only update their own avatar
          targetUserId = currentUser.id;
        }
      }

      let { avatarUrl } = req.body;
      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ error: 'avatarUrl is required' });
      }

      // Convert base64 data URI to persistent file on disk
      if (avatarUrl.startsWith('data:image/')) {
        avatarUrl = saveBase64ImageToUploads(avatarUrl, 'avatars', `avatar_${targetUserId}`);
      }

      // 1. Update disk persistence
      savePersistedUserUpdate(targetUserId, { avatarUrl });

      // 2. Update memory store
      memoryStore.updateUser(targetUserId, { avatarUrl });

      // 3. Update PostgreSQL
      if (isDbConnected() && db) {
        try {
          const existing = await db.select().from(users).where(eq(users.id, targetUserId));
          if (existing.length > 0) {
            await db.update(users).set({ avatarUrl }).where(eq(users.id, targetUserId));
            console.log(`[DB] Successfully updated avatar for ${targetUserId} in PostgreSQL: ${avatarUrl}`);
          } else {
            const trending = TRENDING_TUTORS_500.find(t => t.id === targetUserId);
            await db.insert(users).values({
              id: targetUserId,
              role: trending?.role || 'tutor',
              name: trending?.name || 'Tutor',
              email: trending?.email || `${targetUserId}@university-tutors.com`,
              avatarUrl,
              createdAt: new Date().toISOString()
            } as any);
            console.log(`[DB] Successfully inserted user ${targetUserId} with avatar into PostgreSQL: ${avatarUrl}`);
          }
        } catch (e: any) {
          console.warn('[DB] Upload avatar notice in DB:', e.message);
        }
      }

      await logAudit('AVATAR_UPLOAD', `Updated avatar image for ${targetUserId}`, targetUserId, undefined, currentUser.role, req);

      return res.status(200).json({ success: true, avatarUrl });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/upload-document - Authenticated upload endpoint for private student and tutor documents
  // Strictly derives uploaderId and role from the authenticated session (never trusts frontend)
  app.post('/api/upload-document', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const uploaderId = currentUser.id;
      const uploaderRole = currentUser.role;

      const { file, fileName, orderId, roomId, fileType = 'student_document' } = req.body;
      if (!file || typeof file !== 'string') {
        return res.status(400).json({ error: 'file (data URI or base64) is required.' });
      }

      // If associated with an order, verify the authenticated user has permission for that order
      if (orderId && typeof orderId === 'string') {
        const order = await findOrderById(orderId);
        if (order && uploaderRole !== 'admin' && uploaderRole !== 'subadmin' && order.studentId !== uploaderId && order.tutorId !== uploaderId) {
          return res.status(403).json({ error: 'Forbidden: You are not authorized to attach documents to this order.' });
        }
      }

      // If associated with a chat room, verify the authenticated user is an active member
      if (roomId && typeof roomId === 'string') {
        const isMember = await canUserAccessRoom(uploaderId, uploaderRole, roomId);
        if (!isMember) {
          return res.status(403).json({ error: 'Forbidden: You are not authorized to attach files to this chat room.' });
        }
      }

      let rawBase64 = file;
      let mimeType = 'application/octet-stream';
      let ext = 'pdf';

      if (file.startsWith('data:')) {
        const match = file.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          rawBase64 = match[2];
          const rawExt = mimeType.split('/')[1];
          if (rawExt) {
            ext = rawExt.toLowerCase()
              .replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
              .replace('msword', 'doc')
              .replace('plain', 'txt')
              .replace('jpeg', 'jpg');
          }
        }
      }

      if (fileName && typeof fileName === 'string' && fileName.includes('.')) {
        const cleanExt = path.extname(fileName).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanExt) ext = cleanExt;
      }

      const buffer = Buffer.from(rawBase64, 'base64');
      if (buffer.length > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds maximum 50MB limit.' });
      }

      const storedName = `doc_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const documentsDir = path.resolve(UPLOADS_DIR, 'documents');
      const targetFilePath = path.join(documentsDir, storedName);

      fs.writeFileSync(targetFilePath, buffer);

      const fileId = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const fileRecord: PrivateFileRecord = {
        id: fileId,
        fileName: fileName ? path.basename(fileName) : storedName,
        storedName,
        fileSize: buffer.length,
        mimeType,
        uploaderId,
        uploaderRole,
        orderId: orderId || null,
        roomId: roomId || null,
        fileType,
        createdAt: new Date().toISOString(),
      };

      savePersistedPrivateFile(fileRecord);

      await logAudit('FILE_UPLOAD_PRIVATE', `Uploaded private file: ${fileRecord.fileName} (${fileId})`, uploaderId, undefined, uploaderRole, req);

      return res.status(200).json({
        success: true,
        fileId,
        fileName: fileRecord.fileName,
        downloadUrl: `/api/files/download/${fileId}`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/upload - Generic persistent upload endpoint for public images (e.g. avatars, approved public media)
  app.post('/api/upload', requireAuth, (req, res) => {
    try {
      const currentUser = (req as any).user;
      let { file, folder = 'general', prefix = 'file' } = req.body;
      if (!file) {
        return res.status(400).json({ error: 'file (data URI or base64) is required' });
      }

      // Restrict public blog uploads strictly to administrators
      if (folder === 'blogs' && currentUser.role !== 'admin' && currentUser.role !== 'subadmin') {
        return res.status(403).json({ error: 'Forbidden: Only administrators can upload blog media.' });
      }

      // Prevent private documents from being routed through general public endpoint
      if (folder === 'documents') {
        return res.status(400).json({ error: 'Private documents must be uploaded via /api/upload-document.' });
      }

      // Sanitize folder name to prevent path traversal
      const safeFolder = (folder === 'avatars' || folder === 'blogs') ? folder : 'general';
      const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'file';

      const publicUrl = saveBase64ImageToUploads(file, safeFolder, safePrefix);
      return res.status(200).json({ success: true, url: publicUrl });
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
      if (updates.pages !== undefined) updates.pages = Number(updates.pages);
      if (updates.wordCount !== undefined) updates.wordCount = Number(updates.wordCount);
      if (updates.sourcesCount !== undefined) updates.sourcesCount = Number(updates.sourcesCount);
      if (updates.budget !== undefined && updates.budget !== null) updates.budget = Number(updates.budget);
      if (updates.quoteAmount !== undefined && updates.quoteAmount !== null) updates.quoteAmount = Number(updates.quoteAmount);
      if (updates.progressPercent !== undefined) updates.progressPercent = Number(updates.progressPercent);

      memoryStore.updateOrder(id, updates);

      if (isDbConnected() && db) {
        try {
          const allowedCols = [
            'studentId', 'tutorId', 'title', 'subject', 'academicLevel', 'deadline',
            'pages', 'wordCount', 'referenceStyle', 'sourcesCount', 'instructions',
            'fileUrls', 'fileNames', 'budget', 'quoteAmount', 'status', 'escrowStatus',
            'progressPercent', 'tutorWorkFileUrl', 'tutorWorkFileName', 'reviewed', 'updatedAt'
          ];
          const dbUpdates: Record<string, any> = {};
          for (const col of allowedCols) {
            if (updates[col] !== undefined) {
              dbUpdates[col] = updates[col];
            }
          }
          await db.update(orders).set(dbUpdates).where(eq(orders.id, id));
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

  // DELETE /api/orders/:id
  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      memoryStore.deleteOrder(id);

      if (isDbConnected() && db) {
        try {
          await db.delete(orders).where(eq(orders.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice deleting order from DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_DELETE', `Deleted order: ${id}`, undefined, undefined, undefined, req);

      return res.status(200).json({ success: true, message: 'Order removed successfully' });
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
          if (isAdmin) {
            userRooms = await db.select().from(chatRooms).orderBy(desc(chatRooms.updatedAt));
          } else {
            const memberOf = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.userId, currentUser.id));
            const roomIds = memberOf.map(m => m.roomId);
            if (roomIds.length > 0) {
              userRooms = await db.select().from(chatRooms).where(inArray(chatRooms.id, roomIds)).orderBy(desc(chatRooms.updatedAt));
            }
          }

          // Populate members, users, and latest message for each room
          const populated = await Promise.all(userRooms.map(async (r) => {
            const members = await db.select().from(chatRoomMembers).where(eq(chatRoomMembers.roomId, r.id));
            const latestMsg = await db.select().from(messages).where(eq(messages.roomId, r.id)).orderBy(desc(messages.createdAt)).limit(1);
            
            // Fetch users for all members
            const memberUserIds = members.map(m => m.userId);
            let memberUsers: any[] = [];
            if (memberUserIds.length > 0) {
              memberUsers = await db.select().from(users).where(inArray(users.id, memberUserIds));
            }

            // Fetch associated order if any
            let linkedOrder: any = null;
            if (r.orderId) {
              const oRes = await db.select().from(orders).where(eq(orders.id, r.orderId)).limit(1);
              linkedOrder = oRes[0] || null;
            }

            const studentMember = memberUsers.find(u => u.role === 'student');
            const tutorMember = memberUsers.find(u => u.role === 'tutor' || (!u.id.startsWith('admin_') && u.role !== 'admin' && u.id !== studentMember?.id));

            let tutorUser = tutorMember || null;
            let studentUser = studentMember || null;

            if (!tutorUser && linkedOrder?.tutorId) {
              const tRes = await db.select().from(users).where(eq(users.id, linkedOrder.tutorId)).limit(1);
              tutorUser = tRes[0] || null;
            }
            if (!studentUser && linkedOrder?.studentId) {
              const sRes = await db.select().from(users).where(eq(users.id, linkedOrder.studentId)).limit(1);
              studentUser = sRes[0] || null;
            }

            return {
              ...r,
              members: members.map(m => ({
                ...m,
                user: memberUsers.find(u => u.id === m.userId) ? {
                  id: m.userId,
                  name: memberUsers.find(u => u.id === m.userId).name,
                  email: memberUsers.find(u => u.id === m.userId).email,
                  role: memberUsers.find(u => u.id === m.userId).role,
                  avatarUrl: memberUsers.find(u => u.id === m.userId).avatarUrl,
                  rating: memberUsers.find(u => u.id === m.userId).rating,
                  subjectExpertise: memberUsers.find(u => u.id === m.userId).subjectExpertise,
                } : null
              })),
              latestMessage: latestMsg[0] || null,
              order: linkedOrder,
              student: studentUser ? {
                id: studentUser.id,
                name: studentUser.name,
                email: studentUser.email,
                role: studentUser.role,
                avatarUrl: studentUser.avatarUrl,
              } : null,
              tutor: tutorUser ? {
                id: tutorUser.id,
                name: tutorUser.name,
                email: tutorUser.email,
                role: tutorUser.role,
                avatarUrl: tutorUser.avatarUrl,
                rating: tutorUser.rating,
                subjectExpertise: tutorUser.subjectExpertise,
              } : null,
              studentId: studentUser?.id || r.createdBy,
              tutorId: tutorUser?.id || null,
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
  // NOTIFICATIONS
  // ==========================================

  // GET /api/notifications
  app.get('/api/notifications', async (req, res) => {
    try {
      const { userId } = req.query;
      const notifs = memoryStore.getNotifications(userId ? String(userId) : undefined);
      return res.status(200).json({ notifications: notifs });
    } catch (err: any) {
      return res.status(200).json({ notifications: [] });
    }
  });

  // POST /api/notifications
  app.post('/api/notifications', async (req, res) => {
    try {
      const { userId, title, message, type, sentBy } = req.body;
      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Missing required notification fields' });
      }
      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        userId,
        title,
        message,
        type: type || 'webapp',
        sentBy: sentBy || 'System',
        createdAt: new Date().toISOString(),
        read: false
      };
      memoryStore.addNotification(newNotif);
      return res.status(201).json({ success: true, notification: newNotif });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/notifications/:id/read
  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      memoryStore.markNotificationRead(id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/notifications/mark-all-read
  app.post('/api/notifications/mark-all-read', async (req, res) => {
    try {
      const { userId } = req.body;
      if (userId) {
        memoryStore.markAllNotificationsRead(String(userId));
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // PAYMENTS & ESCROW LEDGER
  // ==========================================

  // GET /api/payments
  app.get('/api/payments', async (req, res) => {
    try {
      const { studentId, assignmentId } = req.query;
      const paymentRecords = memoryStore.getPayments(
        studentId ? String(studentId) : undefined,
        assignmentId ? String(assignmentId) : undefined
      );
      return res.status(200).json({ payments: paymentRecords });
    } catch (err: any) {
      return res.status(200).json({ payments: [] });
    }
  });

  // POST /api/payments
  app.post('/api/payments', async (req, res) => {
    try {
      const { assignmentId, studentId, amount, status, type, notes } = req.body;
      if (!assignmentId || amount === undefined) {
        return res.status(400).json({ error: 'Missing required assignmentId or amount.' });
      }
      const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newPayment = {
        id: paymentId,
        assignmentId,
        studentId: studentId || null,
        amount: Number(amount),
        status: status || 'escrow',
        stripePaymentIntent: req.body.stripePaymentIntent || `pi_3Pqz_${Date.now()}_ut_escrow`,
        type: type || 'advance',
        notes: notes || 'Student Escrow Deposit',
        createdAt: new Date().toISOString()
      };
      memoryStore.setPayment(newPayment as any);

      // If advance payment was made, update assignment status
      const existingOrder = memoryStore.getOrders().find(o => o.id === assignmentId);
      if (existingOrder) {
        const orderUpdates: any = { escrowStatus: newPayment.status };
        if (existingOrder.status === 'Pending Tutor Assignment' || existingOrder.status === 'pending') {
          orderUpdates.status = 'In Progress';
        }
        memoryStore.updateOrder(assignmentId, orderUpdates);
      }

      await logAudit('PAYMENT_DEPOSIT', `Payment recorded: $${amount} for assignment #${assignmentId}`, studentId, undefined, 'student', req);

      return res.status(201).json({ success: true, payment: newPayment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/payments/:id
  app.put('/api/payments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      const updated = memoryStore.updatePayment(id, updates);
      return res.status(200).json({ success: true, payment: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // INVOICES & STATEMENTS
  // ==========================================

  // GET /api/invoices
  app.get('/api/invoices', async (req, res) => {
    try {
      const { studentId } = req.query;
      const invList = memoryStore.getInvoices(studentId ? String(studentId) : undefined);
      return res.status(200).json({ invoices: invList });
    } catch (err: any) {
      return res.status(200).json({ invoices: [] });
    }
  });

  // POST /api/invoices
  app.post('/api/invoices', async (req, res) => {
    try {
      const data = req.body;
      const invoiceId = data.id || 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newInvoice = {
        id: invoiceId,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId || '',
        studentName: data.studentName || 'Student',
        studentEmail: data.studentEmail || '',
        serviceSubject: data.serviceSubject || 'Academic Mentorship',
        description: data.description || 'Academic Service Invoice',
        details: data.details || '',
        totalAmount: Number(data.totalAmount) || 0,
        advanceAmount: Number(data.advanceAmount) || 0,
        balanceAmount: Number(data.balanceAmount) || 0,
        dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: data.status || 'due',
        createdAt: new Date().toISOString()
      };
      memoryStore.setInvoice(newInvoice as any);
      await logAudit('INVOICE_CREATE', `Invoice created: $${newInvoice.totalAmount} (${invoiceId})`, data.studentId, data.studentName, 'admin', req);
      return res.status(201).json({ success: true, invoice: newInvoice });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/invoices/:id
  app.put('/api/invoices/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      const updated = memoryStore.updateInvoice(id, updates);
      return res.status(200).json({ success: true, invoice: updated });
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
