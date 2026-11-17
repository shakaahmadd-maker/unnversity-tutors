import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Eye,
  EyeOff,
  Send,
  Check,
} from 'lucide-react';
import { store } from '../lib/store';
import { ApiError, apiFetch, getFriendlyErrorMessage, isAbortError } from '../lib/apiClient';

interface AdminLoginPageProps {
  onLogin: (email: string, password?: string, options?: { adminPortal?: boolean }) => Promise<boolean>;
  onNavigate: (view: string) => void;
}

type AdminStatusState =
  | { kind: 'checking' }
  | { kind: 'ready'; configured: true; adminUserPresent: true }
  | { kind: 'password_reset_required'; configured: false; adminUserPresent: true }
  | { kind: 'not_configured'; configured: false; adminUserPresent: false }
  | { kind: 'http_auth_error'; status: number }
  | { kind: 'http_not_found'; status: 404 }
  | { kind: 'html_mismatch'; status: number }
  | { kind: 'proxy_or_network_error'; status: number; detail: string };

export default function AdminLoginPage({ onLogin, onNavigate }: AdminLoginPageProps) {
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusState, setStatusState] = useState<AdminStatusState>({ kind: 'checking' });
  const hasRequestedStatusRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('reset_token') || params.get('token');
      const emailParam = params.get('email');
      if (tokenParam) {
        setResetToken(tokenParam.trim());
        if (emailParam) {
          setResetEmail(emailParam.trim());
          setEmail(emailParam.trim());
        }
        setViewMode('reset');
        setSuccessMsg('Recovery link verified. Enter a new administrator password below.');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // Execute GET /api/auth/admin/status once per mount (no retry loops)
    if (hasRequestedStatusRef.current) {
      return;
    }
    hasRequestedStatusRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch('/api/auth/admin/status', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          dedupe: false,
          skipAuthEvent: true,
          timeoutMs: 12_000,
        });

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const rawBody = await res.text();
        if (cancelled) return;

        const trimmed = rawBody.trim();
        if (
          contentType.includes('text/html') ||
          trimmed.startsWith('<!DOCTYPE') ||
          trimmed.toLowerCase().startsWith('<html')
        ) {
          setStatusState({ kind: 'html_mismatch', status: res.status || 200 });
          return;
        }

        if (res.status === 401 || res.status === 403) {
          setStatusState({ kind: 'http_auth_error', status: res.status });
          return;
        }

        if (res.status === 404) {
          setStatusState({ kind: 'http_not_found', status: 404 });
          return;
        }

        if (!res.ok) {
          setStatusState({
            kind: 'proxy_or_network_error',
            status: res.status,
            detail: `GET /api/auth/admin/status returned HTTP ${res.status}.`,
          });
          return;
        }

        let parsed: any = null;
        try {
          parsed = trimmed ? JSON.parse(trimmed) : null;
        } catch {
          setStatusState({
            kind: 'proxy_or_network_error',
            status: res.status,
            detail: 'GET /api/auth/admin/status returned invalid JSON.',
          });
          return;
        }

        if (typeof parsed?.configured === 'boolean') {
          const adminPresent = Boolean(parsed.adminUserPresent);
          if (parsed.configured) {
            setStatusState({ kind: 'ready', configured: true, adminUserPresent: true });
          } else if (adminPresent) {
            setStatusState({ kind: 'password_reset_required', configured: false, adminUserPresent: true });
          } else {
            setStatusState({ kind: 'not_configured', configured: false, adminUserPresent: false });
          }
          return;
        }

        setStatusState({
          kind: 'proxy_or_network_error',
          status: res.status,
          detail: 'Unexpected status payload returned from /api/auth/admin/status.',
        });
      } catch (err: any) {
        if (cancelled || isAbortError(err)) return;
        if (err instanceof ApiError) {
          if (err.code === 'API_ROUTING_MISMATCH') {
            setStatusState({ kind: 'html_mismatch', status: err.status || 502 });
            return;
          }
          if (err.status === 401 || err.status === 403) {
            setStatusState({ kind: 'http_auth_error', status: err.status });
            return;
          }
          if (err.status === 404) {
            setStatusState({ kind: 'http_not_found', status: 404 });
            return;
          }
          setStatusState({
            kind: 'proxy_or_network_error',
            status: err.status || 0,
            detail: err.message || 'Unable to reach /api/auth/admin/status.',
          });
          return;
        }
        setStatusState({
          kind: 'proxy_or_network_error',
          status: 0,
          detail: 'Network error while reaching /api/auth/admin/status.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');

    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Administrator email and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(trimmedEmail, password, { adminPortal: true });
      if (success) {
        const meRes = await apiFetch('/api/auth/me', {
          credentials: 'include',
          dedupe: false,
        });
        const meData = meRes.ok ? await meRes.json() : null;
        const verifiedRole = String(meData?.user?.role || store.currentUser?.role || '').toLowerCase();

        if (
          verifiedRole !== 'admin' &&
          verifiedRole !== 'super_admin' &&
          verifiedRole !== 'subadmin' &&
          verifiedRole !== 'sub_admin'
        ) {
          await store.logout();
          setErrorMsg('Access Denied: Administrator or Subadmin privileges are required to access this portal.');
          return;
        }

        setStatusState({ kind: 'ready', configured: true, adminUserPresent: true });
        setSuccessMsg('Access authorized. Initializing administrative environment...');
        onNavigate('dashboard');
      } else {
        setErrorMsg('Invalid administrator email or password.');
      }
    } catch (err: any) {
      setErrorCode(typeof err?.code === 'string' ? err.code : '');
      setErrorMsg(err?.message || 'Unable to complete administrator sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');

    const targetEmail = resetEmail.toLowerCase().trim();
    if (!targetEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    setIsLoading(true);
    try {
      await store.requestPasswordReset(targetEmail);
      setSuccessMsg(`If an administrator account exists for ${targetEmail}, password recovery instructions have been dispatched.`);
      setViewMode('reset');
      setResetToken('');
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');

    if (!resetToken.trim()) {
      setErrorMsg('Please enter the recovery token from your email.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMsg('Password must be at least 8 characters and include both letters and numbers.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await store.resetPassword(resetEmail.trim(), resetToken.trim(), newPassword, newPassword);
      if (ok) {
        const verifiedUser = store.currentUser || (await store.verifySession());
        const verifiedRole = String(verifiedUser?.role || '').toLowerCase();
        if (
          verifiedUser &&
          (verifiedRole === 'admin' || verifiedRole === 'super_admin' || verifiedRole === 'subadmin' || verifiedRole === 'sub_admin')
        ) {
          setStatusState({ kind: 'ready', configured: true, adminUserPresent: true });
          setSuccessMsg('Administrator password updated. Accessing portal...');
          onNavigate('dashboard');
        } else {
          setSuccessMsg('Password updated successfully. Please sign in.');
          setViewMode('login');
        }
      } else {
        setErrorMsg('Invalid or expired recovery token. Please request a new token.');
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const showPasswordRecoveryHint =
    errorCode !== 'ADMIN_AUTH_NOT_CONFIGURED' &&
    errorCode !== 'ADMIN_BOOTSTRAP_CONFLICT' &&
    (errorCode === 'PASSWORD_RESET_REQUIRED' ||
      errorCode === 'PASSWORD_NOT_SET' ||
      errorCode === 'SOCIAL_OR_NO_PASSWORD' ||
      errorMsg.toLowerCase().includes('password reset'));

  const renderStatusBanner = () => {
    if (viewMode !== 'login') return null;
    if (statusState.kind === 'checking' || statusState.kind === 'ready') return null;

    if (statusState.kind === 'password_reset_required') {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl space-y-2.5" id="admin-status-notice">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Administrator Password Setup Required</span>
              <p className="leading-relaxed text-amber-800">
                An administrator account is present in PostgreSQL (<code className="font-mono">adminUserPresent=true</code>), but an active password hash is not configured (<code className="font-mono">configured=false</code>). Existing accounts are never overwritten on startup — use the password-reset flow below.
              </p>
            </div>
          </div>
          <div className="pl-7">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setErrorCode('');
                setResetEmail(email.trim());
                setViewMode('forgot');
              }}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Set / Reset Administrator Password</span>
            </button>
          </div>
        </div>
      );
    }

    if (statusState.kind === 'not_configured') {
      if (errorCode === 'ADMIN_AUTH_NOT_CONFIGURED' || errorCode === 'ADMIN_BOOTSTRAP_CONFLICT') {
        return null;
      }
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl space-y-1.5" id="admin-status-notice">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Initial Administrator Not Configured</span>
              <p className="leading-relaxed text-amber-800">
                Server reported <code className="font-mono">configured=false</code> and <code className="font-mono">adminUserPresent=false</code>. Configure the dedicated administrator email and initial password in the backend runtime environment, then restart the server.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (statusState.kind === 'http_not_found') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl space-y-1.5" id="admin-status-notice">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Admin Status Endpoint Not Found (HTTP 404)</span>
              <p className="leading-relaxed text-red-700">
                <code className="font-mono">GET /api/auth/admin/status</code> returned HTTP 404. Redeploy the backend container so the latest server build is running on port 3000.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (statusState.kind === 'http_auth_error') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl space-y-1.5" id="admin-status-notice">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Status Endpoint Blocked (HTTP {statusState.status})</span>
              <p className="leading-relaxed text-red-700">
                <code className="font-mono">GET /api/auth/admin/status</code> returned HTTP {statusState.status}. Ensure upstream proxy rules allow unauthenticated GET requests to <code className="font-mono">/api/auth/admin/status</code>.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (statusState.kind === 'html_mismatch') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl space-y-1.5" id="admin-status-notice">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <span className="font-semibold block">API Routing Mismatch (HTML Returned)</span>
              <p className="leading-relaxed text-red-700">
                <code className="font-mono">GET /api/auth/admin/status</code> returned HTML instead of JSON (HTTP {statusState.status}). Configure the reverse proxy to forward <code className="font-mono">/api/*</code> to the Node.js server on port 3000 instead of static SPA assets.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl space-y-1.5" id="admin-status-notice">
        <div className="flex gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <span className="font-semibold block">
              Backend Connection Error{statusState.status ? ` (HTTP ${statusState.status})` : ''}
            </span>
            <p className="leading-relaxed text-red-700">{statusState.detail}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden" id="admin-login-page-container">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden relative z-10 transition-all duration-300 hover:shadow-orange-100/40">

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center space-y-2 relative">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] text-orange-400 font-mono font-medium bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Terminal className="w-3 h-3" /> SECURE_PORTAL
          </div>

          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto text-orange-400 shadow-inner mt-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-sans font-bold tracking-tight">Administrative Terminal</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized portal reserved exclusively for verified Platform Administrators.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-5">

          {renderStatusBanner()}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl space-y-2.5" id="admin-login-error">
              <div className="flex gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Authentication Blocked</span>
                  <p className="leading-relaxed text-red-600/90">{errorMsg}</p>
                </div>
              </div>
              {showPasswordRecoveryHint && viewMode === 'login' && (
                <div className="flex flex-wrap gap-2 pl-7">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setErrorCode('');
                      setResetEmail(email.trim());
                      setViewMode('forgot');
                    }}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Set / Reset Password</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl" id="admin-login-success">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Notice</span>
                <p className="leading-relaxed text-emerald-700/90">{successMsg}</p>
              </div>
            </div>
          )}

          {viewMode === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <span>Reset / Initialize Admin Password</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter your administrator email address to receive a one-time recovery token.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@university-tutors.com"
                  className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-sm py-2.5 px-3.5 rounded-xl transition-all focus:ring-1 focus:ring-slate-800 outline-none"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setErrorCode('');
                    setViewMode('login');
                  }}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Sending...' : 'Send Recovery Token'}</span>
                </button>
              </div>
            </form>
          ) : viewMode === 'reset' ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Set New Administrator Password</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter the recovery token sent to <strong className="text-slate-800">{resetEmail}</strong>.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Recovery Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste recovery token"
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-slate-800 focus:bg-white text-sm font-mono py-2.5 px-3.5 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars (letters & numbers)"
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-slate-800 focus:bg-white text-sm py-2.5 px-3.5 rounded-xl outline-none"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('forgot')}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Saving...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@university-tutors.com"
                  className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-sm py-2.5 px-3.5 rounded-xl transition-all focus:ring-1 focus:ring-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-gray-400" /> Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setErrorCode('');
                      setSuccessMsg('');
                      setResetEmail(email.trim());
                      setViewMode('forgot');
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    Forgot or set password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your administrator password"
                    className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-sm py-2.5 pl-3.5 pr-10 rounded-xl transition-all focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Role permissions and hashed credentials are verified directly against PostgreSQL.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-950 text-white hover:shadow-md active:scale-98'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-orange-400" />
                    <span>Execute Admin Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
