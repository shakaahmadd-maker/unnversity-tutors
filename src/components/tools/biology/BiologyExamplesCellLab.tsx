import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import type { ExampleTriggerProps } from './BiologyExamplesGenetics';

function SimulateButton({
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

export function SerialDilutionExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Wet-Lab Stock Prep &amp; ELISA Curves · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Antibiotic LB Agar Prep (C₁V₁ = C₂V₂) &amp; 1:2 Assay Dilution Racks
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="amp-stock"
              loadedKey={loadedKey}
              label="Simulate Ampicillin Prep"
              onClick={() =>
                onSimulate('amp-stock', {
                  slug: 'serial-dilution-molarity-calculator',
                  tab: 'c1v1',
                  c1: 10,
                  c1Unit: 'mM',
                  c2: 25,
                  c2Unit: 'µM',
                  v2: 50,
                  v2Unit: 'mL',
                })
              }
            />
            <SimulateButton
              presetKey="elisa-serial"
              loadedKey={loadedKey}
              label="Simulate 1:2 ELISA Rack"
              onClick={() =>
                onSimulate('elisa-serial', {
                  slug: 'serial-dilution-molarity-calculator',
                  tab: 'serial',
                  startConc: 1000,
                  startUnit: 'µM',
                  dilutionFactor: 2,
                  transferVolUl: 100,
                  numTubes: 6,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-[#111827]">1. Single-Step Stock Dilution (C₁V₁ = C₂V₂)</h4>
              <p>
                When pouring <strong>50 mL</strong> of selective culture medium at a working concentration of{' '}
                <code className="font-mono font-bold text-[#111827]">25 µM</code> from a concentrated{' '}
                <code className="font-mono font-bold text-[#EA580C]">10 mM (10,000 µM)</code> stock, match units first:
                <code className="font-mono block mt-1 bg-[#F9FAFB] p-2.5 rounded-xl border border-slate-200 text-xs text-[#111827]">
                  V₁ = (25 µM × 50 mL) ÷ 10,000 µM = 0.125 mL = 125.0 µL stock + 49.875 mL media
                </code>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-[#111827]">2. Multi-Tube Serial Dilution Series</h4>
              <p>
                Attempting to pipette <code className="font-mono">0.001 µL</code> directly from a concentrated stock is
                physically impossible. Transferring <strong>100 µL into 900 µL buffer</strong> across 4 tubes achieves a
                clean <strong>1:10,000 (10⁻⁴)</strong> final dilution using standard P200 micropipettes.
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com 1:10 Logarithmic Serial Dilution Schematic (100 µL Transfer → 900 µL Buffer)
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 165" className="w-full min-w-[520px] h-auto block" role="img" aria-label="4-tube 1:10 serial dilution rack showing 100 microliter transfers and exponential concentration drop">
                <rect x="0" y="0" width="740" height="165" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                {[
                  { x: 40, label: 'Stock (10⁰)', conc: '1,000 µM', fill: '#EA580C', text: '#FFFFFF' },
                  { x: 215, label: 'Tube 1 (10⁻¹)', conc: '100 µM', fill: '#F97316', text: '#FFFFFF' },
                  { x: 390, label: 'Tube 2 (10⁻²)', conc: '10 µM', fill: '#FB923C', text: '#111827' },
                  { x: 565, label: 'Tube 3 (10⁻³)', conc: '1.0 µM', fill: '#FED7AA', text: '#111827' },
                ].map((t, idx) => (
                  <g key={t.label}>
                    <rect x={t.x} y="42" width="110" height="78" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                    <rect x={t.x + 6} y="70" width="98" height="44" rx="8" fill={t.fill} />
                    <text x={t.x + 55} y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">{t.label}</text>
                    <text x={t.x + 55} y="97" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill={t.text}>{t.conc}</text>
                    <text x={t.x + 55} y="140" textAnchor="middle" fontSize="10" fill="#475569">
                      {idx === 0 ? 'Starting stock' : '100 µL + 900 µL buffer'}
                    </text>
                    {idx < 3 && (
                      <g>
                        <path d={`M ${t.x + 95} 40 Q ${t.x + 142} 14 ${t.x + 190} 40`} fill="none" stroke="#0284C7" strokeWidth="2" />
                        <polygon points={`${t.x + 186},35 ${t.x + 194},42 ${t.x + 183},44`} fill="#0284C7" />
                        <text x={t.x + 142} y="20" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#0284C7">100 µL</text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function CellGrowthExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Clinical Microbiology &amp; Food Safety · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              E. coli Log-Phase Doubling Time &amp; 30–300 CFU/mL Plate Screening
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="ecoli-log"
              loadedKey={loadedKey}
              label="Simulate E. coli Growth"
              onClick={() =>
                onSimulate('ecoli-log', {
                  slug: 'cell-growth-cfu-calculator',
                  tab: 'growth',
                  n0: 10000,
                  nt: 640000,
                  elapsedMinutes: 180,
                })
              }
            />
            <SimulateButton
              presetKey="uti-cfu"
              loadedKey={loadedKey}
              label="Simulate 148-Colony Plate"
              onClick={() =>
                onSimulate('uti-cfu', {
                  slug: 'cell-growth-cfu-calculator',
                  tab: 'cfu',
                  colonies: 148,
                  dilutionExponent: -5,
                  volumePlatedMl: 0.1,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-2.5 text-sm text-slate-600 leading-relaxed">
              <h4 className="text-lg font-bold text-[#111827]">Why Countable Plates Must Fall Between 30 and 300</h4>
              <p>
                In hospital UTI urinalysis and dairy food safety testing, microbiologists plate serial dilutions onto agar.
                A 0.1 mL spread plate from the <strong>10⁻⁵ dilution tube</strong> yielding <strong>148 colonies</strong>{' '}
                gives <code className="font-mono font-bold text-[#EA580C]">1.48 × 10⁸ CFU/mL</code>. Plates below 30
                colonies (TFTC) suffer high random sampling variance, while plates above 300 (TNTC) merge colonies together.
              </p>
            </div>
            <div className="lg:col-span-6 bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-[#EA580C] mb-2">
                university-tutors.com 4-Phase Bacterial Growth Curve
              </div>
              <svg viewBox="0 0 420 165" className="w-full h-auto block" role="img" aria-label="Bacterial growth curve showing Lag, Exponential Log phase where Nt=N0*2^n applies, Stationary, and Death phases">
                <rect x="0" y="0" width="420" height="165" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
                <line x1="40" y1="20" x2="40" y2="138" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="40" y1="138" x2="400" y2="138" stroke="#94A3B8" strokeWidth="1.5" />
                <rect x="115" y="20" width="110" height="118" fill="#FFF7ED" />
                <text x="170" y="34" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#EA580C">Log Phase (Nt = N0·2ⁿ)</text>
                <path
                  d="M 45 128 L 115 126 C 145 118, 180 55, 225 44 L 315 44 C 350 48, 375 85, 395 114"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="80" y="152" textAnchor="middle" fontSize="9.5" fill="#475569">Lag</text>
                <text x="170" y="152" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#EA580C">Exponential</text>
                <text x="270" y="152" textAnchor="middle" fontSize="9.5" fill="#475569">Stationary</text>
                <text x="360" y="152" textAnchor="middle" fontSize="9.5" fill="#475569">Death</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function MicroscopeFovExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Cell Micrometry &amp; Hematology · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Comparing RBCs (7.5 µm), Cheek Cells (60 µm) &amp; Onion Epidermis (200 µm)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="fov-onion"
              loadedKey={loadedKey}
              label="Load Onion 400× FOV"
              onClick={() =>
                onSimulate('fov-onion', {
                  slug: 'microscope-fov-calculator',
                  ocularMag: 10,
                  calibObjMag: 4,
                  calibFovMm: 4.5,
                  workingObjMag: 40,
                  cellsAcrossDiameter: 2.25,
                })
              }
            />
            <SimulateButton
              presetKey="fov-rbc"
              loadedKey={loadedKey}
              label="Load 1000× Oil RBC"
              onClick={() =>
                onSimulate('fov-rbc', {
                  slug: 'microscope-fov-calculator',
                  ocularMag: 10,
                  calibObjMag: 4,
                  calibFovMm: 4.5,
                  workingObjMag: 100,
                  cellsAcrossDiameter: 24,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            Because millimeter plastic rulers look wider than the entire field of view at 400× or 1,000×, students calibrate
            with the 4× objective first (<code className="font-mono font-bold">FOV₁ = 4.5 mm</code> at 40× total) and apply
            the inverse magnification law <code className="font-mono font-bold text-[#EA580C]">FOV₂ = FOV₁ × (M₁ / M₂)</code>.
          </p>
          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Micrometry Scale Reference (400× Objective FOV = 450 µm)
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 165" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Scale comparison of Onion epidermal cell (200 um), Cheek epithelial cell (60 um), and Red Blood Cell (7.5 um) inside a 450 um field of view">
                <rect x="0" y="0" width="740" height="165" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                {/* 450 um scale bar */}
                <line x1="40" y1="36" x2="700" y2="36" stroke="#111827" strokeWidth="2" />
                <line x1="40" y1="30" x2="40" y2="42" stroke="#111827" strokeWidth="2" />
                <line x1="700" y1="30" x2="700" y2="42" stroke="#111827" strokeWidth="2" />
                <text x="370" y="26" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="700" fill="#111827">400× High-Power Field of View Diameter = 450 µm (0.45 mm)</text>

                {/* Onion cell 200 um (~293 px) */}
                <rect x="40" y="60" width="293" height="36" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
                <text x="186" y="82" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Onion Epidermal Cell (~200 µm)</text>

                {/* Cheek cell 60 um (~88 px) */}
                <ellipse cx="420" cy="78" rx="44" ry="20" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
                <circle cx="420" cy="78" r="6" fill="#C2410C" />
                <text x="420" y="114" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#9A3412">Cheek Cell (~60 µm)</text>

                {/* RBC 7.5 um (~11 px) */}
                <circle cx="560" cy="78" r="8" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <text x="560" y="114" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#991B1B">RBC (7.5 µm)</text>

                {/* E. coli 2 um */}
                <rect x="655" y="75" width="7" height="4" rx="2" fill="#0284C7" />
                <text x="658" y="114" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0369A1">E. coli (2 µm)</text>

                <text x="40" y="146" fontSize="11" fill="#475569">Specimen Size = FOV (µm) ÷ Cells Across Diameter. Example: 450 µm ÷ 2.25 onion cells = 200.0 µm per cell.</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function CellExplorerExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Evolutionary &amp; Secretory Cell Biology · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Endosymbiotic Mitochondria &amp; The Endomembrane Insulin Pathway
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="cell-mito"
              loadedKey={loadedKey}
              label="Inspect Mitochondrion"
              onClick={() =>
                onSimulate('cell-mito', {
                  slug: 'interactive-cell-explorer',
                  cellType: 'animal',
                  organelleId: 'mitochondria',
                })
              }
            />
            <SimulateButton
              presetKey="cell-chloro"
              loadedKey={loadedKey}
              label="Inspect Plant Chloroplast"
              onClick={() =>
                onSimulate('cell-chloro', {
                  slug: 'interactive-cell-explorer',
                  cellType: 'plant',
                  organelleId: 'chloroplast',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-[#111827]">Endomembrane Protein Trafficking (Insulin Export)</h4>
              <p className="text-xs sm:text-sm">
                Pancreatic beta cells synthesize preproinsulin on <strong>Rough ER</strong> ribosomes, fold and cleave it
                into proinsulin in the ER lumen, ship it via COPII vesicles to the <strong>Golgi Apparatus</strong> for
                packaging, and release mature insulin into the bloodstream by <strong>exocytosis</strong>.
              </p>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-[#111827]">Endosymbiotic Evidence in Eukaryotes</h4>
              <p className="text-xs sm:text-sm">
                Why do mitochondria and chloroplasts carry <strong>70S ribosomes</strong> and <strong>circular DNA</strong>{' '}
                inside double membranes while host cytoplasm has 80S ribosomes? They descend from engulfed ancient aerobic
                alpha-proteobacteria and photosynthetic cyanobacteria.
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Secretory Pathway Flow Schematic
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 110" className="w-full min-w-[540px] h-auto block" role="img" aria-label="Endomembrane protein trafficking from Nucleus to Rough ER to Golgi Apparatus to Secretory Vesicle Exocytosis">
                <rect x="0" y="0" width="740" height="110" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                {[
                  { x: 18, title: '1. Nucleus', sub: 'mRNA transcription', bg: '#F1F5F9', stroke: '#94A3B8', fg: '#0F172A' },
                  { x: 168, title: '2. Rough ER', sub: 'Translation & folding', bg: '#FFF7ED', stroke: '#F97316', fg: '#9A3412' },
                  { x: 318, title: '3. COPII Vesicle', sub: 'Anterograde shuttle', bg: '#EFF6FF', stroke: '#3B82F6', fg: '#1D4ED8' },
                  { x: 468, title: '4. Golgi Body', sub: 'Glycosylation & sort', bg: '#ECFDF5', stroke: '#10B981', fg: '#065F46' },
                  { x: 618, title: '5. Exocytosis', sub: 'Extracellular export', bg: '#FEF3C7', stroke: '#D97706', fg: '#92400E' },
                ].map((s, idx) => (
                  <g key={s.title}>
                    <rect x={s.x} y="24" width="112" height="62" rx="10" fill={s.bg} stroke={s.stroke} strokeWidth="1.5" />
                    <text x={s.x + 56} y="50" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={s.fg}>{s.title}</text>
                    <text x={s.x + 56} y="68" textAnchor="middle" fontSize="9.5" fill="#475569">{s.sub}</text>
                    {idx < 4 && (
                      <g>
                        <line x1={s.x + 114} y1="55" x2={s.x + 144} y2="55" stroke="#64748B" strokeWidth="2" />
                        <polygon points={`${s.x + 142},50 ${s.x + 150},55 ${s.x + 142},60`} fill="#64748B" />
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
