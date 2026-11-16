import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  PlusSquare,
  BookOpen,
  CreditCard,
  GraduationCap,
  MessageSquare,
  BarChart3,
  Award,
  Bell,
  Heart,
  Shield,
  FileText,
  Info,
  RotateCcw,
  Settings,
  LogOut,
  Search,
  MessageCircle,
  Check,
  Upload,
  Calendar,
  Paperclip,
  Send,
  Sun,
  MoreHorizontal,
  AlertTriangle,
  Download,
  ThumbsUp,
  Star,
  CheckCircle,
  BookMarked,
  RefreshCw,
  HelpCircle,
  Menu,
  X,
  Headset,
  ShieldCheck,
  DollarSign,
  Phone,
  Video,
  MoreVertical,
  Smile,
  CheckCheck,
  Camera,
  CheckCircle2,
  Receipt,
  Lock,
  Wallet,
  Copy,
  FilePlus2,
  LayoutGrid,
  Plus,
  ClipboardList,
  CheckSquare,
  Layers,
  MonitorPlay,
  PenTool,
  Code2,
  FlaskConical,
  Target,
  FileCheck2
} from 'lucide-react';
import { apiFetch } from '../lib/apiClient';
import type { TabLoadState } from '../lib/store';
import ErrorBoundary from './ErrorBoundary';
import { TabLoadingSkeleton, ErrorStatePanel, PaginationBar } from './ui/StatePanels';
import { ResponsiveAvatar } from './ResponsiveImage';
import StudentOnboardingWizard from './StudentOnboardingWizard';
import { 
  User, 
  UserRole,
  Assignment, 
  AssignmentStatus, 
  Chat, 
  Message, 
  Payment, 
  SupportTicket,
  AssignmentReport,
  Quote,
  AppNotification,
  Invoice
} from '../types';

interface QuickRequestServiceOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_REQUEST_SERVICES: QuickRequestServiceOption[] = [
  {
    value: 'Assignment Help',
    label: 'Assignment Help',
    description: 'Step-by-step drafts & problem checks',
    icon: FileCheck2,
  },
  {
    value: 'Midterm / Final Prep',
    label: 'Midterm / Final Prep',
    description: 'Targeted exam prep & review sprints',
    icon: Target,
  },
  {
    value: '1-on-1 Live Tutoring',
    label: '1-on-1 Live Tutoring',
    description: 'Live webcam & whiteboard sessions',
    icon: GraduationCap,
  },
  {
    value: 'Lab Report Review',
    label: 'Lab Report Review',
    description: 'Data analysis, citations & lab checks',
    icon: FlaskConical,
  },
  {
    value: 'Online assignments/Homework HELP',
    label: 'Online assignments/Homework HELP',
    description: 'Guided homework solutions & problem sets',
    icon: ClipboardList,
  },
  {
    value: 'Online Quizzes/Assessments',
    label: 'Online Quizzes/Assessments',
    description: 'Quiz prep, practice drills & walkthroughs',
    icon: CheckSquare,
  },
  {
    value: 'Online exams/tests/midterms/finals',
    label: 'Online exams/tests/midterms/finals',
    description: 'Intensive revision for tests & finals',
    icon: Award,
  },
  {
    value: 'Online coursework',
    label: 'Online coursework',
    description: 'Weekly modules, labs & syllabus pacing',
    icon: Layers,
  },
  {
    value: 'Online Classes',
    label: 'Online Classes',
    description: 'Full-term lectures & discussion coaching',
    icon: MonitorPlay,
  },
  {
    value: 'Protected exam',
    label: 'Protected exam',
    description: 'High-focus readiness & proctored exam prep',
    icon: ShieldCheck,
  },
  {
    value: 'Writing Services',
    label: 'Writing Services',
    description: 'Essays, research papers & APA/MLA editing',
    icon: PenTool,
  },
  {
    value: 'IT Project Assistance',
    label: 'IT Project Assistance',
    description: 'Coding, full-stack apps, SQL & debugging',
    icon: Code2,
  },
  {
    value: 'Online PhD Classes/Online Classes Management',
    label: 'Online PhD Classes/Online Classes Management',
    description: 'Doctoral seminars, pacing & research help',
    icon: BookOpen,
  },
];

const QUICK_REQUEST_DELIVERABLES: Array<{ id: string; label: string; description: string }> = [
  { id: 'abstract', label: 'Abstract', description: 'Concise summary of your work.' },
  { id: 'executive-summary', label: 'Executive Summary', description: 'High-level overview for quick review.' },
  { id: 'proofread-by-editor', label: 'Proofread by Editor', description: 'Editorial pass for grammar and flow.' },
  { id: 'draft', label: 'Draft', description: 'Receive an interim draft for review.' },
  { id: 'daily-delivery-update', label: 'Daily Delivery Update', description: 'Progress updates as the work proceeds.' },
  { id: 'grammarly-report', label: 'Grammarly Report', description: 'Quality check with Grammarly.' },
  { id: 'turnitin-ai-report', label: 'Turnitin AI Report', description: 'AI detection insights.' },
  { id: 'turnitin-similarity-report', label: 'Turnitin Similarity Report', description: 'Similarity score report.' },
  { id: 'table-of-contents', label: 'Table of Contents', description: 'Structured contents page.' },
];

