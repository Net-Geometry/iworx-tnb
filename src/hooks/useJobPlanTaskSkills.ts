import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Job Plan Task Skill Interface
 * Defines skills required for specific job plan tasks
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
 */
export const useJobPlanTaskSkills = (jobPlanTaskId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  // Fetch skill requirements for a specific job plan task
  const { data: taskSkills = [], isLoading } = useQuery({
    queryKey: ["job-plan-task-skills", jobPlanTaskId, currentOrganization?.id],
    queryFn: async () => {
      if (!jobPlanTaskId) return [];

      let query = supabase
        .from("job_plan_task_skills")
        .select("*")
        .eq("job_plan_task_id", jobPlanTaskId);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch skill details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (taskSkill) => {
          const { data: skillData } = await supabase
            .from("skills")
            .select("skill_name, skill_code, category")
            .eq("id", taskSkill.skill_id)
            .single();
          
          return {
            ...taskSkill,
            skills: skillData || { skill_name: 'Unknown', skill_code: '', category: '' }
          };
        })
      );
      
      return enrichedData as JobPlanTaskSkill[];
    },
    enabled: !!jobPlanTaskId && (!!currentOrganization || hasCrossProjectAccess),
  });

  // Add skill to job plan task
  const addTaskSkill = useMutation({
    mutationFn: async (skillData: Omit<JobPlanTaskSkill, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      const dataWithOrg = {
        ...skillData,
        organization_id: currentOrganization?.id,
      };

      const { data, error } = await supabase
        .from("job_plan_task_skills")
        .insert([dataWithOrg])
        .select()
        .single();

      if (error) throw error;
      return data;
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

  // Update task skill
  const updateTaskSkill = useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<JobPlanTaskSkill> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_plan_task_skills")
        .update(skillData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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

  // Delete task skill
  const deleteTaskSkill = useMutation({
    mutationFn: async (taskSkillId: string) => {
      const { error } = await supabase
        .from("job_plan_task_skills")
        .delete()
        .eq("id", taskSkillId);

      if (error) throw error;
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