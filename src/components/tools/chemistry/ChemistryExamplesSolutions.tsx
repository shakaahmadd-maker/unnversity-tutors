import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import type { ChemExampleTriggerProps } from './ChemistryExamplesGeneral';

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
// 20. SOLUTION CONCENTRATION CONVERTER EXAMPLES
// ============================================================================
export function ConcentrationConverterExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Reagent-Grade Acid Density Conversion · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Concentrated 98% Sulfuric Acid (H₂SO₄, d = 1.84 g/mL) vs. Normal Saline
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="conc-h2so4"
              loadedKey={loadedKey}
              label="Load 18.39 M H₂SO₄"
              onClick={() =>
                onSimulate('conc-h2so4', {
                  slug: 'solution-concentration-converter',
                  molarity: 18.39,
                  soluteMm: 98.079,
                  densityGml: 1.84,
                  equivFactor: 2,
                })
              }
            />
            <ChemSimulateButton
              presetKey="conc-saline"
              loadedKey={loadedKey}
              label="Load 0.154 M Saline"
              onClick={() =>
                onSimulate('conc-saline', {
                  slug: 'solution-concentration-converter',
                  molarity: 0.154,
                  soluteMm: 58.44,
                  densityGml: 1.005,
                  equivFactor: 1,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Reagent bottles print mass percent (<code className="font-mono font-bold text-[#111827]">98.0% w/w H₂SO₄</code>) and specific gravity (<code className="font-mono">d = 1.84 g/mL</code>). Using density bridges 1.00 L solution mass (1,840 g) directly to Molarity (<strong>18.39 M</strong>) and Diprotic Normality (<strong>36.77 N</strong>).
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 155"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Density bridge diagram converting 18.39 molar H2SO4 at 1.84 grams per mL into 36.77 Normal and 98 percent weight by weight"
            >
              <rect x="0" y="0" width="740" height="155" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Density Bridge for Aqueous Concentration Units
              </text>

              <rect x="24" y="46" width="160" height="84" rx="10" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="104" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#EA580C">Molarity (M)</text>
              <text x="104" y="96" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="700" fill="#111827">18.39 M</text>
              <text x="104" y="116" textAnchor="middle" fontSize="10" fill="#475569">mol / L solution</text>

              <rect x="200" y="46" width="160" height="84" rx="10" fill="#F0F9FF" stroke="#BAE6FD" />
              <text x="280" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284C7">Normality (z=2)</text>
              <text x="280" y="96" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="700" fill="#111827">36.78 N</text>
              <text x="280" y="116" textAnchor="middle" fontSize="10" fill="#475569">eq H⁺ / L solution</text>

              <rect x="376" y="46" width="160" height="84" rx="10" fill="#ECFDF5" stroke="#A7F3D0" />
              <text x="456" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">Mass % (w/w)</text>
              <text x="456" y="96" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="700" fill="#111827">98.0%</text>
              <text x="456" y="116" textAnchor="middle" fontSize="10" fill="#475569">via d = 1.84 g/mL</text>

              <rect x="552" y="46" width="164" height="84" rx="10" fill="#F8FAFC" stroke="#CBD5E1" />
              <text x="634" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">IV Saline Ref</text>
              <text x="634" y="96" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="700" fill="#111827">0.90% w/w</text>
              <text x="634" y="116" textAnchor="middle" fontSize="10" fill="#475569">Isotonic 0.154 M NaCl</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 21. pH & HENDERSON-HASSELBALCH BUFFER EXAMPLES
// ============================================================================
export function PhBufferExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Clinical Acid-Base Homeostasis · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Human Arterial Blood Bicarbonate Buffer (pH 7.40) vs. Acetate Lab Buffer
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="ph-blood"
              loadedKey={loadedKey}
              label="Load Blood pH 7.40"
              onClick={() =>
                onSimulate('ph-blood', {
                  slug: 'ph-buffer-calculator',
                  pKa: 6.1,
                  acidConc: 0.0012,
                  baseConc: 0.024,
                })
              }
            />
            <ChemSimulateButton
              presetKey="ph-acetate"
              loadedKey={loadedKey}
              label="Load Acetate pH 4.98"
              onClick={() =>
                onSimulate('ph-acetate', {
                  slug: 'ph-buffer-calculator',
                  pKa: 4.76,
                  acidConc: 0.15,
                  baseConc: 0.25,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Healthy arterial blood regulates <code className="font-mono font-bold text-[#111827]">[HCO₃⁻] = 24 mM</code> against dissolved carbonic acid (<code className="font-mono font-bold text-[#111827]">[H₂CO₃] = 1.2 mM, pKa = 6.10</code>), maintaining a 20:1 base-to-acid ratio so{' '}
            <code className="font-mono font-bold text-[#EA580C]">pH = 6.10 + log₁₀(20) = 7.40</code>. Because physiological pH sits 1.3 units above pKa, lungs and kidneys continuously blow off CO₂ to protect the alkaline side!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 150"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="pH scale diagram highlighting Acetate Buffer window 3.76 to 5.76 and Blood Bicarbonate target pH 7.40"
            >
              <rect x="0" y="0" width="740" height="150" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Buffer Capacity Zone (pKa ± 1.0) vs. Blood pH 7.40
              </text>

              <defs>
                <linearGradient id="chemPhGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <rect x="30" y="64" width="680" height="16" rx="8" fill="url(#chemPhGrad)" />

              {/* Acetate window pH 3.76 to 5.76 */}
              <rect x="212" y="54" width="98" height="36" rx="8" fill="rgba(249,115,22,0.18)" stroke="#EA580C" strokeWidth="2" />
              <text x="261" y="48" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#EA580C">Acetate Buffer (4.76±1)</text>

              {/* Blood pH 7.40 marker */}
              <circle cx="389" cy="72" r="8" fill="#111827" stroke="#FFFFFF" strokeWidth="2.5" />
              <text x="389" y="108" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#111827">
                Arterial Blood pH 7.40 ([HCO₃⁻]:[H₂CO₃] = 20:1)
              </text>
              <text x="30" y="130" fontSize="10" fontFamily="monospace" fill="#64748B">pH 0 (Acidic)</text>
              <text x="370" y="130" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#64748B">pH 7.0</text>
              <text x="710" y="130" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#64748B">pH 14 (Basic)</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 22. ACID-BASE TITRATION PLOTTER EXAMPLES
// ============================================================================
export function TitrationPlotterExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Weak Acid vs. Strong Acid Titration · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Acetic Acid Vinegar Titration (pH 8.73 Inflection) &amp; Indicator Choice
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="tit-acetic"
              loadedKey={loadedKey}
              label="Load Acetic + NaOH"
              onClick={() =>
                onSimulate('tit-acetic', {
                  slug: 'acid-base-titration-plotter',
                  acidVolMl: 25,
                  acidM: 0.1,
                  pKa: 4.76,
                  baseM: 0.1,
                })
              }
            />
            <ChemSimulateButton
              presetKey="tit-formic"
              loadedKey={loadedKey}
              label="Load Formic Acid (pKa 3.75)"
              onClick={() =>
                onSimulate('tit-formic', {
                  slug: 'acid-base-titration-plotter',
                  acidVolMl: 25,
                  acidM: 0.12,
                  pKa: 3.75,
                  baseM: 0.1,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Every weak acid titration exhibits a flat <strong>buffer zone centered at Half-Equivalence (0.5·V_eq, pH = pKa)</strong> followed by a basic equivalence point (<code className="font-mono font-bold text-[#111827]">pH = 8.73</code> for acetate). Choosing <strong>Phenolphthalein (pH 8.2–10.0)</strong> hits the steep vertical rise accurately, whereas Methyl Orange changes way too early inside the buffer plateau!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 165"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Key milestones along a weak acid strong base titration curve from pH 2.88 start to pH 4.76 half-equivalence and pH 8.73 equivalence point"
            >
              <rect x="0" y="0" width="740" height="165" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · 4 Key Landmarks on a Weak-Acid Titration Curve (25 mL 0.10 M HA)
              </text>

              {[
                { x: 24, step: '0 mL Added', title: 'Initial Weak Acid', val: 'pH = 2.88', bg: '#F8FAFC', bdr: '#CBD5E1', txt: '#334155' },
                { x: 200, step: '12.5 mL (½ V_eq)', title: 'Max Buffer Zone', val: 'pH = pKa = 4.76', bg: '#F0F9FF', bdr: '#BAE6FD', txt: '#0369A1' },
                { x: 376, step: '25.0 mL (V_eq)', title: 'Conjugate Hydrolysis', val: 'pH = 8.73 ★', bg: '#FFF7ED', bdr: '#FDBA74', txt: '#EA580C' },
                { x: 552, step: '35.0 mL Excess', title: 'Strong Base Region', val: 'pH = 12.22', bg: '#ECFDF5', bdr: '#A7F3D0', txt: '#059669' },
              ].map((card) => (
                <g key={card.step}>
                  <rect x={card.x} y="46" width="164" height="94" rx="10" fill={card.bg} stroke={card.bdr} />
                  <text x={card.x + 82} y="68" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#64748B">{card.step}</text>
                  <text x={card.x + 82} y="92" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">{card.title}</text>
                  <text x={card.x + 82} y="118" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill={card.txt}>{card.val}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 23. IDEAL GAS LAW EXAMPLES
// ============================================================================
export function IdealGasExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Automotive Safety Engineering &amp; STP Molar Volume · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Automotive Airbag Rapid N₂ Deployment vs. Standard STP Gas Volume
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="gas-airbag"
              loadedKey={loadedKey}
              label="Load Airbag Inflation (V)"
              onClick={() =>
                onSimulate('gas-airbag', {
                  slug: 'ideal-gas-law-solver',
                  solveFor: 'V',
                  pAtm: 1.08,
                  nMol: 2.31,
                  tKelvin: 300.15,
                })
              }
            />
            <ChemSimulateButton
              presetKey="gas-scuba"
              loadedKey={loadedKey}
              label="Load Scuba Tank (P)"
              onClick={() =>
                onSimulate('gas-scuba', {
                  slug: 'ideal-gas-law-solver',
                  solveFor: 'P',
                  vL: 11.1,
                  nMol: 91.5,
                  tKelvin: 295.15,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            When a crash sensor ignites 100 g of sodium azide (<code className="font-mono font-bold text-[#111827]">2 NaN₃ → 2 Na + 3 N₂</code>), it releases <strong>2.31 moles of warm Nitrogen gas</strong> at ~300 K and 1.08 atm, expanding inside 30 milliseconds into a <strong>52.7 L protective cushion</strong> via <code className="font-mono font-bold text-[#EA580C]">V = nRT/P</code>!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 155"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Ideal gas law piston schematic showing 2.31 mol Nitrogen expanding to 52.7 liters at 1.08 atm and 300.15 K"
            >
              <rect x="0" y="0" width="740" height="155" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Automotive Airbag PV = nRT Expansion Balance
              </text>

              <rect x="24" y="48" width="215" height="82" rx="12" fill="#F8FAFC" stroke="#CBD5E1" />
              <text x="131" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">100 g NaN₃ Solid</text>
              <text x="131" y="96" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#EA580C">→ 2.31 mol N₂ Gas</text>
              <text x="131" y="116" textAnchor="middle" fontSize="10.5" fill="#64748B">T = 300.15 K (27 °C)</text>

              <line x1="246" y1="89" x2="296" y2="89" stroke="#EA580C" strokeWidth="2.5" />
              <polygon points="296,83 308,89 296,95" fill="#EA580C" />

              <rect x="314" y="42" width="402" height="94" rx="22" fill="#FFF7ED" stroke="#FB923C" strokeWidth="2" />
              <text x="515" y="72" textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="700" fill="#111827">
                V = (2.31 × 0.08206 × 300.15) / 1.08 = 52.7 L
              </text>
              <text x="515" y="96" textAnchor="middle" fontSize="11.5" fill="#EA580C" fontWeight="700">
                Inflates driver-side airbag cushion in ~30 milliseconds
              </text>
              <text x="515" y="118" textAnchor="middle" fontSize="10.5" fill="#64748B">
                Always convert Celsius to Kelvin (T_K = °C + 273.15) before dividing!
              </text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 24. GIBBS FREE ENERGY & THERMOCHEMISTRY EXAMPLES
// ============================================================================
export function GibbsThermoExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Thermodynamic Temperature Crossover · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Haber Ammonia Spontaneity Inversion (464 K) vs. Limestone Calcination
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="gibbs-haber"
              loadedKey={loadedKey}
              label="Load Haber (298 K)"
              onClick={() =>
                onSimulate('gibbs-haber', {
                  slug: 'thermochemistry-gibbs-calculator',
                  deltaHKj: -92.2,
                  deltaSJ: -198.7,
                  tempK: 298.15,
                })
              }
            />
            <ChemSimulateButton
              presetKey="gibbs-caco3"
              loadedKey={loadedKey}
              label="Load CaCO₃ Kiln (1,200 K)"
              onClick={() =>
                onSimulate('gibbs-caco3', {
                  slug: 'thermochemistry-gibbs-calculator',
                  deltaHKj: 178.3,
                  deltaSJ: 160.4,
                  tempK: 1200,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Thermochemistry opposes enthalpy against entropy across temperature: Ammonia synthesis (<code className="font-mono font-bold text-[#111827]">ΔH = −92.2 kJ, ΔS = −198.7 J/K</code>) is <strong>spontaneous below 464 K</strong> and reverses at higher furnace temperatures. Conversely, limestone decomposition (<code className="font-mono">ΔH = +178.3 kJ, ΔS = +160.4 J/K</code>) requires cement kilns hotter than <strong>1,112 K (839 °C)</strong>!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 155"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="4-quadrant Gibbs Free Energy matrix showing spontaneous always when delta H negative and delta S positive"
            >
              <rect x="0" y="0" width="740" height="155" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Thermodynamic Spontaneity Sign Matrix (ΔG = ΔH − TΔS)
              </text>

              {[
                { x: 24, sign: 'ΔH < 0, ΔS > 0', title: 'Always Spontaneous', note: 'ΔG < 0 at ALL T', bg: '#ECFDF5', bdr: '#A7F3D0', col: '#059669' },
                { x: 200, sign: 'ΔH < 0, ΔS < 0', title: 'Low-T Spontaneous', note: 'Spont. if T < ΔH/ΔS', bg: '#FFF7ED', bdr: '#FDBA74', col: '#EA580C' },
                { x: 376, sign: 'ΔH > 0, ΔS > 0', title: 'High-T Spontaneous', note: 'Spont. if T > ΔH/ΔS', bg: '#F0F9FF', bdr: '#BAE6FD', col: '#0284C7' },
                { x: 552, sign: 'ΔH > 0, ΔS < 0', title: 'Never Spontaneous', note: 'ΔG > 0 at ALL T', bg: '#FEF2F2', bdr: '#FECACA', col: '#DC2626' },
              ].map((q) => (
                <g key={q.sign}>
                  <rect x={q.x} y="46" width="164" height="86" rx="10" fill={q.bg} stroke={q.bdr} />
                  <text x={q.x + 82} y="68" textAnchor="middle" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill={q.col}>{q.sign}</text>
                  <text x={q.x + 82} y="92" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">{q.title}</text>
                  <text x={q.x + 82} y="114" textAnchor="middle" fontSize="10.5" fill="#475569">{q.note}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 25. NERNST ELECTROCHEMISTRY EXAMPLES
// ============================================================================
export function NernstCellExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Galvanic Cell &amp; Salt-Bridge Potential · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Daniell Zinc–Copper Battery: Boosting Voltage via Low-Q Ion Dilution
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="nernst-daniell"
              loadedKey={loadedKey}
              label="Load Daniell (+1.159 V)"
              onClick={() =>
                onSimulate('nernst-daniell', {
                  slug: 'nernst-electrochemistry-solver',
                  cellName: 'Daniell Cell (Zn | Zn²⁺ || Cu²⁺ | Cu)',
                  eCathode: 0.34,
                  eAnode: -0.76,
                  electronsN: 2,
                  reactionQ: 0.01,
                  tempK: 298.15,
                })
              }
            />
            <ChemSimulateButton
              presetKey="nernst-silver"
              loadedKey={loadedKey}
              label="Load Silver–Copper Cell"
              onClick={() =>
                onSimulate('nernst-silver', {
                  slug: 'nernst-electrochemistry-solver',
                  cellName: 'Silver-Copper Galvanic (Cu | Cu²⁺ || Ag⁺ | Ag)',
                  eCathode: 0.8,
                  eAnode: 0.34,
                  electronsN: 2,
                  reactionQ: 0.25,
                  tempK: 298.15,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            In a standard Daniell cell (<code className="font-mono font-bold text-[#111827]">Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)</code>), <code className="font-mono">E°cell = +0.34 − (−0.76) = +1.100 V</code>. Diluting product <code className="font-mono">[Zn²⁺] = 0.01 M</code> while keeping <code className="font-mono">[Cu²⁺] = 1.0 M</code> makes <code className="font-mono">Q = 0.01</code>, raising forward driving force to <strong>+1.159 V</strong>!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 190"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Daniell Galvanic cell diagram showing Zn anode oxidation sending electrons through a 1.159 V voltmeter to the Cu cathode with KNO3 salt bridge"
            >
              <rect x="0" y="0" width="740" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Galvanic Cell Flow (AN OX → RED CAT)
              </text>

              {/* Anode Beaker */}
              <rect x="40" y="76" width="210" height="92" rx="12" fill="#F8FAFC" stroke="#94A3B8" />
              <rect x="75" y="54" width="26" height="90" rx="4" fill="#64748B" />
              <text x="145" y="102" fontSize="12" fontWeight="700" fill="#111827">Anode (−): Zn → Zn²⁺ + 2e⁻</text>
              <text x="145" y="122" fontSize="11" fontFamily="monospace" fill="#475569">E° = −0.76 V · [Zn²⁺]=0.01 M</text>
              <text x="145" y="148" fontSize="10.5" fontWeight="700" fill="#EA580C">Oxidation (Mass decreases)</text>

              {/* Voltmeter */}
              <rect x="315" y="34" width="110" height="36" rx="10" fill="#111827" />
              <text x="370" y="57" textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#FDBA74">+1.159 V</text>
              <polyline points="88,54 88,52 315,52" fill="none" stroke="#EA580C" strokeWidth="2.5" />
              <polyline points="425,52 648,52 648,54" fill="none" stroke="#EA580C" strokeWidth="2.5" />
              <polygon points="303,47 314,52 303,57" fill="#EA580C" />
              <text x="200" y="45" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#EA580C">e⁻ electron flow →</text>

              {/* Salt bridge */}
              <path d="M 225 112 L 225 82 Q 370 68 515 82 L 515 112" fill="none" stroke="#0EA5E9" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
              <text x="370" y="100" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0369A1">Salt Bridge (K⁺ → · NO₃⁻ ←)</text>

              {/* Cathode Beaker */}
              <rect x="490" y="76" width="210" height="92" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
              <rect x="635" y="54" width="26" height="90" rx="4" fill="#EA580C" />
              <text x="580" y="102" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">Cathode (+): Cu²⁺ + 2e⁻ → Cu</text>
              <text x="580" y="122" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#475569">E° = +0.34 V · [Cu²⁺]=1.0 M</text>
              <text x="580" y="148" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#059669">Reduction (Cu plates on)</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}
