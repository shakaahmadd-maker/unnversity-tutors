import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Expand,
  FileDown,
  Maximize2,
  MessageCircle,
  Minimize2,
  Shrink,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  CS_TOOLS_LIST,
  CsToolDefinition,
} from '../../../data/csToolsRegistry';
import { isModifiedAnchorClick } from '../../../data/dedicatedServiceRoutes';
import {
  AcademicPdfSection,
  downloadAcademicReportPdf,
  getBrandLogoForPdf,
} from '../../../utils/pdfReportGenerator';
import CsRealLifeExamples from './CsRealLifeExamples';
import SiteFooter from '../SiteFooter';
import MeetOurExpertTutors from '../MeetOurExpertTutors';

export interface CustomPdfReportPayload {
  subtitle?: string;
  metadataRows?: Array<{ label: string; value: string }>;
  sections: AcademicPdfSection[];
}

interface CsToolShellContextValue {
  tool: CsToolDefinition | null;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  setFullScreen: (value: boolean) => void;
  isWide: boolean;
  toggleWide: () => void;
  exportPdf: (opts?: {
    title?: string;
    category?: string;
    description?: string;
    outputText?: string | null;
    customReport?: CustomPdfReportPayload | null;
  }) => Promise<void>;
}

const CsToolShellContext = createContext<CsToolShellContextValue>({
  tool: null,
  isFullScreen: false,
  toggleFullScreen: () => {},
  setFullScreen: () => {},
  isWide: false,
  toggleWide: () => {},
  exportPdf: async () => {},
});

export function useCsToolShell() {
  return useContext(CsToolShellContext);
}

export interface CsToolWorkspaceHeaderProps {
  title: string;
  category: string;
  description: string;
  onLoadSample?: () => void;
  sampleLabel?: string;
  onCopyOutput?: () => string | null;
  copyLabel?: string;
  onClear?: () => void;
  onBuildPdfReport?: () => CustomPdfReportPayload | null;
  extraActions?: React.ReactNode;
}

