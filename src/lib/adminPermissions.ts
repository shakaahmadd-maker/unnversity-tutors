export type AdminPermissionKey =
  | 'blog'
  | 'chats'
  | 'orders'
  | 'tutors'
  | 'payments'
  | 'settings';

export interface AdminModuleDefinition {
  key: AdminPermissionKey;
  label: string;
  shortLabel: string;
  description: string;
  defaultTab: string;
  tabs: string[];
  routeSegment: string;
}

export const ADMIN_MODULE_DEFINITIONS: AdminModuleDefinition[] = [
  {
    key: 'blog',
    label: 'Blog Manager',
    shortLabel: 'Blog Studio',
    description: 'Create, edit, publish, and delete educational blog posts & SEO metadata',
    defaultTab: 'blogs',
    tabs: ['blogs'],
    routeSegment: 'blogs',
  },
  {
    key: 'chats',
    label: 'Chats & Support Desk',
    shortLabel: 'Support Chats',
    description: 'Access operational support chat rooms, handle student/tutor queries, dual-chat mode',
    defaultTab: 'chats',
    tabs: ['chats'],
    routeSegment: 'chats',
  },
  {
    key: 'orders',
    label: 'Student Orders & Assignments',
    shortLabel: 'Orders & Reports',
    description: 'View and manage submitted assignments, service requests, and deliverable reports',
    defaultTab: 'assignments',
    tabs: ['assignments', 'reports'],
    routeSegment: 'orders',
  },
  {
    key: 'tutors',
    label: 'Tutors Management',
    shortLabel: 'Tutors & Users',
    description: 'Approve, upload, edit tutor profiles, and view student/user directories',
    defaultTab: 'tutors_list',
    tabs: ['tutors_list', 'student_profiles', 'user_data', 'users', 'agreements'],
    routeSegment: 'tutors',
  },
  {
    key: 'payments',
    label: 'Payments & Billing',
    shortLabel: 'Payments & Escrow',
    description: 'View escrow transactions, create invoices, and resolve payment disputes',
    defaultTab: 'payments_ledger',
    tabs: ['payments_ledger', 'create_invoice', 'disputes'],
    routeSegment: 'payments',
  },
  {
    key: 'settings',
    label: 'Site Settings & Content',
    shortLabel: 'Platform Settings',
    description: 'Manage broadcast notifications, trigger emails, SOPs, FAQs, feedback, subjects & audit logs',
    defaultTab: 'notifications',
    tabs: ['notifications', 'feedback', 'trigger_emails', 'sops', 'activity_log', 'faqs', 'subjects'],
    routeSegment: 'settings',
  },
];

export const ALL_ADMIN_PERMISSIONS: AdminPermissionKey[] = ADMIN_MODULE_DEFINITIONS.map((m) => m.key);

export interface SubAdminRolePreset {
  id: 'blog_editor' | 'chat_support' | 'orders_tutors' | 'custom';
  label: string;
  roleLabel: string;
  description: string;
  permissions: AdminPermissionKey[];
}

export const SUBADMIN_ROLE_PRESETS: SubAdminRolePreset[] = [
  {
    id: 'blog_editor',
    label: 'Blog Editor Only',
    roleLabel: 'Editorial & SEO Manager',
    description: 'Full Blog Studio CRUD access without operational or billing views',
    permissions: ['blog'],
  },
  {
    id: 'chat_support',
    label: 'Chat Support Agent Only',
    roleLabel: 'Support Desk Agent',
    description: 'Operational support chat rooms & CSR/tutor dual-chat handling',
    permissions: ['chats'],
  },
  {
    id: 'orders_tutors',
    label: 'Orders & Tutors Coordinator',
    roleLabel: 'Operations Coordinator',
    description: 'Manage student assignment requests, reports, and tutor onboarding',
    permissions: ['orders', 'tutors'],
  },
  {
    id: 'custom',
    label: 'Custom Selection',
    roleLabel: 'Staff Administrator',
    description: 'Pick individual module permissions from the matrix below',
    permissions: [],
  },
];

const VALID_PERMISSION_SET = new Set<AdminPermissionKey>(ALL_ADMIN_PERMISSIONS);

export const SUPER_ADMIN_ONLY_TAB = 'subadmins';

export const TAB_TO_PERMISSION_MAP: Record<string, AdminPermissionKey | 'SUPER_ADMIN'> = {
  subadmins: 'SUPER_ADMIN',
  blogs: 'blog',
  chats: 'chats',
  assignments: 'orders',
  reports: 'orders',
  tutors_list: 'tutors',
  student_profiles: 'tutors',
  user_data: 'tutors',
  users: 'tutors',
  agreements: 'tutors',
  payments_ledger: 'payments',
  create_invoice: 'payments',
  disputes: 'payments',
  notifications: 'settings',
  feedback: 'settings',
  trigger_emails: 'settings',
  sops: 'settings',
  activity_log: 'settings',
  faqs: 'settings',
  subjects: 'settings',
};

