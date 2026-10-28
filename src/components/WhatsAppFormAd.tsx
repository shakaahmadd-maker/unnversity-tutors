import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Zap, 
  BookOpen, 
  GraduationCap, 
  FileCheck2, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { User } from '../types';

interface WhatsAppFormAdProps {
  currentUser?: User | null;
  whatsappNumber?: string;
  variant?: 'banner' | 'card' | 'compact';
  title?: string;
  subtitle?: string;
  defaultService?: string;
  defaultSubject?: string;
  className?: string;
  onSuccess?: () => void;
}

export default function WhatsAppFormAd({
  currentUser,
  whatsappNumber = '19178094906',
  variant = 'card',
  title = 'Connect with a Top University Tutor on WhatsApp',
  subtitle = 'Get instant answers, 1-on-1 assignment guidance, or a customized price quote in under 60 seconds.',
  defaultService = 'Assignment Guidance',
  defaultSubject = '',
  className = '',
  onSuccess
}: WhatsAppFormAdProps) {
  const [name, setName] = useState(currentUser?.name || '');
  const [emailOrPhone, setEmailOrPhone] = useState(currentUser?.email || '');
  const [service, setService] = useState(defaultService);
  const [subject, setSubject] = useState(defaultSubject);
  const [urgency, setUrgency] = useState('Within 24-48 hours');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const quickPrompts = [
    { label: '⚡ Urgent Assignment Help', service: 'Assignment Guidance', text: 'Hi, I need urgent guidance with my university assignment.' },
    { label: '💰 Get Instant Price Quote', service: 'Price Quote', text: 'Hi! I would like to request an instant quote for 1-on-1 tutoring.' },
    { label: '📝 Coursework & Problem Sets', service: 'Coursework Tutoring', text: 'Hello! I need continuous coursework mentorship for this semester.' },
    { label: '🎓 Essay & Dissertation Guidance', service: 'Writing Tutoring', text: 'Hi, I am looking for academic essay and thesis writing guidance.' }
  ];

  const handleQuickClick = (quick: typeof quickPrompts[0]) => {
    setService(quick.service);
    if (!message) setMessage(quick.text);
    
    // Construct direct WhatsApp link immediately
    const textMsg = `Hello University Tutors! 👋\n\n*Service:* ${quick.service}\n*Details:* ${quick.text}\n${name ? `*Name:* ${name}\n` : ''}${emailOrPhone ? `*Contact:* ${emailOrPhone}\n` : ''}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const formattedMessage = `Hello University Tutors! 👋\n\n*New Inquiry via WhatsApp Ad Form:*\n` +
      `👤 *Name:* ${name.trim() || 'Student'}\n` +
      `📞 *Contact (Phone/Email):* ${emailOrPhone.trim() || 'Not specified'}\n` +
      `🎯 *Service:* ${service}\n` +
      (subject.trim() ? `📚 *Subject/Module:* ${subject.trim()}\n` : '') +
      `⏰ *Timeline/Urgency:* ${urgency}\n` +
      (message.trim() ? `💬 *Message/Notes:* ${message.trim()}\n` : '') +
      `\n_Sent via University-Tutors.com WhatsApp Fast Track_`;

    const encodedMsg = encodeURIComponent(formattedMessage);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (onSuccess) onSuccess();

    setTimeout(() => {
      setIsSending(false);
    }, 1200);
  };

  const handleCopyLink = () => {
    const defaultText = encodeURIComponent(`Hello University Tutors! I would like to inquire about 1-on-1 tutoring support.`);
    const link = `https://wa.me/${whatsappNumber}?text=${defaultText}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello University Tutors! 👋 I would like to consult with an expert mentor regarding ${service || 'academic tutoring'}.`
  )}`;

  // Compact Variant (e.g. sidebar or mini widget)
  if (variant === 'compact') {
    return (
      <div className={`bg-linear-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-xl ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>WhatsApp Fast Track</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h4>
              <p className="text-[11px] text-emerald-200/80">Online Now &bull; Avg Reply 45s</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-md">
            Direct Link
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Skip lengthy email chains. Chat directly with senior academic advisors on WhatsApp for quotes and mentor matching.
        </p>

        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp (+1 917-809-4906)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>
    );
  }

  // Standard Card / Banner Ad Format
  return (
    <div 
      className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0c221a] via-[#102d22] to-[#0a1c15] text-white border-2 border-emerald-500/40 shadow-2xl ${className}`}
      id="whatsapp-form-ad-unit"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Notification Badge Bar */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/50 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Official WhatsApp Academic Hotline Active</span>
          <span className="text-emerald-500/60 hidden sm:inline">&bull;</span>
          <span className="text-slate-300 hidden sm:inline">Ivy League &amp; Oxbridge Tutor Desk</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 px-2.5 py-1 rounded-lg border border-emerald-700/50 transition-colors cursor-pointer"
            title="Copy Direct WhatsApp Link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Link Copied!' : 'Copy Chat Link'}</span>
          </button>
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>+1 (917) 809-4906</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Prop & Direct Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant WhatsApp Inquiry Ad</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {title}
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Quick 1-Click WhatsApp Direct Links */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-emerald-300/90 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Instant Topic Quick Links:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((quick, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickClick(quick)}
                    className="text-left text-xs font-semibold p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-800/80 border border-emerald-700/40 hover:border-emerald-400/60 text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{quick.label}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-800/40 text-center">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <div className="text-base font-black text-emerald-400">&lt; 1 min</div>
                <div className="text-[10px] text-slate-400 font-medium">Avg Response</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <div className="text-base font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 font-medium">Confidential</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <div className="text-base font-black text-emerald-400">24/7</div>
                <div className="text-[10px] text-slate-400 font-medium">Global Timezones</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive WhatsApp Lead Form */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-400/40 relative">
              
              {/* Form Title */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <MessageCircle className="w-6 h-6 fill-white/20" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Start WhatsApp Consultation
                    </h4>
                    <p className="text-xs text-slate-500">
                      Fill quick details &bull; Launches your WhatsApp app instantly
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  No Spam Guarantee
                </span>
              </div>

              {/* Form Element */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Phone / Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp / Phone / Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199 or email"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Service */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Required
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="Assignment Guidance">Assignment Guidance</option>
                      <option value="Coursework Tutoring">Coursework Tutoring</option>
                      <option value="Writing & Essay Tutoring">Writing &amp; Essay Tutoring</option>
                      <option value="1-on-1 Exam Preparation">1-on-1 Exam Preparation</option>
                      <option value="Dissertation & Thesis">Dissertation &amp; Thesis</option>
                      <option value="General Tutoring / Quote">General Tutoring / Quote</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subject / Course
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Finance, CS, Law"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Urgency / Deadline
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="Urgent (Within 24 hours)">⚡ Urgent (Within 24h)</option>
                      <option value="Within 24-48 hours">Within 24-48 hours</option>
                      <option value="This week (3-5 days)">This week (3-5 days)</option>
                      <option value="Flexible / General Inquiry">Flexible / Long Term</option>
                    </select>
                  </div>
                </div>

                {/* Brief Message / Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brief Query / Instructions <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share assignment rubric requirements, module code, or questions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit Action & Direct Link */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm sm:text-base font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-500 uppercase tracking-wider"
                  >
                    <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>{isSending ? 'Opening WhatsApp...' : 'Start WhatsApp Chat Now'}</span>
                    <ExternalLink className="w-4 h-4 opacity-80" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 pt-1">
                    <div className="flex items-center gap-1 text-[11.5px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dedicated Human Tutors Active Right Now</span>
                    </div>

                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Direct link: wa.me/{whatsappNumber}</span>
                    </a>
                  </div>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
