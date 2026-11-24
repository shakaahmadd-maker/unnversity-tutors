import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Clock,
  Database,
  Download,
  Play,
  RotateCcw,
  Table as TableIcon,
} from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

type SqlPrimitive = string | number | boolean | null;
type SqlRow = Record<string, SqlPrimitive>;

interface TableSchema {
  name: string;
  columns: { name: string; type: string; key?: string }[];
  rows: SqlRow[];
}

function createInitialUniversityDatabase(): Record<string, TableSchema> {
  return {
    Students: {
      name: 'Students',
      columns: [
        { name: 'student_id', type: 'INTEGER', key: 'PK' },
        { name: 'full_name', type: 'TEXT' },
        { name: 'major', type: 'TEXT' },
        { name: 'gpa', type: 'REAL' },
        { name: 'year', type: 'INTEGER' },
        { name: 'country', type: 'TEXT' },
      ],
      rows: [
        { student_id: 101, full_name: 'Maya Patel', major: 'Computer Science', gpa: 3.92, year: 3, country: 'UK' },
        { student_id: 102, full_name: 'Liam Chen', major: 'Data Science', gpa: 3.74, year: 2, country: 'Canada' },
        { student_id: 103, full_name: 'Sofia Rodriguez', major: 'Computer Science', gpa: 3.85, year: 4, country: 'USA' },
        { student_id: 104, full_name: 'Noah Okafor', major: 'Software Engineering', gpa: 3.41, year: 2, country: 'UK' },
        { student_id: 105, full_name: 'Hannah Lindqvist', major: 'Computer Science', gpa: 3.96, year: 4, country: 'Ireland' },
        { student_id: 106, full_name: 'Omar Al-Mansoor', major: 'Cybersecurity', gpa: 3.62, year: 3, country: 'UAE' },
        { student_id: 107, full_name: 'Chloe Bennett', major: 'Data Science', gpa: 3.55, year: 1, country: 'Australia' },
        { student_id: 108, full_name: 'Ethan Brooks', major: 'Software Engineering', gpa: 3.28, year: 3, country: 'USA' },
        { student_id: 109, full_name: 'Aisha Khan', major: 'Cybersecurity', gpa: 3.88, year: 4, country: 'Singapore' },
        { student_id: 110, full_name: 'Lucas Kim', major: 'Computer Science', gpa: 3.47, year: 2, country: 'Canada' },
      ],
    },
    Courses: {
      name: 'Courses',
      columns: [
        { name: 'course_id', type: 'INTEGER', key: 'PK' },
        { name: 'course_code', type: 'TEXT' },
        { name: 'title', type: 'TEXT' },
        { name: 'department', type: 'TEXT' },
        { name: 'credits', type: 'INTEGER' },
        { name: 'instructor', type: 'TEXT' },
      ],
      rows: [
        { course_id: 201, course_code: 'CS201', title: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, instructor: 'Dr. Eleanor Vance' },
        { course_id: 202, course_code: 'CS310', title: 'Database Management Systems', department: 'Computer Science', credits: 3, instructor: 'Prof. Rajesh Nair' },
        { course_id: 203, course_code: 'CS340', title: 'Operating Systems', department: 'Systems', credits: 4, instructor: 'Dr. Marcus Weber' },
        { course_id: 204, course_code: 'NET220', title: 'Computer Networks & Security', department: 'Cybersecurity', credits: 3, instructor: 'Dr. Claire Beaumont' },
        { course_id: 205, course_code: 'DS250', title: 'Machine Learning Foundations', department: 'Data Science', credits: 4, instructor: 'Prof. Kenji Sato' },
        { course_id: 206, course_code: 'SE305', title: 'Software Architecture', department: 'Software Engineering', credits: 3, instructor: 'Dr. Hannah Morales' },
      ],
    },
    Enrollments: {
      name: 'Enrollments',
      columns: [
        { name: 'enrollment_id', type: 'INTEGER', key: 'PK' },
        { name: 'student_id', type: 'INTEGER', key: 'FK' },
        { name: 'course_id', type: 'INTEGER', key: 'FK' },
        { name: 'semester', type: 'TEXT' },
        { name: 'grade', type: 'TEXT' },
        { name: 'score', type: 'INTEGER' },
      ],
      rows: [
        { enrollment_id: 1, student_id: 101, course_id: 201, semester: 'Fall 2026', grade: 'A', score: 95 },
        { enrollment_id: 2, student_id: 101, course_id: 202, semester: 'Fall 2026', grade: 'A', score: 93 },
        { enrollment_id: 3, student_id: 101, course_id: 203, semester: 'Spring 2026', grade: 'A-', score: 90 },
        { enrollment_id: 4, student_id: 102, course_id: 201, semester: 'Fall 2026', grade: 'B+', score: 87 },
        { enrollment_id: 5, student_id: 102, course_id: 205, semester: 'Fall 2026', grade: 'A', score: 94 },
        { enrollment_id: 6, student_id: 103, course_id: 202, semester: 'Fall 2026', grade: 'A', score: 92 },
        { enrollment_id: 7, student_id: 103, course_id: 203, semester: 'Fall 2026', grade: 'A-', score: 89 },
        { enrollment_id: 8, student_id: 104, course_id: 201, semester: 'Fall 2026', grade: 'B', score: 82 },
        { enrollment_id: 9, student_id: 104, course_id: 206, semester: 'Spring 2026', grade: 'B+', score: 86 },
        { enrollment_id: 10, student_id: 105, course_id: 201, semester: 'Fall 2026', grade: 'A', score: 98 },
        { enrollment_id: 11, student_id: 105, course_id: 202, semester: 'Fall 2026', grade: 'A', score: 96 },
        { enrollment_id: 12, student_id: 105, course_id: 205, semester: 'Spring 2026', grade: 'A', score: 95 },
        { enrollment_id: 13, student_id: 106, course_id: 204, semester: 'Fall 2026', grade: 'A-', score: 91 },
        { enrollment_id: 14, student_id: 106, course_id: 202, semester: 'Spring 2026', grade: 'B+', score: 85 },
        { enrollment_id: 15, student_id: 107, course_id: 205, semester: 'Fall 2026', grade: 'B+', score: 88 },
        { enrollment_id: 16, student_id: 108, course_id: 206, semester: 'Fall 2026', grade: 'B-', score: 79 },
        { enrollment_id: 17, student_id: 109, course_id: 204, semester: 'Fall 2026', grade: 'A', score: 96 },
        { enrollment_id: 18, student_id: 110, course_id: 201, semester: 'Fall 2026', grade: 'B', score: 83 },
      ],
    },
  };
}

