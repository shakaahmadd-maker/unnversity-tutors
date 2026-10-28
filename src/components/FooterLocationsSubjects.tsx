import React from 'react';

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

  const locationsCol1 = [
    { name: 'Atlanta Tutoring', city: 'Atlanta, GA' },
    { name: 'Boston Tutoring', city: 'Boston, MA' },
    { name: 'Chicago Tutoring', city: 'Chicago, IL' },
    { name: 'Dallas Tutoring', city: 'Dallas, TX' },
    { name: 'Houston Tutoring', city: 'Houston, TX' },
    { name: 'London Tutoring', city: 'London, UK' },
    { name: 'Los Angeles Tutoring', city: 'Los Angeles, CA' },
  ];

  const locationsCol2 = [
    { name: 'Melbourne Tutoring', city: 'Melbourne, AU' },
    { name: 'Miami Tutoring', city: 'Miami, FL' },
    { name: 'Montreal Tutoring', city: 'Montreal, CA' },
    { name: 'New York Tutoring', city: 'New York, NY' },
    { name: 'Philadelphia Tutoring', city: 'Philadelphia, PA' },
    { name: 'Phoenix Tutoring', city: 'Phoenix, AZ' },
    { name: 'San Diego Tutoring', city: 'San Diego, CA' },
  ];

  const locationsCol3 = [
    { name: 'San Francisco Tutoring', city: 'San Francisco, CA' },
    { name: 'Seattle Tutoring', city: 'Seattle, WA' },
    { name: 'Sydney Tutoring', city: 'Sydney, AU' },
    { name: 'Toronto Tutoring', city: 'Toronto, CA' },
    { name: 'Vancouver Tutoring', city: 'Vancouver, CA' },
    { name: 'Washington DC Tutoring', city: 'Washington, DC' },
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
    <div className="bg-[#f8fafc] border-t border-b border-[#cbd5e1] py-12 text-[#2b4260] font-sans">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 space-y-10">
        
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
                className="bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 p-2.5 rounded-xl text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="text-lg mb-1 group-hover:scale-115 transition-transform">{c.flag}</div>
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-orange-600 line-clamp-1 leading-tight">{c.name.replace(' Online Tutoring', '')}</div>
                <div className="text-[9px] text-slate-500 font-medium">Online Tutoring</div>
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
            <span className="text-[11px] text-slate-500 font-medium">
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
                    className="text-sm font-bold text-[#204070] hover:text-orange-600 hover:underline text-left cursor-pointer"
                  >
                    {cat.title}
                  </button>
                  <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                    Global / All
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {cat.desc}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                  {cat.countries.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => onNavigateService && onNavigateService(`${cat.slugBase}-${c.slug}`)}
                      className="text-left text-slate-600 hover:text-orange-600 hover:underline py-1 px-1.5 rounded hover:bg-orange-50/50 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-2 border-t border-slate-200/80">
          
          {/* Left Block: Popular International Locations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#204070] font-sans tracking-tight">
              Popular International Locations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
              {/* Column 1 */}
              <div className="space-y-2">
                {locationsCol1.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateLocation(loc.city)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-2">
                {locationsCol2.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateLocation(loc.city)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-2">
                {locationsCol3.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateLocation(loc.city)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: Popular Online Subjects */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#204070] font-sans tracking-tight">
              Popular Online Subjects
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
              {/* Column 1 */}
              <div className="space-y-2">
                {subjectsCol1.map((subj, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-2">
                {subjectsCol2.map((subj, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-2">
                {subjectsCol3.map((subj, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateSubject(subj)}
                    className="text-[#3b6090] hover:text-[#1a3560] hover:underline text-left block font-normal cursor-pointer transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
