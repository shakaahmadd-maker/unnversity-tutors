import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { downloadBiologyStructuredPdf } from '../../../utils/pdfReportGenerator';
import { BiologyToolShell } from './BiologyToolShell';

// ============================================================================
// 11. SHANNON-WIENER & SIMPSON BIODIVERSITY INDEX CALCULATOR
// ============================================================================
interface SpeciesRow {
  id: string;
  name: string;
  count: number;
}

const DEFAULT_SPECIES: SpeciesRow[] = [
  { id: 'sp-1', name: 'Quercus alba (White Oak)', count: 42 },
  { id: 'sp-2', name: 'Acer saccharum (Sugar Maple)', count: 35 },
  { id: 'sp-3', name: 'Fagus grandifolia (American Beech)', count: 28 },
  { id: 'sp-4', name: 'Betula alleghaniensis (Yellow Birch)', count: 19 },
  { id: 'sp-5', name: 'Tsuga canadensis (Eastern Hemlock)', count: 16 },
];

const STREAM_BENTHIC_SPECIES: SpeciesRow[] = [
  { id: 'st-1', name: 'Ephemeroptera (Mayfly Nymphs)', count: 30 },
  { id: 'st-2', name: 'Plecoptera (Stonefly Nymphs)', count: 30 },
  { id: 'st-3', name: 'Trichoptera (Caddisfly Larvae)', count: 40 },
];

const DISTURBED_LAWN_SPECIES: SpeciesRow[] = [
  { id: 'dl-1', name: 'Lolium perenne (Turf Grass)', count: 185 },
  { id: 'dl-2', name: 'Taraxacum officinale (Dandelion)', count: 8 },
  { id: 'dl-3', name: 'Trifolium repens (White Clover)', count: 7 },
];

