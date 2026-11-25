import type express from 'express';
import { COUNTRY_ONLINE_TUTORING_PAGES } from '../data/countryOnlineTutoringData';
import { resolveDedicatedServiceRoute } from '../data/dedicatedServiceRoutes';
import { SPECIALIZED_SERVICE_PAGES_MAP } from '../data/specializedTutoringServicesData';
import {
  matchCsRouteView,
  matchMathRouteView,
  matchScienceRouteView,
  matchStudentToolRoute,
} from '../data/toolRouteMatchers';

export const CANONICAL_MAIN_SITE_ORIGIN = 'https://university-tutors.com';
export const API_SUBDOMAIN_HOST = 'api.university-tutors.com';
export const API_ROBOTS_TAG_HEADER = 'noindex, nofollow, noarchive';

const COUNTRY_TUTORING_PATH_SET = new Set<string>(
  Object.values(COUNTRY_ONLINE_TUTORING_PAGES).map((entry) => entry.path.toLowerCase())
);

const STATIC_MAIN_WEBSITE_PATHS = new Set<string>([
  '/',
  '/tutors',
  '/tutors-directory',
  '/find-a-tutor',
  '/about',
  '/about-us',
  '/contact',
  '/contact-us',
  '/faqs',
  '/faq',
  '/services',
  '/blog',
  '/our-blog',
  '/tools',
  '/get-a-quote',
  '/get-quote',
  '/pricing',
  '/book',
  '/how-it-works',
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
  '/google-disclosure',
  '/google-oauth-disclosure',
  '/data-deletion',
  '/data-deletion-instructions',
  '/user-data-deletion',
  '/whatsapp',
  '/whatsapp-desk',
  '/sop',
  '/auth',
  '/login',
  '/signup',
  '/reset-password',
  '/verify-email',
  '/admin-login',
  '/dashboard',
  '/student',
  '/student/dashboard',
  '/student/chat',
  '/tutor/dashboard',
  '/chat',
  '/chats',
  '/admin',
]);

const DYNAMIC_DETAIL_PREFIXES = ['/tutor/', '/tutors/', '/tutor-profile/', '/blog/', '/our-blog/'];
const SAFE_SLUG_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9_-]{0,160}$/i;

function readFirstHeaderValue(value: string | string[] | undefined): string {
  if (!value) return '';
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return '';
  return raw.split(',')[0].trim();
}

function parseForwardedHeaderHost(forwardedHeader: string | string[] | undefined): string {
  const firstEntry = readFirstHeaderValue(forwardedHeader);
  if (!firstEntry) return '';
  const parts = firstEntry.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (/^host=/i.test(trimmed)) {
      return trimmed.slice(5).trim();
    }
  }
  return '';
}

export function normalizeHostnameValue(rawCandidate: string): string {
  let candidate = String(rawCandidate || '').split(',')[0].trim();
  if (!candidate) return '';

  // Strip surrounding quotes (e.g., RFC 7239 Forwarded host="api.university-tutors.com")
  if (
    candidate.length >= 2 &&
    ((candidate.startsWith('"') && candidate.endsWith('"')) ||
      (candidate.startsWith("'") && candidate.endsWith("'")))
  ) {
    candidate = candidate.slice(1, -1).trim();
  }

  candidate = candidate.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  if (!candidate) return '';

  // Handle IPv6 literal with optional port, e.g. [::1]:3000 -> [::1]
  if (candidate.startsWith('[')) {
    const closeIdx = candidate.indexOf(']');
    return closeIdx >= 0 ? candidate.slice(0, closeIdx + 1) : candidate;
  }

  // Strip port and trailing FQDN dot
  return candidate.replace(/:\d+$/, '').replace(/\.+$/, '');
}

/**
 * Extracts the external request hostname reliably behind Dokploy, Traefik, and CDN proxies.
 * Priority: X-Forwarded-Host -> X-Original-Host -> RFC 7239 Forwarded(host=) -> Host -> req.hostname.
 */
