import React from 'react';
import { SUBJECT_DOMAINS_TAXONOMY, SubjectDomainKeywords } from '../data/subjectKeywordsData';

interface SEOKeywordLinksBlockProps {
  locationName?: string;
  tutorName?: string;
  primarySubject?: string;
  tutorSubjects?: string[];
  tutorEducation?: string;
  primaryDomain?: string;
  onNavigateLocation?: (locationName: string) => void;
  onNavigateSubject?: (subjectName: string) => void;
  className?: string;
}

interface KeywordItem {
  label: string;
  searchSubject: string;
}

type SubjectFamily =
  | 'math'
  | 'science-bio'
  | 'science-chem'
  | 'science-physics'
  | 'science-env'
  | 'humanities'
  | 'business'
  | 'cs'
  | 'engineering';

const CITY_NEARBY_MAP: Record<string, string[]> = {
  Atlanta: [
    'East Point', 'Forest Park', 'Vinings', 'Mableton', 'Morrow',
    'Smyrna', 'Doraville', 'Sandy Springs', 'Tucker', 'Riverdale',
    'Stone Mountain', 'Dunwoody', 'Austell', 'Lithia Springs', 'Lithonia',
    'Norcross', 'Stockbridge', 'Fairburn', 'Marietta', 'Lilburn',
  ],
  Phoenix: [
    'Glendale', 'Paradise Valley', 'Tempe', 'Scottsdale', 'Mesa',
    'Sun City', 'Avondale', 'Goodyear', 'Chandler', 'Litchfield Park',
    'Gilbert', 'Surprise', 'Sun Lakes', 'Fountain Hills', 'Maricopa',
    'Carefree', 'Cave Creek', 'Queen Creek', 'Buckeye', 'Apache Junction',
  ],
  Boston: [
    'Cambridge', 'Brookline', 'Somerville', 'Newton', 'Quincy',
    'Waltham', 'Medford', 'Malden', 'Arlington', 'Watertown',
    'Belmont', 'Everett', 'Revere', 'Chelsea', 'Milton',
    'Lexington', 'Woburn', 'Braintree', 'Needham', 'Dedham',
  ],
  'New York': [
    'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island',
    'Jersey City', 'Hoboken', 'Yonkers', 'White Plains', 'New Rochelle',
    'Flushing', 'Astoria', 'Long Island City', 'Bay Ridge', 'Forest Hills',
  ],
  Miami: [
    'Miami Beach', 'Coral Gables', 'Hialeah', 'Doral', 'Fort Lauderdale',
    'Hollywood', 'Pembroke Pines', 'Aventura', 'Homestead', 'Boca Raton',
    'Kendall', 'Miramar', 'Davie', 'Pinecrest', 'Sunny Isles Beach',
  ],
  Chicago: [
    'Evanston', 'Oak Park', 'Naperville', 'Schaumburg', 'Skokie',
    'Cicero', 'Des Plaines', 'Wheaton', 'Bolingbrook', 'Elgin',
    'Orland Park', 'Arlington Heights', 'Berwyn', 'Downers Grove', 'Glenview',
  ],
  'Los Angeles': [
    'Santa Monica', 'Pasadena', 'Beverly Hills', 'Long Beach', 'Glendale',
    'Burbank', 'Torrance', 'Anaheim', 'Irvine', 'Malibu',
    'Culver City', 'West Hollywood', 'Compton', 'Downey', 'El Monte',
  ],
  Dallas: [
    'Fort Worth', 'Arlington', 'Plano', 'Irving', 'Garland',
    'Frisco', 'McKinney', 'Denton', 'Richardson', 'Carrollton',
    'Allen', 'Lewisville', 'Grand Prairie', 'Mesquite', 'Coppell',
  ],
  Houston: [
    'Sugar Land', 'The Woodlands', 'Katy', 'Pearland', 'League City',
    'Pasadena', 'Spring', 'Conroe', 'Cypress', 'Missouri City',
    'Friendswood', 'Baytown', 'Richmond', 'Rosenberg', 'Humble',
  ],
  'San Francisco': [
    'Oakland', 'Berkeley', 'San Jose', 'Palo Alto', 'San Mateo',
    'Daly City', 'Fremont', 'Sunnyvale', 'Mountain View', 'Walnut Creek',
    'Hayward', 'San Leandro', 'Redwood City', 'San Rafael', 'Alameda',
  ],
  Seattle: [
    'Bellevue', 'Redmond', 'Kirkland', 'Renton', 'Tacoma',
    'Everett', 'Edmonds', 'Federal Way', 'Mercer Island', 'Issaquah',
    'Sammamish', 'Lynnwood', 'Bothell', 'Burien', 'Kent',
  ],
  Washington: [
    'Alexandria', 'Arlington', 'Bethesda', 'Silver Spring', 'Fairfax',
    'Rockville', 'Bowie', 'College Park', 'Falls Church', 'McLean',
    'Vienna', 'Reston', 'Herndon', 'Gaithersburg', 'Hyattsville',
  ],
  Philadelphia: [
    'Bryn Mawr', 'Ardmore', 'King of Prussia', 'Cherry Hill', 'Wayne',
    'Bala Cynwyd', 'Media', 'Swarthmore', 'Conshohocken', 'Jenkintown',
    'Haverford', 'Villanova', 'Doylestown', 'West Chester', 'Camden',
  ],
  Austin: [
    'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'West Lake Hills',
    'Lakeway', 'San Marcos', 'Kyle', 'Buda', 'Leander',
    'Bee Cave', 'Sunset Valley', 'Rollingwood', 'Manor', 'Dripping Springs',
  ],
  'San Diego': [
    'La Jolla', 'Chula Vista', 'Coronado', 'Del Mar', 'Carlsbad',
    'Encinitas', 'Escondido', 'Oceanside', 'Poway', 'Solana Beach',
    'El Cajon', 'National City', 'Santee', 'San Marcos', 'Vista',
  ],
  Denver: [
    'Boulder', 'Aurora', 'Lakewood', 'Littleton', 'Englewood',
    'Arvada', 'Westminster', 'Centennial', 'Highlands Ranch', 'Golden',
    'Broomfield', 'Thornton', 'Parker', 'Castle Rock', 'Cherry Creek',
  ],
  Toronto: [
    'Mississauga', 'North York', 'Scarborough', 'Etobicoke', 'Markham',
    'Vaughan', 'Richmond Hill', 'Oakville', 'Brampton', 'Burlington',
    'Pickering', 'Ajax', 'Midtown Toronto', 'Downtown Toronto', 'Yorkville',
  ],
  Vancouver: [
    'Burnaby', 'Richmond', 'North Vancouver', 'West Vancouver', 'Surrey',
    'Coquitlam', 'New Westminster', 'Kitsilano', 'Point Grey', 'Delta',
  ],
  London: [
    'Westminster', 'Kensington', 'Chelsea', 'Camden', 'Islington',
    'Greenwich', 'Richmond', 'Wimbledon', 'Canary Wharf', 'Bloomsbury',
    'Hampstead', 'Southwark', 'Hammersmith', 'Fulham', ' Chiswick',
  ],
  Sydney: [
    'Parramatta', 'North Sydney', 'Chatswood', 'Bondi', 'Randwick',
    'Newtown', 'Surry Hills', 'Manly', 'Macquarie Park', 'Strathfield',
  ],
  Melbourne: [
    'Carlton', 'South Yarra', 'Fitzroy', 'St Kilda', 'Richmond',
    'Clayton', 'Hawthorn', 'Parkville', 'Box Hill', 'Docklands',
  ],
  Dublin: [
    'Ballsbridge', 'Rathmines', 'Ranelagh', 'Dundrum', 'Blackrock',
    'Dún Laoghaire', 'Clontarf', 'Drumcondra', 'Castleknock', 'Malahide',
  ],
  Dubai: [
    'Dubai Marina', 'Downtown Dubai', 'Jumeirah', 'Business Bay', 'DIFC',
    'Knowledge Park', 'Academic City', 'Al Barsha', 'Palm Jumeirah', 'JLT',
  ],
  Singapore: [
    'Orchard', 'Bukit Timah', 'Clementi', 'Kent Ridge', 'Jurong West',
    'Novena', 'Bishan', 'Tampines', 'Marina Bay', 'Queenstown',
  ],
  Auckland: [
    'Epsom', 'Parnell', 'Remuera', 'Ponsonby', 'Mount Eden',
    'Takapuna', 'Newmarket', 'Grafton', 'Devonport', 'Albany',
  ],
};

