import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Team {
  id: string;
  team_name: string;
  team_code: string;
  description?: string;
  team_leader_id?: string;
  department?: string;
  shift?: 'day' | 'night' | 'swing' | 'rotating';
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  leader_name?: string;
  member_names?: string[];
  role_distribution?: {
    leaders: number;
    supervisors: number;
    members: number;
  };
}

export interface TeamMember {
  id: string;
  team_id: string;
  person_id: string;
  role_in_team: 'leader' | 'member' | 'supervisor';
  assigned_date: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
}

export const useTeams = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams", currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("teams")
        .select(`
          *,
          team_members!inner(
            id,
            role_in_team,
            people!inner(
              id,
              first_name,
              last_name
            )
          )
        `)
        .order("team_name");

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to include member statistics
      const teamsWithStats = (data || []).map((team: any) => {
        const members = team.team_members || [];
        const memberCount = members.length;
        
        const roleDistribution = {
          leaders: members.filter((m: any) => m.role_in_team === 'leader').length,
          supervisors: members.filter((m: any) => m.role_in_team === 'supervisor').length,
          members: members.filter((m: any) => m.role_in_team === 'member').length,
        };
        
        const leader = members.find((m: any) => m.role_in_team === 'leader');
        const leaderName = leader?.people 
          ? `${leader.people.first_name} ${leader.people.last_name}`.trim()
          : undefined;
        
        const memberNames = members
          .slice(0, 3)
          .map((m: any) => `${m.people.first_name} ${m.people.last_name}`.trim());
        
        const { team_members, ...teamData } = team;
        
        return {
          ...teamData,
          member_count: memberCount,
          leader_name: leaderName,
          member_names: memberNames,
          role_distribution: roleDistribution,
        } as Team;
      });
      
      return teamsWithStats;
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });

  const createTeam = useMutation({
    mutationFn: async (teamData: Partial<Team>) => {
      const dataWithOrg = {
        ...teamData,
        organization_id: currentOrganization?.id,
      };
      
      const { data, error } = await supabase
        .from("teams")
        .insert([dataWithOrg as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Team Created",
        description: "The team has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team.",
      });
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...teamData }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from("teams")
        .update(teamData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Team Updated",
        description: "The team has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update team.",
      });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Team Deleted",
        description: "The team has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete team.",
      });
    },
  });

  // Team members management
  const addTeamMember = useMutation({
    mutationFn: async (memberData: Partial<TeamMember>) => {
      const dataWithOrg = {
        ...memberData,
        organization_id: currentOrganization?.id,
      };
      
      const { data, error } = await supabase
        .from("team_members")
        .insert([dataWithOrg as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast({
        title: "Member Added",
        description: "Team member has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add team member.",
      });
    },
  });

  const removeTeamMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove team member.",
      });
    },
  });

  return {
    teams,
    isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
  };
};