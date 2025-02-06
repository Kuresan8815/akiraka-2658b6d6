
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
};

export type GeneratedReport = {
  id: string;
  template_id: string;
  business_id: string;
  generated_at: string;
  report_data: Record<string, any>;
  pdf_url: string | null;
  status: 'pending' | 'completed' | 'failed';
  generated_by: string;
  date_range: {
    start: string;
    end: string;
  } | null;
};
