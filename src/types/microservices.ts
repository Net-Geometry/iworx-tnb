/**
 * Microservices Type Definitions
 * 
 * This file contains local type definitions for tables that have been migrated
 * to separate microservice schemas. These types are needed because the Supabase
 * type generator doesn't properly handle cross-schema relationships.
 */

// Safety Service Types
export interface SafetyPrecaution {
  id: string;
  precaution_code: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  severity_level: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'under_review' | 'archived';
  required_actions?: string[];
  associated_hazards?: string[];
  regulatory_references?: string[];
  applicable_scenarios?: any;
  usage_count: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export type SafetyPrecautionInsert = Omit<SafetyPrecaution, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'usage_count'>;
export type SafetyPrecautionUpdate = Partial<SafetyPrecautionInsert>;

// Work Order Service Types  
export interface JobPlan {
  id: string;
  job_plan_number: string;
  title: string;
  description?: string;
  job_type: 'preventive' | 'corrective' | 'predictive' | 'emergency' | 'shutdown';
  category?: string;
  subcategory?: string;
  estimated_duration_hours?: number;
  skill_level_required?: 'basic' | 'intermediate' | 'advanced' | 'specialist';
  status: 'draft' | 'active' | 'inactive' | 'archived';
  version?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  applicable_asset_types?: string[];
  frequency_type?: 'time_based' | 'usage_based' | 'condition_based';
  frequency_interval?: number;
  priority?: string;
  cost_estimate?: number;
  usage_count?: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export type JobPlanInsert = Omit<JobPlan, 'id' | 'created_at' | 'updated_at'>;
export type JobPlanUpdate = Partial<JobPlanInsert>;
