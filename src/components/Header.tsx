import React, { useState } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  BookOpen,
  ChevronDown,
  FileCheck,
  Compass,
  FileText,
  MessageCircle
} from 'lucide-react';
import { User, UserRole } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onQuickLogin: (role: UserRole) => void;
  studentsOnline: number;
  onOpenBecomeTutor?: () => void;
}

export default function Header({ 
  currentUser, 
  activeView, 
  onNavigate, 
  onLogout, 
  onQuickLogin,
  studentsOnline,
  onOpenBecomeTutor
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);

  const navLinks = [
    { name: 'Home', view: 'home' },
    { name: 'Get a Quote', view: 'get-a-quote' },
    { name: 'About Us', view: 'about' },
    { name: 'FAQs', view: 'faqs' },
    { name: 'Contact', view: 'contact' },
    { name: 'Our Blog', view: 'blog' },
  ];

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
    setIsServicesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/60" id="main-header">
      {/* Top Banner with Online Counter & Brand Promise */}
      <div className="bg-gray-900 text-white text-[11px] font-mono py-1.5 px-4 flex flex-wrap justify-between items-center z-50">
        <div className="flex items-center gap-4 w-full justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span>{studentsOnline} students online now</span>
            </div>
            <span className="hidden md:inline text-gray-500">|</span>
            <div className="hidden md:flex items-center gap-2 text-gray-300">
              <span className="text-gray-400">🔥 Regional Online Tutoring:</span>
              {[
                { code: 'usa', label: 'USA 🇺🇸' },
                { code: 'canada', label: 'CA 🇨🇦' },
                { code: 'uk', label: 'UK 🇬🇧' },
                { code: 'uae', label: 'UAE 🇦🇪' },
                { code: 'ireland', label: 'IE 🇮🇪' },
                { code: 'australia', label: 'AU 🇦🇺' },
                { code: 'new-zealand', label: 'NZ 🇳🇿' },
                { code: 'singapore', label: 'SG 🇸🇬' }
              ].map(c => (
                <button
                  key={c.code}
                  id={`header-country-${c.code}`}
                  onClick={() => handleLinkClick(`online-tutoring-${c.code}`)}
                  className="hover:text-orange-400 hover:underline cursor-pointer text-[10px] font-sans px-1"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            id="header-whatsapp-fast-track-btn"
            onClick={() => handleLinkClick('whatsapp')}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white px-2.5 py-0.5 rounded border border-emerald-700/60 transition-colors font-sans font-semibold text-[11px] cursor-pointer"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp Desk (24/7)</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Brand Identity */}
          <button 
            id="logo-home-nav"
            onClick={() => handleLinkClick('home')} 
            className="flex items-center gap-3 cursor-pointer p-1 group select-none text-left"
          >
            <img 
              src="/logo.webp" 
              alt="Uni Tutors" 
              width={215}
              height={44}
              fetchPriority="high"
              decoding="async"
              className="h-11 sm:h-13 md:h-15 w-auto max-w-[220px] object-contain transition-transform group-hover:scale-102"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              id="nav-home"
              onClick={() => handleLinkClick('home')}
              className={`text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
                  : 'text-gray-650 hover:text-orange-500 pb-1'
              }`}
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                id="nav-services-dropdown"
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                onMouseEnter={() => setIsServicesDropdownOpen(true)}
                className={`text-sm font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1 pb-1 ${
                  activeView === 'services' || activeView === 'specialized-service' || activeView.startsWith('assignment-guidance') || activeView.startsWith('coursework-tutoring') || activeView.startsWith('writing-tutoring')
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-650 hover:text-orange-500'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              <div 
                onMouseLeave={() => setIsServicesDropdownOpen(false)}
                className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 transition-all ${
                  isServicesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible pointer-events-none -translate-y-2'
                }`}
              >
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => handleLinkClick('services')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">All Tutoring Services</div>
                      <div className="text-[10px] text-slate-500">Explore comprehensive 1-on-1 tutoring</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => handleLinkClick('assignment-guidance')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">Assignment Guidance</div>
                      <div className="text-[10px] text-slate-500">Rubric analysis &amp; planning support</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLinkClick('coursework-tutoring')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">Coursework Tutoring</div>
                      <div className="text-[10px] text-slate-500">Continuous assessment &amp; STEM units</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLinkClick('writing-tutoring')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">Writing Tutoring</div>
                      <div className="text-[10px] text-slate-500">Academic essay &amp; research writing</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {navLinks.filter(l => l.view !== 'home').map((link) => (
              <button
                key={link.view}
                id={`nav-${link.view}`}
                onClick={() => handleLinkClick(link.view)}
                className={`text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                  activeView === link.view
                    ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
                    : 'text-gray-650 hover:text-orange-500 pb-1'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  id="dashboard-header-nav"
                  onClick={() => handleLinkClick('dashboard')}
                  className="bg-gray-100 hover:bg-orange-50 text-gray-800 hover:text-orange-600 flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-orange-100 text-xs font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-orange-500" />
                  <span>My Dashboard ({currentUser.role})</span>
                </button>
                <button
                  id="logout-header-btn"
                  onClick={onLogout}
                  className="text-gray-500 hover:text-red-500 p-2 rounded-xl hover:bg-gray-150 transition-colors cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-join-login"
                  onClick={() => handleLinkClick('auth')}
                  className="text-xs font-semibold text-gray-700 hover:text-orange-500 transition-colors cursor-pointer px-2 py-1.5"
                >
                  Sign In
                </button>
                <button
                  id="nav-join-find"
                  onClick={() => handleLinkClick('services')}
                  className="bg-orange-500 text-white font-semibold text-xs tracking-wider uppercase px-3.5 py-2 rounded-xl shadow-md shadow-orange-500/15 hover:bg-orange-600 hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Find a Tutor
                </button>
                <button
                  id="nav-become-tutor-btn"
                  onClick={() => {
                    if (onOpenBecomeTutor) onOpenBecomeTutor();
                  }}
                  className="bg-slate-900 text-white font-semibold text-xs tracking-wider uppercase px-3.5 py-2 rounded-xl shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                  <span>Become a Tutor</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser && (
              <button
                id="mob-nav-dash"
                onClick={() => handleLinkClick('dashboard')}
                className="bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                Dash
              </button>
            )}
            <button
              id="mob-nav-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-650 p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-150 bg-white shadow-xl animate-fade-in" id="mobile-navigation-drawer">
          <div className="space-y-1.5 px-4 py-4 max-h-[80vh] overflow-y-auto">
            <button
              id="mob-nav-home"
              onClick={() => handleLinkClick('home')}
              className={`flex w-full items-center px-4 py-3 text-base font-semibold rounded-xl min-h-[44px] ${
                activeView === 'home'
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-750 hover:text-orange-500 hover:bg-gray-50'
              }`}
            >
              Home
            </button>

            {/* Specialized Services Mobile Accordion */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Specialized Tutoring Hubs
              </div>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => handleLinkClick('services')}
                  className="flex items-center gap-2 text-left text-xs font-bold text-slate-800 p-2 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                >
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>All Tutoring Services</span>
                </button>
                <button
                  onClick={() => handleLinkClick('assignment-guidance')}
                  className="flex items-center gap-2 text-left text-xs font-bold text-slate-800 p-2 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                >
                  <FileCheck className="w-4 h-4 text-orange-500" />
                  <span>Assignment Guidance</span>
                </button>
                <button
                  onClick={() => handleLinkClick('coursework-tutoring')}
                  className="flex items-center gap-2 text-left text-xs font-bold text-slate-800 p-2 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                >
                  <Compass className="w-4 h-4 text-orange-500" />
                  <span>Coursework Tutoring</span>
                </button>
                <button
                  onClick={() => handleLinkClick('writing-tutoring')}
                  className="flex items-center gap-2 text-left text-xs font-bold text-slate-800 p-2 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                >
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Writing Tutoring</span>
                </button>
              </div>
            </div>

            {navLinks.filter(l => l.view !== 'home').map((link) => (
              <button
                key={link.view}
                id={`mob-nav-${link.view}`}
                onClick={() => handleLinkClick(link.view)}
                className={`flex w-full items-center px-4 py-3 text-base font-semibold rounded-xl min-h-[44px] ${
                  activeView === link.view
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-750 hover:text-orange-500 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}
            <button
              id="mob-nav-sop"
              onClick={() => handleLinkClick('sop')}
              className="flex w-full items-center justify-between px-4 py-3 text-base font-semibold rounded-xl text-slate-800 hover:bg-orange-50 hover:text-orange-600 min-h-[44px] border border-orange-200/60 bg-orange-50/40 cursor-pointer my-1"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <span>System SOP Guide</span>
              </span>
              <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">Interactive</span>
            </button>
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full border" alt="Avatar" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-500 leading-none">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    id="mob-nav-logout"
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-50 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    id="mob-nav-signin"
                    onClick={() => handleLinkClick('auth')}
                    className="flex w-full items-center justify-center border font-semibold px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </button>
                  <button
                    id="mob-nav-find"
                    onClick={() => handleLinkClick('services')}
                    className="flex w-full items-center justify-center bg-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:bg-orange-650"
                  >
                    Find a Tutor
                  </button>
                  <button
                    id="mob-nav-become-tutor"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onOpenBecomeTutor) onOpenBecomeTutor();
                    }}
                    className="flex w-full items-center justify-center bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:bg-slate-800 gap-2"
                  >
                    <GraduationCap className="w-4 h-4 text-orange-400" />
                    <span>Become a Tutor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
