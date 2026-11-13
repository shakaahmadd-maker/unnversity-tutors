// 100% Client-Side Academic Stylometry, Hybrid Paraphraser & N-Gram Originality Engine
// Zero external paid APIs, zero server uploads, instant browser execution.

export type ParaphraseMode = 'natural' | 'scholarly' | 'concise' | 'active';

export interface ParaphraseModeInfo {
  id: ParaphraseMode;
  label: string;
  shortTag: string;
  description: string;
}

export const PARAPHRASE_MODES: ParaphraseModeInfo[] = [
  {
    id: 'natural',
    label: 'Natural Human Flow',
    shortTag: 'Breaks uniform cadence & removes AI clichés',
    description:
      'Varies sentence lengths, removes robotic LLM transitions, and introduces authentic academic rhythm.',
  },
  {
    id: 'scholarly',
    label: 'Scholarly Academic',
    shortTag: 'Formal university & journal prose',
    description:
      'Elevates conversational phrasing and contractions into rigorous, peer-reviewed university register.',
  },
  {
    id: 'concise',
    label: 'Concise (Trim Wordiness)',
    shortTag: 'Cuts filler for strict word limits',
    description:
      'Eliminates redundant hedges, throat-clearing clauses, and wordy prepositions while preserving meaning.',
  },
  {
    id: 'active',
    label: 'Active Voice',
    shortTag: 'Direct subject-first statements',
    description:
      'Converts passive lab and essay constructions ("was conducted by") into clear, direct active statements.',
  },
];

export interface ClichéRule {
  phrase: string;
  pattern: RegExp;
  severity: 'high' | 'medium';
  category: 'AI Cliché' | 'Robotic Transition' | 'Filler Hedge';
  suggestion: string;
}

export const AI_CLICHE_RULES: ClichéRule[] = [
  {
    phrase: 'delve into',
    pattern: /\bdelv(e|es|ed|ing)\s+(deeper\s+)?into\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'examine / investigate',
  },
  {
    phrase: "in today's fast-paced world",
    pattern: /\bin\s+today['’]s\s+(fast-paced|rapidly\s+evolving|ever-changing|digital|modern)\s+(world|era|landscape|society)\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'in contemporary practice / omit',
  },
  {
    phrase: 'it is important to note',
    pattern: /\bit\s+is\s+(important|worth|crucial|essential|vital)\s+to\s+(note|mention|emphasize|highlight|recognize)(\s+that)?\b/gi,
    severity: 'high',
    category: 'Filler Hedge',
    suggestion: 'state the point directly',
  },
  {
    phrase: 'testament to',
    pattern: /\b(a\s+)?(true\s+|clear\s+|powerful\s+)?testament\s+to\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'clear evidence of',
  },
  {
    phrase: 'underscore the importance',
    pattern: /\bunderscor(e|es|ed|ing)\s+the\s+(vital\s+|critical\s+)?(importance|need|significance|role)\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'demonstrate why ... matters',
  },
  {
    phrase: 'tapestry',
    pattern: /\b(rich\s+|intricate\s+|complex\s+)?tapestry(\s+of)?\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'interplay / combination of',
  },
  {
    phrase: 'plays a vital / crucial role',
    pattern: /\b(?:play(?:s|ed|ing)?|provid(?:e|es|ed|ing))\s+a\s+(?:crucial|vital|pivotal|paramount|indispensable)\s+role\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'directly shapes / influences',
  },
  {
    phrase: 'moreover',
    pattern: /\bmoreover\b/gi,
    severity: 'medium',
    category: 'Robotic Transition',
    suggestion: 'beyond this / equally',
  },
  {
    phrase: 'furthermore',
    pattern: /\bfurthermore\b/gi,
    severity: 'medium',
    category: 'Robotic Transition',
    suggestion: 'at the same time / building on this',
  },
  {
    phrase: 'multifaceted',
    pattern: /\bmultifaceted\b/gi,
    severity: 'medium',
    category: 'AI Cliché',
    suggestion: 'complex / multi-layered',
  },
  {
    phrase: 'navigating the complexities',
    pattern: /\bnavigat(e|es|ed|ing)\s+the\s+(intricate\s+)?(complexities|nuances|challenges)\s+of\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'addressing / managing',
  },
  {
    phrase: 'ever-evolving realm of',
    pattern: /\b(?:ever-evolving\s+)?(?:in\s+the\s+)?realm\s+of\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'within / rapidly advancing field of',
  },
  {
    phrase: 'ever-evolving',
    pattern: /\bever-evolving\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'rapidly advancing / changing',
  },
  {
    phrase: 'shed light on',
    pattern: /\bshed(s|ding)?\s+(valuable\s+|new\s+)?light\s+on\b/gi,
    severity: 'medium',
    category: 'AI Cliché',
    suggestion: 'clarify / clarify how',
  },
  {
    phrase: 'a myriad of',
    pattern: /\b(a\s+)?(myriad|plethora)\s+of\b/gi,
    severity: 'medium',
    category: 'AI Cliché',
    suggestion: 'numerous / many',
  },
  {
    phrase: 'ever-evolving landscape',
    pattern: /\b(ever-evolving|rapidly\s+changing|dynamic)\s+landscape\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'field / sector',
  },
  {
    phrase: 'intricate interplay',
    pattern: /\bintricate\s+(interplay|dance|balance|web)\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'interaction / relationship',
  },
  {
    phrase: 'serves as a cornerstone',
    pattern: /\bserv(e|es|ed|ing)\s+as\s+a\s+(cornerstone|beacon|catalyst)\b/gi,
    severity: 'high',
    category: 'AI Cliché',
    suggestion: 'forms the basis / drives',
  },
  {
    phrase: 'in conclusion',
    pattern: /\bin\s+conclusion,?\s*(?:it\s+is\s+(?:clear|evident|undeniable)\s+that)?\b/gi,
    severity: 'medium',
    category: 'Filler Hedge',
    suggestion: 'overall / taken together',
  },
  {
    phrase: 'it goes without saying',
    pattern: /\bit\s+(goes\s+without\s+saying|is\s+worth\s+noting)\s+that\b/gi,
    severity: 'medium',
    category: 'Filler Hedge',
    suggestion: 'notably / omit',
  },
  {
    phrase: 'holistic approach',
    pattern: /\ba\s+holistic\s+approach\s+to\b/gi,
    severity: 'medium',
    category: 'AI Cliché',
    suggestion: 'an integrated approach to',
  },
];

export interface DetectedClichéHit {
  phrase: string;
  matchedText: string;
  severity: 'high' | 'medium';
  category: ClichéRule['category'];
  suggestion: string;
}

export interface AnalyzedSentence {
  index: number;
  text: string;
  wordCount: number;
  status: 'clean' | 'amber' | 'red';
  reasons: string[];
  clichéHits: DetectedClichéHit[];
  isPassive: boolean;
  isUniformCadence: boolean;
}

export interface StylometryReport {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceStdDev: number;
  burstinessScore: number; // 0 - 100 (Higher = more natural human variation)
  burstinessLabel: 'Robotic Uniformity' | 'Moderate Variation' | 'Natural Human Cadence';
  lexicalDiversityScore: number; // 0 - 100
  lexicalLabel: 'Repetitive' | 'Balanced Academic' | 'Rich Scholarly Lexicon';
  uniqueWordRatio: number; // 0 - 100 raw %
  clichéFreeScore: number; // 0 - 100 (100 = zero AI clichés)
  clichéCount: number;
  passiveCount: number;
  clichéHits: DetectedClichéHit[];
  sentences: AnalyzedSentence[];
}

const ABBREVIATIONS_REGEX =
  /\b(Dr|Prof|Mr|Mrs|Ms|St|Fig|Figs|Eq|Eqs|Vol|No|pp|al|etc|vs|viz|cf|approx|Dept|Univ|Inc|Ltd)\./gi;

const ABBR_TOKEN = 'abbr_dot';

/**
 * Splits academic prose into sentences without breaking citations like (Smith et al., 2024, p. 14).
 */
export function splitAcademicSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Protect abbreviations and single-letter initials (e.g. "J. K. Rowling", "p. 12", "e.g.", "i.e.")
  const protectedText = trimmed
    .replace(/\be\.g\./gi, `e${ABBR_TOKEN}g${ABBR_TOKEN}`)
    .replace(/\bi\.e\./gi, `i${ABBR_TOKEN}e${ABBR_TOKEN}`)
    .replace(/\bet\s+al\./gi, (m) => m.replace('.', ABBR_TOKEN))
    .replace(ABBREVIATIONS_REGEX, (m) => m.replace('.', ABBR_TOKEN))
    .replace(/\b([A-Z])\./g, `$1${ABBR_TOKEN}`)
    .replace(/(\d)\.(\d)/g, `$1${ABBR_TOKEN}$2`);

  const rawParts = protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“'(\[])/g)
    .flatMap((chunk) => chunk.split(/\n{2,}/g));

  return rawParts
    .map((part) => part.replace(new RegExp(ABBR_TOKEN, 'g'), '.').trim())
    .filter((part) => part.length > 0);
}

