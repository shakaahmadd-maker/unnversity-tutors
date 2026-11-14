import fs from 'fs';
import path from 'path';
import { DEDICATED_SERVICE_ROUTES } from '../data/dedicatedServiceRoutes';
import { COUNTRY_ONLINE_TUTORING_PAGES } from '../data/countryOnlineTutoringData';
import { SPECIALIZED_SERVICE_PAGES_MAP } from '../data/specializedTutoringServicesData';
import {
  MATH_TOOL_SLUGS,
  BIOLOGY_TOOL_SLUGS,
  CHEMISTRY_TOOL_SLUGS,
  STUDENT_TOOL_SLUGS,
} from '../data/toolRouteMatchers';
import { getBlogCanonicalSlug } from '../utils/blogSlug';

export const SITEMAP_BASE_URL = 'https://university-tutors.com';
export const SITEMAP_MAX_URLS_PER_FILE = 5000;
const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: SitemapChangeFreq;
  priority: string;
}

export interface SitemapBlogInput {
  id: string;
  title: string;
  slug?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  status?: string | null;
  isPublished?: boolean | null;
}

export interface SitemapTutorInput {
  id: string;
  name?: string | null;
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
  suspended?: boolean | null;
  isApproved?: boolean | null;
  status?: string | null;
}

// Strict denylist of private, authenticated, system, and deprecated routes
const EXCLUDED_ROUTE_PREFIXES = [
  '/login',
  '/signup',
  '/auth',
  '/dashboard',
  '/student',
  '/tutor/dashboard',
  '/admin',
  '/admin-login',
  '/api',
  '/reset-password',
  '/user-data',
  '/users-data',
];

const EXCLUDED_EXACT_PATHS = new Set([
  '/how-it-works',
  '/pricing',
  '/get-quote',
  '/tutor',
  '/sop',
]);

export const ROBOTS_TXT_CONTENT = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /dashboard/',
  'Disallow: /admin/',
  'Disallow: /api/',
  'Disallow: /login',
  'Disallow: /signup',
  'Disallow: /auth',
  'Disallow: /reset-password',
  'Disallow: /student/dashboard',
  'Disallow: /tutor/dashboard',
  'Disallow: /admin-login',
  'Disallow: /user-data',
  '',
  `Sitemap: ${SITEMAP_BASE_URL}/sitemap.xml`,
  '',
].join('\n');

interface CachedSitemapPayload {
  generatedAtMs: number;
  generatedIso: string;
  entries: SitemapUrlEntry[];
  indexOrSingleXml: string;
  shardsXml: string[];
}

let cachedSitemap: CachedSitemapPayload | null = null;
let cachedFilesystemToolPaths: string[] | null = null;

export function invalidateSitemapCache(): void {
  cachedSitemap = null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatW3CDate(input?: string | Date | null): string | undefined {
  if (!input) return undefined;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function isExcludedFromSitemap(routePath: string): boolean {
  const normalized = ('/' + String(routePath || '').trim().replace(/^\/+/, ''))
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+$/, '') || '/';
  const lower = normalized.toLowerCase();

  if (EXCLUDED_EXACT_PATHS.has(lower)) return true;

  for (const prefix of EXCLUDED_ROUTE_PREFIXES) {
    if (lower === prefix || lower.startsWith(prefix + '/')) {
      return true;
    }
  }
  return false;
}

function toCanonicalLoc(routePath: string): string | null {
  const cleanPath = ('/' + String(routePath || '').trim().replace(/^\/+/, ''))
    .split('?')[0]
    .split('#')[0];
  const normalized = cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '');
  if (isExcludedFromSitemap(normalized)) return null;
  return normalized === '/' ? `${SITEMAP_BASE_URL}/` : `${SITEMAP_BASE_URL}${normalized}`;
}

/**
 * Scans src/data/*Tools*.ts and src/App.tsx (when source files are available at runtime)
 * to automatically pick up any newly added /tools/* routes even if a developer only adds
 * them to a UI registry file.
 */
