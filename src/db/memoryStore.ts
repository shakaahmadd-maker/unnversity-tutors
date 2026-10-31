import crypto from 'crypto';
import { DEFAULT_20_BLOGS } from '../data/defaultBlogsData';

export interface BlogRecord {
  id: string;
  adminId: string;
  title: string;
  content: string;
  image: string;
  imageUrl?: string;
  slug?: string;
  excerpt?: string;
  author?: string;
  category: string;
  tags: string[];
  readTime?: string;
  featured?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UserRecord {
  id: string;
  role: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  suspended?: boolean;
  verified?: boolean;
  bio?: string | null;
  hourlyRate?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  subjects?: string | null;
  country?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  education?: string | null;
  experience?: string | null;
  subjectExpertise?: string | null;
  availability?: string | null;
  canMeet?: string | null;
  hobbies?: string | null;
  isApproved?: boolean;
  status?: string;
}

export interface OrderRecord {
  id: string;
  studentId: string;
  tutorId?: string | null;
  title: string;
  subject: string;
  academicLevel?: string | null;
  deadline: string;
  pages?: number | null;
  wordCount?: number | null;
  referenceStyle?: string | null;
  sourcesCount?: number | null;
  instructions?: string | null;
  fileUrls?: string | null;
  fileNames?: string | null;
  budget?: number | null;
  quoteAmount?: number | null;
  status: string;
  escrowStatus?: string | null;
  progressPercent?: number | null;
  tutorWorkFileUrl?: string | null;
  tutorWorkFileName?: string | null;
  reviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  whatsappNumber?: string | null;
  subject: string;
  academicLevel?: string | null;
  deadline?: string | null;
  query: string;
  status: string;
  createdAt: string;
}

export interface ChatRoomRecord {
  id: string;
  title: string;
  orderId?: string | null;
  type: string; // 'direct' | 'order' | 'support' | 'group'
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomMemberRecord {
  id: string;
  roomId: string;
  userId: string;
  role: string; // 'creator' | 'member' | 'tutor' | 'admin' | 'subadmin'
  joinedAt: string;
}

export interface MessageRecord {
  id: string;
  chatId: string;
  roomId?: string | null;
  orderId?: string | null;
  senderId: string;
  receiverId?: string | null;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  isSystem?: boolean;
  read?: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface QuoteRecord {
  id: string;
  chatId?: string | null;
  orderId?: string | null;
  inquiryId?: string | null;
  tutorId?: string | null;
  amount: number;
  currency: string;
  estimatedHours?: number | null;
  serviceType?: string | null;
  deliveryTime?: string | null;
  scopeOfWork?: string | null;
  advancePercentage?: number | null;
  advanceAmount?: number | null;
  balanceAmount?: number | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

function internalHashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export class MemoryStore {
  private users: Map<string, UserRecord> = new Map();
  private orders: Map<string, OrderRecord> = new Map();
  private inquiries: Map<string, InquiryRecord> = new Map();
  private chatRooms: Map<string, ChatRoomRecord> = new Map();
  private chatRoomMembers: Map<string, ChatRoomMemberRecord[]> = new Map();
  private messages: MessageRecord[] = [];
  private quotes: Map<string, QuoteRecord> = new Map();
  private auditLogs: AuditLogRecord[] = [];
  private blogs: Map<string, BlogRecord> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Superior Administrator
    const adminHash = internalHashPassword('Admin@123456');
    const adminUser: UserRecord = {
      id: 'admin_shaka',
      role: 'admin',
      name: 'Shaka Ahmad',
      email: 'shaka.ahmadd@gmail.com',
      passwordHash: adminHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true,
      suspended: false,
      bio: 'Platform Owner and Superior Administrator.',
      country: 'US',
      isApproved: true,
      status: 'approved',
    };
    this.users.set(adminUser.id, adminUser);

    // Initial Certified Tutors
    const tutorHash = internalHashPassword('Tutor@123456');
    const initialTutors: UserRecord[] = [
      {
        id: 'tutor_clara',
        role: 'tutor',
        name: 'Dr. Clara Stirling',
        email: 'clara@example.com',
        passwordHash: tutorHash,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
        bio: 'Former Oxford Senior Lecturer with 12+ years of experience helping undergraduate and postgraduate students structure complex academic essays and dissertation prose.',
        hourlyRate: 45,
        rating: 4.9,
        reviewCount: 142,
        subjects: JSON.stringify(['English Literature', 'Essays & Editing', 'History', 'Philosophy']),
        country: 'GB',
        location: 'London, UK',
        education: 'University of Oxford - DPhil, English Literature',
        isApproved: true,
        status: 'approved',
        verified: true,
        suspended: false,
      },
      {
        id: 'tutor_liam',
        role: 'tutor',
        name: 'Liam Kennedy, M.Sc.',
        email: 'liam@example.com',
        passwordHash: tutorHash,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
        bio: 'MIT graduate specializing in Advanced Calculus, Statistics, Linear Algebra and Mechanical Engineering.',
        hourlyRate: 50,
        rating: 4.8,
        reviewCount: 96,
        subjects: JSON.stringify(['Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering']),
        country: 'US',
        location: 'Boston, MA',
        education: 'MIT - M.Sc, Mechanical Engineering & Applied Math',
        isApproved: true,
        status: 'approved',
        verified: true,
        suspended: false,
      },
      {
        id: 'tutor_chloe',
        role: 'tutor',
        name: 'Chloe Tremblay',
        email: 'chloe@example.com',
        passwordHash: tutorHash,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
        bio: 'Specialist in Cognitive Psychology and Business Administration. Focuses on coursework mentorship and dissertation planning.',
        hourlyRate: 38,
        rating: 4.7,
        reviewCount: 68,
        subjects: JSON.stringify(['Psychology', 'Business Administration', 'Marketing', 'Sociology']),
        country: 'CA',
        location: 'Toronto, ON',
        education: 'McGill University - M.A, Organizational Psychology',
        isApproved: true,
        status: 'approved',
        verified: true,
        suspended: false,
      },
      {
        id: 'tutor-dr-marcus-vance',
        role: 'tutor',
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@universitytutors.com',
        passwordHash: tutorHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        createdAt: '2025-01-10T00:00:00.000Z',
        location: 'Atlanta, GA',
        country: 'US',
        hourlyRate: 55,
        rating: 4.98,
        reviewCount: 184,
        education: 'Emory University - Ph.D, Neuroscience & Organic Chemistry',
        experience: 'Senior Emory research scientist and dedicated private tutor in Atlanta with over 8 years of experience. I specialize in Organic Chemistry, MCAT preparation, Biochemistry, and Cell Biology.',
        subjects: JSON.stringify(['Organic Chemistry', 'MCAT', 'Biochemistry', 'Chemistry']),
        isApproved: true,
        status: 'approved',
        verified: true,
        suspended: false,
      }
    ];

    for (const t of initialTutors) {
      this.users.set(t.id, t);
    }

    // Seed default welcome chat room
    const welcomeRoom: ChatRoomRecord = {
      id: 'room_welcome',
      title: 'Academic Consultation & Welcome Desk',
      type: 'support',
      createdBy: 'admin_shaka',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.createChatRoom(welcomeRoom, [
      { userId: 'admin_shaka', role: 'admin' },
      { userId: 'tutor_clara', role: 'tutor' },
    ]);

    // Seed 20 Default Educational Blogs
    for (const b of DEFAULT_20_BLOGS) {
      this.blogs.set(b.id, {
        ...b,
        createdAt: b.publishedAt,
        updatedAt: b.publishedAt,
      });
    }
  }

  // --- Users ---
  public getAllUsers(): UserRecord[] {
    return Array.from(this.users.values()).map(u => {
      const { passwordHash: _, ...safe } = u;
      return safe as UserRecord;
    });
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    const clean = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase().trim() === clean) {
        return u;
      }
    }
    return undefined;
  }