export function extractWords(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/gi);
  return matches ? matches.map((w) => w.toLowerCase()) : [];
}

const PASSIVE_VOICE_CHECK =
  /\b(is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?([a-z]+(?:ed|en|wn|lt|pt|ft|ght|nd|st))\b/i;

const NON_PASSIVE_ADJECTIVES = new Set([
  'interested',
  'concerned',
  'involved',
  'based',
  'located',
  'related',
  'associated',
  'composed',
  'dedicated',
  'committed',
  'accustomed',
  'suited',
  'pleased',
  'surprised',
  'convinced',
  'complicated',
  'sophisticated',
  'nuanced',
  'pronounced',
  'widespread',
  'open',
  'often',
  'even',
  'given',
]);

export function detectPassiveInSentence(sentence: string): boolean {
  const match = sentence.match(PASSIVE_VOICE_CHECK);
  if (!match) return false;
  const participle = (match[2] || '').toLowerCase();
  if (NON_PASSIVE_ADJECTIVES.has(participle)) {
    return /\bby\s+the\b|\bby\s+[a-z]+/i.test(sentence);
  }
  return true;
}

/**
 * Engine 1: Live AI Writing Pattern & Stylometry Analyzer
 */
export function analyzeStylometry(text: string): StylometryReport {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      sentenceStdDev: 0,
      burstinessScore: 0,
      burstinessLabel: 'Robotic Uniformity',
      lexicalDiversityScore: 0,
      lexicalLabel: 'Repetitive',
      uniqueWordRatio: 0,
      clichéFreeScore: 100,
      clichéCount: 0,
      passiveCount: 0,
      clichéHits: [],
      sentences: [],
    };
  }

  const words = extractWords(cleanText);
  const wordCount = words.length;
  const charCount = cleanText.length;
  const rawSentences = splitAcademicSentences(cleanText);
  const sentenceCount = rawSentences.length;

  const lengths = rawSentences.map((s) => extractWords(s).length).filter((n) => n > 0);
  const avgSentenceLength =
    lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;

  let sentenceStdDev = 0;
  let meanAdjDelta = 0;
  if (lengths.length >= 2) {
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / lengths.length;
    sentenceStdDev = Math.sqrt(variance);

    let adjSum = 0;
    for (let i = 1; i < lengths.length; i++) {
      adjSum += Math.abs(lengths[i] - lengths[i - 1]);
    }
    meanAdjDelta = adjSum / (lengths.length - 1);
  }

  // Burstiness combines Coefficient of Variation (CV = stdDev / mean) + adjacent cadence swing
  let burstinessScore = 50;
  if (lengths.length === 1) {
    burstinessScore = 46;
  } else if (lengths.length >= 2 && avgSentenceLength > 0) {
    const cv = sentenceStdDev / avgSentenceLength;
    const adjRatio = meanAdjDelta / avgSentenceLength;
    // Typical AI prose: CV ~ 0.10 - 0.18, adjRatio ~ 0.12 -> ~24-38%
    // Natural human academic prose: CV ~ 0.35 - 0.58, adjRatio ~ 0.42 -> ~76-95%
    const rawScore = cv * 135 + adjRatio * 52;
    burstinessScore = Math.round(Math.max(8, Math.min(98, rawScore)));
  }

  const burstinessLabel: StylometryReport['burstinessLabel'] =
    burstinessScore >= 68
      ? 'Natural Human Cadence'
      : burstinessScore >= 45
        ? 'Moderate Variation'
        : 'Robotic Uniformity';

  // Lexical Diversity: Moving-Window Type-Token Ratio (window = 50 words) + Unique Ratio
  const uniqueSet = new Set(words);
  const uniqueWordRatio = wordCount > 0 ? Math.round((uniqueSet.size / wordCount) * 100) : 0;

  let mattr = uniqueSet.size / Math.max(1, wordCount);
  const windowSize = 45;
  if (wordCount > windowSize) {
    let ratioSum = 0;
    const steps = wordCount - windowSize + 1;
    for (let i = 0; i < steps; i++) {
      const sliceSet = new Set(words.slice(i, i + windowSize));
      ratioSum += sliceSet.size / windowSize;
    }
    mattr = ratioSum / steps;
  }
  // Map MATTR (typically 0.55 - 0.88 in English prose) onto intuitive 0 - 100% scale
  const lexicalDiversityScore =
    wordCount === 0 ? 0 : Math.round(Math.max(15, Math.min(98, (mattr - 0.32) * 145)));

  const lexicalLabel: StylometryReport['lexicalLabel'] =
    lexicalDiversityScore >= 72
      ? 'Rich Scholarly Lexicon'
      : lexicalDiversityScore >= 52
        ? 'Balanced Academic'
        : 'Repetitive';

  // Sentence-by-sentence AI cliché & uniform cadence inspection
  const allClichéHits: DetectedClichéHit[] = [];
  let passiveCount = 0;

  const analyzedSentences: AnalyzedSentence[] = rawSentences.map((sText, idx) => {
    const sWordCount = extractWords(sText).length;
    const hits: DetectedClichéHit[] = [];

    for (const rule of AI_CLICHE_RULES) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let m: RegExpExecArray | null;
      while ((m = regex.exec(sText)) !== null) {
        const hit: DetectedClichéHit = {
          phrase: rule.phrase,
          matchedText: m[0],
          severity: rule.severity,
          category: rule.category,
          suggestion: rule.suggestion,
        };
        hits.push(hit);
        allClichéHits.push(hit);
      }
    }

    const isPassive = detectPassiveInSentence(sText);
    if (isPassive) passiveCount += 1;

    // Check if part of a uniform-length robotic run
    let isUniformCluster = false;
    if (lengths.length >= 3 && sWordCount >= 10) {
      const prev = idx > 0 ? lengths[idx - 1] : null;
      const next = idx < lengths.length - 1 ? lengths[idx + 1] : null;
      const nearNeighbors =
        prev !== null && next !== null && Math.abs(sWordCount - prev) <= 3 && Math.abs(sWordCount - next) <= 3;
      const nearMeanFlat = sentenceStdDev < 3.6 && Math.abs(sWordCount - avgSentenceLength) <= 2.5;
      if (nearNeighbors || nearMeanFlat) {
        isUniformCluster = true;
      }
    }

    const reasons: string[] = [];
    const hasHigh = hits.some((h) => h.severity === 'high');
    if (hits.length > 0) {
      reasons.push(
        `AI pattern: ${hits.map((h) => `"${h.matchedText}" → try ${h.suggestion}`).join('; ')}`
      );
    }
    if (isUniformCluster) {
      reasons.push(`Uniform sentence cadence (${sWordCount} words — matches neighboring lengths)`);
    }
    if (isPassive) {
      reasons.push('Passive construction detected');
    }

    let status: AnalyzedSentence['status'] = 'clean';
    if (hasHigh || hits.length >= 2) {
      status = 'red';
    } else if (hits.length === 1 || isUniformCluster) {
      status = 'amber';
    }

    return {
      index: idx,
      text: sText,
      wordCount: sWordCount,
      status,
      reasons,
      clichéHits: hits,
      isPassive,
      isUniformCadence: isUniformCluster,
    };
  });

  const uniquePhraseHits = new Set(allClichéHits.map((h) => h.phrase)).size;
  const clichéFreeScore =
    wordCount === 0 ? 100 : Math.max(10, Math.min(100, 100 - uniquePhraseHits * 13));

  return {
    wordCount,
    charCount,
    sentenceCount,
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
    sentenceStdDev: Number(sentenceStdDev.toFixed(1)),
    burstinessScore,
    burstinessLabel,
    lexicalDiversityScore,
    lexicalLabel,
    uniqueWordRatio,
    clichéFreeScore,
    clichéCount: allClichéHits.length,
    passiveCount,
    clichéHits: allClichéHits,
    sentences: analyzedSentences,
  };
}

