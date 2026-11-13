import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Clock,
  Check,
  Sparkles,
  FileText,
  Video,
  Calendar,
  HelpCircle,
  BookOpen,
  Brain,
  Heart,
  ShieldAlert,
  CheckCircle2,
  Star,
  X,
} from 'lucide-react';
import { User, Blog, FAQ } from '../types';
import HowItWorksSection from './HowItWorksSection';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import { ResponsiveAvatar, ResponsivePicture } from './ResponsiveImage';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';

const MarketingSubpages = React.lazy(() => import('./MarketingSubpages'));

interface MarketingPagesProps {
  activeView: string;
  tutors: User[];
  blogs: Blog[];
  faqs: FAQ[];
  onNavigate: (view: string) => void;
  onTutorSelect: (tutor: User) => void;
  onSelectTutorProfile?: (tutor: User) => void;
  onRaisedConsult: (msg: string) => void;
  onGoogleConnect?: () => void;
}

interface CardData {
  id: number;
  title: string;
  description: string;
  image: string;
  fallbackImage?: string;
  badgeType: string;
  extraDetails: {
    headline: string;
    paragraphs: string[];
    stats: { label: string; value: string }[];
  };
}

function useMediaQuery(query: string, defaultMatches = true): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return defaultMatches;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

const CARDS_DATA: CardData[] = [
  {
    id: 1,
    title: 'Instant Help When You Need It',
    description:
      'Get immediate assistance through our live chat, connecting you with experts who can quickly resolve your questions and concerns.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
    badgeType: 'instant',
    extraDetails: {
      headline: 'How our Instant Live Chat Routing Works',
      paragraphs: [
        'We maintain a active standby network of over 150 subject-matter experts spanning computer science, advanced physics, finance, and humanities.',
        'When you initiate a query, our cognitive routing engine parses your questions and pairs you with a top-rated academic specialist in under 45 seconds.',
        'Collaborate in real-time with screen share, live terminal sessions, LaTeX math renders, and inline code execution modules right inside the chat bubble.',
      ],
      stats: [
        { label: 'Avg. Connection', value: '34s' },
        { label: 'Expert Rating', value: '4.95' },
        { label: 'First Contact Resolution', value: '92%' },
      ],
    },
  },
  {
    id: 2,
    title: '24/7 Access to Real Representatives',
    description:
      'Access study materials, videos, and direct support from our team anytime, anywhere. Our round-the-clock availability means support at your own pace.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    badgeType: 'agents',
    extraDetails: {
      headline: 'Human-Centric Customer Success Teams',
      paragraphs: [
        'No robotic auto-responders or circular phone trees. Our global network is fully staffed by expert academic advisors and tech support specialists across 5 continents.',
        "We understand student stress doesn't stick to 9-to-5 schedules. Whether it's 3:00 AM before a major portfolio review or mid-day on Sunday, a real, helpful advisor is ready to guide you.",
        "Get personalized onboarding setups, syllabus analysis, and direct calendar synchronizations tailored directly to your semesters' schedule.",
      ],
      stats: [
        { label: 'Availability', value: '365/24/7' },
        { label: 'Satisfaction', value: '99.2%' },
        { label: 'Supported Timezones', value: 'All' },
      ],
    },
  },
  {
    id: 3,
    title: 'Accessible Learning for All',
    description:
      'Our platform is flexible and accessible on your phone, tablet, or computer. Continue learning wherever you are with a seamless digital interface.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
    badgeType: 'accessible',
    extraDetails: {
      headline: 'Cross-Platform Syncing & Responsive Technology',
      paragraphs: [
        'Pick up exactly where you left off. Start a problem set on your campus desktop, verify equations on your phone while commuting, and finalize submissions on your iPad.',
        'Our digital platform is lightweight, highly optimized for poor mobile network conditions, and natively meets WCAG 2.2 AAA accessibility compliance.',
        'Enable offline mode to access pre-downloaded study sheets, lecture video transcripts, and review quizzes without consuming cellular data plans.',
      ],
      stats: [
        { label: 'Devices Synced', value: 'Unlimited' },
        { label: 'Offline Mode support', value: 'Enabled' },
        { label: 'App Store Rating', value: '4.8' },
      ],
    },
  },
  {
    id: 4,
    title: 'Expert-Driven Academic Support',
    description:
      'Get personalized assistance from top-rated experts who provide in-depth understanding and guidance on complex, high-level academic topics.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
    badgeType: 'expert',
    extraDetails: {
      headline: 'Vetted Faculty & Technical Professionals',
      paragraphs: [
        'We reject standard mechanical answers. Our experts teach you the underlying fundamentals, logic, and concepts so you feel empowered to handle subsequent projects solo.',
        'Every academic specialist undergoes thorough credential verification, identity checks, and real-world teaching simulation reviews prior to taking calls.',
        'Receive visual workflow breakdowns, step-by-step logic sheets, and personalized follow-up study recommendations curated for your curriculum.',
      ],
      stats: [
        { label: 'PhD-Level Mentors', value: '45%' },
        { label: 'Fields Covered', value: '180+' },
        { label: 'Active Experts', value: '12,000+' },
      ],
    },
  },
  {
    id: 5,
    title: 'Real-Time Progress Monitoring',
    description:
      'Stay on top of your academic performance with a live progress dashboard that helps you track assignments, deadlines, and improvements.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
    badgeType: 'progress',
    extraDetails: {
      headline: 'Next-Gen Academic Performance Dashboard',
      paragraphs: [
        'Visualize your grades, assignment schedules, and concept proficiency with clarity using interactive charts and predictive analytics engines.',
        'Set custom goals, benchmark your learning speed against past trends, and receive push reminders when assignment milestones approach.',
        'Share progress overviews with parents, university counselors, or advisors instantly using encrypted export tokens and clean reporting metrics.',
      ],
      stats: [
        { label: 'Data Latency', value: '<1s' },
        { label: 'Accuracy', value: '100%' },
        { label: 'Export formats', value: 'PDF/XLS' },
      ],
    },
  },
  {
    id: 6,
    title: 'Syllabus-Based Custom Quotation',
    description:
      'No generic standard pricing. Receive custom, fair binding quotes negotiated directly with experts tailored perfectly to your specific requirements.',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=700&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=700&q=80',
    badgeType: 'pricing',
    extraDetails: {
      headline: 'Negotiate Fair Pricing per Milestone',
      paragraphs: [
        'We reject standard subscription charges and cookie-cutter pricing packages. Instead, we support a completely customized proposal flow based solely on your specific syllabus, task complexity, and urgency.',
        'You always discuss and agree on custom quotes in real-time. Once accepted, funds are held securely in escrow and only disbursed to the tutor after you review and approve the finalized academy milestone.',
        'This transparent matching and quotation workflow ensures absolute safety, maximum alignment with your study budget, and 100% control over payments.',
      ],
      stats: [
        { label: 'Quotation Fee', value: '$0 upfront' },
        { label: 'Active Escrow', value: '100% Secure' },
        { label: 'Hourly Option', value: 'Flexible' },
      ],
    },
  },
];

interface BenefitCard {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  badgeText: string;
  badgeType: string;
}

