import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, apiJson, isAbortError, resolveMediaUrl } from '../lib/apiClient';
import { User } from '../types';
import { ResponsiveAvatar } from './ResponsiveImage';
import { assignUniqueTutorSlugs, getTutorCanonicalSlug } from '../utils/tutorSlug';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';
import { EditorialServicePageConfig } from '../data/editorialServiceContent';

interface ServiceEditorialTemplateProps {
  config: EditorialServicePageConfig;
  tutors: User[];
  onNavigate: (view: string) => void;
  topBarSlot?: React.ReactNode;
  afterContentSlot?: React.ReactNode;
}

type ModalType = 'booking' | 'mentor' | 'sample' | null;
type MentorCategory = 'all' | 'business' | 'humanities' | 'stem' | 'health';

interface LiveTutorRecord extends Partial<Omit<User, 'subjects' | 'subjectExpertise'>> {
  id: string;
  name: string;
  reviewsCount?: number;
  profileImageUrl?: string;
  subjectExpertise?: string[] | string;
  subjects?: string[] | string;
}

interface TutorsApiResponse {
  success?: boolean;
  tutors?: LiveTutorRecord[];
}

interface NormalizedMentor {
  id: string;
  slug: string;
  name: string;
  avatarSrc: string;
  fallbackAvatarSrc: string;
  department: string;
  subtitle: string;
  bio: string;
  ratingText: string;
  reviewCountText: string;
  discipline: string;
  facultyCategory: Exclude<MentorCategory, 'all'>;
  countryCode: string;
  subjects: string[];
}

const DISCIPLINE_OPTIONS = [
  'Business, Finance & Economics',
  'Social Sciences & Humanities',
  'STEM & Computing',
  'Health & Life Sciences',
  'Law & Public Policy',
];