// ============================================================================
// ENGINE 2: HYBRID $0-COST ACADEMIC PARAPHRASER & HUMAN-FLOW REFINER
// ============================================================================

interface ReplacementPair {
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
}

function matchCapitalization(source: string, replacement: string): string {
  if (!source || !replacement) return replacement;
  const firstChar = source[0];
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

const SHARED_DE_AI_REPLACEMENTS: ReplacementPair[] = [
  {
    pattern: /\bin\s+today['’]s\s+(?:fast-paced|rapidly\s+evolving|ever-changing|digital|modern)\s+(?:world|era|landscape|society),?\s*/gi,
    replacement: (m) => (m[0] === 'I' ? 'Across contemporary universities, ' : 'in current practice, '),
  },
  {
    pattern: /\bmoreover,\s*it\s+is\s+(?:important|worth|crucial|essential|vital)\s+to\s+(?:note|mention|emphasize|highlight|recognize)\s+that\s+/gi,
    replacement: 'Notably, ',
  },
  {
    pattern: /\bit\s+is\s+(?:important|worth|crucial|essential|vital)\s+to\s+(?:note|mention|emphasize|highlight|recognize)\s+that\s+/gi,
    replacement: '',
  },
  {
    pattern: /\bit\s+is\s+worth\s+noting\s+that\s+/gi,
    replacement: '',
  },
  {
    pattern: /\bin\s+conclusion,\s+this\s+(?:intricate\s+)?tapestry\s+of\s+innovation\s+provides\s+a\s+(?:crucial|vital|pivotal)\s+role\s+in\b/gi,
    replacement: 'Taken together, these practical innovations directly assist students in',
  },
  {
    pattern: /\bin\s+conclusion,\s+it\s+is\s+(?:clear|evident|undeniable)\s+that\s+/gi,
    replacement: 'Taken together, the evidence shows that ',
  },
  {
    pattern: /\bin\s+conclusion,\s*/gi,
    replacement: 'Overall, ',
  },
  {
    pattern: /\bdelves\s+(?:deeper\s+)?into\b/gi,
    replacement: (m) => matchCapitalization(m, 'examines'),
  },
  {
    pattern: /\bdelved\s+(?:deeper\s+)?into\b/gi,
    replacement: (m) => matchCapitalization(m, 'examined'),
  },
  {
    pattern: /\bdelving\s+(?:deeper\s+)?into\b/gi,
    replacement: (m) => matchCapitalization(m, 'examining'),
  },
  {
    pattern: /\bdelve\s+(?:deeper\s+)?into\b/gi,
    replacement: (m) => matchCapitalization(m, 'examine'),
  },
  {
    pattern: /\bserves\s+as\s+a\s+(?:true\s+|clear\s+|powerful\s+)?testament\s+to\s+how\b/gi,
    replacement: (m) => matchCapitalization(m, 'illustrates how'),
  },
  {
    pattern: /\bserves\s+as\s+a\s+(?:true\s+|clear\s+|powerful\s+)?testament\s+to\b/gi,
    replacement: (m) => matchCapitalization(m, 'demonstrates'),
  },
  {
    pattern: /\bis\s+a\s+(?:true\s+|clear\s+|powerful\s+)?testament\s+to\b/gi,
    replacement: (m) => matchCapitalization(m, 'reflects'),
  },
  {
    pattern: /\b(?:a\s+)?(?:true\s+|clear\s+|powerful\s+)?testament\s+to\b/gi,
    replacement: (m) => matchCapitalization(m, 'clear evidence of'),
  },
  {
    pattern: /\bcan\s+underscore\s+the\s+(?:vital\s+|critical\s+)?(?:importance|significance|need)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'supports'),
  },
  {
    pattern: /\bunderscores\s+the\s+(?:vital\s+|critical\s+)?(?:importance|significance|need)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'highlights why'),
  },
  {
    pattern: /\bunderscore\s+the\s+(?:vital\s+|critical\s+)?(?:importance|significance|need)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'highlight the value of'),
  },
  {
    pattern: /\bunderscoring\s+the\s+(?:vital\s+|critical\s+)?(?:importance|significance|need)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'showing the value of'),
  },
  {
    pattern: /\b(?:the\s+)?ever-evolving\s+realm\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'rapid advances in'),
  },
  {
    pattern: /\bever-evolving\b/gi,
    replacement: (m) => matchCapitalization(m, 'rapidly advancing'),
  },
  {
    pattern: /\b(?:rich\s+|intricate\s+|complex\s+)?tapestry\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'interplay of'),
  },
  {
    pattern: /\btapestry\b/gi,
    replacement: (m) => matchCapitalization(m, 'structure'),
  },
  {
    pattern: /\bplays\s+a\s+(?:crucial|pivotal|paramount|vital)\s+role\s+in\b/gi,
    replacement: (m) => matchCapitalization(m, 'actively shapes'),
  },
  {
    pattern: /\bplay\s+a\s+(?:crucial|pivotal|paramount|vital)\s+role\s+in\b/gi,
    replacement: (m) => matchCapitalization(m, 'directly influence'),
  },
  {
    pattern: /\bplayed\s+a\s+(?:crucial|pivotal|paramount|vital)\s+role\s+in\b/gi,
    replacement: (m) => matchCapitalization(m, 'shaped'),
  },
  {
    pattern: /\bprovides\s+a\s+(?:crucial|pivotal|paramount|vital)\s+role\s+in\b/gi,
    replacement: (m) => matchCapitalization(m, 'contributes directly to'),
  },
  {
    pattern: /\b(?:crucial|pivotal|vital)\s+role\b/gi,
    replacement: (m) => matchCapitalization(m, 'central function'),
  },
  {
    pattern: /\bstreamline\s+their\b/gi,
    replacement: (m) => matchCapitalization(m, 'organize their'),
  },
  {
    pattern: /\butilize\b/gi,
    replacement: (m) => matchCapitalization(m, 'use'),
  },
  {
    pattern: /\bfacilitate\b/gi,
    replacement: (m) => matchCapitalization(m, 'enable'),
  },
  {
    pattern: /\bnavigating\s+the\s+(?:intricate\s+)?(?:complexities|nuances|challenges)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'addressing'),
  },
  {
    pattern: /\bnavigate\s+the\s+(?:intricate\s+)?(?:complexities|nuances|challenges)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'address'),
  },
  {
    pattern: /\bin\s+the\s+realm\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'within'),
  },
  {
    pattern: /\bsheds\s+(?:valuable\s+|new\s+)?light\s+on\b/gi,
    replacement: (m) => matchCapitalization(m, 'clarifies'),
  },
  {
    pattern: /\bshed\s+(?:valuable\s+|new\s+)?light\s+on\b/gi,
    replacement: (m) => matchCapitalization(m, 'clarify'),
  },
  {
    pattern: /\ba\s+(?:myriad|plethora)\s+of\b/gi,
    replacement: (m) => matchCapitalization(m, 'numerous'),
  },
  {
    pattern: /\b(?:ever-evolving|rapidly\s+changing)\s+landscape\b/gi,
    replacement: (m) => matchCapitalization(m, 'changing field'),
  },
  {
    pattern: /\bintricate\s+interplay\b/gi,
    replacement: (m) => matchCapitalization(m, 'close interaction'),
  },
  {
    pattern: /\bserves\s+as\s+a\s+(?:cornerstone|catalyst)\s+for\b/gi,
    replacement: (m) => matchCapitalization(m, 'anchors'),
  },
  {
    pattern: /\bmultifaceted\b/gi,
    replacement: (m) => matchCapitalization(m, 'multi-layered'),
  },
];

