import React, { useMemo, useState } from 'react';
import {
  AstNode,
  differentiateAst,
  evalAst,
  factorialNum,
  formatAst,
  parseMathAst,
  simplifyAst,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 10: SYMBOLIC DERIVATIVE & TANGENT LINE CALCULATOR
// ============================================================================
export const SymbolicDerivativeCalculator: React.FC = () => {
  const [fnExpr, setFnExpr] = useState('x^3 - 3*x^2 + 2*sin(x)');
  const [pointA, setPointA] = useState('1.5');

  const calc = useMemo(() => {
    try {
      const fAst = simplifyAst(parseMathAst(fnExpr));
      const d1Ast = simplifyAst(differentiateAst(fAst, 'x'));
      const d2Ast = simplifyAst(differentiateAst(d1Ast, 'x'));
      const d3Ast = simplifyAst(differentiateAst(d2Ast, 'x'));

      const a = Number(pointA) || 0;
      const fa = evalAst(fAst, { x: a });
      const f1a = evalAst(d1Ast, { x: a });
      const f2a = evalAst(d2Ast, { x: a });
      const f3a = evalAst(d3Ast, { x: a });

      const tangentIntercept = fa - f1a * a;
      const normalSlope = Math.abs(f1a) < 1e-10 ? NaN : -1 / f1a;
      const normalIntercept = Number.isFinite(normalSlope) ? fa - normalSlope * a : NaN;

      const xMin = a - 4;
      const xMax = a + 4;
      const pts: Array<{ x: number; f: number; df: number; tan: number }> = [];
      for (let i = 0; i <= 100; i++) {
        const x = xMin + ((xMax - xMin) * i) / 100;
        const fy = evalAst(fAst, { x });
        const dfy = evalAst(d1Ast, { x });
        pts.push({
          x,
          f: Number.isFinite(fy) ? fy : 0,
          df: Number.isFinite(dfy) ? dfy : 0,
          tan: fa + f1a * (x - a),
        });
      }

      const allY = pts.flatMap((p) => [p.f, p.df]);
      const yMin = Math.max(-40, Math.min(...allY, -2));
      const yMax = Math.min(40, Math.max(...allY, 2));

      return {
        ok: true as const,
        d1Str: formatAst(d1Ast),
        d2Str: formatAst(d2Ast),
        d3Str: formatAst(d3Ast),
        a,
        fa,
        f1a,
        f2a,
        f3a,
        tangentIntercept,
        normalSlope,
        normalIntercept,
        pts,
        xMin,
        xMax,
        yMin,
        yMax,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid function' };
    }
  }, [fnExpr, pointA]);

  const W = 500;
  const H = 260;
  const pad = 32;

  const solutionText = calc.ok
    ? [
        `Symbolic Differentiation of f(x) = ${fnExpr}`,
        `First Derivative f'(x) = ${calc.d1Str}`,
        `Second Derivative f''(x) = ${calc.d2Str}`,
        `Third Derivative f'''(x) = ${calc.d3Str}`,
        `At x = ${calc.a}: f(a) = ${fmtNum(calc.fa, 5)}, slope m = f'(a) = ${fmtNum(calc.f1a, 5)}`,
        `Tangent Line: y = ${fmtNum(calc.f1a, 4)}x ${calc.tangentIntercept >= 0 ? '+' : '−'} ${fmtNum(Math.abs(calc.tangentIntercept), 4)}`,
      ].join('\n')
    : 'Invalid function';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Polynomial + Trig: x³ − 3x² + 2sin(x)',
            onSelect: () => {
              setFnExpr('x^3 - 3*x^2 + 2*sin(x)');
              setPointA('1.5');
            },
          },
          {
            label: 'Product Rule: x^2 * exp(-x)',
            onSelect: () => {
              setFnExpr('x^2 * exp(-x)');
              setPointA('1');
            },
          },
          {
            label: 'Quotient & Chain: ln(x^2 + 1) / x',
            onSelect: () => {
              setFnExpr('ln(x^2 + 1) / (x^2 + 1)');
              setPointA('0.8');
            },
          },
        ]}
        onReset={() => {
          setFnExpr('x^3 - 3*x^2 + 2*sin(x)');
          setPointA('1.5');
        }}
        solutionText={solutionText}
        modeLabel="Symbolic AST Engine"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Function f(x)</label>
              <input
                type="text"
                value={fnExpr}
                onChange={(e) => setFnExpr(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Point x = a</label>
              <input
                type="number"
                step="0.25"
                value={pointA}
                onChange={(e) => setPointA(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {calc.ok ? (
            <>
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2.5 text-xs font-mono">
                <div>
                  <span className="font-sans font-semibold text-[#EA580C] block">First Derivative f&apos;(x)</span>
                  <div className="text-sm font-bold text-gray-900 break-all">{calc.d1Str}</div>
                </div>
                <div className="pt-2 border-t border-orange-200/70">
                  <span className="font-sans font-semibold text-gray-600 block">Second Derivative f&apos;&apos;(x)</span>
                  <div className="text-gray-900 break-all">{calc.d2Str}</div>
                </div>
                <div className="pt-2 border-t border-orange-200/70">
                  <span className="font-sans font-semibold text-gray-600 block">Third Derivative f&apos;&apos;&apos;(x)</span>
                  <div className="text-gray-900 break-all">{calc.d3Str}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                <div>
                  <span className="font-sans text-gray-500 block">Tangent Line at x = {calc.a}</span>
                  <span className="font-bold text-gray-900">
                    y = {fmtNum(calc.f1a, 3)}x {calc.tangentIntercept >= 0 ? '+' : '−'}{' '}
                    {fmtNum(Math.abs(calc.tangentIntercept), 3)}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Normal Line at x = {calc.a}</span>
                  <span className="font-bold text-gray-900">
                    {Number.isFinite(calc.normalSlope)
                      ? `y = ${fmtNum(calc.normalSlope, 3)}x ${calc.normalIntercept >= 0 ? '+' : '−'} ${fmtNum(
                          Math.abs(calc.normalIntercept),
                          3
                        )}`
                      : `x = ${calc.a} (Vertical)`}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Slope f&apos;({calc.a})</span>
                  <span className="font-bold text-[#EA580C]">{fmtNum(calc.f1a, 5)}</span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Concavity f&apos;&apos;({calc.a})</span>
                  <span className="font-bold text-gray-900">
                    {fmtNum(calc.f2a, 4)} ({calc.f2a > 0 ? 'Concave Up' : calc.f2a < 0 ? 'Concave Down' : 'Inflection'})
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{calc.error}</div>
          )}
        </div>

        <div className="lg:col-span-6">
          {calc.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-gray-700">f(x), Derivative f&apos;(x) & Tangent Line</span>
                <span className="font-mono text-gray-500">Orange: f(x) · Blue: f&apos;(x) · Dark: Tangent</span>
              </div>
              {(() => {
                const sx = (x: number) =>
                  pad + ((x - calc.xMin) / (calc.xMax - calc.xMin || 1)) * (W - 2 * pad);
                const sy = (y: number) =>
                  H -
                  pad -
                  ((Math.max(calc.yMin, Math.min(calc.yMax, y)) - calc.yMin) /
                    (calc.yMax - calc.yMin || 1)) *
                    (H - 2 * pad);
                const fPath = calc.pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.f).toFixed(1)}`)
                  .join(' ');
                const dfPath = calc.pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.df).toFixed(1)}`)
                  .join(' ');
                const tanPath = calc.pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.tan).toFixed(1)}`)
                  .join(' ');
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    {calc.yMin <= 0 && calc.yMax >= 0 && (
                      <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#D1D5DB" />
                    )}
                    {calc.xMin <= 0 && calc.xMax >= 0 && (
                      <line x1={sx(0)} y1={pad} x2={sx(0)} y2={H - pad} stroke="#D1D5DB" />
                    )}
                    <path d={dfPath} fill="none" stroke="#0284C7" strokeWidth={1.8} strokeDasharray="5 3" />
                    <path d={tanPath} fill="none" stroke="#111827" strokeWidth={1.8} />
                    <path d={fPath} fill="none" stroke="#F97316" strokeWidth={2.6} />
                    <circle cx={sx(calc.a)} cy={sy(calc.fa)} r={5} fill="#F97316" stroke="#FFF" strokeWidth={1.5} />
                  </svg>
                );
              })()}
              <p className="text-xs text-gray-500 mt-2">
                Point of tangency ({calc.a}, {fmtNum(calc.fa, 3)}) has instantaneous slope m = {fmtNum(calc.f1a, 4)}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 11: DEFINITE INTEGRAL & RIEMANN SUM PLOTTER
// ============================================================================
type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid' | 'simpson';

export const DefiniteIntegralRiemannPlotter: React.FC = () => {
  const [fnExpr, setFnExpr] = useState('4 - x^2');
  const [lowerA, setLowerA] = useState('0');
  const [upperB, setUpperB] = useState('2');
  const [subN, setSubN] = useState(8);
  const [method, setMethod] = useState<RiemannMethod>('midpoint');

  const quad = useMemo(() => {
    try {
      const ast = parseMathAst(fnExpr);
      const a = Number(lowerA) || 0;
      const b = Number(upperB) || 1;
      if (Math.abs(b - a) < 1e-8) throw new Error('Upper limit b must differ from lower limit a.');
      const n = Math.max(2, Math.min(60, subN));
      const nEven = n % 2 === 0 ? n : n + 1;
      const dx = (b - a) / n;
      const f = (x: number) => evalAst(ast, { x });

      let left = 0;
      let right = 0;
      let mid = 0;
      const rects: Array<{ x0: number; x1: number; h: number }> = [];

      for (let i = 0; i < n; i++) {
        const x0 = a + i * dx;
        const x1 = x0 + dx;
        const xm = (x0 + x1) / 2;
        const fl = f(x0);
        const fr = f(x1);
        const fm = f(xm);
        left += fl * dx;
        right += fr * dx;
        mid += fm * dx;
        rects.push({
          x0,
          x1,
          h: method === 'left' ? fl : method === 'right' ? fr : fm,
        });
      }
      const trap = 0.5 * (left + right);

      // Simpson's 1/3 with nEven
      const dxS = (b - a) / nEven;
      let simpSum = f(a) + f(b);
      for (let i = 1; i < nEven; i++) {
        simpSum += (i % 2 === 1 ? 4 : 2) * f(a + i * dxS);
      }
      const simpson = (dxS / 3) * simpSum;

      // High-precision reference Simpson (N = 400)
      const dxRef = (b - a) / 400;
      let refS = f(a) + f(b);
      for (let i = 1; i < 400; i++) refS += (i % 2 === 1 ? 4 : 2) * f(a + i * dxRef);
      const exactRef = (dxRef / 3) * refS;

      const curve: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 100; i++) {
        const x = a + ((b - a) * i) / 100;
        curve.push({ x, y: f(x) });
      }
      const ys = curve.map((c) => c.y).concat([0]);
      const yMin = Math.min(...ys);
      const yMax = Math.max(...ys, 0.5);

      return {
        ok: true as const,
        a,
        b,
        n,
        dx,
        left,
        right,
        mid,
        trap,
        simpson,
        exactRef,
        rects,
        curve,
        yMin,
        yMax,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid integrand' };
    }
  }, [fnExpr, lowerA, upperB, subN, method]);

  const W = 500;
  const H = 260;
  const pad = 34;

  const solutionText = quad.ok
    ? [
        `Definite Integral ∫_[${quad.a}, ${quad.b}] (${fnExpr}) dx  (n = ${quad.n}, Δx = ${fmtNum(quad.dx, 4)})`,
        `Exact / High-Order Reference: ${fmtNum(quad.exactRef, 7)}`,
        `Left Sum L_${quad.n} = ${fmtNum(quad.left, 6)}`,
        `Right Sum R_${quad.n} = ${fmtNum(quad.right, 6)}`,
        `Midpoint Sum M_${quad.n} = ${fmtNum(quad.mid, 6)}`,
        `Trapezoidal T_${quad.n} = ${fmtNum(quad.trap, 6)}`,
        `Simpson's 1/3 Rule = ${fmtNum(quad.simpson, 7)}`,
      ].join('\n')
    : 'Invalid integral setup';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: '∫₀² (4 − x²) dx = 16/3',
            onSelect: () => {
              setFnExpr('4 - x^2');
              setLowerA('0');
              setUpperB('2');
              setSubN(8);
            },
          },
          {
            label: '∫₀^π sin(x) dx = 2',
            onSelect: () => {
              setFnExpr('sin(x)');
              setLowerA('0');
              setUpperB('3.14159265');
              setSubN(12);
            },
          },
          {
            label: 'Gaussian Bell ∫₋₂² exp(−x²/2) dx',
            onSelect: () => {
              setFnExpr('exp(-x^2 / 2)');
              setLowerA('-2');
              setUpperB('2');
              setSubN(16);
            },
          },
        ]}
        onReset={() => {
          setFnExpr('4 - x^2');
          setLowerA('0');
          setUpperB('2');
          setSubN(8);
          setMethod('midpoint');
        }}
        solutionText={solutionText}
        modeLabel={`Partitions n = ${subN}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Integrand f(x)</label>
            <input
              type="text"
              value={fnExpr}
              onChange={(e) => setFnExpr(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lower Bound a</label>
              <input
                type="number"
                step="any"
                value={lowerA}
                onChange={(e) => setLowerA(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Upper Bound b</label>
              <input
                type="number"
                step="any"
                value={upperB}
                onChange={(e) => setUpperB(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Subintervals n: {subN}</span>
              {quad.ok && <span className="font-mono text-gray-500">Δx = {fmtNum(quad.dx, 4)}</span>}
            </div>
            <input
              type="range"
              min={2}
              max={50}
              value={subN}
              onChange={(e) => setSubN(Number(e.target.value))}
              className="w-full accent-[#F97316]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['left', 'right', 'midpoint', 'trapezoid', 'simpson'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                  method === m
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-[#F9FAFB] text-gray-600 border-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {quad.ok && (
            <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono tabular-nums">
              <div className="flex justify-between items-baseline">
                <span className="font-sans font-semibold text-[#EA580C]">Reference Integral</span>
                <span className="text-lg font-bold text-gray-900">{fmtNum(quad.exactRef, 6)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-200/70">
                <div>Left L_n: <strong className="text-gray-900">{fmtNum(quad.left, 5)}</strong></div>
                <div>Right R_n: <strong className="text-gray-900">{fmtNum(quad.right, 5)}</strong></div>
                <div>Midpoint M_n: <strong className="text-gray-900">{fmtNum(quad.mid, 5)}</strong></div>
                <div>Trapezoid T_n: <strong className="text-gray-900">{fmtNum(quad.trap, 5)}</strong></div>
              </div>
              <div className="pt-1 text-gray-800">
                Simpson&apos;s 1/3 Rule: <strong>{fmtNum(quad.simpson, 6)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {quad.ok ? (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <span className="text-xs font-semibold text-gray-700 mb-2">
                Shaded {method.toUpperCase()} Partition Approximation (n = {quad.n})
              </span>
              {(() => {
                const minX = Math.min(quad.a, quad.b);
                const maxX = Math.max(quad.a, quad.b);
                const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (W - 2 * pad);
                const sy = (y: number) =>
                  H - pad - ((y - quad.yMin) / (quad.yMax - quad.yMin || 1)) * (H - 2 * pad);
                const y0 = sy(0);
                const curvePath = quad.curve
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
                  .join(' ');

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    <line x1={pad} y1={y0} x2={W - pad} y2={y0} stroke="#9CA3AF" />
                    {quad.rects.map((r, idx) => {
                      const xA = sx(Math.min(r.x0, r.x1));
                      const xB = sx(Math.max(r.x0, r.x1));
                      const yh = sy(r.h);
                      return (
                        <rect
                          key={idx}
                          x={xA}
                          y={Math.min(y0, yh)}
                          width={Math.max(1, xB - xA)}
                          height={Math.abs(y0 - yh)}
                          fill="#FDBA74"
                          fillOpacity={0.45}
                          stroke="#F97316"
                          strokeWidth={1}
                        />
                      );
                    })}
                    <path d={curvePath} fill="none" stroke="#111827" strokeWidth={2.5} />
                  </svg>
                );
              })()}
              <p className="text-xs text-gray-500 mt-2">
                Increase subintervals n to observe Riemann rectangles converge monotonically toward the exact area under f(x).
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{quad.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 12: LIMITS & L'HÔPITAL'S RULE EXPLORER
// ============================================================================
export const LimitsLhopitalExplorer: React.FC = () => {
  const [numExpr, setNumExpr] = useState('sin(x)');
  const [denExpr, setDenExpr] = useState('x');
  const [targetA, setTargetA] = useState('0');

  const lim = useMemo(() => {
    try {
      const fAst = simplifyAst(parseMathAst(numExpr));
      const gAst = simplifyAst(parseMathAst(denExpr));
      const dfAst = simplifyAst(differentiateAst(fAst, 'x'));
      const dgAst = simplifyAst(differentiateAst(gAst, 'x'));
      const d2fAst = simplifyAst(differentiateAst(dfAst, 'x'));
      const d2gAst = simplifyAst(differentiateAst(dgAst, 'x'));

      const a = Number(targetA) || 0;
      const evalQ = (x: number) => evalAst(fAst, { x }) / evalAst(gAst, { x });

      const fa = evalAst(fAst, { x: a });
      const ga = evalAst(gAst, { x: a });
      const isZeroOverZero = Math.abs(fa) < 1e-8 && Math.abs(ga) < 1e-8;

      const dfa = evalAst(dfAst, { x: a });
      const dga = evalAst(dgAst, { x: a });
      const d2fa = evalAst(d2fAst, { x: a });
      const d2ga = evalAst(d2gAst, { x: a });

      let lhopitalVal = fa / ga;
      let lhopitalOrder = 0;
      if (isZeroOverZero) {
        if (Math.abs(dga) > 1e-8) {
          lhopitalVal = dfa / dga;
          lhopitalOrder = 1;
        } else if (Math.abs(dfa) < 1e-8 && Math.abs(d2ga) > 1e-8) {
          lhopitalVal = d2fa / d2ga;
          lhopitalOrder = 2;
        }
      }

      const offsets = [0.1, 0.01, 0.001, 0.0001];
      const table = offsets.map((h) => ({
        h,
        leftX: a - h,
        leftVal: evalQ(a - h),
        rightX: a + h,
        rightVal: evalQ(a + h),
      }));

      const leftLim = table[3].leftVal;
      const rightLim = table[3].rightVal;
      const twoSidedExists =
        Number.isFinite(leftLim) &&
        Number.isFinite(rightLim) &&
        Math.abs(leftLim - rightLim) < 1e-3;

      return {
        ok: true as const,
        a,
        fa,
        ga,
        isZeroOverZero,
        dfStr: formatAst(dfAst),
        dgStr: formatAst(dgAst),
        lhopitalVal,
        lhopitalOrder,
        table,
        leftLim,
        rightLim,
        twoSidedExists,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid quotient' };
    }
  }, [numExpr, denExpr, targetA]);

  const solutionText = lim.ok
    ? [
        `Limit Explorer: lim_(x→${lim.a}) [${numExpr}] / [${denExpr}]`,
        `Direct Substitution: f(${lim.a}) = ${fmtNum(lim.fa, 4)}, g(${lim.a}) = ${fmtNum(lim.ga, 4)} ${
          lim.isZeroOverZero ? '(0/0 Indeterminate Form)' : ''
        }`,
        lim.lhopitalOrder > 0
          ? `L'Hôpital Order ${lim.lhopitalOrder}: f'(x)/g'(x) = (${lim.dfStr}) / (${lim.dgStr}) → ${fmtNum(
              lim.lhopitalVal,
              6
            )}`
          : '',
        `Left-Hand Limit x→${lim.a}⁻: ${fmtNum(lim.leftLim, 6)}`,
        `Right-Hand Limit x→${lim.a}⁺: ${fmtNum(lim.rightLim, 6)}`,
      ]
        .filter(Boolean)
        .join('\n')
    : 'Invalid limit expression';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'lim_(x→0) sin(x) / x = 1',
            onSelect: () => {
              setNumExpr('sin(x)');
              setDenExpr('x');
              setTargetA('0');
            },
          },
          {
            label: '2nd-Order L’Hôpital: (1 − cos(x)) / x²',
            onSelect: () => {
              setNumExpr('1 - cos(x)');
              setDenExpr('x^2');
              setTargetA('0');
            },
          },
          {
            label: 'Algebraic 0/0: (x² − 9) / (x − 3)',
            onSelect: () => {
              setNumExpr('x^2 - 9');
              setDenExpr('x - 3');
              setTargetA('3');
            },
          },
        ]}
        onReset={() => {
          setNumExpr('sin(x)');
          setDenExpr('x');
          setTargetA('0');
        }}
        solutionText={solutionText}
        modeLabel="Quotient & L'Hôpital Mode"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Numerator f(x)</label>
              <input
                type="text"
                value={numExpr}
                onChange={(e) => setNumExpr(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Denominator g(x) (set to 1 for non-quotient)
              </label>
              <input
                type="text"
                value={denExpr}
                onChange={(e) => setDenExpr(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Approach Point x → a</label>
              <input
                type="number"
                step="any"
                value={targetA}
                onChange={(e) => setTargetA(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {lim.ok && (
            <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono tabular-nums">
              <span className="font-sans font-semibold text-[#EA580C] block">Two-Sided Limit Conclusion</span>
              <div className="text-2xl font-bold text-[#111827]">
                {lim.twoSidedExists
                  ? fmtNum(lim.lhopitalOrder > 0 ? lim.lhopitalVal : (lim.leftLim + lim.rightLim) / 2, 6)
                  : 'DNE (Left ≠ Right / Diverges)'}
              </div>
              <div className="pt-2 border-t border-orange-200/70 text-gray-700 space-y-1">
                <div>
                  Direct Plug-in: f({lim.a})/g({lim.a}) = {fmtNum(lim.fa, 4)} / {fmtNum(lim.ga, 4)}{' '}
                  {lim.isZeroOverZero && <strong className="text-[#EA580C]">(0/0 Indeterminate)</strong>}
                </div>
                {lim.lhopitalOrder > 0 && (
                  <div>
                    L&apos;Hôpital ({lim.lhopitalOrder}x): f&apos;(x)/g&apos;(x) = ({lim.dfStr}) / ({lim.dgStr})
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {lim.ok ? (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full">
              <p className="text-xs font-semibold text-gray-700 mb-3">
                One-Sided Numerical Approach Table (x = {lim.a} ± h)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono tabular-nums bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <th className="px-3 py-2.5 text-left">Step h</th>
                      <th className="px-3 py-2.5 text-right">x⁻ = a − h</th>
                      <th className="px-3 py-2.5 text-right">f(x⁻)/g(x⁻)</th>
                      <th className="px-3 py-2.5 text-right">x⁺ = a + h</th>
                      <th className="px-3 py-2.5 text-right">f(x⁺)/g(x⁺)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lim.table.map((r, i) => (
                      <tr key={i} className="border-b last:border-b-0 border-gray-100">
                        <td className="px-3 py-2 text-gray-500">{r.h}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.leftX, 5)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-sky-700">
                          {fmtNum(r.leftVal, 6)}
                        </td>
                        <td className="px-3 py-2 text-right">{fmtNum(r.rightX, 5)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                          {fmtNum(r.rightVal, 6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono tabular-nums">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-sans text-gray-500 block">Left-Hand Limit (x → {lim.a}⁻)</span>
                  <span className="font-bold text-sky-700 text-base">{fmtNum(lim.leftLim, 6)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-sans text-gray-500 block">Right-Hand Limit (x → {lim.a}⁺)</span>
                  <span className="font-bold text-emerald-700 text-base">{fmtNum(lim.rightLim, 6)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{lim.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 13: TAYLOR & MACLAURIN SERIES POLYNOMIAL VISUALIZER
// ============================================================================
export const TaylorMaclaurinSeriesVisualizer: React.FC = () => {
  const [fnExpr, setFnExpr] = useState('cos(x)');
  const [centerA, setCenterA] = useState('0');
  const [orderN, setOrderN] = useState(4);
  const [evalX, setEvalX] = useState('1.2');

  const taylor = useMemo(() => {
    try {
      let curAst: AstNode = simplifyAst(parseMathAst(fnExpr));
      const a = Number(centerA) || 0;
      const x0 = Number(evalX) || 0;
      const n = Math.max(1, Math.min(7, orderN));

      const coeffs: Array<{ k: number; derivAtA: number; c: number }> = [];
      for (let k = 0; k <= n; k++) {
        const val = evalAst(curAst, { x: a });
        coeffs.push({ k, derivAtA: val, c: val / factorialNum(k) });
        if (k < n) {
          curAst = simplifyAst(differentiateAst(curAst, 'x'));
        }
      }

      const evalPn = (x: number) =>
        coeffs.reduce((acc, item) => acc + item.c * Math.pow(x - a, item.k), 0);

      const baseAst = parseMathAst(fnExpr);
      const exactAtX0 = evalAst(baseAst, { x: x0 });
      const approxAtX0 = evalPn(x0);
      const absErr = Math.abs(exactAtX0 - approxAtX0);

      const polyStr = coeffs
        .filter((item) => Math.abs(item.c) > 1e-8)
        .map((item, idx) => {
          const sign = item.c < 0 ? (idx === 0 ? '−' : ' − ') : idx === 0 ? '' : ' + ';
          const absC = fmtNum(Math.abs(item.c), 4);
          const base = Math.abs(a) < 1e-9 ? 'x' : `(x ${a > 0 ? '−' : '+'} ${fmtNum(Math.abs(a), 2)})`;
          if (item.k === 0) return `${sign}${absC}`;
          if (item.k === 1) return `${sign}${absC === '1' ? '' : absC}${base}`;
          return `${sign}${absC === '1' ? '' : absC}${base}^${item.k}`;
        })
        .join('') || '0';

      const xMin = a - 4;
      const xMax = a + 4;
      const samples = Array.from({ length: 101 }, (_, i) => {
        const x = xMin + ((xMax - xMin) * i) / 100;
        return { x, f: evalAst(baseAst, { x }), p: evalPn(x) };
      });

      return { ok: true as const, a, n, x0, coeffs, polyStr, exactAtX0, approxAtX0, absErr, samples, xMin, xMax };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid function' };
    }
  }, [fnExpr, centerA, orderN, evalX]);

  const W = 500;
  const H = 250;
  const pad = 32;

  const solutionText = taylor.ok
    ? [
        `Taylor Polynomial P_${taylor.n}(x) of f(x) = ${fnExpr} centered at a = ${taylor.a}`,
        `P_${taylor.n}(x) = ${taylor.polyStr}`,
        `At x₀ = ${taylor.x0}: Exact f(x₀) = ${fmtNum(taylor.exactAtX0, 6)}, P_${taylor.n}(x₀) = ${fmtNum(
          taylor.approxAtX0,
          6
        )}`,
        `Truncation Error |R_${taylor.n}(x₀)| = ${taylor.absErr.toExponential(4)}`,
      ].join('\n')
    : 'Invalid Taylor input';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Maclaurin cos(x), n = 4',
            onSelect: () => {
              setFnExpr('cos(x)');
              setCenterA('0');
              setOrderN(4);
              setEvalX('1.2');
            },
          },
          {
            label: 'Maclaurin exp(x), n = 5',
            onSelect: () => {
              setFnExpr('exp(x)');
              setCenterA('0');
              setOrderN(5);
              setEvalX('1');
            },
          },
          {
            label: 'Taylor ln(x) at a = 1',
            onSelect: () => {
              setFnExpr('ln(x)');
              setCenterA('1');
              setOrderN(4);
              setEvalX('1.4');
            },
          },
        ]}
        onReset={() => {
          setFnExpr('cos(x)');
          setCenterA('0');
          setOrderN(4);
          setEvalX('1.2');
        }}
        solutionText={solutionText}
        modeLabel={`Order n = ${orderN}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Function f(x)</label>
              <input
                type="text"
                value={fnExpr}
                onChange={(e) => setFnExpr(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Center a</label>
              <input
                type="number"
                step="0.5"
                value={centerA}
                onChange={(e) => setCenterA(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Test x₀</label>
              <input
                type="number"
                step="0.2"
                value={evalX}
                onChange={(e) => setEvalX(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Degree n ({orderN})</label>
              <input
                type="range"
                min={1}
                max={7}
                value={orderN}
                onChange={(e) => setOrderN(Number(e.target.value))}
                className="w-full mt-2 accent-[#F97316]"
              />
            </div>
          </div>

          {taylor.ok && (
            <>
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono">
                <span className="font-sans font-semibold text-[#EA580C] block">
                  {Math.abs(taylor.a) < 1e-9 ? 'Maclaurin' : 'Taylor'} Polynomial P_{taylor.n}(x)
                </span>
                <div className="text-sm font-bold text-gray-900 break-all">{taylor.polyStr}</div>
                <div className="pt-2 border-t border-orange-200/70 grid grid-cols-2 gap-2 tabular-nums">
                  <div>
                    <span className="font-sans text-gray-500 block">Exact f({taylor.x0})</span>
                    <span className="font-bold text-gray-900">{fmtNum(taylor.exactAtX0, 6)}</span>
                  </div>
                  <div>
                    <span className="font-sans text-gray-500 block">Approx P_{taylor.n}({taylor.x0})</span>
                    <span className="font-bold text-[#EA580C]">{fmtNum(taylor.approxAtX0, 6)}</span>
                  </div>
                </div>
                <div className="text-gray-700 tabular-nums">
                  Absolute Remainder |R_{taylor.n}| = <strong>{taylor.absErr.toExponential(3)}</strong>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-7">
          {taylor.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-gray-700">Curve Overlay: Exact f(x) vs P_{taylor.n}(x)</span>
                <span className="font-mono text-gray-500">Dark: Exact f(x) · Orange: P_{taylor.n}(x)</span>
              </div>
              {(() => {
                const fVals = taylor.samples.map((s) => s.f).filter(Number.isFinite);
                const yMin = Math.min(...fVals, -2.5) * 1.2;
                const yMax = Math.max(...fVals, 2.5) * 1.2;
                const sx = (x: number) =>
                  pad + ((x - taylor.xMin) / (taylor.xMax - taylor.xMin || 1)) * (W - 2 * pad);
                const sy = (y: number) =>
                  H -
                  pad -
                  ((Math.max(yMin, Math.min(yMax, y)) - yMin) / (yMax - yMin || 1)) * (H - 2 * pad);

                const fPath = taylor.samples
                  .filter((s) => Number.isFinite(s.f))
                  .map((s, i) => `${i === 0 ? 'M' : 'L'}${sx(s.x).toFixed(1)},${sy(s.f).toFixed(1)}`)
                  .join(' ');
                const pPath = taylor.samples
                  .filter((s) => Number.isFinite(s.p))
                  .map((s, i) => `${i === 0 ? 'M' : 'L'}${sx(s.x).toFixed(1)},${sy(s.p).toFixed(1)}`)
                  .join(' ');
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    {yMin <= 0 && yMax >= 0 && (
                      <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="#D1D5DB" />
                    )}
                    <path d={fPath} fill="none" stroke="#111827" strokeWidth={2.4} />
                    <path d={pPath} fill="none" stroke="#F97316" strokeWidth={2.4} strokeDasharray="6 3" />
                    <circle
                      cx={sx(taylor.a)}
                      cy={sy(taylor.coeffs[0].derivAtA)}
                      r={5}
                      fill="#EA580C"
                      stroke="#FFF"
                      strokeWidth={1.5}
                    />
                  </svg>
                );
              })()}
              <p className="text-xs text-gray-500 mt-2">
                Notice how higher polynomial degree n hugs f(x) tightly across a wider interval around center x = {taylor.a}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 14: SEQUENCE & INFINITE SERIES CONVERGENCE TESTER
// ============================================================================
export const SequenceSeriesConvergenceTester: React.FC = () => {
  const [termExpr, setTermExpr] = useState('1 / n^2');
  const [maxTerms, setMaxTerms] = useState(25);

  const series = useMemo(() => {
    try {
      const ast = parseMathAst(termExpr);
      const a = (n: number) => evalAst(ast, { n });

      const partials: Array<{ n: number; an: number; sn: number }> = [];
      let sum = 0;
      for (let n = 1; n <= maxTerms; n++) {
        const val = a(n);
        sum += Number.isFinite(val) ? val : 0;
        partials.push({ n, an: val, sn: sum });
      }

      // Asymptotic test probes at large N
      const a100 = a(100);
      const a101 = a(101);
      const ratioL = Math.abs(a100) > 1e-300 ? Math.abs(a101 / a100) : 0;
      const rootL = Math.pow(Math.abs(a(60)), 1 / 60);
      const alternating = a(1) * a(2) < 0 && a(2) * a(3) < 0;

      // Estimate effective p-series decay p ≈ -ln(|a(200)/a(100)|) / ln(2)
      const a200 = a(200);
      const pEst =
        Math.abs(a100) > 1e-200 && Math.abs(a200) > 1e-200
          ? -Math.log(Math.abs(a200 / a100)) / Math.LN2
          : NaN;

      let verdict = 'Convergent Infinite Series';
      let justification = '';
      if (Math.abs(a200) > 0.05) {
        verdict = 'Divergent by nth-Term Divergence Test';
        justification = `Terms do not approach zero (a_200 ≈ ${fmtNum(a200, 4)} ≠ 0).`;
      } else if (ratioL < 0.98) {
        verdict = 'Absolutely Convergent (Ratio Test L < 1)';
        justification = `Asymptotic D'Alembert ratio |a_(n+1)/a_n| → ${fmtNum(ratioL, 4)} < 1.`;
      } else if (ratioL > 1.02) {
        verdict = 'Divergent (Ratio Test L > 1)';
        justification = `Asymptotic ratio |a_(n+1)/a_n| → ${fmtNum(ratioL, 4)} > 1.`;
      } else if (alternating && Math.abs(a200) < Math.abs(a100)) {
        verdict = pEst > 1 ? 'Absolutely Convergent' : 'Conditionally Convergent (Alternating Series Test)';
        justification = `Alternating sign with monotonically decreasing |a_n| → 0 (effective p ≈ ${fmtNum(pEst, 2)}).`;
      } else if (Number.isFinite(pEst)) {
        if (pEst > 1.03) {
          verdict = 'Convergent (p-Series / Comparison Test)';
          justification = `Asymptotic decay ~ 1/n^${fmtNum(pEst, 2)} with p > 1.`;
        } else {
          verdict = 'Divergent (p-Series / Harmonic Comparison, p ≤ 1)';
          justification = `Asymptotic decay ~ 1/n^${fmtNum(pEst, 2)} with p ≤ 1.`;
        }
      }

      return { ok: true as const, partials, sum, ratioL, rootL, pEst, alternating, verdict, justification };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid term formula a_n' };
    }
  }, [termExpr, maxTerms]);

  const W = 480;
  const H = 230;
  const pad = 32;

  const solutionText = series.ok
    ? [
        `Infinite Series Σ a_n for a_n = ${termExpr}`,
        `Verdict: ${series.verdict}`,
        `Reason: ${series.justification}`,
        `Partial Sum S_${maxTerms} = ${fmtNum(series.sum, 6)} · Ratio Probe L ≈ ${fmtNum(series.ratioL, 4)}`,
      ].join('\n')
    : 'Invalid series';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Basel p-Series: 1 / n^2 (Converges → π²/6)',
            onSelect: () => {
              setTermExpr('1 / n^2');
              setMaxTerms(25);
            },
          },
          {
            label: 'Geometric Ratio: 3 * (0.5)^(n - 1)',
            onSelect: () => {
              setTermExpr('3 * (0.5)^(n - 1)');
              setMaxTerms(20);
            },
          },
          {
            label: 'Harmonic: 1 / n (Diverges)',
            onSelect: () => {
              setTermExpr('1 / n');
              setMaxTerms(35);
            },
          },
          {
            label: 'Alternating Harmonic: (-1)^(n+1) / n',
            onSelect: () => {
              setTermExpr('(-1)^(n + 1) / n');
              setMaxTerms(30);
            },
          },
        ]}
        onReset={() => {
          setTermExpr('1 / n^2');
          setMaxTerms(25);
        }}
        solutionText={solutionText}
        modeLabel={`Terms N = ${maxTerms}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              General Term Formula a_n (in terms of n ≥ 1)
            </label>
            <input
              type="text"
              value={termExpr}
              onChange={(e) => setTermExpr(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700">Partial Sum Horizon N: {maxTerms}</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={maxTerms}
              onChange={(e) => setMaxTerms(Number(e.target.value))}
              className="w-full accent-[#F97316]"
            />
          </div>

          {series.ok && (
            <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs">
              <span className="font-semibold text-[#EA580C] block">Convergence Diagnostic</span>
              <div className="text-base font-bold text-gray-900">{series.verdict}</div>
              <p className="text-gray-700">{series.justification}</p>
              <div className="pt-2 border-t border-orange-200/70 grid grid-cols-2 gap-2 font-mono tabular-nums">
                <div>
                  <span className="font-sans text-gray-500 block">Partial Sum S_{maxTerms}</span>
                  <span className="font-bold text-gray-900 text-sm">{fmtNum(series.sum, 6)}</span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Ratio L = |a_(n+1)/a_n|</span>
                  <span className="font-bold text-gray-900 text-sm">{fmtNum(series.ratioL, 4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {series.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <span className="text-xs font-semibold text-gray-700 mb-2">
                Partial Sums Trajectory S_N = Σ_(k=1..N) a_k
              </span>
              {(() => {
                const sns = series.partials.map((p) => p.sn);
                const yMin = Math.min(...sns, 0);
                const yMax = Math.max(...sns, 1) * 1.08;
                const sx = (n: number) => pad + ((n - 1) / Math.max(1, maxTerms - 1)) * (W - 2 * pad);
                const sy = (y: number) =>
                  H - pad - ((y - yMin) / (yMax - yMin || 1)) * (H - 2 * pad);
                const line = series.partials
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.n).toFixed(1)},${sy(p.sn).toFixed(1)}`)
                  .join(' ');
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    <path d={line} fill="none" stroke="#F97316" strokeWidth={2.2} />
                    {series.partials.map((p) => (
                      <circle key={p.n} cx={sx(p.n)} cy={sy(p.sn)} r={3} fill="#EA580C" />
                    ))}
                  </svg>
                );
              })()}
              <div className="mt-2 flex gap-3 overflow-x-auto text-xs font-mono text-gray-600 tabular-nums">
                {series.partials.slice(0, 5).map((p) => (
                  <span key={p.n} className="whitespace-nowrap">
                    a_{p.n}={fmtNum(p.an, 3)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
