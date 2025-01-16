export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      product_audit_logs: {
        Row: {
          action: string
          blockchain_tx_id: string | null
          changes: Json | null
          created_at: string
          created_by: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          action: string
          blockchain_tx_id?: string | null
          changes?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          action?: string
          blockchain_tx_id?: string | null
          changes?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_audit_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          blockchain_hash: string | null
          blockchain_tx_id: string | null
          carbon_footprint: number
          category: string | null
          certification_level: string
          created_at: string
          id: string
          image_url: string | null
          manufacture_date: string | null
          material_composition: string | null
          name: string
          origin: string
          qr_code_id: string
          recyclability_percentage: number | null
          sustainability_score: number
          water_usage: number
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          carbon_footprint: number
          category?: string | null
          certification_level: string
          created_at?: string
          id?: string
          image_url?: string | null
          manufacture_date?: string | null
          material_composition?: string | null
          name: string
          origin: string
          qr_code_id: string
          recyclability_percentage?: number | null
          sustainability_score?: number
          water_usage: number
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          carbon_footprint?: number
          category?: string | null
          certification_level?: string
          created_at?: string
          id?: string
          image_url?: string | null
          manufacture_date?: string | null
          material_composition?: string | null
          name?: string
          origin?: string
          qr_code_id?: string
          recyclability_percentage?: number | null
          sustainability_score?: number
          water_usage?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          has_completed_onboarding: boolean | null
          id: string
          name: string | null
          preferences: Json | null
          sustainability_goals: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_completed_onboarding?: boolean | null
          id: string
          name?: string | null
          preferences?: Json | null
          sustainability_goals?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_completed_onboarding?: boolean | null
          id?: string
          name?: string | null
          preferences?: Json | null
          sustainability_goals?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          id: string
          points_spent: number
          redeemed_at: string | null
          status: string
          tier_id: string
          user_id: string
        }
        Insert: {
          id?: string
          points_spent: number
          redeemed_at?: string | null
          status?: string
          tier_id: string
          user_id: string
        }
        Update: {
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          status?: string
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          points_earned: number
          points_redeemed: number
          reward_history: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned?: number
          points_redeemed?: number
          reward_history?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number
          points_redeemed?: number
          reward_history?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          id: string
          product_id: string
          scanned_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          scanned_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          scanned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainability_impact_metrics: {
        Row: {
          avg_sustainability_score: number | null
          months_active: number | null
          total_carbon_impact: number | null
          total_water_impact: number | null
          user_id: string
        }
        Insert: {
          avg_sustainability_score?: number | null
          months_active?: number | null
          total_carbon_impact?: number | null
          total_water_impact?: number | null
          user_id: string
        }
        Update: {
          avg_sustainability_score?: number | null
          months_active?: number | null
          total_carbon_impact?: number | null
          total_water_impact?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_metrics: {
        Row: {
          active_days: number | null
          avg_daily_scans: number | null
          last_activity: string | null
          total_interactions: number | null
          user_id: string
        }
        Insert: {
          active_days?: number | null
          avg_daily_scans?: number | null
          last_activity?: string | null
          total_interactions?: number | null
          user_id: string
        }
        Update: {
          active_days?: number | null
          avg_daily_scans?: number | null
          last_activity?: string | null
          total_interactions?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      monthly_scanning_activity: {
        Row: {
          month: string | null
          scan_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_sustainability_metrics: {
        Row: {
          avg_sustainability_score: number | null
          total_carbon_saved: number | null
          total_scans: number | null
          total_water_saved: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_admin_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_analytics_data: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          total_scans: number
          unique_users: number
          avg_scans_per_user: number
          total_carbon_saved: number
          total_water_saved: number
          avg_sustainability_score: number
        }[]
      }
      get_top_products: {
        Args: {
          limit_count: number
        }
        Returns: {
          id: string
          name: string
          scan_count: number
        }[]
      }
      get_user_dashboard_stats: {
        Args: {
          user_id_param: string
        }
        Returns: {
          total_scans: number
          total_carbon_saved: number
          total_water_saved: number
          avg_sustainability_score: number
          points_earned: number
          points_redeemed: number
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_business_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      mark_notifications_as_read: {
        Args: {
          notification_ids: string[]
        }
        Returns: string[]
      }
    }
    Enums: {
      business_type: "manufacturer" | "retailer" | "distributor" | "supplier"
      notification_type: "rewards" | "sustainability_tips" | "store_alerts"
      reward_type: "discount" | "voucher" | "product" | "service"
      user_role: "admin" | "business_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
