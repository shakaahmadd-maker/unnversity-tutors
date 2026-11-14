import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { User, Blog, FAQ } from '../types';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import { ResponsiveAvatar, ResponsivePicture } from './ResponsiveImage';

const HowItWorksSection = React.lazy(() => import('./HowItWorksSection'));
const HomeFourPillarsCards = React.lazy(() => import('./HomeFourPillarsCards'));
const HomePillarsMobileShowcase = React.lazy(() => import('./HomePillarsMobileShowcase'));
const HomePillarsDesktopShowcase = React.lazy(() => import('./HomePillarsDesktopShowcase'));
const PillarBookingModal = React.lazy(() => import('./PillarBookingModal'));
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

  const [pillarBookingService, setPillarBookingService] = useState<string | null>(null);
  const [pillarBookingToast, setPillarBookingToast] = useState<boolean>(false);

  // Viewport-gated mount for below-the-fold pillars & lower homepage sections
  const pillarsSentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadPillars, setShouldLoadPillars] = useState(false);

  const belowFoldSentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadBelowFold, setShouldLoadBelowFold] = useState(false);

  useEffect(() => {
    if (activeView !== 'home' || shouldLoadPillars) return;
    const node = pillarsSentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setShouldLoadPillars(true), 1800);
      return () => window.clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadPillars(true);
          observer.disconnect();
        }
      },
      { rootMargin: '750px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeView, shouldLoadPillars]);

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

  const handleOpenBooking = useCallback((service: string) => {
    setPillarBookingService(service);
  }, []);

  const handleSubmitPillarConsult = useCallback(
    (msg: string) => {
      onRaisedConsult(msg);
      setPillarBookingToast(true);
      setPillarBookingService(null);
      window.setTimeout(() => setPillarBookingToast(false), 4000);
    },
    [onRaisedConsult]
  );

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
                  Trusted by high-achieving students from the world&apos;s leading universities
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

          {/* Below-the-fold Pillars & Showcases (Viewport-gated lazy chunks) */}
          <div ref={pillarsSentinelRef}>
            {shouldLoadPillars ? (
              <>
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

                <React.Suspense
                  fallback={
                    <section
                      id="four-pillars-section"
                      className="min-h-[540px] bg-white border-b border-gray-100"
                      aria-hidden="true"
                    />
                  }
                >
                  <HomeFourPillarsCards onNavigate={onNavigate} />
                </React.Suspense>
              </>
            ) : (
              <>
                <section
                  id="how-it-works-section"
                  className="min-h-[560px] bg-white border-b border-gray-100"
                  aria-hidden="true"
                />
                <section
                  id="four-pillars-section"
                  className="min-h-[540px] bg-white border-b border-gray-100"
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          {/* Academic Excellence | Premium Services Showcase (Active viewport variant only) */}
          <section
            className="bg-[#fcfcfc] text-[#0a0a0a] antialiased py-10 md:py-24 border-b border-gray-100"
            id="premium-services-showcase"
          >
            <React.Suspense
              fallback={<div className="min-h-[760px]" aria-hidden="true" />}
            >
              {!isMdUp ? (
                <HomePillarsMobileShowcase
                  onNavigate={onNavigate}
                  onOpenBooking={handleOpenBooking}
                />
              ) : (
                <HomePillarsDesktopShowcase
                  onNavigate={onNavigate}
                  onOpenBooking={handleOpenBooking}
                />
              )}
            </React.Suspense>

            {pillarBookingService && (
              <React.Suspense fallback={null}>
                <PillarBookingModal
                  service={pillarBookingService}
                  onClose={() => setPillarBookingService(null)}
                  onSubmitConsult={handleSubmitPillarConsult}
                  onNavigate={onNavigate}
                />
              </React.Suspense>
            )}

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
