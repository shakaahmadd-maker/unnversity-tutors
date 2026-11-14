import {
  User,
  UserRole,
  Message,
  Quote,
  Assignment,
  AssignmentStatus,
  Payment,
  FAQ,
  SupportTicket,
  Invoice,
  ActivityLog,
  AppNotification,
  AssignmentReport,
  Agreement,
  TriggeredEmail,
} from '../types';
import {
  apiFetch,
  isAbortError,
  getFriendlyErrorMessage,
  recordTabDiagnosticError,
  clearTabDiagnosticError,
} from './apiClient';
import type { AppStore } from './store';

export async function loadDashboardTabData(
  store: AppStore,
  role: string,
  tab: string,
  options?: { force?: boolean; page?: number; limit?: number; search?: string }
): Promise<void> {
  if (!store.currentUser) return;

  const key = `${role}:${tab}`;
  const existingState = store.tabStates[key];
  if (!options?.force && existingState?.loadedAt && Date.now() - existingState.loadedAt < 12_000) {
    return;
  }

  store.cancelTabRequests(key);
  const controller = new AbortController();
  store.tabAbortControllers.set(key, controller);
  const { signal } = controller;

  store.tabStates = {
    ...store.tabStates,
    [key]: { loading: true, error: null, loadedAt: existingState?.loadedAt ?? null },
  };
  store.notify();

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 50;
  const searchQ = options?.search ? `&search=${encodeURIComponent(options.search.trim())}` : '';

  const isStaff =
    store.currentUser.role === UserRole.ADMIN ||
    store.currentUser.role === UserRole.SUBADMIN ||
    (store.currentUser.role as string) === 'admin' ||
    (store.currentUser.role as string) === 'subadmin';

  try {
    const tasks: Promise<void>[] = [];

    const safeGet = async (url: string, apply: (data: any) => void) => {
      const res = await apiFetch(url, { signal });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to load ${url.split('?')[0]} (HTTP ${res.status})`);
      }
      const data = await res.json();
      apply(data);
    };

    if (role === 'student') {
      if (['dashboard', 'assignments', 'submit', 'progress', 'deadlines', 'files'].includes(tab)) {
        tasks.push(
          safeGet(`/api/orders?page=${page}&limit=${limit}${searchQ}`, (oData) => {
            if (Array.isArray(oData.orders)) {
              store.assignments = oData.orders.map((o: any) => ({
                ...o,
                wordCount: o.wordCount || 250,
                fileUrls: typeof o.fileUrls === 'string' ? JSON.parse(o.fileUrls || '[]') : (o.fileUrls || []),
                fileNames: typeof o.fileNames === 'string' ? JSON.parse(o.fileNames || '[]') : (o.fileNames || []),
              }));
            }
          })
        );
        tasks.push(
          safeGet(`/api/quotes?page=${page}&limit=${limit}`, (qData) => {
            if (Array.isArray(qData.quotes)) store.quotes = qData.quotes;
          })
        );
      }
      if (['dashboard', 'chat', 'messages', 'support'].includes(tab)) {
        tasks.push(
          safeGet(`/api/chat-rooms?page=${page}&limit=${limit}`, (rData) => {
            if (Array.isArray(rData.rooms)) store.applyRoomsData(rData.rooms);
          })
        );
      }
      if (['dashboard', 'tutors', 'submit'].includes(tab)) {
        tasks.push(
          safeGet(`/api/users?role=tutor&page=1&limit=2500`, (uData) => {
            if (Array.isArray(uData.users)) {
              store.mergeServerUsers(uData.users);
              store.fullDirectoryLoaded = true;
            }
          })
        );
      }
      if (['dashboard', 'notifications'].includes(tab)) {
        tasks.push(
          safeGet(`/api/notifications?userId=${encodeURIComponent(store.currentUser.id)}&page=${page}&limit=${limit}`, (nData) => {
            if (Array.isArray(nData.notifications)) store.appNotifications = nData.notifications;
          })
        );
      }
      if (['payments', 'invoices', 'escrow'].includes(tab)) {
        tasks.push(
          safeGet(`/api/payments?page=${page}&limit=${limit}`, (pData) => {
            if (Array.isArray(pData.payments)) store.payments = pData.payments;
          }),
          safeGet(`/api/invoices?page=${page}&limit=${limit}`, (iData) => {
            if (Array.isArray(iData.invoices)) store.invoices = iData.invoices;
          })
        );
      }
    } else if (role === 'tutor') {
      if (['assignments', 'reports'].includes(tab)) {
        tasks.push(
          safeGet(`/api/orders?page=${page}&limit=${limit}`, (oData) => {
            if (Array.isArray(oData.orders)) {
              store.assignments = oData.orders.map((o: any) => ({
                ...o,
                wordCount: o.wordCount || 250,
                fileUrls: typeof o.fileUrls === 'string' ? JSON.parse(o.fileUrls || '[]') : (o.fileUrls || []),
                fileNames: typeof o.fileNames === 'string' ? JSON.parse(o.fileNames || '[]') : (o.fileNames || []),
              }));
            }
          }),
          safeGet(`/api/payments?page=${page}&limit=${limit}`, (pData) => {
            if (Array.isArray(pData.payments)) store.payments = pData.payments;
          })
        );
      }
      if (['chats'].includes(tab)) {
        tasks.push(
          safeGet(`/api/chat-rooms?page=${page}&limit=${limit}`, (rData) => {
            if (Array.isArray(rData.rooms)) store.applyRoomsData(rData.rooms);
          })
        );
      }
    } else if (role === 'admin' && isStaff) {
      if (['tutors_list', 'users', 'user_data', 'student_profiles'].includes(tab)) {
        tasks.push(
          safeGet(`/api/users?page=1&limit=2500${searchQ}`, (uData) => {
            if (Array.isArray(uData.users)) {
              store.mergeServerUsers(uData.users);
              store.fullDirectoryLoaded = true;
            }
          })
        );
      }
      if (['assignments', 'student_profiles', 'disputes', 'reports'].includes(tab)) {
        tasks.push(
          safeGet(`/api/orders?page=${page}&limit=${limit}`, (oData) => {
            if (Array.isArray(oData.orders)) {
              store.assignments = oData.orders.map((o: any) => ({
                ...o,
                wordCount: o.wordCount || 250,
                fileUrls: typeof o.fileUrls === 'string' ? JSON.parse(o.fileUrls || '[]') : (o.fileUrls || []),
                fileNames: typeof o.fileNames === 'string' ? JSON.parse(o.fileNames || '[]') : (o.fileNames || []),
              }));
            }
          })
        );
      }
      if (['chats'].includes(tab)) {
        tasks.push(
          safeGet(`/api/chat-rooms?page=${page}&limit=${limit}`, (rData) => {
            if (Array.isArray(rData.rooms)) store.applyRoomsData(rData.rooms);
          })
        );
      }
      if (['payments_ledger', 'create_invoice', 'disputes', 'student_profiles'].includes(tab)) {
        tasks.push(
          safeGet(`/api/payments?page=${page}&limit=${limit}`, (pData) => {
            if (Array.isArray(pData.payments)) store.payments = pData.payments;
          }),
          safeGet(`/api/invoices?page=${page}&limit=${limit}`, (iData) => {
            if (Array.isArray(iData.invoices)) store.invoices = iData.invoices;
          })
        );
      }
      if (['activity_log'].includes(tab)) {
        tasks.push(
          safeGet(`/api/audit-logs?page=${page}&limit=${limit}`, (lData) => {
            if (Array.isArray(lData.logs)) {
              store.activityLogs = lData.logs.map((l: any) => ({
                id: l.id,
                userId: l.userId || '',
                userName: l.userName || '',
                userRole: (l.userRole || 'student') as UserRole,
                action: l.action,
                details: l.details,
                timestamp: l.createdAt,
              }));
            }
          })
        );
      }
      if (['notifications'].includes(tab)) {
        tasks.push(
          safeGet(`/api/notifications?page=${page}&limit=${limit}`, (nData) => {
            if (Array.isArray(nData.notifications)) store.appNotifications = nData.notifications;
          })
        );
      }
      if (['blogs'].includes(tab)) {
        tasks.push(
          safeGet(`/api/blogs?page=${page}&limit=${limit}`, (bData) => {
            if (Array.isArray(bData.blogs) && bData.blogs.length > 0) {
              store.blogs = bData.blogs.map((b: any) => ({
                ...b,
                image: b.imageUrl || b.image,
                imageUrl: b.imageUrl || b.image,
                tags: typeof b.tags === 'string' ? JSON.parse(b.tags || '[]') : (b.tags || []),
              }));
            }
          })
        );
      }
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    if (signal.aborted) return;
    clearTabDiagnosticError(tab, role);
    store.tabStates = {
      ...store.tabStates,
      [key]: { loading: false, error: null, loadedAt: Date.now() },
    };
    store.lastSyncTime = new Date().toLocaleTimeString();
    store.syncError = null;
  } catch (err: any) {
    if (isAbortError(err) || signal.aborted) return;
    const errMsg = getFriendlyErrorMessage(err, `Unable to load ${tab.replace(/_/g, ' ')} data.`);
    recordTabDiagnosticError(tab, errMsg, role);
    store.tabStates = {
      ...store.tabStates,
      [key]: { loading: false, error: errMsg, loadedAt: existingState?.loadedAt ?? null },
    };
    store.syncError = errMsg;
  } finally {
    if (store.tabAbortControllers.get(key) === controller) {
      store.tabAbortControllers.delete(key);
    }
    if (!signal.aborted && store.tabStates[key]?.loading) {
      store.tabStates = {
        ...store.tabStates,
        [key]: { ...store.tabStates[key], loading: false },
      };
    }
    store.notify();
  }
}

export async function subscribeToChatDetails(store: AppStore, chatId: string) {
  if (!chatId) return;
  if (store.chatAbortController) {
    store.chatAbortController.abort();
  }
  const controller = new AbortController();
  store.chatAbortController = controller;
  const { signal } = controller;

  store.isLoadingMessages = true;
  store.chatError = null;
  store.notify();
  try {
    let res = await apiFetch(`/api/chat-rooms/${encodeURIComponent(chatId)}/messages?limit=100`, { signal });
    if (!res.ok && res.status !== 401 && res.status !== 403) {
      res = await apiFetch(`/api/messages?chatId=${encodeURIComponent(chatId)}&limit=100`, { signal });
    }
    if (signal.aborted) return;
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        const otherMsgs = store.messages.filter((m) => m.chatId !== chatId && m.roomId !== chatId);
        const newMsgs = data.messages.map((m: any) => ({ ...m, timestamp: m.createdAt }));
        store.messages = [...otherMsgs, ...newMsgs];
        store.chatError = null;
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      store.chatError = errJson.error || 'Unable to load messages for this chat room.';
    }
  } catch (err: any) {
    if (isAbortError(err) || signal.aborted) return;
    store.chatError = getFriendlyErrorMessage(err, 'Error connecting to chat server.');
  } finally {
    if (store.chatAbortController === controller) {
      store.chatAbortController = null;
    }
    store.isLoadingMessages = false;
    store.notify();
  }
}

export async function login(store: AppStore, email: string, password?: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: password || '' }),
      skipAuthEvent: true,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Authentication rejected');
    }

    if (!data?.user?.id) {
      throw new Error('Backend session could not be established.');
    }

    store.currentUser = data.user;
    store.sessionExpiredMessage = null;
    store.isSessionInitialized = true;
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'ut_session_active=1; path=/; SameSite=Lax';
      }
    } catch {
      // ignore cookie write errors
    }
    store.ensureBackgroundTimersStarted();
    store.fetchData().catch(() => {});
    store.notify();
    return true;
  } catch (err: any) {
    console.error('[AUTH] Login error:', err.message);
    throw err;
  }
}

export async function register(
  store: AppStore,
  name: string,
  email: string,
  _role: UserRole,
  extra?: any
): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  if (!extra?.password || typeof extra.password !== 'string') {
    throw new Error('Password is required to register an account.');
  }
  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      skipAuthEvent: true,
      body: JSON.stringify({
        name: name.trim(),
        email: cleanEmail,
        password: extra.password,
        confirmPassword: extra.confirmPassword || extra.passwordConfirmation || extra.password,
        termsAccepted: extra.termsAccepted ?? extra.agreeTerms ?? true,
        extra: {
          bio: extra.bio,
          country: extra.country,
          location: extra.location,
          phoneNumber: extra.phoneNumber,
          education: extra.education,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Registration failed');
    }
    if (!data?.user?.id) {
      throw new Error('Backend session could not be established.');
    }

    store.currentUser = data.user;
    store.sessionExpiredMessage = null;
    store.isSessionInitialized = true;
    store.users.push(data.user);
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'ut_session_active=1; path=/; SameSite=Lax';
      }
    } catch {
      // ignore cookie write errors
    }
    store.ensureBackgroundTimersStarted();
    store.notify();
    return true;
  } catch (err: any) {
    console.error('[AUTH] Register error:', err.message);
    throw err;
  }
}

export async function logout(store: AppStore): Promise<void> {
  store.cancelAllPendingRequests();
  try {
    await apiFetch('/api/auth/logout', { method: 'POST', skipAuthEvent: true });
  } catch {
    // ignore network failure while clearing client state
  }
  store.currentUser = null;
  store.sessionExpiredMessage = null;
  store.assignments = [];
  store.chats = [];
  store.chatRooms = [];
  store.messages = [];
  store.quotes = [];
  store.payments = [];
  store.invoices = [];
  store.appNotifications = [];
  store.tabStates = {};
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('ut_current_user');
      localStorage.removeItem('auth_token');
      document.cookie = 'ut_session_active=; Max-Age=0; path=/; SameSite=Lax';
    } catch {
      // ignore storage errors
    }
  }
  store.notify();
}

export async function createTutorProfile(store: AppStore, tutorData: any): Promise<boolean> {
  const res = await apiFetch('/api/tutors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tutorData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create tutor profile');
  }

  const created = data.tutor || data.user;
  if (created) {
    const normalized: User = {
      ...created,
      role: UserRole.TUTOR,
      subjects: typeof created.subjects === 'string' ? JSON.parse(created.subjects || '[]') : (created.subjects || []),
      subjectExpertise:
        typeof created.subjectExpertise === 'string'
          ? JSON.parse(created.subjectExpertise || '[]')
          : (created.subjectExpertise || []),
    };
    const idx = store.users.findIndex(
      (u) => u.id === normalized.id || u.email.toLowerCase().trim() === normalized.email.toLowerCase().trim()
    );
    if (idx !== -1) {
      store.users[idx] = { ...store.users[idx], ...normalized };
    } else {
      store.users.unshift(normalized);
    }
    store.notify();
  }
  return true;
}

export async function verifyUser(store: AppStore, userId: string) {
  const user = store.users.find((u) => u.id === userId);
  if (user) {
    user.verified = true;
    store.notify();
    apiFetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true }),
    }).catch(() => {});
  }
}

export async function toggleUserStatus(store: AppStore, userId: string) {
  const user = store.users.find((u) => u.id === userId);
  if (user) {
    user.suspended = !user.suspended;
    store.notify();
    apiFetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: user.suspended }),
    }).catch(() => {});
  }
}

export async function updateUserRole(store: AppStore, userId: string, targetRole: UserRole) {
  const user = store.users.find((u) => u.id === userId);
  if (user) {
    user.role = targetRole;
    store.notify();
    apiFetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: targetRole }),
    }).catch(() => {});
  }
}

export async function deleteUser(store: AppStore, userId: string) {
  store.users = store.users.filter((u) => u.id !== userId);
  store.notify();
}

export async function updateUserProfile(store: AppStore, userId: string, data: Partial<User>) {
  const userIndex = store.users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    store.users[userIndex] = { ...store.users[userIndex], ...data };
    if (store.currentUser?.id === userId) {
      store.currentUser = { ...store.currentUser, ...data };
    }
    store.notify();
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('[Store] Notice saving user profile to API:', e);
    }
  }
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const res = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password reset request failed');
  }
  return true;
}

export async function resetPassword(
  store: AppStore,
  email: string,
  token: string,
  newPassword: string,
  confirmPassword?: string
): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const res = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      token,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }
  if (data.user) {
    store.currentUser = data.user;
  }
  store.notify();
  return true;
}

export async function addMessage(
  store: AppStore,
  chatId: string,
  senderId: string,
  content: string,
  fileUrl?: string,
  fileName?: string,
  isSystem?: boolean,
  orderId?: string
): Promise<Message> {
  if (!content || !content.trim()) {
    throw new Error('Message content cannot be empty.');
  }
  if (content.length > 5000) {
    throw new Error('Message length exceeds the 5,000 character limit.');
  }

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newMsg: Message = {
    id: msgId,
    chatId,
    roomId: chatId,
    senderId,
    content: content.trim(),
    fileUrl,
    fileName,
    timestamp: new Date().toISOString(),
    isSystem: isSystem || false,
    read: false,
  };

  store.messages.push(newMsg);
  store.notify();

  try {
    const res = await apiFetch(`/api/chat-rooms/${encodeURIComponent(chatId)}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msgId,
        orderId,
        content: content.trim(),
        fileUrl,
        fileName,
        isSystem: Boolean(isSystem),
        senderId,
        sendAsTutorId: senderId !== store.currentUser?.id ? senderId : undefined,
      }),
    });

    if (!res.ok) {
      const fallbackRes = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msgId,
          chatId,
          roomId: chatId,
          orderId,
          senderId,
          sendAsTutorId: senderId !== store.currentUser?.id ? senderId : undefined,
          content: content.trim(),
          fileUrl,
          fileName,
          isSystem: Boolean(isSystem),
          createdAt: newMsg.timestamp,
        }),
      });
      if (!fallbackRes.ok) {
        const errData = await fallbackRes.json().catch(() => ({}));
        const errMessage = errData.error || `Server error (${fallbackRes.status}): Failed to send message.`;
        store.messages = store.messages.filter((m) => m.id !== msgId);
        store.notify();
        throw new Error(errMessage);
      }
    }
    return newMsg;
  } catch (err: any) {
    store.messages = store.messages.filter((m) => m.id !== msgId);
    store.notify();
    throw err;
  }
}

