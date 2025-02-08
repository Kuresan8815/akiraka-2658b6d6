
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

