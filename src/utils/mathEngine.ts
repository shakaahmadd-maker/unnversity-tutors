// 100% Client-Side Pure-TypeScript Mathematical, Symbolic, Matrix & Statistical Kernel
// Zero external APIs or paid dependencies.

export type AngleUnit = 'rad' | 'deg';

export interface ComplexNum {
  re: number;
  im: number;
}

// ============================================================================
// 1. SAFE EXPRESSION PARSER & EVALUATOR (Supports Real Variables + Trig/Log/Fact)
// ============================================================================

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; name: string }
  | { type: 'op'; op: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
  tau: Math.PI * 2,
};

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'csc',
  'sec',
  'cot',
  'asin',
  'acos',
  'atan',
  'arcsin',
  'arccos',
  'arctan',
  'sinh',
  'cosh',
  'tanh',
  'sqrt',
  'cbrt',
  'abs',
  'ln',
  'log',
  'log10',
  'log2',
  'exp',
  'floor',
  'ceil',
  'round',
  'sign',
  'fact',
  'ncr',
  'npr',
  'gcd',
  'lcm',
  'max',
  'min',
  'pow',
]);

export function factorialNum(n: number): number {
  if (!Number.isFinite(n) || n < 0) return NaN;
  if (Math.abs(n - Math.round(n)) > 1e-9) {
    return Math.exp(lnGamma(n + 1));
  }
  const k = Math.round(n);
  if (k > 170) return Infinity;
  let acc = 1;
  for (let i = 2; i <= k; i++) acc *= i;
  return acc;
}

export function gcdInt(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function lcmInt(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.trunc(a) * Math.trunc(b)) / gcdInt(a, b);
}

export function nCrNum(n: number, r: number): number {
  const nn = Math.round(n);
  const rr = Math.round(r);
  if (rr < 0 || rr > nn || nn < 0) return 0;
  const k = Math.min(rr, nn - rr);
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (nn - k + i)) / i;
  }
  return Math.round(res);
}

export function nPrNum(n: number, r: number): number {
  const nn = Math.round(n);
  const rr = Math.round(r);
  if (rr < 0 || rr > nn || nn < 0) return 0;
  let res = 1;
  for (let i = 0; i < rr; i++) {
    res *= nn - i;
  }
  return res;
}

function tokenizeExpression(raw: string): Token[] {
  const input = raw
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\*\*/g, '^');

  const rawTokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i++];
      }
      if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
        const next = input[i + 1];
        const next2 = input[i + 2];
        if (/[0-9]/.test(next || '') || ((next === '+' || next === '-') && /[0-9]/.test(next2 || ''))) {
          numStr += input[i++];
          if (input[i] === '+' || input[i] === '-') numStr += input[i++];
          while (i < input.length && /[0-9]/.test(input[i])) {
            numStr += input[i++];
          }
        }
      }
      const val = Number(numStr);
      if (Number.isNaN(val)) throw new Error(`Invalid number "${numStr}"`);
      rawTokens.push({ type: 'num', value: val });
      continue;
    }
    if (/[a-zA-Zπ_]/.test(ch)) {
      let id = '';
      while (i < input.length && /[a-zA-Z0-9π_]/.test(input[i])) {
        id += input[i++];
      }
      rawTokens.push({ type: 'ident', name: id.toLowerCase() });
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      rawTokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      rawTokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === ',') {
      rawTokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if ('+-*/^!%'.includes(ch)) {
      rawTokens.push({ type: 'op', op: ch });
      i++;
      continue;
    }
    throw new Error(`Unexpected character "${ch}"`);
  }

  // Insert implicit multiplication: e.g., 2x, 3sin(x), (x+1)(x-1), 2(x), )x
  const out: Token[] = [];
  for (let idx = 0; idx < rawTokens.length; idx++) {
    const cur = rawTokens[idx];
    const prev = out[out.length - 1];
    if (prev) {
      const prevEndsValue =
        prev.type === 'num' ||
        prev.type === 'rparen' ||
        (prev.type === 'op' && prev.op === '!') ||
        (prev.type === 'ident' && !FUNCTIONS.has(prev.name));
      const curStartsValue =
        cur.type === 'num' ||
        cur.type === 'ident' ||
        cur.type === 'lparen';

      if (prevEndsValue && curStartsValue) {
        out.push({ type: 'op', op: '*' });
      }
    }
    out.push(cur);
  }
  return out;
}

