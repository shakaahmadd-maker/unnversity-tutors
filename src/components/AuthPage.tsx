import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  Key,
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  KeyRound,
  Info
} from 'lucide-react';
import { UserRole } from '../types';
import { store } from '../lib/store';

interface AuthPageProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
  onRegister: (name: string, email: string, role: UserRole, extra?: any) => Promise<boolean>;
  onNavigate: (view: string) => void;
}

interface SimEmail {
  id: string;
  to: string;
  subject: string;
  type: 'verification' | 'reset';
  token?: string;
  body: string;
  timestamp: string;
}

// Minimal, clean SVG icons for One-Click Social Registration & Login
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="currentColor" strokeWidth="2" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.67-.82 1.13-1.96 1.01-3.1-.97.04-2.15.65-2.85 1.47-.61.71-1.15 1.87-1.01 2.98 1.09.08 2.19-.55 2.85-1.35z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.26c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-.78-1.74-1.74-1.74Z" />
  </svg>
);

export default function AuthPage({ onLogin, onRegister, onNavigate }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [providers, setProviders] = useState<Record<string, { configured: boolean; name: string }>>({
    google: { configured: false, name: 'Google' },
    apple: { configured: false, name: 'Apple' },
    instagram: { configured: false, name: 'Instagram' },
    x: { configured: false, name: 'X' },
    linkedin: { configured: false, name: 'LinkedIn' },
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password & reset password state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [isResetPasswordView, setIsResetPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Simulated email inbox sandbox for recovery tokens
  const [simEmails, setSimEmails] = useState<SimEmail[]>(() => {
    const cached = localStorage.getItem('ut_sim_emails');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'welcome_student',
        to: 'alex@example.com',
        subject: 'Welcome to University Tutors Portal',
        type: 'verification',
        body: 'Welcome to your verified academic coaching portal. Connect directly with vetted university tutors.',
        timestamp: 'Just now'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ut_sim_emails', JSON.stringify(simEmails));
  }, [simEmails]);

  // Fetch configured OAuth providers on mount
  useEffect(() => {
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(data => {
        if (data?.providers) {
          setProviders(data.providers);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for OAuth postMessage callbacks from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin if available
      const origin = event.origin;
      if (origin && !origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user, redirectUrl } = event.data;
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        if (user) {
          store.currentUser = user;
          localStorage.setItem('ut_current_user', JSON.stringify(user));
          store.notify();
          store.fetchData().catch(() => {});
        }
        showToast(`Authenticated successfully as ${user?.name || 'Student'}!`);
        setSuccessMsg(`Welcome, ${user?.name || 'Student'}! Redirecting to your dashboard...`);
        setIsSubmitting(false);

        setTimeout(() => {
          if (redirectUrl) {
            onNavigate(redirectUrl.replace(/^\//, ''));
          } else {
            onNavigate('dashboard');
          }
        }, 500);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMsg(event.data.error || 'Social sign-in failed. Please try again.');
        setIsSubmitting(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onNavigate]);

  const showToast = (text: string) => {
    setToastText(text);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const handleTabSwitch = (mode: 'signin' | 'signup') => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPasswordView(false);
    setIsResetPasswordView(false);
    setActiveTab(mode);
  };

  const handleQuickFill = (presetEmail: string, presetName: string) => {
    setEmail(presetEmail);
    setPassword('student123');
    setName(presetName);
    showToast(`Pre-filled credentials for ${presetName}`);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail) {
      setErrorMsg('Please input your registered email address.');
      return;
    }

    const matchedUser = store.users.find(u => u.email.toLowerCase().trim() === resetEmail.toLowerCase().trim());
    if (!matchedUser) {
      setErrorMsg('No registered student account was found with this email. Please check spelling or create an account.');
      return;
    }

    const secureToken = 'RESET-' + Math.floor(100000 + Math.random() * 900000);
    const success = await store.setResetToken(resetEmail, secureToken);

    if (success) {
      const newMail: SimEmail = {
        id: 'reset_' + Date.now(),
        to: resetEmail,
        subject: 'Security Token: Reset Your Password',
        type: 'reset',
        token: secureToken,
        body: `Your secure password reset key is: ${secureToken}. Enter this key on the verification screen to establish a new password.`,
        timestamp: 'Just now'
      };
      setSimEmails(prev => [newMail, ...prev]);

      setSuccessMsg(`Recovery token generated and sent to ${resetEmail}. Check your simulated inbox.`);
      showToast(`Recovery key sent: ${secureToken}`);
      setIsForgotPasswordView(false);
      setIsResetPasswordView(true);
      setResetTokenInput(secureToken);
    } else {
      setErrorMsg('Unable to dispatch security token. Please try again.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetTokenInput.trim()) {
      setErrorMsg('Please enter your recovery token.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setErrorMsg('New password must contain at least 6 characters.');
      return;
    }

    const success = await store.resetPassword(
      resetEmail,
      resetTokenInput.trim(),
      newPasswordInput
    );

    if (success) {
      setSuccessMsg('Your security password has been updated successfully. Please sign in with your new credentials.');
      showToast('Password updated successfully!');
      setIsResetPasswordView(false);
      setActiveTab('signin');
      setPassword(newPasswordInput);
    } else {
      setErrorMsg('Invalid or expired security token. Please request a new token.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please supply both your registered email and security password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onLogin(email.trim(), password);
      if (success) {
        setSuccessMsg('Authenticated profile successfully! Opening student workspace...');
        showToast('Sign In Successful! Redirecting...');
        setTimeout(() => {
          onNavigate('dashboard');
        }, 800);
      } else {
        setErrorMsg('Authentication failed: Invalid credentials or account not registered.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Full name, email, and security password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password confirmation does not match the entered password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Security password must contain at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service and Escrow payment terms to register.');
      return;
    }

    const existingUser = store.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (existingUser) {
      setErrorMsg('This student email is already registered. Please sign in instead.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isShaka = email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
      const assignedRole = isShaka ? UserRole.ADMIN : UserRole.STUDENT;

      const success = await onRegister(
        name.trim(),
        email.trim(),
        assignedRole,
        {
          verified: true,
          password: password,
          signupMethod: 'email',
          verifiedAt: new Date().toISOString()
        }
      );

      if (success) {
        setSuccessMsg('Student account created successfully! Welcome to the portal.');
        showToast('Account Created Successfully!');
        setTimeout(async () => {
          await onLogin(email.trim(), password);
          onNavigate('student/dashboard');
        }, 600);
      } else {
        setErrorMsg('Something went wrong establishing your student account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Secure OAuth 2.0 Authorization Code Flow Handler
  const handleSocialAuth = async (providerKey: 'google' | 'apple' | 'instagram' | 'x' | 'linkedin') => {
    setErrorMsg('');
    setSuccessMsg('');

    const p = providers[providerKey];
    const providerName = p?.name || providerKey.toUpperCase();

    // Requirement 3 & 4: If not configured, explain that environment variables are required
    if (!p || !p.configured) {
      setErrorMsg(`${providerName} authentication is not yet configured. Environment variables (${providerKey.toUpperCase()}_CLIENT_ID & ${providerKey.toUpperCase()}_CLIENT_SECRET) are required on the server.`);
      showToast(`${providerName} login not configured`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Fetch the provider's authorization URL from the server
      const res = await fetch(`/api/auth/${providerKey}/url`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Could not initiate ${providerName} login.`);
      }

      // 2. Open the OAuth PROVIDER's URL directly in a popup window
      const popup = window.open(
        data.url,
        'oauth_popup',
        'width=600,height=700,status=no,toolbar=no,menubar=no'
      );
      if (!popup) {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site to complete social sign-in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Social sign-in failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastVisible && (
        <div 
          id="toast-message" 
          className="fixed bottom-6 right-6 max-w-sm bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 z-50 transition-all animate-bounce"
        >
          <Info className="w-4 h-4 text-orange-400 shrink-0" />
          <span id="toast-text" className="font-medium">{toastText}</span>
        </div>
      )}

      {/* Main Minimal Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-9 relative">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mb-3 border border-orange-100 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-2xl font-black text-slate-900 tracking-tight">
            University Tutors
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Student &amp; Academic Portal
          </p>
        </div>

        {/* Minimal Tab Switcher */}
        {!isForgotPasswordView && !isResetPasswordView && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button 
              id="tab-btn-signin"
              onClick={() => handleTabSwitch('signin')} 
              type="button" 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'signin'
                  ? 'shadow-xs bg-white text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              } focus:outline-none`}
            >
              Sign In
            </button>
            <button 
              id="tab-btn-signup"
              onClick={() => handleTabSwitch('signup')} 
              type="button" 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'signup'
                  ? 'shadow-xs bg-white text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              } focus:outline-none`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts: Error & Success */}
        {errorMsg && (
          <div id="auth-error-msg" className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-5 flex items-start gap-2">
            <span className="shrink-0 text-amber-600 text-sm font-bold">⚠️</span>
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div id="auth-success-msg" className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* ============================================== */}
        {/* VIEW: FORGOT PASSWORD FLOW                     */}
        {/* ============================================== */}
        {isForgotPasswordView ? (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-600" />
                Reset Password
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Enter your registered email to receive a recovery key.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setActiveTab('signin');
                  }}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Recovery Key</span>
                </button>
              </div>
            </form>
          </div>
        ) : isResetPasswordView ? (
          /* ============================================== */
          /* VIEW: RESET PASSWORD CODE VERIFICATION         */
          /* ============================================== */
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                New Password
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Enter recovery key dispatched to <strong className="text-orange-600">{resetEmail}</strong>.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recovery Token
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <KeyRound className="w-4 h-4 text-orange-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="RESET-123456"
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-orange-50/30 border border-orange-200 rounded-xl text-sm font-mono font-bold uppercase tracking-wider text-orange-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPasswordView(false);
                    setIsForgotPasswordView(true);
                  }}
                  className="w-1/3 bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'signin' ? (
          /* ============================================== */
          /* VIEW 1: SIGN IN VIEW                           */
          /* ============================================== */
          <div id="signin-view" className="space-y-4">
            
            {/* Quick Demo Pre-fill Pill Bar */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Quick Demo:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('alex@example.com', 'Alex Mercer')}
                  className="px-2 py-0.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold rounded border border-slate-200 transition-colors text-[10px] cursor-pointer"
                >
                  Alex
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('lunn@example.com', 'Lunn (Student)')}
                  className="px-2 py-0.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold rounded border border-slate-200 transition-colors text-[10px] cursor-pointer"
                >
                  Lunn
                </button>
              </div>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    required
                    placeholder="name@university.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="login-password">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setResetEmail(email || 'alex@example.com');
                      setIsForgotPasswordView(true);
                    }} 
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input 
                    type="checkbox" 
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500" 
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Social Authentication Section */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Social Authentication: Google, Apple, Instagram, X, LinkedIn */}
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                id="social-login-google"
                onClick={() => handleSocialAuth('google')}
                title={providers.google?.configured ? "Continue with Google" : "Continue with Google (Configuration pending in environment variables)"}
                aria-label="Continue with Google"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-700 ${
                  providers.google?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <GoogleIcon />
              </button>

              <button
                type="button"
                id="social-login-apple"
                onClick={() => handleSocialAuth('apple')}
                title={providers.apple?.configured ? "Continue with Apple" : "Continue with Apple (Configuration pending in environment variables)"}
                aria-label="Continue with Apple"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-900 ${
                  providers.apple?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <AppleIcon />
              </button>

              <button
                type="button"
                id="social-login-instagram"
                onClick={() => handleSocialAuth('instagram')}
                title={providers.instagram?.configured ? "Continue with Instagram" : "Continue with Instagram (Configuration pending in environment variables)"}
                aria-label="Continue with Instagram"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-800 hover:text-pink-600 ${
                  providers.instagram?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <InstagramIcon />
              </button>

              <button
                type="button"
                id="social-login-x"
                onClick={() => handleSocialAuth('x')}
                title={providers.x?.configured ? "Continue with X" : "Continue with X (Configuration pending in environment variables)"}
                aria-label="Continue with X"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-900 ${
                  providers.x?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <XIcon />
              </button>

              <button
                type="button"
                id="social-login-linkedin"
                onClick={() => handleSocialAuth('linkedin')}
                title={providers.linkedin?.configured ? "Continue with LinkedIn" : "Continue with LinkedIn (Configuration pending in environment variables)"}
                aria-label="Continue with LinkedIn"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-blue-700 ${
                  providers.linkedin?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <LinkedInIcon />
              </button>
            </div>

            {/* Toggle to Signup */}
            <p className="text-center text-xs text-slate-500 pt-3">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => handleTabSwitch('signup')} 
                className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        ) : (
          /* ============================================== */
          /* VIEW 2: CREATE ACCOUNT (REGISTRATION) VIEW     */
          /* ============================================== */
          <div id="signup-view" className="space-y-3.5">
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="reg-name"
                    required
                    placeholder="e.g. Alexander Hamilton"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-email">
                  Student Email
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="reg-email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password & Confirmation */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-pass">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-pass"
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-pass-confirm">
                    Confirm
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="reg-pass-confirm"
                      required
                      placeholder="Re-enter"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 leading-snug">
                  <input 
                    type="checkbox" 
                    required 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500" 
                  />
                  <span>
                    I accept the <button type="button" onClick={() => onNavigate('terms')} className="text-orange-600 underline font-medium">Terms</button> &amp; academic guidelines.
                  </span>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1.5 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 text-sm"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Social Authentication Section */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or sign up with
              </span>
            </div>

            {/* Social Authentication: Google, Apple, Instagram, X, LinkedIn */}
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                id="social-signup-google"
                onClick={() => handleSocialAuth('google')}
                title={providers.google?.configured ? "Continue with Google" : "Continue with Google (Configuration pending in environment variables)"}
                aria-label="Continue with Google"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-700 ${
                  providers.google?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <GoogleIcon />
              </button>

              <button
                type="button"
                id="social-signup-apple"
                onClick={() => handleSocialAuth('apple')}
                title={providers.apple?.configured ? "Continue with Apple" : "Continue with Apple (Configuration pending in environment variables)"}
                aria-label="Continue with Apple"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-900 ${
                  providers.apple?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <AppleIcon />
              </button>

              <button
                type="button"
                id="social-signup-instagram"
                onClick={() => handleSocialAuth('instagram')}
                title={providers.instagram?.configured ? "Continue with Instagram" : "Continue with Instagram (Configuration pending in environment variables)"}
                aria-label="Continue with Instagram"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-800 hover:text-pink-600 ${
                  providers.instagram?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <InstagramIcon />
              </button>

              <button
                type="button"
                id="social-signup-x"
                onClick={() => handleSocialAuth('x')}
                title={providers.x?.configured ? "Continue with X" : "Continue with X (Configuration pending in environment variables)"}
                aria-label="Continue with X"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-slate-900 ${
                  providers.x?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <XIcon />
              </button>

              <button
                type="button"
                id="social-signup-linkedin"
                onClick={() => handleSocialAuth('linkedin')}
                title={providers.linkedin?.configured ? "Continue with LinkedIn" : "Continue with LinkedIn (Configuration pending in environment variables)"}
                aria-label="Continue with LinkedIn"
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all duration-150 hover:shadow-xs active:scale-95 text-blue-700 ${
                  providers.linkedin?.configured ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-slate-100/70 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <LinkedInIcon />
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => handleTabSwitch('signin')} 
                className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
