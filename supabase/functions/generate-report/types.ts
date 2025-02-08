
export interface ReportTemplate {
  name: string;
  report_type: 'metrics' | 'sustainability' | 'combined';
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
}
