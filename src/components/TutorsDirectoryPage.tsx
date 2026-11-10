import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Search, 
  MapPin, 
  Star, 
  ChevronRight, 
  ArrowLeft, 
  SlidersHorizontal, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  Clock,
  Video,
  Heart,
  DollarSign,
  Globe,
  Filter,
  CheckCircle2,
  ChevronLeft,
  X
} from 'lucide-react';
import { User } from '../types';
import { TRENDING_TUTORS_500, TRENDING_TUTORS_200 } from '../data/trendingTutors500Data';
import { getRelevantKeywordsForTutor } from '../data/subjectKeywordsData';

interface TutorsDirectoryPageProps {
  locationFilter?: string;
  subjectFilter?: string;
  onNavigate: (view: string) => void;
  onSelectTutorProfile: (tutor: User) => void;
  onOpenChat: (tutorId: string) => void;
  allStoreTutors?: User[];
}

const COUNTRY_OPTIONS = [
  { label: 'All Countries', value: 'all', count: 500, flag: '🌍' },
  { label: 'USA', value: 'USA', code: 'US', count: 210, flag: '🇺🇸' },
  { label: 'United Kingdom', value: 'UK', code: 'GB', count: 55, flag: '🇬🇧' },
  { label: 'Australia', value: 'Australia', code: 'AU', count: 50, flag: '🇦🇺' },
  { label: 'Canada', value: 'Canada', code: 'CA', count: 45, flag: '🇨🇦' },
  { label: 'Singapore', value: 'Singapore', code: 'SG', count: 45, flag: '🇸🇬' },
  { label: 'Ireland', value: 'Ireland', code: 'IE', count: 35, flag: '🇮🇪' },
  { label: 'New Zealand', value: 'New Zealand', code: 'NZ', count: 30, flag: '🇳🇿' },
  { label: 'UAE', value: 'UAE', code: 'AE', count: 30, flag: '🇦🇪' },
];

const HIGH_DEMAND_SUBJECTS = [
  'All Subjects',
  'Calculus',
  'Data Science',
  'Artificial Intelligence',
  'Web Development',
  'Visual Arts (Drawing, Painting, Sculpture)',
  'Cultural Studies',
  'Environmental Science',
  'Debate',
  'Accounting',
  'Agriculture',
  'Genetics',
  'Ethics',
  'Information Technology',
  'Health Education',
  'Business Studies',
  'Business Math',
  'Physics',
  'Psychology (AP/advanced)',
  'Generative AI',
  'Large Language Models (LLM)',
  'Cybersecurity & Ethical Hacking',
  'Biomedical Engineering'
];

export function getFallbackAvatar(name: string): string {
  const initials = (name || 'Tutor')
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'UT';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="%23FFF7ED"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="800" fill="%23FF7A00" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
}

