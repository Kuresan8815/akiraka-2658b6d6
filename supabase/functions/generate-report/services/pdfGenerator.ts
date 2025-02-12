
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';
import { drawExecutiveSummary } from './pdf/executiveSummaryService.ts';
import { drawTable } from './pdf/tableService.ts';
import { drawReportHeader } from './pdf/headerService.ts';
import { hexToRGB } from './pdf/utils.ts';
import { ReportTemplate, ReportData } from '../types.ts';

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

  let currentY = drawReportHeader(firstPage, height, helveticaFont, helveticaBold);

  // Draw executive summary if available
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
