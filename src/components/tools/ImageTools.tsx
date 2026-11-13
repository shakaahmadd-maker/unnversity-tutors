import React, { useState, useEffect, useRef } from 'react';
import {
  Minimize2,
  ScanFace,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export type ImageToolsTab = 'compress' | 'resize';

interface ImageToolsProps {
  initialTab?: ImageToolsTab;
  onNavigate?: (view: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image'));
      },
      mimeType,
      quality
    );
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = src;
  });
}

export default function ImageTools({ initialTab = 'compress', onNavigate }: ImageToolsProps) {
  const [activeTab, setActiveTab] = useState<ImageToolsTab>(initialTab);

  // --- COMPRESSOR STATE ---
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [srcPreviewUrl, setSrcPreviewUrl] = useState<string>('');
  const [targetKb, setTargetKb] = useState<number>(100);
  const [customKb, setCustomKb] = useState<string>('100');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedDims, setCompressedDims] = useState<{ w: number; h: number } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const compressInputRef = useRef<HTMLInputElement>(null);

  // --- RESIZER STATE ---
  const [resizeFile, setResizeFile] = useState<File | null>(null);
  const [resizeSrcUrl, setResizeSrcUrl] = useState<string>('');
  const [presetId, setPresetId] = useState<'passport' | 'square600' | 'portal300' | 'custom'>('passport');
  const [targetW, setTargetW] = useState<number>(413);
  const [targetH, setTargetH] = useState<number>(531);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [outputMime, setOutputMime] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string>('');
  const resizeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const switchTab = (tab: ImageToolsTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'compress') onNavigate('tools/image-compressor');
      else onNavigate('tools/passport-photo-resizer');
    }
  };

  // Run adaptive target-KB compression whenever source file or targetKb changes
  useEffect(() => {
    if (!srcPreviewUrl || !srcFile) return;
    let cancelled = false;

    const runCompression = async () => {
      setIsCompressing(true);
      try {
        const img = await loadImageElement(srcPreviewUrl);
        const targetBytes = Math.max(10, targetKb) * 1024;
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        let bestBlob: Blob | null = null;
        let bestDims = { w: origW, h: origH };

        // Try progressive dimension scales if pure JPEG quality cannot reach targetBytes
        const scales = [1, 0.85, 0.72, 0.58, 0.45, 0.34, 0.25];
        for (const scale of scales) {
          const w = Math.max(120, Math.round(origW * scale));
          const h = Math.max(120, Math.round(origH * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          // Binary search JPEG quality between 0.12 and 0.94
          let low = 0.12;
          let high = 0.94;
          let candidateUnderCap: Blob | null = null;

          for (let iter = 0; iter < 7; iter++) {
            const mid = (low + high) / 2;
            const blob = await canvasToBlobAsync(canvas, 'image/jpeg', mid);
            if (blob.size <= targetBytes) {
              candidateUnderCap = blob;
              low = mid;
            } else {
              high = mid;
            }
          }

          if (candidateUnderCap) {
            bestBlob = candidateUnderCap;
            bestDims = { w, h };
            break;
          } else {
            // Keep lowest-quality attempt as fallback if even tiny scale exceeds cap
            bestBlob = await canvasToBlobAsync(canvas, 'image/jpeg', 0.12);
            bestDims = { w, h };
          }
        }

        if (!cancelled && bestBlob) {
          setCompressedBlob(bestBlob);
          setCompressedDims(bestDims);
          setCompressedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(bestBlob!);
          });
        }
      } catch {
        // Ignore transient decode failure
      } finally {
        if (!cancelled) setIsCompressing(false);
      }
    };

    runCompression();
    return () => {
      cancelled = true;
    };
  }, [srcPreviewUrl, srcFile, targetKb]);

  // Run Passport/ID resize whenever source or parameters change
  useEffect(() => {
    if (!resizeSrcUrl) return;
    let cancelled = false;

    const runResize = async () => {
      const safeW = Math.max(50, Math.min(4000, Math.round(targetW || 413)));
      const safeH = Math.max(50, Math.min(4000, Math.round(targetH || 531)));
      try {
        const img = await loadImageElement(resizeSrcUrl);
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = safeW;
        canvas.height = safeH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, safeW, safeH);

        if (fitMode === 'cover') {
          const scale = Math.max(safeW / srcW, safeH / srcH);
          const drawW = srcW * scale;
          const drawH = srcH * scale;
          const dx = (safeW - drawW) / 2;
          // Slightly bias vertical crop toward upper-center for headshots
          const dy = (safeH - drawH) * 0.38;
          ctx.drawImage(img, dx, dy, drawW, drawH);
        } else {
          const scale = Math.min(safeW / srcW, safeH / srcH);
          const drawW = srcW * scale;
          const drawH = srcH * scale;
          const dx = (safeW - drawW) / 2;
          const dy = (safeH - drawH) / 2;
          ctx.drawImage(img, dx, dy, drawW, drawH);
        }

        const blob = await canvasToBlobAsync(
          canvas,
          outputMime,
          outputMime === 'image/png' ? undefined : 0.92
        );

        if (!cancelled) {
          setResizedBlob(blob);
          setResizedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      } catch {
        // Ignore decode errors
      }
    };

    runResize();
    return () => {
      cancelled = true;
    };
  }, [resizeSrcUrl, targetW, targetH, fitMode, outputMime]);

  const handleCompressUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setSrcFile(f);
    setSrcPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const handleResizeUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setResizeFile(f);
    setResizeSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const selectPreset = (id: 'passport' | 'square600' | 'portal300' | 'custom') => {
    setPresetId(id);
    if (id === 'passport') {
      setTargetW(413);
      setTargetH(531);
    } else if (id === 'square600') {
      setTargetW(600);
      setTargetH(600);
    } else if (id === 'portal300') {
      setTargetW(300);
      setTargetH(300);
    }
  };

  const downloadBlob = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const savedPercent =
    srcFile && compressedBlob && compressedBlob.size < srcFile.size
      ? Math.round(((srcFile.size - compressedBlob.size) / srcFile.size) * 100)
      : 0;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      {/* Top Switcher */}
      <div className="border-b border-slate-200 bg-[#F9FAFB] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'compress'}
            onClick={() => switchTab('compress')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'compress'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Minimize2 className="w-4 h-4" />
            <span>Compress to Target KB</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'resize'}
            onClick={() => switchTab('resize')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'resize'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            <span>Passport &amp; ID Photo Resizer</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          100% Local Canvas Processing · IDs never leave your device
        </span>
      </div>

      {/* TAB 1: COMPRESS TO EXACT KB */}
      {activeTab === 'compress' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Settings */}
            <div className="lg:col-span-5 space-y-5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleCompressUpload(e.dataTransfer.files);
                }}
                onClick={() => compressInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-6 text-center transition-colors cursor-pointer"
              >
                <input
                  ref={compressInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  onChange={(e) => handleCompressUpload(e.target.files)}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-2.5">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-[#111827]">
                  {srcFile ? srcFile.name : 'Select Photo, ID Scan, or Certificate'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {srcFile
                    ? `Original size: ${formatSize(srcFile.size)} — Click to replace`
                    : 'Supports JPG, PNG, and WebP up to 25 MB'}
                </p>
              </div>

              <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Target Portal Maximum Size
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => {
                        setTargetKb(kb);
                        setCustomKb(String(kb));
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer tabular-nums ${
                        targetKb === kb
                          ? 'bg-[#F97316] border-[#F97316] text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                      }`}
                    >
                      ≤ {kb} KB
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="custom-kb-input" className="block text-xs font-semibold text-slate-600 mb-1">
                    Or Enter Custom KB Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="custom-kb-input"
                      type="number"
                      min={15}
                      max={5000}
                      value={customKb}
                      onChange={(e) => {
                        setCustomKb(e.target.value);
                        const parsed = Number(e.target.value);
                        if (Number.isFinite(parsed) && parsed >= 15) {
                          setTargetKb(parsed);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none tabular-nums"
                    />
                    <span className="text-xs font-bold text-slate-500">KB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Comparison & Download */}
            <div className="lg:col-span-7 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              {!srcFile ? (
                <div className="py-16 text-center space-y-2">
                  <Minimize2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    Upload an image on the left to compress it to ≤ {targetKb} KB
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Ideal for university admission portals, scholarship forms, and exam registration uploads.
                  </p>
                </div>
              ) : (
                <>
                  {/* Metrics Comparison Strip */}
                  <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-center tabular-nums">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500">Original</span>
                      <span className="text-sm sm:text-base font-bold text-[#111827]">
                        {formatSize(srcFile.size)}
                      </span>
                    </div>
                    <div className="border-x border-slate-100">
                      <span className="block text-[11px] font-semibold text-slate-500">Compressed</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-700">
                        {isCompressing || !compressedBlob ? '...' : formatSize(compressedBlob.size)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500">Reduction</span>
                      <span className="text-sm sm:text-base font-bold text-[#EA580C]">
                        {savedPercent > 0 ? `-${savedPercent}%` : 'Optimized'}
                      </span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="relative bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[240px] max-h-[340px] overflow-hidden">
                    {compressedUrl && (
                      <img
                        src={compressedUrl}
                        alt="Compressed preview"
                        className="max-h-[300px] w-auto object-contain rounded-lg"
                      />
                    )}
                    {isCompressing && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 text-xs font-semibold text-[#EA580C]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Optimizing under {targetKb} KB...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="tabular-nums">
                        Output dimensions: {compressedDims ? `${compressedDims.w} × ${compressedDims.h}px` : '—'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!compressedBlob || isCompressing}
                      onClick={() => {
                        const base = srcFile.name.replace(/\.[^.]+$/, '');
                        downloadBlob(compressedBlob, `${base}-${targetKb}KB.jpg`);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Compressed JPG</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PASSPORT & STUDENT ID PHOTO RESIZER */}
      {activeTab === 'resize' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleResizeUpload(e.dataTransfer.files);
                }}
                onClick={() => resizeInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-6 text-center transition-colors cursor-pointer"
              >
                <input
                  ref={resizeInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  onChange={(e) => handleResizeUpload(e.target.files)}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-2.5">
                  <ScanFace className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-[#111827]">
                  {resizeFile ? resizeFile.name : 'Upload Student Portrait or Headshot'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Resize to official passport, visa, or campus ID card dimensions locally
                </p>
              </div>

              {/* Official Presets */}
              <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Official University &amp; Visa Presets
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'passport' as const, title: '35 × 45 mm Passport', sub: '413 × 531 px (UK/EU/Intl)' },
                    { id: 'square600' as const, title: '2 × 2 inch Square', sub: '600 × 600 px (US Visa/Portal)' },
                    { id: 'portal300' as const, title: 'Campus ID Avatar', sub: '300 × 300 px (LMS/Student Card)' },
                    { id: 'custom' as const, title: 'Custom Pixel Size', sub: 'Enter exact width × height' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset(p.id)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        presetId === p.id
                          ? 'bg-[#FFF7ED] border-[#F97316]'
                          : 'bg-white border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#111827]">{p.title}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{p.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Width x Height Inputs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min={50}
                      max={4000}
                      value={targetW}
                      onChange={(e) => {
                        setPresetId('custom');
                        setTargetW(Number(e.target.value));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-[#111827] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Height (px)</label>
                    <input
                      type="number"
                      min={50}
                      max={4000}
                      value={targetH}
                      onChange={(e) => {
                        setPresetId('custom');
                        setTargetH(Number(e.target.value));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-[#111827] tabular-nums"
                    />
                  </div>
                </div>

                {/* Framing & Output Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Crop / Fit Mode</label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value as 'cover' | 'contain')}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827]"
                    >
                      <option value="cover">Smart Portrait Center-Crop</option>
                      <option value="contain">Fit Entire Photo (White Pad)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Output Format</label>
                    <select
                      value={outputMime}
                      onChange={(e) =>
                        setOutputMime(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827]"
                    >
                      <option value="image/jpeg">JPEG (.jpg) — Recommended</option>
                      <option value="image/png">PNG (.png) — Lossless</option>
                      <option value="image/webp">WebP (.webp) — Compact</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Resized Preview */}
            <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              {!resizeFile ? (
                <div className="py-16 text-center space-y-2">
                  <ScanFace className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    Upload a portrait photo to preview {targetW} × {targetH} px framing
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Includes an optional biometric oval guide to verify head centering before export.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111827] tabular-nums">
                      Output: {targetW} × {targetH} px{' '}
                      {resizedBlob ? `(${formatSize(resizedBlob.size)})` : ''}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowBiometricGuide((g) => !g)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showBiometricGuide ? 'Hide Head Guide' : 'Show Head Guide'}</span>
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[280px]">
                    {resizedUrl && (
                      <div className="relative inline-block shadow-sm border border-slate-300">
                        <img
                          src={resizedUrl}
                          alt="Resized ID preview"
                          className="max-h-[290px] w-auto block"
                        />
                        {showBiometricGuide && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-[58%] h-[68%] rounded-full border-2 border-dashed border-[#F97316]/80" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!resizedBlob}
                    onClick={() => {
                      const ext =
                        outputMime === 'image/png'
                          ? 'png'
                          : outputMime === 'image/webp'
                          ? 'webp'
                          : 'jpg';
                      const base = resizeFile.name.replace(/\.[^.]+$/, '');
                      downloadBlob(resizedBlob, `${base}-${targetW}x${targetH}.${ext}`);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Resized Photo ({targetW}×{targetH}px)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
