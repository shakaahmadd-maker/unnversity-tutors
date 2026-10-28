import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  Clock, 
  Smile, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  MapPin, 
  ShieldCheck,
  Send,
  Tag,
  Search,
  Sparkles,
  Award,
  Compass
} from 'lucide-react';
import { User } from '../types';
import { getRelevantKeywordsForTutor } from '../data/subjectKeywordsData';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';

interface TutorProfilePageProps {
  tutor: User;
  onNavigate: (view: string) => void;
  onOpenChat?: (tutorId: string) => void;
  onBookSession?: (tutor: User) => void;
  onSearchKeyword?: (keyword: string) => void;
}

export default function TutorProfilePage({
  tutor,
  onNavigate,
  onOpenChat,
  onBookSession,
  onSearchKeyword
}: TutorProfilePageProps) {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const rawSubjects = tutor.subjectExpertise || tutor.subjects;
  const subjects: string[] = Array.isArray(rawSubjects)
    ? rawSubjects
    : typeof rawSubjects === 'string' && (rawSubjects as string).trim().length > 0
    ? (rawSubjects as string).split(',').map(s => s.trim()).filter(Boolean)
    : [
        'Math', 'Algebra', 'Calculus', 'Biology', 'Chemistry', 'SAT Prep', 'Essay Writing'
      ];

  const visibleSubjects = showAllSubjects ? subjects : subjects.slice(0, 10);

  // Compute relevant keywords for this specific tutor's subject domain
  const relevantKw = getRelevantKeywordsForTutor(
    tutor.subjectExpertise,
    tutor.education,
    tutor.primaryDomain
  );

  const highSearchKws = tutor.specializedKeywords && tutor.specializedKeywords.length > 0 
    ? tutor.specializedKeywords 
    : relevantKw.highSearchKeywords;

  const researchKws = tutor.researchKeywords && tutor.researchKeywords.length > 0
    ? tutor.researchKeywords
    : relevantKw.researchKeywords;

  const jobKws = tutor.jobKeywords && tutor.jobKeywords.length > 0
    ? tutor.jobKeywords
    : relevantKw.jobKeywords;

  const combinedKws = tutor.highGrowthKeywords && tutor.highGrowthKeywords.length > 0
    ? tutor.highGrowthKeywords
    : relevantKw.combinedKeywords;

  const handleKeywordClick = (kw: string) => {
    if (onSearchKeyword) {
      onSearchKeyword(kw);
    } else {
      onNavigate('tutors-directory');
    }
  };

  return (
    <div className="bg-[#f2f4f7] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('tutors-directory')}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tutors</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            <span>Home</span> / <span className="text-blue-600 font-semibold">{tutor.location || 'Miami, FL'} Tutors</span> / <span className="font-bold text-slate-800">{tutor.name}</span>
          </div>
        </div>

        {/* Main Profile Card (Matching Screenshot 2) */}
        <div className="bg-[#ecefe6]/40 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Main Profile Details (2 Cols on Desktop) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src={tutor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={tutor.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-slate-300 shadow-md shrink-0"
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1f3a60]">
                      {tutor.name}
                    </h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Degree & Background
                    </span>
                  </div>

                  <p className="text-sm font-medium italic text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Private tutor in {tutor.location || tutor.city || 'Miami, FL'}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{tutor.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({tutor.reviewCount || 120} reviews)</span>
                    </div>

                    <span className="font-extrabold text-blue-900 text-sm">
                      ${tutor.hourlyRate || 45}/hr
                    </span>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-800" />
                  <span>Education</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-3.5 rounded-2xl border border-slate-200/60 text-justify">
                  {tutor.education || 'University of Miami - B.S, Biomedical Engineering'}
                </p>
              </div>

              {/* Experience Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-800" />
                  <span>Experience</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-4 rounded-2xl border border-slate-200/60 whitespace-pre-line text-justify">
                  {tutor.experience || "A patient tutor, I will repeat myself to students multiple times. There are no stupid questions; the only time it's unreasonable to ask a question is if you already know the answer. A believer in interactive learning, I'll walk through anything pertaining to the subject matter..."}
                </p>
              </div>

              {/* Subject Expertise Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <h3 className="text-sm font-bold text-[#2a4f7c] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-800" />
                  <span>Subject Expertise</span>
                </h3>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {visibleSubjects.map((subject, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-blue-50/90 text-blue-800 border border-blue-200/80 font-medium px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                {subjects.length > 10 && (
                  <button
                    onClick={() => setShowAllSubjects(!showAllSubjects)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 mt-2 block cursor-pointer underline"
                  >
                    {showAllSubjects ? 'Show Less' : 'Show More...'}
                  </button>
                )}
              </div>

            </div>

            {/* Right Sidebar: Availability, Can Meet, Hobbies & Call to Action */}
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
              
              <div className="space-y-4">
                {/* Availability */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>Availability</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {tutor.availability || 'Weekdays at any time, Weekends at any time'}
                  </p>
                </div>

                {/* Can Meet */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>Can Meet</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {tutor.canMeet || '20 miles at my regular hourly rate & Online'}
                  </p>
                </div>

                {/* Hobbies */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#2a4f7c] uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-blue-700" />
                    <span>Hobbies</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-normal pl-5">
                    {tutor.hobbies || 'I enjoy reading, singing, and watching sports.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons (Orange CTA matching screenshots) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => {
                    if (onOpenChat) onOpenChat(tutor.id);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Let's Begin (Request Session)</span>
                </button>

                <button
                  onClick={() => onNavigate('get-a-quote')}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                  <span>Get Custom Price Quote</span>
                </button>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-[11px] text-orange-900 leading-snug space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                  100% Satisfaction Guarantee
                </span>
                <p>Book with complete peace of mind. Payment is held securely in escrow until tutor sessions are completed.</p>
              </div>

            </div>

          </div>
        </div>

        {/* Relevant Subject & Industry Keywords Card (Domain-Specific for this Tutor) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                  <Tag className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1f3a60]">
                  Relevant Subject, Research &amp; Industry Keywords
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Showing specialized search terms &amp; focus areas mapped to {tutor.name}'s expertise in <span className="font-bold text-slate-700">{relevantKw.primaryDomain}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Searchable Keywords</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. High-Search Subject Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-700" />
                  <span>High-Search Subject Terms</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {highSearchKws.length} Keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(showAllKeywords ? highSearchKws : highSearchKws.slice(0, 12)).map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search all tutors for ${kw}`}
                    className="text-xs bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Research & Academic Focus Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Research &amp; Methodologies</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {researchKws.length} Topics
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {researchKws.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search all tutors for ${kw}`}
                    className="text-xs bg-emerald-50/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-900 border border-emerald-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-emerald-600 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Job Search & Industry Target Keywords */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Target Careers &amp; Industry Roles</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {jobKws.length} Job Roles
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobKws.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search tutors with career prep in ${kw}`}
                    className="text-xs bg-indigo-50/60 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-900 border border-indigo-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-indigo-500 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. High-Growth & Interdisciplinary Combinations */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Interdisciplinary High-Growth Focus</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  USA / Canada Priority
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {combinedKws.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(kw)}
                    title={`Search tutors for ${kw}`}
                    className="text-xs bg-amber-50/70 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-950 border border-amber-200/80 font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] text-amber-600 group-hover:text-white">↗</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {highSearchKws.length > 12 && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setShowAllKeywords(!showAllKeywords)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-200 cursor-pointer transition-all"
              >
                {showAllKeywords ? '▲ Show Fewer Keywords' : `▼ View All ${highSearchKws.length} Search Keywords for this Domain`}
              </button>
            </div>
          )}
        </div>

        {/* SEO Keyword Links Block (Nearby Cities & Top Subjects) */}
        <div className="pt-4">
          <SEOKeywordLinksBlock 
            locationName={tutor.location || tutor.city || 'Atlanta, GA'}
            tutorName={tutor.name}
            onNavigateLocation={(loc) => onNavigate('tutors-directory')}
            onNavigateSubject={(subj) => onNavigate('tutors-directory')}
            className="rounded-3xl border border-slate-200/80 shadow-xs"
          />
        </div>

      </div>
    </div>
  );
}
