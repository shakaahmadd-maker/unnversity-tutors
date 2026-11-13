import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { SCIENCE_TOOLS_REGISTRY } from '../data/scienceToolsRegistry';
import { MATH_TOOLS_REGISTRY } from '../data/mathToolsRegistry';
import { STUDENT_TOOLS } from '../data/studentToolsData';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

interface SiteFooterProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function SiteFooter({ onNavigate, onOpenBecomeTutor }: SiteFooterProps) {
  const [openCol, setOpenCol] = useState<string | null>('col2');

  const mathLvl1And2 = MATH_TOOLS_REGISTRY.filter((t) => t.levelId === 1 || t.levelId === 2);
  const mathLvl3And4 = MATH_TOOLS_REGISTRY.filter((t) => t.levelId === 3 || t.levelId === 4);
  const mathLvl5And6 = MATH_TOOLS_REGISTRY.filter((t) => t.levelId === 5 || t.levelId === 6);

  const toggleSection = (id: string) => {
    setOpenCol((prev) => (prev === id ? null : id));
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    if (!isModifiedAnchorClick(e)) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  const totalToolsCount =
    MATH_TOOLS_REGISTRY.length + SCIENCE_TOOLS_REGISTRY.length + STUDENT_TOOLS.length;

  return (
    <footer
      className="bg-[#FFFFFF] border-t border-slate-200 text-[#111827] print:hidden"
      id="global-science-tools-footer"
    >
      {/* Main 5-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          {/* COLUMN 1: University-Tutors.com Branding & Mega-Hubs */}
          <div className="lg:col-span-3 space-y-4">
            <a
              href="/"
              onClick={(e) => handleNav(e, 'home')}
              className="inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <img
                src="/logo.webp"
                alt="University-Tutors.com"
                width={185}
                height={68}
                loading="lazy"
                decoding="async"
                className="h-10 w-auto object-contain"
              />
            </a>

            <p className="text-xs text-slate-600 leading-relaxed">
              University-Tutors.com connects degree-seeking students with verified PhD &amp; Master’s
              mentors—backed by {totalToolsCount} free, 100% browser-local mathematics, science, and
              study calculators.
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>24/7 Math, Stats &amp; Science Desk</span>
            </div>

            {/* Quick Links to Mega-Hubs */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold text-[#111827]">Knowledge Mega-Hubs</p>
              <div className="flex flex-col gap-1.5 text-xs font-semibold">
                <a
                  href="/tools/math"
                  onClick={(e) => handleNav(e, 'tools/math')}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFF7ED] hover:bg-[#F97316] border border-orange-200 hover:border-[#F97316] text-[#EA580C] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Mathematics &amp; Stats Hub (27 Tools)</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </a>
                <a
                  href="/tools/biology"
                  onClick={(e) => handleNav(e, 'tools/biology')}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 hover:border-orange-300 text-[#111827] hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  <span>Biology &amp; Genetics Hub (14 Tools)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                </a>
                <a
                  href="/tools/chemistry"
                  onClick={(e) => handleNav(e, 'tools/chemistry')}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 hover:border-orange-300 text-[#111827] hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  <span>Chemistry &amp; Orgo Hub (16 Tools)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                </a>
                <a
                  href="/tools"
                  onClick={(e) => handleNav(e, 'tools')}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9FAFB] hover:bg-[#FFF7ED] border border-slate-200 hover:border-orange-300 text-[#111827] hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  <span>PDF, CV &amp; Citation Suite ({STUDENT_TOOLS.length} Tools)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Levels 1 & 2 — Algebra, Trig & Pre-Calculus (Tools 1–9) */}
          <div className="lg:col-span-2 border-t border-slate-200 pt-4 md:border-t-0 md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('col2')}
              className="w-full flex items-center justify-between text-left md:cursor-default"
            >
              <h3 className="text-xs font-display font-bold text-[#111827] tracking-tight">
                Algebra, Trig &amp; Conics (1–9)
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 md:hidden transition-transform ${
                  openCol === 'col2' ? 'rotate-180 text-[#F97316]' : ''
                }`}
              />
            </button>

            <ul
              className={`mt-3 space-y-2 text-xs ${
                openCol === 'col2' ? 'block' : 'hidden md:block'
              }`}
            >
              {mathLvl1And2.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={tool.path}
                    onClick={(e) => handleNav(e, tool.viewKey)}
                    className="text-slate-600 hover:text-[#EA580C] transition-colors block leading-snug cursor-pointer"
                  >
                    {tool.shortTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Levels 3 & 4 — Calculus & Linear Algebra (Tools 10–18) */}
          <div className="lg:col-span-3 border-t border-slate-200 pt-4 md:border-t-0 md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('col3')}
              className="w-full flex items-center justify-between text-left md:cursor-default"
            >
              <h3 className="text-xs font-display font-bold text-[#111827] tracking-tight">
                Calculus &amp; Linear Algebra (10–18)
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 md:hidden transition-transform ${
                  openCol === 'col3' ? 'rotate-180 text-[#F97316]' : ''
                }`}
              />
            </button>

            <ul
              className={`mt-3 space-y-2 text-xs ${
                openCol === 'col3' ? 'block' : 'hidden md:block'
              }`}
            >
              {mathLvl3And4.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={tool.path}
                    onClick={(e) => handleNav(e, tool.viewKey)}
                    className="text-slate-600 hover:text-[#EA580C] transition-colors block leading-snug cursor-pointer"
                  >
                    {tool.shortTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Levels 5 & 6 — Statistics, ODEs & Discrete Math (Tools 19–27) */}
          <div className="lg:col-span-2 border-t border-slate-200 pt-4 md:border-t-0 md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('col4')}
              className="w-full flex items-center justify-between text-left md:cursor-default"
            >
              <h3 className="text-xs font-display font-bold text-[#111827] tracking-tight">
                Statistics, ODEs &amp; RSA (19–27)
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 md:hidden transition-transform ${
                  openCol === 'col4' ? 'rotate-180 text-[#F97316]' : ''
                }`}
              />
            </button>

            <ul
              className={`mt-3 space-y-2 text-xs ${
                openCol === 'col4' ? 'block' : 'hidden md:block'
              }`}
            >
              {mathLvl5And6.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={tool.path}
                    onClick={(e) => handleNav(e, tool.viewKey)}
                    className="text-slate-600 hover:text-[#EA580C] transition-colors block leading-snug cursor-pointer"
                  >
                    {tool.shortTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5: 1-on-1 Math, Stats & Science Tutoring */}
          <div className="lg:col-span-2 border-t border-slate-200 pt-4 md:border-t-0 md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('col5')}
              className="w-full flex items-center justify-between text-left md:cursor-default"
            >
              <h3 className="text-xs font-display font-bold text-[#111827] tracking-tight">
                1-on-1 Tutoring &amp; Coaching
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 md:hidden transition-transform ${
                  openCol === 'col5' ? 'rotate-180 text-[#F97316]' : ''
                }`}
              />
            </button>

            <div
              className={`mt-3 space-y-3 text-xs ${
                openCol === 'col5' ? 'block' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-2.5 font-medium">
                <li>
                  <a
                    href="/tutors-directory?subject=Mathematics"
                    onClick={(e) => handleNav(e, 'subject:Mathematics')}
                    className="text-slate-700 hover:text-[#EA580C] transition-colors block cursor-pointer"
                  >
                    1-on-1 Math Tutoring
                  </a>
                </li>
                <li>
                  <a
                    href="/tutors-directory?subject=Statistics"
                    onClick={(e) => handleNav(e, 'subject:Statistics')}
                    className="text-slate-700 hover:text-[#EA580C] transition-colors block cursor-pointer"
                  >
                    Statistics &amp; SPSS/R Help
                  </a>
                </li>
                <li>
                  <a
                    href="/tutors-directory?subject=Calculus"
                    onClick={(e) => handleNav(e, 'subject:Calculus')}
                    className="text-slate-700 hover:text-[#EA580C] transition-colors block cursor-pointer"
                  >
                    Calculus &amp; Engineering Coaching
                  </a>
                </li>
                <li>
                  <a
                    href="/services/essay-reference-checks"
                    onClick={(e) => handleNav(e, 'service-essay')}
                    className="text-slate-700 hover:text-[#EA580C] transition-colors block cursor-pointer"
                  >
                    Academic Editing &amp; Turnitin Review
                  </a>
                </li>
                <li>
                  <a
                    href="/tutors-directory?subject=Biology"
                    onClick={(e) => handleNav(e, 'subject:Biology')}
                    className="text-slate-700 hover:text-[#EA580C] transition-colors block cursor-pointer"
                  >
                    Biology &amp; Chemistry Tutors
                  </a>
                </li>
                <li>
                  <a
                    href="/get-a-quote"
                    onClick={(e) => handleNav(e, 'get-a-quote')}
                    className="text-[#EA580C] font-bold hover:text-[#111827] transition-colors block cursor-pointer"
                  >
                    Book a Free Consultation →
                  </a>
                </li>
                {onOpenBecomeTutor ? (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenBecomeTutor}
                      className="text-slate-600 hover:text-[#EA580C] transition-colors text-left cursor-pointer"
                    >
                      Become a Tutor
                    </button>
                  </li>
                ) : (
                  <li>
                    <a
                      href="/tutors"
                      onClick={(e) => handleNav(e, 'tutors')}
                      className="text-slate-600 hover:text-[#EA580C] transition-colors block cursor-pointer"
                    >
                      Become a Tutor
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Secondary Compact Rows: Biology & Chemistry (30 Tools) + General Student Utilities */}
        <div className="mt-10 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-500">
            <span className="font-bold text-[#111827]">Biology &amp; Chemistry Calculators (30):</span>
            {SCIENCE_TOOLS_REGISTRY.map((sci, idx) => (
              <React.Fragment key={sci.slug}>
                <a
                  href={sci.path}
                  onClick={(e) => handleNav(e, sci.viewKey)}
                  className="hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  {sci.shortTitle}
                </a>
                {idx < SCIENCE_TOOLS_REGISTRY.length - 1 && (
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="font-bold text-[#111827]">General Student Utilities ({STUDENT_TOOLS.length}):</span>
            {STUDENT_TOOLS.map((st, idx) => (
              <React.Fragment key={st.slug}>
                <a
                  href={st.path}
                  onClick={(e) => handleNav(e, st.viewKey)}
                  className="hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  {st.shortName}
                </a>
                {idx < STUDENT_TOOLS.length - 1 && (
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal & Privacy Bar */}
      <div className="bg-[#F9FAFB] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              © 2026 University-Tutors.com · 100% Client-Side Scientific Calculators · Ethical Academic Mentorship
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-medium">
            <a
              href="/privacy"
              onClick={(e) => handleNav(e, 'privacy')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => handleNav(e, 'terms')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Terms &amp; Escrow
            </a>
            <a
              href="/contact"
              onClick={(e) => handleNav(e, 'contact')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Contact Desk
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