const GENERAL_REGIONAL_SUBJECTS = [
  'Mathematics', 'Algebra', 'Calculus', 'Statistics', 'Biology',
  'Chemistry', 'Organic Chemistry', 'Physics', 'Computer Science', 'English',
  'Academic Writing', 'Economics', 'Accounting', 'SAT Prep', 'ACT Prep',
  'GRE Prep', 'GMAT Prep', 'MCAT Prep', 'LSAT Prep', 'University Coursework',
];

const GENERIC_LOCATIONS = new Set([
  'online', 'remote', 'virtual', 'worldwide', 'global', 'anywhere', 'n/a', 'international',
]);

function extractUniversityFromEducation(education?: string): string | null {
  if (!education) return null;
  const firstSegment = education.split(/\s*(?:[-–—|•]|,\s*(?:B\.|M\.|Ph\.?D|D\.Sc|J\.D|M\.D|MBA|BSc|MSc))\s*/i)[0]?.trim();
  if (firstSegment && firstSegment.length >= 3 && firstSegment.length <= 48) {
    return firstSegment;
  }
  return null;
}

function resolveCityOrUni(locationName?: string, tutorEducation?: string): string {
  const rawCity = (locationName || '').split(',')[0].trim();
  if (rawCity && !GENERIC_LOCATIONS.has(rawCity.toLowerCase())) {
    return rawCity;
  }
  const uni = extractUniversityFromEducation(tutorEducation);
  if (uni) return uni;
  return rawCity || 'Atlanta';
}

