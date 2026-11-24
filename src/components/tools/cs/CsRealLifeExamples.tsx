import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import type { CsToolDefinition } from '../../../data/csToolsRegistry';
import { CS_REAL_LIFE_DATA } from '../../../data/csRealLifeData';
import { CsExampleDiagram } from './CsExampleDiagram';

interface CsRealLifeExamplesProps {
  tool: CsToolDefinition;
  onNavigate?: (view: string) => void;
}

export default function CsRealLifeExamples({ tool, onNavigate }: CsRealLifeExamplesProps) {
  const [loadedCaseId, setLoadedCaseId] = useState<string | null>(null);
  const meta = CS_REAL_LIFE_DATA[tool.slug];

  if (!meta) return null;

  const handleLoadIntoTool = (caseId: string, presetIndex: number) => {
    setLoadedCaseId(caseId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ut-cs-load-preset', {
          detail: { slug: tool.slug, presetIndex, caseId },
        })
      );
      const ws = document.getElementById('cs-tool-workspace');
      if (ws) {
        ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      aria-label={`Real-life graphical example and applications for ${tool.shortTitle}`}
      className="space-y-6 pt-2"
    >
      {/* Section Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <p className="text-xs font-bold text-orange-700">
            Real-World {tool.category} Engineering · university-tutors.com
          </p>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
            {meta.sectionHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {meta.sectionIntro}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('book?subject=computer-science')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>1-on-1 CS Lab Walkthrough</span>
          <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
        </button>
      </div>

      {/* Left: Annotated Graphical Diagram | Right: 2 Worked Industry Case Studies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <article className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-orange-700">{meta.domainTag}</span>
            <h3 className="text-base font-display font-bold text-slate-900">
              {meta.diagramTitle}
            </h3>
          </div>

          <div className="bg-[#FAF6F0] rounded-xl border border-slate-200/80 p-3">
            <CsExampleDiagram slug={tool.slug} />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{meta.diagramCaption}</p>
        </article>

        <div className="lg:col-span-7 space-y-4">
          {meta.cases.map((c, idx) => {
            const isLoaded = loadedCaseId === c.id;
            return (
              <article
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-orange-700">
                      Real-Life Example {idx + 1} · {c.sector}
                    </span>
                    <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadIntoTool(c.id, c.presetIndex)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isLoaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Loaded in Tool</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 shrink-0" />
                        <span>Load Example in Tool</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 space-y-3.5">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{c.context}</p>

                  <pre className="bg-slate-900 text-orange-200 rounded-xl px-4 py-3 font-mono text-xs overflow-x-auto leading-relaxed">
                    {c.expressionOrSnippet}
                  </pre>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                      <span className="block text-[11px] font-bold text-slate-500 mb-0.5">
                        Input Parameters
                      </span>
                      <span className="font-mono text-slate-800">{c.givenParameters}</span>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3.5 py-2.5">
                      <span className="block text-[11px] font-bold text-emerald-800 mb-0.5">
                        Verified Engineering Output
                      </span>
                      <span className="font-mono font-semibold text-emerald-950">
                        {c.verifiedOutcome}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Key Takeaway:</strong> {c.takeaway}
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