export default function TutorsDirectoryPage({
  locationFilter,
  subjectFilter,
  onNavigate,
  onSelectTutorProfile,
  onOpenChat,
  allStoreTutors = []
}: TutorsDirectoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectFilter || 'All Subjects');
  const [maxPrice, setMaxPrice] = useState<number>(180);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price_low' | 'price_high'>('rating');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const pageSize = 15;

  // Unify 500 international tutors with any extra store tutors
  const unifiedTutors = useMemo(() => {
    const map = new Map<string, User>();
    // Seed the 500 trending master tutors
    TRENDING_TUTORS_500.forEach(t => map.set(t.id, (t as unknown) as User));
    // Then combine store tutors (override or add)
    allStoreTutors.forEach(st => {
      if (st.isApproved !== false) {
        map.set(st.id, st);
      }
    });
    return Array.from(map.values());
  }, [allStoreTutors]);

  // Extract all distinct primary subjects across all tutors
  const allDistinctPrimarySubjects = useMemo(() => {
    const set = new Set<string>();
    unifiedTutors.forEach(t => {
      const ps = (t as any).primarySubject;
      if (ps) set.add(ps);
    });
    return Array.from(set).sort();
  }, [unifiedTutors]);

  // Filter list based on country, subject, maxPrice, and search query
  const filteredTutors = useMemo(() => {
    return unifiedTutors.filter(t => {
      // 1. Country Filter
      if (selectedCountry !== 'all') {
        const cCode = (t.country || '').toLowerCase();
        const cName = ((t as any).countryName || (t as any).countryFull || t.location || '').toLowerCase();
        const target = selectedCountry.toLowerCase();
        const matchesCountry = cCode === target || cName.includes(target);
        if (!matchesCountry) return false;
      }

      // 2. Subject Filter (checks primarySubject first, then subjectExpertise and subjects)
      if (selectedSubject !== 'All Subjects') {
        const targetSub = selectedSubject.toLowerCase();
        const primSub = String((t as any).primarySubject || '').toLowerCase();
        const subs = Array.isArray(t.subjects) ? t.subjects : (t.subjectExpertise || []);
        const exp = (t as any).subjectExpertise || [];
        const combined = [primSub, ...subs, ...exp].map(s => String(s).toLowerCase());
        const matchesSubject = combined.some(s => s.includes(targetSub));
        if (!matchesSubject) return false;
      }

      // 3. Max Price Filter
      if (t.hourlyRate && t.hourlyRate > maxPrice) {
        return false;
      }

      // 4. Text Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const subExp = Array.isArray(t.subjectExpertise) ? t.subjectExpertise.join(' ') : String(t.subjectExpertise || '');
        const combinedSearchSpace = [
          t.name,
          (t as any).primarySubject || '',
          (t as any).tutorTier || '',
          t.location || '',
          (t as any).countryName || (t as any).countryFull || '',
          t.country || '',
          t.education || '',
          t.experience || '',
          t.bio || '',
          subExp,
          (t.subjects || []).join(' ')
        ].join(' ').toLowerCase();

        if (!combinedSearchSpace.includes(term)) return false;
      }


      return true;
    });
  }, [unifiedTutors, selectedCountry, selectedSubject, maxPrice, searchTerm]);

  // Sort list
  const sortedTutors = useMemo(() => {
    const list = [...filteredTutors];
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    }
    return list;
  }, [filteredTutors, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedTutors.length / pageSize) || 1;
  const paginatedTutors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTutors.slice(start, start + pageSize);
  }, [sortedTutors, currentPage]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setSelectedSubject('All Subjects');
    setMaxPrice(120);
    setCurrentPage(1);
  };

  const activeCountryObj = COUNTRY_OPTIONS.find(c => c.value === selectedCountry) || COUNTRY_OPTIONS[0];

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header & Breadcrumb Navigation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                Global Master Faculty &amp; Tutors (500 Specialists)
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Degree Verified
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Find Expert <span className="text-[#FF7A00]">University Tutors</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              Explore 500 vetted professors, PhD mentors, and executive academic chairs across USA (210), UK (55), Australia (50), Canada (45), Singapore (45), Ireland (35), New Zealand (30), and UAE (30). Master tutors and senior experts with direct subject specialization.
            </p>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 px-4 py-3 rounded-2xl border border-slate-200/80 transition-all cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF7A00]" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-700">
            Showing {sortedTutors.length} Tutors
          </span>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-1.5 bg-[#FF7A00] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filter & Search'}</span>
          </button>
        </div>

        {/* Two-Column Responsive Layout: Sidebar Filters + Tutor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ==================== LEFT FILTER SIDEBAR ==================== */}
          <div className={`space-y-6 lg:block ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF7A00]" />
                  <span>Filter Directory</span>
                </div>
                {(selectedCountry !== 'all' || selectedSubject !== 'All Subjects' || maxPrice < 120 || searchTerm) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* 1. Keyword / Name Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Search Tutors
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, university, AI, PyTorch..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#FF7A00] focus:bg-white outline-none font-medium transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Country Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Country &amp; Region</span>
                  <span className="text-[11px] text-[#FF7A00] font-normal">{activeCountryObj.flag} {activeCountryObj.label}</span>
                </label>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                  {COUNTRY_OPTIONS.map((c) => {
                    const isSelected = selectedCountry === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => {
                          setSelectedCountry(c.value);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-orange-50 text-[#FF7A00] font-bold border border-orange-200 shadow-xs' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{c.flag}</span>
                          <span>{c.label}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#FF7A00] text-white font-bold' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {c.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Subject Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Subject Specialization
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#FF7A00] focus:bg-white outline-none font-medium cursor-pointer"
                >
                  <option value="All Subjects">All Subjects (500 Tutors)</option>
                  <optgroup label="High Demand Subjects">
                    {HIGH_DEMAND_SUBJECTS.filter(s => s !== 'All Subjects').map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All Direct Primary Subjects (77 Disciplines)">
                    {allDistinctPrimarySubjects.map((sub) => (
                      <option key={`prim-${sub}`} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 4. Hourly Rate Filter Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Max Rate ($/hr)
                  </label>
                  <span className="text-sm font-bold text-[#FF7A00]">
                    ${maxPrice}/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#FF7A00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>$40/hr</span>
                  <span>$110/hr</span>
                  <span>$180/hr</span>
                </div>
              </div>

            </div>
          </div>

          {/* ==================== MAIN CONTENT: TUTOR CARDS LIST ==================== */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Results Status & Sorting Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-600">
                Showing <span className="font-bold text-slate-900">{sortedTutors.length}</span> verified tutors
                {selectedCountry !== 'all' && (
                  <span> in <strong className="text-[#FF7A00]">{activeCountryObj.label}</strong></span>
                )}
                {selectedSubject !== 'All Subjects' && (
                  <span> for <strong className="text-[#FF7A00]">{selectedSubject}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-[#FF7A00] cursor-pointer"
                >
                  <option value="rating">Highest Rating ⭐</option>
                  <option value="reviews">Most Reviews 💬</option>
                  <option value="price_low">Price: Low to High 💵</option>
                  <option value="price_high">Price: High to Low 💎</option>
                </select>
              </div>
            </div>

            {/* Tutor Cards Grid */}
            <div className="space-y-5">
              {paginatedTutors.map((tutor) => {
                const subjectsList = Array.isArray(tutor.subjectExpertise) && tutor.subjectExpertise.length > 0
                  ? tutor.subjectExpertise
                  : (Array.isArray(tutor.subjects) ? tutor.subjects : []);

                const countryName = (tutor as any).countryName || tutor.location || 'USA';
                const flagEmoji = COUNTRY_OPTIONS.find(c => c.value === countryName || c.code === tutor.country)?.flag || '🌍';

                return (
                  <div
                    key={tutor.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-200 transition-all space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      
                      {/* Avatar with Verified Status */}
                      <div className="relative shrink-0">
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
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-xs bg-orange-50/50"
                        />
                        <span className="absolute -bottom-2 -right-1 bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Tutor Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                onClick={() => onSelectTutorProfile(tutor)}
                                className="text-xl font-bold text-slate-900 hover:text-[#FF7A00] transition-colors cursor-pointer"
                              >
                                {tutor.name}
                              </h2>
                              <span className="text-base" title={countryName}>
                                {flagEmoji}
                              </span>

                              {/* Tutor Tier Badge */}
                              {((tutor as any).tutorTier || (tutor as any).isMasterTutor) && (
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  (tutor as any).isMasterTutor || ((tutor as any).tutorTier || '').includes('Master')
                                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-2xs'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  {(tutor as any).tutorTier || 'Verified Expert'}
                                </span>
                              )}

                              {/* Primary Direct Subject Badge */}
                              {(tutor as any).primarySubject && (
                                <span className="text-[10.5px] font-bold text-[#FF7A00] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-[#FF7A00]" />
                                  <span>{(tutor as any).primarySubject}</span>
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
                                {countryName}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-bold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {tutor.rating || 4.9}
                                <span className="text-slate-400 font-normal">({tutor.reviewCount || 100} reviews)</span>
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-md">
                                {tutor.verificationStatus || 'Verified Degree & Background'}
                              </span>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                              ${tutor.hourlyRate || 65}
                            </span>
                            <span className="text-xs text-slate-400 font-medium"> / hr</span>
                          </div>
                        </div>

                        {/* Education */}
                        <div className="flex items-start gap-2 text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                          <GraduationCap className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900">Education: </span>
                            <span>{tutor.education || 'PhD / MS in Advanced Technology'}</span>
                          </div>
                        </div>

                        {/* Experience Snippet */}
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {tutor.experience || tutor.bio || 'Specializing in cutting-edge technology, scalable software architectures, and advanced research.'}
                        </p>

                        {/* Subject Expertise Tags */}
                        {subjectsList.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Trending Subject Expertise:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {subjectsList.map((sub, sIdx) => {
                                const isHighlighted = selectedSubject !== 'All Subjects' && sub.toLowerCase().includes(selectedSubject.toLowerCase());
                                return (
                                  <button
                                    key={sIdx}
                                    onClick={() => setSelectedSubject(sub)}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                                      isHighlighted
                                        ? 'bg-[#FF7A00] text-white border-[#FF7A00] font-bold shadow-xs'
                                        : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200 hover:border-orange-300'
                                    }`}
                                  >
                                    {sub}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Availability & Can Meet */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500">
                          {tutor.availability && (
                            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                              <Clock className="w-3 h-3 text-[#FF7A00]" />
                              {tutor.availability}
                            </span>
                          )}
                          {tutor.canMeet && (
                            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                              <Video className="w-3 h-3 text-[#FF7A00]" />
                              {tutor.canMeet}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={() => onSelectTutorProfile(tutor)}
                            className="text-xs font-bold text-slate-600 hover:text-[#FF7A00] transition-colors cursor-pointer"
                          >
                            View Full Profile &amp; Research Portfolio →
                          </button>

                          <button
                            onClick={() => onOpenChat(tutor.id)}
                            className="bg-[#FF7A00] hover:bg-[#e06c00] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Request Session</span>
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}

              {sortedTutors.length === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-4">
                  <span className="text-4xl block">🔍</span>
                  <h3 className="font-bold text-base text-slate-800">
                    No tutors found matching your current filter criteria
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try expanding your price range, clearing your search term, or selecting "All Countries".
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentPage === 1
                      ? 'text-slate-300 border-slate-150 cursor-not-allowed'
                      : 'text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-bold text-slate-600">
                  Page <span className="text-[#FF7A00]">{currentPage}</span> of {totalPages}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentPage === totalPages
                      ? 'text-slate-300 border-slate-150 cursor-not-allowed'
                      : 'text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