export function getNormalizedRequestHost(req: express.Request): string {
  const candidates = [
    readFirstHeaderValue(req.headers['x-forwarded-host']),
    readFirstHeaderValue(req.headers['x-original-host']),
    parseForwardedHeaderHost(req.headers.forwarded),
    readFirstHeaderValue(req.headers.host),
    typeof req.hostname === 'string' ? req.hostname : '',
  ];

  for (const candidate of candidates) {
    const normalized = normalizeHostnameValue(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return '';
}

export function isApiSubdomainRequest(req: express.Request, configuredApiHostname = ''): boolean {
  const host = getNormalizedRequestHost(req);
  if (!host) return false;
  if (host === API_SUBDOMAIN_HOST) return true;
  const normalizedConfigured = normalizeHostnameValue(configuredApiHostname);
  return Boolean(normalizedConfigured && host === normalizedConfigured);
}

/**
 * Paths permitted to be served directly by api.university-tutors.com.
 * Keeps /api/*, uploaded media under /uploads/*, and container /health functional.
 */
export function isApiOrUploadPath(reqPath: string): boolean {
  const clean = reqPath || '/';
  return (
    clean === '/api' ||
    clean.startsWith('/api/') ||
    clean === '/uploads' ||
    clean.startsWith('/uploads/') ||
    clean === '/health'
  );
}

/**
 * Returns true if the requested path corresponds to a real page on https://university-tutors.com
 * that should permanently 301-redirect from api.university-tutors.com to the main website.
 * Unknown paths, file extensions (.xml, .html, .php, .js, etc.), and traversal inputs return false
 * so the API host returns a clean JSON 404.
 */
export function isEquivalentMainWebsitePath(rawPathname: string): boolean {
  if (typeof rawPathname !== 'string' || !rawPathname) return false;

  // Reject control characters, backslashes, or traversal attempts
  if (/[\r\n\0\\]/.test(rawPathname) || rawPathname.includes('..')) {
    return false;
  }

  // Collapse multiple slashes and strip trailing slash (except root '/')
  let normalized = rawPathname.replace(/\/{2,}/g, '/');
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  const lower = normalized.toLowerCase();

  // Never treat API, uploads, well-known, or file-extension URLs as frontend pages to redirect
  if (
    isApiOrUploadPath(lower) ||
    lower.startsWith('/.well-known') ||
    lower.startsWith('/assets/') ||
    /\.[a-z0-9]{1,8}$/i.test(lower)
  ) {
    return false;
  }

  if (STATIC_MAIN_WEBSITE_PATHS.has(lower)) {
    return true;
  }

  if (COUNTRY_TUTORING_PATH_SET.has(lower)) {
    return true;
  }

  if (Object.prototype.hasOwnProperty.call(SPECIALIZED_SERVICE_PAGES_MAP, lower)) {
    return true;
  }

  if (resolveDedicatedServiceRoute(lower)) {
    return true;
  }

  if (
    matchMathRouteView(lower) ||
    matchScienceRouteView(lower) ||
    matchCsRouteView(lower) ||
    matchStudentToolRoute(lower)
  ) {
    return true;
  }

  // Public single-segment detail pages (tutor profiles and blog articles)
  for (const prefix of DYNAMIC_DETAIL_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const rest = lower.slice(prefix.length);
      if (rest && !rest.includes('/') && !rest.includes('.') && SAFE_SLUG_SEGMENT_PATTERN.test(rest)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Builds a strict, open-redirect-safe canonical redirect URL on https://university-tutors.com,
 * preserving the normalized path and original query string.
 */
export function buildCanonicalMainSiteRedirectUrl(reqPath: string, originalUrl = ''): string {
  const safePathBody = String(reqPath || '/')
    .replace(/[\r\n\0\\]/g, '')
    .replace(/^\/+/, '');
  const canonicalPath = safePathBody ? `/${safePathBody}` : '/';

  let querySuffix = '';
  const rawOriginal = String(originalUrl || '');
  const qIdx = rawOriginal.indexOf('?');
  if (qIdx >= 0) {
    querySuffix = rawOriginal.slice(qIdx).replace(/[\r\n\0]/g, '');
  }

  return `${CANONICAL_MAIN_SITE_ORIGIN}${canonicalPath}${querySuffix}`;
}
