
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

    console.log(`Generating test PDF for report: ${reportId}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create a simple PDF file (in a real scenario this would be more complex)
    const encoder = new TextEncoder();
    const pdfContent = `%PDF-1.7
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 1/Kids[3 0 R]>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/Resources 4 0 R/MediaBox[0 0 595 842]/Contents 5 0 R>>
endobj
4 0 obj
<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>
endobj
5 0 obj
<</Length 44>>
stream
BT /F1 24 Tf 100 742 Td (Test Report ${reportId}) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000107 00000 n
0000000199 00000 n
0000000266 00000 n
trailer
<</Size 6/Root 1 0 R>>
startxref
361
%%EOF`;
    
    const pdfBuffer = encoder.encode(pdfContent);
    
    // Generate a file name and path
    const filename = `report-${reportId.slice(0, 8)}-${Date.now()}.pdf`;
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("reports")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false
      });
      
    if (uploadError) {
      if (uploadError.message.includes("bucket not found")) {
        console.error("Bucket 'reports' not found. Please create it first.");
        return new Response(
          JSON.stringify({ 
            error: "Storage bucket not found", 
            message: "The 'reports' storage bucket does not exist. Please create it in the Supabase dashboard."
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("Error uploading file:", uploadError);
      return new Response(
        JSON.stringify({ error: "File upload failed", details: uploadError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the public URL for the file
    const { data: publicURL } = supabase
      .storage
      .from("reports")
      .getPublicUrl(filename);
      
    if (!publicURL || !publicURL.publicUrl) {
      throw new Error("Failed to generate public URL for the file");
    }
    
    // Update report with the file information
    const { data: report, error: reportError } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", reportId)
      .single();
      
    if (reportError) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({ error: "Report not found", details: reportError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the report with the file information
    const reportData = report.report_data || {};
    const { error: updateError } = await supabase
      .from("generated_reports")
      .update({
        pdf_url: publicURL.publicUrl,
        status: "completed",
        file_size: pdfBuffer.byteLength,
        page_count: 1,
        report_data: {
          ...reportData,
          test_pdf_generated: true,
          generated_at: new Date().toISOString()
        }
      })
      .eq("id", reportId);
      
    if (updateError) {
      console.error("Error updating report:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update report", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test PDF generated successfully", 
        pdf_url: publicURL.publicUrl,
        file_size: pdfBuffer.byteLength,
        page_count: 1
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error generating test PDF:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
