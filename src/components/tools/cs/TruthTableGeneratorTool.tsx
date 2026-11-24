import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

type BoolOp = 'NOT' | 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR';

type BoolNode =
  | { kind: 'var'; name: string; label: string }
  | { kind: 'const'; value: boolean; label: string }
  | { kind: 'unary'; op: 'NOT'; child: BoolNode; label: string }
  | { kind: 'binary'; op: Exclude<BoolOp, 'NOT'>; left: BoolNode; right: BoolNode; label: string };

interface Token {
  type: 'VAR' | 'CONST' | 'OP' | 'LPAREN' | 'RPAREN';
  value: string;
}

const SAMPLE_EXPRESSIONS = [
  { label: '(A && B) || (!A && C)', expr: '(A && B) || (!A && C)' },
  { label: 'A XOR B (Half Adder Sum)', expr: '(A ^ B)' },
  { label: 'Majority Vote (3-Var)', expr: '(A && B) || (B && C) || (A && C)' },
  { label: 'NAND-Only Multiplexer', expr: '(A NAND C) NAND (B NAND !C)' },
  { label: "De Morgan's Law Check", expr: '!(A || B) ^ (!A && !B)' },
];

function tokenizeBoolean(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (input.slice(i, i + 2) === '&&') {
      tokens.push({ type: 'OP', value: 'AND' });
      i += 2;
      continue;
    }
    if (input.slice(i, i + 2) === '||') {
      tokens.push({ type: 'OP', value: 'OR' });
      i += 2;
      continue;
    }
    if (ch === '!' || ch === '~' || ch === '¬') {
      tokens.push({ type: 'OP', value: 'NOT' });
      i++;
      continue;
    }
    if (ch === '*' || ch === '&' || ch === '·' || ch === '∧') {
      tokens.push({ type: 'OP', value: 'AND' });
      i++;
      continue;
    }
    if (ch === '+' || ch === '|' || ch === '∨') {
      tokens.push({ type: 'OP', value: 'OR' });
      i++;
      continue;
    }
    if (ch === '^' || ch === '⊕') {
      tokens.push({ type: 'OP', value: 'XOR' });
      i++;
      continue;
    }
    if (ch === '0' || ch === '1') {
      tokens.push({ type: 'CONST', value: ch });
      i++;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let word = '';
      while (i < input.length && /[A-Za-z]/.test(input[i])) {
        word += input[i];
        i++;
      }
      const upper = word.toUpperCase();
      if (['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(upper)) {
        tokens.push({ type: 'OP', value: upper });
      } else if (upper === 'TRUE') {
        tokens.push({ type: 'CONST', value: '1' });
      } else if (upper === 'FALSE') {
        tokens.push({ type: 'CONST', value: '0' });
      } else if (word.length === 1 && ['A', 'B', 'C', 'D', 'E'].includes(upper)) {
        tokens.push({ type: 'VAR', value: upper });
      } else {
        throw new Error(
          `Unknown identifier "${word}". Use variables A, B, C, D, E and operators AND, OR, NOT, XOR, NAND, NOR.`
        );
      }
      continue;
    }
    throw new Error(`Unexpected symbol "${ch}" at position ${i + 1}.`);
  }

  return tokens;
}

