import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  created_at: string;
  updated_at: string;
}

export const useInventoryLocations = () => {
  return useQuery({
    queryKey: ["inventory-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_locations")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching inventory locations:", error);
        throw error;
      }

      return data as InventoryLocation[];
    },
  });
};

export const useInventoryLocationWithItems = () => {
  return useQuery({
    queryKey: ["inventory-locations-with-items"],
    queryFn: async () => {
      // Get locations with item count
      const { data: locationsData, error: locationsError } = await supabase
        .from("inventory_locations")
        .select(`
          *,
          inventory_item_locations(
            id,
            quantity,
            inventory_items(name)
          )
        `)
        .order("name");

      if (locationsError) {
        console.error("Error fetching locations with items:", locationsError);
        throw locationsError;
      }

      // Calculate item counts and utilization for each location
      const locationsWithStats = locationsData?.map(location => {
        const itemLocations = location.inventory_item_locations || [];
        const itemCount = itemLocations.length;
        const totalQuantity = itemLocations.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        
        return {
          ...location,
          itemCount,
          totalQuantity,
          utilizationPercentage: location.capacity_limit 
            ? Math.round((location.current_utilization || 0) / location.capacity_limit * 100)
            : 0
        };
      }) || [];

      return locationsWithStats;
    },
  });
};