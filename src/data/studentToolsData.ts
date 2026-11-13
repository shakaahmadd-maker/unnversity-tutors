import tutorWritingImg from '../assets/images/tutor_academic_writing_1794552322265.jpg';
import tutorStemImg from '../assets/images/tutor_stem_statistics_1794552322797.jpg';
import tutorAdmissionsImg from '../assets/images/tutor_admissions_career_1794552324260.jpg';
import tutorLanguagesImg from '../assets/images/tutor_languages_german_1794552324409.jpg';

export type ToolCategory =
  | 'All'
  | 'PDF & Docs'
  | 'Writing & Citations'
  | 'Math & Charts'
  | 'Image Tools'
  | 'Study & GPA';

export type TutorBrandingGroup = 'writing' | 'stem' | 'admissions' | 'language';

export type ToolSlug =
  | 'merge-pdf'
  | 'split-pdf'
  | 'images-to-pdf'
  | 'whiteboard'
  | 'graph-builder'
  | 'graph-theory-network-builder'
  | 'cv-maker'
  | 'image-compressor'
  | 'passport-photo-resizer'
  | 'ocr-image-to-text'
  | 'study-translator'
  | 'citation-generator'
  | 'cgpa-word-pomodoro'
  | 'university-grade-converter'
  | 'academic-paraphraser';

export interface FeaturedTutorCardData {
  id: string;
  name: string;
  initials: string;
  credential: string;
  specialty: string;
  rating: string;
  sessionsCompleted: string;
  avatarUrl: string;
  subjectQuery: string;
}

