export interface Widget {
  id: string;
  name: string;
  description: string;
  category: 'environmental' | 'social' | 'governance';
  metric_type: string;
  unit: string;
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