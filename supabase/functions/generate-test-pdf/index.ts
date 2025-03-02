
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

    console.log(`Generating test PDF for report: ${reportId}`);
    
    // Get report details
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .select("*, report_template(*)")
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
    
    // Create a simple PDF (using text content)
    const pdfContent = `
      Report ID: ${report.id}
      Generated At: ${report.generated_at}
      Status: ${report.status}
      Business ID: ${report.business_id}
      Template: ${report.report_template?.name || "N/A"}
      
      This is a test PDF generated for demonstration purposes.
      
      Generated on: ${new Date().toLocaleString()}
    `;
    
    // Convert text to Uint8Array
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfContent);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `report_${reportId.substring(0, 8)}_${timestamp}.pdf`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("reports")
      .upload(filename, pdfBytes, {
        contentType: "application/pdf",
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Upload error: ${uploadError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to upload PDF: ${uploadError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from("reports")
      .getPublicUrl(filename);
    
    const pdfUrl = publicUrlData.publicUrl;
    
    // Update the report record with the PDF URL
    const { data: updateData, error: updateError } = await supabase
      .from("generated_reports")
      .update({
        status: "completed",
        pdf_url: pdfUrl,
        file_size: pdfBytes.length,
        page_count: 1,
        report_data: {
          ...report.report_data,
          generated_at: new Date().toISOString(),
          is_test: true
        }
      })
      .eq("id", reportId)
      .select();
    
    if (updateError) {
      console.error(`Update error: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to update report: ${updateError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test PDF generated successfully",
        reportId,
        pdfUrl,
        fileSize: pdfBytes.length
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
