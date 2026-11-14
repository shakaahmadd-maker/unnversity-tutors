export const MATH_TOOL_SLUGS = new Set([
  'scientific-expression-evaluator',
  'quadratic-polynomial-solver',
  'linear-equations-system-solver',
  'fraction-ratio-percentage-solver',
  'logarithm-exponent-simplifier',
  'interactive-unit-circle',
  'triangle-law-sines-cosines-solver',
  'conic-sections-visualizer',
  'complex-number-polar-converter',
  'symbolic-derivative-calculator',
  'definite-integral-riemann-plotter',
  'limits-lhopital-explorer',
  'taylor-maclaurin-series-visualizer',
  'sequence-series-convergence-tester',
  'matrix-algebra-rref-lab',
  'eigenvalues-eigenvectors-calculator',
  '3d-vector-dot-cross-visualizer',
  'vector-calculus-grad-div-curl',
  'descriptive-statistics-boxplot',
  'probability-distribution-explorer',
  'hypothesis-testing-suite',
  'regression-curve-fitting-analyzer',
  'combinatorics-permutations-calculator',
  'ode-slope-field-rk4-plotter',
  'laplace-fourier-transform-studio',
  'numerical-root-finding-lab',
  'number-theory-modular-rsa-calculator',
]);

export const BIOLOGY_TOOL_SLUGS = new Set([
  'punnett-square-calculator',
  'dna-rna-protein-translator',
  'pcr-master-mix-calculator',
  'hardy-weinberg-calculator',
  'restriction-digest-gel-simulator',
  'crispr-grna-finder',
  'serial-dilution-molarity-calculator',
  'cell-growth-cfu-calculator',
  'microscope-fov-calculator',
  'interactive-cell-explorer',
  'biodiversity-index-calculator',
  'water-potential-osmolarity-calculator',
  'human-physiology-calculators',
  'taxonomic-dichotomous-key-builder',
]);

export const CHEMISTRY_TOOL_SLUGS = new Set([
  'interactive-periodic-table',
  'molar-mass-calculator',
  'chemical-equation-balancer',
  'limiting-reagent-yield-calculator',
  'empirical-molecular-formula-finder',
  'solution-concentration-converter',
  'ph-buffer-calculator',
  'acid-base-titration-plotter',
  'ideal-gas-law-solver',
  'thermochemistry-gibbs-calculator',
  'nernst-electrochemistry-solver',
  'vsepr-molecular-geometry-visualizer',
  'degree-of-unsaturation-ihd-calculator',
  'ir-nmr-spectroscopy-lookup',
  'beer-lambert-calibration-plotter',
  'radioactive-decay-halflife-calculator',
]);

export const STUDENT_TOOL_SLUGS = new Set([
  'merge-pdf',
  'split-pdf',
  'images-to-pdf',
  'whiteboard',
  'graph-builder',
  'graph-theory-network-builder',
  'cv-maker',
  'image-compressor',
  'passport-photo-resizer',
  'ocr-image-to-text',
  'study-translator',
  'citation-generator',
  'cgpa-word-pomodoro',
  'university-grade-converter',
  'academic-paraphraser',
]);

export const STUDENT_TOOLS_COUNT = STUDENT_TOOL_SLUGS.size;

const STUDENT_TOOL_ALIASES: Record<string, string> = {
  'graph-theory': 'graph-theory-network-builder',
  'network-builder': 'graph-theory-network-builder',
  'graph-theory-studio': 'graph-theory-network-builder',
  'grade-converter': 'university-grade-converter',
  'grades-converter': 'university-grade-converter',
  'gpa-converter': 'university-grade-converter',
  'credit-converter': 'university-grade-converter',
  'paraphraser': 'academic-paraphraser',
  'ai-detector': 'academic-paraphraser',
  'ai-pattern-analyzer': 'academic-paraphraser',
  'originality-checker': 'academic-paraphraser',
};

function cleanRouteInput(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^[#/]+/, '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+$/, '');
}

export function matchMathRouteView(input: string): string | null {
  const cleaned = cleanRouteInput(input);
  if (cleaned === 'tools/math') return 'tools/math';
  if (cleaned.startsWith('tools/math/')) {
    const slug = cleaned.slice('tools/math/'.length);
    if (MATH_TOOL_SLUGS.has(slug)) return `tools/math/${slug}`;
  }
  return null;
}

export function matchScienceRouteView(input: string): string | null {
  const cleaned = cleanRouteInput(input);
  if (cleaned === 'tools/biology') return 'tools/biology';
  if (cleaned === 'tools/chemistry') return 'tools/chemistry';
  if (cleaned.startsWith('tools/biology/')) {
    const slug = cleaned.slice('tools/biology/'.length);
    if (BIOLOGY_TOOL_SLUGS.has(slug)) return `tools/biology/${slug}`;
  }
  if (cleaned.startsWith('tools/chemistry/')) {
    const slug = cleaned.slice('tools/chemistry/'.length);
    if (CHEMISTRY_TOOL_SLUGS.has(slug)) return `tools/chemistry/${slug}`;
  }
  return null;
}

export function matchStudentToolSlug(input: string): string | null {
  const cleaned = cleanRouteInput(input);
  if (!cleaned) return null;
  const candidate = cleaned.startsWith('tools/') ? cleaned.slice('tools/'.length) : cleaned;
  if (STUDENT_TOOL_ALIASES[candidate]) return STUDENT_TOOL_ALIASES[candidate];
  if (STUDENT_TOOL_SLUGS.has(candidate)) return candidate;
  return null;
}

export function matchStudentToolRoute(input: string): { slug: string; path: string; viewKey: string } | null {
  const slug = matchStudentToolSlug(input);
  if (!slug) return null;
  return {
    slug,
    path: `/tools/${slug}`,
    viewKey: `tools/${slug}`,
  };
}

export function isSpecializedServiceSlug(input: string): boolean {
  const cleaned = cleanRouteInput(input);
  if (!cleaned) return false;
  return (
    cleaned === 'assignment-guidance' ||
    cleaned.startsWith('assignment-guidance-') ||
    cleaned === 'coursework-tutoring' ||
    cleaned.startsWith('coursework-tutoring-') ||
    cleaned === 'writing-tutoring' ||
    cleaned.startsWith('writing-tutoring-')
  );
}

