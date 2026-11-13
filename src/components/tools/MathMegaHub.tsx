import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  MATH_LEVELS,
  MATH_TOOLS_REGISTRY,
  MathLevelId,
} from '../../data/mathToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from '../SiteFooter';

interface MathMegaHubProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function MathMegaHub({ onNavigate, onOpenBecomeTutor }: MathMegaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | MathLevelId>('all');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'math-mega-hub-jsonld';
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
      name: 'University-Tutors.com Free University Mathematics & Statistics Tools Suite (27 Calculators)',
      description:
        '27 free, 100% browser-based interactive mathematical solvers spanning Algebra, Trigonometry, Calculus, Linear Algebra, Statistics, Differential Equations, Numerical Analysis & RSA.',
      numberOfItems: MATH_TOOLS_REGISTRY.length,
      itemListElement: MATH_TOOLS_REGISTRY.map((t, i) => ({
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
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredTools = MATH_TOOLS_REGISTRY.filter((tool) => {
    if (selectedLevel !== 'all' && tool.levelId !== selectedLevel) return false;
    if (!q) return true;
    return (
      tool.title.toLowerCase().includes(q) ||
      tool.shortTitle.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.formulaBadge.toLowerCase().includes(q) ||
      tool.seoKeywords.some((kw) => kw.toLowerCase().includes(q))
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
      {/* Top Breadcrumb + Privacy Pill */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-slate-500">
            <a
              href="/"
              onClick={(e) => handleAnchor(e, 'home')}
              className="hover:text-[#111827] transition-colors"
            >
              University-Tutors.com
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a
              href="/tools"
              onClick={(e) => handleAnchor(e, 'tools')}
              className="hover:text-[#111827] transition-colors"
            >
              Free Student Tools
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#111827]">
              Mathematics &amp; Statistics Suite (27 Tools)
            </span>
          </nav>

          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Free &amp; Browser-Based — Instant Step-by-Step Math Results</span>
          </span>
        </div>
      </div>

      {/* Hero + Search + 7 Level Tabs */}
      <section className="bg-[#FFFFFF] border-b border-slate-200 pt-10 pb-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="text-[#EA580C] font-bold">University Mathematics &amp; Statistics Mega-Hub</span>
              <span aria-hidden="true">·</span>
              <span>6 Progressive Academic Levels</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">27 Interactive Solvers</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#111827] tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Free University Mathematics, Calculus, Linear Algebra &amp; Statistics Tools
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From PEMDAS and quadratic factoring to symbolic derivatives, Gaussian RREF, Welch&apos;s
              t-tests, RK4 slope fields, Fourier synthesis, and RSA modular arithmetic—every solver runs
              100% locally in your browser with step-by-step derivations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 27 math tools (e.g., RREF, Eigenvalues, Riemann, ANOVA, RK4, RSA)..."
                aria-label="Search 27 mathematics and statistics tools"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none text-sm text-[#111827]"
              />
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Filter mathematics tools by academic level"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLevel === 'all'}
                onClick={() => setSelectedLevel('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedLevel === 'all'
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#F9FAFB] text-slate-700 border border-slate-200 hover:border-orange-300'
                }`}
              >
                All 27 Tools
              </button>
              {MATH_LEVELS.map((lvl) => {
                const active = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#F97316] text-white'
                        : 'bg-[#F9FAFB] text-slate-700 border border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {lvl.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 27 Math Tool Cards Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredTools.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <p className="text-base font-bold text-[#111827]">
              No mathematics tools matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold cursor-pointer"
            >
              Show All 27 Mathematics Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.path}
                onClick={(e) => handleAnchor(e, tool.viewKey)}
                className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium">{tool.levelShortLabel}</span>
                    <span className="font-mono tabular-nums text-slate-400">#{tool.toolNumber}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-orange-200/80 inline-block">
                    <code className="text-xs font-mono font-bold text-[#EA580C]">
                      {tool.formulaBadge}
                    </code>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 truncate max-w-[190px]">{tool.path}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#F97316] group-hover:text-[#EA580C] whitespace-nowrap">
                    <span>Open Solver</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <MeetOurExpertTutors onNavigate={onNavigate} subjectHint="University Mathematics & Statistics" />

      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
