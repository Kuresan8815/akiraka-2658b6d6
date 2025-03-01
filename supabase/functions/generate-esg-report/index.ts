
// Supabase Edge Function for generating ESG reports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { report_id, business_id, configuration } = body;

    console.log("Report generation request received:", { report_id, business_id });
    console.log("Configuration:", JSON.stringify(configuration));

    if (!report_id || !business_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: report_id and business_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking report existence...");
    
    // Check if report exists
    const { data: reportData, error: reportCheckError } = await supabase
      .from("generated_reports")
      .select("*")
      .eq("id", report_id)
      .single();

    if (reportCheckError || !reportData) {
      console.error("Report not found:", reportCheckError);
      return new Response(
        JSON.stringify({
          error: "Report not found",
          details: reportCheckError,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Report found, updating status to processing...");
    
    // Update report status to processing
    const { error: updateError } = await supabase
      .from("generated_reports")
      .update({ status: "processing" })
      .eq("id", report_id);

    if (updateError) {
      console.error("Error updating report status:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update report status",
          details: updateError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Fetching business data...");
    
    // Fetch business data
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();

    if (businessError || !businessData) {
      console.error("Business not found:", businessError);
      await supabase
        .from("generated_reports")
        .update({ 
          status: "failed", 
          report_data: { error: "Business not found" } 
        })
        .eq("id", report_id);
        
      return new Response(
        JSON.stringify({
          error: "Business not found",
          details: businessError,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Business found:", businessData.name);

    // Get sustainability metrics for this business
    const { data: metrics, error: metricsError } = await supabase
      .from("sustainability_metrics")
      .select("*")
      .eq("business_id", business_id)
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (metricsError) {
      console.error("Error fetching sustainability metrics:", metricsError);
      // We'll continue even if no metrics are found
    }

    console.log(`Found ${metrics?.length || 0} sustainability metrics`);

    // Generate a sample PDF for demonstration
    // In a real implementation, this would use the metrics and configuration to generate a proper report
    const reportTitle = configuration.title || "ESG Performance Report";
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `${businessData.name.replace(/\s+/g, '_')}_ESG_Report_${currentDate}.pdf`;
    
    console.log("Generating PDF content...");
    
    // In production, we'd generate a real PDF here
    // For now, we're creating a simple blob to upload
    const pdfContent = new TextEncoder().encode(
      `%PDF-1.7
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 1/Kids[3 0 R]>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>/ProcSet[/PDF/Text]>>/MediaBox[0 0 612 792]/Contents 4 0 R>>
endobj
4 0 obj
<</Length 210>>
stream
BT
/F1 24 Tf
72 720 Td
(${reportTitle}) Tj
/F1 12 Tf
0 -40 Td
(Business: ${businessData.name}) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(This is a system-generated ESG report for ${businessData.name}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000111 00000 n
0000000274 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
537
%%EOF`
    );

    console.log("Uploading PDF to storage...");
    
    try {
      // Create a storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .createBucket('reports', {
          public: false,
          fileSizeLimit: 10485760,  // 10MB limit
        });

      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error("Error creating storage bucket:", bucketError);
        throw bucketError;
      }
      
      // Set a unique file path
      const filePath = `${business_id}/${report_id}/${fileName}`;
      
      // Upload the PDF to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('reports')
        .upload(filePath, pdfContent, {
          contentType: 'application/pdf',
          upsert: true
        });
  
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Successfully uploaded PDF:", uploadData);
      
      // Create a signed URL for the PDF that's valid for 7 days
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('reports')
        .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days in seconds
  
      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        throw signedUrlError;
      }
      
      const pdfUrl = signedUrlData.signedUrl;
      console.log("Generated signed URL:", pdfUrl);
      
      // Update the report with the PDF URL and mark as completed
      const { error: completeError } = await supabase
        .from("generated_reports")
        .update({ 
          status: "completed", 
          pdf_url: pdfUrl,
          file_size: pdfContent.length,
          page_count: 1,
          report_data: {
            generated_at: new Date().toISOString(),
            metrics_count: metrics?.length || 0,
            business_name: businessData.name,
            report_type: "ESG Performance",
            title: reportTitle
          }
        })
        .eq("id", report_id);
  
      if (completeError) {
        console.error("Error updating report as completed:", completeError);
        throw completeError;
      }
      
      console.log("Report generation completed successfully");
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Report generated successfully",
          pdf_url: pdfUrl,
          report_id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error in PDF generation/upload process:", error);
      
      // Update report as failed
      await supabase
        .from("generated_reports")
        .update({ 
          status: "failed", 
          report_data: { 
            error: error.message || "Unknown error in PDF generation",
            timestamp: new Date().toISOString()
          } 
        })
        .eq("id", report_id);
        
      return new Response(
        JSON.stringify({
          error: "Failed to generate or upload PDF",
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unhandled exception:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
