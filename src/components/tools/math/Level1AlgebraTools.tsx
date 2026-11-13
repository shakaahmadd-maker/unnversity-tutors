import React, { useMemo, useState } from 'react';
import {
  AngleUnit,
  ComplexNum,
  complexAdd,
  complexDiv,
  complexMul,
  complexPolar,
  complexPow,
  complexSub,
  computeRrefWithSteps,
  determinantNxN,
  evalMathExpr,
  findPolynomialRoots,
  formatComplex,
  gcdInt,
  lcmInt,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum, toExactFraction } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 1: SCIENTIFIC & COMPLEX EXPRESSION EVALUATOR
// ============================================================================
export const ScientificExpressionEvaluator: React.FC = () => {
  const [mode, setMode] = useState<'pemdas' | 'complex'>('pemdas');
  const [expr, setExpr] = useState('(2 * sin(pi / 6) + ln(e^3)) * 4! / (1 + 3^2)');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('rad');
  const [varX, setVarX] = useState('2');
  const [varY, setVarY] = useState('5');

  // Complex arithmetic inputs
  const [z1Re, setZ1Re] = useState('3');
  const [z1Im, setZ1Im] = useState('4');
  const [z2Re, setZ2Re] = useState('1');
  const [z2Im, setZ2Im] = useState('-2');
  const [complexOp, setComplexOp] = useState<'+' | '-' | '*' | '/' | '^2' | '^3'>('/');

  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([
    { expr: 'ncr(10, 3) + 5!', res: '240' },
    { expr: 'sqrt(3^2 + 4^2) * cos(0)', res: '5' },
  ]);

  const evalResult = useMemo(() => {
    try {
      const x = Number(varX) || 0;
      const y = Number(varY) || 0;
      const value = evalMathExpr(expr, { x, y }, angleUnit);
      const frac = toExactFraction(value);
      const sci = Number.isFinite(value) ? value.toExponential(4) : 'Undefined';
      return { ok: true as const, value, frac, sci, error: '' };
    } catch (err) {
      return {
        ok: false as const,
        value: NaN,
        frac: null,
        sci: '',
        error: err instanceof Error ? err.message : 'Invalid expression',
      };
    }
  }, [expr, angleUnit, varX, varY]);

  const complexCalc = useMemo(() => {
    const a: ComplexNum = { re: Number(z1Re) || 0, im: Number(z1Im) || 0 };
    const b: ComplexNum = { re: Number(z2Re) || 0, im: Number(z2Im) || 0 };
    let out: ComplexNum = { re: 0, im: 0 };
    const steps: string[] = [];

    if (complexOp === '+') {
      out = complexAdd(a, b);
      steps.push(`Group real and imaginary components: (${a.re} + ${b.re}) + (${a.im} + ${b.im})i`);
      steps.push(`Result z = ${formatComplex(out)}`);
    } else if (complexOp === '-') {
      out = complexSub(a, b);
      steps.push(`Subtract real and imaginary parts: (${a.re} − ${b.re}) + (${a.im} − ${b.im})i`);
      steps.push(`Result z = ${formatComplex(out)}`);
    } else if (complexOp === '*') {
      out = complexMul(a, b);
      steps.push(`Expand via FOIL: (${a.re})(${b.re}) + (${a.re})(${b.im}i) + (${a.im}i)(${b.re}) + (${a.im})(${b.im})i²`);
      steps.push(`Substitute i² = −1: (${a.re * b.re} − ${a.im * b.im}) + (${a.re * b.im} + ${a.im * b.re})i`);
      steps.push(`Result z = ${formatComplex(out)}`);
    } else if (complexOp === '/') {
      out = complexDiv(a, b);
      const denom = b.re * b.re + b.im * b.im;
      const conj: ComplexNum = { re: b.re, im: -b.im };
      const top = complexMul(a, conj);
      steps.push(`Multiply numerator & denominator by complex conjugate z̄₂ = ${formatComplex(conj)}`);
      steps.push(`Denominator |z₂|² = (${b.re})² + (${b.im})² = ${fmtNum(denom)}`);
      steps.push(`Numerator z₁ · z̄₂ = ${formatComplex(top)}`);
      steps.push(`Divide components by ${fmtNum(denom)}: z = ${formatComplex(out)}`);
    } else if (complexOp === '^2') {
      out = complexPow(a, 2);
      steps.push(`Square z₁ = (${formatComplex(a)})² = (a² − b²) + (2ab)i`);
      steps.push(`Result z = ${formatComplex(out)}`);
    } else {
      out = complexPow(a, 3);
      steps.push(`Cube z₁ via De Moivre / binomial expansion: z₁³ = ${formatComplex(out)}`);
    }

    const polar = complexPolar(out);
    return { a, b, out, polar, steps };
  }, [z1Re, z1Im, z2Re, z2Im, complexOp]);

  const insertToken = (tok: string) => setExpr((prev) => `${prev}${tok}`);

  const solutionText =
    mode === 'pemdas'
      ? [
          `Scientific Expression Evaluation (${angleUnit.toUpperCase()})`,
          `Input: ${expr}`,
          `Variables: x = ${varX}, y = ${varY}`,
          evalResult.ok
            ? `Decimal Result: ${fmtNum(evalResult.value, 8)}`
            : `Error: ${evalResult.error}`,
          evalResult.ok && evalResult.frac
            ? `Exact Rational Form: ${evalResult.frac.num}/${evalResult.frac.den}`
            : '',
          evalResult.ok ? `Scientific Notation: ${evalResult.sci}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      : [
          `Complex Arithmetic: (${formatComplex(complexCalc.a)}) ${complexOp} ${
            complexOp.startsWith('^') ? '' : `(${formatComplex(complexCalc.b)})`
          }`,
          ...complexCalc.steps.map((s, i) => `Step ${i + 1}: ${s}`),
          `Polar Form: r = ${fmtNum(complexCalc.polar.r, 4)}, θ = ${fmtNum(complexCalc.polar.thetaDeg, 2)}° (${fmtNum(complexCalc.polar.thetaRad, 4)} rad)`,
        ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Transcendental PEMDAS',
            onSelect: () => {
              setMode('pemdas');
              setAngleUnit('rad');
              setExpr('(2 * sin(pi / 6) + ln(e^3)) * 4! / (1 + 3^2)');
            },
          },
          {
            label: 'Combinatorics & Trig (Deg)',
            onSelect: () => {
              setMode('pemdas');
              setAngleUnit('deg');
              setExpr('ncr(8, 3) * cos(60) + log2(64)');
            },
          },
          {
            label: 'Complex Division (3+4i)/(1−2i)',
            onSelect: () => {
              setMode('complex');
              setZ1Re('3');
              setZ1Im('4');
              setZ2Re('1');
              setZ2Im('-2');
              setComplexOp('/');
            },
          },
        ]}
        onReset={() => {
          setMode('pemdas');
          setAngleUnit('rad');
          setExpr('(2 * sin(pi / 6) + ln(e^3)) * 4! / (1 + 3^2)');
          setVarX('2');
          setVarY('5');
        }}
        solutionText={solutionText}
        modeLabel={mode === 'pemdas' ? `Angle: ${angleUnit.toUpperCase()}` : 'Complex z = a + bi'}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('pemdas')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'pemdas'
                  ? 'bg-[#F97316] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Real & Symbolic PEMDAS
            </button>
            <button
              type="button"
              onClick={() => setMode('complex')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'complex'
                  ? 'bg-[#F97316] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Complex Rectangular (a + bi)
            </button>
          </div>

          {mode === 'pemdas' && (
            <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
              <button
                type="button"
                onClick={() => setAngleUnit('rad')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                  angleUnit === 'rad' ? 'bg-gray-900 text-white' : 'text-gray-600'
                }`}
              >
                Radians (RAD)
              </button>
              <button
                type="button"
                onClick={() => setAngleUnit('deg')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                  angleUnit === 'deg' ? 'bg-gray-900 text-white' : 'text-gray-600'
                }`}
              >
                Degrees (DEG)
              </button>
            </div>
          )}
        </div>

        {mode === 'pemdas' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mathematical Expression (supports sin, cos, tan, ln, log, log2, sqrt, sinh, ncr, npr, gcd, lcm, n!)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expr}
                    onChange={(e) => setExpr(e.target.value)}
                    className="w-full px-4 py-3 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    placeholder="Enter expression, e.g. 2*sin(pi/4)^2 + ln(e^5)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (evalResult.ok) {
                        setHistory((prev) => [
                          { expr, res: fmtNum(evalResult.value, 6) },
                          ...prev.slice(0, 5),
                        ]);
                      }
                    }}
                    className="px-4 py-3 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 whitespace-nowrap shrink-0"
                  >
                    Save to Tape
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Variable x (optional)
                  </label>
                  <input
                    type="number"
                    value={varX}
                    onChange={(e) => setVarX(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#F9FAFB] border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Variable y (optional)
                  </label>
                  <input
                    type="number"
                    value={varY}
                    onChange={(e) => setVarY(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#F9FAFB] border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Quick Function Keypad</p>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                  {[
                    'sin(',
                    'cos(',
                    'tan(',
                    'ln(',
                    'log(',
                    'sqrt(',
                    'pi',
                    'e',
                    '^',
                    '!',
                    'ncr(',
                    'npr(',
                    'gcd(',
                    'sinh(',
                  ].map((fn) => (
                    <button
                      key={fn}
                      type="button"
                      onClick={() => insertToken(fn)}
                      className="px-2.5 py-2 text-xs font-mono font-medium bg-[#F9FAFB] hover:bg-[#FFF7ED] hover:text-[#EA580C] border border-gray-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200">
                <p className="text-xs font-semibold text-[#EA580C] mb-1">Evaluated Output</p>
                {evalResult.ok ? (
                  <>
                    <div className="text-3xl font-bold font-mono tabular-nums text-[#111827] break-all">
                      {fmtNum(evalResult.value, 8)}
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-200/70 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Exact Rational</span>
                        <span className="font-mono font-semibold text-gray-900 tabular-nums">
                          {evalResult.frac
                            ? evalResult.frac.den === 1
                              ? `${evalResult.frac.num}`
                              : `${evalResult.frac.num} / ${evalResult.frac.den}`
                            : 'Irrational / Transcendental'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Scientific Notation</span>
                        <span className="font-mono font-semibold text-gray-900 tabular-nums">
                          {evalResult.sci}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-medium text-red-700">{evalResult.error}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Calculation Tape</p>
                <div className="space-y-1.5">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setExpr(item.expr)}
                      className="w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-orange-300 text-xs font-mono"
                    >
                      <span className="truncate text-gray-600 mr-2">{item.expr}</span>
                      <span className="font-semibold text-[#EA580C] tabular-nums shrink-0">
                        = {item.res}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-700">First Complex Number z₁ = a + bi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Real Part Re(z₁)</label>
                    <input
                      type="number"
                      value={z1Re}
                      onChange={(e) => setZ1Re(e.target.value)}
                      className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Imaginary Part Im(z₁)</label>
                    <input
                      type="number"
                      value={z1Im}
                      onChange={(e) => setZ1Im(e.target.value)}
                      className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Operation</label>
                <div className="grid grid-cols-6 gap-2">
                  {(['+', '-', '*', '/', '^2', '^3'] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setComplexOp(op)}
                      className={`py-2 text-sm font-mono font-bold rounded-lg border transition-colors ${
                        complexOp === op
                          ? 'bg-[#F97316] text-white border-[#F97316]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FFF7ED]'
                      }`}
                    >
                      {op === '*' ? '×' : op === '/' ? '÷' : op === '^2' ? 'z₁²' : op === '^3' ? 'z₁³' : op}
                    </button>
                  ))}
                </div>
              </div>

              {!complexOp.startsWith('^') && (
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
                  <p className="text-xs font-semibold text-gray-700">Second Complex Number z₂ = c + di</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Real Part Re(z₂)</label>
                      <input
                        type="number"
                        value={z2Re}
                        onChange={(e) => setZ2Re(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Imaginary Part Im(z₂)</label>
                      <input
                        type="number"
                        value={z2Im}
                        onChange={(e) => setZ2Im(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200">
                <p className="text-xs font-semibold text-[#EA580C] mb-1">Rectangular Result (a + bi)</p>
                <div className="text-3xl font-bold font-mono tabular-nums text-[#111827]">
                  {formatComplex(complexCalc.out, 5)}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200/70 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-gray-500 font-sans block">Modulus |z|</span>
                    <span className="font-semibold text-gray-900">{fmtNum(complexCalc.polar.r, 5)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-sans block">Argument arg(z)</span>
                    <span className="font-semibold text-gray-900">
                      {fmtNum(complexCalc.polar.thetaDeg, 2)}° ({fmtNum(complexCalc.polar.thetaRad, 4)} rad)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Step-by-Step Algebraic Derivation</p>
                {complexCalc.steps.map((s, idx) => (
                  <div key={idx} className="text-xs font-mono text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <span className="text-[#F97316] font-bold mr-2">{idx + 1}.</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 2: QUADRATIC, CUBIC & POLYNOMIAL EQUATION SOLVER
// ============================================================================
export const QuadraticPolynomialSolver: React.FC = () => {
  const [degree, setDegree] = useState<2 | 3 | 4>(2);
  // c0*x^d + c1*x^(d-1) + ... = 0
  const [c4, setC4] = useState('1');
  const [c3, setC3] = useState('1');
  const [c2, setC2] = useState('2');
  const [c1, setC1] = useState('-4');
  const [c0, setC0] = useState('5');

  const analysis = useMemo(() => {
    const coeffs =
      degree === 2
        ? [Number(c2) || 1, Number(c1) || 0, Number(c0) || 0]
        : degree === 3
        ? [Number(c3) || 1, Number(c2) || 0, Number(c1) || 0, Number(c0) || 0]
        : [Number(c4) || 1, Number(c3) || 0, Number(c2) || 0, Number(c1) || 0, Number(c0) || 0];

    const roots = findPolynomialRoots(coeffs);
    const evalPoly = (x: number) => coeffs.reduce((acc, coef) => acc * x + coef, 0);

    let discriminant: number | null = null;
    let vertex: { h: number; k: number } | null = null;
    if (degree === 2 && Math.abs(coeffs[0]) > 1e-12) {
      const [a, b, c] = coeffs;
      discriminant = b * b - 4 * a * c;
      const h = -b / (2 * a);
      vertex = { h, k: evalPoly(h) };
    }

    const factored =
      `${fmtNum(coeffs[0], 3)}` +
      roots
        .map((r) => {
          if (Math.abs(r.im) < 1e-7) {
            const rv = r.re;
            if (Math.abs(rv) < 1e-8) return 'x';
            return `(x ${rv >= 0 ? '−' : '+'} ${fmtNum(Math.abs(rv), 3)})`;
          }
          return `(x − (${formatComplex(r, 3)}))`;
        })
        .join('');

    // Plot domain around real parts of roots
    const realCenters = roots.map((r) => r.re);
    const minRe = Math.min(...realCenters, -2);
    const maxRe = Math.max(...realCenters, 2);
    const span = Math.max(4, (maxRe - minRe) * 1.6);
    const mid = (minRe + maxRe) / 2;
    const xMin = mid - span / 2;
    const xMax = mid + span / 2;

    const samples: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 120; i++) {
      const x = xMin + ((xMax - xMin) * i) / 120;
      samples.push({ x, y: evalPoly(x) });
    }
    const ys = samples.map((p) => p.y);
    const yMin = Math.min(...ys, -2);
    const yMax = Math.max(...ys, 2);

    return { coeffs, roots, discriminant, vertex, factored, samples, xMin, xMax, yMin, yMax };
  }, [degree, c4, c3, c2, c1, c0]);

  const W = 520;
  const H = 280;
  const pad = 34;
  const sx = (x: number) =>
    pad + ((x - analysis.xMin) / (analysis.xMax - analysis.xMin || 1)) * (W - 2 * pad);
  const sy = (y: number) =>
    H - pad - ((y - analysis.yMin) / (analysis.yMax - analysis.yMin || 1)) * (H - 2 * pad);

  const pathD = analysis.samples
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(' ');

  const solutionText = [
    `Polynomial Equation Solver (Degree ${degree})`,
    `Coefficients: [${analysis.coeffs.join(', ')}]`,
    analysis.discriminant !== null ? `Quadratic Discriminant Δ = b² − 4ac = ${fmtNum(analysis.discriminant, 4)}` : '',
    analysis.vertex ? `Vertex (h, k) = (${fmtNum(analysis.vertex.h, 4)}, ${fmtNum(analysis.vertex.k, 4)})` : '',
    `Roots:`,
    ...analysis.roots.map((r, i) => `  x_${i + 1} = ${formatComplex(r, 5)}`),
    `Factored Form: P(x) = ${analysis.factored}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Complex Quadratic (2x² − 4x + 5 = 0)',
            onSelect: () => {
              setDegree(2);
              setC2('2');
              setC1('-4');
              setC0('5');
            },
          },
          {
            label: 'Real Quadratic (x² − 5x + 6 = 0)',
            onSelect: () => {
              setDegree(2);
              setC2('1');
              setC1('-5');
              setC0('6');
            },
          },
          {
            label: 'Cubic 3 Real Roots (x³ − 6x² + 11x − 6)',
            onSelect: () => {
              setDegree(3);
              setC3('1');
              setC2('-6');
              setC1('11');
              setC0('-6');
            },
          },
          {
            label: 'Quartic (x⁴ − 5x² + 4 = 0)',
            onSelect: () => {
              setDegree(4);
              setC4('1');
              setC3('0');
              setC2('-5');
              setC1('0');
              setC0('4');
            },
          },
        ]}
        onReset={() => {
          setDegree(2);
          setC2('2');
          setC1('-4');
          setC0('5');
        }}
        solutionText={solutionText}
        modeLabel={`Degree ${degree} Polynomial`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            {([2, 3, 4] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDegree(d)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                  degree === d ? 'bg-[#F97316] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {d === 2 ? 'Quadratic (Deg 2)' : d === 3 ? 'Cubic (Deg 3)' : 'Quartic (Deg 4)'}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-700">Polynomial Coefficients P(x) = 0</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {degree === 4 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">x⁴ coeff</label>
                  <input
                    type="number"
                    value={c4}
                    onChange={(e) => setC4(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              {degree >= 3 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">x³ coeff</label>
                  <input
                    type="number"
                    value={c3}
                    onChange={(e) => setC3(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">x² coeff (a)</label>
                <input
                  type="number"
                  value={c2}
                  onChange={(e) => setC2(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">x coeff (b)</label>
                <input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Constant (c)</label>
                <input
                  type="number"
                  value={c0}
                  onChange={(e) => setC0(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF7ED] border border-orange-200 space-y-2.5">
            <p className="text-xs font-semibold text-[#EA580C]">All Real & Complex Roots</p>
            <div className="space-y-1.5">
              {analysis.roots.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-orange-200/80 font-mono text-sm tabular-nums"
                >
                  <span className="text-gray-500">x_{i + 1}</span>
                  <span className="font-bold text-[#111827]">{formatComplex(r, 5)}</span>
                  <span className="text-xs font-sans text-gray-500">
                    {Math.abs(r.im) < 1e-7 ? 'Real' : 'Complex'}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-orange-200/70 text-xs font-mono text-gray-800 break-all">
              <span className="font-sans text-gray-500 block mb-0.5">Linear Factorization:</span>
              P(x) = {analysis.factored}
            </div>
          </div>

          {analysis.discriminant !== null && analysis.vertex && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-gray-200">
                <span className="text-gray-500 block">Discriminant Δ = b² − 4ac</span>
                <span className="font-mono font-bold text-base text-gray-900 tabular-nums">
                  {fmtNum(analysis.discriminant, 4)}
                </span>
                <span className="text-gray-500 block mt-0.5">
                  {analysis.discriminant > 0
                    ? '2 Distinct Real Roots'
                    : analysis.discriminant === 0
                    ? '1 Repeated Real Root'
                    : 'Complex Conjugate Pair'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-gray-200">
                <span className="text-gray-500 block">Vertex & Symmetry Axis</span>
                <span className="font-mono font-bold text-base text-gray-900 tabular-nums">
                  ({fmtNum(analysis.vertex.h, 3)}, {fmtNum(analysis.vertex.k, 3)})
                </span>
                <span className="text-gray-500 block mt-0.5 font-mono">
                  Axis: x = {fmtNum(analysis.vertex.h, 3)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700"> Cartesian Polynomial Plot y = P(x)</span>
              <span className="text-xs font-mono text-gray-500 tabular-nums">
                x ∈ [{fmtNum(analysis.xMin, 1)}, {fmtNum(analysis.xMax, 1)}]
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
              {analysis.yMin <= 0 && analysis.yMax >= 0 && (
                <line
                  x1={pad}
                  y1={sy(0)}
                  x2={W - pad}
                  y2={sy(0)}
                  stroke="#9CA3AF"
                  strokeWidth={1.2}
                />
              )}
              {analysis.xMin <= 0 && analysis.xMax >= 0 && (
                <line
                  x1={sx(0)}
                  y1={pad}
                  x2={sx(0)}
                  y2={H - pad}
                  stroke="#9CA3AF"
                  strokeWidth={1.2}
                />
              )}
              {analysis.vertex && (
                <line
                  x1={sx(analysis.vertex.h)}
                  y1={pad}
                  x2={sx(analysis.vertex.h)}
                  y2={H - pad}
                  stroke="#FDBA74"
                  strokeDasharray="4 4"
                />
              )}
              <path d={pathD} fill="none" stroke="#F97316" strokeWidth={2.6} />
              {analysis.vertex && (
                <circle
                  cx={sx(analysis.vertex.h)}
                  cy={sy(analysis.vertex.k)}
                  r={5}
                  fill="#111827"
                />
              )}
              {analysis.roots
                .filter((r) => Math.abs(r.im) < 1e-6)
                .map((r, idx) => (
                  <g key={idx}>
                    <circle cx={sx(r.re)} cy={sy(0)} r={5.5} fill="#EA580C" stroke="#FFF" strokeWidth={1.5} />
                    <text
                      x={sx(r.re)}
                      y={Math.max(16, sy(0) - 9)}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-gray-800"
                    >
                      x={fmtNum(r.re, 2)}
                    </text>
                  </g>
                ))}
            </svg>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-gray-500">
              <span>Orange curve: y = P(x)</span>
              <span>·</span>
              <span>Orange points: Real x-intercepts</span>
              {analysis.vertex && (
                <>
                  <span>·</span>
                  <span>Dark point: Parabola Vertex (h, k)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 3: SYSTEM OF LINEAR EQUATIONS SOLVER (2×2, 3×3, 4×4)
// ============================================================================
export const LinearEquationsSystemSolver: React.FC = () => {
  const [size, setSize] = useState<2 | 3 | 4>(3);
  const [aug, setAug] = useState<number[][]>([
    [2, 1, -1, 8],
    [-3, -1, 2, -11],
    [-2, 1, 2, -3],
    [0, 0, 0, 0],
  ]);

  const varNames = ['x', 'y', 'z', 'w'];

  const updateCell = (r: number, c: number, val: string) => {
    const num = Number(val);
    setAug((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? (Number.isNaN(num) ? 0 : num) : cell)) : row
      )
    );
  };

  const solved = useMemo(() => {
    const activeAug = aug.slice(0, size).map((row) => [...row.slice(0, size), row[3]]);
    const coeffMatrix = activeAug.map((r) => r.slice(0, size));
    const bVec = activeAug.map((r) => r[size]);

    const rrefAug = computeRrefWithSteps(activeAug);
    const rrefA = computeRrefWithSteps(coeffMatrix);
    const detA = determinantNxN(coeffMatrix);

    let classification: 'unique' | 'inconsistent' | 'infinite' = 'unique';
    if (rrefA.rank < rrefAug.rank) {
      classification = 'inconsistent';
    } else if (rrefA.rank < size) {
      classification = 'infinite';
    }

    const cramerDets: number[] = [];
    const solution: number[] = [];
    if (classification === 'unique') {
      for (let col = 0; col < size; col++) {
        const mod = coeffMatrix.map((row, rIdx) =>
          row.map((v, cIdx) => (cIdx === col ? bVec[rIdx] : v))
        );
        const dCol = determinantNxN(mod);
        cramerDets.push(dCol);
        solution.push(Math.abs(detA) > 1e-10 ? dCol / detA : rrefAug.rref[col][size]);
      }
    }

    return { activeAug, rrefAug, detA, classification, cramerDets, solution, rankA: rrefA.rank };
  }, [aug, size]);

  const applyPreset = (n: 2 | 3 | 4, rows: number[][]) => {
    setSize(n);
    const padded = Array.from({ length: 4 }, (_, r) => {
      const src = rows[r] || [0, 0, 0, 0, 0];
      return [src[0] ?? 0, src[1] ?? 0, src[2] ?? 0, src[n] ?? 0];
    });
    // Wait: for size 4 we need 5 columns [c0,c1,c2,c3,b]
    setAug(
      Array.from({ length: 4 }, (_, r) => {
        const src = rows[r] || [];
        return [src[0] ?? 0, src[1] ?? 0, src[2] ?? 0, src[3] ?? 0, src[4] ?? 0];
      })
    );
    void padded;
  };

  // Re-adjust activeAug to always take last index = 4 for RHS b!
  const solvedClean = useMemo(() => {
    const activeAug = aug.slice(0, size).map((row) => [
      ...Array.from({ length: size }, (_, c) => row[c] ?? 0),
      row[4] ?? row[3] ?? 0,
    ]);
    const coeffMatrix = activeAug.map((r) => r.slice(0, size));
    const bVec = activeAug.map((r) => r[size]);
    const rrefAug = computeRrefWithSteps(activeAug);
    const rrefA = computeRrefWithSteps(coeffMatrix);
    const detA = determinantNxN(coeffMatrix);

    let classification: 'unique' | 'inconsistent' | 'infinite' = 'unique';
    if (rrefA.rank < rrefAug.rank) classification = 'inconsistent';
    else if (rrefA.rank < size) classification = 'infinite';

    const cramerDets: number[] = [];
    const solution: number[] = [];
    if (classification === 'unique') {
      for (let col = 0; col < size; col++) {
        const mod = coeffMatrix.map((row, rIdx) =>
          row.map((v, cIdx) => (cIdx === col ? bVec[rIdx] : v))
        );
        const dCol = determinantNxN(mod);
        cramerDets.push(dCol);
        solution.push(Math.abs(detA) > 1e-10 ? dCol / detA : rrefAug.rref[col][size]);
      }
    }
    return { activeAug, rrefAug, detA, classification, cramerDets, solution, rankA: rrefA.rank };
  }, [aug, size]);

  void solved;

  const solutionText = [
    `${size}×${size} Linear System Solver`,
    `det(A) = ${fmtNum(solvedClean.detA, 5)} · rank(A) = ${solvedClean.rankA}`,
    `Classification: ${solvedClean.classification.toUpperCase()}`,
    ...(solvedClean.classification === 'unique'
      ? solvedClean.solution.map((val, i) => `${varNames[i]} = ${fmtNum(val, 5)}`)
      : []),
    `Row Reduction Steps:`,
    ...solvedClean.rrefAug.steps.map((s, i) => `  ${i + 1}. ${s}`),
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: '3×3 Unique (x=2, y=3, z=−1)',
            onSelect: () =>
              applyPreset(3, [
                [2, 1, -1, 0, 8],
                [-3, -1, 2, 0, -11],
                [-2, 1, 2, 0, -3],
              ]),
          },
          {
            label: '2×2 Intersection',
            onSelect: () =>
              applyPreset(2, [
                [3, 2, 0, 0, 16],
                [7, -5, 0, 0, 18],
              ]),
          },
          {
            label: '3×3 Infinite Solutions',
            onSelect: () =>
              applyPreset(3, [
                [1, 2, -1, 0, 3],
                [2, 4, -2, 0, 6],
                [1, 1, 1, 0, 4],
              ]),
          },
          {
            label: '4×4 Engineering Mesh',
            onSelect: () =>
              applyPreset(4, [
                [4, -1, 0, -1, 3],
                [-1, 4, -1, 0, 6],
                [0, -1, 4, -1, 1],
                [-1, 0, -1, 4, 10],
              ]),
          },
        ]}
        onReset={() =>
          applyPreset(3, [
            [2, 1, -1, 0, 8],
            [-3, -1, 2, 0, -11],
            [-2, 1, 2, 0, -3],
          ])
        }
        solutionText={solutionText}
        modeLabel={`${size}×${size} Augmented [A | b]`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">System Dimension (N × N)</span>
            <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    if (n === 3 && aug[0]?.length === 4) {
                      applyPreset(3, [
                        [2, 1, -1, 0, 8],
                        [-3, -1, 2, 0, -11],
                        [-2, 1, 2, 0, -3],
                      ]);
                    } else {
                      setSize(n);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                    size === n ? 'bg-[#F97316] text-white' : 'text-gray-600'
                  }`}
                >
                  {n} × {n}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2.5 overflow-x-auto">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Augmented Matrix [A | b] Input
            </p>
            {Array.from({ length: size }, (_, r) => (
              <div key={r} className="flex items-center gap-2">
                {Array.from({ length: size }, (_, c) => (
                  <div key={c} className="flex items-center gap-1 flex-1 min-w-[68px]">
                    <input
                      type="number"
                      value={aug[r]?.[c] ?? 0}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      className="w-full px-2.5 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                    <span className="text-xs font-mono text-gray-500">
                      {varNames[c]}
                      {c < size - 1 ? '+' : ''}
                    </span>
                  </div>
                ))}
                <span className="text-sm font-mono font-bold text-gray-400 px-1">=</span>
                <input
                  type="number"
                  value={aug[r]?.length === 4 ? aug[r][3] : aug[r]?.[4] ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAug((prev) =>
                      prev.map((row, ri) => {
                        const normalized =
                          row.length === 4 ? [row[0], row[1], row[2], 0, row[3]] : [...row];
                        if (ri === r) normalized[4] = Number.isNaN(v) ? 0 : v;
                        return normalized;
                      })
                    );
                  }}
                  className="w-20 px-2.5 py-2 text-center font-mono text-sm font-semibold tabular-nums bg-[#FFF7ED] border border-orange-300 rounded-lg"
                />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Gaussian Elimination Steps ({solvedClean.rrefAug.steps.length} operations)
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {solvedClean.rrefAug.steps.length === 0 ? (
                <p className="text-xs text-gray-500">Matrix is already in Reduced Row Echelon Form.</p>
              ) : (
                solvedClean.rrefAug.steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    <span className="text-[#F97316] font-bold mr-1.5">{idx + 1}.</span>
                    {s}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#EA580C]">System Classification</span>
              <span className="text-xs font-mono text-gray-700 tabular-nums">
                det(A) = {fmtNum(solvedClean.detA, 4)} · rank(A) = {solvedClean.rankA}
              </span>
            </div>

            {solvedClean.classification === 'unique' ? (
              <>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Unique Solution Exists (det(A) ≠ 0)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {solvedClean.solution.map((val, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-orange-200">
                      <span className="text-xs font-mono text-gray-500 block">{varNames[i]}</span>
                      <span className="text-lg font-bold font-mono tabular-nums text-[#111827]">
                        {fmtNum(val, 4)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200/70 text-xs font-mono text-gray-700">
                  Cramer Determinants:{' '}
                  {solvedClean.cramerDets
                    .map((d, i) => `D_${varNames[i]} = ${fmtNum(d, 3)}`)
                    .join(' · ')}
                </div>
              </>
            ) : solvedClean.classification === 'inconsistent' ? (
              <div className="text-sm text-red-800 font-medium">
                Inconsistent System (No Solution) — rank(A) = {solvedClean.rankA} &lt; rank([A|b]) ={' '}
                {solvedClean.rrefAug.rank}. A contradictory row [0 … 0 | c ≠ 0] appears in RREF.
              </div>
            ) : (
              <div className="text-sm text-amber-900 font-medium">
                Infinitely Many Solutions — rank(A) = rank([A|b]) = {solvedClean.rankA} &lt; {size}, leaving{' '}
                {size - solvedClean.rankA} free parameter(s).
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Reduced Row Echelon Form RREF([A | b])</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums bg-white rounded-lg border border-gray-200">
                <tbody>
                  {solvedClean.rrefAug.rref.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b last:border-b-0 border-gray-100">
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3 py-2 text-right ${
                            cIdx === size
                              ? 'border-l-2 border-gray-300 font-bold text-[#EA580C] bg-[#FFF7ED]/50'
                              : 'text-gray-800'
                          }`}
                        >
                          {fmtNum(val, 4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 4: FRACTION, RATIO, GCD/LCM & PERCENTAGE SOLVER
// ============================================================================
export const FractionRatioPercentageSolver: React.FC = () => {
  const [n1, setN1] = useState('5');
  const [d1, setD1] = useState('12');
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [n2, setN2] = useState('7');
  const [d2, setD2] = useState('18');

  const [pctOld, setPctOld] = useState('80');
  const [pctNew, setPctNew] = useState('98');

  const calc = useMemo(() => {
    const a = Math.trunc(Number(n1) || 0);
    const b = Math.trunc(Number(d1) || 1) || 1;
    const c = Math.trunc(Number(n2) || 0);
    const d = Math.trunc(Number(d2) || 1) || 1;

    const gDen = gcdInt(b, d);
    const lcmDen = lcmInt(b, d);

    let rawNum = 0;
    let rawDen = 1;
    const steps: string[] = [];

    if (op === '+' || op === '-') {
      const m1 = lcmDen / Math.abs(b);
      const m2 = lcmDen / Math.abs(d);
      const sA = b < 0 ? -a : a;
      const sC = d < 0 ? -c : c;
      rawNum = op === '+' ? sA * m1 + sC * m2 : sA * m1 - sC * m2;
      rawDen = lcmDen;
      steps.push(`Compute LCD = LCM(|${b}|, |${d}|) = ${lcmDen} (since GCD = ${gDen})`);
      steps.push(`Scale numerators: (${sA}×${m1})/${lcmDen} ${op} (${sC}×${m2})/${lcmDen}`);
      steps.push(`Combine over common denominator: ${rawNum}/${rawDen}`);
    } else if (op === '*') {
      rawNum = a * c;
      rawDen = b * d;
      steps.push(`Multiply numerators and denominators: (${a}×${c}) / (${b}×${d}) = ${rawNum}/${rawDen}`);
    } else {
      rawNum = a * d;
      rawDen = b * c;
      steps.push(`Multiply by reciprocal of second fraction: (${a}/${b}) × (${d}/${c}) = ${rawNum}/${rawDen}`);
    }

    if (rawDen < 0) {
      rawNum = -rawNum;
      rawDen = -rawDen;
    }

    const common = rawDen === 0 ? 1 : gcdInt(rawNum, rawDen);
    const simpNum = rawDen === 0 ? NaN : rawNum / common;
    const simpDen = rawDen === 0 ? 0 : rawDen / common;
    if (common > 1 && rawDen !== 0) {
      steps.push(`Divide numerator & denominator by GCD(${Math.abs(rawNum)}, ${rawDen}) = ${common} → ${simpNum}/${simpDen}`);
    }

    const whole = simpDen !== 0 ? Math.trunc(simpNum / simpDen) : 0;
    const rem = simpDen !== 0 ? Math.abs(simpNum % simpDen) : 0;

    // Prime factorization of lcmDen
    const factorize = (numVal: number) => {
      let n = Math.abs(Math.trunc(numVal));
      if (n < 2) return String(n);
      const factors: string[] = [];
      for (let p = 2; p * p <= n; p++) {
        let count = 0;
        while (n % p === 0) {
          count++;
          n /= p;
        }
        if (count > 0) factors.push(count > 1 ? `${p}^${count}` : `${p}`);
      }
      if (n > 1) factors.push(`${n}`);
      return factors.join(' · ');
    };

    const oldV = Number(pctOld) || 0;
    const newV = Number(pctNew) || 0;
    const pctChange = oldV !== 0 ? ((newV - oldV) / Math.abs(oldV)) * 100 : NaN;
    const pctDiff = oldV + newV !== 0 ? (Math.abs(newV - oldV) / ((Math.abs(oldV) + Math.abs(newV)) / 2)) * 100 : 0;

    return {
      a,
      b,
      c,
      d,
      gDen,
      lcmDen,
      simpNum,
      simpDen,
      whole,
      rem,
      decimal: simpDen !== 0 ? simpNum / simpDen : NaN,
      steps,
      primeB: factorize(b),
      primeD: factorize(d),
      pctChange,
      pctDiff,
    };
  }, [n1, d1, op, n2, d2, pctOld, pctNew]);

  const solutionText = [
    `Exact Rational & Percentage Solver`,
    `Operation: (${calc.a}/${calc.b}) ${op} (${calc.c}/${calc.d})`,
    ...calc.steps,
    `Reduced Fraction: ${calc.simpNum}/${calc.simpDen} (Decimal: ${fmtNum(calc.decimal, 6)})`,
    `Percentage Change (${pctOld} → ${pctNew}): ${fmtNum(calc.pctChange, 3)}%`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: '5/12 + 7/18 (LCD = 36)',
            onSelect: () => {
              setN1('5');
              setD1('12');
              setOp('+');
              setN2('7');
              setD2('18');
            },
          },
          {
            label: 'Fraction Division (14/15 ÷ 7/25)',
            onSelect: () => {
              setN1('14');
              setD1('15');
              setOp('/');
              setN2('7');
              setD2('25');
            },
          },
          {
            label: 'Lab Yield Increase (80 → 98)',
            onSelect: () => {
              setPctOld('80');
              setPctNew('98');
            },
          },
        ]}
        onReset={() => {
          setN1('5');
          setD1('12');
          setOp('+');
          setN2('7');
          setD2('18');
          setPctOld('80');
          setPctNew('98');
        }}
        solutionText={solutionText}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-3">Exact Rational Arithmetic</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="w-24 space-y-1.5">
                <input
                  type="number"
                  value={n1}
                  onChange={(e) => setN1(e.target.value)}
                  aria-label="First numerator"
                  className="w-full px-3 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
                <div className="h-0.5 bg-gray-800" />
                <input
                  type="number"
                  value={d1}
                  onChange={(e) => setD1(e.target.value)}
                  aria-label="First denominator"
                  className="w-full px-3 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(['+', '-', '*', '/'] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setOp(sym)}
                    className={`w-10 h-10 font-mono font-bold text-sm rounded-lg border ${
                      op === sym
                        ? 'bg-[#F97316] text-white border-[#F97316]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {sym === '*' ? '×' : sym === '/' ? '÷' : sym}
                  </button>
                ))}
              </div>

              <div className="w-24 space-y-1.5">
                <input
                  type="number"
                  value={n2}
                  onChange={(e) => setN2(e.target.value)}
                  aria-label="Second numerator"
                  className="w-full px-3 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
                <div className="h-0.5 bg-gray-800" />
                <input
                  type="number"
                  value={d2}
                  onChange={(e) => setD2(e.target.value)}
                  aria-label="Second denominator"
                  className="w-full px-3 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {calc.steps.map((s, i) => (
                <div
                  key={i}
                  className="text-xs font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  <span className="text-[#F97316] font-bold mr-1.5">{i + 1}.</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-3">
              Percentage Change & Relative Difference Analyzer
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial / Baseline Value (V₁)</label>
                <input
                  type="number"
                  value={pctOld}
                  onChange={(e) => setPctOld(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Final / Observed Value (V₂)</label>
                <input
                  type="number"
                  value={pctNew}
                  onChange={(e) => setPctNew(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block">Directional % Change</span>
                <span className="font-mono font-bold text-base text-[#111827] tabular-nums">
                  {calc.pctChange >= 0 ? '+' : ''}
                  {fmtNum(calc.pctChange, 3)}%
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block">Symmetric % Difference</span>
                <span className="font-mono font-bold text-base text-[#111827] tabular-nums">
                  {fmtNum(calc.pctDiff, 3)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200">
            <p className="text-xs font-semibold text-[#EA580C] mb-1">Lowest-Terms Result</p>
            <div className="text-3xl font-bold font-mono tabular-nums text-[#111827]">
              {calc.simpDen === 0
                ? 'Undefined (÷ 0)'
                : calc.simpDen === 1
                ? `${calc.simpNum}`
                : `${calc.simpNum} / ${calc.simpDen}`}
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200/70 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <div>
                <span className="font-sans text-gray-500 block">Mixed Number</span>
                <span className="font-semibold text-gray-900">
                  {calc.simpDen > 1 && Math.abs(calc.simpNum) > calc.simpDen
                    ? `${calc.whole}  ${calc.rem}/${calc.simpDen}`
                    : 'Proper Fraction'}
                </span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Decimal & Percent</span>
                <span className="font-semibold text-gray-900">
                  {fmtNum(calc.decimal, 5)} ({fmtNum(calc.decimal * 100, 2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2 text-xs">
            <p className="font-semibold text-gray-700">Denominator GCD, LCM & Prime Factors</p>
            <div className="flex justify-between font-mono py-1 border-b border-gray-200">
              <span className="text-gray-500">GCD(|{calc.b}|, |{calc.d}|)</span>
              <span className="font-semibold text-gray-900 tabular-nums">{calc.gDen}</span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-gray-200">
              <span className="text-gray-500">LCM(|{calc.b}|, |{calc.d}|)</span>
              <span className="font-semibold text-[#EA580C] tabular-nums">{calc.lcmDen}</span>
            </div>
            <div className="flex justify-between font-mono py-1 border-b border-gray-200">
              <span className="text-gray-500">Prime factors of {Math.abs(calc.b)}</span>
              <span className="font-semibold text-gray-900">{calc.primeB}</span>
            </div>
            <div className="flex justify-between font-mono py-1">
              <span className="text-gray-500">Prime factors of {Math.abs(calc.d)}</span>
              <span className="font-semibold text-gray-900">{calc.primeD}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 5: LOGARITHM, EXPONENT & RADICAL SIMPLIFIER
// ============================================================================
export const LogarithmExponentSimplifier: React.FC = () => {
  // Exponential solver a^(b*x + c) = d
  const [baseA, setBaseA] = useState('3');
  const [coefB, setCoefB] = useState('2');
  const [shiftC, setShiftC] = useState('-1');
  const [rhsD, setRhsD] = useState('243');

  // Change of base log_b(x)
  const [logBase, setLogBase] = useState('2');
  const [logArg, setLogArg] = useState('40');

  // Radical simplifier k-th root of N
  const [radIndex, setRadIndex] = useState('2');
  const [radicand, setRadicand] = useState('72');

  const computed = useMemo(() => {
    const a = Number(baseA);
    const b = Number(coefB);
    const c = Number(shiftC);
    const d = Number(rhsD);

    let expValid = a > 0 && a !== 1 && d > 0 && Math.abs(b) > 1e-12;
    const logAd = expValid ? Math.log(d) / Math.log(a) : NaN;
    const xSol = expValid ? (logAd - c) / b : NaN;
    if (!Number.isFinite(xSol)) expValid = false;

    const lb = Number(logBase);
    const lx = Number(logArg);
    const logVal = lb > 0 && lb !== 1 && lx > 0 ? Math.log(lx) / Math.log(lb) : NaN;

    // Radical simplification: N = out^k * inside
    const k = Math.max(2, Math.min(6, Math.round(Number(radIndex) || 2)));
    const N = Math.max(0, Math.trunc(Math.abs(Number(radicand) || 0)));
    let outside = 1;
    let inside = N;
    if (N > 1) {
      for (let f = 2; Math.pow(f, k) <= inside; f++) {
        const fk = Math.pow(f, k);
        while (inside % fk === 0) {
          outside *= f;
          inside /= fk;
        }
      }
    }

    return { a, b, c, d, expValid, logAd, xSol, lb, lx, logVal, k, N, outside, inside };
  }, [baseA, coefB, shiftC, rhsD, logBase, logArg, radIndex, radicand]);

  const solutionText = [
    `Exponential Equation: ${computed.a}^(${computed.b}x + ${computed.c}) = ${computed.d}`,
    computed.expValid
      ? `Step 1: log_${computed.a}(${computed.d}) = ln(${computed.d}) / ln(${computed.a}) = ${fmtNum(computed.logAd, 5)}`
      : 'Invalid domain for real exponential equation',
    computed.expValid
      ? `Step 2: ${computed.b}x + ${computed.c} = ${fmtNum(computed.logAd, 5)} ⇒ x = ${fmtNum(computed.xSol, 6)}`
      : '',
    `Change of Base: log_${computed.lb}(${computed.lx}) = ${fmtNum(computed.logVal, 6)}`,
    `Exact Surd: ${computed.k === 2 ? '√' : `${computed.k}√`}${computed.N} = ${computed.outside}${
      computed.inside === 1 ? '' : `${computed.k === 2 ? '√' : `·${computed.k}√`}${computed.inside}`
    }`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Solve 3^(2x − 1) = 243',
            onSelect: () => {
              setBaseA('3');
              setCoefB('2');
              setShiftC('-1');
              setRhsD('243');
            },
          },
          {
            label: 'Half-Life e^(−0.12x) = 0.5',
            onSelect: () => {
              setBaseA(String(Number(Math.E.toFixed(6))));
              setCoefB('-0.12');
              setShiftC('0');
              setRhsD('0.5');
            },
          },
          {
            label: 'Surd √72 = 6√2 & log₂(40)',
            onSelect: () => {
              setRadIndex('2');
              setRadicand('72');
              setLogBase('2');
              setLogArg('40');
            },
          },
        ]}
        onReset={() => {
          setBaseA('3');
          setCoefB('2');
          setShiftC('-1');
          setRhsD('243');
          setLogBase('2');
          setLogArg('40');
          setRadIndex('2');
          setRadicand('72');
        }}
        solutionText={solutionText}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-700">
              Exponential Equation Solver: a^(b·x + c) = d
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base (a &gt; 0)</label>
                <input
                  type="number"
                  step="any"
                  value={baseA}
                  onChange={(e) => setBaseA(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Slope (b)</label>
                <input
                  type="number"
                  step="any"
                  value={coefB}
                  onChange={(e) => setCoefB(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Shift (c)</label>
                <input
                  type="number"
                  step="any"
                  value={shiftC}
                  onChange={(e) => setShiftC(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Target (d &gt; 0)</label>
                <input
                  type="number"
                  step="any"
                  value={rhsD}
                  onChange={(e) => setRhsD(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            {computed.expValid ? (
              <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-orange-200 space-y-1">
                <div className="text-xs font-mono text-gray-600">
                  {computed.b}x + ({computed.c}) = ln({computed.d}) / ln({computed.a}) ={' '}
                  {fmtNum(computed.logAd, 5)}
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#111827]">
                  x = {fmtNum(computed.xSol, 6)}
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-700">
                Ensure base a &gt; 0 (a ≠ 1), target d &gt; 0, and exponent coefficient b ≠ 0.
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-700">Change-of-Base Logarithm Calculator: log_b(x)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Log Base (b)</label>
                <input
                  type="number"
                  step="any"
                  value={logBase}
                  onChange={(e) => setLogBase(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Argument (x &gt; 0)</label>
                <input
                  type="number"
                  step="any"
                  value={logArg}
                  onChange={(e) => setLogArg(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200 font-mono text-xs space-y-1 tabular-nums">
              <div>
                ln({computed.lx}) / ln({computed.lb}) = {fmtNum(Math.log(computed.lx), 4)} /{' '}
                {fmtNum(Math.log(computed.lb), 4)}
              </div>
              <div className="text-base font-bold text-[#EA580C]">
                log_{computed.lb}({computed.lx}) = {fmtNum(computed.logVal, 6)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-3">
            <p className="text-xs font-semibold text-[#EA580C]">
              Exact Radical / Surd Simplifier: ᵏ√N = a · ᵏ√b
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Root Index (k = 2..6)</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={radIndex}
                  onChange={(e) => setRadIndex(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Integer Radicand (N)</label>
                <input
                  type="number"
                  min={0}
                  value={radicand}
                  onChange={(e) => setRadicand(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-orange-200/80">
              <span className="text-xs text-gray-500 block mb-1">Simplified Exact Surd</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#111827]">
                {computed.k === 2 ? '√' : `${computed.k}√`}
                {computed.N} ={' '}
                {computed.N === 0
                  ? '0'
                  : computed.inside === 1
                  ? `${computed.outside}`
                  : `${computed.outside === 1 ? '' : computed.outside}${
                      computed.k === 2 ? '√' : ` · ${computed.k}√`
                    }${computed.inside}`}
              </div>
              <div className="text-xs font-mono text-gray-600 mt-2 tabular-nums">
                Factorization: {computed.N} = {computed.outside}^{computed.k} × {computed.inside} · Decimal ≈{' '}
                {fmtNum(Math.pow(computed.N, 1 / computed.k), 6)}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2 text-xs">
            <p className="font-semibold text-gray-700">Core Logarithm & Exponent Laws Quick Check</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-gray-700">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                log_b(MN) = log_b(M) + log_b(N)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                log_b(M/N) = log_b(M) − log_b(N)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                log_b(M^p) = p · log_b(M)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                x^(m/n) = ⁿ√(x^m) = (ⁿ√x)^m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