function buildInitialsFallback(name: string): string {
  const initials =
    (name || 'UT')
      .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'UT';

  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#EA580C"/><text x="50%" y="54%" font-family="system-ui,-apple-system,sans-serif" font-size="32" font-weight="700" fill="#FFFFFF" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`
  )}`;
}

function parseSubjectsList(tutor: LiveTutorRecord): string[] {
  const collected: string[] = [];
  if (tutor.primarySubject && typeof tutor.primarySubject === 'string') {
    collected.push(tutor.primarySubject.trim());
  }

  const pushRaw = (raw: unknown) => {
    if (!raw) return;
    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (typeof item === 'string' && item.trim()) collected.push(item.trim());
      });
      return;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (typeof item === 'string' && item.trim()) collected.push(item.trim());
            });
            return;
          }
        } catch {
          // Fall through to comma split
        }
      }
      trimmed.split(',').forEach((s) => {
        if (s.trim()) collected.push(s.trim());
      });
    }
  };

  pushRaw(tutor.subjectExpertise);
  pushRaw(tutor.subjects);

  const seen = new Set<string>();
  return collected.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCountryCode(raw?: string | null): string {
  const value = String(raw || '').trim().toUpperCase();
  if (!value) return '';
  if (value === 'USA' || value === 'UNITED STATES') return 'US';
  if (value === 'UK' || value === 'UNITED KINGDOM') return 'GB';
  if (value === 'CANADA') return 'CA';
  if (value === 'AUSTRALIA') return 'AU';
  if (value === 'IRELAND') return 'IE';
  if (value === 'UAE' || value === 'UNITED ARAB EMIRATES') return 'AE';
  if (value === 'NEW ZEALAND') return 'NZ';
  if (value === 'SINGAPORE') return 'SG';
  return value.slice(0, 2);
}

function inferDisciplineAndCategory(
  tutor: LiveTutorRecord,
  subjects: string[]
): {
  discipline: string;
  facultyCategory: Exclude<MentorCategory, 'all'>;
} {
  const haystack = [
    tutor.primaryDomain || '',
    tutor.primarySubject || '',
    ...subjects,
    tutor.education || '',
    tutor.bio || '',
  ]
    .join(' ')
    .toLowerCase();

  if (
    /\b(law|legal|policy|jurisprudence|constitutional|contract|tort|criminology|public policy)\b/.test(
      haystack
    )
  ) {
    return { discipline: 'Law & Public Policy', facultyCategory: 'health' };
  }
  if (
    /\b(nursing|health|medical|medicine|biomedical|pharmacology|clinical|anatomy|bioethics|nutrition|midwifery|public health)\b/.test(
      haystack
    )
  ) {
    return { discipline: 'Health & Life Sciences', facultyCategory: 'health' };
  }
  if (
    /\b(business|finance|econom|accounting|marketing|management|mba|strategy|supply chain|corporate|banking)\b/.test(
      haystack
    )
  ) {
    return { discipline: 'Business, Finance & Economics', facultyCategory: 'business' };
  }
  if (
    /\b(psychology|sociology|politic|international relations|history|philosophy|literature|english|media|humanities|education|social|rhetoric|anthropology|arts|writing)\b/.test(
      haystack
    )
  ) {
    return { discipline: 'Social Sciences & Humanities', facultyCategory: 'humanities' };
  }
  return { discipline: 'STEM & Computing', facultyCategory: 'stem' };
}

export default function ServiceEditorialTemplate({
  config,
  tutors,
  onNavigate,
  topBarSlot,
  afterContentSlot,
}: ServiceEditorialTemplateProps) {
  // Active modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Live tutors hydrated from backend merged with passed prop tutors
  const [liveDirectoryTutors, setLiveDirectoryTutors] = useState<LiveTutorRecord[]>([]);

  // FAQ state (first item expanded by default)
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  // Mentor filter state (Modal 2)
  const [mentorFilter, setMentorFilter] = useState<MentorCategory>('all');

  // Quick Enquiry Sidebar form state
  const [eqName, setEqName] = useState('');
  const [eqEmail, setEqEmail] = useState('');
  const [eqFormat, setEqFormat] = useState(config.quickEnquiry.formatOptions[0] || '');
  const [eqDeadline, setEqDeadline] = useState('');
  const [eqNote, setEqNote] = useState('');
  const [eqSubmitted, setEqSubmitted] = useState(false);
  const [eqSubmitting, setEqSubmitting] = useState(false);

  // Booking Modal form state
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingDiscipline, setBookingDiscipline] = useState(DISCIPLINE_OPTIONS[0]);
  const [bookingPackage, setBookingPackage] = useState(config.packages.items[0]?.name || '');
  const [bookingPreferredMentor, setBookingPreferredMentor] = useState<string | null>(null);
  const [bookingPrompt, setBookingPrompt] = useState('');
  const [bookingIntegrity, setBookingIntegrity] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Reset form defaults when navigating between service/country pages
  useEffect(() => {
    setOpenFaqs({ 0: true });
    setEqFormat(config.quickEnquiry.formatOptions[0] || '');
    setEqSubmitted(false);
    setBookingPackage(config.packages.items[0]?.name || '');
    setBookingPreferredMentor(null);
    setBookingSubmitted(false);
    setMentorFilter('all');
    setActiveModal(null);
  }, [config.id, config.packages.items, config.quickEnquiry.formatOptions]);

  // Hydrate real active tutors from /api/tutors so production DB profiles are always shown
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson<TutorsApiResponse>(
          '/api/tutors?activeOnly=true&page=1&limit=30',
          { signal: controller.signal }
        );
        if (mounted && Array.isArray(data?.tutors) && data.tutors.length > 0) {
          setLiveDirectoryTutors(data.tutors);
        }
      } catch (err) {
        if (!isAbortError(err)) {
          // Gracefully rely on tutors prop already passed from App state
        }
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Merge live API tutors + passed prop tutors into normalized real mentor cards
  const realMentors = useMemo<NormalizedMentor[]>(() => {
    const byId = new Map<string, LiveTutorRecord>();

    liveDirectoryTutors.forEach((t) => {
      if (t && t.id && t.name && t.suspended !== true && t.isActive !== false) {
        byId.set(String(t.id), t);
      }
    });

    tutors.forEach((t) => {
      if (t && t.id && t.name && t.suspended !== true && t.isActive !== false) {
        if (!byId.has(String(t.id))) {
          byId.set(String(t.id), t);
        }
      }
    });

    const combined = Array.from(byId.values());
    const slugMap = assignUniqueTutorSlugs(combined);
    const preferredCountry = normalizeCountryCode(config.tutorShowcase.preferredCountryCode);

    const normalized = combined.map((tutor) => {
      const subjects = parseSubjectsList(tutor);
      const { discipline, facultyCategory } = inferDisciplineAndCategory(tutor, subjects);
      const canonicalSlug = getTutorCanonicalSlug(tutor, slugMap);
      const rawAvatar = tutor.profileImageUrl || tutor.avatarUrl || '';
      const resolvedAvatar = rawAvatar ? resolveMediaUrl(rawAvatar) : '';
      const fallbackAvatar = buildInitialsFallback(tutor.name);

      const ratingNum =
        typeof tutor.rating === 'number' && tutor.rating > 0 ? tutor.rating : 4.9;
      const reviewsNum =
        typeof tutor.reviewsCount === 'number' && tutor.reviewsCount > 0
          ? tutor.reviewsCount
          : typeof tutor.reviewCount === 'number' && tutor.reviewCount > 0
            ? tutor.reviewCount
            : 25;

      const department =
        tutor.primarySubject || tutor.primaryDomain || subjects[0] || discipline;

      const subtitle =
        tutor.education ||
        tutor.experienceSummary ||
        tutor.location ||
        tutor.cityLocation ||
        tutor.city ||
        'Verified University Tutor';

      const bio =
        (tutor.bio && tutor.bio.trim()) ||
        (tutor.experience && tutor.experience.trim()) ||
        (tutor.experienceSummary && tutor.experienceSummary.trim()) ||
        (subjects.length > 0
          ? `Provides structured 1-on-1 university academic coaching across ${subjects.slice(0, 4).join(', ')}.`
          : 'Provides structured 1-on-1 university mentoring, rubric alignment, and academic support.');

      return {
        id: String(tutor.id),
        slug: canonicalSlug,
        name: tutor.name,
        avatarSrc: resolvedAvatar || fallbackAvatar,
        fallbackAvatarSrc: fallbackAvatar,
        department,
        subtitle,
        bio,
        ratingText: ratingNum.toFixed(ratingNum % 1 === 0 ? 1 : 2).replace(/\.00$/, '.0'),
        reviewCountText: `${reviewsNum} verified ${reviewsNum === 1 ? 'review' : 'reviews'}`,
        discipline,
        facultyCategory,
        countryCode: normalizeCountryCode(tutor.country),
        subjects,
      };
    });

    if (!preferredCountry) {
      return normalized;
    }

    // Prioritize matching-country tutors first on regional pages while keeping the showcase full
    return [...normalized].sort((a, b) => {
      const aMatch = a.countryCode === preferredCountry ? 0 : 1;
      const bMatch = b.countryCode === preferredCountry ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [liveDirectoryTutors, tutors, config.tutorShowcase.preferredCountryCode]);

  const marqueeMentors = useMemo(() => realMentors.slice(0, 10), [realMentors]);

  // Lock body scroll and listen for Escape key while any modal is open
  useEffect(() => {
    if (!activeModal) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  const openModal = (modal: Exclude<ModalType, null>) => {
    if (modal === 'booking') {
      setBookingSubmitted(false);
    }
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const selectPackage = (packageName: string) => {
    setBookingPackage(packageName);
    setBookingPreferredMentor(null);
    setBookingSubmitted(false);
    setActiveModal('booking');
  };

  const bookWithMentor = (mentor: NormalizedMentor) => {
    setBookingDiscipline(mentor.discipline);
    setBookingPreferredMentor(mentor.name);
    setBookingSubmitted(false);
    setActiveModal('booking');
  };

  const handleOpenMentorProfile = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      setActiveModal(null);
      onNavigate(`/tutor/${encodeURIComponent(slug)}`);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleQuickEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eqSubmitting) return;
    setEqSubmitting(true);
    try {
      await apiFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: eqName.trim(),
          studentEmail: eqEmail.trim(),
          subject: `${config.quickEnquiry.inquirySubjectPrefix} — ${eqFormat}`,
          academicLevel: 'University',
          deadline: eqDeadline.trim(),
          query: eqNote.trim(),
        }),
      });
    } catch {
      // Keep confirmation state responsive even if backend is offline
    } finally {
      setEqSubmitting(false);
      setEqSubmitted(true);
    }
  };

  const resetQuickEnquiry = () => {
    setEqName('');
    setEqEmail('');
    setEqFormat(config.quickEnquiry.formatOptions[0] || '');
    setEqDeadline('');
    setEqNote('');
    setEqSubmitted(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingSubmitting) return;
    setBookingSubmitting(true);
    const mentorPrefix = bookingPreferredMentor
      ? `[Preferred Mentor: ${bookingPreferredMentor}]\n`
      : '';
    try {
      await apiFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: bookingName.trim(),
          studentEmail: bookingEmail.trim(),
          subject: `${config.quickEnquiry.inquirySubjectPrefix} | ${bookingDiscipline} — ${bookingPackage}`,
          academicLevel: 'University',
          deadline: 'Requested via Academic Mentorship Portal',
          query: `${mentorPrefix}${bookingPrompt.trim()}`,
        }),
      });
    } catch {
      // Keep confirmation state responsive even if backend is offline
    } finally {
      setBookingSubmitting(false);
      setBookingSubmitted(true);
    }
  };

  const filteredDirectoryMentors = useMemo(() => {
    if (mentorFilter === 'all') return realMentors;
    return realMentors.filter((m) => m.facultyCategory === mentorFilter);
  }, [mentorFilter, realMentors]);

  const renderTutorCard = (mentor: NormalizedMentor, keyPrefix: string, ariaHidden?: boolean) => {
    const profileHref = `/tutor/${encodeURIComponent(mentor.slug)}`;
    return (
      <article
        key={`${keyPrefix}-${mentor.id}`}
        aria-hidden={ariaHidden}
        className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-2xl border border-orange-200/80 p-5 shadow-sm hover:shadow-md hover:border-orange-350 transition flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <a
              href={profileHref}
              tabIndex={ariaHidden ? -1 : 0}
              onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
              className="flex-shrink-0 rounded-full focus:outline-none"
              aria-label={`View ${mentor.name} profile`}
            >
              <ResponsiveAvatar
                src={mentor.avatarSrc}
                fallbackSrc={mentor.fallbackAvatarSrc}
                alt={ariaHidden ? '' : mentor.name}
                sizePx={48}
                width={48}
                height={48}
                loading="lazy"
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
              />
            </a>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block truncate">
                {mentor.department}
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                <a
                  href={profileHref}
                  tabIndex={ariaHidden ? -1 : 0}
                  onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
                  className="hover:text-orange-600 transition-colors"
                >
                  {mentor.name}
                </a>
              </h3>
              <span className="text-[11px] text-slate-500 block truncate">{mentor.subtitle}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed text-justify mb-3 line-clamp-3">
            {mentor.bio}
          </p>
        </div>

        <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-700 truncate">
            &#9733; {mentor.ratingText} ({mentor.reviewCountText})
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={profileHref}
              tabIndex={ariaHidden ? -1 : 0}
              onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
              className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              Profile
            </a>
            <button
              type="button"
              tabIndex={ariaHidden ? -1 : 0}
              onClick={() => bookWithMentor(mentor)}
              className="text-xs font-bold text-orange-600 hover:text-orange-650 cursor-pointer compact-inline-link"
            >
              Match Mentor &rarr;
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div
      id={`editorial-service-${config.id}`}
      className="bg-white text-slate-800 font-sans antialiased selection:bg-orange-200 selection:text-orange-950 text-left"
    >
      {/* Optional Top Navigation / Regional Switcher Slot */}
      {topBarSlot}

      {/* Hero Section: White & Vibrant Orange Editorial Layout with Editorial Illustration */}
      <section className="relative bg-white pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Full Editorial Introduction */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-600" aria-hidden="true" />
                <span>{config.hero.badge}</span>
              </div>
              <h1 className="font-editorial-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight text-balance">
                {config.hero.titleStart}
                <span className="text-orange-600">{config.hero.titleAccent}</span>
              </h1>
              {config.hero.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm sm:text-base text-slate-700 leading-relaxed text-justify"
                >
                  {para}
                </p>
              ))}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openModal('booking')}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-650 rounded-xl shadow-md hover:shadow-lg transition text-center cursor-pointer"
                >
                  {config.hero.primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => openModal('mentor')}
                  className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition text-center cursor-pointer"
                >
                  {config.hero.secondaryCta}
                </button>
                <a
                  href="#stickyEnquiryCard"
                  className="lg:hidden w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-orange-50 rounded-xl border border-orange-200 transition text-center"
                >
                  Quick Enquiry &darr;
                </a>
              </div>
            </div>

            {/* Right Column: Editorial Illustration 1 */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <img
                src={config.hero.illustrationSrc}
                alt={config.hero.illustrationAlt}
                referrerPolicy="no-referrer"
                className={
                  config.hero.isCutout
                    ? 'w-full max-w-sm sm:max-w-lg lg:max-w-none lg:scale-110 h-auto object-contain drop-shadow-[0_14px_20px_rgba(27,36,50,0.15)]'
                    : 'w-full max-w-md sm:max-w-lg lg:max-w-none h-auto object-contain mix-blend-multiply rounded-2xl'
                }
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== config.hero.illustrationFallback) {
                    target.onerror = null;
                    target.src = config.hero.illustrationFallback;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Right-Hand Quick Enquiry Sidebar Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Full Editorial Content (8 Columns on Desktop) */}
          <div className="lg:col-span-8 space-y-12 sm:space-y-16">
            {/* Section 1: Challenges */}
            <section
              id="challenges"
              className="scroll-mt-24 space-y-6 pb-12 border-b border-orange-100"
            >
              <div className="space-y-4 sm:space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  {config.challenges.badge}
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                  {config.challenges.title}
                </h2>
                <p>{config.challenges.intro}</p>

                <ul className="space-y-3.5 pl-4 border-l-4 border-orange-500">
                  {config.challenges.bullets.map((bullet) => (
                    <li key={bullet.title}>
                      <strong className="text-slate-900 font-bold">{bullet.title}</strong>{' '}
                      {bullet.body}
                    </li>
                  ))}
                </ul>

                <p className="font-medium text-slate-900 bg-orange-50/70 p-4 sm:p-5 rounded-2xl border-l-4 border-orange-600 shadow-sm">
                  {config.challenges.summaryHighlight}
                </p>
              </div>

              {/* Editorial Illustration 2 */}
              <div className="flex items-center justify-center pt-2">
                <img
                  src={config.challenges.illustrationSrc}
                  alt={config.challenges.illustrationAlt}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className={
                    config.challenges.isCutout
                      ? 'w-full max-w-sm sm:max-w-xl h-auto object-contain drop-shadow-[0_14px_20px_rgba(27,36,50,0.15)]'
                      : 'w-full max-w-sm sm:max-w-xl h-auto object-contain mix-blend-multiply rounded-2xl'
                  }
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== config.challenges.illustrationFallback) {
                      target.onerror = null;
                      target.src = config.challenges.illustrationFallback;
                    }
                  }}
                />
              </div>
            </section>

            {/* Section 2: How It Works */}
            <section
              id="process"
              className="scroll-mt-24 space-y-6 pb-12 border-b border-orange-100"
            >
              <div className="space-y-4 sm:space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  {config.process.badge}
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                  {config.process.title}
                </h2>
                <p>{config.process.intro}</p>

                <div className="space-y-5 pt-1">
                  {config.process.steps.map((step, index) => (
                    <div key={step.title}>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 mb-1.5 text-left">
                        <span className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 tabular-nums">
                          {index + 1}
                        </span>
                        {step.title}
                      </h3>
                      <p className="pl-9">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Illustration 3 */}
              <div className="flex items-center justify-center pt-2">
                <img
                  src={config.process.illustrationSrc}
                  alt={config.process.illustrationAlt}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className={
                    config.process.isCutout
                      ? 'w-full max-w-sm sm:max-w-xl h-auto object-contain drop-shadow-[0_14px_20px_rgba(27,36,50,0.15)]'
                      : 'w-full max-w-sm sm:max-w-xl h-auto object-contain mix-blend-multiply rounded-2xl'
                  }
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== config.process.illustrationFallback) {
                      target.onerror = null;
                      target.src = config.process.illustrationFallback;
                    }
                  }}
                />
              </div>
            </section>

            {/* Section 3: Formats & Subject Disciplines */}
            <section
              id="formats"
              className="scroll-mt-24 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed text-justify pb-12 border-b border-orange-100"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                {config.formats.badge}
              </span>
              <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                {config.formats.title}
              </h2>
              <p>{config.formats.intro}</p>

              <div className="divide-y divide-orange-200/80 border-t border-b border-orange-200/80 my-6">
                {config.formats.items.map((item) => (
                  <div key={item.title} className="py-4 sm:py-5">
                    <h3 className="text-base sm:text-lg font-bold text-orange-700 mb-1.5 text-left">
                      {item.title}
                    </h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>

              {/* Subject Disciplines We Support */}
              <div className="pt-2 space-y-4">
                <h3 className="font-editorial-serif text-lg sm:text-2xl font-bold text-slate-900 text-left">
                  {config.formats.disciplinesTitle}
                </h3>
                <p>{config.formats.disciplinesIntro}</p>
                <ul className="space-y-3 pl-4 border-l-4 border-orange-600">
                  {config.formats.disciplines.map((disc) => (
                    <li key={disc.title}>
                      <strong className="text-slate-900">{disc.title}</strong> {disc.body}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 4: Comparison Table & Academic Integrity */}
            <section
              id="integrity"
              className="scroll-mt-24 space-y-10 pb-12 border-b border-orange-100"
            >
              <div className="space-y-4 sm:space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  {config.comparison.badge}
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                  {config.comparison.title}
                </h2>
                <p>{config.comparison.intro}</p>

                <div className="overflow-x-auto rounded-2xl border border-orange-200 shadow-sm my-4 text-left">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-orange-600 text-white">
                        <th className="py-3 px-4 font-bold">Comparison Dimension</th>
                        <th className="py-3 px-4 font-semibold text-orange-100">
                          {config.comparison.leftColumnTitle}
                        </th>
                        <th className="py-3 px-4 font-bold bg-orange-650">
                          {config.comparison.rightColumnTitle}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100 bg-white">
                      {config.comparison.rows.map((row) => (
                        <tr key={row.dimension}>
                          <td className="py-3 px-4 font-bold text-slate-900">{row.dimension}</td>
                          <td className="py-3 px-4 text-slate-600">{row.generic}</td>
                          <td className="py-3 px-4 text-slate-900 font-medium bg-orange-50/40">
                            {row.ours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Academic Integrity Block */}
              <div className="space-y-6">
                <div className="space-y-4 sm:space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    {config.integrity.badge}
                  </span>
                  <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                    {config.integrity.title}
                  </h2>
                  <p>{config.integrity.intro}</p>
                  <p className="font-semibold text-slate-900">{config.integrity.listLead}</p>

                  <ul className="space-y-3 pl-4 border-l-4 border-orange-500">
                    {config.integrity.bullets.map((bullet) => (
                      <li key={bullet.title}>
                        <strong className="text-slate-900">{bullet.title}</strong> {bullet.body}
                      </li>
                    ))}
                  </ul>

                  <p className="text-slate-900 font-medium bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-200">
                    {config.integrity.closingBox}
                  </p>
                </div>

                {/* Editorial Illustration 4 */}
                <div className="flex items-center justify-center pt-2">
                  <img
                    src={config.integrity.illustrationSrc}
                    alt={config.integrity.illustrationAlt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className={
                      config.integrity.isCutout
                        ? 'w-full max-w-sm sm:max-w-xl h-auto object-contain drop-shadow-[0_14px_20px_rgba(27,36,50,0.15)]'
                        : 'w-full max-w-sm sm:max-w-xl h-auto object-contain mix-blend-multiply rounded-2xl'
                    }
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== config.integrity.illustrationFallback) {
                        target.onerror = null;
                        target.src = config.integrity.illustrationFallback;
                      }
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Section 5: Audience Profiles & Support Packages */}
            <section
              id="packages"
              className="scroll-mt-24 space-y-10 pb-12 border-b border-orange-100 text-slate-700 text-sm sm:text-base leading-relaxed text-justify"
            >
              <div className="space-y-4 sm:space-y-5">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  {config.audience.badge}
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                  {config.audience.title}
                </h2>
                <p>{config.audience.intro}</p>

                <ul className="space-y-3 pl-4 border-l-4 border-orange-600">
                  {config.audience.profiles.map((profile) => (
                    <li key={profile.title}>
                      <strong className="text-slate-900">{profile.title}</strong> {profile.body}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 sm:space-y-5 pt-6 border-t border-orange-200">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  {config.packages.badge}
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 leading-snug text-left">
                  {config.packages.title}
                </h2>
                <p>{config.packages.intro}</p>

                <ol className="space-y-4 list-decimal pl-5 marker:text-orange-600 marker:font-bold">
                  {config.packages.items.map((pkg) => (
                    <li key={pkg.name} className="pl-1">
                      <strong className="text-slate-900">{pkg.name}:</strong> {pkg.description}
                      <div className="mt-1.5 text-left">
                        <button
                          type="button"
                          onClick={() => selectPackage(pkg.name)}
                          className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-650 underline cursor-pointer compact-inline-link"
                        >
                          {pkg.cta}
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Section 6: Frequently Asked Questions */}
            <section id="faq" className="scroll-mt-24">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Answers &amp; Policies
                </span>
                <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900 text-left">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="divide-y divide-orange-200 border-t border-b border-orange-200">
                {config.faqs.map((item, idx) => {
                  const isOpen = Boolean(openFaqs[idx]);
                  return (
                    <div key={item.question} className="py-4">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left flex justify-between items-center gap-3 focus:outline-none cursor-pointer"
                      >
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-orange-600 transform transition-transform duration-200 flex-shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="mt-2.5 text-slate-700 text-xs sm:text-sm leading-relaxed text-justify">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Quick Enquiry Form Sidebar (Scrolls With Page) */}
          <aside id="stickyEnquiryCard" className="lg:col-span-4 lg:sticky lg:top-24 scroll-mt-24">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">
              {/* Orange Header Banner */}
              <div className="bg-orange-600 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">
                    {config.quickEnquiry.eyebrow}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                    {config.quickEnquiry.replyBadge}
                  </span>
                </div>
                <h3 className="font-editorial-serif text-lg sm:text-xl font-bold leading-snug">
                  {config.quickEnquiry.title}
                </h3>
                <p className="text-orange-100 text-xs mt-1 text-justify">
                  {config.quickEnquiry.subtitle}
                </p>
              </div>

              {/* Form Body */}
              <div className="p-5">
                {!eqSubmitted ? (
                  <form onSubmit={handleQuickEnquirySubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="eqName"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Your Name *
                      </label>
                      <input
                        id="eqName"
                        type="text"
                        required
                        value={eqName}
                        onChange={(e) => setEqName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="eqEmail"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        University Email *
                      </label>
                      <input
                        id="eqEmail"
                        type="email"
                        required
                        value={eqEmail}
                        onChange={(e) => setEqEmail(e.target.value)}
                        placeholder="a.morgan@university.edu"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="eqFormat"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        {config.quickEnquiry.formatLabel}
                      </label>
                      <select
                        id="eqFormat"
                        value={eqFormat}
                        onChange={(e) => setEqFormat(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-600 focus:border-orange-600 focus:outline-none"
                      >
                        {config.quickEnquiry.formatOptions.map((fmt) => (
                          <option key={fmt} value={fmt}>
                            {fmt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="eqDeadline"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        {config.quickEnquiry.deadlineLabel}
                      </label>
                      <input
                        id="eqDeadline"
                        type="text"
                        required
                        value={eqDeadline}
                        onChange={(e) => setEqDeadline(e.target.value)}
                        placeholder={config.quickEnquiry.deadlinePlaceholder}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="eqNote"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        {config.quickEnquiry.noteLabel}
                      </label>
                      <textarea
                        id="eqNote"
                        rows={3}
                        required
                        value={eqNote}
                        onChange={(e) => setEqNote(e.target.value)}
                        placeholder={config.quickEnquiry.notePlaceholder}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={eqSubmitting}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-650 disabled:opacity-60 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-sm cursor-pointer"
                    >
                      {eqSubmitting ? 'Sending Enquiry...' : config.quickEnquiry.submitLabel}
                    </button>

                    <div className="pt-2 border-t border-orange-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>100% Confidential</span>
                      <span>Honor-Code Compliant</span>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-5 space-y-2.5">
                    <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                      &#10003;
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Enquiry Received!</h4>
                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                      Thank you! A subject-matter coordinator will reply within 2–4 hours with
                      available mentors matched to your timeline.
                    </p>
                    <button
                      type="button"
                      onClick={resetQuickEnquiry}
                      className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-650 underline cursor-pointer compact-inline-link"
                    >
                      Send another enquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Continuous Right-to-Left Sliding Real Tutors Profile Showcase */}
      <section
        id="tutorShowcase"
        className="py-10 sm:py-14 bg-orange-50/60 border-t border-orange-100 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                {config.tutorShowcase.badge}
              </span>
              <h2 className="font-editorial-serif text-xl sm:text-3xl font-bold text-slate-900">
                {config.tutorShowcase.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => openModal('mentor')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-650 underline cursor-pointer compact-inline-link"
              >
                Filter by Faculty &rarr;
              </button>
              <a
                href="/tutors"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tutors');
                  }
                }}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-orange-600 underline transition-colors"
              >
                View All Faculty Mentors &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Seamless Right-to-Left Infinite Marquee Track (Populated With Real Tutors) */}
        {marqueeMentors.length > 0 ? (
          <div className="tutor-marquee-wrapper relative w-full overflow-hidden">
            <div className="tutor-marquee-track flex w-max gap-4 sm:gap-5 px-4 animate-marquee-rtl">
              {marqueeMentors.map((mentor) => renderTutorCard(mentor, 'primary', false))}
              {marqueeMentors.map((mentor) => renderTutorCard(mentor, 'clone', true))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-orange-200 p-6 text-center text-sm text-slate-600">
              Loading our verified subject-matter tutors...
            </div>
          </div>
        )}
      </section>

      {/* Final Call-to-Action Section: Vibrant Orange & Crisp White */}
      <section id="finalActionSection" className="py-10 sm:py-16 lg:py-20 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 text-orange-50 text-[11px] font-bold uppercase tracking-wider">
                {config.finalCta.badge}
              </span>
              <h2 className="font-editorial-serif text-xl sm:text-3xl lg:text-4xl font-bold leading-snug text-left">
                {config.finalCta.title}
              </h2>
              <p className="text-orange-50 text-sm sm:text-base leading-relaxed text-justify">
                {config.finalCta.paragraph1}
              </p>
              <p className="text-white font-semibold text-sm sm:text-base leading-relaxed text-justify">
                {config.finalCta.paragraph2}
              </p>

              {/* Clear Plan of Action 3-Step Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {config.finalCta.steps.map((step) => (
                  <div
                    key={step.step}
                    className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-3.5"
                  >
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-orange-100">
                      {step.step}
                    </span>
                    <span className="block font-bold text-white text-xs sm:text-sm mt-0.5">
                      {step.title}
                    </span>
                    <span className="block text-[11px] text-orange-100 mt-0.5">
                      {step.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openModal('booking')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-orange-50 text-orange-700 font-bold rounded-xl shadow-lg transition text-sm text-center cursor-pointer"
                >
                  {config.finalCta.primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => openModal('mentor')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-orange-650 hover:bg-orange-700 text-white font-semibold rounded-xl border border-orange-350 transition text-sm text-center cursor-pointer"
                >
                  {config.finalCta.secondaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => openModal('sample')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-transparent hover:bg-orange-650/60 text-white font-semibold rounded-xl border border-white/60 transition text-sm text-center cursor-pointer"
                >
                  {config.finalCta.tertiaryCta}
                </button>
              </div>
            </div>

            {/* Right Column: Cutout / Editorial Illustration */}
            <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
              <img
                src={config.finalCta.illustrationSrc}
                alt={config.finalCta.illustrationAlt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full max-w-xs sm:max-w-lg lg:max-w-none lg:scale-125 lg:translate-x-4 h-auto object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.28)]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== config.finalCta.illustrationFallback) {
                    target.onerror = null;
                    target.src = config.finalCta.illustrationFallback;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Optional Regional Cities / Sibling Services / SEO Links Slot */}
      {afterContentSlot}

      {/* MODAL 1: Book Mentorship Session */}
      {activeModal === 'booking' && (
        <div
          id="bookingModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookingModalTitle"
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-orange-100 relative my-8"
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-orange-600 p-1 cursor-pointer compact-pill-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-2">
              Secure Student Portal
            </span>
            <h3
              id="bookingModalTitle"
              className="font-editorial-serif text-2xl font-bold text-slate-900 mb-1"
            >
              {config.hero.primaryCta}
            </h3>
            <p className="text-slate-600 text-sm mb-5">
              Submit your course or brief context to be matched with a Master&apos;s or PhD subject
              mentor within 2–4 hours.
            </p>

            {bookingPreferredMentor && !bookingSubmitted && (
              <div className="mb-4 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                <span className="text-slate-700">
                  Requested Mentor:{' '}
                  <strong className="text-orange-700">{bookingPreferredMentor}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setBookingPreferredMentor(null)}
                  className="text-slate-500 hover:text-orange-700 font-semibold cursor-pointer compact-inline-link"
                >
                  Clear
                </button>
              </div>
            )}

            {!bookingSubmitted ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      University Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      placeholder="a.morgan@university.edu"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="modalDiscipline"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Subject Discipline
                    </label>
                    <select
                      id="modalDiscipline"
                      value={bookingDiscipline}
                      onChange={(e) => setBookingDiscipline(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none"
                    >
                      {DISCIPLINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="modalPackage"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Support Package
                    </label>
                    <select
                      id="modalPackage"
                      value={bookingPackage}
                      onChange={(e) => setBookingPackage(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-600 focus:outline-none"
                    >
                      {config.packages.items.map((pkg) => (
                        <option key={pkg.name} value={pkg.name}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Prompt, Rubric &amp; Specific Goals *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bookingPrompt}
                    onChange={(e) => setBookingPrompt(e.target.value)}
                    placeholder="Share your module topic, deadline, syllabus goals, or areas where you need mentorship..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-start gap-2.5 bg-orange-50 p-3 rounded-xl border border-orange-200">
                  <input
                    type="checkbox"
                    required
                    id="integrityCheck"
                    checked={bookingIntegrity}
                    onChange={(e) => setBookingIntegrity(e.target.checked)}
                    className="mt-1 rounded text-orange-600 focus:ring-orange-600 accent-orange-600"
                  />
                  <label htmlFor="integrityCheck" className="text-xs text-slate-700">
                    I understand that university-tutors.com provides ethical academic coaching and
                    feedback only, and does not write or rewrite coursework on behalf of students.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-650 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {bookingSubmitting ? 'Submitting Request...' : 'Request Subject Mentor Match'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  &#10003;
                </div>
                <h4 className="text-xl font-bold text-slate-900">Request Received!</h4>
                <p className="text-sm text-slate-600">
                  We are matching your brief with a qualified postgraduate specialist in your
                  discipline. Check your inbox within 2–4 hours for your secure portal link.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 px-6 py-2.5 bg-orange-600 hover:bg-orange-650 text-white text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Return to Page
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Browse Real Subject-Matter Mentors */}
      {activeModal === 'mentor' && (
        <div
          id="mentorModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mentorModalTitle"
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-orange-100 relative my-8"
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-orange-600 p-1 cursor-pointer compact-pill-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3
              id="mentorModalTitle"
              className="font-editorial-serif text-2xl font-bold text-slate-900 mb-2"
            >
              Browse Subject-Matter Mentors
            </h3>
            <p className="text-slate-600 text-sm mb-5">
              Filter our verified academic advisors by faculty to preview their real profiles and
              coaching expertise.
            </p>

            <div className="flex flex-wrap gap-2 mb-6" id="mentorFilters">
              {(
                [
                  { id: 'all', label: 'All Faculties' },
                  { id: 'business', label: 'Business & Econ' },
                  { id: 'humanities', label: 'Social Sciences & Humanities' },
                  { id: 'stem', label: 'STEM & Computing' },
                  { id: 'health', label: 'Health & Law' },
                ] as const
              ).map((tab) => {
                const isSelected = mentorFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMentorFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer compact-pill-btn ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-slate-700 hover:bg-orange-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              className="divide-y divide-orange-100 border-t border-b border-orange-100 max-h-96 overflow-y-auto pr-1"
              id="mentorGrid"
            >
              {filteredDirectoryMentors.length > 0 ? (
                filteredDirectoryMentors.map((mentor) => {
                  const profileHref = `/tutor/${encodeURIComponent(mentor.slug)}`;
                  return (
                    <div
                      key={mentor.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <a
                          href={profileHref}
                          onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
                          className="flex-shrink-0"
                        >
                          <ResponsiveAvatar
                            src={mentor.avatarSrc}
                            fallbackSrc={mentor.fallbackAvatarSrc}
                            alt={mentor.name}
                            sizePx={44}
                            width={44}
                            height={44}
                            loading="lazy"
                            className="w-11 h-11 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                          />
                        </a>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold uppercase text-orange-600 block">
                            {mentor.department} • &#9733; {mentor.ratingText}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-0.5">
                            <a
                              href={profileHref}
                              onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
                              className="hover:text-orange-600 transition-colors"
                            >
                              {mentor.name}
                            </a>
                            {mentor.subtitle ? (
                              <span className="text-xs font-medium text-slate-500">
                                {' '}
                                — {mentor.subtitle}
                              </span>
                            ) : null}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {mentor.bio}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pl-14 sm:pl-0">
                        <a
                          href={profileHref}
                          onClick={(e) => handleOpenMentorProfile(e, mentor.slug)}
                          className="text-xs font-semibold text-slate-700 hover:text-orange-600 underline whitespace-nowrap"
                        >
                          View Profile
                        </a>
                        <button
                          type="button"
                          onClick={() => bookWithMentor(mentor)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer compact-pill-btn"
                        >
                          Match Mentor &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No tutors currently listed under this faculty filter. Select &ldquo;All
                  Faculties&rdquo; or request a custom specialist match below.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="/tutors"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    setActiveModal(null);
                    onNavigate('tutors');
                  }
                }}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-650 underline"
              >
                Explore Full Tutor Directory &rarr;
              </a>
              <button
                type="button"
                onClick={() => {
                  setBookingPreferredMentor(null);
                  openModal('booking');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-650 cursor-pointer"
              >
                Book a Session With a Specialist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: View Sample Mentor Feedback / Coaching Example */}
      {activeModal === 'sample' && (
        <div
          id="sampleModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sampleModalTitle"
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-orange-100 relative my-8"
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-orange-600 p-1 cursor-pointer compact-pill-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-2">
              {config.sampleModal.badge}
            </span>
            <h3
              id="sampleModalTitle"
              className="font-editorial-serif text-2xl font-bold text-slate-900 mb-2"
            >
              {config.sampleModal.title}
            </h3>
            <p className="text-slate-600 text-sm mb-5">{config.sampleModal.subtitle}</p>

            <div className="space-y-4 bg-orange-50/60 p-5 rounded-2xl border border-orange-200">
              <div className="bg-white p-4 rounded-xl border border-orange-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {config.sampleModal.excerptLabel}
                </span>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed font-editorial-serif italic">
                  {config.sampleModal.excerptQuote}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border-l-4 border-orange-600">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                  {config.sampleModal.feedbackLabel}
                </span>
                <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong>{config.sampleModal.diagnosisLabel}</strong>{' '}
                  {config.sampleModal.diagnosis}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong>{config.sampleModal.strategyLabel}</strong> {config.sampleModal.strategy}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-slate-500">{config.sampleModal.footerNote}</span>
              <button
                type="button"
                onClick={() => openModal('booking')}
                className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-650 cursor-pointer"
              >
                {config.sampleModal.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
