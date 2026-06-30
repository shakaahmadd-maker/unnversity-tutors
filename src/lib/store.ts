import { 
  User, 
  UserRole, 
  Service, 
  Chat, 
  Message, 
  Quote, 
  Assignment, 
  AssignmentStatus, 
  Payment, 
  Blog, 
  FAQ, 
  SupportTicket, 
  Review,
  Invoice,
  ActivityLog,
  AppNotification,
  SOP,
  AssignmentReport,
  Agreement,
  TriggeredEmail
} from '../types';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

import { 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';

import { db, auth, handleFirestoreError, OperationType, sanitizeDocData } from '../firebase';

// Standard Initial Mock Data
const INITIAL_TUTORS: User[] = [
  {
    id: 'tutor_clara',
    role: UserRole.TUTOR,
    name: 'Dr. Clara Stirling',
    email: 'clara@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
    bio: 'Former Oxford Senior Lecturer with 12+ years of experience helping undergraduate and postgraduate students structure complex academic essays and dissertation prose.',
    hourlyRate: 45,
    rating: 4.9,
    reviewCount: 142,
    subjects: ['English Literature', 'Essays & Editing', 'History', 'Philosophy'],
    country: 'GB',
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T10:00:00.000Z',
      new Date().toISOString().split('T')[0] + 'T14:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00.000Z'
    ]
  },
  {
    id: 'tutor_liam',
    role: UserRole.TUTOR,
    name: 'Liam Kennedy, M.Sc.',
    email: 'liam@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
    bio: 'MIT graduate specializing in Advanced Calculus, Statistics, Linear Algebra and Mechanical Engineering. Helping students solve complex problems systematically.',
    hourlyRate: 50,
    rating: 4.8,
    reviewCount: 96,
    subjects: ['Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering'],
    country: 'US',
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T11:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T15:00:00.000Z'
    ]
  },
  {
    id: 'tutor_chloe',
    role: UserRole.TUTOR,
    name: 'Chloe Tremblay',
    email: 'chloe@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    bio: 'Specialist in Cognitive Psychology and Business Administration. Focuses on coursework mentorship, assignment structuring, and dissertation planning.',
    hourlyRate: 38,
    rating: 4.7,
    reviewCount: 68,
    subjects: ['Psychology', 'Business Administration', 'Marketing', 'Sociology'],
    country: 'CA',
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T16:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T13:00:00.000Z'
    ]
  },
  {
    id: 'tutor_james',
    role: UserRole.TUTOR,
    name: 'James Cook',
    email: 'james@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
    bio: 'Fullstack Developer and Algorithms Engineer. Academic advisor for Computer Science students across AU and NZ. Specialized in Python, Java, C++, and database architecture.',
    hourlyRate: 48,
    rating: 5.0,
    reviewCount: 215,
    subjects: ['Computer Science', 'Data Structures', 'Coding & Python', 'Database Systems'],
    country: 'AU',
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T09:00:00.000Z',
      new Date().toISOString().split('T')[0] + 'T13:00:00.000Z',
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T11:00:00.000Z'
    ]
  },
  {
    id: 'tutor_siobhan',
    role: UserRole.TUTOR,
    name: 'Dr. Siobhan O\'Connor',
    email: 'siobhan@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    bio: 'Medical research biochemist. Advises dentistry, medical technology, and general biochemistry university students. Expert in lab report writing & medical diagrams.',
    hourlyRate: 55,
    rating: 4.9,
    reviewCount: 39,
    subjects: ['Biochemistry', 'Medicine', 'organic Chemistry', 'Academic Lab Reports'],
    country: 'IE',
    availableSlots: [
      new Date().toISOString().split('T')[0] + 'T15:00:00.000Z'
    ]
  },
  {
    id: 'tutor_nz_kiri',
    role: UserRole.TUTOR,
    name: 'Kiri Te-Taite, PhD',
    email: 'kiri@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a131ffd107fd?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString(),
    bio: 'University of Auckland Graduate. Over 10 years of experience in Environmental Sciences and Geography. Focused on spatial analysis and environmental essay formatting.',
    hourlyRate: 42,
    rating: 4.8,
    reviewCount: 84,
    subjects: ['Environmental Science', 'Geography', 'Ecology', 'GIS Analysis'],
    country: 'NZ',
    availableSlots: [
      new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00.000Z'
    ]
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog_1',
    adminId: 'admin_emily',
    title: 'Mastering the Undergraduate Dissertation: 5 Critical Roadmap Milestones',
    content: `Writing your final undergraduate dissertation or project is arguably the most intellectually grueling milestone of your academic degree. However, establishing a systemic chronological plan avoids late-semester panic. Here are the 5 major landmarks you must clear:
    
    ### 1. Formulate a Hyper-Specific Research Question
    Broad titles lead to shallow, superficial literature reviews. Instead of a general topic like "A Study of Digital Marketing Dynamics", refine your question to something highly structured in scope, such as: "The Efficacy of TikTok Influencer Algorithms on UK Retail Consumers (2024-2026)."
    
    ### 2. Map and Verify Your Research Methodology
    Decide early if your dissertation will rely on qualitative (interviews, content analysis), quantitative (surveys, hypothesis testing), or mixed-methods. Draft and file your institutional ethical clearance form simultaneously to prevent approval delays.
    
    ### 3. Build a Thematic Literature Review
    Do not just list papers. Group the literature by themes, identify critical debates, and specifically highlight the theoretical gap that your dissertation resolves.
    
    ### 4. Code and Interpret Your Research Data
    Utilize software tools like NVivo for indexing qualitative codes, or SPSS / R Studio for checking statistical significance. Make sure your charts have clear labels with no overlapping text.
    
    ### 5. Revise and Align with Academic Guidelines
    Ensure every quote has corresponding in-text citation pages and matches standard paragraph spacing. If you need dedicated guidance, our online mentors can review dissertation structure, draft layouts, and methodology approaches live.`,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&auto=format&fit=crop&q=80',
    category: 'University Survival',
    tags: ['Dissertation', 'Undergraduate', 'Methodology', 'Research Paper'],
    publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_2',
    adminId: 'admin_emily',
    title: 'The Harvard and APA 7th Edition Style Manual: Navigating Tricky In-Text Rules',
    content: `Maintaining absolute formatting consistency is key to securing top-tier academic marks. Many students get tripped up when transitioning between Harvard and APA 7th structures. Here is a definitive comparison guide to streamline your next submission.
    
    ### 1. Handling Three or More Authors
    - **APA 7th Edition:** Always abbreviate to the first author's surname followed by "et al." even on the very first in-text mention. Example: *(Miller et al., 2024)*.
    - **Harvard referencing:** Similarly uses *(Miller et al., 2024)*, but some institutions require listing all names on first reference. Always consult your university's local handbook!
    
    ### 2. The Nuances of Reference List Entry
    - **APA 7th:** Must include a hanging indent of 0.5 inches. Journal names and volume numbers are italicized:
      *Miller, T., & Kennedy, J. (2024). Cognitive development metrics. Journal of Higher Learning, 14(2), 101–115.*
    - **Harvard style:** Generally places the publication year in parenthetical format and skips the ampersand in favor of "and":
      *Miller, T. and Kennedy, J. (2024) "Cognitive development metrics", Journal of Higher Learning, vol. 14, no. 2, pp. 101-115.*
    
    Cross-reference your sources against automated generator outputs. If you requires a structured copyediting pass, submit your drafts to our specialized edit team!`,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    category: 'APA Guidelines',
    tags: ['Referencing', 'Academic Writing', 'APA Style', 'Harvard Style'],
    publishedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_3',
    adminId: 'admin_emily',
    title: 'Coding in Academic Research: Leveraging R, Python, and SPSS for Data Visualization',
    content: `Computational methods have revolutionized academic investigations across humanities, engineering, and social sciences. Choosing the appropriate analytical suite and plotting beautiful graphics can define the impact of your quantitative final papers.
    
    ### 1. Statistical Modeling in R Studio
    R is unmatched for statistical graphics. Packages like \`ggplot2\` allow you to construct publication-ready scatter plots, box plots, and multivariate regression curves with clean theme layers:
    \`\`\`r
    ggplot(data, aes(x=study_hours, y=exam_score)) + 
      geom_point(color="blue") + 
      geom_smooth(method="lm")
    \`\`\`
    
    ### 2. General-Purpose Computation with Python
    Python integrates seamlessly with large dataset frameworks. Packages like \`pandas\`, \`matplotlib\`, and \`seaborn\` are phenomenal for scraping web data and plotting interactive charts.
    
    ### 3. Traditional Data Management via SPSS
    For social sciences and nursing psychology, SPSS provides a graphical user interface that simplifies ANCOVA, chi-square tests, and factor analysis. Let our computer science experts help you debug your statistics scripts today!`,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
    category: 'Mathematics Tricks',
    tags: ['R Coding', 'Python', 'SPSS Stats', 'Data Science', 'Programming'],
    publishedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_4',
    adminId: 'admin_emily',
    title: 'Structuring High-Scoring Law Essays: The IRAC Method Explained with Case Examples',
    content: `Legal studies require a distinct, methodical approach to analyzing complex scenarios. Simply writing beautiful prose will not suffice. To achieve a first-class grade in your tort, criminal, or contract law modules, you must apply the classic **IRAC framework**.
    
    ### I - Issue: Isolating the Legal Question
    State the precise legal dispute. For example: "The primary issue is whether Donald's statement to Sally constitutes a binding contract offer, or merely an invitation to treat."
    
    ### R - Rule: Setting the Precedential Foundation
    Cite the primary case law and statutes. E.g., cite *Carlill v Carbolic Smoke Ball Co [1893]* to establish the differences between general offers and unilateral contracts.
    
    ### A - Application: Applying Precedents to Facts
    This is where 80% of marks are awarded. Analyze the facts of your scenario in direct light of the rules you cited. Never assume; explicitly show how the facts conform or differ.
    
    ### C - Conclusion: Delivering a Decisive Resolution
    Formulate a clear conclusion summarizing the liabilities or legal rights of the parties. Reach out to our legal studies practitioners for premium case-brief tutoring and essay outline coaching.`,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    category: 'Legal Disclaimers',
    tags: ['Law School', 'Legal Analysis', 'IRAC Method', 'Jurisprudence'],
    publishedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_5',
    adminId: 'admin_emily',
    title: 'Developing Empirical Evidence in Clinical Case Reviews & Reflective Nursing Portfolios',
    content: `Modern medical and nursing education places significant weight on reflective thinking and empirical justification. Creating reflective case reviews using frameworks like Gibbs' Reflective Cycle is a common academic expectation.
    
    ### Gibbs' Reflective Cycle Milestones:
    1. **Description:** Describe the clinical incident clearly without drawing premature conclusions.
    2. **Feelings:** Reflect on your thoughts and emotional reactions during the procedure.
    3. **Evaluation:** Examine what aspects of the medical intervention went smoothly or poorly.
    4. **Analysis:** Relate the incident to recognized clinical guidelines and evidence-based journals.
    
    In clinical programs, you must justify every patient action with empirical references to reputable medical publications (e.g., BMJ, Lancet, pubmed). Tutors at University Tutors can help review clinical portfolios and guide you through reflective writing exercises.`,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    category: 'University Survival',
    tags: ['Nursing Care', 'Clinical Practicum', 'Reflective Journals', 'Medicine'],
    publishedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_6',
    adminId: 'admin_emily',
    title: 'Demystifying Calculus and Linear Algebra: Core Formula Derivations for STEM Assignments',
    content: `For engineering, physics, and economics undergraduates, solving advanced homework assignments requires a high-level command of proof techniques and vector mathematics. Let's break down practical strategies to dismantle complex STEM problems.
    
    ### 1. Master Limits and Derivative Approximations
    When solving limits such as $\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$, always relate them to geometric constraints or L'Hôpital's Rule where appropriate. Highlight each mathematical transition on its own line.
    
    ### 2. Geometric Interpretations in Linear Algebra
    When dealing with transformations, visualize the matrix multiplication $Ax = b$ as transforming or rotating basis vectors. This conceptual bridge makes calculating eigenvalues and determinants highly logical.
    
    Always document your assumptions and use clean mathematical notation (LaTeX or structured equation editors). Our mathematics instructors can guide you through complex differential equations and proofs step-by-step.`,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    category: 'Mathematics Tricks',
    tags: ['Calculus', 'Linear Algebra', 'STEM', 'Math Help', 'Problem Sheets'],
    publishedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_7',
    adminId: 'admin_emily',
    title: 'Writing Strategic Business Reports: Crafting Value Propositions and Competitive Porter’s Five Forces',
    content: `A first-class business or MBA report requires an authoritative, objective tone backed by empirical frameworks. It is not enough to simply state that a company is succeeding; you must demonstrate *why* using rigorous strategic matrices.
    
    ### 1. Applying Porter\\'s Five Forces
    Evaluate competitive threats with precision:
    - **Bargaining Power of Buyers:** Are buyers consolidated?
    - **Threat of Substitutes:** Can digital platforms replace traditional operations?
    
    ### 2. Constructing the SWOT-TOWS Action Grid
    A dynamic TOWS matrix transforms standard SWOT bullet points into actionable strategic options. Map internal strengths against external opportunities directly to formulate highly practical growth solutions.
    
    If you're drafting business reports, leadership analyses, or financial forecast briefs, connect with our MBA-certified instructors for personalized feedback today.`,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    category: 'University Survival',
    tags: ['Business Reports', 'MBA Study', 'SWOT Analysis', 'Porters Five Forces'],
    publishedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_8',
    adminId: 'admin_emily',
    title: 'Drafting Flawless Engineering Lab Reports: Formulating Precision Data Interpretations',
    content: `Engineering experiments demand rigorous standards of analysis. Your lab report is the definitive record of your methodology, empirical findings, and intellectual conclusions. Keep these essential sections structured correctly:
    
    ### 1. The Abstract: A Compact Summary
    Summarize the experimental purpose, primary methodology used, key results, and major quantitative conclusions in exactly 150 to 200 words.
    
    ### 2. Error Propagation and Uncertainty Analysis
    No physical experiment is perfect. Explicitly calculate instrumental uncertainties and use error propagation mathematics to determine systematic and random deviation limits.
    
    ### 3. Comparing Data to Theoretical Benchmarks
    A high-scoring report directly compares experimental values with established physics or engineering models. Use clear charts and reference materials to discuss any inconsistencies. Reach out to our engineering lab tutors for advanced guidance on mechanics, electronics, and material labs.`,
    image: 'https://images.unsplash.com/photo-1491841573190-7d1bc9d4d7cf?w=800&auto=format&fit=crop&q=80',
    category: 'Mathematics Tricks',
    tags: ['Lab Reports', 'Engineering', 'Experiment Log', 'Physics Mechanics'],
    publishedAt: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_9',
    adminId: 'admin_emily',
    title: 'Active Recall and Spaced Repetition: Scientific Study Techniques to Triumph Over Final Exams',
    content: `Struggling through long, ineffective study sessions? Research in cognitive psychology shows that passive reading is the least efficient way to study. Instead, leverage these scientifically proven strategies for exam success.
    
    ### 1. Active Recall: Triggering Memory Retrieval
    Close your notebook and force yourself to explain a concept from scratch, or flashcard yourself using tools like Anki. This mental effort creates stronger neural connections.
    
    ### 2. Spaced Repetition: Defeating the Ebbinghaus Forgetting Curve
    Review your materials at growing intervals (e.g., 1 day, 3 days, 7 days, 14 days). This reinforces memory retention right before it begins to fade.
    
    Combining active self-testing with a structured study schedule is the ultimate recipe for academic excellence. If you require private exam tutoring or mock question feedback, match with our subject matter experts today!`,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    category: 'University Survival',
    tags: ['Active Recall', 'Spaced Repetition', 'Exam Revision', 'Study Habits'],
    publishedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'blog_10',
    adminId: 'admin_emily',
    title: 'How to Address Peer Review Feedback and Write Compelling Academic Rebuttal Letters',
    content: `Receiving peer review critique on your academic manuscripts or dissertation chapters can be daunting. Engaging constructively with reviewer comments, however, is a vital skill in research.
    
    ### 1. Maintain Professional, Objective Composure
    Even if you disagree with a critic's analysis, always answer politely. Begin your rebuttal letter with: "We thank the reviewer for their valuable insight on this segment..."
    
    ### 2. Structured Rebuttal Formatting
    Organize responses section-by-section. Copy the reviewer's exact critique, provide your revised text, and cite the precise page numbers where changes were applied.
    
    ### 3. Providing Empirical Justification
    If you decline to execute an edited experiment, justify your decision with concrete evidence, experimental bounds, or prior publications. Our senior peer review editors are available to help you draft rebuttal letters and perfect your publication-ready manuscripts.`,
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
    category: 'APA Guidelines',
    tags: ['Peer Review', 'Journal Submission', 'Academic Editing', 'Paper Revisions'],
    publishedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq_1',
    question: 'How do you vet your academic tutors?',
    answer: 'Every tutor on universitytutors.com is rigorously vetted. We verify their academic transcripts, conduct subject-matter exam assessments, and host live screening video sessions before onboarding. All tutors hold a minimum of a Bachelor\'s degree with honors, and over 65% hold Masters or PhD qualifications from premier institutions in the UK, US, CA, AU, and NZ.',
    category: 'General',
    order: 1
  },
  {
    id: 'faq_2',
    question: 'How do Stripe payment holds/escrow work?',
    answer: 'Your safety is our top priority. When you agree on a quote from your tutor and click "Proceed to Payment", your funds are held in a secure Stripe-enabled escrow account. Money is only released to the tutor after you click "Confirm & Approve Delivery" on your dashboard. If the tutor fails to deliver or if you request revisions, the funds remain securely locked. If a dispute arises, the Admin Panel reviews it and issues a full refund where applicable.',
    category: 'Payments',
    order: 1
  },
  {
    id: 'faq_3',
    question: 'Are your services ethical and aligned with University policies?',
    answer: 'Absolutely. We provide strictly ethical academic guidance. Our tutors explain concepts, review research methodologies, structure essays, provide line-by-line feedback, and compile custom explanatory study examples. We do NOT condone contract cheating, ghostwriting, or exam-impersonation. All materials provided are intended as reference models for study purposes.',
    category: 'Tutoring Process',
    order: 1
  },
  {
    id: 'faq_4',
    question: 'What is your revision and refund policy?',
    answer: 'If the tutorial advice or sample example provided does not meet your initial briefing, you have 7 days from tutor delivery to click the "Request Revision" button on your assignment card. You can describe what parts require optimization. It is 100% free of charge. If disputes remain unresolved, an administrator will step in to arbitrate.',
    category: 'Revisions & Refunds',
    order: 1
  },
  {
    id: 'faq_5',
    question: 'How do I schedule a Live 1-on-1 whiteboarding slot?',
    answer: 'After selecting "1-on-1 Live Tutoring" and selecting a tutor, you can open their chat and select dates from their interactive calendar slots. Tutors support live interactive video sessions with real-time whiteboards directly inside our app.',
    category: 'Technical Issues',
    order: 1
  },
  {
    id: 'faq_6',
    question: 'Are there any hidden service charges or sign-up fees?',
    answer: 'None at all. Registering an account is completely free for both students and tutors. The prices you see on quote cards are fully transparent and include all platform processing fees. There are no recurring subscription charges or hidden commissions.',
    category: 'Payments',
    order: 2
  },
  {
    id: 'faq_7',
    question: 'What subjects and disciplines do you support?',
    answer: 'Our professional mentoring network covers a broad spectrum of academic specialties. This includes STEM disciplines (Mathematics, Statistics, Organic Chemistry, Biochemistry, Computer Science, AI & Machine Learning), Humanities (History, Literature, Sociology), Business & Economics (Corporate Finance, Micro/Macroeconomics, Accounting, Quantitative Analysis), as well as selective fields such as Legal Studies, Nursing Science, and Dissertation Methodology design.',
    category: 'General',
    order: 2
  },
  {
    id: 'faq_8',
    question: 'Can I request a specific tutor for a long-term coursework program?',
    answer: 'Yes! If you find a tutor whose coaching methodology matches your learning style, you can request them for long-term study partnerships. You can message them directly through our secure chat to structure custom weekly milestones, outline multi-phase projects, and secure continuous feedback throughout your academic semester.',
    category: 'Tutoring Process',
    order: 2
  },
  {
    id: 'faq_9',
    question: 'How can I contact platform support if I encounter a system bug?',
    answer: 'Our operational technical support is available 24/7. You can instantly submit a Support Ticket directly from your dashboard or email our dedicated administrative helpline at support@universitytutors.com. Our senior team typically replies and resolves system issues within a two-hour window.',
    category: 'Technical Issues',
    order: 2
  },
  {
    id: 'faq_10',
    question: 'What happens if a tutor submits work late?',
    answer: 'If a tutoring session or model asset delivery is delayed past the agreed-on deadline, you can raise an immediate de-escalation warning. Under our platform standards, late submissions qualify the student client for automatic adjustments or a full arbitration-driven escrow refund if the utility of the reference work has been compromised.',
    category: 'Revisions & Refunds',
    order: 2
  },
  {
    id: 'faq_11',
    question: 'Is my personal information and academic identity kept secure?',
    answer: 'Absolutely. We enforce robust privacy controls. Your registration email address, real name, and academic institution details are strictly shielded. Tutors and students only interact using their verified operational usernames, and we never share your data or database records with third-party networks or academic bodies.',
    category: 'General',
    order: 3
  }
];