export async function addQuote(
  store: AppStore,
  chatId: string,
  tutorId: string,
  amount: number,
  estimatedHours: number,
  serviceType?: string,
  deliveryTime?: string,
  scopeOfWork?: string,
  advancePercentage: number = 50,
  orderId?: string,
  notes?: string
): Promise<Quote> {
  const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const advAmount = Number(((amount * advancePercentage) / 100).toFixed(2));
  const balAmount = Number((amount - advAmount).toFixed(2));

  const newQuote: Quote = {
    id: quoteId,
    chatId,
    amount,
    estimatedHours,
    status: 'pending',
    serviceType: serviceType || 'Academic Mentorship',
    deliveryTime: deliveryTime || '3-5 Business Days',
    scopeOfWork: scopeOfWork || 'Comprehensive guidance, drafting reviews, and model examples.',
    advancePercentage,
    advanceAmount: advAmount,
    balanceAmount: balAmount,
    createdAt: new Date().toISOString(),
  };

  store.quotes.push(newQuote);
  store.notify();

  apiFetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: quoteId,
      chatId,
      orderId,
      tutorId,
      amount,
      estimatedHours,
      serviceType,
      deliveryTime,
      scopeOfWork,
      advancePercentage,
      advanceAmount: advAmount,
      balanceAmount: balAmount,
      notes,
      status: 'pending',
    }),
  }).catch(() => {});

  return newQuote;
}

