import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileCheck2, 
  MessageSquare, 
  Star, 
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  Inbox,
  User as UserIcon
} from 'lucide-react';
import { User, Assignment, AssignmentStatus, Chat, Message, Payment, Review, AssignmentReport, UserRole } from '../types';

interface TutorDashboardProps {
  currentUser: User;
  students: User[];
  assignments: Assignment[];
  chats: Chat[];
  messages: Message[];
  payments: Payment[];
  reviews: Review[];
  onTutorDeliver: (assignId: string, fileUrl: string, fileName: string) => void;
  onSelectChat: (chat: Chat) => void;
  assignmentReports: AssignmentReport[];
  onCreateReport: (reportData: Omit<AssignmentReport, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  onUpdateReportStatus: (reportId: string, status: AssignmentReport['status'], feedback?: string) => Promise<boolean>;
}

export default function TutorDashboard({
  currentUser,
  students,
  assignments,
  chats,
  messages,
  payments,
  reviews,
  onTutorDeliver,
  onSelectChat,
  assignmentReports = [],
  onCreateReport,
  onUpdateReportStatus
}: TutorDashboardProps) {

  const [activeTab, setActiveTab] = useState<'assignments' | 'chats' | 'reports' | 'calendar' | 'reviews'>('assignments');
  const [deliveryFile, setDeliveryFile] = useState<string>('');
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);
  
  // Calendar states
  const [newSyllabusDate, setNewSyllabusDate] = useState('');
  const [slotsList, setSlotsList] = useState<string[]>(currentUser.availableSlots || []);

  // Filter values for current tutor (supports both ID and name assignments)
  const tutorAssignments = assignments.filter(a => 
    a.tutorId === currentUser.id || 
    (currentUser.name && a.tutorId === currentUser.name)
  );
  const tutorChats = chats.filter(c => 
    c.tutorId === currentUser.id || 
    (currentUser.name && c.tutorId === currentUser.name)
  );
  const tutorReviews = reviews.filter(r => r.tutorId === currentUser.id);

