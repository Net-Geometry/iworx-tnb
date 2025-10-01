import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi } from "@/services/api-client";

export interface InventoryLocation {
  id: string;
  name: string;
  code?: string;
  location_type: string;
  address?: string;
  parent_location_id?: string;
  is_active: boolean;
  capacity_limit?: number;
  current_utilization?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const useInventoryLocations = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-locations", currentOrganization?.id],
    queryFn: async () => {
      try {
        // Try microservice first
        const data = await inventoryApi.getLocations();
        return data as InventoryLocation[];
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        let query = supabase
          .from("inventory_locations")
          .select("*");

        if (!hasCrossProjectAccess && currentOrganization) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data, error } = await query.order("name");

        if (error) {
          console.error("Error fetching inventory locations:", error);
          throw error;
        }

        return data as InventoryLocation[];
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};

export const useInventoryLocationWithItems = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-locations-with-items", currentOrganization?.id],
    queryFn: async () => {
      try {
        // Try microservice first
        const data = await inventoryApi.getLocationsWithItems();
        return data;
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        let query = supabase
          .from("inventory_locations")
          .select(`
            *,
            inventory_item_locations(
              id,
              quantity,
              inventory_items(name)
            )
          `);

        if (!hasCrossProjectAccess && currentOrganization) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data: locationsData, error: locationsError } = await query.order("name");

        if (locationsError) {
          console.error("Error fetching locations with items:", locationsError);
          throw locationsError;
        }

        // Calculate item counts and utilization for each location
        const locationsWithStats = await Promise.all(
          (locationsData || []).map(async (location) => {
            // Fetch item locations separately (cross-schema relationship)
            const { data: itemLocations } = await supabase
              .from('inventory_item_locations')
              .select('quantity')
              .eq('location_id', location.id);
            
            const itemCount = itemLocations?.length || 0;
            const totalQuantity = (itemLocations || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          
            return {
              ...location,
              itemCount,
              totalQuantity,
              utilizationPercentage: location.capacity_limit 
                ? Math.round((location.current_utilization || 0) / location.capacity_limit * 100)
                : 0
            };
          })
        );

        return locationsWithStats;
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};