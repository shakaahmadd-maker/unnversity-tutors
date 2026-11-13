export type MathLevelId = 1 | 2 | 3 | 4 | 5 | 6;

export type MathToolSlug =
  // Level 1: Foundational & High-School Algebra (1–5)
  | 'scientific-expression-evaluator'
  | 'quadratic-polynomial-solver'
  | 'linear-equations-system-solver'
  | 'fraction-ratio-percentage-solver'
  | 'logarithm-exponent-simplifier'
  // Level 2: Geometry, Trigonometry & Pre-Calculus (6–9)
  | 'interactive-unit-circle'
  | 'triangle-law-sines-cosines-solver'
  | 'conic-sections-visualizer'
  | 'complex-number-polar-converter'
  // Level 3: Calculus & Real Analysis (10–14)
  | 'symbolic-derivative-calculator'
  | 'definite-integral-riemann-plotter'
  | 'limits-lhopital-explorer'
  | 'taylor-maclaurin-series-visualizer'
  | 'sequence-series-convergence-tester'
  // Level 4: Linear Algebra & Vector Calculus (15–18)
  | 'matrix-algebra-rref-lab'
  | 'eigenvalues-eigenvectors-calculator'
  | '3d-vector-dot-cross-visualizer'
  | 'vector-calculus-grad-div-curl'
  // Level 5: Probability, Statistics & Data Science (19–23)
  | 'descriptive-statistics-boxplot'
  | 'probability-distribution-explorer'
  | 'hypothesis-testing-suite'
  | 'regression-curve-fitting-analyzer'
  | 'combinatorics-permutations-calculator'
  // Level 6: Advanced University Mathematics (24–27)
  | 'ode-slope-field-rk4-plotter'
  | 'laplace-fourier-transform-studio'
  | 'numerical-root-finding-lab'
  | 'number-theory-modular-rsa-calculator';

export interface MathDefinitionCard {
  term: string;
  formula: string;
  explanation: string;
}

export interface MathWorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

export interface MathFaqItem {
  question: string;
  answer: string;
}

export interface MathToolItem {
  toolNumber: number;
  slug: MathToolSlug;
  path: string;
  viewKey: string;
  title: string;
  shortTitle: string;
  shortDescription: string;
  whenUsed: string;
  levelId: MathLevelId;
  levelName: string;
  levelShortLabel: string;
  tutorDomain: string;
  formulaBadge: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  definitions: MathDefinitionCard[];
  workedExample: MathWorkedExample;
  commonMistakes: string[];
  faqs: MathFaqItem[];
  relatedSlugs: [MathToolSlug, MathToolSlug, MathToolSlug];
}

export interface MathFeaturedTutor {
  id: string;
  name: string;
  initials: string;
  credential: string;
  institution: string;
  rating: string;
  sessions: string;
  specialties: string[];
  subjectQuery: string;
}

export interface MathLevelMeta {
  id: MathLevelId;
  name: string;
  tabLabel: string;
  footerLabel: string;
  tutorDomain: string;
}

export const MATH_LEVELS: MathLevelMeta[] = [
  {
    id: 1,
    name: 'Level 1: Foundational & High-School Algebra',
    tabLabel: 'Level 1: Algebra',
    footerLabel: 'Algebra & Pre-Calc',
    tutorDomain: 'Algebra',
  },
  {
    id: 2,
    name: 'Level 2: Geometry, Trigonometry & Pre-Calculus',
    tabLabel: 'Level 2: Trig & Geometry',
    footerLabel: 'Trig & Conics',
    tutorDomain: 'Trigonometry & Pre-Calculus',
  },
  {
    id: 3,
    name: 'Level 3: Calculus & Real Analysis',
    tabLabel: 'Level 3: Calculus',
    footerLabel: 'Calculus & Analysis',
    tutorDomain: 'Calculus',
  },
  {
    id: 4,
    name: 'Level 4: Linear Algebra & Vector Calculus',
    tabLabel: 'Level 4: Linear Algebra',
    footerLabel: 'Linear Algebra & Vectors',
    tutorDomain: 'Linear Algebra',
  },
  {
    id: 5,
    name: 'Level 5: Probability, Statistics & Data Science',
    tabLabel: 'Level 5: Statistics',
    footerLabel: 'Statistics & Data Science',
    tutorDomain: 'Statistics',
  },
  {
    id: 6,
    name: 'Level 6: Advanced University Mathematics',
    tabLabel: 'Level 6: Advanced ODEs & Discrete',
    footerLabel: 'ODEs, Numerical & Discrete',
    tutorDomain: 'Differential Equations',
  },
];

export const MATH_FEATURED_TUTORS: MathFeaturedTutor[] = [
  {
    id: 'math-tutor-haris',
    name: 'Dr. Haris Mehmood',
    initials: 'HM',
    credential: 'PhD Applied Mathematics & Differential Equations',
    institution: 'Imperial College London Mentor',
    rating: '5.0',
    sessions: '1,480+ Sessions',
    specialties: ['ODEs & Laplace/Fourier', 'Multivariable Calculus', 'Numerical Methods'],
    subjectQuery: 'Differential Equations',
  },
  {
    id: 'math-tutor-claire',
    name: 'Prof. Claire Bennett',
    initials: 'CB',
    credential: 'MSc Statistics, R & Data Science',
    institution: 'University of Oxford Alumna',
    rating: '5.0',
    sessions: '1,620+ Sessions',
    specialties: ['Hypothesis Testing & ANOVA', 'Linear Regression', 'SPSS, R & Probability'],
    subjectQuery: 'Statistics',
  },
  {
    id: 'math-tutor-kenji',
    name: 'Dr. Kenji Takahashi',
    initials: 'KT',
    credential: 'PhD Pure Mathematics, Calculus & Linear Algebra',
    institution: 'University of Toronto Faculty Mentor',
    rating: '5.0',
    sessions: '1,340+ Sessions',
    specialties: ['Matrix RREF & Eigenvalues', 'Real Analysis & Series', 'Discrete Math & RSA'],
    subjectQuery: 'Linear Algebra',
  },
];

export function getMathTutorBranding(tutorDomain: string) {
  return {
    kicker: 'Verified 1-on-1 University Mathematics & Statistics Faculty',
    headline: `Struggling with ${tutorDomain} Assignments or Exam Prep? Get 1-on-1 Help!`,
    subtext:
      'Work live on an interactive shared whiteboard with PhD & Master’s mentors in Pure & Applied Mathematics, Calculus, Linear Algebra, Statistics, R/SPSS, and Differential Equations.',
    ctaText: 'Book 1-on-1 Math Session',
    ctaView: `subject:${tutorDomain}`,
    tutors: MATH_FEATURED_TUTORS,
  };
}

