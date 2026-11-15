import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { ChemistryToolShell } from './ChemistryToolShell';
import { downloadChemistryStructuredPdf } from '../../../utils/pdfReportGenerator';
import { SCIENCE_TOOLS_BY_SLUG } from '../../../data/scienceToolsRegistry';

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

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'interactive-periodic-table') return;
      if (typeof ce.detail.symbol === 'string') setSelectedSymbol(ce.detail.symbol);
      if (typeof ce.detail.categoryFilter === 'string') setCategoryFilter(ce.detail.categoryFilter);
      if (typeof ce.detail.search === 'string') setSearch(ce.detail.search);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

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

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['interactive-periodic-table'];
    void downloadChemistryStructuredPdf({
      filename: `periodic-table-${activeEl.symbol}.pdf`,
      badgeText: 'CHEMISTRY · PERIODIC TRENDS',
      title: `Element Property Sheet — ${activeEl.name} (${activeEl.symbol})`,
      subtitle: `Atomic Number Z = ${activeEl.z} · ${activeEl.category} · Period ${activeEl.period}, Group ${activeEl.group}`,
      parameters: [
        { label: 'Selected Element', value: `${activeEl.name} (${activeEl.symbol})` },
        { label: 'Active Filter', value: categoryFilter },
      ],
      kpis: [
        { label: 'Atomic Mass', value: `${activeEl.mass} g/mol`, accent: true },
        { label: 'Electron Config', value: activeEl.config },
        { label: 'Pauling EN', value: activeEl.en !== null ? activeEl.en.toFixed(2) : 'Inert' },
      ],
      callout: {
        title: `Oxidation States & Periodicity (${activeEl.symbol})`,
        body: `Common Oxidation States: ${activeEl.oxStates}. Group ${activeEl.group} elements in Period ${activeEl.period} exhibit systematic atomic radius & ionization trends governed by effective nuclear charge (Zeff).`,
        tone: 'orange',
      },
      tables: [
        {
          title: `Filtered Periodic Reference (${filtered.slice(0, 12).length} Elements Shown)`,
          headers: ['Z', 'Sym', 'Element', 'Mass (g/mol)', 'Config', 'EN'],
          rows: filtered.slice(0, 12).map((el) => [
            String(el.z),
            el.symbol,
            el.name,
            String(el.mass),
            el.config,
            el.en !== null ? el.en.toFixed(2) : '—',
          ]),
          monospaceCols: [0, 1, 3, 4, 5],
          alignRightCols: [3, 5],
        },
      ],
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="interactive-periodic-table"
      title="Interactive Periodic Table & Electron Configuration Explorer"
      subtitle="Inspect atomic weights, subshell configurations, Pauling electronegativity, and oxidation states"
      onReset={() => {
        setSelectedSymbol('Fe');
        setCategoryFilter('All');
        setSearch('');
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Cu (d¹⁰s¹ Anomaly)', active: selectedSymbol === 'Cu', onClick: () => setSelectedSymbol('Cu') },
        { label: 'Fe (Iron Z=26)', active: selectedSymbol === 'Fe', onClick: () => setSelectedSymbol('Fe') },
        { label: 'F (Max EN 3.98)', active: selectedSymbol === 'F', onClick: () => setSelectedSymbol('F') },
        { label: 'Pt (Catalyst)', active: selectedSymbol === 'Pt', onClick: () => setSelectedSymbol('Pt') },
        { label: 'U (Actinide)', active: selectedSymbol === 'U', onClick: () => setSelectedSymbol('U') },
      ]}
      headerControls={
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, name, or Z..."
            aria-label="Search elements"
            className="px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs font-medium focus:border-[#F97316] focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter element family"
            className="px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 text-xs font-bold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filtered.map((el) => {
            const isSelected = el.symbol === activeEl.symbol;
            return (
              <button
                key={el.z}
                type="button"
                onClick={() => setSelectedSymbol(el.symbol)}
                className={`p-2 min-h-[58px] rounded-xl border text-left transition-all cursor-pointer tabular-nums ${
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
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-semibold">Electron Config</span>
              <span className="font-mono font-bold text-[#111827]">{activeEl.config}</span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-semibold">Pauling EN</span>
              <span className="font-mono font-bold text-[#EA580C]">
                {activeEl.en !== null ? activeEl.en.toFixed(2) : 'Inert / N/A'}
              </span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-semibold">Oxidation States</span>
              <span className="font-mono font-bold text-[#111827]">{activeEl.oxStates}</span>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-semibold">Period / Group</span>
              <span className="font-mono font-bold text-[#111827]">
                Period {activeEl.period} · Group {activeEl.group}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ChemistryToolShell>
  );
}

// ============================================================================
// 16. MOLAR MASS, PERCENT COMPOSITION & MOLE CONVERTER
// ============================================================================
export function MolarMassCalculator() {
  const [formula, setFormula] = useState('CuSO4*5H2O');
  const [sampleGrams, setSampleGrams] = useState(12.5);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'molar-mass-calculator') return;
      if (typeof ce.detail.formula === 'string') setFormula(ce.detail.formula);
      if (typeof ce.detail.sampleGrams === 'number') setSampleGrams(ce.detail.sampleGrams);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

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

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['molar-mass-calculator'];
    void downloadChemistryStructuredPdf({
      filename: `molar-mass-${formula.replace(/[^A-Za-z0-9]/g, '')}.pdf`,
      badgeText: 'CHEMISTRY · STOICHIOMETRY REPORT',
      title: `Molar Mass & Composition Analysis — ${formula}`,
      subtitle: `Sample Weight: ${sampleGrams} g · Parsed via IUPAC Standard Atomic Weights`,
      parameters: [
        { label: 'Chemical Formula', value: formula },
        { label: 'Sample Mass', value: `${sampleGrams} g` },
      ],
      kpis: result
        ? [
            { label: 'Molar Mass (M)', value: `${result.molarMass.toFixed(3)} g/mol`, accent: true },
            { label: 'Moles (n = m / M)', value: `${result.moles.toFixed(4)} mol` },
            { label: 'Formula Units', value: result.molecules.toExponential(3) },
          ]
        : undefined,
      barsSection: result
        ? {
            title: 'Elemental Percent Composition by Mass (% w/w)',
            bars: result.breakdown.map((b, i) => ({
              label: `${b.sym} (${b.count} atom${b.count > 1 ? 's' : ''} · ${b.subtotal.toFixed(3)} g/mol)`,
              valueText: `${b.pct.toFixed(2)}%`,
              pct: b.pct,
              colorRgb: i === 0 ? [249, 115, 22] : i === 1 ? [16, 185, 129] : [37, 99, 235],
            })),
          }
        : undefined,
      tables: result
        ? [
            {
              title: 'Atomic Weight & Percent Composition Breakdown',
              headers: ['Element', 'Atom Count', 'Atomic Mass', 'Subtotal (g/mol)', 'Mass %'],
              rows: result.breakdown.map((b) => [
                b.sym,
                String(b.count),
                b.atomicMass.toFixed(3),
                b.subtotal.toFixed(3),
                `${b.pct.toFixed(2)}%`,
              ]),
              monospaceCols: [0, 1, 2, 3, 4],
              alignRightCols: [1, 2, 3, 4],
            },
          ]
        : undefined,
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="molar-mass-calculator"
      title="Molar Mass, Hydrate Parser & Mass Percent Calculator"
      subtitle="Supports parentheses like Ca3(PO4)2 and hydrated salts such as CuSO4*5H2O"
      onReset={() => {
        setFormula('CuSO4*5H2O');
        setSampleGrams(12.5);
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'CuSO4*5H2O', active: formula === 'CuSO4*5H2O', onClick: () => setFormula('CuSO4*5H2O') },
        { label: 'C6H12O6 (Glucose)', active: formula === 'C6H12O6', onClick: () => setFormula('C6H12O6') },
        { label: 'Ca(OH)2', active: formula === 'Ca(OH)2', onClick: () => { setFormula('Ca(OH)2'); setSampleGrams(18.52); } },
        { label: 'KMnO4', active: formula === 'KMnO4', onClick: () => setFormula('KMnO4') },
        { label: 'C9H8O4 (Aspirin)', active: formula === 'C9H8O4', onClick: () => { setFormula('C9H8O4'); setSampleGrams(0.325); } },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <label htmlFor="mm-formula" className="block text-xs font-bold text-slate-700 mb-1">
              Chemical Formula (Case-Sensitive)
            </label>
            <input
              id="mm-formula"
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. C6H12O6 or CuSO4*5H2O"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="mm-grams" className="block text-xs font-bold text-slate-700 mb-1">
              Sample Mass (grams)
            </label>
            <input
              id="mm-grams"
              type="number"
              min={0}
              step="any"
              value={sampleGrams}
              onChange={(e) => setSampleGrams(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
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
                    Formula Units
                  </span>
                  <span className="text-xl font-mono font-bold text-emerald-700">
                    {result.molecules.toExponential(3)}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F9FAFB] border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4">Element</th>
                      <th className="py-2.5 px-4">Atoms</th>
                      <th className="py-2.5 px-4">Subtotal</th>
                      <th className="py-2.5 px-4">Mass %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.breakdown.map((b) => (
                      <tr key={b.sym}>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#111827]">{b.sym}</td>
                        <td className="py-2.5 px-4 font-mono">{b.count}</td>
                        <td className="py-2.5 px-4 font-mono">{b.subtotal.toFixed(3)} g/mol</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#EA580C] w-14">
                              {b.pct.toFixed(1)}%
                            </span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
                              <div
                                className="h-full bg-[#F97316] rounded-full"
                                style={{ width: `${Math.min(100, b.pct)}%` }}
                              />
                            </div>
                          </div>
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
    </ChemistryToolShell>
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
  atomLedger: Array<{ element: string; reactantAtoms: number; productAtoms: number }>;
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

  const matrix: number[][] = elements.map((el) =>
    allFormulas.map((_, colIdx) => {
      const sign = colIdx < leftFormulas.length ? 1 : -1;
      return sign * (parsed[colIdx]![el] || 0);
    })
  );

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

  const atomLedger = elements.map((el) => {
    const rSum = leftFormulas.reduce((acc, _, idx) => acc + ints[idx] * (parsed[idx]![el] || 0), 0);
    const pSum = rightFormulas.reduce(
      (acc, _, idx) => acc + ints[leftFormulas.length + idx] * (parsed[leftFormulas.length + idx]![el] || 0),
      0
    );
    return { element: el, reactantAtoms: rSum, productAtoms: pSum };
  });

  const fmtSide = (arr: { coef: number; formula: string }[]) =>
    arr.map((x) => `${x.coef > 1 ? x.coef + ' ' : ''}${x.formula}`).join(' + ');

  return {
    balanced: `${fmtSide(reactants)} → ${fmtSide(products)}`,
    reactants,
    products,
    atomLedger,
  };
}

export function ChemicalEquationBalancer() {
  const [equation, setEquation] = useState('FeS2 + O2 -> Fe2O3 + SO2');

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'chemical-equation-balancer') return;
      if (typeof ce.detail.equation === 'string') setEquation(ce.detail.equation);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const examples = [
    { label: 'Pyrite Roasting (FeS₂)', eq: 'FeS2 + O2 -> Fe2O3 + SO2' },
    { label: 'Cellular Respiration', eq: 'C6H12O6 + O2 -> CO2 + H2O' },
    { label: 'Permanganate Redox', eq: 'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2' },
    { label: 'Thermite Reaction', eq: 'Al + Fe2O3 -> Al2O3 + Fe' },
  ];

  const balancedResult = useMemo(() => balanceEquationString(equation), [equation]);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['chemical-equation-balancer'];
    void downloadChemistryStructuredPdf({
      filename: 'chemical-equation-balancer-report.pdf',
      badgeText: 'CHEMISTRY · EQUATION BALANCER',
      title: 'Balanced Chemical Equation & Atom Conservation Report',
      subtitle: `Input Skeleton: ${equation}`,
      parameters: [
        { label: 'Unbalanced Input', value: equation },
        {
          label: 'Conservation Status',
          value: balancedResult ? 'Exact Integer Nullspace Match' : 'Invalid / Incomplete Skeleton',
        },
      ],
      callout: balancedResult
        ? {
            title: 'Lowest-Integer Balanced Stoichiometric Equation',
            body: balancedResult.balanced,
            tone: 'emerald',
          }
        : undefined,
      tables: balancedResult
        ? [
            {
              title: 'Atom-by-Atom Mass Conservation Audit',
              headers: ['Element', 'Reactant Atoms (LHS)', 'Product Atoms (RHS)', 'Status'],
              rows: balancedResult.atomLedger.map((r) => [
                r.element,
                String(r.reactantAtoms),
                String(r.productAtoms),
                r.reactantAtoms === r.productAtoms ? 'Conserved' : 'Mismatch',
              ]),
              monospaceCols: [0, 1, 2],
              alignRightCols: [1, 2],
            },
          ]
        : undefined,
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="chemical-equation-balancer"
      title="Chemical Equation Balancer & Atom Conservation Ledger"
      subtitle="Exact Gaussian RREF nullspace stoichiometry solver for combustion, synthesis, and redox"
      onReset={() => setEquation('FeS2 + O2 -> Fe2O3 + SO2')}
      onExportPdf={handleExportPdf}
      presets={examples.map((ex) => ({
        label: ex.label,
        active: equation === ex.eq,
        onClick: () => setEquation(ex.eq),
      }))}
    >
      <div>
        <label htmlFor="ceq-input" className="block text-xs font-bold text-slate-700 mb-1.5">
          Unbalanced Chemical Reaction (separate species with + and sides with -&gt;)
        </label>
        <input
          id="ceq-input"
          type="text"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-sm sm:text-base focus:bg-white focus:border-[#F97316] focus:outline-none"
        />
      </div>

      {!balancedResult ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
          Check formula capitalization and ensure every element appears on both reactant and product sides.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Balanced Lowest-Integer Stoichiometric Equation</span>
            </div>
            <p className="text-lg sm:text-2xl font-mono font-bold text-[#111827] tracking-tight break-words">
              {balancedResult.balanced}
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-x-auto tabular-nums">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F9FAFB] border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-4">Element</th>
                  <th className="py-2.5 px-4">Reactants (LHS)</th>
                  <th className="py-2.5 px-4">Products (RHS)</th>
                  <th className="py-2.5 px-4">Balance Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balancedResult.atomLedger.map((row) => (
                  <tr key={row.element}>
                    <td className="py-2 px-4 font-mono font-bold text-[#111827]">{row.element}</td>
                    <td className="py-2 px-4 font-mono">{row.reactantAtoms} atoms</td>
                    <td className="py-2 px-4 font-mono">{row.productAtoms} atoms</td>
                    <td className="py-2 px-4 font-semibold text-emerald-700">✓ Conserved</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ChemistryToolShell>
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

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'limiting-reagent-yield-calculator') return;
      if (typeof ce.detail.reactAFormula === 'string') setReactAFormula(ce.detail.reactAFormula);
      if (typeof ce.detail.reactACoef === 'number') setReactACoef(ce.detail.reactACoef);
      if (typeof ce.detail.reactAGrams === 'number') setReactAGrams(ce.detail.reactAGrams);
      if (typeof ce.detail.reactBFormula === 'string') setReactBFormula(ce.detail.reactBFormula);
      if (typeof ce.detail.reactBCoef === 'number') setReactBCoef(ce.detail.reactBCoef);
      if (typeof ce.detail.reactBGrams === 'number') setReactBGrams(ce.detail.reactBGrams);
      if (typeof ce.detail.prodFormula === 'string') setProdFormula(ce.detail.prodFormula);
      if (typeof ce.detail.prodCoef === 'number') setProdCoef(ce.detail.prodCoef);
      if (typeof ce.detail.actualYieldGrams === 'number') setActualYieldGrams(ce.detail.actualYieldGrams);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const loadHaber = () => {
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

  const loadThermite = () => {
    setReactAFormula('Al');
    setReactACoef(2);
    setReactAGrams(27.0);
    setReactBFormula('Fe2O3');
    setReactBCoef(1);
    setReactBGrams(100.0);
    setProdFormula('Fe');
    setProdCoef(2);
    setActualYieldGrams(51.4);
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
    const pctConsumedA = eqA > 0 ? Math.min(100, (extent / eqA) * 100) : 0;
    const pctConsumedB = eqB > 0 ? Math.min(100, (extent / eqB) * 100) : 0;

    return {
      limitingName: isALimiting ? reactAFormula : reactBFormula,
      excessName: isALimiting ? reactBFormula : reactAFormula,
      molA,
      molB,
      eqA,
      eqB,
      excessLeftGrams,
      theoMolesProd,
      theoGramsProd,
      pctYield,
      pctConsumedA,
      pctConsumedB,
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

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['limiting-reagent-yield-calculator'];
    void downloadChemistryStructuredPdf({
      filename: `limiting-reagent-${reactAFormula}-${reactBFormula}.pdf`,
      badgeText: 'CHEMISTRY · STOICHIOMETRY YIELD',
      title: `Limiting Reagent & Theoretical Yield — ${reactACoef} ${reactAFormula} + ${reactBCoef} ${reactBFormula} → ${prodCoef} ${prodFormula}`,
      subtitle: `Actual Isolated ${prodFormula}: ${actualYieldGrams} g`,
      parameters: [
        { label: `Reactant A (${reactAFormula})`, value: `${reactAGrams} g (Coef: ${reactACoef})` },
        { label: `Reactant B (${reactBFormula})`, value: `${reactBGrams} g (Coef: ${reactBCoef})` },
        { label: `Target Product (${prodFormula})`, value: `Coef: ${prodCoef} · Actual: ${actualYieldGrams} g` },
      ],
      kpis: calc
        ? [
            { label: 'Limiting Reagent', value: calc.limitingName, accent: true },
            { label: 'Theoretical Yield', value: `${calc.theoGramsProd.toFixed(2)} g` },
            { label: 'Percent Yield', value: `${calc.pctYield.toFixed(1)}%` },
            { label: `Excess Left (${calc.excessName})`, value: `${calc.excessLeftGrams.toFixed(2)} g` },
          ]
        : undefined,
      barsSection: calc
        ? {
            title: 'Reactant Consumption Fraction',
            bars: [
              {
                label: `${reactAFormula} (${calc.eqA.toFixed(3)} rxn eq available)`,
                valueText: `${calc.pctConsumedA.toFixed(1)}% consumed`,
                pct: calc.pctConsumedA,
                colorRgb: [249, 115, 22],
              },
              {
                label: `${reactBFormula} (${calc.eqB.toFixed(3)} rxn eq available)`,
                valueText: `${calc.pctConsumedB.toFixed(1)}% consumed`,
                pct: calc.pctConsumedB,
                colorRgb: [16, 185, 129],
              },
            ],
          }
        : undefined,
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="limiting-reagent-yield-calculator"
      title={`Limiting Reagent Solver (${reactACoef} ${reactAFormula} + ${reactBCoef} ${reactBFormula} → ${prodCoef} ${prodFormula})`}
      subtitle="Compare stoichiometric reaction equivalents to find limiting reagent, excess mass, and % yield"
      onReset={loadHaber}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Haber NH₃ (N₂ + 3H₂)', active: reactAFormula === 'N2' && prodFormula === 'NH3', onClick: loadHaber },
        { label: 'Thermite (2Al + Fe₂O₃)', active: reactAFormula === 'Al' && prodFormula === 'Fe', onClick: loadThermite },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 tabular-nums">
        <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-xl p-3.5">
          <span className="text-xs font-bold text-[#EA580C] block">Reactant A</span>
          <div>
            <label htmlFor="lr-fa" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Formula A
            </label>
            <input
              id="lr-fa"
              type="text"
              value={reactAFormula}
              onChange={(e) => setReactAFormula(e.target.value)}
              className="w-full px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="lr-ca" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Coef
              </label>
              <input
                id="lr-ca"
                type="number"
                min={1}
                value={reactACoef}
                onChange={(e) => setReactACoef(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="lr-ga" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mass (g)
              </label>
              <input
                id="lr-ga"
                type="number"
                min={0}
                step="any"
                value={reactAGrams}
                onChange={(e) => setReactAGrams(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-xl p-3.5">
          <span className="text-xs font-bold text-[#EA580C] block">Reactant B</span>
          <div>
            <label htmlFor="lr-fb" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Formula B
            </label>
            <input
              id="lr-fb"
              type="text"
              value={reactBFormula}
              onChange={(e) => setReactBFormula(e.target.value)}
              className="w-full px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="lr-cb" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Coef
              </label>
              <input
                id="lr-cb"
                type="number"
                min={1}
                value={reactBCoef}
                onChange={(e) => setReactBCoef(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="lr-gb" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mass (g)
              </label>
              <input
                id="lr-gb"
                type="number"
                min={0}
                step="any"
                value={reactBGrams}
                onChange={(e) => setReactBGrams(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-xl p-3.5">
          <span className="text-xs font-bold text-emerald-700 block">Target Product &amp; Actual Yield</span>
          <div>
            <label htmlFor="lr-fp" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Product Formula
            </label>
            <input
              id="lr-fp"
              type="text"
              value={prodFormula}
              onChange={(e) => setProdFormula(e.target.value)}
              className="w-full px-3 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="lr-cp" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Coef
              </label>
              <input
                id="lr-cp"
                type="number"
                min={1}
                value={prodCoef}
                onChange={(e) => setProdCoef(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="lr-act" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Actual (g)
              </label>
              <input
                id="lr-act"
                type="number"
                min={0}
                step="any"
                value={actualYieldGrams}
                onChange={(e) => setActualYieldGrams(Number(e.target.value))}
                className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-[#F9FAFB] border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {calc && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[#EA580C] block">Limiting Reagent</span>
            <span className="text-xl font-mono font-bold text-[#111827]">{calc.limitingName}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">100% consumed</span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">Theoretical Yield</span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {calc.theoGramsProd.toFixed(2)} g
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {calc.theoMolesProd.toFixed(3)} mol {prodFormula}
            </span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">Percent Yield</span>
            <span className="text-xl font-mono font-bold text-emerald-700">
              {calc.pctYield.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Actual / Theoretical</span>
          </div>
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-500 block">
              Excess Left ({calc.excessName})
            </span>
            <span className="text-xl font-mono font-bold text-[#111827]">
              {calc.excessLeftGrams.toFixed(2)} g
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Unreacted mass</span>
          </div>
        </div>
      )}
    </ChemistryToolShell>
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

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'empirical-molecular-formula-finder') return;
      if (Array.isArray(ce.detail.elements)) {
        setElements(
          ce.detail.elements.map((item: { sym: string; pct: number }) => ({
            sym: String(item.sym),
            pct: Number(item.pct),
          }))
        );
      }
      if (typeof ce.detail.expMolarMass === 'number') setExpMolarMass(ce.detail.expMolarMass);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const loadGlucose = () => {
    setElements([
      { sym: 'C', pct: 40.0 },
      { sym: 'H', pct: 6.71 },
      { sym: 'O', pct: 53.29 },
    ]);
    setExpMolarMass(180.16);
  };

  const loadCaffeine = () => {
    setElements([
      { sym: 'C', pct: 49.48 },
      { sym: 'H', pct: 5.19 },
      { sym: 'N', pct: 28.85 },
      { sym: 'O', pct: 16.48 },
    ]);
    setExpMolarMass(194.19);
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
      moles: m.mol,
      rawRatio: rawRatios[i],
      pct: m.pct,
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

    return { empStr, molStr, empMass, nFactor, mult, steps: empCounts };
  }, [elements, expMolarMass]);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['empirical-molecular-formula-finder'];
    void downloadChemistryStructuredPdf({
      filename: `empirical-formula-${solved?.molStr || 'result'}.pdf`,
      badgeText: 'CHEMISTRY · COMBUSTION ANALYSIS',
      title: `Empirical & Molecular Formula Determination`,
      subtitle: `Experimental Molar Mass: ${expMolarMass} g/mol`,
      parameters: [
        ...elements.map((e) => ({ label: `Element ${e.sym}`, value: `${e.pct}% or g` })),
        { label: 'Measured Molar Mass', value: `${expMolarMass} g/mol` },
      ],
      kpis: solved
        ? [
            { label: 'Empirical Formula', value: solved.empStr },
            { label: 'Molecular Formula', value: solved.molStr, accent: true },
            { label: 'Scaling Factor (n)', value: String(solved.nFactor) },
          ]
        : undefined,
      tables: solved
        ? [
            {
              title: 'Step-by-Step Mole-Ratio Normalization',
              headers: ['Element', 'Mass / %', 'Moles (m / M)', 'Ratio / Min', `Int (×${solved.mult})`, 'Molecular'],
              rows: solved.steps.map((s) => [
                s.sym,
                s.pct.toFixed(2),
                s.moles.toFixed(4),
                s.rawRatio.toFixed(3),
                String(s.count),
                String(s.count * solved.nFactor),
              ]),
              monospaceCols: [0, 1, 2, 3, 4, 5],
              alignRightCols: [1, 2, 3, 4, 5],
            },
          ]
        : undefined,
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="empirical-molecular-formula-finder"
      title="Mass Percent & Combustion Empirical / Molecular Formula Finder"
      subtitle="Automatically divides by atomic masses, normalizes fractional ratios (×2, ×3, ×4), and scales to MF = (EF)n"
      onReset={loadGlucose}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Glucose (CH₂O → C₆H₁₂O₆)', active: expMolarMass === 180.16, onClick: loadGlucose },
        { label: 'Caffeine (C₄H₅N₂O → C₈H₁₀N₄O₂)', active: expMolarMass === 194.19, onClick: loadCaffeine },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Element Composition Rows</span>
            <button
              type="button"
              onClick={() => setElements([...elements, { sym: 'N', pct: 0 }])}
              className="inline-flex items-center gap-1 text-[#EA580C] hover:underline cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Element
            </button>
          </div>
          {elements.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2.5 items-end">
              <div>
                <label htmlFor={`ef-sym-${idx}`} className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Element #{idx + 1}
                </label>
                <input
                  id={`ef-sym-${idx}`}
                  type="text"
                  value={row.sym}
                  onChange={(e) => {
                    const next = [...elements];
                    next[idx] = { ...row, sym: e.target.value.trim() };
                    setElements(next);
                  }}
                  className="w-full px-3 py-2 min-h-[40px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
                  placeholder="e.g. C"
                />
              </div>
              <div>
                <label htmlFor={`ef-pct-${idx}`} className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mass (% or g)
                </label>
                <input
                  id={`ef-pct-${idx}`}
                  type="number"
                  step="any"
                  value={row.pct}
                  onChange={(e) => {
                    const next = [...elements];
                    next[idx] = { ...row, pct: Number(e.target.value) };
                    setElements(next);
                  }}
                  className="w-full px-3 py-2 min-h-[40px] rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
                />
              </div>
              <button
                type="button"
                disabled={elements.length <= 2}
                aria-label="Remove element row"
                onClick={() => setElements(elements.filter((_, i) => i !== idx))}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="pt-1">
            <label htmlFor="ef-mm" className="block text-xs font-bold text-slate-700 mb-1">
              Experimental Molar Mass (g/mol)
            </label>
            <input
              id="ef-mm"
              type="number"
              step="any"
              value={expMolarMass}
              onChange={(e) => setExpMolarMass(Number(e.target.value))}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
            />
          </div>
        </div>

        {solved && (
          <div className="lg:col-span-6 space-y-4 tabular-nums">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Elem</th>
                    <th className="py-2 px-3">Moles</th>
                    <th className="py-2 px-3">Raw Ratio</th>
                    <th className="py-2 px-3">EF Int</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {solved.steps.map((s) => (
                    <tr key={s.sym}>
                      <td className="py-2 px-3 font-bold text-[#111827]">{s.sym}</td>
                      <td className="py-2 px-3">{s.moles.toFixed(4)}</td>
                      <td className="py-2 px-3">{s.rawRatio.toFixed(3)}</td>
                      <td className="py-2 px-3 font-bold text-[#EA580C]">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ChemistryToolShell>
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

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'solution-concentration-converter') return;
      if (typeof ce.detail.molarity === 'number') setMolarity(ce.detail.molarity);
      if (typeof ce.detail.soluteMm === 'number') setSoluteMm(ce.detail.soluteMm);
      if (typeof ce.detail.densityGml === 'number') setDensityGml(ce.detail.densityGml);
      if (typeof ce.detail.equivFactor === 'number') setEquivFactor(ce.detail.equivFactor);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const loadNaCl = () => {
    setMolarity(2.0);
    setSoluteMm(58.44);
    setDensityGml(1.08);
    setEquivFactor(1);
  };

  const loadConcH2SO4 = () => {
    setMolarity(18.39);
    setSoluteMm(98.079);
    setDensityGml(1.84);
    setEquivFactor(2);
  };

  const stats = useMemo(() => {
    const massSoln1L = densityGml * 1000;
    const massSolute = molarity * soluteMm;
    const massSolventG = Math.max(1e-3, massSoln1L - massSolute);
    const molality = molarity / (massSolventG / 1000);
    const massPercent = (massSolute / massSoln1L) * 100;
    const molesWater = massSolventG / 18.015;
    const moleFraction = molarity / (molarity + molesWater);
    const normality = molarity * equivFactor;
    const ppm = (massSolute / massSoln1L) * 1e6;

    return { molality, massPercent, moleFraction, normality, ppm, massSolute };
  }, [molarity, soluteMm, densityGml, equivFactor]);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['solution-concentration-converter'];
    void downloadChemistryStructuredPdf({
      filename: 'solution-concentration-report.pdf',
      badgeText: 'CHEMISTRY · SOLUTION UNITS',
      title: 'Aqueous Concentration Interconversion Report',
      subtitle: `${molarity} M Solution · Solute MM ${soluteMm} g/mol · Density ${densityGml} g/mL`,
      parameters: [
        { label: 'Molarity (M)', value: `${molarity} mol/L` },
        { label: 'Solute Molar Mass', value: `${soluteMm} g/mol` },
        { label: 'Solution Density ρ', value: `${densityGml} g/mL` },
        { label: 'Equivalence Factor z', value: `${equivFactor} eq/mol` },
      ],
      kpis: [
        { label: 'Molality (m)', value: `${stats.molality.toFixed(3)} mol/kg`, accent: true },
        { label: 'Mass Percent (% w/w)', value: `${stats.massPercent.toFixed(2)}%` },
        { label: 'Normality (N)', value: `${stats.normality.toFixed(2)} eq/L` },
        { label: 'Mole Fraction (χ)', value: stats.moleFraction.toFixed(4) },
      ],
      callout: {
        title: 'ppm & Mass-per-Liter Summary',
        body: `1.00 L contains ${stats.massSolute.toFixed(2)} g solute (~${Math.round(stats.ppm).toLocaleString()} ppm w/w). Molality remains temperature-independent for colligative boiling/freezing calculations.`,
        tone: 'slate',
      },
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="solution-concentration-converter"
      title="Aqueous Solution Concentration Converter (M ↔ m ↔ % w/w ↔ χ ↔ N ↔ ppm)"
      subtitle="Density-calibrated unit conversion across laboratory molarity, molality, normality, and parts per million"
      onReset={loadNaCl}
      onExportPdf={handleExportPdf}
      presets={[
        { label: '2.0 M NaCl (Saline)', active: molarity === 2.0 && soluteMm === 58.44, onClick: loadNaCl },
        { label: '98% Conc. H₂SO₄ (18.4 M)', active: soluteMm === 98.079, onClick: loadConcH2SO4 },
      ]}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label htmlFor="sc-m" className="block text-xs font-bold text-slate-700 mb-1">Molarity (M)</label>
          <input
            id="sc-m"
            type="number"
            step={0.1}
            value={molarity}
            onChange={(e) => setMolarity(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="sc-mm" className="block text-xs font-bold text-slate-700 mb-1">Solute MM (g/mol)</label>
          <input
            id="sc-mm"
            type="number"
            step={0.1}
            value={soluteMm}
            onChange={(e) => setSoluteMm(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="sc-rho" className="block text-xs font-bold text-slate-700 mb-1">Density ρ (g/mL)</label>
          <input
            id="sc-rho"
            type="number"
            step={0.01}
            value={densityGml}
            onChange={(e) => setDensityGml(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="sc-z" className="block text-xs font-bold text-slate-700 mb-1">Equivalents (z)</label>
          <input
            id="sc-z"
            type="number"
            min={1}
            max={6}
            value={equivFactor}
            onChange={(e) => setEquivFactor(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
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
    </ChemistryToolShell>
  );
}

// ============================================================================
// 21. pH, pOH & HENDERSON-HASSELBALCH BUFFER CALCULATOR
// ============================================================================
export function PhBufferCalculator() {
  const [pKa, setPKa] = useState(4.76);
  const [acidConc, setAcidConc] = useState(0.1);
  const [baseConc, setBaseConc] = useState(0.15);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'ph-buffer-calculator') return;
      if (typeof ce.detail.pKa === 'number') setPKa(ce.detail.pKa);
      if (typeof ce.detail.acidConc === 'number') setAcidConc(ce.detail.acidConc);
      if (typeof ce.detail.baseConc === 'number') setBaseConc(ce.detail.baseConc);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const ph = pKa + Math.log10(Math.max(1e-9, baseConc) / Math.max(1e-9, acidConc));
  const poh = 14 - ph;
  const hPlus = Math.pow(10, -ph);
  const ratio = baseConc / Math.max(1e-9, acidConc);

  const phClamped = Math.max(0, Math.min(14, ph));
  const bufLow = Math.max(0, pKa - 1);
  const bufHigh = Math.min(14, pKa + 1);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['ph-buffer-calculator'];
    void downloadChemistryStructuredPdf({
      filename: `buffer-ph-${ph.toFixed(2)}.pdf`,
      badgeText: 'CHEMISTRY · ACID-BASE BUFFER',
      title: 'Henderson-Hasselbalch Buffer pH Report',
      subtitle: `pKa = ${pKa.toFixed(2)} · [A⁻]/[HA] = ${ratio.toFixed(3)} · Effective Zone: ${bufLow.toFixed(2)}–${bufHigh.toFixed(2)}`,
      parameters: [
        { label: 'Weak Acid pKa', value: pKa.toFixed(2) },
        { label: '[HA] Acid', value: `${acidConc} M` },
        { label: '[A⁻] Conjugate Base', value: `${baseConc} M` },
      ],
      kpis: [
        { label: 'Solution pH (25 °C)', value: ph.toFixed(2), accent: true },
        { label: 'Solution pOH', value: poh.toFixed(2) },
        { label: '[H₃O⁺] Hydronium', value: `${hPlus.toExponential(2)} M` },
      ],
      svgFigure: {
        title: '0–14 pH Spectrum & Effective Buffer Capacity Window (pKa ± 1)',
        svgElement: svgRef.current,
        maxHeightMm: 36,
      },
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="ph-buffer-calculator"
      title="pH, pOH & Henderson-Hasselbalch Buffer Calculator"
      subtitle="Calculate buffer pH, [H₃O⁺], and pKa ± 1 effective capacity zones"
      onReset={() => {
        setPKa(4.76);
        setAcidConc(0.1);
        setBaseConc(0.15);
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Acetate (pKa 4.76)', active: Math.abs(pKa - 4.76) < 0.01, onClick: () => { setPKa(4.76); setAcidConc(0.1); setBaseConc(0.15); } },
        { label: 'Blood Bicarbonate (pKa 6.1)', active: Math.abs(pKa - 6.1) < 0.01, onClick: () => { setPKa(6.1); setAcidConc(0.0012); setBaseConc(0.024); } },
        { label: 'Phosphate PBS (pKa₂ 7.21)', active: Math.abs(pKa - 7.21) < 0.01, onClick: () => { setPKa(7.21); setAcidConc(0.1); setBaseConc(0.155); } },
        { label: 'Tris-HCl (pKa 8.07)', active: Math.abs(pKa - 8.07) < 0.01, onClick: () => { setPKa(8.07); setAcidConc(0.05); setBaseConc(0.05); } },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label htmlFor="ph-pka" className="block text-xs font-bold text-slate-700 mb-1">Weak Acid pKa</label>
          <input
            id="ph-pka"
            type="number"
            step={0.01}
            value={pKa}
            onChange={(e) => setPKa(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="ph-ha" className="block text-xs font-bold text-slate-700 mb-1">[HA] Weak Acid (M)</label>
          <input
            id="ph-ha"
            type="number"
            min={0.0001}
            step={0.01}
            value={acidConc}
            onChange={(e) => setAcidConc(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="ph-a" className="block text-xs font-bold text-slate-700 mb-1">[A⁻] Conjugate Base (M)</label>
          <input
            id="ph-a"
            type="number"
            min={0.0001}
            step={0.01}
            value={baseConc}
            onChange={(e) => setBaseConc(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      {/* Live pH Scale Spectrum SVG */}
      <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
        <svg ref={svgRef} viewBox="0 0 560 95" className="w-full h-24">
          <defs>
            <linearGradient id="phSpecGrad" x1="20" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <text x="20" y="16" fontSize="11" fontWeight="700" fill="#475569">
            pH Spectrum (0–14) &amp; Effective Buffer Region (pKa ± 1: {bufLow.toFixed(2)} – {bufHigh.toFixed(2)})
          </text>
          {/* Buffer zone highlight */}
          <rect
            x={20 + (bufLow / 14) * 520}
            y="26"
            width={Math.max(4, ((bufHigh - bufLow) / 14) * 520)}
            height="28"
            rx="4"
            fill="#F97316"
            fillOpacity="0.18"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <rect x="20" y="34" width="520" height="12" rx="6" fill="url(#phSpecGrad)" />
          {/* Current pH marker */}
          <polygon
            points={`${20 + (phClamped / 14) * 520},32 ${20 + (phClamped / 14) * 520 - 6},21 ${20 + (phClamped / 14) * 520 + 6},21`}
            fill="#111827"
          />
          <text
            x={Math.min(500, Math.max(40, 20 + (phClamped / 14) * 520))}
            y="74"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fontFamily="monospace"
            fill="#111827"
          >
            pH = {ph.toFixed(2)}
          </text>
          {[0, 2, 4, 7, 10, 12, 14].map((tick) => (
            <text
              key={tick}
              x={20 + (tick / 14) * 520}
              y="60"
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="#64748B"
            >
              {tick}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-[#EA580C] block">Buffer pH (25 °C)</span>
          <span className="text-3xl font-mono font-bold text-[#111827]">{ph.toFixed(2)}</span>
          <span className="text-xs text-slate-600 block mt-1">
            Effective buffer range: {bufLow.toFixed(2)} – {bufHigh.toFixed(2)}
          </span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">pOH (14 − pH)</span>
          <span className="text-3xl font-mono font-bold text-[#111827]">{poh.toFixed(2)}</span>
          <span className="text-xs text-slate-500 block mt-1">[A⁻]/[HA] = {ratio.toFixed(3)}</span>
        </div>
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-500 block">[H₃O⁺] Hydronium</span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {hPlus.toExponential(2)} M
          </span>
          <span className="text-xs text-slate-500 block mt-1">Kw = 1.0 × 10⁻¹⁴</span>
        </div>
      </div>
    </ChemistryToolShell>
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
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'acid-base-titration-plotter') return;
      if (typeof ce.detail.acidVolMl === 'number') setAcidVolMl(ce.detail.acidVolMl);
      if (typeof ce.detail.acidM === 'number') setAcidM(ce.detail.acidM);
      if (typeof ce.detail.pKa === 'number') setPKa(ce.detail.pKa);
      if (typeof ce.detail.baseM === 'number') setBaseM(ce.detail.baseM);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const curve = useMemo(() => {
    const ka = Math.pow(10, -pKa);
    const kw = 1e-14;
    const molesAcid = (acidVolMl / 1000) * acidM;
    const vEqMl = (molesAcid / Math.max(1e-6, baseM)) * 1000;
    const maxV = Math.max(1, vEqMl * 1.8);

    const calcPhAt = (vbMl: number) => {
      const totalL = Math.max(1e-6, (acidVolMl + vbMl) / 1000);
      const molesBase = (vbMl / 1000) * baseM;
      if (vbMl <= 0.01) {
        const h = Math.sqrt(ka * acidM);
        return -Math.log10(Math.max(1e-12, h));
      }
      if (molesBase < molesAcid - 1e-7) {
        const remAcid = molesAcid - molesBase;
        return pKa + Math.log10(molesBase / remAcid);
      }
      if (Math.abs(molesBase - molesAcid) <= 1e-7) {
        const cConj = molesAcid / totalL;
        const kb = kw / ka;
        const oh = Math.sqrt(kb * cConj);
        return 14 + Math.log10(Math.max(1e-12, oh));
      }
      const excessOh = (molesBase - molesAcid) / totalL;
      return Math.min(13.8, 14 + Math.log10(Math.max(1e-12, excessOh)));
    };

    const pts = Array.from({ length: 73 }, (_, i) => {
      const v = (maxV * i) / 72;
      return { v, ph: calcPhAt(v) };
    });

    const eqPh = calcPhAt(vEqMl);
    const indicator =
      eqPh >= 8.0 ? 'Phenolphthalein (pH 8.2–10.0)' : eqPh >= 6.0 ? 'Bromothymol Blue (6.0–7.6)' : 'Methyl Red (4.4–6.2)';

    return {
      vEqMl,
      vHalfMl: vEqMl / 2,
      eqPh,
      initPh: calcPhAt(0),
      maxV,
      pts,
      indicator,
    };
  }, [acidVolMl, acidM, pKa, baseM]);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['acid-base-titration-plotter'];
    void downloadChemistryStructuredPdf({
      filename: 'titration-curve-report.pdf',
      badgeText: 'CHEMISTRY · TITRATION CURVE',
      title: `Acid-Base Titration Curve & Equivalence Report`,
      subtitle: `${acidVolMl} mL of ${acidM} M Acid (pKa ${pKa}) titrated with ${baseM} M Strong Base`,
      parameters: [
        { label: 'Analyte Volume & Conc', value: `${acidVolMl} mL @ ${acidM} M` },
        { label: 'Weak Acid pKa', value: pKa.toFixed(2) },
        { label: 'Strong Base Titrant', value: `${baseM} M NaOH` },
      ],
      kpis: [
        { label: 'Equivalence Volume Veq', value: `${curve.vEqMl.toFixed(2)} mL`, accent: true },
        { label: 'Equivalence pH', value: curve.eqPh.toFixed(2) },
        { label: 'Half-Equivalence (½Veq)', value: `${curve.vHalfMl.toFixed(2)} mL · pH ${pKa.toFixed(2)}` },
      ],
      callout: {
        title: 'Recommended Visual Indicator',
        body: `${curve.indicator} transitions steeply inside the vertical neutralization inflection zone at Veq = ${curve.vEqMl.toFixed(2)} mL.`,
        tone: 'orange',
      },
      svgFigure: {
        title: 'Simulated Weak-Acid / Strong-Base Titration Curve (pH vs mL Added)',
        svgElement: svgRef.current,
        maxHeightMm: 72,
      },
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="acid-base-titration-plotter"
      title="Weak Acid Titrated with Strong Base (NaOH) Curve Generator"
      subtitle="Pinpoint initial pH, half-equivalence buffer midpoint (pH = pKa), and equivalence point Veq"
      onReset={() => {
        setAcidVolMl(25);
        setAcidM(0.1);
        setPKa(4.76);
        setBaseM(0.1);
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Acetic Acid (25 mL, pKa 4.76)', active: Math.abs(pKa - 4.76) < 0.01 && acidVolMl === 25, onClick: () => { setAcidVolMl(25); setAcidM(0.1); setPKa(4.76); setBaseM(0.1); } },
        { label: 'Formic Acid (pKa 3.75)', active: Math.abs(pKa - 3.75) < 0.01, onClick: () => { setAcidVolMl(25); setAcidM(0.12); setPKa(3.75); setBaseM(0.1); } },
        { label: 'NH₄⁺ / Weak Acid (pKa 9.25)', active: Math.abs(pKa - 9.25) < 0.01, onClick: () => { setAcidVolMl(20); setAcidM(0.1); setPKa(9.25); setBaseM(0.1); } },
      ]}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label htmlFor="tit-v" className="block text-xs font-bold text-slate-700 mb-1">Analyte Vol (mL)</label>
          <input
            id="tit-v"
            type="number"
            value={acidVolMl}
            onChange={(e) => setAcidVolMl(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="tit-m" className="block text-xs font-bold text-slate-700 mb-1">Acid Conc (M)</label>
          <input
            id="tit-m"
            type="number"
            step={0.05}
            value={acidM}
            onChange={(e) => setAcidM(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="tit-pka" className="block text-xs font-bold text-slate-700 mb-1">Acid pKa</label>
          <input
            id="tit-pka"
            type="number"
            step={0.1}
            value={pKa}
            onChange={(e) => setPKa(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="tit-bm" className="block text-xs font-bold text-slate-700 mb-1">Titrant NaOH (M)</label>
          <input
            id="tit-bm"
            type="number"
            step={0.05}
            value={baseM}
            onChange={(e) => setBaseM(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-slate-200 rounded-2xl p-4">
          <svg ref={svgRef} viewBox="0 0 500 240" className="w-full h-56 sm:h-64">
            {/* Phenolphthalein indicator band (pH 8.2–10.0) */}
            <rect
              x="48"
              y={205 - (10.0 / 14) * 175}
              width="425"
              height={((10.0 - 8.2) / 14) * 175}
              fill="#F472B6"
              fillOpacity="0.14"
            />
            <text x="468" y={205 - (9.0 / 14) * 175} textAnchor="end" fontSize="9" fontWeight="700" fill="#BE185D">
              Phenolphthalein (8.2–10)
            </text>

            {/* Horizontal pH grid lines */}
            {[0, 2, 4, 7, 10, 12, 14].map((pTick) => {
              const yPos = 205 - (pTick / 14) * 175;
              return (
                <g key={pTick}>
                  <line x1="48" y1={yPos} x2="473" y2={yPos} stroke={pTick === 7 ? '#CBD5E1' : '#F1F5F9'} strokeWidth="1" strokeDasharray={pTick === 7 ? '4 3' : undefined} />
                  <text x="40" y={yPos + 3.5} textAnchor="end" fontSize="10" fill="#64748B" fontFamily="monospace">
                    {pTick}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1="48" y1="205" x2="473" y2="205" stroke="#64748B" strokeWidth="1.5" />
            <line x1="48" y1="25" x2="48" y2="205" stroke="#64748B" strokeWidth="1.5" />

            {/* Half-equivalence guide */}
            <line
              x1={48 + (curve.vHalfMl / curve.maxV) * 420}
              y1={205 - (pKa / 14) * 175}
              x2={48 + (curve.vHalfMl / curve.maxV) * 420}
              y2="205"
              stroke="#0284C7"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Equivalence volume guide */}
            <line
              x1={48 + (curve.vEqMl / curve.maxV) * 420}
              y1={205 - (curve.eqPh / 14) * 175}
              x2={48 + (curve.vEqMl / curve.maxV) * 420}
              y2="205"
              stroke="#111827"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Curve */}
            <polyline
              fill="none"
              stroke="#F97316"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={curve.pts
                .map((p) => {
                  const x = 48 + (p.v / curve.maxV) * 420;
                  const y = 205 - (Math.max(0, Math.min(14, p.ph)) / 14) * 175;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ')}
            />

            {/* Half-Eq Point */}
            <circle
              cx={48 + (curve.vHalfMl / curve.maxV) * 420}
              cy={205 - (pKa / 14) * 175}
              r="4.5"
              fill="#0284C7"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <text
              x={48 + (curve.vHalfMl / curve.maxV) * 420 - 6}
              y={205 - (pKa / 14) * 175 - 8}
              textAnchor="end"
              fontSize="9.5"
              fontWeight="700"
              fill="#0369A1"
              fontFamily="monospace"
            >
              ½Veq (pH={pKa.toFixed(2)})
            </text>

            {/* Equivalence Point */}
            <circle
              cx={48 + (curve.vEqMl / curve.maxV) * 420}
              cy={205 - (curve.eqPh / 14) * 175}
              r="5.5"
              fill="#111827"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />
            <text
              x={48 + (curve.vEqMl / curve.maxV) * 420 + 8}
              y={205 - (curve.eqPh / 14) * 175 + 4}
              fontSize="10"
              fontWeight="800"
              fill="#111827"
              fontFamily="monospace"
            >
              Eq ({curve.vEqMl.toFixed(1)} mL, pH {curve.eqPh.toFixed(2)})
            </text>

            {/* X-axis label */}
            <text x="260" y="228" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#475569">
              Titrant NaOH Added (mL) · Max {curve.maxV.toFixed(1)} mL
            </text>
            <text x="16" y="115" transform="rotate(-90 16 115)" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#475569">
              Solution pH
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
            <span className="text-[11px] font-bold text-slate-500 block">Initial pH &amp; Indicator</span>
            <span className="text-lg font-mono font-bold text-emerald-700 block">
              Initial pH {curve.initPh.toFixed(2)}
            </span>
            <span className="text-xs text-slate-600 block mt-0.5">{curve.indicator}</span>
          </div>
        </div>
      </div>
    </ChemistryToolShell>
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

  const R = 0.082057;

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'ideal-gas-law-solver') return;
      if (ce.detail.solveFor === 'P' || ce.detail.solveFor === 'V' || ce.detail.solveFor === 'n' || ce.detail.solveFor === 'T') {
        setSolveFor(ce.detail.solveFor);
      }
      if (typeof ce.detail.pAtm === 'number') setPAtm(ce.detail.pAtm);
      if (typeof ce.detail.vL === 'number') setVL(ce.detail.vL);
      if (typeof ce.detail.nMol === 'number') setNMol(ce.detail.nMol);
      if (typeof ce.detail.tKelvin === 'number') setTKelvin(ce.detail.tKelvin);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

  const result = useMemo(() => {
    if (solveFor === 'P') {
      const val = (nMol * R * tKelvin) / Math.max(1e-6, vL);
      return { val, unit: 'atm', alt: `${(val * 101.325).toFixed(2)} kPa · ${(val * 760).toFixed(1)} mmHg` };
    }
    if (solveFor === 'V') {
      const val = (nMol * R * tKelvin) / Math.max(1e-6, pAtm);
      return { val, unit: 'L', alt: `${(val * 1000).toFixed(1)} mL · ${(val / 1000).toFixed(5)} m³` };
    }
    if (solveFor === 'n') {
      const val = (pAtm * vL) / (R * Math.max(1, tKelvin));
      return { val, unit: 'mol', alt: `${(val * 6.022e23).toExponential(3)} molecules` };
    }
    const val = (pAtm * vL) / (R * Math.max(1e-6, nMol));
    return { val, unit: 'K', alt: `${(val - 273.15).toFixed(2)} °C` };
  }, [solveFor, pAtm, vL, nMol, tKelvin]);

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['ideal-gas-law-solver'];
    void downloadChemistryStructuredPdf({
      filename: `ideal-gas-solve-${solveFor}.pdf`,
      badgeText: 'CHEMISTRY · IDEAL GAS LAW',
      title: `Ideal Gas State Calculation (Solve for ${solveFor})`,
      subtitle: 'PV = nRT · R = 0.082057 L·atm/(mol·K) = 8.31446 J/(mol·K)',
      parameters: [
        { label: 'Target Unknown', value: solveFor },
        { label: 'Pressure P', value: solveFor === 'P' ? `${result.val.toFixed(4)} atm` : `${pAtm} atm` },
        { label: 'Volume V', value: solveFor === 'V' ? `${result.val.toFixed(4)} L` : `${vL} L` },
        { label: 'Moles n / Temp T', value: `${solveFor === 'n' ? result.val.toFixed(4) : nMol} mol · ${solveFor === 'T' ? result.val.toFixed(2) : tKelvin} K` },
      ],
      kpis: [
        { label: `Computed ${solveFor}`, value: `${result.val.toFixed(4)} ${result.unit}`, accent: true },
        { label: 'Unit Equivalents', value: result.alt },
      ],
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="ideal-gas-law-solver"
      title="Ideal Gas Law (PV = nRT) Solver & Unit Converter"
      subtitle="Switch target variable (P, V, n, or T) with real-time atm / kPa / mmHg / °C conversions"
      onReset={() => {
        setSolveFor('P');
        setPAtm(1.0);
        setVL(22.414);
        setNMol(1.0);
        setTKelvin(273.15);
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'STP Molar Vol (22.41 L)', active: solveFor === 'V' && Math.abs(tKelvin - 273.15) < 0.1, onClick: () => { setSolveFor('V'); setPAtm(1.0); setNMol(1.0); setTKelvin(273.15); } },
        { label: '298 K Lab Cylinder', active: solveFor === 'P' && vL === 10 && nMol === 2.5, onClick: () => { setSolveFor('P'); setVL(10.0); setNMol(2.5); setTKelvin(298.15); } },
        { label: 'Airbag N₂ Deployment (60 L)', active: solveFor === 'n' && vL === 60, onClick: () => { setSolveFor('n'); setPAtm(1.1); setVL(60); setTKelvin(300); } },
      ]}
      headerControls={
        <div className="inline-flex flex-wrap p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          {(['P', 'V', 'n', 'T'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSolveFor(k)}
              className={`px-3.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold cursor-pointer ${
                solveFor === k ? 'bg-[#F97316] text-white' : 'text-slate-600'
              }`}
            >
              Solve {k}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        {solveFor !== 'P' && (
          <div>
            <label htmlFor="ig-p" className="block text-xs font-bold text-slate-700 mb-1">Pressure P (atm)</label>
            <input
              id="ig-p"
              type="number"
              step="any"
              value={pAtm}
              onChange={(e) => setPAtm(Number(e.target.value))}
              className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'V' && (
          <div>
            <label htmlFor="ig-v" className="block text-xs font-bold text-slate-700 mb-1">Volume V (Liters)</label>
            <input
              id="ig-v"
              type="number"
              step="any"
              value={vL}
              onChange={(e) => setVL(Number(e.target.value))}
              className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'n' && (
          <div>
            <label htmlFor="ig-n" className="block text-xs font-bold text-slate-700 mb-1">Gas Moles n (mol)</label>
            <input
              id="ig-n"
              type="number"
              step="any"
              value={nMol}
              onChange={(e) => setNMol(Number(e.target.value))}
              className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
        {solveFor !== 'T' && (
          <div>
            <label htmlFor="ig-t" className="block text-xs font-bold text-slate-700 mb-1">Temperature T (K)</label>
            <input
              id="ig-t"
              type="number"
              step="any"
              value={tKelvin}
              onChange={(e) => setTKelvin(Number(e.target.value))}
              className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
            />
          </div>
        )}
      </div>

      <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-6 tabular-nums space-y-1.5">
        <span className="text-xs font-bold text-[#EA580C] block">
          Ideal Gas State Solution (R = 0.082057 L·atm·mol⁻¹·K⁻¹)
        </span>
        <p className="text-3xl font-mono font-bold text-[#111827]">
          {solveFor} = {result.val.toFixed(4)} {result.unit}
        </p>
        <p className="text-xs font-mono text-slate-600">{result.alt}</p>
      </div>
    </ChemistryToolShell>
  );
}

// ============================================================================
// 24. THERMOCHEMISTRY & GIBBS FREE ENERGY (ΔG = ΔH − TΔS) CALCULATOR
// ============================================================================
export function ThermochemistryGibbsCalculator() {
  const [deltaHKj, setDeltaHKj] = useState(-92.2);
  const [deltaSJ, setDeltaSJ] = useState(-198.7);
  const [tempK, setTempK] = useState(298.15);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown>>;
      if (ce.detail?.slug !== 'thermochemistry-gibbs-calculator') return;
      if (typeof ce.detail.deltaHKj === 'number') setDeltaHKj(ce.detail.deltaHKj);
      if (typeof ce.detail.deltaSJ === 'number') setDeltaSJ(ce.detail.deltaSJ);
      if (typeof ce.detail.tempK === 'number') setTempK(ce.detail.tempK);
    };
    window.addEventListener('ut-chem-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-chem-load-preset', handler as EventListener);
  }, []);

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

    const maxT = Math.max(800, Math.ceil((Math.max(tempK, tCrossK || 400) * 1.25) / 100) * 100);
    const gStart = deltaHKj;
    const gEnd = deltaHKj - maxT * (deltaSJ / 1000);
    const absMaxG = Math.max(50, Math.abs(gStart), Math.abs(gEnd), Math.abs(deltaGKj));

    return { deltaGKj, keq, tCrossK, regime, maxT, gStart, gEnd, absMaxG };
  }, [deltaHKj, deltaSJ, tempK]);

  const toY = (g: number) => 110 - (g / thermo.absMaxG) * 85;
  const toX = (t: number) => 56 + (Math.min(thermo.maxT, Math.max(0, t)) / thermo.maxT) * 400;

  const handleExportPdf = () => {
    const toolMeta = SCIENCE_TOOLS_BY_SLUG['thermochemistry-gibbs-calculator'];
    void downloadChemistryStructuredPdf({
      filename: 'thermochemistry-gibbs-report.pdf',
      badgeText: 'CHEMISTRY · THERMODYNAMICS',
      title: 'Gibbs Free Energy (ΔG = ΔH − TΔS) & Equilibrium Report',
      subtitle: `Evaluated at T = ${tempK} K (${(tempK - 273.15).toFixed(2)} °C)`,
      parameters: [
        { label: 'Enthalpy ΔH°', value: `${deltaHKj} kJ/mol` },
        { label: 'Entropy ΔS°', value: `${deltaSJ} J/(mol·K)` },
        { label: 'Temperature T', value: `${tempK} K` },
      ],
      kpis: [
        { label: 'Gibbs ΔG°', value: `${thermo.deltaGKj.toFixed(2)} kJ/mol`, accent: true },
        { label: 'Equilibrium Keq', value: Number.isFinite(thermo.keq) ? thermo.keq.toExponential(3) : 'Overflow' },
        {
          label: 'Crossover T(ΔG=0)',
          value: thermo.tCrossK && thermo.tCrossK > 0 ? `${thermo.tCrossK.toFixed(1)} K` : 'No Crossover',
        },
      ],
      callout: {
        title: 'Spontaneity Classification',
        body: thermo.regime,
        tone: thermo.deltaGKj < 0 ? 'emerald' : 'amber',
      },
      svgFigure: {
        title: 'ΔG(T) Linear Spontaneity Trajectory (kJ/mol vs Kelvin)',
        svgElement: svgRef.current,
        maxHeightMm: 62,
      },
      workedExample: toolMeta?.workedExample,
    });
  };

  return (
    <ChemistryToolShell
      slug="thermochemistry-gibbs-calculator"
      title="Gibbs Free Energy (ΔG = ΔH − TΔS), Equilibrium Keq & Crossover T"
      subtitle="Visualize spontaneity regimes across temperature and avoid J vs kJ unit mismatches"
      onReset={() => {
        setDeltaHKj(-92.2);
        setDeltaSJ(-198.7);
        setTempK(298.15);
      }}
      onExportPdf={handleExportPdf}
      presets={[
        { label: 'Haber NH₃ (Exothermic)', active: deltaHKj === -92.2, onClick: () => { setDeltaHKj(-92.2); setDeltaSJ(-198.7); setTempK(298.15); } },
        { label: 'Ice Melting (H₂O s→l)', active: Math.abs(deltaHKj - 6.01) < 0.05, onClick: () => { setDeltaHKj(6.01); setDeltaSJ(22.0); setTempK(298.15); } },
        { label: 'CaCO₃ Calcination', active: deltaHKj === 178.3, onClick: () => { setDeltaHKj(178.3); setDeltaSJ(160.4); setTempK(1200); } },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 tabular-nums">
        <div>
          <label htmlFor="th-dh" className="block text-xs font-bold text-slate-700 mb-1">Enthalpy ΔH° (kJ/mol)</label>
          <input
            id="th-dh"
            type="number"
            step="any"
            value={deltaHKj}
            onChange={(e) => setDeltaHKj(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="th-ds" className="block text-xs font-bold text-slate-700 mb-1">
            Entropy ΔS° (J / mol·K)
          </label>
          <input
            id="th-ds"
            type="number"
            step="any"
            value={deltaSJ}
            onChange={(e) => setDeltaSJ(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
        <div>
          <label htmlFor="th-t" className="block text-xs font-bold text-slate-700 mb-1">Temperature T (K)</label>
          <input
            id="th-t"
            type="number"
            min={1}
            step="any"
            value={tempK}
            onChange={(e) => setTempK(Number(e.target.value))}
            className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 font-mono text-sm"
          />
        </div>
      </div>

      {/* ΔG vs T Plot SVG */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-4">
        <svg ref={svgRef} viewBox="0 0 490 215" className="w-full h-48 sm:h-52">
          {/* Spontaneous region (ΔG < 0 below center line) */}
          <rect x="56" y="110" width="400" height="82" fill="#ECFDF5" fillOpacity="0.65" />
          <text x="450" y="183" textAnchor="end" fontSize="9.5" fontWeight="700" fill="#059669">
            Spontaneous Zone (ΔG &lt; 0)
          </text>
          <text x="450" y="34" textAnchor="end" fontSize="9.5" fontWeight="700" fill="#DC2626">
            Non-Spontaneous (ΔG &gt; 0)
          </text>

          {/* Zero axis + vertical T=0 axis */}
          <line x1="56" y1="110" x2="456" y2="110" stroke="#475569" strokeWidth="1.4" strokeDasharray="4 3" />
          <line x1="56" y1="22" x2="56" y2="192" stroke="#64748B" strokeWidth="1.5" />
          <text x="48" y="113" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#111827">0</text>
          <text x="16" y="110" transform="rotate(-90 16 110)" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
            ΔG (kJ/mol)
          </text>

          {/* ΔG(T) Line */}
          <line
            x1={toX(0)}
            y1={toY(thermo.gStart)}
            x2={toX(thermo.maxT)}
            y2={toY(thermo.gEnd)}
            stroke="#EA580C"
            strokeWidth="3"
          />

          {/* Crossover Marker if positive */}
          {thermo.tCrossK && thermo.tCrossK > 0 && thermo.tCrossK <= thermo.maxT && (
            <>
              <circle cx={toX(thermo.tCrossK)} cy="110" r="4.5" fill="#111827" stroke="#FFFFFF" strokeWidth="1.5" />
              <text
                x={toX(thermo.tCrossK)}
                y="99"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fontFamily="monospace"
                fill="#111827"
              >
                T* = {thermo.tCrossK.toFixed(0)} K
              </text>
            </>
          )}

          {/* Active Temperature Point */}
          <circle cx={toX(tempK)} cy={toY(thermo.deltaGKj)} r="5.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.8" />
          <text x="256" y="207" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
            Temperature (0 K → {thermo.maxT} K) · Current T = {tempK} K
          </text>
        </svg>
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
    </ChemistryToolShell>
  );
}
