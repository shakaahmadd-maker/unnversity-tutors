import React, { useCallback, lazy } from 'react';
import { store, TabLoadState } from '../lib/store';
import { apiFetch } from '../lib/apiClient';
import {
  User,
  UserRole,
  Chat,
  Message,
  Quote,
  Assignment,
  Payment,
  Blog,
  FAQ,
  SupportTicket,
  Review,
  Invoice,
  ActivityLog,
  AppNotification,
  SOP,
  AssignmentReport,
  Agreement,
  TriggeredEmail,
} from '../types';

const StudentDashboard = lazy(() => import('./StudentDashboard'));
const TutorDashboard = lazy(() => import('./TutorDashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

export interface DashboardStoreSnapshot {
  currentUser: User | null;
  users: User[];
  blogs: Blog[];
  faqs: FAQ[];
  chats: Chat[];
  messages: Message[];
  quotes: Quote[];
  assignments: Assignment[];
  payments: Payment[];
  supportTickets: SupportTicket[];
  reviews: Review[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  appNotifications: AppNotification[];
  sops: SOP[];
  assignmentReports: AssignmentReport[];
  agreements: Agreement[];
  emails: TriggeredEmail[];
  connectionStatus: 'connected' | 'offline' | 'error' | 'syncing';
  lastSyncTime: string | null;
  syncError: string | null;
  tabStates: Record<string, TabLoadState>;
  isLoadingMessages: boolean;
  chatError: string | null;
}

interface DashboardPortalProps {
  storeState: DashboardStoreSnapshot;
  mentorsList: User[];
  studentsList: User[];
  onOpenChat: (tutorId: string, initialMessage?: string) => Chat | undefined;
  onSelectChat: (chat: Chat) => void;
  onSendMessage: (chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) => Promise<any>;
  onAcceptQuote: (quoteId: string) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onRefreshData: () => Promise<void>;
  onRequireAuth: () => void;
}

export default function DashboardPortal({
  storeState,
  mentorsList,
  studentsList,
  onOpenChat,
  onSelectChat,
  onSendMessage,
  onAcceptQuote,
  onLogout,
  onNavigate,
  onRefreshData,
  onRequireAuth,
}: DashboardPortalProps) {
  const currentActiveUser = store.currentUser || storeState.currentUser;

  const handleSubscribeToChatDetails = useCallback((chatId: string) => {
    return store.subscribeToChatDetails(chatId);
  }, []);

  const handleLoadStudentTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('student', tab, { force });
  }, []);

  const handleLoadTutorTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('tutor', tab, { force });
  }, []);

  const handleLoadAdminTab = useCallback((tab: string, force = false) => {
    return store.loadDashboardTabData('admin', tab, { force });
  }, []);

  const handleMarkNotificationRead = useCallback((id: string) => {
    return store.markNotificationRead(id);
  }, []);

  const handleMarkAllNotificationsRead = useCallback((userId: string) => {
    return store.markAllNotificationsRead(userId);
  }, []);

  const handlePayAdvance = useCallback((assignmentId: string, amount: number) => {
    return store.processAdvancePayment(assignmentId, amount);
  }, []);

  const handlePayBalance = useCallback((assignmentId: string, amount: number) => {
    return store.processBalancePayment(assignmentId, amount);
  }, []);

  const handleApproveWork = useCallback((assignId: string, rating: number, comment: string) => {
    store.studentReviewAndApprove(assignId, rating, comment);
  }, []);

  const handleRaiseRevision = useCallback((assignId: string, details: string) => {
    store.studentRequestRevision(assignId, details);
  }, []);

  const handleRaiseTicket = useCallback(
    (sub: string, msg: string) => {
      if (currentActiveUser) {
        store.raiseTicket(currentActiveUser.id, sub, msg);
      }
    },
    [currentActiveUser]
  );

  const handleTutorDeliver = useCallback((assignId: string, fileUrl: string, fileName: string) => {
    store.tutorDeliverWork(assignId, fileUrl, fileName);
  }, []);

  const handleToggleUserStatus = useCallback((userId: string) => {
    store.toggleUserSuspension(userId);
  }, []);

  const handleChangeUserRole = useCallback(
    (userId: string, targetRole: UserRole) => {
      const isSuperiorAdmin = currentActiveUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
      if (!isSuperiorAdmin) {
        console.error('Permission Denied: Only Superior Admin can change user roles.');
        store.syncError = 'Permission Denied: Only Superior Admin can change user roles.';
        store.notify();
        return;
      }
      store.changeUserRole(userId, targetRole);
    },
    [currentActiveUser]
  );

  const handleGenerateProfile = useCallback(
    async (name: string, email: string, role: UserRole, extra?: any): Promise<boolean> => {
      const isSuperiorAdmin = currentActiveUser?.email?.toLowerCase().trim() === 'shaka.ahmadd@gmail.com';
      if (!isSuperiorAdmin) {
        throw new Error('Permission Denied: Only Superior Admin is authorized to generate profiles.');
      }

      try {
        const response = await apiFetch('/api/create-privileged-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            role,
            extra,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Server rejected request');
        }

        const data = await response.json();
        if (data.user) {
          void store.fetchData();
        }
        return !!data.success;
      } catch (err: any) {
        console.error('Error creating privileged user via secure backend:', err);
        throw err;
      }
    },
    [currentActiveUser]
  );

  const handleAddBlog = useCallback(
    (data: any) => {
      if (currentActiveUser) {
        void store.addBlog(data.title, data.content, data.image, data.category, data.tags, currentActiveUser.id);
      }
    },
    [currentActiveUser]
  );

  const handleDeleteBlog = useCallback((blogId: string) => {
    void store.deleteBlog(blogId);
  }, []);

  const handleUpdateBlog = useCallback(
    (blogId: string, title: string, content: string, image: string, category: string, tags: string[]) => {
      void store.updateBlog(blogId, title, content, image, category, tags);
    },
    []
  );

  const handleSyncDefaultBlogs = useCallback(async (): Promise<boolean> => {
    return await store.syncDefaultBlogs();
  }, []);

  const handleAddFaq = useCallback((data: any) => {
    void store.addFaq(data.question, data.answer, data.category);
  }, []);

  const handleDeleteFaq = useCallback((faqId: string) => {
    void store.deleteFaq(faqId);
  }, []);

  const handleResolveDispute = useCallback((paymentId: string, action: 'release' | 'refund') => {
    const payment = store.payments.find((p) => p.id === paymentId);
    if (!payment) return;

    if (action === 'release') {
      void store.studentReviewAndApprove(payment.assignmentId);
    } else {
      void store.adminProcessRefund(payment.assignmentId);
    }

    const assign = store.assignments.find((a) => a.id === payment.assignmentId);
    if (assign) {
      const ticket = store.supportTickets.find((t) => t.studentId === assign.studentId && t.status === 'open');
      if (ticket) {
        void store.resolveTicket(ticket.id);
      }
    }
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    void store.deleteUser(userId);
  }, []);

  const handleUpdateUserProfile = useCallback((userId: string, updatedData: Partial<User>) => {
    void store.updateUserProfile(userId, updatedData);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    store.deleteChat(chatId);
  }, []);

  if (!currentActiveUser) {
    return (
      <div className="py-20 text-center bg-white m-8 rounded-3xl border shadow-xs max-w-sm mx-auto space-y-4">
        <span className="text-4xl">🔒</span>
        <h3 className="font-sans font-bold text-lg text-gray-950">Dashboard Locked</h3>
        <p className="text-xs text-gray-500 px-6">Please sign in to access your dashboard.</p>
        <button
          onClick={onRequireAuth}
          className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (currentActiveUser.role === UserRole.STUDENT) {
    return (
      <StudentDashboard
        currentUser={currentActiveUser}
        tutors={mentorsList}
        students={studentsList}
        assignments={storeState.assignments}
        chats={storeState.chats}
        messages={storeState.messages}
        payments={storeState.payments}
        supportTickets={storeState.supportTickets}
        onSubmitAssignment={async (data) => {
          await store.submitAssignment(data);
        }}
        onOpenChat={onOpenChat}
        onSelectChat={onSelectChat}
        onSendMessage={onSendMessage}
        onSubscribeToChatDetails={handleSubscribeToChatDetails}
        onApproveWork={handleApproveWork}
        onRaiseRevision={handleRaiseRevision}
        onRaiseTicket={handleRaiseTicket}
        onLogout={onLogout}
        onNavigate={onNavigate}
        assignmentReports={storeState.assignmentReports}
        quotes={storeState.quotes}
        onAcceptQuote={onAcceptQuote}
        appNotifications={storeState.appNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onUpdateProfile={(data) => store.updateUserProfile(currentActiveUser.id, data)}
        invoices={storeState.invoices}
        onRefreshData={onRefreshData}
        onLoadTab={handleLoadStudentTab}
        tabStates={storeState.tabStates}
        isLoadingMessages={storeState.isLoadingMessages}
        chatError={storeState.chatError}
        syncError={storeState.syncError}
        lastSyncTime={storeState.lastSyncTime}
        onPayAdvance={handlePayAdvance}
        onPayBalance={handlePayBalance}
      />
    );
  }

  if (currentActiveUser.role === UserRole.TUTOR) {
    return (
      <TutorDashboard
        currentUser={currentActiveUser}
        students={studentsList}
        assignments={storeState.assignments}
        chats={storeState.chats}
        messages={storeState.messages}
        payments={storeState.payments}
        reviews={storeState.reviews}
        onTutorDeliver={handleTutorDeliver}
        onSelectChat={onSelectChat}
        assignmentReports={storeState.assignmentReports}
        onCreateReport={store.createAssignmentReport.bind(store)}
        onUpdateReportStatus={store.updateAssignmentReportStatus.bind(store)}
        onLoadTab={handleLoadTutorTab}
        tabStates={storeState.tabStates}
        syncError={storeState.syncError}
      />
    );
  }

  return (
    <AdminDashboard
      currentUser={currentActiveUser}
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
      onAddNewTutor={store.createTutorProfile.bind(store)}
      onDeleteChat={handleDeleteChat}
      onSelectChat={onSelectChat}
      onSendMessage={onSendMessage}
      onSubscribeToChatDetails={handleSubscribeToChatDetails}
      onGetOrCreateChat={store.getOrCreateChat.bind(store)}
      onAssignTutor={store.assignTutorToAssignment.bind(store)}
      onSetAssignmentPrice={store.setAssignmentPrice.bind(store)}
      onUpdateAssignmentStatus={store.updateAssignmentStatus.bind(store)}
      onUpdateAssignment={store.updateAssignment.bind(store)}
      onDeleteAssignment={store.deleteAssignment.bind(store)}
      onCreateAssignmentOrder={store.createAssignmentOrder.bind(store)}
      onReleaseEscrow={store.releaseEscrow.bind(store)}
      onRefreshData={onRefreshData}
      onSettleInvoice={store.settleInvoice.bind(store)}
      onCreateInvoice={store.createInvoice.bind(store)}
      onSendNotification={store.sendAppNotification.bind(store)}
      onSendMissingPaymentNotification={store.sendMissingPaymentNotification.bind(store)}
      onUpdateAssignmentReportStatus={store.updateAssignmentReportStatus.bind(store)}
      onCreateAgreement={store.createAgreement.bind(store)}
      emails={storeState.emails || []}
      onSendTriggerEmail={store.sendTriggerEmail.bind(store)}
      onSeedMockStudentData={store.seedMockStudentData.bind(store)}
      onLoadTab={handleLoadAdminTab}
      tabStates={storeState.tabStates}
      isLoadingMessages={storeState.isLoadingMessages}
      chatError={storeState.chatError}
      connectionStatus={storeState.connectionStatus}
      lastSyncTime={storeState.lastSyncTime}
      syncError={storeState.syncError}
    />
  );
}