export async function updateQuoteStatus(store: AppStore, quoteId: string, status: 'accepted' | 'declined') {
  const quote = store.quotes.find((q) => q.id === quoteId);
  if (quote) {
    quote.status = status;
    store.notify();

    apiFetch(`/api/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }
}

export async function addAssignment(
  store: AppStore,
  studentId: string,
  title: string,
  subject: string,
  deadline: string,
  instructions: string,
  wordCount: number = 250,
  referenceStyle: string = 'APA 7th',
  sourcesCount: number = 2,
  fileUrls: string[] = [],
  fileNames: string[] = [],
  tutorId?: string
): Promise<Assignment> {
  const assignId = `assign_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newAssignment: Assignment = {
    id: assignId,
    studentId,
    tutorId: tutorId || '',
    title,
    subject,
    deadline,
    wordCount,
    referenceStyle,
    sourcesCount,
    instructions,
    fileUrls,
    fileNames,
    status: tutorId ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.PENDING,
    progressPercent: 0,
    createdAt: new Date().toISOString(),
  };

  store.assignments.unshift(newAssignment);
  store.notify();

  apiFetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: assignId,
      studentId,
      tutorId: tutorId || null,
      title,
      subject,
      deadline,
      wordCount,
      referenceStyle,
      sourcesCount,
      instructions,
      fileUrls,
      fileNames,
      status: newAssignment.status,
    }),
  }).catch(() => {});

  return newAssignment;
}

