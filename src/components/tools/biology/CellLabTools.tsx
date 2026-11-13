import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

// ============================================================================
// 7. SERIAL DILUTION & LAB MOLARITY (C1V1 = C2V2) CALCULATOR
// ============================================================================
type ConcUnit = 'M' | 'mM' | 'µM' | 'nM';
type VolUnit = 'L' | 'mL' | 'µL';

const CONC_FACTORS: Record<ConcUnit, number> = {
  M: 1,
  mM: 1e-3,
  'µM': 1e-6,
  nM: 1e-9,
};

const VOL_FACTORS: Record<VolUnit, number> = {
  L: 1,
  mL: 1e-3,
  'µL': 1e-6,
};

export function SerialDilutionMolarityCalculator() {
  const [tab, setTab] = useState<'c1v1' | 'serial'>('c1v1');

  // C1V1 = C2V2 state
  const [c1, setC1] = useState(10);
  const [c1Unit, setC1Unit] = useState<ConcUnit>('mM');
  const [c2, setC2] = useState(250);
  const [c2Unit, setC2Unit] = useState<ConcUnit>('µM');
  const [v2, setV2] = useState(50);
  const [v2Unit, setV2Unit] = useState<VolUnit>('mL');

  // Serial dilution state
  const [startConc, setStartConc] = useState(100);
  const [startUnit, setStartUnit] = useState<ConcUnit>('mM');
  const [dilutionFactor, setDilutionFactor] = useState(10);
  const [transferVolUl, setTransferVolUl] = useState(100);
  const [numTubes, setNumTubes] = useState(6);

  const loadExample = () => {
    if (tab === 'c1v1') {
      setC1(10);
      setC1Unit('mM');
      setC2(250);
      setC2Unit('µM');
      setV2(50);
      setV2Unit('mL');
    } else {
      setStartConc(100);
      setStartUnit('mM');
      setDilutionFactor(10);
      setTransferVolUl(100);
      setNumTubes(6);
    }
  };

  const c1v1Calc = useMemo(() => {
    const c1Molar = c1 * CONC_FACTORS[c1Unit];
    const c2Molar = c2 * CONC_FACTORS[c2Unit];
    const v2Liters = v2 * VOL_FACTORS[v2Unit];

    if (c1Molar <= 0 || c2Molar <= 0 || v2Liters <= 0) {
      return { valid: false, error: 'All concentrations and volumes must be positive.' };
    }
    if (c2Molar > c1Molar) {
      return {
        valid: false,
        error: 'Target concentration (C₂) cannot exceed stock concentration (C₁).',
      };
    }

    const v1Liters = (c2Molar * v2Liters) / c1Molar;
    const diluentLiters = Math.max(0, v2Liters - v1Liters);
    const foldDilution = c1Molar / c2Molar;

    const formatVolume = (liters: number) => {
      if (liters >= 1) return `${liters.toFixed(3)} L`;
      if (liters >= 1e-3) return `${(liters * 1e3).toFixed(3)} mL (${(liters * 1e6).toFixed(1)} µL)`;
      return `${(liters * 1e6).toFixed(2)} µL`;
    };

    return {
      valid: true,
      v1Liters,
      diluentLiters,
      foldDilution,
      v1Text: formatVolume(v1Liters),
      diluentText: formatVolume(diluentLiters),
      v2Text: formatVolume(v2Liters),
    };
  }, [c1, c1Unit, c2, c2Unit, v2, v2Unit]);

  const serialTable = useMemo(() => {
    const df = Math.max(1.1, dilutionFactor);
    const vTrans = Math.max(1, transferVolUl);
    const totalTubeVolUl = vTrans * df;
    const bufferVolUl = totalTubeVolUl - vTrans;
    const count = Math.min(12, Math.max(2, Math.round(numTubes)));

    const rows = Array.from({ length: count }, (_, idx) => {
      const tubeNum = idx + 1;
      const cumulativeDf = Math.pow(df, tubeNum);
      const conc = startConc / cumulativeDf;
      return {
        tubeNum,
        source: tubeNum === 1 ? 'Stock Solution' : `Tube ${tubeNum - 1}`,
        transferUl: vTrans,
        bufferUl: bufferVolUl,
        totalUl: totalTubeVolUl,
        finalAfterNextTransferUl: tubeNum < count ? totalTubeVolUl - vTrans : totalTubeVolUl,
        conc,
        cumulativeDf,
      };
    });

    return { df, vTrans, bufferVolUl, totalTubeVolUl, rows };
  }, [startConc, dilutionFactor, transferVolUl, numTubes]);

  const formatAutoConc = (valInStartUnit: number, unit: ConcUnit) => {
    const molar = valInStartUnit * CONC_FACTORS[unit];
    if (molar >= 1) return `${molar.toFixed(4)} M`;
    if (molar >= 1e-3) return `${(molar * 1e3).toFixed(3)} mM`;
    if (molar >= 1e-6) return `${(molar * 1e6).toFixed(3)} µM`;
    if (molar >= 1e-9) return `${(molar * 1e9).toFixed(3)} nM`;
    return `${molar.toExponential(2)} M`;
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('c1v1')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'c1v1' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Dilution (C₁V₁ = C₂V₂)
          </button>
          <button
            type="button"
            onClick={() => setTab('serial')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'serial' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Multi-Tube Serial Dilution Series
          </button>
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      {tab === 'c1v1' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Concentration (C₁)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.0001}
                  step="any"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  value={c1Unit}
                  onChange={(e) => setC1Unit(e.target.value as ConcUnit)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
                >
                  {(['M', 'mM', 'µM', 'nM'] as ConcUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Desired Working Concentration (C₂)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.0001}
                  step="any"
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  value={c2Unit}
                  onChange={(e) => setC2Unit(e.target.value as ConcUnit)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
                >
                  {(['M', 'mM', 'µM', 'nM'] as ConcUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Target Volume (V₂)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.001}
                  step="any"
                  value={v2}
                  onChange={(e) => setV2(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  value={v2Unit}
                  onChange={(e) => setV2Unit(e.target.value as VolUnit)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
                >
                  {(['L', 'mL', 'µL'] as VolUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {!c1v1Calc.valid ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{c1v1Calc.error}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                  <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-[#EA580C] block">
                      Stock Volume (V₁)
                    </span>
                    <span className="text-lg font-mono font-bold text-[#111827] mt-1 block">
                      {c1v1Calc.v1Text}
                    </span>
                  </div>
                  <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Diluent / Buffer Volume
                    </span>
                    <span className="text-lg font-mono font-bold text-[#111827] mt-1 block">
                      {c1v1Calc.diluentText}
                    </span>
                  </div>
                  <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Dilution Factor
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-700 mt-1 block">
                      1 : {c1v1Calc.foldDilution?.toFixed(2)}×
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bench Preparation Protocol</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed tabular-nums">
                    Measure <strong>{c1v1Calc.diluentText}</strong> of solvent/buffer into a clean
                    vessel, then pipette <strong>{c1v1Calc.v1Text}</strong> of your{' '}
                    <strong>
                      {c1} {c1Unit}
                    </strong>{' '}
                    stock solution and mix thoroughly to obtain{' '}
                    <strong>
                      {v2} {v2Unit}
                    </strong>{' '}
                    at{' '}
                    <strong>
                      {c2} {c2Unit}
                    </strong>
                    .
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Concentration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.001}
                  step="any"
                  value={startConc}
                  onChange={(e) => setStartConc(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
                />
                <select
                  value={startUnit}
                  onChange={(e) => setStartUnit(e.target.value as ConcUnit)}
                  className="px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                >
                  {(['M', 'mM', 'µM', 'nM'] as ConcUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Step Dilution Factor (1:X)
              </label>
              <input
                type="number"
                min={2}
                max={1000}
                step={1}
                value={dilutionFactor}
                onChange={(e) => setDilutionFactor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transfer Volume per Step (µL)
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                step={10}
                value={transferVolUl}
                onChange={(e) => setTransferVolUl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Dilution Tubes
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={numTubes}
                onChange={(e) => setNumTubes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse tabular-nums">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-3 px-4">Tube #</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Transfer (µL)</th>
                  <th className="py-3 px-4">Diluent Buffer (µL)</th>
                  <th className="py-3 px-4">Tube Conc.</th>
                  <th className="py-3 px-4">Cumulative DF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {serialTable.rows.map((row) => (
                  <tr key={row.tubeNum} className="hover:bg-orange-50/30">
                    <td className="py-2.5 px-4 font-bold text-[#111827]">Tube {row.tubeNum}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.source}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#EA580C]">
                      {row.transferUl.toFixed(1)} µL
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">
                      {row.bufferUl.toFixed(1)} µL
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#111827]">
                      {formatAutoConc(row.conc, startUnit)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      1 : {row.cumulativeDf.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. BACTERIAL CELL GROWTH, DOUBLING TIME & CFU/mL CALCULATOR
// ============================================================================
export function CellGrowthCfuCalculator() {
  const [tab, setTab] = useState<'growth' | 'cfu'>('growth');

  // Growth kinetics state
  const [n0, setN0] = useState(2.5e5);
  const [nt, setNt] = useState(1.6e7);
  const [elapsedMinutes, setElapsedMinutes] = useState(180);

  // Viable plate count state
  const [colonies, setColonies] = useState(148);
  const [dilutionExponent, setDilutionExponent] = useState(-5); // 10^-5
  const [volumePlatedMl, setVolumePlatedMl] = useState(0.1);

  const loadExample = () => {
    if (tab === 'growth') {
      setN0(2.5e5);
      setNt(1.6e7);
      setElapsedMinutes(180);
    } else {
      setColonies(148);
      setDilutionExponent(-5);
      setVolumePlatedMl(0.1);
    }
  };

  const growthStats = useMemo(() => {
    if (n0 <= 0 || nt <= n0 || elapsedMinutes <= 0) {
      return {
        valid: false,
        error: 'Final cell density (Nₜ) must be greater than initial density (N₀) over t > 0.',
      };
    }
    const generations = Math.log2(nt / n0);
    const doublingTimeMin = elapsedMinutes / generations;
    const muPerHour = (Math.LN2 / doublingTimeMin) * 60;

    // Curve points
    const points = Array.from({ length: 25 }, (_, i) => {
      const t = (elapsedMinutes * i) / 24;
      const val = n0 * Math.pow(2, t / doublingTimeMin);
      return { t, val, logVal: Math.log10(val) };
    });

    return { valid: true, generations, doublingTimeMin, muPerHour, points };
  }, [n0, nt, elapsedMinutes]);

  const cfuStats = useMemo(() => {
    const df = Math.pow(10, dilutionExponent); // e.g., 10^-5
    const vol = Math.max(0.001, volumePlatedMl);
    const cfuPerMl = colonies / (df * vol);
    const countable = colonies >= 30 && colonies <= 300;
    const statusLabel =
      colonies < 30
        ? 'TFTB — Too Few To Count (< 30 colonies; higher statistical variance)'
        : colonies > 300
        ? 'TNTC — Too Numerous To Count (> 300 colonies; crowding inhibition likely)'
        : 'Optimal Countable Range (30–300 colonies)';
    return { cfuPerMl, countable, statusLabel };
  }, [colonies, dilutionExponent, volumePlatedMl]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('growth')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'growth' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exponential Growth &amp; Doubling Time
          </button>
          <button
            type="button"
            onClick={() => setTab('cfu')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'cfu' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Viable Plate Count (CFU/mL)
          </button>
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      {tab === 'growth' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Cell Density N₀ (cells/mL or OD₆₀₀)
              </label>
              <input
                type="number"
                min={0.001}
                step="any"
                value={n0}
                onChange={(e) => setN0(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Cell Density Nₜ (cells/mL or OD₆₀₀)
              </label>
              <input
                type="number"
                min={0.002}
                step="any"
                value={nt}
                onChange={(e) => setNt(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Elapsed Log-Phase Time t (minutes)
              </label>
              <input
                type="number"
                min={1}
                step={5}
                value={elapsedMinutes}
                onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {!growthStats.valid ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                {growthStats.error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                  <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-[#EA580C] block">
                      Generations (n)
                    </span>
                    <span className="text-xl font-mono font-bold text-[#111827] mt-1 block">
                      {growthStats.generations?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Doubling Time (g)
                    </span>
                    <span className="text-xl font-mono font-bold text-[#111827] mt-1 block">
                      {growthStats.doublingTimeMin?.toFixed(1)} min
                    </span>
                  </div>
                  <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Growth Rate (µ)
                    </span>
                    <span className="text-xl font-mono font-bold text-emerald-700 mt-1 block">
                      {growthStats.muPerHour?.toFixed(3)} h⁻¹
                    </span>
                  </div>
                </div>

                {/* Exponential Curve SVG */}
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-[#111827]">
                      Exponential Growth Curve N(t) = N₀ · 2^(t/g)
                    </span>
                    <span className="font-mono">0 → {elapsedMinutes} min</span>
                  </div>
                  <svg viewBox="0 0 420 150" className="w-full h-36">
                    <line x1="40" y1="125" x2="400" y2="125" stroke="#CBD5E1" strokeWidth="1.5" />
                    <line x1="40" y1="15" x2="40" y2="125" stroke="#CBD5E1" strokeWidth="1.5" />
                    <polyline
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points={growthStats.points
                        ?.map((pt, idx) => {
                          const x = 40 + (idx / 24) * 360;
                          const frac = (pt.val - n0) / Math.max(1e-9, nt - n0);
                          const y = 122 - frac * 100;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ')}
                    />
                    <text x="44" y="25" fontSize="10" fill="#475569" fontFamily="monospace">
                      Nₜ = {nt.toExponential(2)}
                    </text>
                    <text x="44" y="118" fontSize="10" fill="#475569" fontFamily="monospace">
                      N₀ = {n0.toExponential(2)}
                    </text>
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Counted Colonies on Agar Plate
              </label>
              <input
                type="number"
                min={1}
                max={2000}
                value={colonies}
                onChange={(e) => setColonies(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tube Dilution Plated (10ⁿ)
              </label>
              <select
                value={dilutionExponent}
                onChange={(e) => setDilutionExponent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
              >
                {[-1, -2, -3, -4, -5, -6, -7, -8, -9].map((exp) => (
                  <option key={exp} value={exp}>
                    10^{exp} (1 : {(10 ** Math.abs(exp)).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Volume Spread / Plated (mL)
              </label>
              <input
                type="number"
                min={0.01}
                max={5}
                step={0.05}
                value={volumePlatedMl}
                onChange={(e) => setVolumePlatedMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 tabular-nums">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-6 space-y-2">
              <span className="text-xs font-bold text-[#EA580C] block">
                Original Culture Viable Titer (CFU/mL)
              </span>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">
                {cfuStats.cfuPerMl.toExponential(2)} CFU/mL
              </p>
              <p className="text-xs font-mono text-slate-600">
                = {Math.round(cfuStats.cfuPerMl).toLocaleString()} colony-forming units per mL
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border text-xs font-semibold flex items-center gap-2.5 ${
                cfuStats.countable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {cfuStats.countable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{cfuStats.statusLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 9. MICROSCOPE FIELD OF VIEW (FOV) & CELL SIZE CALCULATOR
// ============================================================================
export function MicroscopeFovCalculator() {
  const [ocularMag, setOcularMag] = useState(10);
  const [calibObjMag, setCalibObjMag] = useState(4);
  const [calibFovMm, setCalibFovMm] = useState(4.5);
  const [workingObjMag, setWorkingObjMag] = useState(40);
  const [cellsAcrossDiameter, setCellsAcrossDiameter] = useState(6);

  const loadExample = () => {
    setOcularMag(10);
    setCalibObjMag(4);
    setCalibFovMm(4.5);
    setWorkingObjMag(40);
    setCellsAcrossDiameter(6);
  };

  const fovData = useMemo(() => {
    const m1 = Math.max(1, ocularMag * calibObjMag);
    const m2 = Math.max(1, ocularMag * workingObjMag);
    const fov2Mm = calibFovMm * (calibObjMag / Math.max(1, workingObjMag));
    const fov2Um = fov2Mm * 1000;
    const cellSizeUm = fov2Um / Math.max(0.25, cellsAcrossDiameter);
    const percentOccupied = Math.min(100, (100 / Math.max(1, cellsAcrossDiameter)));

    return {
      m1,
      m2,
      fov2Mm,
      fov2Um,
      cellSizeUm,
      percentOccupied,
    };
  }, [ocularMag, calibObjMag, calibFovMm, workingObjMag, cellsAcrossDiameter]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-display font-bold text-[#111827]">
            Compound Light Microscope FOV &amp; Specimen Micrometer Solver
          </h2>
          <p className="text-xs text-slate-500">
            Inversely scales field diameter with objective power: FOV₂ = FOV₁ × (M₁ / M₂).
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ocular Lens (×)
              </label>
              <select
                value={ocularMag}
                onChange={(e) => setOcularMag(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              >
                {[5, 10, 15, 20].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Calibrated Low Obj (×)
              </label>
              <select
                value={calibObjMag}
                onChange={(e) => setCalibObjMag(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              >
                {[4, 10].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Measured Low-Power FOV₁ Diameter (mm)
            </label>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={calibFovMm}
              onChange={(e) => setCalibFovMm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Active Working Objective Lens (×)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 10, 40, 100].map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => setWorkingObjMag(obj)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-colors ${
                    workingObjMag === obj
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300'
                  }`}
                >
                  {obj}×
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cells Fitting End-to-End Across FOV Diameter
            </label>
            <input
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              value={cellsAcrossDiameter}
              onChange={(e) => setCellsAcrossDiameter(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Ocular Reticle SVG */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <svg viewBox="0 0 200 200" className="w-44 h-44">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="#FFF7ED"
                stroke="#111827"
                strokeWidth="5"
              />
              {/* Micrometer Reticle Line */}
              <line
                x1="14"
                y1="100"
                x2="186"
                y2="100"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Sample cells across FOV */}
              {(() => {
                const renderedCount = Math.min(14, Math.max(1, Math.round(cellsAcrossDiameter)));
                const cellW = 168 / renderedCount;
                return Array.from({ length: renderedCount }, (_, idx) => {
                  const cx = 16 + cellW * idx + cellW / 2;
                  return (
                    <g key={idx}>
                      <ellipse
                        cx={cx}
                        cy="100"
                        rx={Math.max(2, cellW * 0.44)}
                        ry={Math.min(24, Math.max(4, cellW * 0.28))}
                        fill="#FED7AA"
                        stroke="#EA580C"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx={cx}
                        cy="100"
                        r={Math.max(1.2, Math.min(4, cellW * 0.1))}
                        fill="#9A3412"
                      />
                    </g>
                  );
                });
              })()}
              <text
                x="100"
                y="174"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#111827"
                fontFamily="monospace"
              >
                FOV = {fovData.fov2Um.toFixed(0)} µm
              </text>
            </svg>
          </div>

          <div className="sm:col-span-7 space-y-3 tabular-nums">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Total Magnification
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {fovData.m2}× ({ocularMag}× ocular × {workingObjMag}× objective)
              </span>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Working Field of View (FOV₂)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {fovData.fov2Um.toFixed(1)} µm ({fovData.fov2Mm.toFixed(3)} mm)
              </span>
            </div>

            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Estimated Single Specimen Length
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827]">
                {fovData.cellSizeUm.toFixed(1)} µm
              </span>
              <span className="block text-xs text-slate-600 mt-0.5">
                (~{fovData.percentOccupied.toFixed(1)}% of diameter per cell)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. INTERACTIVE CELL STRUCTURE & ORGANELLE FUNCTION EXPLORER
// ============================================================================
type CellTypeKey = 'animal' | 'plant' | 'bacterial';

interface OrganelleInfo {
  id: string;
  name: string;
  structure: string;
  functionText: string;
  examNotes: string;
  cx: number;
  cy: number;
}

const CELL_ORGANELLES: Record<CellTypeKey, OrganelleInfo[]> = {
  animal: [
    {
      id: 'nucleus',
      name: 'Nucleus & Nucleolus',
      structure: 'Double phospholipid nuclear envelope perforated by nuclear pore complexes; dense nucleolar subdomain.',
      functionText: 'Houses chromosomal DNA, coordinates eukaryotic transcription, and assembles ribosomal subunits (rRNA) in the nucleolus.',
      examNotes: 'mRNA requires 5′ 7-methylguanosine capping and 3′ poly-A tailing before nuclear export.',
      cx: 155,
      cy: 115,
    },
    {
      id: 'mitochondria',
      name: 'Mitochondrion',
      structure: 'Smooth outer membrane + highly folded inner membrane (cristae) enclosing the mitochondrial matrix and circular mtDNA.',
      functionText: 'Executes pyruvate oxidation, Krebs (TCA) cycle in the matrix, and oxidative phosphorylation (ATP synthase) across cristae.',
      examNotes: 'Endosymbiotic origin: contains 70S ribosomes, circular DNA, and maternal inheritance.',
      cx: 245,
      cy: 85,
    },
    {
      id: 'rer',
      name: 'Rough Endoplasmic Reticulum (RER)',
      structure: 'Flattened interconnected membranous cisternae studded on the cytosolic face with 80S ribosomes.',
      functionText: 'Co-translational translocation, N-linked glycosylation, and disulfide bond folding of secreted and membrane proteins.',
      examNotes: 'Abundant in pancreatic acinar cells and antibody-secreting plasma B cells.',
      cx: 105,
      cy: 120,
    },
    {
      id: 'golgi',
      name: 'Golgi Apparatus',
      structure: 'Polarized stack of flattened cis, medial, and trans cisternae with budding COPII/clathrin transport vesicles.',
      functionText: 'Modifies oligosaccharides, adds mannose-6-phosphate tags for lysosomes, and sorts proteins to target membranes.',
      examNotes: 'Cis face receives vesicles from ER; trans-Golgi network dispatches secretory vesicles.',
      cx: 225,
      cy: 155,
    },
    {
      id: 'lysosome',
      name: 'Lysosome',
      structure: 'Single-membrane acidic vesicle maintained at pH ~4.5–5.0 by V-type H⁺-ATPase proton pumps.',
      functionText: 'Hydrolyzes macromolecules (proteins, nucleic acids, lipids) and damaged organelles via acid hydrolases (autophagy).',
      examNotes: 'Tay-Sachs disease results from lysosomal hexosaminidase A deficiency.',
      cx: 105,
      cy: 175,
    },
    {
      id: 'membrane',
      name: 'Plasma Membrane',
      structure: 'Fluid-mosaic amphipathic phospholipid bilayer with cholesterol, integral channels, and glycocalyx.',
      functionText: 'Maintains selective permeability, resting membrane potential (Na⁺/K⁺-ATPase), and GPCR/RTK signal transduction.',
      examNotes: 'Cholesterol buffers fluidity: prevents freezing at low T and restricts excess motion at 37 °C.',
      cx: 280,
      cy: 125,
    },
  ],
  plant: [
    {
      id: 'chloroplast',
      name: 'Chloroplast',
      structure: 'Double outer envelope + internal thylakoid membrane grana stacks suspended in aqueous stroma with circular cpDNA.',
      functionText: 'Light-dependent photophosphorylation on thylakoids (H₂O → O₂, ATP, NADPH) and Calvin-Benson carbon fixation in stroma.',
      examNotes: 'Proton gradient builds inside the acidic thylakoid lumen (low pH) driving ATP synthase into stroma.',
      cx: 245,
      cy: 75,
    },
    {
      id: 'vacuole',
      name: 'Central Vacuole & Tonoplast',
      structure: 'Large single-membrane sac bounded by the tonoplast occupying up to 80% of mature plant cell volume.',
      functionText: 'Stores ions, pigments, and water; generates hydrostatic turgor pressure (Ψp > 0) against the cell wall for structural rigidity.',
      examNotes: 'Hypertonic stress pulls water out of the vacuole, causing plasmolysis.',
      cx: 175,
      cy: 130,
    },
    {
      id: 'cellwall',
      name: 'Cellulose Cell Wall & Plasmodesmata',
      structure: 'β-(1→4)-linked cellulose microfibrils cross-linked with hemicellulose, pectin middle lamella, and cytoplasmic channels.',
      functionText: 'Prevents osmotic lysis in hypotonic environments and enables symplastic cell-to-cell transport via plasmodesmata.',
      examNotes: 'Fungi use chitin and bacteria use peptidoglycan—only plants/algae use β-cellulose walls.',
      cx: 292,
      cy: 120,
    },
    {
      id: 'plant-nucleus',
      name: 'Nucleus',
      structure: 'Double nuclear membrane with chromatin and nucleolus pushed peripherally by the central vacuole.',
      functionText: 'Regulates nuclear gene expression, plastid coordination, and phytohormone transcriptional responses.',
      examNotes: 'Coordinates gene expression with semi-autonomous chloroplasts and mitochondria.',
      cx: 95,
      cy: 85,
    },
    {
      id: 'plant-mito',
      name: 'Mitochondrion',
      structure: 'Double-membrane cristae organelle present alongside chloroplasts in all plant cells.',
      functionText: 'Generates cellular ATP via aerobic respiration (essential in roots and at night when photosynthesis halts).',
      examNotes: 'Common exam trap: plant cells have BOTH chloroplasts AND mitochondria!',
      cx: 105,
      cy: 175,
    },
  ],
  bacterial: [
    {
      id: 'nucleoid',
      name: 'Nucleoid (Circular Chromosome)',
      structure: 'Unbounded cytoplasmic region containing supercoiled circular dsDNA associated with HU/NAP proteins (no nuclear envelope).',
      functionText: 'Allows coupled transcription and translation—ribosomes initiate translation on mRNA while RNA polymerase is still transcribing.',
      examNotes: 'Coupled transcription-translation is strictly prokaryotic because no nuclear membrane separates DNA from ribosomes.',
      cx: 165,
      cy: 118,
    },
    {
      id: 'ribosome70s',
      name: '70S Ribosomes (50S + 30S)',
      structure: 'Ribonucleoprotein particles composed of 50S (23S + 5S rRNA) and 30S (16S rRNA) subunits.',
      functionText: 'Catalyzes peptidyl transferase bond formation during prokaryotic mRNA translation.',
      examNotes: 'Selective target of macrolide, tetracycline, and aminoglycoside antibiotics (sparing human cytosolic 80S ribosomes).',
      cx: 225,
      cy: 95,
    },
    {
      id: 'peptidoglycan',
      name: 'Peptidoglycan Cell Wall',
      structure: 'Meshwork of alternating NAG and NAM glycan chains cross-linked by D-amino acid tetrapeptide bridges.',
      functionText: 'Protects bacteria against osmotic lysis; thick in Gram-positive (purple crystal violet) and thin + outer LPS in Gram-negative (pink).',
      examNotes: 'Penicillin/β-lactams inhibit transpeptidase cross-linking; lysozyme cleaves β-(1→4) NAG-NAM bonds.',
      cx: 280,
      cy: 118,
    },
    {
      id: 'plasmid',
      name: 'Extrachromosomal Plasmid',
      structure: 'Small, autonomously replicating circular dsDNA molecule carrying ori and accessory genes.',
      functionText: 'Confers horizontal traits such as antibiotic resistance (R-plasmids) via conjugation, transformation, or lab cloning.',
      examNotes: 'Standard molecular biology vectors carry an ori, selectable marker (AmpR), and multiple cloning site (MCS).',
      cx: 105,
      cy: 145,
    },
    {
      id: 'flagellum',
      name: 'Proton-Driven Flagellum',
      structure: 'Extracellular helical flagellin filament anchored to a hook and basal body rotary motor.',
      functionText: 'Rotates 360° powered by proton-motive force (H⁺ gradient) for chemotaxis ("run and tumble").',
      examNotes: 'Unlike eukaryotic 9+2 microtubule flagella (ATP dynein bending), bacterial flagella rotate using H⁺ flux.',
      cx: 310,
      cy: 118,
    },
  ],
};

export function InteractiveCellExplorer() {
  const [cellType, setCellType] = useState<CellTypeKey>('animal');
  const [selectedId, setSelectedId] = useState<string>('mitochondria');

  const organelles = CELL_ORGANELLES[cellType];
  const activeOrg =
    organelles.find((o) => o.id === selectedId) || organelles[0];

  const handleSelectCellType = (type: CellTypeKey) => {
    setCellType(type);
    setSelectedId(CELL_ORGANELLES[type][0].id);
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          {(
            [
              { key: 'animal', label: 'Animal Cell (Eukaryote)' },
              { key: 'plant', label: 'Plant Cell (Eukaryote)' },
              { key: 'bacterial', label: 'Bacterial Cell (Prokaryote)' },
            ] as { key: CellTypeKey; label: string }[]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectCellType(item.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                cellType === item.key
                  ? 'bg-[#F97316] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleSelectCellType('plant')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (Plant Cell)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive SVG Cell Diagram */}
        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
          <svg viewBox="0 0 340 235" className="w-full max-w-md h-auto">
            {cellType === 'animal' && (
              <g>
                <ellipse
                  cx="170"
                  cy="120"
                  rx="115"
                  ry="88"
                  fill="#FFF7ED"
                  stroke="#EA580C"
                  strokeWidth="3.5"
                />
                {/* ER */}
                <path
                  d="M112 88 C95 105, 95 135, 115 150"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Nucleus */}
                <circle cx="155" cy="115" r="32" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
                <circle cx="155" cy="115" r="11" fill="#EA580C" />
                {/* Mitochondrion */}
                <ellipse
                  cx="245"
                  cy="85"
                  rx="22"
                  ry="12"
                  fill="#FDBA74"
                  stroke="#9A3412"
                  strokeWidth="2"
                />
                <path d="M230 85 L238 80 L245 90 L252 80 L260 85" fill="none" stroke="#9A3412" strokeWidth="1.5" />
                {/* Golgi */}
                <path
                  d="M208 148 Q225 140 242 148 M206 156 Q225 148 244 156 M210 164 Q225 156 240 164"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Lysosome */}
                <circle cx="105" cy="175" r="11" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
              </g>
            )}

            {cellType === 'plant' && (
              <g>
                <rect
                  x="45"
                  y="30"
                  width="250"
                  height="175"
                  rx="24"
                  fill="#ECFDF5"
                  stroke="#15803D"
                  strokeWidth="6"
                />
                <rect
                  x="53"
                  y="38"
                  width="234"
                  height="159"
                  rx="18"
                  fill="#F0FDF4"
                  stroke="#86EFAC"
                  strokeWidth="2"
                />
                {/* Central Vacuole */}
                <rect
                  x="125"
                  y="88"
                  width="115"
                  height="86"
                  rx="26"
                  fill="#DBEAFE"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                {/* Nucleus */}
                <circle cx="95" cy="85" r="24" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
                <circle cx="95" cy="85" r="8" fill="#EA580C" />
                {/* Chloroplast */}
                <ellipse cx="245" cy="68" rx="24" ry="13" fill="#86EFAC" stroke="#166534" strokeWidth="2" />
                {/* Mitochondrion */}
                <ellipse cx="100" cy="172" rx="18" ry="10" fill="#FDBA74" stroke="#9A3412" strokeWidth="2" />
              </g>
            )}

            {cellType === 'bacterial' && (
              <g>
                {/* Flagellum */}
                <path
                  d="M282 118 Q305 95 318 118 T336 118"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect
                  x="55"
                  y="65"
                  width="228"
                  height="106"
                  rx="53"
                  fill="#FFF7ED"
                  stroke="#C2410C"
                  strokeWidth="5"
                />
                {/* Nucleoid */}
                <path
                  d="M135 115 C145 92, 185 95, 190 118 C195 140, 140 142, 135 115 Z"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />
                {/* Plasmid */}
                <circle cx="105" cy="145" r="11" fill="none" stroke="#059669" strokeWidth="2.5" />
                {/* Ribosomes */}
                <circle cx="225" cy="95" r="4" fill="#111827" />
                <circle cx="238" cy="105" r="4" fill="#111827" />
                <circle cx="215" cy="108" r="4" fill="#111827" />
              </g>
            )}

            {/* Interactive Clickable Organelle Markers */}
            {organelles.map((org, idx) => {
              const isSelected = activeOrg.id === org.id;
              return (
                <g
                  key={org.id}
                  onClick={() => setSelectedId(org.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={org.cx}
                    cy={org.cy}
                    r={isSelected ? 13 : 10}
                    fill={isSelected ? '#F97316' : '#111827'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text
                    x={org.cx}
                    y={org.cy + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#FFFFFF"
                    fontFamily="monospace"
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {organelles.map((org, idx) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedId(org.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  activeOrg.id === org.id
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                }`}
              >
                {idx + 1}. {org.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Organelle Study Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold text-[#EA580C] block">
              Selected Organelle Study Card
            </span>
            <h3 className="text-xl font-display font-bold text-[#111827]">{activeOrg.name}</h3>

            <div className="space-y-2.5 pt-1 text-xs sm:text-sm">
              <div className="bg-white border border-orange-100 rounded-xl p-3.5">
                <span className="font-bold text-[#111827] block mb-0.5">Ultrastructure</span>
                <p className="text-slate-600 leading-relaxed">{activeOrg.structure}</p>
              </div>

              <div className="bg-white border border-orange-100 rounded-xl p-3.5">
                <span className="font-bold text-[#111827] block mb-0.5">
                  Biochemical Function
                </span>
                <p className="text-slate-600 leading-relaxed">{activeOrg.functionText}</p>
              </div>

              <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5">
                <span className="font-bold text-emerald-900 block mb-0.5">
                  High-Yield Exam Distinction
                </span>
                <p className="text-emerald-950 leading-relaxed">{activeOrg.examNotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
