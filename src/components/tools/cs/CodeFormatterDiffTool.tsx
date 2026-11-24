import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Code2,
  GitCompare,
  Minimize2,
  Wand2,
} from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';
import { CS_TOOLS_BY_SLUG } from '../../../data/csToolsRegistry';

type ToolMode = 'formatter' | 'diff';
type DataFormat = 'json' | 'xml' | 'yaml';

const SAMPLE_JSON = JSON.stringify(
  {
    course: 'CS304 - Distributed Systems',
    semester: 'Fall 2026',
    active: true,
    students: [
      { id: 101, name: 'Amina Patel', gpa: 3.92, track: 'Systems' },
      { id: 102, name: 'Liam Brooks', gpa: 3.68, track: 'AI' },
      { id: 103, name: 'Kenji Sato', gpa: 3.85, track: 'Security' },
    ],
  },
  null,
  2
);

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<university>
  <department code="CS">
    <course id="CS201">
      <title>Data Structures &amp; Algorithms</title>
      <credits>4</credits>
    </course>
    <course id="CS310">
      <title>Computer Networks</title>
      <credits>3</credits>
    </course>
  </department>
</university>`;

const SAMPLE_YAML = `course: CS304 - Distributed Systems
semester: Fall 2026
active: true
credits: 4
topics:
  - Raft Consensus
  - Vector Clocks
  - MapReduce
grading:
  labs: 40
  midterm: 25
  final: 35`;

const SAMPLE_DIFF_LEFT = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid;
    else right = mid;
  }
  return -1;
}`;

const SAMPLE_DIFF_RIGHT = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;

// --- JSON Helpers ---
function getJsonErrorDetails(input: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = input.slice(0, pos);
    const lines = before.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return `Line ${line}, Column ${col}: ${msg}`;
  }
  return msg;
}