export async function createAssignmentWithDirectInvoice(
  store: AppStore,
  studentId: string,
  title: string,
  subject: string,
  deadline: string,
  instructions: string,
  quoteAmount: number,
  wordCount: number = 250,
  referenceStyle: string = 'APA 7th',
  sourcesCount: number = 2,
  fileUrls: string[] = [],
  fileNames: string[] = [],
  tutorId?: string
): Promise<Assignment> {
  const assign = await addAssignment(
    store,
    studentId,
    title,
    subject,
    deadline,
    instructions,
    wordCount,
    referenceStyle,
    sourcesCount,
    fileUrls,
    fileNames,
    tutorId
  );
  assign.quoteAmount = quoteAmount;
  assign.status = AssignmentStatus.AWAITING_PAYMENT;
  store.notify();

  apiFetch(`/api/orders/${assign.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteAmount, status: assign.status }),
  }).catch(() => {});

  return assign;
}

export async function updateAssignmentStatus(store: AppStore, assignmentId: string, status: AssignmentStatus) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.status = status;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }
}

export async function assignTutorToAssignment(store: AppStore, assignmentId: string, tutorId: string) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.tutorId = tutorId;
    assign.status = AssignmentStatus.IN_PROGRESS;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId, status: assign.status }),
    }).catch(() => {});
  }
}

export async function updateAssignmentProgress(store: AppStore, assignmentId: string, progressPercent: number) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.progressPercent = progressPercent;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPercent }),
    }).catch(() => {});
  }
}

export async function setAssignmentCustomPrice(store: AppStore, assignmentId: string, price: number) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.quoteAmount = price;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteAmount: price }),
    }).catch(() => {});
  }
}

export async function completeAssignmentByTutor(
  store: AppStore,
  assignmentId: string,
  fileUrl: string,
  fileName: string
) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.status = AssignmentStatus.COMPLETED;
    assign.progressPercent = 100;
    assign.tutorWorkFileUrl = fileUrl;
    assign.tutorWorkFileName = fileName;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: AssignmentStatus.COMPLETED,
        progressPercent: 100,
        tutorWorkFileUrl: fileUrl,
        tutorWorkFileName: fileName,
      }),
    }).catch(() => {});
  }
}

export async function approveAssignmentAndReleasePayment(
  store: AppStore,
  assignmentId: string,
  rating?: number,
  reviewComment?: string
) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.reviewed = true;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewed: true, escrowStatus: 'released' }),
    }).catch(() => {});

    if (rating && assign.tutorId) {
      store.reviews.push({
        id: `rev_${Date.now()}`,
        tutorId: assign.tutorId,
        studentName: store.currentUser?.name || 'Student',
        studentAvatar: store.currentUser?.avatarUrl || '',
        rating,
        comment: reviewComment || 'Excellent academic guidance and support!',
        createdAt: new Date().toISOString(),
      });
      store.notify();
    }
  }
}

export async function requestAssignmentRevision(store: AppStore, assignmentId: string, revisionNotes: string) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.status = AssignmentStatus.REVISION;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: AssignmentStatus.REVISION,
        instructions: assign.instructions + '\n\n[REVISION NOTES]: ' + revisionNotes,
      }),
    }).catch(() => {});
  }
}

export async function updateAssignment(store: AppStore, assignmentId: string, updates: Partial<Assignment>) {
  const idx = store.assignments.findIndex((a) => a.id === assignmentId);
  if (idx !== -1) {
    store.assignments[idx] = { ...store.assignments[idx], ...updates };
    store.notify();
  }
  try {
    const res = await apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAssignment(store: AppStore, assignmentId: string) {
  store.assignments = store.assignments.filter((a) => a.id !== assignmentId);
  store.notify();
  try {
    const res = await apiFetch(`/api/orders/${assignmentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createAssignmentOrder(
  store: AppStore,
  data: {
    studentId: string;
    title: string;
    subject: string;
    deadline: string;
    academicLevel?: string;
    pages?: number;
    wordCount?: number;
    referenceStyle?: string;
    sourcesCount?: number;
    instructions?: string;
    budget?: number;
    quoteAmount?: number;
    tutorId?: string;
    status?: AssignmentStatus;
    escrowStatus?: string;
    fileUrls?: string[];
    fileNames?: string[];
  }
) {
  const assignId = 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const newAssignment: Assignment = {
    id: assignId,
    studentId: data.studentId,
    tutorId: data.tutorId || '',
    title: data.title,
    subject: data.subject,
    academicLevel: data.academicLevel || 'Undergraduate',
    deadline: data.deadline,
    pages: data.pages || 1,
    wordCount: data.wordCount || 250,
    referenceStyle: data.referenceStyle || 'APA 7th',
    sourcesCount: data.sourcesCount || 0,
    instructions: data.instructions || '',
    budget: data.budget,
    quoteAmount: data.quoteAmount,
    fileUrls: data.fileUrls || [],
    fileNames: data.fileNames || [],
    status: data.status || (data.tutorId ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.PENDING),
    escrowStatus: data.escrowStatus || (data.quoteAmount ? 'secured' : 'pending'),
    progressPercent: 0,
    createdAt: new Date().toISOString(),
  };

  store.assignments.unshift(newAssignment);
  store.notify();

  try {
    const res = await apiFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newAssignment,
        pages: newAssignment.pages,
        wordCount: newAssignment.wordCount,
        sourcesCount: newAssignment.sourcesCount,
        quoteAmount: newAssignment.quoteAmount,
        budget: newAssignment.budget,
        fileUrls: newAssignment.fileUrls,
        fileNames: newAssignment.fileNames,
      }),
    });
    return { success: res.ok, order: newAssignment };
  } catch (err: any) {
    return { success: false, error: err.message, order: newAssignment };
  }
}

