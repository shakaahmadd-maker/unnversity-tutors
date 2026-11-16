import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  FolderLock,
  GraduationCap,
  Headphones,
  Maximize2,
  MessageSquare,
  Minimize2,
  PanelRight,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  Assignment,
  AssignmentStatus,
  Chat,
  Message,
  User,
  UserRole,
} from '../types';
import { audioNotifier } from '../utils/audioNotification';
import { ErrorStatePanel, TabLoadingSkeleton } from './ui/StatePanels';
import { ResponsiveAvatar } from './ResponsiveImage';

export interface ChatConnectionDiagnosticsResult {
  chatId: string;
  active: boolean;
  messagesCount: number;
  lastMessages: Message[];
  error?: string;
}

interface OperationalChatDeskProps {
  currentUser: User;
  users: User[];
  chats: Chat[];
  messages: Message[];
  assignments: Assignment[];
  connectionStatus?: 'connected' | 'offline' | 'error' | 'syncing';
  isLoadingMessages?: boolean;
  chatError?: string | null;
  selectedChatId: string | null;
  onSelectChatId: (chatId: string | null) => void;
  onOpenInDrawer: (chat: Chat) => void;
  onSendMessage: (
    chatId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
    fileName?: string
  ) => void;
  onDeleteChat: (chatId: string) => void;
  onSubscribeToChatDetails?: (chatId: string) => void;
  onGetOrCreateChat?: (studentId: string, tutorId: string, subject?: string) => Chat;
  onTestChatConnection?: (chatId: string) => Promise<void> | void;
  testingChatConnectionId?: string | null;
  chatConnectionResult?: ChatConnectionDiagnosticsResult | null;
  onClearConnectionResult?: () => void;
  isPageExpanded: boolean;
  onTogglePageExpand: () => void;
  adminTabOptions?: { id: string; label: string }[];
  activeAdminTab?: string;
  onSwitchAdminTab?: (tabId: string) => void;
}

type DirectoryTab = 'rooms' | 'all-users' | 'students' | 'tutors';
type ChatChannelMode = 'tutor' | 'csr';

const TUTOR_QUICK_REPLIES = [
  'I have reviewed your uploaded files in the vault.',
  "Let's walk through the methodology step by step.",
  'Could you upload your latest draft brief so I can check it?',
  'Everything looks aligned with your syllabus deadline!',
];

const CSR_QUICK_REPLIES = [
  'Your billing escrow is verified and active.',
  'Please keep all payments & files inside the platform workspace.',
  'I have extended your submission review window by 24 hours.',
  'How else can Operational Support assist you today?',
];