export type AstNode =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'unary'; op: '-' | '+'; arg: AstNode }
  | { kind: 'postfix'; op: '!'; arg: AstNode }
  | { kind: 'binary'; op: '+' | '-' | '*' | '/' | '^' | '%'; left: AstNode; right: AstNode }
  | { kind: 'call'; fn: string; args: AstNode[] };

export function parseMathAst(expression: string): AstNode {
  const tokens = tokenizeExpression(expression);
  if (tokens.length === 0) throw new Error('Empty expression');
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseAddSub = (): AstNode => {
    let node = parseMulDiv();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.op === '+' || t.op === '-')) {
        consume();
        const right = parseMulDiv();
        node = { kind: 'binary', op: t.op, left: node, right };
      } else {
        break;
      }
    }
    return node;
  };

  const parseMulDiv = (): AstNode => {
    let node = parseUnary();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.op === '*' || t.op === '/' || t.op === '%')) {
        consume();
        const right = parseUnary();
        node = { kind: 'binary', op: t.op as '*' | '/' | '%', left: node, right };
      } else {
        break;
      }
    }
    return node;
  };

  // Unary minus binds looser than exponentiation so -x^2 = -(x^2) per standard math notation
  const parseUnary = (): AstNode => {
    const t = peek();
    if (t && t.type === 'op' && (t.op === '-' || t.op === '+')) {
      consume();
      return { kind: 'unary', op: t.op, arg: parseUnary() };
    }
    return parsePower();
  };

  const parsePower = (): AstNode => {
    const left = parsePostfix();
    const t = peek();
    if (t && t.type === 'op' && t.op === '^') {
      consume();
      const right = parseUnary(); // Right-associative & allows 2^-x
      return { kind: 'binary', op: '^', left, right };
    }
    return left;
  };

  const parsePostfix = (): AstNode => {
    let node = parsePrimary();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && t.op === '!') {
        consume();
        node = { kind: 'postfix', op: '!', arg: node };
      } else {
        break;
      }
    }
    return node;
  };

  const parsePrimary = (): AstNode => {
    const t = peek();
    if (!t) throw new Error('Unexpected end of expression');

    if (t.type === 'num') {
      consume();
      return { kind: 'num', value: t.value };
    }

    if (t.type === 'ident') {
      consume();
      const next = peek();
      if (FUNCTIONS.has(t.name) && next && next.type === 'lparen') {
        consume(); // '('
        const args: AstNode[] = [];
        if (peek()?.type !== 'rparen') {
          args.push(parseAddSub());
          while (peek()?.type === 'comma') {
            consume();
            args.push(parseAddSub());
          }
        }
        if (peek()?.type !== 'rparen') throw new Error(`Missing closing parenthesis after ${t.name}(`);
        consume();
        return { kind: 'call', fn: t.name, args };
      }
      if (t.name in CONSTANTS) {
        return { kind: 'num', value: CONSTANTS[t.name] };
      }
      return { kind: 'var', name: t.name };
    }

    if (t.type === 'lparen') {
      consume();
      const inner = parseAddSub();
      if (peek()?.type !== 'rparen') throw new Error('Mismatched parentheses');
      consume();
      return inner;
    }

    throw new Error('Invalid syntax in mathematical expression');
  };

  const ast = parseAddSub();
  if (pos < tokens.length) {
    throw new Error('Unexpected trailing expression tokens');
  }
  return ast;
}

