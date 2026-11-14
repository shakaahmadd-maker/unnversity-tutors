import {
  User,
  UserRole,
  Chat,
  Message,
  Quote,
  Assignment,
  AssignmentStatus,
  Payment,
  Blog,
  FAQ,
  SupportTicket,
  Review,
  Invoice,
  ActivityLog,
  AppNotification,
  SOP,
  AssignmentReport,
  Agreement,
  TriggeredEmail,
} from '../types';
import {
  apiFetch as centralizedApiFetch,
  isAbortError,
  getFriendlyErrorMessage,
  SESSION_EXPIRED_EVENT,
} from './apiClient';

const TODAY_ISO = new Date().toISOString().split('T')[0];
const TOMORROW_ISO = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const INITIAL_TUTORS: User[] = [
  {
    id: 'tutor_clara',
    role: UserRole.TUTOR,
    name: 'Dr. Clara Stirling',
    email: 'clara@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
    bio: 'Former Oxford Senior Lecturer with 12+ years of experience helping undergraduate and postgraduate students structure complex academic essays and dissertation prose.',
    hourlyRate: 45,
    rating: 4.9,
    reviewCount: 142,
    subjects: ['English Literature', 'Essays & Editing', 'History', 'Philosophy'],
    country: 'GB',
    availableSlots: [`${TODAY_ISO}T10:00:00.000Z`, `${TODAY_ISO}T14:00:00.000Z`, `${TOMORROW_ISO}T09:00:00.000Z`],
  },
  {
    id: 'tutor_liam',
    role: UserRole.TUTOR,
    name: 'Liam Kennedy, M.Sc.',
    email: 'liam@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
    bio: 'MIT graduate specializing in Advanced Calculus, Statistics, Linear Algebra and Mechanical Engineering. Helping students solve complex problems systematically.',
    hourlyRate: 50,
    rating: 4.8,
    reviewCount: 96,
    subjects: ['Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering'],
    country: 'US',
    availableSlots: [`${TODAY_ISO}T11:00:00.000Z`, `${TOMORROW_ISO}T15:00:00.000Z`],
  },
  {
    id: 'tutor_chloe',
    role: UserRole.TUTOR,
    name: 'Chloe Tremblay',
    email: 'chloe@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    bio: 'Specialist in Cognitive Psychology and Business Administration. Focuses on coursework mentorship, assignment structuring, and dissertation planning.',
    hourlyRate: 38,
    rating: 4.7,
    reviewCount: 68,
    subjects: ['Psychology', 'Business Administration', 'Marketing', 'Sociology'],
    country: 'CA',
    availableSlots: [`${TODAY_ISO}T16:00:00.000Z`, `${TOMORROW_ISO}T13:00:00.000Z`],
  },
  {
    id: 'tutor_james',
    role: UserRole.TUTOR,
    name: 'James Cook',
    email: 'james@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
    bio: 'Fullstack Developer and Algorithms Engineer. Academic advisor for Computer Science students across AU and NZ. Specialized in Python, Java, C++, and database architecture.',
    hourlyRate: 48,
    rating: 5.0,
    reviewCount: 215,
    subjects: ['Computer Science', 'Data Structures', 'Coding & Python', 'Database Systems'],
    country: 'AU',
    availableSlots: [`${TODAY_ISO}T09:00:00.000Z`, `${TODAY_ISO}T13:00:00.000Z`, `${TOMORROW_ISO}T11:00:00.000Z`],
  },
  {
    id: 'tutor-dr-marcus-vance',
    role: UserRole.TUTOR,
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@universitytutors.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T00:00:00.000Z',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    country: 'US',
    hourlyRate: 55,
    rating: 4.98,
    reviewCount: 184,
    education: 'Emory University - Ph.D, Neuroscience & Organic Chemistry',
    experience:
      'Senior Emory research scientist and dedicated private tutor in Atlanta with over 8 years of experience. I specialize in Organic Chemistry, MCAT preparation, Biochemistry, and Cell Biology for pre-med and undergraduate students.',
    subjects: ['Organic Chemistry', 'MCAT', 'Biochemistry', 'Chemistry'],
    isApproved: true,
    status: 'approved',
  },
];

const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq_1',
    question: 'How do you vet your academic tutors?',
    answer:
      'Every tutor on universitytutors.com is rigorously vetted. We verify their academic transcripts, conduct subject-matter exam assessments, and host live screening video sessions before onboarding.',
    category: 'General',
    order: 1,
  },
  {
    id: 'faq_2',
    question: 'How do Stripe payment holds/escrow work?',
    answer:
      'Your safety is our top priority. When you agree on a quote from your tutor and click "Proceed to Payment", your funds are held in a secure Stripe-enabled escrow account. Money is only released to the tutor after you click "Confirm & Approve Delivery" on your dashboard.',
    category: 'Payments',
    order: 1,
  },
  {
    id: 'faq_3',
    question: 'Are your services ethical and aligned with University policies?',
    answer:
      'Absolutely. We provide strictly ethical academic guidance. Our tutors explain concepts, review research methodologies, structure essays, provide line-by-line feedback, and compile custom explanatory study examples.',
    category: 'Tutoring Process',
    order: 1,
  },
];

export function isShakaEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === 'shaka.ahmadd@gmail.com' || normalized === 'shaka.ahmad@gmail.com';
}

export const apiFetch = centralizedApiFetch;

export interface TabLoadState {
  loading: boolean;
  error: string | null;
  loadedAt: number | null;
}

type StoreOpsModule = typeof import('./storeOperations');

