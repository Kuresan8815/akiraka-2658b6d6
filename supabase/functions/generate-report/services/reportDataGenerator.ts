
import { ReportData } from '../types.ts';
import type { Widget } from '@/types/widgets.ts';

interface WidgetMetric {
  id: string;
  value: number;
  recorded_at: string;
  widget: Widget;
}

export async function generateReportData(
  reportType: string, 
  visualConfig: Record<string, boolean>,
  businessMetrics: any,
  widgetMetrics: WidgetMetric[]
): Promise<ReportData> {
  const colors = ['#28B463', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#34495E'];
  
  // Group widget metrics by category and type
  const metricsByCategory = widgetMetrics.reduce((acc: Record<string, WidgetMetric[]>, metric) => {
    const category = metric.widget?.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(metric);
    return acc;
  }, {});

  // Calculate environmental metrics totals and averages
  const environmentalMetrics = metricsByCategory['environmental'] || [];
  const calculateMetricAverage = (metrics: WidgetMetric[]) => {
    return metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length 
      : 0;
  };

  const reportData: ReportData = {
    generated_at: new Date().toISOString(),
    metrics: {
      total_scans: businessMetrics?.total_scans || 0,
      active_users: businessMetrics?.active_users || 0,
      total_points: businessMetrics?.total_points || 0,
      // Add environmental metrics from widgets
      environmental_metrics_count: environmentalMetrics.length,
      average_environmental_value: calculateMetricAverage(environmentalMetrics),
      // Add each environmental metric by type
      ...Object.fromEntries(
        environmentalMetrics.map(m => [
          `${m.widget.metric_type}_value`,
          m.value
        ])
      )
    },
    charts: {},
    executive_summary: {
      key_insights: [
        `${environmentalMetrics.length} environmental metrics being tracked`,
        `Latest data updated on ${new Date(
          Math.max(...environmentalMetrics.map(m => new Date(m.recorded_at).getTime()))
        ).toLocaleDateString()}`,
        `Total of ${businessMetrics?.total_scans || 0} sustainability scans recorded`,
        `${businessMetrics?.active_users || 0} active users engaged in sustainability tracking`
      ],
      performance_highlights: `The organization is actively monitoring ${environmentalMetrics.length} environmental metrics, demonstrating commitment to sustainability tracking and measurement.`,
      areas_for_improvement: environmentalMetrics.length < 5 
        ? "Consider expanding environmental metric coverage for comprehensive sustainability tracking."
        : "Focus on maintaining consistent data collection and analysis across all metrics.",
      recommendations: [
        "Continue regular metric data collection and updates",
        "Expand metric coverage across different environmental aspects",
        "Implement trend analysis for tracked metrics",
        "Set specific targets for each environmental metric"
      ]
    }
  };

  // Add metrics based on report type
  if (reportType === 'metrics' || reportType === 'combined') {
    if (visualConfig.showBarCharts) {
      // Monthly metrics from widget data
      reportData.charts.monthlyMetrics = {
        type: 'bar',
        title: 'Environmental Metrics Overview',
        subtitle: 'Current values across different metrics',
        data: environmentalMetrics.map((metric, index) => ({
          metric: metric.widget.name,
          value: metric.value,
          unit: metric.widget.unit || 'units',
          color: colors[index % colors.length],
        })),
      };
    }

    if (visualConfig.showPieCharts) {
      // Distribution of metrics by category
      const categoryDistribution = Object.entries(metricsByCategory).map(
        ([category, metrics], index) => ({
          label: category,
          value: metrics.length,
          color: colors[index % colors.length],
        })
      );

      reportData.charts.metricDistribution = {
        type: 'pie',
        title: 'Metrics Distribution by Category',
        subtitle: 'Breakdown of metrics across categories',
        data: categoryDistribution,
        legend: true,
        percentage: true
      };
    }
  }

  // Add sustainability data if applicable
  if (reportType === 'sustainability' || reportType === 'combined') {
    reportData.sustainability = {
      environmental_impact: environmentalMetrics.length > 5 ? 'High' : 'Medium',
      recommendations: [
        'Maintain regular data collection schedule',
        'Set specific targets for each metric',
        'Analyze trends and patterns in collected data',
        'Expand coverage of environmental metrics',
        'Document data collection methodologies'
      ],
      year_over_year_improvement: calculateMetricAverage(environmentalMetrics),
      key_achievements: [
        `Successfully tracking ${environmentalMetrics.length} environmental metrics`,
        `Regular data updates maintained`,
        `Comprehensive sustainability monitoring system in place`
      ]
    };

    if (visualConfig.showTimeline) {
      // Create timeline data from environmental metrics
      const timelineData = environmentalMetrics
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .slice(0, 6)
        .map((metric, index) => ({
          period: new Date(metric.recorded_at).toLocaleDateString(),
          value: metric.value,
          metric: metric.widget.name,
          color: colors[index % colors.length],
        }));

      reportData.charts.sustainabilityProgress = {
        type: 'line',
        title: 'Environmental Metrics Timeline',
        subtitle: 'Recent trends in environmental metrics',
        data: timelineData,
        metrics: ['value'],
        legend: true
      };
    }
  }

  if (visualConfig.showTables) {
    reportData.tables = {
      monthlyMetrics: {
        headers: ['Metric Name', 'Current Value', 'Unit', 'Category', 'Last Updated'],
        rows: environmentalMetrics.map(m => [
          m.widget.name,
          m.value.toString(),
          m.widget.unit || '-',
          m.widget.category,
          new Date(m.recorded_at).toLocaleDateString()
        ]),
      },
    };
  }

  return reportData;
}
