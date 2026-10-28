import React from 'react';
import { SUBJECT_DOMAINS_TAXONOMY } from '../data/subjectKeywordsData';

interface SEOKeywordLinksBlockProps {
  locationName?: string;
  tutorName?: string;
  onNavigateLocation?: (locationName: string) => void;
  onNavigateSubject?: (subjectName: string) => void;
  className?: string;
}

const CITY_NEARBY_MAP: Record<string, string[]> = {
  Atlanta: [
    'East Point', 'Forest Park', 'Vinings', 'Mableton', 'Morrow', 
    'Smyrna', 'Doraville', 'Sandy Springs', 'Tucker', 'Riverdale', 
    'Stone Mountain', 'Dunwoody', 'Austell', 'Lithia Springs', 'Lithonia', 
    'Norcross', 'Stockbridge', 'Fairburn', 'Marietta', 'Lilburn'
  ],
  Phoenix: [
    'Glendale', 'Paradise Valley', 'Tempe', 'Scottsdale', 'Mesa', 
    'Sun City', 'Avondale', 'Goodyear', 'Chandler', 'Litchfield Park', 
    'Gilbert', 'Surprise', 'Sun Lakes', 'Fountain Hills', 'Maricopa', 
    'Carefree', 'Cave Creek', 'Queen Creek', 'Buckeye', 'Apache Junction'
  ],
  Boston: [
    'Cambridge', 'Brookline', 'Somerville', 'Newton', 'Quincy', 
    'Waltham', 'Medford', 'Malden', 'Arlington', 'Watertown', 
    'Belmont', 'Everett', 'Revere', 'Chelsea', 'Milton', 
    'Lexington', 'Woburn', 'Braintree', 'Needham', 'Dedham'
  ],
  'New York': [
    'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island', 
    'Jersey City', 'Hoboken', 'Yonkers', 'White Plains', 'New Rochelle', 
    'Flushing', 'Astoria', 'Long Island City', 'Bay Ridge', 'Forest Hills'
  ],
  Miami: [
    'Miami Beach', 'Coral Gables', 'Hialeah', 'Doral', 'Fort Lauderdale', 
    'Hollywood', 'Pembroke Pines', 'Aventura', 'Homestead', 'Boca Raton', 
    'Kendall', 'Miramar', 'Davie', 'Pinecrest', 'Sunny Isles Beach'
  ],
  Chicago: [
    'Evanston', 'Oak Park', 'Naperville', 'Schaumburg', 'Skokie', 
    'Cicero', 'Des Plaines', 'Wheaton', 'Bolingbrook', 'Elgin', 
    'Orland Park', 'Arlington Heights', 'Berwyn', 'Downers Grove', 'Glenview'
  ],
  'Los Angeles': [
    'Santa Monica', 'Pasadena', 'Beverly Hills', 'Long Beach', 'Glendale', 
    'Burbank', 'Torrance', 'Anaheim', 'Irvine', 'Malibu', 
    'Culver City', 'West Hollywood', 'Compton', 'Downey', 'El Monte'
  ],
  Dallas: [
    'Fort Worth', 'Arlington', 'Plano', 'Irving', 'Garland', 
    'Frisco', 'McKinney', 'Denton', 'Richardson', 'Carrollton', 
    'Allen', 'Lewisville', 'Grand Prairie', 'Mesquite', 'Coppell'
  ],
  Houston: [
    'Sugar Land', 'The Woodlands', 'Katy', 'Pearland', 'League City', 
    'Pasadena', 'Spring', 'Conroe', 'Cypress', 'Missouri City', 
    'Friendswood', 'Baytown', 'Richmond', 'Rosenberg', 'Humble'
  ],
  'San Francisco': [
    'Oakland', 'Berkeley', 'San Jose', 'Palo Alto', 'San Mateo', 
    'Daly City', 'Fremont', 'Sunnyvale', 'Mountain View', 'Walnut Creek', 
    'Hayward', 'San Leandro', 'Redwood City', 'San Rafael', 'Alameda'
  ],
  Seattle: [
    'Bellevue', 'Redmond', 'Kirkland', 'Renton', 'Tacoma', 
    'Everett', 'Edmonds', 'Federal Way', 'Mercer Island', 'Issaquah', 
    'Sammamish', 'Lynnwood', 'Bothell', 'Burien', 'Kent'
  ],
  Washington: [
    'Alexandria', 'Arlington', 'Bethesda', 'Silver Spring', 'Fairfax', 
    'Rockville', 'Bowie', 'College Park', 'Falls Church', 'McLean', 
    'Vienna', 'Reston', 'Herndon', 'Gaithersburg', 'Hyattsville'
  ]
};