const BENEFIT_CARDS_DATA: BenefitCard[] = [
  {
    id: 1,
    title: 'Busy People',
    description:
      'Many students juggle work, family, and academic responsibilities. We help them manage everything effortlessly by ensuring their coursework is completed on time and to a high standard.',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Busy workspace and schedule planner',
    badgeText: 'Busy People',
    badgeType: 'busy',
  },
  {
    id: 2,
    title: 'Grade Seekers',
    description:
      'Whether in a challenging course or simply aiming for higher marks, our experts provide the support needed to get better grades and excel in school.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Students studying together aiming for high scores',
    badgeText: 'Grade Seekers',
    badgeType: 'grades',
  },
  {
    id: 3,
    title: 'Adult Learners',
    description:
      'Adults who are returning to school or looking to change careers often face busy schedules. Our services help them keep up with their classes and stay on top of assignments.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Adult learner working on assignments',
    badgeText: 'Adult Learners',
    badgeType: 'adults',
  },
  {
    id: 4,
    title: 'Need Extra Help',
    description:
      'Some students may struggle to understand course material. We offer one-on-one tutoring to explain difficult concepts in a way that makes sense to them.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Supportive classroom tutoring and extra help',
    badgeText: 'Extra Help',
    badgeType: 'extra',
  },
  {
    id: 5,
    title: 'ESL Students',
    description:
      'Students who may not be fluent in English can benefit from our assistance in ensuring their schoolwork is written clearly and correctly, helping them succeed academically.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Multicultural university students studying English',
    badgeText: 'ESL Students',
    badgeType: 'esl',
  },
  {
    id: 6,
    title: 'Exam Preparation',
    description:
      'Preparing for major exams, including finals or standardized tests, can be stressful. We provide practice tests and study materials to help students feel ready and confident.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Exam schedule calendars, notes, and study guides',
    badgeText: 'Exam Prep',
    badgeType: 'prep',
  },
  {
    id: 7,
    title: 'Clearer Logic',
    description:
      'If students need help understanding concepts from a different perspective, our tutors can offer clearer explanations that make learning easier.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Organizing thoughts logically using flow diagrams',
    badgeText: 'Clearer Logic',
    badgeType: 'logic',
  },
  {
    id: 8,
    title: 'Tech Challenges',
    description:
      'Some students need assistance with using online learning platforms and technology. We guide them through the process so they become more comfortable with their online studies.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Students navigating online courses and modern tech panels',
    badgeText: 'Tech Challenges',
    badgeType: 'tech',
  },
];

const renderBenefitPlaceholderSvg = (type: string) => {
  switch (type) {
    case 'busy':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'grades':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'adults':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.489v3.076" />
        </svg>
      );
    case 'extra':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0112 15c2.207 0 4.13.17 5.74 1.2a3.007 3.007 0 011.04 1.838zM21 12a3 3 0 11-6 0 3 3 0 016 0zm-9.74 6.72a9.094 9.094 0 00-3.741-.479 3 3 0 004.682-2.72m-.94 3.198l-.001.031a1.21 1.21 0 01.037.666A11.944 11.944 0 0012 21c2.17 0 4.207-.576 5.963-1.584A6.062 6.062 0 0012 15c-2.207 0-4.13.17-5.74 1.2a3.007 3.007 0 00-1.04 1.838zM3 12a3 3 0 116 0 3 3 0 01-6 0z" />
        </svg>
      );
    case 'esl':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
        </svg>
      );
    case 'prep':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    case 'logic':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" className="opacity-30" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17c0 .414-.336.75-.75.75s-.75-.336-.75-.75.336-.75.75-.75.75.336.75.75zM14.25 17c0 .414-.336.75-.75.75s-.75-.336-.75-.75.336-.75.75-.75.75.336.75.75z" />
        </svg>
      );
    case 'tech':
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      );
    default:
      return null;
  }
};

const renderBenefitIconSvg = (type: string) => {
  switch (type) {
    case 'busy':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    case 'grades':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      );
    case 'adults':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    case 'extra':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2a5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"></path>
        </svg>
      );
    case 'esl':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      );
    case 'prep':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
        </svg>
      );
    case 'logic':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      );
    case 'tech':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      );
    default:
      return null;
  }
};

