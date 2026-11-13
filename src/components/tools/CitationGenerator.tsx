import React, { useState, useEffect } from 'react';
import {
  Quote,
  Globe,
  BookOpen,
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  FileDown,
} from 'lucide-react';
import { downloadAcademicReportPdf } from '../../utils/pdfReportGenerator';

type CitationStyle = 'APA7' | 'MLA9' | 'HARVARD' | 'CHICAGO' | 'IEEE';
type SourceKind = 'journal' | 'website' | 'book';

interface CitationSource {
  id: string;
  sourceKind: SourceKind;
  firstName: string;
  lastName: string;
  year: string;
  title: string;
  container: string; // Journal Name / Website Name / Publisher
  volume: string;
  issue: string;
  pages: string;
  urlOrDoi: string;
}

const STORAGE_KEY = 'uni_tutors_saved_bibliography_v1';

function formatCitation(
  src: CitationSource,
  style: CitationStyle,
  indexNumber = 1
): { inText: string; fullReference: string } {
  const first = src.firstName.trim();
  const last = src.lastName.trim() || 'Author';
  const initial = first ? `${first[0].toUpperCase()}.` : '';
  const year = src.year.trim() || 'n.d.';
  const title = src.title.trim() || 'Untitled work';
  const container = src.container.trim();
  const vol = src.volume.trim();
  const iss = src.issue.trim();
  const pages = src.pages.trim();
  const link = src.urlOrDoi.trim();

  if (style === 'APA7') {
    const authorPart = initial ? `${last}, ${initial}` : last;
    const inText = `(${last}, ${year})`;
    let ref = `${authorPart} (${year}). ${title}.`;
    if (src.sourceKind === 'journal') {
      if (container) ref += ` ${container}`;
      if (vol) ref += `, ${vol}`;
      if (iss) ref += `(${iss})`;
      if (pages) ref += `, ${pages}`;
      ref += '.';
    } else if (src.sourceKind === 'book') {
      if (container) ref += ` ${container}.`;
    } else {
      if (container) ref += ` ${container}.`;
    }
    if (link) ref += ` ${link}`;
    return { inText, fullReference: ref.replace(/\.\./g, '.') };
  }

  if (style === 'MLA9') {
    const authorPart = first ? `${last}, ${first}.` : `${last}.`;
    const inText = pages ? `(${last} ${pages.split('-')[0]})` : `(${last})`;
    let ref = `${authorPart} "${title}."`;
    if (container) ref += ` ${container},`;
    if (vol) ref += ` vol. ${vol},`;
    if (iss) ref += ` no. ${iss},`;
    if (year) ref += ` ${year},`;
    if (pages) ref += ` pp. ${pages}.`;
    if (link) ref += ` ${link}.`;
    return { inText, fullReference: ref.replace(/,\./g, '.').replace(/\.\./g, '.') };
  }

  if (style === 'HARVARD') {
    const authorPart = initial ? `${last}, ${initial}` : last;
    const inText = `(${last}, ${year})`;
    let ref = `${authorPart} (${year}) '${title}',`;
    if (container) ref += ` ${container},`;
    if (vol) ref += ` ${vol}${iss ? `(${iss})` : ''},`;
    if (pages) ref += ` pp. ${pages}.`;
    if (link) ref += ` Available at: ${link}.`;
    return { inText, fullReference: ref.replace(/,\./g, '.').replace(/\.\./g, '.') };
  }

  if (style === 'CHICAGO') {
    const authorPart = first ? `${last}, ${first}.` : `${last}.`;
    const inText = `(${last} ${year}${pages ? `, ${pages}` : ''})`;
    let ref = `${authorPart} ${year}. "${title}."`;
    if (container) ref += ` ${container}`;
    if (vol) ref += ` ${vol}`;
    if (iss) ref += `, no. ${iss}`;
    if (pages) ref += `: ${pages}`;
    ref += '.';
    if (link) ref += ` ${link}.`;
    return { inText, fullReference: ref.replace(/\.\./g, '.') };
  }

  // IEEE
  const ieeeAuthor = initial ? `${initial} ${last}` : last;
  const inText = `[${indexNumber}]`;
  let ref = `[${indexNumber}] ${ieeeAuthor}, "${title},"`;
  if (container) ref += ` ${container},`;
  if (vol) ref += ` vol. ${vol},`;
  if (iss) ref += ` no. ${iss},`;
  if (pages) ref += ` pp. ${pages},`;
  ref += ` ${year}.`;
  if (link) ref += ` [Online]. Available: ${link}`;
  return { inText, fullReference: ref.replace(/,\./g, '.') };
}

