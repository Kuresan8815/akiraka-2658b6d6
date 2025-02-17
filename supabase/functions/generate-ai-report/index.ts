
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requestId, prompt } = await req.json();
    
    if (!requestId || !prompt) {
      throw new Error('Request ID and prompt are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing request:', requestId);

    // Get the AI report request details
    const { data: request, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error(`Failed to get request details: ${requestError?.message || 'Request not found'}`);
    }

    // Create a report template
    const { data: template, error: templateError } = await supabase
      .from('report_templates')
      .insert({
        business_id: request.business_id,
        name: `AI Generated Report - ${new Date().toLocaleDateString()}`,
        description: `Auto-generated report based on prompt: ${prompt.substring(0, 100)}...`,
        report_type: 'combined',
        layout_type: 'standard',
        visualization_config: {
          showBarCharts: true,
          showPieCharts: true,
          showTables: true,
          showTimeline: true
        },
        ai_generated: true,
        ai_prompt: prompt,
        theme_colors: ['#4F46E5', '#10B981', '#6366F1', '#8B5CF6']
      })
      .select()
      .single();

    if (templateError) {
      throw new Error(`Failed to create template: ${templateError.message}`);
    }

    // Create an initial report entry
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        template_id: template.id,
        business_id: request.business_id,
        status: 'pending',
        metadata: {
          ai_generated: true,
          prompt: prompt,
          requestId: requestId
        }
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    // Update the AI request with the template ID
    await supabase
      .from('ai_report_requests')
      .update({
        status: 'processing',
        template_id: template.id
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({
        success: true,
        templateId: template.id,
        reportId: report.id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
