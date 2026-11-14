import React from 'react';
import {
  GraduationCap,
  LogOut,
  BookOpen,
  FileCheck,
  FileText,
  Video,
  Calendar,
  Dna,
  FlaskConical,
  Sigma,
  Wrench,
  BookCheck,
} from 'lucide-react';
import { User } from '../types';
import {
  DEDICATED_SERVICE_ROUTES,
  isModifiedAnchorClick,
} from '../data/dedicatedServiceRoutes';
import { STUDENT_TOOLS_COUNT } from '../data/toolRouteMatchers';
import { getResponsiveAvatarProps } from '../utils/imageOptimization';

interface ServicesDropdownPanelProps {
  activeView: string;
  onLinkClick: (view: string) => void;
}

export function ServicesDropdownPanel({ activeView, onLinkClick }: ServicesDropdownPanelProps) {
  return (
    <div className="absolute top-full left-0 pt-2 w-76 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
        <a
          href="/services"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('services');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView === 'services' ? 'bg-orange-50/80' : ''
          }`}
        >
          <BookOpen className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              All Tutoring Services Hub
            </div>
            <div className="text-[10px] text-slate-600">Overview of all core academic services</div>
          </div>
        </a>

        <div className="border-t border-slate-100 my-1"></div>

        {DEDICATED_SERVICE_ROUTES.map((route) => {
          const icon =
            route.id === '1on1' ? (
              <Video className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
            ) : route.id === 'assignment' ? (
              <FileCheck className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
            ) : route.id === 'coursework' ? (
              <Calendar className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
            );
          const isItemActive = activeView === route.view;
          return (
            <a
              key={route.id}
              href={route.path}
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onLinkClick(route.view);
                }
              }}
              className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
                isItemActive ? 'bg-orange-50/80 ring-1 ring-orange-200/70' : ''
              }`}
            >
              {icon}
              <div>
                <div
                  className={`text-xs font-bold group-hover:text-orange-650 ${
                    isItemActive ? 'text-orange-650' : 'text-slate-900'
                  }`}
                >
                  {route.label}
                </div>
                <div className="text-[10px] text-slate-600">{route.shortDesc}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

interface ToolsDropdownPanelProps {
  activeView: string;
  onLinkClick: (view: string) => void;
}

export function ToolsDropdownPanel({ activeView, onLinkClick }: ToolsDropdownPanelProps) {
  return (
    <div className="absolute top-full left-0 pt-2 w-76 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
        <a
          href="/tools/math"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('tools/math');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView.startsWith('tools/math') ? 'bg-orange-50/80 ring-1 ring-orange-200/70' : ''
          }`}
        >
          <Sigma className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              Mathematics &amp; Stats Hub (27)
            </div>
            <div className="text-[10px] text-slate-600">
              Algebra, Calculus, RREF, Eigenvalues, ANOVA, RK4 &amp; RSA
            </div>
          </div>
        </a>

        <a
          href="/tools/biology"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('tools/biology');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView.startsWith('tools/biology') ? 'bg-orange-50/80 ring-1 ring-orange-200/70' : ''
          }`}
        >
          <Dna className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              Biology Knowledge Hub (14)
            </div>
            <div className="text-[10px] text-slate-600">
              Punnett, DNA→Protein, PCR, CRISPR, Gel, CFU &amp; Ψ
            </div>
          </div>
        </a>

        <a
          href="/tools/chemistry"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('tools/chemistry');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView.startsWith('tools/chemistry') ? 'bg-orange-50/80 ring-1 ring-orange-200/70' : ''
          }`}
        >
          <FlaskConical className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              Chemistry Knowledge Hub (16)
            </div>
            <div className="text-[10px] text-slate-600">
              Periodic Table, Stoichiometry, pH, Nernst &amp; NMR
            </div>
          </div>
        </a>

        <div className="border-t border-slate-100 my-1"></div>

        <a
          href="/tools/academic-paraphraser"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('tools/academic-paraphraser');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView === 'tools/academic-paraphraser' ? 'bg-orange-50/80 ring-1 ring-orange-200/70' : ''
          }`}
        >
          <BookCheck className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              Academic Paraphraser &amp; AI Checker
            </div>
            <div className="text-[10px] text-slate-600">
              4 Rewrite Modes, Burstiness &amp; N-Gram Originality
            </div>
          </div>
        </a>

        <a
          href="/tools"
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onLinkClick('tools');
            }
          }}
          className={`w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer ${
            activeView === 'tools' ? 'bg-orange-50/80' : ''
          }`}
        >
          <Wrench className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-orange-650">
              All Student Utilities ({STUDENT_TOOLS_COUNT})
            </div>
            <div className="text-[10px] text-slate-600">
              Grade Converter, Graph Theory, PDF, CV &amp; Citations
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

