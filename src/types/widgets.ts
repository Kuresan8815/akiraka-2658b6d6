export interface Widget {
  id: string;
  name: string;
  description: string | null;
  category: 'environmental' | 'social' | 'governance';
  metric_type: string;
  unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessWidget {
  id: string;
  widget_id: string;
  position: number;
  widget: Widget;
  latest_value?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  industry_type: string;
  widget_ids: string[];
}