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
export function downloadAcademicReportPdf(options: AcademicReportPdfOptions): void {
  const {
    filename,
    title,
    subtitle,
    badgeText,
    metadataRows = [],
    sections,
    accentHex = '#F97316',
  } = options;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const [ar, ag, ab] = hexToRgbTuple(accentHex);

  let y = 16;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Top Brand Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('University-Tutors.com', marginX, y);

  if (badgeText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(ar, ag, ab);
    doc.text(badgeText, pageWidth - marginX, y, { align: 'right' });
  }

  y += 4;
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.7);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(title, contentWidth) as string[];
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 6.5 + 1;

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const subLines = doc.splitTextToSize(subtitle, contentWidth) as string[];
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
      const labelStr = `${row.label}: `;
      doc.text(labelStr, marginX + 4, metaY);
      const labelW = doc.getTextWidth(labelStr);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      const cleanVal = String(row.value || '—').replace(/\s+/g, ' ');
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
    doc.text(section.heading.toUpperCase(), marginX, y);
    y += 2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 5;

    doc.setFont(section.monospace ? 'courier' : 'helvetica', 'normal');
    doc.setFontSize(section.monospace ? 9 : 9.8);
    doc.setTextColor(30, 41, 59);

    for (const rawLine of validLines) {
      if (rawLine.trim() === '') {
        y += 2.5;
        continue;
      }
      const wrapped = doc.splitTextToSize(rawLine, contentWidth) as string[];
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
  const dateStamp = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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