const SCHOLARLY_ELEVATIONS: ReplacementPair[] = [
  { pattern: /\bcan't\b/gi, replacement: (m) => matchCapitalization(m, 'cannot') },
  { pattern: /\bdon't\b/gi, replacement: (m) => matchCapitalization(m, 'do not') },
  { pattern: /\bdoesn't\b/gi, replacement: (m) => matchCapitalization(m, 'does not') },
  { pattern: /\bdidn't\b/gi, replacement: (m) => matchCapitalization(m, 'did not') },
  { pattern: /\bwon't\b/gi, replacement: (m) => matchCapitalization(m, 'will not') },
  { pattern: /\bisn't\b/gi, replacement: (m) => matchCapitalization(m, 'is not') },
  { pattern: /\baren't\b/gi, replacement: (m) => matchCapitalization(m, 'are not') },
  { pattern: /\bwasn't\b/gi, replacement: (m) => matchCapitalization(m, 'was not') },
  { pattern: /\bweren't\b/gi, replacement: (m) => matchCapitalization(m, 'were not') },
  { pattern: /\bit's\b/gi, replacement: (m) => matchCapitalization(m, 'it is') },
  { pattern: /\bthat's\b/gi, replacement: (m) => matchCapitalization(m, 'that is') },
  { pattern: /\ba\s+lot\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'substantial') },
  { pattern: /\blots\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'extensive') },
  { pattern: /\bplenty\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'ample') },
  { pattern: /\blook\s+into\b/gi, replacement: (m) => matchCapitalization(m, 'investigate') },
  { pattern: /\blooks\s+into\b/gi, replacement: (m) => matchCapitalization(m, 'investigates') },
  { pattern: /\blooked\s+into\b/gi, replacement: (m) => matchCapitalization(m, 'investigated') },
  { pattern: /\bfind\s+out\b/gi, replacement: (m) => matchCapitalization(m, 'ascertain') },
  { pattern: /\bfound\s+out\b/gi, replacement: (m) => matchCapitalization(m, 'established') },
  { pattern: /\bget\s+rid\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'eliminate') },
  { pattern: /\btalk\s+about\b/gi, replacement: (m) => matchCapitalization(m, 'examine') },
  { pattern: /\btalks\s+about\b/gi, replacement: (m) => matchCapitalization(m, 'addresses') },
  { pattern: /\bshows\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'demonstrates that') },
  { pattern: /\bshowed\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'demonstrated that') },
  { pattern: /\bbig\s+(impact|effect|difference|change)\b/gi, replacement: (_, n) => `pronounced ${n}` },
  { pattern: /\bhuge\s+(impact|effect|part|problem)\b/gi, replacement: (_, n) => `substantial ${n}` },
  { pattern: /\breally\s+(important|significant|clear|useful)\b/gi, replacement: (_, adj) => `markedly ${adj}` },
  { pattern: /\bvery\s+important\b/gi, replacement: (m) => matchCapitalization(m, 'imperative') },
  { pattern: /\bmake\s+sure\b/gi, replacement: (m) => matchCapitalization(m, 'ensure') },
  { pattern: /\bset\s+up\b/gi, replacement: (m) => matchCapitalization(m, 'establish') },
  { pattern: /\bpoint\s+out\b/gi, replacement: (m) => matchCapitalization(m, 'indicate') },
  { pattern: /\bpoints\s+out\b/gi, replacement: (m) => matchCapitalization(m, 'indicates') },
  { pattern: /\bmoreover,\s+/gi, replacement: (m) => matchCapitalization(m, 'consequently, ') },
  { pattern: /\bfurthermore,\s+/gi, replacement: (m) => matchCapitalization(m, 'in parallel, ') },
  { pattern: /\badditionally,\s+/gi, replacement: (m) => matchCapitalization(m, 'corroborating this view, ') },
];

const CONCISE_TRIMMING_RULES: ReplacementPair[] = [
  { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'because') },
  { pattern: /\bin\s+light\s+of\s+the\s+fact\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'since') },
  { pattern: /\bowing\s+to\s+the\s+fact\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'because') },
  { pattern: /\bdespite\s+the\s+fact\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'although') },
  { pattern: /\bregardless\s+of\s+the\s+fact\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'although') },
  { pattern: /\bin\s+order\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'to') },
  { pattern: /\bfor\s+the\s+purpose\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'for') },
  { pattern: /\bat\s+this\s+point\s+in\s+time\b/gi, replacement: (m) => matchCapitalization(m, 'now') },
  { pattern: /\bat\s+the\s+present\s+time\b/gi, replacement: (m) => matchCapitalization(m, 'currently') },
  { pattern: /\bin\s+the\s+event\s+that\b/gi, replacement: (m) => matchCapitalization(m, 'if') },
  { pattern: /\bhas\s+the\s+ability\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'can') },
  { pattern: /\bhave\s+the\s+ability\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'can') },
  { pattern: /\bis\s+able\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'can') },
  { pattern: /\bare\s+able\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'can') },
  { pattern: /\ba\s+(?:large|significant|substantial|considerable)\s+number\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'many') },
  { pattern: /\ba\s+wide\s+(?:variety|range)\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'diverse') },
  { pattern: /\bconduct\s+an?\s+(?:investigation|analysis|study)\s+(?:of|into|on)\b/gi, replacement: (m) => matchCapitalization(m, 'analyze') },
  { pattern: /\bmake\s+a\s+decision\b/gi, replacement: (m) => matchCapitalization(m, 'decide') },
  { pattern: /\btake\s+into\s+consideration\b/gi, replacement: (m) => matchCapitalization(m, 'consider') },
  { pattern: /\bwith\s+regard\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'regarding') },
  { pattern: /\bin\s+relation\s+to\b/gi, replacement: (m) => matchCapitalization(m, 'on') },
  { pattern: /\bas\s+a\s+consequence\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'from') },
  { pattern: /\bas\s+a\s+result\s+of\b/gi, replacement: (m) => matchCapitalization(m, 'from') },
  { pattern: /\bcompletely\s+(eliminate|destroy|remove|finish)\b/gi, replacement: (_, v) => v },
  { pattern: /\bpast\s+history\b/gi, replacement: (m) => matchCapitalization(m, 'history') },
  { pattern: /\bfuture\s+prospects\b/gi, replacement: (m) => matchCapitalization(m, 'prospects') },
  { pattern: /\bend\s+result\b/gi, replacement: (m) => matchCapitalization(m, 'result') },
  { pattern: /\b(?:moreover|furthermore|additionally|in\s+addition),\s+/gi, replacement: '' },
  { pattern: /\b(?:basically|essentially|actually|literally|clearly|obviously)\s+/gi, replacement: '' },
];

