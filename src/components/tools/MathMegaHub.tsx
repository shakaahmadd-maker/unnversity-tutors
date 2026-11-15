import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import {
  MATH_LEVELS,
  MATH_TOOLS_REGISTRY,
  MathLevelId,
  MathToolItem,
} from '../../data/mathToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from '../SiteFooter';
import {
  MATH_TOOL_VISUAL_META,
  MathCategoryIcon,
  MathFormulaGraphic,
  MathToolGraphic,
} from './math/MathHubVisuals';

interface MathMegaHubProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

const SAVED_STORAGE_KEY = 'ut_saved_math_tools';
const DEFAULT_SAVED_SLUGS = [
  'scientific-expression-evaluator',
  'symbolic-derivative-calculator',
];

const MOBILE_CATEGORY_SHORT_LABELS: Record<MathLevelId, string> = {
  1: 'L1: Algebra',
  2: 'L2: Trig & Geo',
  3: 'L3: Calculus',
  4: 'L4: Linear Alg',
  5: 'L5: Statistics',
  6: 'L6: ODEs & Discrete',
};

const QUICK_SEARCH_TERMS: Array<{ label: string; query: string }> = [
  { label: 'Quadratic', query: 'Quadratic' },
  { label: 'Derivative', query: 'Derivative' },
  { label: 'Matrix RREF', query: 'RREF' },
  { label: 'Integral', query: 'Integral' },
  { label: 'p-Value', query: 'p-value' },
];

const KEYPAD_SYMBOLS: Array<{ label: string; insert: string }> = [
  { label: 'x²', insert: '^2' },
  { label: '√', insert: 'sqrt(' },
  { label: 'π', insert: 'pi' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'i', insert: 'i' },
];

function loadSavedSlugs(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_SLUGS;
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_SLUGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string');
    }
  } catch {
    // Fallback if storage is blocked
  }
  return DEFAULT_SAVED_SLUGS;
}

