/**
 * Location Tracking Hooks
 * 
 * Provides hooks for GPS tracking, proximity search, and geofencing
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface PersonLocationHistory {
  id: string;
  person_id: string;
  organization_id: string;
  location: LocationPoint;
  altitude_meters?: number;
  accuracy_meters?: number;
  speed_kmh?: number;
  bearing_degrees?: number;
  tracked_at: string;
  tracking_source?: string;
  device_id?: string;
  battery_level?: number;
  work_order_id?: string;
  on_duty: boolean;
  activity_type?: string;
  created_at: string;
}

export interface NearbyPerson {
  person_id: string;
  person_name: string;
  distance_km: number;
  last_update: string;
  current_lat: number;
  current_lng: number;
}

export interface GeofenceStatus {
  zone_id: string;
  zone_name: string;
  zone_type: string;
  is_inside: boolean;
  distance_to_center_meters: number;
}

/**
 * Hook to find people nearby a specific location
 */
export const useNearbyPeople = (
  targetLat?: number,
  targetLng?: number,
  radiusKm: number = 5
) => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["nearby-people", targetLat, targetLng, radiusKm, currentOrganization?.id],
    queryFn: async () => {
      if (!targetLat || !targetLng) return [];

      const { data, error } = await supabase.rpc("find_nearby_people", {
        target_lat: targetLat,
        target_lng: targetLng,
        radius_km: radiusKm,
        _organization_id: currentOrganization?.id,
      });

      if (error) throw error;
      return data as NearbyPerson[];
    },
    enabled: !!targetLat && !!targetLng && !!currentOrganization,
  });
};

/**
 * Hook to check geofence status for a person
 */
export const useGeofenceStatus = (personId?: string) => {
  return useQuery({
    queryKey: ["geofence-status", personId],
    queryFn: async () => {
      if (!personId) return [];

      const { data, error } = await supabase.rpc("check_geofence_status", {
        _person_id: personId,
      });

      if (error) throw error;
      return data as GeofenceStatus[];
    },
    enabled: !!personId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

/**
 * Hook to calculate travel distance for a person
 */
export const useTravelDistance = (
  personId?: string,
  startTime?: string,
  endTime?: string
) => {
  return useQuery({
    queryKey: ["travel-distance", personId, startTime, endTime],
    queryFn: async () => {
      if (!personId || !startTime || !endTime) return 0;

      const { data, error } = await supabase.rpc("calculate_travel_distance", {
        _person_id: personId,
        _start_time: startTime,
        _end_time: endTime,
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!personId && !!startTime && !!endTime,
  });
};

/**
 * Hook to update a person's current location
 */
export const useUpdatePersonLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async ({
      personId,
      location,
      altitude,
      accuracy,
      speed,
      bearing,
      trackingSource = "manual",
      workOrderId,
      onDuty = true,
      activityType,
    }: {
      personId: string;
      location: LocationPoint;
      altitude?: number;
      accuracy?: number;
      speed?: number;
      bearing?: number;
      trackingSource?: string;
      workOrderId?: string;
      onDuty?: boolean;
      activityType?: string;
    }) => {
      // Insert into location history
      const { error: historyError } = await supabase
        .from("person_location_history")
        .insert({
          person_id: personId,
          organization_id: currentOrganization?.id,
          location: `POINT(${location.lng} ${location.lat})`,
          altitude_meters: altitude,
          accuracy_meters: accuracy,
          speed_kmh: speed,
          bearing_degrees: bearing,
          tracking_source: trackingSource,
          work_order_id: workOrderId,
          on_duty: onDuty,
          activity_type: activityType,
        });

      if (historyError) throw historyError;

      // Update current location in people_service schema via RPC or direct update
      // Note: Since people is in people_service schema, we'll use an edge function for updates
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nearby-people"] });
      queryClient.invalidateQueries({ queryKey: ["geofence-status"] });
      toast({
        title: "Location Updated",
        description: "GPS location has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Location Update Failed",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to get person location history
 */
export const usePersonLocationHistory = (
  personId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ["person-location-history", personId, startDate, endDate, currentOrganization?.id],
    queryFn: async () => {
      if (!personId) return [];

      let query = supabase
        .from("person_location_history")
        .select("*")
        .eq("person_id", personId)
        .order("tracked_at", { ascending: false });

      if (startDate) {
        query = query.gte("tracked_at", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("tracked_at", endDate.toISOString());
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      // Transform PostGIS POINT to {lat, lng} format
      return (data || []).map((record: any) => ({
        ...record,
        location: {
          lat: record.location?.coordinates?.[1] || 0,
          lng: record.location?.coordinates?.[0] || 0,
        },
      })) as PersonLocationHistory[];
    },
    enabled: !!personId && !!currentOrganization,
  });
};