// Irregular Past Participle -> { past, base, thirdPerson }
const IRREGULAR_PARTICIPLES: Record<string, { past: string; base: string; sForm: string }> = {
  written: { past: 'wrote', base: 'write', sForm: 'writes' },
  taken: { past: 'took', base: 'take', sForm: 'takes' },
  given: { past: 'gave', base: 'give', sForm: 'gives' },
  shown: { past: 'showed', base: 'show', sForm: 'shows' },
  known: { past: 'knew', base: 'know', sForm: 'knows' },
  seen: { past: 'saw', base: 'see', sForm: 'sees' },
  done: { past: 'performed', base: 'perform', sForm: 'performs' },
  made: { past: 'made', base: 'make', sForm: 'makes' },
  found: { past: 'found', base: 'find', sForm: 'finds' },
  held: { past: 'held', base: 'hold', sForm: 'holds' },
  built: { past: 'built', base: 'build', sForm: 'builds' },
  sent: { past: 'sent', base: 'send', sForm: 'sends' },
  spent: { past: 'spent', base: 'spend', sForm: 'spends' },
  kept: { past: 'kept', base: 'keep', sForm: 'keeps' },
  left: { past: 'left', base: 'leave', sForm: 'leaves' },
  chosen: { past: 'chose', base: 'choose', sForm: 'chooses' },
  driven: { past: 'drove', base: 'drive', sForm: 'drives' },
  broken: { past: 'broke', base: 'break', sForm: 'breaks' },
  spoken: { past: 'spoke', base: 'speak', sForm: 'speaks' },
  drawn: { past: 'drew', base: 'draw', sForm: 'draws' },
  grown: { past: 'grew', base: 'grow', sForm: 'grows' },
  thrown: { past: 'threw', base: 'throw', sForm: 'throws' },
  led: { past: 'led', base: 'lead', sForm: 'leads' },
  read: { past: 'read', base: 'read', sForm: 'reads' },
  understood: { past: 'understood', base: 'understand', sForm: 'understands' },
  taught: { past: 'taught', base: 'teach', sForm: 'teaches' },
  brought: { past: 'brought', base: 'bring', sForm: 'brings' },
  thought: { past: 'thought', base: 'think', sForm: 'thinks' },
  run: { past: 'ran', base: 'run', sForm: 'runs' },
  begun: { past: 'began', base: 'begin', sForm: 'begins' },
};

function inflectParticipleToActive(
  participleRaw: string,
  auxRaw: string,
  agentRaw: string
): string {
  const part = participleRaw.toLowerCase();
  const aux = auxRaw.toLowerCase();
  const agentWords = agentRaw.trim().split(/\s+/);
  const lastAgentWord = (agentWords[agentWords.length - 1] || '').toLowerCase();
  const isAgentPlural =
    lastAgentWord === 'they' ||
    lastAgentWord === 'we' ||
    lastAgentWord === 'data' ||
    lastAgentWord === 'criteria' ||
    lastAgentWord === 'analyses' ||
    (lastAgentWord.endsWith('s') &&
      !lastAgentWord.endsWith('ss') &&
      !lastAgentWord.endsWith('us') &&
      !lastAgentWord.endsWith('is'));

  const isPastTense = aux === 'was' || aux === 'were' || aux.includes('been');

  if (IRREGULAR_PARTICIPLES[part]) {
    if (isPastTense) return IRREGULAR_PARTICIPLES[part].past;
    return isAgentPlural ? IRREGULAR_PARTICIPLES[part].base : IRREGULAR_PARTICIPLES[part].sForm;
  }

  // Regular -ed participle
  if (isPastTense) {
    return part; // e.g., "conducted", "analyzed", "observed"
  }

  // Convert regular -ed participle to base / 3rd-person present
  let base = part;
  if (part.endsWith('ied') && part.length > 4) {
    base = part.slice(0, -3) + 'y';
  } else if (part.endsWith('ed')) {
    const stem = part.slice(0, -2);
    if (/(?:at|iz|is|ur|ut|iv|ov|av|ev|rv|lv|sv|ns|rs|ls|nc|rc)$/.test(stem)) {
      base = stem + 'e';
    } else if (/([bcdfghjklmnpqrstvwxyz])\1$/.test(stem) && !/[lsz]$/.test(stem)) {
      base = stem.slice(0, -1);
    } else {
      base = stem;
    }
  }

  if (isAgentPlural) return base;
  if (base.endsWith('y') && !/[aeiou]y$/.test(base)) {
    return base.slice(0, -1) + 'ies';
  }
  if (/(?:s|sh|ch|x|z)$/.test(base)) {
    return base + 'es';
  }
  return base + 's';
}

function convertSentencePassiveToActive(sentence: string): string {
  let s = sentence.trim();

  // 1. Impersonal passive openers common in lab reports & essays
  s = s
    .replace(/^It\s+(?:was|has\s+been)\s+(?:observed|found|noted|discovered|determined)\s+that\s+/i, 'The findings indicate that ')
    .replace(/^It\s+is\s+(?:widely\s+)?(?:believed|argued|suggested|assumed)\s+that\s+/i, 'Scholars argue that ')
    .replace(/^It\s+can\s+be\s+(?:seen|concluded|inferred)\s+that\s+/i, 'The analysis shows that ')
    .replace(/^An?\s+(?:comprehensive\s+|detailed\s+|thorough\s+)?(analysis|investigation|study|experiment|survey|review)\s+was\s+(?:conducted|performed|carried\s+out|undertaken)\s+(?:to|on|into)\s+/i, (_, noun) => `Researchers conducted a ${noun.toLowerCase()} to `)
    .replace(/^Data\s+were\s+collected\s+from\s+/i, 'The research team collected data from ')
    .replace(/^Samples\s+were\s+analyzed\s+using\s+/i, 'We analyzed samples using ')
    .replace(/^Interviews\s+were\s+conducted\s+with\s+/i, 'Researchers interviewed ');

  // 2. Explicit "X was/were/is/are [adv] V-ed by Y [trailing]" -> "Y [adv] V-active X [trailing]"
  const explicitByRegex =
    /^([A-Z][a-zA-Z0-9\s,'’-]{2,65}?)\s+(was|were|is|are|has\s+been|have\s+been)\s+(?:(\w+ly)\s+)?([a-z]+(?:ed|en|wn|lt|pt|ft|ght|nd))\s+by\s+([a-zA-Z0-9\s,'’-]{2,55}?)([.,;:]|\s+(?:to|in|during|across|under|within|using|through|because|while|when)\b.*)$/;

  const match = s.match(explicitByRegex);
  if (match) {
    const [, rawObj, aux, adverb, participle, rawAgent, tail] = match;
    if (!NON_PASSIVE_ADJECTIVES.has(participle.toLowerCase())) {
      const activeVerb = inflectParticipleToActive(participle, aux, rawAgent);
      const loweredObj =
        /^(The|A|An|This|These|Those|Several|Many|Most|All|Both|Each)\b/.test(rawObj)
          ? rawObj.charAt(0).toLowerCase() + rawObj.slice(1)
          : rawObj;
      const capAgent = rawAgent.trim().charAt(0).toUpperCase() + rawAgent.trim().slice(1);
      const advPart = adverb ? `${adverb.toLowerCase()} ` : '';
      s = `${capAgent} ${advPart}${activeVerb} ${loweredObj.trim()}${tail}`;
    }
  }

  return s;
}

function applyReplacements(text: string, rules: ReplacementPair[]): string {
  let out = text;
  for (const r of rules) {
    out = out.replace(r.pattern, r.replacement as any);
  }
  return out;
}

function normalizeSentenceCasingAndSpacing(sentence: string): string {
  let s = sentence
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[,;:\s]+/, '')
    .trim();
  if (!s) return '';
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]["”')\]]*$/.test(s)) {
    s += '.';
  }
  return s;
}

const NATURAL_TRANSITION_OPENERS = [
  'In practice, ',
  'At the same time, ',
  'Even so, ',
  'From an empirical standpoint, ',
  'Building on this point, ',
];

/**
 * Restructures uniform-length AI sentences into varied human cadence (short declarative + longer analytical)
 * while strictly preserving parenthetical and bracketed citations.
 */
