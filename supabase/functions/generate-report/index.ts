
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportTemplate {
  name: string;
  report_type: 'metrics' | 'sustainability' | 'combined';
  visualization_config: {
    showBarCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
  };
  page_orientation: 'portrait' | 'landscape';
  theme_colors: string[];
}

interface ReportData {
  metrics: Record<string, number>;
  charts?: Record<string, any>;
  sustainability?: {
    environmental_impact: string;
    recommendations: string[];
    year_over_year_improvement: number;
  };
  tables?: {
    monthlyMetrics: {
      headers: string[];
      rows: string[][];
    };
  };
}

async function generateReportData(reportType: string, visualConfig: Record<string, boolean>): Promise<ReportData> {
  const colors = ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
  const reportData: ReportData = {
    generated_at: new Date().toISOString(),
    metrics: {},
    charts: {},
  };

  // Add metrics based on report type
  if (reportType === 'metrics' || reportType === 'combined') {
    reportData.metrics = {
      total_emissions: 1000,
      water_usage: 5000,
      sustainability_score: 85,
    };

    if (visualConfig.showBarCharts) {
      reportData.charts.monthlyEmissions = {
        type: 'bar',
        title: 'Monthly Emissions',
        data: [
          { month: 'Jan', value: 850, color: colors[0] },
          { month: 'Feb', value: 920, color: colors[1] },
          { month: 'Mar', value: 780, color: colors[2] },
          { month: 'Apr', value: 850, color: colors[3] },
          { month: 'May', value: 920, color: colors[4] },
          { month: 'Jun', value: 780, color: colors[5] },
        ],
      };
    }

    if (visualConfig.showPieCharts) {
      reportData.charts.resourceDistribution = {
        type: 'pie',
        title: 'Resource Distribution',
        data: [
          { label: 'Water', value: 35, color: colors[0] },
          { label: 'Energy', value: 45, color: colors[1] },
          { label: 'Materials', value: 20, color: colors[2] },
        ],
      };
    }
  }

  // Add sustainability data if applicable
  if (reportType === 'sustainability' || reportType === 'combined') {
    reportData.sustainability = {
      environmental_impact: 'Medium',
      recommendations: [
        'Implement water recycling system',
        'Switch to renewable energy sources',
        'Optimize waste management',
      ],
      year_over_year_improvement: 15,
    };

    if (visualConfig.showTimeline) {
      reportData.charts.sustainabilityProgress = {
        type: 'line',
        title: 'Sustainability Progress',
        data: [
          { quarter: 'Q1', score: 75, color: colors[0] },
          { quarter: 'Q2', score: 78, color: colors[1] },
          { quarter: 'Q3', score: 82, color: colors[2] },
          { quarter: 'Q4', score: 85, color: colors[3] },
        ],
      };
    }
  }

  if (visualConfig.showTables) {
    reportData.tables = {
      monthlyMetrics: {
        headers: ['Month', 'Emissions', 'Water Usage', 'Score'],
        rows: [
          ['January', '850kg', '4500L', '82'],
          ['February', '920kg', '4800L', '80'],
          ['March', '780kg', '4200L', '85'],
        ],
      },
    };
  }

  return reportData;
}

async function createPDFDocument(template: ReportTemplate, reportData: ReportData): Promise<Uint8Array> {
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
    color: rgb(0.61, 0.53, 0.96), // Purple background
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

// Helper function to convert hex color to RGB
function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { report_id } = await req.json();
    
    if (!report_id) {
      throw new Error('Report ID is required');
    }

    console.log(`Processing report ${report_id}`);

    // Get the report details
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select(`
        *,
        report_template:report_templates(*)
      `)
      .eq('id', report_id)
      .single();

    if (reportError) {
      throw reportError;
    }

    // Get template settings and generate report data
    const template = report.report_template;
    const reportData = await generateReportData(
      template?.report_type || 'combined',
      template?.visualization_config || {
        showBarCharts: true,
        showPieCharts: true,
        showTables: true,
        showTimeline: true,
      }
    );

    // Generate PDF
    const pdfBuffer = await createPDFDocument(template, reportData);

    // Generate PDF file name and upload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFileName = `report_${report_id}_${timestamp}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(pdfFileName);

    // Update report status
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: pdfBuffer.length,
        page_count: reportData.sustainability ? 8 : 5,
      })
      .eq('id', report_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, pdfUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing report:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

