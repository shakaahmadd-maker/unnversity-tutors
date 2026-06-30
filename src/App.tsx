import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import SopModal from './components/SopModal';
import AuthPage from './components/AuthPage';
import MarketingPages from './components/MarketingPages';
import StudentDashboard from './components/StudentDashboard';
import TutorDashboard from './components/TutorDashboard';
import AdminDashboard from './components/AdminDashboard';
import AssignmentFormModal from './components/AssignmentFormModal';
import ChatWindow from './components/ChatWindow';
import GetQuotePage from './components/GetQuotePage';
import GoogleConnectModal from './components/GoogleConnectModal';

import { store } from './lib/store';
import { UserRole, Chat, User, Assignment, Payment, Invoice, ActivityLog, AppNotification, SOP, AssignmentReport, Agreement } from './types';
import { Sparkles, HelpCircle, MessageSquare, Chrome } from 'lucide-react';

export default function App() {
  
  // React render sync state for Local Storage changes
  const [storeState, setStoreState] = useState({
    currentUser: store.currentUser,
    users: store.users,
    blogs: store.blogs,
    faqs: store.faqs,
    chats: store.chats,
    messages: store.messages,
    quotes: store.quotes,
    assignments: store.assignments,
    payments: store.payments,
    supportTickets: store.supportTickets,
    reviews: store.reviews,
    invoices: store.invoices,
    activityLogs: store.activityLogs,
    appNotifications: store.appNotifications,
    sops: store.sops,
    assignmentReports: store.assignmentReports,
    agreements: store.agreements,
    activeStudentsOnline: store.activeStudentsOnline
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(true); // Auto open for first turn audit training
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isGoogleConnectModalOpen, setIsGoogleConnectModalOpen] = useState<boolean>(false);
  const [prefilledTutorForAssign, setPrefilledTutorForAssign] = useState<string>('');

  useEffect(() => {
    // Sync React state on any store notify() pattern
    const unsubscribe = store.subscribe(() => {
      setStoreState({
        currentUser: store.currentUser,
        users: store.users,
        blogs: store.blogs,
        faqs: store.faqs,
        chats: store.chats,
        messages: store.messages,
        quotes: store.quotes,
        assignments: store.assignments,
        payments: store.payments,
        supportTickets: store.supportTickets,
        reviews: store.reviews,
        invoices: store.invoices,
        activityLogs: store.activityLogs,
        appNotifications: store.appNotifications,
        sops: store.sops,
        assignmentReports: store.assignmentReports,
        agreements: store.agreements,
        activeStudentsOnline: store.activeStudentsOnline
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeChat) {
      store.subscribeToChatDetails(activeChat.id);
    }
  }, [activeChat]);

  // Unified navigation handler that updates the window URL path and changes state
  const handleNavigate = (view: string) => {
    let path = '/' + view;
    if (view === 'home' || view === '') {
      path = '/';
    } else if (view === 'about') {
      path = '/about-us';
    } else if (view === 'get-a-quote') {
      path = '/get-a-quote';
    } else if (view === 'services') {
      path = '/services';
    } else if (view === 'faqs') {
      path = '/faqs';
    } else if (view === 'contact') {
      path = '/contact';
    } else if (view === 'blog') {
      path = '/our-blog';
    } else if (view === 'privacy') {
      path = '/privacy';
    } else if (view === 'terms') {
      path = '/terms';
    } else if (view === 'auth') {
      path = '/auth';
    } else if (view === 'dashboard') {
      if (storeState.currentUser) {
        if (storeState.currentUser.role === UserRole.STUDENT) {
          path = '/student';
        } else if (storeState.currentUser.role === UserRole.TUTOR) {
          path = '/tutor';
        } else if (storeState.currentUser.role === UserRole.ADMIN) {
          path = '/admin';
        }
      } else {
        path = '/dashboard';
      }
    }
    
    window.history.pushState(null, '', path);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL routing and relative links handler with case-insensitive and spacing normalization
  useEffect(() => {
    const handleUrlChange = () => {
      const rawPath = window.location.pathname;
      const decodedPath = decodeURIComponent(rawPath).toLowerCase().trim().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().trim();
      
      if (
        decodedPath === '/get-a-quote' || 
        decodedPath === '/get a quote' || 
        decodedPath === '/getaquote' || 
        hash === '#get-a-quote' ||
        hash === '#get a quote'
      ) {
        setActiveView('get-a-quote');
      } else if (decodedPath === '/services' || hash === '#services') {
        setActiveView('services');
      } else if (decodedPath === '/student' || hash === '#student') {
        store.login('alex@example.com');
        setActiveView('dashboard');
      } else if (decodedPath === '/tutor' || hash === '#tutor') {
        store.login('clara@example.com');
        setActiveView('dashboard');
      } else if (decodedPath === '/admin' || hash === '#admin') {
        store.login('shaka.ahmadd@gmail.com');
        setActiveView('dashboard');
      } else if (
        decodedPath === '/about-us' || 
        decodedPath === '/about us' || 
        decodedPath === '/about' || 
        hash === '#about' || 
        hash === '#about-us' ||
        hash === '#about us'
      ) {
        setActiveView('about');
      } else if (
        decodedPath === '/faqs' || 
        decodedPath === '/faq' || 
        hash === '#faqs' || 
        hash === '#faq'
      ) {
        setActiveView('faqs');
      } else if (
        decodedPath === '/contact' || 
        decodedPath === '/contact-us' || 
        decodedPath === '/contact us' || 
        hash === '#contact' ||
        hash === '#contact us'
      ) {
        setActiveView('contact');
      } else if (
        decodedPath === '/our-blog' || 
        decodedPath === '/our blog' || 
        decodedPath === '/blog' || 
        hash === '#blog' || 
        hash === '#our-blog' ||
        hash === '#our blog'
      ) {
        setActiveView('blog');
      } else if (decodedPath === '/privacy' || hash === '#privacy') {
        setActiveView('privacy');
      } else if (decodedPath === '/terms' || hash === '#terms') {
        setActiveView('terms');
      } else if (decodedPath === '/auth' || hash === '#auth') {
        setActiveView('auth');
      } else if (
        decodedPath === '' || 
        decodedPath === '/' || 
        decodedPath === '/home' || 
        hash === '#home'
      ) {
        setActiveView('home');
      }
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        let href = anchor.getAttribute('href');
        if (!href) return;
        href = decodeURIComponent(href).toLowerCase().trim();
        
        if (
          href === '/get-a-quote' || 
          href === '/get a quote' || 
          href === '#get-a-quote' ||
          href === '#get a quote'
        ) {
          e.preventDefault();
          handleNavigate('get-a-quote');
        } else if (href === '/services' || href === '#services') {
          e.preventDefault();
          handleNavigate('services');
        } else if (
          href === '/about-us' || 
          href === '/about us' || 
          href === '/about' || 
          href === '#about' ||
          href === '#about-us' ||
          href === '#about us'
        ) {
          e.preventDefault();
          handleNavigate('about');
        } else if (
          href === '/faqs' || 
          href === '/faq' || 
          href === '#faqs' || 
          href === '#faq'
        ) {
          e.preventDefault();
          handleNavigate('faqs');
        } else if (
          href === '/contact' || 
          href === '/contact-us' || 
          href === '/contact us' || 
          href === '#contact' ||
          href === '#contact us'
        ) {
          e.preventDefault();
          handleNavigate('contact');
        } else if (
          href === '/our-blog' || 
          href === '/our blog' || 
          href === '/blog' || 
          href === '#blog' ||
          href === '#our-blog' ||
          href === '#our blog'
        ) {
          e.preventDefault();
          handleNavigate('blog');
        } else if (href === '/home' || href === '/' || href === '#home') {
          e.preventDefault();
          handleNavigate('home');
        } else if (href === '/student' || href === '#student') {
          e.preventDefault();
          window.history.pushState(null, '', '/student');
          store.login('alex@example.com');
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '/tutor' || href === '#tutor') {
          e.preventDefault();
          window.history.pushState(null, '', '/tutor');
          store.login('clara@example.com');
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '/admin' || href === '#admin') {
          e.preventDefault();
          window.history.pushState(null, '', '/admin');
          store.login('shaka.ahmadd@gmail.com');
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Sync route after login updates
  const handleLogin = (email: string): boolean => {
    const success = store.login(email);
    if (success) {
      window.history.pushState(null, '', '/student'); // default to student path after normal login
      setActiveView('dashboard');
    }
    return success;
  };

  const handleRegister = (name: string, email: string, role: UserRole, extra?: any): boolean => {
    const success = store.register(name, email, role, extra);
    if (success) {
      if (extra && extra.verified === false) {
        window.history.pushState(null, '', '/auth');
        setActiveView('auth');
      } else {
        const path = role === UserRole.STUDENT ? '/student' : role === UserRole.TUTOR ? '/tutor' : '/admin';
        window.history.pushState(null, '', path);
        setActiveView('dashboard');
      }
    }
    return success;
  };

  const handleLogout = () => {
    store.logout();
    setActiveChat(null);
    handleNavigate('home');
  };

  // Quick Switch Audit Role handler
  const handleQuickLogin = (role: UserRole) => {
    setActiveChat(null);
    if (role === UserRole.STUDENT) {
      window.history.pushState(null, '', '/student');
      store.login('alex@example.com');
    } else if (role === UserRole.TUTOR) {
      window.history.pushState(null, '', '/tutor');
      store.login('clara@example.com');
    } else if (role === UserRole.ADMIN) {
      window.history.pushState(null, '', '/admin');
      store.login('shaka.ahmadd@gmail.com');
    }
    setActiveView('dashboard');
  };

  // Chat initiation
  const handleOpenChat = (tutorId: string, initialMessage?: string) => {
    if (!storeState.currentUser) {
      setActiveView('auth');
      return;
    }
    const chat = store.getOrCreateChat(storeState.currentUser.id, tutorId, 'Direct Consultation');
    if (initialMessage) {
      store.sendMessage(chat.id, storeState.currentUser.id, initialMessage);
    }
    setActiveChat(chat);
  };

  const handleGoogleConnectSuccess = (email: string, name: string, avatarUrl?: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    const matchedUser = storeState.users.find(u => u.email.toLowerCase().trim() === trimmedEmail);
    if (!matchedUser) {
      store.register(name, trimmedEmail, UserRole.STUDENT, {
        verified: true,
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80`
      });
    }
    store.login(trimmedEmail);
    setTimeout(() => {
      const updatedUser = store.currentUser;
      if (updatedUser) {
        const chat = store.getOrCreateChat(updatedUser.id, 'admin_emily', 'Official Administrative Support with Emily Vance');
        store.sendMessage(chat.id, updatedUser.id, 'Hi Emily, I connected via Google/Gmail Account and want to start chatting directly!');
        setActiveChat(chat);
      }
    }, 100);
    setIsSopModalOpen(false);
  };

  const liveChat = activeChat ? storeState.chats.find(c => c.id === activeChat.id) || activeChat : null;

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => {
    store.sendMessage(chatId, senderId, content, fileUrl, fileName);
  };

  const handleMarkMessagesAsRead = (chatId: string, userId: string) => {
    store.markMessagesAsRead(chatId, userId);
  };

  const handleSetTypingStatus = (chatId: string, role: UserRole, isTyping: boolean) => {
    store.setTypingStatus(chatId, role, isTyping);
  };

  const handleOfferQuote = (
    chatId: string, 
    amount: number, 
    estimatedHours: number, 
    serviceType?: string, 
    deliveryTime?: string, 
    scopeOfWork?: string,
    advancePercentage?: number,
    advanceAmount?: number,
    balanceAmount?: number
  ) => {
    store.offerQuote(
      chatId, 
      amount, 
      estimatedHours, 
      serviceType, 
      deliveryTime, 
      scopeOfWork,
      advancePercentage,
      advanceAmount,
      balanceAmount
    );
  };

  const handleAcceptQuote = (quoteId: string) => {
    store.acceptQuote(quoteId);
  };

  // Administration actions
  const handleDeleteUser = (userId: string) => {
    store.deleteUser(userId);
  };

  const handleUpdateUserProfile = (userId: string, updatedData: Partial<User>) => {
    store.updateUserProfile(userId, updatedData);
  };

  const handleDeleteChat = (chatId: string) => {
    store.deleteChat(chatId);
  };

  // Assignment Submissions
  const handleAssignmentSubmit = async (data: any) => {
    const assignId = await store.submitAssignment(data);
    setIsAssignModalOpen(false);
    
    // Lead student to chat support immediately
    const targetTutorId = data.tutorId || mentorsList[0]?.id || 'tutor_clara';
    handleOpenChat(targetTutorId, `Hi, I just submitted an assignment brief titled "${data.title}" (Ref: #${assignId}). let's discuss details.`);
  };

  // Student Actions
  const handleApproveWork = (assignId: string, rating: number, comment: string) => {
    store.studentReviewAndApprove(assignId, rating, comment);
  };

  const handleRaiseRevision = (assignId: string, details: string) => {
    store.studentRequestRevision(assignId, details);
  };

  const handleRaiseTicket = (sub: string, msg: string) => {
    if (storeState.currentUser) {
      store.raiseTicket(storeState.currentUser.id, sub, msg);
    }
  };

  // Tutor Actions
  const handleTutorDeliver = (assignId: string, fileUrl: string, fileName: string) => {
    store.tutorDeliverWork(assignId, fileUrl, fileName);
  };

  // Admin Actions
  const handleToggleUserStatus = (userId: string) => {
    store.toggleUserSuspension(userId);
  };

  const handleChangeUserRole = (userId: string, targetRole: UserRole) => {
    store.changeUserRole(userId, targetRole);
  };

  const handleGenerateProfile = (name: string, email: string, role: UserRole, extra?: any): boolean => {
    const success = store.register(name, email, role, { ...extra, verified: true });
    return success;
  };

  const handleAddBlog = (data: any) => {
    if (storeState.currentUser) {
      store.addBlog(data.title, data.content, data.image, data.category, data.tags, storeState.currentUser.id);
    }
  };

  const handleDeleteBlog = (blogId: string) => {
    store.deleteBlog(blogId);
  };

  const handleUpdateBlog = (blogId: string, title: string, content: string, image: string, category: string, tags: string[]) => {
    store.updateBlog(blogId, title, content, image, category, tags);
  };

  const handleAddFaq = (data: any) => {
    store.addFaq(data.question, data.answer, data.category);
  };

  const handleDeleteFaq = (faqId: string) => {
    store.deleteFaq(faqId);
  };

  const handleResolveDispute = (paymentId: string, action: 'release' | 'refund') => {
    const payment = store.payments.find(p => p.id === paymentId);
    if (!payment) return;

    if (action === 'release') {
      store.studentReviewAndApprove(payment.assignmentId);
    } else {
      store.adminProcessRefund(payment.assignmentId);
    }
    
    // Resolve any open tickets for this payment student
    const assign = store.assignments.find(a => a.id === payment.assignmentId);
    if (assign) {
      const ticket = store.supportTickets.find(t => t.studentId === assign.studentId && t.status === 'open');
      if (ticket) {
        store.resolveTicket(ticket.id);
      }
    }
  };

  // On-call consult tracker from main forms
  const handleOnCallConsultInput = (msg: string) => {
    // Automatically find Clara Stirling and open a connection chat logs
    if (storeState.currentUser) {
      const chat = store.getOrCreateChat(storeState.currentUser.id, 'tutor_clara', 'General Inquiry');
      store.sendMessage(chat.id, storeState.currentUser.id, msg);
      setActiveChat(chat);
    } else {
      setActiveView('auth');
    }
  };

  // Separate tutors to pass to dropdown triggers
  const mentorsList = storeState.users.filter(u => u.role === UserRole.TUTOR);
  const studentsList = storeState.users.filter(u => u.role === UserRole.STUDENT);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 relative overflow-x-clip" id="university-tutors-root">
      
      {/* Decorative ambient gradients for depth */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
      <div className="absolute top-1/3 -left-24 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>
      
      {/* 1. Header (Online indicator, Quick switcher, Main Navigation links) */}
      {!(activeView === 'dashboard' && storeState.currentUser?.role === UserRole.STUDENT) && (
        <Header 
          currentUser={storeState.currentUser}
          activeView={activeView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onQuickLogin={handleQuickLogin}
          studentsOnline={storeState.activeStudentsOnline}
        />
      )}

      {/* Main viewport displays */}
      <main className="flex-1">
        
        {/* Render main dashboards or static marketing views */}
        {activeView === 'auth' ? (
          <AuthPage 
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={handleNavigate}
          />
        ) : activeView === 'dashboard' ? (
          
          storeState.currentUser ? (
            
            storeState.currentUser.role === UserRole.STUDENT ? (
              <StudentDashboard 
                currentUser={storeState.currentUser}
                tutors={mentorsList}
                students={studentsList}
                assignments={storeState.assignments}
                chats={storeState.chats}
                messages={storeState.messages}
                payments={storeState.payments}
                supportTickets={storeState.supportTickets}
                onSubmitAssignment={(data) => {
                  setIsAssignModalOpen(true);
                }}
                onOpenChat={handleOpenChat}
                onSelectChat={handleSelectChat}
                onApproveWork={handleApproveWork}
                onRaiseRevision={handleRaiseRevision}
                onRaiseTicket={handleRaiseTicket}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                assignmentReports={storeState.assignmentReports}
              />
            ) : storeState.currentUser.role === UserRole.TUTOR ? (
              <TutorDashboard 
                currentUser={storeState.currentUser}
                students={studentsList}
                assignments={storeState.assignments}
                chats={storeState.chats}
                messages={storeState.messages}
                payments={storeState.payments}
                reviews={storeState.reviews}
                onTutorDeliver={handleTutorDeliver}
                onSelectChat={handleSelectChat}
                assignmentReports={storeState.assignmentReports}
                onCreateReport={store.createAssignmentReport.bind(store)}
                onUpdateReportStatus={store.updateAssignmentReportStatus.bind(store)}
              />
            ) : (
              <AdminDashboard 
                currentUser={storeState.currentUser}
                users={storeState.users}
                blogs={storeState.blogs}
                faqs={storeState.faqs}
                assignments={storeState.assignments}
                payments={storeState.payments}
                supportTickets={storeState.supportTickets}
                chats={storeState.chats}
                messages={storeState.messages}
                invoices={storeState.invoices}
                activityLogs={storeState.activityLogs}
                appNotifications={storeState.appNotifications}
                sops={storeState.sops}
                assignmentReports={storeState.assignmentReports}
                agreements={storeState.agreements}
                onToggleUserStatus={handleToggleUserStatus}
                onChangeUserRole={handleChangeUserRole}
                onAddBlog={handleAddBlog}
                onDeleteBlog={handleDeleteBlog}
                onUpdateBlog={handleUpdateBlog}
                onAddFaq={handleAddFaq}
                onDeleteFaq={handleDeleteFaq}
                onResolveDispute={handleResolveDispute}
                onGenerateProfile={handleGenerateProfile}
                onDeleteUser={handleDeleteUser}
                onUpdateUserProfile={handleUpdateUserProfile}
                onDeleteChat={handleDeleteChat}
                onSelectChat={handleSelectChat}
                onSendMessage={handleSendMessage}

                onAssignTutor={store.assignTutorToAssignment.bind(store)}
                onSetAssignmentPrice={store.setAssignmentPrice.bind(store)}
                onSettleInvoice={store.settleInvoice.bind(store)}
                onCreateInvoice={store.createInvoice.bind(store)}
                onSendNotification={store.sendAppNotification.bind(store)}
                onSendMissingPaymentNotification={store.sendMissingPaymentNotification.bind(store)}
                onUpdateAssignmentReportStatus={store.updateAssignmentReportStatus.bind(store)}
                onCreateAgreement={store.createAgreement.bind(store)}
                emails={storeState.emails || []}
                onSendTriggerEmail={store.sendTriggerEmail.bind(store)}
              />
            )

          ) : (
            <div className="py-20 text-center bg-white m-8 rounded-3xl border shadow-xs max-w-sm mx-auto space-y-4">
              <span className="text-4xl">🔒</span>
              <h3 className="font-sans font-bold text-lg text-gray-950">Dashboard Locked</h3>
              <p className="text-xs text-gray-500 px-6">Please authenticate using mock credentials or use the Quick Audit selectors in the header banner.</p>
              <button 
                onClick={() => setActiveView('auth')} 
                className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Authenticate Now
              </button>
            </div>
          )

        ) : activeView === 'get-a-quote' ? (
          <GetQuotePage 
            currentUser={storeState.currentUser}
            onNavigate={handleNavigate}
            tutors={mentorsList}
            onOpenChat={handleOpenChat}
          />
        ) : (
          /* Marketing Views (Home, Services, About Us, FAQs, Contact Form, Blog System) */
          <MarketingPages 
            activeView={activeView}
            tutors={mentorsList}
            blogs={storeState.blogs}
            faqs={storeState.faqs}
            onNavigate={handleNavigate}
            onTutorSelect={(tutorObj) => {
              handleOpenChat(tutorObj.id);
            }}
            onRaisedConsult={handleOnCallConsultInput}
            onGoogleConnect={() => setIsGoogleConnectModalOpen(true)}
          />
        )}

      </main>

      {/* Floating Tutorial Help Trigger with Google Connection Indicator Badge */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2" id="floating-support-container">
        {/* Pulsing Google Connect info card on top of the button */}
        <div className="flex flex-col items-end gap-1.5 animate-bounce-slow" id="green-chat-widget">
          {/* Action Heading Label */}
          <span className="bg-emerald-600 border border-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md text-right select-none">
            💬 Gmail Support Chat
          </span>

          <button 
            id="google-chat-smiley-btn"
            onClick={() => setIsGoogleConnectModalOpen(true)}
            className="group flex items-center justify-center bg-transparent transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative"
            title="Connect Google Account & Start Chat directly with Admin"
          >
            {/* The Green Smiley Bubble Shape specified in the User's Image */}
            <div className="relative w-14 h-14 drop-shadow-xl">
              <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Speech bubble shape with a rounded profile and a cute left tail */}
                <path 
                  d="M10 25C10 13.95 18.95 5 30 5H70C81.05 5 90 13.95 90 25V63C90 74.05 81.05 83 70 83H42L22 95V83H30C18.95 83 10 74.05 10 63V25Z" 
                  fill="#00C25F" 
                />
                {/* Secondary inner glow arc to match the gradient in the image */}
                <path 
                  d="M14 25C14 16.16 21.16 9 30 9H70C78.84 9 86 16.16 86 25V35C86 26.16 78.84 19 70 19H30C21.16 19 14 26.16 14 35V25Z" 
                  fill="white" 
                  fillOpacity="0.12" 
                />
                {/* Curved white smile arc */}
                <path 
                  d="M32 46Q50 69 68 46" 
                  stroke="white" 
                  strokeWidth="9" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>

              {/* Pulsing notification badge in corner */}
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
              </span>
            </div>
          </button>
        </div>

        <button
          id="trigger-sop-academy-tutorial"
          onClick={() => setIsSopModalOpen(true)}
          className="bg-gray-900 border border-gray-800 hover:bg-black text-white hover:text-orange-400 p-4 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center font-bold"
          title="Open interactive SOP tutorial walkthrough"
        >
          <HelpCircle className="w-5 h-5 text-orange-400 animate-bounce" />
          <span className="text-xs ml-2 font-sans tracking-wide">Interactive Guide</span>
        </button>
      </div>

      {/* 2. Footer (target flags, starting pricing, keyword no-follow links, academic disclaimers) */}
      {activeView !== 'dashboard' && <Footer onNavigate={handleNavigate} />}

      {/* 3. Consent cookie banner disclosure */}
      <CookieBanner />

      {/* 4. Interactive SOP walkthrough modal */}
      <SopModal 
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
        onGoogleConnect={() => setIsGoogleConnectModalOpen(true)}
      />

      {/* Google Connect Account Flow Modal */}
      <GoogleConnectModal 
        isOpen={isGoogleConnectModalOpen}
        onClose={() => setIsGoogleConnectModalOpen(false)}
        onSuccess={handleGoogleConnectSuccess}
      />

      {/* 5. Assignment submission parameters modal (only accessible to student accounts) */}
      {isAssignModalOpen && storeState.currentUser && (
        <AssignmentFormModal 
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={handleAssignmentSubmit}
          studentId={storeState.currentUser.id}
          tutors={mentorsList}
          prefilledTutorId={prefilledTutorForAssign}
        />
      )}

      {/* 6. Live Chat room overlay slideover dialog drawer */}
      {liveChat && storeState.currentUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full relative border shadow-2xl overflow-hidden animate-fade-in" id="active-chat-drawer-backdrop">
            <button
              id="close-chat-drawer-btn"
              onClick={() => setActiveChat(null)}
              className="absolute top-5 right-5 bg-white border hover:bg-gray-100 p-1.5 rounded-full text-gray-505 shadow-sm z-50"
            >
              ✕
            </button>
            <ChatWindow 
              chat={liveChat}
              messages={storeState.messages}
              currentUser={storeState.currentUser}
              onSendMessage={handleSendMessage}
              onOfferQuote={handleOfferQuote}
              onAcceptQuote={handleAcceptQuote}
              onMarkMessagesAsRead={handleMarkMessagesAsRead}
              onSetTypingStatus={handleSetTypingStatus}
              quotes={storeState.quotes}
              tutors={mentorsList}
              students={studentsList}
            />
          </div>
        </div>
      )}

    </div>
  );
}
