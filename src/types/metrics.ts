
export type MetricCategory = "environmental" | "social" | "governance";

export interface MetricRow {
  id: string;
  name: string;
  unit: string;
  value: number | string;
  lastUpdated: string;
  isEditing?: boolean;
  blockchain_hash?: string;
  blockchain_tx_id?: string;
}

export interface MetricHistoryRecord {
  id: string;
  value: number;
  recorded_at: string;
  blockchain_hash?: string;
  blockchain_tx_id?: string;
}
