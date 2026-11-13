import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Star,
  Palette,
  Check,
} from 'lucide-react';
import {
  CvDocumentData,
  EUROPASS_COLOR_THEMES,
  createFreshDefaultCvData,
  normalizeHexColor,
  sanitizeImportedCvData,
} from './defaultCvData';
import CvForm from './CvForm';
import CvA4Preview from './CvA4Preview';
import { generateCvPdf } from './generateCvPdf';
import {
  STUDENT_TOOLS_BY_SLUG,
  TUTOR_BRANDING_MAP,
  FeaturedTutorCardData,
} from '../../../data/studentToolsData';
import { isModifiedAnchorClick } from '../../../data/dedicatedServiceRoutes';
import { renderToolIcon } from '../ToolPageLayout';
import { ResponsiveAvatar } from '../../ResponsiveImage';
import SiteFooter from '../SiteFooter';

const LOCAL_STORAGE_KEY = 'ut_ats_cv_builder_v2';

interface CvBuilderProps {
  onNavigate?: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function CoachAvatar({ tutor }: { tutor: FeaturedTutorCardData }) {
  const [failed, setFailed] = useState(false);
  if (failed || !tutor.avatarUrl) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-display font-bold text-base flex items-center justify-center shrink-0">
        {tutor.initials}
      </div>
    );
  }
  return (
    <ResponsiveAvatar
      src={tutor.avatarUrl}
      alt={tutor.name}
      sizePx={64}
      width={56}
      height={56}
      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
    />
  );
}

