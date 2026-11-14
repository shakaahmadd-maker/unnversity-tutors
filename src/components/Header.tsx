import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { resolveDedicatedServiceRoute } from '../data/dedicatedServiceRoutes';

const ServicesDropdownPanel = lazy(() =>
  import('./HeaderMenus').then((m) => ({ default: m.ServicesDropdownPanel }))
);
const ToolsDropdownPanel = lazy(() =>
  import('./HeaderMenus').then((m) => ({ default: m.ToolsDropdownPanel }))
);
const MobileNavigationDrawer = lazy(() =>
  import('./HeaderMenus').then((m) => ({ default: m.MobileNavigationDrawer }))
);

let menusPrefetched = false;
function prefetchHeaderMenus() {
  if (menusPrefetched) return;
  menusPrefetched = true;
  void import('./HeaderMenus');
}

interface HeaderProps {
  currentUser: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onQuickLogin: (role: UserRole) => void;
  studentsOnline: number;
  onOpenBecomeTutor?: () => void;
}

const NAV_LINKS = [
  { name: 'Home', view: 'home' },
  { name: 'Get a Quote', view: 'get-a-quote' },
  { name: 'About', view: 'about' },
  { name: 'FAQs', view: 'faqs' },
  { name: 'Contact', view: 'contact' },
  { name: 'Blog', view: 'blog' },
];

