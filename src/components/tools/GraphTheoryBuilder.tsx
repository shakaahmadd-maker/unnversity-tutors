import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Download,
  FileDown,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Plus,
  Minus,
} from 'lucide-react';
import { downloadCanvasFigurePdf } from '../../utils/pdfReportGenerator';

export interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: number;
  from: number;
  to: number;
  weight: number;
}

type CanvasMode = 'select' | 'node' | 'edge' | 'delete';
type ViewMode = '2d' | '3d';
type RepTab = 'matrix' | 'list' | 'degrees';
type GeneratorCategory = 'parametric' | 'random' | 'presets';
type ParametricFamily = 'regular' | 'empty' | 'path' | 'cycle' | 'star' | 'wheel' | 'complete';
type RandomGraphModel =
  | 'erdos-renyi'
  | 'random-regular'
  | 'random-tree'
  | 'scale-free'
  | 'small-world'
  | 'random-dag';
type PresetType = 'weighted' | 'petersen' | 'bipartite' | 'dag' | 'hypercube' | 'octahedron';
type AlgorithmType = 'dijkstra' | 'mst' | 'bfs' | 'dfs' | 'toposort';

interface AlgoLogState {
  title: string;
  status: 'ready' | 'success' | 'warning';
  primaryLine: string;
  secondaryLine?: string;
}

interface GraphTheoryBuilderProps {
  onNavigate?: (view: string) => void;
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Pre-allocated Three.js math helpers at module scope (Zero GC inside render/build loops)
const _upAxis = new THREE.Vector3(0, 1, 0);
const _dirVec = new THREE.Vector3();
const _normVec = new THREE.Vector3();
const _midVec = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function disposeGroupChildren(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      } else if ((obj as THREE.Sprite).isSprite) {
        const sprite = obj as THREE.Sprite;
        const mat = sprite.material as THREE.SpriteMaterial;
        mat.map?.dispose();
        mat.dispose();
      }
    });
  }
}

function buildPresetData(
  type: PresetType,
  width: number,
  height: number
): { directed: boolean; nodes: GraphNode[]; edges: GraphEdge[] } {
  const cx = Math.max(240, width / 2);
  const cy = Math.max(210, height / 2);
  const scale = Math.min(1, Math.max(0.68, Math.min(width / 620, height / 460)));

  if (type === 'weighted') {
    const coords: [number, number][] = [
      [-160, -90],
      [0, -130],
      [160, -90],
      [-160, 90],
      [0, 130],
      [160, 90],
    ];
    const nodes: GraphNode[] = coords.map(([dx, dy], i) => ({
      id: i + 1,
      label: LABELS[i],
      x: Math.round(cx + dx * scale),
      y: Math.round(cy + dy * scale),
    }));
    const pairs: [number, number, number][] = [
      [1, 2, 4],
      [1, 4, 2],
      [2, 3, 5],
      [2, 4, 1],
      [2, 5, 8],
      [3, 5, 3],
      [3, 6, 6],
      [4, 5, 7],
      [5, 6, 2],
    ];
    const edges: GraphEdge[] = pairs.map(([from, to, weight], idx) => ({
      id: 100 + idx,
      from,
      to,
      weight,
    }));
    return { directed: false, nodes, edges };
  }

  if (type === 'petersen') {
    const rOuter = 165 * scale;
    const rInner = 82 * scale;
    const nodes: GraphNode[] = [];
    for (let i = 0; i < 5; i++) {
      const ang = (2 * Math.PI * i) / 5 - Math.PI / 2;
      nodes.push({
        id: i + 1,
        label: LABELS[i],
        x: Math.round(cx + rOuter * Math.cos(ang)),
        y: Math.round(cy + rOuter * Math.sin(ang)),
      });
    }
    for (let i = 0; i < 5; i++) {
      const ang = (2 * Math.PI * i) / 5 - Math.PI / 2;
      nodes.push({
        id: i + 6,
        label: LABELS[i + 5],
        x: Math.round(cx + rInner * Math.cos(ang)),
        y: Math.round(cy + rInner * Math.sin(ang)),
      });
    }
    const outerEdges: [number, number][] = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 1],
    ];
    const spokes: [number, number][] = [
      [1, 6],
      [2, 7],
      [3, 8],
      [4, 9],
      [5, 10],
    ];
    const starEdges: [number, number][] = [
      [6, 8],
      [8, 10],
      [10, 7],
      [7, 9],
      [9, 6],
    ];
    const edges: GraphEdge[] = [...outerEdges, ...spokes, ...starEdges].map(([from, to], idx) => ({
      id: 200 + idx,
      from,
      to,
      weight: 1,
    }));
    return { directed: false, nodes, edges };
  }

  if (type === 'bipartite') {
    const nodes: GraphNode[] = [];
    [-110, 0, 110].forEach((dy, i) =>
      nodes.push({
        id: i + 1,
        label: LABELS[i],
        x: Math.round(cx - 130 * scale),
        y: Math.round(cy + dy * scale),
      })
    );
    [-110, 0, 110].forEach((dy, i) =>
      nodes.push({
        id: i + 4,
        label: LABELS[i + 3],
        x: Math.round(cx + 130 * scale),
        y: Math.round(cy + dy * scale),
      })
    );
    const edges: GraphEdge[] = [];
    let idx = 0;
    for (let i = 1; i <= 3; i++) {
      for (let j = 4; j <= 6; j++) {
        edges.push({
          id: 300 + idx++,
          from: i,
          to: j,
          weight: ((i + j) % 7) + 1,
        });
      }
    }
    return { directed: false, nodes, edges };
  }

  if (type === 'hypercube') {
    const outerR = 160 * scale;
    const innerR = 76 * scale;
    const nodes: GraphNode[] = [];
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI / 2) * i - Math.PI / 4;
      nodes.push({
        id: i + 1,
        label: LABELS[i],
        x: Math.round(cx + outerR * Math.cos(ang)),
        y: Math.round(cy + outerR * Math.sin(ang)),
      });
    }
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI / 2) * i - Math.PI / 4;
      nodes.push({
        id: i + 5,
        label: LABELS[i + 4],
        x: Math.round(cx + innerR * Math.cos(ang)),
        y: Math.round(cy + innerR * Math.sin(ang)),
      });
    }
    const pairs: [number, number][] = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 5],
      [1, 5],
      [2, 6],
      [3, 7],
      [4, 8],
    ];
    const edges: GraphEdge[] = pairs.map(([from, to], idx) => ({
      id: 450 + idx,
      from,
      to,
      weight: ((idx % 6) + 1),
    }));
    return { directed: false, nodes, edges };
  }

  if (type === 'octahedron') {
    const r = 155 * scale;
    const nodes: GraphNode[] = Array.from({ length: 6 }, (_, i) => {
      const ang = (2 * Math.PI * i) / 6 - Math.PI / 2;
      return {
        id: i + 1,
        label: LABELS[i],
        x: Math.round(cx + r * Math.cos(ang)),
        y: Math.round(cy + r * Math.sin(ang)),
      };
    });
    const edges: GraphEdge[] = [];
    let idx = 0;
    // Octahedron is K_{2,2,2}: complete graph minus 3 opposite antipodal pairs (1-4, 2-5, 3-6)
    for (let i = 1; i <= 6; i++) {
      for (let j = i + 1; j <= 6; j++) {
        if (j - i === 3) continue;
        edges.push({
          id: 480 + idx++,
          from: i,
          to: j,
          weight: ((i + j) % 8) + 1,
        });
      }
    }
    return { directed: false, nodes, edges };
  }

  // Directed DAG preset
  const pos: [number, number][] = [
    [-180, 0],
    [-60, -100],
    [-60, 100],
    [70, -100],
    [70, 100],
    [190, 0],
  ];
  const nodes: GraphNode[] = pos.map(([dx, dy], i) => ({
    id: i + 1,
    label: LABELS[i],
    x: Math.round(cx + dx * scale),
    y: Math.round(cy + dy * scale),
  }));
  const dagPairs: [number, number, number][] = [
    [1, 2, 3],
    [1, 3, 6],
    [2, 4, 4],
    [2, 5, 2],
    [3, 5, 5],
    [4, 6, 3],
    [5, 6, 4],
  ];
  const edges: GraphEdge[] = dagPairs.map(([from, to, weight], idx) => ({
    id: 400 + idx,
    from,
    to,
    weight,
  }));
  return { directed: true, nodes, edges };
}

function getVertexLabelByIndex(index: number): string {
  return index < LABELS.length ? LABELS[index] : `V${index + 1}`;
}

function createCircularNodes(count: number, width: number, height: number, jitterPx = 0): GraphNode[] {
  const n = Math.max(2, Math.min(20, count));
  const cx = Math.max(220, width / 2);
  const cy = Math.max(195, height / 2);
  const radiusFactor = n > 14 ? 0.78 : n > 9 ? 0.74 : 0.68;
  const radius = Math.min(cx, cy) * radiusFactor;

  return Array.from({ length: n }, (_, i) => {
    const ang = (2 * Math.PI * i) / n - Math.PI / 2;
    const jx = jitterPx > 0 ? (Math.random() - 0.5) * 2 * jitterPx : 0;
    const jy = jitterPx > 0 ? (Math.random() - 0.5) * 2 * jitterPx : 0;
    return {
      id: i + 1,
      label: getVertexLabelByIndex(i),
      x: Math.round(Math.max(30, Math.min(width - 30, cx + radius * Math.cos(ang) + jx))),
      y: Math.round(Math.max(30, Math.min(height - 30, cy + radius * Math.sin(ang) + jy))),
    };
  });
}

/**
 * Exact symmetric circulant / bounded-degree constructor for 0 <= k <= n - 1.
 * Achieves exact k-regularity whenever n*k is even; when both n and k are odd,
 * achieves (n - 1) vertices of degree k and 1 vertex of degree k - 1 (maximum possible by Handshaking Lemma).
 */
function buildRegularEdgePairs(n: number, targetK: number, order: number[]): [number, number][] {
  const k = Math.max(0, Math.min(n - 1, targetK));
  if (n < 2 || k === 0) return [];

  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  const addUndirected = (uIdx: number, vIdx: number) => {
    if (uIdx === vIdx) return;
    const a = order[uIdx];
    const b = order[vIdx];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push([a, b]);
    }
  };

  const halfSteps = Math.floor(k / 2);
  for (let step = 1; step <= halfSteps; step++) {
    for (let i = 0; i < n; i++) {
      addUndirected(i, (i + step) % n);
    }
  }

  if (k % 2 === 1) {
    if (n % 2 === 0) {
      const halfN = n / 2;
      for (let i = 0; i < halfN; i++) {
        addUndirected(i, i + halfN);
      }
    } else {
      // gcd(2m + 1, m) = 1 guarantees stepping by floor(n/2) visits all n vertices in one Hamiltonian cycle
      const stepD = Math.floor(n / 2);
      const halfCount = Math.floor(n / 2);
      for (let t = 0; t < halfCount; t++) {
        const uIdx = (2 * t * stepD) % n;
        const vIdx = ((2 * t + 1) * stepD) % n;
        addUndirected(uIdx, vIdx);
      }
    }
  }

  return pairs;
}

