export type SpecializedServiceCategory = 'assignment-guidance' | 'coursework-tutoring' | 'writing-tutoring';

export interface SpecializedServicePageData {
  slug: string;                  // e.g. 'assignment-guidance-usa' or 'assignment-guidance'
  category: SpecializedServiceCategory; // 'assignment-guidance' | 'coursework-tutoring' | 'writing-tutoring'
  countrySlug?: string;          // 'usa', 'canada', 'uk', 'uae', 'ireland', 'australia', 'new-zealand', 'singapore' or undefined (global)
  countryName: string;           // 'United States', 'Canada', 'United Kingdom', etc. or 'Global'
  flagEmoji: string;
  url: string;                   // 'https://www.university-tutors.com/assignment-guidance-usa'
  path: string;                  // '/assignment-guidance-usa'
  seoTitle: string;
  h1: string;
  badge: string;
  summary: string;
  targetKeywords: string[];
  features: {
    title: string;
    description: string;
    iconName?: string;
  }[];
  curriculumDisciplines: string[];
  learningMethodology: {
    step: string;
    title: string;
    desc: string;
  }[];
  ethicalGuidanceNotice: string;
  parentCountryHub?: {
    name: string;
    path: string;
    slug: string;
  };
  siblingServices: {
    name: string;
    path: string;
    category: SpecializedServiceCategory;
    desc: string;
  }[];
  countryExpansions: {
    name: string;
    flag: string;
    path: string;
    slug: string;
  }[];
  faqs: {
    q: string;
    a: string;
  }[];
}

export const COUNTRIES_CONFIG: Record<string, { name: string; flag: string; demonym: string; educationSystem: string; keyInstitutions: string }> = {
  usa: {
    name: 'USA',
    flag: '🇺🇸',
    demonym: 'American',
    educationSystem: 'US Higher Ed, AP, Honors, Ivy League, & State University Syllabi (APA/MLA/Chicago)',
    keyInstitutions: 'Harvard, Stanford, MIT, UC Berkeley, NYU, Columbia, UCLA'
  },
  canada: {
    name: 'Canada',
    flag: '🇨🇦',
    demonym: 'Canadian',
    educationSystem: 'Ontario, BC, Alberta University & College Curricula (APA/IEEE/Chicago)',
    keyInstitutions: 'U of Toronto, UBC, McGill, Waterloo, McMaster, Alberta'
  },
  uk: {
    name: 'UK',
    flag: '🇬🇧',
    demonym: 'British',
    educationSystem: 'UK Russell Group, Oxbridge, GCSE, A-Levels & Scottish Highers (Harvard/OSCOLA/MHRA)',
    keyInstitutions: 'Oxford, Cambridge, Imperial College, UCL, LSE, Edinburgh, Manchester'
  },
  uae: {
    name: 'UAE',
    flag: '🇦🇪',
    demonym: 'Emirati & International UAE',
    educationSystem: 'British, American, IB, & UAE Ministry Higher Education Curricula',
    keyInstitutions: 'Khalifa University, UAEU, NYU Abu Dhabi, American Univ. of Sharjah, Heriot-Watt Dubai'
  },
  ireland: {
    name: 'Ireland',
    flag: '🇮🇪',
    demonym: 'Irish',
    educationSystem: 'Irish University Framework, Leaving Certificate & European ECTS Modules',
    keyInstitutions: 'Trinity College Dublin, UCD, UCC, NUI Galway, DCU, UL'
  },
  australia: {
    name: 'Australia',
    flag: '🇦🇺',
    demonym: 'Australian',
    educationSystem: 'Group of Eight (Go8), ATAR, & Australian Qualifications Framework (AQF)',
    keyInstitutions: 'Univ. of Melbourne, Univ. of Sydney, UNSW, ANU, Monash, Univ. of Queensland'
  },
  'new-zealand': {
    name: 'New Zealand',
    flag: '🇳🇿',
    demonym: 'New Zealand',
    educationSystem: 'NZ Universities, NCEA Level 3 & NZQF Degree Frameworks (APA/Harvard)',
    keyInstitutions: 'Univ. of Auckland, Univ. of Otago, Victoria Univ. of Wellington, Univ. of Canterbury'
  },
  singapore: {
    name: 'Singapore',
    flag: '🇸🇬',
    demonym: 'Singaporean',
    educationSystem: 'Singapore National Syllabus, Cambridge A-Levels, NUS/NTU/SMU Modular Degree Frameworks',
    keyInstitutions: 'NUS, NTU, SMU, SUTD, SIM, SIT'
  }
};

