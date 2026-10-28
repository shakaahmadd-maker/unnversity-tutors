import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, ChevronRight, CheckCircle2, ShieldCheck, Apple, CheckSquare, Inbox, AlertCircle, ArrowLeft, Send, KeyRound } from 'lucide-react';
import { UserRole } from '../types';
import { store } from '../lib/store';
import { googleSignIn } from '../firebase';

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
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingInRealGoogle, setIsLoggingInRealGoogle] = useState(false);
  
  const handleRealGoogleSignIn = async () => {
    if (isLoggingInRealGoogle) return;
    setIsLoggingInRealGoogle(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await googleSignIn();
      if (result) {
        const { user } = result;
        const targetEmail = user.email || '';
        if (!targetEmail) {
          setErrorMsg('No email associated with this Google account.');
          return;
        }

        if (targetEmail.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') {
          setErrorMsg('Administrative login for Shaka Ahmad is restricted to the dedicated Admin Portal at /admin only.');
          return;
        }

        // Check if user is registered in our system store
        const matchedUser = store.users.find(u => u.email.toLowerCase().trim() === targetEmail.toLowerCase().trim());
        if (matchedUser) {
          const loggedIn = onLogin(targetEmail);
          if (loggedIn) {
            setSuccessMsg(`Welcome back, ${matchedUser.name}! Authentication verified.`);
            setTimeout(() => {
              onNavigate('dashboard');
            }, 1000);
          } else {
            setErrorMsg('Failed to initialize workspace session.');
          }
        } else {
          // Setup real verified student or admin account if it's new
          const isShaka = targetEmail.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
          const assignedRole = isShaka ? UserRole.ADMIN : UserRole.STUDENT;
          const realName = isShaka ? 'Shaka Ahmad' : (user.displayName || 'Google Student');
          const success = onRegister(realName, targetEmail, assignedRole, {
            verified: true,
            signupMethod: 'google',
            verifiedAt: new Date().toISOString()
          });
          if (success) {
            setSuccessMsg(`Welcome, ${realName}! Real ${assignedRole} account created and authenticated successfully.`);
            setTimeout(() => {
              onLogin(targetEmail);
              onNavigate('dashboard');
            }, 1100);
          } else {
            setErrorMsg('Failed to complete account registration on the platform.');
          }
        }
      }
    } catch (err: any) {
      console.error('Real Google Sign in error:', err);
      let customErr = err?.message || String(err);
      if (customErr.includes('cancelled-popup-request') || err?.code === 'auth/cancelled-popup-request') {
        customErr = 'Sign-In Request Cancelled: A previous popup operation was already running or got cancelled by another trigger. [CANCELLED_POPUP_REQUEST]';
      } else if (customErr.includes('popup-closed-by-user') || err?.code === 'auth/popup-closed-by-user') {
        customErr = 'Sign-In Popup Closed: The Google Authentication window was closed before completion or blocked by your browser. [POPUP_CLOSED_BY_USER]';
      }
      setErrorMsg(customErr);
    } finally {
      setIsLoggingInRealGoogle(false);
    }
  };
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password & reset password state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [isResetPasswordView, setIsResetPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Simulated email inbox sandbox
  const [simEmails, setSimEmails] = useState<SimEmail[]>(() => {
    const cached = localStorage.getItem('ut_sim_emails');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [
      {
        id: 'verification_lunn_sim',
        to: 'lunn@example.com',
        subject: 'Verify your University Tutors student identity (Security Dispatch)',
        type: 'verification',
        body: 'Hello Lunn,\n\nWe received a registration log for your student identity on universitytutors.com. Please click the verified button link below to immediately synchronize your identity profile and activate your login:\n\n[Verify Student Account]',
        timestamp: 'Just now'
      },
      {
        id: 'welcome_sim',
        to: 'alex@example.com',
        subject: 'Welcome to your University Tutors sandbox',
        type: 'verification',
        body: 'This simulated mailbox intercepts all local server-side notifications, activation links, and secure tokens. No real external SMTP mail is sent in developer preview mode.',
        timestamp: 'Just now'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ut_sim_emails', JSON.stringify(simEmails));
  }, [simEmails]);

  // Student providers and email validation
  const [signupMethod, setSignupMethod] = useState<'email' | 'google' | 'apple'>('email');
  const [verificationSentTo, setVerificationSentTo] = useState('');
  const [verificationProvider, setVerificationProvider] = useState<'email' | 'google' | 'apple' | null>(null);

  // Google verification simulation
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleSimEmail, setGoogleSimEmail] = useState('');
  const [googleSimName, setGoogleSimName] = useState('');

  // Apple verification simulation
  const [isAppleModalOpen, setIsAppleModalOpen] = useState(false);
  const [appleSimEmail, setAppleSimEmail] = useState('');
  const [appleSimName, setAppleSimName] = useState('');

  // Tutor registration state
  const [rate, setRate] = useState(35);
  const [subject, setSubject] = useState('English Literature');
  const [bio, setBio] = useState('Qualified instructor with academic coaching credential.');
  const [country, setCountry] = useState('US');
  const [avatarUrl, setAvatarUrl] = useState('');

  const presetAccounts = [
    { name: 'Student (Lunn - Verify Demo)', email: 'lunn@example.com', role: 'Student' },
    { name: 'Student (Alex Mercer)', email: 'alex@example.com', role: 'Student' },
    { name: 'Tutor (Dr. Clara Stirling)', email: 'clara@example.com', role: 'Tutor' },
    { name: 'Platform Admin (Emily Vance)', email: 'emily@example.com', role: 'Admin' },
  ];

  const handleConfirmVerification = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const targetEmail = verificationSentTo || email;
    const targetName = name || 'Student User';
    
    const extra = {
      verified: true,
      signupMethod: verificationProvider || 'email',
      verifiedAt: new Date().toISOString()
    };

    const isShaka = targetEmail.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
    const assignedRole = isShaka ? UserRole.ADMIN : UserRole.STUDENT;

    const success = onRegister(targetName, targetEmail, assignedRole, extra);
    if (success) {
      setSuccessMsg(`Welcome aboard, ${targetName}! Your account was authenticated successfully. Redirecting...`);
      setVerificationSentTo('');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1200);
    } else {
      setErrorMsg('This student email is already registered. Please sign in or use quick fills.');
      setVerificationSentTo('');
    }
  };

  const handleVerifyEmailInInbox = async (targetEmail: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const success = await store.verifyUserEmail(targetEmail);
    if (success) {
      setSuccessMsg(`Student account verified successfully for ${targetEmail}! Logging in...`);
      setVerificationSentTo('');
      const loggedIn = onLogin(targetEmail);
      if (loggedIn) {
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1200);
      } else {
        setIsLoginView(true);
        setEmail(targetEmail);
      }
    } else {
      setErrorMsg('Failed to verify email address. Please make sure the account is created in our simulation first.');
    }
  };

  const handleResendVerification = (targetEmail: string) => {
    if (!targetEmail) {
      setErrorMsg('Please input your registered student email address.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = targetEmail.toLowerCase().trim();
    const matchedUser = store.users.find(u => u.email.toLowerCase().trim() === trimmedEmail);
    const targetName = matchedUser ? matchedUser.name : 'Valued Student';

    const newMail: SimEmail = {
      id: 'mail_' + Math.random().toString(36).substr(2, 9),
      to: trimmedEmail,
      subject: 'Verify your University Tutors student identity (Security Dispatch)',
      type: 'verification',
      body: `Hello ${targetName},\n\nWe received an email re-dispatch request for your security activation on universitytutors.com. Please click the verified button link below to immediately synchronize your identity profile:\n\n[Verify Student Account]`,
      timestamp: new Date().toLocaleTimeString()
    };

    setSimEmails(prev => [newMail, ...prev]);
    setSuccessMsg(`Simulated verification email dispatched to ${trimmedEmail}! Open the Simulated Student Mail Client below to activate your account.`);
    setVerificationSentTo(trimmedEmail);
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
      setErrorMsg('No account found under this email. Check spelling or preloaded fills.');
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

      setSuccessMsg(`A secure recovery token has been dispatched to ${resetEmail}! Extract your token from the Simulated Mailbox folder below.`);
      setIsResetPasswordView(true);
      setIsForgotPasswordView(false);
      setResetTokenInput(secureToken);
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
      setSuccessMsg(`Your password credential was updated successfully to "${newPasswordInput}"! You may now log in.`);
      setIsResetPasswordView(false);
      setIsLoginView(true);
      setEmail(resetEmail);
      setPassword(newPasswordInput);
    } else {
      setErrorMsg('Reset code rejected. Verify correct token spelling in the inbox sandbox.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLoginView) {
        if (!email) {
          setErrorMsg('Please input your registered email address.');
          return;
        }

        if (email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') {
          setErrorMsg('Administrative login for Shaka Ahmad is restricted to the dedicated Admin Portal at /admin only.');
          return;
        }

        const success = await onLogin(email, password);
        if (success) {
          setSuccessMsg('Authentication successful! Opening workspace session...');
          setTimeout(() => {
            onNavigate('dashboard');
          }, 1000);
        } else {
          setErrorMsg('Authentication failed: Invalid credentials or account not registered.');
        }
      } else {
        if (role === UserRole.STUDENT) {
          if (signupMethod === 'email') {
            if (!name || !email || !password) {
              setErrorMsg('Name, email, and security password are required fields.');
              return;
            }
            const exists = store.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
            if (exists) {
              setErrorMsg('This email is already registered. Please login.');
              return;
            }

            const isShaka = email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
            const assignedRole = isShaka ? UserRole.ADMIN : UserRole.STUDENT;

            const success = await onRegister(isShaka ? 'Shaka Ahmad' : name, email, assignedRole, {
              verified: true,
              password: password,
              signupMethod: 'email',
              verifiedAt: new Date().toISOString()
            });

            if (success) {
              setSuccessMsg(`${isShaka ? 'Admin' : 'Student'} account successfully registered! Redirecting to workspace...`);
              setTimeout(() => {
                onLogin(email, password);
                onNavigate('dashboard');
              }, 1100);
            } else {
              setErrorMsg('Something went wrong during student registration.');
            }
            return;
          } else if (signupMethod === 'google') {
            await handleRealGoogleSignIn();
            return;
          } else if (signupMethod === 'apple') {
            setAppleSimEmail(email || 'student.apple@icloud.com');
            setAppleSimName(name || 'Apple Student');
            setIsAppleModalOpen(true);
            return;
          }
        }

        if (!name || !email || !password) {
          setErrorMsg('Name, email, and security password are required.');
          return;
        }
        
        const extra = {
          password,
          ...(role === UserRole.TUTOR ? {
            hourlyRate: rate,
            subjects: [subject],
            bio: bio,
            country: country,
            ...(avatarUrl.trim() ? { avatarUrl: avatarUrl.trim() } : {})
          } : {})
        };

        const success = await onRegister(name, email, role, extra);
        if (success) {
          setSuccessMsg(`Welcome aboard, ${name}! Your profile was registered successfully. Redirecting...`);
          setTimeout(() => {
            onLogin(email, password);
            onNavigate('dashboard');
          }, 1200);
        } else {
          setErrorMsg('Email address already registered.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <main className="min-h-[85vh] bg-gray-50 flex flex-col items-center justify-center p-6 md:p-12 font-sans gap-6" id="auth-main-page">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row shadow-orange-500/5">
        
        {/* Left column: Professional Brand Identity */}
        <div className="bg-orange-500 text-white p-8 lg:p-12 lg:w-[40%] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-650 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-400 rounded-full blur-2xl opacity-40 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl w-fit mb-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
              University Tutors Portal
            </h2>
            <p className="text-sm text-orange-50 leading-relaxed mt-3">
              Log in with our highly integrated, real-time Google account authentication or sign up for a real workspace below. Connect directly with verified global academic coaches.
            </p>

            <div className="space-y-4 mt-8">
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 p-4 rounded-xl flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Real-time Live Chat</h4>
                  <p className="text-[11px] text-orange-100 mt-0.5 leading-normal">Instant consultation with certified tutors and supervisors on assignments and test preps.</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 p-4 rounded-xl flex items-start gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Escrow Secure Payments</h4>
                  <p className="text-[11px] text-orange-100 mt-0.5 leading-normal">Authorize milestones and release funds securely in stages, backed by official administrative support.</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 p-4 rounded-xl flex items-start gap-3">
                <span className="text-lg">📈</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Durable Progress Tracking</h4>
                  <p className="text-[11px] text-orange-100 mt-0.5 leading-normal">Keep a full dashboard history of chat rooms, active task deliveries, revisions, and support logs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 pt-6 border-t border-white/20 text-[11px] text-orange-100 leading-relaxed relative z-10">
            Our platform establishes secure, authenticated connection entries. All database and payment records are fully encrypted and synchronized in Firebase.
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block">
              University Tutors Platform
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {isLoginView ? 'Welcome Back!' : 'Create Your Academic Account'}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {isLoginView 
                ? 'Sign in to access your dashboard, chats, and assignments.' 
                : 'Complete the form below to register and choose your desired platform role.'}
            </p>
          </div>

          {errorMsg && (
            <div id="auth-error-msg" className="bg-red-50 border border-red-200/80 text-red-700 text-xs p-3.5 rounded-xl mb-6">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 text-amber-600 font-sans text-sm font-bold">⚠️</span>
                <div className="space-y-1 flex-1 leading-normal font-sans">
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-msg" className="bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {isForgotPasswordView ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fade-in" id="forgot-password-form">
              <div className="space-y-2 mb-4">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-orange-500 font-display" />
                  Forgot Academic Password Key
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enter your registered student email address. We will transmit a secure reset token to your simulated sandbox mailbox folders below to restore your credentials.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Student Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    id="forgot-email-input"
                    placeholder="student@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setIsForgotPasswordView(false);
                  }}
                  className="w-1/3 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  id="forgot-submit-btn"
                  className="flex-1 bg-orange-500 text-white font-bold text-xs py-3 rounded-xl hover:bg-orange-650 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Dispatch Secure Token</span>
                </button>
              </div>
            </form>
          ) : isResetPasswordView ? (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fade-in" id="reset-password-form">
              <div className="space-y-2 mb-4">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Establish New Password
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Please fetch the secure token sent to <span className="font-semibold text-emerald-600">{resetEmail}</span> from the simulated mailbox below to unlock security reset.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Secure Reset Token</label>
                <div className="relative border border-orange-200 rounded-xl bg-orange-50/20 p-0.5">
                  <KeyRound className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5 animate-pulse" />
                  <input
                    type="text"
                    id="reset-token-input"
                    placeholder="RESET-123456"
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    className="w-full bg-transparent focus:outline-hidden py-2.5 pl-10 pr-4 text-sm font-mono font-bold uppercase tracking-wider text-orange-950 placeholder:font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">New Security Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    id="reset-password-input"
                    placeholder="Enter at least 6 characters"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-sm transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setIsResetPasswordView(false);
                    setIsForgotPasswordView(true);
                  }}
                  className="w-1/3 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Resend</span>
                </button>
                <button
                  type="submit"
                  id="reset-submit-btn"
                  className="flex-1 bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Commit Password</span>
                </button>
              </div>
            </form>
          ) : verificationSentTo ? (
            /* VERIFICATION SENT FLOW */
            <div className="space-y-6 text-center animate-fade-in p-6 bg-orange-50/50 rounded-3xl border border-[#fed7aa] mt-2">
              <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto text-orange-605 shadow-xs animate-pulse">
                <Inbox className="w-8 h-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-amber-955 font-display">Student Verification Pending!</h4>
                <p className="text-xs text-amber-900/80 max-w-sm mx-auto leading-relaxed">
                  We've dispatched a secure activation email to: <br/>
                  <strong className="text-orange-650 break-all">{verificationSentTo}</strong>.
                </p>
                <div className="text-[10px] bg-amber-500/10 text-amber-805 border border-amber-200/50 px-3 py-1 rounded-full w-fit mx-auto font-mono font-bold">
                  Method: {verificationProvider?.toUpperCase() || 'EMAIL'} AUTH
                </div>
              </div>

              <div className="p-4 bg-white border border-[#fed7aa] rounded-2xl text-left space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Local Verification Inbox Simulator
                </div>
                <p className="text-[10px] text-amber-900/70 leading-normal">
                  In production, the student clicks the validation token inside their actual email client. To bypass for local sandbox testing, click "Verify & Authenticate" below to immediately synchronize database authorization state.
                </p>
                <button
                  type="button"
                  id="confirm-verification-btn"
                  onClick={handleConfirmVerification}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Verify & Authenticate Student Account</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setVerificationSentTo('')}
                className="text-xs text-amber-900/60 font-semibold hover:text-orange-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Registration Details</span>
              </button>
            </div>
          ) : (
            /* STANDARD / SIGNUP FORM FLOW */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLoginView && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Full Representative Student Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        id="register-input-name"
                        placeholder="e.g. Liam Stirling"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-55 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-sm transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-[11px] leading-relaxed font-sans text-left space-y-1 my-2">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      🎓 Student Registration Only
                    </p>
                    <p className="text-gray-700">
                      Public registration is reserved for active students seeking tutor services. <strong>Certified Tutors</strong> and <strong>Sub-Admins</strong> are generated exclusively by the Superior Admin (<span className="font-semibold text-orange-700">shaka.ahmadd@gmail.com</span>).
                    </p>
                  </div>

                  {/* ONLY FOR STUDENTS: Render the specific enabled signup options from the picture */}
                  {role === UserRole.STUDENT && (
                    <div className="space-y-2.5 p-4 bg-orange-50/50 rounded-2xl border border-[#fed7aa] my-3" id="student-signup-providers">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                          Authorized Student Identity Providers
                        </span>
                        <span className="text-[8px] uppercase tracking-widest font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          SECURE ESCROW PINNED
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 mt-2">
                        {/* Option 1: Email / Password */}
                        <button
                          type="button"
                          id="signup-choice-email"
                          onClick={() => setSignupMethod('email')}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            signupMethod === 'email'
                              ? 'bg-orange-100/70 border-orange-400 text-amber-955 font-bold animate-pulse'
                              : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                            <div className="leading-tight">
                              <span className="text-xs block">Email / Security Password</span>
                              <span className="text-[9px] text-amber-800/60 font-mono">Status: Enabled</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Enabled
                          </span>
                        </button>

                        {/* Option 2: Google */}
                        <button
                          type="button"
                          id="signup-choice-google"
                          onClick={() => setSignupMethod('google')}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            signupMethod === 'google'
                              ? 'bg-orange-100/70 border-orange-400 text-amber-955 font-bold animate-pulse'
                              : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 shrink-0 block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <div className="leading-tight">
                              <span className="text-xs block font-sans">Google Account</span>
                              <span className="text-[9px] text-amber-800/60 font-mono">Status: Enabled</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Enabled
                          </span>
                        </button>

                        {/* Option 3: Apple */}
                        <button
                          type="button"
                          id="signup-choice-apple"
                          onClick={() => setSignupMethod('apple')}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            signupMethod === 'apple'
                              ? 'bg-orange-100/70 border-orange-400 text-amber-955 font-bold animate-pulse'
                              : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Apple className="w-4 h-4 text-gray-900 shrink-0" />
                            <div className="leading-tight">
                              <span className="text-xs block font-sans">Apple Account</span>
                              <span className="text-[9px] text-amber-805/65 font-mono">Status: Enabled</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Enabled
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {role === UserRole.TUTOR && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">Tutor Settings</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block">Hourly Rate ($)</label>
                          <input 
                            type="number" 
                            id="register-tutor-rate"
                            min="10" 
                            max="150" 
                            value={rate}
                            onChange={(e) => setRate(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                            className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block">Default Country Flag</label>
                          <select 
                            id="register-tutor-country"
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs"
                          >
                            <option value="GB">🇬🇧 United Kingdom</option>
                            <option value="US">🇺🇸 United States</option>
                            <option value="CA">🇨🇦 Canada</option>
                            <option value="AU">🇦🇺 Australia</option>
                            <option value="NZ">🇳🇿 New Zealand</option>
                            <option value="IE">🇮🇪 Ireland</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block">Specialty Subjects</label>
                        <input 
                          type="text" 
                          id="register-tutor-subject"
                          value={subject} 
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Computer Science" 
                          className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs mt-0.5" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-650 block mb-0.5">Profile Image URL (Avatar)</label>
                        <input 
                          type="url" 
                          id="register-tutor-avatar"
                          value={avatarUrl} 
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/photo-..." 
                          className="w-full bg-white border border-gray-205 py-1.5 px-3 rounded-lg text-xs" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block">Biography Overview</label>
                        <textarea 
                          id="register-tutor-bio"
                          rows={2} 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs mt-0.5" 
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Render credential inputs dynamically based on selection */}
              {(isLoginView || role === UserRole.TUTOR || (role === UserRole.STUDENT && signupMethod === 'email')) ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="email"
                        id="auth-input-email"
                        placeholder="name@university.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-sm transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">Security Password</label>
                      {isLoginView && (
                        <button type="button" className="text-[11px] text-orange-600 hover:underline">
                          Forgot Key?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="password"
                        id="auth-input-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-sm transition-colors"
                        required={!isLoginView}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Google or Apple sign-up CTA button */
                <div className="p-5 bg-orange-50/50 border border-orange-200/50 rounded-2xl text-center space-y-4 my-2 animate-fade-in" id="provider-oauth-simulation-cta">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-950 capitalize font-display">Synchronize {signupMethod} Profile</h5>
                    <p className="text-[11px] text-gray-550 max-w-xs mx-auto leading-relaxed">
                      To complete student registration using your <strong>{signupMethod.toUpperCase()} Account</strong>, launch the secure real-time authentication popup:
                    </p>
                  </div>
                  
                  {signupMethod === 'google' && (
                    <button
                      type="button"
                      id="trigger-google-oauth-btn"
                      onClick={handleRealGoogleSignIn}
                      disabled={isLoggingInRealGoogle}
                      className={`w-full p-3 rounded-xl inline-flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        isLoggingInRealGoogle 
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 hover:shadow-xs'
                      }`}
                    >
                      {isLoggingInRealGoogle ? (
                        <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <svg className="w-4 h-4 shrink-0 block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span>{isLoggingInRealGoogle ? 'Launching Secure Popup...' : 'Connect Real Google Account (Firebase)'}</span>
                    </button>
                  )}

                  {signupMethod === 'apple' && (
                    <button
                      type="button"
                      id="trigger-apple-oauth-btn"
                      onClick={() => {
                        setAppleSimEmail(email || 'student.apple@icloud.com');
                        setAppleSimName(name || 'Apple Student');
                        setIsAppleModalOpen(true);
                      }}
                      className="w-full bg-black hover:bg-zinc-900 border border-black p-3 rounded-xl inline-flex items-center justify-center gap-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <Apple className="w-4 h-4 text-white fill-white shrink-0" />
                      <span>Launch Apple Keychain Handshake</span>
                    </button>
                  )}
                </div>
              )}

              {/* standard submission button for email/login/tutors */}
              {(isLoginView || role === UserRole.TUTOR || (role === UserRole.STUDENT && signupMethod === 'email')) && (
                <div className="space-y-4">
                  <button
                    type="submit"
                    id="auth-submit-btn"
                    className="w-full bg-orange-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-orange-650 hover:-translate-y-0.5 transition-all focus:outline-hidden flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/10"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoginView ? 'Authenticate Profile' : 'Complete Registration & Access Workspace'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-gray-150"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-[9px] font-bold uppercase tracking-wider font-sans">Or connect using</span>
                    <div className="flex-grow border-t border-gray-150"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRealGoogleSignIn}
                    disabled={isLoggingInRealGoogle}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isLoggingInRealGoogle 
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:shadow-xs'
                    }`}
                  >
                    {isLoggingInRealGoogle ? (
                      <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-4.5 h-4.5 shrink-0 block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    <span>{isLoggingInRealGoogle ? 'Authenticating Popup...' : 'Sign In with Real Google Account'}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-100 pt-5 font-sans">
            <button
              id="auth-toggle-view-btn"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                if (isForgotPasswordView || isResetPasswordView) {
                  setIsForgotPasswordView(false);
                  setIsResetPasswordView(false);
                  setIsLoginView(true);
                } else {
                  setIsLoginView(!isLoginView);
                }
              }}
              className="text-xs text-orange-600 hover:text-orange-705 font-bold transition-colors cursor-pointer"
            >
              {isForgotPasswordView || isResetPasswordView
                ? "Return to Platform Authenticate Credentials Screen"
                : isLoginView 
                  ? "Don't have an account? Establish Registration Here" 
                  : 'Already configured? Click here to Log In'}
            </button>
          </div>

        </div>

      </div>

      {/* simulated google login modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="google-auth-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-150 p-8 space-y-6 relative">
            <button 
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto border border-gray-100 shadow-xs">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900">Sign Up with Google</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                University Tutors is requesting secure access to synchronize your verified student identity.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Google Target Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={googleSimName}
                  onChange={(e) => setGoogleSimName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={googleSimEmail}
                  onChange={(e) => setGoogleSimEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!googleSimName || !googleSimEmail) {
                    setErrorMsg('Please prefill Google OAuth info.');
                    setIsGoogleModalOpen(false);
                    return;
                  }
                  setIsGoogleModalOpen(false);
                  // Setup verification
                  setVerificationProvider('google');
                  setVerificationSentTo(googleSimEmail.toLowerCase().trim());
                  setName(googleSimName);
                  setEmail(googleSimEmail.toLowerCase().trim());
                  setSuccessMsg(`Google identity verified successfully for ${googleSimName}. Complete activation below.`);
                }}
                className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Authorize & Synchronize API</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* simulated apple login modal */}
      {isAppleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="apple-auth-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-150 p-8 space-y-6 relative">
            <button 
              type="button"
              onClick={() => setIsAppleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 text-lg cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto text-white shadow-xs">
                <Apple className="w-8 h-8 fill-white text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-950 font-display">Sign Up with Apple ID</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Connect your iCloud Keychain credentials securely with our student environment.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Apple Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liam Sterling"
                  value={appleSimName}
                  onChange={(e) => setAppleSimName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Apple ID (Email)</label>
                <input
                  type="email"
                  placeholder="liam@icloud.com"
                  value={appleSimEmail}
                  onChange={(e) => setAppleSimEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!appleSimName || !appleSimEmail) {
                    setErrorMsg('Please prefill Apple ID credential info.');
                    setIsAppleModalOpen(false);
                    return;
                  }
                  setIsAppleModalOpen(false);
                  // Setup verification
                  setVerificationProvider('apple');
                  setVerificationSentTo(appleSimEmail.toLowerCase().trim());
                  setName(appleSimName);
                  setEmail(appleSimEmail.toLowerCase().trim());
                  setSuccessMsg(`Apple Keychain secure handshake successful. Click below to proceed.`);
                }}
                className="w-full bg-black hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Authorize with Apple Keychain</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAppleModalOpen(false)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth human reviewer disclosure block */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-200 p-6 md:p-8 mt-2 space-y-6 shadow-xs text-left">
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
            Application Overview &amp; Google OAuth Disclosure
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-650 leading-relaxed">
            <div className="space-y-2 bg-orange-50/40 p-5 rounded-2xl border border-orange-100/50">
              <span className="font-bold text-orange-950 block text-[11px] uppercase tracking-wider">Section A: The App Purpose</span>
              <p className="font-medium text-gray-700">
                <strong>University-tutors</strong> is an integrated academic support platform designed to connect students with expert educational consultants and tutors. This application facilitates secure, real-time consultation chats, document sharing for assignment briefs, and streamlined project tracking between students and administrative teams to enhance the overall learning experience.
              </p>
            </div>
            <div className="space-y-2 bg-amber-50/40 p-5 rounded-2xl border border-amber-100/50">
              <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">Section B: Google Data Usage</span>
              <p className="font-medium text-gray-700">
                When you sign in using your Google Account, <strong>University-tutors</strong> requests access to your basic profile information (such as your name and email address). We use this data exclusively to securely authenticate your account, personalize your dashboard, and verify your identity within our internal chat and support systems. We do not share, sell, or utilize your personal information for any secondary purposes.
              </p>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-400 text-center font-mono">
            For more details, view our dedicated <button onClick={() => onNavigate('google-disclosure')} className="text-orange-600 hover:underline font-bold">Google Disclosure page</button> or read our full <button onClick={() => onNavigate('privacy')} className="text-orange-600 hover:underline font-bold">Privacy Policy</button>.
          </div>
        </div>
      </div>

    </main>
  );
}
