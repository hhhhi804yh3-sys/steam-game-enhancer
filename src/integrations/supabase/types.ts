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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activation_sessions: {
        Row: {
          activated_at: string | null
          client_info: Json | null
          created_at: string
          expires_at: string
          id: string
          status: string
          token: string
        }
        Insert: {
          activated_at?: string | null
          client_info?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token: string
        }
        Update: {
          activated_at?: string | null
          client_info?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          event_type: string
          id: string
          ip: string | null
          payload: Json | null
          session_token: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip?: string | null
          payload?: Json | null
          session_token?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          session_token?: string | null
        }
        Relationships: []
      }
      app_controls: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      app_notifications: {
        Row: {
          body: string
          created_at: string
          expires_at: string
          id: string
          level: string
          target_token: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          expires_at?: string
          id?: string
          level?: string
          target_token?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          expires_at?: string
          id?: string
          level?: string
          target_token?: string | null
          title?: string
        }
        Relationships: []
      }
      device_telemetry: {
        Row: {
          app_version: string | null
          arch: string | null
          city: string | null
          country: string | null
          cpu: string | null
          extra: Json | null
          first_seen: string
          gpu: string | null
          hostname: string | null
          id: string
          installed_games: Json | null
          ip: string | null
          last_seen: string
          locale: string | null
          os: string | null
          os_version: string | null
          ram_mb: number | null
          screen: string | null
          session_token: string
          steam_id: string | null
          timezone: string | null
          user_agent: string | null
          username: string | null
        }
        Insert: {
          app_version?: string | null
          arch?: string | null
          city?: string | null
          country?: string | null
          cpu?: string | null
          extra?: Json | null
          first_seen?: string
          gpu?: string | null
          hostname?: string | null
          id?: string
          installed_games?: Json | null
          ip?: string | null
          last_seen?: string
          locale?: string | null
          os?: string | null
          os_version?: string | null
          ram_mb?: number | null
          screen?: string | null
          session_token: string
          steam_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          username?: string | null
        }
        Update: {
          app_version?: string | null
          arch?: string | null
          city?: string | null
          country?: string | null
          cpu?: string | null
          extra?: Json | null
          first_seen?: string
          gpu?: string | null
          hostname?: string | null
          id?: string
          installed_games?: Json | null
          ip?: string | null
          last_seen?: string
          locale?: string | null
          os?: string | null
          os_version?: string | null
          ram_mb?: number | null
          screen?: string | null
          session_token?: string
          steam_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          username?: string | null
        }
        Relationships: []
      }
      premium_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          duration_days: number
          id: string
          label: string | null
          used_at: string | null
          used_by_ip: string | null
          used_by_token: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          duration_days: number
          id?: string
          label?: string | null
          used_at?: string | null
          used_by_ip?: string | null
          used_by_token?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          duration_days?: number
          id?: string
          label?: string | null
          used_at?: string | null
          used_by_ip?: string | null
          used_by_token?: string | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          activated_at: string
          code_id: string | null
          expires_at: string
          id: string
          ip: string | null
          meta: Json | null
          session_token: string
        }
        Insert: {
          activated_at?: string
          code_id?: string | null
          expires_at: string
          id?: string
          ip?: string | null
          meta?: Json | null
          session_token: string
        }
        Update: {
          activated_at?: string
          code_id?: string | null
          expires_at?: string
          id?: string
          ip?: string | null
          meta?: Json | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "premium_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_blacklist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          reason: string | null
          value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          reason?: string | null
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          reason?: string | null
          value?: string
        }
        Relationships: []
      }
      steam_daily_snapshots: {
        Row: {
          appid: number
          category: string
          created_at: string
          id: string
          name: string
          peak_in_game: number | null
          player_count: number | null
          rank: number
          snapshot_date: string
        }
        Insert: {
          appid: number
          category?: string
          created_at?: string
          id?: string
          name: string
          peak_in_game?: number | null
          player_count?: number | null
          rank: number
          snapshot_date: string
        }
        Update: {
          appid?: number
          category?: string
          created_at?: string
          id?: string
          name?: string
          peak_in_game?: number | null
          player_count?: number | null
          rank?: number
          snapshot_date?: string
        }
        Relationships: []
      }
      steam_trending_cache: {
        Row: {
          appid: number
          category: string
          developers: Json | null
          discount_percent: number | null
          genres: Json | null
          header_image: string | null
          is_free: boolean | null
          name: string
          peak_in_game: number | null
          player_count: number | null
          price_cents: number | null
          rank: number
          release_date: string | null
          short_description: string | null
          updated_at: string
        }
        Insert: {
          appid: number
          category?: string
          developers?: Json | null
          discount_percent?: number | null
          genres?: Json | null
          header_image?: string | null
          is_free?: boolean | null
          name: string
          peak_in_game?: number | null
          player_count?: number | null
          price_cents?: number | null
          rank: number
          release_date?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          appid?: number
          category?: string
          developers?: Json | null
          discount_percent?: number | null
          genres?: Json | null
          header_image?: string | null
          is_free?: boolean | null
          name?: string
          peak_in_game?: number | null
          player_count?: number | null
          price_cents?: number | null
          rank?: number
          release_date?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tool_versions: {
        Row: {
          changelog: string | null
          created_at: string
          created_by: string | null
          description: string
          file_path: string
          file_size: number | null
          id: string
          is_latest: boolean
          title: string
          version: string
        }
        Insert: {
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_path: string
          file_size?: number | null
          id?: string
          is_latest?: boolean
          title?: string
          version: string
        }
        Update: {
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_latest?: boolean
          title?: string
          version?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
