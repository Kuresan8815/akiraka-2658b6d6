
export type ReportTemplate = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  layout_type: 'standard' | 'infographic' | 'custom';
  included_metrics: string[];
  theme_colors: string[];
  last_generated: string | null;
  header_image_url: string | null;
  footer_text: string | null;
  font_family: string | null;
  custom_css: string | null;
  page_orientation: 'portrait' | 'landscape' | null;
  charts_config: Record<string, any>[] | null;
  report_type: 'metrics' | 'sustainability' | 'combined';
  visualization_config: {
    showBarCharts: boolean;
    showPieCharts: boolean;
    showTables: boolean;
    showTimeline: boolean;
  };
  ai_generated?: boolean;
  ai_prompt?: string;
};

export type GeneratedReport = {
  id: string;
  template_id: string | null;
  business_id: string;
  generated_at: string;
  report_data: Record<string, any>;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_by: string;
  date_range: {
    start: string;
    end: string;
  } | null;
  metadata: Record<string, any> | null;
  file_size: number | null;
  page_count: number | null;
};

