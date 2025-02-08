
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the AI request details
    const { data: requestData, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Update request status to processing
    await supabase
      .from('ai_report_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    // Use OpenAI to analyze the prompt and generate report configuration
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a report configuration expert. Convert user requests into structured report configurations. 
            Focus on visualization types, metrics, and layout preferences. Return only valid JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const aiResponse = await openAIResponse.json();
    const config = JSON.parse(aiResponse.choices[0].message.content);

    // Create a new report template
    const { data: template, error: templateError } = await supabase
      .from('report_templates')
      .insert([
        {
          business_id: requestData.business_id,
          name: config.name || 'AI Generated Report',
          description: config.description || prompt,
          config: config,
          ai_generated: true,
          ai_prompt: prompt,
          visualization_config: {
            showBarCharts: config.visualizations?.includes('bar') ?? true,
            showPieCharts: config.visualizations?.includes('pie') ?? true,
            showTables: config.visualizations?.includes('table') ?? true,
            showTimeline: config.visualizations?.includes('timeline') ?? true,
          },
          report_type: config.type || 'combined',
          theme_colors: config.colors || ['#9b87f5', '#7E69AB', '#6E59A5'],
        }
      ])
      .select()
      .single();

    if (templateError) throw templateError;

    // Generate the report using the template
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert([
        {
          template_id: template.id,
          business_id: requestData.business_id,
          generated_by: requestData.business_id,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (reportError) throw reportError;

    // Update the AI request with the success status
    await supabase
      .from('ai_report_requests')
      .update({
        status: 'completed',
        template_id: template.id,
        generated_config: config,
      })
      .eq('id', requestId);

    // Trigger the report generation
    const { error: genError } = await supabase.functions.invoke('generate-report', {
      body: { report_id: report.id }
    });

    if (genError) throw genError;

    return new Response(
      JSON.stringify({ success: true, templateId: template.id, reportId: report.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
