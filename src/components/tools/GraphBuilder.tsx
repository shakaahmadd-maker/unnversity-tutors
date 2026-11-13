import React, { useState, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieIcon,
  Plus,
  Trash2,
  Download,
  FileDown,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { downloadCanvasFigurePdf } from '../../utils/pdfReportGenerator';

type ChartKind = 'bar' | 'line' | 'area' | 'pie';

interface DataRow {
  id: string;
  label: string;
  values: Record<string, number>;
}

const CHART_PALETTE = ['#F97316', '#1E3A8A', '#059669', '#7C3AED', '#DC2626', '#0891B2'];

const INITIAL_SERIES = ['Control Group', 'Guided Study Cohort'];

const INITIAL_ROWS: DataRow[] = [
  { id: 'r1', label: 'Week 2', values: { 'Control Group': 62, 'Guided Study Cohort': 68 } },
  { id: 'r2', label: 'Week 4', values: { 'Control Group': 65, 'Guided Study Cohort': 75 } },
  { id: 'r3', label: 'Week 6', values: { 'Control Group': 67, 'Guided Study Cohort': 82 } },
  { id: 'r4', label: 'Week 8', values: { 'Control Group': 70, 'Guided Study Cohort': 88 } },
  { id: 'r5', label: 'Final Exam', values: { 'Control Group': 72, 'Guided Study Cohort': 93 } },
];

export default function GraphBuilder() {
  const [chartType, setChartType] = useState<ChartKind>('bar');
  const [chartTitle, setChartTitle] = useState('Mean Assessment Score Across Semester Cohorts (%)');
  const [xAxisLabel, setXAxisLabel] = useState('Assessment Milestone');
  const [yAxisLabel, setYAxisLabel] = useState('Mean Score (%)');
  const [seriesNames, setSeriesNames] = useState<string[]>(INITIAL_SERIES);
  const [rows, setRows] = useState<DataRow[]>(INITIAL_ROWS);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState(
    'Milestone,Control Group,Guided Study Cohort\nWeek 2,62,68\nWeek 4,65,75\nWeek 6,67,82\nWeek 8,70,88\nFinal Exam,72,93'
  );
  const [csvNotice, setCsvNotice] = useState<string | null>(null);

  const chartWrapperRef = useRef<HTMLDivElement | null>(null);

  const chartData = rows.map((r) => ({
    name: r.label || 'Item',
    ...r.values,
  }));

  const handleAddRow = () => {
    const defaultValues: Record<string, number> = {};
    seriesNames.forEach((s) => {
      defaultValues[s] = 50;
    });
    setRows((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        label: `Sample ${prev.length + 1}`,
        values: defaultValues,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddSeries = () => {
    if (seriesNames.length >= 5) return;
    const newName = `Series ${seriesNames.length + 1}`;
    setSeriesNames((prev) => [...prev, newName]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        values: { ...r.values, [newName]: 60 },
      }))
    );
  };

  const handleRenameSeries = (idx: number, nextName: string) => {
    const clean = nextName || `Series ${idx + 1}`;
    const oldName = seriesNames[idx];
    if (oldName === clean) return;
    setSeriesNames((prev) => prev.map((s, i) => (i === idx ? clean : s)));
    setRows((prev) =>
      prev.map((r) => {
        const copy = { ...r.values };
        const val = copy[oldName] ?? 0;
        delete copy[oldName];
        copy[clean] = val;
        return { ...r, values: copy };
      })
    );
  };

  const handleRemoveSeries = (idx: number) => {
    if (seriesNames.length <= 1) return;
    const target = seriesNames[idx];
    setSeriesNames((prev) => prev.filter((_, i) => i !== idx));
    setRows((prev) =>
      prev.map((r) => {
        const copy = { ...r.values };
        delete copy[target];
        return { ...r, values: copy };
      })
    );
  };

  const handleApplyCsv = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      setCsvNotice('Provide a header row plus at least one data row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    if (headers.length < 2) {
      setCsvNotice('Include a category column and at least one numeric series column.');
      return;
    }

    const parsedSeries = headers.slice(1).map((h, idx) => h || `Series ${idx + 1}`);
    const parsedRows: DataRow[] = lines.slice(1).map((line, rIdx) => {
      const cols = line.split(',').map((c) => c.trim());
      const vals: Record<string, number> = {};
      parsedSeries.forEach((sName, sIdx) => {
        const num = Number(cols[sIdx + 1]);
        vals[sName] = Number.isFinite(num) ? num : 0;
      });
      return {
        id: `csv-${Date.now()}-${rIdx}`,
        label: cols[0] || `Row ${rIdx + 1}`,
        values: vals,
      };
    });

    setXAxisLabel(headers[0] || 'Category');
    setSeriesNames(parsedSeries);
    setRows(parsedRows);
    setCsvNotice(`Imported ${parsedRows.length} rows and ${parsedSeries.length} series.`);
  };

  const renderChartToCanvas = (onReady: (canvas: HTMLCanvasElement) => void) => {
    const wrapper = chartWrapperRef.current;
    if (!wrapper) return;
    const svgEl = wrapper.querySelector('svg');
    if (!svgEl) return;

    const svgRect = svgEl.getBoundingClientRect();
    const width = Math.max(Math.round(svgRect.width), 720);
    const height = Math.max(Math.round(svgRect.height), 420);
    const headerHeight = 84;
    const footerHeight = 48;
    const totalHeight = height + headerHeight + footerHeight;
    const scale = 2;

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));

    const svgMarkup = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = totalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, totalHeight);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(chartTitle || 'Academic Figure', width / 2, 42);

      ctx.font = '600 12px Inter, system-ui, sans-serif';
      const legendItems = chartType === 'pie' ? rows.map((r) => r.label) : seriesNames;
      const totalLegendWidth = legendItems.reduce((acc, item) => acc + item.length * 7 + 34, 0);
      let cursorX = Math.max(24, (width - totalLegendWidth) / 2);
      legendItems.forEach((label, idx) => {
        ctx.fillStyle = CHART_PALETTE[idx % CHART_PALETTE.length];
        ctx.fillRect(cursorX, 58, 12, 12);
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(label, cursorX + 17, 68);
        cursorX += label.length * 7 + 34;
      });

      ctx.drawImage(img, 0, headerHeight, width, height);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Generated via University-Tutors.com Academic Graph Builder', width - 24, totalHeight - 18);

      URL.revokeObjectURL(url);
      onReady(canvas);
    };
    img.src = url;
  };

  const handleDownloadPng = () => {
    renderChartToCanvas((canvas) => {
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const dlUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = `Academic-Figure-${chartType}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(dlUrl), 4000);
      }, 'image/png');
    });
  };

  const handleDownloadPdf = () => {
    renderChartToCanvas((canvas) => {
      const pngDataUrl = canvas.toDataURL('image/png');
      downloadCanvasFigurePdf({
        filename: `Academic-Figure-${chartType}.pdf`,
        title: chartTitle || 'Academic Lab & Research Figure',
        subtitle: `${chartType.toUpperCase()} Chart · X: ${xAxisLabel} · Y: ${yAxisLabel}`,
        pngDataUrl,
        imgWidthPx: canvas.width,
        imgHeightPx: canvas.height,
        landscape: true,
      });
    });
  };

  const primarySeries = seriesNames[0] || 'Value';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANEL: DATA GRID & CONFIGURATION */}
      <div className="lg:col-span-5 bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Chart Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Chart Visualization Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'bar' as ChartKind, label: 'Bar', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'line' as ChartKind, label: 'Line', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'area' as ChartKind, label: 'Area', icon: <Activity className="w-4 h-4" /> },
              { id: 'pie' as ChartKind, label: 'Pie', icon: <PieIcon className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChartType(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  chartType === item.id
                    ? 'bg-[#F97316] border-[#F97316] text-white shadow-2xs'
                    : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Titles & Axis Inputs */}
        <div className="space-y-3">
          <div>
            <label htmlFor="gb-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Figure Title
            </label>
            <input
              id="gb-title"
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm text-[#111827]"
            />
          </div>

          {chartType !== 'pie' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gb-xaxis" className="block text-xs font-semibold text-slate-700 mb-1">
                  X-Axis Label
                </label>
                <input
                  id="gb-xaxis"
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>
              <div>
                <label htmlFor="gb-yaxis" className="block text-xs font-semibold text-slate-700 mb-1">
                  Y-Axis Label (with units)
                </label>
                <input
                  id="gb-yaxis"
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Editable Spreadsheet Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#111827]">Dataset Table</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCsvOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#111827] cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{csvOpen ? 'Hide CSV Paste' : 'Paste CSV'}</span>
              </button>
              {chartType !== 'pie' && seriesNames.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddSeries}
                  className="text-xs font-semibold text-slate-600 hover:text-[#EA580C] cursor-pointer"
                >
                  + Add Series
                </button>
              )}
            </div>
          </div>

          {csvOpen && (
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Category,Series A,Series B&#10;Trial 1,14.2,18.5"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                {csvNotice ? (
                  <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> {csvNotice}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Comma-separated rows from Excel/Sheets</span>
                )}
                <button
                  type="button"
                  onClick={handleApplyCsv}
                  className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply CSV Data
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-slate-200 text-[11px] text-slate-600">
                  <th className="py-2 px-2.5 font-bold">Category</th>
                  {seriesNames.map((sName, sIdx) => (
                    <th key={sIdx} className="py-2 px-2 font-bold min-w-[95px]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={sName}
                          onChange={(e) => handleRenameSeries(sIdx, e.target.value)}
                          aria-label={`Series ${sIdx + 1} name`}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-[#111827]"
                        />
                        {seriesNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSeries(sIdx)}
                            title="Remove series"
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r))
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-[#111827]"
                      />
                    </td>
                    {seriesNames.map((sName) => (
                      <td key={sName} className="p-1.5">
                        <input
                          type="number"
                          step="any"
                          value={row.values[sName] ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      values: {
                                        ...r.values,
                                        [sName]: Number.isFinite(val) ? val : 0,
                                      },
                                    }
                                  : r
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-[#111827] tabular-nums"
                        />
                      </td>
                    ))}
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        disabled={rows.length <= 1}
                        onClick={() => handleRemoveRow(row.id)}
                        aria-label="Delete row"
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-[#F97316] text-xs font-semibold text-slate-700 hover:text-[#EA580C] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Data Row</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE FIGURE PREVIEW & PNG EXPORT */}
      <div className="lg:col-span-7 bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-[#EA580C]">Publication-Ready Preview</span>
            <h3 className="text-base sm:text-lg font-display font-bold text-[#111827] mt-0.5">
              {chartTitle || 'Untitled Academic Figure'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F97316]" />
              <span>Export PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div ref={chartWrapperRef} className="w-full h-[380px] sm:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 12, right: 20, left: 12, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: xAxisLabel, position: 'insideBottom', offset: -16, fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {seriesNames.map((sName, idx) => (
                  <Bar
                    key={sName}
                    dataKey={sName}
                    fill={CHART_PALETTE[idx % CHART_PALETTE.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 12, right: 20, left: 12, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: xAxisLabel, position: 'insideBottom', offset: -16, fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {seriesNames.map((sName, idx) => (
                  <Line
                    key={sName}
                    type="monotone"
                    dataKey={sName}
                    stroke={CHART_PALETTE[idx % CHART_PALETTE.length]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 12, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: xAxisLabel, position: 'insideBottom', offset: -16, fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fill: '#374151', fontSize: 12 }}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {seriesNames.map((sName, idx) => (
                  <Area
                    key={sName}
                    type="monotone"
                    dataKey={sName}
                    stroke={CHART_PALETTE[idx % CHART_PALETTE.length]}
                    fill={CHART_PALETTE[idx % CHART_PALETTE.length]}
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                ))}
              </AreaChart>
            ) : (
              <PieChart>
                <Tooltip />
                <Legend verticalAlign="bottom" />
                <Pie
                  data={chartData}
                  dataKey={primarySeries}
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  outerRadius={135}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Tip: Click any number in the left table to update bars/curves live, then export a high-DPI PNG for Word, Google Docs, or LaTeX.
        </p>
      </div>
    </div>
  );
}
