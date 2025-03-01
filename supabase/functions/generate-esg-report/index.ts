
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
    
    console.log(`Processing report ${report_id} for business ${business_id} with config:`, configuration);
    
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

    console.log("Fetched business data:", businessData);
    
    // Fetch business metrics data
    const { data: metricsData, error: metricsError } = await supabase
      .from("widget_metrics")
      .select(`
        id,
        value,
        recorded_at,
        widget:widgets(name, category, unit, metric_type)
      `)
      .eq("business_id", business_id)
      .order("recorded_at", { ascending: false })
      .limit(100);
    
    if (metricsError) {
      console.error("Error fetching metrics data:", metricsError);
      // Continue with the process even if metrics fail
    }

    console.log(`Fetched ${metricsData?.length || 0} metrics records`);

    // Group metrics by category (environmental, social, governance)
    const groupedMetrics = {
      environmental: [],
      social: [],
      governance: []
    };

    metricsData?.forEach(metric => {
      const category = metric.widget?.category;
      if (category && groupedMetrics[category]) {
        groupedMetrics[category].push({
          name: metric.widget?.name,
          value: metric.value,
          unit: metric.widget?.unit,
          recorded_at: metric.recorded_at
        });
      }
    });
    
    // Get date range from the request or use default (last month)
    const dateRange = configuration?.date_range || {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end: new Date().toISOString(),
    };
    
    // Generate color palette based on configuration
    const colorPalette = generateColorPalette(configuration?.colorScheme || "greenBlue");
    
    // Generate the report data
    const reportData = {
      title: configuration?.title || "ESG Performance Report",
      description: configuration?.description || "Comprehensive ESG analysis",
      generated_at: new Date().toISOString(),
      business: {
        id: businessData.id,
        name: businessData.name,
        industry: businessData.industry_type,
        description: businessData.description,
        website: businessData.website,
        logo_url: businessData.logo_url
      },
      date_range: dateRange,
      metrics: {
        environmental: groupedMetrics.environmental,
        social: groupedMetrics.social,
        governance: groupedMetrics.governance
      },
      charts: generateCharts(groupedMetrics, colorPalette, configuration),
      sections: [
        {
          title: "Executive Summary",
          content: generateExecutiveSummary(businessData, groupedMetrics)
        },
        {
          title: "Environmental Performance",
          content: generateSectionContent("environmental", groupedMetrics.environmental),
          metrics: groupedMetrics.environmental
        },
        {
          title: "Social Impact",
          content: generateSectionContent("social", groupedMetrics.social),
          metrics: groupedMetrics.social
        },
        {
          title: "Governance",
          content: generateSectionContent("governance", groupedMetrics.governance),
          metrics: groupedMetrics.governance
        }
      ],
      recommendations: generateRecommendations(groupedMetrics),
      visualization_preferences: configuration?.visualization || {
        showBarCharts: true,
        showLineCharts: true,
        showPieCharts: true,
        showTables: true
      },
      color_scheme: colorPalette
    };
    
    // Mock PDF URL - in a real implementation this would be generated and uploaded
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/reports/${report_id}.pdf`;
    
    // Update the report with generated data
    const { error: reportUpdateError } = await supabase
      .from("generated_reports")
      .update({
        status: "completed",
        report_data: reportData,
        pdf_url: pdfUrl,
        file_size: Math.floor(Math.random() * 1000) + 500, // Mock file size
        page_count: Math.floor(Math.random() * 10) + 5 // Mock page count
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
      JSON.stringify({ 
        success: true, 
        report_id, 
        status: "completed",
        business_name: businessData.name 
      }),
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

// Helper function to generate color palette
function generateColorPalette(scheme: string) {
  const palettes: Record<string, string[]> = {
    greenBlue: ["#10B981", "#3B82F6", "#8B5CF6"],
    vibrant: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
    earthy: ["#D97706", "#65A30D", "#0369A1", "#A16207"],
    contrast: ["#10B981", "#EC4899", "#F59E0B", "#8B5CF6"],
    rainbow: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]
  };
  return palettes[scheme] || palettes.greenBlue;
}

// Helper function to generate executive summary
function generateExecutiveSummary(business: any, metrics: any) {
  const envMetricsCount = metrics.environmental.length;
  const socialMetricsCount = metrics.social.length;
  const govMetricsCount = metrics.governance.length;
  
  return `This report provides a comprehensive ESG (Environmental, Social, and Governance) analysis for ${business.name}, operating in the ${business.industry_type} industry. ${
    business.description ? `${business.description} ` : ''
  }The analysis covers ${envMetricsCount + socialMetricsCount + govMetricsCount} metrics across environmental (${envMetricsCount}), social (${socialMetricsCount}), and governance (${govMetricsCount}) categories. The data presented reflects the company's performance and sustainability efforts, highlighting both achievements and areas for improvement.`;
}

