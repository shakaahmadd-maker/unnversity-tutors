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
// 26. VSEPR MOLECULAR GEOMETRY EXAMPLES
// ============================================================================
export function VseprExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Molecular Dipole Moment &amp; Lone-Pair Repulsion · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Why Water (H₂O) Is Bent &amp; Polar While Xenon Tetrafluoride (XeF₄) Is Square Planar &amp; Nonpolar
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="vsepr-h2o"
              loadedKey={loadedKey}
              label="Load H₂O (AX₂E₂)"
              onClick={() =>
                onSimulate('vsepr-h2o', {
                  slug: 'vsepr-molecular-geometry-visualizer',
                  moleculeId: 'h2o',
                })
              }
            />
            <ChemSimulateButton
              presetKey="vsepr-xef4"
              loadedKey={loadedKey}
              label="Load XeF₄ (AX₄E₂)"
              onClick={() =>
                onSimulate('vsepr-xef4', {
                  slug: 'vsepr-molecular-geometry-visualizer',
                  moleculeId: 'xef4',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            In <strong>Water (AX₂E₂)</strong>, two diffuse <code className="font-mono">sp³</code> lone pairs squeeze the H–O–H bond angle from 109.5° down to <strong>104.5°</strong>, giving a strong upward net dipole (<code className="font-mono">μ = 1.85 D</code>) that makes water Earth&apos;s universal polar solvent. Conversely, in <strong>XeF₄ (AX₄E₂)</strong>, two lone pairs sit 180° apart axially while four F atoms sit symmetrically coplanar at 90°, completely canceling every bond dipole (<code className="font-mono">μ = 0 D</code>)!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 190"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Comparison between polar Bent H2O with 104.5 degree bond angle and nonpolar Square Planar XeF4 with canceling trans lone pairs"
            >
              <rect x="0" y="0" width="740" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Symmetry vs. Lone-Pair Compression in 3D VSEPR
              </text>

              {/* H2O Schematic */}
              <rect x="24" y="42" width="335" height="130" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="42" y="64" fontSize="13" fontWeight="700" fill="#111827">H₂O · AX₂E₂ (Bent · 104.5° · Polar)</text>
              <ellipse cx="145" cy="96" rx="22" ry="12" transform="rotate(-35 145 96)" fill="rgba(245,158,11,0.28)" stroke="#D97706" strokeDasharray="3 2" />
              <ellipse cx="195" cy="96" rx="22" ry="12" transform="rotate(35 195 96)" fill="rgba(245,158,11,0.28)" stroke="#D97706" strokeDasharray="3 2" />
              <line x1="170" y1="112" x2="128" y2="146" stroke="#1E293B" strokeWidth="3" />
              <line x1="170" y1="112" x2="212" y2="146" stroke="#1E293B" strokeWidth="3" />
              <circle cx="170" cy="112" r="14" fill="#DC2626" />
              <text x="170" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">O</text>
              <circle cx="128" cy="146" r="10" fill="#F8FAFC" stroke="#334155" />
              <text x="128" y="150" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#111827">H</text>
              <circle cx="212" cy="146" r="10" fill="#F8FAFC" stroke="#334155" />
              <text x="212" y="150" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#111827">H</text>
              <text x="242" y="128" fontSize="11" fontWeight="700" fill="#EA580C">Net μ = 1.85 D ↑</text>

              {/* XeF4 Schematic */}
              <rect x="380" y="42" width="336" height="130" rx="12" fill="#F0F9FF" stroke="#BAE6FD" />
              <text x="398" y="64" fontSize="13" fontWeight="700" fill="#111827">XeF₄ · AX₄E₂ (Square Planar · Nonpolar)</text>
              <ellipse cx="520" cy="84" rx="9" ry="16" fill="rgba(245,158,11,0.28)" stroke="#D97706" strokeDasharray="3 2" />
              <ellipse cx="520" cy="150" rx="9" ry="16" fill="rgba(245,158,11,0.28)" stroke="#D97706" strokeDasharray="3 2" />
              <line x1="472" y1="117" x2="568" y2="117" stroke="#1E293B" strokeWidth="2.8" />
              <line x1="488" y1="100" x2="552" y2="134" stroke="#475569" strokeWidth="2.2" />
              <circle cx="520" cy="117" r="15" fill="#06B6D4" />
              <text x="520" y="121" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0F172A">Xe</text>
              {[
                { x: 472, y: 117 },
                { x: 568, y: 117 },
                { x: 488, y: 100 },
                { x: 552, y: 134 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="9.5" fill="#10B981" />
                  <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFFFFF">F</text>
                </g>
              ))}
              <text x="598" y="120" fontSize="11" fontWeight="700" fill="#059669">Symmetric μ = 0 D</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 27. DEGREE OF UNSATURATION (IHD) EXAMPLES
// ============================================================================
export function IhdUnsaturationExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Medicinal Chemistry Structure Elucidation · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Dissecting Aspirin (C₉H₈O₄, IHD = 6) Into Benzene Ring + Two Carbonyls
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="ihd-aspirin"
              loadedKey={loadedKey}
              label="Load Aspirin (IHD = 6)"
              onClick={() =>
                onSimulate('ihd-aspirin', {
                  slug: 'degree-of-unsaturation-ihd-calculator',
                  formula: 'C9H8O4',
                })
              }
            />
            <ChemSimulateButton
              presetKey="ihd-tylenol"
              loadedKey={loadedKey}
              label="Load Acetaminophen (IHD = 5)"
              onClick={() =>
                onSimulate('ihd-tylenol', {
                  slug: 'degree-of-unsaturation-ihd-calculator',
                  formula: 'C8H9NO2',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Before drawing a single Lewis structure from mass spectrometry, compute{' '}
            <code className="font-mono font-bold text-[#EA580C]">IHD = ½(2C + 2 + N − H − X)</code>. For Acetylsalicylic Acid (<code className="font-mono font-bold text-[#111827]">C₉H₈O₄</code>),{' '}
            <code className="font-mono">½(18 + 2 − 8) = 6</code> immediately tells you the 4 oxygen atoms do not alter IHD, and the value <strong>6</strong> cleanly decomposes into <strong>1 benzene ring (4 IHD) + 1 carboxylic acid C=O (1 IHD) + 1 ester C=O (1 IHD)</strong>!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 155"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Aspirin C9H8O4 IHD breakdown equals 4 from benzene ring plus 1 from ester carbonyl plus 1 from acid carbonyl equals 6 total"
            >
              <rect x="0" y="0" width="740" height="155" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Aspirin (C₉H₈O₄) Unsaturation Budget = 6 Total
              </text>

              <rect x="24" y="48" width="215" height="82" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
              <text x="131" y="74" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">Phenyl Ring (Ph)</text>
              <text x="131" y="96" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#EA580C">1 Ring + 3 π = 4 IHD</text>
              <text x="131" y="116" textAnchor="middle" fontSize="10.5" fill="#64748B">Aromatic core scaffold</text>

              <text x="255" y="94" fontSize="20" fontWeight="700" fill="#94A3B8">+</text>

              <rect x="275" y="48" width="180" height="82" rx="12" fill="#F0F9FF" stroke="#BAE6FD" />
              <text x="365" y="74" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">Ester + Acid C=O</text>
              <text x="365" y="96" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#0284C7">1 + 1 = 2 π IHD</text>
              <text x="365" y="116" textAnchor="middle" fontSize="10.5" fill="#64748B">4 Oxygens = 0 IHD effect</text>

              <text x="472" y="94" fontSize="20" fontWeight="700" fill="#94A3B8">=</text>

              <rect x="494" y="48" width="222" height="82" rx="12" fill="#ECFDF5" stroke="#A7F3D0" />
              <text x="605" y="74" textAnchor="middle" fontSize="13" fontWeight="700" fill="#065F46">Total C₉H₈O₄ Score</text>
              <text x="605" y="100" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="700" fill="#059669">IHD = 6.0</text>
              <text x="605" y="118" textAnchor="middle" fontSize="10.5" fill="#065F46">Verified Structural Match</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 28. IR & NMR SPECTROSCOPY EXAMPLES
// ============================================================================
export function SpectroscopyExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Combined IR + ¹H NMR Unknowns · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Identifying Ethyl Acetate Solvent by 1740 cm⁻¹ Ester Peak &amp; δ 4.12 ppm Quartet
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="spec-carbonyl"
              loadedKey={loadedKey}
              label="Filter Carbonyl Peaks"
              onClick={() =>
                onSimulate('spec-carbonyl', {
                  slug: 'ir-nmr-spectroscopy-lookup',
                  query: 'Carbonyl',
                  modeFilter: 'All',
                })
              }
            />
            <ChemSimulateButton
              presetKey="spec-nmr"
              loadedKey={loadedKey}
              label="Filter ¹H NMR Signals"
              onClick={() =>
                onSimulate('spec-nmr', {
                  slug: 'ir-nmr-spectroscopy-lookup',
                  query: '',
                  modeFilter: '1H NMR',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Ethyl Acetate (<code className="font-mono font-bold text-[#111827]">CH₃–C(=O)–O–CH₂CH₃</code>) shows three unmistakable fingerprints: a razor-sharp IR ester carbonyl at <strong>1740 cm⁻¹</strong> (zero broad O–H around 3300), a deshielded <strong>2H quartet at δ 4.12 ppm</strong> (<code className="font-mono">–OCH₂–</code> coupled to 3 methyl protons via n+1 = 4), and a <strong>3H singlet at δ 2.04 ppm</strong>!
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 165"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Ethyl Acetate 1H NMR spectrum schematic showing 2H quartet at 4.12 ppm, 3H singlet at 2.04 ppm, and 3H triplet at 1.25 ppm"
            >
              <rect x="0" y="0" width="740" height="165" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Diagnostic ¹H NMR Pattern of Ethyl Acetate (CH₃COOCH₂CH₃)
              </text>

              {/* Baseline (downfield left 5 ppm to upfield right 0 ppm) */}
              <line x1="40" y1="126" x2="700" y2="126" stroke="#334155" strokeWidth="1.8" />

              {/* 4.12 ppm 2H Quartet (1:3:3:1) */}
              <line x1="168" y1="126" x2="168" y2="108" stroke="#EA580C" strokeWidth="2.5" />
              <line x1="174" y1="126" x2="174" y2="72" stroke="#EA580C" strokeWidth="2.5" />
              <line x1="180" y1="126" x2="180" y2="72" stroke="#EA580C" strokeWidth="2.5" />
              <line x1="186" y1="126" x2="186" y2="108" stroke="#EA580C" strokeWidth="2.5" />
              <text x="177" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#EA580C">δ 4.12 (2H, Quartet)</text>
              <text x="177" y="67" textAnchor="middle" fontSize="9.5" fill="#475569">–OCH₂– (n+1 = 4)</text>

              {/* 2.04 ppm 3H Singlet */}
              <line x1="418" y1="126" x2="418" y2="56" stroke="#0284C7" strokeWidth="3" />
              <text x="418" y="45" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284C7">δ 2.04 (3H, Singlet)</text>

              {/* 1.25 ppm 3H Triplet (1:2:1) */}
              <line x1="556" y1="126" x2="556" y2="96" stroke="#059669" strokeWidth="2.5" />
              <line x1="562" y1="126" x2="562" y2="66" stroke="#059669" strokeWidth="2.5" />
              <line x1="568" y1="126" x2="568" y2="96" stroke="#059669" strokeWidth="2.5" />
              <text x="562" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">δ 1.25 (3H, Triplet)</text>

              <text x="45" y="145" fontSize="10" fontFamily="monospace" fill="#64748B">5.0 ppm (Downfield)</text>
              <text x="695" y="145" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#64748B">0.0 ppm (TMS)</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

// ============================================================================
// 29. BEER-LAMBERT LAW EXAMPLES
// ============================================================================
export function BeerLambertExamples({ loadedKey, onSimulate }: ChemExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · UV-Vis Spectrophotometry &amp; Biochemistry Assays · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Quantifying NADH Enzyme Kinetics at 340 nm &amp; Bradford Protein Standards at 595 nm
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChemSimulateButton
              presetKey="bl-nadh"
              loadedKey={loadedKey}
              label="Load NADH Assay (340 nm)"
              onClick={() =>
                onSimulate('bl-nadh', {
                  slug: 'beer-lambert-calibration-plotter',
                  assayName: 'NADH UV Assay (340 nm, µM · ε = 6,220 M⁻¹cm⁻¹)',
                  standards: [
                    { c: 20, a: 0.124 },
                    { c: 40, a: 0.249 },
                    { c: 80, a: 0.498 },
                    { c: 120, a: 0.746 },
                  ],
                  unknownAbs: 0.466,
                })
              }
            />
            <ChemSimulateButton
              presetKey="bl-bsa"
              loadedKey={loadedKey}
              label="Load Bradford Protein"
              onClick={() =>
                onSimulate('bl-bsa', {
                  slug: 'beer-lambert-calibration-plotter',
                  assayName: 'Bradford BSA Assay (595 nm, µg/mL)',
                  standards: [
                    { c: 2.0, a: 0.142 },
                    { c: 4.0, a: 0.285 },
                    { c: 6.0, a: 0.421 },
                    { c: 8.0, a: 0.568 },
                    { c: 10.0, a: 0.709 },
                  ],
                  unknownAbs: 0.375,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            In a 1.00 cm quartz cuvette, NADH absorbs 340 nm UV light with molar absorptivity <code className="font-mono font-bold text-[#111827]">ε = 6,220 M⁻¹cm⁻¹</code>. Reading <code className="font-mono font-bold text-[#EA580C]">A = 0.466 AU</code> corresponds to 34.2% transmittance and an exact concentration of <strong>74.9 µM</strong> inside the optimal linear 0.1–1.0 AU detector window.
          </p>

          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox="0 0 740 155"
              className="w-full min-w-[540px] h-auto block"
              role="img"
              aria-label="Beer-Lambert UV-Vis cuvette schematic showing 100 percent incident beam I0 passing through a 1 cm cuvette leaving 34.2 percent transmitted beam I"
            >
              <rect x="0" y="0" width="740" height="155" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
              <text x="24" y="26" fontSize="12" fontWeight="700" fill="#EA580C">
                university-tutors.com · Beer-Lambert Cuvette Attenuation: A = log₁₀(I₀ / I) = ε · l · c
              </text>

              {/* Incident light */}
              <line x1="42" y1="86" x2="242" y2="86" stroke="#F97316" strokeWidth="6" />
              <polygon points="242,77 258,86 242,95" fill="#F97316" />
              <text x="145" y="70" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">Incident I₀ = 100%</text>

              {/* 1 cm Cuvette */}
              <rect x="266" y="48" width="132" height="78" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
              <text x="332" y="82" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#0369A1">l = 1.00 cm</text>
              <text x="332" y="102" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#0C4A6E">74.9 µM NADH</text>

              {/* Transmitted light */}
              <line x1="406" y1="86" x2="546" y2="86" stroke="#059669" strokeWidth="3" />
              <polygon points="546,79 560,86 546,93" fill="#059669" />
              <text x="480" y="70" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#059669">I = 34.2% T</text>

              {/* Detector Readout */}
              <rect x="568" y="54" width="144" height="64" rx="10" fill="#111827" />
              <text x="640" y="80" textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#FDBA74">A = 0.466 AU</text>
              <text x="640" y="101" textAnchor="middle" fontSize="10" fill="#CBD5E1">R² = 0.9999 Fit</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}
