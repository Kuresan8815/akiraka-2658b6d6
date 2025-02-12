
import { PDFPage, PDFFont, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

export function drawReportHeader(
  page: PDFPage,
  height: number,
  helveticaFont: PDFFont,
  helveticaBold: PDFFont
) {
  // Add header with gradient background
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: page.getSize().width,
    height: 100,
    color: rgb(0.61, 0.53, 0.96),
  });

  // Add title and date
  page.drawText('ESG Sustainability Metrics Report', {
    x: 50,
    y: height - 60,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 90,
    size: 14,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  return height - 150; // Return the new Y position
}
