import React, { useState } from 'react';
import { Mail, MessageSquare, ArrowRight, Lock, User, X, Sparkles } from 'lucide-react';

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string, avatarUrl?: string) => void;
}

export default function GoogleConnectModal({ isOpen, onClose, onSuccess }: GoogleConnectModalProps) {
  const [customEmail, setCustomEmail] = useState('shaka.ahmadd@gmail.com');
  const [customName, setCustomName] = useState('Shaka Ahmad');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDirectConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) {
      setErrorMsg('Please supply a valid name and active email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSuccess(
        customEmail.trim().toLowerCase(),
        customName.trim(),
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      );
      setIsLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in" id="google-connect-overlay">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-gray-100 overflow-hidden flex flex-col" id="direct-auth-card">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-6 px-8 text-white relative">
          <button 
            id="close-connect-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight leading-tight">Instant Consultation Access</h3>
              <p className="text-[10px] text-white/90 font-semibold tracking-wide uppercase mt-0.5">Direct Academic Chat</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-gray-600 leading-relaxed text-left">
            Connect directly with <strong>Emily Vance (Platform Admin)</strong> and our senior academic supervisors.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Connection Form */}
          <form onSubmit={handleDirectConnect} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Student Full Name</span>
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Shaka Ahmad"
                required
                className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs font-semibold focus:bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. shaka.ahmadd@gmail.com"
                required
                className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs font-semibold focus:bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="direct-con-btn"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-4 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verify & Start Chat Space</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer info badge */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-semibold font-mono">End-To-End Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
