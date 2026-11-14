import React, { lazy, Suspense } from 'react';
import { MathToolSlug, ResolvedMathRoute, resolveMathRoute } from '../../data/mathToolsRegistry';
import MathToolPageLayout from './MathToolPageLayout';

const MathMegaHub = lazy(() => import('./MathMegaHub'));

// Level 1: Algebra (1–5)
const ScientificExpressionEvaluator = lazy(() =>
  import('./math/Level1AlgebraTools').then((m) => ({ default: m.ScientificExpressionEvaluator }))
);
const QuadraticPolynomialSolver = lazy(() =>
  import('./math/Level1AlgebraTools').then((m) => ({ default: m.QuadraticPolynomialSolver }))
);
const LinearEquationsSystemSolver = lazy(() =>
  import('./math/Level1AlgebraTools').then((m) => ({ default: m.LinearEquationsSystemSolver }))
);
const FractionRatioPercentageSolver = lazy(() =>
  import('./math/Level1AlgebraTools').then((m) => ({ default: m.FractionRatioPercentageSolver }))
);
const LogarithmExponentSimplifier = lazy(() =>
  import('./math/Level1AlgebraTools').then((m) => ({ default: m.LogarithmExponentSimplifier }))
);

// Level 2: Geometry, Trig & Pre-Calc (6–9)
const InteractiveUnitCircleExplorer = lazy(() =>
  import('./math/Level2TrigGeometryTools').then((m) => ({ default: m.InteractiveUnitCircleExplorer }))
);
const TriangleLawSinesCosinesSolver = lazy(() =>
  import('./math/Level2TrigGeometryTools').then((m) => ({ default: m.TriangleLawSinesCosinesSolver }))
);
const ConicSectionsVisualizer = lazy(() =>
  import('./math/Level2TrigGeometryTools').then((m) => ({ default: m.ConicSectionsVisualizer }))
);
const ComplexNumberPolarConverter = lazy(() =>
  import('./math/Level2TrigGeometryTools').then((m) => ({ default: m.ComplexNumberPolarConverter }))
);

// Level 3: Calculus & Real Analysis (10–14)
const SymbolicDerivativeCalculator = lazy(() =>
  import('./math/Level3CalculusTools').then((m) => ({ default: m.SymbolicDerivativeCalculator }))
);
const DefiniteIntegralRiemannPlotter = lazy(() =>
  import('./math/Level3CalculusTools').then((m) => ({ default: m.DefiniteIntegralRiemannPlotter }))
);
const LimitsLhopitalExplorer = lazy(() =>
  import('./math/Level3CalculusTools').then((m) => ({ default: m.LimitsLhopitalExplorer }))
);
const TaylorMaclaurinSeriesVisualizer = lazy(() =>
  import('./math/Level3CalculusTools').then((m) => ({ default: m.TaylorMaclaurinSeriesVisualizer }))
);
const SequenceSeriesConvergenceTester = lazy(() =>
  import('./math/Level3CalculusTools').then((m) => ({ default: m.SequenceSeriesConvergenceTester }))
);

// Level 4: Linear Algebra & Vector Calculus (15–18)
const MatrixAlgebraRrefLab = lazy(() =>
  import('./math/Level4LinearAlgebraTools').then((m) => ({ default: m.MatrixAlgebraRrefLab }))
);
const EigenvaluesEigenvectorsCalculator = lazy(() =>
  import('./math/Level4LinearAlgebraTools').then((m) => ({ default: m.EigenvaluesEigenvectorsCalculator }))
);
const Vector3dDotCrossVisualizer = lazy(() =>
  import('./math/Level4LinearAlgebraTools').then((m) => ({ default: m.Vector3dDotCrossVisualizer }))
);
const VectorCalculusGradDivCurl = lazy(() =>
  import('./math/Level4LinearAlgebraTools').then((m) => ({ default: m.VectorCalculusGradDivCurl }))
);

// Level 5: Probability, Statistics & Data Science (19–23)
const DescriptiveStatisticsBoxplot = lazy(() =>
  import('./math/Level5StatisticsTools').then((m) => ({ default: m.DescriptiveStatisticsBoxplot }))
);
const ProbabilityDistributionExplorer = lazy(() =>
  import('./math/Level5StatisticsTools').then((m) => ({ default: m.ProbabilityDistributionExplorer }))
);
const HypothesisTestingSuite = lazy(() =>
  import('./math/Level5StatisticsTools').then((m) => ({ default: m.HypothesisTestingSuite }))
);
const RegressionCurveFittingAnalyzer = lazy(() =>
  import('./math/Level5StatisticsTools').then((m) => ({ default: m.RegressionCurveFittingAnalyzer }))
);
const CombinatoricsPermutationsCalculator = lazy(() =>
  import('./math/Level5StatisticsTools').then((m) => ({ default: m.CombinatoricsPermutationsCalculator }))
);

