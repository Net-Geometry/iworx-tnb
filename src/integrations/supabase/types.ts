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
          inventory_item_id: string | null
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
          inventory_item_id?: string | null
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
          inventory_item_id?: string | null
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
            foreignKeyName: "bom_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
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
        Relationships: []
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
      inventory_item_locations: {
        Row: {
          available_quantity: number | null
          bin_location: string | null
          created_at: string
          id: string
          item_id: string
          location_id: string
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
          parent_location_id?: string | null
          updated_at?: string
        }
        Relationships: [
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
        ]
      }
      inventory_transfer_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
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
            foreignKeyName: "inventory_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
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
        Relationships: []
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
      purchase_order_items: {
        Row: {
          created_at: string
          expected_delivery_date: string | null
          id: string
          item_description: string
          item_id: string | null
          notes: string | null
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
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          payment_terms?: number | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
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
      capa_status: "open" | "in_progress" | "completed" | "overdue" | "closed"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status: "reported" | "investigating" | "resolved" | "closed"
      loto_status: "draft" | "approved" | "active" | "expired" | "archived"
      precaution_severity: "critical" | "high" | "medium" | "low"
      precaution_status: "active" | "under_review" | "archived"
      risk_level: "very_low" | "low" | "medium" | "high" | "very_high"
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
      capa_status: ["open", "in_progress", "completed", "overdue", "closed"],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: ["reported", "investigating", "resolved", "closed"],
      loto_status: ["draft", "approved", "active", "expired", "archived"],
      precaution_severity: ["critical", "high", "medium", "low"],
      precaution_status: ["active", "under_review", "archived"],
      risk_level: ["very_low", "low", "medium", "high", "very_high"],
    },
  },
} as const
