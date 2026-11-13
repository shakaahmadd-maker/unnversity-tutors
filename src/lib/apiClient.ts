// Centralized API Client with 30s timeout, AbortController cancellation,
// in-flight GET deduplication, 401 session-expiry handling, and safe diagnostics.

export const DEFAULT_API_TIMEOUT_MS = 30_000;
export const SESSION_EXPIRED_EVENT = 'ut:session-expired';

export class ApiError extends Error {
  status: number;
  code: string;
  isTimeout: boolean;
  isAborted: boolean;
  route: string;

  constructor(
    message: string,
    status = 500,
    code = 'API_ERROR',
    opts?: { isTimeout?: boolean; isAborted?: boolean; route?: string }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isTimeout = Boolean(opts?.isTimeout);
    this.isAborted = Boolean(opts?.isAborted);
    this.route = opts?.route || '';
  }
}

export interface ApiMetricSample {
  id: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
  ok: boolean;
  slow: boolean; // >= 2000ms
  verySlow: boolean; // >= 10000ms
  error?: string;
  timestamp: string;
}

export interface TabFailureSample {
  tab: string;
  role?: string;
  message: string;
  timestamp: string;
  count: number;
}

export interface ApiDiagnosticsSnapshot {
  totalRequests: number;
  slowRequests: ApiMetricSample[];
  verySlowRequests: ApiMetricSample[];
  failedRequests: ApiMetricSample[];
  slowestRoutes: Array<{
    method: string;
    route: string;
    count: number;
    avgMs: number;
    maxMs: number;
    failedCount: number;
  }>;
  failedTabs: TabFailureSample[];
}

function normalizeRouteForMetrics(url: string): string {
  const pathOnly = (url || '/').split('?')[0];
  return pathOnly
    .replace(/\/[0-9a-f]{8,}/gi, '/:id')
    .replace(/\/(ord|usr|tut|tutor|room|msg|qte|inv|pay|notif|log|file|doc)_[a-zA-Z0-9_-]+/gi, '/:id')
    .replace(/\/tutor-\d+/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}

const MAX_SAMPLES = 250;
const metricSamples: ApiMetricSample[] = [];
const failedTabsMap = new Map<string, TabFailureSample>();
const diagListeners = new Set<() => void>();
let totalTrackedCount = 0;

function notifyDiagListeners() {
  diagListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

function recordApiMetric(sample: ApiMetricSample) {
  totalTrackedCount += 1;
  metricSamples.push(sample);
  if (metricSamples.length > MAX_SAMPLES) {
    metricSamples.shift();
  }
  notifyDiagListeners();
}

export function recordTabDiagnosticError(tab: string, message: string, role?: string) {
  const key = `${role || 'user'}:${tab}`;
  const existing = failedTabsMap.get(key);
  failedTabsMap.set(key, {
    tab,
    role,
    message: message.slice(0, 240),
    timestamp: new Date().toISOString(),
    count: (existing?.count || 0) + 1,
  });
  notifyDiagListeners();
}

export function clearTabDiagnosticError(tab: string, role?: string) {
  const key = `${role || 'user'}:${tab}`;
  if (failedTabsMap.delete(key)) {
    notifyDiagListeners();
  }
}

export function clearApiDiagnostics() {
  metricSamples.length = 0;
  failedTabsMap.clear();
  totalTrackedCount = 0;
  notifyDiagListeners();
}

export function subscribeApiDiagnostics(cb: () => void): () => void {
  diagListeners.add(cb);
  return () => diagListeners.delete(cb);
}

export function getApiDiagnostics(): ApiDiagnosticsSnapshot {
  const byRoute = new Map<
    string,
    { method: string; route: string; count: number; totalMs: number; maxMs: number; failedCount: number }
  >();

  for (const s of metricSamples) {
    const key = `${s.method} ${s.route}`;
    const cur = byRoute.get(key) || {
      method: s.method,
      route: s.route,
      count: 0,
      totalMs: 0,
      maxMs: 0,
      failedCount: 0,
    };
    cur.count += 1;
    cur.totalMs += s.durationMs;
    if (s.durationMs > cur.maxMs) cur.maxMs = s.durationMs;
    if (!s.ok) cur.failedCount += 1;
    byRoute.set(key, cur);
  }

  const slowestRoutes = Array.from(byRoute.values())
    .map((r) => ({
      method: r.method,
      route: r.route,
      count: r.count,
      avgMs: Math.round(r.totalMs / r.count),
      maxMs: r.maxMs,
      failedCount: r.failedCount,
    }))
    .sort((a, b) => b.maxMs - a.maxMs)
    .slice(0, 20);

  return {
    totalRequests: totalTrackedCount,
    slowRequests: metricSamples.filter((m) => m.slow).slice(-25).reverse(),
    verySlowRequests: metricSamples.filter((m) => m.verySlow).slice(-20).reverse(),
    failedRequests: metricSamples.filter((m) => !m.ok).slice(-25).reverse(),
    slowestRoutes,
    failedTabs: Array.from(failedTabsMap.values()),
  };
}

let lastSessionExpiredAt = 0;
function emitSessionExpiredIfNeeded(url: string, status: number) {
  if (status !== 401) return;
  if (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/me')
  ) {
    return;
  }
  const now = Date.now();
  if (now - lastSessionExpiredAt > 3000) {
    lastSessionExpiredAt = now;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { route: normalizeRouteForMetrics(url) } }));
    }
  }
}

