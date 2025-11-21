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
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          name: string
          room_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          name: string
          room_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          name?: string
          room_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatroom_members: {
        Row: {
          chatroom_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          chatroom_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          chatroom_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatroom_members_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chatrooms: {
        Row: {
          created_at: string | null
          created_by: string
          encryption_key: string | null
          id: string
          is_encrypted: boolean | null
          is_group: boolean | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          encryption_key?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_group?: boolean | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          encryption_key?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_group?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          columns_info: Json | null
          created_at: string
          data_type: string
          description: string | null
          file_path: string
          file_size: number | null
          format: string
          id: string
          is_public: boolean | null
          name: string
          preprocessing_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          columns_info?: Json | null
          created_at?: string
          data_type: string
          description?: string | null
          file_path: string
          file_size?: number | null
          format: string
          id?: string
          is_public?: boolean | null
          name: string
          preprocessing_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          columns_info?: Json | null
          created_at?: string
          data_type?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          format?: string
          id?: string
          is_public?: boolean | null
          name?: string
          preprocessing_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      environmental_alerts: {
        Row: {
          alert_type: string
          created_at: string
          environmental_data: Json | null
          id: string
          is_sent: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          message: string
          sent_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          environmental_data?: Json | null
          id?: string
          is_sent?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message: string
          sent_at?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          environmental_data?: Json | null
          id?: string
          is_sent?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          message?: string
          sent_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      environmental_data: {
        Row: {
          created_at: string
          data: Json
          data_type: string
          id: string
          latitude: number
          location_name: string
          longitude: number
          recorded_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          data_type: string
          id?: string
          latitude: number
          location_name: string
          longitude: number
          recorded_at: string
        }
        Update: {
          created_at?: string
          data?: Json
          data_type?: string
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          recorded_at?: string
        }
        Relationships: []
      }
      exported_models: {
        Row: {
          created_at: string
          description: string | null
          download_count: number | null
          format: string
          id: string
          is_public: boolean | null
          model_path: string
          name: string
          performance_metrics: Json | null
          training_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          format: string
          id?: string
          is_public?: boolean | null
          model_path: string
          name: string
          performance_metrics?: Json | null
          training_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          format?: string
          id?: string
          is_public?: boolean | null
          model_path?: string
          name?: string
          performance_metrics?: Json | null
          training_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exported_models_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      habit_patterns: {
        Row: {
          activity_type: string | null
          created_at: string
          day_of_week: number
          duration_minutes: number | null
          environmental_aqi: number | null
          environmental_temp: number | null
          id: string
          location_lat: number
          location_lng: number
          time_of_day: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          day_of_week: number
          duration_minutes?: number | null
          environmental_aqi?: number | null
          environmental_temp?: number | null
          id?: string
          location_lat: number
          location_lng: number
          time_of_day: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          day_of_week?: number
          duration_minutes?: number | null
          environmental_aqi?: number | null
          environmental_temp?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          time_of_day?: string
          user_id?: string
        }
        Relationships: []
      }
      learned_habits: {
        Row: {
          accepted: boolean | null
          confidence_score: number
          created_at: string
          habit_name: string
          id: string
          pattern_data: Json
          suggested_at: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          confidence_score: number
          created_at?: string
          habit_name: string
          id?: string
          pattern_data: Json
          suggested_at?: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          confidence_score?: number
          created_at?: string
          habit_name?: string
          id?: string
          pattern_data?: Json
          suggested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reel_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      location_history: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_minutes: number | null
          id: string
          latitude: number
          location_name: string | null
          longitude: number
          timestamp: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          latitude: number
          location_name?: string | null
          longitude: number
          timestamp?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chatroom_id: string | null
          content: string
          created_at: string | null
          id: string
          is_encrypted: boolean | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          chatroom_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chatroom_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          images: string[] | null
          likes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          likes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          likes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          availability_status: string | null
          bio: string | null
          created_at: string | null
          expertise: string[]
          id: string
          is_verified: boolean | null
          organization: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string | null
          expertise: string[]
          id?: string
          is_verified?: boolean | null
          organization?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[]
          id?: string
          is_verified?: boolean | null
          organization?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          favorite_cities: Json | null
          full_name: string | null
          health_profile: Json | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          favorite_cities?: Json | null
          full_name?: string | null
          health_profile?: Json | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          favorite_cities?: Json | null
          full_name?: string | null
          health_profile?: Json | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      quantum_predictions: {
        Row: {
          classical_baseline: Json | null
          confidence_score: number | null
          created_at: string
          environmental_factors: Json | null
          expires_at: string
          id: string
          location_latitude: number
          location_longitude: number
          prediction_data: Json
          prediction_horizon_hours: number | null
          prediction_type: string
          quantum_advantage_percentage: number | null
          quantum_algorithm: string
          user_id: string
        }
        Insert: {
          classical_baseline?: Json | null
          confidence_score?: number | null
          created_at?: string
          environmental_factors?: Json | null
          expires_at?: string
          id?: string
          location_latitude: number
          location_longitude: number
          prediction_data?: Json
          prediction_horizon_hours?: number | null
          prediction_type: string
          quantum_advantage_percentage?: number | null
          quantum_algorithm: string
          user_id: string
        }
        Update: {
          classical_baseline?: Json | null
          confidence_score?: number | null
          created_at?: string
          environmental_factors?: Json | null
          expires_at?: string
          id?: string
          location_latitude?: number
          location_longitude?: number
          prediction_data?: Json
          prediction_horizon_hours?: number | null
          prediction_type?: string
          quantum_advantage_percentage?: number | null
          quantum_algorithm?: string
          user_id?: string
        }
        Relationships: []
      }
      quantum_simulations: {
        Row: {
          accuracy_score: number | null
          algorithm_name: string
          circuit_depth: number | null
          classical_comparison: Json | null
          created_at: string
          error_rate: number | null
          execution_time_ms: number | null
          id: string
          input_parameters: Json
          quantum_results: Json
          qubit_count: number | null
          simulation_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          algorithm_name: string
          circuit_depth?: number | null
          classical_comparison?: Json | null
          created_at?: string
          error_rate?: number | null
          execution_time_ms?: number | null
          id?: string
          input_parameters?: Json
          quantum_results?: Json
          qubit_count?: number | null
          simulation_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          algorithm_name?: string
          circuit_depth?: number | null
          classical_comparison?: Json | null
          created_at?: string
          error_rate?: number | null
          execution_time_ms?: number | null
          id?: string
          input_parameters?: Json
          quantum_results?: Json
          qubit_count?: number | null
          simulation_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reels: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          likes_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          likes_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      saved_locations: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_favorite: boolean | null
          latitude: number
          longitude: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          latitude: number
          longitude: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          base_model_id: string | null
          completed_at: string | null
          created_at: string
          dataset_id: string | null
          hyperparameters: Json | null
          id: string
          metrics: Json | null
          name: string
          progress: number | null
          quantum_config: Json | null
          started_at: string | null
          status: string | null
          trained_model_path: string | null
          training_logs: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_model_id?: string | null
          completed_at?: string | null
          created_at?: string
          dataset_id?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          name: string
          progress?: number | null
          quantum_config?: Json | null
          started_at?: string | null
          status?: string | null
          trained_model_path?: string | null
          training_logs?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_model_id?: string | null
          completed_at?: string | null
          created_at?: string
          dataset_id?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          name?: string
          progress?: number | null
          quantum_config?: Json | null
          started_at?: string | null
          status?: string | null
          trained_model_path?: string | null
          training_logs?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_base_model_id_fkey"
            columns: ["base_model_id"]
            isOneToOne: false
            referencedRelation: "base_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_habits: {
        Row: {
          active: boolean | null
          created_at: string
          days_of_week: number[] | null
          duration_minutes: number | null
          frequency: string | null
          habit_name: string
          habit_type: string
          id: string
          latitude: number | null
          learned_by_ai: boolean | null
          location_name: string | null
          longitude: number | null
          time_of_day: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          days_of_week?: number[] | null
          duration_minutes?: number | null
          frequency?: string | null
          habit_name: string
          habit_type: string
          id?: string
          latitude?: number | null
          learned_by_ai?: boolean | null
          location_name?: string | null
          longitude?: number | null
          time_of_day?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          days_of_week?: number[] | null
          duration_minutes?: number | null
          frequency?: string | null
          habit_name?: string
          habit_type?: string
          id?: string
          latitude?: number | null
          learned_by_ai?: boolean | null
          location_name?: string | null
          longitude?: number | null
          time_of_day?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          data_sharing: boolean | null
          email_notifications: boolean | null
          envirolink_auto_play_videos: boolean | null
          envirolink_show_hashtags: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          privacy_level: string | null
          push_notifications: boolean | null
          theme: string | null
          timezone: string | null
          units: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          envirolink_auto_play_videos?: boolean | null
          envirolink_show_hashtags?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_level?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          units?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          envirolink_auto_play_videos?: boolean | null
          envirolink_show_hashtags?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_level?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          units?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "professional" | "admin"
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
      app_role: ["user", "professional", "admin"],
    },
  },
} as const