export async function releaseEscrow(store: AppStore, assignmentId: string) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.escrowStatus = 'released';
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrowStatus: 'released' }),
    }).catch(() => {});
  }
}

export async function updateInvoiceStatus(
  store: AppStore,
  invoiceId: string,
  status: 'due' | 'paid' | 'pending' | 'uninvoiced'
) {
  const inv = store.invoices.find((i) => i.id === invoiceId);
  if (inv) {
    inv.status = status;
    store.notify();
  }
}

export async function addInvoice(store: AppStore, invoice: Omit<Invoice, 'id' | 'createdAt'>) {
  const id = `inv_${Date.now()}`;
  const newInvoice: Invoice = {
    ...invoice,
    id,
    createdAt: new Date().toISOString(),
  };
  store.invoices.push(newInvoice);
  store.notify();

  apiFetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInvoice),
  }).catch(() => {});

  return newInvoice;
}

export async function recordPayment(
  store: AppStore,
  paymentData: {
    assignmentId: string;
    studentId?: string;
    amount: number;
    status?: 'escrow' | 'released' | 'refunded';
    type?: 'advance' | 'balance' | 'full';
    notes?: string;
  }
): Promise<Payment | null> {
  try {
    const res = await apiFetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.payment) {
        store.payments.unshift(data.payment);
        const assign = store.assignments.find((a) => a.id === paymentData.assignmentId);
        if (assign) {
          assign.status = AssignmentStatus.IN_PROGRESS;
        }
        store.notify();
        return data.payment;
      }
    }
  } catch (e) {
    console.warn('Error recording payment:', e);
  }
  return null;
}