  public setUser(user: UserRecord): void {
    this.users.set(user.id, user);
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // --- Orders ---
  public getOrders(studentId?: string, tutorId?: string): OrderRecord[] {
    let list = Array.from(this.orders.values());
    if (studentId) {
      list = list.filter(o => o.studentId === studentId);
    }
    if (tutorId) {
      list = list.filter(o => o.tutorId === tutorId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public setOrder(order: OrderRecord): void {
    this.orders.set(order.id, order);
  }

  public updateOrder(id: string, updates: Partial<OrderRecord>): OrderRecord | undefined {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.orders.set(id, updated);
    return updated;
  }

  // --- Inquiries ---
  public getInquiries(): InquiryRecord[] {
    return Array.from(this.inquiries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public setInquiry(inquiry: InquiryRecord): void {
    this.inquiries.set(inquiry.id, inquiry);
  }

  // --- Chat Rooms ---
  public createChatRoom(room: ChatRoomRecord, memberUserIds: { userId: string; role?: string }[]): ChatRoomRecord {
    this.chatRooms.set(room.id, room);
    const members: ChatRoomMemberRecord[] = memberUserIds.map((m, idx) => ({
      id: `crm_${room.id}_${m.userId}_${idx}`,
      roomId: room.id,
      userId: m.userId,
      role: m.role || 'member',
      joinedAt: new Date().toISOString(),
    }));
    this.chatRoomMembers.set(room.id, members);
    return room;
  }

  public getChatRoomsForUser(userId: string, isAdmin?: boolean): (ChatRoomRecord & { members: ChatRoomMemberRecord[]; latestMessage?: MessageRecord })[] {
    const results: (ChatRoomRecord & { members: ChatRoomMemberRecord[]; latestMessage?: MessageRecord })[] = [];
    for (const [roomId, room] of this.chatRooms.entries()) {
      const members = this.chatRoomMembers.get(roomId) || [];
      const isMember = members.some(m => m.userId === userId);
      if (isMember || isAdmin) {
        const roomMessages = this.getRoomMessages(roomId);
        const latestMessage = roomMessages[roomMessages.length - 1];
        results.push({
          ...room,
          members,
          latestMessage,
        });
      }
    }
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getChatRoom(roomId: string): ChatRoomRecord | undefined {
    return this.chatRooms.get(roomId);
  }

  public getRoomMembers(roomId: string): ChatRoomMemberRecord[] {
    return this.chatRoomMembers.get(roomId) || [];
  }

  public isRoomMember(roomId: string, userId: string, isAdmin?: boolean): boolean {
    if (isAdmin) return true;
    const members = this.chatRoomMembers.get(roomId) || [];
    return members.some(m => m.userId === userId);
  }

  public addRoomMember(roomId: string, userId: string, role: string = 'member'): ChatRoomMemberRecord {
    const members = this.chatRoomMembers.get(roomId) || [];
    const existing = members.find(m => m.userId === userId);
    if (existing) return existing;
    const newMember: ChatRoomMemberRecord = {
      id: `crm_${roomId}_${userId}_${Date.now()}`,
      roomId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    };
    members.push(newMember);
    this.chatRoomMembers.set(roomId, members);
    return newMember;
  }

  public removeRoomMember(roomId: string, userId: string): boolean {
    const members = this.chatRoomMembers.get(roomId) || [];
    const filtered = members.filter(m => m.userId !== userId);
    if (filtered.length !== members.length) {
      this.chatRoomMembers.set(roomId, filtered);
      return true;
    }
    return false;
  }

  public getRoomMessages(roomId: string): MessageRecord[] {
    return this.messages
      .filter(m => m.roomId === roomId || m.chatId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // --- Messages ---
  public getMessages(chatId?: string, orderId?: string): MessageRecord[] {
    let list = this.messages;
    if (chatId) {
      list = list.filter(m => m.chatId === chatId);
      return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (orderId) {
      list = list.filter(m => m.orderId === orderId);
      return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
  }

  public addMessage(message: MessageRecord): void {
    this.messages.push(message);
  }

  // --- Quotes ---
  public getQuotes(chatId?: string, orderId?: string): QuoteRecord[] {
    let list = Array.from(this.quotes.values());
    if (chatId) {
      list = list.filter(q => q.chatId === chatId);
    }
    if (orderId) {
      list = list.filter(q => q.orderId === orderId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public setQuote(quote: QuoteRecord): void {
    this.quotes.set(quote.id, quote);
  }

  public updateQuote(id: string, updates: Partial<QuoteRecord>): QuoteRecord | undefined {
    const existing = this.quotes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.quotes.set(id, updated);
    return updated;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200);
  }

  public addAuditLog(log: AuditLogRecord): void {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  // --- Blogs ---
  public getBlogs(category?: string): BlogRecord[] {
    let list = Array.from(this.blogs.values());
    if (category && category !== 'All') {
      list = list.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public getBlogById(id: string): BlogRecord | undefined {
    return this.blogs.get(id);
  }

  public setBlog(blog: BlogRecord): void {
    this.blogs.set(blog.id, blog);
  }

  public updateBlog(id: string, updates: Partial<BlogRecord>): BlogRecord | undefined {
    const existing = this.blogs.get(id);
    if (!existing) return undefined;
    const updated: BlogRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.blogs.set(id, updated);
    return updated;
  }

  public deleteBlog(id: string): boolean {
    return this.blogs.delete(id);
  }

  public resetDefaultBlogs(): BlogRecord[] {
    this.blogs.clear();
    for (const b of DEFAULT_20_BLOGS) {
      this.blogs.set(b.id, {
        ...b,
        createdAt: b.publishedAt,
        updatedAt: b.publishedAt,
      });
    }
    return this.getBlogs();
  }
}

export const memoryStore = new MemoryStore();