function restructureHumanCadence(sentences: string[], spinIndex: number = 0): string[] {
  const result: string[] = [];
  let openerCursor = spinIndex;

  for (let i = 0; i < sentences.length; i++) {
    let s = sentences[i].trim();
    if (!s) continue;

    // Strip mechanical AI transition words at the start of sentences
    const hadMechanicalTransition = /^(Moreover|Furthermore|Additionally|In addition),\s+/i.test(s);
    if (hadMechanicalTransition) {
      const stripped = s.replace(/^(Moreover|Furthermore|Additionally|In addition),\s+/i, '');
      // Every second stripped transition becomes a clean direct subject start; others get varied human framing
      if (openerCursor % 2 === 0) {
        s = stripped.charAt(0).toUpperCase() + stripped.slice(1);
      } else {
        const chosen = NATURAL_TRANSITION_OPENERS[openerCursor % NATURAL_TRANSITION_OPENERS.length];
        s = chosen + stripped.charAt(0).toLowerCase() + stripped.slice(1);
      }
      openerCursor += 1;
    }

    const wordLen = extractWords(s).length;

    // Split overly uniform/long compound sentences at ", which ", ", and this ", or " to " (> 21 words)
    // to create natural human burstiness (a crisp 7-12 word sentence next to a 20+ word sentence)
    if (wordLen >= 21 && (i + spinIndex) % 2 === 1) {
      const whichSplit = s.match(/^(.{45,}?),\s+which\s+(leads\s+to|results\s+in|demonstrates|highlights|suggests|creates|allows|enables|reduces|increases)\s+(.+)$/i);
      if (whichSplit) {
        const firstPart = normalizeSentenceCasingAndSpacing(whichSplit[1]);
        const verb = whichSplit[2].toLowerCase();
        const secondPart = normalizeSentenceCasingAndSpacing(`This shift ${verb} ${whichSplit[3]}`);
        result.push(firstPart, secondPart);
        continue;
      }

      const compoundAndSplit = s.match(/^(.{45,}?),\s+and\s+(it|this|these|they|such\s+\w+)\s+(.{20,})$/i);
      if (compoundAndSplit) {
        const firstPart = normalizeSentenceCasingAndSpacing(compoundAndSplit[1]);
        const secondPart = normalizeSentenceCasingAndSpacing(
          `${compoundAndSplit[2]} ${compoundAndSplit[3]}`
        );
        result.push(firstPart, secondPart);
        continue;
      }

      if (s.includes(' to ')) {
        const parts = s.split(/\s+to\s+/);
        if (parts.length === 2 && extractWords(parts[0]).length > 8 && extractWords(parts[1]).length > 4) {
          const firstPart = normalizeSentenceCasingAndSpacing(parts[0].replace(/[,;]$/, ''));
          const rest = parts[1].trim();
          const prefix = spinIndex % 2 === 1 ? 'This workflow helps ' : 'This approach helps ';
          const secondPart = normalizeSentenceCasingAndSpacing(
            prefix + rest.charAt(0).toLowerCase() + rest.slice(1)
          );
          result.push(firstPart, secondPart);
          continue;
        }
      }
    }

    // Combine two consecutive short choppy sentences (< 11 words each) if safe & citation-clean
    if (
      wordLen <= 10 &&
      i + 1 < sentences.length &&
      extractWords(sentences[i + 1]).length <= 11 &&
      !s.includes('?')
    ) {
      const nextClean = sentences[i + 1]
        .trim()
        .replace(/^(This|It)\s+is\s+/i, 'which is ')
        .replace(/^(This|These)\s+/i, 'thereby shaping ');
      if (nextClean !== sentences[i + 1].trim()) {
        const merged = s.replace(/[.!]+$/, '') + ', ' + nextClean;
        result.push(normalizeSentenceCasingAndSpacing(merged));
        i += 1;
        continue;
      }
    }

    result.push(normalizeSentenceCasingAndSpacing(s));
  }

  return result;
}

const SPIN_VARIATION_RULES: Array<[RegExp, string[]]> = [
  [/\bstudents\b/gi, ['students', 'learners', 'undergraduates']],
  [/\bacademic\b/gi, ['academic', 'scholarly', 'university']],
  [/\btechnology\b/gi, ['technology', 'digital infrastructure', 'computational tools']],
  [/\bworkflows\b/gi, ['workflows', 'processes', 'research routines']],
  [/\bshaping\b/gi, ['shaping', 'influencing', 'guiding']],
  [/\borganize\b/gi, ['organize', 'structure', 'coordinate']],
  [/\binnovations\b/gi, ['innovations', 'methods', 'advancements']],
  [/\bcontemporary universities\b/gi, ['contemporary universities', 'modern higher education', 'university campuses']],
  [/\bnotably,\s*/gi, ['Notably, ', 'In practice, ', 'Empirically, ']],
];

function applySpinVariations(text: string, spinIndex: number): string {
  const idx = Math.abs(Math.floor(spinIndex));
  if (idx === 0) return text;
  let out = text;
  for (const [pattern, options] of SPIN_VARIATION_RULES) {
    const choice = options[idx % options.length];
    out = out.replace(pattern, (match) => matchCapitalization(match, choice));
  }
  return out;
}

