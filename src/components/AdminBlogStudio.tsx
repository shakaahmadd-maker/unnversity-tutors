import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Save,
  Send,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Minus,
  Image as ImageIcon,
  Eye,
  Columns,
  PenLine,
  UploadCloud,
  X,
  CheckCircle2,
  Globe,
  Search,
  Tag,
  FolderOpen,
  SlidersHorizontal,
  ExternalLink,
  Clock,
  AlertCircle,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  RemoveFormatting,
  Highlighter,
  CaseSensitive,
  ArrowUpDown,
  Maximize2,
  WrapText,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Blog } from '../types';
import { apiFetch, getFriendlyErrorMessage, resolveMediaUrl } from '../lib/apiClient';

const WORD_FONT_FAMILIES = [
  { label: 'Default (Inter)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Calibri', value: 'Calibri, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Garamond', value: 'Garamond, Georgia, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
];

const WORD_FONT_SIZES = [12, 14, 15, 16, 18, 20, 24, 28, 32, 36];

const WORD_LINE_SPACINGS = [
  { label: '1.0 — Compact', value: '1.0' },
  { label: '1.15 — Standard', value: '1.15' },
  { label: '1.5 — Comfortable', value: '1.5' },
  { label: '1.75 — Academic', value: '1.75' },
  { label: '2.0 — Double Spaced', value: '2.0' },
];

const WORD_TEXT_COLORS = [
  { label: 'Default Ink', value: '#1e293b' },
  { label: 'Pure Black', value: '#000000' },
  { label: 'Slate Gray', value: '#475569' },
  { label: 'Brand Orange', value: '#ea580c' },
  { label: 'Crimson Red', value: '#dc2626' },
  { label: 'Academic Blue', value: '#1d4ed8' },
  { label: 'Navy', value: '#1e3a8a' },
  { label: 'Teal', value: '#0f766e' },
  { label: 'Emerald', value: '#047857' },
  { label: 'Purple', value: '#7e22ce' },
  { label: 'Amber Brown', value: '#b45309' },
  { label: 'Rose', value: '#be123c' },
];

const WORD_HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Lime', value: '#bbf7d0' },
  { label: 'Sky Blue', value: '#bae6fd' },
  { label: 'Peach', value: '#fed7aa' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Lavender', value: '#e9d5ff' },
];

export interface AcademicTemplateItem {
  group: string;
  label: string;
  title: string;
  category: string;
  tags: string[];
  metaDescription: string;
  focusKeyword: string;
  longTailKeywords: string;
  lsiKeywords: string;
  coverUrl: string;
  altText: string;
  content: string;
}

const INITIAL_ACADEMIC_TEMPLATES: Record<string, AcademicTemplateItem> = {
  mla_guide: {
    group: 'Referencing & Citations',
    label: 'MLA 9th Edition Formatting & Works Cited Guide',
    title: 'MLA Formats Survival Guide: In-Text Citations & Works Cited',
    category: 'University Survival',
    tags: ['oxford', 'referencing', 'mla', 'academic-writing'],
    metaDescription:
      'Master MLA 9th edition formatting, in-text citations, and Works Cited pages with this step-by-step university survival guide.',
    focusKeyword: 'MLA formats survival guide',
    longTailKeywords: 'how to format MLA 9th edition paper, MLA works cited examples',
    lsiKeywords: 'parenthetical citation, hanging indent, bibliography, style guide',
    coverUrl:
      'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=1200&q=80',
    altText: 'University student studying open textbooks and writing notes at a wooden desk',
    content: `# Why MLA Formatting Matters in Higher Education

Formatting your academic papers properly isn't just about aesthetics—it demonstrates scholarly rigor, prevents accidental plagiarism, and ensures your professors can easily trace your research sources.

## 1. General Page Setup Rules

Before typing a single word of your introduction, configure your document settings:

* **Margins:** Set 1-inch margins on all sides of the page.
* **Typography:** Use a clean, legible 12-point font such as Times New Roman or Arial.
* **Line Spacing:** Double-space the entire paper, including the heading and Works Cited page.
* **Header:** Add your last name and page number in the upper right-hand corner, 0.5 inches from the top.

> "Consistency in citation is the hallmark of credible academic scholarship."

## 2. Crafting In-Text Citations

MLA uses the **author-page** method for parenthetical citations. This means the author's last name and the page number(s) from which the quotation or paraphrase is taken must appear in the text:

1. **Direct Quote:** Romantic poetry is characterized by the "spontaneous overflow of powerful feelings" (Wordsworth 263).
2. **Author Named in Sentence:** Wordsworth stated that Romantic poetry was marked by a "spontaneous overflow of powerful feelings" (263).

---

## 3. Works Cited Checklist

Always start your Works Cited list on a **new page** at the end of your research paper, alphabetized by the author's last name with a 0.5-inch hanging indent.`,
  },
  apa_7_guide: {
    group: 'Referencing & Citations',
    label: 'APA 7th Edition Citation & Title Page Handbook',
    title: 'APA 7th Edition Formatting & Referencing Handbook for Students',
    category: 'Essay Writing & Referencing',
    tags: ['apa-7', 'citations', 'psychology', 'social-sciences'],
    metaDescription:
      'Learn APA 7th edition student paper formatting, running heads, in-text citations, and reference list rules with clear examples.',
    focusKeyword: 'APA 7th edition citation guide',
    longTailKeywords: 'how to cite journal articles in APA 7th edition, APA student title page',
    lsiKeywords: 'DOI format, reference list, et al rule, scholarly sources',
    coverUrl:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80',
    altText: 'Open academic reference book with clean typography on a study table',
    content: `# Mastering APA 7th Edition for Social Sciences

APA Style (7th Edition) is the gold standard across psychology, education, nursing, and business faculties.

## Student Paper Title Page Setup

Unlike professional manuscripts, student papers in APA 7th edition **do not require a running head** unless specifically requested by your instructor. Include:

* **Paper Title:** Bold, centered, and written in Title Case three to four lines down from the top margin.
* **Author Name:** Your full name beneath the title.
* **Institutional Affiliation:** Department name and University name.
* **Course Number & Name, Instructor, and Due Date.**

## In-Text Citation Quick Rules

1. **One Author:** (Smith, 2024) or Smith (2024) argued...
2. **Two Authors:** (Johnson & Lee, 2023)
3. **Three or More Authors:** Use *et al.* from the very first citation: (Patel et al., 2025).`,
  },
  harvard_referencing: {
    group: 'Referencing & Citations',
    label: 'Harvard & Oxford Referencing Comparison Guide',
    title: 'Harvard vs. Oxford Referencing: Which Style Does Your Course Need?',
    category: 'Essay Writing & Referencing',
    tags: ['harvard', 'oxford', 'footnotes', 'referencing'],
    metaDescription:
      'Understand the key differences between Harvard author-date citations and Oxford footnote referencing for UK university essays.',
    focusKeyword: 'Harvard vs Oxford referencing',
    longTailKeywords: 'how to use Oxford footnote referencing, Harvard bibliography examples',
    lsiKeywords: 'ibid, footnotes, author-date system, UK university essays',
    coverUrl:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
    altText: 'Classic university library bookshelves filled with reference volumes',
    content: `# Harvard vs. Oxford Referencing Explained

Choosing between Harvard and Oxford referencing comes down to whether your department prefers **in-text parenthetical citations** or **bottom-of-page footnotes**.

## Harvard Style (Author-Date)

* Widely used in Business, Economics, and Sciences.
* Embeds citations directly inside your sentences: *(Brown, 2022, p. 45)*.

## Oxford Style (Footnote-Bibliography)

* Favored in History, Law, and Humanities.
* Uses superscript numbers in the text linked to full source details at the bottom of the page.`,
  },
  essay_structure: {
    group: 'Academic Writing & Essays',
    label: 'First-Class Critical Essay Structure Blueprint',
    title: 'How to Structure a First-Class University Essay (PEEL & Critical Analysis)',
    category: 'Essay Writing & Referencing',
    tags: ['essay-writing', 'critical-thinking', 'first-class', 'university'],
    metaDescription:
      'Move beyond descriptive writing and score higher grades with our first-class university essay structure and critical analysis framework.',
    focusKeyword: 'first-class university essay structure',
    longTailKeywords: 'how to write critically in university essays, PEEL paragraph structure',
    lsiKeywords: 'thesis statement, counter-argument, topic sentence, synthesis',
    coverUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    altText: 'Student drafting an essay outline with fountain pen and notebook',
    content: `# Moving From Descriptive to Critical Writing

The biggest jump between a 2:2 and a First-Class mark at university is **critical evaluation**—weighing evidence rather than simply summarizing what scholars said.

## The Anatomy of a High-Scoring Paragraph (PEEL+)

* **Point:** Open with a clear topic sentence advancing your thesis.
* **Evidence:** Introduce peer-reviewed data, case studies, or primary quotes.
* **Evaluation:** Critique the methodology, limitations, or bias of that source.
* **Link:** Connect back to the main essay question.`,
  },
  literature_review: {
    group: 'Research & Dissertation',
    label: 'Systematic Literature Review Framework',
    title: 'How to Write a Systematic Literature Review That Identifies Research Gaps',
    category: 'Research & Thesis',
    tags: ['literature-review', 'research', 'academic-journals', 'thesis'],
    metaDescription:
      'Step-by-step guide to searching academic databases, synthesizing themes, and writing a compelling literature review chapter.',
    focusKeyword: 'how to write a literature review',
    longTailKeywords: 'thematic vs chronological literature review, finding research gaps',
    lsiKeywords: 'Google Scholar, Scopus, synthesis matrix, peer-reviewed',
    coverUrl:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    altText: 'Rows of academic journals and books in a research library',
    content: `# Synthesizing Existing Scholarship Without Summarizing

A strong literature review groups scholars by **themes and debates**, not an annotated list of "Author A said X, Author B said Y."

## 4-Step Literature Search Workflow

1. Define inclusion/exclusion criteria (publication years, keywords, peer-reviewed only).
2. Build a **Synthesis Matrix** comparing methods, findings, and limitations across 15–25 core papers.
3. Highlight contradictions in the literature to justify your own study.`,
  },
  dissertation_proposal: {
    group: 'Research & Dissertation',
    label: 'Undergraduate Dissertation Proposal Template',
    title: 'How to Write a Winning Undergraduate Dissertation Proposal',
    category: 'Research & Thesis',
    tags: ['dissertation', 'research-methods', 'thesis', 'methodology'],
    metaDescription:
      'Learn how to structure your dissertation research question, literature review, and methodology to get fast supervisor approval.',
    focusKeyword: 'undergraduate dissertation proposal',
    longTailKeywords: 'how to write a dissertation proposal structure, research methodology section',
    lsiKeywords: 'literature gap, qualitative research, quantitative analysis, ethics approval',
    coverUrl:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    altText: 'Stack of academic research books and notebook in a university library',
    content: `# Turning a Broad Topic into a Focused Research Question

A strong dissertation proposal convinces your department that your project is **original, feasible, and methodologically sound**.

## Essential Components of Your Proposal

* **Working Title:** Clear, concise, and reflective of your core variables or themes.
* **Research Context & Gap:** Summarize key scholars in your field and pinpoint what remains unanswered.
* **Research Questions:** Limit yourself to 1 primary question and 2–3 sub-questions.
* **Methodology:** Justify why you chose qualitative interviews, quantitative surveys, or archival analysis.

> "A well-defined research question is half the dissertation already solved."`,
  },
  exam_checklist: {
    group: 'Exams & Study Productivity',
    label: '7-Day Final Exam Revision Blueprint',
    title: '7-Day University Final Exam Revision Blueprint',
    category: 'Exam Preparation',
    tags: ['exams', 'study-tips', 'revision', 'time-management'],
    metaDescription:
      'A structured 7-day university exam study schedule using active recall and spaced repetition to boost retention without burnout.',
    focusKeyword: 'university exam revision blueprint',
    longTailKeywords: 'how to revise for university exams in 7 days, active recall timetable',
    lsiKeywords: 'spaced repetition, past papers, Pomodoro technique, exam stress',
    coverUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    altText: 'Desk organized with study planner, highlighters, and laptop for exam preparation',
    content: `# How to Structure Your Final Week Before Exams

Cramming the night before an exam leads to cognitive overload. Instead, use this **7-day active recall sprint** to consolidate core concepts.

## Days 7–5: Syllabus Triage & Active Recall

* Audit every lecture module and rank topics by confidence level (Red, Amber, Green).
* Close your notes and write down everything you remember about a topic on a blank sheet (the *Feynman Technique*).
* Fill in knowledge gaps immediately using lecture slides.

## Days 4–2: Timed Past Paper Drills

1. Complete at least two past exam papers under strict timed conditions.
2. Grade your answers ruthlessly against the official marking rubric.
3. Log recurring mistakes in a dedicated error notebook.

---

## Day 1: Light Review & Rest

Avoid learning brand-new material 24 hours before your exam. Review high-level summary flashcards and aim for 8 hours of sleep.`,
  },
  fresher_survival: {
    group: 'Exams & Study Productivity',
    label: 'First-Year University Academic Survival Checklist',
    title: 'First-Year University Survival Guide: Mastering Lectures, Seminars & Deadlines',
    category: 'University Survival',
    tags: ['freshers', 'university-survival', 'note-taking', 'seminars'],
    metaDescription:
      'Everything first-year students need to thrive academically—from Cornell note-taking in lectures to preparing for university seminars.',
    focusKeyword: 'first-year university survival guide',
    longTailKeywords: 'how to take notes in university lectures, preparing for seminars',
    lsiKeywords: 'Cornell notes, office hours, academic integrity, Turnitin',
    coverUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    altText: 'Group of university students collaborating with laptops on campus',
    content: `# Transitioning From High School to Independent University Study

At university, lectures introduce frameworks, while **independent reading and seminars** build your depth of understanding.

## Top 4 Habits of Successful Undergraduates

* **Use Cornell Note-Taking:** Divide your page into cues, lecture notes, and a 3-sentence summary.
* **Attend Professor Office Hours:** Bring specific questions about essay feedback or readings.
* **Start Assignments 3 Weeks Early:** Give yourself buffer time for library inter-loans and proofreading.`,
  },
  personal_statement: {
    group: 'Admissions & Careers',
    label: 'Postgraduate & Masters Personal Statement Guide',
    title: 'How to Write a Standout Postgraduate & Masters Personal Statement',
    category: 'Graduate Career Advice',
    tags: ['masters', 'postgraduate', 'personal-statement', 'admissions'],
    metaDescription:
      'Craft a persuasive Masters or PhD personal statement that highlights your academic motivation, research interests, and career goals.',
    focusKeyword: 'postgraduate personal statement guide',
    longTailKeywords: 'how to write a Masters personal statement UK, academic SOP tips',
    lsiKeywords: 'statement of purpose, admissions tutor, research alignment, faculty',
    coverUrl:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    altText: 'University graduation celebration and historic campus architecture',
    content: `# Demonstrating Academic Readiness for Postgraduate Study

Admissions tutors look for **intellectual curiosity and clear alignment** between your past modules and their department's research strengths.

## Recommended 4-Paragraph Structure

1. **The Academic Hook:** What specific problem or question drives your passion for this discipline?
2. **Undergraduate Foundation:** Highlight relevant coursework, dissertation findings, or lab skills.
3. **Why This University:** Name specific modules, research centers, or faculty members you wish to work with.
4. **Post-Graduation Trajectory:** Connect the degree to your long-term research or industry ambitions.`,
  },
};

const SUGGESTED_COVER_IMAGES = [
  {
    label: 'Student Desk & Books',
    url: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=1200&q=80',
    alt: 'University student studying open textbooks and writing notes at a wooden desk',
  },
  {
    label: 'University Library',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
    alt: 'Classic university library bookshelves filled with academic books',
  },
  {
    label: 'Exam Study Planner',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    alt: 'Desk organized with study planner, highlighters, and laptop for exam preparation',
  },
  {
    label: 'Campus Collaboration',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    alt: 'University students collaborating with laptops in a study lounge',
  },
  {
    label: 'Essay Writing',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    alt: 'Student drafting an academic essay outline with pen and notebook',
  },
  {
    label: 'Graduation & Success',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    alt: 'University campus architecture during graduation',
  },
];

const BLOG_CATEGORIES = [
  'University Survival',
  'Exam Preparation',
  'Research & Thesis',
  'Essay Writing & Referencing',
  'Graduate Career Advice',
  'APA Guidelines',
  'Mathematics Tricks',
  'Legal Disclaimers',
];

import { renderBlogStudioMarkdown } from '../utils/blogMarkdown';
export { renderBlogStudioMarkdown };

export interface BlogStudioSavePayload {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  imageUrl: string;
  altText: string;
  category: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  metaDescription: string;
  focusKeyword: string;
  longTailKeywords: string;
  lsiKeywords: string;
}

interface AdminBlogStudioProps {
  initialBlog?: Blog | null;
  currentUserName?: string;
  onBack: () => void;
  onSaveBlog: (payload: BlogStudioSavePayload) => Promise<void> | void;
}

export const AdminBlogStudio: React.FC<AdminBlogStudioProps> = ({
  initialBlog,
  currentUserName,
  onBack,
  onSaveBlog,
}) => {
  const [templates, setTemplates] = useState<Record<string, AcademicTemplateItem>>(() => {
    try {
      const savedCustom = localStorage.getItem('ut_custom_blog_outlines');
      if (savedCustom) {
        return { ...INITIAL_ACADEMIC_TEMPLATES, ...JSON.parse(savedCustom) };
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_ACADEMIC_TEMPLATES;
  });

  // Primary Article State
  const [title, setTitle] = useState<string>(initialBlog?.title || '');
  const [slug, setSlug] = useState<string>(initialBlog?.slug || '');
  const [slugEdited, setSlugEdited] = useState<boolean>(Boolean(initialBlog?.slug));
  const [category, setCategory] = useState<string>(initialBlog?.category || 'University Survival');
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initialBlog?.tags) && initialBlog.tags.length > 0
      ? initialBlog.tags
      : ['oxford', 'referencing', 'mla']
  );
  const [tagInput, setTagInput] = useState<string>('');
  const [content, setContent] = useState<string>(initialBlog?.content || '');
  const [featured, setFeatured] = useState<boolean>(Boolean(initialBlog?.featured));

  // Media & Cover State
  const [coverUrl, setCoverUrl] = useState<string>(
    initialBlog?.imageUrl ||
      initialBlog?.image ||
      'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=1200&q=80'
  );
  const [altText, setAltText] = useState<string>(initialBlog?.altText || initialBlog?.title || '');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // SEO & Metadata State
  const [metaDescription, setMetaDescription] = useState<string>(
    initialBlog?.metaDescription || initialBlog?.excerpt || ''
  );
  const [focusKeyword, setFocusKeyword] = useState<string>(initialBlog?.focusKeyword || '');
  const [longTailKeywords, setLongTailKeywords] = useState<string>(initialBlog?.longTailKeywords || '');
  const [lsiKeywords, setLsiKeywords] = useState<string>(initialBlog?.lsiKeywords || '');

  // UI & Workspace State
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'split' : 'write'
  );
  const [showSidebarMobile, setShowSidebarMobile] = useState<boolean>(false);
  const [showTemplateBanner, setShowTemplateBanner] = useState<boolean>(!initialBlog);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [inlineImageModal, setInlineImageModal] = useState<boolean>(false);
  const [inlineImageTab, setInlineImageTab] = useState<'upload' | 'url'>('upload');
  const [inlineImageUrl, setInlineImageUrl] = useState<string>('');
  const [inlineImageAlt, setInlineImageAlt] = useState<string>('');
  const [inlineImageAlign, setInlineImageAlign] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [inlineImageWrap, setInlineImageWrap] = useState<boolean>(true);
  const [coverImageTab, setCoverImageTab] = useState<'upload' | 'gallery' | 'url'>('upload');

  // MS Word Ribbon Control State
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(WORD_FONT_FAMILIES[0].value);
  const [selectedFontSize, setSelectedFontSize] = useState<number>(15);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#ea580c');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('#fef08a');
  const [selectedLineSpacing, setSelectedLineSpacing] = useState<string>('1.5');
  const [openRibbonMenu, setOpenRibbonMenu] = useState<'textColor' | 'highlight' | 'lineSpacing' | 'case' | null>(null);

  // Custom Outline Creator Modal State
  const [outlineModalOpen, setOutlineModalOpen] = useState<boolean>(false);
  const [newOutlineLabel, setNewOutlineLabel] = useState<string>('');
  const [newOutlineGroup] = useState<string>('Custom Departmental Outlines');
  const [newOutlineCategory, setNewOutlineCategory] = useState<string>('University Survival');
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const [newOutlineTags, setNewOutlineTags] = useState<string>('');
  const [newOutlineContent, setNewOutlineContent] = useState<string>(
    `# Introduction\n\nWrite your opening context here...\n\n## Key Section 1\n\n* Point one\n* Point two\n\n## Conclusion & Takeaways\n\nSummarize the main findings.`
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!slugEdited) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated || 'untitled-article');
    }
  }, [title, slugEdited]);

  useEffect(() => {
    if (!title && !content) return;
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      const done = setTimeout(() => setSaveStatus('saved'), 450);
      return () => clearTimeout(done);
    }, 900);
    return () => clearTimeout(timer);
  }, [title, content, category, tags, coverUrl, metaDescription, focusKeyword]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const uploadBlogMediaFile = async (file: File): Promise<string> => {
    const validExt = /\.(jpe?g|png|webp|gif|avif|svg|jfif)$/i.test(file.name || '');
    if (!file.type.startsWith('image/') && !validExt) {
      throw new Error('Unsupported file type. Please choose a JPEG, PNG, WebP, GIF, AVIF, or SVG image.');
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('Image exceeds the 15MB upload limit. Please select a smaller image.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blogs');
    formData.append('prefix', 'blog');

    const res = await apiFetch('/api/upload?folder=blogs&prefix=blog', {
      method: 'POST',
      credentials: 'include',
      body: formData,
      timeoutMs: 30000,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `Image upload failed (HTTP ${res.status}).`);
    }

    const uploadedUrl = json?.relativeUrl || json?.url || json?.imageUrl;
    if (!uploadedUrl || typeof uploadedUrl !== 'string') {
      throw new Error('Server did not return a valid image URL.');
    }
    return uploadedUrl;
  };

  const handleSelectTemplate = (templateKey: string) => {
    if (!templateKey) return;
    const tpl = templates[templateKey];
    if (!tpl) return;
    setTitle(tpl.title);
    setSlugEdited(false);
    setCategory(tpl.category);
    setTags(tpl.tags);
    setContent(tpl.content);
    if (tpl.coverUrl) setCoverUrl(tpl.coverUrl);
    if (tpl.altText) setAltText(tpl.altText);
    setImageError(false);
    setMetaDescription(tpl.metaDescription || '');
    setFocusKeyword(tpl.focusKeyword || '');
    setLongTailKeywords(tpl.longTailKeywords || '');
    setLsiKeywords(tpl.lsiKeywords || '');
    triggerToast(`Loaded "${tpl.label || tpl.title}" outline`);
  };

  const handleCreateCustomOutline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutlineLabel.trim() || !newOutlineContent.trim()) {
      triggerToast('Please provide an Outline Name and Markdown structure.', 'error');
      return;
    }

    const key = `custom_${Date.now()}`;
    const parsedTags = newOutlineTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newEntry: AcademicTemplateItem = {
      group: newOutlineGroup.trim() || 'Custom Departmental Outlines',
      label: newOutlineLabel.trim(),
      title: newOutlineTitle.trim() || newOutlineLabel.trim(),
      category: newOutlineCategory,
      tags: parsedTags.length > 0 ? parsedTags : ['academic-guide', 'university'],
      metaDescription: `Comprehensive academic guide on ${newOutlineLabel.trim()} for university students.`,
      focusKeyword: newOutlineLabel.trim().toLowerCase(),
      longTailKeywords: '',
      lsiKeywords: '',
      coverUrl,
      altText: altText || newOutlineLabel.trim(),
      content: newOutlineContent,
    };

    const updatedTemplates = { ...templates, [key]: newEntry };
    setTemplates(updatedTemplates);

    try {
      const customOnly = Object.fromEntries(
        Object.entries(updatedTemplates).filter(([k]) => k.startsWith('custom_'))
      );
      localStorage.setItem('ut_custom_blog_outlines', JSON.stringify(customOnly));
    } catch {
      // Ignore storage errors
    }

    setTitle(newEntry.title);
    setSlugEdited(false);
    setCategory(newEntry.category);
    setTags(newEntry.tags);
    setContent(newEntry.content);

    setNewOutlineLabel('');
    setNewOutlineTitle('');
    setNewOutlineTags('');
    setOutlineModalOpen(false);
    triggerToast(`Saved & applied new outline: "${newEntry.label}"`);
  };

  const insertMarkdown = (prefix: string, suffix = '', placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const updated = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selectedText.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 10);
  };

  // Parse a CSS style attribute into key/value map
  const parseCssStyleString = (styleStr: string): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const part of styleStr.split(';')) {
      const idx = part.indexOf(':');
      if (idx === -1) continue;
      const key = part.slice(0, idx).trim().toLowerCase();
      const val = part.slice(idx + 1).trim();
      if (key && val) map[key] = val;
    }
    return map;
  };

  const serializeCssStyleMap = (map: Record<string, string>): string =>
    Object.entries(map)
      .filter(([, v]) => Boolean(v && v.trim()))
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');

  // Apply MS Word inline font property (font-family, font-size, color) cleanly without nesting duplicate spans
  const applyInlineSpanStyle = (prop: string, value: string | null, placeholder = 'formatted text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const existingSpan = selectedText.match(/^<span\s+style="([^"]*)"\s*>([\s\S]*)<\/span>$/i);
    let replacement = '';
    if (existingSpan) {
      const styleMap = parseCssStyleString(existingSpan[1]);
      if (value) {
        styleMap[prop] = value;
      } else {
        delete styleMap[prop];
      }
      const nextStyle = serializeCssStyleMap(styleMap);
      replacement = nextStyle ? `<span style="${nextStyle}">${existingSpan[2]}</span>` : existingSpan[2];
    } else {
      const inner = selectedText || placeholder;
      replacement = value ? `<span style="${prop}: ${value}">${inner}</span>` : inner;
    }

    const updated = `${before}${replacement}${after}`;
    setContent(updated);
    setOpenRibbonMenu(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  // Apply MS Word Highlight color
  const applyHighlightColor = (color: string | null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const existingMark = selectedText.match(/^<mark(?:\s+style="[^"]*")?\s*>([\s\S]*)<\/mark>$/i);
    const inner = existingMark ? existingMark[1] : (selectedText || 'highlighted text');
    const replacement = color ? `<mark style="background-color: ${color}">${inner}</mark>` : inner;

    setContent(`${before}${replacement}${after}`);
    setOpenRibbonMenu(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  // Grow / Shrink font size (MS Word A+ / A-)
  const adjustFontSize = (step: 1 | -1) => {
    const idx = WORD_FONT_SIZES.findIndex((s) => s >= selectedFontSize);
    const currentIdx = idx === -1 ? WORD_FONT_SIZES.length - 1 : idx;
    const nextIdx = Math.max(0, Math.min(WORD_FONT_SIZES.length - 1, currentIdx + step));
    const nextSize = WORD_FONT_SIZES[nextIdx];
    setSelectedFontSize(nextSize);
    applyInlineSpanStyle('font-size', `${nextSize}px`);
  };

  // MS Word Change Case (Aa)
  const applyChangeCase = (mode: 'sentence' | 'lower' | 'upper' | 'title') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      triggerToast('Select text first to change its letter case.', 'error');
      setOpenRibbonMenu(null);
      return;
    }
    const raw = content.substring(start, end);
    let transformed = raw;
    if (mode === 'upper') {
      transformed = raw.toUpperCase();
    } else if (mode === 'lower') {
      transformed = raw.toLowerCase();
    } else if (mode === 'title') {
      transformed = raw.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
    } else {
      transformed = raw
        .toLowerCase()
        .replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (m) => m.toUpperCase());
    }
    setContent(`${content.substring(0, start)}${transformed}${content.substring(end)}`);
    setOpenRibbonMenu(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 10);
  };

  // MS Word Clear All Formatting on selection
  const clearSelectionFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      triggerToast('Highlight text to clear its formatting.', 'error');
      return;
    }
    let cleaned = content.substring(start, end);
    // Strip allowlisted inline/block tags & markdown emphasis
    cleaned = cleaned
      .replace(/<\/?(?:span|mark|u|s|sup|sub|div|p)(?:\s+style="[^"]*")?\s*>/gi, '')
      .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
      .replace(/__([\s\S]*?)__/g, '$1')
      .replace(/~~([\s\S]*?)~~/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,4}\s+/gm, '')
      .replace(/^>\s+/gm, '');

    setContent(`${content.substring(0, start)}${cleaned}${content.substring(end)}`);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + cleaned.length);
    }, 10);
  };

  // Find full paragraph/line boundaries around cursor or selection
  const getParagraphBounds = (text: string, selStart: number, selEnd: number) => {
    const lineStart = text.lastIndexOf('\n', Math.max(0, selStart - 1)) + 1;
    const nextNewline = text.indexOf('\n', selEnd);
    const lineEnd = nextNewline === -1 ? text.length : nextNewline;
    return { blockStart: lineStart, blockEnd: lineEnd };
  };

  // Apply MS Word Paragraph Style properties (text-align, line-height, margin-left) cleanly
  const applyParagraphStyle = (updates: Record<string, string | null>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { blockStart, blockEnd } = getParagraphBounds(
      content,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const rawBlock = content.substring(blockStart, blockEnd);
    const trimmed = rawBlock.trim();

    let styleMap: Record<string, string> = {};
    let innerBody = rawBlock || 'Paragraph text...';

    const existingDiv = trimmed.match(/^<div\s+style="([^"]*)"\s*>([\s\S]*)<\/div>$/i);
    if (existingDiv) {
      styleMap = parseCssStyleString(existingDiv[1]);
      innerBody = existingDiv[2].trim();
    }

    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        delete styleMap[key];
      } else {
        styleMap[key] = val;
      }
    }

    const nextStyle = serializeCssStyleMap(styleMap);
    const isMultiLine = innerBody.includes('\n');
    const replacement = nextStyle
      ? isMultiLine
        ? `<div style="${nextStyle}">\n${innerBody}\n</div>`
        : `<div style="${nextStyle}">${innerBody}</div>`
      : innerBody;

    const updated = `${content.substring(0, blockStart)}${replacement}${content.substring(blockEnd)}`;
    setContent(updated);
    setOpenRibbonMenu(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(blockStart, blockStart + replacement.length);
    }, 10);
  };

  // MS Word Increase / Decrease Paragraph Indent
  const adjustParagraphIndent = (deltaPx: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { blockStart, blockEnd } = getParagraphBounds(
      content,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const rawBlock = content.substring(blockStart, blockEnd).trim();
    const existingDiv = rawBlock.match(/^<div\s+style="([^"]*)"\s*>([\s\S]*)<\/div>$/i);
    let currentIndent = 0;
    if (existingDiv) {
      const styleMap = parseCssStyleString(existingDiv[1]);
      const ml = styleMap['margin-left'] || styleMap['padding-left'] || '0px';
      const parsed = parseInt(ml, 10);
      if (Number.isFinite(parsed)) currentIndent = parsed;
    }
    const nextIndent = Math.max(0, Math.min(160, currentIndent + deltaPx));
    applyParagraphStyle({ 'margin-left': nextIndent > 0 ? `${nextIndent}px` : null });
  };

  // MS Word Paragraph Heading / Block Style selector
  const applyBlockStylePreset = (preset: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'quote' | 'callout') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { blockStart, blockEnd } = getParagraphBounds(
      content,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const rawBlock = content.substring(blockStart, blockEnd);
    const stripped = rawBlock
      .replace(/^#{1,4}\s+/gm, '')
      .replace(/^>\s*(\[!(?:NOTE|TIP|IMPORTANT|WARNING)\]\s*)?/gm, '')
      .trim() || (preset === 'normal' ? 'Paragraph text' : 'Section Heading');

    let replacement = stripped;
    if (preset === 'h1') replacement = `# ${stripped}`;
    else if (preset === 'h2') replacement = `## ${stripped}`;
    else if (preset === 'h3') replacement = `### ${stripped}`;
    else if (preset === 'h4') replacement = `#### ${stripped}`;
    else if (preset === 'quote') replacement = stripped.split('\n').map((l) => `> ${l}`).join('\n');
    else if (preset === 'callout') replacement = `> [!NOTE] Academic Note\n> ${stripped}`;

    const updated = `${content.substring(0, blockStart)}${replacement}${content.substring(blockEnd)}`;
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(blockStart, blockStart + replacement.length);
    }, 10);
  };

  // Apply bullet or numbered list cleanly across selected lines
  const applyListFormatting = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { blockStart, blockEnd } = getParagraphBounds(
      content,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const rawBlock = content.substring(blockStart, blockEnd);
    const lines = (rawBlock || 'List item').split('\n');
    const formatted = lines
      .map((line, idx) => {
        const clean = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').trim();
        if (!clean) return '';
        return ordered ? `${idx + 1}. ${clean}` : `- ${clean}`;
      })
      .filter(Boolean)
      .join('\n');

    const updated = `${content.substring(0, blockStart)}${formatted}${content.substring(blockEnd)}`;
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(blockStart, blockStart + formatted.length);
    }, 10);
  };

  // Keyboard shortcuts inside editor (Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**', 'bold text');
      } else if (k === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*', 'italic text');
      } else if (k === 'u') {
        e.preventDefault();
        insertMarkdown('<u>', '</u>', 'underlined text');
      }
    }
  };

  const handleInsertInlineImage = () => {
    if (!inlineImageUrl.trim()) return;
    const altLabel = inlineImageAlt.trim() || 'Article illustration';
    const isSideAlign = inlineImageAlign === 'left' || inlineImageAlign === 'right';
    const wrapFlag = isSideAlign ? `|wrap:${inlineImageWrap}` : '';
    const metaTag = `${altLabel}|align:${inlineImageAlign}${wrapFlag}`;

    if (isSideAlign && inlineImageWrap) {
      insertMarkdown(`![${metaTag}](${inlineImageUrl.trim()}) `, '', '');
    } else {
      insertMarkdown(`\n![${metaTag}](${inlineImageUrl.trim()})\n`, '', '');
    }

    setInlineImageUrl('');
    setInlineImageAlt('');
    setInlineImageAlign('center');
    setInlineImageWrap(true);
    setInlineImageModal(false);
    triggerToast(
      `Inserted ${inlineImageAlign}-aligned image${
        isSideAlign && inlineImageWrap ? ' with text wrap' : ''
      }`
    );
  };

  const handleInlineFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    if ('preventDefault' in e) e.preventDefault();
    const dtFiles = 'dataTransfer' in e ? e.dataTransfer?.files : undefined;
    const inputEl = 'target' in e ? (e.target as HTMLInputElement) : null;
    const targetFiles = inputEl?.files;
    const file = dtFiles?.[0] || targetFiles?.[0];
    if (inputEl && 'value' in inputEl) {
      inputEl.value = '';
    }
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadBlogMediaFile(file);
      setInlineImageUrl(uploadedUrl);
      if (!inlineImageAlt) {
        setInlineImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      triggerToast(`Uploaded inline image: ${file.name}`);
    } catch (err: any) {
      triggerToast(getFriendlyErrorMessage(err, 'Failed to upload image.'), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dtFiles = 'dataTransfer' in e ? e.dataTransfer?.files : undefined;
    const inputEl = 'target' in e ? (e.target as HTMLInputElement) : null;
    const targetFiles = inputEl?.files;
    const file = dtFiles?.[0] || targetFiles?.[0];
    if (inputEl && 'value' in inputEl) {
      inputEl.value = '';
    }
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadBlogMediaFile(file);
      setCoverUrl(uploadedUrl);
      setImageError(false);
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      triggerToast(`Uploaded cover image: ${file.name}`);
    } catch (err: any) {
      triggerToast(getFriendlyErrorMessage(err, 'Failed to upload cover image.'), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      triggerToast('Please enter an Article Title before publishing.', 'error');
      return;
    }
    if (!content.trim()) {
      triggerToast('Your article body is empty. Add content or choose a template.', 'error');
      return;
    }
    setPublishing(true);
    setSaveStatus('saving');
    try {
      const cleanMeta = metaDescription.trim();
      const fallbackExcerpt =
        cleanMeta ||
        content
          .replace(/[#>*`!\[\]()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180) ||
        title.trim();

      await onSaveBlog({
        ...(initialBlog?.id ? { id: initialBlog.id } : {}),
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        excerpt: fallbackExcerpt,
        content: content.trim(),
        author: initialBlog?.author || currentUserName || 'Editorial Team',
        image: coverUrl.trim(),
        imageUrl: coverUrl.trim(),
        altText: altText.trim() || title.trim(),
        category: category.trim(),
        tags,
        readTime: `${readingTime} min read`,
        featured,
        metaDescription: cleanMeta || fallbackExcerpt,
        focusKeyword: focusKeyword.trim(),
        longTailKeywords: longTailKeywords.trim(),
        lsiKeywords: lsiKeywords.trim(),
      });
      setSaveStatus('saved');
      triggerToast(
        initialBlog ? 'Article updated and synced live!' : 'Article published live to university-tutors.com!',
        'success'
      );
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to publish article.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const groupedTemplates = (Object.entries(templates) as Array<[string, AcademicTemplateItem]>).reduce<
    Record<string, Array<{ key: string } & AcademicTemplateItem>>
  >((groups, [key, tpl]) => {
    const grp = tpl.group || 'Academic Outlines';
    if (!groups[grp]) groups[grp] = [];
    groups[grp].push({ key, ...tpl });
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased rounded-2xl border border-slate-200 overflow-hidden">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border bg-white border-slate-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-800">{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Image Insertion Modal */}
      {inlineImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                Insert & Position Image in Article
              </h3>
              <button
                type="button"
                onClick={() => setInlineImageModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setInlineImageTab('upload')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  inlineImageTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setInlineImageTab('url')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  inlineImageTab === 'url'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Image URL
              </button>
            </div>

            <div className="space-y-4">
              {inlineImageTab === 'upload' ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleInlineFileUpload}
                  onClick={() => inlineFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/40 rounded-xl p-5 text-center cursor-pointer transition"
                >
                  <input
                    ref={inlineFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInlineFileUpload}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-orange-600 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading image...</span>
                    </div>
                  ) : inlineImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={resolveMediaUrl(inlineImageUrl)}
                        alt="Preview"
                        className="max-h-36 mx-auto rounded-lg object-cover border border-slate-200"
                      />
                      <p className="text-xs font-medium text-orange-600">Click to choose a different file</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-800">
                        Click to browse or drag & drop an image
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP, or SVG diagrams</p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={inlineImageUrl}
                    onChange={(e) => setInlineImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Caption / Alt Text
                </label>
                <input
                  type="text"
                  value={inlineImageAlt}
                  onChange={(e) => setInlineImageAlt(e.target.value)}
                  placeholder="e.g., Diagram of MLA citation format"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Image Position & Alignment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'left' as const, label: 'Left', icon: AlignLeft },
                    { id: 'center' as const, label: 'Center', icon: AlignCenter },
                    { id: 'right' as const, label: 'Right', icon: AlignRight },
                    { id: 'full' as const, label: 'Full Width', icon: Maximize2 },
                  ].map((pos) => {
                    const IconComponent = pos.icon;
                    const active = inlineImageAlign === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setInlineImageAlign(pos.id)}
                        className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          active
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(inlineImageAlign === 'left' || inlineImageAlign === 'right') && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/70 border border-orange-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <WrapText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Wrap Article Text Around Image</div>
                      <div className="text-[11px] text-slate-600">
                        Flows paragraphs smoothly beside the {inlineImageAlign}-aligned image
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inlineImageWrap}
                    onClick={() => setInlineImageWrap(!inlineImageWrap)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      inlineImageWrap ? 'bg-orange-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        inlineImageWrap ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Layout Placement Preview
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed clearfix">
                  {inlineImageAlign === 'left' && (
                    <div
                      className={`${
                        inlineImageWrap ? 'float-left mr-3 mb-1' : 'mb-2'
                      } w-20 h-14 rounded-lg bg-orange-200/80 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-800`}
                    >
                      LEFT IMG
                    </div>
                  )}
                  {inlineImageAlign === 'right' && (
                    <div
                      className={`${
                        inlineImageWrap ? 'float-right ml-3 mb-1' : 'ml-auto mb-2'
                      } w-20 h-14 rounded-lg bg-orange-200/80 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-800`}
                    >
                      RIGHT IMG
                    </div>
                  )}
                  {inlineImageAlign === 'center' && (
                    <div className="mx-auto mb-2 w-28 h-12 rounded-lg bg-orange-200/80 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-800">
                      CENTERED IMG
                    </div>
                  )}
                  {inlineImageAlign === 'full' && (
                    <div className="w-full mb-2 h-12 rounded-lg bg-orange-200/80 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-800">
                      FULL WIDTH BANNER IMAGE
                    </div>
                  )}
                  <p>
                    Your educational paragraph text will sit{' '}
                    {inlineImageWrap && (inlineImageAlign === 'left' || inlineImageAlign === 'right')
                      ? `wrapped right alongside the ${inlineImageAlign} edge of your image`
                      : 'cleanly above and below the image block'}{' '}
                    for effortless student reading.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInlineImageModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertInlineImage}
                  disabled={!inlineImageUrl.trim() || uploadingImage}
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Insert into Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM OUTLINE CREATOR MODAL */}
      {outlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Academic Outline</h3>
                  <p className="text-xs text-slate-500">
                    Save a reusable Markdown structure for future university blog posts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOutlineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomOutline} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Outline Name (Dropdown Label) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOutlineLabel}
                    onChange={(e) => setNewOutlineLabel(e.target.value)}
                    placeholder="e.g., Biology Lab Report Outline"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Category</label>
                  <select
                    value={newOutlineCategory}
                    onChange={(e) => setNewOutlineCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pre-filled Article Title</label>
                  <input
                    type="text"
                    value={newOutlineTitle}
                    onChange={(e) => setNewOutlineTitle(e.target.value)}
                    placeholder="e.g., How to Structure a University Lab Report"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suggested Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newOutlineTags}
                    onChange={(e) => setNewOutlineTags(e.target.value)}
                    placeholder="e.g., lab-report, biology, methods"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outline Markdown Structure *</label>
                <textarea
                  rows={7}
                  required
                  value={newOutlineContent}
                  onChange={(e) => setNewOutlineContent(e.target.value)}
                  placeholder="# Heading 1&#10;&#10;## Section Heading&#10;&#10;* Bullet point..."
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOutlineModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Save & Apply Outline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP STICKY STUDIO HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Articles</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-orange-100 text-orange-700">
              Blog Studio
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 ml-1">
              {saveStatus === 'saved' && 'All changes saved'}
              {saveStatus === 'saving' && 'Saving draft...'}
              {saveStatus === 'unsaved' && 'Unsaved changes'}
            </span>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 tabular-nums">
          <span>
            <strong className="text-slate-800">{words}</strong> words
          </span>
          <span className="text-slate-300">|</span>
          <span>
            <strong className="text-slate-800">{characters}</strong> chars
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <strong className="text-slate-800">{readingTime} min</strong> read
          </span>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setShowSidebarMobile(!showSidebarMobile)}
            className="xl:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Toggle SEO & Metadata Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Settings & SEO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSaveStatus('saved');
              triggerToast('Draft saved to workspace');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={() => void handlePublish()}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 rounded-xl shadow-sm shadow-orange-600/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {publishing
                ? 'Publishing...'
                : initialBlog
                ? 'Update Article Post'
                : 'Publish Article Post'}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN TWO-COLUMN STUDIO WORKSPACE */}
      <div className="flex-1 flex flex-col xl:flex-row max-w-[1600px] w-full mx-auto">
        {/* LEFT COLUMN (70%): DISTRACTION-FREE WRITING CANVAS */}
        <main className="flex-1 xl:w-[70%] p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
          {showTemplateBanner && (
            <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Academic Outlines & Templates</h2>
                  <p className="text-xs text-slate-600">
                    Quickly seed the editor workspace with structured academic outlines or create your own.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  defaultValue=""
                  className="w-full sm:w-64 bg-white border border-orange-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Template Outline ({Object.keys(templates).length} Guides) --
                  </option>
                  {Object.entries(groupedTemplates).map(([groupName, items]) => (
                    <optgroup key={groupName} label={groupName}>
                      {items.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setOutlineModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-orange-700 bg-white hover:bg-orange-100/80 border border-orange-300 rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                  title="Create and save a custom article outline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateBanner(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-orange-100/50 transition"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main Editor Document Surface */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden">
            <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title (e.g., MLA Formats Survival Guide)..."
                className="w-full text-2xl sm:text-3xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none tracking-tight"
              />

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">university-tutors.com/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  className="font-mono text-orange-700 bg-orange-50/70 px-2 py-0.5 rounded border border-orange-200/70 focus:outline-none focus:border-orange-500 min-w-[180px]"
                />
              </div>
            </div>

            {/* MS Word-Style Font & Paragraph Ribbon Toolbar */}
            <div className="px-3 sm:px-5 py-2.5 bg-slate-50/95 border-b border-slate-200 space-y-2 relative">
              <div className="flex flex-wrap items-stretch justify-between gap-2">
                <div className="flex flex-wrap items-stretch gap-2">
                  {/* GROUP 1: FONT (MS Word Home -> Font) */}
                  <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Font Family */}
                      <select
                        aria-label="Font Family"
                        title="Font Family"
                        value={selectedFontFamily}
                        onChange={(e) => {
                          setSelectedFontFamily(e.target.value);
                          applyInlineSpanStyle('font-family', e.target.value);
                        }}
                        className="h-7 px-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-orange-500 cursor-pointer max-w-[140px]"
                      >
                        {WORD_FONT_FAMILIES.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Font Size */}
                      <select
                        aria-label="Font Size"
                        title="Font Size"
                        value={selectedFontSize}
                        onChange={(e) => {
                          const sz = Number(e.target.value);
                          setSelectedFontSize(sz);
                          applyInlineSpanStyle('font-size', `${sz}px`);
                        }}
                        className="h-7 px-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-orange-500 cursor-pointer w-[58px]"
                      >
                        {WORD_FONT_SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}px
                          </option>
                        ))}
                      </select>

                      {/* Grow / Shrink Font (A+ / A-) */}
                      <button
                        type="button"
                        onClick={() => adjustFontSize(1)}
                        title="Increase Font Size"
                        className="h-7 px-1.5 rounded-md text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                      >
                        A<span className="text-[9px] align-top">+</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustFontSize(-1)}
                        title="Decrease Font Size"
                        className="h-7 px-1.5 rounded-md text-[11px] font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                      >
                        A<span className="text-[9px] align-top">-</span>
                      </button>

                      {/* Change Case (Aa) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenRibbonMenu(openRibbonMenu === 'case' ? null : 'case')}
                          title="Change Case"
                          className="h-7 px-1.5 rounded-md text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer flex items-center gap-0.5"
                        >
                          <CaseSensitive className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        {openRibbonMenu === 'case' && (
                          <div className="absolute left-0 top-8 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-xs">
                            {[
                              { id: 'sentence' as const, label: 'Sentence case.' },
                              { id: 'lower' as const, label: 'lowercase' },
                              { id: 'upper' as const, label: 'UPPERCASE' },
                              { id: 'title' as const, label: 'Capitalize Each Word' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => applyChangeCase(opt.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-700 text-slate-700 cursor-pointer"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <ToolbarButton
                        icon={<RemoveFormatting className="w-3.5 h-3.5" />}
                        label="Clear All Formatting"
                        onClick={clearSelectionFormatting}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-0.5 mt-1 pt-1 border-t border-slate-100">
                      <ToolbarButton
                        icon={<Bold className="w-3.5 h-3.5" />}
                        label="Bold (Ctrl+B)"
                        onClick={() => insertMarkdown('**', '**', 'bold text')}
                      />
                      <ToolbarButton
                        icon={<Italic className="w-3.5 h-3.5" />}
                        label="Italic (Ctrl+I)"
                        onClick={() => insertMarkdown('*', '*', 'italic text')}
                      />
                      <ToolbarButton
                        icon={<Underline className="w-3.5 h-3.5" />}
                        label="Underline (Ctrl+U)"
                        onClick={() => insertMarkdown('<u>', '</u>', 'underlined text')}
                      />
                      <ToolbarButton
                        icon={<Strikethrough className="w-3.5 h-3.5" />}
                        label="Strikethrough"
                        onClick={() => insertMarkdown('~~', '~~', 'strikethrough text')}
                      />
                      <ToolbarButton
                        icon={<Subscript className="w-3.5 h-3.5" />}
                        label="Subscript (H₂O)"
                        onClick={() => insertMarkdown('<sub>', '</sub>', '2')}
                      />
                      <ToolbarButton
                        icon={<Superscript className="w-3.5 h-3.5" />}
                        label="Superscript (X²)"
                        onClick={() => insertMarkdown('<sup>', '</sup>', '2')}
                      />

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      {/* Text Color Picker */}
                      <div className="relative">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => applyInlineSpanStyle('color', selectedTextColor)}
                            title="Apply Font Color"
                            className="p-1.5 rounded-l-md text-slate-700 hover:bg-orange-50 transition cursor-pointer flex flex-col items-center justify-center"
                          >
                            <span className="text-xs font-extrabold leading-none">A</span>
                            <span
                              className="w-3.5 h-1 rounded-xs mt-0.5"
                              style={{ backgroundColor: selectedTextColor }}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenRibbonMenu(openRibbonMenu === 'textColor' ? null : 'textColor')}
                            title="Choose Font Color"
                            className="px-0.5 py-1.5 rounded-r-md text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        {openRibbonMenu === 'textColor' && (
                          <div className="absolute left-0 top-8 z-30 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Font Color
                            </div>
                            <div className="grid grid-cols-6 gap-1.5">
                              {WORD_TEXT_COLORS.map((c) => (
                                <button
                                  key={c.value}
                                  type="button"
                                  title={c.label}
                                  onClick={() => {
                                    setSelectedTextColor(c.value);
                                    applyInlineSpanStyle('color', c.value);
                                  }}
                                  className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition cursor-pointer"
                                  style={{ backgroundColor: c.value }}
                                />
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <label className="text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer">
                                <span>Custom:</span>
                                <input
                                  type="color"
                                  value={selectedTextColor}
                                  onChange={(e) => {
                                    setSelectedTextColor(e.target.value);
                                    applyInlineSpanStyle('color', e.target.value);
                                  }}
                                  className="w-6 h-5 cursor-pointer border-0 bg-transparent p-0"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => applyInlineSpanStyle('color', null)}
                                className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Text Highlight Color Picker */}
                      <div className="relative">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => applyHighlightColor(selectedHighlightColor)}
                            title="Apply Text Highlight Color"
                            className="p-1.5 rounded-l-md text-slate-700 hover:bg-orange-50 transition cursor-pointer flex flex-col items-center justify-center"
                          >
                            <Highlighter className="w-3.5 h-3.5" />
                            <span
                              className="w-3.5 h-1 rounded-xs mt-0.5"
                              style={{ backgroundColor: selectedHighlightColor }}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenRibbonMenu(openRibbonMenu === 'highlight' ? null : 'highlight')}
                            title="Choose Highlight Color"
                            className="px-0.5 py-1.5 rounded-r-md text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        {openRibbonMenu === 'highlight' && (
                          <div className="absolute left-0 top-8 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Text Highlight
                            </div>
                            <div className="grid grid-cols-6 gap-1.5">
                              {WORD_HIGHLIGHT_COLORS.map((c) => (
                                <button
                                  key={c.value}
                                  type="button"
                                  title={c.label}
                                  onClick={() => {
                                    setSelectedHighlightColor(c.value);
                                    applyHighlightColor(c.value);
                                  }}
                                  className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition cursor-pointer"
                                  style={{ backgroundColor: c.value }}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => applyHighlightColor(null)}
                              className="w-full py-1 text-[11px] font-semibold text-slate-600 hover:text-orange-600 border-t border-slate-100 cursor-pointer"
                            >
                              No Highlight
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mt-1 select-none">
                      Font
                    </div>
                  </div>

                  {/* GROUP 2: PARAGRAPH (MS Word Home -> Paragraph) */}
                  <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Paragraph Heading / Block Style */}
                      <select
                        aria-label="Paragraph Style"
                        title="Paragraph Style (Headings, Normal, Callout)"
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value as 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'quote' | 'callout';
                          if (v) applyBlockStylePreset(v);
                          e.target.value = '';
                        }}
                        className="h-7 px-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="" disabled>
                          Styles...
                        </option>
                        <option value="normal">Normal Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="quote">Blockquote</option>
                        <option value="callout">Academic Callout Box</option>
                      </select>

                      <div className="h-4 w-px bg-slate-200 mx-0.5" />

                      <ToolbarButton
                        icon={<List className="w-3.5 h-3.5" />}
                        label="Bulleted List"
                        onClick={() => applyListFormatting(false)}
                      />
                      <ToolbarButton
                        icon={<ListOrdered className="w-3.5 h-3.5" />}
                        label="Numbered List"
                        onClick={() => applyListFormatting(true)}
                      />

                      <div className="h-4 w-px bg-slate-200 mx-0.5" />

                      <ToolbarButton
                        icon={<IndentDecrease className="w-3.5 h-3.5" />}
                        label="Decrease Paragraph Indent"
                        onClick={() => adjustParagraphIndent(-32)}
                      />
                      <ToolbarButton
                        icon={<IndentIncrease className="w-3.5 h-3.5" />}
                        label="Increase Paragraph Indent"
                        onClick={() => adjustParagraphIndent(32)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-0.5 mt-1 pt-1 border-t border-slate-100">
                      <ToolbarButton
                        icon={<AlignLeft className="w-3.5 h-3.5" />}
                        label="Align Left"
                        onClick={() => applyParagraphStyle({ 'text-align': 'left' })}
                      />
                      <ToolbarButton
                        icon={<AlignCenter className="w-3.5 h-3.5" />}
                        label="Align Center"
                        onClick={() => applyParagraphStyle({ 'text-align': 'center' })}
                      />
                      <ToolbarButton
                        icon={<AlignRight className="w-3.5 h-3.5" />}
                        label="Align Right"
                        onClick={() => applyParagraphStyle({ 'text-align': 'right' })}
                      />
                      <ToolbarButton
                        icon={<AlignJustify className="w-3.5 h-3.5" />}
                        label="Justify Paragraph"
                        onClick={() => applyParagraphStyle({ 'text-align': 'justify' })}
                      />

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      {/* Line & Paragraph Spacing */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenRibbonMenu(openRibbonMenu === 'lineSpacing' ? null : 'lineSpacing')}
                          title="Line and Paragraph Spacing"
                          className="h-7 px-1.5 rounded-md text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>{selectedLineSpacing}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        {openRibbonMenu === 'lineSpacing' && (
                          <div className="absolute left-0 top-8 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-xs">
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Line Spacing
                            </div>
                            {WORD_LINE_SPACINGS.map((ls) => (
                              <button
                                key={ls.value}
                                type="button"
                                onClick={() => {
                                  setSelectedLineSpacing(ls.value);
                                  applyParagraphStyle({ 'line-height': ls.value });
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-700 cursor-pointer ${
                                  selectedLineSpacing === ls.value ? 'font-bold text-orange-700 bg-orange-50/50' : 'text-slate-700'
                                }`}
                              >
                                {ls.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      <ToolbarButton
                        icon={<Heading1 className="w-3.5 h-3.5" />}
                        label="Heading 1"
                        onClick={() => applyBlockStylePreset('h1')}
                      />
                      <ToolbarButton
                        icon={<Heading2 className="w-3.5 h-3.5" />}
                        label="Heading 2"
                        onClick={() => applyBlockStylePreset('h2')}
                      />
                      <ToolbarButton
                        icon={<Heading3 className="w-3.5 h-3.5" />}
                        label="Heading 3"
                        onClick={() => applyBlockStylePreset('h3')}
                      />
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mt-1 select-none">
                      Paragraph
                    </div>
                  </div>

                  {/* GROUP 3: INSERT */}
                  <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-0.5 my-auto">
                      <ToolbarButton
                        icon={<ImageIcon className="w-3.5 h-3.5" />}
                        label="Insert Inline Image"
                        onClick={() => setInlineImageModal(true)}
                      />
                      <ToolbarButton
                        icon={<LinkIcon className="w-3.5 h-3.5" />}
                        label="Insert Link"
                        onClick={() => insertMarkdown('[', '](https://)', 'link text')}
                      />
                      <ToolbarButton
                        icon={<Quote className="w-3.5 h-3.5" />}
                        label="Academic Quote"
                        onClick={() => applyBlockStylePreset('quote')}
                      />
                      <ToolbarButton
                        icon={<Code className="w-3.5 h-3.5" />}
                        label="Inline Code / Citation"
                        onClick={() => insertMarkdown('`', '`', 'citation')}
                      />
                      <ToolbarButton
                        icon={<Minus className="w-3.5 h-3.5" />}
                        label="Horizontal Divider"
                        onClick={() => insertMarkdown('\n---\n', '', '')}
                      />
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mt-1 select-none">
                      Insert
                    </div>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center self-start bg-slate-200/70 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('write')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5 text-orange-600" />
                    <span>Write</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5 text-orange-600" />
                    <span>Split</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-600" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Body (Write / Split / Live Preview) */}
            <div
              onClick={() => openRibbonMenu && setOpenRibbonMenu(null)}
              className={`flex-1 grid ${
                viewMode === 'split'
                  ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200'
                  : 'grid-cols-1'
              } min-h-[540px]`}
            >
              {(viewMode === 'write' || viewMode === 'split') && (
                <div className="flex flex-col p-6 sm:p-8">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Write your academic article here. Select text to apply Font styles (family, size, color, highlight, bold, italic, underline) or Paragraph styles (alignment, line spacing, indent, headings, lists)..."
                    className="w-full flex-1 min-h-[460px] resize-none text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono sm:font-sans"
                  />
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="p-6 sm:p-8 bg-slate-50/30 overflow-y-auto">
                  {viewMode === 'split' && (
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-orange-500" />
                      Live Document Preview
                    </div>
                  )}
                  <article className="max-w-3xl mx-auto">
                    {coverUrl && !imageError && (
                      <img
                        src={resolveMediaUrl(coverUrl)}
                        alt={altText || title}
                        className="w-full h-56 sm:h-64 object-cover rounded-2xl mb-6 border border-slate-200 shadow-xs"
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-500">
                      <span className="font-semibold text-orange-700">{category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{readingTime} min read</span>
                    </div>
                    {title && (
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                        {title}
                      </h1>
                    )}
                    <div>{renderBlogStudioMarkdown(content)}</div>
                  </article>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN (30%): PUBLISHING, MEDIA & SEO SIDEBAR */}
        <aside
          className={`${
            showSidebarMobile ? 'block' : 'hidden'
          } xl:block w-full xl:w-[30%] xl:max-w-[440px] border-t xl:border-t-0 xl:border-l border-slate-200 bg-white p-5 sm:p-6 space-y-6 overflow-y-auto`}
        >
          {/* CARD 1: COVER IMAGE */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                Cover Theme Image
              </h3>
              {coverUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverUrl('');
                    setAltText('');
                  }}
                  className="text-xs text-slate-400 hover:text-red-500 transition cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCoverImageTab('upload')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                  coverImageTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setCoverImageTab('gallery')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                  coverImageTab === 'gallery'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stock Gallery
              </button>
              <button
                type="button"
                onClick={() => setCoverImageTab('url')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                  coverImageTab === 'url'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Image URL
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition aspect-video flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-orange-400 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileDrop}
                className="hidden"
              />
              {coverUrl && !imageError ? (
                <>
                  <img
                    src={resolveMediaUrl(coverUrl)}
                    alt={altText || 'Cover preview'}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-slate-900/55 ${uploadingImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition flex flex-col items-center justify-center text-white p-4 text-center`}>
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 mb-1.5 text-orange-400 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6 mb-1.5 text-orange-400" />
                    )}
                    <span className="text-xs font-semibold">
                      {uploadingImage ? 'Uploading Cover Image...' : 'Upload New Cover Image'}
                    </span>
                    <span className="text-[11px] text-slate-200 mt-0.5">Click to browse or drag & drop</span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                    {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {uploadingImage ? 'Uploading cover photo...' : 'Click to upload or drag & drop cover photo'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP, GIF, AVIF • Max 15MB</p>
                </div>
              )}
            </div>

            {coverImageTab === 'upload' && (
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/70 text-orange-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                {uploadingImage ? 'Uploading Image...' : 'Choose Image from Computer'}
              </button>
            )}

            {coverImageTab === 'gallery' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {SUGGESTED_COVER_IMAGES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setCoverUrl(item.url);
                      setAltText(item.alt);
                      setImageError(false);
                      triggerToast(`Applied "${item.label}" cover`);
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 aspect-video transition cursor-pointer ${
                      coverUrl === item.url
                        ? 'border-orange-600 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-orange-400'
                    }`}
                    title={item.label}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-1.5 py-1">
                      <span className="block text-[9px] font-medium text-white truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {coverImageTab === 'url' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Paste Unsplash or Direct Image URL
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Image Alt Text (SEO & Accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the cover image for search engines..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* CARD 2: CATEGORY & INTERACTIVE TAGS */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-orange-600" />
              Organization & Taxonomy
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blog Category Focus *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-800 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">Feature Article on Blog Home</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-orange-600 rounded"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Article Tags
                </span>
                <span className="text-[11px] font-normal text-slate-400">Press Enter or comma</span>
              </label>

              <div className="min-h-[44px] p-2 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 flex flex-wrap gap-1.5 items-center">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200/70"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-600 hover:text-orange-900 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'Add tags (e.g. mla, oxford)...' : 'Add tag...'}
                  className="flex-1 min-w-[100px] text-xs bg-transparent focus:outline-none px-1 py-1 text-slate-800"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* CARD 3: SEO & KEYWORD OPTIMIZATION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-orange-600" />
                SEO & Search Ranking
              </h3>
              <span className="text-xs font-semibold text-emerald-700">
                {focusKeyword && metaDescription.length >= 50 ? 'Optimized' : 'Needs Meta'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <span>university-tutors.com › blog › {slug}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </div>
              <div className="text-sm font-semibold text-blue-700 leading-snug line-clamp-1">
                {title || 'Your Article Title Appears Here'}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDescription ||
                  'Add a compelling meta description below to control how your article appears in Google search results.'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Summarize the key takeaway for students searching on Google..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Focus Keyword</label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g., MLA formats survival guide"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Long-Tail Search Phrases</label>
              <input
                type="text"
                value={longTailKeywords}
                onChange={(e) => setLongTailKeywords(e.target.value)}
                placeholder="e.g., how to format MLA 9th edition paper"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semantic / LSI Keywords</label>
              <input
                type="text"
                value={lsiKeywords}
                onChange={(e) => setLsiKeywords(e.target.value)}
                placeholder="e.g., Works Cited, hanging indent, bibliography"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
    >
      {icon}
    </button>
  );
}

export default AdminBlogStudio;
