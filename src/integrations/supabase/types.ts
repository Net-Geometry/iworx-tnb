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
      ai_chat_conversations: {
        Row: {
          anomaly_ids: string[] | null
          asset_ids: string[] | null
          created_at: string | null
          function_calls: Json | null
          id: string
          message: string
          model_used: string | null
          organization_id: string
          prediction_ids: string[] | null
          response_time_ms: number | null
          role: string
          tokens_used: number | null
          user_id: string
          work_order_ids: string[] | null
        }
        Insert: {
          anomaly_ids?: string[] | null
          asset_ids?: string[] | null
          created_at?: string | null
          function_calls?: Json | null
          id?: string
          message: string
          model_used?: string | null
          organization_id: string
          prediction_ids?: string[] | null
          response_time_ms?: number | null
          role: string
          tokens_used?: number | null
          user_id: string
          work_order_ids?: string[] | null
        }
        Update: {
          anomaly_ids?: string[] | null
          asset_ids?: string[] | null
          created_at?: string | null
          function_calls?: Json | null
          id?: string
          message?: string
          model_used?: string | null
          organization_id?: string
          prediction_ids?: string[] | null
          response_time_ms?: number | null
          role?: string
          tokens_used?: number | null
          user_id?: string
          work_order_ids?: string[] | null
        }
        Relationships: []
      }
      anomaly_detections: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          anomaly_score: number
          anomaly_type: string
          asset_id: string | null
          created_at: string | null
          description: string
          detected_at: string
          detected_values: Json | null
          expected_range: Json | null
          id: string
          meter_group_id: string | null
          organization_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          anomaly_score: number
          anomaly_type: string
          asset_id?: string | null
          created_at?: string | null
          description: string
          detected_at?: string
          detected_values?: Json | null
          expected_range?: Json | null
          id?: string
          meter_group_id?: string | null
          organization_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          anomaly_score?: number
          anomaly_type?: string
          asset_id?: string | null
          created_at?: string | null
          description?: string
          detected_at?: string
          detected_values?: Json | null
          expected_range?: Json | null
          id?: string
          meter_group_id?: string | null
          organization_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      asset_display_preferences: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          is_global_default: boolean
          max_readings_shown: number
          organization_id: string
          refresh_interval_seconds: number
          selected_sensor_types: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          is_global_default?: boolean
          max_readings_shown?: number
          organization_id: string
          refresh_interval_seconds?: number
          selected_sensor_types?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          is_global_default?: boolean
          max_readings_shown?: number
          organization_id?: string
          refresh_interval_seconds?: number
          selected_sensor_types?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      asset_location_history: {
        Row: {
          asset_id: string
          created_at: string | null
          id: string
          location: unknown
          operating_status: string | null
          operator_id: string | null
          organization_id: string
          tracked_at: string
          tracking_source: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          id?: string
          location: unknown
          operating_status?: string | null
          operator_id?: string | null
          organization_id: string
          tracked_at?: string
          tracking_source?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          id?: string
          location?: unknown
          operating_status?: string | null
          operator_id?: string | null
          organization_id?: string
          tracked_at?: string
          tracking_source?: string | null
        }
        Relationships: []
      }
      asset_sensor_readings: {
        Row: {
          alert_threshold_exceeded: boolean | null
          asset_id: string
          created_at: string
          device_id: string | null
          id: string
          metadata: Json | null
          organization_id: string
          reading_value: number
          sensor_type: string
          timestamp: string
          unit: string
        }
        Insert: {
          alert_threshold_exceeded?: boolean | null
          asset_id: string
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          reading_value: number
          sensor_type: string
          timestamp?: string
          unit: string
        }
        Update: {
          alert_threshold_exceeded?: boolean | null
          asset_id?: string
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          reading_value?: number
          sensor_type?: string
          timestamp?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_sensor_readings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      condition_alarms: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          acknowledged_notes: string | null
          alarm_type: string
          asset_id: string | null
          created_at: string | null
          device_id: string | null
          id: string
          metric_name: string
          organization_id: string
          resolution_notes: string | null
          resolved_at: string | null
          sensor_context: Json | null
          status: string | null
          threshold_id: string | null
          threshold_value: number
          triggered_value: number
          updated_at: string | null
          work_order_created_at: string | null
          work_order_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledged_notes?: string | null
          alarm_type: string
          asset_id?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          metric_name: string
          organization_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          sensor_context?: Json | null
          status?: string | null
          threshold_id?: string | null
          threshold_value: number
          triggered_value: number
          updated_at?: string | null
          work_order_created_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledged_notes?: string | null
          alarm_type?: string
          asset_id?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          metric_name?: string
          organization_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          sensor_context?: Json | null
          status?: string | null
          threshold_id?: string | null
          threshold_value?: number
          triggered_value?: number
          updated_at?: string | null
          work_order_created_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condition_alarms_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "condition_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_monitoring_history: {
        Row: {
          alarm_id: string | null
          asset_id: string
          device_id: string | null
          health_status: string | null
          id: string
          metric_name: string
          organization_id: string
          recorded_at: string | null
          threshold_id: string | null
          unit: string | null
          value: number
        }
        Insert: {
          alarm_id?: string | null
          asset_id: string
          device_id?: string | null
          health_status?: string | null
          id?: string
          metric_name: string
          organization_id: string
          recorded_at?: string | null
          threshold_id?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          alarm_id?: string | null
          asset_id?: string
          device_id?: string | null
          health_status?: string | null
          id?: string
          metric_name?: string
          organization_id?: string
          recorded_at?: string | null
          threshold_id?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "condition_monitoring_history_alarm_id_fkey"
            columns: ["alarm_id"]
            isOneToOne: false
            referencedRelation: "condition_alarms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_monitoring_history_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "condition_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_thresholds: {
        Row: {
          asset_id: string | null
          auto_create_work_order: boolean | null
          created_at: string | null
          created_by: string | null
          critical_max: number | null
          critical_min: number | null
          device_id: string | null
          enabled: boolean | null
          id: string
          metric_name: string
          notification_emails: string[] | null
          organization_id: string
          updated_at: string | null
          warning_max: number | null
          warning_min: number | null
        }
        Insert: {
          asset_id?: string | null
          auto_create_work_order?: boolean | null
          created_at?: string | null
          created_by?: string | null
          critical_max?: number | null
          critical_min?: number | null
          device_id?: string | null
          enabled?: boolean | null
          id?: string
          metric_name: string
          notification_emails?: string[] | null
          organization_id: string
          updated_at?: string | null
          warning_max?: number | null
          warning_min?: number | null
        }
        Update: {
          asset_id?: string | null
          auto_create_work_order?: boolean | null
          created_at?: string | null
          created_by?: string | null
          critical_max?: number | null
          critical_min?: number | null
          device_id?: string | null
          enabled?: boolean | null
          id?: string
          metric_name?: string
          notification_emails?: string[] | null
          organization_id?: string
          updated_at?: string | null
          warning_max?: number | null
          warning_min?: number | null
        }
        Relationships: []
      }
      cross_vertical_cost_insights: {
        Row: {
          content: string
          created_at: string | null
          data: Json
          embedding: string | null
          id: string
          insight_type: string
          period_end: string
          period_start: string
          time_period: string
        }
        Insert: {
          content: string
          created_at?: string | null
          data: Json
          embedding?: string | null
          id?: string
          insight_type: string
          period_end: string
          period_start: string
          time_period: string
        }
        Update: {
          content?: string
          created_at?: string | null
          data?: Json
          embedding?: string | null
          id?: string
          insight_type?: string
          period_end?: string
          period_start?: string
          time_period?: string
        }
        Relationships: []
      }
      digital_twin_scenarios: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          parameters: Json
          scenario_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          parameters: Json
          scenario_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          parameters?: Json
          scenario_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      geofence_events: {
        Row: {
          asset_id: string | null
          created_at: string | null
          duration_minutes: number | null
          entry_time: string | null
          event_location: unknown
          event_time: string
          event_type: string
          exit_time: string | null
          geofence_zone_id: string
          id: string
          organization_id: string
          person_id: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          entry_time?: string | null
          event_location: unknown
          event_time?: string
          event_type: string
          exit_time?: string | null
          geofence_zone_id: string
          id?: string
          organization_id: string
          person_id?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          entry_time?: string | null
          event_location?: unknown
          event_time?: string
          event_type?: string
          exit_time?: string | null
          geofence_zone_id?: string
          id?: string
          organization_id?: string
          person_id?: string | null
        }
        Relationships: []
      }
      geofence_zones: {
        Row: {
          allowed_person_ids: string[] | null
          boundary: unknown
          center_point: unknown
          created_at: string | null
          description: string | null
          entry_notification: boolean | null
          exit_notification: boolean | null
          hierarchy_node_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          radius_meters: number | null
          restricted_access: boolean | null
          updated_at: string | null
          zone_type: string | null
        }
        Insert: {
          allowed_person_ids?: string[] | null
          boundary: unknown
          center_point?: unknown
          created_at?: string | null
          description?: string | null
          entry_notification?: boolean | null
          exit_notification?: boolean | null
          hierarchy_node_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          radius_meters?: number | null
          restricted_access?: boolean | null
          updated_at?: string | null
          zone_type?: string | null
        }
        Update: {
          allowed_person_ids?: string[] | null
          boundary?: unknown
          center_point?: unknown
          created_at?: string | null
          description?: string | null
          entry_notification?: boolean | null
          exit_notification?: boolean | null
          hierarchy_node_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          radius_meters?: number | null
          restricted_access?: boolean | null
          updated_at?: string | null
          zone_type?: string | null
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
      iot_data: {
        Row: {
          created_at: string
          device_id: string
          id: string
          lorawan_metadata: Json | null
          metric_name: string
          organization_id: string
          timestamp: string
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          lorawan_metadata?: Json | null
          metric_name: string
          organization_id: string
          timestamp?: string
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          lorawan_metadata?: Json | null
          metric_name?: string
          organization_id?: string
          timestamp?: string
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "iot_data_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_device_display_preferences: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_global_default: boolean
          lorawan_fields: Json
          max_readings_shown: number
          organization_id: string
          refresh_interval_seconds: number
          selected_metrics: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          is_global_default?: boolean
          lorawan_fields?: Json
          max_readings_shown?: number
          organization_id: string
          refresh_interval_seconds?: number
          selected_metrics?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_global_default?: boolean
          lorawan_fields?: Json
          max_readings_shown?: number
          organization_id?: string
          refresh_interval_seconds?: number
          selected_metrics?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_device_display_preferences_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iot_device_display_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_device_meter_mappings: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          meter_id: string
          metric_mapping: Json
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          is_active?: boolean
          meter_id: string
          metric_mapping?: Json
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          meter_id?: string
          metric_mapping?: Json
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_device_meter_mappings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_device_types: {
        Row: {
          created_at: string
          created_by: string
          decoder_config: Json
          default_display_config: Json | null
          description: string | null
          id: string
          is_active: boolean
          manufacturer: string | null
          model: string | null
          name: string
          organization_id: string
          sensor_schema: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          decoder_config?: Json
          default_display_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          manufacturer?: string | null
          model?: string | null
          name: string
          organization_id: string
          sensor_schema?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          decoder_config?: Json
          default_display_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          manufacturer?: string | null
          model?: string | null
          name?: string
          organization_id?: string
          sensor_schema?: Json
          updated_at?: string
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          asset_id: string | null
          created_at: string
          created_by: string
          dev_eui: string
          device_identifier: string
          device_name: string
          device_type_id: string | null
          id: string
          last_seen_at: string | null
          lorawan_config: Json
          network_provider: Database["public"]["Enums"]["iot_network_provider"]
          organization_id: string
          sensor_position_3d: Json | null
          status: Database["public"]["Enums"]["iot_device_status"]
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          created_by: string
          dev_eui: string
          device_identifier: string
          device_name: string
          device_type_id?: string | null
          id?: string
          last_seen_at?: string | null
          lorawan_config?: Json
          network_provider?: Database["public"]["Enums"]["iot_network_provider"]
          organization_id: string
          sensor_position_3d?: Json | null
          status?: Database["public"]["Enums"]["iot_device_status"]
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          created_by?: string
          dev_eui?: string
          device_identifier?: string
          device_name?: string
          device_type_id?: string | null
          id?: string
          last_seen_at?: string | null
          lorawan_config?: Json
          network_provider?: Database["public"]["Enums"]["iot_network_provider"]
          organization_id?: string
          sensor_position_3d?: Json | null
          status?: Database["public"]["Enums"]["iot_device_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_devices_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iot_devices_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "iot_device_types"
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
      ml_predictions: {
        Row: {
          asset_id: string
          confidence_score: number
          contributing_factors: Json | null
          created_at: string | null
          failure_probability_30d: number | null
          failure_probability_60d: number | null
          failure_probability_90d: number | null
          feature_importance: Json | null
          health_score: number | null
          id: string
          model_type: string
          model_version: string
          organization_id: string
          predicted_at: string
          predicted_failure_date: string | null
          prediction_type: string
          prediction_window_days: number | null
          remaining_useful_life_days: number | null
          training_data_period: Json | null
          valid_until: string | null
        }
        Insert: {
          asset_id: string
          confidence_score: number
          contributing_factors?: Json | null
          created_at?: string | null
          failure_probability_30d?: number | null
          failure_probability_60d?: number | null
          failure_probability_90d?: number | null
          feature_importance?: Json | null
          health_score?: number | null
          id?: string
          model_type: string
          model_version: string
          organization_id: string
          predicted_at?: string
          predicted_failure_date?: string | null
          prediction_type: string
          prediction_window_days?: number | null
          remaining_useful_life_days?: number | null
          training_data_period?: Json | null
          valid_until?: string | null
        }
        Update: {
          asset_id?: string
          confidence_score?: number
          contributing_factors?: Json | null
          created_at?: string | null
          failure_probability_30d?: number | null
          failure_probability_60d?: number | null
          failure_probability_90d?: number | null
          feature_importance?: Json | null
          health_score?: number | null
          id?: string
          model_type?: string
          model_version?: string
          organization_id?: string
          predicted_at?: string
          predicted_failure_date?: string | null
          prediction_type?: string
          prediction_window_days?: number | null
          remaining_useful_life_days?: number | null
          training_data_period?: Json | null
          valid_until?: string | null
        }
        Relationships: []
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
            foreignKeyName: "notifications_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_data_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_data_embeddings_organization_id_fkey"
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
      person_location_history: {
        Row: {
          accuracy_meters: number | null
          activity_type: string | null
          altitude_meters: number | null
          battery_level: number | null
          bearing_degrees: number | null
          created_at: string | null
          device_id: string | null
          id: string
          location: unknown
          on_duty: boolean | null
          organization_id: string
          person_id: string
          speed_kmh: number | null
          tracked_at: string
          tracking_source: string | null
          work_order_id: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          activity_type?: string | null
          altitude_meters?: number | null
          battery_level?: number | null
          bearing_degrees?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          location: unknown
          on_duty?: boolean | null
          organization_id: string
          person_id: string
          speed_kmh?: number | null
          tracked_at?: string
          tracking_source?: string | null
          work_order_id?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          activity_type?: string | null
          altitude_meters?: number | null
          battery_level?: number | null
          bearing_degrees?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          location?: unknown
          on_duty?: boolean | null
          organization_id?: string
          person_id?: string
          speed_kmh?: number | null
          tracked_at?: string
          tracking_source?: string | null
          work_order_id?: string | null
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
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      scenario_simulation_results: {
        Row: {
          baseline_value: number | null
          calculated_at: string
          id: string
          impact_description: string | null
          metric_name: string
          percentage_change: number | null
          scenario_id: string
          simulated_value: number | null
          unit: string | null
        }
        Insert: {
          baseline_value?: number | null
          calculated_at?: string
          id?: string
          impact_description?: string | null
          metric_name: string
          percentage_change?: number | null
          scenario_id: string
          simulated_value?: number | null
          unit?: string | null
        }
        Update: {
          baseline_value?: number | null
          calculated_at?: string
          id?: string
          impact_description?: string | null
          metric_name?: string
          percentage_change?: number | null
          scenario_id?: string
          simulated_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_simulation_results_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "digital_twin_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      superadmin_ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          query: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          query: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          query?: string
          response?: string
          user_id?: string
        }
        Relationships: []
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
          allows_work_order_creation: boolean | null
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
          reject_target_step_id: string | null
          sla_hours: number | null
          step_order: number
          step_type: string | null
          template_id: string
          updated_at: string | null
          work_order_status: string | null
        }
        Insert: {
          allows_work_order_creation?: boolean | null
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
          reject_target_step_id?: string | null
          sla_hours?: number | null
          step_order: number
          step_type?: string | null
          template_id: string
          updated_at?: string | null
          work_order_status?: string | null
        }
        Update: {
          allows_work_order_creation?: boolean | null
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
          reject_target_step_id?: string | null
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
            foreignKeyName: "workflow_template_steps_reject_target_step_id_fkey"
            columns: ["reject_target_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
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
          allow_public_access: boolean | null
          asset_image_url: string | null
          asset_number: string | null
          category: string | null
          created_at: string | null
          criticality: string | null
          current_location: unknown
          description: string | null
          health_score: number | null
          hierarchy_node_id: string | null
          id: string | null
          is_mobile: boolean | null
          last_location_update: string | null
          last_maintenance_date: string | null
          manufacturer: string | null
          model: string | null
          model_3d_rotation: Json | null
          model_3d_scale: Json | null
          model_3d_url: string | null
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
          allow_public_access?: boolean | null
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          current_location?: unknown
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string | null
          is_mobile?: boolean | null
          last_location_update?: string | null
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          model_3d_rotation?: Json | null
          model_3d_scale?: Json | null
          model_3d_url?: string | null
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
          allow_public_access?: boolean | null
          asset_image_url?: string | null
          asset_number?: string | null
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          current_location?: unknown
          description?: string | null
          health_score?: number | null
          hierarchy_node_id?: string | null
          id?: string | null
          is_mobile?: boolean | null
          last_location_update?: string | null
          last_maintenance_date?: string | null
          manufacturer?: string | null
          model?: string | null
          model_3d_rotation?: Json | null
          model_3d_scale?: Json | null
          model_3d_url?: string | null
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
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
      meter_group_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          meter_group_id: string | null
          meter_id: string | null
          notes: string | null
          organization_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          meter_group_id?: string | null
          meter_id?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          meter_group_id?: string | null
          meter_id?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meter_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          group_number: string | null
          group_type: string | null
          hierarchy_node_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          organization_id: string | null
          purpose: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_number?: string | null
          group_type?: string | null
          hierarchy_node_id?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          purpose?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_number?: string | null
          group_type?: string | null
          hierarchy_node_id?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          purpose?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meters: {
        Row: {
          accuracy_class: string | null
          calibration_certificate_number: string | null
          coordinates: Json | null
          created_at: string | null
          created_by: string | null
          current_rating: number | null
          description: string | null
          id: string | null
          installation_date: string | null
          installation_location: string | null
          last_calibration_date: string | null
          last_reading: number | null
          last_reading_date: string | null
          location: unknown
          manufacturer: string | null
          meter_constant: number | null
          meter_number: string | null
          meter_type: string | null
          model: string | null
          multiplier: number | null
          next_calibration_date: string | null
          notes: string | null
          organization_id: string | null
          phase_type: string | null
          serial_number: string | null
          status: string | null
          unit_id: number | null
          updated_at: string | null
          voltage_rating: number | null
        }
        Insert: {
          accuracy_class?: string | null
          calibration_certificate_number?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_rating?: number | null
          description?: string | null
          id?: string | null
          installation_date?: string | null
          installation_location?: string | null
          last_calibration_date?: string | null
          last_reading?: number | null
          last_reading_date?: string | null
          location?: unknown
          manufacturer?: string | null
          meter_constant?: number | null
          meter_number?: string | null
          meter_type?: string | null
          model?: string | null
          multiplier?: number | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id?: string | null
          phase_type?: string | null
          serial_number?: string | null
          status?: string | null
          unit_id?: number | null
          updated_at?: string | null
          voltage_rating?: number | null
        }
        Update: {
          accuracy_class?: string | null
          calibration_certificate_number?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_rating?: number | null
          description?: string | null
          id?: string | null
          installation_date?: string | null
          installation_location?: string | null
          last_calibration_date?: string | null
          last_reading?: number | null
          last_reading_date?: string | null
          location?: unknown
          manufacturer?: string | null
          meter_constant?: number | null
          meter_number?: string | null
          meter_type?: string | null
          model?: string | null
          multiplier?: number | null
          next_calibration_date?: string | null
          notes?: string | null
          organization_id?: string | null
          phase_type?: string | null
          serial_number?: string | null
          status?: string | null
          unit_id?: number | null
          updated_at?: string | null
          voltage_rating?: number | null
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
          assigned_by: string | null
          assigned_date: string | null
          assigned_person_id: string | null
          assignment_role: string | null
          created_at: string | null
          id: string | null
          organization_id: string | null
          pm_schedule_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          assigned_person_id?: string | null
          assignment_role?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          assigned_person_id?: string | null
          assignment_role?: string | null
          created_at?: string | null
          id?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
        }
        Relationships: []
      }
      pm_schedule_history: {
        Row: {
          completed_by: string | null
          completed_date: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          organization_id: string | null
          pm_schedule_id: string | null
          status: string | null
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          completed_by?: string | null
          completed_date?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          status?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          completed_by?: string | null
          completed_date?: string | null
          created_at?: string | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          status?: string | null
          updated_at?: string | null
          work_order_id?: string | null
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
          unit: string | null
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
          unit?: string | null
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
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pm_schedules: {
        Row: {
          asset_id: string | null
          assigned_person_id: string | null
          assigned_team_id: string | null
          assigned_to: string | null
          auto_generate_wo: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration_hours: number | null
          estimated_labor_cost: number | null
          estimated_material_cost: number | null
          frequency_type: string | null
          frequency_unit: string | null
          frequency_value: number | null
          id: string | null
          is_active: boolean | null
          job_plan_id: string | null
          last_completed_date: string | null
          lead_time_days: number | null
          location_node_id: string | null
          maintenance_route_id: string | null
          name: string | null
          next_due_date: string | null
          notification_enabled: boolean | null
          organization_id: string | null
          other_costs: number | null
          priority: string | null
          route_id: string | null
          safety_precaution_ids: string[] | null
          schedule_number: string | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_person_id?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          auto_generate_wo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          frequency_type?: string | null
          frequency_unit?: string | null
          frequency_value?: number | null
          id?: string | null
          is_active?: boolean | null
          job_plan_id?: string | null
          last_completed_date?: string | null
          lead_time_days?: number | null
          location_node_id?: string | null
          maintenance_route_id?: string | null
          name?: string | null
          next_due_date?: string | null
          notification_enabled?: boolean | null
          organization_id?: string | null
          other_costs?: number | null
          priority?: string | null
          route_id?: string | null
          safety_precaution_ids?: string[] | null
          schedule_number?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_person_id?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          auto_generate_wo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          frequency_type?: string | null
          frequency_unit?: string | null
          frequency_value?: number | null
          id?: string | null
          is_active?: boolean | null
          job_plan_id?: string | null
          last_completed_date?: string | null
          lead_time_days?: number | null
          location_node_id?: string | null
          maintenance_route_id?: string | null
          name?: string | null
          next_due_date?: string | null
          notification_enabled?: boolean | null
          organization_id?: string | null
          other_costs?: number | null
          priority?: string | null
          route_id?: string | null
          safety_precaution_ids?: string[] | null
          schedule_number?: string | null
          start_date?: string | null
          status?: string | null
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
          attachment_metadata: Json | null
          attachment_urls: string[] | null
          business_impact_notes: string | null
          corrective_actions: string | null
          cost_estimate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_labor_cost: number | null
          estimated_material_cost: number | null
          estimated_repair_hours: number | null
          id: string | null
          immediate_actions: string | null
          incident_date: string | null
          incident_number: string | null
          investigation_notes: string | null
          investigator_name: string | null
          location: string | null
          organization_id: string | null
          priority_assessment: string | null
          regulatory_report_number: string | null
          regulatory_reporting_required: boolean | null
          reporter_email: string | null
          reporter_name: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          status: Database["public"]["Enums"]["incident_status"] | null
          suggested_job_plan_id: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          wo_assigned_technician: string | null
          wo_estimated_cost: number | null
          wo_estimated_duration_hours: number | null
          wo_maintenance_type: string | null
          wo_notes: string | null
          wo_priority: string | null
          wo_target_finish_date: string | null
          wo_target_start_date: string | null
        }
        Insert: {
          asset_id?: string | null
          attachment_metadata?: Json | null
          attachment_urls?: string[] | null
          business_impact_notes?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          estimated_repair_hours?: number | null
          id?: string | null
          immediate_actions?: string | null
          incident_date?: string | null
          incident_number?: string | null
          investigation_notes?: string | null
          investigator_name?: string | null
          location?: string | null
          organization_id?: string | null
          priority_assessment?: string | null
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          suggested_job_plan_id?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          wo_assigned_technician?: string | null
          wo_estimated_cost?: number | null
          wo_estimated_duration_hours?: number | null
          wo_maintenance_type?: string | null
          wo_notes?: string | null
          wo_priority?: string | null
          wo_target_finish_date?: string | null
          wo_target_start_date?: string | null
        }
        Update: {
          asset_id?: string | null
          attachment_metadata?: Json | null
          attachment_urls?: string[] | null
          business_impact_notes?: string | null
          corrective_actions?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_labor_cost?: number | null
          estimated_material_cost?: number | null
          estimated_repair_hours?: number | null
          id?: string | null
          immediate_actions?: string | null
          incident_date?: string | null
          incident_number?: string | null
          investigation_notes?: string | null
          investigator_name?: string | null
          location?: string | null
          organization_id?: string | null
          priority_assessment?: string | null
          regulatory_report_number?: string | null
          regulatory_reporting_required?: boolean | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          suggested_job_plan_id?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          wo_assigned_technician?: string | null
          wo_estimated_cost?: number | null
          wo_estimated_duration_hours?: number | null
          wo_maintenance_type?: string | null
          wo_notes?: string | null
          wo_priority?: string | null
          wo_target_finish_date?: string | null
          wo_target_start_date?: string | null
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
          asset_id: string | null
          assigned_technician: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          generation_type: string | null
          id: string | null
          incident_report_id: string | null
          job_plan_id: string | null
          location_node_id: string | null
          maintenance_type: string | null
          notes: string | null
          organization_id: string | null
          pm_schedule_id: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          target_finish_date: string | null
          target_start_date: string | null
          title: string | null
          updated_at: string | null
          work_order_type: Database["public"]["Enums"]["work_order_type"] | null
        }
        Insert: {
          actual_finish_date?: string | null
          actual_start_date?: string | null
          asset_id?: string | null
          assigned_technician?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          generation_type?: string | null
          id?: string | null
          incident_report_id?: string | null
          job_plan_id?: string | null
          location_node_id?: string | null
          maintenance_type?: string | null
          notes?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          target_finish_date?: string | null
          target_start_date?: string | null
          title?: string | null
          updated_at?: string | null
          work_order_type?:
            | Database["public"]["Enums"]["work_order_type"]
            | null
        }
        Update: {
          actual_finish_date?: string | null
          actual_start_date?: string | null
          asset_id?: string | null
          assigned_technician?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          generation_type?: string | null
          id?: string | null
          incident_report_id?: string | null
          job_plan_id?: string | null
          location_node_id?: string | null
          maintenance_type?: string | null
          notes?: string | null
          organization_id?: string | null
          pm_schedule_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          target_finish_date?: string | null
          target_start_date?: string | null
          title?: string | null
          updated_at?: string | null
          work_order_type?:
            | Database["public"]["Enums"]["work_order_type"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_travel_distance: {
        Args: { _end_time: string; _person_id: string; _start_time: string }
        Returns: number
      }
      check_geofence_status: {
        Args: { _person_id: string }
        Returns: {
          distance_to_center_meters: number
          is_inside: boolean
          zone_id: string
          zone_name: string
          zone_type: string
        }[]
      }
      delete_work_order: {
        Args: { _organization_id?: string; _work_order_id: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_nearby_people: {
        Args: {
          _organization_id?: string
          radius_km?: number
          target_lat: number
          target_lng: number
        }
        Returns: {
          current_lat: number
          current_lng: number
          distance_km: number
          last_update: string
          person_id: string
          person_name: string
        }[]
      }
      find_nearest_technician: {
        Args: {
          _organization_id?: string
          max_distance_km?: number
          required_skill_ids?: string[]
          target_lat: number
          target_lng: number
        }
        Returns: {
          current_lat: number
          current_lng: number
          distance_km: number
          matched_skills: number
          person_id: string
          person_name: string
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
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
      get_user_organizations: { Args: { _user_id: string }; Returns: string[] }
      get_user_permissions: { Args: { _user_id: string }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      has_cross_project_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      import_user_as_person:
        | {
            Args: { _employee_number: string; _user_id: string }
            Returns: string
          }
        | {
            Args: {
              _employee_number: string
              _organization_id?: string
              _user_id: string
            }
            Returns: string
          }
      longtransactionsenabled: { Args: never; Returns: boolean }
      match_organization_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
          similarity: number
        }[]
      }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      refresh_cost_analysis_view: { Args: never; Returns: undefined }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
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
      iot_device_status: "active" | "inactive" | "error"
      iot_network_provider: "ttn" | "chirpstack" | "aws_iot_core"
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
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      iot_device_status: ["active", "inactive", "error"],
      iot_network_provider: ["ttn", "chirpstack", "aws_iot_core"],
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
