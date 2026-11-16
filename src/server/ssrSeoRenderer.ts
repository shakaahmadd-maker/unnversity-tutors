import { COUNTRY_ONLINE_TUTORING_PAGES } from '../data/countryOnlineTutoringData';
import { DEDICATED_SERVICE_ROUTES, resolveDedicatedServiceRoute } from '../data/dedicatedServiceRoutes';
import { SPECIALIZED_SERVICE_PAGES_MAP } from '../data/specializedTutoringServicesData';
import { TOOLS_SEO_META_BY_PATH, TOOLS_SEO_META_LIST } from '../data/toolsSeoMeta';
import { DEFAULT_20_BLOGS } from '../data/defaultBlogsData';
import { getBlogCanonicalSlug, matchesBlogSlugOrId } from '../utils/blogSlug';
import { getTutorCanonicalSlug, matchesTutorSlugOrId } from '../utils/tutorSlug';

export const CANONICAL_BASE_URL = 'https://university-tutors.com';

interface SsrRenderParams {
  reqPath: string;
  templateHtml: string;
  loadMergedPublicTutorCatalog: (opts?: { activeOnly?: boolean }) => Promise<{
    allTutors: any[];
    slugMap: Map<string, string>;
    canonicalByRawId: Map<string, any>;
  }>;
  loadSitemapDatabaseRecords: () => Promise<{
    blogs: any[];
    tutors: any[];
  }>;
}

interface ResolvedRouteSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  ogType: 'website' | 'article' | 'profile';
  ogImage: string;
  includeRegionalHreflangs: boolean;
  structuredData: Record<string, any>[];
  initialClientData?: Record<string, any> | null;
  mainHtml: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJsonScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function normalizePathname(rawPath: string): string {
  const withoutQuery = String(rawPath || '/').split('?')[0].split('#')[0];
  let decoded = withoutQuery;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    decoded = withoutQuery;
  }
  const collapsed = ('/' + decoded.trim().replace(/^\/+/, '')).replace(/\/{2,}/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1);
  }
  return collapsed || '/';
}

function clipMetaDescription(text: string, maxLen = 158): string {
  const clean = String(text || '')
    .replace(/[#*`>_~|[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) {
    return 'Connect with vetted 1-on-1 university tutors for STEM, essays, coursework & exam prep, plus free academic tools at University Tutors.';
  }
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > 90 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

function parseSubjectsList(raw: unknown, primarySubject?: string): string[] {
  const out: string[] = [];
  const pushItem = (val: string) => {
    const clean = val.replace(/^[\["']+|[\]"']+$/g, '').trim();
    if (clean && !out.some((x) => x.toLowerCase() === clean.toLowerCase())) {
      out.push(clean);
    }
  };
  if (primarySubject && String(primarySubject).trim()) {
    pushItem(String(primarySubject));
  }
  if (Array.isArray(raw)) {
    raw.forEach((v) => typeof v === 'string' && pushItem(v));
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsed.forEach((v) => typeof v === 'string' && pushItem(v));
          return out;
        }
      } catch {
        // Fallback to comma split
      }
    }
    trimmed.split(',').forEach(pushItem);
  }
  return out;
}

function sanitizePublicTutorForSsr(tutor: any, slug: string): Record<string, any> {
  const subjects = parseSubjectsList(tutor.subjectExpertise || tutor.subjects, tutor.primarySubject);
  return {
    id: tutor.id,
    role: 'tutor',
    name: tutor.name,
    slug,
    avatarUrl: tutor.avatarUrl || tutor.profileImageUrl || '',
    profileImageUrl: tutor.profileImageUrl || tutor.avatarUrl || '',
    bio: tutor.bio || '',
    experience: tutor.experience || tutor.experienceSummary || tutor.bio || '',
    experienceSummary: tutor.experienceSummary || tutor.experience || '',
    education: tutor.education || '',
    location: tutor.location || tutor.cityLocation || '',
    city: tutor.city || '',
    country: tutor.country || '',
    hourlyRate: tutor.hourlyRate,
    rating: tutor.rating || 4.9,
    reviewCount: tutor.reviewCount ?? tutor.reviewsCount ?? 120,
    primarySubject: tutor.primarySubject || subjects[0] || '',
    subjects,
    subjectExpertise: subjects,
    availability: tutor.availability || tutor.availabilities || 'Flexible 7-day schedule & online',
    canMeet: tutor.canMeet || '1-on-1 Live Online & Interactive Whiteboard',
    hobbies: tutor.hobbies || '',
    tutorTier: tutor.tutorTier || tutor.tier || '',
    verificationStatus: tutor.verificationStatus || 'Verified Degree & Background',
    isApproved: tutor.isApproved !== false,
    status: tutor.status || 'approved',
  };
}

function markdownToSimpleHtml(markdown: string): string {
  const lines = String(markdown || '').split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      htmlParts.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      closeList();
      htmlParts.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeList();
      htmlParts.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const cleanItem = line.slice(2).replace(/\*\*/g, '');
      htmlParts.push(`<li>${escapeHtml(cleanItem)}</li>`);
    } else {
      closeList();
      const cleanParagraph = line.replace(/\*\*/g, '').replace(/\*/g, '');
      htmlParts.push(`<p>${escapeHtml(cleanParagraph)}</p>`);
    }
  }
  closeList();
  return htmlParts.join('\n');
}

const REGIONAL_HREFLANG_LINKS = [
  '<link rel="alternate" hreflang="x-default" href="https://university-tutors.com/" />',
  '<link rel="alternate" hreflang="en" href="https://university-tutors.com/" />',
  '<link rel="alternate" hreflang="en-US" href="https://university-tutors.com/" />',
  '<link rel="alternate" hreflang="en-GB" href="https://university-tutors.com/online-tutoring-uk" />',
  '<link rel="alternate" hreflang="en-CA" href="https://university-tutors.com/online-tutoring-canada" />',
  '<link rel="alternate" hreflang="en-AU" href="https://university-tutors.com/online-tutoring-australia" />',
  '<link rel="alternate" hreflang="en-NZ" href="https://university-tutors.com/online-tutoring-new-zealand" />',
  '<link rel="alternate" hreflang="en-SG" href="https://university-tutors.com/online-tutoring-singapore" />',
  '<link rel="alternate" hreflang="en-IE" href="https://university-tutors.com/online-tutoring-ireland" />',
  '<link rel="alternate" hreflang="en-AE" href="https://university-tutors.com/online-tutoring-uae" />',
].join('\n    ');

const CORE_NAV_LINKS_HTML = `
  <nav aria-label="Primary Crawl Navigation" class="preboot-nav-links">
    <a href="/">Home</a>
    <a href="/tutors">Find Tutors</a>
    <a href="/services">Services</a>
    <a href="/tools">Free Tools</a>
    <a href="/blog">Study Blog</a>
    <a href="/about">About</a>
    <a href="/faqs">FAQs</a>
    <a href="/contact">Contact</a>
    <a href="/get-a-quote">Get a Quote</a>
  </nav>
`;

