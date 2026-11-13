import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Files,
  Scissors,
  FileImage,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export type PdfToolkitTab = 'merge' | 'split' | 'images';

interface PdfToolkitProps {
  initialTab?: PdfToolkitTab;
  onNavigate?: (view: string) => void;
}

interface QueuedPdfFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount: number;
}

interface QueuedImageFile {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parsePageRanges(input: string, maxPages: number): { indices: number[]; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { indices: [], error: 'Enter at least one page number or range (e.g., 1-3, 5).' };
  }

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  const result: number[] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr, ...rest] = part.split('-').map((s) => s.trim());
      if (rest.length > 0 || !startStr || !endStr) {
        return { indices: [], error: `Invalid range "${part}". Use format like 1-4.` };
      }
      const start = Number(startStr);
      const end = Number(endStr);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
        return { indices: [], error: `Page numbers in "${part}" must be positive whole numbers.` };
      }
      if (start > maxPages || end > maxPages) {
        return {
          indices: [],
          error: `Range "${part}" exceeds the document total of ${maxPages} page${maxPages === 1 ? '' : 's'}.`,
        };
      }
      const step = start <= end ? 1 : -1;
      for (let p = start; step > 0 ? p <= end : p >= end; p += step) {
        result.push(p - 1);
      }
    } else {
      const pageNum = Number(part);
      if (!Number.isInteger(pageNum) || pageNum < 1) {
        return { indices: [], error: `"${part}" is not a valid page number.` };
      }
      if (pageNum > maxPages) {
        return {
          indices: [],
          error: `Page ${pageNum} exceeds the document total of ${maxPages} page${maxPages === 1 ? '' : 's'}.`,
        };
      }
      result.push(pageNum - 1);
    }
  }

  return { indices: result };
}

