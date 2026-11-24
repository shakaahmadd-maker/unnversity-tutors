import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Play,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

type DsMode = 'bst' | 'stack' | 'queue';
type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'bfs';

interface BstNode {
  val: number;
  left: BstNode | null;
  right: BstNode | null;
}

function insertBst(root: BstNode | null, val: number): { node: BstNode; inserted: boolean } {
  if (!root) return { node: { val, left: null, right: null }, inserted: true };
  if (val === root.val) return { node: root, inserted: false };
  if (val < root.val) {
    const res = insertBst(root.left, val);
    return { node: { ...root, left: res.node }, inserted: res.inserted };
  }
  const res = insertBst(root.right, val);
  return { node: { ...root, right: res.node }, inserted: res.inserted };
}

function findMinNode(node: BstNode): BstNode {
  let cur = node;
  while (cur.left) cur = cur.left;
  return cur;
}

function deleteBst(root: BstNode | null, val: number): { node: BstNode | null; deleted: boolean } {
  if (!root) return { node: null, deleted: false };
  if (val < root.val) {
    const res = deleteBst(root.left, val);
    return { node: { ...root, left: res.node }, deleted: res.deleted };
  }
  if (val > root.val) {
    const res = deleteBst(root.right, val);
    return { node: { ...root, right: res.node }, deleted: res.deleted };
  }
  if (!root.left) return { node: root.right, deleted: true };
  if (!root.right) return { node: root.left, deleted: true };
  const successor = findMinNode(root.right);
  const res = deleteBst(root.right, successor.val);
  return {
    node: { val: successor.val, left: root.left, right: res.node },
    deleted: true,
  };
}

function searchBstPath(root: BstNode | null, target: number): { path: number[]; found: boolean } {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (cur.val === target) return { path, found: true };
    cur = target < cur.val ? cur.left : cur.right;
  }
  return { path, found: false };
}

function traverseBst(root: BstNode | null, type: TraversalType): number[] {
  if (!root) return [];
  const out: number[] = [];
  if (type === 'bfs') {
    const q: BstNode[] = [root];
    while (q.length > 0) {
      const n = q.shift()!;
      out.push(n.val);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }
  const dfs = (n: BstNode | null) => {
    if (!n) return;
    if (type === 'preorder') out.push(n.val);
    dfs(n.left);
    if (type === 'inorder') out.push(n.val);
    dfs(n.right);
    if (type === 'postorder') out.push(n.val);
  };
  dfs(root);
  return out;
}

function buildSampleBst(): BstNode | null {
  let root: BstNode | null = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80, 35, 65]) {
    root = insertBst(root, v).node;
  }
  return root;
}

