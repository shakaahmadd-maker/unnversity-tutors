import React, { useEffect } from 'react';
import { 
  Globe2, 
  CheckCircle2, 
  BookOpen, 
  MapPin, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Video, 
  MessageSquare, 
  Clock, 
  Calendar,
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react';
import { 
  CountryTutoringPageData, 
  COUNTRY_ONLINE_TUTORING_PAGES, 
  ALL_COUNTRY_KEYS 
} from '../data/countryOnlineTutoringData';
import { User } from '../types';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';

interface CountryOnlineTutoringPageProps {
  countryKey: string;
  tutors: User[];
  onNavigate: (view: string) => void;
  onSelectCountry: (slug: string) => void;
  onSelectTutorProfile?: (tutor: User) => void;
  onOpenChat: (tutorId: string) => void;
  onSearchCity: (city: string) => void;
  onSearchSubject: (subject: string) => void;
}

export default function CountryOnlineTutoringPage({
  countryKey,
  tutors,
  onNavigate,
  onSelectCountry,
  onSelectTutorProfile,
  onOpenChat,
  onSearchCity,
  onSearchSubject
}: CountryOnlineTutoringPageProps) {
  const data: CountryTutoringPageData = 
    COUNTRY_ONLINE_TUTORING_PAGES[countryKey] || COUNTRY_ONLINE_TUTORING_PAGES['usa'];

  // Dynamically update document title & meta tags for optimal SEO and compliance
  useEffect(() => {
    document.title = data.seoTitle;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      `${data.h1}. ${data.paragraphs[0]} Connect with top-tier university mentors.`
    );

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', data.url);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data]);

  // Filter tutors relevant to this region or top rated mentors
  const relevantTutors = tutors.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" id={`country-page-${data.slug}`}>
      {/* Top Country Selector Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 px-4 sticky top-20 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe2 className="w-4 h-4 text-orange-400" />
            <span>Select Regional Tutoring Hub:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {ALL_COUNTRY_KEYS.map((key) => {
              const country = COUNTRY_ONLINE_TUTORING_PAGES[key];
              const isSelected = key === data.countryKey;
              return (
                <button
                  key={key}
                  id={`country-switch-${key}`}
                  onClick={() => onSelectCountry(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-xs scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{country.flagEmoji}</span>
                  <span>{country.countryName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-[#fff8f2] via-[#fffbf7] to-slate-50 border-b border-orange-200/60 pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-orange-600 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => onNavigate('services')} 
              className="hover:text-orange-600 cursor-pointer"
            >
              Online Tutoring
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-600 font-bold">{data.countryName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold">
                <span className="text-base">{data.flagEmoji}</span>
                <span>Official Regional Study Hub &bull; {data.countryName}</span>
              </div>

              {/* Exact H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
                {data.h1}
              </h1>

              {/* URL Reference Tag */}
              <div className="text-xs font-mono text-slate-500 bg-white/80 border border-slate-200 inline-block px-2.5 py-1 rounded-md">
                URL: <span className="text-orange-600 font-semibold">{data.url}</span>
              </div>

              {/* Primary Content Paragraphs */}
              <div className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed">
                {data.paragraphs.map((p, idx) => (
                  <p key={idx} className="font-normal">
                    {p}
                  </p>
                ))}
              </div>

              {/* Market Note (for UK or special notes) */}
              {data.marketNote && (
                <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200/80 text-orange-950 text-sm font-medium">
                  🌟 {data.marketNote}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  id="btn-get-quote-hero"
                  onClick={() => onNavigate('get-a-quote')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Get a Free Regional Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-view-directory-hero"
                  onClick={() => onNavigate('tutors-directory')}
                  className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span>Browse Available Tutors</span>
                </button>
              </div>

            </div>

            {/* Right Card Column: Regional Fast Facts */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-md space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{data.flagEmoji}</span>
                    <h2 className="text-base font-bold text-slate-900 font-display">
                      {data.countryName} Student Network
                    </h2>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Live Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-orange-500" /> Format
                    </span>
                    <span className="font-bold text-slate-800">1-on-1 Interactive Virtual</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> Scheduling
                    </span>
                    <span className="font-bold text-slate-800">24/7 Local Timezones</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-orange-500" /> Verified Tutors
                    </span>
                    <span className="font-bold text-slate-800">Top 3% Oxbridge/Ivy/Russell</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Protection
                    </span>
                    <span className="font-bold text-emerald-700">100% Escrow Backed</span>
                  </div>
                </div>

                <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/60 text-xs text-orange-950 space-y-1">
                  <span className="font-bold block">Need Urgent Lesson Booking?</span>
                  <p className="text-[11px] text-slate-600">
                    Share your syllabus, assignment prompt, or test date for instant matching.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('get-a-quote')}
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  Submit Inquiry for {data.countryName}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TOPICAL SEO STRUCTURE CLUSTER TREE (Internal Linking to Sub-Services) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Specialized Service Taxonomy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Topical SEO &amp; Educational Structure for {data.countryName}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
              Dedicated 1-on-1 Hubs
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner">
            <div className="text-orange-400 font-bold mb-2">
              Online Tutoring {data.countryName} Hub Architecture:
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="text-white font-bold">Online Tutoring {data.countryName}</div>
              <div>│</div>
              <div>├── <button onClick={() => onNavigate(`assignment-guidance-${data.countryKey}`)} className="text-orange-300 hover:text-orange-200 font-bold hover:underline cursor-pointer">Assignment Guidance {data.countryName}</button></div>
              <div>├── <button onClick={() => onNavigate(`coursework-tutoring-${data.countryKey}`)} className="text-orange-300 hover:text-orange-200 font-bold hover:underline cursor-pointer">Coursework Tutoring {data.countryName}</button></div>
              <div>└── <button onClick={() => onNavigate(`writing-tutoring-${data.countryKey}`)} className="text-orange-300 hover:text-orange-200 font-bold hover:underline cursor-pointer">Writing Tutoring {data.countryName}</button></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <button
              id={`btn-cluster-assignment-${data.countryKey}`}
              onClick={() => onNavigate(`assignment-guidance-${data.countryKey}`)}
              className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200 hover:border-orange-500 hover:bg-orange-100/60 transition-all text-left group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded-md">
                    Targeted Service
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700">
                  Assignment Guidance {data.countryName}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ethical 1-on-1 rubric analysis, prompt deconstruction, structured planning, and step-by-step problem derivation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center justify-between text-[11px] font-bold text-orange-700">
                <span>/assignment-guidance-{data.countryKey}</span>
                <span className="group-hover:underline">Explore &rarr;</span>
              </div>
            </button>

            <button
              id={`btn-cluster-coursework-${data.countryKey}`}
              onClick={() => onNavigate(`coursework-tutoring-${data.countryKey}`)}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                    Targeted Service
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700">
                  Coursework Tutoring {data.countryName}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Continuous assessment support for laboratory reports, STEM problem sets, engineering code, and modular projects.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-orange-700">
                <span>/coursework-tutoring-{data.countryKey}</span>
                <span className="group-hover:underline">Explore &rarr;</span>
              </div>
            </button>

            <button
              id={`btn-cluster-writing-${data.countryKey}`}
              onClick={() => onNavigate(`writing-tutoring-${data.countryKey}`)}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                    Targeted Service
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700">
                  Writing Tutoring {data.countryName}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Academic essay writing, thesis argument development, literature synthesis, and formatting in APA, Harvard, OSCOLA.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-orange-700">
                <span>/writing-tutoring-{data.countryKey}</span>
                <span className="group-hover:underline">Explore &rarr;</span>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* Educational Pathways & Curriculum Support Section */}
      {data.pathways && data.pathways.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Curriculum &amp; Exam Alignment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {data.pathwaysTitle || 'Educational Pathways & Programs We Support'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.pathways.map((pathway, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {pathway}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Structured 1-on-1 step-by-step mentoring, concept mastery, and exam strategy.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specialized Subject Disciplines Section */}
      {data.subjectsList && data.subjectsList.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
          <div className="space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Subject Specializations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {data.subjectsTitle || 'Specialized Subjects Available for Online Tutoring'}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {data.subjectsList.map((subject, idx) => (
                <button
                  key={idx}
                  id={`btn-subject-${idx}`}
                  onClick={() => onSearchSubject(subject)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-700 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>{subject}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Major Cities & Regional Access Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Geographical Reach &amp; Metro Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Tutoring Available Across Major {data.countryName} Cities
            </h2>
            {data.citiesMention && (
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
                {data.citiesMention}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {data.citiesList.map((city, idx) => (
              <button
                key={idx}
                id={`btn-city-${idx}`}
                onClick={() => onSearchCity(city)}
                className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 truncate">
                    {city}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 pl-5.5 block mt-0.5">
                  1-on-1 Online Tutors
                </span>
              </button>
            ))}
          </div>

          {data.closingMention && (
            <p className="text-xs text-slate-600 font-medium pt-2 italic">
              ✨ {data.closingMention}
            </p>
          )}
        </div>
      </section>

      {/* Featured Verified Tutors for this Region */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Top Rated Instructors
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                Featured Online Tutors for {data.countryName} Students
              </h2>
            </div>
            <button
              onClick={() => onNavigate('tutors-directory')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <span>View All 2,400+ Verified Tutors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantTutors.map((tutor) => (
              <div 
                key={tutor.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <img 
                      src={tutor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={tutor.name}
                      className="w-14 h-14 rounded-xl object-cover border border-orange-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{tutor.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-orange-600 font-semibold">{tutor.education || 'PhD / Masters Candidate'}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {tutor.rating?.toFixed(1) || '4.9'}
                        </span>
                        <span>&bull;</span>
                        <span>{tutor.reviewCount || 120}+ Sessions</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {tutor.bio || 'Specialized in customized 1-on-1 coursework support, step-by-step problem derivation, and rigorous exam preparation.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(tutor.subjects || tutor.subjectExpertise || ['Mathematics', 'Science', 'Exam Prep']).slice(0, 3).map((spec, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (onSelectTutorProfile) {
                        onSelectTutorProfile(tutor);
                      }
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-orange-600 cursor-pointer"
                  >
                    View Full Profile
                  </button>
                  <button
                    onClick={() => onOpenChat(tutor.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Keyword Links Taxonomy Integration */}
      <SEOKeywordLinksBlock
        locationName={data.citiesList[0] || data.countryName}
        onNavigateLocation={(loc) => onSearchCity(loc)}
        onNavigateSubject={(subj) => onSearchSubject(subj)}
      />

      {/* Bottom CTA Banner */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold">
            <span>{data.flagEmoji}</span>
            <span>Start Your 1-on-1 Online Learning in {data.countryName}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Achieve Top Academic Results?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect with certified university tutors in mathematics, science, engineering, business, and standardized test prep tailored to your regional curriculum.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('get-a-quote')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started with a Free Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              Contact Student Advising
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
