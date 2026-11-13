import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Dna,
  FlaskConical,
} from 'lucide-react';
import {
  ScienceCategory,
  BIOLOGY_TOOLS,
  CHEMISTRY_TOOLS,
  BIOLOGY_SUBCATEGORIES,
  CHEMISTRY_SUBCATEGORIES,
  SCIENCE_TUTOR_BRANDING,
  ScienceSubCategory,
} from '../../data/scienceToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import SiteFooter from '../SiteFooter';

interface ScienceMegaHubProps {
  category: ScienceCategory;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function ScienceMegaHub({
  category,
  onNavigate,
  onOpenBecomeTutor,
}: ScienceMegaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('All');

  useEffect(() => {
    setSelectedSubCat('All');
    setSearchQuery('');
  }, [category]);

  const tools = category === 'Biology' ? BIOLOGY_TOOLS : CHEMISTRY_TOOLS;
  const subCategories: ScienceSubCategory[] =
    category === 'Biology' ? BIOLOGY_SUBCATEGORIES : CHEMISTRY_SUBCATEGORIES;
  const tutorBranding = SCIENCE_TUTOR_BRANDING[category];

  // Inject ItemList JSON-LD for the Mega-Hub
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'science-megahub-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Free ${category} Calculators & Lab Simulators — University-Tutors.com`,
      description:
        category === 'Biology'
          ? '14 free interactive Biology, Genetics, Molecular Cloning, Cell Biology, Ecology, and Physiology tools for university students.'
          : '16 free interactive Chemistry, Stoichiometry, pH/Buffer, Thermodynamics, Electrochemistry, VSEPR, and Spectroscopy tools for university students.',
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.title,
        url: `https://university-tutors.com${t.path}`,
      })),
    });

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [category, tools]);

  const q = searchQuery.trim().toLowerCase();
  const filtered = tools.filter((t) => {
    const matchSub = selectedSubCat === 'All' || t.subCategory === selectedSubCat;
    if (!matchSub) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.formulaBadge.toLowerCase().includes(q) ||
      t.seoKeywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* Top Breadcrumb & Cross-Hub Switcher Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <a
              href="/"
              onClick={(e) => handleAnchor(e, 'home')}
              className="hover:text-[#111827] font-medium cursor-pointer"
            >
              University-Tutors.com
            </a>
            <span>›</span>
            <a
              href="/tools"
              onClick={(e) => handleAnchor(e, 'tools')}
              className="hover:text-[#111827] font-medium cursor-pointer"
            >
              All Student Tools
            </a>
            <span>›</span>
            <span className="font-bold text-[#EA580C]">{category} Knowledge Hub</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/tools/biology"
              onClick={(e) => handleAnchor(e, 'tools/biology')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                category === 'Biology'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F9FAFB] border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>Biology (14)</span>
            </a>
            <a
              href="/tools/chemistry"
              onClick={(e) => handleAnchor(e, 'tools/chemistry')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                category === 'Chemistry'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F9FAFB] border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Chemistry (16)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-[#FFFFFF] border-b border-slate-200 pt-10 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="text-[#EA580C] font-bold">
                Free {category} Knowledge Mega-Hub
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#111827]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Browser-Local Solvers
              </span>
              <span aria-hidden="true">·</span>
              <span>{tools.length} Interactive Lab &amp; Exam Calculators</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#111827] tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {category === 'Biology'
                ? 'Free Biology, Genetics & Molecular Lab Calculators'
                : 'Free Chemistry, Stoichiometry & Spectroscopy Calculators'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {category === 'Biology'
                ? 'Simulate Punnett crosses, translate DNA → mRNA → protein, design PCR master mixes and CRISPR guides, run virtual restriction agarose gels, and solve Hardy-Weinberg, CFU/mL, water potential, and physiology equations.'
                : 'Explore an interactive periodic table, balance equations, calculate limiting reagents, design Henderson-Hasselbalch buffers, plot titration & Beer-Lambert curves, and inspect VSEPR geometries and IR/NMR peaks.'}
            </p>
          </div>

          {/* Search & Sub-Category Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  category === 'Biology'
                    ? 'Search Biology tools (e.g., Punnett, PCR, CRISPR, CFU, Ψ)...'
                    : 'Search Chemistry tools (e.g., Molar Mass, pH, Titration, NMR)...'
                }
                aria-label={`Search ${category} tools`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none text-sm text-[#111827]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2" role="tablist">
              {(['All', ...subCategories] as string[]).map((sub) => {
                const active = selectedSubCat === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedSubCat(sub)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#F97316] text-white shadow-2xs'
                        : 'bg-[#F9FAFB] text-slate-700 border border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grouped Sub-Category Tool Grids */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {filtered.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <p className="text-base font-bold text-[#111827]">
              No {category.toLowerCase()} tools matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubCat('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold cursor-pointer"
            >
              Show All {tools.length} {category} Tools
            </button>
          </div>
        ) : (
          subCategories.map((subCat) => {
            const groupItems = filtered.filter((item) => item.subCategory === subCat);
            if (groupItems.length === 0) return null;

            return (
              <div key={subCat} className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                    {subCat}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {groupItems.length} interactive {groupItems.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groupItems.map((tool) => (
                    <a
                      key={tool.slug}
                      href={tool.path}
                      onClick={(e) => handleAnchor(e, tool.viewKey)}
                      className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-semibold text-slate-400 tabular-nums">
                            #{String(tool.toolNumber).padStart(2, '0')}
                          </span>
                          <code className="font-mono font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-2.5 py-0.5 rounded-lg">
                            {tool.formulaBadge}
                          </code>
                        </div>

                        <h3 className="text-base sm:text-lg font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                          {tool.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono truncate max-w-[180px]">
                          {tool.path}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#F97316] group-hover:text-[#EA580C] whitespace-nowrap">
                          <span>Launch Solver</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Subject-Matched Tutor Conversion Section */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold text-[#EA580C]">{tutorBranding.kicker}</p>
              <h2
                className="text-2xl sm:text-3xl font-display font-bold text-[#111827] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {tutorBranding.headline}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{tutorBranding.subtext}</p>
            </div>

            <a
              href="/tutors"
              onClick={(e) => handleAnchor(e, tutorBranding.ctaView)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{tutorBranding.ctaText}</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tutorBranding.tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={tutor.avatarUrl}
                      alt={tutor.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#111827] truncate">{tutor.name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-[#EA580C]">{tutor.credential}</p>
                      <p className="text-xs text-slate-500">{tutor.institution}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{tutor.specialties.join('  ·  ')}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating}★
                    </span>
                    <span>·</span>
                    <span>{tutor.sessions}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(`subject:${tutor.subjectQuery}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Book 1-on-1 Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