function resolvePrimarySubjectDisplay(
  primarySubject?: string,
  tutorSubjects?: string[],
  primaryDomain?: string
): string {
  const candidates = [
    primarySubject,
    tutorSubjects && tutorSubjects.length > 0 ? tutorSubjects[0] : undefined,
    primaryDomain,
  ];
  for (const c of candidates) {
    if (c && c.trim()) {
      return c
        .trim()
        .replace(/\s+tutors?$/i, '')
        .replace(/^\[+|\]+$/g, '')
        .trim();
    }
  }
  return 'Academic Studies';
}

function classifyTutorSubjectFamily(
  primarySubject?: string,
  tutorSubjects?: string[],
  tutorEducation?: string,
  primaryDomain?: string
): SubjectFamily {
  const primaryText = `${primarySubject || ''} ${(tutorSubjects || []).slice(0, 3).join(' ')}`.toLowerCase();
  const fullText = `${primaryText} ${(tutorSubjects || []).join(' ')} ${primaryDomain || ''} ${tutorEducation || ''}`.toLowerCase();

  const scoreMatch = (patterns: RegExp[]): number => {
    let score = 0;
    for (const rx of patterns) {
      if (rx.test(primaryText)) score += 6;
      else if (rx.test(fullText)) score += 2;
    }
    return score;
  };

  const scores: Record<SubjectFamily, number> = {
    math: scoreMatch([
      /\bmath(ematics|s)?\b/, /\balgebra\b/, /\bcalculus\b/, /\bprecalculus\b/,
      /\bgeometry\b/, /\btrigonometry\b/, /\bstatistics?\b/, /\bprobability\b/,
      /\blinear algebra\b/, /\bdifferential equations?\b/, /\bquantitative\b/, /\bactuarial\b/,
    ]),
    'science-bio': scoreMatch([
      /\bbiology\b/, /\bbiomedical\b/, /\bbiotech(nology)?\b/, /\bgenetics?\b/,
      /\bmicrobiology\b/, /\banatomy\b/, /\bphysiology\b/, /\bneuroscience\b/,
      /\bcell\b/, /\bmolecular\b/, /\bmcat\b/, /\bpre-?med\b/, /\bhealthcare\b/, /\bnursing\b/, /\bpharmacology\b/,
    ]),
    'science-chem': scoreMatch([
      /\bchemistry\b/, /\borganic chemistry\b/, /\binorganic\b/, /\bbiochemistry\b/,
      /\banalytical chemistry\b/, /\bphysical chemistry\b/, /\bstoichiometry\b/, /\bpharmaceutical\b/,
    ]),
    'science-physics': scoreMatch([
      /\bphysics\b/, /\bastrophysics\b/, /\bquantum\b/, /\belectromagnetism\b/,
      /\boptics\b/, /\bclassical mechanics\b/, /\bap physics\b/,
    ]),
    'science-env': scoreMatch([
      /\benvironmental\b/, /\becology\b/, /\bclimate\b/, /\bearth science\b/,
      /\bsustainability\b/, /\bwater treatment\b/, /\bagricultur\b/, /\bfood science\b/,
    ]),
    humanities: scoreMatch([
      /\benglish\b/, /\bwriting\b/, /\bessay\b/, /\breading\b/, /\bliterature\b/,
      /\brhetoric\b/, /\bgrammar\b/, /\bhumanities\b/, /\bhistory\b/, /\bphilosophy\b/,
      /\blaw\b/, /\blegal\b/, /\blsat\b/, /\bpublic policy\b/, /\bpolitical science\b/,
      /\bsociology\b/, /\bpsychology\b/, /\bspanish\b/, /\bfrench\b/, /\bmandarin\b/, /\blanguage\b/,
    ]),
    business: scoreMatch([
      /\bbusiness\b/, /\beconomics?\b/, /\bmicroeconomics\b/, /\bmacroeconomics\b/,
      /\beconometrics\b/, /\baccounting\b/, /\bfinance\b/, /\bfinancial\b/, /\bfintech\b/,
      /\bmarketing\b/, /\bmanagement\b/, /\bgmat\b/, /\bsupply chain\b/, /\bmba\b/, /\bcfa\b/, /\bcpa\b/,
    ]),
    cs: scoreMatch([
      /\bcomputer science\b/, /\bsoftware\b/, /\bprogramming\b/, /\bpython\b/, /\bjava\b/,
      /\bc\+\+\b/, /\bjavascript\b/, /\btypescript\b/, /\bweb development\b/, /\bfull[- ]stack\b/,
      /\bdata science\b/, /\bmachine learning\b/, /\bartificial intelligence\b/, /\bcybersecurity\b/,
      /\balgorithms?\b/, /\bdata structures\b/, /\bcloud\b/, /\bdevops\b/, /\bsql\b/, /\bux\/ui\b/,
    ]),
    engineering: scoreMatch([
      /\bmechanical engineering\b/, /\belectrical engineering\b/, /\bcivil engineering\b/,
      /\bchemical engineering\b/, /\baerospace\b/, /\bautomotive\b/, /\brobotics\b/,
      /\bsemiconductor\b/, /\bvlsi\b/, /\bembedded\b/, /\bthermodynamics\b/, /\bfluid mechanics\b/,
      /\bstatics\b/, /\bcontrol systems\b/, /\bcad\b/, /\bmaterials science\b/,
    ]),
  };

  let bestFamily: SubjectFamily = 'math';
  let bestScore = -1;
  (Object.keys(scores) as SubjectFamily[]).forEach((fam) => {
    if (scores[fam] > bestScore) {
      bestScore = scores[fam];
      bestFamily = fam;
    }
  });

  return bestScore > 0 ? bestFamily : 'math';
}

