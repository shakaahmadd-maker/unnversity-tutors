import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import {
  DnaTranslatorExamples,
  PcrMasterMixExamples,
  HardyWeinbergExamples,
  RestrictionGelExamples,
  CrisprGrnaExamples,
} from './BiologyExamplesGenetics';
import {
  SerialDilutionExamples,
  CellGrowthExamples,
  MicroscopeFovExamples,
  CellExplorerExamples,
} from './BiologyExamplesCellLab';
import {
  BiodiversityExamples,
  WaterPotentialExamples,
  HumanPhysiologyExamples,
  TaxonomyExamples,
} from './BiologyExamplesEcology';

interface RealLifeCaseRow {
  id: string;
  caseTitle: string;
  context: string;
  keyValues: string;
  outcome: string;
  presetDetail: Record<string, unknown>;
}

interface ToolRealLifeMeta {
  subDiscipline: string;
  heading: string;
  intro: string;
  tutorLabel: string;
  cases: RealLifeCaseRow[];
}

const TOOL_REAL_LIFE_META: Record<string, ToolRealLifeMeta> = {
  'dna-rna-protein-translator': {
    subDiscipline: 'Molecular Genetics & Bioinformatics',
    heading: 'Real-Life DNA Transcription & Protein Translation Examples',
    intro:
      'Explore clinical missense mutations, start/stop codon frameshifts, and recombinant endocrine sequences curated by university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Molecular Biology Tutor',
    cases: [
      {
        id: 'cftr-frameshift',
        caseTitle: 'CFTR Exon Reading Frame Check',
        context: 'Cystic Fibrosis transmembrane conductance regulator fragment',
        keyValues: '5′-ATG CAG AGG TCG CCT CTG GAA AAG GCC AGC GTT GTC TCC-3′',
        outcome: 'M-Q-R-S-P-L-E-K-A-S-V-V-S (13 aa)',
        presetDetail: {
          slug: 'dna-rna-protein-translator',
          dnaInput: 'ATGCAGAGGTCGCCTCTGGAAAAGGCCAGCGTTGTCTCC',
          strandType: 'coding',
        },
      },
      {
        id: 'gfp-chromophore',
        caseTitle: 'GFP SYG Fluorophore Motif',
        context: 'Jellyfish Green Fluorescent Protein core tripeptide (Ser65-Tyr66-Gly67)',
        keyValues: '5′-ATG GTG ACC ACC TTC AGC TAC GGC GTG CAG TGC TAA-3′',
        outcome: 'M-V-T-T-F-S-Y-G-V-Q-C-* (Stop UAA)',
        presetDetail: {
          slug: 'dna-rna-protein-translator',
          dnaInput: 'ATGGTGACCACCTTCAGCTACGGCGTGCAGTGCTAA',
          strandType: 'coding',
        },
      },
    ],
  },
  'pcr-master-mix-calculator': {
    subDiscipline: 'PCR Amplification & Primer Design',
    heading: 'Real-Life PCR Master Mix & Primer Annealing Case Studies',
    intro:
      'Master clinical assay scaling, 10% pipetting overage planning, and forward/reverse primer ΔTm matching with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Biotechnology Tutor',
    cases: [
      {
        id: 'pcr-16s',
        caseTitle: 'Bacterial 16S rRNA Microbiome Screen',
        context: '16 environmental soil samples in 25 µL reactions (+10% overage)',
        keyValues: '17.6× Master Mix · Primers 27F / 1492R (GC 50–55%)',
        outcome: 'Total Batch Mix = 404.8 µL · Ta ≈ 55.2 °C',
        presetDetail: {
          slug: 'pcr-master-mix-calculator',
          sampleCount: 16,
          rxnVolume: 25,
          includeOverage: true,
          fwdPrimer: 'AGAGTTTGATCCTGGCTCAG',
          revPrimer: 'GGTTACCTTGTTACGACTT',
        },
      },
      {
        id: 'pcr-brca',
        caseTitle: 'BRCA1 Exon 11 Genotyping Prep',
        context: '12 clinical blood DNA extracts at 20 µL reaction scale',
        keyValues: '13.2× Master Mix · Matched Tm pair (ΔTm < 1.5 °C)',
        outcome: 'Total Batch Mix = 237.6 µL · Ta ≈ 57.5 °C',
        presetDetail: {
          slug: 'pcr-master-mix-calculator',
          sampleCount: 12,
          rxnVolume: 20,
          includeOverage: true,
          fwdPrimer: 'GGCTACAGAAACCGTGCCAA',
          revPrimer: 'TGAGCTGGTTGATGCCGTTG',
        },
      },
    ],
  },
  'hardy-weinberg-calculator': {
    subDiscipline: 'Evolutionary & Population Genetics',
    heading: 'Real-Life Hardy-Weinberg Equilibrium & Chi-Square Examples',
    intro:
      'Compare equilibrium populations against natural selection, genetic drift, and human autosomal recessive carrier frequencies curated by university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Genetics Tutor',
    cases: [
      {
        id: 'hwe-moth',
        caseTitle: 'Industrial Melanism Peppered Moth (Biston betularia)',
        context: 'Woodland transect survey of N = 500 moths',
        keyValues: 'AA = 320, Aa = 160, aa = 20 (p = 0.80, q = 0.20)',
        outcome: 'χ² = 0.000 (In Hardy-Weinberg Equilibrium)',
        presetDetail: {
          slug: 'hardy-weinberg-calculator',
          obsAA: 320,
          obsAa: 160,
          obsaa: 20,
        },
      },
      {
        id: 'hwe-inbreed',
        caseTitle: 'Island Bottleneck Inbreeding Excess',
        context: 'Small isolated mammal colony (N = 400)',
        keyValues: 'AA = 210, Aa = 80, aa = 110 (Expected Aa = 187.5)',
        outcome: 'χ² = 123.30 (Reject H₀ — Heterozygote Deficit)',
        presetDetail: {
          slug: 'hardy-weinberg-calculator',
          obsAA: 210,
          obsAa: 80,
          obsaa: 110,
        },
      },
    ],
  },
  'restriction-digest-gel-simulator': {
    subDiscipline: 'Molecular Cloning & Agarose Gels',
    heading: 'Real-Life Restriction Mapping & Gel Electrophoresis Examples',
    intro:
      'Practice distinguishing circular plasmid cuts from linear PCR digests and verifying recombinant DNA inserts with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Molecular Lab Tutor',
    cases: [
      {
        id: 'gel-single-cut',
        caseTitle: 'Single-Cut Plasmid Linearization (NotI)',
        context: '2.4 kb circular vector cleaved once at an 8-bp NotI site',
        keyValues: 'Topology: Circular · Enzyme: NotI (GC^GGCCGC)',
        outcome: '1 linearized gel band at 2,401 bp',
        presetDetail: {
          slug: 'restriction-digest-gel-simulator',
          topology: 'circular',
          selectedEnzymes: ['NotI'],
        },
      },
      {
        id: 'gel-linear-pcr',
        caseTitle: 'Linear Diagnostic Amplicon RFLP',
        context: 'Linear PCR product digested with EcoRI + HindIII',
        keyValues: 'Topology: Linear · 2 cuts yield 3 bands (k + 1 rule)',
        outcome: '3 distinct bands separating from 342 bp to 742 bp',
        presetDetail: {
          slug: 'restriction-digest-gel-simulator',
          topology: 'linear',
          selectedEnzymes: ['EcoRI', 'HindIII'],
        },
      },
    ],
  },
  'crispr-grna-finder': {
    subDiscipline: 'CRISPR-Cas9 Genome Engineering',
    heading: 'Real-Life CRISPR gRNA & SpCas9 PAM Targeting Examples',
    intro:
      'Evaluate forward (5′-NGG-3′) and reverse (5′-CCN-3′) protospacers, cleavage coordinates, and GC% guide quality with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 CRISPR & Genomics Tutor',
    cases: [
      {
        id: 'crispr-reverse',
        caseTitle: 'Antisense Strand (5′-CCN-3′) PAM Scan',
        context: 'Targeting coding exon on the complementary bottom strand',
        keyValues: 'Filter: Reverse Strand (−) · 20-nt reverse complement',
        outcome: 'Cleaves 3 bp upstream of complementary NGG PAM',
        presetDetail: {
          slug: 'crispr-grna-finder',
          targetSeq: 'GCTAGCTGATCGATGCTAGCTAACGTAGCGATCGATAGGCTGATCGATGCTAGCTAGCCAATGATCGATCGATCGTAGCTGGATCGGCTAGCTAGC',
          strandFilter: '−',
          optimalOnly: false,
        },
      },
      {
        id: 'crispr-strict',
        caseTitle: 'High-Specificity Optimal GC Filter',
        context: 'Filtering candidates strictly to 40–60% GC without TTTT stops',
        keyValues: 'Target: PCSK9 coding exon · Optimal Only = ON',
        outcome: 'Ranks highest-efficiency SpCas9 gRNA oligos',
        presetDetail: {
          slug: 'crispr-grna-finder',
          targetSeq: 'ATGGGCACCGTCAGCTCCAGGCGGTCCTGGTGGCCGCTGCCACTGCTGCTGCTGCTCCTGCTCCTGGGTCCCGCGGGCGCCCGTGCGCAGGAGGAC',
          strandFilter: 'all',
          optimalOnly: true,
        },
      },
    ],
  },
  'serial-dilution-molarity-calculator': {
    subDiscipline: 'Wet-Lab Buffer & Stock Preparation',
    heading: 'Real-Life Lab Molarity & Serial Dilution Examples',
    intro:
      'Avoid pipetting errors in antibiotic plate prep, enzyme buffers, and 10-fold microbiology dilutions with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Biochemistry Lab Tutor',
    cases: [
      {
        id: 'sd-tae',
        caseTitle: '1× TAE Gel Running Buffer from 50× Stock',
        context: 'Preparing 1,000 mL electrophoresis tank buffer',
        keyValues: 'C₁ = 50 M (equiv) · C₂ = 1 M · V₂ = 1,000 mL',
        outcome: 'Pipette 20.0 mL 50× stock + 980.0 mL dH₂O',
        presetDetail: {
          slug: 'serial-dilution-molarity-calculator',
          tab: 'c1v1',
          c1: 50,
          c1Unit: 'mM',
          c2: 1,
          c2Unit: 'mM',
          v2: 1000,
          v2Unit: 'mL',
        },
      },
      {
        id: 'sd-10fold',
        caseTitle: '5-Tube 1:10 Microbiological Dilution Bank',
        context: 'Reducing 100 mM sample down to 1 µM across 5 tubes',
        keyValues: 'DF = 10 · 100 µL transfer + 900 µL saline',
        outcome: 'Final Tube 5 = 1.000 µM (10⁻⁵ total dilution)',
        presetDetail: {
          slug: 'serial-dilution-molarity-calculator',
          tab: 'serial',
          startConc: 100,
          startUnit: 'mM',
          dilutionFactor: 10,
          transferVolUl: 100,
          numTubes: 5,
        },
      },
    ],
  },
  'cell-growth-cfu-calculator': {
    subDiscipline: 'Microbial Kinetics & Viable Plate Counts',
    heading: 'Real-Life Bacterial Doubling Time & CFU/mL Examples',
    intro:
      'Solve exponential binary fission problems and validate countable 30–300 CFU agar plates with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Microbiology Tutor',
    cases: [
      {
        id: 'cg-yeast',
        caseTitle: 'Brewer’s Yeast (S. cerevisiae) Fermentation',
        context: 'Doubling in YPD broth over 6 hours (360 min)',
        keyValues: 'N₀ = 2.0 × 10⁵ → Nₜ = 3.2 × 10⁶ cells/mL',
        outcome: 'n = 4.0 generations · g = 90.0 min/gen',
        presetDetail: {
          slug: 'cell-growth-cfu-calculator',
          tab: 'growth',
          n0: 200000,
          nt: 3200000,
          elapsedMinutes: 360,
        },
      },
      {
        id: 'cg-milk',
        caseTitle: 'Pasteurized Milk Quality Pour-Plate QC',
        context: '1.0 mL pour plate at 10⁻³ dilution yielding 62 colonies',
        keyValues: 'Count = 62 CFU (Valid 30–300 window) · 10⁻³ tube',
        outcome: '6.20 × 10⁴ CFU/mL (Pass Pasteurization Grade)',
        presetDetail: {
          slug: 'cell-growth-cfu-calculator',
          tab: 'cfu',
          colonies: 62,
          dilutionExponent: -3,
          volumePlatedMl: 1.0,
        },
      },
    ],
  },
  'microscope-fov-calculator': {
    subDiscipline: 'Light Microscopy & Specimen Micrometry',
    heading: 'Real-Life Microscope Field-of-View & Cell Size Examples',
    intro:
      'Convert millimeter calibrations at 40× into micrometer measurements for plant, animal, and microbial slides with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Cell Biology Tutor',
    cases: [
      {
        id: 'fov-paramecium',
        caseTitle: 'Pond Water Paramecium at 100× Low Power',
        context: 'Motile ciliate spanning roughly 1/8 of the 100× field',
        keyValues: '10× ocular × 10× objective (100×) · FOV = 1,800 µm · 8 cells',
        outcome: 'Estimated organism length = 225.0 µm',
        presetDetail: {
          slug: 'microscope-fov-calculator',
          ocularMag: 10,
          calibObjMag: 4,
          calibFovMm: 4.5,
          workingObjMag: 10,
          cellsAcrossDiameter: 8,
        },
      },
      {
        id: 'fov-cheek',
        caseTitle: 'Methylene Blue Cheek Epithelium (400×)',
        context: '7.5 squamous epithelial cells spanning across high-power FOV',
        keyValues: '400× Total Magnification · FOV = 450 µm · 7.5 cells',
        outcome: 'Average human cheek cell diameter = 60.0 µm',
        presetDetail: {
          slug: 'microscope-fov-calculator',
          ocularMag: 10,
          calibObjMag: 4,
          calibFovMm: 4.5,
          workingObjMag: 40,
          cellsAcrossDiameter: 7.5,
        },
      },
    ],
  },
  'interactive-cell-explorer': {
    subDiscipline: 'Eukaryotic & Prokaryotic Ultrastructure',
    heading: 'Real-Life Organelle Disease & Pathway Examples',
    intro:
      'Connect organelle anatomy to lysosomal storage disorders, antibiotic ribosome selectivity, and photosynthesis with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Cell Physiology Tutor',
    cases: [
      {
        id: 'ce-lysosome',
        caseTitle: 'Tay-Sachs & Lysosomal Storage Biology',
        context: 'Hydrolytic enzyme deficiency inside acidic animal lysosomes (pH ~4.8)',
        keyValues: 'Organelle: Lysosome · Animal Eukaryote',
        outcome: 'Inspect autophagic vesicle fusion & hydrolase enzymes',
        presetDetail: {
          slug: 'interactive-cell-explorer',
          cellType: 'animal',
          organelleId: 'lysosome',
        },
      },
      {
        id: 'ce-bac-wall',
        caseTitle: 'Penicillin Target: Bacterial Peptidoglycan Wall',
        context: 'Why beta-lactam antibiotics lyse bacteria without harming human cells',
        keyValues: 'Organelle: Peptidoglycan Cell Wall + 70S Ribosomes',
        outcome: 'Inspect prokaryotic envelope & Gram-positive/negative traits',
        presetDetail: {
          slug: 'interactive-cell-explorer',
          cellType: 'bacterial',
          organelleId: 'cell-wall',
        },
      },
    ],
  },
  'biodiversity-index-calculator': {
    subDiscipline: 'Community Ecology & Biostatistics',
    heading: 'Real-Life Biodiversity Index (H′ & 1−D) Field Examples',
    intro:
      'Interpret Shannon-Wiener (H′), Pielou Evenness (E), and Simpson’s Diversity across freshwater streams, reefs, and forests with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Ecology Tutor',
    cases: [
      {
        id: 'bd-stream',
        caseTitle: 'Clean Mountain Stream Macroinvertebrates',
        context: 'Bioindicator survey (N = 100 insects across 3 pollution-sensitive taxa)',
        keyValues: 'Mayflies 30 · Stoneflies 30 · Caddisflies 40',
        outcome: 'H′ = 1.089 · Evenness E = 0.991 (Pristine water quality)',
        presetDetail: {
          slug: 'biodiversity-index-calculator',
          speciesList: [
            { id: '1', name: 'Mayflies', count: 30 },
            { id: '2', name: 'Stoneflies', count: 30 },
            { id: '3', name: 'Caddisflies', count: 40 },
          ],
        },
      },
      {
        id: 'bd-desert',
        caseTitle: 'Sonoran Desert Scrub Quadrat',
        context: 'Arid perennial plant transect (N = 80 individuals)',
        keyValues: 'Creosote 35 · Saguaro 12 · Ocotillo 15 · Brittlebush 18',
        outcome: 'H′ = 1.298 · Evenness E = 0.936',
        presetDetail: {
          slug: 'biodiversity-index-calculator',
          speciesList: [
            { id: '1', name: 'Creosote Bush', count: 35 },
            { id: '2', name: 'Saguaro Cactus', count: 12 },
            { id: '3', name: 'Ocotillo', count: 15 },
            { id: '4', name: 'Brittlebush', count: 18 },
          ],
        },
      },
    ],
  },
  'water-potential-osmolarity-calculator': {
    subDiscipline: 'Plant Water Relations & Membrane Osmosis',
    heading: 'Real-Life Plant Water Potential (Ψ = Ψs + Ψp) Examples',
    intro:
      'Predict turgor pressure, stomatal opening, wilting, and isotonic molarity intercepts across AP and university botany labs with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Botany & Physiology Tutor',
    cases: [
      {
        id: 'wp-turgid',
        caseTitle: 'Well-Watered Leaf Guard Cell (Turgid)',
        context: 'K⁺ accumulation lowers solute potential while cell wall builds +6.0 bar turgor',
        keyValues: 'i = 2 (KCl equiv), C = 0.20 M, T = 22 °C, Ψp = +6.0 bars',
        outcome: 'Ψs = −9.81 bars → Total Cell Ψ = −3.81 bars',
        presetDetail: {
          slug: 'water-potential-osmolarity-calculator',
          ionizationFactor: 2,
          molarityC: 0.2,
          tempCelsius: 22,
          pressureBar: 6.0,
          externalPsiBar: -1.5,
        },
      },
      {
        id: 'wp-open-beaker',
        caseTitle: 'Standard Open Beaker 0.30 M Sucrose',
        context: 'Atmospheric open container where pressure potential Ψp = 0.00 bars',
        keyValues: 'i = 1 (Sucrose), C = 0.30 M, T = 22 °C, Ψp = 0 bars',
        outcome: 'Ψs = −7.36 bars (−0.736 MPa)',
        presetDetail: {
          slug: 'water-potential-osmolarity-calculator',
          ionizationFactor: 1,
          molarityC: 0.3,
          tempCelsius: 22,
          pressureBar: 0,
          externalPsiBar: 0,
        },
      },
    ],
  },
  'human-physiology-calculators': {
    subDiscipline: 'Cardiovascular, Renal & Respiratory Physiology',
    heading: 'Real-Life Clinical Physiology Case Studies (CO, MAP, BMR, FEV₁)',
    intro:
      'Bridge classroom equations to ICU blood-pressure perfusion thresholds, exercise stroke volume, and pulmonary spirometry with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Human Physiology Tutor',
    cases: [
      {
        id: 'hp-sepsis',
        caseTitle: 'Hypotensive Sepsis MAP Alert (88/52 mmHg)',
        context: 'Checking minimum 65 mmHg capillary perfusion floor',
        keyValues: 'SBP = 88 mmHg · DBP = 52 mmHg',
        outcome: 'MAP = 64.0 mmHg (Below 65 mmHg perfusion threshold)',
        presetDetail: {
          slug: 'human-physiology-calculators',
          tab: 'map',
          systolic: 88,
          diastolic: 52,
        },
      },
      {
        id: 'hp-restrictive',
        caseTitle: 'Restrictive Pulmonary Fibrosis Pattern',
        context: 'Reduced total lung expansion with preserved expiratory ratio',
        keyValues: 'FEV₁ = 2.1 L · FVC = 2.4 L',
        outcome: 'FEV₁/FVC = 87.5% (Restrictive — Normal/Elevated Ratio)',
        presetDetail: {
          slug: 'human-physiology-calculators',
          tab: 'lung',
          fev1L: 2.1,
          fvcL: 2.4,
        },
      },
    ],
  },
  'taxonomic-dichotomous-key-builder': {
    subDiscipline: 'Systematics & Evolutionary Classification',
    heading: 'Real-Life Linnaean Taxonomy & Field Key Examples',
    intro:
      'Master 8-rank classification and ICZN/ICN italicization rules across model organisms with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Evolutionary Biology Tutor',
    cases: [
      {
        id: 'tax-homo',
        caseTitle: 'Human Classification (Homo sapiens)',
        context: 'Full 8-rank vertebrate mammalian lineage',
        keyValues: 'Eukarya → Animalia → Chordata → Mammalia → Primates → Hominidae',
        outcome: 'Binomial: Homo sapiens',
        presetDetail: {
          slug: 'taxonomic-dichotomous-key-builder',
          tab: 'taxonomy',
          presetIndex: 0,
        },
      },
      {
        id: 'tax-ecoli',
        caseTitle: 'Prokaryotic Model (Escherichia coli)',
        context: 'Domain Bacteria enteric rod classification',
        keyValues: 'Bacteria → Pseudomonadota → Gammaproteobacteria → Enterobacterales',
        outcome: 'Binomial: Escherichia coli',
        presetDetail: {
          slug: 'taxonomic-dichotomous-key-builder',
          tab: 'taxonomy',
          presetIndex: 2,
        },
      },
    ],
  },
};

