export interface Product {
  id: string;
  name: string;
  certification_level: "Bronze" | "Silver" | "Gold";
  carbon_footprint: number;
  water_usage: number;
  origin: string;
  qr_code_id: string;
  sustainability_score: number;
}