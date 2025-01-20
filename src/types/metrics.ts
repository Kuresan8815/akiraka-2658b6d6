export type MetricCategory = "environmental" | "social" | "governance";

export interface MetricRow {
  id: string;
  name: string;
  unit: string;
  value: number | string;
  lastUpdated: string;
  isEditing?: boolean;
}

export interface MetricHistoryRecord {
  id: string;
  value: number;
  recorded_at: string;
}