const TOP_SUBJECTS = [
  'ACT', 'Algebra', 'Biology', 'Calculus', 'Chemistry', 'English', 
  'French', 'Geometry', 'GRE', 'ISEE', 'LSAT', 'Mandarin Chinese', 
  'Math', 'MCAT', 'Physics', 'Precalculus', 'Reading', 'SAT', 
  'Spanish', 'SSAT', 'Statistics', 'Writing'
];

export default function SEOKeywordLinksBlock({
  locationName = 'Atlanta',
  tutorName,
  onNavigateLocation,
  onNavigateSubject,
  className = ''
}: SEOKeywordLinksBlockProps) {
  // Extract main city name (e.g., 'Atlanta, GA' -> 'Atlanta')
  const cleanCity = locationName.split(',')[0].trim();
  const matchedCityKey = Object.keys(CITY_NEARBY_MAP).find(
    k => k.toLowerCase() === cleanCity.toLowerCase()
  );

  const nearbyCities = matchedCityKey 
    ? CITY_NEARBY_MAP[matchedCityKey]
    : [
        `${cleanCity} Heights`, `${cleanCity} Park`, `North ${cleanCity}`, 
        `South ${cleanCity}`, `East ${cleanCity}`, `West ${cleanCity}`, 
        `Central ${cleanCity}`, `${cleanCity} Valley`, `${cleanCity} Ridge`, 
        `${cleanCity} Springs`, `${cleanCity} Lakes`, `${cleanCity} Hills`
      ];

  const subjectPrefix = tutorName || cleanCity;

  return (
    <div className={`bg-[#f0f2f5] border-t border-b border-slate-300/80 py-8 px-4 sm:px-8 font-sans text-slate-800 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6 text-left">
        
        {/* Nearby Cities Block */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Nearby Cities &amp; Metro Service Areas
          </h3>
          <p className="text-xs text-blue-700 leading-relaxed text-justify">
            {nearbyCities.map((city, idx) => {
              const isLast = idx === nearbyCities.length - 1;
              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => {
                      if (onNavigateLocation) {
                        onNavigateLocation(`${city}, ${cleanCity}`);
                      }
                    }}
                    className="hover:text-orange-600 hover:underline cursor-pointer transition-colors inline font-medium"
                  >
                    {city} Tutors
                  </button>
                  {!isLast && <span className="text-slate-500 mr-1.5">, </span>}
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* High-Growth Academic & Research Disciplines */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Specialized Academic, Research &amp; Engineering Disciplines
          </h3>
          <p className="text-xs text-blue-700 leading-relaxed text-justify">
            {SUBJECT_DOMAINS_TAXONOMY.map((domain, idx) => {
              const isLast = idx === SUBJECT_DOMAINS_TAXONOMY.length - 1;
              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => {
                      if (onNavigateSubject) {
                        onNavigateSubject(domain.shortName);
                      }
                    }}
                    className="hover:text-orange-600 hover:underline cursor-pointer transition-colors inline font-medium"
                  >
                    {cleanCity} {domain.shortName} Tutors
                  </button>
                  {!isLast && <span className="text-slate-500 mr-1.5">, </span>}
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* Top Subjects Block */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Foundational Courses &amp; Standardized Exams
          </h3>
          <p className="text-xs text-blue-700 leading-relaxed text-justify">
            {TOP_SUBJECTS.map((subject, idx) => {
              const isLast = idx === TOP_SUBJECTS.length - 1;
              const linkText = `${subjectPrefix} ${subject} Tutors`;
              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => {
                      if (onNavigateSubject) {
                        onNavigateSubject(subject);
                      }
                    }}
                    className="hover:text-orange-600 hover:underline cursor-pointer transition-colors inline font-medium"
                  >
                    {linkText}
                  </button>
                  {!isLast && <span className="text-slate-500 mr-1.5">, </span>}
                </React.Fragment>
              );
            })}
          </p>
        </div>

      </div>
    </div>
  );
}
