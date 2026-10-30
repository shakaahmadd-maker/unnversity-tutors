import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ut_cookie_consent_approved');
    if (!consent) {
      // Defer cookie banner so it never interferes with critical initial mobile paint or LCP
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const approve = () => {
    localStorage.setItem('ut_cookie_consent_approved', 'true');
    setIsVisible(false);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside 
      className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-5 z-55 flex flex-col gap-2.5 sm:gap-3 transition-opacity duration-300 transform animate-fade-in-up"
      id="cookie-consent-container"
      aria-label="Cookie consent banner"
    >
      <div className="flex items-start gap-3 relative">
        <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </div>
        <div className="flex-1 pr-6 sm:pr-0">
          <h4 className="font-semibold text-xs sm:text-sm text-gray-900 tracking-tight">
            GDPR &amp; Privacy Consent
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed mt-0.5 sm:mt-1 line-clamp-3 sm:line-clamp-none">
            We use secure cookies and local storage to track interactive chat sequences, active lesson dashboards, current tutor assignments, and Stripe Escrow validations.
          </p>
        </div>
        <button 
          id="close-cookie-banner"
          onClick={closeBanner} 
          className="text-gray-400 hover:text-gray-600 absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          aria-label="Dismiss cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-1 sm:mt-2 sm:ml-9">
        <button
          id="cookie-accept-all"
          onClick={approve}
          className="flex-1 sm:flex-initial bg-orange-500 font-medium hover:bg-orange-600 text-[11px] sm:text-xs text-white px-4 py-2 rounded-xl shadow-md shadow-orange-500/10 transition-colors cursor-pointer text-center"
        >
          Accept All
        </button>
        <button
          id="cookie-necessary"
          onClick={approve}
          className="flex-1 sm:flex-initial bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-[11px] sm:text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer text-center"
        >
          Necessary Only
        </button>
      </div>
    </aside>
  );
}
