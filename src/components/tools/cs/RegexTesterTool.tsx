import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';
import { CS_TOOLS_BY_SLUG } from '../../../data/csToolsRegistry';

interface RegexPreset {
  id: string;
  label: string;
  pattern: string;
  flags: string;
  sampleText: string;
}

const REGEX_PRESETS: RegexPreset[] = [
  {
    id: 'email',
    label: 'Email Address',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: 'g',
    sampleText:
      'Contact admissions@university-tutors.com, cs.lab_01@mit.edu, or invalid-email@localhost and student+2026@ox.ac.uk.',
  },
  {
    id: 'ipv4',
    label: 'IPv4 Address',
    pattern: '\\b((?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\b',
    flags: 'g',
    sampleText:
      'Router gateway 192.168.1.1 routed packet from 10.0.42.19 to DNS 8.8.8.8 (invalid: 999.10.0.1 and 256.0.0.5).',
  },
  {
    id: 'date',
    label: 'ISO Date',
    pattern: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sampleText:
      'Assignment deadlines: 2026-09-15 (Algorithms), 2026-10-31 (Operating Systems), invalid 2026-13-45, final 2026-12-08.',
  },
  {
    id: 'url',
    label: 'HTTP / HTTPS URL',
    pattern: '(https?)://([a-zA-Z0-9.-]+)(:[0-9]+)?(/[^\\s]*)?',
    flags: 'gi',
    sampleText:
      'Docs: https://university-tutors.com/tools/computer-science and local http://localhost:3000/api/v1/health?ok=1',
  },
  {
    id: 'password',
    label: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$',
    flags: 'gm',
    sampleText: 'weakpass\nNoDigitsHere!\nCsLab#2026\nStr0ng@Pass99\nshort1A!',
  },
];

interface RegexMatchItem {
  index: number;
  end: number;
  fullMatch: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
}

interface RegexTokenExplanation {
  token: string;
  meaning: string;
  kind: 'anchor' | 'class' | 'group' | 'quantifier' | 'operator' | 'literal';
}

