import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Pencil,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle as CircleIcon,
  MoveUpRight,
  Type,
  Move,
  Undo2,
  Redo2,
  Trash2,
  Download,
  FileDown,
  Grid3X3,
  Maximize2,
  Minimize2,
  RotateCcw,
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
  | 'text'
  | 'move';

interface Point {
  x: number;
  y: number;
}

interface StrokeAction {
  id: string;
  tool: Exclude<DrawTool, 'move'>;
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

const PENCIL_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 21l3.75-.75L20.25 6.75a2.121 2.121 0 0 0-3-3L3.75 17.25 3 21z" fill="#FFFFFF" stroke="#111827" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 6.5l3 3" stroke="#F97316" stroke-width="2" stroke-linecap="round"/><path d="M3 21l2.2-0.45L3.45 18.8 3 21z" fill="#F97316"/></svg>`;
const PENCIL_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(PENCIL_CURSOR_SVG)}") 2 21, auto`;

const ERASER_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 20h12M4.5 14.5l9.5-9.5a2.12 2.12 0 0 1 3 0l3 3a2.12 2.12 0 0 1 0 3l-8 8H7.5l-3-3a2.12 2.12 0 0 1 0-1.5z" fill="#FFF7ED" stroke="#111827" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><path d="M10.5 8.5l5 5" stroke="#F97316" stroke-width="1.6"/></svg>`;
const ERASER_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ERASER_CURSOR_SVG)}") 6 19, cell`;

function getCursorForTool(tool: DrawTool): string {
  if (tool === 'eraser') return ERASER_CURSOR;
  if (tool === 'move') return 'move';
  if (tool === 'text') return 'text';
  return PENCIL_CURSOR;
}

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