export function CsToolWorkspaceHeader({
  title,
  category,
  description,
  onLoadSample,
  sampleLabel = 'Load Sample Example',
  onCopyOutput,
  copyLabel = 'Copy Output',
  onClear,
  onBuildPdfReport,
  extraActions,
}: CsToolWorkspaceHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const shell = useCsToolShell();

  const handleCopy = async () => {
    if (!onCopyOutput) return;
    const text = onCopyOutput();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const customReport = onBuildPdfReport ? onBuildPdfReport() : null;
      const outputText = onCopyOutput ? onCopyOutput() : null;
      await shell.exportPdf({
        title,
        category,
        description,
        outputText,
        customReport,
      });
    } finally {
      window.setTimeout(() => setExportingPdf(false), 450);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-5 border-b border-slate-200/80">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="text-orange-700 font-semibold">{category}</span>
          <span aria-hidden="true">·</span>
          <span>100% Client-Side</span>
          <span aria-hidden="true">·</span>
          <span>PDF &amp; Full-Screen Ready</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display text-balance">
          {title}
        </h1>
        {!shell.isFullScreen && (
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {extraActions}
        {onLoadSample && (
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sampleLabel}</span>
          </button>
        )}
        {onCopyOutput && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{copyLabel}</span>
              </>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={exportingPdf}
          aria-label="Download branded PDF report of results"
          title="Download PDF of Results"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-70 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>{exportingPdf ? 'Building PDF...' : 'PDF of Results'}</span>
        </button>
        <button
          type="button"
          onClick={shell.toggleFullScreen}
          aria-pressed={shell.isFullScreen}
          aria-label={shell.isFullScreen ? 'Exit full screen mode' : 'Expand tool to full screen'}
          title={shell.isFullScreen ? 'Exit Full Screen (Esc)' : 'Expand Full Screen'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            shell.isFullScreen
              ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
              : 'bg-orange-50/70 border-orange-200 text-orange-700 hover:bg-orange-100'
          }`}
        >
          {shell.isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Expand</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand</span>
            </>
          )}
        </button>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}

export interface CsTutoringCtaBannerProps {
  onNavigate?: (view: string) => void;
}

export function CsTutoringCtaBanner({ onNavigate }: CsTutoringCtaBannerProps) {
  return (
    <section
      aria-label="Computer Science Tutoring Support"
      className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
    >
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-orange-400">
          University Tutors · Verified CS &amp; Software Engineering Mentors
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display text-balance">
          Stuck on a Computer Science Assignment or Coding Lab?
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Get 1-on-1 code debugging, algorithm walkthroughs, and 100% human-written coursework help from vetted CS tutors.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <a
          href="/book?subject=computer-science"
          onClick={(e) => {
            if (!onNavigate || isModifiedAnchorClick(e)) return;
            e.preventDefault();
            onNavigate('book?subject=computer-science');
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <span>Get CS Tutoring Help &rarr;</span>
        </a>
        <a
          href="/whatsapp"
          onClick={(e) => {
            if (!onNavigate || isModifiedAnchorClick(e)) return;
            e.preventDefault();
            onNavigate('whatsapp');
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-transparent hover:bg-white/10 text-white border border-slate-600 hover:border-slate-400 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-orange-400" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </section>
  );
}

export interface CsToolSeoSectionProps {
  tool: CsToolDefinition;
}

export function CsToolSeoSection({ tool }: CsToolSeoSectionProps) {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);
  const allFaqsExpanded = openFaqIndices.length === tool.faqs.length;

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAllFaqs = () => {
    setOpenFaqIndices(allFaqsExpanded ? [] : tool.faqs.map((_, i) => i));
  };

  return (
    <section
      aria-label="Guide, Key Concepts, FAQs and Search Topics"
      className="space-y-6 pt-2"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: How to Use This Tool + Popular Search Keywords */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-orange-700">Step-by-Step Workflow</p>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                How to Use This Tool
              </h2>
            </div>

            <ol className="space-y-4">
              {tool.howToUse.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* High-Search-Volume Keywords & Study Topics Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
              <Tag className="w-3.5 h-3.5" />
              <span>Popular Searches &amp; CS Coursework Topics</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Relevant High-Volume Keywords for {tool.shortTitle}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tool.keywords.map((kw) => (
                <li
                  key={kw}
                  className="px-3 py-2 rounded-lg bg-[#FAF6F0] border border-slate-200/90 text-xs font-medium text-slate-800"
                >
                  {kw}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Key Concepts, Formulas & Expandable FAQs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-orange-700">Reference Sheet</p>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Key Concepts &amp; Formulas
              </h2>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {tool.keyConcepts.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 space-y-1">
                  <div className="text-xs font-semibold text-slate-900">{item.label}</div>
                  <div className="font-mono text-xs text-slate-700 leading-relaxed break-words">
                    {item.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
              <button
                type="button"
                onClick={toggleAllFaqs}
                className="text-xs font-semibold text-orange-700 hover:text-orange-800 cursor-pointer"
              >
                {allFaqsExpanded ? 'Collapse All FAQs' : 'Expand All FAQs'}
              </button>
            </div>
            <div className="space-y-2">
              {tool.faqs.map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-colors ${
                      isOpen
                        ? 'bg-orange-50/30 border-orange-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
                          isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface CsToolPageShellProps {
  tool: CsToolDefinition;
  onNavigate?: (view: string) => void;
  onOpenBecomeTutor?: () => void;
  children: React.ReactNode;
}

export function CsToolPageShell({
  tool,
  onNavigate,
  onOpenBecomeTutor,
  children,
}: CsToolPageShellProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const relatedTools = CS_TOOLS_LIST.filter((t) => t.slug !== tool.slug).slice(0, 3);

  useEffect(() => {
    void getBrandLogoForPdf();
  }, []);

  useEffect(() => {
    if (!isFullScreen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullScreen]);

  const exportPdf = useCallback(
    async (opts?: {
      title?: string;
      category?: string;
      description?: string;
      outputText?: string | null;
      customReport?: CustomPdfReportPayload | null;
    }) => {
      const reportTitle = opts?.title || tool.title;
      const reportCategory = opts?.category || tool.category;
      const custom = opts?.customReport;

      const sections: AcademicPdfSection[] = [];
      if (custom && custom.sections.length > 0) {
        sections.push(...custom.sections);
      } else {
        const rawOut = (opts?.outputText || '').trim();
        sections.push({
          heading: 'Computed Output & Workspace Results',
          lines: rawOut
            ? rawOut.split('\n')
            : ['Workspace ready. Enter parameters or load a sample example before exporting.'],
          monospace: true,
        });
      }

      sections.push({
        heading: 'Key Computer Science Concepts & Formulas',
        lines: tool.keyConcepts.map((kc) => `${kc.label}: ${kc.formula}`),
        monospace: false,
      });

      sections.push({
        heading: 'Relevant Study Topics & Keywords',
        lines: [tool.keywords.join(' · ')],
        monospace: false,
      });

      const defaultMetaRows = [
        { label: 'Tool Module', value: reportTitle },
        { label: 'CS Domain', value: reportCategory },
        { label: 'Canonical URL', value: `https://university-tutors.com${tool.path}` },
        { label: 'Execution Mode', value: '100% Browser-Native Client-Side Engine' },
      ];

      await downloadAcademicReportPdf({
        filename: `${tool.slug}-results-university-tutors.pdf`,
        title: reportTitle,
        subtitle: custom?.subtitle || opts?.description || tool.summary,
        badgeText: `${reportCategory} Lab Report`,
        metadataRows: custom?.metadataRows?.length ? custom.metadataRows : defaultMetaRows,
        sections,
        accentHex: '#EA580C',
      });
    },
    [tool]
  );

  const shellValue: CsToolShellContextValue = {
    tool,
    isFullScreen,
    toggleFullScreen: () => setIsFullScreen((prev) => !prev),
    setFullScreen: setIsFullScreen,
    isWide,
    toggleWide: () => setIsWide((prev) => !prev),
    exportPdf,
  };

  return (
    <CsToolShellContext.Provider value={shellValue}>
      <div className="w-full bg-[#FAF6F0] min-h-screen flex flex-col text-slate-900">
        <div className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className={`${isWide ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto space-y-8 transition-all`}>
          {/* Local Breadcrumb + Quick Expand Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href="/tools/computer-science"
              onClick={(e) => {
                if (!onNavigate || isModifiedAnchorClick(e)) return;
                e.preventDefault();
                onNavigate('tools/computer-science');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Computer Science Tools Hub</span>
            </a>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                {tool.path}
              </span>
              <button
                type="button"
                onClick={() => setIsWide((w) => !w)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
                title={isWide ? 'Switch to standard width' : 'Expand workspace width'}
              >
                {isWide ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
                <span>{isWide ? 'Standard Width' : 'Expand Width'}</span>
              </button>
            </div>
          </div>

          {/* Main Standalone Interactive Workspace (Expandable to Full-Screen Overlay) */}
          <div
            id="cs-tool-workspace"
            data-fullscreen={isFullScreen ? 'true' : 'false'}
            className={
              isFullScreen
                ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-white overflow-y-auto overscroll-contain p-4 sm:p-7 space-y-6'
                : 'bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-6'
            }
          >
            {children}
          </div>

          {/* Conversion Banner directly below output workspace */}
          <CsTutoringCtaBanner onNavigate={onNavigate} />

          {/* Real-Life Graphical Example & Worked Industry Case Studies */}
          <CsRealLifeExamples tool={tool} onNavigate={onNavigate} />

          {/* Educational 2-Column SEO Block + High-Volume Keywords & Expandable FAQs */}
          <CsToolSeoSection tool={tool} />

          {/* Related Computer Science Tools */}
          <section aria-label="More Computer Science Tools" className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Explore More CS Tools
              </h2>
              <a
                href="/tools/computer-science"
                onClick={(e) => {
                  if (!onNavigate || isModifiedAnchorClick(e)) return;
                  e.preventDefault();
                  onNavigate('tools/computer-science');
                }}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
              >
                <span>View all 10 CS tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedTools.map((rel) => (
                <a
                  key={rel.slug}
                  href={rel.path}
                  onClick={(e) => {
                    if (!onNavigate || isModifiedAnchorClick(e)) return;
                    e.preventDefault();
                    onNavigate(rel.viewKey);
                  }}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-orange-400 p-4 flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">{rel.category}</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {rel.shortTitle}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {rel.summary}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 inline-flex items-center gap-1">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              ))}
            </div>
          </section>
          </div>
        </div>

        <MeetOurExpertTutors
          onNavigate={onNavigate || (() => {})}
          subjectHint={tool.shortTitle}
        />

        <div className="mt-auto">
          <SiteFooter
            onNavigate={onNavigate || (() => {})}
            onOpenBecomeTutor={onOpenBecomeTutor}
          />
        </div>
      </div>
    </CsToolShellContext.Provider>
  );
}
