import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  GraduationCap, 
  Briefcase, 
  Star, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  FileSpreadsheet, 
  FileCode, 
  Mail, 
  MapPin, 
  DollarSign, 
  UserCheck, 
  SlidersHorizontal,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';
import { store } from '../lib/store';

interface UserDataPageProps {
  users?: User[];
  currentUser?: User | null;
  onNavigate: (view: string) => void;
  onSelectTutorProfile?: (tutor: User) => void;
}

export default function UserDataPage({
  users: propUsers,
  currentUser,
  onNavigate,
  onSelectTutorProfile
}: UserDataPageProps) {
  const [usersList, setUsersList] = useState<User[]>(propUsers || store.users || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'tutor' | 'admin' | 'subadmin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'rate-desc' | 'rating-desc'>('newest');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'academic' | 'json'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync propUsers or store updates
  useEffect(() => {
    if (propUsers && propUsers.length > 0) {
      setUsersList(propUsers);
    } else if (store.users && store.users.length > 0) {
      setUsersList(store.users);
    }
  }, [propUsers]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Copy helper with feedback
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Manual refresh from backend API
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsersList(data.users);
          showToast(`Successfully refreshed ${data.users.length} user records!`);
        }
      } else {
        await store.fetchData();
        setUsersList(store.users);
        showToast('Store data refreshed successfully.');
      }
    } catch (e: any) {
      console.error('Failed to refresh user data:', e);
      showToast('Error syncing with database.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Role', 'Name', 'Email', 'Verified', 'Suspended', 'Hourly Rate', 'Location', 'Subjects', 'Created At'];
      const rows = filteredUsers.map(u => [
        `"${u.id || ''}"`,
        `"${u.role || ''}"`,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        u.verified ? 'YES' : 'NO',
        u.suspended ? 'YES' : 'NO',
        u.hourlyRate || 0,
        `"${(u.location || u.city || u.country || '').replace(/"/g, '""')}"`,
        `"${(u.subjects || []).join('; ').replace(/"/g, '""')}"`,
        `"${u.createdAt || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `university_tutors_users_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${filteredUsers.length} records to CSV!`);
    } catch (e) {
      console.error('CSV export failed:', e);
      showToast('CSV export failed.');
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    try {
      const cleanData = filteredUsers.map(u => {
        const { password, resetToken, ...safeUser } = u as any;
        return safeUser;
      });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `university_tutors_users_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${filteredUsers.length} records to JSON!`);
    } catch (e) {
      console.error('JSON export failed:', e);
      showToast('JSON export failed.');
    }
  };

  // Filtered and Sorted users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      // Role filter
      if (selectedRole !== 'all' && user.role !== selectedRole) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && user.suspended) return false;
      if (statusFilter === 'suspended' && !user.suspended) return false;

      // Verification filter
      if (verificationFilter === 'verified' && !user.verified) return false;
      if (verificationFilter === 'unverified' && user.verified) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        const matchId = user.id?.toLowerCase().includes(q);
        const matchLoc = (user.location || user.city || user.country || '').toLowerCase().includes(q);
        const matchSubjects = (user.subjects || []).some(s => s.toLowerCase().includes(q));
        const matchBio = user.bio?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId && !matchLoc && !matchSubjects && !matchBio) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'rate-desc') {
        return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      }
      if (sortBy === 'rating-desc') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  }, [usersList, selectedRole, statusFilter, verificationFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Statistics breakdown
  const stats = useMemo(() => {
    const total = usersList.length;
    const students = usersList.filter(u => u.role === UserRole.STUDENT).length;
    const tutors = usersList.filter(u => u.role === UserRole.TUTOR).length;
    const admins = usersList.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUBADMIN).length;
    const verifiedTutors = usersList.filter(u => u.role === UserRole.TUTOR && u.verified).length;
    const suspended = usersList.filter(u => u.suspended).length;
    const avgHourlyRate = tutors > 0 
      ? Math.round(usersList.filter(u => u.role === UserRole.TUTOR && u.hourlyRate).reduce((acc, u) => acc + (u.hourlyRate || 0), 0) / (usersList.filter(u => u.role === UserRole.TUTOR && u.hourlyRate).length || 1))
      : 0;

    return { total, students, tutors, admins, verifiedTutors, suspended, avgHourlyRate };
  }, [usersList]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 pb-20" id="user-data-page-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Header Banner */}
      <section className="bg-white border-b border-orange-150/70 pt-8 pb-10 shadow-xs">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
            <button 
              onClick={() => onNavigate('home')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-orange-600 font-bold">User Data</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                  <Database className="w-3 h-3 text-orange-600" />
                  Live PostgreSQL &amp; Store Ledger
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-display">
                Platform User Data Directory
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                Centralized registry of all registered students, credentialed university tutors, faculty fellows, and system administrators. Complete records, metadata, verification tiers, and database profiles.
              </p>
            </div>

            {/* Quick Export & Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                id="refresh-user-data-btn"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all cursor-pointer border border-slate-300/60 shadow-xs"
                title="Fetch latest user records from server"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-600' : 'text-slate-600'}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                id="export-csv-user-data-btn"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-orange-50 active:bg-orange-100 rounded-xl transition-all cursor-pointer border border-orange-200 hover:border-orange-300 shadow-xs text-orange-700"
                title="Download user directory as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
                <span>Export CSV</span>
              </button>

              <button
                id="export-json-user-data-btn"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200 shadow-xs text-slate-700"
                title="Download user directory as JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
                <span>Export JSON</span>
              </button>

              {currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUBADMIN) && (
                <button
                  id="admin-dashboard-link-btn"
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8">
            <div className="bg-[#fff9f3] p-4 rounded-2xl border border-orange-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Users</span>
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{stats.total}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">All platform accounts</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Students</span>
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{stats.students}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Learners &amp; clients</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Tutors</span>
                <Briefcase className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{stats.tutors}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Certified instructors</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{stats.verifiedTutors}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Background checked</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Admins</span>
                <ShieldCheck className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{stats.admins}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Staff &amp; operators</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Avg Rate</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">${stats.avgHourlyRate}<span className="text-xs font-normal text-slate-500">/hr</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tutor benchmark</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Table Content */}
      <section className="container mx-auto px-4 md:px-8 max-w-7xl mt-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Controls Bar: Search, Role Selector, Filters */}
          <div className="p-4 sm:p-6 border-b border-slate-150 bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="user-data-search-input"
                  placeholder="Search by name, email, user ID, location, subject..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
                {[
                  { id: 'all', label: 'All Users', count: stats.total },
                  { id: 'student', label: 'Students', count: stats.students },
                  { id: 'tutor', label: 'Tutors', count: stats.tutors },
                  { id: 'admin', label: 'Admins', count: stats.admins },
                ].map(tab => (
                  <button
                    key={tab.id}
                    id={`filter-role-${tab.id}`}
                    onClick={() => {
                      setSelectedRole(tab.id as any);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedRole === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                      selectedRole === tab.id ? 'bg-orange-100 text-orange-700' : 'bg-slate-300/60 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Verification, Status, Sort */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="user-data-verification-filter"
                  value={verificationFilter}
                  onChange={(e) => {
                    setVerificationFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:border-orange-500 shadow-2xs"
                >
                  <option value="all">Verification: All</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                <select
                  id="user-data-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:border-orange-500 shadow-2xs"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="name-asc">Sort: Name (A-Z)</option>
                  <option value="name-desc">Sort: Name (Z-A)</option>
                  <option value="rate-desc">Sort: Highest Rate</option>
                  <option value="rating-desc">Sort: Highest Rating</option>
                </select>

                <select
                  id="user-data-page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-hidden focus:border-orange-500 shadow-2xs"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

            </div>
          </div>

          {/* Table Header Info */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800 font-mono tabular-nums">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-800 font-mono tabular-nums">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-slate-800 font-mono tabular-nums">{totalRecords}</span> matching records
            </div>
            {searchQuery && (
              <span className="text-[11px] text-orange-600 font-medium">
                Filtered by: "{searchQuery}"
              </span>
            )}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="user-data-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">User / Identity</th>
                  <th className="py-3 px-4">Email &amp; ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Expertise / Rate</th>
                  <th className="py-3 px-4">Status &amp; Badge</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No matching user records found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search terms or filters above.</p>
                        {(searchQuery || selectedRole !== 'all' || verificationFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedRole('all');
                              setVerificationFilter('all');
                              setCurrentPage(1);
                            }}
                            className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer underline"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isTutor = user.role === UserRole.TUTOR;
                    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUBADMIN;
                    const isStudent = user.role === UserRole.STUDENT;

                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-orange-50/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedUserForDetail(user)}
                      >
                        {/* Avatar & Name */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                                }}
                              />
                              {user.verified && (
                                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Verified Account">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                                  {user.name || 'Unnamed User'}
                                </span>
                                {user.tutorTier && (
                                  <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-1.5 py-0.2 rounded border border-amber-200">
                                    {user.tutorTier}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                                {user.location || user.city || user.country ? (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{user.location || user.city || user.country}</span>
                                  </span>
                                ) : (
                                  <span>Online Member</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email & ID */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-700 font-medium truncate max-w-[190px]">
                                {user.email || 'No email provided'}
                              </span>
                              {user.email && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(user.email, 'Email');
                                  }}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                  title="Copy Email"
                                >
                                  {copiedText === user.email ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                                {user.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(user.id, 'User ID');
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Copy User ID"
                              >
                                {copiedText === user.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {isTutor && (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-orange-200">
                              <Briefcase className="w-3 h-3 text-orange-600" />
                              Tutor
                            </span>
                          )}
                          {isStudent && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                              <GraduationCap className="w-3 h-3 text-blue-600" />
                              Student
                            </span>
                          )}
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              {user.role === UserRole.SUBADMIN ? 'Subadmin' : 'Administrator'}
                            </span>
                          )}
                        </td>

                        {/* Expertise / Rate */}
                        <td className="py-3.5 px-4">
                          {isTutor ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span className="font-mono text-xs tabular-nums text-emerald-700">${user.hourlyRate || 80}/hr</span>
                                {user.rating && (
                                  <span className="flex items-center gap-0.5 text-[11px] text-amber-600">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{user.rating.toFixed(1)}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                {(user.subjects && user.subjects.length > 0) ? user.subjects.slice(0, 2).join(', ') : (user.primarySubject || 'General University')}
                              </div>
                            </div>
                          ) : isStudent ? (
                            <div className="text-slate-500 text-[11px]">
                              <span>Undergraduate Learner</span>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-[11px]">
                              <span>Platform Governance</span>
                            </div>
                          )}
                        </td>

                        {/* Status & Verification */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {user.suspended ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                <XCircle className="w-3 h-3 text-red-500" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            )}

                            {user.verified ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified ID
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Standard ID
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'System Seed'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`inspect-user-btn-${user.id}`}
                              onClick={() => setSelectedUserForDetail(user)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Inspect User Data"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span className="hidden sm:inline">Inspect</span>
                            </button>

                            {isTutor && (
                              <button
                                id={`view-tutor-profile-btn-${user.id}`}
                                onClick={() => {
                                  if (onSelectTutorProfile) {
                                    onSelectTutorProfile(user);
                                  } else {
                                    onNavigate('tutors');
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-orange-200"
                                title="Open Tutor Public Profile"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                                <span className="hidden sm:inline">Profile</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Page <span className="font-bold text-slate-800 font-mono tabular-nums">{currentPage}</span> of <span className="font-bold text-slate-800 font-mono tabular-nums">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="pagination-first-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                First
              </button>
              <button
                id="pagination-prev-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers display */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    p = currentPage - 3 + i + 1;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer font-mono tabular-nums ${
                        currentPage === p
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                id="pagination-next-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                id="pagination-last-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                Last
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* User Detail Inspection Modal / Drawer */}
      {selectedUserForDetail && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in"
          id="user-detail-modal-backdrop"
          onClick={() => setSelectedUserForDetail(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            id="user-detail-modal-card"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative shrink-0">
              <button
                id="close-user-detail-modal-btn"
                onClick={() => setSelectedUserForDetail(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
                aria-label="Close user modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={selectedUserForDetail.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={selectedUserForDetail.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold tracking-tight text-white font-display">
                      {selectedUserForDetail.name || 'Unnamed User'}
                    </h3>
                    {selectedUserForDetail.verified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    <span>{selectedUserForDetail.email}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] uppercase font-bold bg-white/15 px-2 py-0.5 rounded font-mono">
                      Role: {selectedUserForDetail.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {selectedUserForDetail.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation tabs within modal */}
              <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-0">
                <button
                  onClick={() => setDetailTab('overview')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors cursor-pointer ${
                    detailTab === 'overview'
                      ? 'border-orange-400 text-orange-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Account Overview
                </button>
                <button
                  onClick={() => setDetailTab('academic')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors cursor-pointer ${
                    detailTab === 'academic'
                      ? 'border-orange-400 text-orange-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Academic &amp; Profile Details
                </button>
                <button
                  onClick={() => setDetailTab('json')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors cursor-pointer ${
                    detailTab === 'json'
                      ? 'border-orange-400 text-orange-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Raw JSON Record
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">User Identifier</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-900 font-semibold">{selectedUserForDetail.id}</span>
                        <button
                          onClick={() => handleCopy(selectedUserForDetail.id, 'User ID')}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Role</span>
                      <span className="text-xs font-bold text-slate-900 uppercase">{selectedUserForDetail.role}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Status</span>
                      <span className={`text-xs font-bold ${selectedUserForDetail.suspended ? 'text-red-600' : 'text-emerald-700'}`}>
                        {selectedUserForDetail.suspended ? 'Suspended / Restricted' : 'Active & Good Standing'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registration Date</span>
                      <span className="font-mono text-xs text-slate-800">
                        {selectedUserForDetail.createdAt ? new Date(selectedUserForDetail.createdAt).toLocaleString() : 'System Default'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Primary Email</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-900 font-medium">{selectedUserForDetail.email}</span>
                        <button
                          onClick={() => handleCopy(selectedUserForDetail.email, 'Email')}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedUserForDetail.bio && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Biography / About</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedUserForDetail.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'academic' && (
                <div className="space-y-4">
                  {selectedUserForDetail.role === UserRole.TUTOR ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hourly Direct Rate</span>
                          <span className="text-base font-extrabold text-emerald-700 font-mono">${selectedUserForDetail.hourlyRate || 80}/hour</span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Rating</span>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{(selectedUserForDetail.rating || 5.0).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({selectedUserForDetail.reviewCount || 100} reviews)</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Degree &amp; Academic Alma Mater</span>
                          <span className="text-xs font-semibold text-slate-900">{selectedUserForDetail.education || 'Master / Ph.D. Level'}</span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Geographic Location</span>
                          <span className="text-xs font-semibold text-slate-900">{selectedUserForDetail.location || selectedUserForDetail.city || 'United States'}</span>
                        </div>
                      </div>

                      {selectedUserForDetail.subjects && selectedUserForDetail.subjects.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Teaching Subjects &amp; Specialties</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUserForDetail.subjects.map((s, idx) => (
                              <span key={idx} className="bg-orange-100/80 text-orange-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-orange-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedUserForDetail.availability && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Schedule &amp; Availability</span>
                          <span className="text-xs text-slate-800">{selectedUserForDetail.availability}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 border border-slate-200">
                      <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Student Account Profile</p>
                      <p className="text-[11px] text-slate-500 mt-1">This user is registered as a student. Assignment orders, chat transcripts, and escrow transactions are managed in their personalized workspace.</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Database Record Preview</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedUserForDetail, null, 2), 'JSON Data')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 [scrollbar-width:thin]">
                    {JSON.stringify(selectedUserForDetail, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedUserForDetail.role === UserRole.TUTOR && onSelectTutorProfile && (
                  <button
                    onClick={() => {
                      onSelectTutorProfile(selectedUserForDetail);
                      setSelectedUserForDetail(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>View Public Tutor Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
