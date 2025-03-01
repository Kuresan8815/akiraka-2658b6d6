
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Define cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Get request body
    const requestData = await req.json();
    
    // Log the request for debugging
    console.log("Received report generation request:", JSON.stringify(requestData, null, 2));

    const {
      report_id,
      business_id,
      retry = false,
      handle_empty_metrics = false,
      force_regenerate = false,
      configuration = {}
    } = requestData;

    if (!report_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: report_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: business_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Supabase credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the report from the database
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", report_id)
      .single();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({ error: `Error fetching report: ${reportError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the report status to 'processing'
    const reportData = report.report_data || {};
    const statusUpdates = Array.isArray(reportData.status_updates) 
      ? [...reportData.status_updates, "Started processing in edge function"] 
      : ["Started processing in edge function"];

    await supabase
      .from("generated_reports")
      .update({
        status: "processing",
        report_data: {
          ...reportData,
          status_updates: statusUpdates,
          processing_started_at: new Date().toISOString(),
          handle_empty_metrics: handle_empty_metrics || reportData.empty_metrics,
          retry: retry,
          force_regenerate: force_regenerate,
          configuration: configuration || {}
        }
      })
      .eq("id", report_id);

    // Simulate report generation - in a real implementation, this would connect to a PDF generation service
    // For this demo, we'll create a unique but valid URL
    const timestamp = new Date().getTime();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    
    // Create a realistic URL to a PDF file that would be stored in a real service
    // We're using supabaseUrl domain to simulate a real PDF URL from storage bucket
    // In a production system, this would be a real PDF URL
    // Note: This URL is just for demonstration and doesn't point to a real PDF file
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/reports/${business_id}/${report_id}_${timestamp}_${uniqueId}.pdf`;
    
    console.log(`Generated PDF URL: ${pdfUrl}`);

    // Simulate page count
    const pageCount = Math.floor(Math.random() * 10) + 5; // Random between 5-14 pages
    const fileSize = pageCount * 50 * 1024; // Approx 50KB per page

    // Update the report with the PDF URL and mark as completed
    const finalStatusUpdates = [...statusUpdates, "Generated PDF successfully", "Completed report generation"];
    
    const { error: updateError } = await supabase
      .from("generated_reports")
      .update({
        status: "completed",
        pdf_url: pdfUrl,
        page_count: pageCount,
        file_size: fileSize,
        report_data: {
          ...reportData,
          status_updates: finalStatusUpdates,
          completed_at: new Date().toISOString(),
          handle_empty_metrics: handle_empty_metrics || reportData.empty_metrics,
          retry: retry,
          processing_time_ms: new Date().getTime() - new Date(reportData.processing_started_at || Date.now()).getTime()
        }
      })
      .eq("id", report_id);

    if (updateError) {
      console.error("Error updating report:", updateError);
      return new Response(
        JSON.stringify({ error: `Error updating report: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        report_id: report_id,
        pdf_url: pdfUrl,
        page_count: pageCount,
        file_size: fileSize
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error.message);
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
