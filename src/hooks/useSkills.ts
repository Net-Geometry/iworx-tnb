import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Skill {
  id: string;
  skill_name: string;
  skill_code: string;
  category: 'mechanical' | 'electrical' | 'plumbing' | 'hvac' | 'instrumentation' | 'safety' | 'software' | 'other';
  description?: string;
  certification_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSkills = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("skill_name");

      if (error) throw error;
      return data as Skill[];
    },
  });

  const createSkill = useMutation({
    mutationFn: async (skillData: Partial<Skill>) => {
      const { data, error } = await supabase
        .from("skills")
        .insert([skillData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({
        title: "Skill Created",
        description: "The skill has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create skill.",
      });
    },
  });

  const updateSkill = useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<Skill> & { id: string }) => {
      const { data, error } = await supabase
        .from("skills")
        .update(skillData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
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

  const deleteSkill = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({
        title: "Skill Deleted",
        description: "The skill has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete skill.",
      });
    },
  });

  return {
    skills,
    isLoading,
    createSkill,
    updateSkill,
    deleteSkill,
  };
};