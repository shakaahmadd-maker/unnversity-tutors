import React, { useEffect, useState } from 'react';
import { FileDown, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { getBrandLogoForPdf } from '../../../utils/pdfReportGenerator';

export interface ChemistryPresetChip {
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface ChemistryToolShellProps {
  slug: string;
  title: string;
  subtitle?: string;
  headerControls?: React.ReactNode;
  extraActions?: React.ReactNode;
  presets?: ChemistryPresetChip[];
  presetsLabel?: string;
  onReset?: () => void;
  onExportPdf: () => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  children: React.ReactNode;
}

/**
 * Shared mobile-first interactive shell for all 16 Chemistry tools:
 * - Single-row compact toolbar with Reset, Branded PDF Export, and Full-Screen Expand/Exit button
 * - Body scroll-lock + Escape key exit when expanded (`fixed inset-0 z-[120] w-screen h-[100dvh]`)
 * - Automatically intercepts `ut-tool-pdf-export` from ScienceToolLayout so top hero CTA
 *   and inline PDF button both emit the structured, University-Tutors logo-branded A4 report.
 */
export function ChemistryToolShell({
  slug,
  title,
  subtitle,
  headerControls,
  extraActions,
  presets,
  presetsLabel = 'Quick Presets:',
  onReset,
  onExportPdf,
  onFullScreenChange,
  children,
}: ChemistryToolShellProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    void getBrandLogoForPdf();
  }, []);

  useEffect(() => {
    onFullScreenChange?.(isFullScreen);
  }, [isFullScreen, onFullScreenChange]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePdfEvent = (e: Event) => {
      const ce = e as CustomEvent<{ tool?: { slug?: string } }>;
      if (ce.detail?.tool?.slug === slug) {
        e.preventDefault();
        onExportPdf();
      }
    };
    window.addEventListener('ut-tool-pdf-export', handlePdfEvent as EventListener);
    return () => {
      window.removeEventListener('ut-tool-pdf-export', handlePdfEvent as EventListener);
    };
  }, [slug, onExportPdf]);

  return (
    <div
      data-fullscreen={isFullScreen ? 'true' : 'false'}
      className={
        isFullScreen
          ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-[#FFFFFF] flex flex-col overflow-hidden'
          : 'bg-[#FFFFFF] border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-5'
      }
    >
      {/* Top Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2.5 ${
          isFullScreen
            ? 'shrink-0 px-3.5 sm:px-6 py-2.5 bg-[#FFFFFF] border-b border-slate-200 shadow-2xs'
            : 'pb-4 border-b border-slate-100'
        }`}
      >
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2.5">
          {headerControls ? (
            <div className="min-w-0 max-w-full">{headerControls}</div>
          ) : (
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-display font-bold text-[#111827] truncate">
                {title}
              </h2>
              {subtitle && !isFullScreen && (
                <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Action Cluster: Extra, Reset, Branded PDF, Full-Screen Expand/Exit (44px touch targets) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {extraActions}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset calculator to default example"
              title="Reset"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportPdf}
            aria-label="Download formatted Chemistry lab PDF"
            title="Download Lab PDF"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            id={`${slug}-fullscreen-toggle-btn`}
            onClick={() => setIsFullScreen((fs) => !fs)}
            aria-pressed={isFullScreen}
            aria-label={isFullScreen ? `Exit full screen ${title}` : `Expand ${title} to full screen`}
            title={isFullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isFullScreen
                ? 'px-3 bg-[#111827] border-[#111827] text-white hover:bg-slate-800'
                : 'min-w-[44px] sm:min-w-0 sm:px-3 py-2 bg-[#FFF7ED] border-orange-200 text-[#EA580C] hover:bg-orange-100/70'
            }`}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4 shrink-0" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Inner Content when Full-Screen */}
      <div
        className={
          isFullScreen
            ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-6 pb-8 space-y-5'
            : 'space-y-5'
        }
      >
        {presets && presets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-xs font-semibold text-slate-600 shrink-0">
              {presetsLabel}
            </span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.onClick}
                aria-pressed={Boolean(p.active)}
                className={`px-3 py-1.5 min-h-[40px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  p.active
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
export default ChemistryToolShell;
