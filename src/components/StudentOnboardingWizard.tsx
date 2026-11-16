import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Menu,
  MessageCircle,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  ClipboardList,
  CheckSquare,
  Award,
  Layers,
  MonitorPlay,
  PenTool,
  Code2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

export type OnboardingPathwayId =
  | '1-1-lesson'
  | 'assignment'
  | 'coursework'
  | 'writing'
  | 'online-assignments-homework-help'
  | 'online-quizzes-assessments'
  | 'online-exams-tests-midterms-finals'
  | 'online-coursework'
  | 'online-classes'
  | 'protected-exam'
  | 'writing-services'
  | 'it-project-assistance'
  | 'online-phd-classes-management';

export interface StudentOnboardingSubmitPayload {
  studentId: string;
  title: string;
  subject: string;
  deadline: string;
  wordCount: number;
  referenceStyle: string;
  sourcesCount: number;
  instructions: string;
  tutorId?: string;
  fileUrls: string[];
  fileNames: string[];
}

interface StudentOnboardingWizardProps {
  currentUser: User;
  tutors: User[];
  onSubmitAssignment: (data: StudentOnboardingSubmitPayload) => Promise<any> | void;
  onOpenChat: (tutorId: string, initialMessage?: string) => any;
  onOpenWhatsApp?: () => void;
  onOpenMenu?: () => void;
  onExit?: () => void;
  onSelectChatId?: (chatId: string) => void;
  onGoToChat?: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

interface PathwayOption {
  id: OnboardingPathwayId;
  title: string;
  description: string;
  meta: string;
  durationLabel: string;
  durationUnit: string;
  durationDefault: number;
  durationOptions: number[];
}

const PATHWAY_OPTIONS: PathwayOption[] = [
  {
    id: '1-1-lesson',
    title: '1-on-1 Live Tutoring',
    description: 'Live webcam & whiteboard sessions',
    meta: 'Instant Match',
    durationLabel: 'Preferred Session Length',
    durationUnit: 'Hour(s)',
    durationDefault: 1,
    durationOptions: [1, 2, 3, 4],
  },
  {
    id: 'assignment',
    title: 'Assignment Tutoring',
    description: 'Step-by-step drafts & APA/MLA checks',
    meta: 'Under 15 mins',
    durationLabel: 'Target Turnaround Window',
    durationUnit: 'Day(s)',
    durationDefault: 3,
    durationOptions: [1, 3, 5, 7],
  },
  {
    id: 'coursework',
    title: 'Coursework Tutoring',
    description: 'Weekly syllabus & exam prep mentoring',
    meta: 'Weekly Plan',
    durationLabel: 'Study Plan Duration',
    durationUnit: 'Week(s)',
    durationDefault: 4,
    durationOptions: [2, 4, 8, 12],
  },
  {
    id: 'writing',
    title: 'Academic Writing Coach',
    description: 'Thesis structure, citations & grammar',
    meta: '24h Turnaround',
    durationLabel: 'Estimated Document Scope',
    durationUnit: 'Page(s)',
    durationDefault: 5,
    durationOptions: [3, 5, 10, 15],
  },
  {
    id: 'online-assignments-homework-help',
    title: 'Online assignments/Homework HELP',
    description: 'Guided homework solutions & problem sets',
    meta: 'Fast Help',
    durationLabel: 'Target Turnaround Window',
    durationUnit: 'Day(s)',
    durationDefault: 3,
    durationOptions: [1, 3, 5, 7],
  },
  {
    id: 'online-quizzes-assessments',
    title: 'Online Quizzes/Assessments',
    description: 'Quiz prep, practice drills & walkthroughs',
    meta: 'Score Boost',
    durationLabel: 'Prep Session Window',
    durationUnit: 'Hour(s)',
    durationDefault: 2,
    durationOptions: [1, 2, 3, 4],
  },
  {
    id: 'online-exams-tests-midterms-finals',
    title: 'Online exams/tests/midterms/finals',
    description: 'Intensive revision for midterms & finals',
    meta: 'Priority Match',
    durationLabel: 'Revision Sprint Scope',
    durationUnit: 'Hour(s)',
    durationDefault: 3,
    durationOptions: [2, 3, 5, 8],
  },
  {
    id: 'online-coursework',
    title: 'Online coursework',
    description: 'Weekly modules, labs & syllabus tracking',
    meta: 'Weekly Support',
    durationLabel: 'Coursework Duration',
    durationUnit: 'Week(s)',
    durationDefault: 4,
    durationOptions: [2, 4, 8, 12],
  },
  {
    id: 'online-classes',
    title: 'Online Classes',
    description: 'Full-term lectures & discussion coaching',
    meta: 'Full Term',
    durationLabel: 'Class Coverage',
    durationUnit: 'Week(s)',
    durationDefault: 8,
    durationOptions: [4, 8, 12, 16],
  },
  {
    id: 'protected-exam',
    title: 'Protected exam',
    description: 'High-focus readiness & proctored exam prep',
    meta: 'Expert Prep',
    durationLabel: 'Exam Prep Hours',
    durationUnit: 'Hour(s)',
    durationDefault: 2,
    durationOptions: [1, 2, 4, 6],
  },
  {
    id: 'writing-services',
    title: 'Writing Services',
    description: 'Essays, research papers & APA/MLA editing',
    meta: '24h Turnaround',
    durationLabel: 'Estimated Document Scope',
    durationUnit: 'Page(s)',
    durationDefault: 5,
    durationOptions: [3, 5, 10, 15],
  },
  {
    id: 'it-project-assistance',
    title: 'IT Project Assistance',
    description: 'Coding, full-stack apps, SQL & debugging',
    meta: 'Tech Experts',
    durationLabel: 'Project Milestone Scope',
    durationUnit: 'Day(s)',
    durationDefault: 5,
    durationOptions: [2, 5, 7, 14],
  },
  {
    id: 'online-phd-classes-management',
    title: 'Online PhD Classes/Online Classes Management',
    description: 'Doctoral seminars, pacing & research support',
    meta: 'PhD Faculty',
    durationLabel: 'Management Horizon',
    durationUnit: 'Week(s)',
    durationDefault: 8,
    durationOptions: [4, 8, 12, 16],
  },
];

const ACADEMIC_LEVELS = ['Undergraduate', "Master's", 'PhD'] as const;

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  Mathematics: ['Calculus', 'Linear Algebra', 'Statistics', 'Differential Equations'],
  Biology: ['Genetics & Punnett Squares', 'Cell Biology', 'Biochemistry', 'Anatomy'],
  Chemistry: ['Organic Chemistry', 'Stoichiometry', 'Thermodynamics', 'Titration'],
  'Computer Science': ['Python & Algorithms', 'Data Structures', 'SQL Databases', 'React / Web'],
  'Business & Finance': ['Corporate Finance', 'Financial Accounting', 'Microeconomics', 'Marketing'],
  'Essay & Humanities': ['Research Paper', 'Literature Review', 'Psychology', 'APA / MLA Editing'],
};

