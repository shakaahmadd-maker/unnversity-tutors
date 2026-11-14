import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  Star,
  MapPin,
  GraduationCap,
  ArrowRight,
  Search,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { User } from '../../types';
import { ResponsiveAvatar } from '../ResponsiveImage';
import { apiJson, isAbortError, getFriendlyErrorMessage } from '../../lib/apiClient';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import { getTutorCanonicalSlug } from '../../utils/tutorSlug';
import { store } from '../../lib/store';

interface MeetOurExpertTutorsProps {
  onNavigate: (view: string) => void;
  subjectHint?: string;
}

interface TutorsApiResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  tutors: LiveTutorProfile[];
}

interface LiveTutorProfile extends Partial<Omit<User, 'subjects' | 'subjectExpertise'>> {
  id: string;
  name: string;
  reviewsCount?: number;
  profileImageUrl?: string;
  subjectExpertise?: string[] | string;
  subjects?: string[] | string;
}

const PAGE_SIZE = 8;

function buildInitialsFallback(name: string): string {
  const initials =
    (name || 'Tutor')
      .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'UT';

  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect width="112" height="112" rx="20" fill="#FFF7ED"/><text x="50%" y="54%" font-family="system-ui,-apple-system,sans-serif" font-size="36" font-weight="800" fill="#EA580C" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`
  )}`;
}

