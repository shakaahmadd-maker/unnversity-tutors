import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';

export interface ExampleTriggerProps {
  loadedKey: string | null;
  onSimulate: (key: string, detail: Record<string, unknown>) => void;
}

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

export function DnaTranslatorExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      {/* Example 1: Sickle-Cell Hemoglobin HBB Missense Mutation */}
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Clinical Point Mutation · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Sickle-Cell Anemia (HBB Glu6Val): Single-Base Missense Mutation
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="hbb-normal"
              loadedKey={loadedKey}
              label="Load Wild-Type HbA"
              onClick={() =>
                onSimulate('hbb-normal', {
                  slug: 'dna-rna-protein-translator',
                  dnaInput: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAG',
                  strandType: 'coding',
                })
              }
            />
            <SimulateButton
              presetKey="hbb-sickle"
              loadedKey={loadedKey}
              label="Load Sickle HbS"
              onClick={() =>
                onSimulate('hbb-sickle', {
                  slug: 'dna-rna-protein-translator',
                  dnaInput: 'ATGGTGCATCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAG',
                  strandType: 'coding',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-2.5 text-slate-600 text-sm leading-relaxed">
              <h4 className="text-lg font-bold text-[#111827]">
                How One Nucleotide Change Reshapes Red Blood Cells
              </h4>
              <p>
                Human beta-globin (<code className="font-mono font-bold text-[#111827]">HBB</code>) begins with
                hydrophilic Glutamic Acid (<code className="font-mono font-bold text-[#059669]">GAG → Glu</code>) at
                codon 6 of the mature chain. A single A→T transversion produces{' '}
                <code className="font-mono font-bold text-[#DC2626]">GTG → Val</code> (hydrophobic Valine). Under low
                oxygen, exposed Valine patches polymerize hemoglobin fibers and distort erythrocytes into rigid crescents.
              </p>
            </div>
            <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-orange-200 text-xs space-y-1.5 tabular-nums">
              <div className="font-bold text-orange-950">Key Molecular Takeaways</div>
              <p className="text-slate-700">
                <strong>Wild-Type Codon 7:</strong> 5′-GAG-3′ → mRNA <code className="font-mono">GAG</code> → Glu (Polar, negative)
              </p>
              <p className="text-slate-700">
                <strong>Sickle Codon 7:</strong> 5′-GTG-3′ → mRNA <code className="font-mono">GUG</code> → Val (Non-polar)
              </p>
              <p className="text-slate-700">
                <strong>Mutation Type:</strong> Non-synonymous missense substitution
              </p>
            </div>
          </div>

          {/* Schematic SVG */}
          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#EA580C]">
                university-tutors.com Visual Genetics Diagram · HbA vs HbS Codon Comparison
              </span>
              <span className="text-slate-500 font-mono">Central Dogma: DNA → mRNA → Protein</span>
            </div>
            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 760 230"
                className="w-full min-w-[560px] h-auto block"
                role="img"
                aria-label="Comparison of normal HbA GAG Glutamic Acid codon versus sickle-cell HbS GTG Valine missense mutation"
              >
                <rect x="0" y="0" width="760" height="230" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
                {/* Normal Row */}
                <text x="24" y="34" fontSize="13" fontWeight="700" fill="#059669">Normal Hemoglobin (HbA)</text>
                <text x="24" y="54" fontSize="11" fill="#475569">5′ Coding DNA:</text>
                <rect x="130" y="39" width="235" height="24" rx="6" fill="#ECFDF5" stroke="#A7F3D0" />
                <text x="142" y="55" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#065F46">... CTG ACT CCT GAG GAG AAG ...</text>
                <line x1="376" y1="51" x2="404" y2="51" stroke="#059669" strokeWidth="2" />
                <polygon points="404,46 414,51 404,56" fill="#059669" />
                <rect x="422" y="39" width="145" height="24" rx="6" fill="#F0FDF4" stroke="#BBF7D0" />
                <text x="434" y="55" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#065F46">mRNA: ... GAG ...</text>
                <line x1="576" y1="51" x2="604" y2="51" stroke="#059669" strokeWidth="2" />
                <polygon points="604,46 614,51 604,56" fill="#059669" />
                <rect x="622" y="34" width="118" height="34" rx="8" fill="#059669" />
                <text x="681" y="55" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Glu (Hydrophilic)</text>

                {/* RBC Healthy icon */}
                <ellipse cx="78" cy="86" rx="22" ry="12" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <ellipse cx="78" cy="86" rx="10" ry="4" fill="#FCA5A5" opacity="0.6" />
                <text x="110" y="90" fontSize="11" fill="#334155">Biconcave flexible red blood cell flows freely through capillaries.</text>

                <line x1="24" y1="115" x2="736" y2="115" stroke="#E2E8F0" strokeDasharray="4 4" />

                {/* Sickle Row */}
                <text x="24" y="140" fontSize="13" fontWeight="700" fill="#DC2626">Sickle-Cell Hemoglobin (HbS)</text>
                <text x="24" y="162" fontSize="11" fill="#475569">5′ Coding DNA:</text>
                <rect x="130" y="147" width="235" height="24" rx="6" fill="#FEF2F2" stroke="#FECACA" />
                <text x="142" y="163" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#991B1B">... CTG ACT CCT GTG GAG AAG ...</text>
                <rect x="255" y="145" width="32" height="28" rx="4" fill="none" stroke="#DC2626" strokeWidth="2" />
                <line x1="376" y1="159" x2="404" y2="159" stroke="#DC2626" strokeWidth="2" />
                <polygon points="404,154 414,159 404,164" fill="#DC2626" />
                <rect x="422" y="147" width="145" height="24" rx="6" fill="#FEF2F2" stroke="#FECACA" />
                <text x="434" y="163" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#991B1B">mRNA: ... GUG ...</text>
                <line x1="576" y1="159" x2="604" y2="159" stroke="#DC2626" strokeWidth="2" />
                <polygon points="604,154 614,159 604,164" fill="#DC2626" />
                <rect x="622" y="142" width="118" height="34" rx="8" fill="#DC2626" />
                <text x="681" y="163" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Val (Hydrophobic)</text>

                {/* Sickled cell icon */}
                <path d="M58 198 C65 180, 92 180, 98 196 C85 190, 72 192, 58 198 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
                <text x="110" y="198" fontSize="11" fill="#334155">Hydrophobic Val6 pockets aggregate under hypoxia, creating rigid sickle fibers.</text>
              </svg>
            </div>
          </div>
        </div>
      </article>

      {/* Example 2: Human Preproinsulin Signal Peptide */}
      <article id="bio-example-2" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 2 · Endocrine Biotechnology · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Human Preproinsulin (INS) Signal Peptide &amp; Reading Frame
            </h3>
          </div>
          <SimulateButton
            presetKey="ins-gene"
            loadedKey={loadedKey}
            label="Load INS Sequence"
            onClick={() =>
              onSimulate('ins-gene', {
                slug: 'dna-rna-protein-translator',
                dnaInput: 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCC',
                strandType: 'coding',
              })
            }
          />
        </div>
        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-5 items-center text-sm text-slate-600">
          <div className="md:col-span-7 space-y-2">
            <h4 className="text-lg font-bold text-[#111827]">From mRNA Start Codon to Secretory ER Targeting</h4>
            <p className="leading-relaxed">
              The first 24 amino acids encoded by the human <code className="font-mono font-bold text-[#111827]">INS</code>{' '}
              gene form a hydrophobic N-terminal <strong>signal peptide</strong> (<code className="font-mono">MALWMRLLPLLALLALWGPDPAAA</code>).
              Signal Recognition Particle (SRP) binds this nascent peptide to dock ribosomes onto the Rough ER membrane—essential
              when engineering recombinant insulin expression vectors in <em>E. coli</em> or yeast.
            </p>
          </div>
          <div className="md:col-span-5 bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 space-y-2 text-xs tabular-nums">
            <div className="font-bold text-[#EA580C]">INS Coding Strand Snapshot (72 nt)</div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <span className="text-slate-500 block font-sans">Start Codon</span>
                <strong className="text-[#111827]">ATG → AUG (Met)</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <span className="text-slate-500 block font-sans">Signal Length</span>
                <strong className="text-[#111827]">24 Amino Acids</strong>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function PcrMasterMixExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Clinical &amp; Diagnostic PCR · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              96-Well Diagnostic Assay &amp; 3-Step Thermal Cycler Profile
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="pcr-96"
              loadedKey={loadedKey}
              label="Load 24-Sample Diagnostic"
              onClick={() =>
                onSimulate('pcr-96', {
                  slug: 'pcr-master-mix-calculator',
                  sampleCount: 24,
                  rxnVolume: 25,
                  includeOverage: true,
                  fwdPrimer: 'ATGGCCTCGGACAGCAAGAG',
                  revPrimer: 'TGAGCTGGTTGATGCCGTTG',
                })
              }
            />
            <SimulateButton
              presetKey="pcr-taq"
              loadedKey={loadedKey}
              label="Load 50 µL Cloning Prep"
              onClick={() =>
                onSimulate('pcr-taq', {
                  slug: 'pcr-master-mix-calculator',
                  sampleCount: 8,
                  rxnVolume: 50,
                  includeOverage: true,
                  fwdPrimer: 'GCGAATTCATGGTGAGCAAG',
                  revPrimer: 'GCGGATCCTTACTTGTACAG',
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            In diagnostic qPCR/PCR workflows (such as viral RNA detection or genotyping), pipetting 0.5 µL of enzyme into
            24 individual tubes introduces cumulative error. Technicians pre-assemble a single <strong>Master Mix with +10%
            pipetting overage</strong> (26.4× volume) and aliquot evenly before adding each patient template.
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#EA580C]">
                university-tutors.com Thermal Cycler Temperature Curve (1 Cycle of 30–35×)
              </span>
              <span className="font-mono text-slate-500">Annealing Ta = min(Tm) − 5°C</span>
            </div>
            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 760 220"
                className="w-full min-w-[540px] h-auto block"
                role="img"
                aria-label="PCR 3-step thermal cycler curve showing 95°C Denaturation, 55-60°C Primer Annealing, and 72°C Taq Extension"
              >
                <rect x="0" y="0" width="760" height="220" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
                <line x1="65" y1="30" x2="65" y2="180" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="65" y1="180" x2="725" y2="180" stroke="#94A3B8" strokeWidth="1.5" />
                {/* Grid lines */}
                <line x1="65" y1="52" x2="725" y2="52" stroke="#F1F5F9" />
                <line x1="65" y1="95" x2="725" y2="95" stroke="#F1F5F9" />
                <line x1="65" y1="142" x2="725" y2="142" stroke="#F1F5F9" />

                <text x="56" y="56" textAnchor="end" fontSize="11" fontFamily="monospace" fill="#DC2626" fontWeight="700">95°C</text>
                <text x="56" y="99" textAnchor="end" fontSize="11" fontFamily="monospace" fill="#059669" fontWeight="700">72°C</text>
                <text x="56" y="146" textAnchor="end" fontSize="11" fontFamily="monospace" fill="#0284C7" fontWeight="700">58°C</text>

                {/* Curve path */}
                <path
                  d="M 80 52 L 220 52 L 265 142 L 430 142 L 470 95 L 675 95 L 705 52"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Step labels */}
                <rect x="92" y="20" width="120" height="24" rx="6" fill="#FEF2F2" stroke="#FECACA" />
                <text x="152" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="#B91C1C">1. Denature (30 s)</text>
                <text x="152" y="72" textAnchor="middle" fontSize="10" fill="#475569">dsDNA melts to ssDNA</text>

                <rect x="278" y="152" width="142" height="24" rx="6" fill="#EFF6FF" stroke="#BFDBFE" />
                <text x="349" y="168" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D4ED8">2. Anneal at Ta (30 s)</text>
                <text x="349" y="132" textAnchor="middle" fontSize="10" fill="#475569">Primers hybridize (ΔTm ≤ 2°C)</text>

                <rect x="492" y="60" width="165" height="24" rx="6" fill="#ECFDF5" stroke="#A7F3D0" />
                <text x="574" y="76" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857">3. Taq Extension (1 kb/min)</text>
                <text x="574" y="114" textAnchor="middle" fontSize="10" fill="#475569">DNA Pol synthesizes 5′→3′</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function HardyWeinbergExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Natural Selection &amp; Carrier Frequency · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Malaria Heterozygote Advantage (HbS) vs Cystic Fibrosis Carriers
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="hwe-hbs"
              loadedKey={loadedKey}
              label="Simulate HbS Selection"
              onClick={() =>
                onSimulate('hwe-hbs', {
                  slug: 'hardy-weinberg-calculator',
                  obsAA: 150,
                  obsAa: 290,
                  obsaa: 60,
                })
              }
            />
            <SimulateButton
              presetKey="hwe-cf"
              loadedKey={loadedKey}
              label="Simulate CF (1 in 2,500)"
              onClick={() =>
                onSimulate('hwe-cf', {
                  slug: 'hardy-weinberg-calculator',
                  obsAA: 2401,
                  obsAa: 98,
                  obsaa: 1,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-2 text-sm text-slate-700">
              <h4 className="font-bold text-[#111827]">1. Balancing Selection in Malaria Regions</h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                In malaria-endemic populations (N = 500: 150 HbA/HbA, 290 HbA/HbS, 60 HbS/HbS), heterozygote carriers (
                <code className="font-mono font-bold">Aa</code>) survive <em>Plasmodium falciparum</em> infection at higher
                rates. This pushes observed heterozygotes (58%) far above HWE expectation (48%), yielding{' '}
                <strong className="text-[#EA580C]">χ² = 19.35 (&gt; 3.841)</strong> and proving active natural selection.
              </p>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-2 text-sm text-slate-700 tabular-nums">
              <h4 className="font-bold text-[#111827]">2. Cystic Fibrosis Hidden Carrier Math</h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                When an autosomal recessive condition affects <strong>1 in 2,500</strong> births (<code className="font-mono">q² = 0.0004</code>),
                taking the square root reveals <code className="font-mono font-bold text-[#EA580C]">q = 0.02</code> and{' '}
                <code className="font-mono">p = 0.98</code>. Heterozygous carrier frequency is{' '}
                <strong className="text-[#111827]">2pq = 2(0.98)(0.02) = 3.92% (~1 in 25 adults)</strong>—nearly 100× more
                common than the disease itself!
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6">
            <div className="text-xs font-bold text-[#EA580C] mb-3">
              university-tutors.com Population Genetics Comparison · Observed vs HWE Expected Heterozygotes
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 740 165" className="w-full min-w-[520px] h-auto block" role="img" aria-label="Hardy-Weinberg equilibrium expected versus heterozygote advantage observed genotype bars">
                <rect x="0" y="0" width="740" height="165" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
                <text x="20" y="30" fontSize="12" fontWeight="700" fill="#111827">Malaria-Belt HbS Population (N = 500, p = 0.59, q = 0.41)</text>

                <text x="20" y="64" fontSize="11" fontWeight="700" fill="#475569">AA (Normal)</text>
                <rect x="130" y="52" width="150" height="14" rx="4" fill="#F97316" />
                <text x="290" y="63" fontSize="11" fontFamily="monospace" fill="#111827">Obs: 150 (30%) · Exp: 174 (34.8%)</text>

                <text x="20" y="98" fontSize="11" fontWeight="700" fill="#0284C7">Aa (Carrier)</text>
                <rect x="130" y="86" width="290" height="14" rx="4" fill="#0284C7" />
                <text x="430" y="97" fontSize="11" fontFamily="monospace" fontWeight="700" fill="#0284C7">Obs: 290 (58%) vs Exp: 242 (48.4%) ▲ Excess!</text>

                <text x="20" y="132" fontSize="11" fontWeight="700" fill="#64748B">aa (Sickle)</text>
                <rect x="130" y="120" width="60" height="14" rx="4" fill="#64748B" />
                <text x="200" y="131" fontSize="11" fontFamily="monospace" fill="#111827">Obs: 60 (12%) · Exp: 84 (16.8%)</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function RestrictionGelExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Molecular Cloning &amp; RFLP Diagnostics · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Verifying pUC19 Recombinant Insulin Cloning by Gel Electrophoresis
            </h3>
          </div>
          <SimulateButton
            presetKey="gel-linear"
            loadedKey={loadedKey}
            label="Load Diagnostic Digest"
            onClick={() =>
              onSimulate('gel-linear', {
                slug: 'restriction-digest-gel-simulator',
                topology: 'circular',
                selectedEnzymes: ['EcoRI', 'BamHI', 'HindIII'],
              })
            }
          />
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-3 text-sm text-slate-600 leading-relaxed">
            <h4 className="text-lg font-bold text-[#111827]">
              How Gel Bands Confirm Successful Gene Insertion
            </h4>
            <p>
              After ligating a 1,200 bp human insulin cDNA insert into a 2,686 bp <code className="font-mono font-bold">pUC19</code>{' '}
              plasmid vector using flanking <strong>EcoRI</strong> and <strong>BamHI</strong> sticky ends, colonies are
              screened by diagnostic double digest:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm list-disc pl-5 text-slate-700">
              <li>
                <strong>Empty Vector Control (Lane 1):</strong> Single 2,686 bp linearized plasmid band.
              </li>
              <li>
                <strong>Positive Recombinant Clone (Lane 2):</strong> Drops out two distinct bands—the 2,686 bp vector
                backbone plus the released <strong>1,200 bp insert</strong>.
              </li>
              <li>
                <strong>Remember Mobility Math:</strong> Migration distance scales inversely with{' '}
                <code className="font-mono font-bold text-[#EA580C]">log₁₀(bp)</code>, so smaller DNA runs fastest toward
                the positive red anode (+).
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#0F172A] rounded-2xl p-4 border border-slate-800">
            <p className="text-xs font-bold text-orange-300 mb-2">
              university-tutors.com Cloning Screen Gel Reference
            </p>
            <svg viewBox="0 0 360 190" className="w-full h-auto block" role="img" aria-label="Agarose gel lanes comparing 1kb ladder, empty vector, and insert-positive clone">
              <rect x="0" y="0" width="360" height="190" rx="10" fill="#0B1120" />
              <text x="65" y="20" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">1kb Ladder</text>
              <text x="175" y="20" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">Empty Vector</text>
              <text x="285" y="20" textAnchor="middle" fontSize="10" fill="#34D399" fontWeight="700">Clone + Insert</text>

              {[65, 175, 285].map((cx) => (
                <rect key={cx} x={cx - 26} y="28" width="52" height="9" rx="2" fill="#1E293B" stroke="#334155" />
              ))}

              {/* Ladder bands */}
              {[
                { y: 55, label: '6,000' },
                { y: 78, label: '3,000' },
                { y: 105, label: '2,000' },
                { y: 128, label: '1,500' },
                { y: 152, label: '1,000' },
              ].map((b) => (
                <g key={b.label}>
                  <rect x="42" y={b.y} width="46" height="4" rx="2" fill="#38BDF8" />
                  <text x="14" y={b.y + 4} fontSize="8" fontFamily="monospace" fill="#94A3B8">{b.label}</text>
                </g>
              ))}

              {/* Empty vector */}
              <rect x="150" y="84" width="50" height="6" rx="2" fill="#F97316" />
              <text x="175" y="102" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#FDBA74">2,686 bp</text>

              {/* Clone + Insert */}
              <rect x="260" y="84" width="50" height="6" rx="2" fill="#F97316" />
              <text x="285" y="78" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#FDBA74">2,686 bp</text>
              <rect x="260" y="140" width="50" height="6" rx="2" fill="#34D399" />
              <text x="285" y="158" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#6EE7B7">1,200 bp Insert</text>
            </svg>
          </div>
        </div>
      </article>
    </div>
  );
}

export function CrisprGrnaExamples({ loadedKey, onSimulate }: ExampleTriggerProps) {
  return (
    <div className="space-y-8">
      <article id="bio-example-1" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-100">
              Example 1 · Gene Therapy &amp; SpCas9 Cleavage · university-tutors.com
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Clinical CRISPR Editing: BCL11A (Sickle-Cell) &amp; PCSK9 Knockouts
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SimulateButton
              presetKey="crispr-bcl11a"
              loadedKey={loadedKey}
              label="Scan BCL11A Enhancer"
              onClick={() =>
                onSimulate('crispr-bcl11a', {
                  slug: 'crispr-grna-finder',
                  targetSeq: 'GCTAGCTGATCGATGCTAGCTAACGTAGCGATCGATAGGCTGATCGATGCTAGCTAGCCAATGATCGATCGATCGTAGCTGGATCGGCTAGCTAGC',
                  strandFilter: 'all',
                  optimalOnly: false,
                })
              }
            />
            <SimulateButton
              presetKey="crispr-pcsk9"
              loadedKey={loadedKey}
              label="Scan PCSK9 Exon 1"
              onClick={() =>
                onSimulate('crispr-pcsk9', {
                  slug: 'crispr-grna-finder',
                  targetSeq: 'ATGGGCACCGTCAGCTCCAGGCGGTCCTGGTGGCCGCTGCCACTGCTGCTGCTGCTCCTGCTCCTGGGTCCCGCGGGCGCCCGTGCGCAGGAGGAC',
                  strandFilter: 'all',
                  optimalOnly: true,
                })
              }
            />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            FDA-approved <strong>exa-cel (Casgevy)</strong> uses SpCas9 ribonucleoproteins to cut the erythroid{' '}
            <code className="font-mono font-bold text-[#111827]">BCL11A</code> enhancer, reactivating protective fetal
            hemoglobin (HbF) in sickle-cell patients. Designing a reliable guide requires scanning for{' '}
            <code className="font-mono font-bold text-[#EA580C]">5′-NGG-3′</code> PAM motifs, maintaining 40–60% GC
            stability, and avoiding <code className="font-mono">TTTT</code> Pol III stop signals.
          </p>

          <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-3">
            <div className="text-xs font-bold text-[#EA580C]">
              university-tutors.com CRISPR-Cas9 R-Loop Anatomy (Double-Strand Break 3 bp Upstream of PAM)
            </div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 760 175" className="w-full min-w-[540px] h-auto block" role="img" aria-label="CRISPR SpCas9 20-nt protospacer guide RNA paired with target DNA and 5'-NGG-3' PAM cleavage site">
                <rect x="0" y="0" width="760" height="175" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
                {/* 20-nt spacer */}
                <rect x="35" y="45" width="470" height="44" rx="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="50" y="64" fontSize="11" fontWeight="700" fill="#1D4ED8">20-nt Synthetic sgRNA Spacer (Exclude PAM!)</text>
                <text x="50" y="81" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#1E3A8A">5′- G C A U G C U A G C U A G C U G A U C G -3′</text>

                {/* Target DNA */}
                <rect x="35" y="102" width="470" height="36" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
                <text x="50" y="124" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#0F172A">3′- C G T A C G A T C G A T C G A C T A G C -5′</text>

                {/* PAM */}
                <rect x="515" y="102" width="110" height="36" rx="8" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
                <text x="570" y="117" textAnchor="middle" fontSize="10" fontWeight="700" fill="#EA580C">SpCas9 PAM</text>
                <text x="570" y="132" textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="700" fill="#9A3412">5′-AGG-3′</text>

                {/* Cleavage Scissors Line at -3 bp */}
                <line x1="428" y1="28" x2="428" y2="152" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="5 3" />
                <rect x="370" y="14" width="116" height="22" rx="6" fill="#DC2626" />
                <text x="428" y="29" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">DSB Cut (-3 bp PAM)</text>

                <text x="640" y="68" fontSize="11" fontWeight="700" fill="#059669">40–60% GC Optimal</text>
                <text x="640" y="86" fontSize="10" fill="#475569">Avoid TTTT Pol III</text>
                <text x="640" y="100" fontSize="10" fill="#475569">termination tracts</text>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