export default function CitationGenerator() {
  const [style, setStyle] = useState<CitationStyle>('APA7');
  const [sourceKind, setSourceKind] = useState<SourceKind>('journal');

  const [firstName, setFirstName] = useState('Elena');
  const [lastName, setLastName] = useState('Rostova');
  const [year, setYear] = useState('2025');
  const [title, setTitle] = useState(
    'Retrieval-augmented active recall strategies in undergraduate STEM education'
  );
  const [container, setContainer] = useState('Journal of Higher Education Pedagogy');
  const [volume, setVolume] = useState('42');
  const [issue, setIssue] = useState('3');
  const [pages, setPages] = useState('214-231');
  const [urlOrDoi, setUrlOrDoi] = useState('https://doi.org/10.1080/jhep.2025.00412');

  const [bibliography, setBibliography] = useState<CitationSource[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bibliography));
    } catch {
      // Ignore quota errors
    }
  }, [bibliography]);

  const currentSource: CitationSource = {
    id: 'draft',
    sourceKind,
    firstName,
    lastName,
    year,
    title,
    container,
    volume,
    issue,
    pages,
    urlOrDoi,
  };

  const livePreview = formatCitation(currentSource, style, bibliography.length + 1);

  const handleAddToBibliography = () => {
    if (!title.trim() && !lastName.trim()) return;
    setBibliography((prev) => [
      ...prev,
      {
        ...currentSource,
        id: `cit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    ]);
  };

  const formattedBibliography = bibliography.map((item, idx) => ({
    id: item.id,
    ...formatCitation(item, style, idx + 1),
  }));

  const handleCopyAll = () => {
    if (formattedBibliography.length === 0) return;
    const joined = formattedBibliography.map((b) => b.fullReference).join('\n\n');
    navigator.clipboard.writeText(joined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadBibTxt = () => {
    if (formattedBibliography.length === 0) return;
    const joined = formattedBibliography.map((b) => b.fullReference).join('\n\n');
    const blob = new Blob([joined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bibliography-${style}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleDownloadBibPdf = () => {
    const entries =
      formattedBibliography.length > 0
        ? formattedBibliography
        : [{ id: 'live', ...livePreview }];

    downloadAcademicReportPdf({
      filename: `Bibliography-${style}.pdf`,
      title: `Formatted Bibliography & Works Cited (${style})`,
      subtitle: 'Academic reference list & parenthetical in-text citations',
      badgeText: `${style} CITATIONS`,
      metadataRows: [
        { label: 'Citation Style', value: style },
        { label: 'Total Sources Included', value: `${entries.length}` },
      ],
      sections: [
        {
          heading: 'Full Reference List / Works Cited',
          lines: entries.flatMap((entry, idx) => [
            `${idx + 1}. ${entry.fullReference}`,
            `   In-Text Citation: ${entry.inText}`,
            '',
          ]),
        },
      ],
    });
  };

  const containerLabel =
    sourceKind === 'journal'
      ? 'Journal Name'
      : sourceKind === 'book'
      ? 'Publisher Name'
      : 'Website / Organization Name';

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {/* Top Style Selector Bar */}
        <div className="bg-[#F9FAFB] border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'APA7', label: 'APA 7th Edition' },
                { id: 'MLA9', label: 'MLA 9th Edition' },
                { id: 'HARVARD', label: 'Harvard' },
                { id: 'CHICAGO', label: 'Chicago' },
                { id: 'IEEE', label: 'IEEE' },
              ] as { id: CitationStyle; label: string }[]
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStyle(st.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  style === st.id
                    ? 'bg-[#F97316] text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Auto-formats In-Text + Works Cited live
          </span>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: SOURCE FORM */}
          <div className="lg:col-span-7 space-y-5">
            {/* Source Type Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'journal' as SourceKind, label: 'Journal Article', icon: <FileText className="w-4 h-4 shrink-0" /> },
                { id: 'website' as SourceKind, label: 'Website / Article', icon: <Globe className="w-4 h-4 shrink-0" /> },
                { id: 'book' as SourceKind, label: 'Book / Chapter', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
              ].map((sk) => (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => setSourceKind(sk.id)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    sourceKind === sk.id
                      ? 'bg-[#FFF7ED] border-[#F97316] text-[#EA580C]'
                      : 'bg-[#F9FAFB] border-slate-200 text-slate-700 hover:border-orange-200'
                  }`}
                >
                  {sk.icon}
                  <span>{sk.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Elena"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g., Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publication Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-[#111827] focus:border-[#F97316] focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Article, Webpage, or Book Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={sourceKind === 'journal' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {containerLabel}
                </label>
                <input
                  type="text"
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>

              {sourceKind === 'journal' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vol.</label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Issue</label>
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pages</label>
                    <input
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="12-28"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-[#111827]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DOI or Source URL
              </label>
              <input
                type="text"
                value={urlOrDoi}
                onChange={(e) => setUrlOrDoi(e.target.value)}
                placeholder="https://doi.org/10.xxxx/xxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW & BIBLIOGRAPHY ACTIONS */}
          <div className="lg:col-span-5 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                <Quote className="w-4 h-4" />
                Live {style} Preview
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Parenthetical In-Text Citation
              </span>
              <p className="text-sm font-mono font-bold text-[#111827]">{livePreview.inText}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Full Bibliography / Works Cited Entry
              </span>
              <p className="text-xs sm:text-sm text-[#111827] leading-relaxed pl-6 -indent-6 font-serif break-words">
                {livePreview.fullReference}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(livePreview.fullReference);
                  setCopiedSingle(true);
                  setTimeout(() => setCopiedSingle(false), 2000);
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 min-h-[44px] rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-xs font-semibold text-[#111827] cursor-pointer"
              >
                {copiedSingle ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedSingle ? 'Copied!' : 'Copy Citation'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToBibliography}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Bibliography</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBibPdf}
                className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 min-h-[44px] rounded-xl bg-[#FFF7ED] border border-orange-200 hover:border-[#F97316] text-[#EA580C] text-xs font-bold transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Citation / Bibliography PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED BIBLIOGRAPHY LIST */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-display font-bold text-[#111827] tabular-nums">
              Saved Bibliography List ({formattedBibliography.length} source
              {formattedBibliography.length === 1 ? '' : 's'} · {style})
            </h3>
            <p className="text-xs text-slate-500">
              Automatically saved in your browser—switch styles above to reformat your entire reference list at once.
            </p>
          </div>

          {formattedBibliography.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-200 bg-[#F9FAFB] hover:border-orange-300 text-xs font-semibold text-[#111827] cursor-pointer"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedAll ? 'All Copied!' : 'Copy All'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBibTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#111827] text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBibPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>

        {formattedBibliography.length === 0 ? (
          <div className="bg-[#F9FAFB] border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
            Click &ldquo;Add to Bibliography&rdquo; above to compile multiple references for your essay or thesis.
          </div>
        ) : (
          <div className="space-y-2.5">
            {formattedBibliography.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[11px] font-mono font-bold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/70 px-2 py-0.5 rounded">
                    In-text: {entry.inText}
                  </span>
                  <p className="text-xs sm:text-sm text-[#111827] font-serif leading-relaxed pl-6 -indent-6 break-words">
                    {entry.fullReference}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setBibliography((prev) => prev.filter((item) => item.id !== entry.id))
                  }
                  aria-label="Remove reference"
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
