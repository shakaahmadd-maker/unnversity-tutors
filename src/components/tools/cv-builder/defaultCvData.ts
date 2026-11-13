export type CvAccentMode = 'classic' | 'orange';

export type BuiltInCvSectionKey =
  | 'summary'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'languages';

export type CustomCvSectionKey = `custom-${string}`;

export type CvSectionKey = BuiltInCvSectionKey | CustomCvSectionKey;

export type CvCustomSectionMode = 'bullets' | 'detailed';

export interface CvCustomDetailedEntry {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  description: string;
}

export interface CvCustomSection {
  id: CustomCvSectionKey;
  title: string;
  mode: CvCustomSectionMode;
  bullets: string[];
  entries: CvCustomDetailedEntry[];
}

export interface CvColorThemePreset {
  id: string;
  name: string;
  shortLabel: string;
  hex: string;
}

export const EUROPASS_COLOR_THEMES: CvColorThemePreset[] = [
  {
    id: 'europass-blue',
    name: 'Europass Classic Blue',
    shortLabel: 'Europass Blue',
    hex: '#0E4194',
  },
  {
    id: 'deep-navy',
    name: 'Deep Navy',
    shortLabel: 'Deep Navy',
    hex: '#1E3A8A',
  },
  {
    id: 'teal-slate',
    name: 'Teal Slate',
    shortLabel: 'Teal Slate',
    hex: '#0F766E',
  },
  {
    id: 'charcoal-black',
    name: 'Charcoal Black (ATS)',
    shortLabel: 'Charcoal',
    hex: '#1F2937',
  },
  {
    id: 'burgundy',
    name: 'Academic Burgundy',
    shortLabel: 'Burgundy',
    hex: '#881337',
  },
  {
    id: 'ut-orange',
    name: 'University-Tutors Orange',
    shortLabel: 'UT Orange',
    hex: '#F97316',
  },
];

export type CvLanguageLevel =
  | 'Native'
  | 'Fluent (C1/C2)'
  | 'Intermediate (B1/B2)'
  | 'Basic (A1/A2)';

export interface CvPersonalData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  photoDataUrl: string;
  showPhoto: boolean;
}

export interface CvEducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  cgpa: string;
}

export interface CvExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  dateRange: string;
  achievements: string;
}

export interface CvProjectItem {
  id: string;
  title: string;
  techStack: string;
  date: string;
  link: string;
  outcomes: string;
}

export interface CvSkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface CvCertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface CvLanguageItem {
  id: string;
  language: string;
  proficiency: CvLanguageLevel;
}

export interface CvDocumentData {
  version: string;
  accentMode: CvAccentMode;
  accentColor: string;
  sectionOrder: CvSectionKey[];
  personal: CvPersonalData;
  summary: string;
  education: CvEducationItem[];
  experience: CvExperienceItem[];
  projects: CvProjectItem[];
  skillGroups: CvSkillGroup[];
  certifications: CvCertificationItem[];
  languages: CvLanguageItem[];
  customSections: CvCustomSection[];
}

export const CV_SECTION_LABELS: Record<BuiltInCvSectionKey, string> = {
  summary: 'Academic & Career Summary',
  education: 'Education',
  experience: 'Work Experience & Internships',
  projects: 'Academic & Research Projects',
  skills: 'Skills & Core Competencies',
  certifications: 'Certifications, Awards & Test Scores',
  languages: 'Languages',
};

export function isBuiltInSectionKey(key: string): key is BuiltInCvSectionKey {
  return Object.prototype.hasOwnProperty.call(CV_SECTION_LABELS, key);
}

export function normalizeHexColor(input: unknown, fallback = '#0E4194'): string {
  if (typeof input !== 'string') return fallback;
  const trimmed = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return fallback;
}

export const LANGUAGE_PROFICIENCY_LEVELS: CvLanguageLevel[] = [
  'Native',
  'Fluent (C1/C2)',
  'Intermediate (B1/B2)',
  'Basic (A1/A2)',
];

