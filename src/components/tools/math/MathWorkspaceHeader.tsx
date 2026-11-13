import React, { useState } from 'react';
import { Check, Copy, FileDown, RotateCcw, Sparkles } from 'lucide-react';
import { downloadAcademicReportPdf } from '../../../utils/pdfReportGenerator';

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
    const rawPageTitle =
      typeof document !== 'undefined' && document.title
        ? document.title.split('|')[0].trim()
        : 'Mathematics & Statistics Step-by-Step Solution';
    const slug = rawPageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);

    downloadAcademicReportPdf({
      filename: `${slug || 'math-solution'}-report.pdf`,
      title: rawPageTitle,
      subtitle: 'Step-by-Step Mathematical & Statistical Derivation Report',
      badgeText: modeLabel || 'MATH & STATS SUITE',
      sections: [
        {
          heading: 'Computed Solution & Step-by-Step Working',
          lines: (solutionText || 'No active calculation lines available.').split('\n'),
          monospace: true,
        },
      ],
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-[#F9FAFB] px-4 sm:px-5 py-3.5 rounded-t-2xl">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 whitespace-nowrap shrink-0 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
          Load Sample Problem:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={preset.onSelect}
            className="px-3 py-1.5 min-h-[40px] sm:min-h-0 text-xs font-medium rounded-lg border border-orange-200 bg-[#FFF7ED] text-[#EA580C] hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-colors text-left cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {modeLabel && (
          <span className="hidden md:inline text-xs font-mono text-gray-500 mr-1 whitespace-nowrap">
            {modeLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg hover:border-[#F97316] hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Solution
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-white bg-[#F97316] rounded-lg hover:bg-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export function toExactFraction(val: number, maxDenom = 10000): { num: number; den: number } | null {
  if (!Number.isFinite(val)) return null;
  if (Math.abs(val - Math.round(val)) < 1e-10) {
    return { num: Math.round(val), den: 1 };
  }
  const sign = val < 0 ? -1 : 1;
  let x = Math.abs(val);
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
