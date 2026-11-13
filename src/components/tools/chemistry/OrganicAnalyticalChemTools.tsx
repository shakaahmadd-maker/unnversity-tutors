import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Plus, Trash2 } from 'lucide-react';
import { parseChemicalFormula } from './GeneralPhysicalChemTools';

// ============================================================================
// 25. NERNST EQUATION & ELECTROCHEMISTRY CELL POTENTIAL SOLVER
// ============================================================================
export function NernstElectrochemistrySolver() {
  const [eCathode, setECathode] = useState(0.34); // Cu2+/Cu
  const [eAnode, setEAnode] = useState(-0.76); // Zn2+/Zn
  const [electronsN, setElectronsN] = useState(2);
  const [reactionQ, setReactionQ] = useState(0.01); // [Zn2+]/[Cu2+]
  const [tempK, setTempK] = useState(298.15);

  const loadExample = () => {
    setECathode(0.34);
    setEAnode(-0.76);
    setElectronsN(2);
    setReactionQ(0.01);
    setTempK(298.15);
  };

  const cell = useMemo(() => {
    const F = 96485.33; // C/mol
    const R = 8.31446;
    const e0Cell = eCathode - eAnode;
    const n = Math.max(1, Math.round(electronsN));
    const qSafe = Math.max(1e-18, reactionQ);
    const eCell = e0Cell - ((R * tempK) / (n * F)) * Math.log(qSafe);
    const deltaG0Kj = (-n * F * e0Cell) / 1000;
    const deltaGKj = (-n * F * eCell) / 1000;
    return { e0Cell, eCell, deltaG0Kj, deltaGKj };
  }, [eCathode, eAnode, electronsN, reactionQ, tempK]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          Galvanic &amp; Electrolytic Cell Potential (Nernst Equation) Solver
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Daniell Zn|Cu Cell</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">E°cathode (V)</label>
          <input
            type="number"
            step={0.01}
            value={eCathode}
            onChange={(e) => setECathode(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">E°anode (V)</label>
          <input
            type="number"
            step={0.01}
            value={eAnode}
            onChange={(e) => setEAnode(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Electrons (n)</label>
          <input
            type="number"
            min={1}
            max={12}
            value={electronsN}
            onChange={(e) => setElectronsN(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Quotient (Q)</label>
          <input
            type="number"
            min={1e-12}
            step="any"
            value={reactionQ}
            onChange={(e) => setReactionQ(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Temp (K)</label>
          <input
            type="number"
            step={1}
            value={tempK}
            onChange={(e) => setTempK(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-[#EA580C] block">
            Non-Standard Cell Voltage (Ecell)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {cell.eCell >= 0 ? '+' : ''}
            {cell.eCell.toFixed(4)} V
          </span>
          <span className="text-xs text-slate-600 block mt-1">
            {cell.eCell > 0 ? 'Spontaneous Galvanic Cell' : 'Non-spontaneous Electrolytic'}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">Standard E°cell</span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {cell.e0Cell >= 0 ? '+' : ''}
            {cell.e0Cell.toFixed(3)} V
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">Free Energy ΔG = −nFE</span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {cell.deltaGKj.toFixed(2)} kJ/mol
          </span>
        </div>
      </div>
    </div>
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
  const [formula, setFormula] = useState('C6H6O'); // Phenol

  const loadExample = () => setFormula('C8H9NO2'); // Acetaminophen

  const ihdData = useMemo(() => {
    const counts = parseChemicalFormula(formula);
    if (!counts) return null;
    const C = counts.C || 0;
    const H = counts.H || 0;
    const N = counts.N || 0;
    const X = (counts.F || 0) + (counts.Cl || 0) + (counts.Br || 0) + (counts.I || 0);
    const ihd = (2 * C + 2 + N - H - X) / 2;
    return { C, H, N, O: counts.O || 0, X, ihd };
  }, [formula]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          {['C6H6', 'C6H12O6', 'C8H9NO2', 'C9H8O4', 'C7H7Cl'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormula(f)}
              className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 text-xs font-mono font-bold cursor-pointer"
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Acetaminophen (C₈H₉NO₂)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Organic Molecular Formula
          </label>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-base focus:border-[#F97316] focus:outline-none"
          />
        </div>

        {ihdData && (
          <div className="lg:col-span-7 bg-[#FFF7ED] border border-orange-200 rounded-2xl p-6 space-y-2 tabular-nums">
            <span className="text-xs font-bold text-[#EA580C] block">
              Index of Hydrogen Deficiency (IHD = Rings + π Bonds)
            </span>
            <p className="text-3xl font-mono font-bold text-[#111827]">
              IHD = {ihdData.ihd}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {ihdData.ihd >= 4
                ? 'IHD ≥ 4 strongly suggests a benzene / aromatic ring (1 ring + 3 π bonds = 4) plus additional unsaturation.'
                : ihdData.ihd === 0
                ? 'Fully saturated acyclic structure (no rings or π bonds).'
                : `Total sum of rings + double bonds + 2×(triple bonds) equals ${ihdData.ihd}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 28. IR & ¹H / ¹³C NMR SPECTROSCOPY PEAK LOOKUP TOOL
// ============================================================================
const SPECTRA_DB = [
  { mode: 'IR', range: '3200–3550 cm⁻¹ (broad)', group: 'Alcohol O–H stretch (H-bonded)', notes: 'Unmistakable smooth parabolic trough' },
  { mode: 'IR', range: '2500–3300 cm⁻¹ (very broad)', group: 'Carboxylic Acid O–H stretch', notes: 'Overlaps C–H sp³ peaks; paired with C=O ~1710 cm⁻¹' },
  { mode: 'IR', range: '2210–2260 cm⁻¹ (sharp)', group: 'Nitrile C≡N or Alkyne C≡C', notes: 'Diagnostic triple-bond window' },
  { mode: 'IR', range: '1705–1750 cm⁻¹ (strong)', group: 'Carbonyl C=O (Ketone, Ester, Aldehyde)', notes: 'Esters ~1735–1750; Ketones ~1715; Conjugated ~1685' },
  { mode: '1H NMR', range: '9.5–10.2 ppm (s)', group: 'Aldehyde –CHO proton', notes: 'Strongly deshielded by carbonyl anisotropy' },
  { mode: '1H NMR', range: '10.5–12.5 ppm (broad s)', group: 'Carboxylic Acid –COOH proton', notes: 'Exchangeable with D₂O' },
  { mode: '1H NMR', range: '6.8–8.2 ppm (m/d)', group: 'Aromatic Ar–H protons', notes: 'Para-disubstituted ring gives clean pair of doublets' },
  { mode: '1H NMR', range: '3.3–4.3 ppm', group: 'α-Protons next to –O– or Halogen (–OCH₂–)', notes: 'Inductive deshielding by electronegative O/Cl/Br' },
  { mode: '13C NMR', range: '190–215 ppm', group: 'Ketone or Aldehyde Carbonyl C=O', notes: 'Most downfield ¹³C signals' },
  { mode: '13C NMR', range: '165–180 ppm', group: 'Ester, Amide, or Carboxylic Acid C=O', notes: 'Shielded vs ketone due to heteroatom lone-pair donation' },
  { mode: '13C NMR', range: '115–150 ppm', group: 'sp² Alkene / Aromatic Carbons', notes: 'Count unique signals to assess molecular symmetry' },
];

export function IrNmrSpectroscopyLookup() {
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'All' | 'IR' | '1H NMR' | '13C NMR'>('All');

  const rows = SPECTRA_DB.filter((r) => {
    if (modeFilter !== 'All' && r.mode !== modeFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.range.toLowerCase().includes(q) ||
      r.group.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wavenumber (1715), ppm (9.8), or functional group..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs sm:text-sm focus:border-[#F97316] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'IR', '1H NMR', '13C NMR'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModeFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                modeFilter === m
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F9FAFB] text-slate-700 border border-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setModeFilter('All');
              setQuery('Carbonyl');
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Carbonyl</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-x-auto">
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
                <td className="py-2.5 px-4 font-bold text-[#EA580C]">{r.mode}</td>
                <td className="py-2.5 px-4 font-mono font-bold text-[#111827]">{r.range}</td>
                <td className="py-2.5 px-4 font-semibold text-[#111827]">{r.group}</td>
                <td className="py-2.5 px-4 text-slate-600">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 29. BEER-LAMBERT LAW (A = εlc) & CALIBRATION CURVE PLOTTER
// ============================================================================
export function BeerLambertCalibrationPlotter() {
  const [standards, setStandards] = useState([
    { c: 2.0, a: 0.142 },
    { c: 4.0, a: 0.285 },
    { c: 6.0, a: 0.421 },
    { c: 8.0, a: 0.568 },
    { c: 10.0, a: 0.709 },
  ]);
  const [unknownAbs, setUnknownAbs] = useState(0.375);

  const loadExample = () => {
    setStandards([
      { c: 2.0, a: 0.142 },
      { c: 4.0, a: 0.285 },
      { c: 6.0, a: 0.421 },
      { c: 8.0, a: 0.568 },
      { c: 10.0, a: 0.709 },
    ]);
    setUnknownAbs(0.375);
  };

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
    return { slope, intercept, r2, unknownConc };
  }, [standards, unknownAbs]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          UV-Vis Spectrophotometry Linear Regression (A = εlc) &amp; Unknown Solver
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Bradford Assay Standards</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start tabular-nums">
        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-1">
            <span>Standard Conc (µM or µg/mL) vs. Absorbance</span>
            <button
              type="button"
              onClick={() => setStandards([...standards, { c: 12, a: 0.85 }])}
              className="inline-flex items-center gap-1 text-[#EA580C] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Point
            </button>
          </div>
          {standards.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={pt.c}
                onChange={(e) => {
                  const next = [...standards];
                  next[idx] = { ...pt, c: Number(e.target.value) };
                  setStandards(next);
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
              />
              <input
                type="number"
                step="any"
                value={pt.a}
                onChange={(e) => {
                  const next = [...standards];
                  next[idx] = { ...pt, a: Number(e.target.value) };
                  setStandards(next);
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
              />
              <button
                type="button"
                disabled={standards.length <= 2}
                onClick={() => setStandards(standards.filter((_, i) => i !== idx))}
                className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Measured Unknown Absorbance (A)
            </label>
            <input
              type="number"
              step={0.005}
              value={unknownAbs}
              onChange={(e) => setUnknownAbs(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
            <span className="text-xs font-bold text-[#EA580C] block">
              Interpolated Unknown Concentration
            </span>
            <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
              {reg.unknownConc.toFixed(3)} units
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Least-Squares Line Fit</span>
            <p className="text-sm font-mono font-bold text-[#111827]">
              A = {reg.slope.toFixed(4)}·c {reg.intercept >= 0 ? '+' : '−'}{' '}
              {Math.abs(reg.intercept).toFixed(4)}
            </p>
            <p className="text-xs font-mono text-emerald-700 font-bold">
              Coefficient of Determination R² = {reg.r2.toFixed(5)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 30. RADIOACTIVE DECAY, HALF-LIFE & CARBON DATING CALCULATOR
// ============================================================================
export function RadioactiveDecayHalflifeCalculator() {
  const [n0, setN0] = useState(120);
  const [halfLife, setHalfLife] = useState(14.29); // P-32 days
  const [elapsed, setElapsed] = useState(35.0);
  const [unitLabel, setUnitLabel] = useState('days');

  const presets = [
    { label: '³²P (14.29 d)', hl: 14.29, t: 35, u: 'days' },
    { label: '¹⁴C (5,730 yr)', hl: 5730, t: 11460, u: 'years' },
    { label: '¹³¹I (8.02 d)', hl: 8.02, t: 24, u: 'days' },
    { label: '⁹⁹ᵐTc (6.01 h)', hl: 6.01, t: 18, u: 'hours' },
  ];

  const decay = useMemo(() => {
    const hl = Math.max(1e-6, halfLife);
    const numHl = elapsed / hl;
    const lambda = Math.LN2 / hl;
    const remaining = n0 * Math.pow(0.5, numHl);
    const pctRemaining = n0 > 0 ? (remaining / n0) * 100 : 0;
    return { numHl, lambda, remaining, pctRemaining };
  }, [n0, halfLife, elapsed]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setHalfLife(p.hl);
                setElapsed(p.t);
                setUnitLabel(p.u);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setN0(100);
            setHalfLife(5730);
            setElapsed(17190);
            setUnitLabel('years');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load ¹⁴C Radiocarbon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Initial Amount / Activity N₀
          </label>
          <input
            type="number"
            min={0.001}
            step="any"
            value={n0}
            onChange={(e) => setN0(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Isotope Half-Life t₁/₂ ({unitLabel})
          </label>
          <input
            type="number"
            min={0.0001}
            step="any"
            value={halfLife}
            onChange={(e) => setHalfLife(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Elapsed Time t ({unitLabel})
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={elapsed}
            onChange={(e) => setElapsed(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-[#EA580C] block">Remaining Isotope N(t)</span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {decay.remaining.toFixed(3)} ({decay.pctRemaining.toFixed(2)}%)
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">Half-Lives Elapsed (t / t₁/₂)</span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {decay.numHl.toFixed(3)}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">
            Decay Constant λ = ln(2)/t₁/₂
          </span>
          <span className="text-xl font-mono font-bold text-emerald-700">
            {decay.lambda.toExponential(3)} {unitLabel}⁻¹
          </span>
        </div>
      </div>
    </div>
  );
}
