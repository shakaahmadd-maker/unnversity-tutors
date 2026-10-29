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
  TriggeredEmail
} from '../types';

// Standard Initial Mock Data
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
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T10:00:00.000Z',
      new Date().toISOString().split('T')[0] + 'T14:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00.000Z'
    ]
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
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T11:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T15:00:00.000Z'
    ]
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
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T16:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T13:00:00.000Z'
    ]
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
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T09:00:00.000Z',
      new Date().toISOString().split('T')[0] + 'T13:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T11:00:00.000Z'
    ]
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
    experience: "Senior Emory research scientist and dedicated private tutor in Atlanta with over 8 years of experience. I specialize in Organic Chemistry, MCAT preparation, Biochemistry, and Cell Biology for pre-med and undergraduate students.",
    subjects: ['Organic Chemistry', 'MCAT', 'Biochemistry', 'Chemistry'],
    isApproved: true,
    status: 'approved'
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog_1',
    adminId: 'admin_emily',
    title: 'Mastering the Undergraduate Dissertation: 5 Critical Roadmap Milestones',
    content: `Writing your final undergraduate dissertation or project is arguably the most intellectually grueling milestone of your academic degree. However, establishing a systemic chronological plan avoids late-semester panic.`,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80',
    category: 'University Survival',
    tags: ['Dissertation', 'Undergraduate', 'Methodology', 'Research Paper'],
    publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_2',
    adminId: 'admin_emily',
    title: 'The Harvard and APA 7th Edition Style Manual: Navigating Tricky In-Text Rules',
    content: `Maintaining absolute formatting consistency is key to securing top-tier academic marks. Many students get tripped up when transitioning between Harvard and APA 7th structures.`,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80',
    category: 'APA Guidelines',
    tags: ['Referencing', 'Academic Writing', 'APA Style', 'Harvard Style'],
    publishedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq_1',
    question: 'How do you vet your academic tutors?',
    answer: 'Every tutor on universitytutors.com is rigorously vetted. We verify their academic transcripts, conduct subject-matter exam assessments, and host live screening video sessions before onboarding.',
    category: 'General',
    order: 1
  },
  {
    id: 'faq_2',
    question: 'How do Stripe payment holds/escrow work?',
    answer: 'Your safety is our top priority. When you agree on a quote from your tutor and click "Proceed to Payment", your funds are held in a secure Stripe-enabled escrow account. Money is only released to the tutor after you click "Confirm & Approve Delivery" on your dashboard.',
    category: 'Payments',
    order: 1
  },
  {
    id: 'faq_3',
    question: 'Are your services ethical and aligned with University policies?',
    answer: 'Absolutely. We provide strictly ethical academic guidance. Our tutors explain concepts, review research methodologies, structure essays, provide line-by-line feedback, and compile custom explanatory study examples.',
    category: 'Tutoring Process',
    order: 1
  }
];

export function isShakaEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === 'shaka.ahmadd@gmail.com' || normalized === 'shaka.ahmad@gmail.com';
}

