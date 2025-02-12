
import { ReportData } from '../types.ts';

export async function generateReportData(
  reportType: string, 
  visualConfig: Record<string, boolean>,
  businessMetrics: any,
  widgetMetrics: any[]
): Promise<ReportData> {
  const colors = ['#28B463', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#34495E'];
  
  // Group widget metrics by type
  const metricsByType = widgetMetrics.reduce((acc: any, metric: any) => {
    const type = metric.widget?.category || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(metric);
    return acc;
  }, {});

  const reportData: ReportData = {
    generated_at: new Date().toISOString(),
    metrics: {
      total_scans: businessMetrics?.total_scans || 0,
      active_users: businessMetrics?.active_users || 0,
      total_points: businessMetrics?.total_points || 0,
      // Add environmental metrics from widgets
      ...Object.fromEntries(
        widgetMetrics
          .filter(m => m.widget?.category === 'environmental')
          .map(m => [m.widget?.metric_type, m.value])
      )
    },
    charts: {},
    executive_summary: {
      key_insights: [
        `${businessMetrics?.active_users || 0} active users engaged in sustainability initiatives`,
        `Total of ${businessMetrics?.total_scans || 0} sustainable product scans`,
        `${(metricsByType.environmental?.length || 0)} environmental metrics tracked`
      ],
      performance_highlights: "Business demonstrates strong commitment to sustainability with active user engagement and comprehensive metric tracking.",
      areas_for_improvement: "Focus needed on expanding environmental metrics coverage and increasing user engagement.",
      recommendations: [
        "Implement more comprehensive environmental tracking",
        "Enhance user engagement through sustainability initiatives",
        "Expand sustainability reporting metrics"
      ]
    }
  };

  // Add metrics based on report type
  if (reportType === 'metrics' || reportType === 'combined') {
    if (visualConfig.showBarCharts) {
      // Monthly metrics from widget data
      reportData.charts.monthlyMetrics = {
        type: 'bar',
        title: 'Monthly Environmental Metrics',
        subtitle: 'Key sustainability indicators over time',
        data: widgetMetrics
          .filter(m => m.widget?.category === 'environmental')
          .slice(0, 6)
          .map((m, index) => ({
            metric: m.widget?.name || 'Metric',
            value: m.value,
            color: colors[index % colors.length],
          })),
      };
    }

    if (visualConfig.showPieCharts) {
      // Distribution of metrics by category
      const categoryData = Object.entries(metricsByType).map(([category, metrics]: [string, any[]], index) => ({
        label: category,
        value: metrics.length,
        color: colors[index % colors.length],
      }));

      reportData.charts.metricDistribution = {
        type: 'pie',
        title: 'Sustainability Metrics Distribution',
        subtitle: 'Breakdown of metrics by category',
        data: categoryData,
        legend: true,
        percentage: true
      };
    }
  }

  // Add sustainability data if applicable
  if (reportType === 'sustainability' || reportType === 'combined') {
    const environmentalMetrics = metricsByType.environmental || [];
    
    reportData.sustainability = {
      environmental_impact: environmentalMetrics.length > 5 ? 'High' : 'Medium',
      recommendations: [
        'Expand environmental metric tracking',
        'Implement real-time sustainability monitoring',
        'Enhance data collection frequency',
        'Establish clear sustainability goals',
        'Develop action plans for improvement'
      ],
      year_over_year_improvement: 15, // This should be calculated from historical data
      key_achievements: [
        `Tracking ${environmentalMetrics.length} environmental metrics`,
        `${businessMetrics?.active_users || 0} users actively participating`,
        'Implemented comprehensive sustainability reporting'
      ]
    };

    if (visualConfig.showTimeline) {
      // Create timeline data from widget metrics
      reportData.charts.sustainabilityProgress = {
        type: 'line',
        title: 'Sustainability Performance Trend',
        subtitle: 'Monthly tracking of key sustainability metrics',
        data: widgetMetrics
          .filter(m => m.widget?.category === 'environmental')
          .slice(0, 6)
          .map((m, index) => ({
            period: new Date(m.recorded_at).toLocaleDateString(),
            value: m.value,
            metric: m.widget?.name || 'Metric',
            color: colors[index % colors.length],
          })),
        metrics: ['value'],
        legend: true
      };
    }
  }

  if (visualConfig.showTables) {
    reportData.tables = {
      monthlyMetrics: {
        headers: ['Metric', 'Current Value', 'Unit', 'Category', 'Last Updated'],
        rows: widgetMetrics.slice(0, 10).map(m => [
          m.widget?.name || 'Unknown',
          m.value.toString(),
          m.widget?.unit || '-',
          m.widget?.category || 'Other',
          new Date(m.recorded_at).toLocaleDateString()
        ]),
      },
    };
  }

  return reportData;
}
