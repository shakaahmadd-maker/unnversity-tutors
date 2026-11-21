import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  MapPin,
  Network,
} from 'lucide-react';
import {
  CountryTutoringPageData,
  COUNTRY_ONLINE_TUTORING_PAGES,
  ALL_COUNTRY_KEYS,
} from '../data/countryOnlineTutoringData';
import { User } from '../types';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';
import RegionalPortalBar from './RegionalPortalBar';
import { getCountryOnlineTutoringEditorialConfig } from '../data/editorialServiceContent';
import ServiceEditorialTemplate from './ServiceEditorialTemplate';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

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
  onSearchCity,
  onSearchSubject,
}: CountryOnlineTutoringPageProps) {
  const data: CountryTutoringPageData =
    COUNTRY_ONLINE_TUTORING_PAGES[countryKey] || COUNTRY_ONLINE_TUTORING_PAGES['usa'];

  const editorialConfig = useMemo(
    () => getCountryOnlineTutoringEditorialConfig(data.countryKey),
    [data.countryKey]
  );

  // Dynamically update document title & meta tags for optimal SEO and compliance
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
      `${data.h1}. ${data.paragraphs[0]} Connect with top-tier university mentors.`
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

  const topBarSlot = (
    <div id={`country-page-${data.slug}`}>
      <RegionalPortalBar
        label="Regional Online Tutoring Portals:"
        showGlobal={true}
        isGlobalActive={false}
        onSelectGlobal={() => onNavigate('service-1on1')}
        activeCountrySlug={data.countryKey}
        onSelectCountry={onSelectCountry}
        countries={ALL_COUNTRY_KEYS.map((key) => {
          const country = COUNTRY_ONLINE_TUTORING_PAGES[key];
          return {
            slug: key,
            name: country.countryName,
            flag: country.flagEmoji,
            id: `country-switch-${key}`,
          };
        })}
      />

      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Country breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500"
          >
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Online Tutoring
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-orange-600 font-bold">
              {data.flagEmoji} {data.countryName}
            </span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/assignment-guidance-${data.countryKey}`}
              onClick={(e) => {
                if (isModifiedAnchorClick(e)) return;
                e.preventDefault();
                onNavigate(`assignment-guidance-${data.countryKey}`);
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Assignment Guidance {data.countryName}
            </a>
            <a
              href={`/coursework-tutoring-${data.countryKey}`}
              onClick={(e) => {
                if (isModifiedAnchorClick(e)) return;
                e.preventDefault();
                onNavigate(`coursework-tutoring-${data.countryKey}`);
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Coursework Tutoring {data.countryName}
            </a>
            <a
              href={`/writing-tutoring-${data.countryKey}`}
              onClick={(e) => {
                if (isModifiedAnchorClick(e)) return;
                e.preventDefault();
                onNavigate(`writing-tutoring-${data.countryKey}`);
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Writing Tutoring {data.countryName}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const afterContentSlot = (
    <div className="bg-slate-50 border-t border-slate-200/80">
      {/* Regional Specialized Services Hub Links */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 inline-flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>Dedicated {data.countryName} Academic Services</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-editorial-serif mt-1">
              Specialized 1-on-1 Coaching in {data.countryName}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {data.flagEmoji} Tailored to {data.countryName} university standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a
            id={`btn-cluster-assignment-${data.countryKey}`}
            href={`/assignment-guidance-${data.countryKey}`}
            onClick={(e) => {
              if (isModifiedAnchorClick(e)) return;
              e.preventDefault();
              onNavigate(`assignment-guidance-${data.countryKey}`);
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Rubric &amp; Concept Mentorship
              </span>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Assignment Guidance {data.countryName}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ethical 1-on-1 rubric analysis, prompt deconstruction, research planning, and step-by-step problem derivation aligned to {data.countryName} marking criteria.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>/assignment-guidance-{data.countryKey}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          <a
            id={`btn-cluster-coursework-${data.countryKey}`}
            href={`/coursework-tutoring-${data.countryKey}`}
            onClick={(e) => {
              if (isModifiedAnchorClick(e)) return;
              e.preventDefault();
              onNavigate(`coursework-tutoring-${data.countryKey}`);
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Continuous Assessment Support
              </span>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Coursework Tutoring {data.countryName}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Structured semester-long support for laboratory reports, quantitative problem sets, coding labs, and modular assessments across {data.countryName} campuses.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>/coursework-tutoring-{data.countryKey}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          <a
            id={`btn-cluster-writing-${data.countryKey}`}
            href={`/writing-tutoring-${data.countryKey}`}
            onClick={(e) => {
              if (isModifiedAnchorClick(e)) return;
              e.preventDefault();
              onNavigate(`writing-tutoring-${data.countryKey}`);
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Academic Prose &amp; Citations
              </span>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Writing Tutoring {data.countryName}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thesis development, critical argumentation, literature synthesis, and precise referencing workshops tailored to {data.countryName} university conventions.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>/writing-tutoring-{data.countryKey}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      {/* Regional Cities & Subject Search Directory */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Cities Grid */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Geographical Reach &amp; Metro Coverage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-editorial-serif mt-1">
                Online Tutoring Available Across Major {data.countryName} Cities
              </h2>
              {data.citiesMention && (
                <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mt-2">
                  {data.citiesMention}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {data.citiesList.map((city, idx) => (
                <button
                  key={idx}
                  type="button"
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
                  <span className="text-[10px] text-slate-400 pl-5 block mt-0.5">
                    1-on-1 Online Tutors
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Clickable Subject Filter Links */}
          {data.subjectsList && data.subjectsList.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  Direct Subject Search
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {data.subjectsTitle || `Popular Subjects for ${data.countryName} Students`}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {data.subjectsList.map((subject, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`btn-subject-${idx}`}
                    onClick={() => onSearchSubject(subject)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 hover:text-orange-700 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                    <span>{subject}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEO Keyword Links Taxonomy Integration */}
      <SEOKeywordLinksBlock
        locationName={data.citiesList[0] || data.countryName}
        onNavigateLocation={(loc) => onSearchCity(loc)}
        onNavigateSubject={(subj) => onSearchSubject(subj)}
      />
    </div>
  );

  return (
    <ServiceEditorialTemplate
      config={editorialConfig}
      tutors={tutors}
      onNavigate={onNavigate}
      topBarSlot={topBarSlot}
      afterContentSlot={afterContentSlot}
    />
  );
}