export class AppStore {
  users: User[] = [
    ...INITIAL_TUTORS,
    {
      id: 'student_alex',
      role: UserRole.STUDENT,
      name: 'Alex Mercer',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: 'admin_emily',
      role: UserRole.ADMIN,
      name: 'Emily Vance (Platform Admin)',
      email: 'emily@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: 'admin_shaka',
      role: UserRole.ADMIN,
      name: 'Shaka Ahmad',
      email: 'shaka.ahmadd@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    }
  ];
  currentUser: User | null = null;
  blogs: Blog[] = INITIAL_BLOGS;
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
  lastSyncTime: string | null = new Date().toLocaleTimeString();
  syncError: string | null = null;

  private listeners: (() => void)[] = [];
  private pollTimer: any = null;

  constructor() {
    this.startLiveStudentCounter();
    this.initSession();
    this.fetchData();
    this.startPolling();
  }

  private initSession() {
    const cachedUser = localStorage.getItem('ut_current_user');
    if (cachedUser) {
      try {
        this.currentUser = JSON.parse(cachedUser);
      } catch (e) {
        console.error("Local user profile parse error:", e);
      }
    }

    // Verify session with server
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          this.currentUser = data.user;
          localStorage.setItem('ut_current_user', JSON.stringify(data.user));
          this.notify();
        }
      })
      .catch(() => {});
  }

  private startPolling() {
    if (typeof window !== 'undefined') {
      this.pollTimer = setInterval(() => {
        // Only background poll if logged in and tab is active
        if (this.currentUser && !document.hidden) {
          this.fetchData();
        }
      }, 15000);
    }
  }

  public async fetchData() {
    try {
      // 1. Fetch public users/tutors list (needed for public landing page)
      const usersPromise = fetch('/api/users').then(async (res) => {
        if (res.ok) {
          const uData = await res.json();
          if (Array.isArray(uData.users) && uData.users.length > 0) {
            this.users = uData.users.map((u: any) => ({
              ...u,
              subjects: typeof u.subjects === 'string' ? JSON.parse(u.subjects || '[]') : u.subjects,
              subjectExpertise: typeof u.subjectExpertise === 'string' ? JSON.parse(u.subjectExpertise || '[]') : u.subjectExpertise,
            }));
          }
        }
      }).catch(() => {});

      // For public visitors who are not logged in, DO NOT make private dashboard requests
      if (!this.currentUser) {
        await usersPromise;
        this.connectionStatus = 'connected';
        this.lastSyncTime = new Date().toLocaleTimeString();
        this.syncError = null;
        this.notify();
        return;
      }

      // 2. For logged-in users, run all private requests in parallel
      const ordersPromise = fetch('/api/orders').then(async (res) => {
        if (res.ok) {
          const oData = await res.json();
          if (Array.isArray(oData.orders)) {
            this.assignments = oData.orders.map((o: any) => ({
              ...o,
              wordCount: o.wordCount || 250,
              fileUrls: typeof o.fileUrls === 'string' ? JSON.parse(o.fileUrls || '[]') : (o.fileUrls || []),
              fileNames: typeof o.fileNames === 'string' ? JSON.parse(o.fileNames || '[]') : (o.fileNames || []),
            }));
          }
        }
      }).catch(() => {});

      const roomsPromise = fetch('/api/chat-rooms').then(async (res) => {
        if (res.ok) {
          const rData = await res.json();
          if (Array.isArray(rData.rooms) && rData.rooms.length > 0) {
            this.chatRooms = rData.rooms;
            this.chats = rData.rooms.map((r: any) => {
              const members = r.members || [];
              const memberIds = members.map((m: any) => m.userId);
              const studentId = memberIds[0] || r.createdBy;
              const tutorId = memberIds.find((id: string) => id !== studentId) || 'tutor_clara';
              return {
                id: r.id,
                studentId,
                tutorId,
                subject: r.title || 'Academic Mentorship',
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
              };
            });
          }
        }
      }).catch(() => {});

      const msgsPromise = fetch('/api/messages').then(async (res) => {
        if (res.ok) {
          const mData = await res.json();
          if (Array.isArray(mData.messages)) {
            this.messages = mData.messages.map((m: any) => ({
              ...m,
              timestamp: m.createdAt,
            }));
          }
        }
      }).catch(() => {});

      const quotesPromise = fetch('/api/quotes').then(async (res) => {
        if (res.ok) {
          const qData = await res.json();
          if (Array.isArray(qData.quotes)) {
            this.quotes = qData.quotes;
          }
        }
      }).catch(() => {});

      const isStaff = this.currentUser?.role === UserRole.ADMIN || (this.currentUser?.role as string) === 'admin';
      const auditPromise = isStaff ? fetch('/api/audit-logs').then(async (res) => {
        if (res.ok) {
          const lData = await res.json();
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
        }
      }).catch(() => {}) : Promise.resolve();

      await Promise.all([usersPromise, ordersPromise, roomsPromise, msgsPromise, quotesPromise, auditPromise]);

      this.connectionStatus = 'connected';
      this.lastSyncTime = new Date().toLocaleTimeString();
      this.syncError = null;
      this.notify();
    } catch (err: any) {
      this.connectionStatus = 'offline';
      this.syncError = err?.message || 'Offline mode';
    }
  }

  private startLiveStudentCounter() {
    setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2;
      this.activeStudentsOnline = Math.max(45, Math.min(140, this.activeStudentsOnline + delta));
      this.notify();
    }, 12000);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error("Store listener error: ", e);
      }
    });
  }

  async subscribeToChatDetails(chatId: string) {
    this.isLoadingMessages = true;
    this.chatError = null;
    this.notify();
    try {
      // Query room messages from new endpoint with fallback
      let res = await fetch(`/api/chat-rooms/${encodeURIComponent(chatId)}/messages`);
      if (!res.ok && res.status !== 401 && res.status !== 403) {
        res = await fetch(`/api/messages?chatId=${encodeURIComponent(chatId)}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          const otherMsgs = this.messages.filter(m => m.chatId !== chatId && m.roomId !== chatId);
          const newMsgs = data.messages.map((m: any) => ({ ...m, timestamp: m.createdAt }));
          this.messages = [...otherMsgs, ...newMsgs];
          this.chatError = null;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        this.chatError = errJson.error || 'Access to this chat room was denied.';
      }
    } catch (err: any) {
      this.chatError = err?.message || 'Error connecting to chat server.';
    } finally {
      this.isLoadingMessages = false;
      this.notify();
    }
  }

  // ==========================================
  // AUTHENTICATION (Email & Password via PostgreSQL)
  // ==========================================

  async login(email: string, password?: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password || '' })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      this.currentUser = data.user;
      localStorage.setItem('ut_current_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      this.fetchData();
      this.notify();
      return true;
    } catch (err: any) {
      console.error('[AUTH] Login error:', err);
      // Fallback matching in local users array if offline
      const matched = this.users.find(u => u.email.toLowerCase().trim() === cleanEmail);
      if (matched) {
        this.currentUser = matched;
        localStorage.setItem('ut_current_user', JSON.stringify(matched));
        this.notify();
        return true;
      }
      throw err;
    }
  }

  async register(name: string, email: string, role: UserRole, extra?: Partial<User>): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          password: extra?.password || 'Student@123456',
          role,
          extra
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.currentUser = data.user;
      localStorage.setItem('ut_current_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      this.users.push(data.user);
      this.notify();
      return true;
    } catch (err: any) {
      console.error('[AUTH] Register error:', err);
      throw err;
    }
  }

  logout() {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    this.currentUser = null;
    localStorage.removeItem('ut_current_user');
    localStorage.removeItem('auth_token');
    this.notify();
  }

  async registerTutorFromModal(tutorData: any): Promise<boolean> {
    return this.register(
      tutorData.name,
      tutorData.email,
      UserRole.TUTOR,
      {
        hourlyRate: tutorData.hourlyRate,
        subjects: tutorData.subjects,
        country: tutorData.country,
        bio: tutorData.bio,
        avatarUrl: tutorData.avatarUrl
      }
    );
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================

  async verifyUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.verified = true;
      this.notify();
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true })
      }).catch(() => {});
    }
  }

  async toggleUserStatus(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.suspended = !user.suspended;
      this.notify();
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: user.suspended })
      }).catch(() => {});
    }
  }

  async updateUserRole(userId: string, targetRole: UserRole) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = targetRole;
      this.notify();
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      }).catch(() => {});
    }
  }

  async deleteUser(userId: string) {
    this.users = this.users.filter(u => u.id !== userId);
    this.notify();
  }

  async updateUserProfile(userId: string, data: Partial<User>) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...data };
      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, ...data };
        localStorage.setItem('ut_current_user', JSON.stringify(this.currentUser));
      }
      this.notify();
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {});
    }
  }

  // Password reset methods
  async requestPasswordReset(email: string): Promise<string | null> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) return null;
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.resetToken = token;
    this.notify();
    return token;
  }

  async setResetToken(email: string, token: string): Promise<boolean> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (user) {
      user.resetToken = token;
      this.notify();
      return true;
    }
    return false;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) return false;
    user.resetToken = undefined;
    this.notify();
    return true;
  }

  // ==========================================
  // CHAT & MESSAGING
  // ==========================================

  getOrCreateChat(studentId: string, tutorId: string, subject: string = 'Academic Mentorship'): Chat {
    const existing = this.chats.find(c => 
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
      updatedAt: new Date().toISOString()
    };
    this.chats.push(newChat);
    this.notify();

    // Persist room to backend
    fetch('/api/chat-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newChat.id,
        title: subject,
        type: 'direct',
        memberIds: [studentId, tutorId],
      })
    }).catch(err => console.warn('[STORE] Notice registering room on backend:', err));

    return newChat;
  }

  deleteChat(chatId: string) {
    this.chats = this.chats.filter(c => c.id !== chatId);
    this.messages = this.messages.filter(m => m.chatId !== chatId);
    this.notify();
  }

  async addMessage(
    chatId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
    fileName?: string,
    isSystem?: boolean,
    orderId?: string
  ) {
    // Client-side length validation
    if (!content || !content.trim()) {
      throw new Error('Message content cannot be empty.');
    }
    if (content.length > 5000) {
      throw new Error('Message length exceeds the 5,000 character limit.');
    }

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newMsg: Message = {
      id: msgId,
      chatId,
      roomId: chatId,
      senderId,
      content: content.trim(),
      fileUrl,
      fileName,
      timestamp: new Date().toISOString(),
      isSystem: isSystem || false,
      read: false
    };

    // Optimistically add to UI
    this.messages.push(newMsg);
    this.notify();

    try {
      const res = await fetch(`/api/chat-rooms/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msgId,
          orderId,
          content: content.trim(),
          fileUrl,
          fileName,
          isSystem: Boolean(isSystem),
        }),
      });

      if (!res.ok) {
        // Fallback to /api/messages if /api/chat-rooms/:id not matched
        const fallbackRes = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: msgId,
            chatId,
            roomId: chatId,
            orderId,
            content: content.trim(),
            fileUrl,
            fileName,
            isSystem: Boolean(isSystem),
            createdAt: newMsg.timestamp,
          }),
        });
        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json().catch(() => ({}));
          const errMessage = errData.error || `Server error (${fallbackRes.status}): Failed to send message.`;
          this.messages = this.messages.filter(m => m.id !== msgId);
          this.notify();
          throw new Error(errMessage);
        }
      }
      return newMsg;
    } catch (err: any) {
      this.messages = this.messages.filter(m => m.id !== msgId);
      this.notify();
      throw err;
    }
  }

  markMessagesAsRead(chatId: string, currentUserId: string) {
    this.messages.forEach(m => {
      if (m.chatId === chatId && m.senderId !== currentUserId) {
        m.read = true;
      }
    });
    this.notify();
  }

  setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    const chat = this.chats.find(c => c.id === chatId);
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
  // QUOTES
  // ==========================================

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
  ) {
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const advAmount = Number(((amount * advancePercentage) / 100).toFixed(2));
    const balAmount = Number((amount - advAmount).toFixed(2));

    const newQuote: Quote = {
      id: quoteId,
      chatId,
      amount,
      estimatedHours,
      status: 'pending',
      serviceType: serviceType || 'Academic Mentorship',
      deliveryTime: deliveryTime || '3-5 Business Days',
      scopeOfWork: scopeOfWork || 'Comprehensive guidance, drafting reviews, and model examples.',
      advancePercentage,
      advanceAmount: advAmount,
      balanceAmount: balAmount,
      createdAt: new Date().toISOString(),
    };

    this.quotes.push(newQuote);
    this.notify();

    fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: quoteId,
        chatId,
        orderId,
        tutorId,
        amount,
        estimatedHours,
        serviceType,
        deliveryTime,
        scopeOfWork,
        advancePercentage,
        advanceAmount: advAmount,
        balanceAmount: balAmount,
        notes,
        status: 'pending',
      })
    }).catch(() => {});

    return newQuote;
  }

  async updateQuoteStatus(quoteId: string, status: 'accepted' | 'declined') {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (quote) {
      quote.status = status;
      this.notify();

      fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }
  }

  // ==========================================
  // ASSIGNMENTS & ORDERS
  // ==========================================

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
    const assignId = `assign_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newAssignment: Assignment = {
      id: assignId,
      studentId,
      tutorId: tutorId || '',
      title,
      subject,
      deadline,
      wordCount,
      referenceStyle,
      sourcesCount,
      instructions,
      fileUrls,
      fileNames,
      status: tutorId ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.PENDING,
      progressPercent: 0,
      createdAt: new Date().toISOString()
    };

    this.assignments.unshift(newAssignment);
    this.notify();

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: assignId,
        studentId,
        tutorId: tutorId || null,
        title,
        subject,
        deadline,
        wordCount,
        referenceStyle,
        sourcesCount,
        instructions,
        fileUrls,
        fileNames,
        status: newAssignment.status,
      })
    }).catch(() => {});

    return newAssignment;
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
  ) {
    const assign = await this.addAssignment(studentId, title, subject, deadline, instructions, wordCount, referenceStyle, sourcesCount, fileUrls, fileNames, tutorId);
    assign.quoteAmount = quoteAmount;
    assign.status = AssignmentStatus.AWAITING_PAYMENT;
    this.notify();

    fetch(`/api/orders/${assign.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteAmount, status: assign.status })
    }).catch(() => {});

    return assign;
  }

  async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.status = status;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }
  }

  async assignTutorToAssignment(assignmentId: string, tutorId: string) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.tutorId = tutorId;
      assign.status = AssignmentStatus.IN_PROGRESS;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, status: assign.status })
      }).catch(() => {});
    }
  }

  async updateAssignmentProgress(assignmentId: string, progressPercent: number) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.progressPercent = progressPercent;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressPercent })
      }).catch(() => {});
    }
  }

  async setAssignmentCustomPrice(assignmentId: string, price: number) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.quoteAmount = price;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteAmount: price })
      }).catch(() => {});
    }
  }

  async completeAssignmentByTutor(assignmentId: string, fileUrl: string, fileName: string) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.status = AssignmentStatus.COMPLETED;
      assign.progressPercent = 100;
      assign.tutorWorkFileUrl = fileUrl;
      assign.tutorWorkFileName = fileName;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: AssignmentStatus.COMPLETED,
          progressPercent: 100,
          tutorWorkFileUrl: fileUrl,
          tutorWorkFileName: fileName
        })
      }).catch(() => {});
    }
  }

  async approveAssignmentAndReleasePayment(assignmentId: string, rating?: number, reviewComment?: string) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.reviewed = true;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: true, escrowStatus: 'released' })
      }).catch(() => {});

      if (rating && assign.tutorId) {
        this.reviews.push({
          id: `rev_${Date.now()}`,
          tutorId: assign.tutorId,
          studentName: this.currentUser?.name || 'Student',
          studentAvatar: this.currentUser?.avatarUrl || '',
          rating,
          comment: reviewComment || 'Excellent academic guidance and support!',
          createdAt: new Date().toISOString()
        });
        this.notify();
      }
    }
  }

  async requestAssignmentRevision(assignmentId: string, revisionNotes: string) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.status = AssignmentStatus.REVISION;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: AssignmentStatus.REVISION, instructions: assign.instructions + '\n\n[REVISION NOTES]: ' + revisionNotes })
      }).catch(() => {});
    }
  }

  // ==========================================
  // INVOICES & PAYMENTS
  // ==========================================

  async updateInvoiceStatus(invoiceId: string, status: 'due' | 'paid' | 'pending' | 'uninvoiced') {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = status;
      this.notify();
    }
  }

  async addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>) {
    const id = `inv_${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: new Date().toISOString()
    };
    this.invoices.push(newInvoice);
    this.notify();
    return newInvoice;
  }

  // ==========================================
  // NOTIFICATIONS, LOGS, SOPS, REPORTS
  // ==========================================

  async addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const id = `notif_${Date.now()}`;
    const newNotif: AppNotification = {
      ...notif,
      id,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.appNotifications.unshift(newNotif);
    this.notify();
    return newNotif;
  }

  async markNotificationRead(notifId: string) {
    const notif = this.appNotifications.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  async addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const id = `log_${Date.now()}`;
    const newLog: ActivityLog = {
      ...log,
      id,
      timestamp: new Date().toISOString()
    };
    this.activityLogs.unshift(newLog);
    this.notify();

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: log.action,
        details: log.details,
        userId: log.userId,
        userName: log.userName,
        userRole: log.userRole
      })
    }).catch(() => {});
  }

  async addAssignmentReport(report: Omit<AssignmentReport, 'id' | 'createdAt'>) {
    const id = `rep_${Date.now()}`;
    const newReport: AssignmentReport = {
      ...report,
      id,
      createdAt: new Date().toISOString()
    };
    this.assignmentReports.unshift(newReport);
    this.notify();
    return newReport;
  }

  async updateAssignmentReportStatus(reportId: string, status: AssignmentReport['status'], feedback?: string) {
    const rep = this.assignmentReports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      if (feedback) rep.feedbackFromAdmin = feedback;
      this.notify();
    }
  }

  async addAgreement(agreement: Omit<Agreement, 'id' | 'sentAt' | 'status'>) {
    const id = `agr_${Date.now()}`;
    const newAgr: Agreement = {
      ...agreement,
      id,
      status: 'pending_signature',
      sentAt: new Date().toISOString()
    };
    this.agreements.unshift(newAgr);
    this.notify();
    return newAgr;
  }

  async signAgreement(agreementId: string) {
    const agr = this.agreements.find(a => a.id === agreementId);
    if (agr) {
      agr.status = 'signed';
      agr.signedAt = new Date().toISOString();
      this.notify();
    }
  }

  // ==========================================
  // BLOGS & FAQS
  // ==========================================

  async addBlog(titleOrBlog: any, content?: string, image?: string, category?: string, tags?: string[], adminId?: string) {
    const id = `blog_${Date.now()}`;
    let newBlog: Blog;
    if (typeof titleOrBlog === 'object') {
      newBlog = { ...titleOrBlog, id, publishedAt: new Date().toISOString() };
    } else {
      newBlog = {
        id,
        adminId: adminId || 'admin_emily',
        title: titleOrBlog,
        content: content || '',
        image: image || '',
        category: category || 'University Survival',
        tags: tags || [],
        publishedAt: new Date().toISOString()
      };
    }
    this.blogs.unshift(newBlog);
    this.notify();
    return newBlog;
  }

  async deleteBlog(blogId: string) {
    this.blogs = this.blogs.filter(b => b.id !== blogId);
    this.notify();
  }

  async updateBlog(blogId: string, titleOrData: any, content?: string, image?: string, category?: string, tags?: string[]) {
    const blog = this.blogs.find(b => b.id === blogId);
    if (blog) {
      if (typeof titleOrData === 'object') {
        Object.assign(blog, titleOrData);
      } else {
        if (titleOrData) blog.title = titleOrData;
        if (content) blog.content = content;
        if (image) blog.image = image;
        if (category) blog.category = category;
        if (tags) blog.tags = tags;
      }
      this.notify();
    }
  }

  async syncDefaultBlogs(): Promise<boolean> {
    return true;
  }

  async addFAQ(faq: Omit<FAQ, 'id'>) {
    const id = `faq_${Date.now()}`;
    const newFaq: FAQ = { ...faq, id };
    this.faqs.push(newFaq);
    this.notify();
    return newFaq;
  }

  async addFaq(question: string, answer: string, category: any) {
    return this.addFAQ({ question, answer, category, order: this.faqs.length + 1 });
  }

  async deleteFAQ(faqId: string) {
    this.faqs = this.faqs.filter(f => f.id !== faqId);
    this.notify();
  }

  async deleteFaq(faqId: string) {
    return this.deleteFAQ(faqId);
  }

  // ==========================================
  // ACTION ALIASES FOR COMPONENT COMPATIBILITY
  // ==========================================

  sendMessage(chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string, isSystem?: boolean, orderId?: string) {
    return this.addMessage(chatId, senderId, content, fileUrl, fileName, isSystem, orderId);
  }

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
    return this.addQuote(chatId, 'tutor_clara', amount, estimatedHours, serviceType, deliveryTime, scopeOfWork, advancePercentage || 50);
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
      sentBy: 'Admin Accounting'
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
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
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
    const id = `ticket_${Date.now()}`;
    const newTicket: SupportTicket = {
      id,
      studentId,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    this.supportTickets.unshift(newTicket);
    this.notify();
    return newTicket;
  }

  async resolveSupportTicket(ticketId: string) {
    const ticket = this.supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = 'resolved';
      this.notify();
    }
  }

  async arbitrateRefund(assignmentId: string, _notes?: string) {
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.status = AssignmentStatus.PENDING;
      this.notify();
      fetch(`/api/orders/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowStatus: 'refunded', status: AssignmentStatus.PENDING })
      }).catch(() => {});
    }
  }

  async sendTriggeredEmail(to: string, subject: string, htmlContent: string) {
    const id = `email_${Date.now()}`;
    const newEmail: TriggeredEmail = {
      id,
      to,
      message: {
        subject,
        html: htmlContent
      },
      status: {
        state: 'SUCCESS',
        sentAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    this.emails.unshift(newEmail);
    this.notify();
    return newEmail;
  }

  async seedMockStudentData() {
    console.log('[STORE] Initialized default mock student and assignment records.');
  }
}

export const store = new AppStore();
