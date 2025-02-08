
import { ReportData } from '../types.ts';

export async function generateReportData(reportType: string, visualConfig: Record<string, boolean>): Promise<ReportData> {
  const colors = ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
  const reportData: ReportData = {
    generated_at: new Date().toISOString(),
    metrics: {},
    charts: {},
  };

  // Add metrics based on report type
  if (reportType === 'metrics' || reportType === 'combined') {
    reportData.metrics = {
      total_emissions: 1000,
      water_usage: 5000,
      sustainability_score: 85,
    };

    if (visualConfig.showBarCharts) {
      reportData.charts.monthlyEmissions = {
        type: 'bar',
        title: 'Monthly Emissions',
        data: [
          { month: 'Jan', value: 850, color: colors[0] },
          { month: 'Feb', value: 920, color: colors[1] },
          { month: 'Mar', value: 780, color: colors[2] },
          { month: 'Apr', value: 850, color: colors[3] },
          { month: 'May', value: 920, color: colors[4] },
          { month: 'Jun', value: 780, color: colors[5] },
        ],
      };
    }

    if (visualConfig.showPieCharts) {
      reportData.charts.resourceDistribution = {
        type: 'pie',
        title: 'Resource Distribution',
        data: [
          { label: 'Water', value: 35, color: colors[0] },
          { label: 'Energy', value: 45, color: colors[1] },
          { label: 'Materials', value: 20, color: colors[2] },
        ],
      };
    }
  }

  // Add sustainability data if applicable
  if (reportType === 'sustainability' || reportType === 'combined') {
    reportData.sustainability = {
      environmental_impact: 'Medium',
      recommendations: [
        'Implement water recycling system',
        'Switch to renewable energy sources',
        'Optimize waste management',
      ],
      year_over_year_improvement: 15,
    };

    if (visualConfig.showTimeline) {
      reportData.charts.sustainabilityProgress = {
        type: 'line',
        title: 'Sustainability Progress',
        data: [
          { quarter: 'Q1', score: 75, color: colors[0] },
          { quarter: 'Q2', score: 78, color: colors[1] },
          { quarter: 'Q3', score: 82, color: colors[2] },
          { quarter: 'Q4', score: 85, color: colors[3] },
        ],
      };
    }
  }

  if (visualConfig.showTables) {
    reportData.tables = {
      monthlyMetrics: {
        headers: ['Month', 'Emissions', 'Water Usage', 'Score'],
        rows: [
          ['January', '850kg', '4500L', '82'],
          ['February', '920kg', '4800L', '80'],
          ['March', '780kg', '4200L', '85'],
        ],
      },
    };
  }

  return reportData;
}

