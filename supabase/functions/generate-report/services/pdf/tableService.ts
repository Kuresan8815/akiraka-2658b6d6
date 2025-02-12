
import { PDFPage, PDFFont, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

export function drawTable(
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
