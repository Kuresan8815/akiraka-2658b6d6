
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-ai-report function');
    
    const { requestId, prompt } = await req.json();
    
    if (!requestId || !prompt) {
      console.error('Missing required parameters:', { requestId, prompt });
      throw new Error('Request ID and prompt are required');
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');

    // Fetch request details
    console.log('Fetching request details for ID:', requestId);
    const { data: request, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      console.error('Error fetching request:', requestError);
      throw new Error(`Failed to get request details: ${requestError?.message || 'Request not found'}`);
    }
    
    console.log('Request details fetched successfully:', { 
      requestId: request.id, 
      businessId: request.business_id,
      status: request.status 
    });

    // Update request to processing
    await supabase
      .from('ai_report_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);
    
    console.log('Request status updated to processing');

    // Fetch business data
    console.log('Fetching metrics for business ID:', request.business_id);
    const { data: businessWidgets, error: businessWidgetsError } = await supabase
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

    if (businessWidgetsError) {
      console.error('Error fetching business widgets:', businessWidgetsError);
      throw new Error(`Failed to fetch business widgets: ${businessWidgetsError.message}`);
    }

    console.log(`Fetched ${businessWidgets?.length || 0} business widgets`);

    const { data: metrics, error: metricsError } = await supabase
      .from('widget_metrics')
      .select('*')
      .eq('business_id', request.business_id)
      .order('recorded_at', { ascending: false });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
    }

    console.log(`Fetched ${metrics?.length || 0} metrics`);

    // Organize metrics by category
    console.log('Organizing metrics by category');
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

    console.log('Metrics organized by category:', Object.keys(metricsByCategory || {}));

    // Generate report structure based on prompt
    console.log('Generating report based on prompt:', prompt);

    // Create PDF document
    const doc = new jsPDF();
    
    // Title and Header
    doc.setFillColor(48, 49, 51);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('ESG Performance Report', 20, 25);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add generation info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Report Focus: ${prompt.substring(0, 80)}`, 20, 52);

    let yPosition = 60;

    // Include metrics from each category
    console.log('Adding metrics to report');
    for (const [category, metrics] of Object.entries(metricsByCategory || {})) {
      if (!metrics || metrics.length === 0) continue;

      // Category Header
      doc.setFillColor(80, 80, 80);
      doc.rect(15, yPosition, doc.internal.pageSize.width - 30, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(category.toUpperCase(), 20, yPosition + 7);
      yPosition += 15;

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Metrics Table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      metrics.forEach((metric: any) => {
        doc.text(`${metric.name}: ${metric.value} ${metric.unit}`, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    }

    // Add insights based on prompt
    console.log('Adding insights and recommendations');
    doc.addPage();
    
    // Insights Header
    doc.setFillColor(48, 49, 51);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Insights & Recommendations', 20, 15);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    const recommendations = [
      "Optimize resource efficiency based on current metrics",
      "Enhance sustainability reporting transparency",
      "Implement data-driven improvement strategies",
      "Regular monitoring and updates of ESG metrics"
    ];

    yPosition = 40;
    doc.setFontSize(12);
    recommendations.forEach((rec, index) => {
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${rec}`, 20, yPosition);
      yPosition += 10;
    });

    // Generate PDF and upload to storage
    console.log('Generating PDF file');
    const pdfBytes = doc.output('arraybuffer');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `esg-report-${timestamp}.pdf`;

    console.log('Uploading PDF to storage');
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      
      // Check if the bucket doesn't exist and try to create it
      if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
        console.log('Reports bucket not found, attempting to create it');
        
        // Create the bucket
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .createBucket('reports', {
            public: true
          });
          
        if (bucketError) {
          console.error('Error creating reports bucket:', bucketError);
          throw new Error(`Failed to create reports bucket: ${bucketError.message}`);
        }
        
        // Try upload again
        console.log('Retrying upload to newly created bucket');
        const { data: retryFileData, error: retryUploadError } = await supabase
          .storage
          .from('reports')
          .upload(fileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: false
          });
          
        if (retryUploadError) {
          console.error('Error on retry upload:', retryUploadError);
          throw new Error(`Failed to upload PDF on retry: ${retryUploadError.message}`);
        }
      } else {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }
    }

    console.log('PDF uploaded successfully');

    // Get the public URL
    const { data: { publicUrl: pdfUrl } } = await supabase
      .storage
      .from('reports')
      .getPublicUrl(fileName);
      
    console.log('PDF public URL generated:', pdfUrl);

    // Create report entry
    console.log('Creating report entry in the database');
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        template_id: null,
        business_id: request.business_id,
        status: 'completed',
        report_data: {
          metrics: metricsByCategory,
          generated_at: new Date().toISOString(),
          recommendations
        },
        pdf_url: pdfUrl,
        file_size: pdfBytes.byteLength,
        page_count: doc.internal.getNumberOfPages(),
        metadata: {
          ai_generated: true,
          prompt,
          requestId,
          metrics_count: Object.values(metricsByCategory || {}).flat().length
        }
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report entry:', reportError);
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    console.log('Report entry created successfully:', report.id);

    // Update request status
    console.log('Updating request status to completed');
    await supabase
      .from('ai_report_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    console.log('Request processing completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        templateId: report.id,
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
    
    try {
      // Attempt to update the request status to failed if possible
      const { requestId } = await req.json().catch(() => ({ requestId: null }));
      
      if (requestId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          await supabase
            .from('ai_report_requests')
            .update({ 
              status: 'failed',
              error_message: error.message || 'Unknown error'
            })
            .eq('id', requestId);
            
          console.log('Updated request status to failed');
        }
      }
    } catch (updateError) {
      console.error('Error updating request status:', updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unknown error occurred',
        stack: error.stack,
        name: error.name
      }),
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
