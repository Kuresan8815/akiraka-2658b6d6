
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
  
  // Calculate actual page count based on sections
  const sections = template.config.sections || [];
  const pageCount = sections.length + 1; // +1 for cover page
  
  // Create cover page
  const coverPage = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width: coverWidth, height: coverHeight } = coverPage.getSize();
  
  // Draw cover page
  coverPage.drawText(template.name, {
    x: 50,
    y: coverHeight - 100,
    size: 32,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  if (template.description) {
    coverPage.drawText(template.description, {
      x: 50,
      y: coverHeight - 150,
      size: 16,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Generate a page for each section
  for (const section of sections) {
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();
    let currentY = height - 50;

    // Draw section title
    page.drawText(section.title, {
      x: 50,
      y: currentY,
      size: 24,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    currentY -= 60;

    // Draw section content
    const contentLines = section.content.split('\n');
    for (const line of contentLines) {
      if (currentY < 50) {
        // Add new page if content exceeds current page
        const newPage = pdfDoc.addPage([842, 595]);
        currentY = height - 50;
      }
      
      page.drawText(line, {
        x: 50,
        y: currentY,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    }

    // Add visualizations if specified
    if (section.visualizations?.includes('table') && reportData.tables) {
      currentY = drawTable(page, reportData.tables.monthlyMetrics, {
        x: 50,
        y: currentY - 40,
        width: width - 100,
        font: helveticaFont,
        colors: section.colors || template.theme_colors,
      });
    }
  }

  return await pdfDoc.save();
}