export async function addNotification(
  store: AppStore,
  notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
) {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newNotif: AppNotification = {
    ...notif,
    id,
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.appNotifications.unshift(newNotif);
  store.notify();

  apiFetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNotif),
  }).catch(() => {});

  return newNotif;
}

export async function markNotificationRead(store: AppStore, notifId: string) {
  const notif = store.appNotifications.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    store.notify();

    apiFetch(`/api/notifications/${notifId}/read`, {
      method: 'PUT',
    }).catch(() => {});
  }
}

export async function markAllNotificationsRead(store: AppStore, userId: string) {
  store.appNotifications = store.appNotifications.map((n) =>
    n.userId === userId || n.userId === 'all' ? { ...n, read: true } : n
  );
  store.notify();

  apiFetch('/api/notifications/mark-all-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).catch(() => {});
}

export async function addActivityLog(store: AppStore, log: Omit<ActivityLog, 'id' | 'timestamp'>) {
  const id = `log_${Date.now()}`;
  const newLog: ActivityLog = {
    ...log,
    id,
    timestamp: new Date().toISOString(),
  };
  store.activityLogs.unshift(newLog);
  store.notify();

  apiFetch('/api/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: log.action,
      details: log.details,
      userId: log.userId,
      userName: log.userName,
      userRole: log.userRole,
    }),
  }).catch(() => {});
}