export const CORE_SERVICE_CONFIGS: Record<SpecializedServiceCategory, {
  name: string;
  slugBase: string;
  defaultTitle: string;
  defaultH1: string;
  targetKeywords: string[];
  description: string;
}> = {
  'assignment-guidance': {
    name: 'Assignment Guidance',
    slugBase: 'assignment-guidance',
    defaultTitle: 'Assignment Guidance & Academic Planning Tutors | 1-on-1 Support',
    defaultH1: '1-on-1 Academic Assignment Guidance & Planning Support',
    targetKeywords: [
      'assignment guidance',
      'assignment help',
      'assignment support',
      'assignment planning',
      'academic assignment guidance'
    ],
    description: 'Personalized 1-on-1 assignment guidance, rubric deconstruction, problem-solving derivation, and structured planning sessions with top-tier university mentors.'
  },
  'coursework-tutoring': {
    name: 'Coursework Tutoring',
    slugBase: 'coursework-tutoring',
    defaultTitle: 'Coursework Tutoring | Expert University Coursework Tutors',
    defaultH1: '1-on-1 University & High School Coursework Tutoring',
    targetKeywords: [
      'coursework tutor',
      'coursework tutoring',
      'university coursework support',
      'online coursework tutor'
    ],
    description: 'Comprehensive 1-on-1 coursework mentoring covering STEM problem sets, lab report methodologies, coding modules, business case studies, and continuous assessment.'
  },
  'writing-tutoring': {
    name: 'Writing Tutoring',
    slugBase: 'writing-tutoring',
    defaultTitle: 'Academic Writing Tutor | Essay & Research Paper Tutoring',
    defaultH1: '1-on-1 Academic Essay & Research Writing Tutoring',
    targetKeywords: [
      'writing tutor',
      'academic writing tutor',
      'essay writing tutor',
      'university writing support'
    ],
    description: 'Expert 1-on-1 academic writing guidance covering thesis development, critical arguments, citation styles (APA, MLA, Harvard, Chicago, OSCOLA), and structural revision.'
  }
};

