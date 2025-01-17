export interface Business {
  id: string;
  name: string;
  business_type: 'manufacturer' | 'retailer' | 'distributor' | 'supplier';
  created_at: string;
  updated_at: string;
  created_by: string;
  logo_url?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  industry_type: string;
  activities?: string[];
  sustainability_goals?: string[];
}

export interface BusinessProfile {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}