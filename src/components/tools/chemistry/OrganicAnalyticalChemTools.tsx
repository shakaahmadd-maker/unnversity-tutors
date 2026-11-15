import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { parseChemicalFormula } from './GeneralPhysicalChemTools';
import { ChemistryToolShell } from './ChemistryToolShell';
import { downloadChemistryStructuredPdf } from '../../../utils/pdfReportGenerator';
import { SCIENCE_TOOLS_BY_SLUG } from '../../../data/scienceToolsRegistry';

// ============================================================================
// 25. NERNST EQUATION & ELECTROCHEMISTRY CELL POTENTIAL SOLVER
// ============================================================================
export function NernstElectrochemistrySolver() {
  const [cellName, setCellName] = useState('Daniell Cell (Zn | Zn²⁺ || Cu²⁺ | Cu)');
  const [eCathode, setECathode] = useState(0.34);
  const [eAnode, setEAnode] = useState(-0.76);
  const [electronsN, setElectronsN] = useState(2);
  const [reactionQ, setReactionQ] = useState(0.01);
  const [tempK, setTempK] = useState(298.15);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadDaniell = useCallback(() => {
    setCellName('Daniell Cell (Zn | Zn²⁺ || Cu²⁺ | Cu)');
    setECathode(0.34);
    setEAnode(-0.76);
    setElectronsN(2);
    setReactionQ(0.01);
    setTempK(298.15);
  }, []);

  const loadSilver = useCallback(() => {
    setCellName('Silver-Copper Galvanic (Cu | Cu²⁺ || Ag⁺ | Ag)');
    setECathode(0.8);
    setEAnode(0.34);
    setElectronsN(2);
    setReactionQ(0.25);
    setTempK(298.15);
  }, []);

  const loadConcentration = useCallback(() => {
    setCellName('Cu²⁺ Concentration Cell (0.01 M || 1.0 M)');
    setECathode(0.34);
    setEAnode(0.34);
    setElectronsN(2);
    setReactionQ(0.01);
    setTempK(298.15);
  }, []);

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (!detail || detail.slug !== 'nernst-electrochemistry-solver') return;
      if (typeof detail.cellName === 'string') setCellName(detail.cellName);
      if (typeof detail.eCathode === 'number') setECathode(detail.eCathode);
      if (typeof detail.eAnode === 'number') setEAnode(detail.eAnode);
      if (typeof detail.electronsN === 'number') setElectronsN(detail.electronsN);
      if (typeof detail.reactionQ === 'number') setReactionQ(detail.reactionQ);
      if (typeof detail.tempK === 'number') setTempK(detail.tempK);
    };
    window.addEventListener('ut-chem-load-preset', onPreset as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', onPreset as EventListener);
  }, []);

  const cell = useMemo(() => {
    const F = 96485.33;
    const R = 8.31446;
    const e0Cell = eCathode - eAnode;
    const n = Math.max(1, Math.round(electronsN || 1));
    const qSafe = Math.max(1e-18, reactionQ || 1e-18);
    const tSafe = Math.max(1, tempK || 298.15);
    const nernstSlope = (2.302585 * R * tSafe) / (n * F);
    const log10Q = Math.log10(qSafe);
    const eCell = e0Cell - ((R * tSafe) / (n * F)) * Math.log(qSafe);
    const deltaG0Kj = (-n * F * e0Cell) / 1000;
    const deltaGKj = (-n * F * eCell) / 1000;
    const lnK = (n * F * e0Cell) / (R * tSafe);
    const log10K = lnK / 2.302585;
    return { e0Cell, eCell, deltaG0Kj, deltaGKj, nernstSlope, log10Q, log10K, n, qSafe, tSafe };
  }, [eCathode, eAnode, electronsN, reactionQ, tempK]);

  // SVG Nernst Linear Plot: Ecell vs log10(Q) across log10(Q) in [-6, +6]
  const nernstPlot = useMemo(() => {
    const w = 440;
    const h = 230;
    const padL = 52;
    const padR = 20;
    const padT = 22;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minLogQ = Math.min(-6, Math.floor(cell.log10Q) - 1);
    const maxLogQ = Math.max(6, Math.ceil(cell.log10Q) + 1);
    const eAtMin = cell.e0Cell - cell.nernstSlope * minLogQ;
    const eAtMax = cell.e0Cell - cell.nernstSlope * maxLogQ;
    const minY = Math.min(-0.4, eAtMax - 0.15, cell.eCell - 0.15);
    const maxY = Math.max(1.4, eAtMin + 0.15, cell.eCell + 0.15);

    const toX = (lq: number) => padL + ((lq - minLogQ) / (maxLogQ - minLogQ)) * plotW;
    const toY = (eVal: number) => padT + ((maxY - eVal) / Math.max(0.1, maxY - minY)) * plotH;

    const x1 = toX(minLogQ);
    const y1 = toY(eAtMin);
    const x2 = toX(maxLogQ);
    const y2 = toY(eAtMax);
    const activeX = toX(cell.log10Q);
    const activeY = toY(cell.eCell);
    const zeroY = toY(0);
    const zeroQX = toX(0);

    return { w, h, padL, padR, padT, padB, plotW, plotH, x1, y1, x2, y2, activeX, activeY, zeroY, zeroQX, minLogQ, maxLogQ, minY, maxY };
  }, [cell]);

  const handleExportPdf = useCallback(() => {
    const tool = SCIENCE_TOOLS_BY_SLUG['nernst-electrochemistry-solver'];
    void downloadChemistryStructuredPdf({
      filename: 'nernst-electrochemistry-report.pdf',
      badgeText: 'CHEMISTRY · ELECTROCHEMISTRY LAB',
      title: 'Nernst Equation & Galvanic Cell Potential Report',
      subtitle: `${cellName} · T = ${cell.tSafe.toFixed(2)} K · n = ${cell.n} e⁻`,
      parameters: [
        { label: 'Cell Configuration', value: cellName },
        { label: 'E°cathode / E°anode', value: `${eCathode >= 0 ? '+' : ''}${eCathode.toFixed(3)} V  |  ${eAnode >= 0 ? '+' : ''}${eAnode.toFixed(3)} V` },
        { label: 'Electrons (n) & Temp', value: `n = ${cell.n} mol e⁻  ·  T = ${cell.tSafe.toFixed(2)} K` },
        { label: 'Reaction Quotient (Q)', value: `Q = ${cell.qSafe.toExponential(2)} (log₁₀ Q = ${cell.log10Q.toFixed(2)})` },
      ],
      kpis: [
        { label: 'Cell Voltage (Ecell)', value: `${cell.eCell >= 0 ? '+' : ''}${cell.eCell.toFixed(4)} V`, accent: true },
        { label: 'Standard E°cell', value: `${cell.e0Cell >= 0 ? '+' : ''}${cell.e0Cell.toFixed(3)} V` },
        { label: 'Free Energy ΔG', value: `${cell.deltaGKj.toFixed(2)} kJ/mol` },
      ],
      callout: {
        title: cell.eCell > 0 ? 'Spontaneous Galvanic Operation (Ecell > 0, ΔG < 0)' : cell.eCell === 0 ? 'Equilibrium Battery State (Ecell = 0 V, Q = K)' : 'Non-Spontaneous Electrolytic Regime (External Voltage Required)',
        body: `Nernst slope = ${(cell.nernstSlope * 1000).toFixed(2)} mV/decade. At T = ${cell.tSafe.toFixed(1)} K, K ≈ 10^(${cell.log10K.toFixed(1)}). Standard free energy ΔG° = ${cell.deltaG0Kj.toFixed(2)} kJ/mol.`,
        tone: cell.eCell > 0 ? 'emerald' : 'amber',
      },
      svgFigure: svgRef.current
        ? {
            title: 'Nernst Cell Potential Curve (Ecell vs log10 Q)',
            svgElement: svgRef.current,
            maxHeightMm: 62,
          }
        : undefined,
      workedExample: tool?.workedExample,
    });
  }, [cellName, eCathode, eAnode, cell]);

  return (
    <ChemistryToolShell
      slug="nernst-electrochemistry-solver"
      title="Galvanic & Electrolytic Cell Potential (Nernst Equation) Solver"
      subtitle="Ecell = E°cell − (RT/nF) ln Q · Compute standard EMF, Gibbs ΔG, and log(K)"
      presets={[
        { label: 'Daniell Zn|Cu (+1.10 V)', active: cellName.includes('Daniell'), onClick: loadDaniell },
        { label: 'Silver-Copper (+0.46 V)', active: cellName.includes('Silver'), onClick: loadSilver },
        { label: 'Cu Concentration Cell', active: cellName.includes('Concentration'), onClick: loadConcentration },
      ]}
      onReset={loadDaniell}
      onExportPdf={handleExportPdf}
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 tabular-nums">
        <div>
          <label htmlFor="nernst-ecath" className="block text-xs font-bold text-slate-700 mb-1">
            E°cathode (V)
          </label>
          <input
            id="nernst-ecath"
            type="number"
            step={0.01}
            value={eCathode}
            onChange={(e) => setECathode(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="nernst-eanode" className="block text-xs font-bold text-slate-700 mb-1">
            E°anode (V)
          </label>
          <input
            id="nernst-eanode"
            type="number"
            step={0.01}
            value={eAnode}
            onChange={(e) => setEAnode(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="nernst-n" className="block text-xs font-bold text-slate-700 mb-1">
            Electrons (n)
          </label>
          <input
            id="nernst-n"
            type="number"
            min={1}
            max={12}
            value={electronsN}
            onChange={(e) => setElectronsN(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="nernst-q" className="block text-xs font-bold text-slate-700 mb-1">
            Quotient (Q)
          </label>
          <input
            id="nernst-q"
            type="number"
            min={1e-12}
            step="any"
            value={reactionQ}
            onChange={(e) => setReactionQ(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="nernst-t" className="block text-xs font-bold text-slate-700 mb-1">
            Temp (K)
          </label>
          <input
            id="nernst-t"
            type="number"
            step={1}
            value={tempK}
            onChange={(e) => setTempK(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch tabular-nums">
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
            <span className="text-xs font-bold text-[#EA580C] block">
              Non-Standard Cell Voltage (Ecell)
            </span>
            <span className="text-3xl font-mono font-bold text-[#111827] block mt-1">
              {cell.eCell >= 0 ? '+' : ''}
              {cell.eCell.toFixed(4)} V
            </span>
            <span className="text-xs font-medium text-slate-600 block mt-1.5">
              {cell.eCell > 0
                ? 'Spontaneous Galvanic Cell (Discharging Battery)'
                : cell.eCell === 0
                ? 'Equilibrium Cell State (Q = K, ΔG = 0)'
                : 'Non-spontaneous Electrolytic Regime (Requires External EMF)'}
            </span>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-500 block">Standard E°cell</span>
            <span className="text-2xl font-mono font-bold text-[#111827] block mt-0.5">
              {cell.e0Cell >= 0 ? '+' : ''}
              {cell.e0Cell.toFixed(3)} V
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              log₁₀ K ≈ {cell.log10K.toFixed(1)}
            </span>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-500 block">Free Energy ΔG = −nFE</span>
            <span
              className={`text-2xl font-mono font-bold block mt-0.5 ${
                cell.deltaGKj < 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {cell.deltaGKj.toFixed(2)} kJ/mol
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ΔG° = {cell.deltaG0Kj.toFixed(1)} kJ/mol
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs pb-2">
            <span className="font-bold text-[#111827]">Nernst Potential vs. Reaction Quotient</span>
            <span className="font-mono text-[#EA580C] font-bold">
              Slope = −{(cell.nernstSlope * 1000).toFixed(1)} mV/dec
            </span>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${nernstPlot.w} ${nernstPlot.h}`}
            className="w-full h-auto bg-white rounded-xl border border-slate-200"
            role="img"
            aria-label={`Nernst plot of Ecell versus log10 Q with active point at Q = ${cell.qSafe}`}
          >
            {/* Grid & Zero Axes */}
            {nernstPlot.zeroY >= nernstPlot.padT && nernstPlot.zeroY <= nernstPlot.padT + nernstPlot.plotH && (
              <line
                x1={nernstPlot.padL}
                y1={nernstPlot.zeroY}
                x2={nernstPlot.w - nernstPlot.padR}
                y2={nernstPlot.zeroY}
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
            )}
            <line
              x1={nernstPlot.zeroQX}
              y1={nernstPlot.padT}
              x2={nernstPlot.zeroQX}
              y2={nernstPlot.padT + nernstPlot.plotH}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Main Axes */}
            <line
              x1={nernstPlot.padL}
              y1={nernstPlot.padT}
              x2={nernstPlot.padL}
              y2={nernstPlot.padT + nernstPlot.plotH}
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line
              x1={nernstPlot.padL}
              y1={nernstPlot.padT + nernstPlot.plotH}
              x2={nernstPlot.w - nernstPlot.padR}
              y2={nernstPlot.padT + nernstPlot.plotH}
              stroke="#64748B"
              strokeWidth="1.5"
            />

            {/* Nernst Line */}
            <line
              x1={nernstPlot.x1}
              y1={nernstPlot.y1}
              x2={nernstPlot.x2}
              y2={nernstPlot.y2}
              stroke="#EA580C"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Active Operating Point */}
            <line
              x1={nernstPlot.activeX}
              y1={nernstPlot.activeY}
              x2={nernstPlot.activeX}
              y2={nernstPlot.padT + nernstPlot.plotH}
              stroke="#0F172A"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
            <circle
              cx={nernstPlot.activeX}
              cy={nernstPlot.activeY}
              r="5.5"
              fill="#F97316"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <rect
              x={Math.min(nernstPlot.w - 135, Math.max(nernstPlot.padL + 6, nernstPlot.activeX + 8))}
              y={Math.max(nernstPlot.padT + 4, nernstPlot.activeY - 22)}
              width="124"
              height="20"
              rx="6"
              fill="#111827"
            />
            <text
              x={Math.min(nernstPlot.w - 135, Math.max(nernstPlot.padL + 6, nernstPlot.activeX + 8)) + 62}
              y={Math.max(nernstPlot.padT + 4, nernstPlot.activeY - 22) + 13}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#FFFFFF"
              fontFamily="monospace"
            >
              {`(${cell.log10Q.toFixed(1)}, ${cell.eCell.toFixed(2)}V)`}
            </text>

            {/* Axis Labels */}
            <text x="16" y={nernstPlot.padT + nernstPlot.plotH / 2} fontSize="11" fontWeight="700" fill="#334155" transform={`rotate(-90 16 ${nernstPlot.padT + nernstPlot.plotH / 2})`} textAnchor="middle">
              Ecell (V)
            </text>
            <text x={nernstPlot.padL + nernstPlot.plotW / 2} y={nernstPlot.h - 10} fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">
              log₁₀(Q)  [Q = 1 at 0]
            </text>
            <text x={nernstPlot.padL - 6} y={nernstPlot.zeroY + 4} textAnchor="end" fontSize="9.5" fill="#64748B" fontFamily="monospace">
              0 V
            </text>
            <text x={nernstPlot.zeroQX} y={nernstPlot.padT + nernstPlot.plotH + 14} textAnchor="middle" fontSize="9.5" fill="#64748B" fontFamily="monospace">
              0
            </text>
          </svg>
        </div>
      </div>
    </ChemistryToolShell>
  );
}

// ============================================================================
// 26. VSEPR MOLECULAR GEOMETRY & HYBRIDIZATION 3D VISUALIZER
// ============================================================================
export { VseprMolecularGeometryVisualizer } from './VseprMolecularVisualizer';

// ============================================================================
// 27. DEGREE OF UNSATURATION (IHD / RINGS + DOUBLE BONDS) CALCULATOR
// ============================================================================
export function DegreeOfUnsaturationIhdCalculator() {
  const [formula, setFormula] = useState('C8H9NO2');

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (!detail || detail.slug !== 'degree-of-unsaturation-ihd-calculator') return;
      if (typeof detail.formula === 'string') setFormula(detail.formula);
    };
    window.addEventListener('ut-chem-load-preset', onPreset as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', onPreset as EventListener);
  }, []);

  const ihdData = useMemo(() => {
    const counts = parseChemicalFormula(formula);
    if (!counts) return null;
    const C = counts.C || 0;
    const H = counts.H || 0;
    const N = counts.N || 0;
    const O = counts.O || 0;
    const S = counts.S || 0;
    const X = (counts.F || 0) + (counts.Cl || 0) + (counts.Br || 0) + (counts.I || 0);
    const numerator = 2 * C + 2 + N - H - X;
    const ihd = numerator / 2;
    return { C, H, N, O, S, X, numerator, ihd };
  }, [formula]);

  const presets = [
    { label: 'C₆H₆ (Benzene)', formula: 'C6H6' },
    { label: 'C₈H₉NO₂ (Acetaminophen)', formula: 'C8H9NO2' },
    { label: 'C₉H₈O₄ (Aspirin)', formula: 'C9H8O4' },
    { label: 'C₇H₇NO (Benzamide)', formula: 'C7H7NO' },
    { label: 'C₆H₁₂O₆ (Glucose)', formula: 'C6H12O6' },
  ];

  const handleExportPdf = useCallback(() => {
    const tool = SCIENCE_TOOLS_BY_SLUG['degree-of-unsaturation-ihd-calculator'];
    void downloadChemistryStructuredPdf({
      filename: `ihd-${formula.replace(/[^a-zA-Z0-9]/g, '') || 'formula'}.pdf`,
      badgeText: 'ORGANIC CHEMISTRY · STRUCTURE ELUCIDATION',
      title: `Degree of Unsaturation (IHD) Report — ${formula}`,
      subtitle: 'Formula: IHD = ½ (2C + 2 + N − H − X)',
      parameters: ihdData
        ? [
            { label: 'Input Molecular Formula', value: formula },
            { label: 'Carbon / Hydrogen / Nitrogen', value: `C = ${ihdData.C}, H = ${ihdData.H}, N = ${ihdData.N}` },
            { label: 'Halogens (F+Cl+Br+I) & O/S', value: `X = ${ihdData.X} (O = ${ihdData.O}, S = ${ihdData.S} excluded from IHD)` },
            { label: 'Substitution Numerator', value: `2(${ihdData.C}) + 2 + ${ihdData.N} - ${ihdData.H} - ${ihdData.X} = ${ihdData.numerator}` },
          ]
        : [{ label: 'Input Formula', value: formula }],
      kpis: ihdData
        ? [
            { label: 'Computed IHD', value: String(ihdData.ihd), accent: true },
            { label: 'Rings + π Bonds', value: `${ihdData.ihd} equivalents` },
            {
              label: 'Aromatic Clue',
              value: ihdData.ihd >= 4 ? 'Benzene Ring Likely' : ihdData.ihd === 0 ? 'Fully Saturated' : 'Alkene / Carbonyl / Ring',
            },
          ]
        : [{ label: 'Status', value: 'Invalid Formula', accent: true }],
      callout: ihdData
        ? {
            title: 'Structural Elucidation Interpretation',
            body:
              ihdData.ihd >= 4
                ? `IHD = ${ihdData.ihd} strongly signals at least one aromatic benzene ring (1 ring + 3 π bonds = 4 IHD), leaving ${ihdData.ihd - 4} remaining unsaturation unit(s) for carbonyls, alkenes, or extra rings.`
                : ihdData.ihd === 0
                ? 'IHD = 0 indicates an acyclic, completely saturated molecule (alkane, alcohol, ether, or amine with zero π bonds or rings).'
                : `Total sum of rings + double bonds + 2×(triple bonds) equals ${ihdData.ihd}.`,
            tone: 'orange',
          }
        : undefined,
      workedExample: tool?.workedExample,
    });
  }, [formula, ihdData]);

  return (
    <ChemistryToolShell
      slug="degree-of-unsaturation-ihd-calculator"
      title="Degree of Unsaturation (IHD / Rings + π Bonds) Calculator"
      subtitle="IHD = ½(2C + 2 + N − H − X) · Rapid organic spectroscopy structure screening"
      presets={presets.map((p) => ({
        label: p.label,
        active: formula.trim().toUpperCase() === p.formula,
        onClick: () => setFormula(p.formula),
      }))}
      onReset={() => setFormula('C8H9NO2')}
      onExportPdf={handleExportPdf}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start tabular-nums">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <label htmlFor="ihd-formula-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Organic Molecular Formula (e.g., C9H8O4, C7H7Cl)
            </label>
            <input
              id="ihd-formula-input"
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-base focus:border-[#F97316] focus:outline-none"
            />
          </div>

          {ihdData && (
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { k: 'C', v: ihdData.C },
                { k: 'H', v: ihdData.H },
                { k: 'N', v: ihdData.N },
                { k: 'O / S', v: ihdData.O + ihdData.S },
                { k: 'X', v: ihdData.X },
              ].map((atom) => (
                <div key={atom.k} className="bg-white border border-slate-200 rounded-xl py-2 px-1">
                  <span className="text-[11px] font-bold text-slate-500 block">{atom.k}</span>
                  <span className="text-sm font-mono font-bold text-[#111827]">{atom.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-3">
          {ihdData ? (
            <>
              <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 sm:p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#EA580C]">
                    Index of Hydrogen Deficiency (Rings + π Bonds)
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-slate-700">
                    ½({2 * ihdData.C} + 2 + {ihdData.N} − {ihdData.H} − {ihdData.X})
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-mono font-bold text-[#111827]">
                  IHD = {ihdData.ihd}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {ihdData.ihd < 0 || !Number.isInteger(ihdData.ihd)
                    ? 'Non-integer or negative IHD indicates a radical species, ion, or mismatched valence in the formula.'
                    : ihdData.ihd >= 4
                    ? `IHD ≥ 4 strongly points to an aromatic benzene ring (4 IHD) plus ${ihdData.ihd - 4} additional ring(s) or π bond(s).`
                    : ihdData.ihd === 0
                    ? 'Fully saturated acyclic structure (0 rings, 0 double bonds, 0 triple bonds).'
                    : `Total sum of rings + double bonds + 2×(triple bonds) equals ${ihdData.ihd}.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-3">
                  <span className="font-bold text-slate-500 block">1 Ring / 1 Double Bond</span>
                  <span className="font-mono font-bold text-[#111827]">+1 IHD each</span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-3">
                  <span className="font-bold text-slate-500 block">1 Triple Bond (C≡C / C≡N)</span>
                  <span className="font-mono font-bold text-[#111827]">+2 IHD each</span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-3">
                  <span className="font-bold text-slate-500 block">1 Benzene Ring (Ph)</span>
                  <span className="font-mono font-bold text-[#EA580C]">+4 IHD total</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm font-semibold text-red-700">
              Could not parse chemical formula. Try standard capitalization such as C6H6 or C8H9NO2.
            </div>
          )}
        </div>
      </div>
    </ChemistryToolShell>
  );
}

// ============================================================================
// 28. IR & ¹H / ¹³C NMR SPECTROSCOPY PEAK LOOKUP TOOL
// ============================================================================
const SPECTRA_DB = [
  { mode: 'IR', range: '3200–3550 cm⁻¹ (broad)', group: 'Alcohol O–H stretch (H-bonded)', notes: 'Unmistakable smooth parabolic trough' },
  { mode: 'IR', range: '2500–3300 cm⁻¹ (very broad)', group: 'Carboxylic Acid O–H stretch', notes: 'Overlaps C–H sp³ peaks; paired with C=O ~1710 cm⁻¹' },
  { mode: 'IR', range: '3300–3500 cm⁻¹ (1 or 2 spikes)', group: 'Amine / Amide N–H stretch', notes: '1° gives 2 spikes; 2° gives 1 spike; 3° shows none' },
  { mode: 'IR', range: '2210–2260 cm⁻¹ (sharp)', group: 'Nitrile C≡N or Alkyne C≡C', notes: 'Diagnostic triple-bond window' },
  { mode: 'IR', range: '1705–1750 cm⁻¹ (strong)', group: 'Carbonyl C=O (Ketone, Ester, Aldehyde)', notes: 'Esters ~1735–1750; Ketones ~1715; Conjugated ~1685' },
  { mode: 'IR', range: '1600 & 1475 cm⁻¹ (sharp)', group: 'Aromatic C=C Ring Stretch', notes: 'Usually paired with sp² C–H stretch just above 3000 cm⁻¹' },
  { mode: '1H NMR', range: '10.5–12.5 ppm (broad s)', group: 'Carboxylic Acid –COOH proton', notes: 'Exchangeable with D₂O' },
  { mode: '1H NMR', range: '9.5–10.2 ppm (s)', group: 'Aldehyde –CHO proton', notes: 'Strongly deshielded by carbonyl anisotropy' },
  { mode: '1H NMR', range: '6.8–8.2 ppm (m/d)', group: 'Aromatic Ar–H protons', notes: 'Para-disubstituted ring gives clean pair of doublets' },
  { mode: '1H NMR', range: '3.3–4.3 ppm', group: 'α-Protons next to –O– or Halogen (–OCH₂–)', notes: 'Inductive deshielding by electronegative O/Cl/Br' },
  { mode: '1H NMR', range: '2.0–2.6 ppm', group: 'α-Protons next to Carbonyl (CH₃C=O / Ar–CH₃)', notes: 'Moderate deshielding by sp² π system' },
  { mode: '13C NMR', range: '190–215 ppm', group: 'Ketone or Aldehyde Carbonyl C=O', notes: 'Most downfield ¹³C signals' },
  { mode: '13C NMR', range: '165–180 ppm', group: 'Ester, Amide, or Carboxylic Acid C=O', notes: 'Shielded vs ketone due to heteroatom lone-pair donation' },
  { mode: '13C NMR', range: '115–150 ppm', group: 'sp² Alkene / Aromatic Carbons', notes: 'Count unique signals to assess molecular symmetry' },
];

export function IrNmrSpectroscopyLookup() {
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'All' | 'IR' | '1H NMR' | '13C NMR'>('All');

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (!detail || detail.slug !== 'ir-nmr-spectroscopy-lookup') return;
      if (typeof detail.query === 'string') setQuery(detail.query);
      if (
        detail.modeFilter === 'All' ||
        detail.modeFilter === 'IR' ||
        detail.modeFilter === '1H NMR' ||
        detail.modeFilter === '13C NMR'
      ) {
        setModeFilter(detail.modeFilter);
      }
    };
    window.addEventListener('ut-chem-load-preset', onPreset as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', onPreset as EventListener);
  }, []);

  const rows = useMemo(() => {
    return SPECTRA_DB.filter((r) => {
      if (modeFilter !== 'All' && r.mode !== modeFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        r.range.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        r.mode.toLowerCase().includes(q)
      );
    });
  }, [query, modeFilter]);

  const handleExportPdf = useCallback(() => {
    const tool = SCIENCE_TOOLS_BY_SLUG['ir-nmr-spectroscopy-lookup'];
    void downloadChemistryStructuredPdf({
      filename: 'ir-nmr-spectroscopy-reference.pdf',
      badgeText: 'ORGANIC CHEMISTRY · SPECTROSCOPY',
      title: 'IR, ¹H NMR & ¹³C NMR Spectroscopy Reference Table',
      subtitle: `Active Mode: ${modeFilter} · Filter Query: ${query.trim() || 'All Peaks'}`,
      parameters: [
        { label: 'Spectroscopy Filter', value: modeFilter },
        { label: 'Keyword Query', value: query.trim() || 'None (Full Table)' },
        { label: 'Matching Bands', value: `${rows.length} of ${SPECTRA_DB.length} diagnostic windows` },
      ],
      kpis: [
        { label: 'Matched Windows', value: String(rows.length), accent: true },
        { label: 'IR Stretching Region', value: '4000–1450 cm⁻¹' },
        { label: '¹H NMR Rule', value: 'n + 1 Splitting' },
      ],
      tables: [
        {
          title: 'Diagnostic Spectroscopy Chemical Shifts & Wavenumbers',
          headers: ['Technique', 'Shift / Wavenumber', 'Functional Group', 'Exam Notes'],
          rows: rows.map((r) => [r.mode, r.range, r.group, r.notes]),
          colWidths: [1.1, 2.2, 2.5, 3.2],
          monospaceCols: [1],
        },
      ],
      workedExample: tool?.workedExample,
    });
  }, [modeFilter, query, rows]);

  return (
    <ChemistryToolShell
      slug="ir-nmr-spectroscopy-lookup"
      title="IR, ¹H NMR & ¹³C NMR Spectroscopy Peak Lookup"
      subtitle="Search by cm⁻¹, δ ppm, or functional group name for organic structure elucidation"
      presets={[
        { label: 'All Diagnostic Peaks', active: !query && modeFilter === 'All', onClick: () => { setModeFilter('All'); setQuery(''); } },
        { label: 'Carbonyl C=O (~1715 / 200 ppm)', active: query === 'Carbonyl', onClick: () => { setModeFilter('All'); setQuery('Carbonyl'); } },
        { label: 'Alcohol vs Acid O–H', active: query === 'O–H', onClick: () => { setModeFilter('IR'); setQuery('O–H'); } },
        { label: 'Aromatic Rings', active: query === 'Aromatic', onClick: () => { setModeFilter('All'); setQuery('Aromatic'); } },
      ]}
      onReset={() => { setModeFilter('All'); setQuery(''); }}
      onExportPdf={handleExportPdf}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Search wavenumber, ppm shift, or functional group"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 1740, 4.12, Carbonyl, Aromatic, O–H..."
            className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs sm:text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'IR', '1H NMR', '13C NMR'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModeFilter(m)}
              aria-pressed={modeFilter === m}
              className={`min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                modeFilter === m
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F9FAFB] text-slate-700 border border-slate-200 hover:border-orange-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-600">
          No spectroscopy bands matched "{query}". Clear the search or switch mode to "All".
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-2.5">
            {rows.map((r, i) => (
              <div key={i} className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#EA580C]">{r.mode}</span>
                  <span className="font-mono font-bold text-[#111827]">{r.range}</span>
                </div>
                <div className="font-bold text-sm text-[#111827]">{r.group}</div>
                <p className="text-slate-600 leading-relaxed">{r.notes}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F9FAFB] border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Technique</th>
                  <th className="py-3 px-4">Shift / Wavenumber</th>
                  <th className="py-3 px-4">Functional Group Assignment</th>
                  <th className="py-3 px-4">Diagnostic Exam Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-orange-50/30">
                    <td className="py-2.5 px-4 font-bold text-[#EA580C] whitespace-nowrap">{r.mode}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#111827] whitespace-nowrap">{r.range}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#111827]">{r.group}</td>
                    <td className="py-2.5 px-4 text-slate-600">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ChemistryToolShell>
  );
}

// ============================================================================
// 29. BEER-LAMBERT LAW (A = εlc) & CALIBRATION CURVE PLOTTER
// ============================================================================
export function BeerLambertCalibrationPlotter() {
  const [assayName, setAssayName] = useState('Bradford BSA Assay (595 nm, µg/mL)');
  const [standards, setStandards] = useState([
    { c: 2.0, a: 0.142 },
    { c: 4.0, a: 0.285 },
    { c: 6.0, a: 0.421 },
    { c: 8.0, a: 0.568 },
    { c: 10.0, a: 0.709 },
  ]);
  const [unknownAbs, setUnknownAbs] = useState(0.375);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadBradford = useCallback(() => {
    setAssayName('Bradford BSA Assay (595 nm, µg/mL)');
    setStandards([
      { c: 2.0, a: 0.142 },
      { c: 4.0, a: 0.285 },
      { c: 6.0, a: 0.421 },
      { c: 8.0, a: 0.568 },
      { c: 10.0, a: 0.709 },
    ]);
    setUnknownAbs(0.375);
  }, []);

  const loadNadh = useCallback(() => {
    setAssayName('NADH UV Assay (340 nm, µM · ε = 6,220 M⁻¹cm⁻¹)');
    setStandards([
      { c: 20, a: 0.124 },
      { c: 40, a: 0.249 },
      { c: 80, a: 0.498 },
      { c: 120, a: 0.746 },
    ]);
    setUnknownAbs(0.466);
  }, []);

  const loadCrystalViolet = useCallback(() => {
    setAssayName('Crystal Violet Dye (590 nm, µM)');
    setStandards([
      { c: 1.0, a: 0.115 },
      { c: 2.5, a: 0.288 },
      { c: 5.0, a: 0.576 },
      { c: 7.5, a: 0.862 },
    ]);
    setUnknownAbs(0.415);
  }, []);

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (!detail || detail.slug !== 'beer-lambert-calibration-plotter') return;
      if (typeof detail.assayName === 'string') setAssayName(detail.assayName);
      if (Array.isArray(detail.standards)) {
        const clean = detail.standards.filter(
          (item): item is { c: number; a: number } =>
            typeof item === 'object' && item !== null && typeof item.c === 'number' && typeof item.a === 'number'
        );
        if (clean.length >= 2) setStandards(clean);
      }
      if (typeof detail.unknownAbs === 'number') setUnknownAbs(detail.unknownAbs);
    };
    window.addEventListener('ut-chem-load-preset', onPreset as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', onPreset as EventListener);
  }, []);

  const reg = useMemo(() => {
    const n = standards.length;
    const meanX = standards.reduce((s, p) => s + p.c, 0) / n;
    const meanY = standards.reduce((s, p) => s + p.a, 0) / n;
    let sxx = 0;
    let sxy = 0;
    let syy = 0;
    standards.forEach((p) => {
      sxx += (p.c - meanX) ** 2;
      sxy += (p.c - meanX) * (p.a - meanY);
      syy += (p.a - meanY) ** 2;
    });
    const slope = sxx > 0 ? sxy / sxx : 0;
    const intercept = meanY - slope * meanX;
    const r2 = sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : 1;
    const unknownConc = slope !== 0 ? (unknownAbs - intercept) / slope : 0;
    const transmittancePct = Math.pow(10, -unknownAbs) * 100;
    return { slope, intercept, r2, unknownConc, transmittancePct };
  }, [standards, unknownAbs]);

  const chart = useMemo(() => {
    const w = 440;
    const h = 235;
    const padL = 52;
    const padR = 20;
    const padT = 20;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const maxC = Math.max(1, ...standards.map((s) => s.c), reg.unknownConc) * 1.12;
    const maxA = Math.max(0.1, ...standards.map((s) => s.a), unknownAbs, reg.slope * maxC + reg.intercept) * 1.12;

    const toX = (c: number) => padL + (Math.max(0, c) / maxC) * plotW;
    const toY = (a: number) => padT + (1 - Math.max(0, a) / maxA) * plotH;

    return {
      w,
      h,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      maxC,
      maxA,
      lineX1: toX(0),
      lineY1: toY(reg.intercept),
      lineX2: toX(maxC),
      lineY2: toY(reg.slope * maxC + reg.intercept),
      unkX: toX(reg.unknownConc),
      unkY: toY(unknownAbs),
      toX,
      toY,
    };
  }, [standards, reg, unknownAbs]);

  const handleExportPdf = useCallback(() => {
    const tool = SCIENCE_TOOLS_BY_SLUG['beer-lambert-calibration-plotter'];
    void downloadChemistryStructuredPdf({
      filename: 'beer-lambert-calibration-report.pdf',
      badgeText: 'ANALYTICAL CHEMISTRY · SPECTROPHOTOMETRY',
      title: 'Beer-Lambert Calibration Curve & Unknown Report',
      subtitle: `${assayName} · A = εlc`,
      parameters: [
        { label: 'Assay / Wavelength', value: assayName },
        { label: 'Calibration Standards Count', value: `${standards.length} standard dilutions` },
        { label: 'Unknown Sample Absorbance', value: `${unknownAbs.toFixed(3)} AU (${reg.transmittancePct.toFixed(1)}% T)` },
      ],
      kpis: [
        { label: 'Unknown Concentration', value: `${reg.unknownConc.toFixed(3)} units`, accent: true },
        { label: 'Linear R²', value: reg.r2.toFixed(5) },
        { label: '% Transmittance', value: `${reg.transmittancePct.toFixed(1)}%` },
      ],
      callout: {
        title: `Least-Squares Fit: A = ${reg.slope.toFixed(4)}·c ${reg.intercept >= 0 ? '+' : '−'} ${Math.abs(reg.intercept).toFixed(4)}`,
        body: `Coefficient of determination R² = ${reg.r2.toFixed(5)} (${reg.r2 >= 0.995 ? 'Analytical Grade Linearity' : 'Check Standard Dilutions'}). Unknown absorbance ${unknownAbs.toFixed(3)} AU corresponds to ${reg.transmittancePct.toFixed(2)}% transmittance.`,
        tone: reg.r2 >= 0.995 ? 'emerald' : 'amber',
      },
      svgFigure: svgRef.current
        ? {
            title: 'UV-Vis Standard Calibration Curve (Absorbance vs Concentration)',
            svgElement: svgRef.current,
            maxHeightMm: 64,
          }
        : undefined,
      tables: [
        {
          title: 'Calibration Standards & Unknown Sample Data',
          headers: ['Point', 'Concentration', 'Absorbance (AU)', 'Predicted A'],
          rows: [
            ...standards.map((s, i) => [
              `Standard ${i + 1}`,
              s.c.toFixed(2),
              s.a.toFixed(3),
              (reg.slope * s.c + reg.intercept).toFixed(3),
            ]),
            ['Unknown Sample', reg.unknownConc.toFixed(3), unknownAbs.toFixed(3), unknownAbs.toFixed(3)],
          ],
          colWidths: [1.5, 1.4, 1.4, 1.4],
          monospaceCols: [1, 2, 3],
          alignRightCols: [1, 2, 3],
        },
      ],
      workedExample: tool?.workedExample,
    });
  }, [assayName, standards, unknownAbs, reg]);

  return (
    <ChemistryToolShell
      slug="beer-lambert-calibration-plotter"
      title="Beer-Lambert Law (A = εlc) & Calibration Curve Plotter"
      subtitle="Fit ordinary least-squares UV-Vis calibration curves (R²) and interpolate unknown concentrations"
      presets={[
        { label: 'Bradford Protein (595 nm)', active: assayName.includes('Bradford'), onClick: loadBradford },
        { label: 'NADH UV (340 nm)', active: assayName.includes('NADH'), onClick: loadNadh },
        { label: 'Crystal Violet (590 nm)', active: assayName.includes('Crystal'), onClick: loadCrystalViolet },
      ]}
      onReset={loadBradford}
      onExportPdf={handleExportPdf}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start tabular-nums">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
            <span>Standards Table ({assayName.split('(')[0].trim()})</span>
            <button
              type="button"
              onClick={() => {
                const last = standards[standards.length - 1] || { c: 10, a: 0.7 };
                setStandards([...standards, { c: Number((last.c * 1.2).toFixed(2)), a: Number((last.a * 1.2).toFixed(3)) }]);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Point
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-[11px] font-bold text-slate-500 px-1">
            <span>Conc (x)</span>
            <span>Absorbance (y)</span>
            <span className="sr-only">Remove</span>
          </div>

          {standards.map((pt, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_40px] items-center gap-2">
              <input
                type="number"
                step="any"
                aria-label={`Standard ${idx + 1} concentration`}
                value={pt.c}
                onChange={(e) => {
                  const next = [...standards];
                  next[idx] = { ...pt, c: Number(e.target.value) };
                  setStandards(next);
                }}
                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:border-[#F97316] focus:outline-none"
              />
              <input
                type="number"
                step="any"
                aria-label={`Standard ${idx + 1} absorbance`}
                value={pt.a}
                onChange={(e) => {
                  const next = [...standards];
                  next[idx] = { ...pt, a: Number(e.target.value) };
                  setStandards(next);
                }}
                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:border-[#F97316] focus:outline-none"
              />
              <button
                type="button"
                aria-label={`Delete standard ${idx + 1}`}
                disabled={standards.length <= 2}
                onClick={() => setStandards(standards.filter((_, i) => i !== idx))}
                className="min-h-[40px] flex items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-200">
            <label htmlFor="bl-unknown-abs" className="block text-xs font-bold text-slate-700 mb-1">
              Measured Unknown Absorbance (A)
            </label>
            <input
              id="bl-unknown-abs"
              type="number"
              step={0.005}
              value={unknownAbs}
              onChange={(e) => setUnknownAbs(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 sm:col-span-2">
              <span className="text-xs font-bold text-[#EA580C] block">
                Interpolated Unknown Concentration
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {reg.unknownConc.toFixed(3)} units
              </span>
              <span className="text-xs font-mono text-slate-600 mt-1 block">
                A = {reg.slope.toFixed(4)}·c {reg.intercept >= 0 ? '+' : '−'} {Math.abs(reg.intercept).toFixed(4)}
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 block">Linearity &amp; %T</span>
              <span className="text-lg font-mono font-bold text-emerald-700 block mt-1">
                R² = {reg.r2.toFixed(4)}
              </span>
              <span className="text-xs font-mono text-slate-700 block mt-1">
                {reg.transmittancePct.toFixed(1)}% T
              </span>
            </div>
          </div>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs pb-2">
              <span className="font-bold text-[#111827]">Beer-Lambert Calibration Curve (A vs. c)</span>
              <span className="text-slate-500 font-mono">Orange Crosshair = Unknown</span>
            </div>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chart.w} ${chart.h}`}
              className="w-full h-auto bg-white rounded-xl border border-slate-200"
              role="img"
              aria-label={`Beer-Lambert calibration scatter plot with R squared ${reg.r2.toFixed(4)} and unknown concentration ${reg.unknownConc.toFixed(3)}`}
            >
              {/* Axes */}
              <line x1={chart.padL} y1={chart.padT} x2={chart.padL} y2={chart.padT + chart.plotH} stroke="#64748B" strokeWidth="1.5" />
              <line x1={chart.padL} y1={chart.padT + chart.plotH} x2={chart.w - chart.padR} y2={chart.padT + chart.plotH} stroke="#64748B" strokeWidth="1.5" />

              {/* OLS Best-Fit Line */}
              <line
                x1={chart.lineX1}
                y1={chart.lineY1}
                x2={chart.lineX2}
                y2={chart.lineY2}
                stroke="#0EA5E9"
                strokeWidth="2.4"
              />

              {/* Unknown Crosshairs */}
              <line
                x1={chart.padL}
                y1={chart.unkY}
                x2={chart.unkX}
                y2={chart.unkY}
                stroke="#F97316"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
              <line
                x1={chart.unkX}
                y1={chart.unkY}
                x2={chart.unkX}
                y2={chart.padT + chart.plotH}
                stroke="#F97316"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />

              {/* Standards Dots */}
              {standards.map((pt, i) => (
                <circle
                  key={i}
                  cx={chart.toX(pt.c)}
                  cy={chart.toY(pt.a)}
                  r="4.5"
                  fill="#111827"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              ))}

              {/* Unknown Star/Diamond Marker */}
              <circle
                cx={chart.unkX}
                cy={chart.unkY}
                r="6"
                fill="#F97316"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={Math.min(chart.w - 85, chart.unkX + 8)}
                y={Math.max(chart.padT + 12, chart.unkY - 8)}
                fontSize="10"
                fontWeight="700"
                fontFamily="monospace"
                fill="#EA580C"
              >
                Unknown ({reg.unknownConc.toFixed(2)})
              </text>

              <text x="15" y={chart.padT + chart.plotH / 2} fontSize="11" fontWeight="700" fill="#334155" transform={`rotate(-90 15 ${chart.padT + chart.plotH / 2})`} textAnchor="middle">
                Absorbance (AU)
              </text>
              <text x={chart.padL + chart.plotW / 2} y={chart.h - 10} fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">
                Concentration (units)
              </text>
            </svg>
          </div>
        </div>
      </div>
    </ChemistryToolShell>
  );
}

// ============================================================================
// 30. RADIOACTIVE DECAY, HALF-LIFE & CARBON DATING CALCULATOR
// ============================================================================
export function RadioactiveDecayHalflifeCalculator() {
  const [isotopeName, setIsotopeName] = useState('Phosphorus-32 (³²P)');
  const [n0, setN0] = useState(120);
  const [halfLife, setHalfLife] = useState(14.29);
  const [elapsed, setElapsed] = useState(35.0);
  const [unitLabel, setUnitLabel] = useState('days');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const presets = [
    { label: '³²P (14.29 d)', name: 'Phosphorus-32 (³²P)', n0: 120, hl: 14.29, t: 35, u: 'days' },
    { label: '¹⁴C (5,730 yr)', name: 'Carbon-14 (¹⁴C)', n0: 100, hl: 5730, t: 11460, u: 'years' },
    { label: '¹³¹I (8.02 d)', name: 'Iodine-131 (¹³¹I)', n0: 80, hl: 8.02, t: 24, u: 'days' },
    { label: '⁹⁹ᵐTc (6.01 h)', name: 'Technetium-99m (⁹⁹ᵐTc)', n0: 200, hl: 6.01, t: 18, u: 'hours' },
  ];

  useEffect(() => {
    const onPreset = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (!detail || detail.slug !== 'radioactive-decay-halflife-calculator') return;
      if (typeof detail.isotopeName === 'string') setIsotopeName(detail.isotopeName);
      if (typeof detail.n0 === 'number') setN0(detail.n0);
      if (typeof detail.halfLife === 'number') setHalfLife(detail.halfLife);
      if (typeof detail.elapsed === 'number') setElapsed(detail.elapsed);
      if (typeof detail.unitLabel === 'string') setUnitLabel(detail.unitLabel);
    };
    window.addEventListener('ut-chem-load-preset', onPreset as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', onPreset as EventListener);
  }, []);

  const decay = useMemo(() => {
    const safeN0 = Math.max(1e-6, n0 || 100);
    const hl = Math.max(1e-6, halfLife || 1);
    const tSafe = Math.max(0, elapsed || 0);
    const numHl = tSafe / hl;
    const lambda = Math.LN2 / hl;
    const meanLife = 1 / lambda;
    const remaining = safeN0 * Math.pow(0.5, numHl);
    const pctRemaining = (remaining / safeN0) * 100;
    return { safeN0, hl, tSafe, numHl, lambda, meanLife, remaining, pctRemaining };
  }, [n0, halfLife, elapsed]);

  // SVG First-Order Exponential Decay Curve over 0..max(4 half-lives, 1.15 * elapsed)
  const decayPlot = useMemo(() => {
    const w = 440;
    const h = 215;
    const padL = 52;
    const padR = 20;
    const padT = 18;
    const padB = 36;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const maxHlShown = Math.max(4, Math.ceil(decay.numHl + 0.5));
    const maxT = maxHlShown * decay.hl;

    const toX = (tVal: number) => padL + (tVal / maxT) * plotW;
    const toY = (nVal: number) => padT + (1 - nVal / decay.safeN0) * plotH;

    const pts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const tVal = (i / 48) * maxT;
      const nVal = decay.safeN0 * Math.pow(0.5, tVal / decay.hl);
      pts.push(`${toX(tVal).toFixed(1)},${toY(nVal).toFixed(1)}`);
    }

    const milestones = [1, 2, 3].map((k) => ({
      k,
      x: toX(k * decay.hl),
      y: toY(decay.safeN0 * Math.pow(0.5, k)),
      pct: (100 / Math.pow(2, k)).toFixed(1),
    }));

    return {
      w,
      h,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      polyline: pts.join(' '),
      activeX: toX(decay.tSafe),
      activeY: toY(decay.remaining),
      milestones,
    };
  }, [decay]);

  const handleExportPdf = useCallback(() => {
    const tool = SCIENCE_TOOLS_BY_SLUG['radioactive-decay-halflife-calculator'];
    void downloadChemistryStructuredPdf({
      filename: 'radioactive-decay-halflife-report.pdf',
      badgeText: 'NUCLEAR CHEMISTRY · FIRST-ORDER KINETICS',
      title: `Radioactive Decay & Half-Life Report — ${isotopeName}`,
      subtitle: 'N(t) = N₀ · (½)^(t / t₁/₂) = N₀ · e^(−λt)',
      parameters: [
        { label: 'Isotope / Preset', value: isotopeName },
        { label: 'Initial Activity / Mass (N₀)', value: `${decay.safeN0}` },
        { label: 'Half-Life (t₁/₂)', value: `${decay.hl} ${unitLabel}` },
        { label: 'Elapsed Time (t)', value: `${decay.tSafe} ${unitLabel} (${decay.numHl.toFixed(3)} half-lives)` },
      ],
      kpis: [
        { label: 'Remaining N(t)', value: `${decay.remaining.toFixed(3)} (${decay.pctRemaining.toFixed(2)}%)`, accent: true },
        { label: 'Decay Constant (λ)', value: `${decay.lambda.toExponential(3)} ${unitLabel}⁻¹` },
        { label: 'Mean Lifetime (τ)', value: `${decay.meanLife.toFixed(2)} ${unitLabel}` },
      ],
      svgFigure: svgRef.current
        ? {
            title: 'First-Order Exponential Nuclear Decay Curve',
            svgElement: svgRef.current,
            maxHeightMm: 60,
          }
        : undefined,
      tables: [
        {
          title: 'Half-Life Milestone Schedule',
          headers: ['Milestone', `Time (${unitLabel})`, 'Fraction Left', 'Remaining N(t)'],
          rows: [1, 2, 3, 4, 5].map((k) => [
            `${k} Half-Life${k > 1 ? 's' : ''}`,
            (k * decay.hl).toFixed(2),
            `${(100 / Math.pow(2, k)).toFixed(2)}%`,
            (decay.safeN0 / Math.pow(2, k)).toFixed(3),
          ]),
          colWidths: [1.5, 1.5, 1.3, 1.5],
          monospaceCols: [1, 2, 3],
          alignRightCols: [1, 2, 3],
        },
      ],
      workedExample: tool?.workedExample,
    });
  }, [isotopeName, decay, unitLabel]);

  return (
    <ChemistryToolShell
      slug="radioactive-decay-halflife-calculator"
      title="Radioactive Decay & Half-Life Kinetics Calculator"
      subtitle="N(t) = N₀ · (½)^(t / t₁/₂) · Nuclear medicine & radiocarbon dating decay curve"
      presets={presets.map((p) => ({
        label: p.label,
        active: isotopeName === p.name,
        onClick: () => {
          setIsotopeName(p.name);
          setN0(p.n0);
          setHalfLife(p.hl);
          setElapsed(p.t);
          setUnitLabel(p.u);
        },
      }))}
      onReset={() => {
        setIsotopeName('Phosphorus-32 (³²P)');
        setN0(120);
        setHalfLife(14.29);
        setElapsed(35.0);
        setUnitLabel('days');
      }}
      onExportPdf={handleExportPdf}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 tabular-nums">
        <div>
          <label htmlFor="decay-n0" className="block text-xs font-bold text-slate-700 mb-1">
            Initial Amount / Activity N₀
          </label>
          <input
            id="decay-n0"
            type="number"
            min={0.001}
            step="any"
            value={n0}
            onChange={(e) => setN0(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="decay-hl" className="block text-xs font-bold text-slate-700 mb-1">
            Isotope Half-Life t₁/₂ ({unitLabel})
          </label>
          <input
            id="decay-hl"
            type="number"
            min={0.0001}
            step="any"
            value={halfLife}
            onChange={(e) => setHalfLife(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="decay-t" className="block text-xs font-bold text-slate-700 mb-1">
            Elapsed Time t ({unitLabel})
          </label>
          <input
            id="decay-t"
            type="number"
            min={0}
            step="any"
            value={elapsed}
            onChange={(e) => setElapsed(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch tabular-nums">
        <div className="lg:col-span-5 grid grid-cols-1 gap-3">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
            <span className="text-xs font-bold text-[#EA580C] block">Remaining Isotope N(t)</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#111827] block mt-1">
              {decay.remaining.toFixed(3)} ({decay.pctRemaining.toFixed(2)}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 block">Half-Lives (t / t₁/₂)</span>
              <span className="text-xl font-mono font-bold text-[#111827] block mt-1">
                {decay.numHl.toFixed(3)}
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 block">Decay Constant λ</span>
              <span className="text-sm sm:text-base font-mono font-bold text-emerald-700 block mt-1 break-all">
                {decay.lambda.toExponential(3)} {unitLabel}⁻¹
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs pb-2">
            <span className="font-bold text-[#111827]">First-Order Exponential Decay Curve</span>
            <span className="font-mono text-[#EA580C] font-bold">{isotopeName}</span>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${decayPlot.w} ${decayPlot.h}`}
            className="w-full h-auto bg-white rounded-xl border border-slate-200"
            role="img"
            aria-label={`Exponential decay curve for ${isotopeName} showing ${decay.pctRemaining.toFixed(1)}% remaining at ${decay.tSafe} ${unitLabel}`}
          >
            {/* Axes */}
            <line x1={decayPlot.padL} y1={decayPlot.padT} x2={decayPlot.padL} y2={decayPlot.padT + decayPlot.plotH} stroke="#64748B" strokeWidth="1.5" />
            <line x1={decayPlot.padL} y1={decayPlot.padT + decayPlot.plotH} x2={decayPlot.w - decayPlot.padR} y2={decayPlot.padT + decayPlot.plotH} stroke="#64748B" strokeWidth="1.5" />

            {/* Half-life milestone guides */}
            {decayPlot.milestones.map((m) => (
              <g key={m.k}>
                <line x1={m.x} y1={m.y} x2={m.x} y2={decayPlot.padT + decayPlot.plotH} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                <circle cx={m.x} cy={m.y} r="3.2" fill="#0EA5E9" />
                <text x={m.x} y={decayPlot.padT + decayPlot.plotH + 13} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#64748B">
                  {m.k}·t½
                </text>
              </g>
            ))}

            {/* Decay Curve */}
            <polyline fill="none" stroke="#EA580C" strokeWidth="2.8" strokeLinejoin="round" points={decayPlot.polyline} />

            {/* Active Elapsed Time Marker */}
            <line
              x1={decayPlot.activeX}
              y1={decayPlot.activeY}
              x2={decayPlot.activeX}
              y2={decayPlot.padT + decayPlot.plotH}
              stroke="#111827"
              strokeDasharray="4 3"
              strokeWidth="1.3"
            />
            <circle cx={decayPlot.activeX} cy={decayPlot.activeY} r="5.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x={Math.min(decayPlot.w - 92, decayPlot.activeX + 8)}
              y={Math.max(decayPlot.padT + 14, decayPlot.activeY - 8)}
              fontSize="10"
              fontWeight="700"
              fontFamily="monospace"
              fill="#111827"
            >
              {decay.remaining.toFixed(1)} ({decay.pctRemaining.toFixed(1)}%)
            </text>

            <text x="15" y={decayPlot.padT + decayPlot.plotH / 2} fontSize="11" fontWeight="700" fill="#334155" transform={`rotate(-90 15 ${decayPlot.padT + decayPlot.plotH / 2})`} textAnchor="middle">
              N(t)
            </text>
            <text x={decayPlot.padL + decayPlot.plotW / 2} y={decayPlot.h - 6} fontSize="10.5" fontWeight="700" fill="#334155" textAnchor="middle">
              Elapsed Time ({unitLabel})
            </text>
          </svg>
        </div>
      </div>
    </ChemistryToolShell>
  );
}