// --- XML Helpers ---
function formatXmlString(xml: string, indentStr: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent?.trim() || 'Malformed XML document.');
  }

  const normalized = xml
    .replace(/>\s+</g, '><')
    .replace(/(>)(<)(\/*)/g, '$1\n$2$3');

  let depth = 0;
  const out: string[] = [];
  for (const rawLine of normalized.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^<\/[^>]+>/.test(line)) {
      depth = Math.max(0, depth - 1);
    }
    out.push(`${indentStr.repeat(depth)}${line}`);
    if (
      /^<[^!?/][^>]*[^/]>$/.test(line) &&
      !line.includes('</')
    ) {
      depth++;
    }
  }
  return out.join('\n');
}

function xmlNodeToJson(node: Element): unknown {
  const obj: Record<string, unknown> = {};
  if (node.attributes.length > 0) {
    for (const attr of Array.from(node.attributes)) {
      obj[`@${attr.name}`] = attr.value;
    }
  }
  const childElements = Array.from(node.children);
  if (childElements.length === 0) {
    const text = (node.textContent || '').trim();
    if (Object.keys(obj).length === 0) return text;
    if (text) obj['#text'] = text;
    return obj;
  }
  for (const child of childElements) {
    const val = xmlNodeToJson(child);
    if (child.tagName in obj) {
      const prev = obj[child.tagName];
      obj[child.tagName] = Array.isArray(prev) ? [...prev, val] : [prev, val];
    } else {
      obj[child.tagName] = val;
    }
  }
  return obj;
}

// --- Pure-TS YAML Parser & Serializer (supports mappings, nested objects, arrays, primitives) ---
function parseScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === '' || v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseSimpleYaml(text: string): unknown {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  interface Entry {
    lineNum: number;
    indent: number;
    content: string;
  }
  const entries: Entry[] = [];
  rawLines.forEach((line, idx) => {
    const stripped = line.replace(/\s+#.*$/, '');
    if (!stripped.trim() || stripped.trim().startsWith('#')) return;
    if (stripped.includes('\t')) {
      throw new Error(`Line ${idx + 1}: YAML indentation must use spaces, not tabs.`);
    }
    const indent = stripped.search(/\S/);
    entries.push({ lineNum: idx + 1, indent, content: stripped.trim() });
  });

  if (entries.length === 0) return {};

  let cursor = 0;

  function parseBlock(expectedIndent: number): unknown {
    if (cursor >= entries.length) return null;
    const isArray = entries[cursor].content.startsWith('-');

    if (isArray) {
      const arr: unknown[] = [];
      while (cursor < entries.length && entries[cursor].indent === expectedIndent && entries[cursor].content.startsWith('-')) {
        const entry = entries[cursor];
        const rest = entry.content.slice(1).trim();
        cursor++;
        if (!rest) {
          if (cursor < entries.length && entries[cursor].indent > expectedIndent) {
            arr.push(parseBlock(entries[cursor].indent));
          } else {
            arr.push(null);
          }
        } else if (rest.includes(':')) {
          const colonIdx = rest.indexOf(':');
          const key = rest.slice(0, colonIdx).trim();
          const valPart = rest.slice(colonIdx + 1).trim();
          const itemObj: Record<string, unknown> = {};
          itemObj[key] = valPart ? parseScalar(valPart) : null;
          while (cursor < entries.length && entries[cursor].indent > expectedIndent) {
            const sub = entries[cursor];
            const subColon = sub.content.indexOf(':');
            if (subColon === -1) {
              throw new Error(`Line ${sub.lineNum}: Expected "key: value" inside list object.`);
            }
            const sk = sub.content.slice(0, subColon).trim();
            const sv = sub.content.slice(subColon + 1).trim();
            cursor++;
            if (sv) {
              itemObj[sk] = parseScalar(sv);
            } else if (cursor < entries.length && entries[cursor].indent > sub.indent) {
              itemObj[sk] = parseBlock(entries[cursor].indent);
            } else {
              itemObj[sk] = null;
            }
          }
          arr.push(itemObj);
        } else {
          arr.push(parseScalar(rest));
        }
      }
      return arr;
    }

    const obj: Record<string, unknown> = {};
    while (cursor < entries.length && entries[cursor].indent === expectedIndent) {
      const entry = entries[cursor];
      if (entry.content.startsWith('-')) break;
      const colonIdx = entry.content.indexOf(':');
      if (colonIdx === -1) {
        throw new Error(`Line ${entry.lineNum}: Invalid YAML syntax — missing ":" separator.`);
      }
      const key = entry.content.slice(0, colonIdx).trim();
      const valPart = entry.content.slice(colonIdx + 1).trim();
      cursor++;
      if (valPart) {
        obj[key] = parseScalar(valPart);
      } else if (cursor < entries.length && entries[cursor].indent > expectedIndent) {
        obj[key] = parseBlock(entries[cursor].indent);
      } else {
        obj[key] = null;
      }
    }
    return obj;
  }

  return parseBlock(entries[0].indent);
}

function toYamlString(value: unknown, indent = 0): string {
  const pad = ' '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (/[:#\n"']|^\s|\s$/.test(value) || value === '' || value === 'true' || value === 'false') {
      return JSON.stringify(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const entries = Object.entries(item as Record<string, unknown>);
          if (entries.length === 0) return `${pad}- {}`;
          const [firstK, firstV] = entries[0];
          const firstLine = `${pad}- ${firstK}: ${
            firstV && typeof firstV === 'object' ? '\n' + toYamlString(firstV, indent + 4) : toYamlString(firstV, indent + 4)
          }`;
          const restLines = entries.slice(1).map(([k, v]) => {
            if (v && typeof v === 'object') {
              return `${pad}  ${k}:\n${toYamlString(v, indent + 4)}`;
            }
            return `${pad}  ${k}: ${toYamlString(v, indent + 4)}`;
          });
          return [firstLine, ...restLines].join('\n');
        }
        return `${pad}- ${toYamlString(item, indent + 2)}`;
      })
      .join('\n');
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return '{}';
  return entries
    .map(([k, v]) => {
      if (v && typeof v === 'object') {
        const child = toYamlString(v, indent + 2);
        return child === '[]' || child === '{}' ? `${pad}${k}: ${child}` : `${pad}${k}:\n${child}`;
      }
      return `${pad}${k}: ${toYamlString(v, indent + 2)}`;
    })
    .join('\n');
}

function jsonToCsv(data: unknown): string {
  let rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    rows = data.map((item) =>
      item && typeof item === 'object' && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : { value: item }
    );
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const arrayProp = Object.values(obj).find((v) => Array.isArray(v) && v.length > 0);
    if (Array.isArray(arrayProp)) {
      rows = arrayProp.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : { value: item }
      );
    } else {
      rows = [obj];
    }
  } else {
    throw new Error('JSON must be an object or array of objects to convert to CSV.');
  }

  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escapeCsv = (val: unknown) => {
    const str = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(',')),
  ].join('\n');
}

// --- Pure-TS LCS Line Diff Engine ---
interface DiffRow {
  type: 'equal' | 'added' | 'removed';
  leftNum: number | null;
  rightNum: number | null;
  leftText: string;
  rightText: string;
}

function computeLineDiff(leftStr: string, rightStr: string, ignoreWhitespace: boolean): DiffRow[] {
  const a = leftStr.replace(/\r\n/g, '\n').split('\n');
  const b = rightStr.replace(/\r\n/g, '\n').split('\n');
  const norm = (s: string) => (ignoreWhitespace ? s.trim().replace(/\s+/g, ' ') : s);

  const m = a.length;
  const n = b.length;
  // Cap DP matrix gracefully for huge files
  if (m * n > 250000) {
    const maxLen = Math.max(m, n);
    const rows: DiffRow[] = [];
    for (let i = 0; i < maxLen; i++) {
      const l = a[i];
      const r = b[i];
      if (l !== undefined && r !== undefined && norm(l) === norm(r)) {
        rows.push({ type: 'equal', leftNum: i + 1, rightNum: i + 1, leftText: l, rightText: r });
      } else {
        if (l !== undefined) rows.push({ type: 'removed', leftNum: i + 1, rightNum: null, leftText: l, rightText: '' });
        if (r !== undefined) rows.push({ type: 'added', leftNum: null, rightNum: i + 1, leftText: '', rightText: r });
      }
    }
    return rows;
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (norm(a[i]) === norm(b[j])) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (norm(a[i]) === norm(b[j])) {
      rows.push({ type: 'equal', leftNum: i + 1, rightNum: j + 1, leftText: a[i], rightText: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'removed', leftNum: i + 1, rightNum: null, leftText: a[i], rightText: '' });
      i++;
    } else {
      rows.push({ type: 'added', leftNum: null, rightNum: j + 1, leftText: '', rightText: b[j] });
      j++;
    }
  }
  while (i < m) {
    rows.push({ type: 'removed', leftNum: i + 1, rightNum: null, leftText: a[i], rightText: '' });
    i++;
  }
  while (j < n) {
    rows.push({ type: 'added', leftNum: null, rightNum: j + 1, leftText: '', rightText: b[j] });
    j++;
  }
  return rows;
}

export default function CodeFormatterDiffTool() {
  const toolMeta = CS_TOOLS_BY_SLUG['code-formatter-diff'];
  const [mode, setMode] = useState<ToolMode>('formatter');
  const [format, setFormat] = useState<DataFormat>('json');
  const [indentSize, setIndentSize] = useState<'2' | '4' | 'tab'>('2');
  const [inputCode, setInputCode] = useState(SAMPLE_JSON);
  const [outputCode, setOutputCode] = useState(SAMPLE_JSON);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string }>({
    ok: true,
    text: 'Valid JSON (formatted with 2 spaces)',
  });

  // Diff state
  const [leftDiff, setLeftDiff] = useState(SAMPLE_DIFF_LEFT);
  const [rightDiff, setRightDiff] = useState(SAMPLE_DIFF_RIGHT);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  useEffect(() => {
    const onLoadPreset = (ev: Event) => {
      const detail = (ev as CustomEvent<{ slug?: string; presetIndex?: number }>).detail;
      if (!detail || detail.slug !== 'code-formatter-diff') return;
      if (detail.presetIndex === 1) {
        setMode('diff');
        setLeftDiff(SAMPLE_DIFF_LEFT);
        setRightDiff(SAMPLE_DIFF_RIGHT);
        setIgnoreWhitespace(false);
      } else {
        setMode('formatter');
        setFormat('json');
        setInputCode(SAMPLE_JSON);
        setOutputCode(SAMPLE_JSON);
        setStatusMsg({ ok: true, text: 'Valid JSON (formatted with 2 spaces)' });
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const indentStr = indentSize === 'tab' ? '\t' : ' '.repeat(Number(indentSize));

  const switchFormat = (next: DataFormat) => {
    setFormat(next);
    const sample = next === 'json' ? SAMPLE_JSON : next === 'xml' ? SAMPLE_XML : SAMPLE_YAML;
    setInputCode(sample);
    setOutputCode(sample);
    setStatusMsg({ ok: true, text: `Loaded sample ${next.toUpperCase()} document.` });
  };

  const runFormat = (minify = false) => {
    try {
      if (format === 'json') {
        const parsed = JSON.parse(inputCode);
        const res = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indentStr);
        setOutputCode(res);
        setStatusMsg({
          ok: true,
          text: minify ? 'Valid JSON minified successfully.' : 'Valid JSON formatted cleanly.',
        });
      } else if (format === 'xml') {
        const formatted = formatXmlString(inputCode, indentStr);
        const res = minify ? formatted.replace(/>\s+</g, '><').replace(/\n/g, '') : formatted;
        setOutputCode(res);
        setStatusMsg({
          ok: true,
          text: minify ? 'Valid XML minified successfully.' : 'Valid XML pretty-printed cleanly.',
        });
      } else {
        const parsed = parseSimpleYaml(inputCode);
        const res = minify ? JSON.stringify(parsed) : toYamlString(parsed);
        setOutputCode(res);
        setStatusMsg({
          ok: true,
          text: minify ? 'YAML parsed and compacted to minified JSON.' : 'Valid YAML normalized cleanly.',
        });
      }
    } catch (err) {
      const detail =
        format === 'json'
          ? getJsonErrorDetails(inputCode, err)
          : err instanceof Error
          ? err.message
          : 'Syntax error detected.';
      setStatusMsg({ ok: false, text: detail });
    }
  };

  const runConvert = (target: 'yaml' | 'json' | 'csv') => {
    try {
      let data: unknown;
      if (format === 'json') {
        data = JSON.parse(inputCode);
      } else if (format === 'yaml') {
        data = parseSimpleYaml(inputCode);
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(inputCode, 'application/xml');
        const parseErr = doc.querySelector('parsererror');
        if (parseErr) throw new Error(parseErr.textContent?.trim() || 'Invalid XML');
        data = { [doc.documentElement.tagName]: xmlNodeToJson(doc.documentElement) };
      }

      if (target === 'yaml') {
        setOutputCode(toYamlString(data));
        setStatusMsg({ ok: true, text: `Converted ${format.toUpperCase()} → YAML.` });
      } else if (target === 'json') {
        setOutputCode(JSON.stringify(data, null, indentStr));
        setStatusMsg({ ok: true, text: `Converted ${format.toUpperCase()} → JSON.` });
      } else {
        setOutputCode(jsonToCsv(data));
        setStatusMsg({ ok: true, text: `Converted ${format.toUpperCase()} → CSV.` });
      }
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: format === 'json' ? getJsonErrorDetails(inputCode, err) : err instanceof Error ? err.message : 'Conversion failed.',
      });
    }
  };

  const diffRows = useMemo(
    () => computeLineDiff(leftDiff, rightDiff, ignoreWhitespace),
    [leftDiff, rightDiff, ignoreWhitespace]
  );

  const diffStats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    diffRows.forEach((r) => {
      if (r.type === 'added') added++;
      else if (r.type === 'removed') removed++;
      else unchanged++;
    });
    return { added, removed, unchanged };
  }, [diffRows]);

  const handleCopyOutput = () => {
    if (mode === 'formatter') return outputCode;
    return diffRows
      .map((r) => {
        if (r.type === 'added') return `+ ${r.rightText}`;
        if (r.type === 'removed') return `- ${r.leftText}`;
        return `  ${r.leftText}`;
      })
      .join('\n');
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title={toolMeta.title}
        category={toolMeta.category}
        description={toolMeta.summary}
        onLoadSample={() => {
          if (mode === 'formatter') switchFormat(format);
          else {
            setLeftDiff(SAMPLE_DIFF_LEFT);
            setRightDiff(SAMPLE_DIFF_RIGHT);
          }
        }}
        onCopyOutput={handleCopyOutput}
        copyLabel={mode === 'formatter' ? 'Copy Output' : 'Copy Unified Diff'}
        onClear={() => {
          if (mode === 'formatter') {
            setInputCode('');
            setOutputCode('');
          } else {
            setLeftDiff('');
            setRightDiff('');
          }
        }}
      />

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('formatter')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'formatter'
                ? 'bg-orange-600 text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Formatter, Validator &amp; Converter</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('diff')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'diff'
                ? 'bg-orange-600 text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Side-by-Side Diff Checker</span>
          </button>
        </div>

        {mode === 'formatter' && (
          <div className="flex flex-wrap items-center gap-2">
            {(['json', 'xml', 'yaml'] as DataFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => switchFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border cursor-pointer transition-colors ${
                  format === fmt
                    ? 'bg-orange-50 text-orange-700 border-orange-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {fmt}
              </button>
            ))}
            <select
              aria-label="Indentation"
              value={indentSize}
              onChange={(e) => setIndentSize(e.target.value as '2' | '4' | 'tab')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        )}
      </div>

      {mode === 'formatter' ? (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runFormat(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Format &amp; Validate</span>
            </button>
            <button
              type="button"
              onClick={() => runFormat(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
            <span className="text-slate-300 mx-1 hidden sm:inline">|</span>
            {format !== 'yaml' && (
              <button
                type="button"
                onClick={() => runConvert('yaml')}
                className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Convert → YAML
              </button>
            )}
            {format !== 'json' && (
              <button
                type="button"
                onClick={() => runConvert('json')}
                className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Convert → JSON
              </button>
            )}
            <button
              type="button"
              onClick={() => runConvert('csv')}
              className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Convert → CSV
            </button>
          </div>

          {/* Validation Banner */}
          <div
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-mono ${
              statusMsg.ok
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {statusMsg.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>

          {/* Input / Output Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="formatter-input" className="font-semibold text-slate-700">
                  Input ({format.toUpperCase()})
                </label>
                <span className="font-mono text-slate-500 tabular-nums">
                  {inputCode.split('\n').length} lines · {new Blob([inputCode]).size} B
                </span>
              </div>
              <textarea
                id="formatter-input"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 p-3.5 font-mono text-xs leading-relaxed text-slate-900 bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="formatter-output" className="font-semibold text-slate-700">
                  Formatted / Converted Output
                </label>
                <span className="font-mono text-slate-500 tabular-nums">
                  {outputCode.split('\n').length} lines · {new Blob([outputCode]).size} B
                </span>
              </div>
              <textarea
                id="formatter-output"
                value={outputCode}
                readOnly
                rows={14}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs leading-relaxed text-slate-900 bg-[#FAF6F0]/70 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Diff Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="text-emerald-700 font-bold tabular-nums">+{diffStats.added} added</span>
              <span className="text-red-700 font-bold tabular-nums">-{diffStats.removed} removed</span>
              <span className="text-slate-500 tabular-nums">{diffStats.unchanged} unchanged</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="accent-orange-600 rounded"
                />
                <span>Ignore Whitespace</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const tmp = leftDiff;
                  setLeftDiff(rightDiff);
                  setRightDiff(tmp);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            </div>
          </div>

          {/* Two Source Textareas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="diff-left" className="text-xs font-semibold text-slate-700">
                Original Code (Left)
              </label>
              <textarea
                id="diff-left"
                value={leftDiff}
                onChange={(e) => setLeftDiff(e.target.value)}
                rows={8}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-300 focus:border-orange-500 p-3 font-mono text-xs text-slate-900 bg-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="diff-right" className="text-xs font-semibold text-slate-700">
                Modified Code (Right)
              </label>
              <textarea
                id="diff-right"
                value={rightDiff}
                onChange={(e) => setRightDiff(e.target.value)}
                rows={8}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-300 focus:border-orange-500 p-3 font-mono text-xs text-slate-900 bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Side-by-Side LCS Diff Table */}
          <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 px-2 w-10 text-right border-r border-slate-200">L#</th>
                  <th className="py-2 px-3 w-1/2 border-r border-slate-200">Original</th>
                  <th className="py-2 px-2 w-10 text-right border-r border-slate-200">R#</th>
                  <th className="py-2 px-3 w-1/2">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diffRows.map((row, idx) => (
                  <tr key={idx}>
                    <td
                      className={`py-1.5 px-2 text-right select-none border-r border-slate-200 tabular-nums ${
                        row.type === 'removed' ? 'bg-red-100/70 text-red-700' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {row.leftNum ?? ''}
                    </td>
                    <td
                      className={`py-1.5 px-3 whitespace-pre-wrap break-all border-r border-slate-200 ${
                        row.type === 'removed'
                          ? 'bg-red-50 text-red-900'
                          : row.type === 'added'
                          ? 'bg-slate-50/50 text-slate-300'
                          : 'text-slate-800'
                      }`}
                    >
                      {row.type === 'removed' && <span className="font-bold text-red-600 mr-1.5">-</span>}
                      {row.leftText}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-right select-none border-r border-slate-200 tabular-nums ${
                        row.type === 'added' ? 'bg-emerald-100/70 text-emerald-700' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {row.rightNum ?? ''}
                    </td>
                    <td
                      className={`py-1.5 px-3 whitespace-pre-wrap break-all ${
                        row.type === 'added'
                          ? 'bg-emerald-50 text-emerald-900'
                          : row.type === 'removed'
                          ? 'bg-slate-50/50 text-slate-300'
                          : 'text-slate-800'
                      }`}
                    >
                      {row.type === 'added' && <span className="font-bold text-emerald-600 mr-1.5">+</span>}
                      {row.rightText}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