export function evalAst(
  node: AstNode,
  vars: Record<string, number> = {},
  angleUnit: AngleUnit = 'rad'
): number {
  const toRad = (v: number) => (angleUnit === 'deg' ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) => (angleUnit === 'deg' ? (v * 180) / Math.PI : v);

  switch (node.kind) {
    case 'num':
      return node.value;
    case 'var': {
      const key = node.name.toLowerCase();
      if (key in vars) return vars[key];
      if (key in CONSTANTS) return CONSTANTS[key];
      throw new Error(`Unknown variable "${node.name}"`);
    }
    case 'unary': {
      const v = evalAst(node.arg, vars, angleUnit);
      return node.op === '-' ? -v : v;
    }
    case 'postfix':
      return factorialNum(evalAst(node.arg, vars, angleUnit));
    case 'binary': {
      const l = evalAst(node.left, vars, angleUnit);
      const r = evalAst(node.right, vars, angleUnit);
      switch (node.op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          return l / r;
        case '%':
          return l % r;
        case '^':
          return Math.pow(l, r);
      }
      break;
    }
    case 'call': {
      const vals = node.args.map((a) => evalAst(a, vars, angleUnit));
      const a0 = vals[0] ?? 0;
      const a1 = vals[1] ?? 0;
      switch (node.fn) {
        case 'sin':
          return Math.sin(toRad(a0));
        case 'cos':
          return Math.cos(toRad(a0));
        case 'tan':
          return Math.tan(toRad(a0));
        case 'csc':
          return 1 / Math.sin(toRad(a0));
        case 'sec':
          return 1 / Math.cos(toRad(a0));
        case 'cot':
          return 1 / Math.tan(toRad(a0));
        case 'asin':
        case 'arcsin':
          return fromRad(Math.asin(a0));
        case 'acos':
        case 'arccos':
          return fromRad(Math.acos(a0));
        case 'atan':
        case 'arctan':
          return fromRad(Math.atan(a0));
        case 'sinh':
          return Math.sinh(a0);
        case 'cosh':
          return Math.cosh(a0);
        case 'tanh':
          return Math.tanh(a0);
        case 'sqrt':
          return Math.sqrt(a0);
        case 'cbrt':
          return Math.cbrt(a0);
        case 'abs':
          return Math.abs(a0);
        case 'ln':
          return Math.log(a0);
        case 'log':
        case 'log10':
          return vals.length === 2 ? Math.log(a0) / Math.log(a1) : Math.log10(a0);
        case 'log2':
          return Math.log2(a0);
        case 'exp':
          return Math.exp(a0);
        case 'floor':
          return Math.floor(a0);
        case 'ceil':
          return Math.ceil(a0);
        case 'round':
          return Math.round(a0);
        case 'sign':
          return Math.sign(a0);
        case 'fact':
          return factorialNum(a0);
        case 'ncr':
          return nCrNum(a0, a1);
        case 'npr':
          return nPrNum(a0, a1);
        case 'gcd':
          return gcdInt(a0, a1);
        case 'lcm':
          return lcmInt(a0, a1);
        case 'pow':
          return Math.pow(a0, a1);
        case 'max':
          return Math.max(...vals);
        case 'min':
          return Math.min(...vals);
      }
    }
  }
  return NaN;
}

export function evalMathExpr(
  expr: string,
  vars: Record<string, number> = {},
  angleUnit: AngleUnit = 'rad'
): number {
  const ast = parseMathAst(expr);
  return evalAst(ast, vars, angleUnit);
}

// ============================================================================
// 2. SYMBOLIC AST DIFFERENTIATOR + FORMATTER (d/dx)
// ============================================================================

