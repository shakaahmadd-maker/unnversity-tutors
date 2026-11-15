import fs from 'fs';
import path from 'path';
import {
  buildAllSitemapEntries,
  isExcludedFromSitemap,
  SITEMAP_BASE_URL,
} from './sitemapGenerator';

export const INDEXNOW_HOST = 'university-tutors.com';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const DEFAULT_INDEXNOW_KEY = 'e4c98b27f10a4d6395e82c1b704fd93a';

const INDEXNOW_MAX_BATCH_SIZE = 10000;
const DEDUPE_COOLDOWN_MS = 60 * 1000; // 60s per-URL cooldown to prevent accidental duplicate bursts
const REQUEST_TIMEOUT_MS = 10000;

export interface IndexNowSubmitOptions {
  force?: boolean;
  reason?: string;
}

export interface IndexNowSubmitResult {
  submitted: boolean;
  status: number | null;
  count: number;
  urls: string[];
  keyLocation: string;
  error?: string;
}

export interface IndexNowHistoryItem {
  timestamp: string;
  reason: string;
  count: number;
  status: number | null;
  ok: boolean;
  sampleUrls: string[];
}

const recentlySubmittedUrlMap = new Map<string, number>();
const submissionHistory: IndexNowHistoryItem[] = [];

/**
 * Returns the active 8–128 char alphanumeric/hex IndexNow key from `INDEXNOW_KEY`,
 * falling back safely to the generated 32-char hexadecimal production key.
 */
export function getIndexNowKey(): string {
  const runtimeEnv: Record<string, string | undefined> = process['env'];
  const raw = (runtimeEnv['INDEXNOW_KEY'] || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .trim();

  if (raw && /^[a-zA-Z0-9-]{8,128}$/.test(raw)) {
    return raw;
  }
  return DEFAULT_INDEXNOW_KEY;
}

export function getIndexNowKeyLocation(key = getIndexNowKey()): string {
  return `${SITEMAP_BASE_URL}/${key}.txt`;
}

/**
 * Normalizes a relative path or full URL into a canonical `https://university-tutors.com/...` URL.
 * Returns `null` if the URL is empty, malformed, or points to an excluded/private route.
 */
export function normalizeIndexNowUrl(rawInput: string): string | null {
  const trimmed = String(rawInput || '').trim();
  if (!trimmed) return null;

  let pathname = '';
  let search = '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      pathname = parsed.pathname || '/';
      search = parsed.search || '';
    } catch {
      return null;
    }
  } else {
    const withoutHash = trimmed.split('#')[0];
    const qIndex = withoutHash.indexOf('?');
    if (qIndex >= 0) {
      pathname = withoutHash.slice(0, qIndex);
      search = withoutHash.slice(qIndex);
    } else {
      pathname = withoutHash;
    }
  }

  const normalizedPath = ('/' + pathname.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
  if (isExcludedFromSitemap(normalizedPath)) {
    return null;
  }

  const canonicalBase =
    normalizedPath === '/' ? `${SITEMAP_BASE_URL}/` : `${SITEMAP_BASE_URL}${normalizedPath}`;

  return search ? `${canonicalBase}${search}` : canonicalBase;
}

function recordHistory(entry: IndexNowHistoryItem): void {
  submissionHistory.unshift(entry);
  if (submissionHistory.length > 25) {
    submissionHistory.length = 25;
  }
}

export function getIndexNowStatusSummary() {
  const key = getIndexNowKey();
  return {
    protocol: 'IndexNow',
    endpoint: INDEXNOW_ENDPOINT,
    host: INDEXNOW_HOST,
    keyConfigured: true,
    usingEnvOverride: Boolean(process['env']['INDEXNOW_KEY']?.trim()),
    keyLocation: getIndexNowKeyLocation(key),
    verificationPath: `/${key}.txt`,
    recentSubmissions: submissionHistory,
  };
}

/**
 * Submits a single URL or array of URLs to `https://api.indexnow.org/indexnow`
 * so Bing, Yandex, Seznam, Naver, and participating AI search crawlers index updates immediately.
 */