interface SampleQuery {
  id: string;
  label: string;
  tag: string;
  sql: string;
}

const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'join-transcript',
    label: '1. Multi-Table JOIN (Student Course Roster)',
    tag: 'INNER JOIN',
    sql: `SELECT s.full_name, s.major, c.course_code, c.title, e.grade, e.score
FROM Students s
INNER JOIN Enrollments e ON s.student_id = e.student_id
INNER JOIN Courses c ON e.course_id = c.course_id
WHERE e.semester = 'Fall 2026'
ORDER BY e.score DESC
LIMIT 10;`,
  },
  {
    id: 'group-by-major',
    label: '2. GROUP BY Major (GPA & Student Count)',
    tag: 'GROUP BY',
    sql: `SELECT major,
       COUNT(*) AS student_count,
       ROUND(AVG(gpa), 2) AS avg_gpa,
       MAX(gpa) AS highest_gpa
FROM Students
GROUP BY major
ORDER BY avg_gpa DESC;`,
  },
  {
    id: 'having-courses',
    label: '3. GROUP BY + HAVING (High-Enrollment Courses)',
    tag: 'HAVING',
    sql: `SELECT c.course_code,
       c.title,
       COUNT(e.enrollment_id) AS enrolled_students,
       ROUND(AVG(e.score), 1) AS avg_score
FROM Courses c
INNER JOIN Enrollments e ON c.course_id = e.course_id
GROUP BY c.course_code, c.title
HAVING COUNT(e.enrollment_id) >= 3
ORDER BY avg_score DESC;`,
  },
  {
    id: 'subquery-above-avg',
    label: '4. Scalar Subquery (Above-Average GPA Honors)',
    tag: 'SUBQUERY',
    sql: `SELECT full_name, major, gpa, country
FROM Students
WHERE gpa > (SELECT AVG(gpa) FROM Students)
ORDER BY gpa DESC;`,
  },
  {
    id: 'in-subquery',
    label: '5. IN Subquery (Students Scoring 95+ in Any Course)',
    tag: 'IN SUBQUERY',
    sql: `SELECT student_id, full_name, major, gpa
FROM Students
WHERE student_id IN (
  SELECT student_id FROM Enrollments WHERE score >= 95
)
ORDER BY gpa DESC;`,
  },
];

// =========================================================================
// Pure TypeScript Client-Side Relational SQL Engine
// =========================================================================

interface JoinedRecord {
  [qualifiedKey: string]: SqlPrimitive;
}

interface SqlExecResult {
  columns: string[];
  rows: SqlRow[];
  message?: string;
  affectedRows?: number;
  elapsedMs: number;
}

function stripSqlComments(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .trim();
}

function splitTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let buf = '';

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      buf += ch;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      buf += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);

      if (depth === 0 && input.slice(i, i + delimiter.length) === delimiter) {
        parts.push(buf.trim());
        buf = '';
        i += delimiter.length - 1;
        continue;
      }
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function splitTopLevelKeyword(input: string, keyword: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let buf = '';
  const upper = input.toUpperCase();
  const kwUpper = keyword.toUpperCase();
  const kwLen = kwUpper.length;

  const isBoundary = (idx: number) => {
    if (idx < 0 || idx >= input.length) return true;
    return !/[A-Z0-9_]/i.test(input[idx]);
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      buf += ch;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      buf += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      if (
        depth === 0 &&
        upper.slice(i, i + kwLen) === kwUpper &&
        isBoundary(i - 1) &&
        isBoundary(i + kwLen)
      ) {
        parts.push(buf.trim());
        buf = '';
        i += kwLen - 1;
        continue;
      }
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function findTopLevelClausePositions(sql: string): { clause: string; index: number; len: number }[] {
  const clauses = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
  ];
  const found: { clause: string; index: number; len: number }[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  const upper = sql.toUpperCase();

  const isBoundary = (idx: number) => {
    if (idx < 0 || idx >= sql.length) return true;
    return !/[A-Z0-9_]/i.test(sql[idx]);
  };

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;
    if (ch === '(') {
      depth++;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth !== 0) continue;

    for (const cl of clauses) {
      if (
        upper.slice(i, i + cl.length) === cl &&
        isBoundary(i - 1) &&
        isBoundary(i + cl.length)
      ) {
        found.push({ clause: cl, index: i, len: cl.length });
        i += cl.length - 1;
        break;
      }
    }
  }
  return found;
}

function resolveTable(db: Record<string, TableSchema>, name: string): TableSchema {
  const key = Object.keys(db).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) {
    throw new Error(`Table "${name}" does not exist. Available tables: ${Object.keys(db).join(', ')}.`);
  }
  return db[key];
}

