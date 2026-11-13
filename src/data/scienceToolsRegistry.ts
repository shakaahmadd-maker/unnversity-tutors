import tutorBioImg from '../assets/images/tutor_biology_biotech_1794553725612.jpg';
import tutorChemImg from '../assets/images/tutor_chemistry_organic_1794553725890.jpg';
import tutorStemImg from '../assets/images/tutor_stem_statistics_1794552322797.jpg';
import tutorWritingImg from '../assets/images/tutor_academic_writing_1794552322265.jpg';
import tutorAdmissionsImg from '../assets/images/tutor_admissions_career_1794552324260.jpg';
import tutorLanguagesImg from '../assets/images/tutor_languages_german_1794552324409.jpg';

export type ScienceCategory = 'Biology' | 'Chemistry';

export type BiologySubCategory =
  | 'Genetics & Molecular Biology'
  | 'Cell Biology & Lab Prep'
  | 'Ecology, Botany & Physiology';

export type ChemistrySubCategory =
  | 'General & Stoichiometry'
  | 'Solutions, Acids & Thermodynamics'
  | 'Organic & Analytical Chemistry';

export type ScienceSubCategory = BiologySubCategory | ChemistrySubCategory;

export type BiologyToolSlug =
  | 'punnett-square-calculator'
  | 'dna-rna-protein-translator'
  | 'pcr-master-mix-calculator'
  | 'hardy-weinberg-calculator'
  | 'restriction-digest-gel-simulator'
  | 'crispr-grna-finder'
  | 'serial-dilution-molarity-calculator'
  | 'cell-growth-cfu-calculator'
  | 'microscope-fov-calculator'
  | 'interactive-cell-explorer'
  | 'biodiversity-index-calculator'
  | 'water-potential-osmolarity-calculator'
  | 'human-physiology-calculators'
  | 'taxonomic-dichotomous-key-builder';

export type ChemistryToolSlug =
  | 'interactive-periodic-table'
  | 'molar-mass-calculator'
  | 'chemical-equation-balancer'
  | 'limiting-reagent-yield-calculator'
  | 'empirical-molecular-formula-finder'
  | 'solution-concentration-converter'
  | 'ph-buffer-calculator'
  | 'acid-base-titration-plotter'
  | 'ideal-gas-law-solver'
  | 'thermochemistry-gibbs-calculator'
  | 'nernst-electrochemistry-solver'
  | 'vsepr-molecular-geometry-visualizer'
  | 'degree-of-unsaturation-ihd-calculator'
  | 'ir-nmr-spectroscopy-lookup'
  | 'beer-lambert-calibration-plotter'
  | 'radioactive-decay-halflife-calculator';

export type ScienceToolSlug = BiologyToolSlug | ChemistryToolSlug;

export interface ScienceWorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

export interface ScienceFaq {
  question: string;
  answer: string;
}

export interface ScienceToolItem {
  toolNumber: number;
  slug: ScienceToolSlug;
  title: string;
  shortTitle: string;
  shortDescription: string;
  category: ScienceCategory;
  subCategory: ScienceSubCategory;
  formulaBadge: string;
  seoKeywords: string[];
  seoTitle: string;
  seoDescription: string;
  path: string;
  viewKey: string;
  workedExample: ScienceWorkedExample;
  faqs: [ScienceFaq, ScienceFaq, ScienceFaq];
  relatedSlugs: [ScienceToolSlug, ScienceToolSlug, ScienceToolSlug];
}

export interface ScienceFeaturedTutor {
  id: string;
  name: string;
  initials: string;
  credential: string;
  institution: string;
  rating: string;
  sessions: string;
  specialties: string[];
  avatarUrl: string;
  subjectQuery: string;
}

export interface ScienceTutorCategoryBranding {
  category: ScienceCategory;
  kicker: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaView: string;
  tutors: [ScienceFeaturedTutor, ScienceFeaturedTutor, ScienceFeaturedTutor];
}

export const BIOLOGY_SUBCATEGORIES: BiologySubCategory[] = [
  'Genetics & Molecular Biology',
  'Cell Biology & Lab Prep',
  'Ecology, Botany & Physiology',
];

export const CHEMISTRY_SUBCATEGORIES: ChemistrySubCategory[] = [
  'General & Stoichiometry',
  'Solutions, Acids & Thermodynamics',
  'Organic & Analytical Chemistry',
];

export const SCIENCE_TUTOR_BRANDING: Record<ScienceCategory, ScienceTutorCategoryBranding> = {
  Biology: {
    category: 'Biology',
    kicker: 'Verified 1-on-1 Biology & Life Sciences Mentorship',
    headline: 'Need 1-on-1 Help with Biology, Genetics, Biotechnology, or Lab Reports?',
    subtext:
      'Work privately with vetted PhD & MSc university researchers for Mendelian & molecular genetics problem sets, PCR/gel data analysis, cell physiology exams, and full lab report reviews.',
    ctaText: 'Browse Verified Biology Tutors →',
    ctaView: 'subject:Biology',
    tutors: [
      {
        id: 'bio-tutor-1',
        name: 'Prof. Anthony Scott',
        initials: 'AS',
        credential: 'PhD Molecular Biotechnology',
        institution: 'University of Cambridge Fellow',
        rating: '5.0',
        sessions: '540+ sessions',
        specialties: ['CRISPR & PCR Design', 'Molecular Cloning', 'Lab Reports'],
        avatarUrl: tutorBioImg,
        subjectQuery: 'Molecular Biology',
      },
      {
        id: 'bio-tutor-2',
        name: 'Dr. Sarah Lin',
        initials: 'SL',
        credential: 'MSc Genetics & Cell Biology',
        institution: 'Johns Hopkins University',
        rating: '5.0',
        sessions: '415+ sessions',
        specialties: ['Genetics & Pedigrees', 'Cell Signaling', 'MCAT / AP Bio'],
        avatarUrl: tutorWritingImg,
        subjectQuery: 'Genetics',
      },
      {
        id: 'bio-tutor-3',
        name: 'Dr. Imran Tariq',
        initials: 'IT',
        credential: 'PhD Botany & Ecology Specialist',
        institution: 'University of Toronto',
        rating: '5.0',
        sessions: '360+ sessions',
        specialties: ['Plant Physiology', 'Biostatistics & H′', 'Human Physiology'],
        avatarUrl: tutorAdmissionsImg,
        subjectQuery: 'Biology',
      },
    ],
  },
  Chemistry: {
    category: 'Chemistry',
    kicker: 'Verified 1-on-1 Chemistry & Spectroscopy Mentorship',
    headline: 'Stuck on Organic Chemistry, Stoichiometry, or Lab Calculations?',
    subtext:
      'Master reaction mechanisms, NMR/IR structure elucidation, buffer & titration equilibria, and physical chemistry derivations 1-on-1 with experienced university chemistry faculty.',
    ctaText: 'Browse Verified Chemistry Tutors →',
    ctaView: 'subject:Chemistry',
    tutors: [
      {
        id: 'chem-tutor-1',
        name: 'Dr. Elena Rostova',
        initials: 'ER',
        credential: 'PhD Organic & Analytical Chemistry',
        institution: 'ETH Zurich & Imperial College',
        rating: '5.0',
        sessions: '590+ sessions',
        specialties: ['Orgo I & II Mechanisms', '1H/13C NMR & IR', 'Synthesis'],
        avatarUrl: tutorChemImg,
        subjectQuery: 'Organic Chemistry',
      },
      {
        id: 'chem-tutor-2',
        name: 'Prof. David Chen',
        initials: 'DC',
        credential: 'PhD Physical & General Chemistry',
        institution: 'UC Berkeley',
        rating: '5.0',
        sessions: '480+ sessions',
        specialties: ['Thermodynamics & ΔG', 'Electrochemistry', 'Stoichiometry'],
        avatarUrl: tutorStemImg,
        subjectQuery: 'Chemistry',
      },
      {
        id: 'chem-tutor-3',
        name: 'Dr. Ayesha Malik',
        initials: 'AM',
        credential: 'PhD Biochemistry & Spectroscopy',
        institution: 'University of Manchester',
        rating: '5.0',
        sessions: '395+ sessions',
        specialties: ['Acid-Base Buffers', 'UV-Vis Beer-Lambert', 'Biochemistry'],
        avatarUrl: tutorLanguagesImg,
        subjectQuery: 'Biochemistry',
      },
    ],
  },
};

