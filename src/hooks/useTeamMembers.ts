import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamMemberWithTeam {
  id: string;
  team_id: string;
  person_id: string;
  role_in_team: 'leader' | 'member' | 'supervisor';
  assigned_date: string | null;
  is_active: boolean | null;
  organization_id: string;
  created_at: string | null;
  teams: {
    id: string;
    team_name: string;
    description: string | null;
    is_active: boolean | null;
  } | null;
}

export const useTeamMembers = (personId?: string) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-members", personId, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("team_members")
        .select("*");

      if (personId) {
        query = query.eq("person_id", personId);
      }

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch team details separately (cross-schema relationship)
      const enrichedData = await Promise.all(
        (data || []).map(async (member) => {
          const { data: teamData } = await supabase
            .from("teams")
            .select("id, team_name, description, is_active")
            .eq("id", member.team_id)
            .single();
          
          return {
            ...member,
            teams: teamData || {
              id: member.team_id,
              team_name: 'Unknown Team',
              description: '',
              is_active: false
            }
          };
        })
      );
      
      return enrichedData as TeamMemberWithTeam[];
    },
    enabled: !!personId && (!!currentOrganization || hasCrossProjectAccess),
  });

  return {
    teamMembers,
    isLoading,
  };
};
