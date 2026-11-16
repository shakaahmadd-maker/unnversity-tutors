import React, { useState } from 'react';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

const FooterToolDirectories = React.lazy(() => import('./FooterToolDirectories'));

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function Footer({ onNavigate, onOpenBecomeTutor }: FooterProps) {
  const [isMathSolversOpen, setIsMathSolversOpen] = useState(false);
  const [showAllMathDirectory, setShowAllMathDirectory] = useState(false);
  const [isStudentToolsOpen, setIsStudentToolsOpen] = useState(false);
  const [showAllStudentDirectory, setShowAllStudentDirectory] = useState(false);
  const [isDisclosuresOpen, setIsDisclosuresOpen] = useState(false);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    view: string,
    scrollTop = true
  ) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
      if (scrollTop && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleButtonNav = (view: string) => {
    onNavigate(view);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const featuredMathSolvers = [
    {
      title: 'Calculus Integral Solver',
      subtitle: 'Definite, indefinite & symbolic',
      href: '/tools/math/definite-integral-riemann-plotter',
      viewKey: 'tools/math/definite-integral-riemann-plotter',
    },
    {
      title: 'Matrix Eigenvalue Calculator',
      subtitle: 'RREF, determinants & eigenvectors',
      href: '/tools/math/eigenvalues-eigenvectors-calculator',
      viewKey: 'tools/math/eigenvalues-eigenvectors-calculator',
    },
    {
      title: 'RSA Key Generator',
      subtitle: 'Prime factorization & totient steps',
      href: '/tools/math/number-theory-modular-rsa-calculator',
      viewKey: 'tools/math/number-theory-modular-rsa-calculator',
    },
    {
      title: 'ODE Solver',
      subtitle: '1st & 2nd order linear ODEs',
      href: '/tools/math/ode-slope-field-rk4-plotter',
      viewKey: 'tools/math/ode-slope-field-rk4-plotter',
    },
    {
      title: 'Z-Score & Hypothesis Tester',
      subtitle: 'p-values, t-tests & ANOVA tables',
      href: '/tools/math/hypothesis-testing-suite',
      viewKey: 'tools/math/hypothesis-testing-suite',
    },
    {
      title: 'Trig & Complex Plane Tool',
      subtitle: 'Euler form, identities & unit circle',
      href: '/tools/math/complex-number-polar-converter',
      viewKey: 'tools/math/complex-number-polar-converter',
    },
  ];

  const featuredStudentTools = [
    {
      title: 'Zero-Upload PDF Merger',
      subtitle: 'Merge, split & compress lecture PDFs',
      href: '/tools/merge-pdf',
      viewKey: 'tools/merge-pdf',
    },
    {
      title: 'APA/MLA Citation Generator',
      subtitle: 'APA 7th, MLA 9th, Chicago & BibTeX',
      href: '/tools/citation-generator',
      viewKey: 'tools/citation-generator',
    },
    {
      title: 'GPA & Grade Calculator',
      subtitle: '4.0 scale, UK Honours & WAM',
      href: '/tools/cgpa-word-pomodoro',
      viewKey: 'tools/cgpa-word-pomodoro',
    },
    {
      title: 'Browser Image Compressor',
      subtitle: 'Optimize lab figures & WebP/PNG',
      href: '/tools/image-compressor',
      viewKey: 'tools/image-compressor',
    },
    {
      title: 'Client-Side OCR Scanner',
      subtitle: 'Extract text from whiteboard photos',
      href: '/tools/ocr-image-to-text',
      viewKey: 'tools/ocr-image-to-text',
    },
    {
      title: 'Academic CV & Chart Builder',
      subtitle: 'Clean publication & lab templates',
      href: '/tools/cv-maker',
      viewKey: 'tools/cv-maker',
    },
  ];

  const seoTopics = [
    { text: 'find university tutors online', href: '/tutors', view: 'tutors' },
    { text: 'prepare for final exam questions', href: '/services/coursework-track', view: 'service-coursework' },
    { text: 'academic essay structure help', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'urgent academic tutoring help', href: '/services/1-on-1-live-tutoring', view: 'service-1on1' },
    { text: 'online study guide assistance', href: '/services/assignment-guidance', view: 'service-assignment' },
    { text: 'professional coursework mentoring', href: '/services/coursework-track', view: 'service-coursework' },
    { text: 'dissertation format review', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'grammar and citation proofreading', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'math derivation step-by-step coaching', href: '/services/1-on-1-live-tutoring', view: 'service-1on1' },
    { text: 'guided software project tutor', href: '/services/assignment-guidance', view: 'service-assignment' },
  ];

  return (
    <footer
      id="main-footer"
      className="bg-cream-100 border-t border-cream-400 text-stone-800 selection:bg-amber-200 selection:text-terracotta-900 font-sans print:hidden"
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:pt-10 sm:pb-8 space-y-4 sm:space-y-9">
        {/* 1. TOP INTERACTIVE TOOL SUITES SECTION (Compact on Mobile, 2-Col on Desktop) */}
        <section
          aria-label="Browser-Local Academic Tool Suites"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 items-start"
        >
          {/* CARD 1: FREE UNIVERSITY MATHEMATICS & STATISTICS SUITE */}
          <div className="bg-cream-50/90 rounded-xl sm:rounded-2xl border border-cream-400 p-3.5 sm:p-6 shadow-2xs hover:border-amber-400/80 transition-colors flex flex-col justify-between text-left">
            <div>
              {/* Privacy / Local Processing Badge */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 sm:mb-3">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-cream-200 text-terracotta-700 border border-cream-400">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  27 Solvers
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-stone-500">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Browser-Local
                </span>
              </div>

              {/* Title & Concise 2-Line Clamped Description on Mobile */}
              <h2 className="text-xs sm:text-[15px] font-bold tracking-wide text-stone-900 uppercase leading-snug">
                FREE UNIVERSITY MATHEMATICS &amp; STATISTICS SUITE (27 INTERACTIVE SOLVERS)
              </h2>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-stone-600 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                100% browser-local Algebra, Trigonometry, Calculus, Linear Algebra, Statistics, ODE, and RSA calculators.
              </p>
            </div>

            {/* Compact Action Bar */}
            <div className="mt-2.5 sm:mt-5 pt-2.5 sm:pt-4 border-t border-cream-300 flex flex-wrap items-center justify-between gap-2">
              <a
                href="/tools/math"
                onClick={(e) => handleLinkClick(e, 'tools/math')}
                className="group inline-flex items-center gap-1 text-[11px] sm:text-[13px] font-semibold text-terracotta-700 hover:text-terracotta-800 transition-colors cursor-pointer"
              >
                <span>Math &amp; Stats Hub (27)</span>
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>

              <button
                type="button"
                id="math-solvers-btn"
                aria-expanded={isMathSolversOpen}
                aria-controls="math-solvers-drawer"
                onClick={() => setIsMathSolversOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white hover:bg-cream-200/70 text-stone-800 text-[11px] sm:text-xs font-semibold border border-cream-400 shadow-2xs hover:border-terracotta-600/40 transition-all cursor-pointer ${
                  isMathSolversOpen ? 'is-expanded' : ''
                }`}
              >
                <span id="math-solvers-btn-label">
                  {isMathSolversOpen ? 'Hide Solvers' : 'All 27 Solvers'}
                </span>
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta-700 chevron-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expandable Math Solvers Grid Drawer */}
            <div
              id="math-solvers-drawer"
              className={`accordion-content ${isMathSolversOpen ? 'is-open' : ''}`}
            >
              <div className="accordion-inner">
                <div className="mt-3 pt-3 border-t border-dashed border-cream-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-terracotta-700">
                      Featured &amp; Categorized Solvers
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-stone-500">Zero server latency</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {featuredMathSolvers.map((solver) => (
                      <a
                        key={solver.viewKey}
                        href={solver.href}
                        onClick={(e) => handleLinkClick(e, solver.viewKey)}
                        className="group flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-cream-300 hover:border-terracotta-600/50 hover:bg-cream-200/40 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-[11px] sm:text-xs font-semibold text-stone-800 group-hover:text-terracotta-700">
                            {solver.title}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-stone-500">{solver.subtitle}</p>
                        </div>
                        <span className="text-xs text-terracotta-600 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          &rarr;
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAllMathDirectory((prev) => !prev)}
                      className="text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-800 underline cursor-pointer"
                    >
                      {showAllMathDirectory ? 'Hide full 27-solver list' : 'Expand full 27-solver directory'}
                    </button>
                    <a
                      href="/tools/math"
                      onClick={(e) => handleLinkClick(e, 'tools/math')}
                      className="text-[11px] font-semibold text-stone-600 hover:text-terracotta-700 cursor-pointer"
                    >
                      Open Math Hub &rarr;
                    </a>
                  </div>

                  {showAllMathDirectory && (
                    <React.Suspense
                      fallback={
                        <div className="py-3 text-xs text-stone-500 font-medium">
                          Loading all 27 math solvers...
                        </div>
                      }
                    >
                      <FooterToolDirectories mode="math" onNavigate={onNavigate} />
                    </React.Suspense>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: FREE STUDENT TOOLS SUITE */}
          <div className="bg-cream-50/90 rounded-xl sm:rounded-2xl border border-cream-400 p-3.5 sm:p-6 shadow-2xs hover:border-amber-400/80 transition-colors flex flex-col justify-between text-left">
            <div>
              {/* Privacy / Local Processing Badge */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 sm:mb-3">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-cream-200 text-terracotta-700 border border-cream-400">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Academic Utilities
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-stone-500">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Zero-Upload
                </span>
              </div>

              {/* Title & Concise Description */}
              <h2 className="text-xs sm:text-[15px] font-bold tracking-wide text-stone-900 uppercase leading-snug">
                FREE STUDENT TOOLS SUITE (100% LOCAL BROWSER UTILITIES)
              </h2>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-stone-600 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                Zero-upload PDF, citation, chart, resume, image compression, OCR, and GPA tools for university students.
              </p>

              {/* Compact Hub Links Pill Bar (Single-Row Scroll on Mobile, Wrap on Desktop) */}
              <div className="mt-2.5 sm:mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-0.5 sm:pb-0">
                <a
                  href="/tools/math"
                  onClick={(e) => handleLinkClick(e, 'tools/math')}
                  className="group shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-cream-200/80 hover:bg-terracotta-700 text-terracotta-700 hover:text-white text-[11px] sm:text-xs font-semibold border border-cream-400 hover:border-terracotta-700 transition-all cursor-pointer"
                >
                  <span>Math (27)</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </a>
                <a
                  href="/tools/biology"
                  onClick={(e) => handleLinkClick(e, 'tools/biology')}
                  className="group shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-cream-200/80 hover:bg-terracotta-700 text-terracotta-700 hover:text-white text-[11px] sm:text-xs font-semibold border border-cream-400 hover:border-terracotta-700 transition-all cursor-pointer"
                >
                  <span>Biology (14)</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </a>
                <a
                  href="/tools/chemistry"
                  onClick={(e) => handleLinkClick(e, 'tools/chemistry')}
                  className="group shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-cream-200/80 hover:bg-terracotta-700 text-terracotta-700 hover:text-white text-[11px] sm:text-xs font-semibold border border-cream-400 hover:border-terracotta-700 transition-all cursor-pointer"
                >
                  <span>Chemistry (16)</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </a>
                <a
                  href="/tools"
                  onClick={(e) => handleLinkClick(e, 'tools')}
                  className="group shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white hover:bg-terracotta-700 text-terracotta-700 hover:text-white text-[11px] sm:text-xs font-semibold border border-cream-400 hover:border-terracotta-700 transition-all cursor-pointer"
                >
                  <span>All Tools</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>

            {/* Compact Action Bar */}
            <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-4 border-t border-cream-300 flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-stone-500">Offline WebAssembly</span>

              <button
                type="button"
                id="student-tools-btn"
                aria-expanded={isStudentToolsOpen}
                aria-controls="student-tools-drawer"
                onClick={() => setIsStudentToolsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white hover:bg-cream-200/70 text-stone-800 text-[11px] sm:text-xs font-semibold border border-cream-400 shadow-2xs hover:border-terracotta-600/40 transition-all cursor-pointer ${
                  isStudentToolsOpen ? 'is-expanded' : ''
                }`}
              >
                <span id="student-tools-btn-label">
                  {isStudentToolsOpen ? 'Hide Tools' : 'Individual Tools'}
                </span>
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta-700 chevron-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expandable Individual Student Tools Drawer */}
            <div
              id="student-tools-drawer"
              className={`accordion-content ${isStudentToolsOpen ? 'is-open' : ''}`}
            >
              <div className="accordion-inner">
                <div className="mt-3 pt-3 border-t border-dashed border-cream-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-terracotta-700">
                      Browser-Local Student Utilities
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-stone-500">Files never leave device</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {featuredStudentTools.map((tool) => (
                      <a
                        key={tool.viewKey}
                        href={tool.href}
                        onClick={(e) => handleLinkClick(e, tool.viewKey)}
                        className="group flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-cream-300 hover:border-terracotta-600/50 hover:bg-cream-200/40 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-[11px] sm:text-xs font-semibold text-stone-800 group-hover:text-terracotta-700">
                            {tool.title}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-stone-500">{tool.subtitle}</p>
                        </div>
                        <span className="text-xs text-terracotta-600 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          &rarr;
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAllStudentDirectory((prev) => !prev)}
                      className="text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-800 underline cursor-pointer"
                    >
                      {showAllStudentDirectory ? 'Hide full tools directory' : 'Expand all student tools'}
                    </button>
                    <a
                      href="/tools"
                      onClick={(e) => handleLinkClick(e, 'tools')}
                      className="text-[11px] font-semibold text-stone-600 hover:text-terracotta-700 cursor-pointer"
                    >
                      Open Tools Suite &rarr;
                    </a>
                  </div>

                  {showAllStudentDirectory && (
                    <React.Suspense
                      fallback={
                        <div className="py-3 text-xs text-stone-500 font-medium">
                          Loading student utilities directory...
                        </div>
                      }
                    >
                      <FooterToolDirectories mode="student" onNavigate={onNavigate} />
                    </React.Suspense>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-cream-400/80" />

        {/* 2. MIDDLE SECTION: POPULAR ACADEMIC TOPICS (Single-Row Scroll on Mobile, Wrapped on Desktop) */}
        <section aria-labelledby="popular-topics-heading" className="space-y-2 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-cream-200 border border-cream-400 flex items-center justify-center text-terracotta-700 shrink-0">
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </span>
              <h3
                id="popular-topics-heading"
                className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-stone-800"
              >
                POPULAR ACADEMIC TOPICS &amp; STUDY GUIDES
              </h3>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 shrink-0">
              <span className="sm:hidden">Swipe &rarr;</span>
              <span className="hidden sm:inline">Curated student learning pathways</span>
            </span>
          </div>

          {/* Horizontal Scrollable Pill Strip on Mobile (Single Row), Multi-Row Wrap on Desktop */}
          <div
            id="google-ads-keywords"
            className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-0.5 sm:pb-0"
          >
            {seoTopics.map((topic, idx) => (
              <a
                key={idx}
                id={`seo-keyword-${idx}`}
                href={topic.href}
                rel="nofollow"
                onClick={(e) => handleLinkClick(e, topic.view)}
                className="group shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white hover:bg-cream-50 text-stone-700 hover:text-terracotta-700 text-[11px] sm:text-xs font-medium border border-cream-400 hover:border-terracotta-600/50 shadow-2xs sm:hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>{topic.text}</span>
                <span
                  aria-hidden="true"
                  className="text-terracotta-600/70 group-hover:text-terracotta-700 group-hover:translate-x-0.5 transition-transform"
                >
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* 3. PLATFORM IDENTITY & ACADEMIC INTEGRITY DISCLOSURES ACCORDION (Ultra-Compact) */}
        <section aria-label="Platform Identity and Academic Integrity Disclosures" className="pt-0.5">
          <div className="flex flex-col items-center">
            <button
              type="button"
              id="toggleDisclosureBtn"
              aria-expanded={isDisclosuresOpen}
              aria-controls="footerDisclosurePanel"
              onClick={() => setIsDisclosuresOpen((prev) => !prev)}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white hover:bg-cream-50 text-stone-900 border border-cream-400 hover:border-terracotta-600/60 shadow-2xs transition-all cursor-pointer ${
                isDisclosuresOpen ? 'is-expanded' : ''
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cream-200 text-terracotta-700 flex items-center justify-center shrink-0 group-hover:bg-terracotta-700 group-hover:text-white transition-colors">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>
              <span
                id="btnText"
                className="text-[11px] sm:text-xs font-semibold text-stone-800 group-hover:text-terracotta-800 transition-colors"
              >
                Platform Identity &amp; Academic Integrity Disclosures
              </span>
              <svg
                className="w-3 h-3 text-terracotta-700 chevron-icon shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <p className="mt-1 text-[10px] text-stone-500 text-center">
              Click to {isDisclosuresOpen ? 'close' : 'open'} legal, identity &amp; academic integrity disclosures
            </p>
          </div>

          {/* Expandable Disclosure Panel */}
          <div
            id="footerDisclosurePanel"
            className={`accordion-content ${isDisclosuresOpen ? 'is-open' : ''}`}
          >
            <div className="accordion-inner">
              <div className="mt-2.5 sm:mt-3.5 bg-white rounded-xl sm:rounded-2xl border border-cream-400 p-3 sm:p-4 shadow-xs text-left space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
                  {/* Disclosure Column 1 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-terracotta-700">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Academic Integrity Policy</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                      universitytutors.com strictly prohibits contract cheating, ghostwriting, or unauthorized exam assistance. All tutoring, derivation coaching, and structural feedback are designed exclusively to build independent student comprehension in compliance with university honor codes.
                    </p>
                  </div>

                  {/* Disclosure Column 2 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-terracotta-700">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Browser-Local Privacy Guarantee</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                      Every mathematical solver, PDF utility, OCR scanner, and citation tool in our free suites executes 100% locally inside your browser sandbox. Student documents, equations, and files are never uploaded to external servers or used for model training.
                    </p>
                  </div>

                  {/* Disclosure Column 3 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-terracotta-700">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Regional Curriculum Alignment</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                      Platform educational resources, grading calculators, and citation standards are calibrated to support higher-education frameworks across the United Kingdom (UK), United States (US), Canada (CA), Australia (AU), New Zealand (NZ), and Ireland (IE).
                    </p>
                  </div>
                </div>

                {/* Compact Google OAuth & Support Row */}
                <div className="pt-2.5 border-t border-cream-300 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                  <span>
                    Enquiries:{' '}
                    <a
                      href="mailto:support@universitytutors.com"
                      className="font-semibold text-terracotta-700 hover:underline"
                    >
                      support@universitytutors.com
                    </a>
                    {onOpenBecomeTutor && (
                      <>
                        {' · '}
                        <button
                          type="button"
                          onClick={onOpenBecomeTutor}
                          className="font-semibold text-terracotta-700 hover:underline cursor-pointer"
                        >
                          Become a Tutor
                        </button>
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleButtonNav('google-disclosure')}
                    className="font-semibold text-terracotta-700 hover:text-terracotta-800 hover:underline cursor-pointer"
                  >
                    View Google OAuth Disclosure &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* 4. CENTERED COMPACT BOTTOM BAR */}
        <div className="flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
          {/* Centered Copyright & Regional Curriculum Notice */}
          <p className="text-[11px] sm:text-xs text-stone-600 leading-snug sm:leading-relaxed max-w-2xl mx-auto text-center">
            &copy; 2026 universitytutors.com. All Rights Reserved. Created under educational technology guidelines for UK, US, CA, AU, NZ &amp; IE local curriculum support.
          </p>

          {/* Centered Inline Navigation Links */}
          <nav
            aria-label="Footer Legal and Portal Links"
            className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 sm:gap-x-5 sm:gap-y-2 text-[11px] sm:text-xs font-semibold text-stone-700 text-center"
          >
            <a
              id="footer-cc-priv"
              href="/privacy"
              onClick={(e) => handleLinkClick(e, 'privacy')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              id="footer-cc-terms"
              href="/terms"
              onClick={(e) => handleLinkClick(e, 'terms')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              id="footer-cc-disclosure"
              href="/google-disclosure"
              onClick={(e) => handleLinkClick(e, 'google-disclosure')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              Google Disclosure
            </a>
            <a
              id="footer-cc-contact"
              href="/contact"
              onClick={(e) => handleLinkClick(e, 'contact')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              Contact Us
            </a>
            <a
              id="footer-cc-sop"
              href="/sop"
              onClick={(e) => handleLinkClick(e, 'sop')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              System SOP
            </a>
            <a
              id="footer-cc-admin"
              href="/admin-login"
              onClick={(e) => handleLinkClick(e, 'admin-login')}
              className="hover:text-terracotta-700 transition-colors cursor-pointer"
            >
              Admin Portal
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