function buildDomainFoundationalKeywords(
  family: SubjectFamily,
  prefix: string,
  tutorSubjects?: string[]
): KeywordItem[] {
  const mk = (courseOrLabel: string, searchSubject: string, appendTutors = true): KeywordItem => ({
    label: appendTutors ? `${prefix} ${courseOrLabel} Tutors` : `${prefix} ${courseOrLabel}`,
    searchSubject,
  });

  const joinedSubjects = (tutorSubjects || []).join(' ').toLowerCase();

  switch (family) {
    case 'math':
      return [
        mk('Mathematics', 'Mathematics'),
        mk('Algebra', 'Algebra'),
        mk('Geometry', 'Geometry'),
        mk('Precalculus', 'Precalculus'),
        mk('Calculus', 'Calculus'),
        mk('Statistics', 'Statistics'),
        mk('Business Mathematics', 'Business Mathematics'),
        mk('Linear Algebra', 'Linear Algebra'),
        mk('Differential Equations', 'Differential Equations'),
        mk('SAT Math', 'SAT Math'),
        mk('ACT Math', 'ACT Math'),
        mk('GRE Quantitative', 'GRE Quantitative'),
        mk('GMAT Quant', 'GMAT Quant'),
        mk('Mathematics Coursework & Assignment Support', 'Mathematics Coursework', false),
        mk('All-Level Math Exam Preparation', 'Mathematics Exam Prep', false),
      ];

    case 'science-bio': {
      const items: KeywordItem[] = [
        mk('Biology', 'Biology'),
        mk('Cell & Molecular Biology', 'Cell Biology'),
        mk('Genetics & Genomics', 'Genetics'),
        mk('Biochemistry', 'Biochemistry'),
        mk('Anatomy & Physiology', 'Anatomy & Physiology'),
        mk('Microbiology & Immunology', 'Microbiology'),
        mk('Neurobiology & Life Sciences', 'Neuroscience'),
      ];
      if (joinedSubjects.includes('chem')) {
        items.push(mk('General & Organic Chemistry', 'Organic Chemistry'));
      }
      items.push(
        mk('MCAT', 'MCAT'),
        mk('AP Science', 'AP Biology'),
        mk('Science Coursework & Lab Assignment Support', 'Biology Coursework', false),
        mk('All-Level Science Exam Preparation', 'Biology Exam Prep', false)
      );
      return items;
    }

    case 'science-chem': {
      const items: KeywordItem[] = [
        mk('Chemistry', 'Chemistry'),
        mk('General Chemistry', 'General Chemistry'),
        mk('Organic Chemistry', 'Organic Chemistry'),
        mk('Inorganic Chemistry', 'Inorganic Chemistry'),
        mk('Physical Chemistry', 'Physical Chemistry'),
        mk('Analytical Chemistry', 'Analytical Chemistry'),
        mk('Biochemistry', 'Biochemistry'),
        mk('Stoichiometry & Spectroscopy', 'Analytical Chemistry'),
      ];
      if (joinedSubjects.includes('bio')) {
        items.push(mk('Molecular Biology', 'Biology'));
      }
      items.push(
        mk('MCAT', 'MCAT'),
        mk('AP Science', 'AP Chemistry'),
        mk('Science Coursework & Lab Assignment Support', 'Chemistry Coursework', false),
        mk('All-Level Science Exam Preparation', 'Chemistry Exam Prep', false)
      );
      return items;
    }

    case 'science-physics':
      return [
        mk('Physics', 'Physics'),
        mk('Classical Mechanics', 'Physics Mechanics'),
        mk('Electromagnetism & Circuits', 'Electromagnetism'),
        mk('Thermodynamics & Statistical Physics', 'Thermodynamics'),
        mk('Quantum Physics', 'Quantum Physics'),
        mk('Optics, Waves & Modern Physics', 'Physics'),
        mk('AP Physics 1, 2 & C', 'AP Physics C'),
        mk('MCAT', 'MCAT'),
        mk('AP Science', 'AP Physics'),
        mk('Science Coursework & Lab Assignment Support', 'Physics Coursework', false),
        mk('All-Level Science Exam Preparation', 'Physics Exam Prep', false),
      ];

    case 'science-env':
      return [
        mk('Environmental Science', 'Environmental Science'),
        mk('Ecology & Conservation Biology', 'Ecology'),
        mk('Environmental Chemistry & Water Quality', 'Environmental Engineering'),
        mk('Climate & Sustainability Systems', 'Climate Science'),
        mk('Earth & Atmospheric Sciences', 'Earth Sciences'),
        mk('Toxicology & Environmental Modeling', 'Environmental Toxicology'),
        mk('MCAT', 'MCAT'),
        mk('AP Science', 'AP Environmental Science'),
        mk('Science Coursework & Lab Assignment Support', 'Environmental Science', false),
        mk('All-Level Science Exam Preparation', 'Environmental Science', false),
      ];

    case 'humanities': {
      const items: KeywordItem[] = [
        mk('English', 'English'),
        mk('Academic Writing', 'Academic Writing'),
        mk('Reading', 'Reading'),
        mk('Literature & Critical Analysis', 'Literature'),
      ];
      if (/\blaw\b|\blegal\b|\bpolicy\b|\bconstitutional\b/.test(joinedSubjects)) {
        items.push(
          mk('Constitutional & Legal Studies', 'Constitutional Law'),
          mk('Public Policy & Legal Writing', 'Public Policy')
        );
      } else if (/\bpsychology\b|\bcognitive\b|\bbehavioral\b/.test(joinedSubjects)) {
        items.push(
          mk('Psychology & Behavioral Science', 'Psychology'),
          mk('APA Research Writing & Methods', 'Academic Writing')
        );
      } else if (/\bhistory\b|\bpolitical\b|\bsociology\b|\bphilosophy\b/.test(joinedSubjects)) {
        items.push(
          mk('History & Social Sciences', 'History'),
          mk('Political Science & Philosophy', 'Political Science')
        );
      }
      if (/\bspanish\b/.test(joinedSubjects)) items.push(mk('Spanish Language', 'Spanish'));
      if (/\bfrench\b/.test(joinedSubjects)) items.push(mk('French Language', 'French'));
      if (/\bmandarin\b|\bchinese\b/.test(joinedSubjects)) items.push(mk('Mandarin Chinese', 'Mandarin Chinese'));

      items.push(
        mk('SAT Reading & Writing', 'SAT Reading & Writing'),
        mk('ACT English', 'ACT English'),
        mk('GRE Verbal', 'GRE Verbal'),
        mk('LSAT', 'LSAT'),
        mk('ISEE & SSAT', 'ISEE'),
        mk('Essay & Coursework Support', 'Academic Writing', false),
        mk('All-Level Humanities & Writing Exam Preparation', 'English Exam Prep', false)
      );
      return items;
    }

    case 'business':
      return [
        mk('Business & Management', 'Business Administration'),
        mk('Microeconomics', 'Microeconomics'),
        mk('Macroeconomics', 'Macroeconomics'),
        mk('Econometrics & Quantitative Methods', 'Econometrics'),
        mk('Financial Accounting', 'Financial Accounting'),
        mk('Managerial Accounting', 'Accounting'),
        mk('Corporate Finance & Valuation', 'Corporate Finance'),
        mk('Business Mathematics', 'Business Mathematics'),
        mk('Business Analytics & Operations', 'Business Analytics'),
        mk('GMAT Quant & Verbal', 'GMAT'),
        mk('GRE Quantitative', 'GRE Quantitative'),
        mk('CFA, CPA & AP Economics Prep', 'Finance'),
        mk('Business Coursework & Case Study Support', 'Business Administration', false),
        mk('All-Level Business & Economics Exam Preparation', 'Economics', false),
      ];

    case 'cs':
      return [
        mk('Computer Science', 'Computer Science'),
        mk('Python, Java & C++ Programming', 'Python Programming'),
        mk('Data Structures & Algorithms', 'Data Structures & Algorithms'),
        mk('Software Engineering & System Design', 'Software Engineering'),
        mk('Database Systems & SQL', 'SQL & Databases'),
        mk('Artificial Intelligence & Machine Learning', 'Machine Learning'),
        mk('Data Science & Statistical Computing', 'Data Science'),
        mk('Cybersecurity & Computer Networks', 'Cybersecurity'),
        mk('Web & Full-Stack Development', 'Web Development'),
        mk('Discrete Mathematics', 'Discrete Mathematics'),
        mk('AP Computer Science A & Principles', 'Computer Science'),
        mk('GRE Quantitative & Coding Interview Prep', 'Algorithms & Data Structures'),
        mk('Coding Projects & CS Coursework Support', 'Computer Science', false),
        mk('All-Level Computer Science Exam Preparation', 'Computer Science', false),
      ];

    case 'engineering':
      return [
        mk('Engineering', 'Engineering'),
        mk('Statics, Dynamics & Mechanics', 'Mechanical Engineering'),
        mk('Thermodynamics & Heat Transfer', 'Thermodynamics'),
        mk('Fluid Mechanics & Transport Phenomena', 'Fluid Mechanics'),
        mk('Electrical Circuits, Signals & Systems', 'Electrical Engineering'),
        mk('Control Systems & Robotics', 'Control Systems'),
        mk('Materials Science & Structural Analysis', 'Materials Science'),
        mk('MATLAB, Simulink & CAD Modeling', 'CAD/CAM'),
        mk('Engineering Calculus & Differential Equations', 'Differential Equations'),
        mk('FE (Fundamentals of Engineering) Exam', 'Engineering'),
        mk('GRE Quantitative & AP Physics C', 'AP Physics C'),
        mk('Engineering Design, Lab & Coursework Support', 'Engineering', false),
        mk('All-Level Engineering Exam Preparation', 'Engineering', false),
      ];
  }
}