export const DEFAULT_CV_SECTION_ORDER: BuiltInCvSectionKey[] = [
  'summary',
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
  'languages',
];

export const DEFAULT_CV_DATA: CvDocumentData = {
  version: '2.1',
  accentMode: 'classic',
  accentColor: '#0E4194',
  sectionOrder: [...DEFAULT_CV_SECTION_ORDER],
  personal: {
    fullName: 'Amina Al-Mansoor',
    headline: 'Final-Year BSc Computer Science & Quantitative Data Science Candidate',
    email: 'amina.mansoor@ucl-student.ac.uk',
    phone: '+44 7700 900412',
    location: 'London, United Kingdom',
    linkedinUrl: 'linkedin.com/in/amina-almansoor',
    portfolioUrl: 'github.com/amina-analytics',
    photoDataUrl: '',
    showPhoto: false,
  },
  summary:
    'Analytical final-year undergraduate specializing in **statistical machine learning**, Python data engineering, and reproducible research design. Delivered **+11.4% predictive AUC improvement** across 140,000+ longitudinal clinical records during a competitive summer research fellowship and mentored **90+ first-year undergraduates** in algorithms and SQL.',
  education: [
    {
      id: 'edu-1',
      institution: 'University College London (UCL)',
      degree: 'BSc (Hons) Computer Science & Statistical Methods',
      location: 'London, UK',
      startDate: 'Sep 2023',
      endDate: 'Jun 2026 (Expected)',
      cgpa: 'First Class Honours Track · 3.89 / 4.00 GPA',
    },
    {
      id: 'edu-2',
      institution: 'King Edward VI International Academy',
      degree: 'GCE A-Levels (Mathematics, Further Mathematics, Chemistry, Computer Science)',
      location: 'Birmingham, UK',
      startDate: 'Sep 2021',
      endDate: 'Jun 2023',
      cgpa: 'Grades: A*A*AA (Top 2% Cohort)',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Undergraduate Data Science Research Intern',
      company: 'Centre for Applied Health Informatics',
      location: 'London, UK',
      dateRange: 'Jun 2025 – Sep 2025',
      achievements:
        'Cleaned, normalized, and modeled **142,000+ de-identified patient records** in Python (pandas, scikit-learn), boosting 90-day readmission forecast AUC from **0.78 to 0.87**.\nAutomated weekly SQL & DuckDB data-quality validation pipelines, reducing faculty report preparation time by **6.5 hours per week**.\nCo-authored the statistical methodology appendix for a peer-reviewed conference manuscript submitted to IEEE ICHI.',
    },
    {
      id: 'exp-2',
      role: 'Peer Assisted Learning (PAL) Lead Teaching Assistant',
      company: 'UCL Department of Computer Science',
      location: 'London, UK',
      dateRange: 'Oct 2024 – Present',
      achievements:
        'Lead weekly 90-minute laboratory problem sessions in Data Structures, Relational Databases, and Probability for **32 first-year students**.\nDesigned 14 exam-style revision worksheets that raised cohort midterm pass rates by **18% year-over-year**.',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Explainable Credit & Scholarship Risk Calibration Engine (Honours Thesis)',
      techStack: 'Python · XGBoost · SHAP · PostgreSQL · FastAPI',
      date: 'Oct 2025 – Present',
      link: 'github.com/amina-analytics/xai-scoring',
      outcomes:
        'Built an end-to-end gradient-boosted classification pipeline achieving **93.2% calibration accuracy** across 50,000 benchmark applications.\nIntegrated **SHAP feature-attribution plots** and demographic parity checks to audit algorithmic fairness.',
    },
    {
      id: 'proj-2',
      title: 'Real-Time Laboratory Reagent & PCR Inventory Tracker',
      techStack: 'TypeScript · React · Node.js · SQLite',
      date: 'Feb 2025 – May 2025',
      link: 'github.com/amina-analytics/lab-inventory',
      outcomes:
        'Developed a barcode-ready stock alert system adopted by **3 university student societies** to prevent reagent expiry and duplicate orders.',
    },
  ],
  skillGroups: [
    {
      id: 'sg-1',
      category: 'Programming & Data Engineering',
      skills: [
        'Python (NumPy, pandas, scikit-learn)',
        'SQL & PostgreSQL',
        'R (tidyverse, ggplot2)',
        'TypeScript & React',
        'Git & Linux Bash',
      ],
    },
    {
      id: 'sg-2',
      category: 'Research & Quantitative Methods',
      skills: [
        'Hypothesis Testing & ANOVA',
        'Regression & Survival Analysis',
        'SHAP Explainability',
        'LaTeX & Overleaf',
        'APA / IEEE Academic Writing',
      ],
    },
    {
      id: 'sg-3',
      category: 'Tools & Laboratory Platforms',
      skills: ['JupyterLab', 'Tableau & Power BI', 'Docker', 'SPSS & MATLAB'],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Dean’s Academic Excellence List & Undergraduate Research Fellowship',
      issuer: 'University College London (Faculty of Engineering)',
      year: '2025',
    },
    {
      id: 'cert-2',
      name: 'GRE General Test — Quantitative: 168/170 · Verbal: 162/170 · AWA: 5.0',
      issuer: 'ETS',
      year: '2025',
    },
    {
      id: 'cert-3',
      name: 'IELTS Academic — Overall Band 8.5 (CEFR C2)',
      issuer: 'British Council',
      year: '2024',
    },
  ],
  languages: [
    { id: 'lang-1', language: 'English', proficiency: 'Native' },
    { id: 'lang-2', language: 'Arabic', proficiency: 'Native' },
    { id: 'lang-3', language: 'German', proficiency: 'Intermediate (B1/B2)' },
  ],
  customSections: [],
};

