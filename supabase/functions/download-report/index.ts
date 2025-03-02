
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
    const { reportId, verify = false } = await req.json();
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
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
      )
    }
    
    if (!report.pdf_url) {
      return new Response(
        JSON.stringify({ error: 'Report does not have a PDF URL' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // If this is just a verification request, test if the URL exists
    if (verify) {
      try {
        const checkResponse = await fetch(report.pdf_url, { method: 'HEAD' });
        if (!checkResponse.ok) {
          console.error(`PDF URL verification failed: ${report.pdf_url}, status: ${checkResponse.status}`);
          
          // Update report with error info
          const reportData = report.report_data || {};
          await supabase
            .from('generated_reports')
            .update({
              report_data: {
                ...reportData,
                pdf_check_error: `URL check failed with status ${checkResponse.status}`,
                pdf_check_time: new Date().toISOString()
              }
            })
            .eq('id', reportId);
            
          return new Response(
            JSON.stringify({ 
              error: `PDF not accessible (${checkResponse.status})`, 
              status: checkResponse.status 
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, exists: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (verifyError) {
        console.error('Error verifying PDF URL:', verifyError);
        
        // Update report with error info
        const reportData = report.report_data || {};
        await supabase
          .from('generated_reports')
          .update({
            report_data: {
              ...reportData,
              pdf_check_error: `URL check failed: ${verifyError.message}`,
              pdf_check_time: new Date().toISOString()
            }
          })
          .eq('id', reportId);
          
        return new Response(
          JSON.stringify({ error: 'PDF not accessible', details: verifyError.message }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    try {
      // Try to download the PDF
      const response = await fetch(report.pdf_url);
      
      if (!response.ok) {
        console.error(`Failed to download PDF: ${report.pdf_url}, status: ${response.status}`);
        
        // If the PDF doesn't exist, generate a test PDF instead
        if (response.status === 404) {
          // Call the generate-test-pdf function
          const { data: testPdfData, error: testPdfError } = await supabase.functions.invoke("generate-test-pdf", {
            body: { reportId: reportId, force: true }
          });
          
          if (testPdfError) {
            throw new Error(`Failed to generate test PDF: ${testPdfError.message}`);
          }
          
          if (testPdfData && testPdfData.pdf_url) {
            return new Response(
              JSON.stringify({ 
                url: testPdfData.pdf_url, 
                generated: true, 
                message: 'Original PDF was not found, generated a test PDF instead' 
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          throw new Error('Failed to generate replacement PDF');
        }
        
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }
      
      // If successful, return the URL
      return new Response(
        JSON.stringify({ url: report.pdf_url }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (downloadError) {
      console.error('Error downloading PDF:', downloadError);
      
      // Update report with download error info
      const reportData = report.report_data || {};
      await supabase
        .from('generated_reports')
        .update({
          report_data: {
            ...reportData,
            download_error: downloadError.message,
            download_time: new Date().toISOString()
          }
        })
        .eq('id', reportId);
        
      return new Response(
        JSON.stringify({ error: 'Error downloading PDF', details: downloadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in download-report function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
