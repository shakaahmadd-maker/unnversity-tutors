import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Shield
} from 'lucide-react';
import FooterLocationsSubjects from './FooterLocationsSubjects';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

const FooterToolDirectories = React.lazy(() => import('./FooterToolDirectories'));

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function Footer({ onNavigate, onOpenBecomeTutor }: FooterProps) {
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const [isMathToolsOpen, setIsMathToolsOpen] = useState(false);
  const [isStudentToolsOpen, setIsStudentToolsOpen] = useState(false);

  // Compliant SEO keywords strictly aligned with Google Ads and Academic Integrity Policies
  const seoKeywords = [
    { text: 'find university tutors online', href: '/tutors', view: 'tutors' },
    { text: 'prepare for final exam questions', href: '/services/coursework-track', view: 'service-coursework' },
    { text: 'academic essay structure help', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'urgent academic tutoring help', href: '/services/1-on-1-live-tutoring', view: 'service-1on1' },
    { text: 'online study guide assistance', href: '/services/assignment-guidance', view: 'service-assignment' },
    { text: 'professional coursework mentoring', href: '/services/coursework-track', view: 'service-coursework' },
    { text: 'dissertation format review', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'grammar and citation proofreading', href: '/services/essay-reference-checks', view: 'service-essay' },
    { text: 'math derivation step-by-step coaching', href: '/services/1-on-1-live-tutoring', view: 'service-1on1' },
    { text: 'guided software project tutor', href: '/services/assignment-guidance', view: 'service-assignment' }
  ];
  return (
    <footer className="bg-[#ffeedd] border-t-2 border-[#ffab85] text-[#542104] font-sans" id="main-footer">


      {/* Popular International Locations & Popular Online Subjects Section */}
      <FooterLocationsSubjects
        onNavigateLocation={(city) => {
          onNavigate(`location:${city}`);
        }}
        onNavigateSubject={(subj) => {
          onNavigate(`subject:${subj}`);
        }}
        onNavigateCountry={(slug) => {
          onNavigate(`online-tutoring-${slug}`);
        }}
        onNavigateService={(serviceSlug) => {
          onNavigate(serviceSlug);
        }}
      />

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/logo-440.avif"
                />
                <source
                  type="image/webp"
                  srcSet="/logo-220.webp 220w, /logo-440.webp 440w"
                  sizes="220px"
                />
                <img 
                  src="/logo.webp" 
                  alt="Uni Tutors" 
                  width={220}
                  height={84}
                  loading="lazy"
                  decoding="async"
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[220px] sm:max-w-[250px] object-contain"
                />
              </picture>
            </div>
            <p className="text-xs text-[#542104]/90 leading-relaxed font-medium">
              Your Global Partner for Academic Success. Connecting premium degree-seeking students with native certified subject experts across major English-speaking networks.
            </p>
            <div className="text-xs space-y-2.5 pt-3 text-[#542104]/90">
              <div className="flex items-center gap-2.5 group">
                <Mail className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-orange-700 transition-colors font-semibold">support@universitytutors.com</span>
              </div>
              <div className="flex items-center gap-2.5 group">
                <Phone className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-orange-700 transition-colors font-semibold">+1 (800) 123-TUTOR</span>
              </div>
              <div className="flex items-center gap-2.5 group">
                <MapPin className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-orange-700 transition-colors font-semibold">London • New York • Sydney</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest pb-1 border-b border-[#ffab85]/60 mb-2">Academic Portals</h3>
            <ul className="text-xs space-y-1.5 font-semibold">
              {[
                { name: 'All Tutoring Services Hub', view: 'services', href: '/services' },
                { name: '1-on-1 Live Tutoring', view: 'service-1on1', href: '/services/1-on-1-live-tutoring' },
                { name: 'Assignment Guidance', view: 'service-assignment', href: '/services/assignment-guidance' },
                { name: 'Coursework Track', view: 'service-coursework', href: '/services/coursework-track' },
                { name: 'Essay & Reference Checks', view: 'service-essay', href: '/services/essay-reference-checks' },
                { name: 'WhatsApp Academic Hotline', view: 'whatsapp', href: '/whatsapp' },
                { name: 'Become a Tutor (Apply Now)', action: 'become-tutor' },
                { name: 'About Founding Team', view: 'about', href: '/about' },
                { name: 'Knowledge Center (Blog)', view: 'blog', href: '/blog' },
              ].map((link, idx) => (
                <li key={idx}>
                  {link.href ? (
                    <a
                      id={`footer-nav-link-${idx}`}
                      href={link.href}
                      onClick={(e) => {
                        if (!isModifiedAnchorClick(e)) {
                          e.preventDefault();
                          if (link.view) onNavigate(link.view);
                        }
                      }}
                      className="inline-flex items-center min-h-[28px] py-1 hover:text-orange-700 hover:translate-x-1.5 transition-all text-left cursor-pointer text-[#542104] hover:font-bold"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <button 
                      id={`footer-nav-link-${idx}`}
                      onClick={() => {
                        if (link.action === 'become-tutor' && onOpenBecomeTutor) {
                          onOpenBecomeTutor();
                        }
                      }} 
                      className="inline-flex items-center min-h-[28px] py-1 hover:text-orange-700 hover:translate-x-1.5 transition-all text-left cursor-pointer text-[#542104] hover:font-bold"
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Certifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest pb-1 border-b border-[#ffab85]/60 mb-2 font-display">Policy & Trust Links</h3>
            <ul className="text-xs space-y-1.5 font-semibold">
              {[
                { name: 'Standard Operating Procedures (SOP)', view: 'sop' },
                { name: 'Payments Escrow Guarantee', view: 'payments_info' },
                { name: 'Privacy Policy & GDPR Disclosure', view: 'privacy' },
                { name: 'User Data Deletion Instructions', view: 'data-deletion' },
                { name: 'Terms of Service & Escrow Agreement', view: 'terms' },
                { name: 'Google OAuth Disclosure', view: 'google-disclosure' },
                { name: 'Frequently Asked Questions (FAQs)', view: 'faqs' },
                { name: 'Contact 24/7 Human Advising', view: 'contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <button 
                    id={`footer-policy-link-${idx}`}
                    onClick={() => onNavigate(link.view)} 
                    className="inline-flex items-center min-h-[28px] py-1 hover:text-orange-700 hover:translate-x-1.5 transition-all text-left cursor-pointer text-[#542104] hover:font-bold"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Trust Badge */}
          <div className="space-y-4 bg-[#fffbf7] p-6 rounded-2xl border border-[#ffab85]/60 shadow-xs">
            <h3 className="text-xs font-display font-bold text-[#331301] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Custom Escrow
            </h3>
            <p className="text-[11px] text-[#542104]/90 leading-relaxed font-semibold">
              We leverage safe, administrator-monitored holding escrow to lock tuition fees securely. Tutors are only paid after successful deliverables are finalized and authorized by students.
            </p>
            <div className="flex gap-2 pt-1 font-mono text-[9px] font-bold">
              <span className="bg-[#ffece1] text-orange-800 px-2.5 py-1 rounded-md border border-[#fed7aa]/50">Manual Checks</span>
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">SSL Encrypted</span>
            </div>
          </div>

        </div>

        {/* Free University Mathematics & Statistics Suite (All 27 Standalone Pages) */}
        <div className="mt-12 pt-8 border-t border-[#ffab85]/55">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest">
                Free University Mathematics &amp; Statistics Suite (27 Interactive Solvers)
              </h3>
              <p className="text-[11px] text-[#542104]/90 mt-0.5 font-medium">
                100% browser-local Algebra, Trigonometry, Calculus, Linear Algebra, Statistics, ODE, and RSA calculators.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/tools/math"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tools/math');
                  }
                }}
                className="inline-flex items-center min-h-[36px] py-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline whitespace-nowrap cursor-pointer"
              >
                Mathematics &amp; Stats Hub (27 Tools) →
              </a>
              <button
                type="button"
                onClick={() => setIsMathToolsOpen((prev) => !prev)}
                aria-expanded={isMathToolsOpen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-[#fffbf7] border border-[#ffab85]/60 hover:border-orange-500 text-xs font-bold text-[#542104] hover:text-orange-800 transition-colors cursor-pointer"
              >
                <span>{isMathToolsOpen ? 'Hide 27 Math Solvers' : 'Show All 27 Math Solvers'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMathToolsOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isMathToolsOpen && (
            <React.Suspense fallback={<div className="py-4 text-xs text-[#542104]/80 font-semibold">Loading math solvers directory...</div>}>
              <FooterToolDirectories mode="math" onNavigate={onNavigate} />
            </React.Suspense>
          )}
        </div>

        {/* Free Student Tools Global SEO Directory (All Standalone Pages) */}
        <div className="mt-10 pt-8 border-t border-[#ffab85]/55">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest">
                Free Student Tools Suite (100% Local Browser Utilities)
              </h3>
              <p className="text-[11px] text-[#542104]/90 mt-0.5 font-medium">
                Zero-upload PDF, citation, chart, resume, image compression, OCR, and GPA tools for university students.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/tools/math"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tools/math');
                  }
                }}
                className="inline-flex items-center min-h-[32px] py-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline whitespace-nowrap cursor-pointer"
              >
                Math Hub (27 Tools) →
              </a>
              <a
                href="/tools/biology"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tools/biology');
                  }
                }}
                className="inline-flex items-center min-h-[32px] py-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline whitespace-nowrap cursor-pointer"
              >
                Biology Hub (14 Tools) →
              </a>
              <a
                href="/tools/chemistry"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tools/chemistry');
                  }
                }}
                className="inline-flex items-center min-h-[32px] py-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline whitespace-nowrap cursor-pointer"
              >
                Chemistry Hub (16 Tools) →
              </a>
              <a
                href="/tools"
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate('tools');
                  }
                }}
                className="inline-flex items-center min-h-[32px] py-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline whitespace-nowrap cursor-pointer"
              >
                All Student Tools →
              </a>
              <button
                type="button"
                onClick={() => setIsStudentToolsOpen((prev) => !prev)}
                aria-expanded={isStudentToolsOpen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-[#fffbf7] border border-[#ffab85]/60 hover:border-orange-500 text-xs font-bold text-[#542104] hover:text-orange-800 transition-colors cursor-pointer"
              >
                <span>{isStudentToolsOpen ? 'Hide Individual Tools' : 'Show Individual Tools'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isStudentToolsOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isStudentToolsOpen && (
            <React.Suspense fallback={<div className="py-4 text-xs text-[#542104]/80 font-semibold">Loading student tools directory...</div>}>
              <FooterToolDirectories mode="student" onNavigate={onNavigate} />
            </React.Suspense>
          )}
        </div>

        {/* Gray Unethical Search Term Links Section */}
        <div className="mt-16 pt-8 border-t border-[#ffab85]/55" id="google-ads-keywords">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-orange-700" />
            <h3 className="text-[10px] font-display font-bold text-[#331301] uppercase tracking-widest">Students Also Ask For (SEO Search Index)</h3>
          </div>
          <div className="flex flex-wrap gap-2.5 text-[11px]">
            {seoKeywords.map((kw, idx) => (
              <a
                key={idx}
                id={`seo-keyword-${idx}`}
                href={kw.href}
                onClick={(e) => {
                  if (!isModifiedAnchorClick(e)) {
                    e.preventDefault();
                    onNavigate(kw.view);
                  }
                }}
                rel="nofollow"
                className="text-[#542104] hover:text-orange-800 hover:bg-[#ffece1] hover:border-[#ffab85] transition-all duration-200 cursor-pointer inline-flex items-center min-h-[32px] border border-[#ffab85]/45 px-3 py-1.5 rounded-lg bg-[#fffbf7]"
              >
                {kw.text}
              </a>
            ))}
          </div>


          {/* Collapsible Disclosure Toggle Button */}
          <div className="flex flex-col items-center justify-center mt-8 mb-3">
            <button
              id="toggleDisclosureBtn"
              type="button"
              onClick={() => setIsDisclosureOpen((prev) => !prev)}
              aria-expanded={isDisclosureOpen}
              aria-controls="footerDisclosurePanel"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 min-h-[44px] rounded-full bg-white hover:bg-orange-50/80 border border-[#ffab85]/70 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all duration-200 text-xs sm:text-sm font-semibold text-[#542104] hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-orange-600 shrink-0" />
              <span id="btnText">
                {isDisclosureOpen
                  ? 'Hide Platform Identity & Academic Integrity Disclosures'
                  : 'View Platform Identity & Academic Integrity Disclosures'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-stone-600 group-hover:text-orange-600 transition-transform duration-300 ${
                  isDisclosureOpen ? 'rotate-180 text-orange-600' : ''
                }`}
              />
            </button>
            <span className="text-[11px] text-[#542104]/85 mt-1.5 select-none font-medium">
              Click to {isDisclosureOpen ? 'close' : 'open'} legal, identity &amp; academic integrity disclosures
            </span>
          </div>

          {/* Collapsible Disclosures Container */}
          <div
            id="footerDisclosurePanel"
            className={`transition-all duration-400 ease-in-out overflow-hidden ${
              isDisclosureOpen ? 'max-h-[1400px] opacity-100 mt-4 space-y-4' : 'max-h-0 opacity-0 pointer-events-none mt-0 space-y-0'
            }`}
          >
            {isDisclosureOpen && (
            <>
            {/* Application Overview & Google API Disclosure */}
            <div className="p-6 bg-[#fffbf7] border border-[#ffab85]/55 rounded-3xl space-y-4 text-left shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#ffab85]/35 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest block font-sans">
                    Platform Identity &amp; Services
                  </span>
                  <h4 className="text-sm font-extrabold text-[#331301] tracking-tight font-display">
                    Application Overview
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Google API &amp; Privacy Protocols
                </span>
              </div>
              <p className="text-xs text-[#542104]/90 leading-relaxed font-sans font-semibold">
                <strong>University-tutors</strong> is an integrated academic support platform designed to connect students with expert educational consultants and tutors. This application facilitates secure, real-time consultation chats, document sharing for assignment briefs, and streamlined project tracking between students and administrative teams to enhance the overall learning experience.
              </p>
              <div className="pt-1 flex justify-end text-xs">
                <button 
                  onClick={() => { onNavigate('google-disclosure'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="text-orange-700 hover:text-orange-900 font-bold hover:underline inline-flex items-center gap-1 transition-all"
                >
                  View Google OAuth Disclosure →
                </button>
              </div>
            </div>

            {/* Core Academic Disclaimer near keywords */}
            <div className="p-4 bg-[#fff2e6]/80 border border-[#ffab85]/55 rounded-2xl space-y-2.5 text-left">
              <p className="text-[11px] text-[#331301] leading-relaxed font-semibold">
                🛡️ <strong>Academic Integrity Statement:</strong> University-Tutors provides ethical academic mentorship, tutoring, and editing consultation. We do not write essays, complete assignments, or take exams on behalf of students. All support is designed to help students learn and produce their own original work.
              </p>
              <p className="text-[10px] text-[#542104] leading-normal italic font-medium">
                All services provided by universitytutors.com are meant to serve as references, explanatory outline models, or tutoring study guides. We do not condone, recommend, or support any form of plagiarism, exam cheating, academic dishonesty, ghostwriting, or contract cheating under university-mandated Honor Codes.
              </p>
              <p className="text-[10px] text-[#542104]/95 leading-normal font-sans font-medium">
                💬 <strong>Quotation & Transparency Note:</strong> All pricing is negotiated on a case‑by‑case basis between the student and the tutor. University-Tutors.com does not set standard rates. You will always see the final price before making any payment. Price is finalized only after you and your tutor agree on the scope – no hidden fees. Any enquiries can be sent directly to <a href="mailto:support@universitytutors.com" className="underline font-bold text-orange-700 hover:text-orange-850">support@universitytutors.com</a>.
              </p>
            </div>
            </>
            )}
          </div>
        </div>

        {/* Bottom copyright details & Legal Links */}
        <div className="mt-10 pt-6 border-t border-[#ffab85]/40 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#542104]/90 gap-4 text-center md:text-left">
          <p className="font-medium max-w-xl">
            © 2026 universitytutors.com. All Rights Reserved. Created under educational technology guidelines for UK, US, CA, AU, NZ &amp; IE local curriculum support.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-x-2 md:gap-x-3 text-xs font-bold w-full md:w-auto">
            <button 
              id="footer-cc-priv" 
              onClick={() => { onNavigate('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Privacy Policy
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-terms" 
              onClick={() => { onNavigate('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Terms of Service
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-disclosure" 
              onClick={() => { onNavigate('google-disclosure'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Google Disclosure
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-contact" 
              onClick={() => { onNavigate('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Contact Us
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-sop" 
              onClick={() => { onNavigate('sop'); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              System SOP
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-admin" 
              onClick={() => { onNavigate('admin-login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="inline-flex items-center min-h-[32px] hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