const FAMILY_TAXONOMY_IDS: Record<SubjectFamily, string[]> = {
  math: [
    'mathematics-statistics', 'data-science-big-data', 'ai-ml', 'finance-fintech',
    'economics', 'computer-science-emerging-tech', 'physics', 'business-management',
  ],
  'science-bio': [
    'biotechnology-biomedical', 'healthcare-health-tech', 'pharmaceutical-sciences',
    'neuroscience', 'chemistry', 'food-science-technology', 'environmental-climate-expanded', 'psychology',
  ],
  'science-chem': [
    'chemistry', 'chemical-engineering', 'pharmaceutical-sciences', 'materials-science',
    'biotechnology-biomedical', 'environmental-water-treatment', 'renewable-energy', 'food-science-technology',
  ],
  'science-physics': [
    'physics', 'semiconductor-electronics', 'aerospace-engineering', 'electrical-engineering',
    'renewable-energy', 'materials-science', 'mathematics-statistics', 'robotics-automation',
  ],
  'science-env': [
    'environmental-water-treatment', 'climate-change-sustainability', 'environmental-climate-expanded',
    'renewable-energy', 'agriculture-technology', 'chemistry', 'civil-engineering', 'food-science-technology',
  ],
  humanities: [
    'law-public-policy', 'social-sciences', 'psychology', 'education-technology',
    'marketing-digital-business', 'ux-ui-design', 'business-management', 'economics',
  ],
  business: [
    'business-management', 'finance-fintech', 'economics', 'marketing-digital-business',
    'data-science-big-data', 'mathematics-statistics', 'law-public-policy', 'education-technology',
  ],
  cs: [
    'computer-science-emerging-tech', 'software-engineering', 'ai-ml', 'data-science-big-data',
    'cybersecurity', 'web-development', 'cloud-computing', 'devops-software-infrastructure',
    'mobile-app-development', 'ux-ui-design',
  ],
  engineering: [
    'mechanical-manufacturing', 'electrical-engineering', 'civil-engineering', 'chemical-engineering',
    'aerospace-engineering', 'robotics-automation', 'semiconductor-electronics', 'electronics-embedded-systems',
    'materials-science', 'renewable-energy', 'automotive-engineering', 'biotechnology-biomedical',
  ],
};

