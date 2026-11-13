import React from 'react';
import { ResolvedScienceRoute, ScienceToolSlug } from '../../data/scienceToolsRegistry';
import ScienceMegaHub from './ScienceMegaHub';
import ScienceToolLayout from './ScienceToolLayout';
import {
  PunnettSquareCalculator,
  DnaRnaProteinTranslator,
  PcrMasterMixCalculator,
  HardyWeinbergCalculator,
  RestrictionDigestGelSimulator,
  CrisprGrnaFinder,
} from './biology/GeneticsTools';
import {
  SerialDilutionMolarityCalculator,
  CellGrowthCfuCalculator,
  MicroscopeFovCalculator,
  InteractiveCellExplorer,
} from './biology/CellLabTools';
import {
  BiodiversityIndexCalculator,
  WaterPotentialOsmolarityCalculator,
  HumanPhysiologyCalculators,
  TaxonomicDichotomousKeyBuilder,
} from './biology/EcologyPhysiologyTools';
import {
  InteractivePeriodicTable,
  MolarMassCalculator,
  ChemicalEquationBalancer,
  LimitingReagentYieldCalculator,
  EmpiricalMolecularFormulaFinder,
  SolutionConcentrationConverter,
  PhBufferCalculator,
  AcidBaseTitrationPlotter,
  IdealGasLawSolver,
  ThermochemistryGibbsCalculator,
} from './chemistry/GeneralPhysicalChemTools';
import {
  NernstElectrochemistrySolver,
  VseprMolecularGeometryVisualizer,
  DegreeOfUnsaturationIhdCalculator,
  IrNmrSpectroscopyLookup,
  BeerLambertCalibrationPlotter,
  RadioactiveDecayHalflifeCalculator,
} from './chemistry/OrganicAnalyticalChemTools';

interface ScienceToolsRouterProps {
  route: ResolvedScienceRoute;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function renderScienceToolComponent(slug: ScienceToolSlug): React.ReactNode {
  switch (slug) {
    // 14 Biology Tools
    case 'punnett-square-calculator':
      return <PunnettSquareCalculator />;
    case 'dna-rna-protein-translator':
      return <DnaRnaProteinTranslator />;
    case 'pcr-master-mix-calculator':
      return <PcrMasterMixCalculator />;
    case 'hardy-weinberg-calculator':
      return <HardyWeinbergCalculator />;
    case 'restriction-digest-gel-simulator':
      return <RestrictionDigestGelSimulator />;
    case 'crispr-grna-finder':
      return <CrisprGrnaFinder />;
    case 'serial-dilution-molarity-calculator':
      return <SerialDilutionMolarityCalculator />;
    case 'cell-growth-cfu-calculator':
      return <CellGrowthCfuCalculator />;
    case 'microscope-fov-calculator':
      return <MicroscopeFovCalculator />;
    case 'interactive-cell-explorer':
      return <InteractiveCellExplorer />;
    case 'biodiversity-index-calculator':
      return <BiodiversityIndexCalculator />;
    case 'water-potential-osmolarity-calculator':
      return <WaterPotentialOsmolarityCalculator />;
    case 'human-physiology-calculators':
      return <HumanPhysiologyCalculators />;
    case 'taxonomic-dichotomous-key-builder':
      return <TaxonomicDichotomousKeyBuilder />;

    // 16 Chemistry Tools
    case 'interactive-periodic-table':
      return <InteractivePeriodicTable />;
    case 'molar-mass-calculator':
      return <MolarMassCalculator />;
    case 'chemical-equation-balancer':
      return <ChemicalEquationBalancer />;
    case 'limiting-reagent-yield-calculator':
      return <LimitingReagentYieldCalculator />;
    case 'empirical-molecular-formula-finder':
      return <EmpiricalMolecularFormulaFinder />;
    case 'solution-concentration-converter':
      return <SolutionConcentrationConverter />;
    case 'ph-buffer-calculator':
      return <PhBufferCalculator />;
    case 'acid-base-titration-plotter':
      return <AcidBaseTitrationPlotter />;
    case 'ideal-gas-law-solver':
      return <IdealGasLawSolver />;
    case 'thermochemistry-gibbs-calculator':
      return <ThermochemistryGibbsCalculator />;
    case 'nernst-electrochemistry-solver':
      return <NernstElectrochemistrySolver />;
    case 'vsepr-molecular-geometry-visualizer':
      return <VseprMolecularGeometryVisualizer />;
    case 'degree-of-unsaturation-ihd-calculator':
      return <DegreeOfUnsaturationIhdCalculator />;
    case 'ir-nmr-spectroscopy-lookup':
      return <IrNmrSpectroscopyLookup />;
    case 'beer-lambert-calibration-plotter':
      return <BeerLambertCalibrationPlotter />;
    case 'radioactive-decay-halflife-calculator':
      return <RadioactiveDecayHalflifeCalculator />;
  }
}

export default function ScienceToolsRouter({
  route,
  onNavigate,
  onOpenBecomeTutor,
}: ScienceToolsRouterProps) {
  if (route.kind === 'hub') {
    return (
      <ScienceMegaHub
        category={route.category}
        onNavigate={onNavigate}
        onOpenBecomeTutor={onOpenBecomeTutor}
      />
    );
  }

  return (
    <ScienceToolLayout
      tool={route.tool}
      onNavigate={onNavigate}
      onOpenBecomeTutor={onOpenBecomeTutor}
    >
      {renderScienceToolComponent(route.tool.slug)}
    </ScienceToolLayout>
  );
}