export class AppStore {
  users: User[] = [
    ...INITIAL_TUTORS,
    {
      id: 'student_alex',
      role: UserRole.STUDENT,
      name: 'Alex Mercer',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: 'admin_emily',
      role: UserRole.ADMIN,
      name: 'Emily Vance (Platform Admin)',
      email: 'emily@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: 'admin_shaka',
      role: UserRole.ADMIN,
      name: 'Shaka Ahmad',
      email: 'shaka.ahmadd@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: 'student_lunn',
      role: UserRole.STUDENT,
      name: 'Lunn',
      email: 'lunn@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      verified: true
    }
  ];
  currentUser: User | null = null;
  blogs: Blog[] = [];
  faqs: FAQ[] = [];
  chats: Chat[] = [];
  messages: Message[] = [];
  quotes: Quote[] = [];
  assignments: Assignment[] = [];
  payments: Payment[] = [];
  supportTickets: SupportTicket[] = [];
  reviews: Review[] = [];
  invoices: Invoice[] = [];
  activityLogs: ActivityLog[] = [];
  appNotifications: AppNotification[] = [];
  sops: SOP[] = [];
  assignmentReports: AssignmentReport[] = [];
  agreements: Agreement[] = [];
  emails: TriggeredEmail[] = [];
  activeStudentsOnline: number = 84;

