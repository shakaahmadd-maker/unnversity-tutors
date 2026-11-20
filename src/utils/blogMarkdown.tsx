import React from 'react';
import { resolveMediaUrl } from '../lib/apiClient';

function sanitizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return '#';
}

const ALLOWED_FONT_FAMILIES: Record<string, string> = {
  inter: 'Inter, system-ui, -apple-system, sans-serif',
  sans: 'Inter, system-ui, -apple-system, sans-serif',
  'sans-serif': 'Inter, system-ui, -apple-system, sans-serif',
  georgia: 'Georgia, Cambria, "Times New Roman", Times, serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  'times new roman': '"Times New Roman", Times, Georgia, serif',
  merriweather: 'Merriweather, Georgia, serif',
  arial: 'Arial, Helvetica, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  'trebuchet ms': '"Trebuchet MS", Helvetica, sans-serif',
  'courier new': '"Courier New", Courier, monospace',
  monospace: '"Courier New", Courier, monospace',
  calibri: 'Calibri, "Segoe UI", Arial, sans-serif',
  cambria: 'Cambria, Georgia, serif',
  garamond: 'Garamond, Georgia, serif',
};

function sanitizeColor(val: string): string | undefined {
  const clean = val.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) {
    return clean;
  }
  if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(clean)) {
    return clean;
  }
  return undefined;
}

