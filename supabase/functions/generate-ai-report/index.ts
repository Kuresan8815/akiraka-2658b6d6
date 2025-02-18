
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requestId, prompt } = await req.json();
    
    if (!requestId || !prompt) {
      throw new Error('Request ID and prompt are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing request:', requestId);

    // Get the AI report request details
    const { data: request, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error(`Failed to get request details: ${requestError?.message || 'Request not found'}`);
    }

    // Fetch business metrics data
    const { data: businessWidgets } = await supabase
      .from('business_widgets')
      .select(`
        widget_id,
        widgets (
          id,
          name,
          description,
          category,
          unit
        )
      `)
      .eq('business_id', request.business_id)
      .eq('is_active', true);

    // Fetch latest metrics for each widget
    const { data: metrics } = await supabase
      .from('widget_metrics')
      .select('*')
      .eq('business_id', request.business_id)
      .order('recorded_at', { ascending: false });

    // Organize metrics by category
    const metricsByCategory = businessWidgets?.reduce((acc: any, bw) => {
      const widget = bw.widgets;
      if (!widget) return acc;

      const latestMetric = metrics?.find(m => m.widget_id === widget.id);
      if (!latestMetric) return acc;

      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }

      acc[widget.category].push({
        name: widget.name,
        value: latestMetric.value,
        unit: widget.unit || '',
        description: widget.description,
        recorded_at: latestMetric.recorded_at
      });

      return acc;
    }, {});

    // Generate report data with actual metrics
    const reportData = {
      summary: `Sustainability report generated based on ${Object.values(metricsByCategory || {}).flat().length} metrics`,
      metrics: metricsByCategory || {},
      generated_at: new Date().toISOString(),
      business_id: request.business_id,
      recommendations: [
        "Implement renewable energy solutions based on current usage patterns",
        "Enhance water conservation measures across operations",
        "Expand community engagement programs",
        "Monitor and improve sustainability metrics regularly"
      ]
    };

    // Generate PDF with actual metrics data
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('AI Generated Sustainability Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 30);
    doc.text('Based on prompt: ' + prompt.substring(0, 80), 20, 40);
    
    // Add metrics by category
    let yPosition = 60;
    
    for (const [category, metrics] of Object.entries(metricsByCategory || {})) {
      doc.setFontSize(16);
      doc.text(category.charAt(0).toUpperCase() + category.slice(1) + ' Metrics', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      (metrics as any[]).forEach((metric) => {
        const metricText = `${metric.name}: ${metric.value} ${metric.unit}`;
        doc.text(metricText, 30, yPosition);
        yPosition += 10;
      });
      
      yPosition += 10;
    }
    
    // Add recommendations
    doc.setFontSize(16);
    doc.text('Recommendations', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    reportData.recommendations.forEach((recommendation) => {
      doc.text('• ' + recommendation, 30, yPosition);
      yPosition += 10;
    });

    // Convert PDF to bytes
    const pdfBytes = doc.output('arraybuffer');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}.pdf`;

    // Upload the PDF to storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get a public URL for the uploaded file
    const { data: { publicUrl: pdfUrl } } = await supabase
      .storage
      .from('reports')
      .getPublicUrl(fileName);

    // Create a completed report entry with actual data
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        template_id: null,
        business_id: request.business_id,
        status: 'completed',
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: pdfBytes.byteLength,
        page_count: 1,
        metadata: {
          ai_generated: true,
          prompt: prompt,
          requestId: requestId,
          generation_date: new Date().toISOString(),
          version: '1.0',
          metrics_count: Object.values(metricsByCategory || {}).flat().length
        }
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    // Update the AI request status
    await supabase
      .from('ai_report_requests')
      .update({
        status: 'completed'
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        report: reportData,
        pdfUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
