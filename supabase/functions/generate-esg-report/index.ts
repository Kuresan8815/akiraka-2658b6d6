import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { report_id, business_id, configuration } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting ESG report generation:', { report_id, business_id });

    // Update report status to processing
    await supabase
      .from('generated_reports')
      .update({ status: 'processing' })
      .eq('id', report_id);

    // Fetch business info
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    // Fetch ESG metrics
    const { data: metrics } = await supabase
      .from('widget_metrics')
      .select(`
        *,
        widget:widgets(*)
      `)
      .eq('business_id', business_id);

    // Categorize metrics by ESG
    const categorizedMetrics = {
      environmental: metrics?.filter(m => m.widget?.category === 'environmental') ?? [],
      social: metrics?.filter(m => m.widget?.category === 'social') ?? [],
      governance: metrics?.filter(m => m.widget?.category === 'governance') ?? [],
    };

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(business, categorizedMetrics);

    // Generate charts data
    const chartsData = generateChartsData(categorizedMetrics);

    // Prepare the final report data
    const reportData = {
      business_info: {
        name: business.name,
        industry: business.industry_type,
        description: business.description,
      },
      executive_summary: executiveSummary,
      metrics_summary: {
        environmental: summarizeMetrics(categorizedMetrics.environmental),
        social: summarizeMetrics(categorizedMetrics.social),
        governance: summarizeMetrics(categorizedMetrics.governance),
      },
      charts: chartsData,
      generated_at: new Date().toISOString(),
    };

    // Update report with generated data
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
      })
      .eq('id', report_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating ESG report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateExecutiveSummary(business: any, metrics: any) {
  // Generate a comprehensive summary based on the metrics
  const totalMetrics = Object.values(metrics).reduce((acc: any, cat: any) => acc + cat.length, 0);
  
  return {
    overview: `This report provides a comprehensive analysis of ${business.name}'s ESG performance, covering ${totalMetrics} key metrics across environmental, social, and governance categories.`,
    highlights: {
      environmental: summarizeCategory(metrics.environmental),
      social: summarizeCategory(metrics.social),
      governance: summarizeCategory(metrics.governance),
    },
  };
}

function summarizeCategory(metrics: any[]) {
  if (!metrics.length) return "No metrics available";
  
  const latestValues = metrics.map(m => ({
    name: m.widget.name,
    value: m.value,
    unit: m.widget.unit,
  }));

  return {
    metric_count: metrics.length,
    latest_values: latestValues,
  };
}

function summarizeMetrics(metrics: any[]) {
  return metrics.map(m => ({
    name: m.widget.name,
    current_value: m.value,
    unit: m.widget.unit,
    category: m.widget.category,
    description: m.widget.description,
  }));
}

function generateChartsData(categorizedMetrics: any) {
  return {
    distribution: {
      type: "pie",
      data: {
        labels: ["Environmental", "Social", "Governance"],
        values: [
          categorizedMetrics.environmental.length,
          categorizedMetrics.social.length,
          categorizedMetrics.governance.length,
        ],
      },
    },
    trends: {
      type: "line",
      data: generateTrendsData(categorizedMetrics),
    },
    performance: {
      type: "bar",
      data: generatePerformanceData(categorizedMetrics),
    },
  };
}

function generateTrendsData(metrics: any) {
  // Implementation for generating time-series data
  return {
    labels: [], // Time periods
    datasets: [] // Metric values over time
  };
}

function generatePerformanceData(metrics: any) {
  // Implementation for generating performance comparison data
  return {
    labels: [], // Metric names
    values: [] // Current values
  };
}
