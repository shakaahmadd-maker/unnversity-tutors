import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Converts common ASCII / Unicode math expressions into clean KaTeX LaTeX so
 * formulas, derivatives, integrals, matrices, fractions, and limits render
 * as true textbook mathematics rather than plain text.
 */
export function asciiMathToLatex(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();

  // Normalize Unicode minus/multiplication/symbols first
  const unicodeSubMap: Record<string, string> = {
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4',
    '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9',
    'ₐ': '_a', 'ₑ': '_e', 'ᵢ': '_i', 'ⱼ': '_j', 'ₙ': '_n', 'ₓ': '_x',
  };
  const unicodeSupMap: Record<string, string> = {
    '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4',
    '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
    'ᵀ': '^T', 'ⁿ': '^n', 'ⁱ': '^i',
  };

  s = s
    .replace(/−|–/g, '-')
    .replace(/·/g, ' \\cdot ')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/±/g, ' \\pm ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≠/g, ' \\ne ')
    .replace(/≈/g, ' \\approx ')
    .replace(/≡/g, ' \\equiv ')
    .replace(/→|->/g, ' \\to ')
    .replace(/⇒|=>/g, ' \\Rightarrow ')
    .replace(/⇔/g, ' \\Leftrightarrow ')
    .replace(/∞/g, ' \\infty ')
    .replace(/°/g, '^\\circ ')
    .replace(/∈/g, ' \\in ')
    .replace(/⟨/g, ' \\langle ')
    .replace(/⟩/g, ' \\rangle ')
    .replace(/₀|₁|₂|₃|₄|₅|₆|₇|₈|₉|ₐ|ₑ|ᵢ|ⱼ|ₙ|ₓ/g, (ch) => unicodeSubMap[ch] || '')
    .replace(/⁰|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|ᵀ|ⁿ|ⁱ/g, (ch) => unicodeSupMap[ch] || '');

  // Handle stacked fractions like (a)/(b), (-b +- sqrt(...))/(2a), x^2/25, sin(x)/x, 1/2
  // First normalize common differential notation
  s = s
    .replace(/\bdy\/dx\b/g, '\\frac{dy}{dx}')
    .replace(/\bd\/dx\b/g, '\\frac{d}{dx}')
    .replace(/\bd\/dt\b/g, '\\frac{d}{dt}')
    .replace(/\bd2y\/dx2\b/gi, '\\frac{d^2y}{dx^2}')
    .replace(/∂([a-zA-Z])\/∂([a-zA-Z])/g, '\\frac{\\partial $1}{\\partial $2}')
    .replace(/∂/g, '\\partial ')
    .replace(/∇/g, '\\nabla ');

  // Normalize integrals, sums, limits
  s = s
    .replace(/∫_([^{\s]+)\^([^{\s]+)/g, '\\int_{$1}^{$2}')
    .replace(/∫/g, '\\int ')
    .replace(/∑_([^{\s]+)\^([^{\s]+)/g, '\\sum_{$1}^{$2}')
    .replace(/∑/g, '\\sum ')
    .replace(/\blim_\(([^)]+)\)/g, '\\lim_{$1}')
    .replace(/\blim_\{([^}]+)\}/g, '\\lim_{$1}')
    .replace(/\blim\b/g, '\\lim');

  // Laplace / Fourier curly operators
  s = s
    .replace(/ℒ\{([^}]*)\}/g, '\\mathcal{L}\\{$1\\}')
    .replace(/ℒ⁻¹\{([^}]*)\}/g, '\\mathcal{L}^{-1}\\{$1\\}')
    .replace(/ℒ/g, '\\mathcal{L}')
    .replace(/ℱ\{([^}]*)\}/g, '\\mathcal{F}\\{$1\\}')
    .replace(/ℱ/g, '\\mathcal{F}');

  // Greek letters
  s = s
    .replace(/π/g, '\\pi ')
    .replace(/\bpi\b/g, '\\pi ')
    .replace(/θ/g, '\\theta ')
    .replace(/α/g, '\\alpha ')
    .replace(/β/g, '\\beta ')
    .replace(/γ/g, '\\gamma ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/δ/g, '\\delta ')
    .replace(/λ/g, '\\lambda ')
    .replace(/μ/g, '\\mu ')
    .replace(/σ/g, '\\sigma ')
    .replace(/φ/g, '\\phi ')
    .replace(/χ/g, '\\chi ')
    .replace(/ω/g, '\\omega ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/ε/g, '\\varepsilon ');

  // Square roots: sqrt(...) or √(...) or √Δ / √2
  s = s
    .replace(/\bsqrt\(([^()]+)\)/g, '\\sqrt{$1}')
    .replace(/√\(([^()]+)\)/g, '\\sqrt{$1}')
    .replace(/√([a-zA-Z0-9\\]+(?:\s*\\Delta)?)/g, '\\sqrt{$1}')
    .replace(/√/g, '\\sqrt{}');

  // Exponents like ^(expr) or ^-0.12x or ^2
  s = s
    .replace(/\^\(([^()]+)\)/g, '^{$1}')
    .replace(/\^([a-zA-Z0-9-]{2,})/g, '^{$1}')
    .replace(/_\(([^()]+)\)/g, '_{$1}')
    .replace(/_([a-zA-Z0-9-]{2,})/g, '_{$1}');

  // Standard functions
  s = s
    .replace(/\blog_(\d+)\(/g, '\\log_{$1}(')
    .replace(/\blog2\(/g, '\\log_2(')
    .replace(/\blog10\(/g, '\\log_{10}(')
    .replace(/\b(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|sinh|cosh|tanh|ln|log|exp|det)\b/g, '\\$1');

  // Barred x̄ and ŷ
  s = s
    .replace(/x̄/g, '\\bar{x}')
    .replace(/p̂/g, '\\hat{p}')
    .replace(/ŷ/g, '\\hat{y}');

  // Simple clear fractions: (A)/(B) -> \frac{A}{B}
  s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
  // Numerator token / Denominator token e.g. x^2/25, a/b, sin(x)/x, 16/3, sigma/sqrt{n}
  s = s.replace(
    /(\\[a-zA-Z]+(?:\([^)]*\)|\{[^}]*\})*|[a-zA-Z0-9]+(?:\^\{[^}]+\}|\^[a-zA-Z0-9]+|_\{[^}]+\}|_[a-zA-Z0-9]+)?)\s*\/\s*(\\[a-zA-Z]+(?:\([^)]*\)|\{[^}]*\})*|[a-zA-Z0-9]+(?:\^\{[^}]+\}|\^[a-zA-Z0-9]+|_\{[^}]+\}|_[a-zA-Z0-9]+)?)/g,
    '\\frac{$1}{$2}'
  );

  // Clean * multiplication in symbolic formulas into subtle spacing or dot
  s = s.replace(/\s*\*\s*/g, ' \\cdot ');

  return s.replace(/\s{2,}/g, ' ').trim();
}

