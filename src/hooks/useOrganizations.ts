import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types/organization";

export const useOrganizations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Organization[];
    },
  });

  const createOrganization = useMutation({
    mutationFn: async (orgData: Partial<Organization>) => {
      const { data, error } = await supabase
        .from("organizations")
        .insert([orgData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast({
        title: "Organization Created",
        description: "The organization has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create organization.",
      });
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async ({ id, ...orgData }: Partial<Organization> & { id: string }) => {
      const { data, error } = await supabase
        .from("organizations")
        .update(orgData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast({
        title: "Organization Updated",
        description: "The organization has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update organization.",
      });
    },
  });

  return {
    organizations,
    isLoading,
    createOrganization,
    updateOrganization,
  };
};

export const useUserOrganizations = (userId?: string) => {
  const { data: userOrganizations = [], isLoading } = useQuery({
    queryKey: ["user_organizations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_organizations")
        .select("*, organization:organizations(*)")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    userOrganizations,
    isLoading,
  };
};
