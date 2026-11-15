import React from 'react';
import type { MathToolSlug } from '../../../data/mathToolsRegistry';

/**
 * Renders a crisp, annotated real-world mathematical SVG diagram tailored
 * specifically to each of the 27 math tools.
 */
export const MathExampleDiagram: React.FC<{ slug: MathToolSlug }> = ({ slug }) => {
  switch (slug) {
    case 'scientific-expression-evaluator':
    case 'complex-number-polar-converter':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Complex Argand Phasor Vector Diagram">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="40" y1="110" x2="260" y2="110" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="120" y1="22" x2="120" y2="170" stroke="#94A3B8" strokeWidth="1.2" />
          <circle cx="120" cy="110" r="56" fill="none" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="1.2" />
          <line x1="120" y1="110" x2="195" y2="52" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="195" cy="52" r="4.5" fill="#EA580C" />
          <path d="M120 110 L195 110 L195 52" fill="none" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="3 2" />
          <path d="M148 110 A28 28 0 0 0 142 93" fill="none" stroke="#059669" strokeWidth="2" />
          <text x="152" y="102" fontSize="11" fontWeight="700" fill="#059669">θ</text>
          <text x="202" y="48" fontSize="11" fontWeight="700" fill="#0F172A">z = a + bi</text>
          <text x="148" y="72" fontSize="11" fontWeight="700" fill="#EA580C">r = |z|</text>
          <text x="242" y="124" fontSize="10" fill="#64748B">Real (Re)</text>
          <text x="126" y="34" fontSize="10" fill="#64748B">Imag (Im)</text>
          <rect x="285" y="28" width="152" height="134" rx="10" fill="#FFF7ED" stroke="#FED7AA" />
          <text x="300" y="52" fontSize="11" fontWeight="700" fill="#EA580C">Phasor Geometry</text>
          <text x="300" y="76" fontSize="10.5" fill="#334155">Amplitude: r = √(a² + b²)</text>
          <text x="300" y="98" fontSize="10.5" fill="#334155">Phase Angle: θ = atan2(b,a)</text>
          <text x="300" y="120" fontSize="10.5" fill="#334155">Euler Form: r · e^(iθ)</text>
          <text x="300" y="142" fontSize="10" fontWeight="600" fill="#059669">Conjugate rationalizes V/Z</text>
        </svg>
      );

    case 'quadratic-polynomial-solver':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Quadratic Parabola Roots and Vertex">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="35" y1="138" x2="265" y2="138" stroke="#64748B" strokeWidth="1.4" />
          <line x1="65" y1="20" x2="65" y2="170" stroke="#94A3B8" strokeWidth="1.2" />
          <path d="M55 150 Q150 6 245 150" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="67" cy="138" r="4.5" fill="#0284C7" />
          <circle cx="233" cy="138" r="4.5" fill="#0284C7" />
          <circle cx="150" cy="78" r="4.5" fill="#059669" />
          <line x1="150" y1="78" x2="150" y2="138" stroke="#059669" strokeDasharray="3 2.5" strokeWidth="1.3" />
          <text x="72" y="154" fontSize="10.5" fontWeight="700" fill="#0284C7">x₁ (Launch)</text>
          <text x="206" y="154" fontSize="10.5" fontWeight="700" fill="#0284C7">x₂ (Break-Even)</text>
          <text x="156" y="72" fontSize="10.5" fontWeight="700" fill="#059669">Vertex (−b/2a)</text>
          <rect x="285" y="28" width="152" height="134" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="300" y="52" fontSize="11" fontWeight="700" fill="#0F172A">Discriminant Δ</text>
          <text x="300" y="76" fontSize="10.5" fill="#059669" fontWeight="600">Δ &gt; 0 : 2 Real Roots</text>
          <text x="300" y="98" fontSize="10.5" fill="#D97706" fontWeight="600">Δ = 0 : Tangent Vertex</text>
          <text x="300" y="120" fontSize="10.5" fill="#DC2626" fontWeight="600">Δ &lt; 0 : Complex Osc.</text>
          <text x="300" y="144" fontSize="10" fill="#64748B">Axis of Symmetry x = −b/2a</text>
        </svg>
      );

    case 'linear-equations-system-solver':
    case 'matrix-algebra-rref-lab':
    case 'eigenvalues-eigenvectors-calculator':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Linear System & Eigen-Basis Transformation">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="35" y1="145" x2="245" y2="145" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="80" y1="22" x2="80" y2="170" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="45" y1="150" x2="235" y2="42" stroke="#0284C7" strokeWidth="2.4" />
          <line x1="55" y1="45" x2="225" y2="155" stroke="#EA580C" strokeWidth="2.4" />
          <circle cx="145" cy="96" r="5" fill="#059669" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="155" y="93" fontSize="10.5" fontWeight="700" fill="#059669">Equilibrium Ax = b</text>
          <text x="195" y="38" fontSize="10" fontWeight="600" fill="#0284C7">Constraint 1</text>
          <text x="175" y="165" fontSize="10" fontWeight="600" fill="#EA580C">Constraint 2</text>
          <rect x="275" y="26" width="164" height="138" rx="10" fill="#ECFDF5" stroke="#A7F3D0" />
          <text x="290" y="50" fontSize="11" fontWeight="700" fill="#065F46">RREF Pivot Summary</text>
          <text x="290" y="75" fontSize="10.5" fontFamily="monospace" fill="#0F172A">[ 1  0  0 | x₁ ]</text>
          <text x="290" y="95" fontSize="10.5" fontFamily="monospace" fill="#0F172A">[ 0  1  0 | x₂ ]</text>
          <text x="290" y="115" fontSize="10.5" fontFamily="monospace" fill="#0F172A">[ 0  0  1 | x₃ ]</text>
          <text x="290" y="143" fontSize="10" fontWeight="600" fill="#059669">Full Rank ⇒ Unique Solution</text>
        </svg>
      );

    case 'fraction-ratio-percentage-solver':
    case 'combinatorics-permutations-calculator':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Proportional Partition & Combinatorial Comparison">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="24" y="34" fontSize="11" fontWeight="700" fill="#0F172A">Exact Aliquot / Probability Partition Scale</text>
          <rect x="24" y="48" width="240" height="26" rx="6" fill="#FFEDD5" stroke="#FDBA74" />
          <rect x="24" y="48" width="100" height="26" rx="6" fill="#EA580C" />
          <text x="42" y="65" fontSize="11" fontWeight="700" fill="#FFFFFF">5/12 = 15/36</text>
          <rect x="24" y="88" width="240" height="26" rx="6" fill="#E0F2FE" stroke="#7DD3FC" />
          <rect x="24" y="88" width="93" height="26" rx="6" fill="#0284C7" />
          <text x="38" y="105" fontSize="11" fontWeight="700" fill="#FFFFFF">7/18 = 14/36</text>
          <rect x="24" y="128" width="240" height="26" rx="6" fill="#ECFDF5" stroke="#6EE7B7" />
          <rect x="24" y="128" width="193" height="26" rx="6" fill="#059669" />
          <text x="44" y="145" fontSize="11" fontWeight="700" fill="#FFFFFF">Total Sum = 29/36 (80.6%)</text>
          <rect x="285" y="34" width="152" height="122" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="300" y="58" fontSize="11" fontWeight="700" fill="#EA580C">Exact Numerics</text>
          <text x="300" y="82" fontSize="10.5" fill="#334155">Zero decimal truncation</text>
          <text x="300" y="104" fontSize="10.5" fill="#334155">GCD Reduction: p / q</text>
          <text x="300" y="126" fontSize="10.5" fill="#334155">Combinatorial nCr &amp; nPr</text>
        </svg>
      );

    case 'logarithm-exponent-simplifier':
    case 'ode-slope-field-rk4-plotter':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Exponential Decay Half-Life & RK4 Slope Field">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="40" y1="150" x2="265" y2="150" stroke="#64748B" strokeWidth="1.3" />
          <line x1="40" y1="22" x2="40" y2="155" stroke="#64748B" strokeWidth="1.3" />
          <path d="M40 34 C85 88, 145 128, 255 144" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="90" x2="106" y2="90" stroke="#0284C7" strokeDasharray="3 2.5" strokeWidth="1.4" />
          <line x1="106" y1="90" x2="106" y2="150" stroke="#0284C7" strokeDasharray="3 2.5" strokeWidth="1.4" />
          <circle cx="106" cy="90" r="4.5" fill="#0284C7" />
          <text x="114" y="86" fontSize="10.5" fontWeight="700" fill="#0284C7">50% Half-Life t₁/₂</text>
          <text x="48" y="34" fontSize="10" fontWeight="700" fill="#EA580C">N₀ = 100%</text>
          <text x="210" y="166" fontSize="10" fill="#64748B">Time (t)</text>
          <rect x="285" y="28" width="152" height="134" rx="10" fill="#ECFEFF" stroke="#A5F3FC" />
          <text x="300" y="52" fontSize="11" fontWeight="700" fill="#0E7490">Decay &amp; ODE Law</text>
          <text x="300" y="76" fontSize="10.5" fill="#334155">dy/dt = −k · y(t)</text>
          <text x="300" y="98" fontSize="10.5" fill="#334155">t₁/₂ = ln(2) / k</text>
          <text x="300" y="122" fontSize="10.5" fill="#334155">RK4 tracks curved slope</text>
          <text x="300" y="142" fontSize="10" fontWeight="600" fill="#059669">Order O(h⁴) accuracy</text>
        </svg>
      );

    case 'interactive-unit-circle':
    case 'triangle-law-sines-cosines-solver':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Unit Circle & Oblique Triangulation Geometry">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <circle cx="120" cy="96" r="62" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
          <line x1="45" y1="96" x2="195" y2="96" stroke="#94A3B8" strokeWidth="1" />
          <line x1="120" y1="24" x2="120" y2="168" stroke="#94A3B8" strokeWidth="1" />
          <polygon points="120,96 164,52 164,96" fill="#F97316" fillOpacity="0.18" stroke="#EA580C" strokeWidth="2.2" />
          <circle cx="164" cy="52" r="4" fill="#EA580C" />
          <text x="169" y="50" fontSize="10.5" fontWeight="700" fill="#0F172A">(cos θ, sin θ)</text>
          <text x="168" y="79" fontSize="10" fontWeight="700" fill="#EA580C">sin θ</text>
          <text x="132" y="110" fontSize="10" fontWeight="700" fill="#0284C7">cos θ</text>
          <rect x="265" y="28" width="172" height="134" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="280" y="52" fontSize="11" fontWeight="700" fill="#0F172A">Trigonometric Laws</text>
          <text x="280" y="76" fontSize="10.5" fill="#334155">cos²θ + sin²θ = 1</text>
          <text x="280" y="98" fontSize="10.5" fill="#334155">c² = a² + b² − 2ab cos C</text>
          <text x="280" y="120" fontSize="10.5" fill="#334155">a/sin A = b/sin B = c/sin C</text>
          <text x="280" y="142" fontSize="10" fontWeight="600" fill="#0284C7">Exact surds &amp; headings</text>
        </svg>
      );

    case 'conic-sections-visualizer':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Elliptical Orbit and Parabolic Focus">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="32" y1="95" x2="256" y2="95" stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1="144" y1="22" x2="144" y2="168" stroke="#CBD5E1" strokeWidth="1.2" />
          <ellipse cx="144" cy="95" rx="92" ry="54" fill="#FFF7ED" fillOpacity="0.6" stroke="#EA580C" strokeWidth="2.5" />
          <circle cx="84" cy="95" r="4.5" fill="#0284C7" />
          <circle cx="204" cy="95" r="4.5" fill="#0284C7" />
          <circle cx="222" cy="65" r="4" fill="#059669" />
          <line x1="84" y1="95" x2="222" y2="65" stroke="#059669" strokeDasharray="3 2" strokeWidth="1.4" />
          <line x1="204" y1="95" x2="222" y2="65" stroke="#059669" strokeDasharray="3 2" strokeWidth="1.4" />
          <text x="68" y="113" fontSize="10" fontWeight="700" fill="#0284C7">F₁(−c, 0)</text>
          <text x="190" y="113" fontSize="10" fontWeight="700" fill="#0284C7">F₂(+c, 0)</text>
          <rect x="275" y="28" width="162" height="134" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="290" y="52" fontSize="11" fontWeight="700" fill="#EA580C">Kepler &amp; Optics Foci</text>
          <text x="290" y="76" fontSize="10.5" fill="#334155">d₁ + d₂ = 2a (Constant)</text>
          <text x="290" y="98" fontSize="10.5" fill="#334155">c = √(a² − b²)</text>
          <text x="290" y="120" fontSize="10.5" fill="#334155">Eccentricity e = c / a</text>
          <text x="290" y="142" fontSize="10" fontWeight="600" fill="#059669">Satellites &amp; Radar Dishes</text>
        </svg>
      );

    case 'symbolic-derivative-calculator':
    case 'limits-lhopital-explorer':
    case 'taylor-maclaurin-series-visualizer':
    case 'numerical-root-finding-lab':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Curve f(x) and Tangent Approximation">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="36" y1="150" x2="262" y2="150" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="56" y1="20" x2="56" y2="168" stroke="#94A3B8" strokeWidth="1.2" />
          <path d="M46 142 C85 135, 118 82, 152 68 C186 54, 218 42, 248 28" fill="none" stroke="#4338CA" strokeWidth="2.8" />
          <line x1="65" y1="115" x2="245" y2="28" stroke="#EA580C" strokeWidth="2.4" />
          <circle cx="152" cy="68" r="5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="158" y="84" fontSize="10.5" fontWeight="700" fill="#EA580C">Tangent Slope f&apos;(a)</text>
          <text x="195" y="28" fontSize="10" fontWeight="700" fill="#4338CA">f(x)</text>
          <rect x="280" y="28" width="158" height="134" rx="10" fill="#EEF2FF" stroke="#C7D2FE" />
          <text x="294" y="52" fontSize="11" fontWeight="700" fill="#3730A3">Local Linearization</text>
          <text x="294" y="76" fontSize="10.5" fill="#334155">L(x) = f(a) + f&apos;(a)(x−a)</text>
          <text x="294" y="98" fontSize="10.5" fill="#334155">Newton Step: −f(x)/f&apos;(x)</text>
          <text x="294" y="120" fontSize="10.5" fill="#334155">L&apos;Hôpital 0/0: f&apos;(a)/g&apos;(a)</text>
          <text x="294" y="142" fontSize="10" fontWeight="600" fill="#EA580C">Instantaneous Sensitivity</text>
        </svg>
      );

    case 'definite-integral-riemann-plotter':
    case 'sequence-series-convergence-tester':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Definite Integral Area & Riemann Partitions">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <rect x="65" y="78" width="32" height="72" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="97" y="52" width="32" height="98" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="129" y="44" width="32" height="106" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="161" y="64" width="32" height="86" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.2" />
          <rect x="193" y="96" width="32" height="54" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.2" />
          <line x1="36" y1="150" x2="258" y2="150" stroke="#475569" strokeWidth="1.5" />
          <path d="M46 112 C90 42, 160 32, 240 120" fill="none" stroke="#5B21B6" strokeWidth="2.8" />
          <text x="64" y="166" fontSize="10" fontWeight="700" fill="#5B21B6">a</text>
          <text x="220" y="166" fontSize="10" fontWeight="700" fill="#5B21B6">b</text>
          <rect x="276" y="28" width="162" height="134" rx="10" fill="#F5F3FF" stroke="#DDD6FE" />
          <text x="290" y="52" fontSize="11" fontWeight="700" fill="#5B21B6">Accumulation Integral</text>
          <text x="290" y="76" fontSize="10.5" fill="#334155">Area ≈ Σ f(xᵢ) · Δx</text>
          <text x="290" y="98" fontSize="10.5" fill="#334155">Exact = ∫ₐᵇ f(x) dx</text>
          <text x="290" y="120" fontSize="10.5" fill="#334155">Simpson Error O(h⁴)</text>
          <text x="290" y="142" fontSize="10" fontWeight="600" fill="#EA580C">Total Volume &amp; Probability</text>
        </svg>
      );

    case '3d-vector-dot-cross-visualizer':
    case 'vector-calculus-grad-div-curl':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="3D Cross Product & Gradient Orthogonal Vectors">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <polygon points="105,130 190,130 226,95 141,95" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
          <line x1="105" y1="130" x2="190" y2="130" stroke="#0284C7" strokeWidth="2.8" />
          <line x1="105" y1="130" x2="141" y2="95" stroke="#059669" strokeWidth="2.8" />
          <line x1="105" y1="130" x2="105" y2="38" stroke="#EA580C" strokeWidth="3" />
          <circle cx="105" cy="38" r="4" fill="#EA580C" />
          <text x="112" y="42" fontSize="10.5" fontWeight="700" fill="#EA580C">u × v (Torque τ)</text>
          <text x="195" y="135" fontSize="10.5" fontWeight="700" fill="#0284C7">u</text>
          <text x="145" y="90" fontSize="10.5" fontWeight="700" fill="#059669">v</text>
          <rect x="268" y="28" width="168" height="134" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="282" y="52" fontSize="11" fontWeight="700" fill="#0F172A">Vector Operators</text>
          <text x="282" y="76" fontSize="10.5" fill="#334155">Dot: u·v = |u||v|cos θ</text>
          <text x="282" y="98" fontSize="10.5" fill="#334155">Cross: |u×v| = Area</text>
          <text x="282" y="120" fontSize="10.5" fill="#334155">∇f = Steepest Ascent</text>
          <text x="282" y="142" fontSize="10" fontWeight="600" fill="#059669">∇×F = 0 ⇒ Conservative</text>
        </svg>
      );

    case 'descriptive-statistics-boxplot':
    case 'probability-distribution-explorer':
    case 'hypothesis-testing-suite':
    case 'regression-curve-fitting-analyzer':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Statistical Bell Curve Critical Region">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <path d="M35 148 C78 148, 98 42, 148 42 C198 42, 218 148, 261 148 Z" fill="#FFE4E6" fillOpacity="0.45" />
          <path d="M196 100 C212 128, 224 148, 261 148 L196 148 Z" fill="#E11D48" fillOpacity="0.55" />
          <line x1="30" y1="148" x2="266" y2="148" stroke="#64748B" strokeWidth="1.4" />
          <path d="M35 148 C78 148, 98 42, 148 42 C198 42, 218 148, 261 148" fill="none" stroke="#BE123C" strokeWidth="2.8" />
          <line x1="148" y1="42" x2="148" y2="148" stroke="#9F1239" strokeDasharray="3 2.5" strokeWidth="1.3" />
          <line x1="196" y1="88" x2="196" y2="155" stroke="#E11D48" strokeWidth="2" />
          <text x="142" y="164" fontSize="10.5" fontWeight="700" fill="#881337">μ₀</text>
          <text x="190" y="166" fontSize="10" fontWeight="700" fill="#E11D48">Z / t crit</text>
          <rect x="280" y="28" width="158" height="134" rx="10" fill="#FFF1F2" stroke="#FECDD3" />
          <text x="294" y="52" fontSize="11" fontWeight="700" fill="#9F1239">Statistical Inference</text>
          <text x="294" y="76" fontSize="10.5" fill="#334155">Z = (x̄ − μ) / (σ/√n)</text>
          <text x="294" y="98" fontSize="10.5" fill="#334155">Tukey Fence: Q₃ + 1.5·IQR</text>
          <text x="294" y="120" fontSize="10.5" fill="#334155">p &lt; α = 0.05 ⇒ Reject H₀</text>
          <text x="294" y="142" fontSize="10" fontWeight="600" fill="#059669">95% CI &amp; OLS R² Fit</text>
        </svg>
      );

    case 'laplace-fourier-transform-studio':
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="Damped Impulse Response & Fourier Harmonics">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <line x1="36" y1="95" x2="262" y2="95" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="36" y1="24" x2="36" y2="165" stroke="#64748B" strokeWidth="1.3" />
          <path
            d="M36 95 Q54 25, 72 95 T108 95 Q126 52, 144 95 T180 95 Q198 76, 216 95 T252 95"
            fill="none"
            stroke="#EA580C"
            strokeWidth="2.8"
          />
          <path d="M36 42 Q125 68, 252 88" fill="none" stroke="#0284C7" strokeDasharray="3 2.5" strokeWidth="1.5" />
          <text x="115" y="42" fontSize="10.5" fontWeight="700" fill="#0284C7">Decay Envelope e^(−at)</text>
          <rect x="278" y="28" width="160" height="134" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="292" y="52" fontSize="11" fontWeight="700" fill="#0F172A">Time ↔ Frequency</text>
          <text x="292" y="76" fontSize="10.5" fill="#334155">L&#123;e^(−at)sin(ωt)&#125;</text>
          <text x="292" y="98" fontSize="10.5" fill="#334155">= ω / ((s+a)² + ω²)</text>
          <text x="292" y="120" fontSize="10.5" fill="#334155">Stable Poles: Re(s) &lt; 0</text>
          <text x="292" y="142" fontSize="10" fontWeight="600" fill="#059669">RLC &amp; Audio Harmonics</text>
        </svg>
      );

    case 'number-theory-modular-rsa-calculator':
    default:
      return (
        <svg viewBox="0 0 460 190" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label="RSA Public and Private Key Modular Pipeline">
          <rect x="0" y="0" width="460" height="190" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <rect x="22" y="58" width="88" height="72" rx="12" fill="#FFF7ED" stroke="#FDBA74" />
          <text x="66" y="88" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F172A">Plaintext m</text>
          <text x="66" y="108" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill="#EA580C">m = 88</text>
          <path d="M114 94 H156" stroke="#EA580C" strokeWidth="2.4" markerEnd="url(#rsaArrow)" />
          <rect x="160" y="48" width="128" height="92" rx="12" fill="#0F172A" />
          <text x="224" y="74" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#FDBA74">Public Key (n, e)</text>
          <text x="224" y="98" textAnchor="middle" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#FFFFFF">c ≡ mᵉ mod n</text>
          <text x="224" y="120" textAnchor="middle" fontSize="10" fill="#94A3B8">n = p·q = 187</text>
          <path d="M292 94 H334" stroke="#059669" strokeWidth="2.4" />
          <rect x="338" y="58" width="102" height="72" rx="12" fill="#ECFDF5" stroke="#6EE7B7" />
          <text x="389" y="86" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#065F46">Private Key d</text>
          <text x="389" y="108" textAnchor="middle" fontSize="11.5" fontFamily="monospace" fontWeight="700" fill="#059669">cᵈ ≡ m mod n</text>
        </svg>
      );
  }
};