export function generateSpecializedServicePage(
  category: SpecializedServiceCategory,
  countrySlug?: string
): SpecializedServicePageData {
  const base = CORE_SERVICE_CONFIGS[category];
  const isGlobal = !countrySlug || countrySlug === 'global';
  const country = !isGlobal ? COUNTRIES_CONFIG[countrySlug] : null;

  const countryName = country ? country.name : 'Global';
  const flagEmoji = country ? country.flag : '🌐';
  const slug = isGlobal ? base.slugBase : `${base.slugBase}-${countrySlug}`;
  const path = `/${slug}`;
  const url = `https://www.university-tutors.com${path}`;

  let seoTitle = '';
  let h1 = '';
  let badge = '';
  let summary = '';
  let ethicalNotice = '';

  if (category === 'assignment-guidance') {
    seoTitle = isGlobal
      ? 'Assignment Guidance & Planning Support | 1-on-1 Academic Tutors'
      : `Assignment Guidance ${countryName} | 1-on-1 Academic Support & Planning`;
    h1 = isGlobal
      ? '1-on-1 Academic Assignment Guidance & Planning Support'
      : `1-on-1 Academic Assignment Guidance in ${countryName}`;
    badge = isGlobal ? 'Academic Assignment Support' : `${countryName} Assignment Guidance`;
    summary = isGlobal
      ? 'University Tutors provides ethical, rigorous 1-on-1 assignment guidance and academic planning for students across high schools, colleges, and top universities. Our subject experts work directly with you to unpack complex briefs, interpret grading rubrics, formulate analytical outlines, and derive mathematical or computational solutions step by step.'
      : `University Tutors provides dedicated 1-on-1 academic assignment guidance tailored specifically to ${country?.educationSystem}. Our qualified subject specialists help students across ${countryName} comprehend difficult prompts, plan milestones, structure methodologies, and verify solutions in full compliance with institutional academic integrity policies.`;
    ethicalNotice = 'Strict Academic Integrity Guarantee: University Tutors does not ghostwrite or complete graded work on behalf of students. Our tutors deliver pedagogically sound 1-on-1 mentorship, conceptual coaching, outline reviews, and error explanations designed to build your independent academic mastery.';
  } else if (category === 'coursework-tutoring') {
    seoTitle = isGlobal
      ? 'Coursework Tutoring | 1-on-1 University Coursework Support'
      : `Coursework Tutoring ${countryName} | Expert 1-on-1 Coursework Support`;
    h1 = isGlobal
      ? '1-on-1 Online Coursework Tutoring & Modular Mentorship'
      : `1-on-1 Coursework Tutoring Services in ${countryName}`;
    badge = isGlobal ? 'University Coursework Support' : `${countryName} Coursework Mentorship`;
    summary = isGlobal
      ? 'Master your modular coursework, lab assignments, quantitative problem sets, and continuous assessment units with 1-on-1 guidance from top-tier university scholars. We provide hands-on concept reinforcement, analytical review, code debugging walkthroughs, and syllabus-aligned coursework tutorials.'
      : `Excel in your continuous assessment, laboratory write-ups, engineering projects, and semester coursework across ${countryName} institutions (${country?.keyInstitutions}). Our verified tutors guide you through challenging theoretical frameworks, problem-set derivation, and syllabus criteria.`;
    ethicalNotice = 'Academic Rigor & Integrity: All coursework tutoring sessions are interactive learning masterclasses where tutors explain underlying formulas, review student-written drafts, and provide constructive pedagogical feedback.';
  } else {
    // writing-tutoring
    seoTitle = isGlobal
      ? 'Academic Writing Tutor | 1-on-1 Essay & Research Writing Support'
      : `Writing Tutor ${countryName} | 1-on-1 Essay & University Writing Support`;
    h1 = isGlobal
      ? '1-on-1 Academic Essay & Research Writing Tutoring'
      : `1-on-1 Academic Writing & Essay Tutoring in ${countryName}`;
    badge = isGlobal ? 'Academic & Essay Writing' : `${countryName} Writing Support`;
    summary = isGlobal
      ? 'Elevate your critical prose, essay argumentation, dissertation research design, and scholarly writing with guidance from published researchers and doctoral-level writing tutors. Learn how to construct persuasive theses, synthesize literature, and apply exact citation standards.'
      : `Develop superior academic writing and research communication tailored to ${countryName} university requirements. Our writing tutors support undergraduate and postgraduate students with literature synthesis, essay structure, argumentation logic, and precise formatting across ${country?.educationSystem}.`;
    ethicalNotice = 'Transparent Writing Mentorship: We do not write essays for students. We coach you on rhetorical clarity, argument structure, evidence synthesis, thesis formulation, and citation formatting so you write with absolute confidence.';
  }

  // All 8 country expansion links
  const countryExpansions = Object.keys(COUNTRIES_CONFIG).map((cKey) => ({
    name: COUNTRIES_CONFIG[cKey].name,
    flag: COUNTRIES_CONFIG[cKey].flag,
    path: `/${base.slugBase}-${cKey}`,
    slug: cKey
  }));

  // Sibling services in this country (or global)
  const allCategories: SpecializedServiceCategory[] = ['assignment-guidance', 'coursework-tutoring', 'writing-tutoring'];
  const siblingServices = allCategories
    .filter((c) => c !== category)
    .map((c) => {
      const cBase = CORE_SERVICE_CONFIGS[c];
      return {
        name: isGlobal ? cBase.name : `${countryName} ${cBase.name}`,
        path: isGlobal ? `/${cBase.slugBase}` : `/${cBase.slugBase}-${countrySlug}`,
        category: c,
        desc: cBase.description
      };
    });

  const parentCountryHub = !isGlobal
    ? {
        name: `Online Tutoring ${countryName}`,
        path: `/online-tutoring-${countrySlug}`,
        slug: countrySlug!
      }
    : undefined;

  const features = [
    {
      title: 'Prompt & Rubric Deconstruction',
      description: 'Break down assignment and coursework briefs to identify grading criteria, learning outcomes, and structural expectations.',
      iconName: 'FileCheck'
    },
    {
      title: '1-on-1 Step-by-Step Problem Solving',
      description: 'Work through complex theoretical derivations, algorithmic proofs, and quantitative exercises with live whiteboard guidance.',
      iconName: 'HelpCircle'
    },
    {
      title: 'Structural Planning & Outlining',
      description: 'Develop comprehensive project roadmaps, paragraph-by-paragraph arguments, and milestone schedules to finish ahead of deadlines.',
      iconName: 'Compass'
    },
    {
      title: 'Citation & Methodological Rigor',
      description: `Ensure flawless adherence to required academic formatting (${country ? country.educationSystem : 'APA 7, Harvard, IEEE, MLA 9, Chicago, OSCOLA'}).`,
      iconName: 'BookOpen'
    },
    {
      title: 'Formative Feedback & Revisions',
      description: 'Receive detailed annotations on clarity, flow, critical depth, and logical coherence before submitting your work.',
      iconName: 'Sparkles'
    },
    {
      title: '24/7 Scheduling Flexibility',
      description: 'Connect with verified tutors matching your exact subject domain and local timezone across the semester.',
      iconName: 'Clock'
    }
  ];

  const curriculumDisciplines = [
    'STEM & Engineering Problem Sets',
    'Computer Science & Programming Projects',
    'Economics, Econometrics & Quantitative Finance',
    'Biochemistry, Medical Sciences & Lab Reports',
    'Business Management & Case Study Analysis',
    'Law & Legal Case Briefing (IRAC / OSCOLA)',
    'Social Sciences, Psychology & Literature Reviews',
    'Mathematics, Calculus, Linear Algebra & Statistics',
    'Dissertation & Master\'s Capstone Methodologies',
    'Data Science, Machine Learning & Python / R Analytics'
  ];

  const learningMethodology = [
    {
      step: '01',
      title: 'Upload Brief & Syllabus',
      desc: 'Submit your prompt, rubric criteria, lecture notes, or code specifications through our secure student portal.'
    },
    {
      step: '02',
      title: 'Match with a Verified Subject Specialist',
      desc: 'Connect with a tutor holding a Masters or PhD from top global institutions who specializes in your exact academic module.'
    },
    {
      step: '03',
      title: '1-on-1 Live Interactive Session',
      desc: 'Collaborate in real time using audio/video, shared screens, interactive code notebooks, and derivation whiteboards.'
    },
    {
      step: '04',
      title: 'Actionable Action Plan & Mastery',
      desc: 'Receive session recordings, detailed step derivations, and structured feedback to complete your assignments with top confidence.'
    }
  ];

  const faqs = [
    {
      q: `What is the difference between Assignment Guidance and ghostwriting?`,
      a: `University Tutors provides 100% ethical academic guidance. Our tutors never write or solve assignments on your behalf. Instead, tutors act as academic coaches—explaining difficult concepts, guiding your problem-solving process, brainstorming thesis arguments, and reviewing your drafts against grading rubrics.`
    },
    {
      q: `Can I get urgent 1-on-1 tutoring before my submission deadline?`,
      a: `Yes. Our global tutor network operates 24/7 across US, UK, Canadian, Australian, UAE, Singaporean, and European timezones. You can book same-day emergency sessions or structured semester-long support.`
    },
    {
      q: `Are the tutors familiar with ${countryName} institutional standards?`,
      a: isGlobal 
        ? `Yes, all tutors are vetted university scholars with advanced degrees from Ivy League, Russell Group, and top international universities.`
        : `Yes, our mentors specialize in ${country?.educationSystem} and are alumni or faculty from institutions including ${country?.keyInstitutions}.`
    },
    {
      q: `How do I book a specialized session?`,
      a: `Click 'Get Free Quote' or 'Browse Available Tutors' to specify your course topic, target deadline, and specific guidance needs. You'll receive instant tutor recommendations and customized rate quotes.`
    }
  ];

  return {
    slug,
    category,
    countrySlug: isGlobal ? undefined : countrySlug,
    countryName,
    flagEmoji,
    url,
    path,
    seoTitle,
    h1,
    badge,
    summary,
    targetKeywords: base.targetKeywords,
    features,
    curriculumDisciplines,
    learningMethodology,
    ethicalGuidanceNotice: ethicalNotice,
    parentCountryHub,
    siblingServices,
    countryExpansions,
    faqs
  };
}

// Generate complete dictionary of all pages
export const SPECIALIZED_SERVICE_PAGES_MAP: Record<string, SpecializedServicePageData> = {};

const ALL_CATEGORIES: SpecializedServiceCategory[] = ['assignment-guidance', 'coursework-tutoring', 'writing-tutoring'];
const ALL_COUNTRIES = ['usa', 'canada', 'uk', 'uae', 'ireland', 'australia', 'new-zealand', 'singapore'];

// 1. Core global pages
ALL_CATEGORIES.forEach((cat) => {
  const page = generateSpecializedServicePage(cat);
  SPECIALIZED_SERVICE_PAGES_MAP[cat] = page;
  SPECIALIZED_SERVICE_PAGES_MAP[`/${cat}`] = page;
});

// 2. All 8 country expansions for each category
ALL_CATEGORIES.forEach((cat) => {
  ALL_COUNTRIES.forEach((cKey) => {
    const slug = `${cat}-${cKey}`;
    const page = generateSpecializedServicePage(cat, cKey);
    SPECIALIZED_SERVICE_PAGES_MAP[slug] = page;
    SPECIALIZED_SERVICE_PAGES_MAP[`/${slug}`] = page;
  });
});
