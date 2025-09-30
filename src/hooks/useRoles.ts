import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export const useRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Role[];
    },
  });

  const createRole = useMutation({
    mutationFn: async (roleData: Partial<Role>) => {
      const { data, error } = await supabase
        .from("roles")
        .insert([roleData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Role Created",
        description: "The role has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create role.",
      });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      const { data, error } = await supabase
        .from("roles")
        .update(roleData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Role Updated",
        description: "The role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update role.",
      });
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete role.",
      });
    },
  });

  return {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
  };
};
