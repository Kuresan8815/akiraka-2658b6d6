
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
    };

    // Add metrics based on report type
    if (reportType === 'metrics' || reportType === 'combined') {
      reportData.metrics = {
        total_emissions: 1000,
        water_usage: 5000,
        sustainability_score: 85,
      };
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
    }

    // Add visualization data based on config
    if (visualConfig.showBarCharts) {
      reportData.charts = {
        ...reportData.charts,
        barCharts: [
          {
            title: 'Monthly Emissions',
            data: [/* ... sample data ... */],
          },
        ],
      };
    }

    if (visualConfig.showPieCharts) {
      reportData.charts = {
        ...reportData.charts,
        pieCharts: [
          {
            title: 'Resource Distribution',
            data: [/* ... sample data ... */],
          },
        ],
      };
    }

    // Generate PDF and upload to storage
    const pdfFileName = `report_${report_id}_${new Date().toISOString()}.pdf`;
    
    // For now, we'll simulate PDF generation and upload
    const pdfUrl = `https://example.com/reports/${pdfFileName}`;

    // Update the report with completed status and generated data
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: 1024 * 1024, // 1MB
        page_count: 5,
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