export default function OperationalChatDesk({
  currentUser,
  users,
  chats,
  messages,
  assignments,
  connectionStatus = 'connected',
  isLoadingMessages = false,
  chatError = null,
  selectedChatId,
  onSelectChatId,
  onOpenInDrawer,
  onSendMessage,
  onDeleteChat,
  onSubscribeToChatDetails,
  onGetOrCreateChat,
  onTestChatConnection,
  testingChatConnectionId = null,
  chatConnectionResult = null,
  onClearConnectionResult,
  isPageExpanded,
  onTogglePageExpand,
  adminTabOptions = [],
  activeAdminTab = 'chats',
  onSwitchAdminTab,
}: OperationalChatDeskProps) {
  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>('rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChatChannelMode>('tutor');
  const [senderIdentity, setSenderIdentity] = useState<ChatChannelMode>('tutor');
  const [isInspectorVisible, setIsInspectorVisible] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileUrl, setAttachedFileUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [purgeTargetChatId, setPurgeTargetChatId] = useState<string | null>(null);

  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const isAdminIdentifier = (id?: string | null) => {
    if (!id) return false;
    const norm = id.trim().toLowerCase();
    if (
      norm.startsWith('admin_') ||
      norm === 'admin_emily' ||
      norm === 'admin_shaka' ||
      norm === currentUser.id.toLowerCase()
    ) {
      return true;
    }
    const matched = users.find(
      (u) => u.id.toLowerCase() === norm || u.email.toLowerCase() === norm
    );
    return matched?.role === UserRole.ADMIN;
  };

  const resolveUser = (id?: string | null, pairedFallback?: Partial<User> | null): Partial<User> | null => {
    if (!id && !pairedFallback) return null;
    if (id) {
      const found = users.find(
        (u) =>
          u.id === id ||
          u.email.toLowerCase() === id.toLowerCase()
      );
      if (found) return found;
    }
    return pairedFallback || null;
  };

  // Build normalized room entries so every chat shows Student, Tutor, CSR thread & counters
  const roomEntries = useMemo(() => {
    return chats.map((chat) => {
      const student = resolveUser(chat.studentId, (chat as any).pairedStudent);
      const isSupportPrimary = isAdminIdentifier(chat.tutorId);

      const linkedAssignment = assignments.find(
        (a) =>
          (chat.orderId && a.id === chat.orderId) ||
          (a.studentId === chat.studentId && a.tutorId === chat.tutorId) ||
          (a.studentId === chat.studentId && a.tutorId && !isAdminIdentifier(a.tutorId))
      );

      // Find both tutor thread and CSR support thread for this student
      const tutorRoom = !isSupportPrimary
        ? chat
        : chats.find((c) => c.studentId === chat.studentId && !isAdminIdentifier(c.tutorId)) || null;

      const csrRoom = isSupportPrimary
        ? chat
        : chats.find((c) => c.studentId === chat.studentId && isAdminIdentifier(c.tutorId)) || null;

      const resolvedTutorId = tutorRoom?.tutorId || linkedAssignment?.tutorId || (!isSupportPrimary ? chat.tutorId : null);
      const tutor = resolvedTutorId
        ? resolveUser(resolvedTutorId, (chat as any).pairedTutor)
        : null;

      const tutorMsgs = tutorRoom
        ? messages.filter((m) => m.chatId === tutorRoom.id)
        : [];
      const csrMsgs = csrRoom
        ? messages.filter((m) => m.chatId === csrRoom.id)
        : [];

      const ownMsgs = messages
        .filter((m) => m.chatId === chat.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const lastMsg = ownMsgs[0];
      const unreadCount = ownMsgs.filter(
        (m) => !m.read && m.senderId !== currentUser.id
      ).length;

      const studentAssignments = assignments.filter(
        (a) =>
          a.studentId === chat.studentId ||
          (student?.email && a.studentId.toLowerCase() === student.email.toLowerCase())
      );

      return {
        chat,
        id: chat.id,
        shortId: `#${chat.id.split('_')[1] || chat.id.slice(-8)}`,
        subject: chat.subject || linkedAssignment?.title || 'Academic Consultation',
        isSupportPrimary,
        studentId: chat.studentId,
        studentName: student?.name || 'Enrolled Student',
        studentEmail: student?.email || 'No email linked',
        studentAvatar: student?.avatarUrl || '',
        studentVerified: Boolean(student?.verified),
        tutorId: resolvedTutorId || '',
        tutorName: tutor?.name || (isSupportPrimary ? 'CSR Support Desk' : 'Assigned Specialist'),
        tutorEmail: tutor?.email || (isSupportPrimary ? 'support@university-tutors.com' : ''),
        tutorAvatar: tutor?.avatarUrl || '',
        tutorRating: tutor?.rating || 4.9,
        tutorRoom,
        csrRoom,
        tutorMsgCount: tutorMsgs.length,
        csrMsgCount: csrMsgs.length,
        lastMessageText: lastMsg
          ? lastMsg.content.replace(/\*\*|__/g, '')
          : 'No messages exchanged yet.',
        lastTime: lastMsg?.timestamp
          ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : chat.updatedAt
          ? new Date(chat.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'New',
        unreadCount,
        linkedAssignment,
        studentAssignments,
      };
    });
  }, [chats, messages, users, assignments, currentUser.id]);

  const activeEntry = useMemo(
    () => roomEntries.find((r) => r.id === selectedChatId) || roomEntries[0] || null,
    [roomEntries, selectedChatId]
  );

  // Keep active channel aligned if selected room only has CSR support thread
  useEffect(() => {
    if (!activeEntry) return;
    if (activeEntry.isSupportPrimary && !activeEntry.tutorRoom && activeChannel === 'tutor') {
      setActiveChannel('csr');
      setSenderIdentity('csr');
    } else if (!activeEntry.isSupportPrimary && activeEntry.tutorRoom && !activeEntry.csrRoom && activeChannel === 'csr') {
      // Allow admin to stay in CSR tab to start a CSR thread or default smoothly
    }
  }, [activeEntry?.id]);

  // Subscribe to details for whichever thread is visible (tutor + csr)
  useEffect(() => {
    if (!activeEntry || !onSubscribeToChatDetails) return;
    const targetId =
      activeChannel === 'csr'
        ? activeEntry.csrRoom?.id
        : activeEntry.tutorRoom?.id || activeEntry.id;
    if (targetId) {
      onSubscribeToChatDetails(targetId);
    }
  }, [activeEntry?.id, activeChannel, activeEntry?.csrRoom?.id, activeEntry?.tutorRoom?.id, onSubscribeToChatDetails]);

  const displayedChatObj = useMemo(() => {
    if (!activeEntry) return null;
    if (activeChannel === 'csr') {
      return activeEntry.csrRoom || activeEntry.chat;
    }
    return activeEntry.tutorRoom || activeEntry.chat;
  }, [activeEntry, activeChannel]);

  const displayedMessages = useMemo(() => {
    if (!activeEntry) return [];
    const targetChatId =
      activeChannel === 'csr'
        ? activeEntry.csrRoom?.id
        : activeEntry.tutorRoom?.id;
    if (!targetChatId) return [];
    return messages
      .filter((m) => m.chatId === targetChatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [activeEntry, activeChannel, messages]);

  // Smooth auto-scroll to newest message
  useEffect(() => {
    const el = feedContainerRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(raf);
  }, [activeEntry?.id, activeChannel, displayedMessages.length]);

  // Directory filters
  const filteredRooms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return roomEntries;
    return roomEntries.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        r.tutorName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.shortId.toLowerCase().includes(q)
    );
  }, [roomEntries, searchQuery]);

  const directoryUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = users.filter((u) => u.role === UserRole.STUDENT || u.role === UserRole.TUTOR);
    return list.filter((u) => {
      if (directoryTab === 'students' && u.role !== UserRole.STUDENT) return false;
      if (directoryTab === 'tutors' && u.role !== UserRole.TUTOR) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, directoryTab, searchQuery]);

  const studentsCount = useMemo(
    () => users.filter((u) => u.role === UserRole.STUDENT).length,
    [users]
  );
  const tutorsCount = useMemo(
    () => users.filter((u) => u.role === UserRole.TUTOR).length,
    [users]
  );
  const onlineUsersCount = useMemo(
    () => users.filter((u) => u.verified !== false && u.role !== UserRole.ADMIN).length,
    [users]
  );

  // Documents vault items for active student/room
  const vaultDocuments = useMemo(() => {
    if (!activeEntry) return [];
    const docs: { name: string; url: string; source: string }[] = [];

    const roomIds = new Set<string>();
    if (activeEntry.tutorRoom?.id) roomIds.add(activeEntry.tutorRoom.id);
    if (activeEntry.csrRoom?.id) roomIds.add(activeEntry.csrRoom.id);
    roomIds.add(activeEntry.id);

    messages
      .filter((m) => roomIds.has(m.chatId) && m.fileUrl)
      .forEach((m) => {
        docs.push({
          name: m.fileName || 'Chat Attachment',
          url: m.fileUrl!,
          source: 'Chat Attachment',
        });
      });

    activeEntry.studentAssignments.forEach((a) => {
      if (a.fileUrls && a.fileUrls.length > 0) {
        a.fileUrls.forEach((url, idx) => {
          docs.push({
            name:
              a.fileNames && a.fileNames[idx]
                ? a.fileNames[idx]
                : `Brief_Doc_${idx + 1}.pdf`,
            url,
            source: a.title,
          });
        });
      }
      if (a.tutorWorkFileUrl) {
        docs.push({
          name: a.tutorWorkFileName || 'Tutor_Solution_Work.pdf',
          url: a.tutorWorkFileUrl,
          source: 'Tutor Solution',
        });
      }
    });

    return docs;
  }, [activeEntry, messages]);

  // Handlers
  const handleSelectDirectoryUser = (user: User) => {
    const existingRoom = roomEntries.find(
      (r) =>
        r.studentId === user.id ||
        r.tutorId === user.id ||
        r.studentEmail.toLowerCase() === user.email.toLowerCase()
    );

    if (existingRoom) {
      onSelectChatId(existingRoom.id);
      if (existingRoom.isSupportPrimary && !existingRoom.tutorRoom) {
        setActiveChannel('csr');
        setSenderIdentity('csr');
      }
      showToast(`Opened active chat room for ${user.name}`);
      return;
    }

    if (onGetOrCreateChat) {
      if (user.role === UserRole.STUDENT) {
        const created = onGetOrCreateChat(
          user.id,
          currentUser.id || 'admin_shaka',
          '24/7 Support Desk'
        );
        onSelectChatId(created.id);
        setActiveChannel('csr');
        setSenderIdentity('csr');
        showToast(`Created CSR Support Desk room for ${user.name}`);
      } else {
        const firstStudent = users.find((u) => u.role === UserRole.STUDENT);
        if (firstStudent) {
          const created = onGetOrCreateChat(
            firstStudent.id,
            user.id,
            `Consultation with ${user.name}`
          );
          onSelectChatId(created.id);
          setActiveChannel('tutor');
          setSenderIdentity('tutor');
          showToast(`Opened tutor consultation room for ${user.name}`);
        } else {
          showToast(`No enrolled student available to pair with ${user.name}.`);
        }
      }
    }
  };

  const handleChannelSwitch = (channel: ChatChannelMode) => {
    setActiveChannel(channel);
    setSenderIdentity(channel);
  };

  const handleIdentitySwitch = (role: ChatChannelMode) => {
    setSenderIdentity(role);
    if (activeChannel !== role) {
      setActiveChannel(role);
    }
  };

  const handleCopyRoomId = () => {
    if (!activeEntry) return;
    navigator.clipboard?.writeText(activeEntry.shortId).catch(() => {});
    showToast(`Copied Room ID ${activeEntry.shortId} to clipboard`);
  };

  const handleSyncRoom = () => {
    if (!activeEntry) return;
    const targetId =
      activeChannel === 'csr'
        ? activeEntry.csrRoom?.id || activeEntry.id
        : activeEntry.tutorRoom?.id || activeEntry.id;
    onSubscribeToChatDetails?.(targetId);
    onTestChatConnection?.(targetId);
    showToast('Synced latest messages & escrow logs.');
  };

  const handleSendComplianceWarning = () => {
    if (!activeEntry) return;
    const targetId =
      activeChannel === 'csr'
        ? activeEntry.csrRoom?.id || activeEntry.id
        : activeEntry.tutorRoom?.id || activeEntry.id;
    onSendMessage(
      targetId,
      currentUser.id,
      'Compliance Notice: Please keep all academic files, communications, and milestone escrows strictly inside the official University-Tutors workspace.'
    );
    audioNotifier.playSentSound();
    showToast('System compliance reminder sent to participants.');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !attachedFileName) || !activeEntry) return;

    let targetChatId: string | undefined;
    let senderId: string;

    if (senderIdentity === 'csr') {
      if (activeEntry.csrRoom) {
        targetChatId = activeEntry.csrRoom.id;
      } else if (onGetOrCreateChat) {
        const created = onGetOrCreateChat(
          activeEntry.studentId,
          currentUser.id || 'admin_shaka',
          '24/7 Support Desk'
        );
        targetChatId = created.id;
      } else {
        targetChatId = activeEntry.id;
      }
      senderId = currentUser.id;
    } else {
      if (activeEntry.tutorRoom) {
        targetChatId = activeEntry.tutorRoom.id;
        senderId = activeEntry.tutorRoom.tutorId;
      } else if (activeEntry.tutorId && onGetOrCreateChat) {
        const created = onGetOrCreateChat(
          activeEntry.studentId,
          activeEntry.tutorId,
          activeEntry.subject
        );
        targetChatId = created.id;
        senderId = activeEntry.tutorId;
      } else {
        targetChatId = activeEntry.id;
        senderId = activeEntry.tutorId || currentUser.id;
      }
    }

    if (!targetChatId) return;

    onSendMessage(
      targetChatId,
      senderId,
      replyText.trim() || `Shared file: ${attachedFileName}`,
      attachedFileUrl || undefined,
      attachedFileName || undefined
    );
    audioNotifier.playSentSound();
    setReplyText('');
    setAttachedFileName('');
    setAttachedFileUrl('');
  };

  const handleConfirmPurge = () => {
    if (!purgeTargetChatId) return;
    const purgedId = purgeTargetChatId;
    onDeleteChat(purgedId);
    if (selectedChatId === purgedId) {
      const next = roomEntries.find((r) => r.id !== purgedId);
      onSelectChatId(next ? next.id : null);
    }
    setPurgeTargetChatId(null);
    showToast('Chat thread archived & purged.');
  };

  const quickReplies = senderIdentity === 'csr' ? CSR_QUICK_REPLIES : TUTOR_QUICK_REPLIES;

  return (
    <div
      id="admin-chats-monitor-panel"
      className={`flex flex-col w-full transition-all duration-200 ${
        isPageExpanded ? 'h-full flex-1 bg-slate-100 p-0' : 'min-h-[780px]'
      }`}
    >
      {/* OUTER CONTROL DESK CARD */}
      <div
        className={`bg-white border border-slate-200/80 flex flex-col flex-1 overflow-hidden ${
          isPageExpanded
            ? 'rounded-none h-full shadow-none'
            : 'rounded-2xl shadow-xs min-h-[780px]'
        }`}
      >
        {/* TOP HEADER BAR */}
        <header className="px-4 sm:px-6 py-4 border-b border-slate-200/80 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 shrink-0 text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-orange-700">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'error'
                    ? 'bg-rose-500'
                    : connectionStatus === 'syncing'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-orange-500 animate-pulse'
                }`}
              />
              <span>Live Systems Monitoring Deck</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Operational Support &amp; Chat Control Desk
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Audit, join, or moderate active student-tutor conversations. Enforce syllabus compliance &amp; secure billing escrows.
            </p>
          </div>

          {/* Global Deck Controls & EXPAND BUTTON */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Stats Readout */}
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs tabular-nums">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Active Users:</span>
                <span className="font-semibold text-slate-800">{onlineUsersCount}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Active Rooms:</span>
                <span className="font-semibold text-slate-800">{chats.length}</span>
              </div>
            </div>

            {isPageExpanded && adminTabOptions.length > 0 && onSwitchAdminTab && (
              <select
                aria-label="Switch admin section"
                value={activeAdminTab}
                onChange={(e) => onSwitchAdminTab(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {adminTabOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Toggle Context Drawer Button */}
            <button
              type="button"
              onClick={() => setIsInspectorVisible((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PanelRight className="w-4 h-4 text-slate-600" />
              <span>{isInspectorVisible ? 'Hide Records' : 'Show Records'}</span>
            </button>

            {/* EXPAND FULL PAGE BUTTON */}
            <button
              type="button"
              onClick={onTogglePageExpand}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isPageExpanded ? (
                <>
                  <Minimize2 className="w-4 h-4 text-orange-400" />
                  <span>Exit Full Page</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-orange-400" />
                  <span>Expand Full Page</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 3-COLUMN WORKSPACE BODY */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
          {/* ========================================== */}
          {/* LEFT PANE: ALL USERS & CHAT ROOMS LIST     */}
          {/* ========================================== */}
          <aside className="w-full lg:w-[330px] xl:w-[360px] border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/60 flex flex-col shrink-0 max-h-[360px] lg:max-h-none min-h-0 text-left">
            {/* Directory Header & View Switcher */}
            <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Directory &amp; Rooms</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {connectionStatus === 'syncing'
                    ? 'Syncing…'
                    : connectionStatus === 'error'
                    ? 'Check Sync'
                    : 'Live Sync'}
                </span>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, email, ID or subject..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-medium tabular-nums">
                <button
                  type="button"
                  onClick={() => setDirectoryTab('rooms')}
                  className={`py-1.5 px-1.5 rounded-lg transition cursor-pointer truncate ${
                    directoryTab === 'rooms'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rooms ({chats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryTab('all-users')}
                  className={`py-1.5 px-1.5 rounded-lg transition cursor-pointer truncate ${
                    directoryTab === 'all-users'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({studentsCount + tutorsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryTab('students')}
                  className={`py-1.5 px-1.5 rounded-lg transition cursor-pointer truncate ${
                    directoryTab === 'students'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryTab('tutors')}
                  className={`py-1.5 px-1.5 rounded-lg transition cursor-pointer truncate ${
                    directoryTab === 'tutors'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tutors
                </button>
              </div>
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
              {directoryTab === 'rooms' ? (
                filteredRooms.length === 0 ? (
                  <div className="text-center py-10 px-4 text-xs text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">
                      {chats.length === 0
                        ? 'No active chat rooms registered yet'
                        : 'No matching chat rooms found'}
                    </p>
                    <p className="mt-1">
                      Switch to &ldquo;All&rdquo; or &ldquo;Students&rdquo; to open a room with any user.
                    </p>
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const isSelected = activeEntry?.id === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => onSelectChatId(room.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-orange-500 ring-2 ring-orange-500/15 shadow-2xs'
                            : 'bg-white/85 hover:bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {room.shortId}
                          </span>
                          <div className="flex items-center gap-1.5 tabular-nums">
                            <span className="text-[10px] text-slate-400">{room.lastTime}</span>
                            {room.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                                {room.unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Student & Tutor Compact Pair */}
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="relative flex -space-x-2 shrink-0">
                            <ResponsiveAvatar
                              src={room.studentAvatar}
                              alt={room.studentName}
                              sizePx={32}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white bg-slate-200"
                            />
                            <ResponsiveAvatar
                              src={room.tutorAvatar}
                              alt={room.tutorName}
                              sizePx={32}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white bg-orange-100"
                            />
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                room.studentVerified ? 'bg-emerald-500' : 'bg-slate-300'
                              } ring-2 ring-white absolute -bottom-0.5 -right-0.5`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {room.studentName}{' '}
                              <span className="text-slate-400 font-normal">↔</span>{' '}
                              {room.tutorName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {room.subject}
                            </p>
                          </div>
                        </div>

                        {/* Channel Counters & Last Message Preview */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                          <p className="text-[11px] text-slate-500 truncate flex-1">
                            &ldquo;{room.lastMessageText}&rdquo;
                          </p>
                          <div className="flex items-center gap-1 shrink-0 tabular-nums">
                            <span
                              title="Tutor Consultation Messages"
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                            >
                              T:{room.tutorMsgCount}
                            </span>
                            <span
                              title="CSR Support Desk Messages"
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-200/70"
                            >
                              CSR:{room.csrMsgCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : directoryUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No users match your filter.
                </div>
              ) : (
                directoryUsers.map((user) => {
                  const isStudent = user.role === UserRole.STUDENT;
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectDirectoryUser(user)}
                      className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-orange-300 cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <ResponsiveAvatar
                            src={user.avatarUrl}
                            alt={user.name}
                            sizePx={36}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover bg-slate-100"
                          />
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              user.verified !== false ? 'bg-emerald-500' : 'bg-slate-300'
                            } ring-2 ring-white absolute bottom-0 right-0`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                isStudent
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
                            >
                              {isStudent ? 'Student' : 'Tutor'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-[11px] font-semibold transition shrink-0">
                        <span>Chat</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ========================================== */}
          {/* CENTER PANE: ACTIVE CHAT ROOM              */}
          {/* ========================================== */}
          <main className="flex-1 flex flex-col bg-white min-w-0 min-h-0 text-left">
            {activeEntry ? (
              <>
                {/* Chat Room Top Bar */}
                <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 bg-white flex flex-col gap-3 shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Overlapping Avatars */}
                      <div className="relative flex -space-x-2.5 shrink-0">
                        <ResponsiveAvatar
                          src={activeEntry.studentAvatar}
                          alt={activeEntry.studentName}
                          sizePx={40}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white bg-slate-200"
                        />
                        <ResponsiveAvatar
                          src={activeEntry.tutorAvatar}
                          alt={activeEntry.tutorName}
                          sizePx={40}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white bg-orange-100"
                        />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {activeEntry.studentName} ↔ {activeEntry.tutorName}
                          </h4>
                          <button
                            type="button"
                            onClick={handleCopyRoomId}
                            title="Click to copy Room ID"
                            className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition cursor-pointer"
                          >
                            <span>{activeEntry.shortId}</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {activeEntry.subject} · Escrow Secured
                        </p>
                      </div>
                    </div>

                    {/* Room Moderation Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleSyncRoom}
                        disabled={testingChatConnectionId === (displayedChatObj?.id || activeEntry.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition cursor-pointer disabled:opacity-50"
                        title="Sync room & verify PostgreSQL listener"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            testingChatConnectionId === (displayedChatObj?.id || activeEntry.id)
                              ? 'animate-spin'
                              : ''
                          }`}
                        />
                        <span className="hidden sm:inline">Sync</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendComplianceWarning}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                        title="Send Platform Compliance Reminder"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Warn</span>
                      </button>

                      {displayedChatObj && (
                        <button
                          type="button"
                          onClick={() => onOpenInDrawer(displayedChatObj)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
                          title="Open this thread in floating drawer overlay"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" />
                          <span className="hidden xl:inline">Drawer</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setPurgeTargetChatId(
                            activeChannel === 'csr'
                              ? activeEntry.csrRoom?.id || activeEntry.id
                              : activeEntry.tutorRoom?.id || activeEntry.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                        title="Purge Active Thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Purge</span>
                      </button>
                    </div>
                  </div>

                  {/* SEPARATE CHAT CHANNELS SWITCHER (TUTOR CHAT VS CSR CHAT) */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 flex-wrap">
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
                      <button
                        type="button"
                        onClick={() => handleChannelSwitch('tutor')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                          activeChannel === 'tutor'
                            ? 'font-semibold bg-emerald-600 text-white shadow-2xs'
                            : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span>1. Tutor Consultation Chat</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                            activeChannel === 'tutor'
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {activeEntry.tutorMsgCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChannelSwitch('csr')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                          activeChannel === 'csr'
                            ? 'font-semibold bg-orange-600 text-white shadow-2xs'
                            : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <Headphones
                          className={`w-3.5 h-3.5 shrink-0 ${
                            activeChannel === 'csr' ? 'text-white' : 'text-orange-600'
                          }`}
                        />
                        <span>2. CSR Support Desk Chat</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                            activeChannel === 'csr'
                              ? 'bg-white/20 text-white'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {activeEntry.csrMsgCount}
                        </span>
                      </button>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                        activeChannel === 'tutor'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                          : 'text-orange-700 bg-orange-50 border-orange-200/70'
                      }`}
                    >
                      {activeChannel === 'tutor'
                        ? 'Academic Thread: Student ↔ Tutor'
                        : 'Support Desk Thread: Private CSR Assistance'}
                    </span>
                  </div>
                </div>

                {/* Optional Diagnostics Banner if Sync Test was triggered */}
                {chatConnectionResult &&
                  (chatConnectionResult.chatId === activeEntry.id ||
                    chatConnectionResult.chatId === activeEntry.tutorRoom?.id ||
                    chatConnectionResult.chatId === activeEntry.csrRoom?.id) && (
                    <div
                      className={`px-4 py-3 border-b text-xs flex items-center justify-between gap-3 shrink-0 ${
                        chatConnectionResult.error
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : chatConnectionResult.active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {chatConnectionResult.error ? (
                          <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-semibold truncate">
                          {chatConnectionResult.error
                            ? `DB Sync Error: ${chatConnectionResult.error}`
                            : `DB Sync Verified — ${chatConnectionResult.messagesCount} stored messages in thread`}
                        </span>
                      </div>
                      {onClearConnectionResult && (
                        <button
                          type="button"
                          onClick={onClearConnectionResult}
                          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer shrink-0"
                          title="Dismiss sync status"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                {/* Chat Messages Feed */}
                <div
                  ref={feedContainerRef}
                  className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 transition-colors duration-300 min-h-0 ${
                    activeChannel === 'csr' ? 'bg-orange-50/25' : 'bg-emerald-50/20'
                  }`}
                >
                  {chatError ? (
                    <ErrorStatePanel
                      title="Unable to load messages"
                      message={chatError}
                      onRetry={handleSyncRoom}
                    />
                  ) : isLoadingMessages && displayedMessages.length === 0 ? (
                    <TabLoadingSkeleton rows={3} />
                  ) : displayedMessages.length === 0 ? (
                    <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                        {activeChannel === 'csr' ? (
                          <Headphones className="w-6 h-6" />
                        ) : (
                          <MessageSquare className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No messages in this{' '}
                        {activeChannel === 'csr'
                          ? 'CSR Support Desk'
                          : 'Tutor Consultation'}{' '}
                        thread yet
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Use the composer below to send a message as{' '}
                        {activeChannel === 'csr'
                          ? 'CSR Support Desk'
                          : activeEntry.tutorName}
                        .
                      </p>
                    </div>
                  ) : (
                    displayedMessages.map((msg) => {
                      const isSystem = msg.isSystem || msg.senderId === 'system';
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center my-2">
                            <span className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl text-xs font-medium text-center max-w-lg">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      const senderUser = resolveUser(msg.senderId);
                      const isStudentMsg =
                        msg.senderId === activeEntry.studentId ||
                        senderUser?.role === UserRole.STUDENT;
                      const isCsrMsg =
                        !isStudentMsg &&
                        (isAdminIdentifier(msg.senderId) ||
                          senderUser?.role === UserRole.ADMIN);

                      const formattedTime = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent';

                      if (isCsrMsg) {
                        return (
                          <div
                            key={msg.id}
                            className="flex flex-col items-end ml-auto max-w-2xl"
                          >
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                {formattedTime} ·
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {senderUser?.name || 'CSR Support Desk'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">
                                CSR Desk
                              </span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-orange-600 text-white text-sm leading-relaxed shadow-xs">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              {msg.fileUrl && (
                                <div className="mt-2.5 p-2 rounded-xl bg-white/15 border border-white/25 flex items-center justify-between gap-2 text-xs">
                                  <span className="truncate font-mono">
                                    {msg.fileName || 'Attachment'}
                                  </span>
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-2 py-1 bg-white text-orange-700 rounded-lg text-[10px] font-bold shrink-0"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      if (isStudentMsg) {
                        return (
                          <div
                            key={msg.id}
                            className="flex flex-col items-start max-w-2xl"
                          >
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                                Student
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {senderUser?.name || activeEntry.studentName}
                              </span>
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                · {formattedTime}
                              </span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-blue-200/80 text-slate-800 text-sm leading-relaxed shadow-2xs">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              {msg.fileUrl && (
                                <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                  <span className="truncate font-mono text-slate-700">
                                    {msg.fileName || 'Attachment'}
                                  </span>
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold shrink-0"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Tutor Message
                      return (
                        <div
                          key={msg.id}
                          className="flex flex-col items-end ml-auto max-w-2xl"
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {formattedTime} ·
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              {senderUser?.name || activeEntry.tutorName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                              Tutor
                            </span>
                          </div>
                          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-slate-900 text-white text-sm leading-relaxed shadow-xs">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.fileUrl && (
                              <div className="mt-2.5 p-2 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between gap-2 text-xs">
                                <span className="truncate font-mono">
                                  {msg.fileName || 'Attachment'}
                                </span>
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold shrink-0"
                                >
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Admin / Moderator Dual-Role Message Input Bar */}
                <div
                  className={`p-3.5 sm:p-4 bg-white border-t-2 shrink-0 transition-colors duration-300 ${
                    senderIdentity === 'csr'
                      ? 'border-orange-500/50'
                      : 'border-emerald-500/50'
                  }`}
                >
                  <form onSubmit={handleSend} className="flex flex-col gap-2.5">
                    {/* Top Bar: Identity Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          You are talking as:
                        </span>
                        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleIdentitySwitch('tutor')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                              senderIdentity === 'tutor'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[170px]">
                              Tutor ({activeEntry.tutorName})
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleIdentitySwitch('csr')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                              senderIdentity === 'csr'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Headphones
                              className={`w-3.5 h-3.5 ${
                                senderIdentity === 'csr' ? 'text-white' : 'text-orange-600'
                              }`}
                            />
                            <span>CSR Support</span>
                          </button>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                          senderIdentity === 'csr'
                            ? 'text-orange-700 bg-orange-50 border-orange-200'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {senderIdentity === 'csr'
                          ? 'Replying in CSR Support Desk Chat'
                          : `Replying as ${activeEntry.tutorName} in Tutor Chat`}
                      </span>
                    </div>

                    {/* One-Click Quick Reply Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {senderIdentity === 'csr' ? 'Quick CSR:' : 'Quick Tutor:'}
                      </span>
                      {quickReplies.map((tmpl) => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() => setReplyText(tmpl)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                            senderIdentity === 'csr'
                              ? 'bg-orange-50/80 hover:bg-orange-100 text-orange-800 border-orange-200/70'
                              : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border-emerald-200/70'
                          }`}
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>

                    {/* Attachment Preview Chip */}
                    {attachedFileName && (
                      <div className="flex items-center gap-2 text-xs bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1.5 rounded-xl w-fit max-w-full">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-mono font-semibold">
                          {attachedFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFileName('');
                            setAttachedFileUrl('');
                          }}
                          className="text-orange-600 hover:text-rose-600 font-bold cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Input Field & Submit */}
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setAttachedFileName(f.name);
                            setAttachedFileUrl(URL.createObjectURL(f));
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition shrink-0"
                        title="Attach document file"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          senderIdentity === 'csr'
                            ? 'Write support reply as CSR Desk...'
                            : `Reply to ${activeEntry.studentName} as ${activeEntry.tutorName}...`
                        }
                        className={`flex-1 min-w-0 px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          senderIdentity === 'csr'
                            ? 'focus:ring-orange-500/20 focus:border-orange-500'
                            : 'focus:ring-emerald-500/20 focus:border-emerald-500'
                        }`}
                      />

                      <button
                        type="submit"
                        disabled={!replyText.trim() && !attachedFileName}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-95 shrink-0 cursor-pointer disabled:opacity-50 ${
                          senderIdentity === 'csr'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <span>
                          {senderIdentity === 'csr' ? 'Send as CSR' : 'Send as Tutor'}
                        </span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="m-auto text-center space-y-3 p-8 max-w-sm">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">
                  Operational Support &amp; Chat Control Desk
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select an active room or pick any Student/Tutor from the left directory to audit threads, inspect submissions, or reply as Tutor or CSR.
                </p>
              </div>
            )}
          </main>

          {/* ========================================================= */}
          {/* RIGHT PANE: COLLAPSIBLE CONTEXT, SUBMISSIONS & DOCUMENTS  */}
          {/* ========================================================= */}
          {isInspectorVisible && activeEntry && (
            <aside className="w-full lg:w-[320px] xl:w-[360px] border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-slate-50/70 flex flex-col shrink-0 overflow-y-auto min-h-0 text-left">
              {/* Participants Card */}
              <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thread Participants
                </h4>

                {/* Student Mini Profile */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ResponsiveAvatar
                      src={activeEntry.studentAvatar}
                      alt={activeEntry.studentName}
                      sizePx={36}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover bg-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {activeEntry.studentName}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                          Student
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {activeEntry.studentEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tutor Mini Profile */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ResponsiveAvatar
                      src={activeEntry.tutorAvatar}
                      alt={activeEntry.tutorName}
                      sizePx={36}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover bg-orange-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {activeEntry.tutorName}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          {activeEntry.isSupportPrimary && !activeEntry.tutorRoom
                            ? 'CSR'
                            : 'Tutor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {activeEntry.isSupportPrimary && !activeEntry.tutorRoom
                          ? '24/7 Support Specialist'
                          : `★ ${activeEntry.tutorRating} · Verified Specialist`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Submission Histories */}
              <div className="p-4 border-b border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                    <span>Submission Histories</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/70 text-slate-700 tabular-nums">
                    {activeEntry.studentAssignments.length} Total
                  </span>
                </div>

                {activeEntry.studentAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No coursework submissions recorded for this student yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {activeEntry.studentAssignments.map((sub) => {
                      const subTutor = resolveUser(sub.tutorId);
                      return (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 leading-snug">
                              {sub.title}
                            </p>
                            {sub.fileUrls && sub.fileUrls.length > 0 && (
                              <a
                                href={sub.fileUrls[0]}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 shrink-0 transition"
                                title="Download brief"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                            <span>
                              Subject: <strong className="text-slate-700">{sub.subject}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Due: <strong className="text-slate-700">{sub.deadline}</strong>
                            </span>
                          </div>
                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500 truncate">
                              Tutor:{' '}
                              <span className="text-orange-600 font-semibold">
                                {subTutor?.name || sub.tutorId || 'Unassigned'}
                              </span>
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${
                                sub.status === AssignmentStatus.COMPLETED
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                                  : sub.status === AssignmentStatus.IN_PROGRESS
                                  ? 'bg-blue-50 text-blue-700 border-blue-200/70'
                                  : 'bg-amber-50 text-amber-700 border-amber-200/70'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Student Documents & Attachments Vault */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FolderLock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Documents Vault</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700 tabular-nums">
                    {vaultDocuments.length} Files
                  </span>
                </div>

                {vaultDocuments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No documents uploaded in this chat or assignment yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vaultDocuments.map((doc, idx) => (
                      <div
                        key={`${doc.name}-${idx}`}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2.5 hover:border-orange-300 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/70 flex items-center justify-center text-orange-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {doc.source}
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 shrink-0 transition"
                          title={`Download ${doc.name}`}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Custom Purge Confirmation Modal */}
      {purgeTargetChatId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Purge Active Chat Thread?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will permanently remove all stored messages and receipts for this room.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPurgeTargetChatId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
              >
                Yes, Purge Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