export function differentiateAst(node: AstNode, variable = 'x'): AstNode {
  const v = variable.toLowerCase();
  const num = (val: number): AstNode => ({ kind: 'num', value: val });
  const add = (a: AstNode, b: AstNode): AstNode => ({ kind: 'binary', op: '+', left: a, right: b });
  const sub = (a: AstNode, b: AstNode): AstNode => ({ kind: 'binary', op: '-', left: a, right: b });
  const mul = (a: AstNode, b: AstNode): AstNode => ({ kind: 'binary', op: '*', left: a, right: b });
  const div = (a: AstNode, b: AstNode): AstNode => ({ kind: 'binary', op: '/', left: a, right: b });
  const pow = (a: AstNode, b: AstNode): AstNode => ({ kind: 'binary', op: '^', left: a, right: b });
  const neg = (a: AstNode): AstNode => ({ kind: 'unary', op: '-', arg: a });
  const call = (fn: string, arg: AstNode): AstNode => ({ kind: 'call', fn, args: [arg] });

  switch (node.kind) {
    case 'num':
      return num(0);
    case 'var':
      return num(node.name.toLowerCase() === v ? 1 : 0);
    case 'unary': {
      const da = differentiateAst(node.arg, v);
      return node.op === '-' ? neg(da) : da;
    }
    case 'postfix':
      return num(0);
    case 'binary': {
      const f = node.left;
      const g = node.right;
      const df = differentiateAst(f, v);
      const dg = differentiateAst(g, v);

      if (node.op === '+') return add(df, dg);
      if (node.op === '-') return sub(df, dg);
      if (node.op === '*') return add(mul(df, g), mul(f, dg)); // Product Rule
      if (node.op === '/') return div(sub(mul(df, g), mul(f, dg)), pow(g, num(2))); // Quotient Rule
      if (node.op === '^') {
        if (g.kind === 'num') {
          // Power + Chain rule: n * f^(n-1) * f'
          return mul(mul(num(g.value), pow(f, num(g.value - 1))), df);
        }
        if (f.kind === 'num') {
          // a^g(x) -> a^g(x) * ln(a) * g'(x)
          return mul(mul(pow(f, g), num(Math.log(f.value))), dg);
        }
        // Generalized f(x)^g(x) = f^g * (g' * ln(f) + g * f'/f)
        return mul(pow(f, g), add(mul(dg, call('ln', f)), div(mul(g, df), f)));
      }
      return num(0);
    }
    case 'call': {
      const u = node.args[0];
      if (!u) return num(0);
      const du = differentiateAst(u, v);
      switch (node.fn) {
        case 'sin':
          return mul(call('cos', u), du);
        case 'cos':
          return mul(neg(call('sin', u)), du);
        case 'tan':
          return mul(pow(call('sec', u), num(2)), du);
        case 'sec':
          return mul(mul(call('sec', u), call('tan', u)), du);
        case 'csc':
          return mul(neg(mul(call('csc', u), call('cot', u))), du);
        case 'cot':
          return mul(neg(pow(call('csc', u), num(2))), du);
        case 'exp':
          return mul(call('exp', u), du);
        case 'ln':
          return div(du, u);
        case 'log':
        case 'log10':
          return div(du, mul(u, num(Math.LN10)));
        case 'sqrt':
          return div(du, mul(num(2), call('sqrt', u)));
        case 'sinh':
          return mul(call('cosh', u), du);
        case 'cosh':
          return mul(call('sinh', u), du);
        case 'tanh':
          return div(du, pow(call('cosh', u), num(2)));
        case 'asin':
        case 'arcsin':
          return div(du, call('sqrt', sub(num(1), pow(u, num(2)))));
        case 'acos':
        case 'arccos':
          return neg(div(du, call('sqrt', sub(num(1), pow(u, num(2))))));
        case 'atan':
        case 'arctan':
          return div(du, add(num(1), pow(u, num(2))));
        default:
          return num(0);
      }
    }
  }
}

export function simplifyAst(node: AstNode): AstNode {
  const isZero = (n: AstNode) => n.kind === 'num' && Math.abs(n.value) < 1e-12;
  const isOne = (n: AstNode) => n.kind === 'num' && Math.abs(n.value - 1) < 1e-12;

  if (node.kind === 'unary') {
    const arg = simplifyAst(node.arg);
    if (node.op === '+') return arg;
    if (arg.kind === 'num') return { kind: 'num', value: -arg.value };
    if (arg.kind === 'unary' && arg.op === '-') return arg.arg;
    return { kind: 'unary', op: '-', arg };
  }

  if (node.kind === 'binary') {
    const l = simplifyAst(node.left);
    const r = simplifyAst(node.right);

    if (l.kind === 'num' && r.kind === 'num') {
      if (node.op === '+') return { kind: 'num', value: l.value + r.value };
      if (node.op === '-') return { kind: 'num', value: l.value - r.value };
      if (node.op === '*') return { kind: 'num', value: l.value * r.value };
      if (node.op === '/' && Math.abs(r.value) > 1e-12) return { kind: 'num', value: l.value / r.value };
      if (node.op === '^') return { kind: 'num', value: Math.pow(l.value, r.value) };
    }

    if (node.op === '+') {
      if (isZero(l)) return r;
      if (isZero(r)) return l;
    }
    if (node.op === '-') {
      if (isZero(r)) return l;
      if (isZero(l)) return simplifyAst({ kind: 'unary', op: '-', arg: r });
    }
    if (node.op === '*') {
      if (isZero(l) || isZero(r)) return { kind: 'num', value: 0 };
      if (isOne(l)) return r;
      if (isOne(r)) return l;
      if (l.kind === 'num' && r.kind === 'binary' && r.op === '*' && r.left.kind === 'num') {
        return simplifyAst({
          kind: 'binary',
          op: '*',
          left: { kind: 'num', value: l.value * r.left.value },
          right: r.right,
        });
      }
      if (r.kind === 'num' && l.kind !== 'num') {
        return simplifyAst({ kind: 'binary', op: '*', left: r, right: l });
      }
    }
    if (node.op === '/') {
      if (isZero(l)) return { kind: 'num', value: 0 };
      if (isOne(r)) return l;
    }
    if (node.op === '^') {
      if (isZero(r)) return { kind: 'num', value: 1 };
      if (isOne(r)) return l;
      if (isZero(l)) return { kind: 'num', value: 0 };
    }
    return { kind: 'binary', op: node.op, left: l, right: r };
  }

  if (node.kind === 'call') {
    return { kind: 'call', fn: node.fn, args: node.args.map(simplifyAst) };
  }

  return node;
}

