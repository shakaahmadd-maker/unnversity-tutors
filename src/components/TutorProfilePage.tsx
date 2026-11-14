import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  Clock, 
  Smile, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  MapPin, 
  ShieldCheck,
  Send,
  Tag,
  Search,
  Sparkles,
  Award,
  Compass,
  Heart,
  Share2,
  Video,
  Receipt,
  MessageCircle
} from 'lucide-react';
import { User } from '../types';
import { getRelevantKeywordsForTutor } from '../data/subjectKeywordsData';
import { getFallbackAvatar } from './TutorsDirectoryPage';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';
import { ResponsiveAvatar } from './ResponsiveImage';

interface TutorProfilePageProps {
  tutor: User;
  onNavigate: (view: string) => void;
  onOpenChat?: (tutorId: string) => void;
  onBookSession?: (tutor: User) => void;
  onSearchKeyword?: (keyword: string) => void;
}

export default function TutorProfilePage({
  tutor,
  onNavigate,
  onOpenChat,
  onBookSession,
  onSearchKeyword
}: TutorProfilePageProps) {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const parseSubjectList = (raw: unknown, primarySub?: string): string[] => {
    const out: string[] = [];
    const append = (val: unknown) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((v) => {
          if (typeof v === 'string' && v.trim()) out.push(v.trim());
        });
        return;
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              parsed.forEach((v) => {
                if (typeof v === 'string' && v.trim()) out.push(v.trim());
              });
              return;
            }
          } catch {
            // Fall back to comma split
          }
        }
        trimmed.split(',').forEach((s) => {
          const clean = s.replace(/^[\["']+|[\]"']+$/g, '').trim();
          if (clean) out.push(clean);
        });
      }
    };
    if (primarySub && primarySub.trim()) out.push(primarySub.trim());
    append(tutor.subjectExpertise);
    append(tutor.subjects);
    const seen = new Set<string>();
    return out.filter((item) => {
      const k = item.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const parsedSubjects = parseSubjectList(tutor.subjectExpertise || tutor.subjects, tutor.primarySubject);
  const subjects: string[] =
    parsedSubjects.length > 0
      ? parsedSubjects
      : ['Math', 'Algebra', 'Calculus', 'Biology', 'Chemistry', 'SAT Prep', 'Essay Writing'];

  const avatarSrc = tutor.avatarUrl || (tutor as any).profileImageUrl;
  const locationDisplay = tutor.location || (tutor as any).cityLocation || tutor.city || 'Miami, FL';
  const reviewTotal = tutor.reviewCount ?? (tutor as any).reviewsCount ?? 120;
  const experienceDisplay =
    tutor.experience ||
    tutor.experienceSummary ||
    tutor.experiences ||
    tutor.bio ||
    "A patient tutor, I will repeat myself to students multiple times. There are no stupid questions; the only time it's unreasonable to ask a question is if you already know the answer. A believer in interactive learning, I'll walk through anything pertaining to the subject matter...";
  const availabilityDisplay =
    tutor.availability || tutor.availabilities || 'Weekdays at any time, Weekends at any time';

  const visibleSubjects = showAllSubjects ? subjects : subjects.slice(0, 10);

  // Compute relevant keywords for this specific tutor's subject domain
  const relevantKw = getRelevantKeywordsForTutor(
    subjects,
    tutor.education,
    tutor.primaryDomain || tutor.primarySubject
  );

  const highSearchKws = tutor.specializedKeywords && tutor.specializedKeywords.length > 0 
    ? tutor.specializedKeywords 
    : relevantKw.highSearchKeywords;

  const researchKws = tutor.researchKeywords && tutor.researchKeywords.length > 0
    ? tutor.researchKeywords
    : relevantKw.researchKeywords;

  const jobKws = tutor.jobKeywords && tutor.jobKeywords.length > 0
    ? tutor.jobKeywords
    : relevantKw.jobKeywords;

  const combinedKws = tutor.highGrowthKeywords && tutor.highGrowthKeywords.length > 0
    ? tutor.highGrowthKeywords
    : relevantKw.combinedKeywords;

  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg((current) => (current === message ? null : current));
    }, 2800);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      showToast(`Saved ${tutor.name} to your favorites!`);
    } else {
      showToast('Removed from favorites');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${tutor.name} - University Tutor`,
        text: `Book a session with ${tutor.name} on University Tutors!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      showToast('Profile link copied to clipboard!');
    }
  };

  const handleKeywordClick = (kw: string) => {
    if (onSearchKeyword) {
      onSearchKeyword(kw);
    } else {
      onNavigate('tutors-directory');
    }
  };

  return (
    <>
      {/* ================= MOBILE VIEW (Exact App Design as per User Code) ================= */}
      <div className="block md:hidden bg-[#f3f6f9] text-slate-800 font-sans antialiased min-h-screen flex flex-col relative">
        
        {/* Top Mobile App Header / Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between transition-all">
          <button 
            onClick={() => onNavigate('tutors-directory')} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer" 
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center min-w-0 px-2">
            <h1 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Tutor Profile</h1>
            <p className="text-sm font-bold text-slate-800 truncate">{tutor.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleFavorite} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer" 
              aria-label="Bookmark Profile"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600'}`} />
            </button>
            <button 
              onClick={handleShare} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer" 
              aria-label="Share Profile"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-32 space-y-3.5">
          
          {/* Primary Profile Identity Card */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 relative">
            <div className="flex items-start gap-3.5">
              {/* Profile Avatar with Online Status Indicator */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner ring-2 ring-slate-100 bg-slate-200">
                  <ResponsiveAvatar
                    src={avatarSrc}
                    alt={tutor.name}
                    sizePx={80}
                    loading="eager"
                    fallbackSrc={getFallbackAvatar(tutor.name)}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Online status green pulse dot */}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              {/* Main Header Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold font-serif text-slate-900 leading-snug tracking-tight">
                  {tutor.name}
                </h2>

                {/* Verification Tag - Clean "Verified" badge for all tutors on mobile */}
                <div 
                  title="Verified Degree & Background"
                  className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified</span>
                </div>

                {/* Location */}
                <div className="mt-1.5 flex items-center text-xs font-medium text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1.5 shrink-0" />
                  <span className="truncate">Private tutor in {locationDisplay}</span>
                </div>
              </div>
            </div>

            {/* Rating & Pricing Row */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
              {/* Rating badge */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="ml-1 text-sm font-bold text-slate-900">{tutor.rating || '5.0'}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">({reviewTotal} reviews)</span>
              </div>

              {/* Hourly Rate */}
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">${tutor.hourlyRate || 166}</span>
                <span className="text-xs font-medium text-slate-500">/hr</span>
              </div>
            </div>
          </section>

          {/* Key Logistics Grid (Quick View: Availability, Meeting Mode, Hobbies) */}
          <section className="grid grid-cols-1 gap-2.5">
            {/* Availability */}
            <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Availability</div>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">
                  {availabilityDisplay} <span className="text-blue-600 font-medium">(EST, GMT, GST, AEST)</span>
                </p>
              </div>
            </div>

            {/* Can Meet */}
            <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Video className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Can Meet</div>
                <p className="text-xs font-medium text-slate-800 mt-0.5 leading-relaxed">
                  {tutor.canMeet || 'Virtual Online 1-on-1 worldwide interactive platform'}
                </p>
              </div>
            </div>

            {/* Hobbies */}
            <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Smile className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hobbies &amp; Interests</div>
                <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">
                  {tutor.hobbies || 'Capture-The-Flag (CTF) competitions, reverse engineering, hardware security'}
                </p>
              </div>
            </div>
          </section>

          {/* Education Section Card */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <h3>Education</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs font-medium text-slate-700 leading-relaxed">
              {tutor.education || 'Caltech — Ph.D. / D.Sc. in Cybersecurity & Senior Faculty Fellowship'}
            </div>
          </section>

          {/* Experience Section Card */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <h3>Experience</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
              {experienceDisplay}
            </div>
          </section>

          {/* Subject Expertise Badges */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <h3>Subject Expertise</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{subjects.length} Topics</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {subjects.slice(0, 8).map((subject, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-blue-50/90 text-blue-700 text-xs font-semibold border border-blue-200/70"
                >
                  {subject}
                </span>
              ))}
            </div>
          </section>

          {/* 100% Satisfaction Guarantee Box */}
          <section className="bg-gradient-to-br from-amber-50/90 to-orange-50/70 rounded-2xl p-4 border border-amber-200/80 shadow-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                100% Satisfaction Guarantee
              </h4>
              <p className="text-[11px] font-medium text-amber-900/90 leading-relaxed">
                Book with complete peace of mind. Payment is held securely in escrow until tutor sessions are completed.
              </p>
            </div>
          </section>

          {/* Quick Message Action (Alternative touchpoint) */}
          <div className="text-center pt-1 pb-2">
            <button 
              onClick={() => {
                if (onOpenChat) onOpenChat(tutor.id);
              }} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-200/60 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Have questions? Chat with {tutor.name.split(' ')[0] || 'Tutor'} first</span>
            </button>
          </div>

          {/* Relevant Subject & Industry Keywords Card (Mobile View - Compact Sizing) */}
          <section className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-150 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 text-orange-600 p-1 rounded-lg">
                  <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1f3a60] leading-tight">
                    Searchable Domain &amp; Subject Keywords
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Mapped to {relevantKw.primaryDomain}
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                <span>Searchable</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 1. High-Search Subject Terms */}
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3 text-blue-600" />
                    <span>High-Search Subject Terms</span>
                  </span>
                  <span className="text-[9px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-semibold">
                    {highSearchKws.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(showAllKeywords ? highSearchKws : highSearchKws.slice(0, 8)).map((kw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleKeywordClick(kw)}
                      className="compact-inline-link text-[10px] bg-white hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 font-medium px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{kw}</span>
                      <span className="text-[9px] text-slate-400">↗</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Research & Academic Focus Keywords */}
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-600" />
                    <span>Research &amp; Methodologies</span>
                  </span>
                  <span className="text-[9px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-semibold">
                    {researchKws.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {researchKws.slice(0, 8).map((kw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleKeywordClick(kw)}
                      className="compact-inline-link text-[10px] bg-emerald-50/60 hover:bg-emerald-600 hover:text-white text-emerald-900 border border-emerald-200/80 font-medium px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{kw}</span>
                      <span className="text-[9px] text-emerald-600">↗</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Job Search & Industry Target Keywords */}
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-indigo-600" />
                    <span>Target Careers &amp; Roles</span>
                  </span>
                  <span className="text-[9px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-semibold">
                    {jobKws.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {jobKws.slice(0, 8).map((kw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleKeywordClick(kw)}
                      className="compact-inline-link text-[10px] bg-indigo-50/60 hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200/80 font-medium px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{kw}</span>
                      <span className="text-[9px] text-indigo-500">↗</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. High-Growth & Interdisciplinary Combinations */}
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>High-Growth Topics</span>
                  </span>
                  <span className="text-[9px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-semibold">
                    USA / Canada
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {combinedKws.slice(0, 8).map((kw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleKeywordClick(kw)}
                      className="compact-inline-link text-[10px] bg-amber-50/70 hover:bg-amber-600 hover:text-white text-amber-950 border border-amber-200/80 font-medium px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{kw}</span>
                      <span className="text-[9px] text-amber-600">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {highSearchKws.length > 8 && (
              <div className="pt-0.5 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllKeywords(!showAllKeywords)}
                  className="compact-inline-link text-[10.5px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-200 cursor-pointer transition-all"
                >
                  {showAllKeywords ? '▲ Show Fewer Keywords' : `▼ View All ${highSearchKws.length} Search Keywords`}
                </button>
              </div>
            )}
          </section>

          {/* SEO Keyword Links Block for Nearby Locations & Subjects (Mobile Compact) */}
          <div>
            <SEOKeywordLinksBlock
              locationName={locationDisplay}
              tutorName={tutor.name}
              primarySubject={tutor.primarySubject || subjects[0]}
              tutorSubjects={subjects}
              tutorEducation={tutor.education}
              primaryDomain={relevantKw.primaryDomain}
              onNavigateLocation={(loc) => onNavigate(`location:${loc}`)}
              onNavigateSubject={(subj) => onNavigate(`subject:${subj}`)}
              className="rounded-2xl border border-slate-200/80 shadow-xs"
            />
          </div>

        </main>

        {/* Sticky Bottom CTA Bar */}
        <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5">
            {/* Secondary Action: Custom Price Quote */}
            <button 
              onClick={() => onNavigate('get-a-quote')}
              className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 active:scale-95 transition shadow-sm group cursor-pointer"
              title="Get Custom Price Quote"
              aria-label="Get Custom Price Quote"
            >
              <Receipt className="w-5 h-5 group-hover:scale-110 transition-transform text-orange-400" />
            </button>

            {/* Primary Action: Let's Begin (Request Session) */}
            <button 
              onClick={() => {
                if (onOpenChat) onOpenChat(tutor.id);
                else if (onBookSession) onBookSession(tutor);
                else onNavigate('get-a-quote');
              }}
              className="flex-1 h-12 rounded-xl bg-[#eb5310] hover:bg-[#d44709] active:scale-[0.98] transition font-bold text-white text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(235,83,16,0.28)] tracking-wide cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Let's Begin (Request Session)</span>
            </button>
          </div>
        </footer>

        {/* Interactive Feedback Toast */}
        {toastMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:block bg-[#f2f4f7] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
        <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('tutors-directory')}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tutors</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            <span>Home</span> / <span className="text-blue-600 font-semibold">{locationDisplay} Tutors</span> / <span className="font-bold text-slate-800">{tutor.name}</span>
          </div>
        </div>

        {/* Main Profile Card (Matching Screenshot 2) */}
        <div className="bg-[#ecefe6]/40 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Main Profile Details (2 Cols on Desktop) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <ResponsiveAvatar
                  src={avatarSrc}
                  alt={tutor.name}
                  sizePx={112}
                  loading="eager"
                  fallbackSrc={getFallbackAvatar(tutor.name)}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-slate-300 shadow-md shrink-0"
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1f3a60]">
                      {tutor.name}
                    </h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Degree & Background
                    </span>
                  </div>

                  <p className="text-sm font-medium italic text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Private tutor in {locationDisplay}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{tutor.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({reviewTotal} reviews)</span>
                    </div>

                    <span className="font-extrabold text-blue-900 text-sm">
                      ${tutor.hourlyRate || 45}/hr
                    </span>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-800" />
                  <span>Education</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-3.5 rounded-2xl border border-slate-200/60 text-justify">
                  {tutor.education || 'University of Miami - B.S, Biomedical Engineering'}
                </p>
              </div>

              {/* Experience Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-800" />
                  <span>Experience</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-4 rounded-2xl border border-slate-200/60 whitespace-pre-line text-justify">
                  {experienceDisplay}
                </p>
              </div>

              {/* Subject Expertise Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-800" />
                  <span>Subject Expertise</span>
                </h3>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {visibleSubjects.map((subject, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-blue-50/90 text-blue-800 border border-blue-200/80 font-medium px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                {subjects.length > 10 && (
                  <button
                    onClick={() => setShowAllSubjects(!showAllSubjects)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 mt-2 block cursor-pointer underline"
                  >
                    {showAllSubjects ? 'Show Less' : 'Show More...'}
                  </button>
                )}
              </div>

            </div>

            {/* Right Sidebar: Availability, Can Meet, Hobbies & Call to Action */}
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
              
              <div className="space-y-4">
                {/* Availability */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>Availability</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {availabilityDisplay}
                  </p>
                </div>

                {/* Can Meet */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>Can Meet</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {tutor.canMeet || '20 miles at my regular hourly rate & Online'}
                  </p>
                </div>

                {/* Hobbies */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-blue-700" />
                    <span>Hobbies</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {tutor.hobbies || 'I enjoy reading, singing, and watching sports.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons (Orange CTA matching screenshots) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => {
                    if (onOpenChat) onOpenChat(tutor.id);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Let's Begin (Request Session)</span>
                </button>

                <button
                  onClick={() => onNavigate('get-a-quote')}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                  <span>Get Custom Price Quote</span>
                </button>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-[11px] text-orange-900 leading-snug space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                  100% Satisfaction Guarantee
                </span>
                <p>Book with complete peace of mind. Payment is held securely in escrow until tutor sessions are completed.</p>
              </div>

            </div>

          </div>
        </div>

        {/* Relevant Subject & Industry Keywords Card (Domain-Specific for this Tutor) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                  <Tag className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#1f3a60]">
                  Relevant Subject, Research &amp; Industry Keywords
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Showing specialized search terms &amp; focus areas mapped to {tutor.name}'s expertise in <span className="font-bold text-slate-700">{relevantKw.primaryDomain}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Searchable Keywords</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* 1. High-Search Subject Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-700" />
                  <span>High-Search Subject Terms</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {highSearchKws.length} Keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(showAllKeywords ? highSearchKws : highSearchKws.slice(0, 12)).map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search all tutors for ${kw}`}
                    className="compact-inline-link text-xs bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Research & Academic Focus Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Research &amp; Methodologies</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {researchKws.length} Topics
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {researchKws.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search all tutors for ${kw}`}
                    className="compact-inline-link text-xs bg-emerald-50/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-900 border border-emerald-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-emerald-600 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Job Search & Industry Target Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Target Careers &amp; Industry Roles</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {jobKws.length} Job Roles
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobKws.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search tutors with career prep in ${kw}`}
                    className="compact-inline-link text-xs bg-indigo-50/60 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-900 border border-indigo-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-indigo-500 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. High-Growth & Interdisciplinary Combinations */}
            <div className="bg-slate-50/70 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Interdisciplinary High-Growth Focus</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  USA / Canada Priority
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {combinedKws.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search tutors for ${kw}`}
                    className="compact-inline-link text-xs bg-amber-50/70 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-950 border border-amber-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-amber-600 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {highSearchKws.length > 12 && (
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllKeywords(!showAllKeywords)}
                className="compact-inline-link text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 px-4 py-1.5 rounded-xl border border-blue-200 cursor-pointer transition-all"
              >
                {showAllKeywords ? '▲ Show Fewer Keywords' : `▼ View All ${highSearchKws.length} Search Keywords for this Domain`}
              </button>
            </div>
          )}
        </div>

        {/* SEO Keyword Links Block (Foundational Courses, Specialized Disciplines & Nearby Cities) */}
        <SEOKeywordLinksBlock
          locationName={locationDisplay}
          tutorName={tutor.name}
          primarySubject={tutor.primarySubject || subjects[0]}
          tutorSubjects={subjects}
          tutorEducation={tutor.education}
          primaryDomain={relevantKw.primaryDomain}
          onNavigateLocation={(loc) => onNavigate(`location:${loc}`)}
          onNavigateSubject={(subj) => onNavigate(`subject:${subj}`)}
          className="rounded-3xl border border-slate-200/80 shadow-xs"
        />

      </div>
    </div>
  </>
  );
}
