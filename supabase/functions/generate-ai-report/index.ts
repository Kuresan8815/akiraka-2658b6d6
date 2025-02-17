
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

    // Generate mock report data (this would be replaced with actual AI-generated content)
    const mockReportData = {
      summary: "This is an AI-generated sustainability report.",
      metrics: {
        environmental: [
          { name: "Carbon Footprint", value: "150 tons CO2e" },
          { name: "Water Usage", value: "50,000 gallons" }
        ],
        social: [
          { name: "Employee Satisfaction", value: "85%" },
          { name: "Community Impact", value: "High" }
        ],
        governance: [
          { name: "Policy Compliance", value: "98%" },
          { name: "Risk Management Score", value: "92/100" }
        ]
      },
      recommendations: [
        "Implement renewable energy solutions",
        "Enhance water conservation measures",
        "Expand community engagement programs"
      ]
    };

    // First, create a storage bucket if it doesn't exist
    const { data: bucketExists } = await supabase
      .storage
      .listBuckets();
    
    if (!bucketExists?.find(b => b.name === 'reports')) {
      await supabase
        .storage
        .createBucket('reports', {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
    }

    // Generate a mock PDF file (this would be replaced with actual PDF generation)
    const mockPdfContent = new Uint8Array([80, 68, 70]); // Simple PDF header bytes
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}.pdf`;

    // Upload the mock PDF to storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, mockPdfContent, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Get a public URL for the uploaded file
    const { data: { publicUrl: pdfUrl } } = await supabase
      .storage
      .from('reports')
      .getPublicUrl(fileName);

    // Create a completed report entry
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        template_id: template.id,
        business_id: request.business_id,
        status: 'completed',
        report_data: mockReportData,
        pdf_url: pdfUrl,
        file_size: mockPdfContent.length,
        page_count: 5, // Mock page count
        metadata: {
          ai_generated: true,
          prompt: prompt,
          requestId: requestId,
          generation_date: new Date().toISOString(),
          version: '1.0'
        }
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    // Update the AI request with the template ID and completed status
    await supabase
      .from('ai_report_requests')
      .update({
        status: 'completed',
        template_id: template.id
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({
        success: true,
        templateId: template.id,
        reportId: report.id,
        report: mockReportData,
        pdfUrl
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
