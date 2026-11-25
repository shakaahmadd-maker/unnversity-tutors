import 'dotenv/config';

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
import { eq, desc, and, inArray, isNull, or, sql } from 'drizzle-orm';
import { runMigrations, verifyUsersTableSchema } from './src/db/migrate';
import { memoryStore, PrivateFileRecord } from './src/db/memoryStore';
import { DEFAULT_20_BLOGS } from './src/data/defaultBlogsData';
import { TRENDING_TUTORS_500, TRENDING_TUTORS_200 } from './src/data/trendingTutors500Data';
import { CURATED_SPECIALIZED_TUTORS } from './src/data/tutorsDirectoryData';
import {
  API_ROBOTS_TXT_CONTENT,
  getOrBuildSitemapPayload,
  invalidateSitemapCache,
  ROBOTS_TXT_CONTENT,
  SitemapBlogInput,
  SitemapTutorInput,
} from './src/server/sitemapGenerator';
import { renderSeoHtml } from './src/server/ssrSeoRenderer';
import { getBlogCanonicalSlug, matchesBlogSlugOrId } from './src/utils/blogSlug';
import {
  getIndexNowKey,
  getIndexNowStatusSummary,
  queueIndexNowSubmission,
  submitToIndexNow,
  syncDiscoveredPagesWithIndexNow,
} from './src/server/indexNow';
import {
  assignUniqueTutorSlugs,
  getTutorCanonicalSlug,
  matchesTutorSlugOrId,
  withAssignedTutorSlugs,
} from './src/utils/tutorSlug';
import {
  AdminPermissionKey,
  isSuperAdminUser,
  isStaffUser,
  parsePermissions,
  hasModulePermission,
} from './src/lib/adminPermissions';
import {
  API_ROBOTS_TAG_HEADER,
  API_SUBDOMAIN_HOST,
  buildCanonicalMainSiteRedirectUrl,
  getNormalizedRequestHost,
  isApiOrUploadPath,
  isApiSubdomainRequest as checkApiSubdomainHost,
  isEquivalentMainWebsitePath,
} from './src/server/domainRouting';

function stripSurroundingQuotePair(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

// Bundler-safe runtime environment reader: reads strictly from process.env at runtime (zero hardcoded fallbacks)
export function readRuntimeEnv(key: string): string {
  const val = process.env[key];
  if (!val || typeof val !== 'string') return '';
  return stripSurroundingQuotePair(val);
}

const PORT = readRuntimeEnv('PORT') ? parseInt(readRuntimeEnv('PORT'), 10) : 3000;
const NODE_ENV = readRuntimeEnv('NODE_ENV') || 'production';

export function getRuntimeAppUrl(): string {
  return readRuntimeEnv('APP_URL').replace(/\/+$/, '');
}

export { API_ROBOTS_TAG_HEADER, API_SUBDOMAIN_HOST, getNormalizedRequestHost };

export function isApiSubdomainRequest(req: express.Request): boolean {
  return checkApiSubdomainHost(req, readRuntimeEnv('API_HOSTNAME'));
}

export function getConfiguredAdminInitialPassword(): string {
  const raw = process.env.ADMIN_INITIAL_PASSWORD;
  if (!raw || typeof raw !== 'string') return '';
  return stripSurroundingQuotePair(raw);
}

export function getConfiguredAdminEmail(): string {
  const raw = process.env.ADMIN_EMAIL;
  if (!raw || typeof raw !== 'string') return '';
  return stripSurroundingQuotePair(raw).toLowerCase();
}

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const SCRYPT_HASH_PATTERN = /^[a-f0-9]{16,64}:[a-f0-9]{128}$/i;

export function hasValidPasswordHash(passwordHash: unknown): passwordHash is string {
  if (!passwordHash || typeof passwordHash !== 'string') return false;
  return BCRYPT_HASH_PATTERN.test(passwordHash) || SCRYPT_HASH_PATTERN.test(passwordHash);
}

export function isAdministratorRole(role: unknown): boolean {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : '';
  return normalized === 'admin' || normalized === 'super_admin';
}

function isSyntheticTestAccountEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@universitytutors.test');
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
  'password_hash',
  'admin_email',
  'adminemail',
  'admin_initial_password',
  'admininitialpassword',
  'initial_admin_password',
  'initialadminpassword',
  'admin_password',
  'smtp_password',
  'smtppassword',
  'smtp_pass',
  'sessionsecret',
  'session_secret',
  'databaseurl',
  'database_url',
  'token',
  'code',
  'state',
  'stateprefix',
  'google_client_secret',
  'authorization_code',
  'callbackurl',
  'originalurl',
  'redirecturi',
]);

function extractSafeUrlHostname(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.hostname ? parsed.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

function getAllowedGoogleApiCallbackUris(): string[] {
  const allowed = new Set<string>([
    `https://${API_SUBDOMAIN_HOST}${GOOGLE_OAUTH_CALLBACK_PATH}`,
  ]);
  const configuredApiHost = readRuntimeEnv('API_HOSTNAME')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .trim()
    .toLowerCase();
  if (
    configuredApiHost &&
    configuredApiHost !== 'university-tutors.com' &&
    configuredApiHost !== 'www.university-tutors.com'
  ) {
    allowed.add(`https://${configuredApiHost}${GOOGLE_OAUTH_CALLBACK_PATH}`);
  }
  return Array.from(allowed);
}

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

export function logSafeAdminLoginFailure(
  reason: string,
  details: { email?: string; userId?: string; role?: string; active?: boolean; ip?: string } = {}
) {
  logSafeAuthEvent('admin_login_failed', {
    reason,
    userId: details.userId,
    role: details.role,
    active: details.active,
    ip: details.ip,
  });
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

const ALLOWED_UPLOAD_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/x-png',
]);

const ALLOWED_BLOG_IMAGE_MIMES = new Set([
  ...ALLOWED_UPLOAD_IMAGE_MIMES,
  'image/svg+xml',
]);

const ALLOWED_UPLOAD_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const ALLOWED_BLOG_IMAGE_EXTS = new Set([...ALLOWED_UPLOAD_IMAGE_EXTS, '.svg']);

function inferSafeImageExtension(
  originalname?: string,
  mimetype?: string,
  allowSvg: boolean = false
): string {
  const allowedExts = allowSvg ? ALLOWED_BLOG_IMAGE_EXTS : ALLOWED_UPLOAD_IMAGE_EXTS;
  const rawExt = path.extname(originalname || '').toLowerCase();
  if (rawExt === '.jfif') return '.jpg';
  if (allowedExts.has(rawExt)) return rawExt === '.jpeg' ? '.jpg' : rawExt;

  const mime = (mimetype || '').toLowerCase();
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('avif')) return '.avif';
  if (allowSvg && mime.includes('svg')) return '.svg';
  return '.jpg';
}

