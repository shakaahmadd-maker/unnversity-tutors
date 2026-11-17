import React, { useState, useEffect } from 'react';
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
import { apiFetch, getFriendlyErrorMessage, isAbortError } from '../lib/apiClient';

interface AdminLoginPageProps {
  onLogin: (email: string, password?: string, options?: { adminPortal?: boolean }) => Promise<boolean>;
  onNavigate: (view: string) => void;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

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
  const [googleConfigured, setGoogleConfigured] = useState(false);

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

    const controller = new AbortController();
    apiFetch('/api/auth/providers', { credentials: 'include', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && data?.providers?.google?.configured === true) {
          setGoogleConfigured(true);
        }
      })
      .catch((err) => {
        if (!isAbortError(err)) {
          // ignore discovery error on admin terminal
        }
      });
    return () => controller.abort();
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
        const meRes = await apiFetch('/api/auth/me', { credentials: 'include' });
        const meData = meRes.ok ? await meRes.json() : null;
        const verifiedRole = meData?.user?.role || store.currentUser?.role;

        if (verifiedRole !== 'admin' && verifiedRole !== 'subadmin') {
          await store.logout();
          setErrorMsg('Access Denied: Administrator or Subadmin privileges are required to access this portal.');
          return;
        }

        setSuccessMsg('Access authorized. Initializing administrative environment...');
        onNavigate('dashboard');
      } else {
        setErrorMsg('Authentication failed: Invalid administrator email or password.');
      }
    } catch (err: any) {
      setErrorCode(typeof err?.code === 'string' ? err.code : '');
      setErrorMsg(err?.message || 'Administrative authentication gateway rejected your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    if (!googleConfigured || isLoading) return;
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/auth/google/url', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data?.url !== 'string' || !data.url) {
        throw new Error(data?.error || 'Google SSO is not configured on this server.');
      }
      window.location.assign(data.url);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to initiate Google sign-in.');
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
        if (verifiedUser && (verifiedUser.role === 'admin' || verifiedUser.role === 'subadmin')) {
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
    (errorCode === 'PASSWORD_RESET_REQUIRED' ||
      errorCode === 'PASSWORD_NOT_SET' ||
      errorCode === 'SOCIAL_OR_NO_PASSWORD' ||
      errorMsg.toLowerCase().includes('password reset'));

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
                  {googleConfigured && (
                    <button
                      type="button"
                      onClick={handleAdminGoogleLogin}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <GoogleIcon />
                      <span>Sign in with Google</span>
                    </button>
                  )}
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
            <>
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

              {googleConfigured && (
                <>
                  <div className="relative text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Or Admin SSO
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleAdminGoogleLogin}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </button>
                </>
              )}
            </>
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