function discoverToolPathsFromSourceFiles(): string[] {
  if (cachedFilesystemToolPaths !== null) {
    return cachedFilesystemToolPaths;
  }

  const discovered = new Set<string>();
  const candidateFiles = [
    path.join(process.cwd(), 'src', 'data', 'studentToolsData.ts'),
    path.join(process.cwd(), 'src', 'data', 'mathToolsRegistry.ts'),
    path.join(process.cwd(), 'src', 'data', 'scienceToolsRegistry.ts'),
    path.join(process.cwd(), 'src', 'data', 'toolRouteMatchers.ts'),
  ];

  const toolPathRegex = /['"](\/tools\/[a-z0-9][a-z0-9/-]*)['"]/gi;

  for (const filePath of candidateFiles) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const source = fs.readFileSync(filePath, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = toolPathRegex.exec(source)) !== null) {
        const clean = match[1].toLowerCase().replace(/\/+$/, '');
        if (clean && clean !== '/tools') {
          discovered.add(clean);
        }
      }
    } catch {
      // Ignore optional source-scan errors in bundled production environments
    }
  }

  cachedFilesystemToolPaths = Array.from(discovered);
  return cachedFilesystemToolPaths;
}

export function buildAllSitemapEntries(params: {
  blogs: SitemapBlogInput[];
  tutors: SitemapTutorInput[];
}): SitemapUrlEntry[] {
  const entryMap = new Map<string, SitemapUrlEntry>();

  const addRoute = (
    routePath: string,
    priority: string,
    changefreq: SitemapChangeFreq,
    lastmod?: string | Date | null
  ) => {
    const loc = toCanonicalLoc(routePath);
    if (!loc) return;
    if (entryMap.has(loc)) return;

    const formattedLastmod = formatW3CDate(lastmod);
    entryMap.set(loc, {
      loc,
      ...(formattedLastmod ? { lastmod: formattedLastmod } : {}),
      changefreq,
      priority,
    });
  };

  // 1. Core Static & Primary Navigation Pages
  addRoute('/', '1.0', 'daily');
  addRoute('/tutors', '0.9', 'daily');
  addRoute('/services', '0.9', 'weekly');
  addRoute('/get-a-quote', '0.9', 'weekly');
  addRoute('/tools', '0.9', 'weekly');
  addRoute('/blog', '0.9', 'weekly');
  addRoute('/about', '0.8', 'weekly');
  addRoute('/faqs', '0.8', 'weekly');
  addRoute('/contact', '0.8', 'weekly');
  addRoute('/whatsapp', '0.8', 'weekly');

  // Public Legal, Privacy & Compliance Pages
  addRoute('/privacy', '0.5', 'monthly');
  addRoute('/terms', '0.5', 'monthly');
  addRoute('/google-disclosure', '0.5', 'monthly');
  addRoute('/data-deletion', '0.5', 'monthly');

  // 2. Dedicated Academic Service Pages (auto-discovered from DEDICATED_SERVICE_ROUTES)
  for (const service of DEDICATED_SERVICE_ROUTES) {
    if (service.path) {
      addRoute(service.path, '0.85', 'weekly');
    }
  }

  // 3. Country Online Tutoring Landing Pages (auto-discovered from COUNTRY_ONLINE_TUTORING_PAGES)
  for (const country of Object.values(COUNTRY_ONLINE_TUTORING_PAGES)) {
    if (country.slug) {
      addRoute(`/online-tutoring-${country.slug}`, '0.8', 'weekly');
    }
  }

  // 4. Specialized Academic Service Landing Pages (auto-discovered from SPECIALIZED_SERVICE_PAGES_MAP)
  for (const specPage of Object.values(SPECIALIZED_SERVICE_PAGES_MAP)) {
    if (specPage?.path) {
      addRoute(specPage.path, '0.8', 'weekly');
    }
  }

  // 5. Free Student Tools, Math Tools, Biology Tools & Chemistry Tools (auto-discovered)
  // Category Hubs
  addRoute('/tools/math', '0.85', 'weekly');
  addRoute('/tools/biology', '0.85', 'weekly');
  addRoute('/tools/chemistry', '0.85', 'weekly');

  // Student Utility Tools (CV Maker, Grade Converter, Paraphraser, Whiteboard, Graph Builders, PDF, OCR, etc.)
  for (const slug of STUDENT_TOOL_SLUGS) {
    addRoute(`/tools/${slug}`, '0.8', 'weekly');
  }

  // University Mathematics & Statistics Solvers (27 tools)
  for (const slug of MATH_TOOL_SLUGS) {
    addRoute(`/tools/math/${slug}`, '0.8', 'weekly');
  }

  // Biology & Genetics Lab Calculators (14 tools)
  for (const slug of BIOLOGY_TOOL_SLUGS) {
    addRoute(`/tools/biology/${slug}`, '0.8', 'weekly');
  }

  // Chemistry & Spectroscopy Calculators (16 tools)
  for (const slug of CHEMISTRY_TOOL_SLUGS) {
    addRoute(`/tools/chemistry/${slug}`, '0.8', 'weekly');
  }

  // Source-file auto-discovery safety net for any newly added /tools/* routes
  for (const discoveredPath of discoverToolPathsFromSourceFiles()) {
    addRoute(discoveredPath, '0.8', 'weekly');
  }

  // 6. All Published Blog Posts (Database-driven)
  const usedBlogSlugs = new Set<string>();
  for (const blog of params.blogs) {
    if (!blog || !blog.id || !blog.title) continue;
    // Skip unpublished/draft posts if status flags exist
    if (blog.isPublished === false) continue;
    if (blog.status && ['draft', 'archived', 'deleted', 'unpublished'].includes(String(blog.status).toLowerCase())) {
      continue;
    }

    let slug = getBlogCanonicalSlug(blog);
    if (usedBlogSlugs.has(slug)) {
      slug = `${slug}-${String(blog.id).toLowerCase().replace(/[^a-z0-9-]+/g, '-')}`;
    }
    usedBlogSlugs.add(slug);

    const lastmod = blog.updatedAt || blog.publishedAt || blog.createdAt || undefined;
    addRoute(`/blog/${encodeURIComponent(slug)}`, '0.8', 'weekly', lastmod);
  }

  // 7. All Active Public Tutor Profiles (Database-driven)
  for (const tutor of params.tutors) {
    if (!tutor || !tutor.id) continue;
    if (tutor.suspended === true) continue;
    const statusLower = tutor.status ? String(tutor.status).toLowerCase() : '';
    if (statusLower === 'suspended' || statusLower === 'rejected' || statusLower === 'pending') continue;
    if (tutor.isApproved === false) continue;

    const lastmod = tutor.updatedAt || tutor.createdAt || undefined;
    addRoute(`/tutor/${encodeURIComponent(String(tutor.id).trim())}`, '0.7', 'weekly', lastmod);
  }

  return Array.from(entryMap.values());
}

