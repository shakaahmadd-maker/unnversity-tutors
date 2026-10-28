import React, { useState } from 'react';
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
  BookOpen, 
  Tag, 
  Sparkles, 
  Compass, 
  Award,
  X
} from 'lucide-react';
import { User } from '../types';
import { getTutorsForLocation, getTutorsForSubject, POPULAR_LOCATIONS, POPULAR_SUBJECTS } from '../data/tutorsDirectoryData';
import { getRelevantKeywordsForTutor, SUBJECT_DOMAINS_TAXONOMY } from '../data/subjectKeywordsData';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';

interface TutorsDirectoryPageProps {
  locationFilter?: string;
  subjectFilter?: string;
  onNavigate: (view: string) => void;
  onSelectTutorProfile: (tutor: User) => void;
  onOpenChat: (tutorId: string) => void;
  allStoreTutors?: User[];
}

const QUICK_FILTER_DOMAINS = [
  'All Disciplines',
  'AI & Machine Learning',
  'Data Science & Big Data',
  'Cybersecurity',
  'Environmental & Water Treatment',
  'Climate Change & Sustainability',
  'Renewable Energy',
  'Biotech & Biomedical',
  'Healthcare AI',
  'Robotics & Automation',
  'Finance & FinTech',
  'Semiconductors & VLSI',
  'Aerospace & Automotive',
  'Chemistry & MCAT',
  'Calculus & Diff Equations',
  'Academic Essay Writing'
];