const URGENCY_OPTIONS = [
  { id: 'today', label: 'Today / Urgent', hint: 'Priority 1-hour match', sla: 'urgent', daysOffset: 0 },
  { id: '3-days', label: 'Within 3 Days', hint: 'Fast guided turnaround', sla: 'priority', daysOffset: 3 },
  { id: 'this-week', label: 'This Week', hint: 'Standard review cadence', sla: 'standard', daysOffset: 7 },
  { id: 'ongoing', label: 'Ongoing', hint: 'Recurring study schedule', sla: 'flexible', daysOffset: 14 },
] as const;

interface DeliverableOption {
  id: string;
  label: string;
  description: string;
}

const DELIVERABLE_OPTIONS: DeliverableOption[] = [
  {
    id: 'abstract',
    label: 'Abstract',
    description: 'Concise summary of your work.',
  },
  {
    id: 'executive-summary',
    label: 'Executive Summary',
    description: 'High-level overview for quick review.',
  },
  {
    id: 'proofread-by-editor',
    label: 'Proofread by Editor',
    description: 'Editorial pass for grammar and flow.',
  },
  {
    id: 'draft',
    label: 'Draft',
    description: 'Receive an interim draft for review.',
  },
  {
    id: 'daily-delivery-update',
    label: 'Daily Delivery Update',
    description: 'Progress updates as the work proceeds.',
  },
  {
    id: 'grammarly-report',
    label: 'Grammarly Report',
    description: 'Quality check with Grammarly.',
  },
  {
    id: 'turnitin-ai-report',
    label: 'Turnitin AI Report',
    description: 'AI detection insights.',
  },
  {
    id: 'turnitin-similarity-report',
    label: 'Turnitin Similarity Report',
    description: 'Similarity score report.',
  },
  {
    id: 'table-of-contents',
    label: 'Table of Contents',
    description: 'Structured contents page.',
  },
];

