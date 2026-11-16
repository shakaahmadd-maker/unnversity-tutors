import React from 'react';

function sanitizeUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (/^(https?:\/\/|\/|blob:|data:image\/)/i.test(trimmed)) {
    return trimmed.replace(/"/g, '&quot;');
  }
  return '#';
}

// Shared Markdown renderer used by Blog Studio preview and public /blog/... pages
export function renderBlogStudioMarkdown(markdownText: string): React.ReactNode {
  if (!markdownText || !markdownText.trim()) {
    return (
      <p className="text-slate-400 italic">
        Your formatted article preview will appear here as you type...
      </p>
    );
  }

  const lines = markdownText.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const formatInline = (text: string): string => {
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Images with optional alignment & wrap syntax: ![alt|align:left|wrap:true](url)
    escaped = escaped.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, rawAlt, url) => {
      const parts = String(rawAlt).split('|');
      const cleanAlt = (parts[0] || 'Article illustration').replace(/"/g, '&quot;');
      const safeUrl = sanitizeUrl(url);
      let align = 'center';
      let wrap = false;

      parts.slice(1).forEach((meta) => {
        if (meta.startsWith('align:')) align = meta.replace('align:', '').trim();
        if (meta.startsWith('wrap:')) wrap = meta.replace('wrap:', '').trim() === 'true';
      });

      const captionHtml =
        cleanAlt !== 'Article illustration'
          ? `<figcaption class="px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100">${cleanAlt}</figcaption>`
          : '';

      if (align === 'left') {
        return wrap
          ? `<figure class="float-left mr-5 mb-3 mt-1 max-w-[46%] sm:max-w-[260px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover" />${captionHtml}</figure>`
          : `<figure class="mr-auto my-4 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs clear-both"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover" />${captionHtml}</figure>`;
      }

      if (align === 'right') {
        return wrap
          ? `<figure class="float-right ml-5 mb-3 mt-1 max-w-[46%] sm:max-w-[260px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover" />${captionHtml}</figure>`
          : `<figure class="ml-auto my-4 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs clear-both"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover" />${captionHtml}</figure>`;
      }

      if (align === 'full') {
        return `<figure class="w-full my-5 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs clear-both"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full max-h-96 object-cover" />${
          cleanAlt !== 'Article illustration'
            ? `<figcaption class="px-3.5 py-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-100 text-center">${cleanAlt}</figcaption>`
            : ''
        }</figure>`;
      }

      return `<figure class="mx-auto my-5 max-w-lg rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs clear-both"><img src="${safeUrl}" alt="${cleanAlt}" class="w-full max-h-80 object-cover" />${
        cleanAlt !== 'Article illustration'
          ? `<figcaption class="px-3.5 py-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-100 text-center">${cleanAlt}</figcaption>`
          : ''
      }</figure>`;
    });
    // Links [text](url)
    escaped = escaped.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, linkLabel, linkUrl) =>
        `<a href="${sanitizeUrl(linkUrl)}" target="_blank" rel="noreferrer" class="text-orange-600 underline decoration-orange-300 hover:text-orange-700 font-medium">${linkLabel}</a>`
    );
    // Bold **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    // Italic *text*
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Inline code `code`
    escaped = escaped.replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 font-mono text-xs border border-orange-100">$1</code>'
    );
    return escaped;
  };

  const flushList = (keyPrefix: string | number) => {
    if (listItems.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="list-disc pl-6 my-4 space-y-1.5 text-slate-700">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`${keyPrefix}-ol`} className="list-decimal pl-6 my-4 space-y-1.5 text-slate-700">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      flushList(index);
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <pre
            key={`code-${index}`}
            className="bg-slate-900 text-slate-100 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono leading-relaxed"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();

    if (trimmed === '---' || trimmed === '***') {
      flushList(index);
      elements.push(<hr key={`hr-${index}`} className="my-6 border-slate-200" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList(index);
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-2xl sm:text-3xl font-bold text-slate-900 mt-6 mb-3 tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }}
        />
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-xl font-bold text-slate-900 mt-6 mb-2.5 tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(3)) }}
        />
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg font-semibold text-slate-800 mt-5 mb-2"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(4)) }}
        />
      );
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushList(index);
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-orange-500 bg-orange-50/60 pl-4 py-2.5 pr-3 my-4 rounded-r-lg italic text-slate-700"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }}
        />
      );
      return;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (listType !== 'ul') {
        flushList(index);
        listType = 'ul';
      }
      listItems.push(trimmed.slice(2));
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList(index);
        listType = 'ol';
      }
      listItems.push(orderedMatch[1]);
      return;
    }

    flushList(index);

    if (trimmed === '') {
      return;
    }

    const formattedLine = formatInline(trimmed);
    if (formattedLine.startsWith('<figure class="float-')) {
      elements.push(
        <div
          key={`img-wrap-${index}`}
          className="text-slate-700 leading-relaxed my-3 text-[15px] clearfix flow-root"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
      return;
    }

    elements.push(
      <p
        key={`p-${index}`}
        className="text-slate-700 leading-relaxed my-3 text-[15px]"
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />
    );
  });

  flushList('end');
  return elements;
}
