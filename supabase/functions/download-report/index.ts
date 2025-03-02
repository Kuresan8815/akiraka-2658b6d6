
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import "xhr";

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
    const { reportId } = await req.json();
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ error: "Report ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing download request for report: ${reportId}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch the report to get its PDF URL
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", reportId)
      .single();
      
    if (reportError || !report) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({ error: "Report not found", details: reportError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the report has a valid file path
    if (!report.pdf_url || !report.pdf_url.includes('storage/v1/object/public/reports/')) {
      console.error("Invalid PDF URL:", report.pdf_url);
      
      // Update the report status with error details
      const reportData = report.report_data || {};
      await supabase
        .from("generated_reports")
        .update({
          report_data: {
            ...reportData,
            download_error: "Invalid or missing PDF URL",
            last_download_attempt: new Date().toISOString()
          }
        })
        .eq("id", reportId);
        
      return new Response(
        JSON.stringify({ error: "Invalid PDF URL", details: "The report does not have a valid PDF URL" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get just the file path part from the URL (after /public/reports/)
    const filePath = report.pdf_url.split('/public/reports/')[1];
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "Invalid file path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching file from storage: reports/${filePath}`);
    
    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from("reports")
      .download(filePath);
      
    if (fileError || !fileData) {
      console.error("Error downloading file:", fileError);
      
      // Update the report with download error
      const reportData = report.report_data || {};
      await supabase
        .from("generated_reports")
        .update({
          report_data: {
            ...reportData,
            download_error: fileError?.message || "File not found in storage",
            last_download_attempt: new Date().toISOString()
          }
        })
        .eq("id", reportId);
        
      return new Response(
        JSON.stringify({ error: "File not found", details: fileError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update report with successful download
    const reportData = report.report_data || {};
    await supabase
      .from("generated_reports")
      .update({
        report_data: {
          ...reportData,
          last_download_attempt: new Date().toISOString(),
          download_success: true
        }
      })
      .eq("id", reportId);
    
    // Return the file with appropriate headers
    return new Response(fileData, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${reportId}.pdf"`,
      }
    });
    
  } catch (error) {
    console.error("Error processing download request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
