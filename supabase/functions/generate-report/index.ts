
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
          { month: 'Jan', value: 850 },
          { month: 'Feb', value: 920 },
          { month: 'Mar', value: 780 },
          { month: 'Apr', value: 850 },
          { month: 'May', value: 920 },
          { month: 'Jun', value: 780 },
        ],
      };
    }

    if (visualConfig.showPieCharts) {
      reportData.charts.resourceDistribution = {
        type: 'pie',
        title: 'Resource Distribution',
        data: [
          { label: 'Water', value: 35 },
          { label: 'Energy', value: 45 },
          { label: 'Materials', value: 20 },
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
          { quarter: 'Q1', score: 75 },
          { quarter: 'Q2', score: 78 },
          { quarter: 'Q3', score: 82 },
          { quarter: 'Q4', score: 85 },
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
  const page = pdfDoc.addPage(template.page_orientation === 'landscape' ? [842, 595] : [595, 842]);
  const { width, height } = page.getSize();
  
  // Add title and date
  page.drawText(template.name, {
    x: 50,
    y: height - 50,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Draw metrics
  let yPosition = height - 120;
  Object.entries(reportData.metrics).forEach(([key, value]) => {
    const label = key.replace(/_/g, ' ').toUpperCase();
    page.drawText(`${label}: ${value}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
  });

  // Draw table if available
  if (reportData.tables) {
    yPosition = drawTable(page, reportData.tables.monthlyMetrics, {
      x: 50,
      y: yPosition - 40,
      width: width - 100,
      font: timesRomanFont,
    });
  }

  return await pdfDoc.save();
}

function drawTable(
  page: PDFPage,
  table: { headers: string[]; rows: string[][] },
  options: { x: number; y: number; width: number; font: PDFFont }
): number {
  const { x, y, width, font } = options;
  let currentY = y;

  // Draw table title
  page.drawText('Monthly Metrics', {
    x,
    y: currentY,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  currentY -= 25;

  const columnWidth = width / table.headers.length;

  // Draw headers
  table.headers.forEach((header, index) => {
    page.drawText(header, {
      x: x + (columnWidth * index),
      y: currentY,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  });

  // Draw rows
  table.rows.forEach((row) => {
    currentY -= 20;
    row.forEach((cell, cellIndex) => {
      page.drawText(cell, {
        x: x + (columnWidth * cellIndex),
        y: currentY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });
  });

  return currentY;
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
