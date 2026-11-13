import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  FileDown,
  Globe,
  GraduationCap,
  Clock,
  Briefcase,
  AlertCircle,
  X,
} from 'lucide-react';
import { downloadGradeEquivalencePdf } from '../../utils/pdfReportGenerator';

type ArchetypeKey =
  | 'gpa'
  | 'percentage'
  | 'honours'
  | 'descriptive'
  | 'numerical'
  | 'inverted';

type TargetCountryKey =
  | 'uk'
  | 'usa'
  | 'canada'
  | 'australia'
  | 'ireland'
  | 'nz'
  | 'singapore';

type GradingPolicy = 'absolute' | 'relative';

interface ArchetypeMeta {
  key: ArchetypeKey;
  numberLabel: string;
  title: string;
  scaleHint: string;
  countriesSummary: string;
}

interface CountryPreset {
  id: string;
  label: string;
  systemLabel: string;
  max: number;
  min: number;
  sample: number;
  inverted?: boolean;
  semesters: number;
  credits: number;
  weeks: number;
  hoursPerCredit: number;
  ectsMultiplier: number;
  explainer: string;
}

interface TargetCountryConfig {
  key: TargetCountryKey;
  shortLabel: string;
  dropdownLabel: string;
  headerTitle: string;
  creditLabel: string;
  creditUnit: string;
  ectsFactor: number;
  workTitle: string;
  workMain: string;
  workNote: string;
}

const ARCHETYPES: ArchetypeMeta[] = [
  {
    key: 'gpa',
    numberLabel: '01',
    title: 'GPA / Letter Scale',
    scaleHint: '4.0 / 4.33 / 4.5 / 5.0',
    countriesSummary: 'USA, Canada, Pakistan (HEC), South Korea, Saudi Arabia, Nigeria',
  },
  {
    key: 'percentage',
    numberLabel: '02',
    title: 'Percentage & Division',
    scaleHint: '0–100%',
    countriesSummary: 'India (Annual/State), Pakistan (Annual), China (60% pass), South Africa',
  },
  {
    key: 'honours',
    numberLabel: '03',
    title: 'Honours Degree Class',
    scaleHint: '1st / 2:1 / 2:2',
    countriesSummary: 'United Kingdom, Ireland, Kenya, Ghana (40% pass mark)',
  },
  {
    key: 'descriptive',
    numberLabel: '04',
    title: 'Descriptive Band Scale',
    scaleHint: 'HD / D / Cr / P',
    countriesSummary: 'Australia (7.0 / HD–P), New Zealand (9.0 / A+ to C-, 50% pass)',
  },
  {
    key: 'numerical',
    numberLabel: '05',
    title: 'Numerical Point Scale',
    scaleHint: '0–10 / 0–20 / 18–30',
    countriesSummary: 'India (10-pt CGPA), France (0–20), Netherlands (0–10), Italy (18–30)',
  },
  {
    key: 'inverted',
    numberLabel: '06',
    title: 'Inverted Numerical',
    scaleHint: 'Lower = Better',
    countriesSummary: 'Germany (1.0 best – 4.0 pass), Austria (1–5), Czechia / Slovakia (1–4)',
  },
];

