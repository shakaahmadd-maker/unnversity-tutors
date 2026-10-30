import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ut_cookie_consent_approved');
    if (consent) return;

    // Show only after user begins interacting or after 9 seconds so it never impacts FCP/LCP
    let timer: NodeJS.Timeout | null = null;
    const trigger = () => {
      setIsVisible(true);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('click', trigger);
      if (timer) clearTimeout(timer);
    };

    window.addEventListener('scroll', trigger, { passive: true, once: true });
    window.addEventListener('click', trigger, { passive: true, once: true });
    timer = setTimeout(trigger, 9000);

    return () => {
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('click', trigger);
      if (timer) clearTimeout(timer);
    };
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
      className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md bg-white/95 backdrop-blur-md border-t sm:border border-gray-200 shadow-2xl sm:rounded-2xl p-3 sm:p-4 z-40 flex flex-col gap-2 transition-opacity duration-300 animate-fade-in-up"
      id="cookie-consent-container"
      aria-label="Cookie consent banner"
    >
      <div className="flex items-start gap-2.5 relative">
        <div className="p-1.5 bg-orange-100 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex-1 pr-6 sm:pr-0">
          <h4 className="font-semibold text-xs text-gray-900 tracking-tight">
            Privacy &amp; Cookie Consent
          </h4>
          <p className="text-[10.5px] sm:text-xs text-gray-600 leading-snug mt-0.5 line-clamp-2 sm:line-clamp-none">
            We use essential cookies to keep chat sessions active and track tutor assignments securely.
          </p>
        </div>
        <button 
          id="close-cookie-banner"
          onClick={closeBanner} 
          className="text-gray-400 hover:text-gray-600 absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          aria-label="Dismiss cookie banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-0.5 sm:ml-8">
        <button
          id="cookie-accept-all"
          onClick={approve}
          className="flex-1 sm:flex-initial bg-orange-500 font-semibold hover:bg-orange-600 text-[10.5px] sm:text-xs text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
        >
          Accept All
        </button>
        <button
          id="cookie-necessary"
          onClick={approve}
          className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-[10.5px] sm:text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-center"
        >
          Necessary Only
        </button>
      </div>
    </aside>
  );
}
