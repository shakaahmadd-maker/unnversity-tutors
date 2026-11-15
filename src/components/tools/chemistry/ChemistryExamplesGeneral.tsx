import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';

export interface ChemExampleTriggerProps {
  loadedKey: string | null;
  onSimulate: (key: string, detail: Record<string, unknown>) => void;
}

function ChemSimulateButton({
  presetKey,
  loadedKey,
  label,
  onClick,
}: {
  presetKey: string;
  loadedKey: string | null;
  label: string;
  onClick: () => void;
}) {
  const isLoaded = loadedKey === presetKey;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-white text-[#EA580C] hover:bg-orange-50 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
    >
      {isLoaded ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Loaded in Tool</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ============================================================================
// 15. INTERACTIVE PERIODIC TABLE EXAMPLES
// ============================================================================
export function PeriodicTableExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Electron Configuration &amp; Periodic Trends · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Transition Metal 3d Subshells (Fe, Cu) vs. Fluorine Electronegativity
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="pt-cu"
              loadedKey={loadedKey}
              label="Inspect Copper (Cu)"
              onClick={() =>
                onSimulate('pt-cu', {
                  slug: 'interactive-periodic-table',
                  symbol: 'Cu',
                  categoryFilter: 'All',
                  search: '',
                })
              }
            />
            <ChemSimulateButton
              presetKey="pt-f"
              loadedKey={loadedKey}
              label="Inspect Fluorine (F)"
              onClick={() =>
                onSimulate('pt-f', {
                  slug: 'interactive-periodic-table',
                  symbol: 'F',
                  categoryFilter: 'All',
                  search: '',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Copper (<code className="font-mono font-bold text-[#111827]">Z = 29</code>) promotes one{' '}
            <code className="font-mono">4s</code> electron into the{' '}
            <code className="font-mono font-bold text-[#EA580C]">3d¹⁰</code> subshell (<code className="font-mono">[Ar] 3d¹⁰ 4s¹</code>)
            because completely filled d-orbitals minimize inter-electron repulsion and explain copper&apos;s high electrical conductivity.
            Meanwhile, Fluorine (<code className="font-mono font-bold text-[#111827]">Z = 9, χ = 3.98</code>) carries the highest effective
            nuclear charge per shell, giving it the peak Pauling electronegativity across all elements.
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 190"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Diagram comparing 3d orbital stability in Iron and Copper alongside Fluorine electronegativity peak"
            >
              <rect x="0" y="0" width="740" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="28" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Periodic Trends &amp; d-Block Exceptions
              </text>

              {/* Fe card */}
              <rect x="24" y="44" width="215" height="122" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="40" y="68" fontSize="16" fontWeight="700" fill="#111827">26 Fe · Iron</text>
              <text x="40" y="88" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#EA580C">[Ar] 3d⁶ 4s²</text>
              <text x="40" y="109" fontSize="11" fill="#475569">EN: 1.83 · IE₁: 762 kJ/mol</text>
              <text x="40" y="128" fontSize="11" fill="#334155">Fe²⁺ loses 4s² first → [Ar] 3d⁶</text>
              <text x="40" y="148" fontSize="10.5" fontWeight="700" fill="#059669">Heme Oxygen Carrier Center</text>

              {/* Cu card */}
              <rect x="262" y="44" width="215" height="122" rx="12" fill="#F0F9FF" stroke="#BAE6FD" />
              <text x="278" y="68" fontSize="16" fontWeight="700" fill="#111827">29 Cu · Copper</text>
              <text x="278" y="88" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#0284C7">[Ar] 3d¹⁰ 4s¹ ★</text>
              <text x="278" y="109" fontSize="11" fill="#475569">EN: 1.90 · IE₁: 745 kJ/mol</text>
              <text x="278" y="128" fontSize="11" fill="#334155">Filled 3d¹⁰ exception (not 3d⁹4s²)</text>
              <text x="278" y="148" fontSize="10.5" fontWeight="700" fill="#0369A1">Maximum d-Shell Symmetry</text>

              {/* F card */}
              <rect x="500" y="44" width="216" height="122" rx="12" fill="#ECFDF5" stroke="#A7F3D0" />
              <text x="516" y="68" fontSize="16" fontWeight="700" fill="#111827">9 F · Fluorine</text>
              <text x="516" y="88" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#059669">[He] 2s² 2p⁵</text>
              <text x="516" y="109" fontSize="11" fill="#475569">EN: 3.98 (Peak!) · IE₁: 1681</text>
              <text x="516" y="128" fontSize="11" fill="#334155">Smallest Period-2 nonmetal radius</text>
              <text x="516" y="148" fontSize="10.5" fontWeight="700" fill="#065F46">Strongest Polarizing Oxidizer</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 16. MOLAR MASS & % COMPOSITION EXAMPLES
// ============================================================================
export function MolarMassExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Hydrated Inorganic Salt &amp; Pharmaceutical Stoichiometry · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Copper(II) Sulfate Pentahydrate (CuSO₄·5H₂O) Water-of-Crystallization Mass
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="mm-cuso4"
              loadedKey={loadedKey}
              label="Load CuSO₄·5H₂O"
              onClick={() =>
                onSimulate('mm-cuso4', {
                  slug: 'molar-mass-calculator',
                  formula: 'CuSO4*5H2O',
                  sampleGrams: 12.5,
                })
              }
            />
            <ChemSimulateButton
              presetKey="mm-aspirin"
              loadedKey={loadedKey}
              label="Load Aspirin (C₉H₈O₄)"
              onClick={() =>
                onSimulate('mm-aspirin', {
                  slug: 'molar-mass-calculator',
                  formula: 'C9H8O4',
                  sampleGrams: 0.325,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            In inorganic lab gravimetry, drying blue vitriol (<code className="font-mono font-bold text-[#111827]">CuSO₄·5H₂O</code>,
            {' '}M = 249.68 g/mol) removes 5 moles of structural water (90.08 g/mol = <strong>36.08%</strong> of total crystal weight), turning
            the bright blue hydrate into white anhydrous <code className="font-mono">CuSO₄</code>. Failing to include <code className="font-mono">5H₂O</code> when weighing stock solutions causes a 36% concentration error!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 170"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Mass breakdown bar showing CuSO4 63.92 percent and 5H2O 36.08 percent totaling 249.68 g/mol"
            >
              <rect x="0" y="0" width="740" height="170" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="28" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Molar Mass Partition of Blue Vitriol (249.685 g/mol)
              </text>

              {/* Stacked Horizontal Bar */}
              <rect x="24" y="54" width="177" height="44" rx="8" fill="#0284C7" />
              <text x="112" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Cu (63.55)</text>
              <text x="112" y="89" textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill="#E0F2FE">25.45%</text>

              <rect x="205" y="54" width="90" height="44" rx="8" fill="#EAB308" />
              <text x="250" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">S (32.06)</text>
              <text x="250" y="89" textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill="#111827">12.84%</text>

              <rect x="299" y="54" width="178" height="44" rx="8" fill="#EA580C" />
              <text x="388" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">4×O (64.00)</text>
              <text x="388" y="89" textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill="#FFF7ED">25.63%</text>

              <rect x="481" y="54" width="235" height="44" rx="8" fill="#059669" />
              <text x="598" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">5 H₂O Crystallization Water</text>
              <text x="598" y="89" textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill="#ECFDF5">90.08 g/mol · 36.08%</text>

              <text x="24" y="130" fontSize="11.5" fontWeight="700" fill="#111827">
                Lab Check: 12.50 g CuSO₄·5H₂O = 0.05006 mol = 7.99 g anhydrous CuSO₄ + 4.51 g driven-off H₂O vapor
              </text>
              <text x="24" y="149" fontSize="11" fill="#64748B">
                Always verify parentheses and hydrate bullets (* or ·) before converting mass to molarity.
              </text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 17. CHEMICAL EQUATION BALANCER EXAMPLES
// ============================================================================
export function EquationBalancerExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Industrial Roasting &amp; Hydrocarbon Combustion · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Propane Fuel Combustion &amp; Iron Pyrite Ore Roasting Conservation
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="eq-propane"
              loadedKey={loadedKey}
              label="Load Propane (C₃H₈)"
              onClick={() =>
                onSimulate('eq-propane', {
                  slug: 'chemical-equation-balancer',
                  equation: 'C3H8 + O2 -> CO2 + H2O',
                })
              }
            />
            <ChemSimulateButton
              presetKey="eq-pyrite"
              loadedKey={loadedKey}
              label="Load Pyrite Roasting"
              onClick={() =>
                onSimulate('eq-pyrite', {
                  slug: 'chemical-equation-balancer',
                  equation: 'FeS2 + O2 -> Fe2O3 + SO2',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Roasting iron pyrite (<code className="font-mono font-bold text-[#111827]">4 FeS₂ + 11 O₂ → 2 Fe₂O₃ + 8 SO₂</code>) for sulfuric acid production yields an odd oxygen count (11 O₂) when balanced by inspection—our exact nullspace matrix solver resolves all fractional coefficients into coprime whole numbers automatically.
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 165"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Atom conservation flow diagram for propane combustion 1 C3H8 plus 5 O2 yielding 3 CO2 plus 4 H2O"
            >
              <rect x="0" y="0" width="740" height="165" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="28" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Atom Conservation Ledger: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O
              </text>

              <rect x="24" y="48" width="290" height="90" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="169" y="70" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">Reactants (Left)</text>
              <text x="169" y="92" textAnchor="middle" fontSize="12.5" fontFamily="monospace" fontWeight="700" fill="#EA580C">1 C₃H₈  +  5 O₂</text>
              <text x="169" y="118" textAnchor="middle" fontSize="11.5" fontFamily="monospace" fill="#475569">C: 3  ·  H: 8  ·  O: 10</text>

              <line x1="326" y1="93" x2="404" y2="93" stroke="#059669" strokeWidth="2.5" />
              <polygon points="404,87 416,93 404,99" fill="#059669" />
              <text x="366" y="82" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#059669">Balanced</text>

              <rect x="424" y="48" width="290" height="90" rx="12" fill="#ECFDF5" stroke="#A7F3D0" />
              <text x="569" y="70" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">Products (Right)</text>
              <text x="569" y="92" textAnchor="middle" fontSize="12.5" fontFamily="monospace" fontWeight="700" fill="#059669">3 CO₂  +  4 H₂O</text>
              <text x="569" y="118" textAnchor="middle" fontSize="11.5" fontFamily="monospace" fill="#065F46">C: 3  ·  H: 8  ·  O: 6+4=10</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 18. LIMITING REAGENT & YIELD EXAMPLES
// ============================================================================
export function LimitingReagentExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Haber Ammonia Reactor Stoichiometry · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Haber-Bosch Reactor (N₂ + 3H₂ → 2NH₃): Limiting Extent &amp; Excess Feed
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="lr-haber"
              loadedKey={loadedKey}
              label="Load Haber N₂/H₂"
              onClick={() =>
                onSimulate('lr-haber', {
                  slug: 'limiting-reagent-yield-calculator',
                  reactAFormula: 'N2',
                  reactACoef: 1,
                  reactAGrams: 28.0,
                  reactBFormula: 'H2',
                  reactBCoef: 3,
                  reactBGrams: 8.0,
                  prodFormula: 'NH3',
                  prodCoef: 2,
                  actualYieldGrams: 30.2,
                })
              }
            />
            <ChemSimulateButton
              presetKey="lr-water"
              loadedKey={loadedKey}
              label="Load H₂ + O₂ Fuel Cell"
              onClick={() =>
                onSimulate('lr-water', {
                  slug: 'limiting-reagent-yield-calculator',
                  reactAFormula: 'H2',
                  reactACoef: 2,
                  reactAGrams: 10.0,
                  reactBFormula: 'O2',
                  reactBCoef: 1,
                  reactBGrams: 64.0,
                  prodFormula: 'H2O',
                  prodCoef: 2,
                  actualYieldGrams: 68.5,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Reacting 28.0 g of Nitrogen gas (1.00 mol N₂) with 8.00 g of Hydrogen gas (3.97 mol H₂) means{' '}
            <strong>H₂ has a stoichiometric extent of 3.97/3 = 1.323 mol</strong> vs.{' '}
            <strong>N₂ extent = 1.000/1 = 1.000 mol</strong>. Even though Hydrogen weighs 3.5× less in grams, Nitrogen is the limiting reagent!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 165"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Limiting reagent bar comparison for Haber synthesis showing N2 runs out first at 1.00 extent while H2 leaves 1.95 grams excess"
            >
              <rect x="0" y="0" width="740" height="165" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="28" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Stoichiometric Reaction Extent (n / coef) Comparison
              </text>

              <text x="24" y="64" fontSize="12" fontWeight="700" fill="#111827">Reactant A: N₂ (28.0 g ÷ 28.01 ÷ 1)</text>
              <rect x="310" y="48" width="230" height="22" rx="6" fill="#EA580C" />
              <text x="550" y="63" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#EA580C">1.000 rxn mol (LIMITING!)</text>

              <text x="24" y="102" fontSize="12" fontWeight="700" fill="#111827">Reactant B: H₂ (8.00 g ÷ 2.016 ÷ 3)</text>
              <rect x="310" y="86" width="305" height="22" rx="6" fill="#0EA5E9" />
              <text x="625" y="101" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#0284C7">1.323 rxn mol (EXCESS)</text>

              <line x1="540" y1="42" x2="540" y2="122" stroke="#111827" strokeDasharray="4 3" strokeWidth="1.5" />
              <text x="24" y="144" fontSize="11.5" fontWeight="700" fill="#059669">
                Outcome: 34.04 g Theoretical NH₃ · 1.95 g Unreacted H₂ Excess · 30.2 g Isolated = 88.7% Yield
              </text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 19. EMPIRICAL & MOLECULAR FORMULA EXAMPLES
// ============================================================================
export function EmpiricalFormulaExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Elemental Combustion Analysis · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              From Mass Percent (%) to Glucose (C₆H₁₂O₆) &amp; Caffeine (C₈H₁₀N₄O₂)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="ef-glucose"
              loadedKey={loadedKey}
              label="Load Glucose (CH₂O)₆"
              onClick={() =>
                onSimulate('ef-glucose', {
                  slug: 'empirical-molecular-formula-finder',
                  elements: [
                    { sym: 'C', pct: 40.0 },
                    { sym: 'H', pct: 6.71 },
                    { sym: 'O', pct: 53.29 },
                  ],
                  expMolarMass: 180.16,
                })
              }
            />
            <ChemSimulateButton
              presetKey="ef-caffeine"
              loadedKey={loadedKey}
              label="Load Caffeine"
              onClick={() =>
                onSimulate('ef-caffeine', {
                  slug: 'empirical-molecular-formula-finder',
                  elements: [
                    { sym: 'C', pct: 49.48 },
                    { sym: 'H', pct: 5.19 },
                    { sym: 'N', pct: 28.85 },
                    { sym: 'O', pct: 16.48 },
                  ],
                  expMolarMass: 194.19,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Acetic acid (60.05 g/mol), formaldehyde (30.03 g/mol), and D-glucose (180.16 g/mol) all share the exact same empirical formula{' '}
            <code className="font-mono font-bold text-[#111827]">CH₂O</code>! Mass spectrometry provides the experimental molar mass needed to compute integer multiplier{' '}
            <code className="font-mono font-bold text-[#EA580C]">n = M_exp / M_emp</code>.
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 160"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Step-by-step workflow transforming 40% C, 6.71% H, 53.29% O into CH2O empirical formula and multiplying by 6 to get Glucose C6H12O6"
            >
              <rect x="0" y="0" width="740" height="160" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · 4-Step Mass-to-Molecular Pipeline (D-Glucose)
              </text>

              <rect x="24" y="44" width="155" height="90" rx="10" fill="#F8FAFC" stroke="#CBD5E1" />
              <text x="101" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">1. Mass % (100 g)</text>
              <text x="101" y="88" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111827">40.00 g C</text>
              <text x="101" y="104" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111827">6.71 g H · 53.29 g O</text>

              <line x1="183" y1="89" x2="203" y2="89" stroke="#EA580C" strokeWidth="2" />
              <polygon points="203,84 211,89 203,94" fill="#EA580C" />

              <rect x="215" y="44" width="155" height="90" rx="10" fill="#F8FAFC" stroke="#CBD5E1" />
              <text x="292" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">2. Divide by Aᵣ</text>
              <text x="292" y="88" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111827">3.330 mol C</text>
              <text x="292" y="104" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#111827">6.657 H · 3.331 O</text>

              <line x1="374" y1="89" x2="394" y2="89" stroke="#EA580C" strokeWidth="2" />
              <polygon points="394,84 402,89 394,94" fill="#EA580C" />

              <rect x="406" y="44" width="145" height="90" rx="10" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="478" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="#EA580C">3. Empirical</text>
              <text x="478" y="92" textAnchor="middle" fontSize="16" fontFamily="monospace" fontWeight="700" fill="#111827">CH₂O</text>
              <text x="478" y="114" textAnchor="middle" fontSize="10.5" fill="#475569">30.03 g/mol</text>

              <line x1="555" y1="89" x2="575" y2="89" stroke="#059669" strokeWidth="2" />
              <polygon points="575,84 583,89 575,94" fill="#059669" />

              <rect x="587" y="44" width="130" height="90" rx="10" fill="#ECFDF5" stroke="#A7F3D0" />
              <text x="652" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">4. ×6 (180.16)</text>
              <text x="652" y="92" textAnchor="middle" fontSize="16" fontFamily="monospace" fontWeight="700" fill="#065F46">C₆H₁₂O₆</text>
              <text x="652" y="114" textAnchor="middle" fontSize="10.5" fill="#065F46">Molecular Form.</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 30. RADIOACTIVE DECAY & HALF-LIFE EXAMPLES
// ============================================================================
export function RadioactiveDecayExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Archaeological Radiocarbon &amp; Nuclear Medicine · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Dead Sea Scrolls ¹⁴C Radiocarbon Dating vs. ⁹⁹ᵐTc Medical Imaging
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="rad-c14"
              loadedKey={loadedKey}
              label="Load ¹⁴C Parchment (2,200 yr)"
              onClick={() =>
                onSimulate('rad-c14', {
                  slug: 'radioactive-decay-halflife-calculator',
                  isotopeName: 'Carbon-14 (¹⁴C Dead Sea Scroll)',
                  n0: 100,
                  halfLife: 5730,
                  elapsed: 2200,
                  unitLabel: 'years',
                })
              }
            />
            <ChemSimulateButton
              presetKey="rad-tc99"
              loadedKey={loadedKey}
              label="Load ⁹⁹ᵐTc Scan (24 h)"
              onClick={() =>
                onSimulate('rad-tc99', {
                  slug: 'radioactive-decay-halflife-calculator',
                  isotopeName: 'Technetium-99m (⁹⁹ᵐTc Medical)',
                  n0: 200,
                  halfLife: 6.01,
                  elapsed: 24,
                  unitLabel: 'hours',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Every living organism maintains a steady atmospheric Carbon-14 (<code className="font-mono font-bold text-[#111827]">¹⁴C, t₁/₂ = 5,730 yr</code>) ratio until death halts carbon intake. Measuring <strong>76.6%</strong> residual ¹⁴C in an ancient flax scroll yields{' '}
            <code className="font-mono font-bold text-[#EA580C]">t ≈ 2,200 years</code>. In nuclear cardiology, Technetium-99m (<code className="font-mono">t₁/₂ = 6.01 h</code>) decays 93.7% within 24 hours (~4 half-lives) for minimal patient radiation dose.
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 165"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Half-life decay staircase from 100 percent at t=0 to 50 percent at 1 half-life, 25 percent at 2, 12.5 percent at 3, and 6.25 percent at 4 half-lives"
            >
              <rect x="0" y="0" width="740" height="165" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · First-Order Nuclear Half-Life Ladder N(t) = N₀ · (½)ⁿ
              </text>

              {[
                { n: 't = 0', pct: '100%', h: 78, fill: '#111827', x: 36 },
                { n: '1 t₁/₂', pct: '50.0%', h: 39, fill: '#EA580C', x: 175 },
                { n: '2 t₁/₂', pct: '25.0%', h: 20, fill: '#F97316', x: 314 },
                { n: '3 t₁/₂', pct: '12.5%', h: 10, fill: '#0284C7', x: 453 },
                { n: '4 t₁/₂', pct: '6.25%', h: 5, fill: '#059669', x: 592 },
              ].map((b) => (
                <g key={b.n}>
                  <rect x={b.x} y={124 - b.h} width="96" height={b.h} rx="5" fill={b.fill} />
                  <text x={b.x + 48} y={118 - b.h} textAnchor="middle" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill={b.fill}>
                    {b.pct}
                  </text>
                  <text x={b.x + 48} y="143" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">
                    {b.n}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}
