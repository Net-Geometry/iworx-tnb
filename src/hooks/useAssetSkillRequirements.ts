import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Asset Skill Requirement Interface
 * Defines the skills required to maintain a specific asset
 */
export interface AssetSkillRequirement {
  id: string;
  asset_id: string;
  skill_id: string;
  proficiency_level_required: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  is_mandatory: boolean;
  priority_order: number;
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
 * Hook to manage skill requirements for assets
 * @param assetId - The asset ID to fetch skill requirements for
 */
export const useAssetSkillRequirements = (assetId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  // Fetch skill requirements for a specific asset
  const { data: assetSkillRequirements = [], isLoading } = useQuery({
    queryKey: ["asset-skill-requirements", assetId, currentOrganization?.id],
    queryFn: async () => {
      if (!assetId) return [];

      let query = supabase
        .from("asset_skill_requirements")
        .select("*")
        .eq("asset_id", assetId)
        .order("priority_order", { ascending: true });

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
      
      return enrichedData as AssetSkillRequirement[];
    },
    enabled: !!assetId && (!!currentOrganization || hasCrossProjectAccess),
  });

  // Add skill requirement to asset
  const addSkillRequirement = useMutation({
    mutationFn: async (skillData: Omit<AssetSkillRequirement, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      const dataWithOrg = {
        ...skillData,
        organization_id: currentOrganization?.id,
      };

      const { data, error } = await supabase
        .from("asset_skill_requirements")
        .insert([dataWithOrg])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-skill-requirements"] });
      toast({
        title: "Skill Requirement Added",
        description: "The skill requirement has been added to the asset successfully.",
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
    mutationFn: async ({ id, ...skillData }: Partial<AssetSkillRequirement> & { id: string }) => {
      const { data, error } = await supabase
        .from("asset_skill_requirements")
        .update(skillData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-skill-requirements"] });
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
        .from("asset_skill_requirements")
        .delete()
        .eq("id", skillRequirementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-skill-requirements"] });
      toast({
        title: "Skill Requirement Deleted",
        description: "The skill requirement has been removed from the asset successfully.",
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

  return {
    assetSkillRequirements,
    isLoading,
    addSkillRequirement,
    updateSkillRequirement,
    deleteSkillRequirement,
  };
};