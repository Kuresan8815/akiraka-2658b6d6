
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'https://esm.sh/pdf-lib@1.17.1';
import { hexToRGB } from '../utils/colors.ts';
import { ReportTemplate, ReportData } from '../types.ts';

function drawTable(
  page: PDFPage,
  table: { headers: string[]; rows: string[][] },
  options: { x: number; y: number; width: number; font: PDFFont; colors: string[] }
): number {
  const { x, y, width, font, colors } = options;
  let currentY = y;
  const rowHeight = 30;
  const columnWidth = width / table.headers.length;

  // Draw table title with background
  page.drawRectangle({
    x,
    y: currentY,
    width,
    height: rowHeight,
    color: rgb(0.61, 0.53, 0.96),
  });

  page.drawText('Monthly Metrics', {
    x: x + 10,
    y: currentY + 10,
    size: 14,
    font,
    color: rgb(1, 1, 1),
  });
  currentY -= rowHeight;

  // Draw headers with background
  page.drawRectangle({
    x,
    y: currentY,
    width,
    height: rowHeight,
    color: rgb(0.95, 0.95, 0.95),
  });

  table.headers.forEach((header, index) => {
    page.drawText(header, {
      x: x + (columnWidth * index) + 10,
      y: currentY + 10,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  });

  // Draw rows with alternating backgrounds
  table.rows.forEach((row, rowIndex) => {
    currentY -= rowHeight;
    
    // Draw row background
    page.drawRectangle({
      x,
      y: currentY,
      width,
      height: rowHeight,
      color: rowIndex % 2 === 0 ? rgb(1, 1, 1) : rgb(0.98, 0.98, 0.98),
    });

    row.forEach((cell, cellIndex) => {
      page.drawText(cell, {
        x: x + (columnWidth * cellIndex) + 10,
        y: currentY + 10,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });
  });

  return currentY;
}

export async function createPDFDocument(template: ReportTemplate, reportData: ReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
  const { width, height } = page.getSize();
  
  // Use template colors or fallback to defaults
  const colors = template.theme_colors.length > 0 ? template.theme_colors : 
    ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF'];

  // Add header with gradient background
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.61, 0.53, 0.96),
  });

  // Add title and date with better styling
  page.drawText(template.name, {
    x: 50,
    y: height - 60,
    size: 28,
    font: helveticaFont,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 90,
    size: 14,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Draw metrics section with colorful boxes
  let yPosition = height - 150;
  Object.entries(reportData.metrics).forEach(([key, value], index) => {
    const label = key.replace(/_/g, ' ').toUpperCase();
    const boxColor = colors[index % colors.length];
    const [r, g, b] = hexToRGB(boxColor);
    
    // Draw metric box
    page.drawRectangle({
      x: 50,
      y: yPosition - 40,
      width: 200,
      height: 60,
      color: rgb(r/255, g/255, b/255),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      opacity: 0.1,
    });

    // Draw metric value
    page.drawText(`${value}`, {
      x: 60,
      y: yPosition - 10,
      size: 24,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Draw metric label
    page.drawText(label, {
      x: 60,
      y: yPosition - 30,
      size: 12,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 80;
  });

  // Draw sustainability section if available
  if (reportData.sustainability) {
    yPosition -= 20;
    page.drawText('SUSTAINABILITY INSIGHTS', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;
    reportData.sustainability.recommendations.forEach((recommendation) => {
      page.drawText(`• ${recommendation}`, {
        x: 60,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });
  }

  // Draw table if available
  if (reportData.tables) {
    yPosition = drawTable(page, reportData.tables.monthlyMetrics, {
      x: 50,
      y: yPosition - 40,
      width: width - 100,
      font: helveticaFont,
      colors,
    });
  }

  return await pdfDoc.save();
}

