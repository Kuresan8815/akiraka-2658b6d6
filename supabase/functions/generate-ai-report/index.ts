import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, prompt } = await req.json();
    console.log('Processing AI report request:', { requestId, prompt });

    if (!requestId || !prompt) {
      throw new Error('Missing required parameters: requestId and prompt are required');
    }

    // Verify OpenAI API key is available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify OpenAI API connection with correct model name
    try {
      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Test connection' },
            { role: 'user', content: 'Test' }
          ],
          max_tokens: 5
        }),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('OpenAI API connection test failed:', errorData);
        throw new Error(`OpenAI API connection failed: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('OpenAI API connection error:', error);
      throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
    }

    // Get the AI request details
    const { data: requestData, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*, business:business_id(*)')
      .eq('id', requestId)
      .single();

    if (requestError) {
      console.error('Error fetching request data:', requestError);
      throw requestError;
    }

    console.log('Found request data:', requestData);

    // Fetch business metrics and data
    const { data: businessMetrics } = await supabase
      .from('business_product_analytics')
      .select('*')
      .eq('business_id', requestData.business_id)
      .single();

    // Fetch sustainability metrics
    const { data: sustainabilityMetrics } = await supabase
      .from('widget_metrics')
      .select(`
        *,
        widget:widget_id(*)
      `)
      .eq('business_id', requestData.business_id)
      .order('recorded_at', { ascending: false })
      .limit(50);

    console.log('Fetched business data:', { businessMetrics, sustainabilityMetrics });

    // Update request status to processing
    const { error: updateError } = await supabase
      .from('ai_report_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request status:', updateError);
      throw updateError;
    }

    // Create a detailed system prompt with business data
    const systemPrompt = `You are a professional report generator that creates comprehensive business sustainability reports. 
You have access to the following business data:
${JSON.stringify({
  businessMetrics,
  sustainabilityMetrics,
}, null, 2)}

Generate a detailed report configuration that includes multiple sections and pages, using this data to create meaningful insights.
Focus on creating visually appealing sections with charts and tables. Each section should be on its own page.

Each section should include:
1. Title
2. Detailed analysis of the data
3. Specific metrics to visualize
4. Recommended chart types
5. Color scheme suggestions

Required sections:
1. Executive Summary
2. Business Overview
3. Sustainability Metrics
4. Environmental Impact
5. Recommendations
6. Future Projections

Your response MUST be a valid JSON string with this structure:
{
  "name": "string",
  "description": "string",
  "sections": [
    {
      "title": "string",
      "content": "string",
      "visualizations": ["bar", "pie", "table", "timeline"],
      "metrics": [],
      "colors": ["string"]
    }
  ],
  "type": "metrics" | "sustainability" | "combined",
  "colors": ["string"],
  "totalPages": number
}`;

    // Get OpenAI's analysis with improved error handling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await openAIResponse.json();
    console.log('OpenAI response received:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI: No content in response');
    }

    let config;
    try {
      const content = aiResponse.choices[0].message.content.trim();
      console.log('Attempting to parse JSON content:', content);
      config = JSON.parse(content);
      console.log('Successfully parsed configuration:', config);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw response content:', aiResponse.choices[0].message.content);
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`);
    }

    // Validate the config structure
    if (!config.sections || !Array.isArray(config.sections) || config.sections.length === 0) {
      throw new Error('Invalid configuration: sections array is required and must not be empty');
    }

    // Create a new report template with sections
    const { data: template, error: templateError } = await supabase
      .from('report_templates')
      .insert([
        {
          business_id: requestData.business_id,
          name: config.name || 'AI Generated Sustainability Report',
          description: config.description || prompt,
          config: {
            ...config,
            sections: config.sections,
            pageCount: config.sections.length + 1 // +1 for cover page
          },
          ai_generated: true,
          ai_prompt: prompt,
          visualization_config: {
            showBarCharts: true,
            showPieCharts: true,
            showTables: true,
            showTimeline: true,
          },
          report_type: config.type || 'combined',
          theme_colors: config.colors || ['#28B463', '#F39C12', '#E74C3C'],
        }
      ])
      .select()
      .single();

    if (templateError) {
      console.error('Error creating template:', templateError);
      throw templateError;
    }

    console.log('Created template with sections:', template);

    // Generate the report using the template
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert([
        {
          template_id: template.id,
          business_id: requestData.business_id,
          generated_by: requestData.created_by,
          status: 'pending',
          metadata: {
            generation_date: new Date().toISOString(),
            prompt: prompt,
            report_version: '1.0',
            sections: config.sections,
            pageCount: config.sections.length + 1
          }
        }
      ])
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw reportError;
    }

    console.log('Created report:', report);

    // Update the AI request with the success status
    const { error: finalUpdateError } = await supabase
      .from('ai_report_requests')
      .update({
        status: 'completed',
        template_id: template.id,
        generated_config: config,
      })
      .eq('id', requestId);

    if (finalUpdateError) {
      console.error('Error updating request status:', finalUpdateError);
      throw finalUpdateError;
    }

    // Trigger the report generation with the new sections
    const { error: genError } = await supabase.functions.invoke('generate-report', {
      body: { 
        report_id: report.id,
        sections: config.sections,
        pageCount: config.sections.length + 1
      }
    });

    if (genError) {
      console.error('Error triggering report generation:', genError);
      throw genError;
    }

    console.log('Successfully completed AI report generation process');

    return new Response(
      JSON.stringify({ 
        success: true, 
        templateId: template.id, 
        reportId: report.id,
        pageCount: config.sections.length + 1
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
