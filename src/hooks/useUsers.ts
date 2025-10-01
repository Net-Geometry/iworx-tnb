import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserWithRoles {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  roles: Array<{
    role_id: string;
    role_name: string;
    role_display_name: string;
  }>;
  organizations: Array<{
    organization_id: string;
    organization_name: string;
    organization_code: string;
  }>;
}

/**
 * Hook to fetch all users with their roles and organizations
 */
export const useUsers = () => {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, created_at");

      if (profilesError) throw profilesError;

      // Fetch auth users email
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      const authUsers = authData?.users || [];

      // Fetch user roles with explicit typing
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role_id, roles!inner(id, name, display_name)");

      if (rolesError) throw rolesError;

      // Fetch user organizations with explicit typing
      const { data: userOrgs, error: orgsError } = await supabase
        .from("user_organizations")
        .select("user_id, organization_id, organizations!inner(id, name, code)");

      if (orgsError) throw orgsError;

      // Combine data
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const authUser = authUsers.find((u) => u.id === profile.id);
        const roles = (userRoles || [])
          .filter((ur) => ur.user_id === profile.id)
          .map((ur) => {
            const role = ur.roles as any;
            return {
              role_id: ur.role_id,
              role_name: role?.name || "",
              role_display_name: role?.display_name || "",
            };
          });
        
        const organizations = (userOrgs || [])
          .filter((uo) => uo.user_id === profile.id)
          .map((uo) => {
            const org = uo.organizations as any;
            return {
              organization_id: uo.organization_id,
              organization_name: org?.name || "",
              organization_code: org?.code || "",
            };
          });

        return {
          id: profile.id,
          email: authUser?.email || "",
          display_name: profile.display_name || "",
          created_at: profile.created_at || "",
          roles,
          organizations,
        };
      });

      return usersWithRoles;
    },
  });

  return {
    users,
    isLoading,
    error,
  };
};