async function normalizeImageBytes(
  file: File
): Promise<{ bytes: Uint8Array; kind: 'jpg' | 'png' }> {
  const lower = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg' || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    const buf = await file.arrayBuffer();
    return { bytes: new Uint8Array(buf), kind: 'jpg' };
  }
  if (mime === 'image/png' || lower.endsWith('.png')) {
    const buf = await file.arrayBuffer();
    return { bytes: new Uint8Array(buf), kind: 'png' };
  }

  // Fallback: rasterize WebP/BMP/other onto HTML5 Canvas as PNG bytes
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Could not convert image'));
            return;
          }
          const arrayBuf = await blob.arrayBuffer();
          resolve({ bytes: new Uint8Array(arrayBuf), kind: 'png' });
        },
        'image/png',
        1
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not decode image "${file.name}".`));
    };
    img.src = url;
  });
}

function triggerBlobDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function PdfToolkit({ initialTab = 'merge', onNavigate }: PdfToolkitProps) {
  const [activeTab, setActiveTab] = useState<PdfToolkitTab>(initialTab);

  // Merge state
  const [mergeQueue, setMergeQueue] = useState<QueuedPdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<QueuedPdfFile | null>(null);
  const [rangeInput, setRangeInput] = useState('1');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitStatus, setSplitStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

  // Images to PDF state
  const [imageQueue, setImageQueue] = useState<QueuedImageFile[]>([]);
  const [marginPt, setMarginPt] = useState<number>(28);
  const [isConvertingImages, setIsConvertingImages] = useState(false);
  const [imageStatus, setImageStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imageQueue.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTab = (tab: PdfToolkitTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'merge') onNavigate('tools/merge-pdf');
      else if (tab === 'split') onNavigate('tools/split-pdf');
      else onNavigate('tools/images-to-pdf');
    }
  };

  // --- MERGE HANDLERS ---
  const handleAddMergeFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setMergeStatus(null);
    const additions: QueuedPdfFile[] = [];

    for (const file of Array.from(files)) {
      try {
        const buf = await file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        additions.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          name: file.name,
          sizeBytes: file.size,
          pageCount: doc.getPageCount(),
        });
      } catch {
        setMergeStatus({
          type: 'error',
          text: `Could not read "${file.name}". Please ensure it is a valid, unencrypted PDF.`,
        });
      }
    }

    if (additions.length > 0) {
      setMergeQueue((prev) => [...prev, ...additions]);
    }
    if (mergeInputRef.current) mergeInputRef.current.value = '';
  };

  const moveMergeItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= mergeQueue.length) return;
    setMergeQueue((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleMergeDownload = async () => {
    if (mergeQueue.length < 2) {
      setMergeStatus({ type: 'error', text: 'Please add at least 2 PDF files to merge.' });
      return;
    }
    setIsMerging(true);
    setMergeStatus(null);
    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;
      for (const item of mergeQueue) {
        const bytes = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((p) => mergedPdf.addPage(p));
        totalPages += copiedPages.length;
      }
      const outBytes = await mergedPdf.save();
      triggerBlobDownload(outBytes, `UniversityTutors-Merged-${mergeQueue.length}files.pdf`);
      setMergeStatus({
        type: 'success',
        text: `Merged ${mergeQueue.length} files (${totalPages} total pages) and started download.`,
      });
    } catch {
      setMergeStatus({
        type: 'error',
        text: 'Unable to merge one of the PDFs. Check if any file is password-protected.',
      });
    } finally {
      setIsMerging(false);
    }
  };

  // --- SPLIT HANDLERS ---
  const handleSelectSplitFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSplitStatus(null);
    const file = files[0];
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setSplitFile({
        id: `${file.name}-${Date.now()}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        pageCount: count,
      });
      setRangeInput(count > 3 ? `1-${Math.min(3, count)}` : '1');
    } catch {
      setSplitStatus({
        type: 'error',
        text: `Could not open "${file.name}". Please choose a standard PDF document.`,
      });
    }
    if (splitInputRef.current) splitInputRef.current.value = '';
  };

  const applySplitPreset = (preset: 'first' | 'odd' | 'even' | 'all') => {
    if (!splitFile) return;
    const n = splitFile.pageCount;
    if (preset === 'first') {
      setRangeInput('1');
    } else if (preset === 'all') {
      setRangeInput(`1-${n}`);
    } else if (preset === 'odd') {
      const odds = Array.from({ length: n }, (_, i) => i + 1).filter((p) => p % 2 === 1);
      setRangeInput(odds.join(', '));
    } else if (preset === 'even') {
      const evens = Array.from({ length: n }, (_, i) => i + 1).filter((p) => p % 2 === 0);
      setRangeInput(evens.length > 0 ? evens.join(', ') : '1');
    }
  };

  const handleSplitDownload = async () => {
    if (!splitFile) return;
    const parsed = parsePageRanges(rangeInput, splitFile.pageCount);
    if (parsed.error) {
      setSplitStatus({ type: 'error', text: parsed.error });
      return;
    }

    setIsSplitting(true);
    setSplitStatus(null);
    try {
      const srcBytes = await splitFile.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(srcDoc, parsed.indices);
      pages.forEach((p) => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const baseName = splitFile.name.replace(/\.pdf$/i, '');
      triggerBlobDownload(outBytes, `${baseName}-extracted-${pages.length}p.pdf`);
      setSplitStatus({
        type: 'success',
        text: `Extracted ${pages.length} page${pages.length === 1 ? '' : 's'} into a new PDF.`,
      });
    } catch {
      setSplitStatus({ type: 'error', text: 'Failed to extract pages from this PDF.' });
    } finally {
      setIsSplitting(false);
    }
  };

  // --- IMAGES TO PDF HANDLERS ---
  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageStatus(null);
    const loaded: QueuedImageFile[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const previewUrl = URL.createObjectURL(file);
      try {
        const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth || 800, h: img.naturalHeight || 1000 });
          img.onerror = reject;
          img.src = previewUrl;
        });
        loaded.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          name: file.name,
          previewUrl,
          width: dims.w,
          height: dims.h,
        });
      } catch {
        URL.revokeObjectURL(previewUrl);
      }
    }

    if (loaded.length > 0) {
      setImageQueue((prev) => [...prev, ...loaded]);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const moveImageItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= imageQueue.length) return;
    setImageQueue((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const removeImageItem = (id: string) => {
    setImageQueue((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleImagesToPdfDownload = async () => {
    if (imageQueue.length === 0) {
      setImageStatus({ type: 'error', text: 'Upload at least one JPG or PNG photo first.' });
      return;
    }

    setIsConvertingImages(true);
    setImageStatus(null);
    try {
      const pdfDoc = await PDFDocument.create();
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      for (const item of imageQueue) {
        const { bytes, kind } = await normalizeImageBytes(item.file);
        const embedded =
          kind === 'jpg' ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);

        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        const availWidth = A4_WIDTH - marginPt * 2;
        const availHeight = A4_HEIGHT - marginPt * 2;

        const scale = Math.min(availWidth / embedded.width, availHeight / embedded.height);
        const drawWidth = embedded.width * scale;
        const drawHeight = embedded.height * scale;
        const x = (A4_WIDTH - drawWidth) / 2;
        const y = (A4_HEIGHT - drawHeight) / 2;

        page.drawImage(embedded, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const outBytes = await pdfDoc.save();
      triggerBlobDownload(outBytes, `UniversityTutors-Notes-${imageQueue.length}pages-A4.pdf`);
      setImageStatus({
        type: 'success',
        text: `Created A4 PDF with ${imageQueue.length} page${imageQueue.length === 1 ? '' : 's'}.`,
      });
    } catch {
      setImageStatus({
        type: 'error',
        text: 'Could not convert one of the images. Try standard JPG or PNG files.',
      });
    } finally {
      setIsConvertingImages(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      {/* Top Mode Switcher Bar */}
      <div className="border-b border-slate-200 bg-[#F9FAFB] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="PDF Toolkit Modes">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'merge'}
            onClick={() => switchTab('merge')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'merge'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>Merge PDFs</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'split'}
            onClick={() => switchTab('split')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'split'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Split / Extract Pages</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'images'}
            onClick={() => switchTab('images')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'images'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Images to A4 PDF</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Zero upload · Browser-native PDF engine
        </span>
      </div>

      {/* TAB 1: MERGE PDFS */}
      {activeTab === 'merge' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleAddMergeFiles(e.dataTransfer.files);
            }}
            onClick={() => mergeInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-8 text-center transition-colors cursor-pointer"
          >
            <input
              ref={mergeInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(e) => handleAddMergeFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-bold text-[#111827]">
              Drop multiple PDF assignments here, or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Add cover sheets, essay chapters, and appendices in any order—reorder freely below.
            </p>
          </div>

          {mergeStatus && (
            <div
              className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-medium flex items-center gap-2.5 border ${
                mergeStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {mergeStatus.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{mergeStatus.text}</span>
            </div>
          )}

          {mergeQueue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827] tabular-nums">
                  Submission Queue ({mergeQueue.length} PDF{mergeQueue.length === 1 ? '' : 's'} ·{' '}
                  {mergeQueue.reduce((sum, f) => sum + f.pageCount, 0)} total pages)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMergeQueue([]);
                    setMergeStatus(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2.5">
                {mergeQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-[#F9FAFB] border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {item.pageCount} page{item.pageCount === 1 ? '' : 's'} · {formatBytes(item.sizeBytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveMergeItem(idx, -1)}
                        aria-label="Move up"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-300 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === mergeQueue.length - 1}
                        onClick={() => moveMergeItem(idx, 1)}
                        aria-label="Move down"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-orange-300 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMergeQueue((prev) => prev.filter((f) => f.id !== item.id))}
                        aria-label="Remove PDF"
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => mergeInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#111827] cursor-pointer"
                >
                  + Add More PDFs
                </button>

                <button
                  type="button"
                  disabled={isMerging || mergeQueue.length < 2}
                  onClick={handleMergeDownload}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isMerging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isMerging ? 'Merging PDFs...' : 'Merge & Download PDF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPLIT / EXTRACT PAGES */}
      {activeTab === 'split' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleSelectSplitFile(e.dataTransfer.files);
            }}
            onClick={() => splitInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-8 text-center transition-colors cursor-pointer"
          >
            <input
              ref={splitInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => handleSelectSplitFile(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-3">
              <Scissors className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-bold text-[#111827]">
              {splitFile ? `Loaded: ${splitFile.name}` : 'Select a textbook, lecture deck, or multi-page PDF'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {splitFile
                ? `${splitFile.pageCount} pages · ${formatBytes(splitFile.sizeBytes)} — Click to load a different PDF`
                : 'Extract specific chapters, problem sets, or rubric pages in original vector quality.'}
            </p>
          </div>

          {splitStatus && (
            <div
              className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-medium flex items-center gap-2.5 border ${
                splitStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {splitStatus.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{splitStatus.text}</span>
            </div>
          )}

          {splitFile && (
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label htmlFor="pdf-split-range" className="block text-sm font-bold text-[#111827]">
                    Pages or Ranges to Extract (Document has {splitFile.pageCount} pages)
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Example: <code className="font-mono text-slate-700">1-3, 5, 8-10</code>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applySplitPreset('first')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cover Page (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySplitPreset('odd')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Odd Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => applySplitPreset('even')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Even Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => applySplitPreset('all')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    All (1-{splitFile.pageCount})
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="pdf-split-range"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g., 1-4, 7, 12"
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-sm font-mono text-[#111827]"
                />
                <button
                  type="button"
                  disabled={isSplitting}
                  onClick={handleSplitDownload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSplitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isSplitting ? 'Extracting...' : 'Extract & Download PDF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMAGES TO A4 PDF */}
      {activeTab === 'images' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleAddImages(e.dataTransfer.files);
            }}
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#F97316] bg-[#F9FAFB] hover:bg-[#FFF7ED]/50 rounded-2xl p-8 text-center transition-colors cursor-pointer"
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              multiple
              onChange={(e) => handleAddImages(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto mb-3">
              <FileImage className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-bold text-[#111827]">
              Upload JPG / PNG photos of handwritten notes, math derivations, or whiteboard slides
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Every photo is proportionally centered onto a clean A4 portrait sheet without cropping equations.
            </p>
          </div>

          {imageStatus && (
            <div
              className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-medium flex items-center gap-2.5 border ${
                imageStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {imageStatus.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{imageStatus.text}</span>
            </div>
          )}

          {imageQueue.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-[#111827] tabular-nums">
                    A4 Pages ({imageQueue.length})
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Page Margin:</span>
                    {[
                      { label: 'Compact (16pt)', val: 16 },
                      { label: 'Standard (28pt)', val: 28 },
                      { label: 'Wide (44pt)', val: 44 },
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setMarginPt(m.val)}
                        className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${
                          marginPt === m.val
                            ? 'bg-[#FFF7ED] border-[#F97316] text-[#EA580C]'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    imageQueue.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                    setImageQueue([]);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  Clear Photos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageQueue.map((img, idx) => (
                  <div
                    key={img.id}
                    className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2.5"
                  >
                    <div className="relative aspect-[3/4] bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="max-w-full max-h-full object-contain"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#111827]/80 text-white font-mono text-[11px] font-bold tabular-nums">
                        P.{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#111827] truncate" title={img.name}>
                        {img.name}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImageItem(idx, -1)}
                            aria-label="Move page earlier"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === imageQueue.length - 1}
                            onClick={() => moveImageItem(idx, 1)}
                            aria-label="Move page later"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-300 disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImageItem(img.id)}
                          aria-label="Remove image"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#111827] cursor-pointer"
                >
                  + Add More Photos
                </button>

                <button
                  type="button"
                  disabled={isConvertingImages}
                  onClick={handleImagesToPdfDownload}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isConvertingImages ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {isConvertingImages
                      ? 'Building A4 PDF...'
                      : `Convert ${imageQueue.length} Photo${imageQueue.length === 1 ? '' : 's'} to A4 PDF`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
