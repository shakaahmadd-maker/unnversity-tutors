import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
const Footer = lazy(() => import('./components/Footer'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));
const FloatingWhatsAppButton = lazy(() => import('./components/FloatingWhatsAppButton'));
import ErrorBoundary from './components/ErrorBoundary';
import { apiFetch } from './lib/apiClient';

// Dynamic code splitting for performance and fast First Contentful Paint
const SopModal = lazy(() => import('./components/SopModal'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
import MarketingPages from './components/MarketingPages';
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const TutorDashboard = lazy(() => import('./components/TutorDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
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
import { audioNotifier, ToastNotification } from './utils/audioNotification';
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

import { store } from './lib/store';
import { UserRole, Chat, User } from './types';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  
  // React render sync state for Store updates
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
    chatError: store.chatError || null
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [activeCountryTutoringSlug, setActiveCountryTutoringSlug] = useState<string>('usa');
  const [activeSpecializedServiceSlug, setActiveSpecializedServiceSlug] = useState<string>('assignment-guidance');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [selectedTutorProfile, setSelectedTutorProfile] = useState<User | null>(null);
  const [isLoadingTutorProfile, setIsLoadingTutorProfile] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isBecomeTutorOpen, setIsBecomeTutorOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [prefilledTutorForAssign, setPrefilledTutorForAssign] = useState<string>('');

  // Floating notifications and audio music chime for incoming texts
  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const seenMessageIdsRef = React.useRef<Set<string>>(new Set(store.messages.map(m => m.id)));
  const isInitialMountRef = React.useRef<boolean>(true);
  const [isIdleWidgetsReady, setIsIdleWidgetsReady] = useState<boolean>(false);
  const [shouldRenderFooter, setShouldRenderFooter] = useState<boolean>(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);

  // Defer floating WhatsApp button & CookieBanner until browser idle or first user interaction so LCP renders uncontested
  useEffect(() => {
    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setIsIdleWidgetsReady(true);
    };

    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((evt) => window.addEventListener(evt, activate, { once: true, passive: true }));

    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (typeof ric === 'function') {
      idleHandle = ric(activate, { timeout: 2500 });
    } else {
      timeoutHandle = setTimeout(activate, 2200);
    }

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, activate));
      if (idleHandle !== null && typeof cic === 'function') cic(idleHandle);
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, []);

  // Gate lazy Footer download & DOM mount until user scrolls near the bottom of the page
  useEffect(() => {
    if (shouldRenderFooter) return;
    const el = footerSentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldRenderFooter(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderFooter(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeView, shouldRenderFooter]);

  // Incoming text listener: plays melodic chime ("music") and shows in-app floating banner
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      seenMessageIdsRef.current = new Set(storeState.messages.map(m => m.id));
      return;
    }

    const currentMessages = storeState.messages;
    const newArrivals = currentMessages.filter(m => !seenMessageIdsRef.current.has(m.id));

    if (newArrivals.length > 0) {
      newArrivals.forEach(m => {
        seenMessageIdsRef.current.add(m.id);

        if (m.senderId !== storeState.currentUser?.id && !m.isSystem) {
          const senderUser = storeState.users.find(u => u.id === m.senderId);
          const senderName = senderUser?.name || 'Academic Advisor';
          const senderAvatar = senderUser?.avatarUrl;
          const senderRole = senderUser?.role || 'tutor';

          // 1. Play musical chime ("music")
          audioNotifier.playReceivedSound();

          // 2. Display live floating notification toast
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

          setActiveToasts(prev => [newToast, ...prev.slice(0, 2)]);

          // Auto-dismiss after 7 seconds
          setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== toastId));
          }, 7000);
        }
      });
    }
  }, [storeState.messages, storeState.currentUser, storeState.users]);

  // Open WhatsApp modal 10 seconds after user moves to a new page; keep it shut on page transition
  useEffect(() => {
    setIsWhatsAppModalOpen(false);
    const timer = setTimeout(() => {
      setIsWhatsAppModalOpen(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeView, selectedTutorProfile]);

  // Automated Technical SEO: Canonicalization, parameter stripping, and dynamic metadata sync
  useEffect(() => {
    let cancelled = false;
    const defaultTitle = 'University Tutors - Expert Academic Mentorship & Tutoring';
    const defaultDesc = 'Verified 1-on-1 expert academic tutoring, assignment guidance, coursework support, and study consultations across major universities.';

    const applySeo = async () => {
      let title = defaultTitle;
      let description = defaultDesc;
      let canonicalPath = '/';

      if (activeView === 'country-online-tutoring') {
        const { COUNTRY_ONLINE_TUTORING_PAGES } = await import('./data/countryOnlineTutoringData');
        const pageData = COUNTRY_ONLINE_TUTORING_PAGES[activeCountryTutoringSlug];
        if (pageData) {
          title = pageData.seoTitle || pageData.h1;
          description = pageData.paragraphs?.[0] || description;
          canonicalPath = `/online-tutoring-${activeCountryTutoringSlug}`;
        }
      } else if (activeView === 'specialized-service') {
        const { SPECIALIZED_SERVICE_PAGES_MAP } = await import('./data/specializedTutoringServicesData');
        const sPage = SPECIALIZED_SERVICE_PAGES_MAP[activeSpecializedServiceSlug] || SPECIALIZED_SERVICE_PAGES_MAP['/' + activeSpecializedServiceSlug];
        if (sPage) {
          title = sPage.seoTitle || sPage.h1;
          description = sPage.summary || description;
          canonicalPath = `/${activeSpecializedServiceSlug}`;
        }
      } else if (resolveDedicatedServiceRoute(activeView)) {
        const dService = resolveDedicatedServiceRoute(activeView)!;
        title = dService.seoTitle;
        description = dService.seoDescription;
        canonicalPath = dService.path;
      } else if (activeView === 'tutor-profile' && selectedTutorProfile) {
        const primarySubj =
          selectedTutorProfile.primarySubject ||
          (Array.isArray(selectedTutorProfile.subjectExpertise) ? selectedTutorProfile.subjectExpertise[0] : '') ||
          (Array.isArray(selectedTutorProfile.subjects) ? selectedTutorProfile.subjects[0] : '') ||
          'Academic';
        title = `${selectedTutorProfile.name} — ${primarySubj} Tutor | University Tutors`;
        description =
          selectedTutorProfile.bio ||
          selectedTutorProfile.experienceSummary ||
          selectedTutorProfile.experience ||
          defaultDesc;
        canonicalPath = `/tutor/${encodeURIComponent(selectedTutorProfile.id)}`;
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
        title = 'Academic Integrity Blog & Study Guides - University Tutors';
        canonicalPath = '/blog';
      } else if (activeView.startsWith('blog/')) {
        const rawBlogSlug = activeView.slice('blog/'.length);
        const matchedBlog = storeState.blogs.find((b) => matchesBlogSlugOrId(b, rawBlogSlug));
        if (matchedBlog) {
          title = `${matchedBlog.title} | University Tutors`;
          description =
            matchedBlog.excerpt ||
            matchedBlog.content.replace(/[#*`>_]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155) ||
            defaultDesc;
          canonicalPath = `/blog/${encodeURIComponent(getBlogCanonicalSlug(matchedBlog))}`;
        } else {
          title = 'Academic Study Guide & Article | University Tutors';
          canonicalPath = `/blog/${encodeURIComponent(rawBlogSlug)}`;
        }
      } else if (activeView === 'whatsapp') {
        title = '24/7 WhatsApp Academic Concierge - University Tutors';
        canonicalPath = '/whatsapp';
      } else if (activeView === 'google-disclosure') {
        title = 'Google OAuth Data Disclosure - University Tutors';
        canonicalPath = '/google-disclosure';
      } else if (activeView === 'tutors-directory' || activeView === 'tutors') {
        title = 'Find Verified University Mentors & Tutors - University Tutors';
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
        description = 'Complete platform user registry of students, credentialed tutors, and administrators with real-time verification status.';
        canonicalPath = '/user-data';
      } else if (activeView === 'data-deletion') {
        title = 'User Data Deletion Instructions - University Tutors';
        description = 'Instructions on how to request the permanent deletion of your account and personal data from University Tutors, compliant with Meta, GDPR, and global standards.';
        canonicalPath = '/data-deletion';
      } else if (activeView === 'tools') {
        title = 'Free Online Student Tools Suite — PDF, Citations, Charts, CV & GPA | University Tutors';
        description = 'Free, 100% private browser-based academic & STEM calculators for university students: Biology & Genetics Simulators, Chemistry & Spectroscopy Calculators, PDF Merger, Citations & CGPA.';
        canonicalPath = '/tools';
      } else if (matchMathRouteView(activeView)) {
        const { resolveMathRoute } = await import('./data/mathToolsRegistry');
        const mRoute = resolveMathRoute(activeView);
        if (mRoute) {
          if (mRoute.kind === 'hub') {
            title = 'Free University Mathematics & Statistics Calculators (27 Tools) | University-Tutors.com';
            description = '27 free interactive browser-based Mathematics & Statistics solvers: Algebra, Unit Circle, Symbolic Derivatives, Riemann Integrals, Matrix RREF, Eigenvalues, Hypothesis Testing, RK4 ODEs & RSA.';
            canonicalPath = '/tools/math';
          } else {
            title = mRoute.tool.seoTitle;
            description = mRoute.tool.seoDescription;
            canonicalPath = mRoute.tool.path;
          }
        }
      } else if (matchScienceRouteView(activeView)) {
        const { resolveScienceRoute } = await import('./data/scienceToolsRegistry');
        const sciRoute = resolveScienceRoute(activeView);
        if (sciRoute) {
          if (sciRoute.kind === 'hub') {
            if (sciRoute.category === 'Biology') {
              title = 'Free Biology, Genetics & Molecular Lab Calculators (14 Tools) | University-Tutors.com';
              description = '14 free interactive browser-based Biology calculators: Punnett Square, DNA/RNA/Protein Translator, PCR Master Mix, CRISPR gRNA, Agarose Gel Simulator, Hardy-Weinberg, CFU/mL & Water Potential.';
              canonicalPath = '/tools/biology';
            } else {
              title = 'Free Chemistry, Stoichiometry & Spectroscopy Calculators (16 Tools) | University-Tutors.com';
              description = '16 free interactive browser-based Chemistry calculators: Periodic Table, Molar Mass, Equation Balancer, Limiting Reagent, Henderson-Hasselbalch Buffer, Titration, Nernst, VSEPR & NMR/IR Lookup.';
              canonicalPath = '/tools/chemistry';
            }
          } else {
            title = sciRoute.tool.seoTitle;
            description = sciRoute.tool.seoDescription;
            canonicalPath = sciRoute.tool.path;
          }
        }
      } else if (matchStudentToolSlug(activeView)) {
        const toolSlug = matchStudentToolSlug(activeView)!;
        const { STUDENT_TOOLS_BY_SLUG } = await import('./data/studentToolsData');
        const toolDef = STUDENT_TOOLS_BY_SLUG[toolSlug as keyof typeof STUDENT_TOOLS_BY_SLUG];
        if (toolDef) {
          title = toolDef.seoTitle;
          description = toolDef.seoDescription;
          canonicalPath = toolDef.path;
        }
      }

      if (!cancelled) {
        updatePageSeo({
          title,
          description,
          canonicalPath
        });
      }
    };

    void applySeo();
    return () => {
      cancelled = true;
    };
  }, [activeView, activeCountryTutoringSlug, activeSpecializedServiceSlug, selectedTutorProfile, storeState.blogs]);

  useEffect(() => {
    // Sync React state on any store notify() pattern
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
        chatError: store.chatError || null
      });
    });
    return () => unsubscribe();
  }, []);

  // Redirect to login cleanly if session expires while viewing dashboard
  useEffect(() => {
    if (storeState.sessionExpiredMessage && activeView === 'dashboard') {
      setActiveChat(null);
      setActiveView('auth');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/auth');
      }
    }
  }, [storeState.sessionExpiredMessage, activeView]);

  // Global listener for OAuth popup completion — verifies backend session before redirecting
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
      store.subscribeToChatDetails(activeChat.id);
    }
  }, [activeChat]);

  // Load & display an individual tutor profile by ID or slug (works for both store users and live API tutors)
  const openTutorProfileById = async (tutorId: string, pushUrl = true) => {
    const cleanId = decodeURIComponent(tutorId || '').trim();
    if (!cleanId) return;

    const slugify = (val: string) =>
      String(val || '')
        .toLowerCase()
        .replace(/^(?:(?:dr|prof|mr|ms|mrs)\.?\s+)+/i, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const targetSlug = slugify(cleanId);

    const findInList = (list: User[]) =>
      list.find(
        (u) =>
          u.id === cleanId ||
          u.id.toLowerCase() === cleanId.toLowerCase() ||
          (targetSlug && (slugify(u.id) === targetSlug || slugify(u.name) === targetSlug))
      );

    if (pushUrl) {
      window.history.pushState(null, '', `/tutor/${encodeURIComponent(cleanId)}`);
    }

    const localMatch = findInList(store.users);
    if (localMatch) {
      const normalizedLocal = store.upsertTutorPreview(localMatch);
      setIsLoadingTutorProfile(false);
      setSelectedTutorProfile(normalizedLocal);
      setActiveView('tutor-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Refresh authoritative tutor record from backend quietly without blocking navigation
      void apiFetch(`/api/tutors/${encodeURIComponent(normalizedLocal.id)}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json().catch(() => null);
          if (data?.tutor) {
            const enriched = store.upsertTutorPreview(data.tutor);
            setSelectedTutorProfile((prev) => (prev && prev.id === enriched.id ? enriched : prev));
          }
        })
        .catch(() => {});
      return;
    }

    setIsLoadingTutorProfile(true);
    setActiveView('tutor-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await apiFetch(`/api/tutors/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.tutor) {
          const normalized = store.upsertTutorPreview(data.tutor);
          setSelectedTutorProfile(normalized);
          setIsLoadingTutorProfile(false);
          setActiveView('tutor-profile');
          if (normalized.id && normalized.id !== cleanId) {
            window.history.replaceState(null, '', `/tutor/${encodeURIComponent(normalized.id)}`);
          }
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

  // Unified navigation handler that updates the window URL path and changes state
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
      if (!storeState.currentUser || (storeState.currentUser.role !== UserRole.ADMIN && storeState.currentUser.role !== UserRole.SUBADMIN)) {
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

    if (view === 'data-deletion' || view === 'data-deletion-instructions' || view === 'user-data-deletion' || view === 'data deletion') {
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
    } else if (view === 'admin') {
      path = '/admin';
      if (!activeUser) {
        view = 'admin-login';
      } else if (activeUser.role === UserRole.ADMIN || activeUser.role === UserRole.SUBADMIN) {
        view = 'dashboard';
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
        } else if (activeUser.role === UserRole.ADMIN || activeUser.role === UserRole.SUBADMIN) {
          path = '/admin';
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
    } else if (view === 'blog' || view.startsWith('blog/') || view.startsWith('blog-') || view === 'services' || view === 'about') {
      void store.ensureCatalogDataLoaded();
    }

    window.history.pushState(null, '', path);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL routing and relative links handler with case-insensitive and spacing normalization
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
        setActiveView('get-a-quote');
      } else if (decodedPath === '/how-it-works' || hash === '#how-it-works') {
        setActiveView('home');
        setTimeout(() => {
          document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 180);
      } else if (decodedPath === '/tools' || hash === '#tools') {
        setSelectedTutorProfile(null);
        setActiveView('tools');
      } else if (
        matchMathRouteView(decodedPath) ||
        matchMathRouteView(hash)
      ) {
        const mView = (matchMathRouteView(decodedPath) || matchMathRouteView(hash))!;
        setSelectedTutorProfile(null);
        setActiveView(mView);
      } else if (
        matchScienceRouteView(decodedPath) ||
        matchScienceRouteView(hash)
      ) {
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
        setSelectedTutorProfile(null);
        setActiveView('services');
      } else if (
        decodedPath === '/student' || hash === '#student' ||
        decodedPath === '/student/dashboard' || hash === '#student/dashboard'
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
        } else if (store.currentUser.role === UserRole.ADMIN || store.currentUser.role === UserRole.SUBADMIN) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/admin');
        }
      } else if (
        decodedPath === '/tutor' || hash === '#tutor' ||
        decodedPath === '/tutor/dashboard' || hash === '#tutor/dashboard'
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
        } else if (store.currentUser.role === UserRole.ADMIN || store.currentUser.role === UserRole.SUBADMIN) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/admin');
        }
      } else if (decodedPath === '/admin' || hash === '#admin') {
        if (!store.isSessionInitialized) {
          await store.sessionReadyPromise;
        }
        if (store.currentUser && (store.currentUser.role === UserRole.ADMIN || store.currentUser.role === UserRole.SUBADMIN)) {
          setActiveView('dashboard');
        } else if (store.currentUser && store.currentUser.role === UserRole.STUDENT) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/student/dashboard');
        } else if (store.currentUser && store.currentUser.role === UserRole.TUTOR) {
          setActiveView('dashboard');
          window.history.replaceState(null, '', '/tutor/dashboard');
        } else {
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
        setActiveView('about');
      } else if (
        decodedPath === '/faqs' || 
        decodedPath === '/faq' || 
        hash === '#faqs' || 
        hash === '#faq'
      ) {
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
      } else if (
        decodedPath === '/whatsapp' || 
        decodedPath === '/whatsapp-desk' || 
        hash === '#whatsapp'
      ) {
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
      } else if (decodedPath === '/auth' || hash === '#auth') {
        setActiveView('auth');
      } else if (
        decodedPath.startsWith('/online-tutoring-') || 
        hash.startsWith('#online-tutoring-')
      ) {
        const fullKey = decodedPath.startsWith('/online-tutoring-') 
          ? decodedPath.replace('/online-tutoring-', '')
          : hash.replace('#online-tutoring-', '');
        const cleanKey = fullKey.split('?')[0].split('#')[0].trim();
        setActiveCountryTutoringSlug(cleanKey || 'usa');
        setActiveView('country-online-tutoring');
      } else if (
        isSpecializedServiceSlug(decodedPath) ||
        isSpecializedServiceSlug(hash)
      ) {
        const rawSlug = decodedPath.startsWith('/') ? decodedPath.slice(1) : (hash.startsWith('#') ? hash.slice(1) : decodedPath);
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
        if (!store.currentUser || (store.currentUser.role !== UserRole.ADMIN && store.currentUser.role !== UserRole.SUBADMIN)) {
          setActiveView('admin-login');
          window.history.replaceState(null, '', '/admin');
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
      } else if (
        decodedPath === '' || 
        decodedPath === '/' || 
        decodedPath === '/home' || 
        hash === '#home'
      ) {
        setActiveView('home');
      }
    };

    handleUrlChange();

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
        } else if (
          href === '/faqs' || 
          href === '/faq' || 
          href === '#faqs' || 
          href === '#faq'
        ) {
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
        } else if (
          href === '/whatsapp' || 
          href === '#whatsapp' || 
          href.endsWith('/whatsapp')
        ) {
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
        } else if (
          href === '/student' || href === '#student' ||
          href === '/tutor' || href === '#tutor'
        ) {
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

  // Sync route after login updates
  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    const success = await store.login(email, password);
    if (success) {
      const user = store.currentUser;
      setStoreState(prev => ({ ...prev, currentUser: user, users: store.users }));
      const rolePath = user?.role === UserRole.TUTOR ? '/tutor/dashboard' : user?.role === UserRole.ADMIN || user?.role === UserRole.SUBADMIN ? '/admin' : '/student/dashboard';
      window.history.pushState(null, '', rolePath);
      setActiveView('dashboard');
    }
    return success;
  };

  const handleRegister = async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
    const success = await store.register(name, email, role, extra);
    if (success) {
      const activeUser = store.currentUser;
      setStoreState(prev => ({ ...prev, currentUser: activeUser, users: store.users }));
      const path = (activeUser?.role || role) === UserRole.STUDENT ? '/student/dashboard' : (activeUser?.role || role) === UserRole.TUTOR ? '/tutor/dashboard' : '/admin';
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

  // Quick Switch Audit Role handler - Disabled in real production build
  const handleQuickLogin = (role: UserRole) => {
    // Sandbox role switcher disabled for real auth
    console.log("Quick switcher is disabled to protect real secure user accounts.");
  };

  // Chat initiation
  const handleOpenChat = (tutorId: string, initialMessage?: string): Chat | undefined => {
    if (!storeState.currentUser) {
      setActiveView('auth');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return undefined;
    }
    const chat = store.getOrCreateChat(storeState.currentUser.id, tutorId, 'Direct Consultation');
    if (initialMessage) {
      store.sendMessage(chat.id, storeState.currentUser.id, initialMessage);
    }
    setActiveChat(chat);
    return chat;
  };

  const liveChat = activeChat ? storeState.chats.find(c => c.id === activeChat.id) || activeChat : null;

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
  }, []);

  const handleSubscribeToChatDetails = useCallback((chatId: string) => {
    return store.subscribeToChatDetails(chatId);
  }, []);

  const handleRefreshData = useCallback(() => {
    return store.fetchData();
  }, []);

  const handleLoadStudentTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('student', tab, { force });
  }, []);

  const handleLoadTutorTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('tutor', tab, { force });
  }, []);

  const handleLoadAdminTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('admin', tab, { force });
  }, []);

  const handleMarkNotificationRead = useCallback((id: string) => {
    return store.markNotificationRead(id);
  }, []);

  const handleMarkAllNotificationsRead = useCallback((userId: string) => {
    return store.markAllNotificationsRead(userId);
  }, []);

  const handlePayAdvance = useCallback((assignmentId: string, amount: number) => {
    return store.processAdvancePayment(assignmentId, amount);
  }, []);

  const handlePayBalance = useCallback((assignmentId: string, amount: number) => {
    return store.processBalancePayment(assignmentId, amount);
  }, []);

  const handleSendMessage = useCallback((chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => {
    audioNotifier.playSentSound();
    return store.sendMessage(chatId, senderId, content, fileUrl, fileName);
  }, []);

  const handleMarkMessagesAsRead = useCallback((chatId: string, userId: string) => {
    store.markMessagesAsRead(chatId, userId);
  }, []);

  const handleSetTypingStatus = useCallback((chatId: string, role: UserRole, isTyping: boolean) => {
    store.setTypingStatus(chatId, role, isTyping);
  }, []);

  const handleOfferQuote = useCallback((
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
    store.offerQuote(
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
  }, []);

  const handleAcceptQuote = useCallback((quoteId: string) => {
    store.acceptQuote(quoteId);
  }, []);

  // Administration actions
  const handleDeleteUser = (userId: string) => {
    store.deleteUser(userId);
  };

  const handleUpdateUserProfile = (userId: string, updatedData: Partial<User>) => {
    store.updateUserProfile(userId, updatedData);
  };

  const handleDeleteChat = (chatId: string) => {
    store.deleteChat(chatId);
  };

  // Assignment Submissions
  const handleAssignmentSubmit = async (data: any) => {
    const assignId = await store.submitAssignment(data);
    setIsAssignModalOpen(false);
    
    // Auto-match tutor based on subject criteria or prefilled tutor
    let targetTutorId = data.tutorId;
    if (!targetTutorId) {
      const match = mentorsList.find(u => u.subjects?.some(s => s.toLowerCase().includes(data.subject?.toLowerCase())));
      targetTutorId = match ? match.id : (mentorsList[0]?.id || 'tutor_clara');
    }
    // Update assignment with matched tutor if needed
    if (!data.tutorId && targetTutorId) {
      store.assignTutorToAssignment(assignId, targetTutorId);
    }

    const matchedTutor = storeState.users.find(u => u.id === targetTutorId);
    // Add real notification for assignment created and tutor matched
    store.addNotification({
      userId: storeState.currentUser?.id || 'all',
      title: 'Tutor Matched Successfully',
      message: `Your assignment "${data.title}" was paired with ${matchedTutor?.name || 'an expert tutor'}. You can now communicate directly via Tutor Chat!`,
      type: 'webapp',
      sentBy: 'System'
    });

    // Lead student to matched tutor chat immediately
    handleOpenChat(targetTutorId, `Hi ${matchedTutor?.name || 'Tutor'}, I just submitted an assignment brief titled "${data.title}" (Ref: #${assignId}). Looking forward to collaborating!`);
  };

  // Student Actions
  const handleApproveWork = (assignId: string, rating: number, comment: string) => {
    store.studentReviewAndApprove(assignId, rating, comment);
  };

  const handleRaiseRevision = (assignId: string, details: string) => {
    store.studentRequestRevision(assignId, details);
  };

  const handleRaiseTicket = (sub: string, msg: string) => {
    if (storeState.currentUser) {
      store.raiseTicket(storeState.currentUser.id, sub, msg);
    }
  };

  // Tutor Actions
  const handleTutorDeliver = (assignId: string, fileUrl: string, fileName: string) => {
    store.tutorDeliverWork(assignId, fileUrl, fileName);
  };

  // Admin Actions
  const handleToggleUserStatus = (userId: string) => {
    store.toggleUserSuspension(userId);
  };

  const handleChangeUserRole = (userId: string, targetRole: UserRole) => {
    const isSuperiorAdmin = storeState.currentUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
    if (!isSuperiorAdmin) {
      console.error("Permission Denied: Only Superior Admin can change user roles.");
      alert("Permission Denied: Only Superior Admin can change user roles.");
      return;
    }
    store.changeUserRole(userId, targetRole);
  };

  const handleGenerateProfile = async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
    const isSuperiorAdmin = storeState.currentUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
    if (!isSuperiorAdmin) {
      throw new Error("Permission Denied: Only Superior Admin is authorized to generate profiles.");
    }

    try {
      const response = await apiFetch('/api/create-privileged-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          extra
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server rejected request');
      }

      const data = await response.json();
      if (data.user) {
        store.fetchData();
      }
      return !!data.success;
    } catch (err: any) {
      console.error("Error creating privileged user via secure backend:", err);
      throw err;
    }
  };

  const handleAddBlog = (data: any) => {
    if (storeState.currentUser) {
      store.addBlog(data.title, data.content, data.image, data.category, data.tags, storeState.currentUser.id);
    }
  };

  const handleDeleteBlog = (blogId: string) => {
    store.deleteBlog(blogId);
  };

  const handleUpdateBlog = (blogId: string, title: string, content: string, image: string, category: string, tags: string[]) => {
    store.updateBlog(blogId, title, content, image, category, tags);
  };

  const handleSyncDefaultBlogs = async (): Promise<boolean> => {
    return await store.syncDefaultBlogs();
  };

  const handleAddFaq = (data: any) => {
    store.addFaq(data.question, data.answer, data.category);
  };

  const handleDeleteFaq = (faqId: string) => {
    store.deleteFaq(faqId);
  };

  const handleResolveDispute = (paymentId: string, action: 'release' | 'refund') => {
    const payment = store.payments.find(p => p.id === paymentId);
    if (!payment) return;

    if (action === 'release') {
      store.studentReviewAndApprove(payment.assignmentId);
    } else {
      store.adminProcessRefund(payment.assignmentId);
    }
    
    // Resolve any open tickets for this payment student
    const assign = store.assignments.find(a => a.id === payment.assignmentId);
    if (assign) {
      const ticket = store.supportTickets.find(t => t.studentId === assign.studentId && t.status === 'open');
      if (ticket) {
        store.resolveTicket(ticket.id);
      }
    }
  };

  // On-call consult tracker from main forms
  const handleOnCallConsultInput = useCallback((msg: string) => {
    // Automatically find Clara Stirling and open a connection chat logs
    const current = store.currentUser;
    if (current) {
      const chat = store.getOrCreateChat(current.id, 'tutor_clara', 'General Inquiry');
      store.sendMessage(chat.id, current.id, msg);
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
    setIsLoadingTutorProfile(false);
    setSelectedTutorProfile(normalized);
    setActiveView('tutor-profile');
    if (typeof window !== 'undefined' && normalized?.id) {
      window.history.pushState(null, '', `/tutor/${encodeURIComponent(normalized.id)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (normalized?.id) {
      void apiFetch(`/api/tutors/${encodeURIComponent(normalized.id)}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json().catch(() => null);
          if (data?.tutor) {
            const enriched = store.upsertTutorPreview(data.tutor);
            setSelectedTutorProfile((prev) => (prev && prev.id === enriched.id ? enriched : prev));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Separate tutors to pass to dropdown triggers (only approved tutors visible on public website)
  const mentorsList = useMemo(
    () => storeState.users.filter(u => u.role === UserRole.TUTOR && (u.isApproved === true || u.status === 'approved' || (u.isApproved === undefined && u.status === undefined))),
    [storeState.users]
  );
  const studentsList = useMemo(
    () => storeState.users.filter(u => u.role === UserRole.STUDENT),
    [storeState.users]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 relative overflow-x-clip" id="university-tutors-root">
      
      {/* Decorative ambient gradients for depth */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
      <div className="absolute top-1/3 -left-24 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>

      {/* Session Expiry Notification Banner */}
      {storeState.sessionExpiredMessage && (
        <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3 z-50">
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
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1 rounded-lg cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => store.clearSessionExpiredMessage()}
              className="p-1 text-amber-700 hover:text-amber-950 cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* 1. Header (Online indicator, Quick switcher, Main Navigation links) */}
      {!(activeView === 'dashboard' && storeState.currentUser?.role === UserRole.STUDENT) && (
        <Header 
          currentUser={storeState.currentUser}
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
        <Suspense fallback={
          <div className="min-h-[92vh] flex flex-col items-center justify-center py-24 gap-3 text-orange-600" id="view-suspense-loader">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-gray-400">Loading page...</span>
          </div>
        }>
        {/* Render main dashboards or static marketing views */}
        {activeView === 'auth' ? (
          <AuthPage 
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={handleNavigate}
          />
        ) : activeView === 'admin-login' ? (
          <AdminLoginPage 
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        ) : activeView === 'dashboard' ? (
          (() => {
            const currentActiveUser = store.currentUser || storeState.currentUser;
            return currentActiveUser ? (
              currentActiveUser.role === UserRole.STUDENT ? (
                <StudentDashboard 
                  currentUser={currentActiveUser}
                  tutors={mentorsList}
                  students={studentsList}
                  assignments={storeState.assignments}
                  chats={storeState.chats}
                  messages={storeState.messages}
                  payments={storeState.payments}
                  supportTickets={storeState.supportTickets}
                  onSubmitAssignment={async (data) => {
                    // Silently submit the assignment matched via wizard in the background
                    await store.submitAssignment(data);
                  }}
                  onOpenChat={handleOpenChat}
                  onSelectChat={handleSelectChat}
                  onSendMessage={handleSendMessage}
                  onSubscribeToChatDetails={handleSubscribeToChatDetails}
                  onApproveWork={handleApproveWork}
                  onRaiseRevision={handleRaiseRevision}
                  onRaiseTicket={handleRaiseTicket}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  assignmentReports={storeState.assignmentReports}
                  quotes={storeState.quotes}
                  onAcceptQuote={handleAcceptQuote}
                  appNotifications={storeState.appNotifications}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                  onUpdateProfile={(data) => store.updateUserProfile(currentActiveUser.id, data)}
                  invoices={storeState.invoices}
                  onRefreshData={handleRefreshData}
                  onLoadTab={handleLoadStudentTab}
                  tabStates={storeState.tabStates}
                  isLoadingMessages={storeState.isLoadingMessages}
                  chatError={storeState.chatError}
                  syncError={storeState.syncError}
                  lastSyncTime={storeState.lastSyncTime}
                  onPayAdvance={handlePayAdvance}
                  onPayBalance={handlePayBalance}
                />
              ) : currentActiveUser.role === UserRole.TUTOR ? (
                <TutorDashboard 
                  currentUser={currentActiveUser}
                  students={studentsList}
                  assignments={storeState.assignments}
                  chats={storeState.chats}
                  messages={storeState.messages}
                  payments={storeState.payments}
                  reviews={storeState.reviews}
                  onTutorDeliver={handleTutorDeliver}
                  onSelectChat={handleSelectChat}
                  assignmentReports={storeState.assignmentReports}
                  onCreateReport={store.createAssignmentReport.bind(store)}
                  onUpdateReportStatus={store.updateAssignmentReportStatus.bind(store)}
                  onLoadTab={handleLoadTutorTab}
                  tabStates={storeState.tabStates}
                  syncError={storeState.syncError}
                />
              ) : (
                <AdminDashboard 
                  currentUser={currentActiveUser}
                  users={storeState.users}
                  blogs={storeState.blogs}
                  faqs={storeState.faqs}
                  assignments={storeState.assignments}
                  payments={storeState.payments}
                  supportTickets={storeState.supportTickets}
                  chats={storeState.chats}
                  messages={storeState.messages}
                  invoices={storeState.invoices}
                  activityLogs={storeState.activityLogs}
                  appNotifications={storeState.appNotifications}
                  sops={storeState.sops}
                  assignmentReports={storeState.assignmentReports}
                  agreements={storeState.agreements}
                  onToggleUserStatus={handleToggleUserStatus}
                  onChangeUserRole={handleChangeUserRole}
                  onAddBlog={handleAddBlog}
                  onDeleteBlog={handleDeleteBlog}
                  onUpdateBlog={handleUpdateBlog}
                  onSyncDefaultBlogs={handleSyncDefaultBlogs}
                  onAddFaq={handleAddFaq}
                  onDeleteFaq={handleDeleteFaq}
                  onResolveDispute={handleResolveDispute}
                  onGenerateProfile={handleGenerateProfile}
                  onDeleteUser={handleDeleteUser}
                  onUpdateUserProfile={handleUpdateUserProfile}
                  onAddNewTutor={store.createTutorProfile.bind(store)}
                  onDeleteChat={handleDeleteChat}
                  onSelectChat={handleSelectChat}
                  onSendMessage={handleSendMessage}
                  onSubscribeToChatDetails={handleSubscribeToChatDetails}
                  onGetOrCreateChat={store.getOrCreateChat.bind(store)}

                  onAssignTutor={store.assignTutorToAssignment.bind(store)}
                  onSetAssignmentPrice={store.setAssignmentPrice.bind(store)}
                  onUpdateAssignmentStatus={store.updateAssignmentStatus.bind(store)}
                  onUpdateAssignment={store.updateAssignment.bind(store)}
                  onDeleteAssignment={store.deleteAssignment.bind(store)}
                  onCreateAssignmentOrder={store.createAssignmentOrder.bind(store)}
                  onReleaseEscrow={store.releaseEscrow.bind(store)}
                  onRefreshData={handleRefreshData}
                  onSettleInvoice={store.settleInvoice.bind(store)}
                  onCreateInvoice={store.createInvoice.bind(store)}
                  onSendNotification={store.sendAppNotification.bind(store)}
                  onSendMissingPaymentNotification={store.sendMissingPaymentNotification.bind(store)}
                  onUpdateAssignmentReportStatus={store.updateAssignmentReportStatus.bind(store)}
                  onCreateAgreement={store.createAgreement.bind(store)}
                  emails={storeState.emails || []}
                  onSendTriggerEmail={store.sendTriggerEmail.bind(store)}
                  onSeedMockStudentData={store.seedMockStudentData.bind(store)}
                  onLoadTab={handleLoadAdminTab}
                  tabStates={storeState.tabStates}
                  isLoadingMessages={storeState.isLoadingMessages}
                  chatError={storeState.chatError}
                  connectionStatus={storeState.connectionStatus}
                  lastSyncTime={storeState.lastSyncTime}
                  syncError={storeState.syncError}
                />
              )
            ) : (
              <div className="py-20 text-center bg-white m-8 rounded-3xl border shadow-xs max-w-sm mx-auto space-y-4">
                <span className="text-4xl">🔒</span>
                <h3 className="font-sans font-bold text-lg text-gray-950">Dashboard Locked</h3>
                <p className="text-xs text-gray-500 px-6">Please sign in to access your dashboard.</p>
                <button 
                  onClick={() => setActiveView('auth')} 
                  className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            );
          })()
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
        ) : activeView === 'specialized-service' ||
            isSpecializedServiceSlug(activeView) ? (
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
          <WhatsAppPage
            currentUser={storeState.currentUser}
            onNavigate={handleNavigate}
          />
        ) : activeView === 'user-data' ? (
          <UserDataPage
            users={storeState.users}
            currentUser={storeState.currentUser}
            onNavigate={handleNavigate}
            onSelectTutorProfile={handleSelectTutorProfile}
          />
        ) : activeView === 'data-deletion' ? (
          <DataDeletionPage
            currentUser={storeState.currentUser}
            onNavigate={handleNavigate}
          />
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
        ) : (
          /* Marketing Views (Home, Services, About Us, FAQs, Contact Form, Blog System) */
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
        )}
        </Suspense>
        </ErrorBoundary>
      </main>

      {/* Floating WhatsApp Instant Chat Trigger (Bottom Left) — deferred until post-LCP idle or user interaction */}
      {isIdleWidgetsReady && !isWhatsAppModalOpen && (
        <Suspense fallback={null}>
          <FloatingWhatsAppButton onOpen={() => setIsWhatsAppModalOpen(true)} />
        </Suspense>
      )}

      {/* 2. Footer (lazy-loaded & viewport-gated below the fold so initial homepage bundle skips footer/tool chunks and DOM nodes) */}
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
                    className="min-h-[600px] bg-[#ffeedd] border-t-2 border-[#ffab85]"
                    aria-hidden="true"
                  />
                }
              >
                <Footer
                  onNavigate={handleNavigate}
                  onOpenBecomeTutor={handleOpenBecomeTutor}
                />
              </Suspense>
            ) : (
              <footer
                id="main-footer"
                className="min-h-[600px] bg-[#ffeedd] border-t-2 border-[#ffab85]"
                aria-hidden="true"
              />
            )}
          </div>
        )}

      {/* 3. Consent cookie banner disclosure — deferred until post-LCP idle */}
      {isIdleWidgetsReady && (
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      )}

      {/* Lazy Modals Suspense container — mounted only when actually opened so homepage skips downloading hidden modal chunks */}
      <Suspense fallback={null}>
        {/* Become a Tutor Application Modal */}
        {isBecomeTutorOpen && (
          <BecomeTutorModal
            isOpen={isBecomeTutorOpen}
            onClose={() => setIsBecomeTutorOpen(false)}
            onSubmit={async (data) => {
              return await store.submitTutorApplication({
                ...data,
                isApproved: false,
                status: 'pending'
              });
            }}
          />
        )}

        {/* 4. Interactive SOP walkthrough modal */}
        {isSopModalOpen && (
          <SopModal 
            isOpen={isSopModalOpen}
            onClose={() => setIsSopModalOpen(false)}
          />
        )}

        {/* 5. WhatsApp Instant Chat Modal */}
        {isWhatsAppModalOpen && (
          <WhatsAppChatModal 
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            currentUser={storeState.currentUser}
            whatsappNumber="19178094906"
          />
        )}

        {/* 5. Assignment submission parameters modal (only accessible to student accounts) */}
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

        {/* 6. Live Chat room overlay slideover dialog drawer */}
        {liveChat && storeState.currentUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full relative border border-gray-200 shadow-2xl overflow-hidden animate-fade-in my-auto max-h-[94vh] flex flex-col" id="active-chat-drawer-backdrop">
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

      {/* Floating incoming chat message notification toasts with chime music */}
      {activeToasts.length > 0 && (
        <Suspense fallback={null}>
          <ChatNotificationToast 
            notifications={activeToasts}
            onDismiss={(id) => setActiveToasts(prev => prev.filter(t => t.id !== id))}
            onOpenChat={(chatId) => {
              const targetChat = storeState.chats.find(c => c.id === chatId);
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
