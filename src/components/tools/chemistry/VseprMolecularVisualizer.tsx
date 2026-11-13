import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Download,
  FileDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Atom,
} from 'lucide-react';
import { downloadCanvasFigurePdf } from '../../../utils/pdfReportGenerator';

// ============================================================================
// CPK ELEMENT PALETTE & COVALENT RADII
// ============================================================================
interface ElementVisualSpec {
  symbol: string;
  name: string;
  hex: number;
  cssColor: string;
  textOnBadge: string;
  radius: number; // Ball-and-stick base radius
  vdwRadius: number; // Space-filling Van der Waals radius
}

const ELEMENT_SPECS: Record<string, ElementVisualSpec> = {
  H: { symbol: 'H', name: 'Hydrogen', hex: 0xf8fafc, cssColor: '#F8FAFC', textOnBadge: '#0F172A', radius: 13, vdwRadius: 28 },
  Be: { symbol: 'Be', name: 'Beryllium', hex: 0x84cc16, cssColor: '#84CC16', textOnBadge: '#0F172A', radius: 17, vdwRadius: 34 },
  B: { symbol: 'B', name: 'Boron', hex: 0xfb7185, cssColor: '#FB7185', textOnBadge: '#FFFFFF', radius: 18, vdwRadius: 36 },
  C: { symbol: 'C', name: 'Carbon', hex: 0x334155, cssColor: '#334155', textOnBadge: '#FFFFFF', radius: 19, vdwRadius: 39 },
  N: { symbol: 'N', name: 'Nitrogen', hex: 0x2563eb, cssColor: '#2563EB', textOnBadge: '#FFFFFF', radius: 19, vdwRadius: 37 },
  O: { symbol: 'O', name: 'Oxygen', hex: 0xdc2626, cssColor: '#DC2626', textOnBadge: '#FFFFFF', radius: 18, vdwRadius: 35 },
  F: { symbol: 'F', name: 'Fluorine', hex: 0x10b981, cssColor: '#10B981', textOnBadge: '#FFFFFF', radius: 17, vdwRadius: 34 },
  P: { symbol: 'P', name: 'Phosphorus', hex: 0xf97316, cssColor: '#F97316', textOnBadge: '#FFFFFF', radius: 22, vdwRadius: 43 },
  S: { symbol: 'S', name: 'Sulfur', hex: 0xeab308, cssColor: '#EAB308', textOnBadge: '#0F172A', radius: 22, vdwRadius: 43 },
  Cl: { symbol: 'Cl', name: 'Chlorine', hex: 0x16a34a, cssColor: '#16A34A', textOnBadge: '#FFFFFF', radius: 21, vdwRadius: 42 },
  Br: { symbol: 'Br', name: 'Bromine', hex: 0x991b1b, cssColor: '#991B1B', textOnBadge: '#FFFFFF', radius: 23, vdwRadius: 45 },
  Xe: { symbol: 'Xe', name: 'Xenon', hex: 0x06b6d4, cssColor: '#06B6D4', textOnBadge: '#0F172A', radius: 25, vdwRadius: 48 },
};

export interface MoleculePreset {
  id: string;
  formulaDisplay: string;
  name: string;
  centralElement: string;
  ligandElement: string;
  bondOrder: 1 | 2;
  bondAngleNumeric: number;
  bondAngleLabel: string;
  polarity: 'Nonpolar (μ = 0 D)' | 'Polar (μ > 0 D)';
  notes: string;
}

export interface VseprGeometryClass {
  code: string;
  displayCode: string;
  bonds: number;
  lonePairs: number;
  electronGeo: string;
  molecularGeo: string;
  hybridization: string;
  idealAngles: string;
  bondVectors: [number, number, number][]; // Unit directions for X ligands
  lonePairVectors: [number, number, number][]; // Unit directions for E lone pairs
  anglePairIndices: [number, number]; // Indices into bondVectors for angle arc
  molecules: MoleculePreset[];
}

// Helper to convert spherical/polar degrees to unit Cartesian [x, y, z]
function degVec(polarDeg: number, azimuthDeg: number): [number, number, number] {
  const p = (polarDeg * Math.PI) / 180;
  const a = (azimuthDeg * Math.PI) / 180;
  return [
    Number((Math.sin(p) * Math.cos(a)).toFixed(5)),
    Number(Math.cos(p).toFixed(5)),
    Number((Math.sin(p) * Math.sin(a)).toFixed(5)),
  ];
}

