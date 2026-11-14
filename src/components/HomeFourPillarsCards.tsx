import React from 'react';
import { ArrowRight, Sparkles, FileText, Video, Calendar, BookOpen } from 'lucide-react';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

interface HomeFourPillarsCardsProps {
  onNavigate: (view: string) => void;
}

function HomeFourPillarsCards({ onNavigate }: HomeFourPillarsCardsProps) {
  return (
    <section
      className="py-8 sm:py-16 md:py-24 bg-white border-b border-gray-100 px-3.5 sm:px-6 lg:px-8"
      id="four-pillars-section"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-orange-50/90 border border-orange-200/80 text-orange-700 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-5 shadow-xs select-none">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-650" />
            <span>Double-Vetted Native Syllabus Support</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-gray-950 uppercase leading-snug font-heading">
            OUR 4 PILLARS OF <span className="text-orange-650 not-italic block sm:inline">ACADEMIC TUTORING</span>
          </h2>

          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed px-1">
            Tap any core category to inspect matched regional curriculums, try interactive outline tools, and communicate with verified country specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 text-left">
          {/* Card 1: 1-on-1 Live Tutoring */}
          <a
            id="pillar-card-0"
            href="/services/1-on-1-live-tutoring"
            className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onNavigate('service-1on1');
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                  Whiteboard &amp; Video
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                  <div className="edu-3d-wrapper relative z-10 flex flex-col items-center">
                    <svg
                      className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id="tutor-skin" cx="45%" cy="40%" r="55%">
                          <stop offset="0%" stopColor="#fed7aa" />
                          <stop offset="75%" stopColor="#fdba74" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </radialGradient>
                        <linearGradient id="tutor-hair" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#7c2d12" />
                          <stop offset="100%" stopColor="#431407" />
                        </linearGradient>
                        <linearGradient id="tutor-clothes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#c2410c" />
                        </linearGradient>
                        <linearGradient id="headset-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="100" cy="188" rx="42" ry="7" fill="#ea580c" fillOpacity="0.2" />
                      <circle cx="100" cy="85" r="42" fill="url(#tutor-hair)" />
                      <path d="M60 90 C 58 135, 70 148, 76 154 L 124 154 C 130 148, 142 135, 140 90 Z" fill="url(#tutor-hair)" />
                      <path d="M64 156 C64 135 80 130 100 130 C120 130 136 135 136 156 L144 182 C144 186 140 190 135 190 L65 190 C60 190 56 186 56 182 Z" fill="url(#tutor-clothes)" />
                      <polygon points="100,146 84,131 93,130 100,140 107,130 116,131" fill="#fff7ed" />
                      <rect x="91" y="118" width="18" height="18" rx="7" fill="url(#tutor-skin)" />
                      <ellipse cx="100" cy="88" rx="30" ry="33" fill="url(#tutor-skin)" />
                      <path d="M72 74 C 82 58, 120 56, 128 72 C 120 66, 92 68, 72 74 Z" fill="#9a3412" />
                      <ellipse cx="89" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                      <ellipse cx="111" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                      <circle cx="90.5" cy="82.5" r="1.6" fill="#ffffff" />
                      <circle cx="112.5" cy="82.5" r="1.6" fill="#ffffff" />
                      <circle cx="81" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                      <circle cx="119" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                      <path d="M88 97 Q100 113 112 97 Z" fill="#991b1b" />
                      <path d="M89 97 Q100 103 111 97" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                      <path d="M68 85 A 34 34 0 0 1 132 85" stroke="url(#headset-grad)" strokeWidth="4.5" strokeLinecap="round" />
                      <rect x="65" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                      <rect x="127" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                      <path d="M70 90 Q 72 108 86 107" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <circle cx="86" cy="107" r="3" fill="#ea580c" />
                      <circle cx="138" cy="52" r="9" fill="#10b981" />
                      <polygon points="135,48 143,52 135,56" fill="#ffffff" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                    1-on-1 Live Tutoring
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                    Interact with native instructors on high-speed webcams and digital whiteboard systems.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Recording &amp; stream included</span>
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

          {/* Card 2: Assignment Tutoring */}
          <a
            id="pillar-card-1"
            href="/services/assignment-guidance"
            className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onNavigate('service-assignment');
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                  Structural Reviews
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                  <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-1s' }}>
                    <svg
                      className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id="student-skin" cx="50%" cy="40%" r="50%">
                          <stop offset="0%" stopColor="#ffedd5" />
                          <stop offset="70%" stopColor="#fed7aa" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </radialGradient>
                        <linearGradient id="student-hoodie" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="100" cy="188" rx="44" ry="7" fill="#ea580c" fillOpacity="0.2" />
                      <path d="M60 156 C60 134 76 128 100 128 C124 128 140 134 140 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#student-hoodie)" />
                      <rect x="91" y="116" width="18" height="18" rx="6" fill="url(#student-skin)" />
                      <path d="M92 136 L92 154 M108 136 L108 154" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                      <ellipse cx="100" cy="85" rx="30" ry="32" fill="url(#student-skin)" />
                      <path d="M68 76 C65 65 72 52 86 52 C90 52 95 54 99 56 C105 52 115 50 124 56 C134 62 134 75 131 82 Z" fill="#292524" />
                      <path d="M85 82 Q90 76 95 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <path d="M105 82 Q110 76 115 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <ellipse cx="80" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                      <ellipse cx="120" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                      <path d="M87 91 Q100 110 113 91 Z" fill="#881337" />
                      <path d="M89 91 Q100 97 111 91" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                      <polygon points="100,32 132,44 100,54 68,44" fill="#0f172a" />
                      <polygon points="100,54 132,44 132,48 100,58" fill="#1e293b" />
                      <circle cx="100" cy="43" r="2.5" fill="#f59e0b" />
                      <path d="M100 43 Q 120 46 122 58" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <g transform="translate(120, 115) rotate(12)">
                        <rect x="0" y="0" width="30" height="40" rx="3" fill="#ffffff" stroke="#fed7aa" strokeWidth="1.5" />
                        <line x1="6" y1="8" x2="24" y2="8" stroke="#f97316" strokeWidth="2" />
                        <line x1="6" y1="14" x2="20" y2="14" stroke="#cbd5e1" strokeWidth="1.5" />
                        <line x1="6" y1="19" x2="22" y2="19" stroke="#cbd5e1" strokeWidth="1.5" />
                        <text x="7" y="32" fontSize="12" fontWeight="900" fill="#dc2626" fontFamily="sans-serif">
                          A+
                        </text>
                        <circle cx="2" cy="24" r="4.5" fill="url(#student-skin)" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                    Assignment Tutoring
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                    Step-by-step drafting structures, proper citation style reviews (APA/MLA/Harvard), and customized formula guides.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700">APA/MLA grading check</span>
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

          {/* Card 3: Coursework Tutoring */}
          <a
            id="pillar-card-2"
            href="/services/coursework-track"
            className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onNavigate('service-coursework');
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                  Syllabus Alignment
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                  <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-2s' }}>
                    <svg
                      className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id="prof-skin" cx="50%" cy="40%" r="50%">
                          <stop offset="0%" stopColor="#ffedd5" />
                          <stop offset="75%" stopColor="#fdba74" />
                          <stop offset="100%" stopColor="#f97316" />
                        </radialGradient>
                        <linearGradient id="prof-suit" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#0284c7" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="100" cy="188" rx="44" ry="7" fill="#0284c7" fillOpacity="0.2" />
                      <path d="M58 158 C58 136 74 130 100 130 C126 130 142 136 142 158 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#prof-suit)" />
                      <polygon points="100,150 90,130 110,130" fill="#ffffff" />
                      <polygon points="100,135 103,158 100,166 97,158" fill="#ea580c" />
                      <rect x="91" y="118" width="18" height="18" rx="6" fill="url(#prof-skin)" />
                      <path d="M68 84 C66 60 76 46 100 46 C122 46 132 58 132 80 C125 70 110 65 96 66 C82 67 74 74 68 84 Z" fill="#334155" />
                      <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#prof-skin)" />
                      <circle cx="88" cy="85" r="4.5" fill="#0f172a" />
                      <circle cx="112" cy="85" r="4.5" fill="#0f172a" />
                      <circle cx="89.5" cy="83.5" r="1.5" fill="#ffffff" />
                      <circle cx="113.5" cy="83.5" r="1.5" fill="#ffffff" />
                      <path d="M88 98 Q100 114 112 98" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <g transform="translate(116, 122) rotate(-8)">
                        <rect x="0" y="0" width="34" height="46" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                        <rect x="3" y="4" width="28" height="38" rx="3" fill="#f8fafc" />
                        <circle cx="9" cy="12" r="2.5" fill="#10b981" />
                        <line x1="14" y1="12" x2="25" y2="12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="9" cy="20" r="2.5" fill="#10b981" />
                        <line x1="14" y1="20" x2="24" y2="20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="9" cy="28" r="2.5" fill="#f59e0b" />
                        <line x1="14" y1="28" x2="20" y2="28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="2" cy="26" r="4.5" fill="url(#prof-skin)" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                    Coursework Tutoring
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                    Comprehensive ongoing syllabus track mentoring. Monitor interactive weekly targets to secure peak score outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Weekly progress reports</span>
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>

          {/* Card 4: Academic Writing Coach */}
          <a
            id="pillar-card-3"
            href="/services/essay-reference-checks"
            className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onNavigate('service-essay');
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                  Thesis &amp; Citations
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                  <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-3s' }}>
                    <svg
                      className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id="coach-skin" cx="50%" cy="40%" r="50%">
                          <stop offset="0%" stopColor="#fde68a" />
                          <stop offset="70%" stopColor="#fcd34d" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </radialGradient>
                        <linearGradient id="coach-sweater" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="gold-pen" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#a16207" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="100" cy="188" rx="44" ry="7" fill="#047857" fillOpacity="0.2" />
                      <circle cx="100" cy="46" r="16" fill="#1c1917" />
                      <path d="M66 85 C64 62 76 52 100 52 C124 52 134 62 134 85 C124 76 112 72 100 72 C88 72 76 76 66 85 Z" fill="#1c1917" />
                      <path d="M58 156 C58 134 74 128 100 128 C126 128 142 134 142 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#coach-sweater)" />
                      <ellipse cx="100" cy="132" rx="18" ry="8" fill="#10b981" />
                      <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#coach-skin)" />
                      <circle cx="87" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                      <circle cx="113" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                      <line x1="98" y1="86" x2="102" y2="86" stroke="#ea580c" strokeWidth="2.5" />
                      <circle cx="87" cy="86" r="3.5" fill="#1c1917" />
                      <circle cx="113" cy="86" r="3.5" fill="#1c1917" />
                      <circle cx="88.5" cy="84.5" r="1.2" fill="#ffffff" />
                      <circle cx="114.5" cy="84.5" r="1.2" fill="#ffffff" />
                      <path d="M89 101 Q100 114 111 101 Z" fill="#991b1b" />
                      <path d="M91 101 Q100 105 109 101" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                      <g transform="translate(126, 80) rotate(-22)">
                        <path d="M12 0 C 14 18, 8 38, 2 56 L 6 58 C 14 38, 24 18, 12 0 Z" fill="url(#gold-pen)" />
                        <polygon points="2,56 4,68 6,58" fill="#ffffff" />
                        <line x1="4" y1="58" x2="4" y2="65" stroke="#713f12" strokeWidth="0.8" />
                        <circle cx="4" cy="69" r="1.5" fill="#fde047" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                    Academic Writing Coach
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                    Outline compelling thesis claims, map critical arguments, proofread sentence syntax, and correct grammar layouts.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Co-author editing template</span>
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HomeFourPillarsCards);