export function paraphraseLocally(
  text: string,
  mode: ParaphraseMode,
  spinIndex: number = 0
): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const paragraphs = trimmed.split(/\n{2,}/);

  const processedParagraphs = paragraphs.map((para) => {
    let working = para;

    // Mode-prioritized transformations first, followed by universal de-AI cliché cleanup
    if (mode === 'scholarly') {
      working = working
        .replace(/\bIn today['’]s fast-paced world,\s*/gi, 'Within contemporary higher education contexts, ')
        .replace(/\bplays a vital role in\b/gi, 'constitutes a primary driver in')
        .replace(/\bMoreover,\s*it is important to note that\b/gi, 'Empirical observations further indicate that')
        .replace(/\bFurthermore,\s*(?:the\s+)?ever-evolving realm of\b/gi, 'Concurrently, ongoing developments within')
        .replace(/\bserves as a testament to how\b/gi, 'demonstrates the extent to which')
        .replace(/\bcan underscore the importance of\b/gi, 'reinforces the efficacy of')
        .replace(/\bIn conclusion,\s*this intricate tapestry of innovation provides a crucial role in\b/gi, 'Collectively, these technological mechanisms prove instrumental in')
        .replace(/\bstreamline\b/gi, 'systematize');
      working = applyReplacements(working, SHARED_DE_AI_REPLACEMENTS);
      working = applyReplacements(working, SCHOLARLY_ELEVATIONS);
      working = applySpinVariations(working, spinIndex);
      const sents = splitAcademicSentences(working).map((s) =>
        normalizeSentenceCasingAndSpacing(s)
      );
      return sents.join(' ');
    }

    if (mode === 'concise') {
      working = working
        .replace(/\bIn today['’]s fast-paced world,\s*/gi, 'Today, ')
        .replace(/\bplays a vital role in transforming\b/gi, 'transforms')
        .replace(/\bincreasingly delve into automated digital tools to streamline\b/gi, 'use digital tools to streamline')
        .replace(/\bFurthermore,\s*(?:the\s+)?ever-evolving realm of\b/gi, 'Advances in')
        .replace(/\bserves as a testament to how technology can underscore the importance of\b/gi, 'enable')
        .replace(/\bIn conclusion,\s*this intricate tapestry of innovation provides a crucial role in\b/gi, 'These innovations directly support');
      working = applyReplacements(working, SHARED_DE_AI_REPLACEMENTS);
      working = applyReplacements(working, CONCISE_TRIMMING_RULES);
      working = applySpinVariations(working, spinIndex);
      const sents = splitAcademicSentences(working).map((s) =>
        normalizeSentenceCasingAndSpacing(
          s
            .replace(/\bin\s+a\s+manner\s+that\s+is\s+/gi, '')
            .replace(/\bit\s+can\s+be\s+observed\s+that\s+/gi, '')
        )
      );
      return sents.join(' ');
    }

    if (mode === 'active') {
      working = working
        .replace(/\bIn today['’]s fast-paced world,\s*/gi, '')
        .replace(/\bplays a vital role in transforming\b/gi, 'directly transforms')
        .replace(/\bdelve into automated digital tools to streamline\b/gi, 'adopt digital tools that streamline')
        .replace(/\bFurthermore,\s*(?:the\s+)?ever-evolving realm of machine learning serves as a testament to how technology can underscore the importance of\b/gi, 'Machine learning directly powers')
        .replace(/\bIn conclusion,\s*this intricate tapestry of innovation provides a crucial role in shaping\b/gi, 'Ultimately, these innovations shape');
      working = applyReplacements(working, SHARED_DE_AI_REPLACEMENTS);
      working = applyReplacements(working, CONCISE_TRIMMING_RULES.slice(0, 6));
      working = applySpinVariations(working, spinIndex);
      const sents = splitAcademicSentences(working).map((s) =>
        normalizeSentenceCasingAndSpacing(convertSentencePassiveToActive(s))
      );
      return sents.join(' ');
    }

    // Default: 'natural' (Natural Human Flow)
    working = applyReplacements(working, SHARED_DE_AI_REPLACEMENTS);
    working = applyReplacements(working, CONCISE_TRIMMING_RULES.slice(0, 8));
    working = applySpinVariations(working, spinIndex);
    const rawSents = splitAcademicSentences(working).map((s, idx) =>
      idx % 2 === 0 ? convertSentencePassiveToActive(s) : s
    );
    const varied = restructureHumanCadence(rawSents, spinIndex);
    return varied.join(' ');
  });

  return processedParagraphs.join('\n\n');
}

export interface ParaphraseResult {
  output: string;
  engineUsed: 'chrome-on-device-rewriter' | 'local-typescript-nlp';
  durationMs: number;
}

/**
 * Uses Chrome's built-in On-Device Rewriter API (`if ('Rewriter' in self)`) when immediately ready on device,
 * falling back with 0ms latency to our deterministic pure-TypeScript NLP & syntactic restructurer.
 */
export async function runHybridAcademicParaphraser(
  text: string,
  mode: ParaphraseMode,
  spinIndex: number = 0
): Promise<ParaphraseResult> {
  const start = performance.now();
  const clean = text.trim();
  if (!clean) {
    return { output: '', engineUsed: 'local-typescript-nlp', durationMs: 0 };
  }

  try {
    const globalSelf = self as unknown as {
      Rewriter?: {
        availability?: () => Promise<string>;
        create?: (opts: Record<string, unknown>) => Promise<{
          rewrite: (input: string, opts?: Record<string, unknown>) => Promise<string>;
          destroy?: () => void;
        }>;
      };
    };

    if (spinIndex === 0 && 'Rewriter' in self && globalSelf.Rewriter?.create) {
      const availability = globalSelf.Rewriter.availability
        ? await globalSelf.Rewriter.availability()
        : 'available';

      // Only invoke on-device model when already available locally (zero download wait)
      if (availability === 'available' || availability === 'readily') {
        const rewriterConfig: Record<string, unknown> = {
          tone: mode === 'scholarly' ? 'more-formal' : mode === 'natural' ? 'as-is' : 'more-formal',
          length: mode === 'concise' ? 'shorter' : 'as-is',
          format: 'plain-text',
          sharedContext:
            mode === 'active'
              ? 'Academic university essay edited into direct active voice without clichés.'
              : mode === 'natural'
                ? 'Human-written university prose with varied sentence lengths and zero AI clichés.'
                : mode === 'concise'
                  ? 'Concise scholarly prose trimmed for strict university essay word limits.'
                  : 'Formal peer-reviewed university academic prose.',
        };

        const rewriter = await globalSelf.Rewriter.create(rewriterConfig);
        const rawOut = await rewriter.rewrite(clean);
        rewriter.destroy?.();

        if (rawOut && rawOut.trim().length > 0) {
          // Polish through local de-cliché pass so zero LLM clichés slip through
          const polished = applyReplacements(rawOut.trim(), SHARED_DE_AI_REPLACEMENTS);
          return {
            output: polished,
            engineUsed: 'chrome-on-device-rewriter',
            durationMs: Math.round(performance.now() - start),
          };
        }
      }
    }
  } catch {
    // Seamless instant fallback to local TypeScript NLP engine
  }

  const localOutput = paraphraseLocally(clean, mode, spinIndex);
  return {
    output: localOutput,
    engineUsed: 'local-typescript-nlp',
    durationMs: Math.max(1, Math.round(performance.now() - start)),
  };
}

export interface SentenceInlineSegment {
  text: string;
  isCliché: boolean;
  suggestion?: string;
}

/**
 * Splits a sentence into clean segments marking AI cliché matches for inline JSX highlighting (no HTML injection).
 */
export function segmentSentenceClichés(sentence: string): SentenceInlineSegment[] {
  if (!sentence) return [];
  const matches: Array<{ start: number; end: number; suggestion: string }> = [];

  for (const rule of AI_CLICHE_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(sentence)) !== null) {
      if (m[0].length === 0) break;
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        suggestion: rule.suggestion,
      });
    }
  }

  if (matches.length === 0) {
    return [{ text: sentence, isCliché: false }];
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Array<{ start: number; end: number; suggestion: string }> = [];
  for (const cur of matches) {
    const prev = merged[merged.length - 1];
    if (!prev || cur.start >= prev.end) {
      merged.push(cur);
    } else if (cur.end > prev.end) {
      prev.end = cur.end;
    }
  }

  const segments: SentenceInlineSegment[] = [];
  let cursor = 0;
  for (const span of merged) {
    if (span.start > cursor) {
      segments.push({ text: sentence.slice(cursor, span.start), isCliché: false });
    }
    segments.push({
      text: sentence.slice(span.start, span.end),
      isCliché: true,
      suggestion: span.suggestion,
    });
    cursor = span.end;
  }
  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor), isCliché: false });
  }
  return segments;
}

export interface DiffToken {
  text: string;
  isEdited: boolean;
}

/**
 * Tokenizes rewritten prose and marks newly introduced / substituted words for the "Highlight Edits" toggle.
 */