function getColumnValue(rec: JoinedRecord, expr: string): SqlPrimitive {
  const clean = expr.trim().replace(/^["`]|["`]$/g, '');
  if (clean in rec) return rec[clean];
  const lower = clean.toLowerCase();
  for (const k of Object.keys(rec)) {
    if (k.toLowerCase() === lower) return rec[k];
  }
  if (!clean.includes('.')) {
    for (const k of Object.keys(rec)) {
      const suffix = k.includes('.') ? k.split('.').pop()!.toLowerCase() : k.toLowerCase();
      if (suffix === lower) return rec[k];
    }
  }
  return null;
}

function parseLiteralOrColumn(
  expr: string,
  rec: JoinedRecord,
  db: Record<string, TableSchema>,
  groupRows?: JoinedRecord[]
): SqlPrimitive {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  // Strip enclosing parentheses unless subquery
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(1, -1).trim();
    if (/^SELECT\b/i.test(inner)) {
      const sub = executeSelect(inner, db);
      if (sub.rows.length === 0 || sub.columns.length === 0) return null;
      return sub.rows[0][sub.columns[0]] ?? null;
    }
    return parseLiteralOrColumn(inner, rec, db, groupRows);
  }

  // String literal
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  // NULL / Boolean
  if (/^NULL$/i.test(trimmed)) return null;
  if (/^TRUE$/i.test(trimmed)) return true;
  if (/^FALSE$/i.test(trimmed)) return false;

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // ROUND(inner, digits)
  const roundMatch = /^ROUND\s*\(([\s\S]+)\)$/i.exec(trimmed);
  if (roundMatch) {
    const args = splitTopLevel(roundMatch[1], ',');
    const val = Number(parseLiteralOrColumn(args[0], rec, db, groupRows));
    const digits = args[1] !== undefined ? Number(parseLiteralOrColumn(args[1], rec, db, groupRows)) : 0;
    if (!Number.isFinite(val)) return null;
    const factor = Math.pow(10, Number.isFinite(digits) ? digits : 0);
    return Math.round(val * factor) / factor;
  }

  // Aggregate functions
  const aggMatch = /^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]+)\)$/i.exec(trimmed);
  if (aggMatch) {
    const fn = aggMatch[1].toUpperCase();
    const arg = aggMatch[2].trim();
    const rows = groupRows ?? [rec];
    if (fn === 'COUNT') {
      if (arg === '*') return rows.length;
      const isDistinct = /^DISTINCT\s+/i.test(arg);
      const colExpr = isDistinct ? arg.replace(/^DISTINCT\s+/i, '').trim() : arg;
      const vals = rows
        .map((r) => parseLiteralOrColumn(colExpr, r, db))
        .filter((v) => v !== null && v !== undefined);
      if (isDistinct) return new Set(vals.map(String)).size;
      return vals.length;
    }
    const nums = rows
      .map((r) => parseLiteralOrColumn(arg, r, db))
      .filter((v) => v !== null && v !== undefined)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    if (fn === 'SUM') return nums.reduce((a, b) => a + b, 0);
    if (fn === 'AVG') return nums.reduce((a, b) => a + b, 0) / nums.length;
    if (fn === 'MIN') return Math.min(...nums);
    if (fn === 'MAX') return Math.max(...nums);
  }

  // Simple arithmetic (+, -, *, /) outside quotes/parens
  for (const op of ['+', '-', '*', '/']) {
    const idx = findBinaryArithOp(trimmed, op);
    if (idx > 0) {
      const left = Number(parseLiteralOrColumn(trimmed.slice(0, idx), rec, db, groupRows));
      const right = Number(parseLiteralOrColumn(trimmed.slice(idx + 1), rec, db, groupRows));
      if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
      if (op === '+') return left + right;
      if (op === '-') return left - right;
      if (op === '*') return left * right;
      if (op === '/') return right === 0 ? null : left / right;
    }
  }

  return getColumnValue(rec, trimmed);
}

function findBinaryArithOp(expr: string, target: string): number {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = expr.length - 1; i >= 1; i--) {
    const ch = expr[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (inSingle || inDouble) continue;
    if (ch === ')') depth++;
    else if (ch === '(') depth = Math.max(0, depth - 1);
    if (depth === 0 && ch === target) {
      const prev = expr.slice(0, i).trim();
      if (prev && !/[+\-*/(,]$/.test(prev)) {
        return i;
      }
    }
  }
  return -1;
}

function evaluateCondition(
  condition: string,
  rec: JoinedRecord,
  db: Record<string, TableSchema>,
  groupRows?: JoinedRecord[]
): boolean {
  const trimmed = condition.trim();
  if (!trimmed) return true;

  // Strip balanced outer parentheses
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let depth = 0;
    let wrapsEntire = true;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') depth++;
      else if (trimmed[i] === ')') depth--;
      if (depth === 0 && i < trimmed.length - 1) {
        wrapsEntire = false;
        break;
      }
    }
    if (wrapsEntire) {
      return evaluateCondition(trimmed.slice(1, -1), rec, db, groupRows);
    }
  }

  // OR
  const orParts = splitTopLevelKeyword(trimmed, 'OR');
  if (orParts.length > 1) {
    return orParts.some((p) => evaluateCondition(p, rec, db, groupRows));
  }

  // AND (be careful with BETWEEN ... AND ...)
  const andParts = splitTopLevelKeyword(trimmed, 'AND');
  if (andParts.length > 1) {
    const merged: string[] = [];
    for (let i = 0; i < andParts.length; i++) {
      if (/\bBETWEEN\b/i.test(andParts[i]) && i + 1 < andParts.length) {
        merged.push(`${andParts[i]} AND ${andParts[i + 1]}`);
        i++;
      } else {
        merged.push(andParts[i]);
      }
    }
    if (merged.length > 1) {
      return merged.every((p) => evaluateCondition(p, rec, db, groupRows));
    }
  }

  // NOT
  if (/^NOT\s+/i.test(trimmed)) {
    return !evaluateCondition(trimmed.replace(/^NOT\s+/i, ''), rec, db, groupRows);
  }

  // IS NOT NULL / IS NULL
  const isNotNull = /^([\s\S]+?)\s+IS\s+NOT\s+NULL$/i.exec(trimmed);
  if (isNotNull) {
    const v = parseLiteralOrColumn(isNotNull[1], rec, db, groupRows);
    return v !== null && v !== undefined;
  }
  const isNull = /^([\s\S]+?)\s+IS\s+NULL$/i.exec(trimmed);
  if (isNull) {
    const v = parseLiteralOrColumn(isNull[1], rec, db, groupRows);
    return v === null || v === undefined;
  }

  // BETWEEN
  const betweenMatch = /^([\s\S]+?)\s+BETWEEN\s+([\s\S]+?)\s+AND\s+([\s\S]+)$/i.exec(trimmed);
  if (betweenMatch) {
    const v = parseLiteralOrColumn(betweenMatch[1], rec, db, groupRows);
    const lo = parseLiteralOrColumn(betweenMatch[2], rec, db, groupRows);
    const hi = parseLiteralOrColumn(betweenMatch[3], rec, db, groupRows);
    if (v === null || lo === null || hi === null) return false;
    return v >= lo && v <= hi;
  }

  // IN / NOT IN (list or subquery)
  const inMatch = /^([\s\S]+?)\s+(NOT\s+)?IN\s*\(([\s\S]+)\)$/i.exec(trimmed);
  if (inMatch) {
    const lhs = parseLiteralOrColumn(inMatch[1], rec, db, groupRows);
    const negated = Boolean(inMatch[2]);
    const inner = inMatch[3].trim();
    let listVals: SqlPrimitive[];
    if (/^SELECT\b/i.test(inner)) {
      const sub = executeSelect(inner, db);
      const firstCol = sub.columns[0];
      listVals = sub.rows.map((r) => (firstCol ? r[firstCol] : null));
    } else {
      listVals = splitTopLevel(inner, ',').map((item) =>
        parseLiteralOrColumn(item, rec, db, groupRows)
      );
    }
    const matched = listVals.some((item) => item === lhs || String(item) === String(lhs));
    return negated ? !matched : matched;
  }

  // LIKE
  const likeMatch = /^([\s\S]+?)\s+(NOT\s+)?LIKE\s+([\s\S]+)$/i.exec(trimmed);
  if (likeMatch) {
    const lhs = String(parseLiteralOrColumn(likeMatch[1], rec, db, groupRows) ?? '');
    const negated = Boolean(likeMatch[2]);
    const patternRaw = String(parseLiteralOrColumn(likeMatch[3], rec, db, groupRows) ?? '');
    const escaped = patternRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = '^' + escaped.replace(/%/g, '.*').replace(/_/g, '.') + '$';
    const matched = new RegExp(regexStr, 'i').test(lhs);
    return negated ? !matched : matched;
  }

  // Comparison operators
  const cmpMatch = /^([\s\S]+?)\s*(!=|<>|<=|>=|=|<|>)\s*([\s\S]+)$/.exec(trimmed);
  if (cmpMatch) {
    const lhs = parseLiteralOrColumn(cmpMatch[1], rec, db, groupRows);
    const op = cmpMatch[2];
    const rhs = parseLiteralOrColumn(cmpMatch[3], rec, db, groupRows);
    if (lhs === null || rhs === null) return false;
    const bothNum = typeof lhs === 'number' && typeof rhs === 'number';
    const lVal = bothNum ? lhs : String(lhs).toLowerCase();
    const rVal = bothNum ? rhs : String(rhs).toLowerCase();
    switch (op) {
      case '=':
        return lVal === rVal;
      case '!=':
      case '<>':
        return lVal !== rVal;
      case '<':
        return lVal < rVal;
      case '<=':
        return lVal <= rVal;
      case '>':
        return lVal > rVal;
      case '>=':
        return lVal >= rVal;
    }
  }

  throw new Error(`Unable to evaluate condition: "${trimmed}"`);
}

function prefixRow(row: SqlRow, tableName: string, alias?: string): JoinedRecord {
  const out: JoinedRecord = {};
  for (const [k, v] of Object.entries(row)) {
    out[`${tableName}.${k}`] = v;
    if (alias) {
      out[`${alias}.${k}`] = v;
    }
    if (!(k in out)) {
      out[k] = v;
    }
  }
  return out;
}

function executeSelect(rawSql: string, db: Record<string, TableSchema>): SqlExecResult {
  const start = performance.now();
  const cleanSql = stripSqlComments(rawSql).replace(/;+\s*$/, '');
  const positions = findTopLevelClausePositions(cleanSql);

  if (positions.length === 0 || positions[0].clause !== 'SELECT') {
    throw new Error('Query must begin with SELECT, INSERT, UPDATE, or DELETE.');
  }

  const sections: Record<string, string> = {};
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const nextStart = i + 1 < positions.length ? positions[i + 1].index : cleanSql.length;
    sections[cur.clause] = cleanSql.slice(cur.index + cur.len, nextStart).trim();
  }

  let selectClause = sections['SELECT'] || '';
  if (!selectClause) throw new Error('SELECT clause cannot be empty.');
  let distinct = false;
  if (/^DISTINCT\s+/i.test(selectClause)) {
    distinct = true;
    selectClause = selectClause.replace(/^DISTINCT\s+/i, '').trim();
  }

  const fromClause = sections['FROM'];
  if (!fromClause) {
    // Allow constant expressions like SELECT 1 + 1 AS sum
    const cols = splitTopLevel(selectClause, ',');
    const row: SqlRow = {};
    const colNames: string[] = [];
    for (const col of cols) {
      const asMatch = /^([\s\S]+?)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i.exec(col);
      const expr = asMatch ? asMatch[1].trim() : col.trim();
      const label = asMatch ? asMatch[2].trim() : expr;
      colNames.push(label);
      row[label] = parseLiteralOrColumn(expr, {}, db);
    }
    return {
      columns: colNames,
      rows: [row],
      elapsedMs: Number((performance.now() - start).toFixed(2)),
    };
  }

  // Parse FROM and JOINs
  const joinRegex = /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b/gi;
  const joinMatches: { type: string; index: number; len: number }[] = [];
  let jm: RegExpExecArray | null;
  while ((jm = joinRegex.exec(fromClause)) !== null) {
    joinMatches.push({ type: jm[1].toUpperCase(), index: jm.index, len: jm[1].length });
  }

  const parseTableRef = (ref: string) => {
    const clean = ref.trim();
    const m = /^([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?$/i.exec(clean);
    if (!m) throw new Error(`Invalid table reference: "${ref}"`);
    return { tableName: m[1], alias: m[2] };
  };

  const baseRefStr = joinMatches.length > 0 ? fromClause.slice(0, joinMatches[0].index).trim() : fromClause;
  const baseRef = parseTableRef(baseRefStr);
  const baseTable = resolveTable(db, baseRef.tableName);

  const tableAliases: { table: TableSchema; alias?: string }[] = [
    { table: baseTable, alias: baseRef.alias },
  ];

  let workingRows: JoinedRecord[] = baseTable.rows.map((r) =>
    prefixRow(r, baseTable.name, baseRef.alias)
  );

  for (let i = 0; i < joinMatches.length; i++) {
    const curJoin = joinMatches[i];
    const endIdx = i + 1 < joinMatches.length ? joinMatches[i + 1].index : fromClause.length;
    const segment = fromClause.slice(curJoin.index + curJoin.len, endIdx).trim();

    const onParts = splitTopLevelKeyword(segment, 'ON');
    const joinRef = parseTableRef(onParts[0]);
    const joinTable = resolveTable(db, joinRef.tableName);
    const onCondition = onParts[1]?.trim() || '';
    tableAliases.push({ table: joinTable, alias: joinRef.alias });

    const joinType = curJoin.type;
    const nextRows: JoinedRecord[] = [];
    const nullRightRecord: JoinedRecord = {};
    for (const col of joinTable.columns) {
      nullRightRecord[`${joinTable.name}.${col.name}`] = null;
      if (joinRef.alias) nullRightRecord[`${joinRef.alias}.${col.name}`] = null;
    }

    if (joinType.startsWith('RIGHT')) {
      for (const rRow of joinTable.rows) {
        const rightPrefixed = prefixRow(rRow, joinTable.name, joinRef.alias);
        let matchedAny = false;
        for (const lRec of workingRows) {
          const combined: JoinedRecord = { ...lRec, ...rightPrefixed };
          if (!onCondition || evaluateCondition(onCondition, combined, db)) {
            nextRows.push(combined);
            matchedAny = true;
          }
        }
        if (!matchedAny) {
          nextRows.push({ ...rightPrefixed });
        }
      }
    } else {
      for (const lRec of workingRows) {
        let matchedAny = false;
        for (const rRow of joinTable.rows) {
          const rightPrefixed = prefixRow(rRow, joinTable.name, joinRef.alias);
          const combined: JoinedRecord = { ...lRec, ...rightPrefixed };
          if (joinType.startsWith('CROSS') || !onCondition || evaluateCondition(onCondition, combined, db)) {
            nextRows.push(combined);
            matchedAny = true;
          }
        }
        if (!matchedAny && joinType.startsWith('LEFT')) {
          nextRows.push({ ...lRec, ...nullRightRecord });
        }
      }
    }
    workingRows = nextRows;
  }

  // WHERE filter
  if (sections['WHERE']) {
    workingRows = workingRows.filter((rec) => evaluateCondition(sections['WHERE'], rec, db));
  }

  // SELECT expressions
  const rawSelectItems = splitTopLevel(selectClause, ',');
  const hasAggregateInSelect = rawSelectItems.some((item) =>
    /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(item)
  );

  // GROUP BY / Aggregation
  interface RowGroup {
    rep: JoinedRecord;
    rows: JoinedRecord[];
  }

  let groups: RowGroup[];
  if (sections['GROUP BY']) {
    const groupCols = splitTopLevel(sections['GROUP BY'], ',');
    const groupMap = new Map<string, RowGroup>();
    for (const rec of workingRows) {
      const key = JSON.stringify(groupCols.map((c) => getColumnValue(rec, c)));
      const existing = groupMap.get(key);
      if (existing) existing.rows.push(rec);
      else groupMap.set(key, { rep: rec, rows: [rec] });
    }
    groups = Array.from(groupMap.values());
  } else if (hasAggregateInSelect) {
    groups = workingRows.length > 0 ? [{ rep: workingRows[0], rows: workingRows }] : [{ rep: {}, rows: [] }];
  } else {
    groups = workingRows.map((rec) => ({ rep: rec, rows: [rec] }));
  }

  // HAVING filter
  if (sections['HAVING']) {
    groups = groups.filter((g) => evaluateCondition(sections['HAVING'], g.rep, db, g.rows));
  }

  // Project columns
  const columnNames: string[] = [];
  interface ProjectedItem {
    row: SqlRow;
    group: RowGroup;
  }
  const projected: ProjectedItem[] = [];

  for (const g of groups) {
    const outRow: SqlRow = {};
    const currentColNames: string[] = [];

    for (const item of rawSelectItems) {
      if (item === '*') {
        for (const ta of tableAliases) {
          for (const col of ta.table.columns) {
            const label = tableAliases.length > 1 && col.name in outRow ? `${ta.table.name}.${col.name}` : col.name;
            if (projected.length === 0) currentColNames.push(label);
            outRow[label] = getColumnValue(g.rep, `${ta.alias || ta.table.name}.${col.name}`);
          }
        }
        continue;
      }

      const starAliasMatch = /^([a-zA-Z_][a-zA-Z0-9_]*)\.\*$/.exec(item);
      if (starAliasMatch) {
        const target = starAliasMatch[1].toLowerCase();
        const foundTa = tableAliases.find(
          (ta) => ta.table.name.toLowerCase() === target || ta.alias?.toLowerCase() === target
        );
        if (!foundTa) throw new Error(`Unknown table alias "${starAliasMatch[1]}" in SELECT.`);
        for (const col of foundTa.table.columns) {
          if (projected.length === 0) currentColNames.push(col.name);
          outRow[col.name] = getColumnValue(g.rep, `${foundTa.alias || foundTa.table.name}.${col.name}`);
        }
        continue;
      }

      const asMatch = /^([\s\S]+?)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i.exec(item);
      const expr = asMatch ? asMatch[1].trim() : item.trim();
      const defaultLabel = expr.includes('.') && !expr.includes('(') ? expr.split('.').pop()! : expr;
      const label = asMatch ? asMatch[2].trim() : defaultLabel;

      if (projected.length === 0) currentColNames.push(label);
      outRow[label] = parseLiteralOrColumn(expr, g.rep, db, g.rows);
    }

    if (columnNames.length === 0) {
      columnNames.push(...currentColNames);
    }
    projected.push({ row: outRow, group: g });
  }

  // If 0 rows matched, still compute headers cleanly
  if (columnNames.length === 0) {
    for (const item of rawSelectItems) {
      if (item === '*') {
        for (const ta of tableAliases) {
          for (const col of ta.table.columns) columnNames.push(col.name);
        }
      } else {
        const asMatch = /^([\s\S]+?)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i.exec(item);
        const expr = asMatch ? asMatch[1].trim() : item.trim();
        columnNames.push(asMatch ? asMatch[2].trim() : expr.includes('.') && !expr.includes('(') ? expr.split('.').pop()! : expr);
      }
    }
  }

  // ORDER BY
  if (sections['ORDER BY']) {
    const orderSpecs = splitTopLevel(sections['ORDER BY'], ',').map((spec) => {
      const m = /^([\s\S]+?)\s+(ASC|DESC)$/i.exec(spec);
      return {
        expr: m ? m[1].trim() : spec.trim(),
        dir: m && m[2].toUpperCase() === 'DESC' ? -1 : 1,
      };
    });

    projected.sort((a, b) => {
      for (const spec of orderSpecs) {
        const va =
          spec.expr in a.row
            ? a.row[spec.expr]
            : parseLiteralOrColumn(spec.expr, a.group.rep, db, a.group.rows);
        const vb =
          spec.expr in b.row
            ? b.row[spec.expr]
            : parseLiteralOrColumn(spec.expr, b.group.rep, db, b.group.rows);
        if (va === vb) continue;
        if (va === null) return 1;
        if (vb === null) return -1;
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * spec.dir;
        }
        return String(va).localeCompare(String(vb)) * spec.dir;
      }
      return 0;
    });
  }

  let finalRows = projected.map((p) => p.row);

  // DISTINCT
  if (distinct) {
    const seen = new Set<string>();
    finalRows = finalRows.filter((row) => {
      const key = JSON.stringify(columnNames.map((c) => row[c]));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // OFFSET & LIMIT
  const offset = sections['OFFSET'] ? Math.max(0, parseInt(sections['OFFSET'], 10) || 0) : 0;
  const limit = sections['LIMIT'] ? Math.max(0, parseInt(sections['LIMIT'], 10)) : undefined;
  if (offset > 0 || limit !== undefined) {
    finalRows = finalRows.slice(offset, limit !== undefined ? offset + limit : undefined);
  }

  return {
    columns: columnNames,
    rows: finalRows,
    elapsedMs: Number((performance.now() - start).toFixed(2)),
  };
}

function executeSqlStatement(
  rawSql: string,
  db: Record<string, TableSchema>
): { result: SqlExecResult; nextDb: Record<string, TableSchema> } {
  const start = performance.now();
  const cleanSql = stripSqlComments(rawSql).replace(/;+\s*$/, '');
  if (!cleanSql) {
    throw new Error('Please enter a SQL statement to execute.');
  }

  const firstWord = cleanSql.split(/\s+/)[0].toUpperCase();

  if (firstWord === 'SELECT') {
    return { result: executeSelect(cleanSql, db), nextDb: db };
  }

  if (firstWord === 'INSERT') {
    const m = /^INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)$/i.exec(cleanSql);
    if (!m) {
      throw new Error('INSERT syntax: INSERT INTO TableName (col1, col2) VALUES (val1, val2);');
    }
    const table = resolveTable(db, m[1]);
    const cols = splitTopLevel(m[2], ',').map((c) => c.trim());
    const vals = splitTopLevel(m[3], ',').map((v) => parseLiteralOrColumn(v, {}, db));
    if (cols.length !== vals.length) {
      throw new Error(`Column count (${cols.length}) does not match value count (${vals.length}).`);
    }
    const newRow: SqlRow = {};
    for (const col of table.columns) newRow[col.name] = null;
    cols.forEach((c, idx) => {
      newRow[c] = vals[idx];
    });
    const nextDb = {
      ...db,
      [table.name]: { ...table, rows: [...table.rows, newRow] },
    };
    return {
      nextDb,
      result: {
        columns: table.columns.map((c) => c.name),
        rows: [newRow],
        affectedRows: 1,
        message: `Inserted 1 row into ${table.name}.`,
        elapsedMs: Number((performance.now() - start).toFixed(2)),
      },
    };
  }

  if (firstWord === 'UPDATE') {
    const m = /^UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i.exec(cleanSql);
    if (!m) throw new Error('UPDATE syntax: UPDATE TableName SET col = val WHERE condition;');
    const table = resolveTable(db, m[1]);
    const assignments = splitTopLevel(m[2], ',').map((a) => {
      const idx = a.indexOf('=');
      if (idx < 0) throw new Error(`Invalid SET assignment: "${a}"`);
      return { col: a.slice(0, idx).trim(), valExpr: a.slice(idx + 1).trim() };
    });
    const whereClause = m[3]?.trim() || '';
    let affected = 0;
    const updatedRows = table.rows.map((r) => {
      const rec = prefixRow(r, table.name);
      if (!whereClause || evaluateCondition(whereClause, rec, db)) {
        affected++;
        const copy = { ...r };
        for (const a of assignments) {
          copy[a.col] = parseLiteralOrColumn(a.valExpr, rec, db);
        }
        return copy;
      }
      return r;
    });
    const nextDb = {
      ...db,
      [table.name]: { ...table, rows: updatedRows },
    };
    return {
      nextDb,
      result: {
        columns: [],
        rows: [],
        affectedRows: affected,
        message: `Updated ${affected} row${affected === 1 ? '' : 's'} in ${table.name}.`,
        elapsedMs: Number((performance.now() - start).toFixed(2)),
      },
    };
  }

  if (firstWord === 'DELETE') {
    const m = /^DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+WHERE\s+([\s\S]+))?$/i.exec(cleanSql);
    if (!m) throw new Error('DELETE syntax: DELETE FROM TableName WHERE condition;');
    const table = resolveTable(db, m[1]);
    const whereClause = m[2]?.trim() || '';
    const remaining: SqlRow[] = [];
    let removed = 0;
    for (const r of table.rows) {
      const rec = prefixRow(r, table.name);
      if (!whereClause || evaluateCondition(whereClause, rec, db)) {
        removed++;
      } else {
        remaining.push(r);
      }
    }
    const nextDb = {
      ...db,
      [table.name]: { ...table, rows: remaining },
    };
    return {
      nextDb,
      result: {
        columns: [],
        rows: [],
        affectedRows: removed,
        message: `Deleted ${removed} row${removed === 1 ? '' : 's'} from ${table.name}.`,
        elapsedMs: Number((performance.now() - start).toFixed(2)),
      },
    };
  }

  throw new Error(
    `Unsupported statement "${firstWord}". Supported commands: SELECT, INSERT INTO, UPDATE, DELETE FROM.`
  );
}

function toCsvString(columns: string[], rows: SqlRow[]): string {
  const escape = (val: SqlPrimitive) => {
    const str = val === null || val === undefined ? '' : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = columns.map(escape).join(',');
  const body = rows.map((row) => columns.map((c) => escape(row[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export default function SqlPlaygroundTool() {
  const [database, setDatabase] = useState<Record<string, TableSchema>>(() =>
    createInitialUniversityDatabase()
  );
  const [query, setQuery] = useState<string>(SAMPLE_QUERIES[0].sql);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SqlExecResult>(() =>
    executeSelect(SAMPLE_QUERIES[0].sql, createInitialUniversityDatabase())
  );

  const runCurrentQuery = (overrideSql?: string) => {
    const sqlToRun = overrideSql ?? query;
    try {
      setError(null);
      const { result: execRes, nextDb } = executeSqlStatement(sqlToRun, database);
      setDatabase(nextDb);
      setResult(execRes);
    } catch (err: any) {
      setError(err?.message || 'SQL syntax or execution error.');
    }
  };

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'sql-playground') return;
      const idx = Math.max(0, Math.min(SAMPLE_QUERIES.length - 1, ce.detail?.presetIndex ?? 0));
      const targetSql = SAMPLE_QUERIES[idx].sql;
      setQuery(targetSql);
      setError(null);
      const { result: execRes, nextDb } = executeSqlStatement(targetSql, database);
      setDatabase(nextDb);
      setResult(execRes);
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, [database]);

  const handleResetDb = () => {
    const fresh = createInitialUniversityDatabase();
    setDatabase(fresh);
    setError(null);
    setResult(executeSelect(SAMPLE_QUERIES[0].sql, fresh));
    setQuery(SAMPLE_QUERIES[0].sql);
  };

  const handleDownloadCsv = () => {
    if (!result.columns.length) return;
    const csv = toCsvString(result.columns, result.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sql-query-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tableList = useMemo(() => Object.values(database), [database]);

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="Client-Side SQL Query Playground"
        category="Databases & Web"
        description="Execute relational SQL queries (JOIN, GROUP BY, HAVING, subqueries, aggregates) locally against pre-loaded university tables."
        onLoadSample={() => {
          setQuery(SAMPLE_QUERIES[0].sql);
          runCurrentQuery(SAMPLE_QUERIES[0].sql);
        }}
        onCopyOutput={() =>
          result.columns.length > 0 ? toCsvString(result.columns, result.rows) : result.message || ''
        }
        copyLabel="Copy CSV"
        onClear={() => {
          setQuery('');
          setError(null);
        }}
        extraActions={
          <button
            type="button"
            onClick={handleResetDb}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset DB</span>
          </button>
        }
      />

      {/* Sample Query Presets */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600">
          Clickable University Assignment Sample Queries
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((sq) => (
            <button
              key={sq.id}
              type="button"
              onClick={() => {
                setQuery(sq.sql);
                runCurrentQuery(sq.sql);
              }}
              className="px-3 py-2 rounded-lg bg-orange-50/70 hover:bg-orange-100 border border-orange-200 text-xs font-semibold text-slate-800 hover:text-orange-800 transition-colors cursor-pointer text-left"
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Workspace: Schema Sidebar + SQL Editor & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Schema Viewer Sidebar */}
        <aside className="lg:col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Database className="w-4 h-4 text-orange-600" />
              <span>Database Schema</span>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {tableList.length} tables
            </span>
          </div>

          <div className="space-y-3">
            {tableList.map((tbl) => (
              <div
                key={tbl.name}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const inspectSql = `SELECT * FROM ${tbl.name};`;
                      setQuery(inspectSql);
                      runCurrentQuery(inspectSql);
                    }}
                    className="font-mono text-xs font-bold hover:text-orange-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={`Preview all rows from ${tbl.name}`}
                  >
                    <TableIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>{tbl.name}</span>
                  </button>
                  <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                    {tbl.rows.length} rows
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {tbl.columns.map((col) => (
                    <li
                      key={col.name}
                      className="px-3 py-1.5 flex items-center justify-between text-xs font-mono"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setQuery((prev) =>
                            prev ? `${prev}${prev.endsWith(' ') ? '' : ' '}${col.name}` : col.name
                          )
                        }
                        className="text-slate-800 hover:text-orange-600 cursor-pointer text-left"
                        title={`Insert ${col.name}`}
                      >
                        {col.name}
                        {col.key && (
                          <span className="ml-1.5 text-[10px] font-bold text-orange-700">
                            {col.key}
                          </span>
                        )}
                      </button>
                      <span className="text-[11px] text-slate-400">{col.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Column: Editor & Output Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="sql-editor-textarea" className="text-xs font-semibold text-slate-700">
                SQL Query Editor
              </label>
              <span className="text-xs text-slate-500">
                Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Ctrl+Enter</kbd> to run
              </span>
            </div>
            <textarea
              id="sql-editor-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  runCurrentQuery();
                }
              }}
              rows={7}
              spellCheck={false}
              placeholder="SELECT * FROM Students WHERE gpa >= 3.7 ORDER BY gpa DESC;"
              className="w-full rounded-xl border border-slate-300 bg-slate-950 text-slate-100 font-mono text-sm p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => runCurrentQuery()}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Query</span>
              </button>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>{result.elapsedMs} ms</span>
                </span>
                <span>{result.rows.length} row{result.rows.length === 1 ? '' : 's'} returned</span>
                {result.columns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-sans font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Inline Error State */}
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">SQL Execution Error</div>
                <p className="text-xs font-mono mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Mutation Confirmation */}
          {!error && result.message && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800">
              {result.message}
            </div>
          )}

          {/* Result Table */}
          {!error && result.columns.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {result.columns.map((col, idx) => (
                        <th
                          key={`${col}-${idx}`}
                          className="px-3.5 py-2.5 font-bold text-slate-700 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={result.columns.length}
                          className="px-4 py-8 text-center text-slate-500 font-sans"
                        >
                          Query executed successfully with 0 matching rows.
                        </td>
                      </tr>
                    ) : (
                      result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-orange-50/40 transition-colors">
                          {result.columns.map((col, cIdx) => {
                            const val = row[col];
                            return (
                              <td
                                key={`${rIdx}-${cIdx}`}
                                className="px-3.5 py-2.5 text-slate-800 whitespace-nowrap"
                              >
                                {val === null || val === undefined ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
