import { Product } from "./product";

export interface ScanHistoryItem {
  id: string;
  product_id: string;
  scanned_at: string;
  user_id: string;
  products: Product;
}