export function BiodiversityIndexCalculator() {
  const [speciesList, setSpeciesList] = useState<SpeciesRow[]>(DEFAULT_SPECIES);
  const rankSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'biodiversity-index-calculator') return;
      if (Array.isArray(detail.speciesList)) {
        const list = (detail.speciesList as SpeciesRow[]).filter(
          (x) => typeof x?.name === 'string' && typeof x?.count === 'number'
        );
        if (list.length >= 2) setSpeciesList(list);
      }
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => setSpeciesList(DEFAULT_SPECIES);

  const addSpecies = () => {
    setSpeciesList((prev) => [
      ...prev,
      { id: `sp-${Date.now()}`, name: `Species ${prev.length + 1}`, count: 10 },
    ]);
  };

  const updateRow = (id: string, patch: Partial<SpeciesRow>) => {
    setSpeciesList((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    if (speciesList.length <= 2) return;
    setSpeciesList((prev) => prev.filter((r) => r.id !== id));
  };

  const metrics = useMemo(() => {
    const valid = speciesList.filter((s) => s.count > 0);
    const S = valid.length;
    const N = valid.reduce((acc, s) => acc + s.count, 0);

    if (S === 0 || N === 0) {
      return {
        S: 0,
        N: 0,
        shannonH: 0,
        hMax: 0,
        evennessE: 0,
        simpsonD: 0,
        simpsonDiversity: 0,
        simpsonReciprocal: 0,
        rows: [],
      };
    }

    let shannonSum = 0;
    let simpsonFiniteSum = 0;

    const rows = valid.map((sp) => {
      const p = sp.count / N;
      const lnP = Math.log(p);
      const pLnP = p * lnP;
      shannonSum += -pLnP;
      simpsonFiniteSum += sp.count * (sp.count - 1);
      return { ...sp, p, lnP, pLnP };
    });

    const hMax = S > 1 ? Math.log(S) : 0;
    const evennessE = hMax > 0 ? shannonSum / hMax : 1;
    const simpsonD = N > 1 ? simpsonFiniteSum / (N * (N - 1)) : 1;
    const simpsonDiversity = 1 - simpsonD;
    const simpsonReciprocal = simpsonD > 0 ? 1 / simpsonD : S;

    return {
      S,
      N,
      shannonH: shannonSum,
      hMax,
      evennessE,
      simpsonD,
      simpsonDiversity,
      simpsonReciprocal,
      rows,
    };
  }, [speciesList]);

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `biodiversity-index-S${metrics.S}-N${metrics.N}.pdf`,
      badgeText: 'BIOLOGY · ECOLOGY DIVERSITY REPORT',
      title: "Shannon-Wiener (H') & Simpson's (1 - D) Biodiversity Report",
      subtitle: `${metrics.S} Species · ${metrics.N} Sampled Individuals · H' = ${metrics.shannonH.toFixed(3)}`,
      parameters: [
        { label: 'Species Richness (S)', value: `${metrics.S} active taxa` },
        { label: 'Total Organisms (N)', value: `${metrics.N} individuals` },
        { label: 'Maximum Possible H\'max', value: `${metrics.hMax.toFixed(3)} (ln ${metrics.S})` },
        { label: 'Evenness & Dominance', value: `Pielou J' = ${metrics.evennessE.toFixed(3)} · 1/D = ${metrics.simpsonReciprocal.toFixed(2)}` },
      ],
      kpis: [
        { label: "Shannon Index (H')", value: metrics.shannonH.toFixed(3), sublabel: `H'max = ${metrics.hMax.toFixed(3)}`, accent: true },
        { label: 'Pielou Evenness (E)', value: metrics.evennessE.toFixed(3), sublabel: '0 (skewed) -> 1 (even)' },
        { label: 'Simpson Diversity (1 - D)', value: metrics.simpsonDiversity.toFixed(3), sublabel: `Reciprocal 1/D = ${metrics.simpsonReciprocal.toFixed(2)}` },
      ],
      svgFigure: {
        title: 'Species Relative Abundance Profile (pi)',
        svgElement: rankSvgRef.current,
        maxHeightMm: 48,
      },
      tables: [
        {
          title: 'Field Quadrat Taxon Abundance Breakdown',
          headers: ['Species / Taxon', 'Count (ni)', 'Proportion (pi)', '-pi * ln(pi)'],
          rows: speciesList.map((row) => {
            const calc = metrics.rows.find((r) => r.id === row.id);
            return [
              row.name,
              String(row.count),
              calc ? calc.p.toFixed(4) : '0.0000',
              calc ? (-calc.pLnP).toFixed(4) : '0.0000',
            ];
          }),
          colWidths: [48, 16, 18, 18],
          alignRightCols: [1, 2, 3],
          monospaceCols: [1, 2, 3],
        },
      ],
      workedExample: {
        problem: 'A stream benthic sample contains 30 Mayflies, 30 Stoneflies, and 40 Caddisflies (N = 100, S = 3). Find H\' and Evenness E.',
        steps: [
          'Relative abundances: p1 = 0.30, p2 = 0.30, p3 = 0.40.',
          'Compute -pi ln(pi): 0.3612 + 0.3612 + 0.3665 = 1.0889.',
          'Pielou Evenness E = H\' / ln(3) = 1.0889 / 1.0986 = 0.991 (highly even).',
        ],
        answer: "H' = 1.089 · H'max = 1.099 · Evenness E = 0.991",
      },
    });
  };

  const sortedRows = [...metrics.rows].sort((a, b) => b.count - a.count);

  return (
    <BiologyToolShell
      slug="biodiversity-index-calculator"
      title="Shannon-Wiener (H′) & Simpson's (D)"
      subtitle="Computes Species Richness (S), Shannon-Wiener (H′), Pielou Evenness (E), and finite Simpson’s Diversity (1 − D)."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addSpecies}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F9FAFB] hover:bg-slate-100 border border-slate-200 text-[#111827] text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#EA580C]" />
            <span>Add Species</span>
          </button>
        </div>
      }
      presetsLabel="Field Quadrats:"
      presets={[
        {
          label: 'Deciduous Forest (Balanced)',
          active: speciesList[0]?.id === 'sp-1',
          onClick: handleReset,
        },
        {
          label: 'Stream Benthic (Even)',
          active: speciesList[0]?.id === 'st-1',
          onClick: () => setSpeciesList(STREAM_BENTHIC_SPECIES),
        },
        {
          label: 'Disturbed Monoculture Lawn',
          active: speciesList[0]?.id === 'dl-1',
          onClick: () => setSpeciesList(DISTURBED_LAWN_SPECIES),
        },
      ]}
    >
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-[#EA580C] block">
            Shannon Index (H′)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.shannonH.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">H′max = {metrics.hMax.toFixed(3)}</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Pielou Evenness (E)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.evennessE.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">Scale 0 (skewed) → 1 (even)</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Simpson Index (1 − D)
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {metrics.simpsonDiversity.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">1/D = {metrics.simpsonReciprocal.toFixed(2)}</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Richness (S) / Total (N)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.S} / {metrics.N}
          </span>
          <span className="text-[11px] text-slate-500 block">Sampled organisms</span>
        </div>
      </div>

      {/* Live Relative Abundance Bar SVG */}
      {sortedRows.length > 0 && (
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-[#111827] mb-2">
            Rank-Abundance Distribution (Relative Share pᵢ)
          </p>
          <svg
            ref={rankSvgRef}
            viewBox={`0 0 460 ${Math.max(85, sortedRows.length * 24 + 14)}`}
            className="w-full h-auto"
          >
            <rect
              x="0"
              y="0"
              width="460"
              height={Math.max(85, sortedRows.length * 24 + 14)}
              fill="#F9FAFB"
            />
            {sortedRows.map((sp, idx) => {
              const y = 10 + idx * 24;
              const barW = Math.max(3, sp.p * 230);
              const shortLabel = sp.name.length > 26 ? sp.name.slice(0, 24) + '..' : sp.name;
              return (
                <g key={sp.id}>
                  <text x="6" y={y + 13} fontSize="10" fill="#1E293B" fontFamily="sans-serif" fontWeight="600">
                    {shortLabel}
                  </text>
                  <rect x="175" y={y + 3} width="230" height="12" rx="4" fill="#E2E8F0" />
                  <rect
                    x="175"
                    y={y + 3}
                    width={barW}
                    height="12"
                    rx="4"
                    fill={idx === 0 ? '#EA580C' : idx === 1 ? '#F97316' : '#0284C7'}
                  />
                  <text x="412" y={y + 13} fontSize="10" fill="#111827" fontFamily="monospace" fontWeight="700">
                    {(sp.p * 100).toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Mobile Stacked Editor (<640px) */}
      <div className="sm:hidden space-y-2.5">
        {speciesList.map((row) => {
          const calc = metrics.rows.find((r) => r.id === row.id);
          return (
            <div key={row.id} className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 space-y-2.5 tabular-nums">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label="Species name"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827]"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={speciesList.length <= 2}
                  aria-label="Remove species"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold">Count (nᵢ)</span>
                  <input
                    type="number"
                    min={0}
                    aria-label="Species count"
                    value={row.count}
                    onChange={(e) => updateRow(row.id, { count: Math.max(0, Number(e.target.value)) })}
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold">Share pᵢ</span>
                  <span className="font-mono font-semibold text-slate-700">
                    {calc ? calc.p.toFixed(3) : '0.000'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold">−pᵢ ln(pᵢ)</span>
                  <span className="font-mono font-bold text-[#EA580C]">
                    {calc ? (-calc.pLnP).toFixed(3) : '0.000'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse tabular-nums">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-bold text-slate-600">
              <th className="py-3 px-4">Taxon / Species Name</th>
              <th className="py-3 px-4 w-32">Count (nᵢ)</th>
              <th className="py-3 px-4">Proportion (pᵢ)</th>
              <th className="py-3 px-4">−pᵢ · ln(pᵢ)</th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {speciesList.map((row) => {
              const calc = metrics.rows.find((r) => r.id === row.id);
              return (
                <tr key={row.id}>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={0}
                      value={row.count}
                      onChange={(e) => updateRow(row.id, { count: Math.max(0, Number(e.target.value)) })}
                      className="w-24 min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono focus:border-[#F97316] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-700">
                    {calc ? calc.p.toFixed(4) : '0.0000'}
                  </td>
                  <td className="py-2 px-4 font-mono font-semibold text-[#EA580C]">
                    {calc ? (-calc.pLnP).toFixed(4) : '0.0000'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={speciesList.length <= 2}
                      aria-label="Remove species"
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

// ============================================================================
// 12. PLANT WATER POTENTIAL (Ψ = Ψs + Ψp) & OSMOLARITY CALCULATOR
// ============================================================================
export function WaterPotentialOsmolarityCalculator() {
  const [ionizationFactor, setIonizationFactor] = useState(1);
  const [molarityC, setMolarityC] = useState(0.3);
  const [tempCelsius, setTempCelsius] = useState(22);
  const [pressureBar, setPressureBar] = useState(2.5);
  const [externalPsiBar, setExternalPsiBar] = useState(-3.5);

  const beakerSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'water-potential-osmolarity-calculator') return;
      if (typeof detail.ionizationFactor === 'number') setIonizationFactor(detail.ionizationFactor);
      if (typeof detail.molarityC === 'number') setMolarityC(detail.molarityC);
      if (typeof detail.tempCelsius === 'number') setTempCelsius(detail.tempCelsius);
      if (typeof detail.pressureBar === 'number') setPressureBar(detail.pressureBar);
      if (typeof detail.externalPsiBar === 'number') setExternalPsiBar(detail.externalPsiBar);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
    setIonizationFactor(1);
    setMolarityC(0.3);
    setTempCelsius(22);
    setPressureBar(2.5);
    setExternalPsiBar(-3.5);
  };

  const psiCalc = useMemo(() => {
    const R = 0.0831;
    const tempK = tempCelsius + 273.15;
    const psiS = -ionizationFactor * molarityC * R * tempK;
    const totalCellPsi = psiS + pressureBar;
    const totalCellMpa = totalCellPsi * 0.1;
    const deltaPsi = externalPsiBar - totalCellPsi;

    let direction: 'into' | 'out' | 'equilibrium' = 'equilibrium';
    let tonicityLabel = 'Isotonic Dynamic Equilibrium (No Net Osmotic Flux)';
    if (Math.abs(deltaPsi) < 0.05) {
      direction = 'equilibrium';
    } else if (externalPsiBar > totalCellPsi) {
      direction = 'into';
      tonicityLabel = 'Hypotonic Surroundings → Net Water Flows INTO Cell (Turgid)';
    } else {
      direction = 'out';
      tonicityLabel = 'Hypertonic Surroundings → Net Water Flows OUT OF Cell (Plasmolysis Risk)';
    }

    return {
      tempK,
      psiS,
      totalCellPsi,
      totalCellMpa,
      direction,
      tonicityLabel,
      osmolarity: ionizationFactor * molarityC,
    };
  }, [ionizationFactor, molarityC, tempCelsius, pressureBar, externalPsiBar]);

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `water-potential-psi-${psiCalc.totalCellPsi.toFixed(1)}bar.pdf`,
      badgeText: 'BIOLOGY · PLANT PHYSIOLOGY & OSMOSIS REPORT',
      title: 'Plant Water Potential (Psi = Psi_s + Psi_p) & Osmosis Report',
      subtitle: `Solute Potential = ${psiCalc.psiS.toFixed(2)} bar · Total Cell Psi = ${psiCalc.totalCellPsi.toFixed(2)} bar (${psiCalc.totalCellMpa.toFixed(3)} MPa)`,
      parameters: [
        { label: "Van 't Hoff Constant (i) & Molarity", value: `i = ${ionizationFactor} · C = ${molarityC} M (${psiCalc.osmolarity.toFixed(2)} Osm/L)` },
        { label: 'Temperature (T)', value: `${tempCelsius} C (${psiCalc.tempK.toFixed(2)} K)` },
        { label: 'Turgor Pressure (Psi_p)', value: `${pressureBar.toFixed(2)} bars` },
        { label: 'External Bath (Psi_ext)', value: `${externalPsiBar.toFixed(2)} bars` },
      ],
      kpis: [
        { label: 'Solute Potential (Psi_s)', value: `${psiCalc.psiS.toFixed(2)} bar`, sublabel: 'Psi_s = -iCRT' },
        { label: 'Total Cell Water Potential', value: `${psiCalc.totalCellPsi.toFixed(2)} bar`, sublabel: `${psiCalc.totalCellMpa.toFixed(3)} MPa`, accent: true },
        { label: 'External Bath Potential', value: `${externalPsiBar.toFixed(2)} bar`, sublabel: `Delta Psi = ${(externalPsiBar - psiCalc.totalCellPsi).toFixed(2)} bar` },
      ],
      callout: {
        title: 'Predicted Net Osmotic Flux & Tonicity',
        body: psiCalc.tonicityLabel,
        tone: psiCalc.direction === 'into' ? 'emerald' : psiCalc.direction === 'out' ? 'amber' : 'slate',
      },
      svgFigure: {
        title: 'Osmotic Gradient & Net Water Direction Diagram',
        svgElement: beakerSvgRef.current,
        maxHeightMm: 48,
      },
      workedExample: {
        problem: 'Calculate solute potential Psi_s of a 0.30 M sucrose solution in an open beaker (Psi_p = 0) at 22 C.',
        steps: [
          'Sucrose is non-ionizing (i = 1). Convert temperature T = 22 + 273.15 = 295.15 K.',
          'Psi_s = -(1)(0.30)(0.0831)(295.15) = -7.36 bars.',
          'Open beaker Psi_p = 0, so total Psi = -7.36 bars (-0.736 MPa).',
        ],
        answer: 'Psi_s = -7.36 bars · Total Psi = -7.36 bars (-0.736 MPa)',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="water-potential-osmolarity-calculator"
      title="Plant Water Potential (Ψ = Ψs + Ψp)"
      subtitle="Water always moves passively from HIGHER (less negative) Ψ toward LOWER (more negative) Ψ."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      presetsLabel="Osmotic Scenarios:"
      presets={[
        {
          label: 'Potato Core in Hypotonic Bath',
          active: ionizationFactor === 1 && molarityC === 0.3 && externalPsiBar === -3.5,
          onClick: handleReset,
        },
        {
          label: '0.5 M NaCl Plasmolysis',
          active: ionizationFactor === 2 && molarityC === 0.25 && externalPsiBar === -24.5,
          onClick: () => {
            setIonizationFactor(2);
            setMolarityC(0.25);
            setTempCelsius(22);
            setPressureBar(0);
            setExternalPsiBar(-24.5);
          },
        },
        {
          label: 'Pure Distilled Water (Ψext = 0)',
          active: externalPsiBar === 0 && pressureBar === 4.0,
          onClick: () => {
            setIonizationFactor(1);
            setMolarityC(0.2);
            setTempCelsius(20);
            setPressureBar(4.0);
            setExternalPsiBar(0);
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1">
              Van ’t Hoff Ionization Constant (i)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: 'i = 1 (Sucrose)' },
                { val: 2, label: 'i = 2 (NaCl)' },
                { val: 3, label: 'i = 3 (CaCl₂)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setIonizationFactor(opt.val)}
                  aria-pressed={ionizationFactor === opt.val}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    ionizationFactor === opt.val
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wp-molarity" className="block text-xs font-bold text-slate-700 mb-1">
                Internal Molarity C (M)
              </label>
              <input
                id="wp-molarity"
                type="number"
                min={0}
                max={5}
                step={0.05}
                value={molarityC}
                onChange={(e) => setMolarityC(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="wp-temp" className="block text-xs font-bold text-slate-700 mb-1">
                Temperature (°C)
              </label>
              <input
                id="wp-temp"
                type="number"
                min={-10}
                max={100}
                step={1}
                value={tempCelsius}
                onChange={(e) => setTempCelsius(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wp-turgor" className="block text-xs font-bold text-slate-700 mb-1">
                Turgor Pressure Ψp (bars)
              </label>
              <input
                id="wp-turgor"
                type="number"
                step={0.5}
                value={pressureBar}
                onChange={(e) => setPressureBar(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="wp-ext" className="block text-xs font-bold text-slate-700 mb-1">
                External Bath Ψext (bars)
              </label>
              <input
                id="wp-ext"
                type="number"
                step={0.5}
                value={externalPsiBar}
                onChange={(e) => setExternalPsiBar(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 tabular-nums">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Solute Potential (Ψs)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {psiCalc.psiS.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-500 block">
                Osmolarity: {psiCalc.osmolarity.toFixed(2)} Osm/L
              </span>
            </div>

            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Total Cell Ψ (Ψs + Ψp)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {psiCalc.totalCellPsi.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-600 block">
                = {psiCalc.totalCellMpa.toFixed(3)} MPa
              </span>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                External Bath Ψext
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {externalPsiBar.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-500 block">
                T = {psiCalc.tempK.toFixed(2)} K
              </span>
            </div>
          </div>

          {/* Visual Osmotic Beaker Diagram */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <svg ref={beakerSvgRef} viewBox="0 0 220 130" className="w-48 h-28 shrink-0">
              <rect x="0" y="0" width="220" height="130" fill="#F9FAFB" />
              <rect x="20" y="15" width="180" height="100" rx="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
              <rect x="70" y="38" width="80" height="54" rx="12" fill="#DCFCE7" stroke="#15803D" strokeWidth="3" />
              <text x="110" y="62" textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532D" fontFamily="monospace">
                Cell Ψ={psiCalc.totalCellPsi.toFixed(1)}
              </text>
              <text x="110" y="77" textAnchor="middle" fontSize="9" fill="#166534" fontFamily="monospace">
                Bath Ψ={externalPsiBar.toFixed(1)}
              </text>
              {psiCalc.direction === 'into' && (
                <>
                  <path d="M35 65 L64 65" stroke="#EA580C" strokeWidth="3" />
                  <polygon points="66,65 58,60 58,70" fill="#EA580C" />
                  <path d="M185 65 L156 65" stroke="#EA580C" strokeWidth="3" />
                  <polygon points="154,65 162,60 162,70" fill="#EA580C" />
                </>
              )}
              {psiCalc.direction === 'out' && (
                <>
                  <path d="M66 65 L37 65" stroke="#DC2626" strokeWidth="3" />
                  <polygon points="34,65 42,60 42,70" fill="#DC2626" />
                  <path d="M154 65 L183 65" stroke="#DC2626" strokeWidth="3" />
                  <polygon points="186,65 178,60 178,70" fill="#DC2626" />
                </>
              )}
            </svg>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Predicted Net Osmotic Flux</span>
              </div>
              <p className="text-sm font-bold text-[#111827]">{psiCalc.tonicityLabel}</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                External Ψ ({externalPsiBar.toFixed(2)} bar) vs. Cell Ψ (
                {psiCalc.totalCellPsi.toFixed(2)} bar): water moves toward the more negative
                potential until turgor pressure balances the gradient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BiologyToolShell>
  );
}

// ============================================================================
// 13. HUMAN PHYSIOLOGY CALCULATOR SUITE (CO, MAP, BMR, SPIROMETRY)
// ============================================================================
export function HumanPhysiologyCalculators() {
  const [tab, setTab] = useState<'cardiac' | 'map' | 'bmr' | 'lung'>('cardiac');

  // Cardiac Output
  const [hr, setHr] = useState(72);
  const [edv, setEdv] = useState(125);
  const [esv, setEsv] = useState(55);

  // MAP
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);

  // BMR
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [weightKg, setWeightKg] = useState(64);
  const [heightCm, setHeightCm] = useState(168);
  const [ageYr, setAgeYr] = useState(21);
  const [activityFactor, setActivityFactor] = useState(1.55);

  // Spirometry
  const [tvMl, setTvMl] = useState(500);
  const [irvMl, setIrvMl] = useState(3000);
  const [ervMl, setErvMl] = useState(1100);
  const [rvMl, setRvMl] = useState(1200);
  const [fev1L, setFev1L] = useState(3.8);
  const [fvcL, setFvcL] = useState(4.6);

  const lungSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'human-physiology-calculators') return;
      if (detail.tab === 'cardiac' || detail.tab === 'map' || detail.tab === 'bmr' || detail.tab === 'lung') {
        setTab(detail.tab);
      }
      if (typeof detail.hr === 'number') setHr(detail.hr);
      if (typeof detail.edv === 'number') setEdv(detail.edv);
      if (typeof detail.esv === 'number') setEsv(detail.esv);
      if (typeof detail.systolic === 'number') setSystolic(detail.systolic);
      if (typeof detail.diastolic === 'number') setDiastolic(detail.diastolic);
      if (detail.sex === 'female' || detail.sex === 'male') setSex(detail.sex);
      if (typeof detail.weightKg === 'number') setWeightKg(detail.weightKg);
      if (typeof detail.heightCm === 'number') setHeightCm(detail.heightCm);
      if (typeof detail.ageYr === 'number') setAgeYr(detail.ageYr);
      if (typeof detail.activityFactor === 'number') setActivityFactor(detail.activityFactor);
      if (typeof detail.fev1L === 'number') setFev1L(detail.fev1L);
      if (typeof detail.fvcL === 'number') setFvcL(detail.fvcL);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
    setHr(72);
    setEdv(125);
    setEsv(55);
    setSystolic(120);
    setDiastolic(80);
    setSex('female');
    setWeightKg(64);
    setHeightCm(168);
    setAgeYr(21);
    setActivityFactor(1.55);
    setTvMl(500);
    setIrvMl(3000);
    setErvMl(1100);
    setRvMl(1200);
    setFev1L(3.8);
    setFvcL(4.6);
  };

  const sv = Math.max(1, edv - esv);
  const coLMin = (hr * sv) / 1000;
  const efPercent = (sv / Math.max(1, edv)) * 100;

  const pulsePressure = systolic - diastolic;
  const mapMmHg = diastolic + pulsePressure / 3;

  const bmrKcal =
    10 * weightKg + 6.25 * heightCm - 5 * ageYr + (sex === 'male' ? 5 : -161);
  const tdeeKcal = bmrKcal * activityFactor;

  const vcMl = tvMl + irvMl + ervMl;
  const tlcMl = vcMl + rvMl;
  const fev1FvcRatio = (fev1L / Math.max(0.1, fvcL)) * 100;

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `human-physiology-${tab}-report.pdf`,
      badgeText: 'BIOLOGY · CLINICAL HUMAN PHYSIOLOGY REPORT',
      title: 'Human Physiology Comprehensive Lab Report (CO, MAP, BMR & Spirometry)',
      subtitle: 'Cardiovascular hemodynamics, basal metabolism & pulmonary volumes',
      parameters: [
        { label: 'Cardiac Inputs', value: `HR ${hr} bpm · EDV ${edv} mL · ESV ${esv} mL` },
        { label: 'Arterial Blood Pressure', value: `${systolic} / ${diastolic} mmHg` },
        { label: 'Metabolic Profile', value: `${sex === 'male' ? 'Male' : 'Female'}, ${ageYr} yr, ${weightKg} kg, ${heightCm} cm` },
        { label: 'Pulmonary Volumes', value: `TV ${tvMl} · IRV ${irvMl} · ERV ${ervMl} · RV ${rvMl} mL` },
      ],
      kpis: [
        { label: 'Cardiac Output (CO)', value: `${coLMin.toFixed(2)} L/min`, sublabel: `SV = ${sv} mL · EF = ${efPercent.toFixed(1)}%`, accent: tab === 'cardiac' },
        { label: 'Mean Arterial Pressure', value: `${mapMmHg.toFixed(1)} mmHg`, sublabel: `Pulse Pressure = ${pulsePressure} mmHg`, accent: tab === 'map' },
        { label: 'Mifflin-St Jeor BMR / TDEE', value: `${Math.round(bmrKcal)} / ${Math.round(tdeeKcal)} kcal`, sublabel: `PAL = ${activityFactor}x`, accent: tab === 'bmr' },
      ],
      svgFigure:
        tab === 'lung' && lungSvgRef.current
          ? {
              title: 'Spirometry Total Lung Capacity (TLC) Partitioning',
              svgElement: lungSvgRef.current,
              maxHeightMm: 46,
            }
          : undefined,
      tables: [
        {
          title: 'Physiological Module Summary Table',
          headers: ['System', 'Parameter', 'Calculated Value', 'Clinical Reference'],
          rows: [
            ['Cardiac', 'Stroke Volume (EDV - ESV)', `${sv} mL/beat`, '60 - 100 mL/beat'],
            ['Cardiac', 'Cardiac Output (HR x SV)', `${coLMin.toFixed(2)} L/min`, '4.0 - 8.0 L/min (Rest)'],
            ['Cardiac', 'Ejection Fraction (SV / EDV)', `${efPercent.toFixed(1)}%`, '55% - 70% Normal'],
            ['Vascular', 'Mean Arterial Pressure (MAP)', `${mapMmHg.toFixed(1)} mmHg`, '65 - 100 mmHg Organ Perfusion'],
            ['Metabolic', 'Basal Metabolic Rate (BMR)', `${Math.round(bmrKcal)} kcal/day`, 'Mifflin-St Jeor Equation'],
            ['Pulmonary', 'Vital Capacity (TV + IRV + ERV)', `${(vcMl / 1000).toFixed(2)} L (${vcMl} mL)`, 'TLC = ' + (tlcMl / 1000).toFixed(2) + ' L'],
            ['Pulmonary', 'FEV1 / FVC Ratio', `${fev1FvcRatio.toFixed(1)}%`, '>= 70% Non-obstructive'],
          ],
          colWidths: [18, 32, 24, 26],
          monospaceCols: [2],
        },
      ],
    });
  };

  return (
    <BiologyToolShell
      slug="human-physiology-calculators"
      title="Human Physiology Calculator Suite"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'cardiac', label: 'Cardiac Output' },
              { id: 'map', label: 'MAP' },
              { id: 'bmr', label: 'BMR & TDEE' },
              { id: 'lung', label: 'Spirometry' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                tab === item.id ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
      presetsLabel="Clinical Profiles:"
      presets={[
        {
          label: 'Healthy Resting Adult (72 bpm)',
          active: tab === 'cardiac' && hr === 72,
          onClick: () => {
            setTab('cardiac');
            handleReset();
          },
        },
        {
          label: 'Endurance Exercise (155 bpm)',
          active: tab === 'cardiac' && hr === 155,
          onClick: () => {
            setTab('cardiac');
            setHr(155);
            setEdv(145);
            setEsv(35);
          },
        },
        {
          label: 'Hypotensive Shock Check (85/55)',
          active: tab === 'map' && systolic === 85,
          onClick: () => {
            setTab('map');
            setSystolic(85);
            setDiastolic(55);
          },
        },
        {
          label: 'Obstructive Asthma (FEV₁/FVC 56%)',
          active: tab === 'lung' && fev1L === 2.4,
          onClick: () => {
            setTab('lung');
            setFev1L(2.4);
            setFvcL(4.3);
          },
        },
      ]}
    >
      {tab === 'cardiac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div>
              <label htmlFor="phys-hr" className="block text-xs font-bold text-slate-700 mb-1">
                Heart Rate HR (beats/min)
              </label>
              <input
                id="phys-hr"
                type="number"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phys-edv" className="block text-xs font-bold text-slate-700 mb-1">EDV (mL)</label>
                <input
                  id="phys-edv"
                  type="number"
                  value={edv}
                  onChange={(e) => setEdv(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="phys-esv" className="block text-xs font-bold text-slate-700 mb-1">ESV (mL)</label>
                <input
                  id="phys-esv"
                  type="number"
                  value={esv}
                  onChange={(e) => setEsv(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Cardiac Output (CO)
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827]">
                {coLMin.toFixed(2)} L/min
              </span>
              <span className="text-xs text-slate-500 block">{hr * sv} mL/min</span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Stroke Volume (SV = EDV − ESV)
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827]">
                {sv} mL/beat
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Ejection Fraction (SV / EDV)
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-700">
                {efPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 block">Normal: 55%–70%</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phys-sbp" className="block text-xs font-bold text-slate-700 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                id="phys-sbp"
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="phys-dbp" className="block text-xs font-bold text-slate-700 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                id="phys-dbp"
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-[#EA580C] block">
                Mean Arterial Pressure (MAP = DP + ⅓PP)
              </span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {mapMmHg.toFixed(1)} mmHg
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                {mapMmHg >= 65 && mapMmHg <= 100
                  ? 'Adequate organ perfusion range (65–100 mmHg)'
                  : mapMmHg < 65
                  ? 'Below 65 mmHg renal/cerebral autoregulation threshold'
                  : 'Elevated systemic arterial pressure (> 100 mmHg)'}
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-500 block">
                Pulse Pressure (SP − DP)
              </span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {pulsePressure} mmHg
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Arterial reading: {systolic}/{diastolic} mmHg
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'bmr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phys-sex" className="block text-xs font-bold text-slate-700 mb-1">Physiological Sex</label>
              <select
                id="phys-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as 'female' | 'male')}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              >
                <option value="female">Female (−161)</option>
                <option value="male">Male (+5)</option>
              </select>
            </div>
            <div>
              <label htmlFor="phys-age" className="block text-xs font-bold text-slate-700 mb-1">Age (years)</label>
              <input
                id="phys-age"
                type="number"
                value={ageYr}
                onChange={(e) => setAgeYr(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="phys-wt" className="block text-xs font-bold text-slate-700 mb-1">Mass (kg)</label>
              <input
                id="phys-wt"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="phys-ht" className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                id="phys-ht"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="phys-pal" className="block text-xs font-bold text-slate-700 mb-1">
                Activity Multiplier (PAL)
              </label>
              <select
                id="phys-pal"
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              >
                <option value={1.2}>1.20 — Sedentary (resting / desk study)</option>
                <option value={1.375}>1.375 — Light activity (1–3 days/wk)</option>
                <option value={1.55}>1.55 — Moderate exercise (3–5 days/wk)</option>
                <option value={1.725}>1.725 — Vigorous training (6–7 days/wk)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-[#EA580C] block">
                Mifflin-St Jeor BMR
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827] mt-1 block">
                {Math.round(bmrKcal).toLocaleString()} kcal/day
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                = {Math.round(bmrKcal * 4.184).toLocaleString()} kJ/day resting
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-500 block">
                Total Daily Expenditure (TDEE)
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-700 mt-1 block">
                {Math.round(tdeeKcal).toLocaleString()} kcal/day
              </span>
              <span className="text-xs text-slate-500 block mt-1">PAL × BMR</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'lung' && (
        <div className="space-y-5 tabular-nums">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lung-tv" className="block text-xs font-bold text-slate-700 mb-1">Tidal Vol TV (mL)</label>
                <input
                  id="lung-tv"
                  type="number"
                  value={tvMl}
                  onChange={(e) => setTvMl(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="lung-irv" className="block text-xs font-bold text-slate-700 mb-1">IRV (mL)</label>
                <input
                  id="lung-irv"
                  type="number"
                  value={irvMl}
                  onChange={(e) => setIrvMl(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="lung-erv" className="block text-xs font-bold text-slate-700 mb-1">ERV (mL)</label>
                <input
                  id="lung-erv"
                  type="number"
                  value={ervMl}
                  onChange={(e) => setErvMl(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="lung-rv" className="block text-xs font-bold text-slate-700 mb-1">Residual RV (mL)</label>
                <input
                  id="lung-rv"
                  type="number"
                  value={rvMl}
                  onChange={(e) => setRvMl(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="lung-fev1" className="block text-xs font-bold text-slate-700 mb-1">FEV₁ (L)</label>
                <input
                  id="lung-fev1"
                  type="number"
                  step={0.1}
                  value={fev1L}
                  onChange={(e) => setFev1L(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label htmlFor="lung-fvc" className="block text-xs font-bold text-slate-700 mb-1">FVC (L)</label>
                <input
                  id="lung-fvc"
                  type="number"
                  step={0.1}
                  value={fvcL}
                  onChange={(e) => setFvcL(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-[#EA580C] block">
                    Vital Capacity (VC)
                  </span>
                  <span className="text-xl font-mono font-bold text-[#111827]">
                    {vcMl.toLocaleString()} mL
                  </span>
                  <span className="text-xs text-slate-500 block">{(vcMl / 1000).toFixed(2)} L</span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Total Lung Capacity
                  </span>
                  <span className="text-xl font-mono font-bold text-[#111827]">
                    {tlcMl.toLocaleString()} mL
                  </span>
                  <span className="text-xs text-slate-500 block">VC + RV</span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-500 block">FEV₁ / FVC Ratio</span>
                  <span className={`text-xl font-mono font-bold ${fev1FvcRatio >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {fev1FvcRatio.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {fev1FvcRatio >= 70 ? 'Normal (≥70%)' : 'Obstructive (<70%)'}
                  </span>
                </div>
              </div>

              {/* Stacked Spirometry Bar SVG */}
              <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#111827] mb-2">
                  Total Lung Capacity (TLC) Partitioning
                </p>
                <svg ref={lungSvgRef} viewBox="0 0 420 56" className="w-full h-14">
                  <rect x="0" y="0" width="420" height="56" fill="#F9FAFB" />
                  {(() => {
                    const total = Math.max(1, tlcMl);
                    const irvW = (irvMl / total) * 400;
                    const tvW = (tvMl / total) * 400;
                    const ervW = (ervMl / total) * 400;
                    const rvW = (rvMl / total) * 400;
                    return (
                      <g>
                        <rect x="10" y="8" width={irvW} height="22" fill="#F97316" rx="2" />
                        <rect x={10 + irvW} y="8" width={tvW} height="22" fill="#0284C7" />
                        <rect x={10 + irvW + tvW} y="8" width={ervW} height="22" fill="#10B981" />
                        <rect x={10 + irvW + tvW + ervW} y="8" width={rvW} height="22" fill="#64748B" rx="2" />
                        <text x="10" y="46" fontSize="9.5" fill="#EA580C" fontWeight="700" fontFamily="monospace">IRV {irvMl}</text>
                        <text x="120" y="46" fontSize="9.5" fill="#0284C7" fontWeight="700" fontFamily="monospace">TV {tvMl}</text>
                        <text x="220" y="46" fontSize="9.5" fill="#059669" fontWeight="700" fontFamily="monospace">ERV {ervMl}</text>
                        <text x="335" y="46" fontSize="9.5" fill="#475569" fontWeight="700" fontFamily="monospace">RV {rvMl} mL</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </BiologyToolShell>
  );
}

// ============================================================================
// 14. TAXONOMIC RANK & DICHOTOMOUS KEY BUILDER
// ============================================================================
interface TaxonPreset {
  label: string;
  domain: string;
  kingdom: string;
  phylum: string;
  classRank: string;
  order: string;
  family: string;
  genus: string;
  speciesEpithet: string;
  authority: string;
}

const TAXON_PRESETS: TaxonPreset[] = [
  {
    label: 'Homo sapiens (Human)',
    domain: 'Eukarya',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    classRank: 'Mammalia',
    order: 'Primates',
    family: 'Hominidae',
    genus: 'Homo',
    speciesEpithet: 'sapiens',
    authority: 'Linnaeus, 1758',
  },
  {
    label: 'Arabidopsis thaliana (Thale Cress)',
    domain: 'Eukarya',
    kingdom: 'Plantae',
    phylum: 'Tracheophyta',
    classRank: 'Magnoliopsida',
    order: 'Brassicales',
    family: 'Brassicaceae',
    genus: 'Arabidopsis',
    speciesEpithet: 'thaliana',
    authority: '(L.) Heynh., 1842',
  },
  {
    label: 'Escherichia coli (Model Bacterium)',
    domain: 'Bacteria',
    kingdom: 'Pseudomonadati',
    phylum: 'Pseudomonadota',
    classRank: 'Gammaproteobacteria',
    order: 'Enterobacterales',
    family: 'Enterobacteriaceae',
    genus: 'Escherichia',
    speciesEpithet: 'coli',
    authority: '(Migula 1895) Castellani & Chalmers 1919',
  },
];

interface KeyStep {
  couplet: number;
  promptA: string;
  nextA: number | string;
  promptB: string;
  nextB: number | string;
}

const BOTANY_KEY: KeyStep[] = [
  {
    couplet: 1,
    promptA: 'Vascular tissue (xylem & phloem) absent; gametophyte dominant → Bryophyta (Mosses)',
    nextA: 'Bryophyta (Non-vascular Moss)',
    promptB: 'Lignified vascular tissue present; sporophyte dominant → Go to Couplet 2',
    nextB: 2,
  },
  {
    couplet: 2,
    promptA: 'Reproduces via haploid spores in sori on underside of fronds; no seeds → Pteridophyta',
    nextA: 'Pteridophyta (Seedless Vascular Fern)',
    promptB: 'Reproduces via multicellular seeds → Go to Couplet 3',
    nextB: 3,
  },
  {
    couplet: 3,
    promptA: 'Naked seeds borne on woody cones; needle-like evergreen leaves → Pinophyta',
    nextA: 'Gymnosperm — Pinus sylvestris (Conifer)',
    promptB: 'Seeds enclosed inside a floral ovary/fruit → Go to Couplet 4',
    nextB: 4,
  },
  {
    couplet: 4,
    promptA: 'Single cotyledon, parallel leaf venation, floral parts in multiples of 3',
    nextA: 'Monocotyledonae — Zea mays / Liliaceae',
    promptB: 'Two cotyledons, reticulate (netted) leaf venation, floral parts in 4s or 5s',
    nextB: 'Eudicotyledonae — Rosa / Quercus',
  },
];

const RANK_INDENT_CLASSES = [
  'ml-0',
  'ml-2 sm:ml-3',
  'ml-4 sm:ml-6',
  'ml-6 sm:ml-9',
  'ml-8 sm:ml-12',
  'ml-10 sm:ml-14',
  'ml-12 sm:ml-16',
  'ml-14 sm:ml-20',
];

export function TaxonomicDichotomousKeyBuilder() {
  const [tab, setTab] = useState<'taxonomy' | 'key'>('taxonomy');
  const [taxon, setTaxon] = useState<TaxonPreset>(TAXON_PRESETS[1]);

  // Interactive key walkthrough state
  const [currentCouplet, setCurrentCouplet] = useState<number>(1);
  const [identifiedResult, setIdentifiedResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'taxonomic-dichotomous-key-builder') return;
      if (detail.tab === 'taxonomy' || detail.tab === 'key') setTab(detail.tab);
      if (typeof detail.presetIndex === 'number' && TAXON_PRESETS[detail.presetIndex]) {
        setTaxon(TAXON_PRESETS[detail.presetIndex]);
      }
      if (detail.resetKey) {
        setCurrentCouplet(1);
        setIdentifiedResult(null);
        setHistory([]);
      }
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
    setTaxon(TAXON_PRESETS[1]);
    setCurrentCouplet(1);
    setIdentifiedResult(null);
    setHistory([]);
  };

  const formattedGenus =
    taxon.genus.trim().charAt(0).toUpperCase() + taxon.genus.trim().slice(1).toLowerCase();
  const formattedSpecies = taxon.speciesEpithet.trim().toLowerCase();

  const activeStep = BOTANY_KEY.find((k) => k.couplet === currentCouplet) || BOTANY_KEY[0];

  const chooseLead = (choiceLabel: string, target: number | string) => {
    setHistory((prev) => [...prev, `Couplet ${activeStep.couplet}: ${choiceLabel}`]);
    if (typeof target === 'number') {
      setCurrentCouplet(target);
    } else {
      setIdentifiedResult(target);
    }
  };

  const handleExportPdf = () => {
    const hierarchyRows: Array<[string, string]> = [
      ['1. Domain', taxon.domain],
      ['2. Kingdom', taxon.kingdom],
      ['3. Phylum / Division', taxon.phylum],
      ['4. Class', taxon.classRank],
      ['5. Order', taxon.order],
      ['6. Family', taxon.family],
      ['7. Genus', formattedGenus],
      ['8. Species Binomial', `${formattedGenus} ${formattedSpecies}`],
    ];
    void downloadBiologyStructuredPdf({
      filename: `taxonomy-${formattedGenus.toLowerCase()}-${formattedSpecies}.pdf`,
      badgeText: 'BIOLOGY · SYSTEMATICS & TAXONOMY REPORT',
      title: `Taxonomic Classification: ${formattedGenus} ${formattedSpecies}`,
      subtitle: `ICZN / ICN Binomial Nomenclature & 8-Rank Linnaean Hierarchy`,
      parameters: [
        { label: 'Formatted Binomial', value: `${formattedGenus} ${formattedSpecies} (${taxon.authority})` },
        { label: 'Abbreviated Citation', value: `${formattedGenus.charAt(0)}. ${formattedSpecies}` },
      ],
      ...(identifiedResult || history.length > 0
        ? {
            callout: {
              title: identifiedResult ? `Dichotomous Key Identification: ${identifiedResult}` : 'Dichotomous Key Progress',
              body: history.length > 0 ? history.join(' -> ') : 'Active Couplet #' + currentCouplet,
              tone: identifiedResult ? 'emerald' : 'slate',
            },
          }
        : {}),
      tables: [
        {
          title: '8-Rank Linnaean Taxonomic Hierarchy (Mnemonic: Dear King Philip Came Over For Good Soup)',
          headers: ['Taxonomic Rank', 'Assigned Clade / Taxon'],
          rows: hierarchyRows,
          colWidths: [35, 65],
        },
      ],
      workedExample: {
        problem: 'Format the scientific binomial name and classify Arabidopsis thaliana (thale cress) across the 8 major ranks.',
        steps: [
          'Assign higher ranks: Domain Eukarya -> Kingdom Plantae -> Phylum Tracheophyta -> Class Magnoliopsida -> Order Brassicales -> Family Brassicaceae.',
          'Capitalize the Genus (Arabidopsis) and lowercase the specific epithet (thaliana).',
          'Verify botanical dichotomous traits: vascular -> seeds -> enclosed flowers -> reticulate leaves & 4-petaled corolla.',
        ],
        answer: 'Arabidopsis thaliana (Family Brassicaceae, Order Brassicales)',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="taxonomic-dichotomous-key-builder"
      title="Taxonomic Hierarchy & Dichotomous Key"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab('taxonomy')}
            aria-pressed={tab === 'taxonomy'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'taxonomy' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            8-Rank Hierarchy
          </button>
          <button
            type="button"
            onClick={() => setTab('key')}
            aria-pressed={tab === 'key'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'key' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dichotomous Key
          </button>
        </div>
      }
      presetsLabel="Organisms:"
      presets={[
        {
          label: 'Arabidopsis thaliana',
          active: tab === 'taxonomy' && taxon.genus === 'Arabidopsis',
          onClick: () => {
            setTab('taxonomy');
            setTaxon(TAXON_PRESETS[1]);
          },
        },
        {
          label: 'Homo sapiens',
          active: tab === 'taxonomy' && taxon.genus === 'Homo',
          onClick: () => {
            setTab('taxonomy');
            setTaxon(TAXON_PRESETS[0]);
          },
        },
        {
          label: 'Escherichia coli',
          active: tab === 'taxonomy' && taxon.genus === 'Escherichia',
          onClick: () => {
            setTab('taxonomy');
            setTaxon(TAXON_PRESETS[2]);
          },
        },
        {
          label: 'Start Botany Key',
          active: tab === 'key',
          onClick: () => {
            setTab('key');
            setCurrentCouplet(1);
            setIdentifiedResult(null);
            setHistory([]);
          },
        },
      ]}
    >
      {tab === 'taxonomy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  ['domain', 'Domain'],
                  ['kingdom', 'Kingdom'],
                  ['phylum', 'Phylum / Division'],
                  ['classRank', 'Class'],
                  ['order', 'Order'],
                  ['family', 'Family'],
                  ['genus', 'Genus'],
                  ['speciesEpithet', 'Specific Epithet'],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label htmlFor={`tax-${field}`} className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    {label}
                  </label>
                  <input
                    id={`tax-${field}`}
                    type="text"
                    value={taxon[field]}
                    onChange={(e) => setTaxon({ ...taxon, [field]: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-1.5">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                ICZN / ICN Binomial Nomenclature Output
              </span>
              <p className="text-2xl font-display font-bold text-[#111827]">
                <em className="italic">
                  {formattedGenus} {formattedSpecies}
                </em>{' '}
                <span className="text-sm font-normal text-slate-500">{taxon.authority}</span>
              </p>
              <p className="text-xs text-slate-600">
                Abbreviated subsequent mention:{' '}
                <em className="italic font-semibold">
                  {formattedGenus.charAt(0)}. {formattedSpecies}
                </em>
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5">
              {[
                ['Domain', taxon.domain],
                ['Kingdom', taxon.kingdom],
                ['Phylum', taxon.phylum],
                ['Class', taxon.classRank],
                ['Order', taxon.order],
                ['Family', taxon.family],
                ['Genus', formattedGenus],
                ['Species', `${formattedGenus} ${formattedSpecies}`],
              ].map(([rank, val], idx) => (
                <div
                  key={rank}
                  className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white border border-slate-200/80 ${
                    RANK_INDENT_CLASSES[idx] || 'ml-0'
                  }`}
                >
                  <span className="font-bold text-slate-500">{rank}</span>
                  <span className={`font-semibold text-[#111827] ${idx >= 6 ? 'italic' : ''}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {identifiedResult ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Specimen Taxon Identified
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCouplet(1);
                    setIdentifiedResult(null);
                    setHistory([]);
                  }}
                  className="inline-flex items-center gap-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Key</span>
                </button>
              </div>
              <p className="text-xl font-display font-bold text-[#111827]">{identifiedResult}</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                {history.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EA580C]">
                  Dichotomous Couplet #{activeStep.couplet}
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentCouplet(1);
                      setHistory([]);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#111827] cursor-pointer"
                  >
                    Reset to Couplet 1
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => chooseLead('Lead A', activeStep.nextA)}
                  className="text-left p-5 min-h-[110px] rounded-2xl bg-white border border-slate-200 hover:border-[#F97316] transition-colors space-y-2 cursor-pointer"
                >
                  <span className="inline-block text-xs font-mono font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-md">
                    Lead {activeStep.couplet}a
                  </span>
                  <p className="text-sm font-semibold text-[#111827] leading-relaxed">
                    {activeStep.promptA}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => chooseLead('Lead B', activeStep.nextB)}
                  className="text-left p-5 min-h-[110px] rounded-2xl bg-white border border-slate-200 hover:border-[#F97316] transition-colors space-y-2 cursor-pointer"
                >
                  <span className="inline-block text-xs font-mono font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-md">
                    Lead {activeStep.couplet}b
                  </span>
                  <p className="text-sm font-semibold text-[#111827] leading-relaxed">
                    {activeStep.promptB}
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </BiologyToolShell>
  );
}