export const SCIENCE_TOOLS_REGISTRY: ScienceToolItem[] = [
  // =========================================================================
  // 14 BIOLOGY TOOLS (/tools/biology/...)
  // =========================================================================
  {
    toolNumber: 1,
    slug: 'punnett-square-calculator',
    title: 'Punnett Square & Genetics Inheritance Calculator',
    shortTitle: 'Punnett Square Calculator',
    shortDescription:
      'Simulate Monohybrid (Aa × Aa) and Dihybrid (AaBb × AaBb) crosses with color-coded Punnett grids, exact genotype ratios, and dominant/recessive phenotype percentages.',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: 'Aa × Aa → 1:2:1',
    seoKeywords: ['punnett square calculator', 'dihybrid cross calculator', 'monohybrid genotype ratio', 'mendelian genetics solver'],
    seoTitle: 'Free Punnett Square & Dihybrid Genetics Calculator | University Tutors',
    seoDescription:
      'Interactive Monohybrid and Dihybrid Punnett Square calculator for biology students. Compute exact genotype frequencies and 3:1 or 9:3:3:1 phenotype ratios instantly.',
    path: '/tools/biology/punnett-square-calculator',
    viewKey: 'tools/biology/punnett-square-calculator',
    workedExample: {
      problem: 'Cross two heterozygous pea plants (Aa × Aa) where A = Purple flowers (dominant) and a = White flowers (recessive).',
      steps: [
        'Separate parental gametes using Mendel’s Law of Segregation: Parent 1 produces 50% A and 50% a; Parent 2 produces 50% A and 50% a.',
        'Combine gametes in a 2×2 Punnett grid to yield four equally likely offspring boxes: AA, Aa, Aa, and aa.',
        'Aggregate genotypes: 1 AA (25%) : 2 Aa (50%) : 1 aa (25%), producing 75% Purple (A_) and 25% White (aa) phenotypes.',
      ],
      answer: 'Genotype Ratio 1 AA : 2 Aa : 1 aa · Phenotype Ratio 3 Dominant (75%) : 1 Recessive (25%)',
    },
    faqs: [
      {
        question: 'What is the difference between genotype ratio and phenotype ratio?',
        answer:
          'Genotype ratio counts the exact allele combinations (such as 1 AA : 2 Aa : 1 aa), whereas phenotype ratio groups organisms by observable physical traits (3 dominant : 1 recessive under complete dominance).',
      },
      {
        question: 'How many Punnett grid cells are in a dihybrid cross?',
        answer:
          'A dihybrid cross tracks two independent genes simultaneously (e.g., AaBb × AaBb). Each parent forms 4 gamete combinations (AB, Ab, aB, ab), producing a 4×4 = 16-cell Punnett square with a classic 9:3:3:1 phenotypic ratio.',
      },
      {
        question: 'When does a cross deviate from classic Mendelian ratios?',
        answer:
          'Linked genes on the same chromosome, incomplete dominance, codominance, epistasis, or sex-linked inheritance cause offspring proportions to deviate from independent assortment ratios.',
      },
    ],
    relatedSlugs: ['hardy-weinberg-calculator', 'dna-rna-protein-translator', 'crispr-grna-finder'],
  },
  {
    toolNumber: 2,
    slug: 'dna-rna-protein-translator',
    title: 'DNA → RNA → Protein Sequence Translator',
    shortTitle: 'DNA → RNA → Protein Translator',
    shortDescription:
      'Transcribe 5′→3′ coding or template DNA into mRNA codon triplets and translate into 1-letter and 3-letter amino acid chains using the standard genetic code.',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: '5′ DNA → mRNA → Polypeptide',
    seoKeywords: ['dna to rna to protein translator', 'codon chart translator', 'mrna amino acid converter', 'central dogma calculator'],
    seoTitle: 'Free DNA to mRNA to Protein Sequence Translator | University Tutors',
    seoDescription:
      'Transcribe 5′→3′ DNA sequences into complementary DNA, mRNA triplets, and 3-letter/1-letter amino acid chains with BRCA1 and Human Insulin presets.',
    path: '/tools/biology/dna-rna-protein-translator',
    viewKey: 'tools/biology/dna-rna-protein-translator',
    workedExample: {
      problem: 'Translate the 5′ → 3′ coding DNA strand: 5′-ATG GCC TGG TAA-3′.',
      steps: [
        'Write the 3′ → 5′ template DNA complement via Watson-Crick base pairing (A↔T, G↔C): 3′-TAC CGG ACC ATT-5′.',
        'Transcribe into 5′ → 3′ mRNA by replacing Thymine (T) on the coding strand with Uracil (U): 5′-AUG GCC UGG UAA-3′.',
        'Read mRNA codons from the start codon: AUG = Met (M), GCC = Ala (A), UGG = Trp (W), UAA = Stop (*).',
      ],
      answer: 'Polypeptide: Met-Ala-Trp-Stop (M-A-W-*)',
    },
    faqs: [
      {
        question: 'Is the input sequence treated as the coding (sense) strand or template (antisense) strand?',
        answer:
          'By default, standard bioinformatics databases (NCBI GenBank) list the 5′→3′ coding strand, whose sequence matches mRNA except T → U. You can toggle between Coding Strand and Template Strand modes inside the tool.',
      },
      {
        question: 'Which codons signal translation initiation and termination?',
        answer:
          'AUG encodes Methionine (Met) and serves as the universal eukaryotic start codon. UAA (Ochre), UAG (Amber), and UGA (Opal) are the three stop codons that recruit release factors.',
      },
      {
        question: 'Why do multiple codons specify the same amino acid?',
        answer:
          'The genetic code is degenerate (redundant): 61 sense codons encode 20 canonical amino acids, primarily differing at the third “wobble” base position, which buffers against silent point mutations.',
      },
    ],
    relatedSlugs: ['crispr-grna-finder', 'restriction-digest-gel-simulator', 'pcr-master-mix-calculator'],
  },
  {
    toolNumber: 3,
    slug: 'pcr-master-mix-calculator',
    title: 'PCR Master Mix & Primer Annealing (Tm) Calculator',
    shortTitle: 'PCR Master Mix & Primer Tm',
    shortDescription:
      'Compute per-tube and scaled PCR master mix reagent volumes with 10% pipetting overage, plus primer GC% and melting/annealing temperatures (Tm / Ta).',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: 'Tm = 2(A+T) + 4(G+C)',
    seoKeywords: ['pcr master mix calculator', 'primer tm calculator', 'annealing temperature calculator', 'wallace rule tm'],
    seoTitle: 'Free PCR Master Mix & Primer Tm Annealing Calculator | University Tutors',
    seoDescription:
      'Calculate exact PCR master mix volumes with 10% pipetting overage and analyze forward/reverse primer GC% and melting temperatures (Tm) in your browser.',
    path: '/tools/biology/pcr-master-mix-calculator',
    viewKey: 'tools/biology/pcr-master-mix-calculator',
    workedExample: {
      problem: 'Prepare a 25 µL PCR master mix for 8 samples (plus 10% overage) and find the Wallace Tm of primer 5′-ATGCGTACGTAGCTAGCTAG-3′ (10 G/C, 10 A/T).',
      steps: [
        'Apply 10% overage to 8 reactions: multiplier = 8 × 1.10 = 8.8 reaction equivalents.',
        'Multiply each 1× reagent volume (e.g., 12.5 µL 2× Master Mix × 8.8 = 110.0 µL; 1.0 µL Forward Primer × 8.8 = 8.8 µL) while adding template DNA individually to each tube.',
        'Compute Wallace Tm: Tm = 2(10) + 4(10) = 60.0 °C; recommended starting Ta ≈ Tm − 5 °C = 55.0 °C.',
      ],
      answer: 'Total Master Mix Multiplier = 8.8× · Primer GC = 50.0% · Wallace Tm = 60.0 °C',
    },
    faqs: [
      {
        question: 'Why should I include a 10% pipetting overage in PCR master mixes?',
        answer:
          'Liquid adhesion to micropipette tips causes minor volume loss during dispensing. Including a 10% excess ensures the final reaction tube receives its full 25 µL or 50 µL volume without running short.',
      },
      {
        question: 'What is the ideal GC content and length for standard PCR primers?',
        answer:
          'Optimal primers are 18–24 nucleotides long with 40%–60% GC content, a 3′ GC clamp (1–2 G/C bases), and forward/reverse Tm values matched within 2 °C of each other.',
      },
      {
        question: 'When is the Nearest-Neighbor salt-adjusted formula preferred over the Wallace rule?',
        answer:
          'The Wallace rule works well for short oligos (14–20 bp), while salt-adjusted thermodynamic approximations are more accurate for primers longer than 20 bp.',
      },
    ],
    relatedSlugs: ['restriction-digest-gel-simulator', 'crispr-grna-finder', 'serial-dilution-molarity-calculator'],
  },
  {
    toolNumber: 4,
    slug: 'hardy-weinberg-calculator',
    title: 'Hardy-Weinberg Equilibrium Calculator',
    shortTitle: 'Hardy-Weinberg Calculator',
    shortDescription:
      'Enter observed AA, Aa, and aa counts to solve allele frequencies (p, q), expected genotype frequencies (p², 2pq, q²), and Chi-square (χ²) population equilibrium.',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: 'p² + 2pq + q² = 1',
    seoKeywords: ['hardy weinberg calculator', 'allele frequency p and q', 'chi square hardy weinberg', 'population genetics solver'],
    seoTitle: 'Free Hardy-Weinberg Equilibrium & Chi-Square Calculator | University Tutors',
    seoDescription:
      'Calculate allele frequencies (p and q), expected Hardy-Weinberg genotype counts, and Chi-square (df = 1) statistical significance from observed population data.',
    path: '/tools/biology/hardy-weinberg-calculator',
    viewKey: 'tools/biology/hardy-weinberg-calculator',
    workedExample: {
      problem: 'In a moth population of N = 500, you observe 320 AA, 160 Aa, and 20 aa individuals. Test for Hardy-Weinberg equilibrium.',
      steps: [
        'Calculate dominant allele frequency p = (2 × AA + Aa) / (2N) = (640 + 160) / 1000 = 0.80, and q = 1 − p = 0.20.',
        'Compute expected HWE counts: E(AA) = p²N = 0.64 × 500 = 320; E(Aa) = 2pqN = 0.32 × 500 = 160; E(aa) = q²N = 0.04 × 500 = 20.',
        'Calculate χ² = Σ (O − E)² / E = 0 + 0 + 0 = 0.000 (< 3.841 critical value at α = 0.05, df = 1).',
      ],
      answer: 'p = 0.80, q = 0.20 · χ² = 0.000 (Population is in Hardy-Weinberg Equilibrium)',
    },
    faqs: [
      {
        question: 'Why does the Hardy-Weinberg Chi-Square test use 1 degree of freedom (df = 1) instead of 2?',
        answer:
          'Although there are 3 genotype classes (AA, Aa, aa), both total sample size N and estimated allele frequency p are constrained from the observed data: df = 3 classes − 1 (for N) − 1 (for estimated p) = 1.',
      },
      {
        question: 'What are the five assumptions required for Hardy-Weinberg Equilibrium?',
        answer:
          'No mutation, random mating, no natural selection, infinite/large population size (no genetic drift), and no gene flow (migration).',
      },
      {
        question: 'What does it mean if χ² exceeds 3.841?',
        answer:
          'At p < 0.05 (df = 1), χ² > 3.841 rejects the null hypothesis of equilibrium, indicating evolutionary forces, non-random mating (inbreeding), or genotyping error.',
      },
    ],
    relatedSlugs: ['punnett-square-calculator', 'biodiversity-index-calculator', 'dna-rna-protein-translator'],
  },
  {
    toolNumber: 5,
    slug: 'restriction-digest-gel-simulator',
    title: 'Restriction Enzyme Digest & Gel Electrophoresis Simulator',
    shortTitle: 'Restriction Digest & Gel Sim',
    shortDescription:
      'Map EcoRI, BamHI, HindIII, NotI, PstI & XbaI restriction cut sites on linear or circular plasmid DNA and visualize bands on a virtual agarose gel.',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: 'log₁₀(bp) ∝ Migration',
    seoKeywords: ['restriction digest simulator', 'gel electrophoresis simulator', 'ecori bamhi hindiii cutter', 'plasmid digest bands'],
    seoTitle: 'Free Restriction Enzyme Digest & Agarose Gel Simulator | University Tutors',
    seoDescription:
      'Simulate DNA restriction digests with EcoRI, BamHI, HindIII, and NotI. View exact cut positions, fragment lengths (bp), and an interactive 1kb ladder gel.',
    path: '/tools/biology/restriction-digest-gel-simulator',
    viewKey: 'tools/biology/restriction-digest-gel-simulator',
    workedExample: {
      problem: 'A 3,000 bp circular plasmid has EcoRI cut sites at positions 450 bp and 1,650 bp. What fragments appear on an agarose gel?',
      steps: [
        'For a circular DNA molecule, k cut sites yield k fragments (2 cuts = 2 fragments).',
        'Fragment 1 spans from 450 bp to 1,650 bp: 1,650 − 450 = 1,200 bp.',
        'Fragment 2 wraps around the origin: (3,000 − 1,650) + 450 = 1,800 bp.',
      ],
      answer: 'Two gel bands at 1,800 bp and 1,200 bp (summing to 3,000 bp)',
    },
    faqs: [
      {
        question: 'How does linear DNA differ from circular plasmid DNA in fragment count?',
        answer:
          'Cutting a linear DNA molecule n times produces n + 1 fragments, whereas cutting a circular plasmid n times produces exactly n fragments (a single cut linearizes the plasmid into 1 band).',
      },
      {
        question: 'Why do smaller DNA fragments migrate farther toward the positive anode?',
        answer:
          'DNA’s sugar-phosphate backbone carries a uniform negative charge per base pair, so agarose gel pores act as a molecular sieve where migration distance is inversely proportional to log₁₀(bp).',
      },
      {
        question: 'What happens when two fragments have identical base-pair lengths?',
        answer:
          'Co-migrating fragments overlap as a single brighter/thicker doublet band at that molecular weight position on the gel.',
      },
    ],
    relatedSlugs: ['pcr-master-mix-calculator', 'crispr-grna-finder', 'dna-rna-protein-translator'],
  },
  {
    toolNumber: 6,
    slug: 'crispr-grna-finder',
    title: 'CRISPR Guide RNA (gRNA) & PAM Motif Finder',
    shortTitle: 'CRISPR gRNA & PAM Finder',
    shortDescription:
      'Scan target DNA on forward (5′-NGG-3′) and reverse (5′-CCN-3′) strands to identify 20-nt SpCas9 protospacer guides, cut coordinates, and GC% efficiency scores.',
    category: 'Biology',
    subCategory: 'Genetics & Molecular Biology',
    formulaBadge: '5′-N₂₀-NGG-3′ (SpCas9)',
    seoKeywords: ['crispr grna finder', 'pam site finder ngg', 'spcas9 guide rna calculator', 'protospacer gc content'],
    seoTitle: 'Free CRISPR Guide RNA (gRNA) & NGG PAM Finder | University Tutors',
    seoDescription:
      'Scan forward and reverse DNA strands for SpCas9 5′-NGG-3′ PAM motifs. Rank 20-nt CRISPR guide RNAs by GC% efficiency and poly-T termination risk.',
    path: '/tools/biology/crispr-grna-finder',
    viewKey: 'tools/biology/crispr-grna-finder',
    workedExample: {
      problem: 'Identify a forward-strand SpCas9 target in 5′-GCATGCTAGCTAGCTGATCGAGGCT-3′.',
      steps: [
        'Locate the 3-nt PAM motif 5′-NGG-3′ near the 3′ end: positions 21–23 read "AGG".',
        'Extract the 20 nucleotides immediately 5′ upstream of AGG (positions 1–20): 5′-GCATGCTAGCTAGCTGATCG-3′.',
        'Compute GC% = 11 G/C bases ÷ 20 = 55% (Optimal 40–60% window); Cas9 cleaves 3 bp upstream of the PAM (between nt 17 and 18).',
      ],
      answer: 'Guide: 5′-GCATGCTAGCTAGCTGATCG-3′ · PAM: AGG · GC: 55% (Optimal)',
    },
    faqs: [
      {
        question: 'Is the NGG PAM sequence included in the 20-nt synthetic sgRNA spacer?',
        answer:
          'No! Never include the 3-nt NGG PAM in your synthesized guide RNA oligo—including it causes Cas9 to cleave your own gRNA expression plasmid.',
      },
      {
        question: 'How does the tool detect reverse-strand CRISPR guides?',
        answer:
          'A 5′-CCN-3′ motif on the top strand corresponds to 5′-NGG-3′ on the complementary bottom strand; the 20 nucleotides downstream of CCN are reverse-complemented into a 5′→3′ guide sequence.',
      },
      {
        question: 'Why are TTTT stretches flagged in guide RNA candidates?',
        answer:
          'Four or more consecutive Thymines (TTTT) act as a premature transcription termination signal for RNA Polymerase III under U6 promoters.',
      },
    ],
    relatedSlugs: ['dna-rna-protein-translator', 'restriction-digest-gel-simulator', 'pcr-master-mix-calculator'],
  },
  {
    toolNumber: 7,
    slug: 'serial-dilution-molarity-calculator',
    title: 'Serial Dilution & Lab Molarity Calculator (C₁V₁ = C₂V₂)',
    shortTitle: 'Serial Dilution & C₁V₁=C₂V₂',
    shortDescription:
      'Solve stock-to-working buffer dilutions across M, mM, µM, nM and L, mL, µL, or generate multi-tube logarithmic serial dilution bench protocols.',
    category: 'Biology',
    subCategory: 'Cell Biology & Lab Prep',
    formulaBadge: 'C₁V₁ = C₂V₂',
    seoKeywords: ['c1v1 c2v2 calculator', 'serial dilution calculator', 'stock solution dilution', 'lab molarity dilution'],
    seoTitle: 'Free Serial Dilution & C₁V₁ = C₂V₂ Lab Calculator | University Tutors',
    seoDescription:
      'Calculate stock transfer volumes with C₁V₁ = C₂V₂ unit conversion (M, mM, µM, nM; L, mL, µL) and build step-by-step serial dilution tube tables.',
    path: '/tools/biology/serial-dilution-molarity-calculator',
    viewKey: 'tools/biology/serial-dilution-molarity-calculator',
    workedExample: {
      problem: 'How much 10 mM stock antibiotic (C₁) is required to prepare 50 mL (V₂) of a 25 µM working medium (C₂)?',
      steps: [
        'Convert concentrations to a common unit (µM): C₁ = 10 mM = 10,000 µM; C₂ = 25 µM.',
        'Rearrange C₁V₁ = C₂V₂ for V₁: V₁ = (25 µM × 50 mL) / 10,000 µM = 0.125 mL = 125 µL.',
        'Dispense 125 µL stock into 49.875 mL sterile medium to reach 50.0 mL total volume.',
      ],
      answer: 'Pipette 125.0 µL of 10 mM stock + 49.875 mL diluent',
    },
    faqs: [
      {
        question: 'How do I calculate diluent volume in a 1:10 serial dilution?',
        answer:
          'For a 1:10 dilution factor with 1.0 mL final volume per tube, transfer V_transfer = 1.0 / (10 − 1) or simpler: combine 100 µL transfer + 900 µL buffer = 1,000 µL total (then transfer 100 µL to the next tube).',
      },
      {
        question: 'Can C₁V₁ = C₂V₂ be used with percent (% w/v) or mg/mL stocks?',
        answer:
          'Yes, as long as C₁ and C₂ share compatible concentration dimensions (both molar or both mass/volume).',
      },
      {
        question: 'Why should concentrated acids or stocks be added to diluent buffer?',
        answer:
          'Adding stock to ~80% of the final solvent volume ensures thorough mixing, prevents localized precipitation, and allows accurate meniscus bring-to-volume.',
      },
    ],
    relatedSlugs: ['cell-growth-cfu-calculator', 'pcr-master-mix-calculator', 'water-potential-osmolarity-calculator'],
  },
  {
    toolNumber: 8,
    slug: 'cell-growth-cfu-calculator',
    title: 'Bacterial Doubling Time & CFU/mL Calculator',
    shortTitle: 'Bacterial Growth & CFU/mL',
    shortDescription:
      'Calculate bacterial generation count (n), doubling time (g), and specific growth rate (μ) from exponential phase counts, plus viable plate CFU/mL.',
    category: 'Biology',
    subCategory: 'Cell Biology & Lab Prep',
    formulaBadge: 'Nₜ = N₀ · 2ⁿ',
    seoKeywords: ['bacterial doubling time calculator', 'cfu ml calculator', 'generation time microbiology', 'specific growth rate mu'],
    seoTitle: 'Free Bacterial Doubling Time & CFU/mL Plate Calculator | University Tutors',
    seoDescription:
      'Compute microbial generation time (g), number of doublings (n), specific growth rate (μ), and viable colony-forming units (CFU/mL) from serial dilutions.',
    path: '/tools/biology/cell-growth-cfu-calculator',
    viewKey: 'tools/biology/cell-growth-cfu-calculator',
    workedExample: {
      problem: 'An E. coli culture grows from N₀ = 1.0 × 10⁴ cells/mL to Nₜ = 6.4 × 10⁵ cells/mL in 180 minutes. Find doubling time g.',
      steps: [
        'Find number of generations n = log₂(Nₜ / N₀) = log₁₀(64) / 0.30103 = 6.0 generations.',
        'Compute doubling time g = t / n = 180 min / 6.0 = 30.0 minutes per generation.',
        'Compute specific growth rate μ = ln(2) / g = 0.6931 / 0.5 hr = 1.386 hr⁻¹.',
      ],
      answer: 'n = 6.0 generations · Doubling Time g = 30.0 min · μ = 1.39 hr⁻¹',
    },
    faqs: [
      {
        question: 'Why are agar plates only considered statistically countable between 30 and 300 colonies?',
        answer:
          'Fewer than 30 colonies (TFTCs) suffer high Poisson sampling variance, while more than 300 colonies (TNTC) overcrowd and merge on the agar surface, underestimating true CFU/mL.',
      },
      {
        question: 'During which phase of the microbial growth curve does Nₜ = N₀ · 2ⁿ apply?',
        answer:
          'Strictly during the exponential (log) growth phase, when binary fission proceeds at a constant maximum rate without nutrient depletion.',
      },
      {
        question: 'How does plated volume (0.1 mL spread plate vs 1.0 mL pour plate) affect CFU/mL?',
        answer:
          'Spreading 0.1 mL (100 µL) plates one-tenth of a milliliter, multiplying the colony count by an extra factor of 10 compared to a 1.0 mL pour plate at the same tube dilution.',
      },
    ],
    relatedSlugs: ['serial-dilution-molarity-calculator', 'microscope-fov-calculator', 'interactive-cell-explorer'],
  },
  {
    toolNumber: 9,
    slug: 'microscope-fov-calculator',
    title: 'Microscope Magnification & Field-of-View (FOV) Calculator',
    shortTitle: 'Microscope FOV & Specimen Size',
    shortDescription:
      'Compute total compound magnification, high-power Field-of-View diameter (µm), and actual cell size from ocular/objective lenses.',
    category: 'Biology',
    subCategory: 'Cell Biology & Lab Prep',
    formulaBadge: 'FOV₂ = FOV₁ × (M₁ / M₂)',
    seoKeywords: ['microscope fov calculator', 'field of view micrometer calculator', 'total magnification biology', 'cell size microscope'],
    seoTitle: 'Free Microscope Field-of-View (FOV) & Cell Size Calculator | University Tutors',
    seoDescription:
      'Calculate compound microscope total magnification, high-power FOV diameter in millimeters and micrometers (µm), and actual specimen length.',
    path: '/tools/biology/microscope-fov-calculator',
    viewKey: 'tools/biology/microscope-fov-calculator',
    workedExample: {
      problem: 'With a 10× ocular and 4× scanning objective, your measured FOV diameter is 4.5 mm. What is the FOV under the 40× objective, and how long is a cell spanning 25% of that view?',
      steps: [
        'Total magnification increases 10-fold from M₁ = 40× to M₂ = 400×.',
        'High-power FOV₂ = 4.5 mm × (40 / 400) = 0.45 mm = 450 µm.',
        'Specimen length = 25% × 450 µm = 112.5 µm.',
      ],
      answer: '400× Total Magnification · FOV = 450 µm · Specimen Length = 112.5 µm',
    },
    faqs: [
      {
        question: 'Why can’t you measure the 40× or 100× Field of View directly with a plastic millimeter ruler?',
        answer:
          'At 400×–1000× magnification, the FOV shrinks below 0.5 mm, so millimeter ruler markings appear thicker than the entire viewing circle; calculating from low-power calibration or a stage micrometer is far more accurate.',
      },
      {
        question: 'How do you convert millimeters (mm) to micrometers (µm)?',
        answer:
          'Multiply millimeters by 1,000 (1 mm = 1,000 µm). For example, 0.45 mm equals 450 µm.',
      },
      {
        question: 'Why does light intensity drop when switching to higher objective lenses?',
        answer:
          'Higher magnification views a much smaller area of the slide through a narrower aperture, requiring you to open the iris diaphragm or increase illuminator brightness.',
      },
    ],
    relatedSlugs: ['interactive-cell-explorer', 'cell-growth-cfu-calculator', 'water-potential-osmolarity-calculator'],
  },
  {
    toolNumber: 10,
    slug: 'interactive-cell-explorer',
    title: 'Interactive Eukaryotic & Prokaryotic Cell Explorer',
    shortTitle: 'Interactive Cell Explorer',
    shortDescription:
      'Click organelles across Animal, Plant, and Bacterial SVG cell diagrams to inspect ultrastructure, biochemical pathways, and high-yield exam comparisons.',
    category: 'Biology',
    subCategory: 'Cell Biology & Lab Prep',
    formulaBadge: 'Animal · Plant · Prokaryote',
    seoKeywords: ['interactive cell diagram', 'eukaryotic vs prokaryotic organelles', 'animal plant bacterial cell explorer', 'organelle function study tool'],
    seoTitle: 'Interactive Animal, Plant & Bacterial Cell Organelle Explorer | University Tutors',
    seoDescription:
      'Explore interactive Animal, Plant, and Prokaryotic cell SVG diagrams. Click any organelle to review structure, ATP/protein pathways, and exam comparisons.',
    path: '/tools/biology/interactive-cell-explorer',
    viewKey: 'tools/biology/interactive-cell-explorer',
    workedExample: {
      problem: 'Distinguish a photosynthetic plant mesophyll cell from an animal hepatocyte and a Gram-negative bacterium.',
      steps: [
        'Check membrane-bound nucleus & endomembrane organelles (ER, Golgi, Mitochondria): Present in both Plant & Animal (Eukaryotes), absent in Bacteria (70S ribosomes + nucleoid).',
        'Check cell wall composition: Cellulose cell wall + plasmodesmata in Plants; peptidoglycan cell wall in Bacteria; no cell wall in Animal cells.',
        'Check specialized plastids & vacuoles: Chloroplasts (80S host / 70S stromal ribosomes) and large central tonoplast vacuole uniquely define Plant cells.',
      ],
      answer: 'Plant = Cellulose Wall + Chloroplasts + Central Vacuole · Animal = Centrosomes + Lysosomes · Bacteria = Nucleoid + 70S Ribosomes',
    },
    faqs: [
      {
        question: 'What evidence supports the Endosymbiotic Theory for mitochondria and chloroplasts?',
        answer:
          'Both organelles possess double membranes, circular naked DNA, autonomous binary-fission-like division, and bacterial-type 70S ribosomes sensitive to chloramphenicol/streptomycin.',
      },
      {
        question: 'How does the endomembrane secretory pathway traffic a secreted protein?',
        answer:
          'Signal peptide translation on Rough ER → ER lumen glycosylation → COPII vesicles to cis-Golgi → trans-Golgi sorting → secretory vesicle exocytosis at the plasma membrane.',
      },
      {
        question: 'Do plant cells contain mitochondria if they already have chloroplasts?',
        answer:
          'Yes! Chloroplasts generate ATP solely to power the Calvin cycle in light; plant cells still require mitochondria to oxidize sugars via cellular respiration day and night.',
      },
    ],
    relatedSlugs: ['microscope-fov-calculator', 'water-potential-osmolarity-calculator', 'taxonomic-dichotomous-key-builder'],
  },
  {
    toolNumber: 11,
    slug: 'biodiversity-index-calculator',
    title: "Shannon-Wiener (H') & Simpson's (D) Biodiversity Calculator",
    shortTitle: 'Biodiversity Index (H′ & D)',
    shortDescription:
      'Enter field quadrat or transect species counts to calculate Richness (S), Shannon-Wiener Diversity (H′), Pielou Evenness (E), and Simpson’s Diversity (1 − D).',
    category: 'Biology',
    subCategory: 'Ecology, Botany & Physiology',
    formulaBadge: "H' = −Σ pᵢ ln(pᵢ)",
    seoKeywords: ['shannon wiener index calculator', 'simpson diversity index calculator', 'species evenness calculator', 'ecology quadrat diversity'],
    seoTitle: "Free Shannon-Wiener (H') & Simpson's Biodiversity Calculator | University Tutors",
    seoDescription:
      "Compute Species Richness (S), Shannon-Wiener Index (H'), Evenness (E), and Simpson's Diversity Index (1 − D) from ecological field sampling tables.",
    path: '/tools/biology/biodiversity-index-calculator',
    viewKey: 'tools/biology/biodiversity-index-calculator',
    workedExample: {
      problem: 'A stream benthic sample contains 30 Mayflies, 30 Stoneflies, and 40 Caddisflies (N = 100, S = 3). Find H′ and Evenness E.',
      steps: [
        'Compute relative abundances pᵢ: p₁ = 0.30, p₂ = 0.30, p₃ = 0.40.',
        'Compute −pᵢ ln(pᵢ) terms: −0.30(−1.2040) = 0.3612; −0.30(−1.2040) = 0.3612; −0.40(−0.9163) = 0.3665.',
        'Sum terms: H′ = 1.0889; Evenness E = H′ / ln(3) = 1.0889 / 1.0986 = 0.991.',
      ],
      answer: 'H′ = 1.089 · H_max = 1.099 · Evenness E = 0.991 (Highly even community)',
    },
    faqs: [
      {
        question: 'What is a typical range for the Shannon-Wiener Index (H′) in real ecosystems?',
        answer:
          'Most natural ecological communities yield H′ values between 1.5 and 3.5; values above 4.0 indicate exceptionally rich, even tropical rainforest or coral reef assemblages.',
      },
      {
        question: 'How does Simpson’s Index D differ from Simpson’s Index of Diversity (1 − D)?',
        answer:
          'Raw D measures the probability that two randomly sampled individuals belong to the same species (dominance), so 1 − D intuitive scales from 0 (no diversity) to 1 (high diversity).',
      },
      {
        question: 'Should natural log (ln) or log base 10 be used for H′?',
        answer:
          'Modern university ecology textbooks and R vegan packages standardize on the natural logarithm (ln, nats), which our calculator uses alongside H_max = ln(S).',
      },
    ],
    relatedSlugs: ['hardy-weinberg-calculator', 'taxonomic-dichotomous-key-builder', 'water-potential-osmolarity-calculator'],
  },
  {
    toolNumber: 12,
    slug: 'water-potential-osmolarity-calculator',
    title: 'Plant Water Potential (Ψ = Ψs + Ψp) & Osmolarity Solver',
    shortTitle: 'Plant Water Potential (Ψ)',
    shortDescription:
      'Compute solute potential (Ψs = −iCRT) and total water potential (Ψ = Ψs + Ψp) in bars/MPa, and predict tonicity & osmotic water movement.',
    category: 'Biology',
    subCategory: 'Ecology, Botany & Physiology',
    formulaBadge: 'Ψ = Ψs + Ψp = −iCRT + Ψp',
    seoKeywords: ['water potential calculator', 'solute potential icrt calculator', 'plant osmosis turgor pressure', 'ap biology water potential'],
    seoTitle: 'Free Plant Water Potential (Ψ = −iCRT + Ψp) Calculator | University Tutors',
    seoDescription:
      'Solve solute potential (Ψs = −iCRT), pressure potential (Ψp), total water potential (bars & MPa), and osmotic direction between plant cells and solutions.',
    path: '/tools/biology/water-potential-osmolarity-calculator',
    viewKey: 'tools/biology/water-potential-osmolarity-calculator',
    workedExample: {
      problem: 'Calculate the solute potential Ψs of a 0.30 M sucrose solution in an open beaker (Ψp = 0) at 22 °C.',
      steps: [
        'Sucrose does not ionize in water, so ionization constant i = 1. Convert T = 22 + 273.15 = 295.15 K.',
        'Apply Ψs = −iCRT = −(1)(0.30 mol/L)(0.0831 L·bar/mol·K)(295.15 K) = −7.36 bars.',
        'In an open beaker Ψp = 0, so total Ψ = −7.36 bars (−0.736 MPa).',
      ],
      answer: 'Ψs = −7.36 bars · Total Ψ = −7.36 bars (−0.736 MPa)',
    },
    faqs: [
      {
        question: 'In which direction does water always move across a semi-permeable membrane?',
        answer:
          'Water passively diffuses by osmosis from regions of HIGHER (less negative) total water potential Ψ toward regions of LOWER (more negative) total water potential Ψ.',
      },
      {
        question: 'Why is the ionization constant i = 1 for glucose/sucrose but i = 2 for NaCl?',
        answer:
          'Covalent sugars remain intact molecules in solution (1 particle per formula unit), whereas NaCl dissociates into Na⁺ and Cl⁻ ions (2 osmotically active particles per formula unit).',
      },
      {
        question: 'How do you convert bars into Megapascals (MPa)?',
        answer:
          'Divide bars by 10: 1 MPa = 10 bars (for example, −7.5 bars equals −0.75 MPa).',
      },
    ],
    relatedSlugs: ['serial-dilution-molarity-calculator', 'interactive-cell-explorer', 'human-physiology-calculators'],
  },
  {
    toolNumber: 13,
    slug: 'human-physiology-calculators',
    title: 'Cardiac Output, MAP, BMR & Spirometry Volume Calculator',
    shortTitle: 'Human Physiology Calculators',
    shortDescription:
      'Tabbed clinical physiology suite solving Cardiac Output (HR × SV), Mean Arterial Pressure (MAP), Mifflin-St Jeor BMR/TDEE, and Spirometry Lung Capacities.',
    category: 'Biology',
    subCategory: 'Ecology, Botany & Physiology',
    formulaBadge: 'CO = HR × SV · MAP',
    seoKeywords: ['cardiac output calculator', 'mean arterial pressure map calculator', 'spirometry vital capacity fev1', 'mifflin st jeor bmr physiology'],
    seoTitle: 'Free Human Physiology Calculator — CO, MAP, BMR & Spirometry | University Tutors',
    seoDescription:
      'Calculate Cardiac Output, Ejection Fraction, Mean Arterial Pressure (MAP), Mifflin-St Jeor BMR, and Spirometry Vital Capacity / FEV1% for physiology labs.',
    path: '/tools/biology/human-physiology-calculators',
    viewKey: 'tools/biology/human-physiology-calculators',
    workedExample: {
      problem: 'A resting student has Heart Rate = 72 bpm, EDV = 125 mL, ESV = 55 mL, and Blood Pressure = 120/80 mmHg. Find CO, EF%, and MAP.',
      steps: [
        'Stroke Volume SV = EDV − ESV = 125 − 55 = 70 mL/beat; Ejection Fraction EF = (70 / 125) × 100 = 56.0%.',
        'Cardiac Output CO = HR × SV = 72 bpm × 70 mL = 5,040 mL/min = 5.04 L/min.',
        'Mean Arterial Pressure MAP = DP + ⅓(SP − DP) = 80 + ⅓(40) = 93.3 mmHg.',
      ],
      answer: 'SV = 70 mL · CO = 5.04 L/min · EF = 56.0% · MAP = 93.3 mmHg',
    },
    faqs: [
      {
        question: 'Why is Mean Arterial Pressure weighted 2/3 toward diastolic pressure instead of a 50/50 average?',
        answer:
          'At normal resting heart rates, the cardiac ventricles spend roughly twice as much time relaxing in diastole (~0.5 s) as contracting in systole (~0.3 s).',
      },
      {
        question: 'What is the clinical threshold for Mean Arterial Pressure (MAP) organ perfusion?',
        answer:
          'Normal resting MAP ranges from 70 to 100 mmHg; a sustained MAP of at least 60–65 mmHg is required to perfuse coronary, cerebral, and renal capillary beds.',
      },
      {
        question: 'How does the FEV1/FVC ratio differentiate obstructive from restrictive lung patterns?',
        answer:
          'Obstructive airway conditions (asthma, COPD) markedly reduce expiratory flow (FEV1/FVC < 70%), whereas restrictive conditions reduce both FEV1 and FVC proportionally (normal or elevated FEV1/FVC ≥ 80%).',
      },
    ],
    relatedSlugs: ['water-potential-osmolarity-calculator', 'cell-growth-cfu-calculator', 'biodiversity-index-calculator'],
  },
  {
    toolNumber: 14,
    slug: 'taxonomic-dichotomous-key-builder',
    title: 'Taxonomic Hierarchy & Dichotomous Key Builder',
    shortTitle: 'Taxonomy & Dichotomous Key',
    shortDescription:
      'Build 8-rank Linnaean taxonomic trees (Domain → Species) with formatted binomial nomenclature and walk through or author interactive dichotomous keys.',
    category: 'Biology',
    subCategory: 'Ecology, Botany & Physiology',
    formulaBadge: 'Domain → Genus species',
    seoKeywords: ['dichotomous key builder', 'taxonomic hierarchy explorer', 'linnaean classification tool', 'binomial nomenclature formatter'],
    seoTitle: 'Free Taxonomic Hierarchy & Dichotomous Key Builder | University Tutors',
    seoDescription:
      'Explore 8-rank Linnaean taxonomy (Domain to Species) for model organisms and test or build step-by-step dichotomous identification keys.',
    path: '/tools/biology/taxonomic-dichotomous-key-builder',
    viewKey: 'tools/biology/taxonomic-dichotomous-key-builder',
    workedExample: {
      problem: 'Format the scientific binomial name and classify Arabidopsis thaliana (thale cress) across the 8 major taxonomic ranks.',
      steps: [
        'Assign higher ranks: Domain Eukarya → Kingdom Plantae → Phylum Magnoliophyta (Angiosperms) → Class Eudicots → Order Brassicales → Family Brassicaceae.',
        'Capitalize the Genus (Arabidopsis), lowercase the specific epithet (thaliana), and italicize both words.',
        'Verify dichotomous traits: Vascular seeds → Enclosed ovules (flowers) → Net-veined leaves & 4-petaled cruciform corolla → Brassicaceae.',
      ],
      answer: 'Arabidopsis thaliana (Family Brassicaceae, Order Brassicales)',
    },
    faqs: [
      {
        question: 'What are the strict ICZN / ICN rules for writing binomial scientific names?',
        answer:
          'The Genus name is always capitalized, the specific epithet is always lowercase (even when named after a person or place), and both words are italicized in print (or underlined individually when handwritten).',
      },
      {
        question: 'How does a dichotomous key differ from a phylogenetic tree?',
        answer:
          'A dichotomous key is a practical diagnostic tool using paired mutually exclusive observable traits (1a vs 1b) to identify specimens, whereas a phylogenetic cladogram maps evolutionary common ancestry.',
      },
      {
        question: 'What mnemonic helps memorize the 8 taxonomic ranks in order?',
        answer:
          '“Dear King Philip Came Over For Good Soup” → Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species.',
      },
    ],
    relatedSlugs: ['biodiversity-index-calculator', 'interactive-cell-explorer', 'hardy-weinberg-calculator'],
  },

  // =========================================================================
  // 16 CHEMISTRY TOOLS (/tools/chemistry/...)
  // =========================================================================
  {
    toolNumber: 15,
    slug: 'interactive-periodic-table',
    title: 'Interactive Periodic Table of Elements',
    shortTitle: 'Interactive Periodic Table',
    shortDescription:
      'Filter elements by block, group, state, electronegativity, ionization energy, electron configuration, and atomic mass.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: 'Z · Atomic Mass · e⁻ Config',
    seoKeywords: ['interactive periodic table', 'electron configuration lookup', 'electronegativity periodic table', 'molar mass elements'],
    seoTitle: 'Free Interactive Periodic Table of Elements for Students | University Tutors',
    seoDescription:
      'Explore atomic numbers, IUPAC atomic masses, electron configurations, Pauling electronegativities, and oxidation states in an interactive periodic table.',
    path: '/tools/chemistry/interactive-periodic-table',
    viewKey: 'tools/chemistry/interactive-periodic-table',
    workedExample: {
      problem: 'Write the ground-state noble-gas electron configuration and valence count of Iron (Fe, Z = 26).',
      steps: [
        'Locate preceding noble gas Argon [Ar] accounting for 18 core electrons.',
        'Fill the 4s subshell (2 e⁻) followed by six electrons in the 3d subshell: [Ar] 3d⁶ 4s².',
        'For Fe²⁺/Fe³⁺ cations, remove 4s electrons before 3d electrons (Fe²⁺ = [Ar] 3d⁶).',
      ],
      answer: 'Fe (Z = 26, 55.845 g/mol) · [Ar] 3d⁶ 4s²',
    },
    faqs: [
      {
        question: 'Why do Chromium (Cr) and Copper (Cu) show anomalous d-block configurations?',
        answer:
          'Half-filled (3d⁵ 4s¹ in Cr) and completely filled (3d¹⁰ 4s¹ in Cu) d-subshells lower electron-electron repulsion and maximize exchange energy stability.',
      },
      {
        question: 'How do atomic radius and first ionization energy trend across a period?',
        answer:
          'Moving left to right across a period increases effective nuclear charge (Z_eff), pulling valence shells inward (smaller radius) and raising first ionization energy.',
      },
      {
        question: 'Which element has the highest Pauling electronegativity?',
        answer:
          'Fluorine (F, χ = 3.98) is the most electronegative element, followed by Oxygen (3.44), Chlorine (3.16), and Nitrogen (3.04).',
      },
    ],
    relatedSlugs: ['molar-mass-calculator', 'vsepr-molecular-geometry-visualizer', 'radioactive-decay-halflife-calculator'],
  },
  {
    toolNumber: 16,
    slug: 'molar-mass-calculator',
    title: 'Molar Mass & Elemental Percent Composition Calculator',
    shortTitle: 'Molar Mass & % Composition',
    shortDescription:
      'Parse chemical formulas with parentheses and hydrates (e.g., CuSO4·5H2O, Ca3(PO4)2) to compute exact g/mol and mass percent by element.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: 'M = Σ nᵢAᵣ (g/mol)',
    seoKeywords: ['molar mass calculator', 'molecular weight calculator', 'percent composition chemistry', 'hydrate molar mass'],
    seoTitle: 'Free Molar Mass & Elemental Percent Composition Calculator | University Tutors',
    seoDescription:
      'Calculate exact molar mass (g/mol), moles-to-grams conversions, and elemental mass percent composition for any chemical formula or hydrate.',
    path: '/tools/chemistry/molar-mass-calculator',
    viewKey: 'tools/chemistry/molar-mass-calculator',
    workedExample: {
      problem: 'Calculate the molar mass and mass percent of Carbon in Glucose (C6H12O6).',
      steps: [
        'Sum atomic contributions: 6 × C (12.011) = 72.066; 12 × H (1.008) = 12.096; 6 × O (15.999) = 95.994.',
        'Total Molar Mass M = 72.066 + 12.096 + 95.994 = 180.156 g/mol.',
        'Mass % C = (72.066 / 180.156) × 100% = 40.00%.',
      ],
      answer: 'M = 180.16 g/mol · 40.00% C, 6.71% H, 53.28% O',
    },
    faqs: [
      {
        question: 'How do parentheses like Ca3(PO4)2 affect atom counts?',
        answer:
          'Subscripts outside parentheses multiply every atom inside: (PO4)2 contributes 2 Phosphorus atoms and 8 Oxygen atoms per formula unit.',
      },
      {
        question: 'How do I enter hydrated salts such as Copper(II) sulfate pentahydrate?',
        answer:
          'Use a dot or asterisk such as CuSO4*5H2O or CuSO4·5H2O—the parser adds five water molecules (90.075 g/mol) to anhydrous CuSO4.',
      },
      {
        question: 'Are molar mass (g/mol) and molecular mass (amu / Da) numerically identical?',
        answer:
          'Yes! Because Avogadro’s number bridges atomic mass units to grams, 1 molecule of H2O weighs 18.015 amu and 1 mole weighs 18.015 g.',
      },
    ],
    relatedSlugs: ['empirical-molecular-formula-finder', 'limiting-reagent-yield-calculator', 'chemical-equation-balancer'],
  },
  {
    toolNumber: 17,
    slug: 'chemical-equation-balancer',
    title: 'Chemical Equation Balancer',
    shortTitle: 'Chemical Equation Balancer',
    shortDescription:
      'Balance combustion, redox, precipitation, and synthesis equations automatically using exact nullspace linear algebra with atom-conservation tables.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: 'aA + bB → cC + dD',
    seoKeywords: ['chemical equation balancer', 'balance stoichiometry equations', 'combustion equation balancer', 'reaction coefficients'],
    seoTitle: 'Free Chemical Equation Balancer with Atom Verification | University Tutors',
    seoDescription:
      'Balance chemical equations instantly with smallest whole-number stoichiometric coefficients and reactant-vs-product atom conservation tables.',
    path: '/tools/chemistry/chemical-equation-balancer',
    viewKey: 'tools/chemistry/chemical-equation-balancer',
    workedExample: {
      problem: 'Balance the complete combustion of propane: C3H8 + O2 → CO2 + H2O.',
      steps: [
        'Balance Carbon first: 3 C in C3H8 requires coefficient 3 before CO2.',
        'Balance Hydrogen next: 8 H in C3H8 requires coefficient 4 before H2O (4 × 2 = 8 H).',
        'Count Oxygen on product side: (3 × 2) + (4 × 1) = 10 O atoms, requiring 5 O2 molecules.',
      ],
      answer: '1 C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O',
    },
    faqs: [
      {
        question: 'Why can you only change stoichiometric coefficients and never chemical subscripts?',
        answer:
          'Changing subscripts alters the chemical identity of the substance (e.g., H2O water vs. H2O2 hydrogen peroxide), violating experimental reality.',
      },
      {
        question: 'How does matrix linear algebra balance complex multi-species equations?',
        answer:
          'Each element forms a linear conservation row (Reactants − Products = 0); solving the integer nullspace finds the unique smallest coprime whole-number coefficients.',
      },
      {
        question: 'Which element should I balance last when solving by inspection?',
        answer:
          'Always save pure diatomic or monatomic elements (like O2, H2, N2, or Fe) for last because adjusting their coefficient affects only one element.',
      },
    ],
    relatedSlugs: ['limiting-reagent-yield-calculator', 'molar-mass-calculator', 'nernst-electrochemistry-solver'],
  },
  {
    toolNumber: 18,
    slug: 'limiting-reagent-yield-calculator',
    title: 'Limiting Reagent & Theoretical Yield Calculator',
    shortTitle: 'Limiting Reagent & % Yield',
    shortDescription:
      'Identify the limiting reactant, leftover excess reagent mass, theoretical product yield (g & mol), and experimental percent yield.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: '% Yield = (Actual / Theor.) × 100',
    seoKeywords: ['limiting reagent calculator', 'theoretical yield calculator', 'percent yield chemistry', 'excess reactant leftover'],
    seoTitle: 'Free Limiting Reagent, Excess & Percent Yield Calculator | University Tutors',
    seoDescription:
      'Determine the limiting reactant, leftover excess mass, theoretical yield in grams, and experimental percent yield for two-reactant stoichiometry.',
    path: '/tools/chemistry/limiting-reagent-yield-calculator',
    viewKey: 'tools/chemistry/limiting-reagent-yield-calculator',
    workedExample: {
      problem: 'For N2 + 3 H2 → 2 NH3, react 28.02 g N2 (1.00 mol) with 4.03 g H2 (2.00 mol). If 19.5 g NH3 is isolated, find % yield.',
      steps: [
        'Divide moles by stoichiometric coefficients: N2 = 1.00 / 1 = 1.00; H2 = 2.00 / 3 = 0.667 → H2 is the limiting reagent.',
        'Theoretical NH3 moles = 2.00 mol H2 × (2 mol NH3 / 3 mol H2) = 1.333 mol × 17.031 g/mol = 22.71 g.',
        'Percent Yield = (19.5 g / 22.71 g) × 100% = 85.9%.',
      ],
      answer: 'Limiting Reagent: H₂ · Theoretical Yield = 22.71 g · Percent Yield = 85.9%',
    },
    faqs: [
      {
        question: 'Is the reactant with the smaller starting mass in grams always the limiting reagent?',
        answer:
          'Never assume from grams alone! You must convert grams to moles AND divide by each reactant’s stoichiometric coefficient to compare reaction equivalents.',
      },
      {
        question: 'Why can experimental percent yield occasionally exceed 100% in undergraduate labs?',
        answer:
          'Apparent yields >100% almost always indicate incomplete drying (residual water/solvent trapped in the crystals) or co-precipitated salt impurities.',
      },
      {
        question: 'How is remaining excess reagent mass calculated?',
        answer:
          'Subtract moles reacted (limiting equivalents × excess coefficient) from initial excess moles, then multiply by the excess reagent’s molar mass.',
      },
    ],
    relatedSlugs: ['chemical-equation-balancer', 'molar-mass-calculator', 'empirical-molecular-formula-finder'],
  },
  {
    toolNumber: 19,
    slug: 'empirical-molecular-formula-finder',
    title: 'Empirical & Molecular Formula Finder',
    shortTitle: 'Empirical & Molecular Formula',
    shortDescription:
      'Convert elemental mass percentages or combustion grams into simplest whole-number empirical ratios and true molecular formulas from molar mass.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: 'MF = (EF)ₙ',
    seoKeywords: ['empirical formula calculator', 'molecular formula from percent composition', 'combustion analysis formula', 'mass percent to formula'],
    seoTitle: 'Free Empirical & Molecular Formula Calculator | University Tutors',
    seoDescription:
      'Convert elemental mass percentages into whole-number empirical formulas and scale to exact molecular formulas using experimental molar mass.',
    path: '/tools/chemistry/empirical-molecular-formula-finder',
    viewKey: 'tools/chemistry/empirical-molecular-formula-finder',
    workedExample: {
      problem: 'An unknown organic compound is 40.00% C, 6.71% H, and 53.29% O by mass with a molar mass of 180.16 g/mol.',
      steps: [
        'Assume 100 g sample → moles: C = 40.00/12.011 = 3.330 mol; H = 6.71/1.008 = 6.657 mol; O = 53.29/15.999 = 3.331 mol.',
        'Divide by smallest mole count (3.330): C₁ H₂ O₁ → Empirical Formula CH₂O (EF mass = 30.026 g/mol).',
        'Multiplier n = 180.16 / 30.026 ≈ 6 → Molecular Formula = C₆H₁₂O₆.',
      ],
      answer: 'Empirical Formula: CH₂O · Multiplier n = 6 · Molecular Formula: C₆H₁₂O₆',
    },
    faqs: [
      {
        question: 'What do I do if mole ratios end in .50, .33, or .25 after dividing by the smallest value?',
        answer:
          'Do not round fractional ratios like 1.5 or 1.33! Multiply all subscripts by 2 (for .5), 3 (for .33/.67), or 4 (for .25/.75) to obtain clean integers.',
      },
      {
        question: 'Can two distinct compounds share both the same empirical AND molecular formula?',
        answer:
          'Yes—constitutional isomers (like ethanol and dimethyl ether, both C2H6O) share identical molecular formulas and require IR/NMR spectroscopy to distinguish.',
      },
      {
        question: 'Do percentages have to sum to exactly 100%?',
        answer:
          'You can enter direct laboratory masses in grams (e.g., 2.40 g C, 0.40 g H) or percentages—the mole-ratio algorithm handles arbitrary sample weights seamlessly.',
      },
    ],
    relatedSlugs: ['molar-mass-calculator', 'degree-of-unsaturation-ihd-calculator', 'ir-nmr-spectroscopy-lookup'],
  },
  {
    toolNumber: 20,
    slug: 'solution-concentration-converter',
    title: 'Solution Concentration Converter (Molarity, Molality, Normality, ppm)',
    shortTitle: 'Concentration Unit Converter',
    shortDescription:
      'Interconvert Molarity (M), Molality (m), Normality (N), Mass Percent (% w/w), Mole Fraction (χ), and ppm using solution density and molar mass.',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'M ↔ m ↔ N ↔ %w/w ↔ ppm',
    seoKeywords: ['molarity to molality converter', 'normality molarity calculator', 'mass percent to molarity density', 'ppm to molarity'],
    seoTitle: 'Free Solution Concentration Converter (M, m, N, %w/w, ppm) | University Tutors',
    seoDescription:
      'Convert between Molarity (M), Molality (m), Normality (N), % w/w, Mole Fraction, and ppm using solute molar mass and solution density.',
    path: '/tools/chemistry/solution-concentration-converter',
    viewKey: 'tools/chemistry/solution-concentration-converter',
    workedExample: {
      problem: 'Find the Molarity and Normality of 98.0% w/w H2SO4 (M = 98.079 g/mol, z = 2 H⁺, density d = 1.84 g/mL).',
      steps: [
        '1.00 L (1,000 mL) of solution has mass = 1,000 × 1.84 = 1,840 g, containing 0.98 × 1,840 = 1,803.2 g H2SO4.',
        'Molarity M = 1,803.2 g / 98.079 g/mol = 18.39 M.',
        'Normality N = M × z = 18.39 × 2 = 36.77 N.',
      ],
      answer: 'Molarity = 18.39 M · Normality = 36.77 N',
    },
    faqs: [
      {
        question: 'Why is molality (mol/kg solvent) preferred over molarity (mol/L) for colligative properties?',
        answer:
          'Liquid volume expands and contracts with temperature, altering Molarity, whereas mass in kilograms is temperature-invariant—essential for boiling-point elevation and freezing-point depression.',
      },
      {
        question: 'How is equivalence factor z determined for Normality (N = M × z)?',
        answer:
          'For acids, z equals ionizable protons (HCl = 1, H2SO4 = 2, H3PO4 = 3); for bases, z equals OH⁻ equivalents; for redox agents, z equals moles of electrons transferred.',
      },
      {
        question: 'When does 1 mg/L approximately equal 1 ppm?',
        answer:
          'In dilute aqueous solutions where solution density ≈ 1.00 g/mL (1.00 kg/L), 1 mg of solute per liter of solution equals 1 mg/kg = 1 part per million.',
      },
    ],
    relatedSlugs: ['ph-buffer-calculator', 'molar-mass-calculator', 'beer-lambert-calibration-plotter'],
  },
  {
    toolNumber: 21,
    slug: 'ph-buffer-calculator',
    title: 'pH, pOH, Ka/Kb & Henderson-Hasselbalch Buffer Calculator',
    shortTitle: 'pH & Henderson-Hasselbalch',
    shortDescription:
      'Solve strong/weak acid pH, ICE equilibrium [H₃O⁺], and Henderson-Hasselbalch conjugate acid-base buffer recipes at 25 °C.',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'pH = pKa + log([A⁻]/[HA])',
    seoKeywords: ['henderson hasselbalch calculator', 'ph poh ka calculator', 'weak acid ice table solver', 'buffer ph calculator'],
    seoTitle: 'Free pH, pOH, Ka & Henderson-Hasselbalch Buffer Calculator | University Tutors',
    seoDescription:
      'Calculate strong acid/base pH, exact quadratic weak-acid ICE equilibria, and Henderson-Hasselbalch buffer ratios ([A⁻]/[HA]) instantly.',
    path: '/tools/chemistry/ph-buffer-calculator',
    viewKey: 'tools/chemistry/ph-buffer-calculator',
    workedExample: {
      problem: 'Calculate the pH of an acetate buffer containing 0.15 M CH3COOH (pKa = 4.76) and 0.25 M CH3COONa.',
      steps: [
        'Identify conjugate base [A⁻] = 0.25 M and weak acid [HA] = 0.15 M.',
        'Apply Henderson-Hasselbalch: pH = 4.76 + log₁₀(0.25 / 0.15) = 4.76 + 0.2218 = 4.98.',
        'Compute pOH = 14.00 − 4.98 = 9.02.',
      ],
      answer: 'Buffer pH = 4.98 · pOH = 9.02 · Ratio [A⁻]/[HA] = 1.67',
    },
    faqs: [
      {
        question: 'Over what pH range does a weak acid / conjugate base pair provide effective buffering?',
        answer:
          'Within ±1.0 pH unit of the acid’s pKa (corresponding to [A⁻]/[HA] ratios between 0.1 and 10), with maximum buffer capacity precisely at pH = pKa.',
      },
      {
        question: 'When does the small-x approximation fail for weak acid ICE tables?',
        answer:
          'Whenever percent dissociation exceeds 5% (very dilute solutions or moderately strong Ka > 10⁻³); our calculator solves the exact quadratic root so it remains accurate at all concentrations.',
      },
      {
        question: 'How do Ka and Kb of a conjugate pair relate at 25 °C?',
        answer:
          'Ka × Kb = Kw = 1.0 × 10⁻¹⁴, or equivalently pKa + pKb = 14.00.',
      },
    ],
    relatedSlugs: ['acid-base-titration-plotter', 'solution-concentration-converter', 'nernst-electrochemistry-solver'],
  },
  {
    toolNumber: 22,
    slug: 'acid-base-titration-plotter',
    title: 'Acid-Base Titration Curve Plotter',
    shortTitle: 'Acid-Base Titration Plotter',
    shortDescription:
      'Plot strong-acid and weak-acid vs. strong-base pH titration curves, pinpoint half-equivalence (pH = pKa) and equivalence points, and match indicators.',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'V_eq = (CₐVₐ) / C_b',
    seoKeywords: ['titration curve plotter', 'equivalence point ph calculator', 'weak acid strong base titration', 'indicator selection chemistry'],
    seoTitle: 'Free Acid-Base Titration Curve Plotter & Equivalence Solver | University Tutors',
    seoDescription:
      'Generate interactive pH vs. titrant mL curves for strong and weak acids, calculate equivalence point pH, and choose optimal indicators.',
    path: '/tools/chemistry/acid-base-titration-plotter',
    viewKey: 'tools/chemistry/acid-base-titration-plotter',
    workedExample: {
      problem: 'Titrate 25.0 mL of 0.100 M CH3COOH (pKa = 4.76) with 0.100 M NaOH. Find V_eq and equivalence pH.',
      steps: [
        'Equivalence volume V_eq = (0.100 M × 25.0 mL) / 0.100 M = 25.0 mL (half-equivalence at 12.5 mL has pH = 4.76).',
        'At 25.0 mL, total volume = 50.0 mL of 0.050 M CH3COO⁻ (Kb = 10⁻⁹·²⁴ = 5.75 × 10⁻¹⁰).',
        '[OH⁻] = √(0.050 × 5.75 × 10⁻¹⁰) = 5.36 × 10⁻⁶ M → pOH = 5.27 → Equivalence pH = 8.73 (use Phenolphthalein).',
      ],
      answer: 'V_eq = 25.0 mL · Half-Equivalence pH = 4.76 · Equivalence pH = 8.73',
    },
    faqs: [
      {
        question: 'Why is the equivalence point of a weak acid + strong base titration above pH 7.00?',
        answer:
          'At complete neutralization, 100% of the weak acid has been converted into its basic conjugate anion (A⁻), which hydrolyzes water to produce OH⁻ ions.',
      },
      {
        question: 'Why is phenolphthalein better than methyl orange for weak-acid / strong-base titrations?',
        answer:
          'Phenolphthalein transitions between pH 8.2 and 10.0, overlapping the steep vertical jump around pH 8.7, whereas methyl orange changes prematurely in the acidic buffer region.',
      },
      {
        question: 'What special property occurs at exactly half the equivalence volume (0.5 × V_eq)?',
        answer:
          'Exactly half of HA has been neutralized into A⁻, making [HA] = [A⁻] so log(1) = 0 and measured solution pH equals pKa.',
      },
    ],
    relatedSlugs: ['ph-buffer-calculator', 'solution-concentration-converter', 'beer-lambert-calibration-plotter'],
  },
  {
    toolNumber: 23,
    slug: 'ideal-gas-law-solver',
    title: 'Ideal Gas Law (PV = nRT) & Combined Gas Law Solver',
    shortTitle: 'Ideal Gas Law (PV = nRT)',
    shortDescription:
      'Solve for Pressure, Volume, Moles, or Temperature across atm, kPa, bar, mmHg, L, mL, °C, and K, plus two-state Combined Gas Law transitions.',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'PV = nRT',
    seoKeywords: ['ideal gas law calculator', 'pv nrt solver', 'combined gas law calculator', 'stp molar volume'],
    seoTitle: 'Free Ideal Gas Law (PV = nRT) & Combined Gas Law Solver | University Tutors',
    seoDescription:
      'Solve PV = nRT for P, V, n, or T with automatic unit conversions (atm, kPa, mmHg, bar, L, °C, K) and Combined Gas Law P₁V₁/T₁ = P₂V₂/T₂.',
    path: '/tools/chemistry/ideal-gas-law-solver',
    viewKey: 'tools/chemistry/ideal-gas-law-solver',
    workedExample: {
      problem: 'What volume does 1.00 mol of an ideal gas occupy at 0.00 °C (273.15 K) and 1.00 atm?',
      steps: [
        'Use R = 0.082057 L·atm/(mol·K).',
        'Rearrange for V = nRT / P = (1.00 × 0.082057 × 273.15) / 1.00 = 22.414 L.',
        'Note: At modern IUPAC STP (1.00 bar = 0.9869 atm, 273.15 K), molar volume is 22.71 L.',
      ],
      answer: 'V = 22.41 L at 1 atm, 273.15 K',
    },
    faqs: [
      {
        question: 'Must gas law temperatures always be converted to Kelvin (K)?',
        answer:
          'Always! Celsius includes zero and negative values that break proportional gas volume ratios; our solver automatically converts °C + 273.15 = K.',
      },
      {
        question: 'Under what physical conditions do real gases deviate from PV = nRT?',
        answer:
          'At very high pressures (molecular finite volume b becomes significant) and very low temperatures (intermolecular attractions a reduce wall collisions), requiring the van der Waals equation.',
      },
      {
        question: 'Which value of R corresponds to SI units (kPa and L)?',
        answer:
          'R = 8.31446 L·kPa/(mol·K), which is numerically identical to 8.31446 J/(mol·K).',
      },
    ],
    relatedSlugs: ['thermochemistry-gibbs-calculator', 'limiting-reagent-yield-calculator', 'solution-concentration-converter'],
  },
  {
    toolNumber: 24,
    slug: 'thermochemistry-gibbs-calculator',
    title: 'Gibbs Free Energy (ΔG = ΔH − TΔS) & Calorimetry Calculator',
    shortTitle: 'Gibbs ΔG & Calorimetry',
    shortDescription:
      'Determine reaction spontaneity (ΔG), equilibrium constant K, crossover temperature (T = ΔH/ΔS), and coffee-cup calorimetry heat transfer (q = mcΔT).',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'ΔG = ΔH − TΔS',
    seoKeywords: ['gibbs free energy calculator', 'delta g delta h delta s', 'q mc delta t calorimetry', 'spontaneity crossover temperature'],
    seoTitle: 'Free Gibbs Free Energy (ΔG = ΔH − TΔS) & Calorimetry Solver | University Tutors',
    seoDescription:
      'Calculate ΔG in kJ/mol, thermodynamic equilibrium constant K, spontaneity temperature regimes, and specific heat calorimetry (q = mcΔT).',
    path: '/tools/chemistry/thermochemistry-gibbs-calculator',
    viewKey: 'tools/chemistry/thermochemistry-gibbs-calculator',
    workedExample: {
      problem: 'For the Haber synthesis N2 + 3H2 → 2NH3, ΔH° = −92.2 kJ/mol and ΔS° = −198.8 J/(mol·K). Find ΔG° at 298.15 K.',
      steps: [
        'Convert ΔS° from J/(mol·K) to kJ/(mol·K) to match ΔH° units: −198.8 / 1000 = −0.1988 kJ/(mol·K).',
        'Apply ΔG° = −92.2 − (298.15)(−0.1988) = −92.2 + 59.27 = −32.93 kJ/mol (Spontaneous at 298 K).',
        'Crossover temperature T_eq = ΔH° / ΔS° = −92.2 / −0.1988 = 463.8 K (190.6 °C).',
      ],
      answer: 'ΔG° = −32.93 kJ/mol (Exergonic / Spontaneous below 463.8 K)',
    },
    faqs: [
      {
        question: 'What is the #1 unit mistake students make in ΔG = ΔH − TΔS?',
        answer:
          'Tables report ΔH° in kilojoules (kJ/mol) and ΔS° in joules (J/mol·K)! Failing to divide ΔS° by 1,000 inflates the entropy term 1,000-fold.',
      },
      {
        question: 'When is a chemical reaction spontaneous at ALL temperatures?',
        answer:
          'When ΔH < 0 (exothermic) and ΔS > 0 (entropy increases), making ΔG = ΔH − TΔS strictly negative at every positive Kelvin temperature.',
      },
      {
        question: 'How does ΔG° relate to the thermodynamic equilibrium constant K?',
        answer:
          'ΔG° = −RT ln(K), so K = exp(−ΔG° / RT); when ΔG° < 0, K > 1 (products favored at equilibrium).',
      },
    ],
    relatedSlugs: ['nernst-electrochemistry-solver', 'ideal-gas-law-solver', 'ph-buffer-calculator'],
  },
  {
    toolNumber: 25,
    slug: 'nernst-electrochemistry-solver',
    title: 'Nernst Equation & Galvanic Cell Potential (E°cell) Solver',
    shortTitle: 'Nernst & Cell Potential (E°)',
    shortDescription:
      'Compute standard galvanic cell EMF (E°cell = E°cathode − E°anode), non-standard Nernst potential E_cell, ΔG° = −nFE°, and redox K.',
    category: 'Chemistry',
    subCategory: 'Solutions, Acids & Thermodynamics',
    formulaBadge: 'E = E° − (RT/nF) ln Q',
    seoKeywords: ['nernst equation calculator', 'galvanic cell potential calculator', 'standard reduction potential e cell', 'delta g nfe electrochemistry'],
    seoTitle: 'Free Nernst Equation & Galvanic Cell Potential Solver | University Tutors',
    seoDescription:
      'Calculate E°cell, non-standard Nernst cell voltage, free energy (ΔG° = −nFE°), and equilibrium constant K for Daniell and electrochemical cells.',
    path: '/tools/chemistry/nernst-electrochemistry-solver',
    viewKey: 'tools/chemistry/nernst-electrochemistry-solver',
    workedExample: {
      problem: 'In a Cu/Zn Daniell cell at 25 °C (E°Cu²⁺/Cu = +0.34 V, E°Zn²⁺/Zn = −0.76 V, n = 2), find E_cell when [Zn²⁺] = 0.010 M and [Cu²⁺] = 1.0 M.',
      steps: [
        'E°cell = E°cathode − E°anode = +0.34 − (−0.76) = +1.100 V.',
        'Reaction quotient Q = [Zn²⁺] / [Cu²⁺] = 0.010 / 1.0 = 0.010.',
        'Apply Nernst at 298.15 K: E = 1.100 − (0.05916 / 2) log₁₀(0.010) = 1.100 − 0.02958(−2) = +1.159 V.',
      ],
      answer: 'E°cell = +1.100 V · Non-Standard E_cell = +1.159 V · ΔG° = −212.3 kJ/mol',
    },
    faqs: [
      {
        question: 'Do you multiply standard reduction potentials (E°) by stoichiometric coefficients?',
        answer:
          'Never! Voltage (J/C) is an intensive property independent of sample size—multiplying a half-reaction doubles both joules and coulombs, leaving E° unchanged.',
      },
      {
        question: 'Which electrode is oxidized and which is reduced in any electrochemical cell?',
        answer:
          '“AN OX and RED CAT”: Oxidation always occurs at the Anode, and Reduction always occurs at the Cathode (in both galvanic and electrolytic cells).',
      },
      {
        question: 'What is the voltage of any battery once it reaches chemical equilibrium (Q = K)?',
        answer:
          'Exactly 0.00 V (a “dead” battery), because ΔG = 0 when Q = K.',
      },
    ],
    relatedSlugs: ['thermochemistry-gibbs-calculator', 'ph-buffer-calculator', 'chemical-equation-balancer'],
  },
  {
    toolNumber: 26,
    slug: 'vsepr-molecular-geometry-visualizer',
    title: '3D VSEPR Molecular Geometry & Hybridization Visualizer',
    shortTitle: 'VSEPR Geometry & Hybridization',
    shortDescription:
      'Enter bonding domains and lone pairs (AX₂ to AX₆) to inspect 3D VSEPR SVG geometry, sp/sp²/sp³/sp³d/sp³d² hybridization, and ideal bond angles.',
    category: 'Chemistry',
    subCategory: 'Organic & Analytical Chemistry',
    formulaBadge: 'Steric # → sp³ / Bond Angle',
    seoKeywords: ['vsepr molecular geometry calculator', 'steric number hybridization', 'bond angle axe notation', 'electron vs molecular geometry'],
    seoTitle: 'Free VSEPR Molecular Geometry, Bond Angle & Hybridization Tool | University Tutors',
    seoDescription:
      'Determine electron domain geometry, molecular shape, orbital hybridization, and bond angles for AX₂ through AX₆E₂ molecules with interactive diagrams.',
    path: '/tools/chemistry/vsepr-molecular-geometry-visualizer',
    viewKey: 'tools/chemistry/vsepr-molecular-geometry-visualizer',
    workedExample: {
      problem: 'Determine the electron geometry, molecular shape, hybridization, and H–O–H bond angle of Water (H2O).',
      steps: [
        'Oxygen (6 valence e⁻) forms 2 O–H single bonds (2 bonding domains) and retains 2 lone pairs → AX₂E₂ (Steric Number = 4).',
        'Steric Number 4 corresponds to Tetrahedral electron geometry and sp³ orbital hybridization.',
        'Two non-bonding lone pairs compress the ideal 109.5° tetrahedral angle down to ~104.5° (Bent / Angular shape).',
      ],
      answer: 'AX₂E₂ · Electron: Tetrahedral (sp³) · Molecular: Bent (~104.5°)',
    },
    faqs: [
      {
        question: 'Do double and triple bonds count as multiple steric domains in VSEPR theory?',
        answer:
          'No—a double bond or triple bond occupies a single directional region of electron density and counts as just 1 bonding domain toward the steric number.',
      },
      {
        question: 'Why do lone pairs compress adjacent bond angles (LP–LP > LP–BP > BP–BP)?',
        answer:
          'Lone pairs are held by only one nucleus rather than shared between two, spreading closer to the central atom and exerting stronger electrostatic repulsion.',
      },
      {
        question: 'Where do lone pairs sit in Trigonal Bipyramidal (Steric Number 5) molecules like SF4 and XeF2?',
        answer:
          'Lone pairs always occupy equatorial positions first to minimize harsh 90° axial-equatorial interactions, yielding Seesaw (AX4E), T-shaped (AX3E2), and Linear (AX2E3) geometries.',
      },
    ],
    relatedSlugs: ['degree-of-unsaturation-ihd-calculator', 'interactive-periodic-table', 'ir-nmr-spectroscopy-lookup'],
  },
  {
    toolNumber: 27,
    slug: 'degree-of-unsaturation-ihd-calculator',
    title: 'Degree of Unsaturation (IHD) & Organic Formula Analyzer',
    shortTitle: 'Degree of Unsaturation (IHD)',
    shortDescription:
      'Compute Index of Hydrogen Deficiency (IHD / DoU) from C, H, N, O, and Halogens to count rings + π bonds for organic structure elucidation.',
    category: 'Chemistry',
    subCategory: 'Organic & Analytical Chemistry',
    formulaBadge: 'IHD = ½(2C + 2 + N − H − X)',
    seoKeywords: ['degree of unsaturation calculator', 'index of hydrogen deficiency ihd', 'rings plus double bonds calculator', 'organic chemistry formula analyzer'],
    seoTitle: 'Free Degree of Unsaturation (IHD) Calculator for Organic Chemistry | University Tutors',
    seoDescription:
      'Calculate the Index of Hydrogen Deficiency (IHD / DoU) from C, H, N, O, and Halogens and view candidate ring/π-bond structural interpretations.',
    path: '/tools/chemistry/degree-of-unsaturation-ihd-calculator',
    viewKey: 'tools/chemistry/degree-of-unsaturation-ihd-calculator',
    workedExample: {
      problem: 'Calculate the Index of Hydrogen Deficiency (IHD) of Benzamide (C7H7NO) and interpret the structure.',
      steps: [
        'Substitute C = 7, H = 7, N = 1, O = 1 (Oxygen does not enter the formula), X = 0.',
        'IHD = ½[2(7) + 2 + 1 − 7 − 0] = ½(10) = 5.0 degrees of unsaturation.',
        'An IHD ≥ 4 strongly suggests a benzene ring (1 ring + 3 π bonds = 4 IHD) plus 1 carbonyl C=O π bond = 5 total.',
      ],
      answer: 'IHD = 5 (Consistent with 1 Benzene Ring [4] + 1 Amide C=O [1])',
    },
    faqs: [
      {
        question: 'Why is Oxygen (O) or Sulfur (S) ignored in the IHD equation?',
        answer:
          'Inserting a divalent oxygen atom into a C–H or C–C single bond (forming an alcohol or ether) neither adds nor removes required hydrogens for saturation.',
      },
      {
        question: 'Why does Nitrogen (+N) add 1 while Halogens (−X) subtract 1 inside the parentheses?',
        answer:
          'Trivalent nitrogen brings one extra valence slot compared to CH2, requiring +1 H for saturation, whereas monovalent F/Cl/Br/I replaces a hydrogen atom directly.',
      },
      {
        question: 'What structural clue does IHD ≥ 4 immediately give on an spectroscopy exam?',
        answer:
          'Always check 1H NMR around 7.0–8.0 ppm for an aromatic phenyl/benzene ring, which accounts for 4 degrees of unsaturation all at once.',
      },
    ],
    relatedSlugs: ['ir-nmr-spectroscopy-lookup', 'empirical-molecular-formula-finder', 'vsepr-molecular-geometry-visualizer'],
  },
  {
    toolNumber: 28,
    slug: 'ir-nmr-spectroscopy-lookup',
    title: 'IR & NMR Spectroscopy Peak Lookup Table',
    shortTitle: 'IR & NMR Peak Lookup',
    shortDescription:
      'Searchable organic spectroscopy reference & peak matcher for IR wavenumbers (cm⁻¹), ¹H NMR chemical shifts (δ ppm), and ¹³C NMR functional groups.',
    category: 'Chemistry',
    subCategory: 'Organic & Analytical Chemistry',
    formulaBadge: 'cm⁻¹ · ¹H δ (ppm) · ¹³C δ',
    seoKeywords: ['ir spectroscopy peak table', '1h nmr chemical shift lookup', '13c nmr table organic chemistry', 'carbonyl ir stretch'],
    seoTitle: 'Free IR, ¹H NMR & ¹³C NMR Spectroscopy Peak Lookup Tool | University Tutors',
    seoDescription:
      'Filterable IR wavenumber (cm⁻¹), ¹H NMR, and ¹³C NMR chemical shift reference table for rapid organic spectroscopy structure elucidation.',
    path: '/tools/chemistry/ir-nmr-spectroscopy-lookup',
    viewKey: 'tools/chemistry/ir-nmr-spectroscopy-lookup',
    workedExample: {
      problem: 'An unknown C4H8O2 compound shows a strong sharp IR band at 1740 cm⁻¹ (no broad O–H around 3300 cm⁻¹) and a ¹H NMR quartet at δ 4.12 ppm.',
      steps: [
        'IR at 1740 cm⁻¹ without broad 2500–3300 cm⁻¹ O–H stretch rules out carboxylic acid and points to a saturated Ester (C=O + C–O at ~1200 cm⁻¹).',
        '¹H NMR 2H quartet at δ 4.12 ppm (coupled to 3H triplet at δ 1.25 ppm) identifies an –OCH2CH3 ethoxy group directly attached to ester oxygen.',
        'Remaining 3H singlet at δ 2.04 ppm is CH3(C=O)–, confirming Ethyl Acetate (CH3COOCH2CH3).',
      ],
      answer: 'Ethyl Acetate (Ester C=O at 1740 cm⁻¹, –OCH₂– quartet at δ 4.12 ppm)',
    },
    faqs: [
      {
        question: 'How do you quickly distinguish an Alcohol O–H from a Carboxylic Acid O–H in IR?',
        answer:
          'Alcohol O–H produces a smooth, rounded tongue-shaped band around 3200–3550 cm⁻¹, whereas a Carboxylic Acid O–H forms a massive, ragged “hairy beard” spanning 2500–3300 cm⁻¹ paired with C=O ~1710 cm⁻¹.',
      },
      {
        question: 'What causes splitting multiplicity (singlet, doublet, triplet, quartet) in ¹H NMR?',
        answer:
          'By the n + 1 rule, a set of equivalent protons coupled to n equivalent neighboring vicinal protons splits into n + 1 sub-peaks with Pascal’s triangle intensities.',
      },
      {
        question: 'Why does conjugation lower a carbonyl C=O IR stretching frequency?',
        answer:
          'Resonance delocalization with an adjacent C=C or aryl ring gives the C=O bond partial single-bond character, lowering bond force constant k and shifting ν̄ down by ~20–30 cm⁻¹.',
      },
    ],
    relatedSlugs: ['degree-of-unsaturation-ihd-calculator', 'beer-lambert-calibration-plotter', 'empirical-molecular-formula-finder'],
  },
  {
    toolNumber: 29,
    slug: 'beer-lambert-calibration-plotter',
    title: 'Beer-Lambert Law (A = εlc) & Calibration Curve Plotter',
    shortTitle: 'Beer-Lambert & UV-Vis Curve',
    shortDescription:
      'Solve UV-Vis spectrophotometry Absorbance / Transmittance (A = εlc = −log₁₀T) and fit linear least-squares calibration standards (R²) to find unknown concentrations.',
    category: 'Chemistry',
    subCategory: 'Organic & Analytical Chemistry',
    formulaBadge: 'A = ε · l · c',
    seoKeywords: ['beer lambert law calculator', 'calibration curve concentration solver', 'absorbance to transmittance', 'uv vis spectrophotometry r2'],
    seoTitle: 'Free Beer-Lambert Law (A = εlc) & Calibration Curve Plotter | University Tutors',
    seoDescription:
      'Calculate UV-Vis absorbance, % transmittance, molar absorptivity (ε), and plot linear calibration curves (y = mx + b, R²) to solve unknown samples.',
    path: '/tools/chemistry/beer-lambert-calibration-plotter',
    viewKey: 'tools/chemistry/beer-lambert-calibration-plotter',
    workedExample: {
      problem: 'NADH has ε₃₄₀ = 6,220 M⁻¹cm⁻¹. If a 1.00 cm cuvette reads Absorbance A = 0.466, find NADH concentration in µM and % Transmittance.',
      steps: [
        'Solve c = A / (ε · l) = 0.466 / (6,220 M⁻¹cm⁻¹ × 1.00 cm) = 7.492 × 10⁻⁵ M = 74.9 µM.',
        'Compute Transmittance T = 10⁻ᴬ = 10⁻⁰·⁴⁶⁶ = 0.3420 → 34.2% Transmittance.',
        'Verify linear dynamic range: A = 0.466 sits cleanly inside the optimal 0.1–1.0 AU spectrophotometric window.',
      ],
      answer: 'Concentration = 74.9 µM · % Transmittance = 34.2%',
    },
    faqs: [
      {
        question: 'Why do Beer-Lambert calibration curves lose linearity when Absorbance exceeds ~1.5–2.0?',
        answer:
          'At A = 2.0, 99% of incident light is absorbed (only 1% reaches the detector), so stray light, refractive index shifts, and solute dimerization cause flattening.',
      },
      {
        question: 'Why must you blank the spectrophotometer with pure buffer/solvent before measuring?',
        answer:
          'Blanking zeroes out cuvette wall reflections and background solvent absorption so the recorded absorbance reflects only your analyte chromophore.',
      },
      {
        question: 'What R² value is expected for an analytical chemistry UV-Vis standard curve?',
        answer:
          'Carefully pipetted serial standards typically achieve R² ≥ 0.995; lower R² points to pipetting error or an unblanked cuvette.',
      },
    ],
    relatedSlugs: ['solution-concentration-converter', 'acid-base-titration-plotter', 'ir-nmr-spectroscopy-lookup'],
  },
  {
    toolNumber: 30,
    slug: 'radioactive-decay-halflife-calculator',
    title: 'Radioactive Decay & Half-Life Calculator',
    shortTitle: 'Radioactive Decay & Half-Life',
    shortDescription:
      'Solve first-order nuclear decay kinetics N(t) = N₀(½)^(t/t₁/₂), decay constant λ, remaining isotope fraction, and Radiocarbon (¹⁴C) / medical isotope presets.',
    category: 'Chemistry',
    subCategory: 'General & Stoichiometry',
    formulaBadge: 'N(t) = N₀ · e^(−λt)',
    seoKeywords: ['half life calculator chemistry', 'radioactive decay calculator', 'carbon 14 dating calculator', 'first order decay constant lambda'],
    seoTitle: 'Free Radioactive Decay & Half-Life Calculator (¹⁴C, ¹³¹I, ³²P) | University Tutors',
    seoDescription:
      'Calculate remaining mass/activity N(t), elapsed time t, half-life t₁/₂, and decay constant λ with presets for Carbon-14, Phosphorus-32, and Iodine-131.',
    path: '/tools/chemistry/radioactive-decay-halflife-calculator',
    viewKey: 'tools/chemistry/radioactive-decay-halflife-calculator',
    workedExample: {
      problem: 'Phosphorus-32 (³²P, t₁/₂ = 14.29 days) is used to radiolabel DNA probes. How much of a 120 µCi stock remains after 35.0 days?',
      steps: [
        'Calculate decay constant λ = ln(2) / 14.29 d = 0.04851 d⁻¹.',
        'Compute number of half-lives elapsed: 35.0 / 14.29 = 2.449 half-lives.',
        'Remaining activity N(t) = 120 × (0.5)²·⁴⁴⁹ = 21.96 µCi (18.3% remaining).',
      ],
      answer: 'Remaining Activity = 21.96 µCi (18.30% after 2.45 half-lives)',
    },
    faqs: [
      {
        question: 'Does temperature, pressure, or chemical bonding alter an isotope’s nuclear half-life?',
        answer:
          'No—nuclear decay originates inside the atomic nucleus and follows strict first-order kinetics completely independent of temperature or chemical state.',
      },
      {
        question: 'What is the maximum age limit for Radiocarbon (¹⁴C, t₁/₂ = 5,730 yr) dating?',
        answer:
          'Approximately 50,000–60,000 years (~9–10 half-lives), beyond which less than 0.1% of original ¹⁴C remains above background.',
      },
      {
        question: 'How does decay constant λ relate to mean lifetime τ?',
        answer:
          'Mean lifetime τ = 1 / λ = t₁/₂ / ln(2) ≈ 1.443 × t₁/₂.',
      },
    ],
    relatedSlugs: ['interactive-periodic-table', 'thermochemistry-gibbs-calculator', 'molar-mass-calculator'],
  },
];

