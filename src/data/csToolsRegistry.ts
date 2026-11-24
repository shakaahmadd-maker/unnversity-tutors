export type CsToolCategory =
  | 'All Tools'
  | 'Algorithms & Data Structures'
  | 'Systems & Logic'
  | 'Databases & Web'
  | 'Networking & Security';

export const CS_TOOL_CATEGORIES: CsToolCategory[] = [
  'All Tools',
  'Algorithms & Data Structures',
  'Systems & Logic',
  'Databases & Web',
  'Networking & Security',
];

export const CS_HUB_KEYWORDS: string[] = [
  'computer science tools online',
  'free coding playground',
  'online sql compiler',
  'truth table generator',
  'binary to hex converter',
  'sorting algorithm visualizer',
  'binary search tree visualizer',
  'subnet calculator ipv4 cidr',
  'regex tester online',
  'big o notation calculator',
  'json formatter and diff checker',
  'sha256 generator and jwt decoder',
];

export type CsToolSlug =
  | 'sql-playground'
  | 'truth-table-generator'
  | 'binary-hex-converter'
  | 'algorithm-visualizer'
  | 'data-structure-visualizer'
  | 'subnet-calculator'
  | 'regex-tester'
  | 'big-o-calculator'
  | 'code-formatter-diff'
  | 'crypto-jwt-tool';

export interface CsToolFaq {
  question: string;
  answer: string;
}

export interface CsToolDefinition {
  slug: CsToolSlug;
  path: string;
  viewKey: string;
  title: string;
  shortTitle: string;
  category: Exclude<CsToolCategory, 'All Tools'>;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  howToUse: [string, string, string];
  keyConcepts: { label: string; formula: string }[];
  faqs: [CsToolFaq, CsToolFaq, CsToolFaq];
}

