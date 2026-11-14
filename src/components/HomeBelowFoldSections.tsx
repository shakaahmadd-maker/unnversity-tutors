import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Check,
  Sparkles,
  HelpCircle,
  Brain,
  Heart,
  ShieldAlert,
  CheckCircle2,
  Star,
  X,
} from 'lucide-react';
import { ResponsiveAvatar, ResponsivePicture } from './ResponsiveImage';

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
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=70',
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

const TESTIMONIALS = [
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

interface HomeBelowFoldSectionsProps {
  isMdUp: boolean;
  onNavigate: (view: string) => void;
  onRaisedConsult: (msg: string) => void;
}

export default function HomeBelowFoldSections({
  isMdUp,
  onNavigate,
  onRaisedConsult,
}: HomeBelowFoldSectionsProps) {
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState('General Class Inquiry');
  const [modalTitleText, setModalTitleText] = useState('Connect with an Expert');
  const [modalFormStep, setModalFormStep] = useState<'form' | 'success'>('form');
  const [activeModalId, setActiveModalId] = useState<number | null>(null);
  const activeCardForModal = CARDS_DATA.find((c) => c.id === activeModalId);

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
    <>
      {/* ==================== Why Consider Online Class Help? ==================== */}
      <section className="bg-amber-50/20 font-sans text-gray-850 antialiased py-20 border-b border-gray-100" id="why-consider-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 uppercase">
              <span className="text-amber-600 italic block sm:inline mr-2">WHY CONSIDER </span>
              <span className="italic font-extrabold text-slate-800 block sm:inline">ONLINE CLASS HELP?</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Online education is a demanding journey. Balancing work, life, and intense curricula leads many students to seek expert intervention. Here&apos;s how we bridge the gap.
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
                  aria-label="Get Started with Not Enough Time Support"
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
                  aria-label="Get Started with Difficult Subject Support"
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
                  aria-label="Get Started with Stress Reduction Support"
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
                  aria-label="Get Started with Saving Grades Support"
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
                    Life can throw unexpected challenges at students, such as health issues or personal problems. In such cases, hiring someone to manage their classes ensures they don&apos;t fall behind and can stay on track.
                  </p>
                </div>
              </div>
              <div className="px-8 sm:px-9 pb-8 sm:pb-9 text-left">
                <button
                  onClick={() => openExpertModal('Emergency Class Assistance')}
                  aria-label="Get Started with Temporary Problems Assistance"
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

      {/* "Why Students Trust Us" grid section */}
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
                        aria-label={`Learn more about ${card.title}`}
                        className="text-amber-700 hover:text-amber-800 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1 min-h-[44px] active:scale-95 transition-transform group py-1 pr-2 cursor-pointer"
                      >
                        <span>LEARN MORE</span>
                        <span className="text-amber-700 font-bold group-hover:translate-x-1.5 transition-transform text-sm">
                          →
                        </span>
                      </button>

                      <button
                        onClick={() => onNavigate('get-a-quote')}
                        aria-label={`Get a quote for ${card.title}`}
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
                        aria-label={`Learn more about ${card.title}`}
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
              Students seek our help for various reasons. Whether you&apos;re balancing a career or overcoming a language barrier, we provide the specialized support you need to thrive.
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
            {TESTIMONIALS.map((t, idx) => (
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
                  <p className="text-xs text-gray-700 leading-relaxed italic text-justify">&quot;{t.quote}&quot;</p>
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
            onClick={() => onNavigate('contact')}
            className="bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-7 py-3.5 min-h-[44px] rounded-xl shadow-lg shadow-orange-650/10 hover:bg-orange-700 transition-colors cursor-pointer"
          >
            Book Free Consultation
          </button>
        </div>
      </section>

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
                    <source type="image/avif" srcSet="/logo-440.avif" />
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
    </>
  );
}
