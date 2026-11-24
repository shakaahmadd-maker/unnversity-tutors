import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Binary,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  Expand,
  FileDown,
  Gauge,
  GitBranch,
  Maximize2,
  Minimize2,
  Network,
  Regex,
  Search,
  ShieldCheck,
  Shrink,
  Tag,
} from 'lucide-react';
import {
  CS_HUB_KEYWORDS,
  CS_TOOLS_LIST,
  CS_TOOL_CATEGORIES,
  CsToolCategory,
  CsToolSlug,
} from '../../../data/csToolsRegistry';
import { CS_REAL_LIFE_DATA } from '../../../data/csRealLifeData';
import { isModifiedAnchorClick } from '../../../data/dedicatedServiceRoutes';
import { downloadAcademicReportPdf } from '../../../utils/pdfReportGenerator';
import { CsExampleDiagram } from './CsExampleDiagram';
import { CsTutoringCtaBanner } from './CsToolShared';
import SiteFooter from '../SiteFooter';
import MeetOurExpertTutors from '../MeetOurExpertTutors';

interface CsToolsHubProps {
  onNavigate?: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

const TOOL_ICONS: Record<CsToolSlug, React.ReactNode> = {
  'sql-playground': <Database className="w-5 h-5" />,
  'truth-table-generator': <Cpu className="w-5 h-5" />,
  'binary-hex-converter': <Binary className="w-5 h-5" />,
  'algorithm-visualizer': <BarChart3 className="w-5 h-5" />,
  'data-structure-visualizer': <GitBranch className="w-5 h-5" />,
  'subnet-calculator': <Network className="w-5 h-5" />,
  'regex-tester': <Regex className="w-5 h-5" />,
  'big-o-calculator': <Gauge className="w-5 h-5" />,
  'code-formatter-diff': <Code2 className="w-5 h-5" />,
  'crypto-jwt-tool': <ShieldCheck className="w-5 h-5" />,
};

export default function CsToolsHub({ onNavigate, onOpenBecomeTutor }: CsToolsHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<CsToolCategory>('All Tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [exportingHubPdf, setExportingHubPdf] = useState(false);

  useEffect(() => {
    if (!isFullScreen || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullScreen]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CS_TOOLS_LIST.filter((tool) => {
      const matchesCat =
        selectedCategory === 'All Tools' || tool.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.shortTitle.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CsToolCategory, number> = {
      'All Tools': CS_TOOLS_LIST.length,
      'Algorithms & Data Structures': 0,
      'Systems & Logic': 0,
      'Databases & Web': 0,
      'Networking & Security': 0,
    };
    CS_TOOLS_LIST.forEach((tool) => {
      counts[tool.category]++;
    });
    return counts;
  }, []);

  const allCardsExpanded =
    filteredTools.length > 0 && filteredTools.every((t) => Boolean(expandedCards[t.slug]));

  const toggleAllCards = () => {
    if (allCardsExpanded) {
      setExpandedCards({});
    } else {
      const next: Record<string, boolean> = {};
      filteredTools.forEach((t) => {
        next[t.slug] = true;
      });
      setExpandedCards(next);
    }
  };

  const toggleCardPreview = (slug: string) => {
    setExpandedCards((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleDownloadHubPdf = async () => {
    setExportingHubPdf(true);
    try {
      await downloadAcademicReportPdf({
        filename: 'university-tutors-computer-science-tools-guide.pdf',
        title: 'Computer Science & Programming Student Tools Suite (10 Interactive Labs)',
        subtitle:
          'Complete formula cheat sheet, real-life engineering scenarios, and URLs for all 10 browser-native Computer Science labs at university-tutors.com.',
        badgeText: 'CS Reference Guide PDF',
        metadataRows: [
          { label: 'Hub URL', value: 'https://university-tutors.com/tools/computer-science' },
          { label: 'Included Tools', value: `${CS_TOOLS_LIST.length} Standalone CS Playgrounds` },
          { label: 'Core Search Topics', value: CS_HUB_KEYWORDS.slice(0, 6).join(', ') },
          { label: 'Execution Mode', value: '100% Client-Side TypeScript, SVG & Web Crypto' },
        ],
        sections: [
          ...CS_TOOLS_LIST.map((tool, i) => ({
            heading: `${i + 1}. ${tool.title} (${tool.path})`,
            lines: [
              tool.summary,
              `Real-Life Example: ${CS_REAL_LIFE_DATA[tool.slug].cases[0].title} — ${CS_REAL_LIFE_DATA[tool.slug].cases[0].verifiedOutcome}`,
              ...tool.keyConcepts.map((kc) => `  • ${kc.label}: ${kc.formula}`),
              `  Keywords: ${tool.keywords.join(', ')}`,
            ],
            monospace: false,
          })),
        ],
        accentHex: '#EA580C',
      });
    } finally {
      window.setTimeout(() => setExportingHubPdf(false), 450);
    }
  };

  return (
    <div
      data-fullscreen={isFullScreen ? 'true' : 'false'}
      className={
        isFullScreen
          ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-[#FAF6F0] overflow-y-auto overscroll-contain text-slate-900 flex flex-col'
          : 'w-full bg-[#FAF6F0] min-h-screen text-slate-900 flex flex-col'
      }
    >
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className={`${isWide || isFullScreen ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto space-y-8 transition-all`}>
        {/* Local Breadcrumb + Expand & PDF Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/tools"
            onClick={(e) => {
              if (!onNavigate || isModifiedAnchorClick(e)) return;
              e.preventDefault();
              onNavigate('tools');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Student Tools</span>
          </a>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 hidden md:inline">
              /tools/computer-science
            </span>
            <button
              type="button"
              onClick={toggleAllCards}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${allCardsExpanded ? 'rotate-180' : ''}`}
              />
              <span>{allCardsExpanded ? 'Collapse Tool Previews' : 'Expand All Graphical Examples'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWide((w) => !w)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
            >
              {isWide ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
              <span>{isWide ? 'Standard Width' : 'Expand Width'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen((fs) => !fs)}
              aria-pressed={isFullScreen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isFullScreen
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHubPdf}
              disabled={exportingHubPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{exportingHubPdf ? 'Building PDF...' : 'PDF Cheat Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Hero / Header Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="text-orange-700 font-semibold">Computer Science &amp; Programming Suite</span>
                <span aria-hidden="true">·</span>
                <span>10 Interactive Labs</span>
                <span aria-hidden="true">·</span>
                <span>Branded PDF Reports &amp; Real-Life Diagrams</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display text-balance">
                Computer Science &amp; Programming Tools
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Zero-latency interactive playgrounds for university CS coursework—run SQL queries, build Boolean circuits, inspect IEEE 754 floats, trace sorting &amp; BST algorithms, calculate CIDR subnets, debug regex, and verify cryptographic hashes directly in your browser.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-80 shrink-0">
              <label htmlFor="cs-tools-search" className="sr-only">
                Search Computer Science tools
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="cs-tools-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SQL, BST, CIDR, Big-O, JWT..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter CS tools by category"
            className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100"
          >
            {CS_TOOL_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      active ? 'text-orange-100' : 'text-slate-400'
                    }`}
                  >
                    {categoryCounts[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tool Grid */}
        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              No Computer Science tools matched &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Tools');
              }}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section
            aria-label="Computer Science Tools Catalog"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredTools.map((tool, index) => {
              const isCardExpanded = Boolean(expandedCards[tool.slug]);
              const realLife = CS_REAL_LIFE_DATA[tool.slug];
              return (
                <article
                  key={tool.slug}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400 p-6 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                        {TOOL_ICONS[tool.slug]}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCardPreview(tool.slug)}
                          aria-expanded={isCardExpanded}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-[11px] font-semibold text-slate-600 hover:text-orange-700 cursor-pointer"
                        >
                          <span>{isCardExpanded ? 'Hide Graphic' : 'Real-Life Preview'}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isCardExpanded ? 'rotate-180 text-orange-600' : ''
                            }`}
                          />
                        </button>
                        <span className="font-mono text-xs text-slate-400 tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-orange-700">
                        {tool.category}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 leading-snug">
                        <a
                          href={tool.path}
                          onClick={(e) => {
                            if (!onNavigate || isModifiedAnchorClick(e)) return;
                            e.preventDefault();
                            onNavigate(tool.viewKey);
                          }}
                          className="hover:text-orange-600 transition-colors"
                        >
                          {tool.title}
                        </a>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {tool.summary}
                      </p>
                    </div>

                    {/* Expandable Graphical Real-Life Example + Top Keywords */}
                    {isCardExpanded && realLife && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
                        <div className="bg-[#FAF6F0] rounded-xl border border-slate-200/80 p-2.5">
                          <div className="text-[11px] font-bold text-orange-700 mb-1.5">
                            {realLife.diagramTitle}
                          </div>
                          <CsExampleDiagram slug={tool.slug} />
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">High-Volume Keywords:</strong>{' '}
                          {tool.keywords.slice(0, 5).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-400 truncate">
                      {tool.path}
                    </span>
                    <a
                      href={tool.path}
                      onClick={(e) => {
                        if (!onNavigate || isModifiedAnchorClick(e)) return;
                        e.preventDefault();
                        onNavigate(tool.viewKey);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 shrink-0"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* High-Search-Volume Keywords & Real-Life Applications Index */}
        <section
          aria-label="Popular Computer Science Search Topics"
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700">
                <Tag className="w-3.5 h-3.5" />
                <span>High-Volume CS Student &amp; Developer Searches</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Core Computer Science Concepts Covered Across All 10 Labs
              </h2>
            </div>
            <button
              type="button"
              onClick={handleDownloadHubPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-orange-700 cursor-pointer self-start"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export All 10 Formulas PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CS_HUB_KEYWORDS.map((kw) => (
              <div
                key={kw}
                className="px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-slate-200/80 text-xs font-medium text-slate-800"
              >
                {kw}
              </div>
            ))}
          </div>
        </section>

        {/* Contextual Tutoring CTA Banner */}
        <CsTutoringCtaBanner onNavigate={onNavigate} />
        </div>
      </div>

      {!isFullScreen && (
        <>
          <MeetOurExpertTutors
            onNavigate={onNavigate || (() => {})}
            subjectHint="Computer Science & Programming"
          />
          <div className="mt-auto">
            <SiteFooter
              onNavigate={onNavigate || (() => {})}
              onOpenBecomeTutor={onOpenBecomeTutor}
            />
          </div>
        </>
      )}
    </div>
  );
}
