import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  Eye,
  FileDown,
  FileText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { downloadAcademicReportPdf } from '../../utils/pdfReportGenerator';
import {
  ACADEMIC_PARAPHRASER_SAMPLES,
  PARAPHRASE_MODES,
  ParaphraseMode,
  StylometryReport,
  analyzeStylometry,
  computeRefinedDiffTokens,
  computeSourceOverlap,
  paraphraseLocally,
  runHybridAcademicParaphraser,
  segmentSentenceClichés,
} from '../../utils/academicParaphraserEngine';
import {
  FeaturedTutorCardData,
  STUDENT_TOOLS,
  STUDENT_TOOLS_BY_SLUG,
  TUTOR_BRANDING_MAP,
} from '../../data/studentToolsData';
import { isModifiedAnchorClick } from '../../data/dedicatedServiceRoutes';
import { renderToolIcon } from './ToolPageLayout';
import SiteFooter from './SiteFooter';

interface AcademicParaphraserProps {
  onNavigate?: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

const FEATURED_WRITING_COACHES: FeaturedTutorCardData[] = [
  {
    id: 'paraphraser-coach-1',
    name: 'Dr. Eleanor Vance',
    initials: 'EV',
    credential: 'PhD English Literature & Rhetoric · University of Oxford',
    specialty: 'Thesis Editing · APA / MLA · Turnitin Check',
    rating: '5.0',
    sessionsCompleted: '420+ essays coached',
    avatarUrl: TUTOR_BRANDING_MAP.writing.tutors[0]?.avatarUrl || '',
    subjectQuery: 'Academic Writing',
  },
  {
    id: 'paraphraser-coach-2',
    name: 'Prof. Marcus Sterling',
    initials: 'MS',
    credential: 'MPhil Research Methodology · UK',
    specialty: 'Literature Reviews · Harvard Style · ESL Fluency',
    rating: '5.0',
    sessionsCompleted: '340+ papers mentored',
    avatarUrl: TUTOR_BRANDING_MAP.writing.tutors[1]?.avatarUrl || '',
    subjectQuery: 'Research Methods',
  },
  {
    id: 'paraphraser-coach-3',
    name: 'Dr. Zara Khalid',
    initials: 'ZK',
    credential: 'PhD Applied Linguistics & Admissions',
    specialty: 'SOP & Essays · Peer-Review Polish · IEEE / Chicago',
    rating: '5.0',
    sessionsCompleted: '360+ theses reviewed',
    avatarUrl: TUTOR_BRANDING_MAP.writing.tutors[2]?.avatarUrl || '',
    subjectQuery: 'Dissertation',
  },
];

function WritingCoachAvatar({ tutor }: { tutor: FeaturedTutorCardData }) {
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

function ScoreComparisonCard({
  title,
  subtitle,
  origScore,
  rewrittenScore,
  unit = '%',
  higherIsBetter = true,
  origSubLabel,
  rewrittenSubLabel,
}: {
  title: string;
  subtitle: string;
  origScore: number;
  rewrittenScore: number;
  unit?: string;
  higherIsBetter?: boolean;
  origSubLabel: string;
  rewrittenSubLabel: string;
}) {
  const delta = rewrittenScore - origScore;
  const improved = higherIsBetter ? delta > 0 : delta < 0;

  const getBarColor = (val: number) => {
    if (higherIsBetter) {
      if (val >= 68) return 'bg-emerald-600';
      if (val >= 45) return 'bg-amber-500';
      return 'bg-red-500';
    }
    if (val === 0) return 'bg-emerald-600';
    if (val <= 2) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {delta !== 0 && (
          <span
            className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${
              improved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {delta > 0 ? `+${delta}${unit}` : `${delta}${unit}`}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Original Gauge */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Original Draft</span>
            <span className="font-mono font-bold text-[#111827] tabular-nums">
              {origScore}
              {unit} <span className="font-sans font-normal text-slate-500">· {origSubLabel}</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${getBarColor(origScore)}`}
              style={{
                width: `${higherIsBetter ? Math.min(100, origScore) : Math.min(100, origScore * 14)}%`,
              }}
            />
          </div>
        </div>

        {/* Rewritten Gauge */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#EA580C] font-semibold">Rewritten Output</span>
            <span className="font-mono font-bold text-[#111827] tabular-nums">
              {rewrittenScore}
              {unit}{' '}
              <span className="font-sans font-normal text-slate-500">· {rewrittenSubLabel}</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${getBarColor(rewrittenScore)}`}
              style={{
                width: `${
                  higherIsBetter ? Math.min(100, rewrittenScore) : Math.min(100, rewrittenScore * 14)
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SentenceHighlightList({
  label,
  report,
}: {
  label: string;
  report: StylometryReport;
}) {
  if (report.sentences.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#F9FAFB] border border-slate-200 text-xs text-slate-500">
        Enter or load an academic paragraph to inspect sentence-level rhythm and AI phrase flags.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#111827]">{label}</span>
        <span className="text-slate-500 tabular-nums">
          {report.sentenceCount} sentences · Avg {report.avgSentenceLength}w · SD σ ={' '}
          {report.sentenceStdDev}w
        </span>
      </div>

      {/* Sentence-Length Cadence Sparkline */}
      <div
        className="flex items-end gap-1.5 h-10 px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-slate-200"
        aria-label="Sentence length variation bars"
      >
        {report.sentences.map((s) => {
          const heightPct = Math.max(18, Math.min(100, Math.round((s.wordCount / 36) * 100)));
          const barCls =
            s.status === 'red'
              ? 'bg-red-500'
              : s.status === 'amber'
                ? 'bg-amber-500'
                : 'bg-[#F97316]';
          return (
            <div
              key={s.index}
              title={`Sentence ${s.index + 1}: ${s.wordCount} words`}
              className="flex-1 h-full flex items-end"
            >
              <div
                className={`w-full rounded-xs transition-all duration-150 ${barCls}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Highlighted Sentences */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {report.sentences.map((sent) => {
          const containerCls =
            sent.status === 'red'
              ? 'bg-red-50/85 border-red-200 text-red-950'
              : sent.status === 'amber'
                ? 'bg-amber-50/85 border-amber-200 text-amber-950'
                : 'bg-[#F9FAFB] border-slate-200 text-[#111827]';

          return (
            <div
              key={sent.index}
              className={`rounded-xl border p-3 text-xs leading-relaxed space-y-1.5 ${containerCls}`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                <span className="font-semibold">
                  S{sent.index + 1} · {sent.wordCount} words
                </span>
                <span className="font-sans font-semibold">
                  {sent.status === 'red'
                    ? 'High AI Cliché Signal'
                    : sent.status === 'amber'
                      ? 'Transition / Uniform Cadence'
                      : 'Clean Human Cadence'}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed">{sent.text}</p>
              {sent.reasons.length > 0 && (
                <p className="text-[11px] opacity-85 pt-0.5">
                  {sent.reasons.join(' · ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AcademicParaphraser({
  onNavigate = () => {},
  onOpenBecomeTutor,
}: AcademicParaphraserProps) {
  const initialSample = ACADEMIC_PARAPHRASER_SAMPLES[0];

  const [mode, setMode] = useState<ParaphraseMode>('natural');
  const [sampleIndex, setSampleIndex] = useState<number>(0);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [inputText, setInputText] = useState<string>(initialSample.aiDraft);
  const [rewrittenText, setRewrittenText] = useState<string>(() =>
    paraphraseLocally(initialSample.aiDraft, 'natural', 0)
  );
  const [referenceSource, setReferenceSource] = useState<string>(initialSample.referenceSource);

  const [engineBadge, setEngineBadge] = useState<'local-typescript-nlp' | 'chrome-on-device-rewriter'>(
    'local-typescript-nlp'
  );
  const [chromeAiReady, setChromeAiReady] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDiffHighlight, setShowDiffHighlight] = useState<boolean>(true);
  const [isEditingOutput, setIsEditingOutput] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [isOverlapOpen, setIsOverlapOpen] = useState<boolean>(true);
  const [overlapTarget, setOverlapTarget] = useState<'rewritten' | 'original'>('rewritten');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (typeof self !== 'undefined' && ('Rewriter' in self || 'LanguageModel' in self)) {
      setChromeAiReady(true);
    }
  }, []);

  const toolMeta = STUDENT_TOOLS_BY_SLUG['academic-paraphraser'];
  const relatedTools = toolMeta
    ? toolMeta.relatedSlugs.map((slug) => STUDENT_TOOLS_BY_SLUG[slug]).filter(Boolean)
    : [];

  // Inject Schema.org WebApplication + FAQPage JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined' || !toolMeta) return;
    const scriptId = 'academic-paraphraser-jsonld';
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
        name: `${toolMeta.name} — University-Tutors.com`,
        url: 'https://university-tutors.com/tools/academic-paraphraser',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        description: toolMeta.seoDescription,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '15420',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: toolMeta.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ]);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [toolMeta]);

  // Engine 1: Live Stylometry Diagnostics on BOTH Original Draft & Rewritten Output
  const originalReport = useMemo(() => analyzeStylometry(inputText), [inputText]);
  const rewrittenReport = useMemo(() => analyzeStylometry(rewrittenText), [rewrittenText]);

  // Diff tokens comparing refined prose against original draft
  const refinedDiffTokens = useMemo(
    () => computeRefinedDiffTokens(inputText, rewrittenText),
    [inputText, rewrittenText]
  );

  // Engine 3: Live 3-Gram & 4-Gram Source-Overlap Originality Checker
  const rewrittenOverlap = useMemo(
    () => computeSourceOverlap(rewrittenText, referenceSource),
    [rewrittenText, referenceSource]
  );
  const originalOverlap = useMemo(
    () => computeSourceOverlap(inputText, referenceSource),
    [inputText, referenceSource]
  );
  const activeOverlap = overlapTarget === 'rewritten' ? rewrittenOverlap : originalOverlap;

  const executeParaphrase = async (
    draftToProcess: string,
    selectedMode: ParaphraseMode,
    nextSpin: number = 0
  ) => {
    if (!draftToProcess.trim()) {
      setRewrittenText('');
      return;
    }
    const instantLocal = paraphraseLocally(draftToProcess, selectedMode, nextSpin);
    setRewrittenText(instantLocal);

    setIsProcessing(true);
    try {
      const res = await runHybridAcademicParaphraser(draftToProcess, selectedMode, nextSpin);
      setRewrittenText(res.output);
      setEngineBadge(res.engineUsed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = (nextMode: ParaphraseMode) => {
    setMode(nextMode);
    setSpinCount(0);
    setIsEditingOutput(false);
    void executeParaphrase(inputText, nextMode, 0);
  };

  const handleOriginalInputChange = (nextVal: string) => {
    setInputText(nextVal);
    setSpinCount(0);
    setRewrittenText(paraphraseLocally(nextVal, mode, 0));
  };

  const handleReSpinVariation = () => {
    if (!inputText.trim()) return;
    const nextSpin = spinCount + 1;
    setSpinCount(nextSpin);
    setIsEditingOutput(false);
    void executeParaphrase(inputText, mode, nextSpin);
    showToast(`Generated variation #${nextSpin + 1}`);
  };

  const handleLoadSampleDraft = () => {
    const nextIdx = (sampleIndex + 1) % ACADEMIC_PARAPHRASER_SAMPLES.length;
    const preset = ACADEMIC_PARAPHRASER_SAMPLES[nextIdx];
    setSampleIndex(nextIdx);
    setSpinCount(0);
    setIsEditingOutput(false);
    setInputText(preset.aiDraft);
    setReferenceSource(preset.referenceSource);
    setIsOverlapOpen(true);
    void executeParaphrase(preset.aiDraft, mode, 0);
    showToast(`Loaded sample draft: ${preset.discipline}`);
  };

  const handleSelectSpecificSample = (idx: number) => {
    const preset = ACADEMIC_PARAPHRASER_SAMPLES[idx];
    if (!preset) return;
    setSampleIndex(idx);
    setSpinCount(0);
    setIsEditingOutput(false);
    setInputText(preset.aiDraft);
    setReferenceSource(preset.referenceSource);
    setIsOverlapOpen(true);
    void executeParaphrase(preset.aiDraft, mode, 0);
    showToast(`Loaded ${preset.discipline} sample`);
  };

  const handleLoadSampleSource = () => {
    const preset = ACADEMIC_PARAPHRASER_SAMPLES[sampleIndex] || ACADEMIC_PARAPHRASER_SAMPLES[0];
    setReferenceSource(preset.referenceSource);
    setIsOverlapOpen(true);
    showToast('Loaded sample reference passage');
  };

  const handleCopyRewritten = async () => {
    if (!rewrittenText.trim()) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
    } catch {
      const el = document.createElement('textarea');
      el.value = rewrittenText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedOutput(true);
    showToast('Refined text copied to clipboard');
    window.setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!rewrittenText.trim()) return;
    const activeModeMeta = PARAPHRASE_MODES.find((m) => m.id === mode);
    const fileBody = [
      'University-Tutors.com — Academic Paraphraser & Stylometry Summary',
      `Mode: ${activeModeMeta?.label || mode}`,
      `Rewritten Word Count: ${rewrittenReport.wordCount} words (${rewrittenReport.charCount} characters)`,
      `Human Rhythm (Burstiness): ${rewrittenReport.burstinessScore}% · Lexical Diversity: ${rewrittenReport.lexicalDiversityScore}% · Natural Phrasing: ${rewrittenReport.clichéFreeScore}%`,
      referenceSource.trim()
        ? `Reference Source Similarity: ${rewrittenOverlap.overallSimilarityPct}% (3-gram: ${rewrittenOverlap.threeGramOverlapPct}%, 4-gram: ${rewrittenOverlap.fourGramOverlapPct}%)`
        : '',
      '------------------------------------------------------------------------',
      '',
      rewrittenText.trim(),
      '',
    ]
      .filter((line) => line !== undefined)
      .join('\n');

    const blob = new Blob([fileBody], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-paraphrased-${mode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded refined passage (.txt)');
  };

  const handleDownloadPdf = () => {
    if (!rewrittenText.trim()) return;
    const activeModeMeta = PARAPHRASE_MODES.find((m) => m.id === mode);
    const metadataRows = [
      { label: 'Academic Rewrite Mode', value: activeModeMeta?.label || mode },
      {
        label: 'Word & Character Count',
        value: `${rewrittenReport.wordCount} words (${rewrittenReport.charCount} characters)`,
      },
      {
        label: 'Stylometry Diagnostics',
        value: `Human Burstiness: ${rewrittenReport.burstinessScore}% · Lexical Diversity: ${rewrittenReport.lexicalDiversityScore}% · AI Clichés: ${rewrittenReport.clichéCount}`,
      },
    ];
    if (referenceSource.trim()) {
      metadataRows.push({
        label: 'Source N-Gram Originality',
        value: `Overall Overlap: ${rewrittenOverlap.overallSimilarityPct}% (3-gram: ${rewrittenOverlap.threeGramOverlapPct}%, 4-gram: ${rewrittenOverlap.fourGramOverlapPct}%)`,
      });
    }

    downloadAcademicReportPdf({
      filename: `Academic-Paraphrased-${mode}.pdf`,
      title: 'Academic Paraphraser & Stylometry Originality Report',
      subtitle: 'Refined scholarly prose with burstiness, lexical richness, and N-gram diagnostics',
      badgeText: 'WRITING & INTEGRITY',
      metadataRows,
      sections: [
        {
          heading: 'Rewritten Academic Passage',
          lines: rewrittenText.trim().split('\n'),
        },
        ...(inputText.trim()
          ? [
              {
                heading: 'Original Draft (For Comparison)',
                lines: inputText.trim().split('\n'),
              },
            ]
          : []),
      ],
    });
    showToast('Downloaded academic originality report (.pdf)');
  };

  const handleResetWorkspace = () => {
    setInputText('');
    setRewrittenText('');
    setReferenceSource('');
    setSpinCount(0);
    setIsEditingOutput(false);
    showToast('Workspace cleared');
  };

  const handleAnchorNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  const wordDelta = rewrittenReport.wordCount - originalReport.wordCount;
  const wordDeltaPct =
    originalReport.wordCount > 0
      ? Math.round((wordDelta / originalReport.wordCount) * 100)
      : 0;
  const rhythmDelta = rewrittenReport.burstinessScore - originalReport.burstinessScore;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col">
      {/* Subtle Action Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700"
        >
          {toastMessage}
        </div>
      )}

      {/* 1. Top Breadcrumb & Local Privacy Bar */}
      <div className="bg-[#FFFFFF] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <a
              href="/tools"
              onClick={(e) => handleAnchorNav(e, 'tools')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors mr-2 whitespace-nowrap shrink-0 cursor-pointer"
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
              <span className="font-semibold text-[#111827] truncate max-w-[230px] sm:max-w-none">
                Academic Paraphraser &amp; Originality Checker
              </span>
            </nav>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-lg self-start md:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              100% Free &amp; Browser-Based ($0 API Cost) ·{' '}
              {chromeAiReady ? 'Chrome On-Device AI + NLP Ready' : 'Client-Side NLP Engine Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-[#FFFFFF] border-b border-slate-200/80 pt-7 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-4xl space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-[#EA580C] font-semibold">Writing &amp; Academic Integrity</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9★ Used by 15,000+ University Students
                </span>
                <span aria-hidden="true">·</span>
                <span>Zero Sign-Up · Unlimited Words</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Free Academic Paraphraser, AI-Pattern Analyzer &amp; Originality Checker
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                Stylometric Burstiness Diagnostics · Natural Flow Refiner · 3-Gram &amp; 4-Gram Originality Checker — processed 100% locally in your browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadSampleDraft}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] sm:min-h-0 rounded-xl bg-[#FFF7ED] hover:bg-orange-100/80 text-[#EA580C] border border-orange-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Load Sample AI Draft</span>
              </button>
              <button
                type="button"
                onClick={handleResetWorkspace}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={() => void executeParaphrase(inputText, mode, spinCount)}
                disabled={isProcessing || !inputText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] sm:min-h-0 rounded-xl bg-[#111827] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Analyzing...' : 'Refine & Analyze Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main 3-Engine Interactive Workspace */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* A. Mode Selector Bar + Sample Discipline Switcher */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-[#F97316] shrink-0" />
              <span>Academic Rewrite Mode:</span>
              <span className="text-slate-400 font-normal hidden sm:inline">
                ({PARAPHRASE_MODES.find((m) => m.id === mode)?.description})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Sample Presets:</span>
              {ACADEMIC_PARAPHRASER_SAMPLES.map((preset, idx) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectSpecificSample(idx)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    sampleIndex === idx && inputText === preset.aiDraft
                      ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C] font-semibold'
                      : 'bg-[#F9FAFB] border-slate-200 text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  {preset.discipline}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Academic Modes Segmented Bar */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
            role="tablist"
            aria-label="Academic Paraphrasing Modes"
          >
            {PARAPHRASE_MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleModeChange(m.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FFF7ED] border-[#F97316] shadow-2xs'
                      : 'bg-[#F9FAFB] border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold whitespace-nowrap truncate ${
                        active ? 'text-[#EA580C]' : 'text-[#111827]'
                      }`}
                    >
                      {m.label}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-[#F97316] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{m.shortTag}</p>
                </button>
              );
            })}
          </div>

          {/* Split-Screen Original Draft vs. Rewritten Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1 items-stretch">
            {/* LEFT PANE: Original Draft + Inline Cliché & Uniform Cadence Scanner */}
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="px-4 py-3 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="academic-original-draft"
                    className="text-xs sm:text-sm font-bold text-[#111827]"
                  >
                    1. Original Draft
                  </label>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border font-mono tabular-nums ${
                      originalReport.burstinessScore < 55
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Human Rhythm: {originalReport.burstinessScore}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  {originalReport.wordCount} words · {originalReport.sentenceCount}{' '}
                  {originalReport.sentenceCount === 1 ? 'sentence' : 'sentences'}
                </div>
              </div>

              <textarea
                id="academic-original-draft"
                value={inputText}
                onChange={(e) => handleOriginalInputChange(e.target.value)}
                rows={9}
                placeholder="Paste your essay paragraph, literature review, or assignment draft here..."
                className="w-full min-h-[210px] p-4 bg-white border-b border-slate-200/80 focus:outline-none text-base sm:text-sm text-[#111827] leading-relaxed resize-y"
              />

              {/* Compact Inline AI Cliché & Uniform Cadence Scanner */}
              <div className="p-3.5 space-y-2 bg-[#F9FAFB]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    AI Cliché &amp; Uniform Cadence Scanner
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border tabular-nums ${
                      originalReport.clichéCount > 0
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {originalReport.clichéCount} AI phrase{originalReport.clichéCount === 1 ? '' : 's'} flagged
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto">
                  {!inputText.trim() ? (
                    <span className="text-slate-400">
                      Type or paste text above to scan for AI clichés and robotic sentence uniformity...
                    </span>
                  ) : (
                    originalReport.sentences.map((sent, sIdx) => {
                      const segments = segmentSentenceClichés(sent.text);
                      return (
                        <React.Fragment key={sent.index}>
                          <span
                            className={
                              sent.isUniformCadence
                                ? 'bg-amber-50 border-b border-amber-300 px-0.5 rounded-xs'
                                : undefined
                            }
                          >
                            {segments.map((seg, segIdx) =>
                              seg.isCliché ? (
                                <mark
                                  key={segIdx}
                                  title={`AI Cliché — try: ${seg.suggestion}`}
                                  className="bg-red-100 text-red-900 font-semibold px-1 rounded-xs border border-red-300"
                                >
                                  {seg.text}
                                </mark>
                              ) : (
                                <React.Fragment key={segIdx}>{seg.text}</React.Fragment>
                              )
                            )}
                          </span>
                          {sIdx < originalReport.sentences.length - 1 ? ' ' : ''}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">
                    Engine:{' '}
                    <strong className="text-slate-700">
                      {engineBadge === 'chrome-on-device-rewriter'
                        ? 'Chrome On-Device Rewriter + NLP'
                        : 'Instant Client-Side NLP'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => void executeParaphrase(inputText, mode, spinCount)}
                    disabled={isProcessing || !inputText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'Refining Prose...' : 'Paraphrase & Refine →'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANE: Refined Academic Output with Highlight Edits + Re-Spin + PDF/TXT Export */}
            <div className="bg-white border-2 border-[#F97316]/80 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="px-4 py-3 border-b border-orange-100 bg-[#FFF7ED]/70 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#EA580C] flex items-center gap-1.5">
                    <BookCheck className="w-4 h-4 shrink-0" />
                    <span>2. Refined Academic Output</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono tabular-nums">
                    Human Rhythm: {rewrittenReport.burstinessScore}% ({rhythmDelta >= 0 ? `+${rhythmDelta}` : rhythmDelta}%)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!isEditingOutput && (
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showDiffHighlight}
                        onChange={(e) => setShowDiffHighlight(e.target.checked)}
                        className="accent-[#F97316] rounded w-3.5 h-3.5"
                      />
                      <span>Highlight Edits</span>
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsEditingOutput((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-orange-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    {isEditingOutput ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>View Diffs</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Edit Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isEditingOutput ? (
                <textarea
                  id="academic-rewritten-output"
                  value={rewrittenText}
                  onChange={(e) => setRewrittenText(e.target.value)}
                  rows={12}
                  placeholder="Your refined university-grade prose will appear here. Edit sentences directly to fine-tune live diagnostics..."
                  className="w-full flex-1 min-h-[260px] p-4 bg-white focus:outline-none text-base sm:text-sm text-[#111827] leading-relaxed resize-y"
                />
              ) : (
                <div
                  aria-label="Refined academic output"
                  className="flex-1 min-h-[260px] p-4 text-sm text-[#111827] leading-relaxed overflow-y-auto bg-white whitespace-pre-wrap"
                >
                  {!rewrittenText.trim() ? (
                    <span className="text-slate-400">
                      Your refined, human-rhythmed academic text will appear here...
                    </span>
                  ) : !showDiffHighlight ? (
                    rewrittenText
                  ) : (
                    refinedDiffTokens.map((tok, i) =>
                      tok.isEdited ? (
                        <span
                          key={i}
                          className="bg-orange-100/85 text-orange-950 font-medium px-1 py-0.5 rounded-xs"
                        >
                          {tok.text}
                        </span>
                      ) : (
                        <React.Fragment key={i}>{tok.text}</React.Fragment>
                      )
                    )
                  )}
                </div>
              )}

              <div className="border-t border-slate-100 bg-[#F9FAFB] px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  {rewrittenReport.wordCount} words · {rewrittenReport.sentenceCount}{' '}
                  {rewrittenReport.sentenceCount === 1 ? 'sentence' : 'sentences'}
                  {originalReport.wordCount > 0 && rewrittenReport.wordCount > 0 && wordDelta !== 0 && (
                    <span className="text-[#EA580C] font-semibold ml-1.5">
                      ({wordDelta > 0 ? `+${wordDelta}` : wordDelta}w / {wordDeltaPct > 0 ? `+${wordDeltaPct}` : wordDeltaPct}%)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReSpinVariation}
                    disabled={!inputText.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 disabled:opacity-50 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Spin Variation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCopyRewritten()}
                    disabled={!rewrittenText.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#FFFFFF] hover:bg-slate-50 disabled:opacity-50 text-[#111827] border border-slate-300 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedOutput ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    disabled={!rewrittenText.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#FFFFFF] hover:bg-slate-50 disabled:opacity-50 text-[#111827] border border-slate-300 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download .txt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={!rewrittenText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B. ENGINE 1: AI Writing Pattern & Stylometry Analyzer (Before vs. After) */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[#111827]">
                Stylometric &amp; AI-Pattern Diagnostics (Before vs. After)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Measures sentence-length burstiness (standard deviation σ), lexical diversity, and templated LLM phrase density locally in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-200 border border-red-400 inline-block" />
                <span>Flagged AI Cliché</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-400 inline-block" />
                <span>Uniform Sentence Cadence</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-100 border border-orange-300 inline-block" />
                <span>Refined Phrase</span>
              </span>
            </div>
          </div>

          {/* 3 Before -> After Progress Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreComparisonCard
              title="Human Rhythm (Burstiness)"
              subtitle="Standard deviation of sentence lengths — mixes punchy & analytical sentences"
              origScore={originalReport.burstinessScore}
              rewrittenScore={rewrittenReport.burstinessScore}
              unit="%"
              higherIsBetter={true}
              origSubLabel={`σ=${originalReport.sentenceStdDev}w (${originalReport.burstinessLabel})`}
              rewrittenSubLabel={`σ=${rewrittenReport.sentenceStdDev}w (${rewrittenReport.burstinessLabel})`}
            />

            <ScoreComparisonCard
              title="Lexical Diversity (Type-Token)"
              subtitle="Unique-to-total vocabulary ratio — eliminates repetitive AI word loops"
              origScore={originalReport.lexicalDiversityScore}
              rewrittenScore={rewrittenReport.lexicalDiversityScore}
              unit="%"
              higherIsBetter={true}
              origSubLabel={`${originalReport.uniqueWordRatio}% unique`}
              rewrittenSubLabel={`${rewrittenReport.uniqueWordRatio}% unique`}
            />

            <ScoreComparisonCard
              title="Natural Phrasing (Cliché-Free)"
              subtitle="Detects overused LLM markers (delve into, tapestry, underscore, realm of)"
              origScore={originalReport.clichéFreeScore}
              rewrittenScore={rewrittenReport.clichéFreeScore}
              unit="%"
              higherIsBetter={true}
              origSubLabel={`${originalReport.clichéCount} flagged · ${originalReport.passiveCount} passive`}
              rewrittenSubLabel={`${rewrittenReport.clichéCount} flagged · ${rewrittenReport.passiveCount} passive`}
            />
          </div>

          {/* Detected Cliché Phrase Summary Strip */}
          {originalReport.clichéHits.length > 0 && (
            <div className="rounded-xl bg-[#FFF7ED] border border-orange-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Detected {originalReport.clichéHits.length} LLM Template / Filler Phrase
                  {originalReport.clichéHits.length === 1 ? '' : 's'} in Original Draft:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {originalReport.clichéHits.map((hit, idx) => (
                  <span
                    key={`${hit.phrase}-${idx}`}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                      hit.severity === 'high'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    &ldquo;{hit.matchedText}&rdquo; → <span className="opacity-80">{hit.suggestion}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-Side Highlighted Sentence Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
            <SentenceHighlightList
              label="Original Draft — Sentence Diagnostics"
              report={originalReport}
            />
            <SentenceHighlightList
              label="Rewritten Output — Sentence Diagnostics"
              report={rewrittenReport}
            />
          </div>
        </div>

        {/* C. ENGINE 3: Collapsible Source-Overlap & Originality Checker (N-Gram Similarity) */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F9FAFB]/70 border-b border-slate-100">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#111827]">
                  3. Source-Overlap &amp; Originality Checker (3-Gram &amp; 4-Gram Similarity)
                </h2>
                {referenceSource.trim() && (
                  <span
                    className={`text-xs font-mono font-bold tabular-nums px-2.5 py-0.5 rounded-md border ${
                      rewrittenOverlap.verdict === 'high-originality'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rewrittenOverlap.verdict === 'moderate-overlap'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-red-50 text-red-900 border-red-200'
                    }`}
                  >
                    {rewrittenOverlap.overallSimilarityPct}% Similarity
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Paste any cited journal or textbook passage to verify 3-gram and 4-gram paraphrase originality.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadSampleSource}
                className="px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-300 bg-white hover:bg-[#FFF7ED] hover:border-orange-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Load Sample Reference Source
              </button>
              <button
                type="button"
                onClick={() => setIsOverlapOpen((prev) => !prev)}
                aria-expanded={isOverlapOpen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{isOverlapOpen ? 'Hide Panel' : 'Show Panel'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOverlapOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {isOverlapOpen && (
            <div className="px-5 sm:px-6 pb-6 pt-5 space-y-5">
              {/* Dual Original vs. Refined Source Similarity Scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-[#F9FAFB] p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Original Draft vs. Source</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">3-gram / 4-gram phrase overlap</div>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-red-600 tabular-nums">
                    {originalOverlap.overallSimilarityPct}%
                  </div>
                </div>
                <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-emerald-900">Refined Output vs. Source</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Target: &lt; 10% overlap + citation</div>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-emerald-700 tabular-nums">
                    {rewrittenOverlap.overallSimilarityPct}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Paste Reference Source Box */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="reference-source-input"
                      className="font-bold text-[#111827]"
                    >
                      Paste Reference Source / Textbook Passage You Cited:
                    </label>
                    {referenceSource && (
                      <button
                        type="button"
                        onClick={() => setReferenceSource('')}
                        className="text-slate-500 hover:text-[#EA580C] font-medium cursor-pointer"
                      >
                        Clear source
                      </button>
                    )}
                  </div>
                  <textarea
                    id="reference-source-input"
                    value={referenceSource}
                    onChange={(e) => setReferenceSource(e.target.value)}
                    rows={6}
                    placeholder="Paste the original journal article or textbook paragraph here to verify that your paraphrase contains zero unparaphrased phrase chains..."
                    className="w-full p-3.5 rounded-xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none text-base sm:text-sm text-[#111827] leading-relaxed resize-y"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Academic synthesis tip: Even at 0% verbatim phrase overlap, always include an in-text citation (e.g., APA, MLA, Harvard) crediting the original author’s idea.
                  </p>
                </div>

                {/* N-Gram Metrics + Amber Highlighted Comparison View */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setOverlapTarget('rewritten')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          overlapTarget === 'rewritten'
                            ? 'bg-[#FFFFFF] text-[#EA580C] shadow-2xs border border-orange-200/80'
                            : 'text-slate-600 hover:text-[#111827]'
                        }`}
                      >
                        Rewritten vs. Source ({rewrittenOverlap.overallSimilarityPct}%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverlapTarget('original')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          overlapTarget === 'original'
                            ? 'bg-[#FFFFFF] text-[#EA580C] shadow-2xs border border-orange-200/80'
                            : 'text-slate-600 hover:text-[#111827]'
                        }`}
                      >
                        Original vs. Source ({originalOverlap.overallSimilarityPct}%)
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600">
                      <span>
                        3-Gram: <strong className="text-[#111827]">{activeOverlap.threeGramOverlapPct}%</strong>
                      </span>
                      <span>·</span>
                      <span>
                        4-Gram: <strong className="text-[#111827]">{activeOverlap.fourGramOverlapPct}%</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Matched Words:{' '}
                        <strong className="text-[#111827]">
                          {activeOverlap.matchedWordCount}/{activeOverlap.totalCandidateWords}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Verdict Banner */}
                  <div
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                      activeOverlap.verdict === 'high-originality'
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : activeOverlap.verdict === 'moderate-overlap'
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <span>{activeOverlap.verdictLabel}</span>
                    <span className="font-mono font-bold tabular-nums shrink-0">
                      {activeOverlap.overallSimilarityPct}% Overlap
                    </span>
                  </div>

                  {/* Highlighted Candidate Passage (Amber Spans for Verbatim N-Grams) */}
                  <div className="p-4 rounded-xl bg-[#F9FAFB] border border-slate-200 text-xs sm:text-sm text-[#111827] leading-relaxed min-h-[120px]">
                    {activeOverlap.segments.length === 0 ? (
                      <span className="text-slate-400">
                        No text available to compare yet.
                      </span>
                    ) : (
                      activeOverlap.segments.map((seg, i) =>
                        seg.isMatch ? (
                          <mark
                            key={i}
                            className="bg-amber-200/85 text-amber-950 px-1 py-0.5 rounded-xs underline decoration-amber-600 decoration-2 font-medium"
                            title="Matches 3-gram / 4-gram phrase from Reference Source"
                          >
                            {seg.text}
                          </mark>
                        ) : (
                          <React.Fragment key={i}>{seg.text}</React.Fragment>
                        )
                      )
                    )}
                  </div>

                  {activeOverlap.matchedPhrases.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-amber-900">
                        Unparaphrased Matching Sequences (Rewrite in Your Own Structure):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeOverlap.matchedPhrases.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-amber-50 border border-amber-200 text-amber-950 px-2.5 py-1 rounded-lg"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. CONVERSION & SUBJECT-MATCHED TUTOR BRANDING (DIRECTLY BELOW WORKSPACE) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#FFFFFF] border-2 border-orange-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-slate-100">
            <div className="max-w-3xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#EA580C]">
                <span>University-Tutors.com · Academic Integrity &amp; Human Editing</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-700">Official Turnitin Verification Available</span>
              </div>

              <h2
                className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#111827] tracking-tight leading-snug"
                style={{ textWrap: 'balance' }}
              >
                Want a Human PhD Specialist to Edit Your Essay, Verify Citations &amp; Provide an Official Turnitin Report?
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Ensure 100% human-crafted academic excellence with personalized 1-on-1 coaching and an official Turnitin Originality &amp; AI report.
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('service-essay')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Book 1-on-1 Writing Coach →</span>
              </button>
            </div>
          </div>

          {/* 3 Featured Academic Writing & Editing Tutors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURED_WRITING_COACHES.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-[#F9FAFB] border border-slate-200 hover:border-orange-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <WritingCoachAvatar tutor={tutor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#111827] truncate">{tutor.name}</h3>
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 shrink-0"
                          aria-label="Verified PhD Specialist"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">
                        {tutor.credential}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-3 py-1.5 rounded-lg leading-snug">
                    {tutor.specialty}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating}★
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tutor.sessionsCompleted}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">Verified PhD</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(`subject:${tutor.subjectQuery}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Book 1-on-1 Writing Coach →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEO How It Works & Student FAQs */}
      {toolMeta && (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#EA580C]">Ethical Revision Workflow</p>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                  How the Academic Paraphraser &amp; Analyzer Works
                </h2>
                <p className="text-sm text-slate-600">
                  Strengthen clarity, scholarly voice, and source synthesis locally in three steps.
                </p>
              </div>

              <div className="space-y-4">
                {toolMeta.howItWorks.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <span className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
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

            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#EA580C]">Academic Integrity &amp; Stylometry FAQs</p>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-slate-600">
                  Common student questions on burstiness metrics, N-gram source similarity, citations, and privacy.
                </p>
              </div>

              <div className="space-y-3">
                {toolMeta.faqs.map((faq, idx) => {
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
      )}

      {/* 6. Related Free Writing & Citation Tools */}
      {relatedTools.length > 0 && (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#111827] tracking-tight">
                Related Academic Writing &amp; Citation Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Pair clean prose with accurate APA/MLA/Harvard bibliographies and word-limit tracking.
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
      )}

      {/* 7. University-Tutors.com Global Footer */}
      <div className="mt-auto">
        <SiteFooter onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </div>
    </div>
  );
}
