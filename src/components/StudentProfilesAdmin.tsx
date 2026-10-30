import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Eye,
  MessageSquare,
  BookOpen,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  FileText,
  Download,
  Send,
  X,
  Edit3,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { User, Assignment, Chat, Message, Invoice, UserRole, AssignmentStatus } from '../types';

interface StudentProfilesAdminProps {
  users: User[];
  assignments: Assignment[];
  chats: Chat[];
  messages: Message[];
  invoices: Invoice[];
  onOpenChatWithStudent: (studentId: string, tutorId?: string, subject?: string) => void;
  onAssignTutor: (assignmentId: string, tutorId: string) => Promise<boolean>;
  onSetAssignmentPrice: (assignmentId: string, price: number) => Promise<boolean>;
  onUpdateUserProfile: (userId: string, updatedData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  initialSearchQuery?: string;
  initialStudentId?: string;
}

export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  verified: boolean;
  country?: string;
  assignments: Assignment[];
  assignedTutors: User[];
  invoices: Invoice[];
  chats: Chat[];
}

export default function StudentProfilesAdmin({
  users,
  assignments,
  chats,
  messages,
  invoices,
  onOpenChatWithStudent,
  onAssignTutor,
  onSetAssignmentPrice,
  onUpdateUserProfile,
  onDeleteUser,
  onSendNotification,
  initialSearchQuery = '',
  initialStudentId = ''
}: StudentProfilesAdminProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterType, setFilterType] = useState<'all' | 'active_demands' | 'assigned' | 'unassigned' | 'verified'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfileData | null>(null);

  // Sync initial query or student ID if updated externally
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Quick Action States
  const [assignTutorModalAssign, setAssignTutorModalAssign] = useState<Assignment | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Direct Note / Message states
  const [directMsgStudent, setDirectMsgStudent] = useState<StudentProfileData | null>(null);
  const [directMsgTitle, setDirectMsgTitle] = useState('');
  const [directMsgBody, setDirectMsgBody] = useState('');
  const [directMsgType, setDirectMsgType] = useState<'both' | 'webapp' | 'email'>('both');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const tutorsList = users.filter(u => u.role === UserRole.TUTOR);

  // Compile full unified list of students (from registered users + assignments)
  const studentsMap = new Map<string, StudentProfileData>();

  // 1. Registered students from users list
  users.filter(u => u.role === UserRole.STUDENT).forEach(u => {
    studentsMap.set(u.id.toLowerCase(), {
      id: u.id,
      name: u.name || 'Student',
      email: u.email || '',
      avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: u.createdAt || new Date().toISOString(),
      verified: u.verified !== false,
      country: u.country || 'US',
      assignments: [],
      assignedTutors: [],
      invoices: [],
      chats: []
    });
  });

  // 2. Discover student identities from assignments / matching funnel briefs (like "ahmadd consultants")
  assignments.forEach(assign => {
    const rawStudentId = (assign.studentId || '').trim();
    if (!rawStudentId) return;

    // Check if matched to registered student
    const matchedUser = users.find(u => 
      u.id.toLowerCase() === rawStudentId.toLowerCase() || 
      u.email.toLowerCase() === rawStudentId.toLowerCase()
    );

    const key = matchedUser ? matchedUser.id.toLowerCase() : rawStudentId.toLowerCase();

    if (!studentsMap.has(key)) {
      const isEmail = rawStudentId.includes('@');
      studentsMap.set(key, {
        id: matchedUser ? matchedUser.id : rawStudentId,
        name: matchedUser ? matchedUser.name : (isEmail ? rawStudentId.split('@')[0].replace(/[._]/g, ' ') : rawStudentId),
        email: matchedUser ? matchedUser.email : (isEmail ? rawStudentId : `${rawStudentId.replace(/\s+/g, '.').toLowerCase()}@universitytutors.com`),
        avatarUrl: matchedUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: assign.createdAt || new Date().toISOString(),
        verified: true,
        country: 'US',
        assignments: [],
        assignedTutors: [],
        invoices: [],
        chats: []
      });
    }

    const studentRecord = studentsMap.get(key)!;
    studentRecord.assignments.push(assign);

    if (assign.tutorId) {
      const tutorObj = tutorsList.find(t => t.id === assign.tutorId);
      if (tutorObj && !studentRecord.assignedTutors.some(t => t.id === tutorObj.id)) {
        studentRecord.assignedTutors.push(tutorObj);
      }
    }
  });

  // 3. Associate Invoices & Chats
  invoices.forEach(inv => {
    for (const [, st] of studentsMap.entries()) {
      if (st.id === inv.studentId || st.email.toLowerCase() === inv.studentEmail.toLowerCase()) {
        st.invoices.push(inv);
        break;
      }
    }
  });

  chats.forEach(c => {
    for (const [, st] of studentsMap.entries()) {
      if (st.id === c.studentId || st.email.toLowerCase() === c.studentId.toLowerCase()) {
        st.chats.push(c);
        break;
      }
    }
  });

  const allStudentProfiles = Array.from(studentsMap.values());

  // Auto-open student profile modal if initialStudentId is provided
  React.useEffect(() => {
    if (initialStudentId) {
      const found = allStudentProfiles.find(s => 
        s.id.toLowerCase() === initialStudentId.toLowerCase() || 
        s.email.toLowerCase() === initialStudentId.toLowerCase() ||
        s.name.toLowerCase() === initialStudentId.toLowerCase()
      );
      if (found) {
        setSelectedStudentForModal(found);
      }
    }
  }, [initialStudentId, allStudentProfiles.length]);

  // Filter students
  const filteredStudents = allStudentProfiles.filter(st => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      st.name.toLowerCase().includes(q) || 
      st.email.toLowerCase().includes(q) ||
      st.id.toLowerCase().includes(q) ||
      st.assignments.some(a => a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'active_demands') {
      return st.assignments.some(a => a.status === AssignmentStatus.PENDING || a.status === AssignmentStatus.IN_PROGRESS);
    }
    if (filterType === 'assigned') {
      return st.assignedTutors.length > 0;
    }
    if (filterType === 'unassigned') {
      return st.assignments.some(a => !a.tutorId);
    }
    if (filterType === 'verified') {
      return st.verified;
    }
    return true;
  });

  const handleConfirmDirectAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTutorModalAssign || !selectedTutorId) return;

    setIsSubmittingAssign(true);
    try {
      if (customPriceInput && !isNaN(parseFloat(customPriceInput))) {
        await onSetAssignmentPrice(assignTutorModalAssign.id, parseFloat(customPriceInput));
      }
      await onAssignTutor(assignTutorModalAssign.id, selectedTutorId);
      const tutorObj = tutorsList.find(t => t.id === selectedTutorId);
      alert(`Assignment successfully assigned to ${tutorObj?.name || 'Tutor'}! Chat room created.`);
      setAssignTutorModalAssign(null);
      setSelectedTutorId('');
      setCustomPriceInput('');
    } catch (err: any) {
      alert(`Error assigning tutor: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgStudent || !directMsgTitle.trim() || !directMsgBody.trim()) return;

    setIsSendingMsg(true);
    try {
      const ok = await onSendNotification(directMsgTitle.trim(), directMsgBody.trim(), directMsgStudent.id, directMsgType);
      if (ok) {
        alert(`Direct notification dispatched to ${directMsgStudent.name}!`);
        setDirectMsgStudent(null);
        setDirectMsgTitle('');
        setDirectMsgBody('');
      } else {
        alert("Failed to deliver message.");
      }
    } catch (err: any) {
      alert("Error transmitting message: " + err.message);
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="admin-student-profiles-page">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold font-mono uppercase mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Student Profiles Directory</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
              All Registered Students & Demands
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Explore student accounts, inspect submitted academic briefs and file uploads, review assigned specialist tutors, and initiate instant live chat support sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">
              {allStudentProfiles.length} Total Students
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-mono font-bold text-orange-950 mt-1 block">{allStudentProfiles.length}</span>
          </div>
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Active Demands & Tasks</span>
            <span className="text-2xl font-mono font-bold text-blue-950 mt-1 block">
              {allStudentProfiles.reduce((acc, st) => acc + st.assignments.length, 0)}
            </span>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Paired with Tutors</span>
            <span className="text-2xl font-mono font-bold text-emerald-950 mt-1 block">
              {allStudentProfiles.filter(st => st.assignedTutors.length > 0).length}
            </span>
          </div>
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Active Chat Rooms</span>
            <span className="text-2xl font-mono font-bold text-purple-950 mt-1 block">
              {chats.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students by name, email, assignment ref, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-end md:self-auto border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Card View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'all', label: 'All Students' },
            { id: 'active_demands', label: 'Active Demands / Briefs' },
            { id: 'assigned', label: 'Assigned with Tutor' },
            { id: 'unassigned', label: 'Unassigned (Waiting for Tutor)' },
            { id: 'verified', label: 'Verified Only' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                filterType === f.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Student Directory Content */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-150 flex items-center justify-center text-orange-600 mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-gray-800 text-sm">No Student Profiles Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            No students match your query "{searchQuery}". Try clearing filters or search terms.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map(student => {
            const activeAssigns = student.assignments;
            const primaryAssign = activeAssigns[0];
            const assignedTutor = student.assignedTutors[0];

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-gray-200/90 p-5 flex flex-col justify-between hover:shadow-md hover:border-orange-300 transition-all space-y-4"
              >
                {/* Top Profile Summary */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-2xs"
                        />
                        {student.verified && (
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white" title="Verified student profile">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-950 truncate leading-tight flex items-center gap-1.5" title={student.name}>
                          <span>{student.name}</span>
                        </h4>
                        <span className="text-[11px] text-gray-500 truncate block mt-0.5" title={student.email}>
                          {student.email}
                        </span>
                        <span className="text-[9.5px] font-mono text-gray-400 block mt-0.5">
                          ID: #{student.id.slice(0, 14)}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0 uppercase">
                      {activeAssigns.length} {activeAssigns.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  {/* Academic Briefs Snippet */}
                  {primaryAssign ? (
                    <div className="bg-orange-50/40 border border-orange-150/70 rounded-2xl p-3 space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block font-mono">
                          Latest Demand Brief:
                        </span>
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono ${
                          primaryAssign.status === AssignmentStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' :
                          primaryAssign.status === AssignmentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {primaryAssign.status}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs text-gray-900 leading-snug line-clamp-1" title={primaryAssign.title}>
                        {primaryAssign.title}
                      </h5>

                      <p className="text-[10.5px] text-gray-500 line-clamp-2 italic leading-relaxed">
                        "{primaryAssign.instructions}"
                      </p>

                      {/* Attached file badges */}
                      {primaryAssign.fileNames && primaryAssign.fileNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {primaryAssign.fileNames.map((fn, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-700 bg-white border border-orange-200 px-2 py-0.5 rounded-md">
                              <Paperclip className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{fn}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Assigned Tutor indicator */}
                      <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-orange-100">
                        <span className="text-gray-500">Subject Specialist:</span>
                        {assignedTutor ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{assignedTutor.name}</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold font-mono">Unassigned</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 text-center">
                      <p className="text-[10.5px] text-gray-400 italic">No registered briefs placed yet.</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Live Chat with Student */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetTutorId = assignedTutor?.id || 'tutor_clara';
                        const subjectTopic = primaryAssign?.title || 'Academic Support';
                        onOpenChatWithStudent(student.id, targetTutorId, subjectTopic);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Open chat room with student"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Live Chat</span>
                    </button>

                    {/* View Full Profile Modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForModal(student)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>View Profile</span>
                    </button>
                  </div>

                  {/* Assign Tutor / Direct Action */}
                  {primaryAssign && !primaryAssign.tutorId && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignTutorModalAssign(primaryAssign);
                        setSelectedTutorId(tutorsList[0]?.id || '');
                        setCustomPriceInput(primaryAssign.quoteAmount ? String(primaryAssign.quoteAmount) : '');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Pair with Tutor Now</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Student Profile</th>
                  <th className="p-4">Active Academic Demands</th>
                  <th className="p-4">Assigned Tutor</th>
                  <th className="p-4">Billing & Invoices</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStudents.map(student => {
                  const primaryAssign = student.assignments[0];
                  const assignedTutor = student.assignedTutors[0];

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{student.name}</span>
                            <span className="text-[10px] text-gray-400 block">{student.email}</span>
                            <span className="text-[9px] font-mono text-gray-400">Ref: #{student.id.slice(0, 12)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        {primaryAssign ? (
                          <div>
                            <span className="font-bold text-gray-900 block truncate" title={primaryAssign.title}>
                              {primaryAssign.title}
                            </span>
                            <span className="text-[10px] text-orange-600 font-bold block">{primaryAssign.subject}</span>
                            <span className="text-[9.5px] text-gray-400 font-mono block mt-0.5">📅 Due: {primaryAssign.deadline}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No tasks registered</span>
                        )}
                      </td>

                      <td className="p-4">
                        {assignedTutor ? (
                          <div className="flex items-center gap-2">
                            <img src={assignedTutor.avatarUrl} className="w-6 h-6 rounded-full border" alt="" />
                            <div>
                              <span className="font-bold text-gray-800 block leading-tight">{assignedTutor.name}</span>
                              <span className="text-[9px] text-emerald-600 font-bold">★{assignedTutor.rating || '4.9'} Specialist</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-900 font-bold block">
                            {student.invoices.length} Invoices
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 block">
                            Total: ${student.invoices.reduce((a, b) => a + Number(b.totalAmount || 0), 0)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const targetTutorId = assignedTutor?.id || 'tutor_clara';
                              const subjectTopic = primaryAssign?.title || 'Academic Support';
                              onOpenChatWithStudent(student.id, targetTutorId, subjectTopic);
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Chat directly with student"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedStudentForModal(student)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                            title="View student profile details"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 1: COMPLETE STUDENT PROFILE DRAWER/POPUP */}
      {/* ============================================== */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-3xl w-full shadow-2xl relative text-left space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedStudentForModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <img
                src={selectedStudentForModal.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-200 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-gray-950 font-sans">{selectedStudentForModal.name}</h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{selectedStudentForModal.email}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">Account ID: {selectedStudentForModal.id}</p>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetTutorId = selectedStudentForModal.assignedTutors[0]?.id || 'tutor_clara';
                  const subjectTopic = selectedStudentForModal.assignments[0]?.title || 'Academic Support';
                  setSelectedStudentForModal(null);
                  onOpenChatWithStudent(selectedStudentForModal.id, targetTutorId, subjectTopic);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Direct Live Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDirectMsgStudent(selectedStudentForModal);
                  setDirectMsgTitle(`Academic Update: Hello ${selectedStudentForModal.name}`);
                }}
                className="bg-gray-900 hover:bg-black text-white font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Direct Notification</span>
              </button>
            </div>

            {/* Assignment Briefs Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span>Submitted Academic Demands & Briefs ({selectedStudentForModal.assignments.length})</span>
              </h4>

              {selectedStudentForModal.assignments.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  No assignment briefs submitted by this student.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStudentForModal.assignments.map(assign => {
                    const assignedTutor = tutorsList.find(t => t.id === assign.tutorId);
                    return (
                      <div key={assign.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold font-mono bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                              Ref: #{assign.id}
                            </span>
                            <h5 className="font-bold text-xs text-gray-950 mt-1">{assign.title}</h5>
                            <span className="text-[11px] font-bold text-orange-600">{assign.subject}</span>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            assign.status === AssignmentStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' :
                            assign.status === AssignmentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {assign.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200/70 italic leading-relaxed">
                          "{assign.instructions}"
                        </p>

                        {/* Files */}
                        {assign.fileNames && assign.fileNames.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Attached Documents:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {assign.fileNames.map((fn, idx) => {
                                const url = (assign.fileUrls && assign.fileUrls[idx]) ? assign.fileUrls[idx] : `https://universitytutors.com/uploads/${encodeURIComponent(fn)}`;
                                return (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-800 font-bold bg-white border border-orange-200 px-2.5 py-1 rounded-xl shadow-2xs transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-orange-500" />
                                    <span>{fn}</span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                          <div>
                            <span className="text-gray-400">Deadline: </span>
                            <span className="font-mono font-bold text-gray-800">{assign.deadline}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Tutor: </span>
                            <span className="font-bold text-emerald-700">{assignedTutor ? assignedTutor.name : 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Invoices and Billing history */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Financial & Invoice Ledger ({selectedStudentForModal.invoices.length})</span>
              </h4>

              {selectedStudentForModal.invoices.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  No invoices issued for this student yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStudentForModal.invoices.map(inv => (
                    <div key={inv.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-orange-600">#{inv.id}</span>
                        <p className="font-bold text-gray-800 mt-0.5">{inv.serviceSubject}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-900 block">${inv.totalAmount}</span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 2: PAIR / ASSIGN TUTOR POPUP             */}
      {/* ============================================== */}
      {assignTutorModalAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left space-y-4">
            <button
              onClick={() => setAssignTutorModalAssign(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-gray-950 font-sans">
              Assign Subject Tutor to Demand
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pairing student demand: <strong>{assignTutorModalAssign.title}</strong>
            </p>

            <form onSubmit={handleConfirmDirectAssign} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider">
                  Select Certified Tutor
                </label>
                <select
                  required
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="">-- Choose Tutor --</option>
                  {tutorsList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (★{t.rating || '4.9'}) - {t.subjects?.join(', ') || 'Specialist'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider">
                  Set Quote Price ($)
                </label>
                <input
                  type="number"
                  placeholder="Enter quote amount e.g. 120"
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAssign}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-70"
              >
                {isSubmittingAssign ? 'Assigning...' : 'Confirm Assignment & Open Chat'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 3: DIRECT MESSAGE TRANSMITTER            */}
      {/* ============================================== */}
      {directMsgStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left space-y-4">
            <button
              onClick={() => setDirectMsgStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-gray-950 font-sans">
              Transmit Direct Notification to {directMsgStudent.name}
            </h3>

            <form onSubmit={handleSendDirectMessage} className="space-y-3.5 pt-2">
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Channel</label>
                <select
                  value={directMsgType}
                  onChange={(e) => setDirectMsgType(e.target.value as any)}
                  className="w-full bg-gray-50 border p-2 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="both">⚡ BOTH (In-App Push & Email)</option>
                  <option value="webapp">🔔 In-App Push Only</option>
                  <option value="email">✉️ Direct Email Only</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={directMsgTitle}
                  onChange={(e) => setDirectMsgTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={directMsgBody}
                  onChange={(e) => setDirectMsgBody(e.target.value)}
                  placeholder="Type your notice or briefing..."
                  className="w-full bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingMsg}
                className="w-full bg-gray-950 hover:bg-black text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingMsg ? 'Transmitting...' : 'Dispatch Notification'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
