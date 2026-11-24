import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileKey2,
  Fingerprint,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';
import { CS_TOOLS_BY_SLUG } from '../../../data/csToolsRegistry';

type CryptoTab = 'hash' | 'base64' | 'jwt';
type HashAlg = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type DigestFormat = 'hex-lower' | 'hex-upper' | 'base64';

const HASH_ALGORITHMS: { alg: HashAlg; bits: number; note: string }[] = [
  { alg: 'SHA-1', bits: 160, note: 'Legacy (deprecated for TLS/signatures)' },
  { alg: 'SHA-256', bits: 256, note: 'Standard for TLS, Git, & integrity checks' },
  { alg: 'SHA-384', bits: 384, note: 'Truncated SHA-512 variant' },
  { alg: 'SHA-512', bits: 512, note: 'High-throughput 64-bit cryptographic hash' },
];

function bytesToHex(bytes: Uint8Array, upper = false): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return upper ? hex.toUpperCase() : hex;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function utf8ToBase64(str: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(str);
  const b64 = bytesToBase64(bytes);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

function base64ToUtf8(str: string): string {
  const normalized = str.trim().replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function buildSampleJwt(expired = false): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'student_2026_0482',
    name: 'Amina Patel',
    role: 'cs_undergrad',
    courses: ['CS201', 'CS304', 'CS410'],
    iss: 'auth.university-tutors.com',
    iat: expired ? nowSec - 7200 : nowSec - 300,
    exp: expired ? nowSec - 1800 : nowSec + 3600,
  };
  const h = utf8ToBase64(JSON.stringify(header), true);
  const p = utf8ToBase64(JSON.stringify(payload), true);
  const sig = 'dW5pdmVyc2l0eV90dXRvcnNfbG9jYWxfZGVtb19zaWduYXR1cmU';
  return `${h}.${p}.${sig}`;
}

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  status: 'valid-time' | 'expired' | 'not-yet-valid' | 'no-exp';
  timestamps: { claim: string; label: string; iso: string; local: string }[];
}

