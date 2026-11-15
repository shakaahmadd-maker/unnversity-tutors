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

export function BiodiversityExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Conservation &amp; Community Ecology · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Old-Growth Forest vs Eutrophic Algal Bloom Dominance
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="eco-forest"
              loadedKey={loadedKey}
              label="Load Old-Growth Forest"
              onClick={() =>
                onSimulate('eco-forest', {
                  slug: 'biodiversity-index-calculator',
                  speciesList: [
                    { id: '1', name: 'Douglas Fir', count: 22 },
                    { id: '2', name: 'Western Hemlock', count: 20 },
                    { id: '3', name: 'Sitka Spruce', count: 18 },
                    { id: '4', name: 'Bigleaf Maple', count: 16 },
                    { id: '5', name: 'Red Alder', count: 14 },
                  ],
                })
              }
            />
            <SimulateButton
              presetKey="eco-bloom"
              loadedKey={loadedKey}
              label="Load Eutrophic Pond"
              onClick={() =>
                onSimulate('eco-bloom', {
                  slug: 'biodiversity-index-calculator',
                  speciesList: [
                    { id: '1', name: 'Microcystis Algae', count: 240 },
                    { id: '2', name: 'Daphnia', count: 4 },
                    { id: '3', name: 'Mayfly Nymph', count: 2 },
                    { id: '4', name: 'Snail', count: 4 },
                  ],
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            Two ecosystems can hold multiple species yet differ dramatically in resilience. A balanced{' '}
            <strong>old-growth forest</strong> displays high Pielou Evenness (<code className="font-mono font-bold">E ≈ 0.99</code>{' '}
            and <code className="font-mono font-bold text-[#059669]">H′ ≈ 1.59</code>), whereas nutrient runoff causing an{' '}
            <strong>algal bloom</strong> collapses evenness (<code className="font-mono font-bold text-[#DC2626]">H′ ≈ 0.21</code>)
            because 96% of individuals belong to one opportunistic cyanobacterium.
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Rank-Abundance Comparison (Richness vs Evenness)
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 155" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Comparison of even old-growth forest species distribution versus dominated eutrophic algal pond">
                <rect x="0" y="0" width="740" height="155" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <text x="20" y="28" fontSize="12" fontWeight="700" fill="#059669">Healthy Even Ecosystem (H′ = 1.59, E = 0.99, 1−D = 0.80)</text>
                {[
                  { x: 20, w: 72, label: 'Fir 22' },
                  { x: 96, w: 66, label: 'Hemlock 20' },
                  { x: 166, w: 60, label: 'Spruce 18' },
                  { x: 230, w: 54, label: 'Maple 16' },
                  { x: 288, w: 48, label: 'Alder 14' },
                ].map((b, i) => (
                  <g key={b.label}>
                    <rect x={b.x} y="40" width={b.w} height="22" rx="4" fill={i % 2 === 0 ? '#059669' : '#10B981'} />
                    <text x={b.x + b.w / 2} y="55" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#FFFFFF">{b.label}</text>
                  </g>
                ))}

                <text x="20" y="96" fontSize="12" fontWeight="700" fill="#DC2626">Disturbed / Monoculture Bloom (H′ = 0.21, E = 0.15, 1−D = 0.08)</text>
                <rect x="20" y="108" width="580" height="22" rx="4" fill="#DC2626" />
                <text x="310" y="123" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">Microcystis Cyanobacteria (96.0% Dominance)</text>
                <rect x="604" y="108" width="12" height="22" rx="3" fill="#F59E0B" />
                <rect x="619" y="108" width="8" height="22" rx="3" fill="#0284C7" />
                <rect x="630" y="108" width="12" height="22" rx="3" fill="#64748B" />
                <text x="650" y="123" fontSize="10" fill="#475569">4% other</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function WaterPotentialExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · AP / University Plant Osmometry Lab · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Potato Core Sucrose Osmolarity &amp; Guard Cell Stomatal Turgor
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="wp-potato"
              loadedKey={loadedKey}
              label="Simulate Potato in 0.4 M Sucrose"
              onClick={() =>
                onSimulate('wp-potato', {
                  slug: 'water-potential-osmolarity-calculator',
                  ionizationFactor: 1,
                  molarityC: 0.4,
                  tempCelsius: 22,
                  pressureBar: 0,
                  externalPsiBar: -8.6,
                })
              }
            />
            <SimulateButton
              presetKey="wp-wilting"
              loadedKey={loadedKey}
              label="Simulate Saline Soil Stress"
              onClick={() =>
                onSimulate('wp-wilting', {
                  slug: 'water-potential-osmolarity-calculator',
                  ionizationFactor: 2,
                  molarityC: 0.25,
                  tempCelsius: 25,
                  pressureBar: 0,
                  externalPsiBar: -7.5,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            In the classic <strong>Potato Core Lab</strong>, cores submerged in sucrose beakers gain mass in hypotonic
            solutions (0.0–0.2 M) and lose mass in hypertonic solutions (0.4–0.8 M). Finding the x-intercept where{' '}
            <strong>% Mass Change = 0%</strong> (~0.35 M sucrose at 22 °C) directly measures internal potato cell{' '}
            <code className="font-mono font-bold text-[#EA580C]">Ψs = −8.58 bars</code>.
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Potato Core Mass Change Curve &amp; Isotonic Intercept
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 190" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Potato core percent change in mass versus sucrose molarity showing isotonic zero-crossing at 0.35 M">
                <rect x="0" y="0" width="740" height="190" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <line x1="70" y1="95" x2="690" y2="95" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="70" y1="22" x2="70" y2="165" stroke="#94A3B8" strokeWidth="1.5" />

                <text x="62" y="34" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#059669">+20%</text>
                <text x="62" y="99" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#111827" fontWeight="700">0%</text>
                <text x="62" y="160" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#DC2626">-20%</text>

                <line x1="100" y1="36" x2="660" y2="154" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="380" cy="95" r="7" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="315" y="54" width="180" height="30" rx="8" fill="#EFF6FF" stroke="#BFDBFE" />
                <text x="405" y="73" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D4ED8">Isotonic ≈ 0.35 M (Ψs = −8.58 bars)</text>

                <text x="160" y="135" fontSize="10.5" fontWeight="700" fill="#059669">Hypotonic: Water Enters Cell (Turgid)</text>
                <text x="540" y="50" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#DC2626">Hypertonic: Plasmolysis</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function HumanPhysiologyExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Clinical Cardiology &amp; Pulmonology · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Endurance Athlete Cardiac Output &amp; Obstructive Asthma FEV₁/FVC
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="phys-athlete"
              loadedKey={loadedKey}
              label="Simulate Athlete Heart"
              onClick={() =>
                onSimulate('phys-athlete', {
                  slug: 'human-physiology-calculators',
                  tab: 'cardiac',
                  hr: 50,
                  edv: 150,
                  esv: 50,
                })
              }
            />
            <SimulateButton
              presetKey="phys-asthma"
              loadedKey={loadedKey}
              label="Simulate Obstructive FEV₁"
              onClick={() =>
                onSimulate('phys-asthma', {
                  slug: 'human-physiology-calculators',
                  tab: 'lung',
                  fev1L: 2.3,
                  fvcL: 4.5,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-[#111827]">Why Endurance Athletes Have Resting Bradycardia (50 bpm)</h4>
              <p className="text-xs sm:text-sm">
                Aerobic training enlarges left-ventricular end-diastolic volume (<code className="font-mono">EDV = 150 mL</code>),
                raising Stroke Volume to <code className="font-mono font-bold text-[#EA580C]">100 mL/beat</code>. To deliver
                the same 5.0 L/min resting Cardiac Output, resting heart rate drops efficiently to{' '}
                <strong>50 bpm</strong>!
              </p>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-[#111827]">Sepsis MAP Floor &amp; Obstructive Spirometry</h4>
              <p className="text-xs sm:text-sm">
                ICU protocols target <strong>MAP ≥ 65 mmHg</strong> to perfuse kidneys and brain. Meanwhile, spirometry
                distinguishes asthma/COPD (<code className="font-mono font-bold text-[#DC2626]">FEV₁/FVC &lt; 70%</code>{' '}
                delayed airflow) from pulmonary fibrosis (<code className="font-mono font-bold text-[#0284C7]">≥ 80%</code>{' '}
                with reduced total FVC).
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Volume-Time Spirometry Curve (Normal 80% vs Obstructive 51% FEV₁/FVC)
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 175" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Spirometry forced expiratory volume curve over 6 seconds comparing normal 80% FEV1/FVC and obstructive asthma 51% FEV1/FVC">
                <rect x="0" y="0" width="740" height="175" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <line x1="60" y1="145" x2="680" y2="145" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="60" y1="22" x2="60" y2="145" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="190" y1="22" x2="190" y2="145" stroke="#0284C7" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="190" y="162" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0284C7">t = 1.0 sec (FEV₁)</text>
                <text x="650" y="162" textAnchor="middle" fontSize="10.5" fill="#475569">6.0 sec (FVC)</text>

                {/* Normal */}
                <path d="M 60 145 Q 110 38, 190 36 L 650 32" fill="none" stroke="#059669" strokeWidth="3.5" />
                <circle cx="190" cy="36" r="5" fill="#059669" />
                <text x="202" y="34" fontSize="11" fontWeight="700" fill="#059669">Normal: FEV₁ = 4.0 L / 5.0 L (80%)</text>

                {/* Obstructive */}
                <path d="M 60 145 Q 140 102, 190 86 Q 380 50, 650 45" fill="none" stroke="#EA580C" strokeWidth="3.5" />
                <circle cx="190" cy="86" r="5" fill="#EA580C" />
                <text x="202" y="98" fontSize="11" fontWeight="700" fill="#EA580C">Obstructive Asthma: FEV₁ = 2.3 L / 4.5 L (51%)</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function TaxonomyExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Field Botany &amp; ICZN/ICN Nomenclature · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Dichotomous Identification Keys &amp; Binomial Formatting Rules
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="tax-arabidopsis"
              loadedKey={loadedKey}
              label="Load Arabidopsis thaliana"
              onClick={() =>
                onSimulate('tax-arabidopsis', {
                  slug: 'taxonomic-dichotomous-key-builder',
                  tab: 'taxonomy',
                  presetIndex: 1,
                })
              }
            />
            <SimulateButton
              presetKey="tax-key"
              loadedKey={loadedKey}
              label="Start Plant Key Walk"
              onClick={() =>
                onSimulate('tax-key', {
                  slug: 'taxonomic-dichotomous-key-builder',
                  tab: 'key',
                  resetKey: true,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            Under International Codes of Nomenclature (ICZN / ICN), every scientific binomial capitalizes the{' '}
            <strong>Genus</strong> and lowercases the <strong>specific epithet</strong>—italicized in digital print (e.g.,{' '}
            <em>Arabidopsis thaliana</em>, <em>Escherichia coli</em>, <em>Homo sapiens</em>). Dichotomous keys resolve
            unknown field specimens using mutually exclusive observable couplets (1a vs 1b).
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Plant Phyla Dichotomous Decision Tree
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 170" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Dichotomous branching decision tree separating Bryophytes, Pteridophytes, Gymnosperms, and Angiosperms">
                <rect x="0" y="0" width="740" height="170" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <rect x="20" y="64" width="145" height="42" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
                <text x="92" y="82" textAnchor="middle" fontSize="11" fontWeight="700" fill="#9A3412">1. Vascular Tissue?</text>
                <text x="92" y="97" textAnchor="middle" fontSize="9.5" fill="#475569">Xylem &amp; Phloem check</text>

                <line x1="165" y1="75" x2="225" y2="38" stroke="#64748B" strokeWidth="2" />
                <text x="195" y="48" fontSize="9.5" fontWeight="700" fill="#DC2626">1b. No</text>
                <rect x="225" y="18" width="150" height="38" rx="8" fill="#ECFDF5" stroke="#059669" />
                <text x="300" y="41" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Bryophyta (Mosses)</text>

                <line x1="165" y1="95" x2="225" y2="112" stroke="#64748B" strokeWidth="2" />
                <text x="195" y="117" fontSize="9.5" fontWeight="700" fill="#059669">1a. Yes</text>
                <rect x="225" y="92" width="150" height="42" rx="10" fill="#EFF6FF" stroke="#3B82F6" />
                <text x="300" y="110" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D4ED8">2. Produces Seeds?</text>
                <text x="300" y="125" textAnchor="middle" fontSize="9.5" fill="#475569">Seeds vs Spores</text>

                <line x1="375" y1="102" x2="435" y2="72" stroke="#64748B" strokeWidth="2" />
                <rect x="435" y="52" width="135" height="36" rx="8" fill="#F8FAFC" stroke="#94A3B8" />
                <text x="502" y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">2b. Ferns (Spores)</text>

                <line x1="375" y1="122" x2="435" y2="132" stroke="#64748B" strokeWidth="2" />
                <rect x="435" y="114" width="285" height="40" rx="8" fill="#FFF7ED" stroke="#EA580C" />
                <text x="577" y="131" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#9A3412">2a. Seeds → 3. Naked Cones (Gymnosperm)</text>
                <text x="577" y="146" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#059669">vs Flowers &amp; Fruit (Angiosperm)</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
