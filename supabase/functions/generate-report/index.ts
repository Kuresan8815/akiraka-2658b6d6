
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from './utils/cors.ts';
import { generateReportData } from './services/reportDataGenerator.ts';
import { createPDFDocument } from './services/pdfGenerator.ts';
import type { ReportTemplate } from './types.ts';

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

    // Get the report details with business metrics
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select(`
        *,
        template:report_templates(*),
        business:business_id(*)
      `)
      .eq('id', report_id)
      .single();

    if (reportError) {
      console.error('Error fetching report:', reportError);
      throw reportError;
    }

    if (!report) {
      throw new Error(`Report ${report_id} not found`);
    }

    console.log('Found report:', report);

    // Get template settings and generate report data
    const template = report.template;
    if (!template) {
      throw new Error(`Template not found for report ${report_id}`);
    }

    // Fetch business metrics for the report
    const { data: businessMetrics, error: metricsError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('business_id', report.business_id)
      .single();

    if (metricsError) {
      console.error('Error fetching business metrics:', metricsError);
      throw metricsError;
    }

    // Fetch widget metrics for the business
    const { data: widgetMetrics, error: widgetError } = await supabase
      .from('widget_metrics')
      .select(`
        *,
        widget:widget_id(*)
      `)
      .eq('business_id', report.business_id)
      .order('recorded_at', { ascending: false });

    if (widgetError) {
      console.error('Error fetching widget metrics:', widgetError);
      throw widgetError;
    }

    console.log('Generating report data with template:', template);

    const reportData = await generateReportData(
      template?.report_type || 'combined',
      template?.visualization_config || {
        showBarCharts: true,
        showPieCharts: true,
        showTables: true,
        showTimeline: true,
      },
      businessMetrics,
      widgetMetrics
    );

    console.log('Generated report data:', reportData);

    // Generate PDF
    console.log('Generating PDF document...');
    const pdfBuffer = await createPDFDocument(template, reportData);
    console.log('PDF document generated, size:', pdfBuffer.length);

    // Generate PDF file name and upload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedBusinessName = report.business?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'business';
    const pdfFileName = `${sanitizedBusinessName}_report_${timestamp}.pdf`;
    
    console.log('Uploading PDF to storage:', pdfFileName);
    
    // Create the reports bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'reports')) {
      const { error: bucketError } = await supabase.storage.createBucket('reports', {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
      if (bucketError) {
        console.error('Error creating reports bucket:', bucketError);
        throw bucketError;
      }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw uploadError;
    }

    console.log('PDF uploaded successfully:', uploadData);

    // Get signed URL that expires in 24 hours
    const { data: { signedUrl } } = await supabase.storage
      .from('reports')
      .createSignedUrl(pdfFileName, 86400); // 24 hours in seconds

    console.log('Generated signed URL:', signedUrl);

    // Update report status
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: signedUrl,
        file_size: pdfBuffer.length,
        page_count: reportData.sustainability ? 8 : 5,
      })
      .eq('id', report_id);

    if (updateError) {
      console.error('Error updating report status:', updateError);
      throw updateError;
    }

    console.log('Successfully completed report generation');

    return new Response(
      JSON.stringify({ success: true, pdfUrl: signedUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing report:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: typeof error === 'object' ? JSON.stringify(error) : error 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

