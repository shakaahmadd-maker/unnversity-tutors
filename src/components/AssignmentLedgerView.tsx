import React, { useState, useEffect } from 'react';
import { User, Chat, AssignmentStatus } from '../types';
import { audioNotifier } from '../utils/audioNotification';
import { store } from '../lib/store';

// Inline SVG Icon components to replace react-icons and ensure standalone compilation
const IconFileText = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
);
const IconUser = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
);
const IconClock = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);
const IconCheckCircle = () => (
  <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);
const IconAlertCircle = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
);
const IconMessageSquare = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
);
const IconSend = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
);
const IconX = () => (
  <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
);
const IconDownload = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
);
const IconBriefcase = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.222-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
);
const IconStar = () => (
  <svg className="w-3.5 h-3.5 inline-block" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
);

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
}

export default function AssignmentLedgerView({
  initialData,
  tutorsList,
  currentUser,
  users,
  chats,
  onAssignTutor,
  onSetAssignmentPrice,
  onUpdateAssignmentStatus,
  onSendMessage,
  onGetOrCreateChat,
  onSelectChat,
  setActiveTab,
  setSelectedChatId,
  setReplyAsTutor,
  toStoreStatus,
  onSeedMockStudentData
}: AssignmentLedgerViewProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialData);
  const [activeTab, setSubTab] = useState("All Requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null); // Full student profile view
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<SubmissionItem | null>(null); // Detailed submission drawer
  
  // Chat state supports chatMode: 'admin' or 'tutor'
  const [activeChatSubmission, setActiveChatSubmission] = useState<SubmissionItem | null>(null); 
  const [chatMode, setChatMode] = useState<"admin" | "tutor">("admin"); // 'admin' or 'tutor'
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  
  // Editable states for price and tutor assignment in the main list
  const [prices, setPrices] = useState<Record<string, string | number>>(
    initialData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.price ?? "" }), {})
  );
  const [tutors, setTutors] = useState<Record<string, string>>(
    initialData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.assignedTutor }), {})
  );

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSubmissions(initialData);
      setPrices(prev => {
        const next = { ...prev };
        for (const item of initialData) {
          if (next[item.id] === undefined) {
            next[item.id] = item.price ?? "";
          }
        }
        return next;
      });
      setTutors(prev => {
        const next = { ...prev };
        for (const item of initialData) {
          if (!next[item.id]) {
            next[item.id] = item.assignedTutor;
          }
        }
        return next;
      });
    }
  }, [initialData]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePriceChange = (id: string, val: string) => {
    setPrices(prev => ({ ...prev, [id]: val }));
  };

  const handlePriceSave = async (id: string) => {
    const val = prices[id];
    const numVal = val ? Number(val) : null;
    setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, price: numVal } : sub));
    
    // Persist to store/database
    if (numVal !== null && !isNaN(numVal)) {
      try {
        if (onSetAssignmentPrice) {
          await onSetAssignmentPrice(id, numVal);
        } else {
          await store.setAssignmentPrice(id, numVal);
        }
      } catch (e) {
        console.warn("Notice updating price:", e);
      }
    }
    showNotification(`Price updated to ${val ? '$' + val : 'Unpriced'}`);
  };

  const handleTutorChange = async (id: string, tutorName: string) => {
    setTutors(prev => ({ ...prev, [id]: tutorName }));
    setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, assignedTutor: tutorName } : sub));
    
    // Find tutor id if available in users
    const matchedTutorUser = users.find(u => u.name.toLowerCase().trim() === tutorName.toLowerCase().trim());
    const targetTutorId = matchedTutorUser?.id || (tutorName.includes('Clara') ? 'tutor_clara' : 'tutor_alan');

    try {
      if (onAssignTutor) {
        await onAssignTutor(id, targetTutorId);
      } else {
        await store.assignTutorToAssignment(id, targetTutorId);
      }
    } catch (e) {
      console.warn("Notice assigning tutor:", e);
    }

    showNotification(`Assigned tutor updated to ${tutorName}`);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
    
    // Persist to store
    try {
      const mapped = toStoreStatus(newStatus);
      if (onUpdateAssignmentStatus) {
        await onUpdateAssignmentStatus(id, mapped);
      } else {
        await store.updateAssignmentStatus(id, mapped);
      }
    } catch (e) {
      console.warn("Notice updating status:", e);
    }

    showNotification(`Status updated to ${newStatus}`);
  };

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesTab = 
      activeTab === "All Requests" ? true :
      activeTab === "Pending/Incoming" ? sub.status === "Pending/Incoming" :
      activeTab === "In Progress" ? sub.status === "In Progress" :
      activeTab === "Completed" ? sub.status === "Completed" :
      activeTab === "Revision" ? sub.status === "Revision" : true;

    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const sendChatMessage = (subId: string) => {
    if (!chatMessageInput.trim()) return;
    
    const senderKey = chatMode === 'admin' ? 'admin' : 'tutor';
    const tutorDisplayName = tutors[subId] || submissions.find(s => s.id === subId)?.assignedTutor || 'Assigned Tutor';
    const roleLabel = chatMode === 'admin' ? 'Admin' : `${tutorDisplayName} (Tutor)`;
    const newMsg = { sender: senderKey, roleLabel: roleLabel, text: chatMessageInput.trim(), time: "Just now" };

    setSubmissions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return {
          ...sub,
          chatHistory: [...sub.chatHistory, newMsg]
        };
      }
      return sub;
    }));
    
    // Also update active chat object in real-time
    if (activeChatSubmission && activeChatSubmission.id === subId) {
      setActiveChatSubmission(prev => prev ? {
        ...prev,
        chatHistory: [...prev.chatHistory, newMsg]
      } : null);
    }

    // Play chime sound
    audioNotifier.playSentSound();

    // Sync with chat room if possible
    const currentSub = submissions.find(s => s.id === subId) || activeChatSubmission;
    if (currentSub) {
      const studentUser = users.find(u => u.name.toLowerCase().trim() === currentSub.studentName.toLowerCase().trim() || u.email.toLowerCase().trim() === currentSub.studentEmail.toLowerCase().trim());
      const studentIdentifier = studentUser?.id || currentSub.studentEmail;
      const matchedTutor = users.find(u => u.name.toLowerCase().trim() === tutorDisplayName.toLowerCase().trim());
      const tutorIdentifier = matchedTutor?.id || 'tutor_clara';

      if (onGetOrCreateChat) {
        const chat = onGetOrCreateChat(studentIdentifier, tutorIdentifier, currentSub.title);
        const senderId = chatMode === 'admin' ? currentUser.id : tutorIdentifier;
        onSendMessage(chat.id, senderId, chatMessageInput.trim());
      }
    }

    setChatMessageInput("");
    showNotification(`Message sent as ${chatMode === 'admin' ? 'Admin' : 'Assigned Tutor'}`);
  };

  // Seed sample student demands for demo and functional assignment workflow
  const handleSeedDemands = async () => {
    try {
      if (onSeedMockStudentData) {
        await onSeedMockStudentData();
      }

      // Generate 2 sample incoming briefs with unassigned tutor
      const mock1Id = `assign_${Date.now()}_seed1`;
      const mock2Id = `assign_${Date.now() + 1}_seed2`;

      try {
        await store.addAssignment(
          "user_student_alex",
          "Deep Learning Project Architecture",
          "Machine Learning (Neural Networks)",
          "2026-11-20",
          "Need guidance with PyTorch implementation of transformer attention layers and hyperparameter optimization.",
          1500,
          "IEEE",
          5,
          [],
          ["DeepLearning_Architecture_Brief.pdf"],
          ""
        );
        await store.addAssignment(
          "user_student_emma",
          "CRISPR Genome Editing Protocol",
          "Biochemistry & Genetics",
          "2026-11-22",
          "Requires review of molecular biology experimental methodology and statistical analysis of assay findings.",
          2000,
          "APA 7th",
          8,
          [],
          ["CRISPR_Protocol_Brief.pdf"],
          ""
        );
      } catch (err) {
        console.warn("Could not save to store, adding to local state:", err);
      }

      const newDemands: SubmissionItem[] = [
        {
          id: mock1Id,
          studentName: "Alex Rivera",
          studentEmail: "alex.rivera@stanford.edu",
          studentAvatar: "A",
          studentPhone: "+1 (555) 438-9921",
          totalSubmissions: 1,
          joinedDate: "Nov 2026",
          gpa: "3.90",
          subject: "Machine Learning (Neural Networks)",
          title: "Deep Learning Project Architecture",
          pattern: "=== University-Tutors Matching Funnel Request === TUTORING SERVICE PATTERN: Neural Network Architecture...",
          fullDescription: "Need guidance with PyTorch implementation of transformer attention layers and hyperparameter optimization.",
          documentName: "DeepLearning_Architecture_Brief.pdf",
          documentSize: "3.4 MB",
          documentUrl: "",
          status: "Pending/Incoming",
          deadline: "2026-11-20",
          price: null,
          assignedTutor: "",
          tutorRating: 5.0,
          chatHistory: [
            { sender: "student", roleLabel: "Alex Rivera (Student)", text: "Hello! I need an expert in PyTorch to review my deep learning model architecture.", time: "Just now" }
          ],
          submissionHistory: [
            { id: `sub_${Date.now()}_1`, title: "Deep Learning Project Architecture", date: "2026-11-06", status: "Pending/Incoming", grade: "Pending" }
          ]
        },
        {
          id: mock2Id,
          studentName: "Emma Watson",
          studentEmail: "emma.w@columbia.edu",
          studentAvatar: "E",
          studentPhone: "+1 (555) 762-3344",
          totalSubmissions: 1,
          joinedDate: "Nov 2026",
          gpa: "3.95",
          subject: "Biochemistry & Genetics",
          title: "CRISPR Genome Editing Protocol",
          pattern: "=== University-Tutors Matching Funnel Request === TUTORING SERVICE PATTERN: Molecular Biology Research...",
          fullDescription: "Requires review of molecular biology experimental methodology and statistical analysis of assay findings.",
          documentName: "CRISPR_Protocol_Brief.pdf",
          documentSize: "2.8 MB",
          documentUrl: "",
          status: "Pending/Incoming",
          deadline: "2026-11-22",
          price: null,
          assignedTutor: "",
          tutorRating: 4.9,
          chatHistory: [
            { sender: "student", roleLabel: "Emma Watson (Student)", text: "Hi, I have a lab report protocol on CRISPR assay design that needs specialist verification.", time: "Just now" }
          ],
          submissionHistory: [
            { id: `sub_${Date.now()}_2`, title: "CRISPR Genome Editing Protocol", date: "2026-11-06", status: "Pending/Incoming", grade: "Pending" }
          ]
        }
      ];

      setSubmissions(prev => [...newDemands, ...prev]);
      audioNotifier.playReceivedSound();
      showNotification("✨ Seeded sample student demands into the queue!");
    } catch (e) {
      console.error("Seed error:", e);
    }
  };

  const getStudentSubmissions = (studentName: string) => {
    return submissions.filter(s => s.studentName === studentName);
  };

  // Header metrics matching image.png
  const totalOrders = submissions.length;
  const unassignedTasks = submissions.filter(
    s => !s.assignedTutor || s.assignedTutor.trim() === '' || s.assignedTutor.toLowerCase() === 'unassigned'
  );
  const activeStudentsCount = new Set(submissions.map(s => s.studentEmail || s.studentName)).size;
  const activeTutorsCount = new Set(
    submissions
      .filter(s => s.assignedTutor && s.assignedTutor.trim() !== '' && s.assignedTutor.toLowerCase() !== 'unassigned')
      .map(s => s.assignedTutor)
  ).size || (tutorsList.length > 0 ? 2 : 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 text-left">
      {/* Top Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-fade-in">
          <IconCheckCircle />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        {/* CARD 1: Header & Metric Cards like in image.png */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 font-sans tracking-tight">
              New Assignment Ledger (Incoming Requests)
            </h2>
            <p className="text-sm text-gray-500 font-sans mt-1">
              Review incoming student tasks and demands, assign qualified subject tutors, set final balance payment pricing, and audit real-time chat sync.
            </p>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-gray-300 mt-6 pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Box 1: TOTAL ORDERS */}
              <div className="bg-[#fff8f0] border border-[#ffecd6] rounded-2xl p-5">
                <span className="text-xs font-bold text-[#c2410c] tracking-wider uppercase block">
                  TOTAL ORDERS
                </span>
                <div className="text-3xl font-extrabold text-gray-950 mt-2">
                  {totalOrders}
                </div>
              </div>

              {/* Box 2: UNASSIGNED TASKS */}
              <div className="bg-[#f0f7ff] border border-[#d8eaff] rounded-2xl p-5">
                <span className="text-xs font-bold text-[#2563eb] tracking-wider uppercase block">
                  UNASSIGNED TASKS
                </span>
                <div className="text-3xl font-extrabold text-gray-950 mt-2">
                  {unassignedTasks.length}
                </div>
              </div>

              {/* Box 3: ACTIVE STUDENTS */}
              <div className="bg-[#eefbf4] border border-[#d2f4e3] rounded-2xl p-5">
                <span className="text-xs font-bold text-[#059669] tracking-wider uppercase block">
                  ACTIVE STUDENTS
                </span>
                <div className="text-3xl font-extrabold text-gray-950 mt-2">
                  {activeStudentsCount}
                </div>
              </div>

              {/* Box 4: ACTIVE TUTORS */}
              <div className="bg-[#faf5ff] border border-[#edd9fc] rounded-2xl p-5">
                <span className="text-xs font-bold text-[#9333ea] tracking-wider uppercase block">
                  ACTIVE TUTORS
                </span>
                <div className="text-3xl font-extrabold text-gray-950 mt-2">
                  {activeTutorsCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Direct Tutor Assignment Desk (Incoming Requests) like in image.png */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">
                  <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </span>
                <span className="text-gray-900 font-bold">⚡</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-950 font-sans">
                  Direct Tutor Assignment Desk (Incoming Requests)
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                View new student demands and instantly pair them with subject specialists.
              </p>
            </div>

            <div>
              <span className="inline-flex items-center text-xs font-semibold px-3.5 py-1 rounded-full border border-amber-300 bg-[#fffbf5] text-[#b45309]">
                {unassignedTasks.length} Pending Assignment
              </span>
            </div>
          </div>

          {/* Dashed Box Container */}
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 sm:p-10 mt-6 flex flex-col items-center justify-center text-center">
            {unassignedTasks.length === 0 ? (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 mb-3 shadow-xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">All caught up!</h4>
                <p className="text-sm text-gray-500 mb-5">
                  No unassigned student requests remaining in the queue.
                </p>
                <button
                  type="button"
                  onClick={handleSeedDemands}
                  className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium px-5 py-2.5 rounded-full text-sm shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                  Seed Sample Student Demands
                </button>
              </>
            ) : (
              <div className="w-full text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-gray-200">
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">
                      Active Student Demands Awaiting Tutor Assignment ({unassignedTasks.length})
                    </h5>
                    <p className="text-xs text-gray-500">Pair these students with a specialist tutor and set quoting price.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeedDemands}
                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                  >
                    + Seed More Sample Demands
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {unassignedTasks.map(sub => (
                    <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {sub.subject}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{sub.title}</h4>
                          <p className="text-xs text-slate-500">Student: <span className="font-semibold text-slate-700">{sub.studentName}</span> ({sub.studentEmail})</p>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Due {sub.deadline}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Quote Price ($)</label>
                          <input
                            type="number"
                            placeholder="e.g. 180"
                            value={prices[sub.id] !== undefined ? prices[sub.id] : ""}
                            onChange={(e) => handlePriceChange(sub.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Assign Subject Specialist</label>
                          <select
                            value={tutors[sub.id] || ""}
                            onChange={(e) => handleTutorChange(sub.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Choose Tutor --</option>
                            {tutorsList.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmissionDetail(sub)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
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
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          ⚡ Dispatch Tutor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: INCOMING STUDENT DEMANDS & TASKS (from code as it is) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Header Section */}
          <header className="px-6 py-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">INCOMING STUDENT DEMANDS & TASKS</h1>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {submissions.length} Total Briefs
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Review student profiles, set pricing, assign specialist tutors, and communicate via Admin or Tutor modes</p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <IconSearch />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search student, subject, ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 md:w-80"
                  />
                </div>
              </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {["All Requests", "Pending/Incoming", "In Progress", "Completed", "Revision"].map(tab => {
                const count = tab === "All Requests" ? submissions.length : submissions.filter(s => s.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === "Pending/Incoming" && <span className="text-amber-400"><IconAlertCircle /></span>}
                    <span>{tab}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </header>

          {/* Main Table / Card Layout */}
          <main className="px-4 md:px-6 py-6">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Student & Project</div>
              <div className="col-span-4">Academic Details & Brief</div>
              <div className="col-span-2">Status & Deadline</div>
              <div className="col-span-3">Quote Pricing & Tutor Assignment</div>
            </div>

        <div className="space-y-4 mt-2">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <span className="text-slate-300 text-5xl mb-3 block"><IconBriefcase /></span>
              <h3 className="text-lg font-semibold text-slate-700">No requests found</h3>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative group"
              >
                {/* Column 1: Student & Project Info */}
                <div className="lg:col-span-3 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{sub.subject}</h3>
                    <p className="text-sm font-medium text-indigo-600 mt-0.5">{sub.title}</p>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                      {sub.studentAvatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Submitted by</p>
                      <button 
                        onClick={() => setSelectedStudent(sub.studentName)}
                        className="font-semibold text-slate-800 text-sm hover:text-indigo-600 hover:underline text-left block truncate max-w-[170px] cursor-pointer"
                      >
                        {sub.studentName}
                      </button>
                      <p className="text-xs text-slate-500 truncate max-w-[170px]">{sub.studentEmail}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900">
                    <span className="font-semibold text-amber-800 block mb-0.5">Ref ID:</span>
                    <span className="font-mono text-[11px] text-amber-950 select-all">{sub.id}</span>
                  </div>

                  {/* Action Buttons for Profile and Chat Options */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button 
                      onClick={() => setSelectedStudent(sub.studentName)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <IconUser />
                      <span>View Profile</span>
                    </button>
                    <button 
                      onClick={() => setSelectedSubmissionDetail(sub)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <IconFileText />
                      <span>Full Brief</span>
                    </button>
                    <button 
                      onClick={() => { setActiveChatSubmission(sub); setChatMode("admin"); }}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition-colors border border-indigo-200 cursor-pointer"
                    >
                      <IconMessageSquare />
                      <span>Chat as Admin</span>
                    </button>
                    <button 
                      onClick={() => { setActiveChatSubmission(sub); setChatMode("tutor"); }}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition-colors border border-amber-200 cursor-pointer"
                      title={`Chat as assigned tutor: ${tutors[sub.id] || sub.assignedTutor}`}
                    >
                      <IconMessageSquare />
                      <span>Chat as Tutor</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: Academic Details & Document */}
                <div className="lg:col-span-4 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Brief Preview</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">Verified Request</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono leading-relaxed line-clamp-3 bg-white p-3 rounded-lg border border-slate-200">
                    {sub.pattern}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <a 
                      href={sub.documentUrl || "#download"} 
                      onClick={(e) => { 
                        if (!sub.documentUrl) {
                          e.preventDefault(); 
                          showNotification(`Downloading ${sub.documentName}`);
                        }
                      }}
                      target={sub.documentUrl ? "_blank" : undefined}
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-2xs"
                    >
                      <span className="text-indigo-500"><IconDownload /></span>
                      <span className="truncate max-w-[150px]">{sub.documentName}</span>
                    </a>
                    <span className="text-[11px] text-slate-400">{sub.documentSize}</span>
                  </div>
                </div>

                {/* Column 3: Status & Deadline */}
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</label>
                    <select
                      value={sub.status}
                      onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer ${
                        sub.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        sub.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        sub.status === 'Pending/Incoming' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      <option value="Pending/Incoming">Pending/Incoming</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Revision">Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Deadline</label>
                    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                      <span className="text-slate-400"><IconCalendar /></span>
                      <span>{sub.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: Quote Price & Subject Tutor */}
                <div className="lg:col-span-3 space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/60">
                  {/* Price Setting */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Price: {sub.price ? `$${sub.price}` : 'Unpriced'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">$</span>
                        <input 
                          type="number"
                          placeholder="Set USD"
                          value={prices[sub.id] !== undefined ? prices[sub.id] : ""}
                          onChange={(e) => handlePriceChange(sub.id, e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button 
                        onClick={() => handlePriceSave(sub.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Tutor Assignment */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Assigned Tutor
                    </label>
                    <select
                      value={tutors[sub.id] || sub.assignedTutor}
                      onChange={(e) => handleTutorChange(sub.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {tutorsList.map(t => (
                        <option key={t} value={t}>{t} (★4.9)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                      <IconCheckCircle /> <span>Ready</span>
                    </span>
                    <div className="space-x-2">
                      <button 
                        onClick={() => { setActiveChatSubmission(sub); setChatMode("admin"); }}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Admin Chat
                      </button>
                      <span className="text-slate-300">|</span>
                      <button 
                        onClick={() => { setActiveChatSubmission(sub); setChatMode("tutor"); }}
                        className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                      >
                        Tutor Chat
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </main>
        </div>
      </div>

      {/* STUDENT PROFILE EXPANDED MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto text-left">
            
            <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                  {selectedStudent[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedStudent}</h2>
                  <p className="text-xs text-slate-300">Complete Student Dossier & Active Submissions</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <IconX />
              </button>
            </div>

            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Total Briefs</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">
                    {getStudentSubmissions(selectedStudent).length}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Student GPA</span>
                  <span className="text-2xl font-bold text-indigo-600 mt-1 block">3.85</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Member Since</span>
                  <span className="text-sm font-bold text-slate-800 mt-2 block">January 2026</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Status</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mt-2 inline-block">Active Student</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <IconUser />
                  <span>Contact Credentials</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Primary Email</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {getStudentSubmissions(selectedStudent)[0]?.studentEmail || "syed.asadullahbscs@gmail.com"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone Number</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {getStudentSubmissions(selectedStudent)[0]?.studentPhone || "+1 (555) 019-2834"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <IconBriefcase />
                    <span>All Submitted Assignments ({getStudentSubmissions(selectedStudent).length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Chronological Order</span>
                </div>

                <div className="space-y-4">
                  {getStudentSubmissions(selectedStudent).map((item, idx) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          #{idx + 1} • {item.subject}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                        {item.pattern}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span>Deadline: <strong className="text-slate-700">{item.deadline}</strong></span>
                        <span>Assigned Tutor: <strong className="text-indigo-600">{tutors[item.id] || item.assignedTutor}</strong></span>
                        <div className="space-x-3">
                          <button 
                            onClick={() => { setSelectedStudent(null); setSelectedSubmissionDetail(item); }}
                            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                          >
                            Brief
                          </button>
                          <button 
                            onClick={() => { setSelectedStudent(null); setActiveChatSubmission(item); setChatMode("tutor"); }}
                            className="text-amber-700 font-semibold hover:underline cursor-pointer"
                          >
                            Chat as Tutor
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="bg-slate-100 px-8 py-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED BRIEF INSPECTION MODAL */}
      {selectedSubmissionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-md font-mono">
                  {selectedSubmissionDetail.id}
                </span>
                <h2 className="text-xl font-bold mt-2">{selectedSubmissionDetail.subject}</h2>
                <p className="text-xs text-slate-300">{selectedSubmissionDetail.title}</p>
              </div>
              <button 
                onClick={() => setSelectedSubmissionDetail(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <IconX />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-slate-900 mb-1">Student Brief Full Overview</h4>
                <p className="text-slate-700 text-xs leading-relaxed">{selectedSubmissionDetail.fullDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold">Submitted Document</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-indigo-600 text-xl"><IconFileText /></span>
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{selectedSubmissionDetail.documentName}</span>
                      <span className="text-[10px] text-slate-400">{selectedSubmissionDetail.documentSize}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold">Assigned Specialist Tutor</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {(tutors[selectedSubmissionDetail.id] || selectedSubmissionDetail.assignedTutor)[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{tutors[selectedSubmissionDetail.id] || selectedSubmissionDetail.assignedTutor}</span>
                      <span className="text-[10px] text-amber-600 flex items-center"><IconStar /> <span className="ml-1">{selectedSubmissionDetail.tutorRating} Rating</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Student Submission History Log</h4>
                <div className="space-y-2">
                  {selectedSubmissionDetail.submissionHistory.map(hist => (
                    <div key={hist.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block">{hist.title}</span>
                        <span className="text-slate-400">Submitted on {hist.date}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 font-medium rounded text-slate-700">
                        {hist.status} ({hist.grade})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedSubmissionDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const sub = selectedSubmissionDetail;
                  setSelectedSubmissionDetail(null);
                  setActiveChatSubmission(sub);
                  setChatMode("admin");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <IconMessageSquare />
                <span>Admin Chat</span>
              </button>
              <button 
                onClick={() => {
                  const sub = selectedSubmissionDetail;
                  setSelectedSubmissionDetail(null);
                  setActiveChatSubmission(sub);
                  setChatMode("tutor");
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <IconMessageSquare />
                <span>Chat as Tutor</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DUAL-MODE CHAT MODAL (ADMIN vs TUTOR) */}
      {activeChatSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Chat Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${chatMode === 'admin' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                  {chatMode === 'admin' ? 'A' : (tutors[activeChatSubmission.id] || activeChatSubmission.assignedTutor)[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {chatMode === 'admin' ? `Admin Portal: ${activeChatSubmission.studentName}` : `Tutor Mode: ${tutors[activeChatSubmission.id] || activeChatSubmission.assignedTutor}`}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate max-w-[240px]">{activeChatSubmission.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatSubmission(null)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <IconX />
              </button>
            </div>

            {/* Chat Mode Switcher */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Posting as:</span>
              <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setChatMode("admin")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chatMode === 'admin' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  General Admin
                </button>
                <button
                  onClick={() => setChatMode("tutor")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chatMode === 'tutor' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  As Assigned Tutor ({tutors[activeChatSubmission.id] || activeChatSubmission.assignedTutor})
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
                      {msg.roleLabel || (isStudent ? activeChatSubmission.studentName : msg.sender === 'tutor' ? 'Assigned Tutor' : 'Admin')}
                    </span>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                      isStudent 
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none' 
                        : isTutor 
                          ? 'bg-amber-700 text-white rounded-br-none' 
                          : 'bg-indigo-600 text-white rounded-br-none'
                    }`}>
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
                placeholder={chatMode === 'admin' ? "Type message as Admin..." : `Type message as tutor ${tutors[activeChatSubmission.id] || activeChatSubmission.assignedTutor}...`}
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(activeChatSubmission.id)}
                className={`flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 ${
                  chatMode === 'admin' ? 'focus:ring-indigo-500' : 'focus:ring-amber-500'
                }`}
              />
              <button 
                onClick={() => sendChatMessage(activeChatSubmission.id)}
                className={`p-2.5 text-white rounded-xl shadow-md transition-colors cursor-pointer ${
                  chatMode === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <IconSend />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