const PRESETS_BY_ARCHETYPE: Record<ArchetypeKey, CountryPreset[]> = {
  gpa: [
    {
      id: 'pk_hec',
      label: 'Pakistan — HEC 4.0 CGPA Scale (Pass 2.0)',
      systemLabel: 'GPA / Letter Scale (4.0)',
      max: 4.0,
      min: 2.0,
      sample: 3.45,
      semesters: 8,
      credits: 136,
      weeks: 16,
      hoursPerCredit: 45,
      ectsMultiplier: 1.765,
      explainer:
        'Pakistan (HEC): 4-year BS = 130–136 Credit Hours across 8 semesters (1 credit = 16 contact hrs + ~29 self-study hrs ≈ 45 workload hrs; ~240 ECTS).',
    },
    {
      id: 'us_4',
      label: 'United States — 4.0 GPA Scale (Pass 2.0)',
      systemLabel: 'GPA / Letter Scale (4.0)',
      max: 4.0,
      min: 2.0,
      sample: 3.55,
      semesters: 8,
      credits: 120,
      weeks: 15,
      hoursPerCredit: 45,
      ectsMultiplier: 2.0,
      explainer:
        'USA Semester System: 120 Semester Credit Hours across 8 semesters (1 US credit = 45 total workload hrs = 2.0 ECTS).',
    },
    {
      id: 'ca_433',
      label: 'Canada — 4.33 GPA Scale (Pass 2.0)',
      systemLabel: 'GPA / Letter Scale (4.33)',
      max: 4.33,
      min: 2.0,
      sample: 3.7,
      semesters: 8,
      credits: 120,
      weeks: 15,
      hoursPerCredit: 45,
      ectsMultiplier: 2.0,
      explainer:
        'Canada (4.33 Scale): Used by UBC, SFU, York & Concordia where A+ = 4.33 and A = 4.00 across 120 degree credits.',
    },
    {
      id: 'kr_45',
      label: 'South Korea — 4.5 CGPA Scale (Pass 2.0)',
      systemLabel: 'GPA / Letter Scale (4.5)',
      max: 4.5,
      min: 2.0,
      sample: 3.85,
      semesters: 8,
      credits: 130,
      weeks: 16,
      hoursPerCredit: 45,
      ectsMultiplier: 1.846,
      explainer:
        'South Korea (4.5 Scale): Most Korean universities set A+ = 4.50, A0 = 4.00, B+ = 3.50, C0 = 2.00 across 130–140 credits.',
    },
    {
      id: 'ng_5',
      label: 'Nigeria — NUC 5.0 CGPA Scale (Pass 1.5)',
      systemLabel: 'GPA / Letter Scale (5.0)',
      max: 5.0,
      min: 1.5,
      sample: 4.15,
      semesters: 8,
      credits: 144,
      weeks: 15,
      hoursPerCredit: 45,
      ectsMultiplier: 1.667,
      explainer:
        'Nigeria (NUC 5.0 Scale): First Class (4.50–5.00), Second Class Upper (3.50–4.49), Second Class Lower (2.40–3.49).',
    },
    {
      id: 'sa_5',
      label: 'Saudi Arabia / GCC — 5.0 GPA Scale (Pass 2.0)',
      systemLabel: 'GPA / Letter Scale (5.0)',
      max: 5.0,
      min: 2.0,
      sample: 4.25,
      semesters: 8,
      credits: 130,
      weeks: 15,
      hoursPerCredit: 45,
      ectsMultiplier: 1.846,
      explainer:
        'Saudi Arabia / GCC 5.0 Scale: Excellent (4.50–5.00), Very Good (3.75–4.49), Good (2.75–3.74).',
    },
  ],
  percentage: [
    {
      id: 'in_pct',
      label: 'India — Traditional University Percentage (Pass 40%)',
      systemLabel: 'Percentage & Division (0–100%)',
      max: 100,
      min: 40,
      sample: 74,
      semesters: 6,
      credits: 120,
      weeks: 16,
      hoursPerCredit: 40,
      ectsMultiplier: 1.5,
      explainer:
        'India Percentage System: First Division with Distinction typically starts at 75%, First Division at 60%, minimum pass 40%.',
    },
    {
      id: 'pk_pct',
      label: 'Pakistan — Annual / Percentage System (Pass 50%)',
      systemLabel: 'Percentage & Division (0–100%)',
      max: 100,
      min: 50,
      sample: 76,
      semesters: 8,
      credits: 136,
      weeks: 16,
      hoursPerCredit: 45,
      ectsMultiplier: 1.765,
      explainer:
        'Pakistan Annual/Percentage System: First Division starts at 60%, minimum university passing mark is typically 50%.',
    },
    {
      id: 'cn_100',
      label: 'China — 100-Point University Scale (Pass 60%)',
      systemLabel: 'Percentage & Division (0–100%)',
      max: 100,
      min: 60,
      sample: 85,
      semesters: 8,
      credits: 150,
      weeks: 16,
      hoursPerCredit: 40,
      ectsMultiplier: 1.6,
      explainer:
        'China 100-Point System: Minimum pass is 60/100; 85+ is generally evaluated as First-Class / Distinction equivalent.',
    },
    {
      id: 'za_pct',
      label: 'South Africa — Percentage Scale (Pass 50%)',
      systemLabel: 'Percentage & Division (0–100%)',
      max: 100,
      min: 50,
      sample: 72,
      semesters: 6,
      credits: 360,
      weeks: 15,
      hoursPerCredit: 10,
      ectsMultiplier: 0.5,
      explainer:
        'South Africa (NQF): Pass mark is 50%, First-Class / Distinction is 75%+, 120 SA credits per year (360 for 3-year degree).',
    },
  ],
  honours: [
    {
      id: 'uk_hon',
      label: 'United Kingdom — Honours Weighted % (Pass 40%)',
      systemLabel: 'Honours Degree Class (0–100%)',
      max: 100,
      min: 40,
      sample: 68,
      semesters: 6,
      credits: 360,
      weeks: 15,
      hoursPerCredit: 10,
      ectsMultiplier: 0.5,
      explainer:
        'UK Honours (CATS): 1st (70%+), 2:1 (60–69%), 2:2 (50–59%), 3rd (40–49%). 360 UK credits = 180 ECTS.',
    },
    {
      id: 'ie_hon',
      label: 'Ireland — NQAI Honours % (1H / 2H1 / 2H2, Pass 40%)',
      systemLabel: 'Honours Degree Class (0–100%)',
      max: 100,
      min: 40,
      sample: 66,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 25,
      ectsMultiplier: 1.0,
      explainer:
        'Ireland (NQAI): 1H (70%+), 2H1 (60–69%), 2H2 (50–59%), Pass (40–49%). Uses 60 ECTS per academic year.',
    },
    {
      id: 'gh_ke',
      label: 'Ghana / Kenya — Commonwealth Honours % (Pass 40%)',
      systemLabel: 'Honours Degree Class (0–100%)',
      max: 100,
      min: 40,
      sample: 67,
      semesters: 8,
      credits: 140,
      weeks: 15,
      hoursPerCredit: 40,
      ectsMultiplier: 1.71,
      explainer:
        'Commonwealth Honours System: Weighted module marks mapped to First Class, Second Class Upper (2:1), and Lower (2:2).',
    },
  ],
  descriptive: [
    {
      id: 'au_7',
      label: 'Australia — 7.0 Scale (HD = 7, D = 6, Cr = 5, P = 4)',
      systemLabel: 'Descriptive Band (7.0)',
      max: 7.0,
      min: 4.0,
      sample: 6.0,
      semesters: 6,
      credits: 144,
      weeks: 14,
      hoursPerCredit: 25,
      ectsMultiplier: 1.25,
      explainer:
        'Australia (7.0 Scale): High Distinction (85–100% / 7.0), Distinction (75–84% / 6.0), Credit (65–74% / 5.0), Pass (50–64% / 4.0).',
    },
    {
      id: 'nz_9',
      label: 'New Zealand — 9.0 Scale (A+ = 9, B+ = 6, C- = 1)',
      systemLabel: 'Descriptive Band (9.0)',
      max: 9.0,
      min: 1.0,
      sample: 7.0,
      semesters: 6,
      credits: 360,
      weeks: 15,
      hoursPerCredit: 10,
      ectsMultiplier: 0.5,
      explainer:
        'New Zealand (9.0 Scale): A+ (9), A (8), A- (7), B+ (6), B (5), B- (4), C+ (3), C (2), C- (1 = 50% Pass). 120 NZ credits/year.',
    },
  ],
  numerical: [
    {
      id: 'in_10',
      label: 'India — 10.0 CGPA Scale (UGC / AICTE, Pass 4.0)',
      systemLabel: 'Numerical Scale (0–10)',
      max: 10.0,
      min: 4.0,
      sample: 8.4,
      semesters: 8,
      credits: 160,
      weeks: 16,
      hoursPerCredit: 40,
      ectsMultiplier: 1.5,
      explainer:
        'India 10-Point CGPA: 4-year B.Tech/BE = 160 credits (~240 ECTS); 3-year Bachelor = 120 credits (~180 ECTS).',
    },
    {
      id: 'fr_20',
      label: 'France / Portugal — 0–20 Scale (Pass 10/20)',
      systemLabel: 'Numerical Scale (0–20)',
      max: 20.0,
      min: 10.0,
      sample: 15.2,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 28,
      ectsMultiplier: 1.0,
      explainer:
        'France (0–20 Scale): Très Bien (16–20), Bien (14–15.9), Assez Bien (12–13.9), Passable (10–11.9). 60 ECTS/year.',
    },
    {
      id: 'nl_10',
      label: 'Netherlands / Spain — 0–10 Scale (Pass 5.5/10)',
      systemLabel: 'Numerical Scale (0–10)',
      max: 10.0,
      min: 5.5,
      sample: 7.8,
      semesters: 6,
      credits: 180,
      weeks: 16,
      hoursPerCredit: 28,
      ectsMultiplier: 1.0,
      explainer:
        'Netherlands (1–10 Scale): 8.0+ is Cum Laude / Distinction level; 5.5 is the minimum passing mark. 60 ECTS/year.',
    },
    {
      id: 'it_30',
      label: 'Italy — 18–30 Scale (Pass 18/30, 30L = Max)',
      systemLabel: 'Numerical Scale (18–30)',
      max: 30.0,
      min: 18.0,
      sample: 27.5,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 25,
      ectsMultiplier: 1.0,
      explainer:
        'Italy (CFU / 30-Point Scale): Exams graded 18–30 (30 e lode = highest). 180 CFU = 180 ECTS for Laurea.',
    },
  ],
  inverted: [
    {
      id: 'de_5',
      label: 'Germany — 1.0 to 5.0 Inverted Scale (1.0 Best, 4.0 Pass)',
      systemLabel: 'Inverted Scale (Lower = Better)',
      max: 1.0,
      min: 4.0,
      sample: 1.7,
      inverted: true,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 30,
      ectsMultiplier: 1.0,
      explainer:
        'Germany (1.0–5.0): 1.0–1.5 Sehr Gut (Very Good), 1.6–2.5 Gut (Good), 2.6–3.5 Befriedigend, 3.6–4.0 Ausreichend (Pass).',
    },
    {
      id: 'at_5',
      label: 'Austria — 1 to 5 Inverted Scale (1 Best, 4 Pass)',
      systemLabel: 'Inverted Scale (Lower = Better)',
      max: 1.0,
      min: 4.0,
      sample: 1.6,
      inverted: true,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 25,
      ectsMultiplier: 1.0,
      explainer:
        'Austria (1–5 Scale): 1 = Sehr Gut, 2 = Gut, 3 = Befriedigend, 4 = Genügend (Pass), 5 = Nicht Genügend (Fail).',
    },
    {
      id: 'cz_4',
      label: 'Czechia / Slovakia — 1 to 4 Scale (1 Best, 3 Pass)',
      systemLabel: 'Inverted Scale (Lower = Better)',
      max: 1.0,
      min: 3.0,
      sample: 1.5,
      inverted: true,
      semesters: 6,
      credits: 180,
      weeks: 15,
      hoursPerCredit: 28,
      ectsMultiplier: 1.0,
      explainer:
        'Czechia / Slovakia (1–4 Scale): 1 (Výborně / Excellent), 2 (Velmi dobře), 3 (Dobře / Pass), 4 (Nevyhověl / Fail).',
    },
  ],
};

