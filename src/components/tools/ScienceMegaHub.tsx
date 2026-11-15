import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import {
  BIOLOGY_SUBCATEGORIES,
  BIOLOGY_TOOLS,
  CHEMISTRY_SUBCATEGORIES,
  CHEMISTRY_TOOLS,
  ScienceCategory,
  ScienceSubCategory,
  ScienceToolItem,
} from '../../data/scienceToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from '../SiteFooter';
import {
  SCIENCE_TOOL_VISUAL_META,
  ScienceCategoryIcon,
  ScienceFormulaGraphic,
  ScienceToolGraphic,
} from './ScienceHubVisuals';

interface ScienceMegaHubProps {
  category: ScienceCategory;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

const DEFAULT_SAVED_BY_CAT: Record<ScienceCategory, string[]> = {
  Biology: ['punnett-square-calculator', 'pcr-master-mix-calculator'],
  Chemistry: ['molar-mass-calculator', 'ph-buffer-calculator'],
};

const QUICK_SEARCH_BY_CAT: Record<
  ScienceCategory,
  Array<{ label: string; query: string }>
> = {
  Biology: [
    { label: 'Punnett', query: 'Punnett' },
    { label: 'PCR & Tm', query: 'PCR' },
    { label: 'CRISPR', query: 'CRISPR' },
    { label: 'Dilution C₁V₁', query: 'Dilution' },
    { label: 'Hardy-Weinberg', query: 'Hardy' },
  ],
  Chemistry: [
    { label: 'Molar Mass', query: 'Molar Mass' },
    { label: 'pH & Buffer', query: 'pH' },
    { label: 'Titration', query: 'Titration' },
    { label: 'VSEPR 3D', query: 'VSEPR' },
    { label: 'IR & NMR', query: 'NMR' },
  ],
};

const MOBILE_SHORT_SUBCAT: Record<ScienceSubCategory, string> = {
  'Genetics & Molecular Biology': 'Genetics & DNA',
  'Cell Biology & Lab Prep': 'Cell & Lab Prep',
  'Ecology, Botany & Physiology': 'Ecology & Physio',
  'General & Stoichiometry': 'General & Stoich',
  'Solutions, Acids & Thermodynamics': 'Acids & Thermo',
  'Organic & Analytical Chemistry': 'Organic & Spectra',
};

const ATOMIC_QUICK_MASS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45,
  K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.87, I: 126.9,
};

