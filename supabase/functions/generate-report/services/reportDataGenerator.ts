
import { ReportData } from '../types.ts';

export async function generateReportData(reportType: string, visualConfig: Record<string, boolean>): Promise<ReportData> {
  const colors = ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
  const reportData: ReportData = {
    generated_at: new Date().toISOString(),
    metrics: {},
    charts: {},
    executive_summary: {
      key_insights: [
        "15% improvement in overall sustainability score",
        "20% reduction in carbon emissions year-over-year",
        "30% increase in renewable energy usage"
      ],
      performance_highlights: "Significant progress in environmental metrics with notable improvements in waste reduction and energy efficiency.",
      areas_for_improvement: "Focus needed on water conservation and supply chain sustainability.",
      recommendations: [
        "Implement water recycling systems across facilities",
        "Expand renewable energy infrastructure",
        "Enhance supplier sustainability assessment program"
      ]
    }
  };

  // Add metrics based on report type
  if (reportType === 'metrics' || reportType === 'combined') {
    reportData.metrics = {
      total_emissions: 1000,
      water_usage: 5000,
      sustainability_score: 85,
      renewable_energy_percentage: 45,
      waste_recycled_percentage: 78,
      supplier_compliance_rate: 92
    };

    if (visualConfig.showBarCharts) {
      // Monthly Emissions Bar Chart
      reportData.charts.monthlyEmissions = {
        type: 'bar',
        title: 'Monthly Carbon Emissions',
        subtitle: 'Tracking monthly carbon footprint (in metric tons)',
        data: [
          { month: 'Jan', value: 850, color: colors[0], trend: -5 },
          { month: 'Feb', value: 920, color: colors[1], trend: +8 },
          { month: 'Mar', value: 780, color: colors[2], trend: -15 },
          { month: 'Apr', value: 850, color: colors[3], trend: +9 },
          { month: 'May', value: 920, color: colors[4], trend: +8 },
          { month: 'Jun', value: 780, color: colors[5], trend: -15 },
        ],
      };

      // ESG Score Breakdown
      reportData.charts.esgScoreBreakdown = {
        type: 'stacked-bar',
        title: 'ESG Score Components',
        subtitle: 'Breakdown of Environmental, Social, and Governance scores',
        data: [
          { 
            period: 'Q1',
            environmental: 82,
            social: 75,
            governance: 88,
            colors: [colors[0], colors[1], colors[2]]
          },
          { 
            period: 'Q2',
            environmental: 85,
            social: 78,
            governance: 90,
            colors: [colors[0], colors[1], colors[2]]
          },
          { 
            period: 'Q3',
            environmental: 88,
            social: 80,
            governance: 92,
            colors: [colors[0], colors[1], colors[2]]
          }
        ]
      };
    }

    if (visualConfig.showPieCharts) {
      reportData.charts.resourceDistribution = {
        type: 'pie',
        title: 'Resource Utilization Distribution',
        subtitle: 'Breakdown of resource consumption by category',
        data: [
          { label: 'Water Usage', value: 35, color: colors[0] },
          { label: 'Energy Consumption', value: 45, color: colors[1] },
          { label: 'Raw Materials', value: 20, color: colors[2] },
        ],
        legend: true,
        percentage: true
      };

      reportData.charts.sustainabilityInitiatives = {
        type: 'pie',
        title: 'Sustainability Initiatives Impact',
        subtitle: 'Distribution of environmental impact reduction by initiative',
        data: [
          { label: 'Renewable Energy', value: 40, color: colors[3] },
          { label: 'Waste Reduction', value: 30, color: colors[4] },
          { label: 'Water Conservation', value: 30, color: colors[5] },
        ],
        legend: true,
        percentage: true
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
        'Implement supplier sustainability program',
        'Enhance carbon offset initiatives'
      ],
      year_over_year_improvement: 15,
      key_achievements: [
        'Reduced carbon emissions by 20%',
        'Increased renewable energy usage by 30%',
        'Implemented comprehensive recycling program'
      ]
    };

    if (visualConfig.showTimeline) {
      reportData.charts.sustainabilityProgress = {
        type: 'line',
        title: 'Sustainability Performance Trend',
        subtitle: 'Monthly tracking of key sustainability metrics',
        data: [
          { period: 'Jan', score: 75, emissions: 100, water: 80, color: colors[0] },
          { period: 'Feb', score: 78, emissions: 95, water: 82, color: colors[1] },
          { period: 'Mar', score: 82, emissions: 90, water: 85, color: colors[2] },
          { period: 'Apr', score: 85, emissions: 85, water: 88, color: colors[3] },
          { period: 'May', score: 87, emissions: 82, water: 90, color: colors[4] },
          { period: 'Jun', score: 90, emissions: 80, water: 92, color: colors[5] },
        ],
        metrics: ['score', 'emissions', 'water'],
        legend: true
      };
    }
  }

  if (visualConfig.showTables) {
    reportData.tables = {
      monthlyMetrics: {
        headers: ['Period', 'Emissions (CO₂e)', 'Water Usage (kL)', 'Energy (MWh)', 'Score'],
        rows: [
          ['Q1 2024', '850 tons', '4,500', '1,200', '82'],
          ['Q2 2024', '920 tons', '4,800', '1,150', '80'],
          ['Q3 2024', '780 tons', '4,200', '1,100', '85'],
          ['Q4 2024', '750 tons', '4,000', '1,050', '88'],
        ],
      },
    };
  }

  return reportData;
}
