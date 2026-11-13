import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pencil,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle as CircleIcon,
  MoveUpRight,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  FileDown,
  Grid3X3,
} from 'lucide-react';
import { downloadCanvasFigurePdf } from '../../utils/pdfReportGenerator';

type DrawTool =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'circle'
  | 'arrow'
  | 'text';

interface Point {
  x: number;
  y: number;
}

interface StrokeAction {
  id: string;
  tool: DrawTool;
  color: string;
  size: number;
  points: Point[];
  text?: string;
}

const ACADEMIC_COLORS = [
  { name: 'Brand Orange', hex: '#F97316' },
  { name: 'Dark Slate', hex: '#111827' },
  { name: 'Navy Ink', hex: '#1E3A8A' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Crimson', hex: '#DC2626' },
];

const LOGICAL_WIDTH = 1200;
const LOGICAL_HEIGHT = 650;

function drawActionOnContext(ctx: CanvasRenderingContext2D, action: StrokeAction) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (action.tool === 'eraser') {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = action.size * 1.8;
    ctx.globalAlpha = 1;
  } else if (action.tool === 'highlighter') {
    ctx.strokeStyle = action.color;
    ctx.lineWidth = Math.max(action.size * 2.2, 14);
    ctx.globalAlpha = 0.32;
  } else {
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;
    ctx.lineWidth = action.size;
    ctx.globalAlpha = 1;
  }

  const pts = action.points;
  if (pts.length === 0) {
    ctx.restore();
    return;
  }

  if (action.tool === 'pen' || action.tool === 'highlighter' || action.tool === 'eraser') {
    ctx.beginPath();
    if (pts.length === 1) {
      ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = action.tool === 'eraser' ? '#FFFFFF' : action.color;
      ctx.fill();
    } else {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const midX = (pts[i - 1].x + pts[i].x) / 2;
        const midY = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, midX, midY);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  } else if (action.tool === 'line' && pts.length >= 2) {
    const start = pts[0];
    const end = pts[pts.length - 1];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else if (action.tool === 'rect' && pts.length >= 2) {
    const start = pts[0];
    const end = pts[pts.length - 1];
    ctx.beginPath();
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
  } else if (action.tool === 'circle' && pts.length >= 2) {
    const start = pts[0];
    const end = pts[pts.length - 1];
    const rx = Math.abs(end.x - start.x) / 2;
    const ry = Math.abs(end.y - start.y) / 2;
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (action.tool === 'arrow' && pts.length >= 2) {
    const start = pts[0];
    const end = pts[pts.length - 1];
    const headLen = Math.max(12, action.size * 3.2);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle - Math.PI / 6),
      end.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle + Math.PI / 6),
      end.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  } else if (action.tool === 'text' && action.text) {
    const fontSize = Math.max(15, action.size * 3.2);
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = action.color;
    ctx.textBaseline = 'top';
    const lines = action.text.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, pts[0].x, pts[0].y + idx * (fontSize * 1.28));
    });
  }

  ctx.restore();
}

function drawStudyGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  const step = 28;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export default function WhiteboardTool() {
  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState<string>('#111827');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [actions, setActions] = useState<StrokeAction[]>([]);
  const [redoStack, setRedoStack] = useState<StrokeAction[]>([]);
  const [draftAction, setDraftAction] = useState<StrokeAction | null>(null);
  const [textDraft, setTextDraft] = useState<{ pos: Point; value: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== LOGICAL_WIDTH * dpr || canvas.height !== LOGICAL_HEIGHT * dpr) {
      canvas.width = LOGICAL_WIDTH * dpr;
      canvas.height = LOGICAL_HEIGHT * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    if (showGrid) {
      drawStudyGrid(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }

    actions.forEach((act) => drawActionOnContext(ctx, act));
    if (draftAction) {
      drawActionOnContext(ctx, draftAction);
    }
    ctx.restore();
  }, [actions, draftAction, showGrid]);

  useEffect(() => {
    renderBoard();
  }, [renderBoard]);

  const getLogicalCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const commitTextDraft = () => {
    if (textDraft && textDraft.value.trim()) {
      const action: StrokeAction = {
        id: `txt-${Date.now()}`,
        tool: 'text',
        color,
        size: brushSize,
        points: [textDraft.pos],
        text: textDraft.value.trim(),
      };
      setActions((prev) => [...prev, action]);
      setRedoStack([]);
    }
    setTextDraft(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getLogicalCoords(e);

    if (activeTool === 'text') {
      if (textDraft) {
        commitTextDraft();
      }
      setTextDraft({ pos: pt, value: '' });
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    setDraftAction({
      id: `act-${Date.now()}`,
      tool: activeTool,
      color,
      size: brushSize,
      points: [pt],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !draftAction) return;
    const pt = getLogicalCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      setDraftAction((prev) => (prev ? { ...prev, points: [...prev.points, pt] } : null));
    } else {
      setDraftAction((prev) => (prev ? { ...prev, points: [prev.points[0], pt] } : null));
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !draftAction) return;
    isDrawingRef.current = false;
    setActions((prev) => [...prev, draftAction]);
    setRedoStack([]);
    setDraftAction(null);
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setActions((prev) => [...prev, next]);
  };

  const buildExportCanvas = (): HTMLCanvasElement | null => {
    if (textDraft) commitTextDraft();
    const exportCanvas = document.createElement('canvas');
    const scale = 2;
    exportCanvas.width = LOGICAL_WIDTH * scale;
    exportCanvas.height = LOGICAL_HEIGHT * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (showGrid) {
      drawStudyGrid(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }
    actions.forEach((act) => drawActionOnContext(ctx, act));
    return exportCanvas;
  };

  const handleExportPng = () => {
    const exportCanvas = buildExportCanvas();
    if (!exportCanvas) return;

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UniversityTutors-Whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  };

  const handleExportPdf = () => {
    const exportCanvas = buildExportCanvas();
    if (!exportCanvas) return;
    const pngDataUrl = exportCanvas.toDataURL('image/png');
    downloadCanvasFigurePdf({
      filename: `UniversityTutors-Whiteboard-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Student Study Whiteboard & Diagram Sheet',
      subtitle: 'High-DPI lecture notes, equations, and mind-map canvas',
      pngDataUrl,
      imgWidthPx: exportCanvas.width,
      imgHeightPx: exportCanvas.height,
      landscape: true,
    });
  };

  const toolButtons: { id: DrawTool; label: string; icon: React.ReactNode }[] = [
    { id: 'pen', label: 'Pen', icon: <Pencil className="w-4 h-4" /> },
    { id: 'highlighter', label: 'Highlight', icon: <Highlighter className="w-4 h-4" /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" /> },
    { id: 'line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
    { id: 'arrow', label: 'Arrow', icon: <MoveUpRight className="w-4 h-4" /> },
    { id: 'rect', label: 'Box', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', label: 'Circle', icon: <CircleIcon className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-[#F9FAFB] border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Drawing Tools */}
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Drawing Tools">
          {toolButtons.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (textDraft) commitTextDraft();
                setActiveTool(t.id);
              }}
              title={t.label}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTool === t.id
                  ? 'bg-[#F97316] text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Ink Palette + Brush Slider */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5" aria-label="Ink Colors">
            {ACADEMIC_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                title={c.name}
                aria-label={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                  color === c.hex ? 'ring-2 ring-offset-2 ring-[#F97316] scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
            <label htmlFor="wb-size-slider" className="text-xs font-semibold text-slate-600">
              Stroke
            </label>
            <input
              id="wb-size-slider"
              type="range"
              min={2}
              max={24}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-[#F97316] cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-[#111827] w-8 text-right tabular-nums">
              {brushSize}px
            </span>
          </div>
        </div>

        {/* History, Grid & Export */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            title="Toggle Study Grid"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
              showGrid
                ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden md:inline">Grid</span>
          </button>

          <button
            type="button"
            disabled={actions.length === 0}
            onClick={handleUndo}
            title="Undo"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            title="Redo"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={actions.length === 0}
            onClick={() => {
              setActions([]);
              setRedoStack([]);
              setTextDraft(null);
            }}
            title="Clear Board"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 disabled:opacity-35 text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Clear</span>
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F97316]" />
            <span>Export PNG</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* High-DPI Canvas Area */}
      <div className="relative bg-slate-100/70 p-2 sm:p-4">
        <div className="relative w-full aspect-[1200/650] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block touch-none cursor-crosshair"
          />

          {/* Floating Inline Text Placement Input */}
          {textDraft && (
            <div
              style={{
                left: `${Math.min(Math.max((textDraft.pos.x / LOGICAL_WIDTH) * 100, 3), 52)}%`,
                top: `${Math.min(Math.max((textDraft.pos.y / LOGICAL_HEIGHT) * 100, 4), 80)}%`,
              }}
              className="absolute z-20 -translate-y-1 max-w-[92%] bg-white/95 border-2 border-[#F97316] rounded-xl shadow-lg p-2 flex items-center gap-2"
            >
              <input
                type="text"
                autoFocus
                value={textDraft.value}
                onChange={(e) => setTextDraft({ ...textDraft, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitTextDraft();
                  } else if (e.key === 'Escape') {
                    setTextDraft(null);
                  }
                }}
                placeholder="Type formula + Enter..."
                className="text-xs sm:text-sm font-semibold text-[#111827] focus:outline-none w-32 sm:w-44 min-w-0"
              />
              <button
                type="button"
                onClick={commitTextDraft}
                className="px-2.5 py-1 rounded-lg bg-[#F97316] text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Place
              </button>
            </div>
          )}

          {actions.length === 0 && !draftAction && !textDraft && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-xs sm:text-sm font-medium text-slate-400 bg-white/85 px-4 py-2 rounded-xl border border-slate-200/70">
                Draw equations, vectors, or mind maps anywhere — stylus, mouse &amp; touch supported
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
