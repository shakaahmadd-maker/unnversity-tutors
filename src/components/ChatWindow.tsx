import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Upload, 
  FileText, 
  CreditCard, 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  FileCheck2,
  DollarSign,
  Volume2,
  VolumeX,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Chat, Message, User, UserRole, Quote } from '../types';
import { audioNotifier } from '../utils/audioNotification';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => Promise<any> | void;
  onOfferQuote?: (
    chatId: string, 
    amount: number, 
    estimatedHours: number, 
    serviceType?: string, 
    deliveryTime?: string, 
    scopeOfWork?: string,
    advancePercentage?: number,
    advanceAmount?: number,
    balanceAmount?: number
  ) => void;
  onAcceptQuote?: (quoteId: string) => void;
  onMarkMessagesAsRead?: (chatId: string, userId: string) => void;
  onSetTypingStatus?: (chatId: string, role: UserRole, isTyping: boolean) => void;
  quotes: Quote[];
  tutors: User[];
  students: User[];
  isLoading?: boolean;
}

export default function ChatWindow({
  chat,
  messages,
  currentUser,
  onSendMessage,
  onOfferQuote,
  onAcceptQuote,
  onMarkMessagesAsRead,
  onSetTypingStatus,
  quotes,
  tutors,
  students,
  isLoading
}: ChatWindowProps) {

  const [inputMsg, setInputMsg] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState<number>(120);
  const [quoteHours, setQuoteHours] = useState<number>(4);
  const [quoteServiceType, setQuoteServiceType] = useState<string>('Assignment Tutoring');
  const [quoteDeliveryTime, setQuoteDeliveryTime] = useState<string>('3 days (Standard)');
  const [quoteScopeOfWork, setQuoteScopeOfWork] = useState<string>('Full step-by-step guidance, references checklist, and draft reviews.');
  const [quoteAdvancePct, setQuoteAdvancePct] = useState<number>(50); // Default of 50% split advance
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string>('');
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter messages for this chat
  const chatMessages = messages.filter(m => m.chatId === chat.id);
  // Find current pending quote for this chat
  const pendingQuote = quotes.find(q => q.chatId === chat.id && q.status === 'pending');

  // Resolve student and tutor entities with deep fallback (id, email, name)
  const resolvedStudent = students.find(s => 
    s.id === chat.studentId || 
    (s.email && s.email.toLowerCase() === chat.studentId.toLowerCase()) ||
    (s.name && s.name.toLowerCase() === chat.studentId.toLowerCase())
  ) || {
    id: chat.studentId,
    name: chat.studentId.includes('@') ? chat.studentId.split('@')[0] : (chat.studentId || 'Student Member'),
    email: chat.studentId.includes('@') ? chat.studentId : `${chat.studentId.toLowerCase().replace(/\s+/g, '.')}@student.uni.edu`,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: UserRole.STUDENT
  } as User;

  const resolvedTutor = tutors.find(t => 
    t.id === chat.tutorId || 
    (t.email && t.email.toLowerCase() === chat.tutorId.toLowerCase()) ||
    (t.name && t.name.toLowerCase() === chat.tutorId.toLowerCase())
  ) || (chat.tutorId?.startsWith('admin_') || chat.tutorId === 'admin_emily' ? {
    id: chat.tutorId,
    name: chat.tutorId === 'admin_shaka' ? 'Shaka Ahmad (Head Admin)' : 'Platform Support Desk',
    email: 'support@university-tutors.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: UserRole.ADMIN
  } as User : {
    id: chat.tutorId,
    name: chat.tutorId || 'Assigned Tutor',
    email: 'tutor@university-tutors.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    role: UserRole.TUTOR
  } as User);

  const otherUser = currentUser.role === UserRole.STUDENT 
    ? resolvedTutor 
    : (currentUser.role === UserRole.TUTOR ? resolvedStudent : (resolvedStudent.id !== currentUser.id ? resolvedStudent : resolvedTutor));

  const isOtherUserTyping = currentUser.role === UserRole.STUDENT
    ? chat.tutorIsTyping
    : chat.studentIsTyping;

  // Mark messages as read when opening or receiving messages
  useEffect(() => {
    if (onMarkMessagesAsRead) {
      onMarkMessagesAsRead(chat.id, currentUser.id);
    }
  }, [chat.id, chatMessages.length, currentUser.id, onMarkMessagesAsRead]);

  // Clean up typing status on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onSetTypingStatus) {
        onSetTypingStatus(chat.id, currentUser.role, false);
      }
    };
  }, [chat.id, currentUser.role, onSetTypingStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOtherUserTyping]);

  const handleInputChange = (val: string) => {
    setInputMsg(val);

    if (onSetTypingStatus) {
      if (!isLocalTyping) {
        setIsLocalTyping(true);
        onSetTypingStatus(chat.id, currentUser.role, true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsLocalTyping(false);
        onSetTypingStatus(chat.id, currentUser.role, false);
      }, 3000);
    }
  };

  const [adminPersona, setAdminPersona] = useState<'admin' | 'tutor'>('admin');
  const [soundActive, setSoundActive] = useState(audioNotifier.isEnabled());

  const effectiveSenderId = (currentUser.role === UserRole.ADMIN && adminPersona === 'tutor')
    ? resolvedTutor.id
    : currentUser.id;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMsg.trim();
    if (!trimmed && !attachedFile) return;

    if (trimmed.length > 5000) {
      setSendError('Message exceeds maximum 5,000 character limit.');
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsLocalTyping(false);
    if (onSetTypingStatus) {
      onSetTypingStatus(chat.id, currentUser.role, false);
    }

    setIsSending(true);
    setSendError(null);

    try {
      await onSendMessage(
        chat.id,
        effectiveSenderId,
        trimmed,
        attachedFile ? `https://example.com/uploads/${attachedFile}` : undefined,
        attachedFile ? attachedFile : undefined
      );
      audioNotifier.playSentSound();
      setInputMsg('');
      setAttachedFile('');
    } catch (err: any) {
      setSendError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleOfferQuoteSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (onOfferQuote && quoteAmount > 0 && quoteHours > 0) {
      const calculatedAdvance = Math.round((quoteAmount * quoteAdvancePct) / 100);
      const calculatedBalance = quoteAmount - calculatedAdvance;
      onOfferQuote(
        chat.id, 
        quoteAmount, 
        quoteHours, 
        quoteServiceType, 
        quoteDeliveryTime, 
        quoteScopeOfWork,
        quoteAdvancePct,
        calculatedAdvance,
        calculatedBalance
      );
      setShowQuoteForm(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-xl" id={`chat-window-${chat.id}`}>
      
      {/* Chat header */}
      <div className="bg-gray-50 border-b border-gray-150 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'} 
              className="w-10 h-10 rounded-full object-cover border" 
              alt="Avatar" 
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 block leading-tight">{otherUser?.name}</span>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                otherUser?.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                otherUser?.role === UserRole.TUTOR ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {otherUser?.role || 'Member'}
              </span>
            </div>
            <span className="text-[10.5px] text-gray-500 block leading-tight mt-0.5 font-sans">
              Topic: <strong className="text-gray-800">{chat.subject}</strong>
              {currentUser.role === UserRole.ADMIN && (
                <span className="text-gray-400 font-mono text-[9.5px] ml-2">
                  (Student: {resolvedStudent.name} • Tutor: {resolvedTutor.name})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Action button options */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !audioNotifier.isEnabled();
              audioNotifier.setEnabled(next);
              setSoundActive(next);
              if (next) {
                audioNotifier.playReceivedSound();
              }
            }}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
              soundActive 
                ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
            }`}
            title={soundActive ? 'Sound notifications are ON (Click to test chime or mute)' : 'Sound notifications are MUTED (Click to enable)'}
          >
            {soundActive ? <Volume2 className="w-3.5 h-3.5 text-orange-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono font-bold hidden sm:inline">{soundActive ? 'Chime Active' : 'Muted'}</span>
          </button>

          {(currentUser.role === UserRole.TUTOR || currentUser.role === UserRole.ADMIN) && onOfferQuote && (
            <button
              id="tutor-toggle-quote-panel"
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="bg-orange-500 font-bold hover:bg-orange-600 text-white text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Offer Custom Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 text-xs">
        
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2" id="chat-loading-indicator">
            <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-medium">Loading room messages...</span>
          </div>
        )}

        {!isLoading && chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 space-y-3" id="chat-empty-state">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-150 flex items-center justify-center text-orange-600 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm font-sans">No messages in this chat room yet</h4>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Send your first message or project instructions to start collaborating directly and securely.
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="bg-orange-50/80 text-orange-800 px-4 py-2 rounded-2xl border border-orange-100/50 text-center text-[10px] max-w-lg font-medium leading-relaxed shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{msg.content}</span>
                </span>
              </div>
            );
          }

          const isSelf = msg.senderId === currentUser.id;
          const allKnownUsers = tutors.concat(students);
          const msgSender = isSelf 
            ? currentUser 
            : (allKnownUsers.find(u => u.id === msg.senderId || (u.email && u.email.toLowerCase() === msg.senderId.toLowerCase())) || otherUser);

          return (
            <div 
              key={msg.id} 
              id={`message-${msg.id}`}
              className={`flex gap-3 max-w-xl ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
            >
              {!isSelf && (
                <div className="flex flex-col items-center self-end shrink-0">
                  <img 
                    src={msgSender?.avatarUrl || otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} 
                    className="w-7 h-7 rounded-full object-cover border" 
                    alt="" 
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <div 
                  className={`p-3.5 rounded-2xl leading-relaxed font-sans ${
                    isSelf 
                      ? 'bg-gray-900 text-white rounded-br-none' 
                      : 'bg-white border border-gray-150 text-gray-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {!isSelf && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-orange-600">
                        {msgSender?.name || 'Member'}
                      </span>
                      {msgSender?.role && (
                        <span className="text-[8px] uppercase font-bold text-gray-400 font-mono">
                          • {msgSender.role}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Embedded PDF/Doc briefs */}
                  {msg.fileUrl && (
                    <div className="mt-2.5 p-2 rounded-xl bg-orange-50/10 border border-orange-200/20 flex items-center justify-between text-[11px] bg-white/10">
                      <div className="flex items-center gap-1.5 truncate max-w-[85%]">
                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate font-mono font-medium">{msg.fileName}</span>
                      </div>
                      <a 
                        id={`download-chat-file-${msg.id}`}
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-orange-400 hover:underline font-bold shrink-0 ml-2"
                      >
                        Open
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 px-1">
                  <span className="text-[9px] text-gray-400 block pb-0.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isSelf && (
                    msg.read ? (
                      <span className="text-orange-500 font-bold text-[10px] select-none ml-1 cursor-default" title="Read by recipient">✓✓</span>
                    ) : (
                      <span className="text-gray-300 font-bold text-[10px] select-none ml-1 cursor-default" title="Sent, unread">✓</span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Embedded Dynamic Quote offer for Student inside chat */}
        {currentUser.role === UserRole.STUDENT && pendingQuote && onAcceptQuote && (
          <div id="student-pending-quote-offer" className="bg-orange-50 border border-orange-200 p-5 rounded-2xl max-w-md mx-auto space-y-4 shadow-sm animate-fade-in text-left">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 p-2.5 rounded-xl text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm text-gray-900 font-sans leading-none">Binding Price Quote Received</h4>
                <p className="text-[10px] text-gray-500">Proposed by {otherUser?.name}. All prices are negotiated case-by-case; confirm details below before paying.</p>
              </div>
            </div>

            <div className="space-y-2 bg-white/80 p-4 rounded-xl border border-orange-100/60 leading-tight">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Planned Service</span>
                <span className="text-xs font-bold text-gray-900">{pendingQuote.serviceType || 'Academic Tutoring'}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Delivery Timeline</span>
                <span className="text-xs font-bold text-orange-600">{pendingQuote.deliveryTime || '3 days'}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Work Estimate</span>
                <span className="text-xs font-semibold text-gray-700">{pendingQuote.estimatedHours} hours coaching</span>
              </div>

              <div className="flex justify-between items-center pt-1 font-sans">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Total Price Quote</span>
                <span className="text-sm font-bold text-gray-950">${pendingQuote.amount} USD</span>
              </div>

              {pendingQuote.advanceAmount !== undefined && pendingQuote.balanceAmount !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Upfront Advance Payment ({pendingQuote.advancePercentage}%):</span>
                    <span className="font-bold text-orange-600 font-mono">${pendingQuote.advanceAmount} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Balance (Held in Escrow):</span>
                    <span className="font-bold text-gray-800 font-mono">${pendingQuote.balanceAmount} USD</span>
                  </div>
                </div>
              )}

              {pendingQuote.scopeOfWork && (
                <div className="pt-2 mt-2 border-t border-dashed border-orange-200 text-[10px] text-gray-600">
                  <span className="font-bold block text-gray-500 font-mono uppercase text-[9px] mb-0.5">Custom Scope & Deliverables</span>
                  <p className="leading-tight bg-orange-50/50 p-2 rounded-lg border border-orange-100/30">{pendingQuote.scopeOfWork}</p>
                </div>
              )}
            </div>

            <button
              id="student-pay-escrow-chat"
              onClick={() => onAcceptQuote(pendingQuote.id)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10"
            >
              <span>
                {pendingQuote.advanceAmount !== undefined && pendingQuote.balanceAmount !== undefined ? (
                  pendingQuote.advanceAmount > 0 ? (
                    `Accept Quote & Request Payment Link: $${pendingQuote.advanceAmount} USD (Advance)`
                  ) : (
                    `Accept Quote: $${pendingQuote.amount} USD`
                  )
                ) : (
                  `Accept & Request Payment Link ($${pendingQuote.amount} USD)`
                )}
              </span>
            </button>
            <p className="text-[9px] text-center text-gray-400 font-medium">Price is finalized after discussion. A secure custom payment link will be sent to you by administrators.</p>
          </div>
        )}

        {isOtherUserTyping && (
          <div className="flex gap-3 mr-auto text-left max-w-xl animate-fade-in items-end pb-2">
            <img 
              src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} 
              className="w-7 h-7 rounded-full object-cover border shrink-0" 
              alt="" 
            />
            <div className="space-y-1">
              <div className="bg-white border border-gray-150 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
                <span className="text-[11px] font-medium text-gray-500 font-sans">{otherUser?.name || 'Tutor'} is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Tutor Quote Dialog floating inside chat */}
      {showQuoteForm && (
        <form 
          onSubmit={handleOfferQuoteSubmit} 
          className="bg-white border-t border-gray-150 p-5 text-left space-y-4 animate-fade-in"
          id="tutor-quote-floating-form"
        >
          <div className="flex justify-between items-center pb-2 border-b">
            <h5 className="font-bold text-xs uppercase tracking-wider text-orange-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Issue Tailored Case-By-Case Quote</span>
            </h5>
            <button 
              type="button" 
              onClick={() => setShowQuoteForm(false)} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Service Division Type *</label>
              <select
                id="quote-input-service-type"
                value={quoteServiceType}
                onChange={(e) => setQuoteServiceType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-sans font-medium text-gray-900 focus:outline-hidden"
              >
                <option value="1-on-1 Online Tutoring">1-on-1 Online Tutoring</option>
                <option value="Assignment Tutoring">Assignment Tutoring</option>
                <option value="Coursework Tutoring">Coursework Tutoring</option>
                <option value="Essay Writing Tutoring">Essay Writing Tutoring</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Delivery Timeline / Deadline *</label>
              <select
                id="quote-input-delivery"
                value={quoteDeliveryTime}
                onChange={(e) => setQuoteDeliveryTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-sans font-medium text-gray-900 focus:outline-hidden"
              >
                <option value="Same day (Rush support)">Same day (Rush support)</option>
                <option value="24 Hours">24 Hours</option>
                <option value="3 days (Standard)">3 days (Standard)</option>
                <option value="5 days">5 days</option>
                <option value="7 days">7 days</option>
                <option value="Flexible Schedule">Flexible Schedule</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Guaranteed Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold font-mono text-xs">$</span>
                <input
                  type="number"
                  id="quote-input-amount"
                  required
                  min="10"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-3 py-1.5 focus:outline-hidden font-mono font-bold text-xs text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Estimated Mentoring Hours *</label>
              <input
                type="number"
                id="quote-input-hours"
                required
                min="1"
                value={quoteHours}
                onChange={(e) => setQuoteHours(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-hidden font-mono font-bold text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="bg-orange-50/20 p-3.5 rounded-xl border border-orange-100/50 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-orange-600 block">Upfront Advance Payment Split</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-[10px] font-bold text-gray-650 block mb-1">Select Advance Ratio</label>
                <select
                  id="quote-input-advance-percentage"
                  value={quoteAdvancePct}
                  onChange={(e) => setQuoteAdvancePct(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-950 focus:outline-hidden"
                >
                  <option value={50}>50% Upfront, 50% on Delivery</option>
                  <option value={30}>30% Upfront, 70% on Delivery</option>
                  <option value={40}>40% Upfront, 60% on Delivery</option>
                  <option value={100}>100% Full Advance Upfront</option>
                  <option value={0}>0% No Advance (Full Escrow held)</option>
                </select>
              </div>
              <div className="text-left font-sans text-xs space-y-1 block md:pl-2">
                <div className="text-gray-500 font-medium">
                  Advance amount (decided): <strong className="text-gray-950 font-mono text-[13px] font-bold">${Math.round((quoteAmount * quoteAdvancePct) / 100)} USD</strong>
                </div>
                <div className="text-gray-500 font-medium">
                  Remaining balance due (rest): <strong className="text-gray-950 font-mono text-[13px] font-bold">${quoteAmount - Math.round((quoteAmount * quoteAdvancePct) / 100)} USD</strong>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-700 block mb-1">Scope of Work, Milestones & Terms *</label>
            <textarea
              id="quote-input-scope"
              required
              rows={2}
              value={quoteScopeOfWork}
              onChange={(e) => setQuoteScopeOfWork(e.target.value)}
              placeholder="e.g. 5-page dissertation review, citation check, and 2-hour interactive Zoom whiteboard mapping."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-hidden text-xs text-gray-900 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowQuoteForm(false)}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="tutor-submit-quote-btn"
              className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Issue Price Quote
            </button>
          </div>
        </form>
      )}

      {/* Quick Prompt Suggestion Chips for Students */}
      {currentUser.role === UserRole.STUDENT && (
        <div className="px-4 py-2 bg-slate-50 border-t border-gray-150 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Actions:</span>
          <button 
            type="button"
            onClick={() => handleInputChange('Can we review the assignment requirements?')} 
            className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
          >
            📋 Request assignment review
          </button>
          <button 
            type="button"
            onClick={() => handleInputChange('Please send over a formal price quote for this task.')} 
            className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
          >
            💰 Request formal quote
          </button>
          <button 
            type="button"
            onClick={() => handleInputChange('When are you available for a 1-on-1 tutoring session?')} 
            className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
          >
            📅 Schedule 1-on-1 session
          </button>
        </div>
      )}

      {/* Send error notification banner */}
      {sendError && (
        <div className="bg-red-50 border-t border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center justify-between animate-fade-in" id="chat-send-error-banner">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{sendError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSendError(null)} 
            className="text-red-600 hover:text-red-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Sending Persona Switcher */}
      {currentUser.role === UserRole.ADMIN && (
        <div className="bg-amber-50/90 border-t border-amber-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-sans animate-fade-in" id="admin-send-persona-bar">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-950 flex items-center gap-1 text-[11px]">
              <span>🎭 Reply Persona:</span>
            </span>
            <div className="inline-flex rounded-xl border border-amber-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                id="persona-send-as-admin"
                onClick={() => setAdminPersona('admin')}
                className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  adminPersona === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>👑 Platform Admin ({currentUser.name})</span>
              </button>
              <button
                type="button"
                id="persona-send-as-tutor"
                onClick={() => setAdminPersona('tutor')}
                className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  adminPersona === 'tutor'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>🎓 Tutor ({resolvedTutor.name})</span>
              </button>
            </div>
          </div>
          <span className="text-[9.5px] text-amber-900 font-mono font-bold bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
            Sending to {resolvedStudent.name} as: <b>{adminPersona === 'tutor' ? resolvedTutor.name : currentUser.name}</b>
          </span>
        </div>
      )}

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-150 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {/* Attachment upload item */}
          <div className="relative" title="Upload PDF, DOCS, ZIP, PPT, Image, or any other media">
            <Upload className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
            <input 
              type="file" 
              id="chat-attachment-upload"
              accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,image/*,audio/*,video/*,application/*"
              onChange={handleSuggestFile}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>

          <input
            type="text"
            id="chat-input-message"
            placeholder="Discuss homework prompts or milestones..."
            maxLength={5000}
            value={inputMsg}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-white border border-gray-200 focus:border-orange-500 focus:outline-hidden py-2.5 px-4 rounded-xl font-medium disabled:opacity-50"
          />

          {attachedFile && (
            <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-1.5 rounded-lg max-w-[120px] truncate block font-mono font-bold">
              ✓ {attachedFile}
            </span>
          )}

          <button 
            type="submit" 
            id="chat-submit-btn"
            disabled={isSending || (!inputMsg.trim() && !attachedFile)}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center min-w-[36px]"
          >
            {isSending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Character count & status footer */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 px-1 font-mono">
          <span>{inputMsg.length > 0 ? `${inputMsg.length} / 5,000 characters` : 'Max 5,000 characters'}</span>
          {inputMsg.length > 4500 && (
            <span className="text-amber-600 font-bold">Approaching length limit</span>
          )}
        </div>
      </form>

    </div>
  );
}