export const MATH_TOOLS_REGISTRY: MathToolItem[] = [
  // ==========================================================================
  // LEVEL 1: FOUNDATIONAL & HIGH-SCHOOL ALGEBRA (Tools 1–5)
  // ==========================================================================
  {
    toolNumber: 1,
    slug: 'scientific-expression-evaluator',
    path: '/tools/math/scientific-expression-evaluator',
    viewKey: 'tools/math/scientific-expression-evaluator',
    title: 'Scientific & Complex Expression Evaluator',
    shortTitle: 'Scientific & Complex Evaluator',
    shortDescription:
      'Evaluate nested PEMDAS expressions with trigonometric, logarithmic, hyperbolic, factorial, combinatoric, and full a + bi complex arithmetic.',
    whenUsed:
      'Used in foundational STEM labs, physics problem sets, and electrical engineering courses to verify multi-step real and complex-valued expressions without rounding drift.',
    levelId: 1,
    levelName: 'Level 1: Foundational & High-School Algebra',
    levelShortLabel: 'Level 1: Algebra',
    tutorDomain: 'Algebra',
    formulaBadge: 'PEMDAS · z = a + bi',
    seoTitle: 'Free Scientific & Complex Expression Calculator (PEMDAS & a+bi) | University Tutors',
    seoDescription:
      'Evaluate nested algebraic, trigonometric, logarithmic, factorial, and complex (a + bi) expressions locally in your browser with step-by-step operator precedence.',
    seoKeywords: ['scientific calculator online', 'pemdas expression evaluator', 'complex number arithmetic', 'trig log calculator'],
    definitions: [
      {
        term: 'Operator Precedence (PEMDAS / BODMAS)',
        formula: '() → xⁿ, n! → ×, ÷ → +, −',
        explanation:
          'Parentheses and function arguments evaluate innermost-first, followed by right-associative exponentiation and postfix factorials before multiplication/division and addition/subtraction.',
      },
      {
        term: 'Complex Rectangular Arithmetic',
        formula: '(a + bi)(c + di) = (ac − bd) + (ad + bc)i',
        explanation:
          'Complex multiplication expands via FOIL using the fundamental imaginary identity i² = −1, while division multiplies numerator and denominator by the complex conjugate c − di.',
      },
      {
        term: 'Radian vs. Degree Argument Scaling',
        formula: 'θ_rad = θ_deg · (π / 180)',
        explanation:
          'Calculus and physics identities assume radian measure; always verify angle mode before evaluating sin, cos, or tan.',
      },
    ],
    workedExample: {
      problem: 'Evaluate (2·sin(π/6) + ln(e^3)) · 4! / (1 + 3^2) in radians.',
      steps: [
        'Evaluate inner transcendental terms: sin(π/6) = 0.5 and ln(e³) = 3.',
        'Simplify numerator bracket: 2(0.5) + 3 = 1 + 3 = 4.',
        'Compute factorial and denominator power: 4! = 24 and 1 + 3² = 1 + 9 = 10.',
        'Divide final product: (4 × 24) / 10 = 96 / 10 = 9.6.',
      ],
      answer: '9.6 (Exact Fraction: 48/5)',
    },
    commonMistakes: [
      'Writing -3^2 expecting +9: in standard mathematical notation, exponentiation binds tighter than unary negation, so -3^2 = -(3^2) = -9 while (-3)^2 = +9.',
      'Evaluating sin(30) in Radian mode (-0.9880) when 30° (+0.5000) was intended.',
      'Forgetting parentheses around denominator sums such as a / (b + c), which otherwise parses as (a / b) + c.',
    ],
    faqs: [
      {
        question: 'Does this evaluator support implicit multiplication like 2pi or 3sin(x)?',
        answer:
          'Yes. The recursive-descent tokenizer automatically inserts multiplication between coefficients, constants (pi, e, phi), variables, and parenthesized sub-expressions.',
      },
      {
        question: 'How is complex division (a + bi) / (c + di) computed?',
        answer:
          'The solver multiplies top and bottom by the conjugate (c − di), yielding [(ac + bd)/(c² + d²)] + [(bc − ad)/(c² + d²)]i.',
      },
      {
        question: 'What is the difference between ln(x) and log(x)?',
        answer:
          'In this scientific evaluator, ln(x) computes the natural logarithm (base e ≈ 2.71828), log(x) computes the common base-10 logarithm, and log(x, b) computes base-b logarithms.',
      },
    ],
    relatedSlugs: ['quadratic-polynomial-solver', 'logarithm-exponent-simplifier', 'complex-number-polar-converter'],
  },
  {
    toolNumber: 2,
    slug: 'quadratic-polynomial-solver',
    path: '/tools/math/quadratic-polynomial-solver',
    viewKey: 'tools/math/quadratic-polynomial-solver',
    title: 'Quadratic, Cubic & Polynomial Equation Solver',
    shortTitle: 'Quadratic & Polynomial Solver',
    shortDescription:
      'Find exact real and complex conjugate roots for quadratic, cubic, and higher-degree polynomials with discriminant Δ, vertex, axis of symmetry, and factored form.',
    whenUsed:
      'Essential across College Algebra, Pre-Calculus, Physics kinematics, and Differential Equations characteristic polynomials.',
    levelId: 1,
    levelName: 'Level 1: Foundational & High-School Algebra',
    levelShortLabel: 'Level 1: Algebra',
    tutorDomain: 'Algebra',
    formulaBadge: 'Δ = b² − 4ac',
    seoTitle: 'Quadratic, Cubic & Polynomial Root Solver (Real & Complex) | University Tutors',
    seoDescription:
      'Solve quadratic, cubic, and higher-degree polynomial equations step-by-step. Computes discriminant Δ = b² − 4ac, complex roots, vertex, and factored form.',
    seoKeywords: ['quadratic formula calculator', 'cubic equation solver', 'polynomial roots complex', 'discriminant vertex calculator'],
    definitions: [
      {
        term: 'Quadratic Formula & Discriminant',
        formula: 'x = (−b ± √(b² − 4ac)) / (2a)',
        explanation:
          'When Δ > 0 there are 2 distinct real roots; when Δ = 0 there is 1 repeated real root; when Δ < 0 there is a complex conjugate pair α ± βi.',
      },
      {
        term: 'Parabola Vertex & Axis of Symmetry',
        formula: 'h = −b / (2a),  k = f(h)',
        explanation:
          'Every quadratic ax² + bx + c = a(x − h)² + k attains its global minimum (a > 0) or global maximum (a < 0) at (h, k).',
      },
      {
        term: 'Fundamental Theorem of Algebra',
        formula: 'Pₙ(x) = aₙ(x − r₁)(x − r₂)···(x − rₙ)',
        explanation:
          'Every non-zero degree-n polynomial with complex coefficients has exactly n complex roots counted with multiplicity.',
      },
    ],
    workedExample: {
      problem: 'Solve 2x² − 8x + 10 = 0 over the complex numbers and find its vertex.',
      steps: [
        'Identify coefficients: a = 2, b = −8, c = 10.',
        'Compute discriminant: Δ = (−8)² − 4(2)(10) = 64 − 80 = −16 < 0 (complex conjugate roots).',
        'Apply Quadratic Formula: x = (8 ± √(−16)) / 4 = (8 ± 4i) / 4 = 2 ± i.',
        'Find vertex: h = −(−8)/(2·2) = 2, k = 2(2)² − 8(2) + 10 = 2 → Vertex (2, 2).',
      ],
      answer: 'x₁ = 2 + i,  x₂ = 2 − i  ·  Vertex: (2, 2)',
    },
    commonMistakes: [
      'Dividing only the radical √Δ by 2a instead of the entire numerator (−b ± √Δ).',
      'Dropping the negative sign inside b² when b < 0 (note (−b)² is always non-negative!).',
      'Forgetting zero placeholder coefficients (e.g., x³ − 4x + 1 has 0·x²).',
    ],
    faqs: [
      {
        question: 'Why do complex roots of real polynomials always come in conjugate pairs?',
        answer:
          'Because complex conjugation commutes with addition and multiplication; if P(z) = 0 and all coefficients are real, taking conjugates gives P(z̄) = 0.',
      },
      {
        question: 'How does the solver find roots of cubic and quartic equations?',
        answer:
          'Quadratic roots are solved analytically, while cubic and higher-degree polynomials use the complex Durand–Kerner simultaneous Weierstrass iteration to isolate all real and complex roots to machine precision.',
      },
      {
        question: 'How do Vieta’s formulas check my roots?',
        answer:
          'For ax² + bx + c = 0, the sum of roots r₁ + r₂ must equal −b/a and the product r₁·r₂ must equal c/a.',
      },
    ],
    relatedSlugs: ['linear-equations-system-solver', 'numerical-root-finding-lab', 'eigenvalues-eigenvectors-calculator'],
  },
  {
    toolNumber: 3,
    slug: 'linear-equations-system-solver',
    path: '/tools/math/linear-equations-system-solver',
    viewKey: 'tools/math/linear-equations-system-solver',
    title: 'System of Linear Equations Solver (2×2, 3×3, N×N)',
    shortTitle: 'Linear System Solver (N×N)',
    shortDescription:
      'Solve 2×2, 3×3, and 4×4 linear systems via Gaussian Elimination (RREF) and Cramer’s Rule with full consistency classification.',
    whenUsed:
      'Used in Kirchhoff circuit analysis, stoichiometry balancing, statics force equilibrium, and introductory Linear Algebra.',
    levelId: 1,
    levelName: 'Level 1: Foundational & High-School Algebra',
    levelShortLabel: 'Level 1: Algebra',
    tutorDomain: 'Algebra',
    formulaBadge: 'Ax = b · xᵢ = det(Aᵢ)/det(A)',
    seoTitle: 'System of Linear Equations Solver (2x2, 3x3, 4x4) — Gaussian & Cramer | University Tutors',
    seoDescription:
      'Solve 2x2, 3x3, and 4x4 linear equation systems step-by-step using Gaussian elimination (RREF) and Cramer’s Rule. Classifies unique, infinite, or inconsistent systems.',
    seoKeywords: ['system of linear equations solver', 'cramers rule 3x3 calculator', 'gaussian elimination calculator', 'simultaneous equations'],
    definitions: [
      {
        term: 'Rouché–Capelli Consistency Theorem',
        formula: 'rank(A) = rank([A | b])',
        explanation:
          'A linear system Ax = b is consistent iff the coefficient matrix A and augmented matrix [A|b] have equal rank. If rank = n, the solution is unique; if rank < n, infinitely many solutions exist.',
      },
      {
        term: 'Cramer’s Rule',
        formula: 'xᵢ = det(Aᵢ) / det(A),   det(A) ≠ 0',
        explanation:
          'When A is square and invertible, each variable xᵢ equals the determinant of A with column i replaced by b, divided by det(A).',
      },
      {
        term: 'Elementary Row Operations',
        formula: 'Rᵢ ↔ Rⱼ,   k·Rᵢ,   Rᵢ + c·Rⱼ',
        explanation:
          'Swapping rows, scaling a row by k ≠ 0, or adding a multiple of another row preserves the exact solution set of the linear system.',
      },
    ],
    workedExample: {
      problem: 'Solve the 2×2 system: 2x + 3y = 13 and 5x − y = 7.',
      steps: [
        'Compute main determinant: det(A) = (2)(−1) − (3)(5) = −2 − 15 = −17 ≠ 0 (Unique Solution).',
        'Compute Dx replacing column 1 with [13, 7]ᵀ: Dx = (13)(−1) − (3)(7) = −13 − 21 = −34.',
        'Compute Dy replacing column 2 with [13, 7]ᵀ: Dy = (2)(7) − (13)(5) = 14 − 65 = −51.',
        'Apply Cramer’s Rule: x = −34 / −17 = 2, and y = −51 / −17 = 3.',
      ],
      answer: 'x = 2,  y = 3  (Consistent Unique Intersection)',
    },
    commonMistakes: [
      'Attempting Cramer’s Rule when det(A) = 0—zero determinant means either parallel inconsistent planes or infinitely many dependent solutions; use RREF instead!',
      'Arithmetic sign errors when subtracting a scaled row during forward elimination.',
      'Misaligning variables when an equation omits a term (e.g., x + 4z = 9 has coefficient 0 for y).',
    ],
    faqs: [
      {
        question: 'How can I tell no solution apart from infinitely many solutions?',
        answer:
          'In Reduced Row Echelon Form, a row of [0  0 ... 0 | c] with c ≠ 0 proves 0 = c (Inconsistent / No Solution). If no contradictory row appears and rank(A) < n, free variables produce infinitely many solutions.',
      },
      {
        question: 'Why is Gaussian elimination preferred over Cramer’s Rule for large N?',
        answer:
          'Gaussian elimination runs in O(n³) arithmetic operations, whereas cofactor expansion for Cramer’s Rule grows factorially unless determinants are themselves computed via elimination.',
      },
      {
        question: 'What does geometrically happen in a 3×3 system?',
        answer:
          'Each equation represents a plane in ℝ³; a unique solution is the single point (x, y, z) where all three planes intersect.',
      },
    ],
    relatedSlugs: ['matrix-algebra-rref-lab', 'quadratic-polynomial-solver', 'eigenvalues-eigenvectors-calculator'],
  },
  {
    toolNumber: 4,
    slug: 'fraction-ratio-percentage-solver',
    path: '/tools/math/fraction-ratio-percentage-solver',
    viewKey: 'tools/math/fraction-ratio-percentage-solver',
    title: 'Fraction, Ratio, GCD/LCM & Percentage Step-by-Step Solver',
    shortTitle: 'Fractions, GCD/LCM & Ratios',
    shortDescription:
      'Perform exact fraction arithmetic, mixed-number simplification, Euclidean GCD/LCM, prime factorization, and percentage change derivations.',
    whenUsed:
      'Used in quantitative reasoning tests (GRE/GMAT), chemistry molar ratios, financial percentage analysis, and discrete number foundations.',
    levelId: 1,
    levelName: 'Level 1: Foundational & High-School Algebra',
    levelShortLabel: 'Level 1: Algebra',
    tutorDomain: 'Algebra',
    formulaBadge: 'a/b ± c/d · gcd(a,b)·lcm(a,b) = |ab|',
    seoTitle: 'Exact Fraction, Ratio, GCD/LCM & Percentage Step-by-Step Calculator | University Tutors',
    seoDescription:
      'Add, subtract, multiply, and divide fractions in exact lowest terms, compute Euclidean GCD/LCM and prime factorizations, and solve percentage change.',
    seoKeywords: ['fraction step by step calculator', 'gcd lcm prime factorization', 'percentage change solver', 'mixed number simplifier'],
    definitions: [
      {
        term: 'Least Common Denominator Addition',
        formula: 'a/b + c/d = (a·(L/b) + c·(L/d)) / L,  L = lcm(b, d)',
        explanation:
          'Scaling fractions to their Least Common Multiple denominator avoids unnecessarily large intermediate numerators before reducing by gcd.',
      },
      {
        term: 'Fundamental GCD–LCM Identity',
        formula: 'gcd(a, b) × lcm(a, b) = |a · b|',
        explanation:
          'Once gcd(a, b) is found rapidly via Euclid’s remainder algorithm, lcm(a, b) follows immediately by dividing |ab| by gcd(a, b).',
      },
      {
        term: 'Relative Percentage Change',
        formula: '%Δ = ((V_new − V_old) / |V_old|) × 100%',
        explanation:
          'Always divide the difference by the initial reference value |V_old|, never the final value.',
      },
    ],
    workedExample: {
      problem: 'Compute 5/12 + 7/18 in simplest improper and mixed fraction form.',
      steps: [
        'Prime factorize denominators: 12 = 2²·3 and 18 = 2·3², so lcm(12, 18) = 2²·3² = 36.',
        'Convert each fraction to denominator 36: 5/12 = 15/36 and 7/18 = 14/36.',
        'Add numerators: (15 + 14) / 36 = 29 / 36.',
        'Check reducibility: gcd(29, 36) = 1, so 29/36 is already in lowest terms.',
      ],
      answer: '29/36 (≈ 0.8056)',
    },
    commonMistakes: [
      'Adding denominators directly: a/b + c/d ≠ (a + c)/(b + d).',
      'Assuming a +20% increase followed by a −20% decrease returns to 100% (1.20 × 0.80 = 0.96, a net −4% decrease!).',
      'Forgetting to convert mixed numbers like 2 3/4 into improper fractions (11/4) before multiplying or dividing.',
    ],
    faqs: [
      {
        question: 'Why is 1 not considered a prime number in prime factorization?',
        answer:
          'Excluding 1 guarantees uniqueness in the Fundamental Theorem of Arithmetic—otherwise every integer would have infinitely many factorizations (e.g., 6 = 2·3 = 1·2·3 = 1²·2·3).',
      },
      {
        question: 'How fast is the Euclidean GCD algorithm?',
        answer:
          'By Lamé’s Theorem, the number of modulo steps never exceeds 5 times the number of base-10 digits in the smaller integer.',
      },
      {
        question: 'What is the difference between percentage change and percentage difference?',
        answer:
          'Percentage change measures directional change from an initial baseline V_old, whereas symmetric percentage difference divides |A − B| by the average (A + B)/2.',
      },
    ],
    relatedSlugs: ['scientific-expression-evaluator', 'number-theory-modular-rsa-calculator', 'logarithm-exponent-simplifier'],
  },
  {
    toolNumber: 5,
    slug: 'logarithm-exponent-simplifier',
    path: '/tools/math/logarithm-exponent-simplifier',
    viewKey: 'tools/math/logarithm-exponent-simplifier',
    title: 'Logarithm, Exponent & Radical Simplifier',
    shortTitle: 'Log, Exponent & Surd Solver',
    shortDescription:
      'Apply logarithm laws, change-of-base conversions, solve exponential growth equations a^(bx+c) = d, and simplify exact surds √n = k√m.',
    whenUsed:
      'Used in pH/decibel scales, half-life & compound interest models, algorithmic O(n log n) complexity, and exact radical simplification.',
    levelId: 1,
    levelName: 'Level 1: Foundational & High-School Algebra',
    levelShortLabel: 'Level 1: Algebra',
    tutorDomain: 'Algebra',
    formulaBadge: 'log_b(x) = ln(x)/ln(b) · √(a²m) = a√m',
    seoTitle: 'Logarithm Change-of-Base, Exponential Equation & Radical Simplifier | University Tutors',
    seoDescription:
      'Simplify logarithms with change-of-base steps, solve exponential equations a^(bx+c)=d, and reduce square/nth-root radicals into exact surd form.',
    seoKeywords: ['logarithm simplifier', 'change of base calculator', 'radical surd simplifier', 'exponential equation solver'],
    definitions: [
      {
        term: 'Change-of-Base Theorem',
        formula: 'log_b(x) = ln(x) / ln(b) = log₁₀(x) / log₁₀(b)',
        explanation:
          'Allows any positive base b ≠ 1 logarithm to be evaluated in terms of natural logarithms ln, and proves log_b(a)·log_a(b) = 1.',
      },
      {
        term: 'Product, Quotient & Power Log Laws',
        formula: 'log_b(xy) = log_b(x) + log_b(y),   log_b(xᵖ) = p·log_b(x)',
        explanation:
          'Logarithms convert multiplication into addition, division into subtraction, and exponentiation into scalar multiplication.',
      },
      {
        term: 'Exact Radical (Surd) Extraction',
        formula: 'ⁿ√(kⁿ · m) = k · ⁿ√m   (k > 0)',
        explanation:
          'Factoring out the largest perfect nth power kⁿ leaves a square-free (or nth-power-free) radicand m for exact symbolic answers.',
      },
    ],
    workedExample: {
      problem: 'Solve 3^(2x − 1) = 45 for exact and decimal x, and simplify √180.',
      steps: [
        'Take natural log of both sides: (2x − 1)·ln(3) = ln(45).',
        'Divide by ln(3): 2x − 1 = ln(45)/ln(3) = log₃(9·5) = 2 + log₃(5) ≈ 3.46497.',
        'Isolate x: x = (1 + ln(45)/ln(3)) / 2 ≈ 2.2325.',
        'For √180: factor 180 = 36 × 5 = 6² × 5, giving √180 = 6√5.',
      ],
      answer: 'x = (1 + log₃(45))/2 ≈ 2.2325  ·  √180 = 6√5',
    },
    commonMistakes: [
      'Splitting sums inside a logarithm: log(x + y) does NOT equal log(x) + log(y)!',
      'Ignoring domain restrictions: over ℝ, log_b(x) requires x > 0 and b > 0, b ≠ 1.',
      'Confusing (log x)² with log(x²) = 2·log(x).',
    ],
    faqs: [
      {
        question: 'Why is base b = 1 forbidden in log_b(x)?',
        answer:
          'Because 1^y = 1 for every real y, so 1^y = x has no solution when x ≠ 1 and infinitely many solutions when x = 1.',
      },
      {
        question: 'How do I rationalize a denominator with a surd like 1 / (3 − √2)?',
        answer:
          'Multiply numerator and denominator by the conjugate (3 + √2), turning the denominator into the difference of squares 3² − (√2)² = 9 − 2 = 7.',
      },
      {
        question: 'Where does base e come from in natural logarithms?',
        answer:
          'Euler’s constant e = lim_{n→∞}(1 + 1/n)ⁿ ≈ 2.7182818 is the unique base for which d/dx(eˣ) = eˣ and d/dx(ln x) = 1/x with unit proportionality constant.',
      },
    ],
    relatedSlugs: ['scientific-expression-evaluator', 'symbolic-derivative-calculator', 'quadratic-polynomial-solver'],
  },

  // ==========================================================================
  // LEVEL 2: GEOMETRY, TRIGONOMETRY & PRE-CALCULUS (Tools 6–9)
  // ==========================================================================
  {
    toolNumber: 6,
    slug: 'interactive-unit-circle',
    path: '/tools/math/interactive-unit-circle',
    viewKey: 'tools/math/interactive-unit-circle',
    title: 'Interactive Unit Circle & Trigonometry Explorer',
    shortTitle: 'Interactive Unit Circle',
    shortDescription:
      'Drag around the unit circle x² + y² = 1 to inspect exact and decimal sin, cos, tan, csc, sec, cot, quadrant signs, reference angles, and wave projections.',
    whenUsed:
      'Used in Pre-Calculus, Calculus, Harmonic Motion Physics, and AC Phasor Analysis to master trigonometric values and periodic symmetries.',
    levelId: 2,
    levelName: 'Level 2: Geometry, Trigonometry & Pre-Calculus',
    levelShortLabel: 'Level 2: Trig & Geometry',
    tutorDomain: 'Trigonometry & Pre-Calculus',
    formulaBadge: 'cos²θ + sin²θ = 1',
    seoTitle: 'Interactive Unit Circle Explorer — Sin, Cos, Tan, Radians & Reference Angles | University Tutors',
    seoDescription:
      'Explore the interactive Unit Circle in degrees and radians. View live sin, cos, tan, csc, sec, cot values, ASTC quadrant signs, reference angles, and sine waves.',
    seoKeywords: ['interactive unit circle', 'unit circle sin cos tan', 'reference angle calculator', 'radians to degrees trig'],
    definitions: [
      {
        term: 'Unit Circle Coordinate Definition',
        formula: 'P(θ) = (cos θ, sin θ),   x² + y² = 1',
        explanation:
          'For any angle θ measured counterclockwise from the positive x-axis, cos θ is the horizontal projection x and sin θ is the vertical projection y.',
      },
      {
        term: 'Pythagorean & Reciprocal Identities',
        formula: '1 + tan²θ = sec²θ,   1 + cot²θ = csc²θ',
        explanation:
          'Dividing cos²θ + sin²θ = 1 by cos²θ or sin²θ yields the secant-tangent and cosecant-cotangent identities ubiquitous in trig substitution integrals.',
      },
      {
        term: 'Reference Angle α',
        formula: 'α ∈ [0°, 90°] to nearest horizontal x-axis',
        explanation:
          'Every trig ratio at θ has the same magnitude as at its acute reference angle α, with sign determined by the ASTC quadrant rule.',
      },
    ],
    workedExample: {
      problem: 'Find exact sin, cos, tan, and reference angle for θ = 210° (7π/6 rad).',
      steps: [
        'Locate quadrant: 180° < 210° < 270°, so θ lies in Quadrant III (Tangent positive, Sine & Cosine negative).',
        'Compute reference angle to 180° axis: α = 210° − 180° = 30° (π/6).',
        'Recall 30° special values: sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = √3/3.',
        'Apply Quadrant III signs: sin(210°) = −1/2, cos(210°) = −√3/2, tan(210°) = +√3/3.',
      ],
      answer: 'sin = −1/2,  cos = −√3/2,  tan = √3/3  (Ref Angle α = 30°)',
    },
    commonMistakes: [
      'Measuring the reference angle against the vertical y-axis (90°/270°) instead of ALWAYS measuring to the horizontal x-axis (0°/180°/360°).',
      'Confusing sec θ = 1/cos θ with csc θ = 1/sin θ (remember: the co-prefix pairs switch!).',
      'Evaluating tan(90°) or tan(270°) as 0 when cos θ = 0 actually makes tan θ undefined (vertical asymptote).',
    ],
    faqs: [
      {
        question: 'What is the easy trick to memorize special angles 0°, 30°, 45°, 60°, 90°?',
        answer:
          'Write √0/2, √1/2, √2/2, √3/2, √4/2 for sin θ from 0° to 90°, which simplifies to 0, 1/2, √2/2, √3/2, 1—and reverse the order for cos θ!',
      },
      {
        question: 'Why are radians natural in Calculus?',
        answer:
          'Arc length on a unit circle equals s = θ ONLY in radians, which makes lim_{θ→0} sin(θ)/θ = 1 and d/dθ(sin θ) = cos θ without an awkward π/180 factor.',
      },
      {
        question: 'What does ASTC ("All Students Take Calculus") mean?',
        answer:
          'Going counterclockwise from Quadrant I to IV: All trig functions are positive in QI, Sine/Csc in QII, Tangent/Cot in QIII, and Cosine/Sec in QIV.',
      },
    ],
    relatedSlugs: ['triangle-law-sines-cosines-solver', 'complex-number-polar-converter', 'laplace-fourier-transform-studio'],
  },
  {
    toolNumber: 7,
    slug: 'triangle-law-sines-cosines-solver',
    path: '/tools/math/triangle-law-sines-cosines-solver',
    viewKey: 'tools/math/triangle-law-sines-cosines-solver',
    title: 'Triangle Solver (Law of Sines & Cosines)',
    shortTitle: 'Triangle Law of Sines/Cosines',
    shortDescription:
      'Solve SSS, SAS, ASA, and AAS oblique triangles with live scaled SVG geometry, Heron’s area, perimeter, inradius r, and circumradius R.',
    whenUsed:
      'Used in surveying, statics force vector triangles, navigation, and Pre-Calculus trigonometry exams.',
    levelId: 2,
    levelName: 'Level 2: Geometry, Trigonometry & Pre-Calculus',
    levelShortLabel: 'Level 2: Trig & Geometry',
    tutorDomain: 'Trigonometry & Pre-Calculus',
    formulaBadge: 'c² = a² + b² − 2ab·cos(C)',
    seoTitle: 'Triangle Solver — Law of Sines, Law of Cosines & Heron’s Area | University Tutors',
    seoDescription:
      'Solve SSS, SAS, ASA, and AAS triangles step-by-step using the Law of Cosines and Law of Sines. Computes angles, sides, Heron’s area, inradius, and circumradius.',
    seoKeywords: ['law of cosines calculator', 'law of sines triangle solver', 'sss sas asa triangle calculator', 'herons formula area'],
    definitions: [
      {
        term: 'Law of Cosines (SSS & SAS)',
        formula: 'c² = a² + b² − 2ab·cos(C)',
        explanation:
          'Generalizes the Pythagorean Theorem (C = 90° ⇒ cos C = 0) to any oblique triangle when given three sides (SSS) or two sides and their included angle (SAS).',
      },
      {
        term: 'Extended Law of Sines (ASA, AAS & Circumradius)',
        formula: 'a / sin(A) = b / sin(B) = c / sin(C) = 2R',
        explanation:
          'Relates each side to the sine of its opposite angle, where R is the radius of the unique circumscribed circle passing through all three vertices.',
      },
      {
        term: 'Heron’s Area & Inradius',
        formula: 'Area = √(s(s − a)(s − b)(s − c)),   r = Area / s',
        explanation:
          'Using semiperimeter s = (a + b + c)/2, Heron’s formula computes exact area purely from side lengths, and r gives the inscribed circle radius.',
      },
    ],
    workedExample: {
      problem: 'Solve an SAS triangle with a = 7, b = 10, and included angle C = 60°.',
      steps: [
        'Apply Law of Cosines: c² = 7² + 10² − 2(7)(10)·cos(60°) = 49 + 100 − 140(0.5) = 79.',
        'Take square root: c = √79 ≈ 8.8882.',
        'Find angle A via Law of Cosines: cos(A) = (10² + 79 − 49)/(2·10·√79) = 130/(20√79) ≈ 0.7313 → A ≈ 43.00°.',
        'Compute remaining angle: B = 180° − 60° − 43.00° = 77.00°; Area = ½(7)(10)sin(60°) ≈ 30.31.',
      ],
      answer: 'c ≈ 8.888,  A ≈ 43.00°,  B ≈ 77.00°,  Area ≈ 30.31',
    },
    commonMistakes: [
      'Violating the Triangle Inequality (a + b > c): sides like 2, 3, 7 cannot form a closed triangle!',
      'Using inverse sine arcsin() to find the largest angle in an SAS triangle—arcsin only returns acute angles ≤ 90° and can miss obtuse angles! Use Law of Cosines for the largest side instead.',
      'Forgetting the SSA ambiguous case where two distinct triangles (one acute, one obtuse) may exist.',
    ],
    faqs: [
      {
        question: 'When should I start with the Law of Cosines vs. Law of Sines?',
        answer:
          'Use Law of Cosines when you have SSS (three sides) or SAS (two sides and the included angle). Use Law of Sines when you have an angle-side opposite pair (ASA, AAS, or SSA).',
      },
      {
        question: 'Why solve for the largest angle first in an SSS triangle?',
        answer:
          'An oblique triangle can have at most one obtuse angle (> 90°), which must lie opposite the longest side. Since arccos() uniquely distinguishes acute (cos > 0) from obtuse (cos < 0) on [0°, 180°], finding it first eliminates ambiguity.',
      },
      {
        question: 'How is triangle area computed without height?',
        answer:
          'Either via ½·a·b·sin(C) using two sides and their included angle, or via Heron’s semiperimeter formula √(s(s−a)(s−b)(s−c)).',
      },
    ],
    relatedSlugs: ['interactive-unit-circle', 'conic-sections-visualizer', '3d-vector-dot-cross-visualizer'],
  },
  {
    toolNumber: 8,
    slug: 'conic-sections-visualizer',
    path: '/tools/math/conic-sections-visualizer',
    viewKey: 'tools/math/conic-sections-visualizer',
    title: '2D Coordinate Geometry & Conic Sections Visualizer',
    shortTitle: 'Conic Sections Visualizer',
    shortDescription:
      'Plot circles, ellipses, parabolas, and hyperbolas on an interactive Cartesian plane with foci, vertices, directrix, eccentricity e, and asymptotes.',
    whenUsed:
      'Used in Analytic Geometry, Keplerian Orbital Mechanics, Optics (parabolic/hyperbolic mirrors), and Multivariable Calculus level curves.',
    levelId: 2,
    levelName: 'Level 2: Geometry, Trigonometry & Pre-Calculus',
    levelShortLabel: 'Level 2: Trig & Geometry',
    tutorDomain: 'Trigonometry & Pre-Calculus',
    formulaBadge: '(x−h)²/a² ± (y−k)²/b² = 1',
    seoTitle: 'Conic Sections Visualizer — Ellipse, Hyperbola, Parabola & Circle Plotter | University Tutors',
    seoDescription:
      'Plot ellipses, hyperbolas, parabolas, and circles interactively. Calculates foci, vertices, eccentricity e, directrix, latus rectum, and asymptote equations.',
    seoKeywords: ['conic sections calculator', 'ellipse foci eccentricity', 'hyperbola asymptotes plotter', 'parabola focus directrix'],
    definitions: [
      {
        term: 'Eccentricity Classification',
        formula: 'e = 0 (Circle), 0 < e < 1 (Ellipse), e = 1 (Parabola), e > 1 (Hyperbola)',
        explanation:
          'Eccentricity e = c/a measures focal elongation and governs whether an orbital trajectory is closed (elliptical) or unbound (parabolic/hyperbolic).',
      },
      {
        term: 'Ellipse vs. Hyperbola Focal Relation',
        formula: 'Ellipse: c² = |a² − b²|   ·   Hyperbola: c² = a² + b²',
        explanation:
          'In an ellipse, foci lie inside the vertices (c < a); in a hyperbola, foci lie beyond the transverse vertices (c > a).',
      },
      {
        term: 'Parabola Focus–Directrix Property',
        formula: '(x − h)² = 4p(y − k)  ⇒  Focus (h, k + p),  Directrix y = k − p',
        explanation:
          'Every point on a parabola is equidistant from its focus and directrix, causing parallel rays to reflect directly through the focus.',
      },
    ],
    workedExample: {
      problem: 'Find the vertices, foci, and eccentricity of the ellipse (x − 1)²/25 + (y + 2)²/9 = 1.',
      steps: [
        'Identify center (h, k) = (1, −2) and semi-axes a = √25 = 5 (horizontal major axis), b = √9 = 3.',
        'Compute focal distance: c = √(a² − b²) = √(25 − 9) = √16 = 4.',
        'Locate major vertices (h ± a, k) = (6, −2) and (−4, −2); foci (h ± c, k) = (5, −2) and (−3, −2).',
        'Calculate eccentricity: e = c / a = 4 / 5 = 0.80.',
      ],
      answer: 'Center (1, −2),  Foci (5, −2) & (−3, −2),  e = 0.80',
    },
    commonMistakes: [
      'Using c² = a² + b² for an ellipse instead of c² = a² − b² (for ellipses, c must be smaller than the major semi-axis!).',
      'Swapping hyperbola asymptote slopes: horizontal hyperbola (x−h)²/a² − (y−k)²/b² = 1 has slope ±b/a (rise over run!).',
      'Reading (x + 3)² as h = +3 instead of h = −3.',
    ],
    faqs: [
      {
        question: 'How does the general discriminant B² − 4AC classify rotated conics?',
        answer:
          'For Ax² + Bxy + Cy² + Dx + Ey + F = 0 (non-degenerate): B² − 4AC < 0 is an ellipse (circle if A=C and B=0), B² − 4AC = 0 is a parabola, and B² − 4AC > 0 is a hyperbola.',
      },
      {
        question: 'What is the latus rectum of a conic section?',
        answer:
          'The chord passing through a focus perpendicular to the major/principal axis: length |4p| for a parabola and 2b²/a for an ellipse or hyperbola.',
      },
      {
        question: 'Where do hyperbolas appear in real engineering?',
        answer:
          'Time-difference-of-arrival (TDOA) GPS/radio navigation, Cassegrain telescope secondary mirrors, and nuclear cooling tower hyperboloid shells.',
      },
    ],
    relatedSlugs: ['interactive-unit-circle', 'quadratic-polynomial-solver', 'definite-integral-riemann-plotter'],
  },
  {
    toolNumber: 9,
    slug: 'complex-number-polar-converter',
    path: '/tools/math/complex-number-polar-converter',
    viewKey: 'tools/math/complex-number-polar-converter',
    title: 'Complex Number & Polar/Euler Form Converter',
    shortTitle: 'Complex Polar & De Moivre',
    shortDescription:
      'Convert between rectangular a + bi, polar r∠θ, and Euler re^(iθ) forms, and compute De Moivre powers zⁿ and all n-th roots on the Argand plane.',
    whenUsed:
      'Used in AC Circuit Phasors, Quantum Mechanics wavefunctions, Signal Processing, and Complex Analysis.',
    levelId: 2,
    levelName: 'Level 2: Geometry, Trigonometry & Pre-Calculus',
    levelShortLabel: 'Level 2: Trig & Geometry',
    tutorDomain: 'Trigonometry & Pre-Calculus',
    formulaBadge: 'z = a + bi = r·e^(iθ)',
    seoTitle: 'Complex Number Polar, Euler & De Moivre’s Theorem Calculator | University Tutors',
    seoDescription:
      'Convert complex numbers between rectangular (a+bi), polar (r∠θ), and Euler (re^iθ) forms, and plot De Moivre powers and n-th roots on an interactive Argand diagram.',
    seoKeywords: ['complex number polar converter', 'euler formula calculator', 'de moivres theorem nth roots', 'argand diagram plotter'],
    definitions: [
      {
        term: 'Modulus & Principal Argument',
        formula: 'r = |z| = √(a² + b²),   θ = atan2(b, a) ∈ (−π, π]',
        explanation:
          'atan2(b, a) preserves the exact quadrant of (a, b) in the complex plane, unlike arctan(b/a) alone.',
      },
      {
        term: 'Euler’s Formula',
        formula: 'e^(iθ) = cos θ + i·sin θ',
        explanation:
          'Links complex exponentials directly to unit-circle rotations; setting θ = π yields Euler’s famous identity e^(iπ) + 1 = 0.',
      },
      {
        term: 'De Moivre’s Powers & n-th Roots',
        formula: 'zⁿ = rⁿ e^(inθ),   zₖ = r^(1/n) e^(i(θ + 2πk)/n),  k = 0..n−1',
        explanation:
          'The n distinct n-th roots of z lie equally spaced by 2π/n radians as vertices of a regular n-gon on a circle of radius r^(1/n).',
      },
    ],
    workedExample: {
      problem: 'Convert z = 1 + i√3 to Euler form and compute z⁶ via De Moivre’s Theorem.',
      steps: [
        'Compute modulus: r = √(1² + (√3)²) = √(1 + 3) = 2.',
        'Find principal angle in QI: θ = atan2(√3, 1) = π/3 rad (60°), so z = 2·e^(iπ/3).',
        'Apply De Moivre’s Theorem for n = 6: z⁶ = 2⁶ · e^(i·6·π/3) = 64 · e^(i·2π).',
        'Evaluate: cos(2π) + i·sin(2π) = 1 + 0i, giving z⁶ = 64.',
      ],
      answer: 'Polar/Euler: 2·e^(iπ/3) (2∠60°)  ·  z⁶ = 64',
    },
    commonMistakes: [
      'Using arctan(b/a) when a < 0 without adding/subtracting π (180°), placing Quadrant II/III numbers into Quadrant IV/I!',
      'Returning only one root for z^(1/n) instead of all n roots spaced by 360°/n.',
      'Squaring modulus incorrectly by writing √(a² + (bi)²) = √(a² − b²) instead of √(a² + b²) where b is real.',
    ],
    faqs: [
      {
        question: 'Why do electrical engineers write j instead of i?',
        answer:
          'Because i denotes electric current in circuit analysis, electrical engineering adopts j = √(−1) so phasors like V = Vₘ∠θ never clash with current i(t).',
      },
      {
        question: 'Why do the n-th roots of any complex number sum to zero (for n ≥ 2)?',
        answer:
          'They are the roots of wⁿ − z = 0, in which the w^(n−1) coefficient is 0; by Vieta’s sum-of-roots formula, their vector sum is identically 0!',
      },
      {
        question: 'How does multiplying by i affect a vector on the Argand plane?',
        answer:
          'Since i = 1·e^(iπ/2), multiplying any complex number z by i rotates its position vector 90° counterclockwise without changing its length.',
      },
    ],
    relatedSlugs: ['scientific-expression-evaluator', 'interactive-unit-circle', 'laplace-fourier-transform-studio'],
  },

  // ==========================================================================
  // LEVEL 3: CALCULUS & REAL ANALYSIS (Tools 10–14)
  // ==========================================================================
  {
    toolNumber: 10,
    slug: 'symbolic-derivative-calculator',
    path: '/tools/math/symbolic-derivative-calculator',
    viewKey: 'tools/math/symbolic-derivative-calculator',
    title: 'Symbolic Derivative & Tangent Line Calculator',
    shortTitle: 'Symbolic Derivative & Tangent',
    shortDescription:
      'Compute symbolic first, second, and third derivatives f′(x), f″(x), f‴(x), tangent and normal lines at x = a, and plot f(x) alongside its derivative.',
    whenUsed:
      'Used in Calculus I–III for instantaneous rates of change, curve concavity, tangent linearizations, and optimization.',
    levelId: 3,
    levelName: 'Level 3: Calculus & Real Analysis',
    levelShortLabel: 'Level 3: Calculus',
    tutorDomain: 'Calculus',
    formulaBadge: 'f′(a) = lim_{h→0} [f(a+h)−f(a)]/h',
    seoTitle: 'Symbolic Derivative & Tangent Line Calculator (f′, f″ & Graph) | University Tutors',
    seoDescription:
      'Differentiate algebraic, trigonometric, exponential, and logarithmic functions symbolically. Finds f′(x), f″(x), tangent & normal line equations at x = a, and plots curves.',
    seoKeywords: ['symbolic derivative calculator', 'tangent line equation calculator', 'second derivative concavity', 'chain product quotient rule'],
    definitions: [
      {
        term: 'Chain, Product & Quotient Rules',
        formula: '(fg)′ = f′g + fg′,   (f/g)′ = (f′g − fg′)/g²,   [f(g(x))]′ = f′(g(x))·g′(x)',
        explanation:
          'Every elementary composite function differentiates systematically by combining linearity with the product, quotient, and chain rules.',
      },
      {
        term: 'Tangent & Normal Lines at x = a',
        formula: 'y_tan = f(a) + f′(a)(x − a),   y_norm = f(a) − [1/f′(a)](x − a)',
        explanation:
          'The tangent line provides the best local linear approximation L(x) near x = a, while the normal line is perpendicular to the curve.',
      },
      {
        term: 'Second Derivative Concavity Test',
        formula: 'f″(a) > 0 ⇒ Concave Up (Local Min if f′(a)=0)',
        explanation:
          'The sign of f″(x) measures how the slope f′(x) bends; points where f″ changes sign are inflection points.',
      },
    ],
    workedExample: {
      problem: 'Find f′(x) and the tangent line to f(x) = x³ − 4x + 1 at a = 2.',
      steps: [
        'Differentiate term-by-term using the Power Rule: f′(x) = 3x² − 4 (and f″(x) = 6x).',
        'Evaluate point on curve: f(2) = 2³ − 4(2) + 1 = 8 − 8 + 1 = 1.',
        'Evaluate instantaneous slope: m = f′(2) = 3(2)² − 4 = 12 − 4 = 8.',
        'Write tangent line: y − 1 = 8(x − 2)  ⇒  y = 8x − 15.',
      ],
      answer: 'f′(x) = 3x² − 4  ·  Tangent at x = 2: y = 8x − 15',
    },
    commonMistakes: [
      'Omitting the inner derivative g′(x) in the Chain Rule, e.g., writing d/dx[sin(3x²)] = cos(3x²) instead of 6x·cos(3x²).',
      'Reversing numerator subtraction in the Quotient Rule—always start with (Low · dHigh − High · dLow) / Low².',
      'Substituting x into f′(x) and writing y = f′(x)(x − a) + f(a) instead of evaluating the constant number m = f′(a) first!',
    ],
    faqs: [
      {
        question: 'Can a function be continuous at x = a without being differentiable there?',
        answer:
          'Yes! Sharp corners like f(x) = |x| at x = 0 or vertical tangents like x^(1/3) at x = 0 are continuous everywhere, yet left and right difference quotients disagree or blow up.',
      },
      {
        question: 'How does logarithmic differentiation simplify f(x)^g(x)?',
        answer:
          'Writing y = f(x)^g(x) ⇒ ln y = g(x)·ln f(x) and differentiating implicitly yields y′ = f(x)^g(x) · [g′(x)ln f(x) + g(x)f′(x)/f(x)].',
      },
      {
        question: 'What is the normal line used for in physics and graphics?',
        answer:
          'Surface normals determine reflection/refraction angles (Snell’s Law), contact normal forces in mechanics, and Phong/PBR lighting in 3D rendering.',
      },
    ],
    relatedSlugs: ['definite-integral-riemann-plotter', 'limits-lhopital-explorer', 'taylor-maclaurin-series-visualizer'],
  },
  {
    toolNumber: 11,
    slug: 'definite-integral-riemann-plotter',
    path: '/tools/math/definite-integral-riemann-plotter',
    viewKey: 'tools/math/definite-integral-riemann-plotter',
    title: 'Definite Integral & Riemann Sum Area Plotter',
    shortTitle: 'Definite Integral & Riemann Sums',
    shortDescription:
      'Visualize ∫_a^b f(x) dx with shaded subintervals and compare Left, Right, Midpoint, Trapezoidal, and Simpson’s 1/3 Rule approximations.',
    whenUsed:
      'Used in Calculus I & II, Numerical Analysis, Work/Energy Integrals, and Probability Continuous Density Integration.',
    levelId: 3,
    levelName: 'Level 3: Calculus & Real Analysis',
    levelShortLabel: 'Level 3: Calculus',
    tutorDomain: 'Calculus',
    formulaBadge: '∫_a^b f(x) dx = lim_{n→∞} Σ f(xᵢ*)Δx',
    seoTitle: 'Definite Integral & Riemann Sum Plotter (Left, Midpoint, Trapezoid, Simpson) | University Tutors',
    seoDescription:
      'Plot Riemann rectangles and trapezoids for any function f(x) on [a, b]. Compares Left, Right, Midpoint, Trapezoidal, and Simpson’s Rule against exact integration.',
    seoKeywords: ['riemann sum calculator plotter', 'definite integral area under curve', 'simpsons rule trapezoidal calculator', 'midpoint riemann sum'],
    definitions: [
      {
        term: 'Fundamental Theorem of Calculus (Part II)',
        formula: '∫_a^b f(x) dx = F(b) − F(a),   where F′(x) = f(x)',
        explanation:
          'Connects signed area accumulation directly to antiderivatives whenever f is continuous on [a, b].',
      },
      {
        term: 'Trapezoidal Rule (O(h²) Error)',
        formula: 'Tₙ = (Δx / 2)[f(x₀) + 2f(x₁) + ··· + 2f(xₙ₋₁) + f(xₙ)]',
        explanation:
          'Equals the average of Left and Right Riemann sums and approximates f(x) piecewise linearly across n subintervals of width Δx = (b − a)/n.',
      },
      {
        term: 'Simpson’s 1/3 Rule (O(h⁴) Error, Even n)',
        formula: 'Sₙ = (Δx / 3)[f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ··· + f(xₙ)]',
        explanation:
          'Fits quadratic parabolas across pairs of subintervals (requiring even n) and integrates cubics with zero truncation error!',
      },
    ],
    workedExample: {
      problem: 'Approximate ∫₀² (x² + 1) dx with n = 4 subintervals using Simpson’s Rule and verify exactly.',
      steps: [
        'Compute step width: Δx = (2 − 0)/4 = 0.5; grid points are x = 0, 0.5, 1.0, 1.5, 2.0.',
        'Evaluate f(xᵢ): f(0)=1, f(0.5)=1.25, f(1)=2, f(1.5)=3.25, f(2)=5.',
        'Apply Simpson 1-4-2-4-1 weights: S₄ = (0.5/3)[1 + 4(1.25) + 2(2) + 4(3.25) + 5] = (1/6)[28] = 14/3 ≈ 4.6667.',
        'Exact FTC check: [x³/3 + x]₀² = 8/3 + 2 = 14/3 (0.0000 error!).',
      ],
      answer: '14/3 ≈ 4.6667 (Exact Agreement)',
    },
    commonMistakes: [
      'Applying Simpson’s 1/3 Rule with an odd number of subintervals n (n must be even!).',
      'Confusing signed net integral ∫_a^b f(x) dx with total geometric area ∫_a^b |f(x)| dx when f(x) dips below the x-axis.',
      'Forgetting interior coefficient weights (2,2,...,2 for Trapezoidal vs. 4,2,4,...,4 for Simpson’s).',
    ],
    faqs: [
      {
        question: 'When does a Left Riemann Sum overestimate vs. underestimate ∫_a^b f(x) dx?',
        answer:
          'Whether Left over- or under-estimates depends on monotonicity: if f(x) is strictly increasing on [a, b], Left underestimates and Right overestimates; if strictly decreasing, the reverse holds.',
      },
      {
        question: 'What determines whether Trapezoidal or Midpoint is more accurate?',
        answer:
          'Both are O(Δx²), but Midpoint error is roughly half the magnitude of Trapezoidal error and has the opposite sign for functions of fixed concavity!',
      },
      {
        question: 'Why do functions like e^(−x²) require numerical integration?',
        answer:
          'By Liouville’s theorem, e^(−x²) has no closed-form antiderivative in terms of elementary functions, making Simpson’s Rule and Gauss quadrature essential in statistics.',
      },
    ],
    relatedSlugs: ['symbolic-derivative-calculator', 'taylor-maclaurin-series-visualizer', 'probability-distribution-explorer'],
  },
  {
    toolNumber: 12,
    slug: 'limits-lhopital-explorer',
    path: '/tools/math/limits-lhopital-explorer',
    viewKey: 'tools/math/limits-lhopital-explorer',
    title: 'Limits & L’Hôpital’s Rule Explorer',
    shortTitle: 'Limits & L’Hôpital Explorer',
    shortDescription:
      'Evaluate left-hand, right-hand, and two-sided limits lim_{x→a} f(x), classify removable/jump/infinite discontinuities, and resolve 0/0 indeterminate forms.',
    whenUsed:
      'Used in Calculus I & Real Analysis to test continuity, horizontal/vertical asymptotes, and indeterminate quotient limits.',
    levelId: 3,
    levelName: 'Level 3: Calculus & Real Analysis',
    levelShortLabel: 'Level 3: Calculus',
    tutorDomain: 'Calculus',
    formulaBadge: 'lim_{x→a} f(x)/g(x) = lim_{x→a} f′(x)/g′(x)',
    seoTitle: 'Limits & L’Hôpital’s Rule Calculator — Left/Right Limits & Asymptotes | University Tutors',
    seoDescription:
      'Evaluate one-sided and two-sided limits lim_{x->a} f(x), inspect numerical approach tables, apply L’Hôpital’s Rule on 0/0 forms, and classify discontinuities.',
    seoKeywords: ['limit calculator step by step', 'lhopitals rule solver', 'one sided limits discontinuity', 'indeterminate form 0/0'],
    definitions: [
      {
        term: 'Existence of a Two-Sided Limit',
        formula: 'lim_{x→a} f(x) = L  ⇔  lim_{x→a⁻} f(x) = lim_{x→a⁺} f(x) = L',
        explanation:
          'A two-sided limit exists if and only if both one-sided limits exist as finite real numbers and agree—independent of whether f(a) itself is defined!',
      },
      {
        term: 'L’Hôpital’s Rule (0/0 or ±∞/±∞)',
        formula: 'lim_{x→a} [f(x) / g(x)] = lim_{x→a} [f′(x) / g′(x)]',
        explanation:
          'When f(x)/g(x) produces 0/0 or ±∞/±∞ and g′(x) ≠ 0 near a, differentiate numerator and denominator SEPARATELY (not the quotient rule!).',
      },
      {
        term: 'Continuity at x = a',
        formula: 'lim_{x→a} f(x) = f(a)',
        explanation:
          'Requires three conditions simultaneously: f(a) is defined, lim_{x→a} f(x) exists, and the two values are equal.',
      },
    ],
    workedExample: {
      problem: 'Evaluate lim_{x→0} (e^(2x) − 1 − 2x) / x².',
      steps: [
        'Direct substitution at x = 0 gives (1 − 1 − 0) / 0 = 0/0 (indeterminate form).',
        'Apply L’Hôpital’s Rule #1: differentiate top and bottom separately → lim_{x→0} (2e^(2x) − 2) / (2x), still 0/0!',
        'Apply L’Hôpital’s Rule #2: differentiate top and bottom again → lim_{x→0} (4e^(2x)) / 2.',
        'Substitute x = 0: 4e⁰ / 2 = 4 / 2 = 2.',
      ],
      answer: '2 (Removable Singularity at x = 0)',
    },
    commonMistakes: [
      'Applying L’Hôpital’s Rule when the fraction is NOT 0/0 or ∞/∞ (e.g., applying it to cos(x)/(x+1) as x→0 gives 0 instead of the true limit 1!).',
      'Applying the Quotient Rule (f′g − fg′)/g² instead of differentiating f′(x) and g′(x) separately.',
      'Assuming oscillating functions like sin(1/x) as x→0 approach 0 (it oscillates infinitely between −1 and +1, so DNE; whereas x·sin(1/x) → 0 by Squeeze Theorem).',
    ],
    faqs: [
      {
        question: 'How do I apply L’Hôpital’s Rule to 0·∞ or 1^∞ indeterminate forms?',
        answer:
          'Rewrite products f·g as f/(1/g) to get 0/0 or ∞/∞, and take natural logs y = f(x)^g(x) ⇒ ln y = g(x)·ln f(x) for exponential forms like (1 + 1/x)^x.',
      },
      {
        question: 'What is the difference between a removable and a jump discontinuity?',
        answer:
          'At a removable ("hole") discontinuity, left and right limits are equal and finite (L⁻ = L⁺ ≠ f(a)). At a jump discontinuity, L⁻ and L⁺ are both finite but unequal.',
      },
      {
        question: 'Why shouldn’t I rely only on plugging in x = 0.001 on a calculator?',
        answer:
          'Catastrophic floating-point cancellation on expressions like (1 − cos x)/x² for tiny x can produce 0 when the true limit is 1/2; combining symbolic L’Hôpital with calibrated offsets avoids cancellation.',
      },
    ],
    relatedSlugs: ['symbolic-derivative-calculator', 'taylor-maclaurin-series-visualizer', 'sequence-series-convergence-tester'],
  },
  {
    toolNumber: 13,
    slug: 'taylor-maclaurin-series-visualizer',
    path: '/tools/math/taylor-maclaurin-series-visualizer',
    viewKey: 'tools/math/taylor-maclaurin-series-visualizer',
    title: 'Taylor & Maclaurin Series Expansion Visualizer',
    shortTitle: 'Taylor & Maclaurin Visualizer',
    shortDescription:
      'Expand smooth functions around x = a up to degree n, inspect polynomial terms Pₙ(x), compute truncation error, and overlay Pₙ(x) onto f(x).',
    whenUsed:
      'Used in Calculus II, Physics small-angle approximations, Numerical Analysis error bounds, and Differential Equation power-series solutions.',
    levelId: 3,
    levelName: 'Level 3: Calculus & Real Analysis',
    levelShortLabel: 'Level 3: Calculus',
    tutorDomain: 'Calculus',
    formulaBadge: 'Pₙ(x) = Σ [f⁽ᵏ⁾(a)/k!]·(x−a)ᵏ',
    seoTitle: 'Taylor & Maclaurin Series Calculator & Polynomial Graph Visualizer | University Tutors',
    seoDescription:
      'Generate Taylor and Maclaurin polynomial expansions around x = a up to degree n, compute Lagrange remainder error, and visualize convergence against f(x).',
    seoKeywords: ['taylor series calculator', 'maclaurin series visualizer', 'taylor polynomial approximation', 'lagrange error bound'],
    definitions: [
      {
        term: 'Taylor Polynomial of Degree n',
        formula: 'Pₙ(x) = f(a) + f′(a)(x−a) + [f″(a)/2!](x−a)² + ··· + [f⁽ⁿ⁾(a)/n!](x−a)ⁿ',
        explanation:
          'Matches f(x) and its first n derivatives at the expansion center x = a; when a = 0, it is called a Maclaurin polynomial.',
      },
      {
        term: 'Lagrange Remainder (Truncation Error)',
        formula: '|Rₙ(x)| = |f(x) − Pₙ(x)| ≤ [M / (n + 1)!] · |x − a|^(n+1)',
        explanation:
          'Where M = max |f⁽ⁿ⁺¹⁾(c)| on the interval between a and x, bounding worst-case approximation error.',
      },
      {
        term: 'Classic Maclaurin Expansions (a = 0)',
        formula: 'eˣ = Σ xⁿ/n!,   sin x = x − x³/3! + x⁵/5! − ···,   1/(1−x) = Σ xⁿ (|x|<1)',
        explanation:
          'Note eˣ, sin x, and cos x converge for all x ∈ ℝ (R = ∞), whereas 1/(1−x) and ln(1+x) have finite radius R = 1.',
      },
    ],
    workedExample: {
      problem: 'Find the degree-4 Maclaurin polynomial P₄(x) for cos(x) and estimate cos(0.5).',
      steps: [
        'Compute derivatives at a = 0: f(0)=1, f′(0)=0, f″(0)=−1, f‴(0)=0, f⁽⁴⁾(0)=1.',
        'Assemble P₄(x) = 1 − x²/2! + x⁴/4! = 1 − x²/2 + x⁴/24.',
        'Evaluate at x = 0.5: P₄(0.5) = 1 − 0.25/2 + 0.0625/24 = 1 − 0.125 + 0.002604 ≈ 0.877604.',
        'Compare with true cos(0.5) ≈ 0.877583 → absolute error is only 2.16 × 10⁻⁵!',
      ],
      answer: 'P₄(x) = 1 − x²/2 + x⁴/24  ·  P₄(0.5) ≈ 0.87760',
    },
    commonMistakes: [
      'Writing (x − a)ᵏ / k without the factorial k! in the denominator!',
      'Using a Maclaurin series outside its radius of convergence (e.g., plugging x = 2 into 1 + x + x² + ··· for 1/(1−x)).',
      'Forgetting that odd functions (sin x, arctan x) have only odd powers at a = 0, so P₃(x) and P₄(x) for sin(x) are identical!',
    ],
    faqs: [
      {
        question: 'Why does Pₙ(x) hug sin(x) and eˣ wider as n increases, but 1/(1+x²) diverges outside (−1, 1)?',
        answer:
          '1/(1 + x²) has complex singularities at x = ±i in the complex plane at distance 1 from the origin, restricting its Maclaurin radius of convergence to R = 1!',
      },
      {
        question: 'How does Euler’s formula e^(iθ) = cos θ + i sin θ follow from Maclaurin series?',
        answer:
          'Substituting x = iθ into eˣ = Σ (iθ)ⁿ/n! separates real even terms (1 − θ²/2! + θ⁴/4! = cos θ) from imaginary odd terms i(θ − θ³/3! + θ⁵/5! = sin θ).',
      },
      {
        question: 'Where are Taylor polynomials used in modern computing?',
        answer:
          'Floating-point math libraries, finite-difference PDE stencils, Kalman filter EKF linearizations, and Runge–Kutta ODE integrators.',
      },
    ],
    relatedSlugs: ['symbolic-derivative-calculator', 'sequence-series-convergence-tester', 'definite-integral-riemann-plotter'],
  },
  {
    toolNumber: 14,
    slug: 'sequence-series-convergence-tester',
    path: '/tools/math/sequence-series-convergence-tester',
    viewKey: 'tools/math/sequence-series-convergence-tester',
    title: 'Sequence & Infinite Series Convergence Tester',
    shortTitle: 'Series Convergence Tester',
    shortDescription:
      'Analyze sequences aₙ, plot partial sums S_N = Σ aₙ, compute exact geometric/arithmetic sums, and run Divergence, Ratio, Root, and Alternating Series tests.',
    whenUsed:
      'Used in Calculus II, Real Analysis, Power Series Radius of Convergence, and Discrete Signal Z-Transforms.',
    levelId: 3,
    levelName: 'Level 3: Calculus & Real Analysis',
    levelShortLabel: 'Level 3: Calculus',
    tutorDomain: 'Calculus',
    formulaBadge: 'L = lim_{n→∞} |aₙ₊₁ / aₙ| < 1',
    seoTitle: 'Infinite Series Convergence Calculator — Ratio, Root, p-Series & Geometric | University Tutors',
    seoDescription:
      'Test infinite series Σ a_n for convergence or divergence using the Divergence, Ratio, Root, p-Series, and Alternating Series tests with partial sum plots.',
    seoKeywords: ['series convergence calculator', 'ratio test root test calculator', 'geometric series sum', 'partial sums plotter'],
    definitions: [
      {
        term: 'Divergence (n-th Term) Test & Geometric Sum',
        formula: 'lim aₙ ≠ 0 ⇒ Diverges   ·   Σ_{n=0}^∞ arⁿ = a / (1 − r)  (|r| < 1)',
        explanation:
          'If aₙ does not approach 0, Σ aₙ diverges immediately; however, lim aₙ = 0 alone does NOT guarantee convergence (e.g., harmonic Σ 1/n diverges!).',
      },
      {
        term: 'Ratio & Root Tests',
        formula: 'L = lim |aₙ₊₁ / aₙ|  or  lim |aₙ|^(1/n):  L < 1 Conv., L > 1 Div., L = 1 Inconclusive',
        explanation:
          'Ideal for series containing factorials n! or exponentials rⁿ; when L = 1 (such as rational p-series 1/nᵖ), use the p-Series or Integral Test.',
      },
      {
        term: 'p-Series & Alternating Series (Leibniz) Test',
        formula: 'Σ 1/nᵖ converges ⇔ p > 1   ·   Σ (−1)ⁿbₙ converges if bₙ ↓ 0',
        explanation:
          'Distinguishes absolute convergence (e.g., Σ (−1)ⁿ/n²) from conditional convergence (e.g., alternating harmonic Σ (−1)ⁿ⁺¹/n = ln 2).',
      },
    ],
    workedExample: {
      problem: 'Test Σ_{n=1}^∞ (n² / 2ⁿ) for convergence using the Ratio Test.',
      steps: [
        'Set aₙ = n² / 2ⁿ and aₙ₊₁ = (n + 1)² / 2ⁿ⁺¹.',
        'Form ratio |aₙ₊₁ / aₙ| = [(n + 1)² / 2ⁿ⁺¹] · [2ⁿ / n²] = (1/2) · (1 + 1/n)².',
        'Take limit as n → ∞: L = (1/2) · (1 + 0)² = 1/2.',
        'Since L = 0.5 < 1, the series converges absolutely (in fact, Σ_{n=1}^∞ n²/2ⁿ = 6).',
      ],
      answer: 'Converges Absolutely (Ratio L = 0.5 < 1, Exact Infinite Sum = 6)',
    },
    commonMistakes: [
      'Concluding that Σ aₙ converges just because lim_{n→∞} aₙ = 0—the Harmonic Series Σ 1/n has 1/n → 0 yet diverges to +∞!',
      'Concluding "diverges" when Ratio Test gives L = 1: L = 1 is strictly INCONCLUSIVE (both Σ 1/n and Σ 1/n² have L = 1!).',
      'Using S = a/(1 − r) without checking whether the index starts at n = 0 (first term a) vs. n = 1 (first term ar).',
    ],
    faqs: [
      {
        question: 'What is the difference between converging sequence aₙ and converging series Σ aₙ?',
        answer:
          'Sequence convergence asks whether individual terms aₙ approach a limit L (e.g., 1/n → 0). Series convergence asks whether the cumulative partial sums S_N = a₁ + ··· + a_N approach a finite sum S.',
      },
      {
        question: 'What does conditional convergence mean?',
        answer:
          'A series Σ aₙ converges conditionally if Σ aₙ converges due to sign cancellation, while Σ |aₙ| diverges (for example, Σ (−1)ⁿ⁺¹/n = ln 2, whereas Σ 1/n = ∞).',
      },
      {
        question: 'Which test should I try first on a Calculus II exam?',
        answer:
          'Always mentally check lim aₙ ≠ 0 first (2-second Divergence Test), then check Geometric or p-Series form, then Ratio Test for factorials/exponentials, or Limit Comparison for rational polynomials.',
      },
    ],
    relatedSlugs: ['taylor-maclaurin-series-visualizer', 'limits-lhopital-explorer', 'definite-integral-riemann-plotter'],
  },

  // ==========================================================================
  // LEVEL 4: LINEAR ALGEBRA & VECTOR CALCULUS (Tools 15–18)
  // ==========================================================================
  {
    toolNumber: 15,
    slug: 'matrix-algebra-rref-lab',
    path: '/tools/math/matrix-algebra-rref-lab',
    viewKey: 'tools/math/matrix-algebra-rref-lab',
    title: 'Full Matrix Algebra & RREF Decomposition Lab',
    shortTitle: 'Matrix Algebra & RREF Lab',
    shortDescription:
      'Compute A + B, A − B, AB, det(A), trace(A), rank(A), transpose Aᵀ, inverse A⁻¹, and step-by-step Gauss–Jordan Reduced Row Echelon Form.',
    whenUsed:
      'Used in Linear Algebra, Computer Graphics transformations, Econometrics (XᵀX)⁻¹Xᵀy, and Markov Chains.',
    levelId: 4,
    levelName: 'Level 4: Linear Algebra & Vector Calculus',
    levelShortLabel: 'Level 4: Linear Algebra',
    tutorDomain: 'Linear Algebra',
    formulaBadge: 'AA⁻¹ = I · rank(A) + nullity(A) = n',
    seoTitle: 'Matrix Calculator — RREF Step-by-Step, Inverse, Determinant & Rank | University Tutors',
    seoDescription:
      'Perform matrix multiplication, determinant, inverse A⁻¹, rank, trace, transpose, and step-by-step Reduced Row Echelon Form (RREF) locally in your browser.',
    seoKeywords: ['rref calculator step by step', 'matrix inverse determinant calculator', 'matrix multiplication rank nullity', 'gauss jordan elimination'],
    definitions: [
      {
        term: 'Reduced Row Echelon Form (RREF)',
        formula: 'Leading 1s in pivot columns, zeros above & below every pivot',
        explanation:
          'Every matrix A reduces to a unique RREF(A), directly revealing rank(A) = #pivots and nullity(A) = n − rank(A) by the Rank–Nullity Theorem.',
      },
      {
        term: 'Invertibility Equivalence Theorem',
        formula: 'A⁻¹ exists ⇔ det(A) ≠ 0 ⇔ rank(A) = n ⇔ RREF(A) = Iₙ',
        explanation:
          'Augmenting [A | Iₙ] and row-reducing to [Iₙ | A⁻¹] computes the exact inverse or proves singularity.',
      },
      {
        term: 'Non-Commutative Matrix Multiplication',
        formula: '(AB)ᵢⱼ = Σₖ Aᵢₖ Bₖⱼ   (In general, AB ≠ BA)',
        explanation:
          'Row i of A dotted with column j of B produces entry (i, j), and det(AB) = det(A)·det(B).',
      },
    ],
    workedExample: {
      problem: 'Find det(A) and A⁻¹ for A = [[4, 7], [2, 6]].',
      steps: [
        'Compute determinant: det(A) = (4)(6) − (7)(2) = 24 − 14 = 10 ≠ 0 (Invertible).',
        'Swap main diagonal and negate off-diagonal to form adj(A) = [[6, −7], [−2, 4]].',
        'Divide by det(A) = 10: A⁻¹ = (1/10)[[6, −7], [−2, 4]] = [[0.6, −0.7], [−0.2, 0.4]].',
        'Verify: A·A⁻¹ = [[2.4+−1.4, −2.8+2.8], [1.2−1.2, −1.4+2.4]] = [[1, 0], [0, 1]] = I₂.',
      ],
      answer: 'det(A) = 10  ·  A⁻¹ = [[0.6, −0.7], [−0.2, 0.4]]',
    },
    commonMistakes: [
      'Assuming AB = BA or (A + B)² = A² + 2AB + B² (actually A² + AB + BA + B² because AB ≠ BA!).',
      'Forgetting to reverse order when transposing or inverting a product: (AB)ᵀ = BᵀAᵀ and (AB)⁻¹ = B⁻¹A⁻¹.',
      'Multiplying entries element-wise (Hadamard product) instead of row-by-column dot products.',
    ],
    faqs: [
      {
        question: 'What is the Rank–Nullity Theorem?',
        answer:
          'For any m × n matrix A, rank(A) + dim(Null(A)) = n: the number of pivot columns plus the number of free-variable columns equals the total number of columns.',
      },
      {
        question: 'How do elementary row operations change det(A)?',
        answer:
          'Swapping two rows flips the sign of det(A), multiplying one row by k multiplies det(A) by k, and adding a multiple of one row to another leaves det(A) unchanged!',
      },
      {
        question: 'What is trace(A) and why is it invariant?',
        answer:
          'trace(A) is the sum of main diagonal entries Σ aᵢᵢ, which always equals the sum of all eigenvalues λ₁ + ··· + λₙ (counted with algebraic multiplicity).',
      },
    ],
    relatedSlugs: ['eigenvalues-eigenvectors-calculator', 'linear-equations-system-solver', '3d-vector-dot-cross-visualizer'],
  },
  {
    toolNumber: 16,
    slug: 'eigenvalues-eigenvectors-calculator',
    path: '/tools/math/eigenvalues-eigenvectors-calculator',
    viewKey: 'tools/math/eigenvalues-eigenvectors-calculator',
    title: 'Eigenvalues, Eigenvectors & Diagonalization Calculator',
    shortTitle: 'Eigenvalues & Eigenvectors',
    shortDescription:
      'Find the characteristic polynomial det(A − λI) = 0, real or complex eigenvalues λ, nullspace eigenvectors v, and diagonalizability check for 2×2 and 3×3 matrices.',
    whenUsed:
      'Used in Differential Equations systems x′ = Ax, Principal Component Analysis (PCA), Quantum Observables, and Structural Vibration modes.',
    levelId: 4,
    levelName: 'Level 4: Linear Algebra & Vector Calculus',
    levelShortLabel: 'Level 4: Linear Algebra',
    tutorDomain: 'Linear Algebra',
    formulaBadge: 'Av = λv · det(A − λI) = 0',
    seoTitle: 'Eigenvalue, Eigenvector & Characteristic Polynomial Calculator (2x2 & 3x3) | University Tutors',
    seoDescription:
      'Calculate characteristic polynomials, real & complex eigenvalues λ, eigenvectors, trace/determinant invariants, and diagonalization A = PDP⁻¹ for 2x2 and 3x3 matrices.',
    seoKeywords: ['eigenvalue eigenvector calculator', 'characteristic polynomial 3x3', 'diagonalization calculator', 'matrix spectral decomposition'],
    definitions: [
      {
        term: 'Characteristic Equation',
        formula: 'p(λ) = det(A − λI) = 0',
        explanation:
          'Non-zero eigenvectors v ∈ Null(A − λI) exist if and only if A − λI is singular, making λ a root of the degree-n characteristic polynomial.',
      },
      {
        term: 'Trace & Determinant Eigen-Checks',
        formula: 'Σ λᵢ = trace(A),   Π λᵢ = det(A)',
        explanation:
          'Instant exam sanity check: your computed eigenvalues must always sum to trace(A) and multiply to det(A)!',
      },
      {
        term: 'Diagonalization & Spectral Theorem',
        formula: 'A = P D P⁻¹  ⇒  Aᵏ = P Dᵏ P⁻¹',
        explanation:
          'An n × n matrix is diagonalizable iff its eigenspaces span ℝⁿ (ℂⁿ); every real symmetric matrix A = Aᵀ is orthogonally diagonalizable with purely real eigenvalues.',
      },
    ],
    workedExample: {
      problem: 'Find the eigenvalues and eigenvectors of A = [[2, 1], [1, 2]].',
      steps: [
        'Form characteristic polynomial: det([[2−λ, 1], [1, 2−λ]]) = (2−λ)² − 1 = λ² − 4λ + 3 = (λ − 3)(λ − 1) = 0.',
        'Read eigenvalues: λ₁ = 3 and λ₂ = 1 (check: 3 + 1 = 4 = tr(A), 3·1 = 3 = det(A)).',
        'For λ₁ = 3: (A − 3I)v = [[−1, 1], [1, −1]]v = 0 ⇒ v₁ = [1, 1]ᵀ.',
        'For λ₂ = 1: (A − I)v = [[1, 1], [1, 1]]v = 0 ⇒ v₂ = [−1, 1]ᵀ (orthogonal since A is symmetric!).',
      ],
      answer: 'λ₁ = 3, v₁ = (1, 1)  ·  λ₂ = 1, v₂ = (−1, 1)',
    },
    commonMistakes: [
      'Reporting the zero vector v = [0, 0]ᵀ as an eigenvector—by definition, eigenvectors MUST be non-zero!',
      'Sign mistakes when expanding det(A − λI) for 3×3 matrices: −λ³ + tr(A)λ² − (M₁₁ + M₂₂ + M₃₃)λ + det(A) = 0.',
      'Assuming repeated eigenvalues always prevent diagonalization (e.g., I₂ has λ = 1 twice yet is already diagonal, whereas [[1, 1], [0, 1]] is defective).',
    ],
    faqs: [
      {
        question: 'Why are eigenvectors only unique up to a non-zero scalar multiple?',
        answer:
          'Because if Av = λv, then A(cv) = c(Av) = c(λv) = λ(cv) for every scalar c ≠ 0; the set of all solutions plus 0 forms a linear subspace called the eigenspace E_λ.',
      },
      {
        question: 'What do complex eigenvalues mean geometrically in ℝ²?',
        answer:
          'Complex conjugate eigenvalues α ± βi indicate a spiral rotation-scaling transformation (like a 90° rotation matrix [[0, −1], [1, 0]] with λ = ±i) that leaves no real line invariant.',
      },
      {
        question: 'How do eigenvalues determine stability of dx/dt = Ax?',
        answer:
          'An equilibrium at the origin is asymptotically stable if Re(λᵢ) < 0 for every eigenvalue, unstable if any Re(λᵢ) > 0, and a neutrally stable center if purely imaginary ±βi.',
      },
    ],
    relatedSlugs: ['matrix-algebra-rref-lab', 'ode-slope-field-rk4-plotter', 'quadratic-polynomial-solver'],
  },
  {
    toolNumber: 17,
    slug: '3d-vector-dot-cross-visualizer',
    path: '/tools/math/3d-vector-dot-cross-visualizer',
    viewKey: 'tools/math/3d-vector-dot-cross-visualizer',
    title: '3D Vector Operations & Dot/Cross Product Visualizer',
    shortTitle: '3D Vector Dot & Cross Product',
    shortDescription:
      'Plot 3D vectors u, v, and u × v interactively while computing magnitudes, unit vectors, dot product, angle θ, vector projection, and parallelogram area.',
    whenUsed:
      'Used in Multivariable Calculus, Classical Mechanics (torque τ = r × F & work W = F · d), Electromagnetism, and 3D Graphics.',
    levelId: 4,
    levelName: 'Level 4: Linear Algebra & Vector Calculus',
    levelShortLabel: 'Level 4: Linear Algebra',
    tutorDomain: 'Linear Algebra',
    formulaBadge: 'u·v = ‖u‖‖v‖cosθ · ‖u×v‖ = ‖u‖‖v‖sinθ',
    seoTitle: '3D Vector Dot Product, Cross Product, Angle & Projection Visualizer | University Tutors',
    seoDescription:
      'Calculate 3D vector magnitudes, unit vectors, dot product, cross product u × v, angle θ, orthogonal projection, and parallelogram area with an interactive 3D plot.',
    seoKeywords: ['3d cross product calculator', 'dot product angle projection', 'vector visualizer 3d', 'parallelogram area vectors'],
    definitions: [
      {
        term: 'Dot (Scalar) Product & Orthogonality',
        formula: 'u · v = uₓvₓ + uᵧvᵧ + u_zv_z = ‖u‖‖v‖ cos θ',
        explanation:
          'Returns a scalar; two non-zero vectors are perpendicular (orthogonal, θ = 90°) if and only if u · v = 0.',
      },
      {
        term: 'Cross (Vector) Product & Right-Hand Rule',
        formula: 'u × v = ⟨uᵧv_z − u_zvᵧ, u_zvₓ − uₓv_z, uₓvᵧ − uᵧvₓ⟩',
        explanation:
          'Returns a vector orthogonal to both u and v whose length ‖u × v‖ equals the area of the parallelogram spanned by u and v.',
      },
      {
        term: 'Vector Projection onto v',
        formula: 'proj_v(u) = [(u · v) / ‖v‖²] · v',
        explanation:
          'Decomposes u = proj_v(u) + orth_v(u) into components parallel and perpendicular to v.',
      },
    ],
    workedExample: {
      problem: 'For u = ⟨1, 2, −1⟩ and v = ⟨3, 0, 1⟩, compute u · v, angle θ, and u × v.',
      steps: [
        'Dot product: u · v = (1)(3) + (2)(0) + (−1)(1) = 3 + 0 − 1 = 2.',
        'Magnitudes: ‖u‖ = √(1 + 4 + 1) = √6 ≈ 2.4495, and ‖v‖ = √(9 + 0 + 1) = √10 ≈ 3.1623.',
        'Angle: θ = arccos(2 / √60) ≈ arccos(0.2582) ≈ 75.04°.',
        'Cross product: u × v = ⟨(2)(1)−(−1)(0), (−1)(3)−(1)(1), (1)(0)−(2)(3)⟩ = ⟨2, −4, −6⟩.',
      ],
      answer: 'u · v = 2,  θ ≈ 75.04°,  u × v = ⟨2, −4, −6⟩',
    },
    commonMistakes: [
      'Forgetting the middle negative sign in cofactor expansion of the j-component of u × v!',
      'Dividing by ‖v‖ instead of ‖v‖² in the vector projection formula [(u · v)/‖v‖²]v.',
      'Reversing cross product order: v × u = −(u × v) (anti-commutative!).',
    ],
    faqs: [
      {
        question: 'How do I instantly verify that my cross product w = u × v is algebraically right?',
        answer:
          'Take both dot products w · u and w · v—both MUST equal 0 since u × v is orthogonal to both input vectors!',
      },
      {
        question: 'How do I find the equation of a plane through 3 points P, Q, R?',
        answer:
          'Form edge vectors u = PQ and v = PR, take normal vector n = u × v = ⟨a, b, c⟩, and write a(x − x₀) + b(y − y₀) + c(z − z₀) = 0.',
      },
      {
        question: 'What does the scalar triple product u · (v × w) represent?',
        answer:
          'Its absolute value |u · (v × w)| = |det[u, v, w]| equals the volume of the 3D parallelepiped spanned by u, v, and w (zero iff the vectors are coplanar).',
      },
    ],
    relatedSlugs: ['vector-calculus-grad-div-curl', 'matrix-algebra-rref-lab', 'triangle-law-sines-cosines-solver'],
  },
  {
    toolNumber: 18,
    slug: 'vector-calculus-grad-div-curl',
    path: '/tools/math/vector-calculus-grad-div-curl',
    viewKey: 'tools/math/vector-calculus-grad-div-curl',
    title: 'Vector Calculus Operator Suite (Gradient, Divergence & Curl)',
    shortTitle: 'Grad, Div, Curl & Jacobian',
    shortDescription:
      'Compute symbolic and point-evaluated Gradient ∇f, Laplacian ∇²f, Divergence ∇·F, Curl ∇×F, conservative/solenoidal checks, and Jacobian determinants.',
    whenUsed:
      'Used in Multivariable Calculus (Calculus III), Maxwell’s Electrodynamics, Fluid Mechanics, and Thermodynamics.',
    levelId: 4,
    levelName: 'Level 4: Linear Algebra & Vector Calculus',
    levelShortLabel: 'Level 4: Linear Algebra',
    tutorDomain: 'Linear Algebra',
    formulaBadge: '∇f · ∇·F · ∇×F',
    seoTitle: 'Gradient, Divergence, Curl & Laplacian Calculator (Vector Calculus) | University Tutors',
    seoDescription:
      'Evaluate Gradient ∇f, Divergence ∇·F, Curl ∇×F, and Laplacian ∇²f symbolically and numerically at (x₀, y₀, z₀) with conservative and incompressible field tests.',
    seoKeywords: ['gradient divergence curl calculator', 'vector calculus del operator', 'conservative vector field test', 'laplacian calculator'],
    definitions: [
      {
        term: 'Gradient Vector ∇f (Scalar → Vector)',
        formula: '∇f = ⟨∂f/∂x, ∂f/∂y, ∂f/∂z⟩',
        explanation:
          'Points in the direction of steepest ascent of f(x, y, z) and is perpendicular to the level surface f(x, y, z) = c.',
      },
      {
        term: 'Divergence ∇ · F (Vector → Scalar)',
        formula: '∇ · F = ∂P/∂x + ∂Q/∂y + ∂R/∂z',
        explanation:
          'Measures net outward flux density per unit volume (Gauss’s Divergence Theorem); if ∇ · F = 0 everywhere, F is incompressible (solenoidal).',
      },
      {
        term: 'Curl ∇ × F (Vector → Vector)',
        formula: '∇ × F = ⟨∂R/∂y − ∂Q/∂z, ∂P/∂z − ∂R/∂x, ∂Q/∂x − ∂P/∂y⟩',
        explanation:
          'Measures local rotational circulation density (Stokes’ Theorem); on a simply connected domain, ∇ × F = 0 ⇔ F = ∇f is conservative.',
      },
    ],
    workedExample: {
      problem: 'Given F(x, y, z) = ⟨x²y, yz², −xz²⟩, evaluate ∇ · F and ∇ × F at (1, 2, 1).',
      steps: [
        'Compute partial derivatives for Divergence: ∂(x²y)/∂x = 2xy, ∂(yz²)/∂y = z², ∂(−xz²)/∂z = −2xz.',
        'Sum for Divergence: ∇ · F = 2xy + z² − 2xz; at (1, 2, 1): 2(1)(2) + 1² − 2(1)(1) = 4 + 1 − 2 = 3.',
        'Compute Curl components: ⟨0 − 2yz, 0 − (−z²), 0 − x²⟩ = ⟨−2yz, z², −x²⟩.',
        'Evaluate Curl at (1, 2, 1): ∇ × F(1, 2, 1) = ⟨−4, 1, −1⟩ ≠ 0 (non-conservative field).',
      ],
      answer: '∇ · F(1,2,1) = 3  ·  ∇ × F(1,2,1) = ⟨−4, 1, −1⟩',
    },
    commonMistakes: [
      'Confusing output types: ∇f is a VECTOR, ∇ · F is a SCALAR, and ∇ × F is a VECTOR!',
      'Taking ∇ · (∇f) = ∇²f (valid Laplacian) vs. ∇ × (∇f) (identically ⟨0,0,0⟩ for C² functions) vs. ∇ · (∇ × F) (identically 0!).',
      'Treating non-differentiated variables as 1 instead of constants during partial differentiation.',
    ],
    faqs: [
      {
        question: 'Why does ∇ × (∇f) = 0 always hold for smooth scalar potentials?',
        answer:
          'By Clairaut’s Theorem on equality of mixed partial derivatives (∂²f/∂x∂y = ∂²f/∂y∂x), every component of curl(grad f) cancels identically—so conservative gradient fields are irrotational.',
      },
      {
        question: 'How do I compute the directional derivative of f in direction u?',
        answer:
          'Normalize u to a unit vector û = u / ‖u‖ first, then take the dot product D_û f(P) = ∇f(P) · û.',
      },
      {
        question: 'Where are Stokes’ and Divergence Theorems used in exams?',
        answer:
          'Divergence Theorem converts closed surface flux ∬_S F·dS into triple volume integral ∭_V (∇·F) dV, while Stokes’ Theorem converts line circulation ∮_C F·dr into surface integral ∬_S (∇×F)·dS.',
      },
    ],
    relatedSlugs: ['3d-vector-dot-cross-visualizer', 'symbolic-derivative-calculator', 'matrix-algebra-rref-lab'],
  },

  // ==========================================================================
  // LEVEL 5: PROBABILITY, STATISTICS & DATA SCIENCE (Tools 19–23)
  // ==========================================================================
  {
    toolNumber: 19,
    slug: 'descriptive-statistics-boxplot',
    path: '/tools/math/descriptive-statistics-boxplot',
    viewKey: 'tools/math/descriptive-statistics-boxplot',
    title: 'Descriptive Statistics & Box-Plot Generator',
    shortTitle: 'Descriptive Stats & Box-Plot',
    shortDescription:
      'Compute mean, median, mode, sample/population SD, quartiles Q₁–Q₃, IQR, skewness, and 1.5×IQR outliers from raw CSV/number lists with a live SVG Box-Plot.',
    whenUsed:
      'Used in Introductory Statistics, Psychology/Biology lab reports, Exploratory Data Analysis (EDA), and Quality Control.',
    levelId: 5,
    levelName: 'Level 5: Probability, Statistics & Data Science',
    levelShortLabel: 'Level 5: Statistics',
    tutorDomain: 'Statistics',
    formulaBadge: 's = √[Σ(xᵢ − x̄)² / (n − 1)]',
    seoTitle: 'Descriptive Statistics, Quartile IQR, Outlier & Box-Plot Generator | University Tutors',
    seoDescription:
      'Paste raw numbers or CSV data to calculate mean, median, mode, sample/population standard deviation, quartiles, IQR, Tukey outliers, and render a clean Box-Plot.',
    seoKeywords: ['descriptive statistics calculator', 'box plot generator online', 'iqr outlier calculator', 'sample standard deviation'],
    definitions: [
      {
        term: 'Sample vs. Population Variance (Bessel’s Correction)',
        formula: 's² = Σ(xᵢ − x̄)² / (n − 1)   vs.   σ² = Σ(xᵢ − μ)² / N',
        explanation:
          'Dividing by degrees of freedom n − 1 corrects downward bias when estimating unknown population variance σ² from a sample.',
      },
      {
        term: 'Five-Number Summary & Interquartile Range',
        formula: 'Min, Q₁, Median (Q₂), Q₃, Max   ·   IQR = Q₃ − Q₁',
        explanation:
          'Median and IQR are robust statistics unaffected by extreme skewed values, unlike mean x̄ and standard deviation s.',
      },
      {
        term: 'Tukey’s 1.5 × IQR Outlier Fences',
        formula: 'Lower = Q₁ − 1.5·IQR,   Upper = Q₃ + 1.5·IQR',
        explanation:
          'Any observation falling strictly outside [Lower, Upper] is flagged as a statistical outlier and plotted individually beyond the whiskers.',
      },
    ],
    workedExample: {
      problem: 'Find mean, median, s, IQR, and check outliers for [12, 15, 14, 16, 15, 18, 36].',
      steps: [
        'Sort dataset (n = 7): [12, 14, 15, 15, 16, 18, 36]. Median Q₂ = 4th value = 15; Mode = 15.',
        'Compute mean: x̄ = (12 + 14 + 15 + 15 + 16 + 18 + 36) / 7 = 126 / 7 = 18.0.',
        'Quartiles of lower/upper halves: Q₁ = 14, Q₃ = 18 ⇒ IQR = 18 − 14 = 4.',
        'Upper fence = 18 + 1.5(4) = 24 → 36 > 24 is flagged as a high outlier! Sample SD s ≈ 8.145.',
      ],
      answer: 'x̄ = 18.0,  Median = 15,  IQR = 4,  s ≈ 8.15,  Outlier: 36',
    },
    commonMistakes: [
      'Using population σ (dividing by n) on lab sample data when your assignment or R/SPSS expects sample SD s (dividing by n − 1).',
      'Computing the median without sorting the dataset in ascending order first!',
      'Using mean ± SD to summarize heavily right-skewed income/reaction-time data instead of Median and IQR.',
    ],
    faqs: [
      {
        question: 'Why do we divide by n − 1 in sample variance?',
        answer:
          'Because deviations (xᵢ − x̄) sum to zero, only n − 1 deviations are free to vary, and Σ(xᵢ − x̄)² is always ≤ Σ(xᵢ − μ)²; dividing by n − 1 makes E[s²] = σ² unbiased.',
      },
      {
        question: 'What does positive vs. negative skewness tell me?',
        answer:
          'Positive (right) skew has a long right tail pulling Mean > Median; negative (left) skew has a long left tail pulling Mean < Median.',
      },
      {
        question: 'Can a dataset have no mode or multiple modes?',
        answer:
          'Yes—if every value appears once, there is no mode; if two values tie for highest frequency, the distribution is bimodal.',
      },
    ],
    relatedSlugs: ['probability-distribution-explorer', 'hypothesis-testing-suite', 'regression-curve-fitting-analyzer'],
  },
  {
    toolNumber: 20,
    slug: 'probability-distribution-explorer',
    path: '/tools/math/probability-distribution-explorer',
    viewKey: 'tools/math/probability-distribution-explorer',
    title: 'Probability Distribution Explorer (Normal, Binomial, Poisson, t, χ²)',
    shortTitle: 'Probability Distributions',
    shortDescription:
      'Calculate exact tail and interval probabilities P(X ≤ x), P(X ≥ x), P(a ≤ X ≤ b), Z-scores, and shaded PDF/PMF curves for Normal, Binomial, Poisson, Student’s t, and χ².',
    whenUsed:
      'Used in Probability Theory, Biostatistics, Actuarial Science, Econometrics, and Engineering Reliability.',
    levelId: 5,
    levelName: 'Level 5: Probability, Statistics & Data Science',
    levelShortLabel: 'Level 5: Statistics',
    tutorDomain: 'Statistics',
    formulaBadge: 'Z = (X − μ)/σ · P(X = k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ',
    seoTitle: 'Probability Distribution Calculator — Normal, Binomial, Poisson, t & Chi-Square | University Tutors',
    seoDescription:
      'Interactive probability calculator and PDF/PMF curve plotter for Normal Z-scores, Binomial, Poisson, Student’s t, and Chi-Square distributions.',
    seoKeywords: ['normal distribution z score calculator', 'binomial poisson probability calculator', 't distribution chi square cdf', 'bell curve area plotter'],
    definitions: [
      {
        term: 'Normal Distribution N(μ, σ²) & Z-Standardization',
        formula: 'Z = (X − μ) / σ ~ N(0, 1),   P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a)',
        explanation:
          'By the Central Limit Theorem, sample sums and averages converge toward a Gaussian bell curve with 68–95–99.7% within 1, 2, 3σ.',
      },
      {
        term: 'Binomial B(n, p) vs. Poisson Pois(λ)',
        formula: 'Binomial: μ = np, σ² = np(1−p)   ·   Poisson: P(X=k) = e^(−λ)λᵏ/k!, μ = σ² = λ',
        explanation:
          'Binomial counts successes in n independent Bernoulli trials; Poisson counts rare independent arrivals over a fixed time/space interval.',
      },
      {
        term: 'Student’s t(ν) & Chi-Square χ²(ν)',
        formula: 't has heavier tails than N(0,1);  χ²(ν) = Σ Zᵢ² on [0, ∞)',
        explanation:
          'As degrees of freedom ν → ∞, Student’s t converges to Standard Normal N(0, 1).',
      },
    ],
    workedExample: {
      problem: 'Exam scores follow N(μ = 74, σ = 8). Find P(X ≥ 86) and the 95th percentile score.',
      steps: [
        'Standardize x = 86 to a Z-score: Z = (86 − 74) / 8 = 12 / 8 = +1.50.',
        'Evaluate cumulative left tail: Φ(1.50) ≈ 0.93319.',
        'Subtract from 1 for upper tail: P(X ≥ 86) = 1 − 0.93319 = 0.06681 (6.68%).',
        'For 95th percentile: z₀.₉₅ ≈ 1.6449 ⇒ X = 74 + 1.6449(8) ≈ 87.16.',
      ],
      answer: 'Z = +1.50  ·  P(X ≥ 86) = 0.0668 (6.68%)  ·  P₉₅ ≈ 87.16',
    },
    commonMistakes: [
      'Treating continuous P(X = x) like discrete PMFs: for continuous distributions (Normal, t, χ²), P(X = exact point) = 0; probabilities only exist over intervals!',
      'Confusing P(X < k) with P(X ≤ k) in discrete Binomial/Poisson problems (for integers, P(X < 5) = P(X ≤ 4)!).',
      'Plugging variance σ² into formulas expecting standard deviation σ.',
    ],
    faqs: [
      {
        question: 'When do I use Binomial vs. Poisson?',
        answer:
          'Use Binomial when there is a fixed number of trials n with constant success probability p. Use Poisson when events occur randomly at average rate λ over time/area without a fixed trial cap.',
      },
      {
        question: 'Why does Student’s t distribution have fatter tails than Z?',
        answer:
          'Estimating unknown σ using sample s introduces extra denominator variability for small n, spreading probability into the tails until df ≥ 30–60.',
      },
      {
        question: 'What is the Empirical 68–95–99.7 Rule?',
        answer:
          'For any Normal distribution, ~68.27% of observations fall within μ ± 1σ, ~95.45% within μ ± 2σ (95% within ±1.96σ), and ~99.73% within μ ± 3σ.',
      },
    ],
    relatedSlugs: ['hypothesis-testing-suite', 'descriptive-statistics-boxplot', 'combinatorics-permutations-calculator'],
  },
  {
    toolNumber: 21,
    slug: 'hypothesis-testing-suite',
    path: '/tools/math/hypothesis-testing-suite',
    viewKey: 'tools/math/hypothesis-testing-suite',
    title: 'Hypothesis Testing Suite (Z-Test, T-Test, ANOVA, Chi-Square)',
    shortTitle: 'Hypothesis Testing Suite',
    shortDescription:
      'Run 1-Sample Z, 1-Sample t, 2-Sample Welch t, One-Way ANOVA F, and Chi-Square Goodness-of-Fit tests with exact p-values, confidence intervals, and α decisions.',
    whenUsed:
      'Used in Research Methods, Psychology/Medical trials, Economics, A/B testing, and thesis data chapters.',
    levelId: 5,
    levelName: 'Level 5: Probability, Statistics & Data Science',
    levelShortLabel: 'Level 5: Statistics',
    tutorDomain: 'Statistics',
    formulaBadge: 't = (x̄ − μ₀)/(s/√n) · p < α ⇒ Reject H₀',
    seoTitle: 'Hypothesis Testing Calculator — T-Test, Z-Test, ANOVA & Chi-Square p-Value | University Tutors',
    seoDescription:
      'Compute test statistics, degrees of freedom, exact p-values, confidence intervals, and H₀ decisions for Z-tests, 1 & 2-sample t-tests, One-Way ANOVA, and Chi-Square.',
    seoKeywords: ['t test p value calculator', 'z test confidence interval', 'one way anova calculator', 'chi square goodness of fit'],
    definitions: [
      {
        term: 'Null (H₀) vs. Alternative (H₁) & p-Value',
        formula: 'p-value = P(test stat as extreme or more | H₀ is true)',
        explanation:
          'If p ≤ α (typically 0.05), we reject H₀ in favor of H₁; if p > α, we fail to reject H₀ (never "prove H₀ true"!).',
      },
      {
        term: '1-Sample & 2-Sample Welch t-Statistic',
        formula: 't₁ = (x̄ − μ₀)/(s/√n),   t₂ = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)',
        explanation:
          'Welch’s two-sample t-test with Welch–Satterthwaite degrees of freedom does not assume equal population variances.',
      },
      {
        term: 'One-Way ANOVA F & Chi-Square χ²',
        formula: 'F = MSB / MSW,   χ² = Σ [(Oᵢ − Eᵢ)² / Eᵢ]',
        explanation:
          'ANOVA tests equality of k ≥ 3 group means simultaneously without inflating Type I error; χ² tests categorical count frequencies.',
      },
    ],
    workedExample: {
      problem: 'A sample of n = 25 batteries has x̄ = 48.2 hr, s = 4.0 hr. Test H₀: μ = 50 vs. H₁: μ ≠ 50 at α = 0.05.',
      steps: [
        'Compute standard error: SE = s / √n = 4.0 / √25 = 4.0 / 5 = 0.80.',
        'Compute t-statistic (df = 24): t = (48.2 − 50.0) / 0.80 = −1.80 / 0.80 = −2.250.',
        'Compute two-tailed p-value from t(24): p = 2 · P(T₂₄ ≤ −2.25) ≈ 0.0339; 95% CI = 48.2 ± 2.064(0.8) = [46.55, 49.85].',
        'Decision: Since p = 0.0339 < α = 0.05 (and 50 lies outside the 95% CI), Reject H₀.',
      ],
      answer: 't(24) = −2.25,  p = 0.0339 < 0.05  ⇒  Reject H₀',
    },
    commonMistakes: [
      'Interpreting p = 0.03 as "a 3% probability that H₀ is true"—the p-value is P(Data | H₀), NOT P(H₀ | Data)!',
      'Writing "Accept H₀" when p > α instead of the statistically rigorous "Fail to reject H₀".',
      'Running multiple pairwise t-tests across 4 groups instead of One-Way ANOVA (which inflates false-positive Type I error from 5% to ~26.5%!).',
    ],
    faqs: [
      {
        question: 'When do I use a Z-test vs. a t-test?',
        answer:
          'Use a Z-test when the true population standard deviation σ is known (or large-sample proportions). Whenever σ is unknown and estimated by sample SD s, use Student’s t-test with df = n − 1.',
      },
      {
        question: 'What is Type I (α) vs. Type II (β) error?',
        answer:
          'Type I error (rate α) is a false positive: rejecting H₀ when H₀ is actually true. Type II error (rate β) is a false negative: failing to reject H₀ when H₁ is true; Statistical Power = 1 − β.',
      },
      {
        question: 'When is Chi-Square Goodness-of-Fit valid?',
        answer:
          'Observations must be independent raw counts (never percentages!) and expected cell counts Eᵢ should generally be ≥ 5.',
      },
    ],
    relatedSlugs: ['probability-distribution-explorer', 'descriptive-statistics-boxplot', 'regression-curve-fitting-analyzer'],
  },
  {
    toolNumber: 22,
    slug: 'regression-curve-fitting-analyzer',
    path: '/tools/math/regression-curve-fitting-analyzer',
    viewKey: 'tools/math/regression-curve-fitting-analyzer',
    title: 'Linear, Polynomial & Regression Analyzer',
    shortTitle: 'Regression & Curve Fitting',
    shortDescription:
      'Fit Ordinary Least Squares (OLS) linear, quadratic, cubic, exponential, and logarithmic models with equation coefficients, R², Pearson r, RMSE, and scatter + residual plots.',
    whenUsed:
      'Used in Econometrics, Experimental Physics/Chemistry calibration curves, Machine Learning baselines, and Engineering labs.',
    levelId: 5,
    levelName: 'Level 5: Probability, Statistics & Data Science',
    levelShortLabel: 'Level 5: Statistics',
    tutorDomain: 'Statistics',
    formulaBadge: 'ŷ = β₀ + β₁x · R² = 1 − SSR/SST',
    seoTitle: 'Linear & Polynomial Regression Calculator — R², RMSE, Scatter & Residuals | University Tutors',
    seoDescription:
      'Fit linear, polynomial, exponential, and logarithmic regression equations to (x, y) data. Computes slope, intercept, R², Pearson r, RMSE, and plots residuals.',
    seoKeywords: ['linear regression calculator r2', 'polynomial curve fitting online', 'least squares scatter residual plot', 'pearson correlation calculator'],
    definitions: [
      {
        term: 'Ordinary Least Squares (OLS) Normal Equations',
        formula: 'β̂ = (XᵀX)⁻¹Xᵀy   ·   β̂₁ = S_xy / S_xx,  β̂₀ = ȳ − β̂₁x̄',
        explanation:
          'Minimizes the Sum of Squared Residuals SSR = Σ(yᵢ − ŷᵢ)² and guarantees the fitted line passes directly through centroid (x̄, ȳ).',
      },
      {
        term: 'Coefficient of Determination R² & RMSE',
        formula: 'R² = 1 − [Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)²] ∈ [0, 1]',
        explanation:
          'R² measures the proportion of variance in y explained by the model, while RMSE = √[SSR / n] gives typical prediction error in y’s units.',
      },
      {
        term: 'Residual Diagnostic eᵢ = yᵢ − ŷᵢ',
        formula: 'Random cloud around 0 ⇒ Valid linear model',
        explanation:
          'A U-shaped curve in the residual plot signals missing nonlinear curvature (switch to quadratic/exponential fit!).',
      },
    ],
    workedExample: {
      problem: 'Fit ŷ = β₀ + β₁x to (1, 2), (2, 4), (3, 5), (4, 4), (5, 5).',
      steps: [
        'Compute means: x̄ = 3.0, ȳ = 4.0.',
        'Compute sums: S_xx = Σ(xᵢ − 3)² = 4 + 1 + 0 + 1 + 4 = 10; S_xy = Σ(xᵢ − 3)(yᵢ − 4) = 4 + 0 + 0 + 0 + 2 = 6.',
        'Slope β̂₁ = 6 / 10 = 0.60; Intercept β̂₀ = 4.0 − 0.60(3.0) = 2.20 ⇒ ŷ = 2.2 + 0.6x.',
        'SST = 6.0, SSR = 2.4 ⇒ R² = 1 − 2.4/6.0 = 0.60 (r = +0.7746).',
      ],
      answer: 'ŷ = 2.20 + 0.60x  ·  R² = 0.600,  r = +0.7746',
    },
    commonMistakes: [
      'Equating high correlation/R² with causation without a controlled experimental design.',
      'Extrapolating predictions far outside the observed domain [x_min, x_max] where linear behavior breaks down.',
      'Overfitting small datasets with high-degree polynomials just to inflate R² without checking residual patterns.',
    ],
    faqs: [
      {
        question: 'How are Pearson r and R² related in simple linear regression?',
        answer:
          'In simple 1-predictor linear regression ŷ = β₀ + β₁x, R² equals the square of Pearson’s correlation coefficient r², with sign(r) = sign(β₁).',
      },
      {
        question: 'Why should I always inspect the residual plot alongside R²?',
        answer:
          'As Anscombe’s Quartet famously demonstrates, four completely different datasets (curved, outlier-driven, clustered) can share identical x̄, ȳ, slope, and R² = 0.67!',
      },
      {
        question: 'How does exponential regression y = a·e^(bx) work via least squares?',
        answer:
          'For yᵢ > 0, taking natural logarithms linearizes ln(y) = ln(a) + bx, allowing OLS estimation of b and a = exp(intercept).',
      },
    ],
    relatedSlugs: ['descriptive-statistics-boxplot', 'hypothesis-testing-suite', 'matrix-algebra-rref-lab'],
  },
  {
    toolNumber: 23,
    slug: 'combinatorics-permutations-calculator',
    path: '/tools/math/combinatorics-permutations-calculator',
    viewKey: 'tools/math/combinatorics-permutations-calculator',
    title: 'Combinatorics, Permutations (nPr, nCr) & Pascal’s Triangle',
    shortTitle: 'Combinatorics & Pascal’s Triangle',
    shortDescription:
      'Compute factorials n!, permutations nPr, combinations nCr (with and without repetition), Binomial Theorem terms, and highlight interactive Pascal’s Triangle rows.',
    whenUsed:
      'Used in Discrete Mathematics, Probability sample spaces, Statistical Mechanics, and Algorithm Analysis.',
    levelId: 5,
    levelName: 'Level 5: Probability, Statistics & Data Science',
    levelShortLabel: 'Level 5: Statistics',
    tutorDomain: 'Statistics',
    formulaBadge: 'nCr = n! / [r!(n − r)!]',
    seoTitle: 'Combinatorics, Permutations (nPr), Combinations (nCr) & Pascal’s Triangle | University Tutors',
    seoDescription:
      'Calculate factorials, nPr permutations, nCr combinations (with and without repetition), stars-and-bars multisets, and explore an interactive Pascal’s Triangle.',
    seoKeywords: ['npr ncr calculator', 'combinatorics stars and bars', 'pascals triangle generator', 'binomial theorem expansion'],
    definitions: [
      {
        term: 'Permutations (Order Matters)',
        formula: 'No Repetition: P(n, r) = n! / (n − r)!   ·   With Repetition: nʳ',
        explanation:
          'Counts ordered arrangements such as podium rankings, PIN codes, or injective mappings.',
      },
      {
        term: 'Combinations (Order Does NOT Matter)',
        formula: 'No Rep: C(n, r) = n! / [r!(n−r)!]   ·   Multiset (Stars & Bars): C(n + r − 1, r)',
        explanation:
          'Counts unordered subsets (committees, poker hands) or ways to distribute r identical items into n distinct bins.',
      },
      {
        term: 'Pascal’s Identity & Binomial Theorem',
        formula: 'C(n, r) = C(n−1, r−1) + C(n−1, r)   ·   (a + b)ⁿ = Σ C(n, k)aⁿ⁻ᵏbᵏ',
        explanation:
          'Row n of Pascal’s Triangle displays all binomial coefficients C(n, 0)...C(n, n), whose sum equals 2ⁿ.',
      },
    ],
    workedExample: {
      problem: 'From 12 researchers, how many ways can we choose a 4-person committee vs. a President, VP, Secretary, and Treasurer?',
      steps: [
        'Committee (unordered subset, n=12, r=4): C(12, 4) = (12 × 11 × 10 × 9) / (4 × 3 × 2 × 1) = 11,880 / 24 = 495.',
        'Officer slate (ordered positions, n=12, r=4): P(12, 4) = 12 × 11 × 10 × 9 = 11,880.',
        'Notice P(12, 4) = C(12, 4) × 4! = 495 × 24 = 11,880.',
      ],
      answer: 'Unordered Committee C(12,4) = 495  ·  Ordered Officers P(12,4) = 11,880',
    },
    commonMistakes: [
      'Using nPr when order is irrelevant (overcounting by a factor of r!!).',
      'Forgetting 0! = 1 (the empty product—there is exactly 1 way to arrange zero objects!).',
      'Confusing Stars-and-Bars C(n + r − 1, r) with nʳ when items are indistinguishable.',
    ],
    faqs: [
      {
        question: 'Why does C(n, r) = C(n, n − r) always hold?',
        answer:
          'Choosing r items to include in a team is bijectively equivalent to choosing the remaining n − r items to leave out!',
      },
      {
        question: 'When do I use Stars and Bars C(n + r − 1, r)?',
        answer:
          'Whenever counting non-negative integer solutions x₁ + x₂ + ··· + xₙ = r, or selecting r items from n types with unlimited repetition where order doesn’t matter (e.g., choosing 6 donuts from 4 flavors).',
      },
      {
        question: 'Why do the numbers in row n of Pascal’s Triangle sum to 2ⁿ?',
        answer:
          'Setting a = 1 and b = 1 in (a + b)ⁿ = Σ C(n, k)aⁿ⁻ᵏbᵏ yields 2ⁿ = Σ C(n, k), counting all subsets of an n-element set.',
      },
    ],
    relatedSlugs: ['probability-distribution-explorer', 'scientific-expression-evaluator', 'number-theory-modular-rsa-calculator'],
  },

  // ==========================================================================
  // LEVEL 6: ADVANCED UNIVERSITY MATHEMATICS (Tools 24–27)
  // ==========================================================================
  {
    toolNumber: 24,
    slug: 'ode-slope-field-rk4-plotter',
    path: '/tools/math/ode-slope-field-rk4-plotter',
    viewKey: 'tools/math/ode-slope-field-rk4-plotter',
    title: 'Ordinary Differential Equation (ODE) & Slope Field Plotter',
    shortTitle: 'ODE Slope Field & RK4',
    shortDescription:
      'Render 2D direction/slope fields for dy/dx = f(x, y) and trace initial-value solution trajectories comparing Euler’s Method against 4th-Order Runge–Kutta (RK4).',
    whenUsed:
      'Used in Differential Equations, Population Ecology (logistic growth), RC/RL Circuit Transients, and Dynamical Systems.',
    levelId: 6,
    levelName: 'Level 6: Advanced University Mathematics',
    levelShortLabel: 'Level 6: Advanced ODEs & Discrete',
    tutorDomain: 'Differential Equations',
    formulaBadge: 'dy/dx = f(x, y) · y(x₀) = y₀',
    seoTitle: 'ODE Slope Field Plotter & Runge-Kutta (RK4) / Euler Solver | University Tutors',
    seoDescription:
      'Plot direction fields for first-order differential equations dy/dx = f(x, y) and trace Euler and 4th-Order Runge-Kutta (RK4) solution curves with step tables.',
    seoKeywords: ['slope field plotter ode', 'runge kutta rk4 calculator', 'eulers method step by step', 'initial value problem solver'],
    definitions: [
      {
        term: 'Slope (Direction) Field & Isoclines',
        formula: 'Line segments of slope m = f(x, y) across (x, y) grid',
        explanation:
          'Visualizes qualitative long-term behavior and equilibrium solutions (f(x, y) = 0) without needing a closed-form integral!',
      },
      {
        term: 'Forward Euler’s Method (First-Order O(h))',
        formula: 'yₙ₊₁ = yₙ + h · f(xₙ, yₙ)',
        explanation:
          'Steps along the local tangent line; simple for hand exam tables, though global error scales linearly with step size h.',
      },
      {
        term: 'Classical 4th-Order Runge–Kutta (RK4, O(h⁴))',
        formula: 'yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)',
        explanation:
          'Samples four weighted slopes across [xₙ, xₙ + h] (analogous to Simpson’s Rule); halving h shrinks global error by 16×!',
      },
    ],
    workedExample: {
      problem: 'Approximate y(0.2) for dy/dx = x + y, y(0) = 1 with step h = 0.1 using Euler’s Method vs. RK4.',
      steps: [
        'Euler Step 1 (x₀=0, y₀=1): y₁ = 1 + 0.1(0 + 1) = 1.10.',
        'Euler Step 2 (x₁=0.1, y₁=1.10): y₂ = 1.10 + 0.1(0.1 + 1.10) = 1.220.',
        'RK4 across two h=0.1 steps gives y(0.2) ≈ 1.242805.',
        'Exact analytical solution y(x) = 2eˣ − x − 1 gives y(0.2) = 2e⁰·² − 1.2 ≈ 1.242806 (RK4 matches to 6 digits!).',
      ],
      answer: 'Euler: 1.2200  ·  RK4: 1.242805  (Exact: 1.242806)',
    },
    commonMistakes: [
      'Forgetting to increment xₙ = x₀ + n·h alongside yₙ at each step in non-autonomous equations dy/dx = f(x, y)!',
      'Using h instead of h/2 inside the midpoint evaluations k₂ = f(xₙ + h/2, yₙ + h·k₁/2) and k₃ in RK4.',
      'Drawing solution curves that cross each other where f and ∂f/∂y are continuous (violating Picard–Lindelöf uniqueness!).',
    ],
    faqs: [
      {
        question: 'What is an autonomous ODE and how do I test equilibrium stability?',
        answer:
          'An autonomous ODE dy/dx = g(y) depends only on y (horizontal isoclines). Roots g(y*) = 0 are constant equilibria: stable (attracting) if g′(y*) < 0 and unstable (repelling) if g′(y*) > 0.',
      },
      {
        question: 'Why is RK4 so much more accurate than Euler’s method?',
        answer:
          'Euler has global truncation error O(h), whereas RK4 cancels Taylor error terms through 4th order, giving global error O(h⁴).',
      },
      {
        question: 'When does Picard–Lindelöf guarantee a unique IVP solution?',
        answer:
          'Whenever f(x, y) and ∂f/∂y are continuous in an open rectangle around (x₀, y₀), a unique local solution curve passes through (x₀, y₀).',
      },
    ],
    relatedSlugs: ['laplace-fourier-transform-studio', 'eigenvalues-eigenvectors-calculator', 'symbolic-derivative-calculator'],
  },
  {
    toolNumber: 25,
    slug: 'laplace-fourier-transform-studio',
    path: '/tools/math/laplace-fourier-transform-studio',
    viewKey: 'tools/math/laplace-fourier-transform-studio',
    title: 'Laplace & Fourier Transform Solver & Harmonic Visualizer',
    shortTitle: 'Laplace & Fourier Studio',
    shortDescription:
      'Compute forward & inverse Laplace transforms L{f(t)} ↔ F(s) with s-plane poles, and synthesize square, sawtooth, and triangle waves via N-harmonic Fourier series.',
    whenUsed:
      'Used in Differential Equations, Control Systems (transfer functions H(s)), Signal Processing, PDE Heat/Wave equations, and Electrical Engineering.',
    levelId: 6,
    levelName: 'Level 6: Advanced University Mathematics',
    levelShortLabel: 'Level 6: Advanced ODEs & Discrete',
    tutorDomain: 'Differential Equations',
    formulaBadge: 'F(s) = ∫₀^∞ e^(−st)f(t) dt · f(t) = a₀/2 + Σ(aₙcos + bₙsin)',
    seoTitle: 'Laplace Transform Table Solver & Fourier Series Wave Visualizer | University Tutors',
    seoDescription:
      'Look up and evaluate forward/inverse Laplace transforms with ROC & poles, and visualize Fourier series harmonic synthesis for square, sawtooth, and triangle waves.',
    seoKeywords: ['laplace transform calculator', 'inverse laplace partial fractions', 'fourier series square wave visualizer', 'gibbs phenomenon harmonics'],
    definitions: [
      {
        term: 'Unilateral Laplace Transform & Differentiation Property',
        formula: 'L{f(t)} = ∫₀^∞ e^(−st)f(t) dt,   L{y′} = sY(s) − y(0)',
        explanation:
          'Converts linear constant-coefficient ODE initial value problems directly into algebraic fractions in the complex s-domain!',
      },
      {
        term: 'Trigonometric Fourier Series on [−L, L]',
        formula: 'f(t) = a₀/2 + Σ_{n=1}^∞ [aₙ cos(nπt/L) + bₙ sin(nπt/L)]',
        explanation:
          'Decomposes any piecewise-smooth periodic signal into orthogonal sinusoidal harmonics; odd functions have aₙ = 0, even functions have bₙ = 0.',
      },
      {
        term: 'Gibbs Phenomenon at Jump Discontinuities',
        formula: '~8.95% overshoot near jump edges as N → ∞',
        explanation:
          'At a jump discontinuity (like a square or sawtooth wave), Fourier partial sums converge to the midpoint [f(t⁻)+f(t⁺)]/2 with a persistent ~9% ringing overshoot.',
      },
    ],
    workedExample: {
      problem: 'Find the Laplace transform F(s) of f(t) = e^(−2t)·sin(3t) and state its Region of Convergence.',
      steps: [
        'Recall base transform pair: L{sin(ωt)} = ω / (s² + ω²) for Re(s) > 0; here ω = 3 gives 3 / (s² + 9).',
        'Apply First Shifting (s-Shift) Theorem L{e^(at)g(t)} = G(s − a) with a = −2.',
        'Replace s by (s + 2): F(s) = 3 / ((s + 2)² + 9) = 3 / (s² + 4s + 13).',
        'Identify complex conjugate poles s = −2 ± 3i and Region of Convergence Re(s) > −2.',
      ],
      answer: 'F(s) = 3 / [(s + 2)² + 9]  (ROC: Re(s) > −2, Poles: −2 ± 3i)',
    },
    commonMistakes: [
      'Flipping sign in the s-shift theorem: e^(+at)f(t) shifts to F(s − a), whereas e^(−at)f(t) shifts to F(s + a)!',
      'Dropping initial condition terms −s·y(0) − y′(0) when transforming L{y″(t)} = s²Y(s) − s·y(0) − y′(0).',
      'Forgetting the 1/2 factor on the DC average term a₀/2 in the standard Fourier series convention.',
    ],
    faqs: [
      {
        question: 'Why do engineers prefer Laplace over Fourier for initial value problems?',
        answer:
          'The unilateral Laplace transform starts at t = 0⁻ and incorporates initial conditions y(0), y′(0) automatically, and its e^(−σt) damping factor transforms growing signals (like e^(2t) or unit steps) whose ordinary Fourier integrals diverge.',
      },
      {
        question: 'Why does a square wave contain only odd harmonics (n = 1, 3, 5, ...)?',
        answer:
          'A centered square wave has odd symmetry f(−t) = −f(t) (so all cosine aₙ = 0) plus half-wave symmetry f(t + T/2) = −f(t), which cancels every even sine harmonic b₂ₖ = 0!',
      },
      {
        question: 'How do I invert rational F(s) = P(s)/Q(s)?',
        answer:
          'Complete the square for irreducible quadratics (yielding damped cos/sin) and apply Partial Fraction Decomposition for distinct or repeated real poles.',
      },
    ],
    relatedSlugs: ['ode-slope-field-rk4-plotter', 'complex-number-polar-converter', 'definite-integral-riemann-plotter'],
  },
  {
    toolNumber: 26,
    slug: 'numerical-root-finding-lab',
    path: '/tools/math/numerical-root-finding-lab',
    viewKey: 'tools/math/numerical-root-finding-lab',
    title: 'Numerical Root-Finding & Optimization Lab',
    shortTitle: 'Newton-Raphson, Bisection & Secant',
    shortDescription:
      'Solve nonlinear transcendental equations f(x) = 0 with full iteration tables and error convergence plots for Newton–Raphson, Bisection, and Secant methods.',
    whenUsed:
      'Used in Numerical Analysis, Engineering Thermodynamics/Fluid friction factors, Financial IRR, and Optimization f′(x) = 0.',
    levelId: 6,
    levelName: 'Level 6: Advanced University Mathematics',
    levelShortLabel: 'Level 6: Advanced ODEs & Discrete',
    tutorDomain: 'Differential Equations',
    formulaBadge: 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)',
    seoTitle: 'Newton-Raphson, Bisection & Secant Method Root Calculator | University Tutors',
    seoDescription:
      'Solve f(x) = 0 step-by-step using Newton-Raphson, Bisection, and Secant methods with complete iteration tables, error bounds, and function curve plots.',
    seoKeywords: ['newton raphson calculator table', 'bisection method step by step', 'secant method root finder', 'numerical analysis solver'],
    definitions: [
      {
        term: 'Bisection Method (Guaranteed Linear Convergence)',
        formula: 'f(a)·f(b) < 0  ⇒  c = (a + b)/2,  |eₙ| ≤ (b₀ − a₀)/2ⁿ',
        explanation:
          'By the Intermediate Value Theorem, a continuous sign-changing bracket [a, b] MUST contain a root, halving uncertainty every iteration.',
      },
      {
        term: 'Newton–Raphson Method (Quadratic Convergence p = 2)',
        formula: 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)',
        explanation:
          'Follows the tangent line to the x-axis; near a simple root, the number of accurate decimal places roughly DOUBLES every single step!',
      },
      {
        term: 'Secant Method (Superlinear Order φ ≈ 1.618)',
        formula: 'xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁) / [f(xₙ) − f(xₙ₋₁)]',
        explanation:
          'Replaces analytical f′(xₙ) with a two-point secant slope—ideal when derivatives are expensive or unavailable.',
      },
    ],
    workedExample: {
      problem: 'Approximate the root of f(x) = cos(x) − x near x₀ = 0.7 using Newton–Raphson (in radians).',
      steps: [
        'Differentiate: f′(x) = −sin(x) − 1.',
        'Iter 1: f(0.7) = cos(0.7) − 0.7 ≈ 0.064842, f′(0.7) ≈ −1.644218 ⇒ x₁ = 0.7 − (0.064842/−1.644218) ≈ 0.739436.',
        'Iter 2: f(0.739436) ≈ −0.000588, f′(0.739436) ≈ −1.673871 ⇒ x₂ ≈ 0.73908518.',
        'Iter 3: x₃ = 0.7390851332 (Dottie number converged to 10 decimal places in 3 steps!).',
      ],
      answer: 'x* ≈ 0.73908513 (Converged in 3 Newton Iterations)',
    },
    commonMistakes: [
      'Running Bisection on [a, b] when f(a) and f(b) have the SAME sign (Intermediate Value Theorem requires f(a)·f(b) < 0!).',
      'Evaluating trigonometric f(x) = cos(x) − x in Degrees when f′(x) = −sin(x) − 1 assumes Radians!',
      'Starting Newton–Raphson right at a horizontal extremum where f′(x₀) ≈ 0, shooting x₁ off toward infinity.',
    ],
    faqs: [
      {
        question: 'How many Bisection steps are needed to guarantee tolerance ε?',
        answer:
          'Solve (b₀ − a₀) / 2ⁿ ≤ ε ⇒ n ≥ ceil( log₂((b₀ − a₀) / ε) ). For [1, 2] and ε = 10⁻⁶, n = ceil(log₂(10⁶)) = 20 iterations.',
      },
      {
        question: 'When does Newton–Raphson degrade from quadratic to linear convergence?',
        answer:
          'At a multiple root of multiplicity m ≥ 2 (where f(r) = f′(r) = 0, such as (x − 2)² = 0), standard Newton converges linearly unless modified to x − m·f/f′.',
      },
      {
        question: 'How is Newton’s method used for unconstrained optimization?',
        answer:
          'To minimize or maximize g(x), apply root-finding to its derivative g′(x) = 0, yielding the optimization update xₙ₊₁ = xₙ − g′(xₙ) / g″(xₙ).',
      },
    ],
    relatedSlugs: ['quadratic-polynomial-solver', 'symbolic-derivative-calculator', 'ode-slope-field-rk4-plotter'],
  },
  {
    toolNumber: 27,
    slug: 'number-theory-modular-rsa-calculator',
    path: '/tools/math/number-theory-modular-rsa-calculator',
    viewKey: 'tools/math/number-theory-modular-rsa-calculator',
    title: 'Number Theory, Modular Arithmetic & RSA Cryptography Lab',
    shortTitle: 'Modular Arithmetic, CRT & RSA',
    shortDescription:
      'Run Extended Euclidean Bézout steps, modular inverse a⁻¹ mod m, fast modular exponentiation, Euler’s totient φ(n), Chinese Remainder Theorem, and live RSA encryption/decryption.',
    whenUsed:
      'Used in Discrete Mathematics, Abstract Algebra, Computer Science Cryptography, and Competitive Math.',
    levelId: 6,
    levelName: 'Level 6: Advanced University Mathematics',
    levelShortLabel: 'Level 6: Advanced ODEs & Discrete',
    tutorDomain: 'Differential Equations',
    formulaBadge: 'ax + my = gcd(a,m) · c ≡ mᵉ (mod n)',
    seoTitle: 'Modular Inverse, Extended Euclidean, CRT & RSA Cryptography Calculator | University Tutors',
    seoDescription:
      'Calculate Extended Euclidean GCD Bézout coefficients, modular inverses, Euler’s totient φ(n), Chinese Remainder Theorem systems, and interactive RSA key generation.',
    seoKeywords: ['modular inverse calculator', 'extended euclidean algorithm table', 'chinese remainder theorem solver', 'rsa encryption calculator step by step'],
    definitions: [
      {
        term: 'Bézout’s Identity & Modular Multiplicative Inverse',
        formula: 'a·x + m·y = gcd(a, m)   ⇒   a⁻¹ ≡ x (mod m)  iff gcd(a, m) = 1',
        explanation:
          'Back-substituting the Extended Euclidean Algorithm yields x such that a·x ≡ 1 (mod m) whenever a and m are coprime.',
      },
      {
        term: 'Euler’s Totient Theorem & Fast Exponentiation',
        formula: 'gcd(a, n) = 1  ⇒  a^φ(n) ≡ 1 (mod n),   φ(pq) = (p−1)(q−1)',
        explanation:
          'Generalizes Fermat’s Little Theorem (a^(p−1) ≡ 1 mod p) and underpins public/private key inversion in RSA.',
      },
      {
        term: 'RSA Cryptosystem & Chinese Remainder Theorem',
        formula: 'n = pq,  e·d ≡ 1 (mod φ(n)),  Encrypt: c = mᵉ mod n,  Decrypt: m = cᵈ mod n',
        explanation:
          'Security relies on the hardness of factoring large semiprime n = pq, while CRT solves simultaneous pairwise-coprime congruences uniquely mod M = Π mᵢ.',
      },
    ],
    workedExample: {
      problem: 'Generate RSA keys for primes p = 11, q = 17 with public exponent e = 7, and encrypt message m = 88.',
      steps: [
        'Compute modulus n = 11 × 17 = 187 and totient φ(n) = (11 − 1)(17 − 1) = 10 × 16 = 160.',
        'Verify gcd(7, 160) = 1; solve 7d ≡ 1 (mod 160) via Extended Euclid: 7(23) = 161 = 1(160) + 1 ⇒ private key d = 23.',
        'Encrypt m = 88 via square-and-multiply: c = 88⁷ mod 187 = 11.',
        'Decrypt c = 11: m = 11²³ mod 187 = 88 (Original message recovered!).',
      ],
      answer: 'Public (e=7, n=187), Private (d=23, n=187)  ·  Ciphertext c = 11 → Decrypted m = 88',
    },
    commonMistakes: [
      'Searching for a⁻¹ mod m when gcd(a, m) > 1 (e.g., 6 has NO inverse mod 15 because gcd(6, 15) = 3 ≠ 1!).',
      'Computing d ≡ e⁻¹ (mod n) instead of mod φ(n) = (p − 1)(q − 1) in RSA!',
      'Applying CRT without first checking that moduli m₁, m₂, m₃ are pairwise coprime.',
    ],
    faqs: [
      {
        question: 'How does binary Square-and-Multiply compute 88⁷ mod 187 without overflow?',
        answer:
          'Instead of computing 88⁷ ≈ 4.08 × 10¹³, we reduce modulo 187 after every single multiplication: 88² ≡ 77, 88⁴ ≡ 77² ≡ 132, so 88⁷ = 88⁴·88²·88¹ ≡ 132·77·88 ≡ 11 (mod 187).',
      },
      {
        question: 'Why must p and q be giant 1024+ bit primes in real-world RSA?',
        answer:
          'With small primes like 11 and 17, anyone can factor n = 187 instantly, compute φ(n) = 160, and derive d = e⁻¹ mod φ(n); 2048-bit semiprimes resist classical factorization.',
      },
      {
        question: 'How do I compute Euler’s totient φ(n) for an arbitrary integer n?',
        answer:
          'Using prime factorization n = Π pᵢ^(kᵢ), evaluate Euler’s product formula φ(n) = n · Π (1 − 1/pᵢ). For example, φ(36) = 36(1 − 1/2)(1 − 1/3) = 12.',
      },
    ],
    relatedSlugs: ['fraction-ratio-percentage-solver', 'combinatorics-permutations-calculator', 'scientific-expression-evaluator'],
  },
];

export const MATH_TOOLS_BY_SLUG: Record<MathToolSlug, MathToolItem> = MATH_TOOLS_REGISTRY.reduce(
  (acc, item) => {
    acc[item.slug] = item;
    return acc;
  },
  {} as Record<MathToolSlug, MathToolItem>
);

export type ResolvedMathRoute =
  | { kind: 'hub' }
  | { kind: 'tool'; tool: MathToolItem };

export function resolveMathRoute(input: string): ResolvedMathRoute | null {
  if (!input) return null;
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^[#/]+/, '')
    .replace(/\?.*$/, '')
    .replace(/\/+$/, '');

  if (cleaned === 'tools/math') {
    return { kind: 'hub' };
  }

  if (cleaned.startsWith('tools/math/')) {
    const slug = cleaned.slice('tools/math/'.length) as MathToolSlug;
    const found = MATH_TOOLS_BY_SLUG[slug];
    if (found) {
      return { kind: 'tool', tool: found };
    }
  }

  return null;
}
