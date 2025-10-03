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
      business_area: {
        Row: {
          ba_id: number | null
          ba_number: number | null
          business_area: string | null
          id: string
          label: string | null
          ppb_zone: string | null
          region: string | null
          source_dat: string | null
          state: string | null
          station: string | null
          status: string | null
          tnb_source: number | null
        }
        Insert: {
          ba_id?: number | null
          ba_number?: number | null
          business_area?: string | null
          id?: string
          label?: string | null
          ppb_zone?: string | null
          region?: string | null
          source_dat?: string | null
          state?: string | null
          station?: string | null
          status?: string | null
          tnb_source?: number | null
        }
        Update: {
          ba_id?: number | null
          ba_number?: number | null
          business_area?: string | null
          id?: string
          label?: string | null
          ppb_zone?: string | null
          region?: string | null
          source_dat?: string | null
          state?: string | null
          station?: string | null
          status?: string | null
          tnb_source?: number | null
        }
        Relationships: []
      }
      domain_events: {
        Row: {
          correlation_id: string | null
          created_at: string
          event_id: string
          event_type: string
          id: string
          metadata: Json | null
          payload: Json
          processed_at: string | null
          processed_by: string[] | null
          published_at: string
          service_name: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          payload: Json
          processed_at?: string | null
          processed_by?: string[] | null
          published_at?: string
          service_name: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          payload?: Json
          processed_at?: string | null
          processed_by?: string[] | null
          published_at?: string
          service_name?: string
        }
        Relationships: []
      }
      incident_approvals: {
        Row: {
          approval_action: string
          approved_at: string | null
          approved_by_user_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          incident_id: string
          organization_id: string | null
          step_id: string | null
        }
        Insert: {
          approval_action: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          incident_id: string
          organization_id?: string | null
          step_id?: string | null
        }
        Update: {
          approval_action?: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          incident_id?: string
          organization_id?: string | null
          step_id?: string | null
        }
        Relationships: []
      }
      incident_workflow_state: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string | null
          current_step_id: string | null
          id: string
          incident_id: string
          organization_id: string | null
          pending_approval_from_role: string | null
          sla_due_at: string | null
          step_started_at: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          current_step_id?: string | null
          id?: string
          incident_id: string
          organization_id?: string | null
          pending_approval_from_role?: string | null
          sla_due_at?: string | null
          step_started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          current_step_id?: string | null
          id?: string
          incident_id?: string
          organization_id?: string | null
          pending_approval_from_role?: string | null
          sla_due_at?: string | null
          step_started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_workflow_state_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
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
      meter_group_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string
          created_at: string
          id: string
          is_primary: boolean | null
          meter_group_id: string
          meter_id: string
          notes: string | null
          organization_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          meter_group_id: string
          meter_id: string
          notes?: string | null
          organization_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          meter_group_id?: string
          meter_id?: string
          notes?: string | null
          organization_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_group_assignments_meter_group_id_fkey"
            columns: ["meter_group_id"]
            isOneToOne: false
            referencedRelation: "meter_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_group_assignments_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          group_number: string
          group_type: string | null
          hierarchy_node_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_number: string
          group_type?: string | null
          hierarchy_node_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_number?: string
          group_type?: string | null
          hierarchy_node_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meters: {
        Row: {
          accuracy_class: string | null
          calibration_certificate_number: string | null
          coordinates: Json | null
          created_at: string
          created_by: string | null
          current_rating: number | null
          description: string | null
          id: string
          installation_date: string | null
          installation_location: string | null
          last_calibration_date: string | null
          last_reading: number | null
          last_reading_date: string | null
          manufacturer: string | null
          meter_constant: number | null
          meter_number: string
          meter_type: string
          model: string | null
          multiplier: number | null
          next_calibration_date: string | null
          notes: string | null
          organization_id: string
          phase_type: string | null
          serial_number: string
          status: string
          unit_id: number | null
          updated_at: string
          voltage_rating: number | null
        }
        Insert: {
          accuracy_class?: string | null
          calibration_certificate_number?: string | null
          coordinates?: Json | null
          created_at?: string
          created_by?: string | null
          current_rating?: number | null
          description?: string | null
          id?: string
          installation_date?: string | null
          installation_location?: string | null
          last_calibration_date?: string | null
          last_reading?: number | null
          last_reading_date?: string | null
          manufacturer?: string | null
          meter_constant?: number | null
          meter_number: string
          meter_type: string
          model?: string | null
          multiplier?: number | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id: string
          phase_type?: string | null
          serial_number: string
          status?: string
          unit_id?: number | null
          updated_at?: string
          voltage_rating?: number | null
        }
        Update: {
          accuracy_class?: string | null
          calibration_certificate_number?: string | null
          coordinates?: Json | null
          created_at?: string
          created_by?: string | null
          current_rating?: number | null
          description?: string | null
          id?: string
          installation_date?: string | null
          installation_location?: string | null
          last_calibration_date?: string | null
          last_reading?: number | null
          last_reading_date?: string | null
          manufacturer?: string | null
          meter_constant?: number | null
          meter_number?: string
          meter_type?: string
          model?: string | null
          multiplier?: number | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id?: string
          phase_type?: string | null
          serial_number?: string
          status?: string
          unit_id?: number | null
          updated_at?: string
          voltage_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "unit"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          organization_id: string
          pm_schedule_id: string | null
          read_at: string | null
          title: string
          updated_at: string | null
          user_id: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          organization_id: string
          pm_schedule_id?: string | null
          read_at?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          organization_id?: string
          pm_schedule_id?: string | null
          read_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "pm_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
      person_locations: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          hierarchy_node_id: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          notes: string | null
          organization_id: string
          person_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          hierarchy_node_id: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id: string
          person_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          hierarchy_node_id?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id?: string
          person_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_locations_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_locations_hierarchy_node_id_fkey"
            columns: ["hierarchy_node_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_locations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_generated_work_orders: {
        Row: {
          created_at: string | null
          due_date: string
          generation_date: string | null
          id: string
          organization_id: string
          pm_schedule_id: string
          work_order_id: string
        }
        Insert: {
          created_at?: string | null
          due_date: string
          generation_date?: string | null
          id?: string
          organization_id: string
          pm_schedule_id: string
          work_order_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string
          generation_date?: string | null
          id?: string
          organization_id?: string
          pm_schedule_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_generated_work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_generated_work_orders_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "pm_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schedule_history: {
        Row: {
          completed_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          pm_schedule_id: string
          scheduled_date: string
          status: string
          work_order_id: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          pm_schedule_id: string
          scheduled_date: string
          status: string
          work_order_id?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          pm_schedule_id?: string
          scheduled_date?: string
          status?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_schedule_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_schedule_history_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "pm_schedules"
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
      role_assignment_rules: {
        Row: {
          asset_type: string | null
          auto_assign: boolean | null
          backup_role_name: string | null
          created_at: string | null
          escalation_hours: number | null
          id: string
          maintenance_type: string | null
          module: string
          organization_id: string | null
          priority: string | null
          role_name: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          asset_type?: string | null
          auto_assign?: boolean | null
          backup_role_name?: string | null
          created_at?: string | null
          escalation_hours?: number | null
          id?: string
          maintenance_type?: string | null
          module: string
          organization_id?: string | null
          priority?: string | null
          role_name: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string | null
          auto_assign?: boolean | null
          backup_role_name?: string | null
          created_at?: string | null
          escalation_hours?: number | null
          id?: string
          maintenance_type?: string | null
          module?: string
          organization_id?: string | null
          priority?: string | null
          role_name?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      route_assignments: {
        Row: {
          assigned_date: string | null
          assignment_id: string
          assignment_type: string
          created_at: string
          id: string
          organization_id: string
          route_id: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          assignment_id: string
          assignment_type: string
          created_at?: string
          id?: string
          organization_id: string
          route_id: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          assignment_id?: string
          assignment_type?: string
          created_at?: string
          id?: string
          organization_id?: string
          route_id?: string
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
      unit: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string | null
          sync_timestamp: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          sync_timestamp?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          sync_timestamp?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      work_order_approvals: {
        Row: {
          approval_action: string
          approved_at: string | null
          approved_by_user_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          step_id: string | null
          work_order_id: string
        }
        Insert: {
          approval_action: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          step_id?: string | null
          work_order_id: string
        }
        Update: {
          approval_action?: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          step_id?: string | null
          work_order_id?: string
        }
        Relationships: []
      }
      work_order_meter_readings: {
        Row: {
          created_at: string
          id: string
          is_validated: boolean | null
          meter_group_id: string
          notes: string | null
          organization_id: string
          reading_date: string
          reading_value: number
          recorded_by: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          work_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_validated?: boolean | null
          meter_group_id: string
          notes?: string | null
          organization_id: string
          reading_date?: string
          reading_value: number
          recorded_by?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          work_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_validated?: boolean | null
          meter_group_id?: string
          notes?: string | null
          organization_id?: string
          reading_date?: string
          reading_value?: number
          recorded_by?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          work_order_id?: string
        }
        Relationships: []
      }
      work_order_workflow_state: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string | null
          current_step_id: string | null
          id: string
          organization_id: string | null
          pending_approval_from_role: string | null
          sla_due_at: string | null
          step_started_at: string | null
          template_id: string | null
          updated_at: string | null
          work_order_id: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          current_step_id?: string | null
          id?: string
          organization_id?: string | null
          pending_approval_from_role?: string | null
          sla_due_at?: string | null
          step_started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          work_order_id: string
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string | null
          current_step_id?: string | null
          id?: string
          organization_id?: string | null
          pending_approval_from_role?: string | null
          sla_due_at?: string | null
          step_started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_workflow_state_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_conditions: {
        Row: {
          action: string
          condition_type: string
          created_at: string | null
          field_name: string | null
          id: string
          operator: string | null
          organization_id: string
          priority: number | null
          step_id: string
          target_step_id: string | null
          value: Json | null
        }
        Insert: {
          action: string
          condition_type: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          operator?: string | null
          organization_id: string
          priority?: number | null
          step_id: string
          target_step_id?: string | null
          value?: Json | null
        }
        Update: {
          action?: string
          condition_type?: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          operator?: string | null
          organization_id?: string
          priority?: number | null
          step_id?: string
          target_step_id?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_conditions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_conditions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_conditions_target_step_id_fkey"
            columns: ["target_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_role_assignments: {
        Row: {
          assignment_logic: Json | null
          can_approve: boolean | null
          can_assign: boolean | null
          can_edit: boolean | null
          can_reject: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          is_backup_assignee: boolean | null
          is_primary_assignee: boolean | null
          organization_id: string
          role_name: string
          step_id: string
        }
        Insert: {
          assignment_logic?: Json | null
          can_approve?: boolean | null
          can_assign?: boolean | null
          can_edit?: boolean | null
          can_reject?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          is_backup_assignee?: boolean | null
          is_primary_assignee?: boolean | null
          organization_id: string
          role_name: string
          step_id: string
        }
        Update: {
          assignment_logic?: Json | null
          can_approve?: boolean | null
          can_assign?: boolean | null
          can_edit?: boolean | null
          can_reject?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          is_backup_assignee?: boolean | null
          is_primary_assignee?: boolean | null
          organization_id?: string
          role_name?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_role_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_role_assignments_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          auto_assign_logic: Json | null
          can_approve: boolean | null
          can_assign: boolean | null
          can_transition_to: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module: string
          name: string
          organization_id: string | null
          required_role: string
          sla_hours: number | null
          step_order: number
          updated_at: string | null
        }
        Insert: {
          auto_assign_logic?: Json | null
          can_approve?: boolean | null
          can_assign?: boolean | null
          can_transition_to?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module: string
          name: string
          organization_id?: string | null
          required_role: string
          sla_hours?: number | null
          step_order: number
          updated_at?: string | null
        }
        Update: {
          auto_assign_logic?: Json | null
          can_approve?: boolean | null
          can_assign?: boolean | null
          can_transition_to?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module?: string
          name?: string
          organization_id?: string | null
          required_role?: string
          sla_hours?: number | null
          step_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_template_steps: {
        Row: {
          approval_type: string | null
          auto_assign_enabled: boolean | null
          auto_assign_logic: Json | null
          created_at: string | null
          description: string | null
          form_fields: Json | null
          id: string
          incident_status: string | null
          is_required: boolean | null
          name: string
          organization_id: string
          sla_hours: number | null
          step_order: number
          step_type: string | null
          template_id: string
          updated_at: string | null
          work_order_status: string | null
        }
        Insert: {
          approval_type?: string | null
          auto_assign_enabled?: boolean | null
          auto_assign_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_fields?: Json | null
          id?: string
          incident_status?: string | null
          is_required?: boolean | null
          name: string
          organization_id: string
          sla_hours?: number | null
          step_order: number
          step_type?: string | null
          template_id: string
          updated_at?: string | null
          work_order_status?: string | null
        }
        Update: {
          approval_type?: string | null
          auto_assign_enabled?: boolean | null
          auto_assign_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_fields?: Json | null
          id?: string
          incident_status?: string | null
          is_required?: boolean | null
          name?: string
          organization_id?: string
          sla_hours?: number | null
          step_order?: number
          step_type?: string | null
          template_id?: string
          updated_at?: string | null
          work_order_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_template_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_template_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_template_transitions: {
        Row: {
          condition_group_id: string | null
          created_at: string | null
          from_step_id: string | null
          id: string
          organization_id: string
          requires_comment: boolean | null
          template_id: string
          to_step_id: string | null
          transition_name: string | null
        }
        Insert: {
          condition_group_id?: string | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          organization_id: string
          requires_comment?: boolean | null
          template_id: string
          to_step_id?: string | null
          transition_name?: string | null
        }
        Update: {
          condition_group_id?: string | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          organization_id?: string
          requires_comment?: boolean | null
          template_id?: string
          to_step_id?: string | null
          transition_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_template_transitions_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_template_transitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_template_transitions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_template_transitions_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          module: string
          name: string
          organization_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          module: string
          name: string
          organization_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          module?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      asset_boms: {
        Row: {
          asset_id: string | null
          assigned_by: string | null
          assigned_date: string | null
          bom_id: string | null
          id: string | null
          is_primary: boolean | null
          organization_id: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id?: string | null
          id?: string | null
          is_primary?: boolean | null
          organization_id?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          bom_id?: string | null
          id?: string | null
          is_primary?: boolean | null
          organization_id?: string | null
        }
        Relationships: []
      }
      asset_documents: {
        Row: {
          asset_id: string | null
          created_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string | null
          organization_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string | null
          organization_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string | null
          organization_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      asset_meter_groups: {
        Row: {
          asset_id: string | null
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          meter_group_id: string | null
          notes: string | null
          organization_id: string | null
          purpose: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          meter_group_id?: string | null
          notes?: string | null
          organization_id?: string | null
          purpose?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          meter_group_id?: string | null
          notes?: string | null
          organization_id?: string | null
          purpose?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      asset_skill_requirements: {
        Row: {
          asset_id: string | null
          created_at: string | null
          id: string | null
          is_mandatory: boolean | null
          organization_id: string | null
          priority_order: number | null
          proficiency_level_required:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          id?: string | null
          is_mandatory?: boolean | null
          organization_id?: string | null
          priority_order?: number | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          id?: string | null
          is_mandatory?: boolean | null
          organization_id?: string | null
          priority_order?: number | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_image_url: string | null
          asset_number: string | null
          category: string | null
          created_at: string | null
          criticality: string | null
          description: string | null
          health_score: number | null
          hierarchy_node_id: string | null
          id: string | null
          last_maintenance_date: string | null
          manufacturer: string | null
          model: string | null
          name: string | null
          next_maintenance_date: string | null
          organization_id: string | null
          parent_asset_id: string | null
          purchase_cost: number | null
          purchase_date: string | null
          qr_code_data: string | null
          serial_number: string | null
          status: string | null
          subcategory: string | null
          type: string | null
          updated_at: string | null
          warranty_expiry_date: string | null
        }
        Insert: {
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string | null
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string | null
          next_maintenance_date?: string | null
          organization_id?: string | null
          parent_asset_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          serial_number?: string | null
          status?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string | null
          warranty_expiry_date?: string | null
        }
        Update: {
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string | null
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string | null
          next_maintenance_date?: string | null
          organization_id?: string | null
          parent_asset_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code_data?: string | null
          serial_number?: string | null
          status?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string | null
          warranty_expiry_date?: string | null
        }
        Relationships: []
      }
      bill_of_materials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bom_type: Database["public"]["Enums"]["bom_type"] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["bom_status"] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bom_type?: Database["public"]["Enums"]["bom_type"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["bom_status"] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bom_type?: Database["public"]["Enums"]["bom_type"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["bom_status"] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      bom_items: {
        Row: {
          bom_id: string | null
          cost_per_unit: number | null
          created_at: string | null
          description: string | null
          id: string | null
          inventory_item_id: string | null
          item_name: string | null
          item_number: string | null
          item_type: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days: number | null
          level: number | null
          notes: string | null
          organization_id: string | null
          parent_item_id: string | null
          quantity: number | null
          supplier: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          bom_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          inventory_item_id?: string | null
          item_name?: string | null
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          organization_id?: string | null
          parent_item_id?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          bom_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          inventory_item_id?: string | null
          item_name?: string | null
          item_number?: string | null
          item_type?: Database["public"]["Enums"]["bom_item_type"] | null
          lead_time_days?: number | null
          level?: number | null
          notes?: string | null
          organization_id?: string | null
          parent_item_id?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      capa_records: {
        Row: {
          capa_number: string | null
          completion_date: string | null
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          effectiveness_review: string | null
          effectiveness_verified: boolean | null
          id: string | null
          organization_id: string | null
          preventive_actions: string | null
          priority: number | null
          responsible_person: string | null
          root_cause_analysis: string | null
          source: string | null
          source_reference_id: string | null
          status: Database["public"]["Enums"]["capa_status"] | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          verified_by: string | null
          verified_date: string | null
        }
        Insert: {
          capa_number?: string | null
          completion_date?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness_review?: string | null
          effectiveness_verified?: boolean | null
          id?: string | null
          organization_id?: string | null
          preventive_actions?: string | null
          priority?: number | null
          responsible_person?: string | null
          root_cause_analysis?: string | null
          source?: string | null
          source_reference_id?: string | null
          status?: Database["public"]["Enums"]["capa_status"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Update: {
          capa_number?: string | null
          completion_date?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness_review?: string | null
          effectiveness_verified?: boolean | null
          id?: string | null
          organization_id?: string | null
          preventive_actions?: string | null
          priority?: number | null
          responsible_person?: string | null
          root_cause_analysis?: string | null
          source?: string | null
          source_reference_id?: string | null
          status?: Database["public"]["Enums"]["capa_status"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Relationships: []
      }
      crafts: {
        Row: {
          contract: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          organization_id: string | null
          skill_level: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          contract?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          skill_level?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          contract?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          skill_level?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      hierarchy_levels: {
        Row: {
          color_code: string | null
          created_at: string | null
          custom_properties_schema: Json | null
          icon_name: string | null
          id: string | null
          is_active: boolean | null
          level_order: number | null
          name: string | null
          organization_id: string | null
          parent_level_id: string | null
          updated_at: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          custom_properties_schema?: Json | null
          icon_name?: string | null
          id?: string | null
          is_active?: boolean | null
          level_order?: number | null
          name?: string | null
          organization_id?: string | null
          parent_level_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          custom_properties_schema?: Json | null
          icon_name?: string | null
          id?: string | null
          is_active?: boolean | null
          level_order?: number | null
          name?: string | null
          organization_id?: string | null
          parent_level_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hierarchy_nodes: {
        Row: {
          asset_count: number | null
          created_at: string | null
          hierarchy_level_id: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          parent_id: string | null
          path: string | null
          properties: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          asset_count?: number | null
          created_at?: string | null
          hierarchy_level_id?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          parent_id?: string | null
          path?: string | null
          properties?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_count?: number | null
          created_at?: string | null
          hierarchy_level_id?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          parent_id?: string | null
          path?: string | null
          properties?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_item_locations: {
        Row: {
          available_quantity: number | null
          bin_location: string | null
          created_at: string | null
          id: string | null
          item_id: string | null
          location_id: string | null
          organization_id: string | null
          quantity: number | null
          reserved_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number | null
          bin_location?: string | null
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          location_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number | null
          bin_location?: string | null
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          location_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          available_stock: number | null
          average_cost: number | null
          barcode: string | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_serialized: boolean | null
          item_image_url: string | null
          item_number: string | null
          last_cost: number | null
          lead_time_days: number | null
          max_stock_level: number | null
          name: string | null
          organization_id: string | null
          qr_code_data: string | null
          reorder_point: number | null
          reorder_quantity: number | null
          reserved_stock: number | null
          safety_stock: number | null
          subcategory: string | null
          supplier_id: string | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          available_stock?: number | null
          average_cost?: number | null
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_serialized?: boolean | null
          item_image_url?: string | null
          item_number?: string | null
          last_cost?: number | null
          lead_time_days?: number | null
          max_stock_level?: number | null
          name?: string | null
          organization_id?: string | null
          qr_code_data?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_stock?: number | null
          safety_stock?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          available_stock?: number | null
          average_cost?: number | null
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_serialized?: boolean | null
          item_image_url?: string | null
          item_number?: string | null
          last_cost?: number | null
          lead_time_days?: number | null
          max_stock_level?: number | null
          name?: string | null
          organization_id?: string | null
          qr_code_data?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_stock?: number | null
          safety_stock?: number | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_loans: {
        Row: {
          actual_return_date: string | null
          borrower_department: string | null
          borrower_email: string | null
          borrower_name: string | null
          created_at: string | null
          expected_return_date: string | null
          from_location_id: string | null
          id: string | null
          item_id: string | null
          loan_date: string | null
          loan_number: string | null
          loaned_by: string | null
          notes: string | null
          organization_id: string | null
          quantity: number | null
          returned_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_return_date?: string | null
          borrower_department?: string | null
          borrower_email?: string | null
          borrower_name?: string | null
          created_at?: string | null
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string | null
          item_id?: string | null
          loan_date?: string | null
          loan_number?: string | null
          loaned_by?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity?: number | null
          returned_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_return_date?: string | null
          borrower_department?: string | null
          borrower_email?: string | null
          borrower_name?: string | null
          created_at?: string | null
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string | null
          item_id?: string | null
          loan_date?: string | null
          loan_number?: string | null
          loaned_by?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity?: number | null
          returned_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_locations: {
        Row: {
          address: string | null
          capacity_limit: number | null
          code: string | null
          created_at: string | null
          current_utilization: number | null
          id: string | null
          is_active: boolean | null
          location_type: string | null
          name: string | null
          organization_id: string | null
          parent_location_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity_limit?: number | null
          code?: string | null
          created_at?: string | null
          current_utilization?: number | null
          id?: string | null
          is_active?: boolean | null
          location_type?: string | null
          name?: string | null
          organization_id?: string | null
          parent_location_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity_limit?: number | null
          code?: string | null
          created_at?: string | null
          current_utilization?: number | null
          id?: string | null
          is_active?: boolean | null
          location_type?: string | null
          name?: string | null
          organization_id?: string | null
          parent_location_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string | null
          item_id: string | null
          location_id: string | null
          notes: string | null
          organization_id: string | null
          performed_by: string | null
          quantity: number | null
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_date: string | null
          transaction_type: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          location_id?: string | null
          notes?: string | null
          organization_id?: string | null
          performed_by?: string | null
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          location_id?: string | null
          notes?: string | null
          organization_id?: string | null
          performed_by?: string | null
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          unit_cost?: number | null
        }
        Relationships: []
      }
      inventory_transfer_items: {
        Row: {
          created_at: string | null
          id: string | null
          item_id: string | null
          notes: string | null
          organization_id: string | null
          quantity_received: number | null
          quantity_requested: number | null
          quantity_shipped: number | null
          transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity_received?: number | null
          quantity_requested?: number | null
          quantity_shipped?: number | null
          transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity_received?: number | null
          quantity_requested?: number | null
          quantity_shipped?: number | null
          transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_transfers: {
        Row: {
          approved_by: string | null
          created_at: string | null
          expected_arrival_date: string | null
          from_location_id: string | null
          id: string | null
          notes: string | null
          organization_id: string | null
          received_by: string | null
          received_date: string | null
          request_date: string | null
          requested_by: string | null
          ship_date: string | null
          shipped_by: string | null
          status: string | null
          to_location_id: string | null
          transfer_number: string | null
          transfer_type: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          expected_arrival_date?: string | null
          from_location_id?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          received_by?: string | null
          received_date?: string | null
          request_date?: string | null
          requested_by?: string | null
          ship_date?: string | null
          shipped_by?: string | null
          status?: string | null
          to_location_id?: string | null
          transfer_number?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          expected_arrival_date?: string | null
          from_location_id?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          received_by?: string | null
          received_date?: string | null
          request_date?: string | null
          requested_by?: string | null
          ship_date?: string | null
          shipped_by?: string | null
          status?: string | null
          to_location_id?: string | null
          transfer_number?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plan_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          file_path: string | null
          file_size: number | null
          id: string | null
          is_required: boolean | null
          job_plan_id: string | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string | null
          is_required?: boolean | null
          job_plan_id?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string | null
          is_required?: boolean | null
          job_plan_id?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plan_parts: {
        Row: {
          alternative_part_ids: string[] | null
          created_at: string | null
          id: string | null
          inventory_item_id: string | null
          is_critical_part: boolean | null
          job_plan_id: string | null
          notes: string | null
          organization_id: string | null
          part_name: string | null
          part_number: string | null
          quantity_required: number | null
          updated_at: string | null
        }
        Insert: {
          alternative_part_ids?: string[] | null
          created_at?: string | null
          id?: string | null
          inventory_item_id?: string | null
          is_critical_part?: boolean | null
          job_plan_id?: string | null
          notes?: string | null
          organization_id?: string | null
          part_name?: string | null
          part_number?: string | null
          quantity_required?: number | null
          updated_at?: string | null
        }
        Update: {
          alternative_part_ids?: string[] | null
          created_at?: string | null
          id?: string | null
          inventory_item_id?: string | null
          is_critical_part?: boolean | null
          job_plan_id?: string | null
          notes?: string | null
          organization_id?: string | null
          part_name?: string | null
          part_number?: string | null
          quantity_required?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plan_task_skills: {
        Row: {
          created_at: string | null
          estimated_time_minutes: number | null
          id: string | null
          is_critical: boolean | null
          job_plan_task_id: string | null
          organization_id: string | null
          proficiency_level_required:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string | null
          is_critical?: boolean | null
          job_plan_task_id?: string | null
          organization_id?: string | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string | null
          is_critical?: boolean | null
          job_plan_task_id?: string | null
          organization_id?: string | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plan_tasks: {
        Row: {
          completion_criteria: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string | null
          is_critical_step: boolean | null
          job_plan_id: string | null
          meter_group_id: string | null
          notes: string | null
          organization_id: string | null
          safety_precaution_ids: string[] | null
          skill_required: string | null
          task_description: string | null
          task_sequence: number | null
          task_title: string | null
          updated_at: string | null
        }
        Insert: {
          completion_criteria?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string | null
          is_critical_step?: boolean | null
          job_plan_id?: string | null
          meter_group_id?: string | null
          notes?: string | null
          organization_id?: string | null
          safety_precaution_ids?: string[] | null
          skill_required?: string | null
          task_description?: string | null
          task_sequence?: number | null
          task_title?: string | null
          updated_at?: string | null
        }
        Update: {
          completion_criteria?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string | null
          is_critical_step?: boolean | null
          job_plan_id?: string | null
          meter_group_id?: string | null
          notes?: string | null
          organization_id?: string | null
          safety_precaution_ids?: string[] | null
          skill_required?: string | null
          task_description?: string | null
          task_sequence?: number | null
          task_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plan_tools: {
        Row: {
          created_at: string | null
          id: string | null
          is_specialized_tool: boolean | null
          job_plan_id: string | null
          notes: string | null
          organization_id: string | null
          quantity_required: number | null
          tool_description: string | null
          tool_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_specialized_tool?: boolean | null
          job_plan_id?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity_required?: number | null
          tool_description?: string | null
          tool_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_specialized_tool?: boolean | null
          job_plan_id?: string | null
          notes?: string | null
          organization_id?: string | null
          quantity_required?: number | null
          tool_description?: string | null
          tool_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_plans: {
        Row: {
          applicable_asset_types: string[] | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          cost_estimate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration_hours: number | null
          frequency_interval: number | null
          frequency_type: Database["public"]["Enums"]["frequency_type"] | null
          id: string | null
          job_plan_number: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          organization_id: string | null
          priority: string | null
          skill_level_required:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory: string | null
          title: string | null
          updated_at: string | null
          usage_count: number | null
          version: string | null
        }
        Insert: {
          applicable_asset_types?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_interval?: number | null
          frequency_type?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string | null
          job_plan_number?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          organization_id?: string | null
          priority?: string | null
          skill_level_required?:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status?: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
        }
        Update: {
          applicable_asset_types?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_interval?: number | null
          frequency_type?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string | null
          job_plan_number?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          organization_id?: string | null
          priority?: string | null
          skill_level_required?:
            | Database["public"]["Enums"]["skill_level"]
            | null
          status?: Database["public"]["Enums"]["job_plan_status"] | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
        }
        Relationships: []
      }
      maintenance_routes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_optimized: boolean | null
          name: string | null
          organization_id: string | null
          route_number: string | null
          route_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_optimized?: boolean | null
          name?: string | null
          organization_id?: string | null
          route_number?: string | null
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_optimized?: boolean | null
          name?: string | null
          organization_id?: string | null
          route_number?: string | null
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          certifications: string[] | null
          complemented: string | null
          cost_center: string | null
          cost_center_text: string | null
          created_at: string | null
          default_labor_cost_center: string | null
          department: string | null
          division: string | null
          email: string | null
          employee_category: string | null
          employee_number: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string | null
          hire_date: string | null
          holiday_calendar: string | null
          hourly_rate: number | null
          id: string | null
          immediate_manager_id: string | null
          immediate_manager_name: string | null
          immediate_manager_position: string | null
          is_active: boolean | null
          job_grade: string | null
          job_text: string | null
          job_title: string | null
          last_name: string | null
          notes: string | null
          org_unit_code: string | null
          org_unit_text: string | null
          organization_id: string | null
          pa_text: string | null
          phone: string | null
          position_abbr: string | null
          position_code: string | null
          position_grade_desc: string | null
          position_text: string | null
          psa_text: string | null
          updated_at: string | null
          user_id: string | null
          vacancy_status: string | null
        }
        Insert: {
          certifications?: string[] | null
          complemented?: string | null
          cost_center?: string | null
          cost_center_text?: string | null
          created_at?: string | null
          default_labor_cost_center?: string | null
          department?: string | null
          division?: string | null
          email?: string | null
          employee_category?: string | null
          employee_number?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string | null
          hire_date?: string | null
          holiday_calendar?: string | null
          hourly_rate?: number | null
          id?: string | null
          immediate_manager_id?: string | null
          immediate_manager_name?: string | null
          immediate_manager_position?: string | null
          is_active?: boolean | null
          job_grade?: string | null
          job_text?: string | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          org_unit_code?: string | null
          org_unit_text?: string | null
          organization_id?: string | null
          pa_text?: string | null
          phone?: string | null
          position_abbr?: string | null
          position_code?: string | null
          position_grade_desc?: string | null
          position_text?: string | null
          psa_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          vacancy_status?: string | null
        }
        Update: {
          certifications?: string[] | null
          complemented?: string | null
          cost_center?: string | null
          cost_center_text?: string | null
          created_at?: string | null
          default_labor_cost_center?: string | null
          department?: string | null
          division?: string | null
          email?: string | null
          employee_category?: string | null
          employee_number?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string | null
          hire_date?: string | null
          holiday_calendar?: string | null
          hourly_rate?: number | null
          id?: string | null
          immediate_manager_id?: string | null
          immediate_manager_name?: string | null
          immediate_manager_position?: string | null
          is_active?: boolean | null
          job_grade?: string | null
          job_text?: string | null
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          org_unit_code?: string | null
          org_unit_text?: string | null
          organization_id?: string | null
          pa_text?: string | null
          phone?: string | null
          position_abbr?: string | null
          position_code?: string | null
          position_grade_desc?: string | null
          position_text?: string | null
          psa_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          vacancy_status?: string | null
        }
        Relationships: []
      }
      person_business_areas: {
        Row: {
          assigned_date: string | null
          business_area_id: string | null
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          organization_id: string | null
          person_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          business_area_id?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          organization_id?: string | null
          person_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          business_area_id?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          organization_id?: string | null
          person_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      person_crafts: {
        Row: {
          assigned_date: string | null
          certification_status: string | null
          craft_id: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          organization_id: string | null
          person_id: string | null
          proficiency_level: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          certification_status?: string | null
          craft_id?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          proficiency_level?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          certification_status?: string | null
          craft_id?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          proficiency_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      person_skills: {
        Row: {
          certification_date: string | null
          certification_expiry: string | null
          certified: boolean | null
          created_at: string | null
          id: string | null
          notes: string | null
          organization_id: string | null
          person_id: string | null
          proficiency_level:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          person_id?: string | null
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      pm_schedule_assignments: {
        Row: {
          assigned_person_id: string | null
          assignment_role: string | null
          created_at: string | null
          id: string | null
          organization_id: string | null
          pm_schedule_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_person_id?: string | null
          assignment_role?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_person_id?: string | null
          assignment_role?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pm_schedule_materials: {
        Row: {
          bom_item_id: string | null
          created_at: string | null
          estimated_unit_cost: number | null
          id: string | null
          notes: string | null
          organization_id: string | null
          planned_quantity: number | null
          pm_schedule_id: string | null
          updated_at: string | null
        }
        Insert: {
          bom_item_id?: string | null
          created_at?: string | null
          estimated_unit_cost?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          planned_quantity?: number | null
          pm_schedule_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bom_item_id?: string | null
          created_at?: string | null
          estimated_unit_cost?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          planned_quantity?: number | null
          pm_schedule_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pm_schedules: {
        Row: {
          asset_id: string | null
          assigned_team_id: string | null
          assigned_to: string | null
          auto_generate_wo: boolean | null
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          estimated_labor_cost: number | null
          estimated_material_cost: number | null
          frequency_type:
            | Database["public"]["Enums"]["pm_frequency_type"]
            | null
          frequency_unit:
            | Database["public"]["Enums"]["pm_frequency_unit"]
            | null
          frequency_value: number | null
          id: string | null
          is_active: boolean | null
          job_plan_id: string | null
          last_completed_date: string | null
          lead_time_days: number | null
          next_due_date: string | null
          notification_enabled: boolean | null
          organization_id: string | null
          other_costs: number | null
          priority: string | null
          route_id: string | null
          safety_precaution_ids: string[] | null
          schedule_number: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["pm_status"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          auto_generate_wo?: boolean | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          frequency_type?:
            | Database["public"]["Enums"]["pm_frequency_type"]
            | null
          frequency_unit?:
            | Database["public"]["Enums"]["pm_frequency_unit"]
            | null
          frequency_value?: number | null
          id?: string | null
          is_active?: boolean | null
          job_plan_id?: string | null
          last_completed_date?: string | null
          lead_time_days?: number | null
          next_due_date?: string | null
          notification_enabled?: boolean | null
          organization_id?: string | null
          other_costs?: number | null
          priority?: string | null
          route_id?: string | null
          safety_precaution_ids?: string[] | null
          schedule_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["pm_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          auto_generate_wo?: boolean | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          frequency_type?:
            | Database["public"]["Enums"]["pm_frequency_type"]
            | null
          frequency_unit?:
            | Database["public"]["Enums"]["pm_frequency_unit"]
            | null
          frequency_value?: number | null
          id?: string | null
          is_active?: boolean | null
          job_plan_id?: string | null
          last_completed_date?: string | null
          lead_time_days?: number | null
          next_due_date?: string | null
          notification_enabled?: boolean | null
          organization_id?: string | null
          other_costs?: number | null
          priority?: string | null
          route_id?: string | null
          safety_precaution_ids?: string[] | null
          schedule_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["pm_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_assets: {
        Row: {
          asset_id: string | null
          created_at: string | null
          estimated_time_minutes: number | null
          id: string | null
          notes: string | null
          organization_id: string | null
          route_id: string | null
          sequence_order: number | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          route_id?: string | null
          sequence_order?: number | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          route_id?: string | null
          sequence_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          asset_id: string | null
          corrective_actions: string | null
          cost_estimate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          incident_date: string | null
          incident_number: string | null
          investigation_notes: string | null
          investigator_name: string | null
          location: string | null
          organization_id: string | null
          regulatory_report_number: string | null
          regulatory_reporting_required: boolean | null
          reporter_email: string | null
          reporter_name: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          status: Database["public"]["Enums"]["incident_status"] | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          asset_id?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          incident_date?: string | null
          incident_number?: string | null
          investigation_notes?: string | null
          investigator_name?: string | null
          location?: string | null
          organization_id?: string | null
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          asset_id?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          incident_date?: string | null
          incident_number?: string | null
          investigation_notes?: string | null
          investigator_name?: string | null
          location?: string | null
          organization_id?: string | null
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      safety_precautions: {
        Row: {
          applicable_scenarios: Json | null
          associated_hazards: string[] | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          organization_id: string | null
          precaution_code: string | null
          regulatory_references: string[] | null
          required_actions: string[] | null
          severity_level:
            | Database["public"]["Enums"]["precaution_severity"]
            | null
          status: Database["public"]["Enums"]["precaution_status"] | null
          subcategory: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          usage_count: number | null
        }
        Insert: {
          applicable_scenarios?: Json | null
          associated_hazards?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          organization_id?: string | null
          precaution_code?: string | null
          regulatory_references?: string[] | null
          required_actions?: string[] | null
          severity_level?:
            | Database["public"]["Enums"]["precaution_severity"]
            | null
          status?: Database["public"]["Enums"]["precaution_status"] | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
        }
        Update: {
          applicable_scenarios?: Json | null
          associated_hazards?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          organization_id?: string | null
          precaution_code?: string | null
          regulatory_references?: string[] | null
          required_actions?: string[] | null
          severity_level?:
            | Database["public"]["Enums"]["precaution_severity"]
            | null
          status?: Database["public"]["Enums"]["precaution_status"] | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"] | null
          certification_required: boolean | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          skill_code: string | null
          skill_name: string | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          skill_code?: string | null
          skill_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"] | null
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          skill_code?: string | null
          skill_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          notes: string | null
          organization_id: string | null
          payment_terms: number | null
          phone: string | null
          rating: number | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: number | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: number | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          person_id: string | null
          role_in_team: Database["public"]["Enums"]["team_role"] | null
          team_id: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          person_id?: string | null
          role_in_team?: Database["public"]["Enums"]["team_role"] | null
          team_id?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          person_id?: string | null
          role_in_team?: Database["public"]["Enums"]["team_role"] | null
          team_id?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          shift: Database["public"]["Enums"]["team_shift"] | null
          team_code: string | null
          team_leader_id: string | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          shift?: Database["public"]["Enums"]["team_shift"] | null
          team_code?: string | null
          team_leader_id?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          shift?: Database["public"]["Enums"]["team_shift"] | null
          team_code?: string | null
          team_leader_id?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_order_skill_requirements: {
        Row: {
          assigned_person_id: string | null
          created_at: string | null
          id: string | null
          is_fulfilled: boolean | null
          organization_id: string | null
          proficiency_level_required:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id: string | null
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          assigned_person_id?: string | null
          created_at?: string | null
          id?: string | null
          is_fulfilled?: boolean | null
          organization_id?: string | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          assigned_person_id?: string | null
          created_at?: string | null
          id?: string | null
          is_fulfilled?: boolean | null
          organization_id?: string | null
          proficiency_level_required?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          skill_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          actual_finish_date: string | null
          actual_start_date: string | null
          asset_category: string | null
          asset_id: string | null
          asset_name: string | null
          asset_number: string | null
          asset_status: string | null
          assigned_technician: string | null
          assigned_technician_name: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          generation_type: string | null
          id: string | null
          incident_report_id: string | null
          maintenance_type: string | null
          notes: string | null
          organization_id: string | null
          pm_frequency_type:
            | Database["public"]["Enums"]["pm_frequency_type"]
            | null
          pm_schedule_id: string | null
          pm_schedule_name: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          target_finish_date: string | null
          target_start_date: string | null
          title: string | null
          updated_at: string | null
          work_order_type: Database["public"]["Enums"]["work_order_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_work_order: {
        Args: { _organization_id?: string; _work_order_id: string }
        Returns: boolean
      }
      get_recommended_technicians: {
        Args: { _organization_id: string; _work_order_id: string }
        Returns: {
          match_percentage: number
          matched_skills: Json
          missing_skills: Json
          person_id: string
          person_name: string
          total_experience_years: number
        }[]
      }
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
      notification_type:
        | "work_order_created"
        | "work_order_assigned"
        | "work_order_completed"
        | "work_order_overdue"
        | "pm_schedule_due"
      pm_frequency_type:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "custom"
      pm_frequency_unit: "days" | "weeks" | "months" | "years"
      pm_status: "active" | "paused" | "suspended" | "completed"
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
      work_order_type: "pm" | "cm"
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
      notification_type: [
        "work_order_created",
        "work_order_assigned",
        "work_order_completed",
        "work_order_overdue",
        "pm_schedule_due",
      ],
      pm_frequency_type: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
        "custom",
      ],
      pm_frequency_unit: ["days", "weeks", "months", "years"],
      pm_status: ["active", "paused", "suspended", "completed"],
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
      work_order_type: ["pm", "cm"],
    },
  },
} as const
