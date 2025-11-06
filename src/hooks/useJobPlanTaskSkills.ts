import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Job Plan Task Skill Interface
 * Defines skills required for specific job plan tasks
 * 
 * Note: This table is in the workorder_service schema and not directly
 * accessible via the public schema. We query it through views.
 */
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
  // Joined fields
  skills?: {
    skill_name: string;
    skill_code: string;
    category: string;
  };
}

/**
 * Hook to manage skill requirements for job plan tasks
 * @param jobPlanTaskId - The job plan task ID to fetch skill requirements for
 * 
 * NOTE: This feature is currently disabled as job_plan_task_skills table
 * is in a microservice schema. Enable this once the API endpoint is available.
 */
export const useJobPlanTaskSkills = (jobPlanTaskId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  // Fetch skill requirements - currently disabled
  const { data: taskSkills = [], isLoading } = useQuery({
    queryKey: ["job-plan-task-skills", jobPlanTaskId, currentOrganization?.id],
    queryFn: async () => {
      // TODO: Implement API call to work-order-service for task skills
      // For now, return empty array as this table is in microservice schema
      console.warn('Job plan task skills feature not yet implemented in work-order-service API');
      return [];
    },
    enabled: false, // Disabled until API endpoint is available
  });

  // Add skill to job plan task - currently disabled
  const addTaskSkill = useMutation({
    mutationFn: async (skillData: Omit<JobPlanTaskSkill, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      // TODO: Implement API call to work-order-service
      throw new Error('Job plan task skills feature not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plan-task-skills"] });
      toast({
        title: "Task Skill Added",
        description: "The skill has been added to the task successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add task skill.",
      });
    },
  });

  // Update task skill - currently disabled
  const updateTaskSkill = useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<JobPlanTaskSkill> & { id: string }) => {
      // TODO: Implement API call to work-order-service
      throw new Error('Job plan task skills feature not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plan-task-skills"] });
      toast({
        title: "Task Skill Updated",
        description: "The task skill has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update task skill.",
      });
    },
  });

  // Delete task skill - currently disabled
  const deleteTaskSkill = useMutation({
    mutationFn: async (taskSkillId: string) => {
      // TODO: Implement API call to work-order-service
      throw new Error('Job plan task skills feature not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-plan-task-skills"] });
      toast({
        title: "Task Skill Deleted",
        description: "The skill has been removed from the task successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete task skill.",
      });
    },
  });

  return {
    taskSkills,
    isLoading,
    addTaskSkill,
    updateTaskSkill,
    deleteTaskSkill,
  };
};
