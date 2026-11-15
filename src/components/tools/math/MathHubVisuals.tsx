import React, { useId } from 'react';
import type { MathLevelId, MathToolSlug } from '../../../data/mathToolsRegistry';

// ============================================================================
// 1. CATEGORY ICON SVGs (Exact icons from design specification for mobile & desktop)
// ============================================================================
export function MathCategoryIcon({
  categoryId,
  className = 'w-6 h-6',
}: {
  categoryId: 'all' | MathLevelId;
  className?: string;
}) {
  switch (categoryId) {
    case 'all':
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="9" height="9" rx="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
          <rect x="16" y="3" width="9" height="9" rx="2.5" fill="currentColor" fillOpacity="0.85" />
          <rect x="3" y="16" width="9" height="9" rx="2.5" fill="currentColor" fillOpacity="0.85" />
          <rect x="16" y="16" width="9" height="9" rx="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 1:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.12" />
          <path d="M5 16h3.5l3 7 4.5-17h7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.5 12.5l4.5 4.5m0-4.5l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 2:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="9.5" cy="14" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          <path d="M9.5 14L14 10.5V14H9.5Z" fill="currentColor" />
          <path d="M16 14c1.8-6 3.5-6 5.2 0s3.5 6 5.3 0" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );
    case 3:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 21V11C17.5 7 21.5 7 25 10.5V21H14Z" fill="currentColor" fillOpacity="0.22" />
          <path d="M10.5 4.5c-2.2 0-2.2 3.5-2.2 9.5s0 9.5-2.3 9.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M14 11c3.5-4 7.5-4 11-.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M13 21h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 4:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M7.5 5H4.5v18h3M20.5 5h3v18h-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9.5" y="8.5" width="3.5" height="3.5" rx="1" fill="currentColor" />
          <rect x="15" y="12.2" width="3.5" height="3.5" rx="1" fill="currentColor" fillOpacity="0.45" />
          <rect x="9.5" y="16" width="3.5" height="3.5" rx="1" fill="currentColor" fillOpacity="0.45" />
          <rect x="15" y="16" width="3.5" height="3.5" rx="1" fill="currentColor" />
        </svg>
      );
    case 5:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M3.5 21C8.5 21 9.5 7 14 7C18.5 7 19.5 21 24.5 21H3.5Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M3.5 21C8.5 21 9.5 7 14 7C18.5 7 19.5 21 24.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M14 7v14" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2.5 2" />
        </svg>
      );
    case 6:
      return (
        <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M8.5 7.5l10 2M7.2 9.5l3.5 10.5M19.5 11.5l-5.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="6.5" cy="7" r="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
          <circle cx="21" cy="9.5" r="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="21.5" r="3" fill="currentColor" />
        </svg>
      );
  }
}

// ============================================================================
// 2. TOOL METADATA (Use Case, Popularity, Formula Graphics & Quick Test Samples)
// ============================================================================
export interface MathToolVisualMeta {
  useCase: string;
  popular: boolean;
  sampleInput: string;
  sampleOutput: string;
}

