import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, ArrowLeft, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
  onNavigate: (view: string) => void;
}

export default function AdminLoginPage({ onLogin, onNavigate }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const targetAdminEmail = 'shaka.ahmadd@gmail.com';

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.toLowerCase().trim();
    if (trimmedEmail !== targetAdminEmail) {
      setErrorMsg('Access Denied: Only the Superior Admin (shaka.ahmadd@gmail.com) is authorized to log in via this portal.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(trimmedEmail, password);
      if (success) {
        setSuccessMsg('Access authorized. Initializing administrative environment...');
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1000);
      } else {
        setErrorMsg('Authentication failed: Invalid security key or unrecognized credential signature.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Administrative authentication gateway rejected your request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load credentials helper for the designated administrator
  const handleQuickFillAdmin = () => {
    setEmail(targetAdminEmail);
    setPassword('Admin@123456');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden" id="admin-login-page-container">
      {/* Dynamic background element representing higher security status */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden relative z-10 transition-all duration-300 hover:shadow-orange-100/40">
        
        {/* Banner with a clear security header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center space-y-2 relative">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] text-orange-400 font-mono font-medium bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Terminal className="w-3 h-3" /> SECURE_PORTAL
          </div>
          
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto text-orange-400 shadow-inner mt-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-sans font-bold tracking-tight">Administrative Terminal</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized portal reserved exclusively for the Superior Platform Administrator.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Notification Messages */}
          {errorMsg && (
            <div className="flex gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl animate-fade-in" id="admin-login-error">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Authentication Blocked</span>
                <p className="leading-relaxed text-red-600/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl animate-fade-in" id="admin-login-success">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Access Granted</span>
                <p className="leading-relaxed text-emerald-700/90">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
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
                placeholder="shaka.ahmadd@gmail.com"
                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-sm py-2.5 px-3.5 rounded-xl transition-all focus:ring-1 focus:ring-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gray-400" /> Security Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-sm py-2.5 px-3.5 rounded-xl transition-all focus:ring-1 focus:ring-slate-800 outline-none"
              />
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

          {/* Quick-fill button for administrator access */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-center">
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              Quick access helper for the designated administrator:
            </p>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="text-xs bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" /> Quick Fill Admin Info
            </button>
          </div>

          {/* Return Links */}
          <div className="text-center">
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