function MarketingPages({
  activeView,
  tutors,
  blogs,
  faqs,
  onNavigate,
  onTutorSelect,
  onRaisedConsult,
}: MarketingPagesProps) {
  const isSmUp = useMediaQuery('(min-width: 640px)', true);
  const isMdUp = useMediaQuery('(min-width: 768px)', true);

  // Mobile Academic Pillar Booking Sheet State
  const [pillarBookingService, setPillarBookingService] = useState<string | null>(null);
  const [pillarBookingName, setPillarBookingName] = useState<string>('');
  const [pillarBookingLevel, setPillarBookingLevel] = useState<string>('');
  const [pillarBookingNote, setPillarBookingNote] = useState<string>('');
  const [pillarBookingToast, setPillarBookingToast] = useState<boolean>(false);

  const testimonials = [
    {
      name: 'Chloe Gallagher',
      uni: 'Oxford University, UK',
      flag: '🇬🇧',
      rating: 5,
      quote:
        'The MLA Essay formatting provided by Dr. Clara Stirling was absolutely brilliant. She helped me restructure my thesis outline, enhancing the logical progression of my argument.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    },
    {
      name: 'Michael Chen',
      uni: 'University of Toronto, Canada',
      flag: '🇨🇦',
      rating: 5,
      quote:
        'Stripe escrow is amazing. I felt 100% safe locking the math coursework fee. Liam Kennedy explained advanced calculus steps clearly, and my grades improved in weeks!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    },
    {
      name: 'Aaliyah Jackson',
      uni: 'New York University, USA',
      flag: '🇺🇸',
      rating: 5,
      quote:
        'Very responsive tutors. Their Computer Science tutor James solved my binary search tree recursion questions. The live whiteboard felt like we were sitting in the same library.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
    },
    {
      name: "Jack O'Sullivan",
      uni: 'Trinity College Dublin, Ireland',
      flag: '🇮🇪',
      rating: 5,
      quote:
        'The research chemistry sample outline compiled by Dr. Siobhan was extremely helpful. Clean formatting, perfect citations, and 24/7 support throughout. Recommend universitytutors to all!',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80',
    },
  ];

  const handleConsultSubmit = () => {
    onNavigate('contact');
  };

  // Expert Modal State
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState('General Class Inquiry');
  const [modalTitleText, setModalTitleText] = useState('Connect with an Expert');
  const [modalFormStep, setModalFormStep] = useState<'form' | 'success'>('form');

  // Why Students Trust Us Modal State
  const [activeModalId, setActiveModalId] = useState<number | null>(null);
  const activeCardForModal = CARDS_DATA.find((c) => c.id === activeModalId);

  const renderCardBadge = (type: string) => {
    const baseStyle =
      'w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:rotate-12';

    switch (type) {
      case 'instant':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        );
      case 'agents':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        );
      case 'accessible':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
        );
      case 'expert':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9a48.62 48.62 0 018.232-4.406 60.43 60.43 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A5.905 5.905 0 018 3.743 94.907 94.907 0 0112 3c1.255 0 2.443.08 3.6.236a5.905 5.905 0 013.924 5.591c0 .285-.02.569-.06.85m-15.198 0l-.014-.007a5.137 5.137 0 00-3.57.06m15.198 0l.014-.007a5.137 5.137 0 013.57.06M12 12.75a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
            </svg>
          </div>
        );
      case 'progress':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-3.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
        );
      case 'pricing':
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M9.5 13.5h3a1.5 1.5 0 000-3h-1a1.5 1.5 0 010-3h3" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={baseStyle}>
            <span>🚀</span>
          </div>
        );
    }
  };

  const renderMobileCardBadge = (type: string) => {
    switch (type) {
      case 'instant':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      case 'agents':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      case 'accessible':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
          </svg>
        );
      case 'expert':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
          </svg>
        );
      case 'progress':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        );
      case 'pricing':
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
    }
  };

  const getCardCategoryLabel = (type: string) => {
    switch (type) {
      case 'instant':
        return 'Direct Connect';
      case 'agents':
        return '24/7 Availability';
      case 'accessible':
        return 'Mobile Friendly';
      case 'expert':
        return 'PhD & Masters Tutors';
      case 'progress':
        return 'Live Dashboard';
      case 'pricing':
        return 'Transparent & Fair';
      default:
        return 'Academic Support';
    }
  };

  // Lead Form field states
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubject, setLeadSubject] = useState('Mathematics & Statistics');
  const [loadedBenefitImages, setLoadedBenefitImages] = useState<Record<number, boolean>>({});

  const openExpertModal = (sourceName: string) => {
    setModalSource(sourceName);

    if (sourceName.includes('Time')) {
      setModalTitleText('Reclaim Your Hours');
    } else if (sourceName.includes('Subject')) {
      setModalTitleText('Master Hard Concepts');
    } else if (sourceName.includes('Stress')) {
      setModalTitleText('Reduce Academic Stress');
    } else if (sourceName.includes('Grade')) {
      setModalTitleText('Rescue & Secure Your Grades');
    } else if (sourceName.includes('Emergency')) {
      setModalTitleText('Emergency Crisis Help');
    } else {
      setModalTitleText('Connect with an Expert');
    }

    setModalFormStep('form');
    setIsExpertModalOpen(true);
  };

  const closeExpertModal = () => {
    setIsExpertModalOpen(false);
  };

  const handleLeadFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRaisedConsult(
      `New interactive online class help inquiry: ${leadName} (${leadEmail}) for ${leadSubject} via ${modalSource}`
    );
    setModalFormStep('success');
  };

  return (
    <div id="marketing-pages-view" className="bg-white font-sans text-gray-800">
      {/* ==================== 1. HOME PAGE ==================== */}
      {activeView === 'home' && (
        <div id="home-section" className="animate-fade-in">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white py-8 sm:py-14 md:py-20 border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="flex-1 text-left space-y-4 sm:space-y-6">
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-orange-700 animate-spin" />
                  Your Global Partner for Academic Success
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 font-sans leading-tight">
                  Expert Tutors for Every <span className="text-orange-650 relative inline-block">University Subject</span>{' '}
                  <br className="hidden md:inline" />
                  Online, On-Demand
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-gray-650 max-w-2xl leading-relaxed text-left">
                  Get 1-on-1 academic tutoring, subject coaching, coursework guidance, and essay structure review from qualified UK, US, CA, AU, NZ &amp; IE academic mentors. Held in PCI protected escrow payment vaults.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <button
                    id="hero-find-tutor-btn"
                    onClick={() => onNavigate('tutors')}
                    className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase px-7 py-3.5 sm:px-8 sm:py-4 min-h-[44px] rounded-xl shadow-lg shadow-orange-650/15 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-center"
                  >
                    Find a Tutor
                  </button>
                  <button
                    id="hero-get-quote-btn"
                    onClick={() => onNavigate('contact')}
                    className="bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-250 font-bold text-xs tracking-wider uppercase px-7 py-3.5 sm:px-8 sm:py-4 min-h-[44px] rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-center"
                  >
                    Get a Free Quote
                  </button>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-100 flex items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-600">
                  <div className="flex -space-x-1.5 shrink-0">
                    {tutors.slice(0, 4).map((t, idx) => (
                      <ResponsiveAvatar
                        key={idx}
                        src={t.avatarUrl}
                        sizePx={28}
                        width={28}
                        height={28}
                        loading="lazy"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                        alt={t.name || 'Tutor Avatar'}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="text-gray-900 font-bold block text-xs">
                      Trusted by 10,000+ university students
                    </span>
                    <span className="text-[10px] text-gray-600 block -mt-0.5 font-mono">
                      98% satisfaction score across 500+ tutors
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Hero: Modern Image/Layout overlapping details */}
              <div className="flex-1 relative w-full h-[320px] sm:h-[380px] lg:h-[400px] mt-6 lg:mt-0 max-w-[340px] sm:max-w-none mx-auto">
                <div className="absolute top-6 sm:top-10 right-2 sm:right-4 w-64 sm:w-72 h-72 sm:h-80 bg-orange-600 rounded-3xl transform rotate-2 sm:rotate-3 shadow-2xl overflow-hidden group">
                  <ResponsivePicture
                    src={hero1on1Img}
                    alt="University students on tutoring simulation call"
                    width={400}
                    height={320}
                    sizes="(max-width: 640px) 280px, 320px"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left z-10">
                    <span className="text-[9px] font-mono tracking-widest text-orange-200 font-bold block uppercase">
                      Live Sessions
                    </span>
                    <p className="text-[11px] leading-tight font-medium opacity-95 mt-0.5">
                      Interactive virtual whiteboard
                    </p>
                  </div>
                </div>

                <div className="absolute top-0 left-2 sm:left-4 w-56 sm:w-64 h-64 sm:h-72 bg-white p-3 sm:p-4 rounded-3xl transform -rotate-4 sm:-rotate-6 shadow-xl border border-orange-100/70 flex flex-col justify-between">
                  <div className="w-full h-full bg-orange-50 rounded-2xl flex flex-col p-4 items-center justify-center text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm font-serif text-orange-700 font-bold text-xs sm:text-sm">
                      5.0 ★
                    </div>
                    <p className="text-xs font-bold text-gray-900">Expert Guidance</p>
                    <p className="text-[10px] text-gray-600 font-sans">Available 24/7</p>
                  </div>
                </div>

                <div className="absolute bottom-2 sm:bottom-4 left-6 sm:left-16 bg-white py-2.5 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-20">
                  <div className="flex -space-x-2">
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-orange-850 m-0">
                      💬
                    </p>
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-800 m-0">
                      10k
                    </p>
                    <p className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-orange-700 m-0 font-sans">
                      ✓
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 block leading-tight">
                      10,000+ Online
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-gray-600 block font-sans">
                      SOP Compliant Advisors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Responsive University Trust Bar (Mounts only active viewport variant) */}
          {!isSmUp ? (
            <div className="py-4 bg-white border-t border-b border-slate-100 overflow-hidden">
              <div className="text-center mb-3 px-4">
                <span className="text-[9px] font-bold tracking-widest text-slate-600 uppercase block mb-0.5">
                  Global Academic Excellence
                </span>
                <h2 className="text-[11px] font-bold text-slate-800 tracking-tight leading-snug">
                  TRUSTED BY STUDENTS FROM LEADING UNIVERSITIES
                </h2>
              </div>

              <div className="relative w-full overflow-hidden py-1">
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                <div className="animate-marquee space-x-2 px-2">
                  {[0, 1].map((dupIdx) => (
                    <React.Fragment key={dupIdx}>
                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">
                          🏛️
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Oxford</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">UK University</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-sm">
                          🎓
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Harvard</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">USA College</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-sm">
                          🏫
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Toronto</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Canada</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">
                          🏛️
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Sydney</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Australia</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm">
                          🏫
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Dublin Trinity</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">Ireland</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-36 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                        <div className="w-7 h-7 shrink-0 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-sm">
                          🎓
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">Auckland</p>
                          <p className="text-[8px] font-medium text-slate-600 truncate leading-tight">New Zealand</p>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <section className="bg-gray-50 py-8 border-b border-gray-100 px-4">
              <div className="container mx-auto max-w-7xl text-center">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-4">
                  Trusted by high-achieving students from the world's leading universities
                </span>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-xs text-gray-600 font-bold font-sans">
                  <span>🏛️ OXFORD UNIVERSITY</span>
                  <span>🏛️ HARVARD COLLEGE</span>
                  <span>🏛️ TORONTO CANADA</span>
                  <span>🏛️ SYDNEY UNIVERSITY</span>
                  <span>🏛️ DUBLIN TRINITY</span>
                  <span>🏛️ AUCKLAND NZ</span>
                </div>
              </div>
            </section>
          )}

          {/* Interactive How It Works Flow Sandbox */}
          <HowItWorksSection onNavigate={onNavigate} />

          {/* Services Overview & 4 Pillars */}
          <section
            className="py-8 sm:py-16 md:py-24 bg-white border-b border-gray-100 px-3.5 sm:px-6 lg:px-8"
            id="four-pillars-section"
          >
            <div className="w-full max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-14">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-orange-50/90 border border-orange-200/80 text-orange-700 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-5 shadow-xs select-none">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-650" />
                  <span>Double-Vetted Native Syllabus Support</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-gray-950 uppercase leading-snug font-heading">
                  OUR 4 PILLARS OF <span className="text-orange-650 not-italic block sm:inline">ACADEMIC TUTORING</span>
                </h2>

                <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed px-1">
                  Tap any core category to inspect matched regional curriculums, try interactive outline tools, and communicate with verified country specialists.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 text-left">
                {/* Card 1: 1-on-1 Live Tutoring */}
                <a
                  id="pillar-card-0"
                  href="/services/1-on-1-live-tutoring"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-1on1');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Whiteboard &amp; Video
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center">
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="tutor-skin" cx="45%" cy="40%" r="55%">
                                <stop offset="0%" stopColor="#fed7aa" />
                                <stop offset="75%" stopColor="#fdba74" />
                                <stop offset="100%" stopColor="#fb923c" />
                              </radialGradient>
                              <linearGradient id="tutor-hair" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#7c2d12" />
                                <stop offset="100%" stopColor="#431407" />
                              </linearGradient>
                              <linearGradient id="tutor-clothes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb923c" />
                                <stop offset="100%" stopColor="#c2410c" />
                              </linearGradient>
                              <linearGradient id="headset-grad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="42" ry="7" fill="#ea580c" fillOpacity="0.2" />
                            <circle cx="100" cy="85" r="42" fill="url(#tutor-hair)" />
                            <path d="M60 90 C 58 135, 70 148, 76 154 L 124 154 C 130 148, 142 135, 140 90 Z" fill="url(#tutor-hair)" />
                            <path d="M64 156 C64 135 80 130 100 130 C120 130 136 135 136 156 L144 182 C144 186 140 190 135 190 L65 190 C60 190 56 186 56 182 Z" fill="url(#tutor-clothes)" />
                            <polygon points="100,146 84,131 93,130 100,140 107,130 116,131" fill="#fff7ed" />
                            <rect x="91" y="118" width="18" height="18" rx="7" fill="url(#tutor-skin)" />
                            <ellipse cx="100" cy="88" rx="30" ry="33" fill="url(#tutor-skin)" />
                            <path d="M72 74 C 82 58, 120 56, 128 72 C 120 66, 92 68, 72 74 Z" fill="#9a3412" />
                            <ellipse cx="89" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                            <ellipse cx="111" cy="84" rx="4.5" ry="5.5" fill="#1e293b" />
                            <circle cx="90.5" cy="82.5" r="1.6" fill="#ffffff" />
                            <circle cx="112.5" cy="82.5" r="1.6" fill="#ffffff" />
                            <circle cx="81" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                            <circle cx="119" cy="94" r="5" fill="#f43f5e" fillOpacity="0.35" />
                            <path d="M88 97 Q100 113 112 97 Z" fill="#991b1b" />
                            <path d="M89 97 Q100 103 111 97" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <path d="M68 85 A 34 34 0 0 1 132 85" stroke="url(#headset-grad)" strokeWidth="4.5" strokeLinecap="round" />
                            <rect x="65" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                            <rect x="127" y="77" width="8" height="18" rx="4" fill="url(#headset-grad)" />
                            <path d="M70 90 Q 72 108 86 107" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="86" cy="107" r="3" fill="#ea580c" />
                            <circle cx="138" cy="52" r="9" fill="#10b981" />
                            <polygon points="135,48 143,52 135,56" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          1-on-1 Live Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Interact with native instructors on high-speed webcams and digital whiteboard systems.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Recording &amp; stream included</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 2: Assignment Tutoring */}
                <a
                  id="pillar-card-1"
                  href="/services/assignment-guidance"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-assignment');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Structural Reviews
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-1s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="student-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#ffedd5" />
                                <stop offset="70%" stopColor="#fed7aa" />
                                <stop offset="100%" stopColor="#fb923c" />
                              </radialGradient>
                              <linearGradient id="student-hoodie" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ea580c" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#ea580c" fillOpacity="0.2" />
                            <path d="M60 156 C60 134 76 128 100 128 C124 128 140 134 140 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#student-hoodie)" />
                            <rect x="91" y="116" width="18" height="18" rx="6" fill="url(#student-skin)" />
                            <path d="M92 136 L92 154 M108 136 L108 154" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                            <ellipse cx="100" cy="85" rx="30" ry="32" fill="url(#student-skin)" />
                            <path d="M68 76 C65 65 72 52 86 52 C90 52 95 54 99 56 C105 52 115 50 124 56 C134 62 134 75 131 82 Z" fill="#292524" />
                            <path d="M85 82 Q90 76 95 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <path d="M105 82 Q110 76 115 82" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <ellipse cx="80" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                            <ellipse cx="120" cy="89" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.4" />
                            <path d="M87 91 Q100 110 113 91 Z" fill="#881337" />
                            <path d="M89 91 Q100 97 111 91" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <polygon points="100,32 132,44 100,54 68,44" fill="#0f172a" />
                            <polygon points="100,54 132,44 132,48 100,58" fill="#1e293b" />
                            <circle cx="100" cy="43" r="2.5" fill="#f59e0b" />
                            <path d="M100 43 Q 120 46 122 58" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <g transform="translate(120, 115) rotate(12)">
                              <rect x="0" y="0" width="30" height="40" rx="3" fill="#ffffff" stroke="#fed7aa" strokeWidth="1.5" />
                              <line x1="6" y1="8" x2="24" y2="8" stroke="#f97316" strokeWidth="2" />
                              <line x1="6" y1="14" x2="20" y2="14" stroke="#cbd5e1" strokeWidth="1.5" />
                              <line x1="6" y1="19" x2="22" y2="19" stroke="#cbd5e1" strokeWidth="1.5" />
                              <text x="7" y="32" fontSize="12" fontWeight="900" fill="#dc2626" fontFamily="sans-serif">
                                A+
                              </text>
                              <circle cx="2" cy="24" r="4.5" fill="url(#student-skin)" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Assignment Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Step-by-step drafting structures, proper citation style reviews (APA/MLA/Harvard), and customized formula guides.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">APA/MLA grading check</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 3: Coursework Tutoring */}
                <a
                  id="pillar-card-2"
                  href="/services/coursework-track"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-coursework');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Syllabus Alignment
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-2s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="prof-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#ffedd5" />
                                <stop offset="75%" stopColor="#fdba74" />
                                <stop offset="100%" stopColor="#f97316" />
                              </radialGradient>
                              <linearGradient id="prof-suit" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#0284c7" fillOpacity="0.2" />
                            <path d="M58 158 C58 136 74 130 100 130 C126 130 142 136 142 158 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#prof-suit)" />
                            <polygon points="100,150 90,130 110,130" fill="#ffffff" />
                            <polygon points="100,135 103,158 100,166 97,158" fill="#ea580c" />
                            <rect x="91" y="118" width="18" height="18" rx="6" fill="url(#prof-skin)" />
                            <path d="M68 84 C66 60 76 46 100 46 C122 46 132 58 132 80 C125 70 110 65 96 66 C82 67 74 74 68 84 Z" fill="#334155" />
                            <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#prof-skin)" />
                            <circle cx="88" cy="85" r="4.5" fill="#0f172a" />
                            <circle cx="112" cy="85" r="4.5" fill="#0f172a" />
                            <circle cx="89.5" cy="83.5" r="1.5" fill="#ffffff" />
                            <circle cx="113.5" cy="83.5" r="1.5" fill="#ffffff" />
                            <path d="M88 98 Q100 114 112 98" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <g transform="translate(116, 122) rotate(-8)">
                              <rect x="0" y="0" width="34" height="46" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                              <rect x="3" y="4" width="28" height="38" rx="3" fill="#f8fafc" />
                              <circle cx="9" cy="12" r="2.5" fill="#10b981" />
                              <line x1="14" y1="12" x2="25" y2="12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="9" cy="20" r="2.5" fill="#10b981" />
                              <line x1="14" y1="20" x2="24" y2="20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="9" cy="28" r="2.5" fill="#f59e0b" />
                              <line x1="14" y1="28" x2="20" y2="28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="2" cy="26" r="4.5" fill="url(#prof-skin)" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Coursework Tutoring
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Comprehensive ongoing syllabus track mentoring. Monitor interactive weekly targets to secure peak score outcomes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Weekly progress reports</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>

                {/* Card 4: Academic Writing Coach */}
                <a
                  id="pillar-card-3"
                  href="/services/essay-reference-checks"
                  className="group relative bg-white border border-slate-200/90 hover:border-orange-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99] sm:active:scale-100"
                  onClick={(e) => {
                    if (!isModifiedAnchorClick(e)) {
                      e.preventDefault();
                      onNavigate('service-essay');
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-orange-50/70 border border-orange-200/60 text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                        Thesis &amp; Citations
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                      <div className="edu-3d-scene w-24 sm:w-full h-24 sm:h-48 shrink-0 rounded-2xl sm:mb-5 flex items-center justify-center relative overflow-visible">
                        <div className="edu-3d-wrapper relative z-10 flex flex-col items-center" style={{ animationDelay: '-3s' }}>
                          <svg
                            className="w-24 h-24 sm:w-44 sm:h-44 filter drop-shadow-[0_10px_16px_rgba(234,88,12,0.25)]"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <radialGradient id="coach-skin" cx="50%" cy="40%" r="50%">
                                <stop offset="0%" stopColor="#fde68a" />
                                <stop offset="70%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#f59e0b" />
                              </radialGradient>
                              <linearGradient id="coach-sweater" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#047857" />
                              </linearGradient>
                              <linearGradient id="gold-pen" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#a16207" />
                              </linearGradient>
                            </defs>
                            <ellipse cx="100" cy="188" rx="44" ry="7" fill="#047857" fillOpacity="0.2" />
                            <circle cx="100" cy="46" r="16" fill="#1c1917" />
                            <path d="M66 85 C64 62 76 52 100 52 C124 52 134 62 134 85 C124 76 112 72 100 72 C88 72 76 76 66 85 Z" fill="#1c1917" />
                            <path d="M58 156 C58 134 74 128 100 128 C126 128 142 134 142 156 L148 184 C148 188 144 190 138 190 L62 190 C56 190 52 188 52 184 Z" fill="url(#coach-sweater)" />
                            <ellipse cx="100" cy="132" rx="18" ry="8" fill="#10b981" />
                            <ellipse cx="100" cy="88" rx="29" ry="32" fill="url(#coach-skin)" />
                            <circle cx="87" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                            <circle cx="113" cy="86" r="11" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                            <line x1="98" y1="86" x2="102" y2="86" stroke="#ea580c" strokeWidth="2.5" />
                            <circle cx="87" cy="86" r="3.5" fill="#1c1917" />
                            <circle cx="113" cy="86" r="3.5" fill="#1c1917" />
                            <circle cx="88.5" cy="84.5" r="1.2" fill="#ffffff" />
                            <circle cx="114.5" cy="84.5" r="1.2" fill="#ffffff" />
                            <path d="M89 101 Q100 114 111 101 Z" fill="#991b1b" />
                            <path d="M91 101 Q100 105 109 101" stroke="#ffffff" strokeWidth="1" fill="#ffffff" />
                            <g transform="translate(126, 80) rotate(-22)">
                              <path d="M12 0 C 14 18, 8 38, 2 56 L 6 58 C 14 38, 24 18, 12 0 Z" fill="url(#gold-pen)" />
                              <polygon points="2,56 4,68 6,58" fill="#ffffff" />
                              <line x1="4" y1="58" x2="4" y2="65" stroke="#713f12" strokeWidth="0.8" />
                              <circle cx="4" cy="69" r="1.5" fill="#fde047" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-orange-650 transition-colors">
                          Academic Writing Coach
                        </h3>
                        <p className="mt-1 sm:mt-2 text-[11px] sm:text-[13px] text-gray-600 leading-snug sm:leading-relaxed font-normal">
                          Outline compelling thesis claims, map critical arguments, proofread sentence syntax, and correct grammar layouts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700">Co-author editing template</span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center group-hover:bg-orange-650 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Academic Excellence | Premium Services Showcase */}
          <section className="bg-[#fcfcfc] text-[#0a0a0a] antialiased py-10 md:py-24 border-b border-gray-100" id="premium-services-showcase">
            {!isMdUp ? (
              <>
                <header className="px-4 pt-2 pb-5">
                  <div className="inline-flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-700 font-sans">
                      ACADEMIC PILLARS
                    </span>
                    <span className="w-6 h-[2px] bg-orange-650 rounded-full"></span>
                  </div>
                  <h2 className="font-extrabold text-[26px] leading-[1.2] text-slate-900 mb-2.5 tracking-tight font-sans">
                    Precision Mentorship for Academic Excellence
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                    Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
                  </p>
                </header>

                <div className="px-4 space-y-4">
                  {/* CARD 1 */}
                  <article id="pillar-1" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=240&q=75"
                          alt="1-1 Academic Tutoring"
                          width={96}
                          height={96}
                          sizes="80px"
                          widths={[80, 160]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=1-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            ACADEMIC MENTORSHIP
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          1. Personalized 1-1 Tutoring Services
                        </h3>
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      In today's competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual's unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/1-on-1-live-tutoring"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-1on1');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('1. Personalized 1-1 Tutoring Services')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book 1-1 Tutoring</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 2 */}
                  <article id="pillar-2" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            LOGIC &amp; REASONING
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          2. Professional Assignment Tutoring &amp; Guidance
                        </h3>
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=240&q=75"
                          alt="Assignment Guidance and Books"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Assgn"
                        />
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/assignment-guidance"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-assignment');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('2. Professional Assignment Tutoring & Guidance')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Assignment Help</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 3 */}
                  <article id="pillar-3" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=240&q=75"
                          alt="Coursework writing & research"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Course"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            MILESTONE MANAGEMENT
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          3. Comprehensive Coursework Tutoring
                        </h3>
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/coursework-track"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-coursework');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('3. Comprehensive Coursework Tutoring')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Coursework Guidance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>

                  {/* CARD 4 */}
                  <article id="pillar-4" className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs scroll-mt-16 transition-all">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                            QUALITY ASSURANCE
                          </span>
                          <span className="w-3.5 h-[1.5px] bg-orange-650 rounded-full"></span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-[17px] text-slate-900 leading-snug">
                          4. Expert Academic Writing Consultation
                        </h3>
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                        <ResponsivePicture
                          src="https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=240&q=75"
                          alt="Scholarly Writing with Fountain Pen"
                          width={96}
                          height={96}
                          sizes="96px"
                          widths={[128, 240]}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          fallbackSrc="https://placehold.co/200x200/1e293b/ffffff?text=Writing"
                        />
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-[1.65] text-slate-600 text-justify mb-3">
                      Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don't just secure academic clarity—they build essential skills that prepare them for future career success.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <a
                        href="/services/essay-reference-checks"
                        onClick={(e) => {
                          if (!isModifiedAnchorClick(e)) {
                            e.preventDefault();
                            onNavigate('service-essay');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-orange-700 hover:underline min-h-[44px] inline-flex items-center py-1 px-1.5 transition cursor-pointer"
                      >
                        Explore Service Page &rarr;
                      </a>
                      <button
                        onClick={() => setPillarBookingService('4. Expert Academic Writing Consultation')}
                        className="text-xs font-bold text-orange-700 inline-flex items-center gap-1 min-h-[44px] py-1 px-2 rounded-lg hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>Book Writing Consultation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                </div>
              </>
            ) : (
              <>
                <div className="max-w-4xl mx-auto text-center px-6 mb-16 md:mb-24">
                  <div className="inline-flex items-center gap-2.5 mb-4 justify-center">
                    <span className="text-orange-650 text-xs font-black tracking-[0.3em] uppercase">Academic Pillars</span>
                    <span className="w-8 h-[1.5px] bg-orange-650"></span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 font-sans mb-6 leading-tight">
                    Precision Mentorship for Academic Excellence
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                    Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
                  </p>
                </div>

                <div className="max-w-6xl mx-auto px-6 space-y-16">
                  {/* 01 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=640&q=76"
                        alt="Personalized 1-1 Academic Tutoring & Mentorship"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 900]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=1-1+Tutoring"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Academic Mentorship</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        1. Personalized 1-1 Tutoring Services
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        In today’s competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual's unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/1-on-1-live-tutoring"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-1on1');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore 1-on-1 Tutoring Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('1. Personalized 1-1 Tutoring Services')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book 1-1 Tutoring Session</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 02 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Logic &amp; Reasoning</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        2. Professional Assignment Tutoring &amp; Guidance
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/assignment-guidance"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-assignment');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Assignment Guidance Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('2. Professional Assignment Tutoring & Guidance')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Assignment Guidance</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=76"
                        alt="Professional Academic Assignment Desk"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 800]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Assignment+Help"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>

                  {/* 03 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=76"
                        alt="Comprehensive Coursework Tutoring Desk"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 900]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Coursework+Tutoring"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Milestone Management</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        3. Comprehensive Coursework Tutoring
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/coursework-track"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-coursework');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Coursework Track Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('3. Comprehensive Coursework Tutoring')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Coursework Guidance</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 04 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                    <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                      <div className="inline-flex items-center gap-2.5 mb-4">
                        <span className="text-orange-650 text-xs font-black tracking-[0.2em] uppercase">Quality Assurance</span>
                        <span className="w-8 h-[1.5px] bg-orange-650"></span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                        4. Expert Academic Writing Consultation
                      </h3>
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify mb-6">
                        Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don't just secure academic clarity—they build essential skills that prepare them for future career success.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="/services/essay-reference-checks"
                          onClick={(e) => {
                            if (!isModifiedAnchorClick(e)) {
                              e.preventDefault();
                              onNavigate('service-essay');
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-650 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Explore Essay &amp; Citations Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPillarBookingService('4. Expert Academic Writing Consultation')}
                          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-850 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-xl transition cursor-pointer"
                        >
                          <span>Book Writing Consultation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=76"
                        alt="Academic Content Writing"
                        width={480}
                        height={340}
                        sizes="(max-width: 1024px) 100vw, 480px"
                        widths={[400, 640, 800]}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        fallbackSrc="https://placehold.co/800x800/fafafa/ff5a00?text=Writing+Support"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Pillar Booking Bottom Sheet Modal */}
            {pillarBookingService && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity"
                onClick={() => setPillarBookingService(null)}
              >
                <div
                  className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 block">
                        INSTANT RESERVATION
                      </span>
                      <h2 className="font-extrabold text-base text-slate-900">Get Matched with a Mentor</h2>
                    </div>
                    <button
                      onClick={() => setPillarBookingService(null)}
                      aria-label="Close booking dialog"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onRaisedConsult(
                        `Pillar Consultation: ${pillarBookingService} | Student: ${
                          pillarBookingName || 'Inquirer'
                        } (${pillarBookingLevel || 'Unspecified'}) | Notes: ${pillarBookingNote || 'None'}`
                      );
                      setPillarBookingToast(true);
                      setPillarBookingService(null);
                      setTimeout(() => setPillarBookingToast(false), 4000);
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Selected Pillar</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg font-medium text-slate-700"
                        value={pillarBookingService}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        required
                        type="text"
                        value={pillarBookingName}
                        onChange={(e) => setPillarBookingName(e.target.value)}
                        placeholder="e.g. Alex Henderson"
                        className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">University / Academic Level</label>
                      <input
                        required
                        type="text"
                        value={pillarBookingLevel}
                        onChange={(e) => setPillarBookingLevel(e.target.value)}
                        placeholder="e.g. Undergraduate Year 2"
                        className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Brief Note / Deadline</label>
                      <textarea
                        rows={2}
                        value={pillarBookingNote}
                        onChange={(e) => setPillarBookingNote(e.target.value)}
                        placeholder="Tell us about your upcoming project or goals..."
                        className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:outline-orange-500"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 min-h-[44px] bg-orange-650 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-650/20 active:scale-[0.99] transition mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Request Callback</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPillarBookingService(null);
                          onNavigate('get-a-quote');
                        }}
                        className="text-[11px] text-slate-600 hover:text-orange-700 underline font-medium min-h-[44px] cursor-pointer"
                      >
                        Or get a detailed price quotation →
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Success Notification Toast */}
            {pillarBookingToast && (
              <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white p-3.5 rounded-xl shadow-xl flex items-center gap-3 transition">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="block font-bold">Request Received</strong>
                  <span className="text-slate-300">An academic advisor will contact you shortly.</span>
                </div>
              </div>
            )}
          </section>

          {/* ==================== Why Consider Online Class Help? ==================== */}
          <section className="bg-amber-50/20 font-sans text-gray-850 antialiased py-20 border-b border-gray-100" id="why-consider-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 uppercase">
                  <span className="text-amber-600 italic block sm:inline mr-2">WHY CONSIDER </span>
                  <span className="italic font-extrabold text-slate-800 block sm:inline">ONLINE CLASS HELP?</span>
                </h2>
                <p className="font-sans text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Online education is a demanding journey. Balancing work, life, and intense curricula leads many students to seek expert intervention. Here's how we bridge the gap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {/* Card 1 */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=76"
                        alt="Not Enough Time"
                        width={400}
                        height={256}
                        sizes="(max-width: 768px) 92vw, 380px"
                        widths={[360, 480, 680]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-700">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Not Enough Time</h3>
                      <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Balancing multiple responsibilities, such as work, family, or extracurricular activities, can leave students with limited time to focus on their classes. Hiring professional help ensures they meet deadlines and maintain their academic standing without sacrificing other aspects of their life.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button
                      onClick={() => openExpertModal('Not Enough Time Support')}
                      className="text-sm font-bold text-orange-650 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px] transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=76"
                        alt="Subjects are Hard"
                        width={400}
                        height={256}
                        sizes="(max-width: 768px) 92vw, 380px"
                        widths={[360, 480, 680]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-700">
                        <Brain className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Subjects are Hard</h3>
                      <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Some courses are more challenging than others, and students often seek assistance from experts who can help them understand difficult concepts. Hiring a professional can provide guidance and support, making challenging subjects easier to handle.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button
                      onClick={() => openExpertModal('Difficult Subject Support')}
                      className="text-sm font-bold text-orange-650 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px] transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=76"
                        alt="Less Stress"
                        width={400}
                        height={256}
                        sizes="(max-width: 768px) 92vw, 380px"
                        widths={[360, 480, 680]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-700">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Less Stress</h3>
                      <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Online learning can be stressful, especially when managing multiple assignments and exams at once. Paying for online class help can significantly reduce stress levels by ensuring that tasks are completed on time and to a high standard.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button
                      onClick={() => openExpertModal('Stress Reduction Support')}
                      className="text-sm font-bold text-orange-650 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px] transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=76"
                        alt="Saving Grades"
                        width={400}
                        height={256}
                        sizes="(max-width: 768px) 92vw, 380px"
                        widths={[360, 480, 680]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-700">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Saving Grades</h3>
                      <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Some students may be at risk of failing their courses or losing scholarships due to poor grades. By hiring an expert to help with assignments and exams, they can improve their grades and protect their academic standing.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button
                      onClick={() => openExpertModal('Grade GPA Rescue')}
                      className="text-sm font-bold text-orange-650 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px] transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 5 */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <ResponsivePicture
                        src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=76"
                        alt="Temporary Problems"
                        width={400}
                        height={256}
                        sizes="(max-width: 768px) 92vw, 380px"
                        widths={[360, 480, 680]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-700">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Temporary Problems</h3>
                      <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Life can throw unexpected challenges at students, such as health issues or personal problems. In such cases, hiring someone to manage their classes ensures they don't fall behind and can stay on track.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button
                      onClick={() => openExpertModal('Emergency Class Assistance')}
                      className="text-sm font-bold text-orange-650 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px] transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 6: CTA Card */}
                <div className="bg-gradient-to-b from-amber-600 to-orange-650 rounded-[2.5rem] shadow-xl p-8 sm:p-10 text-center text-white flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10 shadow-inner mt-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="my-6 max-w-xs">
                    <h3 className="text-3xl font-extrabold mb-4 tracking-tight leading-snug">Ready to Master Your Course?</h3>
                    <p className="text-white text-sm sm:text-base leading-relaxed font-semibold text-center md:text-justify md:px-4">
                      Join 10,000+ students achieving their academic goals with expert support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* New "Why Students Trust Us" grid section (Mounts active viewport variant only) */}
          <section className="bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 py-10 sm:py-16 lg:py-24" id="why-students-trust-us-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {!isMdUp ? (
                <>
                  <div className="text-center max-w-sm mx-auto mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/30 text-amber-800 text-[11px] font-extrabold tracking-wide uppercase mb-2">
                      <span>🛡️ Verified Academic Safety</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-[#0d1b2a] leading-tight">
                      <span className="text-amber-600 uppercase italic">WHY STUDENTS TRUST</span>
                      <br />
                      <span className="text-amber-600 uppercase italic">US</span> FOR SUCCESS
                    </h2>

                    <div className="w-14 h-1 bg-amber-600 rounded-full mx-auto my-2.5"></div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                      Balancing multiple subjects and tight deadlines can be overwhelming. We help students thrive by offering elite technical and human-centric support.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1 max-w-lg mx-auto">
                    {CARDS_DATA.map((card) => (
                      <article
                        key={card.id}
                        className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] flex flex-col justify-between transition-all duration-200"
                      >
                        <div>
                          <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <ResponsivePicture
                              src={card.image}
                              alt={card.title}
                              width={360}
                              height={128}
                              sizes="(max-width: 640px) 90vw, 480px"
                              widths={[320, 480, 700]}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              fallbackSrc={
                                card.fallbackImage ||
                                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=480&q=75'
                              }
                            />
                            <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md shadow-xs flex items-center justify-center border border-white/80">
                              {renderMobileCardBadge(card.badgeType)}
                            </div>
                            <div className="absolute top-2.5 right-2.5 bg-[#0d1b2a]/85 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              {getCardCategoryLabel(card.badgeType)}
                            </div>
                          </div>

                          <div className="px-0.5">
                            <h3 className="font-extrabold text-[#0d1b2a] text-base sm:text-lg leading-snug">
                              {card.title}
                            </h3>
                            <p className="text-xs sm:text-[13px] text-slate-600 mt-1.5 leading-relaxed text-justify">
                              {card.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 px-0.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => setActiveModalId(card.id)}
                            className="text-amber-700 hover:text-amber-800 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1 min-h-[44px] active:scale-95 transition-transform group py-1 pr-2 cursor-pointer"
                          >
                            <span>LEARN MORE</span>
                            <span className="text-amber-700 font-bold group-hover:translate-x-1.5 transition-transform text-sm">
                              →
                            </span>
                          </button>

                          <button
                            onClick={() => onNavigate('get-a-quote')}
                            className="text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-slate-50 px-3 py-1.5 min-h-[44px] inline-flex items-center rounded-lg border border-slate-200/80 active:scale-95 transition-transform cursor-pointer"
                          >
                            Get Quote
                          </button>
                        </div>
                      </article>
                    ))}

                    <div className="mt-6 px-1">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                          <p className="font-extrabold text-sm text-[#0d1b2a]">100%</p>
                          <p className="text-[10px] text-slate-600 font-medium">Discreet VPN</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                          <p className="font-extrabold text-sm text-amber-700">A or B</p>
                          <p className="text-[10px] text-slate-600 font-medium">Grade Promise</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                          <p className="font-extrabold text-sm text-[#0d1b2a]">24/7</p>
                          <p className="text-[10px] text-slate-600 font-medium">Direct Chat</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 animate-fade-in">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase select-none">
                      <span className="italic block sm:inline mr-3 text-amber-600 bg-clip-text">
                        WHY STUDENTS TRUST US{' '}
                      </span>
                      <span className="block sm:inline text-slate-900 font-extrabold">FOR SUCCESS</span>
                    </h2>

                    <div className="w-24 h-1.5 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto my-6 rounded-full"></div>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                      Balancing multiple subjects and tight deadlines can be overwhelming. We help students thrive by offering elite technical and human-centric support.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {CARDS_DATA.map((card) => (
                      <div
                        key={card.id}
                        className="group bg-white border border-slate-100 p-5 sm:p-6 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between rounded-[2rem] text-left"
                      >
                        <div>
                          <div className="relative w-full aspect-[4/3] rounded-[1.8rem] overflow-hidden mb-6 group-hover:shadow-md transition-shadow duration-300">
                            <div className="absolute top-4 left-4 z-10">{renderCardBadge(card.badgeType)}</div>
                            <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all duration-500 z-0" />
                            <ResponsivePicture
                              src={card.image}
                              alt={card.title}
                              width={400}
                              height={300}
                              sizes="(max-width: 1024px) 45vw, 380px"
                              widths={[360, 560, 760]}
                              loading="lazy"
                              className="w-full h-full object-cover select-none transform group-hover:scale-105 transition-transform duration-700 ease-out"
                              fallbackSrc={
                                card.fallbackImage ||
                                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=560&q=75'
                              }
                            />
                          </div>

                          <div className="px-1.5">
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3 group-hover:text-amber-700 transition-colors duration-205 font-sans">
                              {card.title}
                            </h3>

                            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 text-justify">
                              {card.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-1.5 pt-2">
                          <button
                            onClick={() => setActiveModalId(card.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-amber-700 hover:text-amber-800 outline-hidden focus:underline min-h-[44px] cursor-pointer"
                          >
                            <span>LEARN MORE</span>
                            <svg
                              className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ==================== Who Can Benefit From Our Services? ==================== */}
          <section className="bg-[#FCFCFD] text-[#0B1528] py-10 sm:py-16 lg:py-20 px-3.5 sm:px-6 lg:px-8 border-b border-gray-100" id="who-can-benefit-section">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 md:mb-16">
                <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight uppercase leading-tight mb-2 sm:mb-4">
                  <span className="text-amber-600 mr-2">Who Can Benefit </span>
                  <span className="text-[#0B1528]">From Our Services?</span>
                </h2>
                <p className="text-[#475569] text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto px-2">
                  Students seek our help for various reasons. Whether you're balancing a career or overcoming a language barrier, we provide the specialized support you need to thrive.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 xl:gap-8">
                {BENEFIT_CARDS_DATA.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[32px] p-3.5 sm:p-5 xl:p-7 flex flex-col items-start transition-all duration-300 hover:border-[#F99B0C]/40 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-full h-28 sm:h-36 md:h-44 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 relative bg-gradient-to-br from-[#FDF8F0] to-[#FFF1DC] border border-[#FDE3B7] flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center scale-90 sm:scale-100">
                        {renderBenefitPlaceholderSvg(card.badgeType)}
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 tracking-wider uppercase">
                          {card.badgeText}
                        </span>
                      </div>

                      <ResponsivePicture
                        src={card.image}
                        alt={card.imageAlt}
                        width={320}
                        height={176}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
                        widths={[280, 420, 640]}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                          loadedBenefitImages[card.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setLoadedBenefitImages((prev) => ({ ...prev, [card.id]: true }))}
                      />
                    </div>

                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-amber-700 flex items-center justify-center mb-2.5 sm:mb-4 md:mb-5 text-amber-700 shrink-0">
                      {renderBenefitIconSvg(card.badgeType)}
                    </div>

                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#0B1528] mb-1.5 sm:mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-[#475569] text-xs sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed text-justify">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us & Smiling Tutor */}
          <section className="py-20 bg-white border-b border-gray-100 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-left space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-650">
                  The University Tutors Difference
                </span>
                <h2 className="text-3xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                  High-converting support loops configured around academic standards
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      t: '100% Native English Speakers',
                      d: 'All our tutors are credentialed coaches from major English native systems (UK, US, CA, AU, NZ, IE) with verified transcripts.',
                    },
                    {
                      t: 'Stripe Secure Payment Vaults',
                      d: 'Tuition fees are locked in escrow, only released after you confirm final study help meets satisfactory targets.',
                    },
                    {
                      t: 'Plagiarism-Free Referencing',
                      d: 'All advice, custom examples, and structures provided are meticulously compiled reference models.',
                    },
                    {
                      t: '24/7 Priority Emergency Support',
                      d: 'University students live on dynamic schedules. Chat, discuss, and book consultants on-demand.',
                    },
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="p-1 bg-orange-100 rounded-lg h-fit text-orange-700 mt-0.5">
                        <Check className="w-4 h-4 text-orange-700 stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-950 font-sans">{bullet.t}</h3>
                        <p className="text-xs text-gray-600 leading-tight mt-0.5 text-justify">{bullet.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                  <ResponsivePicture
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=76"
                    alt="Smiling senior university tutor reviewing assignment"
                    width={520}
                    height={350}
                    sizes="(max-width: 768px) 92vw, 520px"
                    widths={[360, 520, 760]}
                    loading="lazy"
                    className="w-full object-cover h-[350px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold block text-sm">●</span>
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                      Dr. Clara Stirling Is Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Banner Section */}
          <section className="bg-orange-650 py-20 px-4 md:px-8 text-white relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-white/95 block mb-2">
                Success Stories across target countries
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 font-sans">
                Trusted by 10,000+ Students globally
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-white text-gray-900 p-6 rounded-2xl shadow-lg border border-orange-400 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1 mb-3 text-amber-500">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed italic text-justify">"{t.quote}"</p>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                      <ResponsiveAvatar
                        src={t.avatar}
                        alt={t.name || 'Student Avatar'}
                        sizePx={32}
                        width={32}
                        height={32}
                        loading="lazy"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-950 block">{t.name}</span>
                          <img
                            src={`https://flagcdn.com/w40/${
                              t.flag === '🇬🇧' ? 'gb' : t.flag === '🇨🇦' ? 'ca' : t.flag === '🇺🇸' ? 'us' : t.flag === '🇮🇪' ? 'ie' : 'us'
                            }.png`}
                            alt="Flag"
                            width={16}
                            height={12}
                            loading="lazy"
                            decoding="async"
                            className="w-4 h-3 object-cover rounded-sm border border-gray-200 inline"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[10px] text-gray-600 block leading-tight">{t.uni}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive consultation banner */}
          <section className="py-20 bg-white border-b border-gray-200 px-4 text-center">
            <div className="bg-orange-50 max-w-4xl mx-auto rounded-3xl p-8 md:p-12 border border-orange-100 text-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700 block">
                Consultation Booking
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-950 font-sans tracking-tight">
                Need expert help from Oxford or Ivy League advisors?
              </h2>
              <p className="text-xs md:text-sm text-gray-650 max-w-xl mx-auto text-justify sm:text-center">
                Schedule a 100% free, confidential 15-minute consultation to outline syllabus, verify referential standards, and align with qualified instructors.
              </p>
              <button
                id="book-consultation-home-btn"
                onClick={handleConsultSubmit}
                className="bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-7 py-3.5 min-h-[44px] rounded-xl shadow-lg shadow-orange-650/10 hover:bg-orange-700 transition-colors cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ==================== NON-HOME MARKETING SUBPAGES (LAZY CHUNK) ==================== */}
      {activeView !== 'home' && (
        <React.Suspense
          fallback={
            <div className="py-24 flex justify-center items-center text-orange-650">
              <span className="w-8 h-8 border-2 border-orange-650 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <MarketingSubpages
            activeView={activeView}
            tutors={tutors}
            blogs={blogs}
            faqs={faqs}
            onNavigate={onNavigate}
            onTutorSelect={onTutorSelect}
            onRaisedConsult={onRaisedConsult}
          />
        </React.Suspense>
      )}

      {/* ==================== EXPERT POPUP MODAL ==================== */}
      {isExpertModalOpen && (
        <div
          id="expert-modal"
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center animate-fade-in animate-duration-200"
          aria-labelledby="modal-title-text"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
            onClick={closeExpertModal}
          ></div>

          <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-orange-100 relative z-10 mx-4">
            <button
              onClick={closeExpertModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-orange-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {modalFormStep === 'form' ? (
              <div id="form-screen" className="p-8 sm:p-10">
                <div className="flex items-center mb-6">
                  <picture>
                    <source type="image/avif" srcSet="/logo-220.avif 220w, /logo-440.avif 440w" sizes="180px" />
                    <source type="image/webp" srcSet="/logo-220.webp 220w, /logo-440.webp 440w" sizes="180px" />
                    <img
                      src="/logo.webp"
                      alt="Uni Tutors"
                      width={180}
                      height={68}
                      loading="lazy"
                      decoding="async"
                      className="h-10 sm:h-12 w-auto object-contain"
                    />
                  </picture>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-1 font-sans tracking-tight" id="modal-title-text">
                  {modalTitleText}
                </h2>
                <p className="text-gray-600 text-xs mb-6">
                  Fill out this fast matching form. Your details will stay strictly confidential.
                </p>

                <form id="lead-form" onSubmit={handleLeadFormSubmit} className="space-y-4">
                  <input type="hidden" id="inquiry-source" name="source" value={modalSource} />

                  <div>
                    <label
                      htmlFor="student-name"
                      className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="student-name"
                      required
                      placeholder="John Doe"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="student-email"
                      className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="student-email"
                      required
                      placeholder="you@example.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="class-subject"
                      className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      Syllabus / Course Subject
                    </label>
                    <select
                      id="class-subject"
                      value={leadSubject}
                      onChange={(e) => setLeadSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-700 font-medium"
                    >
                      <option value="Mathematics & Statistics">Mathematics &amp; Statistics</option>
                      <option value="Nursing & Healthcare">Nursing &amp; Healthcare</option>
                      <option value="Business & Finance">Business &amp; Finance</option>
                      <option value="Computer Science">Computer Science &amp; IT</option>
                      <option value="Literature & Humanities">Literature &amp; Essays</option>
                      <option value="Natural Sciences">Biology, Chemistry, Physics</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-650 hover:bg-orange-700 text-white font-bold py-3.5 min-h-[44px] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm tracking-wide mt-3 cursor-pointer"
                  >
                    Connect with My Expert &rarr;
                  </button>
                </form>
              </div>
            ) : (
              <div id="success-screen" className="p-8 sm:p-10 text-center animate-fade-in animate-duration-250">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 font-sans tracking-tight">
                  Request Submitted!
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                  An expert academic coordinator has been notified. We will reach out to you within the next 15 minutes to evaluate your course structure.
                </p>
                <button
                  onClick={closeExpertModal}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase px-6 py-2.5 min-h-[44px] rounded-xl transition duration-200 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Detail Modal Block */}
      {activeCardForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setActiveModalId(null)}
          />

          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 z-10 max-h-[90vh] flex flex-col transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-48 sm:h-60 w-full overflow-hidden flex-shrink-0">
              <ResponsivePicture
                src={activeCardForModal.image}
                alt={activeCardForModal.title}
                width={672}
                height={240}
                loading="eager"
                sizes="(max-width: 640px) 92vw, 672px"
                widths={[480, 672]}
                fallbackSrc={activeCardForModal.fallbackImage}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setActiveModalId(null)}
                aria-label="Close details modal"
                className="absolute top-4 right-4 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/85 hover:bg-slate-950 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md focus:outline-hidden cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/25 text-white backdrop-blur-xs mb-2">
                  {activeCardForModal.badgeType} support
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeCardForModal.title}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-left">
              <h3 className="text-lg font-black tracking-tight text-amber-700">
                {activeCardForModal.extraDetails.headline}
              </h3>

              {activeCardForModal.extraDetails.paragraphs.map((p, idx) => (
                <p key={idx} className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                  {p}
                </p>
              ))}

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Core Performance Metrics
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {activeCardForModal.extraDetails.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                      <span className="block text-xl font-extrabold text-slate-800">{stat.value}</span>
                      <span className="text-[10px] font-semibold text-slate-600 block mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-600 font-medium text-center sm:text-left">
                Need deeper insights? Contact our representative desks.
              </span>
              <button
                onClick={() => setActiveModalId(null)}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-transform duration-150 active:scale-95 shadow-md cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(MarketingPages);
