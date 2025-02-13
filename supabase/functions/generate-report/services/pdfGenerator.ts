
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
  
  // Create first page with a landscape orientation for better chart visibility
  const page = pdfDoc.addPage([842, 595]); // A4 Landscape
  const { width, height } = page.getSize();
  
  // Define a more professional color palette based on the example
  const colors = {
    humanCapacity: '#7E69AB',    // Muted blue
    wellbeing: '#D3E4FD',        // Light blue
    community: '#FDE1D3',        // Soft peach
    diversity: '#ea384c',        // Dark red
    ethical: '#4A4A8F',          // Dark blue
    transparency: '#E5DEFF',     // Soft purple
    sustainable: '#F2FCE2'       // Soft green
  };

  let currentY = height - 50;

  // Draw title
  page.drawText('Sustainability Metrics Report', {
    x: 50,
    y: currentY,
    size: 24,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 80;

  // Draw social metrics section
  page.drawText('Social Sustainability Metrics Over Time', {
    x: 50,
    y: currentY,
    size: 18,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentY -= 40;

  // Draw metrics grid in a more compact format
  const metrics = Object.entries(reportData.metrics);
  const metricsPerRow = 2;
  const boxWidth = (width - 100) / metricsPerRow;
  const boxHeight = 80;

  for (let i = 0; i < metrics.length; i += metricsPerRow) {
    const row = metrics.slice(i, i + metricsPerRow);
    row.forEach((metric, index) => {
      const [key, value] = metric;
      const x = 50 + (index * boxWidth);
      const [r, g, b] = hexToRGB(colors.humanCapacity);

      // Draw metric box with subtle background
      page.drawRectangle({
        x,
        y: currentY - boxHeight,
        width: boxWidth - 20,
        height: boxHeight,
        color: rgb(r/255, g/255, b/255),
        opacity: 0.1,
      });

      // Draw metric value
      page.drawText(`${value}`, {
        x: x + 20,
        y: currentY - 30,
        size: 24,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Draw metric label
      page.drawText(key.replace(/_/g, ' ').toUpperCase(), {
        x: x + 20,
        y: currentY - 60,
        size: 12,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    });
    currentY -= boxHeight + 20;
  }

  // Draw sustainability section if available
  if (reportData.sustainability) {
    currentY -= 40;

    page.drawText('Governance & Sustainability Insights', {
      x: 50,
      y: currentY,
      size: 18,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    currentY -= 30;

    // Draw key achievements in a compact list
    reportData.sustainability.key_achievements.forEach((achievement) => {
      const [r, g, b] = hexToRGB(colors.ethical);
      
      page.drawCircle({
        x: 65,
        y: currentY + 4,
        size: 3,
        color: rgb(r/255, g/255, b/255),
      });

      page.drawText(achievement, {
        x: 80,
        y: currentY,
        size: 11,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    });
  }

  // Draw tables if available
  if (reportData.tables && currentY > 100) {
    currentY -= 40;
    currentY = drawTable(page, reportData.tables.monthlyMetrics, {
      x: 50,
      y: currentY,
      width: width - 100,
      font: helveticaFont,
      colors: Object.values(colors),
    });
  }

  return await pdfDoc.save();
}