export const ADMIN_ROUTE_SEGMENT_TO_TAB: Record<string, string> = {
  subadmins: 'subadmins',
  'sub-admins': 'subadmins',
  permissions: 'subadmins',
  blog: 'blogs',
  blogs: 'blogs',
  chat: 'chats',
  chats: 'chats',
  orders: 'assignments',
  assignments: 'assignments',
  reports: 'reports',
  tutors: 'tutors_list',
  tutors_list: 'tutors_list',
  students: 'student_profiles',
  student_profiles: 'student_profiles',
  'user-data': 'user_data',
  user_data: 'user_data',
  users: 'users',
  agreements: 'agreements',
  payments: 'payments_ledger',
  payments_ledger: 'payments_ledger',
  invoices: 'create_invoice',
  create_invoice: 'create_invoice',
  disputes: 'disputes',
  settings: 'notifications',
  notifications: 'notifications',
  feedback: 'feedback',
  'trigger-emails': 'trigger_emails',
  trigger_emails: 'trigger_emails',
  sops: 'sops',
  'activity-log': 'activity_log',
  activity_log: 'activity_log',
  faqs: 'faqs',
  subjects: 'subjects',
};

export const ADMIN_TAB_TO_ROUTE_PATH: Record<string, string> = {
  subadmins: '/admin/subadmins',
  blogs: '/admin/blogs',
  chats: '/admin/chats',
  assignments: '/admin/orders',
  reports: '/admin/reports',
  tutors_list: '/admin/tutors',
  student_profiles: '/admin/students',
  user_data: '/admin/user-data',
  users: '/admin/users',
  agreements: '/admin/agreements',
  payments_ledger: '/admin/payments',
  create_invoice: '/admin/invoices',
  disputes: '/admin/disputes',
  notifications: '/admin/settings',
  feedback: '/admin/feedback',
  trigger_emails: '/admin/trigger-emails',
  sops: '/admin/sops',
  activity_log: '/admin/activity-log',
  faqs: '/admin/faqs',
  subjects: '/admin/subjects',
};

export function isSuperAdminUser(user: { role?: string | null; email?: string | null; isActive?: boolean; suspended?: boolean } | null | undefined): boolean {
  if (!user) return false;
  if (user.isActive === false || user.suspended === true) return false;
  const role = String(user.role || '').trim();
  const normalizedRole = role.toLowerCase();
  const normalizedEmail = String(user.email || '').toLowerCase().trim();
  if (normalizedRole === 'admin' || role === 'SUPER_ADMIN') {
    return true;
  }
  return normalizedEmail === 'shaka.ahmadd@gmail.com' || normalizedEmail === 'shaka.ahmad@gmail.com';
}

export function isStaffUser(user: { role?: string | null; email?: string | null; isActive?: boolean; suspended?: boolean } | null | undefined): boolean {
  if (!user) return false;
  if (user.isActive === false || user.suspended === true) return false;
  if (isSuperAdminUser(user)) return true;
  const role = String(user.role || '').trim();
  return role.toLowerCase() === 'subadmin' || role === 'SUB_ADMIN';
}

export function parsePermissions(raw: unknown): AdminPermissionKey[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = trimmed.split(',');
      }
    } else {
      list = trimmed.split(',');
    }
  }

  const out: AdminPermissionKey[] = [];
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim().toLowerCase() as AdminPermissionKey;
    if (VALID_PERMISSION_SET.has(normalized) && !out.includes(normalized)) {
      out.push(normalized);
    }
  }
  return out;
}

export function hasModulePermission(
  user: { role?: string | null; email?: string | null; permissions?: unknown; isActive?: boolean; suspended?: boolean } | null | undefined,
  requiredModule: AdminPermissionKey
): boolean {
  if (!user) return false;
  if (user.isActive === false || user.suspended === true) return false;
  if (isSuperAdminUser(user)) return true;
  if (!isStaffUser(user)) return false;
  return parsePermissions(user.permissions).includes(requiredModule);
}

export function canAccessAdminTab(
  user: { role?: string | null; email?: string | null; permissions?: unknown; isActive?: boolean; suspended?: boolean } | null | undefined,
  tabId: string
): boolean {
  if (!user || user.isActive === false || user.suspended === true) return false;
  if (isSuperAdminUser(user)) return true;
  if (!isStaffUser(user)) return false;
  const required = TAB_TO_PERMISSION_MAP[tabId];
  if (!required || required === 'SUPER_ADMIN') return false;
  return parsePermissions(user.permissions).includes(required);
}

export function getFirstPermittedAdminTab(
  user: { role?: string | null; email?: string | null; permissions?: unknown; isActive?: boolean; suspended?: boolean } | null | undefined
): string | null {
  if (!user || user.isActive === false || user.suspended === true) return null;
  if (isSuperAdminUser(user)) return 'tutors_list';
  if (!isStaffUser(user)) return null;
  const perms = parsePermissions(user.permissions);
  for (const mod of ADMIN_MODULE_DEFINITIONS) {
    if (perms.includes(mod.key)) {
      return mod.defaultTab;
    }
  }
  return null;
}

export function resolveAdminTabFromPath(pathnameOrView: string): string | null {
  const clean = decodeURIComponent(pathnameOrView || '')
    .toLowerCase()
    .trim()
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+$/, '');
  if (!clean.startsWith('/admin/') && !clean.startsWith('admin/')) {
    return null;
  }
  const suffix = clean.replace(/^\/?admin\//, '').split('/')[0];
  return ADMIN_ROUTE_SEGMENT_TO_TAB[suffix] || '__unknown__';
}