export async function addAssignmentReport(store: AppStore, report: Omit<AssignmentReport, 'id' | 'createdAt'>) {
  const id = `rep_${Date.now()}`;
  const newReport: AssignmentReport = {
    ...report,
    id,
    createdAt: new Date().toISOString(),
  };
  store.assignmentReports.unshift(newReport);
  store.notify();
  return newReport;
}

export async function updateAssignmentReportStatus(
  store: AppStore,
  reportId: string,
  status: AssignmentReport['status'],
  feedback?: string
) {
  const rep = store.assignmentReports.find((r) => r.id === reportId);
  if (rep) {
    rep.status = status;
    if (feedback) rep.feedbackFromAdmin = feedback;
    store.notify();
  }
}

export async function addAgreement(store: AppStore, agreement: Omit<Agreement, 'id' | 'sentAt' | 'status'>) {
  const id = `agr_${Date.now()}`;
  const newAgr: Agreement = {
    ...agreement,
    id,
    status: 'pending_signature',
    sentAt: new Date().toISOString(),
  };
  store.agreements.unshift(newAgr);
  store.notify();
  return newAgr;
}

export async function signAgreement(store: AppStore, agreementId: string) {
  const agr = store.agreements.find((a) => a.id === agreementId);
  if (agr) {
    agr.status = 'signed';
    agr.signedAt = new Date().toISOString();
    store.notify();
  }
}

export async function addBlog(
  store: AppStore,
  titleOrBlog: any,
  content?: string,
  image?: string,
  category?: string,
  tags?: string[],
  adminId?: string
) {
  const id = `blog_${Date.now()}`;
  let blogPayload: any;
  if (typeof titleOrBlog === 'object') {
    blogPayload = {
      ...titleOrBlog,
      id: titleOrBlog.id || id,
      imageUrl: titleOrBlog.imageUrl || titleOrBlog.image,
      image: titleOrBlog.image || titleOrBlog.imageUrl,
      publishedAt: titleOrBlog.publishedAt || new Date().toISOString(),
    };
  } else {
    blogPayload = {
      id,
      adminId: adminId || store.currentUser?.id || 'admin_shaka',
      title: titleOrBlog,
      content: content || '',
      imageUrl: image || '',
      image: image || '',
      category: category || 'University Survival',
      tags: tags || [],
      publishedAt: new Date().toISOString(),
    };
  }
  store.blogs.unshift(blogPayload);
  store.notify();

  try {
    const res = await apiFetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogPayload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.blog) {
        const index = store.blogs.findIndex((b) => b.id === blogPayload.id);
        if (index !== -1) {
          store.blogs[index] = {
            ...data.blog,
            image: data.blog.imageUrl || data.blog.image,
            imageUrl: data.blog.imageUrl || data.blog.image,
            tags: typeof data.blog.tags === 'string' ? JSON.parse(data.blog.tags) : data.blog.tags,
          };
          store.notify();
        }
      }
    }
  } catch (e) {
    console.warn('[STORE] Network notice saving blog to server:', e);
  }

  return blogPayload;
}