function PathwayAvatarSvg({ pathway }: { pathway: OnboardingPathwayId }) {
  if (pathway === '1-1-lesson') {
    return (
      <svg viewBox="0 0 64 64" className="w-11 h-11 drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="avatar1Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F5BA90" />
          </linearGradient>
          <linearGradient id="avatar1Shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        {/* Shoulders / Shirt */}
        <path d="M14 57 C14 45, 22 41, 32 41 C42 41, 50 45, 50 57 Z" fill="url(#avatar1Shirt)" />
        {/* Hair back */}
        <circle cx="32" cy="26" r="14.5" fill="#432818" />
        {/* Face */}
        <circle cx="32" cy="27" r="11" fill="url(#avatar1Skin)" />
        {/* Hair fringe */}
        <path d="M21 25 C22 17, 42 16, 43 25 C39 20, 26 20, 21 25 Z" fill="#5A3722" />
        {/* Eyes & Smile */}
        <circle cx="28" cy="27" r="1.4" fill="#1E293B" />
        <circle cx="36" cy="27" r="1.4" fill="#1E293B" />
        <path d="M28.5 32 Q32 34.8 35.5 32" stroke="#9A3412" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        {/* Headset band & mic */}
        <path d="M19 27 C19 16, 45 16, 45 27" stroke="#1E293B" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <rect x="16.5" y="24" width="4.5" height="8" rx="2.2" fill="#0F172A" />
        <rect x="43" y="24" width="4.5" height="8" rx="2.2" fill="#0F172A" />
        <path d="M19 31 Q21 36 28 35" stroke="#334155" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="28.5" cy="35" r="1.6" fill="#F97316" />
        {/* Green Live Play Badge */}
        <circle cx="48" cy="46" r="8.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="45.8,42.3 45.8,49.7 51.8,46" fill="#FFFFFF" />
      </svg>
    );
  }

  if (pathway === 'assignment') {
    return (
      <svg viewBox="0 0 64 64" className="w-11 h-11 drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="avatar2Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAD6B8" />
            <stop offset="100%" stopColor="#E6A97A" />
          </linearGradient>
          <linearGradient id="avatar2Coat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        {/* Shoulders */}
        <path d="M13 57 C13 46, 20 42, 30 42 C40 42, 46 46, 46 57 Z" fill="url(#avatar2Coat)" />
        {/* Face */}
        <circle cx="29" cy="29" r="10.5" fill="url(#avatar2Skin)" />
        {/* Eyes & Smile */}
        <circle cx="25.5" cy="29" r="1.35" fill="#1E293B" />
        <circle cx="32.5" cy="29" r="1.35" fill="#1E293B" />
        <path d="M26 33.5 Q29 36 32 33.5" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Graduation Cap */}
        <polygon points="29,11 45,17 29,23 13,17" fill="#0F172A" />
        <rect x="21" y="19" width="16" height="4.5" rx="1.5" fill="#1E293B" />
        <line x1="42" y1="18" x2="42" y2="26" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="42" cy="27" r="1.8" fill="#F59E0B" />
        {/* A+ Graded Paper */}
        <rect x="35" y="31" width="21" height="25" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <line x1="39" y1="45" x2="51" y2="45" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="39" y1="49.5" x2="49" y2="49.5" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <text x="45.5" y="40.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#EA580C">
          A+
        </text>
      </svg>
    );
  }

  if (pathway === 'coursework') {
    return (
      <svg viewBox="0 0 64 64" className="w-11 h-11 drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="avatar3Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#EBB080" />
          </linearGradient>
          <linearGradient id="avatar3Suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
        {/* Blue Suit & Tie */}
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#avatar3Suit)" />
        <polygon points="29,41 25,48 29,55 33,48" fill="#FFFFFF" />
        <polygon points="29,43 27.2,51 29,54.5 30.8,51" fill="#F97316" />
        {/* Hair & Face */}
        <path d="M19 25 C19 16, 39 16, 39 25 L39 27 L19 27 Z" fill="#334155" />
        <circle cx="29" cy="27.5" r="10.2" fill="url(#avatar3Skin)" />
        <circle cx="25.5" cy="27.5" r="1.35" fill="#0F172A" />
        <circle cx="32.5" cy="27.5" r="1.35" fill="#0F172A" />
        <path d="M26 32 Q29 34.5 32 32" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Checklist Tablet */}
        <rect x="36" y="30" width="20" height="26" rx="3.5" fill="#0F172A" />
        <rect x="38.5" y="33" width="15" height="20" rx="2" fill="#FFFFFF" />
        <path d="M41 38 L42.8 39.8 L45.5 36.8" stroke="#16A34A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="47.5" y1="38.5" x2="51.5" y2="38.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M41 44 L42.8 45.8 L45.5 42.8" stroke="#16A34A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="47.5" y1="44.5" x2="51.5" y2="44.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="43" cy="49.5" r="1.5" fill="#F97316" />
        <line x1="47.5" y1="49.5" x2="51.5" y2="49.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (pathway === 'writing') {
    return (
      <svg viewBox="0 0 64 64" className="w-11 h-11 drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="avatar4Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F3B88C" />
          </linearGradient>
          <linearGradient id="avatar4Sweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        {/* Green Sweater */}
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 46 45, 46 57 Z" fill="url(#avatar4Sweater)" />
        {/* Hair & Head */}
        <circle cx="29" cy="25" r="12" fill="#475569" />
        <circle cx="29" cy="27.5" r="10.2" fill="url(#avatar4Skin)" />
        {/* Glasses */}
        <rect x="21.5" y="24" width="6.5" height="5" rx="1.8" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="30" y="24" width="6.5" height="5" rx="1.8" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="28" y1="26.5" x2="30" y2="26.5" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="24.8" cy="26.5" r="1.1" fill="#0F172A" />
        <circle cx="33.2" cy="26.5" r="1.1" fill="#0F172A" />
        <path d="M26.5 32.5 Q29 34.8 31.5 32.5" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Gold Quill Feather */}
        <path d="M40 50 C41 37, 47 26, 56 20 C55 31, 50 40, 42 48 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="38" y1="53" x2="54" y2="22" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  switch (pathway) {
    case 'online-assignments-homework-help':
      return <ClipboardList className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'online-quizzes-assessments':
      return <CheckSquare className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'online-exams-tests-midterms-finals':
      return <Award className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'online-coursework':
      return <Layers className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'online-classes':
      return <MonitorPlay className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'protected-exam':
      return <ShieldCheck className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'writing-services':
      return <PenTool className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'it-project-assistance':
      return <Code2 className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
    case 'online-phd-classes-management':
    default:
      return <GraduationCap className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />;
  }
}

