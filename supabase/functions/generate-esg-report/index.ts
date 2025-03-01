// Follow the Edge Function Template Pattern
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

async function generateQuickChartUrl(
  chartType: string, 
  chartData: ChartData, 
  title: string, 
  colors: string[]
): Promise<string> {
  // Default chart config
  const config = {
    type: chartType,
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: true,
    }
  };

  // URL encode the config
  const encodedConfig = encodeURIComponent(JSON.stringify(config));
  
  // Return the QuickChart URL
  return `https://quickchart.io/chart?c=${encodedConfig}&w=600&h=400&bkg=white`;
}

serve(async (req) => {
  console.log("ESG Report generation function called");
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body
    const requestData = await req.json();
    const { 
      report_id, 
      business_id, 
      handle_empty_metrics = false,
      use_external_charts = false,  // New parameter
      configuration 
    } = requestData;
    
    if (!report_id || !business_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing report ${report_id} for business ${business_id}`);
    console.log(`Configuration:`, configuration);
    console.log(`Handle empty metrics: ${handle_empty_metrics}`);
    console.log(`Use external charts: ${use_external_charts}`);

    // Update the report status to processing
    const { error: updateError } = await supabase
      .from("generated_reports")
      .update({ 
        status: "processing",
        report_data: { 
          processing_started: new Date().toISOString(),
          handle_empty_metrics: handle_empty_metrics,
          use_external_charts: use_external_charts
        }
      })
      .eq("id", report_id);
    
    if (updateError) {
      console.error("Error updating report status:", updateError);
      throw updateError;
    }
    
    // Get business data
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();
    
    if (businessError) {
      console.error("Error fetching business data:", businessError);
      throw businessError;
    }
    
    // Get metrics data
    const { data: metricsData, error: metricsError } = await supabase
      .from("sustainability_metrics")
      .select("*")
      .eq("business_id", business_id);
    
    if (metricsError) {
      console.error("Error fetching metrics data:", metricsError);
      throw metricsError;
    }
    
    console.log(`Retrieved ${metricsData?.length || 0} metrics records`);
    
    // Check if metrics data is empty
    const hasData = metricsData && metricsData.length > 0;
    console.log(`Has metrics data: ${hasData}`);
    
    if (!hasData && !handle_empty_metrics) {
      throw new Error("No metrics data available and empty metrics handling is disabled");
    }
    
    // Initialize the ESG report data
    const reportData: any = {
      business: businessData,
      metrics: hasData ? metricsData : [],
      empty_data_handled: !hasData && handle_empty_metrics,
      generation_date: new Date().toISOString(),
      sections: []
    };
    
    // Generate chart URLs if using external charts API
    if (use_external_charts) {
      console.log("Generating external chart URLs");
      
      const chartUrls: Record<string, string> = {};
      
      // Sample environmental data (replace with actual data in production)
      if (configuration.visualization.showBarCharts) {
        const environmentalData: ChartData = {
          labels: ['Carbon Emissions', 'Water Usage', 'Waste Reduction', 'Energy Efficiency'],
          datasets: [{
            label: 'Environmental Impact',
            data: hasData ? [75, 60, 82, 70] : [0, 0, 0, 0],
            backgroundColor: configuration.colorScheme === 'greenBlue' 
              ? ['#10B981', '#3B82F6', '#10B981', '#3B82F6'] 
              : ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
          }]
        };
        
        chartUrls.environmentalBarChart = await generateQuickChartUrl(
          'bar', 
          environmentalData, 
          'Environmental Impact Metrics', 
          ['#10B981', '#3B82F6']
        );
      }
      
      // Sample social data
      if (configuration.visualization.showPieCharts) {
        const socialData: ChartData = {
          labels: ['Employee Satisfaction', 'Community Engagement', 'Diversity & Inclusion', 'Health & Safety'],
          datasets: [{
            label: 'Social Metrics',
            data: hasData ? [30, 25, 25, 20] : [0, 0, 0, 0],
            backgroundColor: configuration.colorScheme === 'greenBlue' 
              ? ['#10B981', '#3B82F6', '#8B5CF6', '#64748B'] 
              : ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
          }]
        };
        
        chartUrls.socialPieChart = await generateQuickChartUrl(
          'pie', 
          socialData, 
          'Social Impact Distribution', 
          ['#10B981', '#3B82F6', '#8B5CF6', '#64748B']
        );
      }
      
      // Sample governance data
      if (configuration.visualization.showLineCharts) {
        const governanceData: ChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Governance Score',
            data: hasData ? [65, 70, 68, 72, 75, 80] : [0, 0, 0, 0, 0, 0],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true
          }]
        };
        
        chartUrls.governanceLineChart = await generateQuickChartUrl(
          'line', 
          governanceData, 
          'Governance Score Trend', 
          ['#3B82F6']
        );
      }
      
      // Sample heatmap data (using a matrix chart as QuickChart doesn't directly support heatmaps)
      if (configuration.visualization.showHeatmaps) {
        // Simulate a heatmap using a bubble chart
        const heatmapData: ChartData = {
          labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
          datasets: [{
            label: 'Impact Matrix',
            data: hasData ? [65, 75, 55, 80] : [0, 0, 0, 0],
            backgroundColor: '#10B981'
          }]
        };
        
        chartUrls.heatmapChart = await generateQuickChartUrl(
          'radar', 
          heatmapData, 
          'Impact Intensity Matrix', 
          ['#10B981']
        );
      }
      
      // Add chart URLs to report data
      reportData.chartUrls = chartUrls;
      console.log("Generated chart URLs:", Object.keys(chartUrls).length);
    }
    
    // Categorize metrics by ESG
    if (hasData || handle_empty_metrics) {
      // Create ESG sections
      reportData.sections = [
        {
          title: "Environmental",
          metrics: hasData ? metricsData.filter(m => m.category === 'environmental') : [],
          summary: "Environmental sustainability performance analysis.",
          chartUrl: use_external_charts ? reportData.chartUrls?.environmentalBarChart : null
        },
        {
          title: "Social",
          metrics: hasData ? metricsData.filter(m => m.category === 'social') : [],
          summary: "Social responsibility and community impact.",
          chartUrl: use_external_charts ? reportData.chartUrls?.socialPieChart : null
        },
        {
          title: "Governance",
          metrics: hasData ? metricsData.filter(m => m.category === 'governance') : [],
          summary: "Corporate governance and ethical practices.",
          chartUrl: use_external_charts ? reportData.chartUrls?.governanceLineChart : null
        }
      ];
    }
    
    // Simulate PDF generation (in production, this would be a real PDF generation process)
    // For now, we'll just create a fake PDF URL
    const pdfUrl = `https://example.com/reports/${report_id}.pdf`;
    
    // Update the report with the generated data
    const { error: finalUpdateError } = await supabase
      .from("generated_reports")
      .update({ 
        status: "completed",
        report_data: reportData,
        pdf_url: pdfUrl,
        page_count: 10, // Simulated page count
        file_size: 1024 * 1024, // Simulated file size (1MB)
      })
      .eq("id", report_id);
    
    if (finalUpdateError) {
      console.error("Error updating report with generated data:", finalUpdateError);
      throw finalUpdateError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Report generation completed successfully", 
        pdf_url: pdfUrl,
        report_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error(`Error generating report:`, error);
    
    // Create Supabase client for error handling
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    try {
      // Parse request to get report_id
      const requestData = await req.json();
      const { report_id } = requestData;
      
      if (report_id) {
        // Update the report status to failed
        await supabase
          .from("generated_reports")
          .update({ 
            status: "failed",
            report_data: { 
              error: error.message,
              error_timestamp: new Date().toISOString()
            }
          })
          .eq("id", report_id);
      }
    } catch (e) {
      console.error("Error handling report failure:", e);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
