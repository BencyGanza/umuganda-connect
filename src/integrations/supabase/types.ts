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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          report_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          report_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          report_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          donor_email: string | null
          donor_name: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          mobile_money_reference: string | null
          payment_method: string
          payment_status: string
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          donor_email?: string | null
          donor_name: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          mobile_money_reference?: string | null
          payment_method: string
          payment_status?: string
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          donor_email?: string | null
          donor_name?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          mobile_money_reference?: string | null
          payment_method?: string
          payment_status?: string
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          created_at: string
          district: string | null
          full_name: string
          id: string
          phone_number: string | null
          points: number
          role: Database["public"]["Enums"]["user_role"]
          sector: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          district?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          sector?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          after_photo_urls: string[] | null
          before_photo_urls: string[] | null
          created_at: string
          description: string
          id: string
          materials_needed: Json | null
          report_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_completion_date: string | null
          title: string
          updated_at: string
          volunteer_count: number
        }
        Insert: {
          actual_completion_date?: string | null
          after_photo_urls?: string[] | null
          before_photo_urls?: string[] | null
          created_at?: string
          description: string
          id?: string
          materials_needed?: Json | null
          report_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_completion_date?: string | null
          title: string
          updated_at?: string
          volunteer_count?: number
        }
        Update: {
          actual_completion_date?: string | null
          after_photo_urls?: string[] | null
          before_photo_urls?: string[] | null
          created_at?: string
          description?: string
          id?: string
          materials_needed?: Json | null
          report_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_completion_date?: string | null
          title?: string
          updated_at?: string
          volunteer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string
          estimated_cost: number | null
          estimated_labor_hours: number | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          photo_urls: string[] | null
          problem_type: Database["public"]["Enums"]["problem_type"]
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at: string
          user_id: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          description: string
          estimated_cost?: number | null
          estimated_labor_hours?: number | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          photo_urls?: string[] | null
          problem_type: Database["public"]["Enums"]["problem_type"]
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at?: string
          user_id: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          description?: string
          estimated_cost?: number | null
          estimated_labor_hours?: number | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          photo_urls?: string[] | null
          problem_type?: Database["public"]["Enums"]["problem_type"]
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          id: string
          project_id: string
          qr_code: string
          user_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          qr_code: string
          user_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          qr_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_attendance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "volunteer" | "citizen"
      problem_type:
        | "roads"
        | "trash"
        | "water"
        | "electricity"
        | "school"
        | "health"
        | "other"
      report_status:
        | "pending"
        | "verified"
        | "in_progress"
        | "completed"
        | "rejected"
      severity_level: "low" | "medium" | "high" | "critical"
      user_role: "citizen" | "volunteer" | "admin"
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
      app_role: ["admin", "volunteer", "citizen"],
      problem_type: [
        "roads",
        "trash",
        "water",
        "electricity",
        "school",
        "health",
        "other",
      ],
      report_status: [
        "pending",
        "verified",
        "in_progress",
        "completed",
        "rejected",
      ],
      severity_level: ["low", "medium", "high", "critical"],
      user_role: ["citizen", "volunteer", "admin"],
    },
  },
} as const
