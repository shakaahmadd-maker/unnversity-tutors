import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit3,
  Trash2,
  Power,
  Check,
  X,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
} from 'lucide-react';
import { User } from '../types';
import { apiFetch } from '../lib/apiClient';
import {
  ADMIN_MODULE_DEFINITIONS,
  AdminPermissionKey,
  SUBADMIN_ROLE_PRESETS,
  SubAdminRolePreset,
  isSuperAdminUser,
  parsePermissions,
} from '../lib/adminPermissions';

interface AdminSubAdminsPanelProps {
  currentUser: User;
  onRefreshStore?: () => Promise<void> | void;
}

interface StaffAccount extends User {
  roleLabel?: string;
  isActive?: boolean;
  permissions?: AdminPermissionKey[];
}

export const AdminSubAdminsPanel: React.FC<AdminSubAdminsPanelProps> = ({
  currentUser,
  onRefreshStore,
}) => {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formRoleLabel, setFormRoleLabel] = useState<string>('Sub-Administrator');
  const [formPermissions, setFormPermissions] = useState<AdminPermissionKey[]>(['blog']);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<SubAdminRolePreset['id']>('blog_editor');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Action busy / delete confirm modal state
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/subadmins');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Failed to load sub-admins (HTTP ${res.status})`);
      }
      const list = Array.isArray(data.subadmins) ? data.subadmins : [];
      setStaffList(
        list.map((u: any) => ({
          ...u,
          permissions: parsePermissions(u.permissions),
          isActive: u.isActive !== false && u.suspended !== true,
          roleLabel: u.roleLabel || (isSuperAdminUser({ ...u, isActive: true, suspended: false }) ? 'Super Administrator' : 'Sub-Administrator'),
        }))
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to load staff permissions directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  const detectPresetFromPerms = (perms: AdminPermissionKey[]): SubAdminRolePreset['id'] => {
    const sorted = [...perms].sort().join(',');
    for (const preset of SUBADMIN_ROLE_PRESETS) {
      if (preset.id === 'custom') continue;
      if ([...preset.permissions].sort().join(',') === sorted) {
        return preset.id;
      }
    }
    return 'custom';
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setFormRoleLabel('Editorial & SEO Manager');
    setFormPermissions(['blog']);
    setFormIsActive(true);
    setSelectedPresetId('blog_editor');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (staff: StaffAccount) => {
    const perms = parsePermissions(staff.permissions);
    setEditingStaff(staff);
    setFormName(staff.name || '');
    setFormEmail(staff.email || '');
    setFormPassword('');
    setShowPassword(false);
    setFormRoleLabel(staff.roleLabel || 'Sub-Administrator');
    setFormPermissions(perms);
    setFormIsActive(staff.isActive !== false && !staff.suspended);
    setSelectedPresetId(detectPresetFromPerms(perms));
    setFormError(null);
    setModalOpen(true);
  };

  const handleApplyPreset = (preset: SubAdminRolePreset) => {
    setSelectedPresetId(preset.id);
    if (preset.id !== 'custom') {
      setFormPermissions([...preset.permissions]);
      setFormRoleLabel(preset.roleLabel);
    }
  };

  const togglePermissionModule = (modKey: AdminPermissionKey) => {
    setFormPermissions((prev) => {
      const next = prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey];
      setSelectedPresetId(detectPresetFromPerms(next));
      return next;
    });
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Staff member full name is required.');
      return;
    }
    if (!editingStaff && !formEmail.trim()) {
      setFormError('Staff email address is required.');
      return;
    }
    if (!editingStaff && formPassword.trim().length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (editingStaff && formPassword.trim().length > 0 && formPassword.trim().length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }
    if (formPermissions.length === 0) {
      setFormError('Select at least one admin module permission for this sub-admin.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStaff) {
        const res = await apiFetch(`/api/admin/subadmins/${encodeURIComponent(editingStaff.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            roleLabel: formRoleLabel.trim() || 'Sub-Administrator',
            permissions: formPermissions,
            isActive: formIsActive,
            ...(formPassword.trim() ? { password: formPassword.trim() } : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to update sub-admin.');
        }
        showToast(`Updated permissions for ${formName.trim()}.`);
      } else {
        const res = await apiFetch('/api/admin/subadmins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            password: formPassword.trim(),
            roleLabel: formRoleLabel.trim() || 'Sub-Administrator',
            permissions: formPermissions,
            isActive: formIsActive,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to create sub-admin account.');
        }
        showToast(`Created sub-admin account for ${formEmail.trim().toLowerCase()}.`);
      }

      setModalOpen(false);
      await fetchStaff();
      if (onRefreshStore) await onRefreshStore();
    } catch (err: any) {
      setFormError(err?.message || 'Unable to save sub-admin configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staff: StaffAccount) => {
    const nextActive = !(staff.isActive !== false && !staff.suspended);
    setTogglingId(staff.id);
    try {
      const res = await apiFetch(`/api/admin/subadmins/${encodeURIComponent(staff.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update status.');
      }
      showToast(
        nextActive
          ? `Restored dashboard access for ${staff.name}.`
          : `Suspended ${staff.name} immediately (active sessions revoked).`
      );
      await fetchStaff();
      if (onRefreshStore) await onRefreshStore();
    } catch (err: any) {
      showToast(err?.message || 'Could not toggle account state.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await apiFetch(`/api/admin/subadmins/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete sub-admin.');
      }
      showToast(`Removed sub-admin access for ${deleteTarget.email}.`);
      setDeleteTarget(null);
      await fetchStaff();
      if (onRefreshStore) await onRefreshStore();
    } catch (err: any) {
      showToast(err?.message || 'Unable to delete sub-admin.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.name || '').toLowerCase().includes(q) ||
      String(s.email || '').toLowerCase().includes(q) ||
      String(s.roleLabel || '').toLowerCase().includes(q)
    );
  });

  const subAdminCount = staffList.filter(
    (s) => !isSuperAdminUser({ ...s, isActive: true, suspended: false })
  ).length;
  const activeSubAdminCount = staffList.filter(
    (s) => !isSuperAdminUser({ ...s, isActive: true, suspended: false }) && s.isActive !== false && !s.suspended
  ).length;
  const suspendedSubAdminCount = subAdminCount - activeSubAdminCount;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sub-Admins & Permissions</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create staff accounts, assign module-level permissions, and suspend access immediately without losing audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void fetchStaff()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Sub-Admin</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusBanner && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
            statusBanner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button type="button" onClick={() => setStatusBanner(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Total Sub-Admins</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{subAdminCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Active Staff Seats</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{activeSubAdminCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Suspended Accounts</p>
          <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{suspendedSubAdminCount}</p>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">
            Staff & Administrator Accounts ({filteredStaff.length})
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void fetchStaff()}
              className="px-3 py-1.5 text-xs font-semibold border border-red-200 rounded-lg hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">No matching staff accounts found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Create your first Sub-Admin to delegate Blog Studio, Support Chats, Orders, or Tutors access.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Sub-Admin</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role & Title</th>
                  <th className="py-3 px-4">Permitted Modules</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStaff.map((staff) => {
                  const isSuper = isSuperAdminUser({ ...staff, isActive: true, suspended: false });
                  const active = staff.isActive !== false && !staff.suspended;
                  const perms = parsePermissions(staff.permissions);
                  const permLabels = isSuper
                    ? ['All Admin Modules']
                    : ADMIN_MODULE_DEFINITIONS.filter((m) => perms.includes(m.key)).map((m) => m.shortLabel);

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{staff.name}</div>
                        <div className="text-xs text-slate-500">{staff.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {isSuper ? 'Super Administrator' : staff.roleLabel || 'Sub-Administrator'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {isSuper ? 'Owner Tier' : 'Scoped Staff'} · Joined{' '}
                          <span className="tabular-nums">
                            {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {permLabels.length > 0 ? (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {permLabels.join(' · ')}
                          </p>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">No modules assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            active ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Suspended</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isSuper || staff.id === currentUser.id ? (
                          <span className="text-xs text-slate-400 font-medium">Protected Owner</span>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(staff)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={togglingId === staff.id}
                              onClick={() => void handleToggleActive(staff)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition ${
                                active
                                  ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{active ? 'Suspend' : 'Activate'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(staff)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Sub-Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStaff ? `Edit Permissions — ${editingStaff.name}` : 'Create New Sub-Admin'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure credentials, role title, and granular module access across the admin workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="mt-5 space-y-5">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Account Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email *</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingStaff)}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sarah@university-tutors.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editingStaff ? 'Reset Password (optional, min 8 chars)' : 'Password * (min 8 chars)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingStaff}
                      minLength={editingStaff && !formPassword ? undefined : 8}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingStaff ? 'Leave blank to keep existing' : 'At least 8 characters'}
                      className="w-full pl-3 pr-9 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Label</label>
                  <input
                    type="text"
                    value={formRoleLabel}
                    onChange={(e) => setFormRoleLabel(e.target.value)}
                    placeholder="e.g., Content Manager, Support Agent"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Quick-Action Role Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Quick-Action Role Presets</label>
                  <span className="text-xs text-slate-400">Auto-fills module matrix below</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUBADMIN_ROLE_PRESETS.map((preset) => {
                    const activePreset = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`text-left p-3 rounded-lg border transition ${
                          activePreset
                            ? 'border-orange-500 bg-orange-50/70 text-slate-900'
                            : 'border-slate-200 bg-white hover:border-orange-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{preset.label}</span>
                          {activePreset && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permission Assignment Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Permission Assignment Matrix ({formPermissions.length} of {ADMIN_MODULE_DEFINITIONS.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const all = ADMIN_MODULE_DEFINITIONS.map((m) => m.key);
                        setFormPermissions(all);
                        setSelectedPresetId('custom');
                      }}
                      className="text-orange-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormPermissions([]);
                        setSelectedPresetId('custom');
                      }}
                      className="text-slate-500 hover:underline font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                  {ADMIN_MODULE_DEFINITIONS.map((mod) => {
                    const enabled = formPermissions.includes(mod.key);
                    return (
                      <div
                        key={mod.key}
                        onClick={() => togglePermissionModule(mod.key)}
                        className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          enabled ? 'bg-orange-50/40' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{mod.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{mod.description}</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            togglePermissionModule(mod.key);
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                            enabled ? 'bg-orange-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                              enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Active Toggle */}
              <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-slate-900">Account Active Status</div>
                  <div className="text-[11px] text-slate-500">
                    When disabled, this sub-admin is immediately blocked from logging in or calling admin APIs.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formIsActive}
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    formIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition"
                >
                  {submitting
                    ? 'Saving...'
                    : editingStaff
                    ? 'Save Permission Changes'
                    : 'Create Sub-Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Remove Sub-Admin Access?</h3>
            <p className="text-sm text-slate-600">
              This will immediately revoke dashboard access for <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) while preserving historical audit logs.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg"
              >
                {deletingId === deleteTarget.id ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubAdminsPanel;