export const CS_TOOLS_LIST: CsToolDefinition[] = [
  {
    slug: 'sql-playground',
    path: '/tools/sql-playground',
    viewKey: 'tools/sql-playground',
    title: 'Client-Side SQL Query Playground',
    shortTitle: 'SQL Query Playground',
    category: 'Databases & Web',
    summary:
      'Write and execute SQL queries locally against pre-loaded university tables (Students, Courses, Enrollments) with JOIN, GROUP BY, HAVING, subqueries, and CSV export.',
    seoTitle: 'Free Online SQL Query Playground & Practice Sandbox | University Tutors',
    seoDescription:
      'Practice SQL JOIN, GROUP BY, HAVING, aggregate functions, and subqueries 100% locally in your browser with pre-loaded university tables and instant CSV export.',
    keywords: [
      'online sql playground',
      'sql compiler online',
      'sqlite online',
      'sql practice online',
      'sql query runner',
      'sql join practice',
      'sql group by having examples',
      'free sql sandbox',
    ],
    howToUse: [
      'Inspect the pre-loaded Students, Courses, and Enrollments schemas in the left sidebar or click any column name to insert it.',
      'Write a SELECT, INSERT, UPDATE, or DELETE statement—or pick one of the 5 university assignment sample queries.',
      'Click Run Query to inspect execution time, tabular output, and export results as CSV or copy them to your lab report.',
    ],
    keyConcepts: [
      { label: 'Logical SQL Execution Order', formula: 'FROM / JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT' },
      { label: 'Inner vs. Left Join', formula: 'INNER JOIN keeps matching rows; LEFT JOIN retains all left rows with NULL for unmatched right columns.' },
      { label: 'WHERE vs. HAVING', formula: 'WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY.' },
    ],
    faqs: [
      {
        question: 'Does this SQL playground send my queries to a remote database server?',
        answer:
          'No. The entire relational query engine runs 100% locally in your browser memory. Resetting the database restores the default university dataset instantly.',
      },
      {
        question: 'Which SQL clauses and aggregate functions are supported?',
        answer:
          'You can run SELECT, DISTINCT, INNER/LEFT/RIGHT JOIN, WHERE (including IN, BETWEEN, LIKE, IS NULL, and scalar/list subqueries), GROUP BY, HAVING, ORDER BY, LIMIT, COUNT, SUM, AVG, MIN, MAX, ROUND, plus INSERT, UPDATE, and DELETE.',
      },
      {
        question: 'Why does my query fail when using COUNT(*) inside a WHERE clause?',
        answer:
          'Aggregate functions like COUNT, AVG, and SUM cannot be evaluated in WHERE because WHERE filters rows before groups exist. Move aggregate conditions into a HAVING clause after GROUP BY.',
      },
    ],
  },
  {
    slug: 'truth-table-generator',
    path: '/tools/truth-table-generator',
    viewKey: 'tools/truth-table-generator',
    title: 'Boolean Logic Gate & Truth Table Generator',
    shortTitle: 'Boolean Truth Table & Gates',
    category: 'Systems & Logic',
    summary:
      'Parse Boolean expressions up to 5 variables with step-by-step sub-expression columns, canonical SOP/POS forms, and an auto-drawn SVG logic gate diagram.',
    seoTitle: 'Boolean Truth Table Generator & Logic Gate Diagram Builder | University Tutors',
    seoDescription:
      'Generate step-by-step Boolean truth tables (up to 5 variables), canonical Sum of Products (SOP), Product of Sums (POS), and SVG logic gate circuits locally.',
    keywords: [
      'truth table generator',
      'boolean algebra calculator',
      'logic gate simulator',
      'sop and pos calculator',
      'boolean expression simplifier',
      'xor nand nor truth table',
      'digital logic circuit drawer',
    ],
    howToUse: [
      'Enter a Boolean expression using variables A–E and operators AND (&&, *), OR (||, +), NOT (!, ~), XOR (^), NAND, or NOR.',
      'Review every intermediate sub-expression column in the generated truth table along with canonical SOP and POS formulas.',
      'Inspect the auto-rendered SVG logic gate diagram and copy the truth table or canonical expressions with one click.',
    ],
    keyConcepts: [
      { label: 'Row Count Formula', formula: 'Rows = 2^n where n is the number of distinct Boolean variables (max 2^5 = 32 rows).' },
      { label: "De Morgan's Laws", formula: '!(A && B) = !A || !B   and   !(A || B) = !A && !B' },
      { label: 'Canonical Forms', formula: 'SOP = OR of minterms (rows = 1); POS = AND of maxterms (rows = 0).' },
    ],
    faqs: [
      {
        question: 'What operator precedence does the Boolean parser follow?',
        answer:
          'Parentheses () have highest precedence, followed by NOT (!, ~), then AND/NAND (&&, *), then XOR (^), and finally OR/NOR (||, +).',
      },
      {
        question: 'How are Sum of Products (SOP) and Product of Sums (POS) derived?',
        answer:
          'SOP combines every input row where the output is 1 into ANDed minterms joined by OR. POS combines every row where the output is 0 into ORed maxterms joined by AND.',
      },
      {
        question: 'What do Tautology, Contradiction, and Contingency mean?',
        answer:
          'A Tautology evaluates to 1 for every input combination, a Contradiction evaluates to 0 for every row, and a Contingency produces both 1 and 0 outcomes.',
      },
    ],
  },
  {
    slug: 'binary-hex-converter',
    path: '/tools/binary-hex-converter',
    viewKey: 'tools/binary-hex-converter',
    title: "Number Base, Two's Complement & IEEE 754 Converter",
    shortTitle: 'Binary, Hex & IEEE 754',
    category: 'Systems & Logic',
    summary:
      "Bidirectional Binary, Octal, Decimal, and Hex converter with interactive 8/16/32-bit Two's Complement, IEEE 754 single-precision bit breakdown, and bitwise calculator.",
    seoTitle: "Binary Hex Converter, Two's Complement & IEEE 754 Calculator | University Tutors",
    seoDescription:
      "Convert Binary, Octal, Decimal, and Hexadecimal in real time, inspect interactive 8/16/32-bit Two's Complement and IEEE 754 float bits, and compute bitwise operations.",
    keywords: [
      'binary to decimal converter',
      'hex to binary converter',
      "two's complement calculator",
      'ieee 754 floating point converter',
      'float to hex converter',
      'bitwise calculator online',
      'octal to hexadecimal',
    ],
    howToUse: [
      'Type any integer into the Binary, Octal, Decimal, or Hexadecimal field to synchronize all four bases simultaneously.',
      "Switch to the Two's Complement tab to flip individual bits in 8, 16, or 32-bit registers, or use IEEE 754 to inspect float32 Sign, Exponent, and Mantissa bits.",
      'Use the Bitwise Operations section to compare Operand A and Operand B across AND, OR, XOR, NOT, and shift operators.',
    ],
    keyConcepts: [
      { label: "Two's Complement Range", formula: 'Signed n-bit integer range: -2^(n-1) to 2^(n-1) - 1 (e.g., 8-bit: -128 to +127).' },
      { label: 'IEEE 754 Single Precision (32-bit)', formula: 'Value = (-1)^S × (1.Mantissa)_2 × 2^(Exponent - 127)' },
      { label: 'Bit Shift Equivalence', formula: 'x << k multiplies by 2^k (mod 2^32); x >> k performs arithmetic right shift by k bits.' },
    ],
    faqs: [
      {
        question: "How do you manually convert a negative decimal number to Two's Complement?",
        answer:
          'Write the positive magnitude in fixed-width binary, invert every bit (1s complement), and add 1 to the least significant bit, discarding any carry beyond the register width.',
      },
      {
        question: 'Why does IEEE 754 single precision add a bias of 127 to the exponent?',
        answer:
          'Adding a bias of 127 stores exponents from -126 to +127 as unsigned 8-bit integers (1 to 254), which allows hardware to compare floating-point magnitudes lexicographically.',
      },
      {
        question: 'Why is 0.1 + 0.2 not exact in IEEE 754 floating point?',
        answer:
          'Decimal 0.1 is a repeating fraction in base 2 (0.0001100110011...), so truncating it to 23 mantissa bits introduces a tiny rounding error around 1e-7 in 32-bit float.',
      },
    ],
  },
  {
    slug: 'algorithm-visualizer',
    path: '/tools/algorithm-visualizer',
    viewKey: 'tools/algorithm-visualizer',
    title: 'Interactive Sorting & Pathfinding Algorithm Visualizer',
    shortTitle: 'Algorithm Visualizer',
    category: 'Algorithms & Data Structures',
    summary:
      'Step-by-step animated visualizer for Bubble, Selection, Insertion, Merge, Quick Sort, and Binary Search with live comparisons, swaps, speed, and array controls.',
    seoTitle: 'Interactive Sorting & Binary Search Algorithm Visualizer | University Tutors',
    seoDescription:
      'Watch Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, and Binary Search step by step with live comparison and swap counters.',
    keywords: [
      'sorting algorithm visualizer',
      'algorithm visualizer online',
      'quick sort visualizer',
      'merge sort step by step',
      'bubble sort animation',
      'binary search visualizer',
      'time complexity comparison',
    ],
    howToUse: [
      'Choose an algorithm (Bubble, Selection, Insertion, Merge, Quick Sort, or Binary Search) and adjust the Array Size or Speed slider.',
      'Press Play for continuous animation, or use Step Forward and Step Back to trace every single comparison and swap.',
      'Monitor live Comparisons, Swaps/Writes, and complexity readouts to see how algorithmic efficiency scales.',
    ],
    keyConcepts: [
      { label: 'Quadratic vs. Log-Linear Sorts', formula: 'Bubble/Selection/Insertion: O(n^2) avg  |  Merge/Quick Sort: O(n log n) avg' },
      { label: 'Binary Search Recurrence', formula: 'T(n) = T(n/2) + O(1)  =>  O(log_2 n) comparisons on a sorted array.' },
      { label: 'Stability Property', formula: 'Bubble, Insertion, and Merge Sort are stable; standard in-place Selection and Quick Sort are unstable.' },
    ],
    faqs: [
      {
        question: 'Why does Merge Sort perform fewer comparisons than Bubble Sort?',
        answer:
          'Merge Sort uses divide-and-conquer to split the array in half recursively (log n levels) and merges sorted halves in linear time, achieving O(n log n) instead of O(n^2).',
      },
      {
        question: 'When does Quick Sort degrade to O(n^2) worst-case time?',
        answer:
          'Quick Sort reaches O(n^2) when the chosen pivot is consistently the smallest or largest element—such as picking the last element on an already-sorted array.',
      },
      {
        question: 'Why must an array be sorted before running Binary Search?',
        answer:
          'Binary Search eliminates half of the remaining range on each step by comparing the target against the middle value. That guarantee only holds when values are monotonically ordered.',
      },
    ],
  },
  {
    slug: 'data-structure-visualizer',
    path: '/tools/data-structure-visualizer',
    viewKey: 'tools/data-structure-visualizer',
    title: 'Data Structure & Binary Search Tree (BST) Explorer',
    shortTitle: 'BST, Stack & Queue Lab',
    category: 'Algorithms & Data Structures',
    summary:
      'Insert, delete, and search nodes in an interactive SVG Binary Search Tree, Stack, or Queue with animated In-Order, Pre-Order, Post-Order, and BFS traversals.',
    seoTitle: 'Interactive Binary Search Tree (BST), Stack & Queue Visualizer | University Tutors',
    seoDescription:
      'Build Binary Search Trees, Stacks, and Queues interactively. Insert, delete, search, and animate In-Order, Pre-Order, Post-Order, and Level-Order (BFS) traversals.',
    keywords: [
      'binary search tree visualizer',
      'bst visualizer online',
      'data structure visualizer',
      'inorder preorder postorder traversal',
      'bfs level order tree traversal',
      'stack and queue visualizer',
      'tree traversal generator',
    ],
    howToUse: [
      'Select Binary Search Tree, Stack (LIFO), or Queue (FIFO), or load the sample tree/structure in one click.',
      'Enter an integer value to Insert/Push/Enqueue, Delete/Pop/Dequeue, or Search with animated path highlighting.',
      'Run In-Order, Pre-Order, Post-Order, or Level-Order (BFS) animations on a BST to observe the live visit sequence.',
    ],
    keyConcepts: [
      { label: 'BST Invariant', formula: 'For every node x: all keys in left(x) < key(x) < all keys in right(x).' },
      { label: 'DFS Traversal Orders', formula: 'In-Order: L-N-R (sorted)  |  Pre-Order: N-L-R  |  Post-Order: L-R-N' },
      { label: 'Stack vs. Queue', formula: 'Stack = LIFO (Push/Pop at Top in O(1)); Queue = FIFO (Enqueue Rear, Dequeue Front in O(1)).' },
    ],
    faqs: [
      {
        question: 'Why does In-Order traversal of a Binary Search Tree produce sorted output?',
        answer:
          'Because every node visits its entire smaller left subtree before emitting its own value and then visiting its larger right subtree, keys are naturally visited in ascending order.',
      },
      {
        question: 'How does BST deletion handle a node with two children?',
        answer:
          'The deleted node is replaced by its in-order successor—the smallest node in its right subtree—which preserves the BST ordering invariant across the entire tree.',
      },
      {
        question: 'What is the difference between Level-Order (BFS) and DFS traversals?',
        answer:
          'Level-Order uses a FIFO Queue to visit every node depth-by-depth from the root downward, while Pre/In/Post-Order use recursion (or a LIFO Stack) to explore branches depth-first.',
      },
    ],
  },
  {
    slug: 'subnet-calculator',
    path: '/tools/subnet-calculator',
    viewKey: 'tools/subnet-calculator',
    title: 'IPv4 / CIDR Subnet Mask Calculator',
    shortTitle: 'IPv4 / CIDR Subnet Calc',
    category: 'Networking & Security',
    summary:
      'Compute Network, Broadcast, First/Last Usable Host, Wildcard Mask, IP Class, Private/Public scope, and a color-coded 32-bit binary network vs. host bit map.',
    seoTitle: 'Free IPv4 & CIDR Subnet Calculator with 32-Bit Binary Map | University Tutors',
    seoDescription:
      'Calculate IPv4 network address, broadcast address, usable host range, wildcard mask, CIDR prefix (/0–/32), and 32-bit binary bitmaps instantly in your browser.',
    keywords: [
      'subnet calculator',
      'ipv4 cidr calculator',
      'subnet mask calculator',
      'cidr to ip range',
      'network and broadcast address calculator',
      'wildcard mask calculator',
      'usable host calculator',
    ],
    howToUse: [
      'Enter any IPv4 address (e.g., 192.168.10.42) and select a CIDR prefix (/0 to /32) or type a dotted subnet mask.',
      'Review the calculated Network ID, Broadcast Address, First/Last Usable Host, Usable Host count, and Wildcard Mask.',
      'Inspect the 32-bit binary map to verify exact network-prefix vs. host-bit boundaries or copy the full subnet table.',
    ],
    keyConcepts: [
      { label: 'Host Capacity Formulas', formula: 'Total IPs = 2^(32 - prefix)   |   Usable Hosts = 2^(32 - prefix) - 2 (for /0 to /30)' },
      { label: 'Network & Broadcast Bitwise', formula: 'Network = IP & Mask   |   Broadcast = Network | (~Mask >>> 0)' },
      { label: 'RFC 1918 Private Blocks', formula: '10.0.0.0/8,  172.16.0.0/12 (172.16–172.31),  and  192.168.0.0/16' },
    ],
    faqs: [
      {
        question: 'Why are 2 addresses subtracted when calculating usable hosts?',
        answer:
          'In standard IPv4 subnets (/0 through /30), the all-zeros host address is reserved as the Network ID and the all-ones host address is reserved for the Subnet Broadcast Address.',
      },
      {
        question: 'How are /31 and /32 CIDR prefixes treated?',
        answer:
          'A /32 prefix identifies a single host route (1 usable IP). Under RFC 3021, a /31 prefix provides 2 usable addresses for point-to-point router links without broadcast overhead.',
      },
      {
        question: 'What is a Wildcard Mask used for?',
        answer:
          'A Wildcard Mask is the bitwise inverse of the Subnet Mask (255.255.255.255 - Mask) and is used in router Access Control Lists (ACLs) and OSPF area definitions.',
      },
    ],
  },
  {
    slug: 'regex-tester',
    path: '/tools/regex-tester',
    viewKey: 'tools/regex-tester',
    title: 'Regex Tester, Debugger & Plain-English Explainer',
    shortTitle: 'Regex Tester & Explainer',
    category: 'Databases & Web',
    summary:
      'Test regular expressions live with flags (g, i, m, s), highlighted match ranges, capture group breakdown tables, CS presets, and token-by-token English explanations.',
    seoTitle: 'Free Online Regex Tester, Debugger & Plain-English Explainer | University Tutors',
    seoDescription:
      'Test JavaScript regular expressions with live match highlights, capture group tables, common CS validation presets, and plain-English token explanations locally.',
    keywords: [
      'regex tester',
      'regex debugger online',
      'regular expression tester',
      'regex explainer',
      'regex capture group tester',
      'email ipv4 regex validator',
      'javascript regex playground',
    ],
    howToUse: [
      'Type a regular expression pattern and toggle flags (g, i, m, s), or click one of the 5 CS presets (Email, IPv4, Date, URL, Password).',
      'Paste or edit test text to see every matching range highlighted along with its index and capture group table.',
      'Read the Token-by-Token Plain-English Explanation panel to verify what each metacharacter, quantifier, and group does.',
    ],
    keyConcepts: [
      { label: 'Core Character Classes', formula: '\\d = [0-9],  \\w = [A-Za-z0-9_],  \\s = whitespace,  . = any char (except \\n unless s flag)' },
      { label: 'Quantifiers & Laziness', formula: '* (0+), + (1+), ? (0 or 1), {n,m} (between n and m); append ? (e.g., *?) for lazy matching.' },
      { label: 'Anchors & Boundaries', formula: '^ start of string/line,  $ end of string/line,  \\b word boundary.' },
    ],
    faqs: [
      {
        question: 'What is the difference between a capturing group (...) and a non-capturing group (?:...)?',
        answer:
          'A capturing group (...) stores its matched substring for backreferences and extraction ($1, $2), whereas (?:...) groups tokens for alternation or quantifiers without creating a numbered capture.',
      },
      {
        question: 'Why does my regex only find the first match unless I enable the g flag?',
        answer:
          'Without the global (g) flag, JavaScript regular expressions stop immediately after finding the first match in the input string.',
      },
      {
        question: 'How do positive (?=...) and negative (?!...) lookaheads work?',
        answer:
          'Lookaheads assert that a pattern does (or does not) appear ahead of the current position without consuming any characters, which is essential for multi-rule password validation.',
      },
    ],
  },
  {
    slug: 'big-o-calculator',
    path: '/tools/big-o-calculator',
    viewKey: 'tools/big-o-calculator',
    title: 'Big-O Time & Space Complexity Analyzer & Reference',
    shortTitle: 'Big-O Complexity Lab',
    category: 'Algorithms & Data Structures',
    summary:
      'Paste JS/Python/Java/C++ loops or choose algorithm patterns to estimate Time & Space Big-O complexity alongside an interactive n = 10 to 10,000 growth-rate chart.',
    seoTitle: 'Big-O Time & Space Complexity Analyzer & Growth Chart | University Tutors',
    seoDescription:
      'Analyze loop and recursion complexity in JS, Python, Java, or C++ and compare O(1), O(log n), O(n), O(n log n), O(n^2), and O(2^n) operation counts interactively.',
    keywords: [
      'big o notation calculator',
      'time complexity calculator',
      'space complexity analyzer',
      'big o cheat sheet chart',
      'algorithm complexity estimator',
      'o(n log n) vs o(n^2)',
      'code time complexity checker',
    ],
    howToUse: [
      'Paste a function or loop snippet in JavaScript, Python, Java, or C++, or select one of the classic CS complexity patterns.',
      'Review the estimated Time Complexity, Space Complexity, and step-by-step static heuristic breakdown.',
      'Adjust the input size n slider (10 to 10,000) and toggle Linear/Log scale on the chart to compare growth curves.',
    ],
    keyConcepts: [
      { label: 'Dominant Term Rule', formula: 'O(3n^2 + 12n + 50) = O(n^2) — drop constant multipliers and lower-order terms.' },
      { label: 'Master Theorem (Common Case)', formula: 'T(n) = aT(n/b) + f(n): e.g., T(n) = 2T(n/2) + O(n) => O(n log n).' },
      { label: 'Complexity Ordering', formula: 'O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!)' },
    ],
    faqs: [
      {
        question: 'Can a static code analyzer determine exact Big-O for every possible program?',
        answer:
          'Determining exact runtime for arbitrary programs is undecidable in general (related to the Halting Problem). This tool inspects loop nesting, logarithmic halving/doubling, recursion branching, and allocations to provide accurate estimates for standard CS patterns.',
      },
      {
        question: 'What is the difference between auxiliary space and total space complexity?',
        answer:
          'Total space includes the input size plus extra memory used. Auxiliary space counts only extra working memory—such as temporary arrays, hash tables, and the recursion call stack.',
      },
      {
        question: 'Why does O(2^n) become impractical even for small n?',
        answer:
          'At n = 30, 2^30 exceeds one billion operations; at n = 50, 2^50 exceeds 1.1 quadrillion operations, making naive branching recursion infeasible without memoization or dynamic programming.',
      },
    ],
  },
  {
    slug: 'code-formatter-diff',
    path: '/tools/code-formatter-diff',
    viewKey: 'tools/code-formatter-diff',
    title: 'JSON / XML / YAML Formatter, Validator & Side-by-Side Diff Checker',
    shortTitle: 'JSON / XML / YAML & Diff',
    category: 'Databases & Web',
    summary:
      'Pretty-print, minify, validate JSON/XML/YAML with exact line diagnostics, convert between JSON, YAML, and CSV, and run a side-by-side line diff highlighter.',
    seoTitle: 'Free JSON, XML & YAML Formatter, Validator & Code Diff Checker | University Tutors',
    seoDescription:
      'Format, minify, validate with line numbers, convert JSON to YAML or CSV, and compare code side-by-side with LCS diff highlighting 100% locally in your browser.',
    keywords: [
      'json formatter online',
      'json validator',
      'yaml to json converter',
      'json to csv converter',
      'xml formatter and validator',
      'diff checker online',
      'side by side code compare',
    ],
    howToUse: [
      'Choose Formatter & Converter mode to paste JSON, XML, or YAML—or switch to Side-by-Side Diff to compare two code blocks.',
      'Click Format, Minify, or Convert (JSON ↔ YAML, JSON → CSV, XML → JSON) and review inline validation with exact line numbers.',
      'In Diff mode, toggle Ignore Whitespace to isolate semantic line additions (+), removals (-), and unchanged context.',
    ],
    keyConcepts: [
      { label: 'Strict JSON Rules', formula: 'Double-quoted keys & strings, no trailing commas, no comments, valid UTF-8 literals.' },
      { label: 'LCS Diff Algorithm', formula: 'Longest Common Subsequence finds minimal edit scripts (insertions & deletions) in O(M × N) time.' },
      { label: 'Serialization Tradeoffs', formula: 'JSON is compact for APIs; YAML optimizes human config readability; XML supports attributes & schemas.' },
    ],
    faqs: [
      {
        question: 'Why does valid JavaScript object syntax often fail JSON validation?',
        answer:
          'JSON requires double quotes around every object key and string value, forbids trailing commas after the last element, and does not permit // or /* */ comments.',
      },
      {
        question: 'How does the JSON to CSV converter handle nested objects?',
        answer:
          'When converting a JSON array of objects to CSV, each top-level key becomes a column header, nested objects/arrays are safely serialized, and commas or quotes are RFC 4180 escaped.',
      },
      {
        question: 'Is my pasted source code or configuration uploaded anywhere?',
        answer:
          'Never. Formatting, XML DOM parsing, YAML conversion, and LCS diffing all run purely in browser JavaScript with zero network transmission.',
      },
    ],
  },
  {
    slug: 'crypto-jwt-tool',
    path: '/tools/crypto-jwt-tool',
    viewKey: 'tools/crypto-jwt-tool',
    title: 'Hash Generator, Base64 & JWT Inspector',
    shortTitle: 'Hash, Base64 & JWT Lab',
    category: 'Networking & Security',
    summary:
      'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes via Web Crypto API, encode/decode Base64 & URL strings, and decode JWT headers, payloads, and expirations locally.',
    seoTitle: 'Free SHA-256 Hash Generator, Base64 & Local JWT Decoder | University Tutors',
    seoDescription:
      'Compute SHA-1/256/384/512 hashes with browser Web Crypto API, encode/decode Base64 & Base64URL, and inspect JWT headers, claims, and expiration dates locally.',
    keywords: [
      'sha256 hash generator',
      'jwt decoder online',
      'base64 encode decode',
      'jwt token inspector',
      'sha512 hash calculator',
      'url encoder decoder',
      'base64url converter',
    ],
    howToUse: [
      'Select Hash Generator to compute real-time SHA-1, SHA-256, SHA-384, and SHA-512 digests using browser-native Web Crypto.',
      'Use Base64 / URL mode for UTF-8 safe Base64, Base64URL, or percent-encoding transformations.',
      'Switch to JWT Inspector to paste a three-segment JSON Web Token and inspect its decoded Header, Payload, and exp/iat timestamps.',
    ],
    keyConcepts: [
      { label: 'Cryptographic Hash Properties', formula: 'Deterministic, pre-image resistant, collision resistant, and avalanche effect.' },
      { label: 'JWT Structure', formula: 'Base64URL(Header) + "." + Base64URL(Payload) + "." + Signature' },
      { label: 'Encoding vs. Encryption', formula: 'Base64 and JWT payloads are encoded (readable by anyone), NOT encrypted unless using JWE.' },
    ],
    faqs: [
      {
        question: 'Is Base64 or a standard JWT payload encrypted?',
        answer:
          'No. Base64 and Base64URL are reversible encodings, not encryption. Anyone holding a standard JWT can decode its header and payload, so never store secrets or passwords inside JWT claims.',
      },
      {
        question: 'Why should SHA-256 be preferred over SHA-1?',
        answer:
          'SHA-1 (160-bit) has demonstrated practical collision attacks and is deprecated for digital certificates and integrity verification. SHA-256 and SHA-512 remain cryptographically secure.',
      },
      {
        question: 'Does the JWT Inspector verify the cryptographic signature?',
        answer:
          'This client-side inspector decodes the header, payload, and timestamps locally without needing your private signing secret. Signature verification must always occur on your backend server.',
      },
    ],
  },
];

export const CS_TOOLS_BY_SLUG: Record<CsToolSlug, CsToolDefinition> = CS_TOOLS_LIST.reduce(
  (acc, tool) => {
    acc[tool.slug] = tool;
    return acc;
  },
  {} as Record<CsToolSlug, CsToolDefinition>
);

export type ResolvedCsRoute =
  | { kind: 'hub' }
  | { kind: 'tool'; tool: CsToolDefinition };

export function resolveCsRoute(input: string): ResolvedCsRoute | null {
  if (!input) return null;
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^[#/]+/, '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+$/, '');

  if (cleaned === 'tools/computer-science' || cleaned === 'tools/cs') {
    return { kind: 'hub' };
  }

  let slug = '';
  if (cleaned.startsWith('tools/computer-science/')) {
    slug = cleaned.slice('tools/computer-science/'.length);
  } else if (cleaned.startsWith('tools/')) {
    slug = cleaned.slice('tools/'.length);
  } else {
    slug = cleaned;
  }

  const tool = CS_TOOLS_BY_SLUG[slug as CsToolSlug];
  if (tool) {
    return { kind: 'tool', tool };
  }
  return null;
}
