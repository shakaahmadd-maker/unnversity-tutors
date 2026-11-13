import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';

// ============================================================================
// 11. SHANNON-WIENER & SIMPSON BIODIVERSITY INDEX CALCULATOR
// ============================================================================
interface SpeciesRow {
  id: string;
  name: string;
  count: number;
}

const DEFAULT_SPECIES: SpeciesRow[] = [
  { id: 'sp-1', name: 'Quercus alba (White Oak)', count: 42 },
  { id: 'sp-2', name: 'Acer saccharum (Sugar Maple)', count: 35 },
  { id: 'sp-3', name: 'Fagus grandifolia (American Beech)', count: 28 },
  { id: 'sp-4', name: 'Betula alleghaniensis (Yellow Birch)', count: 19 },
  { id: 'sp-5', name: 'Tsuga canadensis (Eastern Hemlock)', count: 16 },
];

export function BiodiversityIndexCalculator() {
  const [speciesList, setSpeciesList] = useState<SpeciesRow[]>(DEFAULT_SPECIES);

  const loadExample = () => setSpeciesList(DEFAULT_SPECIES);

  const addSpecies = () => {
    setSpeciesList((prev) => [
      ...prev,
      { id: `sp-${Date.now()}`, name: `Species ${prev.length + 1}`, count: 10 },
    ]);
  };

  const updateRow = (id: string, patch: Partial<SpeciesRow>) => {
    setSpeciesList((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    if (speciesList.length <= 2) return;
    setSpeciesList((prev) => prev.filter((r) => r.id !== id));
  };

  const metrics = useMemo(() => {
    const valid = speciesList.filter((s) => s.count > 0);
    const S = valid.length;
    const N = valid.reduce((acc, s) => acc + s.count, 0);

    if (S === 0 || N === 0) {
      return {
        S: 0,
        N: 0,
        shannonH: 0,
        hMax: 0,
        evennessE: 0,
        simpsonD: 0,
        simpsonDiversity: 0,
        simpsonReciprocal: 0,
        rows: [],
      };
    }

    let shannonSum = 0;
    let simpsonFiniteSum = 0;

    const rows = valid.map((sp) => {
      const p = sp.count / N;
      const lnP = Math.log(p);
      const pLnP = p * lnP;
      shannonSum += -pLnP;
      simpsonFiniteSum += sp.count * (sp.count - 1);
      return { ...sp, p, lnP, pLnP };
    });

    const hMax = S > 1 ? Math.log(S) : 0;
    const evennessE = hMax > 0 ? shannonSum / hMax : 1;
    const simpsonD = N > 1 ? simpsonFiniteSum / (N * (N - 1)) : 1;
    const simpsonDiversity = 1 - simpsonD;
    const simpsonReciprocal = simpsonD > 0 ? 1 / simpsonD : S;

    return {
      S,
      N,
      shannonH: shannonSum,
      hMax,
      evennessE,
      simpsonD,
      simpsonDiversity,
      simpsonReciprocal,
      rows,
    };
  }, [speciesList]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-display font-bold text-[#111827]">
            Ecological Quadrat &amp; Community Diversity Solver
          </h2>
          <p className="text-xs text-slate-500">
            Computes Shannon-Wiener (H′), Pielou Evenness (J′), and finite-sample Simpson’s Diversity (1 − D).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addSpecies}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F9FAFB] hover:bg-slate-100 border border-slate-200 text-[#111827] text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Species</span>
          </button>
          <button
            type="button"
            onClick={loadExample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Example</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-[#EA580C] block">
            Shannon Index (H′)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.shannonH.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">H′max = {metrics.hMax.toFixed(3)}</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Pielou Evenness (E)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.evennessE.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">Scale 0 (skewed) → 1 (even)</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Simpson Index (1 − D)
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-700">
            {metrics.simpsonDiversity.toFixed(3)}
          </span>
          <span className="text-[11px] text-slate-500 block">1/D = {metrics.simpsonReciprocal.toFixed(2)}</span>
        </div>

        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 block">
            Richness (S) / Total (N)
          </span>
          <span className="text-2xl font-mono font-bold text-[#111827]">
            {metrics.S} / {metrics.N}
          </span>
          <span className="text-[11px] text-slate-500 block">Sampled organisms</span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse tabular-nums">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-bold text-slate-600">
              <th className="py-3 px-4">Taxon / Species Name</th>
              <th className="py-3 px-4 w-32">Count (nᵢ)</th>
              <th className="py-3 px-4">Proportion (pᵢ)</th>
              <th className="py-3 px-4">−pᵢ · ln(pᵢ)</th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {speciesList.map((row) => {
              const calc = metrics.rows.find((r) => r.id === row.id);
              return (
                <tr key={row.id}>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={0}
                      value={row.count}
                      onChange={(e) => updateRow(row.id, { count: Math.max(0, Number(e.target.value)) })}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono focus:border-[#F97316] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-700">
                    {calc ? calc.p.toFixed(4) : '0.0000'}
                  </td>
                  <td className="py-2 px-4 font-mono font-semibold text-[#EA580C]">
                    {calc ? (-calc.pLnP).toFixed(4) : '0.0000'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={speciesList.length <= 2}
                      aria-label="Remove species"
                      className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 12. PLANT WATER POTENTIAL (Ψ = Ψs + Ψp) & OSMOLARITY CALCULATOR
// ============================================================================
export function WaterPotentialOsmolarityCalculator() {
  const [ionizationFactor, setIonizationFactor] = useState(1); // Sucrose = 1, NaCl = 2
  const [molarityC, setMolarityC] = useState(0.3);
  const [tempCelsius, setTempCelsius] = useState(22);
  const [pressureBar, setPressureBar] = useState(2.5);
  const [externalPsiBar, setExternalPsiBar] = useState(-3.5);

  const loadExample = () => {
    setIonizationFactor(1);
    setMolarityC(0.3);
    setTempCelsius(22);
    setPressureBar(2.5);
    setExternalPsiBar(-3.5);
  };

  const psiCalc = useMemo(() => {
    const R = 0.0831; // L·bar / (mol·K)
    const tempK = tempCelsius + 273.15;
    const psiS = -ionizationFactor * molarityC * R * tempK;
    const totalCellPsi = psiS + pressureBar;
    const totalCellMpa = totalCellPsi * 0.1;
    const deltaPsi = externalPsiBar - totalCellPsi;

    let direction: 'into' | 'out' | 'equilibrium' = 'equilibrium';
    let tonicityLabel = 'Isotonic Dynamic Equilibrium (No Net Osmotic Flux)';
    if (Math.abs(deltaPsi) < 0.05) {
      direction = 'equilibrium';
    } else if (externalPsiBar > totalCellPsi) {
      direction = 'into';
      tonicityLabel = 'Hypotonic Surroundings → Net Water Flows INTO Cell (Turgid)';
    } else {
      direction = 'out';
      tonicityLabel = 'Hypertonic Surroundings → Net Water Flows OUT OF Cell (Plasmolysis Risk)';
    }

    return {
      tempK,
      psiS,
      totalCellPsi,
      totalCellMpa,
      direction,
      tonicityLabel,
      osmolarity: ionizationFactor * molarityC,
    };
  }, [ionizationFactor, molarityC, tempCelsius, pressureBar, externalPsiBar]);

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-display font-bold text-[#111827]">
            Solute Potential (Ψs = −iCRT) &amp; Osmotic Direction Predictor
          </h2>
          <p className="text-xs text-slate-500">
            Water always moves passively from HIGHER (less negative) Ψ toward LOWER (more negative) Ψ.
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Van ’t Hoff Ionization Constant (i)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: 'i = 1 (Sucrose)' },
                { val: 2, label: 'i = 2 (NaCl)' },
                { val: 3, label: 'i = 3 (CaCl₂)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setIonizationFactor(opt.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    ionizationFactor === opt.val
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Molarity C (M)
              </label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.05}
                value={molarityC}
                onChange={(e) => setMolarityC(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                min={-10}
                max={100}
                step={1}
                value={tempCelsius}
                onChange={(e) => setTempCelsius(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Turgor Pressure Ψp (bars)
              </label>
              <input
                type="number"
                step={0.5}
                value={pressureBar}
                onChange={(e) => setPressureBar(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                External Bath Ψext (bars)
              </label>
              <input
                type="number"
                step={0.5}
                value={externalPsiBar}
                onChange={(e) => setExternalPsiBar(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 tabular-nums">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Solute Potential (Ψs)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {psiCalc.psiS.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-500 block">
                Osmolarity: {psiCalc.osmolarity.toFixed(2)} Osm/L
              </span>
            </div>

            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Total Cell Ψ (Ψs + Ψp)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {psiCalc.totalCellPsi.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-600 block">
                = {psiCalc.totalCellMpa.toFixed(3)} MPa
              </span>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                External Bath Ψext
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {externalPsiBar.toFixed(2)} bar
              </span>
              <span className="text-[11px] text-slate-500 block">
                T = {psiCalc.tempK.toFixed(2)} K
              </span>
            </div>
          </div>

          {/* Visual Osmotic Beaker Diagram */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <svg viewBox="0 0 220 130" className="w-48 h-28 shrink-0">
              <rect x="20" y="15" width="180" height="100" rx="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
              <rect x="70" y="38" width="80" height="54" rx="12" fill="#DCFCE7" stroke="#15803D" strokeWidth="3" />
              <text x="110" y="62" textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532D" fontFamily="monospace">
                Cell Ψ={psiCalc.totalCellPsi.toFixed(1)}
              </text>
              <text x="110" y="77" textAnchor="middle" fontSize="9" fill="#166534" fontFamily="monospace">
                Bath Ψ={externalPsiBar.toFixed(1)}
              </text>
              {psiCalc.direction === 'into' && (
                <>
                  <path d="M35 65 L64 65" stroke="#EA580C" strokeWidth="3" />
                  <polygon points="66,65 58,60 58,70" fill="#EA580C" />
                  <path d="M185 65 L156 65" stroke="#EA580C" strokeWidth="3" />
                  <polygon points="154,65 162,60 162,70" fill="#EA580C" />
                </>
              )}
              {psiCalc.direction === 'out' && (
                <>
                  <path d="M66 65 L37 65" stroke="#DC2626" strokeWidth="3" />
                  <polygon points="34,65 42,60 42,70" fill="#DC2626" />
                  <path d="M154 65 L183 65" stroke="#DC2626" strokeWidth="3" />
                  <polygon points="186,65 178,60 178,70" fill="#DC2626" />
                </>
              )}
            </svg>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Predicted Net Osmotic Flux</span>
              </div>
              <p className="text-sm font-bold text-[#111827]">{psiCalc.tonicityLabel}</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Since External Ψ ({externalPsiBar.toFixed(2)} bar) vs. Cell Ψ (
                {psiCalc.totalCellPsi.toFixed(2)} bar), water moves toward the more negative
                potential until turgor pressure balances the gradient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 13. HUMAN PHYSIOLOGY CALCULATOR SUITE (CO, MAP, BMR, SPIROMETRY)
// ============================================================================
export function HumanPhysiologyCalculators() {
  const [tab, setTab] = useState<'cardiac' | 'map' | 'bmr' | 'lung'>('cardiac');

  // Cardiac Output
  const [hr, setHr] = useState(72);
  const [edv, setEdv] = useState(125);
  const [esv, setEsv] = useState(55);

  // MAP
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);

  // BMR
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [weightKg, setWeightKg] = useState(64);
  const [heightCm, setHeightCm] = useState(168);
  const [ageYr, setAgeYr] = useState(21);
  const [activityFactor, setActivityFactor] = useState(1.55);

  // Spirometry
  const [tvMl, setTvMl] = useState(500);
  const [irvMl, setIrvMl] = useState(3000);
  const [ervMl, setErvMl] = useState(1100);
  const [rvMl, setRvMl] = useState(1200);
  const [fev1L, setFev1L] = useState(3.8);
  const [fvcL, setFvcL] = useState(4.6);

  const loadExample = () => {
    setHr(72);
    setEdv(125);
    setEsv(55);
    setSystolic(120);
    setDiastolic(80);
    setSex('female');
    setWeightKg(64);
    setHeightCm(168);
    setAgeYr(21);
    setActivityFactor(1.55);
    setTvMl(500);
    setIrvMl(3000);
    setErvMl(1100);
    setRvMl(1200);
    setFev1L(3.8);
    setFvcL(4.6);
  };

  const sv = Math.max(1, edv - esv);
  const coLMin = (hr * sv) / 1000;
  const efPercent = (sv / Math.max(1, edv)) * 100;

  const pulsePressure = systolic - diastolic;
  const mapMmHg = diastolic + pulsePressure / 3;

  const bmrKcal =
    10 * weightKg + 6.25 * heightCm - 5 * ageYr + (sex === 'male' ? 5 : -161);
  const tdeeKcal = bmrKcal * activityFactor;

  const vcMl = tvMl + irvMl + ervMl;
  const tlcMl = vcMl + rvMl;
  const fev1FvcRatio = (fev1L / Math.max(0.1, fvcL)) * 100;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          {(
            [
              { id: 'cardiac', label: 'Cardiac Output (CO & EF)' },
              { id: 'map', label: 'Mean Arterial Pressure (MAP)' },
              { id: 'bmr', label: 'Basal Metabolic Rate (BMR)' },
              { id: 'lung', label: 'Spirometry & FEV₁/FVC' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                tab === item.id ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      {tab === 'cardiac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Heart Rate HR (beats/min)
              </label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">EDV (mL)</label>
                <input
                  type="number"
                  value={edv}
                  onChange={(e) => setEdv(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESV (mL)</label>
                <input
                  type="number"
                  value={esv}
                  onChange={(e) => setEsv(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Cardiac Output (CO)
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827]">
                {coLMin.toFixed(2)} L/min
              </span>
              <span className="text-xs text-slate-500 block">{hr * sv} mL/min</span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Stroke Volume (SV = EDV − ESV)
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827]">
                {sv} mL/beat
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Ejection Fraction (SV / EDV)
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-700">
                {efPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 block">Normal: 55%–70%</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-[#EA580C] block">
                Mean Arterial Pressure (MAP = DP + ⅓PP)
              </span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {mapMmHg.toFixed(1)} mmHg
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                {mapMmHg >= 65 && mapMmHg <= 100
                  ? 'Adequate organ perfusion range (65–100 mmHg)'
                  : mapMmHg < 65
                  ? 'Below 65 mmHg renal/cerebral autoregulation threshold'
                  : 'Elevated systemic arterial pressure (> 100 mmHg)'}
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-500 block">
                Pulse Pressure (SP − DP)
              </span>
              <span className="text-3xl font-mono font-bold text-[#111827] mt-1 block">
                {pulsePressure} mmHg
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Arterial reading: {systolic}/{diastolic} mmHg
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'bmr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physiological Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'female' | 'male')}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              >
                <option value="female">Female (−161)</option>
                <option value="male">Male (+5)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age (years)</label>
              <input
                type="number"
                value={ageYr}
                onChange={(e) => setAgeYr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mass (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activity Multiplier (PAL)
              </label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              >
                <option value={1.2}>1.20 — Sedentary (resting / desk study)</option>
                <option value={1.375}>1.375 — Light activity (1–3 days/wk)</option>
                <option value={1.55}>1.55 — Moderate exercise (3–5 days/wk)</option>
                <option value={1.725}>1.725 — Vigorous training (6–7 days/wk)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-[#EA580C] block">
                Mifflin-St Jeor BMR
              </span>
              <span className="text-2xl font-mono font-bold text-[#111827] mt-1 block">
                {Math.round(bmrKcal).toLocaleString()} kcal/day
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                = {Math.round(bmrKcal * 4.184).toLocaleString()} kJ/day resting
              </span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-500 block">
                Total Daily Expenditure (TDEE)
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-700 mt-1 block">
                {Math.round(tdeeKcal).toLocaleString()} kcal/day
              </span>
              <span className="text-xs text-slate-500 block mt-1">PAL × BMR</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'lung' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center tabular-nums">
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tidal Vol TV (mL)</label>
              <input
                type="number"
                value={tvMl}
                onChange={(e) => setTvMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IRV (mL)</label>
              <input
                type="number"
                value={irvMl}
                onChange={(e) => setIrvMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ERV (mL)</label>
              <input
                type="number"
                value={ervMl}
                onChange={(e) => setErvMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residual RV (mL)</label>
              <input
                type="number"
                value={rvMl}
                onChange={(e) => setRvMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">FEV₁ (L)</label>
              <input
                type="number"
                step={0.1}
                value={fev1L}
                onChange={(e) => setFev1L(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">FVC (L)</label>
              <input
                type="number"
                step={0.1}
                value={fvcL}
                onChange={(e) => setFvcL(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                Vital Capacity (VC)
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {vcMl.toLocaleString()} mL
              </span>
              <span className="text-xs text-slate-500 block">{(vcMl / 1000).toFixed(2)} L</span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">
                Total Lung Capacity
              </span>
              <span className="text-xl font-mono font-bold text-[#111827]">
                {tlcMl.toLocaleString()} mL
              </span>
              <span className="text-xs text-slate-500 block">VC + RV</span>
            </div>
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block">FEV₁ / FVC Ratio</span>
              <span className="text-xl font-mono font-bold text-emerald-700">
                {fev1FvcRatio.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 block">
                {fev1FvcRatio >= 70 ? 'Normal (≥70%)' : 'Obstructive (<70%)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 14. TAXONOMIC RANK & DICHOTOMOUS KEY BUILDER
// ============================================================================
interface TaxonPreset {
  label: string;
  domain: string;
  kingdom: string;
  phylum: string;
  classRank: string;
  order: string;
  family: string;
  genus: string;
  speciesEpithet: string;
  authority: string;
}

const TAXON_PRESETS: TaxonPreset[] = [
  {
    label: 'Homo sapiens (Human)',
    domain: 'Eukarya',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    classRank: 'Mammalia',
    order: 'Primates',
    family: 'Hominidae',
    genus: 'Homo',
    speciesEpithet: 'sapiens',
    authority: 'Linnaeus, 1758',
  },
  {
    label: 'Arabidopsis thaliana (Thale Cress)',
    domain: 'Eukarya',
    kingdom: 'Plantae',
    phylum: 'Tracheophyta',
    classRank: 'Magnoliopsida',
    order: 'Brassicales',
    family: 'Brassicaceae',
    genus: 'Arabidopsis',
    speciesEpithet: 'thaliana',
    authority: '(L.) Heynh., 1842',
  },
  {
    label: 'Escherichia coli (Model Bacterium)',
    domain: 'Bacteria',
    kingdom: 'Pseudomonadati',
    phylum: 'Pseudomonadota',
    classRank: 'Gammaproteobacteria',
    order: 'Enterobacterales',
    family: 'Enterobacteriaceae',
    genus: 'Escherichia',
    speciesEpithet: 'coli',
    authority: '(Migula 1895) Castellani & Chalmers 1919',
  },
];

interface KeyStep {
  couplet: number;
  promptA: string;
  nextA: number | string;
  promptB: string;
  nextB: number | string;
}

const BOTANY_KEY: KeyStep[] = [
  {
    couplet: 1,
    promptA: 'Vascular tissue (xylem & phloem) absent; gametophyte dominant → Bryophyta (Mosses)',
    nextA: 'Bryophyta (Non-vascular Moss)',
    promptB: 'Lignified vascular tissue present; sporophyte dominant → Go to Couplet 2',
    nextB: 2,
  },
  {
    couplet: 2,
    promptA: 'Reproduces via haploid spores in sori on underside of fronds; no seeds → Pteridophyta',
    nextA: 'Pteridophyta (Seedless Vascular Fern)',
    promptB: 'Reproduces via multicellular seeds → Go to Couplet 3',
    nextB: 3,
  },
  {
    couplet: 3,
    promptA: 'Naked seeds borne on woody cones; needle-like evergreen leaves → Pinophyta',
    nextA: 'Gymnosperm — Pinus sylvestris (Conifer)',
    promptB: 'Seeds enclosed inside a floral ovary/fruit → Go to Couplet 4',
    nextB: 4,
  },
  {
    couplet: 4,
    promptA: 'Single cotyledon, parallel leaf venation, floral parts in multiples of 3',
    nextA: 'Monocotyledonae — Zea mays / Liliaceae',
    promptB: 'Two cotyledons, reticulate (netted) leaf venation, floral parts in 4s or 5s',
    nextB: 'Eudicotyledonae — Rosa / Quercus',
  },
];

export function TaxonomicDichotomousKeyBuilder() {
  const [tab, setTab] = useState<'taxonomy' | 'key'>('taxonomy');
  const [taxon, setTaxon] = useState<TaxonPreset>(TAXON_PRESETS[1]);

  // Interactive key walkthrough state
  const [currentCouplet, setCurrentCouplet] = useState<number>(1);
  const [identifiedResult, setIdentifiedResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const loadExample = () => {
    setTaxon(TAXON_PRESETS[0]);
    setCurrentCouplet(1);
    setIdentifiedResult(null);
    setHistory([]);
  };

  const formattedGenus =
    taxon.genus.trim().charAt(0).toUpperCase() + taxon.genus.trim().slice(1).toLowerCase();
  const formattedSpecies = taxon.speciesEpithet.trim().toLowerCase();

  const activeStep = BOTANY_KEY.find((k) => k.couplet === currentCouplet) || BOTANY_KEY[0];

  const chooseLead = (choiceLabel: string, target: number | string) => {
    setHistory((prev) => [...prev, `Couplet ${activeStep.couplet}: ${choiceLabel}`]);
    if (typeof target === 'number') {
      setCurrentCouplet(target);
    } else {
      setIdentifiedResult(target);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('taxonomy')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'taxonomy' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            8-Rank Linnaean Hierarchy &amp; Binomial Formatter
          </button>
          <button
            type="button"
            onClick={() => setTab('key')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              tab === 'key' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Botanical Dichotomous Key
          </button>
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example</span>
        </button>
      </div>

      {tab === 'taxonomy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {TAXON_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setTaxon(p)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {p.label.split(' (')[0]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  ['domain', 'Domain'],
                  ['kingdom', 'Kingdom'],
                  ['phylum', 'Phylum / Division'],
                  ['classRank', 'Class'],
                  ['order', 'Order'],
                  ['family', 'Family'],
                  ['genus', 'Genus'],
                  ['speciesEpithet', 'Specific Epithet'],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={taxon[field]}
                    onChange={(e) => setTaxon({ ...taxon, [field]: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-5 space-y-1.5">
              <span className="text-[11px] font-bold text-[#EA580C] block">
                ICZN / ICN Binomial Nomenclature Output
              </span>
              <p className="text-2xl font-display font-bold text-[#111827]">
                <em className="italic">
                  {formattedGenus} {formattedSpecies}
                </em>{' '}
                <span className="text-sm font-normal text-slate-500">{taxon.authority}</span>
              </p>
              <p className="text-xs text-slate-600">
                Abbreviated subsequent mention:{' '}
                <em className="italic font-semibold">
                  {formattedGenus.charAt(0)}. {formattedSpecies}
                </em>
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-1.5">
              {[
                ['Domain', taxon.domain],
                ['Kingdom', taxon.kingdom],
                ['Phylum', taxon.phylum],
                ['Class', taxon.classRank],
                ['Order', taxon.order],
                ['Family', taxon.family],
                ['Genus', formattedGenus],
                ['Species', `${formattedGenus} ${formattedSpecies}`],
              ].map(([rank, val], idx) => (
                <div
                  key={rank}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white border border-slate-200/80"
                  style={{ marginLeft: `${idx * 8}px` }}
                >
                  <span className="font-bold text-slate-500">{rank}</span>
                  <span className={`font-semibold text-[#111827] ${idx >= 6 ? 'italic' : ''}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {identifiedResult ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Specimen Taxon Identified
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCouplet(1);
                    setIdentifiedResult(null);
                    setHistory([]);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Key</span>
                </button>
              </div>
              <p className="text-xl font-display font-bold text-[#111827]">{identifiedResult}</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                {history.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EA580C]">
                  Dichotomous Couplet #{activeStep.couplet}
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentCouplet(1);
                      setHistory([]);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#111827] cursor-pointer"
                  >
                    Reset to Couplet 1
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => chooseLead('Lead A', activeStep.nextA)}
                  className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F97316] transition-colors space-y-2 cursor-pointer"
                >
                  <span className="inline-block text-xs font-mono font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-md">
                    Lead {activeStep.couplet}a
                  </span>
                  <p className="text-sm font-semibold text-[#111827] leading-relaxed">
                    {activeStep.promptA}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => chooseLead('Lead B', activeStep.nextB)}
                  className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F97316] transition-colors space-y-2 cursor-pointer"
                >
                  <span className="inline-block text-xs font-mono font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-md">
                    Lead {activeStep.couplet}b
                  </span>
                  <p className="text-sm font-semibold text-[#111827] leading-relaxed">
                    {activeStep.promptB}
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