export interface TutorBrandingConfig {
  group: TutorBrandingGroup;
  kicker: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaNavigateView: string;
  tutors: FeaturedTutorCardData[];
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolHowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

export interface StudentToolDefinition {
  slug: ToolSlug;
  path: `/tools/${ToolSlug}`;
  viewKey: `tools/${ToolSlug}`;
  name: string;
  shortName: string;
  category: Exclude<ToolCategory, 'All'>;
  tutorGroup: TutorBrandingGroup;
  seoTitle: string;
  seoDescription: string;
  heroH1: string;
  heroSubtitle: string;
  cardSummary: string;
  iconName:
    | 'Files'
    | 'Scissors'
    | 'FileImage'
    | 'PenTool'
    | 'BarChart3'
    | 'FileUser'
    | 'Minimize2'
    | 'ScanFace'
    | 'ScanText'
    | 'Languages'
    | 'Quote'
    | 'GraduationCap'
    | 'Network'
    | 'Globe'
    | 'BookCheck';
  keywords: string[];
  howItWorks: [ToolHowItWorksStep, ToolHowItWorksStep, ToolHowItWorksStep];
  faqs: ToolFaqItem[];
  relatedSlugs: [ToolSlug, ToolSlug, ToolSlug];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  'All',
  'PDF & Docs',
  'Writing & Citations',
  'Math & Charts',
  'Image Tools',
  'Study & GPA',
];

export const TUTOR_BRANDING_MAP: Record<TutorBrandingGroup, TutorBrandingConfig> = {
  writing: {
    group: 'writing',
    kicker: '1-on-1 Academic Writing & Research Mentorship',
    headline: "Finishing an Essay or Research Paper? Get 1-on-1 Feedback from PhD & Master's Tutors",
    subtext:
      'Work directly with verified university mentors for thesis structure, critical argument review, literature synthesis, and flawless APA/MLA/Harvard referencing.',
    ctaLabel: 'Find an Academic Writing Tutor →',
    ctaNavigateView: 'subject:Academic Writing',
    tutors: [
      {
        id: 'featured-writing-1',
        name: 'Dr. Eleanor Vance',
        initials: 'EV',
        credential: 'PhD in Comparative Literature · University of Oxford',
        specialty: 'Dissertations &APA/MLA Essays',
        rating: '5.0',
        sessionsCompleted: '420+ sessions',
        avatarUrl: tutorWritingImg,
        subjectQuery: 'Academic Writing',
      },
      {
        id: 'featured-writing-2',
        name: 'Prof. Arjun Mehta',
        initials: 'AM',
        credential: 'MPhil in Social Policy · LSE',
        specialty: 'Research Proposals & Critical Review',
        rating: '5.0',
        sessionsCompleted: '315+ sessions',
        avatarUrl: tutorAdmissionsImg,
        subjectQuery: 'Essay Writing',
      },
      {
        id: 'featured-writing-3',
        name: 'Dr. Clara Lindqvist',
        initials: 'CL',
        credential: 'PhD in Applied Linguistics · University of Edinburgh',
        specialty: 'Thesis Editing & Citation Formatting',
        rating: '5.0',
        sessionsCompleted: '290+ sessions',
        avatarUrl: tutorLanguagesImg,
        subjectQuery: 'Dissertation',
      },
    ],
  },
  stem: {
    group: 'stem',
    kicker: '1-on-1 STEM, Statistics & Quantitative Coaching',
    headline: 'Struggling with Statistics, Data Analysis, or STEM Coursework? Book a 1-on-1 Session',
    subtext:
      'Master regression models, R/Python data visualization, calculus derivations, and lab report interpretation with patient, top-rated university researchers.',
    ctaLabel: 'Browse STEM & Data Tutors →',
    ctaNavigateView: 'subject:Statistics',
    tutors: [
      {
        id: 'featured-stem-1',
        name: 'Dr. Marcus Chen',
        initials: 'MC',
        credential: 'PhD in Statistical Science · UC Berkeley',
        specialty: 'Biostatistics, SPSS, R & Data Charts',
        rating: '5.0',
        sessionsCompleted: '510+ sessions',
        avatarUrl: tutorStemImg,
        subjectQuery: 'Statistics',
      },
      {
        id: 'featured-stem-2',
        name: 'Dr. Priya Nair',
        initials: 'PN',
        credential: 'MSc in Quantitative Economics · Imperial College',
        specialty: 'Econometrics, Calculus & Linear Algebra',
        rating: '5.0',
        sessionsCompleted: '380+ sessions',
        avatarUrl: tutorWritingImg,
        subjectQuery: 'Mathematics',
      },
      {
        id: 'featured-stem-3',
        name: 'Rohan Kulkarni, MS',
        initials: 'RK',
        credential: 'MSc in Computer Science · ETH Zurich',
        specialty: 'Python, Algorithms & Engineering Labs',
        rating: '5.0',
        sessionsCompleted: '340+ sessions',
        avatarUrl: tutorAdmissionsImg,
        subjectQuery: 'Computer Science',
      },
    ],
  },
  admissions: {
    group: 'admissions',
    kicker: 'University Admissions, Scholarships & Early Careers',
    headline: 'Applying for University Admissions, Scholarships, or Internships? Get Expert Review',
    subtext:
      'Stand out to graduate admissions committees and hiring managers with tailored CV critiques, Statement of Purpose (SOP) coaching, and mock interviews.',
    ctaLabel: 'Book an Admissions & Career Coach →',
    ctaNavigateView: 'service-essay',
    tutors: [
      {
        id: 'featured-adm-1',
        name: 'Siddharth Rao, MBA',
        initials: 'SR',
        credential: 'Former Graduate Admissions Advisor · Oxford Saïd',
        specialty: 'ATS CVs, SOPs & Scholarship Essays',
        rating: '5.0',
        sessionsCompleted: '460+ sessions',
        avatarUrl: tutorAdmissionsImg,
        subjectQuery: 'Admissions',
      },
      {
        id: 'featured-adm-2',
        name: 'Dr. Hannah Brooks',
        initials: 'HB',
        credential: 'PhD Fellow · Columbia University',
        specialty: 'Grad School Applications & Research CVs',
        rating: '5.0',
        sessionsCompleted: '390+ sessions',
        avatarUrl: tutorWritingImg,
        subjectQuery: 'Statement of Purpose',
      },
      {
        id: 'featured-adm-3',
        name: 'Daniel Park, MEng',
        initials: 'DP',
        credential: 'MSc Engineering Management · Cornell University',
        specialty: 'Tech Internships & Graduate Resumes',
        rating: '5.0',
        sessionsCompleted: '275+ sessions',
        avatarUrl: tutorStemImg,
        subjectQuery: 'Career Coaching',
      },
    ],
  },
  language: {
    group: 'language',
    kicker: 'Certified Language & International Exam Mentors',
    headline: 'Need Help with German (A1–B2), Academic English, or Foreign Language Courses?',
    subtext:
      'Practice speaking, academic reading comprehension, TestDaF/Goethe exam prep, and IELTS/TOEFL writing with native university language instructors.',
    ctaLabel: 'Meet Our Language Tutors →',
    ctaNavigateView: 'subject:German',
    tutors: [
      {
        id: 'featured-lang-1',
        name: 'Annika Weber, MA',
        initials: 'AW',
        credential: 'MA in Germanistik · LMU Munich',
        specialty: 'German A1–C1, Goethe & TestDaF Prep',
        rating: '5.0',
        sessionsCompleted: '490+ sessions',
        avatarUrl: tutorLanguagesImg,
        subjectQuery: 'German',
      },
      {
        id: 'featured-lang-2',
        name: 'Dr. Claire Moreau',
        initials: 'CM',
        credential: 'PhD in Modern Languages · Sorbonne & King’s College',
        specialty: 'Academic English, French DELF & IELTS',
        rating: '5.0',
        sessionsCompleted: '365+ sessions',
        avatarUrl: tutorWritingImg,
        subjectQuery: 'English',
      },
      {
        id: 'featured-lang-3',
        name: 'Tariq Al-Mansoor, MA',
        initials: 'TA',
        credential: 'MA in Translation Studies · University of Manchester',
        specialty: 'Arabic, Academic Translation & Rhetoric',
        rating: '5.0',
        sessionsCompleted: '240+ sessions',
        avatarUrl: tutorAdmissionsImg,
        subjectQuery: 'Languages',
      },
    ],
  },
};

export const STUDENT_TOOLS: StudentToolDefinition[] = [
  {
    slug: 'academic-paraphraser',
    path: '/tools/academic-paraphraser',
    viewKey: 'tools/academic-paraphraser',
    name: 'Academic Paraphraser, AI-Pattern Analyzer & Originality Checker',
    shortName: 'Academic Paraphraser & AI Checker',
    category: 'Writing & Citations',
    tutorGroup: 'writing',
    seoTitle:
      'Free Academic Paraphraser, AI-Pattern Analyzer & Originality Checker | University Tutors',
    seoDescription:
      'Refine university essays in 4 academic modes (Natural Human Flow, Scholarly, Concise, Active Voice), check burstiness & AI clichés, and test 3-gram/4-gram source originality 100% locally.',
    heroH1: 'Free Academic Paraphraser, AI-Pattern Analyzer & Originality Checker',
    heroSubtitle:
      'Refine robotic drafts into authentic university prose, diagnose sentence burstiness and LLM clichés in real time, and verify 3-gram/4-gram paraphrase originality against your cited sources.',
    cardSummary:
      '4-mode academic paraphraser, live sentence burstiness & AI cliché detector, and 3-gram/4-gram source originality checker.',
    iconName: 'BookCheck',
    keywords: [
      'academic paraphraser',
      'paraphrasing tool for students',
      'ai pattern analyzer',
      'burstiness checker',
      'originality checker',
      'passive to active voice converter',
      'essay rewriter',
    ],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Paste Draft & Inspect Live AI Stylometry',
        description:
          'Paste your essay paragraph or load a sample draft to measure Human Rhythm (Burstiness σ), Lexical Diversity, and red/amber flagged LLM clichés immediately.',
      },
      {
        stepNumber: '02',
        title: 'Choose from 4 Scholarly Rewrite Modes',
        description:
          'Switch between Natural Human Flow, Scholarly Academic, Concise (Trim Wordiness), and Active Voice while preserving in-text citations like (Author, 2024).',
      },
      {
        stepNumber: '03',
        title: 'Verify N-Gram Source Originality & Export',
        description:
          'Paste any cited reference passage to highlight unparaphrased 3-gram and 4-gram phrase overlaps in amber, then copy or download a clean .txt file.',
      },
    ],
    faqs: [
      {
        question: 'How does the Human Rhythm (Burstiness) score distinguish robotic vs. human prose?',
        answer:
          'Language models frequently produce sentences of nearly identical length (e.g., 17–21 words per sentence with low standard deviation σ). Human scholars naturally alternate concise topic claims with longer analytical clauses—measured locally via Coefficient of Variation and adjacent cadence swing.',
      },
      {
        question: 'Are my unpublished essays or thesis chapters sent to any external server or AI API?',
        answer:
          'Never. Every stylometry calculation, syntactic rewrite, and N-gram similarity comparison executes 100% locally inside your own browser tab with zero server uploads and zero API tracking.',
      },
      {
        question: 'How does the Reference Source N-Gram Originality Checker prevent accidental plagiarism?',
        answer:
          'When you paste the journal or textbook passage you are citing, the checker scans for verbatim 3-word and 4-word sequences shared with your paraphrase and highlights them in amber so you can restructure those clauses into genuinely independent academic prose.',
      },
      {
        question: 'Do I still need an in-text citation after paraphrasing a source to 0% phrase overlap?',
        answer:
          'Yes. Under university academic integrity rules (APA, MLA, Harvard, Chicago, IEEE), paraphrasing puts an author’s evidence into your own words and structure, which always requires an accompanying citation crediting the original researcher.',
      },
    ],
    relatedSlugs: ['citation-generator', 'cgpa-word-pomodoro', 'study-translator'],
  },
  {
    slug: 'merge-pdf',
    path: '/tools/merge-pdf',
    viewKey: 'tools/merge-pdf',
    name: 'Free PDF Merger',
    shortName: 'Merge PDF Online',
    category: 'PDF & Docs',
    tutorGroup: 'writing',
    seoTitle: 'Free Online PDF Merger for Students — Combine Assignments | University Tutors',
    seoDescription:
      'Combine multiple assignment PDFs, cover sheets, and appendices in seconds. 100% free, private browser-based PDF merger with zero watermarks or sign-ups.',
    heroH1: 'Free Online PDF Merger for Students — Combine Assignments Instantly',
    heroSubtitle:
      'Merge cover pages, coursework chapters, lab appendices, and scanned problem sets into a single submission-ready PDF directly in your browser.',
    cardSummary: 'Combine multiple assignment PDFs, reorder chapters, and download one submission-ready file.',
    iconName: 'Files',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'assignment pdf', 'cover sheet'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Select or Drop PDFs',
        description: 'Add two or more assignment chapters, cover pages, or reference appendices from your device.',
      },
      {
        stepNumber: '02',
        title: 'Arrange Submission Order',
        description: 'Move files up or down so your title page, main essay, and bibliography appear in exact sequence.',
      },
      {
        stepNumber: '03',
        title: 'Merge & Download Free',
        description: 'Generate a clean, watermark-free combined PDF ready for Canvas, Blackboard, Moodle, or Turnitin.',
      },
    ],
    faqs: [
      {
        question: 'Are my university assignments uploaded to an external server when merging?',
        answer:
          'No. Every PDF file is merged 100% locally inside your web browser using WebAssembly/JavaScript memory. Your unpublished essays, theses, and transcripts never leave your computer.',
      },
      {
        question: 'Does the merged PDF preserve original fonts, equations, and page formatting?',
        answer:
          'Yes. Because pages are copied losslessly at the document object level without re-rasterizing text, LaTeX math symbols, vector figures, and selectable text remain crisp for Turnitin and grading.',
      },
      {
        question: 'Is there a watermark or limit on how many PDFs I can combine?',
        answer:
          'There are zero watermarks, zero sign-up walls, and no daily merge caps. You can combine as many coursework files as your browser memory supports.',
      },
    ],
    relatedSlugs: ['split-pdf', 'images-to-pdf', 'citation-generator'],
  },
  {
    slug: 'split-pdf',
    path: '/tools/split-pdf',
    viewKey: 'tools/split-pdf',
    name: 'Free PDF Splitter & Page Extractor',
    shortName: 'Split & Extract PDF',
    category: 'PDF & Docs',
    tutorGroup: 'writing',
    seoTitle: 'Free PDF Splitter & Page Extractor for Textbooks & Lectures | University Tutors',
    seoDescription:
      'Extract exact page ranges or chapters from bulky textbooks, syllabi, and lecture PDFs locally in your browser. Fast, private, and free with no sign-up.',
    heroH1: 'Free PDF Splitter & Page Extractor — Pull Exact Chapters Instantly',
    heroSubtitle:
      'Extract required reading chapters, specific problem-set pages, or individual signed forms from large PDFs without uploading a single byte.',
    cardSummary: 'Extract exact page numbers or chapter ranges from bulky textbooks and lecture decks.',
    iconName: 'Scissors',
    keywords: ['split pdf', 'extract pdf pages', 'cut pdf', 'chapter extractor', 'pdf range'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Load Your Source PDF',
        description: 'Choose any lecture slide deck, e-textbook, or multi-page scan to inspect its exact page count.',
      },
      {
        stepNumber: '02',
        title: 'Enter Page Numbers or Ranges',
        description: 'Type flexible ranges such as "1-4, 8, 12-15" or select quick presets like First Page or Odd Pages.',
      },
      {
        stepNumber: '03',
        title: 'Download Extracted PDF',
        description: 'Save a lightweight PDF containing only the exact pages you selected in original resolution.',
      },
    ],
    faqs: [
      {
        question: 'How do I format custom page ranges when extracting chapters?',
        answer:
          'Separate individual pages or ranges with commas—for example, entering "1, 4-9, 14" builds a new PDF containing page 1, pages 4 through 9, and page 14 in that order.',
      },
      {
        question: 'Can I extract a single page from a 500-page reference PDF?',
        answer:
          'Yes. Large academic PDFs load directly in local browser memory so extracting a single rubric page or formula sheet takes less than a second.',
      },
      {
        question: 'Will splitting a PDF alter my original textbook file?',
        answer:
          'Never. Your original file remains untouched on your device while a separate extracted copy is downloaded.',
      },
    ],
    relatedSlugs: ['merge-pdf', 'images-to-pdf', 'ocr-image-to-text'],
  },
  {
    slug: 'images-to-pdf',
    path: '/tools/images-to-pdf',
    viewKey: 'tools/images-to-pdf',
    name: 'Images & Notes to PDF Converter',
    shortName: 'Images to PDF Converter',
    category: 'PDF & Docs',
    tutorGroup: 'writing',
    seoTitle: 'Free Images & Handwritten Notes to A4 PDF Converter | University Tutors',
    seoDescription:
      'Convert JPG and PNG photos of handwritten math derivations, whiteboard notes, and lab worksheets into a clean A4 PDF for university portal submission.',
    heroH1: 'Convert Lecture Photos & Handwritten Notes into Clean A4 PDFs',
    heroSubtitle:
      'Turn phone snapshots of handwritten calculus proofs, chemistry diagrams, and notebook pages into a neatly centered, submission-ready A4 PDF.',
    cardSummary: 'Convert JPG/PNG photos of handwritten math & lecture notes into a neat multi-page A4 PDF.',
    iconName: 'FileImage',
    keywords: ['jpg to pdf', 'png to pdf', 'images to pdf', 'notes to pdf', 'handwritten scan pdf'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Upload Note Snapshots',
        description: 'Select multiple JPG or PNG images from your phone or laptop in one batch.',
      },
      {
        stepNumber: '02',
        title: 'Verify Page Sequence & Margins',
        description: 'Preview thumbnails, reorder pages so derivations read logically, and select A4 margin padding.',
      },
      {
        stepNumber: '03',
        title: 'Generate Submission A4 PDF',
        description: 'Download a single multi-page A4 PDF automatically scaled without cropping equations.',
      },
    ],
    faqs: [
      {
        question: 'Will portrait and landscape photos both fit cleanly onto A4 pages?',
        answer:
          'Yes. Each image is proportionally scaled to fit inside standard A4 dimensions (595 × 842 pt) with clean white margins so no handwritten notes at the edges are cut off.',
      },
      {
        question: 'Which image formats are supported?',
        answer:
          'Standard JPG/JPEG and PNG images work out of the box, and any other browser-supported photo is automatically normalized via HTML5 Canvas.',
      },
      {
        question: 'Can I reorder pages before generating the PDF?',
        answer:
          'Yes—use the Move Left/Up and Move Right/Down buttons on each thumbnail card to ensure every page is in sequence before downloading.',
      },
    ],
    relatedSlugs: ['merge-pdf', 'image-compressor', 'ocr-image-to-text'],
  },
  {
    slug: 'whiteboard',
    path: '/tools/whiteboard',
    viewKey: 'tools/whiteboard',
    name: 'Online Student Whiteboard',
    shortName: 'Online Digital Whiteboard',
    category: 'Math & Charts',
    tutorGroup: 'stem',
    seoTitle: 'Free Online Student Whiteboard — Diagrams, Mind Maps & Math | University Tutors',
    seoDescription:
      'High-DPI digital study whiteboard for sketching math derivations, organic chemistry mechanisms, system diagrams, and mind maps with 1-click PNG export.',
    heroH1: 'Free Online Student Whiteboard for Diagrams, Equations & Mind Maps',
    heroSubtitle:
      'Sketch freehand problem sets, highlight key formulas, draw geometric vectors and flowcharts on a crisp Retina canvas, and export transparent or grid PNGs.',
    cardSummary: 'High-DPI canvas with pen, highlighter, shapes, arrows, text labels, and instant PNG export.',
    iconName: 'PenTool',
    keywords: ['whiteboard', 'drawing board', 'mind map', 'sketch math', 'diagram canvas'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Pick Drawing or Shape Tool',
        description: 'Switch effortlessly between Freehand Pen, Highlighter, Eraser, Arrows, Rectangles, Circles, and Text.',
      },
      {
        stepNumber: '02',
        title: 'Sketch on Crisp Study Grid',
        description: 'Adjust stroke thickness (2px–24px), select academic ink colors, and use Undo/Redo freely.',
      },
      {
        stepNumber: '03',
        title: 'Export High-DPI PNG',
        description: 'Download your finished diagram or derivation as a sharp PNG ready to embed in lab reports or Notion.',
      },
    ],
    faqs: [
      {
        question: 'Does the whiteboard work with styluses, Apple Pencil, and trackpads?',
        answer:
          'Yes. The canvas uses unified Pointer Events and devicePixelRatio scaling so strokes stay smooth across mouse, trackpad, touchscreens, and pen tablets.',
      },
      {
        question: 'Can I place typed labels alongside hand-drawn arrows and boxes?',
        answer:
          'Yes—select the Text tool, click anywhere on the board, type your formula or node title, and place crisp typography right onto the diagram.',
      },
      {
        question: 'How high is the resolution of the exported PNG?',
        answer:
          'Exports render at 2x Retina pixel density on a crisp white sheet so lines and annotations stay sharp inside Word documents, Google Docs, and slides.',
      },
    ],
    relatedSlugs: ['graph-theory-network-builder', 'graph-builder', 'cgpa-word-pomodoro'],
  },
  {
    slug: 'graph-builder',
    path: '/tools/graph-builder',
    viewKey: 'tools/graph-builder',
    name: 'Academic Graph & Chart Builder',
    shortName: 'Academic Graph & Chart Builder',
    category: 'Math & Charts',
    tutorGroup: 'stem',
    seoTitle: 'Free Academic Graph & Chart Builder — Lab Reports & CSV to PNG | University Tutors',
    seoDescription:
      'Create publication-ready Bar, Line, Area, and Pie charts from spreadsheet tables or CSV data for university lab reports and dissertations. Export high-res PNGs free.',
    heroH1: 'Academic Graph & Chart Builder — Lab Data to Publication Figures',
    heroSubtitle:
      'Enter experimental measurements or paste CSV rows, label your X and Y axes with units, switch between Bar, Line, Area, and Pie views, and export crisp PNG figures.',
    cardSummary: 'Turn lab tables or CSV data into labeled Bar, Line, Area, or Pie charts with PNG export.',
    iconName: 'BarChart3',
    keywords: ['graph maker', 'chart builder', 'bar chart', 'line graph', 'csv to chart', 'lab report graph'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Enter Table Values or Paste CSV',
        description: 'Edit rows and series directly in the data grid or paste comma-separated values from Excel/Sheets.',
      },
      {
        stepNumber: '02',
        title: 'Choose Chart Style & Axis Titles',
        description: 'Select Bar, Line, Area, or Pie visualization and add descriptive figure and axis titles with units.',
      },
      {
        stepNumber: '03',
        title: 'Export High-Res Figure PNG',
        description: 'Download a clean, white-background PNG chart ready to drop into your thesis, lab report, or presentation.',
      },
    ],
    faqs: [
      {
        question: 'Can I plot multiple experimental series on the same graph?',
        answer:
          'Yes. Click "+ Add Series Column" to compare Control vs. Treatment groups or multi-year cohorts side-by-side on Bar, Line, and Area charts.',
      },
      {
        question: 'How do I import data from Excel or Google Sheets?',
        answer:
          'Copy your cells or CSV text, paste them into the CSV Quick-Import box, and click "Apply CSV Data" to populate headers and numeric rows automatically.',
      },
      {
        question: 'Are exported PNG charts suitable for academic papers and posters?',
        answer:
          'Yes. Charts are rasterized at high pixel density with crisp typography, legend labels, and clean white backgrounds ideal for APA/IEEE figure guidelines.',
      },
    ],
    relatedSlugs: ['graph-theory-network-builder', 'whiteboard', 'cgpa-word-pomodoro'],
  },
  {
    slug: 'graph-theory-network-builder',
    path: '/tools/graph-theory-network-builder',
    viewKey: 'tools/graph-theory-network-builder',
    name: 'Graph Theory & Network Builder',
    shortName: 'Graph Theory & Network Studio',
    category: 'Math & Charts',
    tutorGroup: 'stem',
    seoTitle:
      'Free Graph Theory & Network Topology Visualizer — Dijkstra, MST, BFS/DFS & 3D | University Tutors',
    seoDescription:
      'Interactive Discrete Math, Data Structures (DSA), and 2D/3D Network Topology Visualizer. Run Dijkstra, Prim’s MST, BFS, DFS, and Topological Sort with live Adjacency Matrices and LaTeX export.',
    heroH1: 'Graph Theory & Network Topology Visualizer (2D & 3D Studio)',
    heroSubtitle:
      'Scale vertices |V| and vertex degree k from minimum (Empty Eₙ) to maximum (Complete Kₙ), generate random networks (Erdős–Rényi, Scale-Free, Small-World, Spanning Trees, Random DAGs), simulate Dijkstra, Prim’s MST, BFS & DFS, and inspect 2D/3D topology.',
    cardSummary:
      'Interactive 2D/3D Discrete Math & DSA graph studio with min-to-max vertex/degree scaling, random graph generators, Dijkstra, MST, and LaTeX matrices.',
    iconName: 'Network',
    keywords: [
      'graph theory',
      'network topology',
      'discrete mathematics',
      'dijkstra calculator',
      'minimum spanning tree',
      'adjacency matrix',
      'random graph generator',
      'erdos renyi graph',
      'k regular graph',
      'bfs dfs visualizer',
      'mathematics',
    ],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Scale Vertices & Degree (Min → Max) or Generate Random Graphs',
        description:
          'Slide |V| (2–20) and Vertex Degree k from minimum (0, Empty Eₙ) to maximum (|V|−1, Complete Kₙ), pick from 6 Random Graph models (Erdős–Rényi, k-Regular, Spanning Tree, Scale-Free, Small-World, Random DAG), or draw custom vertices.',
      },
      {
        stepNumber: '02',
        title: 'Simulate Graph Algorithms & Switch to 3D Topology',
        description:
          'Run Dijkstra’s Shortest Path, Prim’s Minimum Spanning Tree, BFS, DFS, or Topological Sort, then toggle into 3D Preview to orbit the highlighted network in WebGL.',
      },
      {
        stepNumber: '03',
        title: 'Export LaTeX Matrices, PNG Figures & Graph JSON',
        description:
          'Copy the live Adjacency Matrix directly as a LaTeX pmatrix for Overleaf homework, download crisp 2D/3D PNGs, or save your graph JSON locally.',
      },
    ],
    faqs: [
      {
        question: 'How does the simulator check if a graph has an Euler Circuit or Euler Path?',
        answer:
          'For connected undirected graphs, Euler’s theorem states an Euler Circuit exists if and only if every vertex has even degree (0 odd-degree vertices), and an Euler Path exists when exactly 2 vertices have odd degree. For connected digraphs, it checks in-degree vs. out-degree balance.',
      },
      {
        question: 'Can I copy the Adjacency Matrix directly into a LaTeX Discrete Math assignment?',
        answer:
          'Yes! Select the "Adjacency Matrix" tab in the right panel and click "Copy LaTeX / Matrix for Lab Report" to copy a formatted \\begin{pmatrix} ... \\end{pmatrix} block ready for Overleaf or Markdown math blocks.',
      },
      {
        question: 'Does the 3D Topology Preview stay synced with Dijkstra and MST highlights?',
        answer:
          'Yes. Any shortest path, Minimum Spanning Tree, or BFS/DFS traversal highlighted on the 2D canvas is automatically mirrored in 3D with illuminated edges, directional arrowheads, and vertex labels.',
      },
    ],
    relatedSlugs: ['graph-builder', 'whiteboard', 'cgpa-word-pomodoro'],
  },
  {
    slug: 'cv-maker',
    path: '/tools/cv-maker',
    viewKey: 'tools/cv-maker',
    name: 'ATS-Friendly Student CV & Resume Maker',
    shortName: 'ATS CV & Resume Maker',
    category: 'Writing & Citations',
    tutorGroup: 'admissions',
    seoTitle: 'Free ATS-Friendly Student CV & Academic Resume Maker | University Tutors',
    seoDescription:
      'Build a clean, recruiter-approved ATS student resume or Europass-style academic CV with custom sections, live A4 preview, color themes, JSON backup, and instant PDF download.',
    heroH1: 'Free ATS-Friendly Student CV & Europass-Style Academic Resume Builder',
    heroSubtitle:
      'Craft an internship-ready resume or graduate school CV with live split-screen A4 formatting, custom sections (+ Add New Section), Europass color schemes, JSON backup, and instant vector PDF download.',
    cardSummary:
      'Split-screen A4 ATS resume builder with custom sections, Europass color schemes, JSON backup, and instant PDF download.',
    iconName: 'FileUser',
    keywords: ['cv maker', 'student resume builder', 'ats resume', 'europass cv', 'academic cv', 'internship resume'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Complete Built-In & Custom CV Sections',
        description:
          'Edit pre-filled student entries across Education, Internships, Projects, Skills, Certifications, and Languages—or click "+ Add New Section" to add References, Publications, Volunteering, or Hobbies.',
      },
      {
        stepNumber: '02',
        title: 'Choose Europass Color Themes & Reorder Sections',
        description:
          'Pick from Europass Blue, Deep Navy, Teal Slate, Charcoal Black, Burgundy, UT Orange, or any custom hex color, and drag-and-drop sections into your ideal order.',
      },
      {
        stepNumber: '03',
        title: 'Save Local JSON Backup & Instant Vector PDF Download',
        description:
          'Download a portable JSON backup file for next semester, then click "Download PDF" for an instant, selectable A4 PDF file—no manual print dialog required.',
      },
    ],
    faqs: [
      {
        question: 'Can I add custom sections like References, Publications, Volunteering, or Hobbies?',
        answer:
          'Yes! Click "+ Add New Custom Section" in the editor to create unlimited custom sections with any title, choose between Bullet Points or Detailed Entries (Title, Role/Org, Date, Description), and reorder or rename them anytime.',
      },
      {
        question: 'Does the CV Maker support Europass-inspired color themes and custom hex colors?',
        answer:
          'Yes. Choose from curated academic palettes—including Europass Blue (#0E4194), Deep Navy (#1E3A8A), Teal Slate (#0F766E), Charcoal Black (#1F2937), Burgundy (#881337), and UT Orange (#F97316)—or pick any custom hex color.',
      },
      {
        question: 'Should I include a profile photo on my student CV or internship resume?',
        answer:
          'For US, UK, and Canadian applications, disable "Show Photo on CV" to comply with strict anti-bias ATS standards. For Continental European (Europass / Lebenslauf) applications where portraits are customary, enable the photo toggle.',
      },
      {
        question: 'How do I download my finished A4 PDF without browser headers or print dialogs?',
        answer:
          'Simply click "Download PDF" in the top bar. Our client-side vector PDF engine automatically generates and downloads a clean, selectable 210mm × 297mm A4 .pdf file directly to your device.',
      },
    ],
    relatedSlugs: ['passport-photo-resizer', 'image-compressor', 'citation-generator'],
  },
  {
    slug: 'image-compressor',
    path: '/tools/image-compressor',
    viewKey: 'tools/image-compressor',
    name: 'Admission Portal Image Compressor',
    shortName: 'Portal Image Compressor',
    category: 'Image Tools',
    tutorGroup: 'admissions',
    seoTitle: 'Free Admission Portal Image Compressor — Shrink to 50KB, 100KB, 200KB | University Tutors',
    seoDescription:
      'Compress ID scans, degree certificates, and application photos to exact university portal limits (50KB, 100KB, 200KB) 100% privately in your browser.',
    heroH1: 'Admission Portal Image Compressor — Hit Exact 50KB, 100KB & 200KB Limits',
    heroSubtitle:
      'Stop getting "File size exceeds maximum allowed limit" errors on university admission, visa, and exam portals. Compress images locally to your exact target KB.',
    cardSummary: 'Shrink photos and document scans to strict 50KB, 100KB, or 200KB university portal limits.',
    iconName: 'Minimize2',
    keywords: ['image compressor', 'compress to 100kb', 'compress to 50kb', 'reduce photo kb', 'portal upload'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Select Photo or Document Scan',
        description: 'Load any JPG, PNG, or WebP file—passport scans and transcripts stay strictly inside your browser.',
      },
      {
        stepNumber: '02',
        title: 'Pick Target Portal KB Cap',
        description: 'Choose 50 KB, 100 KB, 200 KB, 500 KB, or enter a custom kilobyte ceiling required by your portal.',
      },
      {
        stepNumber: '03',
        title: 'Compare & Download Instantly',
        description: 'Inspect Original vs. Compressed file size and visual clarity side-by-side, then download in one click.',
      },
    ],
    faqs: [
      {
        question: 'How does the tool hit an exact kilobyte cap like under 100 KB?',
        answer:
          'Our client-side engine runs an adaptive multi-step quality and dimension search on an HTML5 Canvas until the encoded output sits safely beneath your chosen KB ceiling while preserving maximum sharpness.',
      },
      {
        question: 'Is it safe to compress sensitive passport or transcript scans here?',
        answer:
          'Completely safe. Compression executes locally via your browser’s native Canvas encoder—your personal identification documents are never transmitted over the internet.',
      },
      {
        question: 'What if my PNG screenshot will not shrink small enough as PNG?',
        answer:
          'Lossless PNGs have high byte floors; our compressor automatically encodes compressed portal outputs to high-efficiency JPEG/WebP so even 4MB scans drop cleanly under 100 KB.',
      },
    ],
    relatedSlugs: ['passport-photo-resizer', 'images-to-pdf', 'cv-maker'],
  },
  {
    slug: 'passport-photo-resizer',
    path: '/tools/passport-photo-resizer',
    viewKey: 'tools/passport-photo-resizer',
    name: 'University Portal ID & Passport Photo Resizer',
    shortName: 'Passport & ID Photo Resizer',
    category: 'Image Tools',
    tutorGroup: 'admissions',
    seoTitle: 'Free University ID & Passport Photo Resizer (35x45mm & 600x600px) | University Tutors',
    seoDescription:
      'Crop, center, and resize student ID photos and visa portraits to exact 35x45mm (413x531px), 2x2 inch (600x600px), or custom pixel dimensions in JPG, PNG, or WebP.',
    heroH1: 'University Portal ID & Passport Photo Resizer (35×45mm & 600×600px)',
    heroSubtitle:
      'Resize student card portraits, scholarship headshots, and visa photos to exact pixel dimensions and convert between JPG, PNG, and WebP locally.',
    cardSummary: 'Crop & resize portraits to 35×45mm (413×531px), 600×600px US/Visa square, or custom pixels.',
    iconName: 'ScanFace',
    keywords: ['passport photo resizer', '35x45mm photo', '600x600 photo', 'student id resize', 'convert webp to jpg'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Upload Headshot Portrait',
        description: 'Open any portrait photo from your phone or computer—zero server upload required.',
      },
      {
        stepNumber: '02',
        title: 'Select Official Preset & Format',
        description: 'Pick 35×45mm (UK/EU/Schengen 413×531px), 2×2" Square (600×600px), 300×300px Portal ID, or custom dimensions.',
      },
      {
        stepNumber: '03',
        title: 'Export Crisp JPG, PNG or WebP',
        description: 'Preview centered smart-crop framing with biometric guide overlay and download your resized portrait.',
      },
    ],
    faqs: [
      {
        question: 'What pixel dimensions correspond to a standard 35×45mm passport photo?',
        answer:
          'At the standard 300 DPI print and portal specification, 35×45mm equals 413 × 531 pixels—included as a 1-click preset.',
      },
      {
        question: 'Does resizing stretch or distort my face?',
        answer:
          'No! Our smart-crop mode preserves your natural aspect ratio using center-weighted cover framing (or optional white-padded fit) so proportions never warp.',
      },
      {
        question: 'Can I also convert HEIC/WebP downloads into standard JPG for older university portals?',
        answer:
          'Yes—choose "JPEG (.jpg)" as your output format to guarantee compatibility with legacy university registration portals.',
      },
    ],
    relatedSlugs: ['image-compressor', 'cv-maker', 'images-to-pdf'],
  },
  {
    slug: 'ocr-image-to-text',
    path: '/tools/ocr-image-to-text',
    viewKey: 'tools/ocr-image-to-text',
    name: 'Lecture Notes OCR (Image to Text)',
    shortName: 'Image to Text (OCR)',
    category: 'Image Tools',
    tutorGroup: 'language',
    seoTitle: 'Free Lecture Notes OCR — Extract Text from Textbook Photos | University Tutors',
    seoDescription:
      'Extract editable, searchable text from photos of textbook pages, projector slides, and printed handouts locally in your browser using Tesseract OCR.',
    heroH1: 'Free Lecture Notes OCR — Extract Editable Text from Textbook Photos',
    heroSubtitle:
      'Turn photos of library book pages, lecture hall projector slides, and non-selectable handouts into clean, editable study notes in seconds.',
    cardSummary: 'Extract editable text from textbook snapshots and lecture slides locally via Tesseract.js.',
    iconName: 'ScanText',
    keywords: ['ocr online', 'image to text', 'extract text from image', 'lecture slide ocr', 'textbook scan'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Drop Slide or Textbook Image',
        description: 'Upload a clear photo or screenshot of printed text, or load our built-in academic sample slide.',
      },
      {
        stepNumber: '02',
        title: 'Run Local Optical Recognition',
        description: 'Choose document language (English, German, French, Spanish) and watch real-time OCR progress.',
      },
      {
        stepNumber: '03',
        title: 'Edit, Copy or Save .txt',
        description: 'Proofread extracted paragraphs right in the editor, copy to clipboard, or download as a .txt file.',
      },
    ],
    faqs: [
      {
        question: 'How can I get the highest OCR accuracy from textbook photos?',
        answer:
          'Hold your camera parallel to the page under even lighting, avoid dark shadows across lines, and crop out unrelated background clutter.',
      },
      {
        question: 'Can it recognize German umlauts, French accents, and Spanish characters?',
        answer:
          'Yes. Select English, German (Deutsch), French (Français), or Spanish (Español) before running recognition to load the matching trained character model.',
      },
      {
        question: 'Are scanned pages stored anywhere online?',
        answer:
          'No. Tesseract.js runs inside a Web Worker in your own browser tab—none of your uploaded images are sent to any server.',
      },
    ],
    relatedSlugs: ['study-translator', 'images-to-pdf', 'citation-generator'],
  },
  {
    slug: 'study-translator',
    path: '/tools/study-translator',
    viewKey: 'tools/study-translator',
    name: 'Academic Multi-Language Translator',
    shortName: 'Multi-Language Study Translator',
    category: 'Writing & Citations',
    tutorGroup: 'language',
    seoTitle: 'Free Academic Study Translator — English, German, French, Arabic, Chinese | University Tutors',
    seoDescription:
      'Translate academic abstracts, seminar readings, and vocabulary across English, German, French, Spanish, Arabic, Urdu, and Chinese instantly with zero sign-up.',
    heroH1: 'Academic Multi-Language Study Translator for International Students',
    heroSubtitle:
      'Translate journal abstracts, German A1–B2 study texts, and foreign-language seminar passages across 7 major academic languages with 1-click copy.',
    cardSummary: 'Instant side-by-side translation across English, German, French, Spanish, Arabic, Urdu & Chinese.',
    iconName: 'Languages',
    keywords: ['academic translator', 'german english translator', 'study translator', 'arabic english', 'urdu english'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Choose Source & Target Languages',
        description: 'Pick from English, German, French, Spanish, Arabic, Urdu, or Chinese—and swap directions anytime.',
      },
      {
        stepNumber: '02',
        title: 'Paste Reading Passage or Abstract',
        description: 'Enter seminar sentences, thesis abstracts, or test an academic preset phrase in one click.',
      },
      {
        stepNumber: '03',
        title: 'Copy Translated Study Text',
        description: 'Review the side-by-side translation with proper RTL/LTR alignment and copy directly to your flashcards.',
      },
    ],
    faqs: [
      {
        question: 'Which languages are supported for international university students?',
        answer:
          'You can translate between any pair of English, German (Deutsch), French (Français), Spanish (Español), Arabic (العربية), Urdu (اردو), and Simplified Chinese (中文).',
      },
      {
        question: 'Does the translator handle Right-to-Left (RTL) scripts like Arabic and Urdu properly?',
        answer:
          'Yes. When Arabic or Urdu is chosen as source or target, text direction and alignment automatically adapt for natural reading.',
      },
      {
        question: 'Should I cite translated quotes in my university essay?',
        answer:
          'Yes—academic integrity standards (such as APA 7th) recommend noting translated passages and verifying nuanced terminology with a qualified language tutor.',
      },
    ],
    relatedSlugs: ['ocr-image-to-text', 'citation-generator', 'cgpa-word-pomodoro'],
  },
  {
    slug: 'citation-generator',
    path: '/tools/citation-generator',
    viewKey: 'tools/citation-generator',
    name: 'APA, MLA, Harvard & IEEE Citation Generator',
    shortName: 'APA / MLA Citation Generator',
    category: 'Writing & Citations',
    tutorGroup: 'writing',
    seoTitle: 'Free APA 7th, MLA 9th, Harvard, Chicago & IEEE Citation Generator | University Tutors',
    seoDescription:
      'Generate accurate in-text citations and full bibliography references in APA 7th, MLA 9th, Harvard, Chicago, and IEEE styles for websites, journals, and books.',
    heroH1: 'Free APA 7th, MLA 9th, Harvard, Chicago & IEEE Citation Generator',
    heroSubtitle:
      'Format peer-reviewed journal articles, books, and web sources into flawless in-text citations and alphabetical reference lists in seconds.',
    cardSummary: 'Instant in-text citations & full bibliography list builder for APA 7, MLA 9, Harvard, Chicago & IEEE.',
    iconName: 'Quote',
    keywords: ['citation generator', 'apa 7th generator', 'mla 9th', 'harvard referencing', 'ieee citation', 'bibliography'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Select Style & Source Type',
        description: 'Switch instantly between APA 7th, MLA 9th, Harvard, Chicago, and IEEE for Websites, Journals, or Books.',
      },
      {
        stepNumber: '02',
        title: 'Enter Author, Year, Title & DOI/URL',
        description: 'Watch both the parenthetical In-Text Citation and Full Reference update live as you type.',
      },
      {
        stepNumber: '03',
        title: 'Build & Copy Full Bibliography',
        description: 'Add multiple sources to your saved Bibliography List and copy or download your entire Works Cited page.',
      },
    ],
    faqs: [
      {
        question: 'Can I switch my entire saved bibliography from APA 7th to Harvard or IEEE in one click?',
        answer:
          'Yes! Because your bibliography stores structured source metadata locally, clicking another citation style reformats your live preview immediately and lets you export clean references.',
      },
      {
        question: 'Does it generate both the parenthetical in-text citation and the end-of-paper reference?',
        answer:
          'Yes. Every entry displays the exact in-text marker (e.g., "(Smith, 2025)" or "[1]") right above the complete bibliography entry.',
      },
      {
        question: 'Will my bibliography list stay saved if I refresh the browser tab?',
        answer:
          'Yes—your reference list persists in local browser storage so you never lose sources mid-essay.',
      },
    ],
    relatedSlugs: ['cgpa-word-pomodoro', 'merge-pdf', 'cv-maker'],
  },
  {
    slug: 'cgpa-word-pomodoro',
    path: '/tools/cgpa-word-pomodoro',
    viewKey: 'tools/cgpa-word-pomodoro',
    name: 'CGPA Calculator, Essay Word Counter & Pomodoro Timer',
    shortName: 'CGPA & Essay Word Counter',
    category: 'Study & GPA',
    tutorGroup: 'stem',
    seoTitle: 'Free University CGPA Calculator, Essay Word Counter & Pomodoro Timer | University Tutors',
    seoDescription:
      '3-in-1 daily student study desk: 4.0 scale Semester/CGPA & Percentage Calculator, live Essay Word Counter with target bar, and 25-min Pomodoro Focus Timer.',
    heroH1: '3-in-1 Student Study Desk: CGPA Calculator, Essay Word Counter & Pomodoro',
    heroSubtitle:
      'Track essay word targets and reading time, calculate your 4.0-scale semester & cumulative GPA, and run structured 25/5 focus sprints in one distraction-free workspace.',
    cardSummary: '4.0 CGPA & percentage calculator, live essay word counter with target progress, and Pomodoro timer.',
    iconName: 'GraduationCap',
    keywords: ['cgpa calculator', 'gpa calculator 4.0', 'essay word counter', 'pomodoro timer', 'character counter'],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Pick Your Active Study Utility',
        description: 'Toggle between Essay Word Counter, 4.0 CGPA & Percentage Calculator, and Pomodoro Focus Timer.',
      },
      {
        stepNumber: '02',
        title: 'Track Words, Credits or Sprints',
        description: 'Paste essay drafts to check target word limits, enter credit hours & letter grades, or start a 25-min sprint.',
      },
      {
        stepNumber: '03',
        title: 'Stay Organized Automatically',
        description: 'Your GPA courses, essay draft metrics, and Pomodoro checklist stay synced locally while you study.',
      },
    ],
    faqs: [
      {
        question: 'How is Cumulative GPA (CGPA) calculated on the 4.0 university scale?',
        answer:
          'Each course’s grade points (A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, etc.) are multiplied by its credit hours, summed across all courses, and divided by total attempted credit hours.',
      },
      {
        question: 'Does the Essay Word Counter track target word limits like 1,500 or 3,000 words?',
        answer:
          'Yes—set any custom target word count (e.g., 1,500 words for an undergraduate essay or 8,000 for a dissertation chapter) to see your exact completion percentage and +/-10% academic tolerance range.',
      },
      {
        question: 'How does the Pomodoro 25 / 5 / 15 cycle improve exam revision?',
        answer:
          'Working in focused 25-minute intervals followed by 5-minute active recall breaks prevents cognitive fatigue and markedly improves long-term retention.',
      },
    ],
    relatedSlugs: ['university-grade-converter', 'citation-generator', 'cv-maker'],
  },
  {
    slug: 'university-grade-converter',
    path: '/tools/university-grade-converter',
    viewKey: 'tools/university-grade-converter',
    name: 'Universal 6-System University Grade & Credit Converter',
    shortName: 'University Grade & Credit Converter',
    category: 'Study & GPA',
    tutorGroup: 'admissions',
    seoTitle:
      'Free Universal University Grade, CGPA & ECTS Credit Converter (UK, USA, Canada, AU) | University Tutors',
    seoDescription:
      'Convert grades and credit hours from all 6 world university grading systems (GPA, Percentage, Honours, Descriptive, 10/20/30-Point, Inverted German) into UK 1st/2:1, US/Canada 4.0 GPA, Australia 7.0, Ireland, NZ, Singapore & ECTS with branded A4 PDF export.',
    heroH1: 'Universal 6-System University Grade & Credit Converter',
    heroSubtitle:
      'Select your home university’s grading system or country preset, adjust for Absolute vs. Relative (Bell-Curve) rigor, convert into UK, USA, Canada, Australia, Ireland, New Zealand, Singapore & ECTS, and download a branded A4 PDF report.',
    cardSummary:
      'Convert CGPA, percentages, 10/20/30-point & German grades into UK 1st/2:1, US/Canada 4.0, Australia 7.0 & ECTS credits.',
    iconName: 'Globe',
    keywords: [
      'grade converter',
      'gpa converter',
      'cgpa to uk honours',
      'ects credit converter',
      'bavarian formula',
      'wes gpa calculator',
      'international grade equivalence',
      'study abroad grades',
    ],
    howItWorks: [
      {
        stepNumber: '01',
        title: 'Choose Your Home Grading System & Country Preset',
        description:
          'Pick from all 6 global university grading archetypes (GPA 4.0/4.33/4.5/5.0, Percentage, Honours, 7.0/9.0 Band, 10/20/30-Point, or German Inverted) across 21 country presets.',
      },
      {
        stepNumber: '02',
        title: 'Enter Score, Grading Policy & Credit Workload',
        description:
          'Input your obtained grade, toggle Absolute vs. Relative (Bell-Curve) institutional grading, and enter your completed semesters and credit hours.',
      },
      {
        stepNumber: '03',
        title: 'Compare 7 Destinations & Export Branded A4 PDF',
        description:
          'Review your converted grade, ECTS band, target credits, and student visa working hours across UK, USA, Canada, Australia, Ireland, NZ & Singapore, then export a clean A4 PDF report.',
      },
    ],
    faqs: [
      {
        question: 'How are grades converted fairly across systems with different passing marks (e.g., 40%, 50%, or 60%)?',
        answer:
          'Instead of naive raw division, our converter normalizes your passing performance ratio between your home institution’s minimum passing mark (Nmin) and maximum achievable grade (Nmax) using internationally recognized linear passing-ratio and Modified Bavarian equivalence formulas.',
      },
      {
        question: 'What is the difference between Absolute Grading and Relative (Bell-Curve) Grading?',
        answer:
          'Under Absolute Grading, marks map to fixed numeric cut-offs regardless of class averages. Under Relative (norm-referenced) Bell-Curve grading, only a fixed top percentile of the cohort can earn an A or Distinction—so admissions evaluators often recognize cohort competitiveness.',
      },
      {
        question: 'How does the tool convert home university credit hours into UK CATS, US Credits, and ECTS?',
        answer:
          'Each country preset encodes its standard academic workload per credit (e.g., 1 US/HEC semester credit ≈ 45 workload hours ≈ 1.76–2.0 ECTS; 1 ECTS ≈ 25–30 hours; 2 UK CATS credits = 1 ECTS) to estimate equivalent degree credits and weekly study hours.',
      },
      {
        question: 'Can I include the PDF Equivalence Report in my scholarship or graduate preparation folder?',
        answer:
          'Yes—click "Download PDF" for an instant 1-click A4 PDF report, or click "Customize & Download PDF" to add your name, home degree, and target program before downloading. Official university admissions offices perform their own binding transcript evaluation.',
      },
    ],
    relatedSlugs: ['cgpa-word-pomodoro', 'cv-maker', 'study-translator'],
  },
];