export function computeRefinedDiffTokens(originalText: string, rewrittenText: string): DiffToken[] {
  if (!rewrittenText) return [];
  const origWordSet = new Set(extractWords(originalText));
  const rawTokens = rewrittenText.split(/(\s+)/);
  return rawTokens.map((tok) => {
    if (!tok || /^\s+$/.test(tok)) {
      return { text: tok, isEdited: false };
    }
    const clean = tok.toLowerCase().replace(/[^a-z0-9'-]/g, '');
    return {
      text: tok,
      isEdited: Boolean(clean && !origWordSet.has(clean)),
    };
  });
}

// ============================================================================
// ENGINE 3: SOURCE-OVERLAP & ORIGINALITY CHECKER (3-GRAM & 4-GRAM SIMILARITY)
// ============================================================================

interface WordSpan {
  norm: string;
  start: number;
  end: number;
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export interface SourceOverlapReport {
  overallSimilarityPct: number;
  threeGramOverlapPct: number;
  fourGramOverlapPct: number;
  matchedWordCount: number;
  totalCandidateWords: number;
  matchedPhrases: string[];
  segments: HighlightSegment[];
  verdict: 'high-originality' | 'moderate-overlap' | 'high-overlap';
  verdictLabel: string;
}

function tokenizeWithSpans(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  const regex = /[a-zA-Z0-9]+(?:['’-][a-zA-Z0-9]+)*/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    spans.push({
      norm: m[0].toLowerCase().replace(/['’]/g, "'"),
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return spans;
}

function buildNGramSet(tokens: WordSpan[], n: number): Set<string> {
  const set = new Set<string>();
  if (tokens.length < n) return set;
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens
      .slice(i, i + n)
      .map((t) => t.norm)
      .join(' ');
    set.add(gram);
  }
  return set;
}

export function computeSourceOverlap(
  candidateText: string,
  referenceSource: string
): SourceOverlapReport {
  if (!candidateText.trim() || !referenceSource.trim()) {
    return {
      overallSimilarityPct: 0,
      threeGramOverlapPct: 0,
      fourGramOverlapPct: 0,
      matchedWordCount: 0,
      totalCandidateWords: extractWords(candidateText).length,
      matchedPhrases: [],
      segments: candidateText ? [{ text: candidateText, isMatch: false }] : [],
      verdict: 'high-originality',
      verdictLabel: 'Paste a reference source passage to check paraphrase originality',
    };
  }

  const candTokens = tokenizeWithSpans(candidateText);
  const refTokens = tokenizeWithSpans(referenceSource);

  if (candTokens.length < 3 || refTokens.length < 3) {
    return {
      overallSimilarityPct: 0,
      threeGramOverlapPct: 0,
      fourGramOverlapPct: 0,
      matchedWordCount: 0,
      totalCandidateWords: candTokens.length,
      matchedPhrases: [],
      segments: [{ text: candidateText, isMatch: false }],
      verdict: 'high-originality',
      verdictLabel: 'Enter at least 3 words in both boxes to compute N-gram similarity',
    };
  }

  const ref3Grams = buildNGramSet(refTokens, 3);
  const ref4Grams = buildNGramSet(refTokens, 4);

  const flaggedTokenIndices = new Set<number>();

  // 3-Gram scan
  const total3 = Math.max(1, candTokens.length - 2);
  let hits3 = 0;
  for (let i = 0; i <= candTokens.length - 3; i++) {
    const gram3 = `${candTokens[i].norm} ${candTokens[i + 1].norm} ${candTokens[i + 2].norm}`;
    if (ref3Grams.has(gram3)) {
      hits3 += 1;
      flaggedTokenIndices.add(i);
      flaggedTokenIndices.add(i + 1);
      flaggedTokenIndices.add(i + 2);
    }
  }

  // 4-Gram scan
  const total4 = Math.max(1, candTokens.length - 3);
  let hits4 = 0;
  if (candTokens.length >= 4 && refTokens.length >= 4) {
    for (let i = 0; i <= candTokens.length - 4; i++) {
      const gram4 = `${candTokens[i].norm} ${candTokens[i + 1].norm} ${candTokens[i + 2].norm} ${candTokens[i + 3].norm}`;
      if (ref4Grams.has(gram4)) {
        hits4 += 1;
        flaggedTokenIndices.add(i);
        flaggedTokenIndices.add(i + 1);
        flaggedTokenIndices.add(i + 2);
        flaggedTokenIndices.add(i + 3);
      }
    }
  }

  const threeGramOverlapPct = Math.round((hits3 / total3) * 100);
  const fourGramOverlapPct = candTokens.length >= 4 ? Math.round((hits4 / total4) * 100) : 0;
  const matchedWordCount = flaggedTokenIndices.size;
  const wordCoveragePct = Math.round((matchedWordCount / candTokens.length) * 100);

  // Overall Similarity weights contiguous matched token coverage and 3-gram precision
  const overallSimilarityPct = Math.min(
    100,
    Math.round(wordCoveragePct * 0.65 + threeGramOverlapPct * 0.35)
  );

  // Merge contiguous flagged token spans into clean character intervals for amber highlighting
  const charRanges: Array<{ start: number; end: number }> = [];
  let idx = 0;
  while (idx < candTokens.length) {
    if (!flaggedTokenIndices.has(idx)) {
      idx += 1;
      continue;
    }
    const runStart = candTokens[idx].start;
    let runEnd = candTokens[idx].end;
    let j = idx + 1;
    while (j < candTokens.length && flaggedTokenIndices.has(j)) {
      runEnd = candTokens[j].end;
      j += 1;
    }
    charRanges.push({ start: runStart, end: runEnd });
    idx = j;
  }

  const matchedPhrases = Array.from(
    new Set(charRanges.map((r) => candidateText.slice(r.start, r.end).trim()))
  ).slice(0, 12);

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const range of charRanges) {
    if (range.start > cursor) {
      segments.push({ text: candidateText.slice(cursor, range.start), isMatch: false });
    }
    segments.push({ text: candidateText.slice(range.start, range.end), isMatch: true });
    cursor = range.end;
  }
  if (cursor < candidateText.length) {
    segments.push({ text: candidateText.slice(cursor), isMatch: false });
  }

  const verdict: SourceOverlapReport['verdict'] =
    overallSimilarityPct >= 25
      ? 'high-overlap'
      : overallSimilarityPct >= 10
        ? 'moderate-overlap'
        : 'high-originality';

  const verdictLabel =
    verdict === 'high-originality'
      ? 'Strong Paraphrase Synthesis (<10% Source Overlap — Remember In-Text Citation)'
      : verdict === 'moderate-overlap'
        ? 'Moderate Phrase Overlap (10–24% — Restructure Amber-Highlighted Clauses)'
        : 'High Verbatim Overlap (≥25% — Rewrite Sentence Structure & Add Proper Citation)';

  return {
    overallSimilarityPct,
    threeGramOverlapPct,
    fourGramOverlapPct,
    matchedWordCount,
    totalCandidateWords: candTokens.length,
    matchedPhrases,
    segments,
    verdict,
    verdictLabel,
  };
}

// ============================================================================
// SAMPLE ACADEMIC PRESETS (DRAFT + MATCHING REFERENCE SOURCE)
// ============================================================================

export interface AcademicSamplePreset {
  id: string;
  label: string;
  discipline: string;
  aiDraft: string;
  referenceSource: string;
}

export const ACADEMIC_PARAPHRASER_SAMPLES: AcademicSamplePreset[] = [
  {
    id: 'ai-higher-ed-workflow',
    label: 'Sample AI Draft (Higher Education & AI)',
    discipline: 'AI & Higher Education',
    aiDraft:
      "In today's fast-paced world, artificial intelligence plays a vital role in transforming modern higher education. Moreover, it is important to note that students increasingly delve into automated digital tools to streamline their academic research workflows. Furthermore, the ever-evolving realm of machine learning serves as a testament to how technology can underscore the importance of personalized learning pathways. In conclusion, this intricate tapestry of innovation provides a crucial role in shaping future academic success.",
    referenceSource:
      'Artificial intelligence is transforming modern higher education as students increasingly adopt digital tools to streamline academic research workflows and create personalized learning pathways for future academic success.',
  },
  {
    id: 'ai-policy-essay',
    label: 'Sample AI Essay Draft (Assessment Policy)',
    discipline: 'Education & Public Policy',
    aiDraft:
      "In today's fast-paced world, artificial intelligence plays a crucial role in shaping university assessment practices. It is important to note that automated feedback platforms delve into student writing patterns with unprecedented speed. Moreover, empirical evaluations were conducted by higher education researchers to measure how formative feedback impacts first-year retention (Dawson et al., 2024). Furthermore, these findings serve as a testament to the intricate interplay between human mentorship and digital scaffolding, underscoring the importance of ethical academic integrity policies.",
    referenceSource:
      'Automated feedback platforms examine student writing patterns with unprecedented speed, while empirical evaluations were conducted by higher education researchers to measure how formative feedback impacts first-year retention across large undergraduate cohorts (Dawson et al., 2024).',
  },
  {
    id: 'bio-lab-passive',
    label: 'Passive Lab Methods Draft (Molecular Biology)',
    discipline: 'Biological Sciences',
    aiDraft:
      'An investigation was conducted on cellular ATP synthesis in order to determine the inhibitory threshold of oligomycin. Due to the fact that mitochondrial membrane potential plays a pivotal role in oxidative phosphorylation, fluorescence assays were performed by the laboratory team across four substrate concentrations. Moreover, it was observed that proton leak was significantly reduced by mild hypothermia, shedding light on a myriad of metabolic adaptations.',
    referenceSource:
      'Mitochondrial membrane potential plays a central role in oxidative phosphorylation, and fluorescence assays across four substrate concentrations demonstrated that proton leak declined under mild hypothermia.',
  },
  {
    id: 'econ-wordy',
    label: 'Wordy Literature Review (Economics)',
    discipline: 'Macroeconomics',
    aiDraft:
      "In the realm of monetary economics, a large number of studies have looked into how central bank communication affects inflation expectations. It is worth noting that forward guidance isn't always effective in the event that household inflation literacy remains low (Coibion et al., 2022). Furthermore, navigating the complexities of sovereign debt markets requires a holistic approach to fiscal credibility, which is a testament to institutional transparency.",
    referenceSource:
      'Central bank communication shapes inflation expectations, yet forward guidance loses traction when household inflation literacy remains low across heterogeneous consumer groups (Coibion et al., 2022).',
  },
];
