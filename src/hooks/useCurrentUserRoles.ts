import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserRole {
  role_id: string;
  role_name: string;
  role_display_name: string;
  permissions: Record<string, any>;
}

/**
 * Hook to fetch the current authenticated user's roles
 */
export const useCurrentUserRoles = () => {
  const { user } = useAuth();

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ["current-user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role_id, roles!inner(id, name, display_name, permissions)")
        .eq("user_id", user.id);

      if (error) throw error;

      return (data || []).map((ur) => {
        const role = ur.roles as any;
        return {
          role_id: ur.role_id,
          role_name: role?.name || "",
          role_display_name: role?.display_name || "",
          permissions: role?.permissions || {},
        };
      }) as UserRole[];
    },
    enabled: !!user?.id,
  });

  // Get primary role (first role, or you can implement priority logic)
  const primaryRole = roles.length > 0 ? roles[0] : null;

  return {
    roles,
    primaryRole,
    isLoading,
    error,
  };
};
