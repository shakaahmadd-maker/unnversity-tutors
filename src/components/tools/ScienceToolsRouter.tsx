import React, { lazy, Suspense } from 'react';
import { ResolvedScienceRoute, ScienceToolSlug, resolveScienceRoute } from '../../data/scienceToolsRegistry';
import ScienceToolLayout from './ScienceToolLayout';

const ScienceMegaHub = lazy(() => import('./ScienceMegaHub'));

// Biology: GeneticsTools
const PunnettSquareCalculator = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.PunnettSquareCalculator }))
);
const DnaRnaProteinTranslator = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.DnaRnaProteinTranslator }))
);
const PcrMasterMixCalculator = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.PcrMasterMixCalculator }))
);
const HardyWeinbergCalculator = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.HardyWeinbergCalculator }))
);
const RestrictionDigestGelSimulator = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.RestrictionDigestGelSimulator }))
);
const CrisprGrnaFinder = lazy(() =>
  import('./biology/GeneticsTools').then((m) => ({ default: m.CrisprGrnaFinder }))
);

// Biology: CellLabTools
const SerialDilutionMolarityCalculator = lazy(() =>
  import('./biology/CellLabTools').then((m) => ({ default: m.SerialDilutionMolarityCalculator }))
);
const CellGrowthCfuCalculator = lazy(() =>
  import('./biology/CellLabTools').then((m) => ({ default: m.CellGrowthCfuCalculator }))
);
const MicroscopeFovCalculator = lazy(() =>
  import('./biology/CellLabTools').then((m) => ({ default: m.MicroscopeFovCalculator }))
);
const InteractiveCellExplorer = lazy(() =>
  import('./biology/CellLabTools').then((m) => ({ default: m.InteractiveCellExplorer }))
);

// Biology: EcologyPhysiologyTools
const BiodiversityIndexCalculator = lazy(() =>
  import('./biology/EcologyPhysiologyTools').then((m) => ({ default: m.BiodiversityIndexCalculator }))
);
const WaterPotentialOsmolarityCalculator = lazy(() =>
  import('./biology/EcologyPhysiologyTools').then((m) => ({ default: m.WaterPotentialOsmolarityCalculator }))
);
const HumanPhysiologyCalculators = lazy(() =>
  import('./biology/EcologyPhysiologyTools').then((m) => ({ default: m.HumanPhysiologyCalculators }))
);
const TaxonomicDichotomousKeyBuilder = lazy(() =>
  import('./biology/EcologyPhysiologyTools').then((m) => ({ default: m.TaxonomicDichotomousKeyBuilder }))
);

// Chemistry: GeneralPhysicalChemTools
const InteractivePeriodicTable = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.InteractivePeriodicTable }))
);
const MolarMassCalculator = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.MolarMassCalculator }))
);
const ChemicalEquationBalancer = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.ChemicalEquationBalancer }))
);
const LimitingReagentYieldCalculator = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.LimitingReagentYieldCalculator }))
);
const EmpiricalMolecularFormulaFinder = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.EmpiricalMolecularFormulaFinder }))
);
const SolutionConcentrationConverter = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.SolutionConcentrationConverter }))
);
const PhBufferCalculator = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.PhBufferCalculator }))
);
const AcidBaseTitrationPlotter = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.AcidBaseTitrationPlotter }))
);
const IdealGasLawSolver = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.IdealGasLawSolver }))
);
const ThermochemistryGibbsCalculator = lazy(() =>
  import('./chemistry/GeneralPhysicalChemTools').then((m) => ({ default: m.ThermochemistryGibbsCalculator }))
);

// Chemistry: OrganicAnalyticalChemTools
const NernstElectrochemistrySolver = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.NernstElectrochemistrySolver }))
);
const VseprMolecularGeometryVisualizer = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.VseprMolecularGeometryVisualizer }))
);
const DegreeOfUnsaturationIhdCalculator = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.DegreeOfUnsaturationIhdCalculator }))
);
const IrNmrSpectroscopyLookup = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.IrNmrSpectroscopyLookup }))
);
const BeerLambertCalibrationPlotter = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.BeerLambertCalibrationPlotter }))
);
const RadioactiveDecayHalflifeCalculator = lazy(() =>
  import('./chemistry/OrganicAnalyticalChemTools').then((m) => ({ default: m.RadioactiveDecayHalflifeCalculator }))
);

function ScienceToolFallback() {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center py-14 gap-3 text-orange-600">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading science simulator...</span>
    </div>
  );
}

interface ScienceToolsRouterProps {
  route?: ResolvedScienceRoute;
  activeView?: string;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function renderScienceToolComponent(slug: ScienceToolSlug): React.ReactNode {
  switch (slug) {
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
  route: passedRoute,
  activeView,
  onNavigate,
  onOpenBecomeTutor,
}: ScienceToolsRouterProps) {
  const route =
    passedRoute ??
    (activeView ? resolveScienceRoute(activeView) : null) ?? { kind: 'hub' as const, category: 'Biology' as const };
  if (route.kind === 'hub') {
    return (
      <Suspense fallback={<ScienceToolFallback />}>
        <ScienceMegaHub
          category={route.category}
          onNavigate={onNavigate}
          onOpenBecomeTutor={onOpenBecomeTutor}
        />
      </Suspense>
    );
  }

  return (
    <ScienceToolLayout
      tool={route.tool}
      onNavigate={onNavigate}
      onOpenBecomeTutor={onOpenBecomeTutor}
    >
      <Suspense fallback={<ScienceToolFallback />}>
        {renderScienceToolComponent(route.tool.slug)}
      </Suspense>
    </ScienceToolLayout>
  );
}