function decodeJwtToken(token: string): { decoded: DecodedJwt | null; error: string | null } {
  const trimmed = token.trim();
  if (!trimmed) return { decoded: null, error: null };
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return {
      decoded: null,
      error: `Expected 3 dot-separated segments (header.payload.signature), but found ${parts.length}.`,
    };
  }
  try {
    const header = JSON.parse(base64ToUtf8(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(base64ToUtf8(parts[1])) as Record<string, unknown>;
    const nowSec = Math.floor(Date.now() / 1000);

    const timestamps: DecodedJwt['timestamps'] = [];
    const timeClaims: [string, string][] = [
      ['iat', 'Issued At (iat)'],
      ['nbf', 'Not Before (nbf)'],
      ['exp', 'Expires At (exp)'],
    ];

    for (const [key, label] of timeClaims) {
      const val = payload[key];
      if (typeof val === 'number' && Number.isFinite(val)) {
        const d = new Date(val * 1000);
        timestamps.push({
          claim: key,
          label,
          iso: d.toISOString(),
          local: d.toLocaleString(),
        });
      }
    }

    let status: DecodedJwt['status'] = 'no-exp';
    if (typeof payload.nbf === 'number' && nowSec < payload.nbf) {
      status = 'not-yet-valid';
    } else if (typeof payload.exp === 'number') {
      status = nowSec > payload.exp ? 'expired' : 'valid-time';
    }

    return {
      decoded: { header, payload, signature: parts[2], status, timestamps },
      error: null,
    };
  } catch (err) {
    return {
      decoded: null,
      error:
        err instanceof Error
          ? `Failed to decode Base64URL/JSON: ${err.message}`
          : 'Invalid JWT encoding.',
    };
  }
}

export default function CryptoJwtTool() {
  const toolMeta = CS_TOOLS_BY_SLUG['crypto-jwt-tool'];
  const [activeTab, setActiveTab] = useState<CryptoTab>('hash');

  // Hash state
  const [hashInput, setHashInput] = useState('university-tutors.com :: CS410 Security Lab');
  const [digestFormat, setDigestFormat] = useState<DigestFormat>('hex-lower');
  const [hashes, setHashes] = useState<Record<HashAlg, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  });
  const [compareHash, setCompareHash] = useState('');
  const [copiedAlg, setCopiedAlg] = useState<string | null>(null);

  // Base64 / URL state
  const [encodingMode, setEncodingMode] = useState<'base64' | 'base64url' | 'url'>('base64');
  const [plainInput, setPlainInput] = useState('Hello CS Student! 2 + 2 = 4 & UTF-8: λ -> Ω');
  const [encodedInput, setEncodedInput] = useState(() =>
    utf8ToBase64('Hello CS Student! 2 + 2 = 4 & UTF-8: λ -> Ω', false)
  );
  const [encodeError, setEncodeError] = useState<string | null>(null);

  // JWT state
  const [jwtToken, setJwtToken] = useState(() => buildSampleJwt(false));

  // Recompute hashes asynchronously via Web Crypto API
  useEffect(() => {
    let cancelled = false;
    const computeAll = async () => {
      if (typeof crypto === 'undefined' || !crypto.subtle) return;
      const encoded = new TextEncoder().encode(hashInput);
      const next: Record<HashAlg, string> = {
        'SHA-1': '',
        'SHA-256': '',
        'SHA-384': '',
        'SHA-512': '',
      };
      for (const { alg } of HASH_ALGORITHMS) {
        const buf = await crypto.subtle.digest(alg, encoded);
        const bytes = new Uint8Array(buf);
        if (digestFormat === 'base64') next[alg] = bytesToBase64(bytes);
        else next[alg] = bytesToHex(bytes, digestFormat === 'hex-upper');
      }
      if (!cancelled) setHashes(next);
    };
    void computeAll();
    return () => {
      cancelled = true;
    };
  }, [hashInput, digestFormat]);

  const compareMatch = useMemo(() => {
    const target = compareHash.trim().toLowerCase();
    if (!target) return null;
    for (const { alg } of HASH_ALGORITHMS) {
      if (hashes[alg] && hashes[alg].toLowerCase() === target) {
        return alg;
      }
    }
    return 'mismatch' as const;
  }, [compareHash, hashes]);

  const jwtResult = useMemo(() => decodeJwtToken(jwtToken), [jwtToken]);

  useEffect(() => {
    const onLoadPreset = (ev: Event) => {
      const detail = (ev as CustomEvent<{ slug?: string; presetIndex?: number }>).detail;
      if (!detail || detail.slug !== 'crypto-jwt-tool') return;
      if (detail.presetIndex === 2) {
        setActiveTab('jwt');
        setJwtToken(buildSampleJwt(false));
      } else if (detail.presetIndex === 1) {
        setActiveTab('base64');
        const sample = 'Hello CS Student! 2 + 2 = 4 & UTF-8: λ -> Ω';
        setPlainInput(sample);
        setEncodedInput(utf8ToBase64(sample, false));
        setEncodeError(null);
      } else {
        setActiveTab('hash');
        setHashInput('university-tutors.com :: CS410 Security Lab');
        setCompareHash('');
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const handlePlainChange = (val: string) => {
    setPlainInput(val);
    setEncodeError(null);
    try {
      if (encodingMode === 'base64') setEncodedInput(utf8ToBase64(val, false));
      else if (encodingMode === 'base64url') setEncodedInput(utf8ToBase64(val, true));
      else setEncodedInput(encodeURIComponent(val));
    } catch (err) {
      setEncodeError(err instanceof Error ? err.message : 'Encoding error');
    }
  };

  const handleEncodedChange = (val: string) => {
    setEncodedInput(val);
    setEncodeError(null);
    try {
      if (encodingMode === 'url') setPlainInput(decodeURIComponent(val));
      else setPlainInput(base64ToUtf8(val));
    } catch {
      setEncodeError(`Invalid ${encodingMode.toUpperCase()} string — check padding or illegal characters.`);
    }
  };

  const switchEncodingMode = (next: 'base64' | 'base64url' | 'url') => {
    setEncodingMode(next);
    setEncodeError(null);
    if (next === 'base64') setEncodedInput(utf8ToBase64(plainInput, false));
    else if (next === 'base64url') setEncodedInput(utf8ToBase64(plainInput, true));
    else setEncodedInput(encodeURIComponent(plainInput));
  };

  const copyTextQuick = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore fallback
    }
    setCopiedAlg(key);
    window.setTimeout(() => setCopiedAlg(null), 1500);
  };

  const handleCopyOutput = () => {
    if (activeTab === 'hash') {
      return HASH_ALGORITHMS.map(({ alg }) => `${alg}: ${hashes[alg]}`).join('\n');
    }
    if (activeTab === 'base64') {
      return encodedInput;
    }
    if (jwtResult.decoded) {
      return JSON.stringify(
        { header: jwtResult.decoded.header, payload: jwtResult.decoded.payload },
        null,
        2
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title={toolMeta.title}
        category={toolMeta.category}
        description={toolMeta.summary}
        onLoadSample={() => {
          if (activeTab === 'hash') {
            setHashInput('university-tutors.com :: CS410 Security Lab');
            setCompareHash('');
          } else if (activeTab === 'base64') {
            const sample = 'Hello CS Student! 2 + 2 = 4 & UTF-8: λ -> Ω';
            setPlainInput(sample);
            setEncodedInput(
              encodingMode === 'url'
                ? encodeURIComponent(sample)
                : utf8ToBase64(sample, encodingMode === 'base64url')
            );
            setEncodeError(null);
          } else {
            setJwtToken(buildSampleJwt(false));
          }
        }}
        onCopyOutput={handleCopyOutput}
        copyLabel={
          activeTab === 'hash'
            ? 'Copy All Hashes'
            : activeTab === 'base64'
            ? 'Copy Encoded'
            : 'Copy Decoded JSON'
        }
        onClear={() => {
          if (activeTab === 'hash') {
            setHashInput('');
            setCompareHash('');
          } else if (activeTab === 'base64') {
            setPlainInput('');
            setEncodedInput('');
            setEncodeError(null);
          } else {
            setJwtToken('');
          }
        }}
      />

      {/* Tabs */}
      <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('hash')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'hash' ? 'bg-orange-600 text-white' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>SHA Hash Generator</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('base64')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'base64' ? 'bg-orange-600 text-white' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <FileKey2 className="w-3.5 h-3.5" />
          <span>Base64 &amp; URL Encoder</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jwt')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'jwt' ? 'bg-orange-600 text-white' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Local JWT Inspector</span>
        </button>
      </div>

      {/* TAB 1: Web Crypto Hash Generator */}
      {activeTab === 'hash' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="crypto-hash-input" className="text-xs font-semibold text-slate-700">
                Input Text (UTF-8 encoded before hashing via Web Crypto API)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(
                  [
                    ['hex-lower', 'hex'],
                    ['hex-upper', 'HEX'],
                    ['base64', 'Base64'],
                  ] as [DigestFormat, string][]
                ).map(([fmt, lbl]) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setDigestFormat(fmt)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold cursor-pointer ${
                      digestFormat === fmt
                        ? 'bg-white text-orange-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="crypto-hash-input"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              rows={4}
              placeholder="Type any string to compute SHA-1, SHA-256, SHA-384, and SHA-512 digests in real time..."
              className="w-full rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 p-3.5 font-mono text-sm text-slate-900 bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {HASH_ALGORITHMS.map(({ alg, bits, note }) => (
              <div
                key={alg}
                className="rounded-xl border border-slate-200 bg-[#FAF6F0]/60 p-3.5 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-700">{alg}</span>
                    <span className="text-[11px] font-mono text-slate-500">({bits}-bit)</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">· {note}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTextQuick(hashes[alg], alg)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    {copiedAlg === alg ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-900 break-all bg-white rounded-lg border border-slate-200/80 p-2.5 select-all">
                  {hashes[alg] || 'Computing...'}
                </div>
              </div>
            ))}
          </div>

          {/* Hash Comparator */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <label htmlFor="crypto-compare-input" className="block text-xs font-semibold text-slate-700">
              Verify / Compare Expected Hash Digest (Optional)
            </label>
            <input
              id="crypto-compare-input"
              type="text"
              value={compareHash}
              onChange={(e) => setCompareHash(e.target.value)}
              placeholder="Paste a known SHA-1 / SHA-256 / SHA-384 / SHA-512 digest to verify match..."
              className="w-full rounded-lg border border-slate-300 focus:border-orange-500 px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none"
            />
            {compareMatch && (
              <div
                className={`flex items-center gap-2 text-xs font-semibold pt-1 ${
                  compareMatch === 'mismatch' ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {compareMatch === 'mismatch' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>No match against any of the 4 computed digests above.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exact digest match verified against {compareMatch}!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Base64 & URL Encoder */}
      {activeTab === 'base64' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['base64', 'Standard Base64 (RFC 4648)'],
                ['base64url', 'Base64URL (JWT / URL-safe)'],
                ['url', 'URL Percent-Encoding'],
              ] as ['base64' | 'base64url' | 'url', string][]
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => switchEncodingMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  encodingMode === m
                    ? 'bg-orange-50 text-orange-700 border-orange-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {encodeError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{encodeError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="b64-plain" className="font-semibold text-slate-700">
                  Decoded Plain Text (UTF-8)
                </label>
                <span className="font-mono text-slate-500 tabular-nums">
                  {new TextEncoder().encode(plainInput).length} bytes
                </span>
              </div>
              <textarea
                id="b64-plain"
                value={plainInput}
                onChange={(e) => handlePlainChange(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-300 focus:border-orange-500 p-3.5 font-mono text-xs text-slate-900 bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="b64-encoded" className="font-semibold text-slate-700">
                  Encoded Output ({encodingMode.toUpperCase()})
                </label>
                <span className="font-mono text-slate-500 tabular-nums">
                  {encodedInput.length} chars
                </span>
              </div>
              <textarea
                id="b64-encoded"
                value={encodedInput}
                onChange={(e) => handleEncodedChange(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-300 focus:border-orange-500 p-3.5 font-mono text-xs text-slate-900 bg-[#FAF6F0]/70 focus:bg-white focus:outline-none break-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Local JWT Inspector */}
      {activeTab === 'jwt' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="jwt-input" className="text-xs font-semibold text-slate-700">
              Encoded JSON Web Token (100% decoded locally in browser memory)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setJwtToken(buildSampleJwt(false))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold cursor-pointer"
              >
                Sample Active JWT
              </button>
              <button
                type="button"
                onClick={() => setJwtToken(buildSampleJwt(true))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold cursor-pointer"
              >
                Sample Expired JWT
              </button>
            </div>
          </div>

          <textarea
            id="jwt-input"
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="Paste eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full rounded-xl border border-slate-300 focus:border-orange-500 p-3.5 font-mono text-xs text-slate-900 bg-white focus:outline-none break-all"
          />

          {jwtResult.error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jwtResult.error}</span>
            </div>
          )}

          {jwtResult.decoded && (
            <div className="space-y-4">
              {/* Expiration Status Banner */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border text-xs ${
                  jwtResult.decoded.status === 'valid-time'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : jwtResult.decoded.status === 'expired'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {jwtResult.decoded.status === 'valid-time' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>
                    {jwtResult.decoded.status === 'valid-time'
                      ? 'Token Time Window Active (not expired)'
                      : jwtResult.decoded.status === 'expired'
                      ? 'Token Expired (exp timestamp is in the past)'
                      : jwtResult.decoded.status === 'not-yet-valid'
                      ? 'Token Not Yet Active (nbf timestamp is in the future)'
                      : 'No Expiration Claim (exp) Present'}
                  </span>
                </div>
                <span className="font-mono text-[11px] opacity-80">
                  alg: {String(jwtResult.decoded.header.alg ?? 'unknown')}
                </span>
              </div>

              {/* Decoded Header + Payload */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700">HEADER: Algorithm &amp; Token Type</span>
                    <span className="font-mono text-[11px] text-slate-400">Segment 1</span>
                  </div>
                  <pre className="p-4 font-mono text-xs text-slate-800 overflow-x-auto leading-relaxed">
                    {JSON.stringify(jwtResult.decoded.header, null, 2)}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-700">PAYLOAD: Claims &amp; Data</span>
                    <span className="font-mono text-[11px] text-slate-400">Segment 2</span>
                  </div>
                  <pre className="p-4 font-mono text-xs text-slate-800 overflow-x-auto leading-relaxed">
                    {JSON.stringify(jwtResult.decoded.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Timestamp Claims Table */}
              {jwtResult.decoded.timestamps.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2 px-3.5 font-semibold">Claim</th>
                        <th className="py-2 px-3.5 font-semibold">Local Time</th>
                        <th className="py-2 px-3.5 font-semibold">UTC (ISO 8601)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {jwtResult.decoded.timestamps.map((t) => (
                        <tr key={t.claim}>
                          <td className="py-2 px-3.5 font-sans font-semibold text-slate-800">{t.label}</td>
                          <td className="py-2 px-3.5 text-slate-700">{t.local}</td>
                          <td className="py-2 px-3.5 text-slate-500">{t.iso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signature Segment + Security Notice */}
              <div className="rounded-xl border border-slate-200 bg-[#FAF6F0]/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  <span>SIGNATURE (Segment 3 — Unverified Locally)</span>
                </div>
                <div className="font-mono text-xs text-slate-600 break-all bg-white border border-slate-200 rounded-lg p-2.5">
                  {jwtResult.decoded.signature}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Educational note: Decoding a JWT header and payload does not require any secret key because Base64URL is encoding, not encryption. Cryptographic signature verification must always run server-side.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