export function getAuthHeaders(extraHeaders?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((v, k) => {
        headers[k] = v;
      });
    } else if (Array.isArray(extraHeaders)) {
      for (const [k, v] of extraHeaders) {
        headers[k] = v;
      }
    } else {
      Object.assign(headers, extraHeaders);
    }
  }

  try {
    const rawUser = typeof window !== 'undefined' ? window.localStorage.getItem('ut_current_user') : null;
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.token && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignore storage errors
  }

  return headers;
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  dedupe?: boolean;
  skipAuthEvent?: boolean;
}

interface BufferedFetchResult {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Array<[string, string]>;
  bodyText: string;
}

const inFlightGetRequests = new Map<string, Promise<BufferedFetchResult>>();

async function executeTimedFetch(
  url: string,
  options: ApiFetchOptions,
  internalSignal?: AbortSignal
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_API_TIMEOUT_MS;
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const externalSignals = [options.signal, internalSignal].filter(Boolean) as AbortSignal[];
  const abortHandlers: Array<{ sig: AbortSignal; fn: () => void }> = [];

  for (const sig of externalSignals) {
    if (sig.aborted) {
      clearTimeout(timer);
      throw new ApiError('Request cancelled', 0, 'ABORTED', { isAborted: true, route: normalizeRouteForMetrics(url) });
    }
    const fn = () => controller.abort();
    sig.addEventListener('abort', fn, { once: true });
    abortHandlers.push({ sig, fn });
  }

  const headers = getAuthHeaders(options.headers);
  if (
    options.body &&
    !(typeof FormData !== 'undefined' && options.body instanceof FormData) &&
    !headers['Content-Type'] &&
    !headers['content-type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const method = (options.method || 'GET').toUpperCase();
  const normRoute = normalizeRouteForMetrics(url);

  try {
    const res = await fetch(url, {
      ...options,
      method,
      credentials: options.credentials || 'include',
      headers,
      signal: controller.signal,
    });

    const durationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs);
    recordApiMetric({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      method,
      route: normRoute,
      status: res.status,
      durationMs,
      ok: res.ok,
      slow: durationMs >= 2000,
      verySlow: durationMs >= 10000,
      error: res.ok ? undefined : `HTTP ${res.status}`,
      timestamp: new Date().toISOString(),
    });

    if (res.status === 401 && !options.skipAuthEvent) {
      emitSessionExpiredIfNeeded(url, res.status);
    }

    return res;
  } catch (err: any) {
    const durationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs);
    if (err instanceof ApiError) throw err;

    const wasCallerAborted = externalSignals.some((s) => s.aborted);
    if (wasCallerAborted && !timedOut) {
      throw new ApiError('Request cancelled', 0, 'ABORTED', { isAborted: true, route: normRoute });
    }

    if (timedOut || err?.name === 'AbortError') {
      const timeoutMsg = `Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please retry.`;
      recordApiMetric({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        method,
        route: normRoute,
        status: 408,
        durationMs,
        ok: false,
        slow: true,
        verySlow: durationMs >= 10000,
        error: 'Timeout (30s)',
        timestamp: new Date().toISOString(),
      });
      throw new ApiError(timeoutMsg, 408, 'TIMEOUT', { isTimeout: true, route: normRoute });
    }

    const netMsg = err?.message || 'Network connection failed. Please check your connection and retry.';
    recordApiMetric({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      method,
      route: normRoute,
      status: 0,
      durationMs,
      ok: false,
      slow: durationMs >= 2000,
      verySlow: durationMs >= 10000,
      error: netMsg.slice(0, 120),
      timestamp: new Date().toISOString(),
    });
    throw new ApiError(netMsg, 0, 'NETWORK_ERROR', { route: normRoute });
  } finally {
    clearTimeout(timer);
    for (const { sig, fn } of abortHandlers) {
      sig.removeEventListener('abort', fn);
    }
  }
}

