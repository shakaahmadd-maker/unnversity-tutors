import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Cpu, Gauge, Layers, Sparkles } from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';
import { CS_TOOLS_BY_SLUG } from '../../../data/csToolsRegistry';

type ComplexityKey = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n^2)' | 'O(n^3)' | 'O(2^n)' | 'O(n!)';

interface CodePreset {
  id: string;
  label: string;
  language: 'JavaScript' | 'Python' | 'Java' | 'C++';
  expectedTime: ComplexityKey;
  code: string;
}

const CODE_PRESETS: CodePreset[] = [
  {
    id: 'o1',
    label: 'Hash Lookup · O(1)',
    language: 'JavaScript',
    expectedTime: 'O(1)',
    code: `function getStudentScore(map, studentId) {\n  // Direct hash table access — constant work regardless of n\n  return map.get(studentId) ?? null;\n}`,
  },
  {
    id: 'ologn',
    label: 'Binary Search · O(log n)',
    language: 'Python',
    expectedTime: 'O(log n)',
    code: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
  },
  {
    id: 'on',
    label: 'Linear Scan · O(n)',
    language: 'Java',
    expectedTime: 'O(n)',
    code: `int findMax(int[] nums) {\n    int best = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        if (nums[i] > best) best = nums[i];\n    }\n    return best;\n}`,
  },
  {
    id: 'onlogn',
    label: 'Merge Sort · O(n log n)',
    language: 'JavaScript',
    expectedTime: 'O(n log n)',
    code: `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right); // linear merge step\n}`,
  },
  {
    id: 'on2',
    label: 'Nested Pair Loop · O(n^2)',
    language: 'C++',
    expectedTime: 'O(n^2)',
    code: `int countPairs(const vector<int>& a, int target) {\n    int count = 0;\n    for (int i = 0; i < a.size(); i++) {\n        for (int j = i + 1; j < a.size(); j++) {\n            if (a[i] + a[j] == target) count++;\n        }\n    }\n    return count;\n}`,
  },
  {
    id: 'o2n',
    label: 'Naive Fibonacci · O(2^n)',
    language: 'Python',
    expectedTime: 'O(2^n)',
    code: `def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
  },
];

interface AnalysisResult {
  time: ComplexityKey;
  space: ComplexityKey;
  rating: string;
  reasons: string[];
}

function analyzeCodeComplexity(rawCode: string): AnalysisResult {
  const code = rawCode.trim();
  if (!code) {
    return {
      time: 'O(1)',
      space: 'O(1)',
      rating: 'Idle',
      reasons: ['Paste a loop or recursive function to estimate its asymptotic complexity.'],
    };
  }

  // Strip single-line and multi-line comments
  const cleaned = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/#.*$/gm, '');

  const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);
  const reasons: string[] = [];

  // Detect function name for recursion check
  const fnMatch =
    cleaned.match(/\bfunction\s+([a-zA-Z_]\w*)\s*\(/) ||
    cleaned.match(/\bdef\s+([a-zA-Z_]\w*)\s*\(/) ||
    cleaned.match(/\b(?:int|void|double|long|boolean|string|auto|vector<[^>]+>)\s+([a-zA-Z_]\w*)\s*\(/);
  const fnName = fnMatch ? fnMatch[1] : null;

  let selfCalls = 0;
  if (fnName) {
    const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
    const allMatches = cleaned.match(callRegex);
    selfCalls = allMatches ? Math.max(0, allMatches.length - 1) : 0;
  }

  // Detect logarithmic patterns (halving / doubling / binary search)
  const hasLogStep =
    /(\*=|\/=|>>=|<<=)\s*2\b/.test(cleaned) ||
    /\bmid\s*=/.test(cleaned) ||
    /\/\/\s*2\b|\/\s*2\b/.test(cleaned) ||
    /Math\.floor\([^)]*\/\s*2\)/.test(cleaned);

  // Detect built-in comparison sorts
  const hasBuiltInSort =
    /\.sort\s*\(|Arrays\.sort|Collections\.sort|std::sort|\bsorted\s*\(/.test(cleaned);

  // Estimate maximum loop nesting depth (supports both brace languages and Python indentation)
  let maxLoopDepth = 0;
  let hasAnyLoop = false;
  const isBraceBased = cleaned.includes('{') && cleaned.includes('}');

  if (isBraceBased) {
    let braceDepth = 0;
    const loopStack: number[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const isLoopHeader = /^(for|while)\s*\(/.test(trimmed) || /\.forEach\s*\(|\.map\s*\(|\.filter\s*\(/.test(trimmed);
      if (isLoopHeader) {
        hasAnyLoop = true;
        loopStack.push(braceDepth);
        maxLoopDepth = Math.max(maxLoopDepth, loopStack.length);
      }
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      braceDepth += opens - closes;
      while (loopStack.length > 0 && braceDepth <= loopStack[loopStack.length - 1] && closes > 0) {
        loopStack.pop();
      }
    }
  } else {
    // Indentation-based (Python)
    const loopIndents: number[] = [];
    for (const line of lines) {
      const indent = line.search(/\S/);
      const trimmed = line.trim();
      while (loopIndents.length > 0 && indent <= loopIndents[loopIndents.length - 1]) {
        loopIndents.pop();
      }
      if (/^(for|while)\b/.test(trimmed)) {
        hasAnyLoop = true;
        loopIndents.push(indent);
        maxLoopDepth = Math.max(maxLoopDepth, loopIndents.length);
      }
    }
  }

  let time: ComplexityKey = 'O(1)';
  let space: ComplexityKey = 'O(1)';

  // Space heuristics
  const has2DAlloc =
    /new\s+\w+\s*\[[^\]]+\]\s*\[[^\]]+\]/.test(cleaned) ||
    /Array\.from\([^)]*Array\.from/.test(cleaned) ||
    /\[\s*\[.*for\s+.*\]\s*for\s+/.test(cleaned);
  const has1DAlloc =
    /new\s+(Map|Set|Array|HashMap|HashSet|ArrayList|vector)/.test(cleaned) ||
    /\.slice\s*\(|=\s*\[\s*\]|=\s*\{\s*\}|\bdict\s*\(|\bset\s*\(|\blist\s*\(/.test(cleaned);

  if (has2DAlloc) {
    space = 'O(n^2)';
    reasons.push('Detected 2D matrix / nested table allocation → O(n^2) auxiliary space.');
  } else if (has1DAlloc) {
    space = 'O(n)';
    reasons.push('Detected dynamic linear collection/slice allocation → O(n) auxiliary space.');
  }

  // Time heuristics
  if (selfCalls >= 2) {
    if (hasLogStep && (cleaned.includes('merge') || cleaned.includes('.slice(') || hasAnyLoop)) {
      time = 'O(n log n)';
      space = space === 'O(1)' ? 'O(n)' : space;
      reasons.push(`Detected divide-and-conquer recursion (${selfCalls} recursive calls on halved inputs + linear combine) → O(n log n).`);
    } else if (hasAnyLoop) {
      time = 'O(n!)';
      space = space === 'O(1)' ? 'O(n)' : space;
      reasons.push('Detected recursive branching inside a loop (backtracking/permutations pattern) → O(n!).');
    } else {
      time = 'O(2^n)';
      space = space === 'O(1)' ? 'O(n)' : space;
      reasons.push(`Detected ${selfCalls} un-memoized recursive branches per call without halving input size → O(2^n).`);
    }
  } else if (selfCalls === 1) {
    if (hasLogStep) {
      time = 'O(log n)';
      space = space === 'O(1)' ? 'O(log n)' : space;
      reasons.push('Detected single recursive call halving the problem space each step → O(log n) time & stack space.');
    } else {
      time = 'O(n)';
      space = space === 'O(1)' ? 'O(n)' : space;
      reasons.push('Detected linear single-branch recursion → O(n) time and O(n) call-stack space.');
    }
  } else if (maxLoopDepth >= 3) {
    time = 'O(n^3)';
    reasons.push(`Detected ${maxLoopDepth} nested loops → O(n^3) polynomial complexity.`);
  } else if (maxLoopDepth === 2) {
    if (hasLogStep) {
      time = 'O(n log n)';
      reasons.push('Detected outer linear loop combined with logarithmic halving/doubling inner step → O(n log n).');
    } else {
      time = 'O(n^2)';
      reasons.push('Detected 2 nested iterative loops over input size n → O(n^2) quadratic time.');
    }
  } else if (maxLoopDepth === 1) {
    if (hasBuiltInSort) {
      time = 'O(n log n)';
      reasons.push('Detected built-in comparison sort alongside linear loop → dominated by O(n log n).');
    } else if (hasLogStep) {
      time = 'O(log n)';
      reasons.push('Detected single loop halving or doubling search range per iteration → O(log n).');
    } else {
      time = 'O(n)';
      reasons.push('Detected single iterative pass over input elements → O(n) linear time.');
    }
  } else if (hasBuiltInSort) {
    time = 'O(n log n)';
    reasons.push('Detected standard library comparison sort → O(n log n) time.');
  } else {
    time = 'O(1)';
    reasons.push('No loops, sorts, or recursive self-calls detected → O(1) constant time.');
  }

  if (space === 'O(1)') {
    reasons.push('Only fixed scalar variables detected → O(1) auxiliary space.');
  }

  const ratingMap: Record<ComplexityKey, string> = {
    'O(1)': 'Excellent (Constant)',
    'O(log n)': 'Excellent (Logarithmic)',
    'O(n)': 'Good (Linear)',
    'O(n log n)': 'Fair (Log-Linear)',
    'O(n^2)': 'Slow (Quadratic)',
    'O(n^3)': 'Very Slow (Cubic)',
    'O(2^n)': 'Intractable (Exponential)',
    'O(n!)': 'Intractable (Factorial)',
  };

  return { time, space, rating: ratingMap[time], reasons };
}

function formatOps(val: number): string {
  if (!Number.isFinite(val) || val > 1e18) return '> 10^18 (astronomical)';
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return Math.round(val).toLocaleString();
}

function estimateWallTime(ops: number): string {
  // Assumes ~10^8 simple operations/sec in high-level language
  if (!Number.isFinite(ops) || ops > 1e18) return 'Centuries+';
  const seconds = ops / 1e8;
  if (seconds < 1e-6) return '< 1 µs';
  if (seconds < 1e-3) return `${(seconds * 1e6).toFixed(1)} µs`;
  if (seconds < 1) return `${(seconds * 1e3).toFixed(2)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hrs`;
}

const CHART_NS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

export default function BigOCalculatorTool() {
  const toolMeta = CS_TOOLS_BY_SLUG['big-o-calculator'];
  const [code, setCode] = useState(CODE_PRESETS[3].code);
  const [language, setLanguage] = useState<'JavaScript' | 'Python' | 'Java' | 'C++'>('JavaScript');
  const [inputN, setInputN] = useState(1000);
  const [logScale, setLogScale] = useState(true);

  useEffect(() => {
    const onLoadPreset = (ev: Event) => {
      const detail = (ev as CustomEvent<{ slug?: string; presetIndex?: number }>).detail;
      if (!detail || detail.slug !== 'big-o-calculator') return;
      const preset = CODE_PRESETS[detail.presetIndex ?? 4] ?? CODE_PRESETS[3];
      setCode(preset.code);
      setLanguage(preset.language);
      setInputN(10000);
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const analysis = useMemo(() => analyzeCodeComplexity(code), [code]);

  const chartData = useMemo(() => {
    return CHART_NS.map((n) => {
      const log2n = Math.log2(n);
      return {
        n: n.toLocaleString(),
        rawN: n,
        'O(1)': 1,
        'O(log n)': Number(log2n.toFixed(2)),
        'O(n)': n,
        'O(n log n)': Math.round(n * log2n),
        'O(n^2)': n * n,
        'O(2^n)': n <= 30 ? Math.pow(2, n) : 1e9, // capped so chart remains readable
      };
    });
  }, []);

  const comparisonRows = useMemo(() => {
    const n = inputN;
    const log2n = Math.log2(Math.max(2, n));
    return [
      { key: 'O(1)' as ComplexityKey, name: 'Constant', ops: 1, example: 'Array index, Hash map get' },
      { key: 'O(log n)' as ComplexityKey, name: 'Logarithmic', ops: log2n, example: 'Binary search, Balanced BST' },
      { key: 'O(n)' as ComplexityKey, name: 'Linear', ops: n, example: 'Single loop, Linear search' },
      { key: 'O(n log n)' as ComplexityKey, name: 'Log-Linear', ops: n * log2n, example: 'Merge Sort, Heap Sort, Timsort' },
      { key: 'O(n^2)' as ComplexityKey, name: 'Quadratic', ops: n * n, example: 'Bubble/Insertion Sort, Pair loops' },
      {
        key: 'O(2^n)' as ComplexityKey,
        name: 'Exponential',
        ops: n <= 60 ? Math.pow(2, n) : Number.POSITIVE_INFINITY,
        example: 'Naive Fibonacci, Subset enumeration',
      },
    ];
  }, [inputN]);

  const handleCopyOutput = () => {
    return [
      `Language: ${language}`,
      `Estimated Time Complexity: ${analysis.time} (${analysis.rating})`,
      `Estimated Space Complexity: ${analysis.space}`,
      `Reasoning:`,
      ...analysis.reasons.map((r) => `- ${r}`),
      ``,
      `Operations at n = ${inputN.toLocaleString()}:`,
      ...comparisonRows.map((r) => `  ${r.key.padEnd(10)} => ${formatOps(r.ops)} ops (~${estimateWallTime(r.ops)})`),
    ].join('\n');
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title={toolMeta.title}
        category={toolMeta.category}
        description={toolMeta.summary}
        onLoadSample={() => {
          setCode(CODE_PRESETS[3].code);
          setLanguage(CODE_PRESETS[3].language);
          setInputN(1000);
        }}
        onCopyOutput={handleCopyOutput}
        copyLabel="Copy Report"
        onClear={() => setCode('')}
      />

      {/* Algorithm Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Classic Patterns:
        </span>
        {CODE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              setCode(preset.code);
              setLanguage(preset.language);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 text-slate-700 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Analyzer Workspace: Editor + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="bigo-code-input" className="text-xs font-semibold text-slate-700">
              Paste Function or Loop Snippet
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['JavaScript', 'Python', 'Java', 'C++'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    language === lang
                      ? 'bg-white text-orange-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="bigo-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder="Paste JS, Python, Java, or C++ code here..."
            className="w-full rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 p-3.5 font-mono text-xs sm:text-sm text-slate-900 bg-[#FAF6F0]/60 focus:bg-white focus:outline-none leading-relaxed"
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800">
                <Gauge className="w-3.5 h-3.5" />
                Time Complexity
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {analysis.time}
              </div>
              <div className="text-xs text-orange-800 font-medium">{analysis.rating}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Layers className="w-3.5 h-3.5" />
                Auxiliary Space
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {analysis.space}
              </div>
              <div className="text-xs text-slate-500">Working memory &amp; stack</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-600" />
              Static Heuristic Breakdown
            </h2>
            <ul className="space-y-2">
              {analysis.reasons.map((r, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Growth-Rate Chart (n = 10 to 10,000) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Asymptotic Growth-Rate Comparison (n = 10 to 10,000)
            </h2>
            <p className="text-xs text-slate-500">
              Compare how operation counts scale across complexity classes. O(2^n) is capped at 10^9 for visual clarity.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setLogScale(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                logScale ? 'bg-orange-600 text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Log Scale
            </button>
            <button
              type="button"
              onClick={() => setLogScale(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                !logScale ? 'bg-orange-600 text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Linear Scale
            </button>
          </div>
        </div>

        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="n" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis
                scale={logScale ? 'log' : 'auto'}
                domain={logScale ? [1, 1e9] : [0, 'auto']}
                allowDataOverflow
                tickFormatter={(v) => formatOps(Number(v))}
                tick={{ fontSize: 11, fill: '#475569' }}
                width={65}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'O(2^n)' && value >= 1e9 ? '> 10^9 (overflow)' : formatOps(value),
                  name,
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  borderColor: '#E2E8F0',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="O(1)" stroke="#059669" strokeWidth={analysis.time === 'O(1)' ? 3.5 : 1.75} dot={false} />
              <Line type="monotone" dataKey="O(log n)" stroke="#0284C7" strokeWidth={analysis.time === 'O(log n)' ? 3.5 : 1.75} dot={false} />
              <Line type="monotone" dataKey="O(n)" stroke="#2563EB" strokeWidth={analysis.time === 'O(n)' ? 3.5 : 1.75} dot={false} />
              <Line type="monotone" dataKey="O(n log n)" stroke="#EA580C" strokeWidth={analysis.time === 'O(n log n)' ? 3.5 : 1.75} dot={false} />
              <Line type="monotone" dataKey="O(n^2)" stroke="#D97706" strokeWidth={analysis.time === 'O(n^2)' ? 3.5 : 1.75} dot={false} />
              <Line type="monotone" dataKey="O(2^n)" stroke="#DC2626" strokeWidth={analysis.time === 'O(2^n)' ? 3.5 : 1.75} dot={false} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive n Slider & Operations Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6F0] border border-slate-200 rounded-xl p-4">
          <label htmlFor="bigo-n-slider" className="text-xs font-semibold text-slate-800">
            Simulate Input Size <span className="font-mono text-orange-700 font-bold text-sm">n = {inputN.toLocaleString()}</span>
          </label>
          <input
            id="bigo-n-slider"
            type="range"
            min={10}
            max={10000}
            step={10}
            value={inputN}
            onChange={(e) => setInputN(Number(e.target.value))}
            className="w-full sm:w-80 accent-orange-600 cursor-pointer"
          />
        </div>

        <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3.5 font-semibold">Notation</th>
                <th className="py-2.5 px-3.5 font-semibold">Growth Class</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Ops at n = {inputN.toLocaleString()}</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Est. Time (@ 10^8 ops/s)</th>
                <th className="py-2.5 px-3.5 font-semibold">Classic CS Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => {
                const isDetected = row.key === analysis.time;
                return (
                  <tr key={row.key} className={isDetected ? 'bg-orange-50/70' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.key}
                      {isDetected && (
                        <span className="ml-2 text-[10px] font-sans font-semibold text-orange-700">
                          (Detected)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700">{row.name}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right font-semibold text-slate-900 tabular-nums">
                      {formatOps(row.ops)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-slate-600 tabular-nums">
                      {estimateWallTime(row.ops)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">{row.example}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
