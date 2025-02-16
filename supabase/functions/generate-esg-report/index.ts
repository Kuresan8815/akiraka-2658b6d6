import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { businessId, dateRange } = await req.json();

    // Verify OpenAI API key is present
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Test OpenAI API connection
    try {
      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'system', content: 'Test connection' }],
          max_tokens: 5
        }),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('OpenAI API connection test failed:', errorData);
        throw new Error(`OpenAI API connection failed: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('OpenAI API connection test error:', error);
      throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
    }

    // Fetch business details
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (!business) {
      throw new Error('Business not found');
    }

    // Fetch environmental metrics
    const { data: environmentalMetrics } = await supabase
      .from('widget_metrics')
      .select(`
        value,
        recorded_at,
        widget:widget_id(name, category, metric_type, unit)
      `)
      .eq('business_id', businessId)
      .eq('widget.category', 'environmental')
      .gte('recorded_at', dateRange.start)
      .lte('recorded_at', dateRange.end);

    // Fetch sustainability goals
    const { data: goals } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('business_id', businessId);

    // Fetch carbon emissions data
    const { data: emissions } = await supabase
      .from('carbon_emissions')
      .select('*')
      .eq('business_id', businessId)
      .gte('recorded_date', dateRange.start)
      .lte('recorded_date', dateRange.end);

    const systemPrompt = `You are an ESG reporting expert. Generate a concise yet detailed ESG report based on the provided data.
Focus on key metrics and actionable insights. Use bullet points for clarity.

Structure the response in this exact JSON format:
{
  "executive_summary": {
    "overview": "string",
    "key_metrics": [
      {
        "category": "environmental|social|governance",
        "metric": "string",
        "value": "string",
        "trend": "increasing|stable|decreasing"
      }
    ],
    "highlights": ["string"]
  },
  "environmental_impact": {
    "carbon_emissions": {
      "total": number,
      "reduction_target": number,
      "key_initiatives": ["string"]
    },
    "resource_usage": {
      "water": { "value": number, "unit": "string", "trend": "string" },
      "energy": { "value": number, "unit": "string", "trend": "string" },
      "waste": { "value": number, "unit": "string", "trend": "string" }
    },
    "recommendations": ["string"]
  },
  "social_contributions": {
    "workforce_metrics": {
      "diversity_score": number,
      "training_hours": number,
      "employee_satisfaction": number
    },
    "community_impact": {
      "initiatives": ["string"],
      "beneficiaries": number
    },
    "recommendations": ["string"]
  },
  "governance_performance": {
    "compliance_rate": number,
    "risk_assessment": {
      "level": "low|medium|high",
      "key_risks": ["string"]
    },
    "policies_implemented": ["string"],
    "recommendations": ["string"]
  },
  "future_goals": {
    "short_term": ["string"],
    "medium_term": ["string"],
    "long_term": ["string"],
    "priority_areas": ["string"]
  },
  "visualizations": [
    {
      "type": "bar|line|pie|radar",
      "title": "string",
      "data_points": ["string"],
      "metrics": ["string"]
    }
  ]
}`;

    try {
      console.log('Making OpenAI API request...');
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
              content: systemPrompt
            },
            {
              role: 'user',
              content: JSON.stringify({
                business,
                environmentalMetrics,
                goals,
                emissions,
                dateRange
              })
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API request failed:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      console.log('OpenAI API request successful');
      const aiResponse = await response.json();
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI: No content in response');
      }

      // Parse and validate the response
      let reportContent;
      try {
        reportContent = JSON.parse(aiResponse.choices[0].message.content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', aiResponse.choices[0].message.content);
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }

      // Save report to database
      const { data: report, error: reportError } = await supabase
        .from('esg_reports')
        .insert({
          business_id: businessId,
          report_data: reportContent,
          date_range: dateRange,
          status: 'completed',
          generated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (reportError) {
        throw reportError;
      }

      // Generate visualizations config
      const visualizations = reportContent.visualizations.map((viz: any) => ({
        type: viz.type,
        title: viz.title,
        data: {
          labels: viz.data_points,
          datasets: [{
            label: viz.title,
            data: viz.metrics
          }]
        }
      }));

      return new Response(
        JSON.stringify({
          success: true,
          report: {
            ...report,
            visualizations
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }

  } catch (error) {
    console.error('Error in generate-esg-report function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