function trySafeArithmeticPreview(expr: string): string | null {
  const cleaned = expr.trim();
  if (!cleaned) return null;
  if (/[a-zA-Z]/.test(cleaned.replace(/\b(sin|cos|tan|sqrt|log|ln|pi|e|abs)\b/gi, ''))) {
    return null;
  }
  if (!/^[0-9+\-*/().^\s,a-zA-Z]+$/.test(cleaned)) return null;

  try {
    const jsExpr = cleaned
      .replace(/\^/g, '**')
      .replace(/\bpi\b/gi, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\bsqrt\(/gi, 'Math.sqrt(')
      .replace(/\bsin\(/gi, 'Math.sin(')
      .replace(/\bcos\(/gi, 'Math.cos(')
      .replace(/\btan\(/gi, 'Math.tan(')
      .replace(/\babs\(/gi, 'Math.abs(')
      .replace(/\bln\(/gi, 'Math.log(')
      .replace(/\blog\(/gi, 'Math.log10(');

    // Ensure no unsafe tokens slipped through before Function evaluation
    if (/[;{}[\]=]/.test(jsExpr)) return null;
    const fn = new Function(`"use strict"; return (${jsExpr});`);
    const val = fn();
    if (typeof val === 'number' && Number.isFinite(val)) {
      const rounded = Number.isInteger(val) ? String(val) : Number(val.toPrecision(10)).toString();
      return rounded;
    }
  } catch {
    return null;
  }
  return null;
}

export default function MathMegaHub({ onNavigate, onOpenBecomeTutor }: MathMegaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | MathLevelId>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedSlugs, setSavedSlugs] = useState<string[]>(() => loadSavedSlugs());
  const [modalTool, setModalTool] = useState<MathToolItem | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [quickOutput, setQuickOutput] = useState('Result: Ready for input...');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const quickInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Persist bookmarks safely
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedSlugs));
    } catch {
      // Ignore storage errors
    }
  }, [savedSlugs]);

  // Inject Schema.org ItemList JSON-LD
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

  // Escape closes preview modal
  useEffect(() => {
    if (!modalTool) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalTool(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalTool]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  };

  const savedSet = useMemo(() => new Set(savedSlugs), [savedSlugs]);

  const toggleBookmark = (e: React.MouseEvent, tool: MathToolItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedSlugs((prev) => {
      const exists = prev.includes(tool.slug);
      if (exists) {
        showToast('Removed from Saved Tools');
        return prev.filter((s) => s !== tool.slug);
      }
      showToast('Saved to your quick-access list ★');
      return [...prev, tool.slug];
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredTools = useMemo(() => {
    return MATH_TOOLS_REGISTRY.filter((tool) => {
      if (selectedLevel !== 'all' && tool.levelId !== selectedLevel) return false;
      if (showSavedOnly && !savedSet.has(tool.slug)) return false;
      if (!q) return true;
      const visualMeta = MATH_TOOL_VISUAL_META[tool.slug];
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.shortTitle.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.formulaBadge.toLowerCase().includes(q) ||
        tool.levelName.toLowerCase().includes(q) ||
        visualMeta.useCase.toLowerCase().includes(q) ||
        tool.seoKeywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [q, savedSet, selectedLevel, showSavedOnly]);

  const activeCountLabel = useMemo(() => {
    if (showSavedOnly) {
      return `${filteredTools.length} saved tool${filteredTools.length === 1 ? '' : 's'}`;
    }
    if (filteredTools.length === MATH_TOOLS_REGISTRY.length) {
      return 'Showing key solvers (27 total)';
    }
    return `${filteredTools.length} matching solver${filteredTools.length === 1 ? '' : 's'}`;
  }, [filteredTools.length, showSavedOnly]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  const openSolverModal = (tool: MathToolItem) => {
    const meta = MATH_TOOL_VISUAL_META[tool.slug];
    setModalTool(tool);
    setQuickInput(meta.sampleInput);
    setQuickOutput(`Answer: ${meta.sampleOutput}`);
  };

  const resetSampleInput = () => {
    if (!modalTool) return;
    const meta = MATH_TOOL_VISUAL_META[modalTool.slug];
    setQuickInput(meta.sampleInput);
    setQuickOutput(`Answer: ${meta.sampleOutput}`);
  };

  const insertSymbol = (sym: string) => {
    const input = quickInputRef.current;
    if (!input) {
      setQuickInput((prev) => prev + sym);
      return;
    }
    const start = input.selectionStart ?? quickInput.length;
    const end = input.selectionEnd ?? quickInput.length;
    const nextVal = quickInput.slice(0, start) + sym + quickInput.slice(end);
    setQuickInput(nextVal);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  const runQuickSolve = () => {
    const trimmed = quickInput.trim();
    if (!trimmed) {
      setQuickOutput('Please enter a valid mathematical expression.');
      return;
    }
    if (modalTool) {
      const meta = MATH_TOOL_VISUAL_META[modalTool.slug];
      if (trimmed === meta.sampleInput) {
        setQuickOutput(`Answer: ${meta.sampleOutput}`);
        return;
      }
    }
    const numeric = trySafeArithmeticPreview(trimmed);
    if (numeric !== null) {
      setQuickOutput(`Result: ${numeric} (Open Full Solver for complete step-by-step working)`);
      return;
    }
    setQuickOutput(
      `Ready to solve "${trimmed}" — tap Open Full Step-by-Step Solver below for complete working.`
    );
  };

  const resetFilters = () => {
    setSelectedLevel('all');
    setShowSavedOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Breadcrumb + Trust Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-slate-500">
            <a
              href="/"
              onClick={(e) => handleAnchor(e, 'home')}
              className="hover:text-[#0F172A] transition-colors"
            >
              University-Tutors.com
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a
              href="/tools"
              onClick={(e) => handleAnchor(e, 'tools')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Free Student Tools
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#0F172A]">
              Mathematics &amp; Statistics Suite (27 Tools)
            </span>
          </nav>

          <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Free &amp; Browser-Based — Instant Step-by-Step Math Results</span>
          </span>
        </div>
      </div>

      {/* Hero, Search & Custom SVG Category Filter Section */}
      <section className="bg-[#FFFFFF] math-grid-bg border-b border-slate-200/80 pt-5 pb-4 sm:pt-8 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row + Saved Toggle */}
          <div className="mb-3.5 sm:mb-5 flex items-start justify-between gap-3">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-semibold mb-2">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M4 19h16M4 15l4-6 4 4 4-8 4 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Step-by-Step Symbolic Engine</span>
                <span className="hidden sm:inline text-orange-400">·</span>
                <span className="hidden sm:inline">6 Progressive Academic Levels</span>
              </div>

              <h1 className="md:hidden text-xl font-extrabold text-slate-900 tracking-tight">
                Interactive Math Solvers
              </h1>
              <h1
                className="hidden md:block text-3xl lg:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Free University Mathematics, Calculus, Linear Algebra &amp; Statistics Tools
              </h1>

              <p className="md:hidden text-xs text-slate-500 mt-0.5">
                Tap any tool to test an equation or view full steps.
              </p>
              <p className="hidden md:block text-sm lg:text-base text-slate-600 mt-2 leading-relaxed">
                From PEMDAS and quadratic factoring to symbolic derivatives, Gaussian RREF, Welch&apos;s
                t-tests, RK4 slope fields, Fourier synthesis, and RSA modular arithmetic—every solver runs
                100% locally in your browser with step-by-step derivations.
              </p>
            </div>

            {/* Saved / Bookmarked Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowSavedOnly((v) => !v)}
              aria-pressed={showSavedOnly}
              aria-label="Filter saved tools"
              className={`shrink-0 mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold active:scale-95 transition shadow-2xs cursor-pointer ${
                showSavedOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Star
                className={`w-4 h-4 text-amber-500 ${showSavedOnly ? 'fill-amber-400' : ''}`}
              />
              <span className="tabular-nums">Saved ({savedSlugs.length})</span>
            </button>
          </div>

          {/* Enhanced Search Input */}
          <div className="max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-600 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type topic or formula (e.g., Quadratic, Matrix, p-value...)"
                aria-label="Search 27 mathematics and statistics tools"
                className="w-full bg-slate-50/90 focus:bg-white text-sm text-slate-900 placeholder-slate-400 pl-10 pr-10 py-3 rounded-2xl border border-slate-200/90 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="compact-pill-btn absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* One-Tap Quick Search Suggestions */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">Popular:</span>
              {QUICK_SEARCH_TERMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSearchQuery(item.query)}
                  className="compact-pill-btn shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Swipeable (Mobile) / Wrapping (Desktop) Category Strip with Custom Graphics */}
          <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Filter by Course Level
              </span>
              <span className="text-[11px] font-semibold text-orange-600 tabular-nums">
                {activeCountLabel}
              </span>
            </div>

            <div
              className="flex md:flex-wrap gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar py-1"
              role="tablist"
              aria-label="Filter mathematics tools by academic level"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLevel === 'all'}
                onClick={() => setSelectedLevel('all')}
                className={`shrink-0 inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 border cursor-pointer ${
                  selectedLevel === 'all'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/25'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <span className={selectedLevel === 'all' ? 'text-white shrink-0' : 'text-orange-600 shrink-0'}>
                  <MathCategoryIcon categoryId="all" className="w-6 h-6" />
                </span>
                <span className="md:hidden">All 27</span>
                <span className="hidden md:inline">All 27 Tools</span>
              </button>

              {MATH_LEVELS.map((lvl) => {
                const isActive = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`shrink-0 inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 border cursor-pointer ${
                      isActive
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/25'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <span className={isActive ? 'text-white shrink-0' : 'text-orange-600 shrink-0'}>
                      <MathCategoryIcon categoryId={lvl.id} className="w-6 h-6" />
                    </span>
                    <span className="md:hidden">{MOBILE_CATEGORY_SHORT_LABELS[lvl.id]}</span>
                    <span className="hidden md:inline">{lvl.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 27 Math Tool Cards Feed (Mobile) / 3-Column Grid (Desktop) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-9 flex-1">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-800">No matching math solver</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs">
              Try searching for &ldquo;Matrix&rdquo;, &ldquo;Derivative&rdquo;, &ldquo;Complex&rdquo;, or reset your level filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-semibold shadow-sm hover:bg-orange-700 transition cursor-pointer"
            >
              Show All 27 Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTools.map((tool) => {
              const meta = MATH_TOOL_VISUAL_META[tool.slug];
              const isSaved = savedSet.has(tool.slug);

              return (
                <article
                  key={tool.slug}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      openSolverModal(tool);
                    }
                  }}
                  className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 active:scale-[0.99] md:active:scale-100 transition-all flex flex-col justify-between cursor-pointer md:cursor-default"
                >
                  <div>
                    {/* Top Row: Prominent 64x64 Realistic Graphic + Level Meta, Bookmark & Title */}
                    <div className="flex items-start gap-3.5">
                      <a
                        href={tool.path}
                        onClick={(e) => {
                          if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            e.preventDefault();
                            openSolverModal(tool);
                            return;
                          }
                          handleAnchor(e, tool.viewKey);
                        }}
                        aria-label={`Open ${tool.title}`}
                        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                      >
                        <MathToolGraphic slug={tool.slug} className="w-16 h-16 drop-shadow-sm" />
                      </a>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold text-slate-500 truncate">
                              {tool.levelName}
                            </span>
                            <span className="hidden sm:inline text-[10px] font-mono text-slate-400 tabular-nums">
                              #{tool.toolNumber}
                            </span>
                            {meta.popular && (
                              <span className="shrink-0 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                                Popular
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(e, tool)}
                            aria-label={isSaved ? `Remove ${tool.shortTitle} bookmark` : `Bookmark ${tool.shortTitle}`}
                            aria-pressed={isSaved}
                            className="compact-pill-btn shrink-0 p-1.5 -mr-1 -mt-1 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${isSaved ? 'text-amber-500 fill-amber-400' : ''}`}
                            />
                          </button>
                        </div>

                        <h2 className="mt-1 text-[15px] sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                          <a
                            href={tool.path}
                            onClick={(e) => {
                              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                e.preventDefault();
                                return;
                              }
                              handleAnchor(e, tool.viewKey);
                            }}
                            className="focus:outline-none"
                          >
                            {tool.title}
                          </a>
                        </h2>

                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          {meta.useCase}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mt-3 line-clamp-2">
                      {tool.shortDescription}
                    </p>
                  </div>

                  {/* Card Footer: Typeset Mathematical Graphic Badge + Actions */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="bg-slate-50/90 border border-slate-200/80 px-2.5 py-1.5 rounded-xl overflow-hidden min-w-0">
                      <MathFormulaGraphic slug={tool.slug} fallbackBadge={tool.formulaBadge} />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSolverModal(tool);
                        }}
                        className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 text-[11px] font-bold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
                      >
                        Quick Try
                      </button>

                      <a
                        href={tool.path}
                        onClick={(e) => {
                          if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            e.preventDefault();
                            e.stopPropagation();
                            openSolverModal(tool);
                            return;
                          }
                          e.stopPropagation();
                          handleAnchor(e, tool.viewKey);
                        }}
                        className="inline-flex items-center gap-1 bg-orange-600/10 group-hover:bg-orange-600 text-orange-700 group-hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        <span className="md:hidden">Try &amp; Open</span>
                        <span className="hidden md:inline">Open Solver</span>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <MeetOurExpertTutors onNavigate={onNavigate} subjectHint="University Mathematics & Statistics" />

      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>

      {/* Interactive Solver Preview Bottom Sheet Modal */}
      {modalTool && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="math-preview-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalTool(null);
          }}
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
        >
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border-t sm:border border-slate-200 animate-slide-up">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                  <MathToolGraphic slug={modalTool.slug} className="w-16 h-16 drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
                    {modalTool.levelName} · Tool #{modalTool.toolNumber}
                  </span>
                  <h3
                    id="math-preview-modal-title"
                    className="text-base font-extrabold text-slate-900 leading-snug"
                  >
                    {modalTool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {MATH_TOOL_VISUAL_META[modalTool.slug].useCase}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalTool(null)}
                aria-label="Close preview"
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
                <span>TRY AN EQUATION RIGHT NOW</span>
                <button
                  type="button"
                  onClick={resetSampleInput}
                  className="compact-pill-btn text-orange-600 hover:underline font-bold cursor-pointer"
                >
                  Reset Example
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  ref={quickInputRef}
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      runQuickSolve();
                    }
                  }}
                  aria-label="Quick math equation input"
                  className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                />
                <button
                  type="button"
                  onClick={runQuickSolve}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition shrink-0 cursor-pointer"
                >
                  Solve
                </button>
              </div>

              {/* Mobile-Friendly Math Symbol Keypad Helper */}
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">Insert:</span>
                {KEYPAD_SYMBOLS.map((sym) => (
                  <button
                    key={sym.label}
                    type="button"
                    onClick={() => insertSymbol(sym.insert)}
                    className="compact-pill-btn px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700 hover:border-orange-300 active:bg-orange-50 shrink-0 cursor-pointer"
                  >
                    {sym.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2.5 leading-relaxed">
                {quickOutput}
              </div>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setModalTool(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-98 transition cursor-pointer"
              >
                Close
              </button>
              <a
                href={modalTool.path}
                onClick={(e) => {
                  const targetView = modalTool.viewKey;
                  setModalTool(null);
                  handleAnchor(e, targetView);
                }}
                className="flex-[1.4] py-3 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-98 transition text-center inline-flex items-center justify-center"
              >
                Open Full Step-by-Step Solver →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Non-intrusive Toast Notification */}
      <div
        aria-live="polite"
        className={`fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-[130] pointer-events-none transition-opacity duration-200 ${
          toastMsg ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {toastMsg && (
          <div className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
