import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  X,
  Download,
  Briefcase,
  Star,
  Calendar,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  DollarSign,
  UserPlus,
  ArrowUpDown,
  PanelTopClose,
  PanelTopOpen,
  ChevronsUpDown
} from 'lucide-react';
import { User, Chat, AssignmentStatus } from '../types';
import { audioNotifier } from '../utils/audioNotification';
import { store } from '../lib/store';
import { PaginationBar } from './ui/StatePanels';

export interface SubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  studentPhone?: string;
  totalSubmissions?: number;
  joinedDate?: string;
  gpa?: string;
  subject: string;
  title: string;
  pattern: string;
  fullDescription: string;
  documentName: string;
  documentSize: string;
  documentUrl?: string;
  status: string;
  deadline: string;
  price: number | null;
  assignedTutor: string;
  tutorRating: number;
  chatHistory: Array<{
    sender: string;
    roleLabel: string;
    text: string;
    time: string;
  }>;
  submissionHistory: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    grade: string;
  }>;
}

interface AssignmentLedgerViewProps {
  initialData: SubmissionItem[];
  tutorsList: string[];
  currentUser: User;
  users: User[];
  chats: Chat[];
  onAssignTutor: (assignmentId: string, tutorId: string) => Promise<boolean>;
  onSetAssignmentPrice: (assignmentId: string, price: number) => Promise<boolean>;
  onUpdateAssignmentStatus?: (assignmentId: string, status: AssignmentStatus) => Promise<void>;
  onSendMessage: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => void;
  onGetOrCreateChat?: (studentId: string, tutorId: string, subject?: string) => Chat;
  onSelectChat: (chat: Chat) => void;
  setActiveTab: (tab: any) => void;
  setSelectedChatId?: (chatId: string) => void;
  setReplyAsTutor?: (reply: boolean) => void;
  toStoreStatus: (st: string) => AssignmentStatus;
  onSeedMockStudentData?: () => Promise<void | boolean>;
  isPageExpanded?: boolean;
  onTogglePageExpand?: () => void;
}

interface ParsedBrief {
  servicePattern: string | null;
  tags: Array<{ label: string; value: string }>;
  cleanSummary: string;
}

function parseAssignmentBrief(pattern: string, fullDescription: string): ParsedBrief {
  const rawCombined = (fullDescription && fullDescription.trim().length > 0 ? fullDescription : pattern || '').trim();
  const tags: Array<{ label: string; value: string }> = [];
  let servicePattern: string | null = null;

  const sourceForMeta = `${pattern || ''}\n${fullDescription || ''}`;
  const patternMatch = sourceForMeta.match(/TUTORING SERVICE PATTERN:\s*([^\n.=]+)/i);
  if (patternMatch && patternMatch[1]) {
    servicePattern = patternMatch[1].replace(/\.{2,}$/, '').trim();
  }

  const citationMatch = sourceForMeta.match(/CITATION(?:\s+STYLE)?:\s*([^\n,|]+)/i);
  if (citationMatch && citationMatch[1]) {
    tags.push({ label: 'Citation', value: citationMatch[1].trim() });
  }

  const pagesMatch = sourceForMeta.match(/(?:PAGES|WORDS|WORD COUNT|LENGTH):\s*([^\n,|]+)/i);
  if (pagesMatch && pagesMatch[1]) {
    tags.push({ label: 'Scope', value: pagesMatch[1].trim() });
  }

  const levelMatch = sourceForMeta.match(/(?:ACADEMIC LEVEL|LEVEL):\s*([^\n,|]+)/i);
  if (levelMatch && levelMatch[1]) {
    tags.push({ label: 'Level', value: levelMatch[1].trim() });
  }

  let cleanSummary = rawCombined
    .replace(/===\s*University-Tutors Matching Funnel Request\s*===/gi, '')
    .replace(/TUTORING SERVICE PATTERN:\s*[^\n]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSummary) {
    cleanSummary = 'Comprehensive academic tutoring and coursework guidance requested by student.';
  }

  return { servicePattern, tags, cleanSummary };
}

function getDeadlineBadge(deadlineStr: string): { label: string; tone: 'overdue' | 'urgent' | 'soon' | 'normal' } {
  if (!deadlineStr) return { label: 'No deadline', tone: 'normal' };
  const parsed = new Date(deadlineStr);
  if (isNaN(parsed.getTime())) return { label: deadlineStr, tone: 'normal' };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  const diffDays = Math.round((targetDay - startOfToday) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: 'overdue' };
  if (diffDays === 0) return { label: 'Due today', tone: 'urgent' };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, tone: 'soon' };
  return { label: `In ${diffDays}d`, tone: 'normal' };
}

function isTutorUnassigned(tutorName?: string | null): boolean {
  if (!tutorName) return true;
  const trimmed = tutorName.trim().toLowerCase();
  return trimmed === '' || trimmed === 'unassigned';
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'Completed':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        select: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    case 'In Progress':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        bar: 'bg-blue-500',
        select: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    case 'Revision':
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        bar: 'bg-purple-500',
        select: 'bg-purple-50 text-purple-800 border-purple-200'
      };
    default:
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        bar: 'bg-amber-500',
        select: 'bg-amber-50 text-amber-800 border-amber-200'
      };
  }
}

