
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

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

    // Generate PDF file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFileName = `report_${report_id}_${timestamp}.pdf`;
    
    // For now, we'll simulate PDF generation with a placeholder URL
    // In a real implementation, you would generate a PDF and upload it to storage
    const pdfUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/reports/${pdfFileName}`;

    // Update the report with completed status and generated data
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: 1024 * 1024, // 1MB placeholder
        page_count: reportType === 'combined' ? 8 : 5,
      })
      .eq('id', report_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
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
