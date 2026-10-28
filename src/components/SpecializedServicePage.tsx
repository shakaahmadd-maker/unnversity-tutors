import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Video, 
  MessageSquare, 
  Clock, 
  Calendar,
  ChevronRight,
  UserCheck,
  Award,
  Globe2,
  FileCheck,
  Compass,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Network
} from 'lucide-react';
import { 
  SpecializedServicePageData,
  SPECIALIZED_SERVICE_PAGES_MAP,
  SpecializedServiceCategory
} from '../data/specializedTutoringServicesData';
import { User } from '../types';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';

interface SpecializedServicePageProps {
  pageSlug: string;
  tutors: User[];
  onNavigate: (view: string) => void;
  onSelectTutorProfile?: (tutor: User) => void;
  onOpenChat: (tutorId: string) => void;
  onSearchCity: (city: string) => void;
  onSearchSubject: (subject: string) => void;
}

export default function SpecializedServicePage({
  pageSlug,
  tutors,
  onNavigate,
  onSelectTutorProfile,
  onOpenChat,
  onSearchCity,
  onSearchSubject
}: SpecializedServicePageProps) {
  // Normalize slug
  const cleanSlug = pageSlug.replace(/^\//, '').trim();
  const data: SpecializedServicePageData = 
    SPECIALIZED_SERVICE_PAGES_MAP[cleanSlug] || 
    SPECIALIZED_SERVICE_PAGES_MAP['assignment-guidance'];

  // SEO document title, meta tags and canonical
  useEffect(() => {
    document.title = data.seoTitle;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      `${data.h1}. ${data.summary.slice(0, 160)}... Connect with verified university tutors.`
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', data.url);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data]);

  const featuredTutors = tutors.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" id={`service-page-${data.slug}`}>
      
      {/* Top Country/Service Switcher Ribbon */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2 px-4 sticky top-20 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe2 className="w-4 h-4 text-orange-400" />
            <span>Regional {data.category.replace('-', ' ').toUpperCase()} Portals:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => onNavigate(data.category)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                !data.countrySlug
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              🌐 Global
            </button>
            {data.countryExpansions.map((c) => {
              const isSelected = c.slug === data.countrySlug;
              return (
                <button
                  key={c.slug}
                  id={`service-country-switch-${c.slug}`}
                  onClick={() => onNavigate(`${data.category}-${c.slug}`)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#fff8f2] via-[#fffbf7] to-slate-50 border-b border-orange-200/60 pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Breadcrumb Hierarchy */}
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-orange-600 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            {data.parentCountryHub ? (
              <>
                <button 
                  onClick={() => onNavigate(`online-tutoring-${data.parentCountryHub?.slug}`)} 
                  className="hover:text-orange-600 cursor-pointer flex items-center gap-1"
                >
                  <span>{data.flagEmoji}</span>
                  <span>{data.parentCountryHub.name}</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('services')} 
                  className="hover:text-orange-600 cursor-pointer"
                >
                  Services
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-orange-600 font-bold">{data.badge}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold">
                <span className="text-base">{data.flagEmoji}</span>
                <span>{data.badge} &bull; University Tutors</span>
              </div>

              {/* Exact H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
                {data.h1}
              </h1>

              {/* URL Reference Tag */}
              <div className="text-xs font-mono text-slate-500 bg-white/80 border border-slate-200 inline-block px-2.5 py-1 rounded-md">
                URL: <span className="text-orange-600 font-semibold">{data.url}</span>
              </div>

              {/* Target Keywords Ribbon */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Target Search Focus:
                </span>
                {data.targetKeywords.map((kw, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold shadow-2xs"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              {/* Primary Content Summary */}
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                {data.summary}
              </p>

              {/* Academic Integrity Notice Box */}
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs sm:text-sm font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-bold mb-0.5">
                    Ethical Pedagogy Guarantee
                  </strong>
                  {data.ethicalGuidanceNotice}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="btn-get-quote-service"
                  onClick={() => onNavigate('get-a-quote')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request 1-on-1 Mentorship Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-view-directory-service"
                  onClick={() => onNavigate('tutors-directory')}
                  className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  <span>Find Available Tutors</span>
                </button>
              </div>

            </div>

            {/* Right Card: Quick Consultation Matching */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-md space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{data.flagEmoji}</span>
                    <h2 className="text-base font-bold text-slate-900 font-display">
                      {data.countryName} Guidance Hub
                    </h2>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Live Verified
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-orange-500" /> Session Type
                    </span>
                    <span className="font-bold text-slate-800">1-on-1 Screen &amp; Audio</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> Turnaround
                    </span>
                    <span className="font-bold text-slate-800">Instant / Same-Day</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-orange-500" /> Tutor Quality
                    </span>
                    <span className="font-bold text-slate-800">PhD / Master's Specialists</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Policy
                    </span>
                    <span className="font-bold text-emerald-700">100% Ethical &amp; Safe</span>
                  </div>
                </div>

                <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/60 text-xs text-orange-950 space-y-1">
                  <span className="font-bold block">Need Assignment or Coursework Help?</span>
                  <p className="text-[11px] text-slate-600">
                    Share your rubric, guidelines, or problem prompts for immediate tutor matching.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('get-a-quote')}
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  Start 1-on-1 Consultation
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TOPICAL SEO STRUCTURE CLUSTER TREE (Internal Linking Block) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Topical SEO &amp; Educational Service Hierarchy
            </h2>
          </div>

          <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner">
            <div className="text-orange-400 font-bold mb-2">
              {data.parentCountryHub ? `${data.parentCountryHub.name} Network Hierarchy:` : 'Global Tutoring Framework:'}
            </div>
            {data.parentCountryHub ? (
              <div className="space-y-1 text-slate-300">
                <div>
                  <button 
                    onClick={() => onNavigate(`online-tutoring-${data.parentCountryHub?.slug}`)}
                    className="text-orange-300 font-bold hover:underline cursor-pointer"
                  >
                    Online Tutoring {data.countryName}
                  </button>
                </div>
                <div>│</div>
                <div>├── <button onClick={() => onNavigate(`assignment-guidance-${data.countrySlug}`)} className={`${data.category === 'assignment-guidance' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Assignment Guidance {data.countryName}</button></div>
                <div>├── <button onClick={() => onNavigate(`coursework-tutoring-${data.countrySlug}`)} className={`${data.category === 'coursework-tutoring' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Coursework Tutoring {data.countryName}</button></div>
                <div>└── <button onClick={() => onNavigate(`writing-tutoring-${data.countrySlug}`)} className={`${data.category === 'writing-tutoring' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Writing Tutoring {data.countryName}</button></div>
              </div>
            ) : (
              <div className="space-y-1 text-slate-300">
                <div>University Tutors Hub</div>
                <div>│</div>
                <div>├── <button onClick={() => onNavigate('assignment-guidance')} className={`${data.category === 'assignment-guidance' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Assignment Guidance (Global)</button></div>
                <div>├── <button onClick={() => onNavigate('coursework-tutoring')} className={`${data.category === 'coursework-tutoring' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Coursework Tutoring (Global)</button></div>
                <div>└── <button onClick={() => onNavigate('writing-tutoring')} className={`${data.category === 'writing-tutoring' ? 'text-white font-extrabold underline' : 'text-slate-300 hover:text-orange-300'} cursor-pointer`}>Writing Tutoring (Global)</button></div>
              </div>
            )}
          </div>

          {/* Sibling Links */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Explore Related Services in {data.countryName}:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.siblingServices.map((sibling, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(sibling.path.replace(/^\//, ''))}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-orange-600">
                      {sibling.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {sibling.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Pedagogical Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Key Learning Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              How Our {data.badge} Sessions Accelerate Your Understanding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.features.map((feat, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Learning Methodology */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Structured Step-by-Step Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Our 4-Stage 1-on-1 Mentoring Process
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.learningMethodology.map((m, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 relative overflow-hidden"
              >
                <span className="text-3xl font-extrabold text-orange-400/40 font-mono">
                  {m.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Disciplines Covered */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Subject Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Disciplines Supported in {data.countryName}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.curriculumDisciplines.map((disc, idx) => (
              <button
                key={idx}
                onClick={() => onSearchSubject(disc)}
                className="p-3.5 bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600">
                  {disc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified Tutors */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Expert Mentors
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                Top Rated {data.badge} Specialists
              </h2>
            </div>
            <button
              onClick={() => onNavigate('tutors-directory')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <span>Explore All Verified Tutors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTutors.map((tutor) => (
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
                    {(tutor.subjects || tutor.subjectExpertise || ['Mathematics', 'Writing', 'STEM']).slice(0, 3).map((spec, i) => (
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
                    View Profile
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

      {/* Frequently Asked Questions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="space-y-1 text-center">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Clarifications &amp; Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 pt-4">
            {data.faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-orange-500 font-mono font-bold">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Keyword Links Block */}
      <SEOKeywordLinksBlock
        locationName={data.countryName}
        onNavigateLocation={(loc) => onSearchCity(loc)}
        onNavigateSubject={(subj) => onSearchSubject(subj)}
      />

      {/* Bottom CTA Banner */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold">
            <span>{data.flagEmoji}</span>
            <span>Boost Your Grades with 1-on-1 {data.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Master Your Next Submission?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get matched with verified doctoral and master's degree tutors for tailored planning, problem-solving derivation, and rubric analysis.
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
