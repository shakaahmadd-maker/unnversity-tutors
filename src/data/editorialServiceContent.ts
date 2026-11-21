import editorial1on1Img from '../assets/images/editorial_1on1_tutoring_1795258884119.jpg';
import editorialCourseworkImg from '../assets/images/editorial_coursework_track_1795258883218.jpg';
import editorialEssayImg from '../assets/images/editorial_essay_rhetoric_1795258884842.jpg';
import editorialGlobalImg from '../assets/images/editorial_global_tutoring_1795258885459.jpg';
import { DedicatedServiceId } from './dedicatedServiceRoutes';
import {
  COUNTRY_ONLINE_TUTORING_PAGES,
  CountryTutoringPageData,
} from './countryOnlineTutoringData';
import {
  COUNTRIES_CONFIG,
  SpecializedServicePageData,
} from './specializedTutoringServicesData';

export interface EditorialBullet {
  title: string;
  body: string;
}

export interface EditorialComparisonRow {
  dimension: string;
  generic: string;
  ours: string;
}

export interface EditorialPackage {
  name: string;
  description: string;
  cta: string;
}

export interface EditorialFaq {
  question: string;
  answer: string;
}

export interface EditorialServicePageConfig {
  id: string;
  hero: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    paragraphs: string[];
    primaryCta: string;
    secondaryCta: string;
    illustrationSrc: string;
    illustrationAlt: string;
    illustrationFallback: string;
    isCutout?: boolean;
  };
  challenges: {
    badge: string;
    title: string;
    intro: string;
    bullets: EditorialBullet[];
    summaryHighlight: string;
    illustrationSrc: string;
    illustrationAlt: string;
    illustrationFallback: string;
    isCutout?: boolean;
  };
  process: {
    badge: string;
    title: string;
    intro: string;
    steps: EditorialBullet[];
    illustrationSrc: string;
    illustrationAlt: string;
    illustrationFallback: string;
    isCutout?: boolean;
  };
  formats: {
    badge: string;
    title: string;
    intro: string;
    items: EditorialBullet[];
    disciplinesTitle: string;
    disciplinesIntro: string;
    disciplines: EditorialBullet[];
  };
  comparison: {
    badge: string;
    title: string;
    intro: string;
    leftColumnTitle: string;
    rightColumnTitle: string;
    rows: EditorialComparisonRow[];
  };
  integrity: {
    badge: string;
    title: string;
    intro: string;
    listLead: string;
    bullets: EditorialBullet[];
    closingBox: string;
    illustrationSrc: string;
    illustrationAlt: string;
    illustrationFallback: string;
    isCutout?: boolean;
  };
  audience: {
    badge: string;
    title: string;
    intro: string;
    profiles: EditorialBullet[];
  };
  packages: {
    badge: string;
    title: string;
    intro: string;
    items: EditorialPackage[];
  };
  faqs: EditorialFaq[];
  quickEnquiry: {
    eyebrow: string;
    replyBadge: string;
    title: string;
    subtitle: string;
    formatLabel: string;
    formatOptions: string[];
    deadlineLabel: string;
    deadlinePlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    submitLabel: string;
    inquirySubjectPrefix: string;
  };
  tutorShowcase: {
    badge: string;
    title: string;
    preferredCountryCode?: string;
    countryLabel?: string;
  };
  finalCta: {
    badge: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    steps: { step: string; title: string; subtitle: string }[];
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    illustrationSrc: string;
    illustrationAlt: string;
    illustrationFallback: string;
    isCutout?: boolean;
  };
  sampleModal: {
    badge: string;
    title: string;
    subtitle: string;
    excerptLabel: string;
    excerptQuote: string;
    feedbackLabel: string;
    diagnosisLabel: string;
    diagnosis: string;
    strategyLabel: string;
    strategy: string;
    footerNote: string;
    ctaLabel: string;
  };
}

// Existing transparent editorial cutout illustrations from /services/assignment-guidance
const ASSIGNMENT_HERO_CUTOUT =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/image-11-fotor-bg-remover-2026112112457.png?alt=media&token=aa8de304-cc01-419b-8fc1-d6f324494834';
const CHALLENGES_CUTOUT =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/Why%20Academic%20Assignments%20Feel%20So%20Challenging.png?alt=media&token=49260c70-de22-424e-bdc2-9514c31ae5b4';
const WORKFLOW_CUTOUT =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/How%20Our%20Assignment%20Guidance%20Works.png?alt=media&token=7262766e-c0b9-4fe7-b404-1331d67d1c89';
const INTEGRITY_CUTOUT =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/Built%20on%20Uncompromising%20Academic%20Integrity.png?alt=media&token=de7294ab-305c-4639-9d60-95971df876d1';
const FINAL_CTA_CUTOUT =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0303245370.firebasestorage.app/o/Next%20Assignment%20Brief.png?alt=media&token=33c89ce2-f1dc-4473-83e3-ebd622af8dbf';

const STANDARD_DISCIPLINES: EditorialBullet[] = [
  {
    title: 'Business, Finance & Economics:',
    body: 'Corporate strategy, marketing analytics, micro/macroeconomics, accounting, supply chain management, and organizational behavior.',
  },
  {
    title: 'Social Sciences & Humanities:',
    body: 'Psychology, sociology, political science, international relations, history, philosophy, literature, and media studies.',
  },
  {
    title: 'STEM & Computing:',
    body: 'Computer science, data analytics, mathematics, statistics, biology, chemistry, environmental science, and mechanical/electrical engineering.',
  },
  {
    title: 'Health & Life Sciences:',
    body: 'Nursing, public health, pharmacology, biomedical sciences, nutrition, and healthcare management.',
  },
  {
    title: 'Law & Public Policy:',
    body: 'Constitutional law, contract and tort analysis, criminal justice, human rights, and policy evaluation briefs.',
  },
];

// ============================================================================
// 1. DEDICATED CORE SERVICE PAGES (/services/*)
// ============================================================================