  private listeners: (() => void)[] = [];
  private publicUnsubscribes: (() => void)[] = [];
  private userUnsubscribes: (() => void)[] = [];
  private activeChatUnsub: (() => void)[] = [];

  constructor() {
    this.startLiveStudentCounter();
    this.initFirebase();
  }

  private initFirebase() {
    // 1. Recover last logged-in user session from cache, if any
    const cachedUser = localStorage.getItem('ut_current_user');
    if (cachedUser) {
      try {
        this.currentUser = JSON.parse(cachedUser);
      } catch (e) {
        console.error("Local user profile parse error:", e);
      }
    }

    // Seed defaults and synchronize immediately since we have relaxed rules for the local developer session
    this.seedDefaultDataIfEmpty().then(() => {
      this.syncPublicCollections();
      if (this.currentUser) {
        this.syncUserCollections(this.currentUser.id, this.currentUser.role);
      }
    }).catch(err => {
      console.warn("Seeding or initial sync error: ", err);
    });

    // 2. Setup Firebase Auth status change observer (optional/fallback helper)
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase Auth initialized with UID: ", user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.log("Anonymous auth restricted in this environment. Proceeding cleanly with local simulation profile.");
        }
      }
    });
  }

  private async seedDefaultDataIfEmpty() {
    try {
      // blogs
      const blogSnap = await getDocs(collection(db, 'blogs'));
      if (blogSnap.empty) {
        for (const b of INITIAL_BLOGS) {
          await setDoc(doc(db, 'blogs', b.id), b);
        }
      }

      // FAQs
      const faqSnap = await getDocs(collection(db, 'faqs'));
      if (faqSnap.empty) {
        for (const f of INITIAL_FAQS) {
          await setDoc(doc(db, 'faqs', f.id), f);
        }
      }

      // preloaded roles
      const defaultUsers = [
        ...INITIAL_TUTORS,
        {
          id: 'student_alex',
          role: UserRole.STUDENT,
          name: 'Alex Mercer',
          email: 'alex@example.com',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          verified: true
        },
        {
          id: 'admin_emily',
          role: UserRole.ADMIN,
          name: 'Emily Vance (Platform Admin)',
          email: 'emily@example.com',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          verified: true
        },
        {
          id: 'admin_shaka',
          role: UserRole.ADMIN,
          name: 'Shaka Ahmad',
          email: 'shaka.ahmadd@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          verified: true
        },
        {
          id: 'student_lunn',
          role: UserRole.STUDENT,
          name: 'Lunn',
          email: 'lunn@example.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          verified: true
        }
      ];

      for (const u of defaultUsers) {
        const uDocRef = doc(db, 'users', u.id);
        const uDoc = await getDoc(uDocRef);
        if (!uDoc.exists()) {
          await setDoc(uDocRef, u);
        }
      }
    } catch (err) {
      console.warn("Ignored Firestore pre-auth seeding alert: ", err);
    }
  }

  private syncPublicCollections() {
    this.publicUnsubscribes.forEach(unsub => unsub());
    this.publicUnsubscribes = [];

    // Sync users list immediately so that verification status checks, duplicates, logins, resets, and lookups work pre-auth
    const usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      this.users = snap.docs.map(doc => doc.data() as User);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'users' snap listener restriction/offline. Utilizing preloaded mock accounts state directly.", error);
    });
    this.publicUnsubscribes.push(usersUnsub);

    // Sync blogs
    const blogsUnsub = onSnapshot(collection(db, 'blogs'), (snap) => {
      this.blogs = snap.docs.map(doc => doc.data() as Blog);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'blogs' snap listener restriction/offline. Operating in-memory.", error);
    });
    this.publicUnsubscribes.push(blogsUnsub);

    // Sync FAQs
    const faqsUnsub = onSnapshot(collection(db, 'faqs'), (snap) => {
      this.faqs = snap.docs.map(doc => doc.data() as FAQ).sort((a,b) => a.order - b.order);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'faqs' snap listener restriction/offline. Operating in-memory.", error);
    });
    this.publicUnsubscribes.push(faqsUnsub);

    // Sync reviews
    const reviewsUnsub = onSnapshot(collection(db, 'reviews'), (snap) => {
      this.reviews = snap.docs.map(doc => doc.data() as Review);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'reviews' snap listener restriction/offline. Operating in-memory.", error);
    });
    this.publicUnsubscribes.push(reviewsUnsub);
  }

  private syncUserCollections(userId: string, role: UserRole) {
    this.userUnsubscribes.forEach(unsub => unsub());
    this.userUnsubscribes = [];

    // Sync chats channels
    let chatQuery;
    if (role === UserRole.ADMIN) {
      chatQuery = collection(db, 'chats');
    } else if (role === UserRole.TUTOR) {
      chatQuery = query(collection(db, 'chats'), where('tutorId', '==', userId));
    } else {
      chatQuery = query(collection(db, 'chats'), where('studentId', '==', userId));
    }

    const chatsUnsub = onSnapshot(chatQuery, (snap) => {
      this.chats = snap.docs.map(doc => doc.data() as Chat);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'chats' user snap listener offline/unauthorized. Operating locally.", error);
    });
    this.userUnsubscribes.push(chatsUnsub);

    // Sync Assignments List
    let assignQuery;
    if (role === UserRole.ADMIN) {
      assignQuery = collection(db, 'assignments');
    } else if (role === UserRole.TUTOR) {
      assignQuery = query(collection(db, 'assignments'), where('tutorId', '==', userId));
    } else {
      assignQuery = query(collection(db, 'assignments'), where('studentId', '==', userId));
    }

    const assignUnsub = onSnapshot(assignQuery, (snap) => {
      this.assignments = snap.docs.map(doc => doc.data() as Assignment);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'assignments' user snap listener offline/unauthorized. Operating locally.", error);
    });
    this.userUnsubscribes.push(assignUnsub);

    // Sync Payments Escrow Statement
    const paymentsUnsub = onSnapshot(collection(db, 'payments'), (snap) => {
      this.payments = snap.docs.map(doc => doc.data() as Payment);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'payments' user snap listener offline/unauthorized. Operating locally.", error);
    });
    this.userUnsubscribes.push(paymentsUnsub);

    // Sync support tickets
    let ticketsQuery;
    if (role === UserRole.ADMIN) {
      ticketsQuery = collection(db, 'tickets');
    } else {
      ticketsQuery = query(collection(db, 'tickets'), where('studentId', '==', userId));
    }

    const ticketsUnsub = onSnapshot(ticketsQuery, (snap) => {
      this.supportTickets = snap.docs.map(doc => doc.data() as SupportTicket);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'tickets' user snap listener offline/unauthorized. Operating locally.", error);
    });
    this.userUnsubscribes.push(ticketsUnsub);

    // Sync Invoices
    let invoicesQuery;
    if (role === UserRole.ADMIN) {
      invoicesQuery = collection(db, 'invoices');
    } else {
      invoicesQuery = query(collection(db, 'invoices'), where('studentId', '==', userId));
    }
    const invoicesUnsub = onSnapshot(invoicesQuery, (snap) => {
      this.invoices = snap.docs.map(doc => doc.data() as Invoice);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'invoices' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(invoicesUnsub);

    // Sync Activity Logs
    let logsQuery;
    if (role === UserRole.ADMIN) {
      logsQuery = collection(db, 'activity_logs');
    } else {
      logsQuery = query(collection(db, 'activity_logs'), where('userId', '==', userId));
    }
    const logsUnsub = onSnapshot(logsQuery, (snap) => {
      this.activityLogs = snap.docs.map(doc => doc.data() as ActivityLog).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.notify();
    }, (error) => {
      console.warn("Firestore 'activity_logs' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(logsUnsub);

    // Sync App Notifications
    let notifsQuery;
    if (role === UserRole.ADMIN) {
      notifsQuery = collection(db, 'notifications');
    } else {
      notifsQuery = query(collection(db, 'notifications'), where('userId', 'in', [userId, 'all']));
    }
    const notifsUnsub = onSnapshot(notifsQuery, (snap) => {
      this.appNotifications = snap.docs.map(doc => doc.data() as AppNotification).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.notify();
    }, (error) => {
      console.warn("Firestore 'notifications' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(notifsUnsub);

    // Sync SOPs
    const sopsUnsub = onSnapshot(collection(db, 'sops'), (snap) => {
      this.sops = snap.docs.map(doc => doc.data() as SOP);
      this.notify();
    }, (error) => {
      console.warn("Firestore 'sops' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(sopsUnsub);

    // Sync Assignment Reports
    let reportsQuery;
    if (role === UserRole.ADMIN) {
      reportsQuery = collection(db, 'assignment_reports');
    } else if (role === UserRole.TUTOR) {
      reportsQuery = query(collection(db, 'assignment_reports'), where('tutorId', '==', userId));
    } else {
      reportsQuery = query(collection(db, 'assignment_reports'), where('studentId', '==', userId));
    }
    const reportsUnsub = onSnapshot(reportsQuery, (snap) => {
      this.assignmentReports = snap.docs.map(doc => doc.data() as AssignmentReport).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.notify();
    }, (error) => {
      console.warn("Firestore 'assignment_reports' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(reportsUnsub);

    // Sync Agreements
    let agreementsQuery;
    if (role === UserRole.ADMIN) {
      agreementsQuery = collection(db, 'agreements');
    } else {
      agreementsQuery = query(collection(db, 'agreements'), where('studentId', '==', userId));
    }
    const agreementsUnsub = onSnapshot(agreementsQuery, (snap) => {
      this.agreements = snap.docs.map(doc => doc.data() as Agreement).sort((a,b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      this.notify();
    }, (error) => {
      console.warn("Firestore 'agreements' offline/unauthorized.", error);
    });
    this.userUnsubscribes.push(agreementsUnsub);

    // Sync Triggered Emails (admin only)
    if (role === UserRole.ADMIN) {
      const emailsUnsub = onSnapshot(collection(db, 'emails'), (snap) => {
        this.emails = snap.docs.map(doc => doc.data() as TriggeredEmail).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      }, (error) => {
        console.warn("Firestore 'emails' snapshot listener offline or restricted by security rules. Sandbox state enabled.", error);
      });
      this.userUnsubscribes.push(emailsUnsub);
    }
  }

  // Active chat details stream (nested subcollections)
  subscribeToChatDetails(chatId: string) {
    this.activeChatUnsub.forEach(unsub => unsub());
    this.activeChatUnsub = [];

    // Sync messages subcollection
    const msgQuery = collection(db, 'chats', chatId, 'messages');
    const msgUnsub = onSnapshot(msgQuery, (snap) => {
      const otherMessages = this.messages.filter(m => m.chatId !== chatId);
      const chatMessages = snap.docs.map(doc => doc.data() as Message);
      this.messages = [...otherMessages, ...chatMessages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.notify();
    }, (error) => {
      console.warn(`Firestore messages subcollection listener offline or restricted for chat ${chatId}. Operating in local sandbox state.`, error);
    });
    this.activeChatUnsub.push(msgUnsub);

    // Sync quotes proposal subcollection
    const quotesQuery = collection(db, 'chats', chatId, 'quotes');
    const quotesUnsub = onSnapshot(quotesQuery, (snap) => {
      const otherQuotes = this.quotes.filter(q => q.chatId !== chatId);
      const chatQuotes = snap.docs.map(doc => doc.data() as Quote);
      this.quotes = [...otherQuotes, ...chatQuotes];
      this.notify();
    }, (error) => {
      console.warn(`Firestore quotes subcollection listener offline or restricted for chat ${chatId}. Operating in local sandbox state.`, error);
    });
    this.activeChatUnsub.push(quotesUnsub);
  }

  // Sync React subscriber hooks
  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private startLiveStudentCounter() {
    setInterval(() => {
      this.activeStudentsOnline = Math.max(25, Math.floor(80 + Math.sin(Date.now() / 100000) * 15 + Math.random() * 5));
      this.notify();
    }, 4000);
  }

  // Auth Operations
  async verifyUserEmail(email: string): Promise<boolean> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', user.id), { verified: true });
      this.notify();
      return true;
    } catch (e) {
      console.error("verifyUserEmail error: ", e);
      return false;
    }
  }

  async toggleUserSuspension(userId: string): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    if (user.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') return false;
    try {
      const nextStatus = !user.suspended;
      await updateDoc(doc(db, 'users', user.id), { suspended: nextStatus });
      user.suspended = nextStatus;
      this.notify();
      return true;
    } catch (e) {
      console.error("toggleUserSuspension error: ", e);
      return false;
    }
  }

  async changeUserRole(userId: string, targetRole: UserRole): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    if (user.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') return false;
    try {
      await updateDoc(doc(db, 'users', user.id), { role: targetRole });
      user.role = targetRole;
      this.notify();
      return true;
    } catch (e) {
      console.error("changeUserRole error: ", e);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    if (user.email.toLowerCase().trim() === 'shaka.ahmadd@gmail.com') return false;
    try {
      await deleteDoc(doc(db, 'users', userId));
      this.users = this.users.filter(u => u.id !== userId);
      this.notify();
      return true;
    } catch (e) {
      console.error("deleteUser error: ", e);
      return false;
    }
  }

  async updateUserProfile(userId: string, updatedData: Partial<User>): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', userId), updatedData);
      Object.assign(user, updatedData);
      this.notify();
      return true;
    } catch (e) {
      console.error("updateUserProfile error: ", e);
      return false;
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      this.chats = this.chats.filter(c => c.id !== chatId);
      this.notify();
      return true;
    } catch (e) {
      console.error("deleteChat error: ", e);
      return false;
    }
  }

  // Assign tutor to assignment
  async assignTutorToAssignment(assignmentId: string, tutorId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'assignments', assignmentId), { tutorId });
      const tutor = this.users.find(u => u.id === tutorId);
      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Assigned Tutor ${tutor?.name || tutorId} to Assignment #${assignmentId}`
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("assignTutorToAssignment error: ", e);
      return false;
    }
  }

  // Set assignment pricing
  async setAssignmentPrice(assignmentId: string, price: number): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'assignments', assignmentId), { quoteAmount: price });
      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Set Assignment Price for #${assignmentId} to $${price}`
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("setAssignmentPrice error: ", e);
      return false;
    }
  }

  // Settle invoice payment status
  async settleInvoice(invoiceId: string, status: Invoice['status']): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'invoices', invoiceId), { status });
      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Settled Invoice #${invoiceId} Status to ${status.toUpperCase()}`
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("settleInvoice error: ", e);
      return false;
    }
  }

  // Create Invoice
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Promise<string> {
    const id = 'inv_' + Math.random().toString(36).substr(2, 9);
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'invoices', id), newInvoice);
      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Created Invoice #${id} for student ${invoiceData.studentName}`,
        `Amount: $${invoiceData.totalAmount}, Due Date: ${invoiceData.dueDate}`
      );
      this.notify();
      return id;
    } catch (e) {
      console.error("createInvoice error:", e);
      throw e;
    }
  }

  // General Notification Sender
  async sendAppNotification(title: string, message: string, targetUserId: string, type: 'email' | 'webapp' | 'both'): Promise<boolean> {
    const id = 'notif_' + Math.random().toString(36).substr(2, 9);
    const newNotif: AppNotification = {
      id,
      userId: targetUserId,
      title,
      message,
      type,
      sentBy: this.currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
      read: false
    };
    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
      
      if (type === 'email' || type === 'both') {
        const targetUser = this.users.find(u => u.id === targetUserId);
        const emailAddr = targetUser ? targetUser.email : 'broadcast-network@academic.org';
        console.log(`[SMTP SIMULATION] Academic mail sent to ${emailAddr}: Title: ${title}`);
      }

      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Sent Notification (${type.toUpperCase()}) to: ${targetUserId === 'all' ? 'All Users' : targetUserId}`,
        `Title: ${title}`
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("sendAppNotification error:", e);
      return false;
    }
  }

  // Missing payment trigger
  async sendMissingPaymentNotification(invoiceId: string): Promise<boolean> {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return false;
    const title = `🚨 OVERDUE BALANCE PAYMENT ALERT: Invoice #${invoiceId}`;
    const message = `Dear ${invoice.studentName}, you have an outstanding balance payment of $${invoice.balanceAmount} due on ${invoice.dueDate} for academic guidance service: ${invoice.serviceSubject}. Please settle your invoice inside your accounting portal.`;
    return this.sendAppNotification(title, message, invoice.studentId, 'both');
  }

  // Activity Log
  async logActivity(userId: string, userName: string, role: UserRole, action: string, details?: string): Promise<boolean> {
    const id = 'log_' + Math.random().toString(36).substr(2, 9);
    const newLog: ActivityLog = {
      id,
      userId,
      userName,
      userRole: role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'activity_logs', id), newLog);
      this.notify();
      return true;
    } catch (e) {
      console.error("logActivity error:", e);
      return false;
    }
  }

  // Assignments reports from tutors to admin
  async createAssignmentReport(reportData: Omit<AssignmentReport, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const id = 'rep_' + Math.random().toString(36).substr(2, 9);
    const newReport: AssignmentReport = {
      ...reportData,
      id,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'assignment_reports', id), newReport);
      await this.logActivity(
        reportData.tutorId,
        reportData.tutorName,
        UserRole.TUTOR,
        `Submitted Assignment Report for Project #${reportData.assignmentId}`
      );
      this.notify();
      return id;
    } catch (e) {
      console.error("createAssignmentReport error:", e);
      throw e;
    }
  }

  // Approve / revise report
  async updateAssignmentReportStatus(reportId: string, status: AssignmentReport['status'], feedback?: string): Promise<boolean> {
    try {
      const updateObj: Partial<AssignmentReport> = { status };
      if (feedback !== undefined) {
        updateObj.feedbackFromAdmin = feedback;
      }
      await updateDoc(doc(db, 'assignment_reports', reportId), updateObj);

      await this.logActivity(
        this.currentUser?.id || 'admin',
        this.currentUser?.name || 'Admin',
        UserRole.ADMIN,
        `Updated Report #${reportId} Status to: ${status.toUpperCase()}`,
        feedback
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("updateAssignmentReportStatus error: ", e);
      return false;
    }
  }

  // Agreements System
  async createAgreement(agreementData: Omit<Agreement, 'id' | 'status' | 'sentAt'>): Promise<string> {
    const id = 'agr_' + Math.random().toString(36).substr(2, 9);
    const newAgreement: Agreement = {
      ...agreementData,
      id,
      status: 'pending_signature',
      sentAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'agreements', id), newAgreement);
      await this.logActivity(
        this.currentUser?.id || 'system',
        this.currentUser?.name || 'System',
        this.currentUser?.role || UserRole.ADMIN,
        `Created Agreement #${id} for student ${agreementData.studentName}`,
        `Title: ${agreementData.title}`
      );
      this.notify();
      return id;
    } catch (e) {
      console.error("createAgreement error:", e);
      throw e;
    }
  }

  // Sign agreement from student side
  async signAgreement(agreementId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'agreements', agreementId), {
        status: 'signed',
        signedAt: new Date().toISOString()
      });
      await this.logActivity(
        this.currentUser?.id || 'student',
        this.currentUser?.name || 'Student',
        UserRole.STUDENT,
        `Signed Agreement #${agreementId}`
      );
      this.notify();
      return true;
    } catch (e) {
      console.error("signAgreement error: ", e);
      return false;
    }
  }

  async resetUserPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) return false;
    const storedToken = user.resetToken ? user.resetToken.trim().toUpperCase() : '';
    const givenToken = token.trim().toUpperCase();
    if (!storedToken || storedToken !== givenToken) return false;

    try {
      await updateDoc(doc(db, 'users', user.id), { 
        password: newPassword,
        resetToken: ''
      });
      this.notify();
      return true;
    } catch (e) {
      console.error("resetUserPassword error: ", e);
      return false;
    }
  }

  async setResetToken(email: string, token: string): Promise<boolean> {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', user.id), { resetToken: token });
      this.notify();
      return true;
    } catch (e) {
      console.error("setResetToken error: ", e);
      return false;
    }
  }

  login(email: string): boolean {
    const user = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (user) {
      if (user.role === UserRole.STUDENT && user.verified === false) {
        user.verified = true;
        updateDoc(doc(db, 'users', user.id), { verified: true }).catch(() => {});
      }
      this.currentUser = user;
      localStorage.setItem('ut_current_user', JSON.stringify(user));
      this.syncUserCollections(user.id, user.role);
      this.notify();
      return true;
    }
    return false;
  }

  register(name: string, email: string, role: UserRole, extra?: Partial<User>): boolean {
    const exists = this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (exists) return false;

    const newId = auth.currentUser?.uid || (role + '_' + Math.random().toString(36).substr(2, 9));

    const newUser: User = {
      id: newId,
      role,
      name,
      email: email.toLowerCase().trim(),
      avatarUrl: `https://images.unsplash.com/photo-${role === UserRole.TUTOR ? '1534528741775-53994a69daeb' : '1539571696357-5a69c17a65c6'}?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      verified: true,
      ...extra
    };

    if (role === UserRole.TUTOR) {
      newUser.rating = 5.0;
      newUser.reviewCount = 0;
      newUser.hourlyRate = extra?.hourlyRate || 30;
      newUser.subjects = extra?.subjects || ['General Tutoring'];
      newUser.bio = extra?.bio || 'Highly dedicated academic advisor.';
      newUser.country = extra?.country || 'US';
      newUser.availableSlots = [
        new Date().toISOString().split('T')[0] + 'T14:00:00.000Z',
        new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00.000Z'
      ];
    }

    setDoc(doc(db, 'users', newId), newUser)
      .then(() => {
        if (role === UserRole.STUDENT && newUser.verified === false) {
          this.syncUserCollections(newId, role);
        } else {
          this.currentUser = newUser;
          localStorage.setItem('ut_current_user', JSON.stringify(newUser));
          this.syncUserCollections(newId, role);
        }
        this.notify();
      })
      .catch((error) => {
        handleFirestoreError(error, OperationType.CREATE, `users/${newId}`);
      });

    return true;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('ut_current_user');
    this.userUnsubscribes.forEach(unsub => unsub());
    this.userUnsubscribes = [];
    this.activeChatUnsub.forEach(unsub => unsub());
    this.activeChatUnsub = [];
    this.notify();
  }

  // Chats creation
  getOrCreateChat(studentId: string, tutorId: string, subject: string = 'General Tutorial'): Chat {
    let chat = this.chats.find(c => c.studentId === studentId && c.tutorId === tutorId);
    if (!chat) {
      const chatId = 'chat_' + Math.random().toString(36).substr(2, 9);
      chat = {
        id: chatId,
        studentId,
        tutorId,
        subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDoc(doc(db, 'chats', chatId), chat)
        .then(() => {
          this.sendMessage(
            chatId, 
            'system', 
            'Connection established. Students can now discuss assignment details or schedule 1-on-1 tutoring. Tutors can use the Quote panel to issue pricing.'
          );
        })
        .catch(error => {
          handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}`);
        });
    }
    return chat;
  }

  async sendMessage(chatId: string, senderId: string, content: string, fileUrl?: string, fileName?: string) {
    const msgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id: msgId,
      chatId,
      senderId,
      content,
      fileUrl,
      fileName,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      await setDoc(doc(db, 'chats', chatId, 'messages', msgId), sanitizeDocData(newMessage));
      await updateDoc(doc(db, 'chats', chatId), sanitizeDocData({ updatedAt: new Date().toISOString() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/messages/${msgId}`);
    }
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    const unreadMessages = this.messages.filter(
      m => m.chatId === chatId && m.senderId !== userId && !m.read
    );
    for (const msg of unreadMessages) {
      try {
        await updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { read: true });
      } catch (err) {
        console.warn(`Could not update message ${msg.id} read status`, err);
      }
    }
  }

  async setTypingStatus(chatId: string, role: UserRole, isTyping: boolean) {
    try {
      const payload: Partial<Chat> = {};
      if (role === UserRole.STUDENT) {
        payload.studentIsTyping = isTyping;
      } else if (role === UserRole.TUTOR) {
        payload.tutorIsTyping = isTyping;
      }
      await updateDoc(doc(db, 'chats', chatId), payload);
    } catch (err) {
      console.warn(`Could not update typing status for chat ${chatId}`, err);
    }
  }

  // Quotes Workflow
  async offerQuote(
    chatId: string, 
    amount: number, 
    estimatedHours: number, 
    serviceType: string = 'Assignment Tutoring', 
    deliveryTime: string = '3 days', 
    scopeOfWork: string = 'Comprehensive academic support',
    advancePercentage?: number,
    advanceAmount?: number,
    balanceAmount?: number
  ) {
    // Decline other pending local quotes in firestore
    const pendingQuotes = this.quotes.filter(q => q.chatId === chatId && q.status === 'pending');
    for (const q of pendingQuotes) {
      try {
        await updateDoc(doc(db, 'chats', chatId, 'quotes', q.id), { status: 'declined' });
      } catch (e) {
        console.error("Decline old quote warn: ", e);
      }
    }

    const quoteId = 'quote_' + Math.random().toString(36).substr(2, 9);
    const newQuote: Quote = {
      id: quoteId,
      chatId,
      amount,
      estimatedHours,
      status: 'pending',
      serviceType,
      deliveryTime,
      scopeOfWork,
      advancePercentage,
      advanceAmount,
      balanceAmount,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'chats', chatId, 'quotes', quoteId), newQuote);
      
      let splitMessage = '';
      if (advanceAmount !== undefined && balanceAmount !== undefined && advancePercentage !== undefined) {
        splitMessage = `\n*Decision split:* **${advancePercentage}% paid upfront as advance ($${advanceAmount} USD)**, and remaining **balance ($${balanceAmount} USD) paid after work is done**.`;
      }

      await this.sendMessage(
        chatId, 
        'system', 
        `Tutor has offered a binding custom quote: **$${amount} USD** for **${serviceType}** (${estimatedHours} hrs, delivery in ${deliveryTime}).${splitMessage}\n*Scope:* ${scopeOfWork}.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/quotes/${quoteId}`);
    }
  }

  async acceptQuote(quoteId: string, stripePaymentIntent: string = 'pi_simulated_' + Math.random().toString(36).substr(2, 12)) {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) return;

    try {
      await updateDoc(doc(db, 'chats', quote.chatId, 'quotes', quoteId), { status: 'accepted' });

      // Create Assignment
      const chat = this.chats.find(c => c.id === quote.chatId);
      if (!chat) return;

      const matchedTutor = this.users.find(u => u.id === chat.tutorId);
      const assignId = 'assign_' + Math.random().toString(36).substr(2, 9);
      const newAssignment: Assignment = {
        id: assignId,
        studentId: chat.studentId,
        tutorId: chat.tutorId,
        title: `${quote.serviceType || 'Custom Tutoring'} Task`,
        subject: matchedTutor?.subjects?.[0] || 'Academic Mentoring',
        deadline: quote.deliveryTime || '3 days',
        wordCount: 1000,
        referenceStyle: 'APA Style',
        sourcesCount: 3,
        instructions: quote.scopeOfWork || `Specialized support discussed in chat logs of ${chat.subject}.`,
        fileUrls: [],
        status: AssignmentStatus.IN_PROGRESS,
        progressPercent: 10,
        quoteAmount: quote.amount,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'assignments', assignId), newAssignment);

      const hasSplit = quote.advanceAmount !== undefined && quote.balanceAmount !== undefined;

      if (hasSplit) {
        // Create Advance Payment (Charged upfront & immediately disbursed)
        const advancePaymentId = 'pay_adv_' + Math.random().toString(36).substr(2, 9);
        const advancePayment: Payment = {
          id: advancePaymentId,
          assignmentId: assignId,
          amount: quote.advanceAmount!,
          status: 'released', // released/completed advance payment
          stripePaymentIntent: stripePaymentIntent + '_adv',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'payments', advancePaymentId), advancePayment);

        // Create Remaining Balance Payment (Held in escrow until tutor completes/student approves)
        const balancePaymentId = 'pay_bal_' + Math.random().toString(36).substr(2, 9);
        const balancePayment: Payment = {
          id: balancePaymentId,
          assignmentId: assignId,
          amount: quote.balanceAmount!,
          status: 'escrow', // locked in escrow
          stripePaymentIntent: stripePaymentIntent + '_bal',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'payments', balancePaymentId), balancePayment);

        await this.sendMessage(
          chat.id, 
          'system', 
          `Upfront payment of **$${quote.advanceAmount}** (${quote.advancePercentage}%) completed and released to Tutor! Remaining balance of **$${quote.balanceAmount}** is locked in secure ESCROW. Tutor is now actively working on assignment **#${assignId}**.`
        );
      } else {
        // Create standard Payment escrow
        const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
        const newPayment: Payment = {
          id: paymentId,
          assignmentId: assignId,
          amount: quote.amount,
          status: 'escrow',
          stripePaymentIntent,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'payments', paymentId), newPayment);

        await this.sendMessage(
          chat.id, 
          'system', 
          `Payment of **$${quote.amount}** completed successfully via secure Stripe gateway! Funds are locked in ESCROW. Tutor is now actively working on assignment **#${assignId}**.`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${quoteId}`);
    }
  }

  // Assignment submissions
  async submitAssignment(assignmentData: Omit<Assignment, 'id' | 'status' | 'progressPercent' | 'createdAt'>) {
    const id = 'assign_' + Math.random().toString(36).substr(2, 9);
    const newAssign: Assignment = {
      ...assignmentData,
      id,
      status: AssignmentStatus.PENDING,
      progressPercent: 0,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'assignments', id), newAssign);

      if (newAssign.tutorId) {
        const chat = this.getOrCreateChat(newAssign.studentId, newAssign.tutorId, newAssign.title);
        await this.sendMessage(
          chat.id, 
          'system', 
          `Student submitted a structured Assignment checklist **"${newAssign.title}"** (Ref: #${id}). Discuss final payment quote now!`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assignments/${id}`);
    }

    return id;
  }

  async updateAssignmentProgress(assignId: string, progressPercent: number, status?: AssignmentStatus) {
    const updateData: any = { progressPercent };
    if (status) {
      updateData.status = status;
    }

    try {
      await updateDoc(doc(db, 'assignments', assignId), updateData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${assignId}`);
    }
  }

  async tutorDeliverWork(assignId: string, fileUrl: string, fileName: string) {
    const assign = this.assignments.find(a => a.id === assignId);
    if (!assign) return;

    try {
      await updateDoc(doc(db, 'assignments', assignId), {
        tutorWorkFileUrl: fileUrl,
        tutorWorkFileName: fileName,
        status: AssignmentStatus.COMPLETED,
        progressPercent: 100
      });

      const chat = this.chats.find(c => c.studentId === assign.studentId && c.tutorId === assign.tutorId);
      if (chat) {
        await this.sendMessage(
          chat.id, 
          'system', 
          `Tutor has uploaded completed academic work **"${fileName}"**! Review on your student dashboard and approve to release payment.`, 
          fileUrl, 
          fileName
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${assignId}`);
    }
  }

  async studentReviewAndApprove(assignId: string, rating?: number, reviewComment?: string) {
    const assign = this.assignments.find(a => a.id === assignId);
    if (!assign) return;

    try {
      await updateDoc(doc(db, 'assignments', assignId), { reviewed: true });

      const paymentsToRelease = this.payments.filter(p => p.assignmentId === assignId && p.status === 'escrow');
      for (const p of paymentsToRelease) {
        await updateDoc(doc(db, 'payments', p.id), { status: 'released' });
      }

      if (rating && assign.tutorId) {
        const tutor = this.users.find(u => u.id === assign.tutorId);
        if (tutor) {
          const student = this.users.find(u => u.id === assign.studentId);
          const newReview: Review = {
            id: 'review_' + Math.random().toString(36).substr(2, 9),
            tutorId: assign.tutorId,
            studentName: student?.name || 'Academic Student',
            studentAvatar: student?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
            rating,
            comment: reviewComment || 'Excellent and highly professional tutoring session!',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'reviews', newReview.id), newReview);

          const allTutorReviews = this.reviews.filter(r => r.tutorId === assign.tutorId);
          const updatedReviews = [...allTutorReviews, newReview];
          const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const avgRating = parseFloat((sum / updatedReviews.length).toFixed(1));

          await updateDoc(doc(db, 'users', assign.tutorId), {
            rating: avgRating,
            reviewCount: updatedReviews.length
          });
        }
      }

      const chat = this.chats.find(c => c.studentId === assign.studentId && c.tutorId === assign.tutorId);
      if (chat) {
        await this.sendMessage(
          chat.id, 
          'system', 
          `Student has approved the completion of Assignment **#${assign.id}**. Refund period has ended. Payment released to tutor!`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${assignId}`);
    }
  }

  async studentRequestRevision(assignId: string, revisionDetails: string) {
    const assign = this.assignments.find(a => a.id === assignId);
    if (!assign) return;

    try {
      await updateDoc(doc(db, 'assignments', assignId), {
        status: AssignmentStatus.REVISION,
        progressPercent: 85
      });

      const chat = this.chats.find(c => c.studentId === assign.studentId && c.tutorId === assign.tutorId);
      if (chat) {
        await this.sendMessage(
          chat.id, 
          'system', 
          `Student requested FREE academic revision on Assignment **#${assign.id}**:\n*Description:* ${revisionDetails}`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${assignId}`);
    }
  }

  // Admin CRUD for blogs
  async addBlog(title: string, content: string, image: string, category: string, tags: string[], adminId: string) {
    const blogId = 'blog_' + Math.random().toString(36).substr(2, 9);
    const newBlog: Blog = {
      id: blogId,
      adminId,
      title,
      content,
      image: image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      category: category || 'Academic News',
      tags: tags.length > 0 ? tags : ['Tutoring'],
      publishedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'blogs', blogId), newBlog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `blogs/${blogId}`);
    }
    return newBlog;
  }

  async deleteBlog(blogId: string) {
    try {
      await deleteDoc(doc(db, 'blogs', blogId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blogs/${blogId}`);
    }
  }

  async updateBlog(blogId: string, title: string, content: string, image: string, category: string, tags: string[]) {
    try {
      await updateDoc(doc(db, 'blogs', blogId), {
        title,
        content,
        image: image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        category: category || 'Academic News',
        tags: tags.length > 0 ? tags : ['Tutoring']
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `blogs/${blogId}`);
    }
  }

  // Admin CRUD for FAQs
  async addFaq(question: string, answer: string, category: FAQ['category']) {
    const faqId = 'faq_' + Math.random().toString(36).substr(2, 9);
    const newFaq: FAQ = {
      id: faqId,
      question,
      answer,
      category,
      order: this.faqs.length + 1
    };

    try {
      await setDoc(doc(db, 'faqs', faqId), newFaq);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `faqs/${faqId}`);
    }
    return newFaq;
  }

  async deleteFaq(faqId: string) {
    try {
      await deleteDoc(doc(db, 'faqs', faqId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `faqs/${faqId}`);
    }
  }

  async suspendUser(userId: string) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (this.currentUser?.id === userId) {
        this.logout();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  }

  async raiseTicket(studentId: string, subject: string, message: string) {
    const id = 'ticket_' + Math.random().toString(36).substr(2, 9);
    const ticket: SupportTicket = {
      id,
      studentId,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'tickets', id), ticket);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tickets/${id}`);
    }
    return ticket;
  }

  async resolveTicket(ticketId: string) {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), { status: 'resolved' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tickets/${ticketId}`);
    }
  }

  async adminProcessRefund(assignmentId: string) {
    const payment = this.payments.find(p => p.assignmentId === assignmentId);
    if (payment) {
      try {
        await updateDoc(doc(db, 'payments', payment.id), { status: 'refunded' });
      } catch (err) {
        console.error("Refund pay failed: ", err);
      }
    }
    const assign = this.assignments.find(a => a.id === assignmentId);
    if (assign) {
      try {
        await updateDoc(doc(db, 'assignments', assignmentId), { status: AssignmentStatus.PENDING });
      } catch (err) {
        console.error("Refund assignment reset failed: ", err);
      }
    }
  }

  async sendTriggerEmail(recipientEmail: string, subject: string, htmlBody: string, textBody?: string): Promise<boolean> {
    const id = 'email_' + Math.random().toString(36).substr(2, 9);
    const newEmail: TriggeredEmail = {
      id,
      to: recipientEmail,
      message: {
        subject,
        html: htmlBody,
        text: textBody || htmlBody.replace(/<[^>]*>?/gm, '')
      },
      status: {
        state: 'PENDING'
      },
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'emails', id), newEmail);
      
      if (!this.emails.some(e => e.id === id)) {
        this.emails = [newEmail, ...this.emails];
        this.notify();
      }

      // Live 3-stage Firebase extension workflow simulation
      setTimeout(async () => {
        try {
          const docRef = doc(db, 'emails', id);
          const processingUpdate: TriggeredEmail = {
            ...newEmail,
            status: {
              state: 'PROCESSING'
            }
          };
          await setDoc(docRef, processingUpdate);
          
          this.emails = this.emails.map(e => e.id === id ? processingUpdate : e);
          this.notify();

          setTimeout(async () => {
            const successUpdate: TriggeredEmail = {
              ...newEmail,
              status: {
                state: 'SUCCESS',
                sentAt: new Date().toISOString()
              }
            };
            await setDoc(docRef, successUpdate);

            await this.logActivity(
              this.currentUser?.id || 'admin',
              this.currentUser?.name || 'Admin',
              UserRole.ADMIN,
              `Triggered Email Success`,
              `Dispatched email securely to ${recipientEmail} with subject: "${subject}"`
            );

            this.emails = this.emails.map(e => e.id === id ? successUpdate : e);
            this.notify();
          }, 1500);

        } catch (e) {
          console.warn("Emails background simulation write restricted:", e);
        }
      }, 1000);

      await this.logActivity(
        this.currentUser?.id || 'admin',
        this.currentUser?.name || 'Admin',
        UserRole.ADMIN,
        `Triggered Email Dispatched (PENDING)`,
        `Recipients: ${recipientEmail} - Title: ${subject}`
      );

      return true;
    } catch (err) {
      console.error("sendTriggerEmail error: ", err);
      if (!this.emails.some(e => e.id === id)) {
        this.emails = [newEmail, ...this.emails];
        this.notify();
      }
      return true;
    }
  }
}

export const store = new AppStore();
