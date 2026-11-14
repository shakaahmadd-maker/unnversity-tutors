import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FooterLocationsSubjectsProps {
  onNavigateLocation: (locationName: string) => void;
  onNavigateSubject: (subjectName: string) => void;
  onNavigateCountry?: (countrySlug: string) => void;
  onNavigateService?: (serviceSlug: string) => void;
}

export default function FooterLocationsSubjects({
  onNavigateLocation,
  onNavigateSubject,
  onNavigateCountry,
  onNavigateService
}: FooterLocationsSubjectsProps) {
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);

  const countriesList = [
    { name: 'USA Online Tutoring', slug: 'usa', flag: '🇺🇸' },
    { name: 'Canada Online Tutoring', slug: 'canada', flag: '🇨🇦' },
    { name: 'UK Online Tutoring', slug: 'uk', flag: '🇬🇧' },
    { name: 'UAE Online Tutoring', slug: 'uae', flag: '🇦🇪' },
    { name: 'Ireland Online Tutoring', slug: 'ireland', flag: '🇮🇪' },
    { name: 'Australia Online Tutoring', slug: 'australia', flag: '🇦🇺' },
    { name: 'New Zealand Online Tutoring', slug: 'new-zealand', flag: '🇳🇿' },
    { name: 'Singapore Online Tutoring', slug: 'singapore', flag: '🇸🇬' },
  ];

  const specializedCategories = [
    {
      title: 'Assignment Guidance',
      slugBase: 'assignment-guidance',
      desc: '1-on-1 rubric analysis & planning',
      countries: [
        { name: 'USA', slug: 'usa', flag: '🇺🇸' },
        { name: 'Canada', slug: 'canada', flag: '🇨🇦' },
        { name: 'UK', slug: 'uk', flag: '🇬🇧' },
        { name: 'UAE', slug: 'uae', flag: '🇦🇪' },
        { name: 'Ireland', slug: 'ireland', flag: '🇮🇪' },
        { name: 'Australia', slug: 'australia', flag: '🇦🇺' },
        { name: 'New Zealand', slug: 'new-zealand', flag: '🇳🇿' },
        { name: 'Singapore', slug: 'singapore', flag: '🇸🇬' },
      ]
    },
    {
      title: 'Coursework Tutoring',
      slugBase: 'coursework-tutoring',
      desc: 'Continuous assessment & modular support',
      countries: [
        { name: 'USA', slug: 'usa', flag: '🇺🇸' },
        { name: 'Canada', slug: 'canada', flag: '🇨🇦' },
        { name: 'UK', slug: 'uk', flag: '🇬🇧' },
        { name: 'UAE', slug: 'uae', flag: '🇦🇪' },
        { name: 'Ireland', slug: 'ireland', flag: '🇮🇪' },
        { name: 'Australia', slug: 'australia', flag: '🇦🇺' },
        { name: 'New Zealand', slug: 'new-zealand', flag: '🇳🇿' },
        { name: 'Singapore', slug: 'singapore', flag: '🇸🇬' },
      ]
    },
    {
      title: 'Writing Tutoring',
      slugBase: 'writing-tutoring',
      desc: 'Academic essay & thesis writing skills',
      countries: [
        { name: 'USA', slug: 'usa', flag: '🇺🇸' },
        { name: 'Canada', slug: 'canada', flag: '🇨🇦' },
        { name: 'UK', slug: 'uk', flag: '🇬🇧' },
        { name: 'UAE', slug: 'uae', flag: '🇦🇪' },
        { name: 'Ireland', slug: 'ireland', flag: '🇮🇪' },
        { name: 'Australia', slug: 'australia', flag: '🇦🇺' },
        { name: 'New Zealand', slug: 'new-zealand', flag: '🇳🇿' },
        { name: 'Singapore', slug: 'singapore', flag: '🇸🇬' },
      ]
    }
  ];

  const usaCities = [
    { name: 'Atlanta Tutoring', city: 'Atlanta, GA, USA' },
    { name: 'Austin Tutoring', city: 'Austin, TX, USA' },
    { name: 'Baltimore Tutoring', city: 'Baltimore, MD, USA' },
    { name: 'Boston Tutoring', city: 'Boston, MA, USA' },
    { name: 'Charlotte Tutoring', city: 'Charlotte, NC, USA' },
    { name: 'Chicago Tutoring', city: 'Chicago, IL, USA' },
    { name: 'Cleveland Tutoring', city: 'Cleveland, OH, USA' },
    { name: 'Columbus Tutoring', city: 'Columbus, OH, USA' },
    { name: 'Dallas Tutoring', city: 'Dallas, TX, USA' },
    { name: 'Denver Tutoring', city: 'Denver, CO, USA' },
    { name: 'Detroit Tutoring', city: 'Detroit, MI, USA' },
    { name: 'Honolulu Tutoring', city: 'Honolulu, HI, USA' },
    { name: 'Houston Tutoring', city: 'Houston, TX, USA' },
    { name: 'Indianapolis Tutoring', city: 'Indianapolis, IN, USA' },
    { name: 'Kansas City Tutoring', city: 'Kansas City, MO, USA' },
    { name: 'Las Vegas Tutoring', city: 'Las Vegas, NV, USA' },
    { name: 'Los Angeles Tutoring', city: 'Los Angeles, CA, USA' },
    { name: 'Memphis Tutoring', city: 'Memphis, TN, USA' },
    { name: 'Miami Tutoring', city: 'Miami, FL, USA' },
    { name: 'Minneapolis Tutoring', city: 'Minneapolis, MN, USA' },
    { name: 'Nashville Tutoring', city: 'Nashville, TN, USA' },
    { name: 'New Orleans Tutoring', city: 'New Orleans, LA, USA' },
    { name: 'New York Tutoring', city: 'New York, NY, USA' },
    { name: 'Orlando Tutoring', city: 'Orlando, FL, USA' },
    { name: 'Philadelphia Tutoring', city: 'Philadelphia, PA, USA' },
    { name: 'Phoenix Tutoring', city: 'Phoenix, AZ, USA' },
    { name: 'Pittsburgh Tutoring', city: 'Pittsburgh, PA, USA' },
    { name: 'Portland Tutoring', city: 'Portland, OR, USA' },
    { name: 'Sacramento Tutoring', city: 'Sacramento, CA, USA' },
    { name: 'Salt Lake City Tutoring', city: 'Salt Lake City, UT, USA' },
    { name: 'San Antonio Tutoring', city: 'San Antonio, TX, USA' },
    { name: 'San Diego Tutoring', city: 'San Diego, CA, USA' },
    { name: 'San Francisco Tutoring', city: 'San Francisco, CA, USA' },
    { name: 'San Jose Tutoring', city: 'San Jose, CA, USA' },
    { name: 'Seattle Tutoring', city: 'Seattle, WA, USA' },
    { name: 'St. Louis Tutoring', city: 'St. Louis, MO, USA' },
    { name: 'Tampa Tutoring', city: 'Tampa, FL, USA' },
    { name: 'Washington DC Tutoring', city: 'Washington, DC, USA' },
  ];

  const column2Groups = [
    {
      code: 'GB',
      label: 'United Kingdom',
      cities: [
        { name: 'Belfast Tutoring', city: 'Belfast, UK' },
        { name: 'Birmingham Tutoring', city: 'Birmingham, UK' },
        { name: 'Bristol Tutoring', city: 'Bristol, UK' },
        { name: 'Cardiff Tutoring', city: 'Cardiff, UK' },
        { name: 'Edinburgh Tutoring', city: 'Edinburgh, UK' },
        { name: 'Glasgow Tutoring', city: 'Glasgow, UK' },
        { name: 'Leeds Tutoring', city: 'Leeds, UK' },
        { name: 'Liverpool Tutoring', city: 'Liverpool, UK' },
        { name: 'London Tutoring', city: 'London, UK' },
        { name: 'Manchester Tutoring', city: 'Manchester, UK' },
        { name: 'Newcastle Tutoring', city: 'Newcastle, UK' },
        { name: 'Nottingham Tutoring', city: 'Nottingham, UK' },
        { name: 'Oxford Tutoring', city: 'Oxford, UK' },
        { name: 'Sheffield Tutoring', city: 'Sheffield, UK' },
      ],
    },
    {
      code: 'IE',
      label: 'Ireland',
      cities: [
        { name: 'Cork Tutoring', city: 'Cork, Ireland' },
        { name: 'Dublin Tutoring', city: 'Dublin, Ireland' },
        { name: 'Galway Tutoring', city: 'Galway, Ireland' },
        { name: 'Limerick Tutoring', city: 'Limerick, Ireland' },
        { name: 'Waterford Tutoring', city: 'Waterford, Ireland' },
      ],
    },
    {
      code: 'SG',
      label: 'Singapore',
      cities: [
        { name: 'Central Singapore', city: 'Central Singapore, Singapore' },
        { name: 'Jurong Tutoring', city: 'Jurong, Singapore' },
        { name: 'Tampines Tutoring', city: 'Tampines, Singapore' },
        { name: 'Woodlands Tutoring', city: 'Woodlands, Singapore' },
      ],
    },
    {
      code: 'MY',
      label: 'Malaysia',
      cities: [
        { name: 'Kuala Lumpur', city: 'Kuala Lumpur, Malaysia' },
        { name: 'Penang Tutoring', city: 'Penang, Malaysia' },
        { name: 'Johor Bahru', city: 'Johor Bahru, Malaysia' },
        { name: 'Petaling Jaya', city: 'Petaling Jaya, Malaysia' },
      ],
    },
    {
      code: 'AE',
      label: 'UAE &',
      secondaryCode: 'SA',
      secondaryLabel: 'KSA',
      cities: [
        { name: 'Dubai Tutoring', city: 'Dubai, UAE' },
        { name: 'Abu Dhabi Tutoring', city: 'Abu Dhabi, UAE' },
        { name: 'Sharjah Tutoring', city: 'Sharjah, UAE' },
        { name: 'Riyadh Tutoring', city: 'Riyadh, KSA' },
        { name: 'Jeddah Tutoring', city: 'Jeddah, KSA' },
      ],
    },
  ];

  const column3Groups = [
    {
      code: 'CA',
      label: 'Canada',
      cities: [
        { name: 'Calgary Tutoring', city: 'Calgary, Canada' },
        { name: 'Edmonton Tutoring', city: 'Edmonton, Canada' },
        { name: 'Halifax Tutoring', city: 'Halifax, Canada' },
        { name: 'Hamilton Tutoring', city: 'Hamilton, Canada' },
        { name: 'Kitchener Tutoring', city: 'Kitchener, Canada' },
        { name: 'London (Canada)', city: 'London, ON, Canada' },
        { name: 'Montreal Tutoring', city: 'Montreal, Canada' },
        { name: 'Ottawa Tutoring', city: 'Ottawa, Canada' },
        { name: 'Quebec City', city: 'Quebec City, Canada' },
        { name: 'Toronto Tutoring', city: 'Toronto, Canada' },
        { name: 'Vancouver Tutoring', city: 'Vancouver, Canada' },
        { name: 'Victoria Tutoring', city: 'Victoria, Canada' },
        { name: 'Winnipeg Tutoring', city: 'Winnipeg, Canada' },
      ],
    },
    {
      code: 'AU',
      label: 'Australia',
      cities: [
        { name: 'Adelaide Tutoring', city: 'Adelaide, Australia' },
        { name: 'Brisbane Tutoring', city: 'Brisbane, Australia' },
        { name: 'Canberra Tutoring', city: 'Canberra, Australia' },
        { name: 'Darwin Tutoring', city: 'Darwin, Australia' },
        { name: 'Gold Coast Tutoring', city: 'Gold Coast, Australia' },
        { name: 'Hobart Tutoring', city: 'Hobart, Australia' },
        { name: 'Melbourne Tutoring', city: 'Melbourne, Australia' },
        { name: 'Newcastle (AU)', city: 'Newcastle, Australia' },
        { name: 'Perth Tutoring', city: 'Perth, Australia' },
        { name: 'Sydney Tutoring', city: 'Sydney, Australia' },
        { name: 'Wollongong', city: 'Wollongong, Australia' },
      ],
    },
    {
      code: 'NZ',
      label: 'New Zealand',
      cities: [
        { name: 'Auckland Tutoring', city: 'Auckland, New Zealand' },
        { name: 'Christchurch', city: 'Christchurch, New Zealand' },
        { name: 'Dunedin Tutoring', city: 'Dunedin, New Zealand' },
        { name: 'Hamilton (NZ)', city: 'Hamilton, New Zealand' },
        { name: 'Napier Tutoring', city: 'Napier, New Zealand' },
        { name: 'Palmerston North', city: 'Palmerston North, New Zealand' },
        { name: 'Tauranga Tutoring', city: 'Tauranga, New Zealand' },
        { name: 'Wellington', city: 'Wellington, New Zealand' },
      ],
    },
  ];

  const subjectsCol1 = [
    'Online ACT Tutoring',
    'Online Algebra Tutoring',
    'Online Biology Tutoring',
    'Online Calculus Tutoring',
    'Online Chemistry Tutoring',
    'Online English Tutoring',
    'Online French Tutoring',
    'Online Geometry Tutoring',
  ];

  const subjectsCol2 = [
    'Online GRE Tutoring',
    'Online ISEE Tutoring',
    'Online LSAT Tutoring',
    'Online Mandarin Chinese Tutoring',
    'Online Math Tutoring',
    'Online MCAT Tutoring',
    'Online Physics Tutoring',
  ];

  const subjectsCol3 = [
    'Online Precalculus Tutoring',
    'Online Reading Tutoring',
    'Online SAT Tutoring',
    'Online Spanish Tutoring',
    'Online SSAT Tutoring',
    'Online Statistics Tutoring',
    'Online Writing Tutoring',
  ];

  return (
    <div className="bg-[#f8fafc] border-t border-b border-[#cbd5e1] py-10 sm:py-12 text-[#2b4260] font-sans">
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 md:px-8 space-y-8 sm:space-y-10">
        
        {/* Country Dedicated Online Tutoring Hubs */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#204070] font-sans tracking-tight flex items-center gap-2">
            <span>🌍</span>
            <span>Dedicated Country Online Tutoring Portals</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {countriesList.map((c) => (
              <button
                key={c.slug}
                id={`footer-country-portal-${c.slug}`}
                onClick={() => onNavigateCountry && onNavigateCountry(c.slug)}
                className="bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 p-2.5 min-h-[44px] rounded-xl text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="text-lg mb-1 group-hover:scale-115 transition-transform">{c.flag}</div>
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-orange-650 line-clamp-1 leading-tight">{c.name.replace(' Online Tutoring', '')}</div>
                <div className="text-[9px] text-slate-600 font-medium">Online Tutoring</div>
              </button>
            ))}
          </div>
        </div>

        {/* Specialized Academic Services (Assignment Guidance, Coursework, Writing) */}
        <div className="space-y-4 pt-2 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-base font-bold text-[#204070] font-sans tracking-tight flex items-center gap-2">
              <span>🎯</span>
              <span>Topical Academic Tutoring Services (Country Expansions)</span>
            </h3>
            <span className="text-[11px] text-slate-600 font-medium">
              1-on-1 Mentorship &bull; Ethical Guidance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specializedCategories.map((cat) => (
              <div 
                key={cat.slugBase}
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <button
                    onClick={() => onNavigateService && onNavigateService(cat.slugBase)}
                    className="text-sm font-bold text-[#204070] hover:text-orange-650 hover:underline text-left min-h-[32px] inline-flex items-center cursor-pointer"
                  >
                    {cat.title}
                  </button>
                  <span className="text-[10px] text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                    Global / All
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {cat.desc}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                  {cat.countries.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => onNavigateService && onNavigateService(`${cat.slugBase}-${c.slug}`)}
                      className="text-left text-slate-700 hover:text-orange-650 hover:underline py-1.5 px-1.5 min-h-[28px] w-full rounded hover:bg-orange-50/50 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular International Locations (Collapsible 3-Column Directory Card) */}
        <div className="pt-2 border-t border-slate-200/80 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsLocationsOpen((prev) => !prev)}
              aria-expanded={isLocationsOpen}
              className="w-full flex items-center justify-between gap-3 text-left min-h-[44px] cursor-pointer"
            >
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-sans tracking-tight">
                  Popular International Locations
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Browse 100+ city tutoring directories across the US, UK, Canada, Australia, Ireland, UAE &amp; Singapore
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                <span>{isLocationsOpen ? 'Hide Cities' : 'Show Cities'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLocationsOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isLocationsOpen && (
            <div className="grid grid-cols-3 gap-x-2.5 sm:gap-x-8 lg:gap-x-12 items-start mt-4 sm:mt-5 pt-4 border-t border-slate-100">
              {/* Column 1: US USA Cities */}
              <div>
                <h4 className="border-b border-slate-100 pb-1.5 mb-2 flex flex-wrap items-baseline gap-1 text-slate-900">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight text-slate-700">
                    US
                  </span>
                  <span className="text-[11px] sm:text-[13px] font-bold tracking-tight">
                    USA Cities
                  </span>
                </h4>
                <ul className="space-y-0.5">
                  {usaCities.map((loc) => (
                    <li key={loc.name}>
                      <button
                        type="button"
                        onClick={() => onNavigateLocation(loc.city)}
                        className="text-[10.5px] sm:text-xs md:text-[13px] leading-[1.4] sm:leading-[1.55] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                      >
                        {loc.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: GB United Kingdom, IE Ireland, SG Singapore, MY Malaysia, AE UAE & SA KSA */}
              <div className="space-y-4 sm:space-y-5">
                {column2Groups.map((group) => (
                  <div key={group.code}>
                    <h4 className="border-b border-slate-100 pb-1.5 mb-2 flex flex-wrap items-baseline gap-1 text-slate-900">
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight text-slate-700">
                        {group.code}
                      </span>
                      <span className="text-[11px] sm:text-[13px] font-bold tracking-tight">
                        {group.label}
                      </span>
                      {group.secondaryCode && (
                        <>
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight text-slate-700">
                            {group.secondaryCode}
                          </span>
                          <span className="text-[11px] sm:text-[13px] font-bold tracking-tight">
                            {group.secondaryLabel}
                          </span>
                        </>
                      )}
                    </h4>
                    <ul className="space-y-0.5">
                      {group.cities.map((loc) => (
                        <li key={loc.name}>
                          <button
                            type="button"
                            onClick={() => onNavigateLocation(loc.city)}
                            className="text-[10.5px] sm:text-xs md:text-[13px] leading-[1.4] sm:leading-[1.55] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                          >
                            {loc.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Column 3: CA Canada, AU Australia, NZ New Zealand */}
              <div className="space-y-4 sm:space-y-5">
                {column3Groups.map((group) => (
                  <div key={group.code}>
                    <h4 className="border-b border-slate-100 pb-1.5 mb-2 flex flex-wrap items-baseline gap-1 text-slate-900">
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight text-slate-700">
                        {group.code}
                      </span>
                      <span className="text-[11px] sm:text-[13px] font-bold tracking-tight">
                        {group.label}
                      </span>
                    </h4>
                    <ul className="space-y-0.5">
                      {group.cities.map((loc) => (
                        <li key={loc.name}>
                          <button
                            type="button"
                            onClick={() => onNavigateLocation(loc.city)}
                            className="text-[10.5px] sm:text-xs md:text-[13px] leading-[1.4] sm:leading-[1.55] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                          >
                            {loc.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

          {/* Popular Online Subjects */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsSubjectsOpen((prev) => !prev)}
              aria-expanded={isSubjectsOpen}
              className="w-full flex items-center justify-between gap-3 text-left min-h-[44px] cursor-pointer"
            >
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-sans tracking-tight">
                  Popular Online Subjects
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Explore 22 core university, graduate exam, and STEM subject directories
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                <span>{isSubjectsOpen ? 'Hide Subjects' : 'Show Subjects'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSubjectsOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isSubjectsOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-1 text-xs mt-4 pt-4 border-t border-slate-100">
              <div className="space-y-0.5">
                {subjectsCol1.map((subj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[11px] sm:text-[13px] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5">
                {subjectsCol2.map((subj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[11px] sm:text-[13px] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                {subjectsCol3.map((subj, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[11px] sm:text-[13px] text-[#155799] hover:text-[#0f4c81] hover:underline text-left min-h-[28px] py-1 w-full flex items-center font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
