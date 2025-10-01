import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Team } from "./useTeams";

export interface TeamWithMembers extends Team {
  team_members: Array<{
    id: string;
    person_id: string;
    role_in_team: 'leader' | 'member' | 'supervisor';
    assigned_date: string;
    is_active: boolean;
    people: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      employee_number: string;
      phone: string | null;
    } | null;
  }>;
}

export const useTeam = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      
      // Fetch team members separately (cross-schema relationship)
      const { data: membersData } = await supabase
        .from("team_members")
        .select("id, person_id, role_in_team, assigned_date, is_active")
        .eq("team_id", teamId)
        .eq("is_active", true);
      
      // Fetch people details for each member
      const membersWithPeople = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: personData } = await supabase
            .from("people")
            .select("id, first_name, last_name, email, employee_number, phone")
            .eq("id", member.person_id)
            .single();
          
          return {
            ...member,
            people: personData || {
              id: member.person_id,
              first_name: 'Unknown',
              last_name: '',
              email: '',
              employee_number: '',
              phone: ''
            }
          };
        })
      );
      
      return {
        ...data,
        team_members: membersWithPeople
      } as TeamWithMembers;
    },
    enabled: !!teamId,
  });

  const updateTeamMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'leader' | 'member' | 'supervisor' }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update({ role_in_team: role })
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update member role.",
      });
    },
  });

  return {
    team,
    isLoading,
    updateTeamMemberRole,
  };
};