// Level 6: Advanced University Mathematics (24–27)
const OdeSlopeFieldRk4Plotter = lazy(() =>
  import('./math/Level6AdvancedMathTools').then((m) => ({ default: m.OdeSlopeFieldRk4Plotter }))
);
const LaplaceFourierTransformStudio = lazy(() =>
  import('./math/Level6AdvancedMathTools').then((m) => ({ default: m.LaplaceFourierTransformStudio }))
);
const NumericalRootFindingLab = lazy(() =>
  import('./math/Level6AdvancedMathTools').then((m) => ({ default: m.NumericalRootFindingLab }))
);
const NumberTheoryModularRsaCalculator = lazy(() =>
  import('./math/Level6AdvancedMathTools').then((m) => ({ default: m.NumberTheoryModularRsaCalculator }))
);

function MathToolFallback() {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center py-14 gap-3 text-orange-600">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading math solver...</span>
    </div>
  );
}

interface MathToolsRouterProps {
  route?: ResolvedMathRoute;
  activeView?: string;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function renderMathToolComponent(slug: MathToolSlug): React.ReactNode {
  switch (slug) {
    case 'scientific-expression-evaluator':
      return <ScientificExpressionEvaluator />;
    case 'quadratic-polynomial-solver':
      return <QuadraticPolynomialSolver />;
    case 'linear-equations-system-solver':
      return <LinearEquationsSystemSolver />;
    case 'fraction-ratio-percentage-solver':
      return <FractionRatioPercentageSolver />;
    case 'logarithm-exponent-simplifier':
      return <LogarithmExponentSimplifier />;
    case 'interactive-unit-circle':
      return <InteractiveUnitCircleExplorer />;
    case 'triangle-law-sines-cosines-solver':
      return <TriangleLawSinesCosinesSolver />;
    case 'conic-sections-visualizer':
      return <ConicSectionsVisualizer />;
    case 'complex-number-polar-converter':
      return <ComplexNumberPolarConverter />;
    case 'symbolic-derivative-calculator':
      return <SymbolicDerivativeCalculator />;
    case 'definite-integral-riemann-plotter':
      return <DefiniteIntegralRiemannPlotter />;
    case 'limits-lhopital-explorer':
      return <LimitsLhopitalExplorer />;
    case 'taylor-maclaurin-series-visualizer':
      return <TaylorMaclaurinSeriesVisualizer />;
    case 'sequence-series-convergence-tester':
      return <SequenceSeriesConvergenceTester />;
    case 'matrix-algebra-rref-lab':
      return <MatrixAlgebraRrefLab />;
    case 'eigenvalues-eigenvectors-calculator':
      return <EigenvaluesEigenvectorsCalculator />;
    case '3d-vector-dot-cross-visualizer':
      return <Vector3dDotCrossVisualizer />;
    case 'vector-calculus-grad-div-curl':
      return <VectorCalculusGradDivCurl />;
    case 'descriptive-statistics-boxplot':
      return <DescriptiveStatisticsBoxplot />;
    case 'probability-distribution-explorer':
      return <ProbabilityDistributionExplorer />;
    case 'hypothesis-testing-suite':
      return <HypothesisTestingSuite />;
    case 'regression-curve-fitting-analyzer':
      return <RegressionCurveFittingAnalyzer />;
    case 'combinatorics-permutations-calculator':
      return <CombinatoricsPermutationsCalculator />;
    case 'ode-slope-field-rk4-plotter':
      return <OdeSlopeFieldRk4Plotter />;
    case 'laplace-fourier-transform-studio':
      return <LaplaceFourierTransformStudio />;
    case 'numerical-root-finding-lab':
      return <NumericalRootFindingLab />;
    case 'number-theory-modular-rsa-calculator':
      return <NumberTheoryModularRsaCalculator />;
  }
}

export default function MathToolsRouter({
  route: passedRoute,
  activeView,
  onNavigate,
  onOpenBecomeTutor,
}: MathToolsRouterProps) {
  const route = passedRoute ?? (activeView ? resolveMathRoute(activeView) : null) ?? { kind: 'hub' as const };
  if (route.kind === 'hub') {
    return (
      <Suspense fallback={<MathToolFallback />}>
        <MathMegaHub onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </Suspense>
    );
  }

  return (
    <MathToolPageLayout
      tool={route.tool}
      onNavigate={onNavigate}
      onOpenBecomeTutor={onOpenBecomeTutor}
    >
      <Suspense fallback={<MathToolFallback />}>
        {renderMathToolComponent(route.tool.slug)}
      </Suspense>
    </MathToolPageLayout>
  );
}