const DEFAULT_ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${CANONICAL_BASE_URL}/#organization`,
      name: 'University Tutors',
      url: `${CANONICAL_BASE_URL}/`,
      logo: `${CANONICAL_BASE_URL}/logo.webp`,
      description:
        'Verified 1-on-1 expert academic tutoring, assignment guidance, coursework support, and free STEM study tools across major universities.',
      sameAs: [
        'https://twitter.com/UniversityTutors',
        'https://linkedin.com/company/university-tutors',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${CANONICAL_BASE_URL}/#website`,
      url: `${CANONICAL_BASE_URL}/`,
      name: 'University Tutors',
      publisher: { '@id': `${CANONICAL_BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${CANONICAL_BASE_URL}/tutors?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

function buildHomepageMainHtml(tutors: any[], blogs: any[]): string {
  const featuredTutors = tutors.slice(0, 8);
  const featuredBlogs = blogs.slice(0, 6);
  const featuredTools = TOOLS_SEO_META_LIST.slice(0, 8);
  const countryEntries = Object.values(COUNTRY_ONLINE_TUTORING_PAGES);

  return `
    <article class="preboot-article">
      <section class="preboot-hero">
        <p class="preboot-eyebrow">Your Global Partner for Academic Success</p>
        <h1>Expert Tutors for Every University Subject Online, On-Demand</h1>
        <p class="preboot-lead">
          Connect with verified PhD and Master&apos;s academic tutors for 1-on-1 live tutoring, exam prep, coursework mentoring, and essay structure review across US, UK, Canada, Australia, Ireland, New Zealand, Singapore, and UAE universities — protected by milestone escrow.
        </p>
        <div class="preboot-cta-row">
          <a href="/tutors" class="preboot-btn-primary">Browse 500+ Verified Tutors</a>
          <a href="/get-a-quote" class="preboot-btn-secondary">Request a Free Quote</a>
          <a href="/tools" class="preboot-btn-secondary">Explore Free Student Tools</a>
        </div>
      </section>

      <section class="preboot-section">
        <h2>Core Academic Tutoring Services</h2>
        <div class="preboot-grid">
          ${DEDICATED_SERVICE_ROUTES.map(
            (s) => `
            <div class="preboot-card">
              <h3><a href="${escapeHtml(s.path)}">${escapeHtml(s.label)}</a></h3>
              <p>${escapeHtml(s.seoDescription)}</p>
            </div>`
          ).join('')}
        </div>
      </section>

      <section class="preboot-section">
        <h2>Top Rated Verified University Tutors</h2>
        <div class="preboot-grid">
          ${featuredTutors
            .map((t) => {
              const slug = t.slug || getTutorCanonicalSlug(t);
              const subjects = parseSubjectsList(t.subjectExpertise || t.subjects, t.primarySubject);
              return `
              <div class="preboot-card">
                <h3><a href="/tutor/${escapeHtml(encodeURIComponent(slug))}">${escapeHtml(t.name)}</a></h3>
                <p><strong>${escapeHtml(subjects.slice(0, 3).join(', ') || 'University Subjects')}</strong>${t.education ? ` &bull; ${escapeHtml(t.education)}` : ''}</p>
                <p>${escapeHtml(clipMetaDescription(t.bio || t.experience || '', 130))}</p>
                <a href="/tutor/${escapeHtml(encodeURIComponent(slug))}">View Full Profile &rarr;</a>
              </div>`;
            })
            .join('')}
        </div>
        <p><a href="/tutors">View All Verified University Tutors &rarr;</a></p>
      </section>

      <section class="preboot-section">
        <h2>Free Browser-Based Student &amp; STEM Tools</h2>
        <div class="preboot-links-wrap">
          <a href="/tools">All Student Tools Hub</a>
          <a href="/tools/math">27 Math &amp; Statistics Solvers</a>
          <a href="/tools/biology">14 Biology &amp; Genetics Lab Tools</a>
          <a href="/tools/chemistry">16 Chemistry &amp; Spectroscopy Tools</a>
          ${featuredTools
            .map((tool) => `<a href="${escapeHtml(tool.path)}">${escapeHtml(tool.title)}</a>`)
            .join('')}
        </div>
      </section>

      <section class="preboot-section">
        <h2>Academic Study Guides &amp; Citation Manuals</h2>
        <div class="preboot-grid">
          ${featuredBlogs
            .map((b) => {
              const slug = getBlogCanonicalSlug(b);
              return `
              <div class="preboot-card">
                <h3><a href="/blog/${escapeHtml(encodeURIComponent(slug))}">${escapeHtml(b.title)}</a></h3>
                <p>${escapeHtml(clipMetaDescription(b.excerpt || b.content || '', 130))}</p>
              </div>`;
            })
            .join('')}
        </div>
        <p><a href="/blog">Read All Academic Study Guides &rarr;</a></p>
      </section>

      <section class="preboot-section">
        <h2>International Online Tutoring Portals</h2>
        <div class="preboot-links-wrap">
          ${countryEntries
            .map(
              (c) =>
                `<a href="/online-tutoring-${escapeHtml(c.slug)}">${escapeHtml(c.countryName)} Online Tutoring</a>`
            )
            .join('')}
        </div>
      </section>
    </article>
  `;
}

function buildBlogHubMainHtml(blogs: any[]): string {
  const categorySummaries = [
    {
      name: 'Dissertation & Thesis Architecture',
      desc: 'Structured research roadmaps, methodology selection guides, literature synthesis matrices, and chapter pacing for undergraduate and Master’s theses.',
    },
    {
      name: 'APA 7th, Harvard & Chicago Referencing',
      desc: 'Verified formatting rules for parenthetical vs. narrative citations, DOIs, secondary sources, and annotated bibliographies.',
    },
    {
      name: 'STEM Exam Recall & Calculus Mastery',
      desc: 'Evidence-based spaced repetition schedules, active recall workflows, multivariable calculus steps, and physics problem-solving blueprints.',
    },
    {
      name: 'Academic Integrity & Milestone Protection',
      desc: 'Practical guidance on ethical mentorship, Turnitin similarity best practices, proofreading checklists, and escrow safety standards.',
    },
  ];

  return `
    <article class="preboot-article">
      <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <span>Academic Blog &amp; Study Guides</span></nav>
      <h1>University Study Guides, Citation Manuals &amp; Academic Blog</h1>
      <p class="preboot-lead">
        Peer-reviewed academic frameworks, APA &amp; Harvard formatting manuals, dissertation planning templates, and exam preparation guides written by verified faculty and mentors.
      </p>

      <section class="preboot-section">
        <h2>Featured Study Guide Tracks &amp; Categories</h2>
        <div class="preboot-grid">
          ${categorySummaries
            .map(
              (c) => `
            <div class="preboot-card">
              <h3>${escapeHtml(c.name)}</h3>
              <p>${escapeHtml(c.desc)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="preboot-section">
        <h2>Published Study Guides &amp; Articles (${blogs.length})</h2>
        <div class="preboot-grid">
          ${blogs
            .map((b) => {
              const slug = getBlogCanonicalSlug(b);
              const excerpt = clipMetaDescription(b.excerpt || b.content || '', 175);
              return `
              <div class="preboot-card">
                <p class="preboot-eyebrow">${escapeHtml(b.category || 'Study Guide')}</p>
                <h3><a href="/blog/${escapeHtml(encodeURIComponent(slug))}">${escapeHtml(b.title)}</a></h3>
                <p>${escapeHtml(excerpt)}</p>
                <a href="/blog/${escapeHtml(encodeURIComponent(slug))}">Read Full Study Guide &rarr;</a>
              </div>`;
            })
            .join('')}
        </div>
      </section>

      <section class="preboot-section">
        <h2>Explore Tutors &amp; Free Study Utilities</h2>
        <div class="preboot-links-wrap">
          <a href="/tutors">Browse Verified Tutors</a>
          <a href="/tools/citation-generator">Free APA/MLA Citation Generator</a>
          <a href="/tools/academic-paraphraser">Academic Paraphraser</a>
          <a href="/tools/university-grade-converter">University Grade Converter</a>
          <a href="/services/essay-reference-checks">Essay &amp; Reference Checks</a>
        </div>
      </section>
    </article>
  `;
}

function buildTutorsDirectoryMainHtml(tutors: any[]): string {
  const sampleTutors = tutors.slice(0, 36);
  return `
    <article class="preboot-article">
      <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <span>Find Verified Tutors</span></nav>
      <h1>Find Verified University Tutors &amp; Academic Mentors</h1>
      <p class="preboot-lead">
        Compare ${tutors.length || 500}+ vetted PhD and Master&apos;s tutors across Calculus, Organic Chemistry, Computer Science, Finance, Nursing, Psychology, and Academic Writing across US, UK, Canada, Australia, Ireland, New Zealand, Singapore, and UAE.
      </p>

      <section class="preboot-section">
        <h2>Featured Subject Specialists</h2>
        <div class="preboot-grid">
          ${sampleTutors
            .map((t) => {
              const slug = t.slug || getTutorCanonicalSlug(t);
              const subjects = parseSubjectsList(t.subjectExpertise || t.subjects, t.primarySubject);
              const loc = t.location || t.city || t.country || 'Online Worldwide';
              return `
              <div class="preboot-card">
                <h3><a href="/tutor/${escapeHtml(encodeURIComponent(slug))}">${escapeHtml(t.name)}</a></h3>
                <p><strong>${escapeHtml(subjects.slice(0, 4).join(', ') || 'Academic Subjects')}</strong></p>
                <p>${escapeHtml(t.education || 'Verified University Faculty')} &bull; ${escapeHtml(loc)} &bull; $${escapeHtml(t.hourlyRate || 45)}/hr &bull; ${escapeHtml(t.rating || 4.9)}★</p>
                <p>${escapeHtml(clipMetaDescription(t.bio || t.experience || '', 130))}</p>
                <a href="/tutor/${escapeHtml(encodeURIComponent(slug))}">View Full Profile &rarr;</a>
              </div>`;
            })
            .join('')}
        </div>
      </section>

      <section class="preboot-section">
        <h2>Tutoring by Region &amp; Service Track</h2>
        <div class="preboot-links-wrap">
          <a href="/online-tutoring-usa">USA Online Tutoring</a>
          <a href="/online-tutoring-uk">UK Online Tutoring</a>
          <a href="/online-tutoring-canada">Canada Online Tutoring</a>
          <a href="/online-tutoring-australia">Australia Online Tutoring</a>
          <a href="/services/1-on-1-live-tutoring">1-on-1 Live Tutoring</a>
          <a href="/get-a-quote">Request a Custom Quote</a>
        </div>
      </section>
    </article>
  `;
}

export async function renderSeoHtml(params: SsrRenderParams): Promise<string> {
  const { reqPath, templateHtml, loadMergedPublicTutorCatalog, loadSitemapDatabaseRecords } = params;
  const normalizedPath = normalizePathname(reqPath);
  const lowerPath = normalizedPath.toLowerCase();

  let seo: ResolvedRouteSeo | null = null;

  // 1. Utility / Redirect / Private routes
  if (lowerPath === '/whatsapp' || lowerPath === '/whatsapp-desk') {
    seo = {
      title: '24/7 Academic Desk | University Tutors',
      description: 'Connect with a live University Tutors academic coordinator for fast tutor matching and milestone escrow onboarding.',
      canonicalUrl: `${CANONICAL_BASE_URL}/`,
      robots: 'noindex, follow',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: false,
      structuredData: [],
      mainHtml: `
        <article class="preboot-article">
          <h1>24/7 Live Academic Advising Desk</h1>
          <p>Reach a human academic coordinator directly or return to our <a href="/">homepage</a> and <a href="/tutors">verified tutors directory</a>.</p>
        </article>
      `,
    };
  } else if (
    lowerPath === '/auth' ||
    lowerPath === '/login' ||
    lowerPath === '/signup' ||
    lowerPath === '/admin' ||
    lowerPath.startsWith('/admin/') ||
    lowerPath === '/student' ||
    lowerPath.startsWith('/student/') ||
    lowerPath === '/tutor/dashboard' ||
    lowerPath === '/chat' ||
    lowerPath === '/chats' ||
    lowerPath === '/dashboard' ||
    lowerPath === '/user-data' ||
    lowerPath === '/users-data' ||
    lowerPath === '/reset-password'
  ) {
    seo = {
      title: 'Account Portal | University Tutors',
      description: 'Sign in or manage your University Tutors sessions, coursework milestones, and messages.',
      canonicalUrl: `${CANONICAL_BASE_URL}${normalizedPath}`,
      robots: 'noindex, nofollow',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: false,
      structuredData: [],
      mainHtml: `
        <article class="preboot-article">
          <h1>University Tutors Account Portal</h1>
          <p>Access your personalized dashboard or explore <a href="/tutors">verified university tutors</a> and <a href="/tools">free student tools</a>.</p>
        </article>
      `,
    };
  }

  // 2. Individual Tutor Profile: /tutor/:slug, /tutors/:slug, /tutor-profile/:slug
  if (
    !seo &&
    ((lowerPath.startsWith('/tutor/') && lowerPath !== '/tutor/dashboard') ||
      (lowerPath.startsWith('/tutors/') && lowerPath !== '/tutors-directory') ||
      lowerPath.startsWith('/tutor-profile/'))
  ) {
    const segments = normalizedPath.split('/').filter(Boolean);
    const rawSlug = segments.length >= 2 ? segments.slice(1).join('/') : '';
    const { allTutors, slugMap, canonicalByRawId } = await loadMergedPublicTutorCatalog({
      activeOnly: false,
    });
    const matchedTutor =
      allTutors.find((t) => t.slug === rawSlug.toLowerCase()) ||
      canonicalByRawId.get(rawSlug) ||
      canonicalByRawId.get(rawSlug.toLowerCase()) ||
      allTutors.find((t) => matchesTutorSlugOrId(t, rawSlug, slugMap));

    if (matchedTutor) {
      const canonicalSlug = getTutorCanonicalSlug(matchedTutor, slugMap);
      const canonicalUrl = `${CANONICAL_BASE_URL}/tutor/${encodeURIComponent(canonicalSlug)}`;
      const subjects = parseSubjectsList(
        matchedTutor.subjectExpertise || matchedTutor.subjects,
        matchedTutor.primarySubject
      );
      const primarySubject = subjects[0] || 'University Subjects';
      const locationDisplay =
        matchedTutor.location || matchedTutor.cityLocation || matchedTutor.city || matchedTutor.country || 'Online Worldwide';
      const educationDisplay = matchedTutor.education || 'Verified University Degree & Academic Credentials';
      const rating = Number(matchedTutor.rating || 4.9);
      const reviewCount = Number(matchedTutor.reviewCount ?? matchedTutor.reviewsCount ?? 120);
      const hourlyRate = Number(matchedTutor.hourlyRate || 45);
      const experienceText =
        matchedTutor.experience ||
        matchedTutor.experienceSummary ||
        matchedTutor.bio ||
        `Verified ${primarySubject} mentor guiding university students 1-on-1 online.`;
      const avatarImage = matchedTutor.avatarUrl || matchedTutor.profileImageUrl || `${CANONICAL_BASE_URL}/logo.webp`;

      const title = `${matchedTutor.name} — ${primarySubject} Tutor (${locationDisplay}) | University Tutors`;
      const description = clipMetaDescription(
        `Book 1-on-1 sessions with ${matchedTutor.name}, verified ${subjects.slice(0, 3).join(', ')} tutor (${educationDisplay}) in ${locationDisplay}. Rated ${rating}★ (${reviewCount} reviews).`
      );

      const safeTutor = sanitizePublicTutorForSsr(matchedTutor, canonicalSlug);

      const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: matchedTutor.name,
        url: canonicalUrl,
        image: avatarImage,
        jobTitle: `${primarySubject} University Tutor`,
        description,
        homeLocation: {
          '@type': 'Place',
          name: locationDisplay,
        },
        knowsAbout: subjects.length > 0 ? subjects : [primarySubject],
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: educationDisplay,
        },
        alumniOf: educationDisplay.includes('-')
          ? {
              '@type': 'CollegeOrUniversity',
              name: educationDisplay.split('-')[0].trim(),
            }
          : undefined,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: String(rating),
          bestRating: '5',
          reviewCount: String(reviewCount),
        },
        makesOffer: {
          '@type': 'Offer',
          name: `1-on-1 ${primarySubject} Tutoring with ${matchedTutor.name}`,
          price: String(hourlyRate),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl,
        },
      };

      seo = {
        title,
        description,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'profile',
        ogImage: avatarImage,
        includeRegionalHreflangs: false,
        structuredData: [personSchema],
        initialClientData: { routeType: 'tutor-profile', tutor: safeTutor },
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb">
              <a href="/">Home</a> / <a href="/tutors">Verified Tutors</a> / <span>${escapeHtml(matchedTutor.name)}</span>
            </nav>
            <h1>${escapeHtml(matchedTutor.name)} — ${escapeHtml(primarySubject)} Tutor in ${escapeHtml(locationDisplay)}</h1>
            <p class="preboot-lead">${escapeHtml(description)}</p>
            <div class="preboot-meta-strip">
              <span><strong>Rating:</strong> ${escapeHtml(rating)}★ (${escapeHtml(reviewCount)} verified reviews)</span>
              <span><strong>Direct Rate:</strong> $${escapeHtml(hourlyRate)}/hr</span>
              <span><strong>Location:</strong> ${escapeHtml(locationDisplay)}</span>
              <span><strong>Status:</strong> Verified Degree &amp; Background</span>
            </div>
            <section class="preboot-section">
              <h2>University Education &amp; Academic Credentials</h2>
              <p>${escapeHtml(educationDisplay)}</p>
            </section>
            <section class="preboot-section">
              <h2>Teaching Philosophy &amp; Experience</h2>
              <p>${escapeHtml(experienceText)}</p>
            </section>
            <section class="preboot-section">
              <h2>Subject Expertise</h2>
              <div class="preboot-links-wrap">
                ${(subjects.length > 0 ? subjects : [primarySubject])
                  .map(
                    (subj) =>
                      `<a href="/tutors?subject=${encodeURIComponent(subj)}">${escapeHtml(subj)}</a>`
                  )
                  .join('')}
              </div>
            </section>
            <div class="preboot-cta-row">
              <a href="/get-a-quote" class="preboot-btn-primary">Request a Session / Custom Quote</a>
              <a href="/tutors" class="preboot-btn-secondary">Browse All Verified Tutors</a>
            </div>
          </article>
        `,
      };
    } else {
      seo = {
        title: 'Tutor Profile Directory | University Tutors',
        description: 'Browse verified PhD and Master’s university tutors across STEM, business, nursing, and academic writing.',
        canonicalUrl: `${CANONICAL_BASE_URL}/tutors`,
        robots: 'noindex, follow',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [],
        mainHtml: `
          <article class="preboot-article">
            <h1>Explore Verified University Tutors</h1>
            <p>Browse our full directory of credentialed academic mentors at <a href="/tutors">Find Verified Tutors</a>.</p>
          </article>
        `,
      };
    }
  }

  // 3. Blog Hub & Individual Blog Posts
  if (!seo && (lowerPath === '/blog' || lowerPath === '/our-blog')) {
    const { blogs } = await loadSitemapDatabaseRecords();
    const publishedBlogs = blogs.filter(
      (b) => b && b.isPublished !== false && !['draft', 'archived', 'deleted', 'unpublished'].includes(String(b.status || '').toLowerCase())
    );
    const blogList = publishedBlogs.length > 0 ? publishedBlogs : DEFAULT_20_BLOGS;
    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'University Tutors Academic Blog & Study Guides',
      url: `${CANONICAL_BASE_URL}/blog`,
      description:
        'Published academic study guides, APA 7th & Harvard citation manuals, research roadmaps, and exam preparation articles.',
      blogPost: blogList.slice(0, 20).map((b) => {
        const slug = getBlogCanonicalSlug(b);
        return {
          '@type': 'BlogPosting',
          headline: b.title,
          url: `${CANONICAL_BASE_URL}/blog/${encodeURIComponent(slug)}`,
          datePublished: b.publishedAt || b.createdAt || '2026-10-01T00:00:00.000Z',
          author: { '@type': 'Organization', name: b.author || 'University Tutors Editorial Team' },
        };
      }),
    };

    seo = {
      title: 'Academic Study Guides, Citation Manuals & Research Blog | University Tutors',
      description:
        'Read university study guides on APA 7th & Harvard referencing, dissertation planning, STEM exam recall, and academic writing by vetted mentors.',
      canonicalUrl: `${CANONICAL_BASE_URL}/blog`,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: false,
      structuredData: [blogSchema],
      mainHtml: buildBlogHubMainHtml(blogList),
    };
  }

  if (!seo && (lowerPath.startsWith('/blog/') || lowerPath.startsWith('/our-blog/'))) {
    const rawSlug = lowerPath.startsWith('/blog/')
      ? normalizedPath.slice('/blog/'.length)
      : normalizedPath.slice('/our-blog/'.length);
    const { blogs } = await loadSitemapDatabaseRecords();
    const allBlogs = blogs.length > 0 ? blogs : DEFAULT_20_BLOGS;
    const matchedBlog =
      allBlogs.find((b) => matchesBlogSlugOrId(b, rawSlug)) ||
      DEFAULT_20_BLOGS.find((b) => matchesBlogSlugOrId(b, rawSlug));

    if (matchedBlog) {
      const canonicalSlug = getBlogCanonicalSlug(matchedBlog);
      const canonicalUrl = `${CANONICAL_BASE_URL}/blog/${encodeURIComponent(canonicalSlug)}`;
      const description = clipMetaDescription(matchedBlog.excerpt || matchedBlog.content || '');
      const blogImage = matchedBlog.imageUrl || matchedBlog.image || `${CANONICAL_BASE_URL}/logo.webp`;
      const relatedBlogs = allBlogs.filter((b) => b.id !== matchedBlog.id).slice(0, 4);

      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: matchedBlog.title,
        description,
        image: blogImage,
        datePublished: matchedBlog.publishedAt || matchedBlog.createdAt || '2026-10-01T00:00:00.000Z',
        dateModified: matchedBlog.updatedAt || matchedBlog.publishedAt || '2026-10-01T00:00:00.000Z',
        articleSection: matchedBlog.category || 'Academic Guides',
        keywords: Array.isArray(matchedBlog.tags) ? matchedBlog.tags.join(', ') : '',
        author: {
          '@type': 'Organization',
          name: matchedBlog.author || 'University Tutors Editorial Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'University Tutors',
          logo: {
            '@type': 'ImageObject',
            url: `${CANONICAL_BASE_URL}/logo.webp`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };

      seo = {
        title: `${matchedBlog.title} | University Tutors`,
        description,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'article',
        ogImage: blogImage,
        includeRegionalHreflangs: false,
        structuredData: [articleSchema],
        initialClientData: { routeType: 'blog-post', blog: matchedBlog },
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb">
              <a href="/">Home</a> / <a href="/blog">Academic Blog</a> / <span>${escapeHtml(matchedBlog.category || 'Study Guide')}</span>
            </nav>
            <p class="preboot-eyebrow">${escapeHtml(matchedBlog.category || 'Study Guide')} &bull; ${escapeHtml(matchedBlog.author || 'University Tutors Editorial Team')}</p>
            <h1>${escapeHtml(matchedBlog.title)}</h1>
            <div class="preboot-prose">
              ${markdownToSimpleHtml(matchedBlog.content || '')}
            </div>
            <section class="preboot-section">
              <h2>Related Academic Study Guides</h2>
              <div class="preboot-links-wrap">
                ${relatedBlogs
                  .map(
                    (rb) =>
                      `<a href="/blog/${escapeHtml(encodeURIComponent(getBlogCanonicalSlug(rb)))}">${escapeHtml(rb.title)}</a>`
                  )
                  .join('')}
                <a href="/blog">All Study Guides</a>
                <a href="/tutors">Find a Verified Subject Tutor</a>
              </div>
            </section>
          </article>
        `,
      };
    } else {
      seo = {
        title: 'Academic Blog & Study Guides | University Tutors',
        description: 'Explore university study guides, citation manuals, and research tips at University Tutors.',
        canonicalUrl: `${CANONICAL_BASE_URL}/blog`,
        robots: 'noindex, follow',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [],
        mainHtml: `
          <article class="preboot-article">
            <h1>Academic Study Guides</h1>
            <p>Browse all available study guides in our <a href="/blog">Knowledge Hub</a>.</p>
          </article>
        `,
      };
    }
  }

  // 4. Tutors Directory (/tutors, /tutors-directory, /find-a-tutor)
  if (
    !seo &&
    (lowerPath === '/tutors' || lowerPath === '/tutors-directory' || lowerPath === '/find-a-tutor')
  ) {
    const { allTutors } = await loadMergedPublicTutorCatalog({ activeOnly: true });
    const listSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Verified University Tutors Directory',
      url: `${CANONICAL_BASE_URL}/tutors`,
      description: 'Browse verified university tutors across STEM, essays, coursework, and test prep.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: allTutors.slice(0, 20).map((t, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${CANONICAL_BASE_URL}/tutor/${encodeURIComponent(t.slug || getTutorCanonicalSlug(t))}`,
          name: t.name,
        })),
      },
    };
    seo = {
      title: 'Find Verified University Mentors & Tutors (500+ Experts) | University Tutors',
      description:
        'Browse 500+ vetted PhD and Master’s university tutors across Calculus, Organic Chemistry, Coding, Nursing & Essay Writing with transparent rates.',
      canonicalUrl: `${CANONICAL_BASE_URL}/tutors`,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: false,
      structuredData: [listSchema],
      mainHtml: buildTutorsDirectoryMainHtml(allTutors),
    };
  }

  // 5. Country Online Tutoring Pages
  if (!seo && lowerPath.startsWith('/online-tutoring-')) {
    const slug = lowerPath.replace('/online-tutoring-', '');
    const pageData = COUNTRY_ONLINE_TUTORING_PAGES[slug];
    if (pageData) {
      const canonicalUrl = `${CANONICAL_BASE_URL}/online-tutoring-${slug}`;
      const description = clipMetaDescription(pageData.paragraphs?.[0] || pageData.h1 || '');
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pageData.h1,
        description,
        provider: { '@type': 'EducationalOrganization', name: 'University Tutors', url: `${CANONICAL_BASE_URL}/` },
        areaServed: pageData.countryName,
        url: canonicalUrl,
      };
      seo = {
        title: pageData.seoTitle || `${pageData.h1} | University Tutors`,
        description,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: true,
        structuredData: [serviceSchema],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <a href="/tutors">Tutors</a> / <span>${escapeHtml(pageData.countryName)}</span></nav>
            <h1>${escapeHtml(pageData.h1)}</h1>
            <p class="preboot-lead">${escapeHtml(pageData.pathwaysTitle || description)}</p>
            ${(pageData.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
            <section class="preboot-section">
              <h2>Explore More Regions &amp; Tutors</h2>
              <div class="preboot-links-wrap">
                <a href="/tutors">Browse All Verified Tutors</a>
                <a href="/get-a-quote">Get a Quote</a>
                ${Object.values(COUNTRY_ONLINE_TUTORING_PAGES)
                  .map((c) => `<a href="/online-tutoring-${escapeHtml(c.slug)}">${escapeHtml(c.countryName)} Online Tutoring</a>`)
                  .join('')}
              </div>
            </section>
          </article>
        `,
      };
    }
  }

  // 6. Dedicated & Specialized Services
  if (!seo && lowerPath === '/services') {
    seo = {
      title: 'Academic Tutoring Services Hub | University Tutors',
      description:
        'Explore 1-on-1 live tutoring, assignment guidance, 14-week coursework tracks, and essay citation review backed by milestone escrow.',
      canonicalUrl: `${CANONICAL_BASE_URL}/services`,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: false,
      structuredData: [DEFAULT_ORG_SCHEMA],
      mainHtml: `
        <article class="preboot-article">
          <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <span>Academic Services</span></nav>
          <h1>University Tutoring &amp; Academic Support Services</h1>
          <p class="preboot-lead">Double-vetted native academic mentorship aligned with university syllabus and citation standards.</p>
          <div class="preboot-grid">
            ${DEDICATED_SERVICE_ROUTES.map(
              (s) => `<div class="preboot-card"><h2><a href="${escapeHtml(s.path)}">${escapeHtml(s.label)}</a></h2><p>${escapeHtml(s.seoDescription)}</p></div>`
            ).join('')}
          </div>
        </article>
      `,
    };
  }

  if (!seo) {
    const dedicated = resolveDedicatedServiceRoute(lowerPath);
    if (dedicated) {
      const canonicalUrl = `${CANONICAL_BASE_URL}${dedicated.path}`;
      seo = {
        title: dedicated.seoTitle,
        description: dedicated.seoDescription,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: dedicated.label,
            description: dedicated.seoDescription,
            provider: { '@type': 'EducationalOrganization', name: 'University Tutors' },
            url: canonicalUrl,
          },
        ],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <a href="/services">Services</a> / <span>${escapeHtml(dedicated.label)}</span></nav>
            <h1>${escapeHtml(dedicated.label)}</h1>
            <p class="preboot-lead">${escapeHtml(dedicated.seoDescription)}</p>
            <div class="preboot-cta-row">
              <a href="/tutors" class="preboot-btn-primary">Browse Matching Tutors</a>
              <a href="/get-a-quote" class="preboot-btn-secondary">Request a Quote</a>
            </div>
          </article>
        `,
      };
    }
  }

  if (!seo) {
    const specPage =
      SPECIALIZED_SERVICE_PAGES_MAP[lowerPath.slice(1)] ||
      SPECIALIZED_SERVICE_PAGES_MAP[lowerPath];
    if (specPage) {
      const canonicalPath = specPage.path || lowerPath;
      const canonicalUrl = `${CANONICAL_BASE_URL}${canonicalPath}`;
      const description = clipMetaDescription(specPage.summary || specPage.h1 || '');
      seo = {
        title: specPage.seoTitle || `${specPage.h1} | University Tutors`,
        description,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: specPage.h1,
            description,
            url: canonicalUrl,
          },
        ],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <a href="/services">Services</a> / <span>${escapeHtml(specPage.h1)}</span></nav>
            <h1>${escapeHtml(specPage.h1)}</h1>
            <p class="preboot-lead">${escapeHtml(specPage.summary || description)}</p>
            ${(specPage.features || []).map((f) => `<h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.description)}</p>`).join('\n')}
            <div class="preboot-cta-row">
              <a href="/tutors" class="preboot-btn-primary">Find Subject Specialists</a>
              <a href="/get-a-quote" class="preboot-btn-secondary">Get a Quote</a>
            </div>
          </article>
        `,
      };
    }
  }

  // 7. Tools Hub, Category Hubs, and Individual Tool Pages (/tools/*)
  if (!seo && (lowerPath === '/tools' || lowerPath.startsWith('/tools/'))) {
    if (lowerPath === '/tools') {
      const canonicalUrl = `${CANONICAL_BASE_URL}/tools`;
      seo = {
        title: 'Free Online Student Tools Suite — PDF, Citations, STEM & GPA | University Tutors',
        description:
          'Free, 100% private browser-based academic & STEM calculators for university students: Math solvers, Biology & Chemistry labs, PDF tools, Citations & GPA.',
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Free University Student Tools Suite',
            url: canonicalUrl,
            description: '72 free 100% browser-local academic utilities and STEM calculators.',
          },
        ],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <span>Free Student Tools</span></nav>
            <h1>Free Online Student Tools &amp; STEM Calculators Suite</h1>
            <p class="preboot-lead">100% client-side, instant academic calculators for Mathematics, Biology, Chemistry, Citations, PDFs, and University Grade Conversion.</p>
            <div class="preboot-links-wrap">
              <a href="/tools/math">University Math &amp; Statistics Suite (27 Tools)</a>
              <a href="/tools/biology">Biology &amp; Genetics Calculators (14 Tools)</a>
              <a href="/tools/chemistry">Chemistry &amp; Spectroscopy Solvers (16 Tools)</a>
            </div>
            <div class="preboot-grid">
              ${TOOLS_SEO_META_LIST.slice(0, 24)
                .map(
                  (t) => `<div class="preboot-card"><h3><a href="${escapeHtml(t.path)}">${escapeHtml(t.title)}</a></h3><p>${escapeHtml(t.summary)}</p></div>`
                )
                .join('')}
            </div>
          </article>
        `,
      };
    } else if (lowerPath === '/tools/math' || lowerPath === '/tools/biology' || lowerPath === '/tools/chemistry') {
      const catLabel = lowerPath.endsWith('/math') ? 'Mathematics' : lowerPath.endsWith('/biology') ? 'Biology' : 'Chemistry';
      const titleMap: Record<string, string> = {
        '/tools/math': 'Free University Mathematics & Statistics Calculators (27 Tools) | University Tutors',
        '/tools/biology': 'Free Biology, Genetics & Molecular Lab Calculators (14 Tools) | University Tutors',
        '/tools/chemistry': 'Free Chemistry, Stoichiometry & Spectroscopy Calculators (16 Tools) | University Tutors',
      };
      const descMap: Record<string, string> = {
        '/tools/math':
          '27 free interactive browser-based Mathematics & Statistics solvers: Calculus derivatives, Riemann integrals, Matrix RREF, Eigenvalues, Hypothesis Testing & ODEs.',
        '/tools/biology':
          '14 free interactive browser-based Biology calculators: Punnett Square, DNA/RNA/Protein Translator, PCR Master Mix, CRISPR gRNA & Agarose Gel Simulator.',
        '/tools/chemistry':
          '16 free interactive browser-based Chemistry calculators: Periodic Table, Molar Mass, Equation Balancer, Limiting Reagent, Buffer pH & IR/NMR Lookup.',
      };
      const matchingTools = TOOLS_SEO_META_LIST.filter((t) => t.path.startsWith(lowerPath + '/'));
      seo = {
        title: titleMap[lowerPath],
        description: descMap[lowerPath],
        canonicalUrl: `${CANONICAL_BASE_URL}${lowerPath}`,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: titleMap[lowerPath],
            url: `${CANONICAL_BASE_URL}${lowerPath}`,
            description: descMap[lowerPath],
          },
        ],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <a href="/tools">Free Tools</a> / <span>${escapeHtml(catLabel)}</span></nav>
            <h1>Free University ${escapeHtml(catLabel)} Calculators &amp; Lab Simulators</h1>
            <p class="preboot-lead">${escapeHtml(descMap[lowerPath])}</p>
            <div class="preboot-grid">
              ${matchingTools
                .map(
                  (t) => `<div class="preboot-card"><h2><a href="${escapeHtml(t.path)}">${escapeHtml(t.title)}</a></h2><p>${escapeHtml(t.summary)}</p></div>`
                )
                .join('')}
            </div>
          </article>
        `,
      };
    } else {
      const toolMeta = TOOLS_SEO_META_BY_PATH[lowerPath];
      if (toolMeta) {
        const canonicalUrl = `${CANONICAL_BASE_URL}${toolMeta.path}`;
        const related = TOOLS_SEO_META_LIST.filter(
          (t) => t.path !== toolMeta.path && t.category === toolMeta.category
        ).slice(0, 6);
        seo = {
          title: toolMeta.seoTitle,
          description: clipMetaDescription(toolMeta.seoDescription),
          canonicalUrl,
          robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          ogType: 'website',
          ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
          includeRegionalHreflangs: false,
          structuredData: [
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: toolMeta.title,
              url: canonicalUrl,
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'All',
              description: toolMeta.seoDescription,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
          ],
          mainHtml: `
            <article class="preboot-article">
              <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <a href="/tools">Free Tools</a> / <span>${escapeHtml(toolMeta.title)}</span></nav>
              <h1>${escapeHtml(toolMeta.title)}</h1>
              <p class="preboot-lead">${escapeHtml(toolMeta.seoDescription)}</p>
              <p>${escapeHtml(toolMeta.summary)}</p>
              <section class="preboot-section">
                <h2>Related Academic Tools</h2>
                <div class="preboot-links-wrap">
                  <a href="/tools">All Student Tools</a>
                  <a href="/tutors">Find a ${escapeHtml(toolMeta.category)} Tutor</a>
                  ${related.map((r) => `<a href="${escapeHtml(r.path)}">${escapeHtml(r.title)}</a>`).join('')}
                </div>
              </section>
            </article>
          `,
        };
      }
    }
  }

  // 8. Other Public Static Pages
  if (!seo) {
    const staticRoutes: Record<
      string,
      { canonicalPath: string; title: string; description: string; h1: string; body: string }
    > = {
      '/about': {
        canonicalPath: '/about',
        title: 'About University Tutors — Ethical Academic Mentorship',
        description:
          'Learn how University Tutors connects students with vetted Oxford, Ivy League & global faculty for 1-on-1 ethical mentorship protected by escrow.',
        h1: 'About University Tutors: Ethical Global Academic Mentorship',
        body: 'Founded by university advisors and graduate mentors, University Tutors ensures transparent transcript verification, 1-on-1 live guidance, and milestone escrow safety.',
      },
      '/about-us': {
        canonicalPath: '/about',
        title: 'About University Tutors — Ethical Academic Mentorship',
        description:
          'Learn how University Tutors connects students with vetted Oxford, Ivy League & global faculty for 1-on-1 ethical mentorship protected by escrow.',
        h1: 'About University Tutors: Ethical Global Academic Mentorship',
        body: 'Founded by university advisors and graduate mentors, University Tutors ensures transparent transcript verification, 1-on-1 live guidance, and milestone escrow safety.',
      },
      '/faqs': {
        canonicalPath: '/faqs',
        title: 'Frequently Asked Questions (FAQs) | University Tutors',
        description:
          'Answers on tutor credential verification, milestone escrow payments, ethical tutoring policies, revisions, and scheduling on University Tutors.',
        h1: 'Frequently Asked Questions — University Tutors',
        body: 'Everything students and parents need to know about transcript vetting, milestone escrow payments, academic integrity standards, and refund guarantees.',
      },
      '/faq': {
        canonicalPath: '/faqs',
        title: 'Frequently Asked Questions (FAQs) | University Tutors',
        description:
          'Answers on tutor credential verification, milestone escrow payments, ethical tutoring policies, revisions, and scheduling on University Tutors.',
        h1: 'Frequently Asked Questions — University Tutors',
        body: 'Everything students and parents need to know about transcript vetting, milestone escrow payments, academic integrity standards, and refund guarantees.',
      },
      '/contact': {
        canonicalPath: '/contact',
        title: 'Contact 24/7 Academic Advising Team | University Tutors',
        description:
          'Reach our 24/7 human academic advising desk for syllabus consultations, custom tutor matching, escrow support, or institutional questions.',
        h1: 'Contact Our 24/7 Human Academic Advising Team',
        body: 'Email support@universitytutors.com or call +1 (800) 123-TUTOR for round-the-clock syllabus consultations and direct tutor matching.',
      },
      '/contact-us': {
        canonicalPath: '/contact',
        title: 'Contact 24/7 Academic Advising Team | University Tutors',
        description:
          'Reach our 24/7 human academic advising desk for syllabus consultations, custom tutor matching, escrow support, or institutional questions.',
        h1: 'Contact Our 24/7 Human Academic Advising Team',
        body: 'Email support@universitytutors.com or call +1 (800) 123-TUTOR for round-the-clock syllabus consultations and direct tutor matching.',
      },
      '/get-a-quote': {
        canonicalPath: '/get-a-quote',
        title: 'Get a Free Tutoring & Coursework Quote | University Tutors',
        description:
          'Request a custom milestone quote from vetted PhD and Master’s university tutors with zero upfront fees and 100% escrow protection.',
        h1: 'Request a Custom University Tutoring Milestone Quote',
        body: 'Submit your syllabus, subject, and timeline to receive fair, customized quotes directly from qualified mentors under milestone escrow protection.',
      },
      '/get-quote': {
        canonicalPath: '/get-a-quote',
        title: 'Get a Free Tutoring & Coursework Quote | University Tutors',
        description:
          'Request a custom milestone quote from vetted PhD and Master’s university tutors with zero upfront fees and 100% escrow protection.',
        h1: 'Request a Custom University Tutoring Milestone Quote',
        body: 'Submit your syllabus, subject, and timeline to receive fair, customized quotes directly from qualified mentors under milestone escrow protection.',
      },
      '/pricing': {
        canonicalPath: '/get-a-quote',
        title: 'University Tutoring Rates & Custom Quotes | University Tutors',
        description:
          'Compare transparent hourly tutoring rates and request custom coursework milestone quotes backed by escrow protection.',
        h1: 'Transparent Tutoring Rates & Milestone Escrow Quotes',
        body: 'Browse verified tutors with clear hourly rates or request a customized milestone quote matched to your academic goals.',
      },
      '/privacy': {
        canonicalPath: '/privacy',
        title: 'Privacy Policy & GDPR Data Disclosure | University Tutors',
        description:
          'Read how University Tutors protects student and tutor personal data, encryption standards, GDPR compliance, and confidentiality.',
        h1: 'Privacy Policy & GDPR Data Compliance',
        body: 'University Tutors enforces strict data minimization, TLS/SSL encryption, and GDPR/CCPA rights across all tutoring sessions and document uploads.',
      },
      '/terms': {
        canonicalPath: '/terms',
        title: 'Terms of Service & Escrow Agreement | University Tutors',
        description:
          'Review our Terms of Service, milestone escrow payment guarantee, academic integrity policy, and student refund protections.',
        h1: 'Terms of Service & Milestone Escrow Guarantee',
        body: 'All tuition payments are held safely in administrator-monitored escrow and only disbursed after student approval.',
      },
      '/google-disclosure': {
        canonicalPath: '/google-disclosure',
        title: 'Google OAuth & API Data Usage Disclosure | University Tutors',
        description:
          'Transparent disclosure of how University Tutors handles Google Sign-In identity verification and Google API user data compliance.',
        h1: 'Google OAuth & User Data Protection Disclosure',
        body: 'Details on limited Google profile data used strictly for authenticated sign-in, session security, and account ownership verification.',
      },
      '/data-deletion': {
        canonicalPath: '/data-deletion',
        title: 'User Data Deletion Instructions | University Tutors',
        description:
          'Step-by-step instructions to request permanent deletion of your University Tutors account and personal records under GDPR & Meta standards.',
        h1: 'User Account & Data Deletion Instructions',
        body: 'Follow these transparent instructions to submit an immediate, verifiable data deletion request to our privacy compliance team.',
      },
    };

    const staticMatch = staticRoutes[lowerPath];
    if (staticMatch) {
      const canonicalUrl = `${CANONICAL_BASE_URL}${staticMatch.canonicalPath}`;
      seo = {
        title: staticMatch.title,
        description: staticMatch.description,
        canonicalUrl,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
        includeRegionalHreflangs: false,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': lowerPath === '/faqs' || lowerPath === '/faq' ? 'FAQPage' : 'WebPage',
            name: staticMatch.h1,
            url: canonicalUrl,
            description: staticMatch.description,
          },
        ],
        mainHtml: `
          <article class="preboot-article">
            <nav aria-label="Breadcrumb" class="preboot-breadcrumb"><a href="/">Home</a> / <span>${escapeHtml(staticMatch.h1)}</span></nav>
            <h1>${escapeHtml(staticMatch.h1)}</h1>
            <p class="preboot-lead">${escapeHtml(staticMatch.description)}</p>
            <p>${escapeHtml(staticMatch.body)}</p>
            <div class="preboot-cta-row">
              <a href="/tutors" class="preboot-btn-primary">Browse Verified Tutors</a>
              <a href="/blog" class="preboot-btn-secondary">Read Study Guides</a>
              <a href="/tools" class="preboot-btn-secondary">Free Student Tools</a>
            </div>
          </article>
        `,
      };
    }
  }

  // 9. Homepage (/ and /how-it-works fallback default)
  if (!seo) {
    const [{ allTutors }, { blogs }] = await Promise.all([
      loadMergedPublicTutorCatalog({ activeOnly: true }),
      loadSitemapDatabaseRecords(),
    ]);
    const publishedBlogs = blogs.filter(
      (b) => b && b.isPublished !== false && !['draft', 'archived', 'deleted', 'unpublished'].includes(String(b.status || '').toLowerCase())
    );
    seo = {
      title: 'University Tutors | 1-on-1 Online Tutoring, Exam Prep & Tools',
      description:
        'Connect with vetted 1-on-1 university tutors for STEM, essays, coursework & exam prep, plus 60+ free student calculators and academic tools.',
      canonicalUrl: `${CANONICAL_BASE_URL}/`,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ogType: 'website',
      ogImage: `${CANONICAL_BASE_URL}/logo.webp`,
      includeRegionalHreflangs: true,
      structuredData: [DEFAULT_ORG_SCHEMA],
      mainHtml: buildHomepageMainHtml(allTutors, publishedBlogs.length > 0 ? publishedBlogs : DEFAULT_20_BLOGS),
    };
  }

  // Strip any existing default head SEO tags in templateHtml so zero conflicting canonical/meta tags remain
  let outHtml = templateHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']alternate["']\s+hreflang=["'][^"']*["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:(?:type|url|title|description|image|site_name)["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:(?:card|site|title|description|image)["'][^>]*>/gi, '')
    .replace(/<!--\s*Canonical URL[\s\S]*?-->/gi, '')
    .replace(/<!--\s*Hreflang Alternate Regional Links\s*-->/gi, '')
    .replace(/<!--\s*OpenGraph Social Cards\s*-->/gi, '')
    .replace(/<!--\s*Twitter Social Cards\s*-->/gi, '')
    .replace(/<!--\s*Schema\.org JSON-LD Structured Data\s*-->[\s\S]*?<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  const headInjections = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" id="canonical-url" data-ssr-seo="1" />`,
    seo.includeRegionalHreflangs ? REGIONAL_HREFLANG_LINKS : '',
    `<meta property="og:type" content="${escapeHtml(seo.ogType)}" />`,
    `<meta property="og:site_name" content="University Tutors" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@UniversityTutors" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`,
    ...seo.structuredData.map(
      (schema, idx) =>
        `<script type="application/ld+json"${idx === 0 ? ' id="dynamic-route-jsonld"' : ''}>${safeJsonScript(schema)}</script>`
    ),
    seo.initialClientData
      ? `<script>window.__INITIAL_SSR_DATA__=${safeJsonScript(seo.initialClientData)};</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  outHtml = outHtml.replace('</head>', `    ${headInjections}\n  </head>`);

  // Replace empty preboot-main with rich route-specific semantic HTML + primary nav links
  outHtml = outHtml.replace(
    /<main class="preboot-main">[\s\S]*?<\/main>/i,
    `<main class="preboot-main">${CORE_NAV_LINKS_HTML}\n${seo.mainHtml}\n</main>`
  );

  return outHtml;
}