export class AppStore {
  users: User[] = [
    ...INITIAL_TUTORS,
    {
      id: 'student_alex',
      role: UserRole.STUDENT,
      name: 'Alex Mercer',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-10T00:00:00.000Z',
      verified: true,
    },
    {
      id: 'admin_emily',
      role: UserRole.ADMIN,
      name: 'Emily Vance (Platform Admin)',
      email: 'emily@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-10T00:00:00.000Z',
      verified: true,
    },
    {
      id: 'admin_shaka',
      role: UserRole.ADMIN,
      name: 'Shaka Ahmad',
      email: 'shaka.ahmadd@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-10T00:00:00.000Z',
      verified: true,
    },
  ];
  currentUser: User | null = null;
  blogs: Blog[] = [];
  faqs: FAQ[] = INITIAL_FAQS;
  chats: Chat[] = [];
  chatRooms: any[] = [];
  messages: Message[] = [];
  isLoadingRooms: boolean = false;
  isLoadingMessages: boolean = false;
  chatError: string | null = null;
  quotes: Quote[] = [];
  assignments: Assignment[] = [];
  payments: Payment[] = [];
  supportTickets: SupportTicket[] = [];
  reviews: Review[] = [];
  invoices: Invoice[] = [];
  activityLogs: ActivityLog[] = [];
  appNotifications: AppNotification[] = [];
  sops: SOP[] = [];
  assignmentReports: AssignmentReport[] = [];
  agreements: Agreement[] = [];
  emails: TriggeredEmail[] = [];
  activeStudentsOnline: number = 84;

  connectionStatus: 'connected' | 'offline' | 'error' | 'syncing' = 'connected';
  lastSyncTime: string | null = null;
  syncError: string | null = null;
  sessionExpiredMessage: string | null = null;
  tabStates: Record<string, TabLoadState> = {};

  private listeners: (() => void)[] = [];
  private pollTimer: any = null;
  private liveCounterTimer: any = null;
  public tabAbortControllers = new Map<string, AbortController>();
  public chatAbortController: AbortController | null = null;
  private fetchDataAbortController: AbortController | null = null;
  private inFlightFetchData: Promise<void> | null = null;
  private trendingTutorsLoaded = false;
  public fullDirectoryLoaded = false;
  private inFlightDirectoryLoad: Promise<void> | null = null;
  private curatedTutorsCache: User[] = [];
  private catalogDataLoaded = false;
  private inFlightCatalogLoad: Promise<void> | null = null;
  private opsPromise: Promise<StoreOpsModule> | null = null;
  public isSessionInitialized: boolean = false;
  public sessionReadyPromise: Promise<User | null>;

  constructor() {
    if (typeof window === 'undefined') {
      this.isSessionInitialized = true;
      this.sessionReadyPromise = Promise.resolve(null);
      return;
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, () => {
      if (this.currentUser) {
        this.handleSessionExpired();
      }
    });

    const pathname = window.location.pathname.toLowerCase();
    const isProtectedRoute = /^\/(student|admin|user-data)(\/|$)/.test(pathname) || pathname === '/tutor' || pathname === '/tutor/dashboard';
    const cookieStr = typeof document !== 'undefined' ? document.cookie || '' : '';
    const hasCookieHint = /(?:^|;\s*)ut_session_active=1(?:;|$)/.test(cookieStr);
    let hasStoredHint = false;
    try {
      hasStoredHint = Boolean(localStorage.getItem('ut_current_user') || localStorage.getItem('auth_token'));
    } catch {
      hasStoredHint = false;
    }

    if (hasCookieHint || hasStoredHint || isProtectedRoute) {
      this.sessionReadyPromise = Promise.resolve().then(() => this.bootstrap());
      this.ensureBackgroundTimersStarted();
    } else {
      // Anonymous public visitor: zero blocking work during module evaluation & initial paint
      this.isSessionInitialized = true;
      this.sessionReadyPromise = Promise.resolve(null);
      this.schedulePostLoadPublicSync();
    }
  }

  private schedulePostLoadPublicSync() {
    if (typeof window === 'undefined') return;
    const runIdleSync = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;
      const trigger = () => {
        this.ensureBackgroundTimersStarted();
        const path = window.location.pathname;
        const delayMs = path === '/' || path === '' ? 4500 : 800;
        window.setTimeout(() => {
          this.fetchData().catch(() => {});
        }, delayMs);
      };
      if (typeof ric === 'function') {
        ric(trigger, { timeout: 2000 });
      } else {
        window.setTimeout(trigger, 600);
      }
    };

