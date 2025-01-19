export type AccountLevel = 'super_admin' | 'regional_admin' | 'business';

export interface Region {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
}

export interface RegionalAdmin {
  id: string;
  user_id: string;
  region_id: string;
  created_at: string;
  updated_at: string;
}