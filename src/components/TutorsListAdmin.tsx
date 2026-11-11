import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Eye, 
  BookOpen, 
  Briefcase, 
  Award, 
  Clock, 
  Video, 
  Heart, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  User as UserIcon, 
  Sparkles,
  ShieldCheck,
  Star,
  Check,
  X,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { User, UserRole } from '../types';
import { store } from '../lib/store';
import TutorImageUploader from './TutorImageUploader';
import { getFallbackAvatar } from './TutorsDirectoryPage';

interface TutorsListAdminProps {
  users: User[];
  onUpdateUserProfile: (userId: string, updatedData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddNewTutor: (tutorData: {
    name: string;
    email: string;
    phoneNumber?: string;
    bio: string;
    education: string;
    experiences: string;
    subjectExpertise: string;
    availabilities: string;
    canMeet: 'Online' | 'In-Person' | 'Hybrid';
    hobbies: string;
    hourlyRate?: number;
    country?: string;
    avatarUrl?: string;
    isApproved?: boolean;
    status?: 'pending' | 'approved' | 'rejected';
  }) => Promise<boolean>;
}

export default function TutorsListAdmin({
  users,
  onUpdateUserProfile,
  onDeleteUser,
  onAddNewTutor
}: TutorsListAdminProps) {
  // Filter for tutors only - matches enum UserRole.TUTOR, string 'tutor', or tutor ID prefixes
  const allTutors = users.filter(u => {
    if (!u) return false;
    const r = (u.role || '').toLowerCase();
    return r === 'tutor' || u.role === UserRole.TUTOR || u.id.startsWith('tutor_') || u.id.startsWith('tutor-') || !!u.hourlyRate;
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminCountryFilter, setAdminCountryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminPage, setAdminPage] = useState<number>(1);
  const adminPageSize = 25;

  // Modals state
  const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<User | null>(null);
  const [editingTutor, setEditingTutor] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Success toast state
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const generateAutoKeywords = (name: string, subject: string, location: string, country: string, expertise: string) => {
    const loc = location || 'Miami, FL';
    const ctry = country || 'USA';
    const subj = subject || 'General Academics';
    const tutorName = name || 'Academic Tutor';
    return `${loc}, ${ctry}, ${subj}, ${tutorName}, ${subj} tutor, ${expertise ? expertise + ', ' : ''}AP exam prep, homework solver, 1-on-1 online tutoring, university tutors, certified tutor, test prep`;
  };

  // Edit Form state
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    location: string;
    bio: string;
    education: string;
    experiences: string;
    subjectExpertise: string;
    availabilities: string;
    canMeet: 'Online' | 'In-Person' | 'Hybrid';
    hobbies: string;
    hourlyRate: number;
    country: string;
    avatarUrl: string;
    isApproved: boolean;
    status: 'pending' | 'approved' | 'rejected';
    tutorTier: string;
    primarySubject: string;
    searchableKeywords: string;
    verificationStatus: string;
  }>({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    bio: '',
    education: '',
    experiences: '',
    subjectExpertise: '',
    availabilities: '',
    canMeet: 'Online',
    hobbies: '',
    hourlyRate: 40,
    country: 'US',
    avatarUrl: '',
    isApproved: true,
    status: 'approved',
    tutorTier: 'Senior Tutor / Expert',
    primarySubject: '',
    searchableKeywords: '',
    verificationStatus: 'Verified Degree & Background'
  });

  // Add Form state
  const [addForm, setAddForm] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    location: string;
    bio: string;
    education: string;
    experiences: string;
    subjectExpertise: string;
    availabilities: string;
    canMeet: 'Online' | 'In-Person' | 'Hybrid';
    hobbies: string;
    hourlyRate: number;
    country: string;
    avatarUrl: string;
    isApproved: boolean;
    status: 'pending' | 'approved' | 'rejected';
    tutorTier: string;
    primarySubject: string;
    searchableKeywords: string;
    verificationStatus: string;
  }>({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    bio: '',
    education: '',
    experiences: '',
    subjectExpertise: '',
    availabilities: '',
    canMeet: 'Online',
    hobbies: '',
    hourlyRate: 45,
    country: 'US',
    avatarUrl: '',
    isApproved: true,
    status: 'approved',
    tutorTier: 'Senior Tutor / Expert',
    primarySubject: '',
    searchableKeywords: '',
    verificationStatus: 'Verified Degree & Background'
  });

  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Count stats
  const pendingCount = allTutors.filter(t => t.status === 'pending' || (t.isApproved === false && t.status !== 'rejected')).length;
  const approvedCount = allTutors.filter(t => t.isApproved === true || t.status === 'approved' || (t.isApproved === undefined && t.status === undefined)).length;
  const rejectedCount = allTutors.filter(t => t.status === 'rejected').length;

