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
import TutorImageUploader from './TutorImageUploader';

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
  // Filter for tutors only
  const allTutors = users.filter(u => u.role === UserRole.TUTOR);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<User | null>(null);
  const [editingTutor, setEditingTutor] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Success toast state
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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
    status: 'approved'
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
    status: 'approved'
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tutor.name.toLowerCase().includes(q);
      const matchEmail = tutor.email.toLowerCase().includes(q);
      const matchBio = (tutor.bio || '').toLowerCase().includes(q);
      const matchEdu = (tutor.education || '').toLowerCase().includes(q);
      const matchExp = (tutor.experiences || tutor.experience || '').toLowerCase().includes(q);
      const subStr = Array.isArray(tutor.subjectExpertise) ? tutor.subjectExpertise.join(' ') : (tutor.subjectExpertise || tutor.subjects?.join(' ') || '');
      const matchSub = subStr.toLowerCase().includes(q);
      const matchHob = (tutor.hobbies || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchBio || matchEdu || matchExp || matchSub || matchHob;
    }

    return true;
  });

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
    setEditingTutor(tutor);
    const isApp = tutor.isApproved === true || tutor.status === 'approved' || (tutor.isApproved === undefined && tutor.status === undefined);
    setEditForm({
      name: tutor.name,
      email: tutor.email,
      phoneNumber: tutor.phoneNumber || '',
      location: tutor.location || tutor.city || 'Miami, FL',
      bio: tutor.bio || '',
      education: tutor.education || '',
      experiences: tutor.experiences || '',
      subjectExpertise: tutor.subjectExpertise ? (Array.isArray(tutor.subjectExpertise) ? tutor.subjectExpertise.join(', ') : tutor.subjectExpertise) : (tutor.subjects ? tutor.subjects.join(', ') : ''),
      availabilities: tutor.availabilities || tutor.availability || '',
      canMeet: (tutor.canMeet as any) || 'Online',
      hobbies: tutor.hobbies || '',
      hourlyRate: tutor.hourlyRate || 40,
      country: tutor.country || 'US',
      avatarUrl: tutor.avatarUrl || '',
      isApproved: isApp,
      status: tutor.status || (isApp ? 'approved' : 'pending')
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;

    const subjectsArr = editForm.subjectExpertise
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onUpdateUserProfile(editingTutor.id, {
      name: editForm.name,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber,
      location: editForm.location,
      city: editForm.location ? editForm.location.split(',')[0].trim() : 'Miami',
      bio: editForm.bio,
      education: editForm.education,
      experiences: editForm.experiences,
      experience: editForm.experiences,
      subjectExpertise: editForm.subjectExpertise,
      subjects: subjectsArr,
      availabilities: editForm.availabilities,
      availability: editForm.availabilities,
      canMeet: editForm.canMeet,
      hobbies: editForm.hobbies,
      hourlyRate: editForm.hourlyRate,
      country: editForm.country,
      avatarUrl: editForm.avatarUrl,
      isApproved: editForm.isApproved,
      status: editForm.isApproved ? 'approved' : editForm.status
    });

    setEditingTutor(null);
    showNotification(`Tutor profile for ${editForm.name} updated successfully!`);
  };

  const handleSaveNewTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) return;

    setIsSubmittingAdd(true);
    try {
      const ok = await onAddNewTutor({
        ...addForm,
        isApproved: addForm.isApproved,
        status: addForm.isApproved ? 'approved' : addForm.status
      });
      if (ok) {
        setIsAddModalOpen(false);
        showNotification(`New tutor profile for ${addForm.name} created successfully!`);
        setAddForm({
          name: '',
          email: '',
          phoneNumber: '',
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
          status: 'approved'
        });
      }
    } catch (err) {
      console.error(err);
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

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, subject, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
            />
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
            {filteredTutors.map((tutor) => {
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
                        src={tutor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={tutor.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
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
      </div>

      {/* DETAIL MODAL FOR TUTOR */}
      {selectedTutorForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedTutorForDetail.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  className="w-12 h-12 rounded-xl object-cover border" 
                  alt="Avatar" 
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
              <h3 className="text-lg font-bold text-slate-900">Edit Tutor Data: {editingTutor.name}</h3>
              <button onClick={() => setEditingTutor(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[65vh] overflow-y-auto text-xs pr-1">
              <TutorImageUploader
                currentImageUrl={editForm.avatarUrl}
                onImageChange={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                label="Tutor Profile Picture"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
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

              <div>
                <label className="block font-semibold mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Educations</label>
                <textarea
                  rows={2}
                  value={editForm.education}
                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Experiences (All Details)</label>
                <textarea
                  rows={2}
                  value={editForm.experiences}
                  onChange={(e) => setEditForm({ ...editForm, experiences: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Expertise</label>
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
                  onClick={() => setEditingTutor(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
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
              <h3 className="text-lg font-bold text-slate-900">Add New Tutor Profile</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTutor} className="space-y-4 max-h-[65vh] overflow-y-auto text-xs pr-1">
              <TutorImageUploader
                currentImageUrl={addForm.avatarUrl}
                onImageChange={(url) => setAddForm({ ...addForm, avatarUrl: url })}
                label="Tutor Profile Picture"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Chen"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="robert@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
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

              <div>
                <label className="block font-semibold mb-1">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Professional background overview..."
                  value={addForm.bio}
                  onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Educations</label>
                <textarea
                  rows={2}
                  placeholder="PhD/MSc qualifications..."
                  value={addForm.education}
                  onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Experiences (All Details)</label>
                <textarea
                  rows={2}
                  placeholder="Teaching & lecturing experience..."
                  value={addForm.experiences}
                  onChange={(e) => setAddForm({ ...addForm, experiences: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Expertise</label>
                <input
                  type="text"
                  placeholder="Statistics, Physics, Calculus..."
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
                    placeholder="Mon-Fri 10am-4pm"
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
                    placeholder="Chess, Piano..."
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
                    <span className="font-bold text-slate-800">Publish & Make Live Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="bg-orange-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
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
