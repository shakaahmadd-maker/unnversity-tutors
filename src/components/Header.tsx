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
  BookOpen
} from 'lucide-react';
import { User, UserRole } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onQuickLogin: (role: UserRole) => void;
  studentsOnline: number;
}

export default function Header({ 
  currentUser, 
  activeView, 
  onNavigate, 
  onLogout, 
  onQuickLogin,
  studentsOnline
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);

  const navLinks = [
    { name: 'Home', view: 'home' },
    { name: 'Services', view: 'services' },
    { name: 'Get a Quote', view: 'get-a-quote' },
    { name: 'About Us', view: 'about' },
    { name: 'FAQs', view: 'faqs' },
    { name: 'Contact', view: 'contact' },
    { name: 'Our Blog', view: 'blog' },
  ];

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/60" id="main-header">
      {/* Top Banner with Online Counter & Hot-Switch Panel */}
      <div className="bg-gray-900 text-white text-[11px] font-mono py-1.5 px-4 flex flex-wrap justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>{studentsOnline} students online now</span>
          </div>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="hidden sm:inline text-gray-400">🔥 Live University Mentors (UK, US, CA, AU, NZ, IE)</span>
        </div>
        
        {/* Quick Role Select Panel */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0 relative">
          <span className="text-gray-400 font-sans font-semibold">🔄 Quick Audit Roles:</span>
          <button 
            id="audit-student-login"
            onClick={() => onQuickLogin(UserRole.STUDENT)} 
            className="bg-orange-500 hover:bg-orange-600 px-2 py-0.5 rounded text-[10px] text-white font-medium transition-colors cursor-pointer"
          >
            Student
          </button>
          <button 
            id="audit-tutor-login"
            onClick={() => onQuickLogin(UserRole.TUTOR)} 
            className="bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded text-[10px] text-white font-medium transition-colors cursor-pointer"
          >
            Tutor
          </button>
          <button 
            id="audit-admin-login"
            onClick={() => onQuickLogin(UserRole.ADMIN)} 
            className="bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded text-[10px] text-white font-medium transition-colors cursor-pointer"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand Identity */}
          <button 
            id="logo-home-nav"
            onClick={() => handleLinkClick('home')} 
            className="flex items-center gap-2 cursor-pointer p-1"
          >
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/10">
              <GraduationCap className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold font-sans tracking-tight text-gray-900 block leading-tight">
                university<span className="text-orange-500">tutors</span><span className="text-xs font-mono text-gray-400 font-normal">.com</span>
              </span>
              <span className="text-[10px] text-gray-500 block -mt-1 font-sans">
                Global Academic Excellence
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
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
              <>
                <button
                  id="nav-join-login"
                  onClick={() => handleLinkClick('auth')}
                  className="text-sm font-semibold text-gray-650 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="nav-join-find"
                  onClick={() => handleLinkClick('services')}
                  className="bg-orange-500 text-white font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/15 hover:bg-orange-650 hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Find a Tutor
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburguer toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser && (
              <button
                id="mob-nav-dash"
                onClick={() => handleLinkClick('dashboard')}
                className="bg-orange-50 text-orange-600 p-2 rounded-xl text-xs font-semibold"
              >
                Dash
              </button>
            )}
            <button
              id="mob-nav-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-650 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-150 bg-white" id="mobile-navigation-drawer">
          <div className="space-y-1.5 px-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.view}
                id={`mob-nav-${link.view}`}
                onClick={() => handleLinkClick(link.view)}
                className={`flex w-full items-center px-4 py-2.5 text-base font-semibold rounded-xl ${
                  activeView === link.view
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-750 hover:text-orange-500 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}
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
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