interface StudentDashboardProps {
  currentUser: User;
  tutors: User[];
  students: User[];
  assignments: Assignment[];
  chats: Chat[];
  messages: Message[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  onSubmitAssignment: (data: any) => void;
  onOpenChat: (tutorId: string, initialMessage?: string) => Chat | void;
  onSelectChat: (chat: Chat) => void;
  onSendMessage?: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => void;
  onSubscribeToChatDetails?: (chatId: string) => void;
  onApproveWork: (assignId: string, rating: number, comment: string) => void;
  onRaiseRevision: (assignId: string, details: string) => void;
  onRaiseTicket: (sub: string, msg: string) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  assignmentReports?: AssignmentReport[];
  quotes?: Quote[];
  onAcceptQuote?: (quoteId: string) => void;
  appNotifications?: AppNotification[];
  onMarkNotificationRead?: (notifId: string) => void;
  onMarkAllNotificationsRead?: (userId: string) => void;
  onUpdateProfile?: (data: Partial<User>) => void;
  invoices?: Invoice[];
  onRefreshData?: () => void;
  onLoadTab?: (tab: string, force?: boolean) => Promise<void> | void;
  tabStates?: Record<string, TabLoadState>;
  isLoadingMessages?: boolean;
  chatError?: string | null;
  syncError?: string | null;
  lastSyncTime?: string | null;
  onPayAdvance?: (assignmentId: string, amount: number) => Promise<any>;
  onPayBalance?: (assignmentId: string, amount: number) => Promise<any>;
  onOpenWhatsApp?: () => void;
  onHideGlobalWhatsAppChange?: (hide: boolean) => void;
}

export default function StudentDashboard({
  currentUser,
  tutors,
  students,
  assignments,
  chats,
  messages,
  payments,
  supportTickets,
  onSubmitAssignment,
  onOpenChat,
  onSelectChat,
  onSendMessage,
  onSubscribeToChatDetails,
  onApproveWork,
  onRaiseRevision,
  onRaiseTicket,
  onLogout,
  onNavigate,
  assignmentReports = [],
  quotes = [],
  onAcceptQuote,
  appNotifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onUpdateProfile,
  invoices = [],
  onRefreshData,
  onLoadTab,
  tabStates = {},
  isLoadingMessages = false,
  chatError = null,
  syncError = null,
  lastSyncTime,
  onPayAdvance,
  onPayBalance,
  onOpenWhatsApp,
  onHideGlobalWhatsAppChange
}: StudentDashboardProps) {

  // Dynamic Viewport Navigation State matching Sidebar
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [localSelectedChatId, setLocalSelectedChatId] = useState<string | null>(null);
  const [studentReply, setStudentReply] = useState('');
  const [channelSearchFilter, setChannelSearchFilter] = useState('');
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [chatAttachedFileName, setChatAttachedFileName] = useState('');
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);
  const [isMobileChannelsOpen, setIsMobileChannelsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isQuickRequestModalOpen, setIsQuickRequestModalOpen] = useState(false);
  const [quickReqTitle, setQuickReqTitle] = useState('');
  const [quickReqSubject, setQuickReqSubject] = useState('Computer Science');
  const [quickReqType, setQuickReqType] = useState('Assignment Help');
  const [quickReqDeadline, setQuickReqDeadline] = useState(() => {
    const d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [quickReqNotes, setQuickReqNotes] = useState('');
  const [quickReqDeliverables, setQuickReqDeliverables] = useState<string[]>([]);
  const [isSubmittingQuickReq, setIsSubmittingQuickReq] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isConfirmingScrub, setIsConfirmingScrub] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const toastTimeoutRef = useRef<number | null>(null);
  const lastSubscribedChatIdRef = useRef<string | null>(null);

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setActionToast(null);
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (onLoadTab) {
      onLoadTab(activeTab);
    }
  }, [activeTab, onLoadTab]);

  useEffect(() => {
    if (onHideGlobalWhatsAppChange) {
      onHideGlobalWhatsAppChange(isMobileViewport || activeTab === 'chat' || activeTab === 'new_request');
    }
    return () => {
      onHideGlobalWhatsAppChange?.(false);
    };
  }, [activeTab, isMobileViewport, onHideGlobalWhatsAppChange]);

  useEffect(() => {
    if (activeTab === 'chat' && chats.length > 0) {
      const myChats = chats.filter(c => c.studentId === currentUser.id || c.tutorId === currentUser.id);
      if (myChats.length > 0) {
        if (!localSelectedChatId || !myChats.some(c => c.id === localSelectedChatId)) {
          // Prefer assigned tutor chat first, otherwise support, otherwise first chat
          const tutorChat = myChats.find(c => !c.tutorId.startsWith('admin_') && c.tutorId !== 'admin_emily');
          const target = tutorChat || myChats[0];
          setLocalSelectedChatId(target.id);
        }
      }
    }
  }, [chats, activeTab, currentUser.id, localSelectedChatId]);

  useEffect(() => {
    if (localSelectedChatId && onSubscribeToChatDetails && lastSubscribedChatIdRef.current !== localSelectedChatId) {
      lastSubscribedChatIdRef.current = localSelectedChatId;
      onSubscribeToChatDetails(localSelectedChatId);
    }
  }, [localSelectedChatId, onSubscribeToChatDetails]);

  const selectedChat = chats.find(c => c.id === localSelectedChatId);
  const activeChatMessages = messages
    .filter(m => m.chatId === localSelectedChatId)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const lastActiveChatMessageId = activeChatMessages.length > 0 ? activeChatMessages[activeChatMessages.length - 1].id : '';

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat' && localSelectedChatId) {
      const raf = requestAnimationFrame(() => {
        const container = chatScrollContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [activeTab, localSelectedChatId, activeChatMessages.length, lastActiveChatMessageId]);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [revisionDetails, setRevisionDetails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setAssignmentsPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // New Request Form states
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqSubject, setNewReqSubject] = useState('Biology');
  const [newReqDeadline, setNewReqDeadline] = useState('2026-06-25');
  const [newReqWords, setNewReqWords] = useState(1500);
  const [newReqStyle, setNewReqStyle] = useState('APA');
  const [newReqInstructions, setNewReqInstructions] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [reqSuccessMessage, setReqSuccessMessage] = useState('');

  // Ticket states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Platform Feedback states
  const [feedbackCategory, setFeedbackCategory] = useState('Tutor Professionalism');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Settings states
  const [emailPref, setEmailPref] = useState(true);
  const [autoDeposit, setAutoDeposit] = useState(true);

  // Profile Picture Editor states
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string>(currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarSuccessAlert, setAvatarSuccessAlert] = useState(false);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&auto=format&q=75',
  ];

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setCustomAvatarPreview(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      if (onUpdateProfile) {
        onUpdateProfile({ avatarUrl: customAvatarPreview });
      }
      await apiFetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: customAvatarPreview })
      });
      setAvatarSuccessAlert(true);
      setTimeout(() => {
        setAvatarSuccessAlert(false);
        setIsAvatarEditorOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Filter notifications for this student
  const userNotifications = appNotifications.filter(n => n.userId === currentUser.id || n.userId === 'all');
  const unreadNotifCount = userNotifications.filter(n => !n.read).length;


  // Filter lists for current student (matching across user ID, email, and display name for funnel submissions)
  const studentAssignments = assignments.filter(a => {
    if (a.studentId === currentUser.id) return true;
    if (currentUser.email && a.studentId.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.name && a.studentId.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  const studentPayments = payments.filter(p => {
    const a = assignments.find(assign => assign.id === p.assignmentId);
    if (!a) return false;
    if (a.studentId === currentUser.id) return true;
    if (currentUser.email && a.studentId.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.name && a.studentId.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  const studentTickets = supportTickets.filter(t => {
    if (t.studentId === currentUser.id) return true;
    if (currentUser.email && t.studentId.toLowerCase() === currentUser.email.toLowerCase()) return true;
    return false;
  });

  const studentChats = chats.filter(c => {
    if (c.studentId === currentUser.id) return true;
    if (currentUser.email && c.studentId.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.name && c.studentId.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  const studentInvoices = (invoices || []).filter(inv => {
    if (inv.studentId === currentUser.id) return true;
    if (currentUser.email && inv.studentEmail?.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.name && inv.studentName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  // Payment states & PDF generation state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSyncingPayments, setIsSyncingPayments] = useState(false);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    assignmentId: string;
    title: string;
    amount: number;
    type: 'advance' | 'balance';
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationBannerMsg, setVerificationBannerMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      currentUser.verified = true;
      setVerificationBannerMsg('🎉 Your email address has been verified successfully!');
      params.delete('verified');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', nextUrl);
    }
  }, []);

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setVerificationBannerMsg('✉️ Verification email sent! Please check your inbox and spam folder.');
      } else {
        setVerificationBannerMsg(data?.error || 'Failed to resend verification email.');
      }
    } catch {
      setVerificationBannerMsg('Unable to send verification email. Please try again later.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  interface AssignmentPaymentItem {
    id: string;
    title: string;
    subject: string;
    deadline: string;
    status: AssignmentStatus;
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
    statusText: string;
    statusBadgeClass: string;
    statusColor: [number, number, number];
    hasAdvancePayment: boolean;
    hasBalancePayment: boolean;
    tutorName?: string;
  }

  const assignmentPaymentRows: AssignmentPaymentItem[] = studentAssignments.map(assign => {
    let total = assign.quoteAmount || 0;
    const matchedInvoice = studentInvoices.find(inv => inv.assignmentId === assign.id || inv.description?.includes(assign.id));
    if (!total && matchedInvoice && matchedInvoice.totalAmount) {
      total = matchedInvoice.totalAmount;
    }

    const assignPayments = studentPayments.filter(p => p.assignmentId === assign.id);
    const advPayments = assignPayments.filter(p => (p as any).type === 'advance' || p.id.includes('_adv'));
    const balPayments = assignPayments.filter(p => (p as any).type === 'balance' || p.id.includes('_bal'));

    let advancePaid = advPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const balancePaid = balPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    if (advancePaid === 0 && assignPayments.length > 0) {
      advancePaid = assignPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }

    if (advancePaid === 0 && (assign.id === 'assign_1793361628984_pl5rwv' || matchedInvoice?.status === 'paid')) {
      advancePaid = matchedInvoice?.advanceAmount || (total > 0 ? total * 0.5 : 0);
    }

    let balance = 0;
    if (total > 0) {
      balance = Math.max(0, total - advancePaid - balancePaid);
    }

    let statusText = 'Pending Admin Quote';
    let statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let statusColor: [number, number, number] = [100, 116, 139];

    if (total === 0) {
      statusText = 'Pending Admin Quote';
      statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      statusColor = [100, 116, 139];
    } else if (balance === 0 && (advancePaid >= total || balancePaid > 0)) {
      statusText = 'Fully Settled (100%)';
      statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      statusColor = [5, 150, 105];
    } else if (advancePaid > 0 && balance > 0) {
      statusText = 'Advance Paid (Escrowed)';
      statusBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      statusColor = [37, 99, 235];
    } else {
      statusText = 'Advance Payment Due';
      statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      statusColor = [217, 119, 6];
    }

    const assignedTutor = tutors.find(t => t.id === assign.tutorId);

    return {
      id: assign.id,
      title: assign.title,
      subject: assign.subject,
      deadline: assign.deadline,
      status: assign.status,
      totalAmount: total,
      advancePaid,
      balanceAmount: balance,
      statusText,
      statusBadgeClass,
      statusColor,
      hasAdvancePayment: advancePaid > 0,
      hasBalancePayment: balance === 0 && total > 0,
      tutorName: assignedTutor?.name
    };
  });

  const totalQuotedSum = assignmentPaymentRows.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalAdvancePaidSum = assignmentPaymentRows.reduce((acc, r) => acc + r.advancePaid, 0);
  const totalRemainingBalanceSum = assignmentPaymentRows.reduce((acc, r) => acc + r.balanceAmount, 0);

  const handleRefreshPayments = async () => {
    setIsSyncingPayments(true);
    if (onRefreshData) {
      try {
        await onRefreshData();
      } catch (e) {
        console.warn('Sync error:', e);
      }
    }
    setTimeout(() => {
      setIsSyncingPayments(false);
    }, 600);
  };

  const handleCopyRef = (refId: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refId);
    }
    setCopiedRefId(refId);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleExecutePayment = async () => {
    if (!paymentModal) return;
    setIsProcessingPayment(true);
    try {
      if (paymentModal.type === 'advance' && onPayAdvance) {
        await onPayAdvance(paymentModal.assignmentId, paymentModal.amount);
      } else if (paymentModal.type === 'balance' && onPayBalance) {
        await onPayBalance(paymentModal.assignmentId, paymentModal.amount);
      }
      setPaymentSuccessToast(`Payment authorized: $${paymentModal.amount.toFixed(2)} USD secured in escrow for "${paymentModal.title}".`);
      setPaymentModal(null);
      setTimeout(() => setPaymentSuccessToast(null), 5000);
    } catch (e: any) {
      console.error('Payment error:', e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadPDFStatement = async () => {
    try {
      setIsGeneratingPdf(true);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // Header Bar
      doc.setFillColor(234, 88, 12); // #ea580c Brand Primary
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('UNIVERSITY TUTORS', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Global Academic Portal • Official Student Financial Statement & Escrow Ledger', margin, 18);
      doc.text('https://university-tutors.com • support@university-tutors.com', margin, 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('STATEMENT OF ACCOUNT', pageWidth - margin, 12, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const statementRef = `STMT-${Date.now().toString().slice(-6)}`;
      const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      doc.text(`Ref: #${statementRef}`, pageWidth - margin, 17, { align: 'right' });
      doc.text(`Date Issued: ${formattedDate}`, pageWidth - margin, 22, { align: 'right' });

      // Student Account Info Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, 34, pageWidth - (margin * 2), 24, 2, 2, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('STUDENT ACCOUNT DETAILS', margin + 4, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Student Name: ${currentUser.name || 'Verified Student'}`, margin + 4, 46);
      doc.text(`Email Address: ${currentUser.email || 'N/A'}`, margin + 4, 51);
      doc.text(`Student Account ID: #${currentUser.id}`, margin + 4, 55);

      doc.text(`Account Status: Verified Academic Enrollee`, pageWidth / 2 + 10, 46);
      doc.text(`Escrow Protection: 100% Milestone Insured`, pageWidth / 2 + 10, 51);
      doc.text(`Currency: USD ($)`, pageWidth / 2 + 10, 55);

      // Financial Metrics Boxes
      const boxY = 62;
      const boxHeight = 22;
      const boxWidth = (pageWidth - (margin * 2) - 8) / 3;

      // Box 1: Total Committed
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL QUOTED / COMMITTED', margin + 4, boxY + 6);
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`$${totalQuotedSum.toFixed(2)}`, margin + 4, boxY + 16);

      // Box 2: Advance Paid
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin + boxWidth + 4, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(4, 120, 87);
      doc.text('ADVANCE PAID (IN ESCROW)', margin + boxWidth + 8, boxY + 6);
      doc.setFontSize(13);
      doc.setTextColor(6, 95, 70);
      doc.text(`$${totalAdvancePaidSum.toFixed(2)}`, margin + boxWidth + 8, boxY + 16);

      // Box 3: Remaining Balance
      doc.setFillColor(255, 247, 237);
      doc.setDrawColor(254, 215, 170);
      doc.roundedRect(margin + (boxWidth * 2) + 8, boxY, boxWidth, boxHeight, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(194, 65, 12);
      doc.text('REMAINING BALANCE DUE', margin + (boxWidth * 2) + 12, boxY + 6);
      doc.setFontSize(13);
      doc.setTextColor(154, 52, 18);
      doc.text(`$${totalRemainingBalanceSum.toFixed(2)}`, margin + (boxWidth * 2) + 12, boxY + 16);

      // Table Header
      let currentY = 92;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('ASSIGNMENT-WISE PAYMENT BREAKDOWN', margin, currentY);

      currentY += 4;
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSIGNMENT REF & TITLE', margin + 3, currentY + 5.5);
      doc.text('SUBJECT', margin + 68, currentY + 5.5);
      doc.text('TOTAL', margin + 104, currentY + 5.5, { align: 'right' });
      doc.text('ADVANCE PAID', margin + 132, currentY + 5.5, { align: 'right' });
      doc.text('BALANCE DUE', margin + 158, currentY + 5.5, { align: 'right' });
      doc.text('STATUS', pageWidth - margin - 3, currentY + 5.5, { align: 'right' });

      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      if (assignmentPaymentRows.length === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 12, 'F');
        doc.setTextColor(148, 163, 184);
        doc.text('No active assignment records registered for this account.', margin + 4, currentY + 7);
        currentY += 12;
      } else {
        assignmentPaymentRows.forEach((row, idx) => {
          const rowHeight = 11;
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
          }

          doc.setDrawColor(241, 245, 249);
          doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          const shortTitle = row.title.length > 34 ? row.title.substring(0, 32) + '...' : row.title;
          doc.text(shortTitle, margin + 3, currentY + 4.5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Ref: #${row.id}`, margin + 3, currentY + 8.5);

          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text(row.subject, margin + 68, currentY + 6.5);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(row.totalAmount > 0 ? `$${row.totalAmount.toFixed(2)}` : 'Pending Quote', margin + 104, currentY + 6.5, { align: 'right' });

          doc.setTextColor(4, 120, 87);
          doc.text(`$${row.advancePaid.toFixed(2)}`, margin + 132, currentY + 6.5, { align: 'right' });

          doc.setTextColor(row.balanceAmount > 0 ? 194 : 100, row.balanceAmount > 0 ? 65 : 116, row.balanceAmount > 0 ? 12 : 139);
          doc.text(`$${row.balanceAmount.toFixed(2)}`, margin + 158, currentY + 6.5, { align: 'right' });

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(row.statusColor[0], row.statusColor[1], row.statusColor[2]);
          doc.text(row.statusText, pageWidth - margin - 3, currentY + 6.5, { align: 'right' });

          currentY += rowHeight;
        });
      }

      // Escrow Policy Box
      currentY += 8;
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(254, 240, 138);
      doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 22, 2, 2, 'FD');

      doc.setTextColor(161, 98, 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('UNIVERSITY TUTORS ESCROW & ACADEMIC INTEGRITY GUARANTEE', margin + 4, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(113, 63, 18);
      doc.text('All advance payments are secured in third-party escrow. Tutors are never authorized to withdraw milestone funds', margin + 4, currentY + 10);
      doc.text('until the student has thoroughly inspected and approved the delivered academic milestone or mentoring session.', margin + 4, currentY + 14);
      doc.text('Full dispute resolution, refund arbitration, and revision safeguards apply to all orders placed through university-tutors.com.', margin + 4, currentY + 18);

      // Footer
      const footerY = 282;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('University Tutors Inc. • Academic Quality & Integrity Office • Statement Generated Electronically', margin, footerY);
      doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

      doc.save(`University-Tutors-Statement-${(currentUser.name || 'Student').replace(/\s+/g, '_')}-${statementRef}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF statement:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper to find tutor details
  const getTutor = (tutorId: string) => {
    if (tutorId === 'admin_emily' || tutorId.startsWith('admin_') || tutorId === 'admin_shaka') {
      return {
        id: tutorId,
        name: tutorId === 'admin_shaka' ? 'Shaka Ahmad (Head Admin)' : 'Platform Support Desk',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: UserRole.ADMIN,
        bio: '24/7 Platform Support & Customer Service Representative Desk.'
      } as User;
    }
    return tutors.find(t => 
      t.id === tutorId || 
      t.name.toLowerCase() === tutorId.toLowerCase() || 
      t.email.toLowerCase() === tutorId.toLowerCase()
    );
  };

  const handleApproveSubmit = (assignId: string) => {
    onApproveWork(assignId, reviewRating, reviewContent);
    setShowReviewModal(null);
    setReviewRating(5);
    setReviewContent('');
  };

  const handleRevisionSubmit = (assignId: string) => {
    onRaiseRevision(assignId, revisionDetails);
    setShowRevisionModal(null);
    setRevisionDetails('');
  };

  const createTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    onRaiseTicket(ticketSubject, ticketMessage);
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSuccess(false);
    }, 4000);
  };

  const submitPlatformFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackMsg('');
      setFeedbackSuccess(false);
    }, 4000);
  };

  const handleQuickRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReqTitle.trim() || isSubmittingQuickReq) return;
    setIsSubmittingQuickReq(true);
    try {
      const subjectLower = (quickReqSubject || '').toLowerCase();
      const matchedTutor =
        tutors.find(
          (t) =>
            subjectLower &&
            ((t.subjects || []).some(
              (s) => s.toLowerCase().includes(subjectLower) || subjectLower.includes(s.toLowerCase())
            ) ||
              (t.primarySubject || '').toLowerCase().includes(subjectLower) ||
              (t.bio || '').toLowerCase().includes(subjectLower))
        ) || tutors[0];
      const trimmedTitle = quickReqTitle.trim();
      const deliverablesSummary =
        quickReqDeliverables.length > 0 ? quickReqDeliverables.join(', ') : 'None selected';
      const instructionsPayload = [
        `SERVICE CATEGORY: ${quickReqType}`,
        `SUBJECT: ${quickReqSubject || 'General Academic Tutoring'}`,
        `DEADLINE: ${quickReqDeadline}`,
        `DELIVERABLES (OPTIONAL): ${deliverablesSummary}`,
        quickReqNotes.trim() || 'Submitted via Create a Request panel.',
      ].join('\n');

      await Promise.resolve(
        onSubmitAssignment({
          studentId: currentUser.id,
          title: `${trimmedTitle} — ${quickReqType}`,
          subject: quickReqSubject || 'General Academic Tutoring',
          deadline: quickReqDeadline,
          wordCount: 1500,
          referenceStyle: 'APA',
          sourcesCount: 3,
          tutorId: matchedTutor?.id,
          instructions: instructionsPayload,
          fileUrls: [],
          fileNames: [],
        })
      );

      const tutorIdToChat = matchedTutor?.id || 'admin_shaka';
      const deliverablesChatPart =
        quickReqDeliverables.length > 0 ? ` Deliverables: ${quickReqDeliverables.join(', ')}.` : '';
      const welcomeMsg = `Hi ${matchedTutor?.name || 'Tutor'}, I just created a "${quickReqType}" request for "${trimmedTitle}" (${quickReqSubject || 'General Academic Tutoring'}, due ${quickReqDeadline}).${deliverablesChatPart}${quickReqNotes.trim() ? ` Notes: ${quickReqNotes.trim()}` : ''}`;
      const chatRes = onOpenChat(tutorIdToChat, welcomeMsg);
      if (chatRes && typeof chatRes === 'object' && 'id' in chatRes) {
        const newChatId = (chatRes as { id: string }).id;
        setLocalSelectedChatId(newChatId);
        onSubscribeToChatDetails?.(newChatId);
      }

      setIsQuickRequestModalOpen(false);
      setQuickReqTitle('');
      setQuickReqNotes('');
      setQuickReqDeliverables([]);
      setActiveTab('chat');
      triggerToast('Request submitted & chat thread opened!');
    } catch (err) {
      console.error('Quick request submission failed:', err);
      triggerToast('Unable to submit request. Please try again.');
    } finally {
      setIsSubmittingQuickReq(false);
    }
  };

  const handleOpenPrimaryTutorChat = () => {
    const assignedAssign = studentAssignments.find(a => a.tutorId);
    const tutorIdToChat = assignedAssign?.tutorId || 'tutor_clara';
    const tutorObj = getTutor(tutorIdToChat);
    onOpenChat(
      tutorIdToChat,
      `Hi ${tutorObj?.name || 'Tutor'}, I would like to consult with you about my academic assignments.`
    );
  };

  // Filter assignments by debounced text search if provided
  const searchedAssignments = studentAssignments.filter(a =>
    a.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );
  const ASSIGNMENTS_PAGE_SIZE = 15;
  const totalAssignmentsPages = Math.max(1, Math.ceil(searchedAssignments.length / ASSIGNMENTS_PAGE_SIZE));
  const safeAssignmentsPage = Math.min(assignmentsPage, totalAssignmentsPages);
  const paginatedAssignments = searchedAssignments.slice(
    (safeAssignmentsPage - 1) * ASSIGNMENTS_PAGE_SIZE,
    safeAssignmentsPage * ASSIGNMENTS_PAGE_SIZE
  );

  const NOTIFS_PAGE_SIZE = 15;
  const totalNotifsPages = Math.max(1, Math.ceil(userNotifications.length / NOTIFS_PAGE_SIZE));
  const safeNotifsPage = Math.min(notificationsPage, totalNotifsPages);
  const paginatedNotifications = userNotifications.slice(
    (safeNotifsPage - 1) * NOTIFS_PAGE_SIZE,
    safeNotifsPage * NOTIFS_PAGE_SIZE
  );

  const activeTabState = tabStates[`student:${activeTab}`];
  const isInitialTabLoading =
    Boolean(activeTabState?.loading) &&
    !activeTabState?.loadedAt &&
    ((activeTab === 'assignments' && studentAssignments.length === 0) ||
      (activeTab === 'payments' && studentPayments.length === 0 && studentInvoices.length === 0) ||
      (activeTab === 'chat' && studentChats.length === 0) ||
      (activeTab === 'notifications' && userNotifications.length === 0));

  const normalizedDashQuery = debouncedSearchQuery.trim().toLowerCase();
  const dashboardServices = [
    {
      label: 'Tutor Chats',
      icon: <MessageCircle className="w-5 h-5" />,
      circleColor: 'bg-orange-50 text-[#FF7A00]',
      hoverBorder: 'hover:border-orange-300',
      onClick: handleOpenPrimaryTutorChat,
    },
    {
      label: 'Assignments',
      icon: <BookOpen className="w-5 h-5" />,
      circleColor: 'bg-orange-50 text-[#FF7A00]',
      hoverBorder: 'hover:border-orange-300',
      onClick: () => setActiveTab('assignments'),
    },
    {
      label: 'CSR Support',
      icon: <Headset className="w-5 h-5" />,
      circleColor: 'bg-blue-50 text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      onClick: () => onOpenChat('admin_shaka'),
    },
    {
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      circleColor: 'bg-emerald-50 text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      onClick: () => setActiveTab('reports'),
    },
    {
      label: 'Results',
      icon: <Award className="w-5 h-5" />,
      circleColor: 'bg-indigo-50 text-indigo-600',
      hoverBorder: 'hover:border-indigo-300',
      onClick: () => setActiveTab('results'),
    },
    {
      label: 'Feedback',
      icon: <Heart className="w-5 h-5" />,
      circleColor: 'bg-pink-50 text-pink-600',
      hoverBorder: 'hover:border-pink-300',
      onClick: () => setActiveTab('feedback'),
    },
    {
      label: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      circleColor: 'bg-amber-50 text-amber-600',
      hoverBorder: 'hover:border-amber-300',
      onClick: () => setActiveTab('notifications'),
    },
    {
      label: 'Billing',
      icon: <Wallet className="w-5 h-5" />,
      circleColor: 'bg-purple-50 text-purple-600',
      hoverBorder: 'hover:border-purple-300',
      onClick: () => setActiveTab('payments'),
    },
  ];
  const filteredServices = normalizedDashQuery
    ? dashboardServices.filter(s => s.label.toLowerCase().includes(normalizedDashQuery))
    : dashboardServices;
  const recentDashboardRequests = (normalizedDashQuery ? searchedAssignments : studentAssignments).slice(0, 5);
  const ongoingCount = studentAssignments.filter(a => a.status !== AssignmentStatus.COMPLETED).length;
  const completedCount = studentAssignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
  const showMobileChrome = activeTab !== 'new_request';
  const showFloatingMobileWidgets = activeTab !== 'chat' && activeTab !== 'new_request';

  return (
    <div
      className={`flex bg-[#FAF8F5] text-slate-900 font-sans antialiased selection:bg-orange-200 ${
        activeTab === 'chat' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
      id="student-portal-wrapper"
    >
      {/* SLIDE-OUT DRAWER BACKDROP (MOBILE) */}
      {isMobileSidebarOpen && (
        <div
          id="drawerBackdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ============================================== */}
      {/* LEFT SIDEBAR & MOBILE SLIDE-OUT DRAWER         */}
      {/* ============================================== */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 lg:w-64 bg-[#FAF8F5] border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl lg:shadow-none
          lg:translate-x-0 lg:static lg:h-screen lg:overflow-y-auto shrink-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        id="student-sidebar"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Drawer / Sidebar Header */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <picture>
              <source type="image/avif" srcSet="/logo-220.avif 220w, /logo-440.avif 440w" sizes="180px" />
              <source type="image/webp" srcSet="/logo-220.webp 220w, /logo-440.webp 440w" sizes="180px" />
              <img
                src="/logo.webp"
                alt="University Tutors"
                width={180}
                height={68}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-10 lg:h-11 w-auto object-contain"
                id="logo-mortarboard"
              />
            </picture>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden compact-pill-btn p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Student Profile Card */}
          <div className="lg:hidden p-3.5 mx-3 mt-3 rounded-2xl bg-white border border-slate-200/70 flex items-center justify-between gap-3 shrink-0 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <ResponsiveAvatar
                src={currentUser.avatarUrl}
                alt={currentUser.name || 'Student'}
                sizePx={44}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-100 shrink-0"
              />
              <div className="min-w-0 text-left">
                <div className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div
                  className={`text-[10px] font-bold tracking-wider uppercase truncate ${
                    currentUser.verified ? 'text-[#FF7A00]' : 'text-amber-600'
                  }`}
                >
                  {currentUser.verified ? 'Verified Student' : 'Pending Verification'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileSidebarOpen(false);
                setIsAvatarEditorOpen(true);
              }}
              aria-label="Edit profile picture"
              className="compact-pill-btn p-2 rounded-xl bg-orange-50 text-[#FF7A00] hover:bg-orange-100 shrink-0 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Primary & Legal Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-left">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
              { id: 'new_request', label: 'New Request', icon: <PlusSquare className="w-4 h-4 text-[#FF7A00]" /> },
              { id: 'assignments', label: 'Assignments', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'results', label: 'Results & Comments', icon: <Award className="w-4 h-4" /> },
              {
                id: 'notifications',
                label: 'Notifications',
                icon: <Bell className="w-4 h-4" />,
                badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
              },
              { id: 'feedback', label: 'Leave Feedback', icon: <Heart className="w-4 h-4" /> },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-sans text-[13.5px] transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#FFF1E6] text-[#FF7A00] font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className={activeTab === item.id ? 'text-[#FF7A00]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FF7A00] text-white rounded-full tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="my-3 border-t border-slate-200/80" />

            {/* Legal / Secondary Block */}
            <div className="space-y-1">
              {[
                { id: 'agreements', label: 'Service Agreements', icon: <ShieldCheck className="w-4 h-4" /> },
                { id: 'sops', label: 'SOPs', icon: <FileText className="w-4 h-4" /> },
                { id: 'terms', label: 'Terms & Conditions', icon: <Info className="w-4 h-4" /> },
                { id: 'refund', label: 'Refund Policy', icon: <RotateCcw className="w-4 h-4" /> },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all text-left truncate cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#FFF1E6] text-[#FF7A00] font-bold'
                      : 'text-slate-500 hover:bg-slate-100 font-medium'
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="my-2 border-t border-slate-200/80" />

            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#FFF1E6] text-[#FF7A00]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#FF7A00]' : 'text-slate-500'}`} />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              id="sidebar-signout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ============================================== */}
      {/* MAIN VIEWPORT FRAME (SCROLLABLE RIGHT PANEL)  */}
      {/* ============================================== */}
      <main
        className={`flex-1 bg-[#FAF8F5] flex flex-col relative overflow-x-hidden ${
          activeTab === 'chat' ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen'
        }`}
      >
        {/* ==================== TOP MOBILE HEADER (lg:hidden) ==================== */}
        {showMobileChrome && (
          <header
            className="lg:hidden sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-slate-200/70 px-4 py-2.5 flex items-center justify-between shrink-0"
            id="mobile-portal-header"
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="openDrawerBtn"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open menu"
                className="compact-pill-btn p-2 -ml-2 rounded-xl text-slate-700 hover:bg-orange-50 active:scale-95 transition cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="compact-pill-btn flex items-center cursor-pointer"
                aria-label="Go to student dashboard home"
              >
                <picture>
                  <source type="image/avif" srcSet="/logo-220.avif 220w, /logo-440.avif 440w" sizes="140px" />
                  <source type="image/webp" srcSet="/logo-220.webp 220w, /logo-440.webp 440w" sizes="140px" />
                  <img
                    src="/logo.webp"
                    alt="University Tutors"
                    width={140}
                    height={53}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-8 w-auto object-contain"
                  />
                </picture>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                id="toggleSearchBtn"
                onClick={() => setIsMobileSearchOpen(prev => !prev)}
                aria-label="Search"
                className={`compact-pill-btn p-2 rounded-full active:scale-95 transition cursor-pointer ${
                  isMobileSearchOpen || searchQuery
                    ? 'bg-orange-50 text-[#FF7A00]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                aria-label="Notifications"
                className="compact-pill-btn relative p-2 rounded-full text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF7A00] ring-2 ring-[#FAF8F5]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open account drawer"
                className="compact-pill-btn flex items-center gap-2 pl-1 cursor-pointer"
              >
                <ResponsiveAvatar
                  src={currentUser.avatarUrl}
                  alt={currentUser.name || 'Student'}
                  sizePx={36}
                  width={32}
                  height={32}
                  loading="eager"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-200 bg-orange-50"
                />
              </button>
            </div>
          </header>
        )}

        {/* COLLAPSIBLE MOBILE SEARCH BAR */}
        {showMobileChrome && isMobileSearchOpen && (
          <div id="mobileSearchBar" className="lg:hidden px-4 py-2.5 bg-white border-b border-slate-200/80 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="serviceSearchInput"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, tutors, subjects..."
                autoFocus
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="compact-pill-btn absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* QUICK SUPPORT PILLS BAR (MOBILE ONLY WHEN NOT IN CHAT OR WIZARD) */}
        {showFloatingMobileWidgets && (
          <div className="lg:hidden px-4 pt-3 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={handleOpenPrimaryTutorChat}
              className="compact-pill-btn shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF5EB] border border-orange-200/80 text-xs font-semibold text-slate-800 active:scale-95 transition cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Tutor Chat</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenChat('admin_shaka')}
              className="compact-pill-btn shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 active:scale-95 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>Admin CSR</span>
            </button>
            <div
              className={`ml-auto shrink-0 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                currentUser.verified
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  currentUser.verified ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{currentUser.verified ? 'Verified' : 'Verify Email'}</span>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* DESKTOP TOP HEADER BAR (lg:flex)               */}
        {/* ============================================== */}
        <header
          className="hidden lg:flex bg-white border-b border-slate-200/70 h-20 px-8 items-center justify-between z-30 shrink-0"
          id="portal-inner-header"
        >
          {/* Dynamic Search Box */}
          <div className="relative w-72 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services, requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] font-sans transition-all"
              id="top-services-search"
            />
          </div>

          {/* User Profile & Actions Group */}
          <div className="flex items-center gap-3.5 ml-auto text-left">
            <button
              type="button"
              onClick={handleOpenPrimaryTutorChat}
              className="inline-flex items-center justify-center gap-1.5 border border-orange-200 bg-[#FFF5EB] hover:bg-orange-100 text-slate-800 px-3.5 py-2 rounded-2xl text-[12px] font-bold shadow-3xs cursor-pointer transition-all"
              id="header-tutor-chat-btn"
              title="Open direct chat with your assigned subject tutor"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Tutor Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChat('admin_shaka')}
              className="inline-flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-2xl text-[12px] font-bold shadow-3xs cursor-pointer transition-all"
              id="header-csr-consult"
              title="Consult with Platform Support Desk (CSR)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>Admin CSR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuickRequestModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white px-4 py-2 rounded-2xl text-[12px] font-bold shadow-md shadow-orange-500/15 cursor-pointer transition-all"
              id="header-create-request"
            >
              <Plus className="w-4 h-4" />
              <span>Create Request</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="p-2.5 rounded-xl text-slate-600 hover:text-[#FF7A00] hover:bg-slate-100 relative transition-all cursor-pointer"
              title="Notifications Center"
              id="header-notifications-bell"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#FF7A00] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm animate-pulse tabular-nums">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <span className="h-6 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden xl:block">
                <span className="text-[12px] font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                <span className="text-[9.5px] font-mono text-[#FF7A00] uppercase block tracking-wider leading-none font-bold">
                  {currentUser.verified ? 'Verified Student' : 'Pending Verification'}
                </span>
              </div>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsAvatarEditorOpen(true)}
                  className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A00] cursor-pointer transition-transform group-hover:scale-105"
                  title="Click to change or upload profile photo"
                  id="student-header-avatar-btn"
                >
                  <ResponsiveAvatar
                    src={currentUser.avatarUrl}
                    alt="Student Profile"
                    sizePx={48}
                    width={40}
                    height={40}
                    loading="eager"
                    className="w-10 h-10 rounded-full bg-orange-100 object-cover border-2 border-orange-200 shadow-3xs"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================== */}
        {/* EMAIL VERIFICATION BANNER                      */}
        {/* ============================================== */}
        {(!currentUser.verified || verificationBannerMsg) && (
          <div
            id="email-verification-banner"
            className={`px-4 lg:px-6 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-2.5 ${
              currentUser.verified
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm shrink-0">{currentUser.verified ? '✅' : '✉️'}</span>
              <p className="font-medium leading-snug">
                {verificationBannerMsg || (
                  <>
                    Your email <strong>{currentUser.email}</strong> is pending verification. Check your inbox for your confirmation link.
                  </>
                )}
              </p>
            </div>
            {!currentUser.verified && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="compact-pill-btn bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] cursor-pointer transition-all shadow-3xs shrink-0"
              >
                {isResendingVerification ? 'Sending Link...' : 'Resend Verification'}
              </button>
            )}
          </div>
        )}

        {/* ============================================== */}
        {/* WORKSPACE AREA RENDERING VARIOUS VIEWS        */}
        {/* ============================================== */}
        <div
          className={`flex-1 ${
            activeTab === 'chat'
              ? 'p-2 sm:p-4 md:p-6 min-h-0 overflow-hidden flex flex-col'
              : activeTab === 'new_request'
              ? 'p-3 sm:p-5 md:p-8 overflow-y-auto'
              : 'px-4 py-3 sm:p-6 lg:p-8 pb-36 lg:pb-10 overflow-y-auto space-y-6'
          }`}
          id="portal-content-body"
        >
          <ErrorBoundary compact resetKey={activeTab} onReset={() => onLoadTab?.(activeTab, true)}>
          {(activeTabState?.error || (activeTab === 'chat' && chatError)) && (
            <ErrorStatePanel
              title="Could not sync latest data"
              message={activeTabState?.error || chatError || syncError || 'Temporary connection error.'}
              onRetry={() => {
                if (activeTab === 'chat' && localSelectedChatId && onSubscribeToChatDetails) {
                  onSubscribeToChatDetails(localSelectedChatId);
                }
                onLoadTab?.(activeTab, true);
              }}
            />
          )}

          {isInitialTabLoading ? (
            <TabLoadingSkeleton
              variant={activeTab === 'chat' ? 'split' : activeTab === 'assignments' ? 'table' : 'cards'}
              label={`Loading ${activeTab}...`}
            />
          ) : (
          <>
          {/* ========================== */}
          {/* TAB 1: DASHBOARD (HOME VIEW) */}
          {/* ========================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 md:space-y-7 animate-fade-in text-left">
              {/* HERO BANNER CARD */}
              <section
                className="relative overflow-hidden rounded-2xl md:rounded-[28px] bg-gradient-to-br from-[#090E1A] via-[#0F172A] to-[#172038] p-4 sm:p-6 md:p-10 text-white shadow-md md:shadow-xl"
                id="dashboard-hero-banner"
              >
                <div className="absolute -right-8 -bottom-8 w-32 h-32 md:w-80 md:h-80 rounded-full bg-[#FF7A00]/20 blur-2xl md:blur-3xl pointer-events-none" />
                <div className="hidden md:block absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 mb-2 md:mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] md:text-[10.5px] font-bold tracking-widest uppercase text-emerald-400">
                      Experts Online Now
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-2xl md:text-5xl font-extrabold leading-snug md:leading-tight tracking-tight mb-1 md:mb-3 text-white">
                    Ace your next <span className="text-[#FF8A00]">Assignment.</span>
                  </h1>

                  <p className="text-[11px] sm:text-xs md:text-base text-slate-300 leading-snug md:leading-relaxed mb-3.5 md:mb-6 max-w-lg">
                    Fast, reliable help for midterms &amp; finals with verified specialist tutors.
                  </p>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsQuickRequestModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 py-2 md:py-3 px-3 md:px-6 rounded-xl md:rounded-2xl bg-[#FF8A00] hover:bg-[#FF7A00] text-white font-semibold md:font-bold text-xs md:text-[13px] shadow-sm md:shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                      id="hero-create-btn"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Create Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChat('admin_shaka')}
                      className="flex items-center justify-center py-2 md:py-3 px-3 md:px-6 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold md:font-bold text-xs md:text-[13px] active:scale-95 transition cursor-pointer"
                      id="hero-consult-btn"
                    >
                      Consult with CSR
                    </button>
                  </div>
                </div>
              </section>

              {/* KPI STATS CARDS (3-COLUMN COMPACT ON MOBILE & DESKTOP) */}
              <section aria-label="Account Summary" className="grid grid-cols-3 gap-2.5 md:gap-6" id="dashboard-status-metrics">
                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className="bg-white rounded-2xl p-3.5 md:p-5 border border-slate-200/70 shadow-sm hover:border-blue-200 hover:-translate-y-0.5 transition-all flex flex-col justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3 w-full">
                    <span id="ongoingCount" className="text-xl md:text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
                      {ongoingCount}
                    </span>
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase text-slate-400">
                    Ongoing
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className="bg-white rounded-2xl p-3.5 md:p-5 border border-slate-200/70 shadow-sm hover:border-emerald-200 hover:-translate-y-0.5 transition-all flex flex-col justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3 w-full">
                    <span className="text-xl md:text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
                      {completedCount}
                    </span>
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase text-slate-400">
                    Completed
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="bg-white rounded-2xl p-3.5 md:p-5 border border-slate-200/70 shadow-sm hover:border-orange-200 hover:-translate-y-0.5 transition-all flex flex-col justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3 w-full">
                    <span className="text-xl md:text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
                      ${totalAdvancePaidSum.toFixed(0)}
                    </span>
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase text-slate-400">
                    Payments
                  </span>
                </button>
              </section>

              {/* SERVICES & PORTALS GRID */}
              <section id="dashboard-services-grid">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm md:text-[15px] font-bold text-slate-900">Services &amp; Portals</h2>
                  <span className="text-xs text-slate-400 font-medium tabular-nums">
                    {filteredServices.length} Portals
                  </span>
                </div>

                {filteredServices.length > 0 ? (
                  <div id="servicesGrid" className="grid grid-cols-4 lg:grid-cols-8 gap-2.5 md:gap-4">
                    {filteredServices.map((srv, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={srv.onClick}
                        className={`service-item bg-white rounded-2xl p-2.5 sm:p-4 border border-slate-200/70 shadow-sm flex flex-col items-center justify-center gap-2 ${srv.hoverBorder} active:scale-95 transition cursor-pointer group`}
                      >
                        <div className={`w-10 h-10 rounded-full ${srv.circleColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          {srv.icon}
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">
                          {srv.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center text-xs text-slate-500">
                    No portals matching &ldquo;{debouncedSearchQuery}&rdquo;.
                  </div>
                )}
              </section>

              {/* RECENT REQUESTS SECTION */}
              <section id="dashboard-recent-requests">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm md:text-[15px] font-bold text-slate-900">Recent Requests</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="compact-pill-btn text-[11px] font-bold tracking-wider uppercase text-[#FF7A00] hover:underline cursor-pointer tabular-nums"
                  >
                    View All ({studentAssignments.length})
                  </button>
                </div>

                <div id="requestsContainer" className="space-y-2.5">
                  {recentDashboardRequests.length > 0 ? (
                    recentDashboardRequests.map((a) => {
                      const tutorObj = getTutor(a.tutorId);
                      return (
                        <div
                          key={a.id}
                          id={`request-recent-${a.id}`}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-left hover:border-orange-200 transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7A00]">
                                {a.subject}
                              </span>
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                                {a.status || 'Matching'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{a.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                              <span className="tabular-nums">Due: {a.deadline}</span>
                              <span>•</span>
                              <span>
                                Tutor:{' '}
                                <strong className={tutorObj ? 'text-[#FF7A00] font-semibold' : 'text-slate-400 font-medium'}>
                                  {tutorObj?.name || 'Automatching...'}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {tutorObj ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenChat(
                                    tutorObj.id,
                                    `Hi ${tutorObj.name}, I would like to check in on my assignment: "${a.title}".`
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Tutor Chat</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenChat(
                                    'admin_shaka',
                                    `Hi CSR desk, could you please give me an update on matching for assignment: "${a.title}"?`
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <Headset className="w-3.5 h-3.5" />
                                <span>CSR Match</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onOpenChat('admin_shaka')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                              title="Platform Support CSR"
                            >
                              <span>CSR</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/70 p-6 md:p-8 text-center shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-3">
                        <FilePlus2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">
                        {normalizedDashQuery ? 'No matching requests' : 'No requests yet'}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 max-w-[260px] mx-auto">
                        {normalizedDashQuery
                          ? `No assignment briefs matched "${debouncedSearchQuery}".`
                          : 'Create your first assignment or midterm request to connect with a specialist tutor.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsQuickRequestModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E86E00] text-white text-xs font-semibold shadow-sm active:scale-95 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Request</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ================================== */}
          {/* TAB 2: MOBILE-FIRST STUDENT ONBOARDING WIZARD */}
          {/* ================================== */}
          {activeTab === 'new_request' && (
            <StudentOnboardingWizard
              currentUser={currentUser}
              tutors={tutors}
              onSubmitAssignment={onSubmitAssignment}
              onOpenChat={onOpenChat}
              onOpenWhatsApp={onOpenWhatsApp}
              onOpenMenu={() => setIsMobileSidebarOpen(true)}
              onExit={() => setActiveTab('dashboard')}
              onSelectChatId={(chatId) => {
                setLocalSelectedChatId(chatId);
                if (onSubscribeToChatDetails) onSubscribeToChatDetails(chatId);
              }}
              onGoToChat={() => setActiveTab('chat')}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          )}

          {/* ================================== */}
          {/* TAB 3: ASSIGNMENTS MONITOR         */}
          {/* ================================== */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs animate-fade-in text-left">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-sans tracking-tight">University Assignments Monitor</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verify completion percentages, download tutor references, and release funds securely.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search titles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FF7A00] font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickRequestModalOpen(true)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-[#FF7A00] hover:bg-[#E86E00] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>

              {searchedAssignments.length > 0 ? (
                <>
                  {/* MOBILE CARD LIST (< md) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {paginatedAssignments.map((a) => {
                      const tutor = getTutor(a.tutorId);
                      return (
                        <div key={a.id} id={`assignment-card-${a.id}`} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7A00] mb-1">
                                {a.subject}
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">{a.title}</h4>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-orange-100/70 text-[#FF7A00] font-mono">
                              {a.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="tabular-nums">Due: {a.deadline}</span>
                            <span className="tabular-nums font-semibold text-slate-700">{a.progressPercent}% Complete</span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#FF7A00] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${a.progressPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            {tutor ? (
                              <div className="flex items-center gap-2">
                                <ResponsiveAvatar src={tutor.avatarUrl} alt="" sizePx={28} width={24} height={24} className="w-6 h-6 rounded-full border object-cover" />
                                <span className="text-xs font-semibold text-slate-800">{tutor.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Matching specialist...</span>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {tutor ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenChat(tutor.id, `Hi ${tutor.name}, let's coordinate on assignment "${a.title}".`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white rounded-xl text-[11px] font-bold cursor-pointer"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>Tutor Chat</span>
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => onOpenChat('admin_shaka', `Hi CSR desk, update on "${a.title}" please.`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold cursor-pointer"
                              >
                                <Headset className="w-3 h-3 text-slate-500" />
                                <span>CSR</span>
                              </button>
                              {a.tutorWorkFileUrl && (
                                <a
                                  href={a.tutorWorkFileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Solution</span>
                                </a>
                              )}
                              {a.status === AssignmentStatus.COMPLETED && !a.reviewed && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setShowReviewModal(a.id)}
                                    className="bg-[#FF7A00] text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowRevisionModal(a.id)}
                                    className="bg-white border border-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Revision</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE (md+) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                          <th className="p-4 font-bold">Submission Details</th>
                          <th className="p-4 font-bold">Scientific Mentor</th>
                          <th className="p-4 font-bold">Due Deadline</th>
                          <th className="p-4 font-bold">Progress Tracker</th>
                          <th className="p-4 font-bold text-right">Integrity Status Checks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {paginatedAssignments.map((a) => {
                          const tutor = getTutor(a.tutorId);
                          return (
                            <tr key={a.id} id={`assignment-row-${a.id}`} className="hover:bg-slate-50/50">
                              <td className="p-4 max-w-xs space-y-1">
                                <span className="font-bold text-slate-900 block truncate">{a.title}</span>
                                <div className="flex gap-1.5 flex-wrap text-[10px]">
                                  <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{a.referenceStyle}</span>
                                  <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tabular-nums">{a.wordCount} words</span>
                                </div>
                              </td>

                              <td className="p-4">
                                {tutor ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <ResponsiveAvatar src={tutor.avatarUrl} alt="" sizePx={32} width={24} height={24} className="w-6 h-6 rounded-full border object-cover" />
                                      <span className="font-bold text-slate-800">{tutor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => onOpenChat(tutor.id, `Hi ${tutor.name}, let's coordinate on assignment "${a.title}".`)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FF7A00] hover:bg-[#E86E00] text-white rounded-lg text-[10.5px] font-bold transition-all shadow-3xs cursor-pointer"
                                        title={`Open direct Tutor Chat with ${tutor.name}`}
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        <span>Tutor Chat</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onOpenChat('admin_shaka')}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                                        title="Consult with CSR support desk"
                                      >
                                        <Headset className="w-3 h-3 text-slate-500" />
                                        <span>CSR</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-slate-400 italic block text-[11px]">Matching candidate...</span>
                                    <button
                                      type="button"
                                      onClick={() => onOpenChat('admin_shaka', `Hi CSR desk, please update me on matching for: "${a.title}".`)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                                    >
                                      <Headset className="w-3 h-3 text-slate-500" />
                                      <span>Consult CSR</span>
                                    </button>
                                  </div>
                                )}
                              </td>

                              <td className="p-4 font-mono font-medium text-slate-600 tabular-nums">
                                {a.deadline}
                              </td>

                              <td className="p-4 max-w-[130px] space-y-1.5">
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono tabular-nums">
                                  <span>Completed:</span>
                                  <span>{a.progressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#FF7A00] h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${a.progressPercent}%` }}
                                  />
                                </div>
                              </td>

                              <td className="p-4 text-right space-y-1.5">
                                <div>
                                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-orange-100/60 text-[#FF7A00] font-mono">
                                    {a.status}
                                  </span>
                                </div>

                                <div className="flex gap-1.5 justify-end">
                                  {a.tutorWorkFileUrl && (
                                    <a
                                      href={a.tutorWorkFileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/10"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download Solution</span>
                                    </a>
                                  )}

                                  {a.status === AssignmentStatus.COMPLETED && !a.reviewed && (
                                    <>
                                      <button
                                        onClick={() => setShowReviewModal(a.id)}
                                        className="bg-[#FF7A00] hover:bg-[#E86E00] text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>Approve Delivery</span>
                                      </button>
                                      <button
                                        onClick={() => setShowRevisionModal(a.id)}
                                        className="bg-white hover:bg-slate-100 border text-slate-700 font-bold px-2 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Revision</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 pb-4">
                    <PaginationBar
                      page={safeAssignmentsPage}
                      totalPages={totalAssignmentsPages}
                      totalItems={searchedAssignments.length}
                      pageSize={ASSIGNMENTS_PAGE_SIZE}
                      onPageChange={setAssignmentsPage}
                      itemLabel="assignments"
                    />
                  </div>
                </>
              ) : (
                <div className="p-10 text-center bg-slate-50/70 border-t border-slate-100">
                  <FilePlus2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-600 font-medium">No student assignment briefs registered.</p>
                  <button
                    type="button"
                    onClick={() => setIsQuickRequestModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Your First Brief</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================== */}
          {/* TAB 4: PAYMENTS LEDGER & STATEMENTS */}
          {/* ================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in text-left font-sans" id="student-payments-view">
              
              {/* Payment Success Alert Toast */}
              {paymentSuccessToast && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">Escrow Transaction Confirmed</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">{paymentSuccessToast}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPaymentSuccessToast(null)}
                    className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* SECTION HEADER & REAL-TIME ACTIONS */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
                      <Wallet className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Payment Ledger & Statements</h2>
                  </div>
                  <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                    Review your assignment-wise financial ledger, live escrow security deposits, and download verifiable PDF statements of accounts.
                  </p>
                </div>

                {/* Live Admin Sync & PDF Statement Generator Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Real-time Admin Synchronization Badge & Refresh */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">Admin Sync: Live</span>
                    <button
                      onClick={handleRefreshPayments}
                      disabled={isSyncingPayments}
                      className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-all cursor-pointer disabled:opacity-50"
                      title="Fetch live payment updates from admin dashboard"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPayments ? 'animate-spin text-orange-600' : ''}`} />
                    </button>
                  </div>

                  {/* Primary PDF Download Action */}
                  <button
                    onClick={handleDownloadPDFStatement}
                    disabled={isGeneratingPdf}
                    id="btn-download-pdf-statement"
                    className="bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    title="Download complete formatted statement of payments"
                  >
                    <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                    <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Statement (PDF)'}</span>
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* FEATURE 1: CORE SUMMARY FINANCIAL METRIC CARDS          */}
              {/* ======================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="payment-summary-metrics">
                
                {/* 1. Total Payment Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Payment</span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl md:text-3xl font-extrabold text-slate-900 block font-mono">
                      ${totalQuotedSum.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Across {assignmentPaymentRows.length} registered brief(s)
                    </span>
                  </div>
                </div>

                {/* 2. Advance Paid Card */}
                <div className="bg-white rounded-3xl p-5 border border-emerald-150 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Advance Paid</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl md:text-3xl font-extrabold text-emerald-700 block font-mono">
                      ${totalAdvancePaidSum.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-emerald-600/80 font-medium mt-1 block">
                      Secured in 100% escrow holding
                    </span>
                  </div>
                </div>

                {/* 3. Remaining Balance Card */}
                <div className="bg-white rounded-3xl p-5 border border-orange-150 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">Remaining Balance</span>
                    <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
                      <RotateCcw className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl md:text-3xl font-extrabold text-orange-600 block font-mono">
                      ${totalRemainingBalanceSum.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-orange-600/80 font-medium mt-1 block">
                      Payable upon milestone approval
                    </span>
                  </div>
                </div>

                {/* 4. Escrow Protection Assurance Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Escrow Protected
                    </span>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-mono text-slate-300">PCI-DSS</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block leading-tight">100% Money-Back Guarantee</span>
                    <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                      Tutors receive funds only after you inspect and approve completed coursework or lesson solutions.
                    </p>
                  </div>
                </div>

              </div>

              {/* ======================================================= */}
              {/* FEATURE 2: ASSIGNMENT-WISE PAYMENT TABLE                */}
              {/* ======================================================= */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs">
                
                {/* Table Header Controls */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-950 tracking-tight">Assignment-wise Payment Ledger</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Itemized fee breakdown, deposit milestones, and balance settlements per brief.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-400 font-mono">
                      {assignmentPaymentRows.length} item(s) logged
                    </span>
                  </div>
                </div>

                {assignmentPaymentRows.length > 0 ? (
                  <>
                    {/* MOBILE PAYMENT CARDS (< md) */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {assignmentPaymentRows.map((row) => (
                        <div key={row.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">{row.title}</h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleCopyRef(row.id)}
                                  className="compact-pill-btn font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>#{row.id}</span>
                                  {copiedRefId === row.id && (
                                    <span className="text-[9px] text-emerald-600 font-bold ml-0.5">Copied!</span>
                                  )}
                                </button>
                                <span className="text-[#FF7A00] font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                                  {row.subject}
                                </span>
                              </div>
                            </div>
                            <span className={`shrink-0 font-bold text-[9.5px] px-2 py-0.5 rounded-full border uppercase font-mono ${row.statusBadgeClass}`}>
                              {row.statusText}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {row.totalAmount > 0 ? `$${row.totalAmount.toFixed(2)}` : 'Pending'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Advance</span>
                              <span className="font-mono font-bold text-emerald-700 tabular-nums">${row.advancePaid.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance</span>
                              <span className="font-mono font-bold text-[#FF7A00] tabular-nums">
                                {row.totalAmount > 0 ? `$${row.balanceAmount.toFixed(2)}` : '—'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {row.totalAmount > 0 && row.advancePaid === 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentModal({
                                  isOpen: true,
                                  assignmentId: row.id,
                                  title: row.title,
                                  amount: Number((row.totalAmount * 0.5).toFixed(2)),
                                  type: 'advance'
                                })}
                                className="bg-[#FF7A00] hover:bg-[#E86E00] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Advance (${(row.totalAmount * 0.5).toFixed(2)})</span>
                              </button>
                            )}
                            {row.advancePaid > 0 && row.balanceAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentModal({
                                  isOpen: true,
                                  assignmentId: row.id,
                                  title: row.title,
                                  amount: row.balanceAmount,
                                  type: 'balance'
                                })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Settle (${row.balanceAmount.toFixed(2)})</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const matchedChat = studentChats.find(c => c.subject.includes(row.subject) || c.subject.includes(row.title));
                                if (matchedChat) {
                                  setLocalSelectedChatId(matchedChat.id);
                                  setActiveTab('chat');
                                } else {
                                  onOpenChat('admin_shaka', `Regarding billing for Assignment #${row.id} ("${row.title}").`);
                                }
                              }}
                              className="px-2.5 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Discuss</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DESKTOP PAYMENT TABLE (md+) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 uppercase font-mono tracking-wider text-[10px]">
                            <th className="p-4 font-bold">Assignment ID &amp; Title</th>
                            <th className="p-4 font-bold">Total Amount</th>
                            <th className="p-4 font-bold">Advance Paid</th>
                            <th className="p-4 font-bold">Balance Amount</th>
                            <th className="p-4 font-bold text-center">Payment Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {assignmentPaymentRows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4">
                                <div className="space-y-1">
                                  <span className="font-bold text-gray-950 text-xs block leading-snug">
                                    {row.title}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                    <button
                                      onClick={() => handleCopyRef(row.id)}
                                      className="font-mono text-slate-500 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-1.5 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                                      title="Click to copy assignment reference ID"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>#{row.id}</span>
                                      {copiedRefId === row.id && (
                                        <span className="text-[9px] text-emerald-600 font-bold ml-0.5">Copied!</span>
                                      )}
                                    </button>
                                    <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                                      {row.subject}
                                    </span>
                                    {row.tutorName && (
                                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                        🎓 {row.tutorName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 font-mono font-bold text-slate-900 tabular-nums">
                                {row.totalAmount > 0 ? (
                                  <span className="text-sm font-extrabold text-slate-900">${row.totalAmount.toFixed(2)}</span>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px] font-sans font-medium">Pending Quote</span>
                                )}
                              </td>

                              <td className="p-4 font-mono tabular-nums">
                                {row.advancePaid > 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-emerald-700 block">${row.advancePaid.toFixed(2)}</span>
                                    <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-sans font-semibold">
                                      Escrowed
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs">$0.00</span>
                                )}
                              </td>

                              <td className="p-4 font-mono tabular-nums">
                                {row.balanceAmount > 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-orange-700 block">${row.balanceAmount.toFixed(2)}</span>
                                    <span className="inline-block text-[9px] bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded font-sans font-semibold">
                                      Due on approval
                                    </span>
                                  </div>
                                ) : row.totalAmount > 0 ? (
                                  <span className="text-emerald-600 font-bold text-xs">$0.00 (Settled)</span>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              <td className="p-4 text-center">
                                <span className={`inline-block font-bold text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-mono ${row.statusBadgeClass}`}>
                                  {row.statusText}
                                </span>
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {row.totalAmount > 0 && row.advancePaid === 0 && (
                                    <button
                                      onClick={() => setPaymentModal({
                                        isOpen: true,
                                        assignmentId: row.id,
                                        title: row.title,
                                        amount: Number((row.totalAmount * 0.5).toFixed(2)),
                                        type: 'advance'
                                      })}
                                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10.5px] px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      <span>Pay Advance (${(row.totalAmount * 0.5).toFixed(2)})</span>
                                    </button>
                                  )}

                                  {row.advancePaid > 0 && row.balanceAmount > 0 && (
                                    <button
                                      onClick={() => setPaymentModal({
                                        isOpen: true,
                                        assignmentId: row.id,
                                        title: row.title,
                                        amount: row.balanceAmount,
                                        type: 'balance'
                                      })}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <Lock className="w-3 h-3" />
                                      <span>Settle Balance (${row.balanceAmount.toFixed(2)})</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      const matchedChat = studentChats.find(c => c.subject.includes(row.subject) || c.subject.includes(row.title));
                                      if (matchedChat) {
                                        setLocalSelectedChatId(matchedChat.id);
                                        setActiveTab('chat');
                                      } else {
                                        onOpenChat('admin_shaka', `Regarding billing for Assignment #${row.id} ("${row.title}").`);
                                      }
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    title="Discuss payment details in chat"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center bg-slate-50/50">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-700 text-sm">No Active Assignment Payments Logged</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Submit an academic brief or lesson request to activate itemized billing quotes and escrow milestones.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsQuickRequestModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#E86E00] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Submit Your First Brief</span>
                    </button>
                  </div>
                )}

              </div>

              {/* ======================================================= */}
              {/* SUB-SECTION: VERIFIED TRANSACTION AUDIT LOGS            */}
              {/* ======================================================= */}
              {studentPayments.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-orange-500" />
                        <span>Verified Stripe &amp; Escrow Transaction Receipts</span>
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Automated cryptographic receipt identifiers for card, wire, and digital payments.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
                      {studentPayments.length} Receipt(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-150 text-slate-400 uppercase font-mono tracking-wider text-[9.5px]">
                          <th className="p-3.5 font-bold">Transaction Reference</th>
                          <th className="p-3.5 font-bold">Assignment Reference</th>
                          <th className="p-3.5 font-bold">Amount</th>
                          <th className="p-3.5 font-bold text-right">Holding Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-xs">
                        {studentPayments.map((p) => {
                          const assign = assignments.find(a => a.id === p.assignmentId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="p-3.5">
                                <span className="font-bold text-slate-900 block">{p.id}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{p.stripePaymentIntent}</span>
                              </td>
                              <td className="p-3.5 font-sans">
                                <span className="font-semibold text-slate-700 block">{assign?.title || 'Academic Brief'}</span>
                                <span className="text-[10px] text-slate-400 font-mono">#{p.assignmentId}</span>
                              </td>
                              <td className="p-3.5 font-bold text-slate-900">
                                ${p.amount.toFixed(2)} USD
                              </td>
                              <td className="p-3.5 text-right font-sans">
                                <span className={`inline-block font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase font-mono ${
                                  p.status === 'escrow' ? 'bg-amber-100 text-amber-800' :
                                  p.status === 'released' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-red-100 text-red-750'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* MODAL: ESCROW DEPOSIT CONFIRMATION                      */}
              {/* ======================================================= */}
              {paymentModal && paymentModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
                          <Lock className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">Authorize Escrow Holding</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {paymentModal.type === 'advance' ? '50% Milestone Deposit' : 'Remaining Balance Settlement'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setPaymentModal(null)}
                        className="text-slate-400 hover:text-slate-600 font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Brief Title:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{paymentModal.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Ref Code:</span>
                        <span className="font-mono text-slate-700">#{paymentModal.assignmentId}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
                        <span className="text-slate-700 font-bold">Deposit Amount:</span>
                        <span className="text-lg font-black text-orange-600 font-mono">${paymentModal.amount.toFixed(2)} USD</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 text-[11px] text-emerald-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Protected Under 100% Milestone Escrow</span>
                      </div>
                      <p className="text-[10.5px] text-emerald-700 leading-tight">
                        Funds are held in secure escrow. The assigned tutor receives payment only when you review and confirm the finished academic deliverable.
                      </p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => setPaymentModal(null)}
                        disabled={isProcessingPayment}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecutePayment}
                        disabled={isProcessingPayment}
                        className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Securing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm &amp; Deposit</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* REMOVED HARDCODED DUMMY TUTORS DIRECTORY VIEW */}

          {/* ================================== */}
          {/* TAB 6: CHAT INTERFACE MESSENGER   */}
          {/* ================================== */}
          {activeTab === 'chat' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl flex flex-col flex-1 min-h-0 overflow-hidden shadow-sm text-left relative animate-fade-in">
              
              {/* Discussion Channels + Center Chat Workspace */}
              <div className="flex-1 min-h-0 flex overflow-hidden w-full relative">

                {/* LEFT SIDEBAR: DISCUSSION CHANNELS */}
                <aside className={`bg-white border-r border-slate-200/80 flex flex-col shrink-0 shadow-xs overflow-hidden transition-all duration-200 ${
                  isMobileChannelsOpen 
                    ? 'fixed inset-0 z-50 w-full h-full' 
                    : 'hidden md:flex w-72 md:w-80 lg:w-88'
                }`}>
                  
                  {/* Sidebar Title Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        <span>Discussion Channels</span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200/50">
                          {studentChats.length || 1} Active
                        </span>
                        {isMobileChannelsOpen && (
                          <button 
                            type="button" 
                            onClick={() => setIsMobileChannelsOpen(false)}
                            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="Close channels"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Channel Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={channelSearchFilter}
                        onChange={(e) => setChannelSearchFilter(e.target.value)}
                        placeholder="Filter conversations..." 
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Channels Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-5">

                    {(() => {
                      const supportChat = studentChats.find(c => c.tutorId === 'admin_emily' || c.tutorId.startsWith('admin_'));
                      
                      // AUTOMATED TUTOR MATCHING LOGIC:
                      // Strictly display tutors who have been automatically assigned by the system
                      const assignedTutorIds = new Set<string>(
                        studentAssignments
                          .filter(a => a.tutorId && !a.tutorId.startsWith('admin_') && a.tutorId !== 'admin_emily' && a.tutorId !== 'admin_shaka')
                          .map(a => a.tutorId as string)
                      );

                      const assignedTutorChats = studentChats.filter(c => 
                        !c.tutorId.startsWith('admin_') && c.tutorId !== 'admin_emily' && assignedTutorIds.has(c.tutorId)
                      );

                      const filteredTutorChats = assignedTutorChats.filter(c => {
                        const tutor = getTutor(c.tutorId);
                        const query = channelSearchFilter.toLowerCase();
                        return !query || (tutor?.name.toLowerCase().includes(query)) || (c.subject.toLowerCase().includes(query));
                      });

                      // Assigned tutors that have an assignment matched but no chat thread instantiated yet
                      const pendingAssignedTutorIds = Array.from(assignedTutorIds).filter(
                        id => !assignedTutorChats.some(c => c.tutorId === id)
                      );

                      return (
                        <>
                          {/* SECTION 1: SUPPORT CHANNELS */}
                          <div>
                            <div className="px-2 mb-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Support Channel</span>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 24/7 Available
                              </span>
                            </div>

                            {supportChat ? (
                              <div 
                                onClick={() => {
                                  setLocalSelectedChatId(supportChat.id);
                                  setIsMobileChannelsOpen(false);
                                  if (onSubscribeToChatDetails) onSubscribeToChatDetails(supportChat.id);
                                }} 
                                className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 relative group ${
                                  localSelectedChatId === supportChat.id
                                    ? 'border-orange-200 bg-orange-50/50 shadow-xs'
                                    : 'border-transparent hover:bg-slate-50'
                                }`}
                              >
                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                                    <Headset className="w-5 h-5" />
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">Chat with Support/Admin</h4>
                                    <span className="text-[10px] font-medium text-slate-400">Online</span>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">
                                    {messages.filter(m => m.chatId === supportChat.id).slice(-1)[0]?.content || "24/7 Support Desk Active"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  onOpenChat('admin_shaka');
                                  setIsMobileChannelsOpen(false);
                                }}
                                className="p-3 rounded-xl cursor-pointer transition-all border border-dashed border-orange-200 bg-orange-50/30 hover:bg-orange-50/60 flex items-start gap-3 relative group"
                              >
                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 animate-pulse">
                                    <Headset className="w-5 h-5" />
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">Chat with Support/Admin</h4>
                                    <span className="text-[10px] font-bold text-orange-600">24/7</span>
                                  </div>
                                  <p className="text-xs text-orange-600 font-semibold truncate">Click to message 24/7 Support Desk</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SECTION 2: AUTOMATICALLY ASSIGNED TUTORS ONLY */}
                          <div>
                            <div className="px-2 mb-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Assigned Academic Tutors</span>
                              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {assignedTutorChats.length + pendingAssignedTutorIds.length} Matched
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {filteredTutorChats.map((c) => {
                                const tutor = getTutor(c.tutorId);
                                const lastMsg = messages.filter(m => m.chatId === c.id).slice(-1)[0];
                                const isSelected = localSelectedChatId === c.id;
                                const linkedAssign = studentAssignments.find(a => a.tutorId === c.tutorId);
                                return (
                                  <div 
                                    key={c.id} 
                                    onClick={() => {
                                      setLocalSelectedChatId(c.id);
                                      setIsMobileChannelsOpen(false);
                                      if (onSubscribeToChatDetails) onSubscribeToChatDetails(c.id);
                                    }} 
                                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 relative group ${
                                      isSelected
                                        ? 'border-orange-200 bg-orange-50/50 shadow-xs'
                                        : 'border-transparent hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="relative shrink-0">
                                      <ResponsiveAvatar
                                        src={tutor?.avatarUrl}
                                        alt=""
                                        sizePx={48}
                                        width={40}
                                        height={40}
                                        fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format&q=75"
                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                                      />
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <h4 className="text-xs font-bold text-slate-900 truncate">{tutor?.name || 'Assigned Tutor'}</h4>
                                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200/60 shrink-0">
                                            Matched
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                          {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 truncate">{c.subject || linkedAssign?.title || 'Academic Consultation'}</p>
                                      {lastMsg && (
                                        <p className="text-[11px] text-slate-400 truncate italic mt-0.5">{lastMsg.content}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Pending assigned tutors with an active assignment */}
                              {pendingAssignedTutorIds.map((tutorId) => {
                                const tutor = getTutor(tutorId);
                                const linkedAssign = studentAssignments.find(a => a.tutorId === tutorId);
                                return (
                                  <div
                                    key={tutorId}
                                    onClick={() => {
                                      const tutorName = tutor?.name || 'Academic Tutor';
                                      const msg = `Hi ${tutorName}, I am reaching out regarding my matched assignment: "${linkedAssign?.title || 'Coursework'}". Let's coordinate!`;
                                      onOpenChat(tutorId, msg);
                                      setIsMobileChannelsOpen(false);
                                    }}
                                    className="p-3 rounded-xl cursor-pointer transition-all border border-orange-100 bg-orange-50/20 hover:bg-orange-50/60 flex items-start gap-3 relative group"
                                  >
                                    <div className="relative shrink-0">
                                      <ResponsiveAvatar
                                        src={tutor?.avatarUrl}
                                        alt=""
                                        sizePx={48}
                                        width={40}
                                        height={40}
                                        fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format&q=75"
                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-200"
                                      />
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <h4 className="text-xs font-bold text-slate-900 truncate">{tutor?.name || 'Assigned Tutor'}</h4>
                                          <span className="text-[9px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded border border-orange-200 shrink-0">
                                            Start Chat
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-orange-700 font-semibold truncate">
                                        Assigned for: {linkedAssign?.title || 'Academic Assignment'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}

                              {assignedTutorChats.length === 0 && pendingAssignedTutorIds.length === 0 && (
                                <div className="p-4 text-center text-[11px] text-slate-400 bg-slate-50 border border-dashed rounded-xl leading-relaxed">
                                  No automated tutor matches active yet. Submit an assignment request to be automatically paired with a certified scholar!
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}

                  </div>

                  {/* Footer: Security Status Badge */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Encrypted Workspace
                    </span>
                    <span className="text-emerald-700 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded text-[10px]">Secure</span>
                  </div>
                </aside>

                {/* CENTER CHAT DISPLAY WORKSPACE */}
                <main className="flex-1 min-w-0 min-h-0 bg-white flex flex-col shadow-xs overflow-hidden relative">
                  {selectedChat ? (
                    <>
                      {/* CHAT HEADER */}
                      <div className="px-3.5 sm:px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2 shrink-0 z-10 min-w-0">
                        {/* Active User Details */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <button 
                            type="button" 
                            onClick={() => setIsMobileChannelsOpen(true)}
                            className="md:hidden p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all cursor-pointer shrink-0"
                            title="Open Channels Directory"
                          >
                            <MessageSquare className="w-4 h-4 text-orange-600" />
                          </button>
                          <div className="relative shrink-0">
                            <ResponsiveAvatar
                              src={selectedChat.tutorId.startsWith('admin_')
                                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&auto=format&q=75'
                                : getTutor(selectedChat.tutorId)?.avatarUrl}
                              alt="Tutor"
                              sizePx={48}
                              width={44}
                              height={44}
                              fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format&q=75"
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-2 ring-slate-100"
                            />
                            <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">
                                {selectedChat.tutorId.startsWith('admin_') || selectedChat.tutorId === 'admin_emily'
                                  ? 'Official Support Desk (Emily Vance)'
                                  : (getTutor(selectedChat.tutorId)?.name || 'Academic Tutor')}
                              </h3>
                              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full shrink-0">
                                Active Now
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              Subject: {selectedChat.subject || 'Direct Consultation'}
                            </p>
                          </div>
                        </div>

                        {/* Right Quick Toolbar */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setIsQuoteDrawerOpen(!isQuoteDrawerOpen)} 
                            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <DollarSign className="w-4 h-4 text-orange-600 shrink-0" />
                            <span className="hidden sm:inline">Quote &amp; Files</span>
                            <span className="sm:hidden">Quote</span>
                          </button>

                          <div className="h-5 w-px bg-slate-200 mx-1 hidden md:block"></div>

                          <button type="button" className="hidden md:inline-flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Voice Call">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button type="button" className="hidden md:inline-flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Video Consultation">
                            <Video className="w-4 h-4" />
                          </button>
                          <button type="button" className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="More options">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ACADEMIC SAFETY SHIELD PINNED BANNER */}
                      {showSafetyBanner && (
                        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border-b border-amber-200/60 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900 shrink-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span>
                              <strong className="font-bold text-amber-950">Academic Safety Shield:</strong> All communications, instructions, and files are protected under strict platform security layers.
                            </span>
                          </div>
                          <button onClick={() => setShowSafetyBanner(false)} className="text-amber-700/60 hover:text-amber-900 p-1 rounded transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* MESSAGE STREAM CANVAS */}
                      <div
                        ref={chatScrollContainerRef}
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 bg-slate-50/40"
                      >
                        <div className="flex items-center justify-center my-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/70 border border-slate-300/40 px-3 py-0.5 rounded-full">
                            Academic Security System • Active Thread
                          </span>
                        </div>

                        <div className="max-w-xl mx-auto bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-3 shadow-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong className="font-bold text-amber-900">Connection established.</strong> Students can discuss assignment details or schedule 1-on-1 tutoring. All messages are encrypted.
                          </p>
                        </div>

                        {activeChatMessages.map((m) => {
                          const isSelf = m.senderId === currentUser.id;
                          const isSystem = m.senderId === 'system' || m.isSystem;
                          const senderObj = isSelf ? currentUser : getTutor(m.senderId);
                          const isStaffAdmin = !isSelf && (m.senderId?.startsWith('admin_') || m.senderId === 'admin_emily' || senderObj?.role === UserRole.ADMIN);
                          const senderRoleLabel = isStaffAdmin ? 'Admin' : 'Tutor';
                          const senderDisplayName = isSelf
                            ? 'You'
                            : (senderObj?.name || (isStaffAdmin ? 'Platform Support Desk' : 'Academic Tutor'));

                          if (isSystem) {
                            return (
                              <div key={m.id} className="flex justify-center my-2">
                                <span className="bg-amber-50/80 text-amber-900 border border-amber-200 px-4 py-2 rounded-2xl text-center text-xs font-semibold max-w-lg shadow-xs">
                                  {m.content}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={m.id}
                              className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`flex items-end gap-2 max-w-[78%] sm:max-w-[75%] ${
                                  isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                }`}
                              >
                                {!isSelf && (
                                  <ResponsiveAvatar
                                    src={senderObj?.avatarUrl}
                                    alt={senderDisplayName}
                                    sizePx={32}
                                    width={28}
                                    height={28}
                                    fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format&q=75"
                                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                                  />
                                )}

                                <div
                                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs break-words ${
                                    isSelf
                                      ? 'bg-[#F97316] text-white rounded-br-sm'
                                      : 'bg-[#F3F4F6] sm:bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                                  }`}
                                >
                                  {!isSelf && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[11px] font-bold text-orange-600 truncate">
                                        {senderDisplayName}
                                      </span>
                                      <span className="text-[9px] font-bold uppercase text-slate-500">
                                        • {senderRoleLabel}
                                      </span>
                                    </div>
                                  )}

                                  <p className="whitespace-pre-wrap leading-relaxed text-left">{m.content}</p>

                                  {m.fileUrl && (
                                    <div
                                      className={`mt-2 p-2 rounded-xl border flex items-center justify-between text-xs ${
                                        isSelf
                                          ? 'bg-white/15 border-white/25 text-white'
                                          : 'bg-white border-slate-200 text-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <FileText className={`w-4 h-4 shrink-0 ${isSelf ? 'text-white' : 'text-orange-500'}`} />
                                        <span className="truncate font-mono">{m.fileName || 'Attachment'}</span>
                                      </div>
                                      <a
                                        href={m.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`hover:underline font-bold shrink-0 ml-2 ${
                                          isSelf ? 'text-white' : 'text-orange-600'
                                        }`}
                                      >
                                        Download
                                      </a>
                                    </div>
                                  )}

                                  <div
                                    className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${
                                      isSelf ? 'justify-end text-orange-100' : 'justify-start text-slate-400'
                                    }`}
                                  >
                                    <span>
                                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isSelf && (
                                      <CheckCheck
                                        className={`w-3.5 h-3.5 shrink-0 ${m.read ? 'text-white' : 'text-orange-100/80'}`}
                                        aria-label={m.read ? 'Read' : 'Sent'}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {/* QUICK PROMPT SUGGESTION CHIPS */}
                      <div className="px-3 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Actions:</span>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('Can we review the assignment requirements?')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                        >
                          📋 Request assignment review
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('Please send over a formal price quote for this task.')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                        >
                          💰 Request formal quote
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('When are you available for a 1-on-1 tutoring session?')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                        >
                          📅 Schedule 1-on-1 session
                        </button>
                      </div>

                      {/* CHAT INPUT COMPONENT */}
                      <div className="p-2.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 z-20 shadow-xs w-full">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!studentReply.trim() && !chatAttachedFileName) return;
                            if (onSendMessage) {
                              onSendMessage(
                                selectedChat.id, 
                                currentUser.id, 
                                studentReply.trim(),
                                chatAttachedFileName ? `https://example.com/uploads/${chatAttachedFileName}` : undefined,
                                chatAttachedFileName || undefined
                              );
                            }
                            setStudentReply('');
                            setChatAttachedFileName('');
                          }} 
                          className="flex items-center gap-2 w-full min-w-0"
                        >
                          <label
                            className="p-2 text-slate-500 hover:text-orange-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                            title="Attach file or coursework document"
                            aria-label="Attach file"
                          >
                            <Paperclip className="w-4 h-4" />
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setChatAttachedFileName(e.target.files[0].name);
                                }
                              }} 
                            />
                          </label>

                          <div className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                            {chatAttachedFileName && (
                              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-mono font-bold truncate max-w-[100px] flex items-center gap-1 shrink-0">
                                <span className="truncate">{chatAttachedFileName}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setChatAttachedFileName('')}
                                  className="text-orange-600 hover:text-red-600 font-bold ml-0.5 cursor-pointer shrink-0"
                                  title="Remove attachment"
                                >
                                  ×
                                </button>
                              </span>
                            )}

                            <input 
                              type="text" 
                              value={studentReply}
                              onChange={(e) => setStudentReply(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  const form = (e.target as HTMLElement).closest('form');
                                  if (form) form.requestSubmit();
                                }
                              }}
                              placeholder="Type your message..." 
                              className="flex-1 min-w-0 w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none py-1"
                            />

                            <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors hidden sm:block shrink-0" title="Emoji">
                              <Smile className="w-4 h-4" />
                            </button>
                          </div>

                          <button 
                            type="submit" 
                            disabled={!studentReply.trim() && !chatAttachedFileName}
                            className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shrink-0 ${
                              (!studentReply.trim() && !chatAttachedFileName)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                                : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orange-500/20'
                            }`}
                            title="Send Message"
                            aria-label="Send message"
                          >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold text-xs">Send</span>
                          </button>
                        </form>
                      </div>

                      {/* SLIDE-OVER TUTOR QUOTE & DETAILS PANEL */}
                      <div className={`absolute top-0 right-0 h-full w-80 md:w-96 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${
                        isQuoteDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                      }`}>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Tutor Quote & Details</h3>
                          </div>
                          <button onClick={() => setIsQuoteDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {/* Active Assignment Summary */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Order</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedChat.subject || 'Direct Tutoring Consultation'}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Status: <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Active Discussion</span>
                            </p>
                          </div>

                          {/* Pending Quote Card */}
                          {(() => {
                            const pendingQuote = quotes.find(q => q.chatId === selectedChat.id && q.status === 'pending');
                            if (pendingQuote) {
                              return (
                                <div className="border border-orange-200 bg-orange-50/40 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Binding Price Quote</span>
                                    <span className="text-lg font-black text-orange-600">${pendingQuote.amount}.00</span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {pendingQuote.scopeOfWork || `Includes ${pendingQuote.estimatedHours} hours 1-on-1 coaching & step-by-step guidance.`}
                                  </p>
                                  {onAcceptQuote && (
                                    <button 
                                      onClick={() => {
                                        onAcceptQuote(pendingQuote.id);
                                        setIsQuoteDrawerOpen(false);
                                      }} 
                                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                                    >
                                      Accept & Proceed to Escrow
                                    </button>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-center text-xs text-slate-500 space-y-1">
                                <p className="font-bold text-slate-700">No Pending Quotes</p>
                                <p className="text-[11px]">Request a price quote from the tutor using the quick action chip below.</p>
                              </div>
                            );
                          })()}

                          {/* Shared Files Vault */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                              <span>Shared Attachments</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {activeChatMessages.filter(m => m.fileUrl).length} files
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {activeChatMessages.filter(m => m.fileUrl).map((m) => (
                                <div key={m.id} className="p-2.5 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                                    <div className="truncate">
                                      <p className="text-xs font-semibold text-slate-800 truncate">{m.fileName || 'Attachment'}</p>
                                      <p className="text-[10px] text-slate-400">{new Date(m.timestamp).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-700">
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ))}
                              {activeChatMessages.filter(m => m.fileUrl).length === 0 && (
                                <p className="text-xs text-slate-400 italic">No files attached in this chat yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-500 mb-3.5 shadow-xs">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm md:text-base">Select a Discussion Channel</h5>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                        Access your official 24/7 administrative support desk or chat with your automatically assigned academic tutor.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const support = studentChats.find(c => c.tutorId === 'admin_emily' || c.tutorId.startsWith('admin_'));
                            if (support) {
                              setLocalSelectedChatId(support.id);
                            } else {
                              onOpenChat('admin_shaka');
                            }
                          }}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Headset className="w-4 h-4" />
                          <span>Chat with Support</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMobileChannelsOpen(true)}
                          className="md:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4 text-orange-600" />
                          <span>View Channels</span>
                        </button>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </div>
          )}

          {/* ================================== */}
          {/* TAB 7: REPORTS / GPA PROJECTIONS   */}
          {/* ================================== */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 text-left shadow-xs animate-fade-in">
              <div>
                <h3 className="font-bold text-base text-gray-950">Grades Diagnostic & Coursework Track</h3>
                <p className="text-xs text-gray-400 mt-0.5">Visualize your completion statistics, GPA estimates, and milestones reached.</p>
              </div>

              {/* Graphic chart mockup using layout vectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-200 block uppercase">Projected term GPA</span>
                  <span className="text-4xl font-black block mt-2 font-mono">3.87</span>
                  <p className="text-xs text-indigo-100 mt-2">Outstanding. Core essay formats matched with high rubrics compliance.</p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-orange-500 block uppercase">Integrity Check Passes</span>
                  <span className="text-4xl font-extrabold text-gray-900 block mt-2 font-mono">100%</span>
                  <p className="text-xs text-gray-400 mt-2">Zero AI flags. Turnitin and Copyscape verification badges generated for all tasks.</p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-500 block uppercase">Hour Saved Estimate</span>
                  <span className="text-4xl font-extrabold text-gray-900 block mt-2 font-mono">75 hr</span>
                  <p className="text-xs text-gray-400 mt-2">Frees up time for focused professional training and revision preparation.</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wide text-gray-700">Detailed Subject Metrics</h4>
                {[
                  { name: 'Biology & Natural Sciences', score: 95 },
                  { name: 'Calculus Trigonometric Subdivisions', score: 88 },
                  { name: 'University Essay Outlines', score: 91 }
                ].map((item, key) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="font-bold text-gray-650">{item.score}% Confidence</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#FF8A00] h-2 rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tutor Reports Section */}
              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wide text-gray-700">Official Tutor Academic Reports</h4>
                
                {assignmentReports.filter(r => r.studentId === currentUser.id && r.status === 'sent_to_student').length > 0 ? (
                  <div className="space-y-4">
                    {assignmentReports
                      .filter(r => r.studentId === currentUser.id && r.status === 'sent_to_student')
                      .map((rep) => (
                        <div key={rep.id} className="p-4 border rounded-xl bg-orange-50/10 space-y-2" id={`student-report-${rep.id}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] bg-orange-100 text-orange-850 font-bold px-2 py-0.5 rounded-md uppercase">
                                Verified Evaluation
                              </span>
                              <h5 className="font-bold text-xs text-gray-900 mt-1">{rep.assignmentTitle}</h5>
                              <p className="text-[10px] text-gray-400">Instructed by: <span className="font-medium text-gray-600">{rep.tutorName}</span></p>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{new Date(rep.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="p-3 bg-white rounded-lg border text-xs leading-relaxed text-gray-750">
                            <strong>Feedback & Breakdown:</strong>
                            <p className="mt-1 font-sans italic text-gray-600">"{rep.reportNotes}"</p>
                          </div>

                          {rep.attachmentUrl && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-600">
                              📎 Supplement: <a href={`https://example.com/downloads/${rep.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-orange-700">{rep.attachmentUrl}</a>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400">
                    <p className="text-xs">No formal academic course reports assigned yet. Any structured evaluations dispatched by your course mentor will appear here.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 8: RESULTS & COMMENTS FEEDBACK  */}
          {/* ==================================== */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 text-left shadow-xs animate-fade-in">
              <div>
                <h3 className="font-bold text-base text-gray-950">Scientific Comments & Milestones</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Historical rubrics compliance feedback logs and scholar remarks database.</p>
              </div>

              <div className="divide-y divide-gray-100">
                {[
                  { title: 'Trigonometry Assignment Scope', tutor: 'Liam Kennedy, M.Sc.', comment: 'High analytical precision, all trigonometric formulas demonstrated in step-by-step formatting template perfectly.', rating: 5, date: '1 week ago' },
                  { title: 'Comparative Literature Thesis Brief', tutor: 'Dr. Clara Stirling', comment: 'MLA referencing is extremely correct. Solid thesis argument structures and outline summaries.', rating: 5, date: '3 weeks ago' }
                ].map((review, idx) => (
                  <div key={idx} className="py-5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-gray-900">{review.title}</h4>
                      <span className="text-xs text-gray-400 font-mono">{review.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[11px] text-gray-500 font-medium">Instructor: <strong>{review.tutor}</strong></span>
                      <span className="text-amber-500 font-bold">{'★'.repeat(review.rating)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================== */}
          {/* TAB 9: NOTIFICATIONS LOGS  */}
          {/* ========================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 text-left shadow-xs animate-fade-in">
              <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span>Notifications Center</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Live assignment updates, tutor matches, escrow confirmations, and direct messages.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  {unreadNotifCount > 0 && (
                    <span className="bg-orange-100 text-orange-700 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {unreadNotifCount} UNREAD
                    </span>
                  )}
                  {userNotifications.length > 0 && unreadNotifCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkAllNotificationsRead?.(currentUser.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {paginatedNotifications.length > 0 ? (
                  <>
                  {paginatedNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        if (!notif.read && onMarkNotificationRead) {
                          onMarkNotificationRead(notif.id);
                        }
                      }}
                      className={`p-4 rounded-2xl flex items-start gap-3.5 text-xs transition-all cursor-pointer border ${
                        !notif.read 
                          ? 'bg-orange-50/40 border-orange-200/80 shadow-3xs' 
                          : 'bg-gray-50/60 border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 font-mono text-[9px] uppercase font-bold ${
                        !notif.read ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {notif.type || 'webapp'}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold ${!notif.read ? 'text-gray-950 font-bold' : 'text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-gray-500 text-[11.5px] leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[10px] text-gray-400 font-mono">
                          <span>{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>Sent by: {notif.sentBy || 'System'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <PaginationBar
                    page={safeNotifsPage}
                    totalPages={totalNotifsPages}
                    totalItems={userNotifications.length}
                    pageSize={NOTIFS_PAGE_SIZE}
                    onPageChange={setNotificationsPage}
                    itemLabel="notifications"
                  />
                  </>
                ) : (
                  <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                    <h4 className="text-xs font-bold text-gray-700">No Notifications Yet</h4>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                      All notifications about tutor assignments, new chat messages, and payment releases will appear in real time here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================== */}
          {/* TAB 10: USER TESTIMONIAL   */}
          {/* ========================== */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 text-left max-w-xl mx-auto shadow-xs animate-fade-in">
              <div className="border-b pb-3.5">
                <h3 className="font-bold text-base text-gray-950">Platform Feedback & Testimonials</h3>
                <p className="text-xs text-gray-400 mt-0.5">Is our platform matching helpful? Let us know what formatting options or features would improve your study.</p>
              </div>

              {feedbackSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-4 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Testimonial saved gracefully! Thank you for backing our scholar platform developers.</span>
                </div>
              ) : (
                <form onSubmit={submitPlatformFeedback} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Feedback Target Component</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full bg-gray-50 border py-2 px-3 rounded-xl text-xs outline-none"
                    >
                      <option>Tutor Communication Rate</option>
                      <option>Double-Spacing Citation Compliance</option>
                      <option>Escrow Payment Operations</option>
                      <option>System Resolution Desk</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Star Assessment Rating:</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                          type="button"
                          key={s} 
                          onClick={() => setFeedbackRating(s)}
                          className="text-xl"
                        >
                          <Star className={`w-5 h-5 ${feedbackRating >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1 font-sans">Critique Detail Statement *</label>
                    <textarea 
                      required
                      rows={3}
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      placeholder="Comment on match speed, formatting double-spacing quality, or mobile platform loading..."
                      className="w-full bg-gray-50 border py-2 px-3 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF8A00] text-white p-2.5 rounded-xl text-xs font-bold shadow-md uppercase cursor-pointer"
                  >
                    Save Platform Critique
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================== */}
          {/* TAB 11: SERVICE AGREEMENTS     */}
          {/* ============================== */}
          {activeTab === 'agreements' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-4 text-left max-w-4xl mx-auto shadow-xs animate-fade-in font-sans">
              <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#E05216]" />
                <span>Service Agreements & Guarantees</span>
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                By initiating candidate matching and lock escrow payments, the student agrees to our structural rules concerning intellectual academic integrity. Tutors certify custom scientific reference preparation matching the exact sources parameters indicated. Any copying, reproduction, or non-cited distribution is strictly forbidden.
              </p>
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-[11.5px] text-[#E05216]">
                📚 <strong>Quality Guarantee:</strong> Free revisions logged within 14 days of deliverables release. Escrow payments held until approved.
              </div>
            </div>
          )}

          {/* ============================== */}
          {/* TAB 12: SOPS POLICY PAGE       */}
          {/* ============================== */}
          {activeTab === 'sops' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-4 text-left max-w-4xl mx-auto shadow-xs animate-fade-in font-sans">
              <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Standard Operating Procedures (SOPs)</span>
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Ensuring continuous compliance with global educational guidelines is paramount inside UNIVERSITY TUTORS:
              </p>
              <ol className="list-decimal pl-5 text-xs text-gray-650 space-y-3 font-medium">
                <li><strong>Submitting Briefs:</strong> Provide syllabus parameters, Double-spacing limits, citation format parameters, and PDF textbooks directly in the dragzone upload pane.</li>
                <li><strong>Securing Funds:</strong> Upon candidate matching acceptance, lock corresponding fees inside our secure Stripe escrow system so instructors deploy scientific labor safely.</li>
                <li><strong>Delivering Samples:</strong> Mentors draft scientific reference solutions and check integrity indices via Turnitin algorithms.</li>
                <li><strong>Releasing Payments:</strong> Verify solutions inside Assignments table. Click 'Accept & Pay' to release.</li>
              </ol>
            </div>
          )}

          {/* ============================== */}
          {/* TAB 13: TERMS & CONDITIONS     */}
          {/* ============================== */}
          {activeTab === 'terms' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-4 text-left max-w-4xl mx-auto shadow-xs animate-fade-in font-sans">
              <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                <span>Terms & Conditions Agreement</span>
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This platform is designed to provide reference, feedback guidance, and custom educational support solutions to scholars. It does not replace independent study and research guidelines. Unauthorized plagiarism, cheating, or university code breaches will result in automatic student credentials deactivation lock under administrative discretion.
              </p>
            </div>
          )}

          {/* ============================== */}
          {/* TAB 14: REFUND POLICY          */}
          {/* ============================== */}
          {activeTab === 'refund' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-4 text-left max-w-4xl mx-auto shadow-xs animate-fade-in font-sans">
              <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <span>Escrow Refund Policy parameters</span>
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Refunds concern unreleased Escrow funds only. If a designated tutor lags beyond the strict due deadline or drafts deliverables with grading rubrics discrepancies matching &lt;90%, the student resolves this instantly via System Resolution support ticket. Safe refund triggers process to student credit cards within 5 business days upon administrative verification.
              </p>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 15: SECURITY PREFERENCES SETTINGS*/}
          {/* ==================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 space-y-6 shadow-xs max-w-3xl mx-auto text-left animate-fade-in" id="student-settings-block">
              <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight border-b pb-3">Student Profile &amp; Preferences</h3>
              
              {/* Profile & Avatar Management Card */}
              <div className="p-5 bg-gradient-to-r from-orange-50/60 via-amber-50/30 to-orange-50/60 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <ResponsiveAvatar
                      src={currentUser.avatarUrl}
                      alt=""
                      sizePx={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-300 shadow-sm bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAvatarEditorOpen(true)}
                      className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                      title="Change photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{currentUser.name}</h4>
                    <span className="text-xs text-gray-500 font-mono block">{currentUser.email}</span>
                    <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-700 font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Student Account • Active
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvatarEditorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  id="settings-edit-avatar-btn"
                >
                  <Camera className="w-4 h-4" />
                  <span>Change Profile Photo</span>
                </button>
              </div>

              <div className="space-y-4 text-left text-gray-800">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Interactive Email Notifications</span>
                    <span className="text-[10.5px] text-gray-500 leading-tight">Trigger emails when specialist tutors offer quotes or submit final PDF files.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailPref}
                    onChange={(e) => setEmailPref(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                  <div>
                    <span className="font-bold text-xs text-red-950 block font-sans">Deactivate Platform Credentials</span>
                    <span className="text-[10.5px] text-red-700 leading-tight font-sans">Completely scrub local reference files and credentials. This action cannot be reversed.</span>
                  </div>
                  {isConfirmingScrub ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingScrub(false)}
                        className="bg-white border border-slate-200 text-slate-700 font-bold text-[10px] px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Confirm Scrub
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingScrub(true)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-center font-sans tracking-wide shrink-0"
                    >
                      Scrub Storage
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          </>
          )}
          </ErrorBoundary>
        </div>

        {/* ==================== MOBILE FLOATING CHAT BUTTONS (ABOVE BOTTOM NAV) ==================== */}
        {showFloatingMobileWidgets && (
          <div className="lg:hidden fixed bottom-20 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-30">
            <button
              type="button"
              onClick={() => onOpenWhatsApp?.()}
              aria-label="WhatsApp Instant Chat"
              className="compact-pill-btn pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#067D46] hover:bg-[#05683A] text-white font-bold text-[10px] tracking-wide shadow-md shadow-emerald-900/20 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.758.459 3.473 1.331 4.986L2 22l5.188-1.361a9.934 9.934 0 0 0 4.843 1.258h.004c5.515 0 9.968-4.453 9.968-9.969 0-2.663-1.037-5.166-2.92-7.049A9.903 9.903 0 0 0 12.031 2zm5.818 14.273c-.246.693-1.432 1.325-1.992 1.409-.511.076-1.158.108-1.869-.118-.431-.137-.984-.32-1.693-.626-2.98-1.287-4.926-4.287-5.075-4.485-.148-.198-1.212-1.612-1.212-3.075 0-1.463.767-2.182 1.039-2.48.273-.297.595-.372.793-.372.198 0 .397.002.57.01.183.009.428-.069.669.511.248.595.842 2.058.916 2.207.074.149.124.322.025.52-.099.198-.149.322-.297.496-.149.173-.313.387-.446.52-.149.148-.304.309-.13.606.173.297.77 1.27 1.653 2.057 1.136 1.013 2.094 1.327 2.391 1.476.297.148.471.124.644-.074.174-.198.743-.867.942-1.165.198-.297.396-.248.669-.149.272.099 1.734.818 2.031.967.297.148.495.223.569.347.075.124.075.718-.171 1.411z" />
              </svg>
              <span>INSTANT CHAT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('chat');
                onOpenChat('admin_shaka');
              }}
              aria-label="In-System Chat"
              className="pointer-events-auto w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF7A00] to-[#FF9900] hover:from-[#E86E00] hover:to-[#FF8A00] text-white shadow-lg shadow-orange-500/35 flex items-center justify-center active:scale-95 transition cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ==================== MOBILE FIXED BOTTOM NAVIGATION BAR ==================== */}
        {showFloatingMobileWidgets && (
          <nav
            aria-label="Bottom Navigation"
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-2 grid grid-cols-5 items-center z-30"
          >
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`compact-pill-btn flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-pointer transition-colors ${
                activeTab === 'dashboard' ? 'text-[#FF7A00]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className={`text-[10px] ${activeTab === 'dashboard' ? 'font-bold' : 'font-medium'}`}>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={`compact-pill-btn flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-pointer transition-colors ${
                activeTab === 'assignments' ? 'text-[#FF7A00]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className={`text-[10px] ${activeTab === 'assignments' ? 'font-bold' : 'font-medium'}`}>Assignments</span>
            </button>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsQuickRequestModalOpen(true)}
                aria-label="Create Request"
                className="-mt-7 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FF9900] text-white shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-90 transition cursor-pointer"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`compact-pill-btn flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-pointer transition-colors ${
                activeTab === 'chat' ? 'text-[#FF7A00]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className={`text-[10px] ${activeTab === 'chat' ? 'font-bold' : 'font-medium'}`}>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`compact-pill-btn flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-pointer transition-colors ${
                activeTab === 'payments' ? 'text-[#FF7A00]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className={`text-[10px] ${activeTab === 'payments' ? 'font-bold' : 'font-medium'}`}>Payments</span>
            </button>
          </nav>
        )}

        {/* ======================================================== */}
        {/* DESKTOP FLOATING DIRECT LIVE CHAT ASSISTANCE WIDGET      */}
        {/* ======================================================== */}
        {showFloatingMobileWidgets && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('chat');
              onOpenChat('admin_shaka');
            }}
            className="hidden lg:flex fixed bottom-6 right-6 bg-[#FF8A00] hover:bg-[#E05216] text-white p-4 rounded-full shadow-2xl z-40 transition-all cursor-pointer items-center justify-center gap-2 font-bold font-sans tracking-wide text-xs group"
            id="floating-live-chat"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 ease-out whitespace-nowrap">
              Live Chat
            </span>
          </button>
        )}

      </main>

      {/* ==================== CREATE REQUEST BOTTOM SHEET MODAL ==================== */}
      {isQuickRequestModalOpen && (
        <div
          id="requestModal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQuickRequestModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in text-left"
        >
          <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-slide-up">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create a Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose a service category and enter your course details to start a tutor chat.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickRequestModalOpen(false)}
                aria-label="Close modal"
                className="compact-pill-btn p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="newRequestForm" onSubmit={handleQuickRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Service Category
                </label>
                <div
                  id="reqTypeGrid"
                  role="radiogroup"
                  aria-label="Service Category"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                >
                  {QUICK_REQUEST_SERVICES.map((service) => {
                    const isSelected = quickReqType === service.value;
                    const IconComp = service.icon;
                    return (
                      <button
                        key={service.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setQuickReqType(service.value)}
                        className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? 'border-2 border-[#FF7A00] bg-orange-50/50 shadow-xs'
                            : 'border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/20'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 border border-orange-100/80">
                          <IconComp className="w-5 h-5 text-[#EA580C]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {service.label}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug truncate mt-0.5">
                            {service.description}
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#FF7A00] text-white'
                              : 'border border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.75]" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label htmlFor="reqSubject" className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignment / Course Title
                  </label>
                  <input
                    type="text"
                    id="reqSubject"
                    required
                    value={quickReqTitle}
                    onChange={(e) => setQuickReqTitle(e.target.value)}
                    placeholder="e.g., CS301 Data Structures Midterm"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label htmlFor="reqAcademicSubject" className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="reqAcademicSubject"
                    value={quickReqSubject}
                    onChange={(e) => setQuickReqSubject(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#FF7A00]"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Economics">Economics</option>
                    <option value="Business">Business</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Literature">Literature</option>
                    <option value="Engineering">Engineering</option>
                    <option value="General Academic Tutoring">Other Subject</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reqDate" className="block text-xs font-semibold text-slate-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="reqDate"
                    required
                    value={quickReqDeadline}
                    onChange={(e) => setQuickReqDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reqNotes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Instructions (Optional)
                </label>
                <textarea
                  id="reqNotes"
                  rows={2}
                  value={quickReqNotes}
                  onChange={(e) => setQuickReqNotes(e.target.value)}
                  placeholder="Any key rubric notes, citation style, or topics to focus on..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-3.5 space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Deliverables (Optional)</h4>
                  <p className="text-[11px] text-slate-500">Select any additional services you require.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {QUICK_REQUEST_DELIVERABLES.map((item) => {
                    const isChecked = quickReqDeliverables.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() =>
                          setQuickReqDeliverables((prev) =>
                            prev.includes(item.label)
                              ? prev.filter((x) => x !== item.label)
                              : [...prev, item.label]
                          )
                        }
                        className={`text-left flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-orange-50/80 border border-orange-300'
                            : 'bg-white border border-slate-200/80 hover:border-orange-300'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#F97316] border-2 border-[#F97316] text-white'
                              : 'bg-white border-2 border-[#F97316]'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-900 leading-snug">{item.label}</div>
                          <div className="text-[10px] text-slate-500 leading-snug">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingQuickReq}
                className="w-full py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E86E00] disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-orange-500/20 active:scale-98 transition cursor-pointer"
              >
                {isSubmittingQuickReq ? 'Submitting Request...' : 'Submit Request'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickRequestModalOpen(false);
                  setActiveTab('new_request');
                }}
                className="compact-inline-link w-full text-center text-xs font-semibold text-[#FF7A00] hover:underline pt-1 cursor-pointer"
              >
                Need to upload syllabus files or set word count? Open Full Guide →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTION TOAST NOTIFICATION */}
      {actionToast && (
        <div
          id="toast"
          className="fixed bottom-28 lg:bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none z-50 whitespace-nowrap animate-fade-in"
        >
          {actionToast}
        </div>
      )}

      {/* RATING & REVIEWS APPROVAL POPUP WIDGET */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-51">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 p-6 space-y-5 text-left shadow-2xl" id="student-reviews-approval-dialog">
            <h4 className="font-sans font-bold text-base text-gray-950">Approve Completed Work & Rate Tutor</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Approving confirms successful delivery of the task. Please share your rating and feedback for the tutor.</p>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Choose Rating (Stars):</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star className={`w-6 h-6 ${reviewRating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1 font-sans">Feedback Statement:</label>
              <textarea
                rows={3}
                placeholder="Describe instructor's presentation, timeline, or helpful formatting hints..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-1.5 px-3 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowReviewModal(null)}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveSubmit(showReviewModal)}
                className="px-5 py-1.5 bg-orange-500 hover:bg-orange-650 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Approve Delivery & Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION REQUEST DETAILS POPUP */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-51">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-gray-150 p-6 space-y-4 text-left shadow-2xl" id="student-revisions-dialog">
            <h4 className="font-sans font-bold text-base text-gray-900">Request FREE Academic Revision</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Describe precisely what requirements, layout formats, references or essay elements require adjustment.</p>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Explain specific changes needed *</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Cite Shelly in MLA style on page 4 instead of APA, and double spacing prose..."
                value={revisionDetails}
                onChange={(e) => setRevisionDetails(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setShowRevisionModal(null)}
                className="px-4 py-1.5 bg-gray-50 border hover:bg-gray-100 rounded-lg text-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => handleRevisionSubmit(showRevisionModal)}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer text-xs"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PICTURE EDITOR MODAL */}
      {isAvatarEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="student-avatar-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-150 p-6 md:p-8 space-y-6 text-left shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsAvatarEditorOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-gray-950 font-sans tracking-tight">Edit Profile Picture</h3>
              <p className="text-xs text-gray-400 mt-1">Upload a custom photo or choose from verified scholar avatar presets.</p>
            </div>

            {avatarSuccessAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Profile photo updated and saved successfully!</span>
              </div>
            )}

            {/* Current Active Preview */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="relative">
                <ResponsiveAvatar
                  src={customAvatarPreview}
                  alt="Avatar preview"
                  sizePx={112}
                  loading="eager"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100 shadow-md bg-orange-50"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <span className="text-xs font-semibold text-gray-600 font-sans">{currentUser.name}</span>
            </div>

            {/* Upload Custom Photo Button */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 font-mono">
                Upload Custom Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-orange-300 bg-gray-50/80 hover:bg-orange-50/30 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span>Choose Image File...</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarFileSelected}
                    className="hidden" 
                    id="avatar-custom-file-input"
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-sans">Supports PNG, JPG, WebP. Automatically center-cropped &amp; optimized.</p>
            </div>

            {/* Preset Avatars Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 font-mono">
                Or Select Scholar Preset
              </label>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomAvatarPreview(url)}
                    className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                      customAvatarPreview === url 
                        ? 'border-orange-500 scale-105 shadow-sm' 
                        : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <ResponsiveAvatar
                      src={url}
                      alt={`Preset ${idx + 1}`}
                      sizePx={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {customAvatarPreview === url && (
                      <div className="absolute inset-0 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-orange-600 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAvatarEditorOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSavingAvatar}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                id="save-avatar-btn"
              >
                {isSavingAvatar ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