interface BiologyRealLifeExamplesProps {
  slug: string;
  onNavigate?: (view: string) => void;
}

export default function BiologyRealLifeExamples({ slug, onNavigate }: BiologyRealLifeExamplesProps) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const meta = TOOL_REAL_LIFE_META[slug];

  if (!meta) return null;

  const triggerSimulate = (key: string, detail: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ut-bio-load-preset', { detail }));
    setLoadedKey(key);
    window.setTimeout(() => setLoadedKey(null), 2200);
    const workspaceEl = document.getElementById('tool-workspace-anchor');
    if (workspaceEl) {
      workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="real-life-examples"
      aria-labelledby="bio-real-life-heading"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-8 sm:space-y-10"
    >
      {/* Platform Branded Intro Header */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-[#EA580C]">Visual Biology Study Guides</span>
            <span aria-hidden="true">·</span>
            <span>university-tutors.com</span>
            <span aria-hidden="true">·</span>
            <span>{meta.subDiscipline}</span>
          </div>
          <h2
            id="bio-real-life-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#111827] tracking-tight leading-tight"
          >
            {meta.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{meta.intro}</p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
          <img
            src="/logo_transparent-440.webp"
            alt="University-Tutors.com"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-6 w-auto self-start sm:self-center lg:self-end object-contain"
          />
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('get-a-quote')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{meta.tutorLabel}</span>
            <ArrowRight className="w-4 h-4 text-[#F97316]" />
          </button>
        </div>
      </div>

      {/* Tool-Specific Infographic Diagram Article */}
      {slug === 'dna-rna-protein-translator' && (
        <DnaTranslatorExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'pcr-master-mix-calculator' && (
        <PcrMasterMixExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'hardy-weinberg-calculator' && (
        <HardyWeinbergExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'restriction-digest-gel-simulator' && (
        <RestrictionGelExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'crispr-grna-finder' && (
        <CrisprGrnaExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'serial-dilution-molarity-calculator' && (
        <SerialDilutionExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'cell-growth-cfu-calculator' && (
        <CellGrowthExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'microscope-fov-calculator' && (
        <MicroscopeFovExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'interactive-cell-explorer' && (
        <CellExplorerExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'biodiversity-index-calculator' && (
        <BiodiversityExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'water-potential-osmolarity-calculator' && (
        <WaterPotentialExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'human-physiology-calculators' && (
        <HumanPhysiologyExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'taxonomic-dichotomous-key-builder' && (
        <TaxonomyExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}

      {/* Curated Bench & Exam Scenarios (Responsive Mobile Cards + Desktop Table) */}
      <article className="bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-8 py-4 border-b border-slate-200 bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-[#EA580C]">
              university-tutors.com Interactive Scenario Bank
            </p>
            <h3 className="text-base sm:text-lg font-display font-bold text-[#111827]">
              Additional Real-Life Scenarios (One-Click Load)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click Simulate to test live values above</span>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-200">
          {meta.cases.map((c) => {
            const isLoaded = loadedKey === c.id;
            return (
              <div key={c.id} className="p-4 space-y-2.5 text-xs">
                <div className="font-bold text-sm text-[#111827]">{c.caseTitle}</div>
                <p className="text-slate-600">{c.context}</p>
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 break-words">
                  {c.keyValues}
                </div>
                <div className="font-semibold text-[#059669]">{c.outcome}</div>
                <button
                  type="button"
                  onClick={() => triggerSimulate(c.id, c.presetDetail)}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
                >
                  {isLoaded ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Loaded in Calculator</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 shrink-0" />
                      <span>Simulate This Scenario</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="bg-[#FFF7ED]/70 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-3 px-6 font-bold">Real-Life Case Study</th>
                <th className="py-3 px-4 font-bold">Input Parameters</th>
                <th className="py-3 px-4 font-bold">Verified Output</th>
                <th className="py-3 px-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meta.cases.map((c) => {
                const isLoaded = loadedKey === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-[#111827] text-sm">{c.caseTitle}</div>
                      <div className="text-slate-500 mt-0.5">{c.context}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 max-w-xs break-words">
                      {c.keyValues}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#059669]">{c.outcome}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => triggerSimulate(c.id, c.presetDetail)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isLoaded ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Loaded</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 shrink-0" />
                            <span>Simulate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
