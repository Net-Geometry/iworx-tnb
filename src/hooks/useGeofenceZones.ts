/**
 * Geofence Zones Management Hooks
 * 
 * Provides CRUD operations for geofence zones
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface GeofenceZone {
  id: string;
  organization_id: string;
  name: string;
  zone_type?: string;
  description?: string;
  boundary: any; // PostGIS POLYGON
  center_point?: any; // PostGIS POINT
  radius_meters?: number;
  hierarchy_node_id?: string;
  entry_notification: boolean;
  exit_notification: boolean;
  restricted_access: boolean;
  allowed_person_ids?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGeofenceZones = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["geofence-zones", currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("geofence_zones")
        .select("*")
        .order("name");

      if (currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GeofenceZone[];
    },
    enabled: !!currentOrganization,
  });

  const createZone = useMutation({
    mutationFn: async (zoneData: Omit<GeofenceZone, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      const { data, error } = await supabase
        .from("geofence_zones")
        .insert([
          {
            ...zoneData,
            organization_id: currentOrganization?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      toast({
        title: "Geofence Zone Created",
        description: "The zone has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create geofence zone.",
      });
    },
  });

  const updateZone = useMutation({
    mutationFn: async ({ id, ...zoneData }: Partial<GeofenceZone> & { id: string }) => {
      const { data, error } = await supabase
        .from("geofence_zones")
        .update(zoneData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      toast({
        title: "Geofence Zone Updated",
        description: "The zone has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update geofence zone.",
      });
    },
  });

  const deleteZone = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase
        .from("geofence_zones")
        .delete()
        .eq("id", zoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      toast({
        title: "Geofence Zone Deleted",
        description: "The zone has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete geofence zone.",
      });
    },
  });

  return {
    zones,
    isLoading,
    createZone,
    updateZone,
    deleteZone,
  };
};
