import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ut_cookie_consent_approved');
    if (!consent) {
      // Small timeout to look organic
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
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
    <div 
      className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-white border border-gray-200/80 shadow-2xl rounded-2xl p-5 z-55 flex flex-col gap-3 transition-opacity duration-300 transform animate-fade-in-up"
      id="cookie-consent-container"
    >
      <div className="flex items-start gap-3.5 relative">
        <div className="p-2 bg-orange-100 rounded-lg shrink-0">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 tracking-tight flex items-center gap-1.5">
            GDPR & Privacy Consent
          </h4>
          <p className="text-xs text-gray-650 leading-relaxed mt-1">
            We use secure cookies and local cache storage to track interactive chat sequences, active lesson dashboards, current tutor assignments, and Stripe Escrow validations under CCPA/GDPR compliance frameworks.
          </p>
        </div>
        <button 
          id="close-cookie-banner"
          onClick={closeBanner} 
          className="text-gray-400 hover:text-gray-600 self-start p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 mt-2 ml-10">
        <button
          id="cookie-accept-all"
          onClick={approve}
          className="bg-orange-500 font-medium hover:bg-orange-600 text-xs text-white px-5 py-2 rounded-xl shadow-lg shadow-orange-500/10 transition-colors cursor-pointer"
        >
          Accept Optional All
        </button>
        <button
          id="cookie-necessary"
          onClick={approve}
          className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          Just Necessary
        </button>
      </div>
    </div>
  );
}
