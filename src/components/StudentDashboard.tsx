import React, { useState, useEffect } from 'react';
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
  CheckSquare,
  Upload,
  Calendar,
  Paperclip,
  Send,
  Sun,
  Moon,
  MoreHorizontal,
  AlertTriangle,
  Download,
  ThumbsUp,
  Star,
  CheckCircle,
  User as UserIcon,
  BookMarked,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Menu,
  X,
  Beaker,
  Terminal,
  TrendingUp,
  Languages,
  Activity,
  Cpu,
  Binary,
  Users,
  PenTool,
  Trash2,
  Headset,
  ShieldCheck,
  DollarSign,
  Phone,
  Video,
  MoreVertical,
  Smile,
  CheckCheck
} from 'lucide-react';
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
  Quote
} from '../types';

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
  onOpenChat: (tutorId: string, initialMessage?: string) => void;
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
  onAcceptQuote
}: StudentDashboardProps) {

  // Dynamic Viewport Navigation State matching Sidebar
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [localSelectedChatId, setLocalSelectedChatId] = useState<string | null>(null);
  const [studentReply, setStudentReply] = useState('');
  const [channelSearchFilter, setChannelSearchFilter] = useState('');
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [chatAttachedFileName, setChatAttachedFileName] = useState('');
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);

  useEffect(() => {
    if (activeTab === 'chat' && chats.length > 0) {
      const support = chats.find(c => c.studentId === currentUser.id && (c.tutorId === 'admin_emily' || c.tutorId.startsWith('admin_')));
      if (support && !localSelectedChatId) {
        setLocalSelectedChatId(support.id);
      }
    }
  }, [chats, activeTab, currentUser.id, localSelectedChatId]);

  useEffect(() => {
    if (localSelectedChatId && onSubscribeToChatDetails) {
      onSubscribeToChatDetails(localSelectedChatId);
    }
  }, [localSelectedChatId, onSubscribeToChatDetails]);

  const selectedChat = chats.find(c => c.id === localSelectedChatId);
  const activeChatMessages = messages.filter(m => m.chatId === localSelectedChatId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [revisionDetails, setRevisionDetails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Matching Funnel States & Configuration Constants
  const SERVICES = {
    '1-1-lesson': {
      title: '1-on-1 Lesson Tutoring',
      scopeTag: 'Synchronous Live',
      icon: 'users',
      description: 'Live interactive video lessons centered directly on your custom curriculum goals.',
      deliverables: [
        { id: 'session-rec', name: 'Recorded Video Session Archive', desc: 'Direct access to view or download full session videos', included: true },
        { id: 'lesson-notes', name: 'Digital Whiteboard Concept Notes', desc: 'Scribbles, formulas, and whiteboard step-by-step PDF notes', included: true },
        { id: 'practice-prep', name: 'Tailored Practice Problem Packs', desc: 'Targeted custom homework sheets and textbook-style study questions', included: false },
        { id: 'followup-qa', name: '24-Hour Active Post-Session Q&A', desc: 'Submit follow-up message queries if you hit concept roadblocks later', included: false }
      ],
      durationLabel: 'Session Duration Units',
      durationMin: 1, durationMax: 8, durationDefault: 1, durationStep: 0.5,
      durationUnit: 'Hour(s)',
      advice: {
        1: 'Excellent for resolving a single complex homework task or studying a specific question.',
        2: 'A standard comprehensive lesson structure. Gives ample time to study theory and practice problems.',
        4: 'Intensive block session. Ideal for deep exam review preps or structured homework coverage.',
        8: 'Full block coverage. We highly recommend spreading this over several separate days!'
      }
    },
    'assignment': {
      title: 'Assignment Tutoring Support',
      scopeTag: 'Task Milestones',
      icon: 'file-check-2',
      description: 'Targeted reviews, practice sheet walk-throughs, and systematic solutions.',
      deliverables: [
        { id: 'step-solutions', name: 'Detailed Annotated Analytical Workbook', desc: 'Clean chronological breakdown of methodologies, key steps, and calculations', included: true },
        { id: 'source-files', name: 'Custom Annotated Source Code / Raw Data Sheets', desc: 'Complete set of structured workspace templates, sheets, or code assets', included: true },
        { id: 'plagiarism-check', name: 'Certified Originality Similarity Scan', desc: 'Comprehensive report verifying perfect compliance with school standards', included: true },
        { id: 'abstract', name: 'Abstract', desc: 'Concise summary of your work.', included: false },
        { id: 'exec-summary', name: 'Executive Summary', desc: 'High-level overview for quick review.', included: false },
        { id: 'proofread', name: 'Proofread by Editor', desc: 'Editorial pass for grammar and flow.', included: false },
        { id: 'draft', name: 'Draft', desc: 'Receive an interim draft for review.', included: false },
        { id: 'daily-update', name: 'Daily Delivery Update', desc: 'Progress updates as the work proceeds.', included: false },
        { id: 'grammarly-report', name: 'Grammarly Report', desc: 'Quality check with Grammarly.', included: false },
        { id: 'turnitin-ai', name: 'Turnitin AI Report', desc: 'AI detection insights.', included: false },
        { id: 'turnitin-similarity', name: 'Turnitin Similarity Report', desc: 'Similarity score report.', included: false },
        { id: 'toc', name: 'Table of Contents', desc: 'Structured contents page.', included: false }
      ],
      durationLabel: 'Expected Project Window',
      durationMin: 1, durationMax: 14, durationDefault: 3, durationStep: 1,
      durationUnit: 'Day(s)',
      advice: {
        1: 'Express same-day assessment checks. Perfect for simple concept verifications.',
        3: 'Our recommended baseline window. Allows for detailed proofing and detailed reviews.',
        7: 'Deep coursework preparation schedule. Ideal for larger homework packs.',
        14: 'Extensive multi-part portfolio study. Perfect for complex semester milestones.'
      }
    },
    'coursework': {
      title: 'Sustained Coursework Tutoring',
      scopeTag: 'Continuous Study',
      icon: 'calendar-range',
      description: 'Integrated module-level coverage. Ideal for persistent checks across continuous coursework tasks.',
      deliverables: [
        { id: 'weekly-syncs', name: 'Milestone-by-Milestone Syllabus Progress Tracker', desc: 'Interactive study map aligned with your module calendar requirements', included: true },
        { id: 'milestone-grading', name: 'Weekly Live Concepts Sync & Academic Dashboard', desc: 'Active reviews checking theory comprehension and target parameters', included: true },
        { id: 'personalized-syllabus', name: 'Pre-Grading Review Checklist & Analytical Feedback', desc: 'In-depth grading rubric checks on homework drafts before submission', included: true },
        { id: 'abstract', name: 'Abstract', desc: 'Concise summary of your work.', included: false },
        { id: 'exec-summary', name: 'Executive Summary', desc: 'High-level overview for quick review.', included: false },
        { id: 'proofread', name: 'Proofread by Editor', desc: 'Editorial pass for grammar and flow.', included: false },
        { id: 'draft', name: 'Draft', desc: 'Receive an interim draft for review.', included: false },
        { id: 'daily-update', name: 'Daily Delivery Update', desc: 'Progress updates as the work proceeds.', included: false },
        { id: 'grammarly-report', name: 'Grammarly Report', desc: 'Quality check with Grammarly.', included: false },
        { id: 'turnitin-ai', name: 'Turnitin AI Report', desc: 'AI detection insights.', included: false },
        { id: 'turnitin-similarity', name: 'Turnitin Similarity Report', desc: 'Similarity score report.', included: false },
        { id: 'toc', name: 'Table of Contents', desc: 'Structured contents page.', included: false }
      ],
      durationLabel: 'Module Duration Focus',
      durationMin: 1, durationMax: 16, durationDefault: 4, durationStep: 1,
      durationUnit: 'Week(s)',
      advice: {
        1: 'A single-week sprint checklist. Best used for end-of-term focus prep.',
        4: 'One full month of active matching. Exceptional support for module-based courseworks.',
        8: 'Half-term support cycle. Comprehensive study tracking of major subject items.',
        16: 'Full semester mentorship support. Ensures continuous oversight and complete syllabus confidence.'
      }
    },
    'writing': {
      title: 'Essay Writing Coach & Review',
      scopeTag: 'Line-by-Line Review',
      icon: 'pen-tool',
      description: 'Structure advice, thesis creation, proofreading feedback, outlining, and rigorous stylistic edits.',
      deliverables: [
        { id: 'structured-draft', name: 'Detailed Thesis Formulation & Structural Blueprint', desc: 'Comprehensive conceptual outline of logical transitions and main claims', included: true },
        { id: 'citations-bib', name: 'Line-by-Line Editorial Flow & Tone Workbook', desc: 'Paragraph-by-paragraph style critiques to improve structural clarity', included: true },
        { id: 'editor-review', name: 'Meticulous Bibliography & Citation Reference Audits', desc: 'Full alignment checks (APA, MLA, Harvard, Chicago, etc.) for bibliography lists', included: true },
        { id: 'abstract', name: 'Abstract', desc: 'Concise summary of your work.', included: false },
        { id: 'exec-summary', name: 'Executive Summary', desc: 'High-level overview for quick review.', included: false },
        { id: 'proofread', name: 'Proofread by Editor', desc: 'Editorial pass for grammar and flow.', included: false },
        { id: 'draft', name: 'Draft', desc: 'Receive an interim draft for review.', included: false },
        { id: 'daily-update', name: 'Daily Delivery Update', desc: 'Progress updates as the work proceeds.', included: false },
        { id: 'grammarly-report', name: 'Grammarly Report', desc: 'Quality check with Grammarly.', included: false },
        { id: 'turnitin-ai', name: 'Turnitin AI Report', desc: 'AI detection insights.', included: false },
        { id: 'turnitin-similarity', name: 'Turnitin Similarity Report', desc: 'Similarity score report.', included: false },
        { id: 'toc', name: 'Table of Contents', desc: 'Structured contents page.', included: false }
      ],
      durationLabel: 'Target Document Size',
      durationMin: 1, durationMax: 50, durationDefault: 3, durationStep: 1,
      durationUnit: 'Page(s) (~275 words)',
      advice: {
        1: 'Quick edit review. Perfect for short personal statements or introductory statements.',
        3: 'A standard essay review length. Allows deep argument outline checks and transition improvements.',
        10: 'Term paper size review. Excellent support for comprehensive research summaries.',
        50: 'Sustained dissertation-level feedback. Broken into chapters for rigorous progress checks.'
      }
    }
  };

  const SUBJECT_SUBTOPICS: Record<string, string[]> = {
    'Mathematics': [
      'Algebra', 'Calculus', 'Statistics & Probability', 'Geometry', 'Linear Algebra', 
      'Discrete Math', 'Trigonometry', 'Differential Equations', 'Numerical Analysis', 
      'Abstract Algebra', 'Real Analysis', 'Complex Variables'
    ],
    'Science': [
      'Physics (Classical & Quantum)', 'Chemistry (Organic & Inorganic)', 'Biology & Genetics', 
      'Biochemistry', 'Earth Sciences', 'Anatomy & Physiology', 'Astronomy', 
      'Environmental Science', 'Microbiology', 'Neuroscience', 'Thermodynamics'
    ],
    'Computer Science': [
      'Intro to Programming (Python/Java/C++)', 'Algorithms & Data Structures', 'Web Development (HTML/CSS/JS/React)', 
      'Machine Learning & Data Science', 'Database Systems (SQL)', 'Cybersecurity', 
      'Software Engineering', 'Mobile App Development', 'Computer Networks', 'Cloud Computing (AWS/GCP)', 
      'Operating Systems', 'Artificial Intelligence'
    ],
    'Humanities & Social Sciences': [
      'World History', 'Psychology', 'Sociology', 'English Literature', 'Political Science', 
      'Economics (Micro & Macro)', 'Philosophy', 'Anthropology', 'International Relations', 
      'Art History', 'Criminology', 'Linguistics'
    ],
    'Business & Finance': [
      'Financial Accounting', 'Corporate Finance', 'Marketing Strategy', 'Business Law', 
      'Supply Chain Management', 'Organizational Behavior', 'Managerial Accounting', 
      'Investment Banking', 'Entrepreneurship', 'International Business', 'Microeconomics', 'Macroeconomics'
    ],
    'Languages & Test Prep': [
      'English (ESL)', 'Spanish Language & Culture', 'French Language & Culture', 
      'Mandarin Chinese', 'SAT / ACT Prep', 'GRE / GMAT Prep', 'IELTS / TOEFL Prep', 
      'MCAT Prep', 'LSAT Prep', 'German Language', 'Japanese Language'
    ]
  };

  const [funnelStep, setFunnelStep] = useState<number>(1);
  const [selectedServiceKey, setSelectedServiceKey] = useState<keyof typeof SERVICES>('1-1-lesson');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [priorityType, setPriorityType] = useState<string>('standard');
  const [premiumDeliverables, setPremiumDeliverables] = useState<Record<string, boolean>>({});
  const [customFocusInput, setCustomFocusInput] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; size: string }>>([]);
  const [studentName, setStudentName] = useState<string>(currentUser.name);
  const [studentEmail, setStudentEmail] = useState<string>(currentUser.email || '');
  const [studentLevel, setStudentLevel] = useState<string>('College');
  const [studentGoal, setStudentGoal] = useState<string>('');
  
  // Vetting Loader States
  const [matchingPhase, setMatchingPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [vettingStepOneCompleted, setVettingStepOneCompleted] = useState<boolean>(false);
  const [vettingStepTwoCompleted, setVettingStepTwoCompleted] = useState<boolean>(false);
  const [vettingStepThreeCompleted, setVettingStepThreeCompleted] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');


  // Filter lists for current student
  const studentAssignments = assignments.filter(a => a.studentId === currentUser.id);
  const studentPayments = payments.filter(p => {
    const a = assignments.find(assign => assign.id === p.assignmentId);
    return a && a.studentId === currentUser.id;
  });
  const studentTickets = supportTickets.filter(t => t.studentId === currentUser.id);
  const studentChats = chats.filter(c => c.studentId === currentUser.id);

  // Helper to find tutor details
  const getTutor = (tutorId: string) => {
    if (tutorId === 'admin_emily' || tutorId.startsWith('admin_')) {
      return {
        id: tutorId,
        name: 'Platform Support / Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: UserRole.ADMIN,
        bio: '24/7 Platform Support & Customer Service Representative Desk.'
      } as User;
    }
    return tutors.find(t => t.id === tutorId);
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

  const renderServiceIcon = (iconName: string, className = "w-5 h-5") => {
    if (iconName === 'users') return <Users className={className} />;
    if (iconName === 'file-check-2') return <CheckSquare className={className} />;
    if (iconName === 'calendar-range') return <Calendar className={className} />;
    if (iconName === 'pen-tool') return <PenTool className={className} />;
    return <BookOpen className={className} />;
  };

  // Matching Funnel Helpers & Operations Interactivities
  const selectServicePathway = (serviceKey: keyof typeof SERVICES) => {
    setSelectedServiceKey(serviceKey);
    const data = SERVICES[serviceKey];
    setSelectedDuration(data.durationDefault);
    setPremiumDeliverables({});
    setAlertMessage('');
    setTimeout(() => {
      setFunnelStep(2);
    }, 350);
  };

  const selectFunnelCategory = (subj: string) => {
    setSelectedSubject(subj);
    setSelectedSubtopic('');
    setAlertMessage('');
  };

  const selectFunnelSubtopic = (subtopic: string) => {
    setSelectedSubtopic(subtopic);
    setAlertMessage('');
    setTimeout(() => {
      setFunnelStep(3);
    }, 350);
  };

  const toggleFunnelDeliverable = (addonId: string, isChecked: boolean) => {
    setPremiumDeliverables(prev => {
      const copy = { ...prev };
      if (isChecked) {
        copy[addonId] = true;
      } else {
        delete copy[addonId];
      }
      return copy;
    });
  };

  const handleFunnelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newFiles = files.map((file: File, idx: number) => ({
        id: `file-${Date.now()}-${idx}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeUploadedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getTutorForSubject = (subj: string) => {
    if (subj === 'Mathematics') return tutors.find(t => t.id === 'tutor_liam') || tutors[0];
    if (subj === 'Science') return tutors.find(t => t.id === 'tutor_siobhan') || tutors.find(t => t.id === 'tutor_nz_kiri') || tutors[0];
    if (subj === 'Computer Science') return tutors.find(t => t.id === 'tutor_james') || tutors[0];
    if (subj === 'Humanities & Social Sciences') return tutors.find(t => t.id === 'tutor_clara') || tutors[0];
    if (subj === 'Business & Finance') return tutors.find(t => t.id === 'tutor_chloe') || tutors[0];
    if (subj === 'Languages & Test Prep') return tutors.find(t => t.id === 'tutor_clara') || tutors[0];
    return tutors[0];
  };

  const calculateMatchIndex = () => {
    let score = 0;
    if (selectedServiceKey) score += 25;
    if (selectedSubject) score += 25;
    if (selectedSubtopic) score += 15;
    if (attachedFiles.length > 0) score += 15;
    if (studentName.trim() && studentEmail.trim()) score += 20;
    return score > 100 ? 100 : score;
  };

  const navigateWizard = (direction: number) => {
    setAlertMessage('');
    if (direction === 1) {
      if (funnelStep === 1) {
        setFunnelStep(2);
      } else if (funnelStep === 2) {
        if (!selectedSubject) {
          setAlertMessage('Please pick an academic subject Category.');
          return;
        }
        if (!selectedSubtopic) {
          setAlertMessage('Please pick a specific focus subtopic.');
          return;
        }
        setFunnelStep(3);
      } else if (funnelStep === 3) {
        setFunnelStep(4);
      } else if (funnelStep === 4) {
        setFunnelStep(5);
      } else if (funnelStep === 5) {
        if (!studentName.trim()) {
          setAlertMessage("Please specify your Student Name.");
          return;
        }
        if (!studentEmail.trim()) {
          setAlertMessage("Please specify your Contact Email.");
          return;
        }
        executeMatchingPipeline();
      }
    } else {
      setFunnelStep(prev => prev - 1);
    }
  };

  const executeMatchingPipeline = () => {
    setMatchingPhase('loading');
    setVettingStepOneCompleted(false);
    setVettingStepTwoCompleted(false);
    setVettingStepThreeCompleted(false);

    // Simulated procedural steps
    setTimeout(() => {
      setVettingStepOneCompleted(true);
    }, 1100);

    setTimeout(() => {
      setVettingStepTwoCompleted(true);
    }, 2200);

    setTimeout(() => {
      setVettingStepThreeCompleted(true);
    }, 3300);

    setTimeout(() => {
      setMatchingPhase('success');

      const matchedTutor = getTutorForSubject(selectedSubject);
      const serviceData = SERVICES[selectedServiceKey];
      
      const upgrades = Object.keys(premiumDeliverables)
        .map(id => {
          const item = serviceData.deliverables.find(d => d.id === id);
          return item ? item.name : id;
        })
        .join(', ');

      const instructionsBody = `
=== University-Tutors Matching Funnel Request ===
TUTORING SERVICE PATTERN: ${serviceData.title}
ACADEMIC SUBTOPIC FOCUS: ${selectedSubtopic}
STUDENT LEVEL: ${studentLevel}
EXPECTED DURATION VALUE: ${selectedDuration} ${serviceData.durationUnit}
VETTING URGENCY PRIORITY: ${priorityType.toUpperCase()}
DELIVERABLE UPGRADES SELECTED: ${upgrades || 'None'}
STUDENT DETAILED GOALS: ${studentGoal || 'None Specified'}
CUSTOM SYLLABUS DIRECTIVES: ${customFocusInput || 'None'}
CONTACT EMAIL COMPASS: ${studentEmail}
      `.trim();

      // Submit actual assignment data payload back to PostgreSQL backend
      onSubmitAssignment({
        studentId: currentUser.id,
        title: `${selectedSubject} (${selectedSubtopic}) ${serviceData.title}`,
        subject: selectedSubject,
        deadline: selectedDate,
        wordCount: selectedServiceKey === 'writing' ? selectedDuration * 275 : 1200,
        referenceStyle: selectedServiceKey === 'writing' ? 'APA Style' : 'Not Applicable',
        sourcesCount: 3,
        instructions: instructionsBody,
        tutorId: matchedTutor ? matchedTutor.id : undefined,
        fileUrls: attachedFiles.map(f => f.name.startsWith('http') ? f.name : `https://universitytutors.com/uploads/${encodeURIComponent(f.name)}`),
        fileNames: attachedFiles.map(f => f.name)
      });

    }, 4000);
  };

  const closeSuccessModal = () => {
    // Record matched variables before clearing
    const subject = selectedSubject || 'General Study Help';
    const subtopic = selectedSubtopic || 'General';
    const duration = selectedDuration || '4 Hours';
    
    // Always route instantly to the platform admin as requested by user
    const targetTutorId = 'admin_shaka';

    setMatchingPhase('idle');
    setVettingStepOneCompleted(false);
    setVettingStepTwoCompleted(false);
    setVettingStepThreeCompleted(false);
    
    // Clear forms
    setSelectedSubject('');
    setSelectedSubtopic('');
    setCustomFocusInput('');
    setStudentGoal('');
    setAttachedFiles([]);
    setPremiumDeliverables({});
    setFunnelStep(1);
    
    // Redirect to direct chat tab
    setActiveTab('chat');

    // Trigger dynamic CSR support chat instantly
    const messageTemplate = `Hi, I just secured an optimal match for "${subject}" ("${subtopic}", scheduled for ${duration}). I am ready to decide on a payment plan and align my exact requirements with a specialist right away!`;
    onOpenChat(targetTutorId, messageTemplate);
  };

  const submitInlineRequest = (e: React.FormEvent) => {
    e.preventDefault();
    executeMatchingPipeline();
  };

  // Filter assignments by text search if provided
  const searchedAssignments = studentAssignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FDF8F6]/30 font-sans" id="student-portal-wrapper">

      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center">
          <img src="/logo.webp" alt="Uni Tutors" referrerPolicy="no-referrer" className="h-10 w-auto object-contain" />
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ============================================== */}
      {/* LEFT SIDEBAR NAVIGATION PANEL (AS IN SCREENSHOT) */}
      {/* ============================================== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#FDFBF9] border-r border-orange-100/50 flex flex-col justify-between p-4 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen lg:overflow-y-auto
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} id="student-sidebar">
        
        <div className="space-y-6">
          {/* Logo with uploaded logo image */}
          <div className="flex items-center justify-between pb-2 border-b border-orange-100/30">
            <img src="/logo.webp" alt="Uni Tutors" referrerPolicy="no-referrer" className="h-12 w-auto object-contain" id="logo-mortarboard" />
            
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden ml-auto p-1 text-gray-400 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Operations Links */}
          <nav className="space-y-1 block text-left">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'new_request', label: 'New Request', icon: <PlusSquare className="w-4 h-4 text-orange-500" /> },
              { id: 'assignments', label: 'Assignments', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'results', label: 'Results & Comments', icon: <Award className="w-4 h-4" /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { id: 'feedback', label: 'Leave Feedback', icon: <Heart className="w-4 h-4" /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans font-semibold text-[13px] transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-[#FEEFEA] text-[#E05216] scale-[1.01]' 
                    : 'text-gray-650 hover:bg-gray-100/55 hover:text-[#E05216]'
                }`}
                id={`sidebar-link-${item.id}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Splitter Line */}
            <hr className="my-4 border-t border-orange-100/30" />

            {/* Legal / Secondary Block */}
            <div className="space-y-1">
              {[
                { id: 'agreements', label: 'Service Agreements', icon: <Shield className="w-3.5 h-3.5" /> },
                { id: 'sops', label: 'SOPs', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'terms', label: 'Terms & Conditions', icon: <Info className="w-3.5 h-3.5" /> },
                { id: 'refund', label: 'Refund Policy', icon: <RotateCcw className="w-3.5 h-3.5" /> }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left truncate ${
                    activeTab === item.id
                      ? 'text-[#E05216] font-bold'
                      : 'text-gray-500 hover:text-orange-655 hover:bg-gray-50'
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Footer Account/Log Outs */}
        <div className="space-y-1 pt-4 border-t border-orange-100/30 block text-left">
          <button
            onClick={() => {
              setActiveTab('settings');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-gray-550 hover:bg-gray-100 ${
              activeTab === 'settings' ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <Settings className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-red-650 hover:bg-red-50/50 mt-1 cursor-pointer"
            id="sidebar-signout-btn"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>

      </aside>

      {/* ============================================== */}
      {/* MAIN VIEWPORT FRAME (SCROLLABLE RIGHT PANEL)  */}
      {/* ============================================== */}
      <main className="flex-1 bg-[#FAF9F7] min-h-screen flex flex-col relative pt-16 lg:pt-0 overflow-x-hidden">
        
        {/* ============================================== */}
        {/* TOP STATUSHEADER OF THE DASHBOARD             */}
        {/* ============================================== */}
        <header className="bg-white border-b border-gray-100 h-20 px-6 md:px-8 flex items-center justify-between z-30 shrink-0" id="portal-inner-header">
          
          {/* Dynamic Search Box */}
          <div className="relative w-72 max-w-sm hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 font-sans transition-all"
              id="top-services-search"
            />
          </div>

          <div className="lg:hidden" /> {/* Spacer for centering when mobile sidebar is active */}

          {/* User Profile & Actions Group */}
          <div className="flex items-center gap-4 ml-auto text-left">
            
            {/* CSR Contact Button */}
            <button
              onClick={() => {
                // Instantly open a chat with Support specialist
                onOpenChat('admin_shaka'); // Triggers Shaka Ahmad (Platform Admin)
              }}
              className="hidden sm:inline-flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-2xl text-[12px] font-bold shadow-3xs cursor-pointer transition-all"
              id="header-csr-consult"
            >
              💬 Consult with CSR
            </button>

            {/* Quick Create Button */}
            <button
              onClick={() => setActiveTab('new_request')}
              className="inline-flex items-center justify-center bg-[#FF8A00] hover:bg-[#E05216] text-white px-4 py-2 rounded-2xl text-[12px] font-bold shadow-md shadow-orange-500/10 cursor-pointer transition-all"
              id="header-create-request"
            >
              ➕ Create Request
            </button>

            {/* Notification bell and badge */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-2.5 rounded-xl text-gray-600 hover:text-orange-500 hover:bg-gray-50/80 relative transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#F23B30] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                4
              </span>
            </button>

            {/* Sun/Light Theme toggler (visual accent) */}
            <button className="p-2.5 rounded-xl text-gray-400 hover:text-orange-400 hover:bg-gray-50/85 transition-all">
              <Sun className="w-5 h-5 text-gray-500" />
            </button>

            {/* Thin Spacer */}
            <span className="h-6 w-[1px] bg-gray-200" />

            {/* User credentials */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden xl:block">
                <span className="text-[12px] font-bold text-gray-900 block leading-tight">{currentUser.name}</span>
                <span className="text-[9.5px] font-mono text-[#E05216] uppercase block tracking-wider leading-none">Verified Student</span>
              </div>
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                alt="" 
                className="w-10 h-10 rounded-full bg-orange-100 object-cover border border-orange-100/50 shadow-3xs"
              />
            </div>

          </div>

        </header>

        {/* ============================================== */}
        {/* WORKSPACE AREA RENDERING VARIOUS VIEWS        */}
        {/* ============================================== */}
        <div className="p-5 md:p-8 flex-1 overflow-y-auto space-y-8" id="portal-content-body">
          
          {/* ========================== */}
          {/* TAB 1: DASHBOARD (HOME VIEW) */}
          {/* ========================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* LARGE NAVY DARK HERO BANNER */}
              <div className="bg-[#0D1527] rounded-[28px] p-8 md:p-10 text-white relative overflow-hidden shadow-xl" id="dashboard-hero-banner">
                {/* Background decorative vector overlays */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-500/10 to-blue-500/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

                <div className="max-w-2xl space-y-4 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10.5px] font-bold text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>EXPERTS ONLINE NOW</span>
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Ace your next <span className="text-[#FF8A00]">Assignment</span>.
                  </h1>
                  
                  <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-normal">
                    Fast, reliable help for your midterms and finals. Direct coordination with top verified specialist university tutors.
                  </p>

                  <div className="pt-3 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('new_request')}
                      className="bg-[#FF8A00] hover:bg-[#E05216] text-white px-6 py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      id="hero-create-btn"
                    >
                      Create Request
                    </button>
                    
                    <button
                      onClick={() => onOpenChat('admin_shaka')}
                      className="bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 px-6 py-3 rounded-2xl text-[13px] font-bold transition-all cursor-pointer"
                      id="hero-consult-btn"
                    >
                      Consult with CSR
                    </button>
                  </div>
                </div>
              </div>

              {/* THREE MAIN QUICK STATUS METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-status-metrics">
                {[
                  { 
                    label: 'ONGOING', 
                    value: studentAssignments.filter(a => a.status !== AssignmentStatus.COMPLETED).length + 2, // adding visual count matching screenshot
                    icon: <RotateCcw className="w-5 h-5 text-blue-500" />,
                    bg: 'bg-blue-50/50',
                    border: 'border-blue-100/60'
                  },
                  { 
                    label: 'COMPLETED', 
                    value: studentAssignments.filter(a => a.status === AssignmentStatus.COMPLETED).length, 
                    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
                    bg: 'bg-emerald-50/50',
                    border: 'border-emerald-100/60'
                  },
                  { 
                    label: 'PAYMENTS', 
                    value: studentPayments.length + 2, // matches screenshot value '2'
                    icon: <CreditCard className="w-5 h-5 text-orange-500" />,
                    bg: 'bg-orange-50/50',
                    border: 'border-orange-100/60'
                  }
                ].map((card, key) => (
                  <div 
                    key={key} 
                    className={`bg-white border rounded-[22px] p-5 flex items-center justify-between shadow-xs transition-transform hover:translate-y-[-1px] ${card.border}`}
                  >
                    <div className="space-y-1">
                      <span className="text-3xl font-extrabold text-gray-950 block leading-none font-mono">
                        {card.value}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider">
                        {card.label}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl ${card.bg}`}>
                      {card.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* SERVICES SHADCN STYLE GRID SECTION */}
              <div className="space-y-4" id="dashboard-services-grid">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[15px] text-gray-900 tracking-tight">Services</h2>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { label: 'Assignments', icon: <BookOpen className="w-5 h-5 text-orange-500" />, tab: 'assignments', circleColor: 'bg-orange-50' },
                    { label: 'Support Chat', icon: <MessageSquare className="w-5 h-5 text-blue-500" />, tab: 'chat', circleColor: 'bg-blue-50' },
                    { label: 'Reports', icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, tab: 'reports', circleColor: 'bg-emerald-50' },
                    { label: 'Results', icon: <Award className="w-5 h-5 text-indigo-500" />, tab: 'results', circleColor: 'bg-indigo-50' },
                    { label: 'Feedback', icon: <Heart className="w-5 h-5 text-pink-500" />, tab: 'feedback', circleColor: 'bg-pink-50' },
                    { label: 'Alerts', icon: <Bell className="w-5 h-5 text-amber-500" />, tab: 'notifications', circleColor: 'bg-amber-50' },
                    { label: 'Billing', icon: <CreditCard className="w-5 h-5 text-purple-500" />, tab: 'payments', circleColor: 'bg-purple-50' },
                    { label: 'Legal', icon: <Shield className="w-5 h-5 text-zinc-500" />, tab: 'agreements', circleColor: 'bg-zinc-50' }
                  ].map((srv, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(srv.tab)}
                      className="bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 rounded-[22px] p-5 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group text-center"
                    >
                      <div className={`p-3 rounded-full ${srv.circleColor} group-hover:scale-105 transition-transform`}>
                        {srv.icon}
                      </div>
                      <span className="text-[12px] font-bold text-gray-700 leading-tight">
                        {srv.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RECENT REQUESTS LISTING */}
              <div className="space-y-4" id="dashboard-recent-requests">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[15px] text-gray-900 tracking-tight">Recent Requests</h2>
                  <button 
                    onClick={() => setActiveTab('assignments')}
                    className="text-[#FF8A00] hover:text-[#E05216] font-mono text-[10.5px] font-bold uppercase tracking-wider"
                  >
                    HISTORY
                  </button>
                </div>

                <div className="space-y-3">
                  
                  {/* Real-time assignments */}
                  {studentAssignments.length > 0 ? (
                    studentAssignments.slice(0, 3).map((a, i) => (
                      <div 
                        key={i} 
                        className="bg-white border border-gray-150 rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-orange-100"
                        id={`request-recent-${a.id}`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100/50 text-[#FF8A00] shrink-0">
                            {/* Dynamic asset badge representing subject */}
                            <BookMarked className="w-5 h-5 shrink-0" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-gray-400 font-mono uppercase block leading-none">
                              {a.subject}
                            </span>
                            <h3 className="font-bold text-sm text-gray-950 mt-1 leading-snug">
                              {a.title}
                            </h3>
                            <span className="text-[11px] text-gray-500 font-medium block mt-1">
                              ASSIGNED TO: <span className="text-orange-655 font-bold">{getTutor(a.tutorId)?.name || 'UNASSIGNED'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="inline-flex bg-orange-100/60 text-[#E05216] text-[10.5px] font-bold px-2.5 py-1 rounded-full uppercase leading-none font-mono">
                              {a.status}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium block mt-1.5 font-mono">
                              Due: {a.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : null}

                  {/* Fallback Biology request exact match with the screenshot mock */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-orange-100">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-100/50 text-[#FF8A00] shrink-0">
                        {/* Dynamic orange calculator/biology asset */}
                        <PlusSquare className="w-5 h-5 shrink-0" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 font-mono uppercase block leading-none">
                          Natural Sciences
                        </span>
                        <h3 className="font-bold text-sm text-gray-950 mt-1 leading-snug">
                          Biology Assignment Syllabus
                        </h3>
                        <span className="text-[11px] text-gray-500 block mt-1 font-semibold leading-none">
                          ASSIGNED TO: <span className="text-gray-400 italic">UNASSIGNED</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="inline-flex bg-orange-55 text-[#E05216] text-[9px] font-mono tracking-wider font-extrabold px-3 py-1 rounded-full uppercase">
                          NEW
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono font-medium block mt-1">
                          3/18/2026
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ================================== */}
          {/* TAB 2: UNIVERSALLY VETTED MATCHING FUNNEL */}
          {/* ================================== */}
          {activeTab === 'new_request' && (
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start animate-fade-in" id="funnel-workflow-container">
              
              {/* LEFT COLUMN: 5-STEP INTERACTIVE CONVERSION WIZARD */}
              <div className="flex-1 w-full bg-white border border-orange-100/50 rounded-[32px] shadow-xl shadow-orange-100/5 p-6 md:p-8 flex flex-col justify-between min-h-[620px] relative overflow-hidden text-left">
                {/* Visual Top Decorative Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"></div>

                <div>
                  {/* Onboarding Header Dashboard Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                        <GraduationCap className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <span className="text-base font-black tracking-tight text-gray-900 block leading-tight">University-Tutors</span>
                        <span className="text-[9px] block text-orange-600 font-extrabold tracking-widest uppercase leading-none mt-1">Cohort Onboarding</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3.5 self-start sm:self-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Match Engine Online
                      </span>
                      <span className="text-[11.5px] font-bold text-orange-600 bg-orange-50/50 px-2.5 py-0.5 rounded-lg">
                        Step {funnelStep} of 5 ({funnelStep * 20}%)
                      </span>
                    </div>
                  </div>

                  {/* Progressive Stepper Progress Bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 rounded-full transition-all duration-500" 
                      style={{ width: `${funnelStep * 20}%` }}
                    ></div>
                  </div>

                  {/* Realtime Alert Panel */}
                  {alertMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-150 text-amber-900 flex items-start gap-3 transition-all">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-amber-850">Onboarding Checklist</h4>
                        <p className="text-xs mt-0.5 text-amber-800 font-semibold">{alertMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* FUNNEL PANEL 1: CHOOSE TARGET SERVICE COHORT */}
                  {funnelStep === 1 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-700">
                          <Sparkles className="w-3 h-3" /> Step 1: Learning Pathway
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">How would you like to prepare?</h2>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Select the core tutoring model you need today. This initializes your matching algorithm.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          type="button" 
                          onClick={() => selectServicePathway('1-1-lesson')} 
                          className={`text-left relative block p-5 border-2 rounded-2xl bg-white hover:bg-orange-50/5 hover:border-orange-500 transition-all cursor-pointer group ${
                            selectedServiceKey === '1-1-lesson' ? 'border-orange-500' : 'border-gray-105 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                              <Users className="w-5.5 h-5.5" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-100/60 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-orange-755 font-mono">
                              Live Sync
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-950 text-sm">1-on-1 Lesson Tutoring</h3>
                          <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">Live face-to-face classes designed directly around your upcoming lecture curriculum.</p>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[9px] uppercase font-black text-gray-400 font-mono tracking-wider">
                            <span>Matching Window</span>
                            <span className="text-orange-600 font-extrabold">Instant Allocation</span>
                          </div>
                        </button>

                        <button 
                          type="button" 
                          onClick={() => selectServicePathway('assignment')} 
                          className={`text-left relative block p-5 border-2 rounded-2xl bg-white hover:bg-orange-50/5 hover:border-orange-500 transition-all cursor-pointer group ${
                            selectedServiceKey === 'assignment' ? 'border-orange-500' : 'border-gray-105 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                              <CheckSquare className="w-5.5 h-5.5" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-100/60 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-orange-755 font-mono">
                              Concept Checklist
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-950 text-sm">Assignment Tutoring</h3>
                          <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">Targeted reviews, step-by-step concepts prep, and practice problem milestones diagnostics.</p>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[9px] uppercase font-black text-gray-400 font-mono tracking-wider">
                            <span>Matching Window</span>
                            <span className="text-orange-600 font-extrabold">&lt; 15 Mins SLA</span>
                          </div>
                        </button>

                        <button 
                          type="button" 
                          onClick={() => selectServicePathway('coursework')} 
                          className={`text-left relative block p-5 border-2 rounded-2xl bg-white hover:bg-orange-50/5 hover:border-orange-500 transition-all cursor-pointer group ${
                            selectedServiceKey === 'coursework' ? 'border-orange-500' : 'border-gray-105 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                              <Calendar className="w-5.5 h-5.5" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-100/60 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-orange-755 font-mono">
                              Multi-Week
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-950 text-sm">Coursework Tutoring</h3>
                          <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">Continuous tutor check-ins, curriculum planning maps, and recurring exam module preparation.</p>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[9px] uppercase font-black text-gray-400 font-mono tracking-wider">
                            <span>Matching speed</span>
                            <span className="text-orange-600 font-extrabold">&lt; 30 Mins SLA</span>
                          </div>
                        </button>

                        <button 
                          type="button" 
                          onClick={() => selectServicePathway('writing')} 
                          className={`text-left relative block p-5 border-2 rounded-2xl bg-white hover:bg-orange-50/5 hover:border-orange-500 transition-all cursor-pointer group ${
                            selectedServiceKey === 'writing' ? 'border-orange-500' : 'border-gray-105 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                              <PenTool className="w-5.5 h-5.5" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-100/60 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-orange-755 font-mono">
                              Line Review
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-950 text-sm">Essay &amp; Writing Assistance</h3>
                          <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">Argument planning mapping, formatting checklist review, and stylistic revisions tutoring.</p>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[9px] uppercase font-black text-gray-400 font-mono tracking-wider">
                            <span>Matching speed</span>
                            <span className="text-orange-600 font-extrabold">&lt; 10 Mins SLA</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FUNNEL PANEL 2: ACADEMIC FOCUS CATEGORIES & DEEP SUBTOPICS */}
                  {funnelStep === 2 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700">
                          <BookOpen className="w-3" /> Step 2: Subject Domain
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">What are we studying today?</h2>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Click your primary subject field. Once highlighted, pick your target subtopic focus to advance.</p>
                      </div>

                      {/* Primary Subject Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { key: 'Mathematics', label: 'Mathematics', icon: <Binary className="w-5 h-5" /> },
                          { key: 'Science', label: 'Science', icon: <Beaker className="w-5 h-5" /> },
                          { key: 'Computer Science', label: 'Comp Science', icon: <Terminal className="w-5 h-5" /> },
                          { key: 'Humanities & Social Sciences', label: 'Humanities', icon: <BookMarked className="w-5 h-5" /> },
                          { key: 'Business & Finance', label: 'Business & Finance', icon: <TrendingUp className="w-5 h-5" /> },
                          { key: 'Languages & Test Prep', label: 'Languages & Prep', icon: <Languages className="w-5 h-5" /> }
                        ].map(sub => (
                          <button
                            key={sub.key}
                            type="button"
                            onClick={() => selectFunnelCategory(sub.key)}
                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${
                              selectedSubject === sub.key
                                ? 'border-orange-500 bg-orange-50/20 text-orange-950 shadow-md scale-[1.01]'
                                : 'border-gray-100 bg-white hover:border-orange-100 text-gray-700'
                            }`}
                          >
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                              {sub.icon}
                            </div>
                            <span className="text-xs font-bold text-center leading-tight">{sub.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Expanded Subtopic board */}
                      {selectedSubject && (
                        <div className="p-5 bg-gray-50/70 border border-gray-100 rounded-2xl animate-fade-in">
                          <span className="block text-[10.5px] font-black text-gray-400 tracking-wider uppercase mb-3 font-mono">
                            Select Subtopic Focus (Auto-advances once clicked):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {SUBJECT_SUBTOPICS[selectedSubject]?.map(subtopic => (
                              <button
                                key={subtopic}
                                type="button"
                                onClick={() => selectFunnelSubtopic(subtopic)}
                                className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                                  selectedSubtopic === subtopic
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white border text-gray-700 hover:border-orange-400 hover:bg-orange-50/20'
                                }`}
                              >
                                {selectedSubtopic === subtopic ? (
                                  <Check className="w-3.5 h-3.5 mr-1.5 text-white" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>
                                )}
                                <span>{subtopic}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual focus notes input */}
                      <div className="space-y-1">
                        <label htmlFor="funnel-custom-spec" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block font-mono">
                          Specific topics or syllabus notes (Optional)
                        </label>
                        <input 
                          type="text" 
                          id="funnel-custom-spec"
                          value={customFocusInput}
                          onChange={(e) => setCustomFocusInput(e.target.value)}
                          placeholder="e.g. Preparing for derivative proofs, MLA bibliography formatting assistance, etc..."
                          className="w-full bg-gray-55/60 border border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* FUNNEL PANEL 3: study TIMELINE & UNITS SCHEDULING */}
                  {funnelStep === 3 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-55 text-orange-700">
                          <Calendar className="w-3" /> Step 3: Study Duration
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">Timeline &amp; Schedule</h2>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Customize your study duration limit and select your target timeline delivery deadline.</p>
                      </div>

                      {/* Customized Orange Range Slider */}
                      <div className="p-5 bg-gray-50/60 border border-gray-100 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div>
                            <span className="block text-xs font-black text-gray-800 uppercase tracking-wider font-mono">
                              {SERVICES[selectedServiceKey]?.durationLabel}
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">Drag to adjust required match units.</p>
                          </div>
                          <span className="inline-flex items-center rounded-xl bg-orange-50 border border-orange-100/50 px-3.5 py-1.5 text-xs font-black text-orange-700">
                            {selectedDuration} {SERVICES[selectedServiceKey]?.durationUnit}
                          </span>
                        </div>

                        <input 
                          type="range" 
                          id="match-dur-slider"
                          min={SERVICES[selectedServiceKey]?.durationMin}
                          max={SERVICES[selectedServiceKey]?.durationMax}
                          step={SERVICES[selectedServiceKey]?.durationStep}
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500 bg-orange-100" 
                        />

                        <div className="flex justify-between text-[9px] text-gray-400 font-black tracking-wider uppercase font-mono">
                          <span>{SERVICES[selectedServiceKey]?.durationMin} unit(s)</span>
                          <span>{SERVICES[selectedServiceKey]?.durationMax} unit(s)</span>
                        </div>

                        {/* Slider dynamic Coach advice bubble */}
                        <div className="pt-4 border-t border-gray-150 flex items-start gap-2.5">
                          <div className="p-1 px-1.5 text-orange-600 bg-white border rounded-lg shadow-3xs shrink-0">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-xs text-gray-655 leading-relaxed">
                            <span className="font-extrabold text-orange-600">Coach Insight: </span>
                            {(() => {
                              const serviceData = SERVICES[selectedServiceKey];
                              const adviceKeys = Object.keys(serviceData.advice).map(Number).sort((a,b) => b-a);
                              for (let k of adviceKeys) {
                                if (selectedDuration >= k) {
                                  return (serviceData.advice as any)[k];
                                }
                              }
                              return 'Adjusting values...';
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Date selection & Priority level Select boxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="funnel-date" className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                            Target Delivery / Class Date
                          </label>
                          <input 
                            type="date" 
                            id="funnel-date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="funnel-priority" className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                            Vetting Urgency SLA
                          </label>
                          <select 
                            id="funnel-priority"
                            value={priorityType}
                            onChange={(e) => setPriorityType(e.target.value)}
                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-all"
                          >
                            <option value="standard">Standard Priority (24h Match Window)</option>
                            <option value="high">High Priority (Urgent 4h Match Window)</option>
                            <option value="critical">Critical Emergency (Immediate 1h Match Window)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FUNNEL PANEL 4: deliverables AND drag-DROP uploads */}
                  {funnelStep === 4 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-700">
                          <CheckSquare className="w-3" /> Step 4: Deliverables
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">Select Optional Deliverables</h2>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Select any additional services you require. These will be custom compiled by your assigned expert.</p>
                      </div>

                      {/* Checklist Cards Grid matching skeuomorphic checkmarks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="match-checklist-grid">
                        {SERVICES[selectedServiceKey]?.deliverables.map(del => (
                          <div 
                            key={del.id}
                            onClick={() => !del.included && toggleFunnelDeliverable(del.id, !premiumDeliverables[del.id])}
                            className={`p-4 border-2 rounded-xl transition-all select-none relative flex flex-col justify-between ${
                              del.included 
                                ? 'border-orange-100 bg-orange-50/15'
                                : premiumDeliverables[del.id]
                                  ? 'border-orange-500 bg-orange-50/20 ring-4 ring-orange-500/10 shadow-xs'
                                  : 'border-gray-50 hover:border-gray-200 bg-white cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className={`rounded-md px-1.5 py-0.5 text-[8.5px] font-bold tracking-wider uppercase border leading-none ${
                                del.included
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}>
                                {del.included ? 'Included with Plan' : 'Optional Upgrade'}
                              </span>
                              
                              <div className="flex items-center justify-center">
                                {del.included ? (
                                  <div className="w-4.5 h-4.5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : premiumDeliverables[del.id] ? (
                                  <div className="w-4.5 h-4.5 bg-orange-500 text-white rounded-md flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 bg-white border border-gray-300 rounded-md hover:border-gray-400"></div>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 text-left">
                              <h4 className="text-[12.5px] font-black text-gray-850 leading-snug">{del.name}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">{del.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Drag-drop support files */}
                      <div className="border-t border-gray-100 pt-5 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-black text-gray-850 uppercase tracking-widest font-mono">
                              Supporting Academic Sources
                            </span>
                            <p className="text-[10.5px] text-gray-400 mt-0.5">Attach custom lecture slides, rubric details, prompt documents, or templates.</p>
                          </div>
                        </div>

                        {/* Interactive upload trigger */}
                        <div 
                          onClick={() => document.getElementById('funnel-uploader-file')?.click()}
                          className="border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-2xl p-6 transition-all text-center bg-gray-50/50 hover:bg-white cursor-pointer group shadow-3xs"
                        >
                          <input 
                            type="file" 
                            id="funnel-uploader-file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,image/*,audio/*,video/*,application/*"
                            onChange={handleFunnelFileSelect}
                          />
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="w-6.5 h-6.5 text-gray-400 group-hover:text-orange-600 group-hover:scale-105 transition-all" />
                            <div>
                              <p className="text-xs font-bold text-gray-700">Drag files here, or <span className="text-orange-600 font-extrabold group-hover:text-orange-700 underline">browse folders</span></p>
                              <p className="text-[9.5px] text-gray-400 font-black mt-1 font-mono tracking-wider uppercase">PDF, DOCS, ZIP, Image, PPT, Media (Max 15MB)</p>
                            </div>
                          </div>
                        </div>

                        {/* File roster list */}
                        {attachedFiles.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                              Attached References ({attachedFiles.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {attachedFiles.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2.5 border border-gray-100 bg-white rounded-xl shadow-3xs animate-fade-in text-[11.5px]">
                                  <div className="flex items-center space-x-2.5 truncate w-[80%]">
                                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                                    </div>
                                    <div className="truncate text-left leading-none">
                                      <p className="font-extrabold text-gray-800 truncate leading-tight mb-0.5">{file.name}</p>
                                      <span className="text-[9.5px] text-gray-400 font-mono font-bold uppercase">{file.size}</span>
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); removeUploadedFile(file.id); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FUNNEL PANEL 5: LEAD CONTACT PROFILE */}
                  {funnelStep === 5 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-55 text-orange-700">
                          <UserIcon className="w-3" /> Step 5: Student Profile
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">Who should we match?</h2>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Provide your contact email option to finalize registration inside our vetting matching cohort algorithms.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label htmlFor="student-name" className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                              Student's Full Name
                            </label>
                            <input 
                              type="text" 
                              id="student-name"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              placeholder="Alex Mercer"
                              className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none transition-all placeholder:text-gray-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="student-email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                              Contact Email Address
                            </label>
                            <input 
                              type="email" 
                              id="student-email"
                              value={studentEmail}
                              onChange={(e) => setStudentEmail(e.target.value)}
                              placeholder="alex@university.edu"
                              className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none transition-all placeholder:text-gray-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="student-level" className="text-[10px] font-black text-gray-500 uppercase tracking-widest block font-mono">
                            Current Study Level
                          </label>
                          <select 
                            id="student-level"
                            value={studentLevel}
                            onChange={(e) => setStudentLevel(e.target.value)}
                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                          >
                            <option value="College">College / Undergraduate Level</option>
                            <option value="High School">High School / AP Prep Level</option>
                            <option value="Graduate School">Graduate / Doctoral Level</option>
                            <option value="Professional">Professional Development / Adult Learner</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="student-goal" className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block">
                            What is your ultimate grade/study goal? (Optional)
                          </label>
                          <textarea 
                            id="student-goal"
                            rows={3}
                            value={studentGoal}
                            onChange={(e) => setStudentGoal(e.target.value)}
                            placeholder="e.g. I need to achieve an A grade in this module and improve my understanding of calculus proofs..."
                            className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none transition-all placeholder:text-gray-300 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* BOTTOM NAVIGATION ROW */}
                <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={() => navigateWizard(-1)}
                    className={`px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 ${
                      funnelStep === 1 ? 'invisible opacity-0 pointer-events-none' : ''
                    }`}
                  >
                    <span>Go Back</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => navigateWizard(1)}
                    className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      funnelStep === 5 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/50'
                        : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100/50'
                    }`}
                  >
                    {funnelStep === 5 ? (
                      <>
                        <span>Execute Match Engine</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: SKEUOMORPHIC MATCHING LIVESTATUS DASHBOARD */}
              <div className="w-full lg:w-[340px] shrink-0 text-left">
                <div className="sticky top-24 bg-white border border-gray-100 rounded-[28px] shadow-xl overflow-hidden flex flex-col justify-between">
                  
                  {/* Dashboard Live ticket Stub Header */}
                  <div className="p-5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2 text-left leading-none">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Activity className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest font-mono">Matching Live Panel</span>
                    </div>

                    <span className={`text-[10px] font-black tracking-wider text-white px-2.5 py-0.5 rounded-full ${
                      calculateMatchIndex() === 100 ? 'bg-emerald-500 animate-bounce' : 'bg-orange-650'
                    }`}>
                      {calculateMatchIndex()}% Match
                    </span>
                  </div>

                  {/* Core stub ticket details */}
                  <div className="p-5 space-y-4 relative">
                    
                    {/* User profile brief */}
                    {funnelStep === 5 && (
                      <div className="space-y-1.5 animate-fade-in">
                        <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono">Student Profile</span>
                        <div className="bg-orange-50/45 border border-orange-100/50 p-3 rounded-lg text-left">
                          <p className="text-xs font-black text-orange-950 truncate leading-none mb-1">{studentName || 'Not specified'}</p>
                          <p className="text-[9.5px] text-orange-700 font-semibold truncate leading-none">{studentEmail || 'Provide step 5 credentials'}</p>
                        </div>
                      </div>
                    )}

                    {/* Selected Service style pathway block */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono">Selected Pathway</span>
                      <div className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-left truncate">
                        <div className="p-2 bg-white text-orange-600 rounded-lg shadow-3xs border border-gray-100">
                          {renderServiceIcon(SERVICES[selectedServiceKey]?.icon, "w-4 h-4")}
                        </div>
                        <div className="truncate leading-none">
                          <h4 className="text-xs font-black text-gray-950 truncate">{SERVICES[selectedServiceKey]?.title}</h4>
                          <span className="text-[8.5px] text-orange-600 font-black uppercase tracking-wider block mt-1 font-mono">
                            {SERVICES[selectedServiceKey]?.scopeTag}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Focus Subject Domain block */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono">Syllabus Focus Domain</span>
                      <div className="p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs font-black text-gray-800 leading-none truncate">
                          {selectedSubject ? selectedSubject : 'Not yet selected'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-none truncate">
                          {selectedSubtopic ? `Subtopic: ${selectedSubtopic}` : 'Select Step 2 subtopics'}
                        </p>
                      </div>
                    </div>

                    {/* Schedule metrics summary */}
                    <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-gray-100">
                      <div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono leading-none">Duration</span>
                        <span className="text-xs font-black text-gray-950 block mt-1 leading-none font-mono">
                          {selectedDuration} {SERVICES[selectedServiceKey]?.durationUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono leading-none">Target Date</span>
                        <span className="text-xs font-black text-gray-950 block mt-1 leading-none font-mono">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'As scheduled'}
                        </span>
                      </div>
                    </div>

                    {/* Target Milestones upgrades tracker */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono">Target Study Milestones</span>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {SERVICES[selectedServiceKey]?.deliverables.filter(d => d.included).map(d => (
                          <div key={d.id} className="flex items-center text-[10px] text-gray-650 gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate leading-none">{d.name}</span>
                          </div>
                        ))}
                        {Object.keys(premiumDeliverables).map(addonId => {
                          const item = SERVICES[selectedServiceKey]?.deliverables.find(d => d.id === addonId);
                          if (!item) return null;
                          return (
                            <div key={addonId} className="flex items-center text-[10px] text-orange-700 gap-1.5 animate-fade-in font-bold">
                              <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                              <span className="truncate leading-none">{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Skeuomorphic Ticket Separator dashed Cut line */}
                  <div className="h-[2px] w-full border-t border-dashed border-gray-200 relative my-0.5">
                    {/* Left notch */}
                    <div className="absolute -left-2.5 -top-2.5 h-4 w-4 rounded-full bg-[#FAF9F7] border border-gray-200 shadow-inner"></div>
                    {/* Right notch */}
                    <div className="absolute -right-2.5 -top-2.5 h-4 w-4 rounded-full bg-[#FAF9F7] border border-gray-200 shadow-inner"></div>
                  </div>

                  {/* Active Tutor Prospective Candidates cards */}
                  <div className="p-5 bg-gray-50/40 space-y-4">
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block font-mono leading-none font-sans">
                        Prospective Vetted Candidate
                      </span>

                      {selectedSubject ? (
                        (() => {
                          const tutorObj = getTutorForSubject(selectedSubject);
                          if (!tutorObj) return null;
                          const initials = tutorObj.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                          return (
                            <div className="p-3 bg-white border border-orange-100 rounded-xl flex items-center gap-3 shadow-3xs animate-fade-in">
                              <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-black text-xs flex items-center justify-center">
                                  {initials}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                              </div>
                              <div className="truncate text-left leading-none">
                                <p className="text-xs font-black text-gray-800 leading-none truncate mb-1">{tutorObj.name}</p>
                                <p className="text-[9.5px] text-gray-500 font-bold leading-none truncate mb-1">{tutorObj.subjects?.slice(0, 2).join(' / ')}</p>
                                <div className="flex items-center gap-1 text-[8.5px] font-black uppercase text-orange-600 tracking-wider">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-500" />
                                  <span>{tutorObj.rating} ({tutorObj.reviewCount} reviews)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 select-none">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <Users className="w-4.5 h-4.5" />
                          </div>
                          <div className="text-left leading-none">
                            <p className="text-[11px] font-bold text-gray-400 mb-1">Awaiting Academic Subject</p>
                            <span className="text-[9px] text-gray-400 block">Select step 2 choice</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-emerald-800 leading-normal text-left">
                        University-Tutors matching algorithm is compliant with academic standards, ensuring immediate matches to top tutoring rungs.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* MODAL / SLIDE-OVER LIGHTBOX FOR ENGINE PROCESSING STATUS */}
              {matchingPhase !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" onClick={() => matchingPhase === 'success' && closeSuccessModal()}></div>
                  
                  <div className="relative transform overflow-hidden rounded-[32px] bg-white text-left shadow-2xl transition-all w-full max-w-sm border border-gray-100 overflow-y-auto">
                    
                    {/* LOADING STEPPING PROCESSOR */}
                    {matchingPhase === 'loading' && (
                      <div className="p-8 text-center space-y-6 animate-fade-in">
                        <div className="relative w-16 h-16 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-orange-55"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-orange-600">
                            <Cpu className="w-6.5 h-6.5 animate-bounce" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight leading-snug">Vetting Best Match Prospects</h3>
                          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Analyzing subject files, calendar preferences, and vetting 142 academic profiles inside our tutoring roster...</p>
                        </div>

                        {/* Interactive diagnostic checkpoints list */}
                        <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl text-left space-y-3 font-sans">
                          <div className={`flex items-center gap-2.5 text-xs font-bold leading-none ${vettingStepOneCompleted ? 'text-gray-800 font-extrabold' : 'text-gray-400'}`}>
                            {vettingStepOneCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <RefreshCw className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                            )}
                            <span>{vettingStepOneCompleted ? 'Credentials validated successfully!' : 'Validating curriculum credentials...'}</span>
                          </div>

                          <div className={`flex items-center gap-2.5 text-xs font-bold leading-none ${vettingStepTwoCompleted ? 'text-gray-800 font-extrabold' : 'text-gray-400'}`}>
                            {vettingStepTwoCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : vettingStepOneCompleted ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 bg-gray-100 rounded-full border shrink-0"></span>
                            )}
                            <span>{vettingStepTwoCompleted ? 'Subtopic mapped to Stanford core criteria!' : 'Mapping subtopic requirements...'}</span>
                          </div>

                          <div className={`flex items-center gap-2.5 text-xs font-bold leading-none ${vettingStepThreeCompleted ? 'text-gray-800 font-extrabold' : 'text-gray-400'}`}>
                            {vettingStepThreeCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : vettingStepTwoCompleted ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 bg-gray-100 rounded-full border shrink-0"></span>
                            )}
                            <span>{vettingStepThreeCompleted ? 'Urgent queue matches locked!' : 'Verifying SLA priority queue...'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CONVERSION SUCCESS LOCKIN VIEW */}
                    {matchingPhase === 'success' && (
                      <div className="animate-fade-in">
                        <div className="p-6 md:p-8 text-center space-y-5">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                            <Sparkles className="w-7 h-7" />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug">Optimal Match Secured!</h3>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed font-semibold">
                              We have successfully located a premier tutoring specialist matching your exact parameters.
                            </p>
                          </div>

                          {/* Matched Tutor Profile Summary card */}
                          {(() => {
                            const tutorObj = getTutorForSubject(selectedSubject);
                            if (!tutorObj) return null;
                            const initials = tutorObj.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                            return (
                              <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/20 flex items-start gap-3.5 text-left leading-none">
                                <div className="relative shrink-0">
                                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-black text-sm flex items-center justify-center">
                                    {initials}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border">
                                    <Check className="w-3 h-3 text-white stroke-[3.5]" />
                                  </div>
                                </div>
                                <div className="space-y-1.5 truncate">
                                  <h4 className="text-sm font-black text-gray-900 truncate leading-none">{tutorObj.name}</h4>
                                  <p className="text-xs text-gray-500 leading-normal line-clamp-2">{tutorObj.bio || tutorObj.name}</p>
                                  <div className="flex items-center gap-2 text-[9.5px] text-gray-400 font-black tracking-wider uppercase font-mono mt-1">
                                    <span className="flex items-center gap-0.5 text-orange-600"><Star className="w-3 h-3 fill-amber-400 stroke-amber-500" /> {tutorObj.rating}</span>
                                    <span>|</span>
                                    <span className="text-emerald-755">100% Concept Match</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Syllabus Class Ticket details receipt */}
                          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 text-xs text-left leading-none space-y-2.5">
                            <h4 className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">Syllabus Class Ticket</h4>
                            
                            <div className="flex justify-between font-semibold leading-tight text-gray-650">
                              <span>Selected Pathway:</span>
                              <span className="text-gray-900 font-black text-right truncate max-w-[155px]">{SERVICES[selectedServiceKey]?.title}</span>
                            </div>

                            <div className="flex justify-between font-semibold leading-tight text-gray-650">
                              <span>Target Focus:</span>
                              <span className="text-gray-900 font-black text-right truncate max-w-[150px]">{selectedSubject} ({selectedSubtopic})</span>
                            </div>

                            <div className="flex justify-between font-semibold leading-tight text-gray-650">
                              <span>Attached Materials:</span>
                              <span className="text-gray-900 font-black">{attachedFiles.length > 0 ? `${attachedFiles.length} file reference(s)` : 'None supplied'}</span>
                            </div>

                            <div className="flex justify-between font-semibold text-gray-650 leading-tight">
                              <span>Scheduled Duration:</span>
                              <span className="text-gray-900 font-black">{selectedDuration} {SERVICES[selectedServiceKey]?.durationUnit}</span>
                            </div>

                            <div className="border-t border-gray-200/50 my-2"></div>

                            <div className="flex justify-between text-[10px] font-black text-orange-700 uppercase tracking-widest font-mono">
                              <span>Urgency SLA:</span>
                              <span>{priorityType.toUpperCase()} PRIORITY</span>
                            </div>
                          </div>
                        </div>

                        {/* Portal launcher bottom button */}
                        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 text-center">
                          <button 
                            type="button" 
                            onClick={closeSuccessModal}
                            className="w-full inline-flex justify-center bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-md cursor-pointer transition-all"
                          >
                            Launch Classroom Portal
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================== */}
          {/* TAB 3: ASSIGNMENTS MONITOR TABLE */}
          {/* ================================== */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs animate-fade-in text-left">
              <div className="p-6 border-b border-gray-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">University Assignments Monitor</h3>
                  <p className="text-xs text-gray-400 font-medium">Verify completion percentages, download tutor references, and release funds securely.</p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input 
                    type="text" 
                    placeholder="Search titles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 font-sans"
                  />
                </div>
              </div>

              {searchedAssignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 uppercase font-mono tracking-wider text-[10px]">
                        <th className="p-4 font-bold">Submission Details</th>
                        <th className="p-4 font-bold">Scientific Mentor</th>
                        <th className="p-4 font-bold">Due Deadline</th>
                        <th className="p-4 font-bold">Progress Tracker</th>
                        <th className="p-4 font-bold text-right">Integrity Status Checks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {searchedAssignments.map((a) => {
                        const tutor = getTutor(a.tutorId);
                        return (
                          <tr key={a.id} id={`assignment-row-${a.id}`} className="hover:bg-gray-50/50">
                            
                            <td className="p-4 max-w-xs space-y-1">
                              <span className="font-bold text-gray-900 block truncate">{a.title}</span>
                              <div className="flex gap-1.5 flex-wrap text-[10px]">
                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{a.referenceStyle}</span>
                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{a.wordCount} words</span>
                              </div>
                            </td>

                            <td className="p-4">
                              {tutor ? (
                                <button 
                                  onClick={() => onOpenChat(tutor.id)}
                                  className="flex items-center gap-2 text-left hover:text-orange-600 transition-colors cursor-pointer font-bold text-gray-800"
                                >
                                  <img src={tutor.avatarUrl} className="w-6 h-6 rounded-full border object-cover" alt="" />
                                  <span>{tutor.name}</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 italic">Matching candidate...</span>
                              )}
                            </td>

                            <td className="p-4 font-mono font-medium text-gray-650">
                              {a.deadline}
                            </td>

                            <td className="p-4 max-w-[130px] space-y-1.5">
                              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                <span>Completed Status:</span>
                                <span>{a.progressPercent}%</span>
                              </div>
                              <div className="w-full bg-gray-150 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${a.progressPercent}%` }}
                                />
                              </div>
                            </td>

                            <td className="p-4 text-right space-y-1.5">
                              <div>
                                <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-orange-100/50 text-orange-700 font-mono">
                                  {a.status}
                                </span>
                              </div>

                              <div className="flex gap-1.5 justify-end">
                                {/* Download work trigger if tutor has uploaded */}
                                {a.tutorWorkFileUrl && (
                                  <a
                                    href={a.tutorWorkFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-emerald-500 hover:bg-emerald-650 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/10"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Solution</span>
                                  </a>
                                )}

                                {/* Revision or Approval modals */}
                                {a.status === AssignmentStatus.COMPLETED && !a.reviewed && (
                                  <>
                                    <button
                                      onClick={() => setShowReviewModal(a.id)}
                                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5" />
                                      <span>Approve Delivery</span>
                                    </button>
                                    <button
                                      onClick={() => setShowRevisionModal(a.id)}
                                      className="bg-white hover:bg-gray-100 border text-gray-700 font-bold px-2 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
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
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-650 font-medium">No student assignment briefs registered.</p>
                  <button 
                    onClick={() => setActiveTab('new_request')}
                    className="mt-3 inline-flex bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    🚀 Submit Your First Brief
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================== */}
          {/* TAB 4: PAYMENTS LEDGER & STATEMENTS */}
          {/* ================================== */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs animate-fade-in text-left">
              <div className="p-6 border-b border-gray-150">
                <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight">Receipts & Custom Payment Invoices</h3>
                <p className="text-xs text-gray-400 font-medium">Verify payment statuses and custom invoices. Secure payment links are shared directly with you after discussion.</p>
              </div>

              {studentPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 uppercase font-mono tracking-wider text-[10px]">
                        <th className="p-4 font-bold">Transaction Reference ID</th>
                        <th className="p-4 font-bold">Associated Task Title</th>
                        <th className="p-4 font-bold text-center">Amount Held</th>
                        <th className="p-4 font-bold text-right">Escrow Holding Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs">
                      {studentPayments.map((p) => {
                        const assign = assignments.find(a => a.id === p.assignmentId);
                        return (
                          <tr key={p.id} className="hover:bg-gray-50/50 font-mono">
                            <td className="p-4 font-bold text-gray-950">{p.id} <span className="text-gray-400 font-normal">({p.stripePaymentIntent})</span></td>
                            <td className="p-4 font-sans font-medium text-gray-700">
                              {assign?.title || 'Syllabus Help'}
                              {p.id.includes('_adv') && <span className="ml-1.5 inline-block text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Advance</span>}
                              {p.id.includes('_bal') && <span className="ml-1.5 inline-block text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Balance</span>}
                            </td>
                            <td className="p-4 font-bold text-center text-gray-900">${p.amount} USD</td>
                            <td className="p-4 text-right">
                              <span className={`inline-block font-bold text-[9px] px-2.5 py-1 rounded-full uppercase font-mono ${p.status === 'escrow' ? 'bg-amber-100 text-amber-700' : p.status === 'released' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-750'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-250">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-650 font-medium">No verified transactions logged with this student profile.</p>
                </div>
              )}
            </div>
          )}

          {/* REMOVED HARDCODED DUMMY TUTORS DIRECTORY VIEW */}

          {/* ================================== */}
          {/* TAB 6: CHAT INTERFACE MESSENGER   */}
          {/* ================================== */}
          {activeTab === 'chat' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col h-[720px] overflow-hidden shadow-sm text-left relative animate-fade-in">
              
              {/* Discussion Channels + Center Chat Workspace */}
              <div className="flex-1 flex overflow-hidden w-full relative">

                {/* LEFT SIDEBAR: DISCUSSION CHANNELS */}
                <aside className="w-72 md:w-80 lg:w-88 bg-white border-r border-slate-200/80 flex flex-col shrink-0 shadow-xs overflow-hidden">
                  
                  {/* Sidebar Title Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        <span>Discussion Channels</span>
                      </h2>
                      <span className="text-[11px] font-semibold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200/50">
                        {studentChats.length || 1} Active
                      </span>
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
                      const tutorChats = studentChats.filter(c => !c.tutorId.startsWith('admin_') && c.tutorId !== 'admin_emily');
                      const filteredTutorChats = tutorChats.filter(c => {
                        const tutor = getTutor(c.tutorId);
                        const query = channelSearchFilter.toLowerCase();
                        return !query || (tutor?.name.toLowerCase().includes(query)) || (c.subject.toLowerCase().includes(query));
                      });

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
                                onClick={() => onOpenChat('admin_shaka')}
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

                          {/* SECTION 2: MY TUTORS */}
                          <div>
                            <div className="px-2 mb-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Chat with My Tutor</span>
                              <span className="text-[10px] font-semibold text-slate-400">{tutorChats.length} Tutors</span>
                            </div>

                            <div className="space-y-1.5">
                              {filteredTutorChats.map((c) => {
                                const tutor = getTutor(c.tutorId);
                                const lastMsg = messages.filter(m => m.chatId === c.id).slice(-1)[0];
                                const isSelected = localSelectedChatId === c.id;
                                return (
                                  <div 
                                    key={c.id} 
                                    onClick={() => {
                                      setLocalSelectedChatId(c.id);
                                      if (onSubscribeToChatDetails) onSubscribeToChatDetails(c.id);
                                    }} 
                                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 relative group ${
                                      isSelected
                                        ? 'border-orange-200 bg-orange-50/50 shadow-xs'
                                        : 'border-transparent hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="relative shrink-0">
                                      <img 
                                        src={tutor?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'} 
                                        alt="" 
                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100" 
                                      />
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">{tutor?.name || 'Academic Tutor'}</h4>
                                        <span className="text-[10px] font-medium text-slate-400">
                                          {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 truncate">{lastMsg?.content || 'Discussion active'}</p>
                                    </div>
                                  </div>
                                );
                              })}

                              {tutorChats.length === 0 && (
                                <div className="p-4 text-center text-[11px] text-slate-400 bg-slate-50 border border-dashed rounded-xl leading-relaxed">
                                  No assigned tutors yet. Submit an assignment request to match with an expert tutor!
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
                <main className="flex-1 bg-white flex flex-col shadow-xs overflow-hidden relative">
                  {selectedChat ? (
                    <>
                      {/* CHAT HEADER */}
                      <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 z-10">
                        {/* Active User Details */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={selectedChat.tutorId.startsWith('admin_') 
                                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' 
                                : (getTutor(selectedChat.tutorId)?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80')} 
                              alt="Tutor" 
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100" 
                            />
                            <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                                {selectedChat.tutorId.startsWith('admin_') || selectedChat.tutorId === 'admin_emily'
                                  ? 'Official Support Desk (Emily Vance)'
                                  : (getTutor(selectedChat.tutorId)?.name || 'Academic Tutor')}
                              </h3>
                              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
                                Active Now
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              Subject: {selectedChat.subject || 'Direct Consultation'}
                            </p>
                          </div>
                        </div>

                        {/* Right Quick Toolbar */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setIsQuoteDrawerOpen(!isQuoteDrawerOpen)} 
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <DollarSign className="w-4 h-4 text-orange-600" />
                            <span>Quote & Files</span>
                          </button>

                          <div className="h-5 w-px bg-slate-200 mx-1 hidden md:block"></div>

                          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Voice Call">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Video Consultation">
                            <Video className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="More options">
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
                      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
                        <div className="flex items-center justify-center my-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/70 border border-slate-300/40 px-3 py-0.5 rounded-full">
                            Academic Security System • Active Thread
                          </span>
                        </div>

                        <div className="max-w-xl mx-auto bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-3 shadow-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong class="font-bold text-amber-900">Connection established.</strong> Students can discuss assignment details or schedule 1-on-1 tutoring. All messages are encrypted.
                          </p>
                        </div>

                        {activeChatMessages.map((m) => {
                          const isSelf = m.senderId === currentUser.id;
                          const isSystem = m.senderId === 'system';
                          const senderObj = isSelf ? currentUser : getTutor(m.senderId);
                          const senderName = isSystem ? "ACADEMIC SECURITY SYSTEM" : (isSelf ? "YOU" : (senderObj?.name || "Support / Tutor").toUpperCase());

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
                            <div key={m.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} gap-1 my-2`}>
                              {!isSelf && (
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={senderObj?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'} 
                                    alt="" 
                                    className="w-6 h-6 rounded-lg object-cover" 
                                  />
                                  <span className="text-[10px] font-bold text-slate-500">{senderName}</span>
                                </div>
                              )}

                              <div className={`px-4 py-2.5 rounded-2xl max-w-md text-sm shadow-xs ${
                                isSelf 
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-xs' 
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                              }`}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                                {m.fileUrl && (
                                  <div className="mt-2.5 p-2 rounded-xl bg-slate-100/30 border border-slate-200/40 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                                      <span className="truncate font-mono">{m.fileName || 'Attachment'}</span>
                                    </div>
                                    <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline font-bold shrink-0 ml-2">
                                      Download
                                    </a>
                                  </div>
                                )}
                              </div>

                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                {isSelf ? 'YOU • ' : ''}{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isSelf && <CheckCheck className="w-3.5 h-3.5 text-orange-500" />}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* QUICK PROMPT SUGGESTION CHIPS */}
                      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Actions:</span>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('Can we review the assignment requirements?')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          📋 Request assignment review
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('Please send over a formal price quote for this task.')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          💰 Request formal quote
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStudentReply('When are you available for a 1-on-1 tutoring session?')} 
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          📅 Schedule 1-on-1 session
                        </button>
                      </div>

                      {/* CHAT INPUT COMPONENT */}
                      <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
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
                          className="flex items-center gap-2"
                        >
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                            <label className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer" title="Attach file">
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

                            {chatAttachedFileName && (
                              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono font-bold truncate max-w-[120px]">
                                {chatAttachedFileName}
                              </span>
                            )}

                            <input 
                              type="text" 
                              value={studentReply}
                              onChange={(e) => setStudentReply(e.target.value)}
                              placeholder="Type your message here or paste details..." 
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none py-1"
                            />

                            <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors hidden sm:block">
                              <Smile className="w-4 h-4" />
                            </button>
                          </div>

                          <button 
                            type="submit" 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 rounded-xl shadow-xs flex items-center justify-center transition-all transform active:scale-95 cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
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
                      <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                      <h5 className="font-bold text-slate-900 text-sm">Select a Discussion Channel</h5>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Choose an administrative support ticket or an active tutor consultation channel from the left panel to begin chatting.
                      </p>
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
              <div className="border-b pb-3.5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-gray-950">Notifications Center</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Critical security alerts, Escrow release confirmations, and project state logs.</p>
                </div>
                <span className="bg-orange-50 text-orange-655 font-mono text-[10px] font-bold px-2 rounded-full uppercase">
                  4 UNREAD
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Escrow payment certified successfully', desc: '$120 deposit locked in verified Stripe holding structure. Safe to proceed under academic client rules.', type: 'payment', time: '10 minutes ago' },
                  { title: 'Biology Syllabus Candidate Search Active', desc: 'Syllabus requirement broadcasted to certified Natural Sciences phD instructors worldwide.', type: 'matching', time: '1 hour ago' },
                  { title: 'Welcome to UNIVERSITY TUTORS!', desc: 'Your student credentials are encrypted and archived locally. Ensure profile completeness for swift matching.', type: 'security', time: '3 hours ago' },
                  { title: 'Session invitation created from Emily CSR', desc: 'A Support desk Specialist is assigned to optimize your active essay guidelines matching.', type: 'support', time: '1 day ago' }
                ].map((notif, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-150/60 rounded-2xl flex items-start gap-3 text-xs">
                    <div className="p-1 px-1.5 bg-orange-100 rounded text-orange-655 font-bold shrink-0 font-mono text-[9px] uppercase">
                      {notif.type}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900">{notif.title}</h4>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{notif.desc}</p>
                      <span className="text-[10px] text-gray-500 font-mono block pt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
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
              <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight border-b pb-3">Security Preferences</h3>
              
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

                <div className="flex items-center justify-between p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                  <div>
                    <span className="font-bold text-xs text-red-955 block font-sans">Deactivate Platform Credentials</span>
                    <span className="text-[10.5px] text-red-750 leading-tight font-sans">Completely scrub local reference files and credentials. This action cannot be reversed.</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Verify: Scrub all information permanently?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-center font-sans tracking-wide"
                  >
                    Scrub Storage
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* FLOATING DIRECT LIVE CHAT ASSISTANCE WIDGET (CSR)      */}
        {/* ======================================================== */}
        <button
          onClick={() => {
            setActiveTab('chat');
            onOpenChat('admin_shaka'); // Directly link support chat
          }}
          className="fixed bottom-6 right-6 bg-[#FF8A00] hover:bg-[#E05216] text-white p-4 rounded-full shadow-2xl z-40 transition-all cursor-pointer flex items-center justify-center gap-2 font-bold font-sans tracking-wide text-xs group"
          id="floating-live-chat"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 ease-out whitespace-nowrap">
            Live Chat
          </span>
        </button>

      </main>

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

    </div>
  );
}
