
import { PDFPage, PDFFont, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

export function drawExecutiveSummary(
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
