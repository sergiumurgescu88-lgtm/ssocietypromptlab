export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          metric: string
          name: string
          results_json: Json | null
          sample_size: number | null
          status: string | null
          target_model: string | null
          updated_at: string
          user_id: string
          variants: Json
          winner_variant: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metric?: string
          name: string
          results_json?: Json | null
          sample_size?: number | null
          status?: string | null
          target_model?: string | null
          updated_at?: string
          user_id: string
          variants?: Json
          winner_variant?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metric?: string
          name?: string
          results_json?: Json | null
          sample_size?: number | null
          status?: string | null
          target_model?: string | null
          updated_at?: string
          user_id?: string
          variants?: Json
          winner_variant?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata_json: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata_json?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          id: string
          label: string | null
          provider: Database["public"]["Enums"]["api_provider"]
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          id?: string
          label?: string | null
          provider: Database["public"]["Enums"]["api_provider"]
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          id?: string
          label?: string | null
          provider?: Database["public"]["Enums"]["api_provider"]
          user_id?: string
        }
        Relationships: []
      }
      marketplace_prompts: {
        Row: {
          category: string | null
          content_preview: string
          created_at: string
          creator_id: string
          description: string
          id: string
          model_compatibility: string[] | null
          price: number
          prompt_id: string | null
          rating: number | null
          ratings_count: number | null
          sales_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_preview?: string
          created_at?: string
          creator_id: string
          description?: string
          id?: string
          model_compatibility?: string[] | null
          price?: number
          prompt_id?: string | null
          rating?: number | null
          ratings_count?: number | null
          sales_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_preview?: string
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          model_compatibility?: string[] | null
          price?: number
          prompt_id?: string | null
          rating?: number | null
          ratings_count?: number | null
          sales_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          expertise: string[] | null
          full_name: string | null
          id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt_id: string
          settings: Json | null
          system_prompt: string | null
          version_num: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt_id: string
          settings?: Json | null
          system_prompt?: string | null
          version_num?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string
          settings?: Json | null
          system_prompt?: string | null
          version_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          default_model: string | null
          default_settings: Json | null
          id: string
          status: string | null
          system_prompt: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          uses: number | null
          win_rate: number | null
        }
        Insert: {
          content: string
          created_at?: string
          default_model?: string | null
          default_settings?: Json | null
          id?: string
          status?: string | null
          system_prompt?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          uses?: number | null
          win_rate?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          default_model?: string | null
          default_settings?: Json | null
          id?: string
          status?: string | null
          system_prompt?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          uses?: number | null
          win_rate?: number | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          buyer_id: string
          creator_payout: number
          id: string
          license_key: string
          marketplace_prompt_id: string
          platform_fee: number
          purchased_at: string
        }
        Insert: {
          amount?: number
          buyer_id: string
          creator_payout?: number
          id?: string
          license_key?: string
          marketplace_prompt_id: string
          platform_fee?: number
          purchased_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          creator_payout?: number
          id?: string
          license_key?: string
          marketplace_prompt_id?: string
          platform_fee?: number
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_marketplace_prompt_id_fkey"
            columns: ["marketplace_prompt_id"]
            isOneToOne: false
            referencedRelation: "marketplace_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          marketplace_prompt_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          marketplace_prompt_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          marketplace_prompt_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_marketplace_prompt_id_fkey"
            columns: ["marketplace_prompt_id"]
            isOneToOne: false
            referencedRelation: "marketplace_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          created_at: string
          id: string
          input_text: string
          latency: number | null
          metadata: Json | null
          output_text: string | null
          score: number | null
          test_id: string
          tokens: number | null
          variant_index: number
        }
        Insert: {
          created_at?: string
          id?: string
          input_text: string
          latency?: number | null
          metadata?: Json | null
          output_text?: string | null
          score?: number | null
          test_id: string
          tokens?: number | null
          variant_index: number
        }
        Update: {
          created_at?: string
          id?: string
          input_text?: string
          latency?: number | null
          metadata?: Json | null
          output_text?: string | null
          score?: number | null
          test_id?: string
          tokens?: number | null
          variant_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action: string
          cost: number | null
          created_at: string
          id: string
          model: string | null
          tokens: number | null
          user_id: string
        }
        Insert: {
          action: string
          cost?: number | null
          created_at?: string
          id?: string
          model?: string | null
          tokens?: number | null
          user_id: string
        }
        Update: {
          action?: string
          cost?: number | null
          created_at?: string
          id?: string
          model?: string | null
          tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      api_provider: "openai" | "gemini" | "mistral" | "deepseek" | "anthropic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      api_provider: ["openai", "gemini", "mistral", "deepseek", "anthropic"],
    },
  },
} as const
