import type { CsToolSlug } from './csToolsRegistry';

export interface CsRealLifeCase {
  id: string;
  sector: string;
  title: string;
  context: string;
  expressionOrSnippet: string;
  givenParameters: string;
  verifiedOutcome: string;
  takeaway: string;
  presetIndex: number;
}

export interface CsRealLifeToolMeta {
  sectionHeading: string;
  sectionIntro: string;
  domainTag: string;
  diagramTitle: string;
  diagramCaption: string;
  cases: [CsRealLifeCase, CsRealLifeCase];
}

export const CS_REAL_LIFE_DATA: Record<CsToolSlug, CsRealLifeToolMeta> = {
  'sql-playground': {
    sectionHeading: 'Real-Life Applications of Relational SQL Queries & Joins',
    sectionIntro:
      'Production SaaS analytics, university registrar audits, and e-commerce reporting rely on normalized multi-table JOIN, GROUP BY, and HAVING queries.',
    domainTag: 'Relational Database Engineering · SQL',
    diagramTitle: 'Multi-Table Academic Analytics Pipeline (INNER JOIN + GROUP BY)',
    diagramCaption:
      'Normalized foreign keys (student_id, course_id) connect Students, Enrollments, and Courses without duplicating student or syllabus records.',
    cases: [
      {
        id: 'sql-registrar-audit',
        sector: 'University Registrar & EdTech',
        title: 'Fall Semester Transcript & Roster Join Audit',
        context:
          'A university portal needs every Fall 2026 enrollment joined with student majors and course titles ordered from highest exam score to lowest.',
        expressionOrSnippet:
          'Students ⋈ Enrollments ⋈ Courses WHERE semester = "Fall 2026" ORDER BY score DESC',
        givenParameters: 'Tables: Students (10), Courses (6), Enrollments (18)',
        verifiedOutcome: 'Returns verified 10-row dean’s-list roster in < 1 ms',
        takeaway:
          'Joining across foreign keys avoids update anomalies when a student changes major or a course instructor is updated.',
        presetIndex: 0,
      },
      {
        id: 'sql-department-having',
        sector: 'Curriculum Analytics & Accreditation',
        title: 'Filtering High-Enrollment Courses with GROUP BY & HAVING',
        context:
          'Academic chairs identify courses averaging >= 88% across at least 2 enrolled students to benchmark teaching outcomes.',
        expressionOrSnippet:
          'GROUP BY c.course_code HAVING COUNT(e.enrollment_id) >= 2 AND AVG(e.score) >= 88',
        givenParameters: 'Aggregates: COUNT(), AVG(), INNER JOIN Courses',
        verifiedOutcome: 'Pinpoints CS201, CS310, CS340 & DS250 qualifying sections',
        takeaway:
          'WHERE filters raw enrollment rows first; HAVING filters groups after COUNT and AVG have been computed.',
        presetIndex: 1,
      },
    ],
  },

  'truth-table-generator': {
    sectionHeading: 'Real-Life Applications of Boolean Logic & Digital Gates',
    sectionIntro:
      'Microprocessor ALUs, industrial PLC safety interlocks, and hardware multiplexers translate Boolean specifications directly into verified gate networks.',
    domainTag: 'Digital Logic & Computer Architecture · RTL',
    diagramTitle: 'Industrial Reactor Safety Interlock Gate Network',
    diagramCaption:
      'Hardware safety interlocks combine Sensor OK (A), Valve Sealed (B), and Emergency Override (!C) through AND/OR/NOT gates before energizing actuators.',
    cases: [
      {
        id: 'tt-safety-interlock',
        sector: 'Embedded Control & Avionics',
        title: 'Three-Sensor Fail-Safe Interlock Verification',
        context:
          'A chemical autoclave door unlocks only when Pressure Safe (A) AND Temp Safe (B) hold, OR Manual Supervisor Key (C) is engaged without Fault (D).',
        expressionOrSnippet: '(A && B) || (C && !D)',
        givenParameters: 'Variables: A, B, C, D (2^4 = 16 states)',
        verifiedOutcome: 'Strict 7 safe-unlock minterms verified (Σm)',
        takeaway:
          'Enumerating all 2^n states guarantees zero unexpected race or hazard combinations unlock high-pressure hardware.',
        presetIndex: 0,
      },
      {
        id: 'tt-half-adder',
        sector: 'CPU Arithmetic Logic Unit (ALU)',
        title: '1-Bit Half-Adder Sum & Parity Circuit (XOR + AND)',
        context:
          'Every modern CPU adds binary bits at the silicon level using XOR for the Sum bit and AND for the Carry-Out bit.',
        expressionOrSnippet: '(A ^ B) || (A && C)',
        givenParameters: 'Variables: A, B, C (Carry-In) -> 8 states',
        verifiedOutcome: 'Produces canonical SOP/POS & ANSI gate diagram',
        takeaway:
          'XOR gates detect odd parity in single-bit addition, while AND/OR trees propagate carry signals across 64-bit registers.',
        presetIndex: 1,
      },
    ],
  },

  'binary-hex-converter': {
    sectionHeading: 'Real-Life Applications of Two’s Complement & IEEE 754 Floats',
    sectionIntro:
      'Systems engineers, game developers, and embedded firmware programmers inspect exact memory bytes, signed offsets, and floating-point bits to prevent overflow bugs.',
    domainTag: 'Low-Level Systems & Memory Representation',
    diagramTitle: 'Drone Flight Telemetry: 32-Bit IEEE 754 Float & Status Byte',
    diagramCaption:
      'Autopilot telemetry packets pack floating-point altitude/temperature into 32-bit IEEE 754 frames alongside bitwise sensor flags.',
    cases: [
      {
        id: 'bin-ieee754-sensor',
        sector: 'Aerospace & Embedded Firmware',
        title: 'Decoding IEEE 754 Sensor Packet (-13.625 °C)',
        context:
          'A weather probe transmits 4 raw hex bytes over SPI; engineers convert the float into Sign (1), Biased Exponent (130 -> 2^3), and 23-bit Mantissa.',
        expressionOrSnippet: '(-1)^1 × (1.101101)_2 × 2^(130 - 127) = -13.625',
        givenParameters: 'Hex: 0xC15A0000 | Sign: 1 | Exp: 10000010',
        verifiedOutcome: 'Exact float32 bit-pattern decoded with zero error',
        takeaway:
          'Power-of-two fractions like 0.625 (5/8) represent cleanly in IEEE 754, whereas 0.1 repeats infinitely in base 2.',
        presetIndex: 0,
      },
      {
        id: 'bin-twos-comp-overflow',
        sector: 'C / C++ & Operating Systems',
        title: '8-Bit Signed Two’s Complement Boundary (-42)',
        context:
          '8-bit microcontrollers store signed offsets in [-128, +127]; inverting bits and adding 1 yields exact negative hardware register values.',
        expressionOrSnippet: '~(00101010) + 1 = 11010110_2 = 0xD6 = -42',
        givenParameters: 'Width: 8-bit Signed | Decimal: -42',
        verifiedOutcome: 'Binary: 11010110 | Hex: D6 | Signed Range OK',
        takeaway:
          'Two’s complement lets CPU hardware reuse the exact same binary adder circuit for both signed addition and subtraction.',
        presetIndex: 1,
      },
    ],
  },

  'algorithm-visualizer': {
    sectionHeading: 'Real-Life Applications of Sorting & Binary Search Algorithms',
    sectionIntro:
      'Database query planners, e-commerce price ranking, and real-time game rendering engines choose algorithms based on comparison budget and data order.',
    domainTag: 'Algorithm Engineering & Asymptotic Performance',
    diagramTitle: 'Scale Benchmark: Quadratic Bubble Sort vs. O(n log n) Quick/Merge',
    diagramCaption:
      'Visualizing why O(n^2) sorts stall at scale while O(n log n) divide-and-conquer + O(log n) Binary Search stay sub-millisecond.',
    cases: [
      {
        id: 'algo-quicksort-feed',
        sector: 'E-Commerce Search & Ranking',
        title: 'Sorting Product Price Feeds via Quick Sort',
        context:
          'Ordering 24 catalog prices before caching relies on in-place partitioning around a pivot to achieve ~O(n log n) average comparisons.',
        expressionOrSnippet: 'T(n) = 2T(n/2) + Θ(n)  ⇒  O(n log n) avg comparisons',
        givenParameters: 'Array Size: 24 elements | Pivot partitioning',
        verifiedOutcome: 'Cuts comparisons by > 65% vs. Bubble Sort on n = 24',
        takeaway:
          'Divide-and-conquer partitions reduce global disorder exponentially faster than adjacent pairwise swaps.',
        presetIndex: 0,
      },
      {
        id: 'algo-binary-search',
        sector: 'Time-Series Log Indexing',
        title: 'Logarithmic Timestamp Lookup via Binary Search',
        context:
          'Finding an exact transaction ID inside sorted audit shards halves the remaining search window on every single comparison.',
        expressionOrSnippet: 'mid = left + floor((right - left) / 2)  ⇒  <= ceil(log2 n)',
        givenParameters: 'Sorted Array | Worst-case probes <= 5 for n = 24',
        verifiedOutcome: 'Locates target in O(log n) probes with 0 swaps',
        takeaway:
          'Sorting once with O(n log n) pays off whenever systems serve thousands of subsequent O(log n) binary lookups.',
        presetIndex: 1,
      },
    ],
  },

  'data-structure-visualizer': {
    sectionHeading: 'Real-Life Applications of BSTs, Stacks & FIFO Queues',
    sectionIntro:
      'Compiler syntax trees, database B-Tree indexes, browser history Undo stacks, and microservice message brokers depend directly on these three core ADTs.',
    domainTag: 'Data Structures · Trees, LIFO Stacks & FIFO Queues',
    diagramTitle: 'Core ADTs in Production Software: BST Index, Call Stack & Print Queue',
    diagramCaption:
      'Binary Search Trees support sorted In-Order scans and O(h) searches, Stacks manage LIFO function frames, and Queues enforce fair FIFO scheduling.',
    cases: [
      {
        id: 'ds-bst-index',
        sector: 'Database Indexing & Compilers',
        title: 'Sorted Range Scan via BST In-Order Traversal',
        context:
          'Inserting record keys into a Binary Search Tree maintains Left < Node < Right so In-Order (L-N-R) traversal emits keys strictly sorted.',
        expressionOrSnippet: 'In-Order(x) = In-Order(x.left) + [x.key] + In-Order(x.right)',
        givenParameters: 'Root: 50 | Balanced 9-node sample tree',
        verifiedOutcome: 'Emits ascending keys [20, 30, 40, 50, 60, 70, 80...]',
        takeaway:
          'Pre-Order serializes tree shape for disk persistence, Post-Order frees child memory safely, and In-Order yields sorted order.',
        presetIndex: 0,
      },
      {
        id: 'ds-stack-queue',
        sector: 'OS Task Schedulers & Editors',
        title: 'Call-Stack Frame Push/Pop (LIFO) vs. Job Queue (FIFO)',
        context:
          'Text editors track Undo history on a LIFO Stack while print servers and API workers dispatch incoming jobs strictly in FIFO Queue arrival order.',
        expressionOrSnippet: 'Stack: Push/Pop O(1) Top  |  Queue: Enqueue Rear, Dequeue Front',
        givenParameters: '4 buffered tasks [15, 28, 42, 64]',
        verifiedOutcome: 'Zero starvation on FIFO; instant state rewind on LIFO',
        takeaway:
          'Matching LIFO vs. FIFO discipline to access order guarantees O(1) pointer updates without shifting array elements.',
        presetIndex: 1,
      },
    ],
  },

  'subnet-calculator': {
    sectionHeading: 'Real-Life Applications of IPv4 / CIDR Subnetting',
    sectionIntro:
      'Cloud architects slice VPC CIDR blocks into isolated public/private subnets, firewall ACL wildcards, and point-to-point router links without IP waste.',
    domainTag: 'Computer Networks & Cloud VPC Architecture',
    diagramTitle: 'Cloud VPC Subnet Segmentation: Slicing 192.168.10.0/24 into /26 Tiers',
    diagramCaption:
      'Extending the prefix from /24 to /26 borrows 2 host bits to carve 4 isolated subnetworks with 62 usable hosts each.',
    cases: [
      {
        id: 'net-vpc-tier',
        sector: 'AWS / Cloud VPC Networking',
        title: 'Segmenting Application Subnet (192.168.10.42/26)',
        context:
          'An architect allocates a /26 block for 50 microservice containers while reserving a matching wildcard mask for router ACL rules.',
        expressionOrSnippet: '192.168.10.42/26 -> Network .0 | Broadcast .63 | 62 hosts',
        givenParameters: 'IP: 192.168.10.42 | CIDR: /26 (255.255.255.192)',
        verifiedOutcome: 'Usable: 192.168.10.1 – .62 | Wildcard: 0.0.0.63',
        takeaway:
          'Usable host capacity is 2^(32 - prefix) - 2 because the all-zeros host ID and all-ones broadcast ID are reserved.',
        presetIndex: 0,
      },
      {
        id: 'net-p2p-link',
        sector: 'ISP Core Routing (RFC 3021)',
        title: 'Point-to-Point Router Link Allocation (/31 Prefix)',
        context:
          'Modern backbone routers use RFC 3021 /31 subnets between peer interfaces to eliminate the 50% IP waste of traditional /30 blocks.',
        expressionOrSnippet: '10.10.0.4/31 -> 2 Usable P2P Peer Addresses (.4 & .5)',
        givenParameters: 'IP: 10.10.0.4 | CIDR: /31 (255.255.255.254)',
        verifiedOutcome: '2 usable point-to-point interfaces, 0 wasted IPs',
        takeaway:
          'RFC 3021 treats both addresses of a /31 link as valid unicast host endpoints on serial and Ethernet P2P links.',
        presetIndex: 1,
      },
    ],
  },

  'regex-tester': {
    sectionHeading: 'Real-Life Applications of Regular Expressions & Capture Groups',
    sectionIntro:
      'API gateways, SIEM security log parsers, and form validators rely on compiled finite-automata patterns to extract structured tokens in a single pass.',
    domainTag: 'Parsing, Log Extraction & Input Validation',
    diagramTitle: 'Nginx Access Log Tokenization via Named/Numbered Capture Groups',
    diagramCaption:
      'Capture groups ($1 User, $2 Domain) isolate validated fields without brittle substring slicing or manual loops.',
    cases: [
      {
        id: 'regex-email-parser',
        sector: 'SaaS Auth & CRM Ingestion',
        title: 'Extracting Local-Part & University Domains from Rosters',
        context:
          'Separating student usernames from academic domains in messy enrollment imports using anchored character classes and capture groups.',
        expressionOrSnippet: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        givenParameters: 'Flags: g | Capture Groups: $1 User, $2 Domain',
        verifiedOutcome: 'Cleanly isolates valid academic emails while skipping malformed hosts',
        takeaway:
          'Grouping with parentheses extracts $1/$2 substrings cleanly, whereas non-capturing (?:...) avoids extra memory allocations.',
        presetIndex: 0,
      },
      {
        id: 'regex-ipv4-firewall',
        sector: 'DevSecOps & Log Monitoring',
        title: 'Strict 0–255 IPv4 Address Extraction from Firewall Logs',
        context:
          'Naive \\d{1,3} patterns falsely match 999.10.0.1; bounded alternation guarantees every matched octet lies strictly in 0–255.',
        expressionOrSnippet: '\\b((?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|...)\\b',
        givenParameters: 'Flags: g | Alternation per octet (0–255)',
        verifiedOutcome: 'Matches 192.168.1.1 & 8.8.8.8 while rejecting 999.x & 256.x',
        takeaway:
          'Word boundaries (\\b) prevent partial substring matches inside longer numbers or corrupted log fields.',
        presetIndex: 1,
      },
    ],
  },

  'big-o-calculator': {
    sectionHeading: 'Real-Life Applications of Big-O Time & Space Analysis',
    sectionIntro:
      'Backend engineers estimate asymptotic growth before shipping code so a routine tested on 100 staging rows does not cause an outage on 100,000 production rows.',
    domainTag: 'Algorithmic Scalability & Systems Latency',
    diagramTitle: 'Latency Scaling Curve: O(1) vs. O(n log n) vs. O(n^2) Against SLA',
    diagramCaption:
      'At n = 10,000, an O(n^2) nested loop executes 100,000,000 iterations (~1 s+), while O(n log n) completes in ~1.3 ms.',
    cases: [
      {
        id: 'bigo-nested-incident',
        sector: 'Backend API Scalability',
        title: 'Eliminating a Hidden O(n^2) Loop in Order Reconciliation',
        context:
          'Comparing every invoice against every shipment via nested loops works at n = 100 (10K ops), but explodes to 100M ops at n = 10,000.',
        expressionOrSnippet: 'for i in 0..n: for j in i+1..n: ...  ⇒  n(n-1)/2 = O(n^2)',
        givenParameters: 'n = 10,000 records -> ~100,000,000 comparisons',
        verifiedOutcome: 'Switching to Hash Set lookup cuts ops 10,000x to O(n)',
        takeaway:
          'Trading O(n) auxiliary hash-map space to drop time complexity from O(n^2) to O(n) is the highest-ROI optimization in backend code.',
        presetIndex: 4,
      },
      {
        id: 'bigo-mergesort-sla',
        sector: 'Distributed Analytics & Sorting',
        title: 'Guaranteeing Worst-Case O(n log n) Merge Sort SLA',
        context:
          'Financial clearinghouses choose deterministic O(n log n) Merge/Timsort pipelines over unguarded O(n^2)-worst-case sorts.',
        expressionOrSnippet: 'T(n) = 2T(n/2) + O(n)  ⇒  132,877 ops at n = 10,000',
        givenParameters: 'n = 10,000 | Auxiliary Space: O(n)',
        verifiedOutcome: 'Finishes in ~1.3 ms regardless of adversarial input order',
        takeaway:
          'Logarithmic recursion depth (log2 10,000 ≈ 13.3 levels) keeps total work strictly proportional to n log n.',
        presetIndex: 3,
      },
    ],
  },

  'code-formatter-diff': {
    sectionHeading: 'Real-Life Applications of Structured Data Formatting & Code Diffing',
    sectionIntro:
      'REST/GraphQL debugging, Kubernetes manifest reviews, and Git pull-request diff engines depend on strict schema validation and Longest Common Subsequence (LCS) line diffing.',
    domainTag: 'Developer Tooling · Serialization & VCS Diff',
    diagramTitle: 'CI/CD Configuration Review: JSON ↔ YAML Validation & LCS Diff',
    diagramCaption:
      'LCS line diffing isolates exact off-by-one bug fixes or timeout tuning lines while CSV/YAML conversions bridge APIs and spreadsheets.',
    cases: [
      {
        id: 'diff-off-by-one',
        sector: 'Code Review & Git Pull Requests',
        title: 'Spotting Off-by-One & Overflow Fixes in Binary Search Diff',
        context:
          'Comparing original vs. patched implementations highlights exact bounds fixes (`right = arr.length - 1`) and overflow-safe midpoint arithmetic.',
        expressionOrSnippet: '- const mid = Math.floor((left + right) / 2);\n+ const mid = left + Math.floor((right - left) / 2);',
        givenParameters: 'Algorithm: Myers / LCS Line Diff Matrix',
        verifiedOutcome: 'Highlights +3 added / -3 removed lines in context',
        takeaway:
          'Line-by-line LCS diffing prevents noisy full-file rewrites by pinpointing the minimal edit script between two revisions.',
        presetIndex: 1,
      },
      {
        id: 'fmt-json-api-csv',
        sector: 'API Integration & Data Engineering',
        title: 'Validating Course Roster JSON & Exporting Clean CSV',
        context:
          'API payloads arrive minified or broken by trailing commas; exact line/column diagnostics locate syntax faults before YAML/CSV export.',
        expressionOrSnippet: 'JSON (408 B) -> Validated 2-Space Tree -> RFC 4180 CSV / YAML',
        givenParameters: 'Payload: CS304 Course Roster with 3 nested Student records',
        verifiedOutcome: '0 syntax errors · Instant JSON ↔ YAML ↔ CSV conversion',
        takeaway:
          'Strict double-quoted JSON keys ensure lossless interoperability across Python, Go, Java, and browser clients.',
        presetIndex: 0,
      },
    ],
  },

  'crypto-jwt-tool': {
    sectionHeading: 'Real-Life Applications of Cryptographic Hashes & JWT Auth',
    sectionIntro:
      'Artifact checksum verification, password/API integrity, Base64URL binary transport, and stateless OAuth2/OIDC JSON Web Tokens power modern web security.',
    domainTag: 'Applied Cryptography & Stateless Authentication',
    diagramTitle: 'Stateless API Gateway: JWT Header.Payload.Signature & SHA-256 Digest',
    diagramCaption:
      'Base64URL encodes public JWT claims (alg, sub, exp), while SHA-256 enforces one-way avalanche integrity where 1 changed bit flips ~50% of digest bits.',
    cases: [
      {
        id: 'crypto-jwt-expiry',
        sector: 'OAuth 2.0 & Microservice Auth',
        title: 'Debugging an Expired Bearer JWT Claim Window',
        context:
          'When a React client receives HTTP 401 Unauthorized, engineers decode Segment 1 & 2 locally to inspect `alg`, `roles`, and Unix `exp` timestamps.',
        expressionOrSnippet: 'Base64URL(Header).Base64URL(Payload).Signature  ->  exp < now',
        givenParameters: 'Format: HS256 JWT | Timestamp Check: iat / exp',
        verifiedOutcome: 'Immediately flags active vs. expired window in local UTC time',
        takeaway:
          'Standard JWT payloads are Base64URL-encoded—readable by anyone—so never store secrets inside claims, and always verify signatures server-side.',
        presetIndex: 2,
      },
      {
        id: 'crypto-sha256-integrity',
        sector: 'Supply Chain & Artifact Security',
        title: 'Verifying Build Checksums via Web Crypto SHA-256',
        context:
          'Package managers compare a downloaded release digest against the publisher’s expected SHA-256 hash to guarantee zero tampering in transit.',
        expressionOrSnippet: 'SHA-256("university-tutors.com :: CS410 Security Lab") -> 256-bit hex',
        givenParameters: 'Engine: Browser crypto.subtle.digest("SHA-256")',
        verifiedOutcome: 'Instant 64-hex-char digest & exact match comparator check',
        takeaway:
          'Because SHA-256 exhibits the avalanche effect, altering even a single whitespace character produces an unrelated 256-bit digest.',
        presetIndex: 0,
      },
    ],
  },
};