const TARGET_COUNTRIES: Record<TargetCountryKey, TargetCountryConfig> = {
  uk: {
    key: 'uk',
    shortLabel: 'UK Class',
    dropdownLabel: 'United Kingdom — Honours Class (1st, 2:1, 2:2) & UK CATS Credits',
    headerTitle: 'United Kingdom · Honours Classification',
    creditLabel: 'Converted UK CATS Credits',
    creditUnit: 'UK Credits',
    ectsFactor: 2.0,
    workTitle: 'Legal Student Working Hours in UK (Student Visa)',
    workMain: '20 hrs/week during term-time · Full-time (40+ hrs/week) during vacations',
    workNote: 'Applies to full-time degree-level (RQF Level 6+) students at licensed UK universities.',
  },
  usa: {
    key: 'usa',
    shortLabel: 'USA 4.0',
    dropdownLabel: 'United States — 4.0 GPA Scale & US Semester Credits',
    headerTitle: 'United States · 4.0 GPA Scale (WES Standard)',
    creditLabel: 'Converted US Semester Credit Hours',
    creditUnit: 'US Credits',
    ectsFactor: 0.5,
    workTitle: 'Legal Student Working Hours in USA (F-1 Visa)',
    workMain: '20 hrs/week on-campus during semester · Full-time (40+ hrs/week) during breaks',
    workNote:
      'Off-campus work requires CPT/OPT authorization after completing one full academic year.',
  },
  canada: {
    key: 'canada',
    shortLabel: 'Canada',
    dropdownLabel: 'Canada — 4.0 / 4.33 GPA, Letter Grade & Canadian Credits',
    headerTitle: 'Canada · 4.0 GPA & Letter Grade Scale',
    creditLabel: 'Converted Canadian University Credits',
    creditUnit: 'CA Credits',
    ectsFactor: 0.5,
    workTitle: 'Legal Student Working Hours in Canada (Study Permit)',
    workMain: 'Up to 24 hrs/week off-campus during academic terms · Full-time on breaks',
    workNote:
      'Applies to full-time students enrolled at a Designated Learning Institution (DLI).',
  },
  australia: {
    key: 'australia',
    shortLabel: 'Australia',
    dropdownLabel: 'Australia — 7.0 GPA (HD, D, Cr, P) & AU Credit Points',
    headerTitle: 'Australia · 7.0 GPA & Descriptive Band Scale',
    creditLabel: 'Converted Australian Credit Points (EFTSL)',
    creditUnit: 'AU Credit Points',
    ectsFactor: 0.8,
    workTitle: 'Legal Student Working Hours in Australia (Subclass 500)',
    workMain: '48 hours per fortnight (24 hrs/week avg) during study periods',
    workNote: 'Unlimited working hours permitted during official scheduled semester breaks.',
  },
  ireland: {
    key: 'ireland',
    shortLabel: 'Ireland',
    dropdownLabel: 'Ireland — NQAI Honours (1H, 2H1, 2H2) & ECTS Credits',
    headerTitle: 'Ireland · NQAI Honours Classification (1H / 2H1 / 2H2)',
    creditLabel: 'Converted Irish / ECTS Credits',
    creditUnit: 'ECTS',
    ectsFactor: 1.0,
    workTitle: 'Legal Student Working Hours in Ireland (Stamp 2)',
    workMain: '20 hrs/week during term-time · 40 hrs/week during holiday periods',
    workNote: 'Holiday full-time work applies from June–September and Dec 15–Jan 15.',
  },
  nz: {
    key: 'nz',
    shortLabel: 'NZ 9.0',
    dropdownLabel: 'New Zealand — 9.0 GPA Scale (A+ to C-) & NZ Credits',
    headerTitle: 'New Zealand · 9.0 GPA Scale (A+ = 9, B+ = 6, C- = 1)',
    creditLabel: 'Converted New Zealand Academic Credits',
    creditUnit: 'NZ Credits',
    ectsFactor: 2.0,
    workTitle: 'Legal Student Working Hours in New Zealand',
    workMain: '20 hrs/week during semester · Full-time during scheduled summer holidays',
    workNote:
      'Master’s by research and PhD students in New Zealand have unlimited work rights.',
  },
  singapore: {
    key: 'singapore',
    shortLabel: 'Singapore',
    dropdownLabel: 'Singapore — 5.0 CAP / GPA Scale & Modular Credits (MCs)',
    headerTitle: 'Singapore · 5.0 CAP / GPA Scale (NUS / NTU Standard)',
    creditLabel: 'Converted Singapore Modular Credits (MCs / AUs)',
    creditUnit: 'Modular Credits',
    ectsFactor: 0.667,
    workTitle: 'Legal Student Working Hours in Singapore (Student Pass)',
    workMain: '16 hrs/week during term-time · Full-time during official vacation periods',
    workNote:
      'Applies to full-time matriculated students at approved Singapore institutions (NUS, NTU, SMU).',
  },
};

const TARGET_COUNTRY_LIST: TargetCountryConfig[] = [
  TARGET_COUNTRIES.uk,
  TARGET_COUNTRIES.usa,
  TARGET_COUNTRIES.canada,
  TARGET_COUNTRIES.australia,
  TARGET_COUNTRIES.ireland,
  TARGET_COUNTRIES.nz,
  TARGET_COUNTRIES.singapore,
];

interface UniversityGradeConverterProps {
  onNavigate?: (view: string) => void;
}