interface PositionedNode {
  val: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function layoutBst(root: BstNode | null): { nodes: PositionedNode[]; width: number; height: number } {
  if (!root) return { nodes: [], width: 640, height: 280 };
  const nodes: PositionedNode[] = [];
  let maxDepth = 0;

  const visit = (node: BstNode, depth: number, minX: number, maxX: number, pX?: number, pY?: number) => {
    maxDepth = Math.max(maxDepth, depth);
    const x = (minX + maxX) / 2;
    const y = 42 + depth * 68;
    nodes.push({ val: node.val, x, y, parentX: pX, parentY: pY });
    if (node.left) visit(node.left, depth + 1, minX, x, x, y);
    if (node.right) visit(node.right, depth + 1, x, maxX, x, y);
  };

  const width = 760;
  visit(root, 0, 24, width - 24);
  return { nodes, width, height: Math.max(260, (maxDepth + 1) * 68 + 44) };
}

export default function DataStructureVisualizerTool() {
  const [mode, setMode] = useState<DsMode>('bst');
  const [bstRoot, setBstRoot] = useState<BstNode | null>(() => buildSampleBst());
  const [stackItems, setStackItems] = useState<number[]>([15, 28, 42, 64]);
  const [queueItems, setQueueItems] = useState<number[]>([10, 25, 39, 51]);

  const [inputVal, setInputVal] = useState<string>('45');
  const [statusMessage, setStatusMessage] = useState<string>('Sample BST loaded with 9 nodes.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animation state for BST traversal / search
  const [animSequence, setAnimSequence] = useState<number[]>([]);
  const [animLabel, setAnimLabel] = useState<string>('');
  const [animIndex, setAnimIndex] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (!isAnimating) return;
    if (animIndex >= animSequence.length - 1) {
      setIsAnimating(false);
      return;
    }
    const t = window.setTimeout(() => {
      setAnimIndex((prev) => prev + 1);
    }, 520);
    return () => window.clearTimeout(t);
  }, [isAnimating, animIndex, animSequence.length]);

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'data-structure-visualizer') return;
      setIsAnimating(false);
      setAnimSequence([]);
      setAnimIndex(-1);
      setErrorMsg(null);
      if (ce.detail?.presetIndex === 1) {
        setMode('stack');
        setStackItems([15, 28, 42, 64]);
        setStatusMessage('Loaded LIFO Call-Stack sample [15, 28, 42, 64].');
      } else {
        setMode('bst');
        setBstRoot(buildSampleBst());
        setStatusMessage('Loaded balanced 9-node BST index sample.');
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const treeLayout = useMemo(() => layoutBst(bstRoot), [bstRoot]);

  const parseInputInt = (): number | null => {
    const trimmed = inputVal.trim();
    if (!trimmed || !/^-?\d+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid integer (e.g., 45).');
      return null;
    }
    setErrorMsg(null);
    return parseInt(trimmed, 10);
  };

  const handleInsert = () => {
    const num = parseInputInt();
    if (num === null) return;
    setIsAnimating(false);
    setAnimSequence([]);
    setAnimIndex(-1);

    if (mode === 'bst') {
      const res = insertBst(bstRoot, num);
      setBstRoot(res.node);
      setStatusMessage(
        res.inserted
          ? `Inserted ${num} into the Binary Search Tree.`
          : `Value ${num} already exists in the BST (duplicates ignored).`
      );
    } else if (mode === 'stack') {
      if (stackItems.length >= 12) {
        setErrorMsg('Stack capacity limit (12 items) reached for visual clarity.');
        return;
      }
      setStackItems((prev) => [...prev, num]);
      setStatusMessage(`Pushed ${num} onto the TOP of the stack (O(1)).`);
    } else {
      if (queueItems.length >= 12) {
        setErrorMsg('Queue capacity limit (12 items) reached for visual clarity.');
        return;
      }
      setQueueItems((prev) => [...prev, num]);
      setStatusMessage(`Enqueued ${num} at the REAR of the queue (O(1)).`);
    }
  };

  const handleDelete = () => {
    setIsAnimating(false);
    setAnimSequence([]);
    setAnimIndex(-1);
    setErrorMsg(null);

    if (mode === 'bst') {
      const num = parseInputInt();
      if (num === null) return;
      const res = deleteBst(bstRoot, num);
      setBstRoot(res.node);
      setStatusMessage(
        res.deleted
          ? `Deleted ${num} from the BST while preserving the ordering invariant.`
          : `Node ${num} was not found in the BST.`
      );
    } else if (mode === 'stack') {
      if (stackItems.length === 0) {
        setErrorMsg('Stack Underflow: Stack is already empty.');
        return;
      }
      const popped = stackItems[stackItems.length - 1];
      setStackItems((prev) => prev.slice(0, -1));
      setStatusMessage(`Popped ${popped} from the TOP of the stack (LIFO).`);
    } else {
      if (queueItems.length === 0) {
        setErrorMsg('Queue Underflow: Queue is already empty.');
        return;
      }
      const removed = queueItems[0];
      setQueueItems((prev) => prev.slice(1));
      setStatusMessage(`Dequeued ${removed} from the FRONT of the queue (FIFO).`);
    }
  };

  const handleSearch = () => {
    const num = parseInputInt();
    if (num === null) return;

    if (mode === 'bst') {
      const { path, found } = searchBstPath(bstRoot, num);
      setAnimSequence(path);
      setAnimLabel(found ? `Search Found (${num})` : `Search Path (${num} not found)`);
      setAnimIndex(path.length > 0 ? 0 : -1);
      setIsAnimating(path.length > 1);
      setStatusMessage(
        found
          ? `Found ${num} in ${path.length} step${path.length === 1 ? '' : 's'}: ${path.join(' -> ')}.`
          : `${num} not found. Visited path: ${path.length ? path.join(' -> ') : 'empty tree'}.`
      );
    } else if (mode === 'stack') {
      const idx = stackItems.lastIndexOf(num);
      setStatusMessage(
        idx >= 0
          ? `Found ${num} at stack index ${idx} (${stackItems.length - 1 - idx} pop(s) from TOP).`
          : `${num} is not in the stack.`
      );
    } else {
      const idx = queueItems.indexOf(num);
      setStatusMessage(
        idx >= 0
          ? `Found ${num} at queue position ${idx} (${idx} dequeue(s) from FRONT).`
          : `${num} is not in the queue.`
      );
    }
  };

  const runTraversal = (type: TraversalType) => {
    if (!bstRoot) {
      setErrorMsg('Tree is empty. Insert nodes or load the sample tree first.');
      return;
    }
    setErrorMsg(null);
    const seq = traverseBst(bstRoot, type);
    const labels: Record<TraversalType, string> = {
      inorder: 'In-Order (Left → Root → Right)',
      preorder: 'Pre-Order (Root → Left → Right)',
      postorder: 'Post-Order (Left → Right → Root)',
      bfs: 'Level-Order (Breadth-First Search)',
    };
    setAnimSequence(seq);
    setAnimLabel(labels[type]);
    setAnimIndex(0);
    setIsAnimating(seq.length > 1);
    setStatusMessage(`Running ${labels[type]} across ${seq.length} nodes.`);
  };

  const visitedSoFar = animIndex >= 0 ? animSequence.slice(0, animIndex + 1) : [];
  const activeNodeVal = animIndex >= 0 ? animSequence[animIndex] : null;

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="Data Structure & Binary Search Tree (BST) Explorer"
        category="Algorithms & Data Structures"
        description="Build and inspect a Binary Search Tree, Stack (LIFO), or Queue (FIFO) interactively with animated In-Order, Pre-Order, Post-Order, and BFS traversals."
        onLoadSample={() => {
          setErrorMsg(null);
          setIsAnimating(false);
          setAnimSequence([]);
          setAnimIndex(-1);
          if (mode === 'bst') {
            setBstRoot(buildSampleBst());
            setStatusMessage('Loaded balanced 9-node sample BST.');
          } else if (mode === 'stack') {
            setStackItems([15, 28, 42, 64]);
            setStatusMessage('Loaded sample Stack [15, 28, 42, 64].');
          } else {
            setQueueItems([10, 25, 39, 51]);
            setStatusMessage('Loaded sample Queue [10, 25, 39, 51].');
          }
        }}
        onCopyOutput={() => {
          if (mode === 'bst') {
            return `BST Traversals:\nIn-Order: [${traverseBst(bstRoot, 'inorder').join(', ')}]\nPre-Order: [${traverseBst(bstRoot, 'preorder').join(', ')}]\nPost-Order: [${traverseBst(bstRoot, 'postorder').join(', ')}]\nLevel-Order (BFS): [${traverseBst(bstRoot, 'bfs').join(', ')}]`;
          }
          if (mode === 'stack') return `Stack (bottom -> top): [${stackItems.join(', ')}]`;
          return `Queue (front -> rear): [${queueItems.join(', ')}]`;
        }}
        onClear={() => {
          setIsAnimating(false);
          setAnimSequence([]);
          setAnimIndex(-1);
          setErrorMsg(null);
          if (mode === 'bst') setBstRoot(null);
          else if (mode === 'stack') setStackItems([]);
          else setQueueItems([]);
          setStatusMessage(`Cleared ${mode.toUpperCase()}.`);
        }}
      />

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        {(
          [
            { id: 'bst', label: 'Binary Search Tree (BST)' },
            { id: 'stack', label: 'Stack (LIFO)' },
            { id: 'queue', label: 'Queue (FIFO)' },
          ] as { id: DsMode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id);
              setErrorMsg(null);
              setIsAnimating(false);
              setAnimSequence([]);
              setAnimIndex(-1);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === tab.id ? 'bg-orange-600 text-white' : 'text-slate-700 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-end gap-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="w-36 space-y-1">
          <label htmlFor="ds-node-input" className="text-xs font-semibold text-slate-700">
            Integer Value
          </label>
          <input
            id="ds-node-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert();
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="button"
          onClick={handleInsert}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{mode === 'bst' ? 'Insert Node' : mode === 'stack' ? 'Push' : 'Enqueue'}</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-300 text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{mode === 'bst' ? 'Delete Node' : mode === 'stack' ? 'Pop Top' : 'Dequeue Front'}</span>
        </button>

        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-white hover:bg-orange-50 text-slate-800 border border-slate-300 text-xs font-semibold cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-orange-600" />
          <span>Search</span>
        </button>

        {mode === 'bst' && (
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {(
              [
                { id: 'inorder', label: 'In-Order' },
                { id: 'preorder', label: 'Pre-Order' },
                { id: 'postorder', label: 'Post-Order' },
                { id: 'bfs', label: 'Level-Order (BFS)' },
              ] as { id: TraversalType; label: string }[]
            ).map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => runTraversal(tr.id)}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-800 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{tr.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status + Live Traversal Output */}
      <div className="rounded-xl bg-slate-900 text-slate-100 px-4 py-3 space-y-2 font-mono text-xs">
        <div className="text-slate-300">{statusMessage}</div>
        {mode === 'bst' && animSequence.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-orange-400 font-semibold">{animLabel}:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {visitedSoFar.map((v, idx) => (
                <span
                  key={`${v}-${idx}`}
                  className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                    idx === visitedSoFar.length - 1
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-emerald-300'
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive SVG / Visual Canvas */}
      {mode === 'bst' && (
        <div className="rounded-2xl border border-slate-200 bg-[#FAF6F0]/60 p-4 overflow-x-auto">
          {treeLayout.nodes.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-500">
              Tree is empty. Enter an integer above and click Insert Node.
            </div>
          ) : (
            <svg
              width={treeLayout.width}
              height={treeLayout.height}
              viewBox={`0 0 ${treeLayout.width} ${treeLayout.height}`}
              className="mx-auto block"
              role="img"
              aria-label="Binary Search Tree Visualization"
            >
              {/* Edges */}
              {treeLayout.nodes.map((node) =>
                node.parentX !== undefined && node.parentY !== undefined ? (
                  <line
                    key={`edge-${node.val}`}
                    x1={node.parentX}
                    y1={node.parentY}
                    x2={node.x}
                    y2={node.y}
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                ) : null
              )}

              {/* Nodes */}
              {treeLayout.nodes.map((node) => {
                const isActive = activeNodeVal === node.val;
                const isVisited = visitedSoFar.includes(node.val);
                return (
                  <g key={`node-${node.val}`} transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      r={20}
                      fill={isActive ? '#EA580C' : isVisited ? '#FFF7ED' : '#FFFFFF'}
                      stroke={isActive ? '#9A3412' : isVisited ? '#EA580C' : '#334155'}
                      strokeWidth={isActive ? '3' : '2'}
                    />
                    <text
                      y={4}
                      textAnchor="middle"
                      className={`font-mono font-bold ${
                        isActive ? 'fill-white' : isVisited ? 'fill-orange-800' : 'fill-slate-900'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      {node.val}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      )}

      {mode === 'stack' && (
        <div className="rounded-2xl border border-slate-200 bg-[#FAF6F0]/60 p-6 flex flex-col items-center">
          <div className="text-xs font-mono text-slate-500 mb-3">
            TOP OF STACK (LIFO · Size: {stackItems.length})
          </div>
          <div className="w-64 min-h-[220px] border-x-2 border-b-2 border-slate-400 rounded-b-xl p-3 flex flex-col-reverse gap-2 bg-white">
            {stackItems.length === 0 ? (
              <div className="my-auto text-center text-xs text-slate-400">Empty Stack</div>
            ) : (
              stackItems.map((val, idx) => {
                const isTop = idx === stackItems.length - 1;
                return (
                  <div
                    key={`${idx}-${val}`}
                    className={`w-full py-2.5 px-4 rounded-lg border font-mono text-sm font-bold flex items-center justify-between tabular-nums ${
                      isTop
                        ? 'bg-orange-600 text-white border-orange-700'
                        : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <span>{val}</span>
                    <span className={`text-[10px] ${isTop ? 'text-orange-100' : 'text-slate-400'}`}>
                      {isTop ? 'TOP' : `[${idx}]`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {mode === 'queue' && (
        <div className="rounded-2xl border border-slate-200 bg-[#FAF6F0]/60 p-6 space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>FRONT (Dequeue) &larr;</span>
            <span>Queue Size: {queueItems.length}</span>
            <span>&larr; REAR (Enqueue)</span>
          </div>
          <div className="min-h-[96px] border-y-2 border-slate-400 py-3 px-2 flex items-center gap-2.5 bg-white">
            {queueItems.length === 0 ? (
              <div className="mx-auto text-xs text-slate-400">Empty Queue</div>
            ) : (
              queueItems.map((val, idx) => {
                const isFront = idx === 0;
                const isRear = idx === queueItems.length - 1;
                return (
                  <div
                    key={`${idx}-${val}`}
                    className={`min-w-[74px] py-3 px-4 rounded-xl border font-mono text-center tabular-nums ${
                      isFront
                        ? 'bg-orange-600 text-white border-orange-700'
                        : isRear
                        ? 'bg-orange-50 text-orange-800 border-orange-300'
                        : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold">{val}</div>
                    <div className={`text-[10px] mt-0.5 ${isFront ? 'text-orange-100' : 'text-slate-500'}`}>
                      {isFront && isRear ? 'FRONT/REAR' : isFront ? 'FRONT' : isRear ? 'REAR' : `[${idx}]`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
