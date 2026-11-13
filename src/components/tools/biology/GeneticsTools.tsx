import React, { useState, useMemo } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';

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

export function PunnettSquareCalculator() {
  const [mode, setMode] = useState<'mono' | 'di'>('mono');
  // Monohybrid state
  const [monoP1, setMonoP1] = useState('Aa');
  const [monoP2, setMonoP2] = useState('Aa');
  const [traitADom, setTraitADom] = useState('Purple Flowers (Dominant)');
  const [traitARec, setTraitARec] = useState('White Flowers (Recessive)');

  // Dihybrid state
  const [diP1, setDiP1] = useState('AaBb');
  const [diP2, setDiP2] = useState('AaBb');
  const [diDomA, setDiDomA] = useState('Round Seed (A_)');
  const [diRecA, setDiRecA] = useState('Wrinkled Seed (aa)');
  const [diDomB, setDiDomB] = useState('Yellow Cotyledon (B_)');
  const [diRecB, setDiRecB] = useState('Green Cotyledon (bb)');

  const loadExample = () => {
    if (mode === 'mono') {
      setMonoP1('Aa');
      setMonoP2('Aa');
      setTraitADom('Purple Flowers (A_)');
      setTraitARec('White Flowers (aa)');
    } else {
      setDiP1('AaBb');
      setDiP2('AaBb');
      setDiDomA('Round Seed (A_)');
      setDiRecA('Wrinkled Seed (aa)');
      setDiDomB('Yellow Cotyledon (B_)');
      setDiRecB('Green Cotyledon (bb)');
    }
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

      return {
        rowGametes: g1,
        colGametes: g2,
        grid,
        totalCells: 4,
        genoCounts,
        phenotypes: [
          { label: traitADom, count: domCount, pct: (domCount / 4) * 100, tone: 'dom' },
          { label: traitARec, count: recCount, pct: (recCount / 4) * 100, tone: 'rec' },
        ],
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

    return {
      rowGametes,
      colGametes,
      grid,
      totalCells: 16,
      genoCounts,
      phenotypes: [
        { label: `${diDomA} + ${diDomB}`, count: domDom, pct: (domDom / 16) * 100, tone: 'dom' },
        { label: `${diDomA} + ${diRecB}`, count: domRec, pct: (domRec / 16) * 100, tone: 'mix1' },
        { label: `${diRecA} + ${diDomB}`, count: recDom, pct: (recDom / 16) * 100, tone: 'mix2' },
        { label: `${diRecA} + ${diRecB}`, count: recRec, pct: (recRec / 16) * 100, tone: 'rec' },
      ],
    };
  }, [mode, monoP1, monoP2, traitADom, traitARec, diP1, diP2, diDomA, diRecA, diDomB, diRecB]);

  const cellColorClass = (geno: string) => {
    if (mode === 'mono') {
      if (geno === 'AA') return 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]';
      if (geno === 'Aa') return 'bg-amber-50/70 border-amber-200 text-[#111827]';
      return 'bg-slate-100 border-slate-300 text-slate-700';
    }
    const hasA = geno.slice(0, 2).includes('A');
    const hasB = geno.slice(2, 4).includes('B');
    if (hasA && hasB) return 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]';
    if (hasA && !hasB) return 'bg-sky-50 border-sky-200 text-sky-900';
    if (!hasA && hasB) return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    return 'bg-slate-100 border-slate-300 text-slate-700';
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('mono')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'mono'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700 hover:border-orange-300'
            }`}
          >
            Monohybrid Cross (2×2)
          </button>
          <button
            type="button"
            onClick={() => setMode('di')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'di'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700 hover:border-orange-300'
            }`}
          >
            Dihybrid Cross (4×4)
          </button>
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] hover:bg-orange-100/70 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example ({mode === 'mono' ? 'Aa × Aa' : 'AaBb × AaBb'})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Parental Controls */}
        <div className="lg:col-span-5 space-y-4">
          {mode === 'mono' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent 1 Genotype
                  </label>
                  <select
                    value={monoP1}
                    onChange={(e) => setMonoP1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
                  >
                    <option value="AA">AA (Homozygous Dom)</option>
                    <option value="Aa">Aa (Heterozygous)</option>
                    <option value="aa">aa (Homozygous Rec)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent 2 Genotype
                  </label>
                  <select
                    value={monoP2}
                    onChange={(e) => setMonoP2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
                  >
                    <option value="AA">AA (Homozygous Dom)</option>
                    <option value="Aa">Aa (Heterozygous)</option>
                    <option value="aa">aa (Homozygous Rec)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Dominant Phenotype (A_)
                  </label>
                  <input
                    type="text"
                    value={traitADom}
                    onChange={(e) => setTraitADom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Recessive Phenotype (aa)
                  </label>
                  <input
                    type="text"
                    value={traitARec}
                    onChange={(e) => setTraitARec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#111827]"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent 1 (Gene A &amp; B)
                  </label>
                  <select
                    value={diP1}
                    onChange={(e) => setDiP1(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
                  >
                    {['AABB', 'AABb', 'AAbb', 'AaBB', 'AaBb', 'Aabb', 'aaBB', 'aaBb', 'aabb'].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent 2 (Gene A &amp; B)
                  </label>
                  <select
                    value={diP2}
                    onChange={(e) => setDiP2(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
                  >
                    {['AABB', 'AABb', 'AAbb', 'AaBB', 'AaBb', 'Aabb', 'aaBB', 'aaBb', 'aabb'].map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDiP1('AaBb');
                    setDiP2('aabb');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#F9FAFB] border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Test Cross (AaBb × aabb → 1:1:1:1)
                </button>
              </div>
            </>
          )}

          {/* Phenotype Percentages Breakdown */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3 tabular-nums">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Offspring Phenotype Distribution
            </h3>
            {crossData.phenotypes.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{p.label}</span>
                  <span className="font-mono font-bold text-[#111827]">
                    {p.count}/{crossData.totalCells} ({p.pct.toFixed(2)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: `${p.pct}%` }}
                    className="h-full bg-[#F97316] transition-all duration-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual Punnett Square & Genotype Ratios */}
        <div className="lg:col-span-7 space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-2 text-center">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-mono text-slate-400">P1 \ P2</th>
                  {crossData.colGametes.map((cg, idx) => (
                    <th
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 text-white font-mono text-sm font-bold"
                    >
                      {cg}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crossData.grid.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <th className="p-2.5 rounded-xl bg-slate-900 text-white font-mono text-sm font-bold">
                      {crossData.rowGametes[rIdx]}
                    </th>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-3 sm:p-4 rounded-xl border font-mono text-sm sm:text-base font-bold ${cellColorClass(
                          cell
                        )}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2 tabular-nums">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Exact Genotype Ratios ({Object.keys(crossData.genoCounts).length} Unique Genotypes)
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(crossData.genoCounts) as [string, number][]).map(([geno, count]) => (
                <div
                  key={geno}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                >
                  <strong className="text-[#EA580C]">{geno}</strong>:{' '}
                  <span className="font-semibold text-[#111827]">
                    {count}/{crossData.totalCells} ({((count / crossData.totalCells) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. DNA → RNA → PROTEIN SEQUENCE TRANSLATOR
// ============================================================================
const CODON_TABLE: Record<string, { aa3: string; aa1: string }> = {
  UUU: { aa3: 'Phe', aa1: 'F' }, UUC: { aa3: 'Phe', aa1: 'F' }, UUA: { aa3: 'Leu', aa1: 'L' }, UUG: { aa3: 'Leu', aa1: 'L' },
  CUU: { aa3: 'Leu', aa1: 'L' }, CUC: { aa3: 'Leu', aa1: 'L' }, CUA: { aa3: 'Leu', aa1: 'L' }, CUG: { aa3: 'Leu', aa1: 'L' },
  AUU: { aa3: 'Ile', aa1: 'I' }, AUC: { aa3: 'Ile', aa1: 'I' }, AUA: { aa3: 'Ile', aa1: 'I' }, AUG: { aa3: 'Met', aa1: 'M' },
  GUU: { aa3: 'Val', aa1: 'V' }, GUC: { aa3: 'Val', aa1: 'V' }, GUA: { aa3: 'Val', aa1: 'V' }, GUG: { aa3: 'Val', aa1: 'V' },
  UCU: { aa3: 'Ser', aa1: 'S' }, UCC: { aa3: 'Ser', aa1: 'S' }, UCA: { aa3: 'Ser', aa1: 'S' }, UCG: { aa3: 'Ser', aa1: 'S' },
  CCU: { aa3: 'Pro', aa1: 'P' }, CCC: { aa3: 'Pro', aa1: 'P' }, CCA: { aa3: 'Pro', aa1: 'P' }, CCG: { aa3: 'Pro', aa1: 'P' },
  ACU: { aa3: 'Thr', aa1: 'T' }, ACC: { aa3: 'Thr', aa1: 'T' }, ACA: { aa3: 'Thr', aa1: 'T' }, ACG: { aa3: 'Thr', aa1: 'T' },
  GCU: { aa3: 'Ala', aa1: 'A' }, GCC: { aa3: 'Ala', aa1: 'A' }, GCA: { aa3: 'Ala', aa1: 'A' }, GCG: { aa3: 'Ala', aa1: 'A' },
  UAU: { aa3: 'Tyr', aa1: 'Y' }, UAC: { aa3: 'Tyr', aa1: 'Y' }, UAA: { aa3: 'Stop', aa1: '*' }, UAG: { aa3: 'Stop', aa1: '*' },
  CAU: { aa3: 'His', aa1: 'H' }, CAC: { aa3: 'His', aa1: 'H' }, CAA: { aa3: 'Gln', aa1: 'Q' }, CAG: { aa3: 'Gln', aa1: 'Q' },
  AAU: { aa3: 'Asn', aa1: 'N' }, AAC: { aa3: 'Asn', aa1: 'N' }, AAA: { aa3: 'Lys', aa1: 'K' }, AAG: { aa3: 'Lys', aa1: 'K' },
  GAU: { aa3: 'Asp', aa1: 'D' }, GAC: { aa3: 'Asp', aa1: 'D' }, GAA: { aa3: 'Glu', aa1: 'E' }, GAG: { aa3: 'Glu', aa1: 'E' },
  UGU: { aa3: 'Cys', aa1: 'C' }, UGC: { aa3: 'Cys', aa1: 'C' }, UGA: { aa3: 'Stop', aa1: '*' }, UGG: { aa3: 'Trp', aa1: 'W' },
  CGU: { aa3: 'Arg', aa1: 'R' }, CGC: { aa3: 'Arg', aa1: 'R' }, CGA: { aa3: 'Arg', aa1: 'R' }, CGG: { aa3: 'Arg', aa1: 'R' },
  AGU: { aa3: 'Ser', aa1: 'S' }, AGC: { aa3: 'Ser', aa1: 'S' }, AGA: { aa3: 'Arg', aa1: 'R' }, AGG: { aa3: 'Arg', aa1: 'R' },
  GGU: { aa3: 'Gly', aa1: 'G' }, GGC: { aa3: 'Gly', aa1: 'G' }, GGA: { aa3: 'Gly', aa1: 'G' }, GGG: { aa3: 'Gly', aa1: 'G' },
};

const BRCA1_SAMPLE = 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCIIA'.replace(/[^ATCG]/g, '');
const INSULIN_SAMPLE = 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGAA';

export function DnaRnaProteinTranslator() {
  const [dnaInput, setDnaInput] = useState(INSULIN_SAMPLE);
  const [strandType, setStrandType] = useState<'coding' | 'template'>('coding');
  const [copied, setCopied] = useState(false);

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

  const translated = codons.map((codon) => CODON_TABLE[codon] || { aa3: 'Xaa', aa1: 'X' });
  const gcCount = (cleanDna.match(/[GC]/g) || []).length;
  const gcPct = cleanDna.length > 0 ? (gcCount / cleanDna.length) * 100 : 0;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Sample Presets & Strand Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStrandType('coding')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              strandType === 'coding'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700'
            }`}
          >
            5′→3′ Coding (Sense) Strand
          </button>
          <button
            type="button"
            onClick={() => setStrandType('template')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              strandType === 'template'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700'
            }`}
          >
            3′→5′ Template (Antisense) Strand
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDnaInput(INSULIN_SAMPLE)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Example (Human INS)</span>
          </button>
          <button
            type="button"
            onClick={() => setDnaInput(BRCA1_SAMPLE + 'TGA')}
            className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            BRCA1 Exon 1 (N-term)
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs tabular-nums">
          <label htmlFor="dna-seq-input" className="font-bold text-[#111827]">
            Input DNA Sequence ({strandType === 'coding' ? '5′ → 3′' : '3′ → 5′'}):
          </label>
          <span className="text-slate-500 font-mono">
            {cleanDna.length} bp · {codons.length} codons · GC: {gcPct.toFixed(1)}%
          </span>
        </div>
        <textarea
          id="dna-seq-input"
          rows={3}
          value={dnaInput}
          onChange={(e) => setDnaInput(e.target.value)}
          placeholder="Paste DNA bases A, T, C, G..."
          className="w-full p-4 rounded-2xl bg-[#F9FAFB] border border-slate-300 focus:bg-white focus:border-[#F97316] focus:outline-none font-mono text-sm tracking-wider text-[#111827]"
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
          <span className="text-xs font-bold text-slate-500">
            Complementary DNA ({strandType === 'coding' ? '3′ → 5′' : '5′ → 3′'})
          </span>
          <p className="font-mono text-xs sm:text-sm text-[#111827] break-all leading-relaxed">
            {complement3To5 || '—'}
          </p>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-bold text-[#EA580C]">Transcribed mRNA (5′ → 3′ Triplets)</span>
          <p className="font-mono text-xs sm:text-sm text-[#111827] break-words leading-relaxed">
            {codons.length > 0 ? codons.join(' ') : '—'}
          </p>
        </div>
      </div>

      {/* Polypeptide Outputs */}
      <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-4">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-semibold text-[#EA580C] cursor-pointer"
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
            return (
              <div
                key={idx}
                className={`px-2.5 py-1.5 rounded-xl border text-center font-mono text-xs ${
                  isStart
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isStop
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-white border-orange-200/70 text-[#111827]'
                }`}
              >
                <div className="text-[10px] text-slate-400">{c}</div>
                <div className="font-bold">
                  {aa.aa3} ({aa.aa1})
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-orange-100 rounded-xl p-3 font-mono text-xs text-slate-700 break-all">
          <strong className="text-[#111827]">1-Letter FASTA:</strong>{' '}
          {translated.map((t) => t.aa1).join('') || '—'}
        </div>
      </div>
    </div>
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
  // Marmur-Doty / Nearest-Neighbor salt-adjusted (50 mM Na+) approximation for oligos >14 nt
  const nnTm = 64.9 + (41 * (g + c - 16.4)) / len;
  return { seq, len, gcPct, wallaceTm, nnTm };
}

export function PcrMasterMixCalculator() {
  const [sampleCount, setSampleCount] = useState<number>(8);
  const [rxnVolume, setRxnVolume] = useState<number>(25);
  const [includeOverage, setIncludeOverage] = useState<boolean>(true);
  const [fwdPrimer, setFwdPrimer] = useState('GCTAGCTAGCTGATCGATGC');
  const [revPrimer, setRevPrimer] = useState('CGATCGATCGACTAGCTACG');

  const loadExample = () => {
    setSampleCount(12);
    setRxnVolume(25);
    setIncludeOverage(true);
    setFwdPrimer('ATGGCCCTGTGGATGCGCCT');
    setRevPrimer('TCAAAGGCTGCGGCTGGGTC');
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

  const fwdStats = analyzePrimer(fwdPrimer);
  const revStats = analyzePrimer(revPrimer);
  const recommendedTa =
    fwdStats.len > 0 && revStats.len > 0
      ? Math.min(fwdStats.nnTm, revStats.nnTm) - 4.0
      : 55.0;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-display font-bold text-[#111827]">
            PCR Master Mix Scaler &amp; Primer Tm Analyzer
          </h3>
          <p className="text-xs text-slate-500">
            Calculates exact micropipette volumes plus forward/reverse annealing temperatures.
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (12 Samples)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Master Mix Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 tabular-nums">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Reactions (N)
              </label>
              <input
                type="number"
                min={1}
                max={384}
                value={sampleCount}
                onChange={(e) => setSampleCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Single Tube Vol (µL)
              </label>
              <select
                value={rxnVolume}
                onChange={(e) => setRxnVolume(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-[#111827]"
              >
                <option value={20}>20 µL</option>
                <option value={25}>25 µL (Standard)</option>
                <option value={50}>50 µL (Prep)</option>
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOverage}
                  onChange={(e) => setIncludeOverage(e.target.checked)}
                  className="rounded accent-[#F97316]"
                />
                <span>+10% Pipette Overage ({scaleFactor.toFixed(1)}×)</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-[#F9FAFB] border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-bold">PCR Component</th>
                  <th className="py-3 px-3 font-bold text-right">1× Tube (µL)</th>
                  <th className="py-3 px-4 font-bold text-right text-[#EA580C]">
                    Master Mix ({scaleFactor.toFixed(1)}× µL)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reagents.map((r) => (
                  <tr key={r.name} className={r.inMasterMix ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="py-2.5 px-4 font-medium text-[#111827]">{r.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{r.perRxn.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#111827]">
                      {r.inMasterMix ? `${(r.perRxn * scaleFactor).toFixed(2)} µL` : 'Add per tube'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Primer Analyzer Section */}
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4 tabular-nums">
          <h4 className="text-sm font-bold text-[#111827]">Forward &amp; Reverse Primer Tm</h4>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Forward Primer (5′ → 3′)
            </label>
            <input
              type="text"
              value={fwdPrimer}
              onChange={(e) => setFwdPrimer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-[#111827]"
            />
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-mono pt-0.5">
              <span>{fwdStats.len} nt</span>
              <span>· GC: {fwdStats.gcPct.toFixed(1)}%</span>
              <span>· Wallace: {fwdStats.wallaceTm.toFixed(1)}°C</span>
              <span className="font-bold text-[#EA580C]">· Salt Tm: {fwdStats.nnTm.toFixed(1)}°C</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Reverse Primer (5′ → 3′)
            </label>
            <input
              type="text"
              value={revPrimer}
              onChange={(e) => setRevPrimer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-[#111827]"
            />
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-mono pt-0.5">
              <span>{revStats.len} nt</span>
              <span>· GC: {revStats.gcPct.toFixed(1)}%</span>
              <span>· Wallace: {revStats.wallaceTm.toFixed(1)}°C</span>
              <span className="font-bold text-[#EA580C]">· Salt Tm: {revStats.nnTm.toFixed(1)}°C</span>
            </div>
          </div>

          <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">
              Recommended Thermocycler Ta
            </span>
            <p className="text-2xl font-mono font-bold text-[#111827]">
              {recommendedTa.toFixed(1)} °C
            </p>
            <p className="text-xs text-slate-600">
              ΔTm difference: {Math.abs(fwdStats.nnTm - revStats.nnTm).toFixed(1)} °C (Ideal ≤ 2.0 °C)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. HARDY-WEINBERG EQUILIBRIUM CALCULATOR
// ============================================================================
export function HardyWeinbergCalculator() {
  const [obsAA, setObsAA] = useState<number>(320);
  const [obsAa, setObsAa] = useState<number>(160);
  const [obsaa, setObsaa] = useState<number>(20);

  const totalN = Math.max(0, obsAA) + Math.max(0, obsAa) + Math.max(0, obsaa);
  const p = totalN > 0 ? (2 * obsAA + obsAa) / (2 * totalN) : 0;
  const q = 1 - p;

  const expAA = p * p * totalN;
  const expAa = 2 * p * q * totalN;
  const expaa = q * q * totalN;

  const chiTerm = (o: number, e: number) => (e > 0 ? Math.pow(o - e, 2) / e : 0);
  const chiSquare = chiTerm(obsAA, expAA) + chiTerm(obsAa, expAa) + chiTerm(obsaa, expaa);
  const inEquilibrium = chiSquare <= 3.841;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Tests observed genotype counts against <code className="font-mono text-[#111827]">p² + 2pq + q² = 1</code> (df = 1, α = 0.05 critical χ² = 3.841)
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setObsAA(320);
              setObsAa(160);
              setObsaa(20);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Example (Equilibrium)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setObsAA(210);
              setObsAa(80);
              setObsaa(110);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Inbreeding / Selection Sample
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start tabular-nums">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observed AA</label>
              <input
                type="number"
                min={0}
                value={obsAA}
                onChange={(e) => setObsAA(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observed Aa</label>
              <input
                type="number"
                min={0}
                value={obsAa}
                onChange={(e) => setObsAa(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observed aa</label>
              <input
                type="number"
                min={0}
                value={obsaa}
                onChange={(e) => setObsaa(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono font-bold text-sm text-[#111827]"
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
                  : 'χ² > 3.841 (p < 0.05, df = 1): Population deviates significantly from equilibrium (check selection, non-random mating, or migration).'}
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-7 overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-bold">Genotype</th>
                <th className="py-3 px-3 font-bold text-right">HWE Freq</th>
                <th className="py-3 px-3 font-bold text-right">Observed (O)</th>
                <th className="py-3 px-3 font-bold text-right">Expected (E)</th>
                <th className="py-3 px-4 font-bold text-right">(O − E)² / E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-[#111827]">AA (p²)</td>
                <td className="py-3 px-3 text-right">{(p * p).toFixed(4)}</td>
                <td className="py-3 px-3 text-right">{obsAA}</td>
                <td className="py-3 px-3 text-right">{expAA.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-[#EA580C]">{chiTerm(obsAA, expAA).toFixed(4)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#111827]">Aa (2pq)</td>
                <td className="py-3 px-3 text-right">{(2 * p * q).toFixed(4)}</td>
                <td className="py-3 px-3 text-right">{obsAa}</td>
                <td className="py-3 px-3 text-right">{expAa.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-[#EA580C]">{chiTerm(obsAa, expAa).toFixed(4)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#111827]">aa (q²)</td>
                <td className="py-3 px-3 text-right">{(q * q).toFixed(4)}</td>
                <td className="py-3 px-3 text-right">{obsaa}</td>
                <td className="py-3 px-3 text-right">{expaa.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-[#EA580C]">{chiTerm(obsaa, expaa).toFixed(4)}</td>
              </tr>
              <tr className="bg-[#F9FAFB] font-bold">
                <td className="py-3 px-4">Total (N)</td>
                <td className="py-3 px-3 text-right">1.0000</td>
                <td className="py-3 px-3 text-right">{totalN}</td>
                <td className="py-3 px-3 text-right">{totalN.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-[#EA580C]">χ² = {chiSquare.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
];

const LADDER_BANDS = [10000, 6000, 3000, 2000, 1500, 1000, 750, 500, 250];

function generateDemoPlasmidSequence(): string {
  // Build a deterministic 2,400 bp sequence containing EcoRI, BamHI, HindIII, and NotI sites
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

export function RestrictionDigestGelSimulator() {
  const [dnaSeq, setDnaSeq] = useState<string>(() => generateDemoPlasmidSequence());
  const [topology, setTopology] = useState<'circular' | 'linear'>('circular');
  const [selectedEnzymes, setSelectedEnzymes] = useState<string[]>(['EcoRI', 'BamHI', 'HindIII']);

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

  // Logarithmic y-coordinate mapper (150 bp to 12,000 bp)
  const bpToY = (bp: number) => {
    const clamped = Math.max(150, Math.min(12000, bp));
    const logMax = Math.log10(12000);
    const logMin = Math.log10(150);
    const ratio = (logMax - Math.log10(clamped)) / (logMax - logMin);
    return 44 + ratio * 280;
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTopology('circular')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              topology === 'circular'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700'
            }`}
          >
            Circular Plasmid DNA
          </button>
          <button
            type="button"
            onClick={() => setTopology('linear')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              topology === 'linear'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F9FAFB] border border-slate-200 text-slate-700'
            }`}
          >
            Linear Amplicon DNA
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setDnaSeq(generateDemoPlasmidSequence());
            setSelectedEnzymes(['EcoRI', 'BamHI', 'HindIII']);
            setTopology('circular');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (2.4 kb Cloning Vector)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sequence & Enzyme Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
              Select Restriction Endonucleases
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {RESTRICTION_ENZYMES.map((enz) => {
                const active = selectedEnzymes.includes(enz.name);
                return (
                  <button
                    key={enz.name}
                    type="button"
                    onClick={() => toggleEnzyme(enz.name)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
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
              <span className="font-bold text-[#111827]">Input DNA Sequence (5′ → 3′)</span>
              <span className="font-mono text-slate-500">{cleanSeq.length.toLocaleString()} bp</span>
            </div>
            <textarea
              rows={4}
              value={dnaSeq}
              onChange={(e) => setDnaSeq(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs text-[#111827] focus:bg-white focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-[#111827]">
                Cleavage Sites ({digestResult.cuts.length})
              </h4>
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
              <h4 className="text-xs font-bold text-[#111827]">
                Resulting Gel Fragments ({digestResult.fragments.length})
              </h4>
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
        <div className="lg:col-span-5 bg-slate-950 rounded-3xl p-5 text-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-orange-400">1.0% Agarose Gel (EtBr / SYBR)</span>
            <span className="font-mono text-slate-400">Cathode (−) → Anode (+)</span>
          </div>

          <svg viewBox="0 0 320 355" className="w-full h-auto rounded-2xl bg-slate-900 border border-slate-800">
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
    </div>
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

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="text-xs text-slate-600 font-medium">
          Scans both strands for SpCas9 <code className="font-mono text-[#EA580C]">5′-N₂₀-NGG-3′</code> targets &amp; Pol III poly-T signals
        </div>
        <button
          type="button"
          onClick={() => setTargetSeq(SAMPLE_CRISPR_LOCUS)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] border border-orange-200 text-xs font-bold text-[#EA580C] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (EGFP Exon)</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs tabular-nums">
          <label className="font-bold text-[#111827]">Genomic Target Locus (5′ → 3′):</label>
          <span className="font-mono text-slate-500">
            {clean.length} bp · {candidates.length} candidate gRNAs found
          </span>
        </div>
        <textarea
          rows={3}
          value={targetSeq}
          onChange={(e) => setTargetSeq(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs text-[#111827] focus:bg-white focus:border-[#F97316] focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[420px]">
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
            {candidates.slice(0, 30).map((c) => (
              <tr key={c.id} className="hover:bg-orange-50/40">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