export async function submitToIndexNow(
  urls: string | string[],
  options: IndexNowSubmitOptions = {}
): Promise<IndexNowSubmitResult> {
  const key = getIndexNowKey();
  const keyLocation = getIndexNowKeyLocation(key);
  const rawList = Array.isArray(urls) ? urls : [urls];

  const uniqueNormalized = new Set<string>();
  for (const item of rawList) {
    const normalized = normalizeIndexNowUrl(item);
    if (normalized) {
      uniqueNormalized.add(normalized);
    }
  }

  const now = Date.now();
  // Prune expired cooldown entries
  for (const [u, ts] of recentlySubmittedUrlMap.entries()) {
    if (now - ts > DEDUPE_COOLDOWN_MS) {
      recentlySubmittedUrlMap.delete(u);
    }
  }

  const urlList = Array.from(uniqueNormalized).filter((url) => {
    if (options.force) return true;
    const lastSent = recentlySubmittedUrlMap.get(url);
    return !lastSent || now - lastSent > DEDUPE_COOLDOWN_MS;
  });

  if (urlList.length === 0) {
    return {
      submitted: false,
      status: null,
      count: 0,
      urls: [],
      keyLocation,
    };
  }

  // Mark URLs in cooldown map
  for (const url of urlList) {
    recentlySubmittedUrlMap.set(url, now);
  }

  let lastStatus: number | null = null;
  let allSucceeded = true;
  let lastError: string | undefined;

  for (let offset = 0; offset < urlList.length; offset += INDEXNOW_MAX_BATCH_SIZE) {
    const batch = urlList.slice(offset, offset + INDEXNOW_MAX_BATCH_SIZE);
    const payload = {
      host: INDEXNOW_HOST,
      key,
      keyLocation,
      urlList: batch,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'UniversityTutors-IndexNow/1.0 (+https://university-tutors.com)',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      lastStatus = response.status;

      // IndexNow returns 200 OK or 202 Accepted on valid submission
      const isOk = response.status === 200 || response.status === 202;
      if (!isOk) {
        allSucceeded = false;
        const errBody = await response.text().catch(() => '');
        lastError = `HTTP ${response.status}${errBody ? `: ${errBody.slice(0, 160)}` : ''}`;
        console.warn(
          `[INDEXNOW] Non-2xx response (${response.status}) submitting ${batch.length} URL(s) [${options.reason || 'update'}]: ${lastError}`
        );
      } else {
        console.info(
          `[INDEXNOW] Notified IndexNow (${response.status}) for ${batch.length} URL(s) [${options.reason || 'update'}]`
        );
      }
    } catch (err: any) {
      allSucceeded = false;
      lastError = err?.message || 'Network request to IndexNow failed';
      console.warn(
        `[INDEXNOW] Notice submitting ${batch.length} URL(s) [${options.reason || 'update'}]: ${lastError}`
      );
    }
  }

  recordHistory({
    timestamp: new Date().toISOString(),
    reason: options.reason || 'manual_or_lifecycle',
    count: urlList.length,
    status: lastStatus,
    ok: allSucceeded,
    sampleUrls: urlList.slice(0, 5),
  });

  return {
    submitted: allSucceeded,
    status: lastStatus,
    count: urlList.length,
    urls: urlList,
    keyLocation,
    ...(lastError ? { error: lastError } : {}),
  };
}

/**
 * Fire-and-forget helper so API endpoints never block on external IndexNow HTTP latency.
 */
export function queueIndexNowSubmission(urls: string | string[], reason = 'content_update'): void {
  void submitToIndexNow(urls, { reason }).catch((err) => {
    console.warn(`[INDEXNOW] Background submission error (${reason}):`, err?.message || err);
  });
}

/**
 * Automatically detects newly added static pages, academic service landing pages, or
 * free student tools (`buildAllSitemapEntries({ blogs: [], tutors: [] })`) across deployments
 * and submits any newly discovered URLs to IndexNow.
 */
export async function syncDiscoveredPagesWithIndexNow(storageDir: string): Promise<void> {
  try {
    const staticAndToolEntries = buildAllSitemapEntries({ blogs: [], tutors: [] });
    const currentUrls = staticAndToolEntries.map((entry) => entry.loc);
    if (currentUrls.length === 0) return;

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const snapshotPath = path.join(storageDir, '.indexnow-known-static-urls.json');
    let previousUrls: string[] | null = null;

    if (fs.existsSync(snapshotPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
        if (Array.isArray(parsed)) {
          previousUrls = parsed.filter((x): x is string => typeof x === 'string');
        }
      } catch {
        previousUrls = null;
      }
    }

    fs.writeFileSync(snapshotPath, JSON.stringify(currentUrls, null, 2), 'utf-8');

    if (previousUrls === null) {
      if (process['env']['INDEXNOW_SUBMIT_ON_FIRST_BOOT'] === 'true') {
        await submitToIndexNow(currentUrls, { reason: 'initial_boot_static_and_tools' });
      }
      return;
    }

    const previousSet = new Set(previousUrls);
    const newlyAddedUrls = currentUrls.filter((u) => !previousSet.has(u));

    if (newlyAddedUrls.length > 0) {
      const urlsWithHub = newlyAddedUrls.some((u) => u.includes('/tools/'))
        ? [`${SITEMAP_BASE_URL}/tools`, ...newlyAddedUrls]
        : newlyAddedUrls;
      await submitToIndexNow(urlsWithHub, { reason: 'newly_discovered_pages_or_tools' });
    }
  } catch (err: any) {
    console.warn('[INDEXNOW] Notice checking static/tool route diff:', err?.message || err);
  }
}