export async function deleteBlog(store: AppStore, blogId: string) {
  store.blogs = store.blogs.filter((b) => b.id !== blogId);
  store.notify();

  try {
    await apiFetch(`/api/blogs/${encodeURIComponent(blogId)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('[STORE] Network notice deleting blog from server:', e);
  }
}

export async function updateBlog(
  store: AppStore,
  blogId: string,
  titleOrData: any,
  content?: string,
  image?: string,
  category?: string,
  tags?: string[]
) {
  const blog = store.blogs.find((b) => b.id === blogId);
  let updates: any = {};
  if (typeof titleOrData === 'object') {
    updates = { ...titleOrData };
  } else {
    if (titleOrData) updates.title = titleOrData;
    if (content) updates.content = content;
    if (image) {
      updates.image = image;
      updates.imageUrl = image;
    }
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
  }

  if (blog) {
    Object.assign(blog, updates);
    if (updates.imageUrl && !blog.image) blog.image = updates.imageUrl;
    if (updates.image && !blog.imageUrl) blog.imageUrl = updates.image;
    store.notify();
  }

  try {
    await apiFetch(`/api/blogs/${encodeURIComponent(blogId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  } catch (e) {
    console.warn('[STORE] Network notice updating blog on server:', e);
  }
}

export async function syncDefaultBlogs(store: AppStore): Promise<boolean> {
  try {
    const res = await apiFetch('/api/blogs/sync-defaults', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.blogs)) {
        store.blogs = data.blogs.map((b: any) => ({
          ...b,
          image: b.imageUrl || b.image,
          imageUrl: b.imageUrl || b.image,
          tags: typeof b.tags === 'string' ? JSON.parse(b.tags || '[]') : (b.tags || []),
        }));
        store.notify();
        return true;
      }
    }
  } catch (e) {
    console.warn('[STORE] Error calling /api/blogs/sync-defaults:', e);
  }

  const { DEFAULT_20_BLOGS } = await import('../data/defaultBlogsData');
  store.blogs = DEFAULT_20_BLOGS.map((b) => ({
    id: b.id,
    adminId: b.adminId || 'admin_shaka',
    title: b.title,
    slug: b.id,
    excerpt: b.title,
    content: b.content,
    author: 'Editorial Team',
    image: b.image,
    imageUrl: b.image,
    category: b.category,
    tags: b.tags,
    readTime: '5 min read',
    featured: false,
    publishedAt: b.publishedAt,
  }));
  store.notify();
  return true;
}

export async function addFAQ(store: AppStore, faq: Omit<FAQ, 'id'>) {
  const id = `faq_${Date.now()}`;
  const newFaq: FAQ = { ...faq, id };
  store.faqs.push(newFaq);
  store.notify();
  return newFaq;
}

export async function deleteFAQ(store: AppStore, faqId: string) {
  store.faqs = store.faqs.filter((f) => f.id !== faqId);
  store.notify();
}

export async function addSupportTicket(store: AppStore, studentId: string, subject: string, message: string) {
  const id = `ticket_${Date.now()}`;
  const newTicket: SupportTicket = {
    id,
    studentId,
    subject,
    message,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  store.supportTickets.unshift(newTicket);
  store.notify();
  return newTicket;
}

export async function resolveSupportTicket(store: AppStore, ticketId: string) {
  const ticket = store.supportTickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = 'resolved';
    store.notify();
  }
}

export async function arbitrateRefund(store: AppStore, assignmentId: string, _notes?: string) {
  const assign = store.assignments.find((a) => a.id === assignmentId);
  if (assign) {
    assign.status = AssignmentStatus.PENDING;
    store.notify();
    apiFetch(`/api/orders/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrowStatus: 'refunded', status: AssignmentStatus.PENDING }),
    }).catch(() => {});
  }
}

export async function sendTriggeredEmail(store: AppStore, to: string, subject: string, htmlContent: string) {
  const id = `email_${Date.now()}`;
  const newEmail: TriggeredEmail = {
    id,
    to,
    message: {
      subject,
      html: htmlContent,
    },
    status: {
      state: 'SUCCESS',
      sentAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };
  store.emails.unshift(newEmail);
  store.notify();
  return newEmail;
}
