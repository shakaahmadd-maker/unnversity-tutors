import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
import MarketingPages from './components/MarketingPages';
import ErrorBoundary from './components/ErrorBoundary';
import { apiFetch } from './lib/apiClient';
import type { ToastNotification } from './utils/audioNotification';
import { resolveDedicatedServiceRoute } from './data/dedicatedServiceRoutes';
import {
  matchMathRouteView,
  matchScienceRouteView,
  matchStudentToolRoute,
  matchStudentToolSlug,
  isSpecializedServiceSlug,
} from './data/toolRouteMatchers';
import { updatePageSeo } from './utils/seo';
import { getBlogCanonicalSlug, matchesBlogSlugOrId } from './utils/blogSlug';
import { assignUniqueTutorSlugs, getTutorCanonicalSlug, matchesTutorSlugOrId } from './utils/tutorSlug';
import { store } from './lib/store';
import { hasModulePermission, isStaffUser } from './lib/adminPermissions';
import { UserRole, Chat, User } from './types';
import { AlertCircle, X } from 'lucide-react';

// Route-based code splitting so non-initial routes & widgets never bloat initial homepage JS
const Footer = lazy(() => import('./components/Footer'));
const FooterLocationsSubjects = lazy(() => import('./components/FooterLocationsSubjects'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));
const FloatingWhatsAppButton = lazy(() => import('./components/FloatingWhatsAppButton'));
const SopModal = lazy(() => import('./components/SopModal'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const DashboardPortal = lazy(() => import('./components/DashboardPortal'));
const MarketingSubpages = lazy(() => import('./components/MarketingSubpages'));
const AssignmentFormModal = lazy(() => import('./components/AssignmentFormModal'));
const BecomeTutorModal = lazy(() => import('./components/BecomeTutorModal'));
const ChatWindow = lazy(() => import('./components/ChatWindow'));
const GetQuotePage = lazy(() => import('./components/GetQuotePage'));
const TutorProfilePage = lazy(() => import('./components/TutorProfilePage'));
const TutorsDirectoryPage = lazy(() => import('./components/TutorsDirectoryPage'));
const WhatsAppChatModal = lazy(() => import('./components/WhatsAppChatModal'));
const CountryOnlineTutoringPage = lazy(() => import('./components/CountryOnlineTutoringPage'));
const SpecializedServicePage = lazy(() => import('./components/SpecializedServicePage'));
const WhatsAppPage = lazy(() => import('./components/WhatsAppPage'));
const UserDataPage = lazy(() => import('./components/UserDataPage'));
const DataDeletionPage = lazy(() => import('./components/DataDeletionPage'));
const ToolsHub = lazy(() => import('./components/tools/ToolsHub'));
const ScienceToolsRouter = lazy(() => import('./components/tools/ScienceToolsRouter'));
const MathToolsRouter = lazy(() => import('./components/tools/MathToolsRouter'));
const ChatNotificationToast = lazy(() => import('./components/ChatNotificationToast'));

function resolveInitialViewFromWindow(): string {
  if (typeof window === 'undefined') return 'home';
  const rawPath = window.location.pathname;
  const decodedPath = decodeURIComponent(rawPath).toLowerCase().trim().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().trim();

  if (!decodedPath || decodedPath === '/' || decodedPath === '/home' || hash === '#home') return 'home';
  if (decodedPath === '/how-it-works' || hash === '#how-it-works') return 'home';
  if (
    decodedPath === '/get-a-quote' ||
    decodedPath === '/get-quote' ||
    decodedPath === '/get a quote' ||
    decodedPath === '/getaquote' ||
    decodedPath === '/pricing' ||
    hash === '#get-a-quote' ||
    hash === '#get-quote' ||
    hash === '#pricing'
  ) {
    return 'get-a-quote';
  }
  if (decodedPath === '/tools' || hash === '#tools') return 'tools';
  const mView = matchMathRouteView(decodedPath) || matchMathRouteView(hash);
  if (mView) return mView;
  const sciView = matchScienceRouteView(decodedPath) || matchScienceRouteView(hash);
  if (sciView) return sciView;
  if (decodedPath.startsWith('/tools/') || hash.startsWith('#tools/')) {
    const matched = matchStudentToolRoute(decodedPath) || matchStudentToolRoute(hash);
    if (matched) return matched.viewKey;
  }
  const matchedService = resolveDedicatedServiceRoute(decodedPath) || resolveDedicatedServiceRoute(hash);
  if (matchedService) return matchedService.view;
  if (decodedPath === '/services' || hash === '#services') return 'services';
  if (decodedPath === '/about-us' || decodedPath === '/about us' || decodedPath === '/about' || hash === '#about') return 'about';
  if (decodedPath === '/faqs' || decodedPath === '/faq' || hash === '#faqs' || hash === '#faq') return 'faqs';
  if (decodedPath === '/contact' || decodedPath === '/contact-us' || decodedPath === '/contact us' || hash === '#contact') return 'contact';
  if (decodedPath === '/our-blog' || decodedPath === '/our blog' || decodedPath === '/blog' || hash === '#blog') return 'blog';
  if (decodedPath.startsWith('/blog/') || decodedPath.startsWith('/our-blog/') || hash.startsWith('#blog/')) {
    const rawSlug = decodedPath.startsWith('/blog/')
      ? decodedPath.slice('/blog/'.length)
      : decodedPath.startsWith('/our-blog/')
        ? decodedPath.slice('/our-blog/'.length)
        : hash.slice('#blog/'.length);
    const cleanSlug = rawSlug.split('?')[0].split('#')[0].trim();
    return cleanSlug ? `blog/${cleanSlug}` : 'blog';
  }
  if (decodedPath === '/whatsapp' || decodedPath === '/whatsapp-desk' || hash === '#whatsapp') return 'whatsapp';
  if (decodedPath === '/privacy' || hash === '#privacy') return 'privacy';
  if (decodedPath === '/terms' || hash === '#terms') return 'terms';
  if (decodedPath === '/google-disclosure' || decodedPath === '/google-oauth-disclosure' || hash === '#google-disclosure') {
    return 'google-disclosure';
  }
  if (decodedPath === '/auth' || decodedPath === '/reset-password' || hash === '#auth' || hash === '#reset-password') {
    return 'auth';
  }
  if (decodedPath === '/admin-login' || hash === '#admin-login') {
    return 'admin-login';
  }
  if (
    decodedPath === '/student' ||
    decodedPath === '/student/dashboard' ||
    decodedPath === '/student/chat' ||
    decodedPath === '/chat' ||
    decodedPath === '/chats' ||
    decodedPath === '/tutor/dashboard' ||
    hash === '#student' ||
    hash === '#student/dashboard' ||
    hash === '#student/chat' ||
    hash === '#chat' ||
    hash === '#tutor/dashboard'
  ) {
    return 'dashboard';
  }
  if (
    decodedPath === '/admin' ||
    decodedPath.startsWith('/admin/') ||
    hash === '#admin' ||
    hash.startsWith('#admin/')
  ) {
    const searchParams = new URLSearchParams(window.location.search || '');
    if (searchParams.get('reset_token') || searchParams.get('token')) {
      return 'admin-login';
    }
    const cookieStr = typeof document !== 'undefined' ? document.cookie || '' : '';
    const hasCookieHint = /(?:^|;\s*)ut_session_active=1(?:;|$)/.test(cookieStr);
    let hasStoredHint = false;
    try {
      hasStoredHint = Boolean(localStorage.getItem('ut_current_user') || localStorage.getItem('auth_token'));
    } catch {
      hasStoredHint = false;
    }
    return hasCookieHint || hasStoredHint ? 'dashboard' : 'admin-login';
  }
  if (decodedPath.startsWith('/online-tutoring-') || hash.startsWith('#online-tutoring-')) return 'country-online-tutoring';
  if (isSpecializedServiceSlug(decodedPath) || isSpecializedServiceSlug(hash)) return 'specialized-service';
  if (
    decodedPath === '/tutors' ||
    decodedPath === '/tutors-directory' ||
    decodedPath === '/tutors directory' ||
    decodedPath === '/find-a-tutor' ||
    hash === '#tutors' ||
    hash === '#tutors-directory' ||
    hash === '#find-a-tutor'
  ) {
    return 'tutors-directory';
  }
  if (
    decodedPath === '/data-deletion' ||
    decodedPath === '/data-deletion-instructions' ||
    decodedPath === '/user-data-deletion' ||
    decodedPath === '/data deletion' ||
    decodedPath === '/datadeletion'
  ) {
    return 'data-deletion';
  }
  if (
    (decodedPath.startsWith('/tutor/') && decodedPath !== '/tutor/dashboard') ||
    (decodedPath.startsWith('/tutors/') && decodedPath !== '/tutors-directory') ||
    decodedPath.startsWith('/tutor-profile/')
  ) {
    return 'tutor-profile';
  }
  return 'home';
}

export default function App() {
  const [storeState, setStoreState] = useState({
    currentUser: store.currentUser,
    users: store.users,
    blogs: store.blogs,
    faqs: store.faqs,
    chats: store.chats,
    messages: store.messages,
    quotes: store.quotes,
    assignments: store.assignments,
    payments: store.payments,
    supportTickets: store.supportTickets,
    reviews: store.reviews,
    invoices: store.invoices,
    activityLogs: store.activityLogs,
    appNotifications: store.appNotifications,
    sops: store.sops,
    assignmentReports: store.assignmentReports,
    agreements: store.agreements,
    activeStudentsOnline: store.activeStudentsOnline,
    emails: store.emails || [],
    connectionStatus: store.connectionStatus || 'syncing',
    lastSyncTime: store.lastSyncTime || null,
    syncError: store.syncError || null,
    sessionExpiredMessage: store.sessionExpiredMessage || null,
    tabStates: store.tabStates || {},
    isLoadingMessages: store.isLoadingMessages || false,
    chatError: store.chatError || null,
    isSessionInitialized: store.isSessionInitialized,
  });

  const [activeView, setActiveView] = useState<string>(() => resolveInitialViewFromWindow());
  const [adminRoutePath, setAdminRoutePath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/admin';
    const raw = window.location.pathname;
    if (raw.toLowerCase().startsWith('/admin')) return raw;
    if (window.location.hash.toLowerCase().startsWith('#admin')) return window.location.hash.replace(/^#/, '/');
    return '/admin';
  });
  const [activeCountryTutoringSlug, setActiveCountryTutoringSlug] = useState<string>(() => {
    if (typeof window === 'undefined') return 'usa';
    const p = decodeURIComponent(window.location.pathname).toLowerCase().replace(/\/+$/, '');
    if (p.startsWith('/online-tutoring-')) {
      return p.replace('/online-tutoring-', '').trim() || 'usa';
    }
    return 'usa';
  });
  const [activeSpecializedServiceSlug, setActiveSpecializedServiceSlug] = useState<string>(() => {
    if (typeof window === 'undefined') return 'assignment-guidance';
    const p = decodeURIComponent(window.location.pathname).toLowerCase().replace(/\/+$/, '');
    if (isSpecializedServiceSlug(p)) {
      return p.replace(/^\//, '').trim() || 'assignment-guidance';
    }
    return 'assignment-guidance';
  });
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [selectedTutorProfile, setSelectedTutorProfile] = useState<User | null>(() => {
    if (typeof window === 'undefined' || resolveInitialViewFromWindow() !== 'tutor-profile') {
      return null;
    }
    const ssrData = (window as Window & { __INITIAL_SSR_DATA__?: { routeType?: string; tutor?: User } })
      .__INITIAL_SSR_DATA__;
    if (ssrData?.routeType === 'tutor-profile' && ssrData.tutor) {
      return store.upsertTutorPreview(ssrData.tutor);
    }
    return null;
  });
  const [isLoadingTutorProfile, setIsLoadingTutorProfile] = useState<boolean>(() => {
    if (resolveInitialViewFromWindow() !== 'tutor-profile') return false;
    if (typeof window !== 'undefined') {
      const ssrData = (window as Window & { __INITIAL_SSR_DATA__?: { routeType?: string; tutor?: User } })
        .__INITIAL_SSR_DATA__;
      if (ssrData?.routeType === 'tutor-profile' && ssrData.tutor) return false;
    }
    return true;
  });
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isBecomeTutorOpen, setIsBecomeTutorOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [hideGlobalWhatsAppForStudentUi, setHideGlobalWhatsAppForStudentUi] = useState<boolean>(false);
  const [prefilledTutorForAssign] = useState<string>('');
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const seenMessageIdsRef = useRef<Set<string>>(new Set(store.messages.map((m) => m.id)));
  const isInitialMountRef = useRef<boolean>(true);
  const [isIdleWidgetsReady, setIsIdleWidgetsReady] = useState<boolean>(false);
  const [shouldRenderFooter, setShouldRenderFooter] = useState<boolean>(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);

  // Defer non-critical floating WhatsApp button & CookieBanner strictly until AFTER window.load + idle (or user interaction)
  useEffect(() => {
    let activated = false;
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    const activate = () => {
      if (activated) return;
      activated = true;
      setIsIdleWidgetsReady(true);
    };

    const onInteract = () => {
      setHasUserInteracted(true);
      activate();
    };

    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((evt) => window.addEventListener(evt, onInteract, { once: true, passive: true }));

    const schedulePostLoad = () => {
      timeoutHandle = setTimeout(() => {
        if (typeof ric === 'function') {
          idleHandle = ric(activate, { timeout: 2500 });
        } else {
          activate();
        }
      }, 3500);
    };

    if (document.readyState === 'complete') {
      schedulePostLoad();
    } else {
      window.addEventListener('load', schedulePostLoad, { once: true });
    }

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onInteract));
      window.removeEventListener('load', schedulePostLoad);
      if (idleHandle !== null && typeof cic === 'function') cic(idleHandle);
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, []);

  // Gate lazy Footer download & DOM mount until user scrolls near bottom or browser is idle after load
  useEffect(() => {
    if (shouldRenderFooter) return;
    const el = footerSentinelRef.current;
    let timerId: number | null = null;
    let idleId: number | null = null;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const mountFooter = () => setShouldRenderFooter(true);

    const scheduleIdleMount = () => {
      timerId = window.setTimeout(() => {
        if (typeof w.requestIdleCallback === 'function') {
          idleId = w.requestIdleCallback(mountFooter, { timeout: 2500 });
        } else {
          mountFooter();
        }
      }, 2200);
    };

    if (document.readyState === 'complete') {
      scheduleIdleMount();
    } else {
      window.addEventListener('load', scheduleIdleMount, { once: true });
    }

    let observer: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            mountFooter();
            observer?.disconnect();
          }
        },
        { rootMargin: '850px 0px' }
      );
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('load', scheduleIdleMount);
      if (timerId !== null) window.clearTimeout(timerId);
      if (idleId !== null && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
      observer?.disconnect();
    };
  }, [activeView, shouldRenderFooter]);

  // Incoming text listener: lazy-loads audio synthesizer only when real incoming messages arrive
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      seenMessageIdsRef.current = new Set(storeState.messages.map((m) => m.id));
      return;
    }

    const currentMessages = storeState.messages;
    const newArrivals = currentMessages.filter((m) => !seenMessageIdsRef.current.has(m.id));

    if (newArrivals.length > 0) {
      newArrivals.forEach((m) => {
        seenMessageIdsRef.current.add(m.id);

        if (m.senderId !== storeState.currentUser?.id && !m.isSystem) {
          const senderUser = storeState.users.find((u) => u.id === m.senderId);
          const senderName = senderUser?.name || 'Academic Advisor';
          const senderAvatar = senderUser?.avatarUrl;
          const senderRole = senderUser?.role || 'tutor';

          void import('./utils/audioNotification').then((mod) => {
            mod.audioNotifier.playReceivedSound();
          });

          const toastId = `notif_${m.id}_${Date.now()}`;
          const newToast: ToastNotification = {
            id: toastId,
            senderName,
            senderAvatar,
            senderRole,
            chatId: m.chatId || m.roomId || '',
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setActiveToasts((prev) => [newToast, ...prev.slice(0, 2)]);

          setTimeout(() => {
            setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 7000);
        }
      });
    }
  }, [storeState.messages, storeState.currentUser, storeState.users]);

  // Close WhatsApp modal on page transition; only start concierge auto-open timer after real user interaction
  useEffect(() => {
    setIsWhatsAppModalOpen(false);
    if (!hasUserInteracted) return;
    const timer = setTimeout(() => {
      setIsWhatsAppModalOpen(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeView, selectedTutorProfile, hasUserInteracted]);

  // Automated Technical SEO: Canonicalization, parameter stripping, robots, Schema.org JSON-LD, and dynamic metadata sync
  useEffect(() => {
    let cancelled = false;
    const defaultTitle = 'University Tutors | 1-on-1 Online Tutoring, Exam Prep & Tools';
    const defaultDesc =
      'Verified 1-on-1 university tutoring, coursework guidance, dissertation feedback, and 70+ free STEM & citation tools across the US, UK, Canada, Australia & Ireland.';

    const applySeo = async () => {
      let title = defaultTitle;
      let description = defaultDesc;
      let canonicalPath = '/';
      let ogType: 'website' | 'article' | 'profile' = 'website';
      let ogImage: string | undefined = 'https://university-tutors.com/logo.webp';
      let robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      let structuredData: Record<string, any> | null = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'University Tutors',
        url: 'https://university-tutors.com',
        logo: 'https://university-tutors.com/logo.webp',
        description: defaultDesc,
      };

      if (activeView === 'country-online-tutoring') {
        const { COUNTRY_ONLINE_TUTORING_PAGES } = await import('./data/countryOnlineTutoringData');
        const pageData = COUNTRY_ONLINE_TUTORING_PAGES[activeCountryTutoringSlug];
        if (pageData) {
          title = pageData.seoTitle || pageData.h1;
          description = pageData.paragraphs?.[0] || description;
          canonicalPath = `/online-tutoring-${activeCountryTutoringSlug}`;
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: pageData.h1,
            description,
            url: `https://university-tutors.com${canonicalPath}`,
            provider: { '@type': 'EducationalOrganization', name: 'University Tutors', url: 'https://university-tutors.com' },
          };
        }
      } else if (activeView === 'specialized-service') {
        const { SPECIALIZED_SERVICE_PAGES_MAP } = await import('./data/specializedTutoringServicesData');
        const sPage =
          SPECIALIZED_SERVICE_PAGES_MAP[activeSpecializedServiceSlug] ||
          SPECIALIZED_SERVICE_PAGES_MAP['/' + activeSpecializedServiceSlug];
        if (sPage) {
          title = sPage.seoTitle || sPage.h1;
          description = sPage.summary || description;
          canonicalPath = `/${activeSpecializedServiceSlug}`;
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: sPage.h1,
            description,
            url: `https://university-tutors.com${canonicalPath}`,
            provider: { '@type': 'EducationalOrganization', name: 'University Tutors', url: 'https://university-tutors.com' },
          };
        }
      } else if (resolveDedicatedServiceRoute(activeView)) {
        const dService = resolveDedicatedServiceRoute(activeView)!;
        title = dService.seoTitle;
        description = dService.seoDescription;
        canonicalPath = dService.path;
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: dService.label,
          description,
          url: `https://university-tutors.com${canonicalPath}`,
          provider: { '@type': 'EducationalOrganization', name: 'University Tutors', url: 'https://university-tutors.com' },
        };
      } else if (activeView === 'tutor-profile' && selectedTutorProfile) {
        const expArr = Array.isArray(selectedTutorProfile.subjectExpertise)
          ? selectedTutorProfile.subjectExpertise
          : [];
        const subArr = Array.isArray(selectedTutorProfile.subjects) ? selectedTutorProfile.subjects : [];
        const allSubj = Array.from(
          new Set([selectedTutorProfile.primarySubject || '', ...expArr, ...subArr].map((s) => String(s || '').trim()).filter(Boolean))
        );
        const primarySubj = allSubj[0] || 'University Subjects';
        const locationLabel =
          selectedTutorProfile.location ||
          (selectedTutorProfile as any).cityLocation ||
          selectedTutorProfile.city ||
          selectedTutorProfile.country ||
          'Online Worldwide';
        const educationLabel = selectedTutorProfile.education || 'Verified University Degree';
        const ratingVal = Number(selectedTutorProfile.rating || 4.9);
        const reviewsTotal = Number((selectedTutorProfile as any).reviewsCount ?? selectedTutorProfile.reviewCount ?? 120);
        const canonicalSlug = getTutorCanonicalSlug(selectedTutorProfile, store.getTutorSlugMap());

        canonicalPath = `/tutor/${encodeURIComponent(canonicalSlug)}`;
        const canonicalFullUrl = `https://university-tutors.com${canonicalPath}`;
        title = `${selectedTutorProfile.name} — ${primarySubj} Tutor (${locationLabel}) | University Tutors`;
        description =
          selectedTutorProfile.bio ||
          selectedTutorProfile.experienceSummary ||
          selectedTutorProfile.experience ||
          `Book 1-on-1 sessions with ${selectedTutorProfile.name}, verified ${allSubj.slice(0, 3).join(', ')} tutor (${educationLabel}) in ${locationLabel}.`;
        ogType = 'profile';
        if (selectedTutorProfile.avatarUrl) {
          ogImage = selectedTutorProfile.avatarUrl;
        }
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `${canonicalFullUrl}#person`,
          name: selectedTutorProfile.name,
          url: canonicalFullUrl,
          image: ogImage,
          jobTitle: `${primarySubj} University Tutor`,
          description,
          homeLocation: { '@type': 'Place', name: locationLabel },
          knowsAbout: allSubj.length > 0 ? allSubj : [primarySubj],
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: educationLabel,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(ratingVal),
            bestRating: '5',
            reviewCount: String(reviewsTotal),
          },
          makesOffer: {
            '@type': 'Offer',
            name: `1-on-1 ${primarySubj} Tutoring with ${selectedTutorProfile.name}`,
            price: String(Number(selectedTutorProfile.hourlyRate || 45)),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: canonicalFullUrl,
          },
        };
      } else if (activeView === 'services') {
        title = 'Academic Tutoring Services - University Tutors';
        canonicalPath = '/services';
      } else if (activeView === 'about') {
        title = 'About Us - University Tutors Founding Mission';
        canonicalPath = '/about';
      } else if (activeView === 'faqs') {
        title = 'Frequently Asked Questions - University Tutors';
        canonicalPath = '/faqs';
      } else if (activeView === 'contact') {
        title = 'Contact Advising Team - University Tutors';
        canonicalPath = '/contact';
      } else if (activeView === 'blog') {
        title = 'Academic Study Guides, Citation Manuals & Research Blog | University Tutors';
        description =
          'Read university study guides on APA 7th & Harvard referencing, dissertation planning, STEM exam recall, and academic writing by vetted mentors.';
        canonicalPath = '/blog';
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'University Tutors Academic Blog & Study Guides',
          url: 'https://university-tutors.com/blog',
          description,
          blogPost: storeState.blogs.slice(0, 12).map((b) => ({
            '@type': 'BlogPosting',
            headline: b.title,
            url: `https://university-tutors.com/blog/${encodeURIComponent(getBlogCanonicalSlug(b))}`,
            datePublished: b.publishedAt || '2026-10-01T00:00:00.000Z',
            author: { '@type': 'Organization', name: b.author || 'University Tutors Editorial Team' },
          })),
        };
      } else if (activeView.startsWith('blog/')) {
        const rawBlogSlug = activeView.slice('blog/'.length);
        const ssrData =
          typeof window !== 'undefined'
            ? (window as Window & { __INITIAL_SSR_DATA__?: { routeType?: string; blog?: any } }).__INITIAL_SSR_DATA__
            : undefined;
        const matchedBlog =
          storeState.blogs.find((b) => matchesBlogSlugOrId(b, rawBlogSlug)) ||
          (ssrData?.routeType === 'blog-post' && ssrData.blog && matchesBlogSlugOrId(ssrData.blog, rawBlogSlug)
            ? ssrData.blog
            : undefined);
        ogType = 'article';
        if (matchedBlog) {
          title = `${matchedBlog.title} | University Tutors`;
          description =
            matchedBlog.excerpt ||
            String(matchedBlog.content || '').replace(/[#*`>_]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155) ||
            defaultDesc;
          canonicalPath = `/blog/${encodeURIComponent(getBlogCanonicalSlug(matchedBlog))}`;
          const blogImg = matchedBlog.imageUrl || matchedBlog.image;
          if (blogImg) ogImage = blogImg;
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: matchedBlog.title,
            description,
            image: ogImage,
            datePublished: matchedBlog.publishedAt || '2026-10-01T00:00:00.000Z',
            dateModified: (matchedBlog as any).updatedAt || matchedBlog.publishedAt || '2026-10-01T00:00:00.000Z',
            articleSection: matchedBlog.category || 'Academic Guides',
            author: { '@type': 'Organization', name: matchedBlog.author || 'University Tutors Editorial Team' },
            publisher: {
              '@type': 'Organization',
              name: 'University Tutors',
              logo: { '@type': 'ImageObject', url: 'https://university-tutors.com/logo.webp' },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://university-tutors.com${canonicalPath}` },
          };
        } else {
          title = 'Academic Study Guide & Article | University Tutors';
          canonicalPath = `/blog/${encodeURIComponent(rawBlogSlug)}`;
        }
      } else if (activeView === 'whatsapp') {
        title = '24/7 WhatsApp Academic Concierge - University Tutors';
        canonicalPath = '/';
        robots = 'noindex, follow';
        structuredData = null;
      } else if (activeView === 'auth' || activeView === 'admin-login' || activeView === 'dashboard') {
        title =
          activeView === 'admin-login'
            ? 'Admin Sign In - University Tutors'
            : activeView === 'dashboard'
              ? 'Account Dashboard - University Tutors'
              : 'Sign In or Create Account - University Tutors';
        canonicalPath = typeof window !== 'undefined' ? window.location.pathname || '/auth' : '/auth';
        robots = 'noindex, nofollow';
        structuredData = null;
      } else if (activeView === 'google-disclosure') {
        title = 'Google OAuth Data Disclosure - University Tutors';
        canonicalPath = '/google-disclosure';
      } else if (activeView === 'tutors-directory' || activeView === 'tutors') {
        title = 'Find Verified University Mentors & Tutors | University Tutors';
        description =
          'Browse 500+ vetted PhD and Master’s university tutors across computer science, calculus, organic chemistry, nursing, finance, and academic writing.';
        canonicalPath = '/tutors';
      } else if (activeView === 'get-a-quote') {
        title = 'Get a Binding Milestone Quote - University Tutors';
        canonicalPath = '/get-a-quote';
      } else if (activeView === 'privacy') {
        title = 'Privacy Policy & Data Compliance - University Tutors';
        canonicalPath = '/privacy';
      } else if (activeView === 'terms') {
        title = 'Terms of Service & Escrow Safeguards - University Tutors';
        canonicalPath = '/terms';
      } else if (activeView === 'user-data') {
        title = 'Platform User Data & Directory - University Tutors';
        description =
          'Complete platform user registry of students, credentialed tutors, and administrators with real-time verification status.';
        canonicalPath = '/user-data';
        robots = 'noindex, nofollow';
        structuredData = null;
      } else if (activeView === 'data-deletion') {
        title = 'User Data Deletion Instructions - University Tutors';
        description =
          'Instructions on how to request the permanent deletion of your account and personal data from University Tutors, compliant with Meta, GDPR, and global standards.';
        canonicalPath = '/data-deletion';
      } else if (activeView === 'tools') {
        title = 'Free Online Student Tools Suite — PDF, Citations, Charts, CV & GPA | University Tutors';
        description =
          'Free, 100% private browser-based academic & STEM calculators for university students: Biology & Genetics Simulators, Chemistry & Spectroscopy Calculators, PDF Merger, Citations & CGPA.';
        canonicalPath = '/tools';
      } else if (matchMathRouteView(activeView)) {
        const { resolveMathRoute } = await import('./data/mathToolsRegistry');
        const mRoute = resolveMathRoute(activeView);
        if (mRoute) {
          if (mRoute.kind === 'hub') {
            title = 'Free University Mathematics & Statistics Calculators (27 Tools) | University-Tutors.com';
            description =
              '27 free interactive browser-based Mathematics & Statistics solvers: Algebra, Unit Circle, Symbolic Derivatives, Riemann Integrals, Matrix RREF, Eigenvalues, Hypothesis Testing, RK4 ODEs & RSA.';
            canonicalPath = '/tools/math';
          } else {
            title = mRoute.tool.seoTitle;
            description = mRoute.tool.seoDescription;
            canonicalPath = mRoute.tool.path;
          }
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: title,
            description,
            url: `https://university-tutors.com${canonicalPath}`,
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          };
        }
      } else if (matchScienceRouteView(activeView)) {
        const { resolveScienceRoute } = await import('./data/scienceToolsRegistry');
        const sciRoute = resolveScienceRoute(activeView);
        if (sciRoute) {
          if (sciRoute.kind === 'hub') {
            if (sciRoute.category === 'Biology') {
              title = 'Free Biology, Genetics & Molecular Lab Calculators (14 Tools) | University-Tutors.com';
              description =
                '14 free interactive browser-based Biology calculators: Punnett Square, DNA/RNA/Protein Translator, PCR Master Mix, CRISPR gRNA, Agarose Gel Simulator, Hardy-Weinberg, CFU/mL & Water Potential.';
              canonicalPath = '/tools/biology';
            } else {
              title = 'Free Chemistry, Stoichiometry & Spectroscopy Calculators (16 Tools) | University-Tutors.com';
              description =
                '16 free interactive browser-based Chemistry calculators: Periodic Table, Molar Mass, Equation Balancer, Limiting Reagent, Henderson-Hasselbalch Buffer, Titration, Nernst, VSEPR & NMR/IR Lookup.';
              canonicalPath = '/tools/chemistry';
            }
          } else {
            title = sciRoute.tool.seoTitle;
            description = sciRoute.tool.seoDescription;
            canonicalPath = sciRoute.tool.path;
          }
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: title,
            description,
            url: `https://university-tutors.com${canonicalPath}`,
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          };
        }
      } else if (matchStudentToolSlug(activeView)) {
        const toolSlug = matchStudentToolSlug(activeView)!;
        const { STUDENT_TOOLS_BY_SLUG } = await import('./data/studentToolsData');
        const toolDef = STUDENT_TOOLS_BY_SLUG[toolSlug as keyof typeof STUDENT_TOOLS_BY_SLUG];
        if (toolDef) {
          title = toolDef.seoTitle;
          description = toolDef.seoDescription;
          canonicalPath = toolDef.path;
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: title,
            description,
            url: `https://university-tutors.com${canonicalPath}`,
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          };
        }
      }

      if (!cancelled) {
        updatePageSeo({
          title,
          description,
          canonicalPath,
          ogType,
          ogImage,
          robots,
          structuredData,
        });
      }
    };

    void applySeo();
    return () => {
      cancelled = true;
    };
  }, [activeView, activeCountryTutoringSlug, activeSpecializedServiceSlug, selectedTutorProfile, storeState.blogs]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setStoreState({
        currentUser: store.currentUser,
        users: store.users,
        blogs: store.blogs,
        faqs: store.faqs,
        chats: store.chats,
        messages: store.messages,
        quotes: store.quotes,
        assignments: store.assignments,
        payments: store.payments,
        supportTickets: store.supportTickets,
        reviews: store.reviews,
        invoices: store.invoices,
        activityLogs: store.activityLogs,
        appNotifications: store.appNotifications,
        sops: store.sops,
        assignmentReports: store.assignmentReports,
        agreements: store.agreements,
        activeStudentsOnline: store.activeStudentsOnline,
        emails: store.emails || [],
        connectionStatus: store.connectionStatus || 'syncing',
        lastSyncTime: store.lastSyncTime || null,
        syncError: store.syncError || null,
        sessionExpiredMessage: store.sessionExpiredMessage || null,
        tabStates: store.tabStates || {},
        isLoadingMessages: store.isLoadingMessages || false,
        chatError: store.chatError || null,
        isSessionInitialized: store.isSessionInitialized,
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (storeState.sessionExpiredMessage && activeView === 'dashboard') {
      setActiveChat(null);
      setActiveView('auth');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/auth');
      }
    }
  }, [storeState.sessionExpiredMessage, activeView]);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const verifiedUser = await store.verifySession(true, true);
        if (!verifiedUser) {
          return;
        }
        const redirectUrl = typeof event.data.redirectUrl === 'string' ? event.data.redirectUrl : '';
        if (redirectUrl) {
          const cleanView = redirectUrl.replace(/^\//, '');
          handleNavigate(cleanView);
        } else {
          handleNavigate('dashboard');
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  useEffect(() => {
    if (activeChat) {
      void store.subscribeToChatDetails(activeChat.id);
    }
  }, [activeChat]);

  const openTutorProfileById = async (tutorIdOrSlug: string, pushUrl = true) => {
    const cleanParam = decodeURIComponent(tutorIdOrSlug || '').trim();
    if (!cleanParam) return;
    const lowerParam = cleanParam.toLowerCase();

    const syncCanonicalBrowserUrl = (tutor: User, shouldPush: boolean) => {
      if (typeof window === 'undefined') return;
      const canonicalSlug = getTutorCanonicalSlug(tutor, store.getTutorSlugMap());
      const targetPath = `/tutor/${encodeURIComponent(canonicalSlug)}`;
      if (shouldPush) {
        if (window.location.pathname !== targetPath) {
          window.history.pushState(null, '', targetPath);
        }
      } else if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    };

    const findInList = (list: User[]) => {
      const slugMap = assignUniqueTutorSlugs(
        list.filter((u) => u && (u.role === UserRole.TUTOR || String(u.id || '').startsWith('tutor')))
      );
      return (
        list.find((u) => getTutorCanonicalSlug(u, slugMap) === lowerParam) ||
        list.find((u) => u.id === cleanParam || u.id.toLowerCase() === lowerParam) ||
        list.find((u) => matchesTutorSlugOrId(u, cleanParam, slugMap))
      );
    };

    const localMatch = findInList(store.users);
    if (localMatch) {
      const normalizedLocal = store.upsertTutorPreview(localMatch);
      syncCanonicalBrowserUrl(normalizedLocal, pushUrl);
      setIsLoadingTutorProfile(false);
      setSelectedTutorProfile(normalizedLocal);
      setActiveView('tutor-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const lookupKey = normalizedLocal.slug || normalizedLocal.id;
      void apiFetch(`/api/tutors/${encodeURIComponent(lookupKey)}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json().catch(() => null);
          if (data?.tutor) {
            const enriched = store.upsertTutorPreview(data.tutor);
            setSelectedTutorProfile((prev) => (prev && prev.id === enriched.id ? enriched : prev));
            syncCanonicalBrowserUrl(enriched, false);
          }
        })
        .catch(() => {});
      return;
    }

    setIsLoadingTutorProfile(true);
    setActiveView('tutor-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await apiFetch(`/api/tutors/${encodeURIComponent(cleanParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.tutor) {
          const normalized = store.upsertTutorPreview(data.tutor);
          setSelectedTutorProfile(normalized);
          setIsLoadingTutorProfile(false);
          setActiveView('tutor-profile');
          syncCanonicalBrowserUrl(normalized, pushUrl);
          return;
        }
      }
    } catch {
      // Try client fallback catalog below before redirecting
    }

    try {
      const fallbackPool = await store.loadTrendingTutorsFallback();
      const fallbackMatch = findInList(fallbackPool);
      if (fallbackMatch) {
        const normalizedFallback = store.upsertTutorPreview(fallbackMatch);
        setSelectedTutorProfile(normalizedFallback);
        setIsLoadingTutorProfile(false);
        setActiveView('tutor-profile');
        syncCanonicalBrowserUrl(normalizedFallback, pushUrl);
        return;
      }
    } catch {
      // Ignore fallback error
    }

    setIsLoadingTutorProfile(false);
    setSelectedTutorProfile(null);
    setActiveView('tutors-directory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    let path = '/' + view;
    const activeUser = store.currentUser || storeState.currentUser;

    if (view.startsWith('location:')) {
      const loc = view.replace('location:', '');
      setLocationFilter(loc);
      setSubjectFilter('');
      setSelectedTutorProfile(null);
      setActiveView('tutors-directory');
      path = '/tutors-directory?location=' + encodeURIComponent(loc);
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('subject:')) {
      const subj = view.replace('subject:', '');
      setSubjectFilter(subj);
      setLocationFilter('');
      setSelectedTutorProfile(null);
      setActiveView('tutors-directory');
      path = '/tutors-directory?subject=' + encodeURIComponent(subj);
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('country-tutoring:')) {
      const slug = view.replace('country-tutoring:', '').toLowerCase().trim();
      setActiveCountryTutoringSlug(slug);
      setSelectedTutorProfile(null);
      setActiveView('country-online-tutoring');
      path = '/online-tutoring-' + slug;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('online-tutoring-')) {
      const slug = view.replace('online-tutoring-', '').toLowerCase().trim();
      setActiveCountryTutoringSlug(slug);
      setSelectedTutorProfile(null);
      setActiveView('country-online-tutoring');
      path = '/' + view;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const dedicatedService = resolveDedicatedServiceRoute(view);
    if (dedicatedService) {
      setSelectedTutorProfile(null);
      setActiveView(dedicatedService.view);
      path = dedicatedService.path;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'tools' || view === '/tools') {
      setSelectedTutorProfile(null);
      setActiveView('tools');
      window.history.pushState(null, '', '/tools');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const matchedMathView = matchMathRouteView(view);
    if (matchedMathView) {
      setSelectedTutorProfile(null);
      setActiveView(matchedMathView);
      window.history.pushState(null, '', '/' + matchedMathView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const matchedScienceView = matchScienceRouteView(view);
    if (matchedScienceView) {
      setSelectedTutorProfile(null);
      setActiveView(matchedScienceView);
      window.history.pushState(null, '', '/' + matchedScienceView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const matchedTool = matchStudentToolRoute(view);
    if (matchedTool) {
      setSelectedTutorProfile(null);
      setActiveView(matchedTool.viewKey);
      window.history.pushState(null, '', matchedTool.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isSpecializedServiceSlug(view)) {
      const cleanSlug = view.replace(/^\//, '').toLowerCase().trim();
      setActiveSpecializedServiceSlug(cleanSlug);
      setSelectedTutorProfile(null);
      setActiveView('specialized-service');
      path = '/' + cleanSlug;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      view === 'tutors' ||
      view === '/tutors' ||
      view === 'tutors-directory' ||
      view === '/tutors-directory' ||
      view === 'find-a-tutor' ||
      view === '/find-a-tutor'
    ) {
      setSelectedTutorProfile(null);
      setLocationFilter('');
      setSubjectFilter('');
      void store.ensureFullDirectoryLoaded();
      setActiveView('tutors-directory');
      path = '/tutors';
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      view.startsWith('tutor-profile:') ||
      view.startsWith('/tutor-profile/') ||
      (view.startsWith('/tutor/') && view !== '/tutor/dashboard') ||
      (view.startsWith('/tutors/') && view !== '/tutors-directory')
    ) {
      const tutorId = decodeURIComponent(
        view
          .replace(/^tutor-profile:/i, '')
          .replace(/^\/tutor-profile\//i, '')
          .replace(/^\/tutors\//i, '')
          .replace(/^\/tutor\//i, '')
          .split('?')[0]
          .split('#')[0]
          .trim()
      );
      if (tutorId) {
        void openTutorProfileById(tutorId, true);
        return;
      }
    }

    if (view.startsWith('book-tutor:')) {
      const tutorId = decodeURIComponent(view.replace('book-tutor:', '').trim());
      if (tutorId) {
        handleOpenChat(
          tutorId,
          'Hi! I found your profile on University-Tutors.com and would like to book a 1-on-1 tutoring session.'
        );
        return;
      }
    }

    if (view.startsWith('search-tutors:')) {
      const q = decodeURIComponent(view.replace('search-tutors:', ''));
      setSelectedTutorProfile(null);
      setSubjectFilter(q);
      setLocationFilter('');
      setActiveView('tutors-directory');
      path = '/tutors?q=' + encodeURIComponent(q);
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'sop') {
      setIsSopModalOpen(true);
      return;
    }

    if (view === 'user-data' || view === 'users-data' || view === 'user data') {
      if (
        !storeState.currentUser ||
        (storeState.currentUser.role !== UserRole.ADMIN && storeState.currentUser.role !== UserRole.SUBADMIN)
      ) {
        setActiveView('admin-login');
        window.history.pushState(null, '', '/admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setSelectedTutorProfile(null);
      setActiveView('user-data');
      path = '/user-data';
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      view === 'data-deletion' ||
      view === 'data-deletion-instructions' ||
      view === 'user-data-deletion' ||
      view === 'data deletion'
    ) {
      setSelectedTutorProfile(null);
      setActiveView('data-deletion');
      path = '/data-deletion';
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      view.startsWith('blog/') ||
      view.startsWith('/blog/') ||
      view.startsWith('our-blog/') ||
      view.startsWith('/our-blog/')
    ) {
      const cleanBlogSlug = decodeURIComponent(
        view
          .replace(/^\/?(blog|our-blog)\//i, '')
          .split('?')[0]
          .split('#')[0]
          .trim()
      ).toLowerCase();
      if (cleanBlogSlug) {
        setSelectedTutorProfile(null);
        void store.ensureCatalogDataLoaded();
        window.history.pushState(null, '', `/blog/${encodeURIComponent(cleanBlogSlug)}`);
        setActiveView(`blog/${cleanBlogSlug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (view === 'home' || view === '') {
      path = '/';
    } else if (view === 'how-it-works' || view === '/how-it-works') {
      window.history.pushState(null, '', '/how-it-works');
      setActiveView('home');
      setTimeout(() => {
        document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    } else if (view === 'about' || view === 'about-us') {
      view = 'about';
      path = '/about';
    } else if (
      view === 'get-a-quote' ||
      view === 'get-quote' ||
      view === '/get-quote' ||
      view === 'pricing' ||
      view === '/pricing'
    ) {
      const isPricing = view === 'pricing' || view === '/pricing';
      view = 'get-a-quote';
      path = isPricing ? '/pricing' : '/get-a-quote';
    } else if (view === 'services') {
      path = '/services';
    } else if (view === 'faqs') {
      path = '/faqs';
    } else if (view === 'contact' || view === 'contact-us') {
      view = 'contact';
      path = '/contact';
    } else if (view === 'blog' || view === 'our-blog') {
      view = 'blog';
      path = '/blog';
    } else if (view === 'whatsapp') {
      path = '/whatsapp';
    } else if (view === 'privacy') {
      path = '/privacy';
    } else if (view === 'terms') {
      path = '/terms';
    } else if (view === 'google-disclosure' || view === '/google-disclosure') {
      view = 'google-disclosure';
      path = '/google-disclosure';
    } else if (view === 'auth') {
      path = '/auth';
    } else if (view === 'admin-login') {
      path = '/admin';
    } else if (
      view === 'student/chat' ||
      view === '/student/chat' ||
      view === 'chat' ||
      view === '/chat' ||
      view === 'chats' ||
      view === '/chats'
    ) {
      path = '/student/chat';
      if (!activeUser) {
        view = 'auth';
        path = '/auth';
      } else {
        view = 'dashboard';
      }
    } else if (view === 'student/dashboard' || view === 'student') {
      path = '/student/dashboard';
      if (!activeUser) {
        view = 'auth';
        path = '/auth';
      } else {
        view = 'dashboard';
      }
    } else if (view === 'tutor/dashboard' || view === 'tutor') {
      path = '/tutor/dashboard';
      if (!activeUser) {
        view = 'auth';
        path = '/auth';
      } else {
        view = 'dashboard';
      }
    } else if (view === 'admin' || view.startsWith('admin/') || view.startsWith('/admin')) {
      const normalizedAdminPath =
        view === 'admin' || view === '/admin'
          ? '/admin'
          : view.startsWith('/')
            ? view
            : `/${view}`;
      path = normalizedAdminPath;
      if (!activeUser) {
        view = 'admin-login';
        setAdminRoutePath(normalizedAdminPath);
      } else if (isStaffUser(activeUser)) {
        view = 'dashboard';
        setAdminRoutePath(normalizedAdminPath);
      } else if (activeUser.role === UserRole.TUTOR) {
        view = 'dashboard';
        path = '/tutor/dashboard';
      } else {
        view = 'dashboard';
        path = '/student/dashboard';
      }
    } else if (view === 'dashboard') {
      if (activeUser) {
        if (activeUser.role === UserRole.STUDENT) {
          path = '/student/dashboard';
        } else if (activeUser.role === UserRole.TUTOR) {
          path = '/tutor/dashboard';
        } else if (isStaffUser(activeUser)) {
          path = adminRoutePath && adminRoutePath.startsWith('/admin') ? adminRoutePath : '/admin';
        }
      } else {
        path = '/auth';
        view = 'auth';
      }
    }

    if (
      view === 'tutors' ||
      view === 'tutors-directory' ||
      view === 'user-data' ||
      view === 'get-a-quote' ||
      view.startsWith('online-tutoring-')
    ) {
      void store.ensureFullDirectoryLoaded();
    } else if (
      view === 'blog' ||
      view.startsWith('blog/') ||
      view.startsWith('blog-') ||
      view === 'services' ||
      view === 'about'
    ) {
      void store.ensureCatalogDataLoaded();
    }

    window.history.pushState(null, '', path);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleUrlChange = async () => {
      const rawPath = window.location.pathname;
      const decodedPath = decodeURIComponent(rawPath).toLowerCase().trim().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().trim();

      if (
        decodedPath === '/get-a-quote' ||
        decodedPath === '/get-quote' ||
        decodedPath === '/get a quote' ||
        decodedPath === '/getaquote' ||
        decodedPath === '/pricing' ||
        hash === '#get-a-quote' ||
        hash === '#get-quote' ||
        hash === '#get a quote' ||
        hash === '#pricing'
      ) {
        void store.ensureFullDirectoryLoaded();
        setActiveView('get-a-quote');
      } else if (decodedPath === '/how-it-works' || hash === '#how-it-works') {
        setActiveView('home');
        setTimeout(() => {
          document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 180);
      } else if (decodedPath === '/tools' || hash === '#tools') {
        setSelectedTutorProfile(null);
        setActiveView('tools');
      } else if (matchMathRouteView(decodedPath) || matchMathRouteView(hash)) {
        const mView = (matchMathRouteView(decodedPath) || matchMathRouteView(hash))!;
        setSelectedTutorProfile(null);
        setActiveView(mView);
      } else if (matchScienceRouteView(decodedPath) || matchScienceRouteView(hash)) {
        const sciView = (matchScienceRouteView(decodedPath) || matchScienceRouteView(hash))!;
        setSelectedTutorProfile(null);
        setActiveView(sciView);
      } else if (
        (decodedPath.startsWith('/tools/') && matchStudentToolRoute(decodedPath)) ||
        (hash.startsWith('#tools/') && matchStudentToolRoute(hash))
      ) {
        const matched = (matchStudentToolRoute(decodedPath) || matchStudentToolRoute(hash))!;
        setSelectedTutorProfile(null);
        setActiveView(matched.viewKey);
      } else if (resolveDedicatedServiceRoute(decodedPath) || resolveDedicatedServiceRoute(hash)) {
        const matchedService = (resolveDedicatedServiceRoute(decodedPath) || resolveDedicatedServiceRoute(hash))!;
        setSelectedTutorProfile(null);
        setActiveView(matchedService.view);
      } else if (decodedPath === '/services' || hash === '#services') {
        void store.ensureCatalogDataLoaded();
        setSelectedTutorProfile(null);
        setActiveView('services');
      } else if (
        decodedPath === '/student' ||
        hash === '#student' ||
        decodedPath === '/student/dashboard' ||
        hash === '#student/dashboard' ||
        decodedPath === '/student/chat' ||
        hash === '#student/chat' ||
        decodedPath === '/chat' ||
        hash === '#chat' ||
        decodedPath === '/chats' ||
        hash === '#chats'
      ) {
        if (!store.isSessionInitialized) {
          await store.sessionReadyPromise;
        }
        if (!store.currentUser) {
          setActiveView('auth');
          window.history.replaceState(null, '', '/auth');
        } else if (store.currentUser.role === UserRole.STUDENT) {
          setActiveView('dashboard');
        } else if (store.currentUser.role === UserRole.TUTOR) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/tutor/dashboard');
        } else if (isStaffUser(store.currentUser)) {
          setAdminRoutePath('/admin');
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/admin');
        }
      } else if (
        decodedPath === '/tutor' ||
        hash === '#tutor' ||
        decodedPath === '/tutor/dashboard' ||
        hash === '#tutor/dashboard'
      ) {
        if (!store.isSessionInitialized) {
          await store.sessionReadyPromise;
        }
        if (!store.currentUser) {
          setActiveView('auth');
          window.history.replaceState(null, '', '/auth');
        } else if (store.currentUser.role === UserRole.TUTOR) {
          setActiveView('dashboard');
        } else if (store.currentUser.role === UserRole.STUDENT) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/student/dashboard');
        } else if (isStaffUser(store.currentUser)) {
          setAdminRoutePath('/admin');
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/admin');
        }
      } else if (decodedPath === '/admin-login' || hash === '#admin-login') {
        setAdminRoutePath('/admin');
        setActiveView('admin-login');
      } else if (
        decodedPath === '/admin' ||
        decodedPath.startsWith('/admin/') ||
        hash === '#admin' ||
        hash.startsWith('#admin/')
      ) {
        const searchParams = new URLSearchParams(window.location.search || '');
        if (searchParams.get('reset_token') || searchParams.get('token')) {
          setAdminRoutePath('/admin');
          setActiveView('admin-login');
          return;
        }
        if (!store.isSessionInitialized) {
          await store.sessionReadyPromise;
        }
        const targetAdminPath = decodedPath.startsWith('/admin')
          ? rawPath.replace(/\/+$/, '') || '/admin'
          : hash.replace(/^#/, '/').replace(/\/+$/, '') || '/admin';
        if (isStaffUser(store.currentUser)) {
          setAdminRoutePath(targetAdminPath);
          setActiveView('dashboard');
        } else if (store.currentUser && store.currentUser.role === UserRole.STUDENT) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/student/dashboard');
        } else if (store.currentUser && store.currentUser.role === UserRole.TUTOR) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/tutor/dashboard');
        } else {
          setAdminRoutePath(targetAdminPath);
          setActiveView('admin-login');
        }
      } else if (
        decodedPath === '/about-us' ||
        decodedPath === '/about us' ||
        decodedPath === '/about' ||
        hash === '#about' ||
        hash === '#about-us' ||
        hash === '#about us'
      ) {
        void store.ensureCatalogDataLoaded();
        setActiveView('about');
      } else if (decodedPath === '/faqs' || decodedPath === '/faq' || hash === '#faqs' || hash === '#faq') {
        setActiveView('faqs');
      } else if (
        decodedPath === '/contact' ||
        decodedPath === '/contact-us' ||
        decodedPath === '/contact us' ||
        hash === '#contact' ||
        hash === '#contact us'
      ) {
        setActiveView('contact');
      } else if (
        decodedPath === '/our-blog' ||
        decodedPath === '/our blog' ||
        decodedPath === '/blog' ||
        hash === '#blog' ||
        hash === '#our-blog' ||
        hash === '#our blog'
      ) {
        void store.ensureCatalogDataLoaded();
        setActiveView('blog');
      } else if (
        decodedPath.startsWith('/blog/') ||
        decodedPath.startsWith('/our-blog/') ||
        hash.startsWith('#blog/')
      ) {
        const rawSlug = decodedPath.startsWith('/blog/')
          ? decodedPath.slice('/blog/'.length)
          : decodedPath.startsWith('/our-blog/')
            ? decodedPath.slice('/our-blog/'.length)
            : hash.slice('#blog/'.length);
        const cleanSlug = rawSlug.split('?')[0].split('#')[0].trim();
        void store.ensureCatalogDataLoaded();
        setSelectedTutorProfile(null);
        setActiveView(cleanSlug ? `blog/${cleanSlug}` : 'blog');
      } else if (decodedPath === '/whatsapp' || decodedPath === '/whatsapp-desk' || hash === '#whatsapp') {
        setActiveView('whatsapp');
      } else if (decodedPath === '/privacy' || hash === '#privacy') {
        setActiveView('privacy');
      } else if (decodedPath === '/terms' || hash === '#terms') {
        setActiveView('terms');
      } else if (
        decodedPath === '/google-disclosure' ||
        decodedPath === '/google-oauth-disclosure' ||
        hash === '#google-disclosure'
      ) {
        setSelectedTutorProfile(null);
        setActiveView('google-disclosure');
      } else if (decodedPath === '/auth' || decodedPath === '/reset-password' || hash === '#auth' || hash === '#reset-password') {
        setActiveView('auth');
      } else if (decodedPath.startsWith('/online-tutoring-') || hash.startsWith('#online-tutoring-')) {
        const fullKey = decodedPath.startsWith('/online-tutoring-')
          ? decodedPath.replace('/online-tutoring-', '')
          : hash.replace('#online-tutoring-', '');
        const cleanKey = fullKey.split('?')[0].split('#')[0].trim();
        void store.ensureFullDirectoryLoaded();
        setActiveCountryTutoringSlug(cleanKey || 'usa');
        setActiveView('country-online-tutoring');
      } else if (isSpecializedServiceSlug(decodedPath) || isSpecializedServiceSlug(hash)) {
        const rawSlug = decodedPath.startsWith('/')
          ? decodedPath.slice(1)
          : hash.startsWith('#')
            ? hash.slice(1)
            : decodedPath;
        const cleanSlug = rawSlug.split('?')[0].split('#')[0].trim();
        setActiveSpecializedServiceSlug(cleanSlug || 'assignment-guidance');
        setActiveView('specialized-service');
      } else if (
        decodedPath === '/tutors' ||
        decodedPath === '/tutors-directory' ||
        decodedPath === '/tutors directory' ||
        decodedPath === '/find-a-tutor' ||
        hash === '#tutors' ||
        hash === '#tutors-directory' ||
        hash === '#find-a-tutor'
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        const loc = urlParams.get('location') || urlParams.get('country') || '';
        const subj = urlParams.get('subject') || urlParams.get('q') || urlParams.get('search') || '';
        setLocationFilter(loc);
        setSubjectFilter(subj);
        setSelectedTutorProfile(null);
        void store.ensureFullDirectoryLoaded();
        setActiveView('tutors-directory');
      } else if (
        decodedPath === '/user-data' ||
        decodedPath === '/users-data' ||
        decodedPath === '/user data' ||
        hash === '#user-data' ||
        hash === '#users-data' ||
        hash === '#user data'
      ) {
        if (!store.isSessionInitialized) {
          await store.sessionReadyPromise;
        }
        if (!store.currentUser || !isStaffUser(store.currentUser)) {
          setActiveView('admin-login');
          window.history.replaceState(null, '', '/admin');
        } else if (!hasModulePermission(store.currentUser, 'tutors')) {
          setAdminRoutePath('/admin/user-data');
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/admin/user-data');
        } else {
          setSelectedTutorProfile(null);
          setActiveView('user-data');
        }
      } else if (
        decodedPath === '/data-deletion' ||
        decodedPath === '/data-deletion-instructions' ||
        decodedPath === '/user-data-deletion' ||
        decodedPath === '/data deletion' ||
        decodedPath === '/datadeletion' ||
        hash === '#data-deletion' ||
        hash === '#data-deletion-instructions' ||
        hash === '#user-data-deletion'
      ) {
        setSelectedTutorProfile(null);
        setActiveView('data-deletion');
      } else if (
        decodedPath === '/sop' ||
        decodedPath === '/sop-guide' ||
        decodedPath === '/sop guide' ||
        hash === '#sop' ||
        hash === '#sop-guide'
      ) {
        setIsSopModalOpen(true);
      } else if (
        (decodedPath.startsWith('/tutor/') && decodedPath !== '/tutor/dashboard') ||
        (decodedPath.startsWith('/tutors/') && decodedPath !== '/tutors-directory') ||
        decodedPath.startsWith('/tutor-profile/')
      ) {
        const rawSegments = rawPath.split('/').filter(Boolean);
        const rawId = rawSegments.length >= 2 ? decodeURIComponent(rawSegments[1]) : '';
        if (rawId) {
          void openTutorProfileById(rawId, false);
        }
      } else if (decodedPath === '' || decodedPath === '/' || decodedPath === '/home' || hash === '#home') {
        setActiveView('home');
      }
    };

    void handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    const handleGlobalClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (anchor) {
        if (anchor.target && anchor.target !== '_self') return;
        let href = anchor.getAttribute('href');
        if (!href) return;
        href = decodeURIComponent(href).toLowerCase().trim();

        if (
          href === '/get-a-quote' ||
          href === '/get-quote' ||
          href === '/get a quote' ||
          href === '/pricing' ||
          href === '#get-a-quote' ||
          href === '#get-quote' ||
          href === '#get a quote' ||
          href === '#pricing'
        ) {
          e.preventDefault();
          handleNavigate('get-a-quote');
        } else if (href === '/how-it-works' || href === '#how-it-works') {
          e.preventDefault();
          handleNavigate('how-it-works');
        } else if (href === '/tools' || href === '#tools') {
          e.preventDefault();
          handleNavigate('tools');
        } else if (
          (href.startsWith('/tools/math') || href.startsWith('#tools/math') || href.includes('university-tutors.com/tools/math')) &&
          matchMathRouteView(href)
        ) {
          e.preventDefault();
          handleNavigate(matchMathRouteView(href)!);
        } else if (
          (href.startsWith('/tools/') || href.startsWith('#tools/') || href.includes('university-tutors.com/tools/')) &&
          matchScienceRouteView(href)
        ) {
          e.preventDefault();
          handleNavigate(matchScienceRouteView(href)!);
        } else if (
          (href.startsWith('/tools/') || href.startsWith('#tools/') || href.includes('university-tutors.com/tools/')) &&
          matchStudentToolRoute(href)
        ) {
          e.preventDefault();
          handleNavigate(matchStudentToolRoute(href)!.viewKey);
        } else if (href === '/services' || href === '#services') {
          e.preventDefault();
          handleNavigate('services');
        } else if (
          href === '/about-us' ||
          href === '/about us' ||
          href === '/about' ||
          href === '#about' ||
          href === '#about-us' ||
          href === '#about us'
        ) {
          e.preventDefault();
          handleNavigate('about');
        } else if (href === '/faqs' || href === '/faq' || href === '#faqs' || href === '#faq') {
          e.preventDefault();
          handleNavigate('faqs');
        } else if (
          href === '/contact' ||
          href === '/contact-us' ||
          href === '/contact us' ||
          href === '#contact' ||
          href === '#contact us'
        ) {
          e.preventDefault();
          handleNavigate('contact');
        } else if (
          href === '/our-blog' ||
          href === '/our blog' ||
          href === '/blog' ||
          href === '#blog' ||
          href === '#our-blog' ||
          href === '#our blog'
        ) {
          e.preventDefault();
          handleNavigate('blog');
        } else if (
          href.startsWith('/blog/') ||
          href.startsWith('/our-blog/') ||
          href.includes('university-tutors.com/blog/')
        ) {
          e.preventDefault();
          const cleanPath = href.split('university-tutors.com').pop() || href;
          const cleanSlug = cleanPath
            .replace(/^\/?(blog|our-blog)\//, '')
            .split('?')[0]
            .split('#')[0]
            .trim();
          handleNavigate(cleanSlug ? `blog/${cleanSlug}` : 'blog');
        } else if (href === '/google-disclosure' || href === '#google-disclosure') {
          e.preventDefault();
          handleNavigate('google-disclosure');
        } else if (href === '/privacy' || href === '#privacy') {
          e.preventDefault();
          handleNavigate('privacy');
        } else if (href === '/terms' || href === '#terms') {
          e.preventDefault();
          handleNavigate('terms');
        } else if (
          href === '/data-deletion' ||
          href === '/data-deletion-instructions' ||
          href === '/user-data-deletion' ||
          href === '#data-deletion'
        ) {
          e.preventDefault();
          handleNavigate('data-deletion');
        } else if (href === '/whatsapp' || href === '#whatsapp' || href.endsWith('/whatsapp')) {
          e.preventDefault();
          handleNavigate('whatsapp');
        } else if (
          href.startsWith('/online-tutoring-') ||
          href.startsWith('#online-tutoring-') ||
          href.includes('university-tutors.com/online-tutoring-')
        ) {
          e.preventDefault();
          const cleanPath = href.split('university-tutors.com').pop() || href;
          const slug = cleanPath
            .replace(/^\/?(online-tutoring-|#online-tutoring-)/, '')
            .replace(/^\//, '')
            .replace('online-tutoring-', '')
            .split('?')[0]
            .split('#')[0]
            .trim();
          handleNavigate(`online-tutoring-${slug}`);
        } else if (
          href === '/assignment-guidance' ||
          href.startsWith('/assignment-guidance-') ||
          href.startsWith('#assignment-guidance') ||
          href === '/coursework-tutoring' ||
          href.startsWith('/coursework-tutoring-') ||
          href.startsWith('#coursework-tutoring') ||
          href === '/writing-tutoring' ||
          href.startsWith('/writing-tutoring-') ||
          href.startsWith('#writing-tutoring') ||
          href.includes('university-tutors.com/assignment-guidance') ||
          href.includes('university-tutors.com/coursework-tutoring') ||
          href.includes('university-tutors.com/writing-tutoring')
        ) {
          e.preventDefault();
          const cleanPath = href.split('university-tutors.com').pop() || href;
          const slug = cleanPath
            .replace(/^\/?#?/, '')
            .split('?')[0]
            .split('#')[0]
            .trim();
          handleNavigate(slug);
        } else if (
          href === '/tutors' ||
          href === '/tutors-directory' ||
          href === '/find-a-tutor' ||
          href === '#tutors' ||
          href === '#tutors-directory' ||
          href === '#find-a-tutor' ||
          href.endsWith('/tutors') ||
          href.endsWith('/find-a-tutor')
        ) {
          e.preventDefault();
          handleNavigate('tutors');
        } else if (href === '/home' || href === '/' || href === '#home') {
          e.preventDefault();
          handleNavigate('home');
        } else if (href === '/admin' || href === '#admin') {
          e.preventDefault();
          if (store.currentUser && store.currentUser.role === UserRole.ADMIN) {
            window.history.pushState(null, '', '/admin');
            setActiveView('dashboard');
          } else {
            window.history.pushState(null, '', '/admin');
            setActiveView('admin-login');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '/student' || href === '#student' || href === '/tutor' || href === '#tutor') {
          e.preventDefault();
          if (store.currentUser) {
            const rolePath = store.currentUser.role === UserRole.TUTOR ? '/tutor' : '/student';
            window.history.pushState(null, '', rolePath);
            setActiveView('dashboard');
          } else {
            window.history.pushState(null, '', '/auth');
            setActiveView('auth');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (
          (href.startsWith('/tutor/') && href !== '/tutor/dashboard') ||
          (href.startsWith('/tutors/') && href !== '/tutors-directory') ||
          href.startsWith('/tutor-profile/')
        ) {
          e.preventDefault();
          const rawHref = anchor.getAttribute('href') || href;
          const cleanId = decodeURIComponent(
            rawHref
              .replace(/^\/?(tutor-profile|tutors|tutor)\//i, '')
              .split('?')[0]
              .split('#')[0]
              .trim()
          );
          if (cleanId) {
            void openTutorProfileById(cleanId, true);
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const handleLogin = async (
    email: string,
    password?: string,
    options?: { adminPortal?: boolean }
  ): Promise<boolean> => {
    const success = await store.login(email, password, options);
    if (success) {
      const user = store.currentUser;
      setStoreState((prev) => ({ ...prev, currentUser: user, users: store.users }));
      const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const preservedAdminPath =
        isStaffUser(user) && currentPathname.toLowerCase().startsWith('/admin/')
          ? currentPathname
          : '/admin';
      const rolePath =
        user?.role === UserRole.TUTOR
          ? '/tutor/dashboard'
          : isStaffUser(user)
            ? preservedAdminPath
            : '/student/dashboard';
      if (isStaffUser(user)) {
        setAdminRoutePath(preservedAdminPath);
      }
      window.history.pushState(null, '', rolePath);
      setActiveView('dashboard');
    }
    return success;
  };

  const handleRegister = async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
    const success = await store.register(name, email, role, extra);
    if (success) {
      const activeUser = store.currentUser;
      setStoreState((prev) => ({ ...prev, currentUser: activeUser, users: store.users }));
      const path =
        (activeUser?.role || role) === UserRole.STUDENT
          ? '/student/dashboard'
          : (activeUser?.role || role) === UserRole.TUTOR
            ? '/tutor/dashboard'
            : '/admin';
      window.history.pushState(null, '', path);
      setActiveView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return success;
  };

  const handleLogout = async () => {
    await store.logout();
    setActiveChat(null);
    handleNavigate('home');
  };

  const handleQuickLogin = (_role: UserRole) => {
    console.log('Quick switcher is disabled to protect real secure user accounts.');
  };

  const handleOpenChat = (tutorId: string, initialMessage?: string, openFloatingModal = true): Chat | undefined => {
    const activeUser = store.currentUser || storeState.currentUser;
    if (!activeUser) {
      setActiveView('auth');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return undefined;
    }
    const chat = store.getOrCreateChat(activeUser.id, tutorId, 'Direct Consultation');
    if (initialMessage) {
      void store.sendMessage(chat.id, activeUser.id, initialMessage);
    }
    if (openFloatingModal) {
      setActiveChat(chat);
    }
    return chat;
  };

  const liveChat = activeChat ? storeState.chats.find((c) => c.id === activeChat.id) || activeChat : null;

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
  }, []);

  const handleRefreshData = useCallback(() => {
    return store.fetchData();
  }, []);

  const handleSendMessage = useCallback(
    (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => {
      void import('./utils/audioNotification').then((mod) => {
        mod.audioNotifier.playSentSound();
      });
      return store.sendMessage(chatId, senderId, content, fileUrl, fileName);
    },
    []
  );

  const handleMarkMessagesAsRead = useCallback((chatId: string, userId: string) => {
    store.markMessagesAsRead(chatId, userId);
  }, []);

  const handleSetTypingStatus = useCallback((chatId: string, role: UserRole, isTyping: boolean) => {
    store.setTypingStatus(chatId, role, isTyping);
  }, []);

  const handleOfferQuote = useCallback(
    (
      chatId: string,
      amount: number,
      estimatedHours: number,
      serviceType?: string,
      deliveryTime?: string,
      scopeOfWork?: string,
      advancePercentage?: number,
      advanceAmount?: number,
      balanceAmount?: number
    ) => {
      void store.offerQuote(
        chatId,
        amount,
        estimatedHours,
        serviceType,
        deliveryTime,
        scopeOfWork,
        advancePercentage,
        advanceAmount,
        balanceAmount
      );
    },
    []
  );

  const handleAcceptQuote = useCallback((quoteId: string) => {
    void store.acceptQuote(quoteId);
  }, []);

  const mentorsList = useMemo(
    () =>
      storeState.users.filter(
        (u) =>
          u.role === UserRole.TUTOR &&
          (u.isApproved === true || u.status === 'approved' || (u.isApproved === undefined && u.status === undefined))
      ),
    [storeState.users]
  );
  const studentsList = useMemo(
    () => storeState.users.filter((u) => u.role === UserRole.STUDENT),
    [storeState.users]
  );

  const handleAssignmentSubmit = async (data: any) => {
    const assignId = await store.submitAssignment(data);
    setIsAssignModalOpen(false);

    let targetTutorId = data.tutorId;
    if (!targetTutorId) {
      const match = mentorsList.find((u) =>
        u.subjects?.some((s) => s.toLowerCase().includes(data.subject?.toLowerCase()))
      );
      targetTutorId = match ? match.id : mentorsList[0]?.id || 'tutor_clara';
    }
    if (!data.tutorId && targetTutorId) {
      void store.assignTutorToAssignment(assignId, targetTutorId);
    }

    const matchedTutor = storeState.users.find((u) => u.id === targetTutorId);
    void store.addNotification({
      userId: storeState.currentUser?.id || 'all',
      title: 'Tutor Matched Successfully',
      message: `Your assignment "${data.title}" was paired with ${
        matchedTutor?.name || 'an expert tutor'
      }. You can now communicate directly via Tutor Chat!`,
      type: 'webapp',
      sentBy: 'System',
    });

    handleOpenChat(
      targetTutorId,
      `Hi ${matchedTutor?.name || 'Tutor'}, I just submitted an assignment brief titled "${data.title}" (Ref: #${assignId}). Looking forward to collaborating!`
    );
  };

  const handleOnCallConsultInput = useCallback((msg: string) => {
    const current = store.currentUser;
    if (current) {
      const chat = store.getOrCreateChat(current.id, 'tutor_clara', 'General Inquiry');
      void store.sendMessage(chat.id, current.id, msg);
      setActiveChat(chat);
    } else {
      setActiveView('auth');
    }
  }, []);

  const handleOpenBecomeTutor = useCallback(() => {
    setIsBecomeTutorOpen(true);
  }, []);

  const handleMarketingTutorSelect = useCallback((tutorObj: User) => {
    const current = store.currentUser;
    if (!current) {
      setActiveView('auth');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const chat = store.getOrCreateChat(current.id, tutorObj.id, 'Direct Consultation');
    setActiveChat(chat);
  }, []);

  const handleSelectTutorProfile = useCallback((tutorObj: User) => {
    const normalized = store.upsertTutorPreview(tutorObj);
    const initialSlug = getTutorCanonicalSlug(normalized, store.getTutorSlugMap());
    setIsLoadingTutorProfile(false);
    setSelectedTutorProfile(normalized);
    setActiveView('tutor-profile');
    if (typeof window !== 'undefined' && initialSlug) {
      window.history.pushState(null, '', `/tutor/${encodeURIComponent(initialSlug)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const lookupKey = normalized?.slug || normalized?.id;
    if (lookupKey) {
      void apiFetch(`/api/tutors/${encodeURIComponent(lookupKey)}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json().catch(() => null);
          if (data?.tutor) {
            const enriched = store.upsertTutorPreview(data.tutor);
            setSelectedTutorProfile((prev) => (prev && prev.id === enriched.id ? enriched : prev));
            const authoritativeSlug = getTutorCanonicalSlug(enriched, store.getTutorSlugMap());
            if (typeof window !== 'undefined' && authoritativeSlug) {
              const canonicalTarget = `/tutor/${encodeURIComponent(authoritativeSlug)}`;
              if (window.location.pathname !== canonicalTarget) {
                window.history.replaceState(null, '', canonicalTarget);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 relative overflow-x-clip" id="university-tutors-root">
      {/* Decorative ambient gradients for depth */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
      <div className="absolute top-1/3 -left-24 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>

      {/* Session Expiry Notification Banner (Fixed overlay so appearing never shifts Header or layout) */}
      {storeState.sessionExpiredMessage && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3 z-[60] shadow-md"
        >
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{storeState.sessionExpiredMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                store.clearSessionExpiredMessage();
                handleNavigate('auth');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3.5 py-2 min-h-[44px] rounded-lg cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => store.clearSessionExpiredMessage()}
              className="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-amber-700 hover:text-amber-950 cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header */}
      {!(activeView === 'dashboard' && storeState.currentUser?.role === UserRole.STUDENT) && (
        <Header
          currentUser={storeState.currentUser}
          isSessionInitialized={storeState.isSessionInitialized}
          activeView={activeView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onQuickLogin={handleQuickLogin}
          studentsOnline={storeState.activeStudentsOnline}
          onOpenBecomeTutor={handleOpenBecomeTutor}
        />
      )}

      {/* Main viewport displays */}
      <main className="flex-1">
        <ErrorBoundary resetKey={activeView} onReset={handleRefreshData}>
          <Suspense
            fallback={
              <div
                className="min-h-[92vh] flex flex-col items-center justify-center py-24 gap-3 text-orange-600"
                id="view-suspense-loader"
              >
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-gray-400">Loading page...</span>
              </div>
            }
          >
            {activeView === 'auth' ? (
              <AuthPage onLogin={handleLogin} onRegister={handleRegister} onNavigate={handleNavigate} />
            ) : activeView === 'admin-login' ? (
              <AdminLoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
            ) : activeView === 'dashboard' ? (
              <DashboardPortal
                storeState={storeState}
                mentorsList={mentorsList}
                studentsList={studentsList}
                onOpenChat={handleOpenChat}
                onSelectChat={handleSelectChat}
                onSendMessage={handleSendMessage}
                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                onAcceptQuote={handleAcceptQuote}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                onRefreshData={handleRefreshData}
                onRequireAuth={() => setActiveView('auth')}
                onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
                onHideGlobalWhatsAppChange={setHideGlobalWhatsAppForStudentUi}
                adminRoutePath={adminRoutePath}
                onAdminRouteChange={(nextPath) => {
                  const cleanPath = nextPath.startsWith('/admin') ? nextPath : '/admin';
                  setAdminRoutePath(cleanPath);
                  if (typeof window !== 'undefined' && window.location.pathname !== cleanPath) {
                    window.history.pushState(null, '', cleanPath);
                  }
                }}
              />
            ) : activeView === 'get-a-quote' ? (
              <GetQuotePage
                currentUser={storeState.currentUser}
                onNavigate={handleNavigate}
                tutors={mentorsList}
                onOpenChat={handleOpenChat}
              />
            ) : activeView === 'tutor-profile' && selectedTutorProfile ? (
              <TutorProfilePage
                tutor={selectedTutorProfile}
                onNavigate={handleNavigate}
                onOpenChat={handleOpenChat}
                onSearchKeyword={(keyword) => {
                  setSubjectFilter(keyword);
                  setActiveView('tutors-directory');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBookSession={(tutor) => {
                  handleOpenChat(tutor.id);
                }}
              />
            ) : activeView === 'tutor-profile' && isLoadingTutorProfile ? (
              <div className="min-h-[75vh] flex flex-col items-center justify-center py-24 gap-3 text-orange-600">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-gray-500">Loading tutor profile...</span>
              </div>
            ) : activeView === 'country-online-tutoring' || activeView.startsWith('online-tutoring-') ? (
              <CountryOnlineTutoringPage
                countryKey={activeCountryTutoringSlug}
                tutors={mentorsList}
                onNavigate={handleNavigate}
                onSelectCountry={(slug) => {
                  setActiveCountryTutoringSlug(slug);
                  handleNavigate(`online-tutoring-${slug}`);
                }}
                onSelectTutorProfile={handleSelectTutorProfile}
                onOpenChat={handleOpenChat}
                onSearchCity={(city) => {
                  setLocationFilter(city);
                  setSubjectFilter('');
                  setSelectedTutorProfile(null);
                  setActiveView('tutors-directory');
                  window.history.pushState(null, '', '/tutors-directory?location=' + encodeURIComponent(city));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSearchSubject={(subj) => {
                  setSubjectFilter(subj);
                  setLocationFilter('');
                  setSelectedTutorProfile(null);
                  setActiveView('tutors-directory');
                  window.history.pushState(null, '', '/tutors-directory?subject=' + encodeURIComponent(subj));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : activeView === 'specialized-service' || isSpecializedServiceSlug(activeView) ? (
              <SpecializedServicePage
                pageSlug={activeSpecializedServiceSlug}
                tutors={mentorsList}
                onNavigate={handleNavigate}
                onSelectTutorProfile={handleSelectTutorProfile}
                onOpenChat={handleOpenChat}
                onSearchCity={(city) => {
                  setLocationFilter(city);
                  setSubjectFilter('');
                  setSelectedTutorProfile(null);
                  setActiveView('tutors-directory');
                  window.history.pushState(null, '', '/tutors-directory?location=' + encodeURIComponent(city));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSearchSubject={(subj) => {
                  setSubjectFilter(subj);
                  setLocationFilter('');
                  setSelectedTutorProfile(null);
                  setActiveView('tutors-directory');
                  window.history.pushState(null, '', '/tutors-directory?subject=' + encodeURIComponent(subj));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : activeView === 'tutors-directory' ? (
              <TutorsDirectoryPage
                locationFilter={locationFilter}
                subjectFilter={subjectFilter}
                onNavigate={handleNavigate}
                onSelectTutorProfile={handleSelectTutorProfile}
                onOpenChat={handleOpenChat}
                allStoreTutors={mentorsList}
              />
            ) : activeView === 'whatsapp' ? (
              <WhatsAppPage currentUser={storeState.currentUser} onNavigate={handleNavigate} />
            ) : activeView === 'user-data' ? (
              <UserDataPage
                users={storeState.users}
                currentUser={storeState.currentUser}
                onNavigate={handleNavigate}
                onSelectTutorProfile={handleSelectTutorProfile}
              />
            ) : activeView === 'data-deletion' ? (
              <DataDeletionPage currentUser={storeState.currentUser} onNavigate={handleNavigate} />
            ) : Boolean(matchMathRouteView(activeView)) ? (
              <MathToolsRouter
                activeView={activeView}
                onNavigate={handleNavigate}
                onOpenBecomeTutor={() => setIsBecomeTutorOpen(true)}
              />
            ) : Boolean(matchScienceRouteView(activeView)) ? (
              <ScienceToolsRouter
                activeView={activeView}
                onNavigate={handleNavigate}
                onOpenBecomeTutor={() => setIsBecomeTutorOpen(true)}
              />
            ) : activeView === 'tools' || Boolean(matchStudentToolSlug(activeView)) ? (
              <ToolsHub
                activeView={activeView}
                onNavigate={handleNavigate}
                onOpenBecomeTutor={() => setIsBecomeTutorOpen(true)}
              />
            ) : activeView === 'home' ? (
              <MarketingPages
                activeView={activeView}
                tutors={mentorsList}
                blogs={storeState.blogs}
                faqs={storeState.faqs}
                onNavigate={handleNavigate}
                onTutorSelect={handleMarketingTutorSelect}
                onSelectTutorProfile={handleSelectTutorProfile}
                onRaisedConsult={handleOnCallConsultInput}
              />
            ) : (
              <div id="marketing-pages-view" className="bg-white font-sans text-gray-800">
                <MarketingSubpages
                  activeView={activeView}
                  tutors={mentorsList}
                  blogs={storeState.blogs}
                  faqs={storeState.faqs}
                  onNavigate={handleNavigate}
                  onTutorSelect={handleMarketingTutorSelect}
                  onRaisedConsult={handleOnCallConsultInput}
                />
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Floating WhatsApp Instant Chat Trigger (Bottom Left) — deferred until post-load idle or user interaction */}
      {isIdleWidgetsReady &&
        !isWhatsAppModalOpen &&
        !liveChat &&
        !(activeView === 'dashboard' && hideGlobalWhatsAppForStudentUi) && (
        <Suspense fallback={null}>
          <FloatingWhatsAppButton onOpen={() => setIsWhatsAppModalOpen(true)} />
        </Suspense>
      )}

      {/* 2. Footer (lazy-loaded & viewport-gated below the fold) */}
      {activeView !== 'dashboard' &&
        activeView !== 'tools' &&
        !matchMathRouteView(activeView) &&
        !matchScienceRouteView(activeView) &&
        !matchStudentToolSlug(activeView) && (
          <div ref={footerSentinelRef}>
            {shouldRenderFooter ? (
              <Suspense
                fallback={
                  <footer
                    id="main-footer"
                    className="min-h-[1250px] lg:min-h-[1100px] bg-[#ffeedd] border-t-2 border-[#ffab85]"
                    aria-hidden="true"
                  />
                }
              >
                <FooterLocationsSubjects
                  onNavigateLocation={(loc) => handleNavigate(`location:${loc}`)}
                  onNavigateSubject={(subj) => handleNavigate(`subject:${subj}`)}
                  onNavigateCountry={(slug) => handleNavigate(`country-tutoring:${slug}`)}
                  onNavigateService={(serviceSlug) => handleNavigate(serviceSlug)}
                />
                <Footer onNavigate={handleNavigate} onOpenBecomeTutor={handleOpenBecomeTutor} />
              </Suspense>
            ) : (
              <footer
                id="main-footer"
                className="min-h-[1250px] lg:min-h-[1100px] bg-[#ffeedd] border-t-2 border-[#ffab85]"
                aria-hidden="true"
              />
            )}
          </div>
        )}

      {/* 3. Consent cookie banner disclosure — deferred until post-load idle */}
      {isIdleWidgetsReady && (
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      )}

      {/* Lazy Modals Suspense container — mounted only when actually opened */}
      <Suspense fallback={null}>
        {isBecomeTutorOpen && (
          <BecomeTutorModal
            isOpen={isBecomeTutorOpen}
            onClose={() => setIsBecomeTutorOpen(false)}
            onSubmit={async (data) => {
              return await store.submitTutorApplication({
                ...data,
                isApproved: false,
                status: 'pending',
              });
            }}
          />
        )}

        {isSopModalOpen && <SopModal isOpen={isSopModalOpen} onClose={() => setIsSopModalOpen(false)} />}

        {isWhatsAppModalOpen && (
          <WhatsAppChatModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            currentUser={storeState.currentUser}
            whatsappNumber="19178094906"
          />
        )}

        {isAssignModalOpen && storeState.currentUser && (
          <AssignmentFormModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onSubmit={handleAssignmentSubmit}
            studentId={storeState.currentUser.id}
            tutors={mentorsList}
            prefilledTutorId={prefilledTutorForAssign}
          />
        )}

        {liveChat && storeState.currentUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full relative border border-gray-200 shadow-2xl overflow-hidden animate-fade-in my-auto max-h-[94vh] flex flex-col"
              id="active-chat-drawer-backdrop"
            >
              <button
                id="close-chat-drawer-btn"
                onClick={() => setActiveChat(null)}
                className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-white border border-gray-200 hover:bg-gray-100 p-1.5 rounded-full text-gray-600 shadow-sm z-50 cursor-pointer"
                aria-label="Close chat"
              >
                ✕
              </button>
              <ChatWindow
                chat={liveChat}
                messages={storeState.messages}
                currentUser={storeState.currentUser}
                onSendMessage={handleSendMessage}
                onOfferQuote={handleOfferQuote}
                onAcceptQuote={handleAcceptQuote}
                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                onSetTypingStatus={handleSetTypingStatus}
                quotes={storeState.quotes}
                tutors={mentorsList}
                students={studentsList}
                isLoading={storeState.isLoadingMessages}
                error={storeState.chatError}
                onRetry={() => store.subscribeToChatDetails(liveChat.id)}
              />
            </div>
          </div>
        )}
      </Suspense>

      {/* Floating incoming chat message notification toasts */}
      {activeToasts.length > 0 && (
        <Suspense fallback={null}>
          <ChatNotificationToast
            notifications={activeToasts}
            onDismiss={(id) => setActiveToasts((prev) => prev.filter((t) => t.id !== id))}
            onOpenChat={(chatId) => {
              const targetChat = storeState.chats.find((c) => c.id === chatId);
              if (targetChat) {
                setActiveChat(targetChat);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
