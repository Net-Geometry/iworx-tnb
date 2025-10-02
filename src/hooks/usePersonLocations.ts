import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for managing person-location assignments
 * Handles queries and mutations for engineers assigned to specific locations
 */

// Get all locations assigned to a person
export const usePersonLocations = (personId?: string) => {
  return useQuery({
    queryKey: ['person-locations', personId],
    queryFn: async () => {
      if (!personId) return [];
      
      const { data, error } = await supabase
        .from('person_locations')
        .select(`
          *,
          hierarchy_nodes (
            id,
            name,
            path
          ),
          people (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('person_id', personId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!personId,
  });
};

// Get all engineers assigned to a specific location
export const useLocationEngineers = (locationNodeId?: string) => {
  return useQuery({
    queryKey: ['location-engineers', locationNodeId],
    queryFn: async () => {
      if (!locationNodeId) return [];
      
      const { data, error } = await supabase
        .from('person_locations')
        .select(`
          *,
          people!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            job_title,
            employment_status
          )
        `)
        .eq('hierarchy_node_id', locationNodeId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!locationNodeId,
  });
};

// Assign a person to a location
export const useAssignPersonLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      person_id: string;
      hierarchy_node_id: string;
      is_primary?: boolean;
      notes?: string;
    }) => {
      // If setting as primary, unset all other primary locations for this person
      if (params.is_primary) {
        await supabase
          .from('person_locations')
          .update({ is_primary: false })
          .eq('person_id', params.person_id);
      }

      const { data, error } = await supabase
        .from('person_locations')
        .insert({
          ...params,
          organization_id: currentOrganization!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['person-locations', variables.person_id] });
      queryClient.invalidateQueries({ queryKey: ['location-engineers', variables.hierarchy_node_id] });
      toast({
        title: "Success",
        description: "Location assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign location",
        variant: "destructive",
      });
    },
  });
};

// Remove a person from a location
export const useUnassignPersonLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id: string; person_id: string; hierarchy_node_id: string }) => {
      const { error } = await supabase
        .from('person_locations')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['person-locations', variables.person_id] });
      queryClient.invalidateQueries({ queryKey: ['location-engineers', variables.hierarchy_node_id] });
      toast({
        title: "Success",
        description: "Location assignment removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove location assignment",
        variant: "destructive",
      });
    },
  });
};

// Update a person-location assignment (e.g., set as primary, update notes)
export const useUpdatePersonLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      person_id: string;
      hierarchy_node_id: string;
      is_primary?: boolean;
      notes?: string;
    }) => {
      // If setting as primary, unset all other primary locations for this person
      if (params.is_primary) {
        await supabase
          .from('person_locations')
          .update({ is_primary: false })
          .eq('person_id', params.person_id);
      }

      const { data, error } = await supabase
        .from('person_locations')
        .update({
          is_primary: params.is_primary,
          notes: params.notes,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['person-locations', variables.person_id] });
      queryClient.invalidateQueries({ queryKey: ['location-engineers', variables.hierarchy_node_id] });
      toast({
        title: "Success",
        description: "Location assignment updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location assignment",
        variant: "destructive",
      });
    },
  });
};
