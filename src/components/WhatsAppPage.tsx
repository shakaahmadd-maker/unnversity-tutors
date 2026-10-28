import React, { useState } from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  PhoneCall, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Layers, 
  ChevronRight, 
  ArrowRight,
  Send,
  Lock,
  Headphones,
  FileCheck2,
  ChevronDown,
  Globe2
} from 'lucide-react';
import WhatsAppFormAd from './WhatsAppFormAd';
import { User } from '../types';

interface WhatsAppPageProps {
  currentUser?: User | null;
  onNavigate: (view: string) => void;
  whatsappNumber?: string;
}

export default function WhatsAppPage({
  currentUser,
  onNavigate,
  whatsappNumber = '19178094906'
}: WhatsAppPageProps) {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const directWhatsAppLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello University Tutors! 👋 I would like to inquire about 1-on-1 tutoring, assignment guidance, and pricing.'
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directWhatsAppLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const steps = [
    {
      step: '01',
      title: 'Send Requirements or Inquiry',
      desc: 'Share your assignment prompt, rubric questions, module code, or syllabus requirements directly on WhatsApp.',
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Instant Advisor Review (<60s)',
      desc: 'A senior university academic coordinator reviews your topic and assesses academic scope in under a minute.',
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Matched with Top PhD/Master Mentor',
      desc: 'We match you with a vetted subject specialist from top global institutions (Ivy League, Oxbridge, Russell Group).',
      badge: 'Step 3'
    },
    {
      step: '04',
      title: '1-on-1 Tutoring & Milestones',
      desc: 'Receive tailored conceptual walkthroughs, step-by-step drafting mentorship, and secure escrow protections.',
      badge: 'Step 4'
    }
  ];

  const disciplines = [
    {
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
      title: 'Computer Science & Software',
      topics: 'Python, Java, C++, React, Algorithms, Machine Learning, SQL, Database Design',
      tag: 'STEM Specialist'
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      title: 'Business, Finance & MBA',
      topics: 'Corporate Finance, DCF Modeling, Accounting, Econometrics, Strategic Management',
      tag: 'Ivy League Advisors'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      title: 'Law & Jurisprudence',
      topics: 'Contract Law, Tort, Constitutional Law, IRAC Case Analysis, Commercial Law',
      tag: 'Legal Scholars'
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      title: 'Engineering & Mathematics',
      topics: 'Calculus I-III, Linear Algebra, Differential Equations, Mechanical, Electrical',
      tag: 'Engineering Desk'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Nursing & Health Sciences',
      topics: 'Clinical Case Studies, Pharmacology, Public Health, Bio-statistics, EBP',
      tag: 'Medical Mentors'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      title: 'Dissertation & Thesis Mentorship',
      topics: 'Literature Review, Research Methodology, Data Analysis (SPSS/R), Harvard/APA Style',
      tag: 'Doctoral Panel'
    }
  ];

  const faqs = [
    {
      q: 'How fast do tutors and coordinators reply on WhatsApp?',
      a: 'Our academic coordination desk operates 24 hours a day, 7 days a week. Average initial response time on WhatsApp is under 45 to 60 seconds, connecting you directly with human subject advisors.'
    },
    {
      q: 'Can I send rubrics, PDFs, lecture slides, and project files via WhatsApp?',
      a: 'Yes! You can attach assignment briefs, grading rubric rubrics, dataset files (Excel, CSV, SPSS), Python/Jupyter notebooks, or PDF lecture notes directly in the WhatsApp chat for review.'
    },
    {
      q: 'Is my inquiry and academic identity completely confidential?',
      a: 'Absolutely. We enforce strict privacy and non-disclosure protocols. All inquiries, student details, and coursework discussions are protected under 256-bit encryption and are never disclosed to third parties.'
    },
    {
      q: 'How do quotes and payments work through WhatsApp?',
      a: 'After reviewing your specific requirements, our coordinator provides a transparent, all-inclusive price quote with zero hidden charges. Secure payments can be completed via protected Stripe/Card checkout or Escrow on our platform.'
    },
    {
      q: 'What timezones and countries do you support on WhatsApp?',
      a: 'We support university students across the United States, United Kingdom, Canada, Australia, Ireland, UAE, Singapore, New Zealand, and globally across all regional timezones.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" id="whatsapp-dedicated-page">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-emerald-400 font-bold">WhatsApp Academic Desk</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hotline Active 24/7</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full text-[11px] border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Link Copied' : 'Copy WhatsApp Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-linear-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/30 text-emerald-400" />
            <span>Direct WhatsApp Academic Hotline</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            Instant 1-on-1 University Tutoring &amp; <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Direct Quotes via WhatsApp
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Skip long email wait times. Chat directly with verified Ivy League &amp; Oxbridge academic coordinators for immediate assignment help, coursework guidance, and custom quotes.
          </p>

          {/* Key Metric Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span><strong>&lt; 60 Sec</strong> Avg Response</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span><strong>100%</strong> Confidential &amp; Safe</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span><strong>24/7</strong> All Global Timezones</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured WhatsApp Inquiry Form Component Container */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <WhatsAppFormAd
            currentUser={currentUser}
            whatsappNumber={whatsappNumber}
            title="Get Instant 1-on-1 Help & Direct Quotes via WhatsApp"
            subtitle="Fill out the quick form or click any topic link to immediately open a direct WhatsApp chat with our senior university tutoring coordinators."
          />
        </div>
      </section>

      {/* How WhatsApp Tutoring Works */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Simple 4-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">How WhatsApp Tutoring Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Get matched with the ideal subject specialist in minutes, without navigating complex ticketing portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 relative hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-emerald-500 font-mono">{item.step}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines & Subjects Available on WhatsApp */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Subject Coverage</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
                Popular Academic Topics on WhatsApp
              </h2>
            </div>
            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
            >
              <span>Inquire about your specific subject</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {disciplines.map((d, i) => (
              <div 
                key={i}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      {d.icon}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{d.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{d.topics}</p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello University Tutors! I would like help with ${d.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 pt-2 border-t border-slate-800/80 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Start WhatsApp Chat for {d.title}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Frequently Asked Questions */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Have Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">WhatsApp Tutoring FAQs</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about our instant WhatsApp tutoring channel.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl bg-linear-to-r from-emerald-900/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400/30 shadow-inner">
            <MessageCircle className="w-7 h-7 fill-emerald-400/30" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Ready to Chat with an Academic Expert?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Send a quick message on WhatsApp (+1 917-809-4906) and connect directly with senior advisors in under a minute.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Launch WhatsApp Chat Now</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>

            <button
              onClick={() => onNavigate('get-a-quote')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Or Request Online Form Quote
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
