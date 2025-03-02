
// Follow this setup guide to integrate the Deno runtime and run this Edge Function locally: https://deno.land/manual/runtime/manual_deployment
// Learn more: https://deno.land/manual/examples/deploy_edge_functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, force = false } = await req.json();
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Generating test PDF for report: ${reportId}, force: ${force}`);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get report from DB
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (reportError) {
      console.error('Error fetching report:', reportError);
      return new Response(
        JSON.stringify({ error: 'Report not found', details: reportError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if report already has a PDF and we're not forcing a regeneration
    if (report.pdf_url && !force) {
      // Verify the existing PDF URL is accessible
      try {
        const response = await fetch(report.pdf_url, { method: 'HEAD' });
        if (response.ok) {
          return new Response(
            JSON.stringify({ pdf_url: report.pdf_url, message: 'PDF already exists' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log(`Existing PDF URL is not accessible, will generate a new one: ${report.pdf_url}`);
      } catch (error) {
        console.error('Error checking existing PDF:', error);
      }
    }
    
    // Generate a timestamp-based filename to avoid cache issues
    const timestamp = Date.now();
    const filename = `${reportId.slice(0, 8)}-${timestamp}.pdf`;
    
    // Get report data to use in the PDF
    let reportData = report.report_data || {};
    if (typeof reportData === 'string') {
      try {
        reportData = JSON.parse(reportData);
      } catch (e) {
        console.error('Error parsing report data:', e);
        reportData = {};
      }
    }
    
    // Add status update
    const statusUpdates = Array.isArray(reportData.status_updates) 
      ? [...reportData.status_updates, 'Generated test PDF']
      : ['Generated test PDF'];
    
    // In a real implementation, we would generate a real PDF here
    // For now, we'll use a test PDF from a public URL or create a simple one
    
    // For this example, let's "simulate" creating a PDF by uploading a simple PDF to storage
    
    // Generate some basic PDF content
    const pdfContent = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 53, 10, 37, 226, 227, 207, 211, 10, 49, 32, 48, 32, 111, 98, 106, 10, 60, 60, 10, 47, 84, 121, 112, 101, 32, 47, 67, 97, 116, 97, 108, 111, 103, 10, 47, 80, 97, 103, 101, 115, 32, 50, 32, 48, 32, 82, 10, 62, 62, 10, 101, 110, 100, 111, 98, 106, 10, 50, 32, 48, 32, 111, 98, 106, 10, 60, 60, 10, 47, 84, 121, 112, 101, 32, 47, 80, 97, 103, 101, 115, 10, 47, 75, 105, 100, 115, 32, 91, 32, 51, 32, 48, 32, 82, 32, 93, 10, 47, 67, 111, 117, 110, 116, 32, 49, 10, 62, 62, 10, 101, 110, 100, 111, 98, 106, 10, 51, 32, 48, 32, 111, 98, 106, 10, 60, 60, 10, 47, 84, 121, 112, 101, 32, 47, 80, 97, 103, 101, 10, 47, 80, 97, 114, 101, 110, 116, 32, 50, 32, 48, 32, 82, 10, 47, 82, 101, 115, 111, 117, 114, 99, 101, 115, 32, 60, 60, 10, 47, 70, 111, 110, 116, 32, 60, 60, 10, 47, 70, 49, 32, 52, 32, 48, 32, 82, 10, 62, 62, 10, 62, 62, 10, 47, 77, 101, 100, 105, 97, 66, 111, 120, 32, 91, 32, 48, 32, 48, 32, 54, 48, 48, 32, 56, 48, 48, 32, 93, 10, 47, 67, 111, 110, 116, 101, 110, 116, 115, 32, 53, 32, 48, 32, 82, 10, 62, 62, 10, 101, 110, 100, 111, 98, 106, 10, 52, 32, 48, 32, 111, 98, 106, 10, 60, 60, 10, 47, 84, 121, 112, 101, 32, 47, 70, 111, 110, 116, 10, 47, 83, 117, 98, 116, 121, 112, 101, 32, 47, 84, 121, 112, 101, 49, 10, 47, 66, 97, 115, 101, 70, 111, 110, 116, 32, 47, 72, 101, 108, 118, 101, 116, 105, 99, 97, 10, 62, 62, 10, 101, 110, 100, 111, 98, 106, 10, 53, 32, 48, 32, 111, 98, 106, 10, 60, 60, 10, 47, 76, 101, 110, 103, 116, 104, 32, 52, 52, 10, 62, 62, 10, 115, 116, 114, 101, 97, 109, 10, 66, 84, 10, 47, 70, 49, 32, 49, 56, 32, 84, 102, 10, 49, 48, 48, 32, 55, 48, 48, 32, 84, 100, 10, 40, 84, 101, 115, 116, 32, 80, 68, 70, 32, 102, 111, 114, 32, 82, 101, 112, 111, 114, 116, 41, 32, 84, 106, 10, 69, 84, 10, 101, 110, 100, 115, 116, 114, 101, 97, 109, 10, 101, 110, 100, 111, 98, 106, 10, 120, 114, 101, 102, 10, 48, 32, 54, 10, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 32, 54, 53, 53, 51, 53, 32, 102, 10, 48, 48, 48, 48, 48, 48, 48, 48, 49, 48, 32, 48, 48, 48, 48, 48, 32, 110, 10, 48, 48, 48, 48, 48, 48, 48, 48, 55, 57, 32, 48, 48, 48, 48, 48, 32, 110, 10, 48, 48, 48, 48, 48, 48, 48, 49, 55, 51, 32, 48, 48, 48, 48, 48, 32, 110, 10, 48, 48, 48, 48, 48, 48, 48, 51, 48, 49, 32, 48, 48, 48, 48, 48, 32, 110, 10, 48, 48, 48, 48, 48, 48, 48, 51, 56, 48, 32, 48, 48, 48, 48, 48, 32, 110, 10, 116, 114, 97, 105, 108, 101, 114, 10, 60, 60, 10, 47, 83, 105, 122, 101, 32, 54, 10, 47, 82, 111, 111, 116, 32, 49, 32, 48, 32, 82, 10, 62, 62, 10, 115, 116, 97, 114, 116, 120, 114, 101, 102, 10, 53, 54, 50, 10, 37, 37, 69, 79, 70
    ]);

    // Upload the PDF to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(filename, pdfContent, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF', details: uploadError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the public URL
    const { data: publicUrl } = supabase
      .storage
      .from('reports')
      .getPublicUrl(filename);
      
    // Update the report with the new PDF URL and other metadata
    const { data: updatedReport, error: updateError } = await supabase
      .from('generated_reports')
      .update({
        pdf_url: publicUrl.publicUrl,
        status: 'completed',
        page_count: 1,
        file_size: pdfContent.length,
        report_data: {
          ...reportData,
          timestamp: new Date().toISOString(),
          status_updates: statusUpdates,
          test_pdf: true,
          generator: 'generate-test-pdf'
        }
      })
      .eq('id', reportId)
      .select();
      
    if (updateError) {
      console.error('Error updating report:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update report', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Successfully generated test PDF: ${publicUrl.publicUrl}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: publicUrl.publicUrl,
        page_count: 1,
        file_size: pdfContent.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-test-pdf function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
