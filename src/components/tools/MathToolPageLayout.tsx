import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  FileDown,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import {
  getMathTutorBranding,
  MATH_TOOLS_BY_SLUG,
  MathToolItem,
} from '../../data/mathToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import { downloadMathSolutionPdf, getBrandLogoForPdf } from '../../utils/pdfReportGenerator';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from '../SiteFooter';
import { MathCategoryIcon, MathToolGraphic } from './math/MathHubVisuals';
import { MathShellContext } from './math/MathShellContext';
import { MathFormula, MathText } from './math/MathTypeset';
import MathRealLifeExamples from './math/MathRealLifeExamples';

interface MathToolPageLayoutProps {
  tool: MathToolItem;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
  children: React.ReactNode;
}

export default function MathToolPageLayout({
  tool,
  onNavigate,
  onOpenBecomeTutor,
  children,
}: MathToolPageLayoutProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isWorkedExampleOpen, setIsWorkedExampleOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const tutorBranding = getMathTutorBranding(tool.tutorDomain);
  const relatedTools = tool.relatedSlugs
    .map((slug) => MATH_TOOLS_BY_SLUG[slug])
    .filter(Boolean);

  // Preload University-Tutors logo for instant PDF downloads
  useEffect(() => {
    void getBrandLogoForPdf();
  }, []);

  // Lock body scroll & enable Escape-to-exit when calculator is expanded full-screen
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

  // Reset full-screen when switching between sibling math tools
  useEffect(() => {
    setIsFullScreen(false);
  }, [tool.slug]);

  const exportPdfWithSolution = useCallback(
    (solutionText?: string, modeLabel?: string) => {
      const parameters: Array<{ label: string; value: string }> = [];
      let plotSvg: SVGSVGElement | null = null;

      if (workspaceRef.current) {
        const inputs = Array.from(
          workspaceRef.current.querySelectorAll(
            'input:not([type="file"]):not([type="range"]), select, textarea'
          )
        ) as Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

        inputs.slice(0, 8).forEach((el) => {
          const val = String(el.value || '').trim();
          if (!val) return;
          const labelEl = el.id
            ? workspaceRef.current?.querySelector(`label[for="${el.id}"]`)
            : el.closest('div')?.querySelector('label');
          const label =
            labelEl?.textContent?.trim() ||
            el.getAttribute('aria-label') ||
            el.getAttribute('placeholder') ||
            'Parameter';
          parameters.push({ label: label.slice(0, 32), value: val.slice(0, 60) });
        });

        // Locate primary visual mathematical SVG graph/diagram (ignore small lucide UI icons)
        const svgs = Array.from(workspaceRef.current.querySelectorAll('svg')) as SVGSVGElement[];
        let bestArea = 0;
        for (const svg of svgs) {
          const rect = svg.getBoundingClientRect();
          if (rect.width >= 160 && rect.height >= 90) {
            const area = rect.width * rect.height;
            if (area > bestArea) {
              bestArea = area;
              plotSvg = svg;
            }
          }
        }
      }

      const rawLines = (solutionText || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (rawLines.length === 0 && workspaceRef.current) {
        const domLines = (workspaceRef.current.innerText || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(
            (l) =>
              l.length > 1 &&
              l.length < 180 &&
              !/^(Reset|Copy|PDF|Expand|Exit|Examples:)$/i.test(l)
          );
        rawLines.push(...domLines.slice(0, 24));
      }

      void downloadMathSolutionPdf({
        filename: `${tool.slug}-solution.pdf`,
        title: tool.title,
        levelName: tool.levelName,
        tutorDomain: tool.tutorDomain,
        formulaBadge: tool.formulaBadge,
        modeLabel,
        parameters,
        solutionLines: rawLines,
        plotSvg,
        workedExample: tool.workedExample,
      });
    },
    [tool]
  );

  const handleHeroPdfClick = () => {
    if (typeof window !== 'undefined') {
      const ev = new CustomEvent('ut-math-pdf-export', {
        cancelable: true,
        detail: { slug: tool.slug },
      });
      if (!window.dispatchEvent(ev)) {
        return;
      }
    }
    exportPdfWithSolution();
  };

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((fs) => !fs);
  }, []);

  const shellContextValue = useMemo(
    () => ({
      tool,
      isFullScreen,
      setFullScreen: setIsFullScreen,
      toggleFullScreen,
      workspaceRef,
      exportPdfWithSolution,
    }),
    [tool, isFullScreen, toggleFullScreen, exportPdfWithSolution]
  );

  // Inject Schema.org WebApplication + FAQPage JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'math-tool-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `${tool.title} — University-Tutors.com`,
        url: `https://university-tutors.com${tool.path}`,
        applicationCategory: 'EducationalApplication',
        educationalUse: `${tool.levelName} (${tool.tutorDomain})`,
        operatingSystem: 'All',
        description: tool.seoDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ]);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [tool]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <MathShellContext.Provider value={shellContextValue}>
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
        {/* 1. Top Breadcrumb & Privacy Trust Strip */}
        <div className="bg-[#FFFFFF] border-b border-slate-200/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <a
                href="/tools/math"
                onClick={(e) => handleAnchor(e, 'tools/math')}
                className="inline-flex items-center gap-1 font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors mr-1.5 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Math &amp; Stats Hub</span>
              </a>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <a
                  href="/"
                  onClick={(e) => handleAnchor(e, 'home')}
                  className="hover:text-[#111827] transition-colors"
                >
                  University-Tutors.com
                </a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href="/tools/math"
                  onClick={(e) => handleAnchor(e, 'tools/math')}
                  className="hover:text-[#111827] transition-colors"
                >
                  Free Math Tools
                </a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href="/tools/math"
                  onClick={(e) => handleAnchor(e, 'tools/math')}
                  className="hover:text-[#111827] transition-colors"
                >
                  {tool.levelShortLabel}
                </a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-[#111827] truncate max-w-[230px] sm:max-w-none">
                  {tool.shortTitle}
                </span>
              </nav>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-lg self-start lg:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Free &amp; Browser-Based — Instant Step-by-Step Math Results</span>
            </div>
          </div>
        </div>

        {/* 2. Hero Header + Graphic Badge + Typeset Core Relation + Mobile Expand & PDF Actions */}
        <section className="bg-[#FFFFFF] math-grid-bg border-b border-slate-200/80 pt-5 sm:pt-7 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="flex items-start gap-3.5 sm:gap-4 max-w-4xl">
                <div className="shrink-0 mt-0.5">
                  <MathToolGraphic slug={tool.slug} className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm" />
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#EA580C]">
                      <MathCategoryIcon categoryId={tool.levelId} className="w-4 h-4 shrink-0" />
                      <span>{tool.levelName}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tool.tutorDomain}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Tool #{tool.toolNumber} of 27</span>
                  </div>

                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {tool.title}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                    <MathText text={tool.shortDescription} />
                  </p>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
                    <strong className="text-slate-700">When University Students Use This Tool:</strong>{' '}
                    <MathText text={tool.whenUsed} />
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
                <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl px-4 py-2.5 max-w-full">
                  <span className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Core Mathematical Relation
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#EA580C]">
                    <MathFormula expr={tool.formulaBadge} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFullScreen}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-white border border-slate-200 hover:border-[#F97316] text-slate-800 hover:text-[#EA580C] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Expand Full Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleHeroPdfClick}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3.5 h-3.5 shrink-0" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Tool Workspace (Expandable Full-Screen on Mobile & Desktop) */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div
            id="math-tool-workspace"
            ref={workspaceRef}
            className={
              isFullScreen
                ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-[#FFFFFF] flex flex-col overflow-hidden'
                : 'scroll-mt-4'
            }
          >
            <div
              className={
                isFullScreen
                  ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 pb-10'
                  : ''
              }
            >
              {children}
            </div>
          </div>

          {/* Quick Inline Conversion Strip */}
          <div className="mt-6 bg-[#FFF7ED] border border-orange-200/80 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-medium text-[#111827] text-center sm:text-left">
              Need help writing out formal proofs or exam derivations for {tool.tutorDomain}?{' '}
              <span className="text-slate-600">
                Work through your problem set 1-on-1 with a verified mathematics professor or PhD mentor.
              </span>
            </p>
            <a
              href="/tutors"
              onClick={(e) => handleAnchor(e, tutorBranding.ctaView)}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#EA580C] hover:text-[#111827] transition-colors sm:whitespace-nowrap text-center sm:text-left cursor-pointer min-h-[44px] sm:min-h-0"
            >
              <span>{tutorBranding.ctaText} →</span>
            </a>
          </div>
        </section>

        {/* 4. Real-Life Mathematical Applications, Visual SVG Diagrams & Interactive Case Loaders */}
        <MathRealLifeExamples tool={tool} onNavigate={onNavigate} />

        {/* 5. Tailored Educational Content Block (Key Definitions, Worked Exam Example, Common Mistakes & FAQs) */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
          {/* 5A. Key Definitions & Governing Formulas (KaTeX Typeset Equations) */}
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EA580C]">Theoretical Reference</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                Key Definitions &amp; Governing Formulas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tool.definitions.map((def, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-[#111827]">{def.term}</h3>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#FFF7ED] border border-orange-200/80 text-sm font-bold text-[#EA580C] text-center">
                      <MathFormula expr={def.formula} displayMode />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <MathText text={def.explanation} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5B. Worked Step-by-Step University Exam Example + Common Mistakes & 3 FAQs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#EA580C]">Step-by-Step Derivation</p>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                    Worked University Exam Example
                  </h2>
                </div>

                <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsWorkedExampleOpen((o) => !o)}
                    aria-expanded={isWorkedExampleOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpenCheck className="w-4 h-4 text-[#F97316] shrink-0" />
                      <span className="text-sm font-bold text-[#111827]">
                        Exam Problem Walkthrough ({tool.shortTitle})
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        isWorkedExampleOpen ? 'rotate-180 text-[#F97316]' : ''
                      }`}
                    />
                  </button>

                  {isWorkedExampleOpen && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-4">
                      <div className="bg-[#F9FAFB] border border-slate-200/80 rounded-xl p-3.5">
                        <span className="block text-[11px] font-bold text-slate-500">Exam Problem</span>
                        <p className="text-xs sm:text-sm font-medium text-[#111827] mt-1 leading-relaxed">
                          <MathText text={tool.workedExample.problem} />
                        </p>
                      </div>

                      <ol className="space-y-2.5">
                        {tool.workedExample.steps.map((step, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                          >
                            <span className="w-6 h-6 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                              {i + 1}
                            </span>
                            <span className="min-w-0">
                              <MathText text={step} />
                            </span>
                          </li>
                        ))}
                      </ol>

                      <div className="bg-[#FFF7ED] border border-orange-200/80 rounded-xl px-4 py-3">
                        <span className="block text-[11px] font-bold text-[#EA580C]">Verified Final Answer</span>
                        <div className="text-xs sm:text-sm font-bold text-[#111827] mt-1">
                          <MathText text={tool.workedExample.answer} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Common Mistakes & Exam Tips */}
              <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F97316] shrink-0" />
                  <h3 className="text-base font-bold text-[#111827]">
                    Common Mistakes &amp; University Exam Tips
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {tool.commonMistakes.map((tip, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-600 leading-relaxed flex gap-2.5">
                      <span className="font-mono font-bold text-[#EA580C] shrink-0">{idx + 1}.</span>
                      <span>
                        <MathText text={tip} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: 3 Tool-Specific Collapsible FAQs */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#EA580C]">Conceptual Mastery</p>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                  Frequently Asked Questions ({tool.shortTitle})
                </h2>
              </div>

              <div className="space-y-3">
                {tool.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#FFFFFF] border border-slate-200 rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-bold text-[#111827]">
                          <MathText text={faq.question} />
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-[#F97316]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          <MathText text={faq.answer} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Related Math Tools Grid (3 Sibling Solvers) */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#111827] tracking-tight">
                Related {tool.tutorDomain} &amp; University Math Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Continue exploring sibling calculators across our 27-tool mathematics &amp; statistics suite.
              </p>
            </div>
            <a
              href="/tools/math"
              onClick={(e) => handleAnchor(e, 'tools/math')}
              className="text-xs sm:text-sm font-semibold text-[#EA580C] hover:text-[#111827] transition-colors whitespace-nowrap cursor-pointer"
            >
              All 27 Math Tools →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedTools.map((rel) => (
              <a
                key={rel.slug}
                href={rel.path}
                onClick={(e) => handleAnchor(e, rel.viewKey)}
                className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{rel.levelShortLabel}</span>
                    <span className="font-bold text-[#EA580C]">
                      <MathFormula expr={rel.formulaBadge} />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
                  <span>Open {rel.shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 7. Live Active Expert Tutors Directory Section Above Global Footer */}
        <MeetOurExpertTutors onNavigate={onNavigate} subjectHint={tool.shortTitle} />

        {/* 8. Global Website Footer */}
        <div className="mt-auto">
          <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
        </div>
      </div>
    </MathShellContext.Provider>
  );
}
