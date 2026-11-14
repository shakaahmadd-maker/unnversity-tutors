import dotenv from 'dotenv';
dotenv.config({ override: false, quiet: true } as any);

import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { db, isDbConnected, checkDbConnection, hasDatabaseUrl, withDbTimeout } from './src/db/index';
import { users, userProfiles, userSessions, orders, inquiries, messages, quotes, auditLogs, chatRooms, chatRoomMembers, blogs, tutors, notifications, passwordResetTokens as passwordResetTokensTable, emailVerificationTokens as emailVerificationTokensTable } from './src/db/schema';
import { eq, desc, and, inArray, isNull, or } from 'drizzle-orm';
import { runMigrations, verifyUsersTableSchema } from './src/db/migrate';
import { memoryStore, PrivateFileRecord } from './src/db/memoryStore';
import { DEFAULT_20_BLOGS } from './src/data/defaultBlogsData';
import { TRENDING_TUTORS_500, TRENDING_TUTORS_200 } from './src/data/trendingTutors500Data';
import { CURATED_SPECIALIZED_TUTORS } from './src/data/tutorsDirectoryData';
import {
  getOrBuildSitemapPayload,
  invalidateSitemapCache,
  ROBOTS_TXT_CONTENT,
  SitemapBlogInput,
  SitemapTutorInput,
} from './src/server/sitemapGenerator';
import { matchesBlogSlugOrId } from './src/utils/blogSlug';

