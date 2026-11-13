import { jsPDF } from 'jspdf';
import {
  CvCustomSection,
  CvDocumentData,
  CvSectionKey,
  isBuiltInSectionKey,
  normalizeHexColor,
} from './defaultCvData';
import { hexToRgbTuple, triggerPdfDownload } from '../../../utils/pdfReportGenerator';

interface RichSpan {
  text: string;
  bold: boolean;
}

function parseRichSpans(input: string): RichSpan[] {
  if (!input) return [];
  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  const spans: RichSpan[] = [];
  for (const seg of parts) {
    if (!seg) continue;
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      spans.push({ text: seg.slice(2, -2), bold: true });
    } else {
      spans.push({ text: seg, bold: false });
    }
  }
  return spans;
}

function splitBullets(multiline: string): string[] {
  return multiline
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}

/**
 * Generates an ATS-selectable, multi-page A4 vector PDF directly in the browser
 * with exact Europass / custom accent colors, inline **bold** spans, optional photo,
 * and dynamic custom sections—triggering an immediate .pdf file download.
 */
export function generateCvPdf(data: CvDocumentData): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 15;
  const marginBottom = 15;
  const contentWidth = pageWidth - marginX * 2;

  const accentHex = normalizeHexColor(data.accentColor, '#0E4194');
  const [ar, ag, ab] = hexToRgbTuple(accentHex);
  // Subtle tinted divider color blended 45% accent + 55% white
  const divR = Math.round(ar * 0.45 + 255 * 0.55);
  const divG = Math.round(ag * 0.45 + 255 * 0.55);
  const divB = Math.round(ab * 0.45 + 255 * 0.55);

  let y = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  /**
   * Word-wraps inline bold/normal spans across multiple lines at exact X/Y coordinates.
   */
  const drawRichParagraph = (
    rawText: string,
    startX: number,
    maxWidth: number,
    fontSizePt: number,
    lineHeightMm: number,
    baseColor: [number, number, number] = [30, 41, 59]
  ) => {
    const spans = parseRichSpans(rawText.replace(/\s+/g, ' ').trim());
    if (spans.length === 0) return;

    interface WordToken {
      word: string;
      bold: boolean;
      trailingSpace: boolean;
    }

    const tokens: WordToken[] = [];
    for (const sp of spans) {
      const chunks = sp.text.split(/(\s+)/);
      for (let i = 0; i < chunks.length; i++) {
        const ch = chunks[i];
        if (!ch || /^\s+$/.test(ch)) continue;
        const hasSpaceAfter = i + 1 < chunks.length && /^\s+$/.test(chunks[i + 1]);
        tokens.push({ word: ch, bold: sp.bold, trailingSpace: hasSpaceAfter });
      }
    }
    if (tokens.length === 0) return;

    doc.setFontSize(fontSizePt);

    let lineTokens: WordToken[] = [];
    let currentLineW = 0;

    const flushLine = () => {
      if (lineTokens.length === 0) return;
      ensureSpace(lineHeightMm + 0.5);
      let cursorX = startX;
      lineTokens.forEach((tok, idx) => {
        doc.setFont('helvetica', tok.bold ? 'bold' : 'normal');
        if (tok.bold) {
          doc.setTextColor(17, 24, 39);
        } else {
          doc.setTextColor(baseColor[0], baseColor[1], baseColor[2]);
        }
        const suffix = tok.trailingSpace && idx < lineTokens.length - 1 ? ' ' : '';
        const piece = tok.word + suffix;
        doc.text(piece, cursorX, y);
        cursorX += doc.getTextWidth(piece);
      });
      y += lineHeightMm;
      lineTokens = [];
      currentLineW = 0;
    };

    tokens.forEach((tok) => {
      doc.setFont('helvetica', tok.bold ? 'bold' : 'normal');
      const wordW = doc.getTextWidth(tok.word);
      const spaceW = tok.trailingSpace ? doc.getTextWidth(' ') : 0;

      if (lineTokens.length > 0 && currentLineW + wordW > maxWidth) {
        flushLine();
      }
      lineTokens.push(tok);
      currentLineW += wordW + spaceW;
    });

    flushLine();
  };

  const drawBulletItem = (text: string) => {
    ensureSpace(5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(ar, ag, ab);
    doc.text('•', marginX + 1.2, y);
    drawRichParagraph(text, marginX + 4.8, contentWidth - 4.8, 9.3, 4.3, [30, 41, 59]);
    y += 0.5;
  };

  const drawSectionHeading = (title: string) => {
    ensureSpace(11);
    y += 1.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(ar, ag, ab);
    doc.text(title.toUpperCase(), marginX, y);
    y += 1.6;
    doc.setDrawColor(divR, divG, divB);
    doc.setLineWidth(0.35);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 4.4;
  };

  const drawTwoColTitleRow = (
    leftPrimary: string,
    leftSecondary: string,
    rightMeta: string
  ) => {
    ensureSpace(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.6);
    const metaStr = rightMeta.trim();
    const metaW = metaStr ? doc.getTextWidth(metaStr) + 4 : 0;

    if (metaStr) {
      doc.setTextColor(71, 85, 105);
      doc.text(metaStr, pageWidth - marginX, y, { align: 'right' });
    }

    const leftMaxW = contentWidth - metaW;
    const combinedLeft = leftSecondary.trim()
      ? `${leftPrimary.trim()} — ${leftSecondary.trim()}`
      : leftPrimary.trim();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    const wrappedLeft = doc.splitTextToSize(combinedLeft, leftMaxW) as string[];
    wrappedLeft.forEach((ln, idx) => {
      if (idx > 0) ensureSpace(4.5);
      doc.text(ln, marginX, y);
      y += 4.4;
    });
  };

  // =========================================================================
  // 1. PERSONAL HEADER + OPTIONAL PHOTO
  // =========================================================================
  const hasPhoto = Boolean(data.personal.showPhoto && data.personal.photoDataUrl);
  const photoSizeMm = 21;
  const headerTextMaxW = hasPhoto ? contentWidth - photoSizeMm - 6 : contentWidth;
  const headerStartY = y;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(17, 24, 39);
  const fullNameText = data.personal.fullName.trim() || 'Your Full Name';
  const nameLines = doc.splitTextToSize(fullNameText, headerTextMaxW) as string[];
  doc.text(nameLines, marginX, y + 4.5);
  y += nameLines.length * 6.8 + 1;

  if (data.personal.headline.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.2);
    doc.setTextColor(ar, ag, ab);
    const headLines = doc.splitTextToSize(
      data.personal.headline.trim(),
      headerTextMaxW
    ) as string[];
    doc.text(headLines, marginX, y + 1);
    y += headLines.length * 4.5 + 1.5;
  }

  const contactItems = [
    data.personal.email.trim(),
    data.personal.phone.trim(),
    data.personal.location.trim(),
    data.personal.linkedinUrl.trim().replace(/^https?:\/\//, ''),
    data.personal.portfolioUrl.trim().replace(/^https?:\/\//, ''),
  ].filter(Boolean);

  if (contactItems.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(71, 85, 105);
    const contactJoined = contactItems.join('  |  ');
    const contactLines = doc.splitTextToSize(contactJoined, headerTextMaxW) as string[];
    doc.text(contactLines, marginX, y + 1);
    y += contactLines.length * 4.1 + 1;
  }

  if (hasPhoto) {
    try {
      const mimeMatch = data.personal.photoDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);/i);
      const format =
        mimeMatch && mimeMatch[1].toLowerCase() === 'png' ? 'PNG' : 'JPEG';
      doc.addImage(
        data.personal.photoDataUrl,
        format,
        pageWidth - marginX - photoSizeMm,
        headerStartY - 1,
        photoSizeMm,
        photoSizeMm
      );
      y = Math.max(y, headerStartY + photoSizeMm + 1);
    } catch {
      // Ignore malformed image data URLs cleanly
    }
  }

  y += 2;
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.65);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 4;

  // =========================================================================
  // 2. ORDERED SECTIONS (BUILT-IN + DYNAMIC CUSTOM SECTIONS)
  // =========================================================================
  const validEducation = data.education.filter(
    (e) => e.institution.trim() || e.degree.trim()
  );
  const validExperience = data.experience.filter(
    (ex) => ex.role.trim() || ex.company.trim() || splitBullets(ex.achievements).length > 0
  );
  const validProjects = data.projects.filter(
    (p) => p.title.trim() || splitBullets(p.outcomes).length > 0
  );
  const validSkillGroups = data.skillGroups.filter(
    (g) => g.category.trim() && g.skills.length > 0
  );
  const validCertifications = data.certifications.filter((c) => c.name.trim());
  const validLanguages = data.languages.filter((l) => l.language.trim());

  const customMap = new Map<string, CvCustomSection>(
    (data.customSections || []).map((sec) => [sec.id, sec])
  );

  const renderCustomSectionPdf = (sec: CvCustomSection) => {
    const title = sec.title.trim() || 'Additional Information';
    if (sec.mode === 'bullets') {
      const items = sec.bullets.map((b) => b.trim()).filter(Boolean);
      if (items.length === 0) return;
      drawSectionHeading(title);
      items.forEach((b) => drawBulletItem(b));
      y += 1.5;
      return;
    }

    const entries = sec.entries.filter(
      (ent) =>
        ent.title.trim() ||
        ent.subtitle.trim() ||
        ent.description.trim()
    );
    if (entries.length === 0) return;

    drawSectionHeading(title);
    entries.forEach((ent, idx) => {
      ensureSpace(9);
      if (ent.title.trim() || ent.subtitle.trim() || ent.meta.trim()) {
        drawTwoColTitleRow(
          ent.title.trim() || ent.subtitle.trim(),
          ent.title.trim() ? ent.subtitle.trim() : '',
          ent.meta.trim()
        );
      }
      const descLines = splitBullets(ent.description);
      if (descLines.length > 1) {
        descLines.forEach((b) => drawBulletItem(b));
      } else if (descLines.length === 1) {
        drawRichParagraph(descLines[0], marginX, contentWidth, 9.2, 4.3, [51, 65, 85]);
      }
      if (idx < entries.length - 1) y += 2;
    });
    y += 1.5;
  };

  for (const sectionKey of data.sectionOrder as CvSectionKey[]) {
    if (!isBuiltInSectionKey(sectionKey)) {
      const customSec = customMap.get(sectionKey);
      if (customSec) renderCustomSectionPdf(customSec);
      continue;
    }

    switch (sectionKey) {
      case 'summary': {
        if (!data.summary.trim()) break;
        drawSectionHeading('Academic & Career Profile');
        drawRichParagraph(data.summary.trim(), marginX, contentWidth, 9.4, 4.5, [30, 41, 59]);
        y += 1.8;
        break;
      }

      case 'education': {
        if (validEducation.length === 0) break;
        drawSectionHeading('Education');
        validEducation.forEach((edu, idx) => {
          ensureSpace(10);
          const dateLabel = [edu.startDate.trim(), edu.endDate.trim()]
            .filter(Boolean)
            .join(' – ');
          drawTwoColTitleRow(edu.institution || 'University Name', '', dateLabel);

          const degreeWithGpa = [edu.degree.trim(), edu.cgpa.trim()]
            .filter(Boolean)
            .join(' · ');
          if (degreeWithGpa || edu.location.trim()) {
            ensureSpace(5);
            if (edu.location.trim()) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.8);
              doc.setTextColor(100, 116, 139);
              doc.text(edu.location.trim(), pageWidth - marginX, y, { align: 'right' });
            }
            if (degreeWithGpa) {
              const locW = edu.location.trim() ? doc.getTextWidth(edu.location.trim()) + 5 : 0;
              drawRichParagraph(
                degreeWithGpa,
                marginX,
                contentWidth - locW,
                9.3,
                4.3,
                [30, 41, 59]
              );
            } else {
              y += 4.3;
            }
          }
          if (idx < validEducation.length - 1) y += 1.8;
        });
        y += 1.5;
        break;
      }

      case 'experience': {
        if (validExperience.length === 0) break;
        drawSectionHeading('Work Experience & Internships');
        validExperience.forEach((exp, idx) => {
          ensureSpace(11);
          drawTwoColTitleRow(exp.role, exp.company, exp.dateRange);
          if (exp.location.trim()) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.6);
            doc.setTextColor(100, 116, 139);
            doc.text(exp.location.trim(), marginX, y);
            y += 4.1;
          }
          const bullets = splitBullets(exp.achievements);
          bullets.forEach((b) => drawBulletItem(b));
          if (idx < validExperience.length - 1) y += 2.2;
        });
        y += 1.5;
        break;
      }

      case 'projects': {
        if (validProjects.length === 0) break;
        drawSectionHeading('Academic & Research Projects');
        validProjects.forEach((proj, idx) => {
          ensureSpace(10);
          const cleanLink = proj.link.trim().replace(/^https?:\/\//, '');
          drawTwoColTitleRow(proj.title, cleanLink, proj.date);
          if (proj.techStack.trim()) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.7);
            doc.setTextColor(ar, ag, ab);
            const stackLines = doc.splitTextToSize(proj.techStack.trim(), contentWidth) as string[];
            doc.text(stackLines, marginX, y);
            y += stackLines.length * 4.1;
          }
          const bullets = splitBullets(proj.outcomes);
          bullets.forEach((b) => drawBulletItem(b));
          if (idx < validProjects.length - 1) y += 2;
        });
        y += 1.5;
        break;
      }

      case 'skills': {
        if (validSkillGroups.length === 0) break;
        drawSectionHeading('Skills & Core Competencies');
        validSkillGroups.forEach((grp) => {
          ensureSpace(5.5);
          drawRichParagraph(
            `**${grp.category.trim()}:** ${grp.skills.join(', ')}`,
            marginX,
            contentWidth,
            9.3,
            4.5,
            [30, 41, 59]
          );
          y += 0.5;
        });
        y += 1.5;
        break;
      }

      case 'certifications': {
        if (validCertifications.length === 0) break;
        drawSectionHeading('Certifications, Awards & Test Scores');
        validCertifications.forEach((cert) => {
          ensureSpace(5.5);
          drawTwoColTitleRow(cert.name, cert.issuer, cert.year);
          y += 0.5;
        });
        y += 1.5;
        break;
      }

      case 'languages': {
        if (validLanguages.length === 0) break;
        drawSectionHeading('Languages');
        const langLine = validLanguages
          .map((l) => `**${l.language.trim()}** (${l.proficiency})`)
          .join('   ·   ');
        drawRichParagraph(langLine, marginX, contentWidth, 9.3, 4.5, [30, 41, 59]);
        y += 1.5;
        break;
      }
    }
  }

  const slugName = (data.personal.fullName || 'student-cv')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = slugName ? `${slugName}-cv.pdf` : 'student-ats-cv.pdf';
  triggerPdfDownload(doc, filename);
  return filename;
}