export const MATH_TOOL_VISUAL_META: Record<MathToolSlug, MathToolVisualMeta> = {
  'scientific-expression-evaluator': {
    useCase: 'Best for complex numbers, trig & nested fractions',
    popular: true,
    sampleInput: '(3 + 4i) * (2 - i) + sin(pi/2)',
    sampleOutput: '11 + 5i',
  },
  'quadratic-polynomial-solver': {
    useCase: 'Best for factoring quadratics & finding vertex/roots',
    popular: true,
    sampleInput: '2x^2 - 5x + 2 = 0',
    sampleOutput: 'x₁ = 2, x₂ = 0.5 (Discriminant Δ = 9)',
  },
  'linear-equations-system-solver': {
    useCase: 'Best for solving simultaneous 2×2 & 3×3 systems',
    popular: false,
    sampleInput: '2x + y = 5; 4x - y = 1',
    sampleOutput: 'x = 1, y = 3 (det A = −6)',
  },
  'fraction-ratio-percentage-solver': {
    useCase: 'Best for exact fractions, GCD/LCM & percent delta',
    popular: false,
    sampleInput: '3/4 + 5/6',
    sampleOutput: '19/12 (1 7/12 ≈ 1.5833)',
  },
  'logarithm-exponent-simplifier': {
    useCase: 'Best for log laws, change of base & radical surds',
    popular: false,
    sampleInput: 'log_2(32) + sqrt(72)',
    sampleOutput: '5 + 6√2 (≈ 13.4853)',
  },
  'interactive-unit-circle': {
    useCase: 'Best for unit circle angles, surds & trig identities',
    popular: true,
    sampleInput: 'sin(pi/3), cos(pi/3)',
    sampleOutput: 'sin(60°) = √3/2, cos(60°) = 1/2',
  },
  'triangle-law-sines-cosines-solver': {
    useCase: 'Best for SSS, SAS & ASA triangle side/angle solving',
    popular: false,
    sampleInput: 'a = 7, b = 10, C = 60°',
    sampleOutput: 'c ≈ 8.888, Area ≈ 30.31 sq units',
  },
  'conic-sections-visualizer': {
    useCase: 'Best for ellipse foci, hyperbolas & parabola focus',
    popular: false,
    sampleInput: 'x^2/25 + y^2/9 = 1',
    sampleOutput: 'Ellipse: a = 5, b = 3, Foci (±4, 0), e = 0.8',
  },
  'complex-number-polar-converter': {
    useCase: 'Best for Euler r·e^(iθ), roots of unity & Argand plots',
    popular: false,
    sampleInput: 'z = 3 + 4i',
    sampleOutput: 'r = 5, θ = 53.13° (5·e^(0.927i))',
  },
  'symbolic-derivative-calculator': {
    useCase: 'Best for step-by-step differentiation & tangent slopes',
    popular: true,
    sampleInput: 'd/dx [ x^3 * sin(2x) ]',
    sampleOutput: '3x²·sin(2x) + 2x³·cos(2x)',
  },
  'definite-integral-riemann-plotter': {
    useCase: 'Best for area under curves, u-sub & Riemann sums',
    popular: true,
    sampleInput: '∫_0^pi sin(x) dx',
    sampleOutput: '[−cos(x)]₀^π = 2.0000',
  },
  'limits-lhopital-explorer': {
    useCase: 'Best for 0/0 indeterminate limits & two-sided graphs',
    popular: false,
    sampleInput: 'lim_{x->0} sin(x)/x',
    sampleOutput: '1 (via L’Hôpital: cos(0)/1 = 1)',
  },
  'taylor-maclaurin-series-visualizer': {
    useCase: 'Best for power series polynomials & error bounds',
    popular: false,
    sampleInput: 'Taylor(e^x, a=0, n=4)',
    sampleOutput: '1 + x + x²/2! + x³/3! + x⁴/4!',
  },
  'sequence-series-convergence-tester': {
    useCase: 'Best for Ratio Test, Root Test & p-series checks',
    popular: false,
    sampleInput: 'Sum n=1..inf (1 / n^2)',
    sampleOutput: 'Converges (p = 2 > 1, Sum = π²/6 ≈ 1.6449)',
  },
  'matrix-algebra-rref-lab': {
    useCase: 'Best for Gaussian elimination, inverses & rank/nullity',
    popular: true,
    sampleInput: '[[2, 1, 5], [4, -1, 1]]',
    sampleOutput: 'RREF: [[1, 0, 1], [0, 1, 3]]',
  },
  'eigenvalues-eigenvectors-calculator': {
    useCase: 'Best for characteristic polynomials & diagonalization',
    popular: false,
    sampleInput: '[[4, 1], [2, 3]]',
    sampleOutput: 'λ₁ = 5, v₁ = [1, 1]ᵀ | λ₂ = 2, v₂ = [1, −2]ᵀ',
  },
  '3d-vector-dot-cross-visualizer': {
    useCase: 'Best for orthogonal normals, projections & dot/cross',
    popular: false,
    sampleInput: 'u = <2, 1, 0>, v = <0, 3, 4>',
    sampleOutput: 'u·v = 3, u × v = <4, −8, 6>',
  },
  'vector-calculus-grad-div-curl': {
    useCase: 'Best for ∇f gradients, divergence & curl vector fields',
    popular: false,
    sampleInput: 'f(x,y,z) = x^2*y + z^3',
    sampleOutput: '∇f = <2xy, x², 3z²>',
  },
  'descriptive-statistics-boxplot': {
    useCase: 'Best for quartiles, IQR outliers, SD & five-number plots',
    popular: false,
    sampleInput: '[12, 15, 18, 22, 24, 29, 41]',
    sampleOutput: 'Mean = 23.0, Median = 22, IQR = 14',
  },
  'probability-distribution-explorer': {
    useCase: 'Best for Normal, Binomial, Poisson & χ² probabilities',
    popular: false,
    sampleInput: 'Binomial(n=10, p=0.5, k=5)',
    sampleOutput: 'P(X = 5) = 0.2461 (24.61%)',
  },
  'hypothesis-testing-suite': {
    useCase: 'Best for Z/t-tests, p-values & confidence intervals',
    popular: true,
    sampleInput: 'μ₀ = 100, x̄ = 104.5, σ = 12, n = 36',
    sampleOutput: 'Z = 2.25, p = 0.0244 (Reject H₀ at α = 0.05)',
  },
  'regression-curve-fitting-analyzer': {
    useCase: 'Best for OLS trendlines, R² goodness-of-fit & residuals',
    popular: false,
    sampleInput: '(1,2), (2,4.1), (3,5.9), (4,8.2)',
    sampleOutput: 'ŷ = 2.04x − 0.05 (R² = 0.9988)',
  },
  'combinatorics-permutations-calculator': {
    useCase: 'Best for nPr, nCr combinations & Pascal’s Triangle',
    popular: false,
    sampleInput: 'C(10, 3) & P(10, 3)',
    sampleOutput: '₁₀C₃ = 120 · ₁₀P₃ = 720',
  },
  'ode-slope-field-rk4-plotter': {
    useCase: 'Best for 1st/2nd-order ODEs, RK4 & slope fields',
    popular: true,
    sampleInput: "y'' + 4y' + 4y = 0",
    sampleOutput: 'y(t) = (C₁ + C₂·t)·e^(−2t)',
  },
  'laplace-fourier-transform-studio': {
    useCase: 'Best for Laplace s-domain pairs & harmonic spectra',
    popular: false,
    sampleInput: 'L{ e^(-2t) * sin(3t) }',
    sampleOutput: '3 / ((s + 2)² + 9)',
  },
  'numerical-root-finding-lab': {
    useCase: 'Best for Newton-Raphson, Bisection & Secant iterations',
    popular: false,
    sampleInput: 'x^3 - x - 2 = 0 (x₀ = 1.5)',
    sampleOutput: 'Root x ≈ 1.521380 (3 Newton steps)',
  },
  'number-theory-modular-rsa-calculator': {
    useCase: 'Best for Euclidean GCD, mod inverse & RSA keys',
    popular: false,
    sampleInput: 'p = 11, q = 17, e = 7',
    sampleOutput: 'n = 187, φ(n) = 160, d = 23',
  },
};