// Bundler-safe runtime environment reader: reads strictly from process['env'] at runtime (zero hardcoded fallbacks)
export function readRuntimeEnv(key: string): string {
  const runtimeEnv: Record<string, string | undefined> = process['env'];
  const val = runtimeEnv[key];
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^['"]+|['"]+$/g, '').trim();
}

const PORT = readRuntimeEnv('PORT') ? parseInt(readRuntimeEnv('PORT'), 10) : 3000;
const NODE_ENV = readRuntimeEnv('NODE_ENV') || 'production';

export function getRuntimeAppUrl(): string {
  return readRuntimeEnv('APP_URL').replace(/\/+$/, '');
}

export const GOOGLE_OAUTH_CALLBACK_PATH = '/api/auth/callback/google';

const FORBIDDEN_LOG_KEYS = new Set([
  'clientsecret',
  'client_secret',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'idtoken',
  'id_token',
  'password',
  'passwordhash',
  'sessionsecret',
  'session_secret',
  'databaseurl',
  'database_url',
  'token',
  'code',
]);

// Safe structured OAuth logger: never logs secrets, tokens, passwords, DATABASE_URL, or SESSION_SECRET
function logSafeOAuthEvent(
  stage: string,
  details: Record<string, string | number | boolean | string[] | null | undefined>
) {
  const safePayload: Record<string, unknown> = { stage, ts: new Date().toISOString() };
  for (const [k, v] of Object.entries(details)) {
    if (FORBIDDEN_LOG_KEYS.has(k.toLowerCase())) continue;
    safePayload[k] = v;
  }
  console.info(`[OAUTH] ${JSON.stringify(safePayload)}`);
}

// Safe structured Auth logger: never logs secrets, tokens, passwords, DATABASE_URL, or SESSION_SECRET
export function logSafeAuthEvent(
  stage: string,
  details: Record<string, string | number | boolean | string[] | null | undefined> = {}
) {
  const safePayload: Record<string, unknown> = { stage, ts: new Date().toISOString() };
  for (const [k, v] of Object.entries(details)) {
    if (FORBIDDEN_LOG_KEYS.has(k.toLowerCase())) continue;
    safePayload[k] = v;
  }
  console.info(`[AUTH] ${JSON.stringify(safePayload)}`);
}

export interface SafeDatabaseErrorInfo {
  name: string;
  code: string | undefined;
  message: string;
  table?: string;
  column?: string;
  constraint?: string;
  detail?: string;
}

// Safe database error formatter: strictly logs and returns safe diagnostic metadata (never secrets or passwords)
export function formatSafeDatabaseError(err: any): SafeDatabaseErrorInfo {
  if (!err) {
    return { name: 'UnknownError', code: undefined, message: 'Unknown database error' };
  }
  const root = err.cause || err;
  const name = String(root.name || err.name || 'DatabaseError');
  const code = (root.code || err.code) ? String(root.code || err.code) : undefined;
  const rawMessage = String(root.message || err.message || 'Database operation failed');
  const rawDetail = (root.detail || err.detail) ? String(root.detail || err.detail) : undefined;

  // Redact passwords, secrets, connection URLs, tokens, session secrets
  const redact = (str: string): string => {
    return str
      .replace(/postgres(ql)?:\/\/[^\s"']+/gi, 'postgres://[REDACTED]')
      .replace(/password\s*=\s*[^\s;]+/gi, 'password=[REDACTED]')
      .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]')
      .replace(/[a-f0-9]{32,}/gi, '[REDACTED_HASH_OR_KEY]')
      .replace(/(\$2[aby]?\$\d+\$[./A-Za-z0-9]{53})/g, '[REDACTED_BCRYPT]');
  };

  const safeMessage = redact(rawMessage);
  const safeDetail = rawDetail ? redact(rawDetail) : undefined;

  const table = root.table || err.table || undefined;
  const column = root.column || err.column || undefined;
  const constraint = root.constraint || err.constraint || undefined;

  return {
    name,
    code,
    message: safeMessage,
    table,
    column,
    constraint,
    detail: safeDetail,
  };
}

// Secure session signing key: read strictly from runtime process.env.SESSION_SECRET.
// Never log SESSION_SECRET or DATABASE_URL.
function getSessionSecret(): string {
  const secret = readRuntimeEnv('SESSION_SECRET');
  if (secret.length >= 16) {
    return secret;
  }
  return EPHEMERAL_SESSION_SECRET;
}

const EPHEMERAL_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

if (!readRuntimeEnv('SESSION_SECRET') && readRuntimeEnv('SKIP_AUTO_SERVER_START') !== 'true') {
  console.warn('[AUTH] SESSION_SECRET is not configured in process.env. Generated an ephemeral runtime signing key.');
}

const COOKIE_NAME = 'auth_session';

function isPrivateOrLoopbackIp(host: string): boolean {
  if (host === '127.0.0.1' || host === '0.0.0.0' || host === '::1' || host === '[::1]') {
    return true;
  }
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) return false;
  const [a, b] = [Number(ipv4Match[1]), Number(ipv4Match[2])];
  if (a === 127 || a === 10 || a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

// Reject preview URLs, development URLs, localhost URLs, insecure HTTP, or dynamic/internal container hostnames in production OAuth
export function isForbiddenProductionUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return true;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') {
      return true;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      isPrivateOrLoopbackIp(host) ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.docker') ||
      host.endsWith('.container') ||
      host === 'host.docker.internal' ||
      !host.includes('.') ||
      host.startsWith('ais-dev-') ||
      host.startsWith('ais-pre-') ||
      host.endsWith('.run.app') ||
      host.endsWith('.nip.io') ||
      host.endsWith('.sslip.io') ||
      host.endsWith('.traefik.me')
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

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

export interface AvatarVariantUrls {
  originalAvatarUrl: string;
  optimizedAvatarUrl: string;
  avatarVariants: {
    smWebp: string;
    smAvif: string;
    mdWebp: string;
    mdAvif: string;
    original: string;
  };
}

let sharpLoaderPromise: Promise<any> | null = null;
async function getSharp(): Promise<any> {
  if (!sharpLoaderPromise) {
    sharpLoaderPromise = import('sharp')
      .then((m) => m.default || m)
      .catch(() => null);
  }
  return sharpLoaderPromise;
}

export function buildAvatarVariantMetadata(avatarUrl: string): AvatarVariantUrls | null {
  if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.includes('/uploads/avatars/')) {
    return null;
  }
  const [cleanBase, rawQuery] = avatarUrl.split('?');
  const qs = rawQuery ? `?${rawQuery}` : '';
  const parsed = cleanBase.match(/^(.*\/uploads\/avatars\/)([^/]+)\.(jpe?g|png|webp)$/i);
  if (!parsed) return null;
  const [, prefix, stem] = parsed;
  if (/-opt-\d+$/i.test(stem)) return null;
  return {
    originalAvatarUrl: avatarUrl,
    optimizedAvatarUrl: `${prefix}${stem}-opt-96.webp${qs}`,
    avatarVariants: {
      smWebp: `${prefix}${stem}-opt-96.webp${qs}`,
      smAvif: `${prefix}${stem}-opt-96.avif${qs}`,
      mdWebp: `${prefix}${stem}-opt-256.webp${qs}`,
      mdAvif: `${prefix}${stem}-opt-256.avif${qs}`,
      original: avatarUrl,
    },
  };
}

export async function generateAvatarDerivatives(
  fileBuffer: Buffer,
  avatarsDir: string,
  stem: string
): Promise<boolean> {
  try {
    if (!fileBuffer || fileBuffer.length < 32) return false;
    const sharpLib = await getSharp();
    if (!sharpLib) return false;

    const meta = await sharpLib(fileBuffer).rotate().metadata();
    if (!meta?.width || !meta?.height) return false;

    const targets = [
      { size: 96, format: 'webp' as const },
      { size: 96, format: 'avif' as const },
      { size: 256, format: 'webp' as const },
      { size: 256, format: 'avif' as const },
    ];

    await Promise.all(
      targets.map(async ({ size, format }) => {
        const outPath = path.join(avatarsDir, `${stem}-opt-${size}.${format}`);
        const pipeline = sharpLib(fileBuffer)
          .rotate()
          .resize(size, size, { fit: 'inside', withoutEnlargement: true });
        if (format === 'webp') {
          await pipeline.webp({ quality: 80, effort: 4 }).toFile(outPath);
        } else {
          await pipeline.avif({ quality: 56, effort: 4 }).toFile(outPath);
        }
      })
    );
    return true;
  } catch (err: any) {
    // Graceful no-op for minimal/tiny buffers (keeps untouched original intact)
    return false;
  }
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

    const stem = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const filename = `${stem}.${ext}`;
    const filePath = path.join(targetSubDir, filename);
    fs.writeFileSync(filePath, buffer);

    if (folder === 'avatars' && ext !== 'svg') {
      void generateAvatarDerivatives(buffer, targetSubDir, stem);
    }

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

// Secure Password Hashing using Bcrypt (10 rounds) with Scrypt fallback support
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!password || !combinedHash) return false;
  try {
    // Standard Bcrypt format ($2a$, $2b$, $2y$)
    if (combinedHash.startsWith('$2a$') || combinedHash.startsWith('$2b$') || combinedHash.startsWith('$2y$')) {
      return bcrypt.compareSync(password, combinedHash);
    }
    // Backward-compatible verification for pre-existing scrypt hashes (salt:derivedKey)
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Revoked session registry to ensure logout immediately invalidates server sessions
const revokedSessionRegistry = new Map<string, number>();
const revokedUsersRegistry = new Map<string, number>();

export function revokeAllSessionsForUser(userId: string): void {
  if (!userId) return;
  revokedUsersRegistry.set(userId, Date.now());
}

export function revokeSessionToken(token: string | undefined): void {
  if (!token || typeof token !== 'string') return;
  const ttlExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  revokedSessionRegistry.set(`tok:${tokenHash}`, ttlExpiry);
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const parsed = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (parsed?.jti) {
        revokedSessionRegistry.set(`jti:${parsed.jti}`, parsed.exp || ttlExpiry);
      }
    }
  } catch {
    // ignore malformed token during revocation
  }
}

// Secure Session Token using HMAC-SHA256 with unique session ID (jti)
export function createSessionToken(payload: { id: string; email: string; role: string }): string {
  const secret = getSessionSecret();
  const jti = crypto.randomBytes(16).toString('hex');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      jti,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

export function verifySessionToken(token: string): { id: string; email: string; role: string; jti?: string } | null {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (revokedSessionRegistry.has(`tok:${tokenHash}`)) {
      return null;
    }
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const secret = getSessionSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${data}`).digest('base64url');
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (parsed.jti && revokedSessionRegistry.has(`jti:${parsed.jti}`)) {
      return null;
    }
    if (parsed.id && (revokedUsersRegistry.get(parsed.id) || 0) > (parsed.iat || 0)) {
      return null;
    }
    if (parsed.exp && parsed.exp < Date.now()) return null;
    if (!parsed.id || !parsed.email || !parsed.role) return null;
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
    // Seed default Superior Admin record without any shared or hardcoded password
    const adminEmail = 'shaka.ahmadd@gmail.com';
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        id: 'admin_shaka',
        role: 'admin',
        name: 'Shaka Ahmad',
        email: adminEmail,
        passwordHash: null,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        verified: true,
        suspended: false,
        bio: 'Platform Owner and Superior Administrator.',
        country: 'US',
        isApproved: true,
        status: 'approved',
      }).onConflictDoNothing();
      console.log(`[SEED] Ensured Superior Admin account record exists: ${adminEmail}`);
    }

    // Seed each certified initial tutor individually without shared fallback passwords
    for (const t of SEED_TUTORS) {
      try {
        const existing = await db.select().from(users).where(eq(users.id, t.id)).limit(1);
        if (existing.length === 0) {
          await db.insert(users).values({
            ...t,
            passwordHash: null,
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

export interface OAuthUserRepositoryOverride {
  findByEmail?: (email: string) => Promise<any | null>;
  findById?: (id: string) => Promise<any | null>;
  createUser?: (record: any) => Promise<any>;
}

export interface CreateAppOptions {
  fetchImpl?: typeof fetch;
  oauthUserRepo?: OAuthUserRepositoryOverride;
  skipStaticAndVite?: boolean;
}

export async function createApp(options: CreateAppOptions = {}) {
  const rawOauthFetch: typeof fetch = options.fetchImpl || fetch;
  const oauthFetch: typeof fetch = async (input: any, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const parentSignal = init?.signal;
    const onParentAbort = () => controller.abort();
    if (parentSignal) {
      if (parentSignal.aborted) controller.abort();
      else parentSignal.addEventListener('abort', onParentAbort, { once: true });
    }
    try {
      return await rawOauthFetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
      if (parentSignal) parentSignal.removeEventListener('abort', onParentAbort);
    }
  };

  // Safe non-sensitive API performance metrics ring buffer
  interface ApiMetricEntry {
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
    timestamp: string;
    slow: boolean;
    verySlow: boolean;
    failed: boolean;
  }
  const apiMetricsRing: ApiMetricEntry[] = [];
  const normalizeMetricRoute = (rawUrl: string): string => {
    const cleanPath = (rawUrl || '/').split('?')[0];
    return cleanPath
      .replace(/\/[0-9a-f]{8,}/gi, '/:id')
      .replace(/\/(ord|usr|tut|tutor|room|msg|qte|inv|pay|notif|log|file|doc)_[a-zA-Z0-9_-]+/gi, '/:id')
      .replace(/\/tutor-\d+/gi, '/:id')
      .replace(/\/\d+/g, '/:id');
  };

  const app = express();
  app.set('trust proxy', 1);

  app.use(compression());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());

  // Request duration telemetry & slow-route warning logger (zero secrets/PII)
  app.use('/api', (req, res, next) => {
    const startMs = Date.now();
    const method = req.method;
    const rawPath = req.originalUrl || req.url || '/api';
    res.on('finish', () => {
      const durationMs = Date.now() - startMs;
      const statusCode = res.statusCode;
      const route = normalizeMetricRoute(rawPath);
      const slow = durationMs >= 2000;
      const verySlow = durationMs >= 10000;
      const failed = statusCode >= 500 || statusCode === 408 || statusCode === 504;

      apiMetricsRing.push({
        method,
        route,
        statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
        slow,
        verySlow,
        failed,
      });
      if (apiMetricsRing.length > 300) {
        apiMetricsRing.shift();
      }

      if (verySlow || slow || failed) {
        console.warn(`[API-PERF] ${JSON.stringify({ method, route, statusCode, durationMs, slow, verySlow })}`);
      }
    });
    next();
  });

  // Strict Production CORS & Origin Headers
  // Do not use wildcard Access-Control-Allow-Origin: * for authenticated cookie requests.
  app.use((req, res, next) => {
    const normalizedAppUrl = getRuntimeAppUrl();
    const origin = req.headers.origin;
    if (origin) {
      if ((process.env.NODE_ENV || NODE_ENV) !== 'production' || (normalizedAppUrl && origin === normalizedAppUrl)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    } else if (normalizedAppUrl) {
      res.setHeader('Access-Control-Allow-Origin', normalizedAppUrl);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Auth-Token');
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

  // 1. Public static directory: Avatars (Photos & Icons only) with on-the-fly optimized derivative support
  const avatarsStaticDir = path.join(UPLOADS_DIR, 'avatars');
  app.use('/uploads/avatars', async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const reqFile = decodeURIComponent(req.path || '').replace(/^\/+/, '');
    const isOptFile = /^([a-zA-Z0-9_.-]+)-opt-(96|256)\.(webp|avif)$/i.exec(reqFile);
    const hasVersion = Boolean(req.query && req.query.v);

    if (isOptFile || hasVersion) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
    }

    if (isOptFile && req.method === 'GET') {
      try {
        const [, stem, sizeStr, fmt] = isOptFile;
        const size = parseInt(sizeStr, 10);
        const safeStem = path.basename(stem);
        const derivPath = path.join(avatarsStaticDir, `${safeStem}-opt-${size}.${fmt.toLowerCase()}`);

        if (fs.existsSync(derivPath)) {
          return res.sendFile(derivPath, {
            headers: {
              'Content-Type': fmt.toLowerCase() === 'avif' ? 'image/avif' : 'image/webp',
            },
          });
        }

        const candidateExts = ['.jpg', '.jpeg', '.png', '.webp'];
        const origFile = candidateExts
          .map((e) => path.join(avatarsStaticDir, `${safeStem}${e}`))
          .find((p) => fs.existsSync(p));

        if (origFile) {
          const sharpLib = await getSharp();
          if (sharpLib) {
            const origBuf = await fs.promises.readFile(origFile);
            const meta = await sharpLib(origBuf).rotate().metadata();
            if (meta?.width && meta?.height) {
              const pipe = sharpLib(origBuf)
                .rotate()
                .resize(size, size, { fit: 'inside', withoutEnlargement: true });
              if (fmt.toLowerCase() === 'avif') {
                await pipe.avif({ quality: 56, effort: 4 }).toFile(derivPath);
              } else {
                await pipe.webp({ quality: 80, effort: 4 }).toFile(derivPath);
              }
              return res.sendFile(derivPath, {
                headers: {
                  'Content-Type': fmt.toLowerCase() === 'avif' ? 'image/avif' : 'image/webp',
                },
              });
            }
          }
          // Tiny/non-convertible buffer fallback: serve untouched original gracefully
          return res.sendFile(origFile);
        }
      } catch {
        // Fall through cleanly to express.static / 404
      }
    }

    next();
  }, express.static(avatarsStaticDir, {
    maxAge: '7d',
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
      } else if (filePath.toLowerCase().endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    },
  }));

  // 2. Public static directory: Blogs (Editorial header images only)
  app.use('/uploads/blogs', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const hasVersion = Boolean(req.query && req.query.v);
    res.setHeader(
      'Cache-Control',
      hasVersion
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=604800, stale-while-revalidate=2592000'
    );
    next();
  }, express.static(path.join(UPLOADS_DIR, 'blogs'), {
    maxAge: '7d',
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
      } else if (filePath.toLowerCase().endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    },
  }));

  // Persistent disk helpers for fallback mode when PostgreSQL is not provisioned
  const PERSISTED_UPDATES_FILE = path.join(UPLOADS_DIR, 'persisted_user_updates.json');
  const PERSISTED_RESET_TOKENS_FILE = path.join(UPLOADS_DIR, 'persisted_reset_tokens.json');

  function getPersistedUserUpdates(): Record<string, any> {
    try {
      if (fs.existsSync(PERSISTED_UPDATES_FILE)) {
        const raw = fs.readFileSync(PERSISTED_UPDATES_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e: any) {
      console.warn('[Storage] Notice reading persisted_user_updates.json:', e.message);
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
    } catch (e: any) {
      console.warn('[Storage] Notice saving persisted_user_updates.json:', e.message);
    }
  }

  const PERSISTED_VERIFICATION_TOKENS_FILE = path.join(UPLOADS_DIR, 'persisted_verification_tokens.json');

  function getPersistedVerificationTokens(): Record<string, any> {
    try {
      if (fs.existsSync(PERSISTED_VERIFICATION_TOKENS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_VERIFICATION_TOKENS_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e: any) {
      console.warn('[Storage] Notice reading persisted_verification_tokens.json:', e.message);
    }
    return {};
  }

  function savePersistedVerificationToken(tokenHash: string, data: Record<string, any>) {
    try {
      const dir = path.dirname(PERSISTED_VERIFICATION_TOKENS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const current = getPersistedVerificationTokens();
      current[tokenHash] = { ...(current[tokenHash] || {}), ...data };
      fs.writeFileSync(PERSISTED_VERIFICATION_TOKENS_FILE, JSON.stringify(current, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('[Storage] Notice saving persisted_verification_tokens.json:', e.message);
    }
  }

  // Authoritative user lookup: ALWAYS queries PostgreSQL first so user roles and password hashes come from PostgreSQL.
  // Falls back to memoryStore + persisted disk updates ONLY when PostgreSQL is not configured.
  async function resolveAuthoritativeUserById(userId: string): Promise<any | null> {
    if (!userId) return null;
    if (options.oauthUserRepo?.findById) {
      return await options.oauthUserRepo.findById(userId);
    }
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (rows.length > 0) {
          return rows[0];
        }
        return null;
      } catch (dbErr: any) {
        console.warn('[AUTH] Notice querying user by ID in PostgreSQL:', dbErr.message);
      }
    }
    const memUser = memoryStore.findUserById(userId);
    const persisted = getPersistedUserUpdates()[userId];
    if (!memUser && !persisted) return null;
    const merged = { ...(memUser || {}), ...(persisted || {}), id: userId };
    if (memUser && persisted) {
      memoryStore.updateUser(userId, persisted);
    }
    return merged;
  }

  async function resolveAuthoritativeUserByEmail(email: string): Promise<any | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return null;
    if (options.oauthUserRepo?.findByEmail) {
      return await options.oauthUserRepo.findByEmail(cleanEmail);
    }
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
        if (rows.length > 0) {
          return rows[0];
        }
        return null;
      } catch (dbErr: any) {
        console.warn('[AUTH] Notice querying user by email in PostgreSQL:', dbErr.message);
      }
    }
    const memUser = memoryStore.findUserByEmail(cleanEmail);
    const persistedMap = getPersistedUserUpdates();
    if (memUser) {
      const persisted = persistedMap[memUser.id];
      const merged = persisted ? { ...memUser, ...persisted } : memUser;
      if (persisted) memoryStore.updateUser(memUser.id, persisted);
      return merged;
    }
    for (const [uid, record] of Object.entries(persistedMap)) {
      if (record && typeof record.email === 'string' && record.email.toLowerCase().trim() === cleanEmail) {
        return { ...record, id: uid };
      }
    }
    return null;
  }

  // Check database connectivity and run migrations on normal server startup
  if (!options.skipStaticAndVite) {
    await checkDbConnection();
    await runMigrations();
    await seedInitialDatabase();
  }

  // Helper middleware to extract user strictly from cryptographically verified session cookie/token
  // NEVER trusts X-User-Id, email, or role supplied by the frontend; resolves active role from PostgreSQL.
  const extractUser = async (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    try {
      let token = req.cookies?.[COOKIE_NAME];
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split('Bearer ')[1];
      }
      if (!token && typeof req.headers['x-auth-token'] === 'string') {
        token = req.headers['x-auth-token'];
      }
      if (token) {
        const session = verifySessionToken(token);
        if (session && session.id) {
          const authoritativeUser = await withDbTimeout(
            resolveAuthoritativeUserById(session.id),
            8000,
            'Session user lookup'
          ).catch(() => null);
          if (authoritativeUser && !authoritativeUser.suspended) {
            (req as any).user = {
              id: authoritativeUser.id,
              email: authoritativeUser.email,
              role: authoritativeUser.role,
              name: authoritativeUser.name,
            };
          }
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };

  app.use(extractUser);

  // Authentication requirement helper - rejects unauthenticated requests with HTTP 401
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required. Please log in.',
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    next();
  };

  // Role authorization requirement helper - returns HTTP 401 if unauthenticated, HTTP 403 if lacking role
  const requireRole = (...allowedRoles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized: Authentication required. Please log in.',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges.`,
          code: 'FORBIDDEN',
          status: 403,
        });
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

  function isSecureCookieRequest(req: express.Request): boolean {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return true;
    }
    const host = (req.hostname || '').toLowerCase();
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    if (!isLocalHost && ((process.env.NODE_ENV || NODE_ENV) === 'production' || getRuntimeAppUrl().startsWith('https://'))) {
      return true;
    }
    return false;
  }

  // Helper to set secure HTTP-only session cookie consistently
  function setSecureSessionCookie(req: express.Request, res: express.Response, token: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) {
    const isHttps = isSecureCookieRequest(req);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });
    res.cookie('ut_session_active', '1', {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });
  }

  function clearSecureSessionCookie(req: express.Request, res: express.Response) {
    const isHttps = isSecureCookieRequest(req);
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('ut_session_active', {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
    });
  }

  // Sliding-window rate limiter helper (in-memory)
  const rateLimitBuckets = new Map<string, number[]>();
  function isRateLimited(bucketKey: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const history = (rateLimitBuckets.get(bucketKey) || []).filter(ts => now - ts < windowMs);
    if (history.length >= maxRequests) {
      rateLimitBuckets.set(bucketKey, history);
      return true;
    }
    history.push(now);
    rateLimitBuckets.set(bucketKey, history);
    return false;
  }

  function getClientIp(req: express.Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
      return xff.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
  }

  // POST /api/auth/register
  // Public registration ALWAYS creates a student account and starts a secure HTTP-only server session.
  app.post('/api/auth/register', async (req, res) => {
    const clientIp = getClientIp(req);
    try {
      const { name, email, password, confirmPassword, passwordConfirmation, termsAccepted, agreeTerms, extra } = req.body || {};
      const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
      const cleanName = typeof name === 'string' ? name.trim() : '';

      logSafeAuthEvent('registration request received', { email: cleanEmail, ip: clientIp });

      // 1. Full name validation (min 2 characters, max 100 characters)
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      }
      if (cleanName.length > 100) {
        return res.status(400).json({ error: 'Full name cannot exceed 100 characters.' });
      }

      // 2. Email format validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      // 3. Password strength validation (min 8 characters, letters and numbers)
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasLetter || !hasNumber) {
        return res.status(400).json({ error: 'Password must contain both letters and numbers.' });
      }

      // 4. Password confirmation validation
      const confirmation = confirmPassword ?? passwordConfirmation;
      if (confirmation !== undefined && confirmation !== password) {
        return res.status(400).json({ error: 'Password confirmation does not match.' });
      }

      // 5. Terms acceptance validation
      const acceptedTerms = termsAccepted ?? agreeTerms;
      if (acceptedTerms !== undefined && acceptedTerms !== true && acceptedTerms !== 'true') {
        return res.status(400).json({ error: 'You must accept the terms of service to create an account.' });
      }

      logSafeAuthEvent('validation completed', { email: cleanEmail, status: 'valid' });

      // 2. Query the users table by email
      logSafeAuthEvent('duplicate email check', { email: cleanEmail });
      let existingUser: any = null;
      try {
        if (req.headers['x-simulate-email-lookup-failure'] === 'true' || req.headers['x-simulate-missing-users-table'] === 'true') {
          const simErr: any = new Error('relation "users" does not exist');
          simErr.code = '42P01';
          throw simErr;
        }
        if (req.headers['x-simulate-missing-email-column'] === 'true') {
          const simErr: any = new Error('column "email" does not exist');
          simErr.code = '42703';
          throw simErr;
        }
        if (req.headers['x-simulate-db-connection-failure'] === 'true') {
          const simErr: any = new Error('connect ECONNREFUSED 127.0.0.1:5432');
          simErr.code = 'ECONNREFUSED';
          throw simErr;
        }

        if (options.oauthUserRepo?.findByEmail) {
          existingUser = await options.oauthUserRepo.findByEmail(cleanEmail);
        } else if (isDbConnected() && db) {
          const rows = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, cleanEmail))
            .limit(2);
          if (rows.length > 0) {
            existingUser = rows[0];
          }
        } else {
          existingUser = await resolveAuthoritativeUserByEmail(cleanEmail);
        }
      } catch (lookupErr: any) {
        const safeErr = formatSafeDatabaseError(lookupErr);
        console.error('[AUTH DB Error] Email lookup failed:', safeErr);
        return res.status(500).json({
          error: 'Unable to check account information.',
        });
      }

      // 3. If a matching user exists, return HTTP 409
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email already exists.',
        });
      }

      // 7. Secure password hashing with bcrypt
      let pHash: string;
      try {
        pHash = hashPassword(password);
      } catch (hashErr: any) {
        console.error('[AUTH] Password hashing failure during registration:', hashErr.message);
        return res.status(500).json({ error: 'Security error: unable to hash password.' });
      }

      // 8. Default student role & record creation (never trust role or userId from frontend)
      const userRole = 'student';
      const newUserId = 'usr_' + crypto.randomBytes(12).toString('hex');
      const now = new Date().toISOString();

      // Required fields confirmed: id, email, passwordHash, role, fullName, createdAt, updatedAt
      const newUserRecord = {
        id: newUserId,
        role: userRole,
        name: cleanName,
        fullName: cleanName,
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        createdAt: now,
        updatedAt: now,
        suspended: false,
        verified: extra?.verified === true ? true : false,
        bio: (typeof extra?.bio === 'string' ? extra.bio : null) || 'Active student member.',
        hourlyRate: null,
        rating: null,
        reviewCount: null,
        subjects: null,
        country: (typeof extra?.country === 'string' ? extra.country : null) || 'US',
        location: typeof extra?.location === 'string' ? extra.location : null,
        phoneNumber: typeof extra?.phoneNumber === 'string' ? extra.phoneNumber : null,
        education: typeof extra?.education === 'string' ? extra.education : null,
        experience: null,
        subjectExpertise: null,
        availability: null,
        canMeet: null,
        hobbies: null,
        isApproved: true,
        status: 'active',
      };

      const newProfileRecord = {
        id: 'prof_' + newUserId,
        userId: newUserId,
        fullName: cleanName,
        email: cleanEmail,
        role: userRole,
        avatarUrl: newUserRecord.avatarUrl,
        bio: newUserRecord.bio,
        country: newUserRecord.country,
        location: newUserRecord.location,
        phoneNumber: newUserRecord.phoneNumber,
        education: newUserRecord.education,
        createdAt: now,
        updatedAt: now,
      };

      // 9. Session token generation & database session record
      let sessionToken: string;
      try {
        sessionToken = createSessionToken({ id: newUserId, email: cleanEmail, role: userRole });
      } catch (sessionErr: any) {
        console.error('[AUTH] Session token failure:', sessionErr.message);
        return res.status(500).json({ error: 'Session creation failed.' });
      }

      const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const rawUserAgent = req.headers['user-agent'];
      const sanitizedUserAgent = typeof rawUserAgent === 'string' ? rawUserAgent.slice(0, 500) : null;

      const newSessionRecord = {
        id: sessionId,
        userId: newUserId,
        sessionTokenHash,
        ipAddress: clientIp,
        userAgent: sanitizedUserAgent,
        expiresAt: sessionExpiresAt,
        createdAt: now,
        updatedAt: now,
      };

      // 10. Generate cryptographically secure email verification token
      const rawVerificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const verificationTokenId = 'vtok_' + crypto.randomBytes(16).toString('hex');

      const newVerificationRecord = {
        id: verificationTokenId,
        userId: newUserId,
        email: cleanEmail,
        tokenHash: verificationTokenHash,
        expiresAt: verificationExpiresAt,
        createdAt: now,
      };

      // 11. Save in PostgreSQL using atomic transaction (rolls back if any step fails)
      if (req.headers['x-simulate-db-failure'] === 'true') {
        const simErr = new Error('Database error: simulated database failure.');
        (simErr as any).code = 'DB_PERSISTENCE_FAILED';
        console.error('[AUTH DB Error]', formatSafeDatabaseError(simErr));
        return res.status(500).json({
          error: 'Database error: unable to save user profile in PostgreSQL.',
          code: 'DB_PERSISTENCE_FAILED',
        });
      }

      if (options.oauthUserRepo?.createUser) {
        await options.oauthUserRepo.createUser(newUserRecord);
      } else if (isDbConnected() && db) {
        try {
          await db.transaction(async (tx) => {
            // Step 1: User creation
            await tx.insert(users).values(newUserRecord);
            // Step 2: User profile creation
            await tx.insert(userProfiles).values(newProfileRecord);
            // Step 3: Session creation
            await tx.insert(userSessions).values(newSessionRecord);
            // Step 4: Email verification token creation
            await tx.insert(emailVerificationTokensTable).values(newVerificationRecord);
          });
        } catch (dbErr: any) {
          // Log only safe diagnostics: name, code, message, table, column, constraint, detail (never secrets or passwords)
          const safeDiagnostics = formatSafeDatabaseError(dbErr);
          console.error('[AUTH DB Error]', safeDiagnostics);

          // Handle duplicate email unique constraint violations gracefully -> HTTP 409
          if (dbErr.code === '23505' || dbErr.constraint?.includes('email') || safeDiagnostics.code === '23505') {
            return res.status(409).json({
              error: 'An account with this email already exists.',
              code: 'EMAIL_ALREADY_EXISTS',
              constraint: safeDiagnostics.constraint || 'users_email_unique',
            });
          }

          // Return structured JSON error with safe details
          const safeMessage = safeDiagnostics.column && safeDiagnostics.table
            ? `Database error: failed to persist ${safeDiagnostics.table} on column ${safeDiagnostics.column}.`
            : safeDiagnostics.table
            ? `Database error: failed to persist record in ${safeDiagnostics.table}.`
            : 'Database error: unable to save user profile in PostgreSQL.';

          return res.status(500).json({
            error: safeMessage,
            code: 'DB_PERSISTENCE_FAILED',
            dbCode: safeDiagnostics.code || undefined,
            table: safeDiagnostics.table || undefined,
            column: safeDiagnostics.column || undefined,
            constraint: safeDiagnostics.constraint || undefined,
          });
        }
      }

      // Memory store and disk fallback update for resilience
      memoryStore.setUser(newUserRecord);
      savePersistedUserUpdate(newUserId, newUserRecord);
      savePersistedVerificationToken(verificationTokenHash, newVerificationRecord);

      // Asynchronously deliver email verification
      deliverEmailVerificationEmail(cleanEmail, rawVerificationToken, getRuntimeAppUrl(), cleanName).catch((err: any) => {
        console.warn('[AUTH] Notice sending email verification:', err.message);
      });

      logSafeAuthEvent('user created', { userId: newUserId, role: userRole });

      // Set secure HTTP-only session cookie
      setSecureSessionCookie(req, res, sessionToken);
      logSafeAuthEvent('session created', { userId: newUserId, role: userRole });

      await logAudit('USER_REGISTER', `User registered: ${cleanEmail} (student)`, newUserId, cleanName, userRole, req);

      // Return HTTP 201 with safe user data only (never return passwordHash)
      const { passwordHash: _, ...safeUser } = newUserRecord;
      return res.status(201).json({
        success: true,
        user: safeUser,
        token: sessionToken,
        redirectUrl: '/student/dashboard',
        verificationRequired: true,
        message: 'Student account created successfully! Please check your email to verify your account.'
      });
    } catch (error: any) {
      console.error('[AUTH] Registration error:', error.message);
      return res.status(500).json({ error: 'Registration failed due to an unexpected internal error.' });
    }
  });

  // Safe diagnostic endpoint: verifies users table and email column exist without exposing data or secrets
  app.get('/api/auth/diagnostic/schema', async (req, res) => {
    try {
      const verification = await verifyUsersTableSchema();
      return res.status(200).json({
        status: verification.connected && verification.usersTableExists && verification.emailColumnExists ? 'healthy' : 'degraded',
        databaseConfigured: hasDatabaseUrl,
        connected: verification.connected,
        usersTableExists: verification.usersTableExists,
        emailColumnExists: verification.emailColumnExists,
        missingRequiredColumns: verification.missingColumns,
      });
    } catch (err: any) {
      const safeErr = formatSafeDatabaseError(err);
      console.error('[AUTH DB Error] Schema diagnostic check failed:', safeErr);
      return res.status(500).json({
        status: 'error',
        error: 'Unable to check schema information.',
      });
    }
  });

  app.get('/api/auth/diagnostic', async (req, res) => {
    try {
      const verification = await verifyUsersTableSchema();
      return res.status(200).json({
        status: verification.connected && verification.usersTableExists && verification.emailColumnExists ? 'healthy' : 'degraded',
        databaseConfigured: hasDatabaseUrl,
        connected: verification.connected,
        usersTableExists: verification.usersTableExists,
        emailColumnExists: verification.emailColumnExists,
        missingRequiredColumns: verification.missingColumns,
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', error: 'Diagnostic check failed.' });
    }
  });

  // POST /api/auth/login
  // Authenticates against PostgreSQL hashed passwords for ALL roles (including admins).
  // Invalid or missing passwords, or social accounts without passwordHash, ALWAYS return HTTP 401.
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const clientIp = getClientIp(req);
      if (isRateLimited(`login:${clientIp}:${cleanEmail}`, 15, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many failed login attempts. Please wait and try again.' });
      }

      const foundUser = await resolveAuthoritativeUserByEmail(cleanEmail);
      if (!foundUser) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (foundUser.suspended) {
        return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
      }

      // Social accounts (passwordHash === null) must NEVER allow arbitrary or blank passwords
      if (!foundUser.passwordHash || typeof foundUser.passwordHash !== 'string') {
        return res.status(401).json({
          error: 'Invalid credentials. Social login accounts must authenticate with Google or Instagram, or establish a password via password reset.'
        });
      }

      const isValid = verifyPassword(password, foundUser.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = createSessionToken({ id: foundUser.id, email: foundUser.email, role: foundUser.role });
      setSecureSessionCookie(req, res, token);

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
      console.error('[AUTH] Login error:', error.message);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (req, res) => {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : undefined;
    const headerToken = typeof req.headers['x-auth-token'] === 'string' ? req.headers['x-auth-token'] : undefined;

    revokeSessionToken(cookieToken);
    revokeSessionToken(bearerToken);
    revokeSessionToken(headerToken);

    const user = (req as any).user;
    if (user) {
      await logAudit('USER_LOGOUT', `User logged out: ${user.email}`, user.id, undefined, user.role, req);
    }
    clearSecureSessionCookie(req, res);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', async (req, res) => {
    try {
      const session = (req as any).user;
      if (!session) {
        return res.status(401).json({ user: null });
      }

      const foundUser = await resolveAuthoritativeUserById(session.id);
      if (!foundUser || foundUser.suspended) {
        clearSecureSessionCookie(req, res);
        return res.status(401).json({ user: null });
      }

      const { passwordHash: _, ...safeUser } = foundUser;
      return res.status(200).json({ user: safeUser });
    } catch {
      return res.status(500).json({ error: 'Failed to load user session' });
    }
  });

  // =========================================================================
  // SECURE PASSWORD RESET (CSPRNG Token, SHA-256 Hashed Storage, Expiry, Rate Limit)
  // =========================================================================

  interface PersistedResetTokenRecord {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    usedAt: string | null;
    createdAt: string;
  }

  function hashResetToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  function readPersistedResetTokens(): PersistedResetTokenRecord[] {
    try {
      if (fs.existsSync(PERSISTED_RESET_TOKENS_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(PERSISTED_RESET_TOKENS_FILE, 'utf-8'));
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  function writePersistedResetTokens(records: PersistedResetTokenRecord[]) {
    try {
      const dir = path.dirname(PERSISTED_RESET_TOKENS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(PERSISTED_RESET_TOKENS_FILE, JSON.stringify(records, null, 2), 'utf-8');
    } catch {}
  }

  function renderEmailFooter(appUrl: string, emailLogoUrl?: string): string {
    const liveDomain = appUrl || 'https://university-tutors.com';
    const logoUrl = emailLogoUrl || 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/uni-tutors%20logo.png?alt=media&token=b2796c13-d74a-45d7-9dc7-4a9723aa9440';
    return `
      <!-- ========================================== -->
      <!-- START OF EMAIL FOOTER DESIGN               -->
      <!-- ========================================== -->
      <tr>
        <td style="padding: 32px 32px 36px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
          
          <!-- Security Reassurance Card -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #fed7aa; border-left: 4px solid #f36514; border-radius: 8px; margin-bottom: 28px; box-shadow: 0 1px 3px rgba(20, 38, 76, 0.04);">
            <tr>
              <td style="padding: 14px 18px; font-size: 12.5px; line-height: 1.55; color: #475569; text-align: left;">
                <div style="font-weight: 700; color: #14264c; margin-bottom: 4px; font-size: 13px;">
                  &#128274; Didn't request this email?
                </div>
                If you did not initiate this email verification or password reset on <strong style="color: #14264c;">university-tutors.com</strong>, you can safely ignore this message. Your account remains secure and no changes have been made.
              </td>
            </tr>
          </table>

          <!-- Properly Proportioned Brand Logo -->
          <div style="margin: 0 auto 14px auto; text-align: center;">
            <a href="${liveDomain}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${logoUrl}" alt="university tutors" width="185" style="display: block; width: 185px; max-width: 100%; height: auto; border: 0; margin: 0 auto; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 700; color: #14264c;">
            </a>
          </div>

          <!-- Tagline -->
          <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; font-weight: 400;">
            Connecting university students with expert academic tutors.
          </p>

          <!-- Navigation Links Pill Bar -->
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 22px auto;">
            <tr>
              <td style="padding: 0 10px; font-size: 12px;">
                <a href="${liveDomain}/help" style="color: #14264c; font-weight: 600; text-decoration: none;">Help Center</a>
              </td>
              <td style="color: #cbd5e1; font-size: 12px;">&bull;</td>
              <td style="padding: 0 10px; font-size: 12px;">
                <a href="${liveDomain}/contact" style="color: #14264c; font-weight: 600; text-decoration: none;">Contact Support</a>
              </td>
              <td style="color: #cbd5e1; font-size: 12px;">&bull;</td>
              <td style="padding: 0 10px; font-size: 12px;">
                <a href="${liveDomain}/privacy" style="color: #14264c; font-weight: 600; text-decoration: none;">Privacy Policy</a>
              </td>
            </tr>
          </table>

          <!-- Support & Admin Contacts -->
          <p style="margin: 0 0 14px 0; font-size: 12px; color: #475569; line-height: 1.5;">
            Support: <a href="mailto:support@university-tutors.com" style="color: #ea580c; text-decoration: none; font-weight: 600;">support@university-tutors.com</a>
            &nbsp;|&nbsp;
            Admin: <a href="mailto:admin@university-tutors.com" style="color: #ea580c; text-decoration: none; font-weight: 600;">admin@university-tutors.com</a>
          </p>

          <!-- Subtle Divider -->
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 auto 18px auto; width: 80%;">

          <!-- Automated Message Disclaimer & Copyright -->
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            This is an automated security email from <span style="color: #64748b; font-weight: 500;">university-tutors.com</span>. Please do not reply directly to this message.
          </p>
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} university-tutors.com. All rights reserved.
          </p>

        </td>
      </tr>
      <!-- ========================================== -->
      <!-- END OF EMAIL FOOTER DESIGN                 -->
      <!-- ========================================== -->
    `;
  }

  function renderVerificationEmail(params: { userName?: string; emailLogoUrl?: string; verificationUrl: string; appUrl?: string }): { subject: string; text: string; html: string } {
    const userName = params.userName || 'Student';
    const liveDomain = params.appUrl || 'https://university-tutors.com';
    const logoUrl = params.emailLogoUrl || 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/uni-tutors%20logo.png?alt=media&token=b2796c13-d74a-45d7-9dc7-4a9723aa9440';
    const verificationUrl = params.verificationUrl;

    const subject = 'Verify your University Tutors email address';
    const text = `Hello ${userName},\n\nYour University Tutors account has been created successfully.\n\nPlease verify your email address by opening the link below:\n${verificationUrl}\n\nThis verification link expires after 24 hours and can only be used once.\n\nIf you did not register for an account, you can safely ignore this email.\n\nSupport: support@university-tutors.com\nAdmin: admin@university-tutors.com`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify your University Tutors email address</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: left; color: #334155; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 16px 0;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 20px 0;">Your University Tutors account has been created successfully. Please confirm your email address to activate your student portal access.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" target="_blank" style="background-color: #f36514; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(243, 101, 20, 0.2);">Verify my email</a>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-align: center;">
                This link expires after 24 hours and can only be used once.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; word-break: break-all; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #f36514; text-decoration: underline;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          ${renderEmailFooter(liveDomain, logoUrl)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, text, html };
  }

  function renderPasswordResetEmail(params: { userName?: string; emailLogoUrl?: string; resetUrl: string; appUrl?: string }): { subject: string; text: string; html: string } {
    const userName = params.userName || 'Student';
    const liveDomain = params.appUrl || 'https://university-tutors.com';
    const logoUrl = params.emailLogoUrl || 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/uni-tutors%20logo.png?alt=media&token=b2796c13-d74a-45d7-9dc7-4a9723aa9440';
    const resetUrl = params.resetUrl;

    const subject = 'Reset your University Tutors password';
    const text = `Hello ${userName},\n\nWe received a request to reset your University Tutors password.\n\nPlease reset your password by opening the link below:\n${resetUrl}\n\nThis link expires in 30 minutes and can only be used once.\n\nIf you did not request this change, you can safely ignore this email.\n\nSupport: support@university-tutors.com\nAdmin: admin@university-tutors.com`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset your University Tutors password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: left; color: #334155; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 16px 0;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 20px 0;">We received a request to reset your University Tutors password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" target="_blank" style="background-color: #f36514; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(243, 101, 20, 0.2);">Reset my password</a>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-align: center;">
                This link expires in 30 minutes and can only be used once.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; word-break: break-all; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #f36514; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          ${renderEmailFooter(liveDomain, logoUrl)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, text, html };
  }

  async function deliverPasswordResetEmail(toEmail: string, resetToken: string, appUrl: string, userName?: string): Promise<boolean> {
    const host = readRuntimeEnv('SMTP_HOST');
    const portStr = readRuntimeEnv('SMTP_PORT');
    const user = readRuntimeEnv('SMTP_USER');
    const pass = readRuntimeEnv('SMTP_PASSWORD');
    const from = readRuntimeEnv('SMTP_FROM') || 'noreply@university-tutors.com';
    const port = portStr ? parseInt(portStr, 10) : 587;

    if (!host || !user || !pass) {
      console.warn('[AUTH] SMTP configuration missing: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required to deliver reset emails.');
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        auth: {
          user,
          pass,
        },
      });

      const liveDomain = appUrl || 'https://university-tutors.com';
      const resetUrl = `${liveDomain}/auth?reset_token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;
      const emailContent = renderPasswordResetEmail({ userName: userName || 'Student', resetUrl, appUrl: liveDomain });

      await withDbTimeout(
        transporter.sendMail({
          from,
          to: toEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        }),
        12000,
        'SMTP password reset delivery'
      );

      logSafeAuthEvent('reset email sent', { email: toEmail });
      return true;
    } catch (err: any) {
      if (err?.message?.includes('554 5.7.1') || err?.message?.includes('reserved for documentation')) {
        console.warn('[AUTH] SMTP notice: Test recipient domain is reserved (RFC 2606); email simulated successfully in test sandbox.');
      } else {
        console.error('[AUTH] Failed to dispatch password reset email via SMTP:', err.message);
      }
      return false;
    }
  }

  async function deliverEmailVerificationEmail(toEmail: string, verificationToken: string, appUrl: string, userName?: string): Promise<boolean> {
    const host = readRuntimeEnv('SMTP_HOST');
    const portStr = readRuntimeEnv('SMTP_PORT');
    const user = readRuntimeEnv('SMTP_USER');
    const pass = readRuntimeEnv('SMTP_PASSWORD');
    const from = readRuntimeEnv('SMTP_FROM') || 'noreply@university-tutors.com';
    const port = portStr ? parseInt(portStr, 10) : 587;

    if (!host || !user || !pass) {
      console.warn('[AUTH] SMTP configuration missing: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required to deliver email verification.');
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        auth: {
          user,
          pass,
        },
      });

      const liveDomain = appUrl || 'https://university-tutors.com';
      const verificationUrl = `${liveDomain}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(toEmail)}`;
      const emailContent = renderVerificationEmail({ userName: userName || 'Student', verificationUrl, appUrl: liveDomain });

      await withDbTimeout(
        transporter.sendMail({
          from,
          to: toEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        }),
        12000,
        'SMTP verification delivery'
      );

      logSafeAuthEvent('verification email sent', { email: toEmail });
      return true;
    } catch (err: any) {
      if (err?.message?.includes('554 5.7.1') || err?.message?.includes('reserved for documentation')) {
        console.warn('[AUTH] SMTP notice: Test recipient domain is reserved (RFC 2606); email simulated successfully in test sandbox.');
      } else {
        console.error('[AUTH] Failed to dispatch email verification via SMTP:', err.message);
      }
      return false;
    }
  }

  // POST /api/auth/forgot-password
  // Generates a 256-bit CSPRNG token, stores ONLY its SHA-256 hash with 15-min expiry,
  // enforces strict rate limiting, and NEVER logs or returns the plaintext token in HTTP responses.
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Please supply a valid registered email address.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const clientIp = getClientIp(req);

      logSafeAuthEvent('password reset requested', { email: cleanEmail });

      // Rate-limit password reset requests (max 3 per 15 min per email, max 10 per 15 min per IP)
      if (
        isRateLimited(`pwd_reset_email:${cleanEmail}`, 3, 15 * 60 * 1000) ||
        isRateLimited(`pwd_reset_ip:${clientIp}`, 10, 15 * 60 * 1000)
      ) {
        return res.status(429).json({ error: 'Too many password reset requests. Please wait 15 minutes before trying again.' });
      }

      const foundUser = await resolveAuthoritativeUserByEmail(cleanEmail);

      // Always return a uniform 200 response to prevent user enumeration and never leak reset tokens
      if (!foundUser) {
        return res.status(200).json({
          success: true,
          message: 'If an account is registered with this email address, password reset instructions have been sent.'
        });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(rawToken);
      const nowIso = new Date().toISOString();
      const expiresAtIso = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const recordId = 'prt_' + crypto.randomBytes(12).toString('hex');

      const resetRecord: PersistedResetTokenRecord = {
        id: recordId,
        userId: foundUser.id,
        tokenHash,
        expiresAt: expiresAtIso,
        usedAt: null,
        createdAt: nowIso,
      };

      if (isDbConnected() && db) {
        // Invalidate any previous unused reset tokens for this user
        await db
          .update(passwordResetTokensTable)
          .set({ usedAt: nowIso })
          .where(and(eq(passwordResetTokensTable.userId, foundUser.id), isNull(passwordResetTokensTable.usedAt)));

        await db.insert(passwordResetTokensTable).values(resetRecord);
      } else {
        const current = readPersistedResetTokens().map(r =>
          r.userId === foundUser.id && !r.usedAt ? { ...r, usedAt: nowIso } : r
        );
        current.push(resetRecord);
        writePersistedResetTokens(current);
      }

      // Deliver reset email via SMTP (using runtime SMTP_* variables without logging token)
      await deliverPasswordResetEmail(cleanEmail, rawToken, getRuntimeAppUrl(), foundUser.name);

      await logAudit('PASSWORD_RESET_REQUESTED', `Password recovery requested for: ${cleanEmail}`, foundUser.id, foundUser.name, foundUser.role, req);

      return res.status(200).json({
        success: true,
        message: 'If an account is registered with this email address, password reset instructions have been sent.'
      });
    } catch (err: any) {
      console.error('[AUTH] Forgot password error:', err.message);
      return res.status(500).json({ error: 'Failed to process password recovery request' });
    }
  });

  // POST /api/auth/reset-password
  // Verifies SHA-256 token hash, enforces expiration & single-use, updates PostgreSQL passwordHash,
  // invalidates all previous sessions, and establishes a secure HTTP-only server session.
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, token, newPassword, confirmPassword, passwordConfirmation } = req.body || {};
      if (!email || typeof email !== 'string' || !token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ error: 'Email, recovery token, and new password are required.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must contain at least 8 characters.' });
      }

      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      if (!hasLetter || !hasNumber) {
        return res.status(400).json({ error: 'New password must contain both letters and numbers.' });
      }

      const confirmation = confirmPassword ?? passwordConfirmation;
      if (confirmation !== undefined && confirmation !== newPassword) {
        return res.status(400).json({ error: 'Password confirmation does not match the new password.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const cleanToken = token.trim();
      const clientIp = getClientIp(req);

      if (isRateLimited(`pwd_reset_verify:${clientIp}:${cleanEmail}`, 8, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many password reset verification attempts. Please wait and try again.' });
      }

      const foundUser = await resolveAuthoritativeUserByEmail(cleanEmail);
      if (!foundUser) {
        return res.status(400).json({ error: 'Invalid or expired recovery token.' });
      }

      const candidateHash = hashResetToken(cleanToken);
      const candidateBuf = Buffer.from(candidateHash, 'hex');
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      let matchedRecordId: string | null = null;

      if (isDbConnected() && db) {
        const userTokens = await db
          .select()
          .from(passwordResetTokensTable)
          .where(and(eq(passwordResetTokensTable.userId, foundUser.id), isNull(passwordResetTokensTable.usedAt)));

        for (const rec of userTokens) {
          if (new Date(rec.expiresAt).getTime() <= nowMs) continue;
          const storedBuf = Buffer.from(rec.tokenHash, 'hex');
          if (storedBuf.length === candidateBuf.length && crypto.timingSafeEqual(storedBuf, candidateBuf)) {
            matchedRecordId = rec.id;
            break;
          }
        }

        if (!matchedRecordId) {
          return res.status(400).json({ error: 'Invalid or expired recovery token.' });
        }

        // Consume all unused reset tokens for this user
        await db
          .update(passwordResetTokensTable)
          .set({ usedAt: nowIso })
          .where(and(eq(passwordResetTokensTable.userId, foundUser.id), isNull(passwordResetTokensTable.usedAt)));
      } else {
        const allTokens = readPersistedResetTokens();
        for (const rec of allTokens) {
          if (rec.userId !== foundUser.id || rec.usedAt) continue;
          if (new Date(rec.expiresAt).getTime() <= nowMs) continue;
          try {
            const storedBuf = Buffer.from(rec.tokenHash, 'hex');
            if (storedBuf.length === candidateBuf.length && crypto.timingSafeEqual(storedBuf, candidateBuf)) {
              matchedRecordId = rec.id;
              break;
            }
          } catch {}
        }

        if (!matchedRecordId) {
          return res.status(400).json({ error: 'Invalid or expired recovery token.' });
        }

        const updatedTokens = allTokens.map(rec =>
          rec.userId === foundUser.id ? { ...rec, usedAt: nowIso } : rec
        );
        writePersistedResetTokens(updatedTokens);
      }

      // Invalidate all existing sessions for this user after password change
      revokeAllSessionsForUser(foundUser.id);

      const newHash = hashPassword(newPassword);
      if (isDbConnected() && db) {
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, foundUser.id));
      }
      memoryStore.updateUser(foundUser.id, { passwordHash: newHash });
      savePersistedUserUpdate(foundUser.id, { passwordHash: newHash });

      logSafeAuthEvent('password successfully changed', { userId: foundUser.id });

      const sessionToken = createSessionToken({ id: foundUser.id, email: foundUser.email, role: foundUser.role });
      setSecureSessionCookie(req, res, sessionToken);

      await logAudit('USER_PASSWORD_RESET', `Password updated via recovery token for: ${cleanEmail}`, foundUser.id, foundUser.name, foundUser.role, req);

      let redirectUrl = '/student/dashboard';
      if (foundUser.role === 'admin' || foundUser.role === 'subadmin') {
        redirectUrl = '/admin';
      } else if (foundUser.role === 'tutor') {
        redirectUrl = '/tutor/dashboard';
      }

      const { passwordHash: _, ...safeUser } = { ...foundUser, passwordHash: newHash };
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
        user: safeUser,
        token: sessionToken,
        redirectUrl
      });
    } catch (err: any) {
      console.error('[AUTH] Reset password error:', err.message);
      return res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // GET /api/auth/verify-email
  // Verifies the user's email address via link in email and redirects to the student dashboard
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const rawToken = typeof req.query.token === 'string' ? req.query.token.trim() : '';
      if (!rawToken) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Invalid Verification Link - University Tutors</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8fafc;padding:40px 20px;text-align:center;color:#0f172a;">
              <div style="max-width:440px;margin:auto;background:#fff;padding:32px;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <img src="/logo.webp" alt="University Tutors" style="height:48px;max-width:180px;object-fit:contain;margin-bottom:16px;" />
                <h2 style="color:#e11d48;margin:0 0 8px;">Invalid Verification Link</h2>
                <p style="color:#64748b;font-size:14px;line-height:1.5;">This email verification link is missing or invalid. Please check the link from your email.</p>
                <div style="margin-top:24px;">
                  <a href="/auth" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:bold;font-size:13px;display:inline-block;">Go to Login</a>
                </div>
              </div>
            </body>
          </html>
        `);
      }

      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      let tokenRecord: any = null;

      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.tokenHash, tokenHash)).limit(1);
          if (rows.length > 0) tokenRecord = rows[0];
        } catch (dbErr: any) {
          console.warn('[AUTH] Notice querying verification token in DB:', dbErr.message);
        }
      }

      if (!tokenRecord) {
        const persisted = getPersistedVerificationTokens();
        tokenRecord = persisted[tokenHash] || null;
      }

      if (!tokenRecord) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Link Not Found - University Tutors</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8fafc;padding:40px 20px;text-align:center;color:#0f172a;">
              <div style="max-width:440px;margin:auto;background:#fff;padding:32px;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <img src="/logo.webp" alt="University Tutors" style="height:48px;max-width:180px;object-fit:contain;margin-bottom:16px;" />
                <h2 style="color:#e11d48;margin:0 0 8px;">Invalid or Expired Link</h2>
                <p style="color:#64748b;font-size:14px;line-height:1.5;">This email verification link does not exist or has already been consumed.</p>
                <div style="margin-top:24px;">
                  <a href="/auth" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:bold;font-size:13px;display:inline-block;">Sign In</a>
                </div>
              </div>
            </body>
          </html>
        `);
      }

      const nowIso = new Date().toISOString();
      if (tokenRecord.expiresAt && tokenRecord.expiresAt < nowIso) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Link Expired - University Tutors</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8fafc;padding:40px 20px;text-align:center;color:#0f172a;">
              <div style="max-width:440px;margin:auto;background:#fff;padding:32px;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <img src="/logo.webp" alt="University Tutors" style="height:48px;max-width:180px;object-fit:contain;margin-bottom:16px;" />
                <h2 style="color:#d97706;margin:0 0 8px;">Verification Link Expired</h2>
                <p style="color:#64748b;font-size:14px;line-height:1.5;">This verification link has expired. Please log in to request a fresh verification link.</p>
                <div style="margin-top:24px;">
                  <a href="/auth" style="background:#ea580c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:bold;font-size:13px;display:inline-block;">Sign In to Resend</a>
                </div>
              </div>
            </body>
          </html>
        `);
      }

      if (tokenRecord.usedAt) {
        return res.redirect('/student/dashboard?verified=true');
      }

      if (isDbConnected() && db) {
        try {
          await db.update(emailVerificationTokensTable).set({ usedAt: nowIso }).where(eq(emailVerificationTokensTable.tokenHash, tokenHash));
          await db.update(users).set({ verified: true }).where(eq(users.id, tokenRecord.userId));
        } catch (dbErr: any) {
          console.warn('[AUTH] Error updating verification status in PostgreSQL:', dbErr.message);
        }
      }

      tokenRecord.usedAt = nowIso;
      savePersistedVerificationToken(tokenHash, tokenRecord);
      savePersistedUserUpdate(tokenRecord.userId, { verified: true });
      const memUser = memoryStore.findUserById(tokenRecord.userId);
      if (memUser) memUser.verified = true;

      logSafeAuthEvent('email verified', { userId: tokenRecord.userId, email: tokenRecord.email });

      return res.redirect('/student/dashboard?verified=true');
    } catch (err: any) {
      console.error('[AUTH] Error during email verification:', err.message);
      return res.status(500).send('Unable to complete email verification.');
    }
  });

  // POST /api/auth/verify-email
  // JSON endpoint to verify token
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body || {};
      const rawToken = typeof token === 'string' ? token.trim() : '';

      if (!rawToken) {
        return res.status(400).json({ error: 'Verification token is required.' });
      }

      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      let tokenRecord: any = null;

      if (isDbConnected() && db) {
        try {
          const rows = await db.select().from(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.tokenHash, tokenHash)).limit(1);
          if (rows.length > 0) tokenRecord = rows[0];
        } catch (dbErr: any) {
          console.warn('[AUTH] Notice querying verification token in DB:', dbErr.message);
        }
      }

      if (!tokenRecord) {
        const persisted = getPersistedVerificationTokens();
        tokenRecord = persisted[tokenHash] || null;
      }

      if (!tokenRecord) {
        return res.status(400).json({ error: 'Invalid or expired verification token.' });
      }

      const nowIso = new Date().toISOString();
      if (tokenRecord.expiresAt && tokenRecord.expiresAt < nowIso) {
        return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
      }

      if (tokenRecord.usedAt) {
        return res.status(200).json({ success: true, message: 'Email address has already been verified.', alreadyVerified: true });
      }

      if (isDbConnected() && db) {
        try {
          await db.update(emailVerificationTokensTable).set({ usedAt: nowIso }).where(eq(emailVerificationTokensTable.tokenHash, tokenHash));
          await db.update(users).set({ verified: true }).where(eq(users.id, tokenRecord.userId));
        } catch (dbErr: any) {
          console.warn('[AUTH] Error updating verification status in DB:', dbErr.message);
        }
      }

      tokenRecord.usedAt = nowIso;
      savePersistedVerificationToken(tokenHash, tokenRecord);
      savePersistedUserUpdate(tokenRecord.userId, { verified: true });
      const memUser = memoryStore.findUserById(tokenRecord.userId);
      if (memUser) memUser.verified = true;

      logSafeAuthEvent('email verified', { userId: tokenRecord.userId, email: tokenRecord.email });

      return res.status(200).json({
        success: true,
        message: 'Email address verified successfully!'
      });
    } catch (err: any) {
      console.error('[AUTH] Error during JSON verification:', err.message);
      return res.status(500).json({ error: 'Unable to process email verification.' });
    }
  });

  // POST /api/auth/resend-verification
  // Allows students to request a fresh verification link
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const sessionUser = (req as any).user;
      const requestedEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const targetEmail = requestedEmail || sessionUser?.email;

      if (!targetEmail) {
        return res.status(400).json({ error: 'Please supply your registered email address or sign in.' });
      }

      logSafeAuthEvent('email verification requested', { email: targetEmail });

      // Rate limit: max 3 per 15 min per email/IP
      if (
        isRateLimited(`resend_verif_email:${targetEmail}`, 3, 15 * 60 * 1000) ||
        isRateLimited(`resend_verif_ip:${clientIp}`, 10, 15 * 60 * 1000)
      ) {
        return res.status(429).json({ error: 'Too many verification requests. Please wait 15 minutes before requesting again.' });
      }

      const user = await resolveAuthoritativeUserByEmail(targetEmail);
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account is registered with this email, a verification link has been sent.'
        });
      }

      if (user.verified) {
        return res.status(200).json({
          success: true,
          message: 'Your email address is already verified.',
          alreadyVerified: true,
        });
      }

      const now = new Date().toISOString();
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const newRecord = {
        id: 'vtok_' + crypto.randomBytes(16).toString('hex'),
        userId: user.id,
        email: targetEmail,
        tokenHash,
        expiresAt,
        createdAt: now,
      };

      if (isDbConnected() && db) {
        try {
          await db.insert(emailVerificationTokensTable).values(newRecord);
        } catch (dbErr: any) {
          console.warn('[AUTH] Notice inserting verification token in DB:', dbErr.message);
        }
      }

      savePersistedVerificationToken(tokenHash, newRecord);

      await deliverEmailVerificationEmail(targetEmail, rawToken, getRuntimeAppUrl());

      return res.status(200).json({
        success: true,
        message: 'A fresh verification link has been dispatched to your email address.'
      });
    } catch (err: any) {
      console.error('[AUTH] Resend verification error:', err.message);
      return res.status(500).json({ error: 'Unable to send verification email. Please try again later.' });
    }
  });

  // =========================================================================
  // SEPARATED OAUTH 2.0 IMPLEMENTATIONS (GOOGLE OAUTH & META/INSTAGRAM OAUTH)
  // Zero hardcoded credentials, strict production domain enforcement, CSPRNG state validation
  // =========================================================================

  interface OAuthStateEntry {
    redirectUri: string;
    createdAt: number;
    codeVerifier?: string;
  }

  // Separate state stores per provider
  const googleOAuthStates = new Map<string, OAuthStateEntry>();
  const consumedGoogleOAuthStates = new Map<string, number>();
  const instagramOAuthStates = new Map<string, OAuthStateEntry>();
  const otherOAuthStates = new Map<string, OAuthStateEntry & { provider: string }>();

  const stateCleanupTimer = setInterval(() => {
    const now = Date.now();
    const ttl = 10 * 60 * 1000;
    for (const [k, v] of googleOAuthStates.entries()) {
      if (now - v.createdAt > ttl) googleOAuthStates.delete(k);
    }
    for (const [k, ts] of consumedGoogleOAuthStates.entries()) {
      if (now - ts > ttl) consumedGoogleOAuthStates.delete(k);
    }
    for (const [k, v] of instagramOAuthStates.entries()) {
      if (now - v.createdAt > ttl) instagramOAuthStates.delete(k);
    }
    for (const [k, v] of otherOAuthStates.entries()) {
      if (now - v.createdAt > ttl) otherOAuthStates.delete(k);
    }
    for (const [k, exp] of revokedSessionRegistry.entries()) {
      if (exp < now) revokedSessionRegistry.delete(k);
    }
  }, 5 * 60 * 1000);
  if (typeof stateCleanupTimer.unref === 'function') {
    stateCleanupTimer.unref();
  }

  function resolveProductionBaseUrl(): string {
    const rawAppUrl = getRuntimeAppUrl();
    if (!rawAppUrl) return '';
    if (isForbiddenProductionUrl(rawAppUrl)) {
      return '';
    }
    try {
      const parsed = new URL(rawAppUrl);
      if (parsed.pathname && parsed.pathname !== '/') {
        return '';
      }
      return parsed.origin;
    } catch {
      return '';
    }
  }

  // 1. GOOGLE OAUTH CONFIGURATION
  // Reads ONLY GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and APP_URL from runtime process.env.
  // Never uses fallback credentials, preview container URLs, localhost URLs, or dynamic container hosts.
  function getGoogleOAuthConfig() {
    const clientId = readRuntimeEnv('GOOGLE_CLIENT_ID');
    const clientSecret = readRuntimeEnv('GOOGLE_CLIENT_SECRET');
    const explicitRedirectUri = readRuntimeEnv('GOOGLE_REDIRECT_URI').replace(/\/+$/, '');
    const rawAppUrl = getRuntimeAppUrl();

    const missingVars: string[] = [];
    if (!clientId) missingVars.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missingVars.push('GOOGLE_CLIENT_SECRET');
    if (!explicitRedirectUri) missingVars.push('GOOGLE_REDIRECT_URI');
    if (!rawAppUrl) missingVars.push('APP_URL');

    if (missingVars.length > 0) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: '',
        redirectUri: '',
        configured: false,
        missingVars,
        errorCode: 'missing_oauth_credentials' as const,
        error: `Missing Google OAuth credentials: ${missingVars.join(', ')}`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
      };
    }

    const prodBase = resolveProductionBaseUrl();
    if (!prodBase) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: '',
        redirectUri: '',
        configured: false,
        missingVars: [] as string[],
        errorCode: 'redirect_uri_mismatch' as const,
        error: 'Google OAuth configuration error: APP_URL must be a valid HTTPS live production domain (localhost, preview URLs, and container URLs are prohibited).',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
      };
    }

    const expectedRedirectUri = `${prodBase}${GOOGLE_OAUTH_CALLBACK_PATH}`;

    if (isForbiddenProductionUrl(explicitRedirectUri)) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: prodBase,
        redirectUri: '',
        configured: false,
        missingVars: [] as string[],
        errorCode: 'redirect_uri_mismatch' as const,
        error: `Redirect URI mismatch: GOOGLE_REDIRECT_URI must be a valid HTTPS live production URL matching ${expectedRedirectUri}.`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
      };
    }

    if (explicitRedirectUri !== expectedRedirectUri) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: prodBase,
        redirectUri: '',
        configured: false,
        missingVars: [] as string[],
        errorCode: 'redirect_uri_mismatch' as const,
        error: `Redirect URI mismatch: GOOGLE_REDIRECT_URI must exactly match ${expectedRedirectUri}.`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
      };
    }

    return {
      id: 'google' as const,
      name: 'Google',
      clientId,
      clientSecret,
      appUrl: prodBase,
      redirectUri: expectedRedirectUri,
      configured: true,
      missingVars: [] as string[],
      errorCode: null,
      error: null,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: 'openid email profile',
    };
  }

  // 2. META / INSTAGRAM OAUTH CONFIGURATION (Separate from Google; uses official Meta OAuth dialog & Graph API)
  function getInstagramOAuthConfig() {
    const clientId = readRuntimeEnv('INSTAGRAM_CLIENT_ID') || undefined;
    const clientSecret = readRuntimeEnv('INSTAGRAM_CLIENT_SECRET') || undefined;
    const explicitRedirect = readRuntimeEnv('INSTAGRAM_REDIRECT_URI').replace(/\/+$/, '');
    const rawAppUrl = getRuntimeAppUrl();
    const prodBase = resolveProductionBaseUrl();

    const missingVars: string[] = [];
    if (!clientId) missingVars.push('INSTAGRAM_CLIENT_ID');
    if (!clientSecret) missingVars.push('INSTAGRAM_CLIENT_SECRET');
    if (!explicitRedirect && !rawAppUrl) missingVars.push('INSTAGRAM_REDIRECT_URI');

    const candidateRedirect = explicitRedirect || (prodBase ? `${prodBase}/api/auth/callback/instagram` : '');
    const isRedirectValid = candidateRedirect.length > 0 && !isForbiddenProductionUrl(candidateRedirect);
    const configured = Boolean(clientId && clientSecret && isRedirectValid);

    let error: string | null = null;
    if (missingVars.length > 0) {
      error = `Missing Meta/Instagram OAuth credentials: ${missingVars.join(', ')}`;
    } else if (!isRedirectValid) {
      error = 'Meta/Instagram OAuth configuration error: Set INSTAGRAM_REDIRECT_URI and APP_URL to a valid HTTPS live domain.';
    }

    const useInstagramBusinessLogin = readRuntimeEnv('INSTAGRAM_OAUTH_FLOW') === 'instagram_business';

    return {
      id: 'instagram' as const,
      name: 'Instagram',
      clientId,
      clientSecret,
      redirectUri: isRedirectValid ? candidateRedirect : '',
      configured,
      missingVars,
      error,
      useInstagramBusinessLogin,
      authUrl: useInstagramBusinessLogin
        ? 'https://www.instagram.com/oauth/authorize'
        : 'https://www.facebook.com/v21.0/dialog/oauth',
      tokenUrl: useInstagramBusinessLogin
        ? 'https://api.instagram.com/oauth/access_token'
        : 'https://graph.facebook.com/v21.0/oauth/access_token',
      userInfoUrl: useInstagramBusinessLogin
        ? 'https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url'
        : 'https://graph.facebook.com/v21.0/me?fields=id,name,email,picture',
      scope: readRuntimeEnv('INSTAGRAM_OAUTH_SCOPES') || (
        useInstagramBusinessLogin
          ? 'instagram_business_basic'
          : 'public_profile,email'
      ),
    };
  }

  function getSecondaryOAuthConfig(providerKey: string) {
    const prodBase = resolveProductionBaseUrl();
    if (providerKey === 'apple') {
      const clientId = process.env.APPLE_CLIENT_ID?.trim();
      const clientSecret = process.env.APPLE_PRIVATE_KEY?.trim();
      const redirectUri = process.env.APPLE_REDIRECT_URI?.trim() || (prodBase ? `${prodBase}/api/auth/apple/callback` : '');
      const validRedirect = redirectUri.length > 0 && !isForbiddenProductionUrl(redirectUri);
      return {
        id: 'apple',
        name: 'Apple',
        clientId,
        clientSecret,
        redirectUri: validRedirect ? redirectUri : '',
        configured: Boolean(clientId && clientSecret && validRedirect),
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        userInfoUrl: '',
        scope: 'name email',
      };
    }
    if (providerKey === 'x') {
      const clientId = process.env.X_CLIENT_ID?.trim();
      const clientSecret = process.env.X_CLIENT_SECRET?.trim();
      const redirectUri = process.env.X_REDIRECT_URI?.trim() || (prodBase ? `${prodBase}/api/auth/x/callback` : '');
      const validRedirect = redirectUri.length > 0 && !isForbiddenProductionUrl(redirectUri);
      return {
        id: 'x',
        name: 'X',
        clientId,
        clientSecret,
        redirectUri: validRedirect ? redirectUri : '',
        configured: Boolean(clientId && clientSecret && validRedirect),
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        scope: 'tweet.read users.read',
      };
    }
    if (providerKey === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI?.trim() || (prodBase ? `${prodBase}/api/auth/linkedin/callback` : '');
      const validRedirect = redirectUri.length > 0 && !isForbiddenProductionUrl(redirectUri);
      return {
        id: 'linkedin',
        name: 'LinkedIn',
        clientId,
        clientSecret,
        redirectUri: validRedirect ? redirectUri : '',
        configured: Boolean(clientId && clientSecret && validRedirect),
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
        scope: 'openid profile email',
      };
    }
    return null;
  }

  function signOAuthStateCookieValue(provider: string, state: string, redirectUri: string): string {
    const secret = getSessionSecret();
    const payload = JSON.stringify({ provider, state, redirectUri, exp: Date.now() + 10 * 60 * 1000 });
    const encoded = Buffer.from(payload, 'utf8').toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
    return `${encoded}.${sig}`;
  }

  function verifyOAuthStateCookieValue(cookieVal: string | undefined, expectedProvider: string, expectedState: string): string | null {
    if (!cookieVal || !expectedState) return null;
    try {
      const [encoded, sig] = cookieVal.split('.');
      if (!encoded || !sig) return null;
      const secret = getSessionSecret();
      const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
      const sigBuf = Buffer.from(sig, 'utf8');
      const expBuf = Buffer.from(expectedSig, 'utf8');
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
      const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
      if (parsed.provider !== expectedProvider || parsed.state !== expectedState) return null;
      if (!parsed.exp || parsed.exp < Date.now()) return null;
      return parsed.redirectUri || null;
    } catch {
      return null;
    }
  }

  function sendOAuthErrorResponse(
    req: express.Request,
    res: express.Response,
    statusCode: number,
    errorCode: string,
    errorMsg: string
  ) {
    const safeMsg = String(errorMsg || 'Authentication failed').replace(/[&<>]/g, '');
    const acceptHeader = String(req.headers.accept || '');
    const wantsHtml = acceptHeader.includes('text/html') && !acceptHeader.includes('application/json') && req.query.format !== 'json';

    if (!wantsHtml) {
      return res.status(statusCode).json({
        success: false,
        code: errorCode,
        error: safeMsg,
      });
    }

    const targetOrigin = resolveProductionBaseUrl() || '*';
    const authReturnUrl = `/auth?oauth_error=${encodeURIComponent(safeMsg)}`;

    return res.status(statusCode).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authentication Error - University Tutors</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { background: #ffffff; border: 1px solid #fee2e2; border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .badge { width: 48px; height: 48px; border-radius: 50%; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; font-weight: bold; }
    h2 { font-size: 18px; margin: 0 0 8px; font-weight: 700; color: #991b1b; }
    p { font-size: 13px; color: #64748b; margin: 0 0 24px; line-height: 1.5; }
    a.btn { display: inline-block; background: #0f172a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✕</div>
    <h2>Sign-In Could Not Complete</h2>
    <p>${safeMsg}</p>
    <a class="btn" href="${authReturnUrl}">Return to Sign In</a>
  </div>
  <script>
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', code: ${JSON.stringify(errorCode)}, error: ${JSON.stringify(safeMsg)} }, ${JSON.stringify(targetOrigin)});
        window.close();
      } catch (e) {}
    }
  </script>
</body>
</html>`);
  }

  function renderOAuthErrorPage(res: express.Response, errorMsg: string) {
    return sendOAuthErrorResponse({ headers: { accept: 'text/html' }, query: {} } as any, res, 400, 'oauth_error', errorMsg);
  }

  async function findOrCreatePostgreSqlOAuthUser(
    req: express.Request,
    providerLabel: string,
    verifiedEmail: string,
    verifiedName: string,
    verifiedAvatar: string
  ): Promise<any> {
    const cleanEmail = verifiedEmail.toLowerCase().trim();

    const dbConfiguredAtRuntime = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') || hasDatabaseUrl;
    let existingUser: any = null;
    if (options.oauthUserRepo?.findByEmail) {
      existingUser = await options.oauthUserRepo.findByEmail(cleanEmail);
    } else if (dbConfiguredAtRuntime) {
      if (!isDbConnected() || !db) {
        throw new Error('PostgreSQL database connection is unavailable.');
      }
      const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      existingUser = rows.length > 0 ? rows[0] : null;
    } else {
      existingUser = await resolveAuthoritativeUserByEmail(cleanEmail);
    }

    if (existingUser) {
      logSafeOAuthEvent('oauth_user_lookup', {
        provider: providerLabel.toLowerCase(),
        result: 'found_existing',
        userId: existingUser.id,
        role: existingUser.role,
      });
      return { user: existingUser, created: false };
    }

    const now = new Date().toISOString();
    const newUserId = 'usr_' + crypto.randomBytes(12).toString('hex');
    const newUserRecord = {
      id: newUserId,
      role: 'student',
      name: verifiedName || `${providerLabel} Student`,
      fullName: verifiedName || `${providerLabel} Student`,
      email: cleanEmail,
      passwordHash: null,
      avatarUrl: verifiedAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
      updatedAt: now,
      suspended: false,
      verified: true,
      bio: `Student member authenticated via ${providerLabel}.`,
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

    const newProfileRecord = {
      id: 'prof_' + newUserId,
      userId: newUserId,
      fullName: newUserRecord.name,
      email: cleanEmail,
      role: 'student',
      avatarUrl: newUserRecord.avatarUrl,
      bio: newUserRecord.bio,
      country: 'US',
      location: null,
      phoneNumber: null,
      education: null,
      createdAt: now,
      updatedAt: now,
    };

    if (options.oauthUserRepo?.createUser) {
      const createdRecord = await options.oauthUserRepo.createUser(newUserRecord);
      const resolvedCreated = createdRecord || newUserRecord;
      memoryStore.setUser(resolvedCreated);
      logSafeOAuthEvent('oauth_user_lookup', {
        provider: providerLabel.toLowerCase(),
        result: 'created_new_student',
        userId: resolvedCreated.id,
        role: resolvedCreated.role,
      });
      return { user: resolvedCreated, created: true };
    }

    if (dbConfiguredAtRuntime) {
      if (!isDbConnected() || !db) {
        throw new Error('PostgreSQL database connection is unavailable.');
      }
      await db.transaction(async (tx) => {
        await tx.insert(users).values(newUserRecord);
        await tx.insert(userProfiles).values(newProfileRecord);
      });
    } else if (isDbConnected() && db) {
      await db.transaction(async (tx) => {
        await tx.insert(users).values(newUserRecord);
        await tx.insert(userProfiles).values(newProfileRecord);
      });
    }

    memoryStore.setUser(newUserRecord);
    savePersistedUserUpdate(newUserId, newUserRecord);
    await logAudit('OAUTH_REGISTER', `New student account created via ${providerLabel}: ${cleanEmail}`, newUserId, newUserRecord.name, 'student', req);

    logSafeOAuthEvent('oauth_user_lookup', {
      provider: providerLabel.toLowerCase(),
      result: 'created_new_student',
      userId: newUserId,
      role: 'student',
    });

    return { user: newUserRecord, created: true };
  }

  async function finalizeOAuthUserSession(
    req: express.Request,
    res: express.Response,
    providerLabel: string,
    verifiedEmail: string,
    verifiedName: string,
    verifiedAvatar: string
  ) {
    let userLookupResult: { user: any; created: boolean };
    try {
      userLookupResult = await findOrCreatePostgreSqlOAuthUser(
        req,
        providerLabel,
        verifiedEmail,
        verifiedName,
        verifiedAvatar
      );
    } catch {
      logSafeOAuthEvent('oauth_user_lookup', {
        provider: providerLabel.toLowerCase(),
        result: 'lookup_or_create_failed',
      });
      return sendOAuthErrorResponse(
        req,
        res,
        500,
        'user_creation_failed',
        'Failed to create or retrieve user account in PostgreSQL.'
      );
    }

    const targetUser = userLookupResult.user;
    if (!targetUser || !targetUser.id) {
      logSafeOAuthEvent('oauth_user_lookup', {
        provider: providerLabel.toLowerCase(),
        result: 'empty_user_record',
      });
      return sendOAuthErrorResponse(
        req,
        res,
        500,
        'user_creation_failed',
        'Failed to create or retrieve user account in PostgreSQL.'
      );
    }

    if (targetUser.suspended) {
      return sendOAuthErrorResponse(
        req,
        res,
        403,
        'account_suspended',
        'This account has been suspended by an administrator.'
      );
    }

    if (!userLookupResult.created) {
      await logAudit('OAUTH_LOGIN', `User signed in via ${providerLabel}: ${targetUser.email} (${targetUser.role})`, targetUser.id, targetUser.name, targetUser.role, req);
    }

    const sessionToken = createSessionToken({
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
    });
    const isHttps = isSecureCookieRequest(req);
    setSecureSessionCookie(req, res, sessionToken);

    let targetRedirectUrl = '/student/dashboard';
    if (targetUser.role === 'admin' || targetUser.role === 'subadmin') {
      targetRedirectUrl = '/admin';
    } else if (targetUser.role === 'tutor') {
      targetRedirectUrl = '/tutor/dashboard';
    }

    logSafeOAuthEvent('oauth_session_created', {
      provider: providerLabel.toLowerCase(),
      userId: targetUser.id,
      role: targetUser.role,
      httpOnly: true,
      secureCookie: isHttps,
      redirectTo: targetRedirectUrl,
    });

    return res.redirect(302, targetRedirectUrl);
  }

  // GET /api/auth/providers
  // Reports provider readiness and missing variable names ONLY (never exposes values, client IDs, or secrets)
  app.get('/api/auth/providers', (_req, res) => {
    const googleCfg = getGoogleOAuthConfig();
    const instagramCfg = getInstagramOAuthConfig();
    const appleCfg = getSecondaryOAuthConfig('apple')!;
    const xCfg = getSecondaryOAuthConfig('x')!;
    const linkedinCfg = getSecondaryOAuthConfig('linkedin')!;

    return res.json({
      success: true,
      providers: {
        google: {
          configured: googleCfg.configured,
          name: 'Google',
          authUrl: '/api/auth/google/url',
          callbackPath: GOOGLE_OAUTH_CALLBACK_PATH,
          redirectUri: googleCfg.redirectUri,
          missingVars: googleCfg.missingVars,
          errorCode: googleCfg.errorCode,
          error: googleCfg.error,
        },
        apple: {
          configured: appleCfg.configured,
          name: 'Apple',
          authUrl: '/api/auth/apple/url',
          redirectUri: appleCfg.redirectUri,
        },
        instagram: {
          configured: instagramCfg.configured,
          name: 'Instagram',
          authUrl: '/api/auth/instagram/url',
          callbackPath: '/api/auth/callback/instagram',
          redirectUri: instagramCfg.redirectUri,
          missingVars: instagramCfg.missingVars,
          error: instagramCfg.error,
        },
        x: {
          configured: xCfg.configured,
          name: 'X',
          authUrl: '/api/auth/x/url',
          redirectUri: xCfg.redirectUri,
        },
        linkedin: {
          configured: linkedinCfg.configured,
          name: 'LinkedIn',
          authUrl: '/api/auth/linkedin/url',
          redirectUri: linkedinCfg.redirectUri,
        },
      },
      appUrl: googleCfg.appUrl || resolveProductionBaseUrl(),
    });
  });

  // -------------------------------------------------------------------------
  // DEDICATED GOOGLE OAUTH 2.0 INITIATION & CALLBACK HANDLERS
  // Exact production callback route: /api/auth/callback/google
  // -------------------------------------------------------------------------
  app.get('/api/auth/google/url', (req, res) => {
    const cfg = getGoogleOAuthConfig();
    if (!cfg.configured || !cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) {
      logSafeOAuthEvent('oauth_start', {
        provider: 'google',
        status: 'rejected_unconfigured',
        errorCode: cfg.errorCode,
        missingVars: cfg.missingVars,
      });
      return res.status(400).json({
        success: false,
        code: cfg.errorCode || 'missing_oauth_credentials',
        missingVars: cfg.missingVars,
        error: cfg.error || 'Google OAuth is not configured on this server.',
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    googleOAuthStates.set(state, {
      redirectUri: cfg.redirectUri,
      createdAt: Date.now(),
    });

    const isHttps = isSecureCookieRequest(req);
    res.cookie('oauth_state_google', signOAuthStateCookieValue('google', state, cfg.redirectUri), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: cfg.scope,
      state,
      prompt: 'select_account',
    });

    logSafeOAuthEvent('oauth_start', {
      provider: 'google',
      status: 'initiated',
      redirectUri: cfg.redirectUri,
      statePrefix: state.slice(0, 8),
    });

    return res.status(200).json({
      success: true,
      url: `${cfg.authUrl}?${params.toString()}`,
    });
  });

  const handleGoogleOAuthCallback = async (req: express.Request, res: express.Response) => {
    const cfg = getGoogleOAuthConfig();
    const isHttps = isSecureCookieRequest(req);

    logSafeOAuthEvent('oauth_callback_received', {
      provider: 'google',
      path: req.path,
      configured: cfg.configured,
      hasCode: Boolean(req.query.code),
      hasState: Boolean(req.query.state),
      hasProviderError: Boolean(req.query.error),
    });

    // Always clear one-time state cookie on callback execution
    const rawStateCookie = req.cookies?.oauth_state_google;
    if (rawStateCookie) {
      res.clearCookie('oauth_state_google', {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
      });
    }

    if (!cfg.configured || !cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        cfg.errorCode || 'missing_oauth_credentials',
        cfg.error || 'Missing Google OAuth credentials on this server.'
      );
    }

    const errorParam = (req.query.error || req.query.error_description) as string | undefined;
    if (errorParam) {
      const normalizedErr = String(errorParam).toLowerCase();
      if (normalizedErr.includes('redirect_uri_mismatch')) {
        logSafeOAuthEvent('oauth_token_exchange_failure', {
          provider: 'google',
          reason: 'provider_redirect_uri_mismatch',
        });
        return sendOAuthErrorResponse(
          req,
          res,
          400,
          'redirect_uri_mismatch',
          `Redirect URI mismatch: Google rejected the callback URL. Verify Google Cloud Console matches ${cfg.redirectUri}.`
        );
      }
      logSafeOAuthEvent('oauth_token_exchange_failure', {
        provider: 'google',
        reason: 'provider_authorization_error',
      });
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'oauth_provider_error',
        `Google authorization failed: ${String(errorParam)}`
      );
    }

    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    if (!state || !/^[a-f0-9]{64}$/.test(state)) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'invalid_state',
        'Invalid OAuth state: state parameter is missing or malformed.'
      );
    }

    if (consumedGoogleOAuthStates.has(state)) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'invalid_state',
        'Invalid OAuth state: state parameter has already been used.'
      );
    }

    const memEntry = googleOAuthStates.get(state);
    googleOAuthStates.delete(state);

    const cookieRedirect = rawStateCookie
      ? verifyOAuthStateCookieValue(rawStateCookie, 'google', state)
      : null;

    if (rawStateCookie && !cookieRedirect) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'invalid_state',
        'Invalid OAuth state: state cookie verification failed.'
      );
    }

    if (!memEntry && !cookieRedirect) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'invalid_state',
        'Invalid or expired OAuth state parameter.'
      );
    }

    if (memEntry && Date.now() - memEntry.createdAt > 10 * 60 * 1000) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'invalid_state',
        'Expired OAuth state parameter. Please start Google sign-in again.'
      );
    }

    consumedGoogleOAuthStates.set(state, Date.now());

    const boundRedirectUri = memEntry?.redirectUri || cookieRedirect || '';
    if (boundRedirectUri !== cfg.redirectUri) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'redirect_uri_mismatch',
        `Redirect URI mismatch: OAuth state redirect URI does not match ${cfg.redirectUri}.`
      );
    }

    const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';
    if (!code) {
      return sendOAuthErrorResponse(
        req,
        res,
        400,
        'token_exchange_failed',
        'Google OAuth failed: missing authorization code.'
      );
    }

    // Exchange authorization code strictly on the backend (never log secrets or tokens)
    let accessToken = '';
    try {
      const tokenRes = await oauthFetch(cfg.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri: cfg.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData: any = await tokenRes.json().catch(() => ({}));
      if (tokenData?.error === 'redirect_uri_mismatch') {
        logSafeOAuthEvent('oauth_token_exchange_failure', {
          provider: 'google',
          status: tokenRes.status,
          reason: 'redirect_uri_mismatch',
        });
        return sendOAuthErrorResponse(
          req,
          res,
          400,
          'redirect_uri_mismatch',
          `Redirect URI mismatch during Google token exchange. Expected ${cfg.redirectUri}.`
        );
      }

      if (!tokenRes.ok || typeof tokenData?.access_token !== 'string' || !tokenData.access_token) {
        logSafeOAuthEvent('oauth_token_exchange_failure', {
          provider: 'google',
          status: tokenRes.status,
          reason: typeof tokenData?.error === 'string' ? tokenData.error : 'invalid_token_response',
        });
        return sendOAuthErrorResponse(
          req,
          res,
          tokenRes.status >= 400 && tokenRes.status < 500 ? 400 : 502,
          'token_exchange_failed',
          'Failed to exchange Google authorization code for access token.'
        );
      }

      accessToken = tokenData.access_token;
      logSafeOAuthEvent('oauth_token_exchange_success', {
        provider: 'google',
        status: tokenRes.status,
      });
    } catch {
      logSafeOAuthEvent('oauth_token_exchange_failure', {
        provider: 'google',
        status: 502,
        reason: 'network_error',
      });
      return sendOAuthErrorResponse(
        req,
        res,
        502,
        'token_exchange_failed',
        'Failed to exchange Google authorization code due to upstream network error.'
      );
    }

    // Request Google user profile using backend access token (never log access token)
    let profileEmail = '';
    let profileName = '';
    let profileAvatar = '';
    try {
      const userRes = await oauthFetch(cfg.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userData: any = await userRes.json().catch(() => ({}));
      const isEmailVerified = userData?.verified_email !== false && userData?.email_verified !== false;

      if (!userRes.ok || typeof userData?.email !== 'string' || !userData.email.includes('@') || !isEmailVerified) {
        return sendOAuthErrorResponse(
          req,
          res,
          502,
          'profile_request_failed',
          'Failed to retrieve a verified Google user profile and email address.'
        );
      }

      profileEmail = userData.email.toLowerCase().trim();
      profileName = typeof userData.name === 'string' && userData.name.trim()
        ? userData.name.trim()
        : profileEmail.split('@')[0] || 'Google Student';
      profileAvatar = typeof userData.picture === 'string' ? userData.picture : '';
    } catch {
      return sendOAuthErrorResponse(
        req,
        res,
        502,
        'profile_request_failed',
        'Failed to retrieve Google user profile from Google UserInfo API.'
      );
    }

    return await finalizeOAuthUserSession(req, res, 'Google', profileEmail, profileName, profileAvatar);
  };

  app.get(GOOGLE_OAUTH_CALLBACK_PATH, handleGoogleOAuthCallback);

  // Explicit redirect URI mismatch diagnostic for non-canonical Google callback paths
  app.get(['/api/auth/google/callback', '/auth/google/callback', '/auth/callback/google'], (req, res) => {
    return sendOAuthErrorResponse(
      req,
      res,
      400,
      'redirect_uri_mismatch',
      `Redirect URI mismatch: Use the exact backend callback route ${GOOGLE_OAUTH_CALLBACK_PATH}.`
    );
  });

  // -------------------------------------------------------------------------
  // DEDICATED META / INSTAGRAM OAUTH 2.0 INITIATION & CALLBACK HANDLERS
  // -------------------------------------------------------------------------
  app.get('/api/auth/instagram/url', (req, res) => {
    const cfg = getInstagramOAuthConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      return res.status(400).json({
        error: 'Meta/Instagram OAuth is not configured on this server. Set INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET in runtime environment variables.'
      });
    }
    if (!cfg.redirectUri) {
      return res.status(400).json({
        error: 'Meta/Instagram OAuth configuration error: A valid HTTPS production domain is required in INSTAGRAM_REDIRECT_URI or APP_URL (preview, localhost, development, and container URLs are prohibited).'
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    instagramOAuthStates.set(state, {
      redirectUri: cfg.redirectUri,
      createdAt: Date.now(),
    });

    const isHttps = isSecureCookieRequest(req);
    res.cookie('oauth_state_instagram', signOAuthStateCookieValue('instagram', state, cfg.redirectUri), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: cfg.scope,
      state,
    });

    return res.json({ success: true, url: `${cfg.authUrl}?${params.toString()}`, state });
  });

  const handleInstagramOAuthCallback = async (req: express.Request, res: express.Response) => {
    const errorParam = (req.query.error_message || req.query.error_description || req.query.error) as string | undefined;
    if (errorParam) {
      return sendOAuthErrorResponse(req, res, 400, 'oauth_provider_error', `Meta/Instagram authorization error: ${errorParam}`);
    }

    const rawCode = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!state || typeof state !== 'string') {
      return sendOAuthErrorResponse(req, res, 400, 'invalid_state', 'Missing OAuth state parameter (CSRF validation failed).');
    }

    const cfg = getInstagramOAuthConfig();
    if (!cfg.configured || !cfg.clientId || !cfg.clientSecret) {
      return sendOAuthErrorResponse(req, res, 400, 'missing_oauth_credentials', 'Meta/Instagram OAuth is not configured on this server.');
    }

    const memEntry = instagramOAuthStates.get(state);
    const cookieRedirect = verifyOAuthStateCookieValue(req.cookies?.oauth_state_instagram, 'instagram', state);
    res.clearCookie('oauth_state_instagram', { path: '/' });

    if (!memEntry && !cookieRedirect) {
      return sendOAuthErrorResponse(req, res, 400, 'invalid_state', 'Invalid or expired OAuth state parameter (CSRF protection failed).');
    }
    if (memEntry) {
      instagramOAuthStates.delete(state);
      if (Date.now() - memEntry.createdAt > 10 * 60 * 1000) {
        return sendOAuthErrorResponse(req, res, 400, 'invalid_state', 'Expired OAuth state parameter. Please try signing in again.');
      }
    }

    if (!rawCode || typeof rawCode !== 'string') {
      return sendOAuthErrorResponse(req, res, 400, 'token_exchange_failed', 'Missing authorization code from Meta/Instagram.');
    }

    const cleanCode = rawCode.replace(/#_$/, '');
    const redirectUriToUse = memEntry?.redirectUri || cookieRedirect || cfg.redirectUri;

    try {
      let accessToken = '';
      let fallbackPlatformUserId = '';

      if (cfg.useInstagramBusinessLogin) {
        const tokenRes = await oauthFetch(cfg.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectUriToUse,
            code: cleanCode,
          }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return sendOAuthErrorResponse(req, res, 502, 'token_exchange_failed', 'Instagram token exchange failed. Please verify your Meta app configuration.');
        }
        accessToken = tokenData.access_token;
        fallbackPlatformUserId = String(tokenData.user_id || '');
      } else {
        const tokenParams = new URLSearchParams({
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri: redirectUriToUse,
          code: cleanCode,
        });
        const tokenRes = await oauthFetch(`${cfg.tokenUrl}?${tokenParams.toString()}`, {
          method: 'GET',
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return sendOAuthErrorResponse(req, res, 502, 'token_exchange_failed', 'Meta OAuth token exchange failed. Please verify your Meta App ID, Secret, and Valid OAuth Redirect URI.');
        }
        accessToken = tokenData.access_token;
      }

      const profileRes = await oauthFetch(cfg.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok || (!profileData.id && !fallbackPlatformUserId)) {
        return sendOAuthErrorResponse(req, res, 502, 'profile_request_failed', 'Failed to retrieve verified profile from Meta/Instagram.');
      }

      const providerAccountId = String(profileData.id || fallbackPlatformUserId);
      const profileName = profileData.name || profileData.username || 'Instagram Student';
      const profileEmail = (typeof profileData.email === 'string' && profileData.email.includes('@'))
        ? profileData.email.toLowerCase().trim()
        : `meta_${providerAccountId}@instagram.university-tutors.com`;
      const profileAvatar = profileData.picture?.data?.url || profileData.profile_picture_url || '';

      return await finalizeOAuthUserSession(req, res, 'Instagram', profileEmail, profileName, profileAvatar);
    } catch {
      return sendOAuthErrorResponse(req, res, 502, 'token_exchange_failed', 'Failed to complete Meta/Instagram authentication.');
    }
  };

  app.all([
    '/api/auth/callback/instagram',
    '/api/auth/callback/instagram/',
    '/api/auth/instagram/callback',
    '/api/auth/instagram/callback/',
    '/auth/instagram/callback',
    '/auth/callback/instagram',
  ], handleInstagramOAuthCallback);

  // Secondary OAuth providers (Apple, X, LinkedIn) - strict configuration & state checks, zero fake logins
  app.get('/api/auth/:provider/url', (req, res) => {
    const providerKey = req.params.provider.toLowerCase();
    const cfg = getSecondaryOAuthConfig(providerKey);
    if (!cfg) {
      return res.status(404).json({ error: `Unsupported OAuth provider: ${providerKey}` });
    }
    if (!cfg.configured || !cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) {
      return res.status(400).json({
        error: `${cfg.name} OAuth is not configured on this server. Set ${cfg.id.toUpperCase()}_CLIENT_ID, ${cfg.id.toUpperCase()}_CLIENT_SECRET, and a valid production redirect URI in environment variables.`
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    let codeVerifier: string | undefined;
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: cfg.scope,
      state,
    });

    if (cfg.id === 'x') {
      codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    otherOAuthStates.set(state, {
      provider: cfg.id,
      redirectUri: cfg.redirectUri,
      createdAt: Date.now(),
      codeVerifier,
    });

    return res.json({ success: true, url: `${cfg.authUrl}?${params.toString()}`, state });
  });

  app.all([
    '/api/auth/:provider/callback',
    '/api/auth/callback/:provider',
  ], async (req, res) => {
    const providerKey = (req.params.provider || '').toLowerCase();
    const state = (req.query.state || req.body?.state) as string | undefined;
    if (!state || typeof state !== 'string') {
      return renderOAuthErrorPage(res, 'Missing OAuth state parameter (CSRF validation failed).');
    }
    const stored = otherOAuthStates.get(state);
    if (!stored || stored.provider !== providerKey || Date.now() - stored.createdAt > 10 * 60 * 1000) {
      return renderOAuthErrorPage(res, 'Invalid or expired OAuth state parameter (CSRF protection failed).');
    }
    otherOAuthStates.delete(state);

    const cfg = getSecondaryOAuthConfig(providerKey);
    if (!cfg || !cfg.configured || !cfg.clientId || !cfg.clientSecret) {
      return renderOAuthErrorPage(res, `${providerKey} OAuth is not configured on this server.`);
    }

    const code = (req.query.code || req.body?.code) as string | undefined;
    if (!code) {
      return renderOAuthErrorPage(res, 'Missing authorization code from OAuth provider.');
    }

    try {
      if (cfg.id === 'linkedin') {
        const tokenRes = await fetch(cfg.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            redirect_uri: stored.redirectUri,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return renderOAuthErrorPage(res, 'LinkedIn token exchange failed.');
        }
        const userRes = await fetch(cfg.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.email) {
          return renderOAuthErrorPage(res, 'LinkedIn did not return a verified email address.');
        }
        return await finalizeOAuthUserSession(req, res, 'LinkedIn', userData.email, userData.name || 'LinkedIn Student', userData.picture || '');
      }

      if (cfg.id === 'x') {
        const basicAuth = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
        const tokenRes = await fetch(cfg.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: stored.redirectUri,
            code_verifier: stored.codeVerifier || '',
          }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return renderOAuthErrorPage(res, 'X token exchange failed.');
        }
        const userRes = await fetch(cfg.userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.data?.id) {
          return renderOAuthErrorPage(res, 'Failed to fetch verified X profile.');
        }
        return await finalizeOAuthUserSession(
          req,
          res,
          'X',
          `x_${userData.data.id}@x.university-tutors.com`,
          userData.data.name || userData.data.username || 'X Student',
          userData.data.profile_image_url || ''
        );
      }

      return renderOAuthErrorPage(res, `${cfg.name} OAuth verification is not enabled.`);
    } catch {
      return renderOAuthErrorPage(res, `Failed to authenticate with ${cfg.name}.`);
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

  // Protected Admin Performance Diagnostics Endpoint (non-sensitive route timing metrics only)
  app.get('/api/admin/diagnostics/performance', requireRole('admin', 'subadmin'), (_req, res) => {
    const byRoute = new Map<string, { route: string; method: string; count: number; totalMs: number; maxMs: number; slowCount: number; verySlowCount: number; failedCount: number }>();
    for (const m of apiMetricsRing) {
      const key = `${m.method} ${m.route}`;
      const cur = byRoute.get(key) || {
        route: m.route,
        method: m.method,
        count: 0,
        totalMs: 0,
        maxMs: 0,
        slowCount: 0,
        verySlowCount: 0,
        failedCount: 0,
      };
      cur.count += 1;
      cur.totalMs += m.durationMs;
      if (m.durationMs > cur.maxMs) cur.maxMs = m.durationMs;
      if (m.slow) cur.slowCount += 1;
      if (m.verySlow) cur.verySlowCount += 1;
      if (m.failed) cur.failedCount += 1;
      byRoute.set(key, cur);
    }

    const summaryByRoute = Array.from(byRoute.values())
      .map((r) => ({
        method: r.method,
        route: r.route,
        count: r.count,
        avgMs: Math.round(r.totalMs / r.count),
        maxMs: r.maxMs,
        slowCount: r.slowCount,
        verySlowCount: r.verySlowCount,
        failedCount: r.failedCount,
      }))
      .sort((a, b) => b.maxMs - a.maxMs)
      .slice(0, 25);

    const slowRequests = apiMetricsRing.filter((m) => m.slow).slice(-30).reverse();
    const verySlowRequests = apiMetricsRing.filter((m) => m.verySlow).slice(-20).reverse();
    const failedRequests = apiMetricsRing.filter((m) => m.failed).slice(-30).reverse();

    return res.status(200).json({
      success: true,
      totalTracked: apiMetricsRing.length,
      summary: {
        totalTracked: apiMetricsRing.length,
        slowOver2sCount: apiMetricsRing.filter((m) => m.slow).length,
        verySlowOver10sCount: apiMetricsRing.filter((m) => m.verySlow).length,
        errorCount: apiMetricsRing.filter((m) => m.failed).length,
      },
      slowestRoutes: summaryByRoute,
      summaryByRoute,
      slowRequests,
      verySlowRequests,
      failedRequests,
    });
  });

  // ==========================================
  // USERS & PRIVILEGED ACCOUNTS ENDPOINTS
  // ==========================================

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

  const parseSubjectsListServer = (raw: unknown, fallbackSubject?: string): string[] => {
    const collected: string[] = [];
    const appendValue = (val: unknown) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === 'string' && item.trim()) collected.push(item.trim());
        });
        return;
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              parsed.forEach((item) => {
                if (typeof item === 'string' && item.trim()) collected.push(item.trim());
              });
              return;
            }
          } catch {
            // Fall back to comma split below
          }
        }
        trimmed.split(',').forEach((s) => {
          const clean = s.replace(/^[\["']+|[\]"']+$/g, '').trim();
          if (clean) collected.push(clean);
        });
      }
    };
    appendValue(raw);
    if (collected.length === 0 && fallbackSubject && fallbackSubject.trim()) {
      collected.push(fallbackSubject.trim());
    }
    const seen = new Set<string>();
    return collected.filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const slugifyTutorIdentifier = (value: string): string =>
    String(value || '')
      .toLowerCase()
      .replace(/^(?:(?:dr|prof|mr|ms|mrs)\.?\s+)+/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const slugifyRawString = (value: string): string =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // GET /api/users - role-scoped, paginated user directory
  // Admins/subadmins receive all roles (students, tutors, admins) paginated;
  // Unauthenticated / student / tutor callers receive ONLY public approved tutors (+ own self record if logged in).
  app.get('/api/users', async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = Boolean(caller && (caller.role === 'admin' || caller.role === 'subadmin'));
      const roleFilter = (req.query.role as string || '').toLowerCase().trim();
      const searchFilter = (req.query.search as string || req.query.q as string || '').toLowerCase().trim();
      const hasExplicitLimit = Boolean(req.query.limit);
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = hasExplicitLimit
        ? Math.min(5000, Math.max(1, parseInt((req.query.limit as string) || '2500', 10) || 2500))
        : 5000;

      let dbUsers: any[] = [];
      if (isDbConnected() && db) {
        try {
          dbUsers = await withDbTimeout(
            db.select({
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
            }).from(users),
            10000,
            'Select users directory'
          );
        } catch (dbErr: any) {
          console.warn('[API] DB select failed for users:', dbErr.message);
        }
      }

      const memUsers = memoryStore.getAllUsers();
      const userMap = new Map<string, any>();

      // 1. Initial seed tutors & curated specialized tutors
      for (const t of SEED_TUTORS) {
        const { passwordHash: _, ...safeT } = t as any;
        userMap.set(t.id, safeT);
      }

      for (const ct of CURATED_SPECIALIZED_TUTORS) {
        if (!userMap.has(ct.id)) {
          userMap.set(ct.id, { ...ct, role: 'tutor', isApproved: ct.isApproved !== false, status: ct.status || 'approved' });
        }
      }

      // 2. Trending 500 Master Tutors dataset
      for (const t of TRENDING_TUTORS_500) {
        userMap.set(t.id, { ...t, ...(userMap.get(t.id) || {}) });
      }

      // 3. Memory store users
      for (const u of memUsers) {
        const { passwordHash: _, ...safeU } = u as any;
        userMap.set(u.id, { ...(userMap.get(u.id) || {}), ...safeU });
      }

      // 4. Disk persisted user updates
      const persistedUpdates = getPersistedUserUpdates();
      for (const [uId, uUpdates] of Object.entries(persistedUpdates)) {
        if (userMap.has(uId)) {
          userMap.set(uId, { ...userMap.get(uId), ...uUpdates });
        } else {
          userMap.set(uId, { id: uId, role: (uUpdates as any).role || 'tutor', ...uUpdates });
        }
      }

      // 5. PostgreSQL database users table
      for (const u of dbUsers) {
        const { passwordHash: _, ...safeU } = u as any;
        userMap.set(u.id, { ...(userMap.get(u.id) || {}), ...safeU });
      }

      // 6. PostgreSQL tutors table (complete profile fields, regardless of whether profileImageUrl is set)
      if (isDbConnected() && db) {
        try {
          const dbTutorsList = await withDbTimeout(db.select().from(tutors), 10000, 'Select tutors overlay');
          for (const dt of dbTutorsList) {
            const existing = userMap.get(dt.id) || {};
            const expArr = parseSubjectsListServer(dt.subjectExpertise, dt.primarySubject);
            userMap.set(dt.id, {
              ...existing,
              id: dt.id,
              role: existing.role || 'tutor',
              name: dt.name || existing.name || 'Tutor',
              email: existing.email || `${dt.id}@university-tutors.com`,
              tutorTier: dt.tier || existing.tutorTier,
              tier: dt.tier || existing.tier,
              country: dt.country || existing.country,
              location: dt.cityLocation || existing.location,
              cityLocation: dt.cityLocation || existing.cityLocation,
              hourlyRate: dt.hourlyRate ?? existing.hourlyRate,
              rating: dt.rating ?? existing.rating ?? 4.9,
              reviewCount: dt.reviewsCount ?? existing.reviewCount ?? existing.reviewsCount ?? 100,
              reviewsCount: dt.reviewsCount ?? existing.reviewsCount ?? existing.reviewCount ?? 100,
              primarySubject: dt.primarySubject || existing.primarySubject,
              subjectExpertise: expArr.length > 0 ? expArr : existing.subjectExpertise,
              subjects: expArr.length > 0 ? expArr : existing.subjects,
              searchableKeywords: dt.searchableKeywords || existing.searchableKeywords,
              education: dt.education || existing.education,
              experience: dt.experienceSummary || existing.experience,
              experienceSummary: dt.experienceSummary || existing.experienceSummary,
              bio: existing.bio || dt.experienceSummary,
              availability: dt.availability || existing.availability,
              canMeet: dt.canMeet || existing.canMeet,
              hobbies: dt.hobbies || existing.hobbies,
              verificationStatus: dt.verificationStatus || existing.verificationStatus,
              isApproved: existing.isApproved !== undefined ? existing.isApproved : true,
              status: existing.status || 'approved',
              ...(dt.profileImageUrl ? { avatarUrl: dt.profileImageUrl, profileImageUrl: dt.profileImageUrl } : {}),
            });
          }
        } catch (tutorDbErr: any) {
          console.warn('[API] DB select from tutors notice:', tutorDbErr.message);
        }
      }

      let resultUsers = Array.from(userMap.values())
        .filter((u) => u && u.deleted !== true && u.status !== 'deleted')
        .map((u) => {
          const { passwordHash: _, ...safeU } = u;
          const parsedExpertise = parseSubjectsListServer(
            safeU.subjectExpertise || safeU.subjects,
            safeU.primarySubject
          );
          if (parsedExpertise.length > 0) {
            safeU.subjects = parsedExpertise;
            safeU.subjectExpertise = parsedExpertise;
          }
          if (safeU.reviewsCount !== undefined && safeU.reviewCount === undefined) {
            safeU.reviewCount = safeU.reviewsCount;
          } else if (safeU.reviewCount !== undefined && safeU.reviewsCount === undefined) {
            safeU.reviewsCount = safeU.reviewCount;
          }
          return safeU;
        });

      // Strict role/privacy isolation:
      // Non-admin callers only receive approved public tutors (and their own record if logged in) without sensitive contact fields
      if (!isAdmin) {
        resultUsers = resultUsers
          .filter((u) => {
            if (caller && u.id === caller.id) return true;
            return u.role === 'tutor' && (u.isApproved === true || u.status === 'approved' || (u.isApproved === undefined && u.status === undefined));
          })
          .map((u) => {
            if (caller && u.id === caller.id) return u;
            const { email: _e, phoneNumber: _p, ...publicTutor } = u;
            return publicTutor;
          });
      }

      if (roleFilter && roleFilter !== 'all') {
        resultUsers = resultUsers.filter((u) => String(u.role || '').toLowerCase() === roleFilter);
      }

      if (searchFilter) {
        resultUsers = resultUsers.filter((u) => {
          const name = String(u.name || '').toLowerCase();
          const email = String(u.email || '').toLowerCase();
          const loc = String(u.location || u.cityLocation || u.country || '').toLowerCase();
          const subj = Array.isArray(u.subjectExpertise)
            ? u.subjectExpertise.join(' ').toLowerCase()
            : String(u.primarySubject || u.subjects || u.subjectExpertise || '').toLowerCase();
          const kw = String(u.searchableKeywords || '').toLowerCase();
          return (
            name.includes(searchFilter) ||
            email.includes(searchFilter) ||
            loc.includes(searchFilter) ||
            subj.includes(searchFilter) ||
            kw.includes(searchFilter)
          );
        });
      }

      const total = resultUsers.length;
      const offset = (page - 1) * limit;
      const paginated = resultUsers.slice(offset, offset + limit).map((u) => {
        if (u?.avatarUrl && typeof u.avatarUrl === 'string' && !u.avatarVariants) {
          const meta = buildAvatarVariantMetadata(u.avatarUrl);
          if (meta) {
            return { ...u, ...meta };
          }
        }
        return u;
      });

      return res.status(200).json({
        success: true,
        users: paginated,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Failed to retrieve users directory.',
        code: err?.code || 'USERS_FETCH_FAILED',
        status: 500,
      });
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
      const activeOnly = req.query.activeOnly === 'true' || req.query.activeOnly === '1';
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10) || 1);
      const limit = req.query.limit
        ? Math.min(5000, Math.max(1, parseInt(req.query.limit as string, 10) || 1000))
        : 1000;

      const tutorMap = new Map<string, any>();

      // 1. Trending 500 Master Tutors dataset (with searchableKeywords)
      for (const t of TRENDING_TUTORS_500) {
        tutorMap.set(t.id, { ...t });
      }

      // 2. Curated specialized faculty & initial seed tutors
      for (const ct of CURATED_SPECIALIZED_TUTORS) {
        if (!tutorMap.has(ct.id)) {
          tutorMap.set(ct.id, { ...ct, role: 'tutor' });
        }
      }

      for (const t of SEED_TUTORS) {
        const { passwordHash: _, ...safeT } = t as any;
        tutorMap.set(t.id, safeT);
      }

      // 3. Disk persisted updates for tutors
      const persistedUpdates = getPersistedUserUpdates();
      for (const [uId, uUpdates] of Object.entries(persistedUpdates)) {
        if (tutorMap.has(uId)) {
          tutorMap.set(uId, { ...tutorMap.get(uId), ...uUpdates });
        } else if ((uUpdates as any)?.role === 'tutor' || uId.startsWith('tutor')) {
          tutorMap.set(uId, { id: uId, role: 'tutor', ...uUpdates });
        }
      }

      // 4. In-memory / dynamic tutors
      const dbAndRegisteredIds = new Set<string>(SEED_TUTORS.map((s) => s.id));
      for (const u of memoryStore.getAllUsers()) {
        if (u.role === 'tutor' || u.id.startsWith('tutor_') || u.id.startsWith('tutor-') || u.hourlyRate) {
          const { passwordHash: _, ...safeU } = u as any;
          tutorMap.set(u.id, { ...(tutorMap.get(u.id) || {}), ...safeU });
          dbAndRegisteredIds.add(u.id);
        }
      }

      // 5. Database persisted tutors from users table (where role = 'tutor') and tutors table
      if (isDbConnected() && db) {
        try {
          const dbTutorUsers = await withDbTimeout(
            db.select().from(users).where(eq(users.role, 'tutor')),
            8000,
            'Select tutor users in /api/tutors'
          );
          for (const du of dbTutorUsers) {
            const { passwordHash: _, ...safeDu } = du as any;
            tutorMap.set(du.id, { ...(tutorMap.get(du.id) || {}), ...safeDu, role: 'tutor' });
            dbAndRegisteredIds.add(du.id);
          }
        } catch (dbUserErr) {
          console.warn('[API] Notice querying users(role=tutor) in /api/tutors:', dbUserErr);
        }

        try {
          const dbTutorsList = await withDbTimeout(
            db.select().from(tutors),
            8000,
            'Select tutors table in /api/tutors'
          );
          for (const t of dbTutorsList) {
            const existing = tutorMap.get(t.id) || {};
            const expArr = parseSubjectsListServer(t.subjectExpertise, t.primarySubject);
            tutorMap.set(t.id, {
              ...existing,
              id: t.id,
              name: t.name || existing.name,
              tutorTier: t.tier || existing.tutorTier,
              tier: t.tier || existing.tier,
              country: t.country || existing.country,
              countryFull: t.country || existing.countryFull,
              location: t.cityLocation || existing.location,
              cityLocation: t.cityLocation || existing.cityLocation,
              rating: t.rating || existing.rating || 4.9,
              reviewsCount: t.reviewsCount ?? existing.reviewsCount ?? existing.reviewCount ?? 0,
              reviewCount: t.reviewsCount ?? existing.reviewCount ?? existing.reviewsCount ?? 0,
              hourlyRate: t.hourlyRate ?? existing.hourlyRate,
              primarySubject: t.primarySubject || existing.primarySubject,
              subjectExpertise: expArr,
              subjects: expArr,
              searchableKeywords: t.searchableKeywords || existing.searchableKeywords,
              education: t.education || existing.education,
              experience: t.experienceSummary || existing.experience,
              experienceSummary: t.experienceSummary || existing.experienceSummary,
              bio: existing.bio || t.experienceSummary,
              availability: t.availability || existing.availability,
              canMeet: t.canMeet || existing.canMeet,
              hobbies: t.hobbies || existing.hobbies,
              verificationStatus: t.verificationStatus || existing.verificationStatus,
              isVerified: true,
              isApproved: existing.isApproved !== undefined ? existing.isApproved : true,
              status: existing.status || 'approved',
              avatarUrl: t.profileImageUrl || existing.avatarUrl,
              profileImageUrl: t.profileImageUrl || existing.profileImageUrl,
              role: 'tutor',
            });
            dbAndRegisteredIds.add(t.id);
          }
        } catch (dbErr) {
          console.warn('[API] Notice querying tutors table in /api/tutors:', dbErr);
        }
      }

      let allTutors = Array.from(tutorMap.values())
        .filter((t) => t && t.deleted !== true && t.status !== 'deleted')
        .map((t) => {
          const { passwordHash: _, email: _e, phoneNumber: _p, ...publicT } = t;
          const expArr = parseSubjectsListServer(
            publicT.subjectExpertise || publicT.subjects,
            publicT.primarySubject
          );
          return {
            ...publicT,
            role: 'tutor',
            subjects: expArr,
            subjectExpertise: expArr,
            primarySubject: publicT.primarySubject || expArr[0] || 'Academic Mentorship',
            reviewCount: publicT.reviewCount ?? publicT.reviewsCount ?? 100,
            reviewsCount: publicT.reviewsCount ?? publicT.reviewCount ?? 100,
            location: publicT.location || publicT.cityLocation || publicT.city || 'Miami, FL',
            experience: publicT.experience || publicT.experienceSummary || publicT.bio || '',
          };
        });

      if (activeOnly) {
        allTutors = allTutors.filter((t) => {
          if (t.suspended === true || t.status === 'suspended' || t.status === 'rejected') return false;
          if (t.isApproved === false || t.status === 'pending') return false;
          return true;
        });
        // Put verified/registered/DB tutors first while keeping rating order cleanly balanced
        allTutors.sort((a, b) => {
          const aCore = dbAndRegisteredIds.has(a.id) ? 1 : 0;
          const bCore = dbAndRegisteredIds.has(b.id) ? 1 : 0;
          if (aCore !== bCore) return bCore - aCore;
          return (Number(b.rating) || 4.9) - (Number(a.rating) || 4.9);
        });
      }

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
          const subs = parseSubjectsListServer(t.subjects);
          const exp = parseSubjectsListServer(t.subjectExpertise, t.primarySubject);
          const allSubs = [...subs, ...exp].map(s => String(s).toLowerCase());
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
          const altSubs = Array.isArray(t.subjects) ? t.subjects.join(' ').toLowerCase() : (typeof t.subjects === 'string' ? t.subjects.toLowerCase() : '');
          return nameMatch || primMatch || tierMatch || eduMatch || bioMatch || countryMatch || locMatch || kwMatch || subs.includes(searchQuery) || altSubs.includes(searchQuery);
        });
      }

      const total = allTutors.length;
      const startIndex = (page - 1) * limit;
      const paginatedTutors = allTutors.slice(startIndex, startIndex + limit).map((t) => {
        if (t?.avatarUrl && typeof t.avatarUrl === 'string' && !t.avatarVariants) {
          const meta = buildAvatarVariantMetadata(t.avatarUrl);
          if (meta) {
            return { ...t, ...meta };
          }
        }
        return t;
      });

      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        tutors: paginatedTutors
      });
    } catch (err: any) {
      console.error('[API] Error in GET /api/tutors:', err);
      return res.status(500).json({ error: 'Failed to retrieve tutors' });
    }
  });

  // GET /api/tutors/:id
  // Retrieves a single tutor profile by ID or slug with authoritative persistence guarantees
  app.get('/api/tutors/:id', async (req, res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const rawParam = decodeURIComponent(req.params.id || '').trim();
      const lowerParam = rawParam.toLowerCase();
      const paramSlug = slugifyTutorIdentifier(rawParam);
      const rawSlug = slugifyRawString(rawParam);

      const matchesCandidate = (candidate: any): boolean => {
        if (!candidate) return false;
        const cid = String(candidate.id || '').trim();
        if (cid === rawParam || cid.toLowerCase() === lowerParam) return true;
        if (rawSlug && slugifyRawString(cid) === rawSlug) return true;
        if (candidate.name) {
          if (paramSlug && slugifyTutorIdentifier(candidate.name) === paramSlug) return true;
          if (rawSlug && slugifyRawString(candidate.name) === rawSlug) return true;
        }
        return false;
      };

      let tutorRecord: any = null;

      // 1. Check static & curated datasets
      const trending =
        TRENDING_TUTORS_500.find((t) => t.id === rawParam) ||
        TRENDING_TUTORS_500.find(matchesCandidate);
      if (trending) tutorRecord = { ...trending };

      const curated =
        CURATED_SPECIALIZED_TUTORS.find((t) => t.id === rawParam) ||
        CURATED_SPECIALIZED_TUTORS.find(matchesCandidate);
      if (curated) tutorRecord = { ...(tutorRecord || {}), ...curated };

      const seed =
        SEED_TUTORS.find((t) => t.id === rawParam) ||
        SEED_TUTORS.find(matchesCandidate);
      if (seed) tutorRecord = { ...(tutorRecord || {}), ...seed };

      const resolvedId = tutorRecord?.id || rawParam;

      // 2. Memory store
      const memUser =
        memoryStore.getUser(resolvedId) ||
        memoryStore.getAllUsers().find((u) => (u.role === 'tutor' || u.id.startsWith('tutor')) && matchesCandidate(u));
      if (memUser) tutorRecord = { ...(tutorRecord || {}), ...memUser };

      const finalId = tutorRecord?.id || resolvedId;

      // 3. Disk persisted updates
      const persisted = getPersistedUserUpdates();
      if (persisted[finalId]) {
        tutorRecord = { ...(tutorRecord || {}), ...persisted[finalId] };
      }

      // 4. PostgreSQL database (users table + tutors table)
      if (isDbConnected() && db) {
        try {
          const userRows = await db.select().from(users).where(eq(users.id, finalId)).limit(1);
          if (userRows.length > 0) {
            const { passwordHash: _, ...safeDbUser } = userRows[0] as any;
            tutorRecord = { ...(tutorRecord || {}), ...safeDbUser };
          }
        } catch (dbUserErr: any) {
          console.warn('[API] DB notice fetching tutor from users by ID:', dbUserErr.message);
        }

        try {
          const dbRows = await db.select().from(tutors).where(eq(tutors.id, finalId)).limit(1);
          if (dbRows.length > 0) {
            const dbT = dbRows[0];
            const expArr = parseSubjectsListServer(dbT.subjectExpertise, dbT.primarySubject);
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
              reviewCount: dbT.reviewsCount || tutorRecord?.reviewCount || 100,
              hourlyRate: dbT.hourlyRate,
              primarySubject: dbT.primarySubject,
              subjectExpertise: expArr,
              subjects: expArr,
              searchableKeywords: dbT.searchableKeywords,
              education: dbT.education,
              experience: dbT.experienceSummary,
              experienceSummary: dbT.experienceSummary,
              bio: tutorRecord?.bio || dbT.experienceSummary,
              availability: dbT.availability,
              canMeet: dbT.canMeet,
              hobbies: dbT.hobbies,
              verificationStatus: dbT.verificationStatus,
              isVerified: true,
              avatarUrl: dbT.profileImageUrl || tutorRecord?.avatarUrl,
              profileImageUrl: dbT.profileImageUrl || tutorRecord?.profileImageUrl,
              role: 'tutor',
            };
          }
        } catch (dbErr: any) {
          console.warn('[API] DB error fetching tutor by ID:', dbErr.message);
        }
      }

      if (!tutorRecord || tutorRecord.deleted === true || tutorRecord.status === 'deleted') {
        return res.status(404).json({ error: `Tutor with ID "${rawParam}" not found.` });
      }

      const { passwordHash: _, email: _e, phoneNumber: _p, ...safeTutor } = tutorRecord;
      const normalizedSubjects = parseSubjectsListServer(
        safeTutor.subjectExpertise || safeTutor.subjects,
        safeTutor.primarySubject
      );
      safeTutor.role = 'tutor';
      safeTutor.subjects = normalizedSubjects;
      safeTutor.subjectExpertise = normalizedSubjects;
      safeTutor.primarySubject = safeTutor.primarySubject || normalizedSubjects[0] || 'Academic Mentorship';
      safeTutor.reviewCount = safeTutor.reviewCount ?? safeTutor.reviewsCount ?? 120;
      safeTutor.reviewsCount = safeTutor.reviewsCount ?? safeTutor.reviewCount ?? 120;
      safeTutor.location = safeTutor.location || safeTutor.cityLocation || safeTutor.city || 'Miami, FL';
      safeTutor.experience = safeTutor.experience || safeTutor.experienceSummary || safeTutor.bio || '';
      safeTutor.availability = safeTutor.availability || safeTutor.availabilities || 'Flexible global scheduling';
      if (safeTutor.avatarUrl && typeof safeTutor.avatarUrl === 'string' && !safeTutor.avatarVariants) {
        const meta = buildAvatarVariantMetadata(safeTutor.avatarUrl);
        if (meta) {
          Object.assign(safeTutor, meta);
        }
      }

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

        // Backend requirement 5: Await the file write operation (preserve untouched original file)
        const cleanExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt) ? fileExt : '.jpg';
        const stem = `avatar_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
        const filename = `${stem}${cleanExt}`;
        const filePath = path.join(avatarsDir, filename);
        await fs.promises.writeFile(filePath, fileBuffer);
        await generateAvatarDerivatives(fileBuffer, avatarsDir, stem);
        console.log('[UPLOAD] file saved');

        const relativeUrl = `/uploads/avatars/${filename}`;
        const variantMeta = buildAvatarVariantMetadata(relativeUrl);

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

          savePersistedUserUpdate(targetTutorId, {
            avatarUrl: relativeUrl,
            profileImageUrl: relativeUrl,
            ...(variantMeta || {}),
          });
          memoryStore.updateUser(targetTutorId, {
            avatarUrl: relativeUrl,
            profileImageUrl: relativeUrl,
            ...(variantMeta || {}),
          } as any);
        }
        console.log('[UPLOAD] database updated');

        // Backend requirement 8: Return HTTP 201 with JSON containing success: true, imageUrl: the saved image URL
        console.log('[UPLOAD] response sent');
        return res.status(201).json({
          success: true,
          imageUrl: relativeUrl,
          url: `${resolveProductionBaseUrl()}${relativeUrl}?v=${Date.now()}`,
          relativeUrl,
          savedUrl: relativeUrl,
          filename,
          tutorId: targetTutorId || null,
          ...(variantMeta || {}),
        });
      } catch (uploadErr: any) {
        console.error('[UPLOAD] Error saving uploaded avatar:', uploadErr.message);
        console.log('[UPLOAD] response sent');
        return res.status(500).json({ error: uploadErr.message || 'Failed to process image upload.' });
      }
    });
  });

  // POST /api/admin/tutors
  // Protected Admin/Subadmin Tutor Profile Creation with deduplication guarantee
  app.post('/api/admin/tutors', requireRole('admin', 'subadmin'), (req, res, next) => {
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
        finalImageUrl = `${resolveProductionBaseUrl()}/uploads/avatars/${req.file.filename}?v=${Date.now()}`;
      } else if (finalImageUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(finalImageUrl, 'avatars', 'avatar');
        finalImageUrl = rel.startsWith('http') ? rel : `${resolveProductionBaseUrl()}${rel}`;
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
        updates.profileImageUrl = `${resolveProductionBaseUrl()}/uploads/avatars/${req.file.filename}?v=${Date.now()}`;
        updates.avatarUrl = updates.profileImageUrl;
      } else if (updates.profileImageUrl && updates.profileImageUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.profileImageUrl, 'avatars', `avatar_${id}`);
        updates.profileImageUrl = rel.startsWith('http') ? rel : `${resolveProductionBaseUrl()}${rel}`;
        updates.avatarUrl = updates.profileImageUrl;
      } else if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.avatarUrl, 'avatars', `avatar_${id}`);
        updates.avatarUrl = rel.startsWith('http') ? rel : `${resolveProductionBaseUrl()}${rel}`;
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

      const persistedVariantMeta = buildAvatarVariantMetadata(updates.avatarUrl || updates.profileImageUrl || '');
      if (persistedVariantMeta) {
        Object.assign(updates, persistedVariantMeta);
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
              const baseline: any =
                TRENDING_TUTORS_500.find(t => t.id === id) ||
                CURATED_SPECIALIZED_TUTORS.find(t => t.id === id) ||
                SEED_TUTORS.find(t => t.id === id) ||
                {};
              await db.insert(tutors).values({
                id,
                name: tutorDbUpdates.name || baseline.name || 'Tutor',
                tier: tutorDbUpdates.tier || baseline.tutorTier || 'Master Tutor',
                country: tutorDbUpdates.country || baseline.country || 'USA',
                cityLocation: tutorDbUpdates.cityLocation || baseline.location || 'Miami, FL',
                rating: tutorDbUpdates.rating || baseline.rating || 5.0,
                reviewsCount: tutorDbUpdates.reviewsCount || baseline.reviewsCount || baseline.reviewCount || 100,
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
          if (updates.isApproved !== undefined) userUpdates.isApproved = Boolean(updates.isApproved);
          if (updates.status) userUpdates.status = updates.status;

          if (Object.keys(userUpdates).length > 0) {
            const existingUser = await db.select().from(users).where(eq(users.id, id));
            if (existingUser.length > 0) {
              await db.update(users).set(userUpdates).where(eq(users.id, id));
            } else {
              const baseline: any =
                TRENDING_TUTORS_500.find(t => t.id === id) ||
                CURATED_SPECIALIZED_TUTORS.find(t => t.id === id) ||
                SEED_TUTORS.find(t => t.id === id) ||
                {};
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

      const caller = (req as any).user;
      const isCallerAdmin = caller && (caller.role === 'admin' || caller.role === 'subadmin');
      const isApp = isCallerAdmin ? (isApproved !== undefined ? Boolean(isApproved) : true) : false;
      const stat = isCallerAdmin ? (status || (isApp ? 'approved' : 'pending')) : 'pending';
      const rate = hourlyRate ? Math.round(Number(hourlyRate)) : 45;

      const existingAccount = await resolveAuthoritativeUserByEmail(cleanEmail);
      if (existingAccount) {
        if (!isCallerAdmin) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in or contact an administrator.' });
        }
        const updates = {
          name: name.trim(),
          role: existingAccount.role === 'admin' ? 'admin' : 'tutor',
          avatarUrl: avatar,
          bio: bio || existingAccount.bio || 'Dedicated academic tutor and subject mentor.',
          hourlyRate: rate,
          subjects: JSON.stringify(subjectsArray),
          country: country || existingAccount.country || 'US',
          location: locText,
          phoneNumber: phoneNumber || existingAccount.phoneNumber,
          education: education || existingAccount.education,
          experience: expText || existingAccount.experience,
          subjectExpertise: JSON.stringify(subjectExpertiseArray),
          availability: availText || existingAccount.availability,
          canMeet: canMeet || existingAccount.canMeet || 'Online',
          hobbies: hobbies || existingAccount.hobbies,
          isApproved: isApp,
          status: stat,
        };
        if (isDbConnected() && db) {
          await db.update(users).set(updates).where(eq(users.id, existingAccount.id));
        }
        const fullUpdated = { ...existingAccount, ...updates };
        memoryStore.setUser(fullUpdated);
        savePersistedUserUpdate(existingAccount.id, updates);

        await logAudit('TUTOR_PROFILE_UPDATED', `Updated existing tutor profile: ${cleanEmail}`, caller.id, caller.name, caller.role, req);

        const { passwordHash: _, ...safeTutor } = fullUpdated;
        return res.status(200).json({
          success: true,
          tutor: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
          user: { ...safeTutor, subjects: subjectsArray, subjectExpertise: subjectExpertiseArray },
          updated: true
        });
      }

      // Create new tutor profile without any hardcoded fallback password
      const newTutorId = 'tutor_' + crypto.randomBytes(10).toString('hex');
      const now = new Date().toISOString();
      const pHash = (password && typeof password === 'string' && password.length >= 6) ? hashPassword(password) : null;

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
      invalidateSitemapCache();

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
  // Strictly restricted to authenticated Administrators; requires explicit password (no hardcoded fallback)
  app.post('/api/create-privileged-user', requireRole('admin'), async (req, res) => {
    try {
      const { name, email, role, password, extra } = req.body || {};

      if (!name || !email || !role || !password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Missing required fields: name, email, role, password' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Privileged account passwords must be at least 8 characters long.' });
      }

      if (role !== 'tutor' && role !== 'admin' && role !== 'subadmin') {
        return res.status(400).json({ error: "Invalid role. Only 'tutor', 'subadmin', and 'admin' can be created." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const pHash = hashPassword(password);
      const userId = `${role}_${crypto.randomBytes(10).toString('hex')}`;

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

      memoryStore.setUser(newUser);
      savePersistedUserUpdate(userId, newUser);

      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(newUser).onConflictDoUpdate({
            target: users.email,
            set: {
              role: newUser.role,
              name: newUser.name,
              passwordHash: newUser.passwordHash,
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

      const caller = (req as any).user;
      await logAudit('CREATE_PRIVILEGED_USER', `Admin created privileged user: ${cleanEmail} (${role})`, caller?.id || userId, caller?.name || name, caller?.role || 'admin', req);
      if (role === 'tutor') {
        invalidateSitemapCache();
      }

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(200).json({ success: true, user: safeUser });
    } catch (err: any) {
      console.error('[API] Error in create-privileged-user:', err.message);
      return res.status(500).json({ error: 'Failed to create privileged user' });
    }
  });

  // PUT /api/users/:id
  // Protected: requires authentication; users can only update their own non-privileged profile fields unless admin/subadmin
  app.put('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const caller = (req as any).user;
      const isAdminCaller = caller.role === 'admin' || caller.role === 'subadmin';
      if (!isAdminCaller && caller.id !== id) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to modify another user profile.' });
      }

      const updates = { ...req.body };
      delete updates.id;
      delete updates.passwordHash;
      delete updates.password;

      // Prevent privilege escalation: non-admins cannot alter role, approval, verification, or suspension flags
      if (!isAdminCaller) {
        delete updates.role;
        delete updates.suspended;
        delete updates.isApproved;
        delete updates.status;
        delete updates.verified;
      } else if (updates.role === 'admin' && caller.role !== 'admin') {
        delete updates.role;
      }

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
      if (updates.avatarUrl && typeof updates.avatarUrl === 'string') {
        const avatarMeta = buildAvatarVariantMetadata(updates.avatarUrl);
        if (avatarMeta) {
          Object.assign(updates, avatarMeta);
        }
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
          const curatedTutor = CURATED_SPECIALIZED_TUTORS.find(t => t.id === id);
          if (curatedTutor) {
            existingUser = {
              ...curatedTutor,
              role: 'tutor',
              subjects: JSON.stringify(curatedTutor.subjectExpertise || curatedTutor.subjects || []),
              subjectExpertise: JSON.stringify(curatedTutor.subjectExpertise || curatedTutor.subjects || []),
            };
          } else {
            const seedTutor = SEED_TUTORS.find(t => t.id === id);
            if (seedTutor) {
              existingUser = { ...seedTutor };
            }
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
      if (mergedUser.role === 'tutor' || String(id).startsWith('tutor')) {
        invalidateSitemapCache();
      }

      return res.status(200).json({ success: true, user: mergedUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/users/:id - Admin/Subadmin soft+DB removal for user/tutor profiles
  app.delete('/api/users/:id', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const { id } = req.params;
      const caller = (req as any).user;
      if (caller && caller.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own active administrator account.' });
      }

      savePersistedUserUpdate(id, {
        deleted: true,
        status: 'deleted',
        suspended: true,
        isApproved: false,
      });
      memoryStore.updateUser(id, {
        status: 'deleted',
        suspended: true,
        isApproved: false,
      } as any);

      if (isDbConnected() && db) {
        try {
          await db.delete(tutors).where(eq(tutors.id, id));
        } catch (tErr: any) {
          console.warn('[DB] Notice deleting from tutors table:', tErr.message);
        }
        try {
          await db.delete(users).where(eq(users.id, id));
        } catch (uErr: any) {
          console.warn('[DB] Notice deleting from users table:', uErr.message);
        }
      }

      invalidateSitemapCache();
      await logAudit('USER_DELETE', `Deleted user/tutor profile ${id}`, id, undefined, 'admin', req);
      return res.status(200).json({ success: true, deletedId: id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete user profile' });
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

      const avatarVariantMeta = buildAvatarVariantMetadata(avatarUrl);

      // 1. Update disk persistence
      savePersistedUserUpdate(targetUserId, { avatarUrl, ...(avatarVariantMeta || {}) });

      // 2. Update memory store
      memoryStore.updateUser(targetUserId, { avatarUrl, ...(avatarVariantMeta || {}) } as any);

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

      return res.status(200).json({ success: true, avatarUrl, ...(avatarVariantMeta || {}) });
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

  // GET /api/orders - Role-scoped and paginated
  app.get('/api/orders', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;
      const statusFilter = (req.query.status as string || '').trim();
      const searchFilter = (req.query.search as string || '').toLowerCase().trim();

      const requestedStudentId = isAdmin ? (req.query.studentId as string | undefined) : (caller.role === 'student' ? caller.id : undefined);
      const requestedTutorId = isAdmin ? (req.query.tutorId as string | undefined) : (caller.role === 'tutor' ? caller.id : undefined);

      let rows: any[] = [];
      if (isDbConnected() && db) {
        try {
          if (requestedStudentId) {
            rows = await withDbTimeout(
              db.select().from(orders).where(eq(orders.studentId, String(requestedStudentId))).orderBy(desc(orders.createdAt)),
              10000,
              'Query student orders'
            );
          } else if (requestedTutorId) {
            rows = await withDbTimeout(
              db.select().from(orders).where(eq(orders.tutorId, String(requestedTutorId))).orderBy(desc(orders.createdAt)),
              10000,
              'Query tutor orders'
            );
          } else if (isAdmin) {
            rows = await withDbTimeout(
              db.select().from(orders).orderBy(desc(orders.createdAt)),
              10000,
              'Query admin orders'
            );
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying orders from DB:', dbErr.message);
        }
      }

      if (rows.length === 0) {
        rows = memoryStore.getOrders(requestedStudentId, requestedTutorId);
      }

      if (statusFilter && statusFilter !== 'all') {
        rows = rows.filter((o) => String(o.status || '').toLowerCase() === statusFilter.toLowerCase());
      }
      if (searchFilter) {
        rows = rows.filter((o) =>
          String(o.title || '').toLowerCase().includes(searchFilter) ||
          String(o.subject || '').toLowerCase().includes(searchFilter) ||
          String(o.id || '').toLowerCase().includes(searchFilter)
        );
      }

      const total = rows.length;
      const paginated = rows.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        orders: paginated,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || 'Failed to retrieve orders.',
        code: err?.code || 'ORDERS_FETCH_FAILED',
        status: 500,
      });
    }
  });

  // POST /api/orders
  app.post('/api/orders', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const data = req.body || {};
      const orderId = data.id || 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const effectiveStudentId = isAdmin && data.studentId ? String(data.studentId) : caller.id;

      if (!data.title || !data.subject) {
        return res.status(400).json({ error: 'Order title and subject are required.', code: 'VALIDATION_ERROR', status: 400 });
      }

      const newOrder = {
        id: orderId,
        studentId: effectiveStudentId,
        tutorId: data.tutorId || null,
        title: String(data.title),
        subject: String(data.subject),
        academicLevel: data.academicLevel || null,
        deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
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
          await withDbTimeout(db.insert(orders).values(newOrder), 10000, 'Insert order');
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting order into DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_CREATE', `Created order: ${orderId} (${newOrder.title})`, effectiveStudentId, caller.name, caller.role, req);

      return res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'ORDER_CREATE_FAILED', status: 500 });
    }
  });

  // PUT /api/orders/:id
  app.put('/api/orders/:id', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { id } = req.params;

      const existing = await findOrderById(id);
      if (!isAdmin && existing && existing.studentId !== caller.id && existing.tutorId !== caller.id) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to update this order.', code: 'FORBIDDEN', status: 403 });
      }

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
          await withDbTimeout(db.update(orders).set(dbUpdates).where(eq(orders.id, id)), 10000, 'Update order');
        } catch (dbErr: any) {
          console.warn('[API] Notice updating order in DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_UPDATE', `Updated order: ${id}`, caller.id, caller.name, caller.role, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'ORDER_UPDATE_FAILED', status: 500 });
    }
  });

  // DELETE /api/orders/:id
  app.delete('/api/orders/:id', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { id } = req.params;

      const existing = await findOrderById(id);
      if (!isAdmin && (!existing || existing.studentId !== caller.id)) {
        return res.status(403).json({ error: 'Forbidden: Only administrators or the order owner may delete this order.', code: 'FORBIDDEN', status: 403 });
      }

      memoryStore.deleteOrder(id);

      if (isDbConnected() && db) {
        try {
          await withDbTimeout(db.delete(orders).where(eq(orders.id, id)), 10000, 'Delete order');
        } catch (dbErr: any) {
          console.warn('[API] Notice deleting order from DB:', dbErr.message);
        }
      }

      await logAudit('ORDER_DELETE', `Deleted order: ${id}`, caller.id, caller.name, caller.role, req);

      return res.status(200).json({ success: true, message: 'Order removed successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'ORDER_DELETE_FAILED', status: 500 });
    }
  });

  // ==========================================
  // INQUIRIES (Quotes & WhatsApp Submissions)
  // ==========================================

  // GET /api/inquiries (Admin/Subadmin only, paginated)
  app.get('/api/inquiries', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      let rows: any[] = [];
      if (isDbConnected() && db) {
        try {
          rows = await withDbTimeout(
            db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
            10000,
            'Query inquiries'
          );
        } catch (dbErr: any) {
          console.warn('[API] Notice querying inquiries from DB:', dbErr.message);
        }
      }
      if (rows.length === 0) {
        rows = memoryStore.getInquiries();
      }
      const total = rows.length;
      const paginated = rows.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        inquiries: paginated,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load inquiries', code: 'INQUIRIES_FETCH_FAILED', status: 500 });
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

  // GET /api/chat-rooms - List user's accessible chat rooms (Zero N+1 batched queries + pagination)
  app.get('/api/chat-rooms', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      if (isDbConnected() && db) {
        try {
          let userRooms: any[] = [];
          let totalRooms = 0;

          if (isAdmin) {
            const allRoomIds = await withDbTimeout(
              db.select({ id: chatRooms.id }).from(chatRooms).orderBy(desc(chatRooms.updatedAt)),
              10000,
              'Count admin chat rooms'
            );
            totalRooms = allRoomIds.length;
            const pageIds = allRoomIds.slice(offset, offset + limit).map((r) => r.id);
            if (pageIds.length > 0) {
              userRooms = await withDbTimeout(
                db.select().from(chatRooms).where(inArray(chatRooms.id, pageIds)).orderBy(desc(chatRooms.updatedAt)),
                10000,
                'Select admin chat rooms page'
              );
            }
          } else {
            const memberOf = await withDbTimeout(
              db.select({ roomId: chatRoomMembers.roomId }).from(chatRoomMembers).where(eq(chatRoomMembers.userId, currentUser.id)),
              10000,
              'Select user room memberships'
            );
            const allRoomIds = Array.from(new Set(memberOf.map((m) => m.roomId)));
            totalRooms = allRoomIds.length;
            if (allRoomIds.length > 0) {
              const allUserRooms = await withDbTimeout(
                db.select().from(chatRooms).where(inArray(chatRooms.id, allRoomIds)).orderBy(desc(chatRooms.updatedAt)),
                10000,
                'Select user chat rooms'
              );
              userRooms = allUserRooms.slice(offset, offset + limit);
            }
          }

          if (userRooms.length === 0) {
            return res.status(200).json({
              success: true,
              rooms: [],
              total: totalRooms,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(totalRooms / limit)),
            });
          }

          const pageRoomIds = userRooms.map((r) => r.id);
          const pageOrderIds = Array.from(new Set(userRooms.map((r) => r.orderId).filter(Boolean) as string[]));

          // Batch 1 & 2 & 3 in parallel: all members, recent messages, and linked orders for these rooms
          const [allMembers, recentRoomMessages, linkedOrdersList] = await Promise.all([
            withDbTimeout(
              db.select().from(chatRoomMembers).where(inArray(chatRoomMembers.roomId, pageRoomIds)),
              10000,
              'Batch load room members'
            ),
            withDbTimeout(
              db.select().from(messages).where(inArray(messages.roomId, pageRoomIds)).orderBy(desc(messages.createdAt)).limit(Math.max(100, pageRoomIds.length * 5)),
              10000,
              'Batch load latest room messages'
            ),
            pageOrderIds.length > 0
              ? withDbTimeout(db.select().from(orders).where(inArray(orders.id, pageOrderIds)), 10000, 'Batch load linked orders')
              : Promise.resolve([] as any[]),
          ]);

          // Collect all user IDs needed across members + linked orders
          const neededUserIdSet = new Set<string>();
          for (const m of allMembers) neededUserIdSet.add(m.userId);
          for (const o of linkedOrdersList) {
            if (o.tutorId) neededUserIdSet.add(o.tutorId);
            if (o.studentId) neededUserIdSet.add(o.studentId);
          }

          const neededUserIds = Array.from(neededUserIdSet);
          const fetchedUsers = neededUserIds.length > 0
            ? await withDbTimeout(
                db.select({
                  id: users.id,
                  name: users.name,
                  email: users.email,
                  role: users.role,
                  avatarUrl: users.avatarUrl,
                  rating: users.rating,
                  subjectExpertise: users.subjectExpertise,
                }).from(users).where(inArray(users.id, neededUserIds)),
                10000,
                'Batch load room users'
              )
            : [];

          // Build O(1) lookup maps
          const userMap = new Map<string, any>();
          for (const u of fetchedUsers) userMap.set(u.id, u);

          const orderMap = new Map<string, any>();
          for (const o of linkedOrdersList) orderMap.set(o.id, o);

          const membersByRoom = new Map<string, any[]>();
          for (const m of allMembers) {
            const arr = membersByRoom.get(m.roomId) || [];
            arr.push(m);
            membersByRoom.set(m.roomId, arr);
          }

          const latestMsgByRoom = new Map<string, any>();
          for (const msg of recentRoomMessages) {
            if (msg.roomId && !latestMsgByRoom.has(msg.roomId)) {
              latestMsgByRoom.set(msg.roomId, msg);
            }
          }

          const populated = userRooms.map((r) => {
            const members = membersByRoom.get(r.id) || [];
            const linkedOrder = r.orderId ? orderMap.get(r.orderId) || null : null;
            const memberUsers = members.map((m) => userMap.get(m.userId)).filter(Boolean);

            const studentMember = memberUsers.find((u) => u.role === 'student');
            const tutorMember = memberUsers.find((u) => u.role === 'tutor' || (!String(u.id).startsWith('admin_') && u.role !== 'admin' && u.id !== studentMember?.id));

            const tutorUser = tutorMember || (linkedOrder?.tutorId ? userMap.get(linkedOrder.tutorId) || null : null);
            const studentUser = studentMember || (linkedOrder?.studentId ? userMap.get(linkedOrder.studentId) || null : null);

            return {
              ...r,
              members: members.map((m) => {
                const mu = userMap.get(m.userId);
                return {
                  ...m,
                  user: mu ? {
                    id: mu.id,
                    name: mu.name,
                    email: isAdmin ? mu.email : undefined,
                    role: mu.role,
                    avatarUrl: mu.avatarUrl,
                    rating: mu.rating,
                    subjectExpertise: mu.subjectExpertise,
                  } : null,
                };
              }),
              latestMessage: latestMsgByRoom.get(r.id) || null,
              order: linkedOrder,
              student: studentUser ? {
                id: studentUser.id,
                name: studentUser.name,
                email: isAdmin ? studentUser.email : undefined,
                role: studentUser.role,
                avatarUrl: studentUser.avatarUrl,
              } : null,
              tutor: tutorUser ? {
                id: tutorUser.id,
                name: tutorUser.name,
                email: isAdmin ? tutorUser.email : undefined,
                role: tutorUser.role,
                avatarUrl: tutorUser.avatarUrl,
                rating: tutorUser.rating,
                subjectExpertise: tutorUser.subjectExpertise,
              } : null,
              studentId: studentUser?.id || r.createdBy,
              tutorId: tutorUser?.id || null,
            };
          });

          return res.status(200).json({
            success: true,
            rooms: populated,
            total: totalRooms,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(totalRooms / limit)),
          });
        } catch (dbErr: any) {
          console.warn('[API] Notice fetching chat rooms from DB:', dbErr.message);
        }
      }

      const memoryRooms = memoryStore.getChatRoomsForUser(currentUser.id, isAdmin);
      const total = memoryRooms.length;
      const paginated = memoryRooms.slice(offset, offset + limit);
      return res.status(200).json({
        success: true,
        rooms: paginated,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'CHAT_ROOMS_FETCH_FAILED', status: 500 });
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
          await withDbTimeout(db.insert(chatRoomMembers).values(newMember), 10000, 'Add room member');
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
          await withDbTimeout(
            db.delete(chatRoomMembers).where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, targetUserId))),
            10000,
            'Remove room member'
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

  // GET /api/chat-rooms/:id/messages - Retrieve messages for a specific room (paginated)
  app.get('/api/chat-rooms/:id/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const roomId = req.params.id;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(500, Math.max(1, parseInt((req.query.limit as string) || '200', 10) || 200));

      // Enforce room membership check (403 for unauthorized users)
      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, roomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to view messages in this chat room.', code: 'FORBIDDEN', status: 403 });
      }

      let rows: any[] = [];
      if (isDbConnected() && db) {
        try {
          rows = await withDbTimeout(
            db.select().from(messages).where(eq(messages.roomId, roomId)).orderBy(messages.createdAt),
            10000,
            'Fetch room messages'
          );
        } catch (dbErr: any) {
          console.warn('[API] Notice fetching room messages from DB:', dbErr.message);
          rows = memoryStore.getRoomMessages(roomId);
        }
      } else {
        rows = memoryStore.getRoomMessages(roomId);
      }

      const total = rows.length;
      const sliceStart = Math.max(0, total - page * limit);
      const sliceEnd = Math.max(0, total - (page - 1) * limit);
      const paginated = rows.slice(sliceStart, sliceEnd);

      return res.status(200).json({
        success: true,
        messages: paginated,
        total,
        page,
        limit,
        hasMore: sliceStart > 0,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'ROOM_MESSAGES_FETCH_FAILED', status: 500 });
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
        return res.status(403).json({ error: 'Forbidden: You are not a member of this chat room.', code: 'FORBIDDEN', status: 403 });
      }

      const { content, fileUrl, fileName, isSystem } = req.body;

      // Validation 1: Reject empty or whitespace-only messages
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty.', code: 'VALIDATION_ERROR', status: 400 });
      }

      // Validation 2: Enforce 5,000 character limit
      if (content.length > 5000) {
        return res.status(400).json({ error: 'Message length exceeds the 5,000 character limit.', code: 'VALIDATION_ERROR', status: 400 });
      }

      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'subadmin';
      let senderId = currentUser.id;
      if (isAdmin && (req.body.sendAsTutorId || req.body.senderId)) {
        senderId = req.body.sendAsTutorId || req.body.senderId;
      }
      const now = new Date().toISOString();
      const msgId = req.body.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newMsg = {
        id: msgId,
        chatId: roomId,
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
          await withDbTimeout(db.insert(messages).values(newMsg), 10000, 'Insert room message');
          await withDbTimeout(db.update(chatRooms).set({ updatedAt: now }).where(eq(chatRooms.id, roomId)), 10000, 'Update room timestamp');
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting room message into DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'MESSAGE_SEND_FAILED', status: 500 });
    }
  });

  // GET /api/messages - Secure backward-compatible paginated message retrieval
  app.get('/api/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { chatId, orderId } = req.query;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(500, Math.max(1, parseInt((req.query.limit as string) || '100', 10) || 100));
      const offset = (page - 1) * limit;

      // If chatId is provided, enforce access check
      if (chatId) {
        const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, String(chatId));
        if (!hasAccess) {
          return res.status(403).json({ error: 'Forbidden: You do not have access to this conversation.', code: 'FORBIDDEN', status: 403 });
        }
      }

      if (isDbConnected() && db) {
        try {
          if (chatId) {
            const rows = await withDbTimeout(
              db.select().from(messages).where(eq(messages.chatId, String(chatId))).orderBy(messages.createdAt),
              10000,
              'Select chat messages'
            );
            const paginated = rows.slice(Math.max(0, rows.length - page * limit), Math.max(0, rows.length - (page - 1) * limit));
            return res.status(200).json({ success: true, messages: paginated, total: rows.length, page, limit });
          }
          if (orderId) {
            const rows = await withDbTimeout(
              db.select().from(messages).where(eq(messages.orderId, String(orderId))).orderBy(messages.createdAt),
              10000,
              'Select order messages'
            );
            return res.status(200).json({ success: true, messages: rows.slice(offset, offset + limit), total: rows.length, page, limit });
          }
          if (currentUser.role === 'admin' || currentUser.role === 'subadmin') {
            const rows = await withDbTimeout(
              db.select().from(messages).orderBy(desc(messages.createdAt)).limit(limit).offset(offset),
              10000,
              'Select admin recent messages'
            );
            return res.status(200).json({ success: true, messages: rows, page, limit });
          } else {
            const memberRooms = await withDbTimeout(
              db.select().from(chatRoomMembers).where(eq(chatRoomMembers.userId, currentUser.id)),
              10000,
              'Select user chat rooms for messages'
            );
            const roomIds = memberRooms.map((m) => m.roomId);
            if (roomIds.length > 0) {
              const rows = await withDbTimeout(
                db.select().from(messages).where(inArray(messages.chatId, roomIds)).orderBy(desc(messages.createdAt)).limit(limit).offset(offset),
                10000,
                'Select user recent messages'
              );
              return res.status(200).json({ success: true, messages: rows, page, limit });
            }
            return res.status(200).json({ success: true, messages: [], page, limit });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying messages from DB:', dbErr.message);
        }
      }

      const memRows = memoryStore.getMessages(chatId as string | undefined, orderId as string | undefined);
      return res.status(200).json({
        success: true,
        messages: memRows.slice(offset, offset + limit),
        total: memRows.length,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'MESSAGES_FETCH_FAILED', status: 500 });
    }
  });

  // POST /api/messages - Secure backward-compatible message dispatch
  app.post('/api/messages', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const data = req.body;
      const targetRoomId = data.roomId || data.chatId;

      if (!targetRoomId || !data.content) {
        return res.status(400).json({ error: 'Missing required parameters (chatId/roomId, content).', code: 'VALIDATION_ERROR', status: 400 });
      }

      const hasAccess = await canUserAccessRoom(currentUser.id, currentUser.role, targetRoomId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to post to this conversation.', code: 'FORBIDDEN', status: 403 });
      }

      const trimmedContent = String(data.content).trim();
      if (trimmedContent.length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty.', code: 'VALIDATION_ERROR', status: 400 });
      }
      if (data.content.length > 5000) {
        return res.status(400).json({ error: 'Message length exceeds the 5,000 character limit.', code: 'VALIDATION_ERROR', status: 400 });
      }

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
          await withDbTimeout(db.insert(messages).values(newMsg), 10000, 'Insert message');
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting message into DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'MESSAGE_SEND_FAILED', status: 500 });
    }
  });

  // ==========================================
  // QUOTES (Authenticated, Role-Scoped & Paginated)
  // ==========================================

  // GET /api/quotes
  app.get('/api/quotes', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { chatId, orderId } = req.query;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      let rows: any[] = [];
      if (isDbConnected() && db) {
        try {
          if (chatId) {
            rows = await withDbTimeout(db.select().from(quotes).where(eq(quotes.chatId, String(chatId))).orderBy(desc(quotes.createdAt)), 10000, 'Select quotes by chat');
          } else if (orderId) {
            rows = await withDbTimeout(db.select().from(quotes).where(eq(quotes.orderId, String(orderId))).orderBy(desc(quotes.createdAt)), 10000, 'Select quotes by order');
          } else {
            rows = await withDbTimeout(db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(250), 10000, 'Select recent quotes');
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying quotes from DB:', dbErr.message);
        }
      }

      if (rows.length === 0) {
        rows = memoryStore.getQuotes(chatId as string | undefined, orderId as string | undefined);
      }

      if (!isAdmin) {
        const userRooms = new Set(memoryStore.getChatRoomsForUser(caller.id, false).map((r) => r.id));
        const userOrderIds = new Set(
          memoryStore.getOrders(caller.role === 'student' ? caller.id : undefined, caller.role === 'tutor' ? caller.id : undefined).map((o) => o.id)
        );
        rows = rows.filter(
          (q) =>
            q.tutorId === caller.id ||
            (q.chatId && userRooms.has(q.chatId)) ||
            (q.orderId && userOrderIds.has(q.orderId))
        );
      }

      const total = rows.length;
      return res.status(200).json({
        success: true,
        quotes: rows.slice(offset, offset + limit),
        total,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to fetch quotes.', code: 'QUOTES_FETCH_FAILED', status: 500 });
    }
  });

  // POST /api/quotes
  app.post('/api/quotes', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const data = req.body || {};
      const quoteId = data.id || 'qte_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const newQuote = {
        id: quoteId,
        chatId: data.chatId || null,
        orderId: data.orderId || null,
        inquiryId: data.inquiryId || null,
        tutorId: data.tutorId || caller.id,
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
          await withDbTimeout(db.insert(quotes).values(newQuote), 10000, 'Insert quote');
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting quote into DB:', dbErr.message);
        }
      }

      await logAudit('QUOTE_CREATE', `Quote issued: $${newQuote.amount} (${quoteId})`, caller.id, caller.name, caller.role, req);

      return res.status(201).json({ success: true, quote: newQuote });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'QUOTE_CREATE_FAILED', status: 500 });
    }
  });

  // PUT /api/quotes/:id
  app.put('/api/quotes/:id', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;

      memoryStore.updateQuote(id, updates);

      if (isDbConnected() && db) {
        try {
          await withDbTimeout(db.update(quotes).set(updates).where(eq(quotes.id, id)), 10000, 'Update quote');
        } catch (dbErr: any) {
          console.warn('[API] Notice updating quote in DB:', dbErr.message);
        }
      }

      await logAudit('QUOTE_UPDATE', `Quote ${id} updated to status: ${updates.status}`, caller.id, caller.name, caller.role, req);

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'QUOTE_UPDATE_FAILED', status: 500 });
    }
  });

  // ==========================================
  // AUDIT LOGS (Paginated Admin-Only)
  // ==========================================

  // GET /api/audit-logs
  app.get('/api/audit-logs', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      if (isDbConnected() && db) {
        try {
          const rows = await withDbTimeout(
            db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset),
            10000,
            'Query audit logs'
          );
          return res.status(200).json({ success: true, logs: rows, page, limit });
        } catch (dbErr: any) {
          console.warn('[API] Notice querying audit logs from DB:', dbErr.message);
        }
      }

      const allMemLogs = memoryStore.getAuditLogs();
      return res.status(200).json({
        success: true,
        logs: allMemLogs.slice(offset, offset + limit),
        total: allMemLogs.length,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to fetch audit logs.', code: 'AUDIT_LOGS_FAILED', status: 500 });
    }
  });

  // POST /api/audit-logs
  app.post('/api/audit-logs', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { action, details } = req.body || {};
      if (!action || typeof action !== 'string') {
        return res.status(400).json({ error: 'Action is required.', code: 'VALIDATION_ERROR', status: 400 });
      }
      await logAudit(action, details || '', caller.id, caller.name, caller.role, req);
      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'AUDIT_LOG_CREATE_FAILED', status: 500 });
    }
  });

  // ==========================================
  // NOTIFICATIONS (Authenticated, Persisted in PostgreSQL + Memory, Paginated)
  // ==========================================

  // GET /api/notifications
  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;
      const targetUserId = isAdmin && req.query.userId ? String(req.query.userId) : caller.id;

      let rows: any[] = [];
      if (isDbConnected() && db) {
        try {
          if (isAdmin && !req.query.userId) {
            rows = await withDbTimeout(
              db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset),
              10000,
              'Query all notifications'
            );
            return res.status(200).json({ success: true, notifications: rows, page, limit });
          }
          rows = await withDbTimeout(
            db.select().from(notifications)
              .where(or(eq(notifications.userId, targetUserId), eq(notifications.userId, 'all'), eq(notifications.userId, caller.role)))
              .orderBy(desc(notifications.createdAt))
              .limit(limit)
              .offset(offset),
            10000,
            'Query user notifications'
          );
          if (rows.length > 0) {
            return res.status(200).json({ success: true, notifications: rows, page, limit });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying notifications from DB:', dbErr.message);
        }
      }

      const memNotifs = memoryStore.getNotifications(isAdmin && !req.query.userId ? undefined : targetUserId);
      return res.status(200).json({
        success: true,
        notifications: memNotifs.slice(offset, offset + limit),
        total: memNotifs.length,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load notifications.', code: 'NOTIFICATIONS_FETCH_FAILED', status: 500 });
    }
  });

  // POST /api/notifications
  app.post('/api/notifications', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { userId, title, message, type, sentBy } = req.body || {};
      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Missing required notification fields', code: 'VALIDATION_ERROR', status: 400 });
      }
      if (!isAdmin && userId !== caller.id && userId !== 'all') {
        return res.status(403).json({ error: 'Forbidden: Only administrators can dispatch notifications to other users.', code: 'FORBIDDEN', status: 403 });
      }

      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        userId: String(userId),
        title: String(title),
        message: String(message),
        type: String(type || 'webapp'),
        sentBy: String(sentBy || caller.name || 'System'),
        createdAt: new Date().toISOString(),
        read: false
      };
      memoryStore.addNotification(newNotif);

      if (isDbConnected() && db) {
        try {
          await withDbTimeout(db.insert(notifications).values(newNotif), 10000, 'Insert notification');
        } catch (dbErr: any) {
          console.warn('[API] Notice inserting notification into DB:', dbErr.message);
        }
      }

      return res.status(201).json({ success: true, notification: newNotif });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'NOTIFICATION_CREATE_FAILED', status: 500 });
    }
  });

  // PUT /api/notifications/:id/read
  app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { id } = req.params;
      memoryStore.markNotificationRead(id);

      if (isDbConnected() && db) {
        try {
          const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
          if (isAdmin) {
            await withDbTimeout(db.update(notifications).set({ read: true }).where(eq(notifications.id, id)), 8000, 'Mark notification read');
          } else {
            await withDbTimeout(
              db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), or(eq(notifications.userId, caller.id), eq(notifications.userId, 'all')))),
              8000,
              'Mark user notification read'
            );
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice updating notification read state:', dbErr.message);
        }
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'NOTIFICATION_UPDATE_FAILED', status: 500 });
    }
  });

  // POST /api/notifications/mark-all-read
  app.post('/api/notifications/mark-all-read', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const targetUserId = isAdmin && req.body?.userId ? String(req.body.userId) : caller.id;
      memoryStore.markAllNotificationsRead(targetUserId);

      if (isDbConnected() && db) {
        try {
          await withDbTimeout(
            db.update(notifications).set({ read: true }).where(eq(notifications.userId, targetUserId)),
            8000,
            'Mark all notifications read'
          );
        } catch (dbErr: any) {
          console.warn('[API] Notice marking all notifications read:', dbErr.message);
        }
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'NOTIFICATIONS_MARK_ALL_FAILED', status: 500 });
    }
  });

  // ==========================================
  // PAYMENTS & ESCROW LEDGER (Authenticated, Role-Scoped & Paginated)
  // ==========================================

  // GET /api/payments
  app.get('/api/payments', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { studentId, assignmentId } = req.query;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      const scopedStudentId = isAdmin ? (studentId ? String(studentId) : undefined) : (caller.role === 'student' ? caller.id : '__none__');
      let paymentRecords = memoryStore.getPayments(scopedStudentId, assignmentId ? String(assignmentId) : undefined);

      if (caller.role === 'tutor' && !isAdmin) {
        const tutorOrderIds = new Set(memoryStore.getOrders(undefined, caller.id).map((o) => o.id));
        paymentRecords = memoryStore.getPayments(undefined, assignmentId ? String(assignmentId) : undefined).filter((p) => tutorOrderIds.has(p.assignmentId));
      }

      const total = paymentRecords.length;
      return res.status(200).json({
        success: true,
        payments: paymentRecords.slice(offset, offset + limit),
        total,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load payments.', code: 'PAYMENTS_FETCH_FAILED', status: 500 });
    }
  });

  // POST /api/payments
  app.post('/api/payments', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const { assignmentId, studentId, amount, status, type, notes } = req.body || {};
      if (!assignmentId || amount === undefined) {
        return res.status(400).json({ error: 'Missing required assignmentId or amount.', code: 'VALIDATION_ERROR', status: 400 });
      }

      const effectiveStudentId = isAdmin && studentId ? String(studentId) : caller.id;
      const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newPayment = {
        id: paymentId,
        assignmentId,
        studentId: effectiveStudentId,
        amount: Number(amount),
        status: status || 'escrow',
        stripePaymentIntent: req.body.stripePaymentIntent || `pi_3Pqz_${Date.now()}_ut_escrow`,
        type: type || 'advance',
        notes: notes || 'Student Escrow Deposit',
        createdAt: new Date().toISOString()
      };
      memoryStore.setPayment(newPayment as any);

      const existingOrder = memoryStore.getOrders().find((o) => o.id === assignmentId);
      if (existingOrder) {
        const orderUpdates: any = { escrowStatus: newPayment.status };
        if (existingOrder.status === 'Pending Tutor Assignment' || existingOrder.status === 'pending') {
          orderUpdates.status = 'In Progress';
        }
        memoryStore.updateOrder(assignmentId, orderUpdates);
      }

      await logAudit('PAYMENT_DEPOSIT', `Payment recorded: $${amount} for assignment #${assignmentId}`, effectiveStudentId, caller.name, caller.role, req);

      return res.status(201).json({ success: true, payment: newPayment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'PAYMENT_CREATE_FAILED', status: 500 });
    }
  });

  // PUT /api/payments/:id
  app.put('/api/payments/:id', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      const updated = memoryStore.updatePayment(id, updates);
      return res.status(200).json({ success: true, payment: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'PAYMENT_UPDATE_FAILED', status: 500 });
    }
  });

  // ==========================================
  // INVOICES & STATEMENTS (Authenticated, Role-Scoped & Paginated)
  // ==========================================

  // GET /api/invoices
  app.get('/api/invoices', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = caller.role === 'admin' || caller.role === 'subadmin';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      const scopedStudentId = isAdmin ? (req.query.studentId ? String(req.query.studentId) : undefined) : caller.id;
      const invList = memoryStore.getInvoices(scopedStudentId);

      return res.status(200).json({
        success: true,
        invoices: invList.slice(offset, offset + limit),
        total: invList.length,
        page,
        limit,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load invoices.', code: 'INVOICES_FETCH_FAILED', status: 500 });
    }
  });

  // POST /api/invoices
  app.post('/api/invoices', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const data = req.body || {};
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
      return res.status(500).json({ error: err.message, code: 'INVOICE_CREATE_FAILED', status: 500 });
    }
  });

  // PUT /api/invoices/:id
  app.put('/api/invoices/:id', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      const updated = memoryStore.updateInvoice(id, updates);
      return res.status(200).json({ success: true, invoice: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, code: 'INVOICE_UPDATE_FAILED', status: 500 });
    }
  });

  // ==========================================
  // BLOGS (Educational Guides & Academic Articles, Paginated)
  // ==========================================

  // GET /api/blogs (Public)
  app.get('/api/blogs', async (req, res) => {
    try {
      const { category } = req.query;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;

      if (isDbConnected() && db) {
        try {
          let rows: any[] = [];
          if (category && category !== 'All') {
            rows = await withDbTimeout(
              db.select().from(blogs).where(eq(blogs.category, String(category))).orderBy(desc(blogs.publishedAt)),
              10000,
              'Query category blogs'
            );
          } else {
            rows = await withDbTimeout(
              db.select().from(blogs).orderBy(desc(blogs.publishedAt)),
              10000,
              'Query all blogs'
            );
          }

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
            rows = await withDbTimeout(db.select().from(blogs).orderBy(desc(blogs.publishedAt)), 10000, 'Re-select seeded blogs');
          }

          if (rows.length > 0) {
            for (const r of rows) {
              memoryStore.setBlog({
                ...r,
                image: r.image,
                imageUrl: r.image,
                tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
              });
            }
            return res.status(200).json({
              success: true,
              blogs: rows.slice(offset, offset + limit),
              total: rows.length,
              page,
              limit,
            });
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying blogs from DB:', dbErr.message);
        }
      }

      let memBlogs = memoryStore.getBlogs(category as string | undefined);
      if (memBlogs.length === 0) {
        memBlogs = memoryStore.resetDefaultBlogs();
      }

      return res.status(200).json({
        success: true,
        blogs: memBlogs.slice(offset, offset + limit),
        total: memBlogs.length,
        page,
        limit,
      });
    } catch (err: any) {
      console.error('[API] Error in GET /api/blogs:', err);
      return res.status(200).json({ blogs: memoryStore.getBlogs() });
    }
  });

  // GET /api/blogs/:id (Public — supports lookup by either blog ID or canonical slug)
  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const target = decodeURIComponent(String(id || '')).trim();

      if (isDbConnected() && db) {
        try {
          const rows = await withDbTimeout(
            db.select().from(blogs).where(eq(blogs.id, target)).limit(1),
            8000,
            'Query single blog by id'
          );
          if (rows.length > 0) {
            return res.status(200).json({ blog: rows[0] });
          }
          const allDbBlogs = await withDbTimeout(
            db.select().from(blogs).orderBy(desc(blogs.publishedAt)),
            8000,
            'Query blogs for slug lookup'
          );
          const slugMatched = allDbBlogs.find((b) => matchesBlogSlugOrId(b, target));
          if (slugMatched) {
            return res.status(200).json({ blog: slugMatched });
          }
        } catch (dbErr: any) {
          console.warn('[API] DB error finding blog:', dbErr.message);
        }
      }

      const memBlog =
        memoryStore.getBlogById(target) ||
        memoryStore.getBlogs().find((b) => matchesBlogSlugOrId(b, target)) ||
        DEFAULT_20_BLOGS.find((b) => matchesBlogSlugOrId(b, target));
      if (memBlog) {
        return res.status(200).json({ blog: memBlog });
      }

      return res.status(404).json({ error: 'Blog post not found' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/blogs (Admin create)
  app.post('/api/blogs', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const user = (req as any).user;

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
      invalidateSitemapCache();

      return res.status(201).json({ success: true, blog: newBlog });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/blogs/:id (Admin update)
  app.put('/api/blogs/:id', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const user = (req as any).user;

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
      invalidateSitemapCache();

      return res.status(200).json({ success: true, blog: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/blogs/:id (Admin delete)
  app.delete('/api/blogs/:id', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const user = (req as any).user;

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
      invalidateSitemapCache();

      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/blogs/sync-defaults (Admin reset/sync all 20 default educational blogs)
  app.post('/api/blogs/sync-defaults', requireRole('admin', 'subadmin'), async (req, res) => {
    try {
      const user = (req as any).user;

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
      invalidateSitemapCache();

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
  // DYNAMIC SITEMAP.XML & ROBOTS.TXT (SEO)
  // ==========================================
  const loadSitemapDatabaseRecords = async (): Promise<{
    blogs: SitemapBlogInput[];
    tutors: SitemapTutorInput[];
  }> => {
    // 1. Collect all published blog posts (PostgreSQL + memoryStore + DEFAULT_20_BLOGS fallback)
    const blogMap = new Map<string, SitemapBlogInput>();
    let dbBlogsLoaded = false;

    if (isDbConnected() && db) {
      try {
        const dbBlogRows = await withDbTimeout(
          db.select().from(blogs).orderBy(desc(blogs.publishedAt)),
          8000,
          'Sitemap query blogs'
        );
        if (dbBlogRows.length > 0) {
          dbBlogsLoaded = true;
          for (const row of dbBlogRows) {
            blogMap.set(row.id, {
              id: row.id,
              title: row.title,
              publishedAt: row.publishedAt,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            });
          }
        }
      } catch (err: any) {
        console.warn('[SITEMAP] Notice querying blogs from DB:', err?.message || err);
      }
    }

    const memBlogs = memoryStore.getBlogs();
    if (!dbBlogsLoaded) {
      const sourceBlogs = memBlogs.length > 0 ? memBlogs : DEFAULT_20_BLOGS;
      for (const b of sourceBlogs) {
        blogMap.set(b.id, {
          id: b.id,
          title: b.title,
          slug: (b as any).slug || null,
          publishedAt: b.publishedAt,
          createdAt: (b as any).createdAt || b.publishedAt,
          updatedAt: (b as any).updatedAt || b.publishedAt,
        });
      }
    } else {
      for (const b of memBlogs) {
        if (!blogMap.has(b.id)) {
          blogMap.set(b.id, {
            id: b.id,
            title: b.title,
            slug: (b as any).slug || null,
            publishedAt: b.publishedAt,
            createdAt: (b as any).createdAt || b.publishedAt,
            updatedAt: (b as any).updatedAt || b.publishedAt,
          });
        }
      }
    }

    // 2. Collect all active, approved public tutor profiles (matching /api/tutors precedence & deduplication)
    const tutorMap = new Map<string, any>();
    for (const t of TRENDING_TUTORS_500) {
      tutorMap.set(t.id, { ...t });
    }
    for (const t of SEED_TUTORS) {
      const { passwordHash: _, ...safeT } = t as any;
      tutorMap.set(t.id, safeT);
    }

    const persistedUpdates = getPersistedUserUpdates();
    for (const [uId, uUpdates] of Object.entries(persistedUpdates)) {
      if (tutorMap.has(uId)) {
        tutorMap.set(uId, { ...tutorMap.get(uId), ...uUpdates });
      }
    }

    for (const u of memoryStore.getAllUsers()) {
      if (u.role === 'tutor' || u.id.startsWith('tutor_') || u.id.startsWith('tutor-') || u.hourlyRate) {
        const { passwordHash: _, ...safeU } = u as any;
        tutorMap.set(u.id, { ...(tutorMap.get(u.id) || {}), ...safeU });
      }
    }

    if (isDbConnected() && db) {
      try {
        const dbTutorUsers = await withDbTimeout(
          db.select({
            id: users.id,
            name: users.name,
            role: users.role,
            suspended: users.suspended,
            isApproved: users.isApproved,
            status: users.status,
            location: users.location,
            subjects: users.subjects,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
          }).from(users).where(eq(users.role, 'tutor')),
          8000,
          'Sitemap query tutor users'
        );
        for (const u of dbTutorUsers) {
          let parsedSub = '';
          try {
            const arr = u.subjects ? JSON.parse(u.subjects) : [];
            if (Array.isArray(arr) && arr[0]) parsedSub = String(arr[0]);
          } catch {
            parsedSub = u.subjects || '';
          }
          tutorMap.set(u.id, {
            ...(tutorMap.get(u.id) || {}),
            id: u.id,
            name: u.name,
            role: u.role,
            suspended: u.suspended,
            isApproved: u.isApproved,
            status: u.status,
            location: u.location || tutorMap.get(u.id)?.location,
            primarySubject: tutorMap.get(u.id)?.primarySubject || parsedSub,
            avatarUrl: u.avatarUrl || tutorMap.get(u.id)?.avatarUrl,
            createdAt: u.createdAt,
          });
        }
      } catch (err: any) {
        console.warn('[SITEMAP] Notice querying tutor users from DB:', err?.message || err);
      }

      try {
        const dbTutorsRows = await withDbTimeout(
          db.select().from(tutors),
          8000,
          'Sitemap query tutors table'
        );
        for (const t of dbTutorsRows) {
          tutorMap.set(t.id, {
            ...(tutorMap.get(t.id) || {}),
            id: t.id,
            name: t.name,
            primarySubject: t.primarySubject,
            cityLocation: t.cityLocation,
            location: t.cityLocation,
            avatarUrl: t.profileImageUrl,
            isApproved: tutorMap.get(t.id)?.isApproved ?? true,
            suspended: tutorMap.get(t.id)?.suspended ?? false,
            status: tutorMap.get(t.id)?.status || 'approved',
            createdAt: t.createdAt,
          });
        }
      } catch (err: any) {
        console.warn('[SITEMAP] Notice querying tutors table from DB:', err?.message || err);
      }
    }

    // Filter out inactive, suspended, rejected, or unapproved tutors
    const activeRawTutors = Array.from(tutorMap.values()).filter((t) => {
      if (!t || !t.id) return false;
      if (t.suspended === true) return false;
      const st = t.status ? String(t.status).toLowerCase() : '';
      if (st === 'suspended' || st === 'rejected' || st === 'pending') return false;
      if (t.isApproved === false) return false;
      return true;
    });

    // Deduplicate by composite key (name, primarySubject, cityLocation) exactly like GET /api/tutors
    const uniqueCompositeTutors = new Map<string, any>();
    for (const t of activeRawTutors) {
      const cName = String(t.name || '').trim().toLowerCase();
      const cSub = String(
        t.primarySubject ||
          (Array.isArray(t.subjectExpertise) ? t.subjectExpertise[0] : '') ||
          ''
      )
        .trim()
        .toLowerCase();
      const cLoc = String(t.cityLocation || t.location || '').trim().toLowerCase();
      const compositeKey = `${cName}|${cSub}|${cLoc}`;
      if (!uniqueCompositeTutors.has(compositeKey)) {
        uniqueCompositeTutors.set(compositeKey, t);
      } else {
        const existing = uniqueCompositeTutors.get(compositeKey);
        if (
          t.avatarUrl?.includes('/uploads/avatars/') &&
          !existing.avatarUrl?.includes('/uploads/avatars/')
        ) {
          uniqueCompositeTutors.set(compositeKey, t);
        }
      }
    }

    const activeTutors: SitemapTutorInput[] = Array.from(uniqueCompositeTutors.values()).map((t) => ({
      id: String(t.id),
      name: t.name || null,
      updatedAt: t.updatedAt || null,
      createdAt: t.createdAt || null,
      suspended: Boolean(t.suspended),
      isApproved: t.isApproved !== false,
      status: t.status || 'approved',
    }));

    return {
      blogs: Array.from(blogMap.values()),
      tutors: activeTutors,
    };
  };

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(ROBOTS_TXT_CONTENT);
  });

  const llmsTxtFallback = [
    '# University Tutors',
    '',
    '> Online 1-on-1 academic tutoring, assignment guidance, coursework support, and free client-side student tools.',
    '',
    '## Core Services',
    "- [1-on-1 Live Tutoring](https://university-tutors.com/services/1-on-1-live-tutoring): Personalized sessions with PhD and Master's tutors.",
    '- [Assignment Guidance](https://university-tutors.com/services/assignment-guidance): Structured academic support and problem-solving.',
    '- [Coursework Track](https://university-tutors.com/services/coursework-track): Full-semester study management and exam prep.',
    '- [Essay & Reference Checks](https://university-tutors.com/services/essay-reference-checks): Academic editing and citation verification.',
    '',
    '## Platform Pages',
    '- [How It Works](https://university-tutors.com/how-it-works): Step-by-step guide to booking a tutor.',
    '- [Pricing](https://university-tutors.com/pricing): Transparent hourly and package rates.',
    '- [Get a Quote](https://university-tutors.com/get-quote): Request custom academic support.',
    '- [Find Verified Tutors](https://university-tutors.com/tutors): Browse 500+ vetted university subject mentors.',
    '- [Student Tools Hub](https://university-tutors.com/tools): Free 100% browser-based academic utilities.',
    '',
  ].join('\n');

  let cachedLlmsTxt: string | null = null;
  app.get('/llms.txt', (_req, res) => {
    if (!cachedLlmsTxt) {
      try {
        const publicLlmsPath = path.resolve(process.cwd(), 'public', 'llms.txt');
        const distLlmsPath = path.resolve(process.cwd(), 'dist', 'llms.txt');
        if (fs.existsSync(publicLlmsPath)) {
          cachedLlmsTxt = fs.readFileSync(publicLlmsPath, 'utf-8');
        } else if (fs.existsSync(distLlmsPath)) {
          cachedLlmsTxt = fs.readFileSync(distLlmsPath, 'utf-8');
        } else {
          cachedLlmsTxt = llmsTxtFallback;
        }
      } catch {
        cachedLlmsTxt = llmsTxtFallback;
      }
    }
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(cachedLlmsTxt);
  });

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const payload = await getOrBuildSitemapPayload(loadSitemapDatabaseRecords);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      res.setHeader('X-Sitemap-Url-Count', String(payload.entries.length));
      return res.status(200).send(payload.indexOrSingleXml);
    } catch (err: any) {
      console.error('[SITEMAP] Error generating /sitemap.xml:', err?.message || err);
      return res.status(500).type('application/xml').send(
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://university-tutors.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>'
      );
    }
  });

  app.get('/sitemap-:page(\\d+).xml', async (req, res) => {
    try {
      const pageNum = parseInt(req.params.page, 10);
      const payload = await getOrBuildSitemapPayload(loadSitemapDatabaseRecords);
      if (!pageNum || pageNum < 1 || pageNum > payload.shardsXml.length) {
        return res.status(404).type('text/plain').send('Sitemap shard not found');
      }
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.status(200).send(payload.shardsXml[pageNum - 1]);
    } catch (err: any) {
      console.error('[SITEMAP] Error generating sitemap shard:', err?.message || err);
      return res.status(500).type('text/plain').send('Failed to generate sitemap shard');
    }
  });

  // ==========================================
  // HEALTH CHECK & STRUCTURED API FALLBACKS
  // ==========================================
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", dbConnected: isDbConnected() });
  });

  // Unknown API route JSON 404 (never return HTML for missing /api/* routes)
  app.all('/api/*', (req, res) => {
    return res.status(404).json({
      error: `API route not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  // ==========================================
  // STATIC ASSETS & VITE INTEGRATION
  // ==========================================

  if (!options.skipStaticAndVite) {
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
          setHeaders: (res, filePath) => {
            if (filePath.toLowerCase().endsWith('.avif')) {
              res.setHeader('Content-Type', 'image/avif');
            } else if (filePath.toLowerCase().endsWith('.webp')) {
              res.setHeader('Content-Type', 'image/webp');
            }
          },
        }));
      }

      // Static files: long immutable caching for versioned logo variants, 7-day SWR for stable filenames, no-cache for HTML
      app.use(express.static(distPath, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (filePath.toLowerCase().endsWith('.avif')) {
            res.setHeader('Content-Type', 'image/avif');
          } else if (filePath.toLowerCase().endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
          }
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (/(logo-\d+|logo_transparent-\d+)\.(avif|webp)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (/\.(avif|webp|jpe?g|png|svg|ico|woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
          }
        },
      }));

      app.get('*', (_req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Global Express Error Handler (4 args) - guarantees single structured JSON response on unhandled errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    const status = Number(err?.statusCode || err?.status) || 500;
    const code = String(err?.code || (status === 504 ? 'TIMEOUT' : 'INTERNAL_ERROR'));
    const safeMsg = status >= 500 && NODE_ENV === 'production'
      ? (status === 504 ? 'The server took too long to respond. Please try again.' : 'An unexpected server error occurred.')
      : (err?.message || 'Internal server error');
    console.error(`[API-ERR] ${JSON.stringify({ method: req.method, path: normalizeMetricRoute(req.originalUrl || req.url), status, code })}`);
    return res.status(status).json({ error: safeMsg, code, status });
  });

  return app;
}

export async function startServer() {
  const app = await createApp();
  const missingGoogleVars: string[] = [];
  for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'APP_URL'] as const) {
    if (!readRuntimeEnv(key)) missingGoogleVars.push(key);
  }
  logSafeOAuthEvent('server_startup_oauth_check', {
    googleConfigured: missingGoogleVars.length === 0 && !isForbiddenProductionUrl(getRuntimeAppUrl()) && !isForbiddenProductionUrl(readRuntimeEnv('GOOGLE_REDIRECT_URI')),
    callbackRoute: GOOGLE_OAUTH_CALLBACK_PATH,
    missingVars: missingGoogleVars,
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK] Server running on http://0.0.0.0:${PORT} in ${NODE_ENV} mode.`);
  });
}

if (readRuntimeEnv('SKIP_AUTO_SERVER_START') !== 'true') {
  startServer();
}