interface MobileNavigationDrawerProps {
  activeView: string;
  currentUser: User | null;
  navLinks: { name: string; view: string }[];
  onLinkClick: (view: string) => void;
  onLogout: () => void;
  onCloseMenu: () => void;
  onOpenBecomeTutor?: () => void;
}

export function MobileNavigationDrawer({
  activeView,
  currentUser,
  navLinks,
  onLinkClick,
  onLogout,
  onCloseMenu,
  onOpenBecomeTutor,
}: MobileNavigationDrawerProps) {
  return (
    <div className="lg:hidden border-t border-gray-150 bg-white shadow-xl animate-fade-in" id="mobile-navigation-drawer">
      <div className="space-y-1.5 px-4 py-4 max-h-[80vh] overflow-y-auto">
        <button
          id="mob-nav-home"
          onClick={() => onLinkClick('home')}
          className={`flex w-full items-center px-4 py-3 text-base font-semibold rounded-xl min-h-[44px] ${
            activeView === 'home'
              ? 'text-orange-650 bg-orange-50'
              : 'text-gray-750 hover:text-orange-650 hover:bg-gray-50'
          }`}
        >
          Home
        </button>

        {/* Specialized Services Mobile Accordion */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Academic Services
          </div>
          <div className="grid grid-cols-1 gap-1">
            <a
              href="/services"
              onClick={(e) => {
                if (!isModifiedAnchorClick(e)) {
                  e.preventDefault();
                  onLinkClick('services');
                }
              }}
              className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
                activeView === 'services'
                  ? 'bg-orange-50 text-orange-650'
                  : 'text-slate-800 hover:bg-orange-50 hover:text-orange-650'
              }`}
            >
              <BookOpen className="w-4 h-4 text-orange-650 shrink-0" />
              <span>All Tutoring Services Hub</span>
            </a>
            {DEDICATED_SERVICE_ROUTES.map((route) => {
              const icon =
                route.id === '1on1' ? (
                  <Video className="w-4 h-4 text-orange-650 shrink-0" />
                ) : route.id === 'assignment' ? (
                  <FileCheck className="w-4 h-4 text-orange-650 shrink-0" />
                ) : route.id === 'coursework' ? (
                  <Calendar className="w-4 h-4 text-orange-650 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-orange-650 shrink-0" />
                );
              const isItemActive = activeView === route.view;
              return (
                <a
                  key={route.id}
                  href={route.path}
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onLinkClick(route.view);
                    }
                  }}
                  className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
                    isItemActive
                      ? 'bg-orange-50 text-orange-650'
                      : 'text-slate-800 hover:bg-orange-50 hover:text-orange-650'
                  }`}
                >
                  {icon}
                  <span>{route.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile Free Science & Student Tools Links */}
        <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-200/70 space-y-1.5">
          <div className="text-xs font-bold text-orange-700 uppercase tracking-wider px-1">
            Free Math, Science &amp; Student Tools
          </div>
          <a
            href="/tools/math"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onLinkClick('tools/math');
              }
            }}
            className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
              activeView.startsWith('tools/math')
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-800 hover:bg-orange-100/70'
            }`}
          >
            <Sigma className="w-4 h-4 text-orange-650 shrink-0" />
            <span>Mathematics &amp; Statistics Hub (27 Tools)</span>
          </a>
          <a
            href="/tools/biology"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onLinkClick('tools/biology');
              }
            }}
            className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
              activeView.startsWith('tools/biology')
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-800 hover:bg-orange-100/70'
            }`}
          >
            <Dna className="w-4 h-4 text-orange-650 shrink-0" />
            <span>Biology Knowledge Hub (14 Tools)</span>
          </a>
          <a
            href="/tools/chemistry"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onLinkClick('tools/chemistry');
              }
            }}
            className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
              activeView.startsWith('tools/chemistry')
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-800 hover:bg-orange-100/70'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-orange-650 shrink-0" />
            <span>Chemistry Knowledge Hub (16 Tools)</span>
          </a>
          <a
            href="/tools/academic-paraphraser"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onLinkClick('tools/academic-paraphraser');
              }
            }}
            className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
              activeView === 'tools/academic-paraphraser'
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-800 hover:bg-orange-100/70'
            }`}
          >
            <BookCheck className="w-4 h-4 text-orange-650 shrink-0" />
            <span>Academic Paraphraser &amp; AI Checker</span>
          </a>
          <a
            href="/tools"
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onLinkClick('tools');
              }
            }}
            className={`flex items-center gap-2 text-left text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
              activeView === 'tools'
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-800 hover:bg-orange-100/70'
            }`}
          >
            <Wrench className="w-4 h-4 text-orange-650 shrink-0" />
            <span>All Student Utilities ({STUDENT_TOOLS_COUNT} Tools)</span>
          </a>
        </div>

        {navLinks
          .filter((l) => l.view !== 'home')
          .map((link) => {
            const isActive =
              activeView === link.view ||
              (link.view === 'blog' && (activeView.startsWith('blog-') || activeView.startsWith('blog/')));
            return (
              <button
                key={link.view}
                id={`mob-nav-${link.view}`}
                onClick={() => onLinkClick(link.view)}
                className={`flex w-full items-center px-4 py-3 text-base font-semibold rounded-xl min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'text-orange-650 bg-orange-50'
                    : 'text-gray-750 hover:text-orange-650 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {currentUser ? (
            <>
              <div className="px-4 py-2 flex items-center gap-3">
                {(() => {
                  const av = getResponsiveAvatarProps(
                    currentUser.avatarUrl,
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=75',
                    32
                  );
                  return (
                    <img
                      src={av.src}
                      srcSet={av.srcSet}
                      sizes="32px"
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (av.fallbackSrc && e.currentTarget.src !== av.fallbackSrc) {
                          e.currentTarget.srcSet = '';
                          e.currentTarget.src = av.fallbackSrc;
                        }
                      }}
                      className="w-8 h-8 rounded-full border object-cover"
                      alt="Avatar"
                    />
                  );
                })()}
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-600 leading-none">{currentUser.role}</p>
                </div>
              </div>
              <button
                id="mob-nav-logout"
                onClick={() => {
                  onLogout();
                  onCloseMenu();
                }}
                className="flex w-full items-center gap-2 text-red-600 px-4 py-2.5 min-h-[44px] rounded-xl hover:bg-red-50 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                id="mob-nav-signin"
                onClick={() => onLinkClick('auth')}
                className="flex w-full items-center justify-center border font-semibold px-4 py-2.5 min-h-[44px] rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Sign In
              </button>
              <button
                id="mob-nav-find"
                onClick={() => onLinkClick('tutors')}
                className="flex w-full items-center justify-center bg-orange-650 text-white font-semibold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md hover:bg-orange-700 cursor-pointer"
              >
                Find a Tutor
              </button>
              <button
                id="mob-nav-become-tutor"
                onClick={() => {
                  onCloseMenu();
                  if (onOpenBecomeTutor) onOpenBecomeTutor();
                }}
                className="flex w-full items-center justify-center bg-slate-900 text-white font-semibold px-4 py-2.5 min-h-[44px] rounded-xl shadow-md hover:bg-slate-800 gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-orange-400" />
                <span>Become a Tutor</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