function buildParametricFamilyData(
  family: ParametricFamily,
  vertexCount: number,
  targetDegree: number,
  width: number,
  height: number
): { directed: boolean; nodes: GraphNode[]; edges: GraphEdge[] } {
  const n = Math.max(2, Math.min(20, vertexCount));
  const cx = Math.max(220, width / 2);
  const cy = Math.max(195, height / 2);

  if (family === 'star') {
    const outerRadius = Math.min(cx, cy) * (n > 12 ? 0.76 : 0.68);
    const nodes: GraphNode[] = [
      { id: 1, label: getVertexLabelByIndex(0), x: Math.round(cx), y: Math.round(cy) },
    ];
    for (let i = 1; i < n; i++) {
      const ang = (2 * Math.PI * (i - 1)) / Math.max(1, n - 1) - Math.PI / 2;
      nodes.push({
        id: i + 1,
        label: getVertexLabelByIndex(i),
        x: Math.round(cx + outerRadius * Math.cos(ang)),
        y: Math.round(cy + outerRadius * Math.sin(ang)),
      });
    }
    const edges: GraphEdge[] = [];
    for (let i = 2; i <= n; i++) {
      edges.push({
        id: 600 + i,
        from: 1,
        to: i,
        weight: ((i * 3) % 9) + 1,
      });
    }
    return { directed: false, nodes, edges };
  }

  if (family === 'wheel') {
    const effectiveN = Math.max(4, n);
    const outerRadius = Math.min(cx, cy) * (effectiveN > 12 ? 0.76 : 0.68);
    const nodes: GraphNode[] = [
      { id: 1, label: getVertexLabelByIndex(0), x: Math.round(cx), y: Math.round(cy) },
    ];
    const rimCount = effectiveN - 1;
    for (let i = 0; i < rimCount; i++) {
      const ang = (2 * Math.PI * i) / rimCount - Math.PI / 2;
      nodes.push({
        id: i + 2,
        label: getVertexLabelByIndex(i + 1),
        x: Math.round(cx + outerRadius * Math.cos(ang)),
        y: Math.round(cy + outerRadius * Math.sin(ang)),
      });
    }
    const edges: GraphEdge[] = [];
    let eId = 700;
    // Hub spokes + outer rim cycle
    for (let i = 0; i < rimCount; i++) {
      const rimNode = i + 2;
      const nextRimNode = ((i + 1) % rimCount) + 2;
      edges.push({ id: eId++, from: 1, to: rimNode, weight: (i % 7) + 2 });
      if (rimCount >= 3 || i === 0) {
        edges.push({ id: eId++, from: rimNode, to: nextRimNode, weight: ((i * 2) % 8) + 1 });
      }
    }
    return { directed: false, nodes, edges };
  }

  const nodes = createCircularNodes(n, width, height, 0);

  if (family === 'empty') {
    return { directed: false, nodes, edges: [] };
  }

  if (family === 'path') {
    const edges: GraphEdge[] = [];
    for (let i = 1; i < n; i++) {
      edges.push({
        id: 800 + i,
        from: i,
        to: i + 1,
        weight: ((i * 2) % 9) + 1,
      });
    }
    return { directed: false, nodes, edges };
  }

  const resolvedK =
    family === 'cycle'
      ? Math.min(2, n - 1)
      : family === 'complete'
      ? n - 1
      : Math.max(0, Math.min(n - 1, targetDegree));

  const identityOrder = Array.from({ length: n }, (_, idx) => idx + 1);
  const rawPairs = buildRegularEdgePairs(n, resolvedK, identityOrder);
  const edges: GraphEdge[] = rawPairs.map(([from, to], idx) => ({
    id: 900 + idx,
    from,
    to,
    weight: ((from + to + idx) % 9) + 1,
  }));

  return { directed: false, nodes, edges };
}