// Scientifically calibrated 3D unit vectors for all 13 VSEPR classes (AX2 to AX4E2)
export const VSEPR_CLASSES: VseprGeometryClass[] = [
  {
    code: 'AX2',
    displayCode: 'AX₂',
    bonds: 2,
    lonePairs: 0,
    electronGeo: 'Linear',
    molecularGeo: 'Linear',
    hybridization: 'sp',
    idealAngles: '180°',
    bondVectors: [
      [-1, 0, 0],
      [1, 0, 0],
    ],
    lonePairVectors: [],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'co2',
        formulaDisplay: 'CO₂',
        name: 'Carbon Dioxide',
        centralElement: 'C',
        ligandElement: 'O',
        bondOrder: 2,
        bondAngleNumeric: 180,
        bondAngleLabel: '180°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Two C=O double bonds oppose at 180°; bond dipoles cancel completely.',
      },
      {
        id: 'becl2',
        formulaDisplay: 'BeCl₂',
        name: 'Beryllium Chloride (Gas)',
        centralElement: 'Be',
        ligandElement: 'Cl',
        bondOrder: 1,
        bondAngleNumeric: 180,
        bondAngleLabel: '180°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Electron-deficient central Be atom with two sp bonding domains.',
      },
    ],
  },
  {
    code: 'AX3',
    displayCode: 'AX₃',
    bonds: 3,
    lonePairs: 0,
    electronGeo: 'Trigonal Planar',
    molecularGeo: 'Trigonal Planar',
    hybridization: 'sp²',
    idealAngles: '120°',
    bondVectors: [
      [0, 1, 0],
      [Math.sin((120 * Math.PI) / 180), Math.cos((120 * Math.PI) / 180), 0],
      [-Math.sin((120 * Math.PI) / 180), Math.cos((120 * Math.PI) / 180), 0],
    ],
    lonePairVectors: [],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'bf3',
        formulaDisplay: 'BF₃',
        name: 'Boron Trifluoride',
        centralElement: 'B',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 120,
        bondAngleLabel: '120°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Three symmetric B–F bonds in a flat plane at exact 120° separation.',
      },
      {
        id: 'so3',
        formulaDisplay: 'SO₃',
        name: 'Sulfur Trioxide',
        centralElement: 'S',
        ligandElement: 'O',
        bondOrder: 2,
        bondAngleNumeric: 120,
        bondAngleLabel: '120°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Three equivalent resonance-delocalized S=O domains in a planar triangle.',
      },
    ],
  },
  {
    code: 'AX2E',
    displayCode: 'AX₂E',
    bonds: 2,
    lonePairs: 1,
    electronGeo: 'Trigonal Planar',
    molecularGeo: 'Bent (Angular)',
    hybridization: 'sp²',
    idealAngles: '< 120° (~119°)',
    bondVectors: [
      [Math.sin((59.5 * Math.PI) / 180), -Math.cos((59.5 * Math.PI) / 180), 0],
      [-Math.sin((59.5 * Math.PI) / 180), -Math.cos((59.5 * Math.PI) / 180), 0],
    ],
    lonePairVectors: [[0, 1, 0]],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'so2',
        formulaDisplay: 'SO₂',
        name: 'Sulfur Dioxide',
        centralElement: 'S',
        ligandElement: 'O',
        bondOrder: 2,
        bondAngleNumeric: 119,
        bondAngleLabel: '119°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'One sp² lone pair compresses the O=S=O angle slightly below 120°.',
      },
      {
        id: 'o3',
        formulaDisplay: 'O₃',
        name: 'Ozone',
        centralElement: 'O',
        ligandElement: 'O',
        bondOrder: 2,
        bondAngleNumeric: 116.8,
        bondAngleLabel: '116.8°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Central oxygen carries a formal +1 charge and one non-bonding lone pair.',
      },
    ],
  },
  {
    code: 'AX4',
    displayCode: 'AX₄',
    bonds: 4,
    lonePairs: 0,
    electronGeo: 'Tetrahedral',
    molecularGeo: 'Tetrahedral',
    hybridization: 'sp³',
    idealAngles: '109.5°',
    bondVectors: [
      [0, 1, 0],
      degVec(109.471, 0),
      degVec(109.471, 120),
      degVec(109.471, 240),
    ],
    lonePairVectors: [],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'ch4',
        formulaDisplay: 'CH₄',
        name: 'Methane',
        centralElement: 'C',
        ligandElement: 'H',
        bondOrder: 1,
        bondAngleNumeric: 109.5,
        bondAngleLabel: '109.5°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Classic sp³ tetrahedron maximizing 3D separation across four C–H bonds.',
      },
      {
        id: 'ccl4',
        formulaDisplay: 'CCl₄',
        name: 'Carbon Tetrachloride',
        centralElement: 'C',
        ligandElement: 'Cl',
        bondOrder: 1,
        bondAngleNumeric: 109.5,
        bondAngleLabel: '109.5°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Polar C–Cl bonds cancel symmetrically across the tetrahedral vertices.',
      },
    ],
  },
  {
    code: 'AX3E',
    displayCode: 'AX₃E',
    bonds: 3,
    lonePairs: 1,
    electronGeo: 'Tetrahedral',
    molecularGeo: 'Trigonal Pyramidal',
    hybridization: 'sp³',
    idealAngles: '107°',
    // 3 basal bonds compressed so X-A-X angle is ~107° (polar angle from -Y ~67.9°, i.e. 112.1° from +Y)
    bondVectors: [
      degVec(112.1, 0),
      degVec(112.1, 120),
      degVec(112.1, 240),
    ],
    lonePairVectors: [[0, 1, 0]],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'nh3',
        formulaDisplay: 'NH₃',
        name: 'Ammonia',
        centralElement: 'N',
        ligandElement: 'H',
        bondOrder: 1,
        bondAngleNumeric: 107,
        bondAngleLabel: '107.0°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Apical sp³ lone pair repels N–H bonding pairs, compressing 109.5° → 107°.',
      },
      {
        id: 'pcl3',
        formulaDisplay: 'PCl₃',
        name: 'Phosphorus Trichloride',
        centralElement: 'P',
        ligandElement: 'Cl',
        bondOrder: 1,
        bondAngleNumeric: 100.3,
        bondAngleLabel: '100.3°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Trigonal pyramid with strong net dipole toward the chlorine base.',
      },
    ],
  },
  {
    code: 'AX2E2',
    displayCode: 'AX₂E₂',
    bonds: 2,
    lonePairs: 2,
    electronGeo: 'Tetrahedral',
    molecularGeo: 'Bent',
    hybridization: 'sp³',
    idealAngles: '104.5°',
    bondVectors: [
      [Math.sin((52.25 * Math.PI) / 180), -Math.cos((52.25 * Math.PI) / 180), 0],
      [-Math.sin((52.25 * Math.PI) / 180), -Math.cos((52.25 * Math.PI) / 180), 0],
    ],
    lonePairVectors: [
      [0, Math.cos((56 * Math.PI) / 180), Math.sin((56 * Math.PI) / 180)],
      [0, Math.cos((56 * Math.PI) / 180), -Math.sin((56 * Math.PI) / 180)],
    ],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'h2o',
        formulaDisplay: 'H₂O',
        name: 'Water',
        centralElement: 'O',
        ligandElement: 'H',
        bondOrder: 1,
        bondAngleNumeric: 104.5,
        bondAngleLabel: '104.5°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Two diffuse lone-pair lobes exert LP–LP > LP–BP repulsion, narrowing H–O–H to 104.5°.',
      },
      {
        id: 'of2',
        formulaDisplay: 'OF₂',
        name: 'Oxygen Difluoride',
        centralElement: 'O',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 103.1,
        bondAngleLabel: '103.1°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Electronegative fluorine pulls bonding density away from O, narrowing F–O–F.',
      },
    ],
  },
  {
    code: 'AX5',
    displayCode: 'AX₅',
    bonds: 5,
    lonePairs: 0,
    electronGeo: 'Trigonal Bipyramidal',
    molecularGeo: 'Trigonal Bipyramidal',
    hybridization: 'sp³d',
    idealAngles: '90° (ax), 120° (eq)',
    bondVectors: [
      [0, 1, 0],
      [0, -1, 0],
      degVec(90, 0),
      degVec(90, 120),
      degVec(90, 240),
    ],
    lonePairVectors: [],
    anglePairIndices: [0, 2],
    molecules: [
      {
        id: 'pcl5',
        formulaDisplay: 'PCl₅',
        name: 'Phosphorus Pentachloride',
        centralElement: 'P',
        ligandElement: 'Cl',
        bondOrder: 1,
        bondAngleNumeric: 90,
        bondAngleLabel: '90° / 120°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Two axial P–Cl bonds (180°) perpendicular to three equatorial P–Cl bonds (120°).',
      },
      {
        id: 'pf5',
        formulaDisplay: 'PF₅',
        name: 'Phosphorus Pentafluoride',
        centralElement: 'P',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 90,
        bondAngleLabel: '90° / 120°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Hypervalent sp³d trigonal bipyramid undergoing rapid Berry pseudorotation.',
      },
    ],
  },
  {
    code: 'AX4E',
    displayCode: 'AX₄E',
    bonds: 4,
    lonePairs: 1,
    electronGeo: 'Trigonal Bipyramidal',
    molecularGeo: 'Seesaw',
    hybridization: 'sp³d',
    idealAngles: '< 90° (87.8°), < 120° (101.6°)',
    bondVectors: [
      degVec(4, 180), // slightly bent axial
      degVec(176, 180), // slightly bent axial
      degVec(90, 129),
      degVec(90, 231),
    ],
    lonePairVectors: [degVec(90, 0)],
    anglePairIndices: [2, 3],
    molecules: [
      {
        id: 'sf4',
        formulaDisplay: 'SF₄',
        name: 'Sulfur Tetrafluoride',
        centralElement: 'S',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 101.6,
        bondAngleLabel: '101.6° / 173°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Lone pair occupies an equatorial site to minimize 90° interactions, forming a seesaw.',
      },
    ],
  },
  {
    code: 'AX3E2',
    displayCode: 'AX₃E₂',
    bonds: 3,
    lonePairs: 2,
    electronGeo: 'Trigonal Bipyramidal',
    molecularGeo: 'T-Shaped',
    hybridization: 'sp³d',
    idealAngles: '< 90° (87.5°)',
    bondVectors: [
      degVec(2.5, 0),
      degVec(177.5, 0),
      degVec(90, 0),
    ],
    lonePairVectors: [degVec(90, 125), degVec(90, 235)],
    anglePairIndices: [0, 2],
    molecules: [
      {
        id: 'clf3',
        formulaDisplay: 'ClF₃',
        name: 'Chlorine Trifluoride',
        centralElement: 'Cl',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 87.5,
        bondAngleLabel: '87.5°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Two equatorial lone pairs push the axial F–Cl–F slightly inward into a T-shape.',
      },
    ],
  },
  {
    code: 'AX2E3',
    displayCode: 'AX₂E₃',
    bonds: 2,
    lonePairs: 3,
    electronGeo: 'Trigonal Bipyramidal',
    molecularGeo: 'Linear',
    hybridization: 'sp³d',
    idealAngles: '180°',
    bondVectors: [
      [0, 1, 0],
      [0, -1, 0],
    ],
    lonePairVectors: [degVec(90, 0), degVec(90, 120), degVec(90, 240)],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'xef2',
        formulaDisplay: 'XeF₂',
        name: 'Xenon Difluoride',
        centralElement: 'Xe',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 180,
        bondAngleLabel: '180°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Three equatorial lone pairs at 120° leave the two Xe–F bonds strictly linear (180°).',
      },
    ],
  },
  {
    code: 'AX6',
    displayCode: 'AX₆',
    bonds: 6,
    lonePairs: 0,
    electronGeo: 'Octahedral',
    molecularGeo: 'Octahedral',
    hybridization: 'sp³d²',
    idealAngles: '90°, 180°',
    bondVectors: [
      [0, 1, 0],
      [0, -1, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    lonePairVectors: [],
    anglePairIndices: [0, 2],
    molecules: [
      {
        id: 'sf6',
        formulaDisplay: 'SF₆',
        name: 'Sulfur Hexafluoride',
        centralElement: 'S',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 90,
        bondAngleLabel: '90°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Six symmetric S–F bonds along ±X, ±Y, ±Z axes with 90° cis angles.',
      },
    ],
  },
  {
    code: 'AX5E',
    displayCode: 'AX₅E',
    bonds: 5,
    lonePairs: 1,
    electronGeo: 'Octahedral',
    molecularGeo: 'Square Pyramidal',
    hybridization: 'sp³d²',
    idealAngles: '< 90° (84.8°)',
    bondVectors: [
      [0, 1, 0],
      degVec(84.8, 0),
      degVec(84.8, 90),
      degVec(84.8, 180),
      degVec(84.8, 270),
    ],
    lonePairVectors: [[0, -1, 0]],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'brf5',
        formulaDisplay: 'BrF₅',
        name: 'Bromine Pentafluoride',
        centralElement: 'Br',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 84.8,
        bondAngleLabel: '84.8°',
        polarity: 'Polar (μ > 0 D)',
        notes: 'Basal lone pair pushes the four equatorial Br–F bonds slightly upward toward the apex.',
      },
    ],
  },
  {
    code: 'AX4E2',
    displayCode: 'AX₄E₂',
    bonds: 4,
    lonePairs: 2,
    electronGeo: 'Octahedral',
    molecularGeo: 'Square Planar',
    hybridization: 'sp³d²',
    idealAngles: '90°, 180°',
    bondVectors: [
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
    ],
    lonePairVectors: [
      [0, 1, 0],
      [0, -1, 0],
    ],
    anglePairIndices: [0, 1],
    molecules: [
      {
        id: 'xef4',
        formulaDisplay: 'XeF₄',
        name: 'Xenon Tetrafluoride',
        centralElement: 'Xe',
        ligandElement: 'F',
        bondOrder: 1,
        bondAngleNumeric: 90,
        bondAngleLabel: '90°',
        polarity: 'Nonpolar (μ = 0 D)',
        notes: 'Two lone pairs sit trans (180° apart) on ±Y, leaving four coplanar Xe–F bonds at 90°.',
      },
    ],
  },
];