function getRelevantTaxonomyDomains(family: SubjectFamily | null): SubjectDomainKeywords[] {
  if (!family) return SUBJECT_DOMAINS_TAXONOMY;
  const allowedIds = new Set(FAMILY_TAXONOMY_IDS[family]);
  const matched = SUBJECT_DOMAINS_TAXONOMY.filter((d) => allowedIds.has(d.id));
  return matched.length > 0 ? matched : SUBJECT_DOMAINS_TAXONOMY.slice(0, 10);
}

export default function SEOKeywordLinksBlock({
  locationName = 'Atlanta',
  tutorName,
  primarySubject,
  tutorSubjects,
  tutorEducation,
  primaryDomain,
  onNavigateLocation,
  onNavigateSubject,
  className = '',
}: SEOKeywordLinksBlockProps) {
  const isTutorMode = Boolean(
    tutorName || primarySubject || (tutorSubjects && tutorSubjects.length > 0)
  );

  const cleanCity = (locationName || 'Atlanta').split(',')[0].trim() || 'Atlanta';
  const matchedCityKey = Object.keys(CITY_NEARBY_MAP).find(
    (k) => k.toLowerCase() === cleanCity.toLowerCase()
  );

  const nearbyCities = matchedCityKey
    ? CITY_NEARBY_MAP[matchedCityKey]
    : [
        `Downtown ${cleanCity}`, `North ${cleanCity}`, `South ${cleanCity}`,
        `East ${cleanCity}`, `West ${cleanCity}`, `Central ${cleanCity}`,
        `${cleanCity} Metro`, `${cleanCity} University District`, `${cleanCity} Heights`,
        `${cleanCity} Park`, `${cleanCity} Hills`, `${cleanCity} Springs`,
      ];

  const cityOrUniPrefix = isTutorMode
    ? resolveCityOrUni(locationName, tutorEducation)
    : cleanCity;

  const subjectFamily = isTutorMode
    ? classifyTutorSubjectFamily(primarySubject, tutorSubjects, tutorEducation, primaryDomain)
    : null;

  const primarySubjectLabel = resolvePrimarySubjectDisplay(
    primarySubject,
    tutorSubjects,
    primaryDomain
  );

  const foundationalKeywords: KeywordItem[] =
    isTutorMode && subjectFamily
      ? buildDomainFoundationalKeywords(subjectFamily, cityOrUniPrefix, tutorSubjects)
      : GENERAL_REGIONAL_SUBJECTS.map((subj) => ({
          label: `${cleanCity} ${subj} Tutors`,
          searchSubject: subj,
        }));

  const specializedDomains = getRelevantTaxonomyDomains(subjectFamily);

  return (
    <div
      className={`bg-[#f0f2f5] border-t border-b border-slate-300/80 p-3 sm:p-4 font-sans text-slate-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-3 text-left">
        {/* 1. Foundational Courses, Standardized Exams & Coursework */}
        <div className="bg-white/85 rounded-xl p-3 sm:p-4 border border-slate-200/80 space-y-1.5">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Foundational Courses, Standardized Exams &amp; Coursework
            </h3>
            {isTutorMode && (
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                Comprehensive one-on-one instruction across foundational courses, standardized test preparation, university coursework, and all-level assignments in{' '}
                <span className="font-semibold text-slate-800">{primarySubjectLabel}</span>.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm leading-snug">
            {foundationalKeywords.map((item, idx) => {
              const isLast = idx === foundationalKeywords.length - 1;
              return (
                <span key={idx} className="inline-flex items-baseline">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateSubject) {
                        onNavigateSubject(item.searchSubject);
                      }
                    }}
                    className="compact-inline-link text-blue-700 hover:text-orange-600 hover:underline cursor-pointer transition-colors font-medium text-left leading-snug"
                  >
                    {item.label}
                  </button>
                  {!isLast && <span className="text-slate-400 select-none">,</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* 2. Specialized Academic, Research & Engineering Disciplines */}
        <div className="bg-white/85 rounded-xl p-3 sm:p-4 border border-slate-200/80 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Specialized Academic, Research &amp; Engineering Disciplines
          </h3>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm leading-snug">
            {specializedDomains.map((domain, idx) => {
              const isLast = idx === specializedDomains.length - 1;
              return (
                <span key={domain.id} className="inline-flex items-baseline">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateSubject) {
                        onNavigateSubject(domain.shortName);
                      }
                    }}
                    className="compact-inline-link text-blue-700 hover:text-orange-600 hover:underline cursor-pointer transition-colors font-medium text-left leading-snug"
                  >
                    {cityOrUniPrefix} {domain.shortName} Tutors
                  </button>
                  {!isLast && <span className="text-slate-400 select-none">,</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* 3. Nearby Cities & Metro Service Areas */}
        <div className="bg-white/85 rounded-xl p-3 sm:p-4 border border-slate-200/80 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Nearby Cities &amp; Metro Service Areas
          </h3>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm leading-snug">
            {nearbyCities.map((city, idx) => {
              const isLast = idx === nearbyCities.length - 1;
              const trimmedCity = city.trim();
              return (
                <span key={idx} className="inline-flex items-baseline">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateLocation) {
                        onNavigateLocation(`${trimmedCity}, ${cleanCity}`);
                      }
                    }}
                    className="compact-inline-link text-blue-700 hover:text-orange-600 hover:underline cursor-pointer transition-colors font-medium text-left leading-snug"
                  >
                    {trimmedCity} Tutors
                  </button>
                  {!isLast && <span className="text-slate-400 select-none">,</span>}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
