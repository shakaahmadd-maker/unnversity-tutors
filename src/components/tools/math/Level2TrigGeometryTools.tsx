import React, { useMemo, useState } from 'react';
import {
  ComplexNum,
  complexNthRoots,
  complexPolar,
  complexPow,
  formatComplex,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 6: INTERACTIVE UNIT CIRCLE & TRIGONOMETRY EXPLORER
// ============================================================================
const SPECIAL_ANGLES: Array<{ deg: number; radLabel: string; exactCos: string; exactSin: string }> = [
  { deg: 0, radLabel: '0', exactCos: '1', exactSin: '0' },
  { deg: 30, radLabel: 'π/6', exactCos: '√3/2', exactSin: '1/2' },
  { deg: 45, radLabel: 'π/4', exactCos: '√2/2', exactSin: '√2/2' },
  { deg: 60, radLabel: 'π/3', exactCos: '1/2', exactSin: '√3/2' },
  { deg: 90, radLabel: 'π/2', exactCos: '0', exactSin: '1' },
  { deg: 120, radLabel: '2π/3', exactCos: '−1/2', exactSin: '√3/2' },
  { deg: 135, radLabel: '3π/4', exactCos: '−√2/2', exactSin: '√2/2' },
  { deg: 150, radLabel: '5π/6', exactCos: '−√3/2', exactSin: '1/2' },
  { deg: 180, radLabel: 'π', exactCos: '−1', exactSin: '0' },
  { deg: 210, radLabel: '7π/6', exactCos: '−√3/2', exactSin: '−1/2' },
  { deg: 225, radLabel: '5π/4', exactCos: '−√2/2', exactSin: '−√2/2' },
  { deg: 240, radLabel: '4π/3', exactCos: '−1/2', exactSin: '−√3/2' },
  { deg: 270, radLabel: '3π/2', exactCos: '0', exactSin: '−1' },
  { deg: 300, radLabel: '5π/3', exactCos: '1/2', exactSin: '−√3/2' },
  { deg: 315, radLabel: '7π/4', exactCos: '√2/2', exactSin: '−√2/2' },
  { deg: 330, radLabel: '11π/6', exactCos: '√3/2', exactSin: '−1/2' },
];

export const InteractiveUnitCircleExplorer: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState(120);

  const trig = useMemo(() => {
    const normDeg = ((angleDeg % 360) + 360) % 360;
    const rad = (normDeg * Math.PI) / 180;
    const cosV = Math.cos(rad);
    const sinV = Math.sin(rad);
    const tanV = Math.abs(cosV) < 1e-10 ? NaN : sinV / cosV;
    const secV = Math.abs(cosV) < 1e-10 ? NaN : 1 / cosV;
    const cscV = Math.abs(sinV) < 1e-10 ? NaN : 1 / sinV;
    const cotV = Math.abs(sinV) < 1e-10 ? NaN : cosV / sinV;

    const quadrant =
      normDeg === 0 || normDeg === 90 || normDeg === 180 || normDeg === 270
        ? 'Quadrantal Axis'
        : normDeg < 90
        ? 'Quadrant I (+, +)'
        : normDeg < 180
        ? 'Quadrant II (−, +)'
        : normDeg < 270
        ? 'Quadrant III (−, −)'
        : 'Quadrant IV (+, −)';

    const refAngle =
      normDeg <= 90
        ? normDeg
        : normDeg <= 180
        ? 180 - normDeg
        : normDeg <= 270
        ? normDeg - 180
        : 360 - normDeg;

    const special = SPECIAL_ANGLES.find((s) => Math.abs(s.deg - normDeg) < 0.01);
    return { normDeg, rad, cosV, sinV, tanV, secV, cscV, cotV, quadrant, refAngle, special };
  }, [angleDeg]);

  const handleCircleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300 - 150;
    const y = 150 - ((e.clientY - rect.top) / rect.height) * 300;
    const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    // Snap to nearest special angle if within 3.5 deg
    const near = SPECIAL_ANGLES.find((s) => Math.abs(s.deg - deg) < 3.5);
    setAngleDeg(near ? near.deg : Math.round(deg));
  };

  const cx = 150;
  const cy = 150;
  const R = 108;
  const px = cx + R * trig.cosV;
  const py = cy - R * trig.sinV;

  // Sine / Cosine wave paths over [0, 360]
  const waveW = 340;
  const waveH = 130;
  const sinPath = Array.from({ length: 91 }, (_, i) => {
    const d = i * 4;
    const x = 24 + (d / 360) * (waveW - 40);
    const y = waveH / 2 - Math.sin((d * Math.PI) / 180) * 44;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const cosPath = Array.from({ length: 91 }, (_, i) => {
    const d = i * 4;
    const x = 24 + (d / 360) * (waveW - 40);
    const y = waveH / 2 - Math.cos((d * Math.PI) / 180) * 44;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const markerX = 24 + (trig.normDeg / 360) * (waveW - 40);

  const solutionText = [
    `Unit Circle Analysis at θ = ${trig.normDeg}° (${trig.special ? trig.special.radLabel : fmtNum(trig.rad, 4)} rad)`,
    `Location: ${trig.quadrant} · Reference Angle α = ${fmtNum(trig.refAngle, 2)}°`,
    `cos(θ) = ${trig.special ? `${trig.special.exactCos} ≈ ` : ''}${fmtNum(trig.cosV, 5)}`,
    `sin(θ) = ${trig.special ? `${trig.special.exactSin} ≈ ` : ''}${fmtNum(trig.sinV, 5)}`,
    `tan(θ) = ${fmtNum(trig.tanV, 5)} · sec(θ) = ${fmtNum(trig.secV, 5)} · csc(θ) = ${fmtNum(trig.cscV, 5)} · cot(θ) = ${fmtNum(trig.cotV, 5)}`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          { label: 'θ = 30° (π/6)', onSelect: () => setAngleDeg(30) },
          { label: 'θ = 45° (π/4)', onSelect: () => setAngleDeg(45) },
          { label: 'θ = 120° (2π/3)', onSelect: () => setAngleDeg(120) },
          { label: 'θ = 225° (5π/4)', onSelect: () => setAngleDeg(225) },
          { label: 'θ = 330° (11π/6)', onSelect: () => setAngleDeg(330) },
        ]}
        onReset={() => setAngleDeg(120)}
        solutionText={solutionText}
        modeLabel={`θ = ${trig.normDeg}°`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 flex flex-col items-center">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Click anywhere on the Unit Circle or drag the angle slider below
            </p>
            <svg
              viewBox="0 0 300 300"
              onClick={handleCircleClick}
              className="w-full max-w-[300px] h-auto cursor-crosshair bg-white rounded-xl border border-gray-200"
            >
              <line x1={18} y1={cy} x2={282} y2={cy} stroke="#D1D5DB" strokeWidth={1.2} />
              <line x1={cx} y1={18} x2={cx} y2={282} stroke="#D1D5DB" strokeWidth={1.2} />
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="#111827" strokeWidth={1.6} />

              {SPECIAL_ANGLES.map((s) => {
                const rRad = (s.deg * Math.PI) / 180;
                return (
                  <circle
                    key={s.deg}
                    cx={cx + R * Math.cos(rRad)}
                    cy={cy - R * Math.sin(rRad)}
                    r={2.5}
                    fill="#9CA3AF"
                  />
                );
              })}

              {/* Reference triangle projections */}
              <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#0284C7" strokeWidth={2.5} />
              <line x1={px} y1={cy} x2={px} y2={py} stroke="#059669" strokeWidth={2.5} />
              <line x1={cx} y1={cy} x2={px} y2={py} stroke="#F97316" strokeWidth={2.8} />
              <circle cx={px} cy={py} r={6} fill="#F97316" stroke="#FFFFFF" strokeWidth={2} />

              <text x={268} y={cy - 6} className="text-[10px] font-mono fill-gray-500">
                x
              </text>
              <text x={cx + 6} y={28} className="text-[10px] font-mono fill-gray-500">
                y
              </text>
              <text
                x={Math.min(245, Math.max(20, px + (trig.cosV >= 0 ? 8 : -54)))}
                y={Math.min(285, Math.max(18, py + (trig.sinV >= 0 ? -8 : 14)))}
                className="text-[10px] font-mono font-bold fill-[#111827]"
              >
                ({fmtNum(trig.cosV, 2)}, {fmtNum(trig.sinV, 2)})
              </text>
            </svg>

            <div className="w-full mt-4">
              <div className="flex justify-between text-xs font-mono mb-1 tabular-nums">
                <span className="font-sans font-semibold text-gray-700">Angle θ (Degrees): {trig.normDeg}°</span>
                <span className="text-[#EA580C] font-semibold">
                  {trig.special ? `${trig.special.radLabel} rad` : `${fmtNum(trig.rad, 4)} rad`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={trig.normDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="w-full accent-[#F97316]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-[#EA580C]">{trig.quadrant}</span>
              <span className="text-xs font-mono text-gray-700 tabular-nums">
                Reference Angle α = {fmtNum(trig.refAngle, 1)}°
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono tabular-nums">
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="text-sky-700 font-semibold block">cos(θ) [x]</span>
                <span className="text-base font-bold text-gray-900">
                  {trig.special ? trig.special.exactCos : fmtNum(trig.cosV, 4)}
                </span>
                {trig.special && <span className="block text-gray-400">≈ {fmtNum(trig.cosV, 4)}</span>}
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="text-emerald-700 font-semibold block">sin(θ) [y]</span>
                <span className="text-base font-bold text-gray-900">
                  {trig.special ? trig.special.exactSin : fmtNum(trig.sinV, 4)}
                </span>
                {trig.special && <span className="block text-gray-400">≈ {fmtNum(trig.sinV, 4)}</span>}
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200/80">
                <span className="text-[#EA580C] font-semibold block">tan(θ) [y/x]</span>
                <span className="text-base font-bold text-gray-900">{fmtNum(trig.tanV, 4)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-gray-500 block">sec(θ) [1/x]</span>
                <span className="font-semibold text-gray-900">{fmtNum(trig.secV, 4)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-gray-500 block">csc(θ) [1/y]</span>
                <span className="font-semibold text-gray-900">{fmtNum(trig.cscV, 4)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-gray-500 block">cot(θ) [x/y]</span>
                <span className="font-semibold text-gray-900">{fmtNum(trig.cotV, 4)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-700">Synced Sine & Cosine Waveforms [0°, 360°]</span>
              <span className="font-mono text-gray-500">Green: sin(θ) · Blue: cos(θ)</span>
            </div>
            <svg viewBox={`0 0 ${waveW} ${waveH}`} className="w-full h-auto bg-white rounded-lg border border-gray-200">
              <line x1={24} y1={waveH / 2} x2={waveW - 16} y2={waveH / 2} stroke="#D1D5DB" />
              <path d={cosPath} fill="none" stroke="#0284C7" strokeWidth={2} />
              <path d={sinPath} fill="none" stroke="#059669" strokeWidth={2} />
              <line x1={markerX} y1={12} x2={markerX} y2={waveH - 12} stroke="#F97316" strokeDasharray="3 3" />
              <circle cx={markerX} cy={waveH / 2 - trig.sinV * 44} r={4} fill="#059669" />
              <circle cx={markerX} cy={waveH / 2 - trig.cosV * 44} r={4} fill="#0284C7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 7: TRIANGLE, LAW OF SINES & LAW OF COSINES SOLVER
// ============================================================================
type TriMode = 'SAS' | 'SSS' | 'ASA' | 'AAS';

export const TriangleLawSinesCosinesSolver: React.FC = () => {
  const [mode, setMode] = useState<TriMode>('SAS');
  // SAS: b, c, A(deg) | SSS: a, b, c | ASA: A, c, B | AAS: A, B, a
  const [v1, setV1] = useState('8');
  const [v2, setV2] = useState('11');
  const [v3, setV3] = useState('37');

  const tri = useMemo(() => {
    const deg = (r: number) => (r * 180) / Math.PI;
    const rad = (d: number) => (d * Math.PI) / 180;
    let a = 0;
    let b = 0;
    let c = 0;
    let A = 0;
    let B = 0;
    let C = 0;
    const steps: string[] = [];

    const p1 = Number(v1);
    const p2 = Number(v2);
    const p3 = Number(v3);

    if (p1 <= 0 || p2 <= 0 || p3 <= 0) {
      return { valid: false as const, error: 'All side lengths and angles must be strictly positive.' };
    }

    if (mode === 'SAS') {
      b = p1;
      c = p2;
      A = p3;
      if (A >= 180) return { valid: false as const, error: 'Included angle A must be less than 180°.' };
      a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(rad(A)));
      steps.push(`Law of Cosines: a = √(b² + c² − 2bc·cos A) = √(${b}² + ${c}² − 2(${b})(${c})cos ${A}°) = ${fmtNum(a, 4)}`);
      const cosB = (a * a + c * c - b * b) / (2 * a * c);
      B = deg(Math.acos(Math.max(-1, Math.min(1, cosB))));
      C = 180 - A - B;
      steps.push(`Inverse Law of Cosines: B = arccos((a² + c² − b²)/(2ac)) = ${fmtNum(B, 3)}°`);
      steps.push(`Angle Sum Property: C = 180° − A − B = ${fmtNum(C, 3)}°`);
    } else if (mode === 'SSS') {
      a = p1;
      b = p2;
      c = p3;
      if (a + b <= c || a + c <= b || b + c <= a) {
        return {
          valid: false as const,
          error: 'Triangle Inequality violated: sum of any two sides must exceed the third side.',
        };
      }
      A = deg(Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))));
      B = deg(Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))));
      C = 180 - A - B;
      steps.push(`Law of Cosines for A: arccos((b² + c² − a²)/(2bc)) = ${fmtNum(A, 3)}°`);
      steps.push(`Law of Cosines for B: arccos((a² + c² − b²)/(2ac)) = ${fmtNum(B, 3)}°`);
      steps.push(`Angle C = 180° − A − B = ${fmtNum(C, 3)}°`);
    } else if (mode === 'ASA') {
      A = p1;
      c = p2;
      B = p3;
      if (A + B >= 180) return { valid: false as const, error: 'Sum of given angles A + B must be < 180°.' };
      C = 180 - A - B;
      a = (c * Math.sin(rad(A))) / Math.sin(rad(C));
      b = (c * Math.sin(rad(B))) / Math.sin(rad(C));
      steps.push(`Angle Sum: C = 180° − ${A}° − ${B}° = ${fmtNum(C, 3)}°`);
      steps.push(`Law of Sines: a = c·sin(A)/sin(C) = ${fmtNum(a, 4)}, b = c·sin(B)/sin(C) = ${fmtNum(b, 4)}`);
    } else {
      A = p1;
      B = p2;
      a = p3;
      if (A + B >= 180) return { valid: false as const, error: 'Sum of given angles A + B must be < 180°.' };
      C = 180 - A - B;
      b = (a * Math.sin(rad(B))) / Math.sin(rad(A));
      c = (a * Math.sin(rad(C))) / Math.sin(rad(A));
      steps.push(`Angle Sum: C = 180° − ${A}° − ${B}° = ${fmtNum(C, 3)}°`);
      steps.push(`Law of Sines: b = a·sin(B)/sin(A) = ${fmtNum(b, 4)}, c = a·sin(C)/sin(A) = ${fmtNum(c, 4)}`);
    }

    const perim = a + b + c;
    const s = perim / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    const inradius = area / s;
    const circumradius = a / (2 * Math.sin(rad(A)));

    // Coordinates for SVG: A at (0,0), B at (c, 0), C at (b*cos A, b*sin A)
    const ptA = { x: 0, y: 0 };
    const ptB = { x: c, y: 0 };
    const ptC = { x: b * Math.cos(rad(A)), y: b * Math.sin(rad(A)) };

    return {
      valid: true as const,
      a,
      b,
      c,
      A,
      B,
      C,
      perim,
      s,
      area,
      inradius,
      circumradius,
      steps,
      ptA,
      ptB,
      ptC,
    };
  }, [mode, v1, v2, v3]);

  const labels: Record<TriMode, [string, string, string]> = {
    SAS: ['Side b', 'Side c', 'Included Angle A (°)'],
    SSS: ['Side a', 'Side b', 'Side c'],
    ASA: ['Angle A (°)', 'Included Side c', 'Angle B (°)'],
    AAS: ['Angle A (°)', 'Angle B (°)', 'Side a (opposite A)'],
  };

  const renderSvg = () => {
    if (!tri.valid) return null;
    const xs = [tri.ptA.x, tri.ptB.x, tri.ptC.x];
    const ys = [tri.ptA.y, tri.ptB.y, tri.ptC.y];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys, 0.1);
    const W = 440;
    const H = 250;
    const pad = 42;
    const scale = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / maxY);
    const offX = (W - (maxX - minX) * scale) / 2 - minX * scale;
    const offY = H - pad;

    const mapPt = (p: { x: number; y: number }) => ({
      x: offX + p.x * scale,
      y: offY - p.y * scale,
    });
    const A2 = mapPt(tri.ptA);
    const B2 = mapPt(tri.ptB);
    const C2 = mapPt(tri.ptC);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white rounded-xl border border-gray-200">
        <polygon
          points={`${A2.x},${A2.y} ${B2.x},${B2.y} ${C2.x},${C2.y}`}
          fill="#FFF7ED"
          stroke="#F97316"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {[
          { p: A2, lbl: `A (${fmtNum(tri.A, 1)}°)`, dy: 16 },
          { p: B2, lbl: `B (${fmtNum(tri.B, 1)}°)`, dy: 16 },
          { p: C2, lbl: `C (${fmtNum(tri.C, 1)}°)`, dy: -10 },
        ].map((item, idx) => (
          <g key={idx}>
            <circle cx={item.p.x} cy={item.p.y} r={4.5} fill="#111827" />
            <text
              x={item.p.x}
              y={item.p.y + item.dy}
              textAnchor="middle"
              className="text-[11px] font-mono font-semibold fill-gray-900"
            >
              {item.lbl}
            </text>
          </g>
        ))}
        <text
          x={(A2.x + B2.x) / 2}
          y={(A2.y + B2.y) / 2 + 15}
          textAnchor="middle"
          className="text-[11px] font-mono fill-[#EA580C]"
        >
          c = {fmtNum(tri.c, 2)}
        </text>
        <text
          x={(B2.x + C2.x) / 2 + 14}
          y={(B2.y + C2.y) / 2}
          className="text-[11px] font-mono fill-[#EA580C]"
        >
          a = {fmtNum(tri.a, 2)}
        </text>
        <text
          x={(A2.x + C2.x) / 2 - 14}
          y={(A2.y + C2.y) / 2}
          textAnchor="end"
          className="text-[11px] font-mono fill-[#EA580C]"
        >
          b = {fmtNum(tri.b, 2)}
        </text>
      </svg>
    );
  };

  const solutionText = tri.valid
    ? [
        `Triangle Solver (${mode})`,
        `Sides: a = ${fmtNum(tri.a, 4)}, b = ${fmtNum(tri.b, 4)}, c = ${fmtNum(tri.c, 4)}`,
        `Angles: A = ${fmtNum(tri.A, 3)}°, B = ${fmtNum(tri.B, 3)}°, C = ${fmtNum(tri.C, 3)}°`,
        `Area = ${fmtNum(tri.area, 4)} · Perimeter = ${fmtNum(tri.perim, 4)} · r = ${fmtNum(tri.inradius, 4)} · R = ${fmtNum(tri.circumradius, 4)}`,
        ...tri.steps,
      ].join('\n')
    : 'Invalid triangle configuration';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'SAS (b=8, c=11, A=37°)',
            onSelect: () => {
              setMode('SAS');
              setV1('8');
              setV2('11');
              setV3('37');
            },
          },
          {
            label: '3-4-5 Right Triangle (SSS)',
            onSelect: () => {
              setMode('SSS');
              setV1('3');
              setV2('4');
              setV3('5');
            },
          },
          {
            label: 'ASA Surveying Baseline',
            onSelect: () => {
              setMode('ASA');
              setV1('42');
              setV2('100');
              setV3('68');
            },
          },
        ]}
        onReset={() => {
          setMode('SAS');
          setV1('8');
          setV2('11');
          setV3('37');
        }}
        solutionText={solutionText}
        modeLabel={`Congruence Mode: ${mode}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            {(['SAS', 'SSS', 'ASA', 'AAS'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
                  mode === m ? 'bg-[#F97316] text-white' : 'text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-3 gap-3">
            {[
              { lbl: labels[mode][0], val: v1, set: setV1 },
              { lbl: labels[mode][1], val: v2, set: setV2 },
              { lbl: labels[mode][2], val: v3, set: setV3 },
            ].map((inp, i) => (
              <div key={i}>
                <label className="block text-xs text-gray-600 mb-1 truncate">{inp.lbl}</label>
                <input
                  type="number"
                  step="any"
                  value={inp.val}
                  onChange={(e) => inp.set(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>

          {tri.valid ? (
            <>
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                <div>
                  <span className="font-sans text-gray-500 block">Sides (a, b, c)</span>
                  <span className="font-bold text-gray-900">
                    {fmtNum(tri.a, 3)}, {fmtNum(tri.b, 3)}, {fmtNum(tri.c, 3)}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Angles (A, B, C)</span>
                  <span className="font-bold text-gray-900">
                    {fmtNum(tri.A, 2)}°, {fmtNum(tri.B, 2)}°, {fmtNum(tri.C, 2)}°
                  </span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Heron Area & Perimeter</span>
                  <span className="font-bold text-[#EA580C]">
                    Area = {fmtNum(tri.area, 3)} · P = {fmtNum(tri.perim, 3)}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-gray-500 block">Inradius r & Circumradius R</span>
                  <span className="font-bold text-gray-900">
                    r = {fmtNum(tri.inradius, 3)} · R = {fmtNum(tri.circumradius, 3)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-1.5">
                {tri.steps.map((s, idx) => (
                  <div key={idx} className="text-xs font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-[#F97316] font-bold mr-1.5">{idx + 1}.</span>
                    {s}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {tri.error}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 h-full flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-700 mb-2">
              Scale-Accurate Euclidean Triangle Diagram
            </span>
            {renderSvg()}
            <p className="text-xs text-gray-500 mt-2">
              Vertices and opposite side lengths scale automatically to preserve true interior angle geometry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 8: CONIC SECTIONS EQUATION & GRAPH VISUALIZER
// ============================================================================
type ConicType = 'ellipse' | 'hyperbola' | 'parabola' | 'circle';

export const ConicSectionsVisualizer: React.FC = () => {
  const [conic, setConic] = useState<ConicType>('ellipse');
  const [hVal, setHVal] = useState('0');
  const [kVal, setKVal] = useState('0');
  const [aVal, setAVal] = useState('5');
  const [bVal, setBVal] = useState('3');
  const [pVal, setPVal] = useState('2');

  const geom = useMemo(() => {
    const h = Number(hVal) || 0;
    const k = Number(kVal) || 0;
    const a = Math.max(0.5, Math.abs(Number(aVal) || 4));
    const b = Math.max(0.5, Math.abs(Number(bVal) || 3));
    const p = Math.abs(Number(pVal) || 2) < 0.2 ? 1 : Number(pVal);

    if (conic === 'circle') {
      return {
        eq: `(x − ${h})² + (y − ${k})² = ${fmtNum(a * a, 3)}`,
        ecc: 0,
        foci: `(${fmtNum(h, 2)}, ${fmtNum(k, 2)}) [Single Center]`,
        vertices: `(${fmtNum(h - a, 2)}, ${fmtNum(k, 2)}) & (${fmtNum(h + a, 2)}, ${fmtNum(k, 2)})`,
        extra: `Radius r = ${fmtNum(a, 3)} · Area = ${fmtNum(Math.PI * a * a, 3)}`,
        h,
        k,
        a,
        b: a,
        c: 0,
        p,
      };
    }

    if (conic === 'ellipse') {
      const majorX = a >= b;
      const semiMaj = Math.max(a, b);
      const semiMin = Math.min(a, b);
      const c = Math.sqrt(Math.max(0, semiMaj * semiMaj - semiMin * semiMin));
      const ecc = c / semiMaj;
      return {
        eq: `(x − ${h})²/${fmtNum(a * a, 2)} + (y − ${k})²/${fmtNum(b * b, 2)} = 1`,
        ecc,
        foci: majorX
          ? `(${fmtNum(h - c, 2)}, ${fmtNum(k, 2)}) & (${fmtNum(h + c, 2)}, ${fmtNum(k, 2)})`
          : `(${fmtNum(h, 2)}, ${fmtNum(k - c, 2)}) & (${fmtNum(h, 2)}, ${fmtNum(k + c, 2)})`,
        vertices: majorX
          ? `(${fmtNum(h - a, 2)}, ${fmtNum(k, 2)}) & (${fmtNum(h + a, 2)}, ${fmtNum(k, 2)})`
          : `(${fmtNum(h, 2)}, ${fmtNum(k - b, 2)}) & (${fmtNum(h, 2)}, ${fmtNum(k + b, 2)})`,
        extra: `Focal distance c = √(|a² − b²|) = ${fmtNum(c, 3)} · Area = πab = ${fmtNum(Math.PI * a * b, 3)}`,
        h,
        k,
        a,
        b,
        c,
        p,
      };
    }

    if (conic === 'hyperbola') {
      const c = Math.sqrt(a * a + b * b);
      const ecc = c / a;
      return {
        eq: `(x − ${h})²/${fmtNum(a * a, 2)} − (y − ${k})²/${fmtNum(b * b, 2)} = 1`,
        ecc,
        foci: `(${fmtNum(h - c, 2)}, ${fmtNum(k, 2)}) & (${fmtNum(h + c, 2)}, ${fmtNum(k, 2)})`,
        vertices: `(${fmtNum(h - a, 2)}, ${fmtNum(k, 2)}) & (${fmtNum(h + a, 2)}, ${fmtNum(k, 2)})`,
        extra: `Asymptotes: y − ${k} = ±(${fmtNum(b / a, 3)})(x − ${h})`,
        h,
        k,
        a,
        b,
        c,
        p,
      };
    }

    return {
      eq: `(x − ${h})² = ${fmtNum(4 * p, 2)}(y − ${k})`,
      ecc: 1,
      foci: `Focus F = (${fmtNum(h, 2)}, ${fmtNum(k + p, 2)})`,
      vertices: `Vertex V = (${fmtNum(h, 2)}, ${fmtNum(k, 2)})`,
      extra: `Directrix Line: y = ${fmtNum(k - p, 3)} · Latus Rectum = ${fmtNum(Math.abs(4 * p), 2)}`,
      h,
      k,
      a,
      b,
      c: Math.abs(p),
      p,
    };
  }, [conic, hVal, kVal, aVal, bVal, pVal]);

  const bound = Math.max(10, Math.abs(geom.h) + Math.abs(geom.k) + Math.max(geom.a, geom.b, geom.c) * 1.8);
  const S = 320;
  const mapX = (x: number) => S / 2 + (x / bound) * (S / 2 - 20);
  const mapY = (y: number) => S / 2 - (y / bound) * (S / 2 - 20);

  const renderCurve = () => {
    if (conic === 'circle' || conic === 'ellipse') {
      const pts = Array.from({ length: 100 }, (_, i) => {
        const t = (i / 99) * Math.PI * 2;
        return `${i === 0 ? 'M' : 'L'}${mapX(geom.h + geom.a * Math.cos(t)).toFixed(1)},${mapY(
          geom.k + geom.b * Math.sin(t)
        ).toFixed(1)}`;
      }).join(' ');
      return (
        <>
          <path d={`${pts} Z`} fill="#FFF7ED" fillOpacity={0.6} stroke="#F97316" strokeWidth={2.5} />
          {conic === 'ellipse' && (
            <>
              <circle
                cx={mapX(geom.a >= geom.b ? geom.h - geom.c : geom.h)}
                cy={mapY(geom.a >= geom.b ? geom.k : geom.k - geom.c)}
                r={4.5}
                fill="#111827"
              />
              <circle
                cx={mapX(geom.a >= geom.b ? geom.h + geom.c : geom.h)}
                cy={mapY(geom.a >= geom.b ? geom.k : geom.k + geom.c)}
                r={4.5}
                fill="#111827"
              />
            </>
          )}
        </>
      );
    }

    if (conic === 'hyperbola') {
      const rightBranch = Array.from({ length: 61 }, (_, i) => {
        const t = -1.7 + (3.4 * i) / 60;
        const x = geom.h + geom.a * Math.cosh(t);
        const y = geom.k + geom.b * Math.sinh(t);
        return `${i === 0 ? 'M' : 'L'}${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`;
      }).join(' ');
      const leftBranch = Array.from({ length: 61 }, (_, i) => {
        const t = -1.7 + (3.4 * i) / 60;
        const x = geom.h - geom.a * Math.cosh(t);
        const y = geom.k + geom.b * Math.sinh(t);
        return `${i === 0 ? 'M' : 'L'}${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`;
      }).join(' ');
      return (
        <>
          <line
            x1={mapX(geom.h - bound)}
            y1={mapY(geom.k - (geom.b / geom.a) * bound)}
            x2={mapX(geom.h + bound)}
            y2={mapY(geom.k + (geom.b / geom.a) * bound)}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
          />
          <line
            x1={mapX(geom.h - bound)}
            y1={mapY(geom.k + (geom.b / geom.a) * bound)}
            x2={mapX(geom.h + bound)}
            y2={mapY(geom.k - (geom.b / geom.a) * bound)}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
          />
          <path d={rightBranch} fill="none" stroke="#F97316" strokeWidth={2.5} />
          <path d={leftBranch} fill="none" stroke="#F97316" strokeWidth={2.5} />
          <circle cx={mapX(geom.h - geom.c)} cy={mapY(geom.k)} r={4.5} fill="#111827" />
          <circle cx={mapX(geom.h + geom.c)} cy={mapY(geom.k)} r={4.5} fill="#111827" />
        </>
      );
    }

    // Parabola (x - h)^2 = 4p(y - k)
    const parPath = Array.from({ length: 81 }, (_, i) => {
      const dx = -bound * 0.75 + (bound * 1.5 * i) / 80;
      const x = geom.h + dx;
      const y = geom.k + (dx * dx) / (4 * geom.p);
      return `${i === 0 ? 'M' : 'L'}${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`;
    }).join(' ');
    return (
      <>
        <line
          x1={20}
          y1={mapY(geom.k - geom.p)}
          x2={S - 20}
          y2={mapY(geom.k - geom.p)}
          stroke="#0284C7"
          strokeDasharray="4 4"
        />
        <path d={parPath} fill="none" stroke="#F97316" strokeWidth={2.5} />
        <circle cx={mapX(geom.h)} cy={mapY(geom.k + geom.p)} r={4.5} fill="#111827" />
      </>
    );
  };

  const solutionText = [
    `Conic Section: ${conic.toUpperCase()}`,
    `Standard Equation: ${geom.eq}`,
    `Eccentricity e = ${fmtNum(geom.ecc, 4)}`,
    `Foci: ${geom.foci}`,
    `Vertices: ${geom.vertices}`,
    geom.extra,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Ellipse (a=5, b=3, c=4)',
            onSelect: () => {
              setConic('ellipse');
              setHVal('0');
              setKVal('0');
              setAVal('5');
              setBVal('3');
            },
          },
          {
            label: 'Hyperbola (a=3, b=4, e=5/3)',
            onSelect: () => {
              setConic('hyperbola');
              setHVal('0');
              setKVal('0');
              setAVal('3');
              setBVal('4');
            },
          },
          {
            label: 'Parabola x² = 8y (p=2)',
            onSelect: () => {
              setConic('parabola');
              setHVal('0');
              setKVal('0');
              setPVal('2');
            },
          },
        ]}
        onReset={() => {
          setConic('ellipse');
          setHVal('0');
          setKVal('0');
          setAVal('5');
          setBVal('3');
        }}
        solutionText={solutionText}
        modeLabel={`Eccentricity e = ${fmtNum(geom.ecc, 3)}`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex flex-wrap p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl gap-1">
            {(['ellipse', 'hyperbola', 'parabola', 'circle'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setConic(t)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize ${
                  conic === t ? 'bg-[#F97316] text-white' : 'text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Center h</label>
              <input
                type="number"
                value={hVal}
                onChange={(e) => setHVal(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Center k</label>
              <input
                type="number"
                value={kVal}
                onChange={(e) => setKVal(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            {conic === 'parabola' ? (
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Focal Parameter p</label>
                <input
                  type="number"
                  step="0.5"
                  value={pVal}
                  onChange={(e) => setPVal(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {conic === 'circle' ? 'Radius r' : 'Semi-axis a'}
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={aVal}
                    onChange={(e) => setAVal(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                </div>
                {conic !== 'circle' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Semi-axis b</label>
                    <input
                      type="number"
                      min={0.5}
                      step="0.5"
                      value={bVal}
                      onChange={(e) => setBVal(e.target.value)}
                      className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2.5 text-xs">
            <div>
              <span className="text-[#EA580C] font-semibold block">Canonical Equation</span>
              <span className="text-lg font-bold font-mono text-gray-900">{geom.eq}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-200/70 font-mono tabular-nums">
              <div>
                <span className="font-sans text-gray-500 block">Foci Coordinates</span>
                <span className="font-semibold text-gray-900">{geom.foci}</span>
              </div>
              <div>
                <span className="font-sans text-gray-500 block">Eccentricity e</span>
                <span className="font-semibold text-gray-900">{fmtNum(geom.ecc, 4)}</span>
              </div>
            </div>
            <div className="font-mono text-gray-700 pt-1">
              <span className="font-sans text-gray-500">Vertices: </span>
              {geom.vertices}
            </div>
            <div className="font-mono text-gray-700">{geom.extra}</div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-700 mb-2 self-start">
              Interactive Cartesian Locus, Foci & Asymptotes
            </span>
            <svg
              viewBox={`0 0 ${S} ${S}`}
              className="w-full max-w-[320px] h-auto bg-white rounded-xl border border-gray-200"
            >
              <line x1={16} y1={S / 2} x2={S - 16} y2={S / 2} stroke="#D1D5DB" />
              <line x1={S / 2} y1={16} x2={S / 2} y2={S - 16} stroke="#D1D5DB" />
              {renderCurve()}
            </svg>
            <p className="text-xs text-gray-500 mt-2 self-start">
              Dark points mark foci; dashed lines denote hyperbola asymptotes or parabola directrix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 9: COMPLEX NUMBER POLAR, EULER & DE MOIVRE CONVERTER
// ============================================================================
export const ComplexNumberPolarConverter: React.FC = () => {
  const [re, setRe] = useState('1');
  const [im, setIm] = useState('1.73205');
  const [powerN, setPowerN] = useState('3');
  const [rootK, setRootK] = useState('4');

  const data = useMemo(() => {
    const z: ComplexNum = { re: Number(re) || 0, im: Number(im) || 0 };
    const polar = complexPolar(z);
    const n = Math.round(Number(powerN) || 2);
    const k = Math.max(2, Math.min(8, Math.round(Number(rootK) || 3)));
    const zn = complexPow(z, n);
    const roots = complexNthRoots(z, k);
    return { z, polar, n, k, zn, roots };
  }, [re, im, powerN, rootK]);

  const S = 300;
  const rootRadius = Math.pow(Math.max(data.polar.r, 0.001), 1 / data.k);
  const maxMag = Math.max(data.polar.r, rootRadius, 1) * 1.25;
  const mapC = (c: ComplexNum) => ({
    x: S / 2 + (c.re / maxMag) * 112,
    y: S / 2 - (c.im / maxMag) * 112,
  });
  const zPt = mapC(data.z);

  const solutionText = [
    `Complex Polar & De Moivre Analysis for z = ${formatComplex(data.z, 4)}`,
    `Modulus r = |z| = ${fmtNum(data.polar.r, 5)}`,
    `Principal Argument θ = ${fmtNum(data.polar.thetaDeg, 3)}° (${fmtNum(data.polar.thetaRad, 5)} rad)`,
    `Euler Form: z = ${fmtNum(data.polar.r, 4)} · e^(i · ${fmtNum(data.polar.thetaRad, 4)})`,
    `De Moivre Power z^${data.n} = ${formatComplex(data.zn, 4)}`,
    `All ${data.k}th Roots:`,
    ...data.roots.map((rt, idx) => `  w_${idx} = ${formatComplex(rt, 4)}`),
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'z = 1 + √3i (r=2, θ=60°)',
            onSelect: () => {
              setRe('1');
              setIm('1.7320508');
              setPowerN('4');
              setRootK('3');
            },
          },
          {
            label: '4th Roots of −16 (z = −16 + 0i)',
            onSelect: () => {
              setRe('-16');
              setIm('0');
              setPowerN('2');
              setRootK('4');
            },
          },
          {
            label: '6th Roots of Unity (z = 1)',
            onSelect: () => {
              setRe('1');
              setIm('0');
              setPowerN('6');
              setRootK('6');
            },
          },
        ]}
        onReset={() => {
          setRe('1');
          setIm('1.73205');
          setPowerN('3');
          setRootK('4');
        }}
        solutionText={solutionText}
        modeLabel={`Argand Plane · ${data.k} Roots`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Real Part a</label>
              <input
                type="number"
                step="any"
                value={re}
                onChange={(e) => setRe(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Imag Part b</label>
              <input
                type="number"
                step="any"
                value={im}
                onChange={(e) => setIm(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Power n (zⁿ)</label>
              <input
                type="number"
                value={powerN}
                onChange={(e) => setPowerN(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Root Index k</label>
              <input
                type="number"
                min={2}
                max={8}
                value={rootK}
                onChange={(e) => setRootK(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2.5 text-xs font-mono tabular-nums">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-sans text-[#EA580C] font-semibold block">Polar Phasor Form</span>
                <span className="text-base font-bold text-gray-900">
                  {fmtNum(data.polar.r, 4)} ∠ {fmtNum(data.polar.thetaDeg, 2)}°
                </span>
              </div>
              <div>
                <span className="font-sans text-[#EA580C] font-semibold block">Euler Exponential</span>
                <span className="text-base font-bold text-gray-900">
                  {fmtNum(data.polar.r, 4)} · e^({fmtNum(data.polar.thetaRad, 3)}i)
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-orange-200/70">
              <span className="font-sans text-gray-500 block">De Moivre Power z^{data.n}:</span>
              <span className="text-sm font-bold text-gray-900">{formatComplex(data.zn, 5)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              All {data.k} Distinct Complex Roots (w_m^({data.k}) = z)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
              {data.roots.map((rt, idx) => (
                <div key={idx} className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-[#F97316] font-bold mr-1.5">w_{idx}:</span>
                  {formatComplex(rt, 4)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-700 mb-2 self-start">
              Argand Plane Vector z & Regular {data.k}-Gon of Roots
            </span>
            <svg
              viewBox={`0 0 ${S} ${S}`}
              className="w-full max-w-[300px] h-auto bg-white rounded-xl border border-gray-200"
            >
              <line x1={16} y1={S / 2} x2={S - 16} y2={S / 2} stroke="#D1D5DB" />
              <line x1={S / 2} y1={16} x2={S / 2} y2={S - 16} stroke="#D1D5DB" />
              <circle
                cx={S / 2}
                cy={S / 2}
                r={(rootRadius / maxMag) * 112}
                fill="none"
                stroke="#93C5FD"
                strokeDasharray="4 4"
              />
              <polygon
                points={data.roots
                  .map((rt) => {
                    const p = mapC(rt);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ')}
                fill="#EFF6FF"
                fillOpacity={0.55}
                stroke="#0284C7"
                strokeWidth={1.6}
              />
              {data.roots.map((rt, idx) => {
                const p = mapC(rt);
                return <circle key={idx} cx={p.x} cy={p.y} r={4} fill="#0284C7" />;
              })}
              <line x1={S / 2} y1={S / 2} x2={zPt.x} y2={zPt.y} stroke="#F97316" strokeWidth={2.8} />
              <circle cx={zPt.x} cy={zPt.y} r={5.5} fill="#F97316" stroke="#FFFFFF" strokeWidth={1.5} />
            </svg>
            <p className="text-xs text-gray-500 mt-2 self-start">
              Orange vector: input z · Blue polygon vertices: {data.k}th roots on circle of radius {fmtNum(rootRadius, 3)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
