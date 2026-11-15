import type { MathToolSlug } from '../../../data/mathToolsRegistry';

export interface MathRealLifeCase {
  id: string;
  title: string;
  sector: string;
  context: string;
  latexEquation: string;
  givenParameters: string;
  verifiedResultLatex: string;
  takeaway: string;
  presetIndex: number;
}

export interface MathRealLifeMeta {
  domainTag: string;
  sectionHeading: string;
  sectionIntro: string;
  diagramTitle: string;
  diagramCaption: string;
  cases: [MathRealLifeCase, MathRealLifeCase];
}

export const MATH_REAL_LIFE_DATA: Record<MathToolSlug, MathRealLifeMeta> = {
  'scientific-expression-evaluator': {
    domainTag: 'Electrical Engineering & Quantitative Finance',
    sectionHeading: 'Real-Life Applications of Complex Arithmetic & PEMDAS Evaluation',
    sectionIntro:
      'From alternating-current (AC) phasor impedance division to nested probability and exponential formulas, exact complex and order-of-operations evaluation underpins modern engineering.',
    diagramTitle: 'AC Circuit Impedance Phasor Plane ($Z = R + j\\omega L$)',
    diagramCaption: 'Complex division computes current amplitude $|I|$ and phase lag $\\theta$ instantaneously.',
    cases: [
      {
        id: 'ac-impedance',
        title: 'AC Circuit Current & Phase Division',
        sector: 'Electrical Engineering',
        context:
          'Determine total AC current $I = V / Z$ when a sinusoidal source $V = 3 + 4i\\text{ V}$ drives an impedance $Z = 1 - 2i\\,\\Omega$.',
        latexEquation: 'I = \\frac{3 + 4i}{1 - 2i} = \\frac{(3 + 4i)(1 + 2i)}{1^2 + (-2)^2} = -1 + 2i\\text{ A}',
        givenParameters: 'Voltage V = 3 + 4i V, Impedance Z = 1 - 2i Ω',
        verifiedResultLatex: 'I = -1 + 2i\\text{ A},\\quad |I| = \\sqrt{5} \\approx 2.236\\text{ A}',
        takeaway: 'Multiplying by the complex conjugate rationalizes reactive denominators in AC circuits.',
        presetIndex: 2,
      },
      {
        id: 'bayes-combinatorics-signal',
        title: 'Digital Communication Bit-Error Probability',
        sector: 'Telecommunications',
        context:
          'Compute combinatorial packet arrangements multiplied by carrier cosine attenuation at a $60^\\circ$ phase offset.',
        latexEquation: '\\binom{8}{3} \\cdot \\cos(60^\\circ) + \\log_2(64) = 56 \\cdot \\frac{1}{2} + 6 = 34',
        givenParameters: 'n = 8 packets, k = 3 errors, phase θ = 60°',
        verifiedResultLatex: '\\text{Exact Value} = 34',
        takeaway: 'Switching between degree and radian modes prevents subtle phase errors in signal calculations.',
        presetIndex: 1,
      },
    ],
  },

  'quadratic-polynomial-solver': {
    domainTag: 'Ballistics, Physics & Microeconomic Optimization',
    sectionHeading: 'Real-Life Applications of Quadratic & Polynomial Root Finding',
    sectionIntro:
      'Parabolic trajectories, break-even pricing curves, and damped spring characteristic polynomials all depend on solving $ax^2 + bx + c = 0$ and interpreting the discriminant $\\Delta$.',
    diagramTitle: 'Parabolic Flight Trajectory & Under-Damped Oscillation Roots',
    diagramCaption: 'Real roots identify launch/landing times; complex roots $\\Delta < 0$ reveal oscillatory decay.',
    cases: [
      {
        id: 'quadratic-revenue-roots',
        title: 'Product Break-Even Price Boundaries',
        sector: 'Business & Economics',
        context:
          'A SaaS pricing model gives monthly net profit $P(x) = -x^2 + 5x - 6$ (in $10k units). Setting $P(x) = 0$ finds the minimum and maximum viable price points.',
        latexEquation: 'x^2 - 5x + 6 = 0 \\implies x = \\frac{5 \\pm \\sqrt{25 - 24}}{2} = \\{2,\\, 3\\}',
        givenParameters: 'a = 1, b = -5, c = 6 (Vertex at x = 2.5)',
        verifiedResultLatex: 'x_1 = 2,\\; x_2 = 3,\\quad \\text{Peak Profit at } x = 2.5',
        takeaway: 'The midpoint between real roots always locates the vertex optimum $x_v = -\\frac{b}{2a}$.',
        presetIndex: 1,
      },
      {
        id: 'damped-rlc-complex',
        title: 'Under-Damped Suspension Oscillation Roots',
        sector: 'Mechanical Engineering',
        context:
          'Characteristic equation $2r^2 - 4r + 5 = 0$ models an automotive shock absorber; a negative discriminant predicts sinusoidal rebound decay.',
        latexEquation: 'r = \\frac{4 \\pm \\sqrt{(-4)^2 - 4(2)(5)}}{4} = 1 \\pm \\frac{\\sqrt{24}}{4}i = 1 \\pm \\frac{\\sqrt{6}}{2}i',
        givenParameters: '2r^2 - 4r + 5 = 0 (Δ = -24 < 0)',
        verifiedResultLatex: 'r_{1,2} = 1 \\pm 1.2247i',
        takeaway: 'Complex conjugate roots indicate oscillatory resonance rather than monotonic return.',
        presetIndex: 0,
      },
    ],
  },

  'linear-equations-system-solver': {
    domainTag: 'Circuit Networks & Resource Allocation',
    sectionHeading: 'Real-Life Applications of Simultaneous Linear Systems ($A\\mathbf{x} = \\mathbf{b}$)',
    sectionIntro:
      'Whenever multiple currents, chemical mixtures, or factory production lines interact simultaneously, Gaussian elimination solves the coupled constraints in one unified system.',
    diagramTitle: 'Three-Loop Kirchhoff Current & Planar Intersection System',
    diagramCaption: 'Each row equation defines a hyperplane; their unique intersection determines system equilibrium.',
    cases: [
      {
        id: 'kirchhoff-3x3',
        title: 'Three-Loop Bridge Circuit Mesh Currents',
        sector: 'Physics & Electronics',
        context:
          'Apply Kirchhoff’s Voltage Law across 3 coupled resistor loops to determine steady branch currents $x, y, z$ simultaneously.',
        latexEquation: '\\begin{cases} 2x + y - z = 8 \\\\ -3x - y + 2z = -11 \\\\ -2x + y + 2z = -3 \\end{cases}',
        givenParameters: '3×3 Matrix System [A | b]',
        verifiedResultLatex: 'x = 2\\text{ A},\\; y = 3\\text{ A},\\; z = -1\\text{ A}',
        takeaway: 'Non-zero determinant guarantees a single steady-state current distribution.',
        presetIndex: 0,
      },
      {
        id: 'supply-chain-2x2',
        title: 'Two-Factory Production Equilibrium Point',
        sector: 'Operations Research',
        context:
          'Find the exact output mix $(x, y)$ where supply capacity intersects target demand across two production lines.',
        latexEquation: 'A\\mathbf{x} = \\mathbf{b} \\xrightarrow{\\text{RREF}} \\mathbf{x} = [x_1,\\, x_2]^T',
        givenParameters: '2×2 Coupled Linear Equations',
        verifiedResultLatex: '\\text{Unique Intersection } (x, y)',
        takeaway: 'Comparing two linear equations shows immediately if constraints conflict or overlap.',
        presetIndex: 1,
      },
    ],
  },

  'fraction-ratio-percentage-solver': {
    domainTag: 'Clinical Pharmacology & Lab Formulations',
    sectionHeading: 'Real-Life Applications of Exact Fractions, Ratios & Percent Change',
    sectionIntro:
      'Medication dilution ratios, experimental reagent yields, and architectural blueprint scaling demand exact rational arithmetic without floating-point rounding drift.',
    diagramTitle: 'Exact Rational LCD Partition & Reagent Yield Comparison',
    diagramCaption: 'Finding the Least Common Denominator aligns mixed doses cleanly before addition.',
    cases: [
      {
        id: 'pharma-fraction-lcd',
        title: 'Combining Fractional Pediatric Medication Doses',
        sector: 'Clinical Medicine',
        context:
          'Sum two weight-adjusted liquid aliquots of $\\frac{5}{12}\\text{ mL}$ and $\\frac{7}{18}\\text{ mL}$ using the exact Least Common Denominator.',
        latexEquation: '\\frac{5}{12} + \\frac{7}{18} = \\frac{15}{36} + \\frac{14}{36} = \\frac{29}{36}\\text{ mL}',
        givenParameters: '5/12 + 7/18 (LCD = 36)',
        verifiedResultLatex: '\\frac{29}{36} \\approx 0.8056\\text{ mL}',
        takeaway: 'Using exact denominators prevents cumulative dosing error in multi-step dilutions.',
        presetIndex: 0,
      },
      {
        id: 'lab-yield-pct',
        title: 'Chemical Synthesis Percentage Yield Improvement',
        sector: 'Analytical Chemistry',
        context:
          'A catalyst optimization lifts product recovery from $80\\text{ g}$ to $98\\text{ g}$. Quantify the exact relative percent gain.',
        latexEquation: '\\%\\Delta = \\frac{98 - 80}{80} \\times 100\\% = \\frac{18}{80} \\times 100\\% = +22.5\\%',
        givenParameters: 'Initial = 80, New = 98',
        verifiedResultLatex: '+22.5\\% \\text{ Yield Gain } (+18\\text{ g})',
        takeaway: 'Always divide by the baseline original quantity when reporting relative efficiency.',
        presetIndex: 2,
      },
    ],
  },

  'logarithm-exponent-simplifier': {
    domainTag: 'Radiometric Dating & Earthquake Seismology',
    sectionHeading: 'Real-Life Applications of Logarithms, Exponential Decay & Surds',
    sectionIntro:
      'Logarithmic equations invert exponential processes—unlocking half-life carbon dating, decibel acoustics, pH acidity, and Richter earthquake energy scales.',
    diagramTitle: 'Exponential Half-Life Decay ($N(t) = N_0 e^{-kt}$) & Surd Simplification',
    diagramCaption: 'Taking natural logarithms converts exponential decay curves into linear time equations.',
    cases: [
      {
        id: 'radioactive-half-life',
        title: 'Pharmacokinetic Drug Elimination Half-Life',
        sector: 'Biomedical Science',
        context:
          'A plasma antibiotic decays continuously at rate $k = 0.12\\text{ hr}^{-1}$. Solve for the exact time when $50\\%$ remains.',
        latexEquation: 'e^{-0.12t} = 0.5 \\implies t = \\frac{\\ln(0.5)}{-0.12} = \\frac{\\ln(2)}{0.12} \\approx 5.776\\text{ hr}',
        givenParameters: 'e^(-0.12x) = 0.5',
        verifiedResultLatex: 't \\approx 5.7762\\text{ hours}',
        takeaway: 'Every constant-rate decay process obeys $t_{1/2} = \\frac{\\ln 2}{k}$.',
        presetIndex: 1,
      },
      {
        id: 'exponential-scaling',
        title: 'Microbial Tripling-Time Doubling Equation',
        sector: 'Microbiology',
        context:
          'Determine the generation shift $x$ required for an exponential culture $3^{2x-1}$ to reach $243$ colonies.',
        latexEquation: '3^{2x - 1} = 243 = 3^5 \\implies 2x - 1 = 5 \\implies x = 3',
        givenParameters: 'Base b = 3, RHS = 243',
        verifiedResultLatex: 'x = 3 \\text{ (Exact Integer Solution)}',
        takeaway: 'Matching prime bases simplifies exponential equations without approximation.',
        presetIndex: 0,
      },
    ],
  },

  'interactive-unit-circle': {
    domainTag: 'AC Waveforms, Robotics & Solar Engineering',
    sectionHeading: 'Real-Life Applications of the Unit Circle & Exact Trig Values',
    sectionIntro:
      'Every rotating turbine, robotic arm joint, and oscillating radio carrier maps directly onto $(x, y) = (\\cos\\theta, \\sin\\theta)$ around the unit circle.',
    diagramTitle: 'Unit Circle Reference Triangle & Synchronized Sine/Cosine Wave',
    diagramCaption: 'Vertical height $\\sin\\theta$ tracks instantaneous wave amplitude across $0^\\circ$ to $360^\\circ$.',
    cases: [
      {
        id: 'solar-panel-tilt',
        title: 'Solar Panel Incidence Irradiance Calculation',
        sector: 'Renewable Energy',
        context:
          'At solar elevation $\\theta = 30^\\circ$ ($\\frac{\\pi}{6}\\text{ rad}$), resolve the horizontal and vertical sunlight flux components.',
        latexEquation: '\\cos(30^\\circ) = \\frac{\\sqrt{3}}{2} \\approx 0.8660,\\quad \\sin(30^\\circ) = \\frac{1}{2} = 0.5',
        givenParameters: 'θ = 30° = π/6 rad (Quadrant I)',
        verifiedResultLatex: '(\\cos\\theta,\\, \\sin\\theta) = \\left(\\frac{\\sqrt{3}}{2},\\, \\frac{1}{2}\\right)',
        takeaway: 'Special radian angles preserve exact surds crucial for engineering design tables.',
        presetIndex: 0,
      },
      {
        id: 'three-phase-power',
        title: 'Three-Phase Industrial Power Phase Shift ($120^\\circ$)',
        sector: 'Power Systems',
        context:
          'Utility grids space phase B at $\\theta = 120^\\circ$ ($\\frac{2\\pi}{3}\\text{ rad}$) in Quadrant II so combined power remains smooth.',
        latexEquation: '\\cos(120^\\circ) = -\\frac{1}{2},\\quad \\sin(120^\\circ) = \\frac{\\sqrt{3}}{2},\\quad \\tan(120^\\circ) = -\\sqrt{3}',
        givenParameters: 'θ = 120° = 2π/3 rad (Ref angle 60°)',
        verifiedResultLatex: '\\text{Quadrant II: } \\sin\\theta > 0,\\; \\cos\\theta < 0',
        takeaway: 'Reference angles quickly determine signs across all four quadrants (ASTC rule).',
        presetIndex: 2,
      },
    ],
  },

  'triangle-law-sines-cosines-solver': {
    domainTag: 'Geodetic Land Surveying & Maritime Navigation',
    sectionHeading: 'Real-Life Applications of the Law of Sines & Law of Cosines',
    sectionIntro:
      'Civil surveyors, pilots, and structural truss engineers compute inaccessible river widths, flight drift headings, and steel beam lengths using non-right triangles.',
    diagramTitle: 'Geodetic Triangulation & Oblique Distance Resolution',
    diagramCaption: 'Two known sides and an included angle (SAS) immediately unlock the third side via $c^2 = a^2 + b^2 - 2ab\\cos C$.',
    cases: [
      {
        id: 'radar-range-sas',
        title: 'Two-Vessel Coast Guard Radar Separation (SAS)',
        sector: 'Maritime Navigation',
        context:
          'Two ships leave port at distances $b = 8\\text{ km}$ and $c = 11\\text{ km}$ separated by heading angle $A = 37^\\circ$. Find the direct distance $a$ between them.',
        latexEquation: 'a = \\sqrt{8^2 + 11^2 - 2(8)(11)\\cos(37^\\circ)} \\approx 6.667\\text{ km}',
        givenParameters: 'b = 8, c = 11, A = 37° (SAS)',
        verifiedResultLatex: 'a \\approx 6.667\\text{ km},\\quad \\text{Area} = \\frac{1}{2}bc\\sin A \\approx 26.48\\text{ km}^2',
        takeaway: 'The Law of Cosines generalizes the Pythagorean theorem for any oblique angle.',
        presetIndex: 0,
      },
      {
        id: 'surveyor-baseline-asa',
        title: 'Bridge Span River Width Triangulation (ASA)',
        sector: 'Civil Surveying',
        context:
          'Measure two shore baseline angles alongside one measured riverbank tape distance to compute the span across fast-moving water.',
        latexEquation: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
        givenParameters: 'ASA Surveying Baseline Preset',
        verifiedResultLatex: '\\text{Exact Sides } a, b, c \\text{ & } R_{\\text{circum}}',
        takeaway: 'Once two angles are known, the third angle $180^\\circ - A - B$ unlocks the Law of Sines.',
        presetIndex: 2,
      },
    ],
  },

  'conic-sections-visualizer': {
    domainTag: 'Astrodynamics & Parabolic Antenna Optics',
    sectionHeading: 'Real-Life Applications of Ellipses, Hyperbolas & Parabolas',
    sectionIntro:
      'Planetary satellite orbits trace ellipses around foci, GPS time-difference tracking uses hyperbolas, and radio telescopes concentrate signals at a parabola’s focus.',
    diagramTitle: 'Elliptical Orbital Foci & Parabolic Signal Reflection',
    diagramCaption: 'Eccentricity $e = c/a$ classifies every trajectory: $e < 1$ ellipse, $e = 1$ parabola, $e > 1$ hyperbola.',
    cases: [
      {
        id: 'orbital-ellipse',
        title: 'Low-Earth Elliptical Satellite Orbit',
        sector: 'Aerospace Engineering',
        context:
          'Analyze an elliptical transfer orbit with semi-major axis $a = 5$ and semi-minor axis $b = 3$ to locate focal distance $c$ and eccentricity $e$.',
        latexEquation: '\\frac{x^2}{25} + \\frac{y^2}{9} = 1 \\implies c = \\sqrt{a^2 - b^2} = \\sqrt{25 - 9} = 4,\\quad e = \\frac{4}{5} = 0.8',
        givenParameters: 'Ellipse: a = 5, b = 3',
        verifiedResultLatex: '\\text{Foci } (\\pm 4, 0),\\quad e = 0.80',
        takeaway: 'By Kepler’s First Law, Earth occupies one geometric focus $(c, 0)$ of the orbital ellipse.',
        presetIndex: 0,
      },
      {
        id: 'satellite-dish-parabola',
        title: 'Parabolic Radio Telescope Receiver Placement',
        sector: 'Optics & Communications',
        context:
          'A parabolic reflector dish follows $x^2 = 8y$ ($4p = 8$). Determine the exact height $p$ where the horn antenna must sit.',
        latexEquation: 'x^2 = 4py \\implies 4p = 8 \\implies p = 2\\text{ m},\\quad \\text{Focus at } (0, 2)',
        givenParameters: 'Parabola x^2 = 8y',
        verifiedResultLatex: '\\text{Focus } F(0, 2),\\quad \\text{Directrix } y = -2',
        takeaway: 'Every parallel incoming signal wave reflects off the parabola directly into focus $(0, p)$.',
        presetIndex: 2,
      },
    ],
  },

  'complex-number-polar-converter': {
    domainTag: 'Signal Processing & Control Systems',
    sectionHeading: 'Real-Life Applications of Polar Complex Form & Roots of Unity',
    sectionIntro:
      'Discrete Fourier Transforms (DFT), electrical phasor multiplication, and stability poles rely on Euler’s identity $z = r e^{i\\theta}$ and De Moivre’s $n$-th roots.',
    diagramTitle: 'Argand Plane Phasor Rotation & Symmetric Roots of Unity',
    diagramCaption: 'Complex $n$-th roots space evenly around radius $r^{1/n}$ separated by $\\frac{360^\\circ}{n}$.',
    cases: [
      {
        id: 'phasor-euler',
        title: 'RF Carrier Amplitude & Phase Conversion',
        sector: 'Wireless Communications',
        context:
          'Convert rectangular I/Q demodulator sample $z = 1 + \\sqrt{3}i$ into polar magnitude and Euler angle.',
        latexEquation: 'r = \\sqrt{1^2 + (\\sqrt{3})^2} = 2,\\quad \\theta = \\arctan\\!\\left(\\frac{\\sqrt{3}}{1}\\right) = 60^\\circ = \\frac{\\pi}{3}',
        givenParameters: 'z = 1 + √3i',
        verifiedResultLatex: 'z = 2e^{i\\pi/3} = 2(\\cos 60^\\circ + i\\sin 60^\\circ)',
        takeaway: 'Multiplying phasors in polar form simply multiplies radii and adds phase angles.',
        presetIndex: 0,
      },
      {
        id: 'fft-roots-unity',
        title: '6-Point Fast Fourier Transform (FFT) Twiddle Factors',
        sector: 'Digital Audio & DSP',
        context:
          'Compute all 6 symmetric roots of $z^6 = 1$ on the unit circle used as orthogonal frequency basis weights.',
        latexEquation: '\\omega_k = e^{i \\cdot \\frac{2\\pi k}{6}},\\quad k = 0, 1, 2, 3, 4, 5',
        givenParameters: 'z = 1 + 0i, n = 6 roots',
        verifiedResultLatex: '6 \\text{ Roots spaced every } 60^\\circ',
        takeaway: 'Roots of unity form regular polygons inscribed inside the unit circle.',
        presetIndex: 2,
      },
    ],
  },

  'symbolic-derivative-calculator': {
    domainTag: 'Microeconomics & Pharmacokinetics',
    sectionHeading: 'Real-Life Applications of Symbolic Differentiation & Tangent Lines',
    sectionIntro:
      'Instantaneous velocity, marginal profit rates, drug concentration peaks, and neural network backpropagation gradients are all computed via the derivative $f\'(x)$.',
    diagramTitle: 'Nonlinear Curve $f(x)$ with Local Linear Tangent Approximation',
    diagramCaption: 'Where $f\'(x) = 0$ marks critical peaks/valleys; $f\'\'(x)$ determines concavity.',
    cases: [
      {
        id: 'drug-conc-product-rule',
        title: 'Intravenous Drug Concentration Peak Rate',
        sector: 'Pharmacokinetics',
        context:
          'Bloodstream concentration follows $C(t) = t^2 e^{-t}$. Differentiate with the Product Rule to find the instantaneous absorption/clearance slope.',
        latexEquation: "\\frac{d}{dt}\\left(t^2 e^{-t}\\right) = 2te^{-t} - t^2e^{-t} = t(2 - t)e^{-t}",
        givenParameters: 'f(x) = x^2 * exp(-x), point x = 1',
        verifiedResultLatex: "C'(1) = e^{-1} \\approx +0.3679,\\quad \\text{Peak at } t = 2",
        takeaway: 'Setting $C\'(t) = 0$ immediately reveals maximum therapeutic concentration at $t = 2$.',
        presetIndex: 1,
      },
      {
        id: 'tangent-sensitivity',
        title: 'Linear Sensor Calibration Tangent Approximation',
        sector: 'Control Systems',
        context:
          'Approximate nonlinear transducer response $f(x) = x^3 - 3x^2 + 2\\sin(x)$ around operating point $a = 1.5$ using its tangent line.',
        latexEquation: "L(x) = f(a) + f'(a)(x - a)",
        givenParameters: 'f(x) = x^3 - 3x^2 + 2sin(x), a = 1.5',
        verifiedResultLatex: "f'(1.5) = 6.75 - 9 + 2\\cos(1.5) \\approx -2.1085",
        takeaway: 'First-order tangent linearization powers real-time robotics and PID control loops.',
        presetIndex: 0,
      },
    ],
  },

  'definite-integral-riemann-plotter': {
    domainTag: 'Cardiology, Hydraulics & Probability Density',
    sectionHeading: 'Real-Life Applications of Definite Integrals & Riemann Sums',
    sectionIntro:
      'Integrating flow rate yields total fluid volume, integrating velocity yields net displacement, and integrating the Gaussian bell curve yields exact probability.',
    diagramTitle: 'Riemann Rectangles Converging to Exact Shaded Integral Area',
    diagramCaption: 'As partitions $n$ increase, midpoint & Simpson approximations converge to $\\int_a^b f(x)\\,dx$.',
    cases: [
      {
        id: 'gaussian-integral',
        title: 'Standard Normal 2-Sigma Probability Area',
        sector: 'Quality Control & Six Sigma',
        context:
          'No elementary antiderivative exists for $e^{-x^2/2}$; numerical Riemann & Simpson quadrature evaluates the exact probability within $\\pm 2$ standard deviations.',
        latexEquation: '\\frac{1}{\\sqrt{2\\pi}} \\int_{-2}^{2} e^{-x^2/2}\\,dx \\approx 0.9545\\text{ (95.45\\%)}',
        givenParameters: '∫₋₂² exp(-x²/2) dx',
        verifiedResultLatex: '\\int_{-2}^{2} e^{-x^2/2}\\,dx \\approx 2.3925',
        takeaway: 'Simpson’s Rule evaluates non-elementary bell-curve integrals to high precision.',
        presetIndex: 2,
      },
      {
        id: 'arch-bridge-area',
        title: 'Parabolic Arch Bridge Cross-Sectional Area',
        sector: 'Structural Engineering',
        context:
          'Compute exact concrete arch clearance area under $f(x) = 4 - x^2$ across $[0, 2]$ meters.',
        latexEquation: '\\int_0^2 (4 - x^2)\\,dx = \\left[4x - \\frac{x^3}{3}\\right]_0^2 = 8 - \\frac{8}{3} = \\frac{16}{3}\\text{ m}^2',
        givenParameters: 'f(x) = 4 - x^2 on [0, 2]',
        verifiedResultLatex: '\\text{Exact Area} = \\frac{16}{3} \\approx 5.3333\\text{ m}^2',
        takeaway: 'Comparing Left, Right, Midpoint, and Trapezoidal sums visualizes quadrature error.',
        presetIndex: 0,
      },
    ],
  },

  'limits-lhopital-explorer': {
    domainTag: 'Optical Diffraction & Continuous Compounding',
    sectionHeading: 'Real-Life Applications of Limits & L’Hôpital’s Rule',
    sectionIntro:
      'Whenever physical formulas hit an indeterminate $\\frac{0}{0}$ singularity—such as central beam optical intensity or instantaneous interest rates—limits resolve exact behavior.',
    diagramTitle: 'Removable $0/0$ Singularity & Smooth Limiting Convergence',
    diagramCaption: 'Near $x = a$, left and right limits converge cleanly to the ratio of derivatives $f\'(a)/g\'(a)$.',
    cases: [
      {
        id: 'optics-sinc',
        title: 'Single-Slit Laser Diffraction Central Peak ($\\text{sinc}$)',
        sector: 'Optics & Photonics',
        context:
          'Fraunhofer diffraction intensity depends on $\\frac{\\sin x}{x}$ at angle $x \\to 0$. Apply L’Hôpital’s Rule to resolve the $\\frac{0}{0}$ peak.',
        latexEquation: '\\lim_{x \\to 0} \\frac{\\sin x}{x} \\overset{\\text{L\'H}}{=} \\lim_{x \\to 0} \\frac{\\cos x}{1} = 1',
        givenParameters: 'f(x) = sin(x), g(x) = x at x → 0',
        verifiedResultLatex: '\\text{Central Peak Limit } L = 1',
        takeaway: 'The sinc limit confirms peak optical intensity occurs directly along the centerline.',
        presetIndex: 0,
      },
      {
        id: 'second-order-lhopital',
        title: 'Small-Angle Pendulum Restoring Energy Limit',
        sector: 'Classical Mechanics',
        context:
          'Evaluate the $2^{\\text{nd}}$-order indeterminate form $\\frac{1 - \\cos x}{x^2}$ governing harmonic potential energy near equilibrium.',
        latexEquation: '\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} \\overset{\\text{L\'H}}{=} \\lim_{x \\to 0} \\frac{\\sin x}{2x} \\overset{\\text{L\'H}}{=} \\frac{1}{2}',
        givenParameters: '(1 - cos x) / x² as x → 0',
        verifiedResultLatex: 'L = \\frac{1}{2} = 0.5000',
        takeaway: 'Repeated differentiation resolves higher-order $0/0$ limits cleanly.',
        presetIndex: 1,
      },
    ],
  },

  'taylor-maclaurin-series-visualizer': {
    domainTag: 'Aerospace Avionics & Real-Time Firmware',
    sectionHeading: 'Real-Life Applications of Taylor & Maclaurin Polynomial Approximations',
    sectionIntro:
      'Embedded microcontrollers, physics engines, and GPS relativity corrections replace costly transcendental functions with fast, bounded-error Taylor polynomials.',
    diagramTitle: 'Polynomial Degree-$n$ Convergence Hug onto $f(x)$',
    diagramCaption: 'Adding terms widens the accurate approximation radius around center $x = a$.',
    cases: [
      {
        id: 'pendulum-maclaurin',
        title: 'Fast Embedded Cosine Approximation in Flight Software',
        sector: 'Embedded Systems',
        context:
          'Approximate $\\cos(x)$ around $a = 0$ with a $4^{\\text{th}}$-degree Maclaurin polynomial using only simple multiplication and addition.',
        latexEquation: 'P_4(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} = 1 - \\frac{x^2}{2} + \\frac{x^4}{24}',
        givenParameters: 'cos(x) at a = 0, degree n = 4',
        verifiedResultLatex: '|R_4(0.5)| < 0.0001\\text{ rad accuracy}',
        takeaway: 'Low-degree Taylor polynomials deliver sub-millisecond accuracy on hardware without FPUs.',
        presetIndex: 0,
      },
      {
        id: 'growth-exp-taylor',
        title: 'Relativistic & Compounding Exponential Expansion',
        sector: 'Physics & Finance',
        context:
          'Expand $e^x$ to order $n = 5$ at $a = 0$ to quantify instantaneous growth residuals.',
        latexEquation: 'e^x \\approx 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\frac{x^5}{5!}',
        givenParameters: 'exp(x), a = 0, n = 5',
        verifiedResultLatex: 'P_5(1) = 2.71667 \\;(\\text{true } e \\approx 2.71828)',
        takeaway: 'Every exponential derivative equals $e^x$, making Maclaurin coefficients simply $\\frac{1}{k!}$.',
        presetIndex: 1,
      },
    ],
  },

  'sequence-series-convergence-tester': {
    domainTag: 'Annuity Valuation & Infinite Signal Filters',
    sectionHeading: 'Real-Life Applications of Infinite Series Convergence Tests',
    sectionIntro:
      'Infinite geometric cashflows, Fourier filter stability, and power-series intervals of convergence require rigorous Ratio, Root, and $p$-series tests.',
    diagramTitle: 'Partial Sum Convergence $S_N$ vs. Term Decay $a_n \\to 0$',
    diagramCaption: 'Tracking $S_N$ separates fast geometric convergence from slow divergent harmonic growth.',
    cases: [
      {
        id: 'basel-p-series',
        title: 'Spectral Energy Decay in $p$-Series Harmonics',
        sector: 'Acoustics & Analysis',
        context:
          'Verify total finite acoustic harmonic energy $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ via the $p$-series test ($p = 2 > 1$).',
        latexEquation: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\approx 1.64493',
        givenParameters: 'Term formula: 1 / n^2',
        verifiedResultLatex: '\\text{Converges since } p = 2 > 1',
        takeaway: 'Whereas $\\sum \\frac{1}{n}$ diverges slowly to infinity, $\\sum \\frac{1}{n^2}$ converges cleanly.',
        presetIndex: 0,
      },
      {
        id: 'ratio-test-exponential',
        title: 'Factorial Damped Signal Stability (Ratio Test)',
        sector: 'Control Theory',
        context:
          'Check absolute convergence when factorial growth in the denominator dominates geometric numerator amplification.',
        latexEquation: 'L = \\lim_{n \\to \\infty} \\left|\\frac{a_{n+1}}{a_n}\\right| < 1 \\implies \\text{Absolutely Convergent}',
        givenParameters: 'Ratio Test L < 1 Criterion',
        verifiedResultLatex: '\\lim |a_{n+1}/a_n| = 0 < 1',
        takeaway: 'Ratio Test $L < 1$ certifies absolute convergence regardless of sign alternations.',
        presetIndex: 1,
      },
    ],
  },

  'matrix-algebra-rref-lab': {
    domainTag: 'Leontief Input-Output Economics & 3D Graphics',
    sectionHeading: 'Real-Life Applications of Matrix RREF, Determinants & Inverses',
    sectionIntro:
      'Every 3D camera projection, multi-sector economic balance, and finite-element structural mesh is inverted and row-reduced using Gauss-Jordan matrix algebra.',
    diagramTitle: 'Row-Reduced Pivot Matrix ($I_n$) & Linear Transform Invertibility',
    diagramCaption: 'Full pivot rank ($\\det A \\ne 0$) guarantees an exact inverse $A^{-1}$ exists.',
    cases: [
      {
        id: 'unimodular-inverse',
        title: 'Lossless Integer Encryption Matrix ($\\det A = -1$)',
        sector: 'Cryptography & Coding',
        context:
          'A $3\\times 3$ unimodular Hill-cipher matrix with $\\det(A) = -1$ guarantees an exact integer inverse $A^{-1}$ with zero rounding error.',
        latexEquation: '\\det(A) = -1 \\implies A^{-1} = \\frac{1}{\\det(A)}\\,\\text{adj}(A) \\in \\mathbb{Z}^{3\\times 3}',
        givenParameters: '3×3 Unimodular Matrix A',
        verifiedResultLatex: '\\text{rank}(A) = 3,\\quad A \\cdot A^{-1} = I_3',
        takeaway: 'Unimodular matrices preserve lattice integers cleanly across encoding and decoding.',
        presetIndex: 0,
      },
      {
        id: 'singular-rank-check',
        title: 'Detecting Redundant Sensor Channels ($\\det A = 0$)',
        sector: 'Sensor Fusion',
        context:
          'When row 3 is a linear combination of rows 1 and 2, RREF reveals a zero row—alerting engineers to collinear redundant measurements.',
        latexEquation: '\\det\\!\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{bmatrix} = 0 \\implies \\text{rank}(A) = 2 < 3',
        givenParameters: '3×3 Rank-Deficient Matrix',
        verifiedResultLatex: '\\text{Singular Matrix: Non-Invertible } (\\text{nullity} = 1)',
        takeaway: 'Gaussian RREF identifies exact rank and free-variable dependencies instantaneously.',
        presetIndex: 2,
      },
    ],
  },

  'eigenvalues-eigenvectors-calculator': {
    domainTag: 'Google PageRank, PCA Data Science & Bridge Resonance',
    sectionHeading: 'Real-Life Applications of Eigenvalues, Eigenvectors & Diagonalization',
    sectionIntro:
      'Principal Component Analysis (PCA), structural natural vibration frequencies, and Markov chain steady states are governed by the spectral equation $A\\mathbf{v} = \\lambda\\mathbf{v}$.',
    diagramTitle: 'Eigenvector Invariant Directions ($A\\mathbf{v} = \\lambda\\mathbf{v}$)',
    diagramCaption: 'Transformation $A$ stretches eigenvectors strictly along their own span by factor $\\lambda$.',
    cases: [
      {
        id: 'markov-steady-state',
        title: 'Markov Population Transition Steady-State Vector',
        sector: 'Data Science & Ecology',
        context:
          'Find dominant eigenvalue $\\lambda_1$ and stationary eigenvector for transition matrix $A = \\begin{bmatrix} 4 & 2 \\\\ 1 & 3 \\end{bmatrix}$ via $\\det(A - \\lambda I) = 0$.',
        latexEquation: '\\lambda^2 - 7\\lambda + 10 = (\\lambda - 5)(\\lambda - 2) = 0 \\implies \\lambda_1 = 5,\\; \\lambda_2 = 2',
        givenParameters: '2×2 Matrix [[4, 2], [1, 3]]',
        verifiedResultLatex: '\\lambda_1 = 5,\\; \\mathbf{v}_1 = [2, 1]^T \\;|\\; \\lambda_2 = 2,\\; \\mathbf{v}_2 = [-1, 1]^T',
        takeaway: 'Repeated application $A^k\\mathbf{x}_0$ aligns rapidly along the dominant eigenvector $\\mathbf{v}_1$.',
        presetIndex: 0,
      },
      {
        id: 'pca-covariance-3x3',
        title: 'Principal Component Analysis (PCA) Feature Variance',
        sector: 'Machine Learning',
        context:
          'Symmetric covariance matrices always yield orthogonal real eigenvectors ranking directions of maximum variance in $3$D datasets.',
        latexEquation: 'C = Q\\Lambda Q^T,\\quad \\lambda_1 \\ge \\lambda_2 \\ge \\lambda_3 \\ge 0',
        givenParameters: '3×3 Symmetric Covariance Preset',
        verifiedResultLatex: '\\text{Real Orthogonal Eigenbasis}',
        takeaway: 'Sorting eigenvalues $\\lambda_1, \\lambda_2, \\lambda_3$ tells data scientists how much variance each PC captures.',
        presetIndex: 2,
      },
    ],
  },

  '3d-vector-dot-cross-visualizer': {
    domainTag: 'Mechanical Torque, Robotics & 3D Computer Graphics',
    sectionHeading: 'Real-Life Applications of 3D Dot Products, Cross Products & Projections',
    sectionIntro:
      'Calculating mechanical torque $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$, surface lighting intensity via $\\vec{u} \\cdot \\vec{v}$, and wing aerodynamic lift relies on 3D vector algebra.',
    diagramTitle: 'Right-Hand Rule Orthogonal Cross Product ($\\vec{u} \\times \\vec{v}$)',
    diagramCaption: 'Magnitude $\\|\\vec{u} \\times \\vec{v}\\|$ equals the spanned parallelogram area.',
    cases: [
      {
        id: 'torque-cross-product',
        title: 'Robotic Arm Joint Torque & Parallelogram Area',
        sector: 'Robotics & Statics',
        context:
          'Compute the 3D torque vector perpendicular to lever arm $\\mathbf{u} = \\langle 2, -1, 3 \\rangle$ and applied force $\\mathbf{v} = \\langle 1, 4, -2 \\rangle$.',
        latexEquation: '\\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ 2 & -1 & 3 \\\\ 1 & 4 & -2 \\end{vmatrix} = \\langle -10,\\, 7,\\, 9 \\rangle',
        givenParameters: 'u = ⟨2, -1, 3⟩, v = ⟨1, 4, -2⟩',
        verifiedResultLatex: '\\mathbf{u}\\cdot\\mathbf{v} = -8,\\quad \\|\\mathbf{u}\\times\\mathbf{v}\\| = \\sqrt{230} \\approx 15.17',
        takeaway: 'The cross product is strictly perpendicular to both input vectors.',
        presetIndex: 0,
      },
      {
        id: 'orthogonal-basis-ijk',
        title: 'Orthonormal Camera Coordinate Frame Verification',
        sector: '3D Game Engines',
        context:
          'Verify right-handed camera axes using unit basis vectors $\\mathbf{i} \\times \\mathbf{j} = \\mathbf{k}$ and angle $\\theta = 90^\\circ$.',
        latexEquation: '\\mathbf{i} \\cdot \\mathbf{j} = 0,\\quad \\mathbf{i} \\times \\mathbf{j} = \\mathbf{k}',
        givenParameters: 'Orthogonal Basis i, j',
        verifiedResultLatex: '\\theta = 90^\\circ,\\quad \\|\\mathbf{i} \\times \\mathbf{j}\\| = 1',
        takeaway: 'Zero dot product proves exact $90^\\circ$ orthogonality between view axes.',
        presetIndex: 1,
      },
    ],
  },

  'vector-calculus-grad-div-curl': {
    domainTag: 'Electromagnetism (Maxwell) & Gradient Descent ML',
    sectionHeading: 'Real-Life Applications of Gradient ($\\nabla f$), Divergence & Curl',
    sectionIntro:
      'Gradient ascent points toward steepest thermal or loss-landscape change, divergence measures fluid compressibility, and curl detects rotational eddies and conservative fields.',
    diagramTitle: 'Steepest Ascent Gradient Vector ($\\nabla f$) & Rotational Curl Field',
    diagramCaption: 'Zero curl ($\\nabla \\times \\mathbf{F} = \\mathbf{0}$) proves a path-independent conservative force field.',
    cases: [
      {
        id: 'conservative-field-check',
        title: 'Testing Conservative Work-Independent Force Fields',
        sector: 'Physics & Fluid Dynamics',
        context:
          'Verify whether vector field $\\mathbf{F}(x, y, z)$ has zero rotational curl everywhere so line integrals depend only on endpoints.',
        latexEquation: '\\nabla \\times \\mathbf{F} = \\left(\\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z}\\right)\\mathbf{i} + \\dots = \\mathbf{0}',
        givenParameters: 'Conservative Vector Field Preset',
        verifiedResultLatex: '\\nabla \\times \\mathbf{F} = \\langle 0, 0, 0 \\rangle \\text{ (Conservative)}',
        takeaway: 'Gravitational and electrostatic fields always satisfy $\\nabla \\times \\mathbf{F} = \\mathbf{0}$.',
        presetIndex: 1,
      },
      {
        id: 'thermal-gradient-steepest',
        title: '3D Thermal Diffusion Steepest Direction ($\\nabla T$)',
        sector: 'Heat Transfer Engineering',
        context:
          'Evaluate partial derivatives $\\nabla f = \\langle f_x, f_y, f_z \\rangle$ to track the fastest temperature rise across a turbine blade.',
        latexEquation: '\\nabla f = \\left\\langle \\frac{\\partial f}{\\partial x},\\, \\frac{\\partial f}{\\partial y},\\, \\frac{\\partial f}{\\partial z} \\right\\rangle',
        givenParameters: 'Multivariable Scalar + Vector Field',
        verifiedResultLatex: '\\text{Exact Symbolic } \\nabla f,\\; \\nabla\\cdot\\mathbf{F},\\; \\nabla\\times\\mathbf{F}',
        takeaway: 'Heat flows directly opposite the temperature gradient ($-k\\nabla T$).',
        presetIndex: 0,
      },
    ],
  },

  'descriptive-statistics-boxplot': {
    domainTag: 'Biostatistics & Manufacturing Quality Control',
    sectionHeading: 'Real-Life Applications of Five-Number Summaries, IQR & Boxplots',
    sectionIntro:
      'Before fitting complex models, analysts inspect median spread, interquartile range (IQR), and Tukey fences to flag measurement anomalies or skewed incomes.',
    diagramTitle: 'Box-and-Whisker Distribution with Tukey $1.5\\times\\text{IQR}$ Outlier Fence',
    diagramCaption: 'Observations beyond $Q_3 + 1.5\\,\\text{IQR}$ highlight extreme anomalies without distorting the median.',
    cases: [
      {
        id: 'exam-outlier-iqr',
        title: 'Detecting Extraordinary Midterm Score Outliers',
        sector: 'Academic Assessment',
        context:
          'Analyze 11 student test scores where one extra-credit observation ($118$) tests the $1.5 \\times \\text{IQR}$ upper Tukey fence.',
        latexEquation: '\\text{IQR} = Q_3 - Q_1,\\quad \\text{Upper Fence} = Q_3 + 1.5\\cdot\\text{IQR}',
        givenParameters: '62, 68, 71, 74, 75, 78, 81, 84, 88, 95, 118',
        verifiedResultLatex: '\\text{Median} = 78,\\; \\bar{x} = 81.27,\\; Q_1 = 72.5,\\; Q_3 = 86',
        takeaway: 'The median and IQR remain robust even when extreme high or low outliers enter the dataset.',
        presetIndex: 0,
      },
      {
        id: 'right-skewed-income',
        title: 'Right-Skewed Household Income Spread Analysis',
        sector: 'Labor Economics',
        context:
          'Compare arithmetic mean vs. median across a skewed salary distribution ($38k to $165k) to prevent distorted reporting.',
        latexEquation: '\\text{Skewness } > 0 \\implies \\bar{x} > \\text{Median}',
        givenParameters: '38, 42, 45, 47, 51, 54, 62, 78, 115, 165',
        verifiedResultLatex: '\\bar{x} = 69.7\\text{k} \\gg \\text{Median} = 52.5\\text{k}',
        takeaway: 'Positive skew pulls the mean far above the typical median earner.',
        presetIndex: 2,
      },
    ],
  },

  'probability-distribution-explorer': {
    domainTag: 'Psychometrics, Manufacturing & Hospital Triage',
    sectionHeading: 'Real-Life Applications of Normal, Binomial & Student’s $t$ Distributions',
    sectionIntro:
      'From IQ percentile rankings to assembly-line defect counts and small-sample clinical confidence bounds, cumulative distribution functions ($P(X \\le x)$) quantify uncertainty.',
    diagramTitle: 'Cumulative Density Tail & Critical Threshold Area',
    diagramCaption: 'Shaded probability area equals the exact CDF probability under the density curve.',
    cases: [
      {
        id: 'iq-normal-percentile',
        title: 'Standardized IQ Score Upper-Tail Percentile',
        sector: 'Psychometrics',
        context:
          'Given normally distributed scores $X \\sim \\mathcal{N}(100, 15^2)$, determine what fraction of candidates score at or below $124$.',
        latexEquation: 'Z = \\frac{124 - 100}{15} = 1.60 \\implies P(X \\le 124) = \\Phi(1.60) \\approx 0.9452',
        givenParameters: 'Normal μ = 100, σ = 15, X ≤ 124',
        verifiedResultLatex: 'P(X \\le 124) = 94.52\\%\\; (\\text{Top } 5.48\\%)',
        takeaway: 'Standardizing to $Z$-scores maps any normal scale onto universal percentile tables.',
        presetIndex: 0,
      },
      {
        id: 'binomial-batch-qc',
        title: 'Electronic Chip Manufacturing Defect Screening',
        sector: 'Quality Assurance',
        context:
          'If each microchip passes with failure probability $p = 0.35$ across a $n = 12$ sample lot, find the cumulative probability of $\\le 5$ defects.',
        latexEquation: 'P(X \\le 5) = \\sum_{k=0}^{5} \\binom{12}{k} (0.35)^k (0.65)^{12-k} \\approx 0.7947',
        givenParameters: 'Binomial n = 12, p = 0.35, k ≤ 5',
        verifiedResultLatex: 'P(X \\le 5) \\approx 79.47\\%',
        takeaway: 'Binomial CDF thresholds establish acceptance sampling rules in factories.',
        presetIndex: 1,
      },
    ],
  },

  'hypothesis-testing-suite': {
    domainTag: 'Clinical Trials, A/B Testing & Experimental Research',
    sectionHeading: 'Real-Life Applications of $Z$-Tests, $t$-Tests, ANOVA & Chi-Square',
    sectionIntro:
      'Scientific peer review relies on $p$-values and $95\\%$ confidence intervals to decide whether observed sample differences represent real effects or random noise.',
    diagramTitle: 'Two-Tailed Critical Rejection Region ($p < \\alpha = 0.05$)',
    diagramCaption: 'When the observed test statistic falls inside the red rejection tails, we reject $H_0$.',
    cases: [
      {
        id: 'clinical-one-sample-t',
        title: 'Clinical Trial Mean Efficacy ($1$-Sample $t$-Test)',
        sector: 'Biomedical Research',
        context:
          'Test whether $n = 25$ patients receiving a new therapy differ significantly from baseline $\\mu_0$ at significance level $\\alpha = 0.05$.',
        latexEquation: 't = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}},\\quad \\text{df} = n - 1 = 24',
        givenParameters: '1-Sample t-Test (n = 25, α = 0.05)',
        verifiedResultLatex: '\\text{Decision via } |t| > t_{\\text{crit}} \\iff p < \\alpha',
        takeaway: 'When population $\\sigma$ is unknown, Student’s $t$ accounts for sample estimation uncertainty.',
        presetIndex: 0,
      },
      {
        id: 'ab-welch-test',
        title: 'Two-Group A/B Conversion Rate Welch $t$-Test',
        sector: 'Product Analytics',
        context:
          'Compare two independent treatment vs. control cohorts with unequal variances using Welch’s unpooled $t$-test and Satterthwaite degrees of freedom.',
        latexEquation: 't = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}',
        givenParameters: '2-Sample Welch t-Test',
        verifiedResultLatex: '\\text{Exact } t\\text{-stat, } p\\text{-value \\& } 95\\%\\text{ CI}',
        takeaway: 'Welch’s $t$-test avoids assuming equal group variances in real-world A/B experiments.',
        presetIndex: 1,
      },
    ],
  },

  'regression-curve-fitting-analyzer': {
    domainTag: 'Analytical Spectroscopy & Predictive Modeling',
    sectionHeading: 'Real-Life Applications of Least-Squares Regression & $R^2$ Fit',
    sectionIntro:
      'Calibration curves in chemistry labs, quadratic braking distances, and exponential microbial growth models all fit empirical data by minimizing squared residuals.',
    diagramTitle: 'Ordinary Least-Squares Trendline & Residual Scatter Fit',
    diagramCaption: 'Coefficients minimize $\\sum (y_i - \\hat{y}_i)^2$, maximizing explained variance $R^2$.',
    cases: [
      {
        id: 'spectrophotometer-ols',
        title: 'UV-Vis Beer-Lambert Concentration Calibration Line',
        sector: 'Analytical Chemistry',
        context:
          'Fit a linear calibration line $\\hat{y} = mx + b$ across measured standard absorbances to predict unknown solute concentrations.',
        latexEquation: '\\hat{y} = mx + b,\\quad R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}}',
        givenParameters: 'Linear Calibration Curve Preset',
        verifiedResultLatex: 'R^2 > 0.99\\text{ Linear Beer-Lambert Fit}',
        takeaway: 'Inspecting residual plots alongside $R^2$ detects non-linear instrument saturation.',
        presetIndex: 0,
      },
      {
        id: 'bacterial-exp-fit',
        title: 'Exponential Bacterial Culture Growth Curve',
        sector: 'Bioengineering',
        context:
          'Log-transform hourly optical density readings to fit an exponential curve $\\hat{y} = A e^{kx}$ capturing doubling rate $k$.',
        latexEquation: '\\hat{y} = A e^{kx} \\iff \\ln(y) = \\ln(A) + kx',
        givenParameters: 'Exponential Growth Curve Preset',
        verifiedResultLatex: '\\text{Growth Constant } k \\text{ & Doubling } \\frac{\\ln 2}{k}',
        takeaway: 'Exponential regression outperforms linear models whenever growth compounds proportionally.',
        presetIndex: 2,
      },
    ],
  },

  'combinatorics-permutations-calculator': {
    domainTag: 'Cybersecurity Password Entropy & Clinical Trials',
    sectionHeading: 'Real-Life Applications of Permutations ($^nP_r$), Combinations ($^nC_r$) & Pascal’s Triangle',
    sectionIntro:
      'Brute-force cryptographic keyspaces, committee selection counts, and binomial probability coefficients come directly from factorial counting rules.',
    diagramTitle: 'Factorial Counting Tree & Binomial Symmetry ($^nC_r = ^nC_{n-r}$)',
    diagramCaption: 'Permutations order every selection; combinations divide out $r!$ duplicates.',
    cases: [
      {
        id: 'committee-ncr',
        title: 'Selecting an Ethics Review Sub-Committee ($^7C_3$)',
        sector: 'Research Administration',
        context:
          'How many unordered 3-member review panels can be chosen from 7 senior researchers?',
        latexEquation: '\\binom{7}{3} = \\frac{7!}{3!(7 - 3)!} = \\frac{7 \\times 6 \\times 5}{6} = 35',
        givenParameters: 'n = 7 candidates, r = 3 seats (Unordered)',
        verifiedResultLatex: '_{7}C_{3} = 35\\text{ distinct panels}',
        takeaway: 'Use combinations ($^nC_r$) whenever member roles are identical and order does not matter.',
        presetIndex: 0,
      },
      {
        id: 'podium-npr',
        title: 'Olympic Gold–Silver–Bronze Podium Outcomes ($^{10}P_3$)',
        sector: 'Sports Analytics & Scheduling',
        context:
          'When $10$ finalists race for distinct $1^{\\text{st}}$, $2^{\\text{nd}}$, and $3^{\\text{rd}}$ place medals, order strictly matters.',
        latexEquation: '_{10}P_3 = \\frac{10!}{(10 - 3)!} = 10 \\times 9 \\times 8 = 720',
        givenParameters: 'n = 10 athletes, r = 3 ordered medals',
        verifiedResultLatex: '_{10}P_3 = 720\\text{ ordered rankings}',
        takeaway: 'Permutations exceed combinations by a factor of $r! = 6$.',
        presetIndex: 1,
      },
    ],
  },

  'ode-slope-field-rk4-plotter': {
    domainTag: 'Epidemiology, Thermal Cooling & Rocket Trajectories',
    sectionHeading: 'Real-Life Applications of Differential Equations, Slope Fields & RK4',
    sectionIntro:
      'Real-world rates of change—from cooling reactors to logistic population limits—rarely have closed-form solutions, making 4th-order Runge-Kutta (RK4) the gold standard solver.',
    diagramTitle: 'Direction Slope Field with Euler vs. 4th-Order RK4 Trajectory',
    diagramCaption: 'RK4 samples four weighted slopes per step ($\\mathcal{O}(h^4)$ accuracy) compared to Euler’s tangent drift.',
    cases: [
      {
        id: 'logistic-ecology-ode',
        title: 'Logistic Wildlife Carrying Capacity ODE',
        sector: 'Population Ecology',
        context:
          'Model a fish population growing proportionally to $y$ while bounded by carrying capacity $K = 4$ thousand via $\\frac{dy}{dx} = y(1 - y/4)$.',
        latexEquation: '\\frac{dy}{dx} = y\\left(1 - \\frac{y}{4}\\right),\\quad y(0) = 0.5',
        givenParameters: 'dy/dx = y * (1 - y / 4), x₀ = 0, y₀ = 0.5',
        verifiedResultLatex: '\\lim_{x \\to \\infty} y(x) = 4 \\text{ (Equilibrium)}',
        takeaway: 'Notice how RK4 tracks the exact S-shaped logistic curve without Euler overshoot.',
        presetIndex: 1,
      },
      {
        id: 'cooling-linear-ode',
        title: 'Thermal Relaxation Forced Cooling ODE',
        sector: 'Thermodynamics',
        context:
          'Track temperature evolution under time-varying ambient heating $\\frac{dy}{dx} = x - y$ starting at $(0, 1)$.',
        latexEquation: '\\frac{dy}{dx} + y = x \\implies y(x) = x - 1 + 2e^{-x}',
        givenParameters: 'dy/dx = x - y, y(0) = 1, h = 0.25',
        verifiedResultLatex: '\\text{Exact } y(2.5) \\approx 1.6642\\; (\\text{RK4 matches to } 10^{-5})',
        takeaway: 'Comparing Euler vs. RK4 on a known linear ODE demonstrates fourth-order numerical precision.',
        presetIndex: 0,
      },
    ],
  },

  'laplace-fourier-transform-studio': {
    domainTag: 'Control Systems, Filters & Audio Harmonic Synthesis',
    sectionHeading: 'Real-Life Applications of Laplace $s$-Domain & Fourier Harmonics',
    sectionIntro:
      'Electrical and control engineers transform time-domain differential equations into algebraic $s$-domain poles via Laplace transforms and decompose audio waves via Fourier series.',
    diagramTitle: 'Damped Impulse Response & Fourier Square-Wave Harmonic Synthesis',
    diagramCaption: 'Adding odd sine harmonics ($\\frac{1}{k}\\sin kx$) builds sharp digital clock edges with Gibbs ringing.',
    cases: [
      {
        id: 'damped-rlc-laplace',
        title: 'Under-Damped Spring / RLC Circuit Laplace Pair',
        sector: 'Control Systems',
        context:
          'Convert exponentially decaying oscillation $f(t) = e^{-2t}\\sin(3t)$ into its algebraic $s$-domain transfer function $F(s)$.',
        latexEquation: '\\mathcal{L}\\{e^{-2t}\\sin(3t)\\} = \\frac{3}{(s + 2)^2 + 3^2} = \\frac{3}{s^2 + 4s + 13}',
        givenParameters: 'Decay a = 2, Frequency ω = 3',
        verifiedResultLatex: 's\\text{-poles at } s = -2 \\pm 3i\\text{ (Stable Left Half-Plane)}',
        takeaway: 'Negative real pole parts ($-a = -2 < 0$) guarantee exponential oscillation decay.',
        presetIndex: 2,
      },
      {
        id: 'gibbs-square-fourier',
        title: 'Digital Clock Square-Wave Harmonic Synthesis',
        sector: 'Audio & Signal Processing',
        context:
          'Synthesize a crisp square wave using $N = 9$ odd sinusoidal harmonics and observe the classic $\\approx 9\\%$ Gibbs overshoot.',
        latexEquation: 'f(t) \\approx \\frac{4}{\\pi} \\sum_{k=1,\\,3,\\,5,\\dots}^{N} \\frac{\\sin(kt)}{k}',
        givenParameters: 'Square Wave, N = 9 Harmonics',
        verifiedResultLatex: '\\text{Gibbs Overshoot } \\approx 8.95\\%\\text{ at jump}',
        takeaway: 'Odd harmonics shape square edges while bandwidth limits introduce predictable Gibbs ringing.',
        presetIndex: 0,
      },
    ],
  },

  'numerical-root-finding-lab': {
    domainTag: 'Corporate Finance (IRR) & Orbital Mechanics',
    sectionHeading: 'Real-Life Applications of Newton-Raphson, Bisection & Secant Solvers',
    sectionIntro:
      'Transcendental equations like Kepler’s orbital anomaly or financial Internal Rate of Return (IRR) have no algebraic formula—requiring rapid iterative root-finding.',
    diagramTitle: 'Newton-Raphson Quadratic Tangent Step Convergence',
    diagramCaption: 'Each tangent intercept $x_{k+1} = x_k - \\frac{f(x_k)}{f\'(x_k)}$ roughly doubles correct decimal digits.',
    cases: [
      {
        id: 'kepler-transcendental',
        title: 'Solar Thermal Equilibrium Transcendental Equation',
        sector: 'Physics & Finance',
        context:
          'Solve $e^{-x} - x = 0$ (the Lambert $W(1)$ Omega constant) where algebraic isolation of $x$ is impossible.',
        latexEquation: 'x_{k+1} = x_k - \\frac{e^{-x_k} - x_k}{-e^{-x_k} - 1}',
        givenParameters: 'f(x) = exp(-x) - x',
        verifiedResultLatex: 'x^* = \\Omega \\approx 0.567143\\text{ in } 4 \\text{ Newton steps}',
        takeaway: 'Newton-Raphson converges quadratically once near the root, far outpacing bisection.',
        presetIndex: 2,
      },
      {
        id: 'cubic-interval-bisect',
        title: 'Wallis’ Historic Benchmark Cubic $x^3 - x - 2 = 0$',
        sector: 'Numerical Analysis',
        context:
          'Locate the unique real root on bracket $[1, 2]$ where $f(1) = -2 < 0$ and $f(2) = +4 > 0$.',
        latexEquation: 'x^3 - x - 2 = 0,\\quad x \\in [1, 2]',
        givenParameters: 'x³ - x - 2 = 0 on [1, 2]',
        verifiedResultLatex: 'x^* \\approx 1.5213797',
        takeaway: 'Bracketed bisection guarantees convergence; Newton accelerates precision to $10^{-10}$.',
        presetIndex: 0,
      },
    ],
  },

  'number-theory-modular-rsa-calculator': {
    domainTag: 'HTTPS Public-Key Cryptography & Modular Arithmetic',
    sectionHeading: 'Real-Life Applications of Modular Inverses, Totients & RSA Encryption',
    sectionIntro:
      'Every encrypted web session, banking token, and digital signature relies on Euler’s totient $\\phi(n)$, the Extended Euclidean Algorithm, and modular exponentiation $m^e \\bmod n$.',
    diagramTitle: 'Asymmetric RSA Public/Private Key Modular Clock Pipeline',
    diagramCaption: 'Encryption raises $m^e \\bmod n$; only private modular inverse $d \\equiv e^{-1} \\pmod{\\phi(n)}$ unlocks $m$.',
    cases: [
      {
        id: 'rsa-full-cycle',
        title: 'End-to-End RSA Keypair & Ciphertext Verification',
        sector: 'Cybersecurity',
        context:
          'Generate modulus $n = 11 \\times 17 = 187$, Euler totient $\\phi(n) = 160$, public exponent $e = 7$, and private decryption key $d = 23$, then encrypt $m = 88$.',
        latexEquation: 'c \\equiv 88^7 \\equiv 11 \\pmod{187},\\quad m \\equiv 11^{23} \\equiv 88 \\pmod{187}',
        givenParameters: 'p = 11, q = 17, e = 7, m = 88',
        verifiedResultLatex: 'n = 187,\\; \\phi(n) = 160,\\; d = 23,\\; c = 11',
        takeaway: 'Modular exponentiation via square-and-multiply prevents massive integer overflow.',
        presetIndex: 0,
      },
      {
        id: 'extended-euclid-inv',
        title: 'Computing a Modular Multiplicative Inverse via Euclid',
        sector: 'Error-Correcting Codes',
        context:
          'Solve the linear congruence $17d \\equiv 1 \\pmod{43}$ using Bezout’s Extended Euclidean Algorithm.',
        latexEquation: '17 \\cdot 38 = 646 = 15 \\cdot 43 + 1 \\implies 17^{-1} \\equiv 38 \\pmod{43}',
        givenParameters: 'a = 17, mod m = 43',
        verifiedResultLatex: '17^{-1} \\equiv 38 \\pmod{43}',
        takeaway: 'A modular inverse exists if and only if $\\gcd(a, m) = 1$.',
        presetIndex: 1,
      },
    ],
  },
};
