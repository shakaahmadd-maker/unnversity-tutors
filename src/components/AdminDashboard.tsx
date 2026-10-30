import React, { useState, useRef, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Settings, 
  HelpCircle, 
  BookOpen, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  TrendingDown,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  MessageSquare,
  Edit3,
  Send,
  X,
  FileText,
  Mail,
  Search,
  Eye,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Paperclip,
  GraduationCap
} from 'lucide-react';
import { 
  User, Blog, FAQ, Assignment, Payment, SupportTicket, UserRole, Chat, Message,
  Invoice, ActivityLog, AppNotification, SOP, AssignmentReport, Agreement, AssignmentStatus, TriggeredEmail
} from '../types';
import { audioNotifier } from '../utils/audioNotification';
import TutorsListAdmin from './TutorsListAdmin';
import StudentProfilesAdmin from './StudentProfilesAdmin';
import { store } from '../lib/store';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  blogs: Blog[];
  faqs: FAQ[];
  assignments: Assignment[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  chats: Chat[];
  messages: Message[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  appNotifications: AppNotification[];
  sops: SOP[];
  assignmentReports: AssignmentReport[];
  agreements: Agreement[];
  emails?: TriggeredEmail[];
  onToggleUserStatus: (userId: string) => void;
  onChangeUserRole: (userId: string, targetRole: UserRole) => void;
  onAddBlog: (b: Omit<Blog, 'id' | 'publishedAt'>) => void;
  onDeleteBlog: (blogId: string) => void;
  onUpdateBlog?: (blogId: string, title: string, content: string, image: string, category: string, tags: string[]) => void;
  onSyncDefaultBlogs?: () => Promise<boolean>;
  onAddFaq: (f: Omit<FAQ, 'id'>) => void;
  onDeleteFaq: (faqId: string) => void;
  onResolveDispute: (paymentId: string, action: 'release' | 'refund') => void;
  onAddSubjectTopic?: (topic: string) => void;
  onGenerateProfile?: (name: string, email: string, role: UserRole, extra?: any) => Promise<boolean>;
  onDeleteUser: (userId: string) => void;
  onUpdateUserProfile: (userId: string, updatedData: Partial<User>) => void;
  onAddNewTutor?: (tutorData: any) => Promise<boolean>;
  onDeleteChat: (chatId: string) => void;
  onSelectChat: (chat: Chat) => void;
  onSendMessage: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => void;
  onSubscribeToChatDetails?: (chatId: string) => void;
  onGetOrCreateChat?: (studentId: string, tutorId: string, subject?: string) => Chat;

  onAssignTutor: (assignmentId: string, tutorId: string) => Promise<boolean>;
  onSetAssignmentPrice: (assignmentId: string, price: number) => Promise<boolean>;
  onSettleInvoice: (invoiceId: string, status: Invoice['status']) => Promise<boolean>;
  onCreateInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => Promise<string>;
  onSendNotification: (title: string, message: string, targetUserId: string, type: 'email' | 'webapp' | 'both') => Promise<boolean>;
  onSendMissingPaymentNotification: (invoiceId: string) => Promise<boolean>;
  onUpdateAssignmentReportStatus: (reportId: string, status: AssignmentReport['status'], feedback?: string) => Promise<boolean>;
  onCreateAgreement: (agreementData: Omit<Agreement, 'id' | 'status' | 'sentAt'>) => Promise<string>;
  onSendTriggerEmail?: (recipientEmail: string, subject: string, htmlBody: string, textBody?: string) => Promise<boolean>;
  onSeedMockStudentData?: () => Promise<{ success: boolean; error?: string }>;
  connectionStatus?: 'connected' | 'offline' | 'error' | 'syncing';
  lastSyncTime?: string | null;
  syncError?: string | null;
}

export default function AdminDashboard({
  currentUser,
  users,
  blogs,
  faqs,
  assignments,
  payments,
  supportTickets,
  chats,
  messages,
  invoices = [],
  activityLogs = [],
  appNotifications = [],
  sops = [],
  assignmentReports = [],
  agreements = [],
  emails = [],
  onToggleUserStatus,
  onChangeUserRole,
  onAddBlog,
  onDeleteBlog,
  onUpdateBlog,
  onSyncDefaultBlogs,
  onAddFaq,
  onDeleteFaq,
  onResolveDispute,
  onAddSubjectTopic,
  onGenerateProfile,
  onDeleteUser,
  onUpdateUserProfile,
  onAddNewTutor,
  onDeleteChat,
  onSelectChat,
  onSendMessage,
  onSubscribeToChatDetails,
  onGetOrCreateChat,

  onAssignTutor,
  onSetAssignmentPrice,
  onSettleInvoice,
  onCreateInvoice,
  onSendNotification,
  onSendMissingPaymentNotification,
  onUpdateAssignmentReportStatus,
  onCreateAgreement,
  onSendTriggerEmail,
  onSeedMockStudentData,
  connectionStatus = 'syncing',
  lastSyncTime = null,
  syncError = null
}: AdminDashboardProps) {

  const isSuperiorAdmin = currentUser.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';

  // DIAGNOSTICS & SYNC STATUS STATES
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [unsyncedUsers, setUnsyncedUsers] = useState<User[]>([]);
  const [isAuditingUsers, setIsAuditingUsers] = useState(false);
  const [isSeedingMock, setIsSeedingMock] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const [forceMerged, setForceMerged] = useState(false);

  // Chat Connection Test States
  const [testingChatConnectionId, setTestingChatConnectionId] = useState<string | null>(null);
  const [chatConnectionResult, setChatConnectionResult] = useState<{
    chatId: string;
    active: boolean;
    messagesCount: number;
    lastMessages: Message[];
    error?: string;
  } | null>(null);

  const runUsersSyncAudit = async () => {
    setIsAuditingUsers(true);
    setAuditError(null);
    try {
      console.log("[DIAGNOSTICS] Beginning PostgreSQL users cross-reference audit...");
      const res = await fetch('/api/users');
      const data = await res.json();
      const fetchedUsers = (data.users || []) as User[];
      setDbUsers(fetchedUsers);
      
      // Cross-reference against our users prop (which represents storeState.users)
      const propUserIds = new Set(users.map(u => u.id));
      const propEmails = new Set(users.map(u => u.email.toLowerCase().trim()));
      
      const unsynced = fetchedUsers.filter(dbUser => {
        const idMatched = propUserIds.has(dbUser.id);
        const emailMatched = propEmails.has(dbUser.email.toLowerCase().trim());
        return !idMatched && !emailMatched;
      });
      
      setUnsyncedUsers(unsynced);
      setLastAuditTime(new Date().toLocaleTimeString());
      
      console.log(`[DIAGNOSTICS] Audit complete. Found ${fetchedUsers.length} total users in PostgreSQL. ${unsynced.length} are unsynced in the local store.`);
    } catch (err: any) {
      console.error("[DIAGNOSTICS] Audit failed:", err);
      setAuditError(err.message || String(err));
    } finally {
      setIsAuditingUsers(false);
    }
  };

  useEffect(() => {
    runUsersSyncAudit();
  }, [users]);

  const handleTestChatConnection = async (chatId: string) => {
    setTestingChatConnectionId(chatId);
    setChatConnectionResult(null);
    try {
      console.log(`[DIAGNOSTICS] Running live PostgreSQL messages test query for chat: ${chatId}`);
      
      const hasLocalMessages = messages.some(m => m.chatId === chatId);
      const res = await fetch(`/api/messages?chatId=${encodeURIComponent(chatId)}`);
      const data = await res.json();
      const chatMessages = (data.messages || []) as Message[];
      
      setChatConnectionResult({
        chatId,
        active: hasLocalMessages,
        messagesCount: chatMessages.length,
        lastMessages: chatMessages.slice(-5)
      });
    } catch (err: any) {
      console.error(`[DIAGNOSTICS] Connection test failed for chat ${chatId}:`, err);
      setChatConnectionResult({
        chatId,
        active: false,
        messagesCount: 0,
        lastMessages: [],
        error: err.message || String(err)
      });
    } finally {
      setTestingChatConnectionId(null);
    }
  };

  const [activeTab, setActiveTab] = useState<
    'student_profiles' | 'tutors_list' | 'users' | 'chats' | 'disputes' | 'faqs' | 'blogs' | 'subjects' |
    'assignments' | 'payments_ledger' | 'create_invoice' | 'activity_log' |
    'notifications' | 'feedback' | 'sops' | 'reports' | 'agreements' | 'trigger_emails'
  >('tutors_list');

  // Student directory deep-link selection
  const [adminStudentDirectorySearch, setAdminStudentDirectorySearch] = useState<string>('');
  const [adminStudentDirectoryId, setAdminStudentDirectoryId] = useState<string>('');

  // FORM & FILTER STATES FOR SUB-SYSTEMS
  // 1. Assignments
  const [customPriceState, setCustomPriceState] = useState<{[key: string]: string}>({});
  const [assignTutorState, setAssignTutorState] = useState<{[key: string]: string}>({});
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'revision'>('all');

  // Quick text dispatch state from assignment table row (send as Admin OR send as Tutor)
  const [quickTextAssignId, setQuickTextAssignId] = useState<string | null>(null);
  const [quickTextMessage, setQuickTextMessage] = useState<string>('');
  const [quickTextPersona, setQuickTextPersona] = useState<'admin' | 'tutor'>('tutor');
  const [quickTextSending, setQuickTextSending] = useState<boolean>(false);
  const [quickTextSuccess, setQuickTextSuccess] = useState<string | null>(null);

  // Advanced User detail state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);


  // Search & Filter state for the active platform users list
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'student' | 'tutor' | 'admin'>('all');
  const [expandedUserRowId, setExpandedUserRowId] = useState<string | null>(null);

  // 2. Payments Ledger
  const [invoiceTabFilter, setInvoiceTabFilter] = useState<'all' | 'due' | 'paid' | 'pending' | 'uninvoiced'>('all');
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);

  // 3. Create Invoice Form
  const [invStudentId, setInvStudentId] = useState('');
  const [invSubject, setInvSubject] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invDetails, setInvDetails] = useState('');
  const [invTotal, setInvTotal] = useState('');
  const [invAdvance, setInvAdvance] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invDispatchOption, setInvDispatchOption] = useState<'none' | 'email' | 'webapp' | 'both'>('both');

  // 4. Notifications Form
  const [notifTargetUserId, setNotifTargetUserId] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifChannel, setNotifChannel] = useState<'email' | 'webapp' | 'both'>('webapp');

  // 5. SOPs Form
  const [sopTitleInput, setSopTitleInput] = useState('');
  const [sopCategory, setSopCategory] = useState('Escrow dispute procedures');
  const [sopContentInput, setSopContentInput] = useState('');

  // 6. Reports Feedback Form
  const [adminReportFeedback, setAdminReportFeedback] = useState<{[key: string]: string}>({});

  // 7. Agreements Form
  const [agrStudentId, setAgrStudentId] = useState('');
  const [agrTitle, setAgrTitle] = useState('');
  const [agrTerms, setAgrTerms] = useState('');
  const [agrLimitDays, setAgrLimitDays] = useState('14');

  // EDIT USER TRIAL MODAL STATE
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRate, setEditRate] = useState(45);
  const [editSubjectList, setEditSubjectList] = useState('');
  const [editCountry, setEditCountry] = useState('US');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  const handleStartEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditBio(user.bio || '');
    setEditRate(user.hourlyRate || 35);
    setEditSubjectList(user.subjects ? user.subjects.join(', ') : '');
    setEditCountry(user.country || 'US');
    setEditAvatarUrl(user.avatarUrl || '');
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const subjectsArray = editSubjectList.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const updatedData: Partial<User> = {
      name: editName,
      email: editEmail,
      country: editCountry as any,
      avatarUrl: editAvatarUrl
    };

    if (editingUser.role === UserRole.TUTOR) {
      updatedData.bio = editBio;
      updatedData.hourlyRate = editRate;
      updatedData.subjects = subjectsArray;
    }

    onUpdateUserProfile(editingUser.id, updatedData);
    setEditingUser(null);
    setSelectedActionSuccess(`Profile details saved successfully for tutor ${editName}!`);
    setTimeout(() => {
      setSelectedActionSuccess(null);
    }, 4500);
  };

  // ACTIVE SUPPORT CHATS MANAGEMENT
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [adminAttachedFileName, setAdminAttachedFileName] = useState('');
  const [adminAttachedFileUrl, setAdminAttachedFileUrl] = useState('');
  const [replyAsTutor, setReplyAsTutor] = useState(true);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const activeChatMessages = messages.filter(m => m.chatId === selectedChatId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (selectedChatId && onSubscribeToChatDetails) {
      onSubscribeToChatDetails(selectedChatId);
    }
  }, [selectedChatId, onSubscribeToChatDetails]);

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!adminReply.trim() && !adminAttachedFileName) || !selectedChatId) return;
    const senderId = (replyAsTutor && selectedChat) ? selectedChat.tutorId : currentUser.id;
    onSendMessage(
      selectedChatId, 
      senderId, 
      adminReply.trim(),
      adminAttachedFileUrl || undefined,
      adminAttachedFileName || undefined
    );
    audioNotifier.playSentSound();
    setAdminReply('');
    setAdminAttachedFileName('');
    setAdminAttachedFileUrl('');
  };

  // PROFILE GENERATOR STATE
  const [genRole, setGenRole] = useState<UserRole>(UserRole.TUTOR);
  const [genName, setGenName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genBio, setGenBio] = useState('Highly dedicated academic advisor with master credentials.');
  const [genRate, setGenRate] = useState(45);
  const [genSubject, setGenSubject] = useState('Chemistry & Organic Synthesis');
  const [genCountry, setGenCountry] = useState('US');
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);
    if (!isSuperiorAdmin) {
      setGenError('Security Violation: Only the Superior Admin is authorized to generate profiles.');
      return;
    }
    if (!genName.trim() || !genEmail.trim()) {
      setGenError('Full Name and Email address are required fields.');
      return;
    }
    
    if (onGenerateProfile) {
      const extra = genRole === UserRole.TUTOR ? {
        bio: genBio,
        hourlyRate: genRate,
        subjects: [genSubject],
        country: genCountry,
        verified: true
      } : {
        verified: true
      };

      try {
        const success = await onGenerateProfile(genName.trim(), genEmail.trim().toLowerCase(), genRole, extra);
        if (success) {
          setSelectedActionSuccess(`Profile generated successfully for ${genName} (${genEmail}) as a ${genRole.toUpperCase()}!`);
          setGenName('');
          setGenEmail('');
          setGenBio('Highly dedicated academic advisor with master credentials.');
          setGenSubject('Chemistry & Organic Synthesis');
          setGenRate(45);
          setTimeout(() => {
            setSelectedActionSuccess(null);
          }, 5000);
        } else {
          setGenError('This email is already registered inside our database ledger.');
        }
      } catch (err: any) {
        setGenError(err.message || 'Secure backend failed to create user.');
      }
    }
  };

  // DEDICATED SUB-ADMIN CREATOR STATE
  const [subAdminName, setSubAdminName] = useState('');
  const [subAdminEmail, setSubAdminEmail] = useState('');
  const [subAdminError, setSubAdminError] = useState<string | null>(null);

  const handleCreateSubAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminError(null);
    if (!isSuperiorAdmin) {
      setSubAdminError('Security Violation: Only the Superior Admin is authorized to create sub-admin profiles.');
      return;
    }
    if (!subAdminName.trim() || !subAdminEmail.trim()) {
      setSubAdminError('Full Name and Email address are required fields.');
      return;
    }

    if (onGenerateProfile) {
      const extra = { verified: true };
      try {
        const success = await onGenerateProfile(subAdminName.trim(), subAdminEmail.trim().toLowerCase(), UserRole.ADMIN, extra);
        if (success) {
          setSelectedActionSuccess(`Sub-Admin successfully created for ${subAdminName} (${subAdminEmail})!`);
          setSubAdminName('');
          setSubAdminEmail('');
          setTimeout(() => {
            setSelectedActionSuccess(null);
          }, 5000);
        } else {
          setSubAdminError('This email is already registered inside our database ledger.');
        }
      } catch (err: any) {
        setSubAdminError(err.message || 'Secure backend failed to create sub-admin.');
      }
    }
  };

  // NOTIFICATION & TRIGGER EMAIL COMPOSER STATES
  const [trEmailTo, setTrEmailTo] = useState('');
  const [trEmailSubject, setTrEmailSubject] = useState('');
  const [trEmailHtml, setTrEmailHtml] = useState('');
  const [trEmailTemplate, setTrEmailTemplate] = useState('custom');
  const [trEmailSuccess, setTrEmailSuccess] = useState<string | null>(null);
  const [trEmailError, setTrEmailError] = useState<string | null>(null);

  // Email Templates Map
  const applyEmailTemplate = (templateId: string) => {
    setTrEmailTemplate(templateId);
    if (templateId === 'welcome_student') {
      setTrEmailSubject('🎓 Welcome to University-Tutors! Your Academic Journey Begins Now');
      setTrEmailHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #374151;">
  <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 8px;">Welcome to the Family! 🎓</h2>
  <p>Dear Valued Student,</p>
  <p>Your academic profile is <strong>officially verified</strong> on universitytutors.com. You now have full escrow-secured access to the absolute top 5% expert tutors in essay review, calculus, machine learning, physics, and more!</p>
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <h4 style="margin-top: 0; color: #111827; font-size: 14px;">Your Next Steps inside the Workspace:</h4>
    <ul style="padding-left: 20px; margin-bottom: 0;">
      <li>Browse certified active subject tutors</li>
      <li>Review interactive available whiteboarding calendar slots</li>
      <li>Place assignments and accept quote proposals securely</li>
    </ul>
  </div>
  <p>All academic payments are handled via secure, customized payment links. Work is only officially released to the tutor after you click "Confirm & Approve Delivery" on your dashboard!</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
  <p style="font-size: 11px; color: #9ca3af; text-align: center;">Root System Administration • University Tutors Inc.</p>
</div>`);
    } else if (templateId === 'invoice_due') {
      setTrEmailSubject('🚨 Outstanding Balance Reminder - Action Required');
      setTrEmailHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #374151;">
  <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">Outstanding Settlement Invoice Alert 🚨</h2>
  <p>Dear Student,</p>
  <p>This is an automated operational alert regarding your outstanding invoice on universitytutors.com.</p>
  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 13px;">
    <strong>⚠️ Action Required:</strong> Balance payment is required to unlock your active dissertation draft or coding assignment delivery files.
  </div>
  <p>Please open your secure Accounting Console, review your invoices dashboard, and settle this payment holding immediately.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
  <p style="font-size: 11px; color: #9ca3af; text-align: center;">University Tutors Accounting Team • Secure Invoice Dispatch</p>
</div>`);
    } else if (templateId === 'dispute_arbitrated') {
      setTrEmailSubject('🛡️ Dispute Resolution Verdict: Escrow Settlement Decision');
      setTrEmailHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #374151;">
  <h2 style="color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px;">De-escalation Escrow Arbitration Verdict 🛡️</h2>
  <p>Dear Customer / Tutor,</p>
  <p>The academic arbitration council of universitytutors.com has thoroughly audited the submitted milestone reports, files, and chat logs.</p>
  <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; color: #1e3a8a; font-size: 13.5px; border-left: 4px solid #2563eb;">
    <strong>Verdict Decision:</strong> Proportional release has been finalized inside our payment ledger. Funds have been returned or released as determined by standard operational ethics guidelines.
  </div>
  <p>If you have any further questions of clarification, you can raise support tickets from your dashboard.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
  <p style="font-size: 11px; color: #9ca3af; text-align: center;">Escrow Arbitration Council • Platform Compliance Division</p>
</div>`);
    } else {
      setTrEmailSubject('');
      setTrEmailHtml('');
    }
  };

  const handleSendTriggerEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrEmailError(null);
    setTrEmailSuccess(null);

    if (!trEmailTo.trim() || !trEmailSubject.trim() || !trEmailHtml.trim()) {
      setTrEmailError('Recipients input, Subject, and HTML Content body are required fields.');
      return;
    }

    if (onSendTriggerEmail) {
      const ok = await onSendTriggerEmail(
        trEmailTo.trim().toLowerCase(),
        trEmailSubject.trim(),
        trEmailHtml.trim()
      );
      if (ok) {
        setTrEmailSuccess(`PostgreSQL triggered email document successfully created mapping! The smtp-mailer cloud extension will process the delivery.`);
        setTrEmailSubject('');
        setTrEmailHtml('');
        setTrEmailTemplate('custom');
      } else {
        setTrEmailError('Failed to log document into PostgreSQL.');
      }
    } else {
      setTrEmailError('Google cloud Trigger-Email driver is offline or unavailable.');
    }
  };

  // BLOG FORM STATE
  const [blogTitle, setBlogTitle] = useState('');
  const [blogImg, setBlogImg] = useState('https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400');
  const [blogCat, setBlogCat] = useState('University Survival');
  const [blogContent, setBlogContent] = useState('');
  const [blogTags, setBlogTags] = useState('oxford, referencing, mla');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');
  const [blogViewMode, setBlogViewMode] = useState<'table' | 'cards'>('table');
  const [editorActiveTab, setEditorActiveTab] = useState<'write' | 'preview'>('write');
  const [selectedTemplate, setSelectedTemplate] = useState('none');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const BLOG_TEMPLATES: Record<string, { title: string; tags: string; category: string; content: string }> = {
    apa_guide: {
      title: 'APA 7th Edition Referencing: Style Guide & Quick Citation Formulas',
      tags: 'apa, referencing, citations, bibliography',
      category: 'APA Guidelines',
      content: `# Ultimate APA 7th Edition Referencing Style Guide\n\nMastering the American Psychological Association (APA) style is crucial for scientific integrity. Here is a definitive quick-reference formula sheet.\n\n## 1. Core Citation Formulas\n\n### Journal Article (with DOI)\n> **Formula:** Author, A. A., & Author, B. B. (Year). Title of the journal article. *Title of Periodical*, *Volume*(Issue), Page range. https://doi.org/xxxx\n* **Example:** Kennedy, L. (2025). Cognitive load models in calculus instruction. *Journal of Educational Science*, *42*(2), 115-132. https://doi.org/10.1016/j.jeduc.2025.01.004\n\n### Print Book\n> **Formula:** Author, A. A. (Year). *Title of the book*. Publisher.\n* **Example:** Kennedy, L., & Smith, M. (2024). *Advanced Analytical Calculus*. Oxford University Press.\n\n---\n\n## 2. In-Text Citations Rules\n- **Parenthetical Citation:** (Kennedy, 2025)\n- **Narrative Citation:** Kennedy (2025) argued that...\n- **Three or More Authors:** Use *et al.* from the first citation. (e.g., Kennedy *et al.*, 2024)\n\n## 3. Formatting the Reference Page\n- Label the page **References** (bold, centered).\n- Order entries alphabetically by the author's last name.\n- Apply a **hanging indent** of 0.5 inches.`
    },
    exam_prep: {
      title: 'Scientific Exam Preparation: Cognitive Intervals & Active Recall Strategies',
      tags: 'exams, memory, active-recall, spaced-repetition',
      category: 'University Survival',
      content: `# Scientific Exam Prep: Intervals & Active Recall\n\nA guide to maximizing academic retention.\n\n## 1. The Active Recall Framework\nInstead of passively reading and highlighting textbooks, practice retrieval.\n* **Flashcards:** Create quiz questions for formulas.\n* **Feynman Technique:** Teach complex topics to an imaginary student.\n\n## 2. Spaced Repetition Schedule\nTo combat the *Ebbinghaus Forgetting Curve*, review materials at scheduled intervals:\n1. **Interval 1:** 24 hours after initial study.\n2. **Interval 2:** 3 days later.\n3. **Interval 3:** 7 days later.\n4. **Interval 4:** 14 days later.\n\n## 3. Recommended Exam Day Routine\n- Ensure 7.5 hours of rapid eye movement sleep.\n- Eat slow-release complex carbohydrates (oatmeal, nuts).\n- Hydrate systematically with electrolytes.`
    },
    dissertation: {
      title: 'Structuring a Master\'s Dissertation: Chapter-by-Chapter Thesis Framework',
      tags: 'dissertation, research, thesis, methodology',
      category: 'University Survival',
      content: `# Master's Dissertation Chapter-by-Chapter Framework\n\nA structured outline template for writing highly rated university theses.\n\n## Chapter 1: Introduction (10% of total length)\n- **Background:** Set up the research problem space.\n- **Problem Statement:** Clear expression of the issue.\n- **Research Objectives:** What the dissertation plans to achieve.\n\n## Chapter 2: Literature Review (30% of total length)\n- **Synthesis Matrix:** Group peer-reviewed papers by themes rather than listing them one by one.\n- **Identify Gaps:** Highlight what existing literature has missed.\n\n## Chapter 3: Methodology (15% of total length)\n- **Research Philosophy:** Positivist vs. Interpretivist approach.\n- **Data Collection:** Surveys, interviews, or simulated numeric sets.\n- **Ethical Approval:** Verify human-subject consent parameters.`
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey === 'none') return;
    
    const t = BLOG_TEMPLATES[templateKey];
    if (t) {
      setBlogTitle(t.title);
      setBlogTags(t.tags);
      setBlogCat(t.category);
      setBlogContent(t.content);
    }
  };

  const handleToolbarClick = (syntax: string, placeholderText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(startPos, endPos);

    let replacement = '';
    if (syntax === 'bold') {
      replacement = `**${selectedText || placeholderText || 'bold text'}**`;
    } else if (syntax === 'italic') {
      replacement = `*${selectedText || placeholderText || 'italic text'}*`;
    } else if (syntax === 'h2') {
      replacement = `\n## ${selectedText || placeholderText || 'Heading 2'}\n`;
    } else if (syntax === 'h3') {
      replacement = `\n### ${selectedText || placeholderText || 'Heading 3'}\n`;
    } else if (syntax === 'bullet') {
      replacement = `\n- ${selectedText || placeholderText || 'List item'}\n`;
    } else if (syntax === 'number') {
      replacement = `\n1. ${selectedText || placeholderText || 'List item'}\n`;
    } else if (syntax === 'code') {
      replacement = `\n\`\`\`\n${selectedText || placeholderText || 'code here'}\n\`\`\`\n`;
    } else if (syntax === 'link') {
      replacement = `[${selectedText || placeholderText || 'Link Title'}](https://example.com)`;
    } else if (syntax === 'quote') {
      replacement = `\n> ${selectedText || placeholderText || 'Blockquote'}\n`;
    } else if (syntax === 'hr') {
      replacement = `\n---\n`;
    }

    const newValue = text.substring(0, startPos) + replacement + text.substring(endPos);
    setBlogContent(newValue);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "<p class='text-gray-400 italic text-xs'>No content composed yet. Start typing or choose a template to see preview!</p>";
    
    let html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h4 class='text-sm font-bold text-gray-950 mt-4 mb-2 font-sans'>$1</h4>");
    html = html.replace(/^## (.*?)$/gm, "<h3 class='text-base font-bold text-gray-950 mt-5 mb-2.5 font-sans border-b pb-1'>$1</h3>");
    html = html.replace(/^# (.*?)$/gm, "<h2 class='text-lg font-bold text-gray-950 mt-6 mb-3 font-sans'>$1</h2>");

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-gray-900'>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em class='italic text-gray-800'>$1</em>");

    // Code Blocks
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-900 text-gray-100 font-mono text-[11px] p-3 rounded-xl overflow-x-auto my-3 border border-gray-800'><code>$1</code></pre>");
    html = html.replace(/`([^`]+)`/g, "<code class='bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-[10.5px] border border-gray-200'>$1</code>");

    // Blockquotes
    html = html.replace(/^&gt; (.*?)$/gm, "<blockquote class='border-l-4 border-orange-500 pl-4 py-1 italic my-3 text-gray-600 bg-orange-50/40 rounded-r-lg'>$1</blockquote>");

    // Horizontal Rules
    html = html.replace(/^---$/gm, "<hr class='my-5 border-gray-200' />");

    // Bullet Lists
    html = html.replace(/^\- (.*?)$/gm, "<li class='list-disc ml-5 mb-1 text-xs text-gray-750'>$1</li>");

    // Numbered Lists
    html = html.replace(/^\d+\.\s(.*)$/gm, "<li class='list-decimal ml-5 mb-1 text-xs text-gray-750'>$1</li>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-orange-600 hover:underline font-semibold'>$1</a>");

    // Line breaks / Paragraphs
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '<br/>';
      if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<blockquote') || line.startsWith('<li') || line.startsWith('<hr') || line.startsWith('<code') || line.startsWith('<br')) {
        return line;
      }
      return `<p class='text-xs text-gray-700 leading-relaxed mb-2.5'>${line}</p>`;
    });

    return processedLines.join('\n');
  };

  // FAQ FORM STATE
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');
  const [faqAnswer, setFaqAnswer] = useState('');

  // TOPIC SUBJECT STATE
  const [subjectTopic, setSubjectTopic] = useState('');

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;

    if (editingBlogId) {
      if (onUpdateBlog) {
        onUpdateBlog(
          editingBlogId,
          blogTitle,
          blogContent,
          blogImg,
          blogCat,
          blogTags.split(',').map(t => t.trim())
        );
      }
      setEditingBlogId(null);
      setSelectedActionSuccess('Successfully updated blog article in database!');
    } else {
      onAddBlog({
        adminId: currentUser.id,
        title: blogTitle,
        image: blogImg,
        category: blogCat,
        content: blogContent,
        tags: blogTags.split(',').map(t => t.trim())
      });
      setSelectedActionSuccess('Successfully written blog article to database!');
    }

    setBlogTitle('');
    setBlogContent('');
    setBlogImg('https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400');
    setBlogTags('oxford, referencing, mla');
    setIsBlogModalOpen(false);

    setTimeout(() => {
      setSelectedActionSuccess(null);
    }, 4000);
  };

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) return;
    onAddFaq({
      question: faqQuestion,
      category: faqCategory as any,
      answer: faqAnswer,
      order: faqs.length + 1
    });
    setFaqQuestion('');
    setFaqAnswer('');
    setSelectedActionSuccess('Successfully updated FAQ categories!');
    setTimeout(() => {
      setSelectedActionSuccess(null);
    }, 4000);
  };

  const [selectedActionSuccess, setSelectedActionSuccess] = useState<string | null>(null);

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTopic) return;
    if (onAddSubjectTopic) {
      onAddSubjectTopic(subjectTopic);
      setSubjectTopic('');
      setSelectedActionSuccess('Subject category successfully added!');
      setTimeout(() => {
        setSelectedActionSuccess(null);
      }, 4500);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl font-sans text-left min-h-[75vh]" id="admin-workspace">
      
      {/* Admin Workspace header banner */}
      <div className="bg-gray-950 text-white rounded-3xl p-6 md:p-8 mb-8 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold block uppercase leading-none">Security Platform Administration Console</span>
            
            {/* Real-time Connection status indicator */}
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] tracking-tight">
              {connectionStatus === 'connected' && (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-emerald-400 uppercase font-mono">Synced</span>
                  {lastSyncTime && (
                    <span className="text-gray-400 border-l border-white/10 pl-2 font-mono">
                      {lastSyncTime}
                    </span>
                  )}
                </>
              )}
              {connectionStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-2.5 h-2.5 text-orange-400 animate-spin" />
                  <span className="font-semibold text-orange-400 uppercase font-mono">Syncing</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <div className="group relative flex items-center gap-1 cursor-help">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span className="font-semibold text-red-400 uppercase font-mono">Sync Error</span>
                  {syncError && (
                    <div className="absolute top-full left-0 mt-2 p-2.5 bg-gray-900 border border-red-950 rounded-xl shadow-xl text-[10px] text-gray-300 w-64 whitespace-normal hidden group-hover:block z-50 transition-all font-mono leading-relaxed normal-case">
                      <span className="font-bold block text-red-400 mb-0.5">Details:</span>
                      {syncError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans mt-2">Console Access: {currentUser.name} ⚖️</h2>
          <p className="text-xs text-gray-400 mt-1">Authorized root privileges. Audit user accounts, write education blogs, and resolve escrow dispute holds.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center px-3.5 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-lg font-mono font-bold text-orange-400 block">{users.length}</span>
            <span className="text-[9px] text-gray-400 font-bold block uppercase">active users</span>
          </div>
          <div className="text-center px-3.5 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-lg font-mono font-bold text-emerald-400 block">{payments.filter(p => p.status === 'escrow').length}</span>
            <span className="text-[9px] text-gray-400 font-bold block uppercase">escrows busy</span>
          </div>
        </div>
      </div>

      {selectedActionSuccess && (
        <div id="admin-status-toast" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 mb-6 font-semibold shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{selectedActionSuccess}</span>
        </div>
      )}

      {/* Grid: left admin sidebar / right control panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-150 p-4 space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase px-3 pb-1 block tracking-wider">Academics & Tutors</span>
            {[
              { id: 'student_profiles', label: 'Student Profiles Directory', icon: <GraduationCap className="w-4 h-4 text-orange-400" /> },
              { id: 'tutors_list', label: 'Tutors List', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'users', label: 'User Ledger List', icon: <UsersIcon className="w-4 h-4" /> },
              { id: 'assignments', label: 'New Assignment Ledger', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'reports', label: 'Assignment Reports Desk', icon: <Settings className="w-4 h-4" /> },
              { id: 'agreements', label: 'Student Agreements', icon: <ShieldAlert className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="h-px bg-gray-100 my-2" />
            <span className="text-[9px] font-bold text-gray-400 uppercase px-3 pb-1 block tracking-wider">Accounting Center</span>
            {[
              { id: 'payments_ledger', label: 'Payments Dashboard', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'create_invoice', label: 'Create Invoice Form', icon: <Plus className="w-4 h-4" /> },
              { id: 'disputes', label: 'Disputes & Escrow Desk', icon: <ShieldAlert className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="h-px bg-gray-100 my-2" />
            <span className="text-[9px] font-bold text-gray-400 uppercase px-3 pb-1 block tracking-wider">Presence & Feed</span>
            {[
              { id: 'chats', label: 'Operational Chats Room', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'notifications', label: 'Broadcast Notifications', icon: <Send className="w-4 h-4" /> },
              { id: 'feedback', label: 'Tutor Feedback Ledger', icon: <UserCheck className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="h-px bg-gray-100 my-2" />
            <span className="text-[9px] font-bold text-gray-400 uppercase px-3 pb-1 block tracking-wider">Cloud Extensions</span>
            {[
              { id: 'trigger_emails', label: 'Trigger Email Console', icon: <Mail className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="h-px bg-gray-100 my-2" />
            <span className="text-[9px] font-bold text-gray-400 uppercase px-3 pb-1 block tracking-wider">Reference & Platform</span>
            {[
              { id: 'sops', label: 'Standard SOPs Matrix', icon: <Settings className="w-4 h-4" /> },
              { id: 'activity_log', label: 'Live Audit Log Tracker', icon: <TrendingDown className="w-4 h-4" /> },
              { id: 'blogs', label: 'Blog Manager', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'faqs', label: 'QA Helpdesk Center', icon: <HelpCircle className="w-4 h-4" /> },
              { id: 'subjects', label: 'Syllabus Subjects', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content switch displays */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* STUDENT PROFILES DIRECTORY */}
          {activeTab === 'student_profiles' && (
            <StudentProfilesAdmin
              users={users}
              assignments={assignments}
              chats={chats}
              messages={messages}
              invoices={invoices}
              initialSearchQuery={adminStudentDirectorySearch}
              initialStudentId={adminStudentDirectoryId}
              onOpenChatWithStudent={(studentId, tutorId, subject) => {
                let targetChat = chats.find(c => 
                  c.studentId === studentId || 
                  c.studentId.toLowerCase() === studentId.toLowerCase()
                );
                if (!targetChat && onGetOrCreateChat) {
                  targetChat = onGetOrCreateChat(studentId, tutorId || 'tutor_clara', subject || 'Academic Mentorship');
                }
                if (targetChat) {
                  onSelectChat(targetChat);
                  setSelectedChatId(targetChat.id);
                }
                setActiveTab('chats');
              }}
              onAssignTutor={onAssignTutor}
              onSetAssignmentPrice={onSetAssignmentPrice}
              onUpdateUserProfile={onUpdateUserProfile}
              onDeleteUser={onDeleteUser}
              onSendNotification={onSendNotification}
            />
          )}

          {/* TUTORS LIST MANAGEMENT */}
          {activeTab === 'tutors_list' && (
            <TutorsListAdmin
              users={users}
              onUpdateUserProfile={onUpdateUserProfile}
              onDeleteUser={onDeleteUser}
              onAddNewTutor={async (data) => {
                if (onAddNewTutor) {
                  return await onAddNewTutor(data);
                } else {
                  return await store.submitTutorApplication(data);
                }
              }}
            />
          )}

          {/* USER LEDGER LIST */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* PROFILE GENERATOR FOR TUTORS & SUB-ADMINS */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs" id="admin-profile-generator">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Generate Tutor & Sub-Admin Profiles</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">As an authorized administrator, you can register new system-verified subject tutors and sub-admin platform logs manually.</p>
                
                {!isSuperiorAdmin ? (
                  <div className="mt-5 p-4 bg-orange-50/40 border border-orange-200/50 text-amber-950 text-xs rounded-2xl flex items-start gap-3">
                    <span className="text-lg">🔒</span>
                    <div>
                      <p className="font-bold font-sans">Restricted to Superior Admin Only</p>
                      <p className="text-[11px] text-amber-900/80 mt-0.5 leading-normal">Creating or registering new tutors and sub-admin accounts can only be performed by the Superior Admin (<span className="font-semibold text-orange-600">shaka.ahmadd@gmail.com</span>).</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateProfileSubmit} className="mt-5 space-y-4">
                    {genError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold border border-red-100">
                        {genError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Target Account Role</label>
                        <select 
                          id="gen-profile-role"
                          value={genRole}
                          onChange={(e) => setGenRole(e.target.value as UserRole)}
                          className="w-full bg-gray-55 border border-gray-200 py-2 px-3 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 focus:bg-white"
                        >
                          <option value={UserRole.TUTOR}>Certified Subject Tutor</option>
                          <option value={UserRole.ADMIN}>Sub-Admin Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Full Representative Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Dr. Arthur Pendelton"
                          value={genName}
                          onChange={(e) => setGenName(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 py-2 px-3 rounded-xl text-xs focus:outline-hidden focus:border-orange-500 focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Verified Representative Email</label>
                        <input 
                          type="email"
                          placeholder="e.g. arthur.tutor@university.com"
                          value={genEmail}
                          onChange={(e) => setGenEmail(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 py-2 px-3 rounded-xl text-xs focus:outline-hidden focus:border-orange-500 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    {genRole === UserRole.TUTOR && (
                      <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Tutor Biography Statement</label>
                          <input 
                            type="text"
                            value={genBio}
                            onChange={(e) => setGenBio(e.target.value)}
                            placeholder="Short introductory summary"
                            className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs focus:outline-hidden focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Specialty Subject</label>
                          <input 
                            type="text"
                            value={genSubject}
                            onChange={(e) => setGenSubject(e.target.value)}
                            className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-1">Hourly Rate ($)</label>
                              <input 
                                type="number"
                                min="15"
                                max="150"
                                value={genRate}
                                onChange={(e) => setGenRate(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                                className="w-full bg-white border border-gray-200 py-1.5 px-2 rounded-lg text-xs focus:outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-1">Country</label>
                              <select 
                                value={genCountry}
                                onChange={(e) => setGenCountry(e.target.value)}
                                className="w-full bg-white border border-gray-200 py-1.5 px-1.5 rounded-lg text-xs focus:outline-hidden"
                              >
                                <option value="US">🇺🇸 US</option>
                                <option value="GB">🇬🇧 UK</option>
                                <option value="CA">🇨🇦 CA</option>
                                <option value="AU">🇦🇺 AU</option>
                                <option value="NZ">🇳🇿 NZ</option>
                                <option value="IE">🇮🇪 IE</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Generate Action Profile
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* SPECIAL FEATURE: DEDICATED SUB-ADMIN CREATOR */}
              <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xl animate-fade-in" id="dedicated-sub-admin-creator">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-orange-500 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white font-sans tracking-tight">Create Sub-Admin Administrator</h3>
                    <p className="text-xs text-slate-300 mt-1 font-medium">Provision new administrative team members with full capability to manage tutor profiles, issue invoices, broadcast notifications, and safely respond to chats.</p>
                  </div>
                </div>

                {!isSuperiorAdmin ? (
                  <div className="mt-5 p-4 bg-slate-800/60 border border-slate-700/50 text-slate-100 text-xs rounded-2xl flex items-start gap-3">
                    <span className="text-lg">🔒</span>
                    <div>
                      <p className="font-bold font-sans text-orange-400">Restricted to Superior Admin Only</p>
                      <p className="text-[11px] text-slate-300/90 mt-0.5 leading-normal">Sub-admin registration keys can only be provisioned by the Superior Admin (<span className="font-semibold text-orange-400 font-mono">shaka.ahmadd@gmail.com</span>).</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateSubAdminSubmit} className="mt-5 space-y-4">
                    {subAdminError && (
                      <div className="bg-red-500/10 text-red-300 p-3 rounded-xl text-xs font-semibold border border-red-500/20">
                        {subAdminError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-300 block mb-1.5">Sub-Admin Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Inspector Arthur Pendelton"
                          value={subAdminName}
                          onChange={(e) => setSubAdminName(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-3.5 rounded-xl text-xs focus:outline-hidden focus:border-orange-500 focus:bg-slate-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-300 block mb-1.5">Operational Email Address</label>
                        <input 
                          type="email"
                          placeholder="e.g. arthur.admin@universitytutors.com"
                          value={subAdminEmail}
                          onChange={(e) => setSubAdminEmail(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-3.5 rounded-xl text-xs focus:outline-hidden focus:border-orange-500 focus:bg-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-2">
                      <div className="text-[11px] text-slate-400 font-medium">
                        🔒 Sub-Admins are verified and granted structural privileges immediately upon creation.
                      </div>
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 active:scale-97 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        Create Sub-Admin Account
                      </button>
                    </div>
                  </form>
                )}
              </div>



              {/* USER LEDGER LIST */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs" id="admin-users-panel">
                <div className="p-6 border-b border-gray-150 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">University Platform User Ledger</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Verify login status and launch live consultation support rooms.</p>
                  </div>

                  {/* Active Filtering Controls */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="bg-gray-55 border border-gray-200 py-1.5 pl-9 pr-3.5 rounded-xl text-xs focus:outline-none w-full sm:w-48 font-semibold"
                      />
                    </div>
                    <select
                      value={userFilterRole}
                      onChange={(e) => setUserFilterRole(e.target.value as any)}
                      className="bg-gray-55 border border-gray-200 py-1.5 px-2.5 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="tutor">Tutors</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                {/* LIVE POSTGRESQL DATABASE SYNC AUDIT PANEL */}
                <div className="bg-gray-50/50 p-4 border-b border-gray-150 flex flex-col gap-4 text-left text-xs font-sans animate-fade-in" id="admin-db-sync-audit-panel">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        unsyncedUsers.length === 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {unsyncedUsers.length === 0 ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Synced with PostgreSQL
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {unsyncedUsers.length} Unsynced Records Detected
                          </>
                        )}
                      </span>
                      <span className="text-gray-400 font-medium">
                        Cross-referencing `store.users` state against remote PostgreSQL collection...
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {lastAuditTime && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          Last Audited: {lastAuditTime}
                        </span>
                      )}
                      <button
                        onClick={runUsersSyncAudit}
                        disabled={isAuditingUsers}
                        className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-800 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                        title="Re-run PostgreSQL cross-reference ledger check"
                      >
                        <RefreshCw className={`w-3 h-3 text-gray-500 ${isAuditingUsers ? 'animate-spin' : ''}`} />
                        <span>{isAuditingUsers ? 'Auditing...' : 'Run Diagnostics'}</span>
                      </button>

                      {onSeedMockStudentData && (
                        <button
                          onClick={async () => {
                            if (confirm("Would you like to seed 3 mock student assignments and conversations directly into your PostgreSQL database for instant testing?")) {
                              setIsSeedingMock(true);
                              const res = await onSeedMockStudentData();
                              setIsSeedingMock(false);
                              if (res.success) {
                                alert("Database seeded successfully! The mock assignments and chats will automatically appear on your Admin Dashboard.");
                                runUsersSyncAudit();
                              } else {
                                alert("Seeding failed: " + (res.error || "Please check your console/network permissions."));
                              }
                            }
                          }}
                          disabled={isSeedingMock}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                          title="Generate sample student submissions and support chats directly in PostgreSQL"
                        >
                          <Sparkles className={`w-3 h-3 text-white ${isSeedingMock ? 'animate-bounce' : ''}`} />
                          <span>{isSeedingMock ? 'Seeding...' : 'Seed Sample Submissions'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {auditError && (
                    <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-red-700 text-[11px] font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>PostgreSQL Sync Audit Error: {auditError}</span>
                    </div>
                  )}

                  {unsyncedUsers.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-150/70 rounded-2xl p-4.5 space-y-3.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-amber-900 text-[12px] tracking-tight">
                            Unsynced User Records Detected in PostgreSQL (e.g. 'Waqas Ahmad')
                          </h4>
                          <p className="text-amber-700 text-[11px] leading-relaxed mt-1">
                            The users listed below exist in your PostgreSQL database but are missing from the current local store array (`store.users`). This discrepancy typically arises when records are created via direct database seeding scripts or external administrative operations, and the local real-time listener hasn't loaded them. 
                          </p>
                        </div>
                      </div>

                      {/* Unsynced Users Table/Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                        {unsyncedUsers.map(u => (
                          <div key={u.id} className="bg-white rounded-xl border border-amber-200/50 p-3 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'} className="w-8 h-8 rounded-full border border-gray-150 object-cover" alt="" />
                              <div className="min-w-0">
                                <span className="font-bold text-gray-900 block truncate">{u.name}</span>
                                <span className="text-[10px] text-gray-450 font-mono block truncate">{u.email}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase border border-amber-100">
                                {u.role}
                              </span>
                              <span className="block text-[8.5px] font-mono text-gray-450 mt-1">
                                ID: {u.id.substring(0, 10)}...
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-1 border-t border-amber-250/20">
                        <button
                          onClick={() => {
                            setForceMerged(true);
                            console.log("[DIAGNOSTICS] Manually merged unsynced users into view state.", unsyncedUsers);
                          }}
                          disabled={forceMerged}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-[11px] transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:bg-emerald-600 disabled:cursor-default"
                        >
                          {forceMerged ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Recovered &amp; Merged into Ledger</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Force-Merge Unsynced Users into View</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10.5px] text-amber-600 font-medium leading-normal">
                          {forceMerged 
                            ? "Success! Unsynced users are now loaded directly in the main ledger table below. You can manage roles, suspensions, and chats seamlessly." 
                            : "Clicking this will recover the unsynced user profiles and append them directly to the active ledger below."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 uppercase font-mono tracking-wider text-[10px]">
                        <th className="p-4 font-bold">User Information</th>
                        <th className="p-4 font-bold">Role Alignment</th>
                        <th className="p-4 font-bold">Request Status (Student Dashboard)</th>
                        <th className="p-4 font-bold text-center">Platform Chat Room</th>
                        <th className="p-4 font-bold text-right font-sans">Moderator Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-sans">
                      {(() => {
                        const baseUsers = forceMerged ? [...users, ...unsyncedUsers.filter(u => !users.some(pu => pu.id === u.id))] : users;
                        const filteredUsers = baseUsers.filter(u => {
                          const matchesQuery = 
                            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                            u.id.toLowerCase().includes(userSearchQuery.toLowerCase());
                          
                          if (userFilterRole === 'student') return u.role === UserRole.STUDENT && matchesQuery;
                          if (userFilterRole === 'tutor') return u.role === UserRole.TUTOR && matchesQuery;
                          if (userFilterRole === 'admin') return u.role === UserRole.ADMIN && matchesQuery;
                          return matchesQuery;
                        });

                        if (filteredUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="p-12 text-center text-gray-400 font-semibold bg-gray-50/50">
                                <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                No users matched the search queries.
                              </td>
                            </tr>
                          );
                        }

                        return filteredUsers.map((u) => {
                          const studentAssignments = assignments.filter(a => a.studentId === u.id);
                          const isExpanded = expandedUserRowId === u.id;
                          
                          return (
                            <React.Fragment key={u.id}>
                              <tr id={`admin-user-row-${u.id}`} className="hover:bg-gray-55/20 transition-all">
                                {/* Info / Online indicator */}
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img src={u.avatarUrl} className="w-9 h-9 rounded-full object-cover border shadow-xs" alt="" />
                                      {/* Simulated green live indicator for all accounts who registered */}
                                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" title="Active Account Access" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-950 block leading-none">{u.name}</span>
                                        {u.verified && (
                                          <span className="text-[9px] bg-sky-50 text-sky-600 font-bold px-1 py-0.2 rounded border border-sky-100 font-sans">Verified</span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">{u.email}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Role */}
                                <td className="p-4">
                                  {u.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com' ? (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-300 font-mono inline-block">
                                      👑 SUPERIOR OWNER
                                    </span>
                                  ) : !isSuperiorAdmin ? (
                                    <span className="bg-orange-100 text-orange-850 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-200 font-mono inline-block uppercase">
                                      {u.role}
                                    </span>
                                  ) : (
                                    <select 
                                      id={`admin-role-select-${u.id}`}
                                      value={u.role}
                                      onChange={(e) => onChangeUserRole(u.id, e.target.value as UserRole)}
                                      className="bg-white border border-gray-200 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold focus:outline-none"
                                    >
                                      <option value={UserRole.STUDENT}>STUDENT</option>
                                      <option value={UserRole.TUTOR}>TUTOR</option>
                                      <option value={UserRole.ADMIN}>ADMIN</option>
                                    </select>
                                  )}
                                </td>

                                {/* Brief creation check */}
                                <td className="p-4">
                                  {u.role === UserRole.STUDENT ? (
                                    studentAssignments.length > 0 ? (
                                      <button
                                        onClick={() => setExpandedUserRowId(isExpanded ? null : u.id)}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10.5px] font-bold py-1 px-2.5 rounded-full border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                                        title="Click to view submitted dashboard requests"
                                      >
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>🎯 {studentAssignments.length} Requests Raised</span>
                                        <span className="text-[9px] text-emerald-500 font-mono">{isExpanded ? '▲ hide' : '▼ show details'}</span>
                                      </button>
                                    ) : (
                                      <span className="text-gray-400 text-[10.5px] font-bold bg-gray-100 px-2.5 py-1 rounded-full font-sans">
                                        No Requests Made
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-gray-400 text-[10.5px] italic font-sans">Not a student profile</span>
                                  )}
                                </td>

                                {/* Platform support chats */}
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => {
                                      if (!onGetOrCreateChat) {
                                        alert("Chat module is currently initializing. Please try again in a moment.");
                                        return;
                                      }
                                      // Get or create a direct administrative support chat with the student
                                      // Dynamically use the active administrator's ID
                                      const tutorIdForSupport = u.role === UserRole.TUTOR ? u.id : currentUser.id;
                                      const studentIdForSupport = u.role === UserRole.STUDENT ? u.id : currentUser.id;
                                      
                                      try {
                                        const chat = onGetOrCreateChat(studentIdForSupport, tutorIdForSupport, `Admin Support: Consultation for ${u.name}`);
                                        if (chat && chat.id) {
                                          setSelectedChatId(chat.id);
                                          setActiveTab('chats');
                                          alert(`Platform Chat launched! Switched to Operational support room for ${u.name}.`);
                                        }
                                      } catch (error) {
                                        console.error(error);
                                        alert("Instantiated support room. Switch to 'Operational Chats Room' tab to begin.");
                                      }
                                    }}
                                    className="bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 p-2 rounded-xl border border-orange-200/50 inline-flex items-center gap-1 font-bold text-[10.5px] transition-all cursor-pointer font-sans"
                                    title="Start direct administrative or tutoring chat on our platform"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Chat Support</span>
                                  </button>
                                </td>



                                {/* Actions */}
                                <td className="p-4 text-right">
                                  {u.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com' ? (
                                    <span className="text-[11px] text-amber-750 font-bold italic mr-4 font-sans">Superior Protection</span>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1.5 text-xs font-sans">
                                      <button
                                        onClick={() => handleStartEditUser(u)}
                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                                        title="Edit user details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you absolutely sure you want to permanently delete user ${u.name}? This action is irreversible.`)) {
                                            onDeleteUser(u.id);
                                          }
                                        }}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                        title="Permanently remove user"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        id={`admin-toggle-status-${u.id}`}
                                        onClick={() => onToggleUserStatus(u.id)}
                                        className={`font-bold text-[9.5px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${u.suspended ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                      >
                                        {u.suspended ? 'Unsuspend' : 'Suspend'}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>

                              {/* Expanded details list showing submitted student dashboard briefs */}
                              {isExpanded && studentAssignments.length > 0 && (
                                <tr className="bg-emerald-50/25">
                                  <td colSpan={6} className="p-4 border-l-4 border-emerald-500">
                                    <div className="space-y-3 pl-2 text-left">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10.5px] font-bold font-mono text-emerald-800 uppercase tracking-wider block">
                                          📋 Registered Briefs submitted from Student's Dashboard
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-sans">Showing {studentAssignments.length} submissions</span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {studentAssignments.map(assign => {
                                          const assignedTutor = users.find(x => x.id === assign.tutorId);
                                          return (
                                            <div key={assign.id} className="bg-white border border-emerald-100 rounded-xl p-3.5 space-y-2.5 shadow-2xs font-sans">
                                              <div className="flex justify-between items-start gap-1">
                                                <div>
                                                  <h5 className="font-bold text-xs text-gray-900 leading-tight">{assign.title}</h5>
                                                  <span className="text-[10px] font-bold text-orange-600 mt-0.5 block">{assign.subject}</span>
                                                </div>
                                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                                                  assign.status === AssignmentStatus.COMPLETED 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : assign.status === AssignmentStatus.REVISION 
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                  {assign.status}
                                                </span>
                                              </div>

                                              <p className="text-[10.5px] text-gray-500 italic bg-gray-50 p-2 rounded-lg line-clamp-2">
                                                "{assign.instructions || 'No special instructions listed.'}"
                                              </p>

                                              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-gray-500 font-semibold border-t border-dashed border-gray-100">
                                                <div>📅 Deadline: <span className="font-bold text-gray-800">{assign.deadline}</span></div>
                                                <div>💰 Quote Price: <span className="font-bold text-gray-800">{assign.quoteAmount ? `$${assign.quoteAmount}` : 'Unquoted'}</span></div>
                                                <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
                                                  <span>🎓 Tutor Assignee:</span>
                                                  {assignedTutor ? (
                                                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                                                      <img src={assignedTutor.avatarUrl} className="w-4 h-4 rounded-full border" alt="" />
                                                      {assignedTutor.name}
                                                    </span>
                                                  ) : (
                                                    <span className="text-amber-600 font-bold">Unassigned</span>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="pt-1.5 flex justify-end">
                                                <button
                                                  onClick={() => {
                                                    setActiveTab('assignments');
                                                    setAssignmentFilter('all');
                                                    alert(`Navigating to Dispatch Desk. Look for assignment Ref #${assign.id}`);
                                                  }}
                                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                                >
                                                  <span>Dispatch Tutor Desk</span>
                                                  <ArrowUpRight className="w-3 h-3 text-emerald-100" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS MANAGEMENT VIEW */}
          {activeTab === 'assignments' && (
            <div className="space-y-6" id="admin-assignments-management">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">New Assignment Ledger (Incoming Requests)</h3>
                <p className="text-xs text-gray-400 mt-1">Review incoming student tasks and demands, assign qualified subject tutors, set final balance payment pricing, and audit real-time chat sync.</p>
                
                {/* Visual Sheet Info Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-6 border-dashed">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                    <span className="text-xs text-orange-600 block font-bold uppercase tracking-wider">Total Orders</span>
                    <span className="text-2xl font-bold font-mono text-orange-950 block mt-1">{assignments.length}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <span className="text-xs text-blue-600 block font-bold uppercase tracking-wider">Unassigned Tasks</span>
                    <span className="text-2xl font-bold font-mono text-blue-950 block mt-1">{assignments.filter(a => !a.tutorId).length}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <span className="text-xs text-emerald-600 block font-bold uppercase tracking-wider">Active Students</span>
                    <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1">{new Set(assignments.map(a => a.studentId)).size}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                    <span className="text-xs text-purple-600 block font-bold uppercase tracking-wider">Active Tutors</span>
                    <span className="text-2xl font-bold font-mono text-purple-950 block mt-1">{new Set(assignments.filter(a => a.tutorId).map(a => a.tutorId)).size}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: ⚡ Incoming Requests Direct Dispatch Desk */}
              <div className="bg-slate-50 rounded-3xl border border-gray-150 p-6 shadow-xs text-left space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-gray-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>⚡ Direct Tutor Assignment Desk (Incoming Requests)</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                      View new student demands and instantly pair them with subject specialists.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-orange-150 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                    {assignments.filter(a => !a.tutorId || a.status === AssignmentStatus.PENDING).length} Pending Assignment
                  </span>
                </div>

                {(() => {
                  const pendingIncomingRequests = assignments.filter(a => !a.tutorId || a.status === AssignmentStatus.PENDING);
                  const tutorsList = users.filter(u => u.role === UserRole.TUTOR);

                  if (pendingIncomingRequests.length === 0) {
                    return (
                      <div className="bg-white border border-dashed rounded-2xl p-8 text-center text-gray-500">
                        <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 bg-emerald-50 p-1.5 rounded-full" />
                        <p className="text-xs font-bold text-gray-800">All caught up!</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">No unassigned student requests remaining in the queue.</p>
                        {onSeedMockStudentData && (
                          <button
                            onClick={async () => {
                              setIsSeedingMock(true);
                              const res = await onSeedMockStudentData();
                              setIsSeedingMock(false);
                              if (res.success) {
                                alert("Database seeded successfully with student demands & matching chats!");
                              } else {
                                alert("Seeding failed: " + (res.error || "Please check your console/network permissions."));
                              }
                            }}
                            disabled={isSeedingMock}
                            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-all text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isSeedingMock ? 'animate-bounce' : ''}`} />
                            <span>{isSeedingMock ? 'Seeding requests...' : 'Seed Sample Student Demands'}</span>
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingIncomingRequests.map(assign => {
                        const student = users.find(u => u.id === assign.studentId);
                        return (
                          <div key={assign.id} className="bg-white rounded-2xl border border-gray-200 p-4.5 flex flex-col justify-between hover:shadow-xs hover:border-orange-200 transition-all">
                            <div className="space-y-3">
                              {/* Student and Reference info */}
                              <div className="flex justify-between items-start">
                                <span className="inline-block text-[9px] bg-orange-100 text-orange-800 font-bold font-mono px-1.5 py-0.5 rounded-md">
                                  Ref: #{assign.id}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono font-bold">
                                  📅 {assign.deadline}
                                </span>
                              </div>

                              {/* Title & Subject */}
                              <div>
                                <h5 className="font-bold text-xs text-gray-950 leading-snug line-clamp-1">{assign.title}</h5>
                                <span className="text-[10.5px] font-bold text-orange-600 block mt-0.5">{assign.subject}</span>
                                <span className="text-[9.5px] text-gray-400 block mt-0.5 font-bold">By: {student?.name || 'Student'}</span>
                              </div>

                              {/* Instructions snippet */}
                              <p className="text-[10.5px] text-gray-500 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/70 line-clamp-3 leading-relaxed font-semibold italic">
                                "{assign.instructions}"
                              </p>

                              {/* Files attached indicator */}
                              {assign.fileNames && assign.fileNames.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {assign.fileNames.map((fn, idx) => {
                                    const url = (assign.fileUrls && assign.fileUrls[idx]) ? assign.fileUrls[idx] : `https://universitytutors.com/uploads/${encodeURIComponent(fn)}`;
                                    return (
                                      <a 
                                        key={idx} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        download 
                                        className="inline-flex items-center text-[9px] text-orange-600 hover:text-orange-800 font-bold bg-orange-50/50 hover:bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200/80 max-w-full truncate transition-colors cursor-pointer no-underline" 
                                        title={`Download ${fn}`}
                                      >
                                        📎 {fn}
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Quick assign actions inside card */}
                            <div className="mt-4 pt-3 border-t border-dashed space-y-2.5">
                              {/* Quote Price Setting */}
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                                  Set Quote Price ($)
                                </label>
                                <div className="flex gap-1.5">
                                  <input 
                                    type="number"
                                    placeholder="Enter Price Amount"
                                    value={customPriceState[assign.id] || ''}
                                    onChange={(e) => setCustomPriceState({...customPriceState, [assign.id]: e.target.value})}
                                    className="w-full bg-gray-55 border border-gray-200 py-1.5 px-2.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-300"
                                  />
                                  {assign.quoteAmount && (
                                    <span className="text-[10.5px] bg-slate-100 text-slate-700 py-1.5 px-2.5 rounded-lg font-bold shrink-0">
                                      Current: ${assign.quoteAmount}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Available Tutors selector */}
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                                  Select Available Tutor
                                </label>
                                <select
                                  value={assignTutorState[assign.id] || assign.tutorId || ''}
                                  onChange={(e) => setAssignTutorState({...assignTutorState, [assign.id]: e.target.value})}
                                  className="w-full bg-gray-55 border border-gray-200 py-1.5 px-2 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-300"
                                >
                                  <option value="">-- Choose Tutor --</option>
                                  {tutorsList.map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} (★{t.rating}) - {t.subjects?.join(', ') || 'Academic Specialist'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Quick Action Dispatch Button */}
                              <button
                                onClick={async () => {
                                  const tId = assignTutorState[assign.id] || assign.tutorId;
                                  const priceInput = customPriceState[assign.id];
                                  
                                  if (!tId) {
                                    alert("Please choose an available tutor to dispatch this assignment!");
                                    return;
                                  }

                                  try {
                                    // Set price first if provided
                                    if (priceInput && !isNaN(parseFloat(priceInput))) {
                                      await onSetAssignmentPrice(assign.id, parseFloat(priceInput));
                                    }
                                    
                                    // Assign tutor
                                    await onAssignTutor(assign.id, tId);
                                    
                                    // Clear states
                                    setAssignTutorState(prev => {
                                      const next = {...prev};
                                      delete next[assign.id];
                                      return next;
                                    });
                                    setCustomPriceState(prev => {
                                      const next = {...prev};
                                      delete next[assign.id];
                                      return next;
                                    });
                                    
                                    const tName = tutorsList.find(ts => ts.id === tId)?.name || tId;
                                    alert(`Successfully dispatched Assignment #${assign.id} to ${tName}!`);
                                  } catch (err) {
                                    alert("An error occurred during dispatch. Please try again.");
                                  }
                                }}
                                className="w-full bg-orange-500 text-white font-bold text-xs py-2 rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                              >
                                <span>⚡ Confirm Direct Tutor Dispatch</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Assignments demands Table */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs text-left">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-gray-50/50">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Incoming Student Demands & Tasks</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Filter and review details of all registered briefs</span>
                  </div>
                  
                  {/* Status Filters */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'All Requests' },
                      { id: 'pending', label: '🚨 Pending/Incoming' },
                      { id: 'in_progress', label: 'In Progress' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'revision', label: 'Revision' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAssignmentFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all border ${
                          assignmentFilter === tab.id 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-xs' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-100/70 border-b border-gray-150 text-gray-600 font-bold uppercase tracking-wider">
                        <th className="p-4">Student & Project</th>
                        <th className="p-4">Academic Details</th>
                        <th className="p-4">Status & Deadline</th>
                        <th className="p-4">Quote Price Setting</th>
                        <th className="p-4 text-right">Assign Subject Tutor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {assignments
                        .filter(assign => {
                          if (assignmentFilter === 'pending') return !assign.tutorId || assign.status === AssignmentStatus.PENDING;
                          if (assignmentFilter === 'in_progress') return assign.status === AssignmentStatus.IN_PROGRESS;
                          if (assignmentFilter === 'completed') return assign.status === AssignmentStatus.COMPLETED;
                          if (assignmentFilter === 'revision') return assign.status === AssignmentStatus.REVISION;
                          return true;
                        })
                        .map(assign => {
                          const student = users.find(u => 
                            u.id.toLowerCase() === assign.studentId.toLowerCase() || 
                            u.email.toLowerCase().trim() === assign.studentId.toLowerCase().trim() ||
                            u.name.toLowerCase().trim() === assign.studentId.toLowerCase().trim()
                          );
                          const studentName = student?.name || (assign.studentId.includes('@') ? assign.studentId.split('@')[0] : assign.studentId);
                          const studentEmail = student?.email || (assign.studentId.includes('@') ? assign.studentId : `${assign.studentId.replace(/\s+/g, '.').toLowerCase()}@universitytutors.com`);
                          const tutor = users.find(u => u.id === assign.tutorId);
                          const tutorsList = users.filter(u => u.role === UserRole.TUTOR);

                        return (
                          <React.Fragment key={assign.id}>
                            <tr className="hover:bg-gray-50/70 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-gray-900 block text-xs">{assign.title}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold text-[9px] flex items-center justify-center border border-orange-200">
                                  {studentName.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-[10.5px] text-gray-700 font-semibold truncate max-w-[220px]" title={studentName}>
                                  By: {studentName}
                                </span>
                              </div>
                              <span className="text-[9.5px] text-gray-400 font-mono block mt-0.5">({studentEmail})</span>
                              <span className="inline-block text-[9px] bg-orange-100 text-orange-800 font-bold font-mono px-1.5 py-0.5 rounded-md mt-1">Ref: #{assign.id}</span>

                              {/* Interactive Actions for Admin and Tutor Persona Messaging */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminStudentDirectorySearch(studentName || studentEmail || assign.studentId);
                                    setAdminStudentDirectoryId(student?.id || assign.studentId);
                                    setActiveTab('student_profiles');
                                  }}
                                  className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                                  title="View this student's full profile & academic brief history"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const studentIdentifier = student?.id || assign.studentId;
                                    const targetTutorId = assign.tutorId || 'tutor_clara';
                                    let targetChat = chats.find(c => 
                                      c.studentId === studentIdentifier || 
                                      c.studentId.toLowerCase() === studentEmail.toLowerCase()
                                    );
                                    if (!targetChat && onGetOrCreateChat) {
                                      targetChat = onGetOrCreateChat(studentIdentifier, targetTutorId, assign.title);
                                    }
                                    if (targetChat) {
                                      onSelectChat(targetChat);
                                      setSelectedChatId(targetChat.id);
                                      setReplyAsTutor(false);
                                    }
                                    setActiveTab('chats');
                                  }}
                                  className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-gray-900 hover:bg-black text-white px-2 py-0.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                                  title="Open live chat and send messages as Platform Admin"
                                >
                                  <span>👑 Chat as Admin</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const studentIdentifier = student?.id || assign.studentId;
                                    const targetTutorId = assign.tutorId || 'tutor_clara';
                                    let targetChat = chats.find(c => 
                                      c.studentId === studentIdentifier || 
                                      c.studentId.toLowerCase() === studentEmail.toLowerCase()
                                    );
                                    if (!targetChat && onGetOrCreateChat) {
                                      targetChat = onGetOrCreateChat(studentIdentifier, targetTutorId, assign.title);
                                    }
                                    if (targetChat) {
                                      onSelectChat(targetChat);
                                      setSelectedChatId(targetChat.id);
                                      setReplyAsTutor(true);
                                    }
                                    setActiveTab('chats');
                                  }}
                                  className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-orange-500 hover:bg-orange-600 text-white px-2 py-0.5 rounded-md transition-colors shadow-2xs cursor-pointer"
                                  title={`Open live chat and send messages as assigned tutor (${tutor?.name || 'Tutor'})`}
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  <span>🎓 Chat as Tutor</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickTextAssignId(quickTextAssignId === assign.id ? null : assign.id);
                                    setQuickTextSuccess(null);
                                    setQuickTextPersona(assign.tutorId ? 'tutor' : 'admin');
                                  }}
                                  className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-2xs cursor-pointer border ${
                                    quickTextAssignId === assign.id
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                  title="Quick inline text sender: send text directly to student as Admin or Tutor with audio chime"
                                >
                                  <Send className="w-2.5 h-2.5" />
                                  <span>⚡ Quick Text</span>
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-gray-800 block text-[11px]">{assign.subject}</span>
                              <p className="text-[10.5px] text-gray-500 line-clamp-2 mt-0.5">{assign.instructions}</p>
                              {assign.fileNames && assign.fileNames.length > 0 && (
                                <div className="space-y-0.5 mt-1">
                                  {assign.fileNames.map((fn, idx) => {
                                    const url = (assign.fileUrls && assign.fileUrls[idx]) ? assign.fileUrls[idx] : `https://universitytutors.com/uploads/${encodeURIComponent(fn)}`;
                                    return (
                                      <a 
                                        key={idx} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        download 
                                        className="inline-flex items-center gap-1 text-[9.5px] text-orange-600 hover:text-orange-800 font-bold underline mr-2 transition-colors cursor-pointer"
                                        title={`Download ${fn}`}
                                      >
                                        📎 {fn}
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-sans">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                assign.status === AssignmentStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' :
                                assign.status === AssignmentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>{assign.status}</span>
                              <span className="text-[10px] text-gray-500 font-bold block mt-1.5 font-mono">📅 {assign.deadline}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1.5">
                                <span className="font-bold text-gray-900 text-xs block">Price: {assign.quoteAmount ? `$${assign.quoteAmount}` : 'Unpriced'}</span>
                                <div className="flex gap-1 max-w-[120px]">
                                  <input 
                                    type="number"
                                    id={`price-input-${assign.id}`}
                                    placeholder="Amount ($)"
                                    value={customPriceState[assign.id] || ''}
                                    onChange={(e) => setCustomPriceState({...customPriceState, [assign.id]: e.target.value})}
                                    className="w-full bg-gray-50 border py-1 px-1.5 text-[10.5px] font-bold rounded-lg focus:outline-none"
                                  />
                                  <button
                                    onClick={async () => {
                                      const p = parseFloat(customPriceState[assign.id]);
                                      if (!isNaN(p)) {
                                        await onSetAssignmentPrice(assign.id, p);
                                        setCustomPriceState({...customPriceState, [assign.id]: ''});
                                        alert(`Successfully set Assignment #${assign.id} quote price to $${p}!`);
                                      }
                                    }}
                                    className="bg-gray-950 text-white rounded-lg px-2 hover:bg-orange-500 font-bold text-[10px] cursor-pointer"
                                  >
                                    Set
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[11px] uppercase font-bold text-gray-500 mt-1 block">
                                  Assigned: <b>{tutor ? tutor.name : '🚨 None'}</b>
                                </span>
                                <div className="flex gap-1 items-center flex-wrap justify-end">
                                  <select
                                    id={`tutor-select-${assign.id}`}
                                    value={assignTutorState[assign.id] || assign.tutorId || ''}
                                    onChange={(e) => setAssignTutorState({...assignTutorState, [assign.id]: e.target.value})}
                                    className="bg-gray-55 border py-1 px-1.5 rounded-lg text-[10.5px] max-w-[150px] font-bold"
                                  >
                                    <option value="">-- Choose Tutor --</option>
                                    {tutorsList.map(t => (
                                      <option key={t.id} value={t.id}>{t.name} (★{t.rating})</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={async () => {
                                      const tId = assignTutorState[assign.id] || assign.tutorId;
                                      if (tId) {
                                        await onAssignTutor(assign.id, tId);
                                        const tName = tutorsList.find(ts => ts.id === tId)?.name || tId;
                                        
                                        // Auto-create/sync chat room with student and tutor
                                        const studentIdentifier = student?.id || assign.studentId;
                                        if (onGetOrCreateChat) {
                                          const chat = onGetOrCreateChat(studentIdentifier, tId, assign.title);
                                          onSendMessage(
                                            chat.id,
                                            currentUser.id,
                                            `🎉 Hello! Tutor ${tName} has been assigned to coordinate "${assign.title}". You can now discuss requirements and milestones directly in this room.`
                                          );
                                        }

                                        alert(`Assignment #${assign.id} has been successfully dispatched to Tutor ${tName}! Chat room synchronized.`);
                                      }
                                    }}
                                    className="bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-orange-600 transition-all cursor-pointer shadow-xs"
                                  >
                                    Assign
                                  </button>

                                  {assign.tutorId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const studentIdentifier = student?.id || assign.studentId;
                                        let targetChat = chats.find(c => c.studentId === studentIdentifier || c.studentId.toLowerCase() === studentEmail.toLowerCase());
                                        if (!targetChat && onGetOrCreateChat) {
                                          targetChat = onGetOrCreateChat(studentIdentifier, assign.tutorId!, assign.title);
                                        }
                                        if (targetChat) {
                                          onSelectChat(targetChat);
                                          setSelectedChatId(targetChat.id);
                                        }
                                        setActiveTab('chats');
                                      }}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
                                      title="Open active chat room for this task"
                                    >
                                      <MessageSquare className="w-3 h-3 text-orange-600" />
                                      <span>Chat</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Quick Inline Direct Text Dispatch Row */}
                          {quickTextAssignId === assign.id && (
                            <tr key={`quick-text-row-${assign.id}`} className="bg-amber-50/75 border-y-2 border-amber-300 animate-fade-in">
                              <td colSpan={5} className="p-4">
                                <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm space-y-3">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                          Direct Text Dispatcher
                                        </span>
                                        <span className="text-xs font-bold text-gray-900 font-sans">
                                          Send message to: {studentName} ({studentEmail})
                                        </span>
                                      </div>
                                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                                        Regarding brief: <span className="font-semibold text-gray-700">"{assign.title}"</span>
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => audioNotifier.playReceivedSound()}
                                        className="text-[10px] font-bold text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 border border-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                        title="Test melodic chime music"
                                      >
                                        <span>🎵 Test Chime Music</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuickTextAssignId(null);
                                          setQuickTextMessage('');
                                          setQuickTextSuccess(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                                        title="Close quick text box"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>

                                  {/* Persona Selection */}
                                  <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 font-mono">Choose Identity Persona:</span>
                                    
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold select-none text-[11px]">
                                      <input
                                        type="radio"
                                        name={`persona-${assign.id}`}
                                        checked={quickTextPersona === 'admin'}
                                        onChange={() => setQuickTextPersona('admin')}
                                        className="accent-gray-900"
                                      />
                                      <span className={quickTextPersona === 'admin' ? 'text-gray-950 underline underline-offset-2 font-extrabold' : 'text-gray-500'}>
                                        👑 Send as Platform Admin ({currentUser.name})
                                      </span>
                                    </label>

                                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold select-none text-[11px]">
                                      <input
                                        type="radio"
                                        name={`persona-${assign.id}`}
                                        checked={quickTextPersona === 'tutor'}
                                        onChange={() => setQuickTextPersona('tutor')}
                                        className="accent-orange-600"
                                      />
                                      <span className={quickTextPersona === 'tutor' ? 'text-orange-700 underline underline-offset-2 font-extrabold' : 'text-gray-500'}>
                                        🎓 Send as Assigned Tutor ({tutor?.name || 'Dr. Clara Stirling'})
                                      </span>
                                    </label>
                                  </div>

                                  {/* Message Input & Dispatch */}
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={quickTextMessage}
                                        onChange={(e) => setQuickTextMessage(e.target.value)}
                                        onKeyDown={async (e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!quickTextMessage.trim()) return;
                                            const studentIdentifier = student?.id || assign.studentId;
                                            const targetTutorId = assign.tutorId || 'tutor_clara';
                                            let targetChat = chats.find(c => 
                                              c.studentId === studentIdentifier || 
                                              c.studentId.toLowerCase() === studentEmail.toLowerCase()
                                            );
                                            if (!targetChat && onGetOrCreateChat) {
                                              targetChat = onGetOrCreateChat(studentIdentifier, targetTutorId, assign.title);
                                            }
                                            if (targetChat) {
                                              const senderId = quickTextPersona === 'tutor' ? targetTutorId : currentUser.id;
                                              await onSendMessage(targetChat.id, senderId, quickTextMessage.trim());
                                              audioNotifier.playSentSound();
                                              setQuickTextSuccess(`Text sent as ${quickTextPersona === 'tutor' ? (tutor?.name || 'Tutor') : 'Platform Admin'} to ${studentName}!`);
                                              setQuickTextMessage('');
                                            }
                                          }
                                        }}
                                        placeholder={`Type text to student as ${quickTextPersona === 'tutor' ? (tutor?.name || 'Assigned Tutor') : 'Platform Admin'}... (press Enter to send)`}
                                        className="flex-1 bg-white border border-gray-300 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 shadow-2xs"
                                      />
                                      <button
                                        type="button"
                                        disabled={!quickTextMessage.trim() || quickTextSending}
                                        onClick={async () => {
                                          if (!quickTextMessage.trim()) return;
                                          setQuickTextSending(true);
                                          try {
                                            const studentIdentifier = student?.id || assign.studentId;
                                            const targetTutorId = assign.tutorId || 'tutor_clara';
                                            let targetChat = chats.find(c => 
                                              c.studentId === studentIdentifier || 
                                              c.studentId.toLowerCase() === studentEmail.toLowerCase()
                                            );
                                            if (!targetChat && onGetOrCreateChat) {
                                              targetChat = onGetOrCreateChat(studentIdentifier, targetTutorId, assign.title);
                                            }
                                            if (targetChat) {
                                              const senderId = quickTextPersona === 'tutor' ? targetTutorId : currentUser.id;
                                              await onSendMessage(targetChat.id, senderId, quickTextMessage.trim());
                                              audioNotifier.playSentSound();
                                              setQuickTextSuccess(`Text sent as ${quickTextPersona === 'tutor' ? (tutor?.name || 'Tutor') : 'Platform Admin'} to ${studentName}!`);
                                              setQuickTextMessage('');
                                            }
                                          } catch (err: any) {
                                            alert(`Failed to send message: ${err.message || 'Error'}`);
                                          } finally {
                                            setQuickTextSending(false);
                                          }
                                        }}
                                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{quickTextSending ? 'Sending...' : 'Send Text Now 🚀'}</span>
                                      </button>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                      <span className="text-gray-400 font-semibold">Templates:</span>
                                      {[
                                        "Hello! Your assignment brief has been reviewed and accepted. We are proceeding now.",
                                        "Hi, please check your uploaded reference materials to verify page count.",
                                        "Good news! Your tutor has submitted the first draft milestone for your review."
                                      ].map((preset, pIdx) => (
                                        <button
                                          key={pIdx}
                                          type="button"
                                          onClick={() => setQuickTextMessage(preset)}
                                          className="bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200 transition-colors truncate max-w-[260px] cursor-pointer"
                                          title={preset}
                                        >
                                          {preset}
                                        </button>
                                      ))}
                                    </div>

                                    {quickTextSuccess && (
                                      <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-between animate-fade-in">
                                        <span>✅ {quickTextSuccess}</span>
                                        <span className="text-[10px] text-emerald-600 font-mono">Chime music played</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS & INVOICES LEDGER VIEW */}
          {activeTab === 'payments_ledger' && (
            <div className="space-y-6" id="admin-payments-ledger">
              <div className="bg-white rounded-3xl border border-gray-140 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Transactional Payments & Invoice Accounts</h3>
                <p className="text-xs text-gray-400 mt-1">Review balance billing cycles, send automated overdue payment email notifications directly to student portals, and settle balances instantly.</p>
                
                {/* Advanced summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-5">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Completed Revenue</span>
                    <span className="text-xl font-bold font-mono mt-1 text-emerald-900 block">
                      ${invoices.filter(i => i.status === 'paid').reduce((a,b) => a + Number(b.totalAmount), 0)}
                    </span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">Overdue Balance Due</span>
                    <span className="text-xl font-bold font-mono mt-1 text-rose-900 block">
                      ${invoices.filter(i => i.status === 'due' || i.status === 'pending').reduce((a,b) => a + Number(b.balanceAmount), 0)}
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Pending Escrows</span>
                    <span className="text-xl font-bold font-mono mt-1 text-amber-900 block">
                      ${payments.filter(p => p.status === 'escrow').reduce((a,b) => a + Number(b.amount), 0)}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Invoices Issued</span>
                    <span className="text-xl font-bold font-mono mt-1 text-gray-900 block">{invoices.length} Invoices</span>
                  </div>
                </div>

                {/* Filters container row */}
                <div className="flex flex-wrap items-center gap-2 mt-6 p-1 bg-gray-100 rounded-xl max-w-lg">
                  {(['all', 'due', 'paid', 'pending', 'uninvoiced'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setInvoiceTabFilter(f)}
                      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        invoiceTabFilter === f 
                          ? 'bg-white text-gray-950 shadow-xs' 
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {f === 'uninvoiced' ? 'Uninvoiced' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoices listings card */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs text-left">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Invoice Ledger Directory</span>
                  <span className="text-[10px] font-semibold text-orange-600">{invoices.filter(inv => {
                    if (invoiceTabFilter === 'all') return true;
                    return inv.status === invoiceTabFilter;
                  }).length} Matching entries</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-100/70 border-b border-gray-150 text-gray-600 font-bold uppercase tracking-wider">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Student & Subject</th>
                        <th className="p-4">Payment breakdown</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions Desk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {invoices.filter(inv => {
                        if (invoiceTabFilter === 'all') return true;
                        return inv.status === invoiceTabFilter;
                      }).map(invoice => (
                        <tr key={invoice.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4 font-mono font-bold text-orange-600">
                            #{invoice.id.toUpperCase()}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-gray-900 block">{invoice.studentName}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{invoice.serviceSubject}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="text-[11px] block">Total: <b className="text-gray-900">${invoice.totalAmount}</b></span>
                              <span className="text-[10px] text-gray-500 block">AdvancePaid: <b className="text-emerald-600">${invoice.advanceAmount}</b></span>
                              <span className="text-[10px] text-gray-500 block">Remaining: <b className="text-rose-600">${invoice.balanceAmount}</b></span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-gray-500 font-bold">
                            {invoice.dueDate}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                              invoice.status === 'due' ? 'bg-red-100 text-red-800' :
                              invoice.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-450'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <div className="flex justify-end gap-1.5 flex-wrap items-center">
                              <button
                                onClick={() => setSelectedInvoiceForPreview(invoice)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-850 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer border border-gray-200"
                                title="Open detailed billing contract preview with full dispatch action wizard"
                              >
                                Preview & Send
                              </button>
                              
                              {invoice.status !== 'paid' && (
                                <button
                                  onClick={async () => {
                                    const res = await onSettleInvoice(invoice.id, 'paid');
                                    if (res) {
                                      alert(`Succeeded in manually settling Invoice #${invoice.id} for ${invoice?.studentName}!`);
                                    }
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
                                >
                                  Settle Payment
                                </button>
                              )}

                              <div className="flex items-center gap-1 bg-gray-100 border border-gray-205 p-1 rounded-lg shrink-0">
                                <select
                                  id={`quick-dispatch-${invoice.id}`}
                                  defaultValue="both"
                                  className="bg-transparent text-[9.5px] font-extrabold text-gray-700 focus:outline-none cursor-pointer"
                                >
                                  <option value="both">Both</option>
                                  <option value="email">Email</option>
                                  <option value="webapp">In-App</option>
                                </select>
                                <button
                                  onClick={async () => {
                                    const selectEl = document.getElementById(`quick-dispatch-${invoice.id}`) as HTMLSelectElement | null;
                                    const val = selectEl?.value as 'email' | 'webapp' | 'both' || 'both';
                                    const title = `📄 Invoice Issued: #${invoice.id}`;
                                    const message = `Hello ${invoice.studentName}, a balance invoice statement has been issued or updated for academic assistance on: "${invoice.serviceSubject}". Total: $${invoice.totalAmount}, Paid: $${invoice.advanceAmount}, Remaining: $${invoice.balanceAmount}. Due on: ${invoice.dueDate}. Please check your accounting portal.`;
                                    const ok = await onSendNotification(title, message, invoice.studentId, val);
                                    if (ok) {
                                      alert(`Invoice #${invoice.id} successfully transmitted via ${val.toUpperCase()} directly to Student: ${invoice.studentName}!`);
                                    }
                                  }}
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                  title="Transmit invoice document details directly to Student"
                                >
                                  ✉️ Send
                                </button>
                              </div>

                              {invoice.status !== 'paid' && (
                                <button
                                  onClick={async () => {
                                    const ok = await onSendMissingPaymentNotification(invoice.id);
                                    if (ok) {
                                      alert(`Direct email notification & webapp alert successfully transmitted to student inbox for missing balance on Invoice #${invoice.id}!`);
                                    }
                                  }}
                                  className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
                                  title="Send remainder notice of missing payment directly via email"
                                >
                                  ⚠️ Remind Overdue
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CREATE INVOICE VIEW PANEL */}
          {activeTab === 'create_invoice' && (
            <div className="space-y-6" id="admin-create-invoice-desk">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Invoicing Desk Generator</h3>
                <p className="text-xs text-gray-400 mt-1">Generate official verified business invoice contracts for client students. Real-time visual sandbox rendered to the right.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Form Module */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!invStudentId || !invSubject || !invTotal || !invDueDate) {
                      alert("Please fill in Student selection, Subject Specialty, Total cost and Target due date!");
                      return;
                    }
                    const totalNum = Number(invTotal);
                    const advNum = Number(invAdvance) || 0;
                    const balNum = totalNum - advNum;
                    const studentUser = users.find(u => u.id === invStudentId);

                    try {
                      const newInvoiceId = await onCreateInvoice({
                        studentId: invStudentId,
                        studentName: studentUser?.name || 'Academic Student',
                        studentEmail: studentUser?.email || '',
                        serviceSubject: invSubject,
                        description: invDesc,
                        details: invDetails,
                        totalAmount: totalNum,
                        advanceAmount: advNum,
                        balanceAmount: balNum,
                        dueDate: invDueDate,
                        status: 'pending'
                      });

                      if (invDispatchOption !== 'none') {
                        const title = `📄 New Academic Invoice Issued: #${newInvoiceId}`;
                        const message = `Hello ${studentUser?.name || 'Student'}, a new invoice of $${totalNum} has been generated for academic assistance: "${invSubject}". Due Date: ${invDueDate}. Remaining Balance: $${balNum}. Please review details inside your client portal.`;
                        await onSendNotification(title, message, invStudentId, invDispatchOption);
                      }

                      alert(`Success! Invoice #${newInvoiceId} created and registered. Dispatch completed via ${invDispatchOption.toUpperCase()}!`);
                      setInvStudentId('');
                      setInvSubject('');
                      setInvDesc('');
                      setInvDetails('');
                      setInvTotal('');
                      setInvAdvance('');
                      setInvDueDate('');
                      setInvDispatchOption('both');
                    } catch (err) {
                      alert("Error generating invoice.");
                    }
                  }}
                  className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4 text-xs font-semibold text-left"
                >
                  <h4 className="font-bold text-sm text-gray-950 border-b pb-2 mb-4 uppercase tracking-wider font-sans">Billing Specifications Form</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Choose Student Client *</label>
                    <select
                      id="inv-student-select"
                      required
                      value={invStudentId}
                      onChange={(e) => setInvStudentId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="">-- Choose student from directory --</option>
                      {users.filter(u => u.role === UserRole.STUDENT).map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Services Subject *</label>
                    <input 
                      type="text"
                      id="inv-subject-input"
                      required
                      placeholder="e.g. Statistical Thesis Data Analysis"
                      value={invSubject}
                      onChange={(e) => setInvSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Scope Subjects Description *</label>
                    <textarea 
                      id="inv-description"
                      required
                      rows={2}
                      placeholder="e.g. 5,000 words draft guidance, APA citation implementation, data modeling using D3 visualizations."
                      value={invDesc}
                      onChange={(e) => setInvDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Optional Billing Details (Private Reference)</label>
                    <textarea 
                      id="inv-optional-details"
                      rows={1}
                      placeholder="e.g. Approved and calculated under extreme 48 hours delivery multiplier."
                      value={invDetails}
                      onChange={(e) => setInvDetails(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Total Amount ($) *</label>
                      <input 
                        type="number"
                        id="inv-total-input"
                        required
                        min="0"
                        placeholder="Total USD"
                        value={invTotal}
                        onChange={(e) => setInvTotal(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Advance Amount Paid ($)</label>
                      <input 
                        type="number"
                        id="inv-advance-input"
                        min="0"
                        placeholder="Advance USD"
                        value={invAdvance}
                        onChange={(e) => setInvAdvance(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">Balance Payment Due Date *</label>
                    <input 
                      type="date"
                      id="inv-due-date"
                      required
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider text-orange-600">Dispatch Notification to Student on Creation</label>
                    <select
                      id="inv-dispatch-select"
                      value={invDispatchOption}
                      onChange={(e) => setInvDispatchOption(e.target.value as any)}
                      className="w-full bg-orange-50 border border-orange-200 p-2.5 rounded-xl font-bold focus:outline-none text-orange-950 text-xs"
                    >
                      <option value="both">⚡ Send to BOTH channels (Simulated Email & in-app alert)</option>
                      <option value="email">📧 Send Simulated Email Notification</option>
                      <option value="webapp">🔔 Send In-App Push Notification banner</option>
                      <option value="none">🔕 Do Not Dispatch (Keep Private Draft / Send Later)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    id="submit-create-invoice-btn"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase p-3 rounded-xl transition-all cursor-pointer shadow-sm tracking-widest mt-2"
                  >
                    Generate & Store Invoice Contract
                  </button>
                </form>

                {/* Live Invoice Preview Sandbox */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6 text-left relative overflow-hidden font-sans">
                  <div className="absolute right-0 top-0 bg-orange-50 text-orange-700 text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl border-l border-b border-orange-100">
                    Live System Draft rendering
                  </div>
                  
                  <div className="border-b pb-4 flex justify-between items-end">
                    <div>
                      <span className="text-xl font-extrabold text-gray-900 tracking-tight block font-sans">ACADEMIC TUTORS LTD</span>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wide font-semibold mt-1">Global Education Advisory Advisory Services</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-600 block font-mono">#INV-DRAFT</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase">DATE: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">BILL TO:</span>
                      <span className="font-bold text-gray-800 block">
                        {users.find(u => u.id === invStudentId)?.name || '______________________ (Client Student)'}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                        {users.find(u => u.id === invStudentId)?.email || 'student@domain.edu'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">TERMS & DEADLINE:</span>
                      <span className="font-bold text-gray-800 block">Payment Cycle Due</span>
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5 font-mono">
                        DUE: {invDueDate || 'Not set yet'}
                      </span>
                    </div>
                  </div>

                  {/* Summary of Line items */}
                  <div className="border rounded-xl bg-gray-50/50 p-4 space-y-3 mt-4 text-xs">
                    <div className="border-b pb-2 flex justify-between font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                      <span>Item description / Subject line</span>
                      <span>Total Cost</span>
                    </div>
                    <div className="flex justify-between items-start pt-1">
                      <div className="max-w-xs">
                        <span className="font-bold text-gray-900 block">{invSubject || 'No Subject entered'}</span>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{invDesc || 'Enter description metrics in the form to generate draft...'}</p>
                      </div>
                      <span className="font-mono font-bold text-gray-900">${invTotal || '0.00'}</span>
                    </div>
                  </div>

                  {/* Pricing Sums */}
                  <div className="space-y-1.5 text-xs text-right max-w-xs ml-auto border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gross Subtotal:</span>
                      <span className="font-mono font-bold text-gray-900">${invTotal || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Advance Escrow Deposit Credit:</span>
                      <span className="font-mono font-bold text-emerald-600">-${invAdvance || '0.00'}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-2 text-sm">
                      <span className="font-bold text-gray-900">BALANCE OUTSTANDING DUE:</span>
                      <span className="font-mono font-black text-rose-600">${(Number(invTotal) || 0) - (Number(invAdvance) || 0)}</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 text-center border-t pt-4 italic">
                    Certified secured payment processed via Academic Escrow Desk protocol. Thank you for your studies.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* BROADCAST NOTIFICATIONS HUB VIEW */}
          {activeTab === 'notifications' && (
            <div className="space-y-6" id="admin-broadcast-notifs">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Broadcast Notifications & Alarm Dispatch</h3>
                <p className="text-xs text-gray-400 mt-1">Broadcast high-impact announcements, scheduled downtime, or emergency alert directives. Supports in-app push logs and SMTP email simulation.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Dispatch Form (Column 1) */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!notifTitle || !notifMessage) {
                      alert("Please specify a Title and Alert message text!");
                      return;
                    }
                    const ok = await onSendNotification(notifTitle, notifMessage, notifTargetUserId, notifChannel);
                    if (ok) {
                      alert("Corporate broadcast transmitted successfully! Added to live logging feed.");
                      setNotifTitle('');
                      setNotifMessage('');
                    } else {
                      alert("Failed to deliver broadcast.");
                    }
                  }}
                  className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4 text-xs font-semibold lg:col-span-1"
                >
                  <h4 className="font-bold text-sm text-gray-950 border-b pb-2 uppercase tracking-wider font-sans">Dispatch Transmitter form</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-650 block mb-1 uppercase tracking-wider">Target Recipient Audience</label>
                    <select
                      value={notifTargetUserId}
                      onChange={(e) => setNotifTargetUserId(e.target.value)}
                      className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="all">📢 ALL Registered Students & Tutors</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.role.toUpperCase()}: {u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-650 block mb-1 uppercase tracking-wider">Communication Channel</label>
                    <select
                      value={notifChannel}
                      onChange={(e) => setNotifChannel(e.target.value as any)}
                      className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="webapp">🔔 In-App Push Banner Alert Only</option>
                      <option value="email">✉️ SMTP Server Email Distribution Only</option>
                      <option value="both">⚡ BOTH (Push Banner and Direct Email)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-655 block mb-1 uppercase tracking-wider">Notification Title Line *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Critical Scheduled Server Database Upgrades"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-655 block mb-1 uppercase tracking-wider">Broadcaster Alert message *</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter full details including timelines or actions required."
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-655 text-white font-bold p-3 rounded-xl uppercase tracking-widest cursor-pointer shadow-xs text-[10px] mt-2 block"
                  >
                    Broadcast Announcement Now
                  </button>
                </form>

                {/* Broadcast Registry (Column 2 & 3) */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-sm text-gray-950 border-b pb-2 uppercase tracking-wider font-sans">Recent Dispatch Transmission Logs</h4>
                  
                  {appNotifications.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-xs font-sans">
                      No notifications sent in this session hierarchy yet. Active live synchronization logs will record here.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto">
                      {appNotifications.map(notif => {
                        const targetUser = users.find(u => u.id === notif.userId);
                        return (
                          <div key={notif.id} className="p-4 border rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors text-xs">
                            <div className="flex justify-between items-start gap-3">
                              <span className="font-bold text-gray-950 block text-sm">{notif.title}</span>
                              <span className="bg-orange-50 text-orange-700 text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-widest font-mono">
                                {notif.type}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2 font-medium leading-relaxed font-sans">{notif.message}</p>
                            <div className="flex justify-between items-center text-[10px] mt-4 border-t pt-2 border-dashed border-gray-200 text-gray-450 font-mono">
                              <span>Recipient: <b>{notif.userId === 'all' ? '📢 All Audiences' : targetUser ? targetUser.name : notif.userId}</b></span>
                              <span>{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK LEDGER VIEW */}
          {activeTab === 'feedback' && (
            <div className="space-y-6" id="admin-feedback-ledger">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Tutors Feedback Ledger & Quality Control</h3>
                <p className="text-xs text-gray-400 mt-1">Review student ratings, constructive feedback and critiques on system tutors. Maintain high pedagogical compliance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-2xl border bg-white shadow-xs">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Average Tutor Rating</span>
                  <span className="text-2xl font-bold font-mono text-gray-900 block mt-1">★ 4.88 / 5.0</span>
                </div>
                <div className="p-4 rounded-2xl border bg-white shadow-xs">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Compliance Index</span>
                  <span className="text-2xl font-bold font-mono text-gray-900 block mt-1">99.4% Green</span>
                </div>
                <div className="p-4 rounded-2xl border bg-white shadow-xs">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Escrow Released Consensus</span>
                  <span className="text-2xl font-bold font-mono text-gray-900 block mt-1">95.6% Agree</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs text-left">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Tutor Performance Testimonials</span>
                </div>
                
                <div className="p-6 divide-y divide-gray-100">
                  {[
                    { id: 'rev_1', tutorName: 'Clara Stirling', studentName: 'Alex Mercer', rating: 5, comment: 'Exceptional academic precision! Explanations on quantitative ANOVA formulas were unbelievably fluid and easy to wrap my head around. Highly recommended!', date: 'June 12, 2026' },
                    { id: 'rev_2', tutorName: 'Dr. Evelyn Foster', studentName: 'Alex Mercer', rating: 5, comment: 'Unparalleled mastery of historical analytical metrics. Evelyn Foster provided stellar guidance format revisions for my major bibliography.', date: 'June 10, 2026' },
                    { id: 'rev_3', tutorName: 'Thomas Vance', studentName: 'Lunn', rating: 4, comment: 'Thomas has excellent React proficiency! Applet debugging parameters were well guided, though slight coordination delay on timezone.', date: 'May 28, 2026' }
                  ].map(rev => (
                    <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                        <div>
                          <span className="font-bold text-gray-950">Review for: {rev.tutorName}</span>
                          <span className="text-[10px] text-gray-450 block">By Student: {rev.studentName} ({rev.date})</span>
                        </div>
                        <span className="text-orange-600 font-bold font-mono tracking-tighter text-sm bg-orange-50 border border-orange-150 px-2 py-0.5 rounded-lg">
                          {'★'.repeat(rev.rating)} ({rev.rating} / 5)
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium italic leading-relaxed pl-2 border-l-2 border-orange-500 mt-2 font-sans">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STANDARD OPERATING PROCEDURES (SOPS) VIEW */}
          {activeTab === 'sops' && (
            <div className="space-y-6" id="admin-sops-desk">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">University Tutors Standard Operating Procedures (SOPs) Matrix</h3>
                <p className="text-xs text-gray-400 mt-1">Authorized internal protocols, training manuals, compliance sheets and corporate guidelines.</p>
              </div>

              {/* Add SOP Manual Module */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!sopTitleInput || !sopContentInput) {
                      alert("Please specify a SOP Manual Title and full procedural details!");
                      return;
                    }
                    alert(`SOP Document published to the Matrix! Title: "${sopTitleInput}". Available to all authorized staff.`);
                    setSopTitleInput('');
                    setSopContentInput('');
                  }}
                  className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4 text-xs font-semibold lg:col-span-1"
                >
                  <h4 className="font-bold text-sm text-gray-950 border-b pb-2 uppercase tracking-wider font-sans text-orange-600">Publish New SOP Protocol</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-650 block mb-1 uppercase tracking-wider">SOP Category Specialty</label>
                    <select
                      value={sopCategory}
                      onChange={(e) => setSopCategory(e.target.value)}
                      className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="Escrow dispute procedures">Escrow dispute procedures</option>
                      <option value="Tutor onboarding and conduct">Tutor onboarding and conduct</option>
                      <option value="Emergency refund arbitration">Emergency refund arbitration</option>
                      <option value="Quality assurance guidelines">Quality assurance guidelines</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-650 block mb-1 uppercase tracking-wider">SOP Document Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. SOP-04: Escrow Resolution Guide"
                      value={sopTitleInput}
                      onChange={(e) => setSopTitleInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-650 block mb-1 uppercase tracking-wider">Statement of Operating Procedures *</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Write comprehensive procedural instructions..."
                      value={sopContentInput}
                      onChange={(e) => setSopContentInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-xl uppercase tracking-widest cursor-pointer shadow-xs text-[10px] mt-2 block"
                  >
                    Publish SOP Document
                  </button>
                </form>

                {/* Published SOPs Board */}
                <div className="lg:col-span-2 space-y-4">
                  {[
                    { id: 'sop_1', title: 'SOP-01: Escalation & Disputes Flow', category: 'Escrow dispute procedures', author: 'Root Administrator', date: 'May 04, 2026', body: 'In the event of custom revision disputes, administrators must arbitrate using chat histories. Release 100% of escrow ONLY upon delivery checkmarks matching requirements. If tutors go silent, issue full swift refunds within 24 hours.' },
                    { id: 'sop_2', title: 'SOP-02: Live Presence & Chat Protocol', category: 'Tutor onboarding and conduct', author: 'Academic Directorate', date: 'June 01, 2026', body: 'Tutors must engage students with high-frequency live typing presence when coordinating final draft briefs. Any offline status stretching over 48 hours is subject to suspension warnings.' },
                    { id: 'sop_3', title: 'SOP-03: Quality Assurance Plagiarism Checks', category: 'Quality assurance guidelines', author: 'Director of Studies', date: 'June 10, 2026', body: 'All assignment reports submitted by tutors must be accompanied by Turnitin originality report files. Revisions must be completed within 24 hours of feedback receipt.' }
                  ].map(sop => (
                    <div key={sop.id} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-3 flex-wrap gap-2">
                        <div>
                          <span className="font-bold text-gray-900 block text-sm font-sans">{sop.title}</span>
                          <span className="text-[10px] font-bold text-orange-600 font-mono block mt-1 uppercase tracking-widest">{sop.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 font-mono block">By: {sop.author}</span>
                          <span className="text-[9px] text-gray-400 font-mono block">Date: {sop.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-650 mt-4 leading-relaxed font-sans font-medium whitespace-pre-wrap">{sop.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENT REPORTS DESK */}
          {activeTab === 'reports' && (
            <div className="space-y-6" id="admin-reports-desk">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Academic Assignment Submission Reports</h3>
                <p className="text-xs text-gray-400 mt-1">Review finalized assignment files and summaries submitted by subject tutors. Approve and dispatch directly to student portals or reject for revisions instantly.</p>
              </div>

              {/* Reports Dashboard list */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs text-left">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Tutors Assignment Reports Ledger</span>
                  <span className="text-[10px] font-semibold text-orange-600 font-mono">{assignmentReports.length} Submitted Reports</span>
                </div>

                {assignmentReports.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs font-sans space-y-2">
                    <span>💡 <b>No reports registered in live Cloud PostgreSQL.</b> Showing simulated system audit reports below:</span>
                    <div className="max-w-xl mx-auto p-4 border border-dashed rounded-2xl bg-gray-50/50 space-y-3 mt-4 text-left font-sans shadow-xs">
                      <div className="flex justify-between font-bold text-gray-950 text-[11px]">
                        <span>Report Ref #REP-9003 - APA Microeconomics Thesis Work</span>
                        <span className="text-amber-600 font-bold uppercase text-[9px] tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Review</span>
                      </div>
                      <p className="text-gray-500 font-medium text-[10.5px]">Author: Tutor Clara Stirling • Student Client: Alex Mercer • Project ID: assign_7891.<br/>Checklist notes: Completed full bibliography citing 12 peer-reviewed JSTOR studies. Formatted under proper APA 7 guidelines. Plagiarism matches checked at 1.4% with Turnitin.</p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-dashed">
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg cursor-pointer">Approve & Send to Student</button>
                        <button className="bg-amber-550 hover:bg-amber-665 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg cursor-pointer">Send Back to Revise</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 p-6 space-y-6">
                    {assignmentReports.map(rep => (
                      <div key={rep.id} className="space-y-4 text-xs font-semibold">
                        <div className="bg-gray-55 p-4 border rounded-3xl flex justify-between items-start flex-wrap gap-2">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-900 text-sm block">#{rep.id.toUpperCase()}: {rep.assignmentTitle}</span>
                            <span className="text-[10px] text-gray-450 block font-mono">
                              By Tutor: <b>{rep.tutorName}</b> (ID: {rep.tutorId}) for Student ID: {rep.studentId}
                            </span>
                            <span className="inline-block text-[9px] font-bold font-mono text-orange-750 bg-orange-50 border border-orange-100 rounded-md px-1.5 py-0.5">
                              Associated Project ID: #{rep.assignmentId}
                            </span>
                          </div>
                          
                          <div className="text-right font-sans">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              rep.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              rep.status === 'revision_requested' ? 'bg-red-100 text-red-000' :
                              'bg-amber-100 text-amber-800'
                            }`}>{rep.status.split('_').join(' ')}</span>
                            <span className="text-[9.5px] text-gray-400 font-mono block mt-1.5">{new Date(rep.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pl-4 border-l-2 border-orange-500 py-1 font-medium leading-relaxed font-sans text-gray-700">
                          {rep.reportNotes}
                        </div>

                        {rep.attachmentUrl && (
                          <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                              <span className="truncate font-mono">Tutor Submitted Solution Document File</span>
                            </div>
                            <a 
                              href={rep.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              download 
                              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[10.5px] font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0 no-underline"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Solution Doc</span>
                            </a>
                          </div>
                        )}

                        {rep.feedbackFromAdmin && (
                          <div className="bg-red-50 text-red-800 p-3.5 rounded-2xl text-[10.5px] font-medium border border-red-100">
                            <b>⚠️ Administrative Note / Feedback:</b> "{rep.feedbackFromAdmin}"
                          </div>
                        )}

                        <div className="flex justify-end gap-3 items-center border-t border-dashed pt-4">
                          <input 
                            type="text"
                            placeholder="Feedback / Revision request reasons..."
                            value={adminReportFeedback[rep.id] || ''}
                            onChange={(e) => setAdminReportFeedback({...adminReportFeedback, [rep.id]: e.target.value})}
                            className="bg-gray-50 border py-2 px-3 text-xs font-semibold rounded-xl max-w-md w-full focus:outline-none"
                          />
                          <button
                            onClick={async () => {
                              const note = adminReportFeedback[rep.id];
                              if (!note) {
                                alert("Please type your feedback or revision requirements in the text box first!");
                                return;
                              }
                              await onUpdateAssignmentReportStatus(rep.id, 'revision_requested', note);
                              setAdminReportFeedback({...adminReportFeedback, [rep.id]: ''});
                              alert(`Report #${rep.id} rejected. Return notification successfully dispatched to Tutor.`);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            Send for Revision
                          </button>
                          
                          {rep.status !== 'approved' && (
                            <button
                              onClick={async () => {
                                await onUpdateAssignmentReportStatus(rep.id, 'approved');
                                alert(`Success! Assignment Report #${rep.id} approved and officially sent to the student. Escalation released.`);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              Approve & Send to Student
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STUDENT CO-SIGN AGREEMENTS LIST */}
          {activeTab === 'agreements' && (
            <div className="space-y-6" id="admin-agreements-matrix">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Educational Agreements & Milestone Contracts</h3>
                <p className="text-xs text-gray-400 mt-1">Configure study contracts and mutual milestones. Require client students to co-sign terms in their dashboard before releasing final submissions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Form Module */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!agrStudentId || !agrTitle || !agrTerms) {
                      alert("Please specify Student, Agreement Title and contract terms!");
                      return;
                    }
                    const stUser = users.find(u => u.id === agrStudentId);
                    try {
                      await onCreateAgreement({
                        studentId: agrStudentId,
                        studentName: stUser?.name || 'Academic Student',
                        title: agrTitle,
                        terms: agrTerms
                      });
                      alert(`Contract Agreement successfully compiled and co-sent to Student: ${stUser?.name}.`);
                      setAgrStudentId('');
                      setAgrTitle('');
                      setAgrTerms('');
                    } catch (err) {
                      alert("Error generating educational milestone agreement.");
                    }
                  }}
                  className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4 text-xs font-semibold lg:col-span-1"
                >
                  <h4 className="font-bold text-sm text-gray-950 border-b pb-2 uppercase tracking-wider font-sans text-orange-600">Draft Educational Agreement</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-655 block mb-1 uppercase tracking-wider">Choose Target Student Client *</label>
                    <select
                      required
                      value={agrStudentId}
                      onChange={(e) => setAgrStudentId(e.target.value)}
                      className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold focus:outline-none"
                    >
                      <option value="">-- Choose Student --</option>
                      {users.filter(u => u.role === UserRole.STUDENT).map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-655 block mb-1 uppercase tracking-wider">Agreement/Contract Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Master Milestone Revision Agreement"
                      value={agrTitle}
                      onChange={(e) => setAgrTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-655 block mb-1 uppercase tracking-wider">Terms of Studies Agreement *</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Specify mutual obligations, timeline limits, revision criteria and escrow consensus holds."
                      value={agrTerms}
                      onChange={(e) => setAgrTerms(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:bg-white font-medium font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-xl uppercase tracking-widest cursor-pointer shadow-xs text-[10px] mt-2 block"
                  >
                    Draft Milestone Charter
                  </button>
                </form>

                {/* Contracts Matrix Overview */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-sm text-gray-955 border-b pb-2 uppercase tracking-wider font-sans">Active Agreements Checklist Matrix</h4>
                  
                  {agreements.length === 0 ? (
                    <div className="py-12 bg-gray-50 border rounded-2xl text-center text-gray-400 text-xs font-sans">
                      No agreements created in this session database yet. Once created, they synchronize in real-time.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {agreements.map(agr => (
                        <div key={agr.id} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-3 flex-wrap gap-2">
                            <div>
                              <span className="font-bold text-gray-900 block text-sm">{agr.title}</span>
                              <span className="text-[10px] text-gray-450 block mt-1">Recipient Student: <b>{agr.studentName}</b></span>
                              <span className="inline-block text-[9px] font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 mt-1">Ref ID: #{agr.id}</span>
                            </div>
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                              agr.status === 'signed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'
                            }`}>{agr.status}</span>
                          </div>
                          
                          <p className="text-[11px] text-gray-650 leading-relaxed font-sans font-medium whitespace-pre-wrap mt-4">{agr.terms}</p>
                          
                          <div className="text-[9.5px] text-gray-400 font-mono flex justify-between items-center border-t border-dashed mt-4 pt-2">
                            <span>Sent Timestamps: {new Date(agr.sentAt).toLocaleString()}</span>
                            {agr.signedAt && <span className="text-emerald-600 font-bold">Signed: {new Date(agr.signedAt).toLocaleString()} ✍️</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COMPREHENSIVE ACTIVITY SECURITY LOG TRACKER */}
          {activeTab === 'activity_log' && (
            <div className="space-y-6" id="admin-activity-logs">
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Corporate Audit Security Activity Logging</h3>
                <p className="text-xs text-gray-400 mt-1">Real-time auditing of administrative, tutor, and student events. This system tracks manual interventions, payment settling, and tutor dispatches.</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs text-left">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Streaming audit logs ({activityLogs.length})</span>
                  <span className="text-[8.5px] bg-red-100 text-red-750 font-bold px-1.5 py-0.5 rounded uppercase font-mono">Live Session logs active</span>
                </div>

                <div className="overflow-hidden mt-4">
                  {activityLogs.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-xs font-sans">
                      No system events registered in this session yet. Events will record in real-time upon assignment pricing, contract edits, and notifications broadcasts!
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-[10.5px] max-h-[500px] overflow-y-auto pr-2">
                      {activityLogs.map(log => (
                        <div key={log.id} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-gray-55 transition-colors">
                          <div className="flex justify-between text-[10px] pb-1 border-b border-dashed border-gray-200 text-gray-400 font-medium">
                            <span>User: {log.userName} ({log.userRole.toUpperCase()}) • ID: {log.userId}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="mt-2 font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {log.action}
                          </div>
                          {log.details && (
                            <p className="text-[10px] text-gray-450 font-semibold mt-1 bg-white p-1 rounded border leading-relaxed">
                              {log.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OPERATIONAL CHATS monitor PANEL */}
          {activeTab === 'chats' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs space-y-6 p-6" id="admin-chats-monitor-panel">
              <div className="border-b border-gray-100 pb-4 text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700 uppercase tracking-widest border border-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span> Live Systems Monitoring Deck
                </span>
                <h3 className="font-sans font-bold text-lg text-gray-950 mt-1">Operational Support &amp; Chat Control Desk</h3>
                <p className="text-xs text-gray-400 mt-1">Audit, join or purge active student-tutor conversations. Enforce strict syllabus compliance rules and secure billing escrows.</p>
              </div>

              {chats.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-950 font-bold block">No ongoing conversations registered</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto p-2">Tutor matching synchronization is active. When students choose services or post assignment briefs, their live rooms will instantiate here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                  {/* LEFT COLUMN: CHAT ROOMS DIRECTORY */}
                  <div className="lg:col-span-4 border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/40 flex flex-col">
                    <div className="bg-gray-100/80 p-3.5 border-b border-gray-150 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Chats Directory ({chats.length})</span>
                    </div>

                    <div className="divide-y divide-gray-150 overflow-y-auto max-h-[500px] flex-1">
                      {chats.map((c) => {
                        const student = users.find(u => u.id === c.studentId);
                        const tutor = users.find(u => u.id === c.tutorId);
                        const lastMsg = messages.filter(m => m.chatId === c.id).sort(
                          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        )[0];

                        const isSelected = selectedChatId === c.id;

                        return (
                          <div 
                            key={c.id}
                            onClick={() => setSelectedChatId(c.id)}
                            className={`p-3.5 text-left transition-all cursor-pointer select-none space-y-2 relative border-l-4 ${
                              isSelected 
                                ? 'bg-white border-l-orange-500 shadow-xs' 
                                : 'border-l-transparent hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-xs text-gray-900 leading-tight truncate max-w-[140px]" title={c.subject || 'Direct Consultation'}>
                                  {c.subject || 'Direct Consultation'}
                                </h4>
                                <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
                                  ID: <span className="font-mono">{c.id.split('_')[1] || c.id}</span>
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you absolutely sure you want to permanently delete this entire chat history? All message receipts will be purged.")) {
                                    onDeleteChat(c.id);
                                    if (selectedChatId === c.id) setSelectedChatId(null);
                                  }
                                }}
                                className="text-gray-400 hover:text-red-550 p-1 hover:bg-red-50 rounded transition-colors shrink-0"
                                title="Permanently Purge Chat logs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1 block text-[10.5px]">
                              <p className="text-gray-650">
                                <span className="text-gray-450">👨‍🎓 Student:</span> <span className="font-bold text-gray-850">{student?.name || 'Unknown Student'}</span>
                              </p>
                              <p className="text-gray-655">
                                <span className="text-gray-450">🎓 Tutor:</span> <span className="font-bold text-gray-855">{tutor?.name || 'Unassigned Tutor'}</span>
                              </p>
                            </div>

                            {lastMsg ? (
                              <p className="text-[10px] text-gray-400 truncate italic font-medium leading-none">
                                "{lastMsg.content.replace(/\*\*|__/g, '')}"
                              </p>
                            ) : (
                              <p className="text-[10px] text-gray-350 italic font-medium leading-none">
                                No messages exchanged yet.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: WORKSPACE MONITOR */}
                  <div className="lg:col-span-8 border border-gray-150 rounded-2xl overflow-hidden flex flex-col justify-between bg-white">
                    {selectedChat && selectedChatId ? (
                      <div className="flex flex-col h-full justify-between">
                        {/* Selected Chat info heading */}
                        <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between items-center text-left shrink-0">
                          <div>
                            <span className="text-[9px] font-mono bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-100 font-bold uppercase tracking-wider">
                              Monitoring Console Active
                            </span>
                            <h4 className="font-bold text-sm text-[#0B1528] mt-1">
                              Topic: {selectedChat.subject}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                              Student ID: <span className="font-bold text-gray-750">{users.find(u => u.id === selectedChat.studentId)?.name}</span> • 
                              Tutor ID: <span className="font-bold text-gray-750">{users.find(u => u.id === selectedChat.tutorId)?.name}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTestChatConnection(selectedChatId)}
                              disabled={testingChatConnectionId === selectedChatId}
                              className="text-xs bg-white hover:bg-gray-55 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Verify if onSnapshot subscription is active and query last 5 messages"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${testingChatConnectionId === selectedChatId ? 'animate-spin' : ''}`} />
                              <span>{testingChatConnectionId === selectedChatId ? 'Testing...' : 'Test Connection'}</span>
                            </button>
                            <button
                              onClick={() => onSelectChat(selectedChat)}
                              className="text-xs bg-gray-950 hover:bg-black text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              title="Join communication session in normal UI view overlay"
                            >
                              <span>Open In Drawer Workspace</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                          </div>
                        </div>

                        {/* SHARED STUDENT DOCUMENTS VAULT BAR */}
                        {selectedChat && (
                          <div className="px-4 py-2.5 bg-orange-50/60 border-b border-orange-200/60 text-left shrink-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-orange-600" />
                                <span>Student Documents &amp; Attachments Vault</span>
                              </span>
                              <span className="text-[9.5px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                                {(() => {
                                  const chatDocs = activeChatMessages.filter(m => m.fileUrl);
                                  const studentAssignments = assignments.filter(a => a.studentId === selectedChat.studentId);
                                  const assignDocsCount = studentAssignments.reduce((acc, a) => acc + (a.fileUrls?.length || 0) + (a.tutorWorkFileUrl ? 1 : 0), 0);
                                  return chatDocs.length + assignDocsCount;
                                })()} Docs Available
                              </span>
                            </div>

                            {(() => {
                              const chatDocs = activeChatMessages.filter(m => m.fileUrl).map(m => ({
                                name: m.fileName || 'Chat Attachment',
                                url: m.fileUrl!,
                                source: 'Chat File',
                                date: new Date(m.timestamp).toLocaleDateString()
                              }));

                              const studentAssignments = assignments.filter(a => a.studentId === selectedChat.studentId);
                              const assignDocs: { name: string; url: string; source: string; date: string }[] = [];
                              studentAssignments.forEach(a => {
                                if (a.fileUrls && a.fileUrls.length > 0) {
                                  a.fileUrls.forEach((url, idx) => {
                                    assignDocs.push({
                                      name: (a.fileNames && a.fileNames[idx]) ? a.fileNames[idx] : `Assignment Doc #${idx + 1}`,
                                      url,
                                      source: `Assignment: ${a.title.slice(0, 20)}...`,
                                      date: new Date(a.createdAt).toLocaleDateString()
                                    });
                                  });
                                }
                                if (a.tutorWorkFileUrl) {
                                  assignDocs.push({
                                    name: a.tutorWorkFileName || 'Final Solution Work',
                                    url: a.tutorWorkFileUrl,
                                    source: 'Tutor Solution Work',
                                    date: new Date(a.createdAt).toLocaleDateString()
                                  });
                                }
                              });

                              const allDocs = [...chatDocs, ...assignDocs];

                              if (allDocs.length === 0) {
                                return (
                                  <p className="text-[10px] text-gray-500 italic">No document files attached in this chat room or assignment order yet.</p>
                                );
                              }

                              return (
                                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                                  {allDocs.map((doc, idx) => (
                                    <div key={idx} className="bg-white border border-orange-200/80 p-1.5 rounded-xl flex items-center gap-2 shrink-0 max-w-[210px] shadow-2xs">
                                      <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-gray-900 truncate leading-tight" title={doc.name}>{doc.name}</p>
                                        <p className="text-[8.5px] text-gray-400 truncate leading-tight">{doc.source}</p>
                                      </div>
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        download
                                        className="p-1 bg-orange-100 hover:bg-orange-500 text-orange-700 hover:text-white rounded-lg transition-colors shrink-0"
                                        title="Download document file"
                                      >
                                        <Download className="w-3 h-3" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {chatConnectionResult && chatConnectionResult.chatId === selectedChatId && (
                          <div className={`p-4 border-b text-left text-xs font-sans space-y-3.5 ${
                            chatConnectionResult.error 
                              ? 'bg-red-50/75 border-red-150' 
                              : chatConnectionResult.active 
                                ? 'bg-emerald-50/75 border-emerald-150' 
                                : 'bg-amber-50/75 border-amber-150'
                          }`}>
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-[12px] flex items-center gap-1.5">
                                {chatConnectionResult.error ? (
                                  <>
                                    <WifiOff className="w-4 h-4 text-red-600" />
                                    <span className="text-red-900">PostgreSQL Listener Diagnostics: Connection Failure</span>
                                  </>
                                ) : chatConnectionResult.active ? (
                                  <>
                                    <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                                    <span className="text-emerald-900">PostgreSQL Listener Diagnostics: ACTIVE &amp; CONNECTED</span>
                                  </>
                                ) : (
                                  <>
                                    <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
                                    <span className="text-amber-900">PostgreSQL Listener Diagnostics: STANDBY / OFFLINE</span>
                                  </>
                                )}
                              </h5>
                              <button 
                                onClick={() => setChatConnectionResult(null)}
                                className="text-gray-400 hover:text-gray-600 font-bold p-0.5"
                                title="Dismiss diagnostics console"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                              <div className="space-y-1">
                                <span className="text-gray-400 font-semibold block">SUBSCRIPTION STATE</span>
                                <span className="font-bold block text-gray-800">
                                  {chatConnectionResult.active 
                                    ? "🟢 Live Snap Listener: Active and piping updates into storeState."
                                    : "⚠️ Standby: Direct fetch successful, but active snapshot stream is unverified or currently disconnected."
                                  }
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400 font-semibold block">REMOTE DB HEALTH (POSTGRESQL)</span>
                                <span className="font-bold block text-gray-800">
                                  {chatConnectionResult.error 
                                    ? `🔴 Read Error: ${chatConnectionResult.error}` 
                                    : `🟢 OK (${chatConnectionResult.messagesCount} total messages found via direct query)`
                                  }
                                </span>
                              </div>
                            </div>

                            {/* LAST 5 MESSAGES RETRIEVED */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-extrabold block">
                                Last 5 Messages in Database (Direct PostgreSQL Isolation Audit)
                              </span>
                              {chatConnectionResult.lastMessages.length === 0 ? (
                                <div className="p-3 bg-white/50 rounded-xl border border-dashed text-center text-gray-400 italic">
                                  No database records found in this subcollection.
                                </div>
                              ) : (
                                <div className="bg-white/95 rounded-xl border border-gray-150 overflow-hidden divide-y divide-gray-100 max-h-[140px] overflow-y-auto">
                                  {chatConnectionResult.lastMessages.map((m, idx) => {
                                    const sender = users.find(u => u.id === m.senderId)?.name || m.senderId;
                                    return (
                                      <div key={idx} className="p-2.5 flex justify-between items-start gap-3 hover:bg-gray-50/50">
                                        <div className="min-w-0">
                                          <span className="font-bold text-gray-900 block truncate">{sender}:</span>
                                          <p className="text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{m.content}</p>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-mono shrink-0 whitespace-nowrap mt-0.5">
                                          {m.timestamp}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interactive Message feed scroll */}
                        <div className="p-4 space-y-3.5 overflow-y-auto max-h-[350px] min-h-[300px] flex-1 bg-gray-50/40 text-xs text-left">
                          {activeChatMessages.length === 0 ? (
                            <div className="py-20 text-center text-gray-400 italic">
                              No messages have been posted to this workspace room yet. Type below to send an admin moderation guide instruction.
                            </div>
                          ) : (
                            activeChatMessages.map((m) => {
                              const isSelf = m.senderId === currentUser.id;
                              const isSystem = m.senderId === 'system';
                              const senderUser = users.find(u => u.id === m.senderId);

                              let bubbleStyle = "bg-white border border-gray-200 text-gray-800 text-left";
                              let labelStr = senderUser?.name || 'User';

                              if (isSystem) {
                                bubbleStyle = "bg-amber-50/80 border border-amber-200 text-amber-900 border text-center font-bold font-sans tracking-wide max-w-full mx-auto md:p-3";
                                labelStr = "🚨 ACADEMIC SECURITY SYSTEM";
                              } else if (isSelf) {
                                bubbleStyle = "bg-gray-900 text-white text-left ml-auto border border-gray-900";
                                labelStr = "👑 PLATFORM ADMIN (You)";
                              } else if (senderUser?.role === UserRole.TUTOR) {
                                bubbleStyle = "bg-orange-55 border border-orange-200 text-orange-950 text-left";
                                labelStr = `🎓 TUTOR: ${senderUser.name}`;
                              } else {
                                bubbleStyle = "bg-blue-55 border border-blue-200 text-blue-950 text-left";
                                labelStr = `👨‍🎓 STUDENT: ${senderUser?.name || 'Student'}`;
                              }

                              return (
                                <div key={m.id} className={`flex flex-col space-y-1 ${isSelf ? 'items-end' : isSystem ? 'items-center' : 'items-start'}`}>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                                    {labelStr} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold ${bubbleStyle}`}>
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                    {m.fileUrl && (
                                      <div className="mt-2.5 p-2 rounded-xl bg-white/90 border border-gray-200/80 flex items-center justify-between text-xs font-normal text-gray-800 shadow-2xs">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                                          <span className="truncate font-mono font-bold text-[11px] text-gray-900">{m.fileName || 'Attachment Document'}</span>
                                        </div>
                                        <a 
                                          href={m.fileUrl} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          download
                                          className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg transition-colors shrink-0 ml-2 no-underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <Download className="w-3 h-3" />
                                          <span>Download</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Interactive message composer */}
                        <form onSubmit={handleSendAdminMessage} className="p-3.5 border-t border-gray-150 flex flex-col gap-2.5 shrink-0" id="admin-composer-form">
                          <div className="flex flex-wrap items-center gap-4 px-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[9.5px] uppercase tracking-wider font-extrabold select-none">
                              <input 
                                type="radio" 
                                name="reply-identity"
                                checked={replyAsTutor} 
                                onChange={() => setReplyAsTutor(true)}
                                className="accent-orange-550 scale-95"
                              />
                              <span className={replyAsTutor ? "text-orange-700" : "text-gray-400"}>
                                🎭 Reply as Tutor ({users.find(u => u.id === selectedChat.tutorId)?.name || 'Imaginary Tutor'})
                              </span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[9.5px] uppercase tracking-wider font-extrabold select-none">
                              <input 
                                type="radio" 
                                name="reply-identity"
                                checked={!replyAsTutor} 
                                onChange={() => setReplyAsTutor(false)}
                                className="accent-gray-900 scale-95"
                              />
                              <span className={!replyAsTutor ? "text-gray-900" : "text-gray-400"}>
                                👑 Reply as Admin ({currentUser.name})
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="p-2.5 text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" title="Attach document file">
                              <Paperclip className="w-4 h-4" />
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    setAdminAttachedFileName(file.name);
                                    setAdminAttachedFileUrl(URL.createObjectURL(file));
                                  }
                                }} 
                              />
                            </label>
                            {adminAttachedFileName && (
                              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded-lg font-mono font-bold truncate max-w-[140px] flex items-center gap-1 shrink-0">
                                📎 {adminAttachedFileName}
                                <button type="button" onClick={() => { setAdminAttachedFileName(''); setAdminAttachedFileUrl(''); }} className="text-orange-600 hover:text-red-600 ml-1 font-bold">×</button>
                              </span>
                            )}
                            <input 
                              type="text"
                              value={adminReply}
                              onChange={(e) => setAdminReply(e.target.value)}
                              placeholder={`Type message to send as ${replyAsTutor ? (users.find(u => u.id === selectedChat.tutorId)?.name || 'Tutor') : 'Platform Admin'}...`}
                              className="flex-1 bg-gray-50 border border-gray-250 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 focus:bg-white"
                            />
                            <button
                              type="submit"
                              className="p-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="m-auto text-center space-y-3.5 p-6 max-w-sm">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                        <h4 className="font-bold text-sm text-[#0B1528] uppercase">Administrative Monitoring Deck</h4>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                          Select an active consultation room from the directory side panel to inspect chat message indices, post support updates, or enforce academic safety guides.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DISPUTES & ESCROW DESK */}
          {activeTab === 'disputes' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs" id="admin-disputes-desk">
              <div className="p-6 border-b border-gray-150">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Disputes Escrow Escrow desk</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium font-sans">Arbitrate transactions and release escrow fees directly if revision requests fail consensus guidelines.</p>
              </div>

              {supportTickets.length > 0 ? (
                <div className="divide-y divide-gray-100 p-6 space-y-4">
                  {supportTickets.map((t) => {
                    const student = users.find(u => u.id === t.studentId);
                    
                    // Match a payment for student to resolve
                    const matchingPayment = payments.find(p => p.status === 'escrow');

                    return (
                      <div key={t.id} id={`admin-ticket-card-${t.id}`} className="p-4 border rounded-2xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 font-sans">{t.subject} (ID: #{t.id})</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-gray-500 leading-relaxed font-sans">{t.message}</p>
                          <p className="text-[10px] text-gray-400 font-mono">By student client: {student?.name} ({student?.email})</p>
                        </div>

                        {matchingPayment && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              id={`admin-resolve-release-${t.id}`}
                              onClick={() => onResolveDispute(matchingPayment.id, 'release')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-lg text-[10px] cursor-pointer"
                            >
                              Force Release Payout (${matchingPayment.amount})
                            </button>
                            <button
                              id={`admin-resolve-refund-${t.id}`}
                              onClick={() => onResolveDispute(matchingPayment.id, 'refund')}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-lg text-[10px] cursor-pointer"
                            >
                              Force Refund Student
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-650 font-medium">No open platform disputes logged.</p>
                </div>
              )}
            </div>
          )}

          {/* CONTENT MANAGER (BLOGS) */}
          {activeTab === 'blogs' && (
            <div className="space-y-6" id="admin-blogs-content-manager">
              {/* Blog Manager Header */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs text-left animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">University Blog Manager Desk</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Audit, compose, edit, or delete student-facing blogs and educational articles directly within PostgreSQL.</p>
                  </div>
                  
                  {/* Action Controls Panel */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setEditingBlogId(null);
                        setBlogTitle('');
                        setBlogContent('');
                        setBlogImg('https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400');
                        setBlogTags('oxford, referencing, mla');
                        setIsBlogModalOpen(true);
                      }}
                      id="admin-create-blog-modal-btn"
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shadow-orange-500/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Write New Article</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to restore and overwrite the 20 default educational blogs? This will ensure all default blog posts are updated in the database.")) {
                          if (onSyncDefaultBlogs) {
                            const ok = await onSyncDefaultBlogs();
                            if (ok) {
                              alert("All 20 default blogs have been successfully synchronized and updated in PostgreSQL!");
                            } else {
                              alert("Failed to synchronize blogs with the database.");
                            }
                          }
                        }
                      }}
                      id="admin-sync-blogs-btn"
                      className="flex items-center gap-2 bg-gray-55 hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                      </svg>
                      <span>Sync 20 Default Blogs</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-6 border-dashed border-gray-150">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                    <span className="text-xs text-orange-600 block font-bold uppercase tracking-wider">Total Articles</span>
                    <span className="text-2xl font-bold font-mono text-orange-950 block mt-1">{blogs.length}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <span className="text-xs text-blue-600 block font-bold uppercase tracking-wider">Survival Guides</span>
                    <span className="text-2xl font-bold font-mono text-blue-950 block mt-1">{blogs.filter(b => b.category === 'University Survival').length}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <span className="text-xs text-emerald-600 block font-bold uppercase tracking-wider">APA Formats</span>
                    <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1">{blogs.filter(b => b.category === 'APA Guidelines').length}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                    <span className="text-xs text-purple-600 block font-bold uppercase tracking-wider">Other Topics</span>
                    <span className="text-2xl font-bold font-mono text-purple-950 block mt-1">{blogs.filter(b => b.category !== 'University Survival' && b.category !== 'APA Guidelines').length}</span>
                  </div>
                </div>
              </div>

              {/* Blogs Content Grid & Searchable Table Ledger */}
              {(() => {
                const filteredBlogs = blogs.filter(b => {
                  const query = blogSearchQuery.trim().toLowerCase();
                  if (!query) {
                    return blogCategoryFilter === 'All' || b.category === blogCategoryFilter;
                  }
                  const matchesSearch = b.title.toLowerCase().includes(query) ||
                                        b.content.toLowerCase().includes(query) ||
                                        (b.tags && b.tags.some(tag => tag.toLowerCase().includes(query))) ||
                                        b.id.toLowerCase().includes(query);
                  const matchesCategory = blogCategoryFilter === 'All' || b.category === blogCategoryFilter;
                  return matchesSearch && matchesCategory;
                });

                return (
                  <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs p-6 md:p-8 space-y-6">
                    {/* Filter & View Mode Controls Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:max-w-2xl">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search articles by title, tags, or content..."
                            value={blogSearchQuery}
                            onChange={(e) => setBlogSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-orange-500 py-2.5 pl-10 pr-4 rounded-xl text-xs font-semibold focus:outline-hidden transition-all"
                          />
                        </div>

                        {/* Category Dropdown */}
                        <div className="w-full sm:w-48">
                          <select
                            value={blogCategoryFilter}
                            onChange={(e) => setBlogCategoryFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-hidden transition-all"
                          >
                            <option value="All">All Categories</option>
                            <option value="University Survival">University Survival</option>
                            <option value="APA Guidelines">APA Guidelines</option>
                            <option value="Mathematics Tricks">Mathematics Tricks</option>
                            <option value="Legal Disclaimers">Legal Disclaimers</option>
                          </select>
                        </div>
                      </div>

                      {/* Toggle View Mode Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
                          <button
                            type="button"
                            onClick={() => setBlogViewMode('table')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              blogViewMode === 'table'
                                ? 'bg-white text-gray-950 shadow-xs'
                                : 'text-gray-500 hover:text-gray-850'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Data Table</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlogViewMode('cards')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              blogViewMode === 'cards'
                                ? 'bg-white text-gray-950 shadow-xs'
                                : 'text-gray-500 hover:text-gray-850'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Grid Cards</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Results Count Summary */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Showing <strong>{filteredBlogs.length}</strong> of {blogs.length} published articles</span>
                      {blogCategoryFilter !== 'All' && (
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-medium text-[10px]">
                          Category: {blogCategoryFilter}
                        </span>
                      )}
                    </div>

                    {filteredBlogs.length === 0 ? (
                      <div className="p-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-xs text-gray-650 font-bold">No articles match your search or filters.</p>
                        <p className="text-[11px] text-gray-400 mt-1">Try refining your keyword query or resetting the category dropdown filter.</p>
                      </div>
                    ) : blogViewMode === 'table' ? (
                      /* DATA TABLE VIEW */
                      <div className="overflow-x-auto rounded-2xl border border-gray-150">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 font-bold font-mono tracking-wider text-[10px] uppercase">
                              <th className="py-3 px-4">Article Details</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Tags</th>
                              <th className="py-3 px-4">Article ID</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredBlogs.map(b => {
                              // Define beautiful pastel badges for categories
                              let catBadgeClass = "bg-gray-50 text-gray-700 border-gray-200";
                              if (b.category === "University Survival") {
                                catBadgeClass = "bg-blue-50 text-blue-700 border-blue-100";
                              } else if (b.category === "APA Guidelines") {
                                catBadgeClass = "bg-emerald-50 text-emerald-750 border-emerald-100";
                              } else if (b.category === "Mathematics Tricks") {
                                catBadgeClass = "bg-purple-50 text-purple-750 border-purple-100";
                              } else if (b.category === "Legal Disclaimers") {
                                catBadgeClass = "bg-amber-50 text-amber-750 border-amber-100";
                              }

                              return (
                                <tr key={b.id} className="hover:bg-gray-50/70 transition-all group">
                                  <td className="py-4 px-4 max-w-sm">
                                    <div className="flex items-start gap-3">
                                      <img
                                        referrerPolicy="no-referrer"
                                        src={b.image || "https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400"}
                                        alt={b.title}
                                        className="w-12 h-12 rounded-xl object-cover border border-gray-150 shrink-0 shadow-xs"
                                      />
                                      <div className="space-y-0.5">
                                        <h4 className="font-bold text-gray-950 group-hover:text-orange-600 transition-colors line-clamp-1">{b.title}</h4>
                                        <p className="text-gray-500 text-[11px] leading-normal line-clamp-2">{b.content}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadgeClass}`}>
                                      {b.category}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                      {b.tags && b.tags.map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-gray-200">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 whitespace-nowrap font-mono text-[10.5px] text-gray-400 font-bold">
                                    #{b.id}
                                  </td>
                                  <td className="py-4 px-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        id={`admin-table-edit-blog-${b.id}`}
                                        onClick={() => {
                                          setEditingBlogId(b.id);
                                          setBlogTitle(b.title);
                                          setBlogImg(b.image);
                                          setBlogCat(b.category);
                                          setBlogContent(b.content);
                                          setBlogTags(b.tags.join(', '));
                                          setIsBlogModalOpen(true);
                                        }}
                                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold p-2 rounded-xl transition-all cursor-pointer"
                                        title="Edit Article parameters"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        id={`admin-table-delete-blog-${b.id}`}
                                        onClick={() => {
                                          if (confirm(`Are you absolutely sure you want to permanently delete blog "${b.title}"?`)) {
                                            onDeleteBlog(b.id);
                                          }
                                        }}
                                        className="text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold p-2 rounded-xl transition-all cursor-pointer"
                                        title="Delete Article permanently"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* CARDS GRID VIEW */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredBlogs.map(b => (
                          <div key={b.id} id={`admin-blog-card-${b.id}`} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col justify-between text-left">
                            <div>
                              {/* Card Header Thumbnail & Tag */}
                              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                                <img referrerPolicy="no-referrer" src={b.image} alt={b.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                <span className="absolute top-3 left-3 bg-gray-950/85 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                                  {b.category}
                                </span>
                              </div>
                              
                              {/* Card Body */}
                              <div className="p-5 text-left space-y-2">
                                <h4 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1">{b.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{b.content}</p>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {b.tags.map((tag, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Card Actions Footer */}
                            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                              <span className="text-[10px] text-gray-400 font-mono font-bold">ID: #{b.id}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`admin-edit-blog-${b.id}`}
                                  onClick={() => {
                                    setEditingBlogId(b.id);
                                    setBlogTitle(b.title);
                                    setBlogImg(b.image);
                                    setBlogCat(b.category);
                                    setBlogContent(b.content);
                                    setBlogTags(b.tags.join(', '));
                                    setIsBlogModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-[10.5px] transition-all cursor-pointer"
                                  title="Edit article parameters"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  id={`admin-delete-blog-${b.id}`}
                                  onClick={() => {
                                    if (confirm(`Are you absolutely sure you want to permanently delete blog "${b.title}"?`)) {
                                      onDeleteBlog(b.id);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-[10.5px] transition-all cursor-pointer"
                                  title="Delete article permanently"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* INTERACTIVE PREMIUM BLOG FORM MODAL */}
              {isBlogModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="admin-blog-modal-backdrop">
                  <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 relative border border-gray-100 shadow-2xl overflow-y-auto max-h-[92vh] text-left animate-slide-up" id="admin-blog-modal-container">
                    {/* Modal Close Button */}
                    <button
                      id="admin-blog-modal-close"
                      onClick={() => {
                        setIsBlogModalOpen(false);
                        setEditingBlogId(null);
                        setBlogTitle('');
                        setBlogContent('');
                        setBlogImg('https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400');
                        setBlogTags('oxford, referencing, mla');
                        setSelectedTemplate('none');
                        setEditorActiveTab('write');
                      }}
                      className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    {/* Modal Header */}
                    <div className="mb-6">
                      <span className="text-[10px] font-mono tracking-widest text-orange-500 font-bold block uppercase mb-1">
                        {editingBlogId ? 'Database Entry Editor' : 'Create Database Entry'}
                      </span>
                      <h3 className="font-bold text-lg text-gray-950 font-sans tracking-tight">
                        {editingBlogId ? 'Update Educational Blog' : 'Write New Blog Article'}
                      </h3>
                      <p className="text-xs text-gray-450 mt-1 font-medium leading-relaxed">
                        Fill out the metadata, inject pre-built academic outlines, and write formatted educational material inside our premium Markdown workspace.
                      </p>
                    </div>

                    {/* Pre-made Templates Selection Row */}
                    <div className="bg-orange-50/50 rounded-2xl border border-orange-100/70 p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>Academic Outlines & Templates</span>
                        </h4>
                        <p className="text-[10.5px] text-gray-500 mt-0.5">Quickly seed the editor workspace with structured templates.</p>
                      </div>
                      <div className="w-full md:w-64 shrink-0">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => handleTemplateSelect(e.target.value)}
                          className="w-full bg-white border border-orange-200 focus:border-orange-500 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="none">-- Select Template Outline --</option>
                          <option value="apa_guide">APA 7th Citation Style Guide</option>
                          <option value="exam_prep">Scientific Study Interval Sheet</option>
                          <option value="dissertation">Thesis Framework Structure</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Modal Form */}
                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      {/* Meta Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                        <div>
                          <label htmlFor="admin-blog-input-title" className="text-[10px] font-bold text-gray-700 block mb-1 font-sans uppercase tracking-wider">Article Title *</label>
                          <input 
                            type="text" 
                            required 
                            id="admin-blog-input-title"
                            value={blogTitle} 
                            onChange={(e) => setBlogTitle(e.target.value)}
                            placeholder="e.g. MLA Formats Survival Guide" 
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-hidden transition-all" 
                          />
                        </div>
                        <div>
                          <label htmlFor="admin-blog-input-img" className="text-[10px] font-bold text-gray-700 block mb-1 font-sans uppercase tracking-wider">Image Theme URL *</label>
                          <input 
                            type="text" 
                            required 
                            id="admin-blog-input-img"
                            value={blogImg} 
                            onChange={(e) => setBlogImg(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-hidden transition-all" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                        <div>
                          <label htmlFor="admin-blog-select-category" className="text-[10px] font-bold text-gray-700 block mb-1 font-sans uppercase tracking-wider">Blog Category Focus *</label>
                          <select 
                            id="admin-blog-select-category"
                            value={blogCat} 
                            onChange={(e) => setBlogCat(e.target.value)}
                            className="w-full bg-gray-55 border border-gray-200 py-2.5 px-3.5 rounded-xl text-xs font-semibold font-sans focus:outline-hidden focus:border-orange-500"
                          >
                            <option value="University Survival">University Survival</option>
                            <option value="APA Guidelines">APA Guidelines</option>
                            <option value="Mathematics Tricks">Mathematics Tricks</option>
                            <option value="Legal Disclaimers">Legal Disclaimers</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="admin-blog-input-tags" className="text-[10px] font-bold text-gray-700 block mb-1 font-sans uppercase tracking-wider">Comma Separated Tags *</label>
                          <input 
                            type="text" 
                            required 
                            id="admin-blog-input-tags"
                            value={blogTags} 
                            onChange={(e) => setBlogTags(e.target.value)}
                            placeholder="referencing, chicago, oxford" 
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-hidden transition-all" 
                          />
                        </div>
                      </div>

                      {/* PREMIUM WORKSPACE TABBED EDITOR & TOOLBAR */}
                      <div className="border border-gray-200 rounded-2xl overflow-hidden mt-2 bg-gray-50/20">
                        {/* Tab Toggle Header */}
                        <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 bg-gray-200 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setEditorActiveTab('write')}
                              className={`px-3 py-1 rounded-md text-[10.5px] font-bold cursor-pointer transition-all ${
                                editorActiveTab === 'write' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-850'
                              }`}
                            >
                              Compose Text
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditorActiveTab('preview')}
                              className={`px-3 py-1 rounded-md text-[10.5px] font-bold cursor-pointer transition-all ${
                                editorActiveTab === 'preview' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-850'
                              }`}
                            >
                              Live Markdown Preview
                            </button>
                          </div>

                          {/* Character & Word counter */}
                          <div className="text-[10px] font-mono text-gray-400 font-bold">
                            {blogContent.trim() === '' ? 0 : blogContent.trim().split(/\s+/).length} Words | {blogContent.length} Characters
                          </div>
                        </div>

                        {/* Compose Workspace */}
                        {editorActiveTab === 'write' ? (
                          <div className="space-y-0.5">
                            {/* Formatting Markdown Toolbar */}
                            <div className="px-3 py-1.5 bg-gray-50/50 border-b border-gray-200 flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('bold')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-gray-800 transition-all cursor-pointer"
                                title="Bold (**bold**)"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('italic')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs italic text-gray-800 transition-all cursor-pointer"
                                title="Italic (*italic*)"
                              >
                                I
                              </button>
                              <div className="h-4 w-px bg-gray-200 mx-1"></div>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('h2')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-extrabold text-gray-800 transition-all cursor-pointer"
                                title="Heading 2 (## Title)"
                              >
                                H2
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('h3')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-extrabold text-gray-800 transition-all cursor-pointer"
                                title="Heading 3 (### Subtitle)"
                              >
                                H3
                              </button>
                              <div className="h-4 w-px bg-gray-200 mx-1"></div>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('bullet')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-gray-800 transition-all cursor-pointer"
                                title="Bullet List (- item)"
                              >
                                • List
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('number')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-gray-800 transition-all cursor-pointer"
                                title="Numbered List (1. item)"
                              >
                                1. List
                              </button>
                              <div className="h-4 w-px bg-gray-200 mx-1"></div>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('code')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-[10px] font-mono text-rose-600 font-bold transition-all cursor-pointer"
                                title="Code Block (```)"
                              >
                                &lt;/&gt; Code
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('quote')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-gray-850 transition-all cursor-pointer"
                                title="Blockquote (&gt; text)"
                              >
                                “ Quote
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('link')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-orange-600 transition-all cursor-pointer"
                                title="Insert Link ([text](url))"
                              >
                                🔗 Link
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToolbarClick('hr')}
                                className="px-2 py-1 rounded hover:bg-gray-200 text-xs font-bold text-gray-500 transition-all cursor-pointer"
                                title="Horizontal rule (---)"
                              >
                                — Rule
                              </button>
                            </div>

                            <textarea 
                              required 
                              ref={textareaRef}
                              id="admin-blog-textarea-content"
                              rows={10} 
                              value={blogContent} 
                              onChange={(e) => setBlogContent(e.target.value)}
                              placeholder="Write beautiful educational details here. Markdown syntax is fully supported..." 
                              className="w-full bg-white px-4 py-3.5 text-xs font-semibold focus:outline-hidden font-sans border-0 resize-y min-h-[220px]" 
                            />
                          </div>
                        ) : (
                          /* LIVE PREVIEW CANVAS PANEL */
                          <div className="bg-white p-5 min-h-[280px] overflow-y-auto max-h-[400px]">
                            <div className="text-xs text-gray-400 font-mono font-bold uppercase tracking-wider pb-2 border-b border-gray-100 mb-4 flex justify-between items-center">
                              <span>Article Preview Screen</span>
                              <span className="bg-orange-50 text-orange-600 text-[8.5px] px-1.5 py-0.5 rounded-sm">Processed HTML</span>
                            </div>
                            <div 
                              className="text-left select-text markdown-body"
                              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(blogContent) }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Modal Footer Controls */}
                      <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100 mt-6">
                        <button
                          type="button"
                          id="admin-blog-modal-cancel"
                          onClick={() => {
                            setIsBlogModalOpen(false);
                            setEditingBlogId(null);
                            setBlogTitle('');
                            setBlogContent('');
                            setBlogImg('https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=400');
                            setBlogTags('oxford, referencing, mla');
                            setSelectedTemplate('none');
                            setEditorActiveTab('write');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          id="admin-blog-modal-submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer transition-all"
                        >
                          {editingBlogId ? 'Save Article Changes' : 'Publish Article Post'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SANDBOX FAQs MANAGEMENT */}
          {activeTab === 'faqs' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 shadow-xs" id="admin-faqs-desk">
              <div className="text-left">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight border-b pb-3.5">Manage Customer FAQs</h3>
                <p className="text-xs text-gray-400 mt-1">Submit immediate QA elements regarding custom billing parameters, native tutoring flags, and refund criteria.</p>
              </div>

              <form onSubmit={handleFaqSubmit} className="space-y-4 text-left max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-1">Frequently Asked Question *</label>
                    <input 
                      type="text" 
                      required 
                      id="admin-faq-input-question"
                      value={faqQuestion} 
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      placeholder="e.g. How does the payment link process work?" 
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2 px-3 rounded-lg text-xs focus:outline-hidden font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-1">Category Domain *</label>
                    <select 
                      id="admin-faq-select-category"
                      value={faqCategory} 
                      onChange={(e) => setFaqCategory(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 py-2 px-3 rounded-lg text-xs"
                    >
                      <option value="General">General</option>
                      <option value="Payments">Payments</option>
                      <option value="Tutoring Process">Tutoring Process</option>
                      <option value="Technical Issues">Technical Issues</option>
                      <option value="Revisions & Refunds">Revisions & Refunds</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-1 font-sans">Formal Answer Textarea *</label>
                  <textarea 
                    required 
                    id="admin-faq-textarea-answer"
                    rows={3} 
                    value={faqAnswer} 
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Provide pristine answers..." 
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2 px-3 rounded-lg text-xs focus:outline-hidden" 
                  />
                </div>

                <button
                  type="submit"
                  id="admin-add-faq-btn"
                  className="bg-orange-500 hover:bg-orange-660 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg cursor-pointer transition-colors"
                >
                  Write FAQ Item
                </button>
              </form>

              {/* Display existing FAQs */}
              <div className="border-t border-gray-150 pt-6">
                <h4 className="text-xs font-bold text-gray-990 uppercase tracking-wider mb-4 font-sans">Active FAQ Ledger list:</h4>
                <div className="space-y-2">
                  {faqs.map(f => (
                    <div key={f.id} id={`admin-faq-record-${f.id}`} className="p-3.5 border rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                      <div className="text-left font-sans flex-1 max-w-xl">
                        <span className="font-bold text-gray-900 block leading-tight">{f.question}</span>
                        <span className="text-[10.5px] text-gray-400 mt-1 block leading-relaxed">{f.answer}</span>
                      </div>
                      <button
                        id={`admin-delete-faq-${f.id}`}
                        onClick={() => onDeleteFaq(f.id)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
                        title="Delete FAQ permanently"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SYLLABUS SUBJECTS CATEGORIES MANAGEMENT */}
          {activeTab === 'subjects' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs" id="admin-subjects-desk">
              <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight border-b pb-3 text-left">Academic Syllabus Specialties</h3>
              
              <form onSubmit={handleAddTopicSubmit} className="flex gap-3 max-w-sm text-left pt-4">
                <input 
                  type="text" 
                  required 
                  id="admin-subject-input"
                  value={subjectTopic}
                  onChange={(e) => setSubjectTopic(e.target.value)}
                  placeholder="e.g. Bio-engineering" 
                  className="w-full bg-gray-50 border py-2.5 px-3 rounded-xl text-xs focus:outline-hidden"
                />
                <button
                  type="submit"
                  id="admin-add-subject-btn"
                  className="bg-orange-500 hover:bg-orange-660 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm shrink-0"
                >
                  Create Category
                </button>
              </form>

              <div className="space-y-2.5 border-t pt-6 text-left mt-8">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Available Taught Domains on platform:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'English Literature', 'Essays & Editing', 'History', 'Philosophy',
                    'Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering',
                    'Psychology', 'Business Administration', 'Marketing', 'Sociology',
                    'Computer Science', 'Data Structures', 'Coding & Python', 'Database Systems',
                    'Biochemistry', 'Medicine', 'Organic Chemistry', 'Academic Lab Reports'
                  ].map((topic, i) => (
                    <span key={i} className="bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-xl font-semibold">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION & TRIGGER EMAIL DISPATCH CONSOLE */}
          {activeTab === 'trigger_emails' && (
            <div className="space-y-6 text-left animate-fade-in" id="admin-trigger-emails-desk">
              
              {/* TOP HEADER CLOUD BOARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white md:flex items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1 max-w-2xl">
                  <span className="bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold inline-block">
                    🔥 Verified PostgreSQL Cloud Extension
                  </span>
                  <h3 className="font-bold text-xl text-white font-sans tracking-tight pt-1">
                    Trigger Email Console <span className="font-mono text-xs text-orange-400 font-normal">(`smtp-mailer`)</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1 font-medium">
                    This administrative console operates directly over the official database-driven <strong className="text-white">Trigger Email from PostgreSQL</strong> extension. Writing mail documents to the secured <code className="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-[10.5px]">emails</code> collection automatically triggers the serverless SMTP pipeline. Only verified admin accounts are cleared to invoke this channel.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-3 bg-slate-800 rounded-2xl border border-slate-700/60 shrink-0 text-center">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">extension Status</div>
                  <div className="flex items-center gap-2 mt-1 justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400">ACTIVE & READY</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDE: THE SMTP MAIL DISPATCH COMPOSER */}
                <div className="xl:col-span-7 bg-white rounded-3xl border border-gray-150 p-6 shadow-xs space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">1. Dispatch Mail Form</h4>
                    <p className="text-xs text-gray-400 font-medium">Fill the fields or load templates to construct your PostgreSQL SMTP message.</p>
                  </div>

                  <form onSubmit={handleSendTriggerEmailSubmit} className="space-y-4">
                    {trEmailError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold leading-normal">
                        ⚠️ Error: {trEmailError}
                      </div>
                    )}
                    {trEmailSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold leading-normal flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{trEmailSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Fast-Load Registered User Email</label>
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            setTrEmailTo(e.target.value);
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs font-semibold focus:outline-hidden"
                      >
                        <option value="">-- Click to pick from system accounts --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.email}>
                            {u.name} ({u.role.toUpperCase()}) - {u.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Recipient Address (To)</label>
                        <input 
                          type="email"
                          placeholder="e.g. shaka.ahmadd@gmail.com"
                          value={trEmailTo}
                          onChange={(e) => setTrEmailTo(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-hidden"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Layout Template</label>
                        <select 
                          value={trEmailTemplate}
                          onChange={(e) => applyEmailTemplate(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="custom">Custom Scratchpad layout</option>
                          <option value="welcome_student">🎓 Welcome verified Student</option>
                          <option value="invoice_due">🚨 Outstanding Invoice warning</option>
                          <option value="dispute_arbitrated">🛡️ Escrow Arbitration Verdict</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Subject Title</label>
                      <input 
                        type="text"
                        placeholder="e.g. Action Required: Verification complete secure escrow holds"
                        value={trEmailSubject}
                        onChange={(e) => setTrEmailSubject(e.target.value)}
                        className="w-full bg-gray-55 border border-gray-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-hidden text-gray-900 font-semibold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">HTML Format Body</label>
                        <span className="text-[10px] font-mono text-orange-500 font-semibold">Live HTML editor</span>
                      </div>
                      <textarea 
                        rows={10}
                        placeholder="Enter direct HTML block structure here..."
                        value={trEmailHtml}
                        onChange={(e) => setTrEmailHtml(e.target.value)}
                        className="w-full bg-gray-55 border border-gray-200 font-mono py-2.5 px-3.5 rounded-xl text-xs focus:outline-hidden text-gray-750 leading-normal"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Write to `emails` PostgreSQL collection & Dispatch mail</span>
                      </button>
                    </div>
                  </form>

                  {/* HTML VISUAL OUTPUT PREVIEWER */}
                  {trEmailHtml && (
                    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-2 mt-4 text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Live Render Preview Output:</span>
                      <div 
                        className="bg-white border p-4 rounded-xl max-h-[300px] overflow-y-auto shadow-inner text-xs"
                        dangerouslySetInnerHTML={{ __html: trEmailHtml }} 
                      />
                    </div>
                  )}

                </div>

                {/* RIGHT SIDE: THE REAL-TIME POSTGRESQL DELIVERY LEDGER */}
                <div className="xl:col-span-5 space-y-4">
                  
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs">
                    <div className="border-b pb-4 mb-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-gray-950">2. Live Delivery Status Logs</h4>
                        <p className="text-xs text-gray-400 font-medium">Real-time enqueued `emails` documents tracker.</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 font-mono px-2 py-1 rounded font-bold text-slate-600">
                        Total {emails.length}
                      </span>
                    </div>

                    {emails.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 space-y-2.5">
                        <Mail className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                        <p className="text-xs font-semibold">No Triggered Email Logs recorded yet.</p>
                        <p className="text-[10.5px] leading-normal text-gray-400 max-w-xs mx-auto">
                          Documents created in the <code className="bg-gray-100 text-[9.5px] px-1 rounded font-mono">emails</code> collection will display in live PENDING, PROCESSING, and SUCCESS phases here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                        {emails.map((item) => {
                          const state = item.status?.state || 'PENDING';
                          return (
                            <div 
                              key={item.id} 
                              className="border border-gray-100 hover:border-gray-250 p-3.5 rounded-2xl bg-gray-50/50 space-y-2.5 transition-all text-left"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-gray-400 font-mono leading-none block">
                                    DOC_ID: {item.id}
                                  </span>
                                  <div className="text-xs font-bold text-gray-900 font-sans leading-snug">
                                    {item.message.subject}
                                  </div>
                                </div>
                                
                                {/* Status badge */}
                                {state === 'PENDING' && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                    PENDING
                                  </span>
                                )}
                                {state === 'PROCESSING' && (
                                  <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    PROCESSING
                                  </span>
                                )}
                                {state === 'SUCCESS' && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 uppercase tracking-wider">
                                    ✓ SUCCESS
                                  </span>
                                )}
                                {state === 'ERROR' && (
                                  <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 uppercase tracking-wider">
                                    ✗ ERROR
                                  </span>
                                )}
                              </div>

                              <div className="text-[11.5px] leading-normal text-gray-650 bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                                <p><strong>Recipient (To):</strong> <span className="font-mono text-[10.5px] text-gray-700 font-semibold">{item.to}</span></p>
                                <p><strong>Enqueued:</strong> {new Date(item.createdAt).toLocaleTimeString()}</p>
                                {item.status?.sentAt && (
                                  <p className="text-emerald-700"><strong>Sent At:</strong> {new Date(item.status.sentAt).toLocaleTimeString()}</p>
                                )}
                                {item.status?.error && (
                                  <p className="text-red-700 font-semibold"><strong>SMTP Error:</strong> {item.status.error}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* 🚀 EDIT USER PROFILE POPUP MODAL DIALOG */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left space-y-5 animate-scale-in">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 hover:bg-gray-150 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="font-bold text-lg text-gray-950 leading-tight">Edit Academic Profile</h3>
                <p className="text-[11px] text-gray-400 uppercase font-mono tracking-wider mt-0.5">
                  User ID: <span className="font-bold">{editingUser.id}</span> • Type: <span className="font-bold">{editingUser.role}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-name">Full Representative Name *</label>
                <input 
                  id="edt-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-email">Academic Email address *</label>
                <input 
                  id="edt-email"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-country">Billing Hub Country</label>
                  <select 
                    id="edt-country"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="US">🇺🇸 US</option>
                    <option value="GB">🇬🇧 UK</option>
                    <option value="CA">🇨🇦 CA</option>
                    <option value="AU">🇦🇺 AU</option>
                    <option value="NZ">🇳🇿 NZ</option>
                    <option value="IE">🇮🇪 IE</option>
                  </select>
                </div>

                {editingUser.role === UserRole.TUTOR && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-rate">Hourly Rate ($ / Hr) *</label>
                    <input 
                      id="edt-rate"
                      type="number"
                      required
                      min="15"
                      max="150"
                      value={editRate}
                      onChange={(e) => setEditRate(parseInt(e.target.value) || 35)}
                      className="w-full bg-gray-50 border border-[#E2E8F0] p-3 rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              {editingUser.role === UserRole.TUTOR && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-subjects">Specialized Syllabus Subjects (Comma Separated)</label>
                    <input 
                      id="edt-subjects"
                      type="text"
                      placeholder="Chemistry, Calculus, essays"
                      value={editSubjectList}
                      onChange={(e) => setEditSubjectList(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-avatar">Profile Image URL (Avatar)</label>
                    <input 
                      id="edt-avatar"
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase" htmlFor="edt-bio">Academic Biography Statement</label>
                    <textarea 
                      id="edt-bio"
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:bg-white font-medium"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-55 transition-colors text-xs font-bold font-sans cursor-pointer text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-655 text-white rounded-xl shadow-md transition-all text-xs font-bold font-sans cursor-pointer"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 INVOICE DETAILED VIEW & DISPATCH PORTAL MODAL */}
      {selectedInvoiceForPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-2xl w-full shadow-2xl relative text-left space-y-6 animate-scale-in">
            <button 
              onClick={() => setSelectedInvoiceForPreview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-55 hover:bg-gray-150 text-gray-400 hover:text-gray-950 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="font-bold text-lg text-gray-950 leading-tight">Academic Billing & Dispatch Hub</h3>
                <p className="text-[11px] text-gray-400 uppercase font-mono tracking-wider mt-0.5">
                  System Reference: <span className="font-bold">{selectedInvoiceForPreview.id}</span> • Status: <span className="font-bold uppercase text-orange-600">{selectedInvoiceForPreview.status}</span>
                </p>
              </div>
            </div>

            {/* Simulated Printed Invoice layout */}
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 font-sans tracking-tight">ACADEMIC TUTORS LTD</h4>
                  <span className="text-[9px] text-gray-400 block uppercase tracking-wide font-semibold mt-1">Official Advisory & Escrow Registry</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-orange-600 block font-mono">#{selectedInvoiceForPreview.id.toUpperCase()}</span>
                  <span className="text-[9px] text-gray-400 font-bold block mt-0.5">CREATED: {new Date(selectedInvoiceForPreview.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">BILLING CLIENT (STUDENT):</span>
                  <span className="font-bold text-gray-800 block">{selectedInvoiceForPreview.studentName}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">{selectedInvoiceForPreview.studentEmail || 'student@domain.edu'}</span>
                  <span className="text-[8.5px] text-gray-400 block font-mono">ID: {selectedInvoiceForPreview.studentId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">DEADLINE STATUS:</span>
                  <span className="font-bold text-gray-800 block">{selectedInvoiceForPreview.status === 'paid' ? 'Paid and Fully Settled' : 'Balance Liquidation Cycle'}</span>
                  <span className="text-[10px] text-rose-600 font-bold block mt-0.5 font-mono">DUE DATE: {selectedInvoiceForPreview.dueDate}</span>
                </div>
              </div>

              <div className="border border-gray-150 rounded-2xl bg-white p-4 space-y-2 mt-4">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Line Item Summary</span>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900 block">{selectedInvoiceForPreview.serviceSubject}</span>
                    <p className="text-[10.5px] text-gray-500 mt-1 leading-relaxed">{selectedInvoiceForPreview.description}</p>
                    {selectedInvoiceForPreview.details && (
                      <div className="bg-gray-50 border p-2 rounded-lg mt-2 font-mono text-[9.5px] text-gray-500">
                        <b>Office Notes:</b> {selectedInvoiceForPreview.details}
                      </div>
                    )}
                  </div>
                  <span className="font-mono font-bold text-gray-900 pl-4">${selectedInvoiceForPreview.totalAmount}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-right max-w-xs ml-auto border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Gross:</span>
                  <span className="font-mono font-bold text-gray-900">${selectedInvoiceForPreview.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Escrow Deposit:</span>
                  <span className="font-mono font-bold text-emerald-600">-${selectedInvoiceForPreview.advanceAmount}</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-2 text-xs">
                  <span className="font-bold text-gray-900">BALANCE REMAINING DUE:</span>
                  <span className="font-mono font-black text-rose-600">${selectedInvoiceForPreview.balanceAmount}</span>
                </div>
              </div>
            </div>

            {/* Action panel for sending / notifications */}
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-xs uppercase text-orange-950 tracking-wider">Transmit This Invoice to Student Portal</h4>
              </div>
              <p className="text-[11px] text-orange-850 font-medium">Select a communication channel to send this official statement directly to the student ({selectedInvoiceForPreview.studentName}).</p>
              
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    const title = `📄 Invoice Notification: #${selectedInvoiceForPreview.id}`;
                    const message = `Hello ${selectedInvoiceForPreview.studentName}, here are your invoice details for: "${selectedInvoiceForPreview.serviceSubject}". Total: $${selectedInvoiceForPreview.totalAmount}, Paid: $${selectedInvoiceForPreview.advanceAmount}, Remaining Balance: $${selectedInvoiceForPreview.balanceAmount}. Due on: ${selectedInvoiceForPreview.dueDate}. Please review in your accounting portal.`;
                    const ok = await onSendNotification(title, message, selectedInvoiceForPreview.studentId, 'email');
                    if (ok) {
                      alert(`Invoice successfully dispatched via simulated SMTP Email connection to ${selectedInvoiceForPreview.studentEmail || 'the student'}!`);
                    }
                  }}
                  className="bg-white hover:bg-orange-100 border border-orange-200 text-orange-950 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center font-bold transition-all cursor-pointer shadow-xs text-[10.5px]"
                >
                  <span className="text-sm">✉️</span>
                  <span>Send via Email</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const title = `📄 Invoice Issued: #${selectedInvoiceForPreview.id}`;
                    const message = `Dear ${selectedInvoiceForPreview.studentName}, a new invoice statement of $${selectedInvoiceForPreview.totalAmount} (Remaining balance due: $${selectedInvoiceForPreview.balanceAmount}) has been generated for: "${selectedInvoiceForPreview.serviceSubject}". Please clear balance by: ${selectedInvoiceForPreview.dueDate}.`;
                    const ok = await onSendNotification(title, message, selectedInvoiceForPreview.studentId, 'webapp');
                    if (ok) {
                      alert(`In-app Push alert registered on the live notifications board for ${selectedInvoiceForPreview.studentName}!`);
                    }
                  }}
                  className="bg-white hover:bg-orange-100 border border-orange-200 text-orange-950 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center font-bold transition-all cursor-pointer shadow-xs text-[10.5px]"
                >
                  <span className="text-sm">🔔</span>
                  <span>In-App Alert</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const title = `📄 Invoice Issued: #${selectedInvoiceForPreview.id}`;
                    const message = `Dear ${selectedInvoiceForPreview.studentName}, here are your invoice details for: "${selectedInvoiceForPreview.serviceSubject}". Total: $${selectedInvoiceForPreview.totalAmount}, Paid: $${selectedInvoiceForPreview.advanceAmount}, Remaining: $${selectedInvoiceForPreview.balanceAmount}. Due: ${selectedInvoiceForPreview.dueDate}. Please clear balance by deadline.`;
                    const ok = await onSendNotification(title, message, selectedInvoiceForPreview.studentId, 'both');
                    if (ok) {
                      alert(`Successful! Dual dispatch transmitted (Email Simulation and In-App Push Banner) to student portal for ${selectedInvoiceForPreview.studentName}!`);
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl flex flex-col items-center gap-1.5 text-center font-bold transition-all cursor-pointer shadow-md text-[10.5px]"
                >
                  <span className="text-sm">⚡</span>
                  <span>Send BOTH Channels</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              {selectedInvoiceForPreview.status !== 'paid' ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Manually settle Invoice #${selectedInvoiceForPreview.id} for ${selectedInvoiceForPreview.studentName}?`)) {
                      const res = await onSettleInvoice(selectedInvoiceForPreview.id, 'paid');
                      if (res) {
                        setSelectedInvoiceForPreview({
                          ...selectedInvoiceForPreview,
                          status: 'paid'
                        });
                        alert(`Invoice settled to Paid!`);
                      }
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md px-4 py-2 text-xs font-bold font-sans cursor-pointer"
                >
                  Settle to Paid Complete
                </button>
              ) : (
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-lg">✓ Settled Complete</span>
              )}
              
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPreview(null)}
                className="px-5 py-2 hover:bg-gray-55 border rounded-xl transition-colors text-xs font-bold font-sans cursor-pointer text-gray-650"
              >
                Close Gateway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
