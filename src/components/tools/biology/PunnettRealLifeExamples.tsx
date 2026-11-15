import React, { useState, useEffect, useMemo } from 'react';
import { ZoomIn, Play, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface PunnettPresetLoadDetail {
  mode: 'mono' | 'di';
  p1: string;
  p2: string;
  monoDom?: string;
  monoRec?: string;
  diDomA?: string;
  diRecA?: string;
  diDomB?: string;
  diRecB?: string;
  label: string;
}

interface ReferenceChartModalData {
  id: string;
  title: string;
  imagePath: string;
  imageAlt: string;
  aspectClass: string;
  posClass: string;
}

const REFERENCE_CHARTS: Record<string, ReferenceChartModalData> = {
  dihybrid: {
    id: 'dihybrid',
    title: 'Dihybrid Cross: AaBb × AaBb (16-Offspring Pea Reference Chart)',
    imagePath: '/assets/aistudio/Screenshot_20261114_212852_5e19c714.jpg',
    imageAlt:
      'Dihybrid Cross AaBb x AaBb 16-square Punnett analysis showing 9:3:3:1 phenotype ratio and genotype frequencies',
    aspectClass: 'aspect-[9/10]',
    posClass: 'object-cover object-[50%_19%]',
  },
  blood: {
    id: 'blood',
    title: 'Blood Type Punnett Square Practice & ABO Antigen Reference Sheet',
    imagePath: '/assets/aistudio/Screenshot_20261114_213333_8c8c5fbc.jpg',
    imageAlt:
      'Blood Type Punnett Square Practice chart detailing Group A, Group B, Group AB, and Group O antigens and agglutination',
    aspectClass: 'aspect-[7/9]',
    posClass: 'object-cover object-[50%_23%]',
  },
  eyeColor: {
    id: 'eyeColor',
    title: 'Baby Eye Color Predictor Reference Chart',
    imagePath: '/assets/aistudio/Screenshot_20261114_213020_5c02af76.jpg',
    imageAlt:
      'Baby Eye Color Predictor Chart showing parent and child probabilities for brown, green, and blue eyes',
    aspectClass: 'aspect-[5/6]',
    posClass: 'object-cover object-[50%_21%]',
  },
};

const DIHYBRID_GAMETES = ['AB', 'Ab', 'aB', 'ab'] as const;

function sortPair(a1: string, a2: string): string {
  if (a1 === a2) return a1 + a2;
  return a1 === a1.toUpperCase() ? a1 + a2 : a2 + a1;
}

const BLOOD_COMPATIBILITY_ROWS = [
  {
    type: 'A (40%)',
    accentText: 'text-[#EA580C]',
    antigen: 'A antigen',
    antibody: 'Anti-B antibodies',
    receiveFrom: 'A, O',
    donateTo: 'A, AB',
    striped: false,
  },
  {
    type: 'B (10%)',
    accentText: 'text-emerald-700',
    antigen: 'B antigen',
    antibody: 'Anti-A antibodies',
    receiveFrom: 'B, O',
    donateTo: 'B, AB',
    striped: true,
  },
  {
    type: 'AB (4%)',
    accentText: 'text-amber-700',
    antigen: 'A antigen, B antigen',
    antibody: 'No antibodies',
    receiveFrom: 'A, B, AB, O',
    donateTo: 'AB',
    striped: false,
  },
  {
    type: 'O (46%)',
    accentText: 'text-[#111827]',
    antigen: 'No antigen',
    antibody: 'Both Anti-A and Anti-B',
    receiveFrom: 'O',
    donateTo: 'O, A, B, AB',
    striped: true,
  },
] as const;

type EyeTone = 'brown' | 'green' | 'blue';

interface EyePredictorRow {
  p1: EyeTone;
  p2: EyeTone;
  pairLabel: string;
  brownPct: string;
  greenPct: string;
  bluePct: string;
  highlightBlue?: boolean;
}

const EYE_COLOR_ROWS: EyePredictorRow[] = [
  { p1: 'brown', p2: 'brown', pairLabel: 'Brown + Brown', brownPct: '75%', greenPct: '18.75%', bluePct: '6.25%' },
  { p1: 'green', p2: 'brown', pairLabel: 'Green + Brown', brownPct: '50%', greenPct: '37.5%', bluePct: '12.5%' },
  { p1: 'blue', p2: 'brown', pairLabel: 'Blue + Brown', brownPct: '50%', greenPct: '0%', bluePct: '50%' },
  { p1: 'green', p2: 'green', pairLabel: 'Green + Green', brownPct: '<1%', greenPct: '75%', bluePct: '25%' },
  { p1: 'green', p2: 'blue', pairLabel: 'Green + Blue', brownPct: '0%', greenPct: '50%', bluePct: '50%' },
  { p1: 'blue', p2: 'blue', pairLabel: 'Blue + Blue', brownPct: '0%', greenPct: '1%', bluePct: '99%', highlightBlue: true },
];

function EyeIrisDot({ tone, size = 'md' }: { tone: EyeTone; size?: 'sm' | 'md' }) {
  const outerClass = size === 'sm' ? 'w-6 h-6 sm:w-7 sm:h-7 border-2' : 'w-6 h-6 sm:w-8 sm:h-8 border-[3px]';
  const pupilClass = size === 'sm' ? 'w-2 h-2 sm:w-2.5 sm:h-2.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3';
  const toneClasses =
    tone === 'brown'
      ? 'bg-amber-900 border-amber-700'
      : tone === 'green'
      ? 'bg-emerald-600 border-emerald-500'
      : 'bg-sky-500 border-sky-400';

  return (
    <span
      aria-label={`${tone} eye`}
      className={`${outerClass} ${toneClasses} rounded-full inline-flex items-center justify-center shadow-xs shrink-0`}
    >
      <span className={`${pupilClass} rounded-full bg-slate-950`} />
    </span>
  );
}

function PeaSeedVisual({ isRound, isYellow }: { isRound: boolean; isYellow: boolean }) {
  if (isRound && isYellow) {
    return (
      <span
        aria-hidden="true"
        className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border border-amber-600 shadow-2xs"
      />
    );
  }
  if (isRound && !isYellow) {
    return (
      <span
        aria-hidden="true"
        className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-lime-400 to-green-600 border border-green-700 shadow-2xs"
      />
    );
  }
  if (!isRound && isYellow) {
    return (
      <span
        aria-hidden="true"
        className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 border-2 border-dashed border-amber-700 shadow-2xs"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-2 border-dashed border-green-800 shadow-2xs"
    />
  );
}

interface PunnettRealLifeExamplesProps {
  onNavigate?: (view: string) => void;
}

export default function PunnettRealLifeExamples({ onNavigate }: PunnettRealLifeExamplesProps) {
  const [zoomedChart, setZoomedChart] = useState<ReferenceChartModalData | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomedChart || typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedChart(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedChart]);

  const dihybridRows = useMemo(() => {
    return DIHYBRID_GAMETES.map((rowG) => ({
      rowG,
      cells: DIHYBRID_GAMETES.map((colG) => {
        const t1 = sortPair(colG[0], rowG[0]);
        const t2 = sortPair(colG[1], rowG[1]);
        const geno = t1 + t2;
        const isRound = t1.includes('A');
        const isYellow = t2.includes('B');

        let label = 'Wrinkled, Green';
        let cellBg = 'bg-[#FFF7ED]/70';
        if (isRound && isYellow) {
          label = 'Round, Yellow';
          cellBg = 'bg-amber-50/60';
        } else if (isRound && !isYellow) {
          label = 'Round, Green';
          cellBg = 'bg-white';
        } else if (!isRound && isYellow) {
          label = 'Wrinkled, Yellow';
          cellBg = 'bg-orange-50/50';
        }

        return { colG, geno, isRound, isYellow, label, cellBg };
      }),
    }));
  }, []);

  const triggerPresetLoad = (key: string, preset: PunnettPresetLoadDetail) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ut-punnett-load-preset', { detail: preset }));
    setLoadedKey(key);
    window.setTimeout(() => setLoadedKey(null), 2200);
    const calcEl = document.getElementById('punnett-workspace-root');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="real-life-examples"
      aria-labelledby="punnett-real-life-examples-heading"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-10 sm:space-y-12"
    >
      {/* Editorial Section Intro */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-[#EA580C]">Visual Biology Study Guides</span>
            <span aria-hidden="true">·</span>
            <span>university-tutors.com</span>
            <span aria-hidden="true">·</span>
            <span>Mendelian &amp; Human Genetics</span>
          </div>
          <h2
            id="punnett-real-life-examples-heading"
            className="text-2xl sm:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
          >
            Real-Life Punnett Square Examples &amp; Charts
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Master Mendelian and human inheritance with high-resolution visual genetics diagrams,
            genotype breakdowns, and phenotype ratio tables curated by{' '}
            <strong className="text-[#EA580C]">university-tutors.com</strong>.
          </p>

          {/* Mobile-Friendly Quick Jump Navigation */}
          <nav
            aria-label="Jump to Punnett Square examples"
            className="flex flex-wrap items-center gap-2 pt-2"
          >
            <a
              href="#dihybrid-guide"
              className="px-3 py-2 min-h-[40px] inline-flex items-center rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors"
            >
              1. Dihybrid Cross (9:3:3:1)
            </a>
            <a
              href="#blood-type-guide"
              className="px-3 py-2 min-h-[40px] inline-flex items-center rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors"
            >
              2. ABO Blood Types
            </a>
            <a
              href="#eye-color-guide"
              className="px-3 py-2 min-h-[40px] inline-flex items-center rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] transition-colors"
            >
              3. Baby Eye Color Chart
            </a>
          </nav>
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('get-a-quote')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Book a 1-on-1 Genetics Tutor</span>
            <ArrowRight className="w-4 h-4 text-[#F97316]" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EXAMPLE 1: DIHYBRID CROSS AaBb x AaBb (9:3:3:1 PEA PLANT) */}
      {/* ========================================================= */}
      <article
        id="dihybrid-guide"
        className="bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Mendelian Two-Trait Inheritance · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-3xl font-display font-bold tracking-tight">
              Dihybrid Cross: AaBb × AaBb (9:3:3:1 Ratio)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                triggerPresetLoad('dihybrid', {
                  mode: 'di',
                  p1: 'AaBb',
                  p2: 'AaBb',
                  diDomA: 'Round Seed',
                  diRecA: 'Wrinkled Seed',
                  diDomB: 'Yellow Cotyledon',
                  diRecB: 'Green Cotyledon',
                  label: 'Dihybrid Pea Cross (AaBb × AaBb)',
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-white text-[#EA580C] hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {loadedKey === 'dihybrid' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Loaded in Calculator</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 shrink-0" />
                  <span>Simulate AaBb × AaBb</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setZoomedChart(REFERENCE_CHARTS.dihybrid)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span>View Chart Image</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-7 bg-white">
          {/* SEO Rich Explanation + Key Exam Takeaways */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-2.5 text-slate-600">
              <h4 className="text-lg font-bold text-[#111827]">
                How Mendel&apos;s Law of Independent Assortment Works
              </h4>
              <p className="text-sm leading-relaxed">
                A <strong>dihybrid cross</strong> tracks the inheritance of two independent traits
                simultaneously—such as pea seed shape (
                <strong>
                  Round <code className="text-[#EA580C] font-mono font-bold">A</code>
                </strong>{' '}
                vs.{' '}
                <strong>
                  Wrinkled <code className="text-slate-700 font-mono font-bold">a</code>
                </strong>
                ) and seed color (
                <strong>
                  Yellow <code className="text-amber-600 font-mono font-bold">B</code>
                </strong>{' '}
                vs.{' '}
                <strong>
                  Green <code className="text-emerald-700 font-mono font-bold">b</code>
                </strong>
                ). When two heterozygous parents (
                <code className="font-mono font-bold text-[#111827]">AaBb × AaBb</code>) are
                crossed, each parent produces four distinct gamete combinations (
                <code className="font-mono">AB, Ab, aB, ab</code>), yielding{' '}
                <strong>16 possible offspring genotypes</strong> and the classic{' '}
                <strong>9:3:3:1 phenotypic ratio</strong>.
              </p>
            </div>

            <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-orange-200 text-xs space-y-2 tabular-nums">
              <div className="font-bold text-orange-950">Key Exam Takeaways</div>
              <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                <li>
                  <strong>9/16 (56.25%):</strong> Round, Yellow (
                  <code className="font-mono text-[#C2410C] font-semibold">A_B_</code>)
                </li>
                <li>
                  <strong>3/16 (18.75%):</strong> Round, Green (
                  <code className="font-mono text-[#C2410C] font-semibold">A_bb</code>)
                </li>
                <li>
                  <strong>3/16 (18.75%):</strong> Wrinkled, Yellow (
                  <code className="font-mono text-[#C2410C] font-semibold">aaB_</code>)
                </li>
                <li>
                  <strong>1/16 (6.25%):</strong> Wrinkled, Green (
                  <code className="font-mono text-[#C2410C] font-semibold">aabb</code>)
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Pea Infographic Diagram */}
          <div className="bg-[#FFF7ED]/50 rounded-2xl border border-orange-200 p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-center sm:text-left border-b border-orange-200/70 pb-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#EA580C]">
                  university-tutors.com Visual Reference Diagram
                </p>
                <h4 className="text-lg sm:text-2xl font-display font-bold text-[#111827] tracking-tight">
                  Dihybrid Cross: AaBb × AaBb (16 Offspring Pea Grid)
                </h4>
              </div>
              <img
                src="/logo_transparent-440.webp"
                alt="University-Tutors.com"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="h-6 w-auto mx-auto sm:mx-0 object-contain"
              />
            </div>

            {/* Top Parents & Traits Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Parent 1 */}
              <div className="md:col-span-3 bg-white rounded-xl border border-orange-200 overflow-hidden text-center flex flex-col">
                <div className="bg-[#EA580C] text-white text-xs font-bold py-1.5">Parent 1</div>
                <div className="p-3 flex-1 flex flex-col justify-center">
                  <div className="font-mono font-bold text-lg text-[#111827]">AaBb</div>
                  <div className="flex justify-center gap-4 my-2">
                    <div className="text-center">
                      <PeaSeedVisual isRound={true} isYellow={true} />
                      <span className="block text-[11px] font-semibold text-slate-600 mt-1">
                        Round (A)
                      </span>
                    </div>
                    <div className="text-center">
                      <PeaSeedVisual isRound={true} isYellow={true} />
                      <span className="block text-[11px] font-semibold text-slate-600 mt-1">
                        Yellow (B)
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">Heterozygous for both traits</div>
                </div>
              </div>

              {/* Traits Legend */}
              <div className="md:col-span-6 bg-white rounded-xl border border-orange-200 p-4 flex flex-col justify-center">
                <div className="text-center text-xs font-bold text-[#C2410C] border-b border-orange-100 pb-2 mb-3">
                  Trait Allele Key
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#EA580C]">A</span> = Round (Dominant)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500">a</span> = Wrinkled (Recessive)
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600">B</span> = Yellow (Dominant)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600">b</span> = Green (Recessive)
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent 2 */}
              <div className="md:col-span-3 bg-white rounded-xl border border-orange-200 overflow-hidden text-center flex flex-col">
                <div className="bg-[#EA580C] text-white text-xs font-bold py-1.5">Parent 2</div>
                <div className="p-3 flex-1 flex flex-col justify-center">
                  <div className="font-mono font-bold text-lg text-[#111827]">AaBb</div>
                  <div className="flex justify-center gap-4 my-2">
                    <div className="text-center">
                      <PeaSeedVisual isRound={true} isYellow={true} />
                      <span className="block text-[11px] font-semibold text-slate-600 mt-1">
                        Round (A)
                      </span>
                    </div>
                    <div className="text-center">
                      <PeaSeedVisual isRound={true} isYellow={true} />
                      <span className="block text-[11px] font-semibold text-slate-600 mt-1">
                        Yellow (B)
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">Heterozygous for both traits</div>
                </div>
              </div>
            </div>

            {/* Center 4x4 Pea Matrix + Responsive Sidebars */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
              {/* Left Sidebar (Stacks 2-up on mobile/tablet) */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                  <div className="bg-[#EA580C] text-white text-xs font-bold px-3 py-1.5">
                    How It Works
                  </div>
                  <div className="p-3 space-y-2 text-xs text-slate-600 leading-snug">
                    <p>
                      <strong className="text-[#EA580C]">1.</strong> Each parent forms 4 gametes (
                      <code className="font-mono">AB, Ab, aB, ab</code>).
                    </p>
                    <p>
                      <strong className="text-[#EA580C]">2.</strong> Gametes combine randomly at
                      fertilization.
                    </p>
                    <p>
                      <strong className="text-[#EA580C]">3.</strong> The grid displays all 16
                      possible outcomes.
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                  <div className="bg-[#F97316] text-white text-xs font-bold px-3 py-1.5">
                    Key Concept
                  </div>
                  <div className="p-3 text-xs text-slate-600 leading-snug">
                    Genes for different traits assort independently (
                    <strong>Law of Independent Assortment</strong>).
                  </div>
                </div>
              </div>

              {/* Center 4x4 Punnett Pea Grid */}
              <div className="xl:col-span-8 space-y-1.5">
                <p className="text-[11px] font-medium text-slate-500 sm:hidden">
                  Swipe grid horizontally to view all 4 gamete columns →
                </p>
                <div className="overflow-x-auto no-scrollbar rounded-xl border border-orange-200 bg-white">
                  <table className="w-full min-w-[460px] sm:min-w-full border-collapse text-center">
                    <thead>
                      <tr className="bg-[#FFF7ED]">
                        <th className="p-2 border border-orange-200 text-xs font-bold text-[#9A3412]">
                          P1 \ P2
                        </th>
                        <th className="p-2 border border-orange-200">
                          <span className="inline-flex w-8 h-8 rounded-full border-2 border-[#F97316] items-center justify-center font-mono font-bold text-xs text-[#C2410C] bg-white">
                            AB
                          </span>
                        </th>
                        <th className="p-2 border border-orange-200">
                          <span className="inline-flex w-8 h-8 rounded-full border-2 border-emerald-500 items-center justify-center font-mono font-bold text-xs text-emerald-700 bg-white">
                            Ab
                          </span>
                        </th>
                        <th className="p-2 border border-orange-200">
                          <span className="inline-flex w-8 h-8 rounded-full border-2 border-amber-500 items-center justify-center font-mono font-bold text-xs text-amber-700 bg-white">
                            aB
                          </span>
                        </th>
                        <th className="p-2 border border-orange-200">
                          <span className="inline-flex w-8 h-8 rounded-full border-2 border-[#EA580C] items-center justify-center font-mono font-bold text-xs text-[#EA580C] bg-white">
                            ab
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {dihybridRows.map((r) => (
                        <tr key={r.rowG}>
                          <th className="p-2 border border-orange-200 bg-[#FFF7ED] font-mono font-bold text-[#9A3412]">
                            {r.rowG}
                          </th>
                          {r.cells.map((cell) => (
                            <td
                              key={`${r.rowG}-${cell.colG}`}
                              className={`p-2 border border-orange-200 ${cell.cellBg}`}
                            >
                              <div className="font-mono font-bold text-[#111827] text-xs">
                                {cell.geno}
                              </div>
                              <div className="my-1 flex justify-center">
                                <PeaSeedVisual isRound={cell.isRound} isYellow={cell.isYellow} />
                              </div>
                              <div className="text-[10px] font-medium text-slate-600 leading-tight">
                                {cell.label}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Sidebar (Stacks 2-up on mobile/tablet) */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                  <div className="bg-[#EA580C] text-white text-xs font-bold px-3 py-1.5">
                    Phenotypes
                  </div>
                  <div className="p-3 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <PeaSeedVisual isRound={true} isYellow={true} />
                      <div>
                        <strong className="block text-[#111827]">Round, Yellow</strong>
                        <span className="text-slate-500">(Dominant)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PeaSeedVisual isRound={true} isYellow={false} />
                      <div>
                        <strong className="block text-[#111827]">Round, Green</strong>
                        <span className="text-slate-500">(Recessive b)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PeaSeedVisual isRound={false} isYellow={true} />
                      <div>
                        <strong className="block text-[#111827]">Wrinkled, Yellow</strong>
                        <span className="text-slate-500">(Recessive a)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PeaSeedVisual isRound={false} isYellow={false} />
                      <div>
                        <strong className="block text-[#111827]">Wrinkled, Green</strong>
                        <span className="text-slate-500">(Double Rec.)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                  <div className="bg-[#F97316] text-white text-xs font-bold px-3 py-1.5">
                    Genotype Key
                  </div>
                  <div className="p-3 font-mono text-[11px] space-y-1 text-slate-700">
                    <div>
                      <strong>AA, Aa</strong> = Round
                    </div>
                    <div>
                      <strong>aa</strong> = Wrinkled
                    </div>
                    <div>
                      <strong>BB, Bb</strong> = Yellow
                    </div>
                    <div>
                      <strong>bb</strong> = Green
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Ratio Cards (Responsive 2-col on mobile, 4-col on sm+) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 tabular-nums">
              <div className="md:col-span-6 bg-white rounded-xl border border-orange-200 overflow-hidden flex flex-col justify-between">
                <div className="bg-[#EA580C] text-white text-center text-xs font-bold py-1.5">
                  Phenotype Ratio
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center items-center">
                  <div className="p-2 rounded-lg bg-[#F9FAFB] sm:bg-transparent">
                    <PeaSeedVisual isRound={true} isYellow={true} />
                    <div className="text-xs font-semibold text-slate-700 mt-1">Round, Yellow</div>
                    <div className="text-xl font-bold text-[#111827]">9</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F9FAFB] sm:bg-transparent">
                    <PeaSeedVisual isRound={true} isYellow={false} />
                    <div className="text-xs font-semibold text-slate-700 mt-1">Round, Green</div>
                    <div className="text-xl font-bold text-[#111827]">3</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F9FAFB] sm:bg-transparent">
                    <PeaSeedVisual isRound={false} isYellow={true} />
                    <div className="text-xs font-semibold text-slate-700 mt-1">Wrinkled, Yellow</div>
                    <div className="text-xl font-bold text-[#111827]">3</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F9FAFB] sm:bg-transparent">
                    <PeaSeedVisual isRound={false} isYellow={false} />
                    <div className="text-xs font-semibold text-slate-700 mt-1">Wrinkled, Green</div>
                    <div className="text-xl font-bold text-[#111827]">1</div>
                  </div>
                </div>
                <div className="bg-[#C2410C] text-white text-center text-sm font-bold py-1.5 tracking-wide">
                  Ratio = 9 : 3 : 3 : 1
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-xl border border-orange-200 overflow-hidden">
                <div className="bg-[#F97316] text-white text-center text-xs font-bold py-1.5">
                  Genotype Ratio (Out of 16)
                </div>
                <div className="p-3 font-mono text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span>AABB: 1</span>
                    <span className="text-slate-500">6.25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AABb: 2</span>
                    <span className="text-slate-500">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AaBB: 2</span>
                    <span className="text-slate-500">12.5%</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#EA580C]">
                    <span>AaBb: 4</span>
                    <span>25.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AAbb: 1 · Aabb: 2</span>
                    <span className="text-slate-500">18.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>aaBB: 1 · aaBb: 2</span>
                    <span className="text-slate-500">18.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>aabb: 1</span>
                    <span className="text-slate-500">6.25%</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white rounded-xl border border-orange-200 p-4 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-bold text-[#EA580C]">Total Offspring</div>
                <div className="text-4xl font-bold text-[#C2410C] my-1">16</div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Four different phenotypes in a 9:3:3:1 ratio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ========================================================= */}
      {/* EXAMPLE 2: BLOOD TYPE PUNNETT SQUARE & ANTIGENS CHART     --> */}
      <article
        id="blood-type-guide"
        className="bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 2 · Multiple Alleles &amp; Co-Dominance · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-3xl font-display font-bold tracking-tight">
              Blood Type Punnett Square Practice &amp; Antigens
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                triggerPresetLoad('blood', {
                  mode: 'mono',
                  p1: 'Aa',
                  p2: 'Aa',
                  monoDom: 'Antigen-Carrying Allele (Iᴬ / Iᴮ)',
                  monoRec: 'Recessive Group O (ii)',
                  label: 'Blood Type Carrier Model (Aa × Aa)',
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-white text-[#EA580C] hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {loadedKey === 'blood' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Loaded in Calculator</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 shrink-0" />
                  <span>Simulate Carrier Cross</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setZoomedChart(REFERENCE_CHARTS.blood)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span>View Chart Image</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6 bg-white">
          <div className="bg-[#FFF7ED]/50 rounded-2xl border border-orange-200 p-4 sm:p-6 space-y-6">
            <div className="max-w-4xl space-y-3">
              <h4 className="text-lg sm:text-xl font-display font-bold text-[#111827]">
                Human ABO Blood Group Genetics (Iᴬ, Iᴮ, i)
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                There are four major human blood groups determined by the presence or absence of
                two antigens (proteins)—<strong>A and B</strong>—on the surface of red blood cells:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 pt-1">
                <li className="p-3 bg-white rounded-xl border border-orange-200">
                  <strong className="text-[#C2410C]">Group A:</strong> Has only the{' '}
                  <strong>A antigen</strong> on red cells (and B antibody in the plasma).
                </li>
                <li className="p-3 bg-white rounded-xl border border-orange-200">
                  <strong className="text-[#C2410C]">Group B:</strong> Has only the{' '}
                  <strong>B antigen</strong> on red cells (and A antibody in the plasma).
                </li>
                <li className="p-3 bg-white rounded-xl border border-orange-200">
                  <strong className="text-[#C2410C]">Group AB:</strong> Has{' '}
                  <strong>both A and B antigens</strong> on red cells (neither A nor B antibody in
                  plasma).
                </li>
                <li className="p-3 bg-white rounded-xl border border-orange-200">
                  <strong className="text-[#C2410C]">Group O:</strong> Has{' '}
                  <strong>neither A nor B antigens</strong> on red cells (both A and B antibodies in
                  plasma).
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                Since foreign antigens can trigger a patient&apos;s immune system to attack
                transfused blood with antibodies, safe transfusions depend on blood typing and
                cross-matching. Three alleles control ABO type:{' '}
                <code className="font-mono font-bold text-[#C2410C]">Iᴬ, Iᴮ, i</code> (
                <strong>I</strong> stands for <em>immunoglobulin</em>).{' '}
                <code className="font-mono font-bold">Iᴬ</code> and{' '}
                <code className="font-mono font-bold">Iᴮ</code> are{' '}
                <strong>Co-Dominant genes</strong> (both express fully together), while{' '}
                <code className="font-mono font-bold">i</code> is recessive.
              </p>
            </div>

            {/* Genotypes + 4 RBC Surface Antigens + Agglutination */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-4 bg-white rounded-xl border border-orange-200 overflow-hidden flex flex-col">
                <div className="bg-[#EA580C] text-white text-xs font-bold px-4 py-2">
                  Possible Genotypes
                </div>
                <table className="w-full text-xs sm:text-sm text-left flex-1">
                  <thead className="bg-[#FFF7ED] border-b border-orange-200 text-orange-950">
                    <tr>
                      <th className="px-4 py-2.5">Genotypes</th>
                      <th className="px-4 py-2.5">Blood Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 font-mono">
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#111827]">IᴬIᴬ or Iᴬi</td>
                      <td className="px-4 py-3 font-sans font-bold text-[#C2410C]">A</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#111827]">IᴮIᴮ or Iᴮi</td>
                      <td className="px-4 py-3 font-sans font-bold text-emerald-700">B</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#111827]">IᴬIᴮ</td>
                      <td className="px-4 py-3 font-sans font-bold text-amber-700">AB</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#111827]">ii</td>
                      <td className="px-4 py-3 font-sans font-bold text-slate-700">O</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4 RBC Antigens SVG */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-orange-200 p-4">
                <div className="text-center text-xs font-bold text-[#C2410C] mb-3">
                  Red Blood Cell Surface Antigens
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-[#FFF7ED]/60 border border-orange-100">
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" viewBox="0 0 80 80" aria-hidden="true">
                      <circle cx="40" cy="40" r="22" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                      <circle cx="40" cy="40" r="12" fill="#dc2626" opacity="0.6" />
                      <polygon points="40,8 35,18 45,18" fill="#ea580c" />
                      <polygon points="40,72 35,62 45,62" fill="#ea580c" />
                      <polygon points="8,40 18,35 18,45" fill="#ea580c" />
                      <polygon points="72,40 62,35 62,45" fill="#ea580c" />
                    </svg>
                    <div className="text-xs font-bold text-[#111827] mt-1">Blood Type A</div>
                    <div className="text-[11px] text-[#EA580C] font-semibold">A antigen</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF7ED]/60 border border-orange-100">
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" viewBox="0 0 80 80" aria-hidden="true">
                      <circle cx="40" cy="40" r="22" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                      <circle cx="40" cy="40" r="12" fill="#dc2626" opacity="0.6" />
                      <circle cx="40" cy="13" r="5" fill="#10b981" />
                      <circle cx="40" cy="67" r="5" fill="#10b981" />
                      <circle cx="13" cy="40" r="5" fill="#10b981" />
                      <circle cx="67" cy="40" r="5" fill="#10b981" />
                    </svg>
                    <div className="text-xs font-bold text-[#111827] mt-1">Blood Type B</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">B antigen</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF7ED]/60 border border-orange-100">
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" viewBox="0 0 80 80" aria-hidden="true">
                      <circle cx="40" cy="40" r="22" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                      <circle cx="40" cy="40" r="12" fill="#dc2626" opacity="0.6" />
                      <polygon points="40,8 35,18 45,18" fill="#ea580c" />
                      <polygon points="40,72 35,62 45,62" fill="#ea580c" />
                      <circle cx="13" cy="40" r="5" fill="#10b981" />
                      <circle cx="67" cy="40" r="5" fill="#10b981" />
                    </svg>
                    <div className="text-xs font-bold text-[#111827] mt-1">Blood Type AB</div>
                    <div className="text-[11px] text-amber-700 font-semibold">AB antigens</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF7ED]/60 border border-orange-100">
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" viewBox="0 0 80 80" aria-hidden="true">
                      <circle cx="40" cy="40" r="22" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                      <circle cx="40" cy="40" r="12" fill="#dc2626" opacity="0.6" />
                    </svg>
                    <div className="text-xs font-bold text-[#111827] mt-1">Blood Type O</div>
                    <div className="text-[11px] text-slate-500 font-semibold">No antigens</div>
                  </div>
                </div>
              </div>

              {/* Agglutination SVG */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-orange-200 p-4 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-bold text-[#C2410C] mb-2">Agglutination</div>
                <svg className="w-28 h-28 sm:w-32 sm:h-32 mx-auto" viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="35" cy="35" r="14" fill="#86efac" stroke="#166534" strokeWidth="2" />
                  <circle cx="85" cy="35" r="14" fill="#86efac" stroke="#166534" strokeWidth="2" />
                  <circle cx="60" cy="80" r="14" fill="#86efac" stroke="#166534" strokeWidth="2" />
                  <path d="M49 35 L60 35 L71 35 M60 35 L60 22" stroke="#ea580c" strokeWidth="2.5" fill="none" />
                  <path d="M43 47 L52 66 M77 47 L68 66" stroke="#ea580c" strokeWidth="2.5" fill="none" />
                </svg>
                <p className="text-xs text-slate-600 mt-2 leading-snug">
                  Plasma <strong>antibodies</strong> bind to foreign RBC <strong>antigens</strong>,
                  causing clumping (agglutination).
                </p>
              </div>
            </div>

            {/* Mobile-Friendly Compatibility Cards (< md) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden tabular-nums">
              {BLOOD_COMPATIBILITY_ROWS.map((row) => (
                <div
                  key={row.type}
                  className="bg-white rounded-xl border border-orange-200 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-orange-100 pb-1.5">
                    <span className={`font-bold text-sm ${row.accentText}`}>
                      Blood Type {row.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{row.antigen}</span>
                  </div>
                  <div className="text-slate-600">
                    <strong className="text-[#111827]">Plasma Antibody:</strong> {row.antibody}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-[#F9FAFB] rounded-lg p-2">
                      <span className="block text-[10px] text-slate-500 font-semibold">
                        Can Receive From
                      </span>
                      <span className="font-mono font-bold text-[#111827]">{row.receiveFrom}</span>
                    </div>
                    <div className="bg-[#FFF7ED] rounded-lg p-2">
                      <span className="block text-[10px] text-[#C2410C] font-semibold">
                        Can Donate To
                      </span>
                      <span className="font-mono font-bold text-[#EA580C]">{row.donateTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Compatibility Table (md+) */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-orange-200 tabular-nums">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-[#EA580C] text-white">
                  <tr>
                    <th className="p-3 border-r border-orange-400">Blood Type</th>
                    <th className="p-3 border-r border-orange-400">Antigen (RBC Membrane)</th>
                    <th className="p-3 border-r border-orange-400">Antibody (Plasma)</th>
                    <th className="p-3 border-r border-orange-400">Can Receive Blood From</th>
                    <th className="p-3">Can Donate Blood To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {BLOOD_COMPATIBILITY_ROWS.map((row) => (
                    <tr key={row.type} className={row.striped ? 'bg-[#FFF7ED]/40' : 'bg-white'}>
                      <td className={`p-3 font-bold border-r border-orange-100 ${row.accentText}`}>
                        {row.type}
                      </td>
                      <td className="p-3 font-semibold border-r border-orange-100">{row.antigen}</td>
                      <td className="p-3 text-slate-600 border-r border-orange-100">
                        {row.antibody}
                      </td>
                      <td className="p-3 font-bold text-[#111827] border-r border-orange-100">
                        {row.receiveFrom}
                      </td>
                      <td className="p-3 font-bold text-[#111827]">{row.donateTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </article>

      {/* ========================================================= */}
      {/* EXAMPLE 3: BABY EYE COLOR PREDICTOR CHART                 */}
      {/* ========================================================= */}
      <article
        id="eye-color-guide"
        className="bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 3 · Polygenic Human Inheritance (OCA2 &amp; HERC2 Genes) · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-3xl font-display font-bold tracking-tight">
              Baby Eye Color Predictor Chart &amp; Probability Guide
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                triggerPresetLoad('eyeColor', {
                  mode: 'di',
                  p1: 'AaBb',
                  p2: 'AaBb',
                  diDomA: 'Brown Pigment (HERC2+)',
                  diRecA: 'No Brown Pigment',
                  diDomB: 'Green / Hazel Modifier',
                  diRecB: 'Blue Base',
                  label: 'Eye Color Carriers (AaBb × AaBb)',
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-white text-[#EA580C] hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {loadedKey === 'eyeColor' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Loaded in Calculator</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 shrink-0" />
                  <span>Simulate Eye Color Cross</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setZoomedChart(REFERENCE_CHARTS.eyeColor)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span>View Chart Image</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-white">
          {/* Left Explanation */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-lg sm:text-xl font-display font-bold text-[#111827]">
              How Parental Eye Colors Predict a Baby&apos;s Eye Color
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Human eye color is controlled primarily by melanin production regulated by the{' '}
              <strong>OCA2</strong> and <strong>HERC2</strong> genes on chromosome 15. While
              simplified classroom Punnett squares model{' '}
              <strong>
                Brown (<code className="font-mono font-bold text-[#C2410C]">B</code>)
              </strong>{' '}
              as dominant over{' '}
              <strong>
                Green (<code className="font-mono font-bold text-[#C2410C]">G</code>)
              </strong>{' '}
              and{' '}
              <strong>
                Blue (<code className="font-mono font-bold text-[#C2410C]">b</code>)
              </strong>
              , polygenic inheritance allows two brown-eyed heterozygous carrier parents (
              <code className="font-mono font-bold text-[#C2410C]">AaBb × AaBb</code>) to have a{' '}
              <strong>25% combined chance</strong> of a blue-eyed (6.25%) or green-eyed (18.75%)
              baby.
            </p>
            <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-1.5 text-xs sm:text-sm text-slate-800">
              <div className="font-bold text-[#9A3412]">
                Why Two Blue-Eyed Parents Have 99% Blue-Eyed Babies:
              </div>
              <p className="text-slate-700 leading-relaxed">
                Blue eyes result from low melanin concentration (homozygous recessive alleles).
                Without dominant brown-melanin alleles from either parent, there is ~99% probability
                the child inherits blue eyes and ~1% chance of green.
              </p>
            </div>
          </div>

          {/* Right Responsive Baby Eye Color Predictor Chart */}
          <div className="lg:col-span-7 bg-[#FFF7ED]/70 rounded-2xl border border-orange-200 p-4 sm:p-6">
            <div className="text-center mb-5">
              <h4 className="text-xl sm:text-2xl font-display font-bold text-[#111827]">
                Baby Eye Color Predictor Chart
              </h4>
              <p className="text-xs font-semibold text-[#EA580C] mt-1">
                university-tutors.com Genetics Reference · Probability Distribution
              </p>
            </div>

            <div className="grid grid-cols-12 items-end text-center text-[11px] sm:text-xs font-bold text-[#9A3412] pb-2.5 border-b border-orange-200">
              <div className="col-span-5">Parents&apos; Eyes</div>
              <div className="col-span-1" aria-hidden="true" />
              <div className="col-span-6 grid grid-cols-3 gap-1">
                <span>Brown</span>
                <span>Green</span>
                <span>Blue</span>
              </div>
            </div>

            <div className="divide-y divide-orange-200/70 text-[11px] sm:text-xs font-bold text-[#111827] bg-white rounded-xl px-2.5 sm:px-3.5 mt-2 border border-orange-100 tabular-nums">
              {EYE_COLOR_ROWS.map((row) => (
                <div key={row.pairLabel} className="grid grid-cols-12 items-center py-3 gap-1">
                  <div className="col-span-5 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <EyeIrisDot tone={row.p1} />
                      <span className="text-[#F97316] font-bold">+</span>
                      <EyeIrisDot tone={row.p2} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 text-center">
                      {row.pairLabel}
                    </span>
                  </div>

                  <div className="col-span-1 text-center text-[#F97316] font-bold">=</div>

                  <div className="col-span-6 grid grid-cols-3 gap-1 text-center">
                    <div
                      className={`flex flex-col items-center ${
                        row.brownPct === '0%' || row.brownPct === '<1%' ? 'opacity-45' : ''
                      }`}
                    >
                      <EyeIrisDot tone="brown" size="sm" />
                      <span className="mt-1 font-mono">{row.brownPct}</span>
                    </div>
                    <div
                      className={`flex flex-col items-center ${
                        row.greenPct === '0%' ? 'opacity-45' : ''
                      }`}
                    >
                      <EyeIrisDot tone="green" size="sm" />
                      <span className="mt-1 font-mono">{row.greenPct}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <EyeIrisDot tone="blue" size="sm" />
                      <span
                        className={`mt-1 font-mono ${
                          row.highlightBlue ? 'text-[#EA580C] font-bold' : ''
                        }`}
                      >
                        {row.bluePct}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Lightbox Modal for Original Uploaded Reference Chart Image */}
      {zoomedChart && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomedChart.title}
          className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setZoomedChart(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#EA580C]">
                  University-Tutors.com · Reference Study Chart
                </p>
                <h4 className="text-sm sm:text-base font-bold text-[#111827] truncate">
                  {zoomedChart.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setZoomedChart(null)}
                aria-label="Close enlarged reference chart"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-[#F97316] text-slate-700 hover:text-[#EA580C] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 bg-[#F8FAFC] flex items-center justify-center">
              <div
                className={`w-full max-w-lg ${zoomedChart.aspectClass} overflow-hidden rounded-xl border border-slate-200 bg-white`}
              >
                <img
                  src={zoomedChart.imagePath}
                  alt={zoomedChart.imageAlt}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full ${zoomedChart.posClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
