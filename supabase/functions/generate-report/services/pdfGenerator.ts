
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'https://esm.sh/pdf-lib@1.17.1';
import { hexToRGB } from '../utils/colors.ts';
import { ReportTemplate, ReportData } from '../types.ts';

function drawExecutiveSummary(
  page: PDFPage,
  summary: any,
  options: { x: number; y: number; width: number; font: PDFFont; titleFont: PDFFont }
): number {
  const { x, y, width, font, titleFont } = options;
  let currentY = y;
  
  // Draw section title
  page.drawText('Executive Summary', {
    x,
    y: currentY,
    size: 24,
    font: titleFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  currentY -= 40;

  // Draw key insights
  page.drawText('Key Insights:', {
    x,
    y: currentY,
    size: 16,
    font: titleFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  currentY -= 25;

  summary.key_insights.forEach((insight: string) => {
    page.drawText(`• ${insight}`, {
      x: x + 20,
      y: currentY,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 20;
  });
  currentY -= 10;

  // Draw performance highlights
  page.drawText('Performance Highlights:', {
    x,
    y: currentY,
    size: 16,
    font: titleFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  currentY -= 25;

  // Split text into lines if too long
  const words = summary.performance_highlights.split(' ');
  let line = '';
  words.forEach((word: string) => {
    if ((line + word).length > 80) {
      page.drawText(line, {
        x: x + 20,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= 20;
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  });
  if (line) {
    page.drawText(line, {
      x: x + 20,
      y: currentY,
      size: 12,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 30;
  }

  return currentY;
}

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

  page.drawText('ESG Metrics Overview', {
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
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Create first page for executive summary
  const firstPage = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
  const { width, height } = firstPage.getSize();
  
  // Use template colors or fallback to defaults
  const colors = template.theme_colors.length > 0 ? template.theme_colors : 
    ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF'];

  // Add header with gradient background
  firstPage.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: rgb(0.61, 0.53, 0.96),
  });

  // Add title and date
  firstPage.drawText('ESG Sustainability Metrics Report', {
    x: 50,
    y: height - 60,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  firstPage.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 90,
    size: 14,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Draw executive summary if available
  let currentY = height - 150;
  if (reportData.executive_summary) {
    currentY = drawExecutiveSummary(firstPage, reportData.executive_summary, {
      x: 50,
      y: currentY,
      width: width - 100,
      font: helveticaFont,
      titleFont: helveticaBold,
    });
  }

  // Create new page for metrics and charts
  const metricsPage = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
  currentY = height - 100;

  // Draw metrics section with colorful boxes
  Object.entries(reportData.metrics).forEach(([key, value], index) => {
    const label = key.replace(/_/g, ' ').toUpperCase();
    const boxColor = colors[index % colors.length];
    const [r, g, b] = hexToRGB(boxColor);
    
    metricsPage.drawRectangle({
      x: 50,
      y: currentY - 40,
      width: 200,
      height: 60,
      color: rgb(r/255, g/255, b/255),
      opacity: 0.1,
    });

    metricsPage.drawText(`${value}`, {
      x: 60,
      y: currentY - 10,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    metricsPage.drawText(label, {
      x: 60,
      y: currentY - 30,
      size: 12,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    currentY -= 80;
  });

  // Draw sustainability section if available
  if (reportData.sustainability) {
    const sustainabilityPage = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
    currentY = height - 100;

    sustainabilityPage.drawText('SUSTAINABILITY INSIGHTS', {
      x: 50,
      y: currentY,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    currentY -= 50;
    
    // Draw key achievements
    sustainabilityPage.drawText('Key Achievements:', {
      x: 50,
      y: currentY,
      size: 18,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    currentY -= 30;
    reportData.sustainability.key_achievements.forEach((achievement) => {
      sustainabilityPage.drawText(`• ${achievement}`, {
        x: 70,
        y: currentY,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;
    });

    currentY -= 30;

    // Draw recommendations
    sustainabilityPage.drawText('Recommendations:', {
      x: 50,
      y: currentY,
      size: 18,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 30;
    reportData.sustainability.recommendations.forEach((recommendation) => {
      sustainabilityPage.drawText(`• ${recommendation}`, {
        x: 70,
        y: currentY,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;
    });
  }

  // Draw table if available on a new page
  if (reportData.tables) {
    const tablePage = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
    currentY = height - 100;
    
    currentY = drawTable(tablePage, reportData.tables.monthlyMetrics, {
      x: 50,
      y: currentY,
      width: width - 100,
      font: helveticaFont,
      colors,
    });
  }

  return await pdfDoc.save();
}
