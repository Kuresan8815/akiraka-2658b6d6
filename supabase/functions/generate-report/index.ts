
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { renderPdf } from "https://deno.land/x/pdfme@0.1.9/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get the template settings
    const template = report.report_template;
    const reportType = template?.report_type || 'combined';
    const visualConfig = template?.visualization_config || {
      showBarCharts: true,
      showPieCharts: true,
      showTables: true,
      showTimeline: true,
    };

    // Generate report data based on type and visualization config
    const reportData: Record<string, any> = {
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

    // Generate PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${template.name}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${Object.entries(reportData.metrics).map(([key, value]) => `
            <div class="section">
              <h3>${key.replace(/_/g, ' ').toUpperCase()}</h3>
              <p>${value}</p>
            </div>
          `).join('')}
          ${reportData.tables ? `
            <div class="section">
              <h3>Monthly Metrics</h3>
              <table>
                <tr>${reportData.tables.monthlyMetrics.headers.map((header: string) => `
                  <th>${header}</th>
                `).join('')}</tr>
                ${reportData.tables.monthlyMetrics.rows.map((row: string[]) => `
                  <tr>${row.map((cell: string) => `
                    <td>${cell}</td>
                  `).join('')}</tr>
                `).join('')}
              </table>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // Generate PDF buffer
    const pdfBuffer = await renderPdf({
      content: pdfContent,
      format: template.page_orientation === 'landscape' ? 'A4L' : 'A4',
    });

    // Generate PDF file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFileName = `report_${report_id}_${timestamp}.pdf`;
    
    // Upload PDF to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL for the uploaded PDF
    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(pdfFileName);

    // Update the report with completed status and generated data
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: pdfBuffer.length,
        page_count: reportType === 'combined' ? 8 : 5,
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
