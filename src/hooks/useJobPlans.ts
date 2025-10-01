import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type JobPlan = Database["public"]["Tables"]["job_plans"]["Row"];
type JobPlanInsert = Database["public"]["Tables"]["job_plans"]["Insert"];
type JobPlanUpdate = Database["public"]["Tables"]["job_plans"]["Update"];

type JobPlanTask = Database["public"]["Tables"]["job_plan_tasks"]["Row"];
type JobPlanPart = Database["public"]["Tables"]["job_plan_parts"]["Row"];
type JobPlanTool = Database["public"]["Tables"]["job_plan_tools"]["Row"];
type JobPlanDocument = Database["public"]["Tables"]["job_plan_documents"]["Row"];

export interface JobPlanWithDetails {
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
  tasks?: JobPlanTask[];
  parts?: JobPlanPart[];
  tools?: JobPlanTool[];
  documents?: JobPlanDocument[];
}

export interface CreateJobPlanData extends Omit<JobPlanInsert, 'id' | 'created_at' | 'updated_at' | 'organization_id'> {
  tasks?: Omit<JobPlanTask, 'id' | 'job_plan_id' | 'created_at' | 'updated_at' | 'organization_id'>[];
  parts?: Omit<JobPlanPart, 'id' | 'job_plan_id' | 'created_at' | 'updated_at' | 'organization_id'>[];
  tools?: Omit<JobPlanTool, 'id' | 'job_plan_id' | 'created_at' | 'updated_at' | 'organization_id'>[];
  documents?: Omit<JobPlanDocument, 'id' | 'job_plan_id' | 'created_at' | 'updated_at' | 'organization_id'>[];
}

export const useJobPlans = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["job-plans", currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("job_plans")
        .select(`
          *,
          tasks:job_plan_tasks(*),
          parts:job_plan_parts(*),
          tools:job_plan_tools(*),
          documents:job_plan_documents(*)
        `);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobPlanWithDetails[];
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};

export const useJobPlan = (id: string) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["job-plans", id, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("job_plans")
        .select(`
          *,
          tasks:job_plan_tasks(*),
          parts:job_plan_parts(*),
          tools:job_plan_tools(*),
          documents:job_plan_documents(*)
        `)
        .eq("id", id);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data as JobPlanWithDetails;
    },
    enabled: !!id && (!!currentOrganization || hasCrossProjectAccess),
  });
};

export const useCreateJobPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (jobPlanData: CreateJobPlanData) => {
      const { tasks, parts, tools, documents, ...planData } = jobPlanData;

      // Create the job plan first with organization_id
      const { data: jobPlan, error: planError } = await supabase
        .from("job_plans")
        .insert({
          ...planData,
          organization_id: currentOrganization?.id,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create related records if they exist (organization_id inherited via RLS)
      if (tasks && tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from("job_plan_tasks")
          .insert(tasks.map(task => ({ 
            ...task, 
            job_plan_id: jobPlan.id,
            organization_id: currentOrganization?.id,
          })));
        if (tasksError) throw tasksError;
      }

      if (parts && parts.length > 0) {
        const { error: partsError } = await supabase
          .from("job_plan_parts")
          .insert(parts.map(part => ({ 
            ...part, 
            job_plan_id: jobPlan.id,
            organization_id: currentOrganization?.id,
          })));
        if (partsError) throw partsError;
      }

      if (tools && tools.length > 0) {
        const { error: toolsError } = await supabase
          .from("job_plan_tools")
          .insert(tools.map(tool => ({ 
            ...tool, 
            job_plan_id: jobPlan.id,
            organization_id: currentOrganization?.id,
          })));
        if (toolsError) throw toolsError;
      }

      if (documents && documents.length > 0) {
        const { error: documentsError } = await supabase
          .from("job_plan_documents")
          .insert(documents.map(doc => ({ 
            ...doc, 
            job_plan_id: jobPlan.id,
            organization_id: currentOrganization?.id,
          })));
        if (documentsError) throw documentsError;
      }

      return jobPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
      toast({
        title: "Success",
        description: "Job plan created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job plan",
        variant: "destructive",
      });
      console.error("Error creating job plan:", error);
    },
  });
};

export const useUpdateJobPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: JobPlanUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("job_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
      toast({
        title: "Success",
        description: "Job plan updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job plan",
        variant: "destructive",
      });
      console.error("Error updating job plan:", error);
    },
  });
};

export const useDeleteJobPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plans"] });
      toast({
        title: "Success",
        description: "Job plan deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete job plan",
        variant: "destructive",
      });
      console.error("Error deleting job plan:", error);
    },
  });
};

export const useJobPlanStats = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["job-plan-stats", currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("job_plans")
        .select("status, job_type, usage_count");

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = data.length;
      const active = data.filter(plan => plan.status === 'active').length;
      const draft = data.filter(plan => plan.status === 'draft').length;
      const underReview = data.filter(plan => plan.status === 'under_review').length;
      const mostUsed = Math.max(...data.map(plan => plan.usage_count || 0));

      return {
        total,
        active,
        draft,
        underReview,
        mostUsed,
        byType: {
          preventive: data.filter(plan => plan.job_type === 'preventive').length,
          corrective: data.filter(plan => plan.job_type === 'corrective').length,
          predictive: data.filter(plan => plan.job_type === 'predictive').length,
          emergency: data.filter(plan => plan.job_type === 'emergency').length,
          shutdown: data.filter(plan => plan.job_type === 'shutdown').length,
        }
      };
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};