export default function UniversityGradeConverter({ onNavigate }: UniversityGradeConverterProps) {
  const defaultPreset = PRESETS_BY_ARCHETYPE.gpa[0];

  const [archetype, setArchetype] = useState<ArchetypeKey>('gpa');
  const [presetId, setPresetId] = useState<string>(defaultPreset.id);
  const [targetCountry, setTargetCountry] = useState<TargetCountryKey>('uk');
  const [gradingPolicy, setGradingPolicy] = useState<GradingPolicy>('absolute');

  // Numeric Inputs (stored as strings so typing decimals like "3." is smooth)
  const [nMaxInput, setNMaxInput] = useState<string>(String(defaultPreset.max));
  const [nMinInput, setNMinInput] = useState<string>(String(defaultPreset.min));
  const [nObtainedInput, setNObtainedInput] = useState<string>(String(defaultPreset.sample));

  // Workload & Credits Inputs
  const [numSemestersInput, setNumSemestersInput] = useState<string>(
    String(defaultPreset.semesters)
  );
  const [totalCreditsInput, setTotalCreditsInput] = useState<string>(String(defaultPreset.credits));
  const [weeksPerSemInput, setWeeksPerSemInput] = useState<string>(String(defaultPreset.weeks));

  // Copy & PDF Modal States
  const [copied, setCopied] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfStudentName, setPdfStudentName] = useState<string>('');
  const [pdfHomeProgram, setPdfHomeProgram] = useState<string>('');
  const [pdfTargetProgram, setPdfTargetProgram] = useState<string>('');
  const [logoImgFailed, setLogoImgFailed] = useState<boolean>(false);

  // Stable reference ID per session for the printed A4 equivalence report
  const [reportMeta] = useState(() => {
    const year = new Date().getFullYear();
    const code = Math.floor(100000 + Math.random() * 900000);
    const issuedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      reportId: `UT-${year}-${code}`,
      issuedDate,
    };
  });

  const currentPresets = PRESETS_BY_ARCHETYPE[archetype];
  const activePreset = useMemo(
    () => currentPresets.find((p) => p.id === presetId) || currentPresets[0],
    [currentPresets, presetId]
  );

  const applyPresetValues = (preset: CountryPreset) => {
    setPresetId(preset.id);
    setNMaxInput(String(preset.max));
    setNMinInput(String(preset.min));
    setNObtainedInput(String(preset.sample));
    setNumSemestersInput(String(preset.semesters));
    setTotalCreditsInput(String(preset.credits));
    setWeeksPerSemInput(String(preset.weeks));
  };

  const handleSelectArchetype = (nextArch: ArchetypeKey) => {
    setArchetype(nextArch);
    const firstPreset = PRESETS_BY_ARCHETYPE[nextArch][0];
    applyPresetValues(firstPreset);
  };

  const handleSelectPreset = (nextId: string) => {
    const found = currentPresets.find((p) => p.id === nextId);
    if (found) {
      applyPresetValues(found);
    }
  };

  // Core 6-System Academic Grade & Credit Calculation Engine
  const conversion = useMemo(() => {
    const nMax = parseFloat(nMaxInput);
    const nMin = parseFloat(nMinInput);
    const nObt = parseFloat(nObtainedInput);
    const isInverted = Boolean(activePreset.inverted);

    let validationError: string | null = null;
    if (Number.isNaN(nMax) || Number.isNaN(nMin) || Number.isNaN(nObt)) {
      validationError = 'Enter numeric values for Max Grade, Min Pass, and Your Score.';
    } else if (!isInverted && (nMax <= nMin || nObt > nMax || nObt < 0)) {
      validationError = `Enter a valid score between 0 and ${nMax} (with Max Grade greater than Min Pass ${nMin}).`;
    } else if (isInverted && (nMin <= nMax || nObt < nMax || nObt > nMin + 1)) {
      validationError = `For inverted scales, enter a score between ${nMax} (best) and ${
        nMin + 1
      } (fail), with Min Pass numeric value greater than Best Grade.`;
    }

    const safeMax = Number.isNaN(nMax) ? activePreset.max : nMax;
    const safeMin = Number.isNaN(nMin) ? activePreset.min : nMin;
    const safeObt = Number.isNaN(nObt) ? activePreset.sample : nObt;

    // Normalize passing performance ratio (< 0 = fail, 0 = minimum pass, 1 = top possible score)
    let rawPassProgress: number;
    if (isInverted) {
      const denom = safeMin - safeMax || 1;
      rawPassProgress =
        safeObt > safeMin ? -((safeObt - safeMin) / denom) : (safeMin - safeObt) / denom;
    } else {
      const denom = safeMax - safeMin || 1;
      rawPassProgress = (safeObt - safeMin) / denom;
    }

    let passProgress = Math.min(1, rawPassProgress);
    if (gradingPolicy === 'relative' && passProgress >= 0) {
      passProgress = Math.min(1.0, passProgress + 0.04);
    }

    const clampedPass = Math.max(0, passProgress);
    const isFailing = passProgress < 0;

    // Modified Bavarian Equivalence (1.0 best -> 4.0 min pass -> 5.0 fail)
    const germanVal = isFailing
      ? Math.min(5.0, 4.0 + Math.abs(passProgress))
      : Math.max(1.0, Math.min(4.0, 1 + 3 * (1 - clampedPass)));

    const us4Val = isFailing
      ? Math.max(
          0,
          isInverted
            ? Math.max(0, 2.0 * (1 - (safeObt - safeMin)))
            : (safeObt / Math.max(0.01, safeMin)) * 2.0
        )
      : Math.max(0, Math.min(4.0, 2.0 + 2.0 * clampedPass));

    const au7Num = isFailing ? Math.max(1.0, 4.0 + passProgress * 3.0) : 4.0 + clampedPass * 3.0;
    const nz9Num = isFailing ? 0 : 1.0 + clampedPass * 8.0;
    const sg5Num = isFailing ? Math.max(0, 2.0 + passProgress * 2.0) : 2.0 + clampedPass * 3.0;

    const au7Val = au7Num.toFixed(2);
    const nz9Val = nz9Num.toFixed(2);
    const sg5Val = sg5Num.toFixed(2);

    // ECTS Letter Grade Equivalence
    let ectsBand = 'ECTS Grade E (Sufficient)';
    let ectsShort = 'Grade E';
    if (isFailing) {
      ectsBand = 'ECTS Grade F / FX (Fail)';
      ectsShort = 'Fail (F)';
    } else if (passProgress >= 0.82) {
      ectsBand = 'ECTS Grade A (Top 10%)';
      ectsShort = 'Grade A';
    } else if (passProgress >= 0.65) {
      ectsBand = 'ECTS Grade B (Next 25%)';
      ectsShort = 'Grade B';
    } else if (passProgress >= 0.45) {
      ectsBand = 'ECTS Grade C (Next 30%)';
      ectsShort = 'Grade C';
    } else if (passProgress >= 0.25) {
      ectsBand = 'ECTS Grade D (Next 25%)';
      ectsShort = 'Grade D';
    }

    // UK Classification
    let ukShort = '3rd Class';
    let ukFull = 'Third-Class Honours (3rd)';
    const ukPct = isFailing ? 35 : Math.round(40 + clampedPass * 45);
    if (isFailing) {
      ukShort = 'Fail';
      ukFull = 'Below Honours Pass (<40%)';
    } else if (germanVal <= 1.6) {
      ukShort = 'First (1st)';
      ukFull = 'First-Class Honours (1st)';
    } else if (germanVal <= 2.4) {
      ukShort = '2:1 Class';
      ukFull = 'Upper Second-Class Honours (2:1)';
    } else if (germanVal <= 3.2) {
      ukShort = '2:2 Class';
      ukFull = 'Lower Second-Class Honours (2:2)';
    }

    // Destination-specific primary display
    const target = TARGET_COUNTRIES[targetCountry];
    let convertedGradeBig = '';
    let convertedClassification = '';
    let formulaUsed = '';
    let targetAdmissionNote = '';

    const caLetter = isFailing
      ? 'F'
      : us4Val >= 3.8
      ? 'A / A+'
      : us4Val >= 3.5
      ? 'A-'
      : us4Val >= 3.0
      ? 'B+'
      : us4Val >= 2.7
      ? 'B'
      : 'C+';

    const ieShort = isFailing
      ? 'Fail'
      : germanVal <= 1.6
      ? '1H'
      : germanVal <= 2.4
      ? '2H1'
      : germanVal <= 3.2
      ? '2H2'
      : 'Pass';

    const ieFull = isFailing
      ? 'Below Honours Pass'
      : germanVal <= 1.6
      ? '1H (First-Class Honours)'
      : germanVal <= 2.4
      ? '2H1 (Second-Class Honours, Grade 1)'
      : germanVal <= 3.2
      ? '2H2 (Second-Class Honours, Grade 2)'
      : 'Pass Honours';

    if (targetCountry === 'uk') {
      convertedGradeBig = ukShort;
      convertedClassification = `${ukFull} (~${ukPct}% UK equiv.)`;
      formulaUsed = `UK ENIC Equivalence from ${safeObt}/${safeMax} (${
        gradingPolicy === 'relative' ? 'Bell-Curve Adjusted' : 'Absolute'
      })`;
      targetAdmissionNote =
        'Most Russell Group & UK Master’s programs require a 2:1 (Upper Second-Class) or strong 2:2.';
    } else if (targetCountry === 'usa') {
      convertedGradeBig = `${us4Val.toFixed(2)} / 4.0`;
      convertedClassification = isFailing
        ? 'Below Passing Threshold (<2.0)'
        : us4Val >= 3.7
        ? 'Summa / Magna Cum Laude (A)'
        : us4Val >= 3.3
        ? 'Dean’s List Standing (B+ / A-)'
        : us4Val >= 3.0
        ? 'Good Graduate Standing (B)'
        : 'Satisfactory Passing Standing';
      formulaUsed = `WES Passing Normalization: 2.0 + 2.0 × Pass Ratio (${(
        clampedPass * 100
      ).toFixed(0)}%)`;
      targetAdmissionNote =
        'US universities typically require a minimum 3.00 / 4.00 GPA (and 3.5+ for top PhD/fellowship funding).';
    } else if (targetCountry === 'canada') {
      convertedGradeBig = `${us4Val.toFixed(2)} / 4.0`;
      convertedClassification = isFailing
        ? 'Below Passing Standing (F)'
        : `Canadian Grade ${caLetter} (~${Math.round(50 + clampedPass * 42)}%)`;
      formulaUsed = 'Canadian 4.0 Scale Conversion (B+ = 3.30, A- = 3.70, A = 4.00)';
      targetAdmissionNote =
        'Most Canadian Master’s programs (UofT, UBC, Waterloo) require at least a B+ (3.30/4.0) in the final 2 years.';
    } else if (targetCountry === 'australia') {
      convertedGradeBig = `${au7Val} / 7.0`;
      convertedClassification = isFailing
        ? 'Fail (N / <50%)'
        : au7Num >= 6.5
        ? 'High Distinction (HD)'
        : au7Num >= 5.5
        ? 'Distinction (D)'
        : au7Num >= 4.5
        ? 'Credit (Cr)'
        : 'Pass (P)';
      formulaUsed = 'Australian 7.0 Descriptive Band Scale (4.0 Pass → 7.0 High Distinction)';
      targetAdmissionNote =
        'Group of Eight (Go8) Australian universities typically require a Credit (5.0+) or Distinction (6.0+) average.';
    } else if (targetCountry === 'ireland') {
      convertedGradeBig = ieShort;
      convertedClassification = ieFull;
      formulaUsed = 'Irish NQAI Honours Framework (1H ≥ 70%, 2H1 = 60–69%, 2H2 = 50–59%)';
      targetAdmissionNote =
        'Trinity College Dublin, UCD, and University of Galway generally require a 2H1 (Upper Second-Class) for Master’s entry.';
    } else if (targetCountry === 'nz') {
      convertedGradeBig = `${nz9Val} / 9.0`;
      convertedClassification = isFailing
        ? 'Fail (D / E)'
        : nz9Num >= 8.0
        ? 'A+ / A (First Class)'
        : nz9Num >= 6.5
        ? 'A- / B+ (Second Class Div I)'
        : nz9Num >= 5.0
        ? 'B / B- (Second Class Div II)'
        : 'C+ / C (Pass)';
      formulaUsed = 'New Zealand 9.0 Scale (9 = A+, 8 = A, 7 = A-, 6 = B+, 5 = B, 1 = C- Pass)';
      targetAdmissionNote =
        'University of Auckland and Otago typically require a B or B+ average (5.0–6.0 / 9.0) for postgraduate admission.';
    } else {
      convertedGradeBig = `${sg5Val} / 5.0`;
      convertedClassification = isFailing
        ? 'Below Pass (<2.0 CAP)'
        : sg5Num >= 4.5
        ? 'Honours (Highest Distinction)'
        : sg5Num >= 4.0
        ? 'Honours (Distinction)'
        : sg5Num >= 3.5
        ? 'Honours (Merit)'
        : 'Pass';
      formulaUsed = 'Singapore 5.0 CAP Scale (5.0 = A+/A, 4.5 = A-, 4.0 = B+, 3.5 = B, 2.0 = Pass)';
      targetAdmissionNote =
        'NUS & NTU postgraduate programs typically look for at least Honours (Distinction) / 4.0+ out of 5.0.';
    }

    // Credits & Study Workload Hours
    const sems = Math.max(1, parseInt(numSemestersInput, 10) || activePreset.semesters);
    const credits = Math.max(1, parseFloat(totalCreditsInput) || activePreset.credits);
    const weeks = Math.max(1, parseInt(weeksPerSemInput, 10) || activePreset.weeks);

    const estEcts = Math.round(credits * activePreset.ectsMultiplier);
    const targetCredits = Math.round(credits * activePreset.ectsMultiplier * target.ectsFactor);
    const perSemCredits = (targetCredits / sems).toFixed(1);

    const totalStudyHrs = Math.round(credits * activePreset.hoursPerCredit);
    const weeklyStudyHrs = (totalStudyHrs / (sems * weeks)).toFixed(1);

    return {
      validationError,
      safeMax,
      safeMin,
      safeObt,
      isFailing,
      germanVal,
      us4Val,
      ectsBand,
      ectsShort,
      target,
      convertedGradeBig,
      convertedClassification,
      formulaUsed,
      targetAdmissionNote,
      sems,
      credits,
      weeks,
      estEcts,
      targetCredits,
      perSemCredits,
      totalStudyHrs,
      weeklyStudyHrs,
      snapshots: {
        uk: ukShort,
        usa: us4Val.toFixed(2),
        canada: isFailing ? `${us4Val.toFixed(2)} (F)` : `${us4Val.toFixed(2)} (${caLetter})`,
        australia: `${au7Val} / 7.0`,
        ireland: ieShort,
        nz: `${nz9Val} / 9.0`,
        singapore: `${sg5Val} / 5.0`,
        ects: ectsShort,
      },
    };
  }, [
    nMaxInput,
    nMinInput,
    nObtainedInput,
    activePreset,
    gradingPolicy,
    targetCountry,
    numSemestersInput,
    totalCreditsInput,
    weeksPerSemInput,
  ]);

  const handleCopyReport = async () => {
    const summary = [
      'Universal Academic Grade & Credit Conversion (University-Tutors.com)',
      `From: ${activePreset.label}`,
      `Score: ${conversion.safeObt} / ${conversion.safeMax} (Min Pass: ${conversion.safeMin})`,
      `To: ${conversion.target.dropdownLabel}`,
      `Converted Grade: ${conversion.convertedGradeBig} (${conversion.convertedClassification}) · ${conversion.ectsBand}`,
      `Converted Credits: ${conversion.targetCredits} ${conversion.target.creditUnit} (~${conversion.estEcts} ECTS) · Total Study Workload: ${conversion.totalStudyHrs.toLocaleString()} hrs`,
      `Student Work Allowance: ${conversion.target.workMain}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const applicantDisplay = pdfStudentName.trim() || 'Prospective International Applicant';
  const homeProgramDisplay =
    pdfHomeProgram.trim() || 'Undergraduate / Graduate University Qualification';
  const targetProgramDisplay =
    pdfTargetProgram.trim() || 'International University Admission';
  const policyPrintLabel =
    gradingPolicy === 'relative'
      ? 'Relative (Bell-Curve / Cohort Rank Adjusted)'
      : 'Absolute (Fixed Institutional Cut-Offs)';

  const handleDownloadPdfReport = () => {
    downloadGradeEquivalencePdf({
      reportId: reportMeta.reportId,
      issuedDate: reportMeta.issuedDate,
      applicantName: applicantDisplay,
      homeProgram: homeProgramDisplay,
      targetProgram: targetProgramDisplay,
      gradingPolicyLabel: policyPrintLabel,
      sourceSystemLabel: activePreset.label,
      obtainedScore: `${conversion.safeObt} / ${conversion.safeMax}`,
      minPassScore: String(conversion.safeMin),
      destinationLabel: conversion.target.dropdownLabel,
      convertedGradeBig: conversion.convertedGradeBig,
      convertedClassification: conversion.convertedClassification,
      ectsBand: `${conversion.ectsBand} · Bavarian ${conversion.germanVal.toFixed(2)}`,
      formulaUsed: conversion.formulaUsed,
      creditLabel: conversion.target.creditLabel,
      targetCreditsText: `${conversion.targetCredits} ${conversion.target.creditUnit}`,
      perSemCreditsText: `~${conversion.perSemCredits} ${conversion.target.creditUnit}/sem (${conversion.sems} sems · ~${conversion.estEcts} ECTS)`,
      totalStudyHoursText: `${conversion.totalStudyHrs.toLocaleString()} hrs`,
      weeklyStudyHoursText: `~${conversion.weeklyStudyHrs} hrs/week (${conversion.weeks} wks/sem)`,
      workAllowanceMain: conversion.target.workMain,
      workAllowanceNote: conversion.target.workNote,
      snapshots: conversion.snapshots,
    });
    setIsPdfModalOpen(false);
  };

  return (
    <div id="grade-converter-page" className="space-y-6">
      {/* ===================================================================== */}
      {/* INTERACTIVE SCREEN WORKSPACE (Hidden during A4 Print / Save as PDF)   */}
      {/* ===================================================================== */}
      <div className="space-y-6 print:hidden">
        {/* Step 1: Visual 6 Grading System Archetypes Selector */}
        <section className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-display font-bold text-[#111827]">
                01. Choose Your Home University’s Grading System Type
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select one of the 6 world academic grading archetypes or pick a country preset in Step 02
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Covers 99% of global universities · 21 country presets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {ARCHETYPES.map((item) => {
              const isSelected = archetype === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectArchetype(item.key)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#F97316] bg-[#FFF7ED]/70 ring-1 ring-[#F97316]/30'
                      : 'border-slate-200 bg-[#FFFFFF] hover:border-orange-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#EA580C]' : 'text-[#111827]'
                      }`}
                    >
                      {item.numberLabel}. {item.title}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 tabular-nums whitespace-nowrap shrink-0">
                      {item.scaleHint}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                    {item.countriesSummary}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Specific Country Preset -> Target English-Speaking Study Destination */}
        <section className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label
                htmlFor="from-country-preset"
                className="block text-xs font-bold text-slate-700"
              >
                02A. Specific Home Country / University Preset
              </label>
              <select
                id="from-country-preset"
                value={activePreset.id}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] px-3.5 py-3 text-sm font-semibold text-[#111827] focus:border-[#F97316] focus:bg-[#FFFFFF] focus:outline-none cursor-pointer"
              >
                {currentPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex justify-center pb-1">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-orange-200 text-[#EA580C] flex items-center justify-center shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label
                htmlFor="to-destination-country"
                className="block text-xs font-bold text-[#EA580C]"
              >
                02B. Target English-Speaking Study Country
              </label>
              <select
                id="to-destination-country"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value as TargetCountryKey)}
                className="w-full rounded-xl border-2 border-[#F97316] bg-[#FFF7ED]/40 px-3.5 py-3 text-sm font-semibold text-[#111827] focus:border-[#EA580C] focus:bg-[#FFFFFF] focus:outline-none cursor-pointer"
              >
                {TARGET_COUNTRY_LIST.map((dest) => (
                  <option key={dest.key} value={dest.key}>
                    {dest.dropdownLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Step 3: Two-Zone Sandbox — Inputs & Rigor (Left) vs Live Equivalence & Visa Workload (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN: Score Bounds, Grading Policy & Credit Workload */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            {/* Score & Institutional Grading Policy */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-display font-bold text-[#111827]">
                  03. Your Score &amp; Scale Bounds
                </h2>
                <span className="text-xs font-medium text-[#EA580C]">
                  {activePreset.systemLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                <div>
                  <label
                    htmlFor="grade-nmax"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    {activePreset.inverted ? 'Best Grade (Nmax)' : 'Max Grade (Nmax)'}
                  </label>
                  <input
                    id="grade-nmax"
                    type="number"
                    step="0.01"
                    value={nMaxInput}
                    onChange={(e) => setNMaxInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="grade-nmin"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Min Pass (Nmin)
                  </label>
                  <input
                    id="grade-nmin"
                    type="number"
                    step="0.01"
                    value={nMinInput}
                    onChange={(e) => setNMinInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="grade-nobt"
                    className="block text-xs font-bold text-[#EA580C] mb-1.5"
                  >
                    Your Score (Nd)
                  </label>
                  <input
                    id="grade-nobt"
                    type="number"
                    step="0.01"
                    value={nObtainedInput}
                    onChange={(e) => setNObtainedInput(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#F97316] bg-[#FFF7ED]/50 focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#EA580C] focus:outline-none"
                  />
                </div>
              </div>

              {conversion.validationError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-800 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{conversion.validationError}</span>
                </div>
              )}

              {/* Cross-System Concept: Absolute vs Relative (Bell-Curve) Grading */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827]">Institutional Grading Policy</span>
                  <span className="text-slate-500">Cross-System Rigor Context</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGradingPolicy('absolute')}
                    className={`py-2.5 px-3.5 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                      gradingPolicy === 'absolute'
                        ? 'border-[#F97316] bg-[#FFF7ED]/70 ring-1 ring-[#F97316]/30 text-[#111827]'
                        : 'border-slate-200 bg-[#FFFFFF] text-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-xs font-bold">Absolute Grading</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Fixed score cut-offs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGradingPolicy('relative')}
                    className={`py-2.5 px-3.5 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                      gradingPolicy === 'relative'
                        ? 'border-[#F97316] bg-[#FFF7ED]/70 ring-1 ring-[#F97316]/30 text-[#111827]'
                        : 'border-slate-200 bg-[#FFFFFF] text-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-xs font-bold">Relative (Bell Curve)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Norm-referenced cohort rank
                    </div>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {gradingPolicy === 'relative' ? (
                    <>
                      <strong className="text-[#111827]">Relative (Bell-Curve) Grading:</strong>{' '}
                      Because only the top cohort percentile earns top marks under strict curve
                      grading, credential evaluators recognize a subtle competitiveness buffer (+4%
                      cohort rank weight).
                    </>
                  ) : (
                    <>
                      <strong className="text-[#111827]">Absolute Grading:</strong> Your raw score
                      is evaluated directly against fixed institutional boundaries without cohort
                      curve adjustment.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Semesters, Credit Hours & Academic Study Workload */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-display font-bold text-[#111827]">
                  04. Semesters, Credit Hours &amp; Study Workload
                </h2>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  ~{conversion.estEcts} ECTS Total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                <div>
                  <label
                    htmlFor="num-semesters"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Semesters Done
                  </label>
                  <input
                    id="num-semesters"
                    type="number"
                    min={1}
                    max={16}
                    value={numSemestersInput}
                    onChange={(e) => setNumSemestersInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="total-credits"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Total Credits
                  </label>
                  <input
                    id="total-credits"
                    type="number"
                    min={1}
                    max={480}
                    value={totalCreditsInput}
                    onChange={(e) => setTotalCreditsInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="weeks-per-sem"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Weeks / Semester
                  </label>
                  <input
                    id="weeks-per-sem"
                    type="number"
                    min={8}
                    max={26}
                    value={weeksPerSemInput}
                    onChange={(e) => setWeeksPerSemInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-[#F9FAFB] focus:bg-[#FFFFFF] px-3.5 py-2.5 text-sm font-mono font-bold text-[#111827] focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-[#F9FAFB] border border-slate-200/80 rounded-xl p-3.5 leading-relaxed">
                <strong className="text-[#111827]">System Credit &amp; Workload Standard:</strong>{' '}
                {activePreset.explainer}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Primary Converted Grade + ECTS Bridge + Credits & Visa Working Hours */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            {/* Primary Target Country Grade Result Card */}
            <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#F97316] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>{conversion.target.headerTitle}</span>
                  </div>

                  <div className="flex items-baseline gap-3 flex-wrap pt-0.5 tabular-nums">
                    <span className="text-3xl sm:text-5xl font-display font-bold text-[#111827] tracking-tight">
                      {conversion.convertedGradeBig}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        conversion.isFailing ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {conversion.convertedClassification}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {conversion.targetAdmissionNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-xl border border-slate-200 bg-[#FFFFFF] hover:border-orange-300 hover:bg-[#FFF7ED] text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdfReport}
                    title="Instant 1-click PDF download"
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Cross-System ECTS & Modified Bavarian / WES Formula Metadata */}
              <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-slate-600 tabular-nums">
                  {conversion.formulaUsed}
                </span>
                <span className="font-semibold text-indigo-700 tabular-nums">
                  {conversion.ectsBand} · Bavarian {conversion.germanVal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Converted Credits, Study Workload & Official Student Working Hours */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-display font-bold text-[#111827]">
                  Converted Credits, Study Workload &amp; Student Visa Work Hours
                </h3>
                <span className="text-xs text-slate-500">Official Equivalence</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 tabular-nums">
                <div className="rounded-xl bg-[#FFF7ED]/70 border border-orange-200/80 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EA580C]">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>{conversion.target.creditLabel}</span>
                  </div>
                  <div className="text-xl font-display font-bold text-[#111827]">
                    {conversion.targetCredits} {conversion.target.creditUnit}
                  </div>
                  <div className="text-xs text-slate-600">
                    ~{conversion.perSemCredits} {conversion.target.creditUnit} / sem ({conversion.sems}{' '}
                    sems · ~{conversion.estEcts} ECTS)
                  </div>
                </div>

                <div className="rounded-xl bg-[#F9FAFB] border border-slate-200 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>Total Academic Study Hours</span>
                  </div>
                  <div className="text-xl font-display font-bold text-[#111827]">
                    {conversion.totalStudyHrs.toLocaleString()} hrs
                  </div>
                  <div className="text-xs text-slate-600">
                    ~{conversion.weeklyStudyHrs} hrs/week ({conversion.weeks} wks/sem contact + self)
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/90 p-4 sm:col-span-2 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{conversion.target.workTitle}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      International Student Visa Rule
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#111827] pt-0.5">
                    {conversion.target.workMain}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {conversion.target.workNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All 7 English-Speaking Destinations + ECTS Live Interactive Comparison Strip */}
        <section className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-bold text-[#111827]">
                Instant 7-Country English-Speaking Destinations &amp; ECTS Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any country below to inspect its credit conversion and student visa work rules
              </p>
            </div>
            <span className="text-xs text-slate-500">Updates live as you type</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center tabular-nums">
            {(
              [
                { key: 'uk', label: 'UK Class', value: conversion.snapshots.uk },
                { key: 'usa', label: 'USA 4.0', value: conversion.snapshots.usa },
                { key: 'canada', label: 'Canada', value: conversion.snapshots.canada },
                { key: 'australia', label: 'Australia', value: conversion.snapshots.australia },
                { key: 'ireland', label: 'Ireland', value: conversion.snapshots.ireland },
                { key: 'nz', label: 'NZ 9.0', value: conversion.snapshots.nz },
                { key: 'singapore', label: 'Singapore', value: conversion.snapshots.singapore },
              ] as const
            ).map((tile) => {
              const active = targetCountry === tile.key;
              return (
                <button
                  key={tile.key}
                  type="button"
                  onClick={() => setTargetCountry(tile.key)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#FFF7ED] border-[#F97316] ring-1 ring-[#F97316]/30'
                      : 'bg-[#F9FAFB] border-slate-200/80 hover:border-orange-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    {tile.label}
                  </div>
                  <div
                    className={`text-sm font-mono font-bold mt-1 truncate ${
                      active ? 'text-[#EA580C]' : 'text-[#111827]'
                    }`}
                  >
                    {tile.value}
                  </div>
                </button>
              );
            })}

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
              <div className="text-[11px] font-semibold text-indigo-700 whitespace-nowrap">
                ECTS Band
              </div>
              <div className="text-sm font-mono font-bold text-indigo-950 mt-1 truncate">
                {conversion.snapshots.ects}
              </div>
            </div>
          </div>
        </section>

        {/* International Admissions & Branded PDF Callout */}
        <section className="bg-[#FFF7ED] rounded-2xl border border-orange-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <p className="text-xs font-bold text-[#EA580C]">
              International Admissions &amp; Graduate Credential Guidance
            </p>
            <h3 className="text-base sm:text-lg font-display font-bold text-[#111827]">
              Applying to Universities in the UK, USA, Canada, Australia, or Ireland?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Export your branded A4 Academic Equivalence Summary PDF for self-assessment, or book
              1-on-1 SOP, academic CV, and IELTS/PTE preparation with verified mentors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-orange-300 bg-[#FFFFFF] hover:bg-orange-50 text-[#EA580C] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Customize &amp; Download PDF
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('service-essay')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Book 1-on-1 Guidance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* PDF REPORT CUSTOMIZATION MODAL                                        */}
      {/* ===================================================================== */}
      {isPdfModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-report-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 print:hidden"
        >
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white font-display font-bold flex items-center justify-center text-sm shrink-0">
                  UT
                </div>
                <div>
                  <h3
                    id="pdf-report-modal-title"
                    className="text-sm font-display font-bold text-[#111827]"
                  >
                    Official Branded PDF Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    University-Tutors.com Academic Credential Summary
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pdf-student-name"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Student Full Name (Optional)
                </label>
                <input
                  id="pdf-student-name"
                  type="text"
                  value={pdfStudentName}
                  onChange={(e) => setPdfStudentName(e.target.value)}
                  placeholder="e.g., Muhammad Ali Khan"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="pdf-home-program"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Home University / Degree Program (Optional)
                </label>
                <input
                  id="pdf-home-program"
                  type="text"
                  value={pdfHomeProgram}
                  onChange={(e) => setPdfHomeProgram(e.target.value)}
                  placeholder="e.g., BS Computer Science — NUST / University of Delhi"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="pdf-target-program"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Target University / Intake (Optional)
                </label>
                <input
                  id="pdf-target-program"
                  type="text"
                  value={pdfTargetProgram}
                  onChange={(e) => setPdfTargetProgram(e.target.value)}
                  placeholder="e.g., MSc Data Science — Autumn Intake"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#F97316] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
              Automatically generates and downloads an instant, selectable <strong>A4 Academic Equivalence PDF</strong> with the{' '}
              <strong>University-Tutors.com</strong> header, verification reference ID (
              <span className="font-mono">{reportMeta.reportId}</span>), and global 8-column benchmark
              table—no browser print dialog needed.
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownloadPdfReport}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OFFICIAL A4 BRANDED ACADEMIC EQUIVALENCE REPORT (Print / Save as PDF) */}
      {/* ===================================================================== */}
      <div
        id="grade-converter-print-report"
        className="hidden print:block text-[#111827] bg-[#FFFFFF] space-y-5 tabular-nums"
      >
        {/* Branded Report Header */}
        <div className="flex items-center justify-between border-b-2 border-[#F97316] pb-4">
          <div className="flex items-center gap-3.5">
            {!logoImgFailed ? (
              <img
                src="/logo.webp"
                alt="University-Tutors.com"
                referrerPolicy="no-referrer"
                onError={() => setLogoImgFailed(true)}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#F97316] text-white font-display font-bold flex items-center justify-center text-base">
                UT
              </div>
            )}
            <div>
              <div className="text-lg font-display font-bold text-[#111827] tracking-tight">
                University-Tutors<span className="text-[#F97316]">.com</span>
              </div>
              <div className="text-xs font-medium text-slate-600">
                International Academic Credential &amp; Grade Equivalence Report
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div className="font-mono font-bold text-[#111827]">Ref ID: {reportMeta.reportId}</div>
            <div>Issued: {reportMeta.issuedDate}</div>
            <div className="font-semibold text-[#EA580C]">www.university-tutors.com</div>
          </div>
        </div>

        {/* Applicant & Qualification Summary */}
        <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-semibold">Applicant Name: </span>
            <strong className="text-[#111827]">{applicantDisplay}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Target Program: </span>
            <strong className="text-[#111827]">{targetProgramDisplay}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Home Qualification: </span>
            <strong className="text-[#111827]">{homeProgramDisplay}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Grading Policy: </span>
            <strong className="text-[#111827]">{policyPrintLabel}</strong>
          </div>
        </div>

        {/* Primary Conversion Result Highlight */}
        <div className="bg-[#FFF7ED] border-2 border-[#F97316] rounded-xl p-5 space-y-3">
          <div className="text-[11px] font-bold text-[#EA580C]">
            Official Academic Equivalence Summary
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-700">
              <div>
                Source System: <strong className="text-[#111827]">{activePreset.label}</strong>
              </div>
              <div>
                Obtained Score:{' '}
                <strong className="text-[#111827] font-mono">
                  {conversion.safeObt} / {conversion.safeMax}
                </strong>{' '}
                (Min Pass: <span className="font-mono">{conversion.safeMin}</span>)
              </div>
              <div>
                Destination:{' '}
                <strong className="text-[#111827]">{conversion.target.dropdownLabel}</strong>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-3xl font-display font-bold text-[#111827]">
                {conversion.convertedGradeBig}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {conversion.convertedClassification}
              </div>
              <div className="text-xs font-semibold text-indigo-800">{conversion.ectsBand}</div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-orange-200 text-[11px] text-slate-600 font-mono">
            Methodology: {conversion.formulaUsed}
          </div>
        </div>

        {/* Credits, Workload & Visa Working Allowance */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-500 font-semibold">{conversion.target.creditLabel}</div>
            <div className="text-base font-bold text-[#111827]">
              {conversion.targetCredits} {conversion.target.creditUnit} (~{conversion.estEcts} ECTS)
            </div>
            <div className="text-slate-600">
              ~{conversion.perSemCredits} {conversion.target.creditUnit} / semester ({conversion.sems}{' '}
              semesters)
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-500 font-semibold">Total Academic Study Workload</div>
            <div className="text-base font-bold text-[#111827]">
              {conversion.totalStudyHrs.toLocaleString()} hours
            </div>
            <div className="text-slate-600">
              ~{conversion.weeklyStudyHrs} hrs/week ({conversion.weeks} weeks/semester)
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs space-y-1">
          <div className="font-bold text-emerald-900">
            Destination International Student Work Allowance
          </div>
          <div className="font-bold text-[#111827]">{conversion.target.workMain}</div>
          <div className="text-slate-700">{conversion.target.workNote}</div>
        </div>

        {/* Multi-Country Benchmark Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#111827]">
            Global English-Speaking Destinations &amp; ECTS Benchmark Table
          </div>
          <table className="w-full border-collapse text-xs text-center">
            <thead>
              <tr className="bg-[#111827] text-white">
                <th className="py-2 px-2 border border-slate-700">UK Honours</th>
                <th className="py-2 px-2 border border-slate-700">USA (4.0)</th>
                <th className="py-2 px-2 border border-slate-700">Canada</th>
                <th className="py-2 px-2 border border-slate-700">Australia (7.0)</th>
                <th className="py-2 px-2 border border-slate-700">Ireland</th>
                <th className="py-2 px-2 border border-slate-700">NZ (9.0)</th>
                <th className="py-2 px-2 border border-slate-700">Singapore (5.0)</th>
                <th className="py-2 px-2 border border-slate-700">ECTS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#F9FAFB] font-mono font-bold text-[#111827]">
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.uk}</td>
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.usa}</td>
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.canada}</td>
                <td className="py-2.5 px-2 border border-slate-200">
                  {conversion.snapshots.australia}
                </td>
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.ireland}</td>
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.nz}</td>
                <td className="py-2.5 px-2 border border-slate-200">
                  {conversion.snapshots.singapore}
                </td>
                <td className="py-2.5 px-2 border border-slate-200">{conversion.snapshots.ects}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4 text-[10px] text-slate-500">
          <p className="max-w-lg leading-relaxed">
            <strong className="text-slate-700">Disclaimer:</strong> Generated via
            University-Tutors.com using internationally recognized linear passing-ratio and modified
            Bavarian equivalence formulas for preliminary self-assessment. Official admission
            decisions rest with each university’s credential evaluation office.
          </p>
          <div className="text-right font-bold text-[#EA580C] whitespace-nowrap">
            SOP, CV &amp; IELTS Mentorship
            <br />
            <span className="text-[#111827]">www.university-tutors.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
