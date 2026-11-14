import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  FileText,
  Video,
  Calendar,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';
import { User, Blog, FAQ } from '../types';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import { ResponsiveAvatar, ResponsivePicture } from './ResponsiveImage';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

const HowItWorksSection = React.lazy(() => import('./HowItWorksSection'));
const HomeBelowFoldSections = React.lazy(() => import('./HomeBelowFoldSections'));
const MarketingSubpages = React.lazy(() => import('./MarketingSubpages'));

interface MarketingPagesProps {
  activeView: string;
  tutors: User[];
  blogs: Blog[];
  faqs: FAQ[];
  onNavigate: (view: string) => void;
  onTutorSelect: (tutor: User) => void;
  onSelectTutorProfile?: (tutor: User) => void;
  onRaisedConsult: (msg: string) => void;
  onGoogleConnect?: () => void;
}



function useMediaQuery(query: string, defaultMatches = true): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return defaultMatches;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

function MarketingPages({
  activeView,
  tutors,
  blogs,
  faqs,
  onNavigate,
  onTutorSelect,
  onRaisedConsult,
}: MarketingPagesProps) {
  const isSmUp = useMediaQuery('(min-width: 640px)', true);
  const isMdUp = useMediaQuery('(min-width: 768px)', true);

  // Mobile Academic Pillar Booking Sheet State
  const [pillarBookingService, setPillarBookingService] = useState<string | null>(null);
  const [pillarBookingName, setPillarBookingName] = useState<string>('');
  const [pillarBookingLevel, setPillarBookingLevel] = useState<string>('');
  const [pillarBookingNote, setPillarBookingNote] = useState<string>('');
  const [pillarBookingToast, setPillarBookingToast] = useState<boolean>(false);

  // Viewport-gated mount for deep below-the-fold homepage sections
  const belowFoldSentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadBelowFold, setShouldLoadBelowFold] = useState(false);

  useEffect(() => {
    if (activeView !== 'home' || shouldLoadBelowFold) return;
    const node = belowFoldSentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setShouldLoadBelowFold(true), 2500);
      return () => window.clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadBelowFold(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeView, shouldLoadBelowFold]);

  return (
    <div id="marketing-pages-view" className="bg-white font-sans text-gray-800">
      {/* ==================== 1. HOME PAGE ==================== */}
      {activeView === 'home' && (
        <div id="home-section" className="animate-fade-in">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white py-8 sm:py-14 md:py-20 border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="flex-1 text-left space-y-4 sm:space-y-6">
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-orange-700 animate-spin" />
                  Your Global Partner for Academic Success
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 font-sans leading-tight">
                  Expert Tutors for Every <span className="text-orange-650 relative inline-block">University Subject</span>{' '}
                  <br className="hidden md:inline" />
                  Online, On-Demand
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-gray-650 max-w-2xl leading-relaxed text-left">
                  Get 1-on-1 academic tutoring, subject coaching, coursework guidance, and essay structure review from qualified UK, US, CA, AU, NZ &amp; IE academic mentors. Held in PCI protected escrow payment vaults.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <button
                    id="hero-find-tutor-btn"
                    onClick={() => onNavigate('tutors')}
                    className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase px-7 py-3.5 sm:px-8 sm:py-4 min-h-[44px] rounded-xl shadow-lg shadow-orange-650/15 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-center"
                  >
                    Find a Tutor
                  </button>
                  <button
                    id="hero-get-quote-btn"
                    onClick={() => onNavigate('contact')}
                    className="bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-250 font-bold text-xs tracking-wider uppercase px-7 py-3.5 sm:px-8 sm:py-4 min-h-[44px] rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-center"
                  >
                    Get a Free Quote
                  </button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-100 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-600">
                  <div className="flex -space-x-1.5 shrink-0">
                    {tutors.slice(0, 4).map((t, idx) => (
                      <ResponsiveAvatar
                        key={idx}
                        src={t.avatarUrl}
                        sizePx={28}
                        width={28}
                        height={28}
                        loading="lazy"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                        alt={t.name || 'Tutor Avatar'}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="text-gray-900 font-bold block text-xs">
                      Trusted by 10,000+ university students
                    </span>
                    <span className="text-[10px] text-gray-600 block -mt-0.5 font-mono">
                      98% satisfaction score across 500+ tutors
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Hero: Modern Image/Layout overlapping details */}
              <div className="flex-1 relative w-full h-[320px] sm:h-[380px] lg:h-[400px] mt-6 lg:mt-0 max-w-[340px] sm:max-w-none mx-auto">
                <div className="absolute top-6 sm:top-10 right-2 sm:right-4 w-64 sm:w-72 h-72 sm:h-80 bg-orange-600 rounded-3xl transform rotate-2 sm:rotate-3 shadow-2xl overflow-hidden group">
                  <ResponsivePicture
                    src={hero1on1Img}
                    alt="University students on tutoring simulation call"
                    width={400}
                    height={320}
                    sizes="(max-width: 640px) 280px, 320px"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left z-10">
                    <span className="text-[9px] font-mono tracking-widest text-orange-200 font-bold block uppercase">
                      Live Sessions
                    </span>
                    <p className="text-[11px] leading-tight font-medium opacity-95 mt-0.5">
                      Interactive virtual whiteboard
                    </p>
                  </div>
                </div>

                <div className="absolute top-0 left-2 sm:left-4 w-56 sm:w-64 h-64 sm:h-72 bg-white p-3 sm:p-4 rounded-3xl transform -rotate-4 sm:-rotate-6 shadow-xl border border-orange-100/70 flex flex-col justify-between">
                  <div className="w-full h-full bg-orange-50 rounded-2xl flex flex-col p-4 items-center justify-center text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm font-serif text-orange-700 font-bold text-xs sm:text-sm">
                      5.0 ★
                    </div>
                    <p className="text-xs font-bold text-gray-900">Expert Guidance</p>
                    <p className="text-[10px] text-gray-600 font-sans">Available 24/7</p>
                  </div>
                </div>

                <div className="absolute bottom-2 sm:bottom-4 left-6 sm:left-16 bg-white py-2.5 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-20">
                  <div className="flex -space-x-2">
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-orange-850 m-0">
                      💬
                    </p>
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-800 m-0">
                      10k
                    </p>
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-orange-700 m-0 font-sans">
                      ✓
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 block leading-tight">
                      10,000+ Online
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-gray-600 block font-sans">
                      SOP Compliant Advisors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Responsive University Trust Bar (Mounts only active viewport variant) */}
          {!isSmUp ? (
            <div className="py-4 bg-white border-t border-b border-slate-100 overflow-hidden">
              <div className="text-center mb-3 px-4">
                <span className="text-[9px] font-bold tracking-widest text-slate-600 uppercase block mb-0.5">
                  Global Academic Excellence
                </span>
                <h2 className="text-[11px] font-bold text-slate-800 tracking-tight leading-snug">
                  TRUSTED BY STUDENTS FROM LEADING UNIVERSITIES
                </h2>
              </div>

              <div className="relative w-full overflow-hidden py-1">
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                <div className="animate-marquee space-x-2 px-2">
                  {[0, 1].map((dupIdx) => (
                    <React.Fragment key={dupIdx}>
                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">
                          🏛️
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Oxford</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">UK University</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-sm">
                          🎓
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Harvard</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">USA College</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-sm">
                          🏫
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Toronto</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Canada</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">
                          🏛️
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Sydney</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Australia</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm">
                          🏫
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Dublin Trinity</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Ireland</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-sm">
                          🎓
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Auckland</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">New Zealand</p>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <section className="bg-gray-50 py-8 border-b border-gray-100 px-4">
              <div className="container mx-auto max-w-7xl text-center">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-4">
                  Trusted by high-achieving students from the world's leading universities
                </span>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-xs text-gray-600 font-bold font-sans">
                  <span>🏛️ OXFORD UNIVERSITY</span>
                  <span>🏛️ HARVARD COLLEGE</span>
                  <span>🏛️ TORONTO CANADA</span>
                  <span>🏛️ SYDNEY UNIVERSITY</span>
                  <span>🏛️ DUBLIN TRINITY</span>
                  <span>🏛️ AUCKLAND NZ</span>
                </div>
              </div>
            </section>
          )}

          {/* Interactive How It Works Flow Sandbox (Lazy-split to keep initial homepage JS slim) */}
          <React.Suspense
            fallback={
              <section
                id="how-it-works-section"
                className="min-h-[560px] bg-white border-b border-gray-100"
                aria-hidden="true"
              />
            }
          >
            <HowItWorksSection onNavigate={onNavigate} />
          </React.Suspense>

          {/* Services Overview & 4 Pillars */}
          <section
            className="py-8 sm:py-16 md:py-24 bg-white border-b border-gray-100 px-3.5 sm:px-6 lg:px-8"
            id="four-pillars-section"
          >
            <div className="w-full max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-14">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-orange-50/90 border border-orange-200/80 text-orange-700 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-5 shadow-xs select-none">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-650" />
                  <span>Double-Vetted Native Syllabus Support</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-gray-950 uppercase leading-snug font-heading">
                  OUR 4 PILLARS OF <span className="text-orange-650 not-italic block sm:inline">ACADEMIC TUTORING</span>
                </h2>

                <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed px-1">
                  Tap any core category to inspect matched regional curriculums, try interactive outline tools, and communicate with verified country specialists.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 text-left">
                {/* Card 1: 1-on-1 Live Tutoring */}
                <a
                  id="pillar-card-0"
                  href="/services/1-on-1-live-tutoring"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-1on1');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Whiteboard &amp; Video
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center">
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="tutor-skin" cx="45%" cy="40%" r="55%">
                                <stop offset="0%" stopColor="#fed7aa" />
                                <stop offset="75%" stopColor="#fdba74" />
                                <stop offset="100%" stopColor="#fb923c" />
                              </radialGradient>
                              <linearGradient id="tutor-hair" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#7c2d12" />
                                <stop offset="100%" stopColor="#431407" />
                              </linearGradient>
                              <linearGradient id="tutor-clothes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb923c" />
                                <stop offset="100%" stopColor="#c2410c" />
                              </linearGradient>
                              <linearGradient id="headset-grad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="42" ry="7" fill="#ea580c" fillOpacity="0.2" />
                            <circle cx="100" cy="85" r="42" fill="url(#tutor-hair)" />
                            <path d="M60 90 C 58 135, 70 148, 76 154 L 124 154 C 130 148, 142 135, 140 90 Z" fill="url(#tutor-hair)" />
                            <path d="M64 156 C64 135 80 130 100 130 C120 130 136 135 136 156 L144 182 C144 186 140 190 135 190 L65 190 C60 190 56 186 56 182 Z" fill="url(#tutor-clothes)" />
                            <polygon points="100,146 84,131 93,130 100,140 107,130 116,131" fill="#fff7ed" />
                            <rect x="91" y="118" width="18" height="18" rx="7" fill="url(#tutor-skin)" />
                            <ellipse cx="100" cy="88" rx="30" ry="33" fill="url(#tutor-skin)" />
                            <path d="M72 74 C 82 58, 120 56, 128 72 C 120 66, 92 68, 72 74 Z" fill="#9a3412" />
                            <ellipse cx="89" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                            <ellipse cx="111" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                            <circle cx="90.5" cy="82.5" r="1.6" fill="#ffffff" />
                            <circle cx="112.5" cy="82.5" r="1.6" fill="#ffffff" />
                            <circle cx="81" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                            <circle cx="119" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                            <path d="M88 97 Q100 113 112 97 Z" fill="#991b1b" />
                            <path d="M89 97 Q100 103 111 97" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <path d="M68 85 A 34 34 0 0 1 132 85" stroke="url(#headset-grad)" strokeWidth="4.5" strokeLinecap="round" />
                            <rect x="65" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                            <rect x="127" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                            <path d="M70 90 Q 72 108 86 107" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="86" cy="107" r="3" fill="#ea580c" />
                            <circle cx="138" cy="52" r="9" fill="#10b981" />
                            <polygon points="135,48 143,52 135,56" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          1-on-1 Live Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Interact with native instructors on high-speed webcams and digital whiteboard systems.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Recording &amp; stream included</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 2: Assignment Tutoring */}
                <a
                  id="pillar-card-1"
                  href="/services/assignment-guidance"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-assignment');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Structural Reviews
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-1s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="student-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#ffedd5" />
                                <stop offset="70%" stopColor="#fed7aa" />
                                <stop offset="100%" stopColor="#fb923c" />
                              </radialGradient>
                              <linearGradient id="student-hoodie" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ea580c" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#ea580c" fillOpacity="0.2" />
                            <path d="M60 156 C60 134 76 128 100 128 C124 128 140 134 140 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#student-hoodie)" />
                            <rect x="91" y="116" width="18" height="18" rx="6" fill="url(#student-skin)" />
                            <path d="M92 136 L92 154 M108 136 L108 154" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                            <ellipse cx="100" cy="85" rx="30" ry="32" fill="url(#student-skin)" />
                            <path d="M68 76 C65 65 72 52 86 52 C90 52 95 54 99 56 C105 52 115 50 124 56 C134 62 134 75 131 82 Z" fill="#292524" />
                            <path d="M85 82 Q90 76 95 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <path d="M105 82 Q110 76 115 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <ellipse cx="80" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                            <ellipse cx="120" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                            <path d="M87 91 Q100 110 113 91 Z" fill="#881337" />
                            <path d="M89 91 Q100 97 111 91" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <polygon points="100,32 132,44 100,54 68,44" fill="#0f172a" />
                            <polygon points="100,54 132,44 132,48 100,58" fill="#1e293b" />
                            <circle cx="100" cy="43" r="2.5" fill="#f59e0b" />
                            <path d="M100 43 Q 120 46 122 58" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <g transform="translate(120, 115) rotate(12)">
                              <rect x="0" y="0" width="30" height="40" rx="3" fill="#ffffff" stroke="#fed7aa" strokeWidth="1.5" />
                              <line x1="6" y1="8" x2="24" y2="8" stroke="#f97316" strokeWidth="2" />
                              <line x1="6" y1="14" x2="20" y2="14" stroke="#cbd5e1" strokeWidth="1.5" />
                              <line x1="6" y1="19" x2="22" y2="19" stroke="#cbd5e1" strokeWidth="1.5" />
                              <text x="7" y="32" fontSize="12" fontWeight="900" fill="#dc2626" fontFamily="sans-serif">
                                A+
                              </text>
                              <circle cx="2" cy="24" r="4.5" fill="url(#student-skin)" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Assignment Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Step-by-step drafting structures, proper citation style reviews (APA/MLA/Harvard), and customized formula guides.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">APA/MLA grading check</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 3: Coursework Tutoring */}
                <a
                  id="pillar-card-2"
                  href="/services/coursework-track"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-coursework');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Syllabus Alignment
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-2s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="prof-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#ffedd5" />
                                <stop offset="75%" stopColor="#fdba74" />
                                <stop offset="100%" stopColor="#f97316" />
                              </radialGradient>
                              <linearGradient id="prof-suit" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#0284c7" fillOpacity="0.2" />
                            <path d="M58 158 C58 136 74 130 100 130 C126 130 142 136 142 158 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#prof-suit)" />
                            <polygon points="100,150 90,130 110,130" fill="#ffffff" />
                            <polygon points="100,135 103,158 100,166 97,158" fill="#ea580c" />
                            <rect x="91" y="118" width="18" height="18" rx="6" fill="url(#prof-skin)" />
                            <path d="M68 84 C66 60 76 46 100 46 C122 46 132 58 132 80 C125 70 110 65 96 66 C82 67 74 74 68 84 Z" fill="#334155" />
                            <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#prof-skin)" />
                            <circle cx="88" cy="85" r="4.5" fill="#0f172a" />
                            <circle cx="112" cy="85" r="4.5" fill="#0f172a" />
                            <circle cx="89.5" cy="83.5" r="1.5" fill="#ffffff" />
                            <circle cx="113.5" cy="83.5" r="1.5" fill="#ffffff" />
                            <path d="M88 98 Q100 114 112 98" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <g transform="translate(116, 122) rotate(-8)">
                              <rect x="0" y="0" width="34" height="46" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                              <rect x="3" y="4" width="28" height="38" rx="3" fill="#f8fafc" />
                              <circle cx="9" cy="12" r="2.5" fill="#10b981" />
                              <line x1="14" y1="12" x2="25" y2="12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="9" cy="20" r="2.5" fill="#10b981" />
                              <line x1="14" y1="20" x2="24" y2="20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="9" cy="28" r="2.5" fill="#f59e0b" />
                              <line x1="14" y1="28" x2="20" y2="28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="2" cy="26" r="4.5" fill="url(#prof-skin)" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Coursework Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Comprehensive ongoing syllabus track mentoring. Monitor interactive weekly targets to secure peak score outcomes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Weekly progress reports</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 4: Academic Writing Coach */}
                <a
                  id="pillar-card-3"
                  href="/services/essay-reference-checks"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-essay');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Thesis &amp; Citations
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-3s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="coach-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#fde68a" />
                                <stop offset="70%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#f59e0b" />
                              </radialGradient>
                              <linearGradient id="coach-sweater" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#047857" />
                              </linearGradient>
                              <linearGradient id="gold-pen" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#a16207" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#047857" fillOpacity="0.2" />
                            <circle cx="100" cy="46" r="16" fill="#1c1917" />
                            <path d="M66 85 C64 62 76 52 100 52 C124 52 134 62 134 85 C124 76 112 72 100 72 C88 72 76 76 66 85 Z" fill="#1c1917" />
                            <path d="M58 156 C58 134 74 128 100 128 C126 128 142 134 142 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#coach-sweater)" />
                            <ellipse cx="100" cy="132" rx="18" ry="8" fill="#10b981" />
                            <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#coach-skin)" />
                            <circle cx="87" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                            <circle cx="113" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                            <line x1="98" y1="86" x2="102" y2="86" stroke="#ea580c" strokeWidth="2.5" />
                            <circle cx="87" cy="86" r="3.5" fill="#1c1917" />
                            <circle cx="113" cy="86" r="3.5" fill="#1c1917" />
                            <circle cx="88.5" cy="84.5" r="1.2" fill="#ffffff" />
                            <circle cx="114.5" cy="84.5" r="1.2" fill="#ffffff" />
                            <path d="M89 101 Q100 114 111 101 Z" fill="#991b1b" />
                            <path d="M91 101 Q100 105 109 101" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <g transform="translate(126, 80) rotate(-22)">
                              <path d="M12 0 C 14 18, 8 38, 2 56 L 6 58 C 14 38, 24 18, 12 0 Z" fill="url(#gold-pen)" />
                              <polygon points="2,56 4,68 6,58" fill="#ffffff" />
                              <line x1="4" y1="58" x2="4" y2="65" stroke="#713f12" strokeWidth="0.8" />
                              <circle cx="4" cy="69" r="1.5" fill="#fde047" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Academic Writing Coach
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Outline compelling thesis claims, map critical arguments, proofread sentence syntax, and correct grammar layouts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Co-author editing template</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Academic Excellence | Premium Services Showcase */}
          <section className="bg-[#fcfcfc] text-[#0a0a0a] antialiased py-10 md:py-24 border-b border-gray-100" id="premium-services-showcase">
            {!isMdUp ? (
              <>
                <header className="px-4 pt-2 pb-5">
                  <div className="inline-flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-700 font-sans">
                      ACADEMIC PILLARS
                    </span>
                    <span className="w-6 h-[2px] bg-orange-650 rounded-full"></span>
                  </div>
                  <h2 className="font-extrabold text-[26px] leading-[1.2] text-slate-900 mb-2.5 tracking-tight font-sans">
                    Precision Mentorship for Academic Excellence
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                    Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
                  </p>
                </header>

                <div className="px-4 space-y-4">
                  {/* CARD 1 */}
                  <article id="pillar-1" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <img
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=160&q=40&fm=avif"
                          alt="1-1 Academic Tutoring"
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            ACADEMIC MENTORSHIP
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          1. Personalized 1-1 Tutoring Services
                        </h3>
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      In today's competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual's unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/1-on-1-live-tutoring"
                        aria-label="Explore 1-on-1 Live Tutoring Service Page"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-1on1');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('1. Personalized 1-1 Tutoring Services')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book 1-1 Tutoring</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 2 */}
                  <article id="pillar-2" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            LOGIC &amp; REASONING
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          2. Professional Assignment Tutoring &amp; Guidance
                        </h3>
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=240&q=75"
                          alt="Assignment Guidance and Books"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Assgn"
                        />
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/assignment-guidance"
                        aria-label="Explore Assignment Guidance Service Page"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-assignment');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('2. Professional Assignment Tutoring & Guidance')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Assignment Help</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 3 */}
                  <article id="pillar-3" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=240&q=75"
                          alt="Coursework writing & research"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Course"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            MILESTONE MANAGEMENT
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          3. Comprehensive Coursework Tutoring
                        </h3>
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/coursework-track"
                        aria-label="Explore Coursework Track Service Page"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-coursework');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('3. Comprehensive Coursework Tutoring')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Coursework Guidance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 4 */}
                  <article id="pillar-4" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            QUALITY ASSURANCE
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          4. Expert Academic Writing Consultation
                        </h3>
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=240&q=75"
                          alt="Scholarly Writing with Fountain Pen"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Writing"
                        />
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don't just secure academic clarity—they build essential skills that prepare them for future career success.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/essay-reference-checks"
                        aria-label="Explore Essay and Reference Checks Service Page"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-essay');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('4. Expert Academic Writing Consultation')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Writing Consultation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                </div>
              </>
            ) : (
              <>
                <div className="max-w-4xl mx-auto text-center px-6 mb-16 md:mb-24">
                  <div className="inline-flex items-center gap-2.5 mb-4 justify-center">
                    <span className="text-orange-650 text-xs font-black tracking-[0.3em] uppercase">Academic Pillars</span>
                    <span className="w-8 h-[1.5px] bg-orange-650"></span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 font-sans mb-6 leading-tight">
                    Precision Mentorship for Academic Excellence
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                    Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
                  </p>
                </div>

                <div className="max-w-6xl mx-auto px-6 space-y-16">
                  {/* 01 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=640&q=76"
                        alt="Personalized 1-1 Academic Tutoring & Mentorship"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 900]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=1-1+Tutoring"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Academic Mentorship</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        1. Personalized 1-1 Tutoring Services
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        In today’s competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual's unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/1-on-1-live-tutoring"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-1on1');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore 1-on-1 Tutoring Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('1. Personalized 1-1 Tutoring Services')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book 1-1 Tutoring Session</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 02 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Logic &amp; Reasoning</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        2. Professional Assignment Tutoring &amp; Guidance
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/assignment-guidance"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-assignment');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Assignment Guidance Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('2. Professional Assignment Tutoring & Guidance')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Assignment Guidance</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=76"
                        alt="Professional Academic Assignment Desk"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 800]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Assignment+Help"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>

                  {/* 03 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=76"
                        alt="Comprehensive Coursework Tutoring Desk"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 900]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Coursework+Tutoring"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Milestone Management</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        3. Comprehensive Coursework Tutoring
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/coursework-track"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-coursework');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Coursework Track Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('3. Comprehensive Coursework Tutoring')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Coursework Guidance</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 04 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Quality Assurance</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        4. Expert Academic Writing Consultation
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don't just secure academic clarity—they build essential skills that prepare them for future career success.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/essay-reference-checks"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-essay');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Essay &amp; Citations Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('4. Expert Academic Writing Consultation')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Writing Consultation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=76"
                        alt="Academic Content Writing"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 800]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Writing+Support"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Pillar Booking Bottom Sheet Modal */}
            {pillarBookingService && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity"
                onClick={() => setPillarBookingService(null)}
              >
                <div
                  className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 block">
                        INSTANT RESERVATION
                      </span>
                      <h2 className="font-extrabold text-base text-slate-900">Get Matched with a Mentor</h2>
                    </div>
                    <button
                      onClick={() => setPillarBookingService(null)}
                      aria-label="Close booking dialog"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onRaisedConsult(
                        `Pillar Consultation: ${pillarBookingService} | Student: ${
                          pillarBookingName || 'Inquirer'
                        } (${pillarBookingLevel || 'Unspecified'}) | Notes: ${pillarBookingNote || 'None'}`
                      );
                      setPillarBookingToast(true);
                      setPillarBookingService(null);
                      setTimeout(() => setPillarBookingToast(false), 4000);
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label htmlFor="pillar-selected-input" className="block font-semibold text-slate-700 mb-1">Selected Pillar</label>
                      <input
                        id="pillar-selected-input"
                        type="text"
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg font-medium text-slate-700"
                        value={pillarBookingService}
                      />
                    </div>

                    <div>
                      <label htmlFor="pillar-student-name" className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        id="pillar-student-name"
                        required
                        type="text"
                        value={pillarBookingName}
                        onChange={(e) => setPillarBookingName(e.target.value)}
                        placeholder="e.g. Alex Henderson"
                        className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="pillar-student-level" className="block font-semibold text-slate-700 mb-1">University / Academic Level</label>
                      <input
                        id="pillar-student-level"
                        required
                        type="text"
                        value={pillarBookingLevel}
                        onChange={(e) => setPillarBookingLevel(e.target.value)}
                        placeholder="e.g. Undergraduate Year 2"
                        className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="pillar-student-note" className="block font-semibold text-slate-700 mb-1">Brief Note / Deadline</label>
                      <textarea
                        id="pillar-student-note"
                        rows={2}
                        value={pillarBookingNote}
                        onChange={(e) => setPillarBookingNote(e.target.value)}
                        placeholder="Tell us about your upcoming project or goals..."
                        className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:outline-orange-500"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 min-h-[44px] bg-orange-650 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-650/20 active:scale-[0.99] transition mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Request Callback</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPillarBookingService(null);
                          onNavigate('get-a-quote');
                        }}
                        className="text-[11px] text-slate-600 hover:text-orange-700 underline font-medium min-h-[44px] cursor-pointer"
                      >
                        Or get a detailed price quotation →
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Success Notification Toast */}
            {pillarBookingToast && (
              <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white p-3.5 rounded-xl shadow-xl flex items-center gap-3 transition">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="block font-bold">Request Received</strong>
                  <span className="text-slate-300">An academic advisor will contact you shortly.</span>
                </div>
              </div>
            )}
          </section>

          {/* Below-the-fold sections lazy-loaded on viewport proximity */}
          <div ref={belowFoldSentinelRef}>
            {shouldLoadBelowFold ? (
              <React.Suspense
                fallback={
                  <div className="min-h-[1200px] bg-amber-50/20 border-b border-gray-100" aria-hidden="true" />
                }
              >
                <HomeBelowFoldSections
                  isMdUp={isMdUp}
                  onNavigate={onNavigate}
                  onRaisedConsult={onRaisedConsult}
                />
              </React.Suspense>
            ) : (
              <div className="min-h-[1200px] bg-amber-50/20 border-b border-gray-100" aria-hidden="true" />
            )}
          </div>
        </div>
      )}

      {/* ==================== NON-HOME MARKETING SUBPAGES (LAZY CHUNK) ==================== */}
      {activeView !== 'home' && (
        <React.Suspense
          fallback={
            <div className="py-24 flex justify-center items-center text-orange-650">
              <span className="w-8 h-8 border-2 border-orange-650 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <MarketingSubpages
            activeView={activeView}
            tutors={tutors}
            blogs={blogs}
            faqs={faqs}
            onNavigate={onNavigate}
            onTutorSelect={onTutorSelect}
            onRaisedConsult={onRaisedConsult}
          />
        </React.Suspense>
      )}

    </div>
  );
}

export default React.memo(MarketingPages);
