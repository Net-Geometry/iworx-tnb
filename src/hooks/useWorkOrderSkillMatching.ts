import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Work Order Skill Requirement Interface
 * Tracks skill requirements for specific work orders
 */
export interface WorkOrderSkillRequirement {
  id: string;
  work_order_id: string;
  skill_id: string;
  proficiency_level_required: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  is_fulfilled: boolean;
  assigned_person_id?: string;
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
 * Recommended Technician Interface
 * Contains match information for skill-based assignment
 */
export interface RecommendedTechnician {
  person_id: string;
  person_name: string;
  match_percentage: number;
  matched_skills: any[];
  missing_skills: any[];
  total_experience_years: number;
}

/**
 * Hook to manage work order skill requirements and technician recommendations
 * @param workOrderId - The work order ID
 */
export const useWorkOrderSkillMatching = (workOrderId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  // Fetch skill requirements for work order
  const { data: workOrderSkills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["work-order-skill-requirements", workOrderId, currentOrganization?.id],
    queryFn: async () => {
      if (!workOrderId) return [];

      let query = supabase
        .from("work_order_skill_requirements")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch skill details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (req) => {
          const { data: skillData } = await supabase
            .from("skills")
            .select("skill_name, skill_code, category")
            .eq("id", req.skill_id)
            .single();
          
          return {
            ...req,
            skills: skillData || { skill_name: 'Unknown', skill_code: '', category: '' }
          };
        })
      );
      
      return enrichedData as WorkOrderSkillRequirement[];
    },
    enabled: !!workOrderId && (!!currentOrganization || hasCrossProjectAccess),
  });

  // Get recommended technicians using the database function
  const { data: recommendedTechnicians = [], isLoading: techniciansLoading } = useQuery({
    queryKey: ["recommended-technicians", workOrderId, currentOrganization?.id],
    queryFn: async () => {
      if (!workOrderId || !currentOrganization?.id) return [];

      const { data, error } = await supabase.rpc('get_recommended_technicians', {
        _work_order_id: workOrderId,
        _organization_id: currentOrganization.id,
      });

      if (error) throw error;
      return (data || []) as RecommendedTechnician[];
    },
    enabled: !!workOrderId && !!currentOrganization?.id,
  });

  // Add skill requirement to work order
  const addSkillRequirement = useMutation({
    mutationFn: async (skillData: Omit<WorkOrderSkillRequirement, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      const dataWithOrg = {
        ...skillData,
        organization_id: currentOrganization?.id,
      };

      const { data, error } = await supabase
        .from("work_order_skill_requirements")
        .insert([dataWithOrg])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order-skill-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-technicians"] });
      toast({
        title: "Skill Requirement Added",
        description: "The skill requirement has been added to the work order.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add skill requirement.",
      });
    },
  });

  // Update skill requirement
  const updateSkillRequirement = useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<WorkOrderSkillRequirement> & { id: string }) => {
      const { data, error } = await supabase
        .from("work_order_skill_requirements")
        .update(skillData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order-skill-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-technicians"] });
      toast({
        title: "Skill Requirement Updated",
        description: "The skill requirement has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update skill requirement.",
      });
    },
  });

  // Delete skill requirement
  const deleteSkillRequirement = useMutation({
    mutationFn: async (skillRequirementId: string) => {
      const { error } = await supabase
        .from("work_order_skill_requirements")
        .delete()
        .eq("id", skillRequirementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order-skill-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-technicians"] });
      toast({
        title: "Skill Requirement Deleted",
        description: "The skill requirement has been removed from the work order.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete skill requirement.",
      });
    },
  });

  // Bulk add skill requirements from asset
  const addSkillsFromAsset = useMutation({
    mutationFn: async (assetId: string) => {
      // Fetch asset skill requirements
      const { data: assetSkills, error: fetchError } = await supabase
        .from("asset_skill_requirements")
        .select("*")
        .eq("asset_id", assetId);

      if (fetchError) throw fetchError;
      if (!assetSkills || assetSkills.length === 0) {
        throw new Error("No skill requirements found for this asset");
      }

      // Transform and insert work order skill requirements
      const workOrderSkills = assetSkills.map(skill => ({
        work_order_id: workOrderId!,
        skill_id: skill.skill_id,
        proficiency_level_required: skill.proficiency_level_required,
        is_fulfilled: false,
        organization_id: currentOrganization?.id,
      }));

      const { data, error } = await supabase
        .from("work_order_skill_requirements")
        .insert(workOrderSkills)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order-skill-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-technicians"] });
      toast({
        title: "Skills Added",
        description: "Asset skill requirements have been added to the work order.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add skills from asset.",
      });
    },
  });

  return {
    workOrderSkills,
    recommendedTechnicians,
    isLoading: skillsLoading || techniciansLoading,
    addSkillRequirement,
    updateSkillRequirement,
    deleteSkillRequirement,
    addSkillsFromAsset,
  };
};