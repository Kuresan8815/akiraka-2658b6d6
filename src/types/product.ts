export interface Product {
  id: string;
  name: string;
  certification_level: "Bronze" | "Silver" | "Gold";
  carbon_footprint: number;
  water_usage: number;
  origin: string;
  qr_code_id: string;
  sustainability_score: number;
  category?: string;
  material_composition?: string;
  recyclability_percentage?: number;
  manufacture_date?: string;
  image_url?: string;
  blockchain_hash?: string;
  blockchain_tx_id?: string;
  created_at: string;
}