const ASSIGNMENT_GUIDANCE_CONFIG: EditorialServicePageConfig = {
  id: 'service-assignment',
  hero: {
    badge: 'university-tutors.com • One-on-One Academic Mentorship',
    titleStart: 'Expert Assignment Guidance & ',
    titleAccent: 'Academic Support',
    paragraphs: [
      'Navigating complex university coursework, overlapping submission deadlines, and rigorous academic grading standards can feel overwhelming—especially when a single assignment carries a significant percentage of your final module grade. Whether you are staring at a blank document unsure how to structure a 4,000-word research paper, struggling to decode an intricate marking rubric, or trying to synthesize dozens of peer-reviewed journal articles into a coherent literature review, our Assignment Guidance service is designed to bridge the gap between confusion and clarity.',
      'We provide personalized, one-on-one academic mentorship that empowers you to understand your coursework deeply, organize your arguments with logical precision, and produce high-caliber scholarly work with complete confidence. Rather than offering short-sighted shortcuts that compromise your education, we equip you with the critical thinking frameworks, research methodologies, structural blueprints, and academic writing techniques needed to succeed independently across any university discipline.',
    ],
    primaryCta: 'Book Your Assignment Guidance Session',
    secondaryCta: 'Browse Mentors by Subject',
    illustrationSrc: ASSIGNMENT_HERO_CUTOUT,
    illustrationAlt: 'Expert Assignment Guidance & Academic Support Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  challenges: {
    badge: 'Understanding Academic Expectations',
    title: 'Why Academic Assignments Feel So Challenging',
    intro:
      'Higher education requires a fundamentally different approach to learning and communication than secondary school or workplace writing. Many capable, hardworking students lose valuable marks not because they lack intelligence or effort, but because the unwritten rules of academic writing are rarely taught explicitly in lectures.',
    bullets: [
      {
        title: 'Ambiguous Assignment Prompts:',
        body: 'University briefs often rely on dense command words—such as critically evaluate, problematize, synthesize, or juxtapose—without explaining what those expectations look like in practice on the page.',
      },
      {
        title: 'Descriptive vs. Analytical Traps:',
        body: 'One of the most common reasons essays receive average grades is summarizing what sources say rather than critically analyzing why those findings matter, how they conflict, and what limitations exist in their methodologies.',
      },
      {
        title: 'Information Overload:',
        body: 'Access to massive academic databases can make it difficult to distinguish seminal foundational texts from peripheral studies, leading to unfocused reading and disorganized notes.',
      },
      {
        title: 'Strict Disciplinary Conventions:',
        body: 'A persuasive argument in sociology looks vastly different from an empirical report in psychology, a case brief in law, or an executive strategy analysis in an MBA program.',
      },
      {
        title: 'Time Management Under Pressure:',
        body: 'Balancing multiple modules, part-time work, internships, and personal responsibilities often leaves students rushing through the planning phase—the exact stage that determines the quality of the final submission.',
      },
    ],
    summaryHighlight:
      'Our Assignment Guidance service directly resolves each of these bottlenecks through targeted, human-led academic coaching.',
    illustrationSrc: CHALLENGES_CUTOUT,
    illustrationAlt: 'Why Academic Assignments Feel So Challenging Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  process: {
    badge: 'Step-by-Step Mentorship',
    title: 'How Our Assignment Guidance Works',
    intro:
      'Our structured, step-by-step mentorship process meets you wherever you are in your writing, research, or problem-solving journey—whether you have just downloaded the assignment brief or are refining a penultimate draft.',
    steps: [
      {
        title: 'Upload Your Brief, Rubric, and Context',
        body: 'Begin by submitting your assignment prompt, grading rubric, relevant lecture slides, reading lists, and any preliminary notes or drafts through our secure student portal. Sharing details about your degree level, target grade, and specific pain points allows us to understand your exact requirements from the outset.',
      },
      {
        title: 'Precision Matching With a Subject-Matter Mentor',
        body: "We pair you with an experienced academic advisor who holds postgraduate credentials (Master's or PhD) and teaching or grading experience in your specific field—spanning STEM, humanities, business, economics, social sciences, healthcare, and law.",
      },
      {
        title: 'Interactive Strategy & Blueprinting Session',
        body: 'During a live one-on-one video consultation or an in-depth annotated asynchronous review, your mentor dissects the assignment requirements alongside you. Together, you unpack the core research question, establish a defensible thesis statement or analytical framework, identify key literature themes, and map out a clear, word-count-allocated section-by-section outline.',
      },
      {
        title: 'Targeted Research & Methodology Coaching',
        body: 'If you are stuck finding credible sources or structuring an empirical investigation, your mentor demonstrates effective database search strategies, helps you evaluate source reliability, and guides you through selecting appropriate qualitative or quantitative frameworks.',
      },
      {
        title: 'Iterative Draft Feedback & Skill Reinforcement',
        body: 'As you write your assignment, submit milestones or complete drafts for comprehensive developmental feedback. Your mentor highlights areas to strengthen your critical analysis, improve paragraph-to-paragraph transitions, sharpen academic tone, refine data presentation, and ensure complete alignment with every criterion on your marking rubric.',
      },
    ],
    illustrationSrc: WORKFLOW_CUTOUT,
    illustrationAlt: 'How Our Assignment Guidance Works Illustration',
    illustrationFallback: editorialCourseworkImg,
    isCutout: true,
  },
  formats: {
    badge: 'Coursework & Disciplines',
    title: 'Comprehensive Coverage Across Academic Formats',
    intro:
      'University coursework takes many forms, and each deliverable demands its own specialized structure, evidence base, and rhetorical style. Our mentors provide tailored guidance across all major academic formats:',
    items: [
      {
        title: 'Research Papers & Analytical Essays',
        body: 'From short 1,500-word argumentative essays to expansive 5,000-word term papers, we help you formulate original, nuanced thesis statements that directly answer the prompt. You will learn how to structure cohesive body paragraphs using proven academic frameworks (such as Claim-Evidence-Analysis-Link), integrate counterarguments effectively, and maintain an authoritative, objective scholarly voice throughout.',
      },
      {
        title: 'Literature Reviews & Annotated Bibliographies',
        body: 'A strong literature review does far more than list summaries of individual studies. We coach you on how to map the broader scholarly conversation, group sources by shared themes or theoretical debates, identify gaps in existing research, and position your own inquiry within the academic landscape.',
      },
      {
        title: 'Business Case Studies & Strategy Reports',
        body: 'Business and management assignments require bridging academic theory with practical commercial reality. Our mentors guide you in applying diagnostic frameworks—such as SWOT, PESTLE, Porter’s Five Forces, VRIO, and financial ratio analysis—to real-world organizational challenges, while formatting crisp executive summaries and actionable, evidence-backed recommendations.',
      },
      {
        title: 'Scientific Lab Reports & Technical Documentation',
        body: 'Precision, reproducibility, and clarity define strong scientific communication. We assist you in structuring formal IMRaD (Introduction, Methods, Results, and Discussion) reports, articulating testable hypotheses, presenting statistical findings accurately without overstating conclusions, and explaining experimental limitations rigorously.',
      },
      {
        title: 'Reflective Journals & Practice-Based Portfolios',
        body: 'Common in nursing, education, social work, and leadership programs, reflective assignments require balancing personal insight with academic literature. We show you how to apply established reflective models—such as Gibbs’ Reflective Cycle, Schön’s Reflection-in-Action, or Kolb’s Experiential Learning Cycle—so your reflections demonstrate genuine professional growth rather than casual storytelling.',
      },
      {
        title: 'Quantitative, Coding & Problem-Solving Coursework',
        body: 'For technical modules in economics, statistics, data science, engineering, and computer science, our mentors walk you through problem-solving logic, model selection, algorithmic thinking, and code documentation. Rather than handing you answers, we help you debug your reasoning, interpret statistical outputs (such as regression tables or p-values), and explain technical results clearly in plain academic prose.',
      },
      {
        title: 'Presentations, Posters & Capstone Proposals',
        body: 'Translating dense written research into visual or spoken formats is a distinct skill. We help you distill complex arguments into clean, scannable slide decks, design effective academic posters, craft persuasive speaker notes, and prepare confident responses for Q&A panels or viva defenses.',
      },
      {
        title: 'Referencing, Citations & Academic Formatting',
        body: 'Inconsistent citations cost easy marks and create accidental plagiarism risks. Our mentors help you master the exact mechanical rules of APA (7th ed.), MLA (9th ed.), Harvard, Chicago/Turabian, IEEE, Vancouver, and OSCOLA styles—covering in-text citations, secondary referencing, block quotations, tables, appendices, and reference lists.',
      },
    ],
    disciplinesTitle: 'Subject Disciplines We Support',
    disciplinesIntro:
      'Because academic standards vary dramatically across faculties, we maintain a diverse network of specialists covering:',
    disciplines: STANDARD_DISCIPLINES,
  },
  comparison: {
    badge: 'Mentorship vs. Generic Tools',
    title: 'Why Choose Structured Academic Mentorship?',
    intro:
      "Students often turn to generic writing blogs, automated grammar tools, or unverified online forums when stuck on an assignment. While those resources offer surface-level tips, they cannot evaluate your specific argument against your professor's grading rubric.",
    leftColumnTitle: 'Generic Online Guides & Automated Tools',
    rightColumnTitle: 'Our One-on-One Assignment Guidance',
    rows: [
      {
        dimension: 'Alignment With Your Brief',
        generic: "Broad, generic advice disconnected from your module's learning outcomes",
        ours: 'Tailored directly to your exact prompt, course level, and grading rubric',
      },
      {
        dimension: 'Depth of Feedback',
        generic: 'Focuses on surface spelling, punctuation, and basic phrasing',
        ours: 'Addresses thesis strength, logical flow, evidence quality, and critical depth',
      },
      {
        dimension: 'Disciplinary Accuracy',
        generic: 'Treats all writing the same regardless of subject conventions',
        ours: 'Delivered by mentors trained in your specific academic discipline',
      },
      {
        dimension: 'Long-Term Skill Transfer',
        generic: 'Encourages passive reading or blind acceptance of automated edits',
        ours: 'Active, Socratic coaching that builds lasting research and writing skills',
      },
      {
        dimension: 'Academic Integrity',
        generic: 'High risk of unintentional plagiarism or inappropriate AI reliance',
        ours: '100% original work conceived, researched, and written entirely by you',
      },
      {
        dimension: 'Submission Confidence',
        generic: 'Guesswork about whether your draft actually answers the question',
        ours: 'Clear verification against every rubric criterion before you submit',
      },
    ],
  },
  integrity: {
    badge: '100% Honor-Code Compliant',
    title: 'Built on Uncompromising Academic Integrity',
    intro:
      'True academic success—and genuine career readiness—comes from mastering the material yourself. Our platform operates strictly as an educational coaching, tutoring, and mentorship service. We never write, ghostwrite, or complete assignments on behalf of students, nor do we supply pre-written essays, model answers for submission, or AI-generated coursework.',
    listLead:
      'Instead, our mentors act as dedicated academic coaches and Socratic guides. During every interaction, we focus on:',
    bullets: [
      {
        title: 'Unlocking Your Own Ideas:',
        body: 'Asking targeted questions that help you clarify what you actually think about the topic and why your perspective is supported by evidence.',
      },
      {
        title: 'Diagnosing Structural & Logical Gaps:',
        body: 'Pointing out where an argument jumps too quickly to a conclusion, lacks peer-reviewed backing, or drifts away from the prompt.',
      },
      {
        title: 'Demonstrating Techniques on Sample Material:',
        body: 'Showing you how to paraphrase properly, synthesize two conflicting studies, or interpret a dataset using illustrative examples so you can apply the technique yourself.',
      },
      {
        title: 'Teaching Self-Editing Mastery:',
        body: 'Equipping you with practical checklists to revise your own drafts for clarity, conciseness, and scholarly tone.',
      },
    ],
    closingBox:
      'Every single word, calculation, and citation you submit to your university remains 100% authentically yours. This ethical framework ensures full compliance with institutional honor codes while developing analytical capabilities you will rely on throughout your degree and career.',
    illustrationSrc: INTEGRITY_CUTOUT,
    illustrationAlt: 'Built on Uncompromising Academic Integrity Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  audience: {
    badge: 'Tailored For Every Learner',
    title: 'Who Benefits Most From Assignment Guidance?',
    intro:
      'Our mentorship model adapts to the unique goals, backgrounds, and schedules of diverse learners across higher education:',
    profiles: [
      {
        title: 'First-Year Undergraduates:',
        body: 'Navigating the steep transition from high school essays to university-level independent research, critical evaluation, and formal academic citation standards.',
      },
      {
        title: 'International & Multilingual Students:',
        body: 'Refining academic register, sentence clarity, and structural cohesion so sophisticated ideas are never obscured by second-language phrasing barriers.',
      },
      {
        title: "Postgraduate, Master's & MBA Candidates:",
        body: 'Managing accelerated modules, complex quantitative case studies, systematic literature reviews, and high-stakes capstone projects alongside demanding schedules.',
      },
      {
        title: 'Mature & Returning Students:',
        body: 'Returning to formal study after years in the workforce and quickly getting up to speed with modern digital libraries, referencing software, and contemporary academic conventions.',
      },
      {
        title: 'High-Achieving Students Aiming for Top Marks:',
        body: 'Moving from solid B-grade competence to distinction-level (First-Class / A+) critical originality, theoretical sophistication, and publication-grade clarity.',
      },
    ],
  },
  packages: {
    badge: 'Flexible Engagement Models',
    title: 'Flexible Support Packages for Every Stage of Your Semester',
    intro:
      'Every assignment requires a different level of support. You can engage with our mentors in the way that best fits your timeline and learning style:',
    items: [
      {
        name: 'Rapid Brief & Outline Kickstart (30–45 Minutes)',
        description:
          'Ideal right after receiving an assignment prompt. Walk away with a decoded rubric, a refined thesis or research question, a section-by-section word count plan, and a targeted reading strategy.',
        cta: 'Book Rapid Kickstart →',
      },
      {
        name: 'Comprehensive Draft Review (Asynchronous Annotated Feedback)',
        description:
          'Submit your completed or partial draft along with your rubric. Receive detailed margin comments dissecting argument clarity, evidence integration, structure, and referencing, accompanied by an actionable revision roadmap.',
        cta: 'Request Draft Review →',
      },
      {
        name: 'Live Deep-Dive Coaching Session (60 Minutes)',
        description:
          'Real-time collaborative screen-sharing and discussion with your mentor to work through complex data, restructure challenging sections, or refine your analytical framework together.',
        cta: 'Schedule Live Coaching →',
      },
      {
        name: 'End-to-End Milestone Mentorship',
        description:
          'Multi-session guidance spanning your entire assignment lifecycle—from initial topic scoping and literature mapping through mid-draft review and final pre-submission rubric verification.',
        cta: 'Start Milestone Mentorship →',
      },
    ],
  },
  faqs: [
    {
      question: 'How quickly can I get matched with a qualified mentor?',
      answer:
        'Most assignment guidance requests are matched with an appropriate subject-matter specialist within 2 to 4 hours. If you are working against an imminent deadline, our priority matching option connects you with an available mentor in under 60 minutes.',
    },
    {
      question: 'Do I need to have started writing before booking a session?',
      answer:
        'Not at all. In fact, many students achieve their best results by booking a session immediately after receiving their assignment prompt. Spending 30 minutes building a strong structural outline before you start drafting saves hours of stressful rewriting later.',
    },
    {
      question: 'Will my mentor edit or rewrite my paragraphs for me?',
      answer:
        'No. In accordance with our strict academic integrity policy, mentors do not rewrite or edit your text directly. Instead, they highlight specific sentences or paragraphs that need improvement, explain why they are unclear or unsupported, and show you strategies to revise them effectively yourself.',
    },
    {
      question: 'What materials should I upload when submitting a request?',
      answer:
        'For the most productive session, upload your official assignment brief, the grading rubric or marking criteria, any relevant lecture notes or core readings, and whatever outline, notes, or draft pages you have produced so far.',
    },
    {
      question: 'Can you help with group projects as well as individual assignments?',
      answer:
        'Yes. Group members can book a joint strategy session to divide responsibilities logically, establish a unified structural outline, align analytical frameworks across sections, and ensure consistent academic tone throughout the combined submission.',
    },
    {
      question: 'Is my coursework kept confidential?',
      answer:
        'Absolutely. All uploaded briefs, drafts, and session discussions are encrypted, strictly confidential, and never shared with third parties or stored in public databases.',
    },
  ],
  quickEnquiry: {
    eyebrow: 'Fast Mentor Match',
    replyBadge: '2–4 hr reply',
    title: 'Quick Assignment Enquiry',
    subtitle: "Share your brief details and get matched with a PhD/Master's specialist.",
    formatLabel: 'Assignment Format',
    formatOptions: [
      'Research Paper / Analytical Essay',
      'Literature Review / Annotated Bibliography',
      'Business Case Study / Strategy Report',
      'Scientific Lab Report (IMRaD)',
      'Reflective Journal / Portfolio',
      'Quantitative / Coding Coursework',
      'Presentation / Capstone Proposal',
    ],
    deadlineLabel: 'Submission Deadline *',
    deadlinePlaceholder: 'e.g., Next Friday / In 4 days',
    noteLabel: 'Brief Topic & Word Count *',
    notePlaceholder: 'Module subject, word count, or where you need guidance...',
    submitLabel: 'Send Quick Enquiry →',
    inquirySubjectPrefix: 'Assignment Guidance',
  },
  tutorShowcase: {
    badge: 'Verified Postgraduate Mentors',
    title: 'Meet Our Subject-Matter Tutors',
  },
  finalCta: {
    badge: 'Ready To Start Your Draft?',
    title: 'Turn Your Next Assignment Brief Into a Clear Plan of Action',
    paragraph1:
      'You do not have to stare at a complex prompt in isolation or hope your structure hits the mark on submission day. With the right academic mentorship, every assignment becomes an opportunity to sharpen your thinking, master your subject, and elevate your academic performance.',
    paragraph2:
      'Upload your assignment brief and grading rubric today to connect with a dedicated subject-matter mentor—and approach your next deadline with clarity, structure, and confidence.',
    steps: [
      { step: 'Step 01', title: 'Share Brief & Rubric', subtitle: 'Upload prompt & target grade' },
      { step: 'Step 02', title: 'Build Thesis Blueprint', subtitle: 'Section plan & key literature' },
      { step: 'Step 03', title: 'Submit With Confidence', subtitle: 'Verified against every criterion' },
    ],
    primaryCta: 'Book Your Assignment Guidance Session',
    secondaryCta: 'Browse Mentors by Subject',
    tertiaryCta: 'View Sample Feedback',
    illustrationSrc: FINAL_CTA_CUTOUT,
    illustrationAlt: 'Turn Your Next Assignment Brief Into a Clear Plan of Action',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  sampleModal: {
    badge: 'Ethical Socratic Coaching Example',
    title: 'Sample Mentor Developmental Feedback',
    subtitle:
      'Notice how our mentors never rewrite text—instead, they diagnose analytical gaps and guide you toward distinction-level revision.',
    excerptLabel: 'Student Draft Excerpt (Sociology)',
    excerptQuote:
      '"Smith (2022) found that remote work increased employee productivity by 13%. On the other hand, Jones (2023) argued that remote workers experienced higher burnout rates. Therefore, companies should use hybrid policies."',
    feedbackLabel: 'Mentor Margin Feedback (Rubric Criterion: Critical Analysis)',
    diagnosisLabel: 'Diagnosis:',
    diagnosis:
      'Right now, you are summarizing two studies back-to-back (descriptive trap) and jumping straight to a recommendation without explaining why these findings conflict.',
    strategyLabel: 'Revision Strategy:',
    strategy:
      'Ask yourself: Did Smith and Jones measure different industries or timeframes? Add a linking sentence comparing their methodologies before drawing your conclusion.',
    footerNote: '100% written and revised by the student • Full rubric alignment verified',
    ctaLabel: 'Get Feedback on Your Draft',
  },
};

const LIVE_1ON1_TUTORING_CONFIG: EditorialServicePageConfig = {
  id: 'service-1on1',
  hero: {
    badge: 'university-tutors.com • Live Interactive Whiteboard Sessions',
    titleStart: '1-on-1 Live Online Tutoring & ',
    titleAccent: 'Virtual Coaching',
    paragraphs: [
      'Large lecture halls and pre-recorded video playlists move at one fixed pace—leaving critical conceptual gaps unaddressed until midterm week arrives. Whether you are working through multivariable calculus derivations, organic chemistry reaction mechanisms, econometrics proofs, or Python algorithms, our 1-on-1 Live Online Tutoring connects you directly with a verified postgraduate specialist in real time.',
      'Every live session takes place inside an interactive HD video and digital whiteboard workspace tailored to your exact module syllabus, lecture slides, and upcoming exams. Instead of passive memorization, you collaborate step-by-step with a subject-matter mentor who adapts explanations to your learning style, tests your understanding actively, and records key derivations so you can review them confidently before exams.',
    ],
    primaryCta: 'Book Your 1-on-1 Live Tutoring Session',
    secondaryCta: 'Browse Tutors by Subject',
    illustrationSrc: editorial1on1Img,
    illustrationAlt: '1-on-1 Live Online Tutoring and Interactive Whiteboard Illustration',
    illustrationFallback: ASSIGNMENT_HERO_CUTOUT,
    isCutout: false,
  },
  challenges: {
    badge: 'Why Students Fall Behind In Lectures',
    title: 'Why Passive Lectures Rarely Build True Exam Mastery',
    intro:
      'University courses compress complex theoretical models into fast-paced 50-minute lectures. Even dedicated students who attend every class frequently hit bottlenecks when moving from lecture slides to graded problem sets and timed examinations.',
    bullets: [
      {
        title: 'Fast-Paced Lecture Transitions:',
        body: 'Professors often skip intermediate algebraic steps, statistical assumptions, or foundational definitions—leaving a single missed concept to snowball across the rest of the term.',
      },
      {
        title: 'One-Size-Fits-All Office Hours:',
        body: 'Crowded teaching assistant hours leave barely five minutes per student, making it impossible to walk through your personal reasoning or ask follow-up questions freely.',
      },
      {
        title: 'Illusion of Competence From Video Replays:',
        body: 'Watching someone else solve a problem looks clear in the moment, yet students freeze in exams because they never practiced diagnosing problem types independently.',
      },
      {
        title: 'Disconnected Practice Problems:',
        body: 'Generic textbook solutions show final answers without explaining why a specific theorem, formula, or analytical lens was chosen over competing approaches.',
      },
      {
        title: 'Pre-Exam Anxiety & Time Pressure:',
        body: 'Without structured mock walkthroughs and real-time feedback on pacing, students often know the material conceptually but lose marks under timed exam conditions.',
      },
    ],
    summaryHighlight:
      'Live 1-on-1 interactive tutoring replaces passive guesswork with active, syllabus-matched problem solving tailored entirely to your pace.',
    illustrationSrc: CHALLENGES_CUTOUT,
    illustrationAlt: 'Overcoming University Lecture and Concept Gaps Illustration',
    illustrationFallback: editorial1on1Img,
    isCutout: true,
  },
  process: {
    badge: 'Live Whiteboard Workflow',
    title: 'How Our 1-on-1 Live Tutoring Works',
    intro:
      'From sharing your lecture notes to mastering exam-style derivations on a shared digital whiteboard, every live session is engineered for measurable progress from minute one:',
    steps: [
      {
        title: 'Share Your Syllabus, Topics & Target Exam Date',
        body: 'Tell us your course code, current lecture topics, problem areas, and preferred timezone. Upload lecture slides, past exam papers, or practice sheets ahead of your session so zero live minutes are wasted on setup.',
      },
      {
        title: 'Precision Matching With a Subject-Matter Specialist',
        body: 'We match you with a vetted Master’s, PhD, or faculty-experienced tutor whose academic specialty mirrors your exact module—whether STEM, economics, computing, humanities, law, or standardized exams.',
      },
      {
        title: 'Diagnostic Concept Check on the Live Whiteboard',
        body: 'Your tutor opens with a quick diagnostic check to pinpoint exact foundational gaps rather than re-teaching material you already understand, focusing every minute where it raises your grade fastest.',
      },
      {
        title: 'Guided Step-by-Step Problem Solving & Active Recall',
        body: 'Using collaborative LaTeX equations, live code editors, diagrams, and Socratic questioning, you work through authentic exam-grade problems alongside your tutor until you can execute each method independently.',
      },
      {
        title: 'Post-Session Summary, Whiteboard Notes & Revision Plan',
        body: 'After class, receive exported whiteboard notes, targeted practice recommendations, and clear next-session goals so momentum continues smoothly across the week.',
      },
    ],
    illustrationSrc: WORKFLOW_CUTOUT,
    illustrationAlt: '5-Step Live Tutoring Workflow Illustration',
    illustrationFallback: editorial1on1Img,
    isCutout: true,
  },
  formats: {
    badge: 'Interactive Teaching Modes',
    title: 'Live 1-on-1 Coaching Across Every Learning Format',
    intro:
      'Our interactive virtual classroom supports specialized workflows tailored to both quantitative problem solving and seminar-style humanities discussions:',
    items: [
      {
        title: 'Mathematics, Calculus & Linear Algebra Derivations',
        body: 'Real-time whiteboard proofs, integration techniques, differential equations, vector spaces, and multivariable optimization broken down step by step with visual intuition.',
      },
      {
        title: 'Physics, Chemistry & Engineering Problem Sets',
        body: 'Free-body diagrams, thermodynamics cycles, organic synthesis pathways, circuit analysis, and dimensional verification coached methodically from first principles.',
      },
      {
        title: 'Computer Science, Python, R & Data Science Pairing',
        body: 'Live screen-sharing code walkthroughs covering algorithms, data structures, OOP architecture, SQL queries, statistical modeling in R/Python, and systematic debugging skills.',
      },
      {
        title: 'Statistics, Econometrics & Quantitative Finance',
        body: 'Hypothesis testing, ANOVA, regression diagnostics, SPSS/Stata/Excel modeling, corporate valuation, and derivatives pricing explained in clear, intuitive terms.',
      },
      {
        title: 'High-Stakes Exam & Standardized Test Preparation',
        body: 'Structured drills and timing strategies for university midterms, finals, AP/IB exams, GCSE/A-Levels, SAT/ACT, GRE/GMAT, MCAT, and professional licensing tests.',
      },
      {
        title: 'Weekly Concept Consolidation & Lecture Debriefs',
        body: 'Turn confusing weekly lectures into crystal-clear mental models every week so you never accumulate a backlog before finals.',
      },
      {
        title: 'Viva, Oral Exam & Seminar Presentation Coaching',
        body: 'Rehearse academic defenses, case-study Q&A rounds, and seminar critiques live with realistic faculty-style follow-up questioning.',
      },
      {
        title: 'Academic English & Technical Communication Coaching',
        body: 'Build confidence expressing complex disciplinary reasoning clearly during seminars, lab briefings, and live oral assessments.',
      },
    ],
    disciplinesTitle: 'Subject Disciplines We Support',
    disciplinesIntro:
      'Connect with vetted subject-matter tutors across every major university faculty:',
    disciplines: STANDARD_DISCIPLINES,
  },
  comparison: {
    badge: 'Live Mentorship vs. Self-Study',
    title: 'Why 1-on-1 Live Tutoring Outperforms Pre-Recorded Courses',
    intro:
      'Recorded video tutorials and crowded group classes cannot pause to diagnose why a specific step confused you. See how bespoke 1-on-1 coaching accelerates comprehension:',
    leftColumnTitle: 'Pre-Recorded Videos & Group Classes',
    rightColumnTitle: 'Our 1-on-1 Live Online Tutoring',
    rows: [
      {
        dimension: 'Pacing & Adaptation',
        generic: 'Fixed lecture speed regardless of your background or questions',
        ours: 'Real-time pacing adapted dynamically to your exact understanding',
      },
      {
        dimension: 'Syllabus Alignment',
        generic: 'Generic textbook examples that rarely match your professor’s notation',
        ours: 'Built directly around your university syllabus, slides, and past papers',
      },
      {
        dimension: 'Doubt Resolution',
        generic: 'Unanswered questions pile up or rely on slow forum replies',
        ours: 'Immediate live clarification on the interactive whiteboard',
      },
      {
        dimension: 'Active Problem Solving',
        generic: 'Passive watching that fails to build independent exam recall',
        ours: 'Guided live practice where you solve problems with expert feedback',
      },
      {
        dimension: 'Accountability & Momentum',
        generic: 'Easy to procrastinate until the week before finals',
        ours: 'Scheduled weekly milestones with measurable mastery checks',
      },
      {
        dimension: 'Exam Readiness',
        generic: 'Little practice under realistic exam rubric expectations',
        ours: 'Targeted timed drills and grading-scheme walkthroughs',
      },
    ],
  },
  integrity: {
    badge: '100% Ethical Live Instruction',
    title: 'Built on Genuine Mastery & Academic Integrity',
    intro:
      'Real academic confidence comes from being able to walk into any exam hall or seminar room knowing you truly command the material. Our live tutoring strictly focuses on conceptual mastery, worked examples, and independent problem-solving fluency—never taking live exams or completing graded assessments on your behalf.',
    listLead: 'During every 1-on-1 session, our tutors uphold transparent educational coaching:',
    bullets: [
      {
        title: 'First-Principles Teaching:',
        body: 'We explain the underlying logic behind every formula, theorem, or theoretical lens rather than giving rote shortcuts.',
      },
      {
        title: 'Socratic Guided Practice:',
        body: 'Your tutor prompts you to lead each step on the whiteboard so neural pathways for independent exam recall are genuinely built.',
      },
      {
        title: 'Worked Parallel Examples:',
        body: 'When working on graded homework concepts, mentors demonstrate methodology on analogous examples so your final submission is 100% your own work.',
      },
      {
        title: 'Zero Exam Impersonation:',
        body: 'We strictly refuse proctored test assistance or take-home exam completion—ensuring complete compliance with every university honor code.',
      },
    ],
    closingBox:
      'Every grade you earn through our 1-on-1 tutoring reflects your own verified comprehension—building lasting confidence for advanced modules and technical interviews.',
    illustrationSrc: INTEGRITY_CUTOUT,
    illustrationAlt: 'Ethical 1-on-1 Live Tutoring Standards Illustration',
    illustrationFallback: editorial1on1Img,
    isCutout: true,
  },
  audience: {
    badge: 'Designed For Focused Learners',
    title: 'Who Benefits Most From 1-on-1 Live Tutoring?',
    intro:
      'Whether you are catching up after a tough midterm or pushing for top honours, bespoke live sessions adapt to your exact goals:',
    profiles: [
      {
        title: 'STEM & Quantitative Undergraduates:',
        body: 'Mastering calculus, organic chemistry, physics, statistics, econometrics, and computer science modules with live derivations and debugging.',
      },
      {
        title: 'Pre-University & Honours Students (AP, IB, A-Level, ATAR):',
        body: 'Securing top exam grades for competitive university admissions with structured syllabus coverage and past-paper walkthroughs.',
      },
      {
        title: 'Postgraduate & MBA Students:',
        body: 'Bridging quantitative gaps in corporate finance, econometrics, biostatistics, or research methods alongside demanding professional schedules.',
      },
      {
        title: 'Students Recovering From a Difficult Midterm:',
        body: 'Rapidly diagnosing lost marks, rebuilding shaky fundamentals, and executing a clear turnaround plan before final exams.',
      },
      {
        title: 'High Achievers Targeting Distinction & Scholarships:',
        body: 'Refining advanced problem-solving speed, analytical depth, and exam technique to consistently score in the top decile.',
      },
    ],
  },
  packages: {
    badge: 'Flexible Live Session Plans',
    title: 'Choose the Live Tutoring Format That Fits Your Schedule',
    intro:
      'Start with a single targeted breakthrough session or reserve a consistent weekly slot with your dedicated faculty mentor:',
    items: [
      {
        name: 'Single Concept Breakthrough Session (60 Minutes)',
        description:
          'Targeted live whiteboard session to unblock a difficult lecture topic, derivation, statistical model, or coding concept before your next tutorial or quiz.',
        cta: 'Book 60-Min Live Session →',
      },
      {
        name: 'Intensive Exam Prep Sprint (3 × 60-Min Sessions)',
        description:
          'Three focused sessions covering high-weight syllabus topics, timed past-paper drills, common examiner traps, and rapid mark-scheme optimization.',
        cta: 'Schedule Exam Prep Sprint →',
      },
      {
        name: 'Weekly 1-on-1 Module Coaching (Ongoing)',
        description:
          'Consistent weekly live sessions with the same matched specialist—consolidating each week’s lectures, reviewing practice sets, and keeping you ahead of exams.',
        cta: 'Start Weekly Coaching →',
      },
      {
        name: 'Multi-Subject Academic Mentorship Plan',
        description:
          'Coordinated live coaching across two or more demanding university modules with unified exam calendar planning and flexible hour allocation.',
        cta: 'Build Custom Tutoring Plan →',
      },
    ],
  },
  faqs: [
    {
      question: 'How does the interactive live whiteboard work?',
      answer:
        'Sessions run directly in your browser with HD video/audio, screen sharing, collaborative equation and diagram drawing, and file upload support—no complicated downloads required.',
    },
    {
      question: 'Can I choose the same tutor every week?',
      answer:
        'Yes. Once you find a mentor whose teaching style clicks with you, you can reserve recurring weekly time slots with that exact tutor for the entire semester.',
    },
    {
      question: 'What time zones do your 1-on-1 tutors cover?',
      answer:
        'Our verified faculty network spans North America, the UK, Europe, the Middle East, Australia, New Zealand, and Singapore—giving you morning, evening, and weekend availability in any time zone.',
    },
    {
      question: 'Should I send my lecture slides before the live class?',
      answer:
        'Yes! Uploading your syllabus, lecture PDFs, or practice problems when booking lets your tutor prepare targeted explanations so you get maximum value from minute one.',
    },
    {
      question: 'What if I need to reschedule a booked live session?',
      answer:
        'You can reschedule any session flexibly with advance notice directly through your student portal or by coordinating with your mentor.',
    },
    {
      question: 'Do you cover graduate-level and specialized technical subjects?',
      answer:
        'Absolutely. Over 65% of our tutors hold Master’s or PhD degrees and regularly teach advanced statistics, machine learning, econometrics, engineering, law, and medical sciences.',
    },
  ],
  quickEnquiry: {
    eyebrow: 'Instant Tutor Matching',
    replyBadge: 'Live Slots Open',
    title: 'Quick 1-on-1 Tutoring Enquiry',
    subtitle: 'Tell us your module and preferred time slot to get matched with a live specialist.',
    formatLabel: 'Tutoring Focus',
    formatOptions: [
      'Mathematics, Calculus & Statistics',
      'Physics, Chemistry & Engineering',
      'Computer Science, Python & Data Science',
      'Economics, Finance & Accounting',
      'Biology, Nursing & Health Sciences',
      'Humanities, Law & Essay Writing',
      'Exam Prep (AP / IB / A-Level / SAT / GRE)',
    ],
    deadlineLabel: 'Preferred Schedule / Exam Date *',
    deadlinePlaceholder: 'e.g., Tue/Thu evenings or Midterm in 10 days',
    noteLabel: 'Module Name & Key Topics *',
    notePlaceholder: 'Share your course name, current topics, and learning goals...',
    submitLabel: 'Request Live Tutor Match →',
    inquirySubjectPrefix: '1-on-1 Live Tutoring',
  },
  tutorShowcase: {
    badge: 'Verified Live Faculty Mentors',
    title: 'Meet Our Subject-Matter Tutors',
  },
  finalCta: {
    badge: 'Ready For Your Breakthrough Session?',
    title: 'Turn Confusing Lectures Into Lasting Exam Confidence',
    paragraph1:
      'You do not have to spend four frustrating hours deciphering a single lecture slide on your own. In one focused 60-minute live session with the right subject specialist, complex concepts click into place clearly and permanently.',
    paragraph2:
      'Share your module syllabus and target schedule today to connect with a dedicated 1-on-1 live tutor—and walk into your next seminar or exam fully prepared.',
    steps: [
      { step: 'Step 01', title: 'Share Course & Goals', subtitle: 'Upload syllabus & focus topics' },
      { step: 'Step 02', title: 'Meet Live on Whiteboard', subtitle: 'Interactive step-by-step coaching' },
      { step: 'Step 03', title: 'Master Exams Independently', subtitle: 'Exported notes & lasting clarity' },
    ],
    primaryCta: 'Book Your 1-on-1 Live Tutoring Session',
    secondaryCta: 'Browse Tutors by Subject',
    tertiaryCta: 'View Sample Coaching Note',
    illustrationSrc: FINAL_CTA_CUTOUT,
    illustrationAlt: 'Turn Confusing Lectures Into Lasting Exam Confidence',
    illustrationFallback: editorial1on1Img,
    isCutout: true,
  },
  sampleModal: {
    badge: 'Live Whiteboard Coaching Example',
    title: 'Sample 1-on-1 Concept Diagnostic & Walkthrough',
    subtitle:
      'See how our live mentors diagnose root misconceptions and guide you to solve university-level problems independently.',
    excerptLabel: 'Student Question (Econometrics / Statistics)',
    excerptQuote:
      '"My regression shows an R² of 0.89 and a p-value of 0.002 for interest rates, so I wrote that higher interest rates definitely cause GDP growth to drop by 1.4%."',
    feedbackLabel: 'Live Mentor Whiteboard Coaching (Causal Inference Check)',
    diagnosisLabel: 'Conceptual Gap Identified:',
    diagnosis:
      'High R² and a small p-value measure statistical fit and precision within your sample, not causality. Because central banks raise rates during overheating booms, your OLS model likely suffers from reverse causality (endogeneity) and omitted variable bias.',
    strategyLabel: 'Whiteboard Action Plan:',
    strategy:
      'Let’s test for serial correlation together, discuss adding lagged controls or an instrumental variable (2SLS), and rewrite your interpretation in accurate econometric language.',
    footerNote: 'Interactive live derivation • Exportable whiteboard recap included after every class',
    ctaLabel: 'Book Your Live 1-on-1 Session',
  },
};

const COURSEWORK_TRACK_CONFIG: EditorialServicePageConfig = {
  id: 'service-coursework',
  hero: {
    badge: 'university-tutors.com • 14-Week Syllabus-Mapped Mentorship',
    titleStart: 'Semester-Long Coursework Track & ',
    titleAccent: 'Milestone Mentorship',
    paragraphs: [
      'A university semester is a marathon of overlapping labs, seminar readings, graded coursework checkpoints, and cumulative exams—not a series of isolated overnight sprints. When continuous assessment accounts for 40% to 70% of your final module mark, falling behind in Week 4 quietly erodes your entire GPA before finals even begin.',
      'Our Semester-Long Coursework Track pairs you with a dedicated subject-matter mentor from syllabus release through final assessment. Together, we map your entire 10-to-14-week term into calm, predictable weekly milestones—combining proactive lecture debriefs, early coursework outlining, continuous rubric audits, and steady exam revision so you stay consistently ahead of every deadline.',
    ],
    primaryCta: 'Start Your Semester Coursework Track',
    secondaryCta: 'Browse Mentors by Subject',
    illustrationSrc: editorialCourseworkImg,
    illustrationAlt: '14-Week Semester Coursework Track & Milestone Mentorship Illustration',
    illustrationFallback: WORKFLOW_CUTOUT,
    isCutout: false,
  },
  challenges: {
    badge: 'Why Semesters Spiral Out of Control',
    title: 'Why Continuous Coursework Demands a Structured System',
    intro:
      'Most students do not struggle during Week 1—they struggle during Weeks 8 through 12, when three graded coursework deadlines collide simultaneously with midterm preparation.',
    bullets: [
      {
        title: 'Compounding Syllabus Debt:',
        body: 'Missing a single foundational module in Week 3 makes Weeks 5–9 feel incomprehensible, turning manageable coursework into high-stress catch-up sessions.',
      },
      {
        title: 'Clustered Deadline Collisions:',
        body: 'Without reverse-engineering every rubric from day one, multiple 3,000-word reports, lab submissions, and quizzes routinely land in the exact same 72-hour window.',
      },
      {
        title: 'Unchecked Rubric Drift:',
        body: 'Working in isolation for weeks without periodic feedback often leads to drafts that miss core learning outcomes or stray from disciplinary expectations.',
      },
      {
        title: 'Disconnected Module Notes:',
        body: 'Scattered lecture slides, PDF readings, and lab sheets make final exam synthesis exhausting unless concepts are consolidated steadily week by week.',
      },
      {
        title: 'Burnout & Inconsistent Study Rhythm:',
        body: 'Alternating between quiet early weeks and panicked all-nighters undermines both analytical quality and overall wellbeing.',
      },
    ],
    summaryHighlight:
      'Our Coursework Track converts reactive deadline scrambling into a calm, milestone-driven semester rhythm guided by one consistent academic mentor.',
    illustrationSrc: CHALLENGES_CUTOUT,
    illustrationAlt: 'Solving Semester Coursework Bottlenecks Illustration',
    illustrationFallback: editorialCourseworkImg,
    isCutout: true,
  },
  process: {
    badge: '14-Week Roadmap Architecture',
    title: 'How Our Semester Coursework Track Works',
    intro:
      'We build your personalized term roadmap around your exact university module handbook and assessment weighting:',
    steps: [
      {
        title: 'Syllabus Audit & Assessment Weighting Map (Week 1)',
        body: 'Upload your module handbook, reading list, and assessment dates. Your mentor maps every weighted deliverable—labs, essays, problem sets, quizzes, and finals—into a clear week-by-week timeline.',
      },
      {
        title: 'Dedicated Mentor Continuity All Term',
        body: 'Work with the same vetted subject specialist throughout the semester so your mentor knows your strengths, target grade classification, professor’s feedback style, and prior coursework performance.',
      },
      {
        title: 'Weekly Concept & Coursework Check-Ins',
        body: 'Meet weekly to resolve lecture confusion immediately, unpack upcoming assignment briefs two weeks early, and stay ahead of seminar readings and quantitative labs.',
      },
      {
        title: 'Pre-Submission Rubric Audits on Every Deliverable',
        body: 'Before each graded milestone is due, submit your draft or problem walkthrough for structured developmental feedback—catching analytical gaps, weak citations, or formatting errors early.',
      },
      {
        title: 'Cumulative Exam Synthesis & Final Readiness (Weeks 12–14)',
        body: 'Transition seamlessly from coursework completion into high-yield exam revision using your consolidated weekly summaries and targeted past-paper coaching.',
      },
    ],
    illustrationSrc: WORKFLOW_CUTOUT,
    illustrationAlt: 'How Semester Coursework Mentorship Works Illustration',
    illustrationFallback: editorialCourseworkImg,
    isCutout: true,
  },
  formats: {
    badge: 'Full-Term Coverage',
    title: 'Continuous Support Across Every Semester Deliverable',
    intro:
      'Your Coursework Track flexes week by week to match whatever assessment is highest priority on your syllabus:',
    items: [
      {
        title: 'Weekly Problem Sets & Quantitative Tutorials',
        body: 'Stay consistently on top of calculus, physics, chemistry, accounting, and econometrics homework sets with guided walkthroughs before tutorial deadlines.',
      },
      {
        title: 'Staged Research Projects & Term Papers',
        body: 'Break major 4,000–8,000-word projects into stress-free stages: topic approval, annotated bibliography, outline blueprint, body draft review, and final rubric verification.',
      },
      {
        title: 'Ongoing Lab Reports & Practical Portfolios',
        body: 'Maintain consistent scientific precision across bi-weekly IMRaD lab submissions, error analysis calculations, and data visualization standards.',
      },
      {
        title: 'Dissertation & Capstone Proposal Milestones',
        body: 'Structured bi-weekly supervision support for undergraduate theses, honours projects, and MBA capstones—from literature gap framing to methodology defense.',
      },
      {
        title: 'Programming Labs & Semester Software Projects',
        body: 'Steady architectural guidance, git/testing habits, and algorithmic debugging across multi-sprint computer science and data analytics coursework.',
      },
      {
        title: 'Clinical, Nursing & Education Reflective Logs',
        body: 'Keep placement journals, competency portfolios, and evidence-based practice logs organized and theory-linked throughout busy clinical rotations.',
      },
      {
        title: 'Midterm & Continuous Assessment Prep',
        body: 'Built-in revision checkpoints two weeks prior to every quiz, practical test, and midterm exam so revision never starts from zero.',
      },
      {
        title: 'Post-Grade Feedback Integration',
        body: 'Review returned lecturer comments together with your mentor to turn early semester feedback directly into higher marks on subsequent submissions.',
      },
    ],
    disciplinesTitle: 'Subject Disciplines We Support',
    disciplinesIntro:
      'Dedicated semester mentors available across every undergraduate and postgraduate faculty:',
    disciplines: STANDARD_DISCIPLINES,
  },
  comparison: {
    badge: 'Proactive Track vs. Last-Minute Help',
    title: 'Why Semester-Long Mentorship Outperforms Last-Minute Cramming',
    intro:
      'One-off panic sessions the night before a deadline can only triage surface issues. Ongoing milestone mentorship transforms your entire semester trajectory:',
    leftColumnTitle: 'Ad-Hoc Last-Minute Cramming',
    rightColumnTitle: 'Our Semester Coursework Track',
    rows: [
      {
        dimension: 'Mentor Familiarity',
        generic: 'Explaining your course context from scratch to a new tutor every time',
        ours: 'One dedicated mentor who knows your syllabus, style, and grade targets',
      },
      {
        dimension: 'Deadline Stress',
        generic: 'Rushed all-nighters whenever multiple modules collide',
        ours: 'Calm, reverse-engineered milestones completed days ahead of due dates',
      },
      {
        dimension: 'Feedback Integration',
        generic: 'Repeating the same rubric mistakes from assignment to assignment',
        ours: 'Systematic tracking of lecturer feedback so every submission scores higher',
      },
      {
        dimension: 'Exam Preparation',
        generic: 'Re-learning 12 weeks of forgotten material in 4 days',
        ours: 'Continuous weekly consolidation ready for high-yield final revision',
      },
      {
        dimension: 'Skill Compounding',
        generic: 'Short-term patches with minimal long-term academic growth',
        ours: 'Lasting mastery of research, analysis, and independent study systems',
      },
      {
        dimension: 'Grade Trajectory',
        generic: 'Unpredictable swings between modules and assessments',
        ours: 'Consistent, transparent progress toward First-Class / Dean’s List targets',
      },
    ],
  },
  integrity: {
    badge: '100% Honor-Code Compliant',
    title: 'Structured Mentorship Built on Authentic Academic Growth',
    intro:
      'Our Semester Coursework Track mirrors the gold-standard Oxbridge tutorial model—providing structured intellectual accountability, guided methodology coaching, and developmental critique while every piece of submitted coursework remains 100% authored by you.',
    listLead: 'Across every week of your track, your mentor focuses strictly on ethical coaching:',
    bullets: [
      {
        title: 'Transparent Milestone Planning:',
        body: 'Helping you schedule independent reading, drafting, and problem-solving blocks realistically around classes and work.',
      },
      {
        title: 'Formative Draft Critique:',
        body: 'Delivering rubric-mapped diagnostic feedback on your drafts so you sharpen your own analytical voice.',
      },
      {
        title: 'Conceptual Mastery Verification:',
        body: 'Using regular Socratic check-ins to confirm you can explain every equation, chart, and claim in your work.',
      },
      {
        title: 'Zero Ghostwriting Policy:',
        body: 'We never write coursework, complete online quizzes, or supply submission-ready papers—protecting your academic standing 100%.',
      },
    ],
    closingBox:
      'By the end of the term, you finish not only with stronger module grades, but with a repeatable academic workflow you can apply to every future semester.',
    illustrationSrc: INTEGRITY_CUTOUT,
    illustrationAlt: 'Ethical Semester Mentorship Framework Illustration',
    illustrationFallback: editorialCourseworkImg,
    isCutout: true,
  },
  audience: {
    badge: 'Ideal For Full-Term Focus',
    title: 'Who Benefits Most From a Semester Coursework Track?',
    intro:
      'Continuous weekly mentorship is especially transformative for students navigating pivotal academic terms:',
    profiles: [
      {
        title: 'Students Taking High-Difficulty Core Modules:',
        body: 'Conquering notorious "gateway" courses like Organic Chemistry, Real Analysis, Econometrics, Anatomy, or Algorithms with steady weekly guidance.',
      },
      {
        title: 'Final-Year & Dissertation Candidates:',
        body: 'Keeping thesis chapters, empirical data collection, and supervisor meetings strictly on schedule from proposal to final defense.',
      },
      {
        title: 'Working Professionals & Part-Time Postgraduates:',
        body: 'Balancing MBA, MSc, or conversion degree coursework alongside a full-time career through structured, high-efficiency weekly coaching.',
      },
      {
        title: 'GPA Turnaround & Probation Recovery Students:',
        body: 'Rebuilding study habits, assignment accountability, and exam technique systematically across an entire term.',
      },
      {
        title: 'Scholarship & Honours Track Students:',
        body: 'Protecting Dean’s List, First-Class Honours, or competitive medical/law school admission averages across every weighted component.',
      },
    ],
  },
  packages: {
    badge: 'Flexible Term Plans',
    title: 'Coursework Track Packages Built Around Your Term Length',
    intro:
      'Enroll at the beginning of term or join mid-semester with a custom catch-up and completion roadmap:',
    items: [
      {
        name: 'Half-Term Sprint Track (6 Weeks)',
        description:
          'Ideal for mid-semester catch-up, intensive summer modules, or navigating the critical second half of term through final exams.',
        cta: 'Start 6-Week Track →',
      },
      {
        name: 'Full Single-Module Semester Track (12–14 Weeks)',
        description:
          'Weekly 1-on-1 coaching, pre-submission rubric reviews, and final exam prep for one demanding core university module.',
        cta: 'Enroll Single-Module Track →',
      },
      {
        name: 'Dissertation & Capstone Milestone Track',
        description:
          'Bi-weekly specialist supervision covering proposal approval, literature synthesis, methodology checks, chapter feedback, and defense preparation.',
        cta: 'Plan Dissertation Track →',
      },
      {
        name: 'Multi-Module Dean’s List Mentorship',
        description:
          'Comprehensive semester coordination across 2–3 key modules with unified deadline calendar management and priority mentor access.',
        cta: 'Build Multi-Module Plan →',
      },
    ],
  },
  faqs: [
    {
      question: 'Can I join a Coursework Track if my semester has already started?',
      answer:
        'Yes! Many students join in Weeks 4–8. Your mentor begins with a rapid catch-up audit of remaining weighted assessments and builds a realistic schedule for the rest of the term.',
    },
    {
      question: 'Will I work with the same mentor throughout the entire term?',
      answer:
        'Yes—continuity is the heart of the Coursework Track. You are paired with one dedicated subject mentor for the full track, with complimentary rematching if you ever want a change.',
    },
    {
      question: 'Can we combine live sessions and asynchronous draft feedback?',
      answer:
        'Absolutely. Most students blend weekly 60-minute live coaching sessions with asynchronous annotated rubric checks ahead of major written submissions.',
    },
    {
      question: 'How do you track progress across the 14 weeks?',
      answer:
        'You and your mentor maintain a shared milestone checklist aligned to your university module handbook—tracking completed topics, draft review dates, and revision priorities.',
    },
    {
      question: 'What if my course schedule shifts or an extension is granted?',
      answer:
        'Your milestone schedule adapts effortlessly. Simply notify your mentor and we rebalance your coaching hours around the updated submission calendar.',
    },
    {
      question: 'Does this cover both STEM problem-set modules and essay-based courses?',
      answer:
        'Yes. We tailor the track structure to your faculty—whether weekly quantitative labs and coding sprints, or staged essays, literature reviews, and seminar portfolios.',
    },
  ],
  quickEnquiry: {
    eyebrow: 'Term Roadmap Match',
    replyBadge: 'Custom Plan',
    title: 'Quick Coursework Track Enquiry',
    subtitle: 'Share your module syllabus and term dates to receive a tailored weekly mentorship plan.',
    formatLabel: 'Coursework Track Type',
    formatOptions: [
      'Full Semester Module Track (12–14 Weeks)',
      'Half-Term Catch-Up & Exam Track (6 Weeks)',
      'Dissertation / Capstone Milestone Track',
      'STEM Lab & Weekly Problem-Set Track',
      'Multi-Module GPA Support Plan',
    ],
    deadlineLabel: 'Semester / Exam Window *',
    deadlinePlaceholder: 'e.g., Fall Term (Weeks 1–14) / Finals in Dec',
    noteLabel: 'Module Name & Weighted Assessments *',
    notePlaceholder: 'List your module(s), key coursework weights, and target grade...',
    submitLabel: 'Request Coursework Roadmap →',
    inquirySubjectPrefix: 'Coursework Track',
  },
  tutorShowcase: {
    badge: 'Dedicated Semester Mentors',
    title: 'Meet Our Subject-Matter Tutors',
  },
  finalCta: {
    badge: 'Take Control Of Your Entire Term',
    title: 'Replace Semester Stress With a Calm, Milestone-Driven Plan',
    paragraph1:
      'Consistent top grades rarely come from heroic midnight cramming—they come from steady weekly clarity, early draft feedback, and an experienced mentor keeping every milestone aligned with your rubric.',
    paragraph2:
      'Share your module syllabus today to get matched with a dedicated semester mentor and build your personalized week-by-week Coursework Track.',
    steps: [
      { step: 'Step 01', title: 'Map Your Syllabus', subtitle: 'Plot every weighted deadline' },
      { step: 'Step 02', title: 'Weekly Mentor Rhythm', subtitle: 'Live coaching + draft checks' },
      { step: 'Step 03', title: 'Peak Final Readiness', subtitle: 'Consistent marks all semester' },
    ],
    primaryCta: 'Start Your Semester Coursework Track',
    secondaryCta: 'Browse Mentors by Subject',
    tertiaryCta: 'View Sample Milestone Plan',
    illustrationSrc: FINAL_CTA_CUTOUT,
    illustrationAlt: 'Replace Semester Stress With a Calm Milestone Plan',
    illustrationFallback: editorialCourseworkImg,
    isCutout: true,
  },
  sampleModal: {
    badge: 'Semester Track Roadmap Example',
    title: 'Sample Coursework Milestone Audit & Feedback',
    subtitle:
      'See how a Coursework Track mentor structures multi-week deliverables so you stay ahead of every rubric checkpoint.',
    excerptLabel: 'Week 5 Checkpoint — Module: Corporate Finance (40% Coursework + 60% Final)',
    excerptQuote:
      '"My 3,500-word DCF valuation report is due in Week 9, and I also have a Week 7 quantitative quiz on WACC and capital structure."',
    feedbackLabel: 'Mentor Milestone Plan (Weeks 5–9)',
    diagnosisLabel: 'Schedule Risk Diagnosed:',
    diagnosis:
      'Leaving company financial statement extraction until Week 8 will collide directly with your other midterms and leave zero buffer for sensitivity analysis verification.',
    strategyLabel: 'Actionable Milestone Sequence:',
    strategy:
      'Week 5: Lock target company + 5-year financials. Week 6: Live WACC quiz prep + beta calculation check. Week 7: Draft DCF model audit. Week 8: Developmental rubric review of narrative report—ready to submit 48 hours early.',
    footerNote: 'Structured accountability • 100% student-authored work across every milestone',
    ctaLabel: 'Build Your Semester Roadmap',
  },
};

const ESSAY_RHETORIC_CONFIG: EditorialServicePageConfig = {
  id: 'service-essay',
  hero: {
    badge: 'university-tutors.com • Academic Rhetoric & Citation Precision',
    titleStart: 'Essay Rhetoric, Structure & ',
    titleAccent: 'Reference Checks',
    paragraphs: [
      'Even brilliant research loses a full grade band when buried under vague thesis claims, uneven paragraph transitions, informal phrasing, or inconsistent referencing. University markers evaluate not only what you know, but how persuasively, rigorously, and accurately you communicate scholarly arguments on the page.',
      'Our Essay Rhetoric & Reference Checks mentorship pairs you with experienced academic editors and subject specialists who diagnose structural weaknesses, sharpen your argumentative logic, and verify mechanical precision across APA (7th ed.), Harvard, MLA (9th ed.), Chicago/Turabian, IEEE, Vancouver, and OSCOLA—teaching you how to elevate every draft into crisp, publication-grade academic prose.',
    ],
    primaryCta: 'Book Your Essay & Reference Check',
    secondaryCta: 'Browse Writing Mentors',
    illustrationSrc: editorialEssayImg,
    illustrationAlt: 'Essay Rhetoric, Thesis Structure and Citation Verification Illustration',
    illustrationFallback: ASSIGNMENT_HERO_CUTOUT,
    isCutout: false,
  },
  challenges: {
    badge: 'Why Strong Ideas Lose Easy Marks',
    title: 'Why Academic Essays Fall Short of Distinction Marks',
    intro:
      'Lecturers frequently write comments like "too descriptive," "argument lacks cohesion," or "referencing inconsistent"—yet rarely have time to show you sentence-by-sentence how to fix those habits.',
    bullets: [
      {
        title: 'Broad or Descriptive Thesis Statements:',
        body: 'Announcing a topic ("This essay will discuss climate policy") rather than advancing an arguable, analytical claim caps an essay in the middle grade bands from paragraph one.',
      },
      {
        title: 'Disconnected Paragraphs & Weak Signposting:',
        body: 'Jumping between sources without clear topic sentences, analytical linking clauses, and logical progression forces the marker to guess how your evidence supports your thesis.',
      },
      {
        title: 'Uncritical Quote Dumping:',
        body: 'Inserting long block quotes without framing, unpacking, or contrasting scholarly perspectives signals surface reading rather than independent synthesis.',
      },
      {
        title: 'Citation & Bibliography Formatting Errors:',
        body: 'Mismatched in-text citations, missing DOIs, incorrect italicization, or mixed referencing rules silently cost 5%–15% of total marks and risk accidental plagiarism flags.',
      },
      {
        title: 'Academic Register & Conciseness Issues:',
        body: 'Wordy filler, casual idioms, passive ambiguity, or second-language phrasing hurdles can obscure otherwise insightful disciplinary reasoning.',
      },
    ],
    summaryHighlight:
      'Our Essay Rhetoric & Reference Checks service transforms rough drafts into cohesive, rigorously cited arguments through clear diagnostic coaching.',
    illustrationSrc: CHALLENGES_CUTOUT,
    illustrationAlt: 'Overcoming Academic Essay Structure and Citation Issues Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  process: {
    badge: 'Diagnostic Editorial Workflow',
    title: 'How Our Essay & Reference Check Process Works',
    intro:
      'Every review pairs macro-level argumentative analysis with micro-level academic style and citation accuracy checks:',
    steps: [
      {
        title: 'Submit Your Draft, Prompt & Required Citation Style',
        body: 'Upload your essay draft, assignment brief, grading rubric, and required referencing guide (APA 7th, Harvard, MLA 9th, Chicago, IEEE, OSCOLA, or institutional handbook).',
      },
      {
        title: 'Disciplinary Writing Mentor Assignment',
        body: 'We pair your manuscript with an academic writing mentor familiar with your discipline’s rhetorical conventions—from humanities close reading and legal IRAC analysis to empirical social science prose.',
      },
      {
        title: 'Thesis, Structure & Argument Flow Audit',
        body: 'Your mentor maps your argument paragraph by paragraph—flagging logical leaps, repetitive points, unsupported claims, and opportunities to integrate stronger counterarguments.',
      },
      {
        title: 'Comprehensive Citation & Reference Cross-Check',
        body: 'We cross-verify every in-text citation against your reference list, flagging missing entries, formatting discrepancies, secondary citation errors, and punctuation inconsistencies.',
      },
      {
        title: 'Annotated Margin Feedback & Actionable Revision Guide',
        body: 'Receive crystal-clear developmental margin comments, illustrative before/after examples on sample sentences, and a prioritized self-editing checklist so you finalize your submission with complete confidence.',
      },
    ],
    illustrationSrc: WORKFLOW_CUTOUT,
    illustrationAlt: 'Essay Review and Citation Verification Workflow Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  formats: {
    badge: 'Writing & Referencing Specialties',
    title: 'Comprehensive Essay Coaching & Citation Style Coverage',
    intro:
      'Whether you are polishing a 1,500-word seminar paper, a graduate Statement of Purpose, or a 10,000-word thesis chapter, our mentors cover every rhetorical and formatting standard:',
    items: [
      {
        title: 'Argumentative & Persuasive Essays',
        body: 'Strengthening thesis specificity, structuring Claim-Evidence-Analysis paragraphs, anticipating counter-evidence, and building authoritative conclusions.',
      },
      {
        title: 'Critical Literature Reviews & Thematic Synthesis',
        body: 'Moving beyond chronological source summaries to organize debates around theoretical tensions, methodological strengths, and research gaps.',
      },
      {
        title: 'APA (7th Edition) Precision Audits',
        body: 'Complete alignment for psychology, nursing, education, and business papers—covering headings, et al. rules, DOIs, statistical reporting, tables, and running heads.',
      },
      {
        title: 'Harvard & Institutional Variant Referencing',
        body: 'Consistent author-date formatting adapted to UK, Australian, Irish, and university-specific Cite Them Right Harvard handbooks.',
      },
      {
        title: 'MLA (9th Ed.) & Chicago / Turabian Notes-Bibliography',
        body: 'Accurate humanities footnote formatting, ibid./shortened notes, primary archival citations, and Works Cited / Bibliography indentation.',
      },
      {
        title: 'OSCOLA Legal & IEEE / Vancouver Technical Citations',
        body: 'Precision checking for UK/Irish law footnotes, case law and statutory pinpoint references, plus numbered engineering and biomedical citation sequences.',
      },
      {
        title: 'Personal Statements, SOPs & Scholarship Essays',
        body: 'Sharpening narrative arc, intellectual fit, and academic voice for Master’s, PhD, law school, medical school, and competitive fellowship applications.',
      },
      {
        title: 'Multilingual & ESL Academic Register Coaching',
        body: 'Targeted guidance on scholarly tone, cohesive linking devices, precise hedging verbs, and natural academic phrasing without erasing your authentic voice.',
      },
    ],
    disciplinesTitle: 'Subject Disciplines We Support',
    disciplinesIntro:
      'Academic writing mentors across every faculty and referencing convention:',
    disciplines: STANDARD_DISCIPLINES,
  },
  comparison: {
    badge: 'Human Editorial Coaching vs. Automated Checkers',
    title: 'Why Academic Writing Mentorship Beats Automated Grammar Apps',
    intro:
      'Automated spellcheckers and citation generators frequently hallucinate italics, flatten nuanced academic voice, and fail completely at evaluating argument strength:',
    leftColumnTitle: 'Automated Grammar Apps & Citation Generators',
    rightColumnTitle: 'Our Essay Rhetoric & Reference Coaching',
    rows: [
      {
        dimension: 'Thesis & Argument Logic',
        generic: 'Cannot judge whether your thesis actually answers the prompt',
        ours: 'Evaluates argumentative coherence, counterarguments, and critical depth',
      },
      {
        dimension: 'Paragraph Flow & Cohesion',
        generic: 'Checks isolated sentences out of context',
        ours: 'Audits macro-structure, topic sentences, and conceptual signposting',
      },
      {
        dimension: 'Citation Accuracy',
        generic: 'Generators frequently produce wrong capitalization, dates, or punctuation',
        ours: 'Line-by-line verification against official APA, Harvard, MLA, Chicago, IEEE, OSCOLA manuals',
      },
      {
        dimension: 'Disciplinary Voice',
        generic: 'Replaces technical terminology with overly casual synonyms',
        ours: 'Preserves field-specific precision and scholarly academic register',
      },
      {
        dimension: 'AI & Integrity Safety',
        generic: 'Automated rewriters risk triggering university AI-authorship flags',
        ours: 'Diagnostic margin guidance ensuring 100% authentic student authorship',
      },
      {
        dimension: 'Writing Skill Growth',
        generic: 'One-click fixes that never teach you why an error occurred',
        ours: 'Clear explanations and self-editing patterns you carry into future papers',
      },
    ],
  },
  integrity: {
    badge: '100% Student-Authored Prose',
    title: 'Ethical Editorial Coaching Without Ghostwriting',
    intro:
      'Universities strictly distinguish between ethical academic writing feedback and unauthorized ghostwriting. Our mentors strictly provide developmental critique, structural diagnosis, and mechanical citation checks—never rewriting your essays or generating new paragraphs on your behalf.',
    listLead: 'Every Essay & Reference Check adheres to transparent university proofreading and coaching guidelines:',
    bullets: [
      {
        title: 'Diagnostic Margin Commentary:',
        body: 'Explaining exactly where an argument needs deeper evidence or clearer linking so you perform the substantive revision.',
      },
      {
        title: 'Illustrative Technique Examples:',
        body: 'Demonstrating concise academic phrasing or proper citation syntax on a single sample sentence so you apply the rule consistently across your draft.',
      },
      {
        title: 'Mechanical Referencing Verification:',
        body: 'Flagging mismatched in-text citations, missing reference list entries, and style-guide formatting discrepancies cleanly.',
      },
      {
        title: 'Zero AI-Rewritten Text:',
        body: 'Your authentic voice, reasoning, and wording remain 100% intact—eliminating integrity and AI-detection concerns.',
      },
    ],
    closingBox:
      'You submit a sharper, cleaner, accurately cited manuscript that remains 100% authentically written and owned by you.',
    illustrationSrc: INTEGRITY_CUTOUT,
    illustrationAlt: 'Ethical Academic Writing and Reference Checking Illustration',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  audience: {
    badge: 'Crafted For Clear Thinkers',
    title: 'Who Benefits Most From Essay Rhetoric & Reference Checks?',
    intro:
      'Structured writing and referencing mentorship supports students across every degree level:',
    profiles: [
      {
        title: 'Essay-Intensive Humanities & Social Science Students:',
        body: 'Elevating analytical precision, primary-source critique, and nuanced thesis framing in history, politics, sociology, law, and literature.',
      },
      {
        title: 'International & Multilingual Scholars:',
        body: 'Mastering formal English academic register, cautious hedging language, and smooth paragraph cohesion without losing disciplinary sophistication.',
      },
      {
        title: 'Postgraduate & Dissertation Writers:',
        body: 'Ensuring multi-chapter structural consistency, flawless cross-referenced bibliographies, and journal-grade clarity before submission.',
      },
      {
        title: 'STEM & Healthcare Writers Adapting to New Styles:',
        body: 'Navigating strict APA 7th, Vancouver, or IEEE conventions alongside clear discussion-section argumentation.',
      },
      {
        title: 'University & Scholarship Applicants:',
        body: 'Refining Statements of Purpose, research proposals, and personal statements so admissions committees see a clear, compelling intellectual narrative.',
      },
    ],
  },
  packages: {
    badge: 'Editorial Review Options',
    title: 'Flexible Writing & Referencing Packages',
    intro:
      'Choose the exact level of structural critique, citation auditing, or live coaching your draft needs:',
    items: [
      {
        name: 'Citation & Reference List Precision Audit',
        description:
          'Complete cross-check of in-text citations, bibliography formatting, punctuation, DOIs, and style-guide compliance (APA, Harvard, MLA, Chicago, IEEE, OSCOLA).',
        cta: 'Book Reference Audit →',
      },
      {
        name: 'Full Essay Rhetoric & Structure Review (Asynchronous)',
        description:
          'Detailed margin commentary evaluating thesis strength, paragraph flow, critical depth, academic register, and rubric alignment—plus a prioritized revision roadmap.',
        cta: 'Request Essay Review →',
      },
      {
        name: 'Live 60-Minute Writing & Revision Workshop',
        description:
          'Walk through your draft live with an academic writing mentor to tighten your thesis, resolve structural knots, and polish key sections together.',
        cta: 'Schedule Writing Workshop →',
      },
      {
        name: 'Thesis Chapter & Statement of Purpose Mentorship',
        description:
          'Multi-round developmental feedback for high-stakes dissertations, capstone reports, or competitive graduate admissions essays.',
        cta: 'Start Chapter Mentorship →',
      },
    ],
  },
  faqs: [
    {
      question: 'Which citation styles do your reference checks cover?',
      answer:
        'We cover APA (7th ed.), Harvard (including Cite Them Right and university-specific variants), MLA (9th ed.), Chicago/Turabian, IEEE, Vancouver, MHRA, and OSCOLA legal referencing.',
    },
    {
      question: 'How fast can I receive annotated feedback on my essay draft?',
      answer:
        'Standard asynchronous essay and reference reviews are returned within 24 hours, with expedited same-day turnaround available for urgent submission windows.',
    },
    {
      question: 'Will you rewrite my essay or change my ideas?',
      answer:
        'Never. In full compliance with university academic integrity policies, we diagnose weaknesses, mark citation errors, and guide you with clear revision strategies so every word remains authentically yours.',
    },
    {
      question: 'Can you help if my draft is over the word limit?',
      answer:
        'Yes! Our mentors highlight redundant phrases, tangential paragraphs, and repetitive source summaries so you can trim 10%–25% of excess words while actually strengthening your analytical depth.',
    },
    {
      question: 'Do you check whether every in-text citation appears in the reference list?',
      answer:
        'Yes—every Reference Check includes a two-way cross-audit catching orphaned bibliography items, missing reference entries, mismatched publication years, and author spelling discrepancies.',
    },
    {
      question: 'Can I book a live follow-up call after receiving written margin comments?',
      answer:
        'Yes. You can pair any asynchronous review with a 30- or 60-minute live coaching call to walk through your mentor’s notes and plan your final revision pass.',
    },
  ],
  quickEnquiry: {
    eyebrow: 'Fast Editorial Match',
    replyBadge: '24 hr review',
    title: 'Quick Essay & Reference Enquiry',
    subtitle: 'Share your essay topic, word count, and citation style for a rapid writing mentor match.',
    formatLabel: 'Citation Style / Review Focus',
    formatOptions: [
      'Full Essay Rhetoric + APA 7th Reference Check',
      'Full Essay Rhetoric + Harvard Reference Check',
      'MLA 9th / Chicago / Turabian Review',
      'OSCOLA Law / IEEE / Vancouver Check',
      'Dissertation Chapter Structural Audit',
      'Statement of Purpose / Admissions Essay',
    ],
    deadlineLabel: 'Submission Deadline *',
    deadlinePlaceholder: 'e.g., In 3 days / Next Monday',
    noteLabel: 'Word Count, Subject & Key Concerns *',
    notePlaceholder: 'e.g., 2,500-word Sociology essay, need help tightening thesis & APA citations...',
    submitLabel: 'Send Writing Enquiry →',
    inquirySubjectPrefix: 'Essay & Reference Checks',
  },
  tutorShowcase: {
    badge: 'Academic Writing & Citation Specialists',
    title: 'Meet Our Subject-Matter Tutors',
  },
  finalCta: {
    badge: 'Submit Publication-Grade Writing',
    title: 'Polish Your Argument, Tighten Your Prose & Perfect Every Citation',
    paragraph1:
      'Do not leave easy marks on the table because of a vague thesis statement, uneven paragraph transitions, or inconsistent bibliography formatting. A focused review from a disciplinary writing mentor reveals exactly how markers read your draft.',
    paragraph2:
      'Upload your draft and citation guide today to receive clear, honor-code compliant editorial feedback—and submit your cleanest academic work yet.',
    steps: [
      { step: 'Step 01', title: 'Upload Draft & Style Guide', subtitle: 'Share rubric & citation format' },
      { step: 'Step 02', title: 'Rhetoric & Citation Audit', subtitle: 'Margin notes + cross-check' },
      { step: 'Step 03', title: 'Revise With Precision', subtitle: 'Submit crisp, cited prose' },
    ],
    primaryCta: 'Book Your Essay & Reference Check',
    secondaryCta: 'Browse Writing Mentors',
    tertiaryCta: 'View Sample Margin Audit',
    illustrationSrc: FINAL_CTA_CUTOUT,
    illustrationAlt: 'Polish Your Argument and Perfect Every Citation',
    illustrationFallback: editorialEssayImg,
    isCutout: true,
  },
  sampleModal: {
    badge: 'Rhetoric & Citation Audit Example',
    title: 'Sample Essay Margin & Referencing Check',
    subtitle:
      'See how our writing mentors catch both analytical phrasing gaps and mechanical citation errors without rewriting your work.',
    excerptLabel: 'Student Paragraph Excerpt (Business Ethics — APA 7th)',
    excerptQuote:
      '"According to (Freeman, 2010), stakeholder theory is really good because companies care about everyone. Also, Friedman (1970) says profit matters most. So modern firms should balance both."',
    feedbackLabel: 'Mentor Rhetoric & APA 7th Diagnostic',
    diagnosisLabel: 'Rhetoric & Citation Issues Found:',
    diagnosis:
      '1) Citation syntax: Narrative citations place only the year in parentheses — Freeman (2010), not (Freeman, 2010). 2) Register: "really good" and "everyone" are conversational; specify concrete stakeholder groups. 3) Synthesis: Explain the normative tension between fiduciary duty and stakeholder value before proposing balance.',
    strategyLabel: 'Revision Roadmap:',
    strategy:
      'Contrast Freeman’s multi-constituency accountability directly against Friedman’s shareholder primacy premise, specify which governance mechanism reconciles them, and verify Freeman (2010) includes publisher details in your APA 7th reference list.',
    footerNote: '100% student-authored revision • Full APA/Harvard/MLA/OSCOLA compliance',
    ctaLabel: 'Book Your Essay Review',
  },
};

export function getDedicatedServiceEditorialConfig(
  serviceId: DedicatedServiceId
): EditorialServicePageConfig {
  switch (serviceId) {
    case '1on1':
      return LIVE_1ON1_TUTORING_CONFIG;
    case 'coursework':
      return COURSEWORK_TRACK_CONFIG;
    case 'essay':
      return ESSAY_RHETORIC_CONFIG;
    case 'assignment':
    default:
      return ASSIGNMENT_GUIDANCE_CONFIG;
  }
}

// ============================================================================
// 2. COUNTRY-SPECIFIC ONLINE TUTORING HUBS (/online-tutoring-*)
// ============================================================================

interface CountryAcademicProfile {
  countryCodeUpper: string;
  fullName: string;
  demonym: string;
  universities: string;
  referencingStyles: string;
  gradingLanguage: string;
  timezoneNote: string;
  sampleExcerptLabel: string;
  sampleExcerpt: string;
  sampleDiagnosis: string;
  sampleStrategy: string;
}

const COUNTRY_ACADEMIC_PROFILES: Record<string, CountryAcademicProfile> = {
  usa: {
    countryCodeUpper: 'US',
    fullName: 'the United States',
    demonym: 'US',
    universities: 'Harvard, Stanford, MIT, UC Berkeley, NYU, Columbia, UCLA, and major state universities',
    referencingStyles: 'APA (7th ed.), MLA (9th ed.), Chicago/Turabian, and IEEE',
    gradingLanguage: '4.0 GPA standards, Dean’s List rubrics, AP/Honors scoring, and graduate seminar expectations',
    timezoneNote: 'Eastern, Central, Mountain, and Pacific time zones (EST–PST)',
    sampleExcerptLabel: 'US Undergraduate Seminar Excerpt (APA 7th)',
    sampleExcerpt:
      '"Many scholars studied Federal Reserve quantitative easing after 2008. Bernanke (2012) said it helped markets recover, while other economists worried about asset inflation. Therefore, monetary policy is complicated."',
    sampleDiagnosis:
      'Your concluding sentence is too vague for an A-grade US seminar paper—it states complexity instead of defending a clear analytical thesis weighing liquidity stabilization against distributional asset effects.',
    sampleStrategy:
      'Formulate a specific thesis specifying under which macroeconomic conditions QE transmission succeeded, cite empirical inflation metrics cleanly in APA 7th, and tie directly to your professor’s rubric criteria.',
  },
  canada: {
    countryCodeUpper: 'CA',
    fullName: 'Canada',
    demonym: 'Canadian',
    universities: 'University of Toronto, UBC, McGill, University of Waterloo, McMaster, and University of Alberta',
    referencingStyles: 'APA (7th ed.), Chicago, IEEE, and Canadian Guide to Uniform Legal Citation (McGill Guide)',
    gradingLanguage: 'Canadian university percentage/GPA scales, Ontario/BC/Alberta provincial curricula, and Honours degree rubrics',
    timezoneNote: 'Pacific to Atlantic Canadian time zones (PST–AST)',
    sampleExcerptLabel: 'Canadian University Case Excerpt (Public Policy / Economics)',
    sampleExcerpt:
      '"Provincial healthcare funding varies across Canada. Studies from Ontario and British Columbia show different wait-time trends. Thus, federal transfers should increase."',
    sampleDiagnosis:
      'Jumping directly from provincial variation to higher federal transfers skips an analysis of governance design, demographic mix, and Canada Health Transfer allocation mechanisms.',
    sampleStrategy:
      'Compare Ontario and BC fiscal capacity and delivery models explicitly, integrate peer-reviewed Canadian health policy data, and frame your recommendation around measurable outcomes.',
  },
  uk: {
    countryCodeUpper: 'GB',
    fullName: 'the United Kingdom',
    demonym: 'UK',
    universities: 'Oxford, Cambridge, Imperial College London, UCL, LSE, Edinburgh, Manchester, and Russell Group universities',
    referencingStyles: 'Harvard (Cite Them Right), OSCOLA (Law), MHRA, APA (7th ed.), and Vancouver',
    gradingLanguage: 'First-Class Honours (70%+), Upper Second (2:1), GCSE/A-Level mark schemes, and QAA descriptors',
    timezoneNote: 'UK Greenwich Mean Time / British Summer Time (GMT/BST)',
    sampleExcerptLabel: 'UK Undergraduate Essay Excerpt (Russell Group — Harvard Style)',
    sampleExcerpt:
      '"Dicey (1885) defined parliamentary sovereignty as absolute. Later membership in international treaties changed this in practice. Consequently, UK constitutional law has evolved."',
    sampleDiagnosis:
      'To move from a 2:1 (64%) into First-Class (72%+) territory, engage critically with constitutional scholarship on continuing vs. self-embracing sovereignty and cite leading Supreme Court authorities.',
    sampleStrategy:
      'Contrast orthodox Diceyan theory with contemporary judicial dicta (e.g., Factortame, Miller) using accurate OSCOLA or Harvard citations, and sustain a clear critical thread throughout.',
  },
  uae: {
    countryCodeUpper: 'AE',
    fullName: 'the UAE',
    demonym: 'UAE & International',
    universities: 'Khalifa University, UAEU, NYU Abu Dhabi, American University of Sharjah, Heriot-Watt Dubai, and University of Birmingham Dubai',
    referencingStyles: 'Harvard, APA (7th ed.), IEEE, MLA, and IB Extended Essay citation standards',
    gradingLanguage: 'British, American, IB Diploma (HL/SL), and UAE Ministry of Education higher-education rubrics',
    timezoneNote: 'Gulf Standard Time (GST / UTC+4) evening & weekend slots',
    sampleExcerptLabel: 'UAE University Strategy Case Excerpt (MBA / Business)',
    sampleExcerpt:
      '"Dubai’s logistics sector grew quickly due to strong infrastructure. Jebel Ali Port and Emirates SkyCargo support global trade. Therefore, regional firms have competitive advantages."',
    sampleDiagnosis:
      'This paragraph describes well-known regional facts without applying an analytical strategy framework (such as Porter’s Diamond or VRIO) or evaluating emerging regional competition.',
    sampleStrategy:
      'Anchor each claim in verifiable trade-volume data, evaluate sustainability of competitive advantage using VRIO criteria, and align headings to your module’s executive report rubric.',
  },
  ireland: {
    countryCodeUpper: 'IE',
    fullName: 'Ireland',
    demonym: 'Irish',
    universities: 'Trinity College Dublin (TCD), UCD, UCC, University of Galway, DCU, and University of Limerick',
    referencingStyles: 'Harvard, OSCOLA Ireland, APA (7th ed.), and Chicago',
    gradingLanguage: 'Irish First-Class Honours (1.1 / 70%+), Leaving Certificate (H1–H8), Junior Cycle, and European ECTS credits',
    timezoneNote: 'Irish Standard Time / GMT (IST/GMT) flexible slots',
    sampleExcerptLabel: 'Irish University Essay Excerpt (ECTS Module — Harvard Style)',
    sampleExcerpt:
      '"Ireland’s foreign direct investment model attracted major tech and pharma firms. Critics mention housing and tax-base concentration risks. Overall, FDI has pros and cons."',
    sampleDiagnosis:
      'Summarizing "pros and cons" keeps an essay in the 2.2/2.1 range. Irish Honours rubrics reward a nuanced, evidence-weighted argument evaluating structural resilience.',
    sampleStrategy:
      'Contrast IDA Ireland productivity gains with concentration risk data from Central Bank of Ireland reports, clearly defending a balanced policy thesis in formal academic register.',
  },
  australia: {
    countryCodeUpper: 'AU',
    fullName: 'Australia',
    demonym: 'Australian',
    universities: 'University of Melbourne, University of Sydney, UNSW, ANU, Monash University, and University of Queensland (Go8)',
    referencingStyles: 'APA (7th ed.), Australian Harvard, AGLC4 (Law), and Vancouver',
    gradingLanguage: 'High Distinction (HD 80%+), Distinction (D), ATAR scaling, and Australian Qualifications Framework (AQF)',
    timezoneNote: 'AEST / AEDT / AWST across Sydney, Melbourne, Brisbane, and Perth',
    sampleExcerptLabel: 'Australian Go8 Assignment Excerpt (APA 7th)',
    sampleExcerpt:
      '"Bushfire management in Australia combines hazard reduction burns and Indigenous cultural burning. Research shows both approaches reduce fuel loads. Therefore, states should expand funding."',
    sampleDiagnosis:
      'To satisfy High Distinction (HD) critical evaluation criteria, compare ecological outcomes, seasonal constraints, and governance barriers between the two approaches rather than treating them as identical.',
    sampleStrategy:
      'Synthesize peer-reviewed Australian fire ecology literature, evaluate implementation constraints across state agencies, and format all citations strictly to APA 7th / Australian Harvard.',
  },
  'new-zealand': {
    countryCodeUpper: 'NZ',
    fullName: 'New Zealand',
    demonym: 'New Zealand',
    universities: 'University of Auckland, University of Otago, Victoria University of Wellington, University of Canterbury, and Massey University',
    referencingStyles: 'APA (7th ed.), New Zealand Law Style Guide (NZLSG), Harvard, and Chicago',
    gradingLanguage: 'A+ / First-Class Honours, NCEA Level 1–3 Excellence endorsements, and NZQF standards',
    timezoneNote: 'New Zealand Standard / Daylight Time (NZST/NZDT)',
    sampleExcerptLabel: 'New Zealand University Research Excerpt (APA 7th)',
    sampleExcerpt:
      '"Freshwater policy in Aotearoa New Zealand aims to balance agricultural exports with ecological restoration. Regional councils monitor nitrate levels. More collaboration is needed."',
    sampleDiagnosis:
      'The closing sentence is overly general. A+ NZ university rubrics expect explicit engagement with policy instruments (such as NPS-FM / Te Mana o te Wai) and regional implementation evidence.',
    sampleStrategy:
      'Evaluate measurable catchment data alongside statutory obligations, integrate peer-reviewed NZ environmental scholarship, and sharpen your topic sentence transitions.',
  },
  singapore: {
    countryCodeUpper: 'SG',
    fullName: 'Singapore',
    demonym: 'Singapore',
    universities: 'NUS, NTU, SMU, SUTD, SIT, and leading international schools across Singapore',
    referencingStyles: 'APA (7th ed.), IEEE, Chicago, Harvard, and Singapore Academy of Law citation styles',
    gradingLanguage: 'NUS/NTU CAP 5.0 Honours bands, SMU GPA 4.0, Singapore-Cambridge GCE O/A-Levels, and IB Diploma 45-point scale',
    timezoneNote: 'Singapore Standard Time (SGT / UTC+8) weekday & weekend availability',
    sampleExcerptLabel: 'Singapore University Analytical Excerpt (Economics / Policy)',
    sampleExcerpt:
      '"Singapore’s MAS manages monetary policy through the exchange rate rather than domestic interest rates. This helps keep inflation stable because Singapore is a small open economy."',
    sampleDiagnosis:
      'Good foundational recall, yet NUS/SMU A-grade rubrics require rigorous theoretical grounding (Impossible Trinity / S$NEER band mechanics) and empirical evaluation during global rate shocks.',
    sampleStrategy:
      'Unpack how the S$NEER slope, width, and centre respond to imported inflation shocks, reference MAS Macroeconomic Review data, and tighten your analytical transitions.',
  },
};

export function getCountryOnlineTutoringEditorialConfig(
  countryKey: string
): EditorialServicePageConfig {
  const data: CountryTutoringPageData =
    COUNTRY_ONLINE_TUTORING_PAGES[countryKey] || COUNTRY_ONLINE_TUTORING_PAGES.usa;
  const profile = COUNTRY_ACADEMIC_PROFILES[data.countryKey] || COUNTRY_ACADEMIC_PROFILES.usa;
  const topCities = data.citiesList.slice(0, 5).join(', ');
  const pathways = data.pathways || [
    'Secondary & High School Programs',
    'National & International Exam Prep',
    'Undergraduate University Modules',
    'Postgraduate & Research Degrees',
  ];
  const subjects = data.subjectsList || [
    'Mathematics & Statistics',
    'Physics, Chemistry & Biology',
    'Computer Science & Coding',
    'English & Academic Writing',
    'Business, Finance & Economics',
    'Engineering & Technical Modules',
  ];

  return {
    id: `country-${data.slug}`,
    hero: {
      badge: `university-tutors.com • ${data.flagEmoji} ${data.countryName} 1-on-1 Academic Mentorship`,
      titleStart: `${data.h1.replace(new RegExp(`in\\s+(the\\s+)?${data.countryName}$`, 'i'), '').trim()} in `,
      titleAccent: data.countryKey === 'usa' || data.countryKey === 'uk' || data.countryKey === 'uae'
        ? `the ${data.countryName}`
        : data.countryName,
      paragraphs: [
        ...data.paragraphs,
        `Designed specifically around ${profile.gradingLanguage}, our verified postgraduate tutors connect with students across ${topCities} and nationwide in ${profile.timezoneNote}. Whether you are preparing for national examinations, mastering demanding university modules at institutions like ${profile.universities}, or refining high-stakes coursework, we provide structured 1-on-1 coaching that delivers lasting academic clarity.`,
      ].slice(0, 2),
      primaryCta: `Book Your ${data.countryName} Tutoring Session`,
      secondaryCta: `Browse ${data.countryName} Mentors`,
      illustrationSrc: editorialGlobalImg,
      illustrationAlt: `1-on-1 Online Tutoring in ${data.countryName} Editorial Illustration`,
      illustrationFallback: editorial1on1Img,
      isCutout: false,
    },
    challenges: {
      badge: `${data.countryName} Academic Standards`,
      title: `Why Students in ${profile.fullName} Seek Structured 1-on-1 Mentorship`,
      intro: `Academic curricula across ${profile.fullName} place intense emphasis on independent critical analysis, rigorous examination technique, and strict disciplinary referencing (${profile.referencingStyles}). Even strong students frequently hit avoidable bottlenecks:`,
      bullets: [
        {
          title: `Strict ${profile.demonym} Grading Rubrics:`,
          body: `Moving from solid pass marks to top-band results under ${profile.gradingLanguage} requires mastering nuanced analytical expectations rarely unpacked in large classes.`,
        },
        {
          title: 'Overlapping Exams & Continuous Coursework:',
          body: `Balancing weekly tutorials, graded labs, research essays, and high-stakes exams across ${pathways.slice(0, 3).join(', ')} leaves little margin for falling behind.`,
        },
        {
          title: 'Local Referencing & Academic Conventions:',
          body: `University markers across ${profile.fullName} penalize inconsistent ${profile.referencingStyles} citations and descriptive summaries that lack critical synthesis.`,
        },
        {
          title: 'Limited Individual Instructor Access:',
          body: 'Large lecture theatres and brief office hours make it difficult to receive line-by-line feedback on problem sets, statistical outputs, or thesis structure.',
        },
        {
          title: 'Geographical & Scheduling Barriers:',
          body: `Finding an authentic subject-matter PhD or Master’s tutor locally in ${topCities}—or regional towns—often means long commutes or settling for generalist tutors.`,
        },
      ],
      summaryHighlight: `Our ${data.countryName} online tutoring platform removes geographical limits—connecting you directly with verified subject specialists aligned to ${profile.demonym} syllabi in your exact time zone.`,
      illustrationSrc: CHALLENGES_CUTOUT,
      illustrationAlt: `Academic Challenges for Students in ${data.countryName}`,
      illustrationFallback: editorialGlobalImg,
      isCutout: true,
    },
    process: {
      badge: `${data.countryName} Mentorship Workflow`,
      title: `How Online Tutoring in ${profile.fullName} Works`,
      intro: `Start learning with a curriculum-aligned ${profile.demonym} academic specialist in five clear steps—with zero commute and flexible ${profile.timezoneNote} scheduling:`,
      steps: [
        {
          title: 'Share Your Course, Curriculum & Target Grade',
          body: `Submit your ${profile.demonym} syllabus, school or university module outline, assignment rubric, or exam dates through our quick enquiry form or booking portal.`,
        },
        {
          title: `Precision Match With a ${data.countryName}-Aligned Specialist`,
          body: `We pair you with a vetted Master’s, PhD, or faculty-experienced tutor knowledgeable in ${profile.gradingLanguage} and your exact academic discipline.`,
        },
        {
          title: 'Interactive Live Whiteboard & Strategy Session',
          body: 'Meet online via HD video and collaborative whiteboard—unpacking difficult concepts, solving exam-style problems, or building structured assignment outlines together.',
        },
        {
          title: 'Coursework, Exam & Referencing Coaching',
          body: `Receive targeted guidance across ${profile.referencingStyles} conventions, lab analysis, quantitative derivations, and mark-scheme exam technique.`,
        },
        {
          title: 'Ongoing Progress Reviews & Flexible Scheduling',
          body: 'Export whiteboard notes after every lesson, book recurring weekly slots around your term calendar, and track measurable confidence gains before every exam.',
        },
      ],
      illustrationSrc: WORKFLOW_CUTOUT,
      illustrationAlt: `How Online Tutoring in ${data.countryName} Works`,
      illustrationFallback: editorial1on1Img,
      isCutout: true,
    },
    formats: {
      badge: `${data.countryName} Pathways & Subjects`,
      title: `Academic Pathways & Coursework Covered Across ${profile.fullName}`,
      intro: `${data.pathwaysTitle || `Our ${data.countryName} tutors support every major educational pathway and university discipline:`} Every program is tailored directly to local assessment frameworks:`,
      items: [
        ...pathways.map((pathway) => ({
          title: pathway,
          body: `Structured 1-on-1 coaching, past-paper exam technique, and concept mastery specifically calibrated to ${pathway} grading standards across ${profile.fullName}.`,
        })),
        {
          title: `University Assignment & Coursework Guidance (${data.countryName})`,
          body: `Ethical rubric deconstruction, thesis blueprinting, literature synthesis, and pre-submission developmental feedback for students at ${profile.universities}.`,
        },
        {
          title: `Academic Writing & ${profile.referencingStyles.split(',')[0]} Referencing`,
          body: `Sharpen analytical register, paragraph cohesion, and citation accuracy across ${profile.referencingStyles} without compromising authentic student authorship.`,
        },
      ].slice(0, 8),
      disciplinesTitle: `Core Subjects Supported in ${data.countryName}`,
      disciplinesIntro:
        data.subjectsTitle ||
        `Connect with vetted ${data.countryName} subject specialists covering ${subjects.join(', ')} and all major university faculties:`,
      disciplines: STANDARD_DISCIPLINES,
    },
    comparison: {
      badge: `${data.countryName} Online Mentorship Advantage`,
      title: `Why Choose Our ${data.countryName} Online Tutors Over Local Agencies?`,
      intro: `Traditional local tutoring agencies restrict you to whoever lives within driving distance. Our specialized online mentorship matches you strictly by academic expertise and curriculum alignment:`,
      leftColumnTitle: 'Generic Local Agencies & Recorded Videos',
      rightColumnTitle: `Our ${data.countryName} 1-on-1 Online Tutors`,
      rows: [
        {
          dimension: 'Subject Specialization',
          generic: 'Generalist tutors stretching across unrelated subjects',
          ours: 'Vetted postgraduate mentors matched strictly to your exact module',
        },
        {
          dimension: `${data.countryName} Curriculum Fit`,
          generic: 'Generic international worksheets disconnected from local rubrics',
          ours: `Aligned directly to ${profile.gradingLanguage}`,
        },
        {
          dimension: 'City & Regional Access',
          generic: `Limited availability outside central ${data.citiesList[0] || data.countryName}`,
          ours: `Instant access across ${topCities} and nationwide`,
        },
        {
          dimension: 'Referencing & Standards',
          generic: 'Inconsistent citation advice that costs avoidable marks',
          ours: `Fluent in ${profile.referencingStyles}`,
        },
        {
          dimension: 'Academic Integrity',
          generic: 'Unvetted marketplaces with high plagiarism and policy risks',
          ours: '100% honor-code compliant Socratic coaching & original student work',
        },
        {
          dimension: 'Scheduling Flexibility',
          generic: 'Rigid travel times and limited evening availability',
          ours: `Flexible online whiteboard slots across ${profile.timezoneNote}`,
        },
      ],
    },
    integrity: {
      badge: '100% University Honor-Code Compliant',
      title: `Ethical Academic Mentorship Trusted Across ${profile.fullName}`,
      intro: `Universities and exam boards across ${profile.fullName} enforce rigorous academic integrity standards. Our platform operates strictly as a transparent tutoring, academic coaching, and developmental feedback service—never writing assignments or sitting exams on a student's behalf.`,
      listLead: `Every ${data.countryName} tutoring session upholds four core educational commitments:`,
      bullets: [
        {
          title: 'Genuine Conceptual Understanding:',
          body: 'Building independent mastery so you perform confidently in closed-book exams, labs, and oral seminars.',
        },
        {
          title: 'Rubric-Aligned Coaching:',
          body: `Decoding ${profile.demonym} marking criteria so you understand exactly what distinguishes pass-level work from top-band distinction.`,
        },
        {
          title: 'Illustrative Method Demonstrations:',
          body: 'Walking through analytical frameworks, statistical outputs, and referencing syntax on parallel examples you apply yourself.',
        },
        {
          title: '100% Student-Authored Submissions:',
          body: 'Every equation, essay paragraph, and citation you submit remains completely your own original scholarship.',
        },
      ],
      closingBox: `Students across ${topCities} trust university-tutors.com to raise their academic performance legitimately—fully compliant with institutional honor codes across ${profile.fullName}.`,
      illustrationSrc: INTEGRITY_CUTOUT,
      illustrationAlt: `Academic Integrity Standards for ${data.countryName} Students`,
      illustrationFallback: editorialGlobalImg,
      isCutout: true,
    },
    audience: {
      badge: `Supporting Learners Across ${data.countryName}`,
      title: `Who Benefits Most From Online Tutoring in ${profile.fullName}?`,
      intro: `Our ${data.countryName} academic specialists adapt to every educational stage and learning objective:`,
      profiles: [
        {
          title: `${profile.demonym} High School & Exam-Year Students:`,
          body: `Preparing methodically for ${pathways.slice(0, 2).join(' and ')} with structured syllabus drills and examiner-style feedback.`,
        },
        {
          title: 'First-Year & Transitioning Undergraduates:',
          body: `Bridging the jump into rigorous degree standards at universities like ${profile.universities}.`,
        },
        {
          title: 'International Students Studying in ' + profile.fullName + ':',
          body: `Adapting smoothly to local ${profile.demonym} academic writing register, seminar expectations, and ${profile.referencingStyles} conventions.`,
        },
        {
          title: 'Postgraduate, Honours & MBA Candidates:',
          body: 'Managing intensive research methods, quantitative finance, systematic reviews, and thesis milestones alongside demanding schedules.',
        },
        {
          title: 'High Achievers Targeting Top Scholarships & Honours:',
          body: 'Refining critical depth, quantitative speed, and analytical originality to consistently achieve top-band marks.',
        },
      ],
    },
    packages: {
      badge: `Flexible ${data.countryName} Study Plans`,
      title: `Support Packages Tailored for ${profile.demonym} Students`,
      intro: `Select the mentoring format that fits your current module workload and upcoming exam calendar:`,
      items: [
        {
          name: '1-on-1 Live Tutoring Session (60 Minutes)',
          description: `Interactive whiteboard session in ${profile.timezoneNote} focused on mastering challenging lecture topics, derivations, or exam-style questions.`,
          cta: 'Book Live Session →',
        },
        {
          name: 'Assignment Brief & Draft Review',
          description: `Rubric-aligned structural planning or asynchronous annotated feedback tailored to ${profile.referencingStyles} and ${profile.demonym} grading criteria.`,
          cta: 'Request Assignment Guidance →',
        },
        {
          name: 'Weekly Semester Coursework Track',
          description: 'Consistent weekly sessions with a dedicated subject specialist to stay ahead of labs, tutorials, essays, and cumulative exams all term.',
          cta: 'Start Semester Track →',
        },
        {
          name: 'Intensive Exam Prep Bundle',
          description: `Multi-session past-paper sprint designed for upcoming ${pathways[0] || 'university'} midterms, finals, or national board examinations.`,
          cta: 'Schedule Exam Prep →',
        },
      ],
    },
    faqs: [
      {
        question: `Are your tutors familiar with ${profile.demonym} university and exam standards?`,
        answer: `Yes. We match students with verified Master’s, PhD, and faculty-experienced tutors familiar with ${profile.gradingLanguage} and ${profile.referencingStyles}.`,
      },
      {
        question: `Which cities in ${profile.fullName} do you serve?`,
        answer: `Because all sessions are delivered live online, students across ${data.citiesList.join(', ')}—and every regional community across ${profile.fullName}—enjoy identical access to top subject specialists.`,
      },
      {
        question: `Can I schedule sessions in ${profile.timezoneNote}?`,
        answer: `Absolutely. Our tutor network offers morning, after-school, evening, and weekend slots tailored directly to ${profile.timezoneNote}.`,
      },
      {
        question: 'Do you support both school-level exams and postgraduate university modules?',
        answer: `Yes! We cover ${pathways.join(', ')} across STEM, humanities, business, economics, law, computing, and health sciences.`,
      },
      {
        question: 'How quickly can I be matched with a subject tutor?',
        answer:
          'Most requests are matched with a qualified subject specialist within 2 to 4 hours, with rapid priority matching available ahead of urgent deadlines or exams.',
      },
      {
        question: `Is your tutoring compliant with ${data.countryName} university honor codes?`,
        answer:
          '100%. We strictly provide live instruction, concept coaching, structural blueprinting, and developmental feedback—never ghostwriting or exam impersonation.',
      },
    ],
    quickEnquiry: {
      eyebrow: `${data.flagEmoji} ${data.countryName} Mentor Match`,
      replyBadge: '2–4 hr reply',
      title: `Quick ${data.countryName} Tutoring Enquiry`,
      subtitle: `Get matched with a ${profile.demonym} curriculum specialist in ${profile.timezoneNote}.`,
      formatLabel: 'Support Needed',
      formatOptions: [
        '1-on-1 Live Online Tutoring',
        'University Assignment Guidance',
        'Semester Coursework Track',
        'Essay & Citation Review',
        `${pathways[0] || 'Exam Preparation'}`,
        'Dissertation / Thesis Mentorship',
      ],
      deadlineLabel: 'City & Target Timeline *',
      deadlinePlaceholder: `e.g., ${data.citiesList[0] || data.countryName} — Exam in 2 weeks`,
      noteLabel: 'Subject, Level & Goals *',
      notePlaceholder: `Share your subject, school/university level, and where you need support...`,
      submitLabel: `Match ${data.countryName} Tutor →`,
      inquirySubjectPrefix: `${data.countryName} Online Tutoring`,
    },
    tutorShowcase: {
      badge: `${data.flagEmoji} Verified ${data.countryName} & Global Faculty`,
      title: `Meet Our Subject-Matter Tutors for ${data.countryName}`,
      preferredCountryCode: profile.countryCodeUpper,
      countryLabel: data.countryName,
    },
    finalCta: {
      badge: `Start Learning Across ${data.countryName}`,
      title: `Elevate Your Academic Performance in ${profile.fullName} With 1-on-1 Mentorship`,
      paragraph1: `Whether you are studying in ${topCities} or connecting remotely from anywhere in ${profile.fullName}, personalized 1-on-1 coaching bridges the gap between dense syllabi and top-band results.`,
      paragraph2: `Share your subject, rubric, or exam calendar today to connect with a dedicated ${profile.demonym} specialist—and approach your next assessment with clarity and confidence.`,
      steps: [
        { step: 'Step 01', title: 'Share Local Syllabus', subtitle: `${data.countryName} course & goals` },
        { step: 'Step 02', title: 'Match Your Specialist', subtitle: `Aligned to ${profile.timezoneNote}` },
        { step: 'Step 03', title: 'Achieve Top Results', subtitle: 'Live coaching & rubric mastery' },
      ],
      primaryCta: `Book Your ${data.countryName} Tutoring Session`,
      secondaryCta: 'Browse Mentors by Subject',
      tertiaryCta: 'View Sample Coaching Note',
      illustrationSrc: FINAL_CTA_CUTOUT,
      illustrationAlt: `Elevate Your Academic Performance in ${data.countryName}`,
      illustrationFallback: editorialGlobalImg,
      isCutout: true,
    },
    sampleModal: {
      badge: `${data.flagEmoji} ${data.countryName} Coaching Example`,
      title: `Sample ${profile.demonym} Mentor Feedback`,
      subtitle: `See how our ${data.countryName}-aligned mentors diagnose analytical gaps against local rubric standards while keeping work 100% student-authored.`,
      excerptLabel: profile.sampleExcerptLabel,
      excerptQuote: profile.sampleExcerpt,
      feedbackLabel: `Mentor Feedback (${profile.referencingStyles.split(',')[0]} & Critical Depth)`,
      diagnosisLabel: 'Diagnosis:',
      diagnosis: profile.sampleDiagnosis,
      strategyLabel: 'Revision Strategy:',
      strategy: profile.sampleStrategy,
      footerNote: `100% honor-code compliant across ${profile.fullName} institutions`,
      ctaLabel: `Book Your ${data.countryName} Session`,
    },
  };
}

// ============================================================================
// 3. SPECIALIZED SERVICE & COUNTRY-SPECIFIC SERVICE PAGES
//    (/assignment-guidance-*, /coursework-tutoring-*, /writing-tutoring-*)
// ============================================================================

export function getSpecializedServiceEditorialConfig(
  data: SpecializedServicePageData
): EditorialServicePageConfig {
  // Base template by category so each service retains its distinct voice & illustrations
  const baseConfig: EditorialServicePageConfig =
    data.category === 'coursework-tutoring'
      ? COURSEWORK_TRACK_CONFIG
      : data.category === 'writing-tutoring'
        ? ESSAY_RHETORIC_CONFIG
        : ASSIGNMENT_GUIDANCE_CONFIG;

  // Global (non-country) specialized route — reuse base config with route-specific H1 & FAQs
  if (!data.countrySlug) {
    return {
      ...baseConfig,
      id: `specialized-${data.slug}`,
      hero: {
        ...baseConfig.hero,
        badge: `university-tutors.com • ${data.badge}`,
        titleStart: `${data.h1.split('&')[0]?.trim() || data.h1}${data.h1.includes('&') ? ' & ' : ''}`,
        titleAccent: data.h1.includes('&')
          ? data.h1.split('&').slice(1).join('&').trim()
          : 'Academic Support',
      },
    };
  }

  const countryInfo = COUNTRIES_CONFIG[data.countrySlug];
  const countryProfile = COUNTRY_ACADEMIC_PROFILES[data.countrySlug] || COUNTRY_ACADEMIC_PROFILES.usa;
  const countryDisplay = countryInfo?.name || data.countryName;
  const serviceDisplayName =
    data.category === 'coursework-tutoring'
      ? 'Coursework Tutoring'
      : data.category === 'writing-tutoring'
        ? 'Academic Writing & Citation Tutoring'
        : 'Assignment Guidance';

  const heroIllustration =
    data.category === 'coursework-tutoring'
      ? editorialCourseworkImg
      : data.category === 'writing-tutoring'
        ? editorialEssayImg
        : ASSIGNMENT_HERO_CUTOUT;

  return {
    ...baseConfig,
    id: `specialized-${data.slug}`,
    hero: {
      badge: `university-tutors.com • ${data.flagEmoji} ${countryDisplay} ${serviceDisplayName}`,
      titleStart: `${serviceDisplayName} in `,
      titleAccent:
        data.countrySlug === 'usa' || data.countrySlug === 'uk' || data.countrySlug === 'uae'
          ? `the ${countryDisplay}`
          : countryDisplay,
      paragraphs: [
        data.summary,
        `Tailored specifically to ${countryInfo?.educationSystem || countryProfile.gradingLanguage}, our verified postgraduate mentors support students across ${countryInfo?.keyInstitutions || countryProfile.universities}. Working in ${countryProfile.timezoneNote}, we help you decode local marking rubrics, structure high-caliber arguments, and master ${countryProfile.referencingStyles} with complete academic integrity.`,
      ],
      primaryCta: `Book ${countryDisplay} ${serviceDisplayName}`,
      secondaryCta: `Browse ${countryDisplay} Mentors`,
      illustrationSrc: heroIllustration,
      illustrationAlt: `${data.h1} Editorial Illustration`,
      illustrationFallback: editorialGlobalImg,
      isCutout: data.category === 'assignment-guidance',
    },
    challenges: {
      ...baseConfig.challenges,
      badge: `${countryDisplay} Academic Expectations`,
      title: `Why ${serviceDisplayName} Matters for Students in ${countryProfile.fullName}`,
      intro: `Universities across ${countryProfile.fullName}—including ${countryInfo?.keyInstitutions || countryProfile.universities}—hold coursework to rigorous analytical and citation criteria (${countryProfile.referencingStyles}). Here are the five most common hurdles our ${countryDisplay} mentors help students resolve:`,
      summaryHighlight: `Our ${countryDisplay} ${serviceDisplayName} service resolves each of these bottlenecks through structured, 1-on-1 mentorship calibrated to ${countryProfile.gradingLanguage}.`,
    },
    process: {
      ...baseConfig.process,
      badge: `${countryDisplay} Mentorship Process`,
      title: `How Our ${countryDisplay} ${serviceDisplayName} Works`,
      intro: `Built around ${countryInfo?.educationSystem || countryProfile.gradingLanguage}, our structured workflow takes you from brief to confident submission:`,
      steps:
        data.learningMethodology.length >= 4
          ? [
              ...data.learningMethodology.map((m) => ({
                title: m.title,
                body: m.desc,
              })),
              {
                title: `Final ${countryDisplay} Rubric & Referencing Verification`,
                body: `Confirm complete alignment with ${countryProfile.referencingStyles}, institutional grading criteria, and academic integrity standards prior to submission.`,
              },
            ]
          : baseConfig.process.steps,
    },
    formats: {
      ...baseConfig.formats,
      badge: `${countryDisplay} Formats & Curricula`,
      title: `${serviceDisplayName} Formats Covered Across ${countryProfile.fullName}`,
      intro: `Aligned to ${countryInfo?.educationSystem || countryProfile.gradingLanguage}, our ${countryDisplay} specialists coach students across all key deliverables:`,
      items: [
        ...data.features.map((f) => ({
          title: f.title,
          body: f.description,
        })),
        ...baseConfig.formats.items,
      ].slice(0, 8),
      disciplinesTitle: `Subject Disciplines Supported in ${countryDisplay}`,
      disciplinesIntro: `Specialist postgraduate mentors familiar with ${countryInfo?.keyInstitutions || countryProfile.universities} across:`,
    },
    comparison: {
      ...baseConfig.comparison,
      badge: `${countryDisplay} Mentorship Advantage`,
      title: `Why Choose Dedicated ${countryDisplay} ${serviceDisplayName}?`,
      rightColumnTitle: `Our ${countryDisplay} ${serviceDisplayName}`,
    },
    integrity: {
      ...baseConfig.integrity,
      badge: `100% ${countryDisplay} Honor-Code Compliant`,
      title: `Ethical ${serviceDisplayName} Built for ${countryProfile.fullName}`,
      intro: data.ethicalGuidanceNotice || baseConfig.integrity.intro,
      closingBox: `Every submission you hand in across ${countryInfo?.keyInstitutions || countryProfile.universities} remains 100% conceived, written, and cited by you—ensuring full compliance with ${countryProfile.demonym} university honor codes.`,
    },
    audience: {
      ...baseConfig.audience,
      badge: `Tailored for ${countryDisplay} Learners`,
      title: `Who Benefits Most From ${serviceDisplayName} in ${countryProfile.fullName}?`,
    },
    packages: {
      ...baseConfig.packages,
      badge: `Flexible ${countryDisplay} Packages`,
      title: `${serviceDisplayName} Packages for Every Stage of Your ${countryDisplay} Term`,
    },
    faqs:
      data.faqs.length >= 4
        ? [
            ...data.faqs.map((f) => ({ question: f.q, answer: f.a })),
            ...baseConfig.faqs.slice(0, Math.max(0, 6 - data.faqs.length)),
          ]
        : baseConfig.faqs,
    quickEnquiry: {
      ...baseConfig.quickEnquiry,
      eyebrow: `${data.flagEmoji} ${countryDisplay} Specialist Match`,
      title: `Quick ${countryDisplay} ${data.category === 'writing-tutoring' ? 'Writing' : data.category === 'coursework-tutoring' ? 'Coursework' : 'Assignment'} Enquiry`,
      subtitle: `Connect with a ${countryProfile.demonym} mentor in ${countryProfile.timezoneNote}.`,
      inquirySubjectPrefix: `${countryDisplay} ${serviceDisplayName}`,
    },
    tutorShowcase: {
      badge: `${data.flagEmoji} Verified ${countryDisplay} & Global Mentors`,
      title: `Meet Our ${countryDisplay} Subject-Matter Tutors`,
      preferredCountryCode: countryProfile.countryCodeUpper,
      countryLabel: countryDisplay,
    },
    finalCta: {
      ...baseConfig.finalCta,
      badge: `Ready To Excel in ${countryDisplay}?`,
      title: `Turn Your Next ${countryDisplay} Brief Into a Clear Plan of Action`,
      primaryCta: `Book ${countryDisplay} ${serviceDisplayName}`,
      secondaryCta: `Browse ${countryDisplay} Mentors`,
    },
    sampleModal: {
      ...baseConfig.sampleModal,
      badge: `${data.flagEmoji} ${countryDisplay} Socratic Coaching Example`,
      title: `Sample ${countryProfile.demonym} Mentor Feedback`,
      excerptLabel: countryProfile.sampleExcerptLabel,
      excerptQuote: countryProfile.sampleExcerpt,
      diagnosis: countryProfile.sampleDiagnosis,
      strategy: countryProfile.sampleStrategy,
      footerNote: `100% student-authored revision • Aligned to ${countryProfile.referencingStyles.split(',')[0]} & ${countryDisplay} rubrics`,
      ctaLabel: `Book ${countryDisplay} Feedback Session`,
    },
  };
}
