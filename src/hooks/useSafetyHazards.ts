import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Hook to fetch all safety hazards with optional filters
 */
export function useHazards(filters?: {
  search?: string;
  category?: string;
  risk_level?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['safety-hazards', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.risk_level) params.append('risk_level', filters.risk_level);
      if (filters?.status) params.append('status', filters.status);

      const { data, error } = await supabase.functions.invoke('safety-service', {
        body: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;
      
      // Make direct call to edge function with query params
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/safety-service/hazards?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch hazards');
      }

      return response.json();
    },
  });
}

/**
 * Hook to fetch a single hazard by ID
 */
export function useHazard(id: string | undefined) {
  return useQuery({
    queryKey: ['safety-hazard', id],
    queryFn: async () => {
      if (!id) throw new Error('Hazard ID is required');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/safety-service/hazards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch hazard');
      }

      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new hazard
 */
export function useCreateHazard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hazardData: any) => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/safety-service/hazards`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hazardData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create hazard');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-hazards'] });
      toast.success('Hazard created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create hazard:', error);
      toast.error(error.message || 'Failed to create hazard');
    },
  });
}

/**
 * Hook to update an existing hazard
 */
export function useUpdateHazard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/safety-service/hazards/${id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update hazard');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['safety-hazards'] });
      queryClient.invalidateQueries({ queryKey: ['safety-hazard', variables.id] });
      toast.success('Hazard updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update hazard:', error);
      toast.error(error.message || 'Failed to update hazard');
    },
  });
}

/**
 * Hook to delete a hazard
 */
export function useDeleteHazard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/safety-service/hazards/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete hazard');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-hazards'] });
      toast.success('Hazard deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete hazard:', error);
      toast.error(error.message || 'Failed to delete hazard');
    },
  });
}
