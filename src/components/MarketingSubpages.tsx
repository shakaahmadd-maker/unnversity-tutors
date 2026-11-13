import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ThumbsUp,
  Share2,
  Search,
  Mail,
  Phone,
  Clock,
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
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { User, Blog, FAQ } from '../types';
import { store } from '../lib/store';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import heroAssignmentImg from '../assets/images/hero_assignment_guidance_1787387387028.jpg';
import heroCourseworkImg from '../assets/images/hero_coursework_tracks_1787387403661.jpg';
import heroEssayImg from '../assets/images/hero_essay_rhetoric_1787387419893.jpg';
import { ResponsiveAvatar, ResponsivePicture } from './ResponsiveImage';
import {
  resolveDedicatedServiceRoute,
  isModifiedAnchorClick,
} from '../data/dedicatedServiceRoutes';

const DedicatedServicePages = React.lazy(() => import('./DedicatedServicePages'));

export interface MarketingSubpagesProps {
  activeView: string;
  tutors: User[];
  blogs: Blog[];
  faqs: FAQ[];
  onNavigate: (view: string) => void;
  onTutorSelect: (tutor: User) => void;
  onRaisedConsult: (msg: string) => void;
}

const STATIC_FAQS: FAQ[] = [
  {
    id: 'static_faq_1',
    question: 'How do you vet your academic tutors?',
    answer:
      "Every tutor on universitytutors.com is rigorously vetted. We verify their academic transcripts, conduct subject-matter exam assessments, and host live screening video sessions before onboarding. All tutors hold a minimum of a Bachelor's degree with honors, and over 65% hold Masters or PhD qualifications from premier institutions in the UK, US, CA, AU, and NZ.",
    category: 'General',
    order: 1,
  },
  {
    id: 'static_faq_2',
    question: 'How do Stripe payment holds/escrow work?',
    answer:
      'Your safety is our top priority. When you agree on a quote from your tutor and click "Proceed to Payment", your funds are held in a secure Stripe-enabled escrow account. Money is only released to the tutor after you click "Confirm & Approve Delivery" on your dashboard. If the tutor fails to deliver or if you request revisions, the funds remain securely locked. If a dispute arises, the Admin Panel reviews it and issues a full refund where applicable.',
    category: 'Payments',
    order: 1,
  },
  {
    id: 'static_faq_3',
    question: 'Are your services ethical and aligned with University policies?',
    answer:
      'Absolutely. We provide strictly ethical academic guidance. Our tutors explain concepts, review research methodologies, structure essays, provide line-by-line feedback, and compile custom explanatory study examples. We do NOT condone contract cheating, ghostwriting, or exam-impersonation. All materials provided are intended as reference models for study purposes.',
    category: 'Tutoring Process',
    order: 1,
  },
  {
    id: 'static_faq_4',
    question: 'What is your revision and refund policy?',
    answer:
      'If the tutorial advice or sample example provided does not meet your initial briefing, you have 7 days from tutor delivery to click the "Request Revision" button on your assignment card. You can describe what parts require optimization. It is 100% free of charge. If disputes remain unresolved, an administrator will step in to arbitrate.',
    category: 'Revisions & Refunds',
    order: 1,
  },
  {
    id: 'static_faq_5',
    question: 'How do I schedule a Live 1-on-1 whiteboarding slot?',
    answer:
      'After selecting "1-on-1 Live Tutoring" and selecting a tutor, you can open their chat and select dates from their interactive calendar slots. Tutors support live interactive video sessions with real-time whiteboards directly inside our app.',
    category: 'Technical Issues',
    order: 1,
  },
  {
    id: 'static_faq_6',
    question: 'Are there any hidden service charges or sign-up fees?',
    answer:
      'None at all. Registering an account is completely free for both students and tutors. The prices you see on quote cards are fully transparent and include all platform processing fees. There are no recurring subscription charges or hidden commissions.',
    category: 'Payments',
    order: 2,
  },
  {
    id: 'static_faq_7',
    question: 'What subjects and disciplines do you support?',
    answer:
      'Our professional mentoring network covers a broad spectrum of academic specialties. This includes STEM disciplines (Mathematics, Statistics, Organic Chemistry, Biochemistry, Computer Science, AI & Machine Learning), Humanities (History, Literature, Sociology), Business & Economics (Corporate Finance, Micro/Macroeconomics, Accounting, Quantitative Analysis), as well as selective fields such as Legal Studies, Nursing Science, and Dissertation Methodology design.',
    category: 'General',
    order: 2,
  },
  {
    id: 'static_faq_8',
    question: 'Can I request a specific tutor for a long-term coursework program?',
    answer:
      'Yes! If you find a tutor whose coaching methodology matches your learning style, you can request them for long-term study partnerships. You can message them directly through our secure chat to structure custom weekly milestones, outline multi-phase projects, and secure continuous feedback throughout your academic semester.',
    category: 'Tutoring Process',
    order: 2,
  },
  {
    id: 'static_faq_9',
    question: 'How can I contact platform support if I encounter a system bug?',
    answer:
      'Our operational technical support is available 24/7. You can instantly submit a Support Ticket directly from your dashboard or email our dedicated administrative helpline at support@universitytutors.com. Our senior team typically replies and resolves system issues within a two-hour window.',
    category: 'Technical Issues',
    order: 2,
  },
  {
    id: 'static_faq_10',
    question: 'What happens if a tutor submits work late?',
    answer:
      'If a tutoring session or model asset delivery is delayed past the agreed-on deadline, you can raise an immediate de-escalation warning. Under our platform standards, late submissions qualify the student client for automatic adjustments or a full escrow refund if the utility of the reference work has been compromised.',
    category: 'Revisions & Refunds',
    order: 2,
  },
  {
    id: 'static_faq_11',
    question: 'Is my personal information and academic identity kept secure?',
    answer:
      'Absolutely. We enforce robust privacy controls. Your registration email address, real name, and academic institution details are strictly shielded. Tutors and students only interact using their verified operational usernames, and we never share your data or database records with third-party networks or academic bodies.',
    category: 'General',
    order: 3,
  },
  {
    id: 'static_faq_12',
    question: 'How do I submit essays or files for review?',
    answer:
      'Inside your secure portal, you can create a dissertation or assignment card and upload documents (MS Word files, PDFs, or raw programmatic scripts) directly to our sandboxed assignment workbench. Our integrated viewers allow tutors to make inline annotations, leave comments, and attach video-guided feedback.',
    category: 'Technical Issues',
    order: 3,
  },
  {
    id: 'static_faq_13',
    question: 'Who resolves disputes if a tutor does not follow the rubric guidelines?',
    answer:
      'In the rare event of a disagreement, you can launch a dispute directly on the active assignment. This blocks the Stripe escrow payout from being released. The Academic Arbitration Council of University-Tutors will step in to inspect files, chat instructions, and milestone rubrics, issuing a balanced and fair verdict.',
    category: 'Revisions & Refunds',
    order: 3,
  },
  {
    id: 'static_faq_14',
    question: 'What is the duration of a standard live tutoring session?',
    answer:
      'Live sessions are scheduled in flexible 30-minute, 60-minute, or 90-minute intervals. Tutors will collaborate with you to define structural agendas beforehand, maximizing active learning outcomes.',
    category: 'Tutoring Process',
    order: 3,
  },
  {
    id: 'static_faq_15',
    question: 'Which payment options are supported?',
    answer:
      'Our checkout gateways are securely built on Stripe, accepting all major credit/debit cards (Visa, Mastercard, American Express, Discover), as well as digital wallets like Apple Pay and Google Pay. Bank transfers can be arranged for custom premium accounts.',
    category: 'Payments',
    order: 3,
  },
];

