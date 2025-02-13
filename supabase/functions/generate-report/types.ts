
export interface ReportTemplate {
  name: string;
  report_type: 'metrics' | 'sustainability' | 'combined' | 'esg';
  visualization_config: {
    showBarCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
  };
  page_orientation: 'portrait' | 'landscape';
  theme_colors: string[];
}

export interface ExecutiveSummary {
  key_insights: string[];
  performance_highlights: string;
  areas_for_improvement: string;
  recommendations: string[];
}

export interface ESGMetrics {
  environmental: {
    carbon_emissions: number;
    energy_consumption: number;
    water_usage: number;
    waste_reduction: number;
  };
  social: {
    diversity_inclusion: number;
    human_capital: number;
    community_engagement: number;
  };
  governance: {
    compliance_rate: number;
    ethical_practices: number;
    transparency_score: number;
  };
}

export interface ESGReport {
  business_name: string;
  date_range: {
    start: string;
    end: string;
  };
  executive_summary: ExecutiveSummary;
  metrics: ESGMetrics;
  charts: {
    [key: string]: {
      type: 'bar' | 'line' | 'pie';
      title: string;
      subtitle?: string;
      data: Array<{
        label: string;
        value: number;
        color?: string;
        timestamp?: string;
      }>;
    };
  };
  goals: Array<{
    category: string;
    target: number;
    current: number;
    deadline: string;
    status: string;
  }>;
  industry_benchmarks: Array<{
    category: string;
    benchmark: number;
    current: number;
    unit: string;
  }>;
}

export interface ReportData {
  metrics: Record<string, number>;
  charts?: Record<string, any>;
  sustainability?: {
    environmental_impact: string;
    recommendations: string[];
    year_over_year_improvement: number;
    key_achievements: string[];
  };
  tables?: {
    monthlyMetrics: {
      headers: string[];
      rows: string[][];
    };
  };
  generated_at?: string;
  executive_summary?: ExecutiveSummary;
  esg_report?: ESGReport;
}
