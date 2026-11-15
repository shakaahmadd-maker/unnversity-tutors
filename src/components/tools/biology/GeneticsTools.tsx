import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ArrowLeftRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  FileDown,
} from 'lucide-react';
import {
  downloadPunnettSquarePdf,
  downloadBiologyStructuredPdf,
  getBrandLogoForPdf,
  PunnettSquarePdfPayload,
} from '../../../utils/pdfReportGenerator';
import { BiologyToolShell } from './BiologyToolShell';

// ============================================================================
// 1. PUNNETT SQUARE & GENETICS INHERITANCE CALCULATOR
// ============================================================================
function normalizeGenePair(raw: string, domChar: string, recChar: string): [string, string] {
  const clean = raw.replace(/\s+/g, '');
  const a = clean[0] === domChar || clean[0] === recChar ? clean[0] : domChar;
  const b = clean[1] === domChar || clean[1] === recChar ? clean[1] : recChar;
  return [a, b];
}

function sortAllelePair(a1: string, a2: string): string {
  if (a1 === a2) return a1 + a2;
  return a1 === a1.toUpperCase() ? a1 + a2 : a2 + a1;
}

function gcdPair(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatSimplifiedRatio(counts: number[]): string {
  const nonZero = counts.filter((c) => c > 0);
  if (nonZero.length === 0) return '0';
  const divisor = nonZero.reduce((acc, n) => gcdPair(acc, n));
  return nonZero.map((n) => n / divisor).join(' : ');
}

function describeMonoGenotype(geno: string): string {
  if (geno === 'AA' || geno === 'BB') return 'Homozygous Dominant';
  if (geno === 'Aa' || geno === 'Bb') return 'Heterozygous';
  return 'Homozygous Recessive';
}

const MONO_GENOTYPES = ['AA', 'Aa', 'aa'] as const;
const GENE_A_OPTIONS = ['AA', 'Aa', 'aa'] as const;
const GENE_B_OPTIONS = ['BB', 'Bb', 'bb'] as const;

export function PunnettSquareCalculator() {
  const [mode, setMode] = useState<'mono' | 'di'>('mono');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTraitEditor, setShowTraitEditor] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Interactive inspection state
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [highlightedGeno, setHighlightedGeno] = useState<string | null>(null);
  const [highlightedPhenoIdx, setHighlightedPhenoIdx] = useState<number | null>(null);

  // Monohybrid state
  const [monoP1, setMonoP1] = useState('Aa');
  const [monoP2, setMonoP2] = useState('Aa');
  const [traitADom, setTraitADom] = useState('Purple Flowers');
  const [traitARec, setTraitARec] = useState('White Flowers');

  // Dihybrid state
  const [diP1, setDiP1] = useState('AaBb');
  const [diP2, setDiP2] = useState('AaBb');
  const [diDomA, setDiDomA] = useState('Round Seed');
  const [diRecA, setDiRecA] = useState('Wrinkled Seed');
  const [diDomB, setDiDomB] = useState('Yellow Cotyledon');
  const [diRecB, setDiRecB] = useState('Green Cotyledon');

  // Lock body scroll and listen for Escape when expanded to full screen
  useEffect(() => {
    if (!isFullScreen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const clearInspection = () => {
    setSelectedCell(null);
    setHighlightedGeno(null);
    setHighlightedPhenoIdx(null);
  };

  const handleModeChange = (nextMode: 'mono' | 'di') => {
    setMode(nextMode);
    clearInspection();
  };

  const resetDefaults = () => {
    clearInspection();
    if (mode === 'mono') {
      setMonoP1('Aa');
      setMonoP2('Aa');
      setTraitADom('Purple Flowers');
      setTraitARec('White Flowers');
    } else {
      setDiP1('AaBb');
      setDiP2('AaBb');
      setDiDomA('Round Seed');
      setDiRecA('Wrinkled Seed');
      setDiDomB('Yellow Cotyledon');
      setDiRecB('Green Cotyledon');
    }
  };

  const swapParents = () => {
    clearInspection();
    if (mode === 'mono') {
      setMonoP1(monoP2);
      setMonoP2(monoP1);
    } else {
      setDiP1(diP2);
      setDiP2(diP1);
    }
  };

  const updateDihybridLocus = (parent: 1 | 2, locus: 'A' | 'B', pair: string) => {
    clearInspection();
    const current = parent === 1 ? diP1 : diP2;
    const curA = current.slice(0, 2) || 'Aa';
    const curB = current.slice(2, 4) || 'Bb';
    const next = locus === 'A' ? `${pair}${curB}` : `${curA}${pair}`;
    if (parent === 1) setDiP1(next);
    else setDiP2(next);
  };

  const crossData = useMemo(() => {
    if (mode === 'mono') {
      const g1 = normalizeGenePair(monoP1, 'A', 'a');
      const g2 = normalizeGenePair(monoP2, 'A', 'a');
      const grid: string[][] = g1.map((rowGamete) =>
        g2.map((colGamete) => sortAllelePair(rowGamete, colGamete))
      );

      const genoCounts: Record<string, number> = {};
      let domCount = 0;
      let recCount = 0;

      grid.flat().forEach((g) => {
        genoCounts[g] = (genoCounts[g] || 0) + 1;
        if (g.includes('A')) domCount++;
        else recCount++;
      });

      const genoEntries = (Object.entries(genoCounts) as [string, number][]).sort(
        (a, b) => MONO_GENOTYPES.indexOf(a[0] as any) - MONO_GENOTYPES.indexOf(b[0] as any)
      );

      const phenotypes = [
        {
          label: `${traitADom || 'Dominant'} (A_)`,
          count: domCount,
          pct: (domCount / 4) * 100,
          tone: 'dom' as const,
          matches: (geno: string) => geno.includes('A'),
        },
        {
          label: `${traitARec || 'Recessive'} (aa)`,
          count: recCount,
          pct: (recCount / 4) * 100,
          tone: 'rec' as const,
          matches: (geno: string) => !geno.includes('A'),
        },
      ];

      return {
        parent1Label: g1.join(''),
        parent2Label: g2.join(''),
        rowGametes: g1,
        colGametes: g2,
        grid,
        totalCells: 4,
        genoEntries,
        genoRatio: formatSimplifiedRatio(genoEntries.map(([, count]) => count)),
        phenotypes,
        phenoRatio: formatSimplifiedRatio(phenotypes.map((p) => p.count)),
      };
    }

    // Dihybrid
    const p1A = normalizeGenePair(diP1.slice(0, 2), 'A', 'a');
    const p1B = normalizeGenePair(diP1.slice(2, 4), 'B', 'b');
    const p2A = normalizeGenePair(diP2.slice(0, 2), 'A', 'a');
    const p2B = normalizeGenePair(diP2.slice(2, 4), 'B', 'b');

    const rowGametes = [
      p1A[0] + p1B[0],
      p1A[0] + p1B[1],
      p1A[1] + p1B[0],
      p1A[1] + p1B[1],
    ];
    const colGametes = [
      p2A[0] + p2B[0],
      p2A[0] + p2B[1],
      p2A[1] + p2B[0],
      p2A[1] + p2B[1],
    ];

    const grid = rowGametes.map((rg) =>
      colGametes.map((cg) => sortAllelePair(rg[0], cg[0]) + sortAllelePair(rg[1], cg[1]))
    );

    const genoCounts: Record<string, number> = {};
    let domDom = 0;
    let domRec = 0;
    let recDom = 0;
    let recRec = 0;

    grid.flat().forEach((g) => {
      genoCounts[g] = (genoCounts[g] || 0) + 1;
      const hasA = g.slice(0, 2).includes('A');
      const hasB = g.slice(2, 4).includes('B');
      if (hasA && hasB) domDom++;
      else if (hasA && !hasB) domRec++;
      else if (!hasA && hasB) recDom++;
      else recRec++;
    });

    const genoEntries = (Object.entries(genoCounts) as [string, number][]).sort(
      (a, b) => b[1] - a[1]
    );

    const domALabel = traitSafe(diDomA, 'Dominant A');
    const recALabel = traitSafe(diRecA, 'Recessive a');
    const domBLabel = traitSafe(diDomB, 'Dominant B');
    const recBLabel = traitSafe(diRecB, 'Recessive b');

    const phenotypes = [
      {
        label: `${domALabel} + ${domBLabel} (A_B_)`,
        count: domDom,
        pct: (domDom / 16) * 100,
        tone: 'dom' as const,
        matches: (g: string) => g.slice(0, 2).includes('A') && g.slice(2, 4).includes('B'),
      },
      {
        label: `${domALabel} + ${recBLabel} (A_bb)`,
        count: domRec,
        pct: (domRec / 16) * 100,
        tone: 'mix1' as const,
        matches: (g: string) => g.slice(0, 2).includes('A') && !g.slice(2, 4).includes('B'),
      },
      {
        label: `${recALabel} + ${domBLabel} (aaB_)`,
        count: recDom,
        pct: (recDom / 16) * 100,
        tone: 'mix2' as const,
        matches: (g: string) => !g.slice(0, 2).includes('A') && g.slice(2, 4).includes('B'),
      },
      {
        label: `${recALabel} + ${recBLabel} (aabb)`,
        count: recRec,
        pct: (recRec / 16) * 100,
        tone: 'rec' as const,
        matches: (g: string) => !g.slice(0, 2).includes('A') && !g.slice(2, 4).includes('B'),
      },
    ];

    return {
      parent1Label: `${p1A.join('')}${p1B.join('')}`,
      parent2Label: `${p2A.join('')}${p2B.join('')}`,
      rowGametes,
      colGametes,
      grid,
      totalCells: 16,
      genoEntries,
      genoRatio: formatSimplifiedRatio(genoEntries.map(([, count]) => count)),
      phenotypes,
      phenoRatio: formatSimplifiedRatio(phenotypes.map((p) => p.count)),
    };
  }, [mode, monoP1, monoP2, traitADom, traitARec, diP1, diP2, diDomA, diRecA, diDomB, diRecB]);

  const cellColorClass = (geno: string) => {
    if (mode === 'mono') {
      if (geno === 'AA') return 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]';
      if (geno === 'Aa') return 'bg-amber-50/80 border-amber-200 text-[#111827]';
      return 'bg-slate-100 border-slate-300 text-slate-700';
    }
    const hasA = geno.slice(0, 2).includes('A');
    const hasB = geno.slice(2, 4).includes('B');
    if (hasA && hasB) return 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]';
    if (hasA && !hasB) return 'bg-sky-50 border-sky-200 text-sky-900';
    if (!hasA && hasB) return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    return 'bg-slate-100 border-slate-300 text-slate-700';
  };

  const phenoBarColor = (tone: 'dom' | 'mix1' | 'mix2' | 'rec') => {
    if (tone === 'dom') return '#F97316';
    if (tone === 'mix1') return '#0284C7';
    if (tone === 'mix2') return '#059669';
    return '#64748B';
  };

  const isCellHighlighted = (rIdx: number, cIdx: number, cellGeno: string): boolean | null => {
    if (selectedCell) {
      return selectedCell.r === rIdx && selectedCell.c === cIdx;
    }
    if (highlightedGeno) {
      return cellGeno === highlightedGeno;
    }
    if (highlightedPhenoIdx !== null && crossData.phenotypes[highlightedPhenoIdx]) {
      return crossData.phenotypes[highlightedPhenoIdx].matches(cellGeno);
    }
    return null;
  };

  const inspectedDetails = useMemo(() => {
    if (!selectedCell) return null;
    const cellGeno = crossData.grid[selectedCell.r]?.[selectedCell.c];
    if (!cellGeno) return null;
    const p1Gamete = crossData.rowGametes[selectedCell.r];
    const p2Gamete = crossData.colGametes[selectedCell.c];
    const matchedPheno = crossData.phenotypes.find((p) => p.matches(cellGeno));
    const genoEntry = crossData.genoEntries.find(([g]) => g === cellGeno);
    const totalMatches = genoEntry ? genoEntry[1] : 1;
    const pct = ((totalMatches / crossData.totalCells) * 100).toFixed(mode === 'mono' ? 0 : 2);
    const zygosity =
      mode === 'mono'
        ? describeMonoGenotype(cellGeno)
        : `${describeMonoGenotype(cellGeno.slice(0, 2))} (A) · ${describeMonoGenotype(cellGeno.slice(2, 4))} (B)`;

    return {
      cellGeno,
      p1Gamete,
      p2Gamete,
      matchedPhenoLabel: matchedPheno?.label || '',
      totalMatches,
      pct,
      zygosity,
    };
  }, [selectedCell, crossData, mode]);

  const handleCopySummary = () => {
    const lines = [
      `Punnett Square Cross (${mode === 'mono' ? 'Monohybrid 2×2' : 'Dihybrid 4×4'})`,
      `Parents: ${crossData.parent1Label} × ${crossData.parent2Label}`,
      `Genotype Ratio (${crossData.genoRatio}): ${crossData.genoEntries
        .map(([g, c]) => `${g} ${c}/${crossData.totalCells} (${((c / crossData.totalCells) * 100).toFixed(1)}%)`)
        .join(', ')}`,
      `Phenotype Ratio (${crossData.phenoRatio}): ${crossData.phenotypes
        .filter((p) => p.count > 0)
        .map((p) => `${p.label}: ${p.count}/${crossData.totalCells} (${p.pct.toFixed(1)}%)`)
        .join(' | ')}`,
    ];
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    }
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1800);
  };

  const buildPdfPayloadRef = useRef<
    (workedExample?: PunnettSquarePdfPayload['workedExample']) => void
  >(() => {});

  buildPdfPayloadRef.current = (workedExample?: PunnettSquarePdfPayload['workedExample']) => {
    const traitSummaryLines =
      mode === 'mono'
        ? [
            `Dominant Trait (A_): ${traitSafe(traitADom, 'Dominant A')}   |   Recessive Trait (aa): ${traitSafe(traitARec, 'Recessive a')}`,
          ]
        : [
            `Gene A: ${traitSafe(diDomA, 'Dominant A')} (A_) / ${traitSafe(diRecA, 'Recessive a')} (aa)   |   Gene B: ${traitSafe(diDomB, 'Dominant B')} (B_) / ${traitSafe(diRecB, 'Recessive b')} (bb)`,
          ];

    const p1Desc =
      mode === 'mono'
        ? describeMonoGenotype(crossData.parent1Label)
        : `${describeMonoGenotype(crossData.parent1Label.slice(0, 2))} / ${describeMonoGenotype(
            crossData.parent1Label.slice(2, 4)
          )}`;
    const p2Desc =
      mode === 'mono'
        ? describeMonoGenotype(crossData.parent2Label)
        : `${describeMonoGenotype(crossData.parent2Label.slice(0, 2))} / ${describeMonoGenotype(
            crossData.parent2Label.slice(2, 4)
          )}`;

    void downloadPunnettSquarePdf({
      mode,
      parent1Label: crossData.parent1Label,
      parent2Label: crossData.parent2Label,
      parent1Description: p1Desc,
      parent2Description: p2Desc,
      traitSummaryLines,
      rowGametes: crossData.rowGametes,
      colGametes: crossData.colGametes,
      grid: crossData.grid,
      totalCells: crossData.totalCells,
      genoEntries: crossData.genoEntries,
      genoRatio: crossData.genoRatio,
      phenotypes: crossData.phenotypes,
      phenoRatio: crossData.phenoRatio,
      inspectedCell: inspectedDetails,
      workedExample,
    });
  };

  useEffect(() => {
    void getBrandLogoForPdf();
    if (typeof window === 'undefined') return;
    const onCustomPdfExport = (event: Event) => {
      const customEv = event as CustomEvent<{
        tool?: { slug?: string; workedExample?: PunnettSquarePdfPayload['workedExample'] };
      }>;
      if (customEv.detail?.tool?.slug === 'punnett-square-calculator') {
        event.preventDefault();
        buildPdfPayloadRef.current(customEv.detail.tool.workedExample);
      }
    };
    const onLoadPreset = (event: Event) => {
      const customEv = event as CustomEvent<{
        mode: 'mono' | 'di';
        p1: string;
        p2: string;
        monoDom?: string;
        monoRec?: string;
        diDomA?: string;
        diRecA?: string;
        diDomB?: string;
        diRecB?: string;
      }>;
      const d = customEv.detail;
      if (!d) return;
      setSelectedCell(null);
      setHighlightedGeno(null);
      setHighlightedPhenoIdx(null);
      setMode(d.mode);
      if (d.mode === 'mono') {
        setMonoP1(d.p1);
        setMonoP2(d.p2);
        if (d.monoDom) setTraitADom(d.monoDom);
        if (d.monoRec) setTraitARec(d.monoRec);
      } else {
        setDiP1(d.p1);
        setDiP2(d.p2);
        if (d.diDomA) setDiDomA(d.diDomA);
        if (d.diRecA) setDiRecA(d.diRecA);
        if (d.diDomB) setDiDomB(d.diDomB);
        if (d.diRecB) setDiRecB(d.diRecB);
      }
    };
    window.addEventListener('ut-tool-pdf-export', onCustomPdfExport);
    window.addEventListener('ut-punnett-load-preset', onLoadPreset);
    return () => {
      window.removeEventListener('ut-tool-pdf-export', onCustomPdfExport);
      window.removeEventListener('ut-punnett-load-preset', onLoadPreset);
    };
  }, []);

  return (
    <div
      id="punnett-workspace-root"
      data-fullscreen={isFullScreen ? 'true' : 'false'}
      className={
        isFullScreen
          ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-[#FFFFFF] flex flex-col overflow-hidden rounded-none border-0'
          : 'bg-[#FFFFFF] border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-5'
      }
    >
      {/* Top Toolbar with Mode Selector, Reset & Mobile Full-Screen Expand Icon */}
      <div
        className={
          isFullScreen
            ? 'shrink-0 bg-[#FFFFFF] border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2'
            : 'flex flex-nowrap items-center justify-between gap-1.5 sm:gap-3 pb-3.5 sm:pb-4 border-b border-slate-100'
        }
      >
        {/* Cross Mode Switch */}
        <div className="inline-flex items-center gap-0.5 sm:gap-1 p-1 bg-[#F9FAFB] border border-slate-200 rounded-xl min-w-0 shrink">
          <button
            type="button"
            onClick={() => handleModeChange('mono')}
            className={`px-2.5 sm:px-4 min-h-[44px] sm:min-h-[38px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'mono'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'text-slate-700 hover:text-[#111827]'
            }`}
          >
            <span className="sm:hidden">2×2 Mono</span>
            <span className="hidden sm:inline">Monohybrid Cross (2×2)</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('di')}
            className={`px-2.5 sm:px-4 min-h-[44px] sm:min-h-[38px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'di'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'text-slate-700 hover:text-[#111827]'
            }`}
          >
            <span className="sm:hidden">4×4 Dihybrid</span>
            <span className="hidden sm:inline">Dihybrid Cross (4×4)</span>
          </button>
        </div>

        {/* Utility Actions + Mobile Expand Full-Screen Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={resetDefaults}
            title={`Reset to classic example (${mode === 'mono' ? 'Aa × Aa' : 'AaBb × AaBb'})`}
            aria-label="Reset to classic Mendelian example"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#F97316] hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">
              Example ({mode === 'mono' ? 'Aa × Aa' : 'AaBb × AaBb'})
            </span>
          </button>

          {/* Small Expand / Collapse Full-Screen Icon (Primary mobile ergonomic trigger, works on all screens) */}
          <button
            type="button"
            id="punnett-fullscreen-toggle-btn"
            onClick={() => setIsFullScreen((fs) => !fs)}
            aria-pressed={isFullScreen}
            aria-label={isFullScreen ? 'Exit full screen Punnett square' : 'Expand Punnett square to full screen'}
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

      {/* Main Responsive Calculator Body (Scrollable when expanded to full screen) */}
      <div
        className={
          isFullScreen
            ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-6 pb-8 space-y-5'
            : 'space-y-5'
        }
      >
        {/* Quick Mendelian Cross Presets Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            Quick Crosses:
          </span>
          {mode === 'mono' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setMonoP1('Aa');
                  setMonoP2('Aa');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  monoP1 === 'Aa' && monoP2 === 'Aa'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                Aa × Aa (3:1 Classic)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setMonoP1('Aa');
                  setMonoP2('aa');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  monoP1 === 'Aa' && monoP2 === 'aa'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                Aa × aa (1:1 Test Cross)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setMonoP1('AA');
                  setMonoP2('Aa');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  monoP1 === 'AA' && monoP2 === 'Aa'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AA × Aa (Carrier)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setMonoP1('AA');
                  setMonoP2('aa');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  monoP1 === 'AA' && monoP2 === 'aa'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AA × aa (F1 Uniform)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setDiP1('AaBb');
                  setDiP2('AaBb');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  diP1 === 'AaBb' && diP2 === 'AaBb'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AaBb × AaBb (9:3:3:1)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setDiP1('AaBb');
                  setDiP2('aabb');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  diP1 === 'AaBb' && diP2 === 'aabb'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AaBb × aabb (1:1:1:1 Test)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setDiP1('AABb');
                  setDiP2('AaBb');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  diP1 === 'AABb' && diP2 === 'AaBb'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AABb × AaBb (3:1)
              </button>
              <button
                type="button"
                onClick={() => {
                  clearInspection();
                  setDiP1('AAbb');
                  setDiP2('aaBB');
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  diP1 === 'AAbb' && diP2 === 'aaBB'
                    ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                AAbb × aaBB (True Breeding)
              </button>
            </>
          )}
        </div>

        {/* Balanced 2-Column Desktop / Natural Flow Mobile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* 1. Parental Genotype Tap Selectors (Left Top on Desktop, Top on Mobile) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#111827]">
                  Select Parent Genotypes
                </span>
                <button
                  type="button"
                  onClick={swapParents}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Swap P1 ⇄ P2</span>
                </button>
              </div>

              {mode === 'mono' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Parent 1 Tap Cards */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">Parent 1 (Rows)</span>
                      <span className="font-mono font-bold text-[#EA580C]">{monoP1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MONO_GENOTYPES.map((g) => (
                        <button
                          key={`p1-${g}`}
                          type="button"
                          onClick={() => {
                            clearInspection();
                            setMonoP1(g);
                          }}
                          aria-pressed={monoP1 === g}
                          className={`min-h-[44px] rounded-xl font-mono text-sm font-bold border transition-colors cursor-pointer ${
                            monoP1 === g
                              ? 'bg-[#F97316] border-[#F97316] text-white'
                              : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {describeMonoGenotype(monoP1)} · Gametes:{' '}
                      <span className="font-mono font-semibold text-[#111827]">
                        {crossData.rowGametes.join(', ')}
                      </span>
                    </p>
                  </div>

                  {/* Parent 2 Tap Cards */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">Parent 2 (Cols)</span>
                      <span className="font-mono font-bold text-[#EA580C]">{monoP2}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MONO_GENOTYPES.map((g) => (
                        <button
                          key={`p2-${g}`}
                          type="button"
                          onClick={() => {
                            clearInspection();
                            setMonoP2(g);
                          }}
                          aria-pressed={monoP2 === g}
                          className={`min-h-[44px] rounded-xl font-mono text-sm font-bold border transition-colors cursor-pointer ${
                            monoP2 === g
                              ? 'bg-[#F97316] border-[#F97316] text-white'
                              : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {describeMonoGenotype(monoP2)} · Gametes:{' '}
                      <span className="font-mono font-semibold text-[#111827]">
                        {crossData.colGametes.join(', ')}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Dihybrid Parent 1 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">Parent 1 (Rows)</span>
                      <span className="font-mono font-bold text-[#EA580C]">{diP1}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        {GENE_A_OPTIONS.map((g) => (
                          <button
                            key={`di1a-${g}`}
                            type="button"
                            onClick={() => updateDihybridLocus(1, 'A', g)}
                            aria-pressed={diP1.slice(0, 2) === g}
                            className={`min-h-[44px] sm:min-h-[40px] rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                              diP1.slice(0, 2) === g
                                ? 'bg-[#F97316] border-[#F97316] text-white'
                                : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {GENE_B_OPTIONS.map((g) => (
                          <button
                            key={`di1b-${g}`}
                            type="button"
                            onClick={() => updateDihybridLocus(1, 'B', g)}
                            aria-pressed={diP1.slice(2, 4) === g}
                            className={`min-h-[44px] sm:min-h-[40px] rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                              diP1.slice(2, 4) === g
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      Gametes: {crossData.rowGametes.join(', ')}
                    </p>
                  </div>

                  {/* Dihybrid Parent 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">Parent 2 (Cols)</span>
                      <span className="font-mono font-bold text-[#EA580C]">{diP2}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        {GENE_A_OPTIONS.map((g) => (
                          <button
                            key={`di2a-${g}`}
                            type="button"
                            onClick={() => updateDihybridLocus(2, 'A', g)}
                            aria-pressed={diP2.slice(0, 2) === g}
                            className={`min-h-[44px] sm:min-h-[40px] rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                              diP2.slice(0, 2) === g
                                ? 'bg-[#F97316] border-[#F97316] text-white'
                                : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {GENE_B_OPTIONS.map((g) => (
                          <button
                            key={`di2b-${g}`}
                            type="button"
                            onClick={() => updateDihybridLocus(2, 'B', g)}
                            aria-pressed={diP2.slice(2, 4) === g}
                            className={`min-h-[44px] sm:min-h-[40px] rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                              diP2.slice(2, 4) === g
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-[#F9FAFB] border-slate-200 text-[#111827] hover:border-orange-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      Gametes: {crossData.colGametes.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Collapsible Trait Name Customizer (supports both Mono & Dihybrid) */}
              <div className="pt-1 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowTraitEditor((v) => !v)}
                  aria-expanded={showTraitEditor}
                  className="w-full py-1.5 flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-[#111827] transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Customize Phenotype Trait Labels</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showTraitEditor ? 'rotate-180 text-[#F97316]' : ''}`}
                  />
                </button>

                {showTraitEditor && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
                    {mode === 'mono' ? (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Dominant Trait (A_)
                          </label>
                          <input
                            type="text"
                            value={traitADom}
                            onChange={(e) => setTraitADom(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Recessive Trait (aa)
                          </label>
                          <input
                            type="text"
                            value={traitARec}
                            onChange={(e) => setTraitARec(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Gene A Dominant (A_)
                          </label>
                          <input
                            type="text"
                            value={diDomA}
                            onChange={(e) => setDiDomA(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Gene A Recessive (aa)
                          </label>
                          <input
                            type="text"
                            value={diRecA}
                            onChange={(e) => setDiRecA(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Gene B Dominant (B_)
                          </label>
                          <input
                            type="text"
                            value={diDomB}
                            onChange={(e) => setDiDomB(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Gene B Recessive (bb)
                          </label>
                          <input
                            type="text"
                            value={diRecB}
                            onChange={(e) => setDiRecB(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#111827]"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Right Column: Interactive Punnett Grid, Cell Inspector & Genotype Ratios */}
          <div className="lg:col-span-7 lg:row-span-2 space-y-4">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-2.5 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h3 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Punnett Grid ({crossData.parent1Label} × {crossData.parent2Label})
                </h3>
                <div className="flex items-center gap-2">
                  {(selectedCell || highlightedGeno || highlightedPhenoIdx !== null) && (
                    <button
                      type="button"
                      onClick={clearInspection}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    title="Copy cross ratios and results"
                    aria-label="Copy Punnett square results"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedSummary ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => buildPdfPayloadRef.current()}
                    title="Download Punnett square PDF report with logo and grid"
                    aria-label="Download Punnett square PDF report"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFF7ED] border border-orange-200 hover:bg-orange-100/70 text-xs font-semibold text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileDown className="w-3.5 h-3.5 shrink-0" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Mobile-fitted responsive table (zero horizontal scroll overflow even for 4×4 on 360px screens) */}
              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed border-separate border-spacing-1 sm:border-spacing-2 text-center">
                  <thead>
                    <tr>
                      <th className="p-1 sm:p-2 text-[10px] sm:text-xs font-mono text-slate-500">
                        P1 \ P2
                      </th>
                      {crossData.colGametes.map((cg, idx) => {
                        const isColActive = selectedCell?.c === idx;
                        return (
                          <th
                            key={idx}
                            className={`py-2 px-1 sm:p-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold transition-colors ${
                              isColActive
                                ? 'bg-[#F97316] text-white'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {cg}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {crossData.grid.map((row, rIdx) => {
                      const isRowActive = selectedCell?.r === rIdx;
                      return (
                        <tr key={rIdx}>
                          <th
                            className={`py-2 px-1 sm:p-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold transition-colors ${
                              isRowActive
                                ? 'bg-[#F97316] text-white'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {crossData.rowGametes[rIdx]}
                          </th>
                          {row.map((cell, cIdx) => {
                            const highlightState = isCellHighlighted(rIdx, cIdx, cell);
                            const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                            return (
                              <td key={cIdx} className="p-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHighlightedGeno(null);
                                    setHighlightedPhenoIdx(null);
                                    setSelectedCell(isSelected ? null : { r: rIdx, c: cIdx });
                                  }}
                                  aria-label={`Offspring cell row ${crossData.rowGametes[rIdx]} and column ${crossData.colGametes[cIdx]}: ${cell}`}
                                  aria-pressed={isSelected}
                                  className={`w-full min-h-[44px] sm:min-h-[54px] px-1 py-2 sm:p-3 rounded-lg sm:rounded-xl border font-mono text-xs sm:text-base font-bold transition-all cursor-pointer flex items-center justify-center ${cellColorClass(
                                    cell
                                  )} ${
                                    isSelected
                                      ? 'ring-2 ring-[#F97316] ring-offset-1 scale-[1.02]'
                                      : highlightState === true
                                      ? 'ring-2 ring-[#111827] ring-offset-1'
                                      : highlightState === false
                                      ? 'opacity-35'
                                      : 'hover:brightness-95'
                                  }`}
                                >
                                  {cell}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Live Tapped Cell Derivation Strip */}
              <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600">
                {inspectedDetails ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="font-mono font-bold text-[#EA580C]">
                        {inspectedDetails.p1Gamete} × {inspectedDetails.p2Gamete} →{' '}
                        {inspectedDetails.cellGeno}
                      </span>{' '}
                      <span className="text-slate-700 font-medium">
                        ({inspectedDetails.zygosity})
                      </span>
                    </div>
                    <div className="font-medium text-[#111827] tabular-nums">
                      {inspectedDetails.matchedPhenoLabel} ·{' '}
                      <span className="font-mono font-bold text-[#EA580C]">
                        {inspectedDetails.totalMatches}/{crossData.totalCells} ({inspectedDetails.pct}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">
                    Tap any square in the grid, or any genotype/phenotype below, to highlight matching offspring.
                  </p>
                )}
              </div>
            </div>

            {/* Exact Genotype Ratios */}
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2.5 tabular-nums">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Genotype Ratios ({crossData.genoEntries.length} Unique)
                </h3>
                <span className="text-xs font-mono font-bold text-[#EA580C]">
                  Ratio {crossData.genoRatio}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {crossData.genoEntries.map(([geno, count]) => {
                  const isActive = highlightedGeno === geno;
                  return (
                    <button
                      key={geno}
                      type="button"
                      onClick={() => {
                        setSelectedCell(null);
                        setHighlightedPhenoIdx(null);
                        setHighlightedGeno(isActive ? null : geno);
                      }}
                      aria-pressed={isActive}
                      className={`px-3 py-2 min-h-[40px] rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#FFF7ED] border-[#F97316] ring-1 ring-[#F97316]'
                          : 'bg-white border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      <strong className="text-[#EA580C]">{geno}</strong>:{' '}
                      <span className="font-semibold text-[#111827]">
                        {count}/{crossData.totalCells} ({((count / crossData.totalCells) * 100).toFixed(1)}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Offspring Phenotype Distribution (Left Bottom on Desktop, Below Grid on Mobile) */}
          <div className="lg:col-span-5">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3 tabular-nums">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Phenotype Distribution
                </h3>
                <span className="text-xs font-mono font-bold text-[#EA580C]">
                  Ratio {crossData.phenoRatio}
                </span>
              </div>
              <div className="space-y-2">
                {crossData.phenotypes.map((p, idx) => {
                  const isActive = highlightedPhenoIdx === idx;
                  const barPct = Math.max(0, Math.min(100, p.pct));
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCell(null);
                        setHighlightedGeno(null);
                        setHighlightedPhenoIdx(isActive ? null : idx);
                      }}
                      aria-pressed={isActive}
                      className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                        isActive
                          ? 'bg-white border-[#F97316] ring-1 ring-[#F97316]'
                          : 'bg-white/80 border-slate-200/80 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-700 leading-snug">
                          {p.label}
                        </span>
                        <span className="font-mono font-bold text-[#111827] shrink-0">
                          {p.count}/{crossData.totalCells} ({p.pct.toFixed(1)}%)
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 100 4"
                        preserveAspectRatio="none"
                        className="w-full h-2 rounded-full overflow-hidden block"
                        aria-hidden="true"
                      >
                        <rect x="0" y="0" width="100" height="4" fill="#E2E8F0" />
                        <rect
                          x="0"
                          y="0"
                          width={barPct}
                          height="4"
                          fill={phenoBarColor(p.tone)}
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function traitSafe(val: string, fallback: string): string {
  const trimmed = String(val || '').trim();
  return trimmed || fallback;
}

// ============================================================================
// 2. DNA → RNA → PROTEIN SEQUENCE TRANSLATOR
// ============================================================================
const CODON_TABLE: Record<string, { aa3: string; aa1: string; group: string }> = {
  UUU: { aa3: 'Phe', aa1: 'F', group: 'Nonpolar' }, UUC: { aa3: 'Phe', aa1: 'F', group: 'Nonpolar' },
  UUA: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' }, UUG: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' },
  CUU: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' }, CUC: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' },
  CUA: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' }, CUG: { aa3: 'Leu', aa1: 'L', group: 'Nonpolar' },
  AUU: { aa3: 'Ile', aa1: 'I', group: 'Nonpolar' }, AUC: { aa3: 'Ile', aa1: 'I', group: 'Nonpolar' },
  AUA: { aa3: 'Ile', aa1: 'I', group: 'Nonpolar' }, AUG: { aa3: 'Met', aa1: 'M', group: 'Start · Nonpolar' },
  GUU: { aa3: 'Val', aa1: 'V', group: 'Nonpolar' }, GUC: { aa3: 'Val', aa1: 'V', group: 'Nonpolar' },
  GUA: { aa3: 'Val', aa1: 'V', group: 'Nonpolar' }, GUG: { aa3: 'Val', aa1: 'V', group: 'Nonpolar' },
  UCU: { aa3: 'Ser', aa1: 'S', group: 'Polar' }, UCC: { aa3: 'Ser', aa1: 'S', group: 'Polar' },
  UCA: { aa3: 'Ser', aa1: 'S', group: 'Polar' }, UCG: { aa3: 'Ser', aa1: 'S', group: 'Polar' },
  CCU: { aa3: 'Pro', aa1: 'P', group: 'Nonpolar' }, CCC: { aa3: 'Pro', aa1: 'P', group: 'Nonpolar' },
  CCA: { aa3: 'Pro', aa1: 'P', group: 'Nonpolar' }, CCG: { aa3: 'Pro', aa1: 'P', group: 'Nonpolar' },
  ACU: { aa3: 'Thr', aa1: 'T', group: 'Polar' }, ACC: { aa3: 'Thr', aa1: 'T', group: 'Polar' },
  ACA: { aa3: 'Thr', aa1: 'T', group: 'Polar' }, ACG: { aa3: 'Thr', aa1: 'T', group: 'Polar' },
  GCU: { aa3: 'Ala', aa1: 'A', group: 'Nonpolar' }, GCC: { aa3: 'Ala', aa1: 'A', group: 'Nonpolar' },
  GCA: { aa3: 'Ala', aa1: 'A', group: 'Nonpolar' }, GCG: { aa3: 'Ala', aa1: 'A', group: 'Nonpolar' },
  UAU: { aa3: 'Tyr', aa1: 'Y', group: 'Polar' }, UAC: { aa3: 'Tyr', aa1: 'Y', group: 'Polar' },
  UAA: { aa3: 'Stop', aa1: '*', group: 'Ochre Stop' }, UAG: { aa3: 'Stop', aa1: '*', group: 'Amber Stop' },
  CAU: { aa3: 'His', aa1: 'H', group: 'Basic (+)' }, CAC: { aa3: 'His', aa1: 'H', group: 'Basic (+)' },
  CAA: { aa3: 'Gln', aa1: 'Q', group: 'Polar' }, CAG: { aa3: 'Gln', aa1: 'Q', group: 'Polar' },
  AAU: { aa3: 'Asn', aa1: 'N', group: 'Polar' }, AAC: { aa3: 'Asn', aa1: 'N', group: 'Polar' },
  AAA: { aa3: 'Lys', aa1: 'K', group: 'Basic (+)' }, AAG: { aa3: 'Lys', aa1: 'K', group: 'Basic (+)' },
  GAU: { aa3: 'Asp', aa1: 'D', group: 'Acidic (−)' }, GAC: { aa3: 'Asp', aa1: 'D', group: 'Acidic (−)' },
  GAA: { aa3: 'Glu', aa1: 'E', group: 'Acidic (−)' }, GAG: { aa3: 'Glu', aa1: 'E', group: 'Acidic (−)' },
  UGU: { aa3: 'Cys', aa1: 'C', group: 'Polar' }, UGC: { aa3: 'Cys', aa1: 'C', group: 'Polar' },
  UGA: { aa3: 'Stop', aa1: '*', group: 'Opal Stop' }, UGG: { aa3: 'Trp', aa1: 'W', group: 'Nonpolar' },
  CGU: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' }, CGC: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' },
  CGA: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' }, CGG: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' },
  AGU: { aa3: 'Ser', aa1: 'S', group: 'Polar' }, AGC: { aa3: 'Ser', aa1: 'S', group: 'Polar' },
  AGA: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' }, AGG: { aa3: 'Arg', aa1: 'R', group: 'Basic (+)' },
  GGU: { aa3: 'Gly', aa1: 'G', group: 'Nonpolar' }, GGC: { aa3: 'Gly', aa1: 'G', group: 'Nonpolar' },
  GGA: { aa3: 'Gly', aa1: 'G', group: 'Nonpolar' }, GGG: { aa3: 'Gly', aa1: 'G', group: 'Nonpolar' },
};

const BRCA1_SAMPLE = 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCATGA';
const INSULIN_SAMPLE = 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGAA';
const HBA_NORMAL_SAMPLE = 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGT';
const HBS_MUTATION_SAMPLE = 'ATGGTGCATCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGT';

export function DnaRnaProteinTranslator() {
  const [dnaInput, setDnaInput] = useState(INSULIN_SAMPLE);
  const [strandType, setStrandType] = useState<'coding' | 'template'>('coding');
  const [selectedCodonIdx, setSelectedCodonIdx] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'dna-rna-protein-translator') return;
      if (typeof detail.dnaInput === 'string') setDnaInput(detail.dnaInput);
      if (detail.strandType === 'coding' || detail.strandType === 'template') {
        setStrandType(detail.strandType);
      }
      setSelectedCodonIdx(0);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const upperRaw = dnaInput.toUpperCase().replace(/\s+/g, '');
  const invalidChars = Array.from(new Set(upperRaw.replace(/[ATCG]/g, '').split('')));
  const cleanDna = upperRaw.replace(/[^ATCG]/g, '');

  const compMap: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
  const complement3To5 = cleanDna
    .split('')
    .map((b) => compMap[b] || '')
    .join('');

  const mrna =
    strandType === 'coding'
      ? cleanDna.replace(/T/g, 'U')
      : complement3To5.replace(/T/g, 'U');

  const codons: string[] = [];
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    codons.push(mrna.slice(i, i + 3));
  }

  const translated = codons.map((codon) => CODON_TABLE[codon] || { aa3: 'Xaa', aa1: 'X', group: 'Unknown' });
  const gcCount = (cleanDna.match(/[GC]/g) || []).length;
  const gcPct = cleanDna.length > 0 ? (gcCount / cleanDna.length) * 100 : 0;
  const activeIdx = selectedCodonIdx !== null && selectedCodonIdx < codons.length ? selectedCodonIdx : null;

  const handleReset = () => {
    setDnaInput(INSULIN_SAMPLE);
    setStrandType('coding');
    setSelectedCodonIdx(0);
  };

  const handleExportPdf = () => {
    const threeLetter = translated.map((t) => t.aa3).join('-');
    const oneLetter = translated.map((t) => t.aa1).join('');
    void downloadBiologyStructuredPdf({
      filename: 'dna-rna-protein-translation-report.pdf',
      badgeText: 'BIOLOGY · MOLECULAR GENETICS REPORT',
      title: 'DNA -> mRNA -> Protein Sequence Translation Report',
      subtitle: `Central Dogma transcription & genetic code translation (${cleanDna.length} bp)`,
      parameters: [
        { label: 'Input Strand Mode', value: strandType === 'coding' ? "5'->3' Coding (Sense)" : "3'->5' Template (Antisense)" },
        { label: 'Sequence Length & GC%', value: `${cleanDna.length} bp (${codons.length} codons) · GC ${gcPct.toFixed(1)}%` },
      ],
      kpis: [
        { label: 'Total Bases', value: `${cleanDna.length} nt`, sublabel: `GC Content: ${gcPct.toFixed(1)}%` },
        { label: 'mRNA Codon Triplets', value: `${codons.length}`, sublabel: `${cleanDna.length % 3} trailing nt ungrouped` },
        { label: 'Polypeptide Residues', value: `${translated.length} aa`, sublabel: 'Standard Genetic Code', accent: true },
      ],
      sequenceBlocks: [
        { title: `Input DNA (${strandType === 'coding' ? "5'->3'" : "3'->5'"})`, content: cleanDna || '-' },
        { title: "Transcribed mRNA (5'->3' Triplets)", content: codons.join(' ') || '-' },
        { title: '1-Letter FASTA Polypeptide', content: oneLetter || '-' },
        { title: '3-Letter Amino Acid Chain', content: threeLetter || '-' },
      ],
      tables: [
        {
          title: 'Codon-by-Codon Translation Table (First 30 Codons)',
          headers: ['#', 'mRNA Codon', '3-Letter AA', '1-Letter', 'Side-Chain Class'],
          rows: codons.slice(0, 30).map((c, idx) => [
            String(idx + 1),
            c,
            translated[idx].aa3,
            translated[idx].aa1,
            translated[idx].group,
          ]),
          colWidths: [10, 22, 20, 16, 32],
          monospaceCols: [0, 1, 3],
        },
      ],
      workedExample: {
        problem: "Translate the 5'->3' coding DNA strand: 5'-ATG GCC TGG TAA-3'.",
        steps: [
          "Write the 3'->5' template DNA complement via Watson-Crick pairing (A<->T, G<->C): 3'-TAC CGG ACC ATT-5'.",
          "Transcribe into 5'->3' mRNA by replacing Thymine (T) on the coding strand with Uracil (U): 5'-AUG GCC UGG UAA-3'.",
          'Read mRNA codons: AUG = Met (M, Start), GCC = Ala (A), UGG = Trp (W), UAA = Stop (*).',
        ],
        answer: 'Polypeptide: Met-Ala-Trp-Stop (M-A-W-*)',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="dna-rna-protein-translator"
      title="DNA -> mRNA -> Protein Translator"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStrandType('coding')}
            aria-pressed={strandType === 'coding'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              strandType === 'coding' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5′→3′ Coding (Sense)
          </button>
          <button
            type="button"
            onClick={() => setStrandType('template')}
            aria-pressed={strandType === 'template'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              strandType === 'template' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3′→5′ Template (Antisense)
          </button>
        </div>
      }
      presetsLabel="Gene Presets:"
      presets={[
        {
          label: 'Human Insulin (INS)',
          active: cleanDna === INSULIN_SAMPLE,
          onClick: () => {
            setStrandType('coding');
            setDnaInput(INSULIN_SAMPLE);
            setSelectedCodonIdx(0);
          },
        },
        {
          label: 'BRCA1 Exon 1',
          active: cleanDna === BRCA1_SAMPLE,
          onClick: () => {
            setStrandType('coding');
            setDnaInput(BRCA1_SAMPLE);
            setSelectedCodonIdx(0);
          },
        },
        {
          label: 'Normal HbA (Glu-6)',
          active: cleanDna === HBA_NORMAL_SAMPLE,
          onClick: () => {
            setStrandType('coding');
            setDnaInput(HBA_NORMAL_SAMPLE);
            setSelectedCodonIdx(5);
          },
        },
        {
          label: 'Sickle HbS (Val-6)',
          active: cleanDna === HBS_MUTATION_SAMPLE,
          onClick: () => {
            setStrandType('coding');
            setDnaInput(HBS_MUTATION_SAMPLE);
            setSelectedCodonIdx(5);
          },
        },
      ]}
    >
      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
          <label htmlFor="dna-seq-input" className="font-bold text-[#111827]">
            Input DNA Sequence ({strandType === 'coding' ? '5′ → 3′ Coding' : '3′ → 5′ Template'}):
          </label>
          <span className="text-slate-600 font-mono font-semibold">
            {cleanDna.length} bp · {codons.length} codons · GC: {gcPct.toFixed(1)}%
          </span>
        </div>
        <textarea
          id="dna-seq-input"
          rows={3}
          value={dnaInput}
          onChange={(e) => setDnaInput(e.target.value)}
          placeholder="Paste DNA bases A, T, C, G..."
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none font-mono text-xs sm:text-sm tracking-wider text-[#111827]"
        />
        {invalidChars.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Ignored non-DNA characters ({invalidChars.join(', ')}). Only A, T, C, and G are transcribed.
            </span>
          </div>
        )}
      </div>

      {/* Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-bold text-slate-600 block">
            Complementary DNA ({strandType === 'coding' ? '3′ → 5′ Template' : '5′ → 3′ Coding'})
          </span>
          <p className="font-mono text-xs sm:text-sm text-[#111827] break-all leading-relaxed">
            {complement3To5 || '—'}
          </p>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-bold text-[#EA580C] block">
            Transcribed mRNA (5′ → 3′ Triplets)
          </span>
          <p className="font-mono text-xs sm:text-sm text-[#111827] break-words leading-relaxed">
            {codons.length > 0 ? codons.join(' ') : '—'}
          </p>
        </div>
      </div>

      {/* Polypeptide Outputs */}
      <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#111827]">
            Translated Amino Acid Polypeptide ({translated.length} residues)
          </h3>
          <button
            type="button"
            onClick={() => {
              const summary = `3-Letter: ${translated.map((t) => t.aa3).join('-')}\n1-Letter: ${translated
                .map((t) => t.aa1)
                .join('')}`;
              navigator.clipboard.writeText(summary);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-white border border-orange-200 text-xs font-semibold text-[#EA580C] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Protein'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {codons.map((c, idx) => {
            const aa = translated[idx];
            const isStart = c === 'AUG';
            const isStop = aa.aa3 === 'Stop';
            const isSelected = activeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCodonIdx(isSelected ? null : idx)}
                aria-pressed={isSelected}
                className={`px-2.5 py-1.5 min-h-[44px] rounded-xl border text-center font-mono text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#F97316] bg-white border-[#F97316]'
                    : isStart
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isStop
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-white border-orange-200/70 text-[#111827] hover:border-[#F97316]'
                }`}
              >
                <div className="text-[10px] text-slate-500">#{idx + 1} · {c}</div>
                <div className="font-bold">
                  {aa.aa3} ({aa.aa1})
                </div>
              </button>
            );
          })}
        </div>

        {activeIdx !== null && (
          <div className="bg-white border border-orange-200 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
            <span className="font-semibold text-[#111827]">
              Codon #{activeIdx + 1}: <code className="font-mono font-bold text-[#EA580C]">{codons[activeIdx]}</code> →{' '}
              <strong>{translated[activeIdx].aa3}</strong> ({translated[activeIdx].aa1})
            </span>
            <span className="text-slate-600 font-medium">
              Side-Chain Property: <strong className="text-[#111827]">{translated[activeIdx].group}</strong>
            </span>
          </div>
        )}

        <div className="bg-white border border-orange-100 rounded-xl p-3 font-mono text-xs text-slate-700 break-all">
          <strong className="text-[#111827]">1-Letter FASTA:</strong>{' '}
          {translated.map((t) => t.aa1).join('') || '—'}
        </div>
      </div>
    </BiologyToolShell>
  );
}

// ============================================================================
// 3. PCR MASTER MIX & PRIMER ANNEALING (Tm) CALCULATOR
// ============================================================================
function analyzePrimer(rawSeq: string) {
  const seq = rawSeq.toUpperCase().replace(/[^ATCG]/g, '');
  const len = seq.length;
  if (len === 0) {
    return { seq: '', len: 0, gcPct: 0, wallaceTm: 0, nnTm: 0 };
  }
  const g = (seq.match(/G/g) || []).length;
  const c = (seq.match(/C/g) || []).length;
  const a = (seq.match(/A/g) || []).length;
  const t = (seq.match(/T/g) || []).length;
  const gcPct = ((g + c) / len) * 100;
  const wallaceTm = 2 * (a + t) + 4 * (g + c);
  const nnTm = 64.9 + (41 * (g + c - 16.4)) / len;
  return { seq, len, gcPct, wallaceTm, nnTm };
}

export function PcrMasterMixCalculator() {
  const [sampleCount, setSampleCount] = useState<number>(8);
  const [rxnVolume, setRxnVolume] = useState<number>(25);
  const [includeOverage, setIncludeOverage] = useState<boolean>(true);
  const [fwdPrimer, setFwdPrimer] = useState('GCTAGCTAGCTGATCGATGC');
  const [revPrimer, setRevPrimer] = useState('CGATCGATCGACTAGCTACG');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'pcr-master-mix-calculator') return;
      if (typeof detail.sampleCount === 'number') setSampleCount(detail.sampleCount);
      if (typeof detail.rxnVolume === 'number') setRxnVolume(detail.rxnVolume);
      if (typeof detail.includeOverage === 'boolean') setIncludeOverage(detail.includeOverage);
      if (typeof detail.fwdPrimer === 'string') setFwdPrimer(detail.fwdPrimer);
      if (typeof detail.revPrimer === 'string') setRevPrimer(detail.revPrimer);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
    setSampleCount(8);
    setRxnVolume(25);
    setIncludeOverage(true);
    setFwdPrimer('GCTAGCTAGCTGATCGATGC');
    setRevPrimer('CGATCGATCGACTAGCTACG');
  };

  const scaleFactor = sampleCount * (includeOverage ? 1.1 : 1.0);
  const scaleRatio = rxnVolume / 25;

  const reagents = [
    { name: 'Nuclease-Free H₂O', perRxn: 9.0 * scaleRatio, inMasterMix: true },
    { name: '5× Reaction Buffer (with MgCl₂)', perRxn: 5.0 * scaleRatio, inMasterMix: true },
    { name: '10 mM dNTP Mix (200 µM final)', perRxn: 0.5 * scaleRatio, inMasterMix: true },
    { name: '10 µM Forward Primer (0.4 µM final)', perRxn: 1.0 * scaleRatio, inMasterMix: true },
    { name: '10 µM Reverse Primer (0.4 µM final)', perRxn: 1.0 * scaleRatio, inMasterMix: true },
    { name: 'High-Fidelity DNA Polymerase', perRxn: 0.5 * scaleRatio, inMasterMix: true },
    { name: 'Template DNA (added per individual tube)', perRxn: 8.0 * scaleRatio, inMasterMix: false },
  ];

  const masterMixPerTube = reagents.filter((r) => r.inMasterMix).reduce((acc, r) => acc + r.perRxn, 0);
  const totalMasterMixBatch = masterMixPerTube * scaleFactor;

  const fwdStats = analyzePrimer(fwdPrimer);
  const revStats = analyzePrimer(revPrimer);
  const deltaTm = Math.abs(fwdStats.nnTm - revStats.nnTm);
  const recommendedTa =
    fwdStats.len > 0 && revStats.len > 0
      ? Math.min(fwdStats.nnTm, revStats.nnTm) - 4.0
      : 55.0;

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `pcr-master-mix-${sampleCount}rxn.pdf`,
      badgeText: 'BIOLOGY · PCR PROTOCOL REPORT',
      title: 'PCR Master Mix & Primer Annealing (Tm) Report',
      subtitle: `${sampleCount} reactions × ${rxnVolume} uL (${includeOverage ? '+10% pipetting overage' : 'exact batch'})`,
      parameters: [
        { label: 'Reaction Count (N)', value: `${sampleCount} tubes (${scaleFactor.toFixed(1)}x multiplier)` },
        { label: 'Single Tube Volume', value: `${rxnVolume} uL (Dispense ${masterMixPerTube.toFixed(1)} uL mix + ${(8 * scaleRatio).toFixed(1)} uL DNA)` },
        { label: "Forward Primer (5'->3')", value: `${fwdStats.seq || '-'} (${fwdStats.len} nt)` },
        { label: "Reverse Primer (5'->3')", value: `${revStats.seq || '-'} (${revStats.len} nt)` },
      ],
      kpis: [
        { label: 'Total Master Mix Batch', value: `${totalMasterMixBatch.toFixed(1)} uL`, sublabel: `Dispense ${masterMixPerTube.toFixed(1)} uL/tube` },
        { label: 'Recommended Annealing Ta', value: `${recommendedTa.toFixed(1)} C`, sublabel: `Delta Tm = ${deltaTm.toFixed(1)} C`, accent: true },
        { label: 'Primer GC Balance', value: `${fwdStats.gcPct.toFixed(0)}% / ${revStats.gcPct.toFixed(0)}%`, sublabel: 'Ideal 40% - 60% GC' },
      ],
      tables: [
        {
          title: `Pipetting Recipe (${scaleFactor.toFixed(1)}x Batch Multiplier)`,
          headers: ['Reagent Component', '1x Tube (uL)', `Master Mix (${scaleFactor.toFixed(1)}x)`, 'Notes'],
          rows: reagents.map((r) => [
            r.name,
            r.perRxn.toFixed(2),
            r.inMasterMix ? `${(r.perRxn * scaleFactor).toFixed(2)} uL` : 'Individual tube',
            r.inMasterMix ? 'Pool in Master Mix' : 'Add last per sample',
          ]),
          colWidths: [40, 18, 22, 20],
          alignRightCols: [1, 2],
          monospaceCols: [1, 2],
        },
        {
          title: 'Primer Thermodynamic Summary',
          headers: ['Primer', 'Length', 'GC %', 'Wallace Tm', 'Salt-Adjusted Tm'],
          rows: [
            ['Forward', `${fwdStats.len} nt`, `${fwdStats.gcPct.toFixed(1)}%`, `${fwdStats.wallaceTm.toFixed(1)} C`, `${fwdStats.nnTm.toFixed(1)} C`],
            ['Reverse', `${revStats.len} nt`, `${revStats.gcPct.toFixed(1)}%`, `${revStats.wallaceTm.toFixed(1)} C`, `${revStats.nnTm.toFixed(1)} C`],
          ],
          colWidths: [20, 16, 18, 22, 24],
          alignRightCols: [1, 2, 3, 4],
          monospaceCols: [1, 2, 3, 4],
        },
      ],
      workedExample: {
        problem: "Prepare a 25 uL PCR master mix for 8 samples (+10% overage) and find the Wallace Tm of primer 5'-ATGCGTACGTAGCTAGCTAG-3' (10 G/C, 10 A/T).",
        steps: [
          'Apply 10% overage to 8 reactions: multiplier = 8 x 1.10 = 8.8 reaction equivalents.',
          'Multiply each 1x master mix volume by 8.8 while adding template DNA individually to each tube.',
          'Compute Wallace Tm = 2(10) + 4(10) = 60.0 C; starting annealing Ta ~ Tm - 5 C = 55.0 C.',
        ],
        answer: 'Master Mix Multiplier = 8.8x · Primer GC = 50.0% · Wallace Tm = 60.0 C',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="pcr-master-mix-calculator"
      title="PCR Master Mix Scaler & Primer Tm"
      subtitle="Calculates micropipette batch volumes with 10% overage plus forward/reverse annealing temperatures."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      presetsLabel="Lab Batch Presets:"
      presets={[
        {
          label: '8× Routine Taq (25 µL)',
          active: sampleCount === 8 && rxnVolume === 25,
          onClick: handleReset,
        },
        {
          label: '12× Human INS Amplicon',
          active: sampleCount === 12 && fwdPrimer === 'ATGGCCCTGTGGATGCGCCT',
          onClick: () => {
            setSampleCount(12);
            setRxnVolume(25);
            setIncludeOverage(true);
            setFwdPrimer('ATGGCCCTGTGGATGCGCCT');
            setRevPrimer('TCAAAGGCTGCGGCTGGGTC');
          },
        },
        {
          label: '24× Prep Digest (50 µL)',
          active: sampleCount === 24 && rxnVolume === 50,
          onClick: () => {
            setSampleCount(24);
            setRxnVolume(50);
            setIncludeOverage(true);
          },
        },
        {
          label: '96-Well Plate (20 µL)',
          active: sampleCount === 96 && rxnVolume === 20,
          onClick: () => {
            setSampleCount(96);
            setRxnVolume(20);
            setIncludeOverage(true);
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Master Mix Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 tabular-nums">
            <div>
              <label htmlFor="pcr-sample-count" className="block text-xs font-bold text-slate-700 mb-1">
                Number of Reactions (N)
              </label>
              <input
                id="pcr-sample-count"
                type="number"
                min={1}
                max={384}
                value={sampleCount}
                onChange={(e) => setSampleCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="pcr-rxn-vol" className="block text-xs font-bold text-slate-700 mb-1">
                Single Tube Vol (µL)
              </label>
              <select
                id="pcr-rxn-vol"
                value={rxnVolume}
                onChange={(e) => setRxnVolume(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              >
                <option value={20}>20 µL</option>
                <option value={25}>25 µL (Standard)</option>
                <option value={50}>50 µL (Prep)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-200 inline-flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOverage}
                  onChange={(e) => setIncludeOverage(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#F97316]"
                />
                <span>+10% Overage ({scaleFactor.toFixed(1)}×)</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-[#F9FAFB] border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 sm:px-4 font-bold">PCR Component</th>
                  <th className="py-3 px-2 sm:px-3 font-bold text-right">1× (µL)</th>
                  <th className="py-3 px-3 sm:px-4 font-bold text-right text-[#EA580C]">
                    Batch ({scaleFactor.toFixed(1)}×)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reagents.map((r) => (
                  <tr key={r.name} className={r.inMasterMix ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-[#111827]">{r.name}</td>
                    <td className="py-2.5 px-2 sm:px-3 text-right font-mono">{r.perRxn.toFixed(2)}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-bold text-[#111827]">
                      {r.inMasterMix ? `${(r.perRxn * scaleFactor).toFixed(2)} µL` : 'Add per tube'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#FFF7ED]/70 font-bold">
                  <td className="py-2.5 px-3 sm:px-4 text-[#111827]">Master Mix Dispense Total</td>
                  <td className="py-2.5 px-2 sm:px-3 text-right font-mono text-[#EA580C]">
                    {masterMixPerTube.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-mono text-[#EA580C]">
                    {totalMasterMixBatch.toFixed(2)} µL
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Primer Analyzer Section */}
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 tabular-nums">
          <h3 className="text-sm font-bold text-[#111827]">Forward &amp; Reverse Primer Tm</h3>

          <div className="space-y-1.5">
            <label htmlFor="pcr-fwd-primer" className="block text-xs font-semibold text-slate-700">
              Forward Primer (5′ → 3′)
            </label>
            <input
              id="pcr-fwd-primer"
              type="text"
              value={fwdPrimer}
              onChange={(e) => setFwdPrimer(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
            />
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-mono pt-0.5">
              <span>{fwdStats.len} nt</span>
              <span>· GC: {fwdStats.gcPct.toFixed(1)}%</span>
              <span>· Wallace: {fwdStats.wallaceTm.toFixed(1)}°C</span>
              <span className="font-bold text-[#EA580C]">· Salt Tm: {fwdStats.nnTm.toFixed(1)}°C</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pcr-rev-primer" className="block text-xs font-semibold text-slate-700">
              Reverse Primer (5′ → 3′)
            </label>
            <input
              id="pcr-rev-primer"
              type="text"
              value={revPrimer}
              onChange={(e) => setRevPrimer(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
            />
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-mono pt-0.5">
              <span>{revStats.len} nt</span>
              <span>· GC: {revStats.gcPct.toFixed(1)}%</span>
              <span>· Wallace: {revStats.wallaceTm.toFixed(1)}°C</span>
              <span className="font-bold text-[#EA580C]">· Salt Tm: {revStats.nnTm.toFixed(1)}°C</span>
            </div>
          </div>

          <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-4 space-y-1">
            <span className="text-xs font-bold text-[#EA580C] block">
              Recommended Thermocycler Annealing (Ta)
            </span>
            <p className="text-2xl font-mono font-bold text-[#111827]">
              {recommendedTa.toFixed(1)} °C
            </p>
            <p className="text-xs text-slate-600">
              ΔTm difference: <strong className={deltaTm <= 2 ? 'text-emerald-700' : 'text-amber-700'}>{deltaTm.toFixed(1)} °C</strong> (Ideal ≤ 2.0 °C)
            </p>
          </div>
        </div>
      </div>
    </BiologyToolShell>
  );
}

// ============================================================================
// 4. HARDY-WEINBERG EQUILIBRIUM CALCULATOR
// ============================================================================
export function HardyWeinbergCalculator() {
  const [obsAA, setObsAA] = useState<number>(320);
  const [obsAa, setObsAa] = useState<number>(160);
  const [obsaa, setObsaa] = useState<number>(20);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'hardy-weinberg-calculator') return;
      if (typeof detail.obsAA === 'number') setObsAA(detail.obsAA);
      if (typeof detail.obsAa === 'number') setObsAa(detail.obsAa);
      if (typeof detail.obsaa === 'number') setObsaa(detail.obsaa);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const totalN = Math.max(0, obsAA) + Math.max(0, obsAa) + Math.max(0, obsaa);
  const p = totalN > 0 ? (2 * obsAA + obsAa) / (2 * totalN) : 0;
  const q = 1 - p;

  const expAA = p * p * totalN;
  const expAa = 2 * p * q * totalN;
  const expaa = q * q * totalN;

  const chiTerm = (o: number, e: number) => (e > 0 ? Math.pow(o - e, 2) / e : 0);
  const chiSquare = chiTerm(obsAA, expAA) + chiTerm(obsAa, expAa) + chiTerm(obsaa, expaa);
  const inEquilibrium = chiSquare <= 3.841;

  const handleReset = () => {
    setObsAA(320);
    setObsAa(160);
    setObsaa(20);
  };

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `hardy-weinberg-N${totalN}.pdf`,
      badgeText: 'BIOLOGY · POPULATION GENETICS REPORT',
      title: 'Hardy-Weinberg Equilibrium & Chi-Square Test Report',
      subtitle: `Population Size N = ${totalN} individuals · df = 1 · alpha = 0.05 (critical = 3.841)`,
      parameters: [
        { label: 'Observed Counts (AA / Aa / aa)', value: `${obsAA} / ${obsAa} / ${obsaa} (N = ${totalN})` },
        { label: 'Allele Frequencies (p, q)', value: `p = ${p.toFixed(4)} · q = ${q.toFixed(4)}` },
      ],
      kpis: [
        { label: 'Dominant Allele (p)', value: p.toFixed(4), sublabel: `p^2 = ${(p * p * 100).toFixed(1)}% expected AA`, accent: true },
        { label: 'Recessive Allele (q)', value: q.toFixed(4), sublabel: `q^2 = ${(q * q * 100).toFixed(1)}% expected aa` },
        { label: 'Chi-Square (df = 1)', value: chiSquare.toFixed(4), sublabel: inEquilibrium ? 'In Equilibrium (<= 3.841)' : 'Significant Deviation (> 3.841)' },
      ],
      callout: {
        title: inEquilibrium ? 'Equilibrium Verdict: Fail to Reject H0 (In Hardy-Weinberg Equilibrium)' : 'Equilibrium Verdict: Reject H0 (Population Deviates from HWE)',
        body: inEquilibrium
          ? `chi^2 = ${chiSquare.toFixed(4)} <= 3.841 (p > 0.05, df = 1). Observed genotype counts closely match p^2 + 2pq + q^2 = 1 expectations.`
          : `chi^2 = ${chiSquare.toFixed(4)} > 3.841 (p < 0.05, df = 1). Evolutionary forces (selection, inbreeding, genetic drift, or migration) are acting on this locus.`,
        tone: inEquilibrium ? 'emerald' : 'amber',
      },
      barsSection: {
        title: 'Expected vs Observed Genotype Frequencies',
        bars: [
          { label: `AA (Homozygous Dom) · Obs ${obsAA} vs Exp ${expAA.toFixed(1)}`, valueText: `${(p * p * 100).toFixed(1)}% HWE`, pct: p * p * 100, colorRgb: [249, 115, 22] },
          { label: `Aa (Heterozygous Carrier) · Obs ${obsAa} vs Exp ${expAa.toFixed(1)}`, valueText: `${(2 * p * q * 100).toFixed(1)}% HWE`, pct: 2 * p * q * 100, colorRgb: [2, 132, 199] },
          { label: `aa (Homozygous Rec) · Obs ${obsaa} vs Exp ${expaa.toFixed(1)}`, valueText: `${(q * q * 100).toFixed(1)}% HWE`, pct: q * q * 100, colorRgb: [100, 116, 139] },
        ],
      },
      tables: [
        {
          title: 'Chi-Square Goodness-of-Fit Breakdown',
          headers: ['Genotype', 'HWE Freq', 'Observed (O)', 'Expected (E)', '(O - E)^2 / E'],
          rows: [
            ['AA (p^2)', (p * p).toFixed(4), String(obsAA), expAA.toFixed(2), chiTerm(obsAA, expAA).toFixed(4)],
            ['Aa (2pq)', (2 * p * q).toFixed(4), String(obsAa), expAa.toFixed(2), chiTerm(obsAa, expAa).toFixed(4)],
            ['aa (q^2)', (q * q).toFixed(4), String(obsaa), expaa.toFixed(2), chiTerm(obsaa, expaa).toFixed(4)],
            ['Total (N)', '1.0000', String(totalN), totalN.toFixed(2), `chi^2 = ${chiSquare.toFixed(4)}`],
          ],
          colWidths: [20, 18, 20, 20, 22],
          alignRightCols: [1, 2, 3, 4],
          monospaceCols: [1, 2, 3, 4],
        },
      ],
      workedExample: {
        problem: 'In a moth population of N = 500, you observe 320 AA, 160 Aa, and 20 aa individuals. Test for Hardy-Weinberg equilibrium.',
        steps: [
          'Dominant allele frequency p = (2 x 320 + 160) / 1000 = 0.80; q = 1 - 0.80 = 0.20.',
          'Expected HWE counts: E(AA) = 0.64 x 500 = 320; E(Aa) = 0.32 x 500 = 160; E(aa) = 0.04 x 500 = 20.',
          'Calculate chi^2 = Sum (O - E)^2 / E = 0.000 (< 3.841 critical threshold at df = 1).',
        ],
        answer: 'p = 0.80, q = 0.20 · chi^2 = 0.000 (In Hardy-Weinberg Equilibrium)',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="hardy-weinberg-calculator"
      title="Hardy-Weinberg Equilibrium & χ² Solver"
      subtitle="Tests observed genotype counts against p² + 2pq + q² = 1 (df = 1, α = 0.05 critical χ² = 3.841)."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      presetsLabel="Population Samples:"
      presets={[
        {
          label: 'Peppered Moth Equilibrium (N=500)',
          active: obsAA === 320 && obsAa === 160 && obsaa === 20,
          onClick: handleReset,
        },
        {
          label: 'Heterozygote Advantage (HbS)',
          active: obsAA === 150 && obsAa === 290 && obsaa === 60,
          onClick: () => {
            setObsAA(150);
            setObsAa(290);
            setObsaa(60);
          },
        },
        {
          label: 'Inbreeding Excess Homozygotes',
          active: obsAA === 210 && obsAa === 80 && obsaa === 110,
          onClick: () => {
            setObsAA(210);
            setObsAa(80);
            setObsaa(110);
          },
        },
        {
          label: 'Cystic Fibrosis Carrier (N=2,500)',
          active: obsAA === 2401 && obsAa === 98 && obsaa === 1,
          onClick: () => {
            setObsAA(2401);
            setObsAa(98);
            setObsaa(1);
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start tabular-nums">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <label htmlFor="hwe-aa-dom" className="block text-xs font-bold text-slate-700 mb-1">
                Observed AA
              </label>
              <input
                id="hwe-aa-dom"
                type="number"
                min={0}
                value={obsAA}
                onChange={(e) => setObsAA(Math.max(0, Number(e.target.value) || 0))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="hwe-aa-het" className="block text-xs font-bold text-slate-700 mb-1">
                Observed Aa
              </label>
              <input
                id="hwe-aa-het"
                type="number"
                min={0}
                value={obsAa}
                onChange={(e) => setObsAa(Math.max(0, Number(e.target.value) || 0))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="hwe-aa-rec" className="block text-xs font-bold text-slate-700 mb-1">
                Observed aa
              </label>
              <input
                id="hwe-aa-rec"
                type="number"
                min={0}
                value={obsaa}
                onChange={(e) => setObsaa(Math.max(0, Number(e.target.value) || 0))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="block text-xs font-semibold text-slate-600">Dominant Allele (p)</span>
              <span className="text-2xl font-mono font-bold text-[#EA580C]">{p.toFixed(4)}</span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="block text-xs font-semibold text-slate-600">Recessive Allele (q)</span>
              <span className="text-2xl font-mono font-bold text-[#111827]">{q.toFixed(4)}</span>
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 border flex items-start gap-3 ${
              inEquilibrium
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {inEquilibrium ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">
                χ² = {chiSquare.toFixed(4)} ({inEquilibrium ? 'Fail to Reject H₀ — In HWE' : 'Reject H₀ — Significant Deviation'})
              </p>
              <p>
                {inEquilibrium
                  ? 'χ² ≤ 3.841 (p > 0.05, df = 1): Observed counts closely match Hardy-Weinberg expectations.'
                  : 'χ² > 3.841 (p < 0.05, df = 1): Population deviates significantly from equilibrium (selection, non-random mating, or migration).'}
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table + Genotype Frequency Bars */}
        <div className="lg:col-span-7 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 sm:px-4 font-bold">Genotype</th>
                  <th className="py-3 px-2 sm:px-3 font-bold text-right">HWE Freq</th>
                  <th className="py-3 px-2 sm:px-3 font-bold text-right">Obs (O)</th>
                  <th className="py-3 px-2 sm:px-3 font-bold text-right">Exp (E)</th>
                  <th className="py-3 px-3 sm:px-4 font-bold text-right">(O − E)² / E</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#111827]">AA (p²)</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{(p * p).toFixed(4)}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{obsAA}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{expAA.toFixed(2)}</td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#EA580C]">{chiTerm(obsAA, expAA).toFixed(4)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#111827]">Aa (2pq)</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{(2 * p * q).toFixed(4)}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{obsAa}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{expAa.toFixed(2)}</td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#EA580C]">{chiTerm(obsAa, expAa).toFixed(4)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#111827]">aa (q²)</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{(q * q).toFixed(4)}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{obsaa}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{expaa.toFixed(2)}</td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#EA580C]">{chiTerm(obsaa, expaa).toFixed(4)}</td>
                </tr>
                <tr className="bg-[#F9FAFB] font-bold">
                  <td className="py-3 px-3 sm:px-4">Total (N)</td>
                  <td className="py-3 px-2 sm:px-3 text-right">1.0000</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{totalN}</td>
                  <td className="py-3 px-2 sm:px-3 text-right">{totalN.toFixed(2)}</td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#EA580C]">χ² = {chiSquare.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111827]">Expected Genotype Proportions (p² / 2pq / q²)</span>
              <span className="font-mono text-slate-500">N = {totalN}</span>
            </div>
            {[
              { label: 'AA (p²)', val: p * p * 100, obsPct: totalN > 0 ? (obsAA / totalN) * 100 : 0, color: '#F97316' },
              { label: 'Aa (2pq)', val: 2 * p * q * 100, obsPct: totalN > 0 ? (obsAa / totalN) * 100 : 0, color: '#0284C7' },
              { label: 'aa (q²)', val: q * q * 100, obsPct: totalN > 0 ? (obsaa / totalN) * 100 : 0, color: '#64748B' },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-700">{row.label}</span>
                  <span className="text-slate-600">
                    Obs {row.obsPct.toFixed(1)}% vs Exp <strong className="text-[#111827]">{row.val.toFixed(1)}%</strong>
                  </span>
                </div>
                <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="w-full h-2 rounded-full overflow-hidden block" aria-hidden="true">
                  <rect x="0" y="0" width="100" height="4" fill="#E2E8F0" />
                  <rect x="0" y="0" width={Math.max(0, Math.min(100, row.val))} height="4" fill={row.color} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BiologyToolShell>
  );
}

// ============================================================================
// 5. RESTRICTION ENZYME DIGEST & GEL ELECTROPHORESIS SIMULATOR
// ============================================================================
const RESTRICTION_ENZYMES = [
  { name: 'EcoRI', site: 'GAATTC', cutOffset: 1, display: 'G^AATTC' },
  { name: 'BamHI', site: 'GGATCC', cutOffset: 1, display: 'G^GATCC' },
  { name: 'HindIII', site: 'AAGCTT', cutOffset: 1, display: 'A^AGCTT' },
  { name: 'NotI', site: 'GCGGCCGC', cutOffset: 2, display: 'GC^GGCCGC' },
  { name: 'PstI', site: 'CTGCAG', cutOffset: 5, display: 'CTGCA^G' },
  { name: 'XbaI', site: 'TCTAGA', cutOffset: 1, display: 'T^CTAGA' },
];

const LADDER_BANDS = [10000, 6000, 3000, 2000, 1500, 1000, 750, 500, 250];

function generateDemoPlasmidSequence(): string {
  const filler = 'ATGCGTACGTAGCTAGCTGATCGATCGATGCTAGCTAGCGATCGAT';
  const block = (n: number) => filler.repeat(Math.ceil(n / filler.length)).slice(0, n);
  return (
    block(340) +
    'GAATTC' + // EcoRI @ 341
    block(580) +
    'GGATCC' + // BamHI @ 927
    block(720) +
    'AAGCTT' + // HindIII @ 1653
    block(410) +
    'GCGGCCGC' + // NotI @ 2069
    block(325)
  );
}

function generatePuc19ClonedInsertSequence(): string {
  const filler = 'ACGTTGCATGCAATTCCGGAATTGGCCAATTCCGGAATTGGCCA';
  const block = (n: number) => filler.repeat(Math.ceil(n / filler.length)).slice(0, n);
  return (
    block(250) +
    'GAATTC' +
    block(420) +
    'TCTAGA' +
    block(850) +
    'CTGCAG' +
    block(620) +
    'GGATCC' +
    block(540)
  );
}

export function RestrictionDigestGelSimulator() {
  const [dnaSeq, setDnaSeq] = useState<string>(() => generateDemoPlasmidSequence());
  const [topology, setTopology] = useState<'circular' | 'linear'>('circular');
  const [selectedEnzymes, setSelectedEnzymes] = useState<string[]>(['EcoRI', 'BamHI', 'HindIII']);
  const gelSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'restriction-digest-gel-simulator') return;
      if (typeof detail.dnaSeq === 'string') setDnaSeq(detail.dnaSeq);
      if (detail.topology === 'circular' || detail.topology === 'linear') setTopology(detail.topology);
      if (Array.isArray(detail.selectedEnzymes)) {
        setSelectedEnzymes(detail.selectedEnzymes.filter((x): x is string => typeof x === 'string'));
      }
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const cleanSeq = dnaSeq.toUpperCase().replace(/[^ATCG]/g, '');

  const digestResult = useMemo(() => {
    const cuts: { pos: number; enzyme: string }[] = [];
    const n = cleanSeq.length;
    if (n < 20) return { cuts: [], fragments: [] as number[] };

    RESTRICTION_ENZYMES.filter((e) => selectedEnzymes.includes(e.name)).forEach((enz) => {
      let idx = cleanSeq.indexOf(enz.site);
      while (idx !== -1) {
        cuts.push({ pos: idx + enz.cutOffset, enzyme: enz.name });
        idx = cleanSeq.indexOf(enz.site, idx + 1);
      }
    });

    cuts.sort((a, b) => a.pos - b.pos);
    const uniquePositions = Array.from(new Set(cuts.map((c) => c.pos))).sort((a, b) => a - b);

    if (uniquePositions.length === 0) {
      return { cuts, fragments: [n] };
    }

    const fragments: number[] = [];
    if (topology === 'linear') {
      let prev = 0;
      for (const pos of uniquePositions) {
        if (pos - prev > 0) fragments.push(pos - prev);
        prev = pos;
      }
      if (n - prev > 0) fragments.push(n - prev);
    } else {
      if (uniquePositions.length === 1) {
        fragments.push(n);
      } else {
        for (let i = 0; i < uniquePositions.length - 1; i++) {
          fragments.push(uniquePositions[i + 1] - uniquePositions[i]);
        }
        fragments.push(n - uniquePositions[uniquePositions.length - 1] + uniquePositions[0]);
      }
    }

    fragments.sort((a, b) => b - a);
    return { cuts, fragments };
  }, [cleanSeq, selectedEnzymes, topology]);

  const toggleEnzyme = (name: string) => {
    setSelectedEnzymes((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const bpToY = (bp: number) => {
    const clamped = Math.max(150, Math.min(12000, bp));
    const logMax = Math.log10(12000);
    const logMin = Math.log10(150);
    const ratio = (logMax - Math.log10(clamped)) / (logMax - logMin);
    return 44 + ratio * 280;
  };

  const handleReset = () => {
    setDnaSeq(generateDemoPlasmidSequence());
    setSelectedEnzymes(['EcoRI', 'BamHI', 'HindIII']);
    setTopology('circular');
  };

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `restriction-digest-${topology}-${cleanSeq.length}bp.pdf`,
      badgeText: 'BIOLOGY · RESTRICTION MAPPING & GEL REPORT',
      title: 'Restriction Enzyme Digest & Agarose Gel Report',
      subtitle: `${topology === 'circular' ? 'Circular Plasmid' : 'Linear Amplicon'} (${cleanSeq.length.toLocaleString()} bp) · Active Enzymes: ${selectedEnzymes.join(', ') || 'None'}`,
      parameters: [
        { label: 'DNA Topology & Size', value: `${topology === 'circular' ? 'Circular Plasmid' : 'Linear DNA'} (${cleanSeq.length.toLocaleString()} bp)` },
        { label: 'Selected Endonucleases', value: selectedEnzymes.join(', ') || 'None (Uncut control)' },
      ],
      kpis: [
        { label: 'Total Cut Sites', value: String(digestResult.cuts.length), sublabel: 'Recognition matches' },
        { label: 'Gel Bands Produced', value: String(digestResult.fragments.length), sublabel: topology === 'circular' ? 'k cuts = k bands' : 'k cuts = k+1 bands', accent: true },
        { label: 'Largest / Smallest Band', value: digestResult.fragments.length ? `${digestResult.fragments[0]} / ${digestResult.fragments[digestResult.fragments.length - 1]} bp` : '-', sublabel: 'Sum = ' + cleanSeq.length + ' bp' },
      ],
      svgFigure: {
        title: '1.0% Agarose Gel Electrophoresis Simulation (1kb Ladder vs Digest Lane)',
        svgElement: gelSvgRef.current,
        maxHeightMm: 78,
      },
      tables: [
        {
          title: 'Predicted Agarose Gel Fragments (Largest -> Smallest)',
          headers: ['Band #', 'Fragment Size (bp)', 'Share of Construct'],
          rows: digestResult.fragments.map((bp, idx) => [
            `Band ${idx + 1}`,
            `${bp.toLocaleString()} bp`,
            `${((bp / Math.max(1, cleanSeq.length)) * 100).toFixed(1)}%`,
          ]),
          colWidths: [25, 45, 30],
          alignRightCols: [1, 2],
          monospaceCols: [1, 2],
        },
        ...(digestResult.cuts.length > 0
          ? [
              {
                title: 'Mapped Restriction Cleavage Coordinates',
                headers: ['Enzyme', 'Recognition Motif', 'Cut Coordinate (bp)'],
                rows: digestResult.cuts.map((c) => {
                  const enz = RESTRICTION_ENZYMES.find((e) => e.name === c.enzyme);
                  return [c.enzyme, enz?.display || '-', `${c.pos.toLocaleString()} bp`];
                }),
                colWidths: [30, 35, 35],
                alignRightCols: [2],
                monospaceCols: [1, 2],
              },
            ]
          : []),
      ],
      workedExample: {
        problem: 'A 3,000 bp circular plasmid has EcoRI cut sites at 450 bp and 1,650 bp. What fragments appear on an agarose gel?',
        steps: [
          'For a circular plasmid, k cut sites produce k linear fragments (2 cuts = 2 fragments).',
          'Fragment 1 spans 450 -> 1,650 bp = 1,200 bp.',
          'Fragment 2 wraps around the origin: (3,000 - 1,650) + 450 = 1,800 bp.',
        ],
        answer: 'Two bands at 1,800 bp and 1,200 bp (total = 3,000 bp)',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="restriction-digest-gel-simulator"
      title="Restriction Digest & Gel Electrophoresis"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTopology('circular')}
            aria-pressed={topology === 'circular'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              topology === 'circular' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Circular Plasmid
          </button>
          <button
            type="button"
            onClick={() => setTopology('linear')}
            aria-pressed={topology === 'linear'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              topology === 'linear' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Linear Amplicon
          </button>
        </div>
      }
      presetsLabel="Plasmid & Digest Presets:"
      presets={[
        {
          label: '2.4 kb Vector (EcoRI+BamHI+HindIII)',
          active: topology === 'circular' && selectedEnzymes.length === 3 && cleanSeq.length === 2401,
          onClick: handleReset,
        },
        {
          label: 'Single Cut Linearization (NotI)',
          active: topology === 'circular' && selectedEnzymes.length === 1 && selectedEnzymes[0] === 'NotI',
          onClick: () => {
            setDnaSeq(generateDemoPlasmidSequence());
            setTopology('circular');
            setSelectedEnzymes(['NotI']);
          },
        },
        {
          label: 'pUC19 Cloned Insert (XbaI+PstI)',
          active: selectedEnzymes.includes('XbaI') && selectedEnzymes.includes('PstI'),
          onClick: () => {
            setDnaSeq(generatePuc19ClonedInsertSequence());
            setTopology('circular');
            setSelectedEnzymes(['EcoRI', 'XbaI', 'PstI', 'BamHI']);
          },
        },
        {
          label: 'Linear Diagnostic PCR',
          active: topology === 'linear',
          onClick: () => {
            setDnaSeq(generateDemoPlasmidSequence());
            setTopology('linear');
            setSelectedEnzymes(['EcoRI', 'HindIII']);
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Sequence & Enzyme Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#111827]">
              Select Restriction Endonucleases (6-bp &amp; 8-bp Cutters)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {RESTRICTION_ENZYMES.map((enz) => {
                const active = selectedEnzymes.includes(enz.name);
                return (
                  <button
                    key={enz.name}
                    type="button"
                    onClick={() => toggleEnzyme(enz.name)}
                    aria-pressed={active}
                    className={`p-3 min-h-[48px] rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#FFF7ED] border-[#F97316]'
                        : 'bg-[#F9FAFB] border-slate-200 hover:border-orange-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#111827]">{enz.name}</p>
                    <p className="text-[11px] font-mono text-[#EA580C]">{enz.display}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <label htmlFor="digest-dna-seq" className="font-bold text-[#111827]">
                Input DNA Sequence (5′ → 3′)
              </label>
              <span className="font-mono text-slate-600 font-semibold">{cleanSeq.length.toLocaleString()} bp</span>
            </div>
            <textarea
              id="digest-dna-seq"
              rows={4}
              value={dnaSeq}
              onChange={(e) => setDnaSeq(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs text-[#111827] focus:bg-white focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#111827]">
                Cleavage Sites ({digestResult.cuts.length})
              </h3>
              {digestResult.cuts.length === 0 ? (
                <p className="text-xs text-slate-500">Uncut DNA (0 recognition sites found).</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {digestResult.cuts.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                    >
                      <strong className="text-[#EA580C]">{c.enzyme}</strong> @ {c.pos} bp
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#111827]">
                Resulting Gel Fragments ({digestResult.fragments.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {digestResult.fragments.map((frag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 font-mono text-xs font-bold text-[#111827]"
                  >
                    {frag.toLocaleString()} bp
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Virtual Agarose Gel SVG */}
        <div className="lg:col-span-5 bg-slate-950 rounded-3xl p-4 sm:p-5 text-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-orange-400">1.0% Agarose Gel (EtBr / SYBR)</span>
            <span className="font-mono text-slate-400">Cathode (−) → Anode (+)</span>
          </div>

          <svg
            ref={gelSvgRef}
            viewBox="0 0 320 355"
            className="w-full h-auto rounded-2xl bg-slate-900 border border-slate-800"
          >
            <rect x="0" y="0" width="320" height="355" fill="#0F172A" />
            {/* Sample Wells */}
            <rect x="65" y="14" width="68" height="10" rx="2" fill="#1E293B" stroke="#475569" />
            <rect x="185" y="14" width="75" height="10" rx="2" fill="#1E293B" stroke="#475569" />
            <text x="99" y="36" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
              1kb Ladder
            </text>
            <text x="222" y="36" textAnchor="middle" fill="#FDBA74" fontSize="10" fontFamily="monospace">
              Digest Lane
            </text>

            {/* 1kb Ladder Bands */}
            {LADDER_BANDS.map((bp) => {
              const y = bpToY(bp);
              const bright = bp === 3000 || bp === 1000;
              return (
                <g key={bp}>
                  <line
                    x1="68"
                    y1={y}
                    x2="130"
                    y2={y}
                    stroke={bright ? '#38BDF8' : '#7DD3FC'}
                    strokeWidth={bright ? 3.5 : 2}
                    strokeOpacity={bright ? 0.95 : 0.65}
                  />
                  <text
                    x="58"
                    y={y + 3}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {bp >= 1000 ? `${bp / 1000}k` : bp}
                  </text>
                </g>
              );
            })}

            {/* Experimental Digest Bands */}
            {digestResult.fragments.map((bp, i) => {
              const y = bpToY(bp);
              return (
                <g key={`${bp}-${i}`}>
                  <line
                    x1="188"
                    y1={y}
                    x2="256"
                    y2={y}
                    stroke="#FB923C"
                    strokeWidth={3.5}
                  />
                  <text
                    x="263"
                    y={y + 3}
                    fill="#FED7AA"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {bp}bp
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </BiologyToolShell>
  );
}

// ============================================================================
// 6. CRISPR GUIDE RNA (gRNA) & PAM MOTIF FINDER
// ============================================================================
interface CrisprCandidate {
  id: string;
  strand: '+' | '−';
  start: number;
  end: number;
  cutSite: number;
  spacer: string;
  pam: string;
  gcPct: number;
  hasPolyT: boolean;
  rating: 'Optimal' | 'Moderate' | 'Low';
}

const SAMPLE_CRISPR_LOCUS =
  'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTC';
const CFTR_CRISPR_LOCUS =
  'ATGCAGAGGTCGCCTCTGGAAAAGGCCAGCGTTGTCTCCAAACTTTTTTTCAGCTGGACCAGACCAATTTTGAGGAAAGGATACAGACAGCGCCTGGAATTGTCAGACATATACCAAATCCCTTCTGTTGATTCTGCTGACAATCTATCTGAAAAATTGGAAAGAGAATGGGATAGAGAGCTGGCTTCAAAGAAAAATCCTAAACTCATTAATGCCCTTCGGCGATGTTTTTTCTGGAGATTTATGTTCTATGGAATCTTTTTATATTTAGGGGAAGTCACCAAAGCAGTACAGCCTCTCTTACTGGGAAGAATCATAGCTTCCTATGACCCGGATAACAAGGAGGAACGCTCTATCGCGATTTATCTAGGCATAGGCTTATGCCTTCTCTTTATTGTGAGGACACTGCTCCTACACCCAGCCATTTTTGGCCTTCATCACATTGGAATGCAGATGAGAATAGCTATGTTTAGTTTGATTTATAAGAAGACTTTAAAGCTGTCAAGCCGTGTTCTAGATAAAATAAGTATTGGACAACTTGTTAGTCTCCTTTCCAACAACCTGAACAAATTTGATGAAGGACTTGCATTGGCACATTTCGTGTGGATCGCTCCTTTGCAAGTGGCACTCCTCATGGGGCTAATCTGGGAGTTGTTACAGGCGTCTGCCTTCTGTGGACTTGGTTTCCTGATAGTCCTTGCCCTTTTTCAGGCTGGGCTAGGGAGAATGATGATGAAGTACAGAGATCAGAGAGCTGGGAAGATCAGTGAAAGACTTGTGATTACCTCAGAAATGATTGAAAATATCCAATCTGTTAAGGCATACTGCTGGGAAGAAGCAATGGAAAAAATGATTGAAAACTTAAGACAAACAGAACTGAAACTGACTCGGAAGGCAGCCTATGTGAGATACTTCAATAGCTCAGCCTTCTTCTTCTCAGGGTTCTTTGTGGTGTTTTTATCTGTGCTTCCCTATGCACTAATCAAAGGAATCATCCTCCGGAAAATATTCACCACCATCTCATTCTGCATTGTTCTGCGCATGGCGGTCACTCGGCAATTTCCCTGGGCTGTACAAACATGGTATGACTCTCTTGGAGCAATAAACAAAATACAGGATTTCTTACAAAAGCAAGAATATAAGACATTGGAATATAACTTAACGACTACAGAAGTAGTGATGGAGAATGTAACAGCCTTCTGGGAGGAGGGATTTGGGGAATTATTTGAGAAAGCAAAACAAAACAATAACAATAGAAAAACTTCTAATGGTGATGACAGCCTCTTCTTCAGTAATTTCTCACTTCTTGGTACTCCTGTCCTGAAAGATATTAATTTCAAGATAGAAAGAGGACAGTTGTTGGCGGTTGCTGGATCCACTGGAGCAGGCAAGACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTAAAATTAAGCACAGTGGAAGAATTTCATTCTGTTCTCAGTTTTCCTGGATTATGCCTGGCACCATTAAAGAAAATATCATCTTTGGTGTTTCCTATGATGAATATAGATACAGAAGCGTCATCAAAGCATGCCAACTAGAAGAGGACATCTCCAAGTTTGCAGAGAAAGACAATATAGTTCTTGGAGAAGGTGGAATCACACTGAGTGGAGGTCAACGAGCAAGAATTTCTTTAGCAAGAGCAGTATACAAAGATGCTGATTTGTATTTATTAGACTCTCCTTTTGGATACCTAGATGTTTTAACAGAAAAAGAAATATTTGAAAGCTGTGTCTGTAAACTGATGGCTAACAAAACTAGGATTTTGGTCACTTCTAAAATGGAACATTTAAAGAAAGCTGACAAAATATTAATTTTGCATGAAGGTAGCAGCTATTTTTATGGGACATTTTCAGAACTCCAAAATCTACAGCCAGACTTTAGCTCAAAACTCATGGGATGTGATTCTTTCGACCAATTTAGTGCAGAAAGAAGAAATTCAATCCTAACTGAGACCTTACACCGTTTCTCATTAGAAGGAGATGCTCCTGTCTCCTGGACAGAAACAAAAAAACAATCTTTTAAACAGACTGGAGAGTTTGGGGAAAAAAGGAAGAATTCTATTCTCAATCCAATCAACTCTATACGAAAATTTTCCATTGTGCAAAAGACTCCCTTACAAATGAATGGCATCGAAGAGGATTCTGATGAGCCTTTAGAGAGAAGGCTGTCCTTAGTACCAGATTCTGAGCAGGGAGAGGCGATACTGCCTCGCATCAGCGTGATCAGCACTGGCCCCACGCTTCAGGCACGAAGGAGGCAGTCTGTCCTGAACCTGATGACACACTCAGTTAACCAAGGTCAGAACATTCACCGAAAGACAACAGCATCCACACGAAAAGTGTCACTGGCCCCTCAGGCAAACTTGACTGAACTGGATATATATTCAAGAAGGTTATCTCAAGAAACTGGCTTGGAAATAAGTGAAGAAATTAACGAAGAAGACTTAAAGGAGTGCTTTTTTGATGATATGGAGAGCATACCAGCAGTGACTACATGGAACACATACCTTCGATATATTACTGTCCACAAGAGCTTAATTTTTGTGCTAATTTGGTGCTTAGTAATTTTTCTGGCAGAGGTGGCTGCTTCTTTGGTTGTGCTGTGGCTCCTTGGAAACACTCCTCTTCAAGACAAAGGGAATAGTACTCATAGTAGAAATAACAGCTATGCAGTGATTATCACCAGCACCAGTTCGTATTATGTGTTTTACATTTACGTGGGAGTAGCCGACACTTTGCTTGCTATGGGATTCTTCAGAGGTCTACCACTGGTGCATACTCTAATCACAGTGTCGAAAATTTTACACCACAAAATGTTACATTCTGTTCTTCAAGCACCTATGTCAACCCTCAACACGTTGAAAGCAGGTGGGATTCTTAATAGATTCTCCAAAGATATAGCAATTTTGGATGACCTTCTGCCTCTTACCATATTTGACTTCATCCAGTTGTTATTAATTGTGATTGGAGCTATAGCAGTTGTCGCAGTTTTACAACCCTACATCTTTGTTGCAACAGTGCCAGTGATAGTGGCTTTTATTATGTTGAGAGCATATTTCCTCCAAACCTCACAGCAACTCAAACAACTGGAATCTGAAGGCAGGAGTCCAATTTTCACTCATCTTGTTACAAGCTTAAAAGGACTATGGACACTTCGTGCCTTCGGACGGCAGCCTTACTTTGAAACTCTGTTCCACAAAGCTCTGAATTTACATACTGCCAACTGGTTCTTGTACCTGTCAACACTGCGCTGGTTCCAAATGAGAATAGAAATGATTTTTGTCATCTTCTTCATTGCTGTTACCTTCATTTCCATTTTAACAACAGGAGAAGGAGAAGGAAGAGTTGGTATTATCCTGACTTTAGCCATGAATATCATGAGTACATTGCAGTGGGCTGTAAACTCCAGCATAGATGTGGATAGCTTGATGCGATCTGTGAGCCGAGTCTTTAAGTTCATTGACATGCCAACAGAAGGTAAACCTACCAAGTCAACCAAACCATACAAGAATGGCCAACTCTCGAAAGTTATGATTATTGAGAATTCACACGTGAAGAAAGATGACATCTGGCCCTCAGGGGGCCAAATGACTGTCAAAGATCTCACAGCAAAATACACAGAAGGTGGAAATGCCATATTAGAGAACATTTCCTTCTCAATAAGTCCTGGCCAGAGGGTGGGCCTCTTGGGAAGAACTGGATCAGGGAAGAGTACTTTGTTATCAGCTTTTTTGAGACTACTGAACACTGAAGGAGAAATCCAGATCGATGGTGTGTCTTGGGATTCAATAACTTTGCAACAGTGGAGGAAAGCCTTTGGAGTGATACCACAGAAAGTATTTATTTTTTCTGGAACATTTAGAAAAAACTTGGATCCCTATGAACAGTGGAGTGATCAAGAAATATGGAAAGTTGCAGATGAGGTTGGGCTCAGATCTGTGATAGAACAGTTTCCTGGGAAGCTTGACTTTGTCCTTGTGGATGGGGGCTGTGTCCTAAGCCATGGCCACAAGCAGTTGATGTGCTTGGCTAGATCTGTTCTCAGTAAGGCGAAGATCTTGCTGCTTGATGAACCCAGTGCTCATTTGGATCCAGTAACATACCAAATAATTAGAAGAACTCTAAAACAAGCATTTGCTGATTGCACAGTAATTCTCTGTGAACACAGGATAGAAGCAATGCTGGAATGCCAACAATTTTTGGTCATAGAAGAGAACAAAGTGCGGCAGTACGATTCCATCCAGAAACTGCTGAACGAGAGGAGCCTCTTCCGGCAAGCCATCAGCCCCTCCGACAGGGTGAAGCTCTTTCCCCACCGGAACTCAAGCAAGTGCAAGTCTAAGCCCCAGATTGCTGCTCTGAAAGAGGAGACAGAAGAAGAGGTGCAAGATACAAGGCTTTAG';

function revComp(seq: string): string {
  const m: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
  return seq
    .split('')
    .reverse()
    .map((b) => m[b] || 'N')
    .join('');
}

export function CrisprGrnaFinder() {
  const [targetSeq, setTargetSeq] = useState(SAMPLE_CRISPR_LOCUS);
  const [strandFilter, setStrandFilter] = useState<'all' | '+' | '−'>('all');
  const [optimalOnly, setOptimalOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'crispr-grna-finder') return;
      if (typeof detail.targetSeq === 'string') setTargetSeq(detail.targetSeq);
      if (detail.strandFilter === 'all' || detail.strandFilter === '+' || detail.strandFilter === '−') {
        setStrandFilter(detail.strandFilter);
      }
      if (typeof detail.optimalOnly === 'boolean') setOptimalOnly(detail.optimalOnly);
      setSelectedId(null);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const clean = targetSeq.toUpperCase().replace(/[^ATCG]/g, '');

  const candidates = useMemo<CrisprCandidate[]>(() => {
    const list: CrisprCandidate[] = [];
    if (clean.length < 23) return list;

    // Scan Forward (+): 20nt + NGG
    for (let i = 0; i <= clean.length - 23; i++) {
      const window23 = clean.slice(i, i + 23);
      if (window23[21] === 'G' && window23[22] === 'G') {
        const spacer = window23.slice(0, 20);
        const pam = window23.slice(20, 23);
        const gc = ((spacer.match(/[GC]/g) || []).length / 20) * 100;
        const hasPolyT = spacer.includes('TTTT');
        const rating: CrisprCandidate['rating'] =
          !hasPolyT && gc >= 40 && gc <= 60
            ? 'Optimal'
            : !hasPolyT && gc >= 30 && gc <= 70
            ? 'Moderate'
            : 'Low';

        list.push({
          id: `fwd-${i}`,
          strand: '+',
          start: i + 1,
          end: i + 20,
          cutSite: i + 17,
          spacer,
          pam,
          gcPct: gc,
          hasPolyT,
          rating,
        });
      }
    }

    // Scan Reverse (-): CCN + 20nt on top strand
    for (let i = 0; i <= clean.length - 23; i++) {
      const window23 = clean.slice(i, i + 23);
      if (window23[0] === 'C' && window23[1] === 'C') {
        const rc = revComp(window23);
        const spacer = rc.slice(0, 20);
        const pam = rc.slice(20, 23);
        const gc = ((spacer.match(/[GC]/g) || []).length / 20) * 100;
        const hasPolyT = spacer.includes('TTTT');
        const rating: CrisprCandidate['rating'] =
          !hasPolyT && gc >= 40 && gc <= 60
            ? 'Optimal'
            : !hasPolyT && gc >= 30 && gc <= 70
            ? 'Moderate'
            : 'Low';

        list.push({
          id: `rev-${i}`,
          strand: '−',
          start: i + 4,
          end: i + 23,
          cutSite: i + 6,
          spacer,
          pam,
          gcPct: gc,
          hasPolyT,
          rating,
        });
      }
    }

    return list.sort((a, b) => {
      const score = { Optimal: 3, Moderate: 2, Low: 1 };
      return score[b.rating] - score[a.rating] || a.start - b.start;
    });
  }, [clean]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (strandFilter !== 'all' && c.strand !== strandFilter) return false;
      if (optimalOnly && c.rating !== 'Optimal') return false;
      return true;
    });
  }, [candidates, strandFilter, optimalOnly]);

  const activeCandidate =
    filtered.find((c) => c.id === selectedId) || filtered[0] || null;

  const optimalCount = candidates.filter((c) => c.rating === 'Optimal').length;

  const handleReset = () => {
    setTargetSeq(SAMPLE_CRISPR_LOCUS);
    setStrandFilter('all');
    setOptimalOnly(false);
    setSelectedId(null);
  };

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `crispr-grna-scan-${clean.length}bp.pdf`,
      badgeText: 'BIOLOGY · CRISPR-CAS9 DESIGN REPORT',
      title: 'CRISPR Guide RNA (gRNA) & NGG PAM Design Report',
      subtitle: `SpCas9 5'-N20-NGG-3' bidirectional scan on ${clean.length} bp target locus`,
      parameters: [
        { label: 'Target Locus Length', value: `${clean.length} bp` },
        { label: 'Total Guides / Optimal', value: `${candidates.length} total · ${optimalCount} Optimal (40-60% GC, no TTTT)` },
      ],
      kpis: [
        { label: 'Candidate PAM Sites', value: String(candidates.length), sublabel: 'Both (+) & (-) strands' },
        { label: 'Optimal Pol III Guides', value: String(optimalCount), sublabel: '40%-60% GC, no poly-T', accent: true },
        { label: 'Top Guide Cut Site', value: activeCandidate ? `nt ${activeCandidate.cutSite}` : '-', sublabel: activeCandidate ? `${activeCandidate.strand} strand · PAM ${activeCandidate.pam}` : 'No hits' },
      ],
      ...(activeCandidate
        ? {
            callout: {
              title: `Featured Top Guide (${activeCandidate.strand} Strand · ${activeCandidate.rating})`,
              body: `5'-[${activeCandidate.spacer.slice(0, 17)} | DSB | ${activeCandidate.spacer.slice(17)}]-${activeCandidate.pam}-3' · GC: ${activeCandidate.gcPct.toFixed(0)}% · Double-strand break occurs 3 bp upstream of PAM (coordinate ${activeCandidate.cutSite}). Do NOT include ${activeCandidate.pam} in synthetic sgRNA oligo.`,
              tone: activeCandidate.rating === 'Optimal' ? 'emerald' : 'amber',
            },
          }
        : {}),
      tables: [
        {
          title: 'Top Ranked SpCas9 20-nt Guide RNAs (Up to 25)',
          headers: ['Coords (Cut)', 'Strand', "20-nt Spacer (5'->3')", 'PAM', 'GC%', 'Efficiency'],
          rows: filtered.slice(0, 25).map((c) => [
            `${c.start}-${c.end} (${c.cutSite})`,
            c.strand === '+' ? '+' : '-',
            c.spacer,
            c.pam,
            `${c.gcPct.toFixed(0)}%`,
            `${c.rating}${c.hasPolyT ? ' (TTTT)' : ''}`,
          ]),
          colWidths: [18, 8, 38, 10, 10, 16],
          alignRightCols: [4],
          monospaceCols: [0, 2, 3, 4],
        },
      ],
      workedExample: {
        problem: "Identify a forward-strand SpCas9 target in 5'-GCATGCTAGCTAGCTGATCGAGGCT-3'.",
        steps: [
          'Locate the 3-nt PAM motif 5\'-NGG-3\' near the 3\' end: positions 21-23 read "AGG".',
          "Extract the 20 nucleotides immediately 5' upstream of AGG: 5'-GCATGCTAGCTAGCTGATCG-3'.",
          'Compute GC% = 11/20 = 55% (Optimal 40-60% window); Cas9 cleaves 3 bp upstream of PAM (nt 17|18).',
        ],
        answer: "Guide: 5'-GCATGCTAGCTAGCTGATCG-3' · PAM: AGG · GC: 55% (Optimal)",
      },
    });
  };

  return (
    <BiologyToolShell
      slug="crispr-grna-finder"
      title="CRISPR Guide RNA (gRNA) & PAM Finder"
      subtitle="Scans both DNA strands for SpCas9 5′-N₂₀-NGG-3′ protospacers, cut sites, and Pol III TTTT stop signals."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      presetsLabel="Target Exon Presets:"
      presets={[
        {
          label: 'EGFP Exon 1 (216 bp)',
          active: clean === SAMPLE_CRISPR_LOCUS,
          onClick: handleReset,
        },
        {
          label: 'CFTR Exon 11 Window',
          active: clean.startsWith('ATGCAGAGGTCGCCTCTG'),
          onClick: () => {
            setTargetSeq(CFTR_CRISPR_LOCUS.slice(0, 320));
            setSelectedId(null);
          },
        },
        {
          label: 'Worked Example (25 bp)',
          active: clean === 'GCATGCTAGCTAGCTGATCGAGGCT',
          onClick: () => {
            setTargetSeq('GCATGCTAGCTAGCTGATCGAGGCT');
            setSelectedId(null);
          },
        },
      ]}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
          <label htmlFor="crispr-locus-input" className="font-bold text-[#111827]">
            Genomic Target Locus (5′ → 3′):
          </label>
          <span className="font-mono text-slate-600 font-semibold">
            {clean.length} bp · {candidates.length} total guides ({optimalCount} Optimal)
          </span>
        </div>
        <textarea
          id="crispr-locus-input"
          rows={3}
          value={targetSeq}
          onChange={(e) => setTargetSeq(e.target.value)}
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs text-[#111827] focus:bg-white focus:border-[#F97316] focus:outline-none"
        />
      </div>

      {/* Filter & Cleavage Visualizer */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          {(['all', '+', '−'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrandFilter(s)}
              aria-pressed={strandFilter === s}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold cursor-pointer ${
                strandFilter === s ? 'bg-[#111827] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'all' ? 'All Strands' : `${s} Strand`}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-200 text-xs font-semibold text-[#111827] cursor-pointer">
          <input
            type="checkbox"
            checked={optimalOnly}
            onChange={(e) => setOptimalOnly(e.target.checked)}
            className="w-4 h-4 accent-[#F97316]"
          />
          <span>Optimal Only (40–60% GC)</span>
        </label>
      </div>

      {activeCandidate && (
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 space-y-2.5 tabular-nums">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#EA580C]">
              Selected Guide Cleavage Map ({activeCandidate.strand} Strand · {activeCandidate.rating})
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(activeCandidate.spacer);
                setCopiedId(activeCandidate.id);
                setTimeout(() => setCopiedId(null), 1800);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-white border border-orange-200 text-xs font-semibold text-[#EA580C] cursor-pointer"
            >
              {copiedId === activeCandidate.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === activeCandidate.id ? 'Copied 20-nt Oligo' : 'Copy 20-nt Spacer'}</span>
            </button>
          </div>
          <div className="bg-white border border-orange-100 rounded-xl p-3 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
            <span className="text-slate-400">5′-</span>
            <span className="font-bold text-[#111827]">{activeCandidate.spacer.slice(0, 17)}</span>
            <span className="mx-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
              ✂ DSB @ nt {activeCandidate.cutSite}
            </span>
            <span className="font-bold text-[#111827]">{activeCandidate.spacer.slice(17)}</span>
            <span className="text-slate-400">-</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FFF7ED] border border-orange-300 font-bold text-[#EA580C]">
              {activeCandidate.pam}
            </span>
            <span className="text-slate-400">-3′</span>
          </div>
          <p className="text-xs text-slate-600">
            Synthesize only the 20-nt protospacer (<strong className="font-mono text-[#111827]">{activeCandidate.spacer}</strong>) without the <strong className="font-mono text-[#EA580C]">{activeCandidate.pam}</strong> PAM.
          </p>
        </div>
      )}

      {/* Mobile Stacked Cards (<640px) */}
      <div className="sm:hidden space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filtered.slice(0, 20).map((c) => {
          const isSel = activeCandidate?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-colors cursor-pointer space-y-1.5 ${
                isSel ? 'bg-[#FFF7ED] border-[#F97316]' : 'bg-[#F9FAFB] border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600">
                  {c.strand} · {c.start}–{c.end} (cut {c.cutSite})
                </span>
                <span
                  className={`font-bold ${
                    c.rating === 'Optimal'
                      ? 'text-emerald-700'
                      : c.rating === 'Moderate'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {c.rating}{c.hasPolyT ? ' (TTTT)' : ''}
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-[#111827] break-all">
                {c.spacer} <span className="text-[#EA580C]">[{c.pam}]</span>
              </p>
              <p className="text-[11px] font-mono text-slate-500">GC: {c.gcPct.toFixed(0)}%</p>
            </button>
          );
        })}
      </div>

      {/* Desktop / Tablet Sticky Table */}
      <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl max-h-[380px]">
        <table className="w-full text-left text-xs tabular-nums">
          <thead className="bg-[#F9FAFB] border-b border-slate-200 text-slate-600 sticky top-0">
            <tr>
              <th className="py-3 px-4 font-bold">Coords</th>
              <th className="py-3 px-2 font-bold">Strand</th>
              <th className="py-3 px-4 font-bold">20-nt Protospacer Guide (5′→3′)</th>
              <th className="py-3 px-3 font-bold">PAM</th>
              <th className="py-3 px-3 font-bold text-right">GC%</th>
              <th className="py-3 px-4 font-bold text-right">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.slice(0, 30).map((c) => {
              const isSel = activeCandidate?.id === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`cursor-pointer transition-colors ${
                    isSel ? 'bg-[#FFF7ED]' : 'hover:bg-orange-50/40'
                  }`}
                >
                  <td className="py-2.5 px-4 text-slate-600">
                    {c.start}–{c.end} (cut {c.cutSite})
                  </td>
                  <td className="py-2.5 px-2 font-bold text-[#111827]">{c.strand}</td>
                  <td className="py-2.5 px-4 font-bold text-[#111827]">{c.spacer}</td>
                  <td className="py-2.5 px-3 text-[#EA580C] font-bold">{c.pam}</td>
                  <td className="py-2.5 px-3 text-right">{c.gcPct.toFixed(0)}%</td>
                  <td className="py-2.5 px-4 text-right font-sans font-semibold">
                    <span
                      className={
                        c.rating === 'Optimal'
                          ? 'text-emerald-700'
                          : c.rating === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }
                    >
                      {c.rating}
                      {c.hasPolyT ? ' (TTTT)' : ''}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </BiologyToolShell>
  );
}
