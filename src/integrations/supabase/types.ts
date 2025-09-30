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
          organization_id: string
        }
        Insert: {
          asset_id: string
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id: string
          id?: string
          is_primary?: boolean | null
          organization_id: string
        }
        Update: {
          asset_id?: string
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id?: string
          id?: string
          is_primary?: boolean | null
          organization_id?: string
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
          {
            foreignKeyName: "asset_boms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          {
            foreignKeyName: "asset_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          {
            foreignKeyName: "bill_of_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          inventory_item_id: string | null
          item_name: string
          item_number: string | null
          item_type: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days: number | null
          level: number | null
          notes: string | null
          organization_id: string
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
          inventory_item_id?: string | null
          item_name: string
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          organization_id: string
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
          inventory_item_id?: string | null
          item_name?: string
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          organization_id?: string
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
            foreignKeyName: "bom_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      capa_records: {
        Row: {
          capa_number: string
          completion_date: string | null
          corrective_actions: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          effectiveness_review: string | null
          effectiveness_verified: boolean | null
          id: string
          organization_id: string
          preventive_actions: string | null
          priority: number
          responsible_person: string
          root_cause_analysis: string | null
          source: string
          source_reference_id: string | null
          status: Database["public"]["Enums"]["capa_status"]
          title: string
          updated_at: string
          updated_by: string | null
          verified_by: string | null
          verified_date: string | null
        }
        Insert: {
          capa_number: string
          completion_date?: string | null
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          effectiveness_review?: string | null
          effectiveness_verified?: boolean | null
          id?: string
          organization_id: string
          preventive_actions?: string | null
          priority?: number
          responsible_person: string
          root_cause_analysis?: string | null
          source: string
          source_reference_id?: string | null
          status?: Database["public"]["Enums"]["capa_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Update: {
          capa_number?: string
          completion_date?: string | null
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          effectiveness_review?: string | null
          effectiveness_verified?: boolean | null
          id?: string
          organization_id?: string
          preventive_actions?: string | null
          priority?: number
          responsible_person?: string
          root_cause_analysis?: string | null
          source?: string
          source_reference_id?: string | null
          status?: Database["public"]["Enums"]["capa_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
          parent_level_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hierarchy_levels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
            foreignKeyName: "hierarchy_nodes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      inventory_item_locations: {
        Row: {
          available_quantity: number | null
          bin_location: string | null
          created_at: string
          id: string
          item_id: string
          location_id: string
          organization_id: string
          quantity: number | null
          reserved_quantity: number | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          bin_location?: string | null
          created_at?: string
          id?: string
          item_id: string
          location_id: string
          organization_id: string
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          bin_location?: string | null
          created_at?: string
          id?: string
          item_id?: string
          location_id?: string
          organization_id?: string
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_locations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_item_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_item_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          available_stock: number | null
          average_cost: number | null
          barcode: string | null
          category: string | null
          created_at: string
          current_stock: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_serialized: boolean | null
          item_image_url: string | null
          item_number: string | null
          last_cost: number | null
          lead_time_days: number | null
          max_stock_level: number | null
          name: string
          organization_id: string
          qr_code_data: string | null
          reorder_point: number | null
          reorder_quantity: number | null
          reserved_stock: number | null
          safety_stock: number | null
          subcategory: string | null
          supplier_id: string | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string
        }
        Insert: {
          available_stock?: number | null
          average_cost?: number | null
          barcode?: string | null
          category?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_serialized?: boolean | null
          item_image_url?: string | null
          item_number?: string | null
          last_cost?: number | null
          lead_time_days?: number | null
          max_stock_level?: number | null
          name: string
          organization_id: string
          qr_code_data?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_stock?: number | null
          safety_stock?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Update: {
          available_stock?: number | null
          average_cost?: number | null
          barcode?: string | null
          category?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_serialized?: boolean | null
          item_image_url?: string | null
          item_number?: string | null
          last_cost?: number | null
          lead_time_days?: number | null
          max_stock_level?: number | null
          name?: string
          organization_id?: string
          qr_code_data?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_stock?: number | null
          safety_stock?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_loans: {
        Row: {
          actual_return_date: string | null
          borrower_department: string | null
          borrower_email: string | null
          borrower_name: string
          created_at: string
          expected_return_date: string
          from_location_id: string
          id: string
          item_id: string
          loan_date: string | null
          loan_number: string
          loaned_by: string | null
          notes: string | null
          organization_id: string
          quantity: number
          returned_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_return_date?: string | null
          borrower_department?: string | null
          borrower_email?: string | null
          borrower_name: string
          created_at?: string
          expected_return_date: string
          from_location_id: string
          id?: string
          item_id: string
          loan_date?: string | null
          loan_number: string
          loaned_by?: string | null
          notes?: string | null
          organization_id: string
          quantity: number
          returned_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_return_date?: string | null
          borrower_department?: string | null
          borrower_email?: string | null
          borrower_name?: string
          created_at?: string
          expected_return_date?: string
          from_location_id?: string
          id?: string
          item_id?: string
          loan_date?: string | null
          loan_number?: string
          loaned_by?: string | null
          notes?: string | null
          organization_id?: string
          quantity?: number
          returned_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_loans_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_loans_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_loans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: string | null
          capacity_limit: number | null
          code: string | null
          created_at: string
          current_utilization: number | null
          id: string
          is_active: boolean | null
          location_type: string | null
          name: string
          organization_id: string
          parent_location_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity_limit?: number | null
          code?: string | null
          created_at?: string
          current_utilization?: number | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name: string
          organization_id: string
          parent_location_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity_limit?: number | null
          code?: string | null
          created_at?: string
          current_utilization?: number | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name?: string
          organization_id?: string
          parent_location_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          id: string
          item_id: string
          location_id: string | null
          notes: string | null
          organization_id: string
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_date: string
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          location_id?: string | null
          notes?: string | null
          organization_id: string
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          location_id?: string | null
          notes?: string | null
          organization_id?: string
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfer_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          organization_id: string
          quantity_received: number | null
          quantity_requested: number
          quantity_shipped: number | null
          transfer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          organization_id: string
          quantity_received?: number | null
          quantity_requested: number
          quantity_shipped?: number | null
          transfer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          organization_id?: string
          quantity_received?: number | null
          quantity_requested?: number
          quantity_shipped?: number | null
          transfer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfer_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfer_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "inventory_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          approved_by: string | null
          created_at: string
          expected_arrival_date: string | null
          from_location_id: string
          id: string
          notes: string | null
          organization_id: string
          received_by: string | null
          received_date: string | null
          request_date: string | null
          requested_by: string | null
          ship_date: string | null
          shipped_by: string | null
          status: string | null
          to_location_id: string
          transfer_number: string
          transfer_type: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          expected_arrival_date?: string | null
          from_location_id: string
          id?: string
          notes?: string | null
          organization_id: string
          received_by?: string | null
          received_date?: string | null
          request_date?: string | null
          requested_by?: string | null
          ship_date?: string | null
          shipped_by?: string | null
          status?: string | null
          to_location_id: string
          transfer_number: string
          transfer_type?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          expected_arrival_date?: string | null
          from_location_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          received_by?: string | null
          received_date?: string | null
          request_date?: string | null
          requested_by?: string | null
          ship_date?: string | null
          shipped_by?: string | null
          status?: string | null
          to_location_id?: string
          transfer_number?: string
          transfer_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_plan_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"] | null
          file_path: string | null
          file_size: number | null
          id: string
          is_required: boolean | null
          job_plan_id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_required?: boolean | null
          job_plan_id: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_required?: boolean | null
          job_plan_id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_plan_documents_job_plan_id_fkey"
            columns: ["job_plan_id"]
            isOneToOne: false
            referencedRelation: "job_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_plan_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_plan_parts: {
        Row: {
          alternative_part_ids: string[] | null
          created_at: string
          id: string
          inventory_item_id: string | null
          is_critical_part: boolean | null
          job_plan_id: string
          notes: string | null
          organization_id: string
          part_name: string
          part_number: string | null
          quantity_required: number
          updated_at: string
        }
        Insert: {
          alternative_part_ids?: string[] | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          is_critical_part?: boolean | null
          job_plan_id: string
          notes?: string | null
          organization_id: string
          part_name: string
          part_number?: string | null
          quantity_required?: number
          updated_at?: string
        }
        Update: {
          alternative_part_ids?: string[] | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          is_critical_part?: boolean | null
          job_plan_id?: string
          notes?: string | null
          organization_id?: string
          part_name?: string
          part_number?: string | null
          quantity_required?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_plan_parts_job_plan_id_fkey"
            columns: ["job_plan_id"]
            isOneToOne: false
            referencedRelation: "job_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_plan_parts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_plan_tasks: {
        Row: {
          completion_criteria: string | null
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          is_critical_step: boolean | null
          job_plan_id: string
          notes: string | null
          organization_id: string
          safety_precaution_ids: string[] | null
          skill_required: string | null
          task_description: string | null
          task_sequence: number
          task_title: string
          updated_at: string
        }
        Insert: {
          completion_criteria?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_critical_step?: boolean | null
          job_plan_id: string
          notes?: string | null
          organization_id: string
          safety_precaution_ids?: string[] | null
          skill_required?: string | null
          task_description?: string | null
          task_sequence: number
          task_title: string
          updated_at?: string
        }
        Update: {
          completion_criteria?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_critical_step?: boolean | null
          job_plan_id?: string
          notes?: string | null
          organization_id?: string
          safety_precaution_ids?: string[] | null
          skill_required?: string | null
          task_description?: string | null
          task_sequence?: number
          task_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_plan_tasks_job_plan_id_fkey"
            columns: ["job_plan_id"]
            isOneToOne: false
            referencedRelation: "job_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_plan_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_plan_tools: {
        Row: {
          created_at: string
          id: string
          is_specialized_tool: boolean | null
          job_plan_id: string
          notes: string | null
          organization_id: string
          quantity_required: number | null
          tool_description: string | null
          tool_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_specialized_tool?: boolean | null
          job_plan_id: string
          notes?: string | null
          organization_id: string
          quantity_required?: number | null
          tool_description?: string | null
          tool_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_specialized_tool?: boolean | null
          job_plan_id?: string
          notes?: string | null
          organization_id?: string
          quantity_required?: number | null
          tool_description?: string | null
          tool_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_plan_tools_job_plan_id_fkey"
            columns: ["job_plan_id"]
            isOneToOne: false
            referencedRelation: "job_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_plan_tools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_plans: {
        Row: {
          applicable_asset_types: string[] | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_duration_hours: number | null
          frequency_interval: number | null
          frequency_type: Database["public"]["Enums"]["frequency_type"] | null
          id: string
          job_plan_number: string
          job_type: Database["public"]["Enums"]["job_type"] | null
          organization_id: string
          priority: string | null
          skill_level_required:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory: string | null
          title: string
          updated_at: string
          usage_count: number | null
          version: string | null
        }
        Insert: {
          applicable_asset_types?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_interval?: number | null
          frequency_type?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string
          job_plan_number: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          organization_id: string
          priority?: string | null
          skill_level_required?:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status?: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Update: {
          applicable_asset_types?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_interval?: number | null
          frequency_type?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string
          job_plan_number?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          organization_id?: string
          priority?: string | null
          skill_level_required?:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status?: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      loto_procedures: {
        Row: {
          approval_required: boolean | null
          approved_by: string | null
          approved_date: string | null
          asset_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          energy_sources: string[]
          equipment_name: string
          id: string
          lockout_points: string[]
          next_review_date: string | null
          organization_id: string
          procedure_number: string
          procedure_steps: Json
          required_ppe: string[] | null
          required_tools: string[] | null
          review_frequency_months: number | null
          status: Database["public"]["Enums"]["loto_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approval_required?: boolean | null
          approved_by?: string | null
          approved_date?: string | null
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          energy_sources: string[]
          equipment_name: string
          id?: string
          lockout_points: string[]
          next_review_date?: string | null
          organization_id: string
          procedure_number: string
          procedure_steps: Json
          required_ppe?: string[] | null
          required_tools?: string[] | null
          review_frequency_months?: number | null
          status?: Database["public"]["Enums"]["loto_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approval_required?: boolean | null
          approved_by?: string | null
          approved_date?: string | null
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          energy_sources?: string[]
          equipment_name?: string
          id?: string
          lockout_points?: string[]
          next_review_date?: string | null
          organization_id?: string
          procedure_number?: string
          procedure_steps?: Json
          required_ppe?: string[] | null
          required_tools?: string[] | null
          review_frequency_months?: number | null
          status?: Database["public"]["Enums"]["loto_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loto_procedures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
          performed_date?: string
          status?: string
          technician_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_number: string
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          job_title: string | null
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_skills: {
        Row: {
          certification_date: string | null
          certification_expiry: string | null
          certified: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          person_id: string
          proficiency_level:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          person_id: string
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          person_id?: string
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "person_skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_skills_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_order_items: {
        Row: {
          created_at: string
          expected_delivery_date: string | null
          id: string
          item_description: string
          item_id: string | null
          notes: string | null
          organization_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          remaining_quantity: number | null
          total_price: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          item_description: string
          item_id?: string | null
          notes?: string | null
          organization_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          remaining_quantity?: number | null
          total_price?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          item_description?: string
          item_id?: string | null
          notes?: string | null
          organization_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          remaining_quantity?: number | null
          total_price?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string | null
          delivery_address: string | null
          delivery_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          organization_id: string
          payment_terms: number | null
          po_number: string
          requested_by: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          organization_id: string
          payment_terms?: number | null
          po_number: string
          requested_by?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          organization_id?: string
          payment_terms?: number | null
          po_number?: string
          requested_by?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          is_system_role: boolean
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      safety_hazards: {
        Row: {
          asset_id: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          hazard_number: string
          id: string
          likelihood: number
          location: string
          mitigation_measures: string | null
          organization_id: string
          responsible_person: string | null
          review_date: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          severity: number
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          hazard_number: string
          id?: string
          likelihood: number
          location: string
          mitigation_measures?: string | null
          organization_id: string
          responsible_person?: string | null
          review_date?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          severity: number
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          hazard_number?: string
          id?: string
          likelihood?: number
          location?: string
          mitigation_measures?: string | null
          organization_id?: string
          responsible_person?: string | null
          review_date?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          severity?: number
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_hazards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          asset_id: string | null
          corrective_actions: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          incident_date: string
          incident_number: string
          investigation_notes: string | null
          investigator_name: string | null
          location: string
          organization_id: string
          regulatory_report_number: string | null
          regulatory_reporting_required: boolean | null
          reporter_email: string | null
          reporter_name: string
          root_cause: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_id?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          incident_date: string
          incident_number: string
          investigation_notes?: string | null
          investigator_name?: string | null
          location: string
          organization_id: string
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name: string
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_id?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          incident_date?: string
          incident_number?: string
          investigation_notes?: string | null
          investigator_name?: string | null
          location?: string
          organization_id?: string
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name?: string
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_precautions: {
        Row: {
          applicable_scenarios: Json | null
          associated_hazards: string[] | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          organization_id: string
          precaution_code: string
          regulatory_references: string[] | null
          required_actions: string[] | null
          severity_level: Database["public"]["Enums"]["precaution_severity"]
          status: Database["public"]["Enums"]["precaution_status"]
          subcategory: string | null
          title: string
          updated_at: string
          updated_by: string | null
          usage_count: number | null
        }
        Insert: {
          applicable_scenarios?: Json | null
          associated_hazards?: string[] | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          organization_id: string
          precaution_code: string
          regulatory_references?: string[] | null
          required_actions?: string[] | null
          severity_level?: Database["public"]["Enums"]["precaution_severity"]
          status?: Database["public"]["Enums"]["precaution_status"]
          subcategory?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          usage_count?: number | null
        }
        Update: {
          applicable_scenarios?: Json | null
          associated_hazards?: string[] | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          organization_id?: string
          precaution_code?: string
          regulatory_references?: string[] | null
          required_actions?: string[] | null
          severity_level?: Database["public"]["Enums"]["precaution_severity"]
          status?: Database["public"]["Enums"]["precaution_status"]
          subcategory?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_precautions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"] | null
          certification_required: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          skill_code: string
          skill_name: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          skill_code: string
          skill_name: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          skill_code?: string
          skill_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string
          payment_terms: number | null
          phone: string | null
          rating: number | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
          payment_terms?: number | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: number | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          person_id: string
          role_in_team: Database["public"]["Enums"]["team_role"] | null
          team_id: string
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          person_id: string
          role_in_team?: Database["public"]["Enums"]["team_role"] | null
          team_id: string
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          person_id?: string
          role_in_team?: Database["public"]["Enums"]["team_role"] | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          shift: Database["public"]["Enums"]["team_shift"] | null
          team_code: string
          team_leader_id: string | null
          team_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          shift?: Database["public"]["Enums"]["team_shift"] | null
          team_code: string
          team_leader_id?: string | null
          team_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          shift?: Database["public"]["Enums"]["team_shift"] | null
          team_code?: string
          team_leader_id?: string | null
          team_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
          priority?: string
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organizations: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: Json
      }
      has_cross_project_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      import_user_as_person: {
        Args:
          | {
              _employee_number: string
              _organization_id?: string
              _user_id: string
            }
          | { _employee_number: string; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bom_item_type: "part" | "material" | "tool" | "consumable"
      bom_status: "active" | "inactive" | "draft" | "archived"
      bom_type: "manufacturing" | "maintenance" | "spare_parts"
      capa_status: "open" | "in_progress" | "completed" | "overdue" | "closed"
      document_type: "manual" | "schematic" | "checklist" | "image" | "video"
      employment_status: "active" | "inactive" | "on_leave" | "terminated"
      frequency_type: "time_based" | "usage_based" | "condition_based"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status: "reported" | "investigating" | "resolved" | "closed"
      job_plan_status: "draft" | "active" | "under_review" | "archived"
      job_type:
        | "preventive"
        | "corrective"
        | "predictive"
        | "emergency"
        | "shutdown"
      loto_status: "draft" | "approved" | "active" | "expired" | "archived"
      precaution_severity: "critical" | "high" | "medium" | "low"
      precaution_status: "active" | "under_review" | "archived"
      proficiency_level: "beginner" | "intermediate" | "advanced" | "expert"
      risk_level: "very_low" | "low" | "medium" | "high" | "very_high"
      skill_category:
        | "mechanical"
        | "electrical"
        | "plumbing"
        | "hvac"
        | "instrumentation"
        | "safety"
        | "software"
        | "other"
      skill_level: "basic" | "intermediate" | "advanced" | "specialist"
      team_role: "leader" | "member" | "supervisor"
      team_shift: "day" | "night" | "swing" | "rotating"
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
      bom_item_type: ["part", "material", "tool", "consumable"],
      bom_status: ["active", "inactive", "draft", "archived"],
      bom_type: ["manufacturing", "maintenance", "spare_parts"],
      capa_status: ["open", "in_progress", "completed", "overdue", "closed"],
      document_type: ["manual", "schematic", "checklist", "image", "video"],
      employment_status: ["active", "inactive", "on_leave", "terminated"],
      frequency_type: ["time_based", "usage_based", "condition_based"],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: ["reported", "investigating", "resolved", "closed"],
      job_plan_status: ["draft", "active", "under_review", "archived"],
      job_type: [
        "preventive",
        "corrective",
        "predictive",
        "emergency",
        "shutdown",
      ],
      loto_status: ["draft", "approved", "active", "expired", "archived"],
      precaution_severity: ["critical", "high", "medium", "low"],
      precaution_status: ["active", "under_review", "archived"],
      proficiency_level: ["beginner", "intermediate", "advanced", "expert"],
      risk_level: ["very_low", "low", "medium", "high", "very_high"],
      skill_category: [
        "mechanical",
        "electrical",
        "plumbing",
        "hvac",
        "instrumentation",
        "safety",
        "software",
        "other",
      ],
      skill_level: ["basic", "intermediate", "advanced", "specialist"],
      team_role: ["leader", "member", "supervisor"],
      team_shift: ["day", "night", "swing", "rotating"],
    },
  },
} as const
