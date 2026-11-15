import { jsPDF } from 'jspdf';

export function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return [249, 115, 22]; // Default University-Tutors Orange (#F97316)
}

/**
 * Normalizes Unicode arrows, subscripts, and symbols unsupported by jsPDF's built-in
 * WinAnsi fonts (Helvetica / Courier) so characters never disappear or render garbled.
 */
export function sanitizePdfText(input: string): string {
  if (!input) return '';
  const subMap: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
  };

  return String(input)
    .replace(/→|➜|➔/g, '->')
    .replace(/←/g, '<-')
    .replace(/⇄|⇆|↔/g, '<->')
    .replace(/⇌/g, '<=>')
    .replace(/⇒/g, '=>')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/≠/g, '!=')
    .replace(/≈/g, '~')
    .replace(/≡/g, '=')
    .replace(/−|–|—/g, '-')
    .replace(/×/g, ' x ')
    .replace(/÷/g, '/')
    .replace(/·/g, ' * ')
    .replace(/±/g, '+/-')
    .replace(/∞/g, 'inf')
    .replace(/√/g, 'sqrt')
    .replace(/∫/g, 'Integral ')
    .replace(/∑/g, 'Sum ')
    .replace(/∂/g, 'd')
    .replace(/∇/g, 'grad ')
    .replace(/ℒ/g, 'L')
    .replace(/ℱ/g, 'F')
    .replace(/°/g, ' deg')
    .replace(/′|’|‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/⟨/g, '<')
    .replace(/⟩/g, '>')
    .replace(/∈/g, ' in ')
    .replace(/ᵀ/g, '^T')
    .replace(/ⁿ/g, '^n')
    .replace(/Δ/g, 'Delta ')
    .replace(/θ/g, 'theta')
    .replace(/λ/g, 'lambda')
    .replace(/μ/g, 'mu')
    .replace(/σ/g, 'sigma')
    .replace(/φ/g, 'phi')
    .replace(/χ/g, 'chi')
    .replace(/ω/g, 'omega')
    .replace(/Ω/g, 'Ohm')
    .replace(/π/g, 'pi')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/δ/g, 'delta')
    .replace(/ε/g, 'eps')
    .replace(/x̄/g, 'x_bar')
    .replace(/ŷ/g, 'y_hat')
    .replace(/p̂/g, 'p_hat')
    .replace(/✓|✔/g, '[OK]')
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, (ch) => subMap[ch] || '');
}

interface LoadedLogoData {
  dataUrl: string;
  width: number;
  height: number;
}

let cachedBrandLogoPromise: Promise<LoadedLogoData | null> | null = null;

function loadImageAsPng(src: string): Promise<LoadedLogoData | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 1500);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const w = img.naturalWidth || 440;
        const h = img.naturalHeight || 168;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: w,
          height: h,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };

    img.src = src;
  });
}

export function getBrandLogoForPdf(): Promise<LoadedLogoData | null> {
  if (cachedBrandLogoPromise) return cachedBrandLogoPromise;
  cachedBrandLogoPromise = (async () => {
    const candidates = ['/logo_transparent-440.webp', '/logo-440.webp', '/logo.webp'];
    for (const candidate of candidates) {
      const loaded = await loadImageAsPng(candidate);
      if (loaded) return loaded;
    }
    return null;
  })();
  return cachedBrandLogoPromise;
}

