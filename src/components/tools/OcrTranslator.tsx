import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import {
  ScanText,
  Languages,
  Upload,
  Copy,
  Check,
  Download,
  FileDown,
  ArrowLeftRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { downloadAcademicReportPdf } from '../../utils/pdfReportGenerator';

export type OcrTranslatorTab = 'ocr' | 'translator';

interface OcrTranslatorProps {
  initialTab?: OcrTranslatorTab;
  onNavigate?: (view: string) => void;
}

const OCR_LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'deu', label: 'German (Deutsch)' },
  { code: 'fra', label: 'French (Français)' },
  { code: 'spa', label: 'Spanish (Español)' },
];

const TRANSLATOR_LANGUAGES = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'de', name: 'German (Deutsch)', rtl: false },
  { code: 'fr', name: 'French (Français)', rtl: false },
  { code: 'es', name: 'Spanish (Español)', rtl: false },
  { code: 'ar', name: 'Arabic (العربية)', rtl: true },
  { code: 'ur', name: 'Urdu (اردو)', rtl: true },
  { code: 'zh-CN', name: 'Chinese (简体中文)', rtl: false },
];

const SAMPLE_ACADEMIC_SENTENCES = [
  {
    label: 'Research Abstract',
    src: 'en',
    tgt: 'de',
    text: 'This empirical study evaluates the correlation between structured peer tutoring and cumulative grade point average across first-year STEM cohorts.',
  },
  {
    label: 'German B1 Seminar',
    src: 'de',
    tgt: 'en',
    text: 'Die wissenschaftliche Methodik erfordert eine kritische Quellenanalyse sowie eine präzise Zitierweise in der Abschlussarbeit.',
  },
  {
    label: 'Thesis Methodology',
    src: 'en',
    tgt: 'fr',
    text: 'Qualitative interviews were conducted with twenty-four postgraduate researchers to examine digital study habits.',
  },
];

function createSampleLectureSlideBlob(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas unavailable'));
      return;
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('LECTURE 04: CENTRAL LIMIT THEOREM', 56, 88);

    ctx.font = '22px Arial, sans-serif';
    ctx.fillStyle = '#1F2937';
    const lines = [
      'Given independent and identically distributed random variables',
      'with finite mean and variance, the standardized sample mean',
      'converges in distribution to a standard normal variable as',
      'sample size n approaches infinity (typically n >= 30).',
      '',
      'Key Takeaway: Enables confidence intervals and hypothesis',
      'testing even when the underlying population is non-normal.',
    ];
    lines.forEach((line, idx) => {
      ctx.fillText(line, 56, 150 + idx * 40);
    });

    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Blob failed'))), 'image/png');
  });
}