export default function TutorsDirectoryPage({
  locationFilter,
  subjectFilter,
  onNavigate,
  onSelectTutorProfile,
  onOpenChat,
  allStoreTutors = []
}: TutorsDirectoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(locationFilter || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectFilter || '');
  const [activeDomainPill, setActiveDomainPill] = useState<string>('All Disciplines');
  const [expandedKeywordsTutorId, setExpandedKeywordsTutorId] = useState<string | null>(null);

  // Determine current active location or subject name for title
  const activeTitle = selectedCity 
    ? `Tutors in ${selectedCity}`
    : selectedSubject 
    ? `${selectedSubject} Tutors`
    : activeDomainPill !== 'All Disciplines'
    ? `${activeDomainPill} Faculty & Tutors`
    : 'Featured University Tutors Worldwide';

  // Load dedicated tutors
  let dedicatedTutors: User[] = [];
  if (selectedCity) {
    const cityName = selectedCity.split(',')[0].trim();
    const stateCountry = selectedCity.includes(',') ? selectedCity.split(',')[1].trim() : 'US';
    dedicatedTutors = getTutorsForLocation(cityName, stateCountry);
  } else if (selectedSubject) {
    dedicatedTutors = getTutorsForSubject(selectedSubject);
  } else {
    // Default to Miami as initial directory base
    dedicatedTutors = getTutorsForLocation('Miami', 'FL');
  }

  // Combine with any extra store tutors matching this location
  const combinedTutorsMap = new Map<string, User>();
  dedicatedTutors.forEach(t => combinedTutorsMap.set(t.id, t));
  allStoreTutors.forEach(st => {
    if (st.isApproved !== false && (selectedCity ? st.location?.includes(selectedCity) : true)) {
      combinedTutorsMap.set(st.id, st);
    }
  });

  const allTutorsList = Array.from(combinedTutorsMap.values());

  // Filter list based on search term AND active domain pill
  const filteredTutors = allTutorsList.filter(t => {
    const relevant = getRelevantKeywordsForTutor(t.subjectExpertise, t.education, t.primaryDomain);
    
    // Check quick domain pill filter
    if (activeDomainPill !== 'All Disciplines') {
      const domainMatch = 
        (t.primaryDomain && t.primaryDomain.toLowerCase().includes(activeDomainPill.toLowerCase().slice(0, 5))) ||
        relevant.primaryDomain.toLowerCase().includes(activeDomainPill.toLowerCase().slice(0, 5)) ||
        relevant.allFlatKeywords.some(k => k.toLowerCase().includes(activeDomainPill.toLowerCase().slice(0, 5)));
      
      if (!domainMatch) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();

    // Deep search through all fields, subjects, and keywords
    const subExp = Array.isArray(t.subjectExpertise) 
      ? t.subjectExpertise.join(' ') 
      : String(t.subjectExpertise || '');
    
    const highSearch = (t.specializedKeywords || relevant.highSearchKeywords).join(' ');
    const research = (t.researchKeywords || relevant.researchKeywords).join(' ');
    const jobs = (t.jobKeywords || relevant.jobKeywords).join(' ');
    const combined = (t.highGrowthKeywords || relevant.combinedKeywords).join(' ');
    const allKw = relevant.allFlatKeywords.join(' ');

    const combinedSearchSpace = [
      t.name,
      t.location || '',
      t.education || '',
      t.experience || '',
      t.primaryDomain || '',
      subExp,
      highSearch,
      research,
      jobs,
      combined,
      allKw
    ].join(' ').toLowerCase();

    return combinedSearchSpace.includes(term);
  });

  const handleKeywordTagClick = (kw: string) => {
    setSearchTerm(kw);
    // Scroll smoothly to top of results
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDomainPillClick = (domain: string) => {
    setActiveDomainPill(domain);
    if (domain === 'All Disciplines') {
      setSelectedSubject('');
    } else {
      setSelectedSubject('');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedSubject('');
    setActiveDomainPill('All Disciplines');
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Verified Faculty Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a365d] tracking-tight mt-1">
              {activeTitle}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Showing <span className="font-bold text-slate-800">{filteredTutors.length}</span> verified faculty profiles with 43+ searchable academic research &amp; career domains
            </p>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Return to Main Site</span>
          </button>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search any keyword (e.g. PFAS, AI, PyTorch)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white outline-none font-medium transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedSubject('');
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="">-- Filter By Location --</option>
                {POPULAR_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={`${loc.city}, ${loc.stateCountry}`}>
                    {loc.name} ({loc.city}, {loc.stateCountry})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedCity('');
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="">-- Filter By Subject / Domain --</option>
                {POPULAR_SUBJECTS.map((subj, idx) => (
                  <option key={idx} value={subj.name}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Domain Pills for Rapid Exploration */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Explore by Subject Domain:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FILTER_DOMAINS.map((domain, idx) => {
                const isActive = activeDomainPill === domain;
                return (
                  <button
                    key={idx}
                    onClick={() => handleDomainPillClick(domain)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchTerm || selectedCity || selectedSubject || activeDomainPill !== 'All Disciplines') && (
          <div className="flex flex-wrap items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-4 py-2.5 rounded-2xl text-xs text-blue-900">
            <span className="font-bold flex items-center gap-1 text-blue-950">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" /> Active Filters:
            </span>
            {searchTerm && (
              <span className="bg-white px-2.5 py-0.5 rounded-md border border-blue-200 font-semibold flex items-center gap-1">
                Keyword: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="text-blue-500 hover:text-blue-800 cursor-pointer">×</button>
              </span>
            )}
            {selectedCity && (
              <span className="bg-white px-2.5 py-0.5 rounded-md border border-blue-200 font-semibold flex items-center gap-1">
                City: {selectedCity}
                <button onClick={() => setSelectedCity('')} className="text-blue-500 hover:text-blue-800 cursor-pointer">×</button>
              </span>
            )}
            {selectedSubject && (
              <span className="bg-white px-2.5 py-0.5 rounded-md border border-blue-200 font-semibold flex items-center gap-1">
                Subject: {selectedSubject}
                <button onClick={() => setSelectedSubject('')} className="text-blue-500 hover:text-blue-800 cursor-pointer">×</button>
              </span>
            )}
            {activeDomainPill !== 'All Disciplines' && (
              <span className="bg-white px-2.5 py-0.5 rounded-md border border-blue-200 font-semibold flex items-center gap-1">
                Domain: {activeDomainPill}
                <button onClick={() => setActiveDomainPill('All Disciplines')} className="text-blue-500 hover:text-blue-800 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* List of Tutor Cards */}
        <div className="space-y-5">
          {filteredTutors.map((tutor) => {
            const relevant = getRelevantKeywordsForTutor(tutor.subjectExpertise, tutor.education, tutor.primaryDomain);
            const highSearch = tutor.specializedKeywords && tutor.specializedKeywords.length > 0 
              ? tutor.specializedKeywords 
              : relevant.highSearchKeywords;
            const research = tutor.researchKeywords && tutor.researchKeywords.length > 0
              ? tutor.researchKeywords
              : relevant.researchKeywords;
            const jobKws = tutor.jobKeywords && tutor.jobKeywords.length > 0
              ? tutor.jobKeywords
              : relevant.jobKeywords;

            const isExpanded = expandedKeywordsTutorId === tutor.id;
            const displayKeywords = isExpanded ? highSearch : highSearch.slice(0, 6);

            return (
              <div 
                key={tutor.id} 
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {/* Tutor Headshot Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={tutor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                      alt={tutor.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h2 
                          onClick={() => onSelectTutorProfile(tutor)}
                          className="text-xl sm:text-2xl font-serif font-bold text-[#2a4f7c] hover:text-orange-600 transition-colors cursor-pointer inline-block"
                        >
                          {tutor.name}
                        </h2>
                        <p className="text-xs font-medium italic text-slate-600 mt-0.5">
                          Private tutor in {tutor.location || 'Miami, FL'} • <span className="text-emerald-700 font-bold">⭐ {tutor.rating || 4.98} ({tutor.reviewCount || 160} reviews)</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-lg font-bold text-slate-900">${tutor.hourlyRate || 55}</span>
                        <span className="text-xs text-slate-500 font-normal"> / hour</span>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#2a4f7c] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-700" />
                        Education
                      </span>
                      <p className="text-xs text-slate-700 leading-snug font-medium pl-5 text-justify">
                        {tutor.education || 'University of Miami - B.S, Biomedical Engineering'}
                      </p>
                    </div>

                    {/* Experience Snippet */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#2a4f7c] flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-blue-700" />
                        Experience
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal pl-5 line-clamp-3 text-justify">
                        {tutor.experience || "A patient tutor, I will repeat myself to students multiple times. There are no stupid questions; the only time it's unreasonable to ask..."}
                      </p>
                    </div>

                    {/* Relevant Subject & Industry Keywords (At bottom of card) */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-orange-500" />
                          <span>Relevant Subject &amp; Search Keywords ({relevant.primaryDomain}):</span>
                        </span>
                        {highSearch.length > 6 && (
                          <button
                            onClick={() => setExpandedKeywordsTutorId(isExpanded ? null : tutor.id)}
                            className="text-[11px] text-blue-700 font-semibold hover:underline cursor-pointer"
                          >
                            {isExpanded ? 'Show Fewer' : `+${highSearch.length - 6} more keywords`}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {displayKeywords.map((kw, idx) => {
                          const isTermMatch = searchTerm && kw.toLowerCase().includes(searchTerm.toLowerCase());
                          return (
                            <button
                              key={idx}
                              onClick={() => handleKeywordTagClick(kw)}
                              title={`Filter directory for "${kw}"`}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                                isTermMatch 
                                  ? 'bg-orange-500 text-white border-orange-600 font-bold'
                                  : 'bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-900 border-slate-200 hover:border-orange-300'
                              }`}
                            >
                              <span>{kw}</span>
                              <span className="text-[9px] opacity-60">🔍</span>
                            </button>
                          );
                        })}

                        {/* Sample Career Target Tag */}
                        {jobKws.length > 0 && (
                          <span className="text-[11px] bg-indigo-50/70 text-indigo-800 border border-indigo-200/80 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Briefcase className="w-2.5 h-2.5 text-indigo-600" />
                            {jobKws[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => onOpenChat(tutor.id)}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Let's Begin</span>
                        <ChevronRight className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => onSelectTutorProfile(tutor)}
                        className="text-xs font-bold text-blue-800 hover:text-orange-600 transition-colors cursor-pointer hover:underline"
                      >
                        View Full Tutor Profile &amp; Research Focus →
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {filteredTutors.length === 0 && (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-4">
              <span className="text-4xl block">🔍</span>
              <h3 className="font-bold text-base text-slate-800">No tutors found matching "{searchTerm || selectedSubject || selectedCity}"</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We have over 43 specialized academic disciplines covering AI, Water Treatment, Renewable Energy, Cybersecurity, and more. Try clearing filters or searching for another keyword.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* SEO Keyword Links Block (Nearby Cities & Top Subjects) */}
        <div className="pt-6">
          <SEOKeywordLinksBlock 
            locationName={selectedCity || 'Miami, FL'}
            onNavigateLocation={(loc) => {
              setSelectedCity(loc);
              setSelectedSubject('');
              setSearchTerm('');
            }}
            onNavigateSubject={(subj) => {
              setSelectedSubject(subj);
              setSelectedCity('');
              setSearchTerm('');
            }}
            className="rounded-3xl border border-slate-200/80 shadow-xs"
          />
        </div>

      </div>
    </div>
  );
}