export function renderUrlSetXml(entries: SitemapUrlEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

export function renderSitemapIndexXml(shardCount: number, lastmodIso: string): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (let i = 1; i <= shardCount; i++) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${escapeXml(`${SITEMAP_BASE_URL}/sitemap-${i}.xml`)}</loc>`);
    lines.push(`    <lastmod>${escapeXml(lastmodIso)}</lastmod>`);
    lines.push('  </sitemap>');
  }

  lines.push('</sitemapindex>');
  return lines.join('\n') + '\n';
}

export async function getOrBuildSitemapPayload(
  loader: () => Promise<{ blogs: SitemapBlogInput[]; tutors: SitemapTutorInput[] }>,
  forceRefresh = false
): Promise<CachedSitemapPayload> {
  const now = Date.now();
  if (!forceRefresh && cachedSitemap && now - cachedSitemap.generatedAtMs < SITEMAP_CACHE_TTL_MS) {
    return cachedSitemap;
  }

  const { blogs, tutors } = await loader();
  const entries = buildAllSitemapEntries({ blogs, tutors });
  const generatedIso = new Date(now).toISOString();

  let indexOrSingleXml: string;
  const shardsXml: string[] = [];

  if (entries.length > SITEMAP_MAX_URLS_PER_FILE) {
    for (let offset = 0; offset < entries.length; offset += SITEMAP_MAX_URLS_PER_FILE) {
      const slice = entries.slice(offset, offset + SITEMAP_MAX_URLS_PER_FILE);
      shardsXml.push(renderUrlSetXml(slice));
    }
    indexOrSingleXml = renderSitemapIndexXml(shardsXml.length, generatedIso);
  } else {
    const singleXml = renderUrlSetXml(entries);
    indexOrSingleXml = singleXml;
    shardsXml.push(singleXml);
  }

  cachedSitemap = {
    generatedAtMs: now,
    generatedIso,
    entries,
    indexOrSingleXml,
    shardsXml,
  };

  return cachedSitemap;
}