export default function Header({
  currentUser,
  activeView,
  onNavigate,
  onLogout,
  studentsOnline,
  onOpenBecomeTutor,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 768px)').matches
      : true
  );
  const [isLgUp, setIsLgUp] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mdMql = window.matchMedia('(min-width: 768px)');
    const lgMql = window.matchMedia('(min-width: 1024px)');
    setIsMdUp(mdMql.matches);
    setIsLgUp(lgMql.matches);
    const onMd = (e: MediaQueryListEvent) => setIsMdUp(e.matches);
    const onLg = (e: MediaQueryListEvent) => setIsLgUp(e.matches);
    mdMql.addEventListener('change', onMd);
    lgMql.addEventListener('change', onLg);
    return () => {
      mdMql.removeEventListener('change', onMd);
      lgMql.removeEventListener('change', onLg);
    };
  }, []);

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setIsToolsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/60" id="main-header">
      {/* Top Banner with Online Counter & Brand Promise */}
      <div className="bg-gray-900 text-white text-[11px] font-mono py-1.5 px-3 sm:px-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 w-full justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0"></span>
              <span>{studentsOnline} students online</span>
            </div>
            {isMdUp && (
              <>
                <span className="hidden md:inline text-gray-500 shrink-0">|</span>
                <div className="hidden md:flex items-center gap-1.5 text-gray-200 shrink-0">
                  <span className="text-gray-300">🔥 Regional Online Tutoring:</span>
                  {[
                    { code: 'usa', label: 'USA 🇺🇸' },
                    { code: 'canada', label: 'CA 🇨🇦' },
                    { code: 'uk', label: 'UK 🇬🇧' },
                    { code: 'uae', label: 'UAE 🇦🇪' },
                    { code: 'ireland', label: 'IE 🇮🇪' },
                    { code: 'australia', label: 'AU 🇦🇺' },
                    { code: 'new-zealand', label: 'NZ 🇳🇿' },
                    { code: 'singapore', label: 'SG 🇸🇬' },
                  ].map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      id={`header-country-${c.code}`}
                      onClick={() => handleLinkClick(`online-tutoring-${c.code}`)}
                      className="hover:text-orange-400 hover:underline cursor-pointer text-[10px] font-sans px-1 shrink-0"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            id="header-whatsapp-fast-track-btn"
            onClick={() => handleLinkClick('whatsapp')}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white px-2.5 py-0.5 rounded border border-emerald-700/60 transition-colors font-sans font-semibold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>WhatsApp (24/7)</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-5 xl:px-8 max-w-7xl">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-3 xl:gap-6">
          {/* Logo Brand Identity */}
          <button
            type="button"
            id="logo-home-nav"
            onClick={() => handleLinkClick('home')}
            className="flex items-center cursor-pointer py-1 pr-2 group select-none text-left shrink-0"
          >
            <picture className="shrink-0">
              <source type="image/avif" srcSet="/logo-440.avif" />
              <source
                type="image/webp"
                srcSet="/logo-220.webp 220w, /logo-440.webp 440w"
                sizes="(max-width: 640px) 140px, 220px"
              />
              <img
                src="/logo.webp"
                alt="Uni Tutors"
                width={220}
                height={84}
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                className="h-9 sm:h-11 lg:h-10 xl:h-12 w-auto max-w-[165px] sm:max-w-[195px] lg:max-w-[165px] xl:max-w-[210px] object-contain transition-transform group-hover:scale-102"
              />
            </picture>
          </button>

          {/* Desktop Navigation Links */}
          {isLgUp && (
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 shrink-0" onPointerEnter={prefetchHeaderMenus}>
              <button
                type="button"
                id="nav-home"
                onClick={() => handleLinkClick('home')}
                className={`text-[13px] xl:text-sm font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'home'
                    ? 'text-orange-650 border-b-2 border-orange-650 pb-1'
                    : 'text-gray-700 hover:text-orange-650 pb-1'
                }`}
              >
                Home
              </button>

              {/* Services Dropdown */}
              <div
                className="relative group shrink-0"
                onMouseLeave={() => setIsServicesDropdownOpen(false)}
              >
                <button
                  type="button"
                  id="nav-services-dropdown"
                  aria-expanded={isServicesDropdownOpen}
                  aria-haspopup="menu"
                  onFocus={prefetchHeaderMenus}
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  onMouseEnter={() => {
                    prefetchHeaderMenus();
                    setIsServicesDropdownOpen(true);
                  }}
                  className={`text-[13px] xl:text-sm font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1 pb-1 whitespace-nowrap shrink-0 ${
                    activeView === 'services' ||
                    Boolean(resolveDedicatedServiceRoute(activeView)) ||
                    activeView === 'specialized-service' ||
                    activeView.startsWith('assignment-guidance') ||
                    activeView.startsWith('coursework-tutoring') ||
                    activeView.startsWith('writing-tutoring')
                      ? 'text-orange-650 border-b-2 border-orange-650'
                      : 'text-gray-700 hover:text-orange-650'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                </button>

                {isServicesDropdownOpen && (
                  <Suspense fallback={null}>
                    <ServicesDropdownPanel
                      activeView={activeView}
                      onLinkClick={handleLinkClick}
                    />
                  </Suspense>
                )}
              </div>

              {/* Free Tools Dropdown */}
              <div
                className="relative group shrink-0"
                onMouseLeave={() => setIsToolsDropdownOpen(false)}
              >
                <button
                  type="button"
                  id="nav-tools-dropdown"
                  aria-expanded={isToolsDropdownOpen}
                  aria-haspopup="menu"
                  onFocus={prefetchHeaderMenus}
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  onMouseEnter={() => {
                    prefetchHeaderMenus();
                    setIsToolsDropdownOpen(true);
                  }}
                  className={`text-[13px] xl:text-sm font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1 pb-1 whitespace-nowrap shrink-0 ${
                    activeView === 'tools' || activeView.startsWith('tools/')
                      ? 'text-orange-650 border-b-2 border-orange-650'
                      : 'text-gray-700 hover:text-orange-650'
                  }`}
                >
                  <span>Free Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                </button>

                {isToolsDropdownOpen && (
                  <Suspense fallback={null}>
                    <ToolsDropdownPanel
                      activeView={activeView}
                      onLinkClick={handleLinkClick}
                    />
                  </Suspense>
                )}
              </div>

              {NAV_LINKS.filter((l) => l.view !== 'home').map((link) => {
                const isActive =
                  activeView === link.view ||
                  (link.view === 'blog' && (activeView.startsWith('blog-') || activeView.startsWith('blog/')));
                return (
                  <button
                    type="button"
                    key={link.view}
                    id={`nav-${link.view}`}
                    onClick={() => handleLinkClick(link.view)}
                    className={`text-[13px] xl:text-sm font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-orange-650 border-b-2 border-orange-650 pb-1'
                        : 'text-gray-700 hover:text-orange-650 pb-1'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action buttons */}
          {isLgUp && (
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    id="dashboard-header-nav"
                    onClick={() => handleLinkClick('dashboard')}
                    className="bg-gray-100 hover:bg-orange-50 text-gray-800 hover:text-orange-650 flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl transition-all cursor-pointer border border-transparent hover:border-orange-100 text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <UserIcon className="w-4 h-4 text-orange-650 shrink-0" />
                    <span>My Dashboard ({currentUser.role})</span>
                  </button>
                  <button
                    type="button"
                    id="logout-header-btn"
                    onClick={onLogout}
                    className="text-gray-600 hover:text-red-600 p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-xl hover:bg-gray-150 transition-colors cursor-pointer shrink-0"
                    title="Logout Session"
                    aria-label="Logout Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
                  <button
                    type="button"
                    id="nav-join-login"
                    onClick={() => handleLinkClick('auth')}
                    className="text-xs xl:text-[13px] font-semibold text-gray-700 hover:text-orange-650 transition-colors cursor-pointer px-2.5 py-2 min-h-[40px] whitespace-nowrap shrink-0"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    id="nav-join-find"
                    onClick={() => handleLinkClick('tutors')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] xl:text-xs tracking-wider uppercase px-3 xl:px-4 py-2 min-h-[40px] rounded-xl shadow-md shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Find a Tutor
                  </button>
                  <button
                    type="button"
                    id="nav-become-tutor-btn"
                    onClick={() => {
                      if (onOpenBecomeTutor) onOpenBecomeTutor();
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] xl:text-xs tracking-wider uppercase px-3 xl:px-4 py-2 min-h-[40px] rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Become a Tutor</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger toggle */}
          {!isLgUp && (
            <div className="flex lg:hidden items-center gap-2">
              {currentUser && (
                <button
                  id="mob-nav-dash"
                  onClick={() => handleLinkClick('dashboard')}
                  className="bg-orange-50 text-orange-700 px-3 py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  Dash
                </button>
              )}
              <button
                id="mob-nav-menu-toggle"
                onPointerEnter={prefetchHeaderMenus}
                onTouchStart={prefetchHeaderMenus}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                className="text-gray-650 p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <Suspense fallback={null}>
          <MobileNavigationDrawer
            activeView={activeView}
            currentUser={currentUser}
            navLinks={NAV_LINKS}
            onLinkClick={handleLinkClick}
            onLogout={onLogout}
            onCloseMenu={() => setIsMenuOpen(false)}
            onOpenBecomeTutor={onOpenBecomeTutor}
          />
        </Suspense>
      )}
    </header>
  );
}