function explainRegexTokens(pattern: string): RegexTokenExplanation[] {
  const out: RegexTokenExplanation[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escaped token
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const seq = `\\${next}`;
      const escapeMap: Record<string, { meaning: string; kind: RegexTokenExplanation['kind'] }> = {
        d: { meaning: 'Matches any ASCII digit (0–9)', kind: 'class' },
        D: { meaning: 'Matches any non-digit character', kind: 'class' },
        w: { meaning: 'Matches any word character (letter, digit, or underscore)', kind: 'class' },
        W: { meaning: 'Matches any non-word character', kind: 'class' },
        s: { meaning: 'Matches any whitespace character (space, tab, newline)', kind: 'class' },
        S: { meaning: 'Matches any non-whitespace character', kind: 'class' },
        b: { meaning: 'Asserts a word boundary position (consumes 0 chars)', kind: 'anchor' },
        B: { meaning: 'Asserts a non-word boundary position', kind: 'anchor' },
        n: { meaning: 'Matches a newline (LF) character', kind: 'literal' },
        t: { meaning: 'Matches a horizontal tab character', kind: 'literal' },
        r: { meaning: 'Matches a carriage return character', kind: 'literal' },
      };

      if (escapeMap[next]) {
        out.push({ token: seq, ...escapeMap[next] });
      } else if (/[1-9]/.test(next)) {
        out.push({
          token: seq,
          meaning: `Backreference matching the exact text captured by group #${next}`,
          kind: 'group',
        });
      } else {
        out.push({
          token: seq,
          meaning: `Matches the literal character "${next}"`,
          kind: 'literal',
        });
      }
      i += 2;
      continue;
    }

    // Character set [...]
    if (ch === '[') {
      let j = i + 1;
      if (j < pattern.length && pattern[j] === '^') j++;
      if (j < pattern.length && pattern[j] === ']') j++;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\' && j + 1 < pattern.length) j += 2;
        else j++;
      }
      const raw = pattern.slice(i, Math.min(j + 1, pattern.length));
      const negated = raw.startsWith('[^');
      const inner = raw.slice(negated ? 2 : 1, raw.endsWith(']') ? -1 : undefined);
      out.push({
        token: raw,
        meaning: negated
          ? `Negated character set: matches any single character NOT in "${inner}"`
          : `Character set: matches any single character from "${inner}"`,
        kind: 'class',
      });
      i = j + 1;
      continue;
    }

    // Groups & Lookarounds
    if (ch === '(') {
      if (pattern.startsWith('(?:', i)) {
        out.push({ token: '(?:', meaning: 'Starts a non-capturing group', kind: 'group' });
        i += 3;
      } else if (pattern.startsWith('(?=', i)) {
        out.push({ token: '(?=', meaning: 'Starts a positive lookahead assertion', kind: 'group' });
        i += 3;
      } else if (pattern.startsWith('(?!', i)) {
        out.push({ token: '(?!', meaning: 'Starts a negative lookahead assertion', kind: 'group' });
        i += 3;
      } else if (pattern.startsWith('(?<=', i)) {
        out.push({ token: '(?<=', meaning: 'Starts a positive lookbehind assertion', kind: 'group' });
        i += 4;
      } else if (pattern.startsWith('(?<!', i)) {
        out.push({ token: '(?<!', meaning: 'Starts a negative lookbehind assertion', kind: 'group' });
        i += 4;
      } else if (pattern.startsWith('(?<', i)) {
        const endName = pattern.indexOf('>', i + 3);
        if (endName !== -1) {
          const name = pattern.slice(i + 3, endName);
          out.push({
            token: pattern.slice(i, endName + 1),
            meaning: `Starts a named capturing group "${name}"`,
            kind: 'group',
          });
          i = endName + 1;
        } else {
          out.push({ token: '(', meaning: 'Starts a capturing group', kind: 'group' });
          i++;
        }
      } else {
        out.push({ token: '(', meaning: 'Starts a numbered capturing group', kind: 'group' });
        i++;
      }
      continue;
    }

    if (ch === ')') {
      out.push({ token: ')', meaning: 'Closes the current group or assertion', kind: 'group' });
      i++;
      continue;
    }

    // Anchors & alternation & dot
    if (ch === '^') {
      out.push({ token: '^', meaning: 'Asserts start of string (or start of line with m flag)', kind: 'anchor' });
      i++;
      continue;
    }
    if (ch === '$') {
      out.push({ token: '$', meaning: 'Asserts end of string (or end of line with m flag)', kind: 'anchor' });
      i++;
      continue;
    }
    if (ch === '.') {
      out.push({ token: '.', meaning: 'Matches any character except line breaks (includes \\n with s flag)', kind: 'class' });
      i++;
      continue;
    }
    if (ch === '|') {
      out.push({ token: '|', meaning: 'Alternation (OR): matches either the branch before or after', kind: 'operator' });
      i++;
      continue;
    }

    // Quantifiers *, +, ?, {n,m}
    if (ch === '*' || ch === '+' || ch === '?') {
      const lazy = pattern[i + 1] === '?';
      const tok = lazy ? `${ch}?` : ch;
      const baseDesc =
        ch === '*'
          ? '0 or more times'
          : ch === '+'
          ? '1 or more times'
          : '0 or 1 time (optional)';
      out.push({
        token: tok,
        meaning: `Quantifier: repeats previous token ${baseDesc} (${lazy ? 'lazy / as few as possible' : 'greedy / as many as possible'})`,
        kind: 'quantifier',
      });
      i += lazy ? 2 : 1;
      continue;
    }

    if (ch === '{') {
      const match = pattern.slice(i).match(/^\{(\d+)(?:,(\d*))?\}(\?)?/);
      if (match) {
        const [full, min, max, lazy] = match;
        let desc = '';
        if (max === undefined) desc = `exactly ${min} time${min === '1' ? '' : 's'}`;
        else if (max === '') desc = `${min} or more times`;
        else desc = `between ${min} and ${max} times`;
        out.push({
          token: full,
          meaning: `Quantifier: repeats previous token ${desc}${lazy ? ' (lazy)' : ''}`,
          kind: 'quantifier',
        });
        i += full.length;
        continue;
      }
    }

    // Merge consecutive plain literal characters
    let lit = ch;
    let j = i + 1;
    while (j < pattern.length && !'\\[]()^$.|*+?{'.includes(pattern[j])) {
      // Stop before a character followed directly by a quantifier so the quantifier explanation makes sense
      if (j + 1 < pattern.length && '*+?{'.includes(pattern[j + 1])) break;
      lit += pattern[j];
      j++;
    }
    out.push({
      token: lit,
      meaning: `Matches the literal sequence "${lit}"`,
      kind: 'literal',
    });
    i = j;
  }

  return out;
}

const FLAG_META: { flag: 'g' | 'i' | 'm' | 's'; name: string; desc: string }[] = [
  { flag: 'g', name: 'Global', desc: 'Find all matches instead of stopping at first' },
  { flag: 'i', name: 'Ignore Case', desc: 'Case-insensitive matching' },
  { flag: 'm', name: 'Multiline', desc: '^ and $ match start/end of every line' },
  { flag: 's', name: 'DotAll', desc: 'Dot (.) also matches newline characters' },
];