function parseBooleanExpression(expr: string): { ast: BoolNode; variables: string[] } {
  const tokens = tokenizeBoolean(expr);
  if (tokens.length === 0) {
    throw new Error('Enter a Boolean expression using variables A–E.');
  }

  let pos = 0;
  const varsSet = new Set<string>();

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseOr = (): BoolNode => {
    let left = parseXor();
    while (peek()?.type === 'OP' && (peek().value === 'OR' || peek().value === 'NOR')) {
      const op = consume().value as 'OR' | 'NOR';
      const right = parseXor();
      left = { kind: 'binary', op, left, right, label: `(${left.label} ${op} ${right.label})` };
    }
    return left;
  };

  const parseXor = (): BoolNode => {
    let left = parseAnd();
    while (peek()?.type === 'OP' && peek().value === 'XOR') {
      consume();
      const right = parseAnd();
      left = { kind: 'binary', op: 'XOR', left, right, label: `(${left.label} XOR ${right.label})` };
    }
    return left;
  };

  const parseAnd = (): BoolNode => {
    let left = parseUnary();
    while (peek()?.type === 'OP' && (peek().value === 'AND' || peek().value === 'NAND')) {
      const op = consume().value as 'AND' | 'NAND';
      const right = parseUnary();
      left = { kind: 'binary', op, left, right, label: `(${left.label} ${op} ${right.label})` };
    }
    return left;
  };

  const parseUnary = (): BoolNode => {
    if (peek()?.type === 'OP' && peek().value === 'NOT') {
      consume();
      const child = parseUnary();
      const label = child.kind === 'var' || child.kind === 'const' ? `!${child.label}` : `!(${child.label.replace(/^\(|\)$/g, '')})`;
      return { kind: 'unary', op: 'NOT', child, label };
    }
    return parsePrimary();
  };

  const parsePrimary = (): BoolNode => {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of expression. Check for missing operands.');
    if (tok.type === 'VAR') {
      consume();
      varsSet.add(tok.value);
      return { kind: 'var', name: tok.value, label: tok.value };
    }
    if (tok.type === 'CONST') {
      consume();
      return { kind: 'const', value: tok.value === '1', label: tok.value };
    }
    if (tok.type === 'LPAREN') {
      consume();
      const node = parseOr();
      if (peek()?.type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis ")".');
      }
      consume();
      return node;
    }
    throw new Error(`Unexpected token "${tok.value}".`);
  };

  const ast = parseOr();
  if (pos < tokens.length) {
    throw new Error(`Unexpected trailing token "${tokens[pos].value}".`);
  }

  const variables = Array.from(varsSet).sort();
  if (variables.length > 5) {
    throw new Error('Maximum of 5 variables (A, B, C, D, E) supported.');
  }
  return { ast, variables };
}

function evalNode(node: BoolNode, env: Record<string, boolean>): boolean {
  switch (node.kind) {
    case 'var':
      return Boolean(env[node.name]);
    case 'const':
      return node.value;
    case 'unary':
      return !evalNode(node.child, env);
    case 'binary': {
      const l = evalNode(node.left, env);
      const r = evalNode(node.right, env);
      switch (node.op) {
        case 'AND':
          return l && r;
        case 'OR':
          return l || r;
        case 'XOR':
          return l !== r;
        case 'NAND':
          return !(l && r);
        case 'NOR':
          return !(l || r);
      }
    }
  }
}

function collectSubExpressions(node: BoolNode, out: BoolNode[] = [], seen = new Set<string>()): BoolNode[] {
  if (node.kind === 'var' || node.kind === 'const') return out;
  if (node.kind === 'unary') {
    collectSubExpressions(node.child, out, seen);
  } else {
    collectSubExpressions(node.left, out, seen);
    collectSubExpressions(node.right, out, seen);
  }
  if (!seen.has(node.label)) {
    seen.add(node.label);
    out.push(node);
  }
  return out;
}

// SVG Logic Gate Layout Engine
interface LayoutNode {
  id: number;
  node: BoolNode;
  depth: number;
  x: number;
  y: number;
  children: LayoutNode[];
}

function buildGateLayout(ast: BoolNode): { nodes: LayoutNode[]; width: number; height: number } {
  let idSeq = 1;
  let leafIndex = 0;

  const build = (node: BoolNode): { ln: LayoutNode; maxDepth: number } => {
    const id = idSeq++;
    if (node.kind === 'var' || node.kind === 'const') {
      const y = 44 + leafIndex * 54;
      leafIndex++;
      return {
        ln: { id, node, depth: 0, x: 0, y, children: [] },
        maxDepth: 0,
      };
    }
    if (node.kind === 'unary') {
      const childRes = build(node.child);
      const depth = childRes.maxDepth + 1;
      return {
        ln: { id, node, depth, x: 0, y: childRes.ln.y, children: [childRes.ln] },
        maxDepth: depth,
      };
    }
    const leftRes = build(node.left);
    const rightRes = build(node.right);
    const depth = Math.max(leftRes.maxDepth, rightRes.maxDepth) + 1;
    return {
      ln: {
        id,
        node,
        depth,
        x: 0,
        y: (leftRes.ln.y + rightRes.ln.y) / 2,
        children: [leftRes.ln, rightRes.ln],
      },
      maxDepth: depth,
    };
  };

  const rootRes = build(ast);
  const colSpacing = 128;
  const leftMargin = 54;
  const allNodes: LayoutNode[] = [];

  const assignX = (ln: LayoutNode) => {
    ln.x = leftMargin + ln.depth * colSpacing;
    allNodes.push(ln);
    ln.children.forEach(assignX);
  };
  assignX(rootRes.ln);

  const width = Math.max(460, leftMargin + (rootRes.maxDepth + 1) * colSpacing + 70);
  const height = Math.max(160, leafIndex * 54 + 44);
  return { nodes: allNodes, width, height };
}