function sanitizeFontFamily(val: string): string | undefined {
  const primary = val
    .split(',')[0]
    .replace(/["']/g, '')
    .trim()
    .toLowerCase();
  return ALLOWED_FONT_FAMILIES[primary];
}

function sanitizeFontSize(val: string): string | undefined {
  const pxMatch = val.trim().match(/^(\d{1,2}(?:\.\d+)?)px$/i);
  if (pxMatch) {
    const n = parseFloat(pxMatch[1]);
    if (n >= 10 && n <= 54) return `${n}px`;
  }
  const ptMatch = val.trim().match(/^(\d{1,2}(?:\.\d+)?)pt$/i);
  if (ptMatch) {
    const n = parseFloat(ptMatch[1]);
    if (n >= 8 && n <= 42) return `${n}pt`;
  }
  const remMatch = val.trim().match(/^(\d(?:\.\d+)?)rem$/i);
  if (remMatch) {
    const n = parseFloat(remMatch[1]);
    if (n >= 0.7 && n <= 3.5) return `${n}rem`;
  }
  return undefined;
}

function sanitizePixelSpacing(val: string, maxPx = 200): string | undefined {
  const pxMatch = val.trim().match(/^(-?\d{1,3}(?:\.\d+)?)px$/i);
  if (pxMatch) {
    const n = parseFloat(pxMatch[1]);
    if (n >= 0 && n <= maxPx) return `${n}px`;
  }
  const remMatch = val.trim().match(/^(\d{1,2}(?:\.\d+)?)rem$/i);
  if (remMatch) {
    const n = parseFloat(remMatch[1]);
    if (n >= 0 && n <= 12) return `${n}rem`;
  }
  return undefined;
}

function sanitizeInlineStyle(styleAttr: string, allowBlockProps = false): React.CSSProperties {
  const result: React.CSSProperties = {};
  if (!styleAttr) return result;

  const declarations = styleAttr.split(';');
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const rawVal = decl.slice(colonIdx + 1).trim();
    if (!rawVal) continue;

    if (prop === 'color') {
      const c = sanitizeColor(rawVal);
      if (c) result.color = c;
    } else if (prop === 'background-color' || prop === 'background') {
      const bg = sanitizeColor(rawVal);
      if (bg) result.backgroundColor = bg;
    } else if (prop === 'font-family') {
      const ff = sanitizeFontFamily(rawVal);
      if (ff) result.fontFamily = ff;
    } else if (prop === 'font-size') {
      const fs = sanitizeFontSize(rawVal);
      if (fs) result.fontSize = fs;
    } else if (prop === 'text-transform') {
      const tt = rawVal.toLowerCase();
      if (tt === 'uppercase' || tt === 'lowercase' || tt === 'capitalize' || tt === 'none') {
        result.textTransform = tt;
      }
    } else if (prop === 'letter-spacing') {
      const ls = rawVal.match(/^(-?\d(?:\.\d+)?)(px|em)$/i);
      if (ls) {
        const n = parseFloat(ls[1]);
        if (n >= -2 && n <= 10) result.letterSpacing = `${n}${ls[2].toLowerCase()}`;
      }
    } else if (allowBlockProps) {
      if (prop === 'text-align') {
        const ta = rawVal.toLowerCase();
        if (ta === 'left' || ta === 'center' || ta === 'right' || ta === 'justify') {
          result.textAlign = ta;
        }
      } else if (prop === 'line-height') {
        const lh = parseFloat(rawVal);
        if (Number.isFinite(lh) && lh >= 1.0 && lh <= 3.0) {
          result.lineHeight = lh;
        }
      } else if (prop === 'margin-left') {
        const ml = sanitizePixelSpacing(rawVal, 200);
        if (ml) result.marginLeft = ml;
      } else if (prop === 'padding-left') {
        const pl = sanitizePixelSpacing(rawVal, 200);
        if (pl) result.paddingLeft = pl;
      } else if (prop === 'margin-top') {
        const mt = sanitizePixelSpacing(rawVal, 64);
        if (mt) result.marginTop = mt;
      } else if (prop === 'margin-bottom') {
        const mb = sanitizePixelSpacing(rawVal, 64);
        if (mb) result.marginBottom = mb;
      }
    }
  }

  return result;
}

function parseImageMeta(rawAlt: string) {
  let align: 'left' | 'center' | 'right' | 'full' = 'center';
  let wrap = true;
  const altParts = rawAlt.split('|');
  const altText = altParts[0].trim();

  for (let p = 1; p < altParts.length; p++) {
    const token = altParts[p].trim().toLowerCase();
    if (token.startsWith('align:')) {
      const val = token.replace('align:', '');
      if (val === 'left' || val === 'center' || val === 'right' || val === 'full') {
        align = val;
      }
    } else if (token.startsWith('wrap:')) {
      wrap = token.replace('wrap:', '') !== 'false';
    }
  }
  return { altText, align, wrap };
}

function renderInlineImageElement(rawAlt: string, rawUrl: string, key: string): React.ReactNode {
  const { altText, align, wrap } = parseImageMeta(rawAlt);
  const safeUrl = resolveMediaUrl(sanitizeUrl(rawUrl)) || sanitizeUrl(rawUrl);

  if (align === 'left' && wrap) {
    return (
      <span key={key} className="block sm:float-left sm:mr-6 mb-4 sm:w-[44%] clear-left">
        <img
          src={safeUrl}
          alt={altText}
          className="rounded-xl border border-slate-200 shadow-xs w-full object-cover"
        />
        {altText && (
          <span className="block text-[11px] text-slate-500 mt-1.5 text-center italic">{altText}</span>
        )}
      </span>
    );
  }
  if (align === 'right' && wrap) {
    return (
      <span key={key} className="block sm:float-right sm:ml-6 mb-4 sm:w-[44%] clear-right">
        <img
          src={safeUrl}
          alt={altText}
          className="rounded-xl border border-slate-200 shadow-xs w-full object-cover"
        />
        {altText && (
          <span className="block text-[11px] text-slate-500 mt-1.5 text-center italic">{altText}</span>
        )}
      </span>
    );
  }
  if (align === 'full') {
    return (
      <span key={key} className="block my-5 w-full clear-both">
        <img
          src={safeUrl}
          alt={altText}
          className="rounded-xl border border-slate-200 shadow-xs w-full object-cover max-h-[520px]"
        />
        {altText && (
          <span className="block text-xs text-slate-500 mt-2 text-center italic">{altText}</span>
        )}
      </span>
    );
  }
  const justifyClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
  return (
    <span key={key} className={`block my-5 max-w-xl ${justifyClass} clear-both`}>
      <img
        src={safeUrl}
        alt={altText}
        className="rounded-xl border border-slate-200 shadow-xs w-full object-cover max-h-[420px]"
      />
      {altText && (
        <span className="block text-xs text-slate-500 mt-2 text-center italic">{altText}</span>
      )}
    </span>
  );
}

// Parse rich inline Markdown + allowlisted MS Word-style tags (recursive, zero dangerouslySetInnerHTML)
function parseInlineMarkdown(text: string, depth = 0): React.ReactNode {
  if (!text || depth > 8) return text;

  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let tokenIdx = 0;

  const inlinePattern =
    /(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))|(`[^`]+`)|(\*\*[\s\S]+?\*\*)|(__[\s\S]+?__)|(~~[\s\S]+?~~)|(\*[^*\n]+\*)|(<span\s+style="[^"]*"\s*>[\s\S]*?<\/span>)|(<mark(?:\s+style="[^"]*")?\s*>[\s\S]*?<\/mark>)|(<u>[\s\S]*?<\/u>)|(<s>[\s\S]*?<\/s>)|(<sup>[\s\S]*?<\/sup>)|(<sub>[\s\S]*?<\/sub>)/i;

  while (remaining.length > 0) {
    const match = inlinePattern.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const token = match[0];
    const key = `t-${depth}-${tokenIdx++}`;

    if (token.startsWith('![')) {
      const imgMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        nodes.push(renderInlineImageElement(imgMatch[1], imgMatch[2], key));
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={sanitizeUrl(linkMatch[2])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-700 font-medium"
          >
            {parseInlineMarkdown(linkMatch[1], depth + 1)}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 font-mono text-[0.88em] border border-orange-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900">
          {parseInlineMarkdown(token.slice(2, -2), depth + 1)}
        </strong>
      );
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(
        <s key={key} className="line-through text-slate-500">
          {parseInlineMarkdown(token.slice(2, -2), depth + 1)}
        </s>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {parseInlineMarkdown(token.slice(1, -1), depth + 1)}
        </em>
      );
    } else if (/^<span\s+style=/i.test(token)) {
      const spanMatch = token.match(/^<span\s+style="([^"]*)"\s*>([\s\S]*)<\/span>$/i);
      if (spanMatch) {
        const safeStyle = sanitizeInlineStyle(spanMatch[1], false);
        nodes.push(
          <span key={key} style={safeStyle}>
            {parseInlineMarkdown(spanMatch[2], depth + 1)}
          </span>
        );
      } else {
        nodes.push(token);
      }
    } else if (/^<mark/i.test(token)) {
      const markMatch = token.match(/^<mark(?:\s+style="([^"]*)")?\s*>([\s\S]*)<\/mark>$/i);
      if (markMatch) {
        const parsedStyle = sanitizeInlineStyle(markMatch[1] || '', false);
        const safeStyle: React.CSSProperties = {
          backgroundColor: parsedStyle.backgroundColor || '#fef08a',
          color: parsedStyle.color,
          padding: '0.05em 0.25em',
          borderRadius: '0.25rem',
        };
        nodes.push(
          <mark key={key} style={safeStyle}>
            {parseInlineMarkdown(markMatch[2], depth + 1)}
          </mark>
        );
      } else {
        nodes.push(token);
      }
    } else if (/^<u>/i.test(token)) {
      nodes.push(
        <u key={key} className="underline underline-offset-2 decoration-1">
          {parseInlineMarkdown(token.slice(3, -4), depth + 1)}
        </u>
      );
    } else if (/^<s>/i.test(token)) {
      nodes.push(
        <s key={key} className="line-through">
          {parseInlineMarkdown(token.slice(3, -4), depth + 1)}
        </s>
      );
    } else if (/^<sup>/i.test(token)) {
      nodes.push(
        <sup key={key} className="text-[0.72em] align-super">
          {parseInlineMarkdown(token.slice(5, -6), depth + 1)}
        </sup>
      );
    } else if (/^<sub>/i.test(token)) {
      nodes.push(
        <sub key={key} className="text-[0.72em] align-sub">
          {parseInlineMarkdown(token.slice(5, -6), depth + 1)}
        </sub>
      );
    } else {
      nodes.push(token);
    }

    remaining = remaining.slice(match.index + token.length);
  }

  return nodes;
}

// Render Blog Studio Markdown + MS Word-style Font & Paragraph blocks cleanly
export function renderBlogStudioMarkdown(markdownText: string, depth = 0): React.ReactNode {
  if (!markdownText || !markdownText.trim()) {
    if (depth > 0) return null;
    return (
      <div className="text-slate-400 italic py-12 text-center">
        Start writing your academic guide or choose a template above to see a live preview here.
      </div>
    );
  }

  const lines = markdownText.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Styled Paragraph / Div wrapper: <div style="...">...</div> or <p style="...">...</p>
    const singleLineBlockMatch = trimmed.match(/^<(div|p)\s+style="([^"]*)"\s*>([\s\S]*)<\/\1>$/i);
    if (singleLineBlockMatch) {
      const tagName = singleLineBlockMatch[1].toLowerCase();
      const safeStyle = sanitizeInlineStyle(singleLineBlockMatch[2], true);
      const innerContent = singleLineBlockMatch[3];
      if (tagName === 'p') {
        elements.push(
          <p
            key={`sp-${depth}-${i}`}
            style={safeStyle}
            className="text-slate-700 leading-relaxed mb-4 text-[15px]"
          >
            {parseInlineMarkdown(innerContent)}
          </p>
        );
      } else {
        elements.push(
          <div key={`sd-${depth}-${i}`} style={safeStyle} className="mb-4">
            {depth < 4 ? renderBlogStudioMarkdown(innerContent, depth + 1) : parseInlineMarkdown(innerContent)}
          </div>
        );
      }
      i++;
      continue;
    }

    const openBlockMatch = trimmed.match(/^<(div|p)\s+style="([^"]*)"\s*>$/i);
    if (openBlockMatch) {
      const tagName = openBlockMatch[1].toLowerCase();
      const closePattern = new RegExp(`^</${tagName}>$`, 'i');
      const safeStyle = sanitizeInlineStyle(openBlockMatch[2], true);
      const innerLines: string[] = [];
      let nestLevel = 1;
      i++;
      while (i < lines.length && nestLevel > 0) {
        const curTrim = lines[i].trim();
        if (new RegExp(`^<${tagName}\\s+style="[^"]*"\\s*>$`, 'i').test(curTrim)) {
          nestLevel++;
          innerLines.push(lines[i]);
        } else if (closePattern.test(curTrim)) {
          nestLevel--;
          if (nestLevel > 0) innerLines.push(lines[i]);
        } else {
          innerLines.push(lines[i]);
        }
        i++;
      }
      const innerText = innerLines.join('\n').trim();
      if (tagName === 'p') {
        elements.push(
          <p
            key={`mp-${depth}-${i}`}
            style={safeStyle}
            className="text-slate-700 leading-relaxed mb-4 text-[15px]"
          >
            {parseInlineMarkdown(innerText)}
          </p>
        );
      } else {
        elements.push(
          <div key={`md-${depth}-${i}`} style={safeStyle} className="mb-4">
            {depth < 4 ? renderBlogStudioMarkdown(innerText, depth + 1) : parseInlineMarkdown(innerText)}
          </div>
        );
      }
      continue;
    }

    // Fenced code blocks
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre
          key={`code-${depth}-${i}`}
          className="my-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed clear-both"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${depth}-${i}`} className="my-6 border-slate-200 clear-both" />);
      i++;
      continue;
    }

    // Headings H1 - H4
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${depth}-${i}`}
          className="text-base font-bold text-slate-900 mt-5 mb-2 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${depth}-${i}`}
          className="text-lg font-bold text-slate-900 mt-6 mb-2.5 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${depth}-${i}`}
          className="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-100 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${depth}-${i}`}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight leading-tight"
        >
          {parseInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Standalone image block ![alt|align:...|wrap:...](url)
    const imgBlock = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgBlock) {
      const { altText, align, wrap } = parseImageMeta(imgBlock[1]);
      const safeUrl = resolveMediaUrl(sanitizeUrl(imgBlock[2])) || sanitizeUrl(imgBlock[2]);

      if (align === 'left' && wrap) {
        elements.push(
          <figure key={`img-${depth}-${i}`} className="sm:float-left sm:mr-6 mb-4 sm:w-[44%] clear-left">
            <img
              src={safeUrl}
              alt={altText}
              className="rounded-xl border border-slate-200 shadow-xs w-full object-cover"
            />
            {altText && (
              <figcaption className="text-[11px] text-slate-500 mt-1.5 text-center italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      } else if (align === 'right' && wrap) {
        elements.push(
          <figure key={`img-${depth}-${i}`} className="sm:float-right sm:ml-6 mb-4 sm:w-[44%] clear-right">
            <img
              src={safeUrl}
              alt={altText}
              className="rounded-xl border border-slate-200 shadow-xs w-full object-cover"
            />
            {altText && (
              <figcaption className="text-[11px] text-slate-500 mt-1.5 text-center italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      } else if (align === 'full') {
        elements.push(
          <figure key={`img-${depth}-${i}`} className="my-6 w-full clear-both">
            <img
              src={safeUrl}
              alt={altText}
              className="rounded-xl border border-slate-200 shadow-xs w-full object-cover max-h-[520px]"
            />
            {altText && (
              <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      } else {
        const alignClass =
          align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
        elements.push(
          <figure key={`img-${depth}-${i}`} className={`my-6 max-w-xl ${alignClass} clear-both`}>
            <img
              src={safeUrl}
              alt={altText}
              className="rounded-xl border border-slate-200 shadow-xs w-full object-cover max-h-[420px]"
            />
            {altText && (
              <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      }
      i++;
      continue;
    }

    // Blockquotes & Academic Callout Boxes (> [!NOTE] / > [!TIP] / > [!IMPORTANT])
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      const firstLine = quoteLines[0] || '';
      const calloutMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]\s*(.*)$/i);
      if (calloutMatch) {
        const kind = calloutMatch[1].toUpperCase();
        const headingText = calloutMatch[2].trim();
        const bodyLines = quoteLines.slice(1).join(' ').trim();
        const styleMap: Record<string, { box: string; badge: string; label: string }> = {
          NOTE: {
            box: 'bg-blue-50/70 border-blue-200 text-slate-800',
            badge: 'text-blue-700',
            label: 'Academic Note',
          },
          TIP: {
            box: 'bg-emerald-50/70 border-emerald-200 text-slate-800',
            badge: 'text-emerald-700',
            label: 'Study Tip',
          },
          IMPORTANT: {
            box: 'bg-orange-50/80 border-orange-200 text-slate-800',
            badge: 'text-orange-700',
            label: 'Key Takeaway',
          },
          WARNING: {
            box: 'bg-amber-50/80 border-amber-200 text-slate-800',
            badge: 'text-amber-800',
            label: 'Important Reminder',
          },
        };
        const cfg = styleMap[kind] || styleMap.NOTE;
        elements.push(
          <div
            key={`callout-${depth}-${i}`}
            className={`my-5 p-4 rounded-xl border ${cfg.box} text-sm leading-relaxed`}
          >
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${cfg.badge}`}>
              {headingText || cfg.label}
            </div>
            {bodyLines && <div>{parseInlineMarkdown(bodyLines)}</div>}
          </div>
        );
      } else {
        elements.push(
          <blockquote
            key={`quote-${depth}-${i}`}
            className="my-5 pl-4 border-l-4 border-orange-500 bg-orange-50/50 py-3 pr-4 rounded-r-xl text-slate-700 italic text-sm leading-relaxed"
          >
            {parseInlineMarkdown(quoteLines.join(' '))}
          </blockquote>
        );
      }
      continue;
    }

    // Unordered Lists
    if (/^(\*|-)\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\*|-)\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${depth}-${i}`} className="my-4 pl-6 list-disc space-y-2 text-slate-700 text-[15px]">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered Lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${depth}-${i}`} className="my-4 pl-6 list-decimal space-y-2 text-slate-700 text-[15px]">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('```') &&
      !/^(\*|-)\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^!\[[^\]]*\]\([^)]+\)$/.test(lines[i].trim()) &&
      !/^<(div|p)\s+style="[^"]*"\s*>/i.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    elements.push(
      <p key={`p-${depth}-${i}`} className="text-slate-700 leading-relaxed mb-4 text-[15px]">
        {parseInlineMarkdown(paraLines.join(' '))}
      </p>
    );
  }

  return (
    <div className="flow-root">
      {elements}
      <div className="clear-both" />
    </div>
  );
}
