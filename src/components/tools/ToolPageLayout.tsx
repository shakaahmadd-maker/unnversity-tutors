import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Star,
  ArrowRight,
  Files,
  Scissors,
  FileImage,
  PenTool,
  BarChart3,
  FileUser,
  Minimize2,
  ScanFace,
  ScanText,
  Languages,
  Quote,
  GraduationCap,
  Network,
  Globe,
  BookCheck,
} from 'lucide-react';
import {
  StudentToolDefinition,
  STUDENT_TOOLS,
  STUDENT_TOOLS_BY_SLUG,
  TUTOR_BRANDING_MAP,
} from '../../data/studentToolsData';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import MeetOurExpertTutors from './MeetOurExpertTutors';
import SiteFooter from './SiteFooter';

interface ToolPageLayoutProps {
  tool: StudentToolDefinition;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
  wideWorkspace?: boolean;
  children: React.ReactNode;
}

export function renderToolIcon(iconName: StudentToolDefinition['iconName'], className = 'w-5 h-5') {
  switch (iconName) {
    case 'Files':
      return <Files className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'FileImage':
      return <FileImage className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'FileUser':
      return <FileUser className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'ScanFace':
      return <ScanFace className={className} />;
    case 'ScanText':
      return <ScanText className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'Quote':
      return <Quote className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Network':
      return <Network className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'BookCheck':
      return <BookCheck className={className} />;
  }
}

export default function ToolPageLayout({
  tool,
  onNavigate,
  onOpenBecomeTutor,
  wideWorkspace = false,
  children,
}: ToolPageLayoutProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const tutorBranding = TUTOR_BRANDING_MAP[tool.tutorGroup];
  const relatedTools = tool.relatedSlugs.map((slug) => STUDENT_TOOLS_BY_SLUG[slug]);

  // Inject Schema.org SoftwareApplication + FAQPage JSON-LD for Google Rich Results
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'student-tool-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `${tool.name} — University-Tutors.com`,
        url: `https://university-tutors.com${tool.path}`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        description: tool.seoDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '15240',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ];

    scriptEl.textContent = JSON.stringify(structuredData);
    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [tool]);

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col print:bg-white print:min-h-0">
      {/* 1. Top Breadcrumb & Local Privacy Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <a
              href="/tools"
              onClick={(e) => handleAnchorNav(e, 'tools')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors mr-2 whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Tools</span>
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <a
                href="/"
                onClick={(e) => handleAnchorNav(e, 'home')}
                className="hover:text-[#111827] transition-colors"
              >
                Home
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a
                href="/tools"
                onClick={(e) => handleAnchorNav(e, 'tools')}
                className="hover:text-[#111827] transition-colors"
              >
                Free Student Tools
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-[#111827] truncate max-w-[220px] sm:max-w-none">
                {tool.name}
              </span>
            </nav>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-lg self-start md:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Free &amp; Private — Processed locally in your browser. Your files never leave your device.</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-[#FFFFFF] border-b border-slate-200/80 pt-7 pb-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-[#EA580C] font-semibold">{tool.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9★ Rated by 15,000+ University Students
              </span>
              <span aria-hidden="true">·</span>
              <span>No Sign-Up Required</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {tool.heroH1}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {tool.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Tool Workspace (Above the Fold) */}
      <section
        className={`${
          wideWorkspace ? 'max-w-[1560px]' : 'max-w-7xl'
        } w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none`}
      >
        {children}

        {/* Subtle Light-Orange Conversion Funnel Banner Right Below Workspace */}
        <div className="mt-6 bg-[#FFF7ED] border border-orange-200/80 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <p className="text-xs sm:text-sm font-medium text-[#111827] text-center sm:text-left">
            Need 1-on-1 help reviewing your assignment, thesis, or CV?{' '}
            <span className="text-slate-600">Get personalized feedback from verified university mentors.</span>
          </p>
          <a
            href="/tutors"
            onClick={(e) => handleAnchorNav(e, tutorBranding.ctaNavigateView)}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#EA580C] hover:text-[#111827] transition-colors sm:whitespace-nowrap text-center sm:text-left cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <span>Connect with an expert tutor on University-Tutors.com</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </section>

      {/* 5. SEO "How It Works & Student FAQs" Section */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: 3 Numbered Steps */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#EA580C]">Fast Browser Workflow</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                How {tool.name} Works
              </h2>
              <p className="text-sm text-slate-600">
                Complete your academic file preparation in three straightforward steps—no software installation required.
              </p>
            </div>

            <div className="space-y-4">
              {tool.howItWorks.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 flex items-start gap-4"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3 Collapsible Student FAQs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#EA580C]">Student Questions &amp; Privacy</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600">
                Everything students ask about formatting accuracy, university portal compliance, and local browser privacy.
              </p>
            </div>

            <div className="space-y-3">
              {tool.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-[#FFFFFF] border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-bold text-[#111827]">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#F97316]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Related Tools Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14 print:hidden">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#111827] tracking-tight">
              Related Free Student Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Continue preparing your coursework with our other zero-cost browser utilities.
            </p>
          </div>
          <a
            href="/tools"
            onClick={(e) => handleAnchorNav(e, 'tools')}
            className="text-xs sm:text-sm font-semibold text-[#EA580C] hover:text-[#111827] transition-colors whitespace-nowrap cursor-pointer"
          >
            View all {STUDENT_TOOLS.length} tools →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedTools.map((rel) => (
            <a
              key={rel.slug}
              href={rel.path}
              onClick={(e) => handleAnchorNav(e, rel.viewKey)}
              className="group bg-[#FFFFFF] border border-slate-200 hover:border-[#F97316] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-orange-200/80 text-[#F97316] flex items-center justify-center">
                    {renderToolIcon(rel.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{rel.category}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {rel.cardSummary}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
                <span>Open Free Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 7. Live Active Expert Tutors Directory Section Above Global Footer */}
      <MeetOurExpertTutors onNavigate={onNavigate} subjectHint={tool.shortName} />

      {/* 8. Global Website Footer */}
      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
