import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  TrendingUp,
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

export default function AuthPage({ onLogin, onRegister, onNavigate }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
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
        id: 'mail_' + Math.random().toString(36).substr(2, 9),
        to: resetEmail.toLowerCase().trim(),
        subject: `[universitytutors.com] Secure Reset Token: ${secureToken}`,
        type: 'reset',
        token: secureToken,
        body: `Hello,\n\nWe received a secure request to update your password credential on universitytutors.com.\nYour secure reset token is: ** ${secureToken} **\n\nPlease enter this token in the Reset Password form to unlock your new credential.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setSimEmails(prev => [newMail, ...prev]);

      setSuccessMsg(`Secure recovery key dispatched for ${resetEmail}. Fill the code below to finalize.`);
      setIsResetPasswordView(true);
      setIsForgotPasswordView(false);
      setResetTokenInput(secureToken);
      showToast('Reset Key Dispatched! Check code below');
    } else {
      setErrorMsg('Simulation gateway failed to assign reset token.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail || !resetTokenInput || !newPasswordInput) {
      setErrorMsg('All fields (email, token, and new password) are required.');
      return;
    }

    const success = await store.resetUserPassword(resetEmail, resetTokenInput, newPasswordInput);
    if (success) {
      setSuccessMsg(`Your password credential was updated successfully! You may now sign in.`);
      setIsResetPasswordView(false);
      setIsForgotPasswordView(false);
      setActiveTab('signin');
      setEmail(resetEmail);
      setPassword(newPasswordInput);
      showToast('Password updated! Signing in...');
    } else {
      setErrorMsg('Reset token invalid or expired. Please check code spelling.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please input your registered email address.');
      return;
    }

    if (email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') {
      setErrorMsg('Administrative login for Shaka Ahmad is restricted to the dedicated Admin Portal at /admin only.');
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
          onNavigate('dashboard');
        }, 900);
      } else {
        setErrorMsg('Something went wrong establishing your student account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#eef2f6] min-h-[90vh] flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white relative">
      
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

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">

        {/* ============================================== */}
        {/* LEFT PANEL: Hero & Value Proposition (Orange)  */}
        {/* ============================================== */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#ea580c] via-[#e05307] to-[#c2410c] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full pointer-events-none blur-2xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full pointer-events-none blur-2xl"></div>

          {/* Top Section: Header & Shield Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md mb-6 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              University Tutors<br />Portal
            </h1>

            <p className="mt-4 text-orange-100/90 text-sm leading-relaxed font-normal">
              Log in with your verified credentials or establish a new student profile. Connect directly with verified global academic coaches.
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-3.5">
              {/* Item 1: Real-Time Chat */}
              <div className="bg-white/12 backdrop-blur-md border border-white/20 hover:bg-white/18 rounded-2xl p-4 transition-all duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Real-Time Live Chat</h4>
                    <p className="text-xs text-orange-100/85 mt-0.5 leading-snug">Instant consultation with certified tutors and supervisors on assignments and test preps.</p>
                  </div>
                </div>
              </div>

              {/* Item 2: Escrow Secure Payments */}
              <div className="bg-white/12 backdrop-blur-md border border-white/20 hover:bg-white/18 rounded-2xl p-4 transition-all duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Escrow Secure Payments</h4>
                    <p className="text-xs text-orange-100/85 mt-0.5 leading-snug">Authorize milestones and release funds securely in stages, backed by official administrative support.</p>
                  </div>
                </div>
              </div>

              {/* Item 3: Progress Tracking */}
              <div className="bg-white/12 backdrop-blur-md border border-white/20 hover:bg-white/18 rounded-2xl p-4 transition-all duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Durable Progress Tracking</h4>
                    <p className="text-xs text-orange-100/85 mt-0.5 leading-snug">Keep a full dashboard history of chat rooms, active task deliveries, revisions, and support logs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Tag */}
          <div className="mt-8 pt-6 border-t border-white/20 text-[11px] text-orange-100/75 leading-relaxed relative z-10 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-white/80" />
            <span>Our platform establishes secure, authenticated connection entries. All database and payment records are fully encrypted and stored in PostgreSQL.</span>
          </div>
        </div>


        {/* ============================================== */}
        {/* RIGHT PANEL: Interactive Forms (Tabs)          */}
        {/* ============================================== */}
        <div className="lg:w-7/12 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-white relative">
          
          {/* Top Subtitle Brand Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-widest text-orange-600 uppercase">
              University Tutors Platform
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              256-bit SSL Protected
            </span>
          </div>

          {/* Segmented Switcher / Top Navigation Tabs */}
          {!isForgotPasswordView && !isResetPasswordView && (
            <div className="flex p-1 bg-slate-100 rounded-xl max-w-xs mb-8 mt-1 border border-slate-200">
              <button 
                id="tab-btn-signin"
                onClick={() => handleTabSwitch('signin')} 
                type="button" 
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'shadow-sm bg-white text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                } focus:outline-none`}
              >
                Sign In
              </button>
              <button 
                id="tab-btn-signup"
                onClick={() => handleTabSwitch('signup')} 
                type="button" 
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'shadow-sm bg-white text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                } focus:outline-none`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts: Error & Success */}
          {errorMsg && (
            <div id="auth-error-msg" className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-6 flex items-start gap-2.5">
              <span className="shrink-0 text-amber-600 font-sans text-sm font-bold">⚠️</span>
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-msg" className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================== */}
          {/* VIEW: FORGOT PASSWORD FLOW                     */}
          {/* ============================================== */}
          {isForgotPasswordView ? (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-orange-600" />
                  Forgot Security Password
                </h2>
                <p className="text-slate-500 text-xs mt-1.5">
                  Enter your registered student email address. We will transmit a secure recovery token to unlock your account.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Registered Student Email
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(false);
                      setActiveTab('signin');
                    }}
                    className="w-1/3 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>Dispatch Recovery Key</span>
                  </button>
                </div>
              </form>
            </div>
          ) : isResetPasswordView ? (
            /* ============================================== */
            /* VIEW: RESET PASSWORD CODE VERIFICATION         */
            /* ============================================== */
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Establish New Password
                </h2>
                <p className="text-slate-500 text-xs mt-1.5">
                  Enter the recovery token dispatched to <strong className="text-orange-600">{resetEmail}</strong>.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Recovery Token
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <KeyRound className="w-4 h-4 text-orange-500" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="RESET-123456"
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-orange-50/30 border border-orange-200 rounded-xl text-sm font-mono font-bold uppercase tracking-wider text-orange-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Security Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
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
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPasswordView(false);
                      setIsForgotPasswordView(true);
                    }}
                    className="w-1/3 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'signin' ? (
            /* ============================================== */
            /* VIEW 1: SIGN IN VIEW                           */
            /* ============================================== */
            <div id="signin-view" className="view-card view-active">
              <div className="mb-7">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h2>
                <p className="text-slate-500 text-sm mt-1.5">Sign in to access your dashboard, chats, and assignments.</p>
              </div>

              {/* Quick Demo Fills */}
              <div className="mb-5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Quick Demo:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('alex@example.com', 'Alex Mercer')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-semibold rounded-lg border border-slate-200 transition-colors text-[11px]"
                  >
                    Alex Mercer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('lunn@example.com', 'Lunn (Student)')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-semibold rounded-lg border border-slate-200 transition-colors text-[11px]"
                  >
                    Lunn
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="login-email">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
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
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="login-password">
                      Security Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setResetEmail(email || 'alex@example.com');
                        setIsForgotPasswordView(true);
                      }} 
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Forgot Key?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
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
                      className="block w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
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

                {/* Remember me & Status */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500" 
                    />
                    <span>Remember session on this device</span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] group disabled:opacity-70 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Authenticate Profile'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Divider with prominent Create Account option */}
              <div className="relative my-7 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  New to University Tutors?
                </span>
              </div>

              {/* Secondary CTA: Create Account button */}
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className="w-full py-3 px-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>

              <p className="text-center text-xs text-slate-500 mt-5">
                Don't have an account? 
                <button 
                  type="button"
                  onClick={() => handleTabSwitch('signup')} 
                  className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Establish Registration Here
                </button>
              </p>
            </div>
          ) : (
            /* ============================================== */
            /* VIEW 2: CREATE ACCOUNT (REGISTRATION) VIEW     */
            /* ============================================== */
            <div id="signup-view" className="view-card view-active">
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-semibold mb-2 border border-orange-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Registration</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Student Account</h2>
                <p className="text-slate-500 text-sm mt-1">Join as a student to book verified tutors and submit assignments.</p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-name">
                    Full Legal Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
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
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-email">
                    University / Student Email
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      id="reg-email"
                      required
                      placeholder="student.name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password & Confirmation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-pass">
                      Password
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                        <Key className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="reg-pass"
                        required
                        placeholder="Min 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-pass-confirm">
                      Confirm
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                        <Check className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="reg-pass-confirm"
                        required
                        placeholder="Re-enter"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                    <input 
                      type="checkbox" 
                      required 
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500" 
                    />
                    <span>
                      I agree to the <button type="button" onClick={() => onNavigate('terms')} className="text-orange-600 underline font-medium">Terms of Service</button>, student honor code, and Escrow payment terms.
                    </span>
                  </label>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] group disabled:opacity-70 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Register Student Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-5">
                Already have an existing student profile? 
                <button 
                  type="button"
                  onClick={() => handleTabSwitch('signin')} 
                  className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Sign In Here
                </button>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Google OAuth human reviewer disclosure block */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 mt-6 space-y-4 shadow-sm text-left">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
            Application Overview &amp; Google OAuth Disclosure
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-1.5 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/60">
              <span className="font-bold text-orange-950 block text-[11px] uppercase tracking-wider">Section A: The App Purpose</span>
              <p className="font-normal text-slate-700">
                <strong>University-tutors</strong> is an integrated academic support platform designed to connect students with expert educational consultants and tutors. This application facilitates secure, real-time consultation chats, document sharing for assignment briefs, and streamlined project tracking between students and administrative teams to enhance the overall learning experience.
              </p>
            </div>
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">Section B: Google Data Usage</span>
              <p className="font-normal text-slate-700">
                When you sign in using your Google Account, <strong>University-tutors</strong> requests access to your basic profile information (such as your name and email address). We use this data exclusively to securely authenticate your account, personalize your dashboard, and verify your identity within our internal chat and support systems. We do not share, sell, or utilize your personal information for any secondary purposes.
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 text-center">
            For more details, view our dedicated <button onClick={() => onNavigate('google-disclosure')} className="text-orange-600 hover:underline font-bold">Google Disclosure page</button> or read our full <button onClick={() => onNavigate('privacy')} className="text-orange-600 hover:underline font-bold">Privacy Policy</button>.
          </div>
        </div>
      </div>

    </div>
  );
}
