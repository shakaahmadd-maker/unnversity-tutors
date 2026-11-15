import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import {
  PeriodicTableExamples,
  MolarMassExamples,
  EquationBalancerExamples,
  LimitingReagentExamples,
  EmpiricalFormulaExamples,
  RadioactiveDecayExamples,
} from './ChemistryExamplesGeneral';
import {
  ConcentrationConverterExamples,
  PhBufferExamples,
  TitrationPlotterExamples,
  IdealGasExamples,
  GibbsThermoExamples,
  NernstCellExamples,
} from './ChemistryExamplesSolutions';
import {
  VseprExamples,
  IhdUnsaturationExamples,
  SpectroscopyExamples,
  BeerLambertExamples,
} from './ChemistryExamplesOrganic';

interface ChemRealLifeCaseRow {
  id: string;
  caseTitle: string;
  context: string;
  keyValues: string;
  outcome: string;
  presetDetail: Record<string, unknown>;
}

interface ChemRealLifeMeta {
  subDiscipline: string;
  heading: string;
  intro: string;
  tutorLabel: string;
  cases: ChemRealLifeCaseRow[];
}

const CHEM_REAL_LIFE_META: Record<string, ChemRealLifeMeta> = {
  'interactive-periodic-table': {
    subDiscipline: 'Atomic Structure & Periodicity',
    heading: 'Real-Life Periodic Trends & Orbital Configuration Examples',
    intro:
      'Connect quantum subshell rules, anomalous 3d filling (Cu, Cr), and Pauling electronegativity extremes to inorganic catalysis and biological cofactors with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 General Chemistry Tutor',
    cases: [
      {
        id: 'pt-cr',
        caseTitle: 'Chromium (Z = 24) Half-Filled d⁵ Exception',
        context: 'Exchange stabilization promoting one 4s electron into 3d',
        keyValues: 'Symbol: Cr · [Ar] 3d⁵ 4s¹ · Group 6 Transition Metal',
        outcome: 'Molar Mass 51.996 g/mol · Oxidation +2, +3, +6',
        presetDetail: {
          slug: 'interactive-periodic-table',
          symbol: 'Cr',
          categoryFilter: 'Transition Metal',
          search: '',
        },
      },
      {
        id: 'pt-cl',
        caseTitle: 'Chlorine (Z = 17) Halogen Disinfectant Trends',
        context: 'High electron affinity & −1 oxidation state in NaCl / HOCl',
        keyValues: 'Symbol: Cl · [Ne] 3s² 3p⁵ · Pauling EN = 3.16',
        outcome: 'Molar Mass 35.45 g/mol · Halogen Period 3',
        presetDetail: {
          slug: 'interactive-periodic-table',
          symbol: 'Cl',
          categoryFilter: 'Halogen',
          search: '',
        },
      },
    ],
  },
  'molar-mass-calculator': {
    subDiscipline: 'Chemical Stoichiometry & Gravimetry',
    heading: 'Real-Life Molar Mass & Percent Composition Case Studies',
    intro:
      'Verify crystal hydrate masses, polyatomic fertilizer formulas, and active pharmaceutical dosages accurately with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Stoichiometry Tutor',
    cases: [
      {
        id: 'mm-ca3po4',
        caseTitle: 'Bone Mineral Hydroxyapatite Precursor Ca₃(PO₄)₂',
        context: 'Nested parenthesis expansion across 2 phosphate anions',
        keyValues: 'Formula: Ca3(PO4)2 · Sample = 31.02 g',
        outcome: 'M = 310.18 g/mol · 0.1000 mol (38.76% Ca, 19.97% P)',
        presetDetail: {
          slug: 'molar-mass-calculator',
          formula: 'Ca3(PO4)2',
          sampleGrams: 31.02,
        },
      },
      {
        id: 'mm-glucose',
        caseTitle: 'Intravenous D5W Dextrose Monohydrate Assay',
        context: 'Medical infusion glucose quantification (C₆H₁₂O₆)',
        keyValues: 'Formula: C6H12O6 · Sample = 50.0 g/L',
        outcome: 'M = 180.16 g/mol · 0.2775 mol · 40.00% Carbon',
        presetDetail: {
          slug: 'molar-mass-calculator',
          formula: 'C6H12O6',
          sampleGrams: 50.0,
        },
      },
    ],
  },
  'chemical-equation-balancer': {
    subDiscipline: 'Reaction Stoichiometry & Redox',
    heading: 'Real-Life Chemical Equation Balancing Examples',
    intro:
      'Master combustion, metallurgical thermite reactions, and multi-species permanganate redox equations with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 General Chemistry Tutor',
    cases: [
      {
        id: 'eq-thermite',
        caseTitle: 'Railway Welding Aluminothermic Thermite Reaction',
        context: 'Molten iron steel-rail reduction of Iron(III) oxide',
        keyValues: 'Reactants: Al + Fe2O3 → Products: Al2O3 + Fe',
        outcome: '2 Al + 1 Fe₂O₃ → 1 Al₂O₃ + 2 Fe',
        presetDetail: {
          slug: 'chemical-equation-balancer',
          equation: 'Al + Fe2O3 -> Al2O3 + Fe',
        },
      },
      {
        id: 'eq-kmno4',
        caseTitle: 'Permanganate Chlorination Laboratory Prep',
        context: '6-species redox generation of Chlorine gas',
        keyValues: 'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
        outcome: '2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 8 H₂O + 5 Cl₂',
        presetDetail: {
          slug: 'chemical-equation-balancer',
          equation: 'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
        },
      },
    ],
  },
  'limiting-reagent-yield-calculator': {
    subDiscipline: 'Quantitative Yield & Industrial Chemistry',
    heading: 'Real-Life Limiting Reagent & Percent Yield Examples',
    intro:
      'Solve excess reagent recovery, aspirin esterification yields, and airbag azide stoichiometries curated by university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Stoichiometry Tutor',
    cases: [
      {
        id: 'lr-thermite',
        caseTitle: 'Thermite Rail Weld (27 g Al + 100 g Fe₂O₃)',
        context: '2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe (Fe = 55.85 g/mol)',
        keyValues: 'Al = 1.00 mol (÷2 = 0.500) · Fe₂O₃ = 0.626 mol',
        outcome: 'Al Limits · Theoretical Fe = 55.85 g · 20.0 g Fe₂O₃ left',
        presetDetail: {
          slug: 'limiting-reagent-yield-calculator',
          reactAFormula: 'Al',
          reactACoef: 2,
          reactAGrams: 27.0,
          reactBFormula: 'Fe2O3',
          reactBCoef: 1,
          reactBGrams: 100.0,
          prodFormula: 'Fe',
          prodCoef: 2,
          actualYieldGrams: 51.4,
        },
      },
      {
        id: 'lr-co2',
        caseTitle: 'Spacecraft LiOH Carbon Dioxide Scrubber',
        context: '2 LiOH + CO₂ → Li₂CO₃ + H₂O (Apollo cabin air capture)',
        keyValues: '100 g LiOH + 110 g CO₂ · Target Product: Li2CO3',
        outcome: 'LiOH Limits · 154.3 g Li₂CO₃ theoretical yield',
        presetDetail: {
          slug: 'limiting-reagent-yield-calculator',
          reactAFormula: 'LiOH',
          reactACoef: 2,
          reactAGrams: 100.0,
          reactBFormula: 'CO2',
          reactBCoef: 1,
          reactBGrams: 110.0,
          prodFormula: 'Li2CO3',
          prodCoef: 1,
          actualYieldGrams: 142.0,
        },
      },
    ],
  },
  'empirical-molecular-formula-finder': {
    subDiscipline: 'Analytical Formula Determination',
    heading: 'Real-Life Empirical & Molecular Formula Case Studies',
    intro:
      'Practice fractional ratio clearing (×2, ×3) and molar-mass multiplier scaling across organic molecules with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Analytical Chemistry Tutor',
    cases: [
      {
        id: 'ef-vitc',
        caseTitle: 'Ascorbic Acid / Vitamin C (Non-Integer Ratio ×3)',
        context: 'Testing classic .333 fractional rounding trap (C₃H₄O₃)',
        keyValues: '40.92% C · 4.58% H · 54.50% O (M = 176.12 g/mol)',
        outcome: 'Empirical C₃H₄O₃ × 2 = Molecular C₆H₈O₆',
        presetDetail: {
          slug: 'empirical-molecular-formula-finder',
          elements: [
            { sym: 'C', pct: 40.92 },
            { sym: 'H', pct: 4.58 },
            { sym: 'O', pct: 54.5 },
          ],
          expMolarMass: 176.12,
        },
      },
      {
        id: 'ef-benzene',
        caseTitle: 'Acetylene vs. Aromatic Benzene (CH Empirical)',
        context: 'Distinguishing M = 26 g/mol gas vs. M = 78.11 g/mol ring',
        keyValues: '92.26% C · 7.74% H (Experimental M = 78.11 g/mol)',
        outcome: 'Empirical CH × 6 = Molecular C₆H₆',
        presetDetail: {
          slug: 'empirical-molecular-formula-finder',
          elements: [
            { sym: 'C', pct: 92.26 },
            { sym: 'H', pct: 7.74 },
          ],
          expMolarMass: 78.11,
        },
      },
    ],
  },
  'solution-concentration-converter': {
    subDiscipline: 'Solution & Analytical Chemistry',
    heading: 'Real-Life Solution Concentration & Density Examples',
    intro:
      'Bridge Molarity (M), temperature-independent Molality (m), Normality (N), and environmental ppm water thresholds with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Solution Chemistry Tutor',
    cases: [
      {
        id: 'conc-hcl',
        caseTitle: 'Concentrated 37% Hydrochloric Acid Stock',
        context: 'Density-corrected reagent prep (M = 36.46 g/mol, d = 1.19 g/mL)',
        keyValues: 'Molarity = 12.08 M · z = 1 · Density = 1.19 g/mL',
        outcome: '37.0% w/w · Molality = 16.12 m · 12.08 N',
        presetDetail: {
          slug: 'solution-concentration-converter',
          molarity: 12.08,
          soluteMm: 36.46,
          densityGml: 1.19,
          equivFactor: 1,
        },
      },
      {
        id: 'conc-urea',
        caseTitle: 'Cryoscopic Molality Benchmark (Urea in Water)',
        context: 'Measuring freezing-point depression molality (M = 60.06 g/mol)',
        keyValues: 'Molarity = 1.50 M · d = 1.022 g/mL · z = 1',
        outcome: 'Molality m = 1.610 mol/kg solvent · 8.81% w/w',
        presetDetail: {
          slug: 'solution-concentration-converter',
          molarity: 1.5,
          soluteMm: 60.06,
          densityGml: 1.022,
          equivFactor: 1,
        },
      },
    ],
  },
  'ph-buffer-calculator': {
    subDiscipline: 'Acid-Base Equilibria & Biochemistry',
    heading: 'Real-Life Buffer pH & Henderson-Hasselbalch Examples',
    intro:
      'Design Tris/Phosphate biochemistry lab buffers and analyze clinical respiratory acidosis compensation with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Equilibrium & BioChem Tutor',
    cases: [
      {
        id: 'ph-pbs',
        caseTitle: 'Cellular PBS Phosphate Buffer (pH 7.40 Target)',
        context: 'H₂PO₄⁻ / HPO₄²⁻ conjugate system (pKa₂ = 7.20)',
        keyValues: 'pKa = 7.20 · [H₂PO₄⁻] = 0.040 M · [HPO₄²⁻] = 0.063 M',
        outcome: 'pH = 7.40 (Inside Optimal pKa ± 1 Zone)',
        presetDetail: {
          slug: 'ph-buffer-calculator',
          pKa: 7.2,
          acidConc: 0.04,
          baseConc: 0.063,
        },
      },
      {
        id: 'ph-tris',
        caseTitle: 'Tris-HCl Molecular Biology Enzyme Buffer',
        context: 'Maintaining pH 8.0 for restriction enzymes & PCR mix',
        keyValues: 'pKa = 8.06 · [Acid] = 0.055 M · [Base] = 0.048 M',
        outcome: 'pH = 8.00 · pOH = 6.00 (Optimal Stability)',
        presetDetail: {
          slug: 'ph-buffer-calculator',
          pKa: 8.06,
          acidConc: 0.055,
          baseConc: 0.048,
        },
      },
    ],
  },
  'acid-base-titration-plotter': {
    subDiscipline: 'Volumetric Titration & Indicators',
    heading: 'Real-Life Acid-Base Titration Curve Case Studies',
    intro:
      'Compare weak organic food acids (acetic, lactic) against strong mineral acids to predict half-equivalence pH and endpoint color jumps with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Analytical Chemistry Tutor',
    cases: [
      {
        id: 'tit-strong',
        caseTitle: 'Strong Acid HCl (pKa = −2) + NaOH Titration',
        context: 'Zero buffer plateau with sharp neutral jump right at pH 7.00',
        keyValues: '25 mL of 0.10 M HCl + 0.10 M NaOH (pKa ≈ 0)',
        outcome: 'V_eq = 25.0 mL · Equivalence pH = 7.00 (Bromothymol Blue)',
        presetDetail: {
          slug: 'acid-base-titration-plotter',
          acidVolMl: 25,
          acidM: 0.1,
          pKa: 0.5,
          baseM: 0.1,
        },
      },
      {
        id: 'tit-lactic',
        caseTitle: 'Dairy Fermentation Lactic Acid Quality Titration',
        context: 'Quantifying yogurt tartness (pKa = 3.86) with 0.15 M NaOH',
        keyValues: '20 mL sample · [Acid] = 0.12 M · [NaOH] = 0.15 M',
        outcome: 'V_eq = 16.0 mL · ½ V_eq (8.0 mL) = pH 3.86',
        presetDetail: {
          slug: 'acid-base-titration-plotter',
          acidVolMl: 20,
          acidM: 0.12,
          pKa: 3.86,
          baseM: 0.15,
        },
      },
    ],
  },
  'ideal-gas-law-solver': {
    subDiscipline: 'Thermodynamic Gases & Atmospheric Physics',
    heading: 'Real-Life PV = nRT Gas Law Applications',
    intro:
      'Model weather balloon altitude expansion, compressed scuba cylinder pressures, and IUPAC standard molar volumes with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Physical Chemistry Tutor',
    cases: [
      {
        id: 'gas-stp',
        caseTitle: 'Classic Chemistry STP Molar Volume Check',
        context: '1.00 mol ideal gas at 0 °C (273.15 K) and 1.00 atm',
        keyValues: 'Solve V · P = 1.00 atm · n = 1.00 mol · T = 273.15 K',
        outcome: 'V = 22.414 L (101.325 kPa reference)',
        presetDetail: {
          slug: 'ideal-gas-law-solver',
          solveFor: 'V',
          pAtm: 1.0,
          nMol: 1.0,
          tKelvin: 273.15,
        },
      },
      {
        id: 'gas-balloon',
        caseTitle: 'Stratospheric Helium Weather Balloon Burst Check',
        context: 'Solving balloon expansion volume at 218 K (−55 °C) and 0.08 atm',
        keyValues: 'Solve V · P = 0.08 atm · n = 15.0 mol He · T = 218 K',
        outcome: 'V = 3,354 L (Over 12× Sea-Level Expansion!)',
        presetDetail: {
          slug: 'ideal-gas-law-solver',
          solveFor: 'V',
          pAtm: 0.08,
          nMol: 15.0,
          tKelvin: 218,
        },
      },
    ],
  },
  'thermochemistry-gibbs-calculator': {
    subDiscipline: 'Chemical Thermodynamics & Equilibrium',
    heading: 'Real-Life Gibbs Free Energy (ΔG = ΔH − TΔS) Examples',
    intro:
      'Predict spontaneity regimes, compute equilibrium constants K, and eliminate kJ vs. J entropy unit traps with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Physical Chemistry Tutor',
    cases: [
      {
        id: 'gibbs-ice',
        caseTitle: 'Endothermic Ice Melting Crossover (273.15 K)',
        context: 'H₂O(s) → H₂O(l) at +5 °C (278.15 K) vs −5 °C',
        keyValues: 'ΔH = +6.01 kJ/mol · ΔS = +22.0 J/(mol·K) · T = 278.15 K',
        outcome: 'ΔG = −0.11 kJ/mol (Spontaneous melting above 273.2 K)',
        presetDetail: {
          slug: 'thermochemistry-gibbs-calculator',
          deltaHKj: 6.01,
          deltaSJ: 22.0,
          tempK: 278.15,
        },
      },
      {
        id: 'gibbs-atp',
        caseTitle: 'Exergonic Cellular ATP Hydrolysis Benchmark',
        context: 'Spontaneous at ALL biological temperatures (ΔH < 0, ΔS > 0)',
        keyValues: 'ΔH = −20.5 kJ/mol · ΔS = +33.5 J/(mol·K) · T = 310.15 K',
        outcome: 'ΔG° = −30.89 kJ/mol · K = 1.60 × 10⁵',
        presetDetail: {
          slug: 'thermochemistry-gibbs-calculator',
          deltaHKj: -20.5,
          deltaSJ: 33.5,
          tempK: 310.15,
        },
      },
    ],
  },
  'nernst-electrochemistry-solver': {
    subDiscipline: 'Electrochemistry & Batteries',
    heading: 'Real-Life Galvanic Battery & Concentration Cell Examples',
    intro:
      'Connect ion concentration gradients, mitochondrial redox potentials, and equilibrium dead-battery limits (Q = K) with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Electrochemistry Tutor',
    cases: [
      {
        id: 'nernst-conc',
        caseTitle: 'Copper Concentration Cell (0.001 M || 1.0 M)',
        context: 'Identical Cu electrodes generating voltage solely from Δ[Cu²⁺]',
        keyValues: 'E°cathode = +0.34 V · E°anode = +0.34 V · Q = 0.001 (n = 2)',
        outcome: 'E°cell = 0.000 V → Nernst Ecell = +0.0887 V!',
        presetDetail: {
          slug: 'nernst-electrochemistry-solver',
          cellName: 'Cu²⁺ Concentration Cell (0.001 M || 1.0 M)',
          eCathode: 0.34,
          eAnode: 0.34,
          electronsN: 2,
          reactionQ: 0.001,
          tempK: 298.15,
        },
      },
      {
        id: 'nernst-lead',
        caseTitle: '12V Car Lead-Acid Single Cell Module (Pb/PbO₂)',
        context: 'Six cells wired in series supply 12.2 V starter cranking power',
        keyValues: 'E°cathode = +1.69 V · E°anode = −0.36 V · n = 2 · Q = 0.2',
        outcome: 'Single Cell Ecell = +2.071 V (×6 cells = 12.4 V)',
        presetDetail: {
          slug: 'nernst-electrochemistry-solver',
          cellName: 'Lead-Acid Automotive Single Cell (Pb | PbO₂)',
          eCathode: 1.69,
          eAnode: -0.36,
          electronsN: 2,
          reactionQ: 0.2,
          tempK: 298.15,
        },
      },
    ],
  },
  'vsepr-molecular-geometry-visualizer': {
    subDiscipline: 'Molecular Orbital & VSEPR Geometry',
    heading: 'Real-Life 3D Molecular Shape & Polarity Examples',
    intro:
      'Orbit hypervalent sulfur/xenon molecules, equatorial lone-pair placement in AX₄E seesaws, and dipole cancellation in 3D with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Structural Chemistry Tutor',
    cases: [
      {
        id: 'vsepr-sf4',
        caseTitle: 'Sulfur Tetrafluoride (SF₄ · AX₄E Seesaw)',
        context: 'Equatorial lone pair avoids three 90° axial clashes',
        keyValues: '4 Bonding + 1 Lone Pair · sp³d Hybridized',
        outcome: 'Molecular Shape: Seesaw (101.6° / 173°) · Polar',
        presetDetail: {
          slug: 'vsepr-molecular-geometry-visualizer',
          moleculeId: 'sf4',
        },
      },
      {
        id: 'vsepr-sf6',
        caseTitle: 'Sulfur Hexafluoride (SF₆ High-Voltage Insulator)',
        context: 'Zero lone pairs across 6 symmetric orthogonal S–F bonds',
        keyValues: '6 Bonding + 0 Lone Pairs · sp³d² Hybridized',
        outcome: 'Octahedral (90° cis, 180° trans) · Nonpolar Inert Gas',
        presetDetail: {
          slug: 'vsepr-molecular-geometry-visualizer',
          moleculeId: 'sf6',
        },
      },
    ],
  },
  'degree-of-unsaturation-ihd-calculator': {
    subDiscipline: 'Organic Structure Elucidation',
    heading: 'Real-Life IHD / Degree of Unsaturation Case Studies',
    intro:
      'Decode drug scaffolds, aromatic heterocyclic neurotransmitters, and halogen/amine valence corrections before solving NMR spectra with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Organic Chemistry Tutor',
    cases: [
      {
        id: 'ihd-benzene',
        caseTitle: 'Benzene Ring Reference Benchmark (C₆H₆)',
        context: 'Classic 1 ring + 3 conjugated π bonds aromatic template',
        keyValues: 'Formula: C6H6 · C=6, H=6, N=0, X=0',
        outcome: 'IHD = 4 (Canonical Aromatic Fingerprint)',
        presetDetail: {
          slug: 'degree-of-unsaturation-ihd-calculator',
          formula: 'C6H6',
        },
      },
      {
        id: 'ihd-benzamide',
        caseTitle: 'Benzamide Halogen/Nitrogen Adjustment (C₇H₇NO)',
        context: 'Verifying trivalent Nitrogen (+1) inside IHD numerator',
        keyValues: 'Formula: C7H7NO · ½[2(7) + 2 + 1 − 7]',
        outcome: 'IHD = 5 (1 Benzene Ring [4] + 1 Amide C=O [1])',
        presetDetail: {
          slug: 'degree-of-unsaturation-ihd-calculator',
          formula: 'C7H7NO',
        },
      },
    ],
  },
  'ir-nmr-spectroscopy-lookup': {
    subDiscipline: 'Organic Instrumental Spectroscopy',
    heading: 'Real-Life IR, ¹H NMR & ¹³C NMR Elucidation Examples',
    intro:
      'Distinguish carboxylic acids from alcohols, aldehydes from ketones, and aromatic substitution symmetries rapidly with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Organic Spectroscopy Tutor',
    cases: [
      {
        id: 'spec-oh',
        caseTitle: 'Carboxylic Acid vs. Alcohol O–H Broadening Check',
        context: 'Comparing ragged 2500–3300 cm⁻¹ vs smooth 3200–3550 cm⁻¹ IR trough',
        keyValues: 'Filter Mode: IR · Query: O–H',
        outcome: 'Separates R–COOH from R–OH cleanly on exams',
        presetDetail: {
          slug: 'ir-nmr-spectroscopy-lookup',
          query: 'O–H',
          modeFilter: 'IR',
        },
      },
      {
        id: 'spec-c13',
        caseTitle: '¹³C NMR Carbonyl Shielding Window (165 vs 205 ppm)',
        context: 'Separating ketone/aldehyde C=O (>190 ppm) from ester/amide (165–180 ppm)',
        keyValues: 'Filter Mode: 13C NMR · Query: Carbonyl',
        outcome: 'Instant functional-group class assignment',
        presetDetail: {
          slug: 'ir-nmr-spectroscopy-lookup',
          query: 'Carbonyl',
          modeFilter: '13C NMR',
        },
      },
    ],
  },
  'beer-lambert-calibration-plotter': {
    subDiscipline: 'Spectrophotometry & Analytical Calibration',
    heading: 'Real-Life Beer-Lambert Standard Curve Case Studies',
    intro:
      'Build linear UV-Vis standard curves (R² ≥ 0.999) for Bradford protein assays, NADH kinetics, and colored transition-metal dyes with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Analytical Chemistry Tutor',
    cases: [
      {
        id: 'bl-cv',
        caseTitle: 'Crystal Violet Bleaching Kinetics (590 nm)',
        context: 'Tracking cationic dye concentration against NaOH quenching',
        keyValues: '4 Standards (1.0–7.5 µM) · Unknown A = 0.415 AU',
        outcome: 'Unknown Conc = 3.61 µM · R² = 1.0000 · 38.5% T',
        presetDetail: {
          slug: 'beer-lambert-calibration-plotter',
          assayName: 'Crystal Violet Dye (590 nm, µM)',
          standards: [
            { c: 1.0, a: 0.115 },
            { c: 2.5, a: 0.288 },
            { c: 5.0, a: 0.576 },
            { c: 7.5, a: 0.862 },
          ],
          unknownAbs: 0.415,
        },
      },
      {
        id: 'bl-cu',
        caseTitle: 'Copper(II) Ammonia Complex Colorimetry (610 nm)',
        context: 'Quantifying [Cu(NH₃)₄]²⁺ alloy digest concentration (mM)',
        keyValues: '4 Standards (2–16 mM) · Unknown A = 0.520 AU',
        outcome: 'Unknown Conc = 9.45 mM · 30.2% Transmittance',
        presetDetail: {
          slug: 'beer-lambert-calibration-plotter',
          assayName: '[Cu(NH₃)₄]²⁺ Complex (610 nm, mM)',
          standards: [
            { c: 2, a: 0.11 },
            { c: 4, a: 0.22 },
            { c: 8, a: 0.44 },
            { c: 16, a: 0.88 },
          ],
          unknownAbs: 0.52,
        },
      },
    ],
  },
  'radioactive-decay-halflife-calculator': {
    subDiscipline: 'Nuclear Kinetics & Radiometric Dating',
    heading: 'Real-Life Radioactive Half-Life & Isotope Case Studies',
    intro:
      'Analyze ¹⁴C archaeological specimens, ¹³¹I thyroid therapy clearance, and ³²P molecular probe decay schedules with university-tutors.com.',
    tutorLabel: 'Book a 1-on-1 Nuclear Chemistry Tutor',
    cases: [
      {
        id: 'rad-i131',
        caseTitle: 'Thyroid Cancer Iodine-131 Therapy Clearance',
        context: 'Tracking beta/gamma therapeutic dose over 24.06 days (3 half-lives)',
        keyValues: 'N₀ = 80 mCi · t₁/₂ = 8.02 days · Elapsed = 24.06 days',
        outcome: 'Remaining = 10.00 mCi (12.50% after 3.00 half-lives)',
        presetDetail: {
          slug: 'radioactive-decay-halflife-calculator',
          isotopeName: 'Iodine-131 (¹³¹I Therapy)',
          n0: 80,
          halfLife: 8.02,
          elapsed: 24.06,
          unitLabel: 'days',
        },
      },
      {
        id: 'rad-mammoth',
        caseTitle: 'Pleistocene Woolly Mammoth Tusk ¹⁴C Age (17,190 yr)',
        context: 'Checking residual 12.5% ¹⁴C after 3 carbon-14 half-lives',
        keyValues: 'N₀ = 100% · t₁/₂ = 5,730 yr · Elapsed = 17,190 yr',
        outcome: 'Remaining ¹⁴C = 12.50% (Exact 3.000 Half-Lives)',
        presetDetail: {
          slug: 'radioactive-decay-halflife-calculator',
          isotopeName: 'Carbon-14 (¹⁴C Paleontology)',
          n0: 100,
          halfLife: 5730,
          elapsed: 17190,
          unitLabel: 'years',
        },
      },
    ],
  },
};

