
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { reportId } = await req.json();
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ error: "Report ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Processing download request for report: ${reportId}`);
    
    // Get report details
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", reportId)
      .single();
    
    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: `Failed to find report: ${reportError?.message || "Not found"}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Check if PDF URL exists
    if (!report.pdf_url) {
      console.log(`Report ${reportId} has no PDF URL`);
      
      // Update report with error information
      await supabase
        .from("generated_reports")
        .update({
          report_data: {
            ...report.report_data,
            download_error: "PDF URL not found in report record"
          }
        })
        .eq("id", reportId);
        
      return new Response(
        JSON.stringify({ error: "PDF URL not found in report record" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Found PDF URL: ${report.pdf_url}`);
    
    // Try to extract the path from the URL
    let pdfPath;
    try {
      const url = new URL(report.pdf_url);
      // Extract the path from URL like https://nmlpmvsxqkmfrddvdfaw.supabase.co/storage/v1/object/public/reports/file.pdf
      const pathRegex = /\/storage\/v1\/object\/public\/reports\/(.+)/;
      const match = url.pathname.match(pathRegex);
      
      if (match && match[1]) {
        pdfPath = match[1];
      } else {
        throw new Error("Invalid PDF URL format");
      }
    } catch (error) {
      console.error(`Failed to parse PDF URL: ${error.message}`);
      
      // Update report with error information
      await supabase
        .from("generated_reports")
        .update({
          report_data: {
            ...report.report_data,
            download_error: `Invalid PDF URL: ${error.message}`
          }
        })
        .eq("id", reportId);
        
      return new Response(
        JSON.stringify({ error: `Invalid PDF URL: ${error.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Extracted path: ${pdfPath}`);
    
    // Check if file exists in storage
    const { data, error } = await supabase
      .storage
      .from("reports")
      .download(pdfPath);
    
    if (error) {
      console.error(`Storage error: ${error.message}`);
      
      // Update report with error information
      await supabase
        .from("generated_reports")
        .update({
          report_data: {
            ...report.report_data,
            download_error: `Storage error: ${error.message}`
          }
        })
        .eq("id", reportId);
        
      return new Response(
        JSON.stringify({ error: `Failed to download file: ${error.message}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Get a signed URL that's valid for a short time
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from("reports")
      .createSignedUrl(pdfPath, 60); // Valid for 60 seconds
    
    if (signedUrlError) {
      console.error(`Signed URL error: ${signedUrlError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to create download link: ${signedUrlError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        downloadUrl: signedUrlData.signedUrl,
        reportName: `Report_${reportId.substring(0, 8)}.pdf`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