// Pre-allocated Three.js math helpers (Zero GC inside render loop)
const _upAxis = new THREE.Vector3(0, 1, 0);
const _dirVec = new THREE.Vector3();
const _orthoVec = new THREE.Vector3();
const _fallbackAxis = new THREE.Vector3(0, 0, 1);

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

function disposeThreeGroup(group: THREE.Group) {
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
      } else if ((obj as THREE.Line).isLine) {
        const line = obj as THREE.Line;
        line.geometry?.dispose();
        if (Array.isArray(line.material)) {
          line.material.forEach((m) => m.dispose());
        } else {
          line.material?.dispose();
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

/**
 * Generates a pear/teardrop sp^n hybrid orbital LatheGeometry anchored at the origin (y = 0 -> lobeLength)
 */
function createOrbitalLobeGeometry(lobeLength: number, maxWidth: number): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 at nucleus, 1 at outer tip
    const y = t * lobeLength;
    // Teardrop envelope: swells smoothly toward t ~ 0.68, rounds cleanly at t = 1
    const r = Math.sin(Math.PI * Math.pow(t, 0.72)) * maxWidth * (0.35 + 0.65 * t);
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a soft procedural radial contact shadow texture (zero external image files)
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.62)');
    grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.24)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// 2D EXAM WEDGE-AND-DASH STEREOCHEMICAL DIAGRAM (Paper Exam Reference + Fallback)