export function formatAst(node: AstNode, parentPrec = 0): string {
  const fmtNum = (n: number) => {
    if (Math.abs(n - Math.PI) < 1e-9) return 'π';
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return Number(n.toFixed(4)).toString();
  };

  if (node.kind === 'num') return fmtNum(node.value);
  if (node.kind === 'var') return node.name;
  if (node.kind === 'postfix') return `${formatAst(node.arg, 5)}!`;
  if (node.kind === 'unary') {
    const inner = formatAst(node.arg, 3);
    const s = `-${inner}`;
    return parentPrec > 3 ? `(${s})` : s;
  }
  if (node.kind === 'call') {
    return `${node.fn}(${node.args.map((a) => formatAst(a, 0)).join(', ')})`;
  }
  if (node.kind === 'binary') {
    const prec =
      node.op === '+' || node.op === '-'
        ? 1
        : node.op === '*' || node.op === '/' || node.op === '%'
        ? 2
        : 4;
    const leftStr = formatAst(node.left, prec);
    const rightStr = formatAst(node.right, node.op === '-' || node.op === '/' ? prec + 1 : prec);

    if (node.op === '*' && node.left.kind === 'num' && (node.right.kind === 'var' || node.right.kind === 'call')) {
      const compact = `${leftStr}${rightStr}`;
      return parentPrec > prec ? `(${compact})` : compact;
    }
    const expr =
      node.op === '^'
        ? `${leftStr}^${rightStr}`
        : `${leftStr} ${node.op} ${rightStr}`;
    return parentPrec > prec ? `(${expr})` : expr;
  }
  return '';
}

// ============================================================================
// 3. COMPLEX NUMBER ARITHMETIC & POLAR / DE MOIVRE KERNEL
// ============================================================================

export function formatComplex(z: ComplexNum, digits = 4): string {
  const r = Math.abs(z.re) < 1e-10 ? 0 : Number(z.re.toFixed(digits));
  const im = Math.abs(z.im) < 1e-10 ? 0 : Number(z.im.toFixed(digits));
  if (im === 0) return `${r}`;
  const absIm = Math.abs(im) === 1 ? '' : String(Math.abs(im));
  if (r === 0) return `${im < 0 ? '-' : ''}${absIm}i`;
  return `${r} ${im < 0 ? '−' : '+'} ${absIm}i`;
}

