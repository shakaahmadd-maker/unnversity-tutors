import React, { useState, useEffect } from 'react';
import {
  FileText,
  GraduationCap,
  Timer,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  FileDown,
} from 'lucide-react';
import { downloadAcademicReportPdf } from '../../utils/pdfReportGenerator';

type UtilityTab = 'words' | 'cgpa' | 'pomodoro';

interface CourseRow {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface FocusTask {
  id: string;
  title: string;
  done: boolean;
}

const GRADE_POINTS_4_0: Record<string, number> = {
  'A+ (4.0)': 4.0,
  'A (4.0)': 4.0,
  'A- (3.7)': 3.7,
  'B+ (3.3)': 3.3,
  'B (3.0)': 3.0,
  'B- (2.7)': 2.7,
  'C+ (2.3)': 2.3,
  'C (2.0)': 2.0,
  'C- (1.7)': 1.7,
  'D+ (1.3)': 1.3,
  'D (1.0)': 1.0,
  'F (0.0)': 0.0,
};

function playSubtleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // Audio optional
  }
}

export default function StudyUtilities() {
  const [activeTab, setActiveTab] = useState<UtilityTab>('cgpa');

  // --- WORD COUNTER STATE ---
  const [essayText, setEssayText] = useState<string>(
    'Paste or draft your university essay, Statement of Purpose, or literature review here to monitor live word limits, paragraph pacing, and estimated seminar presentation time.'
  );
  const [targetWords, setTargetWords] = useState<number>(1500);

  // --- CGPA CALCULATOR STATE ---
  const [courses, setCourses] = useState<CourseRow[]>([
    { id: 'c1', name: 'ECON 201 — Econometrics & Regression', credits: 4, grade: 'A (4.0)' },
    { id: 'c2', name: 'COMP 214 — Data Structures & Algorithms', credits: 4, grade: 'A- (3.7)' },
    { id: 'c3', name: 'STAT 210 — Probability Theory', credits: 3, grade: 'B+ (3.3)' },
    { id: 'c4', name: 'WRIT 105 — Academic Research Seminar', credits: 3, grade: 'A (4.0)' },
  ]);
  const [priorCgpa, setPriorCgpa] = useState<string>('');
  const [priorCredits, setPriorCredits] = useState<string>('');

  // --- POMODORO STATE ---
  const [pomoMode, setPomoMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSprints, setCompletedSprints] = useState<number>(0);
  const [tasks, setTasks] = useState<FocusTask[]>([
    { id: 't1', title: 'Outline introduction & thesis statement (250 words)', done: true },
    { id: 't2', title: 'Synthesize 4 peer-reviewed journal articles in APA 7th', done: false },
    { id: 't3', title: 'Proofread conclusion & verify figure captions', done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playSubtleChime();
          if (pomoMode === 'focus') {
            setCompletedSprints((c) => c + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, pomoMode]);

  const selectPomoPreset = (mode: 'focus' | 'short' | 'long') => {
    setIsRunning(false);
    setPomoMode(mode);
    if (mode === 'focus') setSecondsLeft(25 * 60);
    else if (mode === 'short') setSecondsLeft(5 * 60);
    else setSecondsLeft(15 * 60);
  };

  // Word counter metrics
  const trimmedEssay = essayText.trim();
  const wordCount = trimmedEssay ? trimmedEssay.split(/\s+/).length : 0;
  const charsWithSpaces = essayText.length;
  const charsNoSpaces = essayText.replace(/\s/g, '').length;
  const sentenceCount = trimmedEssay
    ? trimmedEssay.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;
  const paragraphCount = trimmedEssay
    ? trimmedEssay.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 225));
  const speakingMinutes = Math.max(1, Math.ceil(wordCount / 130));
  const wordProgressPct = targetWords > 0 ? Math.min(100, Math.round((wordCount / targetWords) * 100)) : 0;

  // CGPA calculations
  const semCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const semQualityPoints = courses.reduce(
    (sum, c) => sum + (Number(c.credits) || 0) * (GRADE_POINTS_4_0[c.grade] ?? 0),
    0
  );
  const semesterGpa = semCredits > 0 ? semQualityPoints / semCredits : 0;

  const parsedPriorGpa = parseFloat(priorCgpa);
  const parsedPriorCreds = parseFloat(priorCredits);
  const hasPrior =
    Number.isFinite(parsedPriorGpa) &&
    parsedPriorGpa >= 0 &&
    parsedPriorGpa <= 4.0 &&
    Number.isFinite(parsedPriorCreds) &&
    parsedPriorCreds > 0;

  const totalCumulativeCredits = semCredits + (hasPrior ? parsedPriorCreds : 0);
  const cumulativeGpa =
    totalCumulativeCredits > 0
      ? (semQualityPoints + (hasPrior ? parsedPriorGpa * parsedPriorCreds : 0)) /
        totalCumulativeCredits
      : 0;
  const equivalentPercentage = Math.min(100, Math.max(0, cumulativeGpa * 25));

  const formatClock = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleDownloadCgpaPdf = () => {
    downloadAcademicReportPdf({
      filename: 'University-CGPA-Calculation-Report.pdf',
      title: 'University 4.0 CGPA & Academic Standing Report',
      subtitle: 'Semester grade point breakdown, cumulative standing & percentage equivalence',
      badgeText: 'ACADEMIC STANDING',
      metadataRows: [
        { label: 'Cumulative CGPA (4.0 Scale)', value: `${cumulativeGpa.toFixed(2)} / 4.00` },
        { label: 'Current Semester GPA', value: `${semesterGpa.toFixed(2)} / 4.00` },
        { label: 'Percentage Equivalent', value: `${equivalentPercentage.toFixed(1)}%` },
        {
          label: 'Total Credits & Quality Points',
          value: `${totalCumulativeCredits} credits · ${semQualityPoints.toFixed(1)} semester quality points`,
        },
      ],
      sections: [
        {
          heading: 'Enrolled Semester Courses Breakdown',
          lines: courses.map(
            (c, idx) =>
              `${idx + 1}. ${c.name || `Course ${idx + 1}`} — ${c.credits} Credits — Grade: ${c.grade}`
          ),
          monospace: true,
        },
      ],
    });
  };

  const handleDownloadEssayPdf = () => {
    if (!trimmedEssay) return;
    downloadAcademicReportPdf({
      filename: 'Essay-Word-Count-Draft-Report.pdf',
      title: 'Academic Essay Draft & Word-Limit Pacing Report',
      subtitle: 'Word count, character count, reading/speaking time, and draft text',
      badgeText: 'WRITING METRICS',
      metadataRows: [
        {
          label: 'Word Count vs Target',
          value: `${wordCount.toLocaleString()} / ${targetWords.toLocaleString()} words (${wordProgressPct}%)`,
        },
        {
          label: 'Characters (With / Without Spaces)',
          value: `${charsWithSpaces.toLocaleString()} / ${charsNoSpaces.toLocaleString()}`,
        },
        {
          label: 'Structure & Pacing',
          value: `${sentenceCount} sentences · ${paragraphCount} paragraphs · ~${readingMinutes}m read / ~${speakingMinutes}m speech`,
        },
      ],
      sections: [
        {
          heading: 'Essay / Statement of Purpose Draft',
          lines: trimmedEssay.split('\n'),
        },
      ],
    });
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      {/* Top 3-in-1 Study Desk Bar */}
      <div className="bg-[#F9FAFB] border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cgpa'}
            onClick={() => setActiveTab('cgpa')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'cgpa'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>4.0 CGPA &amp; % Calculator</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'words'}
            onClick={() => setActiveTab('words')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'words'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Essay Word Counter</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pomodoro'}
            onClick={() => setActiveTab('pomodoro')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'pomodoro'
                ? 'bg-[#F97316] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Pomodoro Focus Timer</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          3-in-1 Daily University Study Desk
        </span>
      </div>

      {/* TAB 1: 4.0 CGPA & PERCENTAGE CALCULATOR */}
      {activeTab === 'cgpa' && (
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">Semester Course List (4.0 Scale)</h3>
              <button
                type="button"
                onClick={() =>
                  setCourses((prev) => [
                    ...prev,
                    {
                      id: `c-${Date.now()}`,
                      name: `Course ${prev.length + 1}`,
                      credits: 3,
                      grade: 'A (4.0)',
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] hover:text-[#111827] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="grid grid-cols-12 gap-2.5 items-center bg-[#F9FAFB] border border-slate-200 rounded-2xl p-3"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) =>
                        setCourses((prev) =>
                          prev.map((c) => (c.id === course.id ? { ...c, name: e.target.value } : c))
                        )
                      }
                      placeholder="Course Code & Title"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-[#111827]"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="number"
                      min={0.5}
                      max={15}
                      step={0.5}
                      value={course.credits}
                      onChange={(e) =>
                        setCourses((prev) =>
                          prev.map((c) =>
                            c.id === course.id
                              ? { ...c, credits: Math.max(0, parseFloat(e.target.value) || 0) }
                              : c
                          )
                        )
                      }
                      aria-label="Credit hours"
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-[#111827] text-center tabular-nums"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <select
                      value={course.grade}
                      onChange={(e) =>
                        setCourses((prev) =>
                          prev.map((c) => (c.id === course.id ? { ...c, grade: e.target.value } : c))
                        )
                      }
                      aria-label="Letter grade"
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-[#111827] tabular-nums"
                    >
                      {Object.keys(GRADE_POINTS_4_0).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={courses.length <= 1}
                      onClick={() => setCourses((prev) => prev.filter((c) => c.id !== course.id))}
                      aria-label="Delete course"
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Prior CGPA Merger */}
            <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Optional: Previous Cumulative GPA (0.00–4.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  value={priorCgpa}
                  onChange={(e) => setPriorCgpa(e.target.value)}
                  placeholder="e.g., 3.65"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-[#111827] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Optional: Previous Completed Credits
                </label>
                <input
                  type="number"
                  min={0}
                  value={priorCredits}
                  onChange={(e) => setPriorCredits(e.target.value)}
                  placeholder="e.g., 60"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-[#111827] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Right Live GPA Card */}
          <div className="lg:col-span-4 bg-[#FFF7ED] border border-orange-200/90 rounded-3xl p-6 space-y-5 tabular-nums">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                Calculated Academic Standing
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-display font-bold text-[#111827]">
                  {cumulativeGpa.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 4.00 CGPA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-orange-200/70">
              <div className="bg-white rounded-2xl p-3.5 border border-orange-100">
                <span className="block text-[11px] font-semibold text-slate-500">Semester GPA</span>
                <span className="text-lg font-bold text-[#111827]">{semesterGpa.toFixed(2)}</span>
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-orange-100">
                <span className="block text-[11px] font-semibold text-slate-500">Percentage Eq.</span>
                <span className="text-lg font-bold text-[#EA580C]">
                  {equivalentPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-orange-100">
                <span className="block text-[11px] font-semibold text-slate-500">Total Credits</span>
                <span className="text-base font-bold text-[#111827]">{totalCumulativeCredits}</span>
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-orange-100">
                <span className="block text-[11px] font-semibold text-slate-500">Quality Points</span>
                <span className="text-base font-bold text-[#111827]">
                  {semQualityPoints.toFixed(1)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadCgpaPdf}
              className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download CGPA Report PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ESSAY WORD & CHARACTER COUNTER */}
      {activeTab === 'words' && (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
            {[
              { label: 'Words', value: wordCount.toLocaleString(), accent: true },
              { label: 'Characters', value: charsWithSpaces.toLocaleString(), accent: false },
              { label: 'No Spaces', value: charsNoSpaces.toLocaleString(), accent: false },
              { label: 'Sentences', value: String(sentenceCount), accent: false },
              { label: 'Paragraphs', value: String(paragraphCount), accent: false },
              { label: 'Read / Speak', value: `${readingMinutes}m / ${speakingMinutes}m`, accent: false },
            ].map((m) => (
              <div
                key={m.label}
                className={`rounded-2xl p-4 border ${
                  m.accent
                    ? 'bg-[#FFF7ED] border-orange-200'
                    : 'bg-[#F9FAFB] border-slate-200'
                }`}
              >
                <span className="block text-xs font-semibold text-slate-500">{m.label}</span>
                <span
                  className={`text-xl font-display font-bold mt-0.5 block ${
                    m.accent ? 'text-[#EA580C]' : 'text-[#111827]'
                  }`}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Target Word Count Bar */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2.5 tabular-nums">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <label htmlFor="target-words-input" className="font-bold text-[#111827]">
                  Assignment Word Target:
                </label>
                <input
                  id="target-words-input"
                  type="number"
                  min={100}
                  step={100}
                  value={targetWords}
                  onChange={(e) => setTargetWords(Math.max(50, Number(e.target.value) || 500))}
                  className="w-24 px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold text-[#111827]"
                />
                <span className="text-slate-500">
                  (±10% academic window: {Math.round(targetWords * 0.9)}–{Math.round(targetWords * 1.1)} words)
                </span>
              </div>
              <span className="font-bold text-[#EA580C]">
                {wordCount} / {targetWords} words ({wordProgressPct}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{ width: `${wordProgressPct}%` }}
                className="h-full bg-[#F97316] transition-all duration-200"
              />
            </div>
          </div>

          <textarea
            rows={11}
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Type or paste your essay draft here..."
            className="w-full p-5 rounded-2xl bg-white border border-slate-300 focus:border-[#F97316] focus:outline-none text-sm text-[#111827] leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!trimmedEssay}
              onClick={handleDownloadEssayPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Draft &amp; Metrics PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: POMODORO FOCUS TIMER */}
      {activeTab === 'pomodoro' && (
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timer Clock */}
          <div className="lg:col-span-6 bg-[#F9FAFB] border border-slate-200 rounded-3xl p-5 sm:p-8 text-center space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl">
              {[
                { id: 'focus' as const, label: '25m Focus Sprint' },
                { id: 'short' as const, label: '5m Short Break' },
                { id: 'long' as const, label: '15m Long Break' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectPomoPreset(m.id)}
                  className={`px-3 py-2 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    pomoMode === m.id
                      ? 'bg-[#F97316] text-white'
                      : 'text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="py-4">
              <div className="text-6xl sm:text-7xl font-mono font-bold text-[#111827] tracking-tight tabular-nums">
                {formatClock(secondsLeft)}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2 tabular-nums">
                Completed Focus Sprints Today: <strong className="text-[#EA580C]">{completedSprints}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause Sprint' : 'Start Timer'}</span>
              </button>

              <button
                type="button"
                onClick={() => selectPomoPreset(pomoMode)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Sprint Task Checklist */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h3 className="text-base font-display font-bold text-[#111827]">
                Study Session Goals Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Break your revision or essay draft into concrete 25-minute deliverables.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTaskText.trim()) {
                    e.preventDefault();
                    setTasks((prev) => [
                      ...prev,
                      { id: `t-${Date.now()}`, title: newTaskText.trim(), done: false },
                    ]);
                    setNewTaskText('');
                  }
                }}
                placeholder="Add a 25-min study deliverable..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newTaskText.trim()) return;
                  setTasks((prev) => [
                    ...prev,
                    { id: `t-${Date.now()}`, title: newTaskText.trim(), done: false },
                  ]);
                  setNewTaskText('');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#111827] text-white text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#F9FAFB] border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
                      )
                    }
                    className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                  >
                    {task.done ? (
                      <CheckSquare className="w-4 h-4 text-[#F97316] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        task.done ? 'line-through text-slate-400' : 'text-[#111827]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