const STEP_LABELS: Record<number, { badge: string; heading: string; subtitle: string }> = {
  1: {
    badge: 'STEP 1: LEARNING PATHWAY',
    heading: 'How would you like to prepare?',
    subtitle: 'Choose a tutoring style to match you with the right expert.',
  },
  2: {
    badge: 'STEP 2: SUBJECT & LEVEL',
    heading: 'What subject are you focusing on?',
    subtitle: 'Tell us your course topic and academic level for an accurate match.',
  },
  3: {
    badge: 'STEP 3: DEADLINE & TIMELINE',
    heading: 'When do you need tutor support?',
    subtitle: 'Pick an urgency window and preferred schedule for your sessions.',
  },
  4: {
    badge: 'STEP 4: GOALS & MATERIALS',
    heading: 'Share your goals and files',
    subtitle: 'Add a quick note or attach your syllabus, prompt, or draft.',
  },
  5: {
    badge: 'STEP 5: INSTANT TUTOR MATCH',
    heading: 'Your matched specialist is ready',
    subtitle: 'Review your personalized study plan and launch your live workspace.',
  },
};

export default function StudentOnboardingWizard({
  currentUser,
  tutors,
  onSubmitAssignment,
  onOpenChat,
  onOpenWhatsApp,
  onOpenMenu,
  onExit,
  onSelectChatId,
  onGoToChat,
  onNavigate,
  onLogout,
}: StudentOnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedPathway, setSelectedPathway] = useState<OnboardingPathwayId | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [academicLevel, setAcademicLevel] = useState<(typeof ACADEMIC_LEVELS)[number]>('Undergraduate');
  const [urgencyId, setUrgencyId] = useState<(typeof URGENCY_OPTIONS)[number]['id']>('3-days');
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [durationValue, setDurationValue] = useState<number>(3);
  const [goalNote, setGoalNote] = useState<string>('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; size: string }>>([]);
  const [studentName, setStudentName] = useState<string>(currentUser.name || '');
  const [studentEmail, setStudentEmail] = useState<string>(currentUser.email || '');
  const [validationError, setValidationError] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const toggleDeliverable = (label: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const activePathway = useMemo(
    () => PATHWAY_OPTIONS.find((p) => p.id === selectedPathway) || PATHWAY_OPTIONS[0],
    [selectedPathway]
  );

  const selectedUrgency = useMemo(
    () => URGENCY_OPTIONS.find((u) => u.id === urgencyId) || URGENCY_OPTIONS[1],
    [urgencyId]
  );

  const matchedTutor = useMemo(() => {
    const subjLower = selectedSubject.toLowerCase();
    const bySubject = tutors.find(
      (t) =>
        subjLower &&
        ((t.subjects || []).some((s) => s.toLowerCase().includes(subjLower) || subjLower.includes(s.toLowerCase())) ||
          (t.bio || '').toLowerCase().includes(subjLower))
    );
    return bySubject || tutors[0] || {
      id: 'tutor_clara',
      name: 'Dr. Clara Vance',
      email: 'clara@university-tutors.com',
      role: 'tutor',
      rating: 4.9,
      bio: 'Senior Academic Specialist • University-Tutors Verified Faculty',
    };
  }, [selectedSubject, tutors]);

  const progressPct = step * 20;
  const stepMeta = STEP_LABELS[step] || STEP_LABELS[1];

  const handleSelectPathway = (id: OnboardingPathwayId) => {
    setSelectedPathway(id);
    const opt = PATHWAY_OPTIONS.find((p) => p.id === id);
    if (opt) {
      setDurationValue(opt.durationDefault);
    }
    setValidationError('');
  };

  const handleSelectUrgency = (id: (typeof URGENCY_OPTIONS)[number]['id']) => {
    setUrgencyId(id);
    const found = URGENCY_OPTIONS.find((u) => u.id === id);
    if (found) {
      const next = new Date();
      next.setDate(next.getDate() + found.daysOffset);
      setTargetDate(next.toISOString().split('T')[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const mapped = files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      size: `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(2)} MB`,
    }));
    setAttachedFiles((prev) => [...prev, ...mapped]);
  };

  const handleNextStep = () => {
    setValidationError('');
    if (step === 1) {
      if (!selectedPathway) {
        setValidationError('Please select a learning pathway to continue.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedSubject.trim()) {
        setValidationError('Please enter or select your subject / course.');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!targetDate) {
        setValidationError('Please select a target deadline date.');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      setStep(5);
    }
  };

  const handleBackStep = () => {
    setValidationError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleStartSession = async () => {
    setValidationError('');
    if (!studentName.trim() || !studentEmail.trim()) {
      setValidationError('Please confirm your name and contact email.');
      return;
    }

    setIsLaunching(true);
    const focusLabel = selectedSubtopic.trim() ? `${selectedSubject.trim()} (${selectedSubtopic.trim()})` : selectedSubject.trim();

    const isWritingService = activePathway.id === 'writing' || activePathway.id === 'writing-services';
    const deliverablesText =
      selectedDeliverables.length > 0 ? selectedDeliverables.join(', ') : 'None selected';
    const instructionsSummary = [
      '=== University-Tutors Student Onboarding Request ===',
      `SERVICE CATEGORY: ${activePathway.title}`,
      `PATHWAY: ${activePathway.title}`,
      `SUBJECT & COURSE: ${focusLabel}`,
      `ACADEMIC LEVEL: ${academicLevel}`,
      `URGENCY: ${selectedUrgency.label}`,
      `TARGET DATE: ${targetDate}`,
      `ESTIMATED SCOPE: ${durationValue} ${activePathway.durationUnit}`,
      `DELIVERABLES (OPTIONAL): ${deliverablesText}`,
      `STUDENT GOALS: ${goalNote.trim() || 'Guided academic mentoring & review'}`,
      `CONTACT: ${studentName.trim()} (${studentEmail.trim()})`,
    ].join('\n');

    try {
      await onSubmitAssignment({
        studentId: currentUser.id,
        title: `${focusLabel} — ${activePathway.title}`,
        subject: selectedSubject.trim() || 'General Academic Tutoring',
        deadline: targetDate,
        wordCount: isWritingService ? durationValue * 275 : 1200,
        referenceStyle: isWritingService ? 'APA Style' : 'Standard',
        sourcesCount: 3,
        instructions: instructionsSummary,
        tutorId: matchedTutor?.id,
        fileUrls: attachedFiles.map((f) => `https://university-tutors.com/uploads/${encodeURIComponent(f.name)}`),
        fileNames: attachedFiles.map((f) => f.name),
      });

      const tutorIdToChat = matchedTutor?.id || 'admin_shaka';
      const deliverablesChatPart =
        selectedDeliverables.length > 0 ? ` Deliverables requested: ${selectedDeliverables.join(', ')}.` : '';
      const welcomeMsg = `Hi ${matchedTutor?.name || 'Tutor'}, I just submitted a request for "${activePathway.title}" in ${focusLabel} (${academicLevel}, target: ${selectedUrgency.label}).${deliverablesChatPart} ${goalNote.trim() ? `My goal: ${goalNote.trim()}` : 'Ready to get started!'}`;
      const chatRes = onOpenChat(tutorIdToChat, welcomeMsg);
      if (chatRes && typeof chatRes === 'object' && 'id' in chatRes && onSelectChatId) {
        onSelectChatId((chatRes as { id: string }).id);
      }
      if (onGoToChat) {
        onGoToChat();
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Unable to start session right now. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  const suggestedSubtopics = SUBJECT_SUGGESTIONS[selectedSubject] || [];

  return (
    <div className="w-full flex justify-center py-1 sm:py-3" id="student-onboarding-wizard">
      <div
        className={`w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col relative overflow-hidden transition-all duration-200 ${
          step === 1 || step === 4 ? 'max-w-md sm:max-w-2xl lg:max-w-5xl' : 'max-w-md md:max-w-lg'
        }`}
      >
        {/* Top Brand Nav Bar with Official Logo & Student Login Status */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => (onExit ? onExit() : onNavigate?.('home'))}
              className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
              title="University Tutors"
            >
              <picture className="shrink-0">
                <source type="image/avif" srcSet="/logo-220.avif 220w, /logo-440.avif 440w" sizes="150px" />
                <source type="image/webp" srcSet="/logo-220.webp 220w, /logo-440.webp 440w" sizes="150px" />
                <img
                  src="/logo.webp"
                  alt="University Tutors"
                  width={150}
                  height={57}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </picture>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentUser?.email ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-orange-50/80 border border-orange-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700 max-w-[130px] truncate">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
                {(onLogout || onNavigate) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                      } else if (onNavigate) {
                        onNavigate('auth');
                      }
                    }}
                    className="min-h-[36px] px-2.5 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors cursor-pointer"
                    title="Switch or sign out of student account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Switch Account</span>
                  </button>
                )}
              </div>
            ) : (
              onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="min-h-[36px] px-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </button>
              )
            )}
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="min-h-[40px] px-3 flex items-center justify-center gap-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Return to overview"
              >
                <X className="w-4 h-4" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area (Generous bottom spacing so docked buttons never touch card text) */}
        <div className="p-4 sm:p-5 pb-20 space-y-5 text-left">
          {/* Progress Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] text-[10px] font-bold tracking-wider uppercase">
                {stepMeta.badge}
              </span>
              <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                Step {step} of 5 • {progressPct}%
              </span>
            </div>

            {/* Segmented Orange Progress Bar */}
            <div className="grid grid-cols-5 gap-1.5" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-colors duration-200 ${
                    idx <= step ? 'bg-[#F97316]' : 'bg-[#FFF7ED]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Heading */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {stepMeta.heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {stepMeta.subtitle}
            </p>
          </div>

          {/* Validation Inline Notice */}
          {validationError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
              {validationError}
            </div>
          )}

          {/* ================= STEP 1: LEARNING PATHWAY & SERVICE SELECTION ================= */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="radiogroup" aria-label="Learning pathway">
              {PATHWAY_OPTIONS.map((option) => {
                const isSelected = selectedPathway === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectPathway(option.id)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 min-h-[82px] transition-all cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-2 border-orange-500 bg-orange-50/40 shadow-sm'
                        : 'border border-slate-200 bg-white hover:border-orange-300'
                    }`}
                    id={`onboarding-pathway-${option.id}`}
                  >
                    {/* Left 52x52 Warm Orange Gradient Icon Frame */}
                    <div className="w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 border border-orange-100/80">
                      <PathwayAvatarSvg pathway={option.id} />
                    </div>

                    {/* Middle Text Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2">
                        {option.title}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 leading-snug">
                        {option.description}
                      </p>
                      <span className="block text-[11px] font-semibold text-orange-600">
                        {option.meta}
                      </span>
                    </div>

                    {/* Right Custom 20x20 Circular Radio */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-orange-500 border-2 border-orange-500 text-white'
                          : 'bg-white border-2 border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ================= STEP 2: SUBJECT & LEVEL ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="onboarding-subject-input" className="block text-xs font-bold text-slate-700">
                  Subject or Course Name
                </label>
                <input
                  id="onboarding-subject-input"
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g., Organic Chemistry, Calculus II, Biology..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Popular Subjects</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SUBJECT_SUGGESTIONS).map((subj) => {
                    const active = selectedSubject === subj;
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(subj);
                          setSelectedSubtopic('');
                          setValidationError('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {suggestedSubtopics.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700">Focus Topic (Optional)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSubtopics.map((topic) => {
                      const active = selectedSubtopic === topic;
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSelectedSubtopic(active ? '' : topic)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FFF7ED] text-[#EA580C] border border-orange-400'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Academic Level</span>
                <div className="grid grid-cols-3 gap-2">
                  {ACADEMIC_LEVELS.map((level) => {
                    const active = academicLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setAcademicLevel(level)}
                        className={`min-h-[44px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                          active
                            ? 'border-2 border-orange-500 bg-orange-50/60 text-[#EA580C]'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-orange-300'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DEADLINE & URGENCY ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {URGENCY_OPTIONS.map((item) => {
                  const active = urgencyId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectUrgency(item.id)}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer active:scale-[0.99] ${
                        active
                          ? 'border-2 border-orange-500 bg-orange-50/40 shadow-xs'
                          : 'border border-slate-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Clock className={`w-4 h-4 ${active ? 'text-orange-500' : 'text-slate-400'}`} />
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            active ? 'bg-orange-500 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.hint}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-target-date" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Target Date</span>
                  </label>
                  <input
                    id="onboarding-target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-700">{activePathway.durationLabel}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {activePathway.durationOptions.map((val) => {
                      const active = durationValue === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDurationValue(val)}
                          className={`h-11 rounded-xl text-xs font-bold transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-orange-300'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <span className="block text-[11px] text-slate-500">
                    Selected: {durationValue} {activePathway.durationUnit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: BRIEF GOAL & FILE UPLOAD ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="onboarding-goal-textarea" className="block text-xs font-bold text-slate-700">
                  Briefly describe what you need help with
                </label>
                <textarea
                  id="onboarding-goal-textarea"
                  rows={4}
                  value={goalNote}
                  onChange={(e) => setGoalNote(e.target.value)}
                  placeholder="Share specific chapters, rubric points, citation style, or exam topics you want to master..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Attach Syllabus, Prompt, or Draft (Optional)</span>
                <label
                  htmlFor="onboarding-file-upload"
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-orange-200 bg-[#FFF7ED]/50 hover:bg-[#FFF7ED] transition-colors cursor-pointer text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-orange-200 text-orange-500 flex items-center justify-center shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Tap to upload study files</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">PDF, DOCX, PPT, ZIP, or screenshots</span>
                  </div>
                  <input
                    id="onboarding-file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-[11px] text-slate-400 shrink-0">{file.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deliverables (Optional) 3-Column Selection Grid */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5" id="onboarding-deliverables-section">
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Deliverables (Optional)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select any additional services you require.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DELIVERABLE_OPTIONS.map((item) => {
                    const isChecked = selectedDeliverables.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => toggleDeliverable(item.label)}
                        id={`deliverable-${item.id}`}
                        className={`text-left flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer active:scale-[0.99] ${
                          isChecked
                            ? 'bg-[#FFF7ED]/70 border border-orange-300 shadow-2xs'
                            : 'bg-white border border-transparent hover:border-orange-200 hover:bg-orange-50/30'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#F97316] border-2 border-[#F97316] text-white'
                              : 'bg-white border-2 border-[#F97316]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: INSTANT TUTOR MATCH ================= */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Highlighted Tutor Match Card */}
              <div className="rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-[#FFF7ED] to-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#EA580C]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Matched Specialist Available
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {activePathway.meta}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 border border-orange-200">
                    <PathwayAvatarSvg pathway={activePathway.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{matchedTutor.name}</div>
                    <div className="text-xs text-slate-600 truncate">
                      {activePathway.title} • {selectedSubject || 'Academic Mentoring'}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-0.5 text-orange-600">
                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                        {matchedTutor.rating || 4.9}
                      </span>
                      <span>•</span>
                      <span>{academicLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Study Request Receipt */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Pathway</span>
                  <span className="font-bold text-slate-900 text-right">{activePathway.title}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Subject</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                    {selectedSubject}
                    {selectedSubtopic ? ` (${selectedSubtopic})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Timeline</span>
                  <span className="font-bold text-slate-900 text-right">
                    {selectedUrgency.label} ({targetDate})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Scope &amp; Files</span>
                  <span className="font-bold text-slate-900 text-right">
                    {durationValue} {activePathway.durationUnit} • {attachedFiles.length} file(s)
                  </span>
                </div>
                {selectedDeliverables.length > 0 && (
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/70">
                    <span className="text-slate-500 shrink-0">Deliverables</span>
                    <span className="font-bold text-[#EA580C] text-right">
                      {selectedDeliverables.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Pre-filled Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label htmlFor="onboarding-student-name" className="block text-[11px] font-bold text-slate-600">
                    Your Name
                  </label>
                  <input
                    id="onboarding-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="onboarding-student-email" className="block text-[11px] font-bold text-slate-600">
                    Contact Email
                  </label>
                  <input
                    id="onboarding-student-email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Direct encrypted tutor workspace &amp; milestone protection included.</span>
              </div>
            </div>
          )}
        </div>

        {/* Docked Support Actions (42x42px positioned cleanly at bottom-20 above sticky footer) */}
        <div className="absolute right-4 bottom-20 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenWhatsApp) {
                onOpenWhatsApp();
              } else {
                onOpenChat('admin_shaka');
              }
            }}
            className="w-[42px] h-[42px] rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="WhatsApp Support"
            aria-label="Open WhatsApp Support"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.188.109-1.922-.125-.453-.141-1.031-.328-1.766-.641-3.094-1.328-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219 0-1.531.797-2.281 1.078-2.594.281-.313.609-.391.813-.391.203 0 .406 0 .594.016.188.016.438-.078.688.531.25.609.859 2.109.938 2.266.078.156.125.344.016.547-.109.203-.156.344-.313.531-.156.188-.328.422-.469.563-.156.156-.313.328-.141.641.172.313.781 1.297 1.672 2.094 1.156 1.031 2.125 1.344 2.438 1.5.313.156.5.125.688-.094.188-.219.797-.938 1.016-1.25.219-.313.438-.266.734-.156.297.109 1.891.891 2.219 1.047.328.156.547.234.625.375.078.141.078.797-.172 1.5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onOpenChat('admin_shaka')}
            className="w-[42px] h-[42px] rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="Live Support Chat"
            aria-label="Open Live Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky Thumb-Zone Footer */}
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-xs border-t border-slate-100 p-4 flex items-center gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBackStep}
              className="h-12 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={step === 1 && !selectedPathway}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                step === 1 && !selectedPathway
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-sm cursor-pointer'
              }`}
              id="onboarding-continue-btn"
            >
              <span>
                {step === 1
                  ? 'Continue to Subject →'
                  : step === 2
                  ? 'Continue to Timeline →'
                  : step === 3
                  ? 'Continue to Goals →'
                  : 'Find My Tutor Match →'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSession}
              disabled={isLaunching}
              className="flex-1 h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              id="onboarding-start-session-btn"
            >
              {isLaunching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
