
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateESGReportRequest {
  businessId: string;
  dateRange: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { businessId, dateRange } = await req.json() as GenerateESGReportRequest;

    // Fetch business details
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (!business) {
      throw new Error('Business not found');
    }

    // Fetch sustainability metrics
    const { data: metrics } = await supabase
      .from('sustainability_metrics')
      .select('*')
      .eq('business_id', businessId)
      .gte('recorded_at', dateRange.start)
      .lte('recorded_at', dateRange.end);

    // Fetch sustainability goals
    const { data: goals } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('business_id', businessId);

    // Fetch industry benchmarks
    const { data: benchmarks } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry_type', business.industry_type);

    // Process metrics into categories
    const processedMetrics = (metrics || []).reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});

    // Generate insights using the OpenAI API
    const openAIKey = Deno.env.get('OPENAI_API_KEY')!;
    const insights = await generateInsights(processedMetrics, goals, benchmarks, openAIKey);

    // Create report structure
    const report = {
      business_name: business.name,
      date_range: dateRange,
      executive_summary: insights.executive_summary,
      metrics: processedMetrics,
      charts: generateCharts(processedMetrics),
      goals: goals || [],
      industry_benchmarks: benchmarks || [],
      recommendations: insights.recommendations
    };

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from('esg_reports')
      .insert({
        business_id: businessId,
        report_data: report,
        date_range: dateRange,
        insights: insights,
        status: 'completed'
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(
      JSON.stringify({ success: true, report: savedReport }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating ESG report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateInsights(metrics: any, goals: any, benchmarks: any, openAIKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an ESG analysis expert. Generate insights and recommendations based on sustainability metrics.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            metrics,
            goals,
            benchmarks,
            request: 'Generate executive summary and recommendations'
          })
        }
      ],
      temperature: 0.7,
    }),
  });

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

function generateCharts(metrics: any) {
  const charts: Record<string, any> = {};
  
  // Process each metric category into appropriate chart data
  Object.entries(metrics).forEach(([category, data]: [string, any]) => {
    if (Array.isArray(data) && data.length > 0) {
      // Timeline chart
      charts[`${category}_timeline`] = {
        type: 'line',
        title: `${category.replace('_', ' ')} Over Time`,
        data: data.map((m: any) => ({
          timestamp: m.recorded_at,
          value: m.value,
          label: m.metric_name
        }))
      };

      // Distribution chart
      charts[`${category}_distribution`] = {
        type: 'pie',
        title: `${category.replace('_', ' ')} Distribution`,
        data: data.reduce((acc: any[], m: any) => {
          const existing = acc.find(item => item.label === m.metric_name);
          if (existing) {
            existing.value += m.value;
          } else {
            acc.push({ label: m.metric_name, value: m.value });
          }
          return acc;
        }, [])
      };
    }
  });

  return charts;
}
