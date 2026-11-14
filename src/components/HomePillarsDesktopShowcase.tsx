import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from './ResponsiveImage';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

interface HomePillarsDesktopShowcaseProps {
  onNavigate: (view: string) => void;
  onOpenBooking: (service: string) => void;
}

function HomePillarsDesktopShowcase({ onNavigate, onOpenBooking }: HomePillarsDesktopShowcaseProps) {
  return (
    <>
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 md:mb-24">
        <div className="inline-flex items-center gap-2.5 mb-4 justify-center">
          <span className="text-orange-650 text-xs font-black tracking-[0.3em] uppercase">Academic Pillars</span>
          <span className="w-8 h-[1.5px] bg-orange-650"></span>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 font-sans mb-6 leading-tight">
          Precision Mentorship for Academic Excellence
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* 01 */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
          <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
            <ResponsivePicture
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=640&q=76"
              alt="Personalized 1-1 Academic Tutoring & Mentorship"
              width={480}
              height={340}
              sizes="(max-width: 1024px) 100vw, 480px"
              widths={[400, 640, 900]}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=1-1+Tutoring"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
          <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Academic Mentorship</span>
              <span className="w-8 h-[1.5px] bg-orange-650"></span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
              1. Personalized 1-1 Tutoring Services
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
              In today’s competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual&apos;s unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/services/1-on-1-live-tutoring"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('service-1on1');
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Explore 1-on-1 Tutoring Page</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onOpenBooking('1. Personalized 1-1 Tutoring Services')}
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Book 1-1 Tutoring Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 02 */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
          <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Logic &amp; Reasoning</span>
              <span className="w-8 h-[1.5px] bg-orange-650"></span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
              2. Professional Assignment Tutoring &amp; Guidance
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
              When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/services/assignment-guidance"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('service-assignment');
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Explore Assignment Guidance Page</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onOpenBooking('2. Professional Assignment Tutoring & Guidance')}
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Book Assignment Guidance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
            <ResponsivePicture
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=76"
              alt="Professional Academic Assignment Desk"
              width={480}
              height={340}
              sizes="(max-width: 1024px) 100vw, 480px"
              widths={[400, 640, 800]}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Assignment+Help"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* 03 */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
          <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
            <ResponsivePicture
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=76"
              alt="Comprehensive Coursework Tutoring Desk"
              width={480}
              height={340}
              sizes="(max-width: 1024px) 100vw, 480px"
              widths={[400, 640, 900]}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Coursework+Tutoring"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
          <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Milestone Management</span>
              <span className="w-8 h-[1.5px] bg-orange-650"></span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
              3. Comprehensive Coursework Tutoring
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
              Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/services/coursework-track"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('service-coursework');
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Explore Coursework Track Page</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onOpenBooking('3. Comprehensive Coursework Tutoring')}
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Book Coursework Guidance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 04 */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
          <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Quality Assurance</span>
              <span className="w-8 h-[1.5px] bg-orange-650"></span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
              4. Expert Academic Writing Consultation
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
              Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don&apos;t just secure academic clarity—they build essential skills that prepare them for future career success.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/services/essay-reference-checks"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('service-essay');
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Explore Essay &amp; Citations Page</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onOpenBooking('4. Expert Academic Writing Consultation')}
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                <span>Book Writing Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
            <ResponsivePicture
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=76"
              alt="Academic Content Writing"
              width={480}
              height={340}
              sizes="(max-width: 1024px) 100vw, 480px"
              widths={[400, 640, 800]}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Writing+Support"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(HomePillarsDesktopShowcase);