export async function saveUploadedImageBufferToUploads(
  buffer: Buffer,
  ext: string,
  folder: 'avatars' | 'blogs' | 'general' = 'blogs',
  prefix: string = 'media'
): Promise<{ relativeUrl: string; filename: string; filePath: string }> {
  const safePrefix = (prefix || 'media').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'media';
  const cleanExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const targetSubDir = path.join(UPLOADS_DIR, folder);
  await fs.promises.mkdir(targetSubDir, { recursive: true });
  await fs.promises.access(targetSubDir, fs.constants.W_OK);

  const stem = `${safePrefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const filename = `${stem}${cleanExt}`;
  const filePath = path.join(targetSubDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  if (folder === 'avatars' && cleanExt !== '.svg' && cleanExt !== '.gif') {
    await generateAvatarDerivatives(buffer, targetSubDir, stem);
  }

  console.info(`[UPLOADS] Saved uploaded asset to persistent disk: ${filePath}`);
  return {
    relativeUrl: `/uploads/${folder}/${filename}?v=${Date.now()}`,
    filename,
    filePath,
  };
}

// Helper to save base64 image data URI to persistent disk and return public path
export function saveBase64ImageToUploads(dataUriOrBase64: string, folder: string = 'avatars', prefix: string = 'avatar'): string {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') return dataUriOrBase64;
  if (!dataUriOrBase64.startsWith('data:image/') && !dataUriOrBase64.startsWith('data:application/')) {
    return dataUriOrBase64;
  }

  try {
    const match = dataUriOrBase64.match(/^data:image\/([a-zA-Z0-9.+_-]+);base64,(.+)$/);
    if (!match) return dataUriOrBase64;

    let ext = match[1].toLowerCase();
    if (ext === 'jpeg' || ext === 'pjpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    if (ext === 'x-png') ext = 'png';
    if (!['jpg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(ext)) ext = 'jpg';

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

    if (folder === 'avatars' && ext !== 'svg' && ext !== 'gif') {
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
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (
      ALLOWED_UPLOAD_IMAGE_MIMES.has(mime) ||
      ((!mime || mime === 'application/octet-stream') && (ALLOWED_UPLOAD_IMAGE_EXTS.has(ext) || ext === '.jfif'))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Supported formats: JPEG, PNG, WEBP, GIF, and AVIF.'));
    }
  }
});

// Multer Memory Storage Configuration for Blog & Editorial Media Uploads
export const blogMediaMulterUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (
      ALLOWED_BLOG_IMAGE_MIMES.has(mime) ||
      ((!mime || mime === 'application/octet-stream') && (ALLOWED_BLOG_IMAGE_EXTS.has(ext) || ext === '.jfif'))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Supported formats: JPEG, PNG, WEBP, GIF, AVIF, and SVG.'));
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

export function serializeSafeUser(rawUser: any) {
  if (!rawUser) return null;
  const { passwordHash: _ph, ...rest } = rawUser;
  const normalizedPermissions = parsePermissions(rawUser.permissions);
  const normalizedIsActive = rawUser.isActive !== false && rawUser.suspended !== true;
  return {
    ...rest,
    permissions: normalizedPermissions,
    isActive: normalizedIsActive,
    roleLabel: rawUser.roleLabel || null,
  };
}

// Secure Session Token using HMAC-SHA256 with unique session ID (jti)
export function createSessionToken(payload: {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  isActive?: boolean;
  roleLabel?: string | null;
}): string {
  const secret = getSessionSecret();
  const jti = crypto.randomBytes(16).toString('hex');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      permissions: payload.permissions ? parsePermissions(payload.permissions) : [],
      isActive: payload.isActive !== false,
      jti,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

export function verifySessionToken(token: string): {
  id: string;
  email: string;
  role: string;
  permissions?: AdminPermissionKey[];
  isActive?: boolean;
  roleLabel?: string | null;
  jti?: string;
} | null {
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
    // Seed each certified initial tutor individually without shared fallback passwords
    // (Initial administrator bootstrap is handled separately via ensureInitialAdministratorBootstrap)
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
  // Trust Dokploy + Traefik (and optional upstream CDN) proxy hops so req.hostname, req.ip, and req.protocol stay accurate
  app.set('trust proxy', true);

  // Prevent search engine indexing of every API/upload/health response and every response on api.university-tutors.com
  // Mounted before body parsers, CORS, and routes so error/400/413/401/403/404/500 responses all include X-Robots-Tag.
  app.use((req, res, next) => {
    if (isApiSubdomainRequest(req) || isApiOrUploadPath(req.path)) {
      res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
    }
    next();
  });

  app.use(compression());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
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
    const allowedProductionOrigins = new Set<string>([
      'https://university-tutors.com',
      'https://www.university-tutors.com',
      'https://api.university-tutors.com',
    ]);
    if (normalizedAppUrl) {
      allowedProductionOrigins.add(normalizedAppUrl);
    }

    const origin = req.headers.origin;
    if (origin) {
      if ((process.env.NODE_ENV || NODE_ENV) !== 'production' || allowedProductionOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    } else if (normalizedAppUrl) {
      res.setHeader('Access-Control-Allow-Origin', normalizedAppUrl);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Auth-Token, Cache-Control, Pragma, Expires'
    );
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Strict API Subdomain Isolation (https://api.university-tutors.com)
  // - Keeps /api/*, /uploads/*, and /health fully functional for the production frontend & auth/CORS.
  // - Serves a restrictive robots.txt on the API host (paired with X-Robots-Tag: noindex, nofollow, noarchive).
  // - Permanently 301-redirects equivalent main website pages (/, /tutors, /about-us, /assignment-guidance, /contact-us, etc.)
  //   to https://university-tutors.com preserving exact path and query string.
  // - Returns a clean JSON 404 for unknown non-API paths and NEVER serves index.html or SPA HTML on the API hostname.
  app.use((req, res, next) => {
    if (!isApiSubdomainRequest(req)) {
      return next();
    }

    res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);

    const reqPath = req.path || '/';
    if (isApiOrUploadPath(reqPath)) {
      return next();
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && reqPath === '/robots.txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(API_ROBOTS_TXT_CONTENT);
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && isEquivalentMainWebsitePath(reqPath)) {
      const redirectTarget = buildCanonicalMainSiteRedirectUrl(reqPath, req.originalUrl);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.redirect(301, redirectTarget);
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).json({
      error: 'Not Found',
      code: 'NOT_FOUND',
      status: 404,
    });
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
        const rows = await db
          .select()
          .from(users)
          .where(sql`lower(trim(${users.email})) = ${cleanEmail}`)
          .limit(1);
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

  interface AdministratorAuthDiagnosticState {
    adminEmailConfigured: boolean;
    adminPasswordConfigured: boolean;
    adminUserPresent: boolean;
    adminPasswordHashPresent: boolean;
    activeAdminWithValidHash: boolean;
  }

  async function inspectAdministratorAuthState(): Promise<AdministratorAuthDiagnosticState> {
    if (hasDatabaseUrl && !isDbConnected()) {
      await checkDbConnection();
    }
    const adminEmailConfigured = Boolean(getConfiguredAdminEmail());
    const adminPasswordConfigured = Boolean(getConfiguredAdminInitialPassword());
    let adminRecords: Array<{
      id: string;
      email?: unknown;
      role?: unknown;
      passwordHash?: unknown;
      isActive?: unknown;
      suspended?: unknown;
      deleted?: unknown;
    }> = [];

    if (isDbConnected() && db) {
      try {
        const rows = await db
          .select({
            id: users.id,
            email: users.email,
            role: users.role,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
            suspended: users.suspended,
          })
          .from(users)
          .where(sql`lower(trim(${users.role})) in ('admin', 'super_admin')`);
        adminRecords = rows.filter((r) => !isSyntheticTestAccountEmail(r.email));
      } catch (dbErr: any) {
        console.warn('[AUTH] Notice inspecting administrator state in PostgreSQL:', dbErr.message);
      }
    } else if (!hasDatabaseUrl) {
      const seenIds = new Set<string>();
      const persistedMap = getPersistedUserUpdates();
      for (const u of memoryStore.getAllUsers()) {
        const merged = persistedMap[u.id] ? { ...u, ...persistedMap[u.id] } : u;
        seenIds.add(u.id);
        if (
          isAdministratorRole(merged.role) &&
          merged.deleted !== true &&
          !isSyntheticTestAccountEmail(merged.email)
        ) {
          adminRecords.push(merged);
        }
      }
      for (const [uid, record] of Object.entries(persistedMap)) {
        if (seenIds.has(uid) || !record) continue;
        if (
          isAdministratorRole(record.role) &&
          record.deleted !== true &&
          !isSyntheticTestAccountEmail(record.email)
        ) {
          adminRecords.push({ ...record, id: uid });
        }
      }
    } else {
      // DATABASE_URL is configured at runtime, fallback only when PostgreSQL is offline in local/preview environments
      const seenIds = new Set<string>();
      const persistedMap = getPersistedUserUpdates();
      for (const u of memoryStore.getAllUsers()) {
        const merged = persistedMap[u.id] ? { ...u, ...persistedMap[u.id] } : u;
        seenIds.add(u.id);
        if (
          isAdministratorRole(merged.role) &&
          merged.deleted !== true &&
          !isSyntheticTestAccountEmail(merged.email)
        ) {
          adminRecords.push(merged);
        }
      }
      for (const [uid, record] of Object.entries(persistedMap)) {
        if (seenIds.has(uid) || !record) continue;
        if (
          isAdministratorRole(record.role) &&
          record.deleted !== true &&
          !isSyntheticTestAccountEmail(record.email)
        ) {
          adminRecords.push({ ...record, id: uid });
        }
      }
    }

    const adminUserPresent = adminRecords.length > 0;
    const adminPasswordHashPresent = adminRecords.some((u) => hasValidPasswordHash(u.passwordHash));
    const activeAdminWithValidHash = adminRecords.some(
      (u) => u.isActive !== false && u.suspended !== true && hasValidPasswordHash(u.passwordHash)
    );

    return {
      adminEmailConfigured,
      adminPasswordConfigured,
      adminUserPresent,
      adminPasswordHashPresent,
      activeAdminWithValidHash,
    };
  }

  function emitSafeAdminStartupDiagnostic(diag: AdministratorAuthDiagnosticState): void {
    console.log(`adminEmailConfigured=${diag.adminEmailConfigured}`);
    console.log(`adminPasswordConfigured=${diag.adminPasswordConfigured}`);
    console.log(`adminUserPresent=${diag.adminUserPresent}`);
    console.log(`adminPasswordHashPresent=${diag.adminPasswordHashPresent}`);
  }

  async function ensureInitialAdministratorBootstrap(): Promise<
    'exists' | 'created' | 'missing_config' | 'non_admin_email_exists'
  > {
    const currentState = await inspectAdministratorAuthState();
    // Never overwrite an existing administrator password during startup
    if (currentState.adminUserPresent) {
      return 'exists';
    }

    const configuredAdminEmail = getConfiguredAdminEmail();
    const configuredAdminPass = getConfiguredAdminInitialPassword();
    if (!configuredAdminEmail || !configuredAdminPass) {
      return 'missing_config';
    }

    // Never promote a Google OAuth user, student, or tutor to administrator just because the email matches,
    // and never create duplicate accounts.
    const existingByEmail = await resolveAuthoritativeUserByEmail(configuredAdminEmail);
    if (existingByEmail) {
      if (isAdministratorRole(existingByEmail.role) && existingByEmail.deleted !== true) {
        return 'exists';
      }
      logSafeAuthEvent('admin_bootstrap_skipped_existing_non_admin', {
        existingRole: typeof existingByEmail.role === 'string' ? existingByEmail.role : 'unknown',
      });
      return 'non_admin_email_exists';
    }

    const nowIso = new Date().toISOString();
    const allModules: AdminPermissionKey[] = ['blog', 'chats', 'orders', 'tutors', 'payments', 'settings'];
    const adminAvatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
    const initialAdminHash = hashPassword(configuredAdminPass);
    const deterministicAdminId =
      'admin_' + crypto.createHash('sha256').update(configuredAdminEmail).digest('hex').slice(0, 16);

    if (isDbConnected() && db) {
      await db
        .insert(users)
        .values({
          id: deterministicAdminId,
          role: 'admin',
          name: 'Administrator',
          fullName: 'Administrator',
          email: configuredAdminEmail,
          passwordHash: initialAdminHash,
          avatarUrl: adminAvatarUrl,
          createdAt: nowIso,
          updatedAt: nowIso,
          verified: true,
          suspended: false,
          isActive: true,
          roleLabel: 'Super Admin',
          permissions: JSON.stringify(allModules),
          bio: 'Platform Administrator.',
          country: 'US',
          isApproved: true,
          status: 'approved',
        })
        .onConflictDoNothing();

      try {
        await db
          .insert(userProfiles)
          .values({
            id: 'prof_' + deterministicAdminId,
            userId: deterministicAdminId,
            fullName: 'Administrator',
            email: configuredAdminEmail,
            role: 'admin',
            avatarUrl: adminAvatarUrl,
            country: 'US',
            createdAt: nowIso,
            updatedAt: nowIso,
          })
          .onConflictDoNothing();
      } catch {
        // Optional profile mirror; primary authentication resides in users table
      }

      logSafeAuthEvent('initial_admin_created', { role: 'admin' });
      return 'created';
    }

    const initialAdminRecord = {
      id: deterministicAdminId,
      role: 'admin' as const,
      name: 'Administrator',
      fullName: 'Administrator',
      email: configuredAdminEmail,
      passwordHash: initialAdminHash,
      avatarUrl: adminAvatarUrl,
      createdAt: nowIso,
      verified: true,
      suspended: false,
      isActive: true,
      deleted: false,
      roleLabel: 'Super Admin',
      permissions: allModules,
      bio: 'Platform Administrator.',
      country: 'US',
      isApproved: true,
      status: 'approved',
    };
    memoryStore.setUser(initialAdminRecord);
    savePersistedUserUpdate(initialAdminRecord.id, initialAdminRecord);
    logSafeAuthEvent('initial_admin_created', { role: 'admin' });
    return 'created';
  }

  // Check database connectivity, run migrations, bootstrap initial admin if needed, and ALWAYS log safe startup diagnostics
  if (!options.skipStaticAndVite) {
    await checkDbConnection();
    await runMigrations();
    await seedInitialDatabase();
    try {
      await ensureInitialAdministratorBootstrap();
    } catch (bootErr: any) {
      console.error('[AUTH] Initial administrator bootstrap error:', formatSafeDatabaseError(bootErr));
    }
    const startupAdminDiag = await inspectAdministratorAuthState();
    emitSafeAdminStartupDiagnostic(startupAdminDiag);
  } else if (!options.oauthUserRepo) {
    try {
      await ensureInitialAdministratorBootstrap();
    } catch (bootErr: any) {
      console.error('[AUTH] Initial administrator bootstrap error:', formatSafeDatabaseError(bootErr));
    }
    const startupAdminDiag = await inspectAdministratorAuthState();
    emitSafeAdminStartupDiagnostic(startupAdminDiag);
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
          if (authoritativeUser && !authoritativeUser.suspended && authoritativeUser.isActive !== false && authoritativeUser.deleted !== true) {
            (req as any).user = {
              id: authoritativeUser.id,
              email: authoritativeUser.email,
              role: authoritativeUser.role,
              name: authoritativeUser.name,
              permissions: parsePermissions(authoritativeUser.permissions),
              isActive: true,
              roleLabel: authoritativeUser.roleLabel || null,
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

  // Super Admin authorization requirement helper
  const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required. Please log in.',
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    if (!user.isActive || user.suspended || !isSuperAdminUser(user)) {
      return res.status(403).json({
        error: 'Forbidden: Super Administrator privileges required.',
        code: 'FORBIDDEN_SUPER_ADMIN',
        status: 403,
      });
    }
    next();
  };

  // Granular Sub-Admin module permission middleware
  const requirePermission = (...requiredModules: AdminPermissionKey[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized: Authentication required. Please log in.',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      if (user.isActive === false || user.suspended === true) {
        return res.status(403).json({
          error: 'Forbidden: Account access has been suspended or revoked.',
          code: 'ACCOUNT_SUSPENDED',
          status: 403,
        });
      }
      if (!isSuperAdminUser(user) && !requiredModules.some((mod) => hasModulePermission(user, mod))) {
        return res.status(403).json({
          error: `Forbidden: Missing required module permission (${requiredModules.join(' or ')}).`,
          code: 'FORBIDDEN_MODULE_PERMISSION',
          requiredModules,
          status: 403,
        });
      }
      next();
    };
  };

  // Helper to check chat room access authorization
  const canUserAccessRoom = async (userOrId: any, userRole: string, roomId: string): Promise<boolean> => {
    const userObj = typeof userOrId === 'object' && userOrId !== null ? userOrId : null;
    const userId = userObj ? userObj.id : String(userOrId || '');
    const canAdministerChats = userObj
      ? hasModulePermission(userObj, 'chats')
      : userRole === 'admin';
    if (canAdministerChats) return true;
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
    return memoryStore.isRoomMember(roomId, userId, canAdministerChats);
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

    // Admin & Subadmin supervisory oversight (must have chats or orders permission if subadmin)
    if (isSuperAdminUser(currentUser) || hasModulePermission(currentUser, 'orders') || hasModulePermission(currentUser, 'chats')) {
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
      const isMember = await canUserAccessRoom(currentUser, userRole, fileRecord.roomId);
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
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
      .split(',')[0]
      .trim()
      .toLowerCase();
    if (req.secure || forwardedProto === 'https') {
      return true;
    }
    const host = getNormalizedRequestHost(req);
    const isLocalHost = !host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
    if (!isLocalHost && ((process.env.NODE_ENV || NODE_ENV) === 'production' || getRuntimeAppUrl().startsWith('https://'))) {
      return true;
    }
    return false;
  }

  // Scope session cookies to .university-tutors.com in production so sessions persist seamlessly
  // between https://university-tutors.com and https://api.university-tutors.com.
  function resolveSessionCookieDomain(req: express.Request): string | undefined {
    const host = getNormalizedRequestHost(req);
    if (host === 'university-tutors.com' || host.endsWith('.university-tutors.com')) {
      return '.university-tutors.com';
    }
    return undefined;
  }

  // Helper to set secure HTTP-only session cookie consistently across frontend & API subdomains
  function setSecureSessionCookie(req: express.Request, res: express.Response, token: string, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) {
    const isHttps = isSecureCookieRequest(req);
    const cookieDomain = resolveSessionCookieDomain(req);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
    res.cookie('ut_session_active', '1', {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
  }

  function clearSecureSessionCookie(req: express.Request, res: express.Response) {
    const isHttps = isSecureCookieRequest(req);
    const cookieDomain = resolveSessionCookieDomain(req);
    // Clear host-only cookies (backwards compatibility)
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
    // Also clear shared cross-subdomain cookies in production
    if (cookieDomain) {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        domain: cookieDomain,
      });
      res.clearCookie('ut_session_active', {
        httpOnly: false,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        domain: cookieDomain,
      });
    }
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
        sessionToken = createSessionToken({
          id: newUserId,
          email: cleanEmail,
          role: userRole,
          permissions: [],
          isActive: true,
          roleLabel: null,
        });
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
      return res.status(201).json({
        success: true,
        user: serializeSafeUser(newUserRecord),
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

  // GET /api/auth/admin/status
  // Safe administrator configuration status endpoint returning ONLY { "configured": boolean, "adminUserPresent": boolean }
  app.get('/api/auth/admin/status', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    try {
      await ensureInitialAdministratorBootstrap();
      const diag = await inspectAdministratorAuthState();
      return res.status(200).json({
        configured: Boolean(diag.adminUserPresent && diag.activeAdminWithValidHash),
        adminUserPresent: Boolean(diag.adminUserPresent),
      });
    } catch {
      return res.status(200).json({
        configured: false,
        adminUserPresent: false,
      });
    }
  });

  // POST /api/auth/login (and POST /api/auth/admin/login)
  // Verifies email, valid bcrypt/scrypt password hash, administrator role (on admin portal), and active account status.
  const handlePasswordLogin = async (req: express.Request, res: express.Response, forceAdminPortal = false) => {
    try {
      const { email, password, adminPortal } = req.body || {};
      const isAdminPortalRequest = forceAdminPortal || adminPortal === true;
      const clientIp = getClientIp(req);

      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        if (isAdminPortalRequest) {
          logSafeAdminLoginFailure('missing_credentials', { ip: clientIp });
        }
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      if (isRateLimited(`login:${clientIp}:${cleanEmail}`, 15, 15 * 60 * 1000)) {
        if (isAdminPortalRequest) {
          logSafeAdminLoginFailure('rate_limited', { ip: clientIp });
        }
        return res.status(429).json({ error: 'Too many failed login attempts. Please wait and try again.' });
      }

      if (isAdminPortalRequest) {
        const bootstrapOutcome = await ensureInitialAdministratorBootstrap();
        const adminDiag = await inspectAdministratorAuthState();
        if (!adminDiag.adminUserPresent) {
          if (bootstrapOutcome === 'non_admin_email_exists') {
            logSafeAdminLoginFailure('admin_email_belongs_to_non_admin', { ip: clientIp });
            return res.status(503).json({
              code: 'ADMIN_BOOTSTRAP_CONFLICT',
              error: 'Initial administrator setup was skipped because the configured administrator email belongs to an existing non-administrator account. Configure a dedicated administrator email on the server.',
            });
          }
          logSafeAdminLoginFailure('admin_not_configured', { ip: clientIp });
          return res.status(503).json({
            code: 'ADMIN_AUTH_NOT_CONFIGURED',
            error: 'Administrator authentication is not configured on the server.',
          });
        }
      }

      const foundUser = await resolveAuthoritativeUserByEmail(cleanEmail);
      if (!foundUser) {
        if (isAdminPortalRequest) {
          logSafeAdminLoginFailure('user_not_found', { email: cleanEmail, ip: clientIp });
        }
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Enforce administrator role check for admin portal requests
      if (isAdminPortalRequest && !isStaffUser(foundUser)) {
        logSafeAdminLoginFailure('insufficient_role', {
          email: cleanEmail,
          userId: foundUser.id,
          role: String(foundUser.role || ''),
          ip: clientIp,
        });
        return res.status(403).json({
          code: 'FORBIDDEN_ADMIN_PORTAL',
          error: 'Access Denied: Administrator or Subadmin privileges are required to access this portal.',
        });
      }

      // Enforce active account status
      if (foundUser.suspended || foundUser.isActive === false || foundUser.deleted === true) {
        if (isAdminPortalRequest || isStaffUser(foundUser)) {
          logSafeAdminLoginFailure('account_inactive', {
            email: cleanEmail,
            userId: foundUser.id,
            role: String(foundUser.role || ''),
            active: false,
            ip: clientIp,
          });
        }
        return res.status(403).json({ error: 'This account has been suspended or revoked by a Super Administrator.' });
      }

      const activePasswordHash = foundUser.passwordHash;

      // Require a valid cryptographic password hash (never accept or store plaintext passwords).
      // Existing administrator accounts without a valid password hash are repaired via the secure reset flow.
      if (!hasValidPasswordHash(activePasswordHash)) {
        if (isStaffUser(foundUser)) {
          logSafeAdminLoginFailure('missing_or_invalid_password_hash', {
            email: cleanEmail,
            userId: foundUser.id,
            role: String(foundUser.role || ''),
            ip: clientIp,
          });
          return res.status(401).json({
            code: 'PASSWORD_RESET_REQUIRED',
            error: 'Please use the password reset flow below ("Forgot or set password?") to receive a recovery email and set your administrator password.',
          });
        }
        return res.status(401).json({
          code: 'SOCIAL_OR_NO_PASSWORD',
          error: 'No password is set for this account yet. Sign in with Google or Instagram, or click "Forgot password?" to establish a password.',
        });
      }

      const isValid = verifyPassword(password, activePasswordHash);
      if (!isValid) {
        if (isAdminPortalRequest || isStaffUser(foundUser)) {
          logSafeAdminLoginFailure('invalid_password', {
            email: cleanEmail,
            userId: foundUser.id,
            role: String(foundUser.role || ''),
            ip: clientIp,
          });
        }
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const userPermissions = parsePermissions(foundUser.permissions);
      const token = createSessionToken({
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        permissions: userPermissions,
        isActive: true,
        roleLabel: foundUser.roleLabel || null,
      });
      setSecureSessionCookie(req, res, token);

      let redirectUrl = '/student/dashboard';
      if (isStaffUser(foundUser)) {
        redirectUrl = '/admin';
      } else if (foundUser.role === 'tutor') {
        redirectUrl = '/tutor/dashboard';
      }

      await logAudit('USER_LOGIN', `User logged in: ${cleanEmail} (${foundUser.role})`, foundUser.id, foundUser.name, foundUser.role, req);

      return res.status(200).json({ success: true, user: serializeSafeUser(foundUser), token, redirectUrl });
    } catch (error: any) {
      console.error('[AUTH] Login error:', error.message);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };

  app.post('/api/auth/login', (req, res) => handlePasswordLogin(req, res, false));
  app.post('/api/auth/admin/login', (req, res) => handlePasswordLogin(req, res, true));

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
      if (!foundUser || foundUser.suspended || foundUser.isActive === false || foundUser.deleted === true) {
        clearSecureSessionCookie(req, res);
        return res.status(401).json({ user: null });
      }

      return res.status(200).json({ user: serializeSafeUser(foundUser) });
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

  function renderPasswordResetEmail(params: {
    userName?: string;
    emailLogoUrl?: string;
    resetUrl: string;
    resetToken?: string;
    appUrl?: string;
  }): { subject: string; text: string; html: string } {
    const userName = params.userName || 'Student';
    const liveDomain = params.appUrl || 'https://university-tutors.com';
    const logoUrl = params.emailLogoUrl || 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/uni-tutors%20logo.png?alt=media&token=b2796c13-d74a-45d7-9dc7-4a9723aa9440';
    const resetUrl = params.resetUrl;
    const tokenLineText = params.resetToken ? `\nRecovery token (if prompted on the reset screen):\n${params.resetToken}\n` : '';
    const tokenBoxHtml = params.resetToken
      ? `<div style="margin: 20px 0; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px;">One-Time Recovery Token</div>
          <code style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #0f172a; word-break: break-all;">${params.resetToken}</code>
        </div>`
      : '';

    const subject = 'Reset your University Tutors password';
    const text = `Hello ${userName},\n\nWe received a request to reset your University Tutors password.\n\nPlease reset your password by opening the link below:\n${resetUrl}\n${tokenLineText}\nThis link expires in 30 minutes and can only be used once.\n\nIf you did not request this change, you can safely ignore this email.\n\nSupport: support@university-tutors.com\nAdmin: admin@university-tutors.com`;

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
              ${tokenBoxHtml}
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

  interface SmtpRuntimeConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    fallbackFrom: string;
  }

  function getHostingerSmtpConfig(): SmtpRuntimeConfig | null {
    const host = readRuntimeEnv('SMTP_HOST') || readRuntimeEnv('MAIL_HOST');
    const portStr = readRuntimeEnv('SMTP_PORT') || readRuntimeEnv('MAIL_PORT');
    const secureRaw = (readRuntimeEnv('SMTP_SECURE') || readRuntimeEnv('MAIL_SECURE')).toLowerCase();
    const user = readRuntimeEnv('SMTP_USER') || readRuntimeEnv('SMTP_USERNAME') || readRuntimeEnv('MAIL_USER');
    const pass = readRuntimeEnv('SMTP_PASSWORD') || readRuntimeEnv('SMTP_PASS') || readRuntimeEnv('MAIL_PASSWORD') || readRuntimeEnv('MAIL_PASS');
    const configuredFrom = readRuntimeEnv('SMTP_FROM') || readRuntimeEnv('MAIL_FROM');

    if (!host || !user || !pass) {
      return null;
    }

    const parsedPort = portStr ? parseInt(portStr, 10) : NaN;
    const defaultPort = secureRaw === 'true' || secureRaw === '1' || secureRaw === 'ssl' ? 465 : 587;
    const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : defaultPort;
    const secure =
      port === 465
        ? true
        : port === 587
          ? false
          : secureRaw === 'true' || secureRaw === '1' || secureRaw === 'ssl';

    const authenticatedSender = user.includes('@') ? `University Tutors <${user}>` : user;
    const from = configuredFrom || authenticatedSender;

    return {
      host,
      port,
      secure,
      user,
      pass,
      from,
      fallbackFrom: authenticatedSender,
    };
  }

  async function sendMailViaHostingerSmtp(
    smtp: SmtpRuntimeConfig,
    mail: { to: string; subject: string; text: string; html: string },
    operationLabel: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      requireTLS: !smtp.secure && smtp.port === 587,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        servername: smtp.host,
      },
    });

    try {
      await withDbTimeout(
        transporter.sendMail({
          from: smtp.from,
          to: mail.to,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
        15000,
        operationLabel
      );
    } catch (firstErr: any) {
      const msg = String(firstErr?.message || '');
      const isSenderMismatch =
        smtp.from !== smtp.fallbackFrom &&
        (msg.includes('553') ||
          msg.includes('550') ||
          msg.toLowerCase().includes('sender address rejected') ||
          msg.toLowerCase().includes('not owned by user'));

      if (!isSenderMismatch) {
        throw firstErr;
      }

      await withDbTimeout(
        transporter.sendMail({
          from: smtp.fallbackFrom,
          to: mail.to,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
        15000,
        `${operationLabel} (authenticated sender fallback)`
      );
    }
  }

  async function deliverPasswordResetEmail(
    toEmail: string,
    resetToken: string,
    appUrl: string,
    userName?: string,
    isAdminAccount = false
  ): Promise<boolean> {
    const smtp = getHostingerSmtpConfig();
    if (!smtp) {
      console.warn('[AUTH] SMTP configuration missing: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required to deliver reset emails.');
      return false;
    }

    try {
      const liveDomain = appUrl || 'https://university-tutors.com';
      const resetPath = isAdminAccount ? '/admin' : '/auth';
      const resetUrl = `${liveDomain}${resetPath}?reset_token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;
      const emailContent = renderPasswordResetEmail({
        userName: userName || (isAdminAccount ? 'Administrator' : 'Student'),
        resetUrl,
        resetToken,
        appUrl: liveDomain,
      });

      await sendMailViaHostingerSmtp(
        smtp,
        {
          to: toEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        },
        'SMTP password reset delivery'
      );

      logSafeAuthEvent('reset email sent', { email: toEmail });
      return true;
    } catch (err: any) {
      if (err?.message?.includes('554 5.7.1') || err?.message?.includes('reserved for documentation')) {
        console.warn('[AUTH] SMTP notice: Test recipient domain is reserved (RFC 2606); email simulated successfully in test sandbox.');
      } else {
        console.error('[AUTH] Failed to dispatch password reset email via SMTP:', err?.code || 'SMTP_SEND_ERROR');
      }
      return false;
    }
  }

  async function deliverEmailVerificationEmail(toEmail: string, verificationToken: string, appUrl: string, userName?: string): Promise<boolean> {
    const smtp = getHostingerSmtpConfig();
    if (!smtp) {
      console.warn('[AUTH] SMTP configuration missing: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required to deliver email verification.');
      return false;
    }

    try {
      const liveDomain = appUrl || 'https://university-tutors.com';
      const verificationUrl = `${liveDomain}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(toEmail)}`;
      const emailContent = renderVerificationEmail({ userName: userName || 'Student', verificationUrl, appUrl: liveDomain });

      await sendMailViaHostingerSmtp(
        smtp,
        {
          to: toEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        },
        'SMTP verification delivery'
      );

      logSafeAuthEvent('verification email sent', { email: toEmail });
      return true;
    } catch (err: any) {
      if (err?.message?.includes('554 5.7.1') || err?.message?.includes('reserved for documentation')) {
        console.warn('[AUTH] SMTP notice: Test recipient domain is reserved (RFC 2606); email simulated successfully in test sandbox.');
      } else {
        console.error('[AUTH] Failed to dispatch email verification via SMTP:', err?.code || 'SMTP_SEND_ERROR');
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

      // Deliver reset email via Hostinger SMTP (using runtime SMTP_* variables without logging token or credentials)
      const requestOrigin = req.get('host') ? `${req.protocol}://${req.get('host')}` : '';
      const resolvedAppUrl = getRuntimeAppUrl() || requestOrigin || 'https://university-tutors.com';
      await deliverPasswordResetEmail(
        cleanEmail,
        rawToken,
        resolvedAppUrl,
        foundUser.name,
        isStaffUser(foundUser)
      );

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
      if (foundUser.suspended || foundUser.isActive === false || foundUser.deleted === true) {
        return res.status(403).json({ error: 'This account has been suspended or revoked by a Super Administrator.' });
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

      const sessionToken = createSessionToken({
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        permissions: parsePermissions(foundUser.permissions),
        isActive: foundUser.isActive !== false && !foundUser.suspended,
        roleLabel: foundUser.roleLabel || null,
      });
      setSecureSessionCookie(req, res, sessionToken);

      await logAudit('USER_PASSWORD_RESET', `Password updated via recovery token for: ${cleanEmail}`, foundUser.id, foundUser.name, foundUser.role, req);

      let redirectUrl = '/student/dashboard';
      if (isStaffUser(foundUser)) {
        redirectUrl = '/admin';
      } else if (foundUser.role === 'tutor') {
        redirectUrl = '/tutor/dashboard';
      }

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
        user: serializeSafeUser({ ...foundUser, passwordHash: newHash }),
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

  // Resolve the public origin where this backend serves /uploads/* assets
  // (e.g. https://api.university-tutors.com in production, NEVER the frontend-only static domain).
  function resolveBackendMediaOrigin(req?: express.Request): string {
    const configuredApiOrigin =
      readRuntimeEnv('PUBLIC_API_URL') ||
      readRuntimeEnv('API_BASE_URL') ||
      readRuntimeEnv('BACKEND_PUBLIC_URL');
    if (configuredApiOrigin) {
      try {
        const parsed = new URL(configuredApiOrigin);
        if (!isForbiddenProductionUrl(parsed.origin)) {
          return parsed.origin;
        }
      } catch {
        // ignore invalid env value
      }
    }
    if (req) {
      const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      const forwardedProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
      if (forwardedHost && !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(forwardedHost)) {
        const candidate = `${forwardedProto === 'http' ? 'http' : 'https'}://${forwardedHost}`;
        if (!isForbiddenProductionUrl(candidate)) {
          return candidate;
        }
      }
    }
    return '';
  }

  function formatPublicUploadUrl(req: express.Request | undefined, relativePath: string): string {
    if (!relativePath || /^https?:\/\//i.test(relativePath)) return relativePath;
    const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    const origin = resolveBackendMediaOrigin(req);
    return origin ? `${origin}${normalized}` : normalized;
  }

  // 1. GOOGLE OAUTH CONFIGURATION
  // Reads ONLY GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and APP_URL from runtime process.env.
  // Never derives GOOGLE_REDIRECT_URI from APP_URL when the API runs on a separate hostname (api.university-tutors.com).
  // Never uses fallback credentials, preview container URLs, localhost URLs, or dynamic container hosts.
  function getGoogleOAuthConfig() {
    const clientId = readRuntimeEnv('GOOGLE_CLIENT_ID');
    const clientSecret = readRuntimeEnv('GOOGLE_CLIENT_SECRET');
    const explicitRedirectUri = readRuntimeEnv('GOOGLE_REDIRECT_URI').replace(/\/+$/, '');
    const rawAppUrl = getRuntimeAppUrl();
    const redirectUriHostname = extractSafeUrlHostname(explicitRedirectUri);

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
        redirectUriHostname,
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
        redirectUriHostname,
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

    const allowedApiCallbackUris = new Set<string>(getAllowedGoogleApiCallbackUris());
    const expectedApiCallbackUri = `https://${API_SUBDOMAIN_HOST}${GOOGLE_OAUTH_CALLBACK_PATH}`;

    if (isForbiddenProductionUrl(explicitRedirectUri)) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: prodBase,
        redirectUri: '',
        redirectUriHostname,
        configured: false,
        missingVars: [] as string[],
        errorCode: 'redirect_uri_mismatch' as const,
        error: `Redirect URI mismatch: GOOGLE_REDIRECT_URI must be a valid HTTPS API callback URL matching ${expectedApiCallbackUri}.`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
      };
    }

    if (!allowedApiCallbackUris.has(explicitRedirectUri)) {
      return {
        id: 'google' as const,
        name: 'Google',
        clientId: undefined,
        clientSecret: undefined,
        appUrl: prodBase,
        redirectUri: '',
        redirectUriHostname,
        configured: false,
        missingVars: [] as string[],
        errorCode: 'redirect_uri_mismatch' as const,
        error: `Redirect URI mismatch: GOOGLE_REDIRECT_URI must point to the API backend callback ${expectedApiCallbackUri} (do not use APP_URL).`,
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
      redirectUri: explicitRedirectUri,
      redirectUriHostname,
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

    const prodBase = resolveProductionBaseUrl();
    const targetOrigin = prodBase || '*';
    const authReturnUrl = `${prodBase || ''}/auth?oauth_error=${encodeURIComponent(safeMsg)}`;

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

    if (targetUser.suspended || targetUser.isActive === false || targetUser.deleted === true) {
      return sendOAuthErrorResponse(
        req,
        res,
        403,
        'account_suspended',
        'This account has been suspended by an administrator.'
      );
    }

    // Keep Google OAuth strictly separate from administrator password login
    if (isStaffUser(targetUser)) {
      logSafeAdminLoginFailure('oauth_blocked_for_admin', {
        email: targetUser.email,
        userId: targetUser.id,
        role: String(targetUser.role || ''),
        ip: getClientIp(req),
      });
      return sendOAuthErrorResponse(
        req,
        res,
        403,
        'admin_password_login_required',
        'Administrator accounts must sign in with their administrator email and password on the Admin Portal.'
      );
    }

    if (!userLookupResult.created) {
      await logAudit('OAUTH_LOGIN', `User signed in via ${providerLabel}: ${targetUser.email} (${targetUser.role})`, targetUser.id, targetUser.name, targetUser.role, req);
    }

    const sessionToken = createSessionToken({
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      permissions: parsePermissions(targetUser.permissions),
      isActive: targetUser.isActive !== false && !targetUser.suspended,
      roleLabel: targetUser.roleLabel || null,
    });
    const isHttps = isSecureCookieRequest(req);
    setSecureSessionCookie(req, res, sessionToken);

    const prodBase = resolveProductionBaseUrl();
    let targetPath = '/student/dashboard';
    if (targetUser.role === 'tutor') {
      targetPath = '/tutor/dashboard';
    }
    const targetRedirectUrl = prodBase ? `${prodBase}${targetPath}` : targetPath;

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
        googleConfigured: false,
        redirectUriHostname: cfg.redirectUriHostname,
        callbackRoute: GOOGLE_OAUTH_CALLBACK_PATH,
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
    const cookieDomain = resolveSessionCookieDomain(req);
    res.cookie('oauth_state_google', signOAuthStateCookieValue('google', state, cfg.redirectUri), {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
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
      googleConfigured: true,
      redirectUriHostname: cfg.redirectUriHostname,
      callbackRoute: GOOGLE_OAUTH_CALLBACK_PATH,
      missingVars: cfg.missingVars,
    });

    return res.status(200).json({
      success: true,
      url: `${cfg.authUrl}?${params.toString()}`,
    });
  });

  const handleGoogleOAuthCallback = async (req: express.Request, res: express.Response) => {
    const cfg = getGoogleOAuthConfig();
    const isHttps = isSecureCookieRequest(req);
    const cookieDomain = resolveSessionCookieDomain(req);

    logSafeOAuthEvent('oauth_callback_received', {
      googleConfigured: cfg.configured,
      redirectUriHostname: cfg.redirectUriHostname,
      callbackRoute: GOOGLE_OAUTH_CALLBACK_PATH,
      missingVars: cfg.missingVars,
    });

    // Always clear one-time state cookie on callback execution (host-only and shared subdomain)
    const rawStateCookie = req.cookies?.oauth_state_google;
    if (rawStateCookie) {
      res.clearCookie('oauth_state_google', {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
      });
      if (cookieDomain) {
        res.clearCookie('oauth_state_google', {
          httpOnly: true,
          secure: isHttps,
          sameSite: 'lax',
          path: '/',
          domain: cookieDomain,
        });
      }
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

  app.get('/api/admin/dashboard', (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.', code: 'UNAUTHORIZED', status: 401 });
    }
    if (!isStaffUser(user)) {
      return res.status(403).json({ error: 'Forbidden: Staff administrator access required.', code: 'FORBIDDEN', status: 403 });
    }
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard authorized',
      user,
      allowedModules: isSuperAdminUser(user) ? 'ALL' : parsePermissions(user.permissions),
    });
  });

  // =========================================================================
  // SUPER ADMIN RBAC: SUB-ADMINS & PERMISSION MANAGEMENT
  // =========================================================================

  app.get('/api/admin/subadmins', requireSuperAdmin, async (_req, res) => {
    try {
      const merged = new Map<string, any>();

      for (const u of memoryStore.getAllUsers()) {
        if (u && (u.role === 'subadmin' || u.role === 'SUB_ADMIN' || u.role === 'admin' || u.role === 'SUPER_ADMIN')) {
          merged.set(u.id, u);
        }
      }

      const persistedMap = getPersistedUserUpdates();
      for (const [uid, rec] of Object.entries(persistedMap)) {
        if (!rec) continue;
        const base = merged.get(uid) || {};
        const combined = { ...base, ...rec, id: uid };
        if (combined.role === 'subadmin' || combined.role === 'SUB_ADMIN' || combined.role === 'admin' || combined.role === 'SUPER_ADMIN') {
          merged.set(uid, combined);
        }
      }

      if (isDbConnected() && db) {
        try {
          const rows = await withDbTimeout(
            db.select().from(users).where(inArray(users.role, ['admin', 'subadmin', 'SUPER_ADMIN', 'SUB_ADMIN'])),
            8000,
            'Select subadmin accounts'
          );
          for (const row of rows) {
            merged.set(row.id, { ...(merged.get(row.id) || {}), ...row });
          }
        } catch (dbErr: any) {
          console.warn('[RBAC] Notice fetching subadmins from DB:', dbErr.message);
        }
      }

      const list = Array.from(merged.values())
        .filter((u) => u && u.deleted !== true && u.status !== 'deleted')
        .map((u) => serializeSafeUser(u))
        .sort((a, b) => {
          const aSuper = isSuperAdminUser({ ...a, isActive: true, suspended: false }) ? 0 : 1;
          const bSuper = isSuperAdminUser({ ...b, isActive: true, suspended: false }) ? 0 : 1;
          if (aSuper !== bSuper) return aSuper - bSuper;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

      return res.status(200).json({ success: true, subadmins: list });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load sub-admins.' });
    }
  });

  app.post('/api/admin/subadmins', requireSuperAdmin, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { name, email, password, roleLabel, permissions, isActive } = req.body || {};

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Valid email address is required.' });
      }
      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await resolveAuthoritativeUserByEmail(cleanEmail);
      if (existing && existing.deleted !== true && existing.status !== 'deleted') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const parsedPerms = parsePermissions(permissions);
      const activeFlag = isActive !== false;
      const cleanLabel = typeof roleLabel === 'string' && roleLabel.trim() ? roleLabel.trim().slice(0, 80) : 'Sub-Administrator';
      const now = new Date().toISOString();
      const newId = 'subadmin_' + crypto.randomBytes(10).toString('hex');
      const pHash = hashPassword(password);

      const newRecord: any = {
        id: newId,
        role: 'subadmin',
        name: name.trim(),
        email: cleanEmail,
        passwordHash: pHash,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: now,
        verified: true,
        suspended: !activeFlag,
        isActive: activeFlag,
        permissions: JSON.stringify(parsedPerms),
        roleLabel: cleanLabel,
        bio: `${cleanLabel} at University Tutors.`,
        country: 'US',
        isApproved: true,
        status: activeFlag ? 'approved' : 'suspended',
      };

      memoryStore.setUser(newRecord);
      savePersistedUserUpdate(newId, newRecord);

      if (isDbConnected() && db) {
        try {
          await db.insert(users).values(newRecord);
        } catch (dbErr: any) {
          console.warn('[RBAC] Notice inserting subadmin into DB:', dbErr.message);
        }
      }

      await logAudit(
        'SUBADMIN_CREATE',
        `Created sub-admin ${cleanEmail} (${cleanLabel}) with modules: [${parsedPerms.join(', ')}]`,
        caller.id,
        caller.name,
        caller.role,
        req
      );

      return res.status(201).json({ success: true, subadmin: serializeSafeUser(newRecord) });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to create sub-admin.' });
    }
  });

  app.put('/api/admin/subadmins/:id', requireSuperAdmin, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { id } = req.params;
      const existing = await resolveAuthoritativeUserById(id);
      if (!existing || existing.deleted === true) {
        return res.status(404).json({ error: 'Staff account not found.' });
      }
      if (id === 'admin_shaka' || (isSuperAdminUser({ ...existing, isActive: true, suspended: false }) && req.body?.isActive === false)) {
        return res.status(403).json({ error: 'Super Administrator status cannot be deactivated.' });
      }

      const { name, roleLabel, permissions, isActive, password } = req.body || {};
      const updates: Record<string, any> = {};
      let shouldRevokeSessions = false;

      if (typeof name === 'string' && name.trim()) {
        updates.name = name.trim();
      }
      if (typeof roleLabel === 'string') {
        updates.roleLabel = roleLabel.trim().slice(0, 80) || 'Sub-Administrator';
      }
      if (permissions !== undefined) {
        const nextPerms = parsePermissions(permissions);
        const prevPerms = parsePermissions(existing.permissions);
        updates.permissions = JSON.stringify(nextPerms);
        if (JSON.stringify(nextPerms) !== JSON.stringify(prevPerms)) {
          shouldRevokeSessions = true;
        }
      }
      if (isActive !== undefined) {
        const activeFlag = Boolean(isActive);
        updates.isActive = activeFlag;
        updates.suspended = !activeFlag;
        updates.status = activeFlag ? 'approved' : 'suspended';
        if (!activeFlag) {
          shouldRevokeSessions = true;
        }
      }
      if (typeof password === 'string' && password.trim().length > 0) {
        if (password.trim().length < 8) {
          return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }
        updates.passwordHash = hashPassword(password.trim());
        shouldRevokeSessions = true;
      }

      const updatedRecord = { ...existing, ...updates, id };
      memoryStore.setUser(updatedRecord);
      savePersistedUserUpdate(id, updates);

      if (isDbConnected() && db) {
        try {
          const dbUpdates: Record<string, any> = {};
          for (const key of ['name', 'roleLabel', 'permissions', 'isActive', 'suspended', 'status', 'passwordHash']) {
            if (updates[key] !== undefined) dbUpdates[key] = updates[key];
          }
          if (Object.keys(dbUpdates).length > 0) {
            await db.update(users).set(dbUpdates).where(eq(users.id, id));
          }
        } catch (dbErr: any) {
          console.warn('[RBAC] Notice updating subadmin in DB:', dbErr.message);
        }
      }

      if (shouldRevokeSessions) {
        revokeAllSessionsForUser(id);
      }

      await logAudit(
        'SUBADMIN_UPDATE',
        `Updated sub-admin ${existing.email} (active=${updatedRecord.isActive !== false}, modules=[${parsePermissions(updatedRecord.permissions).join(', ')}])`,
        caller.id,
        caller.name,
        caller.role,
        req
      );

      return res.status(200).json({ success: true, subadmin: serializeSafeUser(updatedRecord) });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to update sub-admin.' });
    }
  });

  app.delete('/api/admin/subadmins/:id', requireSuperAdmin, async (req, res) => {
    try {
      const caller = (req as any).user;
      const { id } = req.params;
      if (caller.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own Super Administrator account.' });
      }
      const existing = await resolveAuthoritativeUserById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Sub-admin account not found.' });
      }
      if (isSuperAdminUser({ ...existing, isActive: true, suspended: false }) || id === 'admin_shaka') {
        return res.status(403).json({ error: 'Super Administrator accounts cannot be deleted.' });
      }

      revokeAllSessionsForUser(id);

      const tombstone = {
        deleted: true,
        isActive: false,
        suspended: true,
        status: 'deleted',
        permissions: JSON.stringify([]),
      };
      memoryStore.updateUser(id, tombstone as any);
      savePersistedUserUpdate(id, tombstone);

      if (isDbConnected() && db) {
        try {
          await db.delete(users).where(eq(users.id, id));
        } catch {
          try {
            await db.update(users).set({
              isActive: false,
              suspended: true,
              status: 'deleted',
              permissions: JSON.stringify([]),
            }).where(eq(users.id, id));
          } catch (dbErr: any) {
            console.warn('[RBAC] Notice revoking deleted subadmin in DB:', dbErr.message);
          }
        }
      }

      await logAudit('SUBADMIN_DELETE', `Removed sub-admin access for ${existing.email}`, caller.id, caller.name, caller.role, req);
      return res.status(200).json({ success: true, deletedId: id });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to remove sub-admin.' });
    }
  });

  // Protected Admin Performance Diagnostics Endpoint (non-sensitive route timing metrics only)
  app.get('/api/admin/diagnostics/performance', requirePermission('settings'), (_req, res) => {
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

  // GET /api/users - role-scoped, paginated user directory
  // Admins/subadmins receive all roles (students, tutors, admins) paginated;
  // Unauthenticated / student / tutor callers receive ONLY public approved tutors (+ own self record if logged in).
  app.get('/api/users', async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = Boolean(
        caller &&
        (isSuperAdminUser(caller) ||
          hasModulePermission(caller, 'tutors') ||
          hasModulePermission(caller, 'orders') ||
          hasModulePermission(caller, 'chats') ||
          hasModulePermission(caller, 'payments') ||
          hasModulePermission(caller, 'settings'))
      );
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
              isActive: users.isActive,
              permissions: users.permissions,
              roleLabel: users.roleLabel,
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
          const safeU = serializeSafeUser(u) || u;
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

      const tutorCandidatesForSlugs = resultUsers.filter(
        (u) => u && (u.role === 'tutor' || String(u.id || '').startsWith('tutor'))
      );
      const userTutorSlugMap = assignUniqueTutorSlugs(tutorCandidatesForSlugs);

      const total = resultUsers.length;
      const offset = (page - 1) * limit;
      const paginated = resultUsers.slice(offset, offset + limit).map((u) => {
        let enriched = u;
        if (u && (u.role === 'tutor' || String(u.id || '').startsWith('tutor'))) {
          enriched = {
            ...enriched,
            slug: getTutorCanonicalSlug(enriched, userTutorSlugMap),
          };
        }
        if (enriched?.avatarUrl && typeof enriched.avatarUrl === 'string' && !enriched.avatarVariants) {
          const meta = buildAvatarVariantMetadata(enriched.avatarUrl);
          if (meta) {
            return { ...enriched, ...meta };
          }
        }
        return enriched;
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

  const loadMergedPublicTutorCatalog = async (opts?: { activeOnly?: boolean }) => {
    const activeOnly = Boolean(opts?.activeOnly);
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
          'Select tutor users in loadMergedPublicTutorCatalog'
        );
        for (const du of dbTutorUsers) {
          const { passwordHash: _, ...safeDu } = du as any;
          tutorMap.set(du.id, { ...(tutorMap.get(du.id) || {}), ...safeDu, role: 'tutor' });
          dbAndRegisteredIds.add(du.id);
        }
      } catch (dbUserErr) {
        console.warn('[API] Notice querying users(role=tutor):', dbUserErr);
      }

      try {
        const dbTutorsList = await withDbTimeout(
          db.select().from(tutors),
          8000,
          'Select tutors table in loadMergedPublicTutorCatalog'
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
            createdAt: t.createdAt || existing.createdAt,
            role: 'tutor',
          });
          dbAndRegisteredIds.add(t.id);
        }
      } catch (dbErr) {
        console.warn('[API] Notice querying tutors table:', dbErr);
      }
    }

    let preparedTutors = Array.from(tutorMap.values())
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
          availability: publicT.availability || publicT.availabilities || 'Flexible global scheduling',
        };
      });

    if (activeOnly) {
      preparedTutors = preparedTutors.filter((t) => {
        if (t.suspended === true || t.status === 'suspended' || t.status === 'rejected') return false;
        if (t.isApproved === false || t.status === 'pending') return false;
        return true;
      });
      preparedTutors.sort((a, b) => {
        const aCore = dbAndRegisteredIds.has(a.id) ? 1 : 0;
        const bCore = dbAndRegisteredIds.has(b.id) ? 1 : 0;
        if (aCore !== bCore) return bCore - aCore;
        return (Number(b.rating) || 4.9) - (Number(a.rating) || 4.9);
      });
    }

    // STRICT ZERO DUPLICATES ENFORCEMENT: Deduplicate by composite key: (name, primarySubject, cityLocation)
    const uniqueCompositeMap = new Map<string, any>();
    const rawIdToCompositeKey = new Map<string, string>();
    for (const t of preparedTutors) {
      const cName = (t.name || '').trim().toLowerCase();
      const cSub = (t.primarySubject || (Array.isArray(t.subjectExpertise) ? t.subjectExpertise[0] : '') || '')
        .trim()
        .toLowerCase();
      const cLoc = (t.cityLocation || t.location || '').trim().toLowerCase();
      const compositeKey = `${cName}|${cSub}|${cLoc}`;
      rawIdToCompositeKey.set(String(t.id), compositeKey);
      if (!uniqueCompositeMap.has(compositeKey)) {
        uniqueCompositeMap.set(compositeKey, t);
      } else {
        const existing = uniqueCompositeMap.get(compositeKey);
        if (t.avatarUrl?.includes('/uploads/avatars/') && !existing.avatarUrl?.includes('/uploads/avatars/')) {
          uniqueCompositeMap.set(compositeKey, t);
        }
      }
    }

    const deduplicated = Array.from(uniqueCompositeMap.values());
    const slugMap = assignUniqueTutorSlugs(deduplicated);
    const allTutors = withAssignedTutorSlugs(deduplicated);

    const canonicalByCompositeKey = new Map<string, any>();
    for (const t of allTutors) {
      const cName = (t.name || '').trim().toLowerCase();
      const cSub = (t.primarySubject || (Array.isArray(t.subjectExpertise) ? t.subjectExpertise[0] : '') || '')
        .trim()
        .toLowerCase();
      const cLoc = (t.cityLocation || t.location || '').trim().toLowerCase();
      canonicalByCompositeKey.set(`${cName}|${cSub}|${cLoc}`, t);
    }

    const canonicalByRawId = new Map<string, any>();
    for (const [rawId, compKey] of rawIdToCompositeKey.entries()) {
      const canonical = canonicalByCompositeKey.get(compKey);
      if (canonical) {
        canonicalByRawId.set(rawId, canonical);
        canonicalByRawId.set(rawId.toLowerCase(), canonical);
      }
    }

    return {
      allTutors,
      slugMap,
      canonicalByRawId,
    };
  };

  const notifyTutorProfileIndexNow = async (tutorId: string, reason: string): Promise<void> => {
    try {
      const { allTutors, canonicalByRawId } = await loadMergedPublicTutorCatalog({ activeOnly: true });
      const matched =
        canonicalByRawId.get(tutorId) ||
        canonicalByRawId.get(String(tutorId).toLowerCase()) ||
        allTutors.find((t) => String(t.id) === String(tutorId));
      if (matched && matched.slug) {
        queueIndexNowSubmission([`/tutor/${encodeURIComponent(matched.slug)}`, '/tutors'], reason);
      }
    } catch (err: any) {
      console.warn(`[INDEXNOW] Notice resolving tutor slug for ${tutorId}:`, err?.message || err);
    }
  };

  // GET /api/tutors
  // Public directory search with CORS, searchable keywords matching, unique name-based slugs, and zero duplicates
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

      const { allTutors: baseTutors } = await loadMergedPublicTutorCatalog({ activeOnly });
      let allTutors = baseTutors;

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
  // Retrieves a single tutor profile by canonical name slug (including -2, -3 disambiguators) or legacy ID
  app.get('/api/tutors/:id', async (req, res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const rawParam = decodeURIComponent(req.params.id || '').trim();
      const lowerParam = rawParam.toLowerCase();

      const { allTutors, slugMap, canonicalByRawId } = await loadMergedPublicTutorCatalog({
        activeOnly: false,
      });

      // Priority 1: Exact canonical slug match (handles duplicate-name suffixes like -2, -3 accurately)
      let matchedTutor =
        allTutors.find((t) => t.slug === lowerParam) ||
        canonicalByRawId.get(rawParam) ||
        canonicalByRawId.get(lowerParam) ||
        allTutors.find((t) => matchesTutorSlugOrId(t, rawParam, slugMap));

      if (!matchedTutor || matchedTutor.deleted === true || matchedTutor.status === 'deleted') {
        return res.status(404).json({ error: `Tutor "${rawParam}" not found.` });
      }

      const safeTutor = { ...matchedTutor };
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
  // Protected multipart image upload controller for admin & sub-admin tutor headshots
  app.post('/api/admin/tutors/upload-avatar', (req, res) => {
    console.log('[UPLOAD] tutor avatar upload request received');

    // Require authentication & tutors module authorization (Super Admin or Sub-Admin with tutors permission)
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in as an administrator.' });
    }
    if (!hasModulePermission(currentUser, 'tutors')) {
      return res.status(403).json({ error: 'Forbidden: Tutors Management permission required to upload tutor avatars.' });
    }

    const handleAvatarUpload = async () => {
      try {
        let fileBuffer: Buffer | null = null;
        let fileExt = '.jpg';

        const uploadedFiles = Array.isArray((req as any).files) ? (req as any).files : [];
        const uploadedFile = (req as any).file || uploadedFiles[0] || null;

        if (uploadedFile) {
          if (uploadedFile.buffer) {
            fileBuffer = uploadedFile.buffer;
          } else if (uploadedFile.path && fs.existsSync(uploadedFile.path)) {
            fileBuffer = await fs.promises.readFile(uploadedFile.path);
          }
          fileExt = inferSafeImageExtension(uploadedFile.originalname, uploadedFile.mimetype, false);
        } else {
          // Fallback check for base64 in JSON body
          const { image, file, avatarUrl } = req.body || {};
          const dataUri = image || file || avatarUrl;
          if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
            const match = dataUri.match(/^data:image\/([a-zA-Z0-9.+_-]+);base64,(.+)$/);
            if (match) {
              let ext = match[1].toLowerCase();
              if (ext === 'jpeg' || ext === 'pjpeg') ext = 'jpg';
              if (ext === 'x-png') ext = 'png';
              fileExt = ALLOWED_UPLOAD_IMAGE_EXTS.has(`.${ext}`) ? `.${ext}` : '.jpg';
              fileBuffer = Buffer.from(match[2], 'base64');
            }
          }
        }

        if (!fileBuffer || fileBuffer.length === 0) {
          return res.status(400).json({ error: 'No image file uploaded. Supported formats: JPEG, PNG, WEBP, GIF, AVIF (max 15MB).' });
        }

        if (fileBuffer.length > 15 * 1024 * 1024) {
          return res.status(400).json({ error: 'Image size exceeds 15MB limit.' });
        }

        const saved = await saveUploadedImageBufferToUploads(fileBuffer, fileExt, 'avatars', 'avatar');
        const relativeUrl = saved.relativeUrl;
        const variantMeta = buildAvatarVariantMetadata(relativeUrl);

        // Save final relative path in PostgreSQL and local stores if tutorId was provided
        const targetTutorId = String(req.body?.tutorId || req.body?.userId || req.query?.tutorId || req.query?.userId || '').trim();
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

        const absoluteUrl = formatPublicUploadUrl(req, relativeUrl);
        return res.status(201).json({
          success: true,
          imageUrl: relativeUrl,
          url: absoluteUrl,
          relativeUrl,
          savedUrl: relativeUrl,
          filename: saved.filename,
          tutorId: targetTutorId || null,
          ...(variantMeta || {}),
        });
      } catch (uploadErr: any) {
        console.error('[UPLOAD] Error saving uploaded avatar:', uploadErr.message);
        return res.status(500).json({ error: uploadErr.message || 'Failed to process image upload.' });
      }
    };

    if (req.is('multipart/form-data')) {
      avatarMulterUpload.any()(req, res, (err: any) => {
        if (err) {
          console.error('[UPLOAD] Multer upload error:', err.message);
          return res.status(400).json({ error: err.message || 'Invalid image file or upload failed.' });
        }
        void handleAvatarUpload();
      });
    } else {
      void handleAvatarUpload();
    }
  });

  // POST /api/admin/tutors
  // Protected Admin/Subadmin Tutor Profile Creation with deduplication guarantee
  app.post('/api/admin/tutors', requirePermission('tutors'), (req, res, next) => {
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
      if (req.file && req.file.buffer) {
        const ext = inferSafeImageExtension(req.file.originalname, req.file.mimetype, false);
        const saved = await saveUploadedImageBufferToUploads(req.file.buffer, ext, 'avatars', 'avatar');
        finalImageUrl = saved.relativeUrl;
      } else if (finalImageUrl.startsWith('data:image/')) {
        finalImageUrl = saveBase64ImageToUploads(finalImageUrl, 'avatars', 'avatar');
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
      invalidateSitemapCache();
      void notifyTutorProfileIndexNow(tutorId, 'admin_create_tutor');

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
    // Protect endpoint with authentication and tutors module permission
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in as an administrator.' });
    }
    if (!hasModulePermission(currentUser, 'tutors')) {
      return res.status(403).json({ error: 'Forbidden: Tutors Management permission required to update tutor profiles.' });
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
      if (req.file && req.file.buffer) {
        const ext = inferSafeImageExtension(req.file.originalname, req.file.mimetype, false);
        const saved = await saveUploadedImageBufferToUploads(req.file.buffer, ext, 'avatars', `avatar_${id}`);
        updates.profileImageUrl = saved.relativeUrl;
        updates.avatarUrl = saved.relativeUrl;
      } else if (updates.profileImageUrl && updates.profileImageUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.profileImageUrl, 'avatars', `avatar_${id}`);
        updates.profileImageUrl = rel;
        updates.avatarUrl = rel;
      } else if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image/')) {
        const rel = saveBase64ImageToUploads(updates.avatarUrl, 'avatars', `avatar_${id}`);
        updates.avatarUrl = rel;
        updates.profileImageUrl = rel;
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
      invalidateSitemapCache();
      void notifyTutorProfileIndexNow(id, 'admin_update_tutor');

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
      const isCallerAdmin = Boolean(caller && hasModulePermission(caller, 'tutors'));
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
        invalidateSitemapCache();
        if (isApp) {
          void notifyTutorProfileIndexNow(existingAccount.id, 'tutor_updated_or_approved');
        }

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
      if (isApp) {
        void notifyTutorProfileIndexNow(newTutorId, 'tutor_created_approved');
      }

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
  // Strictly restricted to authenticated Super Administrators; requires explicit password
  app.post('/api/create-privileged-user', requireSuperAdmin, async (req, res) => {
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
        void notifyTutorProfileIndexNow(userId, 'privileged_tutor_created');
      }

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(200).json({ success: true, user: safeUser });
    } catch (err: any) {
      console.error('[API] Error in create-privileged-user:', err.message);
      return res.status(500).json({ error: 'Failed to create privileged user' });
    }
  });

  // PUT /api/users/:id
  // Protected: requires authentication; users can only update their own non-privileged profile fields unless Super Admin or permitted staff
  app.put('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const caller = (req as any).user;
      const callerIsSuperAdmin = isSuperAdminUser(caller);
      const canManageUsers = callerIsSuperAdmin || hasModulePermission(caller, 'tutors') || hasModulePermission(caller, 'settings');
      if (!canManageUsers && caller.id !== id) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to modify another user profile.' });
      }

      const updates = { ...req.body };
      delete updates.id;
      delete updates.passwordHash;
      delete updates.password;

      // Prevent privilege escalation: non-Super-Admins cannot alter role, permissions, active state, approval, verification, or suspension flags
      if (!canManageUsers) {
        delete updates.role;
        delete updates.permissions;
        delete updates.isActive;
        delete updates.roleLabel;
        delete updates.suspended;
        delete updates.isApproved;
        delete updates.status;
        delete updates.verified;
      } else if (!callerIsSuperAdmin) {
        delete updates.role;
        delete updates.permissions;
        delete updates.isActive;
        delete updates.roleLabel;
        if (updates.suspended !== undefined) {
          // Staff without Super Admin cannot suspend staff accounts
          const targetCheck = await resolveAuthoritativeUserById(id);
          if (targetCheck && isStaffUser(targetCheck)) {
            delete updates.suspended;
          }
        }
      }

      if (updates.permissions !== undefined) {
        updates.permissions = JSON.stringify(parsePermissions(updates.permissions));
      }
      if (updates.isActive !== undefined) {
        updates.isActive = Boolean(updates.isActive);
        updates.suspended = !updates.isActive;
      } else if (updates.suspended !== undefined) {
        updates.isActive = !Boolean(updates.suspended);
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
            'availableSlots', 'verified', 'suspended', 'isActive', 'permissions',
            'roleLabel', 'createdAt'
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

      if (updates.suspended || updates.isActive === false || updates.permissions !== undefined) {
        revokeAllSessionsForUser(id);
      }

      await logAudit('USER_UPDATE', `Updated user ${id} (image/profile update)`, id, undefined, undefined, req);
      if (mergedUser.role === 'tutor' || String(id).startsWith('tutor')) {
        invalidateSitemapCache();
        void notifyTutorProfileIndexNow(id, 'tutor_user_profile_updated');
      }

      return res.status(200).json({ success: true, user: serializeSafeUser(mergedUser) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/users/:id - Tutors Management or Super Admin soft+DB removal for user/tutor profiles
  app.delete('/api/users/:id', requirePermission('tutors'), async (req, res) => {
    try {
      const { id } = req.params;
      const caller = (req as any).user;
      if (caller && caller.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own active administrator account.' });
      }
      const targetUser = await resolveAuthoritativeUserById(id);
      if (targetUser && isStaffUser(targetUser) && !isSuperAdminUser(caller)) {
        return res.status(403).json({ error: 'Forbidden: Only a Super Administrator may delete staff accounts.' });
      }
      revokeAllSessionsForUser(id);

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
        if (hasModulePermission(currentUser, 'tutors') || hasModulePermission(currentUser, 'settings')) {
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
        if (order && !hasModulePermission(currentUser, 'orders') && !hasModulePermission(currentUser, 'chats') && order.studentId !== uploaderId && order.tutorId !== uploaderId) {
          return res.status(403).json({ error: 'Forbidden: You are not authorized to attach documents to this order.' });
        }
      }

      // If associated with a chat room, verify the authenticated user is an active member
      if (roomId && typeof roomId === 'string') {
        const isMember = await canUserAccessRoom(currentUser, uploaderRole, roomId);
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

  // POST /api/upload - Generic persistent upload endpoint for public images (blogs, avatars, general media)
  // Supports BOTH multipart/form-data (recommended for fast, zero-bloat uploads) and JSON base64 payloads.
  app.post('/api/upload', requireAuth, (req, res) => {
    const processUpload = async () => {
      try {
        const currentUser = (req as any).user;
        const rawFolder = String(req.body?.folder || req.query?.folder || 'general').trim().toLowerCase();
        const rawPrefix = String(req.body?.prefix || req.query?.prefix || 'file').trim();

        // Prevent private documents from being routed through general public endpoint
        if (rawFolder === 'documents') {
          return res.status(400).json({ error: 'Private documents must be uploaded via /api/upload-document.' });
        }

        // Restrict public blog uploads strictly to staff with Blog Manager permission (Super Admin & Blog Sub-Admins)
        if (rawFolder === 'blogs' && !hasModulePermission(currentUser, 'blog')) {
          return res.status(403).json({ error: 'Forbidden: Blog Manager permission required to upload blog media.' });
        }

        const safeFolder: 'avatars' | 'blogs' | 'general' =
          rawFolder === 'avatars' || rawFolder === 'blogs' ? rawFolder : 'general';
        const safePrefix = rawPrefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'file';

        const uploadedFiles = Array.isArray((req as any).files) ? (req as any).files : [];
        const uploadedFile = (req as any).file || uploadedFiles[0] || null;

        let fileBuffer: Buffer | null = null;
        let fileExt = '.jpg';

        if (uploadedFile) {
          fileBuffer = uploadedFile.buffer || (uploadedFile.path && fs.existsSync(uploadedFile.path)
            ? await fs.promises.readFile(uploadedFile.path)
            : null);
          fileExt = inferSafeImageExtension(uploadedFile.originalname, uploadedFile.mimetype, safeFolder === 'blogs');
        } else {
          const dataUri = req.body?.file || req.body?.image;
          if (!dataUri || typeof dataUri !== 'string') {
            return res.status(400).json({ error: 'Image file is required (multipart file or data URI).' });
          }
          const match = dataUri.match(/^data:image\/([a-zA-Z0-9.+_-]+);base64,(.+)$/);
          if (!match) {
            return res.status(400).json({ error: 'Invalid image payload. Expected a valid image file or base64 image data URI.' });
          }
          let ext = match[1].toLowerCase();
          if (ext === 'jpeg' || ext === 'pjpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
          if (ext === 'x-png') ext = 'png';
          const allowedExts = safeFolder === 'blogs' ? ALLOWED_BLOG_IMAGE_EXTS : ALLOWED_UPLOAD_IMAGE_EXTS;
          fileExt = allowedExts.has(`.${ext}`) ? `.${ext}` : '.jpg';
          fileBuffer = Buffer.from(match[2], 'base64');
        }

        if (!fileBuffer || fileBuffer.length === 0) {
          return res.status(400).json({ error: 'Uploaded image file is empty.' });
        }

        if (fileBuffer.length > 15 * 1024 * 1024) {
          return res.status(400).json({ error: 'Image exceeds the 15MB maximum upload size.' });
        }

        const saved = await saveUploadedImageBufferToUploads(fileBuffer, fileExt, safeFolder, safePrefix);
        const absoluteUrl = formatPublicUploadUrl(req, saved.relativeUrl);

        return res.status(200).json({
          success: true,
          url: saved.relativeUrl,
          relativeUrl: saved.relativeUrl,
          imageUrl: saved.relativeUrl,
          absoluteUrl,
          filename: saved.filename,
        });
      } catch (err: any) {
        console.error('[UPLOAD] /api/upload error:', err?.message || err);
        return res.status(500).json({ error: err?.message || 'Failed to save uploaded image to server storage.' });
      }
    };

    if (req.is('multipart/form-data')) {
      blogMediaMulterUpload.any()(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message || 'Invalid image upload.' });
        }
        void processUpload();
      });
    } else {
      void processUpload();
    }
  });

  // ==========================================
  // ORDERS (Assignments & Tutoring Requests)
  // ==========================================

  // Ensure a referenced student or tutor ID exists in the PostgreSQL `users` table before inserting FKs
  const ensureUserExistsInDb = async (userId: string | null | undefined, fallbackUser?: any): Promise<boolean> => {
    if (!userId || typeof userId !== 'string') return false;
    const cleanId = userId.trim();
    if (!cleanId) return false;
    if (!isDbConnected() || !db) return true;
    try {
      const existing = await withDbTimeout(
        db.select({ id: users.id }).from(users).where(eq(users.id, cleanId)).limit(1),
        6000,
        'Check referenced user in DB'
      );
      if (existing.length > 0) return true;

      const memUser = memoryStore.findUserById(cleanId);
      const seedUser = SEED_TUTORS.find((t) => t.id === cleanId);
      const curatedUser = CURATED_SPECIALIZED_TUTORS.find((t) => t.id === cleanId);
      const trendingUser = TRENDING_TUTORS_500.find((t) => t.id === cleanId);
      const source: any = memUser || seedUser || curatedUser || trendingUser || fallbackUser;
      if (!source) return false;

      const safeRole = String(source.role || (cleanId.startsWith('tutor') ? 'tutor' : cleanId.startsWith('admin') ? 'admin' : 'student')).toLowerCase();
      const rawSubjects = source.subjects || source.subjectExpertise;
      const serializedSubjects = Array.isArray(rawSubjects)
        ? JSON.stringify(rawSubjects)
        : typeof rawSubjects === 'string'
        ? rawSubjects
        : null;

      await withDbTimeout(
        db.insert(users).values({
          id: cleanId,
          role: safeRole,
          name: String(source.name || (safeRole === 'tutor' ? 'Academic Tutor' : 'Student')),
          email: String(source.email || `${cleanId}@university-tutors.com`).toLowerCase().trim(),
          passwordHash: null,
          avatarUrl: String(source.avatarUrl || source.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
          createdAt: String(source.createdAt || new Date().toISOString()),
          verified: source.verified !== undefined ? Boolean(source.verified) : true,
          suspended: Boolean(source.suspended),
          bio: source.bio || source.experience || null,
          hourlyRate: typeof source.hourlyRate === 'number' ? source.hourlyRate : null,
          rating: typeof source.rating === 'number' ? source.rating : null,
          reviewCount: typeof source.reviewCount === 'number' ? source.reviewCount : (typeof source.reviewsCount === 'number' ? source.reviewsCount : null),
          subjects: serializedSubjects,
          country: source.country || null,
          location: source.location || source.cityLocation || null,
          education: source.education || null,
          experience: source.experience || source.experienceSummary || null,
          subjectExpertise: serializedSubjects,
          availability: source.availability || null,
          isApproved: source.isApproved !== undefined ? Boolean(source.isApproved) : true,
          status: source.status || 'approved',
        }).onConflictDoNothing(),
        8000,
        'Upsert referenced user in DB'
      );
      return true;
    } catch (err: any) {
      console.warn(`[API] Notice ensuring user ${cleanId} exists in DB:`, err?.message || err);
      return false;
    }
  };

  // GET /api/orders - Role-scoped and paginated
  app.get('/api/orders', requireAuth, async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdmin = hasModulePermission(caller, 'orders') || hasModulePermission(caller, 'payments') || hasModulePermission(caller, 'chats');
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
      const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
      const offset = (page - 1) * limit;
      const statusFilter = (req.query.status as string || '').trim();
      const searchFilter = (req.query.search as string || '').toLowerCase().trim();

      const requestedStudentId = isAdmin ? (req.query.studentId as string | undefined) : (caller.role === 'student' ? caller.id : undefined);
      const requestedTutorId = isAdmin ? (req.query.tutorId as string | undefined) : (caller.role === 'tutor' ? caller.id : undefined);

      let dbRows: any[] = [];
      if (isDbConnected() && db) {
        try {
          if (requestedStudentId) {
            const studentEmail = !isAdmin && caller.email ? String(caller.email).toLowerCase().trim() : null;
            dbRows = await withDbTimeout(
              studentEmail
                ? db.select().from(orders).where(or(eq(orders.studentId, String(requestedStudentId)), eq(orders.studentId, studentEmail))).orderBy(desc(orders.createdAt))
                : db.select().from(orders).where(eq(orders.studentId, String(requestedStudentId))).orderBy(desc(orders.createdAt)),
              10000,
              'Query student orders'
            );
          } else if (requestedTutorId) {
            dbRows = await withDbTimeout(
              db.select().from(orders).where(eq(orders.tutorId, String(requestedTutorId))).orderBy(desc(orders.createdAt)),
              10000,
              'Query tutor orders'
            );
          } else if (isAdmin) {
            dbRows = await withDbTimeout(
              db.select().from(orders).orderBy(desc(orders.createdAt)),
              10000,
              'Query admin orders'
            );
          }
        } catch (dbErr: any) {
          console.warn('[API] Notice querying orders from DB:', dbErr.message);
        }
      }

      // Always merge memoryStore orders with DB rows so orders whose DB write fell back to memory are never hidden
      let memRows = memoryStore.getOrders(requestedStudentId, requestedTutorId);
      if (!isAdmin && caller.role === 'student' && caller.email) {
        const byEmail = memoryStore.getOrders(String(caller.email).toLowerCase().trim(), undefined);
        if (byEmail.length > 0) {
          const seen = new Set(memRows.map((o) => o.id));
          for (const o of byEmail) {
            if (!seen.has(o.id)) memRows.push(o);
          }
        }
      }

      const mergedMap = new Map<string, any>();
      for (const r of memRows) {
        mergedMap.set(r.id, r);
      }
      for (const r of dbRows) {
        const existing = mergedMap.get(r.id);
        if (!existing) {
          mergedMap.set(r.id, r);
        } else {
          const existingUpd = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const dbUpd = new Date(r.updatedAt || r.createdAt || 0).getTime();
          mergedMap.set(r.id, dbUpd >= existingUpd ? r : existing);
        }
      }

      let rows = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

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
      const isAdmin = hasModulePermission(caller, 'orders');
      const data = req.body || {};
      const orderId = data.id || 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const effectiveStudentId = isAdmin && data.studentId ? String(data.studentId) : caller.id;
      const normalizedTutorId =
        typeof data.tutorId === 'string' && data.tutorId.trim().length > 0 ? data.tutorId.trim() : null;

      if (!data.title || !data.subject) {
        return res.status(400).json({ error: 'Order title and subject are required.', code: 'VALIDATION_ERROR', status: 400 });
      }

      const newOrder = {
        id: orderId,
        studentId: effectiveStudentId,
        tutorId: normalizedTutorId,
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
        status: data.status || (normalizedTutorId ? 'In Progress' : 'Pending Tutor Assignment'),
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
          const studentExists = await ensureUserExistsInDb(effectiveStudentId, caller);
          const tutorExists = normalizedTutorId ? await ensureUserExistsInDb(normalizedTutorId) : false;
          if (studentExists) {
            await withDbTimeout(
              db.insert(orders).values({
                ...newOrder,
                tutorId: tutorExists ? normalizedTutorId : null,
              }).onConflictDoNothing(),
              10000,
              'Insert order'
            );
          }
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
      const isAdmin = hasModulePermission(caller, 'orders');
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

      if (updates.tutorId !== undefined) {
        updates.tutorId = typeof updates.tutorId === 'string' && updates.tutorId.trim().length > 0 ? updates.tutorId.trim() : null;
      }
      memoryStore.updateOrder(id, updates);

      if (isDbConnected() && db) {
        try {
          if (updates.tutorId) {
            const tutorExists = await ensureUserExistsInDb(updates.tutorId);
            if (!tutorExists) {
              updates.tutorId = null;
            }
          }
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
      const isAdmin = hasModulePermission(caller, 'orders');
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

  // GET /api/inquiries (Orders & Assignments module only, paginated)
  app.get('/api/inquiries', requirePermission('orders'), async (req, res) => {
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
          await ensureUserExistsInDb(currentUser.id, currentUser);
          let safeOrderId = newRoom.orderId;
          if (safeOrderId) {
            const ordExists = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, safeOrderId)).limit(1);
            if (ordExists.length === 0) safeOrderId = null;
          }
          await db.insert(chatRooms).values({ ...newRoom, orderId: safeOrderId }).onConflictDoNothing();
          for (const m of membersList) {
            const memberExists = await ensureUserExistsInDb(m.userId);
            if (memberExists) {
              await db.insert(chatRoomMembers).values(m).onConflictDoNothing();
            }
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
      const isAdmin = hasModulePermission(currentUser, 'chats');
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

      // Check authorization: caller must be a member or staff with chats permission
      const hasAccess = await canUserAccessRoom(currentUser, currentUser.role, roomId);
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

      // Caller can remove self, or must have Chats permission
      const isSelf = currentUser.id === targetUserId;
      const isAdmin = hasModulePermission(currentUser, 'chats');

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
      const hasAccess = await canUserAccessRoom(currentUser, currentUser.role, roomId);
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
      const hasAccess = await canUserAccessRoom(currentUser, currentUser.role, roomId);
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

      const isAdmin = hasModulePermission(currentUser, 'chats');
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
        const hasAccess = await canUserAccessRoom(currentUser, currentUser.role, String(chatId));
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
          if (hasModulePermission(currentUser, 'chats')) {
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

      const hasAccess = await canUserAccessRoom(currentUser, currentUser.role, targetRoomId);
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

      const isAdmin = hasModulePermission(currentUser, 'chats');
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
      const isAdmin = hasModulePermission(caller, 'orders') || hasModulePermission(caller, 'chats') || hasModulePermission(caller, 'payments');
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
  app.get('/api/audit-logs', requirePermission('settings'), async (req, res) => {
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
      const isAdmin = hasModulePermission(caller, 'settings') || hasModulePermission(caller, 'orders') || hasModulePermission(caller, 'payments') || hasModulePermission(caller, 'tutors');
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
      const isAdmin = hasModulePermission(caller, 'settings') || hasModulePermission(caller, 'orders') || hasModulePermission(caller, 'payments') || hasModulePermission(caller, 'tutors');
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
          const isAdmin = hasModulePermission(caller, 'settings');
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
      const isAdmin = hasModulePermission(caller, 'settings');
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
      const isAdmin = hasModulePermission(caller, 'payments');
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
      const isAdmin = hasModulePermission(caller, 'payments');
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
  app.put('/api/payments/:id', requirePermission('payments'), async (req, res) => {
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
      const isAdmin = hasModulePermission(caller, 'payments');
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
  app.post('/api/invoices', requirePermission('payments'), async (req, res) => {
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
  app.put('/api/invoices/:id', requirePermission('payments'), async (req, res) => {
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
            const normalizedRows = rows.map((r) => {
              let parsedTags: string[] = [];
              if (Array.isArray(r.tags)) parsedTags = r.tags;
              else if (typeof r.tags === 'string') {
                try { parsedTags = JSON.parse(r.tags); } catch { parsedTags = r.tags.split(',').map((t: string) => t.trim()).filter(Boolean); }
              }
              const normalized = {
                ...r,
                image: r.image,
                imageUrl: r.image,
                tags: parsedTags,
              };
              memoryStore.setBlog(normalized);
              return normalized;
            });
            return res.status(200).json({
              success: true,
              blogs: normalizedRows.slice(offset, offset + limit),
              total: normalizedRows.length,
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
            const row = rows[0];
            return res.status(200).json({
              blog: {
                ...row,
                imageUrl: row.image,
                tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
              },
            });
          }
          const allDbBlogs = await withDbTimeout(
            db.select().from(blogs).orderBy(desc(blogs.publishedAt)),
            8000,
            'Query blogs for slug lookup'
          );
          const slugMatched = allDbBlogs.find((b) => matchesBlogSlugOrId(b, target));
          if (slugMatched) {
            return res.status(200).json({
              blog: {
                ...slugMatched,
                imageUrl: slugMatched.image,
                tags: typeof slugMatched.tags === 'string' ? JSON.parse(slugMatched.tags) : (slugMatched.tags || []),
              },
            });
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

  // POST /api/blogs (Blog Manager create)
  app.post('/api/blogs', requirePermission('blog'), async (req, res) => {
    try {
      const user = (req as any).user;

      const {
        title,
        slug: rawSlug,
        excerpt,
        content,
        author,
        category,
        readTime,
        imageUrl,
        image,
        altText,
        tags,
        featured,
        metaDescription,
        focusKeyword,
        longTailKeywords,
        lsiKeywords,
        publishedAt: rawPublishedAt,
      } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Missing required fields: title, content, category' });
      }

      const now = new Date().toISOString();
      const slug = (typeof rawSlug === 'string' && rawSlug.trim())
        ? rawSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
        : ((title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`);
      const imgUrl = (imageUrl || image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80').trim();
      const tagsArray: string[] = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [category]);

      const newBlog = {
        id: 'blog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        adminId: user.id || 'admin_shaka',
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || title.trim(),
        content: content.trim(),
        author: (typeof author === 'string' && author.trim()) ? author.trim() : (user.name || 'Editorial Team'),
        image: imgUrl,
        imageUrl: imgUrl,
        altText: typeof altText === 'string' ? altText.trim() : title.trim(),
        category: category.trim(),
        publishedAt: (typeof rawPublishedAt === 'string' && rawPublishedAt.trim()) ? rawPublishedAt.trim() : now,
        readTime: readTime?.trim() || '5 min read',
        tags: tagsArray,
        featured: !!featured,
        metaDescription: typeof metaDescription === 'string' ? metaDescription.trim() : (excerpt?.trim() || title.trim()),
        focusKeyword: typeof focusKeyword === 'string' ? focusKeyword.trim() : '',
        longTailKeywords: typeof longTailKeywords === 'string' ? longTailKeywords.trim() : '',
        lsiKeywords: typeof lsiKeywords === 'string' ? lsiKeywords.trim() : '',
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
            slug: newBlog.slug,
            excerpt: newBlog.excerpt,
            content: newBlog.content,
            author: newBlog.author,
            image: newBlog.image,
            altText: newBlog.altText,
            category: newBlog.category,
            readTime: newBlog.readTime,
            tags: JSON.stringify(newBlog.tags),
            featured: newBlog.featured,
            metaDescription: newBlog.metaDescription,
            focusKeyword: newBlog.focusKeyword,
            longTailKeywords: newBlog.longTailKeywords,
            lsiKeywords: newBlog.lsiKeywords,
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
      queueIndexNowSubmission(
        [`/blog/${encodeURIComponent(getBlogCanonicalSlug(newBlog))}`, '/blog'],
        'blog_published'
      );

      return res.status(201).json({ success: true, blog: newBlog });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/blogs/:id (Blog Manager update)
  app.put('/api/blogs/:id', requirePermission('blog'), async (req, res) => {
    try {
      const user = (req as any).user;

      const { id } = req.params;
      const body = { ...req.body };
      delete body.id;
      const now = new Date().toISOString();

      const parsedTags: string[] | undefined = Array.isArray(body.tags)
        ? body.tags
        : (typeof body.tags === 'string'
          ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : undefined);

      const resolvedImage = body.imageUrl || body.image;
      const memUpdates: Record<string, any> = {
        ...body,
        updatedAt: now,
      };
      if (parsedTags !== undefined) memUpdates.tags = parsedTags;
      if (resolvedImage) {
        memUpdates.image = resolvedImage;
        memUpdates.imageUrl = resolvedImage;
      }

      const updated = memoryStore.updateBlog(id, memUpdates);

      if (isDbConnected() && db) {
        try {
          const dbCols: Record<string, any> = { updatedAt: now };
          const allowedBlogCols = [
            'title', 'slug', 'excerpt', 'content', 'author', 'altText', 'category',
            'readTime', 'featured', 'metaDescription', 'focusKeyword',
            'longTailKeywords', 'lsiKeywords', 'publishedAt'
          ];
          for (const col of allowedBlogCols) {
            if (body[col] !== undefined) dbCols[col] = body[col];
          }
          if (resolvedImage) dbCols.image = resolvedImage;
          if (parsedTags !== undefined) dbCols.tags = JSON.stringify(parsedTags);
          await db.update(blogs).set(dbCols).where(eq(blogs.id, id));
        } catch (dbErr: any) {
          console.warn('[API] Notice updating blog in DB:', dbErr.message);
        }
      }

      await logAudit('BLOG_UPDATE', `Updated blog ${id}: "${body.title || 'updated'}"`, user.id, user.name, user.role, req);
      invalidateSitemapCache();
      const blogForSlug =
        updated ||
        (body.title ? { id, title: String(body.title), slug: body.slug || null } : null);
      if (blogForSlug && blogForSlug.title) {
        queueIndexNowSubmission(
          [`/blog/${encodeURIComponent(getBlogCanonicalSlug(blogForSlug))}`, '/blog'],
          'blog_updated'
        );
      }

      return res.status(200).json({ success: true, blog: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/blogs/:id (Blog Manager delete)
  app.delete('/api/blogs/:id', requirePermission('blog'), async (req, res) => {
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

  // POST /api/blogs/sync-defaults (Blog Manager reset/sync all 20 default educational blogs)
  app.post('/api/blogs/sync-defaults', requirePermission('blog'), async (req, res) => {
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
      queueIndexNowSubmission(
        ['/blog', ...syncedBlogs.map((b: any) => `/blog/${encodeURIComponent(getBlogCanonicalSlug(b))}`)],
        'blog_sync_defaults'
      );

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

    // 2. Collect all active, approved public tutor profiles with canonical name-based slugs
    const { allTutors: activeMergedTutors } = await loadMergedPublicTutorCatalog({
      activeOnly: true,
    });

    const activeTutors: SitemapTutorInput[] = activeMergedTutors.map((t) => ({
      id: String(t.id),
      name: t.name || null,
      slug: t.slug || null,
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

  // IndexNow plain-text root verification file: /<INDEXNOW_KEY>.txt -> exact key string
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const activeIndexNowKey = getIndexNowKey();
    if (req.path === `/${activeIndexNowKey}.txt`) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(activeIndexNowKey);
    }
    return next();
  });

  // Admin & CI/CD IndexNow diagnostic & manual/bulk submission endpoints
  app.get('/api/admin/indexnow', requirePermission('settings', 'blog'), (_req, res) => {
    return res.status(200).json({
      success: true,
      ...getIndexNowStatusSummary(),
    });
  });

  app.post('/api/admin/indexnow', async (req, res) => {
    try {
      const caller = (req as any).user;
      const isAdminCaller = Boolean(caller && (isSuperAdminUser(caller) || hasModulePermission(caller, 'settings') || hasModulePermission(caller, 'blog')));
      const headerKey = String(req.headers['x-indexnow-key'] || '').trim();
      const bearerHeader = String(req.headers['authorization'] || '').trim();
      const bearerToken = bearerHeader.toLowerCase().startsWith('bearer ')
        ? bearerHeader.slice(7).trim()
        : '';
      const expectedKey = getIndexNowKey();
      const hasValidKeyAuth =
        (headerKey && headerKey === expectedKey) || (bearerToken && bearerToken === expectedKey);

      if (!isAdminCaller && !hasValidKeyAuth) {
        return res.status(401).json({
          error: 'Unauthorized: Administrator session or valid X-IndexNow-Key header required.',
        });
      }

      const { urls, scope } = req.body || {};
      let targetUrls: string[] = [];

      if (urls && (typeof urls === 'string' || Array.isArray(urls))) {
        targetUrls = Array.isArray(urls) ? urls : [urls];
      } else {
        const requestedScope = String(scope || 'all').toLowerCase();
        const payload = await getOrBuildSitemapPayload(loadSitemapDatabaseRecords, true);
        const allLocs = payload.entries.map((e) => e.loc);

        if (requestedScope === 'tools') {
          targetUrls = allLocs.filter((loc) => loc.includes('/tools'));
        } else if (requestedScope === 'blogs') {
          targetUrls = allLocs.filter((loc) => loc.includes('/blog'));
        } else if (requestedScope === 'tutors') {
          targetUrls = allLocs.filter((loc) => loc.includes('/tutor/') || loc.endsWith('/tutors'));
        } else {
          targetUrls = allLocs;
        }
      }

      const result = await submitToIndexNow(targetUrls, {
        force: true,
        reason: `manual_api_${scope || 'custom'}`,
      });

      return res.status(200).json({
        success: result.submitted,
        ...result,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || 'Failed to submit URLs to IndexNow',
      });
    }
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (isApiSubdomainRequest(req)) {
      res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(API_ROBOTS_TXT_CONTENT);
    }
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(ROBOTS_TXT_CONTENT);
  });

  // Backwards-compatible 301 Permanent Redirect from legacy /tutor/tutor_global_XXX (and /tutors/:id, /tutor-profile/:id) to /tutor/<tutor-name-slug>
  app.get(['/tutor/:slugOrId', '/tutors/:slugOrId', '/tutor-profile/:slugOrId'], async (req, res, next) => {
    try {
      let rawParam = req.params.slugOrId || '';
      try {
        rawParam = decodeURIComponent(rawParam).trim();
      } catch {
        rawParam = String(req.params.slugOrId || '').trim();
      }

      if (!rawParam || rawParam.toLowerCase() === 'dashboard' || rawParam.includes('.')) {
        return next();
      }

      const { allTutors, slugMap, canonicalByRawId } = await loadMergedPublicTutorCatalog({
        activeOnly: false,
      });
      const lowerParam = rawParam.toLowerCase();

      const matched =
        allTutors.find((t) => t.slug === lowerParam) ||
        canonicalByRawId.get(rawParam) ||
        canonicalByRawId.get(lowerParam) ||
        allTutors.find((t) => matchesTutorSlugOrId(t, rawParam, slugMap));

      if (matched && matched.slug) {
        const canonicalPath = `/tutor/${encodeURIComponent(matched.slug)}`;
        if (req.path !== canonicalPath) {
          const qIdx = req.originalUrl.indexOf('?');
          const querySuffix = qIdx >= 0 ? req.originalUrl.slice(qIdx) : '';
          return res.redirect(301, `${canonicalPath}${querySuffix}`);
        }
      }

      return next();
    } catch {
      return next();
    }
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

  const ardManifestFallbackObj = {
    '@context': 'https://agenticresourcediscovery.org/context/v1',
    entries: [
      {
        identifier: 'urn:air:university-tutors.com:platform:overview',
        displayName: 'University Tutors Platform & Services Guide',
        type: 'text/markdown',
        url: 'https://university-tutors.com/llms.txt',
        description:
          'Machine-readable overview of University Tutors (university-tutors.com), covering verified 1-on-1 live academic tutoring, assignment guidance, semester coursework tracks, essay and citation review, and platform navigation.',
        representativeQueries: [
          'what academic tutoring services does university-tutors.com offer',
          'find 1-on-1 online university tutoring and coursework guidance',
          'how does university tutors verify mentors and protect payments in escrow',
        ],
      },
      {
        identifier: 'urn:air:university-tutors.com:api:tutors',
        displayName: 'University Tutors Public Directory API',
        type: 'application/json',
        url: 'https://university-tutors.com/api/tutors',
        description:
          'Live JSON API endpoint returning active, vetted university tutors with subject specializations, academic credentials, hourly rates, ratings, and availability across STEM, humanities, business, and medicine.',
        representativeQueries: [
          'query active university tutors and subject specialists via json api',
          'search verified phd and masters tutors by subject or hourly rate',
          'retrieve live tutor profiles and availability on university-tutors.com',
        ],
      },
      {
        identifier: 'urn:air:university-tutors.com:directory:tutors',
        displayName: 'Find Verified University Tutors Directory',
        type: 'text/html',
        url: 'https://university-tutors.com/tutors',
        description:
          'Interactive public directory of 500+ verified university tutors filterable by subject, country, university background, rating, and hourly rate with direct profile views and 1-on-1 booking.',
        representativeQueries: [
          'find a verified university tutor for calculus organic chemistry or statistics',
          'browse online university tutors in the us uk canada and australia',
          'compare tutor credentials hourly rates and student reviews',
        ],
      },
      {
        identifier: 'urn:air:university-tutors.com:services:quote-request',
        displayName: 'Request a Tutoring & Coursework Milestone Quote',
        type: 'text/html',
        url: 'https://university-tutors.com/get-quote',
        description:
          'Transparent pricing calculator and custom academic support quote request page for 1-on-1 tutoring sessions, assignment guidance, dissertation coaching, and semester coursework packages.',
        representativeQueries: [
          'get a quote for university tutoring or assignment guidance',
          'check hourly tutoring rates and coursework package pricing',
          'request a custom milestone quote from an academic specialist',
        ],
      },
      {
        identifier: 'urn:air:university-tutors.com:content:blog',
        displayName: 'University Tutors Academic Blog & Study Guides',
        type: 'text/html',
        url: 'https://university-tutors.com/blog',
        description:
          'Published academic study guides, citation manuals (APA, MLA, Harvard, Chicago), research methodology tutorials, dissertation structuring advice, and exam preparation articles.',
        representativeQueries: [
          'read university study guides on apa citations and essay structure',
          'how to write a university lab report or literature review',
          'academic integrity tips and exam preparation strategies for college students',
        ],
      },
      {
        identifier: 'urn:air:university-tutors.com:utilities:student-tools',
        displayName: 'Free Client-Side Student & STEM Tools Suite',
        type: 'text/html',
        url: 'https://university-tutors.com/tools',
        description:
          'Free, 100% browser-based student utilities including 27 Mathematics & Statistics calculators, 14 Biology & Genetics simulators, 16 Chemistry & Spectroscopy solvers, Interactive Whiteboard, Academic CV Maker, PDF Toolkit, Citation Generator, and International University Grade Converter.',
        representativeQueries: [
          'use free online math calculus matrix statistics and chemistry calculators',
          'convert international university grades to us gpa or uk degree classification',
          'open free browser whiteboard academic cv maker or apa citation generator',
        ],
      },
    ],
  };

  let cachedArdJson: string | null = null;
  app.options(['/.well-known/ard.json', '/.well-known/ai-catalog.json'], (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).end();
  });

  app.get(['/.well-known/ard.json', '/.well-known/ai-catalog.json'], (_req, res) => {
    if (!cachedArdJson) {
      try {
        const candidatePaths = [
          path.resolve(process.cwd(), 'public', '.well-known', 'ard.json'),
          path.resolve(process.cwd(), 'dist', '.well-known', 'ard.json'),
          path.resolve(__dirname, 'public', '.well-known', 'ard.json'),
          path.resolve(__dirname, 'dist', '.well-known', 'ard.json'),
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf-8');
            // Verify JSON validity before caching
            JSON.parse(raw);
            cachedArdJson = raw;
            break;
          }
        }
      } catch {
        cachedArdJson = null;
      }
      if (!cachedArdJson) {
        cachedArdJson = JSON.stringify(ardManifestFallbackObj, null, 2);
      }
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(cachedArdJson);
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

  // Unknown API or upload route JSON 404 (never return HTML for missing /api, /api/*, /uploads, or /uploads/* routes)
  app.all(['/api', '/api/*'], (req, res) => {
    res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).json({
      error: `API route not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  app.all(['/uploads', '/uploads/*'], (req, res) => {
    res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  // ==========================================
  // STATIC ASSETS & VITE INTEGRATION
  // ==========================================

  if (!options.skipStaticAndVite) {
    if (NODE_ENV !== 'production') {
      app.all('/.well-known/*', (req, res) => {
        return res.status(404).json({
          error: `Well-known resource not found: ${req.path}`,
          code: 'NOT_FOUND',
          status: 404,
        });
      });
      app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/@') && !req.path.startsWith('/src/') && !req.path.includes('.')) {
          res.setHeader('Link', '</.well-known/ard.json>; rel="ard"; type="application/json"');
        }
        next();
      });
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
      app.use(vite.middlewares);

      const devIndexHtmlPath = path.resolve(process.cwd(), 'index.html');
      app.get('*', async (req, res, next) => {
        if (isApiSubdomainRequest(req)) {
          res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
          res.setHeader('Cache-Control', 'no-store');
          return res.status(404).json({ error: 'Not Found', code: 'NOT_FOUND', status: 404 });
        }
        if (
          req.path.startsWith('/api/') ||
          req.path.startsWith('/uploads/') ||
          req.path.startsWith('/@') ||
          req.path.startsWith('/src/') ||
          req.path.startsWith('/node_modules/') ||
          req.path.startsWith('/.well-known/') ||
          path.extname(req.path)
        ) {
          return next();
        }
        try {
          const rawTemplate = fs.readFileSync(devIndexHtmlPath, 'utf-8');
          const transformedTemplate = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
          const renderedHtml = await renderSeoHtml({
            reqPath: req.path,
            templateHtml: transformedTemplate,
            loadMergedPublicTutorCatalog,
            loadSitemapDatabaseRecords,
          });
          res.status(200);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Link', '</.well-known/ard.json>; rel="ard"; type="application/json"');
          return res.send(renderedHtml);
        } catch (err) {
          vite.ssrFixStacktrace(err as Error);
          return next(err);
        }
      });
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

      // Serve /.well-known files explicitly with dotfiles allowed so they never fall through to index.html
      const wellKnownDir = path.join(distPath, '.well-known');
      if (fs.existsSync(wellKnownDir)) {
        app.use('/.well-known', express.static(wellKnownDir, {
          dotfiles: 'allow',
          maxAge: '1h',
          setHeaders: (res, filePath) => {
            if (filePath.toLowerCase().endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
            }
          },
        }));
      }

      // Static files: disable auto-index so `/` always passes through SSR SEO renderer; long cache for hashed/media assets
      app.use(express.static(distPath, {
        index: false,
        dotfiles: 'allow',
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (filePath.toLowerCase().endsWith('.avif')) {
            res.setHeader('Content-Type', 'image/avif');
          } else if (filePath.toLowerCase().endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
          }
          if (filePath.toLowerCase().endsWith('robots.txt')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          } else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Link', '</.well-known/ard.json>; rel="ard"; type="application/json"');
          } else if (/(logo-\d+|logo_transparent-\d+)\.(avif|webp)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (/\.(avif|webp|jpe?g|png|svg|ico|woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
          }
        },
      }));

      // Never return SPA HTML for unknown /.well-known/* discovery endpoints
      app.all('/.well-known/*', (req, res) => {
        return res.status(404).json({
          error: `Well-known resource not found: ${req.path}`,
          code: 'NOT_FOUND',
          status: 404,
        });
      });

      const prodIndexHtmlPath = path.join(distPath, 'index.html');
      let cachedProdIndexTemplate = '';
      try {
        if (fs.existsSync(prodIndexHtmlPath)) {
          cachedProdIndexTemplate = fs.readFileSync(prodIndexHtmlPath, 'utf-8');
        }
      } catch {
        cachedProdIndexTemplate = '';
      }

      app.get('*', async (req, res, next) => {
        if (isApiSubdomainRequest(req)) {
          res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
          res.setHeader('Cache-Control', 'no-store');
          return res.status(404).json({ error: 'Not Found', code: 'NOT_FOUND', status: 404 });
        }
        if (
          req.path.startsWith('/api/') ||
          req.path.startsWith('/uploads/') ||
          req.path.startsWith('/assets/') ||
          req.path.startsWith('/.well-known/') ||
          (req.path !== '/' && path.extname(req.path) && !req.path.endsWith('.html'))
        ) {
          return next();
        }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Link', '</.well-known/ard.json>; rel="ard"; type="application/json"');
        try {
          const templateHtml =
            cachedProdIndexTemplate ||
            (fs.existsSync(prodIndexHtmlPath) ? fs.readFileSync(prodIndexHtmlPath, 'utf-8') : '');
          if (!templateHtml) {
            return res.sendFile(prodIndexHtmlPath);
          }
          const renderedHtml = await renderSeoHtml({
            reqPath: req.path,
            templateHtml,
            loadMergedPublicTutorCatalog,
            loadSitemapDatabaseRecords,
          });
          res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(renderedHtml);
        } catch (err) {
          console.error('[SSR-SEO] Production HTML render fallback:', (err as Error)?.message || err);
          return res.sendFile(prodIndexHtmlPath);
        }
      });
    }
  }

  // Global Express Error Handler (4 args) - guarantees single structured JSON response on unhandled errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    if (isApiSubdomainRequest(req) || isApiOrUploadPath(req.path)) {
      res.setHeader('X-Robots-Tag', API_ROBOTS_TAG_HEADER);
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
  const rawRedirectUri = readRuntimeEnv('GOOGLE_REDIRECT_URI').replace(/\/+$/, '');
  const allowedApiCallbacks = new Set<string>(getAllowedGoogleApiCallbackUris());
  const googleConfigured =
    missingGoogleVars.length === 0 &&
    !isForbiddenProductionUrl(getRuntimeAppUrl()) &&
    !isForbiddenProductionUrl(rawRedirectUri) &&
    allowedApiCallbacks.has(rawRedirectUri);
  logSafeOAuthEvent('server_startup_oauth_check', {
    googleConfigured,
    redirectUriHostname: extractSafeUrlHostname(rawRedirectUri),
    callbackRoute: GOOGLE_OAUTH_CALLBACK_PATH,
    missingVars: missingGoogleVars,
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK] Server running on http://0.0.0.0:${PORT} in ${NODE_ENV} mode.`);
    void syncDiscoveredPagesWithIndexNow(UPLOADS_DIR);
  });
}

if (readRuntimeEnv('SKIP_AUTO_SERVER_START') !== 'true') {
  startServer();
}