  // Earnings calculations
  const totalEarned = payments
    .filter(p => {
      const a = assignments.find(assign => assign.id === p.assignmentId);
      return a && (a.tutorId === currentUser.id || a.tutorId === currentUser.name) && p.status === 'released';
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingEscrow = payments
    .filter(p => {
      const a = assignments.find(assign => assign.id === p.assignmentId);
      return a && (a.tutorId === currentUser.id || a.tutorId === currentUser.name) && p.status === 'escrow';
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const getStudent = (studentId: string) => {
    return students.find(s => 
      s.id === studentId || 
      (s.email && s.email.toLowerCase() === studentId.toLowerCase()) || 
      (s.name && s.name.toLowerCase() === studentId.toLowerCase())
    ) || {
      id: studentId,
      name: studentId.includes('@') ? studentId.split('@')[0] : (studentId || 'Student Member'),
      email: studentId.includes('@') ? studentId : `${studentId.toLowerCase().replace(/\s+/g, '.')}@student.uni.edu`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: UserRole.STUDENT
    } as User;
  };

  const handleDeliverSubmit = (e: React.FormEvent, assignId: string) => {
    e.preventDefault();
    if (!deliveryFile) return;

    onTutorDeliver(
      assignId,
      `https://example.com/downloads/completed_${deliveryFile}`,
      deliveryFile
    );

    setDeliverySuccess(assignId);
    setDeliveryFile('');
    
    setTimeout(() => {
      setDeliverySuccess(null);
    }, 4000);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSyllabusDate) return;
    setSlotsList(prev => [...prev, newSyllabusDate + 'T12:00:00.000Z']);
    setNewSyllabusDate('');
  };

  const handleRemoveSlot = (idx: number) => {
    setSlotsList(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl font-sans text-left min-h-[75vh]" id="tutor-workspace">
      
      {/* Workspace Banner */}
      <div className="bg-gray-900 text-white rounded-3xl p-6 md:p-8 mb-8 border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold block uppercase leading-none">Academic Instructor Studio</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans mt-2">Welcome Back, {currentUser.name}!</h2>
          <p className="text-xs text-gray-400 mt-1">Review active student assignments, update webcam hours, and monitor secure escrow payouts.</p>
        </div>
        
        {/* Tutor Quick Stat Counters */}
        <div className="flex gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
          <div className="text-center bg-transparent px-3">
            <span className="text-lg font-mono font-bold text-orange-400 block">${totalEarned}</span>
            <span className="text-[9px] text-gray-400 font-bold block uppercase">total earned</span>
          </div>
          <div className="border-r border-white/10"></div>
          <div className="text-center bg-transparent px-3">
            <span className="text-lg font-mono font-bold text-amber-400 block">${pendingEscrow}</span>
            <span className="text-[9px] text-gray-400 font-bold block uppercase">held in escrow</span>
          </div>
        </div>
      </div>

      {/* Grid: left links / right details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-150 p-4 space-y-1">
            {[
              { id: 'assignments', label: 'Student Assignments', icon: <FileCheck2 className="w-4 h-4" /> },
              { id: 'chats', label: 'Direct Messages', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'reports', label: 'Assignment Reports', icon: <Inbox className="w-4 h-4" /> },
              { id: 'calendar', label: 'Mentor Availability', icon: <Calendar className="w-4 h-4" /> },
              { id: 'reviews', label: 'Tutor Feedback', icon: <Star className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                id={`tutor-tab-${tab.id}`}
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

        {/* Content switch */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ASSIGNMENTS WORKLIST */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs" id="tutor-assignments-block">
              <div className="p-6 border-b border-gray-150">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Assigned Homework & Dissertations</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Coordinate guidelines inside student chats, issue quotes, and upload finalized studies here.</p>
              </div>

              {tutorAssignments.length > 0 ? (
                <div className="divide-y divide-gray-150">
                  {tutorAssignments.map((a) => {
                    const student = getStudent(a.studentId);
                    return (
                      <div key={a.id} id={`tutor-task-card-${a.id}`} className="p-6 space-y-4 hover:bg-gray-55/20 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                              {a.status}
                            </span>
                            <h4 className="font-bold text-sm text-gray-955 font-sans block">{a.title}</h4>
                            <p className="text-[11px] text-gray-450 leading-relaxed font-mono">
                              Deadline: <strong className="text-gray-900">{a.deadline}</strong> • Style: <strong className="text-gray-900">{a.referenceStyle}</strong> • Words: <strong className="text-gray-900">{a.wordCount}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border">
                            <img src={student?.avatarUrl} className="w-8 h-8 rounded-full border" alt="" />
                            <div className="text-left font-sans">
                              <span className="text-xs font-bold text-gray-800 block">{student?.name}</span>
                              <span className="text-[9.5px] text-orange-600 font-bold block uppercase tracking-wide">Pre-Selected Advisor</span>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 text-left text-gray-650 italic">
                          "{a.instructions}"
                        </div>

                        {/* Upload completed homework help */}
                        {deliverySuccess === a.id ? (
                          <div id={`delivery-success-alert-${a.id}`} className="bg-emerald-50 border border-emerald-250 p-3.5 rounded-xl text-emerald-800 flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Academic tutorial complete model uploaded and submitted to student check logs!</span>
                          </div>
                        ) : (
                          a.status !== AssignmentStatus.COMPLETED && (
                            <form 
                              onSubmit={(e) => handleDeliverSubmit(e, a.id)}
                              className="bg-orange-50/20 border border-orange-100 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-left"
                            >
                              <div className="flex-1 space-y-1 w-full">
                                <span className="font-bold text-[11px] text-gray-850 block">Upload Complete Reference Document</span>
                                <p className="text-[10px] text-gray-400">PDF, DOCX, ZIP tutorials up to 25MB.</p>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto relative cursor-pointer">
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="completed_Frankenstein.pdf"
                                  value={deliveryFile}
                                  onChange={(e) => setDeliveryFile(e.target.value)}
                                  className="bg-white border rounded-lg px-2.5 py-1 text-xs font-mono"
                                />
                                <button
                                  type="submit"
                                  id={`tutor-submit-delivery-${a.id}`}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-[10px] shrink-0 cursor-pointer"
                                >
                                  Submit Delivery
                                </button>
                              </div>
                            </form>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FileCheck2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-600 font-medium">No active student assignments currently assigned.</p>
                </div>
              )}
            </div>
          )}

          {/* CALENDAR AVAILABILITY */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 space-y-6 shadow-xs" id="tutor-calendar-block">
              <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight mb-4">Live Whiteboarding Slot Schedules</h3>
              
              <form onSubmit={handleAddSlot} className="flex gap-3 max-w-md text-left">
                <input 
                  type="date" 
                  required 
                  id="calendar-input-date"
                  value={newSyllabusDate}
                  onChange={(e) => setNewSyllabusDate(e.target.value)}
                  className="bg-gray-50 border py-2.5 px-3.5 rounded-xl text-xs flex-1 focus:outline-hidden"
                />
                <button
                  type="submit"
                  id="add-slot-btn"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl block cursor-pointer shrink-0"
                >
                  Add Active Slot
                </button>
              </form>

              <div className="space-y-2 border-t pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">My Registered Webcam Slots:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {slotsList.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{new Date(slot).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <button
                        id={`remove-slot-idx-${i}`}
                        onClick={() => handleRemoveSlot(i)}
                        className="text-red-500 hover:text-red-750 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STUDENT CHATS */}
          {activeTab === 'chats' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs animate-fade-in" id="tutor-chats-block">
              <div className="p-6 border-b border-gray-150">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Active Student Chats</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Message your assigned student clients directly, issue customized milestone quotes, or answer class inquiries.</p>
              </div>

              {tutorChats.length > 0 ? (
                <div className="divide-y divide-gray-150">
                  {tutorChats.map((c) => {
                    const student = getStudent(c.studentId);
                    const lastMsg = messages.filter(m => m.chatId === c.id).slice(-1)[0];
                    return (
                      <div key={c.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                          <img src={student?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} className="w-12 h-12 rounded-full border shadow-xs object-cover" alt="" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-gray-955 font-sans">{student?.name || 'Academic Student'}</h4>
                            <p className="text-xs text-gray-450 truncate max-w-sm">
                              {lastMsg ? `${lastMsg.senderId === currentUser.id ? 'You: ' : ''}${lastMsg.content}` : 'No messages exchanged yet.'}
                            </p>
                            {lastMsg && (
                              <span className="text-[10px] text-gray-400 font-mono block">
                                Last active: {new Date(lastMsg.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            id={`tutor-open-chat-${c.id}`}
                            onClick={() => onSelectChat(c)}
                            className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Open Chat Screen
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 m-6">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-650 font-medium">No open messaging chambers with students.</p>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENT REPORTS SYSTEM */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in" id="tutor-reports-block">
              {/* Report Submission Form Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
                <div className="border-b pb-4 mb-6">
                  <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight">Prepare & Submit Academic Course Report</h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Submit comprehensive reviews, data analysis, or evaluation summaries to the Admin panel for approval first.</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const targetAssignId = (e.currentTarget.elements.namedItem('assignId') as HTMLSelectElement).value;
                  const reportNotes = (e.currentTarget.elements.namedItem('notes') as HTMLTextAreaElement).value;
                  const attachmentUrl = (e.currentTarget.elements.namedItem('attachmentUrl') as HTMLInputElement).value;

                  const assignment = tutorAssignments.find(a => a.id === targetAssignId);
                  if (!assignment) {
                    alert("Please select a valid assigned project.");
                    return;
                  }

                  const student = getStudent(assignment.studentId);
                  try {
                    await onCreateReport({
                      assignmentId: assignment.id,
                      assignmentTitle: assignment.title,
                      tutorId: currentUser.id,
                      tutorName: currentUser.name,
                      studentId: assignment.studentId,
                      studentName: student?.name || 'Student',
                      reportNotes,
                      attachmentUrl: attachmentUrl || undefined
                    });
                    alert("Academic report submitted successfully to administrative panel for compliance check!");
                    e.currentTarget.reset();
                  } catch (err) {
                    alert("Failed to submit assignment report. Please trace parameters and try again.");
                  }
                }} className="space-y-4 text-xs font-medium text-gray-700 text-left">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-700 font-bold block">Assigned Project*</label>
                      <select 
                        name="assignId" 
                        required 
                        className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-hidden text-xs font-semibold"
                      >
                        <option value="">-- Choose student project --</option>
                        {tutorAssignments.map(a => (
                          <option key={a.id} value={a.id}>{a.title} (Ref: #{a.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-700 font-bold block">Resource/Feedback Attachment name (Optional)</label>
                      <input 
                        type="text" 
                        name="attachmentUrl" 
                        placeholder="e.g. essay_structure_outline.pdf"
                        className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-hidden font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-700 font-bold block">Rubric Evaluation Notes & Analysis*</label>
                    <textarea 
                      name="notes" 
                      required 
                      rows={4}
                      placeholder="Specify key learning outcomes, structural alignment, citation accuracy, and general academic progress guidance..."
                      className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-hidden text-xs leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      id="tutor-submit-report-btn"
                      className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      🚀 Submit to Admin for Approval
                    </button>
                  </div>
                </form>
              </div>

              {/* Submitted Reports Status List */}
              <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
                <h3 className="font-bold text-base text-gray-955 font-sans tracking-tight border-b pb-3 mb-4">Academic Report Compliance Log</h3>
                
                {assignmentReports.filter(r => r.tutorId === currentUser.id).length > 0 ? (
                  <div className="space-y-4">
                    {assignmentReports.filter(r => r.tutorId === currentUser.id).map((rep) => {
                      const getStatusBadge = (status: AssignmentReport['status']) => {
                        switch(status) {
                          case 'pending_review':
                            return <span className="bg-yellow-100 text-yellow-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px]">Pending Approval</span>;
                          case 'approved':
                            return <span className="bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px]">Approved</span>;
                          case 'revision_requested':
                            return <span className="bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px]">Revision Requested</span>;
                          case 'sent_to_student':
                            return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px]">Sent to Student</span>;
                          default:
                            return <span className="bg-gray-100 px-2.5 py-0.5 rounded-full uppercase text-[9px]">{status}</span>;
                        }
                      };

                      return (
                        <div key={rep.id} className="p-5 border rounded-2xl bg-gray-50/50 space-y-4 text-left text-xs" id={`tutor-report-log-card-${rep.id}`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-sm text-[#331301] leading-tight">{rep.assignmentTitle}</h4>
                                {getStatusBadge(rep.status)}
                              </div>
                              <p className="text-xs text-gray-500 font-medium">
                                Student: <strong className="text-gray-800">{rep.studentName}</strong> • Submitted: {new Date(rep.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Action Button: Send to student once approved */}
                            {rep.status === 'approved' && (
                              <button
                                id={`tutor-send-report-student-${rep.id}`}
                                onClick={async () => {
                                  const ok = await onUpdateReportStatus(rep.id, 'sent_to_student');
                                  if (ok) {
                                    alert("Report successfully dispatched directly to the student portal!");
                                  } else {
                                    alert("Failed to send report. Please try again.");
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-sm shrink-0 font-sans"
                              >
                                🚀 Send to Student
                              </button>
                            )}
                          </div>

                          <div className="p-3 bg-white rounded-xl border leading-relaxed text-gray-650">
                            <strong>Tutor Analysis:</strong><span className="block mt-1 font-sans italic">"{rep.reportNotes}"</span>
                          </div>

                          {rep.attachmentUrl && (
                            <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-orange-600 font-semibold bg-orange-50/45 border border-orange-100 px-2.5 py-1.5 rounded-lg w-fit">
                              📎 Attached: {rep.attachmentUrl}
                            </div>
                          )}

                          {rep.feedbackFromAdmin && (
                            <div className="p-3.5 bg-red-50/40 border border-red-150 rounded-xl space-y-1">
                              <span className="text-[10.5px] font-bold text-red-850 uppercase tracking-wide block">Admin Revision Feedback:</span>
                              <p className="text-xs text-red-950 italic">"{rep.feedbackFromAdmin}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs text-gray-650 font-medium font-sans">No academic reports submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RATINGS & VERIFIED REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 space-y-6 shadow-xs" id="tutor-reviews-block">
              <h3 className="font-bold text-base text-gray-950 font-sans tracking-tight border-b pb-3">My Student Class Reviews</h3>
              
              {tutorReviews.length > 0 ? (
                <div className="space-y-4">
                  {tutorReviews.map((rev) => (
                    <div key={rev.id} className="p-4 border rounded-2xl bg-gray-50 flex items-start gap-3.5 text-left text-xs">
                      <img src={rev.studentAvatar} className="w-8 h-8 rounded-full border object-cover shrink-0" alt="" />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-gray-900 block leading-none">{rev.studentName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${rev.rating > i ? 'text-amber-500 fill-amber-500' : 'text-gray-250'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-650 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-600 font-medium font-sans">No student feedback logs recorded currently.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
