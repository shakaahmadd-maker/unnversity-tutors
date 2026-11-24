import React from 'react';
import type { CsToolSlug } from '../../../data/csToolsRegistry';

export function CsExampleDiagram({ slug }: { slug: CsToolSlug }) {
  switch (slug) {
    case 'sql-playground':
      return (
        <svg viewBox="0 0 420 230" className="w-full h-auto" role="img" aria-label="Relational SQL JOIN and GROUP BY pipeline diagram">
          <rect x="8" y="8" width="404" height="214" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          {/* Students Table */}
          <rect x="20" y="24" width="120" height="72" rx="8" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
          <rect x="20" y="24" width="120" height="22" rx="8" fill="#EA580C" />
          <text x="80" y="39" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">Students</text>
          <text x="28" y="60" fill="#0F172A" fontSize="9" fontFamily="monospace">PK student_id</text>
          <text x="28" y="74" fill="#475569" fontSize="9" fontFamily="monospace">   full_name, major</text>
          <text x="28" y="88" fill="#475569" fontSize="9" fontFamily="monospace">   gpa, year</text>

          {/* Courses Table */}
          <rect x="20" y="132" width="120" height="72" rx="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
          <rect x="20" y="132" width="120" height="22" rx="8" fill="#0F172A" />
          <text x="80" y="147" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">Courses</text>
          <text x="28" y="168" fill="#0F172A" fontSize="9" fontFamily="monospace">PK course_id</text>
          <text x="28" y="182" fill="#475569" fontSize="9" fontFamily="monospace">   course_code</text>
          <text x="28" y="196" fill="#475569" fontSize="9" fontFamily="monospace">   title, credits</text>

          {/* Junction Enrollments */}
          <rect x="172" y="76" width="118" height="78" rx="8" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
          <rect x="172" y="76" width="118" height="22" rx="8" fill="#1E293B" />
          <text x="231" y="91" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">Enrollments</text>
          <text x="180" y="112" fill="#C2410C" fontSize="9" fontFamily="monospace" fontWeight="700">FK student_id</text>
          <text x="180" y="126" fill="#C2410C" fontSize="9" fontFamily="monospace" fontWeight="700">FK course_id</text>
          <text x="180" y="140" fill="#475569" fontSize="9" fontFamily="monospace">   grade, score</text>

          {/* Output Query Block */}
          <rect x="314" y="64" width="88" height="102" rx="8" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
          <text x="358" y="83" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="700">JOIN + GROUP</text>
          <line x1="322" y1="90" x2="394" y2="90" stroke="#A7F3D0" />
          <text x="358" y="106" textAnchor="middle" fill="#064E3B" fontSize="8.5" fontFamily="monospace">CS201: 91.2</text>
          <text x="358" y="122" textAnchor="middle" fill="#064E3B" fontSize="8.5" fontFamily="monospace">CS310: 91.5</text>
          <text x="358" y="138" textAnchor="middle" fill="#064E3B" fontSize="8.5" fontFamily="monospace">DS250: 91.0</text>
          <text x="358" y="156" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="700">CSV / PDF</text>

          {/* Connecting Arrows */}
          <path d="M 140 60 L 172 108" stroke="#EA580C" strokeWidth="2" fill="none" />
          <path d="M 140 168 L 172 124" stroke="#0F172A" strokeWidth="2" fill="none" />
          <path d="M 290 115 L 314 115" stroke="#059669" strokeWidth="2" fill="none" />
          <polygon points="314,115 307,111 307,119" fill="#059669" />
        </svg>
      );

    case 'truth-table-generator':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Safety interlock logic gate diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          {/* Inputs */}
          <rect x="20" y="34" width="66" height="24" rx="6" fill="#0F172A" />
          <text x="53" y="50" textAnchor="middle" fill="#FFF" fontSize="9.5" fontFamily="monospace" fontWeight="700">A Pressure</text>
          <rect x="20" y="74" width="66" height="24" rx="6" fill="#0F172A" />
          <text x="53" y="90" textAnchor="middle" fill="#FFF" fontSize="9.5" fontFamily="monospace" fontWeight="700">B Sealed</text>
          <rect x="20" y="132" width="66" height="24" rx="6" fill="#0F172A" />
          <text x="53" y="148" textAnchor="middle" fill="#FFF" fontSize="9.5" fontFamily="monospace" fontWeight="700">C Key</text>
          <rect x="20" y="168" width="66" height="24" rx="6" fill="#0F172A" />
          <text x="53" y="184" textAnchor="middle" fill="#FFF" fontSize="9.5" fontFamily="monospace" fontWeight="700">D Fault</text>

          {/* Wires */}
          <path d="M 86 46 L 152 46 L 152 60 L 172 60" stroke="#64748B" strokeWidth="1.8" fill="none" />
          <path d="M 86 86 L 152 86 L 152 74 L 172 74" stroke="#64748B" strokeWidth="1.8" fill="none" />
          <path d="M 86 144 L 172 144" stroke="#64748B" strokeWidth="1.8" fill="none" />
          <path d="M 86 180 L 116 180" stroke="#64748B" strokeWidth="1.8" fill="none" />

          {/* NOT Gate on D */}
          <polygon points="116,169 140,180 116,191" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.8" />
          <circle cx="144" cy="180" r="3.5" fill="#FFF" stroke="#EA580C" strokeWidth="1.8" />
          <path d="M 148 180 L 158 180 L 158 160 L 172 160" stroke="#64748B" strokeWidth="1.8" fill="none" />

          {/* Top AND Gate */}
          <path d="M 172 48 L 194 48 A 18 18 0 0 1 194 84 L 172 84 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
          <text x="190" y="69" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="monospace">AND</text>

          {/* Bottom AND Gate */}
          <path d="M 172 134 L 194 134 A 18 18 0 0 1 194 170 L 172 170 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
          <text x="190" y="155" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="monospace">AND</text>

          {/* Wires into final OR */}
          <path d="M 212 66 L 248 66 L 248 100 L 268 100" stroke="#EA580C" strokeWidth="2" fill="none" />
          <path d="M 212 152 L 248 152 L 248 118 L 268 118" stroke="#EA580C" strokeWidth="2" fill="none" />

          {/* Final OR Gate */}
          <path d="M 264 90 Q 275 109 264 128 L 284 128 Q 302 124 310 109 Q 302 94 284 90 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
          <text x="285" y="112" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="monospace">OR</text>

          {/* Output */}
          <path d="M 310 109 L 332 109" stroke="#059669" strokeWidth="2.2" fill="none" />
          <rect x="332" y="92" width="68" height="34" rx="8" fill="#ECFDF5" stroke="#059669" strokeWidth="1.8" />
          <text x="366" y="107" textAnchor="middle" fill="#065F46" fontSize="9" fontWeight="700">UNLOCK</text>
          <text x="366" y="119" textAnchor="middle" fill="#059669" fontSize="8" fontFamily="monospace">16 states</text>
        </svg>
      );

    case 'binary-hex-converter':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="IEEE 754 32-bit float layout diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="22" y="34" fill="#0F172A" fontSize="11" fontWeight="700">IEEE 754 Single-Precision Telemetry Frame (-13.625 °C)</text>
          <text x="22" y="49" fill="#64748B" fontSize="9.5" fontFamily="monospace">Hex Word: 0xC15A0000  |  32-bit Hardware Register</text>

          {/* Sign Bit */}
          <rect x="22" y="68" width="46" height="44" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
          <text x="45" y="84" textAnchor="middle" fill="#991B1B" fontSize="8.5" fontWeight="700">SIGN (1)</text>
          <text x="45" y="103" textAnchor="middle" fill="#DC2626" fontSize="14" fontWeight="700" fontFamily="monospace">1</text>

          {/* Exponent Bits */}
          <rect x="74" y="68" width="122" height="44" rx="8" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
          <text x="135" y="84" textAnchor="middle" fill="#9A3412" fontSize="8.5" fontWeight="700">EXPONENT (8 bits)</text>
          <text x="135" y="102" textAnchor="middle" fill="#C2410C" fontSize="12" fontWeight="700" fontFamily="monospace">10000010</text>

          {/* Mantissa Bits */}
          <rect x="202" y="68" width="196" height="44" rx="8" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <text x="300" y="84" textAnchor="middle" fill="#1E40AF" fontSize="8.5" fontWeight="700">MANTISSA / FRACTION (23 bits)</text>
          <text x="300" y="102" textAnchor="middle" fill="#1D4ED8" fontSize="11" fontWeight="700" fontFamily="monospace">10110100000000000000000</text>

          {/* Breakdown Formulas */}
          <rect x="22" y="128" width="376" height="68" rx="10" fill="#FAF6F0" stroke="#FED7AA" />
          <text x="34" y="147" fill="#9A3412" fontSize="9.5" fontWeight="700">Decoded Value Breakdown:</text>
          <text x="34" y="164" fill="#0F172A" fontSize="9.5" fontFamily="monospace">Sign = (-1)^1 = -1   |   Exponent = 130 - 127 = +3 (x 2^3)</text>
          <text x="34" y="181" fill="#0F172A" fontSize="9.5" fontFamily="monospace">Significand = 1.101101_2 = 1.703125  =&gt;  -1.703125 x 8 = -13.625</text>
        </svg>
      );

    case 'algorithm-visualizer':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Sorting comparison bar chart and binary search trace">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="22" y="33" fill="#0F172A" fontSize="11" fontWeight="700">Quick Sort Partitioning vs. Binary Search Probes</text>
          {/* Bars */}
          {[
            { h: 36, c: '#CBD5E1', lbl: '12' },
            { h: 52, c: '#CBD5E1', lbl: '24' },
            { h: 74, c: '#EA580C', lbl: '42' },
            { h: 98, c: '#F97316', lbl: '58' },
            { h: 112, c: '#CBD5E1', lbl: '67' },
            { h: 126, c: '#059669', lbl: '79' },
            { h: 140, c: '#CBD5E1', lbl: '91' },
          ].map((b, i) => (
            <g key={i}>
              <rect x={26 + i * 32} y={174 - b.h} width="24" height={b.h} rx="4" fill={b.c} />
              <text x={38 + i * 32} y={190} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">
                {b.lbl}
              </text>
            </g>
          ))}
          {/* Stats Card */}
          <rect x="260" y="54" width="140" height="136" rx="10" fill="#FFF7ED" stroke="#FED7AA" />
          <text x="272" y="75" fill="#9A3412" fontSize="9.5" fontWeight="700">At n = 10,000 items:</text>
          <text x="272" y="96" fill="#DC2626" fontSize="9.5" fontFamily="monospace" fontWeight="700">Bubble O(n^2)</text>
          <text x="272" y="110" fill="#475569" fontSize="9" fontFamily="monospace">~50,000,000 ops</text>
          <text x="272" y="132" fill="#EA580C" fontSize="9.5" fontFamily="monospace" fontWeight="700">Merge O(n log n)</text>
          <text x="272" y="146" fill="#475569" fontSize="9" fontFamily="monospace">~132,877 ops</text>
          <text x="272" y="168" fill="#059669" fontSize="9.5" fontFamily="monospace" fontWeight="700">Binary Search</text>
          <text x="272" y="182" fill="#475569" fontSize="9" fontFamily="monospace">&lt;= 14 comparisons</text>
        </svg>
      );

    case 'data-structure-visualizer':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Binary Search Tree search path and Stack Queue diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          {/* BST Edges */}
          <line x1="140" y1="46" x2="86" y2="96" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="140" y1="46" x2="194" y2="96" stroke="#EA580C" strokeWidth="2.5" />
          <line x1="86" y1="96" x2="54" y2="148" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="86" y1="96" x2="118" y2="148" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="194" y1="96" x2="164" y2="148" stroke="#EA580C" strokeWidth="2.5" />
          <line x1="194" y1="96" x2="226" y2="148" stroke="#CBD5E1" strokeWidth="2.5" />

          {/* BST Nodes */}
          {[
            { x: 140, y: 46, v: '50', hi: true },
            { x: 86, y: 96, v: '30', hi: false },
            { x: 194, y: 96, v: '70', hi: true },
            { x: 54, y: 148, v: '20', hi: false },
            { x: 118, y: 148, v: '40', hi: false },
            { x: 164, y: 148, v: '60', hi: true, found: true },
            { x: 226, y: 148, v: '80', hi: false },
          ].map((n) => (
            <g key={n.v}>
              <circle
                cx={n.x}
                cy={n.y}
                r="17"
                fill={n.found ? '#059669' : n.hi ? '#EA580C' : '#FFFFFF'}
                stroke={n.found ? '#047857' : n.hi ? '#C2410C' : '#94A3B8'}
                strokeWidth="2"
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fill={n.hi || n.found ? '#FFFFFF' : '#0F172A'}
                fontSize="11"
                fontWeight="700"
                fontFamily="monospace"
              >
                {n.v}
              </text>
            </g>
          ))}
          <text x="140" y="192" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="monospace">
            In-Order L-N-R: [20, 30, 40, 50, 60, 70, 80]
          </text>

          {/* Right Panel: Stack + Queue */}
          <rect x="266" y="24" width="132" height="82" rx="10" fill="#FAF6F0" stroke="#FED7AA" />
          <text x="332" y="42" textAnchor="middle" fill="#9A3412" fontSize="9.5" fontWeight="700">LIFO Stack (Undo)</text>
          <rect x="284" y="50" width="96" height="16" rx="4" fill="#EA580C" />
          <text x="332" y="61" textAnchor="middle" fill="#FFF" fontSize="8.5" fontFamily="monospace">TOP: Edit #64</text>
          <rect x="284" y="70" width="96" height="14" rx="4" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="332" y="80" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Frame #42</text>

          <rect x="266" y="118" width="132" height="80" rx="10" fill="#F8FAFC" stroke="#CBD5E1" />
          <text x="332" y="136" textAnchor="middle" fill="#0F172A" fontSize="9.5" fontWeight="700">FIFO Job Queue</text>
          <text x="332" y="158" textAnchor="middle" fill="#059669" fontSize="9" fontFamily="monospace">FRONT -&gt; [15][28][42]</text>
          <text x="332" y="176" textAnchor="middle" fill="#64748B" fontSize="8.5" fontFamily="monospace">O(1) Enqueue / Dequeue</text>
        </svg>
      );

    case 'subnet-calculator':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Cloud VPC CIDR /26 Subnetting Topology">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <rect x="22" y="20" width="376" height="32" rx="8" fill="#0F172A" />
          <text x="210" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="monospace">
            Cloud VPC Block: 192.168.10.0/24  (256 Addresses)
          </text>

          {/* Split arrows */}
          <path d="M 140 52 L 112 76" stroke="#EA580C" strokeWidth="2" />
          <path d="M 280 52 L 308 76" stroke="#059669" strokeWidth="2" />

          {/* Subnet A */}
          <rect x="22" y="78" width="180" height="72" rx="10" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
          <text x="34" y="96" fill="#9A3412" fontSize="10" fontWeight="700">Subnet A · App Tier (/26)</text>
          <text x="34" y="112" fill="#0F172A" fontSize="9" fontFamily="monospace">Net: 192.168.10.0</text>
          <text x="34" y="126" fill="#0F172A" fontSize="9" fontFamily="monospace">Hosts: .1 – .62 (62 IPs)</text>
          <text x="34" y="140" fill="#C2410C" fontSize="9" fontFamily="monospace">Bcast: .63 | Mask .192</text>

          {/* Subnet B */}
          <rect x="218" y="78" width="180" height="72" rx="10" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
          <text x="230" y="96" fill="#065F46" fontSize="10" fontWeight="700">Subnet B · DB Tier (/26)</text>
          <text x="230" y="112" fill="#0F172A" fontSize="9" fontFamily="monospace">Net: 192.168.10.64</text>
          <text x="230" y="126" fill="#0F172A" fontSize="9" fontFamily="monospace">Hosts: .65 – .126 (62 IPs)</text>
          <text x="230" y="140" fill="#059669" fontSize="9" fontFamily="monospace">Bcast: .127 | Wild .63</text>

          {/* 32-bit visual bar */}
          <rect x="22" y="164" width="290" height="32" rx="6" fill="#EA580C" />
          <text x="167" y="184" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="monospace">
            26 Network Bits (11000000.10101000.00001010.00)
          </text>
          <rect x="316" y="164" width="82" height="32" rx="6" fill="#059669" />
          <text x="357" y="184" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="monospace">
            6 Host Bits
          </text>
        </svg>
      );

    case 'regex-tester':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Regex capture group extraction diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="22" y="34" fill="#0F172A" fontSize="11" fontWeight="700">API Auth Validation &amp; Capture Group Segmentation</text>

          {/* Highlighted Input Bar */}
          <rect x="22" y="50" width="376" height="44" rx="8" fill="#FAF6F0" stroke="#CBD5E1" />
          <rect x="36" y="59" width="126" height="26" rx="5" fill="#FED7AA" stroke="#EA580C" />
          <text x="99" y="76" textAnchor="middle" fill="#9A3412" fontSize="11" fontWeight="700" fontFamily="monospace">cs.lab_01</text>
          <text x="172" y="76" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="700" fontFamily="monospace">@</text>
          <rect x="184" y="59" width="198" height="26" rx="5" fill="#D1FAE5" stroke="#059669" />
          <text x="283" y="76" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700" fontFamily="monospace">university-tutors.com</text>

          {/* Group arrows */}
          <line x1="99" y1="94" x2="99" y2="118" stroke="#EA580C" strokeWidth="1.8" />
          <line x1="283" y1="94" x2="283" y2="118" stroke="#059669" strokeWidth="1.8" />

          <rect x="22" y="120" width="176" height="76" rx="8" fill="#FFF7ED" stroke="#FED7AA" />
          <text x="34" y="138" fill="#C2410C" fontSize="9.5" fontWeight="700">Group $1 · Username</text>
          <text x="34" y="155" fill="#0F172A" fontSize="9.5" fontFamily="monospace">[a-zA-Z0-9._%+-]+</text>
          <text x="34" y="175" fill="#475569" fontSize="8.5">1+ allowed local chars</text>

          <rect x="210" y="120" width="188" height="76" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
          <text x="222" y="138" fill="#065F46" fontSize="9.5" fontWeight="700">Group $2 · Host + TLD</text>
          <text x="222" y="155" fill="#0F172A" fontSize="9.5" fontFamily="monospace">[a-zA-Z0-9.-]+\.[a-zA-Z]&#123;2,&#125;</text>
          <text x="222" y="175" fill="#475569" fontSize="8.5">Verified domain + 2+ letter TLD</text>
        </svg>
      );

    case 'big-o-calculator':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Asymptotic Big-O runtime scaling curve">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          {/* Axes */}
          <line x1="48" y1="184" x2="380" y2="184" stroke="#64748B" strokeWidth="1.5" />
          <line x1="48" y1="30" x2="48" y2="184" stroke="#64748B" strokeWidth="1.5" />
          {/* 100ms SLA dashed line */}
          <line x1="48" y1="88" x2="380" y2="88" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="376" y="82" textAnchor="end" fill="#64748B" fontSize="8.5" fontWeight="700">100ms API SLA Budget</text>

          {/* Curves */}
          <path d="M 48 176 L 372 176" stroke="#059669" strokeWidth="2.5" fill="none" />
          <path d="M 48 182 Q 160 158 372 126" stroke="#EA580C" strokeWidth="2.5" fill="none" />
          <path d="M 48 183 Q 180 174 260 32" stroke="#DC2626" strokeWidth="2.5" fill="none" />

          <text x="374" y="172" textAnchor="end" fill="#059669" fontSize="9.5" fontWeight="700" fontFamily="monospace">O(1) / O(log n)</text>
          <text x="374" y="120" textAnchor="end" fill="#EA580C" fontSize="9.5" fontWeight="700" fontFamily="monospace">O(n log n)</text>
          <text x="266" y="42" fill="#DC2626" fontSize="9.5" fontWeight="700" fontFamily="monospace">O(n^2) SLA Breach!</text>
          <text x="214" y="202" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="monospace">Input Size (n = 10 to 10,000)</text>
        </svg>
      );

    case 'code-formatter-diff':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="Side-by-side LCS Pull Request Diff Diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="22" y="32" fill="#0F172A" fontSize="11" fontWeight="700">LCS Side-by-Side Diff &amp; Schema Pipeline</text>

          {/* Left Original */}
          <rect x="20" y="46" width="184" height="152" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
          <text x="30" y="64" fill="#64748B" fontSize="9" fontWeight="700" fontFamily="monospace">Original (PR Base)</text>
          <text x="30" y="84" fill="#334155" fontSize="8.5" fontFamily="monospace">1  let left = 0;</text>
          <rect x="24" y="92" width="176" height="18" fill="#FEE2E2" />
          <text x="30" y="104" fill="#991B1B" fontSize="8.5" fontFamily="monospace">-  let right = arr.length;</text>
          <rect x="24" y="114" width="176" height="18" fill="#FEE2E2" />
          <text x="30" y="126" fill="#991B1B" fontSize="8.5" fontFamily="monospace">-  mid = (l + r) / 2;</text>
          <text x="30" y="148" fill="#334155" fontSize="8.5" fontFamily="monospace">4  return -1;</text>
          <text x="30" y="182" fill="#059669" fontSize="8.5" fontWeight="700">JSON -&gt; YAML -&gt; CSV</text>

          {/* Right Modified */}
          <rect x="216" y="46" width="184" height="152" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
          <text x="226" y="64" fill="#0F172A" fontSize="9" fontWeight="700" fontFamily="monospace">Patched (Bug Fixed)</text>
          <text x="226" y="84" fill="#334155" fontSize="8.5" fontFamily="monospace">1  let left = 0;</text>
          <rect x="220" y="92" width="176" height="18" fill="#D1FAE5" />
          <text x="226" y="104" fill="#065F46" fontSize="8.5" fontFamily="monospace">+  let right = len - 1;</text>
          <rect x="220" y="114" width="176" height="18" fill="#D1FAE5" />
          <text x="226" y="126" fill="#065F46" fontSize="8.5" fontFamily="monospace">+  mid = l + (r - l) / 2;</text>
          <text x="226" y="148" fill="#334155" fontSize="8.5" fontFamily="monospace">4  return -1;</text>
          <text x="226" y="182" fill="#EA580C" fontSize="8.5" fontWeight="700">Exact Line Diagnostics</text>
        </svg>
      );

    case 'crypto-jwt-tool':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-auto" role="img" aria-label="JWT 3-segment structure and SHA-256 avalanche verification diagram">
          <rect x="8" y="8" width="404" height="204" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="22" y="33" fill="#0F172A" fontSize="11" fontWeight="700">JWT Base64URL Anatomy &amp; SHA-256 Verification</text>

          {/* Header */}
          <rect x="22" y="48" width="110" height="54" rx="8" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
          <text x="77" y="66" textAnchor="middle" fill="#991B1B" fontSize="9" fontWeight="700">1. HEADER</text>
          <text x="77" y="82" textAnchor="middle" fill="#475569" fontSize="8.5" fontFamily="monospace">&#123;alg:"HS256"&#125;</text>
          <text x="77" y="94" textAnchor="middle" fill="#991B1B" fontSize="8" fontFamily="monospace">eyJhbGci...</text>

          {/* Dot */}
          <circle cx="141" cy="75" r="3" fill="#0F172A" />

          {/* Payload */}
          <rect x="150" y="48" width="132" height="54" rx="8" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
          <text x="216" y="66" textAnchor="middle" fill="#9A3412" fontSize="9" fontWeight="700">2. PAYLOAD (Claims)</text>
          <text x="216" y="82" textAnchor="middle" fill="#0F172A" fontSize="8.5" fontFamily="monospace">sub, role, exp</text>
          <text x="216" y="94" textAnchor="middle" fill="#C2410C" fontSize="8" fontFamily="monospace">Decoded Locally</text>

          {/* Dot */}
          <circle cx="291" cy="75" r="3" fill="#0F172A" />

          {/* Signature */}
          <rect x="300" y="48" width="98" height="54" rx="8" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
          <text x="349" y="66" textAnchor="middle" fill="#065F46" fontSize="9" fontWeight="700">3. SIGNATURE</text>
          <text x="349" y="82" textAnchor="middle" fill="#0F172A" fontSize="8.5" fontFamily="monospace">HMAC-SHA256</text>
          <text x="349" y="94" textAnchor="middle" fill="#059669" fontSize="8" fontFamily="monospace">Server Verified</text>

          {/* SHA-256 Box */}
          <rect x="22" y="120" width="376" height="76" rx="10" fill="#FAF6F0" stroke="#FED7AA" />
          <text x="34" y="138" fill="#9A3412" fontSize="9.5" fontWeight="700">Web Crypto SHA-256 Avalanche Check:</text>
          <text x="34" y="156" fill="#0F172A" fontSize="8.8" fontFamily="monospace">SHA-256("CS410_Lab") -&gt; 8f4e2a...91c4 (256 bits)</text>
          <text x="34" y="172" fill="#DC2626" fontSize="8.8" fontFamily="monospace">SHA-256("CS410_lab") -&gt; 3b91d0...4a7e (~50% bits flipped!)</text>
          <text x="34" y="187" fill="#059669" fontSize="8.2" fontWeight="700">Zero secrets transmitted · Executed natively in crypto.subtle</text>
        </svg>
      );
  }
}