interface ChemistryRealLifeExamplesProps {
  slug: string;
  onNavigate?: (view: string) => void;
}

export default function ChemistryRealLifeExamples({ slug, onNavigate }: ChemistryRealLifeExamplesProps) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const meta = CHEM_REAL_LIFE_META[slug];

  if (!meta) return null;

  const triggerSimulate = (key: string, detail: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ut-chem-load-preset', { detail }));
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
      aria-labelledby="chem-real-life-heading"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-8 sm:space-y-10"
    >
      {/* Platform Branded Intro Header */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-[#EA580C]">Visual Chemistry Study Guides</span>
            <span aria-hidden="true">·</span>
            <span>university-tutors.com</span>
            <span aria-hidden="true">·</span>
            <span>{meta.subDiscipline}</span>
          </div>
          <h2
            id="chem-real-life-heading"
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
      {slug === 'interactive-periodic-table' && (
        <PeriodicTableExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'molar-mass-calculator' && (
        <MolarMassExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'chemical-equation-balancer' && (
        <EquationBalancerExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'limiting-reagent-yield-calculator' && (
        <LimitingReagentExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'empirical-molecular-formula-finder' && (
        <EmpiricalFormulaExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'radioactive-decay-halflife-calculator' && (
        <RadioactiveDecayExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'solution-concentration-converter' && (
        <ConcentrationConverterExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'ph-buffer-calculator' && (
        <PhBufferExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'acid-base-titration-plotter' && (
        <TitrationPlotterExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'ideal-gas-law-solver' && (
        <IdealGasExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'thermochemistry-gibbs-calculator' && (
        <GibbsThermoExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'nernst-electrochemistry-solver' && (
        <NernstCellExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'vsepr-molecular-geometry-visualizer' && (
        <VseprExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'degree-of-unsaturation-ihd-calculator' && (
        <IhdUnsaturationExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'ir-nmr-spectroscopy-lookup' && (
        <SpectroscopyExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}
      {slug === 'beer-lambert-calibration-plotter' && (
        <BeerLambertExamples loadedKey={loadedKey} onSimulate={triggerSimulate} />
      )}

      {/* Curated Bench & Exam Scenarios (Responsive Mobile Cards + Desktop Table) */}
      <article className="bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-8 py-4 border-b border-slate-200 bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-[#EA580C]">
              university-tutors.com Interactive Chemistry Scenario Bank
            </p>
            <h3 className="text-base sm:text-lg font-display font-bold text-[#111827]">
              Additional Real-Life Lab Scenarios (One-Click Load)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click Simulate to load values into calculator</span>
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
