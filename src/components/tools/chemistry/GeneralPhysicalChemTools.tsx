import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

// ============================================================================
// SHARED ATOMIC MASS & PERIODIC ELEMENT DATA
// ============================================================================
export interface ElementInfo {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  category: string;
  en: number | null;
  config: string;
  oxStates: string;
}

export const ELEMENTS_DATA: ElementInfo[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, category: 'Nonmetal', en: 2.2, config: '1s¹', oxStates: '+1, -1' },
  { z: 2, symbol: 'He', name: 'Helium', mass: 4.0026, group: 18, period: 1, category: 'Noble Gas', en: null, config: '1s²', oxStates: '0' },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, group: 1, period: 2, category: 'Alkali Metal', en: 0.98, config: '[He] 2s¹', oxStates: '+1' },
  { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, group: 2, period: 2, category: 'Alkaline Earth', en: 1.57, config: '[He] 2s²', oxStates: '+2' },
  { z: 5, symbol: 'B', name: 'Boron', mass: 10.81, group: 13, period: 2, category: 'Metalloid', en: 2.04, config: '[He] 2s² 2p¹', oxStates: '+3' },
  { z: 6, symbol: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, category: 'Nonmetal', en: 2.55, config: '[He] 2s² 2p²', oxStates: '+4, +2, -4' },
  { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, category: 'Nonmetal', en: 3.04, config: '[He] 2s² 2p³', oxStates: '+5, +3, -3' },
  { z: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, category: 'Nonmetal', en: 3.44, config: '[He] 2s² 2p⁴', oxStates: '-2, -1' },
  { z: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, group: 17, period: 2, category: 'Halogen', en: 3.98, config: '[He] 2s² 2p⁵', oxStates: '-1' },
  { z: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, group: 18, period: 2, category: 'Noble Gas', en: null, config: '[He] 2s² 2p⁶', oxStates: '0' },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, group: 1, period: 3, category: 'Alkali Metal', en: 0.93, config: '[Ne] 3s¹', oxStates: '+1' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, category: 'Alkaline Earth', en: 1.31, config: '[Ne] 3s²', oxStates: '+2' },
  { z: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, group: 13, period: 3, category: 'Post-Transition', en: 1.61, config: '[Ne] 3s² 3p¹', oxStates: '+3' },
  { z: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, group: 14, period: 3, category: 'Metalloid', en: 1.9, config: '[Ne] 3s² 3p²', oxStates: '+4, -4' },
  { z: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, group: 15, period: 3, category: 'Nonmetal', en: 2.19, config: '[Ne] 3s² 3p³', oxStates: '+5, +3, -3' },
  { z: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, group: 16, period: 3, category: 'Nonmetal', en: 2.58, config: '[Ne] 3s² 3p⁴', oxStates: '+6, +4, -2' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, group: 17, period: 3, category: 'Halogen', en: 3.16, config: '[Ne] 3s² 3p⁵', oxStates: '+7, +5, +1, -1' },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, category: 'Noble Gas', en: null, config: '[Ne] 3s² 3p⁶', oxStates: '0' },
  { z: 19, symbol: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, category: 'Alkali Metal', en: 0.82, config: '[Ar] 4s¹', oxStates: '+1' },
  { z: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, category: 'Alkaline Earth', en: 1.0, config: '[Ar] 4s²', oxStates: '+2' },
  { z: 21, symbol: 'Sc', name: 'Scandium', mass: 44.956, group: 3, period: 4, category: 'Transition Metal', en: 1.36, config: '[Ar] 3d¹ 4s²', oxStates: '+3' },
  { z: 22, symbol: 'Ti', name: 'Titanium', mass: 47.867, group: 4, period: 4, category: 'Transition Metal', en: 1.54, config: '[Ar] 3d² 4s²', oxStates: '+4, +3' },
  { z: 23, symbol: 'V', name: 'Vanadium', mass: 50.942, group: 5, period: 4, category: 'Transition Metal', en: 1.63, config: '[Ar] 3d³ 4s²', oxStates: '+5, +4, +3, +2' },
  { z: 24, symbol: 'Cr', name: 'Chromium', mass: 51.996, group: 6, period: 4, category: 'Transition Metal', en: 1.66, config: '[Ar] 3d⁵ 4s¹', oxStates: '+6, +3, +2' },
  { z: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, group: 7, period: 4, category: 'Transition Metal', en: 1.55, config: '[Ar] 3d⁵ 4s²', oxStates: '+7, +4, +2' },
  { z: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, category: 'Transition Metal', en: 1.83, config: '[Ar] 3d⁶ 4s²', oxStates: '+3, +2' },
  { z: 27, symbol: 'Co', name: 'Cobalt', mass: 58.933, group: 9, period: 4, category: 'Transition Metal', en: 1.88, config: '[Ar] 3d⁷ 4s²', oxStates: '+3, +2' },
  { z: 28, symbol: 'Ni', name: 'Nickel', mass: 58.693, group: 10, period: 4, category: 'Transition Metal', en: 1.91, config: '[Ar] 3d⁸ 4s²', oxStates: '+2, +3' },
  { z: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, category: 'Transition Metal', en: 1.9, config: '[Ar] 3d¹⁰ 4s¹', oxStates: '+2, +1' },
  { z: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, group: 12, period: 4, category: 'Transition Metal', en: 1.65, config: '[Ar] 3d¹⁰ 4s²', oxStates: '+2' },
  { z: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, group: 13, period: 4, category: 'Post-Transition', en: 1.81, config: '[Ar] 3d¹⁰ 4s² 4p¹', oxStates: '+3' },
  { z: 32, symbol: 'Ge', name: 'Germanium', mass: 72.63, group: 14, period: 4, category: 'Metalloid', en: 2.01, config: '[Ar] 3d¹⁰ 4s² 4p²', oxStates: '+4, +2' },
  { z: 33, symbol: 'As', name: 'Arsenic', mass: 74.922, group: 15, period: 4, category: 'Metalloid', en: 2.18, config: '[Ar] 3d¹⁰ 4s² 4p³', oxStates: '+5, +3, -3' },
  { z: 34, symbol: 'Se', name: 'Selenium', mass: 78.971, group: 16, period: 4, category: 'Nonmetal', en: 2.55, config: '[Ar] 3d¹⁰ 4s² 4p⁴', oxStates: '+6, +4, -2' },
  { z: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, category: 'Halogen', en: 2.96, config: '[Ar] 3d¹⁰ 4s² 4p⁵', oxStates: '+5, +1, -1' },
  { z: 36, symbol: 'Kr', name: 'Krypton', mass: 83.798, group: 18, period: 4, category: 'Noble Gas', en: 3.0, config: '[Ar] 3d¹⁰ 4s² 4p⁶', oxStates: '+2, 0' },
  { z: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, group: 11, period: 5, category: 'Transition Metal', en: 1.93, config: '[Kr] 4d¹⁰ 5s¹', oxStates: '+1' },
  { z: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, group: 14, period: 5, category: 'Post-Transition', en: 1.96, config: '[Kr] 4d¹⁰ 5s² 5p²', oxStates: '+4, +2' },
  { z: 53, symbol: 'I', name: 'Iodine', mass: 126.9, group: 17, period: 5, category: 'Halogen', en: 2.66, config: '[Kr] 4d¹⁰ 5s² 5p⁵', oxStates: '+7, +5, +1, -1' },
  { z: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, group: 18, period: 5, category: 'Noble Gas', en: 2.6, config: '[Kr] 4d¹⁰ 5s² 5p⁶', oxStates: '+6, +4, +2, 0' },
  { z: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, group: 2, period: 6, category: 'Alkaline Earth', en: 0.89, config: '[Xe] 6s²', oxStates: '+2' },
  { z: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, group: 10, period: 6, category: 'Transition Metal', en: 2.28, config: '[Xe] 4f¹⁴ 5d⁹ 6s¹', oxStates: '+4, +2' },
  { z: 79, symbol: 'Au', name: 'Gold', mass: 196.97, group: 11, period: 6, category: 'Transition Metal', en: 2.54, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', oxStates: '+3, +1' },
  { z: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, group: 12, period: 6, category: 'Transition Metal', en: 2.0, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', oxStates: '+2, +1' },
  { z: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, group: 14, period: 6, category: 'Post-Transition', en: 2.33, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', oxStates: '+4, +2' },
  { z: 92, symbol: 'U', name: 'Uranium', mass: 238.03, group: 3, period: 7, category: 'Actinide', en: 1.38, config: '[Rn] 5f³ 6d¹ 7s²', oxStates: '+6, +4' },
];

export const ATOMIC_MASS_MAP: Record<string, number> = ELEMENTS_DATA.reduce((acc, el) => {
  acc[el.symbol] = el.mass;
  return acc;
}, {} as Record<string, number>);

export function parseChemicalFormula(formula: string): Record<string, number> | null {
  const cleaned = formula.trim().replace(/·|\*/g, '.');
  if (!cleaned) return null;

  const parts = cleaned.split('.');
  const totalCounts: Record<string, number> = {};

  for (const part of parts) {
    let leadingMult = 1;
    let rest = part.trim();
    const leadMatch = rest.match(/^(\d+)(.*)$/);
    if (leadMatch) {
      leadingMult = parseInt(leadMatch[1], 10);
      rest = leadMatch[2];
    }

    const stack: Record<string, number>[] = [{}];
    let i = 0;
    while (i < rest.length) {
      const ch = rest[i];
      if (ch === '(' || ch === '[') {
        stack.push({});
        i++;
      } else if (ch === ')' || ch === ']') {
        i++;
        let numStr = '';
        while (i < rest.length && /\d/.test(rest[i])) {
          numStr += rest[i++];
        }
        const mult = numStr ? parseInt(numStr, 10) : 1;
        const popped = stack.pop();
        if (!popped || stack.length === 0) return null;
        const top = stack[stack.length - 1];
        for (const [el, cnt] of Object.entries(popped)) {
          top[el] = (top[el] || 0) + cnt * mult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch;
        i++;
        while (i < rest.length && /[a-z]/.test(rest[i])) {
          sym += rest[i++];
        }
        if (!ATOMIC_MASS_MAP[sym]) return null;
        let numStr = '';
        while (i < rest.length && /\d/.test(rest[i])) {
          numStr += rest[i++];
        }
        const cnt = numStr ? parseInt(numStr, 10) : 1;
        const top = stack[stack.length - 1];
        top[sym] = (top[sym] || 0) + cnt;
      } else {
        return null;
      }
    }

    if (stack.length !== 1) return null;
    for (const [el, cnt] of Object.entries(stack[0])) {
      totalCounts[el] = (totalCounts[el] || 0) + cnt * leadingMult;
    }
  }

  return Object.keys(totalCounts).length > 0 ? totalCounts : null;
}

// ============================================================================
// 15. INTERACTIVE PERIODIC TABLE & PERIODIC TRENDS EXPLORER
// ============================================================================
export function InteractivePeriodicTable() {
  const [selectedSymbol, setSelectedSymbol] = useState('Fe');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = [
    'All',
    'Nonmetal',
    'Alkali Metal',
    'Alkaline Earth',
    'Transition Metal',
    'Metalloid',
    'Halogen',
    'Noble Gas',
  ];

  const activeEl =
    ELEMENTS_DATA.find((e) => e.symbol === selectedSymbol) || ELEMENTS_DATA[0];

  const filtered = ELEMENTS_DATA.filter((el) => {
    const matchCat = categoryFilter === 'All' || el.category === categoryFilter;
    if (!matchCat) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase() === q ||
      String(el.z) === q
    );
  });

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, name, or Z..."
            className="px-3.5 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs font-medium focus:border-[#F97316] focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs font-bold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedSymbol('Cu');
            setCategoryFilter('All');
            setSearch('');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (Copper d¹⁰s¹)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filtered.map((el) => {
            const isSelected = el.symbol === activeEl.symbol;
            return (
              <button
                key={el.z}
                type="button"
                onClick={() => setSelectedSymbol(el.symbol)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer tabular-nums ${
                  isSelected
                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                    : 'bg-[#F9FAFB] hover:bg-[#FFF7ED] border-slate-200 hover:border-orange-300 text-[#111827]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                  <span>{el.z}</span>
                  <span>{el.en ?? '—'}</span>
                </div>
                <div className="text-base font-display font-bold leading-tight mt-0.5">
                  {el.symbol}
                </div>
                <div className="text-[10px] truncate opacity-85">{el.name}</div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-4 bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-3 tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EA580C]">{activeEl.category}</span>
            <span className="text-xs font-mono font-bold text-slate-500">Z = {activeEl.z}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-display font-bold text-[#111827]">
              {activeEl.symbol}
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">{activeEl.name}</h3>
              <p className="text-xs font-mono text-slate-600">{activeEl.mass} g/mol</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between">
              <span className="text-slate-500 font-semibold">Electron Config</span>
              <span className="font-mono font-bold text-[#111827]">{activeEl.config}</span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between">
              <span className="text-slate-500 font-semibold">Pauling Electronegativity</span>
              <span className="font-mono font-bold text-[#EA580C]">
                {activeEl.en !== null ? activeEl.en.toFixed(2) : 'Inert / N/A'}
              </span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between">
              <span className="text-slate-500 font-semibold">Common Oxidation States</span>
              <span className="font-mono font-bold text-[#111827]">{activeEl.oxStates}</span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between">
              <span className="text-slate-500 font-semibold">Period / Group</span>
              <span className="font-mono font-bold text-[#111827]">
                Period {activeEl.period} · Group {activeEl.group}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 16. MOLAR MASS, PERCENT COMPOSITION & MOLE CONVERTER
// ============================================================================
export function MolarMassCalculator() {
  const [formula, setFormula] = useState('CuSO4*5H2O');
  const [sampleGrams, setSampleGrams] = useState(12.5);

  const loadExample = () => {
    setFormula('Ca(OH)2');
    setSampleGrams(18.52);
  };

  const result = useMemo(() => {
    const counts = parseChemicalFormula(formula);
    if (!counts) return null;
    let molarMass = 0;
    const breakdown = Object.entries(counts).map(([sym, count]) => {
      const atomicMass = ATOMIC_MASS_MAP[sym] || 0;
      const subtotal = atomicMass * count;
      molarMass += subtotal;
      return { sym, count, atomicMass, subtotal, pct: 0 };
    });
    breakdown.forEach((b) => {
      b.pct = molarMass > 0 ? (b.subtotal / molarMass) * 100 : 0;
    });
    const moles = molarMass > 0 ? sampleGrams / molarMass : 0;
    const molecules = moles * 6.02214076e23;
    return { molarMass, breakdown, moles, molecules };
  }, [formula, sampleGrams]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          {['CuSO4*5H2O', 'C6H12O6', 'Ca(OH)2', 'KMnO4', 'NaHCO3'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setFormula(preset)}
              className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 text-xs font-mono font-bold text-[#111827] cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chemical Formula (Case-Sensitive)
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. C6H12O6 or CuSO4*5H2O"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sample Mass (grams)
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={sampleGrams}
              onChange={(e) => setSampleGrams(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 tabular-nums">
          {!result ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Enter a valid IUPAC-capitalized formula (e.g., NaCl, Ca(OH)2, CuSO4*5H2O).</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-[#EA580C] block">Molar Mass (M)</span>
                  <span className="text-xl font-mono font-bold text-[#111827]">
                    {result.molarMass.toFixed(3)} g/mol
                  </span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-500 block">Moles (n)</span>
                  <span className="text-xl font-mono font-bold text-[#111827]">
                    {result.moles.toFixed(4)} mol
                  </span>
                </div>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Formula Units / Molecules
                  </span>
                  <span className="text-xl font-mono font-bold text-emerald-700">
                    {result.molecules.toExponential(3)}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F9FAFB] border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4">Element</th>
                      <th className="py-2.5 px-4">Atoms</th>
                      <th className="py-2.5 px-4">Subtotal (g/mol)</th>
                      <th className="py-2.5 px-4">Mass %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.breakdown.map((b) => (
                      <tr key={b.sym}>
                        <td className="py-2 px-4 font-mono font-bold text-[#111827]">{b.sym}</td>
                        <td className="py-2 px-4 font-mono">{b.count}</td>
                        <td className="py-2 px-4 font-mono">{b.subtotal.toFixed(3)}</td>
                        <td className="py-2 px-4 font-mono font-bold text-[#EA580C]">
                          {b.pct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 17. CHEMICAL EQUATION BALANCER & STOICHIOMETRY SOLVER
// ============================================================================
function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function balanceEquationString(rawEq: string): {
  balanced: string;
  reactants: { coef: number; formula: string }[];
  products: { coef: number; formula: string }[];
} | null {
  const normalized = rawEq.replace(/=+>|->|→|=/g, '->');
  const sides = normalized.split('->');
  if (sides.length !== 2) return null;

  const leftFormulas = sides[0]
    .split('+')
    .map((s) => s.trim().replace(/^\d+\s*/, ''))
    .filter(Boolean);
  const rightFormulas = sides[1]
    .split('+')
    .map((s) => s.trim().replace(/^\d+\s*/, ''))
    .filter(Boolean);

  if (!leftFormulas.length || !rightFormulas.length) return null;

  const allFormulas = [...leftFormulas, ...rightFormulas];
  const parsed = allFormulas.map(parseChemicalFormula);
  if (parsed.some((p) => !p)) return null;

  const elements = Array.from(
    new Set(parsed.flatMap((p) => Object.keys(p!)))
  );
  const numCols = allFormulas.length;
  const numRows = elements.length;

  // Matrix A of size numRows x numCols where last col is fixed = 1 (then scaled to integer)
  const matrix: number[][] = elements.map((el) =>
    allFormulas.map((_, colIdx) => {
      const sign = colIdx < leftFormulas.length ? 1 : -1;
      return sign * (parsed[colIdx]![el] || 0);
    })
  );

  // Gaussian elimination to RREF
  let lead = 0;
  const rref = matrix.map((r) => [...r]);
  for (let r = 0; r < numRows; r++) {
    if (lead >= numCols) break;
    let i = r;
    while (Math.abs(rref[i][lead]) < 1e-9) {
      i++;
      if (i === numRows) {
        i = r;
        lead++;
        if (lead === numCols) break;
      }
    }
    if (lead === numCols) break;
    [rref[i], rref[r]] = [rref[r], rref[i]];
    const lv = rref[r][lead];
    for (let j = 0; j < numCols; j++) rref[r][j] /= lv;
    for (let k = 0; k < numRows; k++) {
      if (k !== r) {
        const factor = rref[k][lead];
        for (let j = 0; j < numCols; j++) {
          rref[k][j] -= factor * rref[r][j];
        }
      }
    }
    lead++;
  }

  // Extract single nullspace vector assuming last variable = 1
  const sol = new Array(numCols).fill(0);
  sol[numCols - 1] = 1;
  for (let r = numRows - 1; r >= 0; r--) {
    const pivotCol = rref[r].findIndex((v) => Math.abs(v - 1) < 1e-7);
    if (pivotCol !== -1 && pivotCol < numCols - 1) {
      let sum = 0;
      for (let c = pivotCol + 1; c < numCols; c++) {
        sum += rref[r][c] * sol[c];
      }
      sol[pivotCol] = -sum;
    }
  }

  if (sol.some((v) => v <= 1e-6 || !Number.isFinite(v))) return null;

  // Scale floats to smallest positive integers
  let bestScale = 1;
  for (let mult = 1; mult <= 240; mult++) {
    if (sol.every((v) => Math.abs(v * mult - Math.round(v * mult)) < 1e-4)) {
      bestScale = mult;
      break;
    }
  }
  let ints = sol.map((v) => Math.round(v * bestScale));
  const common = ints.reduce((acc, v) => gcd(acc, v), ints[0]);
  ints = ints.map((v) => v / common);

  const reactants = leftFormulas.map((f, idx) => ({ coef: ints[idx], formula: f }));
  const products = rightFormulas.map((f, idx) => ({
    coef: ints[leftFormulas.length + idx],
    formula: f,
  }));

  const fmtSide = (arr: { coef: number; formula: string }[]) =>
    arr.map((x) => `${x.coef > 1 ? x.coef + ' ' : ''}${x.formula}`).join(' + ');

  return {
    balanced: `${fmtSide(reactants)} → ${fmtSide(products)}`,
    reactants,
    products,
  };
}

export function ChemicalEquationBalancer() {
  const [equation, setEquation] = useState('FeS2 + O2 -> Fe2O3 + SO2');

  const examples = [
    'FeS2 + O2 -> Fe2O3 + SO2',
    'C6H12O6 + O2 -> CO2 + H2O',
    'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
    'Al + Fe2O3 -> Al2O3 + Fe',
  ];

  const balancedResult = useMemo(() => balanceEquationString(equation), [equation]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setEquation(ex)}
              className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 text-xs font-mono font-semibold text-slate-700 cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEquation(examples[2])}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Redox Example</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Unbalanced Chemical Reaction (use + and -&gt;)
        </label>
        <input
          type="text"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-sm sm:text-base focus:bg-white focus:border-[#F97316] focus:outline-none"
        />
      </div>

      {!balancedResult ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
          Check formula capitalization and ensure every element appears on both reactant and product sides.
        </div>
      ) : (
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Balanced Lowest-Integer Stoichiometric Equation</span>
          </div>
          <p className="text-xl sm:text-2xl font-mono font-bold text-[#111827] tracking-tight">
            {balancedResult.balanced}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 18. LIMITING REAGENT & PERCENT YIELD CALCULATOR
// ============================================================================
export function LimitingReagentYieldCalculator() {
  const [reactAFormula, setReactAFormula] = useState('N2');
  const [reactACoef, setReactACoef] = useState(1);
  const [reactAGrams, setReactAGrams] = useState(28.0);

  const [reactBFormula, setReactBFormula] = useState('H2');
  const [reactBCoef, setReactBCoef] = useState(3);
  const [reactBGrams, setReactBGrams] = useState(8.0);

  const [prodFormula, setProdFormula] = useState('NH3');
  const [prodCoef, setProdCoef] = useState(2);
  const [actualYieldGrams, setActualYieldGrams] = useState(30.2);

  const loadExample = () => {
    setReactAFormula('N2');
    setReactACoef(1);
    setReactAGrams(28.0);
    setReactBFormula('H2');
    setReactBCoef(3);
    setReactBGrams(8.0);
    setProdFormula('NH3');
    setProdCoef(2);
    setActualYieldGrams(30.2);
  };

  const calc = useMemo(() => {
    const cA = parseChemicalFormula(reactAFormula);
    const cB = parseChemicalFormula(reactBFormula);
    const cP = parseChemicalFormula(prodFormula);
    if (!cA || !cB || !cP) return null;

    const mm = (c: Record<string, number>) =>
      Object.entries(c).reduce((s, [el, cnt]) => s + ATOMIC_MASS_MAP[el] * cnt, 0);

    const mmA = mm(cA);
    const mmB = mm(cB);
    const mmP = mm(cP);

    const molA = reactAGrams / mmA;
    const molB = reactBGrams / mmB;
    const eqA = molA / Math.max(1, reactACoef);
    const eqB = molB / Math.max(1, reactBCoef);

    const isALimiting = eqA <= eqB;
    const extent = Math.min(eqA, eqB);
    const theoMolesProd = extent * prodCoef;
    const theoGramsProd = theoMolesProd * mmP;
    const pctYield = theoGramsProd > 0 ? (actualYieldGrams / theoGramsProd) * 100 : 0;
    const excessLeftGrams = isALimiting
      ? (molB - extent * reactBCoef) * mmB
      : (molA - extent * reactACoef) * mmA;

    return {
      limitingName: isALimiting ? reactAFormula : reactBFormula,
      excessName: isALimiting ? reactBFormula : reactAFormula,
      excessLeftGrams,
      theoMolesProd,
      theoGramsProd,
      pctYield,
    };
  }, [
    reactAFormula,
    reactACoef,
    reactAGrams,
    reactBFormula,
    reactBCoef,
    reactBGrams,
    prodFormula,
    prodCoef,
    actualYieldGrams,
  ]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <p className="text-xs font-mono font-bold text-slate-600">
          Reaction Model: {reactACoef} {reactAFormula} + {reactBCoef} {reactBFormula} → {prodCoef}{' '}
          {prodFormula}
        </p>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Haber Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#EA580C]">Reactant A</span>
          <input
            type="text"
            value={reactAFormula}
            onChange={(e) => setReactAFormula(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            placeholder="Formula A"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={reactACoef}
              onChange={(e) => setReactACoef(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
              title="Coefficient"
            />
            <input
              type="number"
              min={0}
              step="any"
              value={reactAGrams}
              onChange={(e) => setReactAGrams(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
              title="Mass (g)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#EA580C]">Reactant B</span>
          <input
            type="text"
            value={reactBFormula}
            onChange={(e) => setReactBFormula(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            placeholder="Formula B"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={reactBCoef}
              onChange={(e) => setReactBCoef(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            />
            <input
              type="number"
              min={0}
              step="any"
              value={reactBGrams}
              onChange={(e) => setReactBGrams(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700">Target Product &amp; Actual Yield (g)</span>
          <input
            type="text"
            value={prodFormula}
            onChange={(e) => setProdFormula(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={prodCoef}
              onChange={(e) => setProdCoef(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            />
            <input
              type="number"
              min={0}
              step="any"
              value={actualYieldGrams}
              onChange={(e) => setActualYieldGrams(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {calc && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 tabular-nums">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[#EA580C] block">Limiting Reagent</span>
            <span className="text-xl font-mono font-bold text-[#111827]">{calc.limitingName}</span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">Theoretical Yield</span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {calc.theoGramsProd.toFixed(2)} g
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">Percent Yield</span>
            <span className="text-xl font-mono font-bold text-emerald-700">
              {calc.pctYield.toFixed(1)}%
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">
              Unreacted {calc.excessName}
            </span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {calc.excessLeftGrams.toFixed(2)} g
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 19. EMPIRICAL & MOLECULAR FORMULA FINDER
// ============================================================================
export function EmpiricalMolecularFormulaFinder() {
  const [elements, setElements] = useState([
    { sym: 'C', pct: 40.0 },
    { sym: 'H', pct: 6.71 },
    { sym: 'O', pct: 53.29 },
  ]);
  const [expMolarMass, setExpMolarMass] = useState(180.16);

  const loadExample = () => {
    setElements([
      { sym: 'C', pct: 40.0 },
      { sym: 'H', pct: 6.71 },
      { sym: 'O', pct: 53.29 },
    ]);
    setExpMolarMass(180.16);
  };

  const solved = useMemo(() => {
    const valid = elements.filter((e) => ATOMIC_MASS_MAP[e.sym] && e.pct > 0);
    if (!valid.length) return null;
    const moles = valid.map((e) => ({ ...e, mol: e.pct / ATOMIC_MASS_MAP[e.sym] }));
    const minMol = Math.min(...moles.map((m) => m.mol));
    const rawRatios = moles.map((m) => m.mol / minMol);

    let mult = 1;
    for (const k of [1, 2, 3, 4]) {
      if (rawRatios.every((r) => Math.abs(r * k - Math.round(r * k)) < 0.12)) {
        mult = k;
        break;
      }
    }
    const empCounts = moles.map((m, i) => ({
      sym: m.sym,
      count: Math.max(1, Math.round(rawRatios[i] * mult)),
    }));
    const empMass = empCounts.reduce(
      (s, x) => s + ATOMIC_MASS_MAP[x.sym] * x.count,
      0
    );
    const nFactor = Math.max(1, Math.round(expMolarMass / empMass));
    const empStr = empCounts.map((x) => `${x.sym}${x.count > 1 ? x.count : ''}`).join('');
    const molStr = empCounts
      .map((x) => `${x.sym}${x.count * nFactor > 1 ? x.count * nFactor : ''}`)
      .join('');

    return { empStr, molStr, empMass, nFactor };
  }, [elements, expMolarMass]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          Mass Percent / Combustion Analysis → Empirical &amp; Molecular Formula
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Glucose Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-3">
          {elements.map((row, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={row.sym}
                onChange={(e) => {
                  const next = [...elements];
                  next[idx] = { ...row, sym: e.target.value.trim() };
                  setElements(next);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                placeholder="Element (e.g. C)"
              />
              <input
                type="number"
                step="any"
                value={row.pct}
                onChange={(e) => {
                  const next = [...elements];
                  next[idx] = { ...row, pct: Number(e.target.value) };
                  setElements(next);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
                placeholder="Mass % or g"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Experimental Molar Mass (g/mol)
            </label>
            <input
              type="number"
              step="any"
              value={expMolarMass}
              onChange={(e) => setExpMolarMass(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
            />
          </div>
        </div>

        {solved && (
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-500 block">Empirical Formula</span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {solved.empStr}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Empirical Mass: {solved.empMass.toFixed(2)} g/mol
              </span>
            </div>
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-[#EA580C] block">
                Molecular Formula (n = {solved.nFactor})
              </span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {solved.molStr}
              </span>
              <span className="text-xs text-slate-600 mt-1 block">
                {(solved.empMass * solved.nFactor).toFixed(2)} g/mol
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 20. SOLUTION CONCENTRATION CONVERTER (M, m, w/w%, χ, Normality)
// ============================================================================
export function SolutionConcentrationConverter() {
  const [molarity, setMolarity] = useState(2.0);
  const [soluteMm, setSoluteMm] = useState(58.44); // NaCl
  const [densityGml, setDensityGml] = useState(1.08);
  const [equivFactor, setEquivFactor] = useState(1);

  const loadExample = () => {
    setMolarity(2.0);
    setSoluteMm(58.44);
    setDensityGml(1.08);
    setEquivFactor(1);
  };

  const stats = useMemo(() => {
    const massSoln1L = densityGml * 1000; // g per 1 L
    const massSolute = molarity * soluteMm;
    const massSolventG = Math.max(1e-3, massSoln1L - massSolute);
    const molality = molarity / (massSolventG / 1000);
    const massPercent = (massSolute / massSoln1L) * 100;
    const molesWater = massSolventG / 18.015;
    const moleFraction = molarity / (molarity + molesWater);
    const normality = molarity * equivFactor;

    return { molality, massPercent, moleFraction, normality };
  }, [molarity, soluteMm, densityGml, equivFactor]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          Aqueous Solution Unit Interconverter (M ↔ m ↔ % w/w ↔ χ ↔ N)
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load 2.0 M NaCl</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Molarity (M)</label>
          <input
            type="number"
            step={0.1}
            value={molarity}
            onChange={(e) => setMolarity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Solute MM (g/mol)</label>
          <input
            type="number"
            step={0.1}
            value={soluteMm}
            onChange={(e) => setSoluteMm(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Density ρ (g/mL)</label>
          <input
            type="number"
            step={0.01}
            value={densityGml}
            onChange={(e) => setDensityGml(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Equivalents (n-factor)</label>
          <input
            type="number"
            min={1}
            max={6}
            value={equivFactor}
            onChange={(e) => setEquivFactor(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-[#EA580C] block">Molality (m)</span>
          <span className="text-xl font-mono font-bold text-[#111827]">
            {stats.molality.toFixed(3)} mol/kg
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">Mass Percent (% w/w)</span>
          <span className="text-xl font-mono font-bold text-[#111827]">
            {stats.massPercent.toFixed(2)}%
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">Mole Fraction (χ)</span>
          <span className="text-xl font-mono font-bold text-[#111827]">
            {stats.moleFraction.toFixed(4)}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">Normality (N)</span>
          <span className="text-xl font-mono font-bold text-emerald-700">
            {stats.normality.toFixed(2)} eq/L
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 21. pH, pOH & HENDERSON-HASSELBALCH BUFFER CALCULATOR
// ============================================================================
export function PhBufferCalculator() {
  const [pKa, setPKa] = useState(4.76); // Acetic acid
  const [acidConc, setAcidConc] = useState(0.1);
  const [baseConc, setBaseConc] = useState(0.15);

  const loadExample = () => {
    setPKa(4.76);
    setAcidConc(0.1);
    setBaseConc(0.15);
  };

  const ph = pKa + Math.log10(Math.max(1e-9, baseConc) / Math.max(1e-9, acidConc));
  const poh = 14 - ph;
  const hPlus = Math.pow(10, -ph);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Acetate (pKa 4.76)', pka: 4.76 },
            { label: 'Phosphate PBS (pKa₂ 7.21)', pka: 7.21 },
            { label: 'Tris-HCl (pKa 8.07)', pka: 8.07 },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setPKa(b.pka)}
              className="px-3 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Weak Acid pKa</label>
          <input
            type="number"
            step={0.01}
            value={pKa}
            onChange={(e) => setPKa(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">[HA] Weak Acid (M)</label>
          <input
            type="number"
            min={0.0001}
            step={0.01}
            value={acidConc}
            onChange={(e) => setAcidConc(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">[A⁻] Conjugate Base (M)</label>
          <input
            type="number"
            min={0.0001}
            step={0.01}
            value={baseConc}
            onChange={(e) => setBaseConc(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-[#EA580C] block">Buffer pH (25 °C)</span>
          <span className="text-3xl font-mono font-bold text-[#111827]">{ph.toFixed(2)}</span>
          <span className="text-xs text-slate-600 block mt-1">
            Effective buffer range: {(pKa - 1).toFixed(2)} – {(pKa + 1).toFixed(2)}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">pOH (14 − pH)</span>
          <span className="text-3xl font-mono font-bold text-[#111827]">{poh.toFixed(2)}</span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">[H₃O⁺] Hydronium</span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {hPlus.toExponential(2)} M
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 22. ACID-BASE TITRATION CURVE & EQUIVALENCE POINT PLOTTER
// ============================================================================
export function AcidBaseTitrationPlotter() {
  const [acidVolMl, setAcidVolMl] = useState(25);
  const [acidM, setAcidM] = useState(0.1);
  const [pKa, setPKa] = useState(4.76);
  const [baseM, setBaseM] = useState(0.1);

  const loadExample = () => {
    setAcidVolMl(25);
    setAcidM(0.1);
    setPKa(4.76);
    setBaseM(0.1);
  };

  const curve = useMemo(() => {
    const ka = Math.pow(10, -pKa);
    const kw = 1e-14;
    const molesAcid = (acidVolMl / 1000) * acidM;
    const vEqMl = (molesAcid / Math.max(1e-6, baseM)) * 1000;
    const maxV = vEqMl * 1.8;

    const calcPhAt = (vbMl: number) => {
      const totalL = (acidVolMl + vbMl) / 1000;
      const molesBase = (vbMl / 1000) * baseM;
      if (vbMl <= 0.01) {
        const h = Math.sqrt(ka * acidM);
        return -Math.log10(h);
      }
      if (molesBase < molesAcid - 1e-7) {
        const remAcid = molesAcid - molesBase;
        return pKa + Math.log10(molesBase / remAcid);
      }
      if (Math.abs(molesBase - molesAcid) <= 1e-7) {
        const cConj = molesAcid / totalL;
        const kb = kw / ka;
        const oh = Math.sqrt(kb * cConj);
        return 14 + Math.log10(oh);
      }
      const excessOh = (molesBase - molesAcid) / totalL;
      return Math.min(13.8, 14 + Math.log10(excessOh));
    };

    const pts = Array.from({ length: 61 }, (_, i) => {
      const v = (maxV * i) / 60;
      return { v, ph: calcPhAt(v) };
    });

    return {
      vEqMl,
      vHalfMl: vEqMl / 2,
      eqPh: calcPhAt(vEqMl),
      initPh: calcPhAt(0),
      maxV,
      pts,
    };
  }, [acidVolMl, acidM, pKa, baseM]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          Weak Acid Titrated with Strong Base (NaOH) Curve Generator
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load 25 mL CH₃COOH</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Analyte Vol (mL)</label>
          <input
            type="number"
            value={acidVolMl}
            onChange={(e) => setAcidVolMl(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Acid Conc (M)</label>
          <input
            type="number"
            step={0.05}
            value={acidM}
            onChange={(e) => setAcidM(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Acid pKa</label>
          <input
            type="number"
            step={0.1}
            value={pKa}
            onChange={(e) => setPKa(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Titrant NaOH (M)</label>
          <input
            type="number"
            step={0.05}
            value={baseM}
            onChange={(e) => setBaseM(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
        <div className="lg:col-span-8 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <svg viewBox="0 0 460 210" className="w-full h-48">
            <line x1="42" y1="180" x2="440" y2="180" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="42" y1="15" x2="42" y2="180" stroke="#94A3B8" strokeWidth="1.5" />
            <polyline
              fill="none"
              stroke="#F97316"
              strokeWidth="3"
              points={curve.pts
                .map((p) => {
                  const x = 42 + (p.v / curve.maxV) * 395;
                  const y = 180 - (p.ph / 14) * 160;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ')}
            />
            {/* Equivalence marker */}
            <circle
              cx={42 + (curve.vEqMl / curve.maxV) * 395}
              cy={180 - (curve.eqPh / 14) * 160}
              r="5"
              fill="#111827"
            />
            <text x="48" y="28" fontSize="10" fill="#475569" fontFamily="monospace">
              pH 14
            </text>
            <text x="48" y="175" fontSize="10" fill="#475569" fontFamily="monospace">
              pH 0
            </text>
          </svg>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[#EA580C] block">
              Equivalence Point (Veq)
            </span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {curve.vEqMl.toFixed(2)} mL · pH {curve.eqPh.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">
              Half-Equivalence (½Veq)
            </span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {curve.vHalfMl.toFixed(2)} mL · pH = pKa ({pKa.toFixed(2)})
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">Initial Weak Acid pH</span>
            <span className="text-xl font-mono font-bold text-emerald-700">
              pH {curve.initPh.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 23. IDEAL GAS LAW (PV = nRT) & PARTIAL PRESSURE SOLVER
// ============================================================================
export function IdealGasLawSolver() {
  const [solveFor, setSolveFor] = useState<'P' | 'V' | 'n' | 'T'>('P');
  const [pAtm, setPAtm] = useState(1.0);
  const [vL, setVL] = useState(22.414);
  const [nMol, setNMol] = useState(1.0);
  const [tKelvin, setTKelvin] = useState(273.15);

  const R = 0.082057; // L·atm / (mol·K)

  const loadExample = () => {
    setSolveFor('P');
    setVL(10.0);
    setNMol(2.5);
    setTKelvin(298.15);
  };

  const result = useMemo(() => {
    if (solveFor === 'P') return { val: (nMol * R * tKelvin) / Math.max(1e-6, vL), unit: 'atm' };
    if (solveFor === 'V') return { val: (nMol * R * tKelvin) / Math.max(1e-6, pAtm), unit: 'L' };
    if (solveFor === 'n') return { val: (pAtm * vL) / (R * Math.max(1, tKelvin)), unit: 'mol' };
    return { val: (pAtm * vL) / (R * Math.max(1e-6, nMol)), unit: 'K' };
  }, [solveFor, pAtm, vL, nMol, tKelvin]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          {(['P', 'V', 'n', 'T'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSolveFor(k)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                solveFor === k ? 'bg-[#F97316] text-white' : 'text-slate-600'
              }`}
            >
              Solve for {k}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load 298 K Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        {solveFor !== 'P' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pressure P (atm)</label>
            <input
              type="number"
              step="any"
              value={pAtm}
              onChange={(e) => setPAtm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'V' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Volume V (Liters)</label>
            <input
              type="number"
              step="any"
              value={vL}
              onChange={(e) => setVL(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'n' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gas Moles n (mol)</label>
            <input
              type="number"
              step="any"
              value={nMol}
              onChange={(e) => setNMol(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'T' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temperature T (K)</label>
            <input
              type="number"
              step="any"
              value={tKelvin}
              onChange={(e) => setTKelvin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
      </div>

      <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-6 tabular-nums">
        <span className="text-xs font-bold text-[#EA580C] block">
          Ideal Gas State Solution (R = 0.082057 L·atm·mol⁻¹·K⁻¹)
        </span>
        <p className="text-3xl font-mono font-bold text-[#111827] mt-1">
          {solveFor} = {result.val.toFixed(4)} {result.unit}
          {solveFor === 'P' && ` (${(result.val * 101.325).toFixed(2)} kPa)`}
          {solveFor === 'T' && ` (${(result.val - 273.15).toFixed(2)} °C)`}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 24. THERMOCHEMISTRY & GIBBS FREE ENERGY (ΔG = ΔH − TΔS) CALCULATOR
// ============================================================================
export function ThermochemistryGibbsCalculator() {
  const [deltaHKj, setDeltaHKj] = useState(-92.2); // Haber NH3
  const [deltaSJ, setDeltaSJ] = useState(-198.7); // J/(mol·K)
  const [tempK, setTempK] = useState(298.15);

  const loadExample = () => {
    setDeltaHKj(-92.2);
    setDeltaSJ(-198.7);
    setTempK(298.15);
  };

  const thermo = useMemo(() => {
    const deltaGKj = deltaHKj - tempK * (deltaSJ / 1000);
    const keq = Math.exp((-deltaGKj * 1000) / (8.31446 * Math.max(1, tempK)));
    const tCrossK =
      Math.abs(deltaSJ) > 1e-6 ? (deltaHKj * 1000) / deltaSJ : null;

    let regime = '';
    if (deltaHKj < 0 && deltaSJ > 0) regime = 'Spontaneous at ALL temperatures (ΔG < 0 always)';
    else if (deltaHKj > 0 && deltaSJ < 0) regime = 'Non-spontaneous at ALL temperatures (ΔG > 0 always)';
    else if (deltaHKj < 0 && deltaSJ < 0) regime = 'Enthalpy-driven: Spontaneous below crossover T';
    else regime = 'Entropy-driven: Spontaneous above crossover T';

    return { deltaGKj, keq, tCrossK, regime };
  }, [deltaHKj, deltaSJ, tempK]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-display font-bold text-[#111827]">
          Gibbs Free Energy, Equilibrium Constant (Keq) &amp; Spontaneity Solver
        </h2>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Enthalpy ΔH° (kJ/mol)</label>
          <input
            type="number"
            step="any"
            value={deltaHKj}
            onChange={(e) => setDeltaHKj(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Entropy ΔS° (J / mol·K)
          </label>
          <input
            type="number"
            step="any"
            value={deltaSJ}
            onChange={(e) => setDeltaSJ(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Temperature T (K)</label>
          <input
            type="number"
            min={1}
            step="any"
            value={tempK}
            onChange={(e) => setTempK(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-[#EA580C] block">Gibbs Free Energy ΔG</span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {thermo.deltaGKj.toFixed(2)} kJ/mol
          </span>
          <span className="text-xs text-slate-600 block mt-1">
            {thermo.deltaGKj < 0 ? 'Exergonic (Spontaneous)' : 'Endergonic (Non-spontaneous)'}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">Equilibrium Constant Keq</span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {Number.isFinite(thermo.keq) ? thermo.keq.toExponential(3) : 'Overflow (>10³⁰⁰)'}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">Thermodynamic Regime</span>
          <span className="text-xs font-bold text-[#111827] block mt-1">{thermo.regime}</span>
          {thermo.tCrossK && thermo.tCrossK > 0 && (
            <span className="text-xs font-mono text-[#EA580C] block mt-1">
              T(ΔG=0) = {thermo.tCrossK.toFixed(1)} K
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
