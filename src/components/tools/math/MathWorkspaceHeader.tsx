import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  FileDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { downloadMathSolutionPdf } from '../../../utils/pdfReportGenerator';
import { useMathShell } from './MathShellContext';
import { MathText } from './MathTypeset';

export interface MathPresetItem {
  label: string;
  onSelect: () => void;
}

interface MathWorkspaceBarProps {
  presets: MathPresetItem[];
  onReset: () => void;
  solutionText: string;
  modeLabel?: string;
}

export const MathWorkspaceBar: React.FC<MathWorkspaceBarProps> = ({
  presets,
  onReset,
  solutionText,
  modeLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const shell = useMathShell();

  const presetsRef = useRef(presets);
  presetsRef.current = presets;
  const solutionRef = useRef(solutionText);
  solutionRef.current = solutionText;
  const modeLabelRef = useRef(modeLabel);
  modeLabelRef.current = modeLabel;

  // Listen to one-click Real-Life Example loader events from MathRealLifeExamples
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (shell.tool && ce.detail?.slug && ce.detail.slug !== shell.tool.slug) {
        return;
      }
      const idx = typeof ce.detail?.presetIndex === 'number' ? ce.detail.presetIndex : 0;
      const list = presetsRef.current;
      const target = list[idx] || list[0];
      if (target) {
        target.onSelect();
      }
    };

    const onExportPdfEvent = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string }>;
      if (shell.tool && ce.detail?.slug && ce.detail.slug !== shell.tool.slug) {
        return;
      }
      e.preventDefault();
      shell.exportPdfWithSolution(solutionRef.current, modeLabelRef.current);
    };

    window.addEventListener('ut-math-load-preset', onLoadPreset as EventListener);
    window.addEventListener('ut-math-pdf-export', onExportPdfEvent as EventListener);
    return () => {
      window.removeEventListener('ut-math-load-preset', onLoadPreset as EventListener);
      window.removeEventListener('ut-math-pdf-export', onExportPdfEvent as EventListener);
    };
  }, [shell]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(solutionText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = solutionText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    if (shell.tool) {
      shell.exportPdfWithSolution(solutionText, modeLabel);
      return;
    }
    const rawPageTitle =
      typeof document !== 'undefined' && document.title
        ? document.title.split('|')[0].trim()
        : 'Mathematics & Statistics Step-by-Step Solution';
    const slug = rawPageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);

    void downloadMathSolutionPdf({
      filename: `${slug || 'math-solution'}-report.pdf`,
      title: rawPageTitle,
      levelName: 'University Mathematics',
      tutorDomain: 'Mathematics & Statistics',
      formulaBadge: modeLabel || 'Step-by-Step Symbolic Solver',
      modeLabel,
      parameters: [],
      solutionLines: (solutionText || 'No active calculation lines available.').split('\n'),
    });
  };

  return (
    <div className="border-b border-slate-200 bg-[#F8FAFC] px-3.5 sm:px-5 py-3 space-y-2.5">
      {/* Row 1: Mode / Full-Screen Context + Mobile-Friendly Action Cluster */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          {shell.isFullScreen && shell.tool ? (
            <span className="text-xs sm:text-sm font-display font-bold text-[#0F172A] truncate">
              {shell.tool.shortTitle}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <span className="truncate">
                {modeLabel || 'Interactive Math Workspace'}
              </span>
            </span>
          )}
        </div>

        {/* Action Cluster: Reset, Copy, PDF, Expand/Exit Full Screen (44px mobile touch targets) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset calculator inputs"
            title="Reset"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-0 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy formatted step-by-step solution"
            title="Copy Solution"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-0 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:border-[#F97316] hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            aria-label="Generate PDF report of calculation results"
            title="Generate PDF"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-0 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={shell.toggleFullScreen}
            aria-pressed={shell.isFullScreen}
            aria-label={shell.isFullScreen ? 'Exit full screen workspace' : 'Expand calculator to full screen'}
            title={shell.isFullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] rounded-xl border text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              shell.isFullScreen
                ? 'px-3 bg-[#0F172A] border-[#0F172A] text-white hover:bg-slate-800'
                : 'min-w-[44px] sm:min-w-0 sm:px-3 py-1.5 bg-[#FFF7ED] border-orange-200 text-[#EA580C] hover:bg-orange-100/70'
            }`}
          >
            {shell.isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4 shrink-0" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Horizontal Swipeable Sample Presets (Mobile) / Clean Flex Wrap (Desktop) */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap no-scrollbar pb-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap shrink-0">
            Examples:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={preset.onSelect}
              className="compact-pill-btn shrink-0 px-3 py-1.5 min-h-[38px] sm:min-h-0 text-xs font-medium rounded-xl border border-orange-200/90 bg-white text-slate-800 hover:bg-[#FFF7ED] hover:border-orange-400 hover:text-[#EA580C] transition-colors text-left cursor-pointer whitespace-nowrap"
            >
              <MathText text={preset.label} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function toExactFraction(val: number, maxDenom = 10000): { num: number; den: number } | null {
  if (!Number.isFinite(val)) return null;
  if (Math.abs(val - Math.round(val)) < 1e-10) {
    return { num: Math.round(val), den: 1 };
  }
  const sign = val < 0 ? -1 : 1;
  const x = Math.abs(val);
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = x;
  for (let i = 0; i < 24; i++) {
    const a = Math.floor(b);
    const auxH = h1;
    h1 = a * h1 + h2;
    h2 = auxH;
    const auxK = k1;
    k1 = a * k1 + k2;
    k2 = auxK;
    if (k1 > maxDenom) break;
    if (Math.abs(x - h1 / k1) < 1e-9) {
      return { num: sign * h1, den: k1 };
    }
    const rem = b - a;
    if (rem < 1e-12) break;
    b = 1 / rem;
  }
  return null;
}

export function fmtNum(n: number, digits = 5): string {
  if (!Number.isFinite(n)) return 'Undefined';
  if (Math.abs(n) < 1e-11) return '0';
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return Number(n.toFixed(digits)).toString();
}