export const BIOLOGY_TOOLS: ScienceToolItem[] = SCIENCE_TOOLS_REGISTRY.filter(
  (t) => t.category === 'Biology'
);

export const CHEMISTRY_TOOLS: ScienceToolItem[] = SCIENCE_TOOLS_REGISTRY.filter(
  (t) => t.category === 'Chemistry'
);

export const SCIENCE_TOOLS_BY_SLUG: Record<ScienceToolSlug, ScienceToolItem> =
  SCIENCE_TOOLS_REGISTRY.reduce((acc, item) => {
    acc[item.slug] = item;
    return acc;
  }, {} as Record<ScienceToolSlug, ScienceToolItem>);

export type ResolvedScienceRoute =
  | { kind: 'hub'; category: ScienceCategory }
  | { kind: 'tool'; tool: ScienceToolItem };

export function resolveScienceRoute(input: string): ResolvedScienceRoute | null {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^#/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .split('#')[0];

  if (cleaned === 'tools/biology') {
    return { kind: 'hub', category: 'Biology' };
  }
  if (cleaned === 'tools/chemistry') {
    return { kind: 'hub', category: 'Chemistry' };
  }

  if (cleaned.startsWith('tools/biology/')) {
    const slug = cleaned.slice('tools/biology/'.length) as ScienceToolSlug;
    const found = SCIENCE_TOOLS_BY_SLUG[slug];
    if (found && found.category === 'Biology') {
      return { kind: 'tool', tool: found };
    }
  }

  if (cleaned.startsWith('tools/chemistry/')) {
    const slug = cleaned.slice('tools/chemistry/'.length) as ScienceToolSlug;
    const found = SCIENCE_TOOLS_BY_SLUG[slug];
    if (found && found.category === 'Chemistry') {
      return { kind: 'tool', tool: found };
    }
  }

  return null;
}
