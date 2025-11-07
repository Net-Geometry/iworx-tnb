import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface PersonSkill {
  id: string;
  person_id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  certified: boolean;
  certification_date?: string;
  certification_expiry?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const usePersonSkills = (personId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: personSkills = [], isLoading } = useQuery({
    queryKey: ["person-skills", personId, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("person_skills")
        .select(`
          *,
          skills (*)
        `);

      if (personId) {
        query = query.eq("person_id", personId);
      }

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PersonSkill[];
    },
    enabled: !!personId && (!!currentOrganization || hasCrossProjectAccess),
  });

  const assignSkill = useMutation({
    mutationFn: async (skillData: Partial<PersonSkill>) => {
      const dataWithOrg = {
        ...skillData,
        organization_id: currentOrganization?.id,
      };
      
      const { data, error } = await supabase
        .from("person_skills")
        .insert([dataWithOrg as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-skills"] });
      toast({
        title: "Skill Assigned",
        description: "The skill has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign skill.",
      });
    },
  });

  const updatePersonSkill = useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<PersonSkill> & { id: string }) => {
      const { data, error } = await supabase
        .from("person_skills")
        .update(skillData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-skills"] });
      toast({
        title: "Skill Updated",
        description: "The skill has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update skill.",
      });
    },
  });

  const removeSkill = useMutation({
    mutationFn: async (personSkillId: string) => {
      const { error } = await supabase
        .from("person_skills")
        .delete()
        .eq("id", personSkillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-skills"] });
      toast({
        title: "Skill Removed",
        description: "The skill has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove skill.",
      });
    },
  });

  return {
    personSkills,
    isLoading,
    assignSkill,
    updatePersonSkill,
    removeSkill,
  };
};