function quickEvaluateSciencePreview(tool: ScienceToolItem, rawInput: string): string | null {
  const input = rawInput.trim();
  if (!input) return null;

  if (tool.slug === 'molar-mass-calculator' || tool.slug === 'degree-of-unsaturation-ihd-calculator') {
    const clean = input.split(' ')[0].trim();
    if (/^[A-Za-z0-9()]+$/.test(clean)) {
      const tokenMatches = clean.match(/([A-Z][a-z]?)(\d*)/g);
      if (tokenMatches && tokenMatches.join('') === clean) {
        const counts: Record<string, number> = {};
        let valid = true;
        for (const tok of tokenMatches) {
          const m = tok.match(/^([A-Z][a-z]?)(\d*)$/);
          if (!m || !ATOMIC_QUICK_MASS[m[1]]) {
            valid = false;
            break;
          }
          counts[m[1]] = (counts[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        if (valid) {
          if (tool.slug === 'molar-mass-calculator') {
            const total = Object.entries(counts).reduce((s, [el, c]) => s + ATOMIC_QUICK_MASS[el] * c, 0);
            return `Molar Mass(${clean}) = ${total.toFixed(3)} g/mol (Open Full Solver for hydration & % mass breakdown)`;
          } else {
            const C = counts.C || 0;
            const H = counts.H || 0;
            const N = counts.N || 0;
            const X = (counts.F || 0) + (counts.Cl || 0) + (counts.Br || 0) + (counts.I || 0);
            const ihd = (2 * C + 2 + N - H - X) / 2;
            return `IHD(${clean}) = ${ihd} degrees of unsaturation (Rings + pi bonds)`;
          }
        }
      }
    }
  }

  if (tool.slug === 'dna-rna-protein-translator') {
    const seq = input.replace(/[^ACGTUacgtu]/g, '').toUpperCase().replace(/T/g, 'U');
    if (seq.length >= 3) {
      const codons = seq.match(/.{1,3}/g) || [];
      return `mRNA (${seq.length} nt): 5′-${codons.slice(0, 6).join(' ')}${codons.length > 6 ? '...' : ''}-3′`;
    }
  }

  return null;
}

function getStorageKey(category: ScienceCategory): string {
  return category === 'Biology' ? 'ut_saved_bio_tools' : 'ut_saved_chem_tools';
}

function loadSavedSlugs(category: ScienceCategory): string[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_BY_CAT[category];
  try {
    const raw = window.localStorage.getItem(getStorageKey(category));
    if (!raw) return DEFAULT_SAVED_BY_CAT[category];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string');
    }
  } catch {
    // Ignore storage read blocks
  }
  return DEFAULT_SAVED_BY_CAT[category];
}

export default function ScienceMegaHub({
  category,
  onNavigate,
  onOpenBecomeTutor,
}: ScienceMegaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState<'all' | ScienceSubCategory>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedSlugs, setSavedSlugs] = useState<string[]>(() => loadSavedSlugs(category));
  const [modalTool, setModalTool] = useState<ScienceToolItem | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [quickOutput, setQuickOutput] = useState('Result: Ready for input...');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const quickInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedSubCat('all');
    setSearchQuery('');
    setShowSavedOnly(false);
    setModalTool(null);
    setSavedSlugs(loadSavedSlugs(category));
  }, [category]);

  useEffect(() => {
    try {
      window.localStorage.setItem(getStorageKey(category), JSON.stringify(savedSlugs));
    } catch {
      // Ignore storage blocks
    }
  }, [category, savedSlugs]);

  const tools = category === 'Biology' ? BIOLOGY_TOOLS : CHEMISTRY_TOOLS;
  const subCategories: ScienceSubCategory[] =
    category === 'Biology' ? BIOLOGY_SUBCATEGORIES : CHEMISTRY_SUBCATEGORIES;

  // Inject ItemList JSON-LD
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
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2400);
  };

  const savedSet = useMemo(() => new Set(savedSlugs), [savedSlugs]);

  const toggleBookmark = (e: React.MouseEvent, tool: ScienceToolItem) => {
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
    return tools.filter((t) => {
      if (selectedSubCat !== 'all' && t.subCategory !== selectedSubCat) return false;
      if (showSavedOnly && !savedSet.has(t.slug)) return false;
      if (!q) return true;
      const vMeta = SCIENCE_TOOL_VISUAL_META[t.slug];
      return (
        t.title.toLowerCase().includes(q) ||
        t.shortTitle.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.formulaBadge.toLowerCase().includes(q) ||
        t.subCategory.toLowerCase().includes(q) ||
        vMeta.useCase.toLowerCase().includes(q) ||
        t.seoKeywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [q, savedSet, selectedSubCat, showSavedOnly, tools]);

  const activeCountLabel = useMemo(() => {
    if (showSavedOnly) {
      return `${filteredTools.length} saved tool${filteredTools.length === 1 ? '' : 's'}`;
    }
    if (filteredTools.length === tools.length) {
      return `Showing all ${tools.length} ${category.toLowerCase()} solvers`;
    }
    return `${filteredTools.length} matching solver${filteredTools.length === 1 ? '' : 's'}`;
  }, [category, filteredTools.length, showSavedOnly, tools.length]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  const openSolverModal = (tool: ScienceToolItem) => {
    const meta = SCIENCE_TOOL_VISUAL_META[tool.slug];
    setModalTool(tool);
    setQuickInput(meta.sampleInput);
    setQuickOutput(`Verified Result: ${meta.sampleOutput}`);
  };

  const resetSampleInput = () => {
    if (!modalTool) return;
    const meta = SCIENCE_TOOL_VISUAL_META[modalTool.slug];
    setQuickInput(meta.sampleInput);
    setQuickOutput(`Verified Result: ${meta.sampleOutput}`);
  };

  const runQuickSolve = () => {
    if (!modalTool) return;
    const trimmed = quickInput.trim();
    if (!trimmed) {
      setQuickOutput('Please enter a value or tap Reset Example.');
      return;
    }
    const meta = SCIENCE_TOOL_VISUAL_META[modalTool.slug];
    if (trimmed === meta.sampleInput) {
      setQuickOutput(`Verified Result: ${meta.sampleOutput}`);
      return;
    }
    const computed = quickEvaluateSciencePreview(modalTool, trimmed);
    if (computed) {
      setQuickOutput(computed);
      return;
    }
    setQuickOutput(
      `Ready to run "${trimmed}" — tap Open Full Lab Solver below for complete step-by-step graphs & PDF export.`
    );
  };

  const resetFilters = () => {
    setSelectedSubCat('all');
    setShowSavedOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Breadcrumb + Cross-Hub Switcher Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-slate-500">
            <a
              href="/"
              onClick={(e) => handleAnchor(e, 'home')}
              className="hover:text-[#0F172A] transition-colors font-medium"
            >
              University-Tutors.com
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a
              href="/tools"
              onClick={(e) => handleAnchor(e, 'tools')}
              className="hover:text-[#0F172A] transition-colors font-medium"
            >
              Free Student Tools
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#0F172A]">
              {category} Suite ({tools.length} Tools)
            </span>
          </nav>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <a
              href="/tools/biology"
              onClick={(e) => handleAnchor(e, 'tools/biology')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                category === 'Biology'
                  ? 'bg-[#EA580C] text-white'
                  : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              <ScienceCategoryIcon category="Biology" subCategory="All" className="w-3.5 h-3.5" />
              <span>Biology (14)</span>
            </a>
            <a
              href="/tools/chemistry"
              onClick={(e) => handleAnchor(e, 'tools/chemistry')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                category === 'Chemistry'
                  ? 'bg-[#EA580C] text-white'
                  : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              <ScienceCategoryIcon category="Chemistry" subCategory="All" className="w-3.5 h-3.5" />
              <span>Chemistry (16)</span>
            </a>
            <a
              href="/tools/math"
              onClick={(e) => handleAnchor(e, 'tools/math')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-orange-300 font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Math (27)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero, Search & Custom Subject SVG Category Filter Section */}
      <section className="bg-[#FFFFFF] math-grid-bg border-b border-slate-200/80 pt-5 pb-4 sm:pt-8 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row + Saved Bookmarks Filter */}
          <div className="mb-3.5 sm:mb-5 flex items-start justify-between gap-3">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-[#EA580C] text-[11px] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free {category} Lab &amp; Exam Suite</span>
                <span className="hidden sm:inline text-orange-400">·</span>
                <span className="hidden sm:inline">{tools.length} Interactive Browser Solvers + Branded PDF Reports</span>
              </div>

              <h1 className="md:hidden text-xl font-extrabold text-slate-900 tracking-tight">
                {category === 'Biology' ? 'Interactive Biology Solvers' : 'Interactive Chemistry Solvers'}
              </h1>
              <h1
                className="hidden md:block text-3xl lg:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {category === 'Biology'
                  ? 'Free Biology, Genetics & Molecular Lab Calculators'
                  : 'Free Chemistry, Stoichiometry & Spectroscopy Calculators'}
              </h1>

              <p className="md:hidden text-xs text-slate-500 mt-0.5">
                Tap any solver to test sample values, open full-screen, or export lab PDFs.
              </p>
              <p className="hidden md:block text-sm lg:text-base text-slate-600 mt-2 leading-relaxed">
                {category === 'Biology'
                  ? 'Simulate Punnett crosses, translate DNA → mRNA → protein, design PCR master mixes and CRISPR guides, run virtual restriction agarose gels, and solve Hardy-Weinberg, CFU/mL, water potential, and physiology equations.'
                  : 'Explore an interactive periodic table, balance redox reactions, compute limiting reagents and buffer pH, plot titration and Beer-Lambert curves, inspect 3D VSEPR geometry, and look up IR/NMR peaks with instant lab PDF reports.'}
              </p>
            </div>

            {/* Saved / Bookmarked Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowSavedOnly((v) => !v)}
              aria-pressed={showSavedOnly}
              aria-label={`Filter saved ${category} tools`}
              className={`shrink-0 mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-2xl border text-xs font-bold active:scale-95 transition shadow-2xs cursor-pointer ${
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

          {/* Enhanced Search Input + Popular Suggestions */}
          <div className="max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-600 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  category === 'Biology'
                    ? 'Type topic or formula (e.g., Punnett, PCR, CRISPR, CFU, Osmolarity...)'
                    : 'Type topic or formula (e.g., Molar Mass, Titration, Buffer, VSEPR, NMR...)'
                }
                aria-label={`Search ${tools.length} ${category} tools`}
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
              {QUICK_SEARCH_BY_CAT[category].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSearchQuery(item.query)}
                  className="compact-pill-btn shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-[#EA580C] text-slate-600 transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Swipeable (Mobile) / Wrapping (Desktop) Category Filter Strip */}
          <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Filter by {category} Sub-Discipline
              </span>
              <span className="text-[11px] font-semibold text-[#EA580C] tabular-nums">
                {activeCountLabel}
              </span>
            </div>

            <div
              className="flex md:flex-wrap gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar py-1"
              role="tablist"
              aria-label={`Filter ${category} tools by sub-discipline`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedSubCat === 'all'}
                onClick={() => setSelectedSubCat('all')}
                className={`shrink-0 inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 border cursor-pointer ${
                  selectedSubCat === 'all'
                    ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-md shadow-orange-600/20'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <span className={selectedSubCat === 'all' ? 'text-white shrink-0' : 'text-[#EA580C] shrink-0'}>
                  <ScienceCategoryIcon category={category} subCategory="All" className="w-6 h-6" />
                </span>
                <span className="md:hidden">All {tools.length}</span>
                <span className="hidden md:inline">All {tools.length} {category} Tools</span>
              </button>

              {subCategories.map((sub) => {
                const isActive = selectedSubCat === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedSubCat(sub)}
                    className={`shrink-0 inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 border cursor-pointer ${
                      isActive
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-md shadow-orange-600/20'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <span className={isActive ? 'text-white shrink-0' : 'text-[#EA580C] shrink-0'}>
                      <ScienceCategoryIcon category={category} subCategory={sub} className="w-6 h-6" />
                    </span>
                    <span className="md:hidden">{MOBILE_SHORT_SUBCAT[sub]}</span>
                    <span className="hidden md:inline">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Science Tool Cards Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-9 flex-1">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              No matching {category.toLowerCase()} solver
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs">
              Try a different keyword or reset your filters to view all {tools.length} {category.toLowerCase()} tools.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#EA580C] text-white text-xs font-semibold shadow-sm hover:bg-orange-700 transition cursor-pointer"
            >
              Show All {tools.length} Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTools.map((tool) => {
              const meta = SCIENCE_TOOL_VISUAL_META[tool.slug];
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
                    {/* Top Row: 64x64 Scientific Graphic + Meta + Bookmark */}
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
                        <ScienceToolGraphic slug={tool.slug} className="w-16 h-16 drop-shadow-sm" />
                      </a>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold text-slate-500 truncate">
                              {tool.subCategory}
                            </span>
                            <span className="hidden sm:inline text-[10px] font-mono text-slate-400 tabular-nums">
                              #{String(tool.toolNumber).padStart(2, '0')}
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
                            aria-label={
                              isSaved
                                ? `Remove ${tool.shortTitle} bookmark`
                                : `Bookmark ${tool.shortTitle}`
                            }
                            aria-pressed={isSaved}
                            className="compact-pill-btn shrink-0 p-1.5 -mr-1 -mt-1 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${isSaved ? 'text-amber-500 fill-amber-400' : ''}`}
                            />
                          </button>
                        </div>

                        <h2 className="mt-1 text-[15px] sm:text-base font-extrabold text-slate-900 group-hover:text-[#EA580C] transition-colors leading-snug">
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

                  {/* Card Footer: Formula Graphic Badge + Actions */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="bg-slate-50/90 border border-slate-200/80 px-2.5 py-1.5 rounded-xl overflow-hidden min-w-0">
                      <ScienceFormulaGraphic slug={tool.slug} fallbackBadge={tool.formulaBadge} />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSolverModal(tool);
                        }}
                        className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 text-[11px] font-bold text-slate-700 hover:text-[#EA580C] transition-colors cursor-pointer"
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
                        className="inline-flex items-center gap-1 bg-orange-600/10 group-hover:bg-[#EA580C] text-[#EA580C] group-hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
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

      <MeetOurExpertTutors onNavigate={onNavigate} subjectHint={category} />

      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>

      {/* Interactive Lab Solver Preview Bottom Sheet Modal */}
      {modalTool && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="science-preview-modal-title"
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
                  <ScienceToolGraphic slug={modalTool.slug} className="w-16 h-16 drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C] block">
                    {modalTool.subCategory} · Tool #{modalTool.toolNumber}
                  </span>
                  <h3
                    id="science-preview-modal-title"
                    className="text-base font-extrabold text-slate-900 leading-snug"
                  >
                    {modalTool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {SCIENCE_TOOL_VISUAL_META[modalTool.slug].useCase}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalTool(null)}
                aria-label="Close preview"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
                <span>TEST SAMPLE OR LIVE FORMULA</span>
                <button
                  type="button"
                  onClick={resetSampleInput}
                  className="compact-pill-btn text-[#EA580C] hover:underline font-bold cursor-pointer"
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
                  aria-label={`Quick ${category.toLowerCase()} solver input`}
                  className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                />
                <button
                  type="button"
                  onClick={runQuickSolve}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition shrink-0 cursor-pointer"
                >
                  Check
                </button>
              </div>

              <div className="mt-2.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2.5 leading-relaxed">
                {quickOutput}
              </div>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setModalTool(null)}
                className="flex-1 py-3 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-98 transition cursor-pointer"
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
                className="flex-[1.5] py-3 min-h-[44px] rounded-xl bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-600/20 hover:bg-orange-700 active:scale-98 transition text-center inline-flex items-center justify-center"
              >
                Open Full Lab Solver →
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