function shuffleNumbers(arr: number[]): number[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRandomGraphData(
  model: RandomGraphModel,
  vertexCount: number,
  densityPct: number,
  targetDegree: number,
  width: number,
  height: number
): { directed: boolean; nodes: GraphNode[]; edges: GraphEdge[] } {
  const n = Math.max(3, Math.min(20, vertexCount));
  const cx = Math.max(220, width / 2);
  const cy = Math.max(195, height / 2);
  const randWeight = () => Math.floor(Math.random() * 12) + 1;

  if (model === 'random-dag') {
    // Arrange vertices into 3–5 left-to-right topological layers
    const layerCount = Math.min(n, n <= 5 ? 3 : n <= 11 ? 4 : 5);
    const layers: number[][] = Array.from({ length: layerCount }, () => []);
    for (let i = 0; i < n; i++) {
      layers[Math.floor((i * layerCount) / n)].push(i + 1);
    }

    const usableW = Math.max(280, width - 120);
    const usableH = Math.max(240, height - 110);
    const nodes: GraphNode[] = [];

    layers.forEach((layerIds, lIdx) => {
      const lx =
        layerCount === 1
          ? cx
          : 60 + (usableW * lIdx) / (layerCount - 1);
      layerIds.forEach((id, posIdx) => {
        const ly =
          layerIds.length === 1
            ? cy + (Math.random() - 0.5) * 32
            : 55 + (usableH * (posIdx + 0.5)) / layerIds.length;
        nodes.push({
          id,
          label: getVertexLabelByIndex(id - 1),
          x: Math.round(lx),
          y: Math.round(ly),
        });
      });
    });

    const p = Math.max(0.1, Math.min(1, densityPct / 100));
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();
    let edgeSeq = 1200;

    for (let i = 1; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        if (Math.random() <= p) {
          seen.add(`${i}-${j}`);
          edges.push({ id: edgeSeq++, from: i, to: j, weight: randWeight() });
        }
      }
    }
    // Ensure a connected forward backbone if sparse probability left isolated vertices
    for (let i = 1; i < n; i++) {
      const hasOut = edges.some((e) => e.from === i);
      if (!hasOut) {
        const target = Math.min(n, i + 1 + Math.floor(Math.random() * Math.min(2, n - i)));
        const key = `${i}-${target}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ id: edgeSeq++, from: i, to: target, weight: randWeight() });
        }
      }
    }

    return { directed: true, nodes, edges };
  }

  const nodes = createCircularNodes(n, width, height, model === 'erdos-renyi' ? 12 : 0);

  if (model === 'erdos-renyi') {
    const p = Math.max(0.05, Math.min(1, densityPct / 100));
    const edges: GraphEdge[] = [];
    let edgeSeq = 1400;
    for (let i = 1; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        if (Math.random() <= p) {
          edges.push({ id: edgeSeq++, from: i, to: j, weight: randWeight() });
        }
      }
    }
    return { directed: false, nodes, edges };
  }

  if (model === 'random-regular') {
    const k = Math.max(0, Math.min(n - 1, targetDegree));
    const perm = shuffleNumbers(Array.from({ length: n }, (_, idx) => idx + 1));
    const pairs = buildRegularEdgePairs(n, k, perm);
    const edges: GraphEdge[] = pairs.map(([from, to], idx) => ({
      id: 1600 + idx,
      from,
      to,
      weight: randWeight(),
    }));
    return { directed: false, nodes, edges };
  }

  if (model === 'random-tree') {
    const order = shuffleNumbers(Array.from({ length: n }, (_, idx) => idx + 1));
    const edges: GraphEdge[] = [];
    for (let i = 1; i < n; i++) {
      const parentIdx = Math.floor(Math.random() * i);
      edges.push({
        id: 1800 + i,
        from: order[parentIdx],
        to: order[i],
        weight: randWeight(),
      });
    }
    return { directed: false, nodes, edges };
  }

  if (model === 'scale-free') {
    // Barabasi-Albert preferential attachment
    const m = Math.max(1, Math.min(n - 1, Math.max(1, Math.round(targetDegree / 2))));
    const m0 = Math.max(2, Math.min(n, m + 1));
    const degMap = new Map<number, number>();
    for (let i = 1; i <= n; i++) degMap.set(i, 0);

    const edges: GraphEdge[] = [];
    let edgeSeq = 2000;
    // Initial connected seed clique of size m0
    for (let i = 1; i <= m0; i++) {
      for (let j = i + 1; j <= m0; j++) {
        edges.push({ id: edgeSeq++, from: i, to: j, weight: randWeight() });
        degMap.set(i, (degMap.get(i) ?? 0) + 1);
        degMap.set(j, (degMap.get(j) ?? 0) + 1);
      }
    }

    for (let newNode = m0 + 1; newNode <= n; newNode++) {
      const targets = new Set<number>();
      const attachCount = Math.min(m, newNode - 1);
      while (targets.size < attachCount) {
        let totalWeight = 0;
        for (let cand = 1; cand < newNode; cand++) {
          if (!targets.has(cand)) totalWeight += (degMap.get(cand) ?? 0) + 1;
        }
        let r = Math.random() * totalWeight;
        for (let cand = 1; cand < newNode; cand++) {
          if (targets.has(cand)) continue;
          r -= (degMap.get(cand) ?? 0) + 1;
          if (r <= 0) {
            targets.add(cand);
            break;
          }
        }
      }
      for (const tgt of targets) {
        edges.push({ id: edgeSeq++, from: newNode, to: tgt, weight: randWeight() });
        degMap.set(newNode, (degMap.get(newNode) ?? 0) + 1);
        degMap.set(tgt, (degMap.get(tgt) ?? 0) + 1);
      }
    }

    // Pull highest-degree hub slightly inward for visual clarity
    let hubId = 1;
    for (let i = 2; i <= n; i++) {
      if ((degMap.get(i) ?? 0) > (degMap.get(hubId) ?? 0)) hubId = i;
    }
    const styledNodes = nodes.map((nd) =>
      nd.id === hubId
        ? { ...nd, x: Math.round((nd.x + cx * 2) / 3), y: Math.round((nd.y + cy * 2) / 3) }
        : nd
    );

    return { directed: false, nodes: styledNodes, edges };
  }

  // Watts-Strogatz Small-World Network (ring lattice + shortcut rewiring)
  const evenK = Math.max(2, Math.min(n - 1, targetDegree % 2 === 0 ? targetDegree : targetDegree - 1));
  const halfK = Math.max(1, Math.floor(evenK / 2));
  const edgeSet = new Set<string>();
  const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const pairList: [number, number][] = [];

  for (let step = 1; step <= halfK; step++) {
    for (let i = 0; i < n; i++) {
      const u = i + 1;
      const v = ((i + step) % n) + 1;
      const kStr = pairKey(u, v);
      if (!edgeSet.has(kStr)) {
        edgeSet.add(kStr);
        pairList.push([u, v]);
      }
    }
  }

  // Rewire with beta = 0.28
  const beta = 0.28;
  for (let idx = 0; idx < pairList.length; idx++) {
    if (Math.random() < beta) {
      const [u, oldV] = pairList[idx];
      const candidates: number[] = [];
      for (let cand = 1; cand <= n; cand++) {
        if (cand !== u && !edgeSet.has(pairKey(u, cand))) {
          candidates.push(cand);
        }
      }
      if (candidates.length > 0) {
        const newV = candidates[Math.floor(Math.random() * candidates.length)];
        edgeSet.delete(pairKey(u, oldV));
        edgeSet.add(pairKey(u, newV));
        pairList[idx] = [u, newV];
      }
    }
  }

  const edges: GraphEdge[] = pairList.map(([from, to], idx) => ({
    id: 2200 + idx,
    from,
    to,
    weight: randWeight(),
  }));

  return { directed: false, nodes, edges };
}

export default function GraphTheoryBuilder({ onNavigate }: GraphTheoryBuilderProps) {
  const initialPreset = useMemo(() => buildPresetData('weighted', 680, 480), []);

  const [nodes, setNodes] = useState<GraphNode[]>(initialPreset.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialPreset.edges);
  const [generatorCategory, setGeneratorCategory] = useState<GeneratorCategory>('parametric');
  const [activeParamFamily, setActiveParamFamily] = useState<ParametricFamily>('regular');
  const [paramVertices, setParamVertices] = useState<number>(6);
  const [paramDegree, setParamDegree] = useState<number>(3);

  const [randomModel, setRandomModel] = useState<RandomGraphModel>('erdos-renyi');
  const [randomVertices, setRandomVertices] = useState<number>(8);
  const [randomDensityPct, setRandomDensityPct] = useState<number>(42);
  const [randomTargetDegree, setRandomTargetDegree] = useState<number>(3);

  const [activePreset, setActivePreset] = useState<PresetType | null>('weighted');
  const [isDirected, setIsDirected] = useState<boolean>(initialPreset.directed);
  const [showWeights, setShowWeights] = useState<boolean>(true);
  const [mode, setMode] = useState<CanvasMode>('select');
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [activeRepTab, setActiveRepTab] = useState<RepTab>('matrix');

  const [startNodeId, setStartNodeId] = useState<number>(1);
  const [endNodeId, setEndNodeId] = useState<number>(6);
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<number[]>([]);
  const [edgeSourceId, setEdgeSourceId] = useState<number | null>(null);

  const [algoLog, setAlgoLog] = useState<AlgoLogState>({
    title: 'Simulator Ready',
    status: 'ready',
    primaryLine:
      'Select an algorithm above to trace shortest paths, spanning trees, or vertex traversals.',
  });

  const [copiedRep, setCopiedRep] = useState<boolean>(false);
  const [importFeedback, setImportFeedback] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  // 3D HUD Dock state (Collapsible bottom dock per Three.js ergonomic standard)
  const [autoRotate3D, setAutoRotate3D] = useState<boolean>(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);

  // Refs for 2D Canvas & pointer interaction
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
  const draggingNodeIdRef = useRef<number | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stageSizeRef = useRef<{ width: number; height: number }>({ width: 680, height: 480 });
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // Refs for Three.js 3D Preview
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const threeContextRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    graphGroup: THREE.Group;
    maxAnisotropy: number;
    isSoftwareGl: boolean;
  } | null>(null);
  const targetSphericalRef = useRef({ radius: 430, theta: 0.42, phi: 1.15 });
  const currentSphericalRef = useRef({ radius: 430, theta: 0.42, phi: 1.15 });
  const isOrbitingRef = useRef<boolean>(false);
  const prevOrbitPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewModeRef = useRef<ViewMode>(viewMode);
  const autoRotateRef = useRef<boolean>(autoRotate3D);

  viewModeRef.current = viewMode;
  autoRotateRef.current = autoRotate3D;

  const highlightedNodeSet = useMemo(() => new Set(highlightedNodes), [highlightedNodes]);
  const highlightedEdgeSet = useMemo(() => new Set(highlightedEdges), [highlightedEdges]);

  // Keep Start & Target selectors valid whenever nodes list changes
  useEffect(() => {
    if (nodes.length === 0) return;
    if (!nodes.some((n) => n.id === startNodeId)) {
      setStartNodeId(nodes[0].id);
    }
    if (!nodes.some((n) => n.id === endNodeId)) {
      setEndNodeId(nodes[nodes.length - 1].id);
    }
  }, [nodes, startNodeId, endNodeId]);

  // Keyboard shortcut 'H' to toggle 3D HUD drawer when in 3D view
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        viewModeRef.current === '3d' &&
        (e.key === 'h' || e.key === 'H') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setIsHudCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const getNeighbors = useCallback(
    (nodeId: number, currentEdges = edges, directed = isDirected) => {
      const list: { to: number; weight: number; edgeId: number }[] = [];
      for (const e of currentEdges) {
        if (e.from === nodeId) {
          list.push({ to: e.to, weight: e.weight, edgeId: e.id });
        } else if (!directed && e.to === nodeId) {
          list.push({ to: e.from, weight: e.weight, edgeId: e.id });
        }
      }
      return list;
    },
    [edges, isDirected]
  );

  const clearHighlights = useCallback(() => {
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  }, []);

  // ============================================================================
  // 2D HIGH-DPI CANVAS RENDERER
  // ============================================================================
  const draw2D = useCallback(() => {
    const canvas = canvas2dRef.current;
    const stage = stageContainerRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = stage.getBoundingClientRect();
    const width = rect.width || 680;
    const height = rect.height || 480;
    stageSizeRef.current = { width, height };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Crisp White Fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Subtle Coordinate Grid
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 28) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 28) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Dashed preview line while connecting an edge
    if (mode === 'edge' && edgeSourceId !== null) {
      const srcNode = nodes.find((n) => n.id === edgeSourceId);
      if (srcNode) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#F97316';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(srcNode.x, srcNode.y);
        ctx.lineTo(pointerPosRef.current.x, pointerPosRef.current.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    const nodeRadius = nodes.length > 14 ? 14 : nodes.length > 10 ? 17 : 20;
    const denseEdges = edges.length > 45;

    // Draw Edges
    for (const e of edges) {
      const a = nodes.find((n) => n.id === e.from);
      const b = nodes.find((n) => n.id === e.to);
      if (!a || !b) continue;

      const isActive = highlightedEdgeSet.has(e.id);
      ctx.strokeStyle = isActive ? '#F97316' : denseEdges ? 'rgba(156, 163, 175, 0.55)' : '#9CA3AF';
      ctx.lineWidth = isActive ? 3.5 : denseEdges ? 1.35 : 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      if (isDirected) {
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const r = nodeRadius + 2;
        const tx = b.x - r * Math.cos(angle);
        const ty = b.y - r * Math.sin(angle);
        ctx.save();
        ctx.fillStyle = isActive ? '#F97316' : '#6B7280';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 10 * Math.cos(angle - Math.PI / 6), ty - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(tx - 10 * Math.cos(angle + Math.PI / 6), ty - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if (showWeights && (!denseEdges || isActive)) {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const badgeR = edges.length > 24 && !isActive ? 10 : 12;
        ctx.fillStyle = isActive ? '#FFF7ED' : '#FFFFFF';
        ctx.strokeStyle = isActive ? '#F97316' : '#D1D5DB';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isActive ? '#EA580C' : '#374151';
        ctx.font = badgeR === 10 ? '600 9.5px "JetBrains Mono", monospace' : '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(e.weight), mx, my + 0.5);
      }
    }

    // Draw Vertices
    for (const n of nodes) {
      const isVisited = highlightedNodeSet.has(n.id);
      const isSelected = edgeSourceId !== null && edgeSourceId === n.id;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.09)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = isVisited ? '#F97316' : isSelected ? '#FFF7ED' : '#FFFFFF';
      ctx.strokeStyle = isVisited ? '#EA580C' : isSelected ? '#F97316' : '#1F2937';
      ctx.lineWidth = isVisited || isSelected ? 3 : 2.1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isVisited ? '#FFFFFF' : '#111827';
      ctx.font = nodeRadius <= 14 ? '700 11px "Outfit", sans-serif' : '700 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y + 0.5);
    }
  }, [nodes, edges, isDirected, showWeights, mode, edgeSourceId, highlightedNodeSet, highlightedEdgeSet]);

  useEffect(() => {
    draw2D();
  }, [draw2D, viewMode]);

  useEffect(() => {
    const stage = stageContainerRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      draw2D();
      if (threeContextRef.current && threeMountRef.current) {
        const rect = threeMountRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          threeContextRef.current.camera.aspect = rect.width / rect.height;
          threeContextRef.current.camera.updateProjectionMatrix();
          threeContextRef.current.renderer.setSize(rect.width, rect.height);
        }
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [draw2D]);

  // ============================================================================
  // THREE.JS 3D TOPOLOGY ENGINE (Studio PBR + Software-WebGL Safe Loop)
  // ============================================================================
  const sync3DScene = useCallback(() => {
    const ctx3d = threeContextRef.current;
    if (!ctx3d) return;

    const { graphGroup, maxAnisotropy } = ctx3d;
    disposeGroupChildren(graphGroup);
    if (nodes.length === 0) return;

    const { width, height } = stageSizeRef.current;
    const cx = (width || 680) / 2;
    const cy = (height || 480) / 2;

    const makeTextSprite = (
      text: string,
      bgColor: string,
      textColor: string,
      borderColor: string,
      scaleW: number,
      scaleH: number
    ) => {
      const spCanvas = document.createElement('canvas');
      spCanvas.width = 160;
      spCanvas.height = 80;
      const sctx = spCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = bgColor;
        sctx.beginPath();
        sctx.roundRect(14, 10, 132, 60, 16);
        sctx.fill();
        sctx.lineWidth = 4;
        sctx.strokeStyle = borderColor;
        sctx.stroke();

        sctx.fillStyle = textColor;
        sctx.font = '700 32px "Outfit", sans-serif';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText(text, 80, 41);
      }

      const tex = new THREE.CanvasTexture(spCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(scaleW, scaleH, 1);
      sprite.renderOrder = 5;
      return sprite;
    };

    const pos3D = new Map<number, THREE.Vector3>();
    nodes.forEach((n, idx) => {
      const deg = getNeighbors(n.id).length;
      const zDepth = Math.sin(idx * 1.45) * 72 + (deg - 2) * 16;
      pos3D.set(n.id, new THREE.Vector3((n.x - cx) * 0.84, -(n.y - cy) * 0.84, zDepth));
    });

    const dense3DEdges = edges.length > 36;
    const sphereRadius = nodes.length > 14 ? 10.5 : nodes.length > 10 ? 12 : 13.5;

    // Composite 3D Edge Assemblies (Shaft + Terminal Collar Rings + Arrowhead + Weight Badge)
    for (const e of edges) {
      const p1 = pos3D.get(e.from);
      const p2 = pos3D.get(e.to);
      if (!p1 || !p2) continue;

      _dirVec.subVectors(p2, p1);
      const len = _dirVec.length();
      if (len < 1) continue;
      _normVec.copy(_dirVec).normalize();
      _midVec.copy(p1).addScaledVector(_dirVec, 0.5);

      const isActive = highlightedEdgeSet.has(e.id);
      const edgeGroup = new THREE.Group();

      // 1. Primary Shaft
      const shaftRadius = isActive ? 2.6 : dense3DEdges ? 0.95 : 1.4;
      const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, Math.max(2, len - 22), 10);
      const shaftMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0xf97316 : 0x64748b,
        emissive: isActive ? 0xea580c : 0x000000,
        emissiveIntensity: isActive ? 0.45 : 0,
        roughness: 0.35,
        metalness: 0.55,
      });
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      shaftMesh.position.copy(_midVec);
      shaftMesh.quaternion.setFromUnitVectors(_upAxis, _normVec);
      edgeGroup.add(shaftMesh);

      // 2. Secondary Joint Collars near vertices (varied roughness/metalness)
      const collarGeo = new THREE.CylinderGeometry(shaftRadius * 1.45, shaftRadius * 1.45, 3.5, 10);
      const collarMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0xfdba74 : 0x94a3b8,
        roughness: 0.65,
        metalness: 0.25,
      });
      const collarStart = new THREE.Mesh(collarGeo, collarMat);
      collarStart.position.copy(p1).addScaledVector(_normVec, sphereRadius + 2.5);
      collarStart.quaternion.setFromUnitVectors(_upAxis, _normVec);
      edgeGroup.add(collarStart);

      // 3. Directed Cone Arrowhead (if Digraph)
      if (isDirected) {
        const coneGeo = new THREE.ConeGeometry(5.5, 14, 14);
        const coneMat = new THREE.MeshStandardMaterial({
          color: isActive ? 0xf97316 : 0xcbd5e1,
          emissive: isActive ? 0xea580c : 0x000000,
          emissiveIntensity: isActive ? 0.35 : 0,
          roughness: 0.25,
          metalness: 0.7,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.copy(p2).addScaledVector(_normVec, -(sphereRadius + 8));
        cone.quaternion.setFromUnitVectors(_upAxis, _normVec);
        edgeGroup.add(cone);
      } else {
        const collarEnd = new THREE.Mesh(collarGeo.clone(), collarMat.clone());
        collarEnd.position.copy(p2).addScaledVector(_normVec, -(sphereRadius + 2.5));
        collarEnd.quaternion.setFromUnitVectors(_upAxis, _normVec);
        edgeGroup.add(collarEnd);
      }

      // 4. Edge Weight Sprite (auto-culled on ultra-dense networks unless highlighted)
      if (showWeights && (!dense3DEdges || isActive)) {
        const wSprite = makeTextSprite(
          String(e.weight),
          isActive ? '#F97316' : '#1E293B',
          '#FFFFFF',
          isActive ? '#FDBA74' : '#475569',
          28,
          14
        );
        wSprite.position.set(_midVec.x, _midVec.y + 11, _midVec.z);
        edgeGroup.add(wSprite);
      }

      graphGroup.add(edgeGroup);
    }

    // Composite 3-Part 3D Vertex Nodes (Core PBR Sphere + Equatorial Collar + Polar Cap + Crisp Label)
    for (const n of nodes) {
      const p = pos3D.get(n.id);
      if (!p) continue;
      const isVisited = highlightedNodeSet.has(n.id);
      const vertexGroup = new THREE.Group();
      vertexGroup.position.copy(p);

      // Part 1: Primary Silhouette Sphere
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isVisited ? 0xf97316 : 0xf8fafc,
        emissive: isVisited ? 0xea580c : 0x0f172a,
        emissiveIntensity: isVisited ? 0.4 : 0.15,
        roughness: 0.22,
        metalness: 0.2,
      });
      vertexGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

      // Part 2: Secondary Read — Brushed Metallic Equatorial Orbital Ring (roughness delta >= 0.25)
      const ringGeo = new THREE.TorusGeometry(sphereRadius + 2.6, 1.25, 10, 28);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isVisited ? 0xfed7aa : 0xf97316,
        roughness: 0.52,
        metalness: 0.82,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.3;
      vertexGroup.add(ringMesh);

      // Part 3: Accent Detail — Top Signal Cap + Floating Vertex Label Sprite
      const capGeo = new THREE.CylinderGeometry(4, 5.4, 2.8, 14);
      const capMat = new THREE.MeshStandardMaterial({
        color: isVisited ? 0xffffff : 0x334155,
        roughness: 0.58,
        metalness: 0.65,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = sphereRadius - 0.3;
      vertexGroup.add(capMesh);

      const labelSprite = makeTextSprite(
        n.label,
        isVisited ? '#EA580C' : '#0F172A',
        '#FFFFFF',
        isVisited ? '#FED7AA' : '#F97316',
        nodes.length > 14 ? 32 : 38,
        nodes.length > 14 ? 16 : 19
      );
      labelSprite.position.set(0, sphereRadius + 12.5, 0);
      vertexGroup.add(labelSprite);

      graphGroup.add(vertexGroup);
    }
  }, [nodes, edges, isDirected, showWeights, highlightedNodeSet, highlightedEdgeSet, getNeighbors]);

  // Initialize Three.js WebGLRenderer once inside dedicated empty ref container
  useEffect(() => {
    const container = threeMountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.001);

    const rect = container.getBoundingClientRect();
    const initW = rect.width || 680;
    const initH = rect.height || 480;

    const camera = new THREE.PerspectiveCamera(46, initW / initH, 1, 2200);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Balanced Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.15);
    keyLight.position.set(190, 270, 230);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xf97316, 1.1, 780);
    rimLight.position.set(-180, -110, 150);
    scene.add(rimLight);

    // Grounded Reference Grid (with polygonOffset to prevent Z-fighting)
    const grid = new THREE.GridHelper(560, 16, 0x334155, 0x1e293b);
    grid.position.y = -145;
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMats.forEach((m) => {
      m.polygonOffset = true;
      m.polygonOffsetFactor = -1;
      m.polygonOffsetUnits = -1;
    });
    scene.add(grid);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    const updateCameraFromSpherical = (sph: { radius: number; theta: number; phi: number }) => {
      camera.position.x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
      camera.position.y = sph.radius * Math.cos(sph.phi);
      camera.position.z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraFromSpherical(currentSphericalRef.current);

    threeContextRef.current = {
      scene,
      camera,
      renderer,
      graphGroup,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
      isSoftwareGl,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Orbit & Zoom Pointer Listeners
    const dom = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isOrbitingRef.current = true;
      prevOrbitPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isOrbitingRef.current || viewModeRef.current !== '3d') return;
      const dx = e.clientX - prevOrbitPointerRef.current.x;
      const dy = e.clientY - prevOrbitPointerRef.current.y;
      prevOrbitPointerRef.current = { x: e.clientX, y: e.clientY };
      targetSphericalRef.current.theta -= dx * 0.008;
      targetSphericalRef.current.phi = Math.max(
        0.25,
        Math.min(Math.PI - 0.25, targetSphericalRef.current.phi - dy * 0.008)
      );
    };
    const onPointerUp = () => {
      isOrbitingRef.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSphericalRef.current.radius = Math.max(
        180,
        Math.min(860, targetSphericalRef.current.radius + e.deltaY * 0.35)
      );
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Software-WebGL Safe Animation Loop with Exponential Damping
    const clock = new THREE.Clock();
    let frameId = 0;
    let timerId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);

      if (viewModeRef.current === '3d') {
        // Exponential camera damping
        const cur = currentSphericalRef.current;
        const tgt = targetSphericalRef.current;
        cur.radius = THREE.MathUtils.damp(cur.radius, tgt.radius, 9, delta);
        cur.theta = THREE.MathUtils.damp(cur.theta, tgt.theta, 10, delta);
        cur.phi = THREE.MathUtils.damp(cur.phi, tgt.phi, 10, delta);
        updateCameraFromSpherical(cur);

        if (autoRotateRef.current && !isOrbitingRef.current && !isSoftwareGl) {
          graphGroup.rotation.y += delta * 0.24;
        }
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      disposeGroupChildren(graphGroup);
      grid.geometry.dispose();
      gridMats.forEach((m) => m.dispose());
      envTex.dispose();
      renderer.dispose();
      if (dom.parentElement === container) {
        container.removeChild(dom);
      }
      threeContextRef.current = null;
    };
  }, []);

  // Re-sync 3D geometry whenever graph topology, highlights, or viewMode changes
  useEffect(() => {
    sync3DScene();
    if (viewMode === '3d' && threeContextRef.current && threeMountRef.current) {
      const rect = threeMountRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        threeContextRef.current.camera.aspect = rect.width / rect.height;
        threeContextRef.current.camera.updateProjectionMatrix();
        threeContextRef.current.renderer.setSize(rect.width, rect.height);
      }
      threeContextRef.current.renderer.render(
        threeContextRef.current.scene,
        threeContextRef.current.camera
      );
    }
  }, [sync3DScene, viewMode]);

  const reset3DCamera = () => {
    targetSphericalRef.current = { radius: 430, theta: 0.42, phi: 1.15 };
    if (threeContextRef.current) {
      threeContextRef.current.graphGroup.rotation.y = 0;
    }
  };

  // ============================================================================
  // 2D POINTER INTERACTIONS
  // ============================================================================
  const getNextVertexLabel = (existingNodes: GraphNode[]) => {
    const used = new Set(existingNodes.map((n) => n.label));
    for (const ch of LABELS) {
      if (!used.has(ch)) return ch;
    }
    return `V${existingNodes.length + 1}`;
  };

  const getRelativePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvas2dRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const findNodeAt = (x: number, y: number) => {
    const hitR = nodes.length > 14 ? 16 : nodes.length > 10 ? 19 : 22;
    return nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= hitR);
  };

  const findEdgeAt = (x: number, y: number) =>
    edges.find((ed) => {
      const a = nodes.find((n) => n.id === ed.from);
      const b = nodes.find((n) => n.id === ed.to);
      if (!a || !b) return false;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      return Math.hypot(mx - x, my - y) <= 18;
    });

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getRelativePointer(e);
    pointerPosRef.current = { x, y };
    const hitNode = findNodeAt(x, y);
    const hitEdge = findEdgeAt(x, y);

    if (mode === 'select') {
      if (hitNode) {
        draggingNodeIdRef.current = hitNode.id;
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (hitEdge && showWeights) {
        clearHighlights();
        setEdges((prev) =>
          prev.map((ed) => (ed.id === hitEdge.id ? { ...ed, weight: (ed.weight % 15) + 1 } : ed))
        );
      }
      return;
    }

    if (mode === 'node') {
      if (!hitNode) {
        clearHighlights();
        setNodes((prev) => [
          ...prev,
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            label: getNextVertexLabel(prev),
            x: Math.round(x),
            y: Math.round(y),
          },
        ]);
      }
      return;
    }

    if (mode === 'edge') {
      if (hitNode) {
        if (edgeSourceId === null) {
          setEdgeSourceId(hitNode.id);
        } else if (edgeSourceId !== hitNode.id) {
          const duplicate = edges.some((ed) =>
            isDirected
              ? ed.from === edgeSourceId && ed.to === hitNode.id
              : (ed.from === edgeSourceId && ed.to === hitNode.id) ||
                (ed.from === hitNode.id && ed.to === edgeSourceId)
          );
          if (!duplicate) {
            clearHighlights();
            setEdges((prev) => [
              ...prev,
              {
                id: Date.now() + Math.floor(Math.random() * 1000),
                from: edgeSourceId,
                to: hitNode.id,
                weight: Math.floor(Math.random() * 9) + 1,
              },
            ]);
          }
          setEdgeSourceId(null);
        } else {
          setEdgeSourceId(null);
        }
      } else {
        setEdgeSourceId(null);
      }
      return;
    }

    if (mode === 'delete') {
      if (hitNode) {
        clearHighlights();
        setNodes((prev) => prev.filter((n) => n.id !== hitNode.id));
        setEdges((prev) => prev.filter((ed) => ed.from !== hitNode.id && ed.to !== hitNode.id));
      } else if (hitEdge) {
        clearHighlights();
        setEdges((prev) => prev.filter((ed) => ed.id !== hitEdge.id));
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getRelativePointer(e);
    pointerPosRef.current = { x, y };

    if (draggingNodeIdRef.current !== null) {
      const { width, height } = stageSizeRef.current;
      const clampedX = Math.round(Math.max(28, Math.min(width - 28, x)));
      const clampedY = Math.round(Math.max(28, Math.min(height - 28, y)));
      const activeId = draggingNodeIdRef.current;
      setNodes((prev) =>
        prev.map((n) => (n.id === activeId ? { ...n, x: clampedX, y: clampedY } : n))
      );
    } else if (mode === 'edge' && edgeSourceId !== null) {
      draw2D();
    }
  };

  const handleCanvasPointerUp = () => {
    draggingNodeIdRef.current = null;
  };

  // ============================================================================
  // PARAMETRIC SCALING (MIN -> MAX), RANDOM GENERATORS, MUTATORS & PRESETS
  // ============================================================================
  const applyGeneratedTopology = useCallback(
    (
      data: { directed: boolean; nodes: GraphNode[]; edges: GraphEdge[] },
      logTitle: string,
      logSummary: string
    ) => {
      setIsDirected(data.directed);
      setNodes(data.nodes);
      setEdges(data.edges);
      setEdgeSourceId(null);
      clearHighlights();
      if (data.nodes.length > 0) {
        setStartNodeId(data.nodes[0].id);
        setEndNodeId(data.nodes[data.nodes.length - 1].id);
      }
      setAlgoLog({
        title: logTitle,
        status: 'ready',
        primaryLine: logSummary,
      });
    },
    [clearHighlights]
  );

  const handleApplyParametric = (
    nextV: number,
    nextK: number,
    familyOverride?: ParametricFamily
  ) => {
    const clampedV = Math.max(2, Math.min(20, nextV));
    const maxK = clampedV - 1;
    const fam = familyOverride ?? activeParamFamily;

    let effectiveK = Math.max(0, Math.min(maxK, nextK));
    if (fam === 'empty') effectiveK = 0;
    else if (fam === 'cycle') effectiveK = Math.min(2, maxK);
    else if (fam === 'complete') effectiveK = maxK;

    setParamVertices(clampedV);
    setParamDegree(effectiveK);
    setActiveParamFamily(fam);
    setActivePreset(null);

    const { width, height } = stageSizeRef.current;
    const built = buildParametricFamilyData(
      fam,
      clampedV,
      effectiveK,
      width || 680,
      height || 480
    );

    const familyNames: Record<ParametricFamily, string> = {
      regular: `Degree-Scaled Graph (|V|=${built.nodes.length}, k=${effectiveK})`,
      empty: `Empty Graph E_${built.nodes.length} (Min Degree 0)`,
      path: `Path Graph P_${built.nodes.length}`,
      cycle: `Cycle Graph C_${built.nodes.length} (2-Regular)`,
      star: `Star Graph S_${built.nodes.length} (Hub Δ=${built.nodes.length - 1})`,
      wheel: `Wheel Graph W_${built.nodes.length}`,
      complete: `Complete Graph K_${built.nodes.length} (Max Degree ${built.nodes.length - 1})`,
    };

    applyGeneratedTopology(
      built,
      familyNames[fam],
      `Generated ${built.nodes.length} vertices and ${built.edges.length} edges. Drag |V| or Degree k from Min to Max to scale live.`
    );
  };

  const handleGenerateRandom = (
    modelOverride?: RandomGraphModel,
    vOverride?: number,
    densityOverride?: number,
    kOverride?: number
  ) => {
    const mdl = modelOverride ?? randomModel;
    const vCount = Math.max(3, Math.min(20, vOverride ?? randomVertices));
    const dens = Math.max(10, Math.min(100, densityOverride ?? randomDensityPct));
    const degK = Math.max(0, Math.min(vCount - 1, kOverride ?? randomTargetDegree));

    setRandomModel(mdl);
    setRandomVertices(vCount);
    setRandomDensityPct(dens);
    setRandomTargetDegree(degK);
    setActivePreset(null);

    const { width, height } = stageSizeRef.current;
    const built = buildRandomGraphData(
      mdl,
      vCount,
      dens,
      degK,
      width || 680,
      height || 480
    );

    const modelLabels: Record<RandomGraphModel, string> = {
      'erdos-renyi': `Erdős–Rényi Random G(${vCount}, ${(dens / 100).toFixed(2)})`,
      'random-regular': `Random ${degK}-Regular Network (|V|=${vCount})`,
      'random-tree': `Random Spanning Tree (|V|=${vCount}, |E|=${vCount - 1})`,
      'scale-free': `Barabási–Albert Scale-Free Network (|V|=${vCount})`,
      'small-world': `Watts–Strogatz Small-World Ring (|V|=${vCount})`,
      'random-dag': `Random Acyclic Digraph / DAG (|V|=${vCount})`,
    };

    applyGeneratedTopology(
      built,
      modelLabels[mdl],
      `Synthesized ${built.nodes.length} vertices and ${built.edges.length} random weighted edges.`
    );
  };

  // Direct incremental mutators so students can also step +1/-1 vertex or +1/-1 degree on any custom graph
  const handleStepActiveVertex = (delta: 1 | -1) => {
    clearHighlights();
    setActivePreset(null);
    const { width, height } = stageSizeRef.current;
    const w = width || 680;
    const h = height || 480;

    if (delta === 1) {
      if (nodes.length >= 26) return;
      const nextCount = nodes.length + 1;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) * 0.7;
      const angle = (2 * Math.PI * (nextCount - 1)) / Math.max(6, nextCount) - Math.PI / 2;
      const nx = Math.round(Math.max(32, Math.min(w - 32, cx + radius * Math.cos(angle))));
      const ny = Math.round(Math.max(32, Math.min(h - 32, cy + radius * Math.sin(angle))));
      const newId = nodes.reduce((mx, item) => Math.max(mx, item.id), 0) + 1;
      const nextNodes = [
        ...nodes,
        { id: newId, label: getNextVertexLabel(nodes), x: nx, y: ny },
      ];
      setNodes(nextNodes);
      setParamVertices(Math.min(20, Math.max(2, nextNodes.length)));
    } else {
      if (nodes.length <= 2) return;
      const removed = nodes[nodes.length - 1];
      const nextNodes = nodes.slice(0, -1);
      setNodes(nextNodes);
      setEdges((prev) => prev.filter((e) => e.from !== removed.id && e.to !== removed.id));
      setParamVertices(Math.min(20, Math.max(2, nextNodes.length)));
    }
  };

  const handleStepActiveDegree = (delta: 1 | -1) => {
    if (nodes.length < 2) return;
    clearHighlights();
    setActivePreset(null);

    if (delta === 1) {
      // Raise graph degree by adding up to ceil(|V|/2) non-duplicate edges prioritizing minimum-degree vertices
      const existing = new Set<string>();
      const deg = new Map<number, number>();
      nodes.forEach((n) => deg.set(n.id, 0));
      edges.forEach((e) => {
        const key = isDirected
          ? `${e.from}->${e.to}`
          : e.from < e.to
          ? `${e.from}-${e.to}`
          : `${e.to}-${e.from}`;
        existing.add(key);
        deg.set(e.from, (deg.get(e.from) ?? 0) + 1);
        if (!isDirected) deg.set(e.to, (deg.get(e.to) ?? 0) + 1);
        else deg.set(e.to, (deg.get(e.to) ?? 0) + 1);
      });

      const additions: GraphEdge[] = [];
      let baseId = edges.reduce((mx, item) => Math.max(mx, item.id), 3000) + 1;
      const targetAdditions = Math.max(1, Math.floor(nodes.length / 2));

      for (let step = 0; step < targetAdditions; step++) {
        const sorted = [...nodes].sort(
          (a, b) => (deg.get(a.id) ?? 0) - (deg.get(b.id) ?? 0)
        );
        let added = false;
        for (let i = 0; i < sorted.length && !added; i++) {
          for (let j = i + 1; j < sorted.length && !added; j++) {
            const u = sorted[i].id;
            const v = sorted[j].id;
            const key = isDirected
              ? `${u}->${v}`
              : u < v
              ? `${u}-${v}`
              : `${v}-${u}`;
            if (!existing.has(key)) {
              existing.add(key);
              additions.push({
                id: baseId++,
                from: u,
                to: v,
                weight: Math.floor(Math.random() * 9) + 1,
              });
              deg.set(u, (deg.get(u) ?? 0) + 1);
              deg.set(v, (deg.get(v) ?? 0) + 1);
              added = true;
            }
          }
        }
        if (!added) break;
      }
      if (additions.length > 0) {
        setEdges((prev) => [...prev, ...additions]);
      }
    } else {
      // Lower graph degree by pruning edges incident to the highest-degree vertices
      if (edges.length === 0) return;
      const deg = new Map<number, number>();
      nodes.forEach((n) => deg.set(n.id, 0));
      edges.forEach((e) => {
        deg.set(e.from, (deg.get(e.from) ?? 0) + 1);
        deg.set(e.to, (deg.get(e.to) ?? 0) + 1);
      });

      const removeCount = Math.min(edges.length, Math.max(1, Math.floor(nodes.length / 2)));
      const remaining = [...edges];
      for (let r = 0; r < removeCount; r++) {
        let bestIdx = 0;
        let bestScore = -1;
        remaining.forEach((e, idx) => {
          const score = (deg.get(e.from) ?? 0) + (deg.get(e.to) ?? 0);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        });
        const [removedEdge] = remaining.splice(bestIdx, 1);
        if (removedEdge) {
          deg.set(removedEdge.from, Math.max(0, (deg.get(removedEdge.from) ?? 1) - 1));
          deg.set(removedEdge.to, Math.max(0, (deg.get(removedEdge.to) ?? 1) - 1));
        }
      }
      setEdges(remaining);
    }
  };

  const handleLoadPreset = (type: PresetType) => {
    const { width, height } = stageSizeRef.current;
    const preset = buildPresetData(type, width || 680, height || 480);
    setActivePreset(type);
    setParamVertices(Math.min(20, Math.max(2, preset.nodes.length)));

    const presetTitles: Record<PresetType, string> = {
      weighted: 'Weighted Network',
      petersen: 'Petersen Graph (3-Regular)',
      bipartite: 'Complete Bipartite K₃,₃',
      dag: 'Directed Acyclic Graph (DAG)',
      hypercube: 'Hypercube Q₃ (3-Regular Cube)',
      octahedron: 'Octahedral Graph K₂,₂,₂ (4-Regular)',
    };

    applyGeneratedTopology(
      preset,
      `Loaded Preset: ${presetTitles[type]}`,
      'Choose an algorithm to trace paths, spanning trees, or vertex orderings.'
    );
  };

  const applyCircularLayout = () => {
    if (nodes.length === 0) return;
    const { width, height } = stageSizeRef.current;
    const cx = (width || 680) / 2;
    const cy = (height || 480) / 2;
    const radius = Math.min(cx, cy) * (nodes.length > 12 ? 0.75 : 0.68);
    setNodes((prev) =>
      prev.map((n, i) => {
        const angle = (2 * Math.PI * i) / prev.length - Math.PI / 2;
        return {
          ...n,
          x: Math.round(cx + radius * Math.cos(angle)),
          y: Math.round(cy + radius * Math.sin(angle)),
        };
      })
    );
  };

  const runAlgorithm = (type: AlgorithmType) => {
    if (nodes.length === 0) return;
    const getLabel = (id: number) => nodes.find((n) => n.id === id)?.label || '?';

    if (type === 'bfs' || type === 'dfs') {
      const visited = new Set<number>();
      const order: string[] = [];
      const container: number[] = [startNodeId];
      const parentEdge = new Map<number, number>();
      const hNodes: number[] = [];
      const hEdges: number[] = [];

      while (container.length > 0) {
        const curr = type === 'bfs' ? container.shift()! : container.pop()!;
        if (visited.has(curr)) continue;
        visited.add(curr);
        order.push(getLabel(curr));
        hNodes.push(curr);
        const pEdge = parentEdge.get(curr);
        if (pEdge !== undefined) hEdges.push(pEdge);

        const nbrs = getNeighbors(curr);
        if (type === 'dfs') nbrs.reverse();
        for (const nb of nbrs) {
          if (!visited.has(nb.to)) {
            if (!parentEdge.has(nb.to)) parentEdge.set(nb.to, nb.edgeId);
            container.push(nb.to);
          }
        }
      }

      setHighlightedNodes(hNodes);
      setHighlightedEdges(hEdges);
      setAlgoLog({
        title: `${type.toUpperCase()} Traversal from Vertex ${getLabel(startNodeId)}`,
        status: 'success',
        primaryLine: `Visited Order: ${order.join(' → ')}`,
        secondaryLine: `Reachable Vertices: ${visited.size} of ${nodes.length}`,
      });
      return;
    }

    if (type === 'dijkstra') {
      const dist = new Map<number, number>();
      const prev = new Map<number, number>();
      const prevEdge = new Map<number, number>();
      const unvisited = new Set<number>(nodes.map((n) => n.id));

      nodes.forEach((n) => dist.set(n.id, Infinity));
      dist.set(startNodeId, 0);

      while (unvisited.size > 0) {
        let u: number | null = null;
        for (const id of unvisited) {
          if (u === null || (dist.get(id) ?? Infinity) < (dist.get(u) ?? Infinity)) {
            u = id;
          }
        }
        if (u === null || (dist.get(u) ?? Infinity) === Infinity) break;
        unvisited.delete(u);
        if (u === endNodeId) break;

        for (const nb of getNeighbors(u)) {
          const weightVal = showWeights ? nb.weight : 1;
          const alt = (dist.get(u) ?? Infinity) + weightVal;
          if (alt < (dist.get(nb.to) ?? Infinity)) {
            dist.set(nb.to, alt);
            prev.set(nb.to, u);
            prevEdge.set(nb.to, nb.edgeId);
          }
        }
      }

      const targetCost = dist.get(endNodeId) ?? Infinity;
      if (targetCost === Infinity) {
        clearHighlights();
        setAlgoLog({
          title: 'Dijkstra Shortest Path',
          status: 'warning',
          primaryLine: `No directed or undirected path exists from ${getLabel(startNodeId)} to ${getLabel(endNodeId)}.`,
        });
      } else {
        const path: string[] = [];
        const hNodes: number[] = [];
        const hEdges: number[] = [];
        let curr: number | undefined = endNodeId;
        while (curr !== undefined) {
          path.unshift(getLabel(curr));
          hNodes.push(curr);
          const pe = prevEdge.get(curr);
          if (pe !== undefined) hEdges.push(pe);
          curr = prev.get(curr);
        }
        setHighlightedNodes(hNodes);
        setHighlightedEdges(hEdges);
        setAlgoLog({
          title: 'Dijkstra Shortest Path',
          status: 'success',
          primaryLine: `Optimal Path: ${path.join(' → ')}`,
          secondaryLine: `Total Minimum Weight: ${targetCost}`,
        });
      }
      return;
    }

    if (type === 'mst') {
      const visited = new Set<number>([startNodeId]);
      const hNodes: number[] = [startNodeId];
      const hEdges: number[] = [];
      const treeEdges: string[] = [];
      let totalWeight = 0;

      while (visited.size < nodes.length) {
        let bestEdge: { from: number; to: number; weight: number; edgeId: number } | null = null;
        for (const u of visited) {
          for (const nb of getNeighbors(u)) {
            if (!visited.has(nb.to)) {
              const w = showWeights ? nb.weight : 1;
              if (!bestEdge || w < bestEdge.weight) {
                bestEdge = { from: u, to: nb.to, weight: w, edgeId: nb.edgeId };
              }
            }
          }
        }
        if (!bestEdge) break;
        visited.add(bestEdge.to);
        hNodes.push(bestEdge.to);
        hEdges.push(bestEdge.edgeId);
        totalWeight += bestEdge.weight;
        treeEdges.push(`(${getLabel(bestEdge.from)}–${getLabel(bestEdge.to)}:${bestEdge.weight})`);
      }

      setHighlightedNodes(hNodes);
      setHighlightedEdges(hEdges);
      setAlgoLog({
        title: "Prim's Minimum Spanning Tree",
        status: visited.size === nodes.length ? 'success' : 'warning',
        primaryLine:
          treeEdges.length > 0 ? `MST Edges: ${treeEdges.join(', ')}` : 'Single isolated vertex.',
        secondaryLine: `Total MST Weight: ${totalWeight} · Covered ${visited.size}/${nodes.length} vertices`,
      });
      return;
    }

    // Topological Sort (Kahn's Algorithm for Directed Acyclic Graphs)
    if (!isDirected) {
      clearHighlights();
      setAlgoLog({
        title: 'Topological Ordering Requires Digraph',
        status: 'warning',
        primaryLine:
          'Enable "Directed Graph (Digraph)" or load the "Directed DAG" preset to compute a topological ordering.',
      });
      return;
    }

    const inDeg = new Map<number, number>();
    nodes.forEach((n) => inDeg.set(n.id, 0));
    edges.forEach((e) => inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1));

    const queue: number[] = [];
    nodes.forEach((n) => {
      if ((inDeg.get(n.id) ?? 0) === 0) queue.push(n.id);
    });

    const topoOrder: number[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      for (const e of edges) {
        if (e.from === u) {
          const nextDeg = (inDeg.get(e.to) ?? 0) - 1;
          inDeg.set(e.to, nextDeg);
          if (nextDeg === 0) queue.push(e.to);
        }
      }
    }

    if (topoOrder.length !== nodes.length) {
      clearHighlights();
      setAlgoLog({
        title: 'Cycle Detected (Not a DAG)',
        status: 'warning',
        primaryLine: `Directed cycle detected after ordering ${topoOrder.length} of ${nodes.length} vertices. Topological sort exists only for acyclic digraphs.`,
      });
    } else {
      setHighlightedNodes(topoOrder);
      setHighlightedEdges(edges.map((e) => e.id));
      setAlgoLog({
        title: "Kahn's Topological Sort",
        status: 'success',
        primaryLine: `Linear Order: ${topoOrder.map(getLabel).join(' → ')}`,
        secondaryLine: `Verified Directed Acyclic Graph (${nodes.length} vertices)`,
      });
    }
  };

  // ============================================================================
  // LIVE GRAPH INVARIANTS & REPRESENTATIONS
  // ============================================================================
  const invariants = useMemo(() => {
    const V = nodes.length;
    const E = edges.length;
    const maxE = isDirected ? V * (V - 1) : (V * (V - 1)) / 2;
    const density = maxE > 0 ? (E / maxE).toFixed(2) : '0.00';

    if (V === 0) {
      return {
        V: 0,
        E: 0,
        minDeg: 0,
        maxDeg: 0,
        avgDeg: '0.0',
        density: '0.00',
        connected: false,
        connectedLabel: 'Empty',
        eulerLabel: 'None',
      };
    }

    const vertexDegrees = nodes.map((n) => {
      if (isDirected) {
        const inD = edges.filter((e) => e.to === n.id).length;
        const outD = edges.filter((e) => e.from === n.id).length;
        return inD + outD;
      }
      return getNeighbors(n.id).length;
    });
    const minDeg = Math.min(...vertexDegrees);
    const maxDeg = Math.max(...vertexDegrees);
    const avgDeg = (
      vertexDegrees.reduce((acc, d) => acc + d, 0) / V
    ).toFixed(1);

    // Weak connectivity check
    const visited = new Set<number>([nodes[0].id]);
    const q: number[] = [nodes[0].id];
    while (q.length > 0) {
      const u = q.shift()!;
      for (const e of edges) {
        if (e.from === u && !visited.has(e.to)) {
          visited.add(e.to);
          q.push(e.to);
        }
        if (e.to === u && !visited.has(e.from)) {
          visited.add(e.from);
          q.push(e.from);
        }
      }
    }
    const connected = visited.size === V;

    let eulerLabel = 'Non-Eulerian';
    if (!connected) {
      eulerLabel = 'None';
    } else if (isDirected) {
      let balanced = 0;
      let startCand = 0;
      let endCand = 0;
      for (const n of nodes) {
        const outD = edges.filter((e) => e.from === n.id).length;
        const inD = edges.filter((e) => e.to === n.id).length;
        if (outD === inD) balanced++;
        else if (outD - inD === 1) startCand++;
        else if (inD - outD === 1) endCand++;
      }
      if (balanced === V) eulerLabel = 'Euler Circuit';
      else if (startCand === 1 && endCand === 1 && balanced === V - 2) eulerLabel = 'Euler Path';
      else eulerLabel = 'Digraph';
    } else {
      const oddCount = nodes.filter((n) => getNeighbors(n.id).length % 2 !== 0).length;
      if (oddCount === 0) eulerLabel = 'Euler Circuit';
      else if (oddCount === 2) eulerLabel = 'Euler Path';
      else eulerLabel = 'Non-Eulerian';
    }

    return {
      V,
      E,
      minDeg,
      maxDeg,
      avgDeg,
      density,
      connected,
      connectedLabel: connected ? 'Yes' : 'Disconnected',
      eulerLabel,
    };
  }, [nodes, edges, isDirected, getNeighbors]);

  const adjacencyMatrix = useMemo(() => {
    return nodes.map((rowNode) =>
      nodes.map((colNode) => {
        const edge = edges.find((e) =>
          isDirected
            ? e.from === rowNode.id && e.to === colNode.id
            : (e.from === rowNode.id && e.to === colNode.id) ||
              (e.from === colNode.id && e.to === rowNode.id)
        );
        if (!edge) return 0;
        return showWeights ? edge.weight : 1;
      })
    );
  }, [nodes, edges, isDirected, showWeights]);

  // ============================================================================
  // EXPORT PNG, JSON BACKUP/RESTORE & COPY LATEX
  // ============================================================================
  const handleExportPNG = () => {
    const link = document.createElement('a');
    if (viewMode === '3d' && threeContextRef.current) {
      const { renderer, scene, camera } = threeContextRef.current;
      renderer.render(scene, camera);
      link.download = 'university-tutors-graph-3d.png';
      link.href = renderer.domElement.toDataURL('image/png');
    } else if (canvas2dRef.current) {
      draw2D();
      link.download = 'university-tutors-graph-2d.png';
      link.href = canvas2dRef.current.toDataURL('image/png');
    } else {
      return;
    }
    link.click();
  };

  const handleExportPDF = () => {
    let dataUrl = '';
    let w = 960;
    let h = 560;
    if (viewMode === '3d' && threeContextRef.current) {
      const { renderer, scene, camera } = threeContextRef.current;
      renderer.render(scene, camera);
      dataUrl = renderer.domElement.toDataURL('image/png');
      w = renderer.domElement.width || 960;
      h = renderer.domElement.height || 560;
    } else if (canvas2dRef.current) {
      draw2D();
      dataUrl = canvas2dRef.current.toDataURL('image/png');
      w = canvas2dRef.current.width || 960;
      h = canvas2dRef.current.height || 560;
    } else {
      return;
    }

    downloadCanvasFigurePdf({
      filename: `Graph-Topology-${viewMode.toUpperCase()}.pdf`,
      title: `Graph Theory & Network Topology (${viewMode.toUpperCase()} View)`,
      subtitle: `${nodes.length} Vertices · ${edges.length} ${isDirected ? 'Directed' : 'Undirected'} Edges${showWeights ? ' (Weighted)' : ''}`,
      pngDataUrl: dataUrl,
      imgWidthPx: w,
      imgHeightPx: h,
      landscape: true,
    });
  };

  const handleSaveJSON = () => {
    const payload = JSON.stringify(
      {
        directed: isDirected,
        weighted: showWeights,
        nodes,
        edges,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'graph-topology.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('Invalid schema');
        }
        const cleanNodes: GraphNode[] = parsed.nodes
          .filter((n: unknown) => typeof n === 'object' && n !== null)
          .map((n: Record<string, unknown>, idx: number) => ({
            id: Number(n.id ?? idx + 1),
            label: String(n.label ?? LABELS[idx % LABELS.length]),
            x: Number(n.x ?? 220 + idx * 35),
            y: Number(n.y ?? 220),
          }));
        const cleanEdges: GraphEdge[] = parsed.edges
          .filter((ed: unknown) => typeof ed === 'object' && ed !== null)
          .map((ed: Record<string, unknown>, idx: number) => ({
            id: Number(ed.id ?? 500 + idx),
            from: Number(ed.from),
            to: Number(ed.to),
            weight: Math.max(1, Number(ed.weight ?? 1)),
          }));
        setIsDirected(Boolean(parsed.directed));
        if (typeof parsed.weighted === 'boolean') setShowWeights(parsed.weighted);
        setNodes(cleanNodes);
        setEdges(cleanEdges);
        clearHighlights();
        setImportFeedback({
          kind: 'success',
          text: `Loaded ${cleanNodes.length} vertices and ${cleanEdges.length} edges from ${file.name}.`,
        });
      } catch {
        setImportFeedback({
          kind: 'error',
          text: 'Invalid graph JSON file. Expected { directed, nodes, edges }.',
        });
      }
      setTimeout(() => setImportFeedback(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyRepresentation = async () => {
    if (nodes.length === 0) return;
    let output = '';

    if (activeRepTab === 'matrix') {
      const headerCols = nodes.map((n) => n.label).join(' & ');
      const bodyRows = adjacencyMatrix
        .map((row) => `  ${row.join(' & ')}`)
        .join(' \\\\\n');
      output = `% Vertices: (${headerCols})\nA = \\begin{pmatrix}\n${bodyRows}\n\\end{pmatrix}`;
    } else if (activeRepTab === 'list') {
      output = nodes
        .map((n) => {
          const nbrs = getNeighbors(n.id).map((nb) => {
            const lbl = nodes.find((x) => x.id === nb.to)?.label ?? '?';
            return showWeights ? `${lbl}(w:${nb.weight})` : lbl;
          });
          return `${n.label} -> [ ${nbrs.join(', ') || 'empty'} ]`;
        })
        .join('\n');
    } else {
      output = nodes
        .map((n) => {
          if (isDirected) {
            const inD = edges.filter((e) => e.to === n.id).length;
            const outD = edges.filter((e) => e.from === n.id).length;
            return `Vertex ${n.label}: deg-(${n.label}) = ${inD}, deg+(${n.label}) = ${outD}, total = ${inD + outD}`;
          }
          return `Vertex ${n.label}: deg(${n.label}) = ${getNeighbors(n.id).length}`;
        })
        .join('\n');
    }

    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedRep(true);
    setTimeout(() => setCopiedRep(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Studio Utility Strip: Export PNG, Load JSON & Save Graph JSON */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-[#111827]">Graph Theory Studio</span>
          <span aria-hidden="true">·</span>
          <span>Discrete Math, DSA &amp; 2D/3D Network Topology Visualizer</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleLoadJSON}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-xl border border-slate-200 bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Load JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportPNG}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-xl border border-slate-300 bg-[#FFFFFF] hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Export PNG</span>
          </button>

          <button
            type="button"
            onClick={handleSaveJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-xl border border-slate-300 bg-[#FFFFFF] hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Save JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div
          className={`rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 border ${
            importFeedback.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {importFeedback.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{importFeedback.text}</span>
        </div>
      )}

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT SIDEBAR: Parametric Min-Max Generator, Random Graphs, Presets & Simulator */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          {/* 01. Graph Topology & Random Generator */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-4">
            <h2 className="text-xs font-bold text-[#111827] mb-2.5">
              01. Graph Topology &amp; Generator
            </h2>

            {/* Category Tabs: Scale |V| & Deg | Random Graphs | Classic Presets */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-3">
              {(
                [
                  { id: 'parametric', label: 'Scale |V| & Deg' },
                  { id: 'random', label: 'Random Graphs' },
                  { id: 'presets', label: 'Presets' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGeneratorCategory(cat.id)}
                  className={`flex-1 py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    generatorCategory === cat.id
                      ? 'bg-[#FFFFFF] text-[#111827] shadow-2xs'
                      : 'text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Parametric Vertex & Degree Scaling (Min -> Max) */}
            {generatorCategory === 'parametric' && (
              <div className="space-y-3">
                {/* Vertices |V| Min to Max Control */}
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs tabular-nums">
                    <label htmlFor="gt-param-vertices" className="font-semibold text-slate-700">
                      Vertices |V|
                    </label>
                    <span className="font-mono font-bold text-[#111827]">
                      {paramVertices} <span className="text-slate-400 font-normal">/ 20</span>
                    </span>
                  </div>

                  <input
                    id="gt-param-vertices"
                    type="range"
                    min={2}
                    max={20}
                    step={1}
                    value={paramVertices}
                    onChange={(e) => {
                      const nextV = Number(e.target.value);
                      const nextK =
                        activeParamFamily === 'complete'
                          ? nextV - 1
                          : Math.min(paramDegree, nextV - 1);
                      handleApplyParametric(nextV, nextK);
                    }}
                    className="w-full accent-[#F97316] cursor-pointer"
                  />

                  <div className="grid grid-cols-4 gap-1 pt-0.5 tabular-nums">
                    <button
                      type="button"
                      onClick={() => handleApplyParametric(2, Math.min(paramDegree, 1))}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Min (2)
                    </button>
                    <button
                      type="button"
                      disabled={paramVertices <= 2}
                      onClick={() => {
                        const nextV = Math.max(2, paramVertices - 1);
                        handleApplyParametric(
                          nextV,
                          activeParamFamily === 'complete'
                            ? nextV - 1
                            : Math.min(paramDegree, nextV - 1)
                        );
                      }}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center justify-center gap-0.5 whitespace-nowrap"
                    >
                      <Minus className="w-3 h-3" />
                      <span>1</span>
                    </button>
                    <button
                      type="button"
                      disabled={paramVertices >= 20}
                      onClick={() => {
                        const nextV = Math.min(20, paramVertices + 1);
                        handleApplyParametric(
                          nextV,
                          activeParamFamily === 'complete' ? nextV - 1 : paramDegree
                        );
                      }}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center justify-center gap-0.5 whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyParametric(
                          20,
                          activeParamFamily === 'complete' ? 19 : paramDegree
                        )
                      }
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Max (20)
                    </button>
                  </div>
                </div>

                {/* Vertex Degree k Min (0) to Max (|V| - 1) Control */}
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs tabular-nums">
                    <label htmlFor="gt-param-degree" className="font-semibold text-slate-700">
                      Vertex Degree k
                    </label>
                    <span className="font-mono font-bold text-[#EA580C]">
                      k = {Math.min(paramDegree, paramVertices - 1)}{' '}
                      <span className="text-slate-400 font-normal">
                        / {paramVertices - 1}
                      </span>
                    </span>
                  </div>

                  <input
                    id="gt-param-degree"
                    type="range"
                    min={0}
                    max={Math.max(1, paramVertices - 1)}
                    step={1}
                    value={Math.min(paramDegree, paramVertices - 1)}
                    onChange={(e) => {
                      const nextK = Number(e.target.value);
                      const autoFamily: ParametricFamily =
                        nextK === 0
                          ? 'empty'
                          : nextK === paramVertices - 1
                          ? 'complete'
                          : 'regular';
                      handleApplyParametric(paramVertices, nextK, autoFamily);
                    }}
                    className="w-full accent-[#F97316] cursor-pointer"
                  />

                  <div className="grid grid-cols-4 gap-1 pt-0.5 tabular-nums">
                    <button
                      type="button"
                      onClick={() => handleApplyParametric(paramVertices, 0, 'empty')}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Min (0)
                    </button>
                    <button
                      type="button"
                      disabled={paramDegree <= 0}
                      onClick={() => {
                        const nextK = Math.max(0, Math.min(paramDegree, paramVertices - 1) - 1);
                        handleApplyParametric(
                          paramVertices,
                          nextK,
                          nextK === 0 ? 'empty' : 'regular'
                        );
                      }}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center justify-center gap-0.5 whitespace-nowrap"
                    >
                      <Minus className="w-3 h-3" />
                      <span>1</span>
                    </button>
                    <button
                      type="button"
                      disabled={paramDegree >= paramVertices - 1}
                      onClick={() => {
                        const nextK = Math.min(paramVertices - 1, paramDegree + 1);
                        handleApplyParametric(
                          paramVertices,
                          nextK,
                          nextK === paramVertices - 1 ? 'complete' : 'regular'
                        );
                      }}
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center justify-center gap-0.5 whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyParametric(paramVertices, paramVertices - 1, 'complete')
                      }
                      className="py-1 px-1.5 text-[11px] font-semibold rounded-lg border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 text-[#EA580C] cursor-pointer whitespace-nowrap"
                    >
                      Max ({paramVertices - 1})
                    </button>
                  </div>
                </div>

                {/* Quick Parametric Families at Current |V| */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Graph Families at |V| = {paramVertices}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'empty', label: 'Empty Eₙ' },
                        { id: 'path', label: 'Path Pₙ' },
                        { id: 'cycle', label: 'Cycle Cₙ' },
                        { id: 'star', label: 'Star Sₙ' },
                        { id: 'wheel', label: 'Wheel Wₙ' },
                        { id: 'complete', label: 'Complete Kₙ' },
                      ] as const
                    ).map((fam) => {
                      const isSel = activePreset === null && activeParamFamily === fam.id;
                      return (
                        <button
                          key={fam.id}
                          type="button"
                          onClick={() => handleApplyParametric(paramVertices, paramDegree, fam.id)}
                          className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            isSel
                              ? 'border-orange-300 bg-[#FFF7ED] text-[#EA580C]'
                              : 'border-slate-200 bg-white hover:border-orange-200 text-slate-700'
                          }`}
                        >
                          {fam.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeParamFamily === 'regular' &&
                  paramVertices % 2 === 1 &&
                  paramDegree % 2 === 1 && (
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Handshaking Lemma: odd |V| cannot all have odd degree, so {paramVertices - 1}{' '}
                      vertices have deg {paramDegree} and 1 has deg {paramDegree - 1}.
                    </p>
                  )}
              </div>
            )}

            {/* TAB 2: Random Graph Generator Category */}
            {generatorCategory === 'random' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      {
                        id: 'erdos-renyi',
                        title: 'Erdős–Rényi',
                        sub: 'G(n, p) random',
                      },
                      {
                        id: 'random-regular',
                        title: 'Random k-Reg',
                        sub: 'Fixed degree k',
                      },
                      {
                        id: 'random-tree',
                        title: 'Spanning Tree',
                        sub: 'Connected acyclic',
                      },
                      {
                        id: 'scale-free',
                        title: 'Scale-Free (BA)',
                        sub: 'Hub attachment',
                      },
                      {
                        id: 'small-world',
                        title: 'Small-World',
                        sub: 'Watts–Strogatz',
                      },
                      {
                        id: 'random-dag',
                        title: 'Random DAG',
                        sub: 'Acyclic digraph',
                      },
                    ] as const
                  ).map((mdl) => {
                    const isSel = randomModel === mdl.id;
                    return (
                      <button
                        key={mdl.id}
                        type="button"
                        onClick={() => handleGenerateRandom(mdl.id)}
                        className={`text-left p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSel
                            ? 'border-orange-300 bg-[#FFF7ED]'
                            : 'border-slate-200 bg-white hover:border-orange-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#111827] whitespace-nowrap truncate">
                          {mdl.title}
                        </div>
                        <div className="text-[10px] text-slate-500 whitespace-nowrap truncate">
                          {mdl.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Random Vertices |V| Slider */}
                <div className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-2.5 space-y-2 tabular-nums">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <label htmlFor="gt-rand-vertices" className="font-semibold text-slate-700">
                        Vertices |V|
                      </label>
                      <span className="font-mono font-bold text-[#111827]">
                        {randomVertices} <span className="text-slate-400 font-normal">(3–20)</span>
                      </span>
                    </div>
                    <input
                      id="gt-rand-vertices"
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={randomVertices}
                      onChange={(e) => {
                        const nextV = Number(e.target.value);
                        handleGenerateRandom(
                          randomModel,
                          nextV,
                          randomDensityPct,
                          Math.min(randomTargetDegree, nextV - 1)
                        );
                      }}
                      className="w-full accent-[#F97316] cursor-pointer"
                    />
                  </div>

                  {(randomModel === 'erdos-renyi' || randomModel === 'random-dag') && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label htmlFor="gt-rand-density" className="font-semibold text-slate-700">
                          Edge Probability p
                        </label>
                        <span className="font-mono font-bold text-[#EA580C]">
                          {randomDensityPct}%
                        </span>
                      </div>
                      <input
                        id="gt-rand-density"
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={randomDensityPct}
                        onChange={(e) =>
                          handleGenerateRandom(
                            randomModel,
                            randomVertices,
                            Number(e.target.value),
                            randomTargetDegree
                          )
                        }
                        className="w-full accent-[#F97316] cursor-pointer"
                      />
                    </div>
                  )}

                  {(randomModel === 'random-regular' ||
                    randomModel === 'scale-free' ||
                    randomModel === 'small-world') && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label htmlFor="gt-rand-degree" className="font-semibold text-slate-700">
                          Target Degree k
                        </label>
                        <span className="font-mono font-bold text-[#EA580C]">
                          {Math.min(randomTargetDegree, randomVertices - 1)} / {randomVertices - 1}
                        </span>
                      </div>
                      <input
                        id="gt-rand-degree"
                        type="range"
                        min={randomModel === 'small-world' ? 2 : 0}
                        max={Math.max(2, randomVertices - 1)}
                        step={1}
                        value={Math.min(randomTargetDegree, randomVertices - 1)}
                        onChange={(e) =>
                          handleGenerateRandom(
                            randomModel,
                            randomVertices,
                            randomDensityPct,
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-[#F97316] cursor-pointer"
                      />
                    </div>
                  )}

                  {randomModel === 'random-tree' && (
                    <div className="text-[11px] text-slate-500">
                      Tree invariant: |E| = {randomVertices - 1} edges · Connected &amp; acyclic
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateRandom()}
                  className="w-full py-2 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Generate New Random Graph</span>
                </button>
              </div>
            )}

            {/* TAB 3: Classic Discrete Math Presets */}
            {generatorCategory === 'presets' && (
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      id: 'weighted',
                      title: 'Weighted Network',
                      sub: '6V · Dijkstra / MST',
                    },
                    {
                      id: 'petersen',
                      title: 'Petersen Graph',
                      sub: '10V · 3-regular',
                    },
                    {
                      id: 'bipartite',
                      title: 'Complete K₃,₃',
                      sub: '6V · Bipartite',
                    },
                    {
                      id: 'dag',
                      title: 'Directed DAG',
                      sub: '6V · Topo sort',
                    },
                    {
                      id: 'hypercube',
                      title: 'Hypercube Q₃',
                      sub: '8V · 3-regular cube',
                    },
                    {
                      id: 'octahedron',
                      title: 'Octahedron',
                      sub: '6V · 4-regular',
                    },
                  ] as const
                ).map((preset) => {
                  const isCurrent = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadPreset(preset.id)}
                      className={`text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-orange-300 bg-[#FFF7ED]'
                          : 'border-slate-200 bg-[#FFFFFF] hover:border-orange-300 hover:bg-[#FFF7ED]/50'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#111827] whitespace-nowrap truncate">
                        {preset.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap truncate">
                        {preset.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 02. Graph Rules, Quick Step Mutators & Layout */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-4">
            <h2 className="text-xs font-bold text-[#111827] mb-3">
              02. Graph Rules &amp; Step Adjusters
            </h2>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-slate-700">Directed Graph (Digraph)</span>
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={(e) => {
                    setIsDirected(e.target.checked);
                    clearHighlights();
                  }}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-slate-700">Weighted Edges</span>
                <input
                  type="checkbox"
                  checked={showWeights}
                  onChange={(e) => setShowWeights(e.target.checked)}
                  className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                />
              </label>

              {/* Incremental Step Buttons for ANY Current Custom/Preset Graph */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  disabled={nodes.length <= 2}
                  onClick={() => handleStepActiveVertex(-1)}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-xl border border-slate-200 bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  −1 Vertex
                </button>
                <button
                  type="button"
                  disabled={nodes.length >= 26}
                  onClick={() => handleStepActiveVertex(1)}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-xl border border-slate-200 bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  +1 Vertex
                </button>
                <button
                  type="button"
                  disabled={edges.length === 0}
                  onClick={() => handleStepActiveDegree(-1)}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-xl border border-slate-200 bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  − Lower Degree
                </button>
                <button
                  type="button"
                  disabled={nodes.length < 2}
                  onClick={() => handleStepActiveDegree(1)}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-xl border border-orange-200 bg-[#FFF7ED] hover:bg-orange-100 text-[#EA580C] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  + Raise Degree
                </button>
              </div>

              <button
                type="button"
                onClick={applyCircularLayout}
                className="w-full mt-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Auto-Arrange Circular Layout
              </button>
            </div>
          </div>

          {/* 03. Algorithm Step Simulator */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-4 flex-1 flex flex-col">
            <h2 className="text-xs font-bold text-[#111827] mb-3">03. Algorithm Step Simulator</h2>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label
                  htmlFor="gt-start-node"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Start Node
                </label>
                <select
                  id="gt-start-node"
                  value={startNodeId}
                  onChange={(e) => setStartNodeId(Number(e.target.value))}
                  disabled={nodes.length === 0}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white font-semibold text-[#111827] focus:border-[#F97316] focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      Vertex {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="gt-end-node"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Target Node
                </label>
                <select
                  id="gt-end-node"
                  value={endNodeId}
                  onChange={(e) => setEndNodeId(Number(e.target.value))}
                  disabled={nodes.length === 0}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white font-semibold text-[#111827] focus:border-[#F97316] focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      Vertex {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => runAlgorithm('dijkstra')}
                className="py-2 px-2.5 text-xs font-semibold rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Dijkstra Shortest
              </button>
              <button
                type="button"
                onClick={() => runAlgorithm('mst')}
                className="py-2 px-2.5 text-xs font-semibold rounded-xl bg-[#111827] hover:bg-slate-800 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Prim&apos;s MST
              </button>
              <button
                type="button"
                onClick={() => runAlgorithm('bfs')}
                className="py-2 px-2.5 text-xs font-semibold rounded-xl border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
              >
                BFS Traversal
              </button>
              <button
                type="button"
                onClick={() => runAlgorithm('dfs')}
                className="py-2 px-2.5 text-xs font-semibold rounded-xl border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
              >
                DFS Traversal
              </button>
            </div>

            <button
              type="button"
              onClick={() => runAlgorithm('toposort')}
              className="w-full py-1.5 px-2.5 mb-2 text-xs font-semibold rounded-xl border border-slate-200 bg-[#F9FAFB] hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Topological Sort (DAG)
            </button>

            <button
              type="button"
              onClick={() => {
                clearHighlights();
                setAlgoLog({
                  title: 'Highlights Cleared',
                  status: 'ready',
                  primaryLine:
                    'Select an algorithm above to trace shortest paths, spanning trees, or vertex traversals.',
                });
              }}
              className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-[#111827] underline mb-3 cursor-pointer"
            >
              Reset Algorithm Highlights
            </button>

            {/* Step Output Console */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs font-mono flex-1 min-h-[124px] overflow-y-auto leading-relaxed space-y-1.5">
              <div
                className={`font-semibold ${
                  algoLog.status === 'warning'
                    ? 'text-amber-400'
                    : algoLog.status === 'success'
                    ? 'text-orange-400'
                    : 'text-slate-300'
                }`}
              >
                {algoLog.title}
              </div>
              <div
                className={
                  algoLog.status === 'success' ? 'text-emerald-300 font-semibold' : 'text-slate-200'
                }
              >
                {algoLog.primaryLine}
              </div>
              {algoLog.secondaryLine && (
                <div className="text-slate-300 tabular-nums">{algoLog.secondaryLine}</div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER INTERACTIVE STAGE: 2D Canvas + 3D Three.js Topology Preview */}
        <section className="lg:col-span-6 flex flex-col gap-3">
          {/* Mode & View Switcher Toolbar */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'select', label: 'Move / Select' },
                  { id: 'node', label: '+ Add Vertex' },
                  { id: 'edge', label: '+ Connect Edge' },
                  { id: 'delete', label: 'Delete' },
                ] as const
              ).map((m) => {
                const isActive = mode === m.id;
                const activeClasses =
                  m.id === 'delete'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#F97316] text-white';
                const inactiveClasses =
                  m.id === 'delete'
                    ? 'bg-slate-100 text-red-600 hover:bg-red-50'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={viewMode === '3d'}
                    onClick={() => {
                      setMode(m.id);
                      setEdgeSourceId(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 ${
                      isActive ? activeClasses : inactiveClasses
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* 2D / 3D Segmented View Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('2d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === '2d'
                      ? 'bg-[#FFFFFF] text-[#111827] shadow-2xs'
                      : 'text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  2D Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === '3d'
                      ? 'bg-[#F97316] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#EA580C]'
                  }`}
                >
                  3D Preview
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                  setEdgeSourceId(null);
                  clearHighlights();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Interactive Canvas & WebGL Container */}
          <div
            ref={stageContainerRef}
            className="relative bg-[#FFFFFF] rounded-2xl border border-slate-200 overflow-hidden flex-1 min-h-[480px]"
          >
            {/* 2D Canvas */}
            <canvas
              ref={canvas2dRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className={`w-full h-full block touch-none ${
                viewMode === '3d'
                  ? 'hidden'
                  : mode === 'select'
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-crosshair'
              }`}
            />

            {/* Dedicated Empty Mount Container for Three.js WebGLRenderer (Outside HUD Overlays) */}
            <div
              ref={threeMountRef}
              className={`w-full h-full absolute inset-0 bg-[#090d16] cursor-grab active:cursor-grabbing ${
                viewMode === '3d' ? 'block' : 'hidden'
              }`}
            />

            {/* 2D Hint Bar */}
            {viewMode === '2d' && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-[#FFFFFF] border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-600 pointer-events-none">
                {mode === 'edge' && edgeSourceId !== null
                  ? 'Click a destination vertex to complete the edge connection'
                  : edges.length > 45 && showWeights
                  ? 'Dense graph: edge weight badges appear on highlighted algorithm paths'
                  : 'Tip: Drag vertices to rearrange · Click an edge weight badge in Move mode to cycle 1–15'}
              </div>
            )}

            {/* 3D Unified Collapsible Bottom Dock (Zero backdrop-filter over WebGL, zero side clutter) */}
            {viewMode === '3d' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[540px] flex flex-col items-center pointer-events-none">
                <button
                  type="button"
                  onClick={() => setIsHudCollapsed((prev) => !prev)}
                  className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-t-lg bg-slate-900 text-slate-200 border border-b-0 border-slate-700 text-[11px] font-medium hover:text-white cursor-pointer"
                >
                  {isHudCollapsed ? (
                    <>
                      <ChevronUp className="w-3 h-3 text-orange-400" />
                      <span>Show Controls (H)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 text-orange-400" />
                      <span>Hide Controls (H)</span>
                    </>
                  )}
                </button>

                {!isHudCollapsed && (
                  <div className="pointer-events-auto w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 shadow-lg">
                    <span className="text-[11px] text-slate-300">
                      Drag to orbit · Scroll to zoom · Synced with 2D graph
                    </span>

                    <div className="flex items-center gap-2.5 ml-auto">
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-200 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={autoRotate3D}
                          onChange={(e) => setAutoRotate3D(e.target.checked)}
                          className="accent-[#F97316] cursor-pointer"
                        />
                        <span>Auto-Rotate</span>
                      </label>

                      <button
                        type="button"
                        onClick={reset3DCamera}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3 h-3 text-orange-400" />
                        <span>Reset View</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Graph Invariants Bar (including Min δ & Max Δ Degree) */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-3.5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 text-center tabular-nums">
            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Vertices |V|</div>
              <div className="text-base font-display font-bold text-[#111827]">{invariants.V}</div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Edges |E|</div>
              <div className="text-base font-display font-bold text-[#111827]">{invariants.E}</div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Min / Max Deg</div>
              <div className="text-xs sm:text-sm font-display font-bold text-[#111827] mt-0.5">
                δ={invariants.minDeg} · Δ={invariants.maxDeg}
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Density</div>
              <div className="text-base font-display font-bold text-[#EA580C]">
                {invariants.density}
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Connected?</div>
              <div
                className={`text-xs sm:text-sm font-bold mt-0.5 ${
                  invariants.V === 0
                    ? 'text-slate-400'
                    : invariants.connected
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {invariants.connectedLabel}
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 font-medium">Eulerian</div>
              <div className="text-xs font-bold text-slate-800 mt-1">{invariants.eulerLabel}</div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR: Live Matrices, Representations & CS Tutor Conversion */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h2 className="text-xs font-bold text-[#111827]">Live Graph Representations</h2>
              <span className="text-[11px] font-medium text-[#EA580C]">Auto-Synced</span>
            </div>

            {/* Segmented Representation Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-3">
              {(
                [
                  { id: 'matrix', label: 'Adjacency Matrix' },
                  { id: 'list', label: 'Adj. List' },
                  { id: 'degrees', label: 'Degrees' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRepTab(tab.id)}
                  className={`flex-1 py-1.5 px-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeRepTab === tab.id
                      ? 'bg-[#FFFFFF] text-[#111827] shadow-2xs'
                      : 'text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Representation Data Output */}
            <div className="flex-1 overflow-auto text-xs font-mono bg-[#F9FAFB] border border-slate-200 rounded-xl p-3 max-h-[340px] lg:max-h-none tabular-nums">
              {nodes.length === 0 ? (
                <span className="text-slate-400 font-sans">
                  Add vertices on the canvas or select a preset to compute matrices...
                </span>
              ) : activeRepTab === 'matrix' ? (
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-[#EA580C]"></th>
                      {nodes.map((n) => (
                        <th key={n.id} className="p-1 text-[#EA580C] font-bold">
                          {n.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((rowNode, rIdx) => (
                      <tr key={rowNode.id}>
                        <td className="p-1 font-bold text-[#EA580C]">{rowNode.label}</td>
                        {adjacencyMatrix[rIdx].map((val, cIdx) => (
                          <td
                            key={nodes[cIdx].id}
                            className={`p-1 border border-slate-200 ${
                              val > 0
                                ? 'bg-[#FFF7ED] font-bold text-[#111827]'
                                : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeRepTab === 'list' ? (
                <div className="space-y-1.5">
                  {nodes.map((n) => {
                    const nbrs = getNeighbors(n.id).map((nb) => {
                      const lbl = nodes.find((x) => x.id === nb.to)?.label ?? '?';
                      return showWeights ? `${lbl}(w:${nb.weight})` : lbl;
                    });
                    return (
                      <div key={n.id} className="leading-relaxed">
                        <span className="font-bold text-[#EA580C]">{n.label}</span>
                        <span className="text-slate-400"> → </span>
                        <span className="text-slate-800">[ {nbrs.join(', ') || '∅'} ]</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-sans">
                    <span>
                      Min δ = <strong className="text-[#111827]">{invariants.minDeg}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Max Δ = <strong className="text-[#EA580C]">{invariants.maxDeg}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Avg = <strong className="text-[#111827]">{invariants.avgDeg}</strong>
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {nodes.map((n) => {
                      if (isDirected) {
                        const inD = edges.filter((e) => e.to === n.id).length;
                        const outD = edges.filter((e) => e.from === n.id).length;
                        return (
                          <div
                            key={n.id}
                            className="flex items-center justify-between py-1.5 gap-2"
                          >
                            <span className="font-semibold text-[#111827]">Vertex {n.label}</span>
                            <span className="text-slate-700">
                              in: <strong className="text-[#111827]">{inD}</strong> · out:{' '}
                              <strong className="text-[#111827]">{outD}</strong>
                            </span>
                          </div>
                        );
                      }
                      const deg = getNeighbors(n.id).length;
                      return (
                        <div
                          key={n.id}
                          className="flex items-center justify-between py-1.5 gap-2"
                        >
                          <span>
                            Vertex <strong className="text-[#111827]">{n.label}</strong>
                          </span>
                          <span>
                            deg({n.label}) = <strong className="text-[#111827]">{deg}</strong>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyRepresentation}
              disabled={nodes.length === 0}
              className="mt-3 w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 text-[#EA580C] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {copiedRep ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy LaTeX / Matrix for Lab Report</span>
                </>
              )}
            </button>
          </div>

          {/* University-Tutors.com 1-on-1 Discrete Math & CS Conversion Card */}
          <div className="bg-[#FFF7ED] rounded-2xl border border-orange-200 p-4 space-y-2.5">
            <p className="text-[11px] font-bold text-[#EA580C]">
              1-on-1 Discrete Math &amp; CS Coaching
            </p>
            <h3 className="text-sm font-display font-bold text-[#111827] leading-snug">
              Stuck on Discrete Math, Graph Proofs, or DSA Assignments?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Book a live whiteboard session with verified Computer Science &amp; Mathematics tutors.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('subject:Discrete Mathematics')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Connect with a CS Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