export function complexAdd(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexSub(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function complexMul(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

export function complexDiv(a: ComplexNum, b: ComplexNum): ComplexNum {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) return { re: NaN, im: NaN };
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function complexPolar(z: ComplexNum): { r: number; thetaRad: number; thetaDeg: number } {
  const r = Math.hypot(z.re, z.im);
  const thetaRad = Math.atan2(z.im, z.re);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  return { r, thetaRad, thetaDeg };
}

export function complexPow(z: ComplexNum, n: number): ComplexNum {
  const { r, thetaRad } = complexPolar(z);
  const rn = Math.pow(r, n);
  return { re: rn * Math.cos(n * thetaRad), im: rn * Math.sin(n * thetaRad) };
}

export function complexNthRoots(z: ComplexNum, n: number): ComplexNum[] {
  const kCount = Math.max(1, Math.min(12, Math.round(n)));
  const { r, thetaRad } = complexPolar(z);
  const rootR = Math.pow(r, 1 / kCount);
  const roots: ComplexNum[] = [];
  for (let k = 0; k < kCount; k++) {
    const ang = (thetaRad + 2 * Math.PI * k) / kCount;
    roots.push({ re: rootR * Math.cos(ang), im: rootR * Math.sin(ang) });
  }
  return roots;
}

// Durand-Kerner complex polynomial root finder for c_0 x^d + c_1 x^(d-1) + ... + c_d = 0
export function findPolynomialRoots(coeffs: number[]): ComplexNum[] {
  // Strip leading zeros
  const c = [...coeffs];
  while (c.length > 1 && Math.abs(c[0]) < 1e-12) c.shift();
  const deg = c.length - 1;
  if (deg <= 0) return [];
  const lead = c[0];
  const monic = c.map((v) => v / lead);

  if (deg === 1) {
    return [{ re: -monic[1], im: 0 }];
  }
  if (deg === 2) {
    const b = monic[1];
    const cc = monic[2];
    const disc = b * b - 4 * cc;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      return [
        { re: (-b + s) / 2, im: 0 },
        { re: (-b - s) / 2, im: 0 },
      ];
    }
    const s = Math.sqrt(-disc);
    return [
      { re: -b / 2, im: s / 2 },
      { re: -b / 2, im: -s / 2 },
    ];
  }

  const evalMonic = (z: ComplexNum): ComplexNum => {
    let acc: ComplexNum = { re: 1, im: 0 };
    for (let i = 1; i <= deg; i++) {
      acc = complexMul(acc, z);
      acc.re += monic[i];
    }
    return acc;
  };

  let roots: ComplexNum[] = Array.from({ length: deg }, (_, k) =>
    complexPow({ re: 0.4, im: 0.9 }, k + 1)
  );

  for (let iter = 0; iter < 120; iter++) {
    let maxShift = 0;
    const nextRoots = roots.map((zk, k) => {
      let denom: ComplexNum = { re: 1, im: 0 };
      for (let j = 0; j < deg; j++) {
        if (j === k) continue;
        const diff = complexSub(zk, roots[j]);
        denom = complexMul(denom, Math.hypot(diff.re, diff.im) < 1e-12 ? { re: 1e-7, im: 1e-7 } : diff);
      }
      const delta = complexDiv(evalMonic(zk), denom);
      maxShift = Math.max(maxShift, Math.hypot(delta.re, delta.im));
      return complexSub(zk, delta);
    });
    roots = nextRoots;
    if (maxShift < 1e-11) break;
  }

  return roots.map((r) => ({
    re: Math.abs(r.re) < 1e-8 ? 0 : r.re,
    im: Math.abs(r.im) < 1e-8 ? 0 : r.im,
  }));
}

// ============================================================================
// 4. MATRIX ALGEBRA, GAUSSIAN RREF & EIGENVALUES
// ============================================================================

export interface RrefResult {
  rref: number[][];
  steps: string[];
  rank: number;
  pivotCols: number[];
}

export function computeRrefWithSteps(matrix: number[][]): RrefResult {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;
  const A = matrix.map((row) => row.map((v) => (Math.abs(v) < 1e-12 ? 0 : v)));
  const steps: string[] = [];
  const pivotCols: number[] = [];
  let lead = 0;

  const fmt = (v: number) => (Math.abs(v) < 1e-10 ? '0' : Number(v.toFixed(4)).toString());

  for (let r = 0; r < m; r++) {
    if (lead >= n) break;
    let i = r;
    while (Math.abs(A[i][lead]) < 1e-10) {
      i++;
      if (i === m) {
        i = r;
        lead++;
        if (lead === n) {
          return {
            rref: A.map((row) => row.map((v) => (Math.abs(v) < 1e-10 ? 0 : v))),
            steps,
            rank: pivotCols.length,
            pivotCols,
          };
        }
      }
    }

    if (i !== r) {
      [A[i], A[r]] = [A[r], A[i]];
      steps.push(`Swap R${r + 1} ↔ R${i + 1}`);
    }

    const pivotVal = A[r][lead];
    if (Math.abs(pivotVal - 1) > 1e-10) {
      for (let col = 0; col < n; col++) A[r][col] /= pivotVal;
      steps.push(`Normalize pivot: R${r + 1} ← (1 / ${fmt(pivotVal)}) · R${r + 1}`);
    }

    for (let row = 0; row < m; row++) {
      if (row !== r) {
        const factor = A[row][lead];
        if (Math.abs(factor) > 1e-10) {
          for (let col = 0; col < n; col++) {
            A[row][col] -= factor * A[r][col];
          }
          steps.push(
            `Eliminate col ${lead + 1}: R${row + 1} ← R${row + 1} ${factor > 0 ? '−' : '+'} ${fmt(Math.abs(factor))}·R${r + 1}`
          );
        }
      }
    }
    pivotCols.push(lead);
    lead++;
  }

  return {
    rref: A.map((row) => row.map((v) => (Math.abs(v) < 1e-10 ? 0 : v))),
    steps,
    rank: pivotCols.length,
    pivotCols,
  };
}

export function determinantNxN(matrix: number[][]): number {
  const n = matrix.length;
  if (n === 0 || matrix[0].length !== n) return NaN;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  const A = matrix.map((r) => [...r]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(A[r][i]) > Math.abs(A[pivot][i])) pivot = r;
    }
    if (Math.abs(A[pivot][i]) < 1e-12) return 0;
    if (pivot !== i) {
      [A[i], A[pivot]] = [A[pivot], A[i]];
      det = -det;
    }
    det *= A[i][i];
    for (let r = i + 1; r < n; r++) {
      const factor = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) {
        A[r][c] -= factor * A[i][c];
      }
    }
  }
  return Math.abs(det) < 1e-10 ? 0 : det;
}