// ============================================================================
// 3. FORMULA MINI-GRAPHICS FOOTER (Typeset math typography + 20x20 crisp SVG)
// ============================================================================
export function MathFormulaGraphic({
  slug,
  fallbackBadge,
}: {
  slug: MathToolSlug;
  fallbackBadge: string;
}) {
  switch (slug) {
    case 'scientific-expression-evaluator':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-orange-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
            <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
            <path d="M12 12L17.5 6.5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
            <circle cx="17.5" cy="6.5" r="2" fill="#EA580C" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 tracking-wide inline-flex items-center gap-1.5 truncate">
            <span className="inline-flex items-center font-semibold text-orange-700">
              (<span className="italic">x</span><sup className="text-[9px]">2</sup>+<span className="italic">y</span>)
            </span>
            <span className="text-slate-300">|</span>
            <span>
              <span className="italic font-semibold">z</span> = <span className="italic">a</span> + <span className="italic">bi</span>
            </span>
          </span>
        </div>
      );
    case 'quadratic-polynomial-solver':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 16h18" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.45" />
            <path d="M5 6c3 15 11 15 14 0" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <circle cx="7.4" cy="16" r="1.8" fill="#EA580C" />
            <circle cx="16.6" cy="16" r="1.8" fill="#EA580C" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1.5 truncate">
            <span>
              <span className="italic font-semibold">ax</span><sup className="text-[9px] font-bold">2</sup> + <span className="italic font-semibold">bx</span> + <span className="italic font-semibold">c</span> = 0
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[12px] text-amber-800 font-semibold">√Δ</span>
          </span>
        </div>
      );
    case 'interactive-unit-circle':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 12L18.5 7.5V12H12Z" fill="#0284C7" fillOpacity="0.25" stroke="#0284C7" strokeWidth="1.5" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 truncate">
            sin<sup className="text-[9px]">2</sup><span className="italic font-semibold">θ</span> + cos<sup className="text-[9px]">2</sup><span className="italic font-semibold">θ</span> = 1
          </span>
        </div>
      );
    case 'symbolic-derivative-calculator':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 19c4-2 6-11 16-14" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 14L18 6" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="11.5" cy="10" r="2" fill="#F97316" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1.5 truncate">
            <span className="inline-flex flex-col items-center leading-none text-[10.5px] font-semibold text-indigo-800">
              <span className="border-b border-indigo-800 px-1 pb-[1px] italic">d</span>
              <span className="pt-[1px] italic">dx</span>
            </span>
            <span>
              [<span className="italic font-semibold">f</span>(<span className="italic">g</span>(<span className="italic">x</span>))]
            </span>
          </span>
        </div>
      );
    case 'definite-integral-riemann-plotter':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-violet-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 19V11c3-4 9-4 12 0v8H6z" fill="#8B5CF6" fillOpacity="0.28" />
            <path d="M4 13c4-6 12-6 16 0" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 19h16" stroke="#6D28D9" strokeWidth="1.5" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1 truncate">
            <span className="inline-flex items-center text-violet-800 font-bold">
              <span className="text-[18px] leading-none">∫</span>
              <span className="inline-flex flex-col text-[8.5px] leading-tight -ml-0.5 mr-0.5 italic">
                <span>b</span>
                <span>a</span>
              </span>
            </span>
            <span>
              <span className="italic font-semibold">f</span>(<span className="italic">x</span>) <span className="italic">dx</span>
            </span>
          </span>
        </div>
      );
    case 'matrix-algebra-rref-lab':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 4H4v16h2M18 4h2v16h-2" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="7" y="7" width="3" height="3" rx="0.8" fill="#059669" />
            <rect x="10.5" y="10.5" width="3" height="3" rx="0.8" fill="#059669" />
            <rect x="14" y="14" width="3" height="3" rx="0.8" fill="#059669" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1.5 truncate">
            <span>
              [<span className="italic font-semibold">A</span> | <span className="italic font-semibold">b</span>]
            </span>
            <span className="text-emerald-700 font-bold">→</span>
            <span>
              [<span className="italic font-semibold">I</span><sub className="text-[9px]">n</sub> | <span className="italic font-semibold">x</span>]
            </span>
          </span>
        </div>
      );
    case 'eigenvalues-eigenvectors-calculator':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 19L19 5" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 5h5v5" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19l7-7" stroke="#F97316" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 truncate">
            det(<span className="italic font-semibold">A</span> − <span className="italic font-semibold text-teal-700">λ</span><span className="italic font-semibold">I</span>) = 0
          </span>
        </div>
      );
    case 'hypothesis-testing-suite':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 18c4 0 5-12 9-12s5 12 9 12" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <path d="M15.5 11.5c1.5 4 3 6.5 5.5 6.5h-5.5v-6.5z" fill="#E11D48" fillOpacity="0.45" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1.5 truncate">
            <span className="italic font-semibold">z</span> =
            <span className="inline-flex flex-col items-center leading-none text-[10px] font-semibold">
              <span className="border-b border-slate-700 px-1 pb-[1px]">x̄ − μ</span>
              <span className="pt-[1px]">σ/√n</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-semibold italic">p &lt; α</span>
          </span>
        </div>
      );
    case 'ode-slope-field-rk4-plotter':
      return (
        <div className="inline-flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-cyan-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 17c5-1 8-9 16-11" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 9l3-2M12 15l3-2M15 8l3-2" stroke="#0891B2" strokeWidth="1.4" strokeOpacity="0.5" strokeLinecap="round" />
          </svg>
          <span className="font-math-serif text-[13.5px] text-slate-800 inline-flex items-center gap-1.5 truncate">
            <span className="inline-flex flex-col items-center leading-none text-[10px] font-semibold text-cyan-800">
              <span className="border-b border-cyan-800 px-1 pb-[1px] italic">dy</span>
              <span className="pt-[1px] italic">dx</span>
            </span>
            <span>
              = <span className="italic font-semibold">f</span>(<span className="italic">x</span>, <span className="italic">y</span>)
            </span>
          </span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-1.5 min-w-0">
          <svg className="w-4 h-4 text-[#EA580C] shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="16" height="16" rx="4" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
            <path d="M6 7h8l-4 3.5L14 14H6" stroke="#EA580C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-math-serif text-[13px] font-semibold text-slate-800 truncate">
            {fallbackBadge}
          </span>
        </div>
      );
  }
}