interface BlogComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export default function MarketingSubpages({
  activeView,
  tutors,
  blogs,
  faqs,
  onNavigate,
  onTutorSelect,
  onRaisedConsult,
}: MarketingSubpagesProps) {
  // FAQs State
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Dedicated Service Views State (null shows grid overview)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(() => {
    const matched = resolveDedicatedServiceRoute(activeView);
    return matched ? matched.id : null;
  });

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('service inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFile, setContactFile] = useState<string>('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Blog Details & Search State
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogActiveCategory, setBlogActiveCategory] = useState('All');
  const [blogClaps, setBlogClaps] = useState<Record<string, number>>({
    blog_1: 118,
    blog_2: 84,
  });
  const [blogComments, setBlogComments] = useState<Record<string, BlogComment[]>>({
    blog_1: [
      {
        id: 'c1',
        author: 'Markus Vance',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        content:
          'As a second-year student, this Harvard guide has saved me so much headache on my final papers. Simple block templates and exact in-text guidelines are invaluable!',
        timestamp: '2 days ago',
      },
      {
        id: 'c2',
        author: 'Dr. Clara Stirling (Tutor)',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        content:
          'Always check if your university requires double punctuation before citations! That is the most common reason lecturers deduct marks on references.',
        timestamp: '1 day ago',
      },
    ],
    blog_2: [
      {
        id: 'c3',
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        content:
          'The time-boxed chapters guide is fantastic. Do you offer methodological advice for quantitative SPSS models in chemistry dissertation drafts?',
        timestamp: '3 days ago',
      },
      {
        id: 'c4',
        author: 'Liam Kennedy (Tutor)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        content:
          'Absolutely, Elena! Most of our quantitative tutors can help compile sample tables and explain dataset distributions. Select Dissertation tutoring to connect!',
        timestamp: '12 hours ago',
      },
    ],
  });
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentTxt, setNewCommentTxt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ensure catalog data (full tutors + default blogs) is loaded when landing directly on subpages
  useEffect(() => {
    void store.ensureCatalogDataLoaded();
  }, []);

  // Sync selected blog and dedicated service page with activeView URL state
  useEffect(() => {
    setSelectedBlog(null);
    const matchedDedicated = resolveDedicatedServiceRoute(activeView);
    setSelectedServiceId(matchedDedicated ? matchedDedicated.id : null);
  }, [activeView]);

  // Sync state between sibling child views if lateral jump takes place
  useEffect(() => {
    const handleServiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        const route = resolveDedicatedServiceRoute(customEvent.detail);
        if (route) {
          onNavigate(route.view);
        } else {
          setSelectedServiceId(customEvent.detail);
        }
      }
    };
    window.addEventListener('change-dedicated-service', handleServiceChange);
    return () => {
      window.removeEventListener('change-dedicated-service', handleServiceChange);
    };
  }, [onNavigate]);

  const handleCopyCitation = (blog: Blog) => {
    const citationText = `University-Tutors. (2026). ${blog.title}. Academic Guides & Mentorship Articles. Retrieved from https://universitytutors.com/blog/${blog.id}`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(blog.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddCommentSubmit = (e: React.FormEvent, blogId: string) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentTxt.trim()) return;

    const newComment: BlogComment = {
      id: 'comment_' + Math.random().toString(36).substring(2, 9),
      author: newCommentName.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      content: newCommentTxt.trim(),
      timestamp: 'Just now',
    };

    setBlogComments((prev) => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), newComment],
    }));

    setNewCommentName('');
    setNewCommentTxt('');
  };

  const renderBlogContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;

      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '');
        return (
          <h2
            key={idx}
            className="text-lg md:text-xl font-bold text-gray-950 font-sans tracking-tight mt-6 mb-3 border-b border-gray-100 pb-1"
          >
            {headerText}
          </h2>
        );
      }

      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const listText = trimmed.replace(/^[*+-]\s*/, '');
        return (
          <div key={idx} className="flex gap-2.5 items-start pl-4 py-1.5">
            <span className="text-orange-650 font-bold mt-1 text-sm">•</span>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-sans">{listText}</p>
          </div>
        );
      }

      if (trimmed.startsWith('Step ') || /^\d+\./.test(trimmed)) {
        return (
          <h3
            key={idx}
            className="text-xs md:text-sm uppercase tracking-wider font-extrabold text-orange-700 font-sans mt-5 mb-2"
          >
            {trimmed}
          </h3>
        );
      }

      return (
        <p key={idx} className="text-xs md:text-sm text-gray-700 leading-relaxed font-sans mb-4">
          {trimmed}
        </p>
      );
    });
  };

  const consolidatedFaqs: FAQ[] = [...faqs];
  STATIC_FAQS.forEach((sf) => {
    if (
      !consolidatedFaqs.some(
        (f) => f.question.toLowerCase().trim() === sf.question.toLowerCase().trim() || f.id === sf.id
      )
    ) {
      consolidatedFaqs.push(sf);
    }
  });

  const filterFaqs = consolidatedFaqs.filter((faq) => {
    const matchesCategory = faqCategory === 'All' || faq.category === faqCategory;
    const matchesKeyword =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  const categories = ['All', 'General', 'Payments', 'Tutoring Process', 'Technical Issues', 'Revisions & Refunds'];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRaisedConsult(
      `Inquiry raised by ${contactName} (${contactEmail}) under category: ${contactSubject}.\nMessage: ${contactMessage}`
    );
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactFile('');
      setContactSuccess(false);
    }, 4000);
  };

  return (
    <>
      {/* ==================== 2. ABOUT US ==================== */}
      {activeView === 'about' && (
        <section
          id="about-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in"
        >
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700 block mb-2">
              Our Origins &amp; Academic Mission
            </span>
            <h1 className="text-3xl md:text-4.5xl font-bold text-gray-950 font-sans tracking-tight leading-tight">
              To make high-quality, ethical academic guidance accessible worldwide.
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 font-sans">Our Founding Story</h2>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                universitytutors.com was established by a collective of Oxford advisors and MIT graduate mentors who witnessed a worrying surge in questionable ghostwriting services. We believed university students deserved a 100% transparent, and ethically complaint, mentorship platform.
              </p>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                By designing secure escrow billing parameters and vetting every single candidate's official transcripts, we established a peer-to-peer ecosystem where high academic standards thrive synchronously with absolute customer protection.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <ResponsivePicture
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=76"
                alt="Remote educational team collage"
                width={560}
                height={288}
                sizes="(max-width: 768px) 92vw, 560px"
                widths={[360, 560, 800]}
                loading="lazy"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-white/95 text-gray-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-md">
                  Oxford • Toronto • Boston • Sydney • Auckland
                </span>
              </div>
            </div>
          </div>

          {/* Numbers section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { num: '500+', label: 'Vetted Native Tutors' },
              { num: '20k+', label: 'Assignments Completed' },
              { num: '98%', label: 'Positive Satisfaction' },
              { num: '24/7', label: 'Ecosystem Availability' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-150 p-6 rounded-2xl text-center">
                <span className="text-3xl md:text-4xl font-mono font-extrabold text-orange-650 block">{stat.num}</span>
                <span className="text-[11px] font-semibold text-gray-600 block mt-1 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Sample Profiles list */}
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-950 font-sans tracking-tight">
                Meet Our On-Call Specialist Tutors
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Directly initiate private conversation logs with our primary sandbox mentors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:border-orange-200 transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex gap-4">
                      <ResponsiveAvatar
                        src={t.avatarUrl}
                        sizePx={48}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="w-12 h-12 rounded-full border shadow-inner object-cover shrink-0"
                        alt={t.name || 'Avatar'}
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-gray-950 block">{t.name}</h3>
                          <img
                            src={`https://flagcdn.com/w40/${t.country ? t.country.toLowerCase() : 'us'}.png`}
                            alt={t.country || 'US'}
                            width={18}
                            height={12}
                            loading="lazy"
                            decoding="async"
                            title={`Based in ${t.country || 'US'}`}
                            className="w-4.5 h-3 shadow-xs object-cover rounded-sm border border-gray-150 inline"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-[11px] font-bold text-gray-800">{t.rating}</span>
                          <span className="text-[10px] text-gray-600">({t.reviewCount} verified feedback)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed italic line-clamp-3">"{t.bio}"</p>

                    <div className="flex flex-wrap gap-1.5">
                      {t.subjects?.map((sub, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-600 block uppercase font-mono leading-none">
                        Pricing Mode
                      </span>
                      <span className="text-xs font-bold text-orange-700 block mt-0.5">By Quote Only</span>
                    </div>
                    <button
                      id={`discuss-detail-${t.id}`}
                      onClick={() => onTutorSelect(t)}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 min-h-[44px] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
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
      {(activeView === 'services' || Boolean(resolveDedicatedServiceRoute(activeView))) && (
        <section
          id="services-section"
          className="py-12 md:py-20 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in"
        >
          {selectedServiceId === null ? (
            /* ==================== SERVICES OVERVIEW HUB ==================== */
            <div className="space-y-16">
              {/* Specialized Services Dedicated Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white border border-gray-150 p-6 sm:p-10 lg:p-12 rounded-[32px] shadow-xs">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-1.5 bg-orange-100/70 text-orange-700 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200 w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Double-Vetted Native Syllabus Support</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tight text-[#0B1528] leading-none font-heading">
                    Premium Services <span className="text-orange-650">Tailored to University</span> Standards
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-semibold">
                    Gain premium academic leverage with native tutors matched to your specific local university curricula. We specialize in high-impact structural feedback, active whiteboard sessions, reference maps, and customized formula derivations. Our services are fully aligned with strict university academic integrity guidelines.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => onNavigate('get-a-quote')}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 min-h-[44px] rounded-xl shadow-lg shadow-orange-650/15 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Request Free Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate('faqs')}
                      className="bg-gray-100 hover:bg-gray-200 text-[#0B1528] font-bold text-xs tracking-wider uppercase px-6 py-3.5 min-h-[44px] rounded-xl transition-all text-center cursor-pointer"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Right Hero Image Column */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <ResponsivePicture
                      src={hero1on1Img}
                      alt="University study collaboration group with expert tutor"
                      width={800}
                      height={533}
                      loading="eager"
                      sizes="(max-width: 1024px) 94vw, 420px"
                      className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span>352 Experts Online</span>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-[#FDF8F0]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-orange-200/50 text-[10px] text-orange-950 font-bold tracking-wider uppercase flex flex-col items-end leading-none">
                      <span className="text-orange-700 text-xs mb-0.5 font-sans font-black">4.97★ RATING</span>
                      <span>Average score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsection Intro */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-700 block mb-1">
                  Our Core Disciplines
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0B1528]">Select an Academic Service</h2>
              </div>

              {/* Service Cards Grid - 4 core services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. 1-on-1 LIVE TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <ResponsivePicture
                        src={hero1on1Img}
                        alt="1-on-1 Live Online Tutoring with Interactive Digital Whiteboard"
                        width={600}
                        height={352}
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-650 shadow-xs">
                        <Video className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-emerald-700 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                          Active Whiteboard 24/7
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>HD Video &amp; LaTeX Derivations</span>
                        <span className="flex items-center gap-1 text-amber-300">★ 4.98</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                      1-on-1 Live Online Tutoring
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                      Personalized, real-time interactive lectures and doubt clearing. Screen sharing, active workspace recording, and dedicated homework support across 20+ disciplines.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['STEM Matrix', 'Economics', 'CS & Python', 'Undergrad/Grad'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-2 font-semibold">
                    <span className="text-xs font-bold text-orange-700">Case-by-case Escrow Quotes</span>
                    <a
                      href="/services/1-on-1-live-tutoring"
                      onClick={(e) => {
                        if (!isModifiedAnchorClick(e)) {
                          e.preventDefault();
                          onNavigate('service-1on1');
                        }
                      }}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 2. ASSIGNMENT TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <ResponsivePicture
                        src={heroAssignmentImg}
                        alt="Assignment Guidance & Reference Outlines"
                        width={600}
                        height={352}
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-650 shadow-xs">
                        <FileText className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-red-700 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                          Turnitin-Safe Rubrics
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>Formula Derivations &amp; Logic Maps</span>
                        <span className="text-emerald-300">100% Ethical</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                      Assignment Guidance &amp; Reference Outlines
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                      Detailed structural feedback, template formula derivations and references outline blueprints compliant with university academic codes.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['Problem Sets', 'Lab Reports', 'Case Studies', 'References Map'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-2 font-semibold">
                    <span className="text-xs font-bold text-orange-700">Emergency Vetting Available</span>
                    <a
                      href="/services/assignment-guidance"
                      onClick={(e) => {
                        if (!isModifiedAnchorClick(e)) {
                          e.preventDefault();
                          onNavigate('service-assignment');
                        }
                      }}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 3. COURSEWORK TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <ResponsivePicture
                        src={heroCourseworkImg}
                        alt="Semester-Long Coursework Tracks"
                        width={600}
                        height={352}
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-650 shadow-xs">
                        <Calendar className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-indigo-700 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                          14-Week Term Support
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>Syllabus-Mapped Milestones</span>
                        <span className="text-indigo-200">GPA Boost</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                      Semester-Long Coursework Tracks
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                      Syllabus-mapped weekly coaching, exam-guides revision, and continuous milestone tracking to guarantee premium grade averages safely.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['Milestone Quotes', 'Weekly Revisions', 'Quiz Guides', 'Exam Prep'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-2 font-semibold">
                    <span className="text-xs font-bold text-orange-700">Syllabus-Mapped Planner</span>
                    <a
                      href="/services/coursework-track"
                      onClick={(e) => {
                        if (!isModifiedAnchorClick(e)) {
                          e.preventDefault();
                          onNavigate('service-coursework');
                        }
                      }}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 4. ESSAY WRITING TUTORING */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all hover:border-orange-250 animate-fade-in group">
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden h-44 w-full border border-gray-100 shadow-xs">
                      <ResponsivePicture
                        src={heroEssayImg}
                        alt="Essay Rhetoric & Citations"
                        width={600}
                        height={352}
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-orange-650 shadow-xs">
                        <BookOpen className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] bg-amber-700 text-white font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                          Editorial Prose Review
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>APA, MLA, Harvard &amp; Chicago</span>
                        <span className="text-amber-200">Thesis Flow</span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                      Essay Rhetoric &amp; Citations
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                      Learn how to formulate master thesis declarations, structure logical narrative statements, and verify perfect APA, MLA and Harvard citations references.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 font-semibold">
                      {['Thesis Optimization', 'Style Checkers', 'Structure Flows', 'SOP Writing'].map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-2 font-semibold">
                    <span className="text-xs font-bold text-orange-700">APA, MLA, Harvard, Chicago</span>
                    <a
                      href="/services/essay-reference-checks"
                      onClick={(e) => {
                        if (!isModifiedAnchorClick(e)) {
                          e.preventDefault();
                          onNavigate('service-essay');
                        }
                      }}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Explore Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Integrity Statement / System Guidelines */}
              <div className="p-6 bg-amber-50/40 border border-amber-200/50 rounded-2xl text-left space-y-2">
                <span className="text-xs font-bold text-amber-900 block uppercase tracking-wide">
                  🔒 Strict Academic Integrity Escrow Lock
                </span>
                <p className="text-xs text-amber-950 leading-relaxed italic font-semibold">
                  "Our system enforces strict compliance parameters. We provide structural tutoring, formula derivations guides, and editorial prose coaching. Our advisors are strictly prohibited from writing assignments or taking proctored exams for you. We help you learn to secure genuine high marks safely."
                </p>
              </div>
            </div>
          ) : (
            /* ==================== MODULAR SHIELD OF DEDICATED CHILD SERVICES ==================== */
            <React.Suspense
              fallback={
                <div className="py-20 flex justify-center items-center text-orange-650">
                  <span className="w-8 h-8 border-2 border-orange-650 border-t-transparent rounded-full animate-spin"></span>
                </div>
              }
            >
              <DedicatedServicePages
                selectedServiceId={selectedServiceId}
                tutors={tutors}
                onTutorSelect={onTutorSelect}
                onNavigate={onNavigate}
                onBackToHub={() => {
                  onNavigate('services');
                }}
              />
            </React.Suspense>
          )}
        </section>
      )}

      {/* ==================== 4. FAQs SECTION ==================== */}
      {activeView === 'faqs' && (
        <section
          id="faqs-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700">Knowledge Sandbox</span>
              <h1 className="text-3xl font-bold text-gray-950 font-sans tracking-tight">Frequently Asked Questions</h1>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                We handle verification parameters, Stripe Escrow locks, and native tutoring credentials transparently. Type keywords to query database questions.
              </p>

              {/* Dynamic Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  id="faq-search-input"
                  placeholder="Query e.g. escrow, oxford, ethics..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:outline-hidden py-2.5 pl-10 pr-4 min-h-[44px] rounded-xl text-xs transition-colors"
                />
              </div>

              {/* Accordion Categories */}
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`faq-cat-filter-${cat.replace(/\s+/g, '')}`}
                    onClick={() => setFaqCategory(cat)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                      faqCategory === cat ? 'bg-orange-650 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        faqCategory === cat ? 'bg-orange-850 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {cat === 'All' ? consolidatedFaqs.length : consolidatedFaqs.filter((f) => f.category === cat).length}
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
                      className="flex items-center justify-between w-full p-5 min-h-[48px] text-left text-xs font-bold text-gray-900 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-600 transition-transform shrink-0 ${
                          expandedFaq === faq.id ? 'rotate-180 text-orange-650' : ''
                        }`}
                      />
                    </button>

                    {expandedFaq === faq.id && (
                      <div
                        id={`faq-answer-${faq.id}`}
                        className="px-5 pb-5 pt-2 text-xs text-gray-700 leading-relaxed border-t border-gray-100 bg-gray-50/20"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <HelpCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No matching questions found in our FAQ repository.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 5. CONTACT US SECTION ==================== */}
      {activeView === 'contact' && (
        <section
          id="contact-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in animate-duration-250"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact form */}
            <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl border border-gray-150 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700 block mb-1">
                Confidential Channels
              </span>
              <h1 className="text-2.5xl font-bold text-gray-950 font-sans tracking-tight">Connect with Advising Team</h1>
              <p className="text-xs text-gray-600 mt-1 mb-8">
                Discuss specific university homework, dissertation outlines, or curriculum needs confidentially.
              </p>

              {contactSuccess ? (
                <div
                  id="contact-success-msg"
                  className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center space-y-2"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto" />
                  <h2 className="font-bold text-base text-gray-950 font-sans">Inquiry Registered Confirmed</h2>
                  <p className="text-xs text-emerald-800">
                    Our advisor team is routing your instructions to fitting native English subject coordinators inside our database. Expect responses in under 15 minutes!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-input-name" className="text-xs font-bold text-gray-700 block mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        id="contact-input-name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Liam sterling"
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:outline-hidden py-2.5 px-3 min-h-[44px] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-input-email" className="text-xs font-bold text-gray-700 block mb-1">
                        Registered Account Email
                      </label>
                      <input
                        type="email"
                        required
                        id="contact-input-email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@university.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:outline-hidden py-2.5 px-3 min-h-[44px] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject-dropdown" className="text-xs font-bold text-gray-700 block mb-1">
                      Inquiry Subject Focus
                    </label>
                    <select
                      id="contact-subject-dropdown"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2.5 px-3 min-h-[44px] rounded-lg text-xs"
                    >
                      <option value="service inquiry">Book Academic Consultation</option>
                      <option value="billing">Payments Escrow Verification</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Tutor Registration Screening</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-textarea-msg" className="text-xs font-bold text-gray-700 block mb-1">
                      Syllabus Details &amp; Notes
                    </label>
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
                    <label htmlFor="contact-attachment-btn" className="text-xs font-bold text-gray-700 block mb-1">
                      Optional Assignment Documents (Briefs, Prompts, Drafts)
                    </label>
                    <div className="border border-dashed border-gray-250 rounded-xl p-4 bg-gray-50 text-center relative cursor-pointer hover:bg-orange-50/20 hover:border-orange-200 transition-colors">
                      <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-gray-850 block">Click to upload files or drag here</span>
                      <span className="text-[10px] text-gray-600 block mt-0.5">
                        Maximum limit 5 documents (PDF, DOCS, ZIP, Image, PPT, or other media up to 25MB)
                      </span>

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
                      <span
                        id="contact-file-attached"
                        className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded inline-block mt-2 font-mono font-bold"
                      >
                        ✓ {contactFile} attached
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className="w-full bg-orange-650 text-white font-bold text-xs py-3 min-h-[44px] rounded-xl hover:bg-orange-700 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-orange-650/10"
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
                  <h2 className="font-bold text-sm text-gray-900 font-sans tracking-tight mb-2">
                    Our Support Standard
                  </h2>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Our dynamic dashboard leverages verified country coordinators to answer questions under local pricing rates. Feel safe chatting and getting quotes.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-gray-700">
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-orange-650 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Ecosystem Inbox</span>
                      <span className="text-gray-600 text-[11px]">support@universitytutors.com</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="w-4 h-4 text-orange-650 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Priority Phone Line</span>
                      <span className="text-gray-600 text-[11px]">+1 (800) 123-TUTOR</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="w-4 h-4 text-orange-650 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Operational Branch Hours</span>
                      <span className="text-gray-600 text-[11px]">Mon-Fri, 9:00am - 9:00pm GMT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Hubs card */}
              <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-md bg-gray-100 flex flex-col justify-end text-left relative h-64">
                <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400')]" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/20 to-orange-100/10" />

                <div className="relative z-10 m-5 p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-orange-700 font-bold block uppercase leading-none">
                    Global Coverage Hubs
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-1 leading-tight">Virtual English Branches</p>
                  <p className="text-[10px] text-gray-600 leading-tight mt-0.5">
                    Secure, 24/7 routing to vetted Oxford, MIT, and Canadian mentors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 6. BLOG SYSTEM SECTION ==================== */}
      {activeView === 'blog' && (
        <section
          id="blog-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-7xl text-left animate-fade-in animate-duration-300"
        >
          {!selectedBlog ? (
            <>
              {/* Blog Listing View */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-700 block mb-2">
                    Platform Knowledge Hub
                  </span>
                  <h1 className="text-3xl md:text-4.5xl font-bold text-gray-950 font-sans tracking-tight">
                    University Survivals &amp; Academic Guidelines
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Written and screened by platform administrators and vetted mentors.
                  </p>
                </div>

                {/* Search Input Box */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search articles & tags..."
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 min-h-[44px] bg-white border border-gray-200 text-xs text-gray-950 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium shadow-xs"
                  />
                  {blogSearchQuery && (
                    <button
                      onClick={() => setBlogSearchQuery('')}
                      aria-label="Clear article search"
                      className="absolute inset-y-0 right-0 px-3 min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2.5 mb-10 border-b border-gray-100 pb-6">
                {Array.from(
                  new Set([
                    'All',
                    'University Survival',
                    'APA Guidelines',
                    'Mathematics Tricks',
                    'Legal Disclaimers',
                    ...blogs.map((b) => b.category).filter(Boolean),
                  ])
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBlogActiveCategory(cat)}
                    className={`px-4 py-2 min-h-[44px] rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      blogActiveCategory === cat
                        ? 'bg-orange-650 text-white shadow-md shadow-orange-650/15'
                        : 'bg-white border border-gray-205 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Filtered Grid */}
              {blogs.filter((b) => {
                const matchesCat = blogActiveCategory === 'All' || b.category === blogActiveCategory;
                const matchesSearch =
                  b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                  b.content.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                  b.tags.some((t) => t.toLowerCase().includes(blogSearchQuery.toLowerCase()));
                return matchesCat && matchesSearch;
              }).length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl max-w-lg mx-auto space-y-4">
                  <span className="text-4xl block">🔍</span>
                  <h2 className="font-sans font-bold text-base text-gray-950">No Articles Found</h2>
                  <p className="text-xs text-gray-600 px-8">
                    No references matched your filters or search keywords. Try shifting filters or entering different query parameters like "Dissertation".
                  </p>
                  <button
                    onClick={() => {
                      setBlogSearchQuery('');
                      setBlogActiveCategory('All');
                    }}
                    className="bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer"
                  >
                    Reset Grid filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  {blogs
                    .filter((b) => {
                      const matchesCat = blogActiveCategory === 'All' || b.category === blogActiveCategory;
                      const matchesSearch =
                        b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                        b.content.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                        b.tags.some((t) => t.toLowerCase().includes(blogSearchQuery.toLowerCase()));
                      return matchesCat && matchesSearch;
                    })
                    .map((b) => (
                      <div
                        key={b.id}
                        id={`blog-preview-card-${b.id}`}
                        className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                        onClick={() => {
                          setSelectedBlog(b);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                      >
                        <div>
                          <ResponsivePicture
                            src={b.imageUrl || b.image}
                            alt={b.title}
                            width={600}
                            height={224}
                            loading="lazy"
                            sizes="(max-width: 768px) 94vw, 560px"
                            widths={[400, 600, 800]}
                            className="w-full h-56 object-cover"
                          />
                          <div className="p-6 space-y-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-semibold tracking-wider text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full uppercase">
                                {b.category}
                              </span>
                              <span className="text-[10px] text-gray-600 font-mono">
                                {new Date(b.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-950 font-sans leading-tight group-hover:text-orange-650 transition-colors">
                              {b.title}
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{b.content}</p>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <div className="flex flex-wrap gap-1">
                            {b.tags.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-orange-700 flex items-center gap-1 group-hover:underline">
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
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-orange-700 py-2.5 px-4 min-h-[44px] rounded-xl bg-white border border-gray-200 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Knowledge Hub</span>
                </button>

                <div className="text-[10px] text-gray-600 font-medium font-mono hidden md:block">
                  Reference: https://universitytutors.com/blog/{selectedBlog.id}
                </div>
              </div>

              {/* Core Page Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pt-4">
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold tracking-widest text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full uppercase">
                        {selectedBlog.category}
                      </span>
                      <span className="text-xs text-gray-600 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedBlog.publishedAt).toDateString()}
                      </span>
                      <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        5 min read
                      </span>
                    </div>

                    <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-extrabold text-gray-950 font-sans tracking-tight leading-tight">
                      {selectedBlog.title}
                    </h1>

                    {/* Author Widget */}
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl max-w-sm">
                      <ResponsiveAvatar
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
                        alt="Academic Coordinator"
                        sizePx={48}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border border-orange-200 object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{selectedBlog.author || 'Editorial Team'}</p>
                        <p className="text-[10px] text-gray-600 font-medium">
                          Academic Research Advisor &amp; Peer Reviewer
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wide Display Banner Image */}
                  <div className="relative group overflow-hidden rounded-3xl border border-gray-200 shadow-lg">
                    <ResponsivePicture
                      src={selectedBlog.imageUrl || selectedBlog.image}
                      alt={selectedBlog.title}
                      width={800}
                      height={400}
                      loading="eager"
                      sizes="(max-width: 1024px) 94vw, 760px"
                      widths={[480, 768, 1024]}
                      className="w-full h-[320px] md:h-[400px] object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  </div>

                  {/* Article Body */}
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-xs leading-relaxed text-gray-800">
                    <div className="prose max-w-none text-xs md:text-sm font-sans space-y-4">
                      {renderBlogContent(selectedBlog.content)}
                    </div>
                  </div>

                  {/* Academic Citations Copy Widget */}
                  <div className="bg-orange-50/50 border border-orange-150/50 rounded-3xl p-5 md:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-orange-700 flex items-center gap-2 font-sans">
                        <Award className="w-4 h-4" />
                        <span>Cite this Guidance Reference</span>
                      </h2>
                      <button
                        onClick={() => handleCopyCitation(selectedBlog)}
                        className="text-[11px] font-bold text-orange-700 hover:text-orange-850 min-h-[36px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedId === selectedBlog.id ? 'Copied Citation!' : 'Copy Reference'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed font-sans">
                      If you are citing this advice within your essay plan or academic blog, please use this standardized citation structure:
                    </p>
                    <div className="p-3.5 bg-white border border-orange-100 rounded-xl font-mono text-[10px] text-gray-700 select-all leading-relaxed break-all">
                      University-Tutors. (2026). <em>{selectedBlog.title}</em>. Academic Guides &amp; Mentorship Articles. Available at: https://universitytutors.com/blog/{selectedBlog.id}
                    </div>
                  </div>

                  {/* Interactive Claps */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-gray-150 rounded-3xl gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h2 className="text-xs font-bold text-gray-900 font-sans">Was this academic article useful?</h2>
                      <p className="text-[11px] text-gray-600">
                        Provide direct encouragement to peer screening administrators.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setBlogClaps((prev) => ({
                          ...prev,
                          [selectedBlog.id]: (prev[selectedBlog.id] || 0) + 1,
                        }));
                      }}
                      className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200/50 px-5 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ThumbsUp className="w-4 h-4 text-orange-650 fill-orange-500/20" />
                      <span>Applaud Material ({blogClaps[selectedBlog.id] || 0})</span>
                    </button>
                  </div>

                  {/* Interactive Comments */}
                  <div className="border border-gray-150 bg-white rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-105">
                      <MessageSquare className="w-5 h-5 text-orange-650" />
                      <h2 className="font-bold text-sm text-gray-950 font-sans tracking-tight">
                        Discussions &amp; Academic Support reviews ({(blogComments[selectedBlog.id] || []).length} items)
                      </h2>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {(blogComments[selectedBlog.id] || []).map((comm) => (
                        <div key={comm.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex gap-3.5">
                          <ResponsiveAvatar
                            src={comm.avatar}
                            alt={comm.author}
                            sizePx={48}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900">{comm.author}</span>
                              <span className="text-[10px] text-gray-600 font-mono">{comm.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed font-sans">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => handleAddCommentSubmit(e, selectedBlog.id)}
                      className="pt-4 border-t border-gray-100 space-y-4"
                    >
                      <h3 className="text-xs font-bold text-gray-900">Add Your Student Comment / Inquiry</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Your Display Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rachel G."
                            value={newCommentName}
                            onChange={(e) => setNewCommentName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-h-[44px] text-xs text-gray-950 font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="text-[10px] text-gray-600 font-medium flex items-center md:pt-4">
                          All student comments are checked against our strict academic support rules.
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Your Message / Question *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Type your feedback, formatting questions, or mentoring inquiries on this article..."
                          value={newCommentTxt}
                          onChange={(e) => setNewCommentTxt(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-950 font-medium focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-orange-650 hover:bg-orange-700 text-white text-xs font-extrabold px-6 py-2.5 min-h-[44px] rounded-xl cursor-pointer shadow-xs hover:shadow-md transition-all uppercase tracking-wider font-sans"
                        >
                          Post Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-6 text-left">
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-3 shadow-xs">
                    <h2 className="text-xs font-bold text-orange-700 uppercase tracking-widest font-sans">
                      Vetted Reference Guides
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">
                      Our knowledge base is curated strictly by senior platform administrators to assist with formatting, academic outline guidelines, and successful escrow transaction setups.
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-semibold text-gray-600 italic block">
                        Last audited: Today, 15:16 UTC
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 space-y-4 shadow-xl border border-gray-800">
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold block uppercase leading-none">
                      Need Direct Mentoring?
                    </span>
                    <h2 className="text-lg font-bold font-sans tracking-tight leading-snug">
                      Struggling with a similar essay or methodology brief?
                    </h2>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Discuss your syllabus, template draft requirements, and rubrics directly with vetted lecturers under secure Stripe escrow coverage. No blind risk!
                    </p>
                    <button
                      id="blog-modal-services-btn"
                      onClick={() => {
                        setSelectedBlog(null);
                        onNavigate('services');
                      }}
                      className="w-full bg-orange-650 hover:bg-orange-700 text-white font-extrabold text-xs py-3 min-h-[44px] rounded-xl transition-all cursor-pointer block text-center uppercase tracking-wider font-sans shadow-md shadow-orange-650/10"
                    >
                      Browse Specialists
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4 shadow-xs">
                    <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider font-sans pb-1 border-b">
                      Other Suggested Reads
                    </h2>

                    <div className="space-y-4">
                      {blogs
                        .filter((ob) => ob.id !== selectedBlog.id)
                        .slice(0, 3)
                        .map((ob) => (
                          <div
                            key={ob.id}
                            onClick={() => {
                              setSelectedBlog(ob);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group flex gap-3 items-start cursor-pointer border-b border-gray-100 last:border-0 pb-3 last:pb-0 font-sans"
                          >
                            <ResponsiveAvatar
                              src={ob.image}
                              alt={ob.title}
                              sizePx={64}
                              width={56}
                              height={56}
                              className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest block mb-0.5">
                                {ob.category}
                              </span>
                              <h3 className="text-[11px] font-bold text-gray-900 group-hover:text-orange-650 transition-colors line-clamp-2 leading-tight">
                                {ob.title}
                              </h3>
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
        <section
          id="privacy-policy-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans"
        >
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-650" />
                University-Tutors Security &amp; Compliance
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-gray-950 tracking-tight leading-none">
                Privacy Policy &amp; GDPR Disclosure
              </h1>
              <p className="text-xs text-gray-600 font-mono">
                Effective Date: June 10, 2026 | Document Reference: UT-PRIVACY-V4
              </p>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-xs text-orange-900 leading-relaxed font-sans">
              <p className="font-bold mb-1">🔐 Your Academic Privacy is Locked</p>
              At University-Tutors, we respect your confidentiality. We do not sell or lease student files, homework briefs, exam preparation outlines, or communication logs to third‑party advertisers, universities, or data banks. Every query in our database is securely protected under Attribute‑Based Access Controls.
            </div>

            <div className="space-y-6 text-xs md:text-sm text-gray-700 leading-relaxed">
              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">1. Information We Collect</h2>
                <p>
                  To deliver tailored online mentoring, we capture the following details when you register or initiate support tasks:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li>
                    <strong>Account Identity:</strong> Display Name, verified sign-in email address, selected role (Student, Tutor, Admin).
                  </li>
                  <li>
                    <strong>Communications:</strong> Private live chat transcripts, offered quotes, milestone logs, and system operations files.
                  </li>
                  <li>
                    <strong>Academic Assets:</strong> Voluntary assignment prompts, bibliography materials, syllabus briefs, and text edits uploaded as attachments.
                  </li>
                  <li>
                    <strong>Payment Transactions:</strong> Stripe-managed credit records, escrow holds, and transaction identifiers. We do <em>not</em> store full credit-card records inside our servers.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">
                  2. Sensitive Data Protection Mechanisms &amp; Data Usage
                </h2>
                <p>
                  Captured records are processed solely under authorized educational directives. We implement rigorous, multi-layered data protection mechanisms to secure your sensitive information (such as personal files, chat transcripts, academic assets, and authentication credentials):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1 pb-2">
                  <li>
                    <strong>Encryption in Transit:</strong> All communications, user profile details, and academic assets are encrypted in transit using the industry-standard Transport Layer Security (TLS 1.3) protocol.
                  </li>
                  <li>
                    <strong>Encryption at Rest:</strong> All database fields, files, chat history, and uploaded documents are encrypted at rest using AES-256 cryptographic encryption keys on secure PostgreSQL database and cloud storage systems.
                  </li>
                  <li>
                    <strong>Strict Access Controls:</strong> We enforce Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC). Only the verified student, the specific assigned vetted tutor, and authorized system administrators can access communications and academic assets associated with a task.
                  </li>
                  <li>
                    <strong>Secured Escrow Framework:</strong> Payment details are processed entirely off-site by Stripe under PCI-DSS Level 1 compliance; no sensitive payment cards or raw banking credentials are ever handled or stored on our servers.
                  </li>
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
                <h2 className="text-sm md:text-base font-bold text-gray-900">3. CCPA, GDPR, and COPPA Compliance</h2>
                <p>
                  We provide identical high compliance bars for university students in the UK, United States, Canada, Australia, Ireland, and New Zealand:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li>
                    <strong>Data Minimization:</strong> You have the absolute right to demand manual account erasure or request files export. Contact support to trigger this instantly.
                  </li>
                  <li>
                    <strong>Zero Underage Marketing:</strong> We strictly serve university‑level and adult education paths. We do not deliberately market to or collect data from children under age 13.
                  </li>
                  <li>
                    <strong>Cookie Consent:</strong> Cookie variables are limited to safe persistent authentication tokens and active interface presets without trackers.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">4. Third-Party Hosting Data Systems</h2>
                <p>
                  All interactions are processed with absolute zero-knowledge integrations, utilizing industry-standard infrastructure:
                </p>
                <p>
                  Stripe handles financial escrow records through verified secure SSL tokens, and Cloud Run containers securely operate the frontend structures. No automated AI bots are permitted to harvest student files for model training without prior student authorization.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">
                  5. Google User Data Sharing &amp; Disclosure Policy
                </h2>
                <p>
                  We are committed to absolute transparency regarding your Google user data. We strictly define with whom your data is shared, transferred, or disclosed:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li>
                    <strong>Zero Commercial Sharing:</strong> We do <strong>not</strong> sell, lease, rent, trade, or share your Google user data (such as your basic profile details, name, or verified email address) with any third-party advertising networks, marketing firms, data brokers, or external AI model training systems.
                  </li>
                  <li>
                    <strong>Minimal Operational Transfers:</strong> Your user data is transferred or disclosed only to our direct infrastructure hosts solely for hosting and executing this platform. These systems are bound by strict data processing agreements and are not authorized to use your data for any other purpose.
                  </li>
                  <li>
                    <strong>Legal Compliance Disclosures:</strong> We do not disclose Google user data to any external parties unless required by a valid law enforcement subpoena, court order, or applicable legal obligation, and we will notify you of any such request unless legally prohibited.
                  </li>
                  <li>
                    <strong>Limited Use Requirements:</strong> Our use and transfer of information received from Google APIs to any other app adheres strictly to the Google API Services User Data Policy, including the Limited Use requirements.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">6. Right to Erasure &amp; Contact</h2>
                <p>
                  If you wish to terminate your local registration logs or completely destroy chat archives, email{' '}
                  <code className="bg-gray-100 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold font-sans">
                    support@universitytutors.com
                  </code>
                  , and we will fulfill your request immediately.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-orange-650 hover:bg-orange-700 text-white font-bold px-6 py-2.5 min-h-[44px] rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => {
                  onNavigate('services');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="text-orange-700 hover:text-orange-850 font-bold hover:underline min-h-[44px] cursor-pointer"
              >
                Browse Our Services &amp; Tutors →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 8. TERMS OF SERVICE ==================== */}
      {activeView === 'terms' && (
        <section
          id="terms-of-service-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans"
        >
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-orange-650" />
                University-Tutors Legal Agreement
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-[#331301] tracking-tight leading-none">
                Terms of Service &amp; Escrow Rules
              </h1>
              <p className="text-xs text-gray-600 font-mono">
                Last Updated: June 10, 2026 | Identifier: UT-TERMS-V4
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 leading-relaxed font-sans font-medium">
              <span className="font-bold text-amber-900 block mb-1">⚠️ Please Read: Strict Integrity Framework</span>
              By creating an account, posting assignments, or hiring verified tutors, you legally accept our strict Academic Integrity policy and Escrow Terms. Attempting to bypass the secure Stripe locks or soliciting tutors for dishonest ghostwriting models will trigger permanent termination.
            </div>

            <div className="space-y-6 text-xs md:text-sm text-[#542104] leading-relaxed">
              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">1. Academic Integrity Bound</h2>
                <p>
                  You agree that all outputs, models, research guides, chemistry solutions, essay outlines, and programming briefs provided by our tutors represent <strong>reference materials only</strong>. Yes, you read that right:
                </p>
                <div className="p-4 bg-orange-100/30 border border-orange-200 rounded-md font-sans italic text-xs space-y-1 my-3">
                  <p>
                    • You may <strong>NOT</strong> submit any tutor‑supplied content as your own work for academic grading credit.
                  </p>
                  <p>• Doing so violates institutional Honor Codes and will result in your permanent suspension from our platform.</p>
                  <p>• Our platform exists solely to foster explanatory peer‑coaching and study skills.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">2. Stripe Escrow Hold Parameters</h2>
                <p>
                  To secure transactions and allow confident syllabus evaluations, we employ our standard escrow safety track:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-1">
                  <li>
                    <strong>Price Agreement:</strong> Tutors and students freely negotiate customized rates based on syllabus complexity and expected depth. All pricing is visible before checkout.
                  </li>
                  <li>
                    <strong>Fund Locking:</strong> Accepted quotes prompt a Stripe authorization hold. Funds are locked securely in our administrative database.
                  </li>
                  <li>
                    <strong>Authorized Release:</strong> Funds are only disbursed to tutors after the student clicks "Review &amp; Approve" on finalized drafts, or the system auto-releases under default contract durations (typically 7 calendar days after delivery without disputation).
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">3. Revisions, Disputes &amp; Refunding</h2>
                <p>If a deliverable fails to meet the agreed‑upon rubrics:</p>
                <p>
                  Students are entitled to request free revisions. If a tutor fails to refine the assignment references within the requested timeline, standard dispute resolution triggers. Our internal Administrative Board will review the uploaded instruction briefs against the drafts to issue partial or complete refunds to the student escrow card.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm md:text-base font-bold text-gray-900">4. Tutor Conduct &amp; Account Termination</h2>
                <p>
                  Tutors agree to represent their credentials, transcripts, and native English fluency status accurately. Sharing accounts, attempting to take student communications offline, or blackmailing students for extra milestone payments represents a zero-tolerance breach. Tutors violating these conducts face immediate account suspension and escrow forfeiture.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#542104] hover:bg-black text-white font-bold px-6 py-2.5 min-h-[44px] rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => {
                  onNavigate('services');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="text-orange-700 hover:text-orange-850 font-bold hover:underline min-h-[44px] cursor-pointer"
              >
                Browse Our Services &amp; Tutors →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 8.5. GOOGLE OAUTH DISCLOSURE ==================== */}
      {activeView === 'google-disclosure' && (
        <section
          id="google-disclosure-section"
          className="py-16 md:py-24 container mx-auto px-4 md:px-8 max-w-4xl text-left animate-fade-in font-sans"
        >
          <div className="space-y-8 bg-white border border-gray-150 p-8 md:p-12 rounded-3xl shadow-xs">
            <div className="border-b border-gray-100 pb-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-orange-650" />
                Google API Compliance Center
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-gray-950 tracking-tight leading-none">
                Google OAuth Data Disclosure
              </h1>
              <p className="text-xs text-gray-600 font-mono">
                Effective Date: June 10, 2026 | Document Reference: UT-GOOGLE-OAUTH-V1
              </p>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-xs text-orange-900 leading-relaxed font-sans">
              <p className="font-bold mb-1">🔐 Fully Verified Security Protocols</p>
              This disclosure informs users of University-tutors about the scopes requested, exact purposes of authentication, and how basic profile metadata is handled. We prioritize data minimization and full transparency.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md">
                  Section A: The App Purpose
                </span>
                <h2 className="text-sm font-bold text-gray-900 pt-1">About Our Application</h2>
                <p className="text-xs text-gray-700 leading-relaxed font-sans">
                  University-tutors is an integrated academic support platform designed to connect students with expert educational consultants and tutors. This application facilitates secure, real-time consultation chats, document sharing for assignment briefs, and streamlined project tracking between students and administrative teams to enhance the overall learning experience.
                </p>
              </div>

              <div className="p-6 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-md">
                  Section B: Google Data Usage
                </span>
                <h2 className="text-sm font-bold text-gray-900 pt-1">How We Use Your Data</h2>
                <p className="text-xs text-gray-700 leading-relaxed font-sans">
                  When you sign in using your Google Account, University-tutors requests access to your basic profile information (such as your name and email address). We use this data exclusively to securely authenticate your account, personalize your dashboard, and verify your identity within our internal chat and support systems. We do not share, sell, or utilize your personal information for any secondary purposes.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
              <h2 className="text-sm md:text-base font-bold text-gray-900 font-sans">
                Requested OAuth Scopes &amp; Specific Uses
              </h2>
              <p className="text-xs text-gray-700">
                To provide a unified workspace session, our identity authentication integration requests standard non-sensitive permissions:
              </p>
              <ul className="list-disc pl-5 space-y-2 pt-1 text-xs text-gray-700 font-sans">
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

            <div className="pt-6 border-t flex flex-wrap gap-4 justify-between items-center text-xs">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-orange-650 hover:bg-orange-700 text-white font-bold px-6 py-2.5 min-h-[44px] rounded-xl cursor-pointer"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => {
                  onNavigate('services');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="text-orange-700 hover:text-orange-850 font-bold hover:underline min-h-[44px] cursor-pointer"
              >
                Browse Our Services &amp; Tutors →
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
