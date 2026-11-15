import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadBiologyStructuredPdf } from '../../../utils/pdfReportGenerator';
import { BiologyToolShell } from './BiologyToolShell';

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

  const tubeSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'serial-dilution-molarity-calculator') return;
      if (detail.tab === 'c1v1' || detail.tab === 'serial') setTab(detail.tab);
      if (typeof detail.c1 === 'number') setC1(detail.c1);
      if (typeof detail.c1Unit === 'string') setC1Unit(detail.c1Unit as ConcUnit);
      if (typeof detail.c2 === 'number') setC2(detail.c2);
      if (typeof detail.c2Unit === 'string') setC2Unit(detail.c2Unit as ConcUnit);
      if (typeof detail.v2 === 'number') setV2(detail.v2);
      if (typeof detail.v2Unit === 'string') setV2Unit(detail.v2Unit as VolUnit);
      if (typeof detail.startConc === 'number') setStartConc(detail.startConc);
      if (typeof detail.startUnit === 'string') setStartUnit(detail.startUnit as ConcUnit);
      if (typeof detail.dilutionFactor === 'number') setDilutionFactor(detail.dilutionFactor);
      if (typeof detail.transferVolUl === 'number') setTransferVolUl(detail.transferVolUl);
      if (typeof detail.numTubes === 'number') setNumTubes(detail.numTubes);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
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
    const count = Math.min(10, Math.max(2, Math.round(numTubes)));

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

  const handleExportPdf = () => {
    if (tab === 'c1v1') {
      void downloadBiologyStructuredPdf({
        filename: `stock-dilution-${c2}${c2Unit}-${v2}${v2Unit}.pdf`,
        badgeText: 'BIOLOGY · LAB PREPARATION REPORT',
        title: 'Stock Dilution & Buffer Preparation Report (C1V1 = C2V2)',
        subtitle: `Prepare ${v2} ${v2Unit} of ${c2} ${c2Unit} working solution from ${c1} ${c1Unit} stock`,
        parameters: [
          { label: 'Stock Concentration (C1)', value: `${c1} ${c1Unit}` },
          { label: 'Target Concentration (C2)', value: `${c2} ${c2Unit}` },
          { label: 'Final Target Volume (V2)', value: `${v2} ${v2Unit}` },
          { label: 'Governing Equation', value: 'V1 = (C2 x V2) / C1' },
        ],
        kpis: c1v1Calc.valid
          ? [
              { label: 'Stock Volume (V1)', value: c1v1Calc.v1Text || '-', sublabel: 'Pipette from stock', accent: true },
              { label: 'Diluent / Buffer Volume', value: c1v1Calc.diluentText || '-', sublabel: 'V2 - V1 solvent' },
              { label: 'Dilution Factor', value: `1 : ${c1v1Calc.foldDilution?.toFixed(2)}x`, sublabel: 'C1 / C2 ratio' },
            ]
          : [],
        callout: c1v1Calc.valid
          ? {
              title: 'Bench Preparation Protocol',
              body: `Measure ${c1v1Calc.diluentText} of sterile buffer/solvent into a clean vessel, then pipette ${c1v1Calc.v1Text} of your ${c1} ${c1Unit} stock and mix thoroughly to reach ${v2} ${v2Unit} at ${c2} ${c2Unit}.`,
              tone: 'emerald',
            }
          : {
              title: 'Input Error',
              body: c1v1Calc.error || 'Invalid inputs.',
              tone: 'amber',
            },
        workedExample: {
          problem: 'How much 10 mM stock antibiotic (C1) is required to prepare 50 mL (V2) of 25 uM working medium (C2)?',
          steps: [
            'Convert concentrations to a common unit (uM): C1 = 10,000 uM; C2 = 25 uM.',
            'Rearrange C1V1 = C2V2: V1 = (25 uM x 50 mL) / 10,000 uM = 0.125 mL = 125 uL.',
            'Combine 125 uL stock + 49.875 mL sterile medium to reach 50.0 mL.',
          ],
          answer: 'Pipette 125.0 uL of 10 mM stock + 49.875 mL diluent',
        },
      });
    } else {
      void downloadBiologyStructuredPdf({
        filename: `serial-dilution-${serialTable.rows.length}tubes.pdf`,
        badgeText: 'BIOLOGY · SERIAL DILUTION PROTOCOL',
        title: 'Multi-Tube Serial Dilution Bench Protocol',
        subtitle: `${serialTable.rows.length} tubes · 1 : ${serialTable.df} step dilution · Starting stock ${startConc} ${startUnit}`,
        parameters: [
          { label: 'Starting Stock Conc.', value: `${startConc} ${startUnit}` },
          { label: 'Step Dilution Factor', value: `1 : ${serialTable.df} per tube` },
          { label: 'Transfer Volume', value: `${serialTable.vTrans.toFixed(1)} uL` },
          { label: 'Diluent Buffer / Tube', value: `${serialTable.bufferVolUl.toFixed(1)} uL` },
        ],
        svgFigure: {
          title: 'Visual Serial Dilution Tube Gradient',
          svgElement: tubeSvgRef.current,
          maxHeightMm: 46,
        },
        tables: [
          {
            title: 'Step-by-Step Serial Dilution Tube Table',
            headers: ['Tube #', 'Transfer Source', 'Transfer (uL)', 'Buffer (uL)', 'Tube Conc.', 'Cumulative DF'],
            rows: serialTable.rows.map((r) => [
              `Tube ${r.tubeNum}`,
              r.source,
              `${r.transferUl.toFixed(1)} uL`,
              `${r.bufferUl.toFixed(1)} uL`,
              formatAutoConc(r.conc, startUnit),
              `1 : ${r.cumulativeDf.toLocaleString()}`,
            ]),
            colWidths: [14, 20, 16, 16, 18, 16],
            alignRightCols: [2, 3, 4, 5],
            monospaceCols: [2, 3, 4, 5],
          },
        ],
      });
    }
  };

  return (
    <BiologyToolShell
      slug="serial-dilution-molarity-calculator"
      title="Serial Dilution & C₁V₁ = C₂V₂"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab('c1v1')}
            aria-pressed={tab === 'c1v1'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'c1v1' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Dilution (C₁V₁ = C₂V₂)
          </button>
          <button
            type="button"
            onClick={() => setTab('serial')}
            aria-pressed={tab === 'serial'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'serial' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Serial Dilution Series
          </button>
        </div>
      }
      presetsLabel="Lab Presets:"
      presets={[
        {
          label: '250 µM Antibiotic (50 mL)',
          active: tab === 'c1v1' && c1 === 10 && c2 === 250 && v2 === 50,
          onClick: () => {
            setTab('c1v1');
            setC1(10);
            setC1Unit('mM');
            setC2(250);
            setC2Unit('µM');
            setV2(50);
            setV2Unit('mL');
          },
        },
        {
          label: '10× PBS → 1× Buffer (500 mL)',
          active: tab === 'c1v1' && c1 === 10 && c2 === 1 && v2 === 500,
          onClick: () => {
            setTab('c1v1');
            setC1(10);
            setC1Unit('M');
            setC2(1);
            setC2Unit('M');
            setV2(500);
            setV2Unit('mL');
          },
        },
        {
          label: '1:10 Log Serial (6 Tubes)',
          active: tab === 'serial' && dilutionFactor === 10 && numTubes === 6,
          onClick: () => {
            setTab('serial');
            setStartConc(100);
            setStartUnit('mM');
            setDilutionFactor(10);
            setTransferVolUl(100);
            setNumTubes(6);
          },
        },
        {
          label: '1:2 ELISA Standard Curve',
          active: tab === 'serial' && dilutionFactor === 2 && numTubes === 7,
          onClick: () => {
            setTab('serial');
            setStartConc(200);
            setStartUnit('nM');
            setDilutionFactor(2);
            setTransferVolUl(250);
            setNumTubes(7);
          },
        },
      ]}
    >
      {tab === 'c1v1' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <label htmlFor="dil-c1" className="block text-xs font-bold text-slate-700 mb-1">
                Stock Concentration (C₁)
              </label>
              <div className="flex gap-2">
                <input
                  id="dil-c1"
                  type="number"
                  min={0.0001}
                  step="any"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  aria-label="C1 unit"
                  value={c1Unit}
                  onChange={(e) => setC1Unit(e.target.value as ConcUnit)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
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
              <label htmlFor="dil-c2" className="block text-xs font-bold text-slate-700 mb-1">
                Desired Working Concentration (C₂)
              </label>
              <div className="flex gap-2">
                <input
                  id="dil-c2"
                  type="number"
                  min={0.0001}
                  step="any"
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value))}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  aria-label="C2 unit"
                  value={c2Unit}
                  onChange={(e) => setC2Unit(e.target.value as ConcUnit)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
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
              <label htmlFor="dil-v2" className="block text-xs font-bold text-slate-700 mb-1">
                Final Target Volume (V₂)
              </label>
              <div className="flex gap-2">
                <input
                  id="dil-v2"
                  type="number"
                  min={0.001}
                  step="any"
                  value={v2}
                  onChange={(e) => setV2(Number(e.target.value))}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none tabular-nums"
                />
                <select
                  aria-label="V2 unit"
                  value={v2Unit}
                  onChange={(e) => setV2Unit(e.target.value as VolUnit)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:border-[#F97316] focus:outline-none"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div>
              <label htmlFor="ser-conc" className="block text-xs font-bold text-slate-700 mb-1">
                Stock Concentration
              </label>
              <div className="flex gap-2">
                <input
                  id="ser-conc"
                  type="number"
                  min={0.001}
                  step="any"
                  value={startConc}
                  onChange={(e) => setStartConc(Number(e.target.value))}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
                />
                <select
                  aria-label="Stock concentration unit"
                  value={startUnit}
                  onChange={(e) => setStartUnit(e.target.value as ConcUnit)}
                  className="min-h-[44px] px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
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
              <label htmlFor="ser-df" className="block text-xs font-bold text-slate-700 mb-1">
                Step Dilution Factor (1:X)
              </label>
              <input
                id="ser-df"
                type="number"
                min={2}
                max={1000}
                step={1}
                value={dilutionFactor}
                onChange={(e) => setDilutionFactor(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ser-trans" className="block text-xs font-bold text-slate-700 mb-1">
                Transfer Volume per Step (µL)
              </label>
              <input
                id="ser-trans"
                type="number"
                min={1}
                max={50000}
                step={10}
                value={transferVolUl}
                onChange={(e) => setTransferVolUl(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ser-tubes" className="block text-xs font-bold text-slate-700 mb-1">
                Number of Dilution Tubes
              </label>
              <input
                id="ser-tubes"
                type="number"
                min={2}
                max={10}
                value={numTubes}
                onChange={(e) => setNumTubes(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          {/* Visual Tube Gradient Diagram */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 overflow-x-auto">
            <svg
              ref={tubeSvgRef}
              viewBox={`0 0 ${Math.max(460, (serialTable.rows.length + 1) * 70 + 20)} 115`}
              className="w-full min-w-[440px] h-28"
            >
              <rect x="0" y="0" width={Math.max(460, (serialTable.rows.length + 1) * 70 + 20)} height="115" fill="#F9FAFB" />
              {/* Stock Tube */}
              <g>
                <rect x="16" y="24" width="32" height="58" rx="8" fill="#EA580C" stroke="#111827" strokeWidth="1.8" />
                <text x="32" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#111827" fontFamily="monospace">
                  Stock
                </text>
                <text x="32" y="98" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#EA580C" fontFamily="monospace">
                  {startConc} {startUnit}
                </text>
              </g>
              {serialTable.rows.map((r, idx) => {
                const x = 86 + idx * 70;
                const opacity = Math.max(0.12, 0.85 - idx * 0.11);
                return (
                  <g key={r.tubeNum}>
                    <path d={`M ${x - 36} 22 Q ${x - 18} 8 ${x} 22`} fill="none" stroke="#EA580C" strokeWidth="1.6" />
                    <polygon points={`${x + 2},23 ${x - 5},18 ${x - 3},25`} fill="#EA580C" />
                    <text x={x - 18} y="10" textAnchor="middle" fontSize="7.5" fill="#EA580C" fontFamily="monospace">
                      {r.transferUl}µL
                    </text>
                    <rect x={x} y="24" width="32" height="58" rx="8" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.6" />
                    <rect x={x + 2} y="38" width="28" height="42" rx="6" fill="#F97316" fillOpacity={opacity} />
                    <text x={x + 16} y="100" textAnchor="middle" fontSize="8" fontWeight="700" fill="#111827" fontFamily="monospace">
                      T{r.tubeNum}: {formatAutoConc(r.conc, startUnit).split(' ')[0]}
                    </text>
                    <text x={x + 16} y="110" textAnchor="middle" fontSize="7" fill="#64748B" fontFamily="monospace">
                      1:{r.cumulativeDf.toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </svg>
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
    </BiologyToolShell>
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
  const [dilutionExponent, setDilutionExponent] = useState(-5);
  const [volumePlatedMl, setVolumePlatedMl] = useState(0.1);

  const growthSvgRef = useRef<SVGSVGElement | null>(null);
  const plateSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'cell-growth-cfu-calculator') return;
      if (detail.tab === 'growth' || detail.tab === 'cfu') setTab(detail.tab);
      if (typeof detail.n0 === 'number') setN0(detail.n0);
      if (typeof detail.nt === 'number') setNt(detail.nt);
      if (typeof detail.elapsedMinutes === 'number') setElapsedMinutes(detail.elapsedMinutes);
      if (typeof detail.colonies === 'number') setColonies(detail.colonies);
      if (typeof detail.dilutionExponent === 'number') setDilutionExponent(detail.dilutionExponent);
      if (typeof detail.volumePlatedMl === 'number') setVolumePlatedMl(detail.volumePlatedMl);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
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

    const points = Array.from({ length: 25 }, (_, i) => {
      const t = (elapsedMinutes * i) / 24;
      const val = n0 * Math.pow(2, t / doublingTimeMin);
      return { t, val, logVal: Math.log10(val) };
    });

    return { valid: true, generations, doublingTimeMin, muPerHour, points };
  }, [n0, nt, elapsedMinutes]);

  const cfuStats = useMemo(() => {
    const df = Math.pow(10, dilutionExponent);
    const vol = Math.max(0.001, volumePlatedMl);
    const cfuPerMl = colonies / (df * vol);
    const countable = colonies >= 30 && colonies <= 300;
    const statusLabel =
      colonies < 30
        ? 'TFTB — Too Few To Count (< 30 colonies; high Poisson variance)'
        : colonies > 300
        ? 'TNTC — Too Numerous To Count (> 300 colonies; crowding overlap)'
        : 'Optimal Countable Range (30–300 colonies)';
    return { cfuPerMl, countable, statusLabel };
  }, [colonies, dilutionExponent, volumePlatedMl]);

  // Deterministic pseudo-random colony dots for agar plate visual
  const plateDots = useMemo(() => {
    const shown = Math.min(180, Math.max(1, Math.round(colonies)));
    return Array.from({ length: shown }, (_, i) => {
      const angle = i * 2.399963; // golden angle
      const radius = 58 * Math.sqrt((i + 0.5) / shown);
      return {
        cx: 75 + radius * Math.cos(angle),
        cy: 75 + radius * Math.sin(angle),
      };
    });
  }, [colonies]);

  const handleExportPdf = () => {
    if (tab === 'growth') {
      void downloadBiologyStructuredPdf({
        filename: 'bacterial-growth-kinetics-report.pdf',
        badgeText: 'BIOLOGY · MICROBIOLOGY GROWTH REPORT',
        title: 'Bacterial Exponential Growth & Doubling Time Report',
        subtitle: `Log-phase kinetics from N0 = ${n0.toExponential(2)} to Nt = ${nt.toExponential(2)} over ${elapsedMinutes} min`,
        parameters: [
          { label: 'Initial Cell Density (N0)', value: `${n0.toExponential(2)} cells/mL` },
          { label: 'Final Cell Density (Nt)', value: `${nt.toExponential(2)} cells/mL` },
          { label: 'Elapsed Log Time (t)', value: `${elapsedMinutes} minutes (${(elapsedMinutes / 60).toFixed(2)} hr)` },
          { label: 'Growth Equation', value: 'Nt = N0 x 2^n' },
        ],
        kpis: growthStats.valid
          ? [
              { label: 'Generations (n)', value: growthStats.generations?.toFixed(2) || '-', sublabel: 'log2(Nt / N0)' },
              { label: 'Doubling Time (g)', value: `${growthStats.doublingTimeMin?.toFixed(1)} min`, sublabel: 't / n', accent: true },
              { label: 'Specific Growth Rate (mu)', value: `${growthStats.muPerHour?.toFixed(3)} /hr`, sublabel: 'ln(2) / g' },
            ]
          : [],
        svgFigure: {
          title: 'Exponential Bacterial Growth Curve N(t) = N0 · 2^(t/g)',
          svgElement: growthSvgRef.current,
          maxHeightMm: 55,
        },
        workedExample: {
          problem: 'An E. coli culture grows from N0 = 1.0 x 10^4 to Nt = 6.4 x 10^5 cells/mL in 180 minutes. Find doubling time g.',
          steps: [
            'Generations n = log2(6.4 x 10^5 / 1.0 x 10^4) = log2(64) = 6.0 generations.',
            'Doubling time g = t / n = 180 min / 6.0 = 30.0 minutes.',
            'Specific growth rate mu = ln(2) / 0.5 hr = 1.386 hr^-1.',
          ],
          answer: 'n = 6.0 generations · g = 30.0 min · mu = 1.39 hr^-1',
        },
      });
    } else {
      void downloadBiologyStructuredPdf({
        filename: `viable-plate-count-cfu-${colonies}.pdf`,
        badgeText: 'BIOLOGY · VIABLE PLATE COUNT REPORT',
        title: 'Agar Plate Viable Titer (CFU/mL) Report',
        subtitle: `${colonies} colonies at 10^(${dilutionExponent}) dilution · ${volumePlatedMl} mL plated`,
        parameters: [
          { label: 'Colony Count', value: `${colonies} CFU` },
          { label: 'Tube Dilution Plated', value: `10^(${dilutionExponent})` },
          { label: 'Spread / Pour Volume', value: `${volumePlatedMl} mL` },
          { label: 'Formula', value: 'CFU/mL = Colonies / (DF x Volume)' },
        ],
        kpis: [
          { label: 'Original Culture Titer', value: `${cfuStats.cfuPerMl.toExponential(2)} CFU/mL`, sublabel: `${Math.round(cfuStats.cfuPerMl).toLocaleString()} CFU/mL`, accent: true },
          { label: 'Plate Quality Status', value: cfuStats.countable ? 'Countable' : colonies < 30 ? 'TFTC (<30)' : 'TNTC (>300)', sublabel: 'Standard 30-300 rule' },
        ],
        callout: {
          title: 'Microbiology Quality Control Assessment',
          body: cfuStats.statusLabel,
          tone: cfuStats.countable ? 'emerald' : 'amber',
        },
        svgFigure: {
          title: 'Simulated Agar Plate Colony Distribution',
          svgElement: plateSvgRef.current,
          maxHeightMm: 52,
        },
      });
    }
  };

  return (
    <BiologyToolShell
      slug="cell-growth-cfu-calculator"
      title="Bacterial Growth & CFU/mL"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab('growth')}
            aria-pressed={tab === 'growth'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'growth' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exponential Growth
          </button>
          <button
            type="button"
            onClick={() => setTab('cfu')}
            aria-pressed={tab === 'cfu'}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              tab === 'cfu' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Viable Plate (CFU/mL)
          </button>
        </div>
      }
      presetsLabel="Culture Presets:"
      presets={[
        {
          label: 'E. coli LB Broth (30 min)',
          active: tab === 'growth' && n0 === 2.5e5 && nt === 1.6e7,
          onClick: () => {
            setTab('growth');
            setN0(2.5e5);
            setNt(1.6e7);
            setElapsedMinutes(180);
          },
        },
        {
          label: 'S. cerevisiae Yeast (90 min)',
          active: tab === 'growth' && n0 === 1.0e5 && nt === 1.6e6,
          onClick: () => {
            setTab('growth');
            setN0(1.0e5);
            setNt(1.6e6);
            setElapsedMinutes(360);
          },
        },
        {
          label: 'Countable Plate (148 CFU @ 10⁻⁵)',
          active: tab === 'cfu' && colonies === 148,
          onClick: () => {
            setTab('cfu');
            setColonies(148);
            setDilutionExponent(-5);
            setVolumePlatedMl(0.1);
          },
        },
        {
          label: 'TNTC Overcrowded (420 CFU)',
          active: tab === 'cfu' && colonies === 420,
          onClick: () => {
            setTab('cfu');
            setColonies(420);
            setDilutionExponent(-3);
            setVolumePlatedMl(0.1);
          },
        },
      ]}
    >
      {tab === 'growth' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <label htmlFor="cg-n0" className="block text-xs font-bold text-slate-700 mb-1">
                Initial Cell Density N₀ (cells/mL or OD₆₀₀)
              </label>
              <input
                id="cg-n0"
                type="number"
                min={0.001}
                step="any"
                value={n0}
                onChange={(e) => setN0(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cg-nt" className="block text-xs font-bold text-slate-700 mb-1">
                Final Cell Density Nₜ (cells/mL or OD₆₀₀)
              </label>
              <input
                id="cg-nt"
                type="number"
                min={0.002}
                step="any"
                value={nt}
                onChange={(e) => setNt(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cg-time" className="block text-xs font-bold text-slate-700 mb-1">
                Elapsed Log-Phase Time t (minutes)
              </label>
              <input
                id="cg-time"
                type="number"
                min={1}
                step={5}
                value={elapsedMinutes}
                onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
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
                  <svg ref={growthSvgRef} viewBox="0 0 420 150" className="w-full h-36">
                    <rect x="0" y="0" width="420" height="150" fill="#F9FAFB" />
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
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <label htmlFor="cfu-colonies" className="block text-xs font-bold text-slate-700 mb-1">
                Counted Colonies on Agar Plate
              </label>
              <input
                id="cfu-colonies"
                type="number"
                min={1}
                max={2000}
                value={colonies}
                onChange={(e) => setColonies(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cfu-df" className="block text-xs font-bold text-slate-700 mb-1">
                Tube Dilution Plated (10ⁿ)
              </label>
              <select
                id="cfu-df"
                value={dilutionExponent}
                onChange={(e) => setDilutionExponent(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:border-[#F97316] focus:outline-none"
              >
                {[-1, -2, -3, -4, -5, -6, -7, -8, -9].map((exp) => (
                  <option key={exp} value={exp}>
                    10^{exp} (1 : {(10 ** Math.abs(exp)).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cfu-vol" className="block text-xs font-bold text-slate-700 mb-1">
                Volume Spread / Plated (mL)
              </label>
              <input
                id="cfu-vol"
                type="number"
                min={0.01}
                max={5}
                step={0.05}
                value={volumePlatedMl}
                onChange={(e) => setVolumePlatedMl(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center tabular-nums">
            <div className="sm:col-span-5 flex flex-col items-center bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <svg ref={plateSvgRef} viewBox="0 0 150 150" className="w-36 h-36">
                <circle cx="75" cy="75" r="68" fill="#FEF3C7" stroke="#94A3B8" strokeWidth="3" />
                <circle cx="75" cy="75" r="62" fill="#FFFBEB" stroke="#E2E8F0" strokeWidth="1" />
                {plateDots.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={colonies > 300 ? 1.8 : 2.3}
                    fill={cfuStats.countable ? '#EA580C' : colonies < 30 ? '#0284C7' : '#DC2626'}
                    fillOpacity="0.85"
                  />
                ))}
              </svg>
              <span className="text-[11px] font-mono text-slate-600 mt-1">
                Agar Plate Preview ({colonies} CFU)
              </span>
            </div>

            <div className="sm:col-span-7 space-y-3">
              <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-1.5">
                <span className="text-xs font-bold text-[#EA580C] block">
                  Original Culture Viable Titer (CFU/mL)
                </span>
                <p className="text-2xl font-mono font-bold text-[#111827]">
                  {cfuStats.cfuPerMl.toExponential(2)} CFU/mL
                </p>
                <p className="text-xs font-mono text-slate-600">
                  = {Math.round(cfuStats.cfuPerMl).toLocaleString()} CFU per mL
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
        </div>
      )}
    </BiologyToolShell>
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
  const reticleSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'microscope-fov-calculator') return;
      if (typeof detail.ocularMag === 'number') setOcularMag(detail.ocularMag);
      if (typeof detail.calibObjMag === 'number') setCalibObjMag(detail.calibObjMag);
      if (typeof detail.calibFovMm === 'number') setCalibFovMm(detail.calibFovMm);
      if (typeof detail.workingObjMag === 'number') setWorkingObjMag(detail.workingObjMag);
      if (typeof detail.cellsAcrossDiameter === 'number') setCellsAcrossDiameter(detail.cellsAcrossDiameter);
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const handleReset = () => {
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
    const percentOccupied = Math.min(100, 100 / Math.max(1, cellsAcrossDiameter));

    return {
      m1,
      m2,
      fov2Mm,
      fov2Um,
      cellSizeUm,
      percentOccupied,
    };
  }, [ocularMag, calibObjMag, calibFovMm, workingObjMag, cellsAcrossDiameter]);

  const handleExportPdf = () => {
    void downloadBiologyStructuredPdf({
      filename: `microscope-fov-${fovData.m2}x.pdf`,
      badgeText: 'BIOLOGY · MICROSCOPY LAB REPORT',
      title: 'Compound Microscope FOV & Specimen Size Report',
      subtitle: `${fovData.m2}x Total Magnification (${ocularMag}x Ocular × ${workingObjMag}x Objective)`,
      parameters: [
        { label: 'Calibrated Low Power (M1 / FOV1)', value: `${fovData.m1}x · ${calibFovMm.toFixed(2)} mm` },
        { label: 'Working Magnification (M2)', value: `${fovData.m2}x (${ocularMag}x × ${workingObjMag}x)` },
        { label: 'Cells Across FOV Diameter', value: `${cellsAcrossDiameter} specimens` },
        { label: 'Governing Scaling Law', value: 'FOV2 = FOV1 x (M1 / M2)' },
      ],
      kpis: [
        { label: 'Total Magnification', value: `${fovData.m2}x`, sublabel: `${ocularMag}x ocular × ${workingObjMag}x obj` },
        { label: 'Working FOV Diameter', value: `${fovData.fov2Um.toFixed(1)} um`, sublabel: `${fovData.fov2Mm.toFixed(3)} mm` },
        { label: 'Estimated Specimen Length', value: `${fovData.cellSizeUm.toFixed(1)} um`, sublabel: `${fovData.percentOccupied.toFixed(1)}% of FOV diameter`, accent: true },
      ],
      svgFigure: {
        title: 'Ocular Reticle Field-of-View Simulation',
        svgElement: reticleSvgRef.current,
        maxHeightMm: 62,
      },
      workedExample: {
        problem: 'With a 10x ocular and 4x objective, FOV1 = 4.5 mm. Find FOV2 at 40x objective and length of a cell spanning 25% of FOV2.',
        steps: [
          'Total magnification increases 10-fold from M1 = 40x to M2 = 400x.',
          'FOV2 = 4.5 mm x (40 / 400) = 0.45 mm = 450 um.',
          'Specimen length = 25% x 450 um = 112.5 um.',
        ],
        answer: '400x Total Mag · FOV = 450 um · Specimen Length = 112.5 um',
      },
    });
  };

  return (
    <BiologyToolShell
      slug="microscope-fov-calculator"
      title="Microscope FOV & Specimen Micrometer"
      subtitle="Inversely scales field diameter with objective power: FOV₂ = FOV₁ × (M₁ / M₂)."
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      presetsLabel="Slide Specimens:"
      presets={[
        {
          label: 'Human Cheek Cell (400×)',
          active: workingObjMag === 40 && cellsAcrossDiameter === 6,
          onClick: handleReset,
        },
        {
          label: 'Onion Epidermis (400×)',
          active: workingObjMag === 40 && cellsAcrossDiameter === 2,
          onClick: () => {
            setOcularMag(10);
            setCalibObjMag(4);
            setCalibFovMm(4.5);
            setWorkingObjMag(40);
            setCellsAcrossDiameter(2);
          },
        },
        {
          label: 'Red Blood Cell (1000× Oil)',
          active: workingObjMag === 100 && cellsAcrossDiameter === 24,
          onClick: () => {
            setOcularMag(10);
            setCalibObjMag(4);
            setCalibFovMm(4.5);
            setWorkingObjMag(100);
            setCellsAcrossDiameter(24);
          },
        },
        {
          label: 'Paramecium (100×)',
          active: workingObjMag === 10 && cellsAcrossDiameter === 8,
          onClick: () => {
            setOcularMag(10);
            setCalibObjMag(4);
            setCalibFovMm(4.5);
            setWorkingObjMag(10);
            setCellsAcrossDiameter(8);
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fov-ocular" className="block text-xs font-bold text-slate-700 mb-1">
                Ocular Lens (×)
              </label>
              <select
                id="fov-ocular"
                value={ocularMag}
                onChange={(e) => setOcularMag(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              >
                {[5, 10, 15, 20].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fov-calib-obj" className="block text-xs font-bold text-slate-700 mb-1">
                Calibrated Low Obj (×)
              </label>
              <select
                id="fov-calib-obj"
                value={calibObjMag}
                onChange={(e) => setCalibObjMag(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
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
            <label htmlFor="fov-low-mm" className="block text-xs font-bold text-slate-700 mb-1">
              Measured Low-Power FOV₁ Diameter (mm)
            </label>
            <input
              id="fov-low-mm"
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={calibFovMm}
              onChange={(e) => setCalibFovMm(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1">
              Active Working Objective Lens (×)
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[4, 10, 40, 100].map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => setWorkingObjMag(obj)}
                  aria-pressed={workingObjMag === obj}
                  className={`min-h-[44px] py-2 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-colors ${
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
            <label htmlFor="fov-cells-across" className="block text-xs font-bold text-slate-700 mb-1">
              Cells Fitting End-to-End Across FOV Diameter
            </label>
            <input
              id="fov-cells-across"
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              value={cellsAcrossDiameter}
              onChange={(e) => setCellsAcrossDiameter(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums focus:border-[#F97316] focus:outline-none"
            />
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Ocular Reticle SVG */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <svg ref={reticleSvgRef} viewBox="0 0 200 200" className="w-44 h-44">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="#FFF7ED"
                stroke="#111827"
                strokeWidth="5"
              />
              <line
                x1="14"
                y1="100"
                x2="186"
                y2="100"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
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
    </BiologyToolShell>
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
  const cellSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      if (detail?.slug !== 'interactive-cell-explorer') return;
      if (detail.cellType === 'animal' || detail.cellType === 'plant' || detail.cellType === 'bacterial') {
        const key = detail.cellType;
        setCellType(key);
        const targetOrg =
          typeof detail.organelleId === 'string'
            ? CELL_ORGANELLES[key].find((o) => o.id === detail.organelleId)
            : undefined;
        setSelectedId(targetOrg ? targetOrg.id : CELL_ORGANELLES[key][0].id);
      }
    };
    window.addEventListener('ut-bio-load-preset', handler as EventListener);
    return () => window.removeEventListener('ut-bio-load-preset', handler as EventListener);
  }, []);

  const organelles = CELL_ORGANELLES[cellType];
  const activeOrg = organelles.find((o) => o.id === selectedId) || organelles[0];

  const handleSelectCellType = (type: CellTypeKey) => {
    setCellType(type);
    setSelectedId(CELL_ORGANELLES[type][0].id);
  };

  const handleReset = () => {
    setCellType('animal');
    setSelectedId('mitochondria');
  };

  const handleExportPdf = () => {
    const cellLabel =
      cellType === 'animal'
        ? 'Animal Eukaryotic Cell'
        : cellType === 'plant'
        ? 'Plant Eukaryotic Cell'
        : 'Bacterial Prokaryotic Cell';
    void downloadBiologyStructuredPdf({
      filename: `cell-explorer-${cellType}-${activeOrg.id}.pdf`,
      badgeText: 'BIOLOGY · CELL ULTRASTRUCTURE STUDY GUIDE',
      title: `${cellLabel} — Organelle Ultrastructure Report`,
      subtitle: `Featured Organelle: ${activeOrg.name} · University-Tutors.com Study Guide`,
      parameters: [
        { label: 'Active Cell Model', value: cellLabel },
        { label: 'Inspected Organelle', value: activeOrg.name },
      ],
      callout: {
        title: `High-Yield Exam Distinction (${activeOrg.name})`,
        body: activeOrg.examNotes,
        tone: 'emerald',
      },
      svgFigure: {
        title: `Interactive ${cellLabel} Schematic`,
        svgElement: cellSvgRef.current,
        maxHeightMm: 62,
      },
      tables: [
        {
          title: `Complete ${cellLabel} Organelle Reference`,
          headers: ['#', 'Organelle', 'Ultrastructure', 'Biochemical Function'],
          rows: organelles.map((o, idx) => [
            String(idx + 1),
            o.name,
            o.structure,
            o.functionText,
          ]),
          colWidths: [6, 24, 35, 35],
          monospaceCols: [0],
        },
      ],
    });
  };

  return (
    <BiologyToolShell
      slug="interactive-cell-explorer"
      title="Interactive Cell Organelle Explorer"
      onReset={handleReset}
      onExportPdf={handleExportPdf}
      headerControls={
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 max-w-full overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'animal', label: 'Animal Cell' },
              { key: 'plant', label: 'Plant Cell' },
              { key: 'bacterial', label: 'Bacterial Cell' },
            ] as { key: CellTypeKey; label: string }[]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectCellType(item.key)}
              aria-pressed={cellType === item.key}
              className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                cellType === item.key
                  ? 'bg-[#F97316] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
      presetsLabel="Exam Focus:"
      presets={[
        {
          label: 'Animal Mitochondria (ATP)',
          active: cellType === 'animal' && activeOrg.id === 'mitochondria',
          onClick: () => {
            setCellType('animal');
            setSelectedId('mitochondria');
          },
        },
        {
          label: 'Animal Secretory (RER → Golgi)',
          active: cellType === 'animal' && activeOrg.id === 'golgi',
          onClick: () => {
            setCellType('animal');
            setSelectedId('golgi');
          },
        },
        {
          label: 'Plant Chloroplast + Vacuole',
          active: cellType === 'plant' && activeOrg.id === 'chloroplast',
          onClick: () => {
            setCellType('plant');
            setSelectedId('chloroplast');
          },
        },
        {
          label: 'Bacterial 70S & Peptidoglycan',
          active: cellType === 'bacterial' && activeOrg.id === 'ribosome70s',
          onClick: () => {
            setCellType('bacterial');
            setSelectedId('ribosome70s');
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive SVG Cell Diagram */}
        <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
          <svg ref={cellSvgRef} viewBox="0 0 340 235" className="w-full max-w-md h-auto">
            <rect x="0" y="0" width="340" height="235" fill="#F9FAFB" />
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
                <path
                  d="M112 88 C95 105, 95 135, 115 150"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="155" cy="115" r="32" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
                <circle cx="155" cy="115" r="11" fill="#EA580C" />
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
                <path
                  d="M208 148 Q225 140 242 148 M206 156 Q225 148 244 156 M210 164 Q225 156 240 164"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
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
                <circle cx="95" cy="85" r="24" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
                <circle cx="95" cy="85" r="8" fill="#EA580C" />
                <ellipse cx="245" cy="68" rx="24" ry="13" fill="#86EFAC" stroke="#166534" strokeWidth="2" />
                <ellipse cx="100" cy="172" rx="18" ry="10" fill="#FDBA74" stroke="#9A3412" strokeWidth="2" />
              </g>
            )}

            {cellType === 'bacterial' && (
              <g>
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
                <path
                  d="M135 115 C145 92, 185 95, 190 118 C195 140, 140 142, 135 115 Z"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />
                <circle cx="105" cy="145" r="11" fill="none" stroke="#059669" strokeWidth="2.5" />
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
                    r={isSelected ? 14 : 11}
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
                aria-pressed={activeOrg.id === org.id}
                className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
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
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 sm:p-5 space-y-3">
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
    </BiologyToolShell>
  );
}