function drawStudyGrid(
  ctx: CanvasRenderingContext2D,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) {
  ctx.save();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  const step = 28;
  const startX = Math.floor(minX / step) * step;
  const startY = Math.floor(minY / step) * step;

  for (let x = startX; x <= maxX; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
    ctx.stroke();
  }
  for (let y = startY; y <= maxY; y += step) {
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
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
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartClientRef = useRef<Point>({ x: 0, y: 0 });
  const panOriginRef = useRef<Point>({ x: 0, y: 0 });

  // Lock background page scroll cleanly while full screen is active and support Escape key exit
  useEffect(() => {
    if (!isFullScreen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !textDraft) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullScreen, textDraft]);

  // Track rendered container dimensions cleanly so full-screen mobile portrait & desktop stay sharp
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateSize());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullScreen]);

  const uniformScale = useMemo(() => {
    const w = Math.max(viewportSize.width, 1);
    const h = Math.max(viewportSize.height, 1);
    return Math.min(w / LOGICAL_WIDTH, h / LOGICAL_HEIGHT) || 1;
  }, [viewportSize]);

  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.max(1, Math.round(viewportSize.width * dpr));
    const pixelH = Math.max(1, Math.round(viewportSize.height * dpr));

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);

    ctx.scale(uniformScale, uniformScale);
    ctx.translate(panOffset.x, panOffset.y);

    if (showGrid) {
      const minX = -panOffset.x;
      const minY = -panOffset.y;
      const maxX = viewportSize.width / uniformScale - panOffset.x;
      const maxY = viewportSize.height / uniformScale - panOffset.y;
      drawStudyGrid(ctx, minX, minY, maxX, maxY);
    }

    actions.forEach((act) => drawActionOnContext(ctx, act));
    if (draftAction) {
      drawActionOnContext(ctx, draftAction);
    }
    ctx.restore();
  }, [actions, draftAction, showGrid, viewportSize, uniformScale, panOffset]);

  useEffect(() => {
    renderBoard();
  }, [renderBoard]);

  const getLogicalCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / LOGICAL_WIDTH, rect.height / LOGICAL_HEIGHT) || 1;
    return {
      x: (e.clientX - rect.left) / scale - panOffset.x,
      y: (e.clientY - rect.top) / scale - panOffset.y,
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
    if (activeTool === 'move') {
      e.currentTarget.setPointerCapture(e.pointerId);
      isPanningRef.current = true;
      panStartClientRef.current = { x: e.clientX, y: e.clientY };
      panOriginRef.current = { ...panOffset };
      return;
    }

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
    if (isPanningRef.current && activeTool === 'move') {
      const dx = (e.clientX - panStartClientRef.current.x) / (uniformScale || 1);
      const dy = (e.clientY - panStartClientRef.current.y) / (uniformScale || 1);
      setPanOffset({
        x: panOriginRef.current.x + dx,
        y: panOriginRef.current.y + dy,
      });
      return;
    }

    if (!isDrawingRef.current || !draftAction) return;
    const pt = getLogicalCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      setDraftAction((prev) => (prev ? { ...prev, points: [...prev.points, pt] } : null));
    } else {
      setDraftAction((prev) => (prev ? { ...prev, points: [prev.points[0], pt] } : null));
    }
  };

  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
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

    let maxLogicalX = LOGICAL_WIDTH;
    let maxLogicalY = LOGICAL_HEIGHT;
    actions.forEach((act) => {
      act.points.forEach((p) => {
        if (p.x + 60 > maxLogicalX) maxLogicalX = Math.ceil(p.x + 60);
        if (p.y + 60 > maxLogicalY) maxLogicalY = Math.ceil(p.y + 60);
      });
    });

    const exportCanvas = document.createElement('canvas');
    const scale = 2;
    exportCanvas.width = maxLogicalX * scale;
    exportCanvas.height = maxLogicalY * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, maxLogicalX, maxLogicalY);
    if (showGrid) {
      drawStudyGrid(ctx, 0, 0, maxLogicalX, maxLogicalY);
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
    { id: 'move', label: 'Move', icon: <Move className="w-4 h-4" /> },
  ];

  const activeCursor = getCursorForTool(activeTool);
  const isPanned = Math.abs(panOffset.x) > 1 || Math.abs(panOffset.y) > 1;

  return (
    <div
      id="whiteboard-workspace-root"
      data-fullscreen={isFullScreen ? 'true' : 'false'}
      className={
        isFullScreen
          ? 'fixed inset-0 w-screen h-[100dvh] z-[100] bg-[#FFFFFF] flex flex-col overflow-hidden rounded-none border-0 select-none'
          : 'bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden'
      }
    >
      {/* Top Controls Bar */}
      <div
        className={`bg-[#F9FAFB] border-b border-slate-200 ${
          isFullScreen ? 'px-2.5 py-2 sm:px-4 sm:py-2.5 shrink-0' : 'p-3 sm:p-4'
        } flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3`}
      >
        {/* Drawing Tools (Scrollable cleanly on 360px-480px mobile without page horizontal overflow) */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 xl:pb-0 no-scrollbar"
          role="toolbar"
          aria-label="Drawing Tools"
        >
          {toolButtons.map((t) => (
            <button
              key={t.id}
              type="button"
              id={`wb-tool-${t.id}`}
              onClick={() => {
                if (textDraft) commitTextDraft();
                setActiveTool(t.id);
              }}
              title={t.label}
              aria-pressed={activeTool === t.id}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === t.id
                  ? 'bg-[#F97316] text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
              }`}
            >
              {t.icon}
              <span className={isFullScreen ? 'hidden md:inline' : 'hidden sm:inline'}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Ink Palette + Brush Slider + Actions */}
        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2 sm:gap-3">
          {/* Ink Colors & Brush Size */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5" aria-label="Ink Colors">
              {ACADEMIC_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  aria-label={c.name}
                  style={{ backgroundColor: c.hex }}
                  className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg transition-transform cursor-pointer shrink-0 ${
                    color === c.hex
                      ? 'ring-2 ring-offset-2 ring-[#F97316] scale-105'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 min-h-[44px]">
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
                className="w-16 sm:w-20 accent-[#F97316] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-[#111827] w-8 text-right tabular-nums">
                {brushSize}px
              </span>
            </div>
          </div>

          {/* History, Grid, Full Screen & Export */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isPanned && (
              <button
                type="button"
                onClick={() => setPanOffset({ x: 0, y: 0 })}
                title="Reset Canvas Pan"
                className="inline-flex items-center gap-1 min-h-[44px] px-2.5 py-2 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGrid((g) => !g)}
              title="Toggle Study Grid"
              aria-pressed={showGrid}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
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
              aria-label="Undo"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              title="Redo"
              aria-label="Redo"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
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
              aria-label="Clear Board"
              className="inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 disabled:opacity-35 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden xl:inline">Clear</span>
            </button>

            {/* Full Screen / Expand Toggle Button */}
            <button
              type="button"
              id="wb-fullscreen-toggle-btn"
              onClick={() => setIsFullScreen((fs) => !fs)}
              aria-pressed={isFullScreen}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Canvas'}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                isFullScreen
                  ? 'bg-[#111827] border-[#111827] text-white hover:bg-slate-800'
                  : 'bg-[#FFF7ED] border-orange-300 text-[#EA580C] hover:bg-[#F97316] hover:text-white hover:border-[#F97316]'
              }`}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-4 h-4 shrink-0" />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 shrink-0" />
                  <span>Full Screen</span>
                </>
              )}
            </button>

            {!isFullScreen && (
              <>
                <button
                  type="button"
                  onClick={handleExportPng}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-[#111827] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#F97316]" />
                  <span>Export PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* High-DPI Canvas Area */}
      <div
        className={
          isFullScreen
            ? 'relative flex-1 min-h-0 w-full bg-white overflow-hidden'
            : 'relative bg-slate-100/70 p-2 sm:p-4'
        }
      >
        {/* Floating Exit Full Screen CTA inside full-screen canvas corner */}
        {isFullScreen && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              type="button"
              id="wb-floating-exit-fullscreen-btn"
              onClick={() => setIsFullScreen(false)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#111827]/95 hover:bg-[#F97316] text-white text-xs font-bold shadow-lg border border-white/20 backdrop-blur-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Minimize2 className="w-4 h-4 shrink-0" />
              <span>Exit Full Screen</span>
            </button>
          </div>
        )}

        <div
          ref={boardContainerRef}
          className={
            isFullScreen
              ? 'relative w-full h-full bg-white overflow-hidden'
              : 'relative w-full aspect-[1200/650] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs'
          }
        >
          <canvas
            ref={canvasRef}
            id="whiteboard-drawing-canvas"
            data-cursor-mode={activeTool}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ cursor: activeCursor }}
            className="w-full h-full block touch-none"
          />

          {/* Floating Inline Text Placement Input */}
          {textDraft && (
            <div
              style={{
                left: `${Math.min(Math.max((((textDraft.pos.x + panOffset.x) * uniformScale) / Math.max(viewportSize.width, 1)) * 100, 3), 52)}%`,
                top: `${Math.min(Math.max((((textDraft.pos.y + panOffset.y) * uniformScale) / Math.max(viewportSize.height, 1)) * 100, 4), 80)}%`,
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
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-[#F97316] text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Place
              </button>
            </div>
          )}

          {actions.length === 0 && !draftAction && !textDraft && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <p className="text-xs sm:text-sm font-medium text-slate-400 bg-white/85 px-4 py-2 rounded-xl border border-slate-200/70 text-center">
                Draw equations, vectors, or mind maps anywhere — stylus, mouse &amp; touch supported
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
