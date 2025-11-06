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

// Job Plan Task Skills Types (in workorder_service schema)
export interface JobPlanTaskSkill {
  id: string;
  job_plan_task_id: string;
  skill_id: string;
  proficiency_level_required: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time_minutes?: number;
  is_critical: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export type JobPlanTaskSkillInsert = Omit<JobPlanTaskSkill, 'id' | 'created_at' | 'updated_at'>;
export type JobPlanTaskSkillUpdate = Partial<JobPlanTaskSkillInsert>;

// PM Schedule Types (in workorder_service schema)
export interface PMSchedule {
  id: string;
  schedule_number: string;
  title: string;
  description?: string;
  asset_id?: string;
  job_plan_id?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  start_date: string;
  next_due_date?: string;
  last_completed_date?: string;
  is_active: boolean;
  priority?: string;
  estimated_duration_hours?: number;
  assigned_to?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export type PMScheduleInsert = Omit<PMSchedule, 'id' | 'created_at' | 'updated_at' | 'organization_id'>;
export type PMScheduleUpdate = Partial<PMScheduleInsert>;

// PM Schedule Assignments Types
export interface PMScheduleAssignment {
  id: string;
  pm_schedule_id: string;
  assigned_person_id: string;
  assignment_role: 'primary' | 'assigned';
  assigned_by?: string;
  assigned_at: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export type PMScheduleAssignmentInsert = Omit<PMScheduleAssignment, 'id' | 'created_at' | 'updated_at' | 'organization_id'>;
export type PMScheduleAssignmentUpdate = Partial<PMScheduleAssignmentInsert>;
