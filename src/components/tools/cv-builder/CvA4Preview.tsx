import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, GripVertical, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import {
  CvCustomSection,
  CvDocumentData,
  CvSectionKey,
  isBuiltInSectionKey,
  normalizeHexColor,
} from './defaultCvData';

interface CvA4PreviewProps {
  data: CvDocumentData;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onPrint: () => void;
}

const A4_WIDTH_PX = 794; // 210mm at 96 DPI
const A4_MIN_HEIGHT_PX = 1123; // 297mm at 96 DPI

/**
 * Renders plain text containing **bold** markers into clean semantic <strong> nodes
 * without dangerouslySetInnerHTML, preserving 100% ATS text selection fidelity.
 */
function renderFormattedText(input: string): React.ReactNode {
  if (!input) return null;
  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((segment, idx) => {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#111827]">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{segment}</React.Fragment>;
  });
}

function splitBullets(multiline: string): string[] {
  return multiline
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}

export default function CvA4Preview({
  data,
  onMoveSection,
  onReorderSections,
  onPrint,
}: CvA4PreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);

  const [autoScale, setAutoScale] = useState(1);
  const [manualScale, setManualScale] = useState<number | null>(null);
  const [sheetHeightPx, setSheetHeightPx] = useState(A4_MIN_HEIGHT_PX);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const paddingAllowance = el.clientWidth < 460 ? 16 : 32;
      const availableWidth = el.clientWidth - paddingAllowance;
      if (availableWidth <= 0) return;
      const computed = Math.min(1, Math.max(0.32, availableWidth / A4_WIDTH_PX));
      setAutoScale(Number(computed.toFixed(3)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const measure = () => {
      setSheetHeightPx(Math.max(A4_MIN_HEIGHT_PX, sheet.offsetHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [data]);

  const effectiveScale = manualScale !== null ? manualScale : autoScale;
  const accentColor = normalizeHexColor(data.accentColor, '#0E4194');
  // Subtle tinted rule for section headers (35% opacity hex suffix)
  const sectionDividerColor = `${accentColor}59`;

  const headingStyle: React.CSSProperties = {
    color: accentColor,
    borderColor: sectionDividerColor,
  };

  // Filter non-empty items per section so blank sections automatically disappear
  const validEducation = data.education.filter(
    (e) => e.institution.trim() || e.degree.trim()
  );
  const validExperience = data.experience.filter(
    (ex) => ex.role.trim() || ex.company.trim() || splitBullets(ex.achievements).length > 0
  );
  const validProjects = data.projects.filter(
    (p) => p.title.trim() || splitBullets(p.outcomes).length > 0
  );
  const validSkillGroups = data.skillGroups.filter(
    (g) => g.category.trim() && g.skills.length > 0
  );
  const validCertifications = data.certifications.filter((c) => c.name.trim());
  const validLanguages = data.languages.filter((l) => l.language.trim());

  const customMap = new Map<string, CvCustomSection>(
    (data.customSections || []).map((c) => [c.id, c])
  );

  const isCustomSectionPopulated = (sec: CvCustomSection | undefined): boolean => {
    if (!sec) return false;
    if (sec.mode === 'bullets') {
      return sec.bullets.some((b) => b.trim().length > 0);
    }
    return sec.entries.some(
      (ent) =>
        ent.title.trim().length > 0 ||
        ent.subtitle.trim().length > 0 ||
        ent.description.trim().length > 0
    );
  };

  const isSectionPopulated = (key: CvSectionKey): boolean => {
    if (!isBuiltInSectionKey(key)) {
      return isCustomSectionPopulated(customMap.get(key));
    }
    switch (key) {
      case 'summary':
        return Boolean(data.summary.trim());
      case 'education':
        return validEducation.length > 0;
      case 'experience':
        return validExperience.length > 0;
      case 'projects':
        return validProjects.length > 0;
      case 'skills':
        return validSkillGroups.length > 0;
      case 'certifications':
        return validCertifications.length > 0;
      case 'languages':
        return validLanguages.length > 0;
    }
  };

  const renderCustomSectionPreview = (sec: CvCustomSection) => {
    const title = sec.title.trim() || 'Additional Information';
    if (sec.mode === 'bullets') {
      const items = sec.bullets.map((b) => b.trim()).filter(Boolean);
      return (
        <div>
          <h2
            style={headingStyle}
            className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2"
          >
            {title}
          </h2>
          <ul className="list-disc pl-4 space-y-1 text-[11.8px] leading-[1.5] text-slate-800">
            {items.map((item, idx) => (
              <li key={idx} className="cv-entry-block">
                {renderFormattedText(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    const entries = sec.entries.filter(
      (ent) => ent.title.trim() || ent.subtitle.trim() || ent.description.trim()
    );

    return (
      <div>
        <h2
          style={headingStyle}
          className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2.5"
        >
          {title}
        </h2>
        <div className="space-y-2.5">
          {entries.map((ent) => {
            const descLines = splitBullets(ent.description);
            return (
              <div key={ent.id} className="cv-entry-block">
                {(ent.title.trim() || ent.subtitle.trim() || ent.meta.trim()) && (
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[12.8px] font-bold text-[#111827]">
                      {ent.title.trim() || ent.subtitle.trim()}
                      {ent.title.trim() && ent.subtitle.trim() && (
                        <span className="font-semibold text-slate-700">
                          {' '}
                          — {ent.subtitle.trim()}
                        </span>
                      )}
                    </h3>
                    {ent.meta.trim() && (
                      <span className="text-[11.3px] font-semibold text-slate-700 shrink-0 tabular-nums">
                        {ent.meta.trim()}
                      </span>
                    )}
                  </div>
                )}

                {descLines.length > 1 ? (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11.8px] leading-[1.5] text-slate-800 mt-1">
                    {descLines.map((line, idx) => (
                      <li key={idx}>{renderFormattedText(line)}</li>
                    ))}
                  </ul>
                ) : descLines.length === 1 ? (
                  <p className="text-[11.8px] leading-[1.5] text-slate-800 mt-0.5">
                    {renderFormattedText(descLines[0])}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSectionBody = (key: CvSectionKey) => {
    if (!isBuiltInSectionKey(key)) {
      const customSec = customMap.get(key);
      if (!customSec) return null;
      return renderCustomSectionPreview(customSec);
    }

    switch (key) {
      case 'summary':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2"
            >
              Academic &amp; Career Profile
            </h2>
            <p className="text-[12px] leading-[1.55] text-slate-800">
              {renderFormattedText(data.summary.trim())}
            </p>
          </div>
        );

      case 'education':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2.5"
            >
              Education
            </h2>
            <div className="space-y-2.5">
              {validEducation.map((edu) => {
                const dateLabel = [edu.startDate.trim(), edu.endDate.trim()]
                  .filter(Boolean)
                  .join(' – ');
                return (
                  <div key={edu.id} className="cv-entry-block">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[13px] font-bold text-[#111827]">
                        {edu.institution || 'University Name'}
                      </h3>
                      {dateLabel && (
                        <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                          {dateLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-4 mt-0.5">
                      <p className="text-[12px] font-medium text-slate-800">
                        {edu.degree}
                        {edu.cgpa.trim() && (
                          <span className="text-slate-700"> · {edu.cgpa.trim()}</span>
                        )}
                      </p>
                      {edu.location.trim() && (
                        <span className="text-[11px] text-slate-600 shrink-0">
                          {edu.location.trim()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2.5"
            >
              Work Experience &amp; Internships
            </h2>
            <div className="space-y-3">
              {validExperience.map((exp) => {
                const bullets = splitBullets(exp.achievements);
                return (
                  <div key={exp.id} className="cv-entry-block">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[13px] font-bold text-[#111827]">
                        {exp.role}
                        {exp.company.trim() && (
                          <span className="font-semibold text-slate-700">
                            {' '}
                            — {exp.company.trim()}
                          </span>
                        )}
                      </h3>
                      {exp.dateRange.trim() && (
                        <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                          {exp.dateRange.trim()}
                        </span>
                      )}
                    </div>
                    {exp.location.trim() && (
                      <p className="text-[11px] text-slate-600 mb-1">{exp.location.trim()}</p>
                    )}
                    {bullets.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-[11.8px] leading-[1.5] text-slate-800 mt-1">
                        {bullets.map((b, i) => (
                          <li key={i}>{renderFormattedText(b)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2.5"
            >
              Academic &amp; Research Projects
            </h2>
            <div className="space-y-2.5">
              {validProjects.map((proj) => {
                const bullets = splitBullets(proj.outcomes);
                return (
                  <div key={proj.id} className="cv-entry-block">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[12.5px] font-bold text-[#111827]">
                        {proj.title}
                        {proj.link.trim() && (
                          <span className="font-normal text-[11px] text-slate-600">
                            {' '}
                            · {proj.link.trim().replace(/^https?:\/\//, '')}
                          </span>
                        )}
                      </h3>
                      {proj.date.trim() && (
                        <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                          {proj.date.trim()}
                        </span>
                      )}
                    </div>
                    {proj.techStack.trim() && (
                      <p
                        style={{ color: accentColor }}
                        className="text-[11.2px] font-semibold mt-0.5"
                      >
                        {proj.techStack.trim()}
                      </p>
                    )}
                    {bullets.length > 0 && (
                      <ul className="list-disc pl-4 space-y-0.5 text-[11.8px] leading-[1.5] text-slate-800 mt-1">
                        {bullets.map((b, i) => (
                          <li key={i}>{renderFormattedText(b)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2"
            >
              Skills &amp; Core Competencies
            </h2>
            <div className="space-y-1 text-[11.8px] leading-[1.5] text-slate-800">
              {validSkillGroups.map((group) => (
                <div key={group.id} className="cv-entry-block">
                  <strong className="font-bold text-[#111827]">{group.category}: </strong>
                  <span>{group.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2"
            >
              Certifications, Awards &amp; Test Scores
            </h2>
            <ul className="space-y-1 text-[11.8px] leading-[1.5] text-slate-800">
              {validCertifications.map((cert) => (
                <li
                  key={cert.id}
                  className="cv-entry-block flex items-baseline justify-between gap-4"
                >
                  <div>
                    <strong className="font-bold text-[#111827]">{cert.name}</strong>
                    {cert.issuer.trim() && (
                      <span className="text-slate-700"> — {cert.issuer.trim()}</span>
                    )}
                  </div>
                  {cert.year.trim() && (
                    <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                      {cert.year.trim()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'languages':
        return (
          <div>
            <h2
              style={headingStyle}
              className="text-[11px] font-bold uppercase tracking-[0.12em] border-b pb-1 mb-2"
            >
              Languages
            </h2>
            <p className="text-[11.8px] leading-[1.5] text-slate-800">
              {validLanguages.map((lang, idx) => (
                <React.Fragment key={lang.id}>
                  <strong className="font-bold text-[#111827]">{lang.language}</strong> (
                  {lang.proficiency}){idx < validLanguages.length - 1 ? '  ·  ' : ''}
                </React.Fragment>
              ))}
            </p>
          </div>
        );
    }
  };

  const contactItems = [
    data.personal.email.trim(),
    data.personal.phone.trim(),
    data.personal.location.trim(),
    data.personal.linkedinUrl.trim().replace(/^https?:\/\//, ''),
    data.personal.portfolioUrl.trim().replace(/^https?:\/\//, ''),
  ].filter(Boolean);

  return (
    <div className="space-y-3" id="cv-preview-panel">
      {/* Preview Canvas Control Strip (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFFFFF] border border-slate-200 rounded-2xl px-4 py-2.5 cv-no-print print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-[#111827]">Live A4 Preview</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            210mm × 297mm · ATS Vector PDF
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setManualScale((prev) =>
                Math.max(0.35, Number(((prev ?? effectiveScale) - 0.1).toFixed(2)))
              )
            }
            title="Zoom out"
            className="p-2 min-h-[40px] sm:min-h-0 sm:p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setManualScale(null)}
            title="Fit A4 to workspace width"
            className={`px-2.5 py-1.5 min-h-[40px] sm:min-h-0 sm:py-1 rounded-lg border text-xs font-mono font-semibold tabular-nums cursor-pointer ${
              manualScale === null
                ? 'bg-[#FFF7ED] border-orange-200 text-[#EA580C]'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              {Math.round(effectiveScale * 100)}%
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              setManualScale((prev) =>
                Math.min(1.15, Number(((prev ?? effectiveScale) + 0.1).toFixed(2)))
              )
            }
            title="Zoom in"
            className="p-2 min-h-[40px] sm:min-h-0 sm:p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="ml-1 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] sm:min-h-0 sm:py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download A4 PDF</span>
          </button>
        </div>
      </div>

      {/* Subtle Gray A4 Canvas Stage */}
      <div
        ref={containerRef}
        id="cv-preview-viewport"
        className="bg-slate-200/65 border border-slate-200/90 rounded-3xl p-2 sm:p-6 flex justify-center overflow-x-auto"
      >
        <div
          id="cv-scale-wrapper"
          style={{
            width: `${Math.round(A4_WIDTH_PX * effectiveScale)}px`,
            height: `${Math.round(sheetHeightPx * effectiveScale)}px`,
          }}
          className="relative transition-[width,height] duration-150 overflow-hidden sm:overflow-visible"
        >
          <article
            ref={sheetRef}
            id="cv-print-sheet"
            aria-label="Live A4 Resume Document Preview"
            style={{
              width: `${A4_WIDTH_PX}px`,
              minHeight: `${A4_MIN_HEIGHT_PX}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
            }}
            className="bg-[#FFFFFF] text-[#111827] shadow-md border border-slate-300/80 px-[54px] py-[46px] font-sans selection:bg-orange-100"
          >
            {/* A4 Document Header */}
            <header
              style={{ borderColor: accentColor }}
              className="flex items-start justify-between gap-5 pb-3.5 mb-4 border-b-2"
            >
              <div className="min-w-0 flex-1">
                <h1 className="text-[24px] font-display font-bold tracking-tight text-[#111827] leading-tight">
                  {data.personal.fullName.trim() || 'Your Full Name'}
                </h1>
                {data.personal.headline.trim() && (
                  <p
                    style={{ color: accentColor }}
                    className="text-[13px] font-semibold mt-0.5"
                  >
                    {data.personal.headline.trim()}
                  </p>
                )}
                {contactItems.length > 0 && (
                  <p className="text-[11.2px] text-slate-700 mt-1.5 leading-relaxed">
                    {contactItems.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <span>{item}</span>
                        {idx < contactItems.length - 1 && (
                          <span className="mx-1.5 text-slate-400" aria-hidden="true">
                            |
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>

              {/* Optional Profile Photo (Hidden automatically when showPhoto is false) */}
              {data.personal.showPhoto && data.personal.photoDataUrl && (
                <img
                  src={data.personal.photoDataUrl}
                  alt={data.personal.fullName || 'Candidate profile portrait'}
                  referrerPolicy="no-referrer"
                  className="w-[74px] h-[74px] rounded-xl object-cover border border-slate-300 shrink-0"
                />
              )}
            </header>

            {/* Ordered ATS Sections (Built-in + Dynamic Custom Sections) */}
            <div className="space-y-4">
              {data.sectionOrder.map((sectionKey, orderIdx) => {
                if (!isSectionPopulated(sectionKey)) return null;
                return (
                  <section
                    key={sectionKey}
                    draggable
                    onDragStart={() => setDraggedIdx(orderIdx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedIdx !== null && draggedIdx !== orderIdx) {
                        onReorderSections(draggedIdx, orderIdx);
                      }
                      setDraggedIdx(null);
                    }}
                    onDragEnd={() => setDraggedIdx(null)}
                    className={`group/sec relative rounded-lg transition-colors ${
                      draggedIdx === orderIdx ? 'opacity-50 bg-orange-50/40' : ''
                    }`}
                  >
                    {/* Subtle Hover Section Reorder Controls (Hidden on mobile & in print to prevent horizontal overflow) */}
                    <div className="hidden sm:flex cv-no-print print:hidden opacity-0 group-hover/sec:opacity-100 focus-within:opacity-100 transition-opacity absolute -left-10 top-0 flex-col items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <span
                        title="Drag section to reorder"
                        className="p-0.5 text-slate-400 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-3 h-3" />
                      </span>
                      <button
                        type="button"
                        disabled={orderIdx === 0}
                        onClick={() => onMoveSection(orderIdx, 'up')}
                        title="Move section up"
                        className="p-0.5 text-slate-500 hover:text-[#EA580C] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={orderIdx === data.sectionOrder.length - 1}
                        onClick={() => onMoveSection(orderIdx, 'down')}
                        title="Move section down"
                        className="p-0.5 text-slate-500 hover:text-[#EA580C] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {renderSectionBody(sectionKey)}
                  </section>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
