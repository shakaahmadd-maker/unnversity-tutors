import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Upload,
  Highlighter,
  Eye,
  EyeOff,
  List,
  LayoutList,
} from 'lucide-react';
import {
  CV_SECTION_LABELS,
  CustomCvSectionKey,
  CvCertificationItem,
  CvCustomDetailedEntry,
  CvCustomSection,
  CvCustomSectionMode,
  CvDocumentData,
  CvEducationItem,
  CvExperienceItem,
  CvLanguageItem,
  CvLanguageLevel,
  CvPersonalData,
  CvProjectItem,
  CvSectionKey,
  CvSkillGroup,
  LANGUAGE_PROFICIENCY_LEVELS,
  isBuiltInSectionKey,
} from './defaultCvData';

interface CvFormProps {
  data: CvDocumentData;
  onChange: React.Dispatch<React.SetStateAction<CvDocumentData>>;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
}

type AccordionKey = 'personal' | string;

const CUSTOM_SECTION_SUGGESTIONS: Array<{
  title: string;
  mode: CvCustomSectionMode;
  sampleBullets?: string[];
  sampleEntry?: Omit<CvCustomDetailedEntry, 'id'>;
}> = [
  {
    title: 'References',
    mode: 'detailed',
    sampleEntry: {
      title: 'Prof. Dr. Jonathan Vance',
      subtitle: 'Chair of Quantitative Computing, University College London',
      meta: 'Academic Advisor',
      description: 'Email: j.vance@ucl.ac.uk · Phone: +44 20 7679 2000',
    },
  },
  {
    title: 'Publications & Conference Papers',
    mode: 'detailed',
    sampleEntry: {
      title: 'Calibrated Readmission Risk Modeling on Longitudinal EHR Cohorts',
      subtitle: 'IEEE International Conference on Healthcare Informatics (ICHI)',
      meta: '2025',
      description: 'Co-authored statistical methodology and **SHAP fairness evaluation** appendix.',
    },
  },
  {
    title: 'Volunteering & Campus Leadership',
    mode: 'detailed',
    sampleEntry: {
      title: 'Student Academic Mentor & STEM Outreach Coordinator',
      subtitle: 'UCL Widening Participation Society',
      meta: '2024 – Present',
      description: 'Mentored **25 sixth-form students** on UCAS personal statements and Python fundamentals.',
    },
  },
  {
    title: 'Hobbies & Interests',
    mode: 'bullets',
    sampleBullets: [
      'Competitive University Chess Club (ECF 1780) & Mathematical Puzzle Design',
      'Half-Marathon Running & Alpine Trail Hiking',
    ],
  },
];