export default function RegexTesterTool() {
  const toolMeta = CS_TOOLS_BY_SLUG['regex-tester'];
  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState<Record<'g' | 'i' | 'm' | 's', boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
  });
  const [testText, setTestText] = useState(REGEX_PRESETS[0].sampleText);

  const flagString = (['g', 'i', 'm', 's'] as const)
    .filter((f) => flags[f])
    .join('');

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as RegexMatchItem[], error: null as string | null };
    try {
      const re = new RegExp(pattern, flagString);
      const found: RegexMatchItem[] = [];
      if (flags.g) {
        let m: RegExpExecArray | null;
        let guard = 0;
        while ((m = re.exec(testText)) !== null && guard < 1000) {
          guard++;
          found.push({
            index: m.index,
            end: m.index + m[0].length,
            fullMatch: m[0],
            groups: m.slice(1),
            namedGroups: m.groups ? { ...m.groups } : {},
          });
          if (m[0].length === 0) {
            re.lastIndex++;
          }
        }
      } else {
        const m = re.exec(testText);
        if (m) {
          found.push({
            index: m.index,
            end: m.index + m[0].length,
            fullMatch: m[0],
            groups: m.slice(1),
            namedGroups: m.groups ? { ...m.groups } : {},
          });
        }
      }
      return { matches: found, error: null as string | null };
    } catch (err) {
      return {
        matches: [] as RegexMatchItem[],
        error: err instanceof Error ? err.message : 'Invalid regular expression syntax.',
      };
    }
  }, [pattern, flagString, flags.g, testText]);

  const highlightedSegments = useMemo(() => {
    if (!testText) return [];
    if (error || matches.length === 0) {
      return [{ text: testText, isMatch: false, matchIdx: -1 }];
    }
    const segs: { text: string; isMatch: boolean; matchIdx: number }[] = [];
    let cursor = 0;
    matches.forEach((m, idx) => {
      if (m.index > cursor) {
        segs.push({ text: testText.slice(cursor, m.index), isMatch: false, matchIdx: -1 });
      }
      if (m.end >= m.index) {
        segs.push({
          text: testText.slice(m.index, m.end) || '∅',
          isMatch: true,
          matchIdx: idx,
        });
        cursor = Math.max(cursor, m.end);
      }
    });
    if (cursor < testText.length) {
      segs.push({ text: testText.slice(cursor), isMatch: false, matchIdx: -1 });
    }
    return segs;
  }, [testText, matches, error]);

  const explanations = useMemo(() => explainRegexTokens(pattern), [pattern]);
  const maxGroups = useMemo(
    () => matches.reduce((max, m) => Math.max(max, m.groups.length), 0),
    [matches]
  );

  const loadPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setTestText(preset.sampleText);
    setFlags({
      g: preset.flags.includes('g'),
      i: preset.flags.includes('i'),
      m: preset.flags.includes('m'),
      s: preset.flags.includes('s'),
    });
  };

  const toggleFlag = (f: 'g' | 'i' | 'm' | 's') => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  };

  useEffect(() => {
    const onLoadPreset = (ev: Event) => {
      const detail = (ev as CustomEvent<{ slug?: string; presetIndex?: number }>).detail;
      if (!detail || detail.slug !== 'regex-tester') return;
      const preset = REGEX_PRESETS[detail.presetIndex ?? 0] ?? REGEX_PRESETS[0];
      loadPreset(preset);
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const handleCopyOutput = () => {
    const lines = [
      `Pattern: /${pattern}/${flagString}`,
      `Matches (${matches.length}):`,
      ...matches.map((m, idx) => {
        const grpText = m.groups.length
          ? ` | Groups: ${m.groups.map((g, gi) => `$${gi + 1}=${JSON.stringify(g ?? '')}`).join(', ')}`
          : '';
        return `  #${idx + 1} [${m.index}..${m.end}]: ${JSON.stringify(m.fullMatch)}${grpText}`;
      }),
    ];
    return lines.join('\n');
  };

  const kindColor: Record<RegexTokenExplanation['kind'], string> = {
    anchor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    class: 'text-orange-700 bg-orange-50 border-orange-200',
    group: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    quantifier: 'text-amber-800 bg-amber-50 border-amber-200',
    operator: 'text-rose-700 bg-rose-50 border-rose-200',
    literal: 'text-slate-700 bg-slate-100 border-slate-200',
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title={toolMeta.title}
        category={toolMeta.category}
        description={toolMeta.summary}
        onLoadSample={() => loadPreset(REGEX_PRESETS[0])}
        onCopyOutput={handleCopyOutput}
        copyLabel="Copy Matches"
        onClear={() => {
          setPattern('');
          setTestText('');
        }}
      />

      {/* Presets bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          CS Presets:
        </span>
        {REGEX_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => loadPreset(preset)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 text-slate-700 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Pattern + Flags Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-1.5">
          <label htmlFor="regex-pattern-input" className="block text-xs font-semibold text-slate-700">
            Regular Expression Pattern
          </label>
          <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 bg-white overflow-hidden">
            <span className="px-3 py-2.5 text-slate-400 font-mono text-base select-none bg-slate-50 border-r border-slate-200">
              /
            </span>
            <input
              id="regex-pattern-input"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern, e.g. \b\w+@\w+\.\w+\b"
              spellCheck={false}
              className="flex-1 px-3 py-2.5 font-mono text-sm text-slate-900 bg-transparent focus:outline-none"
            />
            <span className="px-3 py-2.5 text-orange-700 font-mono text-sm font-bold select-none bg-orange-50/70 border-l border-slate-200">
              /{flagString}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-1.5">
          <span className="block text-xs font-semibold text-slate-700">Regex Flags</span>
          <div className="grid grid-cols-4 gap-2">
            {FLAG_META.map((item) => {
              const active = flags[item.flag];
              return (
                <button
                  key={item.flag}
                  type="button"
                  title={`${item.name}: ${item.desc}`}
                  onClick={() => toggleFlag(item.flag)}
                  className={`py-2 px-2 rounded-xl border text-center transition-colors cursor-pointer ${
                    active
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300'
                  }`}
                >
                  <div className="font-mono text-sm font-bold">{item.flag}</div>
                  <div className={`text-[10px] truncate ${active ? 'text-orange-100' : 'text-slate-500'}`}>
                    {item.name.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Syntax Error or Match Status */}
      {error ? (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <CheckCircle2 className={`w-4 h-4 ${matches.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="tabular-nums">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
            </span>
            {maxGroups > 0 && (
              <span className="text-slate-500 font-normal">
                · {maxGroups} capturing {maxGroups === 1 ? 'group' : 'groups'}
              </span>
            )}
          </div>
          <span className="text-slate-500 font-mono">Engine: JS ECMAScript RegExp</span>
        </div>
      )}

      {/* Test String Editor & Live Highlight Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="regex-test-text" className="block text-xs font-semibold text-slate-700">
            Test Input String
          </label>
          <textarea
            id="regex-test-text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder="Paste sample text or log lines to test against your pattern..."
            className="w-full rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 p-3.5 font-mono text-sm text-slate-900 bg-white focus:outline-none resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Live Highlighted Matches</span>
            <span className="text-[11px] text-slate-500">Alternating highlights mark adjacent matches</span>
          </div>
          <div className="min-h-[178px] max-h-[260px] overflow-auto rounded-xl border border-slate-200 bg-[#FAF6F0] p-3.5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-800">
            {highlightedSegments.length === 0 ? (
              <span className="text-slate-400 italic">Enter test text to inspect matches...</span>
            ) : (
              highlightedSegments.map((seg, i) =>
                seg.isMatch ? (
                  <mark
                    key={i}
                    title={`Match #${seg.matchIdx + 1}`}
                    className={`rounded px-0.5 py-0.5 font-semibold border ${
                      seg.matchIdx % 2 === 0
                        ? 'bg-orange-200/90 text-orange-950 border-orange-400'
                        : 'bg-amber-200/90 text-amber-950 border-amber-400'
                    }`}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Output: Capture Group Table + Plain-English Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Match & Capture Group Table */}
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Match &amp; Capture Group Breakdown</h2>
          <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
            {matches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matches found for the current pattern and flags.
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    <th className="py-2.5 px-3 font-semibold">Range</th>
                    <th className="py-2.5 px-3 font-semibold">Full Match ($0)</th>
                    {Array.from({ length: maxGroups }).map((_, gi) => (
                      <th key={gi} className="py-2.5 px-3 font-semibold">
                        Group ${gi + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-orange-50/40">
                      <td className="py-2 px-3 text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="py-2 px-3 text-slate-500 tabular-nums whitespace-nowrap">
                        {m.index}–{m.end}
                      </td>
                      <td className="py-2 px-3 font-semibold text-orange-800 break-all">
                        {m.fullMatch || <span className="text-slate-400 italic">(empty)</span>}
                      </td>
                      {Array.from({ length: maxGroups }).map((_, gi) => (
                        <td key={gi} className="py-2 px-3 text-slate-700 break-all">
                          {m.groups[gi] !== undefined ? (
                            m.groups[gi]
                          ) : (
                            <span className="text-slate-400 italic">undefined</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Token-by-Token Plain-English Explainer */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
              <Info className="w-4 h-4 text-orange-600" />
              Plain-English Token Breakdown
            </h2>
            <span className="text-[11px] text-slate-500 tabular-nums">{explanations.length} tokens</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {explanations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Enter a regular expression above to inspect its token-by-token meaning.
              </div>
            ) : (
              explanations.map((item, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3">
                  <code
                    className={`px-2 py-0.5 rounded border font-mono text-xs font-bold shrink-0 max-w-[140px] truncate ${kindColor[item.kind]}`}
                    title={item.token}
                  >
                    {item.token}
                  </code>
                  <p className="text-xs text-slate-700 leading-relaxed">{item.meaning}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
