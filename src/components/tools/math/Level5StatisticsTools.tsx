import React, { useMemo, useState } from 'react';
import {
  chiSquareCdf,
  chiSquarePdf,
  computeRrefWithSteps,
  factorialNum,
  fDistCdf,
  invStandardNormal,
  invStudentT,
  nCrNum,
  normalCdf,
  normalPdf,
  nPrNum,
  studentTCdf,
  studentTPdf,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 19: DESCRIPTIVE STATISTICS, QUARTILES & BOX-PLOT GENERATOR
// ============================================================================
export const DescriptiveStatisticsBoxplot: React.FC = () => {
  const [rawInput, setRawInput] = useState('62, 68, 71, 74, 75, 78, 81, 84, 88, 95, 118');

  const stats = useMemo(() => {
    const nums = rawInput
      .split(/[\s,;]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && Number.isFinite(n));

    if (nums.length < 2) {
      return { ok: false as const, error: 'Enter at least 2 numeric observations separated by commas or spaces.' };
    }

    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;

    const quantile = (arr: number[], q: number) => {
      const pos = (arr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      return arr[base + 1] !== undefined ? arr[base] + rest * (arr[base + 1] - arr[base]) : arr[base];
    };

    const median = quantile(sorted, 0.5);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sorted.filter((x) => x < lowerFence || x > upperFence);
    const nonOutliers = sorted.filter((x) => x >= lowerFence && x <= upperFence);
    const whiskerLow = nonOutliers[0] ?? sorted[0];
    const whiskerHigh = nonOutliers[nonOutliers.length - 1] ?? sorted[n - 1];

    const sumSq = sorted.reduce((acc, x) => acc + (x - mean) ** 2, 0);
    const sampleVar = sumSq / (n - 1);
    const popVar = sumSq / n;
    const sampleSd = Math.sqrt(sampleVar);
    const popSd = Math.sqrt(popVar);

    const skewness =
      n >= 3 && sampleSd > 1e-12
        ? (n / ((n - 1) * (n - 2))) * sorted.reduce((acc, x) => acc + ((x - mean) / sampleSd) ** 3, 0)
        : 0;

    // Mode
    const freq = new Map<number, number>();
    sorted.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
    const maxFreq = Math.max(...Array.from(freq.values()));
    const modes = maxFreq > 1 ? Array.from(freq.entries()).filter(([, c]) => c === maxFreq).map(([v]) => v) : [];

    // 6-bin histogram
    const minV = sorted[0];
    const maxV = sorted[n - 1];
    const span = Math.max(1e-6, maxV - minV);
    const bins = Array.from({ length: 6 }, (_, i) => {
      const lo = minV + (span * i) / 6;
      const hi = minV + (span * (i + 1)) / 6;
      const count = sorted.filter((v) => (i === 5 ? v >= lo && v <= hi : v >= lo && v < hi)).length;
      return { lo, hi, count };
    });

    return {
      ok: true as const,
      n,
      sorted,
      mean,
      median,
      modes,
      q1,
      q3,
      iqr,
      lowerFence,
      upperFence,
      outliers,
      whiskerLow,
      whiskerHigh,
      sampleVar,
      sampleSd,
      popSd,
      skewness,
      minV,
      maxV,
      bins,
    };
  }, [rawInput]);

  const solutionText = stats.ok
    ? [
        `Descriptive Statistics (n = ${stats.n})`,
        `Mean x̄ = ${fmtNum(stats.mean, 4)} · Median = ${fmtNum(stats.median, 4)} · Sample SD s = ${fmtNum(
          stats.sampleSd,
          4
        )} (σ = ${fmtNum(stats.popSd, 4)})`,
        `Five-Number Summary: Min=${stats.minV}, Q1=${fmtNum(stats.q1, 3)}, Median=${fmtNum(
          stats.median,
          3
        )}, Q3=${fmtNum(stats.q3, 3)}, Max=${stats.maxV}`,
        `IQR = ${fmtNum(stats.iqr, 3)} · Tukey Fences [${fmtNum(stats.lowerFence, 2)}, ${fmtNum(
          stats.upperFence,
          2
        )}] · Outliers: ${stats.outliers.length ? stats.outliers.join(', ') : 'None'}`,
      ].join('\n')
    : 'Insufficient dataset';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Midterm Scores + Outlier',
            onSelect: () => setRawInput('62, 68, 71, 74, 75, 78, 81, 84, 88, 95, 118'),
          },
          {
            label: 'Symmetric Reaction Times (ms)',
            onSelect: () => setRawInput('210, 215, 218, 220, 220, 222, 225, 228, 231, 235'),
          },
          {
            label: 'Right-Skewed Income Sample ($k)',
            onSelect: () => setRawInput('38, 42, 45, 47, 51, 54, 62, 78, 115, 165'),
          },
        ]}
        onReset={() => setRawInput('62, 68, 71, 74, 75, 78, 81, 84, 88, 95, 118')}
        solutionText={solutionText}
        modeLabel={stats.ok ? `Sample n = ${stats.n}` : ''}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Raw Dataset (Comma, space, or newline separated)
            </label>
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          {stats.ok ? (
            <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <div>
                <span className="font-sans text-[#EA580C] font-semibold block">Sample Mean (x̄)</span>
                <span className="text-lg font-bold text-gray-900">{fmtNum(stats.mean, 4)}</span>
              </div>
              <div>
                <span className="font-sans text-[#EA580C] font-semibold block">Median (Q₂)</span>
                <span className="text-lg font-bold text-gray-900">{fmtNum(stats.median, 4)}</span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Sample SD (s) / Var (s²)</span>
                <span className="font-bold text-gray-900">
                  {fmtNum(stats.sampleSd, 4)} / {fmtNum(stats.sampleVar, 3)}
                </span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Population SD (σ)</span>
                <span className="font-bold text-gray-900">{fmtNum(stats.popSd, 4)}</span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Quartiles Q₁ / Q₃ (IQR)</span>
                <span className="font-bold text-gray-900">
                  {fmtNum(stats.q1, 2)} / {fmtNum(stats.q3, 2)} ({fmtNum(stats.iqr, 2)})
                </span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Skewness & Mode</span>
                <span className="font-bold text-gray-900">
                  {fmtNum(stats.skewness, 3)} · {stats.modes.length ? stats.modes.join(',') : 'No repeat'}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-orange-200/70">
                <span className="font-sans text-gray-600">1.5×IQR Outlier Fences: </span>
                [{fmtNum(stats.lowerFence, 2)}, {fmtNum(stats.upperFence, 2)}] →{' '}
                <strong className="text-[#EA580C]">
                  {stats.outliers.length ? `Outliers: ${stats.outliers.join(', ')}` : '0 Outliers'}
                </strong>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{stats.error}</div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          {stats.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Tukey Box-and-Whisker Plot (with 1.5×IQR Outliers)
                </p>
                {(() => {
                  const W = 480;
                  const H = 105;
                  const pad = 34;
                  const span = Math.max(1e-6, stats.maxV - stats.minV);
                  const sx = (v: number) => pad + ((v - stats.minV) / span) * (W - 2 * pad);
                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                      <line x1={pad} y1={82} x2={W - pad} y2={82} stroke="#D1D5DB" />
                      <line
                        x1={sx(stats.whiskerLow)}
                        y1={44}
                        x2={sx(stats.whiskerHigh)}
                        y2={44}
                        stroke="#111827"
                        strokeWidth={2}
                      />
                      <line x1={sx(stats.whiskerLow)} y1={30} x2={sx(stats.whiskerLow)} y2={58} stroke="#111827" strokeWidth={2} />
                      <line x1={sx(stats.whiskerHigh)} y1={30} x2={sx(stats.whiskerHigh)} y2={58} stroke="#111827" strokeWidth={2} />
                      <rect
                        x={sx(stats.q1)}
                        y={24}
                        width={Math.max(2, sx(stats.q3) - sx(stats.q1))}
                        height={40}
                        fill="#FFF7ED"
                        stroke="#F97316"
                        strokeWidth={2.2}
                      />
                      <line
                        x1={sx(stats.median)}
                        y1={24}
                        x2={sx(stats.median)}
                        y2={64}
                        stroke="#EA580C"
                        strokeWidth={3}
                      />
                      {stats.outliers.map((o, idx) => (
                        <circle key={idx} cx={sx(o)} cy={44} r={5} fill="#DC2626" />
                      ))}
                      {[
                        { v: stats.whiskerLow, lbl: fmtNum(stats.whiskerLow, 1) },
                        { v: stats.q1, lbl: `Q1:${fmtNum(stats.q1, 1)}` },
                        { v: stats.median, lbl: `M:${fmtNum(stats.median, 1)}` },
                        { v: stats.q3, lbl: `Q3:${fmtNum(stats.q3, 1)}` },
                        { v: stats.whiskerHigh, lbl: fmtNum(stats.whiskerHigh, 1) },
                      ].map((m, idx) => (
                        <text
                          key={idx}
                          x={sx(m.v)}
                          y={97}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-gray-600"
                        >
                          {m.lbl}
                        </text>
                      ))}
                    </svg>
                  );
                })()}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">6-Bin Frequency Histogram</p>
                {(() => {
                  const W = 480;
                  const H = 130;
                  const maxC = Math.max(...stats.bins.map((b) => b.count), 1);
                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                      {stats.bins.map((b, i) => {
                        const bw = (W - 68) / 6;
                        const x = 34 + i * bw;
                        const bh = (b.count / maxC) * 82;
                        return (
                          <g key={i}>
                            <rect
                              x={x + 3}
                              y={102 - bh}
                              width={bw - 6}
                              height={bh}
                              fill="#F97316"
                              fillOpacity={0.85}
                              rx={4}
                            />
                            <text
                              x={x + bw / 2}
                              y={96 - bh}
                              textAnchor="middle"
                              className="text-[10px] font-mono font-bold fill-gray-800"
                            >
                              {b.count}
                            </text>
                            <text
                              x={x + bw / 2}
                              y={118}
                              textAnchor="middle"
                              className="text-[9px] font-mono fill-gray-500"
                            >
                              {fmtNum(b.lo, 0)}–{fmtNum(b.hi, 0)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 20: PROBABILITY DISTRIBUTION EXPLORER (NORMAL, BINOMIAL, POISSON, t, χ²)
// ============================================================================
type DistType = 'normal' | 't' | 'chisq' | 'binomial' | 'poisson';

export const ProbabilityDistributionExplorer: React.FC = () => {
  const [dist, setDist] = useState<DistType>('normal');
  const [p1, setP1] = useState('100'); // mu or df or n or lambda
  const [p2, setP2] = useState('15'); // sigma or p
  const [xVal, setXVal] = useState('124');

  const prob = useMemo(() => {
    const x = Number(xVal) || 0;
    if (dist === 'normal') {
      const mu = Number(p1) || 0;
      const sigma = Math.max(0.001, Number(p2) || 1);
      const z = (x - mu) / sigma;
      const cdf = normalCdf(x, mu, sigma);
      const pts = Array.from({ length: 91 }, (_, i) => {
        const xv = mu - 4 * sigma + ((8 * sigma) * i) / 90;
        return { x: xv, y: normalPdf(xv, mu, sigma) };
      });
      return {
        cdf,
        upper: 1 - cdf,
        extra: `Z-Score = ${fmtNum(z, 4)} · 95% Critical z* = ±${fmtNum(invStandardNormal(0.975), 3)}`,
        pts,
        discrete: false,
        x,
      };
    }

    if (dist === 't') {
      const df = Math.max(1, Math.round(Number(p1) || 10));
      const cdf = studentTCdf(x, df);
      const pts = Array.from({ length: 91 }, (_, i) => {
        const xv = -4.5 + (9 * i) / 90;
        return { x: xv, y: studentTPdf(xv, df) };
      });
      return {
        cdf,
        upper: 1 - cdf,
        extra: `df = ${df} · Two-tailed α=0.05 Critical t* = ±${fmtNum(invStudentT(0.975, df), 4)}`,
        pts,
        discrete: false,
        x,
      };
    }

    if (dist === 'chisq') {
      const df = Math.max(1, Math.round(Number(p1) || 6));
      const cdf = chiSquareCdf(Math.max(0, x), df);
      const maxDom = Math.max(df * 2.8, x * 1.25, 12);
      const pts = Array.from({ length: 91 }, (_, i) => {
        const xv = 0.05 + ((maxDom - 0.05) * i) / 90;
        return { x: xv, y: chiSquarePdf(xv, df) };
      });
      return {
        cdf,
        upper: 1 - cdf,
        extra: `df = ${df} · Mean = ${df}, Variance = ${2 * df}`,
        pts,
        discrete: false,
        x,
      };
    }

    if (dist === 'binomial') {
      const n = Math.max(1, Math.min(80, Math.round(Number(p1) || 12)));
      const p = Math.max(0.001, Math.min(0.999, Number(p2) || 0.5));
      const kMax = Math.floor(x);
      const pts = Array.from({ length: n + 1 }, (_, k) => ({
        x: k,
        y: nCrNum(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k),
      }));
      const cdf = pts.filter((pt) => pt.x <= kMax).reduce((s, pt) => s + pt.y, 0);
      const exactPmf = pts.find((pt) => pt.x === kMax)?.y ?? 0;
      return {
        cdf,
        upper: 1 - cdf + exactPmf,
        extra: `P(X = ${kMax}) = ${fmtNum(exactPmf, 5)} · Mean np = ${fmtNum(n * p, 3)}`,
        pts,
        discrete: true,
        x: kMax,
      };
    }

    // Poisson
    const lam = Math.max(0.1, Math.min(40, Number(p1) || 4));
    const kMax = Math.max(0, Math.floor(x));
    const maxPlot = Math.max(15, Math.ceil(lam + 4 * Math.sqrt(lam)));
    const pts = Array.from({ length: maxPlot + 1 }, (_, k) => ({
      x: k,
      y: (Math.pow(lam, k) * Math.exp(-lam)) / factorialNum(k),
    }));
    const cdf = pts.filter((pt) => pt.x <= kMax).reduce((s, pt) => s + pt.y, 0);
    const exactPmf = pts.find((pt) => pt.x === kMax)?.y ?? 0;
    return {
      cdf,
      upper: 1 - cdf + exactPmf,
      extra: `P(X = ${kMax}) = ${fmtNum(exactPmf, 5)} · Mean = Variance = λ = ${lam}`,
      pts,
      discrete: true,
      x: kMax,
    };
  }, [dist, p1, p2, xVal]);

  const W = 480;
  const H = 230;
  const pad = 32;

  const solutionText = [
    `Probability Distribution: ${dist.toUpperCase()}`,
    `P(X ≤ ${prob.x}) = ${fmtNum(prob.cdf, 6)}`,
    `P(X ≥ ${prob.x}) = ${fmtNum(prob.upper, 6)}`,
    prob.extra,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'IQ Normal N(100, 15²), X ≤ 124',
            onSelect: () => {
              setDist('normal');
              setP1('100');
              setP2('15');
              setXVal('124');
            },
          },
          {
            label: 'Binomial B(n=12, p=0.35), X ≤ 5',
            onSelect: () => {
              setDist('binomial');
              setP1('12');
              setP2('0.35');
              setXVal('5');
            },
          },
          {
            label: 'Student’s t (df=14), t = 2.145',
            onSelect: () => {
              setDist('t');
              setP1('14');
              setXVal('2.145');
            },
          },
        ]}
        onReset={() => {
          setDist('normal');
          setP1('100');
          setP2('15');
          setXVal('124');
        }}
        solutionText={solutionText}
        modeLabel={dist.toUpperCase()}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'normal', lbl: 'Normal' },
                { id: 'binomial', lbl: 'Binomial' },
                { id: 'poisson', lbl: 'Poisson' },
                { id: 't', lbl: "Student's t" },
                { id: 'chisq', lbl: 'Chi-Square χ²' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDist(d.id);
                  if (d.id === 'normal') {
                    setP1('100');
                    setP2('15');
                    setXVal('124');
                  } else if (d.id === 'binomial') {
                    setP1('12');
                    setP2('0.4');
                    setXVal('5');
                  } else if (d.id === 'poisson') {
                    setP1('4.5');
                    setXVal('6');
                  } else if (d.id === 't') {
                    setP1('15');
                    setXVal('1.75');
                  } else {
                    setP1('6');
                    setXVal('12.59');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                  dist === d.id
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-[#F9FAFB] text-gray-700 border-gray-200'
                }`}
              >
                {d.lbl}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {dist === 'normal'
                  ? 'Mean μ'
                  : dist === 'binomial'
                  ? 'Trials n'
                  : dist === 'poisson'
                  ? 'Rate λ'
                  : 'df (ν)'}
              </label>
              <input
                type="number"
                step="any"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            {(dist === 'normal' || dist === 'binomial') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {dist === 'normal' ? 'Std Dev σ' : 'Prob p'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Threshold x</label>
              <input
                type="number"
                step="any"
                value={xVal}
                onChange={(e) => setXVal(e.target.value)}
                className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono tabular-nums">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-sans font-semibold text-[#EA580C] block">Left Tail P(X ≤ {prob.x})</span>
                <span className="text-xl font-bold text-gray-900">{fmtNum(prob.cdf, 5)}</span>
              </div>
              <div>
                <span className="font-sans font-semibold text-gray-600 block">Right Tail P(X ≥ {prob.x})</span>
                <span className="text-xl font-bold text-gray-900">{fmtNum(prob.upper, 5)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-orange-200/70 text-gray-700">{prob.extra}</div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-700 mb-2">
              Shaded Cumulative Density / Mass Function (X ≤ {prob.x})
            </span>
            {(() => {
              const xs = prob.pts.map((p) => p.x);
              const ys = prob.pts.map((p) => p.y);
              const minX = Math.min(...xs);
              const maxX = Math.max(...xs);
              const maxY = Math.max(...ys, 0.01) * 1.12;
              const sx = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (W - 2 * pad);
              const sy = (v: number) => H - pad - (v / maxY) * (H - 2 * pad);

              if (prob.discrete) {
                const bw = Math.max(4, Math.min(20, (W - 2 * pad) / (prob.pts.length * 1.5)));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#9CA3AF" />
                    {prob.pts.map((pt, i) => (
                      <rect
                        key={i}
                        x={sx(pt.x) - bw / 2}
                        y={sy(pt.y)}
                        width={bw}
                        height={H - pad - sy(pt.y)}
                        fill={pt.x <= prob.x ? '#F97316' : '#E5E7EB'}
                        rx={2}
                      />
                    ))}
                  </svg>
                );
              }

              const lineD = prob.pts
                .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
                .join(' ');
              const shaded = prob.pts.filter((p) => p.x <= prob.x);
              const areaD =
                shaded.length > 1
                  ? `M${sx(shaded[0].x).toFixed(1)},${H - pad} ` +
                    shaded.map((p) => `L${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ') +
                    ` L${sx(shaded[shaded.length - 1].x).toFixed(1)},${H - pad} Z`
                  : '';

              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                  <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#9CA3AF" />
                  {areaD && <path d={areaD} fill="#FDBA74" fillOpacity={0.55} />}
                  <path d={lineD} fill="none" stroke="#EA580C" strokeWidth={2.5} />
                </svg>
              );
            })()}
            <p className="text-xs text-gray-500 mt-2">
              Shaded orange region represents cumulative probability P(X ≤ {prob.x}) = {fmtNum(prob.cdf * 100, 2)}%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 21: HYPOTHESIS TESTING SUITE (Z, t, ANOVA & CHI-SQUARE)
// ============================================================================
type TestKind = 't1' | 'z1' | 'welch2' | 'anova' | 'chisq';

export const HypothesisTestingSuite: React.FC = () => {
  const [testKind, setTestKind] = useState<TestKind>('t1');
  const [alpha, setAlpha] = useState('0.05');

  // 1-sample z / t
  const [xBar1, setXBar1] = useState('52.4');
  const [mu0, setMu0] = useState('50');
  const [sd1, setSd1] = useState('5.8');
  const [n1, setN1] = useState('25');

  // 2nd sample for Welch
  const [xBar2, setXBar2] = useState('48.1');
  const [sd2, setSd2] = useState('6.2');
  const [n2, setN2] = useState('22');

  // ANOVA groups
  const [g1, setG1] = useState('72, 75, 78, 74, 76');
  const [g2, setG2] = useState('81, 84, 79, 86, 83');
  const [g3, setG3] = useState('68, 71, 69, 73, 70');

  // Chi-square Observed / Expected
  const [obsStr, setObsStr] = useState('28, 36, 18, 18');
  const [expStr, setExpStr] = useState('25, 25, 25, 25');

  const res = useMemo(() => {
    const a = Number(alpha) || 0.05;
    const parseArr = (s: string) =>
      s
        .split(/[\s,]+/)
        .map(Number)
        .filter((v) => Number.isFinite(v));

    if (testKind === 'z1' || testKind === 't1') {
      const xb = Number(xBar1) || 0;
      const m0 = Number(mu0) || 0;
      const s = Math.max(1e-6, Number(sd1) || 1);
      const n = Math.max(2, Math.round(Number(n1) || 10));
      const se = s / Math.sqrt(n);
      const stat = (xb - m0) / se;
      const df = n - 1;
      const pVal =
        testKind === 'z1'
          ? 2 * (1 - normalCdf(Math.abs(stat)))
          : 2 * (1 - studentTCdf(Math.abs(stat), df));
      const crit = testKind === 'z1' ? invStandardNormal(1 - a / 2) : invStudentT(1 - a / 2, df);
      const ci: [number, number] = [xb - crit * se, xb + crit * se];
      return {
        statName: testKind === 'z1' ? 'Z' : 't',
        stat,
        dfStr: testKind === 'z1' ? '∞ (Normal)' : `${df}`,
        pVal,
        ciStr: `[${fmtNum(ci[0], 3)}, ${fmtNum(ci[1], 3)}]`,
        reject: pVal < a,
        alpha: a,
      };
    }

    if (testKind === 'welch2') {
      const m1 = Number(xBar1) || 0;
      const m2 = Number(xBar2) || 0;
      const s1 = Math.max(1e-6, Number(sd1) || 1);
      const s2 = Math.max(1e-6, Number(sd2) || 1);
      const nn1 = Math.max(2, Number(n1) || 10);
      const nn2 = Math.max(2, Number(n2) || 10);
      const v1 = (s1 * s1) / nn1;
      const v2 = (s2 * s2) / nn2;
      const se = Math.sqrt(v1 + v2);
      const tStat = (m1 - m2) / se;
      const df = ((v1 + v2) ** 2) / ((v1 ** 2) / (nn1 - 1) + (v2 ** 2) / (nn2 - 1));
      const pVal = 2 * (1 - studentTCdf(Math.abs(tStat), df));
      const crit = invStudentT(1 - a / 2, df);
      return {
        statName: 't (Welch)',
        stat: tStat,
        dfStr: fmtNum(df, 2),
        pVal,
        ciStr: `Δμ ∈ [${fmtNum(m1 - m2 - crit * se, 3)}, ${fmtNum(m1 - m2 + crit * se, 3)}]`,
        reject: pVal < a,
        alpha: a,
      };
    }

    if (testKind === 'anova') {
      const groups = [parseArr(g1), parseArr(g2), parseArr(g3)].filter((g) => g.length >= 2);
      const all = groups.flat();
      const N = all.length;
      const k = groups.length;
      const grandMean = all.reduce((s, v) => s + v, 0) / N;
      const ssBetween = groups.reduce((acc, g) => {
        const gm = g.reduce((s, v) => s + v, 0) / g.length;
        return acc + g.length * (gm - grandMean) ** 2;
      }, 0);
      const ssWithin = groups.reduce((acc, g) => {
        const gm = g.reduce((s, v) => s + v, 0) / g.length;
        return acc + g.reduce((s, v) => s + (v - gm) ** 2, 0);
      }, 0);
      const df1 = k - 1;
      const df2 = N - k;
      const fStat = (ssBetween / df1) / (ssWithin / df2);
      const pVal = 1 - fDistCdf(fStat, df1, df2);
      return {
        statName: 'F',
        stat: fStat,
        dfStr: `(${df1}, ${df2})`,
        pVal,
        ciStr: `MSB = ${fmtNum(ssBetween / df1, 3)} · MSW = ${fmtNum(ssWithin / df2, 3)}`,
        reject: pVal < a,
        alpha: a,
      };
    }

    // Chi-Square GoF
    const obs = parseArr(obsStr);
    const exp = parseArr(expStr);
    const len = Math.min(obs.length, exp.length);
    let chi2 = 0;
    for (let i = 0; i < len; i++) {
      if (exp[i] > 0) chi2 += ((obs[i] - exp[i]) ** 2) / exp[i];
    }
    const df = Math.max(1, len - 1);
    const pVal = 1 - chiSquareCdf(chi2, df);
    return {
      statName: 'χ²',
      stat: chi2,
      dfStr: `${df}`,
      pVal,
      ciStr: `${len} Categories Compared`,
      reject: pVal < a,
      alpha: a,
    };
  }, [testKind, alpha, xBar1, mu0, sd1, n1, xBar2, sd2, n2, g1, g2, g3, obsStr, expStr]);

  const solutionText = [
    `Hypothesis Test (${testKind.toUpperCase()}, α = ${res.alpha})`,
    `Test Statistic ${res.statName} = ${fmtNum(res.stat, 4)} (df = ${res.dfStr})`,
    `Two-sided / Tail p-value = ${fmtNum(res.pVal, 6)}`,
    `Interval / Variance Info: ${res.ciStr}`,
    `Decision: ${res.reject ? 'REJECT H₀ (Statistically Significant)' : 'FAIL TO REJECT H₀'}`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          { label: '1-Sample t-Test (n=25)', onSelect: () => setTestKind('t1') },
          { label: '2-Sample Welch t-Test', onSelect: () => setTestKind('welch2') },
          { label: 'One-Way ANOVA (3 Groups)', onSelect: () => setTestKind('anova') },
          { label: 'Chi-Square Goodness-of-Fit', onSelect: () => setTestKind('chisq') },
        ]}
        onReset={() => {
          setTestKind('t1');
          setAlpha('0.05');
        }}
        solutionText={solutionText}
        modeLabel={`α = ${alpha}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: 't1', lbl: '1-Sample t' },
                  { id: 'z1', lbl: '1-Sample Z' },
                  { id: 'welch2', lbl: '2-Sample t' },
                  { id: 'anova', lbl: 'ANOVA F' },
                  { id: 'chisq', lbl: 'χ² GoF' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTestKind(t.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                    testKind === t.id
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-[#F9FAFB] text-gray-700 border-gray-200'
                  }`}
                >
                  {t.lbl}
                </button>
              ))}
            </div>
            <select
              value={alpha}
              onChange={(e) => setAlpha(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-mono bg-[#F9FAFB] border border-gray-300 rounded-lg"
            >
              <option value="0.01">α = 0.01</option>
              <option value="0.05">α = 0.05</option>
              <option value="0.10">α = 0.10</option>
            </select>
          </div>

          {(testKind === 't1' || testKind === 'z1' || testKind === 'welch2') && (
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sample x̄₁</label>
                <input
                  type="number"
                  step="any"
                  value={xBar1}
                  onChange={(e) => setXBar1(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              {testKind !== 'welch2' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Null Mean μ₀</label>
                  <input
                    type="number"
                    step="any"
                    value={mu0}
                    onChange={(e) => setMu0(e.target.value)}
                    className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{testKind === 'z1' ? 'Pop σ' : 'SD s₁'}</label>
                <input
                  type="number"
                  step="any"
                  value={sd1}
                  onChange={(e) => setSd1(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Size n₁</label>
                <input
                  type="number"
                  value={n1}
                  onChange={(e) => setN1(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
              {testKind === 'welch2' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sample x̄₂</label>
                    <input
                      type="number"
                      step="any"
                      value={xBar2}
                      onChange={(e) => setXBar2(e.target.value)}
                      className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SD s₂</label>
                    <input
                      type="number"
                      step="any"
                      value={sd2}
                      onChange={(e) => setSd2(e.target.value)}
                      className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Size n₂</label>
                    <input
                      type="number"
                      value={n2}
                      onChange={(e) => setN2(e.target.value)}
                      className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {testKind === 'anova' && (
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2.5">
              {[
                { lbl: 'Group 1 Observations', val: g1, set: setG1 },
                { lbl: 'Group 2 Observations', val: g2, set: setG2 },
                { lbl: 'Group 3 Observations', val: g3, set: setG3 },
              ].map((g, i) => (
                <div key={i}>
                  <label className="block text-xs text-gray-500 mb-1">{g.lbl}</label>
                  <input
                    type="text"
                    value={g.val}
                    onChange={(e) => g.set(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {testKind === 'chisq' && (
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Observed Counts O_i</label>
                <input
                  type="text"
                  value={obsStr}
                  onChange={(e) => setObsStr(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expected Counts E_i</label>
                <input
                  type="text"
                  value={expStr}
                  onChange={(e) => setExpStr(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-3 font-mono text-xs tabular-nums">
            <div className="flex items-center justify-between">
              <span className="font-sans font-semibold text-[#EA580C]">Statistical Decision (α = {res.alpha})</span>
              <span
                className={`px-2.5 py-1 rounded-md font-sans font-bold ${
                  res.reject ? 'bg-orange-600 text-white' : 'bg-gray-900 text-white'
                }`}
              >
                {res.reject ? 'Reject Null Hypothesis H₀' : 'Fail to Reject H₀'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="font-sans text-gray-500 block">Statistic ({res.statName})</span>
                <span className="text-lg font-bold text-gray-900">{fmtNum(res.stat, 4)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="font-sans text-gray-500 block">Exact p-Value</span>
                <span className="text-lg font-bold text-[#EA580C]">{fmtNum(res.pVal, 5)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="font-sans text-gray-500 block">Degrees df</span>
                <span className="text-lg font-bold text-gray-900">{res.dfStr}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-orange-200/70 text-gray-800">
              <span className="font-sans text-gray-500">Confidence / Summary: </span>
              <strong>{res.ciStr}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 22: LINEAR & NON-LINEAR REGRESSION & CURVE FITTING ANALYZER
// ============================================================================
type RegModel = 'linear' | 'quadratic' | 'exponential';

export const RegressionCurveFittingAnalyzer: React.FC = () => {
  const [pairsRaw, setPairsRaw] = useState('1, 2.1\n2, 3.9\n3, 6.2\n4, 8.0\n5, 9.9\n6, 12.1');
  const [model, setModel] = useState<RegModel>('linear');
  const [predX, setPredX] = useState('7.5');

  const reg = useMemo(() => {
    const pts = pairsRaw
      .trim()
      .split(/\n+/)
      .map((line) => {
        const [xs, ys] = line.split(/[,\s\t]+/);
        return { x: Number(xs), y: Number(ys) };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

    if (pts.length < 3) {
      return { ok: false as const, error: 'Provide at least 3 (x, y) coordinate rows.' };
    }

    const n = pts.length;
    const meanY = pts.reduce((s, p) => s + p.y, 0) / n;

    let evalHat = (x: number) => x;
    let eqStr = '';

    if (model === 'linear') {
      const meanX = pts.reduce((s, p) => s + p.x, 0) / n;
      const sxx = pts.reduce((s, p) => s + (p.x - meanX) ** 2, 0);
      const sxy = pts.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
      const b1 = sxy / (sxx || 1);
      const b0 = meanY - b1 * meanX;
      evalHat = (x) => b0 + b1 * x;
      eqStr = `ŷ = ${fmtNum(b0, 4)} ${b1 >= 0 ? '+' : '−'} ${fmtNum(Math.abs(b1), 4)}x`;
    } else if (model === 'quadratic') {
      // Normal equations for b0 + b1*x + b2*x^2
      const s = (k: number) => pts.reduce((acc, p) => acc + p.x ** k, 0);
      const sy = (k: number) => pts.reduce((acc, p) => acc + p.y * p.x ** k, 0);
      const aug = [
        [n, s(1), s(2), sy(0)],
        [s(1), s(2), s(3), sy(1)],
        [s(2), s(3), s(4), sy(2)],
      ];
      const { rref } = computeRrefWithSteps(aug);
      const [b0, b1, b2] = [rref[0][3], rref[1][3], rref[2][3]];
      evalHat = (x) => b0 + b1 * x + b2 * x * x;
      eqStr = `ŷ = ${fmtNum(b2, 4)}x² + (${fmtNum(b1, 4)})x + (${fmtNum(b0, 4)})`;
    } else {
      // Exponential y = a * exp(b*x) -> ln(y) = ln(a) + b*x
      const posPts = pts.filter((p) => p.y > 0);
      const mx = posPts.reduce((s, p) => s + p.x, 0) / posPts.length;
      const mly = posPts.reduce((s, p) => s + Math.log(p.y), 0) / posPts.length;
      const sxx = posPts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
      const sxly = posPts.reduce((s, p) => s + (p.x - mx) * (Math.log(p.y) - mly), 0);
      const b = sxly / (sxx || 1);
      const a = Math.exp(mly - b * mx);
      evalHat = (x) => a * Math.exp(b * x);
      eqStr = `ŷ = ${fmtNum(a, 4)} · e^(${fmtNum(b, 4)}x)`;
    }

    const ssTot = pts.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
    const residuals = pts.map((p) => ({ x: p.x, y: p.y, yHat: evalHat(p.x), e: p.y - evalHat(p.x) }));
    const ssRes = residuals.reduce((s, r) => s + r.e * r.e, 0);
    const r2 = ssTot > 1e-12 ? Math.max(0, 1 - ssRes / ssTot) : 1;
    const rmse = Math.sqrt(ssRes / n);
    const x0 = Number(predX) || 0;
    const yPred = evalHat(x0);

    return { ok: true as const, pts, eqStr, r2, rmse, residuals, evalHat, x0, yPred };
  }, [pairsRaw, model, predX]);

  const W = 480;
  const H = 220;
  const pad = 32;

  const solutionText = reg.ok
    ? [
        `Least-Squares Regression (${model})`,
        `Fitted Equation: ${reg.eqStr}`,
        `Coefficient of Determination R² = ${fmtNum(reg.r2, 5)} · RMSE = ${fmtNum(reg.rmse, 4)}`,
        `Prediction at x₀ = ${reg.x0}: ŷ = ${fmtNum(reg.yPred, 4)}`,
      ].join('\n')
    : 'Invalid regression data';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Linear Calibration Curve',
            onSelect: () => {
              setModel('linear');
              setPairsRaw('1, 2.1\n2, 3.9\n3, 6.2\n4, 8.0\n5, 9.9\n6, 12.1');
            },
          },
          {
            label: 'Quadratic Projectile Trajectory',
            onSelect: () => {
              setModel('quadratic');
              setPairsRaw('0, 1.2\n1, 11.1\n2, 16.3\n3, 16.4\n4, 11.7\n5, 2.1');
            },
          },
          {
            label: 'Exponential Bacterial Growth',
            onSelect: () => {
              setModel('exponential');
              setPairsRaw('0, 2.0\n1, 3.3\n2, 5.4\n3, 9.0\n4, 14.8\n5, 24.5');
            },
          },
        ]}
        onReset={() => {
          setModel('linear');
          setPairsRaw('1, 2.1\n2, 3.9\n3, 6.2\n4, 8.0\n5, 9.9\n6, 12.1');
        }}
        solutionText={solutionText}
        modeLabel={reg.ok ? `R² = ${fmtNum(reg.r2, 4)}` : ''}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            {(['linear', 'quadratic', 'exponential'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize ${
                  model === m ? 'bg-[#F97316] text-white' : 'text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              (x, y) Data Pairs — One Pair Per Line
            </label>
            <textarea
              rows={5}
              value={pairsRaw}
              onChange={(e) => setPairsRaw(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-xs bg-[#F9FAFB] border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Predict ŷ at x₀ =</label>
            <input
              type="number"
              step="any"
              value={predX}
              onChange={(e) => setPredX(e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-[#F9FAFB] border border-gray-300 rounded-lg"
            />
          </div>

          {reg.ok && (
            <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono tabular-nums">
              <span className="font-sans font-semibold text-[#EA580C] block">Best-Fit Model</span>
              <div className="text-sm font-bold text-gray-900">{reg.eqStr}</div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-200/70">
                <div>
                  <span className="font-sans text-gray-500 block">R²</span>
                  <span className="font-bold text-gray-900">{fmtNum(reg.r2, 5)}</span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">RMSE</span>
                  <span className="font-bold text-gray-900">{fmtNum(reg.rmse, 4)}</span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">ŷ({reg.x0})</span>
                  <span className="font-bold text-[#EA580C]">{fmtNum(reg.yPred, 4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {reg.ok && (
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
              <span className="text-xs font-semibold text-gray-700 mb-2">
                Scatter Plot & Least-Squares Fitted Curve
              </span>
              {(() => {
                const xs = reg.pts.map((p) => p.x);
                const ys = reg.pts.map((p) => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const curve = Array.from({ length: 81 }, (_, i) => {
                  const x = minX + ((maxX - minX) * i) / 80;
                  return { x, y: reg.evalHat(x) };
                });
                const allY = ys.concat(curve.map((c) => c.y));
                const minY = Math.min(...allY);
                const maxY = Math.max(...allY);
                const sx = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (W - 2 * pad);
                const sy = (v: number) => H - pad - ((v - minY) / (maxY - minY || 1)) * (H - 2 * pad);
                const pathD = curve
                  .map((c, i) => `${i === 0 ? 'M' : 'L'}${sx(c.x).toFixed(1)},${sy(c.y).toFixed(1)}`)
                  .join(' ');
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
                    <path d={pathD} fill="none" stroke="#F97316" strokeWidth={2.4} />
                    {reg.pts.map((p, i) => (
                      <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="#111827" />
                    ))}
                  </svg>
                );
              })()}
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono text-gray-600 tabular-nums">
                {reg.residuals.slice(0, 5).map((r, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white rounded border border-gray-200">
                    e_{idx + 1}={fmtNum(r.e, 3)}
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

// ============================================================================
// TOOL 23: COMBINATORICS, PERMUTATIONS & PASCAL'S TRIANGLE CALCULATOR
// ============================================================================
export const CombinatoricsPermutationsCalculator: React.FC = () => {
  const [nVal, setNVal] = useState('7');
  const [rVal, setRVal] = useState('3');

  const comb = useMemo(() => {
    const n = Math.max(0, Math.min(20, Math.round(Number(nVal) || 0)));
    const r = Math.max(0, Math.min(n, Math.round(Number(rVal) || 0)));

    const nFact = factorialNum(n);
    const npr = nPrNum(n, r);
    const ncr = nCrNum(n, r);
    const permRep = Math.pow(n, r);
    const starsBars = n > 0 ? nCrNum(n + r - 1, r) : 0;

    const binomialTerms = Array.from({ length: Math.min(n, 9) + 1 }, (_, k) => {
      const c = nCrNum(Math.min(n, 9), k);
      const pA = Math.min(n, 9) - k;
      return `${c > 1 ? c : ''}${pA > 0 ? `a${pA > 1 ? `^${pA}` : ''}` : ''}${k > 0 ? `b${k > 1 ? `^${k}` : ''}` : ''}` || '1';
    }).join(' + ');

    const pascalRows = Array.from({ length: Math.min(8, Math.max(5, n + 1)) }, (_, row) =>
      Array.from({ length: row + 1 }, (__, col) => nCrNum(row, col))
    );

    return { n, r, nFact, npr, ncr, permRep, starsBars, binomialTerms, pascalRows };
  }, [nVal, rVal]);

  const solutionText = [
    `Combinatorics for n = ${comb.n}, r = ${comb.r}`,
    `n! = ${comb.nFact}`,
    `Permutations P(${comb.n}, ${comb.r}) = ${comb.npr}`,
    `Combinations C(${comb.n}, ${comb.r}) = ${comb.ncr}`,
    `Permutations with Repetition n^r = ${comb.permRep} · Stars & Bars C(n+r−1, r) = ${comb.starsBars}`,
    `Binomial Expansion: ${comb.binomialTerms}`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          { label: 'Committee C(7, 3) = 35', onSelect: () => { setNVal('7'); setRVal('3'); } },
          { label: 'Podium P(10, 3) = 720', onSelect: () => { setNVal('10'); setRVal('3'); } },
          { label: 'Binomial Row n = 6, r = 2', onSelect: () => { setNVal('6'); setRVal('2'); } },
        ]}
        onReset={() => {
          setNVal('7');
          setRVal('3');
        }}
        solutionText={solutionText}
        modeLabel={`n = ${comb.n}, r = ${comb.r}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Items n (0..20)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={nVal}
                onChange={(e) => setNVal(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Selected r (0..n)</label>
              <input
                type="number"
                min={0}
                max={comb.n}
                value={rVal}
                onChange={(e) => setRVal(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div>
              <span className="font-sans font-semibold text-[#EA580C] block">Combinations C(n, r)</span>
              <span className="text-2xl font-bold text-gray-900">{comb.ncr.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-sans font-semibold text-[#EA580C] block">Permutations P(n, r)</span>
              <span className="text-2xl font-bold text-gray-900">{comb.npr.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-orange-200/70">
              <span className="font-sans text-gray-500 block">With Repetition (n^r)</span>
              <span className="font-bold text-gray-900">{comb.permRep.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-orange-200/70">
              <span className="font-sans text-gray-500 block">Stars & Bars C(n+r−1, r)</span>
              <span className="font-bold text-gray-900">{comb.starsBars.toLocaleString()}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-orange-200/70">
              <span className="font-sans text-gray-500 block">Binomial Expansion (a + b)^{Math.min(comb.n, 9)}</span>
              <span className="text-gray-900 break-all">{comb.binomialTerms}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-700 mb-3">
              Interactive Pascal&apos;s Triangle (Highlighted Entry: Row {comb.n}, Col {comb.r})
            </span>
            <div className="space-y-2 py-2 overflow-x-auto">
              {comb.pascalRows.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center justify-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-400 w-8 text-right mr-2">n={rIdx}</span>
                  {row.map((val, cIdx) => {
                    const active = rIdx === comb.n && cIdx === comb.r;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          setNVal(String(rIdx));
                          setRVal(String(cIdx));
                        }}
                        className={`min-w-[34px] px-2 py-1 text-xs font-mono tabular-nums rounded-lg border transition-colors ${
                          active
                            ? 'bg-[#F97316] text-white border-[#F97316] font-bold'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click any binomial coefficient cell in Pascal&apos;s Triangle to inspect its exact n and r values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
