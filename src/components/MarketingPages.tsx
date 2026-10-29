import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  ThumbsUp,
  Share2,
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Check, 
  CheckCircle,
  Star, 
  ChevronDown, 
  Sparkles, 
  FileText, 
  Video, 
  Calendar, 
  HelpCircle,
  Award,
  BookOpen,
  Send,
  Upload,
  User as UserIcon,
  MessageSquare,
  Brain,
  Heart,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  X
} from 'lucide-react';
import { User, Blog, FAQ, UserRole } from '../types';
import DedicatedServicePages from './DedicatedServicePages';
import HowItWorksSection from './HowItWorksSection';
import SEOKeywordLinksBlock from './SEOKeywordLinksBlock';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import heroAssignmentImg from '../assets/images/hero_assignment_guidance_1787387387028.jpg';
import heroCourseworkImg from '../assets/images/hero_coursework_tracks_1787387403661.jpg';
import heroEssayImg from '../assets/images/hero_essay_rhetoric_1787387419893.jpg';

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
  badgeType: string;
  extraDetails: {
    headline: string;
    paragraphs: string[];
    stats: { label: string; value: string }[];
  };
}

const CARDS_DATA: CardData[] = [
  {
    id: 1,
    title: "Instant Help When You Need It",
    description: "Get immediate assistance through our live chat, connecting you with experts who can quickly resolve your questions and concerns.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
    badgeType: "instant",
    extraDetails: {
      headline: "How our Instant Live Chat Routing Works",
      paragraphs: [
        "We maintain a active standby network of over 150 subject-matter experts spanning computer science, advanced physics, finance, and humanities.",
        "When you initiate a query, our cognitive routing engine parses your questions and pairs you with a top-rated academic specialist in under 45 seconds.",
        "Collaborate in real-time with screen share, live terminal sessions, LaTeX math renders, and inline code execution modules right inside the chat bubble."
      ],
      stats: [
        { label: "Avg. Connection", value: "34s" },
        { label: "Expert Rating", value: "4.95" },
        { label: "First Contact Resolution", value: "92%" }
      ]
    }
  },
  {
    id: 2,
    title: "24/7 Access to Real Representatives",
    description: "Access study materials, videos, and direct support from our team anytime, anywhere. Our round-the-clock availability means support at your own pace.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    badgeType: "agents",
    extraDetails: {
      headline: "Human-Centric Customer Success Teams",
      paragraphs: [
        "No robotic auto-responders or circular phone trees. Our global network is fully staffed by expert academic advisors and tech support specialists across 5 continents.",
        "We understand student stress doesn't stick to 9-to-5 schedules. Whether it's 3:00 AM before a major portfolio review or mid-day on Sunday, a real, helpful advisor is ready to guide you.",
        "Get personalized onboarding setups, syllabus analysis, and direct calendar synchronizations tailored directly to your semesters' schedule."
      ],
      stats: [
        { label: "Availability", value: "365/24/7" },
        { label: "Satisfaction", value: "99.2%" },
        { label: "Supported Timezones", value: "All" }
      ]
    }
  },
  {
    id: 3,
    title: "Accessible Learning for All",
    description: "Our platform is flexible and accessible on your phone, tablet, or computer. Continue learning wherever you are with a seamless digital interface.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&auto=format&fit=crop&q=80",
    badgeType: "accessible",
    extraDetails: {
      headline: "Cross-Platform Syncing & Responsive Technology",
      paragraphs: [
        "Pick up exactly where you left off. Start a problem set on your campus desktop, verify equations on your phone while commuting, and finalize submissions on your iPad.",
        "Our digital platform is lightweight, highly optimized for poor mobile network conditions, and natively meets WCAG 2.2 AAA accessibility compliance.",
        "Enable offline mode to access pre-downloaded study sheets, lecture video transcripts, and review quizzes without consuming cellular data data plans."
      ],
      stats: [
        { label: "Devices Synced", value: "Unlimited" },
        { label: "Offline Mode support", value: "Enabled" },
        { label: "App Store Rating", value: "4.8" }
      ]
    }
  },
  {
    id: 4,
    title: "Expert-Driven Academic Support",
    description: "Get personalized assistance from top-rated experts who provide in-depth understanding and guidance on complex, high-level academic topics.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80",
    badgeType: "expert",
    extraDetails: {
      headline: "Vetted Faculty & Technical Professionals",
      paragraphs: [
        "We reject standard mechanical answers. Our experts teach you the underlying fundamentals, logic, and concepts so you feel empowered to handle subsequent projects solo.",
        "Every academic specialist undergoes thorough credential verification, identity checks, and real-world teaching simulation reviews prior to taking calls.",
        "Receive visual workflow breakdowns, step-by-step logic sheets, and personalized follow-up study recommendations curated for your curriculum."
      ],
      stats: [
        { label: "PhD-Level Mentors", value: "45%" },
        { label: "Fields Covered", value: "180+" },
        { label: "Active Experts", value: "12,000+" }
      ]
    }
  },
  {
    id: 5,
    title: "Real-Time Progress Monitoring",
    description: "Stay on top of your academic performance with a live progress dashboard that helps you track assignments, deadlines, and improvements.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80",
    badgeType: "progress",
    extraDetails: {
      headline: "Next-Gen Academic Performance Dashboard",
      paragraphs: [
        "Visualize your grades, assignment schedules, and concept proficiency with clarity using interactive charts and predictive predictive analytics engines.",
        "Set custom goals, benchmark your learning speed against past trends, and receive push reminders when assignment milestones approach.",
        "Share progress overviews with parents, university counselors, or advisors instantly using encrypted export tokens and clean reporting metrics."
      ],
      stats: [
        { label: "Data Latency", value: "<1s" },
        { label: "Accuracy", value: "100%" },
        { label: "Export formats", value: "PDF/XLS" }
      ]
    }
  },
  {
    id: 6,
    title: "Syllabus-Based Custom Quotation",
    description: "No generic standard pricing. Receive custom, fair binding quotes negotiated directly with experts tailored perfectly to your specific requirements.",
    image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&auto=format&fit=crop&q=80",
    badgeType: "pricing",
    extraDetails: {
      headline: "Negotiate Fair Pricing per Milestone",
      paragraphs: [
        "We reject standard subscription charges and cookie-cutter pricing packages. Instead, we support a completely customized proposal flow based solely on your specific syllabus, task complexity, and urgency.",
        "You always discuss and agree on custom quotes in real-time. Once accepted, funds are held securely in escrow and only disbursed to the tutor after you review and approve the finalized academy milestone.",
        "This transparent matching and quotation workflow ensures absolute safety, maximum alignment with your study budget, and 100% control over payments."
      ],
      stats: [
        { label: "Quotation Fee", value: "$0 upfront" },
        { label: "Active Escrow", value: "100% Secure" },
        { label: "Hourly Option", value: "Flexible" }
      ]
    }
  }
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
    title: "Busy People",
    description: "Many students juggle work, family, and academic responsibilities. We help them manage everything effortlessly by ensuring their coursework is completed on time and to a high standard.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Busy workspace and schedule planner",
    badgeText: "Busy People",
    badgeType: "busy"
  },
  {
    id: 2,
    title: "Grade Seekers",
    description: "Whether in a challenging course or simply aiming for higher marks, our experts provide the support needed to get better grades and excel in school.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Students studying together aiming for high scores",
    badgeText: "Grade Seekers",
    badgeType: "grades"
  },
  {
    id: 3,
    title: "Adult Learners",
    description: "Adults who are returning to school or looking to change careers often face busy schedules. Our services help them keep up with their classes and stay on top of assignments.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Adult learner working on assignments",
    badgeText: "Adult Learners",
    badgeType: "adults"
  },
  {
    id: 4,
    title: "Need Extra Help",
    description: "Some students may struggle to understand course material. We offer one-on-one tutoring to explain difficult concepts in a way that makes sense to them.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Supportive classroom tutoring and extra help",
    badgeText: "Extra Help",
    badgeType: "extra"
  },
  {
    id: 5,
    title: "ESL Students",
    description: "Students who may not be fluent in English can benefit from our assistance in ensuring their schoolwork is written clearly and correctly, helping them succeed academically.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Multicultural university students studying English",
    badgeText: "ESL Students",
    badgeType: "esl"
  },
  {
    id: 6,
    title: "Exam Preparation",
    description: "Preparing for major exams, including finals or standardized tests, can be stressful. We provide practice tests and study materials to help students feel ready and confident.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Exam schedule calendars, notes, and study guides",
    badgeText: "Exam Prep",
    badgeType: "prep"
  },
  {
    id: 7,
    title: "Clearer Logic",
    description: "If students need help understanding concepts from a different perspective, our tutors can offer clearer explanations that make learning easier.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Organizing thoughts logically using flow diagrams",
    badgeText: "Clearer Logic",
    badgeType: "logic"
  },
  {
    id: 8,
    title: "Tech Challenges",
    description: "Some students need assistance with using online learning platforms and technology. We guide them through the process so they become more comfortable with their online studies.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Students navigating online courses and modern tech panels",
    badgeText: "Tech Challenges",
    badgeType: "tech"
  }
];

const renderBenefitPlaceholderSvg = (type: string) => {
  switch (type) {
    case "busy":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "grades":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "adults":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.489v3.076" />
        </svg>
      );
    case "extra":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0112 15c2.207 0 4.13.17 5.74 1.2a3.007 3.007 0 011.04 1.838zM21 12a3 3 0 11-6 0 3 3 0 016 0zm-9.74 6.72a9.094 9.094 0 00-3.741-.479 3 3 0 004.682-2.72m-.94 3.198l-.001.031a1.21 1.21 0 01.037.666A11.944 11.944 0 0012 21c2.17 0 4.207-.576 5.963-1.584A6.062 6.062 0 0012 15c-2.207 0-4.13.17-5.74 1.2a3.007 3.007 0 00-1.04 1.838zM3 12a3 3 0 116 0 3 3 0 01-6 0z" />
        </svg>
      );
    case "esl":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
        </svg>
      );
    case "prep":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    case "logic":
      return (
        <svg className="w-10 h-10 mb-2 text-[#F99B0C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" className="opacity-30" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17c0 .414-.336.75-.75.75s-.75-.336-.75-.75.336-.75.75-.75.75.336.75.75zM14.25 17c0 .414-.336.75-.75.75s-.75-.336-.75-.75.336-.75.75-.75.75.336.75.75z" />
        </svg>
      );
    case "tech":
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
    case "busy":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    case "grades":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      );
    case "adults":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    case "extra":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2a5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"></path>
        </svg>
      );
    case "esl":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      );
    case "prep":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
        </svg>
      );
    case "logic":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      );
    case "tech":
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

const STATIC_FAQS: FAQ[] = [
  {
    id: 'static_faq_1',
    question: 'How do you vet your academic tutors?',
    answer: 'Every tutor on universitytutors.com is rigorously vetted. We verify their academic transcripts, conduct subject-matter exam assessments, and host live screening video sessions before onboarding. All tutors hold a minimum of a Bachelor\'s degree with honors, and over 65% hold Masters or PhD qualifications from premier institutions in the UK, US, CA, AU, and NZ.',
    category: 'General',
    order: 1
  },
  {
    id: 'static_faq_2',
    question: 'How do Stripe payment holds/escrow work?',
    answer: 'Your safety is our top priority. When you agree on a quote from your tutor and click "Proceed to Payment", your funds are held in a secure Stripe-enabled escrow account. Money is only released to the tutor after you click "Confirm & Approve Delivery" on your dashboard. If the tutor fails to deliver or if you request revisions, the funds remain securely locked. If a dispute arises, the Admin Panel reviews it and issues a full refund where applicable.',
    category: 'Payments',
    order: 1
  },
  {
    id: 'static_faq_3',
    question: 'Are your services ethical and aligned with University policies?',
    answer: 'Absolutely. We provide strictly ethical academic guidance. Our tutors explain concepts, review research methodologies, structure essays, provide line-by-line feedback, and compile custom explanatory study examples. We do NOT condone contract cheating, ghostwriting, or exam-impersonation. All materials provided are intended as reference models for study purposes.',
    category: 'Tutoring Process',
    order: 1
  },
  {
    id: 'static_faq_4',
    question: 'What is your revision and refund policy?',
    answer: 'If the tutorial advice or sample example provided does not meet your initial briefing, you have 7 days from tutor delivery to click the "Request Revision" button on your assignment card. You can describe what parts require optimization. It is 100% free of charge. If disputes remain unresolved, an administrator will step in to arbitrate.',
    category: 'Revisions & Refunds',
    order: 1
  },
  {
    id: 'static_faq_5',
    question: 'How do I schedule a Live 1-on-1 whiteboarding slot?',
    answer: 'After selecting "1-on-1 Live Tutoring" and selecting a tutor, you can open their chat and select dates from their interactive calendar slots. Tutors support live interactive video sessions with real-time whiteboards directly inside our app.',
    category: 'Technical Issues',
    order: 1
  },
  {
    id: 'static_faq_6',
    question: 'Are there any hidden service charges or sign-up fees?',
    answer: 'None at all. Registering an account is completely free for both students and tutors. The prices you see on quote cards are fully transparent and include all platform processing fees. There are no recurring subscription charges or hidden commissions.',
    category: 'Payments',
    order: 2
  },
  {
    id: 'static_faq_7',
    question: 'What subjects and disciplines do you support?',
    answer: 'Our professional mentoring network covers a broad spectrum of academic specialties. This includes STEM disciplines (Mathematics, Statistics, Organic Chemistry, Biochemistry, Computer Science, AI & Machine Learning), Humanities (History, Literature, Sociology), Business & Economics (Corporate Finance, Micro/Macroeconomics, Accounting, Quantitative Analysis), as well as selective fields such as Legal Studies, Nursing Science, and Dissertation Methodology design.',
    category: 'General',
    order: 2
  },
  {
    id: 'static_faq_8',
    question: 'Can I request a specific tutor for a long-term coursework program?',
    answer: 'Yes! If you find a tutor whose coaching methodology matches your learning style, you can request them for long-term study partnerships. You can message them directly through our secure chat to structure custom weekly milestones, outline multi-phase projects, and secure continuous feedback throughout your academic semester.',
    category: 'Tutoring Process',
    order: 2
  },
  {
    id: 'static_faq_9',
    question: 'How can I contact platform support if I encounter a system bug?',
    answer: 'Our operational technical support is available 24/7. You can instantly submit a Support Ticket directly from your dashboard or email our dedicated administrative helpline at support@universitytutors.com. Our senior team typically replies and resolves system issues within a two-hour window.',
    category: 'Technical Issues',
    order: 2
  },
  {
    id: 'static_faq_10',
    question: 'What happens if a tutor submits work late?',
    answer: 'If a tutoring session or model asset delivery is delayed past the agreed-on deadline, you can raise an immediate de-escalation warning. Under our platform standards, late submissions qualify the student client for automatic adjustments or a full escrow refund if the utility of the reference work has been compromised.',
    category: 'Revisions & Refunds',
    order: 2
  },
  {
    id: 'static_faq_11',
    question: 'Is my personal information and academic identity kept secure?',
    answer: 'Absolutely. We enforce robust privacy controls. Your registration email address, real name, and academic institution details are strictly shielded. Tutors and students only interact using their verified operational usernames, and we never share your data or database records with third-party networks or academic bodies.',
    category: 'General',
    order: 3
  },
  {
    id: 'static_faq_12',
    question: 'How do I submit essays or files for review?',
    answer: 'Inside your secure portal, you can create a dissertation or assignment card and upload documents (MS Word files, PDFs, or raw programmatic scripts) directly to our sandboxed assignment workbench. Our integrated viewers allow tutors to make inline annotations, leave comments, and attach video-guided feedback.',
    category: 'Technical Issues',
    order: 3
  },
  {
    id: 'static_faq_13',
    question: 'Who resolves disputes if a tutor does not follow the rubric guidelines?',
    answer: 'In the rare event of a disagreement, you can launch a dispute directly on the active assignment. This blocks the Stripe escrow payout from being released. The Academic Arbitration Council of University-Tutors will step in to inspect files, chat instructions, and milestone rubrics, issuing a balanced and fair verdict.',
    category: 'Revisions & Refunds',
    order: 3
  },
  {
    id: 'static_faq_14',
    question: 'What is the duration of a standard live tutoring session?',
    answer: 'Live sessions are scheduled in flexible 30-minute, 60-minute, or 90-minute intervals. Tutors will collaborate with you to define structural agendas beforehand, maximizing active learning outcomes.',
    category: 'Tutoring Process',
    order: 3
  },
  {
    id: 'static_faq_15',
    question: 'Which payment options are supported?',
    answer: 'Our checkout gateways are securely built on Stripe, accepting all major credit/debit cards (Visa, Mastercard, American Express, Discover), as well as digital wallets like Apple Pay and Google Pay. Bank transfers can be arranged for custom premium accounts.',
    category: 'Payments',
    order: 3
  }
];