export default function AssignmentLedgerView({
  initialData,
  tutorsList,
  currentUser,
  users,
  onAssignTutor,
  onSetAssignmentPrice,
  onUpdateAssignmentStatus,
  onSendMessage,
  onGetOrCreateChat,
  toStoreStatus,
  onSeedMockStudentData,
  isPageExpanded = false,
  onTogglePageExpand
}: AssignmentLedgerViewProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialData);
  const [activeTab, setSubTab] = useState('All Requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'unassigned' | 'deadline' | 'price_desc' | 'price_asc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Expandable UI states
  const [isDeskExpanded, setIsDeskExpanded] = useState(true);
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    if (initialData.length > 0) {
      initialExpanded[initialData[0].id] = true;
    }
    return initialExpanded;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedPriceIds, setSavedPriceIds] = useState<Record<string, boolean>>({});

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<SubmissionItem | null>(null);
  const [activeChatSubmission, setActiveChatSubmission] = useState<SubmissionItem | null>(null);
  const [chatMode, setChatMode] = useState<'admin' | 'tutor'>('admin');
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Editable states for price and tutor assignment
  const [prices, setPrices] = useState<Record<string, string | number>>(
    initialData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.price ?? '' }), {})
  );
  const [tutors, setTutors] = useState<Record<string, string>>(
    initialData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.assignedTutor }), {})
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSubmissions(initialData);
      setPrices(prev => {
        const next = { ...prev };
        for (const item of initialData) {
          if (next[item.id] === undefined) {
            next[item.id] = item.price ?? '';
          }
        }
        return next;
      });
      setTutors(prev => {
        const next = { ...prev };
        for (const item of initialData) {
          if (next[item.id] === undefined) {
            next[item.id] = item.assignedTutor;
          }
        }
        return next;
      });
    }
  }, [initialData]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(id).catch(() => {});
    }
    setCopiedId(id);
    showNotification(`Copied Ref ID: ${id}`);
    setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1800);
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRowIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePriceChange = (id: string, val: string) => {
    setPrices(prev => ({ ...prev, [id]: val }));
    setSavedPriceIds(prev => ({ ...prev, [id]: false }));
  };

  const handlePriceSave = async (id: string) => {
    const val = prices[id];
    const numVal = val !== '' && val !== undefined ? Number(val) : null;
    setSubmissions(prev => prev.map(sub => (sub.id === id ? { ...sub, price: numVal } : sub)));

    if (numVal !== null && !isNaN(numVal)) {
      try {
        if (onSetAssignmentPrice) {
          await onSetAssignmentPrice(id, numVal);
        } else {
          await store.setAssignmentPrice(id, numVal);
        }
      } catch (e) {
        console.warn('Notice updating price:', e);
      }
    }
    setSavedPriceIds(prev => ({ ...prev, [id]: true }));
    showNotification(`Quote updated to ${numVal !== null && !isNaN(numVal) ? `$${numVal}` : 'Unpriced'}`);
  };

  const handleTutorChange = async (id: string, tutorName: string) => {
    setTutors(prev => ({ ...prev, [id]: tutorName }));
    setSubmissions(prev => prev.map(sub => (sub.id === id ? { ...sub, assignedTutor: tutorName } : sub)));

    if (tutorName.trim() !== '') {
      const matchedTutorUser = users.find(
        u => u.name.toLowerCase().trim() === tutorName.toLowerCase().trim()
      );
      const targetTutorId =
        matchedTutorUser?.id || (tutorName.includes('Clara') ? 'tutor_clara' : 'tutor_alan');

      try {
        if (onAssignTutor) {
          await onAssignTutor(id, targetTutorId);
        } else {
          await store.assignTutorToAssignment(id, targetTutorId);
        }
      } catch (e) {
        console.warn('Notice assigning tutor:', e);
      }
      showNotification(`Assigned tutor updated to ${tutorName}`);
    } else {
      showNotification('Tutor cleared (marked Unassigned)');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSubmissions(prev => prev.map(sub => (sub.id === id ? { ...sub, status: newStatus } : sub)));

    try {
      const mapped = toStoreStatus(newStatus);
      if (onUpdateAssignmentStatus) {
        await onUpdateAssignmentStatus(id, mapped);
      } else {
        await store.updateAssignmentStatus(id, mapped);
      }
    } catch (e) {
      console.warn('Notice updating status:', e);
    }

    showNotification(`Status updated to ${newStatus}`);
  };

  // Filtered and sorted items
  const filteredSubmissions = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    const list = submissions.filter(sub => {
      const currentTutor = tutors[sub.id] !== undefined ? tutors[sub.id] : sub.assignedTutor;
      const matchesTab =
        activeTab === 'All Requests'
          ? true
          : activeTab === 'Unassigned'
          ? isTutorUnassigned(currentTutor)
          : sub.status === activeTab;

      const matchesSearch =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        sub.studentEmail.toLowerCase().includes(q) ||
        sub.subject.toLowerCase().includes(q) ||
        sub.title.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q) ||
        (currentTutor || '').toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });

    if (sortBy === 'default') return list;
    const copy = [...list];
    if (sortBy === 'unassigned') {
      copy.sort((a, b) => {
        const aUnassigned = isTutorUnassigned(tutors[a.id] ?? a.assignedTutor) ? 0 : 1;
        const bUnassigned = isTutorUnassigned(tutors[b.id] ?? b.assignedTutor) ? 0 : 1;
        return aUnassigned - bUnassigned;
      });
    } else if (sortBy === 'deadline') {
      copy.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortBy === 'price_desc') {
      copy.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    } else if (sortBy === 'price_asc') {
      copy.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    }
    return copy;
  }, [submissions, activeTab, debouncedSearchQuery, sortBy, tutors]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSubmissions = filteredSubmissions.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allVisibleExpanded =
    paginatedSubmissions.length > 0 && paginatedSubmissions.every(sub => !!expandedRowIds[sub.id]);

  const handleToggleExpandAllVisible = () => {
    const nextState = !allVisibleExpanded;
    setExpandedRowIds(prev => {
      const next = { ...prev };
      for (const sub of paginatedSubmissions) {
        next[sub.id] = nextState;
      }
      return next;
    });
  };

  const sendChatMessage = (subId: string) => {
    if (!chatMessageInput.trim()) return;

    const senderKey = chatMode === 'admin' ? 'admin' : 'tutor';
    const tutorDisplayName =
      tutors[subId] || submissions.find(s => s.id === subId)?.assignedTutor || 'Assigned Tutor';
    const roleLabel = chatMode === 'admin' ? 'Admin' : `${tutorDisplayName} (Tutor)`;
    const newMsg = { sender: senderKey, roleLabel, text: chatMessageInput.trim(), time: 'Just now' };

    setSubmissions(prev =>
      prev.map(sub => (sub.id === subId ? { ...sub, chatHistory: [...sub.chatHistory, newMsg] } : sub))
    );

    if (activeChatSubmission && activeChatSubmission.id === subId) {
      setActiveChatSubmission(prev =>
        prev ? { ...prev, chatHistory: [...prev.chatHistory, newMsg] } : null
      );
    }

    audioNotifier.playSentSound();

    const currentSub = submissions.find(s => s.id === subId) || activeChatSubmission;
    if (currentSub) {
      const studentUser = users.find(
        u =>
          u.name.toLowerCase().trim() === currentSub.studentName.toLowerCase().trim() ||
          u.email.toLowerCase().trim() === currentSub.studentEmail.toLowerCase().trim()
      );
      const studentIdentifier = studentUser?.id || currentSub.studentEmail;
      const matchedTutor = users.find(
        u => u.name.toLowerCase().trim() === tutorDisplayName.toLowerCase().trim()
      );
      const tutorIdentifier = matchedTutor?.id || 'tutor_clara';

      if (onGetOrCreateChat) {
        const chat = onGetOrCreateChat(studentIdentifier, tutorIdentifier, currentSub.title);
        const senderId = chatMode === 'admin' ? currentUser.id : tutorIdentifier;
        onSendMessage(chat.id, senderId, chatMessageInput.trim());
      }
    }

    setChatMessageInput('');
    showNotification(`Message sent as ${chatMode === 'admin' ? 'Admin' : 'Assigned Tutor'}`);
  };

  const handleSeedDemands = async () => {
    try {
      if (onSeedMockStudentData) {
        await onSeedMockStudentData();
      }

      const mock1Id = `assign_${Date.now()}_seed1`;
      const mock2Id = `assign_${Date.now() + 1}_seed2`;

      try {
        await store.addAssignment(
          'user_student_alex',
          'Deep Learning Project Architecture',
          'Machine Learning (Neural Networks)',
          '2026-11-20',
          'Need guidance with PyTorch implementation of transformer attention layers and hyperparameter optimization.',
          1500,
          'IEEE',
          5,
          [],
          ['DeepLearning_Architecture_Brief.pdf'],
          ''
        );
        await store.addAssignment(
          'user_student_emma',
          'CRISPR Genome Editing Protocol',
          'Biochemistry & Genetics',
          '2026-11-22',
          'Requires review of molecular biology experimental methodology and statistical analysis of assay findings.',
          2000,
          'APA 7th',
          8,
          [],
          ['CRISPR_Protocol_Brief.pdf'],
          ''
        );
      } catch (err) {
        console.warn('Could not save to store, adding to local state:', err);
      }

      const newDemands: SubmissionItem[] = [
        {
          id: mock1Id,
          studentName: 'Alex Rivera',
          studentEmail: 'alex.rivera@stanford.edu',
          studentAvatar: 'A',
          studentPhone: '+1 (555) 438-9921',
          totalSubmissions: 1,
          joinedDate: 'Nov 2026',
          gpa: '3.90',
          subject: 'Machine Learning (Neural Networks)',
          title: 'Deep Learning Project Architecture',
          pattern: 'TUTORING SERVICE PATTERN: Neural Network Architecture',
          fullDescription:
            'Need guidance with PyTorch implementation of transformer attention layers and hyperparameter optimization.',
          documentName: 'DeepLearning_Architecture_Brief.pdf',
          documentSize: '3.4 MB',
          documentUrl: '',
          status: 'Pending/Incoming',
          deadline: '2026-11-20',
          price: null,
          assignedTutor: '',
          tutorRating: 5.0,
          chatHistory: [
            {
              sender: 'student',
              roleLabel: 'Alex Rivera (Student)',
              text: 'Hello! I need an expert in PyTorch to review my deep learning model architecture.',
              time: 'Just now'
            }
          ],
          submissionHistory: [
            {
              id: `sub_${Date.now()}_1`,
              title: 'Deep Learning Project Architecture',
              date: '2026-11-06',
              status: 'Pending/Incoming',
              grade: 'Pending'
            }
          ]
        },
        {
          id: mock2Id,
          studentName: 'Emma Watson',
          studentEmail: 'emma.w@columbia.edu',
          studentAvatar: 'E',
          studentPhone: '+1 (555) 762-3344',
          totalSubmissions: 1,
          joinedDate: 'Nov 2026',
          gpa: '3.95',
          subject: 'Biochemistry & Genetics',
          title: 'CRISPR Genome Editing Protocol',
          pattern: 'TUTORING SERVICE PATTERN: Molecular Biology Research',
          fullDescription:
            'Requires review of molecular biology experimental methodology and statistical analysis of assay findings.',
          documentName: 'CRISPR_Protocol_Brief.pdf',
          documentSize: '2.8 MB',
          documentUrl: '',
          status: 'Pending/Incoming',
          deadline: '2026-11-22',
          price: null,
          assignedTutor: '',
          tutorRating: 4.9,
          chatHistory: [
            {
              sender: 'student',
              roleLabel: 'Emma Watson (Student)',
              text: 'Hi, I have a lab report protocol on CRISPR assay design that needs specialist verification.',
              time: 'Just now'
            }
          ],
          submissionHistory: [
            {
              id: `sub_${Date.now()}_2`,
              title: 'CRISPR Genome Editing Protocol',
              date: '2026-11-06',
              status: 'Pending/Incoming',
              grade: 'Pending'
            }
          ]
        }
      ];

      setSubmissions(prev => [...newDemands, ...prev]);
      setExpandedRowIds(prev => ({ ...prev, [mock1Id]: true, [mock2Id]: true }));
      setIsDeskExpanded(true);
      audioNotifier.playReceivedSound();
      showNotification('Seeded sample student demands into the queue!');
    } catch (e) {
      console.error('Seed error:', e);
    }
  };

  const getStudentSubmissions = (studentName: string) => {
    return submissions.filter(s => s.studentName === studentName);
  };

  // Summary metrics
  const totalOrders = submissions.length;
  const unassignedTasks = submissions.filter(s =>
    isTutorUnassigned(tutors[s.id] !== undefined ? tutors[s.id] : s.assignedTutor)
  );
  const activeStudentsCount = new Set(submissions.map(s => s.studentEmail || s.studentName)).size;
  const activeTutorsCount =
    new Set(
      submissions
        .map(s => (tutors[s.id] !== undefined ? tutors[s.id] : s.assignedTutor))
        .filter(t => !isTutorUnassigned(t))
    ).size || (tutorsList.length > 0 ? 2 : 0);

  return (
    <div className="w-full text-slate-800 font-sans pb-8 text-left space-y-6">
      {/* Top Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* CARD 1: Header & Interactive Metric Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans tracking-tight">
                New Assignment Ledger (Incoming Requests)
              </h2>
              {unassignedTasks.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {unassignedTasks.length} awaiting tutor
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review incoming student briefs, expand entries to inspect full instructions, set quote pricing, assign subject specialists, and chat directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onTogglePageExpand && (
              <button
                type="button"
                onClick={onTogglePageExpand}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isPageExpanded
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                }`}
                title={isPageExpanded ? 'Return to sidebar + ledger view' : 'Expand ledger to full workspace width'}
              >
                {isPageExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Show Admin Sidebar</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Page Full Width</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleExpandAllVisible}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{allVisibleExpanded ? 'Collapse All Entries' : 'Expand All Entries'}</span>
            </button>
          </div>
        </div>

        {/* Clickable KPI Cards */}
        <div className="border-t border-dashed border-slate-200 mt-5 pt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                setSubTab('All Requests');
                setCurrentPage(1);
              }}
              className={`text-left bg-[#fff8f0] border rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
                activeTab === 'All Requests'
                  ? 'border-orange-400 ring-2 ring-orange-200/70'
                  : 'border-[#ffecd6] hover:border-orange-300'
              }`}
            >
              <span className="text-[11px] font-bold text-[#c2410c] tracking-wider uppercase block">
                Total Orders
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1.5">
                {totalOrders}
              </div>
              <span className="text-[11px] text-orange-700/80 mt-1 block">Click to view all briefs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubTab('Unassigned');
                setCurrentPage(1);
              }}
              className={`text-left bg-[#f0f7ff] border rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
                activeTab === 'Unassigned'
                  ? 'border-blue-500 ring-2 ring-blue-200/80'
                  : 'border-[#d8eaff] hover:border-blue-300'
              }`}
            >
              <span className="text-[11px] font-bold text-[#2563eb] tracking-wider uppercase block">
                Unassigned Tasks
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1.5">
                {unassignedTasks.length}
              </div>
              <span className="text-[11px] text-blue-700/80 mt-1 block">
                {unassignedTasks.length > 0 ? 'Click to triage queue' : 'All paired with tutors'}
              </span>
            </button>

            <div className="bg-[#eefbf4] border border-[#d2f4e3] rounded-2xl p-4 sm:p-5">
              <span className="text-[11px] font-bold text-[#059669] tracking-wider uppercase block">
                Active Students
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1.5">
                {activeStudentsCount}
              </div>
              <span className="text-[11px] text-emerald-700/80 mt-1 block">Unique request senders</span>
            </div>

            <div className="bg-[#faf5ff] border border-[#edd9fc] rounded-2xl p-4 sm:p-5">
              <span className="text-[11px] font-bold text-[#9333ea] tracking-wider uppercase block">
                Active Tutors
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1.5">
                {activeTutorsCount}
              </div>
              <span className="text-[11px] text-purple-700/80 mt-1 block">Subject specialists assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Expandable Direct Tutor Assignment Desk (Incoming Requests) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsDeskExpanded(prev => !prev)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsDeskExpanded(prev => !prev);
            }
          }}
          className="px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                Direct Tutor Assignment Desk (Incoming Requests)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:pl-10">
              Quickly quote and pair unassigned student requests with subject specialists.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <span
              className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${
                unassignedTasks.length > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {unassignedTasks.length} Pending Assignment
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {isDeskExpanded ? (
                <>
                  <PanelTopClose className="w-3.5 h-3.5" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <PanelTopOpen className="w-3.5 h-3.5" />
                  <span>Expand</span>
                </>
              )}
            </span>
          </div>
        </div>

        {isDeskExpanded && (
          <div className="px-5 sm:px-7 pb-6 pt-1 border-t border-slate-100">
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 sm:p-6 mt-4">
              {unassignedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">All caught up!</h4>
                  <p className="text-sm text-slate-500 mb-4 max-w-md">
                    Every student request currently has a specialist tutor assigned. You can inspect or modify any request in the ledger below.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedDemands}
                    className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Seed Sample Student Demands</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">
                        Active Student Demands Awaiting Tutor Assignment ({unassignedTasks.length})
                      </h5>
                      <p className="text-xs text-slate-500">
                        Set a quote price and dispatch a qualified tutor immediately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSeedDemands}
                      className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer self-start sm:self-center"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ Seed More Sample Demands</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unassignedTasks.map(sub => {
                      const parsed = parseAssignmentBrief(sub.pattern, sub.fullDescription);
                      const deadlineMeta = getDeadlineBadge(sub.deadline);
                      return (
                        <div
                          key={sub.id}
                          className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                                {sub.subject}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                                {sub.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                Student:{' '}
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudent(sub.studentName)}
                                  className="font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer"
                                >
                                  {sub.studentName}
                                </button>{' '}
                                <span className="text-slate-400">({sub.studentEmail})</span>
                              </p>
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
                                deadlineMeta.tone === 'overdue'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : deadlineMeta.tone === 'urgent' || deadlineMeta.tone === 'soon'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              Due {sub.deadline}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 bg-white border border-slate-200/80 rounded-xl p-2.5 line-clamp-2 leading-relaxed">
                            {parsed.cleanSummary}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Quote Price (USD)
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-semibold">$</span>
                                <input
                                  type="number"
                                  placeholder="e.g. 180"
                                  value={prices[sub.id] !== undefined ? prices[sub.id] : ''}
                                  onChange={e => handlePriceChange(sub.id, e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Assign Subject Specialist
                              </label>
                              <select
                                value={tutors[sub.id] || ''}
                                onChange={e => handleTutorChange(sub.id, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                              >
                                <option value="">-- Choose Tutor --</option>
                                {tutorsList.map(t => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                            <button
                              type="button"
                              onClick={() => setSelectedSubmissionDetail(sub)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                            >
                              Inspect Full Brief →
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const targetTutor = tutors[sub.id] || tutorsList[0];
                                if (targetTutor) {
                                  await handleTutorChange(sub.id, targetTutor);
                                }
                                if (prices[sub.id]) {
                                  await handlePriceSave(sub.id);
                                }
                                audioNotifier.playSentSound();
                                showNotification(`Dispatched ${targetTutor} to ${sub.studentName}'s demand!`);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Dispatch Tutor</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: EXPANDABLE LEDGER ENTRIES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Ledger Header & Controls */}
        <header className="px-5 sm:px-7 py-6 border-b border-slate-100 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Incoming Student Demands & Tasks
                </h1>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {filteredSubmissions.length} of {submissions.length} Briefs
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Click any entry header to expand full instructions, attachments, quote pricing, tutor assignment, and dual-mode chat.
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student, subject, tutor, ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  aria-label="Sort requests"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="default">Sort: Default Order</option>
                  <option value="unassigned">Sort: Unassigned First</option>
                  <option value="deadline">Sort: Deadline Soonest</option>
                  <option value="price_desc">Sort: Price High → Low</option>
                  <option value="price_asc">Sort: Price Low → High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Navigation Tabs + Expand/Collapse All */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {['All Requests', 'Unassigned', 'Pending/Incoming', 'In Progress', 'Completed', 'Revision'].map(tab => {
                const count =
                  tab === 'All Requests'
                    ? submissions.length
                    : tab === 'Unassigned'
                    ? unassignedTasks.length
                    : submissions.filter(s => s.status === tab).length;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setSubTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'Unassigned' && (
                      <AlertTriangle className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-amber-600'}`} />
                    )}
                    <span>{tab}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700 border border-slate-200/70'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {paginatedSubmissions.length > 0 && (
              <button
                type="button"
                onClick={handleToggleExpandAllVisible}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer self-start md:self-center shrink-0"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>{allVisibleExpanded ? 'Collapse visible entries' : 'Expand visible entries'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Entries List */}
        <main className="p-4 sm:p-6 bg-slate-50/50 space-y-3.5">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching assignment requests</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Try clearing your search term or switching back to All Requests.
              </p>
              {(searchQuery || activeTab !== 'All Requests') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSubTab('All Requests');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            paginatedSubmissions.map(sub => {
              const isExpanded = !!expandedRowIds[sub.id];
              const currentTutor = tutors[sub.id] !== undefined ? tutors[sub.id] : sub.assignedTutor;
              const unassigned = isTutorUnassigned(currentTutor);
              const statusStyle = getStatusStyles(sub.status);
              const parsed = parseAssignmentBrief(sub.pattern, sub.fullDescription);
              const deadlineMeta = getDeadlineBadge(sub.deadline);
              const activePrice = sub.price !== null && sub.price !== undefined ? sub.price : null;

              return (
                <div
                  key={sub.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden relative ${
                    isExpanded
                      ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100'
                      : 'border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Colored Status Accent Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusStyle.bar}`} />

                  {/* COLLAPSED / ALWAYS-VISIBLE SUMMARY HEADER */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleRowExpanded(sub.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRowExpanded(sub.id);
                      }
                    }}
                    aria-expanded={isExpanded}
                    className="pl-5 pr-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Avatar + Title + Subject + Student */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5 sm:mt-0">
                        {(sub.studentAvatar || sub.studentName || 'S').charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.badge}`}>
                            {sub.status}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            {sub.subject}
                          </span>
                          {unassigned && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Needs Tutor
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                            {sub.title}
                          </h3>
                          <span className="text-xs text-slate-500">
                            by{' '}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedStudent(sub.studentName);
                              }}
                              className="font-semibold text-slate-800 hover:text-indigo-600 hover:underline cursor-pointer"
                            >
                              {sub.studentName}
                            </button>
                            <span className="hidden sm:inline text-slate-400"> ({sub.studentEmail})</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Key Metadata Pills + Expand Toggle */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pl-13 sm:pl-0 shrink-0">
                      {/* Tutor Summary Pill */}
                      <div className="text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`font-semibold ${unassigned ? 'text-amber-700' : 'text-slate-800'}`}>
                          {unassigned ? 'Unassigned' : currentTutor}
                        </span>
                      </div>

                      {/* Deadline Pill */}
                      <div
                        className={`text-xs border rounded-xl px-3 py-1.5 flex items-center gap-1.5 font-medium ${
                          deadlineMeta.tone === 'overdue'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : deadlineMeta.tone === 'urgent' || deadlineMeta.tone === 'soon'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-slate-100/80 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{sub.deadline}</span>
                      </div>

                      {/* Price Pill */}
                      <div
                        className={`text-xs font-bold border rounded-xl px-3 py-1.5 flex items-center gap-1 ${
                          activePrice !== null
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{activePrice !== null ? `${activePrice}` : 'Unpriced'}</span>
                      </div>

                      {/* Quick Chat Button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveChatSubmission(sub);
                          setChatMode('admin');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold cursor-pointer"
                        title="Open quick Admin / Tutor chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{sub.chatHistory.length}</span>
                      </button>

                      {/* Expand / Collapse Chevron */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          isExpanded
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS BODY */}
                  {isExpanded && (
                    <div className="pl-5 pr-4 sm:px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/40 space-y-5">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Zone 1: Clear Academic Brief & Attached Document */}
                        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Student Brief & Instructions
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={e => handleCopyId(sub.id, e)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
                                title="Copy full assignment reference ID"
                              >
                                {copiedId === sub.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                                <span>Ref: {sub.id}</span>
                              </button>
                            </div>
                          </div>

                          {/* Parsed Metadata Chips (Service Pattern, Citation, Scope, etc.) */}
                          {(parsed.servicePattern || parsed.tags.length > 0) && (
                            <div className="flex flex-wrap items-center gap-2">
                              {parsed.servicePattern && (
                                <span className="text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100 px-2.5 py-1 rounded-lg">
                                  Service: {parsed.servicePattern}
                                </span>
                              )}
                              {parsed.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg"
                                >
                                  <strong className="text-slate-900">{tag.label}:</strong> {tag.value}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Readable Instructions */}
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                            {parsed.cleanSummary}
                          </p>

                          {/* Attached File & Student Contact Strip */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <a
                              href={sub.documentUrl || '#download'}
                              onClick={e => {
                                if (!sub.documentUrl) {
                                  e.preventDefault();
                                  showNotification(`Downloading ${sub.documentName}`);
                                }
                              }}
                              target={sub.documentUrl ? '_blank' : undefined}
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200/70 transition-colors"
                            >
                              <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="truncate max-w-[240px]">{sub.documentName}</span>
                              <span className="text-[11px] text-indigo-500 font-normal shrink-0">
                                ({sub.documentSize})
                              </span>
                            </a>

                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                Deadline: <strong className="text-slate-800">{sub.deadline}</strong> ({deadlineMeta.label})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Zone 2: Status, Quote Pricing & Tutor Pairing Controls */}
                        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Workflow Controls & Quote
                            </h4>
                            <span
                              className={`text-[11px] font-semibold flex items-center gap-1 ${
                                unassigned ? 'text-amber-700' : 'text-emerald-600'
                              }`}
                            >
                              {unassigned ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Needs Assignment</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Assigned & Ready</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Status Control */}
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Status
                              </label>
                              <select
                                value={sub.status}
                                onChange={e => handleStatusChange(sub.id, e.target.value)}
                                className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer ${statusStyle.select}`}
                              >
                                <option value="Pending/Incoming">Pending/Incoming</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Revision">Revision</option>
                              </select>
                            </div>

                            {/* Price Control */}
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Quote Price ({activePrice !== null ? `$${activePrice}` : 'Unpriced'})
                              </label>
                              <div className="flex items-center gap-1.5">
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-semibold">$</span>
                                  <input
                                    type="number"
                                    placeholder="Set USD"
                                    value={prices[sub.id] !== undefined ? prices[sub.id] : ''}
                                    onChange={e => handlePriceChange(sub.id, e.target.value)}
                                    className="w-full pl-6 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePriceSave(sub.id)}
                                  className={`px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors shrink-0 ${
                                    savedPriceIds[sub.id]
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                >
                                  {savedPriceIds[sub.id] ? 'Saved' : 'Save'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Tutor Assignment Control */}
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                              Assigned Subject Tutor
                            </label>
                            <select
                              value={currentTutor || ''}
                              onChange={e => handleTutorChange(sub.id, e.target.value)}
                              className={`w-full border text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                                unassigned
                                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <option value="">-- Unassigned (Select Subject Tutor) --</option>
                              {tutorsList.map(t => (
                                <option key={t} value={t}>
                                  {t} (★4.9)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Action Footer */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(sub.studentName)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                            >
                              <UserIcon className="w-3.5 h-3.5" />
                              <span>Student Profile</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedSubmissionDetail(sub)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Full Brief</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveChatSubmission(sub);
                                setChatMode('admin');
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Admin Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveChatSubmission(sub);
                                setChatMode('tutor');
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-amber-200 cursor-pointer"
                              title={`Chat as assigned tutor: ${currentTutor || 'Unassigned'}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Tutor Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <PaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredSubmissions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>

      {/* STUDENT PROFILE EXPANDED DRAWER */}
      {selectedStudent && (() => {
        const studentSubs = getStudentSubmissions(selectedStudent);
        const primaryRecord = studentSubs[0];
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto text-left">
              <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                    {(selectedStudent || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedStudent}</h2>
                    <p className="text-xs text-slate-300">Complete Student Dossier & Active Submissions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6 flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Total Briefs</span>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">{studentSubs.length}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Student GPA</span>
                    <span className="text-2xl font-bold text-indigo-600 mt-1 block">
                      {primaryRecord?.gpa || '3.85'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Member Since</span>
                    <span className="text-sm font-bold text-slate-800 mt-2 block">
                      {primaryRecord?.joinedDate || 'Jan 2026'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Status</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mt-2 inline-block">
                      Active Student
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    <span>Contact Credentials</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Primary Email</span>
                      <span className="font-semibold text-slate-800 text-sm break-all">
                        {primaryRecord?.studentEmail || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone Number</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {primaryRecord?.studentPhone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>All Submitted Assignments ({studentSubs.length})</span>
                    </h3>
                    <span className="text-xs text-slate-400">Latest First</span>
                  </div>

                  <div className="space-y-4">
                    {studentSubs.map((item, idx) => {
                      const itemBrief = parseAssignmentBrief(item.pattern, item.fullDescription);
                      const assignedName = tutors[item.id] !== undefined ? tutors[item.id] : item.assignedTutor;
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                              #{idx + 1} • {item.subject}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                item.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                            {itemBrief.cleanSummary}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <span>
                              Deadline: <strong className="text-slate-700">{item.deadline}</strong>
                            </span>
                            <span>
                              Tutor:{' '}
                              <strong className={isTutorUnassigned(assignedName) ? 'text-amber-700' : 'text-indigo-600'}>
                                {isTutorUnassigned(assignedName) ? 'Unassigned' : assignedName}
                              </strong>
                            </span>
                            <div className="space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(null);
                                  setSelectedSubmissionDetail(item);
                                }}
                                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                              >
                                Brief
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(null);
                                  setActiveChatSubmission(item);
                                  setChatMode('tutor');
                                }}
                                className="text-amber-700 font-semibold hover:underline cursor-pointer"
                              >
                                Chat as Tutor
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 px-8 py-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DETAILED BRIEF INSPECTION MODAL */}
      {selectedSubmissionDetail && (() => {
        const tutorDisplay =
          tutors[selectedSubmissionDetail.id] !== undefined
            ? tutors[selectedSubmissionDetail.id]
            : selectedSubmissionDetail.assignedTutor;
        const tutorInitial = (tutorDisplay || 'U').charAt(0).toUpperCase();
        const detailParsed = parseAssignmentBrief(
          selectedSubmissionDetail.pattern,
          selectedSubmissionDetail.fullDescription
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-left">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 text-white p-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-md font-mono inline-block">
                    {selectedSubmissionDetail.id}
                  </span>
                  <h2 className="text-xl font-bold mt-2">{selectedSubmissionDetail.subject}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{selectedSubmissionDetail.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionDetail(null)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2">
                  <h4 className="font-bold text-slate-900">Student Brief Full Overview</h4>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {detailParsed.cleanSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold">Submitted Document</span>
                    <div className="flex items-center space-x-2.5 mt-2">
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 text-xs block truncate">
                          {selectedSubmissionDetail.documentName}
                        </span>
                        <span className="text-[11px] text-slate-400">{selectedSubmissionDetail.documentSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 block font-semibold">Assigned Specialist Tutor</span>
                    <div className="flex items-center space-x-2.5 mt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {tutorInitial}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 text-xs block truncate">
                          {isTutorUnassigned(tutorDisplay) ? 'Unassigned' : tutorDisplay}
                        </span>
                        <span className="text-[11px] text-amber-600 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{selectedSubmissionDetail.tutorRating} Rating</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Student Submission History Log</h4>
                  <div className="space-y-2">
                    {selectedSubmissionDetail.submissionHistory.map(hist => (
                      <div
                        key={hist.id}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs gap-2"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">{hist.title}</span>
                          <span className="text-slate-400">Submitted on {hist.date}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-white border border-slate-200 font-medium rounded text-slate-700 shrink-0">
                          {hist.status} ({hist.grade})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sub = selectedSubmissionDetail;
                    setSelectedSubmissionDetail(null);
                    setActiveChatSubmission(sub);
                    setChatMode('admin');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Admin Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sub = selectedSubmissionDetail;
                    setSelectedSubmissionDetail(null);
                    setActiveChatSubmission(sub);
                    setChatMode('tutor');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat as Tutor</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DUAL-MODE CHAT MODAL (ADMIN vs TUTOR) */}
      {activeChatSubmission && (() => {
        const tutorDisplay =
          tutors[activeChatSubmission.id] !== undefined
            ? tutors[activeChatSubmission.id]
            : activeChatSubmission.assignedTutor;
        const activeTutorLabel = isTutorUnassigned(tutorDisplay) ? 'Assigned Tutor' : tutorDisplay;
        const avatarChar = chatMode === 'admin' ? 'A' : activeTutorLabel.charAt(0).toUpperCase();

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-left">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
              {/* Chat Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      chatMode === 'admin' ? 'bg-indigo-600' : 'bg-amber-600'
                    }`}
                  >
                    {avatarChar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">
                      {chatMode === 'admin'
                        ? `Admin Portal: ${activeChatSubmission.studentName}`
                        : `Tutor Mode: ${activeTutorLabel}`}
                    </h3>
                    <p className="text-[11px] text-slate-300 truncate">{activeChatSubmission.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChatSubmission(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Mode Switcher */}
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">Posting as:</span>
                <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChatMode('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chatMode === 'admin'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    General Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatMode('tutor')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chatMode === 'tutor'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    As Tutor ({activeTutorLabel})
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
                <div className="text-center my-2">
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                    Secure Channel • Ref: {activeChatSubmission.id}
                  </span>
                </div>

                {activeChatSubmission.chatHistory.map((msg, idx) => {
                  const isStudent = msg.sender === 'student';
                  const isTutor = msg.sender === 'tutor';
                  return (
                    <div key={idx} className={`flex flex-col ${isStudent ? 'items-start' : 'items-end'}`}>
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                        {msg.roleLabel ||
                          (isStudent ? activeChatSubmission.studentName : isTutor ? 'Assigned Tutor' : 'Admin')}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                          isStudent
                            ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            : isTutor
                            ? 'bg-amber-700 text-white rounded-br-none'
                            : 'bg-indigo-600 text-white rounded-br-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={
                    chatMode === 'admin'
                      ? 'Type message as Admin...'
                      : `Type message as tutor ${activeTutorLabel}...`
                  }
                  value={chatMessageInput}
                  onChange={e => setChatMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage(activeChatSubmission.id)}
                  className={`flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                    chatMode === 'admin' ? 'focus:ring-indigo-500' : 'focus:ring-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => sendChatMessage(activeChatSubmission.id)}
                  className={`p-2.5 text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                    chatMode === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