function parseTutorSubjects(tutor: LiveTutorProfile): string[] {
  const collected: string[] = [];
  if (tutor.primarySubject && typeof tutor.primarySubject === 'string') {
    collected.push(tutor.primarySubject.trim());
  }

  const pushFromField = (raw: unknown) => {
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
          // Fall through to comma-separated split
        }
      }
      trimmed.split(',').forEach((s) => {
        if (s.trim()) collected.push(s.trim());
      });
    }
  };

  pushFromField(tutor.subjectExpertise);
  pushFromField(tutor.subjects);

  const seen = new Set<string>();
  return collected.filter((sub) => {
    const key = sub.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MeetOurExpertTutors({ onNavigate, subjectHint }: MeetOurExpertTutorsProps) {
  const [tutors, setTutors] = useState<LiveTutorProfile[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchActiveTutors = useCallback(
    async (targetPage: number, append: boolean, query: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({
          activeOnly: 'true',
          page: String(targetPage),
          limit: String(PAGE_SIZE),
        });
        if (query) {
          params.set('search', query);
        }

        const data = await apiJson<TutorsApiResponse>(`/api/tutors?${params.toString()}`, {
          signal: controller.signal,
        });

        const incoming = Array.isArray(data?.tutors) ? data.tutors : [];
        setTotal(typeof data?.total === 'number' ? data.total : incoming.length);
        setPage(typeof data?.page === 'number' ? data.page : targetPage);
        setTotalPages(typeof data?.totalPages === 'number' ? Math.max(1, data.totalPages) : 1);

        if (append) {
          setTutors((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const merged = [...prev];
            incoming.forEach((t) => {
              if (!existingIds.has(t.id)) {
                existingIds.add(t.id);
                merged.push(t);
              }
            });
            return merged;
          });
        } else {
          setTutors(incoming);
        }
      } catch (err) {
        if (isAbortError(err)) return;
        setErrorMsg(getFriendlyErrorMessage(err, 'Unable to load active tutors from the directory.'));
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void fetchActiveTutors(1, false, debouncedSearch);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch, fetchActiveTutors]);

  const handleLoadMore = () => {
    if (isLoadingMore || page >= totalPages) return;
    void fetchActiveTutors(page + 1, true, debouncedSearch);
  };

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      e.stopPropagation();
      onNavigate(view);
    }
  };

  const openTutorFullProfile = (tutor: LiveTutorProfile) => {
    if (!tutor?.id) return;
    const upserted = store.upsertTutorPreview(tutor);
    const slug = getTutorCanonicalSlug(upserted, store.getTutorSlugMap());
    onNavigate(`/tutor/${encodeURIComponent(slug)}`);
  };

  const handleTutorProfileLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tutor: LiveTutorProfile
  ) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      e.stopPropagation();
      openTutorFullProfile(tutor);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLElement>, tutor: LiveTutorProfile) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, select, textarea')) {
      return;
    }
    openTutorFullProfile(tutor);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>, tutor: LiveTutorProfile) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTutorFullProfile(tutor);
    }
  };

  return (
    <section
      id="meet-our-expert-tutors"
      aria-labelledby="meet-expert-tutors-heading"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14 print:hidden"
    >
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs">
        {/* Section Header + Live Count + Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-7 border-b border-slate-100">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-2.5 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Live Verified Directory</span>
              </span>
              {total > 0 && !isLoading && (
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {total} Active Tutors Available
                </span>
              )}
            </div>

            <h2
              id="meet-expert-tutors-heading"
              className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#111827] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Meet Our Expert Tutors
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {subjectHint
                ? `Need 1-on-1 guidance beyond ${subjectHint}? Connect directly with credentialed PhD & Master’s mentors active on University-Tutors.com.`
                : 'Connect directly with real, background-verified PhD & Master’s tutors currently active across Mathematics, Sciences, Writing & Engineering.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Filter by subject or name..."
                aria-label="Filter active tutors by subject or name"
                className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl bg-[#F9FAFB] border border-slate-200 focus:border-[#F97316] focus:bg-white focus:outline-none text-sm text-[#111827] placeholder:text-slate-400 transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear tutor search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <a
              href="/tutors"
              onClick={(e) => handleAnchorNav(e, 'tutors')}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Full Directory</span>
              <ArrowRight className="w-4 h-4 text-[#F97316]" />
            </a>
          </div>
        </div>

        {/* Content Body: Skeleton / Error / Empty / Live Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-7" aria-busy="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#F9FAFB] border border-slate-200/80 rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="h-11 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="mt-7 rounded-2xl bg-[#FFF7ED] border border-orange-200 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-[#111827]">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void fetchActiveTutors(1, false, debouncedSearch)}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading Tutors</span>
            </button>
          </div>
        ) : tutors.length === 0 ? (
          <div className="mt-7 rounded-2xl bg-[#F9FAFB] border border-slate-200 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-[#111827]">
              No active tutors matched{debouncedSearch ? ` "${debouncedSearch}"` : ''}.
            </p>
            <p className="text-xs text-slate-600">
              Try clearing your filter or explore our complete academic mentor directory.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {debouncedSearch && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:border-[#F97316] text-xs font-semibold text-[#111827] cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('tutors')}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold cursor-pointer"
              >
                Browse All Tutors
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-7">
              {tutors.map((tutor) => {
                const subjects = parseTutorSubjects(tutor);
                const primarySub = subjects[0] || 'Academic Mentorship';
                const secondarySubs = subjects.slice(1, 3);
                const avatarSrc = tutor.avatarUrl || tutor.profileImageUrl;
                const ratingVal =
                  typeof tutor.rating === 'number' ? tutor.rating.toFixed(1) : tutor.rating || '5.0';
                const reviewsCount = tutor.reviewsCount ?? tutor.reviewCount ?? 0;
                const locationText = tutor.cityLocation || tutor.location || tutor.country || 'Online Worldwide';
                const hourlyRate = tutor.hourlyRate || 55;

                const tutorSlug = getTutorCanonicalSlug(tutor);

                return (
                  <article
                    key={tutor.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`View full profile for ${tutor.name}`}
                    onClick={(e) => handleCardClick(e, tutor)}
                    onKeyDown={(e) => handleCardKeyDown(e, tutor)}
                    className="bg-[#F9FAFB] hover:bg-[#FFFFFF] border border-slate-200/90 hover:border-[#F97316] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <div className="space-y-3.5">
                      {/* Avatar + Name + Rate */}
                      <div className="flex items-start gap-3">
                        <a
                          href={`/tutor/${encodeURIComponent(tutorSlug)}`}
                          onClick={(e) => handleTutorProfileLinkClick(e, tutor)}
                          className="shrink-0 block cursor-pointer"
                        >
                          <ResponsiveAvatar
                            src={avatarSrc}
                            alt={tutor.name}
                            sizePx={64}
                            width={56}
                            height={56}
                            fallbackSrc={buildInitialsFallback(tutor.name)}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white shrink-0"
                          />
                        </a>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <a
                              href={`/tutor/${encodeURIComponent(tutorSlug)}`}
                              onClick={(e) => handleTutorProfileLinkClick(e, tutor)}
                              className="text-sm font-bold text-[#111827] hover:text-[#EA580C] truncate transition-colors cursor-pointer"
                            >
                              {tutor.name}
                            </a>
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 shrink-0"
                              aria-label="Verified Active Tutor"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 tabular-nums">
                            <span className="inline-flex items-center gap-0.5 font-bold text-[#111827]">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {ratingVal}
                            </span>
                            {reviewsCount > 0 && <span>({reviewsCount})</span>}
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-[#EA580C]">${hourlyRate}/hr</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Subject Highlight */}
                      <div className="space-y-1.5">
                        <span className="inline-block max-w-full truncate text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-2.5 py-1 rounded-lg">
                          {primarySub}
                        </span>
                        {secondarySubs.length > 0 && (
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {secondarySubs.join(' · ')}
                          </p>
                        )}
                      </div>

                      {/* Academic Credential */}
                      <div className="flex items-start gap-2 text-xs text-slate-700 leading-snug pt-0.5">
                        <GraduationCap className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                        <p className="line-clamp-2">
                          {tutor.education || 'Verified University Academic Specialist'}
                        </p>
                      </div>
                    </div>

                    {/* Direct Dual CTA Buttons (44px+ touch targets) */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-3 border-t border-slate-200/70">
                      <a
                        href={`/tutor/${encodeURIComponent(tutorSlug)}`}
                        onClick={(e) => handleTutorProfileLinkClick(e, tutor)}
                        className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-[#111827] hover:text-[#EA580C] text-xs font-semibold inline-flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap"
                      >
                        View Full Profile
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          store.upsertTutorPreview(tutor);
                          onNavigate(`book-tutor:${tutor.id}`);
                        }}
                        className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>Book 1-on-1 Session</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination / Load More Footer */}
            <div className="mt-7 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 tabular-nums">
                Showing <span className="font-bold text-[#111827]">{tutors.length}</span> of{' '}
                <span className="font-bold text-[#111827]">{total}</span> real active tutors
              </p>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                {page < totalPages && (
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FFF7ED] hover:bg-[#F97316] border border-orange-200 hover:border-[#F97316] text-[#EA580C] hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {isLoadingMore ? 'Loading More Tutors...' : `Load More Tutors (${total - tutors.length} more)`}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