// ============================================================================
function WedgeDash2dDiagram({
  vsepr,
  molecule,
}: {
  vsepr: VseprGeometryClass;
  molecule: MoleculePreset;
}) {
  const cx = 130;
  const cy = 115;
  const scale = 68;
  const centralSpec = ELEMENT_SPECS[molecule.centralElement] || ELEMENT_SPECS.C;
  const ligandSpec = ELEMENT_SPECS[molecule.ligandElement] || ELEMENT_SPECS.F;

  return (
    <svg
      viewBox="0 0 260 230"
      className="w-full h-44 bg-[#FFFFFF] rounded-xl border border-slate-200 select-none"
      role="img"
      aria-label={`2D stereochemical wedge-dash projection of ${molecule.formulaDisplay} (${vsepr.molecularGeo})`}
    >
      {/* Lone-pair lobes in 2D */}
      {vsepr.lonePairVectors.map(([vx, vy, vz], idx) => {
        const px = cx + (vx + vz * 0.34) * (scale * 0.82);
        const py = cy - (vy - vz * 0.22) * (scale * 0.82);
        const angDeg = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
        return (
          <g key={`lp2d-${idx}`} transform={`translate(${cx}, ${cy}) rotate(${angDeg})`}>
            <path
              d="M 14 0 C 32 -16, 58 -15, 62 0 C 58 15, 32 16, 14 0 Z"
              fill="rgba(245, 158, 11, 0.18)"
              stroke="#F59E0B"
              strokeWidth="1.4"
              strokeDasharray="3 2"
            />
            <circle cx="45" cy="-4.5" r="2.5" fill="#D97706" />
            <circle cx="45" cy="4.5" r="2.5" fill="#D97706" />
          </g>
        );
      })}

      {/* Bonds (In-plane line, Wedge for +Z toward viewer, Dash for -Z away from viewer) */}
      {vsepr.bondVectors.map(([vx, vy, vz], idx) => {
        const ex = cx + (vx + vz * 0.36) * scale;
        const ey = cy - (vy - vz * 0.22) * scale;
        const dx = ex - cx;
        const dy = ey - cy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        if (vz > 0.28) {
          // Solid Wedge (pointing toward viewer)
          const p1 = `${cx + (dx / len) * 14},${cy + (dy / len) * 14}`;
          const p2 = `${ex - (dx / len) * 14 + nx * 5.5},${ey - (dy / len) * 14 + ny * 5.5}`;
          const p3 = `${ex - (dx / len) * 14 - nx * 5.5},${ey - (dy / len) * 14 - ny * 5.5}`;
          return <polygon key={`b2d-${idx}`} points={`${p1} ${p2} ${p3}`} fill="#1E293B" />;
        }

        if (vz < -0.28) {
          // Hashed Dash (pointing away from viewer)
          return (
            <g key={`b2d-${idx}`}>
              {[0.26, 0.4, 0.54, 0.68, 0.82].map((t, k) => {
                const hx = cx + dx * t;
                const hy = cy + dy * t;
                const hw = 1.5 + t * 4;
                return (
                  <line
                    key={k}
                    x1={hx - nx * hw}
                    y1={hy - ny * hw}
                    x2={hx + nx * hw}
                    y2={hy + ny * hw}
                    stroke="#475569"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          );
        }

        // In-plane single or double bond
        if (molecule.bondOrder === 2) {
          return (
            <g key={`b2d-${idx}`}>
              <line
                x1={cx + nx * 2.5}
                y1={cy + ny * 2.5}
                x2={ex + nx * 2.5}
                y2={ey + ny * 2.5}
                stroke="#1E293B"
                strokeWidth="2.1"
              />
              <line
                x1={cx - nx * 2.5}
                y1={cy - ny * 2.5}
                x2={ex - nx * 2.5}
                y2={ey - ny * 2.5}
                stroke="#1E293B"
                strokeWidth="2.1"
              />
            </g>
          );
        }

        return (
          <line
            key={`b2d-${idx}`}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="#1E293B"
            strokeWidth="2.4"
          />
        );
      })}

      {/* Central Atom Badge */}
      <circle
        cx={cx}
        cy={cy}
        r={16}
        fill={centralSpec.cssColor}
        stroke="#0F172A"
        strokeWidth="1.8"
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={centralSpec.textOnBadge}
      >
        {centralSpec.symbol}
      </text>

      {/* Ligand Atom Badges */}
      {vsepr.bondVectors.map(([vx, vy, vz], idx) => {
        const ex = cx + (vx + vz * 0.36) * scale;
        const ey = cy - (vy - vz * 0.22) * scale;
        return (
          <g key={`lig2d-${idx}`}>
            <circle
              cx={ex}
              cy={ey}
              r={13}
              fill={ligandSpec.cssColor}
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <text
              x={ex}
              y={ey + 3.8}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill={ligandSpec.textOnBadge}
            >
              {ligandSpec.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// MAIN INTERACTIVE 3D + 2D VSEPR MOLECULAR GEOMETRY VISUALIZER
// ============================================================================
export function VseprMolecularGeometryVisualizer() {
  const [bonds, setBonds] = useState<number>(3);
  const [lonePairs, setLonePairs] = useState<number>(1);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('nh3');

  // 3D Visual Controls
  const [modelStyle, setModelStyle] = useState<'ball-stick' | 'space-fill'>('ball-stick');
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showBondAngles, setShowBondAngles] = useState<boolean>(true);
  const [showAtomLabels, setShowAtomLabels] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [webglLost, setWebglLost] = useState<boolean>(false);

  const vsepr = useMemo(() => {
    return (
      VSEPR_CLASSES.find((item) => item.bonds === bonds && item.lonePairs === lonePairs) ||
      VSEPR_CLASSES[4]
    );
  }, [bonds, lonePairs]);

  const activeMolecule = useMemo(() => {
    return vsepr.molecules.find((m) => m.id === selectedMoleculeId) || vsepr.molecules[0];
  }, [vsepr, selectedMoleculeId]);

  // Keep selectedMoleculeId synced when VSEPR class changes
  useEffect(() => {
    if (!vsepr.molecules.some((m) => m.id === selectedMoleculeId)) {
      setSelectedMoleculeId(vsepr.molecules[0].id);
    }
  }, [vsepr, selectedMoleculeId]);

  // Keyboard shortcut 'H' for collapsing/expanding the 3D bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'h' || e.key === 'H') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setHudCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Three.js Refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    moleculeGroup: THREE.Group;
    maxAnisotropy: number;
    isSoftwareGl: boolean;
  } | null>(null);

  const targetSphericalRef = useRef({ radius: 285, theta: 0.52, phi: 1.18 });
  const currentSphericalRef = useRef({ radius: 285, theta: 0.52, phi: 1.18 });
  const isOrbitingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

  const selectVseprClass = (entry: VseprGeometryClass, molId?: string) => {
    setBonds(entry.bonds);
    setLonePairs(entry.lonePairs);
    setSelectedMoleculeId(molId || entry.molecules[0].id);
  };

  // ============================================================================
  // BUILD / SYNC COMPOSITE 3D MOLECULAR GEOMETRY
  // ============================================================================
  const syncMolecule3D = useCallback(() => {
    const ctx = threeRef.current;
    if (!ctx) return;

    const { moleculeGroup, maxAnisotropy, isSoftwareGl } = ctx;
    disposeThreeGroup(moleculeGroup);

    const centralSpec = ELEMENT_SPECS[activeMolecule.centralElement] || ELEMENT_SPECS.C;
    const ligandSpec = ELEMENT_SPECS[activeMolecule.ligandElement] || ELEMENT_SPECS.F;
    const bondLength = 84;
    const isSpaceFill = modelStyle === 'space-fill';

    const makeSpriteBadge = (
      text: string,
      bgCss: string,
      textCss: string,
      borderCss: string,
      wScale: number,
      hScale: number
    ) => {
      const c = document.createElement('canvas');
      c.width = 192;
      c.height = 96;
      const sctx = c.getContext('2d');
      if (sctx) {
        sctx.fillStyle = bgCss;
        sctx.beginPath();
        sctx.roundRect(14, 12, 164, 72, 20);
        sctx.fill();
        sctx.lineWidth = 5;
        sctx.strokeStyle = borderCss;
        sctx.stroke();

        sctx.fillStyle = textCss;
        sctx.font = '700 36px "Outfit", sans-serif';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText(text, 96, 49);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(wScale, hScale, 1);
      sp.renderOrder = 8;
      return sp;
    };

    // 1. Central Atom Assembly (Sphere + Valence Equatorial Ring + Optional Element Label)
    const centralRadius = isSpaceFill ? centralSpec.vdwRadius : centralSpec.radius + 3;
    const centralSphere = new THREE.Mesh(
      new THREE.SphereGeometry(centralRadius, 36, 36),
      new THREE.MeshPhysicalMaterial({
        color: centralSpec.hex,
        roughness: 0.22,
        metalness: 0.12,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
      })
    );
    moleculeGroup.add(centralSphere);

    if (!isSpaceFill) {
      const centralCollar = new THREE.Mesh(
        new THREE.TorusGeometry(centralRadius + 2.2, 1.1, 12, 36),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.55,
          metalness: 0.78,
        })
      );
      centralCollar.rotation.x = Math.PI / 2;
      moleculeGroup.add(centralCollar);
    }

    if (showAtomLabels) {
      const centralBadge = makeSpriteBadge(
        centralSpec.symbol,
        '#0F172A',
        '#FFFFFF',
        '#F97316',
        26,
        13
      );
      centralBadge.position.set(0, centralRadius + 13, 0);
      moleculeGroup.add(centralBadge);
    }

    // 2. Bonding Domains (Two-Tone Half-Colored Covalent Cylinders + Ligand Atom Spheres)
    vsepr.bondVectors.forEach(([vx, vy, vz]) => {
      _dirVec.set(vx, vy, vz).normalize();
      const ligPos = _dirVec.clone().multiplyScalar(bondLength);
      const ligRadius = isSpaceFill ? ligandSpec.vdwRadius : ligandSpec.radius;

      // Covalent Bond Shafts (Single vs Double Bond)
      if (!isSpaceFill) {
        const offsets: THREE.Vector3[] = [];
        if (activeMolecule.bondOrder === 2) {
          // Compute orthogonal vector for twin parallel double-bond cylinders
          if (Math.abs(_dirVec.z) < 0.9) {
            _orthoVec.crossVectors(_dirVec, _fallbackAxis).normalize();
          } else {
            _orthoVec.crossVectors(_dirVec, _upAxis).normalize();
          }
          offsets.push(_orthoVec.clone().multiplyScalar(4.4));
          offsets.push(_orthoVec.clone().multiplyScalar(-4.4));
        } else {
          offsets.push(new THREE.Vector3(0, 0, 0));
        }

        const cylRadius = activeMolecule.bondOrder === 2 ? 2.9 : 4.2;
        const halfLen = bondLength * 0.5;

        offsets.forEach((off) => {
          // Inner half (Central Atom CPK color)
          const innerGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, halfLen, 16);
          const innerMat = new THREE.MeshStandardMaterial({
            color: centralSpec.hex,
            roughness: 0.36,
            metalness: 0.18,
          });
          const innerCyl = new THREE.Mesh(innerGeo, innerMat);
          innerCyl.position.copy(_dirVec).multiplyScalar(halfLen * 0.5).add(off);
          innerCyl.quaternion.setFromUnitVectors(_upAxis, _dirVec);
          moleculeGroup.add(innerCyl);

          // Outer half (Ligand Atom CPK color)
          const outerGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, halfLen, 16);
          const outerMat = new THREE.MeshStandardMaterial({
            color: ligandSpec.hex,
            roughness: 0.36,
            metalness: 0.18,
          });
          const outerCyl = new THREE.Mesh(outerGeo, outerMat);
          outerCyl.position.copy(_dirVec).multiplyScalar(halfLen * 1.5).add(off);
          outerCyl.quaternion.setFromUnitVectors(_upAxis, _dirVec);
          moleculeGroup.add(outerCyl);

          // Midpoint Metallic Seam Ring (Composite Accent Detail)
          const seamGeo = new THREE.CylinderGeometry(cylRadius * 1.24, cylRadius * 1.24, 2.2, 16);
          const seamMat = new THREE.MeshStandardMaterial({
            color: 0xcbd5e1,
            roughness: 0.62,
            metalness: 0.72,
          });
          const seamMesh = new THREE.Mesh(seamGeo, seamMat);
          seamMesh.position.copy(_dirVec).multiplyScalar(halfLen).add(off);
          seamMesh.quaternion.setFromUnitVectors(_upAxis, _dirVec);
          moleculeGroup.add(seamMesh);
        });
      }

      // Ligand Atom Sphere
      const ligSphere = new THREE.Mesh(
        new THREE.SphereGeometry(ligRadius, 32, 32),
        new THREE.MeshPhysicalMaterial({
          color: ligandSpec.hex,
          roughness: 0.24,
          metalness: 0.1,
          clearcoat: 0.6,
          clearcoatRoughness: 0.2,
        })
      );
      ligSphere.position.copy(ligPos);
      moleculeGroup.add(ligSphere);

      if (showAtomLabels) {
        const ligBadge = makeSpriteBadge(
          ligandSpec.symbol,
          '#1E293B',
          '#FFFFFF',
          ligandSpec.cssColor === '#F8FAFC' ? '#94A3B8' : ligandSpec.cssColor,
          24,
          12
        );
        const labelPos = _dirVec.clone().multiplyScalar(bondLength + ligRadius + 13);
        ligBadge.position.copy(labelPos);
        moleculeGroup.add(ligBadge);
      }
    });

    // 3. Non-Bonding Lone-Pair Orbital Lobes (Translucent Teardrop + Twin Electron Pair Dots)
    if (showLonePairs && vsepr.lonePairVectors.length > 0) {
      const lobeLength = 74;
      const lobeWidth = 23;

      vsepr.lonePairVectors.forEach(([lx, ly, lz]) => {
        _dirVec.set(lx, ly, lz).normalize();
        const lobeGroup = new THREE.Group();
        lobeGroup.quaternion.setFromUnitVectors(_upAxis, _dirVec);

        // Twin glowing electron spheres inside orbital lobe (renderOrder 2)
        const eMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.85,
          roughness: 0.2,
          metalness: 0.1,
        });
        const e1 = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 16), eMat);
        e1.position.set(-6.2, lobeLength * 0.64, 0);
        e1.renderOrder = 2;
        lobeGroup.add(e1);

        const e2 = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 16), eMat.clone());
        e2.position.set(6.2, lobeLength * 0.64, 0);
        e2.renderOrder = 2;
        lobeGroup.add(e2);

        // Outer Translucent Pear-Shaped Hybrid Orbital Envelope (depthWrite: false, renderOrder 4)
        const lobeGeo = createOrbitalLobeGeometry(lobeLength, lobeWidth);
        const lobeMat = new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.14,
          roughness: 0.18,
          metalness: 0.05,
          transmission: isSoftwareGl ? 0 : 0.72,
          transparent: true,
          opacity: isSoftwareGl ? 0.36 : 0.68,
          ior: 1.45,
          thickness: 1.2,
          depthWrite: false,
        });
        const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
        lobeMesh.position.y = centralRadius * 0.48;
        lobeMesh.renderOrder = 4;
        lobeGroup.add(lobeMesh);

        moleculeGroup.add(lobeGroup);

        if (showAtomLabels) {
          const lpBadge = makeSpriteBadge('LP (e⁻e⁻)', '#78350F', '#FEF3C7', '#F59E0B', 32, 13);
          lpBadge.position.copy(_dirVec).multiplyScalar(centralRadius * 0.48 + lobeLength + 12);
          moleculeGroup.add(lpBadge);
        }
      });
    }

    // 4. Curved 3D Bond-Angle Arc & Degree Readout
    if (showBondAngles && vsepr.bondVectors.length >= 2 && !isSpaceFill) {
      const [idxA, idxB] = vsepr.anglePairIndices;
      const vA = new THREE.Vector3(...vsepr.bondVectors[idxA]).normalize();
      const vB = new THREE.Vector3(...vsepr.bondVectors[idxB]).normalize();

      const arcRadius = 42;
      const arcPoints: THREE.Vector3[] = [];
      const segments = 24;
      const dot = THREE.MathUtils.clamp(vA.dot(vB), -1, 1);
      const totalAngle = Math.acos(dot);

      // Handle 180° linear angle smoothly using an orthogonal normal
      const rotAxis = new THREE.Vector3().crossVectors(vA, vB);
      if (rotAxis.lengthSq() < 1e-5) {
        if (Math.abs(vA.z) < 0.9) rotAxis.set(0, 0, 1);
        else rotAxis.set(1, 0, 0);
        rotAxis.crossVectors(vA, rotAxis).normalize();
      } else {
        rotAxis.normalize();
      }

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = vA.clone().applyAxisAngle(rotAxis, totalAngle * t).multiplyScalar(arcRadius);
        arcPoints.push(p);
      }

      const curve = new THREE.CatmullRomCurve3(arcPoints);
      const arcGeo = new THREE.TubeGeometry(curve, 24, 1.25, 8, false);
      const arcMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.3,
      });
      moleculeGroup.add(new THREE.Mesh(arcGeo, arcMat));

      const midDir = vA.clone().applyAxisAngle(rotAxis, totalAngle * 0.5).normalize();
      const angleSprite = makeSpriteBadge(
        activeMolecule.bondAngleLabel,
        '#0C4A6E',
        '#E0F2FE',
        '#38BDF8',
        34,
        14
      );
      angleSprite.position.copy(midDir).multiplyScalar(arcRadius + 16);
      moleculeGroup.add(angleSprite);
    }
  }, [vsepr, activeMolecule, modelStyle, showLonePairs, showBondAngles, showAtomLabels]);

  // ============================================================================
  // INITIALIZE THREE.JS SCENE & SOFTWARE-WEBGL SAFE RENDER LOOP
  // ============================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.0012);

    const rect = container.getBoundingClientRect();
    const initW = rect.width || 640;
    const initH = rect.height || 440;

    const camera = new THREE.PerspectiveCamera(44, initW / initH, 1, 1800);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    container.appendChild(renderer.domElement);

    // Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    keyLight.position.set(160, 220, 200);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xf97316, 1.15, 650);
    rimLight.position.set(-160, -110, -140);
    scene.add(rimLight);

    // Grounded Contact Shadow Disc + Subtle Reference Grid
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -118;
    scene.add(shadowPlane);

    const grid = new THREE.GridHelper(380, 14, 0x334155, 0x1e293b);
    grid.position.y = -118.2;
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMats.forEach((m) => {
      m.polygonOffset = true;
      m.polygonOffsetFactor = -1;
      m.polygonOffsetUnits = -1;
    });
    scene.add(grid);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    const updateCameraPos = (sph: { radius: number; theta: number; phi: number }) => {
      camera.position.x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
      camera.position.y = sph.radius * Math.cos(sph.phi);
      camera.position.z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos(currentSphericalRef.current);

    threeRef.current = {
      scene,
      camera,
      renderer,
      moleculeGroup,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
      isSoftwareGl,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // WebGL Context Loss & Restore Safety
    const dom = renderer.domElement;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const onContextRestored = () => {
      setWebglLost(false);
    };
    dom.addEventListener('webglcontextlost', onContextLost);
    dom.addEventListener('webglcontextrestored', onContextRestored);

    // Pointer Orbit & Wheel Zoom
    const onPointerDown = (e: PointerEvent) => {
      isOrbitingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isOrbitingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
      targetSphericalRef.current.theta -= dx * 0.0085;
      targetSphericalRef.current.phi = Math.max(
        0.2,
        Math.min(Math.PI - 0.2, targetSphericalRef.current.phi - dy * 0.0085)
      );
    };
    const onPointerUp = () => {
      isOrbitingRef.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSphericalRef.current.radius = Math.max(
        155,
        Math.min(520, targetSphericalRef.current.radius + e.deltaY * 0.25)
      );
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        renderer.setSize(r.width, r.height);
      }
    });
    resizeObserver.observe(container);

    // Frame-rate independent animation loop with Software-WebGL fenceSync pacing
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
      const dt = Math.min(clock.getDelta(), 0.1);

      const cur = currentSphericalRef.current;
      const tgt = targetSphericalRef.current;
      cur.radius = THREE.MathUtils.damp(cur.radius, tgt.radius, 9, dt);
      cur.theta = THREE.MathUtils.damp(cur.theta, tgt.theta, 10, dt);
      cur.phi = THREE.MathUtils.damp(cur.phi, tgt.phi, 10, dt);
      updateCameraPos(cur);

      if (autoRotateRef.current && !isOrbitingRef.current && !isSoftwareGl) {
        moleculeGroup.rotation.y += dt * 0.36;
      }

      renderer.render(scene, camera);

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
      resizeObserver.disconnect();
      dom.removeEventListener('webglcontextlost', onContextLost);
      dom.removeEventListener('webglcontextrestored', onContextRestored);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      disposeThreeGroup(moleculeGroup);
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.MeshBasicMaterial).dispose();
      shadowTex.dispose();
      grid.geometry.dispose();
      gridMats.forEach((m) => m.dispose());
      envTex.dispose();
      renderer.dispose();
      if (dom.parentElement === container) {
        container.removeChild(dom);
      }
      threeRef.current = null;
    };
  }, []);

  // Re-sync 3D molecule whenever VSEPR geometry, molecule selection, or display toggles change
  useEffect(() => {
    syncMolecule3D();
    if (threeRef.current) {
      threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
    }
  }, [syncMolecule3D]);

  const handleResetCamera = () => {
    targetSphericalRef.current = { radius: 285, theta: 0.52, phi: 1.18 };
    if (threeRef.current) {
      threeRef.current.moleculeGroup.rotation.set(0, 0, 0);
    }
  };

  const handleExportPng = () => {
    if (!threeRef.current) return;
    const { renderer, scene, camera } = threeRef.current;
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `vsepr-${activeMolecule.id}-${vsepr.code.toLowerCase()}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  };

  const handleExportPdf = () => {
    if (!threeRef.current) return;
    const { renderer, scene, camera } = threeRef.current;
    renderer.render(scene, camera);
    const pngDataUrl = renderer.domElement.toDataURL('image/png');
    downloadCanvasFigurePdf({
      filename: `VSEPR-${activeMolecule.id}-${vsepr.code}.pdf`,
      title: `VSEPR 3D Molecular Geometry — ${activeMolecule.formulaDisplay} (${activeMolecule.name})`,
      subtitle: `${vsepr.displayCode} · ${vsepr.molecularGeo} · ${vsepr.hybridization} · Bond Angle: ${vsepr.bondAngle} · ${activeMolecule.polarity}`,
      pngDataUrl,
      imgWidthPx: renderer.domElement.width || 800,
      imgHeightPx: renderer.domElement.height || 600,
      landscape: true,
    });
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xs">
      {/* Row 1: All 13 VSEPR Geometry Class Selector Buttons */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#111827]">
            Select VSEPR Class (AXₘEₙ) or Adjust Domains Below
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Steric Number = {bonds + lonePairs} · {vsepr.hybridization} Hybridized
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {VSEPR_CLASSES.map((item) => {
            const isSelected = vsepr.code === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => selectVseprClass(item)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-[#F9FAFB] hover:bg-[#FFF7ED] text-slate-700 border-slate-200 hover:border-orange-300'
                }`}
              >
                {item.displayCode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Two-Zone Interactive 3D Molecular Stage + Parameter & Stereochemistry Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT / PRIMARY ZONE (7 Cols): Interactive 3D Molecular Geometry Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Example Molecule Selector Strip for Current VSEPR Class */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                <Atom className="w-4 h-4 text-[#F97316]" />
                <span>3D Model:</span>
              </span>
              {vsepr.molecules.map((mol) => {
                const active = activeMolecule.id === mol.id;
                return (
                  <button
                    key={mol.id}
                    type="button"
                    onClick={() => setSelectedMoleculeId(mol.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#FFFFFF] text-slate-700 border border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {mol.formulaDisplay} ({mol.name})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg bg-[#FFFFFF] hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Export PNG</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* 3D WebGL Viewport Container */}
          <div className="relative rounded-2xl border border-slate-800 bg-[#0B1120] overflow-hidden min-h-[430px] flex-1">
            {/* Semantic Top-Left Molecule Spec Overlay */}
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none space-y-0.5 bg-slate-950/85 border border-slate-800 rounded-xl px-3.5 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-display font-bold text-white text-sm">
                  {activeMolecule.formulaDisplay}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-semibold text-orange-400">{vsepr.molecularGeo}</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono tabular-nums">
                {vsepr.displayCode} · {vsepr.hybridization} · {activeMolecule.polarity}
              </div>
            </div>

            {/* Dedicated Empty Mount Container for Three.js WebGLRenderer */}
            <div
              ref={mountRef}
              className="w-full h-full min-h-[430px] cursor-grab active:cursor-grabbing touch-none"
            />

            {/* Graceful Fallback if WebGL Context is Lost */}
            {webglLost && (
              <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <p className="text-sm font-bold text-white">
                  3D WebGL Context Paused — Displaying 2D Stereochemical Projection
                </p>
                <div className="w-64">
                  <WedgeDash2dDiagram vsepr={vsepr} molecule={activeMolecule} />
                </div>
              </div>
            )}

            {/* Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-24px)] max-w-[600px] flex flex-col items-center pointer-events-none">
              <button
                type="button"
                onClick={() => setHudCollapsed((prev) => !prev)}
                className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-t-lg bg-slate-900 text-slate-200 border border-b-0 border-slate-700 text-[11px] font-medium hover:text-white cursor-pointer"
              >
                {hudCollapsed ? (
                  <>
                    <ChevronUp className="w-3 h-3 text-orange-400" />
                    <span>Show 3D Controls (H)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 text-orange-400" />
                    <span>Hide Controls (H)</span>
                  </>
                )}
              </button>

              {!hudCollapsed && (
                <div className="pointer-events-auto w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-200 shadow-lg">
                  {/* Style Switcher */}
                  <div className="inline-flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setModelStyle('ball-stick')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        modelStyle === 'ball-stick'
                          ? 'bg-[#F97316] text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Ball &amp; Stick
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelStyle('space-fill')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        modelStyle === 'space-fill'
                          ? 'bg-[#F97316] text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Space-Fill
                    </button>
                  </div>

                  {/* Checkboxes for Lone Pairs, Angles, Labels & Auto-Rotate */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={showLonePairs}
                        onChange={(e) => setShowLonePairs(e.target.checked)}
                        className="accent-[#F97316] cursor-pointer"
                      />
                      <span>Lone Pairs</span>
                    </label>

                    <label className="inline-flex items-center gap-1 text-[11px] text-sky-300 font-medium cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={showBondAngles}
                        onChange={(e) => setShowBondAngles(e.target.checked)}
                        className="accent-[#F97316] cursor-pointer"
                      />
                      <span>Bond Angle</span>
                    </label>

                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-200 font-medium cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={showAtomLabels}
                        onChange={(e) => setShowAtomLabels(e.target.checked)}
                        className="accent-[#F97316] cursor-pointer"
                      />
                      <span>Labels</span>
                    </label>

                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-200 font-medium cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={autoRotate}
                        onChange={(e) => setAutoRotate(e.target.checked)}
                        className="accent-[#F97316] cursor-pointer"
                      />
                      <span>Spin</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleResetCamera}
                      title="Reset 3D camera orientation"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold text-slate-100 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3 text-orange-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT / CONTROL & STEREOCHEMISTRY DECK (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Domain Sliders */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-5 space-y-4 tabular-nums">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <label htmlFor="vsepr-bonds-slider">Bonding Domains Around Central Atom (X)</label>
                <span className="font-mono text-sm text-[#EA580C]">{bonds}</span>
              </div>
              <input
                id="vsepr-bonds-slider"
                type="range"
                min={2}
                max={6}
                value={bonds}
                onChange={(e) => {
                  const nextB = Number(e.target.value);
                  let nextLP = lonePairs;
                  if (nextB + nextLP > 6) nextLP = Math.max(0, 6 - nextB);
                  if (nextB === 2 && nextLP === 4) nextLP = 3; // Max AX2E3
                  setBonds(nextB);
                  setLonePairs(nextLP);
                }}
                className="w-full accent-[#F97316] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <label htmlFor="vsepr-lp-slider">Non-Bonding Lone Pairs (E)</label>
                <span className="font-mono text-sm text-amber-700">{lonePairs}</span>
              </div>
              <input
                id="vsepr-lp-slider"
                type="range"
                min={0}
                max={bonds === 2 ? 3 : Math.max(0, 6 - bonds)}
                value={lonePairs}
                onChange={(e) => setLonePairs(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-[#FFFFFF] border border-slate-200 rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Central Hybridization
                </span>
                <span className="text-lg font-mono font-bold text-[#111827]">
                  {vsepr.hybridization}
                </span>
              </div>
              <div className="bg-[#FFFFFF] border border-slate-200 rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Bond Angle(s)
                </span>
                <span className="text-base font-mono font-bold text-emerald-700">
                  {activeMolecule.bondAngleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* VSEPR Classification Summary */}
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#EA580C]">
                VSEPR Class: {vsepr.displayCode}
              </span>
              <span className="font-semibold text-slate-700">{activeMolecule.polarity}</span>
            </div>
            <h3 className="text-xl font-display font-bold text-[#111827]">
              {vsepr.molecularGeo}
            </h3>
            <p className="text-xs text-slate-700">
              Electron-Domain Geometry: <strong>{vsepr.electronGeo}</strong>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{activeMolecule.notes}</p>
          </div>

          {/* 2D Exam Wedge-and-Dash Projection Card */}
          <div className="bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#111827]">
                <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                <span>2D Exam Wedge-Dash Projection ({activeMolecule.formulaDisplay})</span>
              </span>
              <span className="text-[11px] text-slate-500">Solid · Wedge · Dash</span>
            </div>
            <WedgeDash2dDiagram vsepr={vsepr} molecule={activeMolecule} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default VseprMolecularGeometryVisualizer;