const GateSvgShape: React.FC<{ op: BoolOp; x: number; y: number }> = ({ op, x, y }) => {
  const isNegated = op === 'NAND' || op === 'NOR' || op === 'NOT';
  const baseOp = op === 'NAND' ? 'AND' : op === 'NOR' ? 'OR' : op;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {baseOp === 'NOT' && (
        <polygon
          points="-22,-16 14,0 -22,16"
          fill="#FFF7ED"
          stroke="#EA580C"
          strokeWidth="2"
        />
      )}
      {baseOp === 'AND' && (
        <path
          d="M -24 -18 L -2 -18 A 18 18 0 0 1 -2 18 L -24 18 Z"
          fill="#FFF7ED"
          stroke="#EA580C"
          strokeWidth="2"
        />
      )}
      {(baseOp === 'OR' || baseOp === 'XOR') && (
        <>
          {baseOp === 'XOR' && (
            <path
              d="M -30 -18 Q -20 0 -30 18"
              fill="none"
              stroke="#EA580C"
              strokeWidth="2"
            />
          )}
          <path
            d="M -24 -18 Q -14 0 -24 18 L -6 18 Q 14 14 22 0 Q 14 -14 -6 -18 Z"
            fill="#FFF7ED"
            stroke="#EA580C"
            strokeWidth="2"
          />
        </>
      )}
      {isNegated && (
        <circle
          cx={baseOp === 'NOT' ? 19 : 25}
          cy={0}
          r={4.5}
          fill="#FFFFFF"
          stroke="#EA580C"
          strokeWidth="2"
        />
      )}
      <text
        x={baseOp === 'NOT' ? -8 : -4}
        y={4}
        textAnchor="middle"
        className="fill-slate-900 font-mono font-bold"
        style={{ fontSize: '9px' }}
      >
        {op}
      </text>
    </g>
  );
}

