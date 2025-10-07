import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inventoryApi } from "@/services/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  reorder_point: number;
  unit_of_measure: string;
}

export const useInventoryLowStock = (limit: number = 10) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-low-stock", currentOrganization?.id, limit],
    queryFn: async (): Promise<LowStockItem[]> => {
      // Try microservice first
      try {
        const response = await inventoryApi.getLowStockItems(limit);
        return response;
      } catch (apiError) {
        console.warn("Microservice call failed, falling back to direct query:", apiError);
        
        // Fallback to direct Supabase query
        let query = supabase
          .from("inventory_items")
          .select("id, name, category, current_stock, reorder_point, unit_of_measure")
          .eq("is_active", true);

        if (!hasCrossProjectAccess && currentOrganization?.id) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data, error: queryError } = await query;

        if (queryError) throw queryError;

        // Filter for low stock items (current_stock <= reorder_point) and sort
        const lowStockItems = (data || [])
          .filter(item => (item.current_stock || 0) <= (item.reorder_point || 0))
          .sort((a, b) => (a.current_stock || 0) - (b.current_stock || 0))
          .slice(0, limit);

        return lowStockItems;
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};
