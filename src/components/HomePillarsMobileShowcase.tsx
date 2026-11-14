import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from './ResponsiveImage';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

interface HomePillarsMobileShowcaseProps {
  onNavigate: (view: string) => void;
  onOpenBooking: (service: string) => void;
}

function HomePillarsMobileShowcase({ onNavigate, onOpenBooking }: HomePillarsMobileShowcaseProps) {
  return (
    <>
      <header className="px-4 pt-2 pb-5">
        <div className="inline-flex items-center gap-2 mb-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-700 font-sans">
            ACADEMIC PILLARS
          </span>
          <span className="w-6 h-[2px] bg-orange-650 rounded-full"></span>
        </div>
        <h2 className="font-extrabold text-[26px] leading-[1.2] text-slate-900 mb-2.5 tracking-tight font-sans">
          Precision Mentorship for Academic Excellence
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
          Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
        </p>
      </header>

      <div className="px-4 space-y-4">
        {/* CARD 1 */}
        <article id="pillar-1" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=160&q=40&fm=avif"
                alt="1-1 Academic Tutoring"
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                  ACADEMIC MENTORSHIP
                </span>
                <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
              </div>
              <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                1. Personalized 1-1 Tutoring Services
              </h3>
            </div>
          </div>

          <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
            In today&apos;s competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual&apos;s unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <a
              href="/services/1-on-1-live-tutoring"
              aria-label="Explore 1-on-1 Live Tutoring Service Page"
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onNavigate('service-1on1');
                }
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
            >
              Explore Service Page &rarr;
            </a>
            <button
              onClick={() => onOpenBooking('1. Personalized 1-1 Tutoring Services')}
              className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
            >
              <span>Book 1-1 Tutoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* CARD 2 */}
        <article id="pillar-2" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                  LOGIC &amp; REASONING
                </span>
                <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
              </div>
              <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                2. Professional Assignment Tutoring &amp; Guidance
              </h3>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
              <ResponsivePicture
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=240&q=75"
                alt="Assignment Guidance and Books"
                width={96}
                height={96}
                sizes="96px"
                widths={[128, 240]}
                loading="lazy"
                className="w-full h-full object-cover"
                fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Assgn"
              />
            </div>
          </div>

          <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
            When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <a
              href="/services/assignment-guidance"
              aria-label="Explore Assignment Guidance Service Page"
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onNavigate('service-assignment');
                }
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
            >
              Explore Service Page &rarr;
            </a>
            <button
              onClick={() => onOpenBooking('2. Professional Assignment Tutoring & Guidance')}
              className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
            >
              <span>Book Assignment Help</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* CARD 3 */}
        <article id="pillar-3" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
              <ResponsivePicture
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=240&q=75"
                alt="Coursework writing & research"
                width={96}
                height={96}
                sizes="96px"
                widths={[128, 240]}
                loading="lazy"
                className="w-full h-full object-cover"
                fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Course"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                  MILESTONE MANAGEMENT
                </span>
                <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
              </div>
              <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                3. Comprehensive Coursework Tutoring
              </h3>
            </div>
          </div>

          <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
            Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <a
              href="/services/coursework-track"
              aria-label="Explore Coursework Track Service Page"
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onNavigate('service-coursework');
                }
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
            >
              Explore Service Page &rarr;
            </a>
            <button
              onClick={() => onOpenBooking('3. Comprehensive Coursework Tutoring')}
              className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
            >
              <span>Book Coursework Guidance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* CARD 4 */}
        <article id="pillar-4" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                  QUALITY ASSURANCE
                </span>
                <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
              </div>
              <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                4. Expert Academic Writing Consultation
              </h3>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
              <ResponsivePicture
                src="https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=240&q=75"
                alt="Scholarly Writing with Fountain Pen"
                width={96}
                height={96}
                sizes="96px"
                widths={[128, 240]}
                loading="lazy"
                className="w-full h-full object-cover"
                fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Writing"
              />
            </div>
          </div>

          <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
            Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don&apos;t just secure academic clarity—they build essential skills that prepare them for future career success.
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <a
              href="/services/essay-reference-checks"
              aria-label="Explore Essay and Reference Checks Service Page"
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onNavigate('service-essay');
                }
              }}
              className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
            >
              Explore Service Page &rarr;
            </a>
            <button
              onClick={() => onOpenBooking('4. Expert Academic Writing Consultation')}
              className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
            >
              <span>Book Writing Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

export default React.memo(HomePillarsMobileShowcase);
