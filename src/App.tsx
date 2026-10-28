import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import SopModal from './components/SopModal';
import AuthPage from './components/AuthPage';
import AdminLoginPage from './components/AdminLoginPage';
import MarketingPages from './components/MarketingPages';
import StudentDashboard from './components/StudentDashboard';
import TutorDashboard from './components/TutorDashboard';
import AdminDashboard from './components/AdminDashboard';
import AssignmentFormModal from './components/AssignmentFormModal';
import BecomeTutorModal from './components/BecomeTutorModal';
import ChatWindow from './components/ChatWindow';
import GetQuotePage from './components/GetQuotePage';
import TutorProfilePage from './components/TutorProfilePage';
import TutorsDirectoryPage from './components/TutorsDirectoryPage';
import WhatsAppChatModal from './components/WhatsAppChatModal';
import CountryOnlineTutoringPage from './components/CountryOnlineTutoringPage';
import SpecializedServicePage from './components/SpecializedServicePage';
import WhatsAppPage from './components/WhatsAppPage';
import { COUNTRY_ONLINE_TUTORING_PAGES } from './data/countryOnlineTutoringData';
import { SPECIALIZED_SERVICE_PAGES_MAP } from './data/specializedTutoringServicesData';

import { store } from './lib/store';
import { UserRole, Chat, User, Assignment, Payment, Invoice, ActivityLog, AppNotification, SOP, AssignmentReport, Agreement } from './types';
import { Sparkles, HelpCircle, MessageSquare } from 'lucide-react';

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
    activeStudentsOnline: store.activeStudentsOnline,
    emails: store.emails || [],
    connectionStatus: store.connectionStatus || 'syncing',
    lastSyncTime: store.lastSyncTime || null,
    syncError: store.syncError || null
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [activeCountryTutoringSlug, setActiveCountryTutoringSlug] = useState<string>('usa');
  const [activeSpecializedServiceSlug, setActiveSpecializedServiceSlug] = useState<string>('assignment-guidance');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [selectedTutorProfile, setSelectedTutorProfile] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isBecomeTutorOpen, setIsBecomeTutorOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [prefilledTutorForAssign, setPrefilledTutorForAssign] = useState<string>('');

  // Open WhatsApp modal 10 seconds after user moves to a new page; keep it shut on page transition
  useEffect(() => {
    setIsWhatsAppModalOpen(false);
    const timer = setTimeout(() => {
      setIsWhatsAppModalOpen(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeView, selectedTutorProfile]);

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
        activeStudentsOnline: store.activeStudentsOnline,
        emails: store.emails || [],
        connectionStatus: store.connectionStatus || 'syncing',
        lastSyncTime: store.lastSyncTime || null,
        syncError: store.syncError || null
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

    if (view.startsWith('location:')) {
      const loc = view.replace('location:', '');
      setLocationFilter(loc);
      setSubjectFilter('');
      setSelectedTutorProfile(null);
      setActiveView('tutors-directory');
      path = '/tutors-directory?location=' + encodeURIComponent(loc);
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('subject:')) {
      const subj = view.replace('subject:', '');
      setSubjectFilter(subj);
      setLocationFilter('');
      setSelectedTutorProfile(null);
      setActiveView('tutors-directory');
      path = '/tutors-directory?subject=' + encodeURIComponent(subj);
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('country-tutoring:')) {
      const slug = view.replace('country-tutoring:', '').toLowerCase().trim();
      setActiveCountryTutoringSlug(slug);
      setSelectedTutorProfile(null);
      setActiveView('country-online-tutoring');
      path = '/online-tutoring-' + slug;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.startsWith('online-tutoring-')) {
      const slug = view.replace('online-tutoring-', '').toLowerCase().trim();
      setActiveCountryTutoringSlug(slug);
      setSelectedTutorProfile(null);
      setActiveView('country-online-tutoring');
      path = '/' + view;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      view === 'assignment-guidance' ||
      view.startsWith('assignment-guidance-') ||
      view === 'coursework-tutoring' ||
      view.startsWith('coursework-tutoring-') ||
      view === 'writing-tutoring' ||
      view.startsWith('writing-tutoring-') ||
      Boolean(SPECIALIZED_SERVICE_PAGES_MAP[view]) ||
      Boolean(SPECIALIZED_SERVICE_PAGES_MAP['/' + view])
    ) {
      const cleanSlug = view.replace(/^\//, '').toLowerCase().trim();
      setActiveSpecializedServiceSlug(cleanSlug);
      setSelectedTutorProfile(null);
      setActiveView('specialized-service');
      path = '/' + cleanSlug;
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'tutors-directory') {
      setSelectedTutorProfile(null);
      setActiveView('tutors-directory');
      path = '/tutors-directory';
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'sop') {
      setIsSopModalOpen(true);
      return;
    }

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
    } else if (view === 'whatsapp') {
      path = '/whatsapp';
    } else if (view === 'privacy') {
      path = '/privacy';
    } else if (view === 'terms') {
      path = '/terms';
    } else if (view === 'auth') {
      path = '/auth';
    } else if (view === 'admin-login') {
      path = '/admin';
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
      } else if (
        decodedPath === '/student' || hash === '#student' ||
        decodedPath === '/tutor' || hash === '#tutor'
      ) {
        if (store.currentUser) {
          setActiveView('dashboard');
        } else {
          setActiveView('auth');
        }
      } else if (decodedPath === '/admin' || hash === '#admin') {
        if (store.currentUser && store.currentUser.role === UserRole.ADMIN) {
          setActiveView('dashboard');
        } else {
          setActiveView('admin-login');
        }
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
      } else if (
        decodedPath === '/whatsapp' || 
        decodedPath === '/whatsapp-desk' || 
        hash === '#whatsapp'
      ) {
        setActiveView('whatsapp');
      } else if (decodedPath === '/privacy' || hash === '#privacy') {
        setActiveView('privacy');
      } else if (decodedPath === '/terms' || hash === '#terms') {
        setActiveView('terms');
      } else if (decodedPath === '/auth' || hash === '#auth') {
        setActiveView('auth');
      } else if (
        decodedPath.startsWith('/online-tutoring-') || 
        hash.startsWith('#online-tutoring-')
      ) {
        const fullKey = decodedPath.startsWith('/online-tutoring-') 
          ? decodedPath.replace('/online-tutoring-', '')
          : hash.replace('#online-tutoring-', '');
        const cleanKey = fullKey.split('?')[0].split('#')[0].trim();
        setActiveCountryTutoringSlug(cleanKey || 'usa');
        setActiveView('country-online-tutoring');
      } else if (
        decodedPath === '/assignment-guidance' ||
        decodedPath.startsWith('/assignment-guidance-') ||
        hash === '#assignment-guidance' ||
        hash.startsWith('#assignment-guidance-') ||
        decodedPath === '/coursework-tutoring' ||
        decodedPath.startsWith('/coursework-tutoring-') ||
        hash === '#coursework-tutoring' ||
        hash.startsWith('#coursework-tutoring-') ||
        decodedPath === '/writing-tutoring' ||
        decodedPath.startsWith('/writing-tutoring-') ||
        hash === '#writing-tutoring' ||
        hash.startsWith('#writing-tutoring-') ||
        Boolean(SPECIALIZED_SERVICE_PAGES_MAP[decodedPath.replace(/^\//, '')])
      ) {
        const rawSlug = decodedPath.startsWith('/') ? decodedPath.slice(1) : (hash.startsWith('#') ? hash.slice(1) : decodedPath);
        const cleanSlug = rawSlug.split('?')[0].split('#')[0].trim();
        setActiveSpecializedServiceSlug(cleanSlug || 'assignment-guidance');
        setActiveView('specialized-service');
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
        } else if (
          href === '/whatsapp' || 
          href === '#whatsapp' || 
          href.endsWith('/whatsapp')
        ) {
          e.preventDefault();
          handleNavigate('whatsapp');
        } else if (
          href.startsWith('/online-tutoring-') || 
          href.startsWith('#online-tutoring-') ||
          href.includes('university-tutors.com/online-tutoring-')
        ) {
          e.preventDefault();
          const cleanPath = href.split('university-tutors.com').pop() || href;
          const slug = cleanPath
            .replace(/^\/?(online-tutoring-|#online-tutoring-)/, '')
            .replace(/^\//, '')
            .replace('online-tutoring-', '')
            .split('?')[0]
            .split('#')[0]
            .trim();
          handleNavigate(`online-tutoring-${slug}`);
        } else if (
          href === '/assignment-guidance' ||
          href.startsWith('/assignment-guidance-') ||
          href.startsWith('#assignment-guidance') ||
          href === '/coursework-tutoring' ||
          href.startsWith('/coursework-tutoring-') ||
          href.startsWith('#coursework-tutoring') ||
          href === '/writing-tutoring' ||
          href.startsWith('/writing-tutoring-') ||
          href.startsWith('#writing-tutoring') ||
          href.includes('university-tutors.com/assignment-guidance') ||
          href.includes('university-tutors.com/coursework-tutoring') ||
          href.includes('university-tutors.com/writing-tutoring')
        ) {
          e.preventDefault();
          const cleanPath = href.split('university-tutors.com').pop() || href;
          const slug = cleanPath
            .replace(/^\/?#?/, '')
            .split('?')[0]
            .split('#')[0]
            .trim();
          handleNavigate(slug);
        } else if (href === '/home' || href === '/' || href === '#home') {
          e.preventDefault();
          handleNavigate('home');
        } else if (href === '/admin' || href === '#admin') {
          e.preventDefault();
          if (store.currentUser && store.currentUser.role === UserRole.ADMIN) {
            window.history.pushState(null, '', '/admin');
            setActiveView('dashboard');
          } else {
            window.history.pushState(null, '', '/admin');
            setActiveView('admin-login');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (
          href === '/student' || href === '#student' ||
          href === '/tutor' || href === '#tutor'
        ) {
          e.preventDefault();
          if (store.currentUser) {
            const rolePath = store.currentUser.role === UserRole.TUTOR ? '/tutor' : '/student';
            window.history.pushState(null, '', rolePath);
            setActiveView('dashboard');
          } else {
            window.history.pushState(null, '', '/auth');
            setActiveView('auth');
          }
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
  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    const success = await store.login(email, password);
    if (success) {
      const user = store.currentUser;
      const rolePath = user?.role === UserRole.TUTOR ? '/tutor' : user?.role === UserRole.ADMIN ? '/admin' : '/student';
      window.history.pushState(null, '', rolePath); // default to role-specific path after normal login
      setActiveView('dashboard');
    }
    return success;
  };

  const handleRegister = async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
    const success = await store.register(name, email, role, extra);
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

  // Quick Switch Audit Role handler - Disabled in real production build
  const handleQuickLogin = (role: UserRole) => {
    // Sandbox role switcher disabled for real auth
    console.log("Quick switcher is disabled to protect real secure user accounts.");
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
    
    // Lead student to admin chat support immediately
    const targetTutorId = 'admin_shaka';
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
    const isSuperiorAdmin = storeState.currentUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
    if (!isSuperiorAdmin) {
      console.error("Permission Denied: Only Superior Admin can change user roles.");
      alert("Permission Denied: Only Superior Admin can change user roles.");
      return;
    }
    store.changeUserRole(userId, targetRole);
  };

  const handleGenerateProfile = async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
    const isSuperiorAdmin = storeState.currentUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
    if (!isSuperiorAdmin) {
      throw new Error("Permission Denied: Only Superior Admin is authorized to generate profiles.");
    }

    try {
      const sessionToken = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/create-privileged-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          name,
          email,
          role,
          extra
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server rejected request');
      }

      const data = await response.json();
      return !!data.success;
    } catch (err: any) {
      console.error("Error creating privileged user via secure backend:", err);
      throw err;
    }
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

  const handleSyncDefaultBlogs = async (): Promise<boolean> => {
    return await store.syncDefaultBlogs();
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

  // Separate tutors to pass to dropdown triggers (only approved tutors visible on public website)
  const mentorsList = storeState.users.filter(u => u.role === UserRole.TUTOR && (u.isApproved === true || u.status === 'approved' || (u.isApproved === undefined && u.status === undefined)));
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
          onOpenBecomeTutor={() => setIsBecomeTutorOpen(true)}
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
        ) : activeView === 'admin-login' ? (
          <AdminLoginPage 
            onLogin={handleLogin}
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
                onSubmitAssignment={async (data) => {
                  // Silently submit the assignment matched via wizard in the background
                  await store.submitAssignment(data);
                }}
                onOpenChat={handleOpenChat}
                onSelectChat={handleSelectChat}
                onSendMessage={handleSendMessage}
                onSubscribeToChatDetails={(chatId) => store.subscribeToChatDetails(chatId)}
                onApproveWork={handleApproveWork}
                onRaiseRevision={handleRaiseRevision}
                onRaiseTicket={handleRaiseTicket}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                assignmentReports={storeState.assignmentReports}
                quotes={storeState.quotes}
                onAcceptQuote={handleAcceptQuote}
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
                onSyncDefaultBlogs={handleSyncDefaultBlogs}
                onAddFaq={handleAddFaq}
                onDeleteFaq={handleDeleteFaq}
                onResolveDispute={handleResolveDispute}
                onGenerateProfile={handleGenerateProfile}
                onDeleteUser={handleDeleteUser}
                onUpdateUserProfile={handleUpdateUserProfile}
                onDeleteChat={handleDeleteChat}
                onSelectChat={handleSelectChat}
                onSendMessage={handleSendMessage}
                onSubscribeToChatDetails={(chatId) => store.subscribeToChatDetails(chatId)}
                onGetOrCreateChat={store.getOrCreateChat.bind(store)}

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
                onSeedMockStudentData={store.seedMockStudentData.bind(store)}
                connectionStatus={storeState.connectionStatus}
                lastSyncTime={storeState.lastSyncTime}
                syncError={storeState.syncError}
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
        ) : activeView === 'tutor-profile' && selectedTutorProfile ? (
          <TutorProfilePage
            tutor={selectedTutorProfile}
            onNavigate={handleNavigate}
            onOpenChat={handleOpenChat}
            onSearchKeyword={(keyword) => {
              setSubjectFilter(keyword);
              setActiveView('tutors-directory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookSession={(tutor) => {
              handleOpenChat(tutor.id);
            }}
          />
        ) : activeView === 'country-online-tutoring' || activeView.startsWith('online-tutoring-') ? (
          <CountryOnlineTutoringPage
            countryKey={activeCountryTutoringSlug}
            tutors={mentorsList}
            onNavigate={handleNavigate}
            onSelectCountry={(slug) => {
              setActiveCountryTutoringSlug(slug);
              handleNavigate(`online-tutoring-${slug}`);
            }}
            onSelectTutorProfile={(tutor) => {
              setSelectedTutorProfile(tutor);
              setActiveView('tutor-profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChat={handleOpenChat}
            onSearchCity={(city) => {
              setLocationFilter(city);
              setSubjectFilter('');
              setSelectedTutorProfile(null);
              setActiveView('tutors-directory');
              window.history.pushState(null, '', '/tutors-directory?location=' + encodeURIComponent(city));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSearchSubject={(subj) => {
              setSubjectFilter(subj);
              setLocationFilter('');
              setSelectedTutorProfile(null);
              setActiveView('tutors-directory');
              window.history.pushState(null, '', '/tutors-directory?subject=' + encodeURIComponent(subj));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'specialized-service' || 
            Boolean(SPECIALIZED_SERVICE_PAGES_MAP[activeView]) ||
            activeView.startsWith('assignment-guidance') ||
            activeView.startsWith('coursework-tutoring') ||
            activeView.startsWith('writing-tutoring') ? (
          <SpecializedServicePage
            pageSlug={activeSpecializedServiceSlug}
            tutors={mentorsList}
            onNavigate={handleNavigate}
            onSelectTutorProfile={(tutor) => {
              setSelectedTutorProfile(tutor);
              setActiveView('tutor-profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChat={handleOpenChat}
            onSearchCity={(city) => {
              setLocationFilter(city);
              setSubjectFilter('');
              setSelectedTutorProfile(null);
              setActiveView('tutors-directory');
              window.history.pushState(null, '', '/tutors-directory?location=' + encodeURIComponent(city));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSearchSubject={(subj) => {
              setSubjectFilter(subj);
              setLocationFilter('');
              setSelectedTutorProfile(null);
              setActiveView('tutors-directory');
              window.history.pushState(null, '', '/tutors-directory?subject=' + encodeURIComponent(subj));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'tutors-directory' ? (
          <TutorsDirectoryPage
            locationFilter={locationFilter}
            subjectFilter={subjectFilter}
            onNavigate={handleNavigate}
            onSelectTutorProfile={(tutor) => {
              setSelectedTutorProfile(tutor);
              setActiveView('tutor-profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChat={handleOpenChat}
            allStoreTutors={mentorsList}
          />
        ) : activeView === 'whatsapp' ? (
          <WhatsAppPage
            currentUser={storeState.currentUser}
            onNavigate={handleNavigate}
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
            onSelectTutorProfile={(tutorObj) => {
              setSelectedTutorProfile(tutorObj);
              setActiveView('tutor-profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRaisedConsult={handleOnCallConsultInput}
          />
        )}

      </main>

      {/* Floating Tutorial Help Trigger (Bottom Right) */}
      <div 
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2" 
        id="floating-support-container"
      >
        <button
          id="trigger-sop-academy-tutorial"
          onClick={() => setIsSopModalOpen(true)}
          className="bg-gray-900 border border-gray-800 hover:bg-black text-white hover:text-orange-400 p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center font-bold"
          title="Open interactive SOP tutorial walkthrough"
        >
          <HelpCircle className="w-5 h-5 text-orange-400 animate-bounce shrink-0" />
          <span className="text-xs ml-2 font-sans tracking-wide hidden sm:inline">Interactive Guide</span>
        </button>
      </div>

      {/* Floating WhatsApp Instant Chat Trigger (Bottom Left) */}
      {!isWhatsAppModalOpen && (
        <div 
          className="fixed bottom-3 sm:bottom-6 left-3 sm:left-6 z-40 flex flex-col items-start gap-2" 
          id="floating-whatsapp-container"
        >
          <button
            id="trigger-whatsapp-chat-modal"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="group bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white w-9.5 h-9.5 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2.5 rounded-full shadow-md sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center font-bold gap-2 border border-emerald-400/40"
            title="Open WhatsApp Instant Chat"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.887 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping"></span>
            </div>
            <span className="text-xs font-sans tracking-wide text-white uppercase font-bold hidden sm:inline">Instant Chat</span>
          </button>
        </div>
      )}

      {/* 2. Footer (target flags, starting pricing, keyword no-follow links, academic disclaimers) */}
      {activeView !== 'dashboard' && (
        <Footer 
          onNavigate={handleNavigate} 
          onOpenBecomeTutor={() => setIsBecomeTutorOpen(true)}
        />
      )}

      {/* 3. Consent cookie banner disclosure */}
      <CookieBanner />

      {/* Become a Tutor Application Modal */}
      <BecomeTutorModal
        isOpen={isBecomeTutorOpen}
        onClose={() => setIsBecomeTutorOpen(false)}
        onSubmit={async (data) => {
          return await store.submitTutorApplication(data);
        }}
      />

      {/* 4. Interactive SOP walkthrough modal */}
      <SopModal 
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
      />

      {/* 5. WhatsApp Instant Chat Modal */}
      <WhatsAppChatModal 
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        currentUser={storeState.currentUser}
        whatsappNumber="19178094906"
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
