
export interface MetricData {
  id: string;
  value: number;
  recorded_at: string;
  tezos_operation_hash?: string;
  tezos_block_level?: number;
  tezos_contract_address?: string;
}

export interface Widget {
  id: string;
  name: string;
  description: string;
  category: "environmental" | "social" | "governance";
  unit: string;
}