// Helper function to generate section content
function generateSectionContent(category: string, metrics: any[]) {
  if (!metrics || metrics.length === 0) {
    return `No ${category} metrics data available for this reporting period.`;
  }
  
  const categoryText = {
    environmental: "Environmental metrics focus on the company's impact on the natural environment and its mitigation strategies.",
    social: "Social metrics address the company's relationship with employees, suppliers, customers, and communities.",
    governance: "Governance metrics examine the internal systems, controls, and procedures the company uses to govern itself."
  };
  
  let content = categoryText[category] || "";
  content += ` This section presents data on ${metrics.length} key ${category} metrics.`;
  
  if (metrics.length > 0) {
    const metricsSummary = metrics.slice(0, 3).map(m => `${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`).join(", ");
    content += ` Key highlights include ${metricsSummary}${metrics.length > 3 ? ', among others' : ''}.`;
  }
  
  return content;
}

// Helper function to generate charts based on metrics
function generateCharts(metrics: any, colorPalette: string[], configuration: any) {
  const charts = [];
  const prefs = configuration?.visualization || {};
  
  // Environmental metrics line chart
  if (prefs.showLineCharts !== false && metrics.environmental.length > 0) {
    charts.push({
      type: "line",
      title: "Environmental Metrics Trend",
      data: metrics.environmental.slice(0, 5).map(m => ({ name: m.name, value: m.value })),
      colors: [colorPalette[0]]
    });
  }
  
  // Social metrics bar chart
  if (prefs.showBarCharts !== false && metrics.social.length > 0) {
    charts.push({
      type: "bar",
      title: "Social Impact Metrics",
      data: metrics.social.slice(0, 5).map(m => ({ name: m.name, value: m.value })),
      colors: [colorPalette[1]]
    });
  }
  
  // Governance metrics pie chart
  if (prefs.showPieCharts !== false && metrics.governance.length > 0) {
    charts.push({
      type: "pie",
      title: "Governance Metrics Distribution",
      data: metrics.governance.slice(0, 5).map(m => ({ name: m.name, value: m.value })),
      colors: colorPalette
    });
  }
  
  // ESG category comparison
  if (prefs.showBarCharts !== false) {
    charts.push({
      type: "bar",
      title: "ESG Categories Comparison",
      data: [
        { name: "Environmental", value: metrics.environmental.length },
        { name: "Social", value: metrics.social.length },
        { name: "Governance", value: metrics.governance.length }
      ],
      colors: colorPalette
    });
  }
  
  return charts;
}

// Helper function to generate recommendations
function generateRecommendations(metrics: any) {
  const recommendations = [
    "Conduct a comprehensive ESG materiality assessment to identify priority focus areas",
    "Implement a real-time ESG data collection system to improve reporting accuracy and timeliness",
    "Establish science-based targets for environmental metrics to align with global sustainability goals"
  ];
  
  if (metrics.environmental.length < 5) {
    recommendations.push("Expand environmental metrics tracking to cover a broader range of impacts");
  }
  
  if (metrics.social.length < 5) {
    recommendations.push("Develop additional social impact metrics to better assess community and employee engagement");
  }
  
  if (metrics.governance.length < 5) {
    recommendations.push("Enhance governance tracking with additional metrics on board diversity and ethical business practices");
  }
  
  return recommendations;
}
