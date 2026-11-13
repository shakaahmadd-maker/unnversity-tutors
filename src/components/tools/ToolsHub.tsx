import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Star, ArrowRight, Dna, FlaskConical, Sigma } from 'lucide-react';
import {
  STUDENT_TOOLS,
  STUDENT_TOOLS_BY_SLUG,
  TOOL_CATEGORIES,
  ToolCategory,
  ToolSlug,
  resolveStudentToolSlug,
} from '../../data/studentToolsData';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import ToolPageLayout, { renderToolIcon } from './ToolPageLayout';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from './SiteFooter';
import PdfToolkit from './PdfToolkit';
import WhiteboardTool from './WhiteboardTool';
import GraphBuilder from './GraphBuilder';
import GraphTheoryBuilder from './GraphTheoryBuilder';
import CvBuilder from './cv-builder/CvBuilder';
import ImageTools from './ImageTools';
import OcrTranslator from './OcrTranslator';
import CitationGenerator from './CitationGenerator';
import StudyUtilities from './StudyUtilities';
import UniversityGradeConverter from './UniversityGradeConverter';
import AcademicParaphraser from './AcademicParaphraser';

interface ToolsHubProps {
  activeToolSlug?: ToolSlug | null;
  activeView?: string;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function ToolsHub({
  activeToolSlug: passedToolSlug,
  activeView,
  onNavigate,
  onOpenBecomeTutor,
}: ToolsHubProps) {
  const activeToolSlug = passedToolSlug ?? (activeView ? resolveStudentToolSlug(activeView) : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('All');

  // Inject ItemList JSON-LD when viewing the /tools hub directory
  useEffect(() => {
    if (activeToolSlug || typeof document === 'undefined') return;
    const scriptId = 'student-tools-hub-jsonld';
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
      name: 'University-Tutors.com Free Online Student Tools Directory',
      description:
        'Free, 100% browser-local academic tools for university students including PDF Merger, Splitter, Whiteboard, Graph Theory & Network Studio, Graph Builder, ATS CV Maker, Portal Image Compressor, OCR, Translator, Citation Generator, and CGPA Calculator.',
      numberOfItems: STUDENT_TOOLS.length,
      itemListElement: STUDENT_TOOLS.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: `https://university-tutors.com${tool.path}`,
      })),
    });

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [activeToolSlug]);

  // 1. STANDALONE DEDICATED TOOL ROUTE (/tools/<slug>)
  if (activeToolSlug && STUDENT_TOOLS_BY_SLUG[activeToolSlug]) {
    if (activeToolSlug === 'cv-maker') {
      return (
        <CvBuilder
          onNavigate={onNavigate}
          onOpenBecomeTutor={onOpenBecomeTutor}
        />
      );
    }

    if (activeToolSlug === 'academic-paraphraser') {
      return (
        <AcademicParaphraser
          onNavigate={onNavigate}
          onOpenBecomeTutor={onOpenBecomeTutor}
        />
      );
    }

    const activeTool = STUDENT_TOOLS_BY_SLUG[activeToolSlug];

    const renderToolWorkspace = () => {
      switch (activeToolSlug) {
        case 'merge-pdf':
          return <PdfToolkit initialTab="merge" onNavigate={onNavigate} />;
        case 'split-pdf':
          return <PdfToolkit initialTab="split" onNavigate={onNavigate} />;
        case 'images-to-pdf':
          return <PdfToolkit initialTab="images" onNavigate={onNavigate} />;
        case 'whiteboard':
          return <WhiteboardTool />;
        case 'graph-builder':
          return <GraphBuilder />;
        case 'graph-theory-network-builder':
          return <GraphTheoryBuilder onNavigate={onNavigate} />;
        case 'image-compressor':
          return <ImageTools initialTab="compress" onNavigate={onNavigate} />;
        case 'passport-photo-resizer':
          return <ImageTools initialTab="resize" onNavigate={onNavigate} />;
        case 'ocr-image-to-text':
          return <OcrTranslator initialTab="ocr" onNavigate={onNavigate} />;
        case 'study-translator':
          return <OcrTranslator initialTab="translator" onNavigate={onNavigate} />;
        case 'citation-generator':
          return <CitationGenerator />;
        case 'cgpa-word-pomodoro':
          return <StudyUtilities />;
        case 'university-grade-converter':
          return <UniversityGradeConverter onNavigate={onNavigate} />;
      }
    };

    return (
      <ToolPageLayout
        tool={activeTool}
        onNavigate={onNavigate}
        onOpenBecomeTutor={onOpenBecomeTutor}
        wideWorkspace={activeToolSlug === 'graph-theory-network-builder'}
      >
        {renderToolWorkspace()}
      </ToolPageLayout>
    );
  }

  // 2. MAIN /tools HUB DIRECTORY
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTools = STUDENT_TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
    if (!matchesCat) return false;
    if (!normalizedQuery) return true;
    return (
      tool.name.toLowerCase().includes(normalizedQuery) ||
      tool.shortName.toLowerCase().includes(normalizedQuery) ||
      tool.cardSummary.toLowerCase().includes(normalizedQuery) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery))
    );
  });

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* Privacy Top Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-600">
            University-Tutors.com · Free Student Academic Suite ({STUDENT_TOOLS.length} Standalone Tools)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Client-Side Browser Processing — Zero File Uploads, Zero Sign-Up</span>
          </span>
        </div>
      </div>

      {/* Hero Section + Search & Category Tabs */}
      <section className="bg-[#FFFFFF] border-b border-slate-200 pt-10 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="text-[#EA580C] font-bold">Free Student Tools Hub</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#111827]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9★ Rated by 15,000+ University Students
              </span>
              <span aria-hidden="true">·</span>
              <span>No Watermarks</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#111827] tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Free Online Academic Tools for University Coursework &amp; Admissions
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every utility runs locally inside your browser with zero sign-up walls—from merging PDF
              chapters and compressing 100KB portal uploads to building lab charts, ATS resumes, and APA
              7th bibliographies.
            </p>
          </div>

          {/* Search Bar + Category Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., Merge PDF, 100KB, APA 7th, CGPA)..."
                aria-label="Search free student tools"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none text-sm text-[#111827]"
              />
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Filter tools by academic category"
            >
              {TOOL_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                const displayLabel =
                  category === 'Math & Charts' ? 'Mathematics & Charts' : category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F97316] text-white shadow-2xs'
                        : 'bg-[#F9FAFB] text-slate-700 border border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Math, Biology & Chemistry Knowledge Mega-Hubs (57 STEM Solvers) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <a
            href="/tools/math"
            onClick={(e) => handleAnchorNav(e, 'tools/math')}
            className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200 px-3 py-1 rounded-lg">
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Math &amp; Stats Hub · 27 Tools</span>
                </span>
                <span className="font-mono text-xs text-slate-400">/tools/math</span>
              </div>
              <h2 className="text-xl font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                Free University Mathematics &amp; Statistics Suite
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Algebra, Unit Circle, Symbolic Calculus, Riemann Integrals, Gaussian RREF, Eigenvalues, 3D Vectors, Hypothesis Testing (Z/t/ANOVA), RK4 Slope Fields, Fourier &amp; RSA.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
              <span>Explore All 27 Math Tools</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>

          <a
            href="/tools/biology"
            onClick={(e) => handleAnchorNav(e, 'tools/biology')}
            className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200 px-3 py-1 rounded-lg">
                  <Dna className="w-3.5 h-3.5" />
                  <span>Biology Knowledge Hub · 14 Tools</span>
                </span>
                <span className="font-mono text-xs text-slate-400">/tools/biology</span>
              </div>
              <h2 className="text-xl font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                Free Biology, Genetics &amp; Molecular Lab Calculators
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Punnett Square crosses, DNA → mRNA → Protein translator, PCR Master Mix &amp; primer Tm, CRISPR gRNA finder, Restriction Gel simulator, Hardy-Weinberg, CFU/mL, Water Potential &amp; Physiology.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
              <span>Explore All 14 Biology Tools</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>

          <a
            href="/tools/chemistry"
            onClick={(e) => handleAnchorNav(e, 'tools/chemistry')}
            className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200 px-3 py-1 rounded-lg">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Chemistry Knowledge Hub · 16 Tools</span>
                </span>
                <span className="font-mono text-xs text-slate-400">/tools/chemistry</span>
              </div>
              <h2 className="text-xl font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                Free Chemistry, Stoichiometry &amp; Spectroscopy Calculators
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Interactive Periodic Table, Molar Mass, Equation Balancer, Limiting Reagent, Henderson-Hasselbalch Buffer, Acid-Base Titration, Gibbs ΔG, Nernst Ecell, VSEPR &amp; IR/NMR Spectroscopy.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
              <span>Explore All 16 Chemistry Tools</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
      </section>

      {/* 12 Standalone Tool Cards Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTools.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <p className="text-base font-bold text-[#111827]">
              No student tools matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold cursor-pointer"
            >
              Show All {STUDENT_TOOLS.length} Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.path}
                onClick={(e) => handleAnchorNav(e, tool.viewKey)}
                className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-orange-200/80 text-[#F97316] flex items-center justify-center group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                      {renderToolIcon(tool.iconName, 'w-5 h-5')}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{tool.category}</span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-display font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                      {tool.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {tool.cardSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">{tool.path}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#F97316] group-hover:text-[#EA580C]">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <MeetOurExpertTutors onNavigate={onNavigate} />

      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
