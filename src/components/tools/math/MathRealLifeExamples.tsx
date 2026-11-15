import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import type { MathToolItem } from '../../../data/mathToolsRegistry';
import { MATH_REAL_LIFE_DATA } from './mathRealLifeData';
import { MathExampleDiagram } from './MathExampleDiagram';
import { MathFormula, MathText } from './MathTypeset';

interface MathRealLifeExamplesProps {
  tool: MathToolItem;
  onNavigate: (view: string) => void;
}

export default function MathRealLifeExamples({ tool, onNavigate }: MathRealLifeExamplesProps) {
  const [loadedCaseId, setLoadedCaseId] = useState<string | null>(null);
  const meta = MATH_REAL_LIFE_DATA[tool.slug];

  if (!meta) return null;

  const handleLoadIntoSolver = (caseId: string, presetIndex: number) => {
    setLoadedCaseId(caseId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ut-math-load-preset', {
          detail: { slug: tool.slug, presetIndex },
        })
      );
      const ws = document.getElementById('math-tool-workspace');
      if (ws) {
        ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      aria-label={`Real-life examples and applications for ${tool.shortTitle}`}
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-6"
    >
      {/* Branded Section Intro */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-slate-200 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <p className="text-xs font-bold text-[#EA580C]">
            Real-World {tool.tutorDomain} Applications · university-tutors.com
          </p>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0F172A] tracking-tight">
            {meta.sectionHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <MathText text={meta.sectionIntro} />
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5">
          <img
            src="/logo_transparent-440.webp"
            alt="University-Tutors.com"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-6 w-auto self-start sm:self-center lg:self-end object-contain"
          />
          <button
            type="button"
            onClick={() => onNavigate('get-a-quote')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Book a 1-on-1 {tool.levelShortLabel} Tutor</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F97316]" />
          </button>
        </div>
      </div>

      {/* Visual Diagram + 2 Real-Life Worked Equation Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Annotated Mathematical Visual Diagram */}
        <article className="lg:col-span-5 bg-[#FFFFFF] rounded-3xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#EA580C]">{meta.domainTag}</span>
            <h3 className="text-base font-display font-bold text-[#0F172A]">
              <MathText text={meta.diagramTitle} />
            </h3>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-3">
            <MathExampleDiagram slug={tool.slug} />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            <MathText text={meta.diagramCaption} />
          </p>
        </article>

        {/* Right: Interactive Real-World Equations (True KaTeX Typesetting + One-Click Solver Load) */}
        <div className="lg:col-span-7 space-y-4">
          {meta.cases.map((c, idx) => {
            const isLoaded = loadedCaseId === c.id;
            return (
              <article
                key={c.id}
                className="bg-[#FFFFFF] rounded-3xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#EA580C]">
                      Real-Life Example {idx + 1} · {c.sector}
                    </span>
                    <h3 className="text-sm sm:text-base font-display font-bold text-[#0F172A] leading-snug">
                      {c.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadIntoSolver(c.id, c.presetIndex)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#FFF7ED] hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isLoaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Loaded in Calculator</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 shrink-0" />
                        <span>Load in Calculator</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <MathText text={c.context} />
                  </p>

                  {/* Typeset Display Mathematical Equation */}
                  <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 text-center">
                    <MathFormula latex={c.latexEquation} displayMode className="text-sm sm:text-base text-[#0F172A]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5">
                      <span className="block text-[11px] font-bold text-slate-500 mb-0.5">
                        Given Parameters
                      </span>
                      <span className="font-medium text-slate-800">
                        <MathText text={c.givenParameters} />
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3.5 py-2.5">
                      <span className="block text-[11px] font-bold text-emerald-800 mb-0.5">
                        Verified Mathematical Result
                      </span>
                      <MathFormula latex={c.verifiedResultLatex} className="text-xs sm:text-sm font-bold text-emerald-950" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Key Takeaway:</strong>{' '}
                    <MathText text={c.takeaway} />
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
