import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Mail, MessageSquare, CheckCircle2, ShieldCheck, Clock, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType | null;
  whatsappNumber?: string;
}

export default function WhatsAppChatModal({
  isOpen,
  onClose,
  currentUser,
  whatsappNumber = '19178094906'
}: WhatsAppChatModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const quickPills = [
    { label: '⚡ Urgent Assignment Help', text: 'Hi, I need urgent assistance with my university assignment.' },
    { label: '💰 Get Fast Quote', text: 'Hi! I would like to get a price quote for tutoring.' },
    { label: '📚 Coursework Mentoring', text: 'Hello, I need help with semester coursework.' },
    { label: '🎓 Essay & Thesis Writing', text: 'Hi, I need guidance structuring my academic paper.' }
  ];

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const defaultText = encodeURIComponent(`Hello University Tutors! I would like to inquire about tutoring.`);
    const link = `https://wa.me/${whatsappNumber}?text=${defaultText}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectLaunch = (textPrompt?: string) => {
    const msg = textPrompt || query.trim() || 'Hello University Tutors Support!';
    const formattedMessage = `Hello University Tutors Support! 👋\n\n${name ? `*Name:* ${name.trim()}\n` : ''}${email ? `*Email/Phone:* ${email.trim()}\n` : ''}*Query:* ${msg}`;
    const encodedMsg = encodeURIComponent(formattedMessage);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !query.trim()) return;

    handleDirectLaunch(query.trim());

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center sm:items-end justify-center sm:justify-start p-3 sm:p-6 z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Rectangular style block form popup positioned directly above bottom-left WhatsApp button */}
      <div 
        className="bg-white rounded-2xl max-w-[340px] sm:max-w-md w-full border border-emerald-600 shadow-2xl overflow-hidden font-sans sm:mb-16 md:mb-20 animate-slide-up max-h-[92vh] flex flex-col"
        id="whatsapp-chat-modal-dialog"
      >
        {/* Top Header Banner */}
        <div className="bg-emerald-700 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white relative flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.887 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase">Instant WhatsApp Chat</h3>
                <span className="bg-emerald-500/40 text-emerald-100 border border-emerald-300/40 text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                <Clock className="w-2.5 h-2.5 text-emerald-200" />
                <span>Senior Academic Desk &bull; +1 (917) 809-4906</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-emerald-800/80 hover:bg-emerald-800 text-white p-1 rounded-md transition-colors cursor-pointer border border-white/20"
            title="Close Instant Chat Form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Topics */}
        <div className="bg-emerald-50/70 px-3 py-2 border-b border-emerald-100 shrink-0">
          <div className="text-[9.5px] sm:text-[10px] uppercase font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>Quick 1-Click Topics:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickPills.map((pill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(pill.text);
                  handleDirectLaunch(pill.text);
                }}
                className="text-[10px] font-medium bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md transition-colors cursor-pointer truncate text-left"
                title={pill.text}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body - Block Form */}
        <div className="overflow-y-auto flex-1">
          {submitted ? (
            <div className="p-5 text-center space-y-2 animate-fade-in bg-emerald-50/50">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Connecting to WhatsApp...</h4>
              <p className="text-[11px] text-gray-600 max-w-xs mx-auto">
                Redirecting you to our WhatsApp tutor desk with your query details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-2.5 bg-white">
              <div className="space-y-2">
                {/* Name Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>

                {/* Email / WhatsApp Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-emerald-600" />
                    <span>Email or WhatsApp Number <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. +1 555-0199 or email"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>

                {/* Your Query Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>Your Query / Requirements <span className="text-red-500">*</span></span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Write assignment topic, subject, or questions..."
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Direct Link & Privacy Row */}
              <div className="flex items-center justify-between p-1.5 bg-emerald-50 border border-emerald-200/80 rounded-md text-[9.5px] text-emerald-950 font-medium">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>100% Confidential</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? 'Copied' : 'Copy link'}</span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2 sm:py-2.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border border-gray-300 text-center active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 sm:py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-700 active:scale-95"
                >
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>

              {/* Direct launch skip option on mobile */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => handleDirectLaunch('Hello University Tutors Support!')}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>Or skip form & open WhatsApp directly</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

