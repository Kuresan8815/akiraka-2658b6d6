
import "xhr";
import { serve } from "std/http/server.ts";
import { createClient } from "supabase-js";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  console.log("ESG Report generation function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Create Supabase client with service key for admin rights
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { report_id, business_id, configuration } = await req.json();
    
    if (!report_id || !business_id) {
      console.error("Missing required parameters: report_id or business_id");
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Processing report ${report_id} for business ${business_id}`);
    
    // Update report status to processing
    const { error: updateError } = await supabase
      .from("generated_reports")
      .update({ status: "processing" })
      .eq("id", report_id);
      
    if (updateError) {
      console.error("Error updating report status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update report status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Fetch business data to include in the report
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();
      
    if (businessError) {
      console.error("Error fetching business data:", businessError);
      await updateReportStatus(supabase, report_id, "failed", "Failed to fetch business data");
      return new Response(
        JSON.stringify({ error: "Failed to fetch business data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Get analytics data for the report
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      "get_analytics_data",
      {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      }
    );
    
    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      // Continue with the process even if analytics fail
    }
    
    // Generate a mock report data for now
    // In a real implementation, you would use the OpenAI API to generate the report
    const reportData = {
      title: configuration?.title || "ESG Performance Report",
      description: configuration?.description || "Comprehensive ESG analysis",
      generated_at: new Date().toISOString(),
      business: businessData,
      metrics: analyticsData || {
        total_scans: 0,
        unique_users: 0,
        avg_scans_per_user: 0,
        total_carbon_saved: 0,
        total_water_saved: 0,
        avg_sustainability_score: 0,
      },
      sections: [
        {
          title: "Executive Summary",
          content: "This report provides an overview of environmental, social, and governance performance.",
        },
        {
          title: "Environmental Impact",
          content: `The business has saved approximately ${analyticsData ? analyticsData[0]?.total_carbon_saved || 0 : 0}kg of carbon.`,
        },
        {
          title: "Social Responsibility",
          content: "Details about social responsibility initiatives and metrics.",
        },
        {
          title: "Governance",
          content: "Information about corporate governance practices and transparency.",
        },
      ],
      recommendations: [
        "Increase renewable energy usage",
        "Implement water conservation measures",
        "Enhance diversity and inclusion programs",
      ],
    };
    
    // Save the report data and update status to completed
    const { error: reportUpdateError } = await supabase
      .from("generated_reports")
      .update({
        status: "completed",
        report_data: reportData,
        pdf_url: `https://example.com/reports/${report_id}.pdf`, // This would be a real URL in production
      })
      .eq("id", report_id);
      
    if (reportUpdateError) {
      console.error("Error updating report data:", reportUpdateError);
      await updateReportStatus(supabase, report_id, "failed", "Failed to update report data");
      return new Response(
        JSON.stringify({ error: "Failed to update report data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Successfully generated report ${report_id}`);
    
    return new Response(
      JSON.stringify({ success: true, report_id, status: "completed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in generate-esg-report:", error);
    
    // Try to update the report status if possible
    try {
      if (req.method !== "OPTIONS") {
        const { report_id } = await req.json();
        if (report_id) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          await updateReportStatus(supabase, report_id, "failed", error.message);
        }
      }
    } catch (e) {
      console.error("Failed to update report status after error:", e);
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to update report status
async function updateReportStatus(supabase: any, reportId: string, status: string, errorMessage?: string) {
  const updateData: Record<string, any> = { status };
  if (errorMessage) {
    updateData.report_data = { error: errorMessage };
  }
  
  try {
    const { error } = await supabase
      .from("generated_reports")
      .update(updateData)
      .eq("id", reportId);
      
    if (error) {
      console.error("Error updating report status:", error);
    }
  } catch (e) {
    console.error("Unexpected error updating report status:", e);
  }
}
