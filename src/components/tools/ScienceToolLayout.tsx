import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpenCheck,
  FileDown,
} from 'lucide-react';
import {
  ScienceToolItem,
  SCIENCE_TOOLS_BY_SLUG,
  SCIENCE_TUTOR_BRANDING,
  ScienceFeaturedTutor,
} from '../../data/scienceToolsRegistry';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import { downloadAcademicReportPdf } from '../../utils/pdfReportGenerator';
import SiteFooter from '../SiteFooter';

interface ScienceToolLayoutProps {
  tool: ScienceToolItem;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
  children: React.ReactNode;
}

function ScienceTutorAvatar({ tutor }: { tutor: ScienceFeaturedTutor }) {
  const [failed, setFailed] = useState(false);
  if (failed || !tutor.avatarUrl) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-display font-bold text-base flex items-center justify-center shrink-0">
        {tutor.initials}
      </div>
    );
  }
  return (
    <img
      src={tutor.avatarUrl}
      alt={tutor.name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
    />
  );
}

export default function ScienceToolLayout({
  tool,
  onNavigate,
  onOpenBecomeTutor,
  children,
}: ScienceToolLayoutProps) {
  const [isWorkedExampleOpen, setIsWorkedExampleOpen] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const hubPath = tool.category === 'Biology' ? '/tools/biology' : '/tools/chemistry';
  const hubView = tool.category === 'Biology' ? 'tools/biology' : 'tools/chemistry';
  const tutorBranding = SCIENCE_TUTOR_BRANDING[tool.category];
  const relatedTools = tool.relatedSlugs
    .map((slug) => SCIENCE_TOOLS_BY_SLUG[slug])
    .filter(Boolean);

  const handleDownloadLabPdf = () => {
    const liveLines: string[] = [];
    if (workspaceRef.current) {
      const inputs = Array.from(
        workspaceRef.current.querySelectorAll('input:not([type="file"]):not([type="range"]), select, textarea')
      ) as Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      inputs.slice(0, 12).forEach((el) => {
        const val = String(el.value || '').trim();
        if (!val) return;
        const labelEl = el.id ? workspaceRef.current?.querySelector(`label[for="${el.id}"]`) : el.closest('div')?.querySelector('label');
        const label = labelEl?.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'Parameter';
        liveLines.push(`${label}: ${val}`);
      });

      const rawText = (workspaceRef.current.innerText || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 1 && l.length < 180 && !/^(Reset|Export PNG|Download PDF|Try Sample)$/i.test(l));
      rawText.slice(0, 28).forEach((line) => {
        if (!liveLines.includes(line)) liveLines.push(line);
      });
    }

    downloadAcademicReportPdf({
      filename: `${tool.slug}-report.pdf`,
      title: tool.title,
      subtitle: `${tool.category} — ${tool.subCategory} · Core Relation: ${tool.formulaBadge}`,
      badgeText: `${tool.category.toUpperCase()} LAB REPORT`,
      metadataRows: [
        { label: 'Discipline & Sub-Category', value: `${tool.category} · ${tool.subCategory}` },
        { label: 'Governing Relation', value: tool.formulaBadge },
      ],
      sections: [
        ...(liveLines.length > 0
          ? [
              {
                heading: 'Live Calculator & Simulator Snapshot',
                lines: liveLines,
              },
            ]
          : []),
        {
          heading: 'Worked Lab & Exam Reference Walkthrough',
          lines: [
            `Problem: ${tool.workedExample.problem}`,
            '',
            ...tool.workedExample.steps.map((s, idx) => `Step ${idx + 1}: ${s}`),
            '',
            `Verified Result: ${tool.workedExample.answer}`,
          ],
        },
      ],
    });
  };

  // Inject Schema.org WebApplication + FAQPage JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'science-tool-jsonld';
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
        educationalUse: `${tool.category} — ${tool.subCategory}`,
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
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* 1. Top Breadcrumb & Trust Strip */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <a
              href={hubPath}
              onClick={(e) => handleAnchor(e, hubView)}
              className="inline-flex items-center gap-1 font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors mr-1.5 whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{tool.category} Hub</span>
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
                href="/tools"
                onClick={(e) => handleAnchor(e, 'tools')}
                className="hover:text-[#111827] transition-colors"
              >
                Free Science Tools
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a
                href={hubPath}
                onClick={(e) => handleAnchor(e, hubView)}
                className="hover:text-[#111827] transition-colors"
              >
                {tool.category}
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-[#111827] truncate max-w-[230px] sm:max-w-none">
                {tool.shortTitle}
              </span>
            </nav>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-lg self-start lg:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Free &amp; Browser-Based — Instant Academic Results, No Sign-Up Required</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-[#FFFFFF] border-b border-slate-200/80 pt-7 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-4xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-[#EA580C]">{tool.category}</span>
                <span aria-hidden="true">·</span>
                <span>{tool.subCategory}</span>
                <span aria-hidden="true">·</span>
                <span>Tool #{tool.toolNumber} of 30</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {tool.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {tool.shortDescription}
              </p>
            </div>

            {/* Formula Reference Box + Instant PDF Report Button */}
            <div className="shrink-0 self-start lg:self-end flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 max-w-full">
              <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl px-4 py-3 max-w-full">
                <span className="block text-[11px] font-semibold text-slate-500">Core Relation</span>
                <code className="text-sm sm:text-base font-mono font-bold text-[#EA580C] break-words sm:whitespace-nowrap block">
                  {tool.formulaBadge}
                </code>
              </div>
              <button
                type="button"
                onClick={handleDownloadLabPdf}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Lab Report PDF</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Tool Slot (Above the Fold) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={workspaceRef}>{children}</div>

        {/* Quick Inline Conversion Strip */}
        <div className="mt-6 bg-[#FFF7ED] border border-orange-200/80 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium text-[#111827] text-center sm:text-left">
            Writing up a {tool.category.toLowerCase()} lab report or preparing for midterms?{' '}
            <span className="text-slate-600">
              Review your calculations 1-on-1 with a verified university specialist.
            </span>
          </p>
          <a
            href="/tutors"
            onClick={(e) => handleAnchor(e, tutorBranding.ctaView)}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#EA580C] hover:text-[#111827] transition-colors sm:whitespace-nowrap text-center sm:text-left cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <span>{tutorBranding.ctaText}</span>
          </a>
        </div>
      </section>

      {/* 4. Subject-Matched Tutor Branding Section (Dynamic by Biology / Chemistry) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold text-[#EA580C]">{tutorBranding.kicker}</p>
              <h2
                className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#111827] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {tutorBranding.headline}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{tutorBranding.subtext}</p>
            </div>

            <div className="shrink-0">
              <a
                href="/tutors"
                onClick={(e) => handleAnchor(e, tutorBranding.ctaView)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{tutorBranding.ctaText}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
            {tutorBranding.tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-[#F9FAFB] border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-orange-300 transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <ScienceTutorAvatar tutor={tutor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#111827] truncate">{tutor.name}</h3>
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 shrink-0"
                          aria-label="Verified University Tutor"
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#EA580C] mt-0.5">
                        {tutor.credential}
                      </p>
                      <p className="text-xs text-slate-500">{tutor.institution}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tutor.specialties.join('  ·  ')}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating}★
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tutor.sessions}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">Verified Faculty</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(`subject:${tutor.subjectQuery}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Book 1-on-1 Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Worked Example & Academic FAQs */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Collapsible Step-by-Step Worked Example */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EA580C]">Step-by-Step Derivation</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                Worked Lab &amp; Exam Example
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
                    Formula Walkthrough ({tool.formulaBadge})
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
                    <span className="block text-[11px] font-bold text-slate-500">Problem</span>
                    <p className="text-xs sm:text-sm font-medium text-[#111827] mt-0.5 leading-relaxed">
                      {tool.workedExample.problem}
                    </p>
                  </div>

                  <ol className="space-y-2.5">
                    {tool.workedExample.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="w-6 h-6 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="bg-[#FFF7ED] border border-orange-200/80 rounded-xl px-4 py-3">
                    <span className="block text-[11px] font-bold text-[#EA580C]">Verified Result</span>
                    <p className="text-xs sm:text-sm font-mono font-bold text-[#111827] mt-0.5">
                      {tool.workedExample.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: 3 Collapsible Academic FAQs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EA580C]">Conceptual Mastery</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                Student &amp; Exam FAQs
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
                      <span className="text-sm font-bold text-[#111827]">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#F97316]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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

      {/* 6. Related Tools Grid (3 Sibling Tools) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#111827] tracking-tight">
              Related {tool.category} Calculators &amp; Simulators
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Continue exploring sibling {tool.category.toLowerCase()} knowledge tools.
            </p>
          </div>
          <a
            href={hubPath}
            onClick={(e) => handleAnchor(e, hubView)}
            className="text-xs sm:text-sm font-semibold text-[#EA580C] hover:text-[#111827] transition-colors whitespace-nowrap cursor-pointer"
          >
            All {tool.category} Tools →
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
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{rel.subCategory}</span>
                  <code className="font-mono font-bold text-[#EA580C]">{rel.formulaBadge}</code>
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

      {/* 7. Global 5-Column Website Footer with All 30 Tool Links */}
      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
