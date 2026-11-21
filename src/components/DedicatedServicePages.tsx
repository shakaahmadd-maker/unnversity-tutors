import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Globe2 } from 'lucide-react';
import { User } from '../types';
import {
  DEDICATED_SERVICE_ROUTES,
  DedicatedServiceId,
  getDedicatedServiceById,
  isModifiedAnchorClick,
} from '../data/dedicatedServiceRoutes';
import {
  ALL_COUNTRY_KEYS,
  COUNTRY_ONLINE_TUTORING_PAGES,
} from '../data/countryOnlineTutoringData';
import { getDedicatedServiceEditorialConfig } from '../data/editorialServiceContent';
import ServiceEditorialTemplate from './ServiceEditorialTemplate';

interface DedicatedServicePagesProps {
  selectedServiceId: string;
  tutors: User[];
  onTutorSelect: (tutor: User) => void;
  onNavigate: (view: string) => void;
  onBackToHub: () => void;
}

function normalizeDedicatedServiceId(raw: string): DedicatedServiceId {
  if (raw === '1on1' || raw === 'assignment' || raw === 'coursework' || raw === 'essay') {
    return raw;
  }
  return '1on1';
}

export default function DedicatedServicePages({
  selectedServiceId,
  tutors,
  onNavigate,
  onBackToHub,
}: DedicatedServicePagesProps) {
  const serviceId = normalizeDedicatedServiceId(selectedServiceId);
  const currentRoute = getDedicatedServiceById(serviceId) || DEDICATED_SERVICE_ROUTES[0];

  const config = useMemo(
    () => getDedicatedServiceEditorialConfig(serviceId),
    [serviceId]
  );

  const regionalSubServicePrefix =
    serviceId === 'assignment'
      ? 'assignment-guidance'
      : serviceId === 'coursework'
      ? 'coursework-tutoring'
      : serviceId === 'essay'
      ? 'writing-tutoring'
      : 'online-tutoring';

  const topBarSlot = (
    <div className="bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb */}
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
          <button
            type="button"
            onClick={onBackToHub}
            className="hover:text-orange-600 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>All Services</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{currentRoute.breadcrumbTitle}</span>
        </nav>

        {/* Quick-Jump Dedicated Services Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DEDICATED_SERVICE_ROUTES.map((route) => {
            const isActive = route.id === serviceId;
            return (
              <a
                key={route.id}
                href={route.path}
                onClick={(e) => {
                  if (isModifiedAnchorClick(e)) return;
                  e.preventDefault();
                  onNavigate(route.view);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                {route.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );

  const afterContentSlot = (
    <section className="py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Explore Related Dedicated Services */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Complete Academic Coaching Suite
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-editorial-serif mt-1">
                Explore Our Other Dedicated Services
              </h2>
            </div>
            <button
              type="button"
              onClick={onBackToHub}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Services Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEDICATED_SERVICE_ROUTES.filter((r) => r.id !== serviceId).map((route) => (
              <a
                key={route.id}
                href={route.path}
                onClick={(e) => {
                  if (isModifiedAnchorClick(e)) return;
                  e.preventDefault();
                  onNavigate(route.view);
                }}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-md p-6 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                    Dedicated Service
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mt-1">
                    {route.label}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {route.seoDescription}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-orange-600">
                  <span>{route.path}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Regional Country-Specific Curriculum Hubs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentRoute.label} by Country &amp; Regional Curriculum
                </h3>
                <p className="text-xs text-slate-500">
                  Select your country hub for localized grading rubrics, referencing styles, and timezone availability.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_COUNTRY_KEYS.map((key) => {
              const country = COUNTRY_ONLINE_TUTORING_PAGES[key];
              const targetSlug = `${regionalSubServicePrefix}-${key}`;
              return (
                <a
                  key={key}
                  href={`/${targetSlug}`}
                  onClick={(e) => {
                    if (isModifiedAnchorClick(e)) return;
                    e.preventDefault();
                    onNavigate(targetSlug);
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{country.flagEmoji}</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-orange-700 truncate">
                      {country.countryName}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <ServiceEditorialTemplate
      config={config}
      tutors={tutors}
      onNavigate={onNavigate}
      topBarSlot={topBarSlot}
      afterContentSlot={afterContentSlot}
    />
  );
}
