import React, { useEffect, useRef } from 'react';
import { Globe2 } from 'lucide-react';

export interface RegionalPortalOption {
  slug: string;
  name: string;
  flag: string;
  id?: string;
}

interface RegionalPortalBarProps {
  label: string;
  countries: RegionalPortalOption[];
  activeCountrySlug?: string;
  onSelectCountry: (slug: string) => void;
  showGlobal?: boolean;
  isGlobalActive?: boolean;
  onSelectGlobal?: () => void;
}

export default function RegionalPortalBar({
  label,
  countries,
  activeCountrySlug,
  onSelectCountry,
  showGlobal = false,
  isGlobalActive = false,
  onSelectGlobal,
}: RegionalPortalBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const activeEl = activeBtnRef.current;
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    if (activeRect.left < containerRect.left || activeRect.right > containerRect.right) {
      const targetLeft =
        activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }, [activeCountrySlug, isGlobalActive]);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-1.5 sm:py-2 px-3 relative z-20">
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto flex items-center md:justify-center gap-1.5 md:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar"
      >
        <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-300 shrink-0 mr-0.5">
          <Globe2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span>{label}</span>
        </div>

        {showGlobal && onSelectGlobal && (
          <button
            ref={isGlobalActive ? activeBtnRef : undefined}
            type="button"
            onClick={onSelectGlobal}
            className={`compact-pill-btn px-2.5 py-1 text-[11px] sm:text-xs rounded-full shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer ${
              isGlobalActive
                ? 'bg-orange-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-medium'
            }`}
          >
            <span>🌐</span>
            <span>Global</span>
          </button>
        )}

        {countries.map((c) => {
          const isSelected = c.slug === activeCountrySlug;
          return (
            <button
              key={c.slug}
              ref={isSelected ? activeBtnRef : undefined}
              id={c.id}
              type="button"
              onClick={() => onSelectCountry(c.slug)}
              className={`compact-pill-btn px-2.5 py-1 text-[11px] sm:text-xs rounded-full shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-orange-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-medium'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
