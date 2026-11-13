import React, { useMemo, useState } from 'react';
import {
  computeRrefWithSteps,
  determinantNxN,
  differentiateAst,
  evalAst,
  findPolynomialRoots,
  formatAst,
  formatComplex,
  invertMatrixNxN,
  parseMathAst,
  simplifyAst,
} from '../../../utils/mathEngine';
import { MathWorkspaceBar, fmtNum } from './MathWorkspaceHeader';

// ============================================================================
// TOOL 15: MATRIX ALGEBRA, RREF, DETERMINANT & INVERSE LAB
// ============================================================================
export const MatrixAlgebraRrefLab: React.FC = () => {
  const [size, setSize] = useState<2 | 3 | 4>(3);
  const [matA, setMatA] = useState<number[][]>([
    [2, 1, 1, 0],
    [1, 3, 2, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1],
  ]);
  const [matB, setMatB] = useState<number[][]>([
    [1, 0, 2, 0],
    [-1, 3, 1, 0],
    [2, 1, 0, 0],
    [0, 0, 0, 1],
  ]);
  const [op, setOp] = useState<'A_PROPS' | 'ADD' | 'SUB' | 'MUL'>('A_PROPS');

  const lab = useMemo(() => {
    const A = matA.slice(0, size).map((r) => r.slice(0, size));
    const B = matB.slice(0, size).map((r) => r.slice(0, size));
    const detA = determinantNxN(A);
    const traceA = A.reduce((acc, r, i) => acc + r[i], 0);
    const rrefRes = computeRrefWithSteps(A);
    const invA = invertMatrixNxN(A);
    const transA = A[0].map((_, c) => A.map((r) => r[c]));

    const addAB = A.map((r, i) => r.map((v, j) => v + B[i][j]));
    const subAB = A.map((r, i) => r.map((v, j) => v - B[i][j]));
    const mulAB = A.map((r, i) =>
      B[0].map((_, j) => r.reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0))
    );

    return { A, B, detA, traceA, rrefRes, invA, transA, addAB, subAB, mulAB };
  }, [matA, matB, size]);

  const setCell = (which: 'A' | 'B', r: number, c: number, val: string) => {
    const n = Number(val);
    const setter = which === 'A' ? setMatA : setMatB;
    setter((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((v, ci) => (ci === c ? (Number.isNaN(n) ? 0 : n) : v)) : row
      )
    );
  };

  const renderMatrixTable = (M: number[][], title: string) => (
    <div className="p-3.5 rounded-xl bg-white border border-gray-200">
      <p className="text-xs font-semibold text-gray-600 mb-2">{title}</p>
      <table className="w-full text-xs font-mono tabular-nums">
        <tbody>
          {M.map((row, r) => (
            <tr key={r} className="border-b last:border-b-0 border-gray-100">
              {row.map((v, c) => (
                <td key={c} className="px-2 py-1.5 text-right text-gray-900">
                  {fmtNum(v, 4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const solutionText = [
    `Matrix Algebra Lab (${size}×${size})`,
    `det(A) = ${fmtNum(lab.detA, 5)} · tr(A) = ${fmtNum(lab.traceA, 5)} · rank(A) = ${lab.rrefRes.rank}`,
    lab.invA ? `A is Invertible (det ≠ 0)` : `A is Singular (Non-invertible)`,
    `RREF Steps:`,
    ...lab.rrefRes.steps.map((s, i) => `  ${i + 1}. ${s}`),
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: '3×3 Unimodular (det = −1)',
            onSelect: () => {
              setSize(3);
              setMatA([
                [2, 1, 1, 0],
                [1, 3, 2, 0],
                [1, 0, 0, 0],
                [0, 0, 0, 1],
              ]);
            },
          },
          {
            label: '2×2 Rotation/Shear',
            onSelect: () => {
              setSize(2);
              setMatA([
                [4, 7, 0, 0],
                [2, 6, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
              ]);
            },
          },
          {
            label: '3×3 Rank-Deficient (det = 0)',
            onSelect: () => {
              setSize(3);
              setMatA([
                [1, 2, 3, 0],
                [4, 5, 6, 0],
                [7, 8, 9, 0],
                [0, 0, 0, 1],
              ]);
            },
          },
        ]}
        onReset={() => {
          setSize(3);
          setOp('A_PROPS');
        }}
        solutionText={solutionText}
        modeLabel={`${size}×${size} Matrix Lab`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSize(n)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    size === n ? 'bg-[#F97316] text-white' : 'text-gray-600'
                  }`}
                >
                  {n}×{n}
                </button>
              ))}
            </div>

            <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
              {(
                [
                  { id: 'A_PROPS', lbl: 'RREF & A⁻¹' },
                  { id: 'MUL', lbl: 'A × B' },
                  { id: 'ADD', lbl: 'A + B' },
                  { id: 'SUB', lbl: 'A − B' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOp(m.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                    op === m.id ? 'bg-gray-900 text-white' : 'text-gray-600'
                  }`}
                >
                  {m.lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Matrix A ({size}×{size})</p>
            <div className="space-y-1.5">
              {Array.from({ length: size }, (_, r) => (
                <div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                  {Array.from({ length: size }, (_, c) => (
                    <input
                      key={c}
                      type="number"
                      value={matA[r][c]}
                      onChange={(e) => setCell('A', r, c, e.target.value)}
                      className="w-full px-2.5 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {op !== 'A_PROPS' && (
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Matrix B ({size}×{size})</p>
              <div className="space-y-1.5">
                {Array.from({ length: size }, (_, r) => (
                  <div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {Array.from({ length: size }, (_, c) => (
                      <input
                        key={c}
                        type="number"
                        value={matB[r][c]}
                        onChange={(e) => setCell('B', r, c, e.target.value)}
                        className="w-full px-2.5 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div>
              <span className="font-sans text-[#EA580C] font-semibold block">det(A)</span>
              <span className="text-xl font-bold text-gray-900">{fmtNum(lab.detA, 4)}</span>
            </div>
            <div>
              <span className="font-sans text-[#EA580C] font-semibold block">trace(A)</span>
              <span className="text-xl font-bold text-gray-900">{fmtNum(lab.traceA, 4)}</span>
            </div>
            <div>
              <span className="font-sans text-[#EA580C] font-semibold block">rank(A) / nullity</span>
              <span className="text-xl font-bold text-gray-900">
                {lab.rrefRes.rank} / {size - lab.rrefRes.rank}
              </span>
            </div>
          </div>

          {op === 'A_PROPS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderMatrixTable(lab.rrefRes.rref, 'RREF(A)')}
              {lab.invA ? (
                renderMatrixTable(lab.invA, 'Inverse Matrix A⁻¹')
              ) : (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center">
                  Matrix A is singular (det(A) = 0); inverse A⁻¹ does not exist.
                </div>
              )}
              {renderMatrixTable(lab.transA, 'Transpose Aᵀ')}
            </div>
          ) : (
            renderMatrixTable(
              op === 'MUL' ? lab.mulAB : op === 'ADD' ? lab.addAB : lab.subAB,
              op === 'MUL' ? 'Product Matrix A · B' : op === 'ADD' ? 'Sum A + B' : 'Difference A − B'
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 16: EIGENVALUES & EIGENVECTORS CALCULATOR
// ============================================================================
export const EigenvaluesEigenvectorsCalculator: React.FC = () => {
  const [size, setSize] = useState<2 | 3>(2);
  const [mat, setMat] = useState<number[][]>([
    [4, 2, 0],
    [1, 3, 0],
    [0, 0, 2],
  ]);

  const eig = useMemo(() => {
    const A = mat.slice(0, size).map((r) => r.slice(0, size));
    const tr = A.reduce((s, r, i) => s + r[i], 0);
    const det = determinantNxN(A);

    let charCoeffs: number[] = [];
    let charStr = '';
    if (size === 2) {
      charCoeffs = [1, -tr, det];
      charStr = `λ² ${-tr >= 0 ? '+' : '−'} ${fmtNum(Math.abs(tr), 4)}λ ${det >= 0 ? '+' : '−'} ${fmtNum(
        Math.abs(det),
        4
      )} = 0`;
    } else {
      // λ³ - tr(A)λ² + (M11 + M22 + M33)λ - det(A) = 0
      const m11 = A[1][1] * A[2][2] - A[1][2] * A[2][1];
      const m22 = A[0][0] * A[2][2] - A[0][2] * A[2][0];
      const m33 = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      const c1 = m11 + m22 + m33;
      charCoeffs = [1, -tr, c1, -det];
      charStr = `λ³ − (${fmtNum(tr, 3)})λ² + (${fmtNum(c1, 3)})λ − (${fmtNum(det, 3)}) = 0`;
    }

    const roots = findPolynomialRoots(charCoeffs);

    // Nullspace vector for real eigenvalues
    const eigenPairs = roots.map((lam) => {
      if (Math.abs(lam.im) > 1e-5) {
        return { lambda: lam, vectorStr: 'Complex Conjugate Eigenspace' };
      }
      const shifted = A.map((row, r) => row.map((v, c) => (r === c ? v - lam.re : v)));
      const { rref, pivotCols } = computeRrefWithSteps(shifted);
      const freeCol = Array.from({ length: size }, (_, c) => c).find((c) => !pivotCols.includes(c)) ?? size - 1;
      const vec = Array(size).fill(0);
      vec[freeCol] = 1;
      pivotCols.forEach((pCol, rowIdx) => {
        vec[pCol] = -rref[rowIdx][freeCol];
      });
      return {
        lambda: lam,
        vectorStr: `[${vec.map((x) => fmtNum(x, 4)).join(', ')}]ᵀ`,
      };
    });

    return { A, tr, det, charStr, eigenPairs };
  }, [mat, size]);

  const solutionText = [
    `Eigenvalues & Eigenvectors (${size}×${size})`,
    `Characteristic Equation: ${eig.charStr}`,
    `Invariant Check: tr(A) = ${fmtNum(eig.tr, 4)}, det(A) = ${fmtNum(eig.det, 4)}`,
    ...eig.eigenPairs.map((p, i) => `λ_${i + 1} = ${formatComplex(p.lambda, 4)} → v_${i + 1} = ${p.vectorStr}`),
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: '2×2 Real ([4, 2; 1, 3] → λ=5, 2)',
            onSelect: () => {
              setSize(2);
              setMat([
                [4, 2, 0],
                [1, 3, 0],
                [0, 0, 1],
              ]);
            },
          },
          {
            label: '2×2 Spiral Rotation (λ = ±i)',
            onSelect: () => {
              setSize(2);
              setMat([
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1],
              ]);
            },
          },
          {
            label: '3×3 Symmetric Covariance',
            onSelect: () => {
              setSize(3);
              setMat([
                [2, -1, 0],
                [-1, 2, -1],
                [0, -1, 2],
              ]);
            },
          },
        ]}
        onReset={() => {
          setSize(2);
          setMat([
            [4, 2, 0],
            [1, 3, 0],
            [0, 0, 2],
          ]);
        }}
        solutionText={solutionText}
        modeLabel={`${size}×${size} Spectral Solver`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex p-1 bg-[#F9FAFB] border border-gray-200 rounded-xl">
            {([2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSize(n)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                  size === n ? 'bg-[#F97316] text-white' : 'text-gray-600'
                }`}
              >
                {n} × {n} Matrix
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Square Matrix A</p>
            {Array.from({ length: size }, (_, r) => (
              <div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                {Array.from({ length: size }, (_, c) => (
                  <input
                    key={c}
                    type="number"
                    value={mat[r][c]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMat((prev) =>
                        prev.map((row, ri) =>
                          ri === r ? row.map((cell, ci) => (ci === c ? (Number.isNaN(v) ? 0 : v) : cell)) : row
                        )
                      );
                    }}
                    className="w-full px-3 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2">
            <span className="text-xs font-semibold text-[#EA580C] block">
              Characteristic Polynomial det(A − λI) = 0
            </span>
            <div className="text-base font-bold font-mono text-gray-900">{eig.charStr}</div>
            <div className="pt-2 border-t border-orange-200/70 flex gap-6 text-xs font-mono text-gray-700 tabular-nums">
              <span>Σ λ_i = trace(A) = {fmtNum(eig.tr, 4)}</span>
              <span>Π λ_i = det(A) = {fmtNum(eig.det, 4)}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {eig.eigenPairs.map((pair, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums"
              >
                <div>
                  <span className="text-gray-500 font-sans block">Eigenvalue λ_{idx + 1}</span>
                  <span className="text-base font-bold text-[#111827]">{formatComplex(pair.lambda, 5)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-sans block">Basis Eigenvector v_{idx + 1}</span>
                  <span className="text-sm font-semibold text-[#EA580C]">{pair.vectorStr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 17: 3D VECTOR DOT, CROSS PRODUCT & PROJECTION VISUALIZER
// ============================================================================
export const Vector3dDotCrossVisualizer: React.FC = () => {
  const [u, setU] = useState<[string, string, string]>(['2', '-1', '3']);
  const [v, setV] = useState<[string, string, string]>(['1', '4', '-2']);
  const [yawDeg, setYawDeg] = useState(38);

  const vec = useMemo(() => {
    const uNum = u.map((x) => Number(x) || 0) as [number, number, number];
    const vNum = v.map((x) => Number(x) || 0) as [number, number, number];
    const magU = Math.hypot(...uNum);
    const magV = Math.hypot(...vNum);
    const dot = uNum[0] * vNum[0] + uNum[1] * vNum[1] + uNum[2] * vNum[2];
    const cross: [number, number, number] = [
      uNum[1] * vNum[2] - uNum[2] * vNum[1],
      uNum[2] * vNum[0] - uNum[0] * vNum[2],
      uNum[0] * vNum[1] - uNum[1] * vNum[0],
    ];
    const areaPara = Math.hypot(...cross);
    const cosTheta = magU * magV > 1e-12 ? Math.max(-1, Math.min(1, dot / (magU * magV))) : 0;
    const angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;
    const projScale = magV > 1e-12 ? dot / (magV * magV) : 0;
    const projUonV = vNum.map((c) => c * projScale) as [number, number, number];

    return { uNum, vNum, magU, magV, dot, cross, areaPara, angleDeg, projUonV };
  }, [u, v]);

  // Isometric / Yaw 3D-to-2D projection
  const S = 300;
  const maxCoord = Math.max(...vec.uNum.map(Math.abs), ...vec.vNum.map(Math.abs), ...vec.cross.map((c) => Math.abs(c) * 0.45), 3);
  const scale = 95 / maxCoord;
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = 0.45;

  const proj3D = (x: number, y: number, z: number) => {
    const xr = x * Math.cos(yaw) - y * Math.sin(yaw);
    const yr = x * Math.sin(yaw) + y * Math.cos(yaw);
    const sx = S / 2 + xr * scale;
    const sy = S / 2 - (z * Math.cos(pitch) - yr * Math.sin(pitch)) * scale;
    return { x: sx, y: sy };
  };

  const O = proj3D(0, 0, 0);
  const U2 = proj3D(vec.uNum[0], vec.uNum[1], vec.uNum[2]);
  const V2 = proj3D(vec.vNum[0], vec.vNum[1], vec.vNum[2]);
  const UV2 = proj3D(vec.uNum[0] + vec.vNum[0], vec.uNum[1] + vec.vNum[1], vec.uNum[2] + vec.vNum[2]);
  const C2 = proj3D(vec.cross[0] * 0.45, vec.cross[1] * 0.45, vec.cross[2] * 0.45);

  const solutionText = [
    `3D Vector Analysis: u = ⟨${vec.uNum.join(', ')}⟩, v = ⟨${vec.vNum.join(', ')}⟩`,
    `|u| = ${fmtNum(vec.magU, 4)}, |v| = ${fmtNum(vec.magV, 4)}`,
    `Dot Product u · v = ${fmtNum(vec.dot, 4)} · Angle θ = ${fmtNum(vec.angleDeg, 3)}°`,
    `Cross Product u × v = ⟨${vec.cross.map((c) => fmtNum(c, 4)).join(', ')}⟩`,
    `Parallelogram Area |u × v| = ${fmtNum(vec.areaPara, 4)}`,
    `proj_v(u) = ⟨${vec.projUonV.map((c) => fmtNum(c, 4)).join(', ')}⟩`,
  ].join('\n');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'u=⟨2,−1,3⟩, v=⟨1,4,−2⟩',
            onSelect: () => {
              setU(['2', '-1', '3']);
              setV(['1', '4', '-2']);
            },
          },
          {
            label: 'Orthogonal Basis i × j = k',
            onSelect: () => {
              setU(['3', '0', '0']);
              setV(['0', '3', '0']);
            },
          },
        ]}
        onReset={() => {
          setU(['2', '-1', '3']);
          setV(['1', '4', '-2']);
          setYawDeg(38);
        }}
        solutionText={solutionText}
        modeLabel={`Angle θ = ${fmtNum(vec.angleDeg, 1)}°`}
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
              <p className="text-xs font-semibold text-[#EA580C]">Vector u = ⟨u_x, u_y, u_z⟩</p>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((ax, i) => (
                  <input
                    key={ax}
                    type="number"
                    value={u[i]}
                    onChange={(e) =>
                      setU((prev) => prev.map((val, idx) => (idx === i ? e.target.value : val)) as [string, string, string])
                    }
                    className="w-full px-2 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                ))}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-2">
              <p className="text-xs font-semibold text-sky-700">Vector v = ⟨v_x, v_y, v_z⟩</p>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((ax, i) => (
                  <input
                    key={ax}
                    type="number"
                    value={v[i]}
                    onChange={(e) =>
                      setV((prev) => prev.map((val, idx) => (idx === i ? e.target.value : val)) as [string, string, string])
                    }
                    className="w-full px-2 py-2 text-center font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-orange-200 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div>
              <span className="font-sans text-gray-500 block">Dot Product u · v</span>
              <span className="text-lg font-bold text-gray-900">{fmtNum(vec.dot, 4)}</span>
            </div>
            <div>
              <span className="font-sans text-gray-500 block">Angle θ Between u & v</span>
              <span className="text-lg font-bold text-[#EA580C]">{fmtNum(vec.angleDeg, 2)}°</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-orange-200/70">
              <span className="font-sans text-gray-500 block">Cross Product u × v (Orthogonal Normal)</span>
              <span className="text-base font-bold text-emerald-800">
                ⟨{vec.cross.map((c) => fmtNum(c, 4)).join(', ')}⟩  (Area = {fmtNum(vec.areaPara, 4)})
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-sans text-gray-500 block">Vector Projection proj_v(u)</span>
              <span className="font-semibold text-gray-900">
                ⟨{vec.projUonV.map((c) => fmtNum(c, 4)).join(', ')}⟩
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 flex flex-col items-center">
            <div className="w-full flex justify-between text-xs mb-2">
              <span className="font-semibold text-gray-700">3D Perspective Projection</span>
              <span className="font-mono text-gray-500">Orange: u · Blue: v · Green: u×v</span>
            </div>
            <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[300px] h-auto bg-white rounded-xl border border-gray-200">
              {(['x', 'y', 'z'] as const).map((ax) => {
                const end = proj3D(
                  ax === 'x' ? maxCoord : 0,
                  ax === 'y' ? maxCoord : 0,
                  ax === 'z' ? maxCoord : 0
                );
                return (
                  <g key={ax}>
                    <line x1={O.x} y1={O.y} x2={end.x} y2={end.y} stroke="#D1D5DB" strokeDasharray="3 3" />
                    <text x={end.x + 4} y={end.y} className="text-[10px] font-mono fill-gray-400">
                      {ax}
                    </text>
                  </g>
                );
              })}
              <polygon
                points={`${O.x},${O.y} ${U2.x},${U2.y} ${UV2.x},${UV2.y} ${V2.x},${V2.y}`}
                fill="#FFF7ED"
                fillOpacity={0.65}
                stroke="#FDBA74"
              />
              <line x1={O.x} y1={O.y} x2={U2.x} y2={U2.y} stroke="#F97316" strokeWidth={2.8} />
              <line x1={O.x} y1={O.y} x2={V2.x} y2={V2.y} stroke="#0284C7" strokeWidth={2.8} />
              <line x1={O.x} y1={O.y} x2={C2.x} y2={C2.y} stroke="#059669" strokeWidth={2.8} />
              <circle cx={U2.x} cy={U2.y} r={4} fill="#F97316" />
              <circle cx={V2.x} cy={V2.y} r={4} fill="#0284C7" />
              <circle cx={C2.x} cy={C2.y} r={4} fill="#059669" />
            </svg>
            <div className="w-full mt-3">
              <label className="block text-xs text-gray-600 mb-1">
                Rotate 3D Camera Azimuth: {yawDeg}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={yawDeg}
                onChange={(e) => setYawDeg(Number(e.target.value))}
                className="w-full accent-[#F97316]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOL 18: VECTOR CALCULUS — GRADIENT, DIVERGENCE, CURL & JACOBIAN
// ============================================================================
export const VectorCalculusGradDivCurl: React.FC = () => {
  const [scalarF, setScalarF] = useState('x^2 * y + y * z^3');
  const [vecP, setVecP] = useState('x * y');
  const [vecQ, setVecQ] = useState('y^2 * z');
  const [vecR, setVecR] = useState('x * z');
  const [pt, setPt] = useState<[string, string, string]>(['1', '2', '-1']);

  const calc = useMemo(() => {
    try {
      const fAst = simplifyAst(parseMathAst(scalarF));
      const pAst = simplifyAst(parseMathAst(vecP));
      const qAst = simplifyAst(parseMathAst(vecQ));
      const rAst = simplifyAst(parseMathAst(vecR));

      const fx = simplifyAst(differentiateAst(fAst, 'x'));
      const fy = simplifyAst(differentiateAst(fAst, 'y'));
      const fz = simplifyAst(differentiateAst(fAst, 'z'));

      const fxx = simplifyAst(differentiateAst(fx, 'x'));
      const fyy = simplifyAst(differentiateAst(fy, 'y'));
      const fzz = simplifyAst(differentiateAst(fz, 'z'));

      // Divergence dP/dx + dQ/dy + dR/dz
      const dPdx = simplifyAst(differentiateAst(pAst, 'x'));
      const dQdy = simplifyAst(differentiateAst(qAst, 'y'));
      const dRdz = simplifyAst(differentiateAst(rAst, 'z'));

      // Curl <R_y - Q_z, P_z - R_x, Q_x - P_y>
      const curlX = simplifyAst({
        kind: 'binary',
        op: '-',
        left: differentiateAst(rAst, 'y'),
        right: differentiateAst(qAst, 'z'),
      });
      const curlY = simplifyAst({
        kind: 'binary',
        op: '-',
        left: differentiateAst(pAst, 'z'),
        right: differentiateAst(rAst, 'x'),
      });
      const curlZ = simplifyAst({
        kind: 'binary',
        op: '-',
        left: differentiateAst(qAst, 'x'),
        right: differentiateAst(pAst, 'y'),
      });

      const vars = { x: Number(pt[0]) || 0, y: Number(pt[1]) || 0, z: Number(pt[2]) || 0 };
      const gradAt = [evalAst(fx, vars), evalAst(fy, vars), evalAst(fz, vars)];
      const lapAt = evalAst(fxx, vars) + evalAst(fyy, vars) + evalAst(fzz, vars);
      const divAt = evalAst(dPdx, vars) + evalAst(dQdy, vars) + evalAst(dRdz, vars);
      const curlAt = [evalAst(curlX, vars), evalAst(curlY, vars), evalAst(curlZ, vars)];

      return {
        ok: true as const,
        gradSym: `⟨${formatAst(fx)}, ${formatAst(fy)}, ${formatAst(fz)}⟩`,
        divSym: `${formatAst(dPdx)} + (${formatAst(dQdy)}) + (${formatAst(dRdz)})`,
        curlSym: `⟨${formatAst(curlX)}, ${formatAst(curlY)}, ${formatAst(curlZ)}⟩`,
        gradAt,
        lapAt,
        divAt,
        curlAt,
        vars,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid field expression' };
    }
  }, [scalarF, vecP, vecQ, vecR, pt]);

  const solutionText = calc.ok
    ? [
        `Vector Calculus Differential Operators at (${calc.vars.x}, ${calc.vars.y}, ${calc.vars.z})`,
        `∇f = ${calc.gradSym} → ⟨${calc.gradAt.map((v) => fmtNum(v, 4)).join(', ')}⟩`,
        `Laplacian ∇²f = ${fmtNum(calc.lapAt, 4)}`,
        `div(F) = ∇·F = ${calc.divSym} → ${fmtNum(calc.divAt, 4)}`,
        `curl(F) = ∇×F = ${calc.curlSym} → ⟨${calc.curlAt.map((v) => fmtNum(v, 4)).join(', ')}⟩`,
      ].join('\n')
    : 'Invalid vector field';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <MathWorkspaceBar
        presets={[
          {
            label: 'Standard Multivariable Exam Set',
            onSelect: () => {
              setScalarF('x^2 * y + y * z^3');
              setVecP('x * y');
              setVecQ('y^2 * z');
              setVecR('x * z');
              setPt(['1', '2', '-1']);
            },
          },
          {
            label: 'Conservative Field (∇×F = 0)',
            onSelect: () => {
              setScalarF('x^2 + y^2 + z^2');
              setVecP('2 * x');
              setVecQ('2 * y');
              setVecR('2 * z');
              setPt(['1', '1', '1']);
            },
          },
        ]}
        onReset={() => {
          setScalarF('x^2 * y + y * z^3');
          setVecP('x * y');
          setVecQ('y^2 * z');
          setVecR('x * z');
          setPt(['1', '2', '-1']);
        }}
        solutionText={solutionText}
        modeLabel="Symbolic Partial Derivatives"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Scalar Potential f(x, y, z)
              </label>
              <input
                type="text"
                value={scalarF}
                onChange={(e) => setScalarF(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-white border border-gray-300 rounded-lg"
              />
            </div>

            <p className="text-xs font-semibold text-gray-700 pt-1">
              3D Vector Field F(x, y, z) = ⟨P, Q, R⟩
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">P(x,y,z)</label>
                <input
                  type="text"
                  value={vecP}
                  onChange={(e) => setVecP(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Q(x,y,z)</label>
                <input
                  type="text"
                  value={vecQ}
                  onChange={(e) => setVecQ(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">R(x,y,z)</label>
                <input
                  type="text"
                  value={vecR}
                  onChange={(e) => setVecR(e.target.value)}
                  className="w-full px-2.5 py-2 font-mono text-xs bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['x₀', 'y₀', 'z₀'] as const).map((lbl, idx) => (
                <div key={lbl}>
                  <label className="block text-xs text-gray-500 mb-1">Point {lbl}</label>
                  <input
                    type="number"
                    value={pt[idx]}
                    onChange={(e) =>
                      setPt((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)) as [string, string, string])
                    }
                    className="w-full px-2.5 py-2 font-mono text-sm tabular-nums bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3">
          {calc.ok ? (
            <>
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-2 text-xs font-mono">
                <span className="font-sans font-semibold text-[#EA580C] block">
                  Gradient ∇f & Laplacian ∇²f
                </span>
                <div className="text-gray-900 break-all">∇f = {calc.gradSym}</div>
                <div className="font-bold text-gray-900 tabular-nums">
                  At P₀: ∇f = ⟨{calc.gradAt.map((v) => fmtNum(v, 4)).join(', ')}⟩ · ∇²f = {fmtNum(calc.lapAt, 4)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-1.5 text-xs font-mono">
                <span className="font-sans font-semibold text-gray-700 block">
                  Divergence ∇ · F (Scalar Flux Density)
                </span>
                <div className="text-gray-700 break-all">{calc.divSym}</div>
                <div className="font-bold text-gray-900 tabular-nums">
                  ∇ · F(P₀) = {fmtNum(calc.divAt, 4)}{' '}
                  <span className="font-sans font-normal text-gray-500">
                    ({Math.abs(calc.divAt) < 1e-8 ? 'Locally Incompressible / Solenoidal' : calc.divAt > 0 ? 'Net Source' : 'Net Sink'})
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 space-y-1.5 text-xs font-mono">
                <span className="font-sans font-semibold text-gray-700 block">
                  Curl ∇ × F (Vorticity / Circulation)
                </span>
                <div className="text-gray-700 break-all">{calc.curlSym}</div>
                <div className="font-bold text-emerald-800 tabular-nums">
                  ∇ × F(P₀) = ⟨{calc.curlAt.map((v) => fmtNum(v, 4)).join(', ')}⟩{' '}
                  {Math.hypot(...calc.curlAt) < 1e-8 && (
                    <span className="font-sans text-emerald-700">(Irrotational / Conservative)</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{calc.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};
