
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  const structuredPrompt = {
    role: 'system',
    content: `You are an expert ESG (Environmental, Social, and Governance) analyst. Your task is to analyze the provided sustainability metrics, goals, and industry benchmarks to generate a comprehensive ESG report insights.

Please provide your analysis in the following JSON structure:
{
  "executive_summary": {
    "key_insights": [string[]],  // 3-5 key findings
    "performance_highlights": string,  // Overall performance assessment
    "areas_for_improvement": string,   // Key areas needing attention
    "esg_score": number  // Overall ESG score out of 100
  },
  "environmental_analysis": {
    "carbon_footprint": string,
    "energy_efficiency": string,
    "water_management": string,
    "waste_reduction": string,
    "recommendations": string[]
  },
  "social_impact": {
    "diversity_inclusion": string,
    "employee_engagement": string,
    "community_relations": string,
    "recommendations": string[]
  },
  "governance_evaluation": {
    "compliance_status": string,
    "risk_management": string,
    "transparency": string,
    "recommendations": string[]
  },
  "benchmarking": {
    "industry_position": string,
    "leading_practices": string[],
    "gap_analysis": string
  },
  "recommendations": {
    "short_term": string[],  // 2-3 immediate actions
    "medium_term": string[], // 2-3 6-month goals
    "long_term": string[]    // 2-3 12-month+ objectives
  }
}`
  };

  const userPrompt = {
    role: 'user',
    content: JSON.stringify({
      context: "Generate a detailed ESG analysis and recommendations based on the following data:",
      metrics: metrics,
      goals: goals,
      industryBenchmarks: benchmarks,
      instructions: "Please provide a comprehensive analysis following the specified JSON structure, ensuring all sections are properly analyzed and recommendations are actionable and specific."
    })
  };

  try {
    console.log('Sending request to OpenAI with structured prompt');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [structuredPrompt, userPrompt],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const result = await response.json();
    console.log('Received response from OpenAI:', result);

    if (!result.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const parsedContent = JSON.parse(result.choices[0].message.content);
    console.log('Parsed insights:', parsedContent);

    return parsedContent;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
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
