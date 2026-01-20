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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          environmental_context: Json | null
          expires_at: string | null
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          priority: string | null
          related_habit_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environmental_context?: Json | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: string | null
          related_habit_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          environmental_context?: Json | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: string | null
          related_habit_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      air_quality_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          location_id: string | null
          threshold_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "air_quality_alerts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "saved_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      algorithm_calibrations: {
        Row: {
          accuracy_after: number | null
          accuracy_before: number | null
          calibration_notes: string | null
          calibration_type: string
          created_at: string
          data_points_analyzed: number | null
          id: string
          improvement_percentage: number | null
          new_values: Json
          previous_values: Json
          triggered_by: string | null
        }
        Insert: {
          accuracy_after?: number | null
          accuracy_before?: number | null
          calibration_notes?: string | null
          calibration_type: string
          created_at?: string
          data_points_analyzed?: number | null
          id?: string
          improvement_percentage?: number | null
          new_values?: Json
          previous_values?: Json
          triggered_by?: string | null
        }
        Update: {
          accuracy_after?: number | null
          accuracy_before?: number | null
          calibration_notes?: string | null
          calibration_type?: string
          created_at?: string
          data_points_analyzed?: number | null
          id?: string
          improvement_percentage?: number | null
          new_values?: Json
          previous_values?: Json
          triggered_by?: string | null
        }
        Relationships: []
      }
      anonymous_actions: {
        Row: {
          action_type: string
          created_at: string
          fingerprint: string
          id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          fingerprint: string
          id?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          fingerprint?: string
          id?: string
        }
        Relationships: []
      }
      api_key_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          request_ip: string | null
          request_params: Json | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          request_ip?: string | null
          request_params?: Json | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          request_ip?: string | null
          request_params?: Json | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      base_models: {
        Row: {
          architecture: Json
          created_at: string
          default_hyperparameters: Json | null
          description: string
          id: string
          input_requirements: Json | null
          is_active: boolean | null
          model_type: string
          name: string
          quantum_enhanced: boolean | null
        }
        Insert: {
          architecture: Json
          created_at?: string
          default_hyperparameters?: Json | null
          description: string
          id?: string
          input_requirements?: Json | null
          is_active?: boolean | null
          model_type: string
          name: string
          quantum_enhanced?: boolean | null
        }
        Update: {
          architecture?: Json
          created_at?: string
          default_hyperparameters?: Json | null
          description?: string
          id?: string
          input_requirements?: Json | null
          is_active?: boolean | null
          model_type?: string
          name?: string
          quantum_enhanced?: boolean | null
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string | null
          last_read_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          topic?: string | null
        }
        Relationships: []
      }
      models: {
        Row: {
          base_accuracy: number
          base_latency: number
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          base_accuracy: number
          base_latency: number
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          base_accuracy?: number
          base_latency?: number
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      model_metrics: {
        Row: {
          accuracy: number
          id: string
          latency: number
          model_id: string | null
          timestamp: string | null
        }
        Insert: {
          accuracy: number
          id?: string
          latency: number
          model_id?: string | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number
          id?: string
          latency?: number
          model_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_metrics_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_accuracy_log: {
        Row: {
          accuracy_score: number | null
          actual_value: number | null
          created_at: string
          deviation_percentage: number | null
          environmental_context: Json | null
          id: string
          location_name: string
          predicted_value: number
          prediction_made_at: string
          prediction_type: string
          user_id: string | null
          verified_at: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_value?: number | null
          created_at?: string
          deviation_percentage?: number | null
          environmental_context?: Json | null
          id?: string
          location_name: string
          predicted_value: number
          prediction_made_at?: string
          prediction_type: string
          user_id?: string | null
          verified_at?: string
        }
        Update: {
          accuracy_score?: number | null
          actual_value?: number | null
          created_at?: string
          deviation_percentage?: number | null
          environmental_context?: Json | null
          id?: string
          location_name?: string
          predicted_value?: number
          prediction_made_at?: string
          prediction_type?: string
          user_id?: string | null
          verified_at?: string
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
      app_role: "user" | "professional" | "admin"
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