export default function OcrTranslator({ initialTab = 'ocr', onNavigate }: OcrTranslatorProps) {
  const [activeTab, setActiveTab] = useState<OcrTranslatorTab>(initialTab);

  // --- OCR STATE ---
  const [ocrImageUrl, setOcrImageUrl] = useState<string>('');
  const [ocrFileName, setOcrFileName] = useState<string>('');
  const [ocrLang, setOcrLang] = useState<string>('eng');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatusLabel, setOcrStatusLabel] = useState<string>('');
  const [isRunningOcr, setIsRunningOcr] = useState<boolean>(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrCopied, setOcrCopied] = useState<boolean>(false);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // --- TRANSLATOR STATE ---
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('de');
  const [sourceText, setSourceText] = useState<string>(SAMPLE_ACADEMIC_SENTENCES[0].text);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [transCopied, setTransCopied] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const switchTab = (tab: OcrTranslatorTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'ocr') onNavigate('tools/ocr-image-to-text');
      else onNavigate('tools/study-translator');
    }
  };

  // --- OCR HANDLERS ---
  const executeOcrOnUrl = async (imgUrl: string, lang: string) => {
    setIsRunningOcr(true);
    setOcrError(null);
    setOcrProgress(5);
    setOcrStatusLabel('Initializing local Tesseract OCR engine...');

    try {
      const result = await Tesseract.recognize(imgUrl, lang, {
        logger: (msg) => {
          if (typeof msg.progress === 'number') {
            setOcrProgress(Math.max(5, Math.round(msg.progress * 100)));
          }
          if (msg.status) {
            setOcrStatusLabel(msg.status);
          }
        },
      });
      const extracted = (result?.data?.text || '').trim();
      setOcrText(
        extracted || 'No legible printed text was detected. Try a sharper, well-lit crop.'
      );
      setOcrProgress(100);
    } catch {
      setOcrError(
        'Optical character recognition could not complete. Check your connection for initial language model caching or try another image.'
      );
    } finally {
      setIsRunningOcr(false);
    }
  };

  const handleOcrFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setOcrFileName(f.name);
    const nextUrl = URL.createObjectURL(f);
    setOcrImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
    executeOcrOnUrl(nextUrl, ocrLang);
  };

  const handleLoadSampleSlide = async () => {
    try {
      const blob = await createSampleLectureSlideBlob();
      setOcrFileName('Lecture-04-Central-Limit-Theorem.png');
      const nextUrl = URL.createObjectURL(blob);
      setOcrImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
      executeOcrOnUrl(nextUrl, 'eng');
      setOcrLang('eng');
    } catch {
      setOcrError('Unable to generate sample slide.');
    }
  };

  const handleDownloadTxt = () => {
    if (!ocrText.trim()) return;
    const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(ocrFileName || 'lecture-notes').replace(/\.[^.]+$/, '')}-OCR.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleDownloadOcrPdf = () => {
    if (!ocrText.trim()) return;
    const langLabel = OCR_LANGUAGES.find((l) => l.code === ocrLang)?.label || ocrLang;
    downloadAcademicReportPdf({
      filename: `${(ocrFileName || 'lecture-notes').replace(/\.[^.]+$/, '')}-OCR.pdf`,
      title: 'Extracted Lecture & Textbook Study Notes (OCR)',
      subtitle: 'Recognized locally via browser optical character recognition',
      badgeText: 'OCR STUDY NOTES',
      metadataRows: [
        { label: 'Source Image', value: ocrFileName || 'Uploaded Study Image' },
        { label: 'Document Language', value: langLabel },
      ],
      sections: [
        {
          heading: 'Extracted Editable Text',
          lines: ocrText.trim().split('\n'),
        },
      ],
    });
  };

  const handleDownloadTranslationPdf = () => {
    if (!translatedText.trim()) return;
    const srcName = TRANSLATOR_LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang;
    const tgtName = TRANSLATOR_LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;
    downloadAcademicReportPdf({
      filename: `Academic-Translation-${sourceLang}-to-${targetLang}.pdf`,
      title: 'Bilingual Academic Study Translation',
      subtitle: `${srcName} → ${tgtName}`,
      badgeText: 'STUDY TRANSLATOR',
      metadataRows: [
        { label: 'Source Language', value: srcName },
        { label: 'Target Language', value: tgtName },
      ],
      sections: [
        {
          heading: `Source Passage (${srcName})`,
          lines: sourceText.trim().split('\n'),
        },
        {
          heading: `Translated Study Output (${tgtName})`,
          lines: translatedText.trim().split('\n'),
        },
      ],
    });
  };

  // --- TRANSLATOR HANDLERS ---
  const handleTranslate = async (
    customText?: string,
    customSrc?: string,
    customTgt?: string
  ) => {
    const textToTranslate = (customText ?? sourceText).trim();
    const sLang = customSrc ?? sourceLang;
    const tLang = customTgt ?? targetLang;

    if (!textToTranslate) {
      setTranslatedText('');
      return;
    }
    if (sLang === tLang) {
      setTranslatedText(textToTranslate);
      return;
    }

    setIsTranslating(true);
    setTranslateError(null);
    try {
      const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        textToTranslate.slice(0, 500)
      )}&langpair=${encodeURIComponent(`${sLang}|${tLang}`)}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const output = data?.responseData?.translatedText;
      if (typeof output === 'string' && output.trim()) {
        setTranslatedText(output);
      } else {
        setTranslateError('Translation service returned an empty response. Please try a shorter passage.');
      }
    } catch {
      setTranslateError(
        'Could not reach the free public translation endpoint right now. Please check your connection and try again.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'translator' && !translatedText && sourceText) {
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSwapLanguages = () => {
    const prevSrc = sourceLang;
    const prevTgt = targetLang;
    setSourceLang(prevTgt);
    setTargetLang(prevSrc);
    if (translatedText.trim()) {
      setSourceText(translatedText);
      handleTranslate(translatedText, prevTgt, prevSrc);
    }
  };

  const isSourceRtl = TRANSLATOR_LANGUAGES.find((l) => l.code === sourceLang)?.rtl ?? false;
  const isTargetRtl = TRANSLATOR_LANGUAGES.find((l) => l.code === targetLang)?.rtl ?? false;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      {/* Top Mode Switcher */}
      <div className="border-b border-slate-200 bg-[#F9FAFB] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ocr'}
            onClick={() => switchTab('ocr')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'ocr'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <ScanText className="w-4 h-4" />
            <span>Image to Text (OCR)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'translator'}
            onClick={() => switchTab('translator')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'translator'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Academic Study Translator</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Zero Sign-Up · Built for Multilingual Research &amp; Lecture Notes
        </span>
      </div>

      {/* TAB 1: IMAGE TO TEXT OCR */}
      {activeTab === 'ocr' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Upload & Source Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="ocr-lang" className="text-xs font-bold text-slate-700">
                    Document Language:
                  </label>
                  <select
                    id="ocr-lang"
                    value={ocrLang}
                    onChange={(e) => {
                      setOcrLang(e.target.value);
                      if (ocrImageUrl) executeOcrOnUrl(ocrImageUrl, e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs font-semibold text-[#111827]"
                  >
                    {OCR_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleSlide}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#111827] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Sample Lecture Slide</span>
                </button>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleOcrFileSelect(e.dataTransfer.files);
                }}
                onClick={() => ocrInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-6 text-center transition-colors cursor-pointer"
              >
                <input
                  ref={ocrInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  onChange={(e) => handleOcrFileSelect(e.target.files)}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-2.5">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-[#111827]">
                  {ocrFileName || 'Drop textbook photo or slide screenshot'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Runs Tesseract optical recognition locally in your browser
                </p>
              </div>

              {ocrImageUrl && (
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3">
                  <img
                    src={ocrImageUrl}
                    alt="OCR source preview"
                    className="max-h-[240px] w-auto mx-auto rounded-lg object-contain"
                  />
                </div>
              )}

              {isRunningOcr && (
                <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#EA580C] tabular-nums">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {ocrStatusLabel || 'Recognizing characters...'}
                    </span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-orange-100 overflow-hidden">
                    <div
                      style={{ width: `${ocrProgress}%` }}
                      className="h-full bg-[#F97316] transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {ocrError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{ocrError}</span>
                </div>
              )}
            </div>

            {/* Right Extracted Editable Textarea */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="ocr-output-box" className="text-sm font-bold text-[#111827]">
                  Extracted Editable Study Notes
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!ocrText.trim()}
                    onClick={() => {
                      navigator.clipboard.writeText(ocrText);
                      setOcrCopied(true);
                      setTimeout(() => setOcrCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-200 bg-white hover:border-orange-300 disabled:opacity-40 text-xs font-semibold text-[#111827] cursor-pointer"
                  >
                    {ocrCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{ocrCopied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!ocrText.trim()}
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-[#111827] text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>

                  <button
                    type="button"
                    disabled={!ocrText.trim()}
                    onClick={handleDownloadOcrPdf}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <textarea
                id="ocr-output-box"
                rows={12}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Extracted text will appear here for editing, copying, or downloading..."
                className="w-full p-4 rounded-2xl bg-[#F9FAFB] border border-slate-200 focus:bg-white focus:border-[#F97316] focus:outline-none text-sm text-[#111827] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-LANGUAGE ACADEMIC TRANSLATOR */}
      {activeTab === 'translator' && (
        <div className="p-6 sm:p-8 space-y-5">
          {/* Quick Academic Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Quick Academic Samples:</span>
            {SAMPLE_ACADEMIC_SENTENCES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setSourceLang(sample.src);
                  setTargetLang(sample.tgt);
                  setSourceText(sample.text);
                  handleTranslate(sample.text, sample.src, sample.tgt);
                }}
                className="px-3 py-1 rounded-lg bg-[#FFF7ED] border border-orange-200/80 text-xs font-semibold text-[#EA580C] hover:bg-orange-100/70 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Language Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3">
            <div className="md:col-span-5">
              <label htmlFor="trans-src-lang" className="sr-only">
                Source Language
              </label>
              <select
                id="trans-src-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#111827]"
              >
                {TRANSLATOR_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    From: {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwapLanguages}
                title="Swap Languages"
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#F97316] text-slate-700 hover:text-[#EA580C] transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5">
              <label htmlFor="trans-tgt-lang" className="sr-only">
                Target Language
              </label>
              <select
                id="trans-tgt-lang"
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  handleTranslate(sourceText, sourceLang, e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#111827]"
              >
                {TRANSLATOR_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    To: {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {translateError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{translateError}</span>
            </div>
          )}

          {/* Side-by-Side Textareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-[#111827]">Source Passage</span>
                <span className="tabular-nums">{sourceText.length} / 500 chars</span>
              </div>
              <textarea
                rows={7}
                maxLength={500}
                dir={isSourceRtl ? 'rtl' : 'ltr'}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter seminar sentence, abstract, or vocabulary phrase..."
                className="w-full p-4 rounded-2xl bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-sm text-[#111827] leading-relaxed"
              />
              <button
                type="button"
                disabled={isTranslating || !sourceText.trim()}
                onClick={() => handleTranslate()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-2xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isTranslating ? 'Translating...' : 'Translate Passage'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827]">Translated Study Output</span>
                <button
                  type="button"
                  disabled={!translatedText.trim()}
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setTransCopied(true);
                    setTimeout(() => setTransCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-[#EA580C] hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  {transCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{transCopied ? 'Copied!' : 'Copy Translation'}</span>
                </button>
              </div>
              <textarea
                rows={7}
                readOnly
                dir={isTargetRtl ? 'rtl' : 'ltr'}
                value={translatedText}
                placeholder="Translation appears here..."
                className="w-full p-4 rounded-2xl bg-[#F9FAFB] border border-slate-200 text-sm text-[#111827] leading-relaxed focus:outline-none"
              />
              <button
                type="button"
                disabled={!translatedText.trim()}
                onClick={handleDownloadTranslationPdf}
                className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-white border border-slate-300 hover:border-[#F97316] disabled:opacity-40 text-[#111827] hover:text-[#EA580C] text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#F97316]" />
                <span>Download Bilingual PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