// ============================================================================
// 4. ALL 27 REALISTIC 64x64 3D-SHADED MATHEMATICAL INSTRUMENT ILLUSTRATIONS
// ============================================================================
export function MathToolGraphic({
  slug,
  className = 'w-16 h-16 drop-shadow-sm',
}: {
  slug: MathToolSlug;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');

  switch (slug) {
    // 1. Scientific & Complex Evaluator
    case 'scientific-expression-evaluator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`cb-${uid}`} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
            <linearGradient id={`cs-${uid}`} x1="12" y1="10" x2="52" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id={`ob-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#cb-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <rect x="11" y="10" width="42" height="20" rx="6" fill={`url(#cs-${uid})`} />
          <path d="M16 25H34M21 13V27" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
          <path d="M21 25L31 15" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="31" cy="15" r="2" fill="#38BDF8" />
          <text x="35" y="23" fill="#FDBA74" fontSize="8.5" fontWeight="700" fontFamily="monospace">a+bi</text>
          <rect x="11" y="34" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
          <text x="14" y="40" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">sin</text>
          <rect x="26" y="34" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
          <text x="29.5" y="40" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">ln</text>
          <rect x="41" y="34" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
          <text x="44.5" y="40" fill="#EA580C" fontSize="7.5" fontWeight="800" fontFamily="monospace">π</text>
          <rect x="11" y="45" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
          <text x="14.5" y="51" fill="#475569" fontSize="7" fontWeight="700" fontFamily="monospace">x²</text>
          <rect x="26" y="45" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
          <text x="29.5" y="51" fill="#475569" fontSize="7" fontWeight="700" fontFamily="monospace">√x</text>
          <rect x="41" y="45" width="12" height="8" rx="2.5" fill={`url(#ob-${uid})`} />
          <text x="45" y="51.5" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="monospace">=</text>
        </svg>
      );

    // 2. Quadratic & Polynomial Solver
    case 'quadratic-polynomial-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`ab-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient id={`ps-${uid}`} x1="14" y1="12" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#ab-${uid})`} stroke="#FCD34D" strokeWidth="1.5" />
          <path d="M16 10V54M24 10V54M32 10V54M40 10V54M48 10V54M10 18H54M10 26H54M10 34H54M10 42H54M10 50H54" stroke="#FDE68A" strokeWidth="1" />
          <path d="M10 34H54M32 10V54" stroke="#92400E" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
          <path d="M20 34C23 51 41 51 44 34H20Z" fill="#F59E0B" fillOpacity="0.22" />
          <path d="M15 13C20 56 44 56 49 13" stroke={`url(#ps-${uid})`} strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="45.2" r="2.8" fill="#FFFFFF" stroke="#B45309" strokeWidth="2" />
          <circle cx="20.2" cy="34" r="3.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="43.8" cy="34" r="3.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="13" y="29" fill="#92400E" fontSize="7.5" fontWeight="800" fontFamily="monospace">x₁</text>
          <text x="45" y="29" fill="#92400E" fontSize="7.5" fontWeight="800" fontFamily="monospace">x₂</text>
        </svg>
      );

    // 3. Linear Equations System Solver
    case 'linear-equations-system-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg3-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FED7AA" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg3-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <path d="M12 50H52M14 12V52" stroke="#9A3412" strokeWidth="1.4" strokeOpacity="0.35" strokeLinecap="round" />
          <path d="M14 44L50 18" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M18 16L48 48" stroke="#0284C7" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="31.5" cy="31" r="4.2" fill="#111827" stroke="#FFFFFF" strokeWidth="1.8" />
          <text x="37" y="22" fill="#9A3412" fontSize="7.5" fontWeight="800" fontFamily="monospace">Ax=b</text>
        </svg>
      );

    // 4. Fraction, Ratio, GCD/LCM & Percentage Solver
    case 'fraction-ratio-percentage-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg4-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF2F2" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg4-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <circle cx="24" cy="28" r="13" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
          <path d="M24 28L24 15A13 13 0 0 1 37 28Z" fill="#F97316" />
          <path d="M24 28L37 28A13 13 0 0 1 24 41Z" fill="#FDBA74" />
          <rect x="39" y="16" width="15" height="28" rx="4" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.2" />
          <text x="46.5" y="27" textAnchor="middle" fill="#EA580C" fontSize="9.5" fontWeight="800" fontFamily="monospace">a</text>
          <line x1="42" y1="30" x2="51" y2="30" stroke="#111827" strokeWidth="1.6" />
          <text x="46.5" y="40" textAnchor="middle" fill="#111827" fontSize="9.5" fontWeight="800" fontFamily="monospace">b</text>
          <text x="32" y="53" textAnchor="middle" fill="#9A3412" fontSize="7.5" fontWeight="800" fontFamily="monospace">GCD·%</text>
        </svg>
      );

    // 5. Logarithm, Exponent & Radical Simplifier
    case 'logarithm-exponent-simplifier':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg5l-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg5l-${uid})`} stroke="#FCD34D" strokeWidth="1.5" />
          <path d="M12 50L50 12" stroke="#94A3B8" strokeWidth="1.3" strokeDasharray="3 2.5" />
          <path d="M14 47C25 46 33 35 38 13" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M17 50C28 34 38 25 50 20" stroke="#0284C7" strokeWidth="2.6" strokeLinecap="round" />
          <text x="13" y="22" fill="#C2410C" fontSize="8.5" fontWeight="800" fontFamily="monospace">eˣ</text>
          <text x="38" y="47" fill="#0369A1" fontSize="8" fontWeight="800" fontFamily="monospace">ln(x)</text>
        </svg>
      );

    // 6. Interactive Unit Circle & Trigonometry Explorer
    case 'interactive-unit-circle':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`sb6-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#sb6-${uid})`} stroke="#7DD3FC" strokeWidth="1.5" />
          <path d="M10 32H54M32 10V54" stroke="#0284C7" strokeWidth="1.2" strokeOpacity="0.35" strokeDasharray="2.5 2.5" />
          <circle cx="32" cy="32" r="19" fill="#FFFFFF" fillOpacity="0.7" stroke="#0284C7" strokeWidth="2.2" />
          <path d="M32 32L46.5 20A19 19 0 0 1 51 32H32Z" fill="#0EA5E9" fillOpacity="0.22" />
          <path d="M32 32L46.5 20V32H32Z" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round" />
          <path d="M46.5 20V32" stroke="#F97316" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M43.5 32V29H46.5" stroke="#0369A1" strokeWidth="1.3" />
          <circle cx="46.5" cy="20" r="3.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="14" y="21" fill="#0369A1" fontSize="8" fontWeight="800" fontFamily="monospace">sin θ</text>
        </svg>
      );

    // 7. Triangle Law of Sines & Cosines Solver
    case 'triangle-law-sines-cosines-solver':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg7-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg7-${uid})`} stroke="#93C5FD" strokeWidth="1.5" />
          <polygon points="14,47 36,15 51,47" fill="#FFFFFF" fillOpacity="0.8" stroke="#1D4ED8" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M19 47A6 6 0 0 0 17 42" stroke="#EA580C" strokeWidth="2" />
          <circle cx="36" cy="15" r="2.8" fill="#1D4ED8" />
          <text x="20" y="31" fill="#1E40AF" fontSize="8" fontWeight="800" fontFamily="serif">a</text>
          <text x="46" y="31" fill="#1E40AF" fontSize="8" fontWeight="800" fontFamily="serif">b</text>
          <text x="31" y="54" fill="#EA580C" fontSize="8" fontWeight="800" fontFamily="serif">c</text>
        </svg>
      );

    // 8. Conic Sections Visualizer
    case 'conic-sections-visualizer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg8-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg8-${uid})`} stroke="#7DD3FC" strokeWidth="1.5" />
          <path d="M10 32H54M32 10V54" stroke="#64748B" strokeWidth="1.2" strokeOpacity="0.4" />
          <ellipse cx="32" cy="32" rx="19" ry="12" fill="#0EA5E9" fillOpacity="0.16" stroke="#0284C7" strokeWidth="2.4" />
          <circle cx="20" cy="32" r="2.8" fill="#EA580C" />
          <circle cx="44" cy="32" r="2.8" fill="#EA580C" />
          <text x="17" y="25" fill="#9A3412" fontSize="7" fontWeight="800" fontFamily="monospace">F₁</text>
          <text x="41" y="25" fill="#9A3412" fontSize="7" fontWeight="800" fontFamily="monospace">F₂</text>
        </svg>
      );

    // 9. Complex Number Polar Converter
    case 'complex-number-polar-converter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg9c-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg9c-${uid})`} stroke="#67E8F9" strokeWidth="1.5" />
          <path d="M12 44H52M20 12V52" stroke="#0369A1" strokeWidth="1.4" strokeOpacity="0.4" />
          <circle cx="20" cy="44" r="21" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
          <path d="M20 44L42 22" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="22" r="3.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="33" y="21" fill="#0369A1" fontSize="8" fontWeight="800" fontFamily="monospace">re^iθ</text>
        </svg>
      );

    // 10. Symbolic Derivative Calculator
    case 'symbolic-derivative-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`ib10-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EEF2FF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#ib10-${uid})`} stroke="#A5B4FC" strokeWidth="1.5" />
          <path d="M12 12V50H52" stroke="#4F46E5" strokeWidth="1.6" strokeOpacity="0.4" strokeLinecap="round" />
          <path d="M24 34H42V21" stroke="#6366F1" strokeWidth="1.6" strokeDasharray="3 2.5" />
          <text x="30" y="42" fill="#4338CA" fontSize="7.5" fontWeight="700" fontFamily="monospace">dx</text>
          <text x="44" y="30" fill="#4338CA" fontSize="7.5" fontWeight="700" fontFamily="monospace">dy</text>
          <path d="M14 48C20 45 25 32 33 27.5C41 23 46 15 50 12" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" />
          <path d="M15 40.5L50 15.5" stroke="#F97316" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="33" cy="27.5" r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.8" />
          <text x="15" y="20" fill="#3730A3" fontSize="8.5" fontWeight="800" fontFamily="monospace">f&apos;(x)</text>
        </svg>
      );

    // 11. Definite Integral & Riemann Plotter
    case 'definite-integral-riemann-plotter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`vb11-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
            <linearGradient id={`af11-${uid}`} x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#vb11-${uid})`} stroke="#C4B5FD" strokeWidth="1.5" />
          <path d="M18 48V28C25 17 37 17 46 26V48H18Z" fill={`url(#af11-${uid})`} />
          <rect x="18" y="28" width="7" height="20" fill="#8B5CF6" fillOpacity="0.18" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="25" y="21" width="7" height="27" fill="#8B5CF6" fillOpacity="0.24" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="32" y="20" width="7" height="28" fill="#8B5CF6" fillOpacity="0.24" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="39" y="25" width="7" height="23" fill="#8B5CF6" fillOpacity="0.18" stroke="#7C3AED" strokeWidth="1.2" />
          <path d="M11 48H53" stroke="#5B21B6" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 35C19 18 37 15 52 31" stroke="#5B21B6" strokeWidth="2.8" strokeLinecap="round" />
          <text x="12" y="21" fill="#6D28D9" fontSize="13" fontWeight="800" fontFamily="serif">∫</text>
          <text x="17" y="55" fill="#5B21B6" fontSize="7" fontWeight="700" fontFamily="monospace">a</text>
          <text x="44" y="55" fill="#5B21B6" fontSize="7" fontWeight="700" fontFamily="monospace">b</text>
        </svg>
      );

    // 12. Limits & L'Hopital Explorer
    case 'limits-lhopital-explorer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg12-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EEF2FF" />
              <stop offset="100%" stopColor="#F5F3FF" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg12-${uid})`} stroke="#C4B5FD" strokeWidth="1.5" />
          <path d="M32 14V50M12 46H52" stroke="#6D28D9" strokeWidth="1.2" strokeOpacity="0.35" strokeDasharray="2.5 2.5" />
          <path d="M13 42C20 34 25 27 29 25" stroke="#4F46E5" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M35 25C40 24 46 21 51 16" stroke="#4F46E5" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="32" cy="25" r="3.8" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.3" />
          <text x="13" y="19" fill="#4338CA" fontSize="8" fontWeight="800" fontFamily="monospace">lim L</text>
        </svg>
      );

    // 13. Taylor & Maclaurin Series Visualizer
    case 'taylor-maclaurin-series-visualizer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg13-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg13-${uid})`} stroke="#A5B4FC" strokeWidth="1.5" />
          <path d="M10 32H54M32 10V54" stroke="#6366F1" strokeWidth="1.2" strokeOpacity="0.35" />
          <path d="M11 40C17 18 25 18 32 32C39 46 47 46 53 24" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 48C22 36 42 28 50 16" stroke="#F97316" strokeWidth="2.2" strokeDasharray="3.5 2.5" strokeLinecap="round" />
          <text x="13" y="19" fill="#4338CA" fontSize="8" fontWeight="800" fontFamily="monospace">Pₙ(x)</text>
        </svg>
      );

    // 14. Sequence & Series Convergence Tester
    case 'sequence-series-convergence-tester':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg14-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg14-${uid})`} stroke="#C4B5FD" strokeWidth="1.5" />
          <path d="M12 31H52" stroke="#10B981" strokeWidth="1.6" strokeDasharray="3 2.5" />
          <circle cx="15" cy="16" r="2.8" fill="#6D28D9" />
          <circle cx="22" cy="43" r="2.8" fill="#6D28D9" />
          <circle cx="29" cy="23" r="2.8" fill="#6D28D9" />
          <circle cx="36" cy="36" r="2.8" fill="#6D28D9" />
          <circle cx="43" cy="29" r="2.8" fill="#059669" />
          <circle cx="50" cy="31" r="2.8" fill="#059669" />
          <text x="14" y="54" fill="#5B21B6" fontSize="8" fontWeight="800" fontFamily="monospace">Σ aₙ→L</text>
        </svg>
      );

    // 15. Matrix Algebra & RREF Lab
    case 'matrix-algebra-rref-lab':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`eb15-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="100%" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#eb15-${uid})`} stroke="#6EE7B7" strokeWidth="1.5" />
          <path d="M16 13H11V51H16M48 13H53V51H48" stroke="#065F46" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 15V49" stroke="#059669" strokeWidth="1.4" strokeDasharray="2.5 2.5" />
          <rect x="16" y="16" width="9" height="9" rx="2.5" fill="#059669" />
          <text x="18.5" y="23" fill="#FFFFFF" fontSize="7.5" fontWeight="800" fontFamily="monospace">1</text>
          <text x="29.5" y="23" fill="#065F46" fontSize="7.5" fontWeight="700" fontFamily="monospace">0</text>
          <text x="43" y="23" fill="#047857" fontSize="7.5" fontWeight="800" fontFamily="monospace">2</text>
          <text x="18.5" y="34.5" fill="#065F46" fontSize="7.5" fontWeight="700" fontFamily="monospace">0</text>
          <rect x="27" y="27.5" width="9" height="9" rx="2.5" fill="#059669" />
          <text x="29.5" y="34.5" fill="#FFFFFF" fontSize="7.5" fontWeight="800" fontFamily="monospace">1</text>
          <text x="43" y="34.5" fill="#047857" fontSize="7.5" fontWeight="800" fontFamily="monospace">5</text>
          <text x="18.5" y="46" fill="#065F46" fontSize="7.5" fontWeight="700" fontFamily="monospace">0</text>
          <text x="29.5" y="46" fill="#065F46" fontSize="7.5" fontWeight="700" fontFamily="monospace">0</text>
          <rect x="41" y="39" width="8" height="9" rx="2.5" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="1.2" />
          <text x="43" y="46" fill="#065F46" fontSize="7.5" fontWeight="800" fontFamily="monospace">1</text>
        </svg>
      );

    // 16. Eigenvalues & Eigenvectors Calculator
    case 'eigenvalues-eigenvectors-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`tb17-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#CCFBF1" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#tb17-${uid})`} stroke="#5EEAD4" strokeWidth="1.5" />
          <path d="M12 46L34 12M24 50L46 16M10 38L48 26M14 50L52 38" stroke="#99F6E4" strokeWidth="1.3" />
          <path d="M16 48L48 16" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 16H48V24" stroke="#0D9488" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 48L31 33" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M25 33H31V39" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="48" r="3.5" fill="#115E59" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="14" y="22" fill="#115E59" fontSize="8.5" fontWeight="800" fontFamily="monospace">Av=λv</text>
        </svg>
      );

    // 17. 3D Vector Dot & Cross Visualizer
    case '3d-vector-dot-cross-visualizer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg17v-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="100%" stopColor="#CCFBF1" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg17v-${uid})`} stroke="#5EEAD4" strokeWidth="1.5" />
          <polygon points="20,44 37,44 47,33 30,33" fill="#14B8A6" fillOpacity="0.22" stroke="#0F766E" strokeWidth="1.3" />
          <path d="M20 44V16" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M16.5 21L20 15L23.5 21" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 44H42" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M20 44L33 31" stroke="#0284C7" strokeWidth="2.6" strokeLinecap="round" />
          <text x="27" y="20" fill="#0F766E" fontSize="8" fontWeight="800" fontFamily="monospace">u×v</text>
        </svg>
      );

    // 18. Vector Calculus Operator Suite (Grad, Div & Curl)
    case 'vector-calculus-grad-div-curl':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg18-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg18-${uid})`} stroke="#6EE7B7" strokeWidth="1.5" />
          <circle cx="32" cy="34" r="14" stroke="#0D9488" strokeWidth="2.2" strokeDasharray="16 6" />
          <circle cx="32" cy="34" r="7" stroke="#059669" strokeWidth="2" />
          <path d="M44 27L47 34L40 31" fill="#0D9488" />
          <text x="32" y="16" textAnchor="middle" fill="#065F46" fontSize="8.5" fontWeight="800" fontFamily="monospace">∇·F · ∇×F</text>
        </svg>
      );

    // 19. Descriptive Statistics & Box-Plot Generator
    case 'descriptive-statistics-boxplot':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg19-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FFE4E6" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg19-${uid})`} stroke="#FDA4AF" strokeWidth="1.5" />
          <path d="M13 33H21M42 33H50M13 28V38M50 28V38" stroke="#9F1239" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="21" y="23" width="21" height="20" rx="3" fill="#FB7185" fillOpacity="0.35" stroke="#BE123C" strokeWidth="2.2" />
          <path d="M33 23V43" stroke="#EA580C" strokeWidth="2.8" />
          <text x="32" y="53" textAnchor="middle" fill="#881337" fontSize="7.5" fontWeight="800" fontFamily="monospace">Q₁·Med·Q₃</text>
        </svg>
      );

    // 20. Probability Distribution Explorer
    case 'probability-distribution-explorer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg20-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg20-${uid})`} stroke="#F9A8D4" strokeWidth="1.5" />
          <rect x="14" y="38" width="6" height="10" rx="1.5" fill="#F43F5E" fillOpacity="0.4" />
          <rect x="22" y="28" width="6" height="20" rx="1.5" fill="#F43F5E" fillOpacity="0.65" />
          <rect x="30" y="20" width="6" height="28" rx="1.5" fill="#E11D48" />
          <rect x="38" y="29" width="6" height="19" rx="1.5" fill="#F43F5E" fillOpacity="0.65" />
          <rect x="46" y="40" width="6" height="8" rx="1.5" fill="#F43F5E" fillOpacity="0.4" />
          <path d="M12 46C18 46 23 18 33 18C43 18 47 46 53 46" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // 21. Hypothesis Testing Suite
    case 'hypothesis-testing-suite':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`rb21-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FFE4E6" />
            </linearGradient>
            <linearGradient id={`bf21-${uid}`} x1="32" y1="16" x2="32" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#rb21-${uid})`} stroke="#FDA4AF" strokeWidth="1.5" />
          <path d="M10 46C18 46 21 17 32 17C43 17 46 46 54 46H10Z" fill={`url(#bf21-${uid})`} />
          <path d="M41 29C44 38 47 46 54 46H41V29Z" fill="#E11D48" fillOpacity="0.55" />
          <path d="M9 46H55" stroke="#881337" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 46C18 46 21 17 32 17C43 17 46 46 54 46" stroke="#BE123C" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M32 17V46" stroke="#9F1239" strokeWidth="1.4" strokeDasharray="2.5 2" />
          <path d="M41 26V48" stroke="#E11D48" strokeWidth="2" />
          <text x="29.5" y="54" fill="#881337" fontSize="8" fontWeight="800" fontFamily="serif">μ</text>
          <text x="43" y="24" fill="#BE123C" fontSize="7.5" fontWeight="800" fontFamily="monospace">p&lt;α</text>
        </svg>
      );

    // 22. Regression & Curve Fitting Analyzer
    case 'regression-curve-fitting-analyzer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg22-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg22-${uid})`} stroke="#FDA4AF" strokeWidth="1.5" />
          <path d="M12 13V49H52" stroke="#9F1239" strokeWidth="1.6" strokeOpacity="0.45" strokeLinecap="round" />
          <path d="M14 45L50 18" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="19" cy="40" r="2.8" fill="#BE123C" />
          <circle cx="27" cy="38" r="2.8" fill="#BE123C" />
          <circle cx="33" cy="27" r="2.8" fill="#BE123C" />
          <circle cx="42" cy="26" r="2.8" fill="#BE123C" />
          <circle cx="48" cy="17" r="2.8" fill="#BE123C" />
          <text x="16" y="21" fill="#9F1239" fontSize="8" fontWeight="800" fontFamily="monospace">R²</text>
        </svg>
      );

    // 23. Combinatorics, Permutations & Pascal's Triangle
    case 'combinatorics-permutations-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg23-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg23-${uid})`} stroke="#FDBA74" strokeWidth="1.5" />
          <text x="32" y="18" textAnchor="middle" fill="#9F1239" fontSize="8.5" fontWeight="800" fontFamily="monospace">1</text>
          <text x="32" y="29" textAnchor="middle" fill="#9F1239" fontSize="8.5" fontWeight="800" fontFamily="monospace">1  1</text>
          <text x="32" y="40" textAnchor="middle" fill="#EA580C" fontSize="8.5" fontWeight="800" fontFamily="monospace">1  2  1</text>
          <text x="32" y="51" textAnchor="middle" fill="#9F1239" fontSize="8.5" fontWeight="800" fontFamily="monospace">1 3 3 1</text>
        </svg>
      );

    // 24. ODE Slope Field & RK4 Plotter
    case 'ode-slope-field-rk4-plotter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`cb25-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#CFFAFE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#cb25-${uid})`} stroke="#67E8F9" strokeWidth="1.5" />
          <g stroke="#0891B2" strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.55">
            <path d="M13 18L19 15M25 18L31 15M37 18L43 15M47 18L52 16" />
            <path d="M13 30L19 26M25 29L31 24M37 27L43 23M47 26L52 23" />
            <path d="M13 42L19 39M25 41L31 36M37 38L43 34M47 37L52 34" />
            <path d="M13 51L19 49M25 50L31 47M37 49L43 46M47 48L52 46" />
          </g>
          <path d="M12 45C22 44 31 25 52 21" stroke="#0E7490" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="24" cy="38" r="3.8" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.6" />
          <text x="13" y="13.5" fill="#155E75" fontSize="7.5" fontWeight="800" fontFamily="monospace">dy/dt</text>
        </svg>
      );

    // 25. Laplace & Fourier Transform Studio
    case 'laplace-fourier-transform-studio':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg25-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg25-${uid})`} stroke="#67E8F9" strokeWidth="1.5" />
          <path d="M11 26C14 14 18 14 21 26C24 38 28 38 31 26" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M37 48V24M43 48V18M49 48V32" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <text x="14" y="51" fill="#155E75" fontSize="7.5" fontWeight="800" fontFamily="monospace">ℒ / FFT</text>
        </svg>
      );

    // 26. Numerical Root-Finding & Optimization Lab
    case 'numerical-root-finding-lab':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg26-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#CFFAFE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg26-${uid})`} stroke="#67E8F9" strokeWidth="1.5" />
          <path d="M10 44H54" stroke="#155E75" strokeWidth="1.5" strokeOpacity="0.45" />
          <path d="M13 50C25 46 37 28 49 14" stroke="#0891B2" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M44 20L27 44" stroke="#EA580C" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="27" cy="44" r="3.2" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.4" />
          <text x="14" y="21" fill="#155E75" fontSize="7.5" fontWeight="800" fontFamily="monospace">xₙ₊₁</text>
        </svg>
      );

    // 27. Number Theory, Modular Arithmetic & RSA Cryptography Lab
    case 'number-theory-modular-rsa-calculator':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`bg27-${uid}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#CFFAFE" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#bg27-${uid})`} stroke="#5EEAD4" strokeWidth="1.5" />
          <path d="M24 27V21C24 16.5 27.5 13 32 13C36.5 13 40 16.5 40 21V27" stroke="#0F766E" strokeWidth="2.8" strokeLinecap="round" />
          <rect x="18" y="27" width="28" height="22" rx="6" fill="#0D9488" />
          <circle cx="32" cy="36" r="3" fill="#FFFFFF" />
          <path d="M32 39V44" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <text x="32" y="57" textAnchor="middle" fill="#115E59" fontSize="7" fontWeight="800" fontFamily="monospace">mod n</text>
        </svg>
      );
  }
}