    if (document.readyState === 'complete') {
      runIdleSync();
    } else {
      window.addEventListener('load', runIdleSync, { once: true });
    }
  }

  public ensureBackgroundTimersStarted() {
    this.startLiveStudentCounter();
    this.startPolling();
  }

  private loadOps(): Promise<StoreOpsModule> {
    if (!this.opsPromise) {
      this.opsPromise = import('./storeOperations');
    }
    return this.opsPromise;
  }

  public async ensureCatalogDataLoaded(): Promise<void> {
    if (this.catalogDataLoaded) return;
    if (this.inFlightCatalogLoad) return this.inFlightCatalogLoad;
    this.inFlightCatalogLoad = (async () => {
      try {
        const [tutorsMod, blogsMod] = await Promise.all([
          import('../data/tutorsDirectoryData'),
          import('../data/defaultBlogsData'),
        ]);
        this.curatedTutorsCache = tutorsMod.CURATED_SPECIALIZED_TUTORS || [];
        const mergedMap = new Map<string, User>();
        for (const initial of INITIAL_TUTORS) mergedMap.set(initial.id, initial);
        for (const curated of this.curatedTutorsCache) mergedMap.set(curated.id, curated);
        for (const u of this.users) {
          const existing = mergedMap.get(u.id);
          mergedMap.set(u.id, existing ? { ...existing, ...u } : u);
        }
        this.users = Array.from(mergedMap.values());
        if (this.blogs.length === 0 && Array.isArray(blogsMod.DEFAULT_20_BLOGS)) {
          this.blogs = blogsMod.DEFAULT_20_BLOGS.map((b) => ({
            id: b.id,
            adminId: b.adminId || 'admin_shaka',
            title: b.title,
            slug: b.id,
            excerpt: b.title,
            content: b.content,
            author: 'Editorial Team',
            image: b.image,
            imageUrl: b.image,
            category: b.category,
            tags: b.tags,
            readTime: '5 min read',
            featured: false,
            publishedAt: b.publishedAt,
          }));
        }
        this.catalogDataLoaded = true;
        this.notify();
      } catch {
        // Ignore transient dynamic import failures
      } finally {
        this.inFlightCatalogLoad = null;
      }
    })();
    return this.inFlightCatalogLoad;
  }

  private async bootstrap(): Promise<User | null> {
    const user = await this.verifySession(false);
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (!user && (pathname === '/' || pathname === '')) {
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          this.fetchData().catch(() => {});
        }, 5500);
      }
      return null;
    }
    await this.ensureCatalogDataLoaded();
    await this.fetchData();
    return user;
  }

  public handleSessionExpired(message = 'Your session expired. Please sign in again to continue.') {
    this.cancelAllPendingRequests();
    this.currentUser = null;
    this.sessionExpiredMessage = message;
    this.syncError = message;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ut_current_user');
        localStorage.removeItem('auth_token');
      } catch {
        // ignore storage errors
      }
    }
    this.notify();
  }

  public clearSessionExpiredMessage() {
    if (this.sessionExpiredMessage) {
      this.sessionExpiredMessage = null;
      this.notify();
    }
  }

  public cancelAllPendingRequests() {
    this.tabAbortControllers.forEach((ctrl) => ctrl.abort());
    this.tabAbortControllers.clear();
    if (this.chatAbortController) {
      this.chatAbortController.abort();
      this.chatAbortController = null;
    }
    if (this.fetchDataAbortController) {
      this.fetchDataAbortController.abort();
      this.fetchDataAbortController = null;
    }
  }

  public cancelTabRequests(tabKey?: string) {
    if (tabKey) {
      const existing = this.tabAbortControllers.get(tabKey);
      if (existing) {
        existing.abort();
        this.tabAbortControllers.delete(tabKey);
      }
    } else {
      this.tabAbortControllers.forEach((ctrl) => ctrl.abort());
      this.tabAbortControllers.clear();
    }
  }

  public getTabState(role: string, tab: string): TabLoadState {
    return this.tabStates[`${role}:${tab}`] || { loading: false, error: null, loadedAt: null };
  }

  public async ensureFullDirectoryLoaded(): Promise<void> {
    if (this.fullDirectoryLoaded) return;
    if (this.inFlightDirectoryLoad) return this.inFlightDirectoryLoad;
    this.inFlightDirectoryLoad = (async () => {
      try {
        await this.ensureCatalogDataLoaded();
        const res = await apiFetch('/api/users?page=1&limit=2500');
        if (res.ok) {
          const uData = await res.json();
          if (Array.isArray(uData.users)) {
            this.mergeServerUsers(uData.users);
            this.fullDirectoryLoaded = true;
            this.notify();
          }
        }
      } catch {
        // Ignore transient directory prefetch failures
      } finally {
        this.inFlightDirectoryLoad = null;
      }
    })();
    return this.inFlightDirectoryLoad;
  }

  public upsertTutorPreview(tutorRaw: any): User {
    const parsedSubs = this.parseSubjectField(
      tutorRaw?.subjectExpertise || tutorRaw?.subjects,
      tutorRaw?.primarySubject
    );
    const existing = this.users.find((u) => u.id === tutorRaw?.id);
    const normalized: User = {
      ...(existing || {}),
      ...tutorRaw,
      id: tutorRaw.id,
      name: tutorRaw.name || existing?.name || 'Academic Tutor',
      email: tutorRaw.email || existing?.email || `${tutorRaw.id}@university-tutors.com`,
      role: UserRole.TUTOR,
      avatarUrl: tutorRaw.avatarUrl || tutorRaw.profileImageUrl || existing?.avatarUrl || '',
      subjects: parsedSubs.length > 0 ? parsedSubs : existing?.subjects || [],
      subjectExpertise: parsedSubs.length > 0 ? parsedSubs : existing?.subjectExpertise || [],
      reviewCount: tutorRaw.reviewCount ?? tutorRaw.reviewsCount ?? existing?.reviewCount ?? 120,
      location: tutorRaw.location || tutorRaw.cityLocation || tutorRaw.city || existing?.location || 'Miami, FL',
      experience: tutorRaw.experience || tutorRaw.experienceSummary || tutorRaw.bio || existing?.experience || '',
      availability:
        tutorRaw.availability || tutorRaw.availabilities || existing?.availability || 'Flexible global scheduling',
      isApproved: tutorRaw.isApproved !== undefined ? tutorRaw.isApproved : true,
      status: tutorRaw.status || 'approved',
    };
    const idx = this.users.findIndex((u) => u.id === normalized.id);
    if (idx !== -1) {
      this.users[idx] = normalized;
    } else {
      this.users = [normalized, ...this.users];
    }
    return normalized;
  }

  public async loadTrendingTutorsFallback(): Promise<User[]> {
    if (this.trendingTutorsLoaded) return this.users;
    try {
      await this.ensureCatalogDataLoaded();
      const mod = await import('../data/trendingTutors500Data');
      const extra = (mod.TRENDING_TUTORS_500 as unknown) as User[];
      const merged = new Map<string, User>();
      for (const u of this.users) merged.set(u.id, u);
      for (const t of extra) {
        if (!merged.has(t.id)) merged.set(t.id, t);
      }
      this.users = Array.from(merged.values());
      this.trendingTutorsLoaded = true;
      this.notify();
    } catch {
      // ignore fallback load failure
    }
    return this.users;
  }

  public async verifySession(triggerFetch = true, forceNetwork = false): Promise<User | null> {
    if (typeof window === 'undefined') {
      this.isSessionInitialized = true;
      return null;
    }

    const cookieStr = typeof document !== 'undefined' ? document.cookie || '' : '';
    const hasCookieHint = /(?:^|;\s*)ut_session_active=1(?:;|$)/.test(cookieStr);
    let hasStoredHint = false;
    try {
      hasStoredHint = Boolean(localStorage.getItem('ut_current_user') || localStorage.getItem('auth_token'));
    } catch {
      hasStoredHint = false;
    }

    if (!forceNetwork && !hasCookieHint && !hasStoredHint) {
      const hadUser = this.currentUser !== null;
      this.currentUser = null;
      this.isSessionInitialized = true;
      if (hadUser) {
        this.notify();
      }
      return null;
    }

    try {
      const res = await apiFetch('/api/auth/me', { skipAuthEvent: true, dedupe: false });
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.id) {
          this.currentUser = data.user;
          this.sessionExpiredMessage = null;
          this.isSessionInitialized = true;
          try {
            document.cookie = 'ut_session_active=1; path=/; SameSite=Lax';
          } catch {
            // ignore cookie write errors
          }
          this.ensureBackgroundTimersStarted();
          this.notify();
          if (triggerFetch) {
            this.fetchData().catch(() => {});
          }
          return data.user;
        }
      }
      this.currentUser = null;
      try {
        localStorage.removeItem('ut_current_user');
        localStorage.removeItem('auth_token');
        document.cookie = 'ut_session_active=; Max-Age=0; path=/; SameSite=Lax';
      } catch {
        // ignore storage errors
      }
      this.isSessionInitialized = true;
      this.notify();
      return null;
    } catch {
      this.currentUser = null;
      try {
        localStorage.removeItem('ut_current_user');
        localStorage.removeItem('auth_token');
      } catch {
        // ignore storage errors
      }
      this.isSessionInitialized = true;
      this.notify();
      return null;
    }
  }

  private startPolling() {
    if (typeof window !== 'undefined' && !this.pollTimer) {
      this.pollTimer = setInterval(() => {
        if (this.currentUser && !this.sessionExpiredMessage && !document.hidden) {
          this.fetchData().catch(() => {});
        }
      }, 15000);
    }
  }

  private parseSubjectField(raw: unknown, fallback?: string): string[] {
    const out: string[] = [];
    const pushItem = (val: unknown) => {
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
        trimmed.split(',').forEach((part) => {
          const clean = part.replace(/^[\["']+|[\]"']+$/g, '').trim();
          if (clean) out.push(clean);
        });
      }
    };
    pushItem(raw);
    if (out.length === 0 && fallback && fallback.trim()) {
      out.push(fallback.trim());
    }
    return Array.from(new Set(out));
  }

  public mergeServerUsers(serverUsersRaw: any[]) {
    const serverUsers = serverUsersRaw.map((u: any) => {
      const parsedSubjects = this.parseSubjectField(u.subjects, u.primarySubject);
      const parsedExpertise = this.parseSubjectField(u.subjectExpertise || u.subjects, u.primarySubject);
      return {
        ...u,
        role: u.role || UserRole.TUTOR,
        subjects: parsedSubjects.length > 0 ? parsedSubjects : parsedExpertise,
        subjectExpertise: parsedExpertise.length > 0 ? parsedExpertise : parsedSubjects,
        reviewCount: u.reviewCount ?? u.reviewsCount,
      };
    });

    const mergedMap = new Map<string, User>();
    for (const initial of INITIAL_TUTORS) {
      mergedMap.set(initial.id, initial);
    }
    for (const curated of this.curatedTutorsCache) {
      mergedMap.set(curated.id, curated);
    }
    for (const su of serverUsers) {
      const existing = mergedMap.get(su.id);
      mergedMap.set(su.id, existing ? { ...existing, ...su } : su);
    }
    for (const u of this.users) {
      if (!mergedMap.has(u.id)) {
        mergedMap.set(u.id, u);
      }
    }
    this.users = Array.from(mergedMap.values()).filter(
      (u: any) => u && u.deleted !== true && u.status !== 'deleted'
    );
  }

  public applyRoomsData(rooms: any[]) {
    if (!Array.isArray(rooms)) return;
    this.chatRooms = rooms;
    if (rooms.length === 0) {
      this.chats = [];
      return;
    }
    this.chats = rooms.map((r: any) => {
      const members = r.members || [];
      const memberIds = members.map((m: any) => m.userId);
      const studentMember = members.find((m: any) => m.role === 'student' || m.user?.role === 'student');
      const tutorMember = members.find(
        (m: any) =>
          m.role === 'tutor' ||
          m.user?.role === 'tutor' ||
          (!m.userId?.startsWith('admin_') && m.userId !== (studentMember?.userId || r.createdBy))
      );

      const studentId = r.studentId || r.student?.id || studentMember?.userId || memberIds[0] || r.createdBy;
      const tutorId =
        r.tutorId ||
        r.tutor?.id ||
        tutorMember?.userId ||
        memberIds.find((id: string) => id !== studentId) ||
        r.order?.tutorId ||
        'tutor_clara';

      return {
        id: r.id,
        studentId,
        tutorId,
        orderId: r.orderId,
        subject: r.title || (r.order?.title ? `${r.order.subject} - ${r.order.title}` : 'Academic Mentorship'),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        pairedTutor: r.tutor || null,
        pairedStudent: r.student || null,
        order: r.order || null,
      };
    });
  }

  public async fetchData() {
    if (this.inFlightFetchData) {
      return this.inFlightFetchData;
    }

    if (this.fetchDataAbortController) {
      this.fetchDataAbortController.abort();
    }
    const controller = new AbortController();
    this.fetchDataAbortController = controller;
    const { signal } = controller;

    this.inFlightFetchData = (async () => {
      let hadError = false;
      let latestErrMsg: string | null = null;
      try {
        const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
        const needsFullDirectoryImmediately =
          Boolean(this.currentUser) ||
          /\/(tutors|tutors-directory|find-a-tutor|user-data|get-a-quote|online-tutoring|services|our-blog|blog|admin|student|tutor)/.test(
            pathname
          );
        if (needsFullDirectoryImmediately) {
          await this.ensureCatalogDataLoaded();
        }
        const usersUrl = needsFullDirectoryImmediately
          ? '/api/users?page=1&limit=2500'
          : '/api/users?role=tutor&page=1&limit=12';
        const blogsUrl = needsFullDirectoryImmediately
          ? '/api/blogs?page=1&limit=30'
          : '/api/blogs?page=1&limit=12';

        const usersPromise = apiFetch(usersUrl, { signal })
          .then(async (res) => {
            if (res.ok) {
              const uData = await res.json();
              if (Array.isArray(uData.users)) {
                this.mergeServerUsers(uData.users);
                if (needsFullDirectoryImmediately) {
                  this.fullDirectoryLoaded = true;
                }
              }
            } else {
              hadError = true;
              latestErrMsg = `Failed to sync directory (${res.status})`;
            }
          })
          .catch((err) => {
            if (!isAbortError(err)) {
              hadError = true;
              latestErrMsg = getFriendlyErrorMessage(err, 'Unable to load tutors directory.');
            }
          });

        const blogsPromise = apiFetch(blogsUrl, { signal })
          .then(async (res) => {
            if (res.ok) {
              const bData = await res.json();
              if (Array.isArray(bData.blogs) && bData.blogs.length > 0) {
                this.blogs = bData.blogs.map((b: any) => ({
                  ...b,
                  image: b.imageUrl || b.image,
                  imageUrl: b.imageUrl || b.image,
                  tags: typeof b.tags === 'string' ? JSON.parse(b.tags || '[]') : (b.tags || []),
                }));
              } else if (this.blogs.length === 0) {
                await this.ensureCatalogDataLoaded();
              }
            }
          })
          .catch(() => {});

        if (!this.currentUser) {
          await Promise.all([usersPromise, blogsPromise]);
          if (signal.aborted) return;
          this.connectionStatus = hadError ? 'error' : 'connected';
          this.lastSyncTime = new Date().toLocaleTimeString();
          this.syncError = hadError ? latestErrMsg : null;
          return;
        }

        const isStaff =
          this.currentUser.role === UserRole.ADMIN ||
          this.currentUser.role === UserRole.SUBADMIN ||
          (this.currentUser.role as string) === 'admin' ||
          (this.currentUser.role as string) === 'subadmin';

        const safePrivateFetch = async (url: string, handler: (data: any) => void) => {
          try {
            const res = await apiFetch(url, { signal });
            if (res.ok) {
              const data = await res.json();
              handler(data);
            } else if (res.status !== 401 && res.status !== 403) {
              hadError = true;
              const errData = await res.json().catch(() => ({}));
              latestErrMsg = errData?.error || `Sync warning (${res.status})`;
            }
          } catch (err) {
            if (!isAbortError(err)) {
              hadError = true;
              latestErrMsg = getFriendlyErrorMessage(err, 'Sync timeout or network error.');
            }
          }
        };

        const privateTasks: Promise<void>[] = [
          safePrivateFetch('/api/orders?page=1&limit=50', (oData) => {
            if (Array.isArray(oData.orders)) {
              this.assignments = oData.orders.map((o: any) => ({
                ...o,
                wordCount: o.wordCount || 250,
                fileUrls: typeof o.fileUrls === 'string' ? JSON.parse(o.fileUrls || '[]') : (o.fileUrls || []),
                fileNames: typeof o.fileNames === 'string' ? JSON.parse(o.fileNames || '[]') : (o.fileNames || []),
              }));
            }
          }),
          safePrivateFetch('/api/chat-rooms?page=1&limit=50', (rData) => {
            if (Array.isArray(rData.rooms)) {
              this.applyRoomsData(rData.rooms);
            }
          }),
          safePrivateFetch('/api/messages?page=1&limit=100', (mData) => {
            if (Array.isArray(mData.messages)) {
              this.messages = mData.messages.map((m: any) => ({
                ...m,
                timestamp: m.createdAt,
              }));
            }
          }),
          safePrivateFetch('/api/quotes?page=1&limit=50', (qData) => {
            if (Array.isArray(qData.quotes)) {
              this.quotes = qData.quotes;
            }
          }),
          safePrivateFetch('/api/payments?page=1&limit=50', (pData) => {
            if (Array.isArray(pData.payments)) {
              this.payments = pData.payments;
            }
          }),
          safePrivateFetch('/api/invoices?page=1&limit=50', (iData) => {
            if (Array.isArray(iData.invoices)) {
              this.invoices = iData.invoices;
            }
          }),
          safePrivateFetch(
            `/api/notifications?userId=${encodeURIComponent(this.currentUser.id)}&page=1&limit=50`,
            (nData) => {
              if (Array.isArray(nData.notifications)) {
                this.appNotifications = nData.notifications;
              }
            }
          ),
        ];

        if (isStaff) {
          privateTasks.push(
            safePrivateFetch('/api/audit-logs?page=1&limit=50', (lData) => {
              if (Array.isArray(lData.logs)) {
                this.activityLogs = lData.logs.map((l: any) => ({
                  id: l.id,
                  userId: l.userId || '',
                  userName: l.userName || '',
                  userRole: (l.userRole || 'student') as UserRole,
                  action: l.action,
                  details: l.details,
                  timestamp: l.createdAt,
                }));
              }
            })
          );
        }

        await Promise.all([usersPromise, blogsPromise, ...privateTasks]);
        if (signal.aborted) return;
        this.connectionStatus = hadError ? 'error' : 'connected';
        this.lastSyncTime = new Date().toLocaleTimeString();
        this.syncError = hadError ? latestErrMsg : null;
      } catch (err: any) {
        if (isAbortError(err)) return;
        this.connectionStatus = 'offline';
        this.syncError = getFriendlyErrorMessage(err, 'Unable to reach server.');
      } finally {
        this.inFlightFetchData = null;
        if (this.fetchDataAbortController === controller) {
          this.fetchDataAbortController = null;
        }
        this.notify();
      }
    })();

    return this.inFlightFetchData;
  }

  private startLiveStudentCounter() {
    if (typeof window === 'undefined' || this.liveCounterTimer) return;
    this.liveCounterTimer = setInterval(() => {
      if (document.hidden) return;
      const delta = Math.floor(Math.random() * 5) - 2;
      this.activeStudentsOnline = Math.max(45, Math.min(140, this.activeStudentsOnline + delta));
      this.notify();
    }, 45000);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Store listener error: ', e);
      }
    });
  }

  // ==========================================
  // SYNCHRONOUS CHAT STATE HELPERS
  // ==========================================

  getOrCreateChat(studentId: string, tutorId: string, subject: string = 'Academic Mentorship'): Chat {
    const existing = this.chats.find(
      (c) =>
        (c.studentId === studentId && c.tutorId === tutorId) ||
        (c.studentId === tutorId && c.tutorId === studentId)
    );
    if (existing) return existing;

    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId,
      tutorId,
      subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.chats.push(newChat);
    this.notify();

    apiFetch('/api/chat-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newChat.id,
        title: subject,
        type: 'direct',
        memberIds: [studentId, tutorId],
      }),
    }).catch((err) => console.warn('[STORE] Notice registering room on backend:', err));

    return newChat;
  }

  deleteChat(chatId: string) {
    this.chats = this.chats.filter((c) => c.id !== chatId);
    this.messages = this.messages.filter((m) => m.chatId !== chatId);
    this.notify();
  }

  markMessagesAsRead(chatId: string, currentUserId: string) {
    this.messages.forEach((m) => {
      if (m.chatId === chatId && m.senderId !== currentUserId) {
        m.read = true;
      }
    });
    this.notify();
  }

  setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat) {
      if (chat.studentId === userId) {
        chat.studentIsTyping = isTyping;
      } else {
        chat.tutorIsTyping = isTyping;
      }
      this.notify();
    }
  }

  // ==========================================
  // LAZY-DELEGATED OPERATIONS (Code-Split Chunk)
  // ==========================================

  public async loadDashboardTabData(
    role: string,
    tab: string,
    options?: { force?: boolean; page?: number; limit?: number; search?: string }
  ): Promise<void> {
    const ops = await this.loadOps();
    return ops.loadDashboardTabData(this, role, tab, options);
  }

  async subscribeToChatDetails(chatId: string) {
    const ops = await this.loadOps();
    return ops.subscribeToChatDetails(this, chatId);
  }

  async login(email: string, password?: string): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.login(this, email, password);
  }

  async register(name: string, email: string, role: UserRole, extra?: any): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.register(this, name, email, role, extra);
  }

  async logout(): Promise<void> {
    const ops = await this.loadOps();
    return ops.logout(this);
  }

  async createTutorProfile(tutorData: any): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.createTutorProfile(this, tutorData);
  }

  async registerTutorFromModal(tutorData: any): Promise<boolean> {
    return this.createTutorProfile(tutorData);
  }

  async verifyUser(userId: string) {
    const ops = await this.loadOps();
    return ops.verifyUser(this, userId);
  }

  async toggleUserStatus(userId: string) {
    const ops = await this.loadOps();
    return ops.toggleUserStatus(this, userId);
  }

  async updateUserRole(userId: string, targetRole: UserRole) {
    const ops = await this.loadOps();
    return ops.updateUserRole(this, userId, targetRole);
  }

  async deleteUser(userId: string) {
    const ops = await this.loadOps();
    return ops.deleteUser(this, userId);
  }

  async updateUserProfile(userId: string, data: Partial<User>) {
    const ops = await this.loadOps();
    return ops.updateUserProfile(this, userId, data);
  }

  async updateUser(userId: string, data: Partial<User>) {
    return this.updateUserProfile(userId, data);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.requestPasswordReset(email);
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.resetPassword(this, email, token, newPassword, confirmPassword);
  }

  async addMessage(
    chatId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
    fileName?: string,
    isSystem?: boolean,
    orderId?: string
  ): Promise<Message> {
    const ops = await this.loadOps();
    return ops.addMessage(this, chatId, senderId, content, fileUrl, fileName, isSystem, orderId);
  }

  sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
    fileName?: string,
    isSystem?: boolean,
    orderId?: string
  ) {
    return this.addMessage(chatId, senderId, content, fileUrl, fileName, isSystem, orderId);
  }

  async addQuote(
    chatId: string,
    tutorId: string,
    amount: number,
    estimatedHours: number,
    serviceType?: string,
    deliveryTime?: string,
    scopeOfWork?: string,
    advancePercentage: number = 50,
    orderId?: string,
    notes?: string
  ): Promise<Quote> {
    const ops = await this.loadOps();
    return ops.addQuote(
      this,
      chatId,
      tutorId,
      amount,
      estimatedHours,
      serviceType,
      deliveryTime,
      scopeOfWork,
      advancePercentage,
      orderId,
      notes
    );
  }

  async updateQuoteStatus(quoteId: string, status: 'accepted' | 'declined') {
    const ops = await this.loadOps();
    return ops.updateQuoteStatus(this, quoteId, status);
  }

  async addAssignment(
    studentId: string,
    title: string,
    subject: string,
    deadline: string,
    instructions: string,
    wordCount: number = 250,
    referenceStyle: string = 'APA 7th',
    sourcesCount: number = 2,
    fileUrls: string[] = [],
    fileNames: string[] = [],
    tutorId?: string
  ): Promise<Assignment> {
    const ops = await this.loadOps();
    return ops.addAssignment(
      this,
      studentId,
      title,
      subject,
      deadline,
      instructions,
      wordCount,
      referenceStyle,
      sourcesCount,
      fileUrls,
      fileNames,
      tutorId
    );
  }

  async createAssignmentWithDirectInvoice(
    studentId: string,
    title: string,
    subject: string,
    deadline: string,
    instructions: string,
    quoteAmount: number,
    wordCount: number = 250,
    referenceStyle: string = 'APA 7th',
    sourcesCount: number = 2,
    fileUrls: string[] = [],
    fileNames: string[] = [],
    tutorId?: string
  ): Promise<Assignment> {
    const ops = await this.loadOps();
    return ops.createAssignmentWithDirectInvoice(
      this,
      studentId,
      title,
      subject,
      deadline,
      instructions,
      quoteAmount,
      wordCount,
      referenceStyle,
      sourcesCount,
      fileUrls,
      fileNames,
      tutorId
    );
  }

  async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus) {
    const ops = await this.loadOps();
    return ops.updateAssignmentStatus(this, assignmentId, status);
  }

  async assignTutorToAssignment(assignmentId: string, tutorId: string) {
    const ops = await this.loadOps();
    return ops.assignTutorToAssignment(this, assignmentId, tutorId);
  }

  async assignTutor(assignmentId: string, tutorId: string) {
    return this.assignTutorToAssignment(assignmentId, tutorId);
  }

  async updateAssignmentProgress(assignmentId: string, progressPercent: number) {
    const ops = await this.loadOps();
    return ops.updateAssignmentProgress(this, assignmentId, progressPercent);
  }

  async setAssignmentCustomPrice(assignmentId: string, price: number) {
    const ops = await this.loadOps();
    return ops.setAssignmentCustomPrice(this, assignmentId, price);
  }

  async completeAssignmentByTutor(assignmentId: string, fileUrl: string, fileName: string) {
    const ops = await this.loadOps();
    return ops.completeAssignmentByTutor(this, assignmentId, fileUrl, fileName);
  }

  async approveAssignmentAndReleasePayment(assignmentId: string, rating?: number, reviewComment?: string) {
    const ops = await this.loadOps();
    return ops.approveAssignmentAndReleasePayment(this, assignmentId, rating, reviewComment);
  }

  async requestAssignmentRevision(assignmentId: string, revisionNotes: string) {
    const ops = await this.loadOps();
    return ops.requestAssignmentRevision(this, assignmentId, revisionNotes);
  }

  async updateAssignment(assignmentId: string, updates: Partial<Assignment>) {
    const ops = await this.loadOps();
    return ops.updateAssignment(this, assignmentId, updates);
  }

  async deleteAssignment(assignmentId: string) {
    const ops = await this.loadOps();
    return ops.deleteAssignment(this, assignmentId);
  }

  async createAssignmentOrder(data: {
    studentId: string;
    title: string;
    subject: string;
    deadline: string;
    academicLevel?: string;
    pages?: number;
    wordCount?: number;
    referenceStyle?: string;
    sourcesCount?: number;
    instructions?: string;
    budget?: number;
    quoteAmount?: number;
    tutorId?: string;
    status?: AssignmentStatus;
    escrowStatus?: string;
    fileUrls?: string[];
    fileNames?: string[];
  }) {
    const ops = await this.loadOps();
    return ops.createAssignmentOrder(this, data);
  }

  async releaseEscrow(assignmentId: string) {
    const ops = await this.loadOps();
    return ops.releaseEscrow(this, assignmentId);
  }

  async updateInvoiceStatus(invoiceId: string, status: 'due' | 'paid' | 'pending' | 'uninvoiced') {
    const ops = await this.loadOps();
    return ops.updateInvoiceStatus(this, invoiceId, status);
  }

  async addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>) {
    const ops = await this.loadOps();
    return ops.addInvoice(this, invoice);
  }

  async recordPayment(paymentData: {
    assignmentId: string;
    studentId?: string;
    amount: number;
    status?: 'escrow' | 'released' | 'refunded';
    type?: 'advance' | 'balance' | 'full';
    notes?: string;
  }): Promise<Payment | null> {
    const ops = await this.loadOps();
    return ops.recordPayment(this, paymentData);
  }

  async processAdvancePayment(assignmentId: string, amount: number) {
    return this.recordPayment({
      assignmentId,
      studentId: this.currentUser?.id,
      amount,
      status: 'escrow',
      type: 'advance',
      notes: 'Initial 50% Advance Escrow Payment',
    });
  }

  async processBalancePayment(assignmentId: string, amount: number) {
    return this.recordPayment({
      assignmentId,
      studentId: this.currentUser?.id,
      amount,
      status: 'escrow',
      type: 'balance',
      notes: 'Milestone Balance Escrow Settlement',
    });
  }

  async addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const ops = await this.loadOps();
    return ops.addNotification(this, notif);
  }

  async markNotificationRead(notifId: string) {
    const ops = await this.loadOps();
    return ops.markNotificationRead(this, notifId);
  }

  async markAllNotificationsRead(userId: string) {
    const ops = await this.loadOps();
    return ops.markAllNotificationsRead(this, userId);
  }

  async addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const ops = await this.loadOps();
    return ops.addActivityLog(this, log);
  }

  async addAssignmentReport(report: Omit<AssignmentReport, 'id' | 'createdAt'>) {
    const ops = await this.loadOps();
    return ops.addAssignmentReport(this, report);
  }

  async updateAssignmentReportStatus(
    reportId: string,
    status: AssignmentReport['status'],
    feedback?: string
  ) {
    const ops = await this.loadOps();
    return ops.updateAssignmentReportStatus(this, reportId, status, feedback);
  }

  async addAgreement(agreement: Omit<Agreement, 'id' | 'sentAt' | 'status'>) {
    const ops = await this.loadOps();
    return ops.addAgreement(this, agreement);
  }

  async signAgreement(agreementId: string) {
    const ops = await this.loadOps();
    return ops.signAgreement(this, agreementId);
  }

  async addBlog(
    titleOrBlog: any,
    content?: string,
    image?: string,
    category?: string,
    tags?: string[],
    adminId?: string
  ) {
    const ops = await this.loadOps();
    return ops.addBlog(this, titleOrBlog, content, image, category, tags, adminId);
  }

  async deleteBlog(blogId: string) {
    const ops = await this.loadOps();
    return ops.deleteBlog(this, blogId);
  }

  async updateBlog(
    blogId: string,
    titleOrData: any,
    content?: string,
    image?: string,
    category?: string,
    tags?: string[]
  ) {
    const ops = await this.loadOps();
    return ops.updateBlog(this, blogId, titleOrData, content, image, category, tags);
  }

  async syncDefaultBlogs(): Promise<boolean> {
    const ops = await this.loadOps();
    return ops.syncDefaultBlogs(this);
  }

  async addFAQ(faq: Omit<FAQ, 'id'>) {
    const ops = await this.loadOps();
    return ops.addFAQ(this, faq);
  }

  async addFaq(question: string, answer: string, category: any) {
    return this.addFAQ({ question, answer, category, order: this.faqs.length + 1 });
  }

  async deleteFAQ(faqId: string) {
    const ops = await this.loadOps();
    return ops.deleteFAQ(this, faqId);
  }

  async deleteFaq(faqId: string) {
    return this.deleteFAQ(faqId);
  }

  // ==========================================
  // ACTION ALIASES FOR COMPONENT COMPATIBILITY
  // ==========================================

  offerQuote(
    chatId: string,
    amount: number,
    estimatedHours: number,
    serviceType?: string,
    deliveryTime?: string,
    scopeOfWork?: string,
    advancePercentage?: number,
    _advanceAmount?: number,
    _balanceAmount?: number
  ) {
    return this.addQuote(
      chatId,
      'tutor_clara',
      amount,
      estimatedHours,
      serviceType,
      deliveryTime,
      scopeOfWork,
      advancePercentage || 50
    );
  }

  acceptQuote(quoteId: string) {
    return this.updateQuoteStatus(quoteId, 'accepted');
  }

  async submitAssignment(data: any): Promise<string> {
    const assign = await this.addAssignment(
      data.studentId || this.currentUser?.id || 'student_alex',
      data.title || 'Assignment Brief',
      data.subject || 'General Academics',
      data.deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
      data.instructions || '',
      data.wordCount || 250,
      data.referenceStyle || 'APA 7th',
      data.sourcesCount || 2,
      data.fileUrls || [],
      data.fileNames || [],
      data.tutorId
    );
    return assign.id;
  }

  studentReviewAndApprove(assignId: string, rating?: number, comment?: string) {
    return this.approveAssignmentAndReleasePayment(assignId, rating, comment);
  }

  studentRequestRevision(assignId: string, details: string) {
    return this.requestAssignmentRevision(assignId, details);
  }

  raiseTicket(studentId: string, sub: string, msg: string) {
    return this.addSupportTicket(studentId, sub, msg);
  }

  tutorDeliverWork(assignId: string, fileUrl: string, fileName: string) {
    return this.completeAssignmentByTutor(assignId, fileUrl, fileName);
  }

  toggleUserSuspension(userId: string) {
    return this.toggleUserStatus(userId);
  }

  changeUserRole(userId: string, targetRole: UserRole) {
    return this.updateUserRole(userId, targetRole);
  }

  adminProcessRefund(assignmentId: string) {
    return this.arbitrateRefund(assignmentId);
  }

  resolveTicket(ticketId: string) {
    return this.resolveSupportTicket(ticketId);
  }

  createAssignmentReport(report: any) {
    return this.addAssignmentReport(report);
  }

  setAssignmentPrice(assignmentId: string, price: number) {
    return this.setAssignmentCustomPrice(assignmentId, price);
  }

  settleInvoice(invoiceId: string) {
    return this.updateInvoiceStatus(invoiceId, 'paid');
  }

  createInvoice(invoice: any) {
    return this.addInvoice(invoice);
  }

  sendAppNotification(notif: any) {
    return this.addNotification(notif);
  }

  sendMissingPaymentNotification(assignmentId: string, studentEmail: string, _studentName: string, amount: number) {
    return this.addNotification({
      userId: studentEmail,
      title: 'Pending Escrow Payment',
      message: `Assignment #${assignmentId} requires confirmed payment of $${amount}.`,
      type: 'both',
      sentBy: 'Admin Accounting',
    });
  }

  createAgreement(agreement: any) {
    return this.addAgreement(agreement);
  }

  sendTriggerEmail(to: string, subject: string, htmlContent: string) {
    return this.sendTriggeredEmail(to, subject, htmlContent);
  }

  submitTutorApplication(data: any) {
    return this.registerTutorFromModal(data);
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    const user = this.users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (user) {
      await this.verifyUser(user.id);
      return true;
    }
    return true;
  }

  async resetUserPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    return this.resetPassword(email, token, newPassword);
  }

  async addSupportTicket(studentId: string, subject: string, message: string) {
    const ops = await this.loadOps();
    return ops.addSupportTicket(this, studentId, subject, message);
  }

  async resolveSupportTicket(ticketId: string) {
    const ops = await this.loadOps();
    return ops.resolveSupportTicket(this, ticketId);
  }

  async arbitrateRefund(assignmentId: string, notes?: string) {
    const ops = await this.loadOps();
    return ops.arbitrateRefund(this, assignmentId, notes);
  }

  async sendTriggeredEmail(to: string, subject: string, htmlContent: string) {
    const ops = await this.loadOps();
    return ops.sendTriggeredEmail(this, to, subject, htmlContent);
  }

  async seedMockStudentData() {
    console.log('[STORE] Initialized default mock student and assignment records.');
  }
}

export const store = new AppStore();