export const STUDENT_TOOLS_BY_SLUG: Record<ToolSlug, StudentToolDefinition> = STUDENT_TOOLS.reduce(
  (acc, tool) => {
    acc[tool.slug] = tool;
    return acc;
  },
  {} as Record<ToolSlug, StudentToolDefinition>
);

export function resolveStudentToolSlug(input: string): ToolSlug | null {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^#/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .split('#')[0];

  const candidate = cleaned.startsWith('tools/') ? cleaned.slice('tools/'.length) : cleaned;
  if (
    candidate === 'graph-theory' ||
    candidate === 'network-builder' ||
    candidate === 'graph-theory-studio'
  ) {
    return 'graph-theory-network-builder';
  }
  if (
    candidate === 'grade-converter' ||
    candidate === 'grades-converter' ||
    candidate === 'gpa-converter' ||
    candidate === 'credit-converter'
  ) {
    return 'university-grade-converter';
  }
  if (
    candidate === 'paraphraser' ||
    candidate === 'ai-detector' ||
    candidate === 'ai-pattern-analyzer' ||
    candidate === 'originality-checker'
  ) {
    return 'academic-paraphraser';
  }
  if (STUDENT_TOOLS_BY_SLUG[candidate as ToolSlug]) {
    return candidate as ToolSlug;
  }
  return null;
}
