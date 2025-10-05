import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { routesApi } from "@/services/api-client";
import { useState } from "react";

/**
 * Hook for managing maintenance routes
 * Handles CRUD operations for routes with asset assignments
 */

export interface MaintenanceRoute {
  id: string;
  organization_id: string;
  route_number: string;
  name: string;
  description?: string;
  route_type?: string;
  status?: string;
  is_optimized?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  asset_count?: number;
}

export const useMaintenanceRoutes = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const queryClient = useQueryClient();
  const [useMicroservice, setUseMicroservice] = useState(true);

  // Fetch all routes
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["maintenance-routes", currentOrganization?.id],
    queryFn: async () => {
      if (useMicroservice) {
        try {
          return await routesApi.getAll();
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      let query = supabase
        .from("maintenance_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!hasCrossProjectAccess && currentOrganization?.id) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data: routesData, error } = await query;

      if (error) throw error;

      // Fetch asset counts for each route
      const routesWithCounts = await Promise.all(
        (routesData || []).map(async (route) => {
          const { count } = await supabase
            .from("route_assets")
            .select("*", { count: "exact", head: true })
            .eq("route_id", route.id);

          return { ...route, asset_count: count || 0 } as MaintenanceRoute;
        })
      );

      return routesWithCounts;
    },
    enabled: !!currentOrganization,
  });

  // Create route
  const createRoute = useMutation({
    mutationFn: async (routeData: Partial<MaintenanceRoute> & { name: string; route_number: string }) => {
      if (useMicroservice) {
        try {
          return await routesApi.create({
            ...routeData,
            organization_id: currentOrganization?.id!,
          });
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("maintenance_routes")
        .insert([
          {
            name: routeData.name,
            route_number: routeData.route_number,
            description: routeData.description,
            route_type: routeData.route_type,
            status: routeData.status,
            organization_id: currentOrganization?.id!,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-routes"] });
      toast.success("Route created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create route");
    },
  });

  // Update route
  const updateRoute = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MaintenanceRoute>;
    }) => {
      if (useMicroservice) {
        try {
          return await routesApi.update(id, updates);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("maintenance_routes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-routes"] });
      toast.success("Route updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update route");
    },
  });

  // Delete route
  const deleteRoute = useMutation({
    mutationFn: async (id: string) => {
      if (useMicroservice) {
        try {
          return await routesApi.delete(id);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { error } = await supabase
        .from("maintenance_routes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-routes"] });
      toast.success("Route deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete route");
    },
  });

  return {
    routes,
    isLoading,
    createRoute: createRoute.mutate,
    updateRoute: updateRoute.mutate,
    deleteRoute: deleteRoute.mutate,
  };
};

// Hook for fetching a single route with details
export const useMaintenanceRoute = (routeId: string | undefined) => {
  const { currentOrganization } = useAuth();
  const [useMicroservice, setUseMicroservice] = useState(true);

  return useQuery({
    queryKey: ["maintenance-route", routeId],
    queryFn: async () => {
      if (!routeId) return null;

      if (useMicroservice) {
        try {
          return await routesApi.getById(routeId);
        } catch (error) {
          console.warn('Routes microservice unavailable, falling back to direct query:', error);
          setUseMicroservice(false);
          // Fall through to direct Supabase query
        }
      }

      const { data, error } = await supabase
        .from("maintenance_routes")
        .select("*")
        .eq("id", routeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!routeId && !!currentOrganization,
  });
};