export default function MarketingPages({ 
  activeView, 
  tutors, 
  blogs, 
  faqs, 
  onNavigate,
  onTutorSelect,
  onSelectTutorProfile,
  onRaisedConsult,
  onGoogleConnect
}: MarketingPagesProps) {
  
  // FAQs State
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Services Tab State
  const [activeServiceTab, setActiveServiceTab] = useState<number>(0);
  const [activeServiceFaqId, setActiveServiceFaqId] = useState<string | null>(null);

  // Dedicated Service Views State (null shows beautiful grid overview)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Interactive Tools state for individual service pages
  // 1. 1-on-1 Tutoring Rate and Session Estimator
  const [calcLevel, setCalcLevel] = useState<string>('undergraduate');
  const [calcSubject, setCalcSubject] = useState<string>('stem');
  const [calcHours, setCalcHours] = useState<number>(4);
  const [calcSlotSelected, setCalcSlotSelected] = useState<string>('Today 5:00 PM');

  // 2. Assignment diagnostic checker
  const [checkText, setCheckText] = useState<string>('');
  const [checkResults, setCheckResults] = useState<{ checked: boolean; score: number; feedback: string[] } | null>(null);
  const [isCheckingLine, setIsCheckingLine] = useState<boolean>(false);

  // 3. Coursework Roadmap milestones
  const [courseCodeName, setCourseCodeName] = useState<string>('MATH-202');
  const [courseGradeGoal, setCourseGradeGoal] = useState<string>('A');
  const [courseCompletedMilestones, setCourseCompletedMilestones] = useState<Record<number, boolean>>({ 0: true });

  // 4. Essay Hook & thesis statement optimizer
  const [essayTopic, setEssayTopic] = useState<string>('');
  const [essayTone, setEssayTone] = useState<string>('persuasive');
  const [essayOptimized, setEssayOptimized] = useState<{ before: string; after: string; comment: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('service inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFile, setContactFile] = useState<string>('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Blog Details state
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Clear selected blog or services when navigating to separate views
  useEffect(() => {
    setSelectedBlog(null);
    setSelectedServiceId(null);
  }, [activeView]);

  // Sync state between sibling child views if lateral jump takes place
  useEffect(() => {
    const handleServiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedServiceId(customEvent.detail);
      }
    };
    window.addEventListener('change-dedicated-service', handleServiceChange);
    return () => {
      window.removeEventListener('change-dedicated-service', handleServiceChange);
    };
  }, []);

  // Better browseability & search state for Blog Hub
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogActiveCategory, setBlogActiveCategory] = useState('All');

  // Interactive claps
  const [blogClaps, setBlogClaps] = useState<Record<string, number>>({
    'blog_1': 118,
    'blog_2': 84
  });

  // Dynamic academic comments per post
  interface BlogComment {
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
  }
  const [blogComments, setBlogComments] = useState<Record<string, BlogComment[]>>({
    'blog_1': [
      { id: 'c1', author: 'Markus Vance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', content: 'As a second-year student, this Harvard guide has saved me so much headache on my final papers. Simple block templates and exact in-text guidelines are invaluable!', timestamp: '2 days ago' },
      { id: 'c2', author: 'Dr. Clara Stirling (Tutor)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', content: 'Always check if your university requires double punctuation before citations! That is the most common reason lecturers deduct marks on references.', timestamp: '1 day ago' }
    ],
    'blog_2': [
      { id: 'c3', author: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', content: 'The time-boxed chapters guide is fantastic. Do you offer methodological advice for quantitative SPSS models in chemistry dissertation drafts?', timestamp: '3 days ago' },
      { id: 'c4', author: 'Liam Kennedy (Tutor)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', content: 'Absolutely, Elena! Most of our quantitative tutors can help compile sample tables and explain dataset distributions. Select Dissertation tutoring to connect!', timestamp: '12 hours ago' }
    ]
  });

  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentTxt, setNewCommentTxt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCitation = (blog: Blog) => {
    const citationText = `University-Tutors. (2026). ${blog.title}. Academic Guides & Mentorship Articles. Retrieved from https://universitytutors.com/blog/${blog.id}`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(blog.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Diagnostic simulator handler
  const handleRunDiagnostic = () => {
    if (!checkText.trim()) {
      alert("Please provide or load some draft text to analyze!");
      return;
    }
    setIsCheckingLine(true);
    setCheckResults(null);
    setTimeout(() => {
      setIsCheckingLine(false);
      const wordCount = checkText.trim().split(/\s+/).length;
      let score = 82;
      let feedback = [
        "Structure looks strong. Main argument flow aligns correctly with standard peer review guidance.",
        "Include more empirical transitions at the end of paragraphs to bind sentences securely.",
        "Check citation formats: make sure author names and page offsets match Harvard/APA rules."
      ];
      if (wordCount < 10) {
        score = 55;
        feedback = [
          "Input length is too short for comprehensive rubric diagnostic.",
          "Write at least a full paragraph of introduction including your primary assertion thesis."
        ];
      } else if (checkText.toLowerCase().includes("therefore") || checkText.toLowerCase().includes("consequently")) {
        score = 94;
        feedback = [
          "Excellent empirical flow! Connective logical phrases are highly aligned with academic prose guidelines.",
          "Thesis assertion is clearly positioned early in the paragraph.",
          "Review font size parameters and double-line spacing margins before export."
        ];
      }
      setCheckResults({ checked: true, score, feedback });
    }, 1200);
  };

  // Tone optimizer handler
  const handleOptimizeTone = () => {
    if (!essayTopic.trim()) {
      alert("Please enter a short thesis or prompt theme to refine!");
      return;
    }
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      let before = essayTopic;
      let after = "";
      let comment = "";

      if (essayTone === 'persuasive') {
        after = `By synthesizing dynamic empirical analysis, this study posits that ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} serves as a primary paradigm shift in institutional performance.`;
        comment = "Replaced self-referential introductory filters ('I think', 'My essay is about') with an authoritative, objective claim prefix and added academic prose attributes.";
      } else if (essayTone === 'analysis') {
        after = `A critical examination reveals that ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} is fundamentally predicated on localized structural shifts rather than isolated variables.`;
        comment = "Refined descriptive text into an analytical predicate modeling academic critical reasoning standards.";
      } else {
        after = `This scholarly inquiry explores how ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} demonstrates significant rhetorical resonance across current historical contexts.`;
        comment = "Formatted narrative components into formal scholarly nomenclature suitable for admission and statements reviews.";
      }
      setEssayOptimized({ before, after, comment });
    }, 1000);
  };

  const handleAddCommentSubmit = (e: React.FormEvent, blogId: string) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentTxt.trim()) return;

    const newComment: BlogComment = {
      id: 'comment_' + Math.random().toString(36).substring(2, 9),
      author: newCommentName.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      content: newCommentTxt.trim(),
      timestamp: 'Just now'
    };

    setBlogComments(prev => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), newComment]
    }));

    setNewCommentName('');
    setNewCommentTxt('');
  };

  const renderBlogContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;
      
      // Header check (starting with ###)
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '');
        return (
          <h4 key={idx} className="text-lg md:text-xl font-bold text-gray-950 font-sans tracking-tight mt-6 mb-3 border-b border-gray-100 pb-1">
            {headerText}
          </h4>
        );
      }
      
      // Styled lists
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const listText = trimmed.replace(/^[*+-]\s*/, '');
        return (
          <div key={idx} className="flex gap-2.5 items-start pl-4 py-1.5">
            <span className="text-orange-500 font-bold mt-1 text-sm">•</span>
            <p className="text-xs md:text-sm text-gray-650 leading-relaxed font-sans">{listText}</p>
          </div>
        );
      }

      // Numbered headings (e.g. "Step 1:" or "1.")
      if (trimmed.startsWith('Step ') || /^\d+\./.test(trimmed)) {
        return (
          <h4 key={idx} className="text-xs md:text-sm uppercase tracking-wider font-extrabold text-orange-600 font-sans mt-5 mb-2">
            {trimmed}
          </h4>
        );
      }
      
      // Regular paragraph
      return (
        <p key={idx} className="text-xs md:text-sm text-gray-700 leading-relaxed font-sans mb-4">
          {trimmed}
        </p>
      );
    });
  };

  const consolidatedFaqs: FAQ[] = [...faqs];
  STATIC_FAQS.forEach(sf => {
    if (!consolidatedFaqs.some(f => f.question.toLowerCase().trim() === sf.question.toLowerCase().trim() || f.id === sf.id)) {
      consolidatedFaqs.push(sf);
    }
  });

  const filterFaqs = consolidatedFaqs.filter(faq => {
    const matchesCategory = faqCategory === 'All' || faq.category === faqCategory;
    const matchesKeyword = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                           faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  const categories = ['All', 'General', 'Payments', 'Tutoring Process', 'Technical Issues', 'Revisions & Refunds'];

  // Testimonials with local country info and top universities from US, UK, CA, AU, NZ, IE
  const testimonials = [
    { name: 'Chloe Gallagher', uni: 'Oxford University, UK', flag: '🇬🇧', rating: 5, quote: 'The MLA Essay formatting provided by Dr. Clara Stirling was absolutely brilliant. She helped me restructure my thesis outline, enhancing the logical progression of my argument.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
    { name: 'Michael Chen', uni: 'University of Toronto, Canada', flag: '🇨🇦', rating: 5, quote: 'Stripe escrow is amazing. I felt 100% safe locking the math coursework fee. Liam Kennedy explained advanced calculus steps clearly, and my grades improved in weeks!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
    { name: 'Aaliyah Jackson', uni: 'New York University, USA', flag: '🇺🇸', rating: 5, quote: 'Very responsive tutors. Their Computer Science tutor James solved my binary search tree recursion questions. The live whiteboard felt like we were sitting in the same library.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80' },
    { name: 'Jack O\'Sullivan', uni: 'Trinity College Dublin, Ireland', flag: '🇮🇪', rating: 5, quote: 'The research chemistry sample outline compiled by Dr. Siobhan was extremely helpful. Clean formatting, perfect citations, and 24/7 support throughout. Recommend universitytutors to all!', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80' }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRaisedConsult(`Inquiry raised by ${contactName} (${contactEmail}) under category: ${contactSubject}.\nMessage: ${contactMessage}`);
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactFile('');
      setContactSuccess(false);
    }, 4000);
  };

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
  const activeCardForModal = CARDS_DATA.find(c => c.id === activeModalId);

  // Render SVG badges corresponding exactly to card contexts
  const renderCardBadge = (type: string) => {
    const baseStyle = "w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:rotate-12";
    
    switch (type) {
      case "instant":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        );
      case "agents":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        );
      case "accessible":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
        );
      case "expert":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9a48.62 48.62 0 018.232-4.406 60.43 60.43 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A5.905 5.905 0 018 3.743 94.907 94.907 0 0112 3c1.255 0 2.443.08 3.6.236a5.905 5.905 0 013.924 5.591c0 .285-.02.569-.06.85m-15.198 0l-.014-.007a5.137 5.137 0 00-3.57.06m15.198 0l.014-.007a5.137 5.137 0 013.57.06M12 12.75a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
            </svg>
          </div>
        );
      case "progress":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-3.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
        );
      case "pricing":
        return (
          <div className={baseStyle}>
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
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

  // Lead Form field states
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubject, setLeadSubject] = useState('Mathematics & Statistics');
  const [loadedBenefitImages, setLoadedBenefitImages] = useState<Record<number, boolean>>({});

  const openExpertModal = (sourceName: string) => {
    setModalSource(sourceName);
    
    // Customize form titles dynamically based on clicked source
    if (sourceName.includes('Time')) {
      setModalTitleText("Reclaim Your Hours");
    } else if (sourceName.includes('Subject')) {
      setModalTitleText("Master Hard Concepts");
    } else if (sourceName.includes('Stress')) {
      setModalTitleText("Reduce Academic Stress");
    } else if (sourceName.includes('Grade')) {
      setModalTitleText("Rescue & Secure Your Grades");
    } else if (sourceName.includes('Emergency')) {
      setModalTitleText("Emergency Crisis Help");
    } else {
      setModalTitleText("Connect with an Expert");
    }

    setModalFormStep('form');
    setIsExpertModalOpen(true);
  };

  const closeExpertModal = () => {
    setIsExpertModalOpen(false);
  };

  const handleLeadFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting secure query payload:", {
      name: leadName,
      email: leadEmail,
      subject: leadSubject,
      source: modalSource
    });
    
    onRaisedConsult(`New interactive online class help inquiry: ${leadName} (${leadEmail}) for ${leadSubject} via ${modalSource}`);
    setModalFormStep('success');
  };

  return (
    <div id="marketing-pages-view" className="bg-white font-sans text-gray-800">
      
      {/* ==================== 1. HOME PAGE ==================== */}
      {activeView === 'home' && (
        <div id="home-section" className="animate-fade-in">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white py-16 md:py-24 border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col lg:flex-row items-center gap-12 relative z-10">
              
              <div className="flex-1 text-left space-y-6">
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-650 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-4 h-4 text-orange-600 animate-spin" />
                  Your Global Partner for Academic Success
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-bold tracking-tight text-gray-950 font-sans leading-tight">
                  Expert Tutors for Every <span className="text-orange-500 relative inline-block">University Subject</span> <br className="hidden md:inline" />
                  Online, On‑Demand
                </h1>
                
                <p className="text-sm md:text-base text-gray-650 max-w-2xl leading-relaxed text-justify">
                  Get 1-on-1 academic tutoring, subject coaching, coursework guidance, and essay structure review from qualified UK, US, CA, AU, NZ & IE academic mentors. Held in PCI protected escrow payment vaults.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    id="hero-find-tutor-btn"
                    onClick={() => onNavigate('services')}
                    className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-8 py-4 rounded-xl shadow-lg shadow-orange-500/15 cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Find a Tutor
                  </button>
                  <button 
                    id="hero-get-quote-btn"
                    onClick={() => onNavigate('contact')}
                    className="bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-250 font-bold text-xs tracking-wider uppercase px-8 py-4 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get a Free Quote
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex -space-x-1.5">
                    {tutors.slice(0,4).map((t, idx) => (
                      <img key={idx} src={t.avatarUrl} className="w-7 h-7 rounded-full border-2 border-white" alt="Avatar" />
                    ))}
                  </div>
                  <div>
                    <span className="text-gray-900 font-bold block">Trusted by 10,000+ university students</span>
                    <span className="text-[10px] text-gray-400 block -mt-1 font-mono">98% satisfaction score across 500+ tutors</span>
                  </div>
                </div>

              </div>

              {/* Right Hero: Modern Image/Layout overlapping details */}
              <div className="flex-1 relative w-full h-[400px] mt-10 lg:mt-0 min-h-[380px]">
                {/* Under/Overlapping rotative shapes */}
                <div className="absolute top-10 right-4 w-72 h-80 bg-orange-600 rounded-3xl transform rotate-3 shadow-2xl overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80" 
                    alt="University students on tutoring simulation call"
                    className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left z-10">
                    <span className="text-[9px] font-mono tracking-widest text-orange-200 font-bold block uppercase">Live Sessions</span>
                    <p className="text-[11px] leading-tight font-medium opacity-90 mt-0.5">Interactive virtual whiteboard</p>
                  </div>
                </div>
                
                <div className="absolute top-0 left-4 w-64 h-72 bg-white p-4 rounded-3xl transform -rotate-6 shadow-2xl border border-orange-100/70 flex flex-col justify-between">
                   <div className="w-full h-full bg-orange-50 rounded-2xl flex flex-col p-4 items-center justify-center text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm font-serif text-orange-600 font-bold text-sm">5.0 ★</div>
                      <p className="text-xs font-bold text-gray-900">Expert Guidance</p>
                      <p className="text-[10px] text-gray-500 font-sans">Available 24/7</p>
                   </div>
                </div>
                
                <div className="absolute bottom-4 left-16 bg-white py-3.5 px-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20">
                   <div className="flex -space-x-2">
                     <p className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-850 m-0">💬</p>
                     <p className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-800 m-0">10k</p>
                     <p className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-600 m-0 font-sans">✓</p>
                   </div>
                   <div className="text-left">
                     <span className="text-[10px] font-bold text-gray-900 block leading-tight">10,000+ Online</span>
                     <span className="text-[9px] text-gray-500 block font-sans">SOP Compliant Advisors</span>
                   </div>
                </div>
              </div>

            </div>
          </section>

          {/* Trust University Bar */}
          <section className="bg-gray-50 py-8 border-b border-gray-100 px-4">
            <div className="container mx-auto max-w-7xl text-center">
              <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block mb-4">
                Trusted by high-achieving students from the world's leading universities
              </span>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 text-xs text-gray-700 font-bold font-sans">
                <span>🏛️ OXFORD UNIVERSITY</span>
                <span>🏛️ HARVARD COLLEGE</span>
                <span>🏛️ TORONTO CANADA</span>
                <span>🏛️ SYDNEY UNIVERSITY</span>
                <span>🏛️ DUBLIN TRINITY</span>
                <span>🏛️ AUCKLAND NZ</span>
              </div>
            </div>
          </section>

          {/* Interactive How It Works Flow Sandbox */}
          <HowItWorksSection onNavigate={onNavigate} />

          {/* Services Overview & Flips (Section 2.1 Cards) */}
          <section className="py-24 bg-white border-b border-gray-100 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl text-center">
              
              <div className="inline-flex items-center gap-1.5 bg-orange-50 text-[#F99B0C] text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-orange-100 mb-4 select-none">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Double-Vetted Native Syllabus Support</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight text-[#0B1528] leading-none uppercase font-heading mb-4">
                Our 4 Pillars of <span className="text-[#F99B0C]">Academic Tutoring</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed mb-16">
                Click any core category below to inspect matched regional curriculums, try interactive outline tools, and communicate with available verified country specialists.
              </p>

              {/* Service Cards Flip/Interactive layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    id: 0,
                    title: '1-on-1 Live Tutoring',
                    tag: 'Whiteboard & Video',
                    desc: 'Interact with native instructors on high-speed webcams and digital whiteboard systems. Schedule instant sessions.',
                    metric: 'Recording & stream included',
                    icon: <Video className="w-6 h-6 transition-colors duration-300" />,
                    bg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80'
                  },
                  {
                    id: 1,
                    title: 'Assignment Tutoring',
                    tag: 'Structural Reviews',
                    desc: 'Step-by-step drafting structures, proper citation style reviews (APA/MLA/Harvard), and customized formula guides.',
                    metric: 'APA/MLA grading check',
                    icon: <FileText className="w-6 h-6 transition-colors duration-300" />,
                    bg: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80'
                  },
                  {
                    id: 2,
                    title: 'Coursework Tutoring',
                    tag: 'Syllabus Alignment',
                    desc: 'Comprehensive ongoing syllabus track mentoring. Monitor interactive weekly targets to secure peak score outcomes.',
                    metric: 'Weekly progress reports',
                    icon: <Calendar className="w-6 h-6 transition-colors duration-300" />,
                    bg: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80'
                  },
                  {
                    id: 3,
                    title: 'Academic Writing Coach',
                    tag: 'Thesis & Citations',
                    desc: 'Outline compelling thesis claims, map critical arguments, proofread sentence syntax, and correct grammar layouts.',
                    metric: 'Co-author editing template',
                    icon: <BookOpen className="w-6 h-6 transition-colors duration-300" />,
                    bg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80'
                  }
                ].map((sc) => (
                  <div 
                    key={sc.id}
                    className="p-8 rounded-[32px] border border-gray-150 text-left bg-white flex flex-col justify-between group h-[360px] relative overflow-hidden transition-all duration-300 hover:border-[#F99B0C]/40 hover:-translate-y-2 hover:shadow-[0_24px_48px_-15px_rgba(249,155,12,0.08)] cursor-pointer select-none"
                    onClick={() => {
                      setActiveServiceTab(sc.id);
                      onNavigate('services');
                    }}
                  >
                    {/* Glowing Accent background decorative bubble */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Front design */}
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="bg-[#FFF8F3] text-[#F99B0C] border border-orange-100 p-3.5 rounded-2xl w-fit shadow-xs group-hover:scale-105 group-hover:bg-[#F99B0C] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                          {sc.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50/70 border border-orange-100 px-2.5 py-1 rounded-full">
                          {sc.tag}
                        </span>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold text-[#0B1528] group-hover:text-[#F99B0C] transition-colors font-sans tracking-tight leading-tight pt-1">
                        {sc.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {sc.desc}
                      </p>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-dashed border-gray-200 text-xs font-bold text-orange-700 flex items-center justify-between">
                      <span>{sc.metric}</span>
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-[#F99B0C] group-hover:text-white transition-all duration-300 shadow-xs">
                        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    {/* Ultra-modern Blur Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-[#0B1528]/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out flex flex-col justify-between p-8 text-left text-white z-20">
                      <img src={sc.bg} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 select-none pointer-events-none" alt="" />
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest text-[#F99B0C] uppercase block">Interactive outline</span>
                        <Sparkles className="w-4 h-4 text-[#F99B0C] animate-pulse" />
                      </div>

                      <div className="relative z-10 space-y-2 py-4">
                        <h4 className="font-heading text-lg font-black italic uppercase text-white tracking-tight">
                          {sc.title} Live
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                          Click to expand active student forums, explore pricing plans, or chat with native coordinators specialized in regional assignments.
                        </p>
                      </div>

                      <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs font-bold text-[#F99B0C]">
                        <span className="tracking-widest uppercase text-[10px] hover:underline">Explore Outlines &rarr;</span>
                        <span className="text-[9px] bg-white/10 text-white px-2.5 py-0.5 rounded-full border border-white/10 italic font-bold">
                          Double-Vetted
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Academic Excellence | Premium Services Showcase */}
          <section className="bg-[#fcfcfc] text-[#0a0a0a] antialiased py-16 md:py-24 border-b border-gray-100" id="premium-services-showcase">
            {/* Minimalist Page Intro Header (Editorial Style) */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2.5 mb-4 justify-center">
                <span className="text-[#ff5a00] text-xs font-black tracking-[0.3em] uppercase">Academic Pillars</span>
                <span className="w-8 h-[1.5px] bg-[#ff5a00]"></span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 font-sans mb-6 leading-tight">
                Precision Mentorship for Academic Excellence
              </h2>
              <p className="text-neutral-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                Navigate your university landscape with elite educational guidance, custom coursework planning, and world-class academic writing coaching.
              </p>
            </div>

            {/* Main Service Showcase Section */}
            <div className="max-w-6xl mx-auto px-6 space-y-16">

              {/* 01. Personalized 1-1 Tutoring Services (Left Image, Right Content) */}
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                {/* Left Image Column */}
                <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80" 
                       alt="Personalized 1-1 Academic Tutoring & Mentorship" 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                       referrerPolicy="no-referrer"
                       onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x800/fafafa/ff5a00?text=1-1+Tutoring'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                {/* Right Content Column */}
                <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2.5 mb-4">
                    <span className="text-[#ff5a00] text-xs font-black tracking-[0.2em] uppercase">Academic Mentorship</span>
                    <span className="w-8 h-[1.5px] bg-[#ff5a00]"></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                    1. Personalized 1-1 Tutoring Services
                  </h3>
                  <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify">
                    In today’s competitive academic landscape, students face immense pressure to maintain high grades while balancing tight schedules, making professional educational support a necessity rather than a luxury. Opting for online 1 on 1 tutoring offers a customized learning experience where a dedicated mentor identifies specific knowledge gaps, simplifies complex theories, and provides targeted feedback. Instead of getting lost in a crowded lecture hall, students can easily hire expert tutor for university levels to focus entirely on their weak areas. This personalized online tutoring ensures that an individual's unique learning style is accommodated, dramatically accelerating their comprehension, boosting their confidence, and driving rapid academic growth.
                  </p>
                </div>
              </div>

              {/* 02. Professional Assignment Tutoring Help (Right Image, Left Content) */}
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                {/* Left Content Column */}
                <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                  <div className="inline-flex items-center gap-2.5 mb-4">
                    <span className="text-[#ff5a00] text-xs font-black tracking-[0.2em] uppercase">Logic & Reasoning</span>
                    <span className="w-8 h-[1.5px] bg-[#ff5a00]"></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                    2. Professional Assignment Tutoring & Guidance
                  </h3>
                  <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify">
                    When it comes to managing the heavy influx of continuous assessments, utilizing expert assignment tutoring transforms overwhelming homework into manageable, stress-free milestones. Many students find themselves searching for reliable university tutoring support when deadlines loom close and instructions are ambiguous. Working with a dedicated specialist allows students to break down intricate prompts, organize their foundational research, and develop the skills needed to meet strict rubric standards. This structured guidance not only prevents stress but also teaches students how to approach complex problem-solving independently.
                  </p>
                </div>
                {/* Right Image Column */}
                <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                  <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80" 
                       alt="Professional Academic Assignment Desk" 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                       referrerPolicy="no-referrer"
                       onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x800/fafafa/ff5a00?text=Assignment+Help'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>

              {/* 03. Comprehensive Coursework Tutoring (Left Image, Right Content) */}
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                {/* Left Image Column */}
                <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80" 
                       alt="Comprehensive Coursework Tutoring Desk" 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                       referrerPolicy="no-referrer"
                       onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x800/fafafa/ff5a00?text=Coursework+Tutoring'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                {/* Right Content Column */}
                <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2.5 mb-4">
                    <span className="text-[#ff5a00] text-xs font-black tracking-[0.2em] uppercase">Milestone Management</span>
                    <span className="w-8 h-[1.5px] bg-[#ff5a00]"></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                    3. Comprehensive Coursework Tutoring
                  </h3>
                  <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify">
                    Beyond standard homework, managing extensive, multi-phase projects requires specialized university coursework tutoring. This long-term academic support is invaluable for helping students maintain consistency across deep-dive modules, laboratory reports, and major term papers. Professional mentors guide them through the critical phases of outlining, analyzing data, and synthesizing findings, ensuring their final output is cohesive and academically rigorous. Investing in long-term coursework assistance ensures that major, high-stakes academic projects stay on track from week one all the way to final submission.
                  </p>
                </div>
              </div>

              {/* 04. Expert Academic Writing Support (Right Image, Left Content) */}
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[2rem] bg-white border border-neutral-100 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_-10px_rgba(255,90,0,0.08)] group">
                {/* Left Content Column */}
                <div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
                  <div className="inline-flex items-center gap-2.5 mb-4">
                    <span className="text-[#ff5a00] text-xs font-black tracking-[0.2em] uppercase">Quality Assurance</span>
                    <span className="w-8 h-[1.5px] bg-[#ff5a00]"></span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight font-sans">
                    4. Expert Academic Writing Consultation
                  </h3>
                  <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-normal text-justify">
                    Mastering the mechanics of scholarly prose can be incredibly challenging, which is why integrated professional academic writing coaching is crucial for modern students. Expert assistance in this area helps students refine their arguments, eliminate structural ambiguity, and master complex citation styles like APA, Harvard, or MLA. Whether a student needs help editing and proofreading university essays or requires guidance on scholarly essay structuring, learning how to articulate thoughts clearly and professionally is vital. By refining their written communication, students don't just secure academic clarity—they build essential skills that prepare them for future career success.
                  </p>
                </div>
                {/* Right Image Column */}
                <div className="md:col-span-12 lg:col-span-5 relative h-72 lg:h-auto min-h-[340px] overflow-hidden order-1 md:order-2">
                  <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80" 
                       alt="Academic Content Writing" 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                       referrerPolicy="no-referrer"
                       onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x800/fafafa/ff5a00?text=Writing+Support'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>

            </div>
          </section>


          {/* ==================== Why Consider Online Class Help? ==================== */}
          <section className="bg-amber-50/20 font-sans text-gray-850 antialiased py-20 border-b border-gray-100" id="why-consider-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              
              {/* Header Section matching visual text structure exactly */}
              <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 uppercase">
                  <span className="text-amber-500 italic block sm:inline mr-2">WHY CONSIDER</span>
                  <span className="italic font-extrabold text-slate-800 block sm:inline">ONLINE CLASS HELP?</span>
                </h2>
                <p className="font-sans text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                  Online education is a demanding journey. Balancing work, life, and intense curricula leads many students to seek expert intervention. Here's how we bridge the gap.
                </p>
              </div>

              {/* 3x2 Responsive Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">

                {/* Card 1: Not Enough Time */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    {/* Image Container with floating bubble icon */}
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80" 
                        alt="Not Enough Time" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Rounded Icon exactly mimicking layout */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Not Enough Time</h3>
                      <p className="text-gray-550 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Balancing multiple responsibilities, such as work, family, or extracurricular activities, can leave students with limited time to focus on their classes. Hiring professional help ensures they meet deadlines and maintain their academic standing without sacrificing other aspects of their life.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button 
                      onClick={() => openExpertModal('Not Enough Time Support')} 
                      className="text-sm font-bold text-orange-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 2: Subjects are Hard */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80" 
                        alt="Subjects are Hard" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Rounded Icon */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500">
                        <Brain className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Subjects are Hard</h3>
                      <p className="text-gray-550 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Some courses are more challenging than others, and students often seek assistance from experts who can help them understand difficult concepts. Hiring a professional can provide guidance and support, making challenging subjects easier to handle.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button 
                      onClick={() => openExpertModal('Difficult Subject Support')} 
                      className="text-sm font-bold text-orange-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 3: Less Stress */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80" 
                        alt="Less Stress" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Rounded Icon */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Less Stress</h3>
                      <p className="text-gray-550 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Online learning can be stressful, especially when managing multiple assignments and exams at once. Paying for online class help can significantly reduce stress levels by ensuring that tasks are completed on time and to a high standard.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button 
                      onClick={() => openExpertModal('Stress Reduction Support')} 
                      className="text-sm font-bold text-orange-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 4: Saving Grades */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80" 
                        alt="Saving Grades" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Rounded Icon */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Saving Grades</h3>
                      <p className="text-gray-550 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Some students may be at risk of failing their courses or losing scholarships due to poor grades. By hiring an expert to help with assignments and exams, they can improve their grades and protect their academic standing.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button 
                      onClick={() => openExpertModal('Grade GPA Rescue')} 
                      className="text-sm font-bold text-orange-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 5: Temporary Problems */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xs hover:shadow-md border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 animate-fade-in">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-60 sm:h-64 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" 
                        alt="Temporary Problems" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Rounded Icon */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-8 sm:p-9 text-left">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-sans tracking-tight">Temporary Problems</h3>
                      <p className="text-gray-550 text-sm sm:text-[15px] leading-relaxed text-justify">
                        Life can throw unexpected challenges at students, such as health issues or personal problems. In such cases, hiring someone to manage their classes ensures they don't fall behind and can stay on track.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                    <button 
                      onClick={() => openExpertModal('Emergency Class Assistance')} 
                      className="text-sm font-bold text-orange-500 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Get Started</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 6: Replicated Orange CTA Card from original image */}
                <div className="bg-gradient-to-b from-amber-400 to-orange-500 rounded-[2.5rem] shadow-xl p-8 sm:p-10 text-center text-white flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                  {/* Question mark circle icon exactly matching target card */}
                  <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10 shadow-inner mt-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>

                  {/* Inner Content matching visual textual weights */}
                  <div className="my-6 max-w-xs">
                    <h3 className="text-3xl font-extrabold mb-4 tracking-tight leading-snug">Ready to Master Your Course?</h3>
                    <p className="text-white/95 text-sm sm:text-base leading-relaxed font-semibold text-center md:text-justify md:px-4">
                      Join 10,000+ students achieving their academic goals with expert support.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* New "Why Students Trust Us" grid section */}
          <section className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 py-16 lg:py-24" id="why-students-trust-us-section">
            {/* Main Section Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header Title Section (Replicated precisely from design) */}
              <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase select-none">
                  <span className="italic block sm:inline mr-3 text-amber-500 bg-clip-text">
                    WHY STUDENTS TRUST US
                  </span>
                  <span className="block sm:inline text-slate-900 font-extrabold">
                    FOR SUCCESS
                  </span>
                </h2>
                
                <div className="w-24 h-1.5 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto my-6 rounded-full"></div>

                <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-medium">
                  Balancing multiple subjects and tight deadlines can be overwhelming. We help students thrive by offering elite technical and human-centric support.
                </p>
              </div>

              {/* 6-Card Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {CARDS_DATA.map((card) => (
                  <div
                    key={card.id}
                    className="group bg-white border border-slate-100 p-5 sm:p-6 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between rounded-[2rem] text-left"
                  >
                    {/* Card Thumbnail Image & Badge Layer */}
                    <div>
                      <div className="relative w-full aspect-[4/3] rounded-[1.8rem] overflow-hidden mb-6 group-hover:shadow-md transition-shadow duration-300">
                        {/* Floating Action Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          {renderCardBadge(card.badgeType)}
                        </div>
                        
                        {/* Visual overlay gradient */}
                        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all duration-500 z-0" />
                        
                        {/* Cover Image */}
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover select-none transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      </div>

                      {/* Info Text Content */}
                      <div className="px-1.5">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3 group-hover:text-amber-500 transition-colors duration-205 font-sans">
                          {card.title}
                        </h3>
                        
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 text-justify">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Learn More Link */}
                    <div className="px-1.5 pt-2">
                      <button
                        onClick={() => setActiveModalId(card.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-amber-500 hover:text-amber-600 outline-hidden focus:underline cursor-pointer"
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

            </div>
          </section>

          {/* ==================== Who Can Benefit From Our Services? ==================== */}
          <section className="bg-[#FCFCFD] text-[#0B1528] py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100" id="who-can-benefit-section">
            <div className="max-w-7xl mx-auto">
              
              {/* Header Block */}
              <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase leading-none mb-6">
                  <span className="text-[#F99B0C] mr-2">Who Can Benefit</span> 
                  <span className="text-[#0B1528]">From Our Services?</span>
                </h2>
                <p className="text-[#64748B] text-base sm:text-lg leading-relaxed font-normal px-4">
                  Students seek our help for various reasons. Whether you're balancing a career or overcoming a language barrier, we provide the specialized support you need to thrive.
                </p>
              </div>

              {/* 8-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {BENEFIT_CARDS_DATA.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 xl:p-7 flex flex-col items-start transition-all duration-300 hover:border-[#F99B0C]/40 hover:shadow-[0_20px_50px_rgba(249,155,12,0.06)] hover:-translate-y-1"
                  >
                    {/* Visual Section Image Container with Skeleton Background */}
                    <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-[#FDF8F0] to-[#FFF1DC] border border-[#FDE3B7] flex items-center justify-center">
                      
                      {/* Themed SVG Placeholder (Shown while loading or if broken) */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        {renderBenefitPlaceholderSvg(card.badgeType)}
                        <span className="text-[10px] font-bold text-[#F99B0C]/70 tracking-wider uppercase">{card.badgeText}</span>
                      </div>

                      {/* Robust Unsplash Image */}
                      <img 
                        src={card.image} 
                        alt={card.imageAlt} 
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                          loadedBenefitImages[card.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setLoadedBenefitImages(prev => ({ ...prev, [card.id]: true }))}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Icon Container */}
                    <div className="w-10 h-10 rounded-full border border-[#F99B0C] flex items-center justify-center mb-6 text-[#F99B0C]">
                      {renderBenefitIconSvg(card.badgeType)}
                    </div>

                    <h3 className="text-xl font-bold text-[#0B1528] mb-3">{card.title}</h3>
                    <p className="text-[#475569] text-[14px] sm:text-[15px] leading-relaxed text-justify">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Why Choose Us & Smilling Tutor */}
          <section className="py-20 bg-white border-b border-gray-100 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-left space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600">The University Tutors Difference</span>
                <h2 className="text-3xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                  High-converting support loops configured around academic standards
                </h2>
                
                <div className="space-y-4">
                  {[
                    { t: '100% Native English Speakers', d: 'All our tutors are credentialed coaches from major English native systems (UK, US, CA, AU, NZ, IE) with verified transcripts.' },
                    { t: 'Stripe Secure Payment Vaults', d: 'Tuition fees are locked in escrow, only released after you confirm final study help meets satisfactory targets.' },
                    { t: 'Plagiarism-Free Referencing', d: 'All advice, custom examples, and structures provided are meticulously compiled reference models.' },
                    { t: '24/7 Priority Emergency Support', d: 'University students live on dynamic schedules. Chat, discuss, and book consultants on-demand.' }
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="p-1 bg-orange-100 rounded-lg h-fit text-orange-600 mt-0.5">
                        <Check className="w-4 h-4 text-orange-600 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-950 font-sans">{bullet.t}</h4>
                        <p className="text-xs text-gray-600 leading-tight mt-0.5 text-justify">{bullet.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smiling tutor side image */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80" 
                    alt="Smiling senior university tutor reviewing assignment" 
                    className="w-full object-cover h-[350px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold block text-sm">●</span>
                    <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Dr. Clara Stirling Is Active</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Banner Section (Asymmetric full layout) */}
          <section className="bg-orange-500 py-20 px-4 md:px-8 text-white relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-100 block mb-2">Success Stories across target countries</span>
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
                      <p className="text-xs text-gray-700 leading-relaxed italic text-justify">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                      <img src={t.avatar} className="w-8 h-8 rounded-full object-cover border" alt="Avatar" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-950 block">{t.name}</span>
                          <img 
                            src={`https://flagcdn.com/w40/${t.flag === '🇬🇧' ? 'gb' : t.flag === '🇨🇦' ? 'ca' : t.flag === '🇺🇸' ? 'us' : t.flag === '🇮🇪' ? 'ie' : 'us'}.png`}
                            alt="Flag"
                            className="w-4 h-3 object-cover rounded-sm border border-gray-200 inline"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[9px] text-gray-500 block leading-tight">{t.uni}</span>
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
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block">Consultation Booking</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-950 font-sans tracking-tight">Need expert help from Oxford or Ivy League advisors?</h2>
              <p className="text-xs md:text-sm text-gray-650 max-w-xl mx-auto text-justify sm:text-center">
                Schedule a 100% free, confidential 15-minute consultation to outline syllabus, verify referential standards, and align with qualified instructors.
              </p>
              <button 
                id="book-consultation-home-btn"
                onClick={handleConsultSubmit}
                className="bg-orange-500 text-white font-bold text-xs tracking-wider uppercase px-7 py-3 rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-660 transition-colors cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          </section>

        </div>
      )}

      {/* ==================== 2. ABOUT US ==================== */}
      {activeView === 'about' && (
        <section id="about-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block mb-2">Our Origins & Academic Mission</span>
            <h2 className="text-3xl md:text-4.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
              To make high-quality, ethical academic guidance accessible worldwide.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 font-sans">Our Founding Story</h3>
              <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                universitytutors.com was established by a collective of Oxford advisors and MIT graduate mentors who witnessed a worrying surge in questionable ghostwriting services. We believed university students deserved a 100% transparent, and ethically complaint, mentorship platform.
              </p>
              <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                By designing secure escrow billing parameters and vetting every single candidate's official transcripts, we established a peer-to-peer ecosystem where high academic standards thrive synchronously with absolute customer protection.
              </p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl border">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80" alt="Remote educational team collage" className="w-full h-72 object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-white/95 text-gray-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-md">Oxford • Toronto • Boston • Sydney • Auckland</span>
              </div>
            </div>
          </div>

          {/* Numbers section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { num: '500+', label: 'Vetted Native Tutors' },
              { num: '20k+', label: 'Assignments Completed' },
              { num: '98%', label: 'Positive Satisfaction' },
              { num: '24/7', label: 'Ecosystem Availability' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-150 p-6 rounded-2xl text-center">
                <span className="text-3xl md:text-4xl font-mono font-extrabold text-orange-500 block">{stat.num}</span>
                <span className="text-[11px] font-semibold text-gray-505 block mt-1 uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Sample Profiles list with immediate chat action links (Section 2.2 profiles) */}
          <div className="mb-16">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-950 font-sans tracking-tight">Meet Our On-Call Specialist Tutors</h3>
              <p className="text-xs text-gray-500 mt-1">Directly initiate private conversation logs with our primary sandbox mentors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((t) => (
                <div 
                  key={t.id}
                  className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:border-orange-200 transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex gap-4">
                      <img src={t.avatarUrl} className="w-12 h-12 rounded-full border shadow-inner object-cover shrink-0" alt="Avatar" />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-gray-950 block">{t.name}</h4>
                          <img 
                            src={`https://flagcdn.com/w40/${t.country ? t.country.toLowerCase() : 'us'}.png`}
                            alt={t.country || 'US'}
                            title={`Based in ${t.country || 'US'}`}
                            className="w-4.5 h-3 shadow-xs object-cover rounded-sm border border-gray-150 inline"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-[11px] font-bold text-gray-800">{t.rating}</span>
                          <span className="text-[10px] text-gray-450">({t.reviewCount} verified feedback)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-650 leading-relaxed italic line-clamp-3">
                      "{t.bio}"
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {t.subjects?.map((sub, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-450 block uppercase font-mono leading-none">Pricing Mode</span>
                      <span className="text-xs font-bold text-orange-600 block mt-0.5">By Quote Only</span>
                    </div>
                    <button
                      id={`discuss-detail-${t.id}`}
                      onClick={() => onTutorSelect(t)}
                      className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Quote</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 3. SERVICES HUB & DEDICATED PAGES ==================== */}
      {activeView === 'services' && (
        <section id="services-section" className="py-12 md:py-20 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in">
          
          {selectedServiceId === null ? (
            /* ==================== SERVICES OVERVIEW HUB ==================== */
            <div className="space-y-16">
              
              {/* Specialized Services Dedicated Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white border border-gray-150 p-6 sm:p-10 lg:p-12 rounded-[32px] shadow-xs">
                
                {/* Left Text / CTAs Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-1.5 bg-orange-100/70 text-orange-700 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200 w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Double-Vetted Native Syllabus Support</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tight text-[#0B1528] leading-none font-heading">
                    Premium Services <span className="text-[#F99B0C]">Tailored to University</span> Standards
                  </h1>
                  
                  <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-semibold">
                    Gain premium academic leverage with native tutors matched to your specific local university curricula. We specialize in high-impact structural feedback, active whiteboard sessions, reference maps, and customized formula derivations. Our services are fully aligned with strict university academic integrity guidelines.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => onNavigate('get-a-quote')}
                      className="bg-[#F99B0C] hover:bg-[#e08a00] text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-[#F99B0C]/15 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Request Free Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const contactAnchor = document.getElementById('why-students-trust-us-section');
                        if (contactAnchor) {
                          contactAnchor.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-[#0B1528] font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all text-center cursor-pointer"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Right Hero Image Column */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80"
                      alt="University study collaboration group"
                      className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Trust Indicator overlays */}
                    <div className="absolute top-4 left-4 bg-gray-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span>352 Experts Online</span>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-[#FDF8F0]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-orange-200/50 text-[10px] text-orange-950 font-bold tracking-wider uppercase flex flex-col items-end leading-none">
                      <span className="text-[#F99B0C] text-xs mb-0.5 font-sans font-black">4.97★ RATING</span>
                      <span>Average score</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Subsection Intro */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F99B0C] block mb-1">Our Core Disciplines</span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0B1528]">Select an Academic Service</h2>
              </div>

              {/* Service Cards Grid - 4 core services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. 1-on-1 LIVE TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    {/* Relevant Hero Image Banner */}
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <img 
                        src={hero1on1Img} 
                        alt="1-on-1 Live Online Tutoring with Interactive Digital Whiteboard" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-600 shadow-xs">
                        <Video className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-emerald-500/90 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">Active Whiteboard 24/7</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>HD Video &amp; LaTeX Derivations</span>
                        <span className="flex items-center gap-1 text-amber-300">★ 4.98</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">1-on-1 Live Online Tutoring</h3>
                    <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                      Personalized, real-time interactive lectures and doubt clearing. Screen sharing, active workspace recording, and dedicated homework support across 20+ disciplines.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['STEM Matrix', 'Economics', 'CS & Python', 'Undergrad/Grad'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-650 text-[10px] px-2.5 py-1 rounded-md font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between font-semibold">
                    <span className="text-xs font-bold text-orange-600">Case-by-case Escrow Quotes</span>
                    <button
                      onClick={() => {
                        setSelectedServiceId('1on1');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. ASSIGNMENT TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    {/* Relevant Hero Image Banner */}
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <img 
                        src={heroAssignmentImg} 
                        alt="Assignment Guidance &amp; Reference Outlines" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-600 shadow-xs">
                        <FileText className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-red-500/90 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">Turnitin-Safe Rubrics</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>Formula Derivations &amp; Logic Maps</span>
                        <span className="text-emerald-300">100% Ethical</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">Assignment Guidance &amp; Reference Outlines</h3>
                    <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                      Detailed structural feedback, template formula derivations and references outline blueprints compliant with university academic codes.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['Problem Sets', 'Lab Reports', 'Case Studies', 'References Map'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-655 text-[10px] px-2.5 py-1 rounded-md font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between font-semibold">
                    <span className="text-xs font-bold text-orange-655 font-bold">Emergency Vetting Available</span>
                    <button
                      onClick={() => {
                        setSelectedServiceId('assignment');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. COURSEWORK TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    {/* Relevant Hero Image Banner */}
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <img 
                        src={heroCourseworkImg} 
                        alt="Semester-Long Coursework Tracks" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-600 shadow-xs">
                        <Calendar className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-indigo-600/90 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">14-Week Term Support</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>Syllabus-Mapped Milestones</span>
                        <span className="text-indigo-300">GPA Boost</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">Semester-Long Coursework Tracks</h3>
                    <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                      Syllabus-mapped weekly coaching, exam-guides revision, and continuous milestone tracking to guarantee premium grade averages safely.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['Milestone Quotes', 'Weekly Revisions', 'Quiz Guides', 'Exam Prep'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-655 text-[10px] px-2.5 py-1 rounded-md font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between font-semibold">
                    <span className="text-xs font-bold text-orange-655 font-bold">Syllabus-Mapped Planner</span>
                    <button
                      onClick={() => {
                        setSelectedServiceId('coursework');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. ESSAY WRITING TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    {/* Relevant Hero Image Banner */}
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <img 
                        src={heroEssayImg} 
                        alt="Essay Rhetoric &amp; Citations" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-600 shadow-xs">
                        <BookOpen className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-amber-600/90 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">Editorial Prose Review</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>APA, MLA, Harvard &amp; Chicago</span>
                        <span className="text-amber-300">Thesis Flow</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">Essay Rhetoric &amp; Citations</h3>
                    <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                      Learn how to formulate master thesis declarations, structure logical narrative statements, and verify perfect APA, MLA and Harvard citations references.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold font-semibold">
                      {['Thesis Optimization', 'Style Checkers', 'Structure Flows', 'SOP Writing'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-655 text-[10px] px-2.5 py-1 rounded-md font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between font-semibold font-semibold">
                    <span className="text-xs font-bold text-orange-655">APA, MLA, Harvard, Chicago</span>
                    <button
                      onClick={() => {
                        setSelectedServiceId('essay');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Integrity Statement / System Guidelines */}
              <div className="p-6 bg-amber-50/40 border border-amber-200/50 rounded-2xl text-left space-y-2">
                <span className="text-xs font-bold text-amber-900 block uppercase tracking-wide">🔒 Strict Academic Integrity Escrow Lock</span>
                <p className="text-xs text-amber-955 leading-relaxed italic font-semibold">
                  "Our system enforces strict compliance parameters. We provide structural tutoring, formula derivations guides, and editorial prose coaching. Our advisors are strictly prohibited from writing assignments or taking proctored exams for you. We help you learn to secure genuine high marks safely."
                </p>
              </div>

            </div>
          ) : (
            /* ==================== MODULAR SHIELD OF DEDICATED CHILD SERVICES ==================== */
            <DedicatedServicePages
              selectedServiceId={selectedServiceId}
              tutors={tutors}
              onTutorSelect={onTutorSelect}
              onNavigate={onNavigate}
              onBackToHub={() => {
                setSelectedServiceId(null);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            />
          )}

          {/* DUMMY HOOK TO DEPLOY AND BLOCK THE RETROGRADE TABS SECTION CODE */}
          <div className="hidden">

          {/* Service Tabs Header */}
          <div className="flex flex-wrap border-b border-gray-250 mb-10 gap-2">
            {[
              { label: '1-on-1 Live Tutoring', icon: <Video className="w-4 h-4" /> },
              { label: 'Assignment Tutoring', icon: <FileText className="w-4 h-4" /> },
              { label: 'Coursework Tutoring', icon: <Calendar className="w-4 h-4" /> },
              { label: 'Essay Writing Tutoring', icon: <BookOpen className="w-4 h-4" /> }
            ].map((tab, idx) => (
              <button
                key={idx}
                id={`service-tab-${idx}`}
                onClick={() => setActiveServiceTab(idx)}
                className={`flex items-center gap-2 py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer -mb-0.5 ${
                  activeServiceTab === idx 
                    ? 'border-orange-500 text-orange-650' 
                    : 'border-transparent text-gray-505 hover:text-orange-500'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Service Tab Content Container - Case-by-Case Quotation Model */}
          <div className="space-y-12">
            
            {/* ==================== SERVICE PAGE 1: 1-on-1 Online Tutoring ==================== */}
            {activeServiceTab === 0 && (
              <div className="animate-fade-in space-y-12">
                <div className="bg-white rounded-3xl border border-orange-100/80 p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column (Text & CTAs) */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        Virtual Whiteboard Active 24/7
                      </span>
                      <span className="text-xs text-gray-500 font-medium font-sans">★ 4.9/5 Rating</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-3.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                      Master Any Subject with 1‑on‑1 Live Tutoring
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                      Personalized lessons, real‑time problem solving – from high school to undergraduate and PhD levels. Connect with verified advisors instantly.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Choose your own tutor (UK, US, CA, AU, NZ & Ireland)",
                        "Unlimited doubt clearing & active whiteboard screen-sharing",
                        "High-resolution audio, multi-board sharing, and local recordings",
                        "Flexible pricing negotiated on a case-by-case basis per session"
                      ].map((bullet, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-gray-700 font-medium">
                          <Check className="w-4 h-4 text-orange-600 stroke-[3] shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-150 space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => {
                            // Find Clara
                            const Clara = tutors.find(t => t.name.includes("Clara")) || tutors[0];
                            onTutorSelect(Clara);
                          }}
                          className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/10"
                        >
                          Get a Quote
                        </button>
                        <button
                          onClick={() => onNavigate('contact')}
                          className="bg-white hover:bg-gray-50 text-orange-600 border border-orange-200 font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                        >
                          Discuss My Task
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-gray-500 italic font-medium leading-none mt-1 font-sans">
                        🔒 Price is finalized only after you and your tutor agree on the scope – no hidden fees.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (Visual) */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 shadow-xl h-[330px]">
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=605&auto=format&fit=crop&q=80" 
                      alt="Student working on assignment with tutor guide" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                    
                    {/* Floating Trust Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs py-2 px-3 rounded-xl shadow-md border text-left">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-orange-650 block">TRUST EMBED</span>
                      <span className="block text-xs font-bold text-gray-900 mt-0.5">10,000+ hours tutored this month</span>
                    </div>

                    {/* Interactive Video Play Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => alert("Launching Classroom Explainer: Shows screensharing options and localized workspace recordings.")}
                        className="bg-orange-500/90 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 cursor-pointer flex items-center justify-center ring-4 ring-white/35"
                        title="Play classroom guide"
                      >
                        <Video className="w-6 h-6 fill-white" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-left text-white">
                      <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold block uppercase leading-tight">Interactive Whiteboarding Room</span>
                      <p className="text-[11px] text-gray-200 mt-0.5 font-medium">Recorded whiteboard video files are available dynamically after each lesson.</p>
                    </div>
                  </div>
                </div>

                {/* Subjects & Classes Covered section */}
                <div className="bg-gray-50 border border-gray-150 p-6 md:p-8 rounded-3xl space-y-6 text-left font-sans">
                  <div className="border-b pb-4">
                    <h4 className="text-lg font-bold text-gray-900">Academic Subjects & Grade Levels Covered</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Request a case-by-case quote with any of our certified teachers across these categories.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Syllabus Specialties</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {["Mathematics (Algebra, Calculus I/II, Stats, Numerical Arrays)", "Sciences (Physics, Chemistry, Molecular Biology, Genetics)", "Computer CS (Data Structures, Python, fullstack coding)", "Engineering (Mechanical systems, Structural CAD design)", "Business & Econ (Finance derivatives, Micro/Macroeconomics)", "Humanities (Global History, Ethics, Advanced Psychology)", "Languages (Academic ESL, Business Spanish, French Prose)", "Test Prep (SAT, ACT, GRE Quantitative, GMAT Practice exams)"].map((s, idx) => (
                          <span key={idx} className="bg-white border rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 shadow-3xs">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Grade Level Support</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {["Middle School (Grades 6–8 Curriculum)", "High School (AP / GCSE / A-Levels / IB Diploma modules)", "Undergraduate (Years 1–4 Bachelor coursework)", "Graduate Research Support (Master's thesis, PhD syllabus modeling)"].map((g, idx) => (
                          <span key={idx} className="bg-white border border-orange-100/60 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 shadow-3xs">🎓 {g}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific FAQs section */}
                <div className="space-y-4 text-left font-sans">
                  <h4 className="text-xl font-bold text-gray-900 border-b pb-2">Frequently Asked Questions (1‑on‑1 Tutoring)</h4>
                  <div className="space-y-3">
                    {[
                      { q: "How do I schedule a session?", a: "Pick a tutor from our active listing, click 'Request Quote / Chat', discuss your exact topic requirements, agree on an hour that suits your schedule, and the instructor will generate a binding digital quote. Accepting the quote unlocks the live classroom space for you." },
                      { q: "Can I change tutors if I don’t like the first one?", a: "Yes, we support free educational tutor re-switching with zero fee penalties until you match with the ultimate instructor." },
                      { q: "Do you offer subject-specific support like Calculus II or Organic Chemistry?", a: "Absolutely. We employ advanced research engineers and PhD-candidate mentors who cover specialized university coursework categories. Mention your syllabus details in chat for precision matching." },
                      { q: "What technology is required to join?", a: "Any standard laptop, computer or iPad device equipped with a working webcam, microphone, and standard web browser (Chrome, Safari, Firefox). No third-party software downloads required." },
                      { q: "Can I download session recordings afterwards?", a: "Yes, every whiteboard class is fully recorded. You will find complete session audio and video files listed in your custom dashboard area immediately after logout." }
                    ].map((faq, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-3xs">
                        <button
                          onClick={() => setActiveServiceFaqId(activeServiceFaqId === `one-${idx}` ? null : `one-${idx}`)}
                          className="flex items-center justify-between w-full p-4 text-xs font-bold text-gray-900 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-405 transition-transform ${activeServiceFaqId === `one-${idx}` ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>
                        {activeServiceFaqId === `one-${idx}` && (
                          <div className="px-4 pb-4 pt-1 text-xs text-gray-650 leading-relaxed border-t bg-gray-50/20 font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SERVICE PAGE 2: Online Assignment Tutoring ==================== */}
            {activeServiceTab === 1 && (
              <div className="animate-fade-in space-y-12">
                <div className="bg-white rounded-3xl border border-orange-100/80 p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column (Text & CTAs) */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        Turnitin‑Friendly Guidance
                      </span>
                      <span className="text-xs text-orange-600 font-bold font-sans">🎯 98% Letter Grade Success</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-3.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                      Stuck on an Assignment? Get Guided Help, Not Just Answers
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                      Work 1‑on‑1 with a certified tutor who explains each step – from literature compilation to draft structure. We adhere 100% to your grading rubric criteria.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Coaching for any assignment type (problem sets, essays, lab report formats, code)",
                        "Comprehensive structural feedback aligned with your university syllabus rules",
                        "100% plagiarism-free reference outlines & bibliography formatting support",
                        "24/7 availability on call for urgent university deadline slots"
                      ].map((bullet, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-gray-700 font-medium">
                          <Check className="w-4 h-4 text-orange-600 stroke-[3] shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Live Countdown element specified in prompt */}
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-left flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider font-bold text-orange-850 block uppercase leading-none">Dynamic Queue Status</span>
                        <span className="text-xs font-bold text-gray-900 block mt-1">Submit your assignment rubric in the next 15 mins</span>
                      </div>
                      <div className="bg-orange-600 text-white font-mono font-bold text-[11px] px-3 py-1.5 rounded-lg animate-pulse whitespace-nowrap">
                        Get Tutor Instantly
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-150 space-y-3 font-sans">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => onNavigate('contact')}
                          className="bg-orange-500 hover:bg-orange-655 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/10"
                        >
                          Get a Quote
                        </button>
                        <button
                          onClick={() => {
                            const Liam = tutors.find(t => t.name.includes("Liam")) || tutors[0];
                            onTutorSelect(Liam);
                          }}
                          className="bg-white hover:bg-gray-50 text-orange-650 border border-orange-200 font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                        >
                          Discuss My Task
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-gray-500 italic font-medium leading-none mt-1">
                        🔒 Price is finalized only after you and your tutor agree on the scope – no hidden fees.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (Visual) */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 shadow-xl h-[330px]">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=605&auto=format&fit=crop&q=80" 
                      alt="Student desk with open textbooks and calculations" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                    
                    {/* Performance Metrics Gauge Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs py-3.5 px-4 rounded-xl text-left border flex items-center justify-between shadow-lg font-sans">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-orange-650 uppercase block leading-none">Assignment Performance Metrics</span>
                        <span className="text-xs font-bold text-gray-900 block mt-1 leading-tight">98% of students improve at least one letter grade</span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-4 border-orange-500 flex items-center justify-center font-bold text-[10px] text-orange-650 shrink-0">
                        98%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Specialties */}
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-3xl text-left space-y-4 font-sans">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest text-orange-600">Specialist Reference Help Formats We Advise:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    {[
                      { icon: "📝", name: "Problem Sets" },
                      { icon: "🔬", name: "Lab Reports" },
                      { icon: "📊", name: "Case Studies" },
                      { icon: "Coding", name: "Programming ZIP projects" },
                      { icon: "✍️", name: "Reflective essays" },
                      { icon: "🎓", name: "Literature reviews" }
                    ].map((fmt, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-3xs">
                        <span className="text-base font-bold text-orange-500">{fmt.icon}</span>
                        <span className="font-bold text-gray-800 mt-1 block leading-tight">{fmt.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific FAQs section */}
                <div className="space-y-4 text-left font-sans">
                  <h4 className="text-xl font-bold text-gray-900 border-b pb-2">Frequently Asked Questions (Assignment Tutoring)</h4>
                  <div className="space-y-3">
                    {[
                      { q: "Do you write my assignment for me?", a: "No. We coach you through the methodology and formula solutions under strict compliance standards. You compile every word. We provide detailed reference blueprints, mathematics steps derivations, and citation structures." },
                      { q: "Can you help me with a tight 3-hour deadline?", a: "Yes, our on-call advisors are active 24/7. Urgent assignments are matched immediately. Custom rush quote rates will apply, but we guarantee draft outline delivery before the critical slot." },
                      { q: "What files and formats can I upload to my tutor?", a: "Any university format: PDF worksheets, Word docs, Excel models, PowerPoint pitches, coding script ZIP packs, or clear images of handwritten calculus steps." },
                      { q: "Will university officials know I utilized tutoring support?", a: "No. Our educational services are completely private, safe, and confidential. We do not track personal university registers or contact your professor." },
                      { q: "Can I receive mentorship for just one single formula or question?", a: "Absolutely. Ask your selected tutor for a custom micro-quote for single doubt-busting questions." }
                    ].map((faq, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-3xs">
                        <button
                          onClick={() => setActiveServiceFaqId(activeServiceFaqId === `assign-${idx}` ? null : `assign-${idx}`)}
                          className="flex items-center justify-between w-full p-4 text-xs font-bold text-gray-900 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-404 transition-transform ${activeServiceFaqId === `assign-${idx}` ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>
                        {activeServiceFaqId === `assign-${idx}` && (
                          <div className="px-4 pb-4 pt-1 text-xs text-gray-650 leading-relaxed border-t bg-gray-50/20 font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SERVICE PAGE 3: Online Coursework Tutoring ==================== */}
            {activeServiceTab === 2 && (
              <div className="animate-fade-in space-y-12">
                <div className="bg-white rounded-3xl border border-orange-100/80 p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column (Text & CTAs) */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        Syllabus Tracker Enabled
                      </span>
                      <span className="text-xs text-indigo-650 font-bold font-sans">★ Term-Long Academic Security</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-3.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                      Ace Your Entire Course – Ongoing Support from Week 1 to Finals
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                      Don’t wait until you fall behind. Get a dedicated certified tutor who follows your syllabus all semester, coordinates note files, and hosts weekly progress assessments.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Weekly 1‑on‑1 mentoring sessions aligned to your class module outline",
                        "Continuous help with lectures, reference cards, textbooks, and quizzes prep",
                        "Coursework draft reviews to secure perfect structure compliance before turn-in",
                        "Milestone quote plans tied directly to semester performance milestones"
                      ].map((bullet, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-gray-700 font-medium">
                          <Check className="w-4 h-4 text-orange-600 stroke-[3] shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-150 space-y-3 font-sans">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => onNavigate('contact')}
                          className="bg-orange-500 hover:bg-orange-655 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/10"
                        >
                          Get a Quote
                        </button>
                        <button
                          onClick={() => {
                            const Clara = tutors.find(t => t.name.includes("Stirling")) || tutors[0];
                            onTutorSelect(Clara);
                          }}
                          className="bg-white hover:bg-gray-50 text-orange-650 border border-orange-200 font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                        >
                          Discuss My Task
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-gray-500 italic font-medium leading-none mt-1">
                        🔒 Price is finalized only after you and your tutor agree on the scope – no hidden fees.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (Visual Progress Tracker Mockup) */}
                  <div className="bg-gray-900 text-white rounded-3xl p-6 border border-gray-800 shadow-xl h-[330px] flex flex-col justify-between text-left font-sans">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <span className="text-[10px] font-mono tracking-widest text-orange-500 font-bold uppercase">SYLLABUS PROGRESS DEMO</span>
                        <span className="text-[10px] text-gray-400 font-mono">CODE: FIN-682</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">Advanced Corporate Finance Track</h4>
                      <p className="text-[11px] text-gray-400 leading-tight">Milestone assignments are verified step-by-step through private chat queues.</p>
                    </div>

                    {/* Milestone progress bars */}
                    <div className="space-y-3.5 pt-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-gray-300">
                          <span>Syllabus Weeks 1–4: Conceptual Capital Setup</span>
                          <span className="text-emerald-400 font-mono">100% Verified</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <span className="block h-full bg-emerald-500 w-full rounded-full"></span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-gray-350">
                          <span>Syllabus Weeks 5–9: Financial Equations & Code</span>
                          <span className="text-orange-400 font-mono">82% Mentored</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <span className="block h-full bg-orange-500 w-[82%] rounded-full"></span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-gray-500">
                          <span>Syllabus Weeks 10–14: Final Dissertations Submission</span>
                          <span>Locked</span>
                        </div>
                        <div className="w-full bg-gray-850 h-2 rounded-full">
                          <span className="block h-full bg-gray-700 w-[0%]"></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono mt-4 pt-3 border-t border-gray-800 text-center">
                      Weekly whiteboard sessions coordinated securely
                    </div>
                  </div>
                </div>

                {/* Coursework Specialties focus */}
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-3xl text-left text-xs grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  <div>
                    <span className="font-bold text-gray-950 block text-sm mb-1.5">📂 Semester-Long Course Units</span>
                    <p className="text-gray-600 leading-relaxed">Continuous support for rigorous subject blocks including electrical engineering, statistics, or advanced accounting matrices.</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-950 block text-sm mb-1.5">🏆 Research Dissertations</span>
                    <p className="text-gray-600 leading-relaxed">Dedicated academic coaching from abstract outlines, bibliography search, to results analysis drafts.</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-950 block text-sm mb-1.5">🌐 Virtual Degree Tracks</span>
                    <p className="text-gray-600 leading-relaxed">Synchronized mentoring customized for online professional degrees requiring weekly submissions schedules.</p>
                  </div>
                </div>

                {/* Specific FAQs section */}
                <div className="space-y-4 text-left font-sans">
                  <h4 className="text-xl font-bold text-gray-900 border-b pb-2">Frequently Asked Questions (Coursework Support)</h4>
                  <div className="space-y-3">
                    {[
                      { q: "How is coursework support different from isolated tutoring hours?", a: "Syllabus coursework support is structural. We pair you with a single primary tutor for the whole semester who reviews lecture files, models quiz study-guides, and tracks your progress weeks 1 to 14." },
                      { q: "Can I persist with the exact same tutor all semester?", a: "Absolutely. We match you with an expert specialized in your module at the beginning of the semester who remains on call for your inquiries." },
                      { q: "What happens if our university syllabus changes mid-term?", a: "Your assigned advisor will adjust the curriculum mapping dynamically during your private synchronizations." },
                      { q: "Do you assist during online proctored exams?", a: "No. We refuse any form of academic cheating. We do helper prep works, mock equation worksheets, and revision cards so you earn honest scores safely." },
                      { q: "Are semester-long plans custom-quoted to be cost-effective?", a: "Yes, coursework milestones are custom-negotiated and can reduce overall costs compared to booking separate emergency hour sessions." }
                    ].map((faq, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-3xs">
                        <button
                          onClick={() => setActiveServiceFaqId(activeServiceFaqId === `course-${idx}` ? null : `course-${idx}`)}
                          className="flex items-center justify-between w-full p-4 text-xs font-bold text-gray-900 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-403 transition-transform ${activeServiceFaqId === `course-${idx}` ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>
                        {activeServiceFaqId === `course-${idx}` && (
                          <div className="px-4 pb-4 pt-1 text-xs text-gray-650 leading-relaxed border-t bg-gray-50/20 font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SERVICE PAGE 4: Online Essay Writing Tutoring ==================== */}
            {activeServiceTab === 3 && (
              <div className="animate-fade-in space-y-12">
                <div className="bg-white rounded-3xl border border-orange-100/80 p-6 md:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column (Text & CTAs) */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        Editorial Prose Review
                      </span>
                      <span className="text-xs text-gray-550 font-bold font-mono">APA | MLA | CHICAGO | HARVARD</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-3.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
                      Write Better Essays – Step‑by‑Step Tutoring for Any Prompt
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                      Learn how to outline, analyze literary database prompt material, build strong thesis hypotheses, and correct grammar prose flow. No more all‑nighters.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Coaching for any essay style (argumentative, reflective, narrative, scholarship)",
                        "Reference citation checks (MLA, APA, Harvard, IEEE, Chicago manuals)",
                        "Draft critique comments & structural outline models (strictly no ghostwriting)",
                        "Express 48‑hour turnaround comments for active revisions support"
                      ].map((bullet, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-gray-700 font-medium">
                          <Check className="w-4 h-4 text-orange-600 stroke-[3] shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Free Downloadable Essay Checklist lead magnet specified in prompt */}
                    <div>
                      <button
                        onClick={() => alert("Downloading Premium Essay Checklist PDF: Models proper thesis hook formats, database source tracking, and bibliography styles.")}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
                      >
                        <span>📥 Download Free Essay Checklist (PDF)</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-150 space-y-3 font-sans">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => onNavigate('contact')}
                          className="bg-orange-500 hover:bg-orange-655 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/10"
                        >
                          Get a Quote
                        </button>
                        <button
                          onClick={() => {
                            const Siobhan = tutors.find(t => t.name.includes("Siobhan")) || tutors[0];
                            onTutorSelect(Siobhan);
                          }}
                          className="bg-white hover:bg-gray-50 text-orange-650 border border-orange-200 font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
                        >
                          Discuss My Task
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-gray-500 italic font-medium leading-none mt-1">
                        🔒 Price is finalized only after you and your tutor agree on the scope – no hidden fees.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (Visual representation of track changes draft comparison) */}
                  <div className="bg-white border rounded-3xl p-5 shadow-xl h-[330px] flex flex-col justify-between text-left font-sans">
                    <span className="text-[9px] font-mono tracking-widest text-orange-600 font-bold block uppercase border-b pb-2">CRITICAL EDITORIAL PROSE STUDY</span>
                    
                    {/* Before / After comparison mockup as specified */}
                    <div className="space-y-4 flex-1 pt-3 text-xs overflow-y-auto">
                      <div>
                        <span className="text-[10px] font-mono bg-red-105 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Average Prose Draft</span>
                        <p className="text-gray-500 line-through leading-tight mt-1 italic text-[11.5px]">
                          "Mary Shelley's novels are creepy and describe computer science technologies of science."
                        </p>
                      </div>
                      <div className="border-t border-dashed my-2"></div>
                      <div>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase">Guided Model Revision</span>
                        <p className="text-gray-900 font-bold leading-tight mt-1 italic text-[11.5px]">
                          "Shelley’s gothic prose operates as a prophetic warning regarding the unchecked scientific hubris of the early nineteenth century."
                        </p>
                      </div>
                    </div>

                    <div className="bg-orange-50/50 p-2.5 rounded-xl text-[10px] text-gray-550 border border-orange-100 leading-tight">
                      💬 <strong>Advisor Comments:</strong> "Notice how replacing generic descriptors with analytical vocabulary raises your score category."
                    </div>
                  </div>
                </div>

                {/* Essay formats covered */}
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-3xl text-left font-sans">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest text-orange-600 mb-3">Syllabus Essay Types Handled:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-gray-700">
                    <div className="bg-white p-3 rounded-xl border">
                      <span className="font-bold text-gray-900 block mb-1">✍️ Argumentative & Analytical</span>
                      Learn how to formulate strong assertions, claim arrays, and secure logical flow.
                    </div>
                    <div className="bg-white p-3 rounded-xl border">
                      <span className="font-bold text-gray-900 block mb-1">🔬 Research Thesis Outlines</span>
                      Organize dense literary citations and source indexes under master guidelines.
                    </div>
                    <div className="bg-white p-3 rounded-xl border">
                      <span className="font-bold text-gray-900 block mb-1">🌟 Statements & Admissions</span>
                      Refining personal essays, SOP profiles, and scholarship entries rhetorically.
                    </div>
                    <div className="bg-white p-3 rounded-xl border">
                      <span className="font-bold text-gray-900 block mb-1">📜 Bibliography Referencing</span>
                      Align bibliography records to current APA, MLA, Harvard or Chicago manuals.
                    </div>
                  </div>
                </div>

                {/* Integrity trust statement specified in prompt */}
                <div className="p-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl text-left font-sans">
                  <span className="text-xs font-bold text-amber-900 block mb-1">🔒 Academic Honor Code Safety Statement</span>
                  <p className="text-xs text-amber-950 leading-relaxed italic">
                    "We adhere 100% to university academic honor guidelines. Our tutors do not ghostwrite, prepare, or translate papers for submission in your name. We teach writing mechanics, outline models, and grammar parameters so you write high-quality works yourself."
                  </p>
                </div>

                {/* Specific FAQs section */}
                <div className="space-y-4 text-left font-sans">
                  <h4 className="text-xl font-bold text-gray-900 border-b pb-2">Frequently Asked Questions (Essay Writing)</h4>
                  <div className="space-y-3">
                    {[
                      { q: "Will you write my essay paper in my name?", a: "No. We coach you how to formulate outlines, write correct body paragraphs, and find high-quality references. You write 100% of the essay yourself. No exceptions." },
                      { q: "Can you review my draft essay for similarity issues?", a: "Yes. Our tutors check structural patterns, analyze citations, and teach proper paraphrasing rules to guarantee academic compliance." },
                      { q: "Do you help with university scholarship and admission essays?", a: "Yes. We have specialized entry advisors on call who advise on SOP (Statement of Purpose) drafts and scholarship statements." },
                      { q: "Can I receive editing feedback on an completed essay draft?", a: "Yes, you can register a 'review & feedback' session. A professional editor will provide diagnostic critique card suggestions." },
                      { q: "How fast can I get essay layout critiques?", a: "Emergency 24-48 hour sessions can be scheduled with on-call advisors. Custom rush quote parameters will apply." }
                    ].map((faq, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-3xs">
                        <button
                          onClick={() => setActiveServiceFaqId(activeServiceFaqId === `essay-${idx}` ? null : `essay-${idx}`)}
                          className="flex items-center justify-between w-full p-4 text-xs font-bold text-gray-900 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-402 transition-transform ${activeServiceFaqId === `essay-${idx}` ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>
                        {activeServiceFaqId === `essay-${idx}` && (
                          <div className="px-4 pb-4 pt-1 text-xs text-gray-650 leading-relaxed border-t bg-gray-50/20 font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Explore Other Services navigation links block specified in prompt */}
            <div className="pt-10 border-t flex flex-wrap justify-between items-center text-xs font-sans">
              <span className="font-bold text-gray-900">Explore also our other university-level support plans:</span>
              <div className="flex gap-4">
                {[
                  { name: "1-on-1 Tutoring", idx: 0 },
                  { name: "Assignment Guidance", idx: 1 },
                  { name: "Coursework Track", idx: 2 },
                  { name: "Essay Editing", idx: 3 }
                ].filter(o => o.idx !== activeServiceTab).map((item) => (
                  <button
                    key={item.idx}
                    onClick={() => {
                      setActiveServiceTab(item.idx);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="text-orange-600 hover:text-orange-850 font-bold hover:underline cursor-pointer"
                  >
                    {item.name} →
                  </button>
                ))}
              </div>
            </div>

          </div>
          </div> {/* CLOSE THE DUMMY HIDDEN CONTAINER TO SHIELD THE RETROGRADE TABS SECTION */}

        </section>
      )}

      {/* ==================== 4. FAQs SECTION ==================== */}
      {activeView === 'faqs' && (
        <section id="faqs-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Knowledge Sandbox</span>
              <h2 className="text-3xl font-bold text-gray-950 font-sans tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs md:text-sm text-gray-650 leading-relaxed">
                We handle verification parameters, Stripe Escrow locks, and native tutoring credentials transparently. Type keywords to query database questions.
              </p>

              {/* Dynamic Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  id="faq-search-input"
                  placeholder="Query e.g. escrow, oxford, ethics..." 
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-xs transition-colors"
                />
              </div>

              {/* Accordion Categories */}
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`faq-cat-filter-${cat.replace(/\s+/g, '')}`}
                    onClick={() => setFaqCategory(cat)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                      faqCategory === cat 
                        ? 'bg-orange-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${faqCategory === cat ? 'bg-orange-650' : 'bg-gray-200 text-gray-600'}`}>
                      {cat === 'All' ? consolidatedFaqs.length : consolidatedFaqs.filter(f => f.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="lg:col-span-2 space-y-3.5">
              {filterFaqs.length > 0 ? (
                filterFaqs.map((faq) => (
                  <div 
                    key={faq.id}
                    className="border border-gray-150 rounded-2xl bg-white overflow-hidden transition-all duration-150 shadow-xs"
                  >
                    <button
                      id={`faq-toggle-${faq.id}`}
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="flex items-center justify-between w-full p-5 text-left text-xs font-bold text-gray-900 bg-white hover:bg-gray-50/50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedFaq === faq.id ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>

                    {expandedFaq === faq.id && (
                      <div id={`faq-answer-${faq.id}`} className="px-5 pb-5 pt-1 text-xs text-gray-650 leading-relaxed border-t border-gray-100 bg-gray-50/20">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No matching questions found in our FAQ repository.</p>
                </div>
              )}
            </div>

          </div>

        </section>
      )}

      {/* ==================== 5. CONTACT US SECTION ==================== */}
      {activeView === 'contact' && (
        <section id="contact-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in animate-duration-250">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact form */}
            <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl border border-gray-150 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block mb-1">Confidential Channels</span>
              <h2 className="text-2.5xl font-bold text-gray-950 font-sans tracking-tight">Connect with Advising Team</h2>
              <p className="text-xs text-gray-500 mt-1 mb-8">Discuss specific university homework, dissertation outlines, or curriculum needs confidentially.</p>

              {contactSuccess ? (
                <div id="contact-success-msg" className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-base text-gray-950 font-sans">Inquiry Registered Confirmed</h4>
                  <p className="text-xs text-emerald-800">Our advisor team is routing your instructions to fitting native English subject coordinators inside our database. Expect responses in under 15 minutes!</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Your Full Name</label>
                      <input 
                        type="text" 
                        required 
                        id="contact-input-name"
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Liam sterling" 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:outline-hidden py-2 px-3 rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Registered Account Email</label>
                      <input 
                        type="email" 
                        required 
                        id="contact-input-email"
                        value={contactEmail} 
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@university.com" 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:outline-hidden py-2 px-3 rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Inquiry Subject Focus</label>
                    <select 
                      id="contact-subject-dropdown"
                      value={contactSubject} 
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2 px-3 rounded-lg text-xs"
                    >
                      <option value="service inquiry">Book Academic Consultation</option>
                      <option value="billing">Payments Escrow Verification</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Tutor Registration Screening</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Syllabus Details & Notes</label>
                    <textarea 
                      required 
                      id="contact-textarea-msg"
                      rows={4} 
                      value={contactMessage} 
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="e.g. Writing MLA thesis reviewing Mary Shelley. Require proofreading help..." 
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:outline-hidden py-2 px-3 rounded-lg text-xs" 
                    />
                  </div>

                  {/* Attachment Section */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Optional Assignment Documents (Briefs, Prompts, Drafts)</label>
                    <div className="border border-dashed border-gray-250 rounded-xl p-4 bg-gray-50 text-center relative cursor-pointer hover:bg-orange-50/20 hover:border-orange-200 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-gray-850 block">Click to upload files or drag here</span>
                      <span className="text-[9px] text-gray-450 block mt-0.5">Maximum limit 5 documents (PDF, DOCS, ZIP, Image, PPT, or other media up to 25MB)</span>
                      
                      <input 
                        type="file" 
                        id="contact-attachment-btn"
                        accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,image/*,audio/*,video/*,application/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setContactFile(e.target.files[0].name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                    {contactFile && (
                      <span id="contact-file-attached" className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block mt-2 font-mono font-bold">✓ {contactFile} attached</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className="w-full bg-orange-500 text-white font-bold text-xs py-3 rounded-xl hover:bg-orange-650 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-orange-500/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Secure Message</span>
                  </button>

                </form>
              )}
            </div>

            {/* Side details */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-sm text-gray-900 font-sans tracking-tight mb-2">Our Support Standard</h4>
                  <p className="text-[11px] text-gray-650 leading-relaxed">
                    Our dynamic dashboard leverages verified country coordinators to answer questions under local pricing rates. Feel safe chatting and getting quotes.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-gray-700">
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Ecosystem Inbox</span>
                      <span className="text-gray-500 text-[11px]">support@universitytutors.com</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Priority Phone Line</span>
                      <span className="text-gray-500 text-[11px]">+1 (800) 123-TUTOR</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Operational Branch Hours</span>
                      <span className="text-gray-500 text-[11px]">Mon-Fri, 9:00am - 9:00pm GMT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Google Maps layout */}
              <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-md bg-gray-100 flex flex-col justify-end text-left relative h-64">
                {/* Background graphic styling maps */}
                <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400')]" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/20 to-orange-100/10" />
                
                {/* Simulated markers */}
                <div className="absolute top-1/4 left-1/3 bg-orange-500 p-1.5 rounded-full ring-4 ring-orange-500/30 animate-bounce">
                  <Video className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="absolute top-1/2 right-1/4 bg-orange-500 p-1.5 rounded-full ring-4 ring-orange-500/30 animate-bounce delay-100">
                  <FileText className="w-2.5 h-2.5 text-white" />
                </div>

                <div className="relative z-10 m-5 p-4 bg-white/95 backdrop-blur-xs rounded-2xl border flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-orange-600 font-bold block uppercase leading-none">Global Coverage Hubs</span>
                  <p className="text-sm font-bold text-gray-900 mt-1 leading-tight">Virtual English Branches</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Secure, 24/7 routing to vetted Oxford, MIT, and Canadian mentors.</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ==================== 6. BLOG SYSTEM SECTION ==================== */}
      {activeView === 'blog' && (
        <section id="blog-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in animate-duration-300">
          
          {!selectedBlog ? (
            <>
              {/* Blog Listing View */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block mb-2">Platform Knowledge Hub</span>
                  <h2 className="text-3xl md:text-4.5xl font-bold text-gray-950 font-sans tracking-tight">University Survivals & Academic Guidelines</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Written and screened by platform administrators and vetted mentors.</p>
                </div>
                
                {/* Search Input Box */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search articles & tags..."
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-xs text-gray-955 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium shadow-xs"
                  />
                  {blogSearchQuery && (
                    <button 
                      onClick={() => setBlogSearchQuery('')} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2.5 mb-10 border-b border-gray-100 pb-6">
                {['All', 'University Survival', 'APA Guidelines', 'Mathematics Tricks', 'Legal Disclaimers'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBlogActiveCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      blogActiveCategory === cat
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                        : 'bg-white border border-gray-205 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Filtered Grid */}
              {blogs.filter(b => {
                const matchesCat = blogActiveCategory === 'All' || b.category === blogActiveCategory;
                const matchesSearch = b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                      b.content.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                      b.tags.some(t => t.toLowerCase().includes(blogSearchQuery.toLowerCase()));
                return matchesCat && matchesSearch;
              }).length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl max-w-lg mx-auto space-y-4">
                  <span className="text-4xl block">🔍</span>
                  <h3 className="font-sans font-bold text-base text-gray-955">No Articles Found</h3>
                  <p className="text-xs text-gray-500 px-8">No references matched your filters or search keywords. Try shifting filters or entering different query parameters like "Dissertation".</p>
                  <button 
                    onClick={() => { setBlogSearchQuery(''); setBlogActiveCategory('All'); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2 rounded-xl"
                  >
                    Reset Grid filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  {blogs
                    .filter(b => {
                      const matchesCat = blogActiveCategory === 'All' || b.category === blogActiveCategory;
                      const matchesSearch = b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                            b.content.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                                            b.tags.some(t => t.toLowerCase().includes(blogSearchQuery.toLowerCase()));
                      return matchesCat && matchesSearch;
                    })
                    .map((b) => (
                      <div 
                        key={b.id}
                        id={`blog-preview-card-${b.id}`}
                        className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                        onClick={() => { setSelectedBlog(b); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                      >
                        <div>
                          <img src={b.image} alt={b.title} className="w-full h-56 object-cover" />
                          <div className="p-6 space-y-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-semibold tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full uppercase">
                                {b.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date(b.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-950 font-sans leading-tight group-hover:text-orange-500 transition-colors">
                              {b.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                              {b.content}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <div className="flex flex-wrap gap-1">
                            {b.tags.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="text-[9px] bg-gray-100 text-gray-505 px-1.5 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:underline">
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            /* Dedicated Separate Individual Blog Post Page View */
            <div className="space-y-8 animate-fade-in text-left max-w-7xl mx-auto" id="blog-modal-container">
              
              {/* Back breadcrumb navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <button
                  id="close-blog-popup"
                  onClick={() => setSelectedBlog(null)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-orange-600 py-2.5 px-4 rounded-xl bg-white border border-gray-200 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Knowledge Hub</span>
                </button>

                <div className="text-[10px] text-gray-400 font-medium font-mono hidden md:block">
                  Reference: https://universitytutors.com/blog/{selectedBlog.id}
                </div>
              </div>

              {/* Core Page Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pt-4">
                
                {/* 1. Main Left Detail Column (8-Grid size) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Article Metadata */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold tracking-widest text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full uppercase">
                        {selectedBlog.category}
                      </span>
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedBlog.publishedAt).toDateString()}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        5 min read
                      </span>
                    </div>

                    <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-extrabold text-gray-950 font-sans tracking-tight leading-tight">
                      {selectedBlog.title}
                    </h1>

                    {/* Author Widget */}
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl max-w-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80" 
                        alt="Academic Coordinator" 
                        className="w-10 h-10 rounded-full border border-orange-200 object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Emily Thornton</p>
                        <p className="text-[10px] text-gray-500 font-medium">Head of Administrative Board & Peer Screening</p>
                      </div>
                    </div>
                  </div>

                  {/* Wide Display Banner Image */}
                  <div className="relative group overflow-hidden rounded-3xl border border-gray-200 shadow-lg">
                    <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-[320px] md:h-[400px] object-cover transition-transform duration-500 group-hover:scale-102" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  </div>

                  {/* Fully Parsed Article Body content with rich design elements */}
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-xs leading-relaxed text-gray-800">
                    <div className="prose max-w-none text-xs md:text-sm font-sans space-y-4">
                      {renderBlogContent(selectedBlog.content)}
                    </div>
                  </div>

                  {/* Academic Citations Copy Widget */}
                  <div className="bg-orange-50/50 border border-orange-150/50 rounded-3xl p-5 md:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-700 flex items-center gap-2 font-sans">
                        <Award className="w-4 h-4" />
                        <span>Cite this Guidance Reference</span>
                      </h4>
                      <button
                        onClick={() => handleCopyCitation(selectedBlog)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedId === selectedBlog.id ? 'Copied Citation!' : 'Copy Reference'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                      If you are citing this advice within your essay plan or academic blog, please use this standardized citation structure:
                    </p>
                    <div className="p-3.5 bg-white border border-orange-100 rounded-xl font-mono text-[10px] text-gray-700 select-all leading-relaxed break-all">
                      University-Tutors. (2026). <em>{selectedBlog.title}</em>. Academic Guides & Mentorship Articles. Available at: https://universitytutors.com/blog/{selectedBlog.id}
                    </div>
                  </div>

                  {/* Interactive Claps & Helpfulness Applaud widget */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-gray-150 rounded-3xl gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xs font-bold text-gray-900 font-sans">Was this academic article useful?</h4>
                      <p className="text-[11px] text-gray-500">Provide direct encouragement to peer screening administrators.</p>
                    </div>
                    <button
                      onClick={() => {
                        setBlogClaps(prev => ({
                          ...prev,
                          [selectedBlog.id]: (prev[selectedBlog.id] || 0) + 1
                        }));
                      }}
                      className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-600 border border-orange-200/50 px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ThumbsUp className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                      <span>Applaud Material ({blogClaps[selectedBlog.id] || 0})</span>
                    </button>
                  </div>

                  {/* Fully Interactive Comments Discussion Section */}
                  <div className="border border-gray-150 bg-white rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-105">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      <h4 className="font-bold text-sm text-gray-950 font-sans tracking-tight">
                        Discussions & Academic Support reviews ({(blogComments[selectedBlog.id] || []).length} items)
                      </h4>
                    </div>

                    {/* Scrollable list of comments */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {(blogComments[selectedBlog.id] || []).map((comm) => (
                        <div key={comm.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex gap-3.5">
                          <img src={comm.avatar} alt={comm.author} className="w-10 h-10 rounded-full object-cover border" />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900">{comm.author}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{comm.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed font-sans">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live interactive Input comment form */}
                    <form onSubmit={(e) => handleAddCommentSubmit(e, selectedBlog.id)} className="pt-4 border-t border-gray-100 space-y-4">
                      <h5 className="text-xs font-bold text-gray-900">Add Your Student Comment / Inquiry</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-1">Your Display Name *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Rachel G."
                            value={newCommentName}
                            onChange={(e) => setNewCommentName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-950 font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium flex items-center md:pt-4">
                          All student comments are checked against our strict academic support rules.
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Your Message / Question *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Type your feedback, formatting questions, or mentoring inquiries on this article..."
                          value={newCommentTxt}
                          onChange={(e) => setNewCommentTxt(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-955 font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs hover:shadow-md transition-all uppercase tracking-wider font-sans"
                        >
                          Post Comment
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* 2. Main Right Sidebar Column (4-Grid size for supplementary action) */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-6 text-left">
                  
                  {/* Small Info Box */}
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest font-sans">Vetted Reference Guides</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                      Our knowledge base is curated strictly by senior platform administrators to assist with formatting, academic outline guidelines, and successful escrow transaction setups.
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-semibold text-gray-400 italic block">Last audited: Today, 15:16 UTC</span>
                    </div>
                  </div>

                  {/* Active Tutor Consult Call Box */}
                  <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 space-y-4 shadow-xl border border-gray-800">
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold block uppercase leading-none">Need Direct Mentoring?</span>
                    <h3 className="text-lg font-bold font-sans tracking-tight leading-snug">
                      Struggling with a similar essay or methodology brief?
                    </h3>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Discuss your syllabus, template draft requirements, and rubrics directly with vetted lecturers under secure Stripe escrow coverage. No blind risk!
                    </p>
                    <button
                      id="blog-modal-services-btn"
                      onClick={() => {
                        setSelectedBlog(null);
                        onNavigate('services');
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer block text-center uppercase tracking-wider font-sans shadow-md shadow-orange-500/10"
                    >
                      Browse Specialists
                    </button>
                  </div>

                  {/* Browse other knowledge articles (Recommended list widget) */}
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider font-sans pb-1 border-b">Other Suggested Reads</h4>
                    
                    <div className="space-y-4">
                      {blogs
                        .filter(ob => ob.id !== selectedBlog.id)
                        .slice(0, 3)
                        .map(ob => (
                          <div 
                            key={ob.id}
                            onClick={() => { setSelectedBlog(ob); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="group flex gap-3 items-start cursor-pointer border-b border-gray-100 last:border-0 pb-3 last:pb-0 font-sans"
                          >
                            <img src={ob.image} alt={ob.title} className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-bold text-orange-650 uppercase tracking-widest block mb-0.5">{ob.category}</span>
                              <h5 className="text-[11px] font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                                {ob.title}
                              </h5>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </section>
      )}

      {/* ==================== 7. PRIVACY POLICY ==================== */}
      {activeView === 'privacy' && (
        <section id="privacy-policy-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans">
          
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            
            {/* Header portion */}
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-650 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-600" />
                University-Tutors Security & Compliance
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-gray-950 tracking-tight leading-none">
                Privacy Policy & GDPR Disclosure
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Effective Date: June 10, 2026 | Document Reference: UT-PRIVACY-V4
              </p>
            </div>

            {/* Informational intro */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-xs text-orange-900 leading-relaxed font-sans">
              <p className="font-bold mb-1">🔐 Your Academic Privacy is Locked</p>
              At University-Tutors, we respect your confidentiality. We do not sell or lease student files, homework briefs, exam preparation outlines, or communication logs to third‑party advertisers, universities, or data banks. Every query in our database is securely protected under Attribute‑Based Access Controls.
            </div>

            {/* Subsections */}
            <div className="space-y-6 text-xs md:text-sm text-gray-650 leading-relaxed">
              
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">1. Information We Collect</h3>
                <p>
                  To deliver tailored online mentoring, we capture the following details when you register or initiate support tasks:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li><strong>Account Identity:</strong> Display Name, verified sign-in email address, selected role (Student, Tutor, Admin).</li>
                  <li><strong>Communications:</strong> Private live chat transcripts, offered quotes, milestone logs, and system operations files.</li>
                  <li><strong>Academic Assets:</strong> Voluntary assignment prompts, bibliography materials, syllabus briefs, and text edits uploaded as attachments.</li>
                  <li><strong>Payment Transactions:</strong> Stripe-managed credit records, escrow holds, and transaction identifiers. We do <em>not</em> store full credit-card records inside our servers.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">2. Sensitive Data Protection Mechanisms & Data Usage</h3>
                <p>
                  Captured records are processed solely under authorized educational directives. We implement rigorous, multi-layered data protection mechanisms to secure your sensitive information (such as personal files, chat transcripts, academic assets, and authentication credentials):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1 pb-2">
                  <li><strong>Encryption in Transit:</strong> All communications, user profile details, and academic assets are encrypted in transit using the industry-standard Transport Layer Security (TLS 1.3) protocol.</li>
                  <li><strong>Encryption at Rest:</strong> All database fields, files, chat history, and uploaded documents are encrypted at rest using AES-256 cryptographic encryption keys on secure PostgreSQL database and cloud storage systems.</li>
                  <li><strong>Strict Access Controls:</strong> We enforce Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC). Only the verified student, the specific assigned vetted tutor, and authorized system administrators can access communications and academic assets associated with a task.</li>
                  <li><strong>Secured Escrow Framework:</strong> Payment details are processed entirely off-site by Stripe under PCI-DSS Level 1 compliance; no sensitive payment cards or raw banking credentials are ever handled or stored on our servers.</li>
                </ul>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl text-xs">
                    <span className="font-bold text-gray-950 block mb-1">Escrow Safety matching</span>
                    To align active academic consults, process custom milestone requests, and verify Stripe escrow balances.
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl text-xs">
                    <span className="font-bold text-gray-950 block mb-1">Preventing Honor Violations</span>
                    Uploaded assets are reviewed strictly to ensure they are educational references and do not breach school honor codes.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">3. CCPA, GDPR, and COPPA Compliance</h3>
                <p>
                  We provide identical high compliance bars for university students in the UK, United States, Canada, Australia, Ireland, and New Zealand:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li><strong>Data Minimization:</strong> You have the absolute right to demand manual account erasure or request files export. Contact support to trigger this instantly.</li>
                  <li><strong>Zero Underage Marketing:</strong> We strictly serve university‑level and adult education paths. We do not deliberately market to or collect data from children under age 13.</li>
                  <li><strong>Cookie Consent:</strong> Cookie variables are limited to safe persistent authentication tokens and active interface presets without trackers.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">4. Third-Party Hosting Data Systems</h3>
                <p>
                  All interactions are processed with absolute zero-knowledge integrations, utilizing industry-standard infrastructure:
                </p>
                <p>
                  Stripe handles financial escrow records through verified secure SSL tokens, and Cloud Run containers securely operate the frontend structures. No automated AI bots are permitted to harvest student files for model training without prior student authorization.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">5. Google User Data Sharing & Disclosure Policy</h3>
                <p>
                  We are committed to absolute transparency regarding your Google user data. We strictly define with whom your data is shared, transferred, or disclosed:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li><strong>Zero Commercial Sharing:</strong> We do <strong>not</strong> sell, lease, rent, trade, or share your Google user data (such as your basic profile details, name, or verified email address) with any third-party advertising networks, marketing firms, data brokers, or external AI model training systems.</li>
                  <li><strong>Minimal Operational Transfers:</strong> Your user data is transferred or disclosed only to our direct infrastructure hosts solely for hosting and executing this platform. These systems are bound by strict data processing agreements and are not authorized to use your data for any other purpose.</li>
                  <li><strong>Legal Compliance Disclosures:</strong> We do not disclose Google user data to any external parties unless required by a valid law enforcement subpoena, court order, or applicable legal obligation, and we will notify you of any such request unless legally prohibited.</li>
                  <li><strong>Limited Use Requirements:</strong> Our use and transfer of information received from Google APIs to any other app adheres strictly to the Google API Services User Data Policy, including the Limited Use requirements.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">6. Right to Erasure & Contact</h3>
                <p>
                  If you wish to terminate your local registration logs or completely destroy chat archives, email <code className="bg-gray-100 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold font-sans">support@universitytutors.com</code>, and we will fulfill your request immediately.
                </p>
              </div>

            </div>

            {/* Back home action button */}
            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-orange-500 hover:bg-orange-660 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => { onNavigate('services'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="text-orange-600 hover:text-orange-850 font-bold hover:underline"
              >
                Browse Our Services & Tutors →
              </button>
            </div>

          </div>

        </section>
      )}

      {/* ==================== 8. TERMS OF SERVICE ==================== */}
      {activeView === 'terms' && (
        <section id="terms-of-service-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans">
          
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            
            {/* Header portion */}
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-orange-600" />
                University-Tutors Legal Agreement
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-[#331301] tracking-tight leading-none">
                Terms of Service & Escrow Rules
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Last Updated: June 10, 2026 | Identifier: UT-TERMS-V4
              </p>
            </div>

            {/* Crucial Banner statement */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 leading-relaxed font-sans font-medium">
              <span className="font-bold text-amber-900 block mb-1">⚠️ Please Read: Strict Integrity Framework</span>
              By creating an account, posting assignments, or hiring verified tutors, you legally accept our strict Academic Integrity policy and Escrow Terms. Attempting to bypass the secure Stripe locks or soliciting tutors for dishonest ghostwriting models will trigger permanent termination.
            </div>

            {/* Subsections */}
            <div className="space-y-6 text-xs md:text-sm text-[#542104] leading-relaxed">
              
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">1. Academic Integrity Bound</h3>
                <p>
                  You agree that all outputs, models, research guides, chemistry solutions, essay outlines, and programming briefs provided by our tutors represent <strong>reference materials only</strong>. Yes, you read that right:
                </p>
                <div className="p-4 bg-orange-100/30 border border-orange-200 rounded-md font-sans italic text-xs space-y-1 my-3">
                  <p>• You may <strong>NOT</strong> submit any tutor‑supplied content as your own work for academic grading credit.</p>
                  <p>• Doing so violates institutional Honor Codes and will result in your permanent suspension from our platform.</p>
                  <p>• Our platform exists solely to foster explanatory peer‑coaching and study skills.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">2. Stripe Escrow Hold Parameters</h3>
                <p>
                  To secure transactions and allow confident syllabus evaluations, we employ our standard escrow safety track:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li><strong>Price Agreement:</strong> Tutors and students freely negotiate customized rates based on syllabus complexity and expected depth. All pricing is visible before checkout.</li>
                  <li><strong>Fund Locking:</strong> Accepted quotes prompt a Stripe authorization hold. Funds are locked securely in our administrative database.</li>
                  <li><strong>Authorized Release:</strong> Funds are only disbursed to tutors after the student clicks "Review & Approve" on finalized drafts, or the system auto-releases under default contract durations (typically 7 calendar days after delivery without disputation).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">3. Revisions, Disputes & Refunding</h3>
                <p>
                  If a deliverable fails to meet the agreed‑upon rubrics:
                </p>
                <p>
                  Students are entitled to request free revisions. If a tutor fails to refine the assignment references within the requested timeline, standard dispute resolution triggers. Our internal Administrative Board will review the uploaded instruction briefs against the drafts to issue partial or complete refunds to the student escrow card.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900">4. Tutor Conduct & Account Termination</h3>
                <p>
                  Tutors agree to represent their credentials, credentials transcripts, and native English fluency status accurately. Sharing accounts, attempting to take student communications offline, or blackmailing students for extra milestone payments represents a zero-tolerance breach. Tutors violating these conducts face immediate account suspension and escrow forfeiture.
                </p>
              </div>

            </div>

            {/* Back home action button */}
            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-[#542104] hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => { onNavigate('services'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="text-orange-600 hover:text-orange-850 font-bold hover:underline"
              >
                Browse Our Services & Tutors →
              </button>
            </div>

          </div>

        </section>
      )}

      {/* ==================== 8.5. GOOGLE OAUTH DISCLOSURE ==================== */}
      {activeView === 'google-disclosure' && (
        <section id="google-disclosure-section" className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans">
          
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            
            {/* Header portion */}
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-650 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Google API Compliance Center
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-gray-950 tracking-tight leading-none">
                Google OAuth Data Disclosure
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Effective Date: June 10, 2026 | Document Reference: UT-GOOGLE-OAUTH-V1
              </p>
            </div>

            {/* Crucial Statement */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-xs text-orange-900 leading-relaxed font-sans">
              <p className="font-bold mb-1">🔐 Fully Verified Security Protocols</p>
              This disclosure informs users of University-tutors about the scopes requested, exact purposes of authentication, and how basic profile metadata is handled. We prioritize data minimization and full transparency.
            </div>

            {/* App Purpose & Data Usage Bento-grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Section A */}
              <div className="p-6 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100/50 px-2.5 py-1 rounded-md">
                  Section A: The App Purpose
                </span>
                <h3 className="text-sm font-bold text-gray-900 pt-1">About Our Application</h3>
                <p className="text-xs text-gray-650 leading-relaxed font-sans">
                  University-tutors is an integrated academic support platform designed to connect students with expert educational consultants and tutors. This application facilitates secure, real-time consultation chats, document sharing for assignment briefs, and streamlined project tracking between students and administrative teams to enhance the overall learning experience.
                </p>
              </div>

              {/* Section B */}
              <div className="p-6 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-md">
                  Section B: Google Data Usage
                </span>
                <h3 className="text-sm font-bold text-gray-900 pt-1">How We Use Your Data</h3>
                <p className="text-xs text-gray-650 leading-relaxed font-sans">
                  When you sign in using your Google Account, University-tutors requests access to your basic profile information (such as your name and email address). We use this data exclusively to securely authenticate your account, personalize your dashboard, and verify your identity within our internal chat and support systems. We do not share, sell, or utilize your personal information for any secondary purposes.
                </p>
              </div>

            </div>

            {/* Detailed Scopes Explanation */}
            <div className="space-y-4 text-xs md:text-sm text-gray-650 leading-relaxed border-t border-gray-100 pt-6">
              <h3 className="text-sm md:text-base font-bold text-gray-900 font-sans">Requested OAuth Scopes &amp; Specific Uses</h3>
              <p className="text-xs text-gray-650">
                To provide a unified workspace session, our identity authentication integration requests standard non-sensitive permissions:
              </p>
              <ul className="list-disc pl-5 space-y-2 pt-1 text-xs text-gray-600 font-sans">
                <li>
                  <strong>email (Standard Scope):</strong> Used to uniquely identify your platform profile, register your student status in our secure database, and trigger email alerts for tutor-replies.
                </li>
                <li>
                  <strong>profile / userinfo.profile (Standard Scope):</strong> Accesses your display name and profile picture URL. We use this to customize the welcome banner inside your student dashboard and show your face/initials on active chat rooms.
                </li>
                <li>
                  <strong>openid (Standard Scope):</strong> Authenticates identity directly via the secure Google server without passing passwords to third-party databases.
                </li>
              </ul>
              
              <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-900 font-sans">
                <strong>🔒 Restrictive Data Usage Policy:</strong> University-tutors complies fully with the Google API Services User Data Policy, including the Limited Use requirements. No user data acquired via Google APIs is shared with external advertising companies or AI training libraries.
              </div>
            </div>

            {/* Back home action button */}
            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-orange-500 hover:bg-orange-660 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => { onNavigate('services'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="text-orange-600 hover:text-orange-850 font-bold hover:underline"
              >
                Browse Our Services &amp; Tutors →
              </button>
            </div>

          </div>

        </section>
      )}

      {/* ==================== EXPERT POPUP MODAL ==================== */}
      {isExpertModalOpen && (
        <div id="expert-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center animate-fade-in animate-duration-200" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Modal Backdrop overlay with high blur action */}
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" aria-hidden="true" onClick={closeExpertModal}></div>

          {/* Modal Content window */}
          <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-orange-100 relative z-10 mx-4">
              
              {/* Close Button */}
              <button 
                onClick={closeExpertModal} 
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Input Form Screen */}
              {modalFormStep === 'form' ? (
                <div id="form-screen" className="p-8 sm:p-10">
                    <div className="flex items-center mb-6">
                        <img src="/logo.webp" alt="Uni Tutors" referrerPolicy="no-referrer" className="h-10 sm:h-12 w-auto object-contain" />
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 mb-1 font-sans tracking-tight" id="modal-title-text">
                        {modalTitleText}
                    </h3>
                    <p className="text-gray-400 text-xs mb-6">
                        Fill out this fast matching form. Your details will stay strictly confidential.
                    </p>

                    <form id="lead-form" onSubmit={handleLeadFormSubmit} className="space-y-4">
                        <input type="hidden" id="inquiry-source" name="source" value={modalSource} />
                        
                        <div>
                            <label htmlFor="student-name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
                            <input 
                              type="text" 
                              id="student-name" 
                              required 
                              placeholder="John Doe" 
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-950 font-medium"
                            />
                        </div>

                        <div>
                            <label htmlFor="student-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input 
                              type="email" 
                              id="student-email" 
                              required 
                              placeholder="you@example.com" 
                              value={leadEmail}
                              onChange={(e) => setLeadEmail(e.target.value)}
                              className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-950 font-medium"
                            />
                        </div>

                        <div>
                            <label htmlFor="class-subject" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Syllabus / Course Subject</label>
                            <select 
                              id="class-subject" 
                              value={leadSubject}
                              onChange={(e) => setLeadSubject(e.target.value)}
                              className="w-full bg-slate-50 border border-orange-100 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-700 font-medium"
                            >
                                <option value="Mathematics & Statistics">Mathematics & Statistics</option>
                                <option value="Nursing & Healthcare">Nursing & Healthcare</option>
                                <option value="Business & Finance">Business & Finance</option>
                                <option value="Computer Science">Computer Science & IT</option>
                                <option value="Literature & Humanities">Literature & Essays</option>
                                <option value="Natural Sciences">Biology, Chemistry, Physics</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm tracking-wide mt-3 cursor-pointer">
                            Connect with My Expert &rarr;
                        </button>
                    </form>
                </div>
              ) : (
                /* Step 2: Custom Thank You screen */
                <div id="success-screen" className="p-8 sm:p-10 text-center animate-fade-in animate-duration-250">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 font-sans tracking-tight">Request Submitted!</h3>
                    <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                        An expert academic coordinator has been notified. We will reach out to you within the next 15 minutes to evaluate your course structure.
                    </p>
                    <button 
                      onClick={closeExpertModal} 
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl transition duration-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setActiveModalId(null)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 z-10 max-h-[90vh] flex flex-col transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Image Header */}
            <div className="relative h-48 sm:h-60 w-full overflow-hidden flex-shrink-0">
              <img
                src={activeCardForModal.image}
                alt={activeCardForModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModalId(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-950/90 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md focus:outline-hidden cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/25 text-white backdrop-blur-xs mb-2">
                  {activeCardForModal.badgeType} support
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeCardForModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-left">
              <h4 className="text-lg font-black tracking-tight text-amber-500">
                {activeCardForModal.extraDetails.headline}
              </h4>

              {activeCardForModal.extraDetails.paragraphs.map((p, idx) => (
                <p key={idx} className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                  {p}
                </p>
              ))}

              {/* Performance Metrics inside Modal */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Performance Metrics</p>
                <div className="grid grid-cols-3 gap-4">
                  {activeCardForModal.extraDetails.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                      <span className="block text-xl font-extrabold text-slate-800">{stat.value}</span>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400 font-medium text-center sm:text-left">
                Need deeper insights? Contact our representative desks.
              </span>
              <button
                onClick={() => setActiveModalId(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-transform duration-150 active:scale-95 shadow-md cursor-pointer"
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
