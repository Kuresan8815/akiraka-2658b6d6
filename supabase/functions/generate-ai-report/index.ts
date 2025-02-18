
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import { ChartJSNodeCanvas } from 'https://esm.sh/chartjs-node-canvas@4.1.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ESG Color Scheme
const colorScheme = {
  environmental: {
    primary: '#4F7942',    // Forest Green
    secondary: '#98FB98',  // Pale Green
    accent: '#228B22'      // Forest Green
  },
  social: {
    primary: '#4169E1',    // Royal Blue
    secondary: '#87CEEB',  // Sky Blue
    accent: '#1E90FF'      // Dodger Blue
  },
  governance: {
    primary: '#800080',    // Purple
    secondary: '#DDA0DD',  // Plum
    accent: '#9370DB'      // Medium Purple
  }
};

async function generateChartImage(data: any, category: string) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 });
  
  const configuration = {
    type: 'bar',
    data: {
      labels: data.map((m: any) => m.name),
      datasets: [{
        label: `${category.charAt(0).toUpperCase() + category.slice(1)} Metrics`,
        data: data.map((m: any) => m.value),
        backgroundColor: colorScheme[category as keyof typeof colorScheme].primary,
        borderColor: colorScheme[category as keyof typeof colorScheme].accent,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: `${category.charAt(0).toUpperCase() + category.slice(1)} Metrics Overview`
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requestId, prompt } = await req.json();
    
    if (!requestId || !prompt) {
      throw new Error('Request ID and prompt are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing request:', requestId);

    const { data: request, error: requestError } = await supabase
      .from('ai_report_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error(`Failed to get request details: ${requestError?.message || 'Request not found'}`);
    }

    // Fetch all relevant data
    const { data: businessWidgets } = await supabase
      .from('business_widgets')
      .select(`
        widget_id,
        widgets (
          id,
          name,
          description,
          category,
          unit
        )
      `)
      .eq('business_id', request.business_id)
      .eq('is_active', true);

    const { data: metrics } = await supabase
      .from('widget_metrics')
      .select('*')
      .eq('business_id', request.business_id)
      .order('recorded_at', { ascending: false });

    // Organize metrics by category
    const metricsByCategory = businessWidgets?.reduce((acc: any, bw) => {
      const widget = bw.widgets;
      if (!widget) return acc;

      const latestMetric = metrics?.find(m => m.widget_id === widget.id);
      if (!latestMetric) return acc;

      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }

      acc[widget.category].push({
        name: widget.name,
        value: latestMetric.value,
        unit: widget.unit || '',
        description: widget.description,
        recorded_at: latestMetric.recorded_at
      });

      return acc;
    }, {});

    const doc = new jsPDF();
    
    // Title and Header
    doc.setFillColor(48, 49, 51);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('ESG Performance Report', 20, 25);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add generation info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Report Focus: ${prompt.substring(0, 80)}`, 20, 52);

    let yPosition = 60;

    // Generate and add charts for each category
    for (const [category, metrics] of Object.entries(metricsByCategory || {})) {
      if (metrics.length === 0) continue;

      // Category Header
      doc.setFillColor(colorScheme[category as keyof typeof colorScheme].primary);
      doc.rect(15, yPosition, doc.internal.pageSize.width - 30, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(category.toUpperCase(), 20, yPosition + 7);
      yPosition += 15;

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Add chart
      try {
        const chartImage = await generateChartImage(metrics, category);
        doc.addImage(chartImage, 'PNG', 20, yPosition, 170, 100);
        yPosition += 110;
      } catch (error) {
        console.error(`Error generating chart for ${category}:`, error);
      }

      // Metrics Table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      metrics.forEach((metric: any) => {
        doc.text(`${metric.name}: ${metric.value} ${metric.unit}`, 25, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    }

    // Add insights and recommendations
    doc.addPage();
    
    // Insights Header
    doc.setFillColor(48, 49, 51);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Insights & Recommendations', 20, 15);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    const recommendations = [
      "Optimize resource efficiency based on current metrics",
      "Enhance sustainability reporting transparency",
      "Implement data-driven improvement strategies",
      "Regular monitoring and updates of ESG metrics"
    ];

    yPosition = 40;
    doc.setFontSize(12);
    recommendations.forEach((rec, index) => {
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${rec}`, 20, yPosition);
      yPosition += 10;
    });

    // Convert and upload PDF
    const pdfBytes = doc.output('arraybuffer');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `esg-report-${timestamp}.pdf`;

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

    const { data: { publicUrl: pdfUrl } } = await supabase
      .storage
      .from('reports')
      .getPublicUrl(fileName);

    // Create report entry
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        template_id: null,
        business_id: request.business_id,
        status: 'completed',
        report_data: {
          metrics: metricsByCategory,
          generated_at: new Date().toISOString(),
          recommendations
        },
        pdf_url: pdfUrl,
        file_size: pdfBytes.byteLength,
        page_count: doc.internal.getNumberOfPages(),
        metadata: {
          ai_generated: true,
          prompt,
          requestId,
          metrics_count: Object.values(metricsByCategory || {}).flat().length
        }
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    // Update request status
    await supabase
      .from('ai_report_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
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