function bufferResponse(res: Response): Promise<BufferedFetchResult> {
  return res.text().then((bodyText) => ({
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    headers: Array.from(res.headers.entries()),
    bodyText,
  }));
}

function raceWithAbort<T>(promise: Promise<T>, signal?: AbortSignal, url = ''): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    return Promise.reject(new ApiError('Request cancelled', 0, 'ABORTED', { isAborted: true, route: normalizeRouteForMetrics(url) }));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new ApiError('Request cancelled', 0, 'ABORTED', { isAborted: true, route: normalizeRouteForMetrics(url) }));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (val) => {
        signal.removeEventListener('abort', onAbort);
        resolve(val);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

/**
 * Drop-in replacement for window.fetch with:
 * - 30s default timeout
 * - Bearer/cookie auth headers
 * - In-flight GET deduplication (reconstructing fresh Response per caller)
 * - Safe AbortController propagation
 * - 401 session-expiry broadcast
 */
export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const shouldDedupe = method === 'GET' && options.dedupe !== false && !options.body;

  if (!shouldDedupe) {
    return executeTimedFetch(url, options);
  }

  let existing = inFlightGetRequests.get(url);
  if (!existing) {
    // Run the shared network fetch without individual caller abort signal so one unmounting widget doesn't kill another caller's shared GET
    const { signal: _ignoredSignal, ...sharedOptions } = options;
    existing = executeTimedFetch(url, sharedOptions)
      .then(bufferResponse)
      .finally(() => {
        inFlightGetRequests.delete(url);
      });
    inFlightGetRequests.set(url, existing);
  }

  const buffered = await raceWithAbort(existing, options.signal, url);
  return new Response(buffered.bodyText, {
    status: buffered.status,
    statusText: buffered.statusText,
    headers: buffered.headers,
  });
}

export async function apiJson<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const res = await apiFetch(url, options);
  const rawText = await res.text();
  let parsed: any = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const message =
      parsed?.error ||
      parsed?.message ||
      (res.status === 401
        ? 'Your session has expired. Please sign in again.'
        : res.status === 403
        ? 'You do not have permission to access this resource.'
        : `Request failed with status ${res.status}.`);
    const code = parsed?.code || (res.status === 401 ? 'UNAUTHORIZED' : res.status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR');
    throw new ApiError(message, res.status, code, { route: normalizeRouteForMetrics(url) });
  }

  return (parsed ?? {}) as T;
}

export function isAbortError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof ApiError && err.isAborted) return true;
  if (err instanceof Error && err.name === 'AbortError') return true;
  return false;
}

export function getFriendlyErrorMessage(err: unknown, fallback = 'Unable to load data. Please retry.'): string {
  if (!err) return fallback;
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  return fallback;
}
