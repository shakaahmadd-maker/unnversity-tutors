import React from 'react';
import { MathToolSlug, ResolvedMathRoute } from '../../data/mathToolsRegistry';
import MathMegaHub from './MathMegaHub';
import MathToolPageLayout from './MathToolPageLayout';
import {
  FractionRatioPercentageSolver,
  LinearEquationsSystemSolver,
  LogarithmExponentSimplifier,
  QuadraticPolynomialSolver,
  ScientificExpressionEvaluator,
} from './math/Level1AlgebraTools';
import {
  ComplexNumberPolarConverter,
  ConicSectionsVisualizer,
  InteractiveUnitCircleExplorer,
  TriangleLawSinesCosinesSolver,
} from './math/Level2TrigGeometryTools';
import {
  DefiniteIntegralRiemannPlotter,
  LimitsLhopitalExplorer,
  SequenceSeriesConvergenceTester,
  SymbolicDerivativeCalculator,
  TaylorMaclaurinSeriesVisualizer,
} from './math/Level3CalculusTools';
import {
  EigenvaluesEigenvectorsCalculator,
  MatrixAlgebraRrefLab,
  Vector3dDotCrossVisualizer,
  VectorCalculusGradDivCurl,
} from './math/Level4LinearAlgebraTools';
import {
  CombinatoricsPermutationsCalculator,
  DescriptiveStatisticsBoxplot,
  HypothesisTestingSuite,
  ProbabilityDistributionExplorer,
  RegressionCurveFittingAnalyzer,
} from './math/Level5StatisticsTools';
import {
  LaplaceFourierTransformStudio,
  NumberTheoryModularRsaCalculator,
  NumericalRootFindingLab,
  OdeSlopeFieldRk4Plotter,
} from './math/Level6AdvancedMathTools';

interface MathToolsRouterProps {
  route: ResolvedMathRoute;
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function renderMathToolComponent(slug: MathToolSlug): React.ReactNode {
  switch (slug) {
    // Level 1: Algebra (1–5)
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

    // Level 2: Geometry, Trig & Pre-Calc (6–9)
    case 'interactive-unit-circle':
      return <InteractiveUnitCircleExplorer />;
    case 'triangle-law-sines-cosines-solver':
      return <TriangleLawSinesCosinesSolver />;
    case 'conic-sections-visualizer':
      return <ConicSectionsVisualizer />;
    case 'complex-number-polar-converter':
      return <ComplexNumberPolarConverter />;

    // Level 3: Calculus & Real Analysis (10–14)
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

    // Level 4: Linear Algebra & Vector Calculus (15–18)
    case 'matrix-algebra-rref-lab':
      return <MatrixAlgebraRrefLab />;
    case 'eigenvalues-eigenvectors-calculator':
      return <EigenvaluesEigenvectorsCalculator />;
    case '3d-vector-dot-cross-visualizer':
      return <Vector3dDotCrossVisualizer />;
    case 'vector-calculus-grad-div-curl':
      return <VectorCalculusGradDivCurl />;

    // Level 5: Probability, Statistics & Data Science (19–23)
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

    // Level 6: Advanced University Mathematics (24–27)
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
  route,
  onNavigate,
  onOpenBecomeTutor,
}: MathToolsRouterProps) {
  if (route.kind === 'hub') {
    return <MathMegaHub onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />;
  }

  return (
    <MathToolPageLayout
      tool={route.tool}
      onNavigate={onNavigate}
      onOpenBecomeTutor={onOpenBecomeTutor}
    >
      {renderMathToolComponent(route.tool.slug)}
    </MathToolPageLayout>
  );
}
