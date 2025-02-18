
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

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

    // Generate a basic PDF using jsPDF
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(20);
    doc.text('AI Generated Sustainability Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 30);
    doc.text('Based on prompt: ' + prompt.substring(0, 80), 20, 40);
    
    // Add sections
    doc.setFontSize(16);
    doc.text('Environmental Metrics', 20, 60);
    doc.setFontSize(12);
    doc.text('Carbon Footprint: 150 tons CO2e', 30, 70);
    doc.text('Water Usage: 50,000 gallons', 30, 80);
    
    doc.setFontSize(16);
    doc.text('Social Metrics', 20, 100);
    doc.setFontSize(12);
    doc.text('Employee Satisfaction: 85%', 30, 110);
    doc.text('Community Impact: High', 30, 120);
    
    doc.setFontSize(16);
    doc.text('Governance Metrics', 20, 140);
    doc.setFontSize(12);
    doc.text('Policy Compliance: 98%', 30, 150);
    doc.text('Risk Management Score: 92/100', 30, 160);
    
    // Add recommendations
    doc.setFontSize(16);
    doc.text('Recommendations', 20, 180);
    doc.setFontSize(12);
    doc.text('1. Implement renewable energy solutions', 30, 190);
    doc.text('2. Enhance water conservation measures', 30, 200);
    doc.text('3. Expand community engagement programs', 30, 210);

    // Convert PDF to bytes
    const pdfBytes = doc.output('arraybuffer');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}.pdf`;

    // Upload the PDF to storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, pdfBytes, {
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
        template_id: null, // We don't create or use a template for AI-generated reports
        business_id: request.business_id,
        status: 'completed',
        report_data: mockReportData,
        pdf_url: pdfUrl,
        file_size: pdfBytes.byteLength,
        page_count: 1,
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

    // Update the AI request status
    await supabase
      .from('ai_report_requests')
      .update({
        status: 'completed'
      })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({
        success: true,
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
