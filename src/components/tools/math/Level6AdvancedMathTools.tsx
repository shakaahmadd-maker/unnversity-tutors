import React, { useMemo, useState } from 'react';
import {
  differentiateAst,
  evalAst,
  formatAst,
  gcdInt,
  parseMathAst,
  simplifyAst,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 24: ODE SLOPE FIELD, EULER & RUNGE-KUTTA (RK4) PLOTTER
// ============================================================================
export const OdeSlopeFieldRk4Plotter: React.FC = () => {
  const [rhsExpr, setRhsExpr] = useState('x - y');
  const [x0Val, setX0Val] = useState('0');
  const [y0Val, setY0Val] = useState('1');
  const [stepH, setStepH] = useState('0.25');
  const [stepsCount, setStepsCount] = useState(10);

  const ode = useMemo(() => {
    try {
      const ast = parseMathAst(rhsExpr);
      const f = (x: number, y: number) => evalAst(ast, { x, y });

      const x0 = Number(x0Val) || 0;
      const y0 = Number(y0Val) || 0;
      const h = Math.max(0.05, Math.min(1, Number(stepH) || 0.2));
      const N = Math.max(2, Math.min(24, stepsCount));

      const rows: Array<{ k: number; x: number; eulerY: number; rk4Y: number }> = [
        { k: 0, x: x0, eulerY: y0, rk4Y: y0 },
      ];
      let curX = x0;
      let euY = y0;
      let rkY = y0;

      for (let i = 1; i <= N; i++) {
        euY = euY + h * f(curX, euY);
        const k1 = f(curX, rkY);
        const k2 = f(curX + h / 2, rkY + (h * k1) / 2);
        const k3 = f(curX + h / 2, rkY + (h * k2) / 2);
        const k4 = f(curX + h, rkY + h * k3);
        rkY = rkY + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        curX = x0 + i * h;
        rows.push({ k: i, x: curX, eulerY: euY, rk4Y: rkY });
      }

      const xMin = x0 - 0.5;
      const xMax = x0 + N * h + 0.5;
      const ys = rows.flatMap((r) => [r.eulerY, r.rk4Y]);
      const yMin = Math.min(...ys, -1) - 1;
      const yMax = Math.max(...ys, 2) + 1;

      const segments: Array<{ x: number; y: number; m: number }> = [];
      for (let gx = 0; gx <= 12; gx++) {
        for (let gy = 0; gy <= 8; gy++) {
          const x = xMin + ((xMax - xMin) * gx) / 12;
          const y = yMin + ((yMax - yMin) * gy) / 8;
          segments.push({ x, y, m: f(x, y) });
        }
      }

      return { ok: true as const, rows, segments, xMin, xMax, yMin, yMax, h };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid ODE dy/dx' };
    }
  }, [rhsExpr, x0Val, y0Val, stepH, stepsCount]);

  const W = 500;
  const H = 260;
  const pad = 30;

  const solutionText = ode.ok
    ? [
        `First-Order IVP: dy/dx = ${rhsExpr}, y(${x0Val}) = ${y0Val}, step h = ${ode.h}`,
        ...ode.rows.map(
          (r) => `k=${r.k}: x=${fmtNum(r.x, 3)} | Euler y=${fmtNum(r.eulerY, 5)} | RK4 y=${fmtNum(r.rk4Y, 6)}`
        ),
      ].join('\n')
    : 'Invalid ODE';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Linear Cooling: dy/dx = x − y',
            onSelect: () => {
              setRhsExpr('x - y');
              setX0Val('0');
              setY0Val('1');
              setStepH('0.25');
            },
          },
          {
            label: 'Logistic Carrying Capacity: y * (1 - y/4)',
            onSelect: () => {
              setRhsExpr('y * (1 - y / 4)');
              setX0Val('0');
              setY0Val('0.5');
              setStepH('0.3');
            },
          },
          {
            label: 'Nonlinear Trig: sin(x) * y',
            onSelect: () => {
              setRhsExpr('sin(x) * y');
              setX0Val('0');
              setY0Val('1');
              setStepH('0.25');
            },
          },
        ]}
        onReset={() => {
          setRhsExpr('x - y');
          setX0Val('0');
          setY0Val('1');
          setStepH('0.25');
          setStepsCount(10);
        }}
        solutionText={solutionText}
        modeLabel="Euler vs 4th-Order RK4"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Differential Equation dy/dx = f(x, y)
            </label>
            <input
              type="text"
              value={rhsExpr}
              onChange={(e) => setRhsExpr(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Initial x₀</label>
              <input
                type="number"
                step="any"
                value={x0Val}
                onChange={(e) => setX0Val(e.target.value)}
                className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Initial y₀</label>
              <input
                type="number"
                step="any"
                value={y0Val}
                onChange={(e) => setY0Val(e.target.value)}
                className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Step h</label>
              <input
                type="number"
                step="0.05"
                value={stepH}
                onChange={(e) => setStepH(e.target.value)}
                className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {ode.ok && (
            <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 max-h-56 overflow-y-auto">
              <table className="w-full text-xs font-mono tabular-nums">
                <thead>
                  <tr className="text-left text-[#EA580C] border-b border-orange-200">
                    <th className="py-1">Step</th>
                    <th className="py-1 text-right">x_n</th>
                    <th className="py-1 text-right">Euler y_n</th>
                    <th className="py-1 text-right">RK4 y_n</th>
                  </tr>
                </thead>
                <tbody>
                  {ode.rows.map((r) => (
                    <tr key={r.k} className="border-b last:border-b-0 border-orange-100">
                      <td className="py-1 text-gray-500">{r.k}</td>
                      <td className="py-1 text-right">{fmtNum(r.x, 3)}</td>
                      <td className="py-1 text-right text-sky-700">{fmtNum(r.eulerY, 4)}</td>
                      <td className="py-1 text-right font-bold text-gray-900">{fmtNum(r.rk4Y, 5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {ode.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-gray-700">2D Direction Field & Solution Trajectories</span>
                <span className="font-mono text-gray-500">Orange: RK4 · Blue Dashed: Euler</span>
              </div>
              {(() => {
                const sx = (x: number) =>
                  pad + ((x - ode.xMin) / (ode.xMax - ode.xMin || 1)) * (W - 2 * pad);
                const sy = (y: number) =>
                  H - pad - ((y - ode.yMin) / (ode.yMax - ode.yMin || 1)) * (H - 2 * pad);
                const rkPath = ode.rows
                  .map((r, i) => `${i === 0 ? 'M' : 'L'}${sx(r.x).toFixed(1)},${sy(r.rk4Y).toFixed(1)}`)
                  .join(' ');
                const euPath = ode.rows
                  .map((r, i) => `${i === 0 ? 'M' : 'L'}${sx(r.x).toFixed(1)},${sy(r.eulerY).toFixed(1)}`)
                  .join(' ');

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    {ode.segments.map((seg, i) => {
                      const cx = sx(seg.x);
                      const cy = sy(seg.y);
                      const ang = Math.atan(
                        seg.m * ((H - 2 * pad) / (ode.yMax - ode.yMin)) / ((W - 2 * pad) / (ode.xMax - ode.xMin))
                      );
                      const dx = 7 * Math.cos(ang);
                      const dy = 7 * Math.sin(ang);
                      return (
                        <line
                          key={i}
                          x1={cx - dx}
                          y1={cy + dy}
                          x2={cx + dx}
                          y2={cy - dy}
                          stroke="#CBD5E1"
                          strokeWidth={1.3}
                        />
                      );
                    })}
                    <path d={euPath} fill="none" stroke="#0284C7" strokeWidth={2} strokeDasharray="5 3" />
                    <path d={rkPath} fill="none" stroke="#F97316" strokeWidth={2.8} />
                    <circle cx={sx(ode.rows[0].x)} cy={sy(ode.rows[0].rk4Y)} r={5} fill="#111827" />
                  </svg>
                );
              })()}
              <p className="text-xs text-gray-500 mt-2">
                4th-Order Runge–Kutta achieves O(h⁴) global accuracy by sampling slopes at four sub-step stages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 25: LAPLACE & FOURIER TRANSFORM STUDIO
// ============================================================================
const LAPLACE_PAIRS = [
  {
    id: 'damped_sin',
    label: 'Damped Sine: e^(−at)·sin(ωt)',
    timeStr: (a: number, w: number) => `e^(−${a}t) · sin(${w}t)`,
    sStr: (a: number, w: number) => `${fmtNum(w, 3)} / ((s + ${a})² + ${fmtNum(w * w, 3)})`,
    roc: (a: number) => `Re(s) > −${a}`,
    poles: (a: number, w: number) => `s = −${a} ± ${w}i`,
  },
  {
    id: 'damped_cos',
    label: 'Damped Cosine: e^(−at)·cos(ωt)',
    timeStr: (a: number, w: number) => `e^(−${a}t) · cos(${w}t)`,
    sStr: (a: number, w: number) => `(s + ${a}) / ((s + ${a})² + ${fmtNum(w * w, 3)})`,
    roc: (a: number) => `Re(s) > −${a}`,
    poles: (a: number, w: number) => `s = −${a} ± ${w}i`,
  },
  {
    id: 'poly_exp',
    label: 'tⁿ Exponential: t^n · e^(−at)',
    timeStr: (a: number, n: number) => `t^${Math.round(n)} · e^(−${a}t)`,
    sStr: (a: number, n: number) => `${Math.round(n)}! / (s + ${a})^${Math.round(n) + 1}`,
    roc: (a: number) => `Re(s) > −${a}`,
    poles: (a: number, n: number) => `s = −${a} (Order ${Math.round(n) + 1})`,
  },
];

export const LaplaceFourierTransformStudio: React.FC = () => {
  const [tab, setTab] = useState<'fourier' | 'laplace'>('fourier');
  const [wave, setWave] = useState<'square' | 'sawtooth' | 'triangle'>('square');
  const [harmonics, setHarmonics] = useState(7);

  const [lapId, setLapId] = useState('damped_sin');
  const [paramA, setParamA] = useState('2');
  const [paramW, setParamW] = useState('3');

  const fourier = useMemo(() => {
    const N = Math.max(1, Math.min(25, harmonics));
    const evalWave = (t: number) => {
      let sum = 0;
      for (let n = 1; n <= N; n++) {
        if (wave === 'square' && n % 2 === 1) {
          sum += (4 / (Math.PI * n)) * Math.sin(n * t);
        } else if (wave === 'sawtooth') {
          sum += (2 / (Math.PI * n)) * (n % 2 === 1 ? 1 : -1) * Math.sin(n * t);
        } else if (wave === 'triangle' && n % 2 === 1) {
          const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
          sum += (8 / (Math.PI * Math.PI * n * n)) * sign * Math.sin(n * t);
        }
      }
      return sum;
    };

    const pts = Array.from({ length: 141 }, (_, i) => {
      const t = -Math.PI + ((2 * Math.PI) * i) / 140;
      return { t, y: evalWave(t) };
    });

    const coeffs = Array.from({ length: Math.min(9, N) }, (_, idx) => {
      const n = idx + 1;
      let bn = 0;
      if (wave === 'square' && n % 2 === 1) bn = 4 / (Math.PI * n);
      if (wave === 'sawtooth') bn = (2 / (Math.PI * n)) * (n % 2 === 1 ? 1 : -1);
      if (wave === 'triangle' && n % 2 === 1) {
        bn = (8 / (Math.PI * Math.PI * n * n)) * (((n - 1) / 2) % 2 === 0 ? 1 : -1);
      }
      return { n, amp: Math.abs(bn), bn };
    });

    return { pts, coeffs };
  }, [wave, harmonics]);

  const activeLap = LAPLACE_PAIRS.find((p) => p.id === lapId) || LAPLACE_PAIRS[0];
  const aNum = Number(paramA) || 2;
  const wNum = Number(paramW) || 3;

  const solutionText =
    tab === 'fourier'
      ? `Fourier Series (${wave} wave, N = ${harmonics} harmonics): ` +
        fourier.coeffs
          .filter((c) => c.amp > 1e-5)
          .map((c) => `${fmtNum(c.bn, 4)}·sin(${c.n}t)`)
          .join(' + ')
      : `Laplace Transform: L{${activeLap.timeStr(aNum, wNum)}} = ${activeLap.sStr(aNum, wNum)} (${activeLap.roc(
          aNum
        )})`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Gibbs Square Wave (N=9)',
            onSelect: () => {
              setTab('fourier');
              setWave('square');
              setHarmonics(9);
            },
          },
          {
            label: 'Sawtooth Harmonic Synthesis',
            onSelect: () => {
              setTab('fourier');
              setWave('sawtooth');
              setHarmonics(12);
            },
          },
          {
            label: 'Laplace: e^(−2t)sin(3t)',
            onSelect: () => {
              setTab('laplace');
              setLapId('damped_sin');
              setParamA('2');
              setParamW('3');
            },
          },
        ]}
        onReset={() => {
          setTab('fourier');
          setWave('square');
          setHarmonics(7);
        }}
        solutionText={solutionText}
      />

      <div className="p-6 space-y-5">
        <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('fourier')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
              tab === 'fourier' ? 'bg-[#F97316] text-white' : 'text-gray-600'
            }`}
          >
            N-Harmonic Fourier Series Synthesizer
          </button>
          <button
            type="button"
            onClick={() => setTab('laplace')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
              tab === 'laplace' ? 'bg-[#F97316] text-white' : 'text-gray-600'
            }`}
          >
            Symbolic Laplace & Pole-ROC Solver
          </button>
        </div>

        {tab === 'fourier' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex gap-1.5">
                {(['square', 'sawtooth', 'triangle'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWave(w)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                      wave === w
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-[#F9FAFB] text-gray-700 border-gray-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Harmonic Order N: {harmonics}
                </label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={harmonics}
                  onChange={(e) => setHarmonics(Number(e.target.value))}
                  className="w-full accent-[#F97316]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono tabular-nums">
                <span className="font-sans font-semibold text-[#EA580C] block">
                  Harmonic Spectral Coefficients b_n
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {fourier.coeffs.map((c) => (
                    <div key={c.n} className="p-2 bg-white rounded-lg border border-orange-200/70">
                      <span className="text-gray-400 block">n={c.n}</span>
                      <span className="font-bold text-gray-900">{fmtNum(c.bn, 3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200">
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Partial Fourier Sum S_{harmonics}(t) on [−π, π]
                </span>
                {(() => {
                  const W = 480;
                  const H = 210;
                  const sx = (t: number) => 28 + ((t + Math.PI) / (2 * Math.PI)) * (W - 56);
                  const sy = (y: number) => H / 2 - (y / 1.5) * (H / 2 - 20);
                  const d = fourier.pts
                    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.y).toFixed(1)}`)
                    .join(' ');
                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                      <line x1={28} y1={H / 2} x2={W - 28} y2={H / 2} stroke="#D1D5DB" />
                      <path d={d} fill="none" stroke="#F97316" strokeWidth={2.4} />
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical Signal Family</label>
                <select
                  value={lapId}
                  onChange={(e) => setLapId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-[#F9FAFB] border border-gray-300 rounded-xl"
                >
                  {LAPLACE_PAIRS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Decay Parameter a</label>
                  <input
                    type="number"
                    step="0.5"
                    value={paramA}
                    onChange={(e) => setParamA(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lapId === 'poly_exp' ? 'Power n' : 'Frequency ω'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={paramW}
                    onChange={(e) => setParamW(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-3 font-mono text-xs">
                <div>
                  <span className="font-sans font-semibold text-gray-500 block">Time-Domain Signal f(t), t ≥ 0</span>
                  <span className="text-base font-bold text-gray-900">{activeLap.timeStr(aNum, wNum)}</span>
                </div>
                <div className="pt-2 border-t border-orange-200/70">
                  <span className="font-sans font-semibold text-[#EA580C] block">s-Domain Transform F(s) = L&#123;f(t)&#125;</span>
                  <span className="text-lg font-bold text-gray-900">{activeLap.sStr(aNum, wNum)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-200/70">
                  <div>
                    <span className="font-sans text-gray-500 block">Region of Convergence</span>
                    <span className="font-semibold text-gray-900">{activeLap.roc(aNum)}</span>
                  </div>
                  <div>
                    <span className="font-sans text-gray-500 block">s-Plane Poles</span>
                    <span className="font-semibold text-gray-900">{activeLap.poles(aNum, wNum)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 26: NUMERICAL ROOT-FINDING LAB (NEWTON-RAPHSON, BISECTION & SECANT)
// ============================================================================
export const NumericalRootFindingLab: React.FC = () => {
  const [fnExpr, setFnExpr] = useState('x^3 - x - 2');
  const [algo, setAlgo] = useState<'newton' | 'bisection' | 'secant'>('newton');
  const [x0Str, setX0Str] = useState('1');
  const [x1Str, setX1Str] = useState('2');

  const rootLab = useMemo(() => {
    try {
      const fAst = simplifyAst(parseMathAst(fnExpr));
      const dfAst = simplifyAst(differentiateAst(fAst, 'x'));
      const f = (x: number) => evalAst(fAst, { x });
      const df = (x: number) => evalAst(dfAst, { x });

      const a0 = Number(x0Str) || 1;
      const b0 = Number(x1Str) || 2;
      const iters: Array<{ k: number; xk: number; fxk: number; err: number }> = [];

      if (algo === 'newton') {
        let x = a0;
        for (let k = 0; k <= 8; k++) {
          const fx = f(x);
          const dfx = df(x);
          const next = Math.abs(dfx) > 1e-12 ? x - fx / dfx : x;
          const err = Math.abs(next - x);
          iters.push({ k, xk: x, fxk: fx, err });
          x = next;
          if (err < 1e-11) break;
        }
      } else if (algo === 'secant') {
        let xPrev = a0;
        let xCur = b0;
        for (let k = 0; k <= 9; k++) {
          const fPrev = f(xPrev);
          const fCur = f(xCur);
          const denom = fCur - fPrev;
          const next = Math.abs(denom) > 1e-13 ? xCur - (fCur * (xCur - xPrev)) / denom : xCur;
          const err = Math.abs(next - xCur);
          iters.push({ k, xk: xCur, fxk: fCur, err });
          xPrev = xCur;
          xCur = next;
          if (err < 1e-11) break;
        }
      } else {
        let lo = Math.min(a0, b0);
        let hi = Math.max(a0, b0);
        for (let k = 0; k <= 14; k++) {
          const mid = (lo + hi) / 2;
          const fm = f(mid);
          iters.push({ k, xk: mid, fxk: fm, err: (hi - lo) / 2 });
          if (Math.abs(fm) < 1e-11 || (hi - lo) / 2 < 1e-8) break;
          if (f(lo) * fm <= 0) hi = mid;
          else lo = mid;
        }
      }

      const finalRoot = iters[iters.length - 1]?.xk ?? a0;
      return { ok: true as const, dfStr: formatAst(dfAst), iters, finalRoot };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid equation' };
    }
  }, [fnExpr, algo, x0Str, x1Str]);

  const solutionText = rootLab.ok
    ? [
        `Numerical Root Finding (${algo.toUpperCase()}) on f(x) = ${fnExpr} = 0`,
        `Converged Root x* ≈ ${fmtNum(rootLab.finalRoot, 8)}`,
        ...rootLab.iters.map(
          (r) => `k=${r.k}: x_k=${fmtNum(r.xk, 8)}, f(x_k)=${r.fxk.toExponential(3)}, Δ=${r.err.toExponential(3)}`
        ),
      ].join('\n')
    : 'Invalid input';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Cubic x³ − x − 2 = 0 on [1, 2]',
            onSelect: () => {
              setFnExpr('x^3 - x - 2');
              setX0Str('1.5');
              setX1Str('2');
            },
          },
          {
            label: 'Dottie Fixed Point: cos(x) − x = 0',
            onSelect: () => {
              setFnExpr('cos(x) - x');
              setX0Str('0.5');
              setX1Str('1');
            },
          },
          {
            label: 'Kepler Transcendental: exp(-x) - x',
            onSelect: () => {
              setFnExpr('exp(-x) - x');
              setX0Str('0.5');
              setX1Str('1');
            },
          },
        ]}
        onReset={() => {
          setFnExpr('x^3 - x - 2');
          setAlgo('newton');
          setX0Str('1');
          setX1Str('2');
        }}
        solutionText={solutionText}
        modeLabel={algo.toUpperCase()}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            {(['newton', 'bisection', 'secant'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAlgo(m)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize ${
                  algo === m ? 'bg-[#F97316] text-white' : 'text-gray-600'
                }`}
              >
                {m === 'newton' ? 'Newton–Raphson' : m}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nonlinear Equation f(x) = 0</label>
            <input
              type="text"
              value={fnExpr}
              onChange={(e) => setFnExpr(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {algo === 'newton' ? 'Initial Guess x₀' : 'Left / First Point x₀'}
              </label>
              <input
                type="number"
                step="0.1"
                value={x0Str}
                onChange={(e) => setX0Str(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
              />
            </div>
            {algo !== 'newton' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Right / Second Point x₁</label>
                <input
                  type="number"
                  step="0.1"
                  value={x1Str}
                  onChange={(e) => setX1Str(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {rootLab.ok && (
            <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-1.5 font-mono text-xs tabular-nums">
              <span className="font-sans font-semibold text-[#EA580C] block">Converged Root x*</span>
              <div className="text-2xl font-bold text-gray-900">{fmtNum(rootLab.finalRoot, 8)}</div>
              <div className="text-gray-600 pt-1">Symbolic f&apos;(x) = {rootLab.dfStr}</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {rootLab.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Iteration Convergence Log ({rootLab.iters.length} Steps)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono tabular-nums bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <th className="px-3 py-2 text-left">k</th>
                      <th className="px-3 py-2 text-right">Estimate x_k</th>
                      <th className="px-3 py-2 text-right">Residual f(x_k)</th>
                      <th className="px-3 py-2 text-right">Step Error |Δx|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rootLab.iters.map((it) => (
                      <tr key={it.k} className="border-b last:border-b-0 border-gray-100">
                        <td className="px-3 py-2 text-gray-500">{it.k}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                          {fmtNum(it.xk, 8)}
                        </td>
                        <td className="px-3 py-2 text-right text-sky-700">{it.fxk.toExponential(3)}</td>
                        <td className="px-3 py-2 text-right text-[#EA580C]">{it.err.toExponential(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 27: NUMBER THEORY, MODULAR ARITHMETIC & RSA CRYPTOGRAPHY CALCULATOR
// ============================================================================
function modPowBig(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) result = (result * b) % mod;
    e /= 2n;
    b = (b * b) % mod;
  }
  return result;
}

function extendedGcd(a: number, b: number) {
  let oldR = a;
  let r = b;
  let oldS = 1;
  let s = 0;
  let oldT = 0;
  let t = 1;
  const steps: Array<{ q: number; r: number; s: number; t: number }> = [];
  while (r !== 0) {
    const q = Math.trunc(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
    steps.push({ q, r: oldR, s: oldS, t: oldT });
  }
  return { gcd: oldR, x: oldS, y: oldT, steps };
}

export const NumberTheoryModularRsaCalculator: React.FC = () => {
  const [modA, setModA] = useState('17');
  const [modExp, setModExp] = useState('23');
  const [modM, setModM] = useState('43');

  // RSA Demo
  const [rsaP, setRsaP] = useState('11');
  const [rsaQ, setRsaQ] = useState('17');
  const [rsaE, setRsaE] = useState('7');
  const [rsaMsg, setRsaMsg] = useState('88');

  const nt = useMemo(() => {
    const a = Math.max(1, Math.trunc(Math.abs(Number(modA) || 1)));
    const bExp = Math.max(0, Math.trunc(Math.abs(Number(modExp) || 1)));
    const m = Math.max(2, Math.trunc(Math.abs(Number(modM) || 2)));

    const eg = extendedGcd(a, m);
    const inv = eg.gcd === 1 ? ((eg.x % m) + m) % m : null;
    const powMod = Number(modPowBig(BigInt(a), BigInt(bExp), BigInt(m)));

    // Euler totient phi(m)
    let temp = m;
    let phiM = m;
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        while (temp % p === 0) temp /= p;
        phiM -= phiM / p;
      }
    }
    if (temp > 1) phiM -= phiM / temp;

    // RSA
    const p = Math.max(3, Math.trunc(Number(rsaP) || 11));
    const q = Math.max(3, Math.trunc(Number(rsaQ) || 17));
    const n = p * q;
    const phiN = (p - 1) * (q - 1);
    const e = Math.max(3, Math.trunc(Number(rsaE) || 7));
    const coprimeE = gcdInt(e, phiN) === 1;
    const egRsa = extendedGcd(e, phiN);
    const d = coprimeE ? ((egRsa.x % phiN) + phiN) % phiN : null;
    const msg = Math.max(0, Math.min(n - 1, Math.trunc(Number(rsaMsg) || 42)));
    const cipher = Number(modPowBig(BigInt(msg), BigInt(e), BigInt(n)));
    const decrypted = d !== null ? Number(modPowBig(BigInt(cipher), BigInt(d), BigInt(n))) : null;

    return { a, bExp, m, eg, inv, powMod, phiM, p, q, n, phiN, e, coprimeE, d, msg, cipher, decrypted };
  }, [modA, modExp, modM, rsaP, rsaQ, rsaE, rsaMsg]);

  const solutionText = [
    `Modular Arithmetic & RSA Lab`,
    `Bézout Identity: ${nt.a}(${nt.eg.x}) + ${nt.m}(${nt.eg.y}) = gcd(${nt.a}, ${nt.m}) = ${nt.eg.gcd}`,
    `Modular Inverse: ${nt.inv !== null ? `${nt.a}⁻¹ mod ${nt.m} = ${nt.inv}` : 'Does not exist (gcd ≠ 1)'}`,
    `Fast Modular Power: ${nt.a}^${nt.bExp} mod ${nt.m} = ${nt.powMod} · φ(${nt.m}) = ${nt.phiM}`,
    `RSA (p=${nt.p}, q=${nt.q} ⇒ n=${nt.n}, φ(n)=${nt.phiN}): e=${nt.e}, d=${nt.d ?? 'Invalid'} | m=${nt.msg} → c=${nt.cipher} → m'=${nt.decrypted ?? 'N/A'}`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'RSA Exam (p=11, q=17, e=7, m=88)',
            onSelect: () => {
              setRsaP('11');
              setRsaQ('17');
              setRsaE('7');
              setRsaMsg('88');
            },
          },
          {
            label: 'Inverse 17⁻¹ mod 43 = 38',
            onSelect: () => {
              setModA('17');
              setModExp('23');
              setModM('43');
            },
          },
          {
            label: 'Larger Primes (p=61, q=53, e=17)',
            onSelect: () => {
              setRsaP('61');
              setRsaQ('53');
              setRsaE('17');
              setRsaMsg('65');
            },
          },
        ]}
        onReset={() => {
          setModA('17');
          setModExp('23');
          setModM('43');
          setRsaP('11');
          setRsaQ('17');
          setRsaE('7');
          setRsaMsg('88');
        }}
        solutionText={solutionText}
        modeLabel="Extended Euclid & RSA"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-700">
              Extended Euclidean Bézout, Inverse a⁻¹ mod m & Fast Power a^b mod m
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base a</label>
                <input
                  type="number"
                  value={modA}
                  onChange={(e) => setModA(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Exponent b</label>
                <input
                  type="number"
                  value={modExp}
                  onChange={(e) => setModExp(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Modulus m</label>
                <input
                  type="number"
                  value={modM}
                  onChange={(e) => setModM(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 font-mono text-xs space-y-1.5 tabular-nums">
              <div>
                Bézout: {nt.a}·({nt.eg.x}) + {nt.m}·({nt.eg.y}) = <strong>{nt.eg.gcd}</strong>
              </div>
              <div>
                Modular Inverse {nt.a}⁻¹ mod {nt.m} ={' '}
                <strong className="text-[#EA580C]">
                  {nt.inv !== null ? nt.inv : 'None (gcd ≠ 1)'}
                </strong>
              </div>
              <div>
                Square-and-Multiply: {nt.a}^{nt.bExp} mod {nt.m} = <strong>{nt.powMod}</strong> · φ({nt.m}) ={' '}
                <strong>{nt.phiM}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-3">
            <p className="text-xs font-semibold text-[#EA580C]">
              Interactive Public-Key RSA Cryptosystem Simulator
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Prime p</label>
                <input
                  type="number"
                  value={rsaP}
                  onChange={(e) => setRsaP(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Prime q</label>
                <input
                  type="number"
                  value={rsaQ}
                  onChange={(e) => setRsaQ(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Public e</label>
                <input
                  type="number"
                  value={rsaE}
                  onChange={(e) => setRsaE(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Message m</label>
                <input
                  type="number"
                  value={rsaMsg}
                  onChange={(e) => setRsaMsg(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-orange-200 rounded-lg"
                />
              </div>
            </div>

            {nt.coprimeE && nt.d !== null ? (
              <div className="p-3.5 bg-white rounded-xl border border-orange-200/80 font-mono text-xs space-y-1.5 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-gray-500">Modulus n = p·q & Totient φ(n)</span>
                  <span className="font-bold text-gray-900">
                    n = {nt.n} · φ(n) = {nt.phiN}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Private Key d ≡ e⁻¹ (mod φ(n))</span>
                  <span className="font-bold text-[#EA580C]">d = {nt.d}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-100 flex justify-between">
                  <span>Encrypt c = {nt.msg}^{nt.e} mod {nt.n}</span>
                  <span className="font-bold text-sky-700">c = {nt.cipher}</span>
                </div>
                <div className="flex justify-between">
                  <span>Decrypt m&apos; = {nt.cipher}^{nt.d} mod {nt.n}</span>
                  <span className="font-bold text-emerald-700">m&apos; = {nt.decrypted} ✓</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-700 font-medium">
                Public exponent e = {nt.e} must be coprime to φ(n) = {nt.phiN} (gcd(e, φ(n)) = 1). Try e = 7 or 17.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
