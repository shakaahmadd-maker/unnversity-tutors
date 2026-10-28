export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
  ADMIN = 'admin'
}

export enum AssignmentStatus {
  PENDING = 'Pending Tutor Assignment',
  IN_PROGRESS = 'In Progress',
  AWAITING_PAYMENT = 'Awaiting Payment Confirmation',
  COMPLETED = 'Completed – Download Here',
  REVISION = 'Revision Requested'
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  suspended?: boolean;
  verified?: boolean;
  password?: string;
  resetToken?: string;
  // Tutor fields
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  subjects?: string[];
  country?: string; // e.g., 'GB', 'US', 'CA', 'AU', 'NZ', 'IE'
  availableSlots?: string[]; // ISO string dates
  // Enhanced Tutor Profile Fields
  location?: string; // e.g. 'Miami, FL'
  city?: string;
  phoneNumber?: string;
  education?: string; // e.g. 'University of Miami - B.S, Biomedical Engineering'
  experience?: string; // e.g. 'A patient tutor, I will repeat myself...'
  experiences?: string;
  subjectExpertise?: string[]; // e.g. ['12th Grade Math', 'ACT Math', 'AP Biology']
  availability?: string; // e.g. 'Weekdays at any time, Weekends at any time'
  availabilities?: string;
  canMeet?: string; // e.g. '20 miles at my regular hourly rate'
  hobbies?: string; // e.g. 'I enjoy reading, singing, and watching sports'
  isApproved?: boolean;
  status?: string;
  // Domain & Keyword Taxonomies
  primaryDomain?: string;
  specializedKeywords?: string[];
  researchKeywords?: string[];
  jobKeywords?: string[];
  highGrowthKeywords?: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Chat {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  studentIsTyping?: boolean;
  tutorIsTyping?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
  isSystem?: boolean;
  read?: boolean;
}

export interface Quote {
  id: string;
  chatId: string;
  amount: number;
  estimatedHours: number;
  status: 'pending' | 'accepted' | 'declined';
  serviceType?: string;
  deliveryTime?: string;
  scopeOfWork?: string;
  advancePercentage?: number; // percentage paid in advance (e.g. 50)
  advanceAmount?: number;     // calculated advance amount
  balanceAmount?: number;     // calculated remaining balance
  createdAt: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  tutorId: string;
  title: string;
  subject: string;
  deadline: string;
  wordCount: number;
  referenceStyle: string;
  sourcesCount: number;
  instructions: string;
  fileUrls: string[];
  fileNames?: string[];
  status: AssignmentStatus;
  progressPercent: number; // 0 - 100
  quoteAmount?: number;
  tutorWorkFileUrl?: string; // Uploaded by tutor when completed
  tutorWorkFileName?: string;
  reviewed?: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  assignmentId: string;
  amount: number;
  status: 'escrow' | 'released' | 'refunded';
  stripePaymentIntent: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  adminId: string;
  title: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Payments' | 'Tutoring Process' | 'Technical Issues' | 'Revisions & Refunds';
  order: number;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface Review {
  id: string;
  tutorId: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  serviceSubject: string;
  description: string;
  details?: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: 'due' | 'paid' | 'pending' | 'uninvoiced';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'email' | 'webapp' | 'both';
  sentBy: string;
  createdAt: string;
  read?: boolean;
}

export interface SOP {
  id: string;
  title: string;
  content: string;
  category: 'tutors' | 'admin' | 'students' | 'general';
  updatedAt: string;
  updatedBy: string;
}

export interface AssignmentReport {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  reportNotes: string;
  attachmentUrl?: string;
  status: 'pending_review' | 'approved' | 'revision_requested' | 'sent_to_student';
  createdAt: string;
  feedbackFromAdmin?: string;
}

export interface Agreement {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  terms: string;
  status: 'pending_signature' | 'signed' | 'revoked';
  sentAt: string;
  signedAt?: string;
}

export interface TriggeredEmail {
  id: string;
  to: string; // Recipient email address or comma-separated addresses
  message: {
    subject: string;
    text?: string;
    html?: string;
  };
  status?: {
    state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
    sentAt?: string;
    error?: string;
  };
  createdAt: string;
}