function drawPdfBrandHeader(
  doc: jsPDF,
  logo: LoadedLogoData | null,
  options: {
    marginX: number;
    pageWidth: number;
    y: number;
    badgeText?: string;
    subtitleText?: string;
    accentRgb: [number, number, number];
  }
): number {
  const { marginX, pageWidth, y, badgeText, subtitleText, accentRgb } = options;
  const [ar, ag, ab] = accentRgb;

  if (logo && logo.width > 0 && logo.height > 0) {
    const logoH = 10.5;
    const logoW = Math.min(46, logoH * (logo.width / logo.height));
    doc.addImage(logo.dataUrl, 'PNG', marginX, y - 4.5, logoW, logoH);
  } else {
    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(marginX, y - 3.5, 9.5, 9.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('UT', marginX + 4.75, y + 2.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('University-Tutors.com', marginX + 12.5, y + 2.5);
  }

  if (badgeText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(ar, ag, ab);
    doc.text(sanitizePdfText(badgeText), pageWidth - marginX, y + 0.5, { align: 'right' });
  }

  if (subtitleText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(sanitizePdfText(subtitleText), pageWidth - marginX, y + 4.8, { align: 'right' });
  }

  const ruleY = y + 8.5;
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.7);
  doc.line(marginX, ruleY, pageWidth - marginX, ruleY);
  return ruleY + 7;
}

export function triggerPdfDownload(doc: jsPDF, filename: string): void {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch {
    doc.save(safeName);
  }
}

export interface AcademicPdfSection {
  heading: string;
  lines: string[];
  monospace?: boolean;
}

export interface AcademicReportPdfOptions {
  filename: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  metadataRows?: Array<{ label: string; value: string }>;
  sections: AcademicPdfSection[];
  accentHex?: string;
}

/**
 * Generates an instant, multi-page A4 selectable vector PDF report for any University-Tutors tool
 * without invoking browser print dialogs.
 */
export async function downloadAcademicReportPdf(options: AcademicReportPdfOptions): Promise<void> {
  const {
    filename,
    title,
    subtitle,
    badgeText,
    metadataRows = [],
    sections,
    accentHex = '#F97316',
  } = options;

  const logo = await getBrandLogoForPdf();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const accentRgb = hexToRgbTuple(accentHex);
  const [ar, ag, ab] = accentRgb;

  const dateStamp = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let y = drawPdfBrandHeader(doc, logo, {
    marginX,
    pageWidth,
    y: 16,
    badgeText,
    subtitleText: `university-tutors.com · ${dateStamp}`,
    accentRgb,
  });

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(sanitizePdfText(title), contentWidth) as string[];
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 6.5 + 1;

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const subLines = doc.splitTextToSize(sanitizePdfText(subtitle), contentWidth) as string[];
    doc.text(subLines, marginX, y);
    y += subLines.length * 4.5 + 3;
  }

  // Metadata Box
  if (metadataRows.length > 0) {
    const boxPadding = 4;
    const rowHeight = 5.2;
    const boxHeight = metadataRows.length * rowHeight + boxPadding * 2 - 1;
    ensureSpace(boxHeight + 6);

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, y, contentWidth, boxHeight, 2, 2, 'FD');

    let metaY = y + boxPadding + 3.2;
    for (const row of metadataRows) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(71, 85, 105);
      const labelStr = `${sanitizePdfText(row.label)}: `;
      doc.text(labelStr, marginX + 4, metaY);
      const labelW = doc.getTextWidth(labelStr);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      const cleanVal = sanitizePdfText(String(row.value || '-').replace(/\s+/g, ' '));
      const clippedVal = (doc.splitTextToSize(cleanVal, contentWidth - labelW - 8) as string[])[0] || '';
      doc.text(clippedVal, marginX + 4 + labelW, metaY);
      metaY += rowHeight;
    }

    y += boxHeight + 7;
  }

  // Sections
  for (const section of sections) {
    const validLines = section.lines.filter((l) => l !== undefined && l !== null);
    if (validLines.length === 0) continue;

    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(ar, ag, ab);
    doc.text(sanitizePdfText(section.heading).toUpperCase(), marginX, y);
    y += 2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 5;

    doc.setFont(section.monospace ? 'courier' : 'helvetica', 'normal');
    doc.setFontSize(section.monospace ? 9 : 9.8);
    doc.setTextColor(30, 41, 59);

    for (const rawLine of validLines) {
      const cleanLine = sanitizePdfText(rawLine);
      if (cleanLine.trim() === '') {
        y += 2.5;
        continue;
      }
      const wrapped = doc.splitTextToSize(cleanLine, contentWidth) as string[];
      for (const wl of wrapped) {
        ensureSpace(5.2);
        doc.text(wl, marginX, y);
        y += 4.8;
      }
      y += 0.8;
    }

    y += 4;
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated locally via University-Tutors.com Free Academic Tools · ${dateStamp}`,
      marginX,
      pageHeight - 8.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, {
      align: 'right',
    });
  }

  triggerPdfDownload(doc, filename);
}

export interface PunnettSquarePdfPayload {
  mode: 'mono' | 'di';
  parent1Label: string;
  parent2Label: string;
  parent1Description: string;
  parent2Description: string;
  traitSummaryLines: string[];
  rowGametes: string[];
  colGametes: string[];
  grid: string[][];
  totalCells: number;
  genoEntries: Array<[string, number]>;
  genoRatio: string;
  phenotypes: Array<{
    label: string;
    count: number;
    pct: number;
    tone: 'dom' | 'mix1' | 'mix2' | 'rec';
    matches: (geno: string) => boolean;
  }>;
  phenoRatio: string;
  inspectedCell?: {
    p1Gamete: string;
    p2Gamete: string;
    cellGeno: string;
    zygosity: string;
    matchedPhenoLabel: string;
    totalMatches: number;
    pct: string;
  } | null;
  workedExample?: {
    problem: string;
    steps: string[];
    answer: string;
  };
}

function getPunnettCellPdfColors(
  mode: 'mono' | 'di',
  geno: string
): {
  fill: [number, number, number];
  border: [number, number, number];
  text: [number, number, number];
  tag: string;
} {
  if (mode === 'mono') {
    if (geno === 'AA') {
      return {
        fill: [255, 247, 237],
        border: [253, 186, 116],
        text: [234, 88, 12],
        tag: 'Hom. Dom.',
      };
    }
    if (geno === 'Aa') {
      return {
        fill: [255, 251, 235],
        border: [253, 230, 138],
        text: [17, 24, 39],
        tag: 'Heterozygous',
      };
    }
    return {
      fill: [241, 245, 249],
      border: [203, 213, 225],
      text: [51, 65, 85],
      tag: 'Hom. Rec.',
    };
  }

  const hasA = geno.slice(0, 2).includes('A');
  const hasB = geno.slice(2, 4).includes('B');
  if (hasA && hasB) {
    return {
      fill: [255, 247, 237],
      border: [253, 186, 116],
      text: [234, 88, 12],
      tag: 'A_B_',
    };
  }
  if (hasA && !hasB) {
    return {
      fill: [240, 249, 255],
      border: [186, 230, 253],
      text: [12, 74, 110],
      tag: 'A_bb',
    };
  }
  if (!hasA && hasB) {
    return {
      fill: [236, 253, 245],
      border: [167, 243, 208],
      text: [6, 78, 59],
      tag: 'aaB_',
    };
  }
  return {
    fill: [241, 245, 249],
    border: [203, 213, 225],
    text: [51, 65, 85],
    tag: 'aabb',
  };
}

/**
 * Generates a dedicated, logo-branded, vector-grid A4 PDF report for the
 * Punnett Square Calculator so the Punnett grid, genotype ratios, and phenotype
 * distribution bars render cleanly with zero missing or garbled data.
 */
export async function downloadPunnettSquarePdf(payload: PunnettSquarePdfPayload): Promise<void> {
  const logo = await getBrandLogoForPdf();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const accentRgb: [number, number, number] = [249, 115, 22];

  const dateStamp = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const ensureSpace = (neededMm: number, currentY: number): number => {
    if (currentY + neededMm > pageHeight - 17) {
      doc.addPage();
      return 18;
    }
    return currentY;
  };

  // 1. Branded Header with University-Tutors Logo
  let y = drawPdfBrandHeader(doc, logo, {
    marginX,
    pageWidth,
    y: 16,
    badgeText: 'BIOLOGY · GENETICS LAB REPORT',
    subtitleText: `university-tutors.com · Issued ${dateStamp}`,
    accentRgb,
  });

  // 2. Title & Cross Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('Punnett Square Inheritance Report', marginX, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const modeText =
    payload.mode === 'mono'
      ? `Monohybrid Cross (2×2 Grid · ${payload.parent1Label} × ${payload.parent2Label})`
      : `Dihybrid Cross (4×4 Grid · ${payload.parent1Label} × ${payload.parent2Label})`;
  doc.text(sanitizePdfText(modeText), marginX, y);
  y += 6;

  // 3. Cross Parameters Metadata Card
  const traitLines = payload.traitSummaryLines.map((line) => sanitizePdfText(line));
  const traitWrapped = traitLines.flatMap(
    (l) => doc.splitTextToSize(l, contentWidth - 8) as string[]
  );
  const metaBoxH = 19 + traitWrapped.length * 4.4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, y, contentWidth, metaBoxH, 2.5, 2.5, 'FD');

  const colMid = marginX + contentWidth / 2 + 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text('PARENT 1 (ROWS)', marginX + 4, y + 5.5);
  doc.text('PARENT 2 (COLUMNS)', colMid, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  const p1Val = sanitizePdfText(
    `${payload.parent1Label} (${payload.parent1Description}) · Gametes: ${payload.rowGametes.join(', ')}`
  );
  const p2Val = sanitizePdfText(
    `${payload.parent2Label} (${payload.parent2Description}) · Gametes: ${payload.colGametes.join(', ')}`
  );
  doc.text((doc.splitTextToSize(p1Val, contentWidth / 2 - 7) as string[])[0] || p1Val, marginX + 4, y + 10.5);
  doc.text((doc.splitTextToSize(p2Val, contentWidth / 2 - 7) as string[])[0] || p2Val, colMid, y + 10.5);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(marginX + 4, y + 13.8, pageWidth - marginX - 4, y + 13.8);

  let traitY = y + 18.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  for (const tl of traitWrapped) {
    doc.text(tl, marginX + 4, traitY);
    traitY += 4.3;
  }

  y += metaBoxH + 7;

  // 4. Actual Vector-Drawn Punnett Square Grid (Exact Visual Match)
  const nCols = payload.colGametes.length;
  const nRows = payload.rowGametes.length;
  const isMono = payload.mode === 'mono';
  const cellGap = isMono ? 2.2 : 1.6;
  const rowHdrW = isMono ? 26 : 22;
  const colHdrH = isMono ? 11 : 9.5;
  const cellW = isMono ? 48 : (contentWidth - rowHdrW - cellGap * nCols) / nCols;
  const cellH = isMono ? 20 : 15;
  const totalGridW = rowHdrW + cellGap * nCols + cellW * nCols;
  const gridStartX = marginX + (contentWidth - totalGridW) / 2;
  const gridTotalH = colHdrH + cellGap * nRows + cellH * nRows;

  y = ensureSpace(gridTotalH + 16, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(234, 88, 12);
  doc.text(
    sanitizePdfText(`PUNNETT GRID (${payload.parent1Label} × ${payload.parent2Label})`),
    marginX,
    y
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${payload.totalCells} Offspring Squares`, pageWidth - marginX, y, { align: 'right' });
  y += 4;

  // Background grid frame
  const framePad = 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(
    gridStartX - framePad,
    y,
    totalGridW + framePad * 2,
    gridTotalH + framePad * 2,
    3,
    3,
    'FD'
  );

  const innerTopY = y + framePad;

  // Corner P1 \ P2 Label
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(gridStartX, innerTopY, rowHdrW, colHdrH, 1.8, 1.8, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('P1 \\ P2', gridStartX + rowHdrW / 2, innerTopY + colHdrH / 2 + 1.2, {
    align: 'center',
  });

  // Column Gamete Headers
  payload.colGametes.forEach((cg, cIdx) => {
    const cx = gridStartX + rowHdrW + cellGap + cIdx * (cellW + cellGap);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(cx, innerTopY, cellW, colHdrH, 1.8, 1.8, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(isMono ? 11 : 10);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizePdfText(cg), cx + cellW / 2, innerTopY + colHdrH / 2 + 1.3, {
      align: 'center',
    });
  });

  // Grid Rows + Data Cells
  payload.grid.forEach((row, rIdx) => {
    const ry = innerTopY + colHdrH + cellGap + rIdx * (cellH + cellGap);

    // Row Gamete Header
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(gridStartX, ry, rowHdrW, cellH, 1.8, 1.8, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(isMono ? 11 : 10);
    doc.setTextColor(255, 255, 255);
    doc.text(
      sanitizePdfText(payload.rowGametes[rIdx] || ''),
      gridStartX + rowHdrW / 2,
      ry + cellH / 2 + 1.3,
      { align: 'center' }
    );

    // Offspring Cells
    row.forEach((cellGeno, cIdx) => {
      const cx = gridStartX + rowHdrW + cellGap + cIdx * (cellW + cellGap);
      const colors = getPunnettCellPdfColors(payload.mode, cellGeno);

      doc.setFillColor(colors.fill[0], colors.fill[1], colors.fill[2]);
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, ry, cellW, cellH, 2, 2, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(isMono ? 14 : 11);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(sanitizePdfText(cellGeno), cx + cellW / 2, ry + cellH / 2 - 0.3, {
        align: 'center',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isMono ? 7.6 : 6.8);
      doc.setTextColor(100, 116, 139);
      const matchedPheno = payload.phenotypes.find((p) => p.matches(cellGeno));
      const subLabel = isMono
        ? `${colors.tag} · 25%`
        : sanitizePdfText(matchedPheno ? `${colors.tag} · ${matchedPheno.label.split(' (')[0]}` : colors.tag);
      const clippedSub = (doc.splitTextToSize(subLabel, cellW - 4) as string[])[0] || subLabel;
      doc.text(clippedSub, cx + cellW / 2, ry + cellH / 2 + (isMono ? 4.8 : 4.2), {
        align: 'center',
      });
    });
  });

  y += gridTotalH + framePad * 2 + 6;

  // Optional Inspected Cell Note if selected on screen
  if (payload.inspectedCell) {
    y = ensureSpace(14, y);
    const ic = payload.inspectedCell;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(253, 186, 116);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, 10.5, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12);
    doc.text(
      sanitizePdfText(
        `Highlighted Square: ${ic.p1Gamete} × ${ic.p2Gamete} -> ${ic.cellGeno} (${ic.zygosity}) · ${ic.matchedPhenoLabel} · ${ic.totalMatches}/${payload.totalCells} (${ic.pct}%)`
      ),
      marginX + 4,
      y + 6.5
    );
    y += 14.5;
  }

  // 5. Genotype Ratios Card Grid (2-column layout so all up to 9 genotypes fit cleanly)
  const genoRowsCount = Math.ceil(payload.genoEntries.length / 2);
  const genoCardH = 7.6;
  const genoRowGap = 2.2;
  const genoBlockH = 8 + genoRowsCount * (genoCardH + genoRowGap);
  y = ensureSpace(genoBlockH + 4, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(234, 88, 12);
  doc.text(`GENOTYPE RATIOS (${payload.genoEntries.length} UNIQUE)`, marginX, y);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text(`Simplified Ratio: ${sanitizePdfText(payload.genoRatio)}`, pageWidth - marginX, y, {
    align: 'right',
  });
  y += 4;

  const halfCardW = (contentWidth - 4) / 2;
  payload.genoEntries.forEach(([geno, count], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cardX = marginX + col * (halfCardW + 4);
    const cardY = y + row * (genoCardH + genoRowGap);
    const pct = ((count / payload.totalCells) * 100).toFixed(1);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, halfCardW, genoCardH, 1.8, 1.8, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(234, 88, 12);
    doc.text(sanitizePdfText(geno), cardX + 3.5, cardY + 5.1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(100, 116, 139);
    const zygTag =
      payload.mode === 'mono'
        ? geno === 'AA'
          ? 'Homozygous Dominant'
          : geno === 'Aa'
          ? 'Heterozygous'
          : 'Homozygous Recessive'
        : getPunnettCellPdfColors('di', geno).tag;
    doc.text(zygTag, cardX + 18, cardY + 5.0);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(17, 24, 39);
    doc.text(`${count}/${payload.totalCells} (${pct}%)`, cardX + halfCardW - 3.5, cardY + 5.1, {
      align: 'right',
    });
  });

  y += genoRowsCount * (genoCardH + genoRowGap) + 4;

  // 6. Phenotype Distribution with Visual Ratio Bars
  const phenoCardH = 11;
  const phenoGap = 2.4;
  const phenoBlockH = 8 + payload.phenotypes.length * (phenoCardH + phenoGap);
  y = ensureSpace(phenoBlockH + 4, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(234, 88, 12);
  doc.text('PHENOTYPE DISTRIBUTION', marginX, y);

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text(`Simplified Ratio: ${sanitizePdfText(payload.phenoRatio)}`, pageWidth - marginX, y, {
    align: 'right',
  });
  y += 4;

  const toneRgb = (tone: 'dom' | 'mix1' | 'mix2' | 'rec'): [number, number, number] => {
    if (tone === 'dom') return [249, 115, 22];
    if (tone === 'mix1') return [2, 132, 199];
    if (tone === 'mix2') return [5, 150, 105];
    return [100, 116, 139];
  };

  payload.phenotypes.forEach((p, idx) => {
    const py = y + idx * (phenoCardH + phenoGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, py, contentWidth, phenoCardH, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);
    const pLabel = sanitizePdfText(p.label);
    const clippedLabel = (doc.splitTextToSize(pLabel, contentWidth - 45) as string[])[0] || pLabel;
    doc.text(clippedLabel, marginX + 3.5, py + 5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(
      `${p.count}/${payload.totalCells} (${p.pct.toFixed(1)}%)`,
      pageWidth - marginX - 3.5,
      py + 5,
      { align: 'right' }
    );

    // Horizontal progress bar track & fill
    const barX = marginX + 3.5;
    const barW = contentWidth - 7;
    const barY = py + 7.2;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, barY, barW, 2.1, 1, 1, 'F');

    const fillW = Math.max(0, Math.min(barW, (barW * p.pct) / 100));
    if (fillW > 0.5) {
      const [tr, tg, tb] = toneRgb(p.tone);
      doc.setFillColor(tr, tg, tb);
      doc.roundedRect(barX, barY, fillW, 2.1, 1, 1, 'F');
    }
  });

  y += payload.phenotypes.length * (phenoCardH + phenoGap) + 5;

  // 7. Optional Worked Lab Walkthrough (Flows cleanly to Page 2 if needed)
  if (payload.workedExample) {
    y = ensureSpace(32, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(234, 88, 12);
    doc.text('WORKED LAB & EXAM REFERENCE WALKTHROUGH', marginX, y);
    y += 2.5;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    const probLines = doc.splitTextToSize(
      `Problem: ${sanitizePdfText(payload.workedExample.problem)}`,
      contentWidth
    ) as string[];
    for (const pl of probLines) {
      y = ensureSpace(5, y);
      doc.text(pl, marginX, y);
      y += 4.5;
    }
    y += 1.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    payload.workedExample.steps.forEach((step, idx) => {
      const sLines = doc.splitTextToSize(
        `Step ${idx + 1}: ${sanitizePdfText(step)}`,
        contentWidth
      ) as string[];
      for (const sl of sLines) {
        y = ensureSpace(5, y);
        doc.text(sl, marginX, y);
        y += 4.5;
      }
      y += 0.8;
    });

    y = ensureSpace(8, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(234, 88, 12);
    const ansLines = doc.splitTextToSize(
      `Verified Result: ${sanitizePdfText(payload.workedExample.answer)}`,
      contentWidth
    ) as string[];
    for (const al of ansLines) {
      y = ensureSpace(5, y);
      doc.text(al, marginX, y);
      y += 4.5;
    }
  }

  // 8. Branded Page Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated via University-Tutors.com Punnett Square Calculator · ${dateStamp}`,
      marginX,
      pageHeight - 8.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, {
      align: 'right',
    });
  }

  triggerPdfDownload(
    doc,
    `punnett-square-${payload.parent1Label}-x-${payload.parent2Label}.pdf`
  );
}

export interface GradeEquivalencePdfPayload {
  reportId: string;
  issuedDate: string;
  applicantName: string;
  homeProgram: string;
  targetProgram: string;
  gradingPolicyLabel: string;
  sourceSystemLabel: string;
  obtainedScore: string;
  minPassScore: string;
  destinationLabel: string;
  convertedGradeBig: string;
  convertedClassification: string;
  ectsBand: string;
  formulaUsed: string;
  creditLabel: string;
  targetCreditsText: string;
  perSemCreditsText: string;
  totalStudyHoursText: string;
  weeklyStudyHoursText: string;
  workAllowanceMain: string;
  workAllowanceNote: string;
  snapshots: {
    uk: string;
    usa: string;
    canada: string;
    australia: string;
    ireland: string;
    nz: string;
    singapore: string;
    ects: string;
  };
}

/**
 * Generates the Official Branded A4 Academic Grade & Credit Equivalence PDF Report
 * directly via jsPDF without opening browser print dialogs.
 */
export function downloadGradeEquivalencePdf(payload: GradeEquivalencePdfPayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  let y = 16;

  // 1. Branded Header
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(marginX, y - 4, 11, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('UT', marginX + 5.5, y + 3, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text('University-Tutors.com', marginX + 14, y + 0.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'International Academic Credential & Grade Equivalence Report',
    marginX + 14,
    y + 5.5
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text(`Ref ID: ${payload.reportId}`, pageWidth - marginX, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text(`Issued: ${payload.issuedDate}`, pageWidth - marginX, y + 4.5, { align: 'right' });

  y += 11;
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;

  // 2. Applicant & Qualification Metadata Card
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 24, 2.5, 2.5, 'FD');

  const leftColX = marginX + 4;
  const rightColX = marginX + contentWidth / 2 + 2;
  const colMaxW = contentWidth / 2 - 6;

  const drawKeyVal = (x: number, rowY: number, label: string, val: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    const line = (doc.splitTextToSize(val, colMaxW) as string[])[0] || val;
    doc.text(line, x, rowY + 4.3);
  };

  drawKeyVal(leftColX, y + 5.5, 'APPLICANT NAME', payload.applicantName);
  drawKeyVal(rightColX, y + 5.5, 'TARGET PROGRAM / INTAKE', payload.targetProgram);
  drawKeyVal(leftColX, y + 15, 'HOME QUALIFICATION', payload.homeProgram);
  drawKeyVal(rightColX, y + 15, 'INSTITUTIONAL GRADING POLICY', payload.gradingPolicyLabel);

  y += 30;

  // 3. Primary Conversion Highlight Card
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, y, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text('OFFICIAL ACADEMIC EQUIVALENCE SUMMARY', marginX + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Source System: ${payload.sourceSystemLabel}`, marginX + 5, y + 13);
  doc.text(
    `Obtained Score: ${payload.obtainedScore} (Minimum Pass: ${payload.minPassScore})`,
    marginX + 5,
    y + 18.5
  );
  doc.text(`Target Destination: ${payload.destinationLabel}`, marginX + 5, y + 24);

  // Right Big Converted Grade
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(payload.convertedGradeBig, pageWidth - marginX - 5, y + 14, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(5, 150, 105);
  doc.text(payload.convertedClassification, pageWidth - marginX - 5, y + 20, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(67, 56, 202);
  doc.text(payload.ectsBand, pageWidth - marginX - 5, y + 25, { align: 'right' });

  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.3);
  doc.line(marginX + 5, y + 29, pageWidth - marginX - 5, y + 29);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const formulaClipped = (doc.splitTextToSize(`Methodology: ${payload.formulaUsed}`, contentWidth - 10) as string[])[0];
  doc.text(formulaClipped, marginX + 5, y + 34);

  y += 44;

  // 4. Credits & Study Workload Cards
  const halfW = (contentWidth - 4) / 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, y, halfW, 22, 2.5, 2.5, 'FD');
  doc.roundedRect(marginX + halfW + 4, y, halfW, 22, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text(payload.creditLabel.toUpperCase(), marginX + 4, y + 6);
  doc.text('TOTAL ACADEMIC STUDY WORKLOAD', marginX + halfW + 8, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(17, 24, 39);
  doc.text(payload.targetCreditsText, marginX + 4, y + 12.5);
  doc.text(payload.totalStudyHoursText, marginX + halfW + 8, y + 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(71, 85, 105);
  doc.text(payload.perSemCreditsText, marginX + 4, y + 18);
  doc.text(payload.weeklyStudyHoursText, marginX + halfW + 8, y + 18);

  y += 27;

  // 5. Student Visa Working Allowance Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.35);
  const workNoteLines = doc.splitTextToSize(payload.workAllowanceNote, contentWidth - 8) as string[];
  const visaBoxH = 15 + workNoteLines.length * 4.2;
  doc.roundedRect(marginX, y, contentWidth, visaBoxH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('DESTINATION INTERNATIONAL STUDENT VISA WORK ALLOWANCE', marginX + 4, y + 5.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(payload.workAllowanceMain, marginX + 4, y + 11.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(51, 65, 85);
  doc.text(workNoteLines, marginX + 4, y + 16);

  y += visaBoxH + 7;

  // 6. 8-Column Global Benchmark Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Global English-Speaking Destinations & ECTS Benchmark Table', marginX, y);
  y += 3.5;

  const cols = [
    { header: 'UK Class', val: payload.snapshots.uk },
    { header: 'USA 4.0', val: payload.snapshots.usa },
    { header: 'Canada', val: payload.snapshots.canada },
    { header: 'Australia', val: payload.snapshots.australia },
    { header: 'Ireland', val: payload.snapshots.ireland },
    { header: 'NZ 9.0', val: payload.snapshots.nz },
    { header: 'Singapore', val: payload.snapshots.singapore },
    { header: 'ECTS', val: payload.snapshots.ects },
  ];
  const colW = contentWidth / cols.length;

  doc.setFillColor(17, 24, 39);
  doc.rect(marginX, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  cols.forEach((c, idx) => {
    doc.text(c.header, marginX + idx * colW + colW / 2, y + 5.2, { align: 'center' });
  });

  y += 8;
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.rect(marginX, y, contentWidth, 10, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  cols.forEach((c, idx) => {
    if (idx > 0) {
      doc.line(marginX + idx * colW, y - 8, marginX + idx * colW, y + 10);
    }
    doc.text(c.val, marginX + idx * colW + colW / 2, y + 6.2, { align: 'center' });
  });

  y += 16;

  // 7. Disclaimer Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, 276, pageWidth - marginX, 276);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(100, 116, 139);
  const disclaimer =
    'Disclaimer: Generated via University-Tutors.com using internationally recognized linear passing-ratio and Modified Bavarian equivalence formulas for preliminary academic self-assessment. Official admission and credit transfer decisions rest with each university admissions office.';
  const discLines = doc.splitTextToSize(disclaimer, contentWidth) as string[];
  doc.text(discLines, marginX, 281);

  const slugStudent = payload.applicantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const pdfFileName = slugStudent
    ? `Academic-Equivalence-${slugStudent}.pdf`
    : `University-Tutors-Grade-Equivalence-${payload.reportId}.pdf`;

  triggerPdfDownload(doc, pdfFileName);
}

/**
 * Exports a PNG Data URL (from Canvas or SVG rasterization) into an instant A4 PDF figure sheet.
 */
export function downloadCanvasFigurePdf(options: {
  filename: string;
  title: string;
  subtitle?: string;
  pngDataUrl: string;
  imgWidthPx: number;
  imgHeightPx: number;
  landscape?: boolean;
}): void {
  const isLandscape = options.landscape ?? options.imgWidthPx > options.imgHeightPx * 1.2;
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = isLandscape ? 297 : 210;
  const pageH = isLandscape ? 210 : 297;
  const margin = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(options.title || 'Academic Figure', margin, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(249, 115, 22);
  doc.text('University-Tutors.com', pageW - margin, 15, { align: 'right' });

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, margin, 20.5);
  }

  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(margin, 23, pageW - margin, 23);

  const availW = pageW - margin * 2;
  const availH = pageH - 27 - 14;
  const scale = Math.min(availW / options.imgWidthPx, availH / options.imgHeightPx);
  const drawW = options.imgWidthPx * scale;
  const drawH = options.imgHeightPx * scale;
  const drawX = margin + (availW - drawW) / 2;
  const drawY = 26 + (availH - drawH) / 2;

  doc.addImage(options.pngDataUrl, 'PNG', drawX, drawY, drawW, drawH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Generated locally in browser via University-Tutors.com Free Student Tools',
    margin,
    pageH - 7
  );

  triggerPdfDownload(doc, options.filename);
}

/**
 * Converts a live inline <svg> DOM element into a high-DPI PNG data URL for embedding
 * directly into jsPDF reports (gels, growth curves, ocular reticles, cell schematics, etc.).
 */
export function rasterizeSvgElementToPng(
  svgEl: SVGSVGElement | null,
  scale = 2
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!svgEl || typeof window === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const viewBox = svgEl.getAttribute('viewBox');
      let vbW = 420;
      let vbH = 260;
      if (viewBox) {
        const parts = viewBox.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          vbW = parts[2];
          vbH = parts[3];
        }
      } else {
        const rect = svgEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          vbW = rect.width;
          vbH = rect.height;
        }
      }

      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', String(vbW));
      clone.setAttribute('height', String(vbH));

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);
      const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      const img = new Image();
      const timer = window.setTimeout(() => resolve(null), 1500);
      img.onload = () => {
        window.clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(vbW * scale);
          canvas.height = Math.round(vbH * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        resolve(null);
      };
      img.src = encoded;
    } catch {
      resolve(null);
    }
  });
}

export interface BiologyPdfKpi {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}

export interface BiologyPdfTable {
  title: string;
  headers: string[];
  rows: string[][];
  colWidths?: number[]; // relative weights summing to 100 or arbitrary weights
  alignRightCols?: number[];
  monospaceCols?: number[];
}

export interface BiologyPdfBar {
  label: string;
  valueText: string;
  pct: number;
  colorRgb?: [number, number, number];
}

export interface BiologyStructuredPdfPayload {
  filename: string;
  badgeText: string;
  title: string;
  subtitle: string;
  parameters: Array<{ label: string; value: string }>;
  kpis?: BiologyPdfKpi[];
  callout?: {
    title: string;
    body: string;
    tone?: 'emerald' | 'amber' | 'orange' | 'slate';
  };
  barsSection?: {
    title: string;
    bars: BiologyPdfBar[];
  };
  sequenceBlocks?: Array<{
    title: string;
    content: string;
  }>;
  tables?: BiologyPdfTable[];
  svgFigure?: {
    title: string;
    svgElement: SVGSVGElement | null;
    maxHeightMm?: number;
  };
  canvasFigure?: {
    title: string;
    pngDataUrl: string;
    imgWidthPx: number;
    imgHeightPx: number;
    maxHeightMm?: number;
  };
  workedExample?: {
    problem: string;
    steps: string[];
    answer: string;
  };
}

/**
 * Generates a richly formatted, University-Tutors logo-branded A4 PDF report for any
 * Biology calculator or simulator, supporting KPIs, tables, proportional bars,
 * monospace sequence blocks, status callouts, and rasterized inline SVG diagrams.
 */
export async function downloadBiologyStructuredPdf(
  payload: BiologyStructuredPdfPayload
): Promise<void> {
  const [logo, figurePng] = await Promise.all([
    getBrandLogoForPdf(),
    payload.svgFigure?.svgElement
      ? rasterizeSvgElementToPng(payload.svgFigure.svgElement, 2.2)
      : Promise.resolve(null),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const accentRgb: [number, number, number] = [249, 115, 22];

  const dateStamp = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const ensureSpace = (neededMm: number, currentY: number): number => {
    if (currentY + neededMm > pageHeight - 17) {
      doc.addPage();
      return 18;
    }
    return currentY;
  };

  // 1. Logo-Branded Header
  let y = drawPdfBrandHeader(doc, logo, {
    marginX,
    pageWidth,
    y: 16,
    badgeText: payload.badgeText,
    subtitleText: `university-tutors.com · Issued ${dateStamp}`,
    accentRgb,
  });

  // 2. Report Title & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(sanitizePdfText(payload.title), contentWidth) as string[];
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 6.2 + 0.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(71, 85, 105);
  const subLines = doc.splitTextToSize(sanitizePdfText(payload.subtitle), contentWidth) as string[];
  doc.text(subLines, marginX, y);
  y += subLines.length * 4.4 + 4;

  // 3. Two-Column Parameters Metadata Box
  if (payload.parameters.length > 0) {
    const colPairs = Math.ceil(payload.parameters.length / 2);
    const metaH = 7 + colPairs * 10;
    y = ensureSpace(metaH + 4, y);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, metaH, 2.5, 2.5, 'FD');

    const halfW = contentWidth / 2 - 6;
    payload.parameters.forEach((param, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = marginX + 4 + col * (contentWidth / 2);
      const py = y + 5.8 + row * 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(100, 116, 139);
      doc.text(sanitizePdfText(param.label).toUpperCase(), px, py);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      const valText = sanitizePdfText(param.value || '-');
      const clipped = (doc.splitTextToSize(valText, halfW) as string[])[0] || valText;
      doc.text(clipped, px, py + 4.3);
    });

    y += metaH + 5.5;
  }

  // 4. KPI Summary Cards (up to 4 across or wrapped in rows of 3)
  if (payload.kpis && payload.kpis.length > 0) {
    const cols = payload.kpis.length <= 2 ? 2 : payload.kpis.length === 4 ? 2 : 3;
    const rows = Math.ceil(payload.kpis.length / cols);
    const cardGap = 3.5;
    const cardW = (contentWidth - cardGap * (cols - 1)) / cols;
    const cardH = 18.5;

    y = ensureSpace(rows * (cardH + cardGap) + 4, y);

    payload.kpis.forEach((kpi, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const kx = marginX + col * (cardW + cardGap);
      const ky = y + row * (cardH + cardGap);

      if (kpi.accent) {
        doc.setFillColor(255, 247, 237);
        doc.setDrawColor(253, 186, 116);
      } else {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
      }
      doc.setLineWidth(0.35);
      doc.roundedRect(kx, ky, cardW, cardH, 2.2, 2.2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      if (kpi.accent) {
        doc.setTextColor(234, 88, 12);
      } else {
        doc.setTextColor(100, 116, 139);
      }
      const lbl = (doc.splitTextToSize(sanitizePdfText(kpi.label), cardW - 6) as string[])[0] || '';
      doc.text(lbl, kx + 3.5, ky + 5.2);

      doc.setFont('courier', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(17, 24, 39);
      const val = (doc.splitTextToSize(sanitizePdfText(kpi.value), cardW - 6) as string[])[0] || '';
      doc.text(val, kx + 3.5, ky + 11.4);

      if (kpi.sublabel) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const sub = (doc.splitTextToSize(sanitizePdfText(kpi.sublabel), cardW - 6) as string[])[0] || '';
        doc.text(sub, kx + 3.5, ky + 15.8);
      }
    });

    y += rows * (cardH + cardGap) + 3.5;
  }

  // 5. Status / Verdict / Protocol Callout Box
  if (payload.callout) {
    const bodyWrapped = doc.splitTextToSize(sanitizePdfText(payload.callout.body), contentWidth - 8) as string[];
    const boxH = 10.5 + bodyWrapped.length * 4.3;
    y = ensureSpace(boxH + 4, y);

    const tone = payload.callout.tone || 'orange';
    if (tone === 'emerald') {
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
    } else if (tone === 'amber') {
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(253, 230, 138);
    } else if (tone === 'slate') {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
    } else {
      doc.setFillColor(255, 247, 237);
      doc.setDrawColor(253, 186, 116);
    }
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, boxH, 2.2, 2.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    if (tone === 'emerald') {
      doc.setTextColor(6, 95, 70);
    } else if (tone === 'amber') {
      doc.setTextColor(146, 64, 14);
    } else if (tone === 'slate') {
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setTextColor(234, 88, 12);
    }
    doc.text(sanitizePdfText(payload.callout.title), marginX + 4, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(30, 41, 59);
    doc.text(bodyWrapped, marginX + 4, y + 10.5);

    y += boxH + 5;
  }

  // 6. Optional Rasterized SVG Figure (Agarose Gel, Growth Curve, Ocular Reticle, Cell Diagram, Beaker)
  if (payload.svgFigure && figurePng && figurePng.width > 0 && figurePng.height > 0) {
    const maxH = payload.svgFigure.maxHeightMm ?? 64;
    const aspect = figurePng.width / figurePng.height;
    let drawW = contentWidth - 8;
    let drawH = drawW / aspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspect;
    }

    y = ensureSpace(drawH + 16, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(234, 88, 12);
    doc.text(sanitizePdfText(payload.svgFigure.title).toUpperCase(), marginX, y);
    y += 3.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, drawH + 6, 2.5, 2.5, 'FD');

    const imgX = marginX + (contentWidth - drawW) / 2;
    doc.addImage(figurePng.dataUrl, 'PNG', imgX, y + 3, drawW, drawH);
    y += drawH + 11;
  }

  // 6b. Optional Rasterized WebGL / Canvas Figure (e.g. 3D VSEPR Viewport)
  if (payload.canvasFigure && payload.canvasFigure.pngDataUrl && payload.canvasFigure.imgWidthPx > 0 && payload.canvasFigure.imgHeightPx > 0) {
    const maxH = payload.canvasFigure.maxHeightMm ?? 74;
    const aspect = payload.canvasFigure.imgWidthPx / payload.canvasFigure.imgHeightPx;
    let drawW = contentWidth - 8;
    let drawH = drawW / aspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspect;
    }

    y = ensureSpace(drawH + 16, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(234, 88, 12);
    doc.text(sanitizePdfText(payload.canvasFigure.title).toUpperCase(), marginX, y);
    y += 3.5;

    doc.setFillColor(11, 17, 32);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, drawH + 6, 2.5, 2.5, 'FD');

    const imgX = marginX + (contentWidth - drawW) / 2;
    doc.addImage(payload.canvasFigure.pngDataUrl, 'PNG', imgX, y + 3, drawW, drawH);
    y += drawH + 11;
  }

  // 7. Proportional Bar Meters
  if (payload.barsSection && payload.barsSection.bars.length > 0) {
    const barH = 10.5;
    const barGap = 2.2;
    y = ensureSpace(10 + payload.barsSection.bars.length * (barH + barGap), y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(234, 88, 12);
    doc.text(sanitizePdfText(payload.barsSection.title).toUpperCase(), marginX, y);
    y += 4;

    payload.barsSection.bars.forEach((bar) => {
      y = ensureSpace(barH + barGap + 2, y);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, y, contentWidth, barH, 1.8, 1.8, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const lbl = sanitizePdfText(bar.label);
      const clipped = (doc.splitTextToSize(lbl, contentWidth - 46) as string[])[0] || lbl;
      doc.text(clipped, marginX + 3.5, y + 4.8);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(sanitizePdfText(bar.valueText), pageWidth - marginX - 3.5, y + 4.8, {
        align: 'right',
      });

      const trackX = marginX + 3.5;
      const trackW = contentWidth - 7;
      const trackY = y + 6.9;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(trackX, trackY, trackW, 2.0, 1, 1, 'F');

      const clampedPct = Math.max(0, Math.min(100, bar.pct));
      const fillW = (trackW * clampedPct) / 100;
      if (fillW > 0.6) {
        const [r, g, b] = bar.colorRgb || [249, 115, 22];
        doc.setFillColor(r, g, b);
        doc.roundedRect(trackX, trackY, fillW, 2.0, 1, 1, 'F');
      }

      y += barH + barGap;
    });

    y += 3.5;
  }

  // 8. Monospace Sequence Blocks
  if (payload.sequenceBlocks && payload.sequenceBlocks.length > 0) {
    for (const block of payload.sequenceBlocks) {
      const cleanContent = sanitizePdfText(block.content || '-');
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(cleanContent, contentWidth - 8) as string[];
      const maxShown = lines.slice(0, 14);
      if (lines.length > 14) {
        maxShown.push(`... (${lines.length - 14} more lines)`);
      }
      const boxH = 7 + maxShown.length * 4.1;
      y = ensureSpace(boxH + 8, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(234, 88, 12);
      doc.text(sanitizePdfText(block.title).toUpperCase(), marginX, y);
      y += 3.5;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, y, contentWidth, boxH, 2, 2, 'FD');

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(maxShown, marginX + 4, y + 5.5);

      y += boxH + 5;
    }
  }

  // 9. Crisp Bordered Tables
  if (payload.tables && payload.tables.length > 0) {
    for (const table of payload.tables) {
      if (table.headers.length === 0) continue;
      y = ensureSpace(24, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(234, 88, 12);
      doc.text(sanitizePdfText(table.title).toUpperCase(), marginX, y);
      y += 3.5;

      const weights =
        table.colWidths && table.colWidths.length === table.headers.length
          ? table.colWidths
          : table.headers.map(() => 1);
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      const colWs = weights.map((w) => (w / totalWeight) * contentWidth);

      const drawTableHeader = (headerY: number) => {
        doc.setFillColor(17, 24, 39);
        doc.rect(marginX, headerY, contentWidth, 7.6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        doc.setTextColor(255, 255, 255);

        let cx = marginX;
        table.headers.forEach((h, idx) => {
          const isRight = table.alignRightCols?.includes(idx);
          const textX = isRight ? cx + colWs[idx] - 2.5 : cx + 2.5;
          const cleanH = sanitizePdfText(h);
          const clipped = (doc.splitTextToSize(cleanH, colWs[idx] - 4) as string[])[0] || cleanH;
          doc.text(clipped, textX, headerY + 5.0, { align: isRight ? 'right' : 'left' });
          cx += colWs[idx];
        });
        return headerY + 7.6;
      };

      y = drawTableHeader(y);

      for (let rIdx = 0; rIdx < table.rows.length; rIdx++) {
        const row = table.rows[rIdx];
        const cellWrapped = row.map((cell, cIdx) => {
          doc.setFont(table.monospaceCols?.includes(cIdx) ? 'courier' : 'helvetica', 'normal');
          doc.setFontSize(8.2);
          return doc.splitTextToSize(sanitizePdfText(cell ?? ''), colWs[cIdx] - 5) as string[];
        });
        const maxLines = Math.max(1, ...cellWrapped.map((l) => l.length));
        const rowH = Math.max(6.8, maxLines * 4.0 + 2.8);

        if (y + rowH > pageHeight - 17) {
          doc.addPage();
          y = drawTableHeader(18);
        }

        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(marginX, y, contentWidth, rowH, 'FD');

        let cx = marginX;
        row.forEach((_, cIdx) => {
          const isRight = table.alignRightCols?.includes(cIdx);
          const isMono = table.monospaceCols?.includes(cIdx);
          doc.setFont(isMono ? 'courier' : 'helvetica', cIdx === 0 ? 'bold' : 'normal');
          doc.setFontSize(8.2);
          doc.setTextColor(17, 24, 39);
          const textX = isRight ? cx + colWs[cIdx] - 2.5 : cx + 2.5;
          cellWrapped[cIdx].forEach((line, lIdx) => {
            doc.text(line, textX, y + 4.5 + lIdx * 4.0, { align: isRight ? 'right' : 'left' });
          });
          cx += colWs[cIdx];
        });

        y += rowH;
      }

      y += 6;
    }
  }

  // 10. Worked Lab & Exam Reference Walkthrough
  if (payload.workedExample) {
    y = ensureSpace(30, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(234, 88, 12);
    doc.text('WORKED LAB & EXAM REFERENCE WALKTHROUGH', marginX, y);
    y += 2.5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(17, 24, 39);
    const probLines = doc.splitTextToSize(
      `Problem: ${sanitizePdfText(payload.workedExample.problem)}`,
      contentWidth
    ) as string[];
    for (const pl of probLines) {
      y = ensureSpace(5, y);
      doc.text(pl, marginX, y);
      y += 4.4;
    }
    y += 1.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    payload.workedExample.steps.forEach((step, idx) => {
      const sLines = doc.splitTextToSize(
        `Step ${idx + 1}: ${sanitizePdfText(step)}`,
        contentWidth
      ) as string[];
      for (const sl of sLines) {
        y = ensureSpace(5, y);
        doc.text(sl, marginX, y);
        y += 4.4;
      }
      y += 0.8;
    });

    y = ensureSpace(8, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(234, 88, 12);
    const ansLines = doc.splitTextToSize(
      `Verified Result: ${sanitizePdfText(payload.workedExample.answer)}`,
      contentWidth
    ) as string[];
    for (const al of ansLines) {
      y = ensureSpace(5, y);
      doc.text(al, marginX, y);
      y += 4.4;
    }
  }

  // 11. Page Footer on Every Page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated via University-Tutors.com · ${sanitizePdfText(payload.title)} · ${dateStamp}`,
      marginX,
      pageHeight - 8.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, {
      align: 'right',
    });
  }

  triggerPdfDownload(doc, payload.filename);
}

export type ChemistryStructuredPdfPayload = BiologyStructuredPdfPayload;
export const downloadChemistryStructuredPdf = downloadBiologyStructuredPdf;

export interface MathSolutionPdfPayload {
  filename: string;
  title: string;
  levelName: string;
  tutorDomain: string;
  formulaBadge: string;
  modeLabel?: string;
  parameters: Array<{ label: string; value: string }>;
  solutionLines: string[];
  plotSvg?: SVGSVGElement | null;
  workedExample?: {
    problem: string;
    steps: string[];
    answer: string;
  };
}

/**
 * Generates a formatted, University-Tutors logo-branded A4 PDF solution sheet
 * for any of the 27 interactive math tools, including active parameters, structured
 * derivation lines, rasterized SVG graphs/plots, and the reference worked exam example.
 */
export async function downloadMathSolutionPdf(payload: MathSolutionPdfPayload): Promise<void> {
  const cleanLines = payload.solutionLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const summaryKpis: BiologyPdfKpi[] = cleanLines.slice(0, 3).map((line, idx) => {
    const colonIdx = line.indexOf(':');
    const eqIdx = line.indexOf('=');
    let label = `Computed Step ${idx + 1}`;
    let value = line;
    if (colonIdx > 0 && colonIdx < 32) {
      label = line.slice(0, colonIdx).trim();
      value = line.slice(colonIdx + 1).trim();
    } else if (eqIdx > 0 && eqIdx < 24) {
      label = line.slice(0, eqIdx).trim();
      value = line.slice(eqIdx + 1).trim();
    }
    return {
      label,
      value: value || line,
      accent: idx === 0,
    };
  });

  await downloadBiologyStructuredPdf({
    filename: payload.filename,
    badgeText: `${payload.levelName.toUpperCase()} · MATH SOLUTION`,
    title: payload.title,
    subtitle: `${payload.tutorDomain} · Core Formula: ${payload.formulaBadge}${
      payload.modeLabel ? ` · Mode: ${payload.modeLabel}` : ''
    }`,
    parameters:
      payload.parameters.length > 0
        ? payload.parameters
        : [
            { label: 'Academic Level', value: payload.levelName },
            { label: 'Governing Formula', value: payload.formulaBadge },
          ],
    kpis: summaryKpis,
    sequenceBlocks:
      cleanLines.length > 0
        ? [
            {
              title: 'Live Computed Results & Derivation Steps',
              content: cleanLines.join('\n'),
            },
          ]
        : undefined,
    svgFigure: payload.plotSvg
      ? {
          title: 'Interactive Mathematical Graph & Visual Plot',
          svgElement: payload.plotSvg,
          maxHeightMm: 78,
        }
      : undefined,
    workedExample: payload.workedExample,
  });
}


