import React from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import FooterLocationsSubjects from './FooterLocationsSubjects';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

export default function Footer({ onNavigate, onOpenBecomeTutor }: FooterProps) {
  // Compliant SEO keywords strictly aligned with Google Ads and Academic Integrity Policies
  const seoKeywords = [
    { text: 'find university tutors online', href: '#services' },
    { text: 'prepare for final exam questions', href: '#services' },
    { text: 'academic essay structure help', href: '#services' },
    { text: 'urgent academic tutoring help', href: '#services' },
    { text: 'online study guide assistance', href: '#services' },
    { text: 'professional coursework mentoring', href: '#services' },
    { text: 'dissertation format review', href: '#services' },
    { text: 'grammar and citation proofreading', href: '#services' },
    { text: 'math derivation step-by-step coaching', href: '#services' },
    { text: 'guided software project tutor', href: '#services' }
  ];

  const countries = [
    { code: 'GB', name: 'United Kingdom', slug: 'uk', flag: '🇬🇧', price: 'Custom Quote', regions: 'England, Scotland, Wales, NI' },
    { code: 'US', name: 'United States', slug: 'usa', flag: '🇺🇸', price: 'Custom Quote', regions: 'Nationwide coverage' },
    { code: 'CA', name: 'Canada', slug: 'canada', flag: '🇨🇦', price: 'Custom Quote', regions: 'Toronto, Vancouver, Montreal' },
    { code: 'AU', name: 'Australia', slug: 'australia', flag: '🇦🇺', price: 'Custom Quote', regions: 'Sydney, Melbourne, Brisbane' },
    { code: 'NZ', name: 'New Zealand', slug: 'new-zealand', flag: '🇳🇿', price: 'Custom Quote', regions: 'Auckland, Wellington' },
    { code: 'IE', name: 'Ireland', slug: 'ireland', flag: '🇮🇪', price: 'Custom Quote', regions: 'Dublin, Cork, Galway' },
    { code: 'AE', name: 'United Arab Emirates', slug: 'uae', flag: '🇦🇪', price: 'Custom Quote', regions: 'Dubai, Abu Dhabi, Sharjah' },
    { code: 'SG', name: 'Singapore', slug: 'singapore', flag: '🇸🇬', price: 'Custom Quote', regions: 'National Syllabus, NUS, NTU' }
  ];

  return (
    <footer className="bg-[#ffeedd] border-t-2 border-[#ffab85] text-[#542104] font-sans" id="main-footer">
      {/* Top Footer Banner: Local Tutoring hubs with smooth left-to-right sliding marquee */}
      <div className="bg-[#ffd9be] border-b border-[#ffab85] py-10 overflow-hidden relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee-scroll-right {
            display: flex;
            width: max-content;
            animation: marquee-scroll-right 40s linear infinite;
          }
          .animate-marquee-scroll-right:hover {
            animation-play-state: paused;
          }
        `}} />

        {/* Soft edge fade masks */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#ffd9be] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#ffd9be] to-transparent z-10 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 md:px-8 mb-5">
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-orange-600 animate-pulse" />
            <span className="text-[#331301] font-display font-bold tracking-wider uppercase text-xs">Our Global Study Hubs &amp; Regional Curriculums</span>
          </div>
        </div>

        {/* Sliding stream wrapper */}
        <div className="w-full overflow-hidden flex">
          <div className="animate-marquee-scroll-right flex gap-5 font-sans">
            {[...countries, ...countries, ...countries, ...countries].map((c, idx) => (
              <button 
                key={`${c.code}-${idx}`}
                id={`footer-marquee-country-${c.code}-${idx}`}
                onClick={() => onNavigate(`online-tutoring-${c.slug}`)}
                className="bg-[#fff8f2] p-4 rounded-2xl border border-[#ffab85]/55 hover:border-orange-500 hover:bg-[#ffebd6] transition-all duration-300 flex flex-col items-center text-center group shadow-xs hover:shadow-md shrink-0 w-52 sm:w-56 cursor-pointer text-left"
              >
                <div className="h-7 w-10 mb-2 flex items-center justify-center bg-white rounded border border-orange-200 overflow-hidden filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <img 
                    src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                    alt={`${c.name} Flag`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs font-display font-bold text-[#331301] group-hover:text-orange-955 transition-colors">
                  {c.name}
                </span>
                <span className="text-[10px] text-orange-800 font-bold mt-1 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20 font-mono">
                  {c.price}
                </span>
                <span className="text-[9px] text-[#542104]/80 leading-tight mt-2 font-semibold">
                  {c.regions}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

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
              <img 
                src="/logo.webp" 
                alt="Uni Tutors" 
                referrerPolicy="no-referrer"
                className="h-11 sm:h-13 md:h-15 w-auto max-w-[220px] object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/logo.png')) {
                    target.src = '/logo.png';
                  }
                }}
              />
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
            <h4 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest pb-1 border-b border-[#ffab85]/60 mb-2">Academic Portals</h4>
            <ul className="text-xs space-y-3 font-semibold">
              {[
                { name: 'University Subjects', view: 'services' },
                { name: 'WhatsApp Academic Hotline', view: 'whatsapp' },
                { name: '1-on-1 Online Mentorship', view: 'services' },
                { name: 'Assignment Prep & Tutoring', view: 'services' },
                { name: 'Become a Tutor (Apply Now)', action: 'become-tutor' },
                { name: 'About Founding Team', view: 'about' },
                { name: 'Knowledge Center (Blog)', view: 'blog' },
              ].map((link, idx) => (
                <li key={idx}>
                  <button 
                    id={`footer-nav-link-${idx}`}
                    onClick={() => {
                      if (link.action === 'become-tutor' && onOpenBecomeTutor) {
                        onOpenBecomeTutor();
                      } else if (link.view) {
                        onNavigate(link.view);
                      }
                    }} 
                    className="hover:text-orange-700 hover:translate-x-1.5 transition-all text-left cursor-pointer text-[#542104] hover:font-bold"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Certifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-display font-bold text-[#331301] uppercase tracking-widest pb-1 border-b border-[#ffab85]/60 mb-2 font-display">Policy & Trust Links</h4>
            <ul className="text-xs space-y-3 font-semibold">
              {[
                { name: 'Standard Operating Procedures (SOP)', view: 'sop' },
                { name: 'Payments Escrow Guarantee', view: 'payments_info' },
                { name: 'Privacy Policy & GDPR Disclosure', view: 'privacy' },
                { name: 'Terms of Service & Escrow Agreement', view: 'terms' },
                { name: 'Google OAuth Disclosure', view: 'google-disclosure' },
                { name: 'Frequently Asked Questions (FAQs)', view: 'faqs' },
                { name: 'Contact 24/7 Human Advising', view: 'contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <button 
                    id={`footer-policy-link-${idx}`}
                    onClick={() => onNavigate(link.view)} 
                    className="hover:text-orange-700 hover:translate-x-1.5 transition-all text-left cursor-pointer text-[#542104] hover:font-bold"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Trust Badge */}
          <div className="space-y-4 bg-[#fffbf7] p-6 rounded-2xl border border-[#ffab85]/60 shadow-xs">
            <h4 className="text-xs font-display font-bold text-[#331301] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Custom Escrow
            </h4>
            <p className="text-[11px] text-[#542104]/90 leading-relaxed font-semibold">
              We leverage safe, administrator-monitored holding escrow to lock tuition fees securely. Tutors are only paid after successful deliverables are finalized and authorized by students.
            </p>
            <div className="flex gap-2 pt-1 font-mono text-[9px] font-bold">
              <span className="bg-[#ffece1] text-orange-700 px-2.5 py-1 rounded-md border border-[#fed7aa]/50">Manual Checks</span>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">SSL Encrypted</span>
            </div>
          </div>

        </div>

        {/* Gray Unethical Search Term Links Section */}
        <div className="mt-16 pt-8 border-t border-[#ffab85]/55" id="google-ads-keywords">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-orange-600/70" />
            <h5 className="text-[10px] font-display font-bold text-[#331301]/70 uppercase tracking-widest">Students Also Ask For (SEO Search Index)</h5>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {seoKeywords.map((kw, idx) => (
              <a
                key={idx}
                id={`seo-keyword-${idx}`}
                href={kw.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('services');
                }}
                rel="nofollow"
                className="text-[#542104]/80 hover:text-orange-700 hover:bg-[#ffece1] hover:border-[#ffab85] transition-all duration-200 cursor-pointer block border border-[#ffab85]/35 px-3 py-1 rounded-lg bg-[#fffbf7]"
              >
                {kw.text}
              </a>
            ))}
          </div>


          {/* Application Overview & Google API Disclosure */}
          <div className="mt-8 p-6 bg-[#fffbf7] border border-[#ffab85]/55 rounded-3xl space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#ffab85]/35 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block font-sans">
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
          <div className="mt-6 p-4 bg-[#fff2e6]/80 border border-[#ffab85]/55 rounded-2xl space-y-2.5">
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
        </div>

        {/* Bottom copyright details & Legal Links */}
        <div className="mt-10 pt-6 border-t border-[#ffab85]/40 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#542104]/80 gap-4 text-center md:text-left">
          <p className="font-medium max-w-xl">
            © 2026 universitytutors.com. All Rights Reserved. Created under educational technology guidelines for UK, US, CA, AU, NZ &amp; IE local curriculum support.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-x-2 md:gap-x-3 text-xs font-bold w-full md:w-auto">
            <button 
              id="footer-cc-priv" 
              onClick={() => { onNavigate('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Privacy Policy
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-terms" 
              onClick={() => { onNavigate('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Terms of Service
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-disclosure" 
              onClick={() => { onNavigate('google-disclosure'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Google Disclosure
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-contact" 
              onClick={() => { onNavigate('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Contact Us
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-sop" 
              onClick={() => { onNavigate('sop'); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              System SOP
            </button>
            <span className="text-[#ffab85] select-none text-[10px] hidden sm:inline" aria-hidden="true">•</span>
            <button 
              id="footer-cc-admin" 
              onClick={() => { onNavigate('admin-login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:underline hover:text-orange-800 hover:bg-[#ffd9be]/50 text-[#542104] transition-all cursor-pointer py-1.5 px-2.5 rounded-md active:scale-95 text-xs font-semibold"
            >
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
