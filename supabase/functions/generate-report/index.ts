
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

    // Get the report details
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select(`
        *,
        template:report_templates(*)
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

    console.log('Generating report data with template:', template);

    const reportData = await generateReportData(
      template?.report_type || 'combined',
      template?.visualization_config || {
        showBarCharts: true,
        showPieCharts: true,
        showTables: true,
        showTimeline: true,
      }
    );

    console.log('Generated report data:', reportData);

    // Generate PDF
    console.log('Generating PDF document...');
    const pdfBuffer = await createPDFDocument(template, reportData);
    console.log('PDF document generated, size:', pdfBuffer.length);

    // Generate PDF file name and upload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFileName = `report_${report_id}_${timestamp}.pdf`;
    
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

    // Get public URL
    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(pdfFileName);

    console.log('Generated public URL:', pdfUrl);

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
      console.error('Error updating report status:', updateError);
      throw updateError;
    }

    console.log('Successfully completed report generation');

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
