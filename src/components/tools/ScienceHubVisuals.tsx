import React, { useId } from 'react';
import type {
  ScienceCategory,
  ScienceSubCategory,
  ScienceToolSlug,
} from '../../data/scienceToolsRegistry';

// ============================================================================
// 1. SUBJECT-SPECIFIC CATEGORY ICON SVGs (Biology & Chemistry Hubs + ToolsHub)
// ============================================================================
export function ScienceCategoryIcon({
  category,
  subCategory = 'All',
  className = 'w-6 h-6',
}: {
  category: ScienceCategory;
  subCategory?: 'All' | ScienceSubCategory;
  className?: string;
}) {
  if (category === 'Biology') {
    switch (subCategory) {
      case 'Genetics & Molecular Biology':
        return (
          <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M8 4c0 6 12 6 12 10s-12 4-12 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M20 4c0 6-12 6-12 10s12 4 12 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.65" />
            <path d="M9.5 7h9M11.5 11h5M11.5 17h5M9.5 21h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 'Cell Biology & Lab Prep':
        return (
          <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="9.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
            <circle cx="13" cy="13.5" r="3.8" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="18.5" cy="18" rx="2.6" ry="1.4" transform="rotate(-28 18.5 18)" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'Ecology, Botany & Physiology':
        return (
          <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M21.5 6.5C13 6.5 7 11.5 7 19.5c6.5 0 12.5-3.5 14.5-13Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6.5 22.5C10 18.5 14 15 19.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'All':
      default:
        return (
          <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="23" height="23" rx="6" fill="currentColor" fillOpacity="0.12" />
            <path d="M9 5.5c0 5 10 5 10 8.5S9 17.5 9 22.5M19 5.5c0 5-10 5-10 8.5s10 3.5 10 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.5 8.5h7M10.5 19.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
    }
  }

  // Chemistry Category Icons
  switch (subCategory) {
    case 'General & Stoichiometry':
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M11 4.5h6M12 4.5v5.8L6.5 20.5A2 2 0 0 0 8.2 23.5h11.6a2 2 0 0 0 1.7-3L16 10.3V4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.4 17.5h11.2l1.9 3.2A1.8 1.8 0 0 1 19.9 23H8.1a1.8 1.8 0 0 1-1.6-2.3l1.9-3.2Z" fill="currentColor" fillOpacity="0.24" />
        </svg>
      );
    case 'Solutions, Acids & Thermodynamics':
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M4.5 21.5h19M4.5 6.5v15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M6.5 18.5c5 0 6.5-1.2 8-4.5s2.8-6 7.5-6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
          <circle cx="14.5" cy="14" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'Organic & Analytical Chemistry':
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <polygon points="14,4.5 22,9 22,19 14,23.5 6,19 6,9" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2" />
        </svg>
      );
    case 'All':
    default:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="2.6" fill="currentColor" />
          <ellipse cx="14" cy="14" rx="10.5" ry="4.2" transform="rotate(32 14 14)" stroke="currentColor" strokeWidth="1.8" />
          <ellipse cx="14" cy="14" rx="10.5" ry="4.2" transform="rotate(-32 14 14)" stroke="currentColor" strokeWidth="1.8" />
          <ellipse cx="14" cy="14" rx="10.5" ry="4.2" transform="rotate(90 14 14)" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.55" />
        </svg>
      );
  }
}

// ============================================================================
// 2. TOOL METADATA (Use Case, Popularity, & Quick Preview Samples for all 30)
// ============================================================================
export interface ScienceToolVisualMeta {
  useCase: string;
  popular: boolean;
  sampleInput: string;
  sampleOutput: string;
}

export const SCIENCE_TOOL_VISUAL_META: Record<ScienceToolSlug, ScienceToolVisualMeta> = {
  // 14 Biology Tools
  'punnett-square-calculator': {
    useCase: 'Monohybrid (2×2), Dihybrid (4×4) & Eye Color crosses',
    popular: true,
    sampleInput: 'AaBb × AaBb (Dihybrid Cross)',
    sampleOutput: 'Phenotype 9:3:3:1 · 16 Genotypes (PDF Grid)',
  },
  'dna-rna-protein-translator': {
    useCase: 'Transcribe 5′→3′ DNA, mRNA codons & polypeptides',
    popular: true,
    sampleInput: '5′-ATGGTGCATCTGACTCCTGAGGAG-3′',
    sampleOutput: '5′-AUG GUG CAU CUG ACU CCU GAG GAG-3′ → MVHLTPEE',
  },
  'pcr-master-mix-calculator': {
    useCase: 'Scale PCR tubes + 10% overage & primer Tm / Ta',
    popular: true,
    sampleInput: '8 rxns × 25 µL (+10%) · 50% GC Primer (20 nt)',
    sampleOutput: 'Multiplier = 8.8× · Wallace Tm = 60.0 °C (Ta = 55 °C)',
  },
  'hardy-weinberg-calculator': {
    useCase: 'Allele frequencies (p, q) & Chi-square (df = 1)',
    popular: false,
    sampleInput: 'AA = 320, Aa = 160, aa = 20 (N = 500)',
    sampleOutput: 'p = 0.80, q = 0.20 · χ² = 0.000 (In Equilibrium)',
  },
  'restriction-digest-gel-simulator': {
    useCase: 'EcoRI/BamHI plasmid cuts & agarose ladder bands',
    popular: false,
    sampleInput: '3,000 bp Circular Plasmid · EcoRI @ 450 & 1,650 bp',
    sampleOutput: '2 Gel Bands: 1,800 bp & 1,200 bp',
  },
  'crispr-grna-finder': {
    useCase: 'SpCas9 5′-NGG-3′ PAM scanning & off-target checks',
    popular: false,
    sampleInput: '5′-GCATGCTAGCTAGCTGATCGAGGCT-3′',
    sampleOutput: 'Spacer: GCATGCTAGCTAGCTGATCG · PAM: AGG (55% GC)',
  },
  'serial-dilution-molarity-calculator': {
    useCase: 'C₁V₁ = C₂V₂ stock dilutions & 10-fold serial racks',
    popular: true,
    sampleInput: 'C₁ = 10 mM stock → V₂ = 50 mL @ C₂ = 25 µM',
    sampleOutput: 'Pipette V₁ = 125.0 µL stock + 49.875 mL buffer',
  },
  'cell-growth-cfu-calculator': {
    useCase: 'Exponential doubling time (g), μ & plate CFU/mL',
    popular: false,
    sampleInput: 'N₀ = 1×10⁴ → Nₜ = 6.4×10⁵ in 180 min',
    sampleOutput: 'n = 6.00 generations · Doubling Time g = 30.0 min',
  },
  'microscope-fov-calculator': {
    useCase: 'Total magnification, FOV diameter (µm) & cell size',
    popular: false,
    sampleInput: '10× Ocular (FN 20) · 40× Objective · 8 cells across',
    sampleOutput: '400× Mag · FOV = 500 µm · Cell Length ≈ 62.5 µm',
  },
  'interactive-cell-explorer': {
    useCase: 'Eukaryotic vs Prokaryotic vs Plant organelle atlas',
    popular: false,
    sampleInput: 'Compare Plant vs Animal vs Prokaryotic Cell',
    sampleOutput: 'Chloroplasts & 90% Central Vacuole unique to Plantae',
  },
  'biodiversity-index-calculator': {
    useCase: 'Shannon-Wiener (H′), Evenness (J′) & Simpson (1−D)',
    popular: false,
    sampleInput: 'Species counts: [45, 30, 15, 10] (N = 100, S = 4)',
    sampleOutput: 'Shannon H′ = 1.224 · Simpson 1−D = 0.675',
  },
  'water-potential-osmolarity-calculator': {
    useCase: 'Plant turgor Ψ = Ψs + Ψp & van ’t Hoff solute potential',
    popular: false,
    sampleInput: '0.20 M Sucrose (i = 1) @ 22 °C · Ψp = +0.25 MPa',
    sampleOutput: 'Ψs = −0.491 MPa → Net Water Potential Ψ = −0.241 MPa',
  },
  'human-physiology-calculators': {
    useCase: 'MAP, Cardiac Output, Alveolar pO₂ & Nernst Resting Vm',
    popular: false,
    sampleInput: 'BP = 120/80 mmHg · HR = 72 bpm · SV = 70 mL',
    sampleOutput: 'MAP = 93.3 mmHg · Cardiac Output = 5.04 L/min',
  },
  'taxonomic-dichotomous-key-builder': {
    useCase: 'Interactive kingdom/phylum identification & key builder',
    popular: false,
    sampleInput: 'Eukaryotic · Chitin Cell Wall · Heterotrophic',
    sampleOutput: 'Kingdom Fungi (e.g., Saccharomyces, Agaricus)',
  },

  // 16 Chemistry Tools
  'interactive-periodic-table': {
    useCase: 'Electron configurations, Pauling EN & oxidation states',
    popular: true,
    sampleInput: 'Copper (Cu, Z = 29)',
    sampleOutput: '[Ar] 3d¹⁰ 4s¹ · 63.546 g/mol · EN = 1.90',
  },
  'molar-mass-calculator': {
    useCase: 'IUPAC hydrates (CuSO4*5H2O), mass% & mole conversion',
    popular: true,
    sampleInput: 'Ca(OH)2 (18.52 g)',
    sampleOutput: 'M = 74.093 g/mol · n = 0.2500 mol',
  },
  'chemical-equation-balancer': {
    useCase: 'Nullspace linear algebra balancer for redox & combustion',
    popular: true,
    sampleInput: 'FeS2 + O2 -> Fe2O3 + SO2',
    sampleOutput: '4 FeS₂ + 11 O₂ → 2 Fe₂O₃ + 8 SO₂',
  },
  'limiting-reagent-yield-calculator': {
    useCase: 'Limiting reactant, leftover excess mass & % yield',
    popular: true,
    sampleInput: 'N2 + 3 H2 → 2 NH3 (28 g N2, 8 g H2)',
    sampleOutput: 'Limiting: N₂ · Theoretical = 34.06 g NH₃',
  },
  'empirical-molecular-formula-finder': {
    useCase: 'Mass % / combustion grams → empirical & true formula',
    popular: false,
    sampleInput: '40.0% C, 6.71% H, 53.29% O · M = 180.16',
    sampleOutput: 'Empirical: CH₂O (n = 6) → Molecular: C₆H₁₂O₆',
  },
  'solution-concentration-converter': {
    useCase: 'Convert Molarity (M), Molality (m), Normality & % w/w',
    popular: false,
    sampleInput: '2.0 M NaCl (MM = 58.44, ρ = 1.08 g/mL)',
    sampleOutput: 'm = 2.077 mol/kg · 10.82% w/w · 2.00 N',
  },
  'ph-buffer-calculator': {
    useCase: 'Henderson-Hasselbalch buffer pH, pOH & [H₃O⁺] ratio',
    popular: true,
    sampleInput: 'Acetate: pKa = 4.76, [HA] = 0.10 M, [A⁻] = 0.15 M',
    sampleOutput: 'pH = 4.94 · pOH = 9.06 (Effective: 3.76–5.76)',
  },
  'acid-base-titration-plotter': {
    useCase: 'Weak acid vs NaOH pH curves, ½Veq & equivalence pH',
    popular: false,
    sampleInput: '25 mL of 0.10 M CH3COOH (pKa 4.76) + 0.10 M NaOH',
    sampleOutput: 'Veq = 25.00 mL · pH_eq = 8.72 · Half-Eq pH = 4.76',
  },
  'ideal-gas-law-solver': {
    useCase: 'Solve PV = nRT for P, V, n, or T across atm, kPa & K',
    popular: false,
    sampleInput: 'V = 10.0 L, n = 2.5 mol, T = 298.15 K',
    sampleOutput: 'P = 6.116 atm (619.7 kPa)',
  },
  'thermochemistry-gibbs-calculator': {
    useCase: 'Spontaneity ΔG = ΔH − TΔS, Keq & crossover T(ΔG=0)',
    popular: false,
    sampleInput: 'ΔH° = −92.2 kJ, ΔS° = −198.7 J/K, T = 298.15 K',
    sampleOutput: 'ΔG° = −32.96 kJ/mol · T_cross = 464.0 K',
  },
  'nernst-electrochemistry-solver': {
    useCase: 'Galvanic E°cell, Nernst voltage E(Q) & ΔG = −nFE',
    popular: false,
    sampleInput: 'Daniell Cell: E°c=+0.34, E°a=−0.76, n=2, Q=0.01',
    sampleOutput: 'E°cell = +1.100 V · Ecell = +1.159 V',
  },
  'vsepr-molecular-geometry-visualizer': {
    useCase: 'Interactive 3D WebGL VSEPR shapes, angles & 2D wedge-dash',
    popular: true,
    sampleInput: 'AX₃E (3 Bonds, 1 Lone Pair — NH₃)',
    sampleOutput: 'Trigonal Pyramidal · sp³ · Bond Angle 107.0°',
  },
  'degree-of-unsaturation-ihd-calculator': {
    useCase: 'Count rings + π bonds for organic structure elucidation',
    popular: false,
    sampleInput: 'Acetaminophen C8H9NO2',
    sampleOutput: 'IHD = 5 (1 Benzene Ring [4] + 1 Carbonyl C=O [1])',
  },
  'ir-nmr-spectroscopy-lookup': {
    useCase: 'Search IR cm⁻¹, ¹H NMR δ ppm & ¹³C NMR shifts',
    popular: false,
    sampleInput: 'Strong IR 1740 cm⁻¹ + ¹H Quartet δ 4.12 ppm',
    sampleOutput: 'Ester C=O + –OCH₂– (Ethyl Acetate Motif)',
  },
  'beer-lambert-calibration-plotter': {
    useCase: 'UV-Vis standard line regression (R²) & unknown Conc',
    popular: false,
    sampleInput: 'Standards 2–10 µM (slope 0.0709) · Unknown A = 0.375',
    sampleOutput: 'Unknown Conc = 5.29 units · R² = 0.9999',
  },
  'radioactive-decay-halflife-calculator': {
    useCase: 'First-order decay N(t) = N₀(½)^(t/t₁/₂), λ & ¹⁴C dating',
    popular: false,
    sampleInput: '³²P (t₁/₂ = 14.29 d) · N₀ = 120 µCi @ t = 35 d',
    sampleOutput: 'N(t) = 21.96 µCi (18.30% · 2.45 half-lives)',
  },
};

// ============================================================================
// 3. FORMULA BADGE COMPONENT
// ============================================================================
export function ScienceFormulaGraphic({
  slug,
  fallbackBadge,
}: {
  slug: ScienceToolSlug;
  fallbackBadge: string;
}) {
  const paletteMap: Partial<Record<ScienceToolSlug, { bg: string; stroke: string }>> = {
    'punnett-square-calculator': { bg: '#FFF7ED', stroke: '#EA580C' },
    'dna-rna-protein-translator': { bg: '#ECFDF5', stroke: '#059669' },
    'pcr-master-mix-calculator': { bg: '#EFF6FF', stroke: '#2563EB' },
    'interactive-periodic-table': { bg: '#FFF7ED', stroke: '#EA580C' },
    'molar-mass-calculator': { bg: '#ECFDF5', stroke: '#059669' },
    'ph-buffer-calculator': { bg: '#F0F9FF', stroke: '#0284C7' },
    'vsepr-molecular-geometry-visualizer': { bg: '#F5F3FF', stroke: '#7C3AED' },
  };
  const colors = paletteMap[slug] || { bg: '#FFF7ED', stroke: '#EA580C' };

  return (
    <div className="inline-flex items-center gap-2 min-w-0 max-w-full">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="17" height="17" rx="5" fill={colors.bg} stroke={colors.stroke} strokeWidth="1.4" />
        <path d="M5.5 10h9M10 5.5v9" stroke={colors.stroke} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.65" />
        <circle cx="10" cy="10" r="2.2" fill={colors.stroke} />
      </svg>
      <span className="font-mono text-[11px] sm:text-xs font-bold text-[#111827] truncate">
        {fallbackBadge}
      </span>
    </div>
  );
}

// ============================================================================
// 4. DEDICATED 64x64 REALISTIC SCIENTIFIC INSTRUMENT SVGs (30 UNIQUE GRAPHICS)
// ============================================================================
export function ScienceToolGraphic({
  slug,
  className = 'w-16 h-16',
}: {
  slug: ScienceToolSlug;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');

  switch (slug) {
    // -------------------- 14 BIOLOGY TOOLS --------------------
    case 'punnett-square-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`sb1-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#sb1-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <text x="24" y="15.5" fill="#9A3412" fontSize="8" fontWeight="800" fontFamily="monospace">A</text>
          <text x="41" y="15.5" fill="#9A3412" fontSize="8" fontWeight="800" fontFamily="monospace">a</text>
          <text x="10.5" y="29" fill="#9A3412" fontSize="8" fontWeight="800" fontFamily="monospace">A</text>
          <text x="10.5" y="46" fill="#9A3412" fontSize="8" fontWeight="800" fontFamily="monospace">a</text>
          <rect x="18" y="18" width="16" height="16" rx="3.5" fill="#F97316" />
          <rect x="36" y="18" width="16" height="16" rx="3.5" fill="#FB923C" fillOpacity="0.4" stroke="#EA580C" strokeWidth="1.4" />
          <rect x="18" y="36" width="16" height="16" rx="3.5" fill="#FB923C" fillOpacity="0.4" stroke="#EA580C" strokeWidth="1.4" />
          <rect x="36" y="36" width="16" height="16" rx="3.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.4" />
          <text x="21" y="29" fill="#FFFFFF" fontSize="7.5" fontWeight="800" fontFamily="monospace">AA</text>
          <text x="39" y="29" fill="#9A3412" fontSize="7.5" fontWeight="800" fontFamily="monospace">Aa</text>
          <text x="21" y="46.5" fill="#9A3412" fontSize="7.5" fontWeight="800" fontFamily="monospace">Aa</text>
          <text x="39" y="46.5" fill="#334155" fontSize="7.5" fontWeight="800" fontFamily="monospace">aa</text>
        </svg>
      );

    case 'dna-rna-protein-translator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`sb2-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="100%" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#sb2-${uid})`} stroke="#6EE7B7" strokeWidth="1.5" />
          <path d="M16 14c0 9 14 9 14 17s-14 8-14 19" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M30 14c0 9-14 9-14 17s14 8 14 19" stroke="#0EA5E9" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18 19h10M20 24h6M20 39h6M18 45h10" stroke="#065F46" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M34 32h7m-2-3 3 3-3 3" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="48" cy="21" r="4" fill="#F97316" />
          <circle cx="48" cy="32" r="4" fill="#10B981" />
          <circle cx="48" cy="43" r="4" fill="#0284C7" />
          <path d="M48 25v3M48 36v3" stroke="#334155" strokeWidth="1.8" />
        </svg>
      );

    case 'pcr-master-mix-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`sb3-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#sb3-${uid})`} stroke="#93C5FD" strokeWidth="1.5" />
          <path d="M11 45H53" stroke="#1E3A8A" strokeWidth="1.4" strokeOpacity="0.35" />
          <path d="M12 20H21V36H31V26H41V20H52" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="20" r="2.6" fill="#DC2626" />
          <circle cx="26" cy="36" r="2.6" fill="#2563EB" />
          <circle cx="36" cy="26" r="2.6" fill="#059669" />
          <text x="13" y="15.5" fill="#991B1B" fontSize="6.8" fontWeight="800" fontFamily="monospace">95°</text>
          <text x="21.5" y="44" fill="#1E40AF" fontSize="6.8" fontWeight="800" fontFamily="monospace">55°</text>
          <text x="39" y="54" fill="#1E3A8A" fontSize="7.5" fontWeight="800" fontFamily="monospace">Tm</text>
        </svg>
      );

    case 'hardy-weinberg-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F5F3FF" stroke="#C4B5FD" strokeWidth="1.5" />
          <path d="M12 46H52" stroke="#4C1D95" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M13 18C25 18 39 46 51 46" stroke="#7C3AED" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M13 46C25 46 39 18 51 18" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="3 2" />
          <path d="M13 46C23 22 41 22 51 46" stroke="#F97316" strokeWidth="2.6" strokeLinecap="round" />
          <text x="13" y="54" fill="#5B21B6" fontSize="7.2" fontWeight="800" fontFamily="monospace">p²+2pq+q²</text>
        </svg>
      );

    case 'restriction-digest-gel-simulator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          <rect x="13" y="12" width="10" height="4" rx="1" fill="#475569" />
          <rect x="27" y="12" width="10" height="4" rx="1" fill="#475569" />
          <rect x="41" y="12" width="10" height="4" rx="1" fill="#475569" />
          <rect x="13" y="21" width="10" height="2.6" rx="1" fill="#38BDF8" />
          <rect x="13" y="28" width="10" height="2.6" rx="1" fill="#38BDF8" />
          <rect x="13" y="36" width="10" height="2.6" rx="1" fill="#38BDF8" />
          <rect x="13" y="44" width="10" height="2.6" rx="1" fill="#38BDF8" />
          <rect x="27" y="24" width="10" height="3.2" rx="1" fill="#FB923C" />
          <rect x="27" y="38" width="10" height="3.2" rx="1" fill="#FB923C" />
          <rect x="41" y="31" width="10" height="3.5" rx="1" fill="#34D399" />
          <text x="14" y="55" fill="#94A3B8" fontSize="6.8" fontWeight="700" fontFamily="monospace">kb GEL</text>
        </svg>
      );

    case 'crispr-grna-finder':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1.5" />
          <rect x="11" y="26" width="29" height="8" rx="3" fill="#EA580C" fillOpacity="0.2" stroke="#EA580C" strokeWidth="1.6" />
          <rect x="41" y="26" width="13" height="8" rx="3" fill="#DC2626" />
          <text x="42.5" y="32" fill="#FFFFFF" fontSize="6.3" fontWeight="800" fontFamily="monospace">NGG</text>
          <path d="M12 40h42" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M34 15v10m-3-3 3 3 3-3" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="14" y="52" fill="#991B1B" fontSize="7.2" fontWeight="800" fontFamily="monospace">Cas9 Cut</text>
        </svg>
      );

    case 'serial-dilution-molarity-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1.5" />
          <rect x="13" y="22" width="7.5" height="27" rx="3.75" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="13.8" y="29" width="5.9" height="19.2" rx="3" fill="#EA580C" fillOpacity="0.85" />
          <rect x="24" y="22" width="7.5" height="27" rx="3.75" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="24.8" y="32" width="5.9" height="16.2" rx="3" fill="#F97316" fillOpacity="0.55" />
          <rect x="35" y="22" width="7.5" height="27" rx="3.75" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="35.8" y="34" width="5.9" height="14.2" rx="3" fill="#FB923C" fillOpacity="0.35" />
          <rect x="46" y="22" width="7.5" height="27" rx="3.75" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.6" />
          <rect x="46.8" y="36" width="5.9" height="12.2" rx="3" fill="#BAE6FD" fillOpacity="0.6" />
          <path d="M17 15c3-3 7-3 10 0" stroke="#0284C7" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M28 15c3-3 7-3 10 0" stroke="#0284C7" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'cell-growth-cfu-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          <path d="M12 16V48H52" stroke="#065F46" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 45C23 45 27 42 33 28C37 19 43 17 51 17" stroke="#059669" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="44" cy="36" r="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="42" cy="34" r="1.4" fill="#EA580C" />
          <circle cx="46" cy="35" r="1.2" fill="#EA580C" />
          <circle cx="44" cy="38.5" r="1.3" fill="#EA580C" />
        </svg>
      );

    case 'microscope-fov-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <circle cx="32" cy="31" r="16" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2.2" />
          <path d="M18 31h28M32 17v28" stroke="#93C5FD" strokeWidth="1.2" strokeDasharray="2 2" />
          <ellipse cx="32" cy="31" rx="8" ry="4.2" fill="#FB923C" fillOpacity="0.35" stroke="#EA580C" strokeWidth="1.8" />
          <path d="M24 31v4M28 31v3M32 31v4M36 31v3M40 31v4" stroke="#1E3A8A" strokeWidth="1.4" />
          <text x="15" y="54" fill="#1E40AF" fontSize="7.2" fontWeight="800" fontFamily="monospace">FOV µm</text>
        </svg>
      );

    case 'interactive-cell-explorer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
          <path d="M16 20c5-7 27-8 33 0s4 21-3 28-26 7-31-1-4-20 1-27Z" fill="#DCFCE7" stroke="#15803D" strokeWidth="2.2" />
          <circle cx="29" cy="31" r="7.5" fill="#A855F7" fillOpacity="0.3" stroke="#7E22CE" strokeWidth="2" />
          <circle cx="30" cy="30" r="2.6" fill="#6B21A8" />
          <ellipse cx="42" cy="26" rx="4.5" ry="2.5" transform="rotate(35 42 26)" fill="#F97316" fillOpacity="0.7" />
          <ellipse cx="41" cy="40" rx="4.5" ry="2.5" transform="rotate(-25 41 40)" fill="#F97316" fillOpacity="0.7" />
        </svg>
      );

    case 'biodiversity-index-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          <rect x="13" y="20" width="7" height="27" rx="2" fill="#059669" />
          <rect x="23" y="27" width="7" height="20" rx="2" fill="#10B981" />
          <rect x="33" y="34" width="7" height="13" rx="2" fill="#F97316" />
          <rect x="43" y="38" width="7" height="9" rx="2" fill="#0284C7" />
          <text x="14" y="55" fill="#065F46" fontSize="7.5" fontWeight="800" fontFamily="monospace">H′=−Σp·lnp</text>
        </svg>
      );

    case 'water-potential-osmolarity-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFEFF" stroke="#67E8F9" strokeWidth="1.5" />
          <rect x="15" y="16" width="34" height="28" rx="6" fill="#CFFAFE" stroke="#0891B2" strokeWidth="2.2" />
          <rect x="19" y="20" width="26" height="20" rx="4" fill="#A7F3D0" stroke="#059669" strokeWidth="1.6" />
          <path d="M10 30h8m-2-3 3 3-3 3" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M54 30h-8m2-3-3 3 3 3" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="19" y="54" fill="#155E75" fontSize="7.5" fontWeight="800" fontFamily="monospace">Ψ = Ψs+Ψp</text>
        </svg>
      );

    case 'human-physiology-calculators':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.5" />
          <path d="M10 33h9l4-8 5 17 5-25 4 16h17" stroke="#E11D48" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="15" y="53" fill="#9F1239" fontSize="7.2" fontWeight="800" fontFamily="monospace">MAP·CO·Vm</text>
        </svg>
      );

    case 'taxonomic-dichotomous-key-builder':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FEFCE8" stroke="#FDE047" strokeWidth="1.5" />
          <path d="M13 32h11V19h12M24 32v13h12M36 19v-5h12M36 19v5h12M36 45v-5h12M36 45v5h12" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="13" cy="32" r="3" fill="#EA580C" />
          <circle cx="48" cy="14" r="2.6" fill="#059669" />
          <circle cx="48" cy="24" r="2.6" fill="#059669" />
          <circle cx="48" cy="40" r="2.6" fill="#0284C7" />
          <circle cx="48" cy="50" r="2.6" fill="#0284C7" />
        </svg>
      );

    // -------------------- 16 CHEMISTRY TOOLS --------------------
    case 'interactive-periodic-table':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`sc1-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#sc1-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <rect x="13" y="13" width="26" height="28" rx="5" fill="#EA580C" />
          <text x="16.5" y="21.5" fill="#FED7AA" fontSize="6.8" fontWeight="700" fontFamily="monospace">26</text>
          <text x="18" y="33.5" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="sans-serif">Fe</text>
          <rect x="42" y="13" width="9" height="9" rx="2.5" fill="#FB923C" fillOpacity="0.45" />
          <rect x="42" y="25" width="9" height="9" rx="2.5" fill="#0284C7" fillOpacity="0.4" />
          <rect x="13" y="44" width="12" height="8" rx="2" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.2" />
          <rect x="27" y="44" width="12" height="8" rx="2" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.2" />
          <rect x="41" y="44" width="10" height="8" rx="2" fill="#10B981" fillOpacity="0.25" />
        </svg>
      );

    case 'molar-mass-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          <path d="M18 22h28l-2-5H20l-2 5Z" fill="#059669" />
          <path d="M32 22v6" stroke="#065F46" strokeWidth="2.4" />
          <rect x="13" y="28" width="38" height="21" rx="5" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.8" />
          <rect x="18" y="33" width="28" height="10" rx="2.5" fill="#0F172A" />
          <text x="21" y="40.5" fill="#34D399" fontSize="7.2" fontWeight="800" fontFamily="monospace">g/mol</text>
        </svg>
      );

    case 'chemical-equation-balancer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <circle cx="19" cy="24" r="6" fill="#2563EB" fillOpacity="0.22" stroke="#2563EB" strokeWidth="2" />
          <text x="15.8" y="26.8" fill="#1E3A8A" fontSize="8" fontWeight="800" fontFamily="monospace">A</text>
          <path d="M27 24h9m-2.5-3 3 3-3 3" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="45" cy="24" r="6" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" />
          <text x="41.8" y="26.8" fill="#065F46" fontSize="8" fontWeight="800" fontFamily="monospace">C</text>
          <path d="M15 44h34" stroke="#1E3A8A" strokeWidth="2.2" strokeLinecap="round" />
          <polygon points="32,37 28,44 36,44" fill="#EA580C" />
          <text x="14" y="54" fill="#1E3A8A" fontSize="7" fontWeight="800" fontFamily="monospace">aA→cC</text>
        </svg>
      );

    case 'limiting-reagent-yield-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
          <text x="12" y="21" fill="#9A3412" fontSize="7.2" fontWeight="800" fontFamily="monospace">LIMIT</text>
          <rect x="12" y="24" width="40" height="6" rx="3" fill="#E2E8F0" />
          <rect x="12" y="24" width="40" height="6" rx="3" fill="#EA580C" />
          <text x="12" y="39" fill="#065F46" fontSize="7.2" fontWeight="800" fontFamily="monospace">EXCESS</text>
          <rect x="12" y="42" width="40" height="6" rx="3" fill="#E2E8F0" />
          <rect x="12" y="42" width="24" height="6" rx="3" fill="#10B981" />
        </svg>
      );

    case 'empirical-molecular-formula-finder':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F5F3FF" stroke="#C4B5FD" strokeWidth="1.5" />
          <circle cx="32" cy="27" r="13" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
          <path d="M32 27V14a13 13 0 0 1 11.2 19.5L32 27Z" fill="#7C3AED" fillOpacity="0.32" />
          <path d="M32 27l11.2 6.5A13 13 0 0 1 21 33.5L32 27Z" fill="#EA580C" fillOpacity="0.45" />
          <text x="14" y="52" fill="#5B21B6" fontSize="7.4" fontWeight="800" fontFamily="monospace">(CH₂O)ₙ</text>
        </svg>
      );

    case 'solution-concentration-converter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFEFF" stroke="#67E8F9" strokeWidth="1.5" />
          <path d="M28 13h8v10l10 17a5 5 0 0 1-4.3 7.5H22.3A5 5 0 0 1 18 40l10-17V13Z" fill="#FFFFFF" stroke="#0891B2" strokeWidth="2" strokeLinejoin="round" />
          <path d="M21 36h22l2.2 3.8A4.2 4.2 0 0 1 41.5 46h-19a4.2 4.2 0 0 1-3.7-6.2L21 36Z" fill="#06B6D4" fillOpacity="0.45" />
          <path d="M29 19h6" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" />
          <text x="16" y="56" fill="#155E75" fontSize="7" fontWeight="800" fontFamily="monospace">M·m·%w</text>
        </svg>
      );

    case 'ph-buffer-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
          <rect x="12" y="15" width="40" height="8" rx="4" fill="#E2E8F0" />
          <rect x="12" y="15" width="13" height="8" rx="4" fill="#EF4444" fillOpacity="0.85" />
          <rect x="25" y="15" width="14" height="8" fill="#10B981" fillOpacity="0.85" />
          <rect x="39" y="15" width="13" height="8" rx="4" fill="#3B82F6" fillOpacity="0.85" />
          <polygon points="32,24 28.5,29 35.5,29" fill="#0F172A" />
          <rect x="16" y="33" width="32" height="17" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
          <text x="20" y="44.5" fill="#0F172A" fontSize="8.5" fontWeight="800" fontFamily="monospace">pH 7.40</text>
        </svg>
      );

    case 'acid-base-titration-plotter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1.5" />
          <path d="M12 14v36h40" stroke="#0369A1" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 44c9 0 14-2 17-13s6-13 18-13" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="31" cy="31" r="3.4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.4" />
          <path d="M31 31v19" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <text x="35" y="34" fill="#0C4A6E" fontSize="7" fontWeight="800" fontFamily="monospace">Veq</text>
        </svg>
      );

    case 'ideal-gas-law-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <rect x="15" y="18" width="34" height="30" rx="5" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="16" y="21" width="32" height="5" fill="#94A3B8" />
          <path d="M32 11v10" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="35" r="2.6" fill="#EA580C" />
          <circle cx="37" cy="33" r="2.6" fill="#2563EB" />
          <circle cx="30" cy="42" r="2.6" fill="#059669" />
          <circle cx="42" cy="40" r="2.6" fill="#EA580C" />
          <text x="16" y="56" fill="#1E3A8A" fontSize="7.2" fontWeight="800" fontFamily="monospace">PV=nRT</text>
        </svg>
      );

    case 'thermochemistry-gibbs-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.5" />
          <path d="M12 33h40" stroke="#9F1239" strokeWidth="1.4" strokeDasharray="3 2" />
          <path d="M14 46L50 18" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="30.5" cy="33" r="3.4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.4" />
          <text x="13" y="20" fill="#881337" fontSize="7.5" fontWeight="800" fontFamily="monospace">ΔG&lt;0</text>
          <text x="15" y="55" fill="#881337" fontSize="7.2" fontWeight="800" fontFamily="monospace">ΔH−TΔS</text>
        </svg>
      );

    case 'nernst-electrochemistry-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FEFCE8" stroke="#FCD34D" strokeWidth="1.5" />
          <rect x="12" y="28" width="15" height="20" rx="3" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.6" />
          <rect x="37" y="28" width="15" height="20" rx="3" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.6" />
          <path d="M19 36V19h26v17" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="19" r="6" fill="#0F172A" />
          <text x="29.4" y="21.8" fill="#FACC15" fontSize="8" fontWeight="800" fontFamily="monospace">V</text>
          <path d="M23 33c3-4 15-4 18 0" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'vsepr-molecular-geometry-visualizer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          <path d="M32 32V16M32 32L18 44M32 32L46 43M32 32L45 26" stroke="#94A3B8" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="32" cy="32" r="7" fill="#EA580C" />
          <circle cx="32" cy="15" r="4.5" fill="#F8FAFC" />
          <circle cx="17" cy="45" r="4.5" fill="#F8FAFC" />
          <circle cx="47" cy="44" r="4.5" fill="#F8FAFC" />
          <circle cx="46" cy="25" r="4" fill="#38BDF8" />
        </svg>
      );

    case 'degree-of-unsaturation-ihd-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          <polygon points="32,14 47,23 47,41 32,50 17,41 17,23" fill="#D1FAE5" stroke="#047857" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="8.5" stroke="#059669" strokeWidth="2" strokeDasharray="5 3" />
          <text x="23" y="34.5" fill="#065F46" fontSize="7.2" fontWeight="800" fontFamily="monospace">IHD</text>
        </svg>
      );

    case 'ir-nmr-spectroscopy-lookup':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F5F3FF" stroke="#C4B5FD" strokeWidth="1.5" />
          <path d="M10 18h10l3 14 3-14h7l2 26 2-26h5l3 18 3-18h6" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="14" y="53" fill="#5B21B6" fontSize="7.2" fontWeight="800" fontFamily="monospace">cm⁻¹ · δ</text>
        </svg>
      );

    case 'beer-lambert-calibration-plotter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#F0FDFA" stroke="#5EEAD4" strokeWidth="1.5" />
          <path d="M13 15V48H51" stroke="#115E59" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 46L49 18" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="42" r="2.6" fill="#EA580C" />
          <circle cx="29" cy="35" r="2.6" fill="#EA580C" />
          <circle cx="38" cy="27" r="2.6" fill="#EA580C" />
          <circle cx="46" cy="20" r="2.6" fill="#EA580C" />
          <text x="15" y="23" fill="#0F766E" fontSize="7.5" fontWeight="800" fontFamily="monospace">A=εlc</text>
        </svg>
      );

    case 'radioactive-decay-halflife-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="56" height="56" rx="16" fill="#FEFCE8" stroke="#FDE047" strokeWidth="1.5" />
          <path d="M12 16V48H52" stroke="#854D0E" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M15 18C20 35 30 43 51 45" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="25" cy="32" r="3" fill="#0F172A" />
          <circle cx="36" cy="40" r="2.6" fill="#CA8A04" />
          <text x="27" y="24" fill="#854D0E" fontSize="7.5" fontWeight="800" fontFamily="monospace">t½</text>
        </svg>
      );
  }
}