export function createFreshDefaultCvData(): CvDocumentData {
  return JSON.parse(JSON.stringify(DEFAULT_CV_DATA)) as CvDocumentData;
}

export function sanitizeImportedCvData(raw: unknown): CvDocumentData | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<CvDocumentData>;
  if (!obj.personal || typeof obj.personal !== 'object') return null;

  const customSections: CvCustomSection[] = Array.isArray(obj.customSections)
    ? obj.customSections
        .map((sec, idx): CvCustomSection | null => {
          if (!sec || typeof sec !== 'object') return null;
          const rawId = String(sec.id || `custom-${Date.now()}-${idx}`);
          const safeId: CustomCvSectionKey = rawId.startsWith('custom-')
            ? (rawId as CustomCvSectionKey)
            : (`custom-${rawId}` as CustomCvSectionKey);
          const mode: CvCustomSectionMode = sec.mode === 'bullets' ? 'bullets' : 'detailed';
          const bullets = Array.isArray(sec.bullets)
            ? sec.bullets.map((b) => String(b ?? ''))
            : [];
          const entries: CvCustomDetailedEntry[] = Array.isArray(sec.entries)
            ? sec.entries.map((ent, eIdx) => ({
                id: String(ent?.id || `${safeId}-ent-${eIdx}`),
                title: String(ent?.title ?? ''),
                subtitle: String(ent?.subtitle ?? ''),
                meta: String(ent?.meta ?? ''),
                description: String(ent?.description ?? ''),
              }))
            : [];
          return {
            id: safeId,
            title: String(sec.title || 'Custom Section'),
            mode,
            bullets,
            entries,
          };
        })
        .filter((s): s is CvCustomSection => s !== null)
    : [];

  const customIdSet = new Set<string>(customSections.map((c) => c.id));
  const validBuiltInSet = new Set<string>(DEFAULT_CV_SECTION_ORDER);

  const incomingOrder = Array.isArray(obj.sectionOrder)
    ? obj.sectionOrder
        .map((k) => String(k))
        .filter((k): k is CvSectionKey => validBuiltInSet.has(k) || customIdSet.has(k))
    : [];

  const missingBuiltIns = DEFAULT_CV_SECTION_ORDER.filter((k) => !incomingOrder.includes(k));
  const missingCustoms = customSections
    .map((c) => c.id)
    .filter((id) => !incomingOrder.includes(id));

  const mergedOrder: CvSectionKey[] = [...incomingOrder, ...missingBuiltIns, ...missingCustoms];

  const accentMode: CvAccentMode = obj.accentMode === 'orange' ? 'orange' : 'classic';
  const legacyFallbackHex = obj.accentMode === 'orange' ? '#F97316' : '#0E4194';
  const accentColor = normalizeHexColor(obj.accentColor, legacyFallbackHex);

  return {
    version: '2.1',
    accentMode,
    accentColor,
    sectionOrder: mergedOrder,
    personal: {
      fullName: String(obj.personal.fullName ?? ''),
      headline: String(obj.personal.headline ?? ''),
      email: String(obj.personal.email ?? ''),
      phone: String(obj.personal.phone ?? ''),
      location: String(obj.personal.location ?? ''),
      linkedinUrl: String(obj.personal.linkedinUrl ?? ''),
      portfolioUrl: String(obj.personal.portfolioUrl ?? ''),
      photoDataUrl: String(obj.personal.photoDataUrl ?? ''),
      showPhoto: Boolean(obj.personal.showPhoto),
    },
    summary: typeof obj.summary === 'string' ? obj.summary : '',
    education: Array.isArray(obj.education)
      ? obj.education.map((item, idx) => ({
          id: String(item?.id || `edu-${idx}-${Date.now()}`),
          institution: String(item?.institution ?? ''),
          degree: String(item?.degree ?? ''),
          location: String(item?.location ?? ''),
          startDate: String(item?.startDate ?? ''),
          endDate: String(item?.endDate ?? ''),
          cgpa: String(item?.cgpa ?? ''),
        }))
      : [],
    experience: Array.isArray(obj.experience)
      ? obj.experience.map((item, idx) => ({
          id: String(item?.id || `exp-${idx}-${Date.now()}`),
          role: String(item?.role ?? ''),
          company: String(item?.company ?? ''),
          location: String(item?.location ?? ''),
          dateRange: String(item?.dateRange ?? ''),
          achievements: String(item?.achievements ?? ''),
        }))
      : [],
    projects: Array.isArray(obj.projects)
      ? obj.projects.map((item, idx) => ({
          id: String(item?.id || `proj-${idx}-${Date.now()}`),
          title: String(item?.title ?? ''),
          techStack: String(item?.techStack ?? ''),
          date: String(item?.date ?? ''),
          link: String(item?.link ?? ''),
          outcomes: String(item?.outcomes ?? ''),
        }))
      : [],
    skillGroups: Array.isArray(obj.skillGroups)
      ? obj.skillGroups.map((item, idx) => ({
          id: String(item?.id || `sg-${idx}-${Date.now()}`),
          category: String(item?.category ?? ''),
          skills: Array.isArray(item?.skills)
            ? item.skills.map((s) => String(s)).filter(Boolean)
            : [],
        }))
      : [],
    certifications: Array.isArray(obj.certifications)
      ? obj.certifications.map((item, idx) => ({
          id: String(item?.id || `cert-${idx}-${Date.now()}`),
          name: String(item?.name ?? ''),
          issuer: String(item?.issuer ?? ''),
          year: String(item?.year ?? ''),
        }))
      : [],
    languages: Array.isArray(obj.languages)
      ? obj.languages.map((item, idx) => ({
          id: String(item?.id || `lang-${idx}-${Date.now()}`),
          language: String(item?.language ?? ''),
          proficiency: LANGUAGE_PROFICIENCY_LEVELS.includes(item?.proficiency as CvLanguageLevel)
            ? (item.proficiency as CvLanguageLevel)
            : 'Fluent (C1/C2)',
        }))
      : [],
    customSections,
  };
}
