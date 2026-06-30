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
  DollarSign
} from 'lucide-react';
import { Chat, Message, User, UserRole, Quote } from '../types';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => void;
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
  students
}: ChatWindowProps) {

  const [inputMsg, setInputMsg] = useState('');
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

  const otherUser = currentUser.role === UserRole.STUDENT
    ? tutors.find(t => t.id === chat.tutorId)
    : students.find(s => s.id === chat.studentId);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !attachedFile) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsLocalTyping(false);
    if (onSetTypingStatus) {
      onSetTypingStatus(chat.id, currentUser.role, false);
    }

    onSendMessage(
      chat.id,
      currentUser.id,
      inputMsg,
      attachedFile ? `https://example.com/uploads/${attachedFile}` : undefined,
      attachedFile ? attachedFile : undefined
    );

    setInputMsg('');
    setAttachedFile('');
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
          <img 
            src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'} 
            className="w-10 h-10 rounded-full object-cover border" 
            alt="Avatar" 
          />
          <div className="text-left">
            <span className="font-bold text-sm text-gray-900 block leading-tight">{otherUser?.name}</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-0.5 font-mono">
              Discussion topic: <strong>{chat.subject}</strong>
            </span>
          </div>
        </div>

        {/* Action button options */}
        {(currentUser.role === UserRole.TUTOR || currentUser.role === UserRole.ADMIN) && onOfferQuote && (
          <button
            id="tutor-toggle-quote-panel"
            onClick={() => setShowQuoteForm(!showQuoteForm)}
            className="bg-orange-500 font-bold hover:bg-orange-600 text-white text-[11px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Offer Custom Quote</span>
          </button>
        )}
      </div>

      {/* Main Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 text-xs">
        
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
          return (
            <div 
              key={msg.id} 
              id={`message-${msg.id}`}
              className={`flex gap-3 max-w-xl ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
            >
              {!isSelf && (
                <img 
                  src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} 
                  className="w-7 h-7 rounded-full object-cover border self-end shrink-0" 
                  alt="" 
                />
              )}
              
              <div className="space-y-1">
                <div 
                  className={`p-3.5 rounded-2xl leading-relaxed font-sans ${
                    isSelf 
                      ? 'bg-gray-900 text-white rounded-br-none' 
                      : 'bg-white border border-gray-150 text-gray-800 rounded-bl-none shadow-xs'
                  }`}
                >
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
                    `Accept & Pay Advance: $${pendingQuote.advanceAmount} USD (Rest on delivery)`
                  ) : (
                    `Accept Quote: $${pendingQuote.amount} USD (Held in Escrow)`
                  )
                ) : (
                  `Accept & Secure Escrow Pay ($${pendingQuote.amount} USD)`
                )}
              </span>
            </button>
            <p className="text-[9px] text-center text-gray-400 font-medium">Price is finalized only after agreement. Secured via Stripe dynamic sandbox.</p>
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

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-150 flex items-center gap-3">
        
        {/* Attachment upload item */}
        <div className="relative">
          <Upload className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
          <input 
            type="file" 
            id="chat-attachment-upload"
            onChange={handleSuggestFile}
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
        </div>

        <input
          type="text"
          id="chat-input-message"
          placeholder="Discuss homework prompts or milestones..."
          value={inputMsg}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 bg-white border border-gray-200 focus:border-orange-500 focus:outline-hidden py-2.5 px-4 rounded-xl font-medium"
        />

        {attachedFile && (
          <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-1.5 rounded-lg max-w-[120px] truncate block font-mono font-bold">
            ✓ {attachedFile}
          </span>
        )}

        <button 
          type="submit" 
          id="chat-submit-btn"
          className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
}
