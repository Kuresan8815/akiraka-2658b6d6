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
          account_level: Database["public"]["Enums"]["account_level"]
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          account_level?: Database["public"]["Enums"]["account_level"]
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          account_level?: Database["public"]["Enums"]["account_level"]
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      ai_report_requests: {
        Row: {
          business_id: string
          created_at: string
          error_message: string | null
          generated_config: Json
          id: string
          prompt: string
          status: Database["public"]["Enums"]["report_processing_status"] | null
          template_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          error_message?: string | null
          generated_config?: Json
          id?: string
          prompt: string
          status?:
            | Database["public"]["Enums"]["report_processing_status"]
            | null
          template_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          error_message?: string | null
          generated_config?: Json
          id?: string
          prompt?: string
          status?:
            | Database["public"]["Enums"]["report_processing_status"]
            | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_report_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "ai_report_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_report_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      business_metrics: {
        Row: {
          active_users: number
          business_id: string
          created_at: string
          id: string
          total_points: number
          total_scans: number
          updated_at: string
        }
        Insert: {
          active_users?: number
          business_id: string
          created_at?: string
          id?: string
          total_points?: number
          total_scans?: number
          updated_at?: string
        }
        Update: {
          active_users?: number
          business_id?: string
          created_at?: string
          id?: string
          total_points?: number
          total_scans?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "fk_business"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_widgets: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean | null
          position: number
          updated_at: string
          widget_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          position: number
          updated_at?: string
          widget_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          position?: number
          updated_at?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_widgets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_widgets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_widgets_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      business_widgets_backup: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          position: number | null
          updated_at: string | null
          widget_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
          widget_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
          widget_id?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          activities: string[] | null
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          created_by: string
          description: string | null
          id: string
          industry_type: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          region_id: string | null
          sustainability_goals: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          activities?: string[] | null
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          industry_type: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          region_id?: string | null
          sustainability_goals?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          activities?: string[] | null
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          industry_type?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          region_id?: string | null
          sustainability_goals?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_emissions: {
        Row: {
          business_id: string
          created_at: string
          emission_source: string | null
          emission_value: number
          id: string
          recorded_date: string
          scope: Database["public"]["Enums"]["emission_scope"]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          emission_source?: string | null
          emission_value: number
          id?: string
          recorded_date?: string
          scope: Database["public"]["Enums"]["emission_scope"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          emission_source?: string | null
          emission_value?: number
          id?: string
          recorded_date?: string
          scope?: Database["public"]["Enums"]["emission_scope"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_emissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "carbon_emissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_reports: {
        Row: {
          business_id: string
          created_at: string
          date_range: Json
          generated_by: string
          id: string
          insights: Json
          pdf_url: string | null
          recommendations: Json
          report_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          date_range: Json
          generated_by: string
          id?: string
          insights?: Json
          pdf_url?: string | null
          recommendations?: Json
          report_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          date_range?: Json
          generated_by?: string
          id?: string
          insights?: Json
          pdf_url?: string | null
          recommendations?: Json
          report_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "esg_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          business_id: string
          date_range: Json | null
          file_size: number | null
          generated_at: string
          generated_by: string
          id: string
          metadata: Json | null
          page_count: number | null
          pdf_url: string | null
          report_data: Json
          status: Database["public"]["Enums"]["report_processing_status"]
          template_id: string | null
        }
        Insert: {
          business_id: string
          date_range?: Json | null
          file_size?: number | null
          generated_at?: string
          generated_by?: string
          id?: string
          metadata?: Json | null
          page_count?: number | null
          pdf_url?: string | null
          report_data?: Json
          status?: Database["public"]["Enums"]["report_processing_status"]
          template_id?: string | null
        }
        Update: {
          business_id?: string
          date_range?: Json | null
          file_size?: number | null
          generated_at?: string
          generated_by?: string
          id?: string
          metadata?: Json | null
          page_count?: number | null
          pdf_url?: string | null
          report_data?: Json
          status?: Database["public"]["Enums"]["report_processing_status"]
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "generated_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          benchmark_value: number
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at: string
          id: string
          industry_type: string
          source: string | null
          unit: string
          updated_at: string
          year: number
        }
        Insert: {
          benchmark_value: number
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          id?: string
          industry_type: string
          source?: string | null
          unit: string
          updated_at?: string
          year: number
        }
        Update: {
          benchmark_value?: number
          category?: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          id?: string
          industry_type?: string
          source?: string | null
          unit?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      industry_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry_type: string
          is_active: boolean | null
          name: string
          updated_at: string
          widget_ids: string[]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry_type: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          widget_ids: string[]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry_type?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          widget_ids?: string[]
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
          business_id: string | null
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
          updated_at: string | null
          water_usage: number
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id?: string | null
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
          updated_at?: string | null
          water_usage: number
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id?: string | null
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
          updated_at?: string | null
          water_usage?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      regional_admins: {
        Row: {
          created_at: string
          id: string
          region_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_admins_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          ai_generated: boolean | null
          ai_prompt: string | null
          business_id: string
          charts_config: Json | null
          config: Json
          created_at: string
          custom_css: string | null
          description: string | null
          font_family: string | null
          footer_text: string | null
          header_image_url: string | null
          id: string
          included_metrics: string[] | null
          is_active: boolean | null
          last_generated: string | null
          layout_type: string
          name: string
          page_orientation: string | null
          report_type: Database["public"]["Enums"]["report_type"] | null
          theme_colors: string[] | null
          updated_at: string
          visualization_config: Json | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          business_id: string
          charts_config?: Json | null
          config?: Json
          created_at?: string
          custom_css?: string | null
          description?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_image_url?: string | null
          id?: string
          included_metrics?: string[] | null
          is_active?: boolean | null
          last_generated?: string | null
          layout_type?: string
          name: string
          page_orientation?: string | null
          report_type?: Database["public"]["Enums"]["report_type"] | null
          theme_colors?: string[] | null
          updated_at?: string
          visualization_config?: Json | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          business_id?: string
          charts_config?: Json | null
          config?: Json
          created_at?: string
          custom_css?: string | null
          description?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_image_url?: string | null
          id?: string
          included_metrics?: string[] | null
          is_active?: boolean | null
          last_generated?: string | null
          layout_type?: string
          name?: string
          page_orientation?: string | null
          report_type?: Database["public"]["Enums"]["report_type"] | null
          theme_colors?: string[] | null
          updated_at?: string
          visualization_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "report_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      sustainability_goals: {
        Row: {
          business_id: string
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at: string
          current_value: number
          description: string
          id: string
          status: string
          target_date: string
          target_value: number
          updated_at: string
        }
        Insert: {
          business_id: string
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          current_value: number
          description: string
          id?: string
          status?: string
          target_date: string
          target_value: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          current_value?: number
          description?: string
          id?: string
          status?: string
          target_date?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_goals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "sustainability_goals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      sustainability_metrics: {
        Row: {
          business_id: string
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at: string
          data_source: string | null
          id: string
          metric_name: string
          notes: string | null
          recorded_at: string
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          business_id: string
          category: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          data_source?: string | null
          id?: string
          metric_name: string
          notes?: string | null
          recorded_at?: string
          unit: string
          updated_at?: string
          value: number
        }
        Update: {
          business_id?: string
          category?: Database["public"]["Enums"]["esg_metric_category"]
          created_at?: string
          data_source?: string | null
          id?: string
          metric_name?: string
          notes?: string | null
          recorded_at?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "sustainability_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      user_merchant_interactions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_merchant_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "user_merchant_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_merchant_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_metrics: {
        Row: {
          blockchain_hash: string | null
          blockchain_tx_id: string | null
          business_id: string
          created_at: string
          id: string
          recorded_at: string
          tezos_block_level: number | null
          tezos_contract_address: string | null
          tezos_operation_hash: string | null
          updated_at: string
          value: number
          widget_id: string
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id: string
          created_at?: string
          id?: string
          recorded_at?: string
          tezos_block_level?: number | null
          tezos_contract_address?: string | null
          tezos_operation_hash?: string | null
          updated_at?: string
          value: number
          widget_id: string
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id?: string
          created_at?: string
          id?: string
          recorded_at?: string
          tezos_block_level?: number | null
          tezos_contract_address?: string | null
          tezos_operation_hash?: string | null
          updated_at?: string
          value?: number
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "widget_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_metrics_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_metrics_backup: {
        Row: {
          blockchain_hash: string | null
          blockchain_tx_id: string | null
          business_id: string | null
          created_at: string | null
          id: string | null
          recorded_at: string | null
          tezos_block_level: number | null
          tezos_contract_address: string | null
          tezos_operation_hash: string | null
          updated_at: string | null
          value: number | null
          widget_id: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          recorded_at?: string | null
          tezos_block_level?: number | null
          tezos_contract_address?: string | null
          tezos_operation_hash?: string | null
          updated_at?: string | null
          value?: number | null
          widget_id?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_tx_id?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          recorded_at?: string | null
          tezos_block_level?: number | null
          tezos_contract_address?: string | null
          tezos_operation_hash?: string | null
          updated_at?: string | null
          value?: number | null
          widget_id?: string | null
        }
        Relationships: []
      }
      widgets: {
        Row: {
          category: Database["public"]["Enums"]["widget_category"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          metric_type: string
          name: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["widget_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric_type: string
          name: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["widget_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric_type?: string
          name?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      business_product_analytics: {
        Row: {
          avg_sustainability_score: number | null
          business_id: string | null
          last_scan_date: string | null
          total_products: number | null
          total_scans: number | null
        }
        Relationships: []
      }
      emissions_summary: {
        Row: {
          business_id: string | null
          month: string | null
          scope: Database["public"]["Enums"]["emission_scope"] | null
          total_emissions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_emissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "carbon_emissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_scanning_activity: {
        Row: {
          month: string | null
          scan_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_merchant_stats: {
        Row: {
          business_id: string | null
          last_interaction: string | null
          total_purchases: number | null
          total_scans: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_merchant_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_product_analytics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "user_merchant_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      business_has_products: {
        Args: {
          business_id_param: string
        }
        Returns: boolean
      }
      check_admin_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      check_admin_user_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
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
      get_emissions_summary: {
        Args: {
          business_id_param: string
        }
        Returns: {
          scope: Database["public"]["Enums"]["emission_scope"]
          monthly_total: number
          year_to_date: number
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
      is_admin_check: {
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
      is_regional_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_super_admin_no_rls: {
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
      process_pending_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      account_level: "super_admin" | "regional_admin" | "business"
      business_type:
        | "manufacturer"
        | "retailer"
        | "distributor"
        | "supplier"
        | "public_institution"
      emission_scope: "scope_1" | "scope_2" | "scope_3"
      esg_metric_category:
        | "carbon_emissions"
        | "energy_consumption"
        | "water_usage"
        | "waste_reduction"
        | "diversity_inclusion"
        | "human_capital"
        | "governance_compliance"
      esg_report_section:
        | "executive_summary"
        | "environmental_impact"
        | "social_contributions"
        | "governance_performance"
        | "future_goals"
      notification_type: "rewards" | "sustainability_tips" | "store_alerts"
      report_processing_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
      report_type: "metrics" | "sustainability" | "combined"
      reward_type: "discount" | "voucher" | "product" | "service"
      user_role: "admin" | "business_user"
      widget_category: "environmental" | "social" | "governance"
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