  // Filtered tutors list
  const filteredTutors = allTutors.filter(tutor => {
    const isPending = tutor.status === 'pending' || (tutor.isApproved === false && tutor.status !== 'rejected');
    const isApproved = tutor.isApproved === true || tutor.status === 'approved' || (tutor.isApproved === undefined && tutor.status === undefined);
    const isRejected = tutor.status === 'rejected';

    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'approved' && !isApproved) return false;
    if (statusFilter === 'rejected' && !isRejected) return false;

    if (adminCountryFilter !== 'all') {
      const cCode = (tutor.country || '').toLowerCase();
      const cLoc = ((tutor as any).countryName || (tutor as any).countryFull || tutor.location || tutor.city || '').toLowerCase();
      const target = adminCountryFilter.toLowerCase();
      const matchesCountry = cCode === target || 
        cLoc.includes(target) || 
        (target === 'usa' && (cCode === 'us' || cCode === 'usa' || cLoc.includes('united states'))) ||
        (target === 'uk' && (cCode === 'gb' || cCode === 'uk' || cLoc.includes('united kingdom'))) ||
        (target === 'australia' && (cCode === 'au' || cCode === 'australia')) ||
        (target === 'canada' && (cCode === 'ca' || cCode === 'canada')) ||
        (target === 'singapore' && (cCode === 'sg' || cCode === 'singapore')) ||
        (target === 'ireland' && (cCode === 'ie' || cCode === 'ireland')) ||
        (target === 'new zealand' && (cCode === 'nz' || cCode === 'new zealand')) ||
        (target === 'uae' && (cCode === 'ae' || cCode === 'uae' || cLoc.includes('emirates')));
      if (!matchesCountry) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (tutor.name || '').toLowerCase().includes(q);
      const matchEmail = (tutor.email || '').toLowerCase().includes(q);
      const matchBio = (tutor.bio || '').toLowerCase().includes(q);
      const matchEdu = (tutor.education || '').toLowerCase().includes(q);
      const matchExp = (tutor.experiences || tutor.experience || '').toLowerCase().includes(q);
      const matchPrim = ((tutor as any).primarySubject || '').toLowerCase().includes(q);
      const matchTier = ((tutor as any).tutorTier || '').toLowerCase().includes(q);
      const subStr = Array.isArray(tutor.subjectExpertise) 
        ? tutor.subjectExpertise.join(' ') 
        : (tutor.subjectExpertise || (Array.isArray(tutor.subjects) ? tutor.subjects.join(' ') : (tutor.subjects || '')));
      const matchSub = subStr.toLowerCase().includes(q);
      const matchHob = (tutor.hobbies || '').toLowerCase().includes(q);
      const matchCountry = (tutor.country || '').toLowerCase().includes(q);
      const matchLoc = (tutor.location || tutor.city || (tutor as any).countryName || '').toLowerCase();
      return matchName || matchEmail || matchBio || matchEdu || matchExp || matchPrim || matchTier || matchSub || matchHob || matchCountry || matchLoc;
    }

    return true;
  });

  const totalAdminPages = Math.ceil(filteredTutors.length / adminPageSize) || 1;
  const paginatedTutors = filteredTutors.slice((adminPage - 1) * adminPageSize, adminPage * adminPageSize);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleApproveTutor = (tutor: User) => {
    onUpdateUserProfile(tutor.id, {
      isApproved: true,
      status: 'approved'
    });
    showNotification(`Tutor ${tutor.name} has been approved and is now live on the webpage!`);
  };

  const handleRejectTutor = (tutor: User) => {
    onUpdateUserProfile(tutor.id, {
      isApproved: false,
      status: 'rejected'
    });
    showNotification(`Tutor ${tutor.name} application has been marked as rejected.`);
  };

  const handleStartEdit = (tutor: User) => {
    setModalError(null);
    setEditingTutor(tutor);
    const isApp = tutor.isApproved === true || tutor.status === 'approved' || (tutor.isApproved === undefined && tutor.status === undefined);
    const primSub = (tutor as any).primarySubject || (Array.isArray(tutor.subjects) && tutor.subjects.length > 0 ? tutor.subjects[0] : (typeof tutor.subjects === 'string' ? tutor.subjects : 'General Academics'));
    const tier = (tutor as any).tutorTier || (tutor as any).tier || 'Senior Tutor / Expert';
    const expertiseStr = tutor.subjectExpertise ? (Array.isArray(tutor.subjectExpertise) ? tutor.subjectExpertise.join(', ') : tutor.subjectExpertise) : (tutor.subjects ? (Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects) : '');
    const keywords = (tutor as any).searchableKeywords || generateAutoKeywords(tutor.name, primSub, tutor.location || tutor.city || 'Miami, FL', tutor.country || 'USA', expertiseStr);
    const verif = (tutor as any).verificationStatus || 'Verified Degree & Background';

    setEditForm({
      name: tutor.name,
      email: tutor.email,
      phoneNumber: tutor.phoneNumber || '',
      location: tutor.location || tutor.city || 'Miami, FL',
      bio: tutor.bio || '',
      education: tutor.education || '',
      experiences: tutor.experiences || (tutor as any).experience || '',
      subjectExpertise: expertiseStr,
      availabilities: tutor.availabilities || (tutor as any).availability || '',
      canMeet: (tutor.canMeet as any) || 'Online',
      hobbies: tutor.hobbies || '',
      hourlyRate: tutor.hourlyRate || 40,
      country: tutor.country || 'US',
      avatarUrl: tutor.avatarUrl || '',
      isApproved: isApp,
      status: tutor.status || (isApp ? 'approved' : 'pending'),
      tutorTier: tier,
      primarySubject: primSub,
      searchableKeywords: keywords,
      verificationStatus: verif
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;
    setModalError(null);

    // Duplicate verification against other tutors in directory
    const compKey = `${editForm.name.trim().toLowerCase()}|${editForm.primarySubject.trim().toLowerCase()}|${editForm.location.trim().toLowerCase()}`;
    const duplicate = allTutors.find(t => {
      if (t.id === editingTutor.id) return false;
      const tName = (t.name || '').trim().toLowerCase();
      const tSub = ((t as any).primarySubject || (Array.isArray(t.subjects) ? t.subjects[0] : '') || '').trim().toLowerCase();
      const tLoc = (t.location || t.city || '').trim().toLowerCase();
      return `${tName}|${tSub}|${tLoc}` === compKey;
    });

    if (duplicate) {
      setModalError(`Duplicate profile conflict: Another tutor ("${duplicate.name}") is already registered for "${editForm.primarySubject}" in "${editForm.location}".`);
      return;
    }

    const subjectsArr = editForm.subjectExpertise
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedData: any = {
      name: editForm.name,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber,
      location: editForm.location,
      cityLocation: editForm.location,
      city: editForm.location ? editForm.location.split(',')[0].trim() : 'Miami',
      bio: editForm.bio,
      education: editForm.education,
      experiences: editForm.experiences,
      experience: editForm.experiences,
      experienceSummary: editForm.experiences,
      subjectExpertise: editForm.subjectExpertise,
      subjects: subjectsArr,
      primarySubject: editForm.primarySubject,
      tutorTier: editForm.tutorTier,
      tier: editForm.tutorTier,
      searchableKeywords: editForm.searchableKeywords || generateAutoKeywords(editForm.name, editForm.primarySubject, editForm.location, editForm.country, editForm.subjectExpertise),
      verificationStatus: editForm.verificationStatus,
      availabilities: editForm.availabilities,
      availability: editForm.availabilities,
      canMeet: editForm.canMeet,
      hobbies: editForm.hobbies,
      hourlyRate: editForm.hourlyRate,
      country: editForm.country,
      avatarUrl: editForm.avatarUrl,
      profileImageUrl: editForm.avatarUrl,
      isApproved: editForm.isApproved,
      status: editForm.isApproved ? 'approved' : editForm.status
    };

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/tutors/${editingTutor.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to update tutor profile (HTTP ${res.status})`);
      }
      if (data.tutor) {
        Object.assign(updatedData, data.tutor);
      }
      // Refresh the tutor/profile data from backend after update
      await store.fetchData();
      onUpdateUserProfile(editingTutor.id, updatedData);
      setEditingTutor(null);
      showNotification(`Tutor profile for ${editForm.name} updated successfully!`);
    } catch (e: any) {
      console.error('[Admin] Error updating tutor via API:', e);
      setModalError(e.message || 'Failed to update tutor profile on server');
    }
  };

  const handleSaveNewTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!addForm.name.trim()) {
      setModalError('Full name is required.');
      return;
    }
    if (!addForm.primarySubject.trim()) {
      setModalError('Primary Subject is required.');
      return;
    }

    const locText = addForm.location.trim() || 'Miami, FL';
    // Duplicate verification against all tutors in directory
    const compKey = `${addForm.name.trim().toLowerCase()}|${addForm.primarySubject.trim().toLowerCase()}|${locText.toLowerCase()}`;
    const duplicate = allTutors.find(t => {
      const tName = (t.name || '').trim().toLowerCase();
      const tSub = ((t as any).primarySubject || (Array.isArray(t.subjects) ? t.subjects[0] : '') || '').trim().toLowerCase();
      const tLoc = (t.location || t.city || '').trim().toLowerCase();
      return `${tName}|${tSub}|${tLoc}` === compKey;
    });

    if (duplicate) {
      setModalError(`Duplicate Profile: A tutor profile for "${addForm.name}" teaching "${addForm.primarySubject}" in "${locText}" already exists in the directory.`);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const generatedKws = addForm.searchableKeywords && addForm.searchableKeywords.trim()
        ? addForm.searchableKeywords.trim()
        : generateAutoKeywords(addForm.name, addForm.primarySubject, locText, addForm.country, addForm.subjectExpertise);

      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim() || `tutor_${Date.now()}@university-tutors.com`,
        phoneNumber: addForm.phoneNumber,
        location: locText,
        cityLocation: locText,
        tier: addForm.tutorTier,
        tutorTier: addForm.tutorTier,
        primarySubject: addForm.primarySubject.trim(),
        subjectExpertise: addForm.subjectExpertise || addForm.primarySubject,
        searchableKeywords: generatedKws,
        bio: addForm.bio || addForm.experiences || 'Dedicated academic faculty specialist.',
        education: addForm.education,
        experienceSummary: addForm.experiences,
        experiences: addForm.experiences,
        availabilities: addForm.availabilities,
        availability: addForm.availabilities,
        canMeet: addForm.canMeet,
        hobbies: addForm.hobbies,
        hourlyRate: addForm.hourlyRate || 45,
        country: addForm.country || 'USA',
        avatarUrl: addForm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        profileImageUrl: addForm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        verificationStatus: addForm.verificationStatus || 'Verified Degree & Background',
        isApproved: addForm.isApproved,
        status: addForm.isApproved ? 'approved' : addForm.status
      };

      const res = await fetch('/api/admin/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        const err = await res.json();
        setModalError(err.error || 'Duplicate tutor profile detected in directory.');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create tutor profile');
      }

      setIsAddModalOpen(false);
      showNotification(`New tutor profile for ${addForm.name} created successfully!`);
      await onAddNewTutor(payload);

      setAddForm({
        name: '',
        email: '',
        phoneNumber: '',
        location: 'Miami, FL',
        bio: '',
        education: '',
        experiences: '',
        subjectExpertise: '',
        availabilities: '',
        canMeet: 'Online',
        hobbies: '',
        hourlyRate: 45,
        country: 'USA',
        avatarUrl: '',
        isApproved: true,
        status: 'approved',
        tutorTier: 'Senior Tutor / Expert',
        primarySubject: '',
        searchableKeywords: '',
        verificationStatus: 'Verified Degree & Background'
      });
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Error occurred while saving tutor profile.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                <GraduationCap className="w-5 h-5 text-orange-400" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                Academic Faculty Control
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              Tutors List Management
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Review visitor tutor applications, edit complete profile details (Educations, Experiences, Subject Expertise, Availabilities, Hobbies), and approve tutors to publish them live on our website.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Tutor</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Total Tutors</span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">{allTutors.length}</span>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Live / Approved</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">{approvedCount}</span>
          </div>
          <div className={`backdrop-blur-md rounded-2xl p-3.5 border transition-all ${pendingCount > 0 ? 'bg-amber-500/30 border-amber-500/50 animate-pulse' : 'bg-white/10 border-white/10'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Pending Applications</span>
            <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl p-3.5 border border-rose-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Rejected / Inactive</span>
            <span className="text-2xl font-black text-rose-300 font-mono mt-0.5 block">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Action success alert */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-150 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tutors ({allTutors.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-100/60'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="bg-white text-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-100/60'
              }`}
            >
              Live / Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Country Filter & Search Box */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            <select
              value={adminCountryFilter}
              onChange={(e) => {
                setAdminCountryFilter(e.target.value);
                setAdminPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 outline-none focus:border-orange-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">🌍 All Countries ({allTutors.length})</option>
              <option value="USA">🇺🇸 USA (210)</option>
              <option value="UK">🇬🇧 United Kingdom (55)</option>
              <option value="Australia">🇦🇺 Australia (50)</option>
              <option value="Canada">🇨🇦 Canada (45)</option>
              <option value="Singapore">🇸🇬 Singapore (45)</option>
              <option value="Ireland">🇮🇪 Ireland (35)</option>
              <option value="New Zealand">🇳🇿 New Zealand (30)</option>
              <option value="UAE">🇦🇪 UAE (30)</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, subject, bio..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setAdminPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tutors Cards List */}
        {filteredTutors.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 text-sm font-semibold">No tutors match the selected criteria.</p>
            <p className="text-slate-400 text-xs">Try clearing search filters or adding a new tutor profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {paginatedTutors.map((tutor) => {
              const isPending = tutor.status === 'pending' || (tutor.isApproved === false && tutor.status !== 'rejected');
              const isApproved = tutor.isApproved === true || tutor.status === 'approved' || (tutor.isApproved === undefined && tutor.status === undefined);
              const isRejected = tutor.status === 'rejected';

              return (
                <div 
                  key={tutor.id}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md bg-white ${
                    isPending 
                      ? 'border-amber-300 ring-2 ring-amber-500/10' 
                      : isRejected 
                      ? 'border-slate-200 bg-slate-50/50 opacity-80' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Left: Avatar & Main Profile info */}
                    <div className="flex items-start gap-4">
                      <img 
                        src={tutor.avatarUrl || getFallbackAvatar(tutor.name)} 
                        alt={tutor.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackAvatar(tutor.name);
                        }}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0 bg-orange-50/50"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
                            {tutor.name}
                          </h3>

                          {/* Country Flag Badge */}
                          {tutor.country && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                              {tutor.country}
                            </span>
                          )}

                          {/* Profile Origin / Type Badge */}
                          {['tutor_clara', 'tutor_liam', 'tutor_chloe', 'tutor_james', 'tutor-dr-marcus-vance'].includes(tutor.id) ? (
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" title="Pre-existing system dummy profile">
                              <Sparkles className="w-3 h-3 text-sky-600" />
                              Dummy Seed Profile
                            </span>
                          ) : ((tutor as any).tutorTier || tutor.id.startsWith('tutor_global_')) ? (
                            <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" title="Master Faculty Tutor">
                              <Award className="w-3 h-3 text-amber-600" />
                              {(tutor as any).tutorTier || 'Global Master Tutor'}
                            </span>
                          ) : (tutor.specializedKeywords || tutor.primaryDomain || tutor.id.startsWith('tutor-dr-') || tutor.id.startsWith('tutor-alex-') || tutor.id.startsWith('tutor-sarah-')) ? (
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" title="Curated academic faculty profile">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              Curated Faculty
                            </span>
                          ) : (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" title="Newly created or uploaded tutor profile">
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              New Profile Creation
                            </span>
                          )}

                          {/* Direct Primary Subject Badge */}
                          {(tutor as any).primarySubject && (
                            <span className="bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {(tutor as any).primarySubject}
                            </span>
                          )}

                          {/* Status Badge */}
                          {isPending && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Live on Webpage
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected / Offline
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {tutor.email}
                          </span>
                          {tutor.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {tutor.phoneNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            ${tutor.hourlyRate || 40}/hr
                          </span>
                        </div>

                        {/* Bio summary */}
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-normal line-clamp-2 pt-1">
                          {tutor.bio || 'No professional bio provided yet.'}
                        </p>

                        {/* Fields Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 text-[11px]">
                          {/* Subject Expertise */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Subject Expertise</span>
                            <span className="text-slate-800 font-semibold line-clamp-1">
                              {tutor.subjectExpertise || (tutor.subjects ? tutor.subjects.join(', ') : 'Academic Tutoring')}
                            </span>
                          </div>

                          {/* Educations */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Educations</span>
                            <span className="text-slate-800 font-semibold line-clamp-1">
                              {tutor.education || 'Degrees listed on request'}
                            </span>
                          </div>

                          {/* Can Meet & Availabilities */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Can Meet / Schedule</span>
                            <span className="text-slate-800 font-semibold line-clamp-1">
                              {tutor.canMeet || 'Online'} • {tutor.availabilities || tutor.availability || 'Flexible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      
                      {/* Approve button */}
                      {!isApproved && (
                        <button
                          onClick={() => handleApproveTutor(tutor)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Approve tutor and publish profile live"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Make Live</span>
                        </button>
                      )}

                      {/* Reject / Offline button */}
                      {isApproved && (
                        <button
                          onClick={() => handleRejectTutor(tutor)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Unpublish tutor profile"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject / Make Offline</span>
                        </button>
                      )}

                      {/* View full detail modal */}
                      <button
                        onClick={() => setSelectedTutorForDetail(tutor)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>View Details</span>
                      </button>

                      {/* Edit full details */}
                      <button
                        onClick={() => handleStartEdit(tutor)}
                        className="bg-slate-900 hover:bg-orange-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Data</span>
                      </button>

                      {/* Delete profile */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete tutor ${tutor.name}?`)) {
                            onDeleteUser(tutor.id);
                            showNotification(`Tutor ${tutor.name} has been deleted.`);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete tutor profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admin Pagination Controls */}
        {totalAdminPages > 1 && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{(adminPage - 1) * adminPageSize + 1}</strong> to <strong className="text-slate-800">{Math.min(adminPage * adminPageSize, filteredTutors.length)}</strong> of <strong className="text-slate-800">{filteredTutors.length}</strong> tutors
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={adminPage === 1}
                onClick={() => setAdminPage(prev => Math.max(prev - 1, 1))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  adminPage === 1 
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-white' 
                    : 'text-slate-700 border-slate-200 hover:bg-white cursor-pointer shadow-xs'
                }`}
              >
                Previous
              </button>

              <span className="text-xs font-bold text-slate-700 px-2">
                Page {adminPage} / {totalAdminPages}
              </span>

              <button
                disabled={adminPage === totalAdminPages}
                onClick={() => setAdminPage(prev => Math.min(prev + 1, totalAdminPages))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  adminPage === totalAdminPages 
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-white' 
                    : 'text-slate-700 border-slate-200 hover:bg-white cursor-pointer shadow-xs'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR TUTOR */}
      {selectedTutorForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedTutorForDetail.avatarUrl || getFallbackAvatar(selectedTutorForDetail.name)} 
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getFallbackAvatar(selectedTutorForDetail.name);
                  }}
                  className="w-12 h-12 rounded-xl object-cover border bg-orange-50/50" 
                  alt={selectedTutorForDetail.name} 
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedTutorForDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedTutorForDetail.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTutorForDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-xs space-y-3">
              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1">Bio</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl leading-relaxed">{selectedTutorForDetail.bio || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1">Educations</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{selectedTutorForDetail.education || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1">Experiences (All Details)</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{selectedTutorForDetail.experiences || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-400 uppercase block mb-1">Subject Expertise</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{selectedTutorForDetail.subjectExpertise || selectedTutorForDetail.subjects?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase block mb-1">Availabilities</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{selectedTutorForDetail.availabilities || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-400 uppercase block mb-1">Can Meet</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{selectedTutorForDetail.canMeet || 'Online'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase block mb-1">Hobbies</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{selectedTutorForDetail.hobbies || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedTutorForDetail(null)}
                className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TUTOR MODAL */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Tutor Profile: {editingTutor.name}</h3>
                <p className="text-xs text-slate-500">Update headshot, credentials, and searchable keywords with instant live indexing.</p>
              </div>
              <button onClick={() => { setEditingTutor(null); setModalError(null); }} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[65vh] overflow-y-auto text-xs pr-1">
              <TutorImageUploader
                tutorId={editingTutor.id}
                currentImageUrl={editForm.avatarUrl}
                onImageChange={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                label="Tutor Profile Headshot"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tutor Tier</label>
                  <select
                    value={editForm.tutorTier}
                    onChange={(e) => setEditForm({ ...editForm, tutorTier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  >
                    <option value="Master Tutor (Executive / Chair)">Master Tutor (Executive / Chair)</option>
                    <option value="Senior Tutor / Subject Specialist">Senior Tutor / Subject Specialist</option>
                    <option value="Senior Tutor / Expert">Senior Tutor / Expert</option>
                    <option value="Associate Tutor / Academic Specialist">Associate Tutor / Academic Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Primary Subject (Direct Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biology / Life Science"
                    value={editForm.primarySubject}
                    onChange={(e) => setEditForm({ ...editForm, primarySubject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Location / City (e.g. Miami, FL)</label>
                  <input
                    type="text"
                    placeholder="e.g. Miami, FL"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="USA, UK, Australia..."
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Verification Status</label>
                  <select
                    value={editForm.verificationStatus}
                    onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Verified Degree & Background (Gold Tier - Master)">Verified Degree & Background (Gold Tier - Master)</option>
                    <option value="Verified Degree & Background">Verified Degree & Background</option>
                    <option value="Under Academic Review">Under Academic Review</option>
                  </select>
                </div>
              </div>

              {/* SEARCHABLE KEYWORDS DEDICATED SECTION */}
              <div className="space-y-1.5 bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Searchable Keywords (Directory Search Index)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const autoKws = generateAutoKeywords(editForm.name, editForm.primarySubject, editForm.location, editForm.country, editForm.subjectExpertise);
                      setEditForm({ ...editForm, searchableKeywords: autoKws });
                    }}
                    className="text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-white px-2.5 py-1 rounded-lg border border-orange-300 shadow-2xs hover:bg-orange-50 cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>Auto-Generate Keywords</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. San Diego, CA, USA, Biology / Life Science, Biology tutor, AP Biology, exam prep, homework solver..."
                  value={editForm.searchableKeywords}
                  onChange={(e) => setEditForm({ ...editForm, searchableKeywords: e.target.value })}
                  className="w-full p-2.5 bg-white border border-orange-200 rounded-xl text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500">
                  Matches student queries for cities, direct subjects, synonyms, and high-intent phrases like homework help & exam prep.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio / Headline</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Education Credentials</label>
                <textarea
                  rows={2}
                  value={editForm.education}
                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Experience Summary</label>
                <textarea
                  rows={2}
                  value={editForm.experiences}
                  onChange={(e) => setEditForm({ ...editForm, experiences: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Expertise (Comma-separated)</label>
                <input
                  type="text"
                  value={editForm.subjectExpertise}
                  onChange={(e) => setEditForm({ ...editForm, subjectExpertise: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Availabilities</label>
                  <input
                    type="text"
                    value={editForm.availabilities}
                    onChange={(e) => setEditForm({ ...editForm, availabilities: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Can Meet</label>
                  <select
                    value={editForm.canMeet}
                    onChange={(e) => setEditForm({ ...editForm, canMeet: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Hobbies</label>
                  <input
                    type="text"
                    value={editForm.hobbies}
                    onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Approval Status</label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isApproved}
                      onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked, status: e.target.checked ? 'approved' : 'pending' })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Approved & Live on Webpage</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingTutor(null); setModalError(null); }}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW TUTOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Tutor Profile</h3>
                <p className="text-xs text-slate-500">Add verified academic faculty member with zero-duplicate enforcement and instant search indexing.</p>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); setModalError(null); }} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewTutor} className="space-y-4 max-h-[65vh] overflow-y-auto text-xs pr-1">
              <TutorImageUploader
                currentImageUrl={addForm.avatarUrl}
                onImageChange={(url) => setAddForm({ ...addForm, avatarUrl: url })}
                label="Tutor Profile Headshot"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Dr. Evelyn Harris"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. evelyn.harris@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tutor Tier</label>
                  <select
                    value={addForm.tutorTier}
                    onChange={(e) => setAddForm({ ...addForm, tutorTier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  >
                    <option value="Master Tutor (Executive / Chair)">Master Tutor (Executive / Chair)</option>
                    <option value="Senior Tutor / Subject Specialist">Senior Tutor / Subject Specialist</option>
                    <option value="Senior Tutor / Expert">Senior Tutor / Expert</option>
                    <option value="Associate Tutor / Academic Specialist">Associate Tutor / Academic Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Primary Subject (Direct Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Environmental Science, Economics, Chemistry"
                    value={addForm.primarySubject}
                    onChange={(e) => setAddForm({ ...addForm, primarySubject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={addForm.phoneNumber}
                    onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Location / City (e.g. Miami, FL)</label>
                  <input
                    type="text"
                    placeholder="e.g. Miami, FL"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="USA, UK, Australia..."
                    value={addForm.country}
                    onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Verification Status</label>
                  <select
                    value={addForm.verificationStatus}
                    onChange={(e) => setAddForm({ ...addForm, verificationStatus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Verified Degree & Background (Gold Tier - Master)">Verified Degree & Background (Gold Tier - Master)</option>
                    <option value="Verified Degree & Background">Verified Degree & Background</option>
                    <option value="Under Academic Review">Under Academic Review</option>
                  </select>
                </div>
              </div>

              {/* SEARCHABLE KEYWORDS DEDICATED SECTION */}
              <div className="space-y-1.5 bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Searchable Keywords (Directory Search Index)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const autoKws = generateAutoKeywords(addForm.name, addForm.primarySubject, addForm.location, addForm.country, addForm.subjectExpertise);
                      setAddForm({ ...addForm, searchableKeywords: autoKws });
                    }}
                    className="text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-white px-2.5 py-1 rounded-lg border border-orange-300 shadow-2xs hover:bg-orange-50 cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>Auto-Generate Keywords</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. San Diego, CA, USA, Biology / Life Science, Biology tutor, AP Biology, exam prep, homework solver..."
                  value={addForm.searchableKeywords}
                  onChange={(e) => setAddForm({ ...addForm, searchableKeywords: e.target.value })}
                  className="w-full p-2.5 bg-white border border-orange-200 rounded-xl text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500">
                  Matches student queries for cities, direct subjects, synonyms, and high-intent phrases like homework help & exam prep.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio / Headline</label>
                <textarea
                  rows={2}
                  placeholder="Distinguished educator specializing in advanced coursework..."
                  value={addForm.bio}
                  onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Education Credentials</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Johns Hopkins University - Ph.D. in Environmental Science"
                  value={addForm.education}
                  onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Experience Summary</label>
                <textarea
                  rows={2}
                  placeholder="Specialist guiding students through advanced coursework, thesis writing, and competitive exams..."
                  value={addForm.experiences}
                  onChange={(e) => setAddForm({ ...addForm, experiences: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Expertise (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Environmental Science, Chemistry, Civics..."
                  value={addForm.subjectExpertise}
                  onChange={(e) => setAddForm({ ...addForm, subjectExpertise: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Availabilities</label>
                  <input
                    type="text"
                    placeholder="Weekends only, 1-on-1 video sessions"
                    value={addForm.availabilities}
                    onChange={(e) => setAddForm({ ...addForm, availabilities: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Can Meet</label>
                  <select
                    value={addForm.canMeet}
                    onChange={(e) => setAddForm({ ...addForm, canMeet: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Online">Virtual Online 1-on-1</option>
                    <option value="In-Person">In-Person (Up to 25 miles)</option>
                    <option value="Hybrid">Hybrid (Online & Local)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Hobbies / Interests</label>
                  <input
                    type="text"
                    placeholder="Research publications, peer review, chess..."
                    value={addForm.hobbies}
                    onChange={(e) => setAddForm({ ...addForm, hobbies: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={addForm.hourlyRate}
                    onChange={(e) => setAddForm({ ...addForm, hourlyRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Publish Status</label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isApproved}
                      onChange={(e) => setAddForm({ ...addForm, isApproved: e.target.checked, status: e.target.checked ? 'approved' : 'pending' })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-800">Publish & Make Live in Directory Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setModalError(null); }}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer transition-all"
                >
                  {isSubmittingAdd ? 'Creating Profile...' : 'Create Tutor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