export default function TruthTableGeneratorTool() {
  const [expression, setExpression] = useState<string>(SAMPLE_EXPRESSIONS[0].expr);

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'truth-table-generator') return;
      if (ce.detail?.presetIndex === 0) {
        setExpression('(A && B) || (C && !D)');
      } else {
        setExpression('(A ^ B) || (A && C)');
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const analysis = useMemo(() => {
    try {
      const { ast, variables } = parseBooleanExpression(expression);
      const subExprs = collectSubExpressions(ast);
      const rowCount = Math.pow(2, variables.length);
      const rows: {
        index: number;
        inputs: Record<string, boolean>;
        subValues: boolean[];
        output: boolean;
      }[] = [];

      const minterms: number[] = [];
      const maxterms: number[] = [];
      const sopTerms: string[] = [];
      const posTerms: string[] = [];

      for (let i = 0; i < rowCount; i++) {
        const inputs: Record<string, boolean> = {};
        variables.forEach((v, bitIdx) => {
          const shift = variables.length - 1 - bitIdx;
          inputs[v] = Boolean((i >> shift) & 1);
        });
        const subValues = subExprs.map((node) => evalNode(node, inputs));
        const output = evalNode(ast, inputs);
        rows.push({ index: i, inputs, subValues, output });

        if (variables.length > 0) {
          if (output) {
            minterms.push(i);
            sopTerms.push(
              `(${variables.map((v) => (inputs[v] ? v : `!${v}`)).join(' · ')})`
            );
          } else {
            maxterms.push(i);
            posTerms.push(
              `(${variables.map((v) => (inputs[v] ? `!${v}` : v)).join(' + ')})`
            );
          }
        }
      }

      const trueCount = rows.filter((r) => r.output).length;
      const classification =
        trueCount === rows.length
          ? 'Tautology (Always True)'
          : trueCount === 0
          ? 'Contradiction (Always False)'
          : 'Contingency (Satisfiable)';

      const gateLayout = buildGateLayout(ast);

      return {
        error: null as string | null,
        ast,
        variables,
        subExprs,
        rows,
        minterms,
        maxterms,
        sop: sopTerms.length > 0 ? sopTerms.join(' + ') : '0 (No minterms)',
        pos: posTerms.length > 0 ? posTerms.join(' · ') : '1 (No maxterms)',
        classification,
        gateLayout,
      };
    } catch (err: any) {
      return {
        error: err?.message || 'Invalid Boolean expression.',
        ast: null,
        variables: [],
        subExprs: [],
        rows: [],
        minterms: [],
        maxterms: [],
        sop: '',
        pos: '',
        classification: '',
        gateLayout: null,
      };
    }
  }, [expression]);

  const buildCopyText = () => {
    if (analysis.error || !analysis.rows.length) return null;
    const headers = [...analysis.variables, ...analysis.subExprs.map((s) => s.label)];
    const lines = [
      headers.join('\t'),
      ...analysis.rows.map((r) =>
        [
          ...analysis.variables.map((v) => (r.inputs[v] ? '1' : '0')),
          ...r.subValues.map((v) => (v ? '1' : '0')),
        ].join('\t')
      ),
      '',
      `SOP: ${analysis.sop}`,
      `POS: ${analysis.pos}`,
    ];
    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="Boolean Logic Gate & Truth Table Generator"
        category="Systems & Logic"
        description="Evaluate Boolean algebra expressions up to 5 variables (A–E) with intermediate sub-expression columns, canonical SOP/POS forms, and an SVG circuit diagram."
        onLoadSample={() => setExpression(SAMPLE_EXPRESSIONS[0].expr)}
        onCopyOutput={buildCopyText}
        onClear={() => setExpression('')}
      />

      {/* Expression Input & Operator Quick Keys */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="bool-expr-input" className="text-xs font-semibold text-slate-700">
              Boolean Expression (Variables A, B, C, D, E)
            </label>
            <input
              id="bool-expr-input"
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="(A && B) || (!A && C)"
              spellCheck={false}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Quick Operator & Preset Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', '(', ')'].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() =>
                  setExpression((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${op} `)
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 font-mono text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {op}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_EXPRESSIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setExpression(s.expr)}
                className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-medium text-orange-800 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {analysis.error ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Expression Syntax Error</div>
            <p className="text-xs font-mono mt-1">{analysis.error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metadata & Canonical Forms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-500">Logic Classification</div>
              <div className="text-sm font-bold text-slate-900">{analysis.classification}</div>
              <div className="text-xs text-slate-600 font-mono tabular-nums">
                {analysis.variables.length} vars · {analysis.rows.length} rows
              </div>
            </div>

            <div className="rounded-xl bg-orange-50/60 border border-orange-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-orange-800">
                Canonical Sum of Products (SOP)
              </div>
              <div className="font-mono text-xs text-slate-900 break-words leading-relaxed">
                {analysis.sop}
              </div>
              {analysis.minterms.length > 0 && (
                <div className="font-mono text-[11px] text-orange-700 tabular-nums">
                  Σm({analysis.minterms.join(', ')})
                </div>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
              <div className="text-xs font-semibold text-slate-600">
                Canonical Product of Sums (POS)
              </div>
              <div className="font-mono text-xs text-slate-900 break-words leading-relaxed">
                {analysis.pos}
              </div>
              {analysis.maxterms.length > 0 && (
                <div className="font-mono text-[11px] text-slate-600 tabular-nums">
                  ΠM({analysis.maxterms.join(', ')})
                </div>
              )}
            </div>
          </div>

          {/* Step-by-Step Truth Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Step-by-Step Truth Table</h2>
              <span className="text-xs text-slate-500 font-mono">
                Highlighted column = Final Output
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse font-mono text-xs tabular-nums">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-slate-400 font-medium">#</th>
                    {analysis.variables.map((v) => (
                      <th key={v} className="px-3 py-2.5 font-bold text-slate-900 bg-slate-100/60">
                        {v}
                      </th>
                    ))}
                    {analysis.subExprs.map((sub, idx) => {
                      const isFinal = idx === analysis.subExprs.length - 1;
                      return (
                        <th
                          key={sub.label}
                          className={`px-3 py-2.5 font-bold whitespace-nowrap ${
                            isFinal
                              ? 'bg-orange-600 text-white'
                              : 'text-slate-700 bg-orange-50/50'
                          }`}
                        >
                          {sub.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysis.rows.map((row) => (
                    <tr key={row.index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-slate-400">m{row.index}</td>
                      {analysis.variables.map((v) => (
                        <td key={v} className="px-3 py-2 font-semibold text-slate-800">
                          {row.inputs[v] ? '1' : '0'}
                        </td>
                      ))}
                      {row.subValues.map((val, idx) => {
                        const isFinal = idx === row.subValues.length - 1;
                        return (
                          <td
                            key={idx}
                            className={`px-3 py-2 font-bold ${
                              isFinal
                                ? val
                                  ? 'bg-orange-50 text-orange-700'
                                  : 'bg-slate-50 text-slate-500'
                                : val
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {val ? '1 (T)' : '0 (F)'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual SVG Logic Gate Diagram */}
          {analysis.gateLayout && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Visual Logic Gate Circuit Diagram (SVG)
                </h2>
                <span className="text-xs text-slate-500">Generated directly from parsed AST</span>
              </div>
              <div className="p-4 overflow-x-auto bg-[#FAF6F0]/50">
                <svg
                  width={analysis.gateLayout.width}
                  height={analysis.gateLayout.height}
                  viewBox={`0 0 ${analysis.gateLayout.width} ${analysis.gateLayout.height}`}
                  className="mx-auto block"
                  role="img"
                  aria-label={`Logic gate circuit diagram for ${expression}`}
                >
                  {/* Wires */}
                  {analysis.gateLayout.nodes.map((ln) =>
                    ln.children.map((child, cIdx) => {
                      const startX =
                        child.node.kind === 'var' || child.node.kind === 'const'
                          ? child.x + 18
                          : child.x + 28;
                      const endX = ln.x - 24;
                      const endY =
                        ln.children.length === 2
                          ? ln.y + (cIdx === 0 ? -8 : 8)
                          : ln.y;
                      const midX = (startX + endX) / 2;
                      return (
                        <path
                          key={`wire-${ln.id}-${child.id}`}
                          d={`M ${startX} ${child.y} L ${midX} ${child.y} L ${midX} ${endY} L ${endX} ${endY}`}
                          fill="none"
                          stroke="#64748B"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })
                  )}

                  {/* Output wire from root */}
                  {analysis.gateLayout.nodes[0] && (
                    <g>
                      <line
                        x1={analysis.gateLayout.nodes[0].x + 28}
                        y1={analysis.gateLayout.nodes[0].y}
                        x2={analysis.gateLayout.nodes[0].x + 70}
                        y2={analysis.gateLayout.nodes[0].y}
                        stroke="#EA580C"
                        strokeWidth="2.2"
                      />
                      <text
                        x={analysis.gateLayout.nodes[0].x + 76}
                        y={analysis.gateLayout.nodes[0].y + 4}
                        className="fill-orange-700 font-mono font-bold"
                        style={{ fontSize: '12px' }}
                      >
                        OUT
                      </text>
                    </g>
                  )}

                  {/* Nodes & Gates */}
                  {analysis.gateLayout.nodes.map((ln) => {
                    if (ln.node.kind === 'var' || ln.node.kind === 'const') {
                      return (
                        <g key={ln.id} transform={`translate(${ln.x}, ${ln.y})`}>
                          <rect
                            x={-18}
                            y={-14}
                            width={36}
                            height={28}
                            rx={6}
                            fill="#0F172A"
                          />
                          <text
                            x={0}
                            y={4}
                            textAnchor="middle"
                            className="fill-white font-mono font-bold"
                            style={{ fontSize: '12px' }}
                          >
                            {ln.node.label}
                          </text>
                        </g>
                      );
                    }
                    const op = ln.node.op;
                    return <GateSvgShape key={ln.id} op={op} x={ln.x} y={ln.y} />;
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
