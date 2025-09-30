import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: permissions = {}, isLoading } = useQuery({
    queryKey: ["permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const { data, error } = await supabase.rpc("get_user_permissions", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error fetching permissions:", error);
        return {};
      }

      // Merge all permission objects from the array
      if (Array.isArray(data) && data.length > 0) {
        return data.reduce((acc: any, permObj: any) => {
          if (permObj && typeof permObj === 'object') {
            return { ...acc, ...permObj };
          }
          return acc;
        }, {} as Record<string, any>);
      }

      return {} as Record<string, any>;
    },
    enabled: !!user?.id,
  });

  const hasPermission = (module: string, action: string): boolean => {
    if (!permissions || typeof permissions !== "object") return false;
    return permissions[module]?.[action] === true;
  };

  const canAccessModule = (module: string): boolean => {
    if (!permissions || typeof permissions !== "object") return false;
    const modulePerms = permissions[module];
    if (!modulePerms || typeof modulePerms !== "object") return false;
    return Object.values(modulePerms).some((perm) => perm === true);
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    canAccessModule,
  };
};
