import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';

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

    // Generate PDF for the report
    const pdfBlob = await generatePDF(reportData);
    
    // Upload PDF to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(`${business_id}/${report_id}.pdf`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('reports')
      .getPublicUrl(`${business_id}/${report_id}.pdf`);

    // Update report with generated data and PDF URL
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        report_data: reportData,
        pdf_url: publicUrl,
        file_size: pdfBlob.size,
        page_count: await getPageCount(pdfBlob)
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

async function generatePDF(reportData: any) {
  // In a real implementation, you would use a PDF library to generate the PDF
  // For this example, we'll create a simple PDF with the report data
  const { PDFDocument, rgb } = await import('https://cdn.skypack.dev/@pdf-lib/standard@^0.8.1');
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Add content to PDF
  page.drawText('ESG Performance Report', {
    x: 50,
    y: height - 50,
    size: 24
  });

  // Add executive summary
  page.drawText('Executive Summary', {
    x: 50,
    y: height - 100,
    size: 16
  });

  page.drawText(reportData.executive_summary.overview, {
    x: 50,
    y: height - 150,
    size: 12,
    maxWidth: width - 100
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function getPageCount(pdfBlob: Blob): Promise<number> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

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