interface MathFormulaProps {
  expr?: string;
  latex?: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders genuine KaTeX mathematical notation from either LaTeX or ASCII/Unicode math.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  expr,
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    const source = latex ?? (expr ? asciiMathToLatex(expr) : '');
    if (!source) return '';
    try {
      return katex.renderToString(source, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return '';
    }
  }, [expr, latex, displayMode]);

  if (!html) {
    return (
      <span className={`font-math-serif ${className}`}>
        {latex || expr || ''}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`max-w-full overflow-x-auto no-scrollbar ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-middle max-w-full overflow-x-auto no-scrollbar ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathMatrixDisplayProps {
  matrix: number[][];
  label?: string;
  brackets?: 'b' | 'v' | 'p';
  precision?: number;
  className?: string;
}

/**
 * Renders numeric matrices & determinants using real KaTeX bmatrix/vmatrix brackets.
 */
export const MathMatrixDisplay: React.FC<MathMatrixDisplayProps> = ({
  matrix,
  label,
  brackets = 'b',
  precision = 4,
  className = '',
}) => {
  const latex = useMemo(() => {
    const env = brackets === 'v' ? 'vmatrix' : brackets === 'p' ? 'pmatrix' : 'bmatrix';
    const formatCell = (v: number) => {
      if (!Number.isFinite(v)) return '\\text{NaN}';
      if (Math.abs(v) < 1e-10) return '0';
      if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
      return Number(v.toFixed(precision)).toString();
    };
    const rows = matrix.map((r) => r.map(formatCell).join(' & ')).join(' \\\\ ');
    const prefix = label ? `${asciiMathToLatex(label)} = ` : '';
    return `${prefix}\\begin{${env}} ${rows} \\end{${env}}`;
  }, [matrix, label, brackets, precision]);

  return <MathFormula latex={latex} displayMode className={className} />;
};

interface MathTextProps {
  text: string;
  className?: string;
}

const MATH_TOKEN_REGEX =
  /(\$[^$]+\$|\\(?:frac|sqrt|int|sum|lim|Delta|lambda|theta|sigma|mu|alpha|beta|gamma|pi|nabla|partial)\b[^\s,;.)]*|[A-Za-z0-9()]+(?:\([^)]*\))?\s*=\s*[^,;.\n]+(?:\s*[+\-*/^]\s*[^,;.\n]+)*|[A-Za-z0-9()]+(?:\^[A-Za-z0-9{}()+-]+|_[A-Za-z0-9{}]+)+|[a-zA-Z0-9]+\/[a-zA-Z0-9]+|(?:√|∫|∑|∇|∂|ℒ|ℱ)[^\s,;]*|(?:sin|cos|tan|ln|log|exp|sqrt|det|lim)\([^)]+\)|[αβγΔθλμσφχωπσ]|\b[xyzt]\^[0-9]+|\bH_[01]|H₀|H₁|x̄|ŷ|p̂)/g;

/**
 * Renders natural educational prose while automatically typesetting embedded `$...$`
 * LaTeX blocks and mathematical expressions via KaTeX so derivations never look like raw ASCII text.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    const tokens: Array<{ kind: 'text' | 'math'; value: string; isLatex?: boolean }> = [];
    let lastIndex = 0;

    // First pass: explicit $...$ blocks take top priority
    const explicitDollar = /\$([^$]+)\$/g;
    let m: RegExpExecArray | null;
    const rawSegments: Array<{ isExplicitLatex: boolean; val: string }> = [];

    while ((m = explicitDollar.exec(text)) !== null) {
      if (m.index > lastIndex) {
        rawSegments.push({ isExplicitLatex: false, val: text.slice(lastIndex, m.index) });
      }
      rawSegments.push({ isExplicitLatex: true, val: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) {
      rawSegments.push({ isExplicitLatex: false, val: text.slice(lastIndex) });
    }

    for (const seg of rawSegments) {
      if (seg.isExplicitLatex) {
        tokens.push({ kind: 'math', value: seg.val, isLatex: true });
        continue;
      }

      // Auto-detect math spans inside plain prose
      let pos = 0;
      const chunk = seg.val;
      const re = new RegExp(MATH_TOKEN_REGEX.source, 'g');
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(chunk)) !== null) {
        const hit = mm[0];
        // Skip common date/URL/word slashes like "and/or" or "2026/11" or prose words
        if (
          /^[a-zA-Z]+\/[a-zA-Z]+$/.test(hit) &&
          !/^[a-z]\/[a-z]$|^d[a-z]?\/d[a-z]$/.test(hit)
        ) {
          continue;
        }
        if (/^\d+\/\d+$/.test(hit) && hit.length > 7) {
          continue;
        }

        if (mm.index > pos) {
          tokens.push({ kind: 'text', value: chunk.slice(pos, mm.index) });
        }
        tokens.push({ kind: 'math', value: hit, isLatex: false });
        pos = mm.index + hit.length;
      }
      if (pos < chunk.length) {
        tokens.push({ kind: 'text', value: chunk.slice(pos) });
      }
    }

    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.kind === 'math' ? (
          <MathFormula
            key={idx}
            latex={part.isLatex ? part.value : undefined}
            expr={part.isLatex ? undefined : part.value}
            className="mx-0.5 text-[#0F172A]"
          />
        ) : (
          <React.Fragment key={idx}>{part.value}</React.Fragment>
        )
      )}
    </span>
  );
};
