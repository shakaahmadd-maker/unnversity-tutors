import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Globe2,
  MapPin,
  Network,
} from 'lucide-react';
import {
  SpecializedServicePageData,
  SPECIALIZED_SERVICE_PAGES_MAP,
} from '../data/specializedTutoringServicesData';
import { COUNTRY_ONLINE_TUTORING_PAGES } from '../data/countryOnlineTutoringData';
import { User } from '../types';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';
import RegionalPortalBar from './RegionalPortalBar';
import { getSpecializedServiceEditorialConfig } from '../data/editorialServiceContent';
import ServiceEditorialTemplate from './ServiceEditorialTemplate';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

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
  onSearchCity,
  onSearchSubject,
}: SpecializedServicePageProps) {
  const cleanSlug = pageSlug.replace(/^\//, '').trim();
  const data: SpecializedServicePageData =
    SPECIALIZED_SERVICE_PAGES_MAP[cleanSlug] ||
    SPECIALIZED_SERVICE_PAGES_MAP['assignment-guidance'];

  const editorialConfig = useMemo(
    () => getSpecializedServiceEditorialConfig(data),
    [data]
  );

  const countryCities = data.countrySlug
    ? COUNTRY_ONLINE_TUTORING_PAGES[data.countrySlug]?.citiesList || []
    : [];

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

  const topBarSlot = (
    <div id={`service-page-${data.slug}`}>
      <RegionalPortalBar
        label={`Regional ${data.category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (ch) => ch.toUpperCase())} Portals:`}
        showGlobal={true}
        isGlobalActive={!data.countrySlug}
        onSelectGlobal={() => onNavigate(data.category)}
        activeCountrySlug={data.countrySlug}
        onSelectCountry={(slug) => onNavigate(`${data.category}-${slug}`)}
        countries={data.countryExpansions.map((c) => ({
          slug: c.slug,
          name: c.name,
          flag: c.flag,
          id: `service-country-switch-${c.slug}`,
        }))}
      />

      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Service breadcrumb"
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
            {data.parentCountryHub ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(`online-tutoring-${data.parentCountryHub?.slug}`)
                  }
                  className="hover:text-orange-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>{data.flagEmoji}</span>
                  <span>{data.parentCountryHub.name}</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Services
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </>
            )}
            <span className="text-orange-600 font-bold">{data.badge}</span>
          </nav>

          {/* Quick Sibling Service Links */}
          <div className="flex flex-wrap items-center gap-2">
            {data.parentCountryHub && (
              <a
                href={`/online-tutoring-${data.parentCountryHub.slug}`}
                onClick={(e) => {
                  if (isModifiedAnchorClick(e)) return;
                  e.preventDefault();
                  onNavigate(`online-tutoring-${data.parentCountryHub?.slug}`);
                }}
                className="text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {data.parentCountryHub.name}
              </a>
            )}
            {data.siblingServices.map((sibling, idx) => {
              const targetSlug = sibling.path.replace(/^\//, '');
              return (
                <a
                  key={idx}
                  href={sibling.path}
                  onClick={(e) => {
                    if (isModifiedAnchorClick(e)) return;
                    e.preventDefault();
                    onNavigate(targetSlug);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {sibling.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const afterContentSlot = (
    <div className="bg-slate-50 border-t border-slate-200/80">
      {/* Sibling Services & Regional Network Links */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 inline-flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>Related Coaching Services</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-editorial-serif mt-1">
              Explore Related Services {data.countrySlug ? `in ${data.countryName}` : 'Worldwide'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.parentCountryHub && (
              <a
                href={`/online-tutoring-${data.parentCountryHub.slug}`}
                onClick={(e) => {
                  if (isModifiedAnchorClick(e)) return;
                  e.preventDefault();
                  onNavigate(`online-tutoring-${data.parentCountryHub?.slug}`);
                }}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                    Regional Study Hub
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {data.flagEmoji} {data.parentCountryHub.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Return to the full {data.countryName} online tutoring hub for all university pathways, cities, and live subject mentors.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>/online-tutoring-{data.parentCountryHub.slug}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            )}

            {data.siblingServices.map((sibling, idx) => {
              const targetSlug = sibling.path.replace(/^\//, '');
              return (
                <a
                  key={idx}
                  href={sibling.path}
                  onClick={(e) => {
                    if (isModifiedAnchorClick(e)) return;
                    e.preventDefault();
                    onNavigate(targetSlug);
                  }}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                      Companion Service
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {sibling.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {sibling.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                    <span>{sibling.path}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Country Expansions Grid */}
        {data.countryExpansions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {data.category
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (ch) => ch.toUpperCase())}{' '}
                  Across 8 Regional Curricula
                </h3>
                <p className="text-xs text-slate-500">
                  Switch country hub for local university grading bands, referencing styles, and timezone slots.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.countryExpansions.map((c) => {
                const targetSlug = `${data.category}-${c.slug}`;
                const isActive = data.countrySlug === c.slug;
                return (
                  <a
                    key={c.slug}
                    href={`/${targetSlug}`}
                    onClick={(e) => {
                      if (isModifiedAnchorClick(e)) return;
                      e.preventDefault();
                      onNavigate(targetSlug);
                    }}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-orange-50 border-orange-400 text-orange-700'
                        : 'bg-slate-50 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">
                      {c.flag} {c.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Clickable Disciplines & Cities Directory */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Direct Subject Filter
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-editorial-serif mt-1">
                Disciplines Supported in {data.countryName}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {data.curriculumDisciplines.map((disc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSearchSubject(disc)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 hover:text-orange-700 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                  <span>{disc}</span>
                </button>
              ))}
            </div>
          </div>

          {countryCities.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  Local Campus &amp; Metro Access
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Students Supported Across {data.countryName} Cities
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {countryCities.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSearchCity(city)}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 truncate">
                      {city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEO Keyword Links Block */}
      <SEOKeywordLinksBlock
        locationName={countryCities[0] || data.countryName}
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