export function invertMatrixNxN(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  if (n === 0 || matrix[0].length !== n) return null;
  const aug = matrix.map((row, r) => [
    ...row,
    ...Array.from({ length: n }, (_, c) => (r === c ? 1 : 0)),
  ]);
  const { rref, rank } = computeRrefWithSteps(aug);
  // Check left half is Identity
  for (let i = 0; i < n; i++) {
    if (Math.abs(rref[i][i] - 1) > 1e-7) return null;
  }
  if (rank < n) return null;
  return rref.map((row) => row.slice(n));
}

// ============================================================================
// 5. PROBABILITY DISTRIBUTIONS & HYPOTHESIS TESTING SPECIAL FUNCTIONS
// ============================================================================

export function lnGamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }
  const zm = z - 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (zm + i);
  }
  const t = zm + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (zm + 0.5) * Math.log(t) - t + Math.log(x);
}

export function erfApprox(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t) *
      Math.exp(-ax * ax);
  return sign * y;
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

export function normalCdf(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erfApprox((x - mu) / (sigma * Math.SQRT2)));
}

export function invStandardNormal(p: number): number {
  // Acklam's rational approximation for standard normal quantile
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// Regularized incomplete gamma P(a, x)
export function regularizedGammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n <= 160; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  // Lentz continued fraction for Q(a, x) = 1 - P(a, x)
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 160; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
  return 1 - q;
}

// Regularized incomplete beta I_x(a, b) via Lentz continued fraction
export function regularizedBetaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  const cf = (xx: number, aa: number, bb: number) => {
    const qab = aa + bb;
    const qap = aa + 1;
    const qam = aa - 1;
    let c = 1;
    let d = 1 - (qab * xx) / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 160; m++) {
      const m2 = 2 * m;
      let num = (m * (bb - m) * xx) / ((qam + m2) * (aa + m2));
      d = 1 + num * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + num / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      h *= d * c;

      num = -((aa + m) * (qab + m) * xx) / ((aa + m2) * (qap + m2));
      d = 1 + num * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + num / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return h;
  };

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * cf(x, a, b)) / a;
  }
  return 1 - (bt * cf(1 - x, b, a)) / b;
}

export function studentTPdf(t: number, df: number): number {
  return (
    Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2)) /
    (Math.sqrt(df * Math.PI) * Math.pow(1 + (t * t) / df, (df + 1) / 2))
  );
}

export function studentTCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = regularizedBetaI(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

export function chiSquarePdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k2 = df / 2;
  return Math.exp((k2 - 1) * Math.log(x) - x / 2 - k2 * Math.log(2) - lnGamma(k2));
}

export function chiSquareCdf(x: number, df: number): number {
  if (x <= 0) return 0;
  return regularizedGammaP(df / 2, x / 2);
}

export function fDistCdf(fVal: number, df1: number, df2: number): number {
  if (fVal <= 0) return 0;
  const x = (df1 * fVal) / (df1 * fVal + df2);
  return regularizedBetaI(x, df1 / 2, df2 / 2);
}

export function invStudentT(p: number, df: number): number {
  // Binary search / Newton refinement around normal quantile
  let lo = -60;
  let hi = 60;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (studentTCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
