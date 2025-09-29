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
      asset_boms: {
        Row: {
          asset_id: string
          assigned_by: string | null
          assigned_date: string | null
          bom_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          asset_id: string
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          asset_id?: string
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_boms_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_boms_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_boms_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "bill_of_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_documents: {
        Row: {
          asset_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_documents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_image_url: string | null
          asset_number: string | null
          category: string | null
          created_at: string
          criticality: string | null
          description: string | null
          health_score: number | null
          hierarchy_node_id: string | null
          id: string
          last_maintenance_date: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          parent_asset_id: string | null
          purchase_cost: number | null
          purchase_date: string | null
          qr_code_data: string | null
          serial_number: string | null
          status: string | null
          subcategory: string | null
          type: string | null
          updated_at: string
          warranty_expiry_date: string | null
        }
        Insert: {
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string
          criticality?: string | null
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          parent_asset_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          serial_number?: string | null
          status?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string
          warranty_expiry_date?: string | null
        }
        Update: {
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string
          criticality?: string | null
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          parent_asset_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          serial_number?: string | null
          status?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string
          warranty_expiry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_hierarchy_node_id_fkey"
            columns: ["hierarchy_node_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_of_materials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bom_type: Database["public"]["Enums"]["bom_type"] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["bom_status"] | null
          updated_at: string
          version: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bom_type?: Database["public"]["Enums"]["bom_type"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["bom_status"] | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bom_type?: Database["public"]["Enums"]["bom_type"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["bom_status"] | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_materials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_of_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          bom_id: string
          cost_per_unit: number | null
          created_at: string
          description: string | null
          id: string
          item_name: string
          item_number: string | null
          item_type: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days: number | null
          level: number | null
          notes: string | null
          parent_item_id: string | null
          quantity: number
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          bom_id: string
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          parent_item_id?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          bom_id?: string
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          parent_item_id?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "bill_of_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "bom_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hierarchy_levels: {
        Row: {
          color_code: string
          created_at: string | null
          custom_properties_schema: Json | null
          icon_name: string
          id: string
          is_active: boolean | null
          level_order: number
          name: string
          parent_level_id: string | null
          updated_at: string | null
        }
        Insert: {
          color_code?: string
          created_at?: string | null
          custom_properties_schema?: Json | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          level_order: number
          name: string
          parent_level_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color_code?: string
          created_at?: string | null
          custom_properties_schema?: Json | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          level_order?: number
          name?: string
          parent_level_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hierarchy_levels_parent_level_id_fkey"
            columns: ["parent_level_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      hierarchy_nodes: {
        Row: {
          asset_count: number | null
          created_at: string | null
          hierarchy_level_id: string
          id: string
          name: string
          parent_id: string | null
          path: string | null
          properties: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          asset_count?: number | null
          created_at?: string | null
          hierarchy_level_id: string
          id?: string
          name: string
          parent_id?: string | null
          path?: string | null
          properties?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_count?: number | null
          created_at?: string | null
          hierarchy_level_id?: string
          id?: string
          name?: string
          parent_id?: string | null
          path?: string | null
          properties?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hierarchy_nodes_hierarchy_level_id_fkey"
            columns: ["hierarchy_level_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hierarchy_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string
          description: string
          duration_hours: number | null
          id: string
          maintenance_type: string
          notes: string | null
          performed_date: string
          status: string
          technician_name: string | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string
          description: string
          duration_hours?: number | null
          id?: string
          maintenance_type: string
          notes?: string | null
          performed_date: string
          status?: string
          technician_name?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string
          description?: string
          duration_hours?: number | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          performed_date?: string
          status?: string
          technician_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          asset_id: string
          assigned_technician: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          maintenance_type: string
          notes: string | null
          priority: string
          scheduled_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          assigned_technician?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          maintenance_type: string
          notes?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          assigned_technician?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
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
      bom_item_type: "part" | "material" | "tool" | "consumable"
      bom_status: "active" | "inactive" | "draft" | "archived"
      bom_type: "manufacturing" | "maintenance" | "spare_parts"
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
      bom_item_type: ["part", "material", "tool", "consumable"],
      bom_status: ["active", "inactive", "draft", "archived"],
      bom_type: ["manufacturing", "maintenance", "spare_parts"],
    },
  },
} as const