export default function CvBuilder({
  onNavigate = () => {},
  onOpenBecomeTutor,
}: CvBuilderProps) {
  const [cvData, setCvData] = useState<CvDocumentData>(() => {
    if (typeof window === 'undefined') return createFreshDefaultCvData();
    try {
      const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = sanitizeImportedCvData(JSON.parse(saved));
        if (parsed) return parsed;
      }
    } catch {
      // Fallback to default sample data if localStorage is unavailable or corrupt
    }
    return createFreshDefaultCvData();
  });

  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');
  const [statusNotice, setStatusNotice] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const jsonUploadRef = useRef<HTMLInputElement | null>(null);

  const cvToolMeta = STUDENT_TOOLS_BY_SLUG['cv-maker'];
  const admissionsBranding = TUTOR_BRANDING_MAP.admissions;
  const relatedTools = cvToolMeta.relatedSlugs.map((slug) => STUDENT_TOOLS_BY_SLUG[slug]);

  // Persist edits locally in browser
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
    } catch {
      // Ignore quota errors (e.g. oversized local image)
    }
  }, [cvData]);

  // Inject Schema.org WebApplication + FAQPage JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'cv-builder-jsonld';
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
        name: 'ATS-Friendly Student CV & Resume Builder — University-Tutors.com',
        url: 'https://university-tutors.com/tools/cv-maker',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        description: cvToolMeta.seoDescription,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: cvToolMeta.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
    ]);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [cvToolMeta]);

  const showBannerMessage = (kind: 'success' | 'error', message: string) => {
    setStatusNotice({ kind, message });
    setTimeout(() => {
      setStatusNotice((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // 1. Save JSON backup
  const handleSaveJson = () => {
    const slugName = (cvData.personal.fullName || 'my-cv')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const fileName = slugName ? `${slugName}-cv-data.json` : 'my-cv-data.json';
    const blob = new Blob([JSON.stringify(cvData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showBannerMessage('success', `Saved local backup (${fileName}).`);
  };

  // 2. Load JSON backup
  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const sanitized = sanitizeImportedCvData(parsed);
        if (!sanitized) {
          showBannerMessage(
            'error',
            'Invalid JSON structure. Please select a valid University-Tutors CV backup file.'
          );
          return;
        }
        setCvData(sanitized);
        showBannerMessage('success', `Restored all CV fields from "${file.name}".`);
      } catch {
        showBannerMessage('error', 'Could not parse JSON file. Ensure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Reset Sample Data
  const handleResetSample = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    const fresh = createFreshDefaultCvData();
    setCvData(fresh);
    setConfirmReset(false);
    showBannerMessage('success', 'Restored default university student CV sample.');
  };

  // 4. Europass & Custom Accent Color Setter
  const handleSelectAccentColor = (hex: string) => {
    const normalized = normalizeHexColor(hex, '#0E4194');
    setCvData((prev) => ({
      ...prev,
      accentColor: normalized,
      accentMode: normalized === '#F97316' ? 'orange' : 'classic',
    }));
  };

  // 5. Instant Vector A4 PDF Download (No Print Dialog Required)
  const handleDownloadPdf = () => {
    try {
      const generatedName = generateCvPdf(cvData);
      showBannerMessage(
        'success',
        `Downloaded selectable A4 PDF (${generatedName}) with your chosen color theme.`
      );
    } catch {
      showBannerMessage('error', 'Unable to generate PDF right now. Please check your entries and try again.');
    }
  };

  // Section Reordering Handlers
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    setCvData((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.sectionOrder.length) return prev;
      const next = [...prev.sectionOrder];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sectionOrder: next };
    });
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    setCvData((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.sectionOrder.length ||
        toIndex >= prev.sectionOrder.length
      ) {
        return prev;
      }
      const next = [...prev.sectionOrder];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, sectionOrder: next };
    });
  };

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <div id="cv-builder-page" className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* TOP UTILITY BAR (Breadcrumb + Local Privacy Guarantee + JSON/Accent/PDF Controls) */}
      <div className="bg-[#FFFFFF] border-b border-slate-200 cv-no-print print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Row 1: Breadcrumb + Privacy Notice */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
            >
              <a
                href="/"
                onClick={(e) => handleAnchorNav(e, 'home')}
                className="font-medium text-slate-600 hover:text-[#111827] transition-colors cursor-pointer"
              >
                University-Tutors.com
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a
                href="/tools"
                onClick={(e) => handleAnchorNav(e, 'tools')}
                className="font-medium text-slate-600 hover:text-[#111827] transition-colors cursor-pointer"
              >
                Free Student Tools
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-[#111827]">ATS CV &amp; Resume Maker</span>
            </nav>

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-lg self-start lg:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                100% Free &amp; Private — Edited locally in your browser. Data never leaves your device.
              </span>
            </div>
          </div>

          {/* Row 2: Title + 5 Action Controls */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
            <div>
              <h1
                className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                ATS-Friendly Student CV &amp; Academic Resume Builder
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Single-column selectable typography engineered for university admissions, research labs, and Workday/Greenhouse ATS parsers.
              </p>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Save JSON */}
              <button
                type="button"
                onClick={handleSaveJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 rounded-xl bg-[#F9FAFB] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#111827] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Save JSON</span>
              </button>

              {/* 2. Load JSON */}
              <input
                ref={jsonUploadRef}
                type="file"
                accept=".json,application/json"
                onChange={handleLoadJson}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jsonUploadRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 rounded-xl bg-[#F9FAFB] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#111827] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Load JSON</span>
              </button>

              {/* 3. Reset Sample */}
              <button
                type="button"
                onClick={handleResetSample}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  confirmReset
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-[#F9FAFB] hover:bg-slate-100 border-slate-200 text-[#111827]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>{confirmReset ? 'Click to Confirm Reset' : 'Reset Sample'}</span>
              </button>

              {/* 4. Instant Automatic Download PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Row 3: Europass-Inspired Color Theme Picker + Custom Hex Selector */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Palette className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>Europass &amp; Academic Accent Theme:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {EUROPASS_COLOR_THEMES.map((theme) => {
                const isSelected =
                  normalizeHexColor(cvData.accentColor).toUpperCase() === theme.hex.toUpperCase();
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectAccentColor(theme.hex)}
                    title={`${theme.name} (${theme.hex})`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] sm:min-h-0 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: theme.hex }}
                      className="w-3.5 h-3.5 rounded-full border border-white/60 inline-flex items-center justify-center shrink-0"
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span>{theme.shortLabel}</span>
                  </button>
                );
              })}

              {/* Custom Hex Color Picker */}
              <label
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] sm:min-h-0 rounded-xl bg-[#FFFFFF] border border-slate-300 hover:border-[#F97316] text-xs font-mono font-semibold text-[#111827] cursor-pointer whitespace-nowrap shrink-0"
                title="Pick any custom accent hex color"
              >
                <input
                  type="color"
                  aria-label="Custom CV accent color"
                  value={normalizeHexColor(cvData.accentColor, '#0E4194')}
                  onChange={(e) => handleSelectAccentColor(e.target.value)}
                  className="w-5 h-5 rounded border-0 p-0 bg-transparent cursor-pointer"
                />
                <span>{normalizeHexColor(cvData.accentColor, '#0E4194')}</span>
              </label>
            </div>
          </div>

          {statusNotice && (
            <div
              className={`rounded-xl px-3.5 py-2 text-xs font-medium flex items-center gap-2 border ${
                statusNotice.kind === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {statusNotice.kind === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusNotice.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE VIEW SWITCHER (< lg screens, Hidden in Print) */}
      <div className="lg:hidden max-w-[1440px] w-full mx-auto px-4 pt-4 cv-no-print print:hidden">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FFFFFF] border border-slate-200 rounded-xl">
          <button
            type="button"
            onClick={() => setMobilePane('edit')}
            className={`py-2.5 min-h-[44px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mobilePane === 'edit' ? 'bg-[#F97316] text-white' : 'text-slate-600'
            }`}
          >
            Edit CV Sections
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('preview')}
            className={`py-2.5 min-h-[44px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mobilePane === 'preview' ? 'bg-[#F97316] text-white' : 'text-slate-600'
            }`}
          >
            Live A4 Preview
          </button>
        </div>
      </div>

      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      <section
        id="cv-workspace-grid"
        className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: INTERACTIVE ACCORDION FORM EDITOR */}
          <div
            className={`lg:col-span-5 cv-no-print print:hidden ${
              mobilePane === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <CvForm
              data={cvData}
              onChange={setCvData}
              onMoveSection={handleMoveSection}
              onReorderSections={handleReorderSections}
            />
          </div>

          {/* RIGHT PANEL: LIVE A4 DOCUMENT PREVIEW (Sticky on Desktop) */}
          <div
            id="cv-preview-column"
            className={`lg:col-span-7 lg:sticky lg:top-24 ${
              mobilePane === 'edit' ? 'hidden lg:block print:block' : 'block'
            }`}
          >
            <CvA4Preview
              data={cvData}
              onMoveSection={handleMoveSection}
              onReorderSections={handleReorderSections}
              onPrint={handleDownloadPdf}
            />
          </div>
        </div>
      </section>

      {/* SUBJECT-MATCHED TUTOR & CAREER COACHING CTA (DIRECTLY BELOW WORKSPACE) */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 cv-no-print print:hidden">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-bold text-[#EA580C]">
              University-Tutors.com · Admissions &amp; Academic Career Desk
            </p>
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#111827] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Want a PhD Mentor or Admissions Specialist to Review Your CV, SOP, or Scholarship Application?
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Get personalized 1-on-1 feedback on your academic resume, cover letter, and university application strategy.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/services/essay-reference-checks"
              onClick={(e) => handleAnchorNav(e, 'service-essay')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Book a 1-on-1 Career &amp; Admissions Coach →</span>
            </a>
          </div>
        </div>
      </section>

      {/* VERIFIED ADMISSIONS & CAREER MENTOR CARDS */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 cv-no-print print:hidden">
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {admissionsBranding.tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-[#F9FAFB] border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-orange-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <CoachAvatar tutor={tutor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#111827] truncate">{tutor.name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">
                        {tutor.credential}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#EA580C]">{tutor.specialty}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating}★
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tutor.sessionsCompleted}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">Verified Mentor</span>
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

      {/* SEO HOW IT WORKS & STUDENT FAQS */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 cv-no-print print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EA580C]">ATS Resume Workflow</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                How the ATS Student CV Builder Works
              </h2>
            </div>

            <div className="space-y-3.5">
              {cvToolMeta.howItWorks.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 flex items-start gap-4"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {step.stepNumber}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EA580C]">Applicant Tracking System Tips</p>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                Frequently Asked Student CV Questions
              </h2>
            </div>

            <div className="space-y-3">
              {cvToolMeta.faqs.map((faq, idx) => {
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

      {/* RELATED STUDENT TOOLS */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14 cv-no-print print:hidden">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-lg sm:text-xl font-display font-bold text-[#111827] tracking-tight">
            Related Application &amp; Admission Utilities
          </h2>
          <a
            href="/tools"
            onClick={(e) => handleAnchorNav(e, 'tools')}
            className="text-xs sm:text-sm font-semibold text-[#EA580C] hover:text-[#111827] transition-colors cursor-pointer"
          >
            All Student Tools →
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-orange-200/80 text-[#F97316] flex items-center justify-center">
                    {renderToolIcon(rel.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-xs text-slate-500">{rel.category}</span>
                </div>
                <h3 className="text-base font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  {rel.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rel.cardSummary}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] group-hover:text-[#EA580C]">
                <span>Open Free Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* GLOBAL SITE FOOTER */}
      <div className="mt-auto cv-no-print print:hidden">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