function moveArrayItem<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export default function CvForm({
  data,
  onChange,
  onMoveSection,
  onReorderSections,
}: CvFormProps) {
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    personal: true,
    summary: true,
    education: true,
    experience: false,
    projects: false,
    skills: false,
    certifications: false,
    languages: false,
  });

  const [draggedOrderIdx, setDraggedOrderIdx] = useState<number | null>(null);
  const [skillDrafts, setSkillDrafts] = useState<Record<string, string>>({});

  // Custom section creator state
  const [newSectionTitle, setNewSectionTitle] = useState<string>('');
  const [newSectionMode, setNewSectionMode] = useState<CvCustomSectionMode>('detailed');

  const summaryRef = useRef<HTMLTextAreaElement | null>(null);
  const expRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const projRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const customDescRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const toggleAccordion = (key: AccordionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePersonal = (patch: Partial<CvPersonalData>) => {
    onChange((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...patch },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updatePersonal({ photoDataUrl: reader.result, showPhoto: true });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /**
   * Wraps the currently selected range in `**...**` (or toggles off if already bolded)
   * so students can highlight metrics like **+22% efficiency** with one click.
   */
  const applyBoldHighlight = (
    textarea: HTMLTextAreaElement | null,
    currentValue: string,
    applyValue: (nextVal: string) => void,
    fallbackSnippet = 'key metric'
  ) => {
    if (!textarea) {
      applyValue(
        currentValue
          ? `${currentValue}${currentValue.endsWith(' ') ? '' : ' '}**${fallbackSnippet}**`
          : `**${fallbackSnippet}**`
      );
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const selected = currentValue.slice(start, end);

    let nextText = '';
    let nextCursorStart = start;
    let nextCursorEnd = end;

    if (selected.length > 0) {
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length > 4) {
        const unwrapped = selected.slice(2, -2);
        nextText = currentValue.slice(0, start) + unwrapped + currentValue.slice(end);
        nextCursorEnd = start + unwrapped.length;
      } else {
        const wrapped = `**${selected}**`;
        nextText = currentValue.slice(0, start) + wrapped + currentValue.slice(end);
        nextCursorEnd = start + wrapped.length;
      }
    } else {
      const token = `**${fallbackSnippet}**`;
      nextText = currentValue.slice(0, start) + token + currentValue.slice(end);
      nextCursorStart = start + 2;
      nextCursorEnd = start + 2 + fallbackSnippet.length;
    }

    applyValue(nextText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorStart, nextCursorEnd);
    });
  };

  // Summary word & character counts
  const cleanSummary = data.summary.replace(/\*\*/g, '').trim();
  const summaryWords = cleanSummary ? cleanSummary.split(/\s+/).length : 0;
  const summaryChars = cleanSummary.length;

  // Apply quick section order presets (Student vs. Industry)
  const applyPresetOrder = (educationFirst: boolean) => {
    onChange((prev) => {
      const rest = prev.sectionOrder.filter(
        (k) => k !== 'summary' && k !== 'education' && k !== 'experience'
      );
      const nextOrder: CvSectionKey[] = educationFirst
        ? ['summary', 'education', 'experience', ...rest]
        : ['summary', 'experience', 'education', ...rest];
      return { ...prev, sectionOrder: nextOrder };
    });
  };

  const addSkillToGroup = (groupId: string) => {
    const raw = (skillDrafts[groupId] || '').trim();
    if (!raw) return;
    const entries = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!entries.length) return;

    onChange((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((g) => {
        if (g.id !== groupId) return g;
        const existing = new Set(g.skills);
        entries.forEach((item) => existing.add(item));
        return { ...g, skills: Array.from(existing) };
      }),
    }));
    setSkillDrafts((prev) => ({ ...prev, [groupId]: '' }));
  };

  const updateCustomSection = (
    sectionId: CustomCvSectionKey,
    updater: (sec: CvCustomSection) => CvCustomSection
  ) => {
    onChange((prev) => ({
      ...prev,
      customSections: prev.customSections.map((sec) =>
        sec.id === sectionId ? updater(sec) : sec
      ),
    }));
  };

  const handleDeleteCustomSection = (sectionId: CustomCvSectionKey) => {
    onChange((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== sectionId),
      sectionOrder: prev.sectionOrder.filter((k) => k !== sectionId),
    }));
  };

  const handleCreateCustomSection = (presetOverride?: (typeof CUSTOM_SECTION_SUGGESTIONS)[number]) => {
    const cleanTitle = (presetOverride ? presetOverride.title : newSectionTitle).trim();
    if (!cleanTitle) return;
    const chosenMode: CvCustomSectionMode = presetOverride ? presetOverride.mode : newSectionMode;
    const newId: CustomCvSectionKey = `custom-${Date.now()}`;

    const initialBullets =
      presetOverride?.sampleBullets && presetOverride.sampleBullets.length > 0
        ? [...presetOverride.sampleBullets]
        : [''];

    const initialEntries: CvCustomDetailedEntry[] = presetOverride?.sampleEntry
      ? [{ id: `${newId}-ent-1`, ...presetOverride.sampleEntry }]
      : [
          {
            id: `${newId}-ent-1`,
            title: '',
            subtitle: '',
            meta: '',
            description: '',
          },
        ];

    const created: CvCustomSection = {
      id: newId,
      title: cleanTitle,
      mode: chosenMode,
      bullets: initialBullets,
      entries: initialEntries,
    };

    onChange((prev) => ({
      ...prev,
      customSections: [...prev.customSections, created],
      sectionOrder: [...prev.sectionOrder, newId],
    }));

    setOpenSections((prev) => ({ ...prev, [newId]: true }));
    if (!presetOverride) {
      setNewSectionTitle('');
    }
  };

  const renderCustomSectionEditor = (customSec: CvCustomSection) => {
    return (
      <div className="space-y-4">
        {/* Section Title + Structure Mode Switcher + Delete */}
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Section Heading (Shown on CV &amp; PDF)
              </label>
              <input
                type="text"
                value={customSec.title}
                onChange={(e) =>
                  updateCustomSection(customSec.id, (sec) => ({
                    ...sec,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., References, Publications, Volunteering, Hobbies"
                className="w-full px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleDeleteCustomSection(customSec.id)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Section</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-600">Section Layout Structure:</span>
            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200">
              <button
                type="button"
                onClick={() =>
                  updateCustomSection(customSec.id, (sec) => ({
                    ...sec,
                    mode: 'bullets',
                    bullets: sec.bullets.length > 0 ? sec.bullets : [''],
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  customSec.mode === 'bullets'
                    ? 'bg-[#F97316] text-white'
                    : 'text-slate-600 hover:text-[#111827]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Bullet Points</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  updateCustomSection(customSec.id, (sec) => ({
                    ...sec,
                    mode: 'detailed',
                    entries:
                      sec.entries.length > 0
                        ? sec.entries
                        : [
                            {
                              id: `${sec.id}-ent-${Date.now()}`,
                              title: '',
                              subtitle: '',
                              meta: '',
                              description: '',
                            },
                          ],
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  customSec.mode === 'detailed'
                    ? 'bg-[#F97316] text-white'
                    : 'text-slate-600 hover:text-[#111827]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Detailed Entries</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode 1: Bullet Points / List Items */}
        {customSec.mode === 'bullets' ? (
          <div className="space-y-2.5">
            {customSec.bullets.map((bullet, bIdx) => (
              <div
                key={`${customSec.id}-b-${bIdx}`}
                className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-3 flex items-start gap-2"
              >
                <span className="text-xs font-mono font-bold text-[#EA580C] pt-2 shrink-0 tabular-nums">
                  {bIdx + 1}.
                </span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) =>
                    updateCustomSection(customSec.id, (sec) => ({
                      ...sec,
                      bullets: sec.bullets.map((it, idx) => (idx === bIdx ? e.target.value : it)),
                    }))
                  }
                  placeholder="Enter list item (wrap key words in **bold** if desired)..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={bIdx === 0}
                    onClick={() =>
                      updateCustomSection(customSec.id, (sec) => ({
                        ...sec,
                        bullets: moveArrayItem(sec.bullets, bIdx, 'up'),
                      }))
                    }
                    title="Move item up"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={bIdx === customSec.bullets.length - 1}
                    onClick={() =>
                      updateCustomSection(customSec.id, (sec) => ({
                        ...sec,
                        bullets: moveArrayItem(sec.bullets, bIdx, 'down'),
                      }))
                    }
                    title="Move item down"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateCustomSection(customSec.id, (sec) => ({
                        ...sec,
                        bullets: sec.bullets.filter((_, idx) => idx !== bIdx),
                      }))
                    }
                    title="Remove bullet"
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                updateCustomSection(customSec.id, (sec) => ({
                  ...sec,
                  bullets: [...sec.bullets, ''],
                }))
              }
              className="w-full py-2.5 px-4 min-h-[44px] rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Bullet Item</span>
            </button>
          </div>
        ) : (
          /* Mode 2: Detailed Entries (Title, Subtitle/Role, Date/Meta, Description/Contact) */
          <div className="space-y-3.5">
            {customSec.entries.map((ent, eIdx) => (
              <div
                key={ent.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-[#111827] tabular-nums">
                    {customSec.title || 'Custom'} Entry #{eIdx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={eIdx === 0}
                      onClick={() =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: moveArrayItem(sec.entries, eIdx, 'up'),
                        }))
                      }
                      title="Move entry up"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={eIdx === customSec.entries.length - 1}
                      onClick={() =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: moveArrayItem(sec.entries, eIdx, 'down'),
                        }))
                      }
                      title="Move entry down"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: sec.entries.filter((item) => item.id !== ent.id),
                        }))
                      }
                      title="Remove entry"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Title / Name
                    </label>
                    <input
                      type="text"
                      value={ent.title}
                      onChange={(e) =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: sec.entries.map((it) =>
                            it.id === ent.id ? { ...it, title: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., Prof. Sarah Jenkins / Paper Title"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subtitle / Role / Organization
                    </label>
                    <input
                      type="text"
                      value={ent.subtitle}
                      onChange={(e) =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: sec.entries.map((it) =>
                            it.id === ent.id ? { ...it, subtitle: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., Head of Lab, Oxford / Journal Name"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date / Location / Relation (Optional Right-Aligned Meta)
                    </label>
                    <input
                      type="text"
                      value={ent.meta}
                      onChange={(e) =>
                        updateCustomSection(customSec.id, (sec) => ({
                          ...sec,
                          entries: sec.entries.map((it) =>
                            it.id === ent.id ? { ...it, meta: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., 2024 – Present · Thesis Supervisor"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Description / Contact Info / Bullet Details
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        applyBoldHighlight(
                          customDescRefs.current[ent.id] || null,
                          ent.description,
                          (val) =>
                            updateCustomSection(customSec.id, (sec) => ({
                              ...sec,
                              entries: sec.entries.map((it) =>
                                it.id === ent.id ? { ...it, description: val } : it
                              ),
                            })),
                          'key detail'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-[11px] font-semibold cursor-pointer"
                    >
                      <Highlighter className="w-3 h-3" />
                      <span>Highlight Text</span>
                    </button>
                  </div>
                  <textarea
                    ref={(el) => {
                      customDescRefs.current[ent.id] = el;
                    }}
                    rows={3}
                    value={ent.description}
                    onChange={(e) =>
                      updateCustomSection(customSec.id, (sec) => ({
                        ...sec,
                        entries: sec.entries.map((it) =>
                          it.id === ent.id ? { ...it, description: e.target.value } : it
                        ),
                      }))
                    }
                    placeholder="Enter contact details, publication DOI, or multi-line bullet points..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs leading-relaxed text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newEnt: CvCustomDetailedEntry = {
                  id: `${customSec.id}-ent-${Date.now()}`,
                  title: '',
                  subtitle: '',
                  meta: '',
                  description: '',
                };
                updateCustomSection(customSec.id, (sec) => ({
                  ...sec,
                  entries: [...sec.entries, newEnt],
                }));
              }}
              className="w-full py-2.5 px-4 min-h-[44px] rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + {customSec.title || 'Custom'} Entry</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSectionContent = (sectionKey: CvSectionKey) => {
    if (!isBuiltInSectionKey(sectionKey)) {
      const foundCustom = data.customSections.find((c) => c.id === sectionKey);
      if (!foundCustom) return null;
      return renderCustomSectionEditor(foundCustom);
    }

    switch (sectionKey) {
      case 'summary':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500 tabular-nums">
                <span className="font-semibold text-[#111827]">{summaryWords} words</span>
                <span aria-hidden="true"> · </span>
                <span>{summaryChars} characters</span>
                <span aria-hidden="true"> · </span>
                <span className={summaryWords >= 30 && summaryWords <= 75 ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  Target: 35–70 words
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  applyBoldHighlight(
                    summaryRef.current,
                    data.summary,
                    (val) => onChange((prev) => ({ ...prev, summary: val })),
                    '3.9 GPA'
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Highlight Text</span>
              </button>
            </div>

            <textarea
              ref={summaryRef}
              rows={4}
              value={data.summary}
              onChange={(e) => onChange((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Summarize your degree specialization, research or internship experience, and measurable strengths..."
              className="w-full p-3 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm leading-relaxed text-[#111827]"
            />

            <div className="bg-[#F9FAFB] border border-slate-200/90 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-[#111827]">Quick Student Summary Formula:</p>
              <p className="leading-relaxed">
                1) Degree &amp; graduation year + 2) Core technical/research methods + 3) One quantified internship, lab, or leadership result (select any phrase and click <strong>Highlight Text</strong> to bold it on the A4 preview).
              </p>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-3.5">
            {data.education.map((edu, idx) => (
              <div
                key={edu.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-[#111827] tabular-nums">
                    Education #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          education: moveArrayItem(prev.education, idx, 'up'),
                        }))
                      }
                      title="Move up"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.education.length - 1}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          education: moveArrayItem(prev.education, idx, 'down'),
                        }))
                      }
                      title="Move down"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.filter((item) => item.id !== edu.id),
                        }))
                      }
                      title="Remove entry"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution / University Name
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, institution: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., University of Toronto"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree &amp; Major
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, degree: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., BSc (Hons) Molecular Biology"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, location: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="City, Country"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CGPA / Honours Grade
                    </label>
                    <input
                      type="text"
                      value={edu.cgpa}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, cgpa: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., 3.88 / 4.0 GPA"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, startDate: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="Sep 2023"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Graduation Date (or Expected)
                    </label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          education: prev.education.map((it) =>
                            it.id === edu.id ? { ...it, endDate: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="Jun 2027 (Expected)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newEntry: CvEducationItem = {
                  id: `edu-${Date.now()}`,
                  institution: '',
                  degree: '',
                  location: '',
                  startDate: '',
                  endDate: 'Expected 2027',
                  cgpa: '',
                };
                onChange((prev) => ({ ...prev, education: [...prev.education, newEntry] }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Education</span>
            </button>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-3.5">
            {data.experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-[#111827] tabular-nums">
                    Experience / Internship #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          experience: moveArrayItem(prev.experience, idx, 'up'),
                        }))
                      }
                      title="Move up"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.experience.length - 1}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          experience: moveArrayItem(prev.experience, idx, 'down'),
                        }))
                      }
                      title="Move down"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((item) => item.id !== exp.id),
                        }))
                      }
                      title="Remove entry"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          experience: prev.experience.map((it) =>
                            it.id === exp.id ? { ...it, role: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., Summer Research Intern"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          experience: prev.experience.map((it) =>
                            it.id === exp.id ? { ...it, company: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., BioLab Institute"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          experience: prev.experience.map((it) =>
                            it.id === exp.id ? { ...it, location: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., Boston, MA"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date Range
                    </label>
                    <input
                      type="text"
                      value={exp.dateRange}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          experience: prev.experience.map((it) =>
                            it.id === exp.id ? { ...it, dateRange: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="Jun 2025 – Aug 2025"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Key Achievements (One bullet per line)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        applyBoldHighlight(
                          expRefs.current[exp.id] || null,
                          exp.achievements,
                          (val) =>
                            onChange((prev) => ({
                              ...prev,
                              experience: prev.experience.map((it) =>
                                it.id === exp.id ? { ...it, achievements: val } : it
                              ),
                            })),
                          '+20% efficiency'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-[11px] font-semibold cursor-pointer"
                    >
                      <Highlighter className="w-3 h-3" />
                      <span>Highlight Text</span>
                    </button>
                  </div>
                  <textarea
                    ref={(el) => {
                      expRefs.current[exp.id] = el;
                    }}
                    rows={4}
                    value={exp.achievements}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        experience: prev.experience.map((it) =>
                          it.id === exp.id ? { ...it, achievements: e.target.value } : it
                        ),
                      }))
                    }
                    placeholder="Select a metric and click 'Highlight Text' to bold it (e.g., **+18% accuracy**)..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs leading-relaxed text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newExp: CvExperienceItem = {
                  id: `exp-${Date.now()}`,
                  role: '',
                  company: '',
                  location: '',
                  dateRange: '',
                  achievements: '',
                };
                onChange((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Work Experience / Internship</span>
            </button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-3.5">
            {data.projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-[#111827] tabular-nums">
                    Academic / Research Project #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          projects: moveArrayItem(prev.projects, idx, 'up'),
                        }))
                      }
                      title="Move up"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.projects.length - 1}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          projects: moveArrayItem(prev.projects, idx, 'down'),
                        }))
                      }
                      title="Move down"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((item) => item.id !== proj.id),
                        }))
                      }
                      title="Remove project"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project / Dissertation Title
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          projects: prev.projects.map((it) =>
                            it.id === proj.id ? { ...it, title: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., Honours Capstone Research Project"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tech Stack / Laboratory Methods
                    </label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          projects: prev.projects.map((it) =>
                            it.id === proj.id ? { ...it, techStack: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="e.g., PCR · Gel Electrophoresis · R / ggplot2"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={proj.date}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          projects: prev.projects.map((it) =>
                            it.id === proj.id ? { ...it, date: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="Spring 2025"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project / Paper Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={proj.link}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          projects: prev.projects.map((it) =>
                            it.id === proj.id ? { ...it, link: e.target.value } : it
                          ),
                        }))
                      }
                      placeholder="github.com/username/project"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Bullet-Point Outcomes (One per line)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        applyBoldHighlight(
                          projRefs.current[proj.id] || null,
                          proj.outcomes,
                          (val) =>
                            onChange((prev) => ({
                              ...prev,
                              projects: prev.projects.map((it) =>
                                it.id === proj.id ? { ...it, outcomes: val } : it
                              ),
                            })),
                          '95% accuracy'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-[11px] font-semibold cursor-pointer"
                    >
                      <Highlighter className="w-3 h-3" />
                      <span>Highlight Text</span>
                    </button>
                  </div>
                  <textarea
                    ref={(el) => {
                      projRefs.current[proj.id] = el;
                    }}
                    rows={3}
                    value={proj.outcomes}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        projects: prev.projects.map((it) =>
                          it.id === proj.id ? { ...it, outcomes: e.target.value } : it
                        ),
                      }))
                    }
                    placeholder="Describe your research methodology and quantitative findings..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs leading-relaxed text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newProj: CvProjectItem = {
                  id: `proj-${Date.now()}`,
                  title: '',
                  techStack: '',
                  date: '',
                  link: '',
                  outcomes: '',
                };
                onChange((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Academic Project</span>
            </button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-3.5">
            {data.skillGroups.map((group, idx) => (
              <div
                key={group.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={group.category}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        skillGroups: prev.skillGroups.map((g) =>
                          g.id === group.id ? { ...g, category: e.target.value } : g
                        ),
                      }))
                    }
                    placeholder="Category (e.g., Laboratory & Research)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          skillGroups: moveArrayItem(prev.skillGroups, idx, 'up'),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.skillGroups.length - 1}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          skillGroups: moveArrayItem(prev.skillGroups, idx, 'down'),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          skillGroups: prev.skillGroups.filter((g) => g.id !== group.id),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillDrafts[group.id] || ''}
                    onChange={(e) =>
                      setSkillDrafts((prev) => ({ ...prev, [group.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillToGroup(group.id);
                      }
                    }}
                    placeholder="Type skill (or comma-separated list) & press Enter..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addSkillToGroup(group.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Add +
                  </button>
                </div>

                {group.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            skillGroups: prev.skillGroups.map((g) =>
                              g.id === group.id
                                ? { ...g, skills: g.skills.filter((s) => s !== sk) }
                                : g
                            ),
                          }))
                        }
                        title="Click to remove skill"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-red-300 text-xs text-[#111827] cursor-pointer"
                      >
                        <span>{sk}</span>
                        <span className="text-slate-400 font-bold">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newGroup: CvSkillGroup = {
                  id: `sg-${Date.now()}`,
                  category: 'Laboratory & Research',
                  skills: [],
                };
                onChange((prev) => ({ ...prev, skillGroups: [...prev.skillGroups, newGroup] }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Skill Category</span>
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-3">
            {data.certifications.map((cert, idx) => (
              <div
                key={cert.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((c) =>
                          c.id === cert.id ? { ...c, name: e.target.value } : c
                        ),
                      }))
                    }
                    placeholder="Award, Test Score, or Certificate (e.g., IELTS 8.0, Dean's List)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          certifications: moveArrayItem(prev.certifications, idx, 'up'),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.certifications.length - 1}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          certifications: moveArrayItem(prev.certifications, idx, 'down'),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          certifications: prev.certifications.filter((c) => c.id !== cert.id),
                        }))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((c) =>
                          c.id === cert.id ? { ...c, issuer: e.target.value } : c
                        ),
                      }))
                    }
                    placeholder="Issuing Body (e.g., ETS, Coursera)"
                    className="col-span-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((c) =>
                          c.id === cert.id ? { ...c, year: e.target.value } : c
                        ),
                      }))
                    }
                    placeholder="Year"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-[#111827] tabular-nums focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newCert: CvCertificationItem = {
                  id: `cert-${Date.now()}`,
                  name: '',
                  issuer: '',
                  year: '2026',
                };
                onChange((prev) => ({
                  ...prev,
                  certifications: [...prev.certifications, newCert],
                }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Certification / Award / Test Score</span>
            </button>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-3">
            {data.languages.map((lang, idx) => (
              <div
                key={lang.id}
                className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3 flex flex-wrap sm:flex-nowrap items-center gap-2"
              >
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      languages: prev.languages.map((l) =>
                        l.id === lang.id ? { ...l, language: e.target.value } : l
                      ),
                    }))
                  }
                  placeholder="Language (e.g., German)"
                  className="flex-1 min-w-[120px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      languages: prev.languages.map((l) =>
                        l.id === lang.id
                          ? { ...l, proficiency: e.target.value as CvLanguageLevel }
                          : l
                      ),
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-[#111827] focus:border-[#F97316] focus:outline-none"
                >
                  {LANGUAGE_PROFICIENCY_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        languages: moveArrayItem(prev.languages, idx, 'up'),
                      }))
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === data.languages.length - 1}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        languages: moveArrayItem(prev.languages, idx, 'down'),
                      }))
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#EA580C] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        languages: prev.languages.filter((l) => l.id !== lang.id),
                      }))
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newLang: CvLanguageItem = {
                  id: `lang-${Date.now()}`,
                  language: '',
                  proficiency: 'Fluent (C1/C2)',
                };
                onChange((prev) => ({ ...prev, languages: [...prev.languages, newLang] }));
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 bg-[#FFF7ED]/70 hover:bg-[#FFF7ED] text-[#EA580C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add + Language</span>
            </button>
          </div>
        );
    }
  };

  const isEduBeforeExp =
    data.sectionOrder.indexOf('education') < data.sectionOrder.indexOf('experience');

  return (
    <div className="space-y-3.5">
      {/* Quick Section Priority Switcher (Student vs. Experienced Order) */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-[#111827]">
            ATS Section Order (Drag or Use Arrows Below)
          </h2>
          <p className="text-[11px] text-slate-500">
            Current students should place Education above Work Experience; alumni with full-time roles can place Work first.
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-[#F9FAFB] border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => applyPresetOrder(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isEduBeforeExp
                ? 'bg-[#F97316] text-white'
                : 'text-slate-600 hover:text-[#111827]'
            }`}
          >
            Education First
          </button>
          <button
            type="button"
            onClick={() => applyPresetOrder(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              !isEduBeforeExp
                ? 'bg-[#F97316] text-white'
                : 'text-slate-600 hover:text-[#111827]'
            }`}
          >
            Experience First
          </button>
        </div>
      </div>

      {/* 1. FIXED TOP ACCORDION: PERSONAL INFORMATION */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleAccordion('personal')}
          aria-expanded={openSections.personal}
          className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center tabular-nums">
              01
            </span>
            <span className="text-sm font-display font-bold text-[#111827]">
              Personal Information &amp; Header Links
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${
              openSections.personal ? 'rotate-180 text-[#F97316]' : ''
            }`}
          />
        </button>

        {openSections.personal && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) => updatePersonal({ fullName: e.target.value })}
                  placeholder="Your Full Name"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-sm font-semibold text-[#111827]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Title / Degree Headline
                </label>
                <input
                  type="text"
                  value={data.personal.headline}
                  onChange={(e) => updatePersonal({ headline: e.target.value })}
                  placeholder="e.g., MSc Biotechnology Candidate · Graduate Research Applicant"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => updatePersonal({ email: e.target.value })}
                  placeholder="student@university.edu"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal({ phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City &amp; Country
                </label>
                <input
                  type="text"
                  value={data.personal.location}
                  onChange={(e) => updatePersonal({ location: e.target.value })}
                  placeholder="London, United Kingdom"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={data.personal.linkedinUrl}
                  onChange={(e) => updatePersonal({ linkedinUrl: e.target.value })}
                  placeholder="linkedin.com/in/yourname"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Academic Portfolio / Google Scholar URL
                </label>
                <input
                  type="text"
                  value={data.personal.portfolioUrl}
                  onChange={(e) => updatePersonal({ portfolioUrl: e.target.value })}
                  placeholder="github.com/yourhandle or portfolio.edu"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs text-[#111827]"
                />
              </div>
            </div>

            {/* Optional Profile Photo Upload + US/UK vs EU ATS Visibility Toggle */}
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#111827]">
                  Optional Profile Photo (Region-Specific ATS Control)
                </p>
                <p className="text-[11px] text-slate-500">
                  Keep hidden for strict US/UK/Canada ATS resumes; enable when applying to EU/DACH or Asia roles requesting a headshot.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#F97316] text-xs font-semibold text-[#111827] cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{data.personal.photoDataUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                </button>

                {data.personal.photoDataUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => updatePersonal({ showPhoto: !data.personal.showPhoto })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        data.personal.showPhoto
                          ? 'bg-[#FFF7ED] border-orange-300 text-[#EA580C]'
                          : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {data.personal.showPhoto ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Shown on CV</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden (US/UK ATS)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePersonal({ photoDataUrl: '', showPhoto: false })}
                      title="Remove uploaded photo"
                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2–N. REORDERABLE CV SECTIONS (BUILT-IN + DYNAMIC CUSTOM SECTIONS) */}
      {data.sectionOrder.map((sectionKey, orderIdx) => {
        const isOpen = Boolean(openSections[sectionKey]);
        const displayNumber = String(orderIdx + 2).padStart(2, '0');
        const isBuiltIn = isBuiltInSectionKey(sectionKey);
        const customSectionObj = !isBuiltIn
          ? data.customSections.find((c) => c.id === sectionKey)
          : undefined;
        if (!isBuiltIn && !customSectionObj) return null;

        const sectionLabel = isBuiltIn
          ? CV_SECTION_LABELS[sectionKey]
          : customSectionObj?.title?.trim() || 'Custom Section';

        return (
          <div
            key={sectionKey}
            draggable
            onDragStart={() => setDraggedOrderIdx(orderIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedOrderIdx !== null && draggedOrderIdx !== orderIdx) {
                onReorderSections(draggedOrderIdx, orderIdx);
              }
              setDraggedOrderIdx(null);
            }}
            onDragEnd={() => setDraggedOrderIdx(null)}
            className={`bg-[#FFFFFF] border rounded-2xl overflow-hidden transition-colors ${
              draggedOrderIdx === orderIdx
                ? 'border-[#F97316] opacity-70'
                : 'border-slate-200'
            }`}
          >
            <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/70 transition-colors">
              <button
                type="button"
                onClick={() => toggleAccordion(sectionKey)}
                aria-expanded={isOpen}
                className="flex-1 flex items-center gap-2.5 text-left cursor-pointer min-w-0 min-h-[44px] sm:min-h-0"
              >
                <span
                  title="Drag section to reorder"
                  className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
                >
                  <GripVertical className="w-4 h-4" />
                </span>
                <span className="w-6 h-6 rounded-lg bg-[#FFF7ED] border border-orange-200 text-[#EA580C] font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                  {displayNumber}
                </span>
                <span className="text-sm font-display font-bold text-[#111827] truncate">
                  {sectionLabel}
                </span>
                {!isBuiltIn && (
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 hidden sm:inline">
                    · Custom
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={orderIdx === 0}
                  onClick={() => onMoveSection(orderIdx, 'up')}
                  title="Move section earlier on CV"
                  className="p-2 sm:p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#EA580C] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={orderIdx === data.sectionOrder.length - 1}
                  onClick={() => onMoveSection(orderIdx, 'down')}
                  title="Move section later on CV"
                  className="p-2 sm:p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#EA580C] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                {!isBuiltIn && customSectionObj && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomSection(customSectionObj.id)}
                    title="Delete custom section"
                    className="p-2 sm:p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleAccordion(sectionKey)}
                  aria-label={`Toggle ${sectionLabel}`}
                  className="p-2 sm:p-1.5 rounded-lg text-slate-500 hover:text-[#F97316] cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? 'rotate-180 text-[#F97316]' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100">
                {renderSectionContent(sectionKey)}
              </div>
            )}
          </div>
        );
      })}

      {/* + ADD NEW CUSTOM SECTION BUILDER CARD */}
      <div className="bg-[#FFFFFF] border-2 border-dashed border-orange-300 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-display font-bold text-[#111827] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>+ Add New Custom Section</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Append tailored academic or career sections—such as References, Publications, Volunteering, or Hobbies &amp; Interests—and reorder them anywhere on your CV.
          </p>
        </div>

        {/* One-Click Quick Add Templates */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold text-slate-500">
            Quick-Add Popular Sections:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CUSTOM_SECTION_SUGGESTIONS.map((sug) => (
              <button
                key={sug.title}
                type="button"
                onClick={() => handleCreateCustomSection(sug)}
                className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[40px] sm:min-h-0 rounded-xl bg-[#FFF7ED] hover:bg-[#F97316] text-[#EA580C] hover:text-white border border-orange-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span>{sug.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Title + Structure Selector */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div>
            <label
              htmlFor="new-custom-section-title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Or Create Your Own Section Title
            </label>
            <input
              id="new-custom-section-title"
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSectionTitle.trim()) {
                  e.preventDefault();
                  handleCreateCustomSection();
                }
              }}
              placeholder="e.g., Clinical Rotations, Conferences, Extracurriculars..."
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#F9FAFB] focus:bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-xs sm:text-sm text-[#111827]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNewSectionMode('detailed')}
              className={`p-3 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                newSectionMode === 'detailed'
                  ? 'bg-[#FFF7ED] border-[#F97316] text-[#111827]'
                  : 'bg-[#F9FAFB] border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <LayoutList className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                <span>Detailed Entries</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Title, Role/Org, Date &amp; Description
              </p>
            </button>

            <button
              type="button"
              onClick={() => setNewSectionMode('bullets')}
              className={`p-3 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                newSectionMode === 'bullets'
                  ? 'bg-[#FFF7ED] border-[#F97316] text-[#111827]'
                  : 'bg-[#F9FAFB] border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <List className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                <span>Bullet Points / List</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clean itemized list for hobbies or skills
              </p>
            </button>
          </div>

          <button
            type="button"
            disabled={!newSectionTitle.trim()}
            onClick={() => handleCreateCustomSection()}
            className="w-full py-3 px-4 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-45 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Custom Section